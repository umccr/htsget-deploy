import { IVpc, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

/**
 * Identify whether the passed in object is (probably) a IVpc.
 *
 * @remarks this is just used as a light check between being passed is a string vs a VPC object
 *          it is not meant to be some sort of definitional test for VPCs
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access */
export function isIVpc(obj: any): obj is IVpc {
  return (
    obj && typeof obj.vpcId === "string" && typeof obj.vpcCidrBlock === "string"
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access */

/**
 * Resolve a VPC from either an `IVpc` or the name of a VPC.
 */
export function resolveVpc(
  scope: Construct,
  id: string,
  vpcOrName: string | IVpc,
): IVpc {
  return isIVpc(vpcOrName)
    ? vpcOrName
    : Vpc.fromLookup(scope, id, {
        vpcName: vpcOrName,
      });
}
