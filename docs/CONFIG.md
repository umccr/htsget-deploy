**htsget-lambda**

***

# htsget-lambda

## CorsConifg

Defined in: [lib/config.ts:134](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L134)

CORS configuration for the htsget-rs server.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="allowcredentials"></a> `allowCredentials?` | `boolean` | `false` | CORS allow credentials. | [lib/config.ts:140](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L140) |
| <a id="allowheaders"></a> `allowHeaders?` | `string`[] | `["*"]` | CORS allow headers. | [lib/config.ts:147](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L147) |
| <a id="allowmethods"></a> `allowMethods?` | `CorsHttpMethod`[] | `[CorsHttpMethod.ANY]` | CORS allow methods. | [lib/config.ts:154](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L154) |
| <a id="alloworigins"></a> `allowOrigins?` | `string`[] | `["*"]` | CORS allow origins. | [lib/config.ts:161](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L161) |
| <a id="exposeheaders"></a> `exposeHeaders?` | `string`[] | `["*"]` | CORS expose headers. | [lib/config.ts:168](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L168) |
| <a id="maxage"></a> `maxAge?` | `Duration` | `Duration.days(30)` | CORS max age. | [lib/config.ts:175](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L175) |

***

## HtsgetConfig

Defined in: [lib/config.ts:182](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L182)

Configuration for the htsget-rs server. This allows specifying the options
available in the htsget-rs config: https://github.com/umccr/htsget-rs/tree/main/htsget-config

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="environment_override"></a> `environment_override?` | `Record`\<`string`, `unknown`\> | `undefined` | Any additional htsget-rs options can be specified here as environment variables. These will override any options set in this construct, and allows using advanced configuration. Options here should contain the `HTSGET_` prefix. | [lib/config.ts:208](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L208) |
| <a id="locations"></a> `locations?` | [`HtsgetLocation`](CONFIG.md#htsgetlocation)[] | `[]` | The locations for the htsget-rs server. This is the same as the htsget-rs config locations: https://github.com/umccr/htsget-rs/tree/main/htsget-config#quickstart Any `s3://...` locations will automatically be added to the bucket access policy. | [lib/config.ts:191](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L191) |
| <a id="service_info"></a> `service_info?` | `Record`\<`string`, `unknown`\> | `undefined` | Service info fields to configure for the server. This is the same as the htsget-rs config service_info: https://github.com/umccr/htsget-rs/tree/main/htsget-config#service-info-config | [lib/config.ts:199](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L199) |

***

## HtsgetLambdaProps

Defined in: [lib/config.ts:10](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L10)

Settings related to the htsget lambda construct props.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="cargolambdaflags"></a> `cargoLambdaFlags?` | `string`[] | `undefined` | Override any cargo lambda flags for the build. By default, features are resolved automatically based on the config and `HtsgetLocation[]`. This option overrides that and any automatically added flags. | [lib/config.ts:68](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L68) |
| <a id="copytestdata"></a> `copyTestData?` | `boolean` | `false` | Copy the test data directory to a new bucket: https://github.com/umccr/htsget-rs/tree/main/data Also copies the Crypt4GH keys to Secrets Manager. Automatically the htsget-rs server access to the bucket and secrets using the locations config. | [lib/config.ts:79](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L79) |
| <a id="cors"></a> `cors?` | [`CorsConifg`](CONFIG.md#corsconifg) | same as the `CorsConfig` defaults | CORS configuration for the htsget-rs server. Values here are propagated to CORS options in htsget-rs. | [lib/config.ts:45](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L45) |
| <a id="domain"></a> `domain?` | `string` | `undefined` | The domain name for the htsget server. This must be specified if `httpApi` is not set. This assumes that a `HostedZone` exists for this domain. | [lib/config.ts:24](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L24) |
| <a id="gitforceclone"></a> `gitForceClone?` | `boolean` | `false` | Whether to force a git clone for every build. If this is false, then the git repo is only cloned once for every git reference in a temporary directory. Otherwise, the repo is cloned every time. | [lib/config.ts:60](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L60) |
| <a id="gitreference"></a> `gitReference?` | `string` | `"main"` | The git reference to fetch from the htsget-rs repo. | [lib/config.ts:52](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L52) |
| <a id="hostedzone"></a> `hostedZone?` | `HostedZone` | `undefined` | Use the provided hosted zone instead of looking it up from the domain name. | [lib/config.ts:101](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L101) |
| <a id="htsgetconfig-1"></a> `htsgetConfig?` | [`HtsgetConfig`](CONFIG.md#htsgetconfig) | `undefined` | The htsget-rs config options. Use this to specify any locations and htsget-rs options. | [lib/config.ts:16](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L16) |
| <a id="httpapi"></a> `httpApi?` | `HttpApi` | `undefined` | Manually specify an `HttpApi`. This will not create a `HostedZone`, any Route53 records, certificates, or authorizers, and will instead rely on the existing `HttpApi`. | [lib/config.ts:94](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L94) |
| <a id="jwt"></a> `jwt?` | [`JwtConfig`](CONFIG.md#jwtconfig) | `undefined`, defaults to a public deployment | Whether this deployment is gated behind a JWT authorizer, or if its public. | [lib/config.ts:38](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L38) |
| <a id="role"></a> `role?` | `Role` | `undefined` | Use the provided role instead of creating one. This will ignore any configuration related to permissions for buckets and secrets, and rely on the existing role. | [lib/config.ts:109](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L109) |
| <a id="subdomain"></a> `subDomain?` | `string` | `"htsget"` | The domain name prefix to use for the htsget-rs server. | [lib/config.ts:31](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L31) |
| <a id="vpc"></a> `vpc?` | `IVpc` | `undefined` | Optionally specify a VPC for the Lambda function. | [lib/config.ts:86](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L86) |

***

## HtsgetLocation

Defined in: [lib/config.ts:214](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L214)

Config for locations.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="location"></a> `location` | `string` | `undefined` | The location string. | [lib/config.ts:218](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L218) |
| <a id="private_key"></a> `private_key?` | `string` | `undefined` | Optional Crypt4GH private key secret ARN or name. | [lib/config.ts:224](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L224) |
| <a id="public_key"></a> `public_key?` | `string` | `undefined` | Optional Crypt4GH public key secret ARN or name. | [lib/config.ts:230](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L230) |

***

## JwtConfig

Defined in: [lib/config.ts:115](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L115)

JWT authorization settings.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="audience"></a> `audience?` | `string`[] | `[]` | The JWT audience. | [lib/config.ts:121](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L121) |
| <a id="coguserpoolid"></a> `cogUserPoolId?` | `string` | `undefined`, creates a new user pool | The cognito user pool id for the authorizer. If this is not set, then a new user pool is created. | [lib/config.ts:128](https://github.com/umccr/htsget-deploy/blob/4281a956ec485c1c5ee92a71e2fa4782a8a30f9b/lib/config.ts#L128) |
