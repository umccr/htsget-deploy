import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { HtsgetLambdaProps } from "../index";
import { SETTINGS } from "./settings";
import { HtsgetLambda } from "../lib/htsget-lambda";

export class HtsgetStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    settings: HtsgetLambdaProps,
    props?: cdk.StackProps,
  ) {
    super(scope, id, props);

    new HtsgetLambda(this, "Htsget-rs", settings);
  }
}

const app = new cdk.App();
new HtsgetStack(app, "Htsget", SETTINGS, {
  stackName: "Htsget",
  description: "Htsget",
  tags: {
    Stack: "Htsget",
  },
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
