import { readFileSync } from "fs";

import {
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
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpJwtAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { tmpdir } from "os";
import {
  CorsConifg,
  HtsgetConfig,
  HtsgetConstructProps,
  HtsgetLocation,
  JwtAuthConfig,
} from "./config";

/**
 * Construct used to deploy htsget-lambda.
 */
export class HtsgetConstruct extends Construct {
  constructor(scope: Construct, id: string, props: HtsgetConstructProps) {
    super(scope, id);

    if (props.htsgetConfig == undefined) {
      props.htsgetConfig = {
        locations: [],
      };
    }

    let bucket: Bucket | undefined = undefined;
    let privateKey: Secret | undefined = undefined;
    let publicKey: Secret | undefined = undefined;
    if (props.copyTestData) {
      [bucket, privateKey, publicKey] = this.setupTestData();
    }

    let lambdaRole: Role;
    if (props.role !== undefined) {
      lambdaRole = props.role;
    } else {
      lambdaRole = this.createRole(
        id,
        props.htsgetConfig,
        bucket,
        privateKey,
        publicKey,
      );
    }

    let httpApi: HttpApi;
    if (props.httpApi !== undefined) {
      httpApi = props.httpApi;
    } else {
      if (props.domain === undefined || props.jwtAuthorizer === undefined) {
        throw Error(
          "domain and jwtAuthorizer must be defined if httpApi is not specified",
        );
      }

      httpApi = this.createHttpApi(
        props.domain,
        props.jwtAuthorizer,
        props.corsConfig,
        props.subDomain,
      );
    }

    const htsgetLambda = new RustFunction(this, "Function", {
      gitRemote: "https://github.com/umccr/htsget-rs",
      gitForceClone: true,
      gitReference: props.gitReference,
      binaryName: "htsget-lambda",
      bundling: {
        environment: {
          RUSTFLAGS: "-C target-cpu=neoverse-n1",
          CARGO_PROFILE_RELEASE_LTO: "true",
          CARGO_PROFILE_RELEASE_CODEGEN_UNITS: "1",
        },
        cargoLambdaFlags: ["--all-features"],
      },
      memorySize: 128,
      timeout: Duration.seconds(28),
      environment: {
        ...this.configToEnv(
          props.htsgetConfig,
          props.corsConfig,
          bucket,
          privateKey,
          publicKey,
        ),
        RUST_LOG:
          "info,htsget_http_lambda=trace,htsget_config=trace,htsget_http_core=trace,htsget_search=trace",
      },
      architecture: Architecture.ARM_64,
      role: lambdaRole,
      vpc: props.vpc,
    });

    const httpIntegration = new HttpLambdaIntegration(
      "Integration",
      htsgetLambda,
    );
    httpApi.addRoutes({
      path: "/{proxy+}",
      methods: [HttpMethod.GET, HttpMethod.POST],
      integration: httpIntegration,
    });
  }

  /**
   * Create a bucket and copy test data if configured.
   */
  private setupTestData(): [Bucket, Secret, Secret] {
    const bucket = new Bucket(this, "Bucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Copy data from upstream htsget repo
    const localDataPath = path.join(tmpdir(), "htsget-rs");

    new BucketDeployment(this, "DeployFiles", {
      sources: [Source.asset(localDataPath)],
      destinationBucket: bucket,
    });

    const keyDir = path.join(tmpdir(), "htsget-rs", "data", "c4gh", "keys");
    const privateKey = new Secret(this, "PrivateKey", {
      secretName: "htsget-rs/c4gh-private-key", // pragma: allowlist secret
      secretStringValue: SecretValue.unsafePlainText(
        readFileSync(path.join(keyDir, "bob.sec")).toString(),
      ),
      removalPolicy: RemovalPolicy.DESTROY,
    });
    const publicKey = new Secret(this, "PublicKey", {
      secretName: "htsget-rs/c4gh-public-key", // pragma: allowlist secret
      secretStringValue: SecretValue.unsafePlainText(
        readFileSync(path.join(keyDir, "alice.pub")).toString(),
      ),
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new CfnOutput(this, "HtsgetBucketName", { value: bucket.bucketName });

    return [bucket, privateKey, publicKey];
  }

  /**
   * Creates a lambda role with the configured permissions.
   */
  private createRole(
    id: string,
    config: HtsgetConfig,
    bucket?: Bucket,
    privateKey?: Secret,
    publicKey?: Secret,
  ): Role {
    const lambdaRole = new Role(this, "Role", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      description: "Lambda execution role for " + id,
    });
    lambdaRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole",
      ),
    );

    // Add any "s3://" locations to policy.
    const buckets = config.locations.flatMap((location) => {
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
      resources: buckets ?? [],
    });
    if (bucketPolicy.resources.length !== 0) {
      lambdaRole.addToPolicy(bucketPolicy);
    }

    // Add any keys from the locations.
    const keys = config.locations.flatMap((location) => {
      const keys = [];
      if (location.private_key !== undefined) {
        keys.push(location.private_key);
      }
      if (location.public_key !== undefined) {
        keys.push(location.public_key);
      }
      return keys;
    });
    if (privateKey !== undefined) {
      keys.push(privateKey.secretArn);
    }
    if (publicKey !== undefined) {
      keys.push(publicKey.secretArn);
    }

    const secretPolicy = new PolicyStatement({
      actions: ["secretsmanager:GetSecretValue"],
      resources: keys ?? [],
    });
    if (secretPolicy.resources.length !== 0) {
      lambdaRole.addToPolicy(secretPolicy);
    }

    return lambdaRole;
  }

  /**
   * Create stateful config related to the httpApi and the API itself.
   */
  private createHttpApi(
    domain: string,
    jwtAuthorizer: JwtAuthConfig,
    config?: CorsConifg,
    subDomain?: string,
    hostedZone?: HostedZone,
  ): HttpApi {
    // Add an authorizer if auth is required.
    let authorizer: HttpJwtAuthorizer | undefined = undefined;
    if (!jwtAuthorizer.public) {
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
          jwtAudience: jwtAuthorizer.jwtAudience ?? [],
        },
      );
    } else {
      console.warn(
        "This will create an instance of htsget-rs that is public! Anyone will be able to query the server without authorization.",
      );
    }

    let zone: IHostedZone;
    if (hostedZone === undefined) {
      zone = HostedZone.fromLookup(this, "HostedZone", {
        domainName: domain,
      });
    } else {
      zone = hostedZone;
    }

    const url = `${subDomain ?? "htsget"}.${domain}`;
    const certificate = new Certificate(this, "Certificate", {
      domainName: url,
      validation: CertificateValidation.fromDns(hostedZone),
      certificateName: url,
    });

    const domainName = new DomainName(this, "DomainName", {
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

    return new HttpApi(this, "ApiGateway", {
      defaultAuthorizer: authorizer,
      defaultDomainMapping: {
        domainName: domainName,
      },
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
  ): { [key: string]: string } {
    const toHtsgetEnv = (value: object) => {
      return JSON.stringify(value).replaceAll('"', "").replaceAll(":", "=");
    };

    const out: { [key: string]: string | undefined } = {};

    if (bucket !== undefined) {
      const location: HtsgetLocation = {
        location: `s3://${bucket.bucketName}`,
        private_key: privateKey?.secretArn,
        public_key: publicKey?.secretArn,
      };
      config.locations.push(location);
    }

    let locations = config.locations
      .map((location) => {
        return toHtsgetEnv({
          location: location.location,
          key: {
            kind: "SecretsManager",
            private: location.private_key,
            public: location.public_key,
          },
        });
      })
      .join(",");
    locations = `[${locations}]`;

    out["HTSGET_LOCATIONS"] = locations;

    out["HTSGET_TICKET_SERVER_CORS_ALLOW_CREDENTIALS"] =
      corsConfig?.allowCredentials?.toString();
    out["HTSGET_TICKET_SERVER_CORS_ALLOW_HEADERS"] =
      `[${corsConfig?.allowHeaders?.join(",")}]`;
    out["HTSGET_TICKET_SERVER_CORS_ALLOW_METHODS"] =
      `[${corsConfig?.allowMethods?.join(",")}]`;
    out["HTSGET_TICKET_SERVER_CORS_ALLOW_ORIGINS"] =
      `[${corsConfig?.allowOrigins?.join(",")}]`;
    out["HTSGET_TICKET_SERVER_CORS_EXPOSE_HEADERS"] =
      `[${corsConfig?.exposeHeaders?.join(",")}]`;
    out["HTSGET_TICKET_SERVER_CORS_MAX_AGE"] = corsConfig?.maxAge
      ?.toSeconds()
      .toString();

    for (const key in config.service_info) {
      out[`HTSGET_SERVICE_INFO_${key.toUpperCase()}`] = toHtsgetEnv(
        config.service_info[key],
      );
    }
    for (const key in config.environment_override) {
      out[`HTSGET_${key.toUpperCase()}`] = toHtsgetEnv(
        config.environment_override[key],
      );
    }

    Object.keys(out).forEach(
      (key) => (out[key] === undefined || out[key] == null) && delete out[key],
    );
    return out as { [key: string]: string };
  }
}
