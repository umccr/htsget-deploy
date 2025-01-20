import { IVpc } from "aws-cdk-lib/aws-ec2";
import { CorsHttpMethod, HttpApi } from "aws-cdk-lib/aws-apigatewayv2";
import { Role } from "aws-cdk-lib/aws-iam";
import { Duration } from "aws-cdk-lib";

/**
 * Settings related to the htsget lambda construct props.
 */
export type HtsgetConstructProps = {
  /**
   * The htsget-rs config options.
   */
  htsgetConfig?: HtsgetConfig;

  /**
   * Whether this deployment is gated behind a JWT authorizer, or if its public.
   */
  jwtAuthorizer?: JwtAuthConfig;

  /**
   * CORS configuration for the htsget-rs server.
   */
  corsConfig?: CorsConifg;

  /**
   * Additional features to compile htsget-rs with. By default, all features are enabled.
   */
  features?: string[];

  /**
   * The git reference to fetch from the htsget-rs repo.
   */
  gitReference?: string;

  /**
   * The domain name for the htsget server. This must be specified is `httpApi` is not set. This assumes
   * that a `HostedZone` exists for this domain. Set `createHostedZone` if you want to create a new hosted zone.
   */
  domain?: string;

  /**
   * The domain name prefix to use for the htsget-rs server. Defaults to `"htsget"`.
   */
  subDomain?: string;

  /**
   * Whether to create a hosted zone. Defaults to `false`.
   */
  createHostedZone?: boolean;

  /**
   * Copy the test data directory to a new bucket:
   * https://github.com/umccr/htsget-rs/tree/main/data
   *
   * Also copies the Crypt4GH keys to Secrets Manager. Gives
   * the htsget-rs server access to the bucket and secrets using the locations config. Defaults to `false`.
   */
  copyTestData?: boolean;

  /**
   * Optionally specify a VPC for the Lambda function.
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
export type JwtAuthConfig = {
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
 * CORS configuration for the htsget-rs server.
 */
export type CorsConifg = {
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
 * Configuration for the htsget-rs server. Options here are a subset of the options
 * available in the htsget-rs config: https://github.com/umccr/htsget-rs/tree/main/htsget-config
 */
export type HtsgetConfig = {
  /**
   * The locations for the htsget-rs server. This is the same as the htsget-rs config locations:
   * https://github.com/umccr/htsget-rs/tree/main/htsget-config#quickstart
   *
   * Any `s3://...` locations specified will automatically be added to the bucket access policy.
   */
  locations: string[];

  /**
   * Service info fields to configure for the server. This is the same as the htsget-rs config service_info:
   * https://github.com/umccr/htsget-rs/tree/main/htsget-config#service-info-config
   */
  service_info: Record<string, object>;

  /**
   * Any additional htsget-rs options can be specified here as environment variables. These will override
   * any options set in this construct, and allows using advanced configuration.
   */
  environment_override: Record<string, string>;
};
