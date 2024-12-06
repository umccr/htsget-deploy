# Quickstart

Here's how to deploy [htsget-rs's htsget-lambda](https://github.com/umccr/htsget-rs) to AWS:

1. Authenticate to your AWS account (preferably using SSO).
2. Modify the `bin/settings.ts`, according to your preferences.
3. Modify `config/<YOUR_TOML_FILE>.toml` pointed by `bin/settings.ts` accordingly.
4. Run `cdk deploy`.

If the above guidance is insufficient, please refer to the [DEPLOY.md](DEPLOY.md) document for a more in-depth
walkthrough settings and operations.

## Does it work?

A simple `curl` command should be able to determine that:

```sh
curl "https://htsget-demo.ga4gh-demo.org/reads/service-info"
```

Should return a response similar to the following one (some fields elided for brevity):

```json
{
  "name": "umccr-htsget-rs",
  "version": "0.1",
  "organization": {
    "name": "UMCCR",
    "url": "https://umccr.org/"
  },
  "htsget": {
    "datatype": "reads",
    "formats": [
      "BAM",
      "CRAM"
    ]
  },
  "contactUrl": "https://umccr.org/",
  "documentationUrl": "https://github.com/umccr/htsget-rs",
}
```

Please note that the example above assumes a publicly accessible endpoint. If you have an authz'd deployment, please use `-H "Authorization: $JWT_TOKEN"` flags added to your `curl` command.
