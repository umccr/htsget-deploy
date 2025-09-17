## Quickstart

Here's how to deploy [htsget-rs's htsget-lambda](https://github.com/umccr/htsget-rs) to AWS:

1. Install packages by running `npm install` or `pnpm install`.
2. Authenticate to your AWS account (preferably using SSO).
3. Modify the [`bin/settings.ts`][htsget-settings], according to your preferences. All options are documented at [`docs/CONFIG.md`][docs-config].
4. Run `npx cdk deploy`.

### Does it work?

A simple `curl` command should be able to determine that:

```sh
curl "https://htsget.ga4gh-demo.org/reads/service-info"
```

Should return a response similar to the following:

```json
{
  "id": "htsget-lambda/0.5.2",
  "createdAt": "2025-01-22T23:29:34.423733522+00:00",
  "name": "htsget-lambda",
  "version": "0.5.2",
  "updatedAt": "2025-01-22T23:29:34.423735886+00:00",
  "description": "A cloud-based instance of htsget-rs using AWS Lambda, which serves data according to the htsget protocol.",
  "organization": {
    "name": "",
    "url": ""
  },
  "documentationUrl": "https://github.com/umccr/htsget-rs",
  "type": {
    "group": "org.ga4gh",
    "artifact": "htsget",
    "version": "1.3.0"
  },
  "htsget": {
    "datatype": "reads",
    "formats": [
      "BAM",
      "CRAM"
    ],
    "fieldsParametersEffective": false,
    "tagsParametersEffective": false
  }
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
[docs-config]: docs/config/CONFIG.md
[htsget-settings]: bin/settings.ts
[cargo-lambda]: https://github.com/cargo-lambda/cargo-lambda
[htsget-rs]: https://github.com/umccr/htsget-rs
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
