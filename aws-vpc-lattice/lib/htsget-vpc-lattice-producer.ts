import { Architecture, Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { CfnOutput, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  IManagedPolicy,
  ManagedPolicy,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { RustFunction } from "cargo-lambda-cdk";
import { HtsgetVpcLatticeProducerProps } from "./htsget-vpc-lattice-props";
import { IVpc } from "aws-cdk-lib/aws-ec2";
import {
  ARecord,
  HostedZone,
  IHostedZone,
  RecordTarget,
} from "aws-cdk-lib/aws-route53";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import * as vpclattice from "aws-cdk-lib/aws-vpclattice";
import * as ram from "aws-cdk-lib/aws-ram";
import { HtsgetLambda } from "@umccr/htsget-lambda";
import { resolveVpc } from "./vpc";

/**
 * Construct used to deploy htsget-lambda as a VPC Lattice service. This is the provider
 * construct, which sets up the sharing in the data-holding account. It holds the actual
 * htsget-rs deployment. This should be paired with the `HtsgetVpcLatticeConsumer` which
 * associates a consumer VPC with the lattice share.
 */
export class HtsgetVpcLatticeProducer extends Construct {
  /**
   * The VPC Lattice service network which is shared to destination accounts.
   */
  readonly serviceNetwork: vpclattice.CfnServiceNetwork;

  /**
   * The VPC Lattice service htsget-lambda function.
   */
  readonly service: vpclattice.CfnService;

  constructor(
    scope: Construct,
    id: string,
    props: HtsgetVpcLatticeProducerProps,
  ) {
    super(scope, id);

    // we can be passed in an IVpc or the name of a VPC that we will lookup
    const vpc: IVpc | undefined =
      props.vpcOrName === undefined
        ? undefined
        : resolveVpc(this, "Vpc", props.vpcOrName);

    props.htsgetConfig ??= {
      locations: [],
    };

    let lambdaRole: Role | undefined;
    if (props.role == undefined) {
      lambdaRole = this.createRole(
        id,
        vpc !== undefined,
        props.broadS3Read ?? false,
      );
    }

    const htsgetLambda = this.createFunction(props, vpc, lambdaRole);

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

    const url = `${props.naming.subDomain}.${props.naming.domain}`;
    const zone: IHostedZone =
      props.hostedZone ??
      HostedZone.fromLookup(this, "HostedZone", {
        domainName: props.naming.domain,
      });

    const certificateArn =
      props.naming.certificateArn ??
      new Certificate(this, "Certificate", {
        domainName: url,
        validation: CertificateValidation.fromDns(zone),
        certificateName: url,
      }).certificateArn;

    this.serviceNetwork = new vpclattice.CfnServiceNetwork(
      this,
      "HtsgetServiceNetwork",
      {
        // Named explicitly so consumer accounts can discover the shared network ARN.
        name: props.serviceNetworkName ?? "htsget-service-network",
        // htsget lambda itself will do the auth
        authType: "NONE",
      },
    );

    this.service = new vpclattice.CfnService(this, "LatticeService", {
      authType: "NONE",
      customDomainName: url,
      certificateArn,
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
      serviceIdentifier: this.service.attrArn,
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
        serviceIdentifier: this.service.attrId,
        serviceNetworkIdentifier: this.serviceNetwork.attrId,
      },
    );

    // Associate the provider's own VPC so the service can also be called locally.
    if (vpc !== undefined) {
      new vpclattice.CfnServiceNetworkVpcAssociation(this, "VpcAssociation", {
        serviceNetworkIdentifier: this.serviceNetwork.attrId,
        vpcIdentifier: vpc.vpcId,
      });
    }

    new ram.CfnResourceShare(this, "VpcServiceShare", {
      name: props.shareName ?? "htsget-service-network",
      resourceArns: [this.serviceNetwork.attrArn],
      principals: props.destinationAccounts,
    });

    htsgetLambda.addPermission("VpcLatticeInvoke", {
      principal: new ServicePrincipal("vpc-lattice.amazonaws.com"),
      action: "lambda:InvokeFunction",
      sourceArn: targetGroup.attrArn,
    });

    // make an A record pointing at the underlying lattice endpoint
    new ARecord(this, "ServiceARecord", {
      zone: zone,
      recordName: props.naming.subDomain,
      target: RecordTarget.fromAlias({
        bind: () => ({
          dnsName: this.service.attrDnsEntryDomainName,
          hostedZoneId: this.service.attrDnsEntryHostedZoneId,
        }),
      }),
    });

    new CfnOutput(this, "ServiceNetworkId", {
      value: this.serviceNetwork.attrId,
      description: "VPC Lattice Service Network ID",
    });

    // consumer accounts need the ARN to associate their VPC.
    new CfnOutput(this, "ServiceNetworkArn", {
      value: this.serviceNetwork.attrArn,
      description: "VPC Lattice Service Network ARN",
    });

    new CfnOutput(this, "ServiceId", {
      value: this.service.attrId,
      description: "VPC Lattice Service ID",
    });

    new CfnOutput(this, "LambdaFunctionArn", {
      value: htsgetLambda.functionArn,
      description: "Lambda function ARN",
    });
  }

  /**
   * Create the htsget Lambda function, either from a pre-built artifact or by compiling from source.
   */
  private createFunction(
    props: HtsgetVpcLatticeProducerProps,
    vpc?: IVpc,
    lambdaRole?: Role,
  ): Function {
    const role = lambdaRole ?? props.role;

    // Deploy a pre-built artifact instead of compiling htsget-rs from source.
    if (props.lambdaCodePath !== undefined) {
      return new Function(this, "Function", {
        functionName: props.functionName,
        runtime:
          props.build?.runtime === "provided.al2"
            ? Runtime.PROVIDED_AL2
            : Runtime.PROVIDED_AL2023,
        handler: "bootstrap",
        code: Code.fromAsset(props.lambdaCodePath),
        architecture: Architecture.ARM_64,
        memorySize: 128,
        timeout: Duration.seconds(28),
        role,
        vpc,
      });
    }

    return new RustFunction(this, "Function", {
      gitRemote: "https://github.com/umccr/htsget-rs",
      gitForceClone: props.build?.gitForceClone,
      gitReference: props.build?.gitReference,
      functionName: props.functionName,
      binaryName: "htsget-lambda",
      bundling: {
        environment: {
          RUSTFLAGS: "-C target-cpu=neoverse-n1",
          CARGO_PROFILE_RELEASE_LTO: "true",
          CARGO_PROFILE_RELEASE_CODEGEN_UNITS: "1",
          AWS_LAMBDA_HTTP_IGNORE_STAGE_IN_PATH: "true",
          ...props.build?.buildEnvironment,
        },
        cargoLambdaFlags: props.build?.cargoLambdaFlags ?? [
          HtsgetLambda.resolveFeatures(
            props.htsgetConfig ?? { locations: [] },
            false,
          ),
        ],
      },
      memorySize: 128,
      timeout: Duration.seconds(28),
      architecture: Architecture.ARM_64,
      role,
      vpc,
      runtime: props.build?.runtime,
    });
  }

  /**
   * Creates a lambda role with the configured permissions.
   */
  private createRole(id: string, inVpc: boolean, broadS3Read: boolean): Role {
    const managedPolicies: IManagedPolicy[] = [];
    // Broad S3 read is only needed when locations are supplied dynamically.
    if (broadS3Read) {
      managedPolicies.push(
        ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess"),
      );
    }
    if (inVpc) {
      managedPolicies.push(
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole",
        ),
      );
    }

    return new Role(this, "Role", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      description: "Lambda execution role for " + id,
      managedPolicies,
    });
  }
}
