import { HtsgetStatelessSettings } from "../lib/htsget-lambda-construct";
import { HtsgetStatefulSettings } from "../lib/htsget-lambda-construct";

/**
 * Settings to use for the htsget deployment.
 */
export const SETTINGS: HtsgetStatelessSettings & HtsgetStatefulSettings = {
  config: "config/example_deploy.toml",
  domain: "demo.umccr.org",
  subDomain: "htsget",
  s3BucketResources: [],
  lookupHostedZone: true,
  createS3Bucket: true,
  copyTestData: true,
  copyExampleKeys: true,
  // Override the bucket name.
  // bucketName: "bucket",
  jwtAuthorizer: {
    // Set this to false if you want a private instance.
    public: true,
    cogUserPoolId: "", // i.e: ap-southeast-2_iWOHnsurL
    jwtAudience: [""], // Should match your cognito client id, i.e: 3jgmc7kqaaf8mqbv2sgmujslrp
  },
  // Enable additional features for compiling htsget-rs. `s3-storage` is always enabled.
  features: ["experimental", "aws"], // i.e: Enables Crypt4Gh+htsget functionality
};
