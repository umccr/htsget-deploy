**htsget-lambda**

***

# htsget-lambda

## CorsConifg

Defined in: [aws/lib/config.ts:173](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L173)

CORS configuration for the htsget-rs server.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="allowcredentials"></a> `allowCredentials?` | `boolean` | `false` | CORS allow credentials. | [aws/lib/config.ts:179](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L179) |
| <a id="allowheaders"></a> `allowHeaders?` | `string`[] | `["*"]` | CORS allow headers. | [aws/lib/config.ts:186](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L186) |
| <a id="allowmethods"></a> `allowMethods?` | `CorsHttpMethod`[] | `[CorsHttpMethod.ANY]` | CORS allow methods. | [aws/lib/config.ts:193](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L193) |
| <a id="alloworigins"></a> `allowOrigins?` | `string`[] | `["*"]` | CORS allow origins. | [aws/lib/config.ts:200](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L200) |
| <a id="exposeheaders"></a> `exposeHeaders?` | `string`[] | `["*"]` | CORS expose headers. | [aws/lib/config.ts:207](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L207) |
| <a id="maxage"></a> `maxAge?` | `Duration` | `Duration.days(30)` | CORS max age. | [aws/lib/config.ts:214](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L214) |

***

## HtsgetConfig

Defined in: [aws/lib/config.ts:221](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L221)

