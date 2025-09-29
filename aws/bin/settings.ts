import { HtsgetLambdaProps } from "../index";

/**
 * Settings to use for the htsget deployment.
 */
export const SETTINGS: HtsgetLambdaProps = {
  domain: "ga4gh.org",
  copyTestData: true,
  gitReference: "htsget-lambda-v0.7.4",
  bucketName: "htsget-data",
  functionName: "htsget-function",
  roleName: "htsget-role",
  noHostedZone: true,
};
