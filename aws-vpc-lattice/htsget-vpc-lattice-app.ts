import * as cdk from "aws-cdk-lib";
import { HtsgetVpcLatticeStack } from "./htsget-vpc-lattice-stack";

const stackId = "HtsgetVpcLatticeStack";

const app = new cdk.App();

new HtsgetVpcLatticeStack(
  app,
  stackId,
  {
    vpcOrName: "main-vpc",
    destinationAccounts: ["534840902377"],
    htsgetConfig: {
      environment_override: {
        HTSGET_LOCATIONS: "[]",
        HTSGET_DATA_SERVER: "None",
        HTSGET_AUTH_AUTHORIZATION_URL: `https://elsa-data.dev.umccr.org/api/integration/htsget-rs`,
        HTSGET_AUTH_FORWARD_ENDPOINT_TYPE: true,
        HTSGET_AUTH_FORWARD_ID: true,
        HTSGET_AUTH_SUPPRESS_ERRORS: true,
        HTSGET_AUTH_ADD_HINT: true,
        HTSGET_AUTH_FORWARD_EXTENSIONS: `[{ json_path=$.requestContext.identity.sourceVpcArn, name=SourceVpcArn }]`,
        AWS_LAMBDA_HTTP_IGNORE_STAGE_IN_PATH: true,
      },
    },
    build: {
      gitReference: "main",
      gitForceClone: true,
    },
    naming: {
      subDomain: "htsget-vpc-lattice",
      domain: "dev.umccr.org",
      certificateArn:
        "arn:aws:acm:ap-southeast-2:843407916570:certificate/aa9a1385-7f72-4f1f-98a5-a5da2eff653b",
    },
  },
  {
    stackName: stackId,
    description:
      "A stack deploying htsget-rs with VPC Lattice in a UMCCR environment",
    tags: {
      Stack: stackId,
    },
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  },
);
