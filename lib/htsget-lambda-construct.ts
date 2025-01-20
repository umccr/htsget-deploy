import * as TOML from "@iarna/toml";
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
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
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
import { IVpc } from "aws-cdk-lib/aws-ec2";
import { JsonMap } from "@iarna/toml";
import { HtsgetConstructProps } from "./config";

/**
 * These options are related to creating stateful resources. Some of these might conflict with existing resources
 * in the AWS account.
 */
export type HtsgetStatefulSettings = {
  /**
   * The domain name for the htsget server.
   */
  domain?: string;

  /**
   * The domain name prefix to use for the htsget-rs server. Defaults to `"htsget"`.
   */
  subDomain?: string;

  /**
   * Whether to lookup the hosted zone with the domain name. Defaults to `true`. If `true`, attempts to lookup an
   * existing hosted zone using the domain name. Set this to `false` if you want to create a new hosted zone under the
   * domain name.
   */
  lookupHostedZone?: boolean;

  /**
   * Whether to create a test bucket. Defaults to true. Buckets are created with
   * [`RemovalPolicy.RETAIN`](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.RemovalPolicy.html).
   * The correct access permissions are automatically added.
   */
  createS3Bucket?: boolean;

  /**
   * The name of the bucket created using `createS3Bucket`. The name defaults to an automatically generated CDK name,
   * use this option to override that. This option only has an affect is `createS3Buckets` is true.
   */
  bucketName?: string;

  /**
   * Whether to copy test data into the bucket. Defaults to true. This copies the example data under the `data`
   * directory to those buckets. This option only has an affect is `createS3Buckets` is true.
   */
  copyTestData?: boolean;

  /**
   * Whether to create secrets corresponding to C4GH public and private keys that can be used with C4GH storage.
   * This copies the private and public keys in the data directory. Note that private keys copied here are
   * visible in the CDK template. This is not considered secure and should only be used for test data. Real secrets
   * should be manually provisioned or created outside the CDK template. Defaults to false. Secrets are created
   * with [`RemovalPolicy.RETAIN`](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.RemovalPolicy.html).
   */
  copyExampleKeys?: boolean;

  /**
   * Use a VPC for the Lambda function.
   */
  vpc?: IVpc;

  /**
   * Manually specify an `HttpApi`. This will not create a `HostedZone`, any Route53 records, certificates,
   * or authorizers, and will instead rely on the existing `HttpApi`.
   */
  httpApi?: HttpApi;

  /**
   * Use the provided role instead of creating one. This will ignore any configuration related to permissions for
   * buckets and secrets, and rely on the existing role.
   */
  role?: Role;
};

/**
 * JWT authorization settings.
 */
export type HtsgetJwtAuthSettings = {
  /**
   * Whether this deployment is public.
   */
  public: boolean;

  /**
   * The JWT audience.
   */
  jwtAudience: string[];

  /**
   * The cognito user pool id for the authorizer. If this is not set, then a new user pool is created.
   */
  cogUserPoolId?: string;
};

/**
 * Configuration for htsget-rs.
 */
export type Config = {
  /**
   * The config values passed to the htsget-rs server.
   */
  htsgetConfig: { [key: string]: string };

  /**
   * CORS allow credentials.
   */
  allowCredentials?: boolean;

  /**
   * CORS allow headers.
   */
  allowHeaders?: string[];

  /**
   * CORS allow methods.
   */
  allowMethods?: CorsHttpMethod[];

  /**
   * CORS allow origins.
   */
  allowOrigins?: string[];

  /**
   * CORS expose headers.
   */
  exposeHeaders?: string[];

  /**
   * CORS max age.
   */
  maxAge?: Duration;
};

/**
 * Construct used to deploy htsget-lambda.
 */
