import { readFileSync } from "fs";
import { join } from "node:path";
import { tmpdir } from "os";

import {
  Aws,
  CfnOutput,
  Duration,
  RemovalPolicy,
  SecretValue,
  Stack,
} from "aws-cdk-lib";
import { Construct } from "constructs";

import { UserPool } from "aws-cdk-lib/aws-cognito";
import {
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Architecture } from "aws-cdk-lib/aws-lambda";
import {
  Certificate,
  CertificateValidation,
  ICertificate,
} from "aws-cdk-lib/aws-certificatemanager";
import {
  ARecord,
  HostedZone,
  IHostedZone,
  RecordTarget,
} from "aws-cdk-lib/aws-route53";
import { ApiGatewayv2DomainProperties } from "aws-cdk-lib/aws-route53-targets";
import { RustFunction } from "cargo-lambda-cdk";
import path from "path";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import {
  CorsHttpMethod,
  DomainName,
  HttpApi,
  HttpMethod,
  HttpRoute,
  HttpRouteKey,
  IHttpApi,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpJwtAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import {
  CorsConifg,
  HtsgetConfig,
  HtsgetLambdaProps,
  JwtConfig,
} from "./config";
import { exec } from "cargo-lambda-cdk/lib/util";

/**
 * @ignore
 * Construct used to deploy htsget-lambda.
 */
export class HtsgetLambda extends Construct {
  constructor(scope: Construct, id: string, props: HtsgetLambdaProps) {
    super(scope, id);

    props.htsgetConfig ??= {
      locations: [],
    };

    let httpApi: IHttpApi;
    if (props.httpApi !== undefined) {
      httpApi = props.httpApi;
    } else {
      if (props.domain === undefined) {
        throw Error("domain must be defined if httpApi is not specified");
      }

      httpApi = this.createHttpApi(
        props.domain,
        props.jwt,
        props.cors,
        props.subDomain,
        props.hostedZone,
        props.certificateArn,
        props.noHostedZone,
      );
    }

    let lambdaRole: Role | undefined;
    if (props.role == undefined) {
      lambdaRole = this.createRole(id, props.roleName);
    }

    props.buildEnvironment ??= {};

    const htsgetLambda = new RustFunction(this, "Function", {
      gitRemote: "https://github.com/umccr/htsget-rs",
      gitForceClone: props.gitForceClone,
      gitReference: props.gitReference,
      functionName: props.functionName,
      binaryName: "htsget-lambda",
      bundling: {
        environment: {
          RUSTFLAGS: "-C target-cpu=neoverse-n1",
          CARGO_PROFILE_RELEASE_LTO: "true",
          CARGO_PROFILE_RELEASE_CODEGEN_UNITS: "1",
          AWS_LAMBDA_HTTP_IGNORE_STAGE_IN_PATH: "true",
          ...props.buildEnvironment,
        },
        cargoLambdaFlags: props.cargoLambdaFlags ?? [
          this.resolveFeatures(props.htsgetConfig, props.copyTestData ?? false),
        ],
      },
      memorySize: 128,
      timeout: Duration.seconds(28),
      architecture: Architecture.ARM_64,
      role: lambdaRole ?? props.role,
      vpc: props.vpc,
    });

    let bucket: Bucket | undefined = undefined;
    let privateKey: Secret | undefined = undefined;
    let publicKey: Secret | undefined = undefined;
    if (props.copyTestData) {
      [bucket, privateKey, publicKey] = this.setupTestData(
        props.gitReference,
        props.bucketName,
      );
    }

    if (lambdaRole !== undefined) {
      this.setPermissions(
        lambdaRole,
        props.htsgetConfig,
        bucket,
        privateKey,
        publicKey,
      );
    }

    const env = this.configToEnv(
      props.htsgetConfig,
      props.cors,
      bucket,
      privateKey,
      publicKey,
    );
    for (const key in env) {
      htsgetLambda.addEnvironment(key, env[key]);
    }
    htsgetLambda.addEnvironment("RUST_LOG", "trace");

    const httpIntegration = new HttpLambdaIntegration(
      "Integration",
      htsgetLambda,
    );

    [HttpMethod.GET, HttpMethod.POST].map((method) => {
      const path = "/{proxy+}";
      new HttpRoute(this, `${method}${path}`, {
        httpApi: httpApi,
        routeKey: HttpRouteKey.with(path, method),
        integration: httpIntegration,
      });
    });

    if (httpApi.defaultAuthorizer === undefined) {
      console.warn(
        "This will create an instance of htsget-rs that is public! Anyone will be able to query the server without authorization.",
      );
    }
  }

  /**
   * Determine the correct features based on the locations.
   */
  private resolveFeatures(config: HtsgetConfig, bucketSetup: boolean): string {
    const features = [];

    if (
      config.locations?.some((location) =>
        location.location.startsWith("s3://"),
      ) ||
      bucketSetup
    ) {
      features.push("aws");
    }
    if (
      config.locations?.some(
        (location) =>
          location.location.startsWith("http://") ||
          location.location.startsWith("https://"),
      )
    ) {
      features.push("url");
    }
    if (
      config.locations?.some(
        (location) =>
          location.private_key !== undefined ||
          location.public_key !== undefined,
      ) ||
      bucketSetup
    ) {
      features.push("experimental");
    }

    return features.length === 0
      ? "--all-features"
      : `--features ${features.join(",")}`;
  }

  /**
   * Create a bucket and copy test data if configured.
   */
  private setupTestData(
    gitReference?: string,
    bucketName?: string,
  ): [Bucket, Secret, Secret] {
    const gitRemote = "https://github.com/umccr/htsget-rs";
    const latestCommit = exec("git", [
      "ls-remote",
      gitRemote,
      gitReference ?? "HEAD",
    ])
      .stdout.toString()
      .split(/(\s+)/)[0];
    const localPath = join(tmpdir(), latestCommit);

    const bucket = new Bucket(this, "Bucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
      bucketName,
    });

    // Copy data from upstream htsget repo
    const localDataPath = path.join(localPath, "data");
    new BucketDeployment(this, "DeployFiles", {
      sources: [
        Source.asset(path.join(localDataPath, "c4gh")),
        Source.asset(path.join(localDataPath, "bam")),
        Source.asset(path.join(localDataPath, "cram")),
        Source.asset(path.join(localDataPath, "vcf")),
        Source.asset(path.join(localDataPath, "bcf")),
      ],
      destinationBucket: bucket,
    });

    const keyDir = path.join(localPath, "data", "c4gh", "keys");
    const privateKey = new Secret(this, "PrivateKey", {
      secretStringValue: SecretValue.unsafePlainText(
        readFileSync(path.join(keyDir, "bob.sec")).toString(),
      ),
      removalPolicy: RemovalPolicy.DESTROY,
    });
    const publicKey = new Secret(this, "PublicKey", {
      secretStringValue: SecretValue.unsafePlainText(
        readFileSync(path.join(keyDir, "alice.pub")).toString(),
      ),
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new CfnOutput(this, "BucketName", { value: bucket.bucketName });

    return [bucket, privateKey, publicKey];
  }

  /**
   * Set permissions for the Lambda role.
   */
  private setPermissions(
    role: Role,
    config: HtsgetConfig,
    bucket?: Bucket,
    privateKey?: Secret,
    publicKey?: Secret,
  ) {
    role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole",
      ),
    );

    const locations = config.locations ?? [];
    // Add any "s3://" locations to policy.
    const buckets = locations.flatMap((location) => {
      if (location.location.startsWith("s3://")) {
        return [location.location.split("/")[2]];
      } else {
        return [];
      }
    });
    if (bucket !== undefined) {
      buckets.push(bucket.bucketName);
    }

    const bucketPolicy = new PolicyStatement({
      actions: ["s3:GetObject"],
      resources: buckets.map((bucket) => `arn:aws:s3:::${bucket}/*`),
    });
    if (bucketPolicy.resources.length !== 0) {
      role.addToPolicy(bucketPolicy);
    }

    // Add any keys from the locations.
    const keys = locations.flatMap((location) => {
      const keys: [boolean, string][] = [];
      if (location.private_key !== undefined) {
        keys.push([false, location.private_key]);
      }
      if (location.public_key !== undefined) {
        keys.push([false, location.public_key]);
      }
      return keys;
    });
    if (privateKey !== undefined) {
      keys.push([true, privateKey.secretArn]);
    }
    if (publicKey !== undefined) {
      keys.push([true, publicKey.secretArn]);
    }

    const secretPolicy = new PolicyStatement({
      actions: ["secretsmanager:GetSecretValue"],
      resources: keys.map(([arn, key]) => {
        if (arn) {
          return key;
        } else {
          return `arn:aws:secretsmanager:${Aws.REGION}:${Aws.ACCOUNT_ID}:secret:${key}-*`;
        }
      }),
    });
    if (secretPolicy.resources.length !== 0) {
      role.addToPolicy(secretPolicy);
    }
  }

  /**
   * Creates a lambda role with the configured permissions.
   */
  private createRole(id: string, roleName?: string): Role {
    return new Role(this, "Role", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      description: "Lambda execution role for " + id,
      roleName,
    });
  }

  /**
   * Create stateful config related to the httpApi and the API itself.
   */
  private createHttpApi(
    domain: string,
    jwtAuthorizer?: JwtConfig,
    config?: CorsConifg,
    subDomain?: string,
    hostedZone?: IHostedZone,
    certificateArn?: string,
    noHostedZone?: boolean,
  ): HttpApi {
    // Add an authorizer if auth is required.
    let authorizer: HttpJwtAuthorizer | undefined = undefined;
    if (jwtAuthorizer !== undefined) {
      // If the cog user pool id is not specified, create a new one.
      if (jwtAuthorizer.cogUserPoolId === undefined) {
        const pool = new UserPool(this, "UserPool");
        jwtAuthorizer.cogUserPoolId = pool.userPoolId;
      }

      authorizer = new HttpJwtAuthorizer(
        "HtsgetAuthorizer",
        `https://cognito-idp.${Stack.of(this).region}.amazonaws.com/${jwtAuthorizer.cogUserPoolId}`,
        {
          identitySource: ["$request.header.Authorization"],
          jwtAudience: jwtAuthorizer.audience ?? [],
        },
      );
    }

    let domainName = null;
    if (!noHostedZone) {
      let zone: IHostedZone;
      if (hostedZone === undefined) {
        zone = HostedZone.fromLookup(this, "HostedZone", {
          domainName: domain,
        });
      } else {
        zone = hostedZone;
      }

      const url = `${subDomain ?? "htsget"}.${domain}`;
      let certificate: ICertificate;
      if (certificateArn !== undefined) {
        certificate = Certificate.fromCertificateArn(
          this,
          "Certificate",
          certificateArn,
        );
      } else {
        certificate = new Certificate(this, "Certificate", {
          domainName: url,
          validation: CertificateValidation.fromDns(hostedZone),
          certificateName: url,
        });
      }

      domainName = new DomainName(this, "DomainName", {
        certificate: certificate,
        domainName: url,
      });

      new ARecord(this, "ARecord", {
        zone,
        recordName: subDomain ?? "htsget",
        target: RecordTarget.fromAlias(
          new ApiGatewayv2DomainProperties(
            domainName.regionalDomainName,
            domainName.regionalHostedZoneId,
          ),
        ),
      });
    }

    return new HttpApi(this, "HtsGetApiGateway", {
      defaultAuthorizer: authorizer,
      ...(domainName && {
        defaultDomainMapping: {
          domainName,
        },
      }),
      corsPreflight: {
        allowCredentials: config?.allowCredentials ?? false,
        allowHeaders: config?.allowHeaders ?? ["*"],
        allowMethods: config?.allowMethods ?? [CorsHttpMethod.ANY],
        allowOrigins: config?.allowOrigins ?? ["*"],
        exposeHeaders: config?.exposeHeaders ?? ["*"],
        maxAge: config?.maxAge ?? Duration.days(30),
      },
    });
  }

  /**
   * Convert JSON config to htsget-rs env representation.
   */
  private configToEnv(
    config: HtsgetConfig,
    corsConfig?: CorsConifg,
    bucket?: Bucket,
    privateKey?: Secret,
    publicKey?: Secret,
  ): Record<string, string> {
    const toHtsgetEnv = (value: unknown) => {
      return JSON.stringify(value)
        .replaceAll(new RegExp(/"( )*:( )*/g), "=")
        .replaceAll('"', "");
    };

    const out: Record<string, string | undefined> = {};
    const locations = config.locations ?? [];

    if (bucket !== undefined) {
      locations.push({
        location: `s3://${bucket.bucketName}`,
        private_key: privateKey?.secretArn,
        public_key: publicKey?.secretArn,
      });
    }

    let locationsEnv = locations
      .map((location) => {
        return toHtsgetEnv({
          location: location.location,
          ...(location.private_key !== undefined &&
            location.public_key !== undefined && {
              keys: {
                kind: "SecretsManager",
                private: location.private_key,
                public: location.public_key,
              },
            }),
        });
      })
      .join(",");
    locationsEnv = `[${locationsEnv}]`;

    if (
      locationsEnv == "[]" &&
      (config.environment_override === undefined ||
        config.environment_override.HTSGET_LOCATIONS === undefined)
    ) {
      throw new Error(
        "no locations configured, htsget-rs wouldn't be able to access any files!",
      );
    }

    out.HTSGET_LOCATIONS = locationsEnv;
    out.HTSGET_TICKET_SERVER_CORS_ALLOW_CREDENTIALS =
      corsConfig?.allowCredentials?.toString();
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    out.HTSGET_TICKET_SERVER_CORS_ALLOW_HEADERS = `[${corsConfig?.allowHeaders?.join(",") as string}]`;
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    out.HTSGET_TICKET_SERVER_CORS_ALLOW_METHODS = `[${corsConfig?.allowMethods?.join(",") as string}]`;
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    out.HTSGET_TICKET_SERVER_CORS_ALLOW_ORIGINS = `[${corsConfig?.allowOrigins?.join(",") as string}]`;
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    out.HTSGET_TICKET_SERVER_CORS_EXPOSE_HEADERS = `[${corsConfig?.exposeHeaders?.join(",") as string}]`;
    out.HTSGET_TICKET_SERVER_CORS_MAX_AGE = corsConfig?.maxAge
      ?.toSeconds()
      .toString();

    for (const key in config.service_info) {
      out[`HTSGET_SERVICE_INFO_${key.toUpperCase()}`] = toHtsgetEnv(
        config.service_info[key],
      );
    }
    for (const key in config.environment_override) {
      out[key] = toHtsgetEnv(config.environment_override[key]);
    }

    Object.keys(out).forEach(
      (key) =>
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        (out[key] == `[undefined]` || out[key] == "[]") && delete out[key],
    );
    return out as Record<string, string>;
  }
}
