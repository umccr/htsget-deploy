import { HtsgetLambdaProps } from "../index";

/**
 * Settings to use for the htsget deployment.
 */
export const SETTINGS: HtsgetLambdaProps = {
  copyTestData: false,
  httpApi: null,
  gitReference: "feature/aws-vpc-lattice-support",
  htsgetConfig: {
    environment_override: {
      HTSGET_LOCATIONS:
        "[{regex=.*, substitution_string=$0/$0.hard-filtered, backend={ kind=S3, bucket=tre2-7t39ow9mu1jyr6rqrpqrziugjwmzcaps2a-s3alias }} ]",
    },
  },
};