Configuration for the htsget-rs server. This allows specifying the options
available in the htsget-rs config: https://github.com/umccr/htsget-rs/tree/main/htsget-config

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="environment_override"></a> `environment_override?` | `Record`\<`string`, `unknown`\> | `undefined` | Any additional htsget-rs options can be specified here as environment variables. These will override any options set in this construct, and allows using advanced configuration. Options here should contain the `HTSGET_` prefix. | [aws/lib/config.ts:247](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L247) |
| <a id="locations"></a> `locations?` | [`HtsgetLocation`](#htsgetlocation)[] | `[]` | The locations for the htsget-rs server. This is the same as the htsget-rs config locations: https://github.com/umccr/htsget-rs/tree/main/htsget-config#quickstart Any `s3://...` locations will automatically be added to the bucket access policy. | [aws/lib/config.ts:230](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L230) |
| <a id="service_info"></a> `service_info?` | `Record`\<`string`, `unknown`\> | `undefined` | Service info fields to configure for the server. This is the same as the htsget-rs config service_info: https://github.com/umccr/htsget-rs/tree/main/htsget-config#service-info-config | [aws/lib/config.ts:238](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L238) |

***

## HtsgetLambdaProps

Defined in: [aws/lib/config.ts:10](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L10)

Settings related to the htsget lambda construct props.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="bucketname"></a> `bucketName?` | `string` | `undefined` | The name of the bucket to create when using `copyTestData`. Defaults to the auto-generated CDK construct name. | [aws/lib/config.ts:86](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L86) |
| <a id="buildenvironment"></a> `buildEnvironment?` | `Record`\<`string`, `string`\> | `undefined` | Override the environment variables used to build htsget. Note that this only adds environment variables that get used to build htsget-rs with `cargo`. It has no effect on the environment variables that htsget-rs has when the Lambda function is deployed. In general, leave this undefined unless there is a specific reason to override the build environment. | [aws/lib/config.ts:148](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L148) |
| <a id="cargolambdaflags"></a> `cargoLambdaFlags?` | `string`[] | `undefined` | Override any cargo lambda flags for the build. By default, features are resolved automatically based on the config and `HtsgetLocation[]`. This option overrides that and any automatically added flags. | [aws/lib/config.ts:68](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L68) |
| <a id="certificatearn"></a> `certificateArn?` | `string` | `undefined` | The arn of the certificate to use. This will not create a `Certificate` if specified, and will instead lookup an existing one. | [aws/lib/config.ts:116](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L116) |
| <a id="copytestdata"></a> `copyTestData?` | `boolean` | `false` | Copy the test data directory to a new bucket: https://github.com/umccr/htsget-rs/tree/main/data Also copies the Crypt4GH keys to Secrets Manager. Automatically the htsget-rs server access to the bucket and secrets using the locations config. | [aws/lib/config.ts:79](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L79) |
| <a id="cors"></a> `cors?` | [`CorsConifg`](#corsconifg) | same as the `CorsConfig` defaults | CORS configuration for the htsget-rs server. Values here are propagated to CORS options in htsget-rs. | [aws/lib/config.ts:45](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L45) |
| <a id="domain"></a> `domain?` | `string` | `undefined` | The domain name for the htsget server. This must be specified if `httpApi` is not set. This assumes that a `HostedZone` exists for this domain. | [aws/lib/config.ts:24](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L24) |
| <a id="functionname"></a> `functionName?` | `string` | `undefined` | The name of the Lambda function. Defaults to the auto-generated CDK construct name. | [aws/lib/config.ts:93](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L93) |
| <a id="gitforceclone"></a> `gitForceClone?` | `boolean` | `false` | Whether to force a git clone for every build. If this is false, then the git repo is only cloned once for every git reference in a temporary directory. Otherwise, the repo is cloned every time. | [aws/lib/config.ts:60](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L60) |
| <a id="gitreference"></a> `gitReference?` | `string` | `"main"` | The git reference to fetch from the htsget-rs repo. | [aws/lib/config.ts:52](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L52) |
| <a id="hostedzone"></a> `hostedZone?` | `IHostedZone` | `undefined` | Use the provided hosted zone instead of looking it up from the domain name. | [aws/lib/config.ts:123](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L123) |
| <a id="htsgetconfig-1"></a> `htsgetConfig?` | [`HtsgetConfig`](#htsgetconfig) | `undefined` | The htsget-rs config options. Use this to specify any locations and htsget-rs options. | [aws/lib/config.ts:16](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L16) |
| <a id="httpapi"></a> `httpApi?` | `IHttpApi` | `undefined` | Manually specify an `HttpApi`. This will not create a `HostedZone`, any Route53 records, certificates, or authorizers, and will instead rely on the existing `HttpApi`. | [aws/lib/config.ts:108](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L108) |
| <a id="jwt"></a> `jwt?` | [`JwtConfig`](#jwtconfig) | `undefined`, defaults to a public deployment | Whether this deployment is gated behind a JWT authorizer, or if its public. | [aws/lib/config.ts:38](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L38) |
| <a id="role"></a> `role?` | `IRole` | `undefined` | Use the provided role instead of creating one. This will ignore any configuration related to permissions for buckets and secrets, and rely on the existing role. | [aws/lib/config.ts:131](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L131) |
| <a id="rolename"></a> `roleName?` | `string` | `undefined` | The name of the role for the Lambda function. Defaults to the auto-generated CDK construct name. | [aws/lib/config.ts:138](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L138) |
| <a id="subdomain"></a> `subDomain?` | `string` | `"htsget"` | The domain name prefix to use for the htsget-rs server. | [aws/lib/config.ts:31](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L31) |
| <a id="vpc"></a> `vpc?` | `IVpc` | `undefined` | Optionally specify a VPC for the Lambda function. | [aws/lib/config.ts:100](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L100) |

***

## HtsgetLocation

Defined in: [aws/lib/config.ts:253](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L253)

Config for locations.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="location"></a> `location` | `string` | `undefined` | The location string. | [aws/lib/config.ts:257](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L257) |
| <a id="private_key"></a> `private_key?` | `string` | `undefined` | Optional Crypt4GH private key secret ARN or name. | [aws/lib/config.ts:263](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L263) |
| <a id="public_key"></a> `public_key?` | `string` | `undefined` | Optional Crypt4GH public key secret ARN or name. | [aws/lib/config.ts:269](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L269) |

***

## JwtConfig

Defined in: [aws/lib/config.ts:154](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L154)

JWT authorization settings.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="audience"></a> `audience?` | `string`[] | `[]` | The JWT audience. | [aws/lib/config.ts:160](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L160) |
| <a id="coguserpoolid"></a> `cogUserPoolId?` | `string` | `undefined`, creates a new user pool | The cognito user pool id for the authorizer. If this is not set, then a new user pool is created. | [aws/lib/config.ts:167](https://github.com/umccr/htsget-deploy/blob/main/aws/lib/config.ts#L167) |
