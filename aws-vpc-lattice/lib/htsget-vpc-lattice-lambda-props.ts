import { IVpc } from "aws-cdk-lib/aws-ec2";
import { IRole } from "aws-cdk-lib/aws-iam";
import { IHostedZone } from "aws-cdk-lib/aws-route53";
import { HtsgetConfig } from "@umccr/htsget-lambda";

/**
 * Settings related to the htsget VPC Lattice lambda construct props.
 */
export interface HtsgetVpcLatticeLambdaProps {
  /**
   * The htsget-rs config options. Use this to specify any locations and htsget-rs options.
   *
   * @defaultValue undefined
   */
  htsgetConfig?: HtsgetConfig;

  /**
   * Options for building htsget-rs. Ignored when `lambdaCodePath` is set.
   *
   * @defaultValue undefined
   */
  build?: {
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

    /**
     * Specify the runtime for the deployed htsget Lambda function.
     *
     * @defaultValue uses provided.al2023
     */
    runtime?: "provided.al2023" | "provided.al2";
  };

  /**
   * Deploy a pre-built htsget-lambda artifact.
   *
   * @defaultValue undefined, builds from source
   */
  lambdaCodePath?: string;

  /**
   * The name of the Lambda function.
   *
   * @defaultValue undefined
   */
  functionName?: string;

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
     * The certificate ARN for SSL corresponding to a wildcard or specific cert for the sub.domain.
     *
     * @defaultValue undefined, creates a new certificate
     */
    certificateArn?: string;
  };

  /**
   * Use the hosted zone instead of looking it up from the domain name.
   *
   * @defaultValue undefined, looks up the zone from `naming.domain`
   */
  hostedZone?: IHostedZone;

  /**
   * Specify the VPC or name to lookup for the Lambda function.
   *
   * @defaultValue undefined
   */
  vpcOrName?: string | IVpc;

  /**
   * Use the provided role instead of creating one. This will ignore any configuration related to permissions for
   * buckets and secrets, and rely on the existing role.
   *
   * @defaultValue undefined
   */
  role?: IRole;

  /**
   * Attach `AmazonS3ReadOnlyAccess` to the role created by this construct. This is needed
   * for dynamic locations that come in through `environment_override` or an authorization
   * server.
   *
   * @defaultValue false
   */
  broadS3Read?: boolean;

  /**
   * A list of AWS account ids that the VPC Lattice service network will be shared to using RAM.
   */
  destinationAccounts: string[];

  /**
   * The name of the VPC Lattice service network.
   *
   * @defaultValue "htsget-service-network"
   */
  serviceNetworkName?: string;

  /**
   * The name of the RAM resource share.
   *
   * @defaultValue "htsget-service-network"
   */
  shareName?: string;
}