export class HtsgetLambdaConstruct extends Construct {
  constructor(scope: Construct, id: string, props: HtsgetConstructProps) {
    super(scope, id);

    const config = this.getConfig(settings.config);

    let bucket = undefined;
    if (settings.createS3Bucket) {
      bucket = this.createBucket(settings.copyTestData, settings.bucketName);
    }

    let keys = undefined;
    if (settings.copyTestData && settings.copyExampleKeys) {
      keys = this.createKeys();
    }

    let lambdaRole: Role;
    if (settings.role !== undefined) {
      lambdaRole = settings.role;
    } else {
      lambdaRole = this.createRole(
        id,
        bucket,
        settings.s3BucketResources,
        settings.secretArns,
        keys?.private_key,
        keys?.public_key,
      );
    }

    let httpApi;
    if (settings.httpApi !== undefined) {
      httpApi = settings.httpApi;
    } else {
      if (
        settings.domain === undefined ||
        settings.jwtAuthorizer === undefined
      ) {
        throw Error(
          "domain and jwtAuthorizer must be defined if httpApi is not specified",
        );
      }

      httpApi = this.createHttpApi(
        settings.domain,
        settings.jwtAuthorizer,
        config,
        settings.subDomain,
        settings.lookupHostedZone,
      );
    }

    let features;
    if (settings.features !== undefined) {
      features = ["--features", settings.features.join(",")];
    } else {
      features = ["--all-features"];
    }

    const htsgetLambda = new RustFunction(this, "Function", {
      gitRemote: "https://github.com/umccr/htsget-rs",
      gitForceClone: true,
      gitReference: settings.gitReference,
      binaryName: "htsget-lambda",
      bundling: {
        environment: {
          RUSTFLAGS: "-C target-cpu=neoverse-n1",
          CARGO_PROFILE_RELEASE_LTO: "true",
          CARGO_PROFILE_RELEASE_CODEGEN_UNITS: "1",
        },
        cargoLambdaFlags: features,
      },
      memorySize: 128,
      timeout: Duration.seconds(28),
      environment: {
        ...config.htsgetConfig,
        RUST_LOG:
          "info,htsget_http_lambda=trace,htsget_config=trace,htsget_http_core=trace,htsget_search=trace",
      },
      architecture: Architecture.ARM_64,
      role: lambdaRole,
      vpc: settings.vpc,
    });

    const httpIntegration = new HttpLambdaIntegration(
      "HtsgetIntegration",
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
  private createBucket(copyTestData?: boolean, bucketName?: string): Bucket {
    const bucket = new Bucket(this, "Bucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
      bucketName,
    });

    if (copyTestData) {
      // Copy data from upstream htsget-data repo
      const localDataPath = path.join(tmpdir(), "htsget-rs");

      new BucketDeployment(this, "DeployFiles", {
        sources: [Source.asset(localDataPath)],
        destinationBucket: bucket,
      });
    }

    new CfnOutput(this, "HtsgetBucketName", { value: bucket.bucketName });

    return bucket;
  }

  /**
   * Create C4GH keys inside AWS SecretsManager
   */
  private createKeys(): { private_key: Secret; public_key: Secret } {
    const dataDir = path.join(tmpdir(), "htsget-rs", "data", "c4gh", "keys");
    const private_key = new Secret(this, "SecretPrivateKey-C4GH", {
      secretName: "htsget-rs/privkey-crypt4gh", // pragma: allowlist secret
      secretStringValue: SecretValue.unsafePlainText(
        readFileSync(path.join(dataDir, "bob.sec")).toString(),
      ),
      removalPolicy: RemovalPolicy.RETAIN,
    });
    const public_key = new Secret(this, "SecretPublicKey-C4GH", {
      secretName: "htsget-rs/pubkey-crypt4gh", // pragma: allowlist secret
      secretStringValue: SecretValue.unsafePlainText(
        readFileSync(path.join(dataDir, "alice.pub")).toString(),
      ),
      removalPolicy: RemovalPolicy.RETAIN,
    });

    return { private_key, public_key };
  }

  /**
   * Creates a lambda role with the configured permissions.
   */
  private createRole(
    id: string,
    bucket?: Bucket,
    s3BucketResources?: string[],
    secretArns?: string[],
    private_key?: Secret,
    public_key?: Secret,
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

    if (bucket !== undefined) {
      const s3BucketPolicy = new PolicyStatement({
        actions: ["s3:List*", "s3:Get*"],
        resources: s3BucketResources ?? [],
      });
      s3BucketPolicy.addResources(`arn:aws:s3:::${bucket.bucketName}/*`);

      if (s3BucketPolicy.resources.length !== 0) {
        lambdaRole.addToPolicy(s3BucketPolicy);
      }
    }

    if (private_key !== undefined && public_key !== undefined) {
      const secretPolicy = new PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: secretArns ?? [],
      });
      secretPolicy.addResources(private_key.secretArn, public_key.secretArn);

      if (secretPolicy.resources.length !== 0) {
        lambdaRole.addToPolicy(secretPolicy);
      }
    }

