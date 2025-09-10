import { IVpc } from "aws-cdk-lib/aws-ec2";
import { IRole } from "aws-cdk-lib/aws-iam";

/**
 * Settings related to the htsget lambda construct props.
 */
export interface HtsgetVpcLatticeLambdaProps {
  /**
   * The htsget-rs config options. Use this to specify any locations and htsget-rs options.
   *
   * @defaultValue undefined
   */
  htsgetConfig?: HtsgetConfig;

  build: {
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
     * Override the environment variables used to build htsget. Note that this only adds environment variables that
     * get used to build htsget-rs with `cargo`. It has no effect on the environment variables that htsget-rs has when
     * the Lambda function is deployed. In general, leave this undefined unless there is a specific reason to override
     * the build environment.
     *
     * @defaultValue undefined
     */
    buildEnvironment?: Record<string, string>;
  };

  /**
   * How to name the VPC Lattice service.
   */
  naming: {
    /**
     * The domain name for the htsget server. This assumes
     * that a `HostedZone` exists for this domain.
     */
    domain: string;

    /**
     * The domain name prefix to use for the htsget-rs server.
     */
    subDomain: string;

    /**
     * The certificate ARN for SSL corresponding to a wildcard or specific cert for the sub.domain
     */
    certificateArn: string;
  };

  /**
   * Specify a VPC for the Lambda function, or specify the name of the VPC to lookup.
   */
  vpcOrName: string | IVpc;

  /**
   * Use the provided role instead of creating one. This will ignore any configuration related to permissions for
   * buckets and secrets, and rely on the existing role.
   *
   * @defaultValue undefined
   */
  role?: IRole;

  /**
   * A list of AWS account ids that the VPC Lattice service will be shared to using RAM.
   */
  destinationAccounts: string[];
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
}
