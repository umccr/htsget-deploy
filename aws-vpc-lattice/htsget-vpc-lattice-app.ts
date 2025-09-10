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
        HTSGET_LOCATIONS:
          "[{regex=.*, substitution_string=$0/$0.hard-filtered, backend={ kind=S3, bucket=umccr-10g-data-dev }} ]",
      },
    },
    build: {
      gitReference: "feature/aws-vpc-lattice-support",
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
    description: "A stack deploying htsget-rs with VPC Lattice",
    tags: {
      Stack: stackId,
    },
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  },
);
