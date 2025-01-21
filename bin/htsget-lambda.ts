import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { HtsgetConstruct } from "../lib/htsget-construct";
import { HtsgetConstructProps } from "../lib/config";

export class HtsgetStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    settings: HtsgetConstructProps,
    props?: cdk.StackProps,
  ) {
    super(scope, id, props);

    new HtsgetConstruct(this, "Htsget-rs", settings);
  }
}

const app = new cdk.App();
new HtsgetStack(
  app,
  "Htsget",
  {
    domain: "ga4gh-demo.org",
    copyTestData: true,
    jwtAuthorizer: {
      public: true,
    },
  },
  {
    stackName: "Htsget",
    description: "Htsget",
    tags: {
      Stack: "Htsget",
    },
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  },
);
