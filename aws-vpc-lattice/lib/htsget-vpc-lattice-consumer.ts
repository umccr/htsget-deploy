import { CfnOutput, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { IVpc } from "aws-cdk-lib/aws-ec2";
import * as vpclattice from "aws-cdk-lib/aws-vpclattice";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { join } from "node:path";
import { resolveVpc } from "./vpc";
import { HtsgetVpcLatticeConsumerProps } from "./htsget-vpc-lattice-props";

/**
 * Construct used to consume an htsget VPC Lattice service network shared from another
 * account. This construct associated the VPC in this account with the service network from
 * the producer construct.
 *
 * The VPC lattice construct needs to be first be deployed in the producer account before
 * the consumer is able to use it. It is expected that the provider share is active before
 * deploying the consumer. It may be required to accept the lattice share in the consumer
 * account before deploying the consumer stack, unless the accounts are in the same organisation.
 */
export class HtsgetVpcLatticeConsumer extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: HtsgetVpcLatticeConsumerProps,
  ) {
    super(scope, id);

    const vpc = resolveVpc(this, "Vpc", props.vpcOrName);

    const association = new vpclattice.CfnServiceNetworkVpcAssociation(
      this,
      "VpcAssociation",
      {
        serviceNetworkIdentifier: props.serviceNetworkArn,
        vpcIdentifier: vpc.vpcId,
        securityGroupIds: props.securityGroupIds,
      },
    );

    if (props.deployTestLambda !== undefined) {
      this.createTestFunction(vpc, props.deployTestLambda.endpoint);
    }

    new CfnOutput(this, "VpcAssociationId", {
      value: association.attrId,
      description: "VPC Lattice network VPC association ID",
    });
  }

  /**
   * A test Lambda function that calls the htsget service from inside the associated VPC.
   */
  private createTestFunction(vpc: IVpc, host: string): lambda.Function {
    // The function only needs in-VPC reachability, not internet egress
    // so take whatever subnets the VPC has, preferring non-public ones.
    const subnets =
      vpc.isolatedSubnets.length > 0
        ? vpc.isolatedSubnets
        : vpc.privateSubnets.length > 0
          ? vpc.privateSubnets
          : vpc.publicSubnets;

    return new lambda.Function(this, "TestLambda", {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "index.handler",
      // Only need to bundle the function as compiled js when publishing this library
      // so no NodeJsFunction is needed.
      code: lambda.Code.fromAsset(join(__dirname, "test-lambda"), {
        exclude: ["*.ts"],
      }),
      vpc: vpc,
      vpcSubnets: { subnets },
      environment: {
        LATTICE_SERVICE: host,
      },
      description: "Test Lambda to call the shared htsget VPC Lattice service",
      timeout: Duration.seconds(300),
    });
  }
}
