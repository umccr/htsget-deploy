import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { HtsgetLambdaConstruct } from "../lib/htsget-lambda-construct";
import { SETTINGS } from "../bin/settings"
import { HtsgetStatefulSettings } from "../lib/htsget-lambda-construct"
import { HtsgetStatelessSettings } from "../lib/htsget-lambda-construct"

export class HtsgetTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, settings: HtsgetStatefulSettings & HtsgetStatelessSettings, props?: cdk.StackProps) {
    super(scope, id, props);

    new HtsgetLambdaConstruct(this, 'Htsget-rs', SETTINGS);
  }
}

const app = new cdk.App();
new HtsgetTestStack(
  app,
  "HtsgetTestStack",
  SETTINGS,
  {
    stackName: "HtsgetTestStack",
    description: "HtsgetTestStack",
    tags: {
      Stack: "HtsgetTestStack",
    },
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  },
);
