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

    new HtsgetLambda(this, "HtsgetLambda", settings);
  }
}

const app = new cdk.App();
new HtsgetStack(app, "HtsgetLambdaStack", SETTINGS, {
  stackName: "HtsgetLambdaStack",
  description: "A stack deploying htsget-rs with API gateway.",
  tags: {
    Stack: "HtsgetLambdaStack",
  },
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
