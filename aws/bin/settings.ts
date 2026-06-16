import { HtsgetLambdaProps } from "../index";

/**
 * Example settings for a public htsget deployment.
 */
export const SETTINGS: HtsgetLambdaProps = {
  domain: "example.com",
  copyTestData: true,
  gitReference: "main",
  bucketName: "data-bucket",
  functionName: "htsget-function",
  roleName: "htsget-role",
};
