**@umccr/htsget-vpc-lattice**

***

# @umccr/htsget-vpc-lattice

## HtsgetVpcLatticeConsumer

Defined in: [htsget-vpc-lattice-consumer.ts:20](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-consumer.ts#L20)

Construct used to consume an htsget VPC Lattice service network shared from another
account. This construct associated the VPC in this account with the service network from
the producer construct.

The VPC lattice construct needs to be first be deployed in the producer account before
the consumer is able to use it. It is expected that the provider share is active before
deploying the consumer. It may be required to accept the lattice share in the consumer
account before deploying the consumer stack, unless the accounts are in the same organisation.

### Extends

- `Construct`

### Constructors

#### Constructor

> **new HtsgetVpcLatticeConsumer**(`scope`, `id`, `props`): [`HtsgetVpcLatticeConsumer`](#htsgetvpclatticeconsumer)

Defined in: [htsget-vpc-lattice-consumer.ts:21](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-consumer.ts#L21)

##### Parameters

###### scope

`Construct`

###### id

`string`

###### props

[`HtsgetVpcLatticeConsumerProps`](#htsgetvpclatticeconsumerprops)

##### Returns

[`HtsgetVpcLatticeConsumer`](#htsgetvpclatticeconsumer)

##### Overrides

`Construct.constructor`

***

## HtsgetVpcLatticeProducer

Defined in: [htsget-vpc-lattice-producer.ts:34](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-producer.ts#L34)

Construct used to deploy htsget-lambda as a VPC Lattice service. This is the provider
construct, which sets up the sharing in the data-holding account. It holds the actual
htsget-rs deployment. This should be paired with the `HtsgetVpcLatticeConsumer` which
associates a consumer VPC with the lattice share.

### Extends

- `Construct`

### Constructors

#### Constructor

> **new HtsgetVpcLatticeProducer**(`scope`, `id`, `props`): [`HtsgetVpcLatticeProducer`](#htsgetvpclatticeproducer)

Defined in: [htsget-vpc-lattice-producer.ts:45](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-producer.ts#L45)

##### Parameters

###### scope

`Construct`

###### id

`string`

###### props

[`HtsgetVpcLatticeProducerProps`](#htsgetvpclatticeproducerprops)

##### Returns

[`HtsgetVpcLatticeProducer`](#htsgetvpclatticeproducer)

##### Overrides

`Construct.constructor`

### Properties

#### service

> `readonly` **service**: `CfnService`

Defined in: [htsget-vpc-lattice-producer.ts:43](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-producer.ts#L43)

The VPC Lattice service htsget-lambda function.

#### serviceNetwork

> `readonly` **serviceNetwork**: `CfnServiceNetwork`

Defined in: [htsget-vpc-lattice-producer.ts:38](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-producer.ts#L38)

The VPC Lattice service network which is shared to destination accounts.

***

## HtsgetVpcLatticeConsumerProps

Defined in: [htsget-vpc-lattice-props.ts:158](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L158)

Settings for the htsget VPC Lattice consumer construct.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="property-deploytestlambda"></a> `deployTestLambda?` | `object` | `undefined, no test function is deployed` | Deploy a test Lambda function inside the VPC that calls the htsget service that can be used to verify that everything is working. | [htsget-vpc-lattice-props.ts:184](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L184) |
| `deployTestLambda.endpoint` | `string` | `undefined` | The host name of the htsget service, e.g. `htsget.example.com`. | [htsget-vpc-lattice-props.ts:188](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L188) |
| <a id="property-securitygroupids"></a> `securityGroupIds?` | `string`[] | `undefined, allows all VPC traffic` | Security group ids to apply to the VPC association. | [htsget-vpc-lattice-props.ts:176](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L176) |
| <a id="property-servicenetworkarn"></a> `serviceNetworkArn` | `string` | `undefined` | The ARN of the VPC Lattice network shared from the provider account. This is the `ServiceNetworkArn` output of the provider stack. | [htsget-vpc-lattice-props.ts:163](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L163) |
| <a id="property-vpcorname"></a> `vpcOrName` | `string` \| `IVpc` | `undefined` | The VPC or VPC name to associate with the shared network. This VPC is used to reach the htsget deployment from the producer. | [htsget-vpc-lattice-props.ts:169](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L169) |

***

## HtsgetVpcLatticeProducerProps

Defined in: [htsget-vpc-lattice-props.ts:9](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L9)

Settings related to the htsget VPC Lattice lambda construct props.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="property-broads3read"></a> `broadS3Read?` | `boolean` | `false` | Attach `AmazonS3ReadOnlyAccess` to the role created by this construct. This is needed for dynamic locations that come in through `environment_override` or an authorization server. | [htsget-vpc-lattice-props.ts:133](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L133) |
| <a id="property-build"></a> `build?` | `object` | `undefined` | Options for building htsget-rs. Ignored when `lambdaCodePath` is set. | [htsget-vpc-lattice-props.ts:22](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L22) |
| `build.buildEnvironment?` | `Record`\<`string`, `string`\> | `undefined` | Override the environment variables used to build htsget. Note that this only adds environment variables that get used to build htsget-rs with `cargo`. It has no effect on the environment variables that htsget-rs has when the Lambda function is deployed. In general, leave this undefined unless there is a specific reason to override the build environment. | [htsget-vpc-lattice-props.ts:54](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L54) |
| `build.cargoLambdaFlags?` | `string`[] | `undefined` | Override any cargo lambda flags for the build. By default, features are resolved automatically based on the config and `HtsgetLocation[]`. This option overrides that and any automatically added flags. | [htsget-vpc-lattice-props.ts:44](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L44) |
| `build.gitForceClone?` | `boolean` | `false` | Whether to force a git clone for every build. If this is false, then the git repo is only cloned once for every git reference in a temporary directory. Otherwise, the repo is cloned every time. | [htsget-vpc-lattice-props.ts:36](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L36) |
| `build.gitReference?` | `string` | `"main"` | The git reference to fetch from the htsget-rs repo. | [htsget-vpc-lattice-props.ts:28](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L28) |
| `build.runtime?` | `"provided.al2023"` \| `"provided.al2"` | `uses provided.al2023` | Specify the runtime for the deployed htsget Lambda function. | [htsget-vpc-lattice-props.ts:61](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L61) |
| <a id="property-destinationaccounts"></a> `destinationAccounts` | `string`[] | `undefined` | A list of AWS account ids that the VPC Lattice service network will be shared to using RAM. | [htsget-vpc-lattice-props.ts:138](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L138) |
| <a id="property-functionname"></a> `functionName?` | `string` | `undefined` | The name of the Lambda function. | [htsget-vpc-lattice-props.ts:76](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L76) |
| <a id="property-hostedzoneorid"></a> `hostedZoneOrId?` | `string` \| `IHostedZone` | undefined, looks up the zone from `naming.domain` | Use the hosted zone instead of looking it up from the domain name. Pass an `IHostedZone` to use it directly, or a hosted zone id string to build the zone from that id (using `naming.domain` as the zone name). Passing the id avoids a Route53 context lookup at synth time, which is useful in pipelines that deploy across accounts. | [htsget-vpc-lattice-props.ts:109](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L109) |
| <a id="property-htsgetconfig"></a> `htsgetConfig?` | `HtsgetConfig` | `undefined` | The htsget-rs config options. Use this to specify any locations and htsget-rs options. | [htsget-vpc-lattice-props.ts:15](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L15) |
| <a id="property-lambdacodepath"></a> `lambdaCodePath?` | `string` | `undefined, builds from source` | Deploy a pre-built htsget-lambda artifact. | [htsget-vpc-lattice-props.ts:69](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L69) |
| <a id="property-naming"></a> `naming` | `object` | `undefined` | How to name the VPC Lattice service. | [htsget-vpc-lattice-props.ts:81](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L81) |
| `naming.certificateArn?` | `string` | `undefined, creates a new certificate` | The certificate ARN for SSL corresponding to a wildcard or specific cert for the sub.domain. | [htsget-vpc-lattice-props.ts:98](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L98) |
| `naming.domain` | `string` | `undefined` | The domain name for the htsget server. This assumes that a `HostedZone` exists for this domain. | [htsget-vpc-lattice-props.ts:86](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L86) |
| `naming.subDomain` | `string` | `undefined` | The domain name prefix to use for the htsget-rs server. | [htsget-vpc-lattice-props.ts:91](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L91) |
| <a id="property-role"></a> `role?` | `IRole` | `undefined` | Use the provided role instead of creating one. This will ignore any configuration related to permissions for buckets and secrets, and rely on the existing role. | [htsget-vpc-lattice-props.ts:124](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L124) |
| <a id="property-servicenetworkname"></a> `serviceNetworkName?` | `string` | `"htsget-service-network"` | The name of the VPC Lattice service network. | [htsget-vpc-lattice-props.ts:145](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L145) |
| <a id="property-sharename"></a> `shareName?` | `string` | `"htsget-service-network"` | The name of the RAM resource share. | [htsget-vpc-lattice-props.ts:152](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L152) |
| <a id="property-vpcorname-1"></a> `vpcOrName?` | `string` \| `IVpc` | `undefined` | Specify the VPC or name to lookup for the Lambda function. | [htsget-vpc-lattice-props.ts:116](https://github.com/umccr/htsget-deploy/blob/main/aws-vpc-lattice/lib/htsget-vpc-lattice-props.ts#L116) |
