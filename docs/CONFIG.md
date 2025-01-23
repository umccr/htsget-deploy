**htsget-lambda**

***

# htsget-lambda

## CorsConifg

Defined in: [lib/config.ts:118](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L118)

CORS configuration for the htsget-rs server.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="allowcredentials"></a> `allowCredentials?` | `boolean` | `false` | CORS allow credentials. | [lib/config.ts:124](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L124) |
| <a id="allowheaders"></a> `allowHeaders?` | `string`[] | `["*"]` | CORS allow headers. | [lib/config.ts:131](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L131) |
| <a id="allowmethods"></a> `allowMethods?` | `CorsHttpMethod`[] | `[CorsHttpMethod.ANY]` | CORS allow methods. | [lib/config.ts:138](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L138) |
| <a id="alloworigins"></a> `allowOrigins?` | `string`[] | `["*"]` | CORS allow origins. | [lib/config.ts:145](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L145) |
| <a id="exposeheaders"></a> `exposeHeaders?` | `string`[] | `["*"]` | CORS expose headers. | [lib/config.ts:152](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L152) |
| <a id="maxage"></a> `maxAge?` | `Duration` | `Duration.days(30)` | CORS max age. | [lib/config.ts:159](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L159) |

***

## HtsgetConfig

Defined in: [lib/config.ts:166](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L166)

Configuration for the htsget-rs server. Options here are a subset of the options
available in the htsget-rs config: https://github.com/umccr/htsget-rs/tree/main/htsget-config

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="environment_override"></a> `environment_override?` | `Record`\<`string`, `object`\> | `undefined` | Any additional htsget-rs options can be specified here as environment variables. These will override any options set in this construct, and allows using advanced configuration. | [lib/config.ts:191](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L191) |
| <a id="locations"></a> `locations` | [`HtsgetLocation`](CONFIG.md#htsgetlocation)[] | `[]` | The locations for the htsget-rs server. This is the same as the htsget-rs config locations: https://github.com/umccr/htsget-rs/tree/main/htsget-config#quickstart Any `s3://...` locations will automatically be added to the bucket access policy. | [lib/config.ts:175](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L175) |
| <a id="service_info"></a> `service_info?` | `Record`\<`string`, `object`\> | `undefined` | Service info fields to configure for the server. This is the same as the htsget-rs config service_info: https://github.com/umccr/htsget-rs/tree/main/htsget-config#service-info-config | [lib/config.ts:183](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L183) |

***

## HtsgetLambdaProps

Defined in: [lib/config.ts:10](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L10)

Settings related to the htsget lambda construct props.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="copytestdata"></a> `copyTestData?` | `boolean` | `false` | Copy the test data directory to a new bucket: https://github.com/umccr/htsget-rs/tree/main/data Also copies the Crypt4GH keys to Secrets Manager. Gives the htsget-rs server access to the bucket and secrets using the locations config. | [lib/config.ts:63](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L63) |
| <a id="corsconfig"></a> `corsConfig?` | [`CorsConifg`](CONFIG.md#corsconifg) | same as the `CorsConfig` defaults | CORS configuration for the htsget-rs server. | [lib/config.ts:45](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L45) |
| <a id="domain"></a> `domain?` | `string` | `undefined` | The domain name for the htsget server. This must be specified if `httpApi` is not set. This assumes that a `HostedZone` exists for this domain. | [lib/config.ts:24](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L24) |
| <a id="gitreference"></a> `gitReference?` | `string` | `"main"` | The git reference to fetch from the htsget-rs repo. | [lib/config.ts:52](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L52) |
| <a id="hostedzone"></a> `hostedZone?` | `HostedZone` | `undefined` | Use the provided hosted zone instead of looking it up from the domain name. | [lib/config.ts:85](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L85) |
| <a id="htsgetconfig-1"></a> `htsgetConfig?` | [`HtsgetConfig`](CONFIG.md#htsgetconfig) | `undefined` | The htsget-rs config options. | [lib/config.ts:16](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L16) |
| <a id="httpapi"></a> `httpApi?` | `HttpApi` | `undefined` | Manually specify an `HttpApi`. This will not create a `HostedZone`, any Route53 records, certificates, or authorizers, and will instead rely on the existing `HttpApi`. | [lib/config.ts:78](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L78) |
| <a id="jwtauthorizer"></a> `jwtAuthorizer?` | [`JwtAuthConfig`](CONFIG.md#jwtauthconfig) | `undefined`, defaults to a public deployment | Whether this deployment is gated behind a JWT authorizer, or if its public. | [lib/config.ts:38](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L38) |
| <a id="role"></a> `role?` | `Role` | `undefined` | Use the provided role instead of creating one. This will ignore any configuration related to permissions for buckets and secrets, and rely on the existing role. | [lib/config.ts:93](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L93) |
| <a id="subdomain"></a> `subDomain?` | `string` | `"htsget"` | The domain name prefix to use for the htsget-rs server. | [lib/config.ts:31](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L31) |
| <a id="vpc"></a> `vpc?` | `IVpc` | `undefined` | Optionally specify a VPC for the Lambda function. | [lib/config.ts:70](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L70) |

***

## HtsgetLocation

Defined in: [lib/config.ts:197](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L197)

Config for locations.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="location"></a> `location` | `string` | `undefined` | The location string. | [lib/config.ts:201](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L201) |
| <a id="private_key"></a> `private_key?` | `string` | `undefined` | Optional Crypt4GH private key secret ARN or name. | [lib/config.ts:207](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L207) |
| <a id="public_key"></a> `public_key?` | `string` | `undefined` | Optional Crypt4GH public key secret ARN or name. | [lib/config.ts:213](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L213) |

***

## JwtAuthConfig

Defined in: [lib/config.ts:99](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L99)

JWT authorization settings.

### Properties

| Property | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="coguserpoolid"></a> `cogUserPoolId?` | `string` | `creates a new user pool ``` | The cognito user pool id for the authorizer. If this is not set, then a new user pool is created. | [lib/config.ts:112](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L112) |
| <a id="jwtaudience"></a> `jwtAudience?` | `string`[] | `[]` | The JWT audience. | [lib/config.ts:105](https://github.com/umccr/htsget-deploy/blob/47b9ac8b50ecd4f671a746dda2b401f019e2aa8e/lib/config.ts#L105) |
