import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  HtsgetVpcLatticeConsumer,
  HtsgetVpcLatticeConsumerProps,
  HtsgetVpcLatticeProducer,
  HtsgetVpcLatticeProducerProps,
} from "../index";
import { CONSUMER_SETTINGS, PRODUCER_SETTINGS } from "./settings";

/**
 * The producer lattice stack holds the data and deploys htsget-rs. This must be deployed first.
 */
export class HtsgetVpcLatticeProducerStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    settings: HtsgetVpcLatticeProducerProps,
    props?: cdk.StackProps,
  ) {
    super(scope, id, props);

    new HtsgetVpcLatticeProducer(this, "HtsgetVpcLatticeProducer", settings);
  }
}

/**
 * The consumer lattice stack accesses the htsget-rs deployment in the producer account. This should
 * be deployed second.
 */
export class HtsgetVpcLatticeConsumerStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    settings: HtsgetVpcLatticeConsumerProps,
    props?: cdk.StackProps,
  ) {
    super(scope, id, props);

    new HtsgetVpcLatticeConsumer(this, "HtsgetVpcLatticeConsumer", settings);
  }
}

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

// This stack will produce the `ServiceNetworkArn` which must be used in the follow-up deployment of
// of the consumer stack: e.g. `HTSGET_SERVICE_NETWORK_ARN=arn:... cdk deploy HtsgetVpcLatticeConsumerStack`
const producerStackId = "HtsgetVpcLatticeProducerStack";
new HtsgetVpcLatticeProducerStack(app, producerStackId, PRODUCER_SETTINGS, {
  stackName: producerStackId,
  description:
    "Producer side: htsget-rs fronted by a VPC Lattice service, shared over RAM.",
  tags: { Stack: producerStackId },
  env,
});

const consumerStackId = "HtsgetVpcLatticeConsumerStack";
const serviceNetworkArn = process.env.HTSGET_SERVICE_NETWORK_ARN;
if (serviceNetworkArn !== undefined) {
  new HtsgetVpcLatticeConsumerStack(
    app,
    consumerStackId,
    { ...CONSUMER_SETTINGS, serviceNetworkArn },
    {
      stackName: consumerStackId,
      description:
        "Consumer side: associates a VPC with the shared htsget VPC Lattice network.",
      tags: {
        Stack: consumerStackId,
      },
      env,
    },
  );
}
