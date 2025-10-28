import { Architecture } from "aws-cdk-lib/aws-lambda";
import { CfnOutput, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  ManagedPolicy,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { RustFunction } from "cargo-lambda-cdk";
import {
  HtsgetVpcLatticeLambdaProps,
} from "./htsget-vpc-lattice-lambda-props";
import { IVpc, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import * as vpclattice from "aws-cdk-lib/aws-vpclattice";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ram from "aws-cdk-lib/aws-ram";
import { HtsgetLambda } from "htsget-lambda";

/**
 * @ignore
 * Construct used to deploy htsget-lambda as a VPC Lattice endpoint.
 */
export class HtsgetVpcLatticeLambda extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: HtsgetVpcLatticeLambdaProps,
  ) {
    super(scope, id);

    // we can be passed in an IVpc or the name of a VPC that we will lookup
    const vpc: IVpc = this.isIVpc(props.vpcOrName)
      ? props.vpcOrName
      : Vpc.fromLookup(this, "Vpc", {
          vpcName: props.vpcOrName,
        });

    props.htsgetConfig ??= {
      locations: [],
    };

    let lambdaRole: Role | undefined;
    if (props.role == undefined) {
      lambdaRole = this.createRole(id);
    }

    props.build.buildEnvironment ??= {};

    const htsgetLambda = new RustFunction(this, "Function", {
      gitRemote: "https://github.com/umccr/htsget-rs",
      gitForceClone: props.build.gitForceClone,
      gitReference: props.build.gitReference,
      binaryName: "htsget-lambda",
      bundling: {
        environment: {
          RUSTFLAGS: "-C target-cpu=neoverse-n1",
          CARGO_PROFILE_RELEASE_LTO: "true",
          CARGO_PROFILE_RELEASE_CODEGEN_UNITS: "1",
          AWS_LAMBDA_HTTP_IGNORE_STAGE_IN_PATH: "true",
          ...props.build.buildEnvironment,
        },
        cargoLambdaFlags: props.build.cargoLambdaFlags ?? [
          HtsgetLambda.resolveFeatures(props.htsgetConfig, false),
        ],
      },
      memorySize: 128,
      timeout: Duration.seconds(28),
      architecture: Architecture.ARM_64,
      role: lambdaRole ?? props.role,
      vpc: vpc,
    });

    if (lambdaRole !== undefined) {
      HtsgetLambda.setPermissions(lambdaRole, props.htsgetConfig, undefined);
    }

    const env = HtsgetLambda.configToEnv(props.htsgetConfig, undefined);
    for (const key in env) {
      htsgetLambda.addEnvironment(key, env[key]);
    }
    htsgetLambda.addEnvironment("RUST_LOG", "trace");
    // logs are going to cloudwatch so no point in having formatting - so send as json
    htsgetLambda.addEnvironment("HTSGET_FORMATTING_STYLE", "Json");

    //guard.allow_reference_names = ["chr1"]

    const serviceNetwork = new vpclattice.CfnServiceNetwork(
      this,
      "HtsgetServiceNetwork",
      {
        // htsget lambda itself will do the auth
        authType: "NONE",
      },
    );

    const service = new vpclattice.CfnService(this, "LatticeService", {
      authType: "NONE",
      customDomainName: `${props.naming.subDomain}.${props.naming.domain}`,
      certificateArn: props.naming.certificateArn,
    });

    const targetGroup = new vpclattice.CfnTargetGroup(
      this,
      "HtsgetLambdaTargetGroup",
      {
        type: "LAMBDA",
        targets: [
          {
            id: htsgetLambda.functionArn,
          },
        ],
        config: {
          lambdaEventStructureVersion: "V2",
        },
      },
    );

    new vpclattice.CfnListener(this, "HtsgetListener", {
      serviceIdentifier: service.attrArn,
      port: 443,
      protocol: "HTTPS",
      defaultAction: {
        forward: {
          targetGroups: [{ targetGroupIdentifier: targetGroup.attrArn }],
        },
      },
    });

    new vpclattice.CfnServiceNetworkServiceAssociation(
      this,
      "ServiceNetworkAssociation",
      {
        serviceIdentifier: service.attrId,
        serviceNetworkIdentifier: serviceNetwork.attrId,
      },
    );

    new vpclattice.CfnServiceNetworkVpcAssociation(this, "VpcAssociation", {
      serviceNetworkIdentifier: serviceNetwork.attrId,
      vpcIdentifier: vpc.vpcId,
    });

    new ram.CfnResourceShare(this, "VpcServiceShare", {
      name: "htsget-service-network",
      resourceArns: [serviceNetwork.attrArn],
      principals: props.destinationAccounts,
    });

    htsgetLambda.addPermission("VpcLatticeInvoke", {
      principal: new ServicePrincipal("vpc-lattice.amazonaws.com"),
      action: "lambda:InvokeFunction",
      sourceArn: targetGroup.attrArn,
    });

    new lambda.Function(this, "TestLambda", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "index.handler",
      vpc: vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED,
      },
      environment: {
        LATTICE_SERVICE_DNS: service.attrDnsEntryDomainName,
        LATTICE_SERVICE_ID: service.attrId,
        LATTICE_SERVICE: `${props.naming.subDomain}.${props.naming.domain}`,
      },
      code: lambda.Code.fromInline(`
        const https = require('https');

        exports.handler = async (event) => {
          console.log('Test Lambda invoked');

          try {
            const latticeHost = process.env.LATTICE_SERVICE;
            const path = '/variants/HG00096';

            console.log('Calling VPC Lattice service:', \`https://\${latticeHost}\${path}\`);

            const options = {
              hostname: latticeHost,
              port: 443,
              path: path,
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            };

            const response = await new Promise((resolve, reject) => {
              const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({
                  statusCode: res.statusCode,
                  body: data,
                  headers: res.headers
                }));
              });

              req.on('error', (error) => {
                console.error('HTTPS request error:', error);
                reject(error);
              });

              req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
              });

              req.end();
            });

            console.log('VPC Lattice response:', response);

            return {
              statusCode: 200,
              body: JSON.stringify({
                message: 'Successfully called VPC Lattice service',
                latticeResponse: {
                  statusCode: response.statusCode,
                  body: JSON.parse(response.body),
                  timestamp: new Date().toISOString()
                }
              })
            };

          } catch (error) {
            console.error('Error calling VPC Lattice:', error);
            return {
              statusCode: 500,
              body: JSON.stringify({
                error: 'Failed to call VPC Lattice service',
                message: error.message,
                stack: error.stack
              })
            };
          }
        };
      `),
      description: "Test Lambda to call VPC Lattice service-info endpoint",
      timeout: Duration.seconds(30),
    });

    // find the HostedZone corresponding to the domain we are deployed into
    const zone = HostedZone.fromLookup(this, "HostedZone", {
      domainName: props.naming.domain,
    });

    // make an A record pointing at the underlying lattice endpoint
    new ARecord(this, "ServiceARecord", {
      zone: zone,
      recordName: props.naming.subDomain,
      target: RecordTarget.fromAlias({
        bind: () => ({
          dnsName: service.attrDnsEntryDomainName,
          hostedZoneId: service.attrDnsEntryHostedZoneId,
        }),
      }),
    });

    new CfnOutput(this, "ServiceNetworkId", {
      value: serviceNetwork.attrId,
      description: "VPC Lattice Service Network ID",
    });

    new CfnOutput(this, "ServiceId", {
      value: service.attrId,
      description: "VPC Lattice Service ID",
    });

    new CfnOutput(this, "LambdaFunctionArn", {
      value: htsgetLambda.functionArn,
      description: "Lambda function ARN",
    });
  }

  /**
   * Creates a lambda role with the configured permissions.
   */
  private createRole(id: string): Role {
    return new Role(this, "Role", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      description: "Lambda execution role for " + id,
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole",
        ),
        ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess"),
      ],
    });
  }

  /**
   * Identify whether the passed in object is (probably) a IVpc.
   *
   * @param obj
   * @private
   * @remarks this is just used as a light check between being passed in a string v a VPC object
   *          it is not meant to be some sort of definitional test for VPCs
   */
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access */
  private isIVpc(obj: any): obj is IVpc {
    return (
      obj &&
      typeof obj.vpcId === "string" &&
      typeof obj.vpcCidrBlock === "string"
    );
  }
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access */
}
