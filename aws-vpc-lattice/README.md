## Quickstart

Here's how to deploy [htsget-rs's htsget-lambda](https://github.com/umccr/htsget-rs) to AWS in
a VPC Lattice configuration. This is more a code example rather than a practical deployment.
Code features it has:

1. Construction of VPC Lattice artifacts
2. Deployment of htsget-rs as a Lambda Target Group

To deploy:

1. Authenticate to your AWS account (preferably using SSO).
2. Modify the [`htsget-vpc-lattice-app.ts`][htsget-vpc-lattice-app], according to your preferences.
3. Run `pnpm cdk deploy`.

### Does it work?

The VPC Lattice service network will be shared to the list of AWS accounts
in the app settings. You will need to accept the RAM share in those
accounts in order to then construct a service network client.

Once the service network in the other account is associated with a VPC (say) -
then from that VPC a simple `curl` command should be able to determine that:

```sh
curl "https://<host>/reads/service-info"
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
