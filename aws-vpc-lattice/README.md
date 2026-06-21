# htsget-rs on VPC Lattice

Deploys [htsget-rs's htsget-lambda](https://github.com/umccr/htsget-rs) as a [VPC Lattice][vpc-lattice]
service so that it can be shared across AWS accounts.

This library exports two constructs:

- `HtsgetVpcLatticeProducer`: This is the provider side, which holds the data and the htsget-rs deployment.
- `HtsgetVpcLatticeConsumer`: This is the consumer side, which can access the htsget-rs deployment in the
                              producer account via a VPC lattice network sharing setup.

This works by sharing the lattice service using [RAM][ram], which the producer account does into the consumer
account. The consumer account has a VPC associated with the network share, which can be used to call the shared
service without it ever going over the public internet. The consumer account will need to accept the RAM share
in order for this to work, although this can automatically happen if accounts are in the same organisation.

## How requests flow

VPC Lattice invokes the Lambda directly with a [V2 Lattice event][lattice-lambda] and htsget-rs
understands these events natively. The original Lambda event is available to the htsget-rs
[auth context][htsget-auth]. The server can optionally make a decision to authorize the user based on the
caller's VPC, where it's extracted by configuring the JSON path variable into the Lambda event:

```toml
[auth]
forward_extensions = [ { json_path = '$.requestContext.identity.sourceVpcArn', name = 'SourceVpcArn'} ]
```

This allows htsget-rs and an authorization service to make auth decisions based on which VPC the request is
coming from, in a multi consumer account setup.

## Quickstart

First the provider account should be deployed, and then the consumer account. The key CDK constructs
that should be used go into these accounts (note there can be multiple consumer accounts).

### Provider account

This will deploy htsget-rs into the producer account and allow data sharing to occur from there. The
list of consumer accounts must be specified here, which will initiate the RAM share.

```ts
new HtsgetVpcLatticeProducer(this, "Htsget", {
  destinationAccounts: ["<CONSUMER_ACCOUNT_ID>"],
  naming: {
    domain: "example.com",
    subDomain: "htsget",
  },
  htsgetConfig: {
    locations: [{ location: "s3://my-data-bucket" }],
  },
  // optionally associate a VPC in this account to call the service locally
  vpcOrName: "my-vpc",
});
```

The stack outputs `ServiceNetworkArn` which the consumers need. Once the share is active, a consumer
account can discover the ARN by that name rather than copying the output by hand:

```sh
aws vpc-lattice list-service-networks \
  --query "items[?name=='htsget-service-network'].arn | [0]" --output text
```

### Consumer account

This construct allows the account to access the htsget-rs service from the producer account via the
lattice share. The RAM share must be accepted and active first.

```ts
new HtsgetVpcLatticeConsumer(this, "HtsgetConsumer", {
  // the provider's ServiceNetworkArn output, or discover it with list-service-networks (above)
  serviceNetworkArn: "<ServiceNetworkArn>",
  vpcOrName: "my-vpc",
  // optionally deploy a test Lambda that can call htsget-rs from the VPC to verify
  deployTestLambda: { endpoint: "htsget.example.com" },
});
```

### Does it work?

From any client in the associated VPC (or by invoking the test Lambda):

```sh
curl "https://htsget.example.com/reads/service-info"
```

Should return a response similar to the following:

```json
{
  "id": "htsget-lambda/0.5.2",
  "name": "htsget-lambda",
  "version": "0.5.2",
  "description": "A cloud-based instance of htsget-rs using AWS Lambda, which serves data according to the htsget protocol.",
  "documentationUrl": "https://github.com/umccr/htsget-rs",
  "type": {
    "group": "org.ga4gh",
    "artifact": "htsget",
    "version": "1.3.0"
  },
  "htsget": {
    "datatype": "reads",
    "formats": ["BAM", "CRAM"],
    "fieldsParametersEffective": false,
    "tagsParametersEffective": false
  }
}
```

The test Lambda deployed by `deployTestLambda` makes the same call from inside the VPC. Invoke it with
a `path`, and any htsget query parameters:

```sh
aws lambda invoke --function-name <TestLambdaFunctionName> \
  --cli-binary-format raw-in-base64-out \
  --payload '{"path": "/reads/data/htsnexus_test_NA12878", "referenceName": "11", "start": 4900000, "end": 5100000, "format": "BAM", "class": "header"}' \
  response.json
```

## Example deployment

There is an example deployment under [`bin/htsget-vpc-lattice-stack.ts`][example-app]. To deploy it,
change the settings in [`bin/settings.ts`][example-settings].

After editting the settings, the process to deploy is:
1. Authenticate to the producer account.
2. Run:
   ```sh
   pnpm cdk deploy HtsgetVpcLatticeProducerStack
   ```
3. Authenticate to the consumer account, accept the RAM share if required.
4. Run:
   ```sh
   export HTSGET_SERVICE_NETWORK_ARN=$(aws vpc-lattice list-service-networks --query "items[?name=='htsget-service-network'].arn | [0]" --output text)
   pnpm cdk deploy HtsgetVpcLatticeConsumerStack
   ```

[vpc-lattice]: https://docs.aws.amazon.com/vpc-lattice/latest/ug/what-is-vpc-lattice.html
[ram]: https://docs.aws.amazon.com/ram/latest/userguide/what-is.html
[lattice-lambda]: https://docs.aws.amazon.com/vpc-lattice/latest/ug/lambda-functions.html#receive-event-from-service
[htsget-auth]: https://github.com/umccr/htsget-rs/tree/main/htsget-config#authorization
[example-app]: bin/htsget-vpc-lattice-stack.ts
[example-settings]: bin/settings.ts
[htsget-pipeline]: https://github.com/umccr/htsget-pipeline
