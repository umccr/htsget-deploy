import { IVpc } from "aws-cdk-lib/aws-ec2";
import { IRole } from "aws-cdk-lib/aws-iam";
import { HtsgetConfig } from "htsget-lambda/lib/config";

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

    /**
     * Specify the runtime for the deployed htsget Lambda function.
     *
     * @defaultValue uses provided.al2023
     */
    runtime?: "provided.al2023" | "provided.al2";
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
