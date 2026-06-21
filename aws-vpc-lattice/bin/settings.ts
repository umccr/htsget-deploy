import {
  HtsgetVpcLatticeConsumerProps,
  HtsgetVpcLatticeProducerProps,
} from "../index";

/**
 * Example settings for the producer VPC lattice stack.
 */
export const PRODUCER_SETTINGS: HtsgetVpcLatticeProducerProps = {
  vpcOrName: "vpc-name",
  destinationAccounts: ["111111111111", "222222222222"],
  htsgetConfig: {
    locations: [{ location: "s3://data-bucket" }],
  },
  build: {
    gitReference: "main",
    gitForceClone: true,
  },
  naming: {
    subDomain: "example.com",
    domain: "htsget-vpc-lattice",
  },
};

/**
 * Example settings for the consumer VPC lattice stack. Note that the `serviceNetworkArn` must be omitted
 * as it depends on the result of the deployment of the producer stack.
 */
export const CONSUMER_SETTINGS: Omit<
  HtsgetVpcLatticeConsumerProps,
  "serviceNetworkArn"
> = {
  vpcOrName: "vpc-name",
  deployTestLambda: {
    endpoint: `htsget-vpc-lattice.example.com`,
  },
};
