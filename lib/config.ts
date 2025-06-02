import { IVpc } from "aws-cdk-lib/aws-ec2";
import { CorsHttpMethod, IHttpApi } from "aws-cdk-lib/aws-apigatewayv2";
import { IRole } from "aws-cdk-lib/aws-iam";
import { Duration } from "aws-cdk-lib";
import { IHostedZone } from "aws-cdk-lib/aws-route53";

/**
 * Settings related to the htsget lambda construct props.
 */
export interface HtsgetLambdaProps {
  /**
   * The htsget-rs config options. Use this to specify any locations and htsget-rs options.
   *
   * @defaultValue undefined
   */
  htsgetConfig?: HtsgetConfig;

  /**
   * The domain name for the htsget server. This must be specified if `httpApi` is not set. This assumes
   * that a `HostedZone` exists for this domain.
   *
   * @defaultValue undefined
   */
  domain?: string;

  /**
   * The domain name prefix to use for the htsget-rs server.
   *
   * @defaultValue "htsget"
   */
  subDomain?: string;

  /**
   * Whether this deployment is gated behind a JWT authorizer, or if its public.
   *
   * @defaultValue `undefined`, defaults to a public deployment
   */
  jwt?: JwtConfig;

  /**
   * CORS configuration for the htsget-rs server. Values here are propagated to CORS options in htsget-rs.
   *
   * @defaultValue same as the `CorsConfig` defaults
   */
  cors?: CorsConifg;

  /**
   * The git reference to fetch from the htsget-rs repo.
   *
   * @defaultValue "main"
   */
  gitReference?: string;

  /**
   * Whether to force a git clone for every build. If this is false, then the git repo is only cloned once
   * for every git reference in a temporary directory. Otherwise, the repo is cloned every time.
   *
   * @defaultValue false
   */
  gitForceClone?: boolean;

  /**
   * Override any cargo lambda flags for the build. By default, features are resolved automatically based on the
   * config and `HtsgetLocation[]`. This option overrides that and any automatically added flags.
   *
   * @defaultValue undefined
   */
  cargoLambdaFlags?: string[];

  /**
   * Copy the test data directory to a new bucket:
   * https://github.com/umccr/htsget-rs/tree/main/data
   *
   * Also copies the Crypt4GH keys to Secrets Manager. Automatically the htsget-rs server access
   * to the bucket and secrets using the locations config.
   *
   * @defaultValue false
   */
  copyTestData?: boolean;

  /**
   * Optionally specify a VPC for the Lambda function.
   *
   * @defaultValue undefined
   */
  vpc?: IVpc;

  /**
   * Manually specify an `HttpApi`. This will not create a `HostedZone`, any Route53 records, certificates,
   * or authorizers, and will instead rely on the existing `HttpApi`.
   *
   * @defaultValue undefined
   */
  httpApi?: IHttpApi;

  /**
   * Use the provided hosted zone instead of looking it up from the domain name.
   *
   * @defaultValue undefined
   */
  hostedZone?: IHostedZone;

  /**
   * Use the provided role instead of creating one. This will ignore any configuration related to permissions for
   * buckets and secrets, and rely on the existing role.
   *
   * @defaultValue undefined
   */
  role?: IRole;

  /**
   * Override the environment variables used to build htsget. Note that this only adds environment variables that
   * get used to build htsget-rs with `cargo`. It has no effect on the environment variables that htsget-rs has when
   * the Lambda function is deployed. In general, leave this undefined unless there is a specific reason to override
   * the build environment.
   *
   * @defaultValue undefined
   */
  buildEnvironment?: Record<string, string>;
}

/**
 * JWT authorization settings.
 */
export interface JwtConfig {
  /**
   * The JWT audience.
   *
   * @defaultValue []
   */
  audience?: string[];

  /**
   * The cognito user pool id for the authorizer. If this is not set, then a new user pool is created.
   *
   * @defaultValue `undefined`, creates a new user pool
   */
  cogUserPoolId?: string;
}

/**
 * CORS configuration for the htsget-rs server.
 */
export interface CorsConifg {
  /**
   * CORS allow credentials.
   *
   * @defaultValue false
   */
  allowCredentials?: boolean;

  /**
   * CORS allow headers.
   *
   * @defaultValue ["*"]
   */
  allowHeaders?: string[];

  /**
   * CORS allow methods.
   *
   * @defaultValue [CorsHttpMethod.ANY]
   */
  allowMethods?: CorsHttpMethod[];

  /**
   * CORS allow origins.
   *
   * @defaultValue ["*"]
   */
  allowOrigins?: string[];

  /**
   * CORS expose headers.
   *
   * @defaultValue ["*"]
   */
  exposeHeaders?: string[];

  /**
   * CORS max age.
   *
   * @defaultValue Duration.days(30)
   */
  maxAge?: Duration;
}

/**
 * Configuration for the htsget-rs server. This allows specifying the options
 * available in the htsget-rs config: https://github.com/umccr/htsget-rs/tree/main/htsget-config
 */
export interface HtsgetConfig {
  /**
   * The locations for the htsget-rs server. This is the same as the htsget-rs config locations:
   * https://github.com/umccr/htsget-rs/tree/main/htsget-config#quickstart
   *
   * Any `s3://...` locations will automatically be added to the bucket access policy.
   *
   * @defaultValue []
   */
  locations?: HtsgetLocation[];

  /**
   * Service info fields to configure for the server. This is the same as the htsget-rs config service_info:
   * https://github.com/umccr/htsget-rs/tree/main/htsget-config#service-info-config
   *
   * @defaultValue undefined
   */
  service_info?: Record<string, unknown>;

  /**
   * Any additional htsget-rs options can be specified here as environment variables. These will override
   * any options set in this construct, and allows using advanced configuration. Options here should contain
   * the `HTSGET_` prefix.
   *
   * @defaultValue undefined
   */
  environment_override?: Record<string, unknown>;
}

/**
 * Config for locations.
 */
export interface HtsgetLocation {
  /**
   * The location string.
   */
  location: string;
  /**
   * Optional Crypt4GH private key secret ARN or name.
   *
   * @defaultValue undefined
   */
  private_key?: string;
  /**
   * Optional Crypt4GH public key secret ARN or name.
   *
   * @defaultValue undefined
   */
  public_key?: string;
}
