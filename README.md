# htsget-deploy

Deploy a cloud-based implementation of [htsget-rs]. This project contains a reusable CDK construct that deploys
[htsget-lambda] using an AWS [API Gateway][aws-api-gateway] function and an example CDK stack.

## Quickstart

Here's how to deploy [htsget-rs's htsget-lambda](https://github.com/umccr/htsget-rs) to AWS:

1. Authenticate to your AWS account (preferably using SSO).
2. Modify the [`bin/settings.ts`][htsget-settings], according to your preferences. All options are documented at [`docs/CONFIG.md`][docs-config]
3. Run `npm install && cdk deploy`.

### Does it work?

A simple `curl` command should be able to determine that:

```sh
curl "https://htsget.ga4gh-demo.org/reads/service-info"
```

Should return a response similar to the following one (some fields elided for brevity):

```json
{
  "id": "",
  "name": "GA4GH",
  "version": "0.1",
  "organization": {
    "name": "GA4GH",
    "url": "https://ga4gh.org/"
  },
  "type": {
    "group": "",
    "artifact": "",
    "version": ""
  },
  "htsget": {
    "datatype": "reads",
    "formats": [
      "BAM",
      "CRAM"
    ],
    "fieldsParametersEffective": false,
    "tagsParametersEffective": false
  },
  "contactUrl": "https://ga4gh.org/",
  "documentationUrl": "https://github.com/umccr/htsget-rs",
  "createdAt": "",
  "updatedAt": "",
  "environment": "dev"
}
```

Please note that the example above assumes a publicly accessible endpoint. If you have an authz'd deployment, please add `-H "Authorization: $JWT_TOKEN"` flags to your `curl` command.

## Library

The `HtsgetConstruct` is [published][htsget-npm] as an NPM package so that it can be used as construct in other projects.

## Local development

This project uses pnpm as the preferred package manager. To install and update the lock file, run:

```sh
pnpm install
```

To generate the [config docs][docs-config], run:

```sh
npx typedoc
```

[htsget-npm]: https://www.npmjs.com/package/htsget-lambda
[docs-config]: docs/CONFIG.md
[local]: examples/local_storage/README.md
[examples]: examples
[minio]: examples/minio/README.md
[htsget-lambda-bin]: bin/htsget-lambda.ts
[htsget-lambda-stack]: lib/htsget-lambda-stack.ts
[htsget-settings]: bin/settings.ts
[public-umccr-toml]: config/public_umccr.toml
[htsget-lambda]: ../htsget-lambda
[cargo-lambda]: https://github.com/cargo-lambda/cargo-lambda
[data-events]: ../data/events
[htsget-rs]: https://github.com/umccr/htsget-rs
[htsget-lambda]: ../htsget-lambda
[htsget-config]: ../htsget-config
[config]: config
[aws-cdk]: https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html
[cdk-context]: https://docs.aws.amazon.com/cdk/v2/guide/context.html
[cdk-lookup-value]: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ssm.StringParameter.html#static-valuewbrfromwbrlookupscope-parametername
[cdk-json]: cdk.json
[aws-ssm]: https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html
[aws-api-gateway]: https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html
[aws-cognito]: https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html
[jwt-authorizer]: https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html
[jwt-audience]: https://docs.aws.amazon.com/apigatewayv2/latest/api-reference/apis-apiid-authorizers-authorizerid.html#apis-apiid-authorizers-authorizerid-model-jwtconfiguration
[route-53]: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html
[rust-function]: https://www.npmjs.com/package/rust.aws-cdk-lambda
[aws-cdk]: https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html
[aws-cli]: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
[npm]: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
[rust]: https://www.rust-lang.org/tools/install
[zig]: https://ziglang.org/
[zig-getting-started]: https://ziglang.org/learn/getting-started/
[data]: ../data