    return lambdaRole;
  }

  /**
   * Create stateful config related to the httpApi and the API itself.
   */
  private createHttpApi(
    domain: string,
    jwtAuthorizer: HtsgetJwtAuthSettings,
    config: Config,
    subDomain?: string,
    lookupHostedZone?: boolean,
  ): HttpApi {
    // Add an authorizer if auth is required.
    let authorizer = undefined;
    if (!jwtAuthorizer.public) {
      // If the cog user pool id is not specified, create a new one.
      if (jwtAuthorizer.cogUserPoolId === undefined) {
        const pool = new UserPool(this, "userPool", {
          userPoolName: "HtsgetRsUserPool",
        });
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

    let hostedZone;
    if (lookupHostedZone ?? true) {
      hostedZone = HostedZone.fromLookup(this, "HostedZone", {
        domainName: domain,
      });
    } else {
      hostedZone = new HostedZone(this, "HtsgetHostedZone", {
        zoneName: domain,
      });
    }

    const url = `${subDomain ?? "htsget"}.${domain}`;
    const certificate = new Certificate(this, "HtsgetCertificate", {
      domainName: url,
      validation: CertificateValidation.fromDns(hostedZone),
      certificateName: url,
    });

    const domainName = new DomainName(this, "HtsgetDomainName", {
      certificate: certificate,
      domainName: url,
    });

    new ARecord(this, "HtsgetARecord", {
      zone: hostedZone,
      recordName: subDomain ?? "htsget",
      target: RecordTarget.fromAlias(
        new ApiGatewayv2DomainProperties(
          domainName.regionalDomainName,
          domainName.regionalHostedZoneId,
        ),
      ),
    });

    return new HttpApi(this, "ApiGw", {
      defaultAuthorizer: authorizer,
      defaultDomainMapping: {
        domainName: domainName,
      },
      corsPreflight: {
        allowCredentials: config.allowCredentials,
        allowHeaders: config.allowHeaders,
        allowMethods: config.allowMethods,
        allowOrigins: config.allowOrigins,
        exposeHeaders: config.exposeHeaders,
        maxAge: config.maxAge,
      },
    });
  }

  /**
   * Convert JSON config to htsget-rs env representation.
   */
  static configToEnv<T extends Record<string, TOML.AnyJson>>(
    config: T,
  ): { [key: string]: string } {
    const out: { [key: string]: string } = {};
    for (const key in config) {
      out[`HTSGET_${key.toUpperCase()}`] = TOML.stringify.value(config[key]);
    }
    return out;
  }

  /**
   * Convert htsget-rs CORS option to CORS options for API Gateway.
   */
  static convertCors(
    configToml: JsonMap,
    corsValue: string,
  ): string[] | undefined {
    const value = configToml[corsValue];

    if (
      value !== undefined &&
      (value.toString().toLowerCase() === "all" ||
        value.toString().toLowerCase() === "mirror")
    ) {
      return ["*"];
    } else if (Array.isArray(value)) {
      return value as string[];
    }

    return undefined;
  }

  /**
   * Convert a string CORS allowMethod option to CorsHttpMethod.
   */
  static corsAllowMethodToHttpMethod(
    corsAllowMethod?: string[],
  ): CorsHttpMethod[] | undefined {
    if (corsAllowMethod?.length === 1 && corsAllowMethod.includes("*")) {
      return [CorsHttpMethod.ANY];
    } else {
      return corsAllowMethod?.map(
        (element) => CorsHttpMethod[element as keyof typeof CorsHttpMethod],
      );
    }
  }

  /**
   * Get the environment from config.toml
   */
  getConfig(config: string): Config {
    const configToml = TOML.parse(readFileSync(config).toString());

    return {
      htsgetConfig: HtsgetLambdaConstruct.configToEnv(configToml),
      allowCredentials:
        configToml.ticket_server_cors_allow_credentials as boolean,
      allowHeaders: HtsgetLambdaConstruct.convertCors(
        configToml,
        "ticket_server_cors_allow_headers",
      ),
      allowMethods: HtsgetLambdaConstruct.corsAllowMethodToHttpMethod(
        HtsgetLambdaConstruct.convertCors(
          configToml,
          "ticket_server_cors_allow_methods",
        ),
      ),
      allowOrigins: HtsgetLambdaConstruct.convertCors(
        configToml,
        "ticket_server_cors_allow_origins",
      ),
      exposeHeaders: HtsgetLambdaConstruct.convertCors(
        configToml,
        "ticket_server_cors_expose_headers",
      ),
      maxAge:
        configToml.ticket_server_cors_max_age !== undefined
          ? Duration.seconds(configToml.ticket_server_cors_max_age as number)
          : undefined,
    };
  }
}
