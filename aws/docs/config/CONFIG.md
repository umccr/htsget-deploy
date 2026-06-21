**@umccr/htsget-lambda**

***

# @umccr/htsget-lambda

## HtsgetLambda

Defined in: [htsget-lambda.ts:66](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/htsget-lambda.ts#L66)

Construct used to deploy htsget-lambda.

### Extends

- `Construct`

### Constructors

#### Constructor

> **new HtsgetLambda**(`scope`, `id`, `props`): [`HtsgetLambda`](#htsgetlambda)

Defined in: [htsget-lambda.ts:67](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/htsget-lambda.ts#L67)

##### Parameters

###### scope

`Construct`

###### id

`string`

###### props

[`HtsgetLambdaProps`](#htsgetlambdaprops)

##### Returns

[`HtsgetLambda`](#htsgetlambda)

##### Overrides

`Construct.constructor`

### Methods

#### configToEnv()

> `static` **configToEnv**(`config`, `corsConfig?`, `bucket?`, `privateKey?`, `publicKey?`): `Record`\<`string`, `string`\>

Defined in: [htsget-lambda.ts:492](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/htsget-lambda.ts#L492)

Convert JSON config to htsget-rs env representation.

##### Parameters

###### config

[`HtsgetConfig`](#htsgetconfig)

###### corsConfig?

[`CorsConifg`](#corsconifg)

###### bucket?

`Bucket`

###### privateKey?

`Secret`

###### publicKey?

`Secret`

##### Returns

`Record`\<`string`, `string`\>

#### createRole()

> `static` **createRole**(`scope`, `id`, `roleName?`): `Role`

Defined in: [htsget-lambda.ts:385](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/htsget-lambda.ts#L385)

Creates a lambda role with the configured permissions.

##### Parameters

###### scope

`Construct`

###### id

`string`

###### roleName?

`string`

##### Returns

`Role`

#### resolveFeatures()

> `static` **resolveFeatures**(`config`, `bucketSetup`): `string`

Defined in: [htsget-lambda.ts:216](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/htsget-lambda.ts#L216)

Determine the correct features based on the locations.

##### Parameters

###### config

[`HtsgetConfig`](#htsgetconfig)

###### bucketSetup

`boolean`

##### Returns

`string`

#### setPermissions()

> `static` **setPermissions**(`role`, `config`, `bucket?`, `privateKey?`, `publicKey?`): `void`

Defined in: [htsget-lambda.ts:315](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/htsget-lambda.ts#L315)

Set permissions for the Lambda role.

##### Parameters

###### role

`Role`

###### config

[`HtsgetConfig`](#htsgetconfig)

###### bucket?

`Bucket`

###### privateKey?

`Secret`

###### publicKey?

`Secret`

##### Returns

`void`

***

## CorsConifg

Defined in: [config.ts:197](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L197)

CORS configuration for the htsget-rs server.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="property-allowcredentials"></a> `allowCredentials?` | `boolean` | `false` | CORS allow credentials. | [config.ts:203](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L203) |
| <a id="property-allowheaders"></a> `allowHeaders?` | `string`[] | `["*"]` | CORS allow headers. | [config.ts:210](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L210) |
| <a id="property-allowmethods"></a> `allowMethods?` | `CorsHttpMethod`[] | `[CorsHttpMethod.ANY]` | CORS allow methods. | [config.ts:217](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L217) |
| <a id="property-alloworigins"></a> `allowOrigins?` | `string`[] | `["*"]` | CORS allow origins. | [config.ts:224](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L224) |
| <a id="property-exposeheaders"></a> `exposeHeaders?` | `string`[] | `["*"]` | CORS expose headers. | [config.ts:231](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L231) |
| <a id="property-maxage"></a> `maxAge?` | `Duration` | `Duration.days(30)` | CORS max age. | [config.ts:238](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L238) |

***

## HtsgetConfig

Defined in: [config.ts:245](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L245)

Configuration for the htsget-rs server. This allows specifying the options
available in the htsget-rs config: https://github.com/umccr/htsget-rs/tree/main/htsget-config

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="property-environment_override"></a> `environment_override?` | `Record`\<`string`, `unknown`\> | `undefined` | Any additional htsget-rs options can be specified here as environment variables. These will override any options set in this construct, and allows using advanced configuration. Options here should contain the `HTSGET_` prefix. | [config.ts:271](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L271) |
| <a id="property-locations"></a> `locations?` | [`HtsgetLocation`](#htsgetlocation)[] | `[]` | The locations for the htsget-rs server. This is the same as the htsget-rs config locations: https://github.com/umccr/htsget-rs/tree/main/htsget-config#quickstart Any `s3://...` locations will automatically be added to the bucket access policy. | [config.ts:254](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L254) |
| <a id="property-service_info"></a> `service_info?` | `Record`\<`string`, `unknown`\> | `undefined` | Service info fields to configure for the server. This is the same as the htsget-rs config service_info: https://github.com/umccr/htsget-rs/tree/main/htsget-config#service-info-config | [config.ts:262](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L262) |

***

## HtsgetLambdaProps

Defined in: [config.ts:10](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L10)

Settings related to the htsget lambda construct props.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="property-bucketname"></a> `bucketName?` | `string` | `undefined` | The name of the bucket to create when using `copyTestData`. Defaults to the auto-generated CDK construct name. | [config.ts:86](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L86) |
| <a id="property-buildenvironment"></a> `buildEnvironment?` | `Record`\<`string`, `string`\> | `undefined` | Override the environment variables used to build htsget. Note that this only adds environment variables that get used to build htsget-rs with `cargo`. It has no effect on the environment variables that htsget-rs has when the Lambda function is deployed. In general, leave this undefined unless there is a specific reason to override the build environment. | [config.ts:151](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L151) |
| <a id="property-cargolambdaflags"></a> `cargoLambdaFlags?` | `string`[] | `undefined` | Override any cargo lambda flags for the build. By default, features are resolved automatically based on the config and `HtsgetLocation[]`. This option overrides that and any automatically added flags. | [config.ts:68](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L68) |
| <a id="property-certificatearn"></a> `certificateArn?` | `string` | `undefined` | The arn of the certificate to use. This will not create a `Certificate` if specified, and will instead lookup an existing one. | [config.ts:116](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L116) |
| <a id="property-copytestdata"></a> `copyTestData?` | `boolean` | `false` | Copy the test data directory to a new bucket: https://github.com/umccr/htsget-rs/tree/main/data Also copies the Crypt4GH keys to Secrets Manager. Automatically the htsget-rs server access to the bucket and secrets using the locations config. | [config.ts:79](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L79) |
| <a id="property-cors"></a> `cors?` | [`CorsConifg`](#corsconifg) | same as the `CorsConfig` defaults | CORS configuration for the htsget-rs server. Values here are propagated to CORS options in htsget-rs. | [config.ts:45](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L45) |
| <a id="property-domain"></a> `domain?` | `string` | `undefined` | The domain name for the htsget server. This must be specified if `httpApi` is not set. This assumes that a `HostedZone` exists for this domain. | [config.ts:24](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L24) |
| <a id="property-functionname"></a> `functionName?` | `string` | `undefined` | The name of the Lambda function. Defaults to the auto-generated CDK construct name. | [config.ts:93](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L93) |
| <a id="property-gitforceclone"></a> `gitForceClone?` | `boolean` | `false` | Whether to force a git clone for every build. If this is false, then the git repo is only cloned once for every git reference in a temporary directory. Otherwise, the repo is cloned every time. | [config.ts:60](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L60) |
| <a id="property-gitreference"></a> `gitReference?` | `string` | `"main"` | The git reference to fetch from the htsget-rs repo. | [config.ts:52](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L52) |
| <a id="property-hostedzoneorid"></a> `hostedZoneOrId?` | `string` \| `IHostedZone` | `undefined` | Use the hosted zone instead of looking it up from the domain name. Pass an `IHostedZone` to use it directly, or a hosted zone id string to build the zone from that id (using `domain` as the zone name). Passing the id avoids a Route53 context lookup at synth time, which is useful in pipelines that deploy across accounts. | [config.ts:126](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L126) |
| <a id="property-htsgetconfig"></a> `htsgetConfig?` | [`HtsgetConfig`](#htsgetconfig) | `undefined` | The htsget-rs config options. Use this to specify any locations and htsget-rs options. | [config.ts:16](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L16) |
| <a id="property-httpapi"></a> `httpApi?` | `IHttpApi` | `undefined` | Manually specify an `HttpApi`. This will not create a `HostedZone`, any Route53 records, certificates, or authorizers, and will instead rely on the existing `HttpApi`. | [config.ts:108](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L108) |
| <a id="property-jwt"></a> `jwt?` | [`JwtConfig`](#jwtconfig) | `undefined`, defaults to a public deployment | Whether this deployment is gated behind a JWT authorizer, or if its public. | [config.ts:38](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L38) |
| <a id="property-lambdacodepath"></a> `lambdaCodePath?` | `string` | `undefined, builds htsget-rs from source with cargo-lambda` | Deploy a pre-built htsget-lambda artifact instead of compiling htsget-rs from source. Set this to the path of a directory containing the `bootstrap` binary, or to a `bootstrap.zip`, produced by `cargo lambda build --release --arm64` (see the htsget-rs release workflow). This is intended for CI/CD pipelines that build the binary once and deploy the immutable artifact. When set, the source-build options (`gitReference`, `gitForceClone`, `cargoLambdaFlags`, `buildEnvironment`) are ignored. | [config.ts:172](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L172) |
| <a id="property-role"></a> `role?` | `IRole` | `undefined` | Use the provided role instead of creating one. This will ignore any configuration related to permissions for buckets and secrets, and rely on the existing role. | [config.ts:134](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L134) |
| <a id="property-rolename"></a> `roleName?` | `string` | `undefined` | The name of the role for the Lambda function. Defaults to the auto-generated CDK construct name. | [config.ts:141](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L141) |
| <a id="property-runtime"></a> `runtime?` | `"provided.al2023"` \| `"provided.al2"` | `uses provided.al2023` | Specify the runtime for the deployed htsget Lambda function. | [config.ts:158](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L158) |
| <a id="property-subdomain"></a> `subDomain?` | `string` | `"htsget"` | The domain name prefix to use for the htsget-rs server. | [config.ts:31](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L31) |
| <a id="property-vpc"></a> `vpc?` | `IVpc` | `undefined` | Optionally specify a VPC for the Lambda function. | [config.ts:100](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L100) |

***

## HtsgetLocation

Defined in: [config.ts:277](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L277)

Config for locations.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="property-location"></a> `location` | `string` | `undefined` | The location string. | [config.ts:281](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L281) |
| <a id="property-private_key"></a> `private_key?` | `string` | `undefined` | Optional Crypt4GH private key secret ARN or name. | [config.ts:287](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L287) |
| <a id="property-public_key"></a> `public_key?` | `string` | `undefined` | Optional Crypt4GH public key secret ARN or name. | [config.ts:293](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L293) |

***

## JwtConfig

Defined in: [config.ts:178](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L178)

JWT authorization settings.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="property-audience"></a> `audience?` | `string`[] | `[]` | The JWT audience. | [config.ts:184](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L184) |
| <a id="property-coguserpoolid"></a> `cogUserPoolId?` | `string` | `undefined`, creates a new user pool | The cognito user pool id for the authorizer. If this is not set, then a new user pool is created. | [config.ts:191](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L191) |
