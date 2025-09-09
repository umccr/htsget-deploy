import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { HtsgetVpcLatticeLambda } from "./lib/htsget-vpc-lattice-lambda";
import { HtsgetVpcLatticeLambdaProps } from "./lib/htsget-vpc-lattice-lambda-props";

export class HtsgetVpcLatticeStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    settings: HtsgetVpcLatticeLambdaProps,
    props?: cdk.StackProps,
  ) {
    super(scope, id, props);

    new HtsgetVpcLatticeLambda(this, "HtsgetVpcLatticeLambda", settings);
  }
}
