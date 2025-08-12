# htsget-deploy

Deploys a cloud-based implementation of [htsget-rs]. This project contains a reusable CDK construct that deploys
htsget-lambda using an AWS [API Gateway][aws-api-gateway] function and an example CDK stack.

Also contains a [Cloudflare Containers][cloudflare-containers] Wrangler configuration to deploy [htsget-rs], using Axum http server variant, to Cloudflare.


[htsget-rs]: https://github.com/umccr/htsget-rs
[cloudflare-containers]: https://developers.cloudflare.com/containers/
[aws-api-gateway]: https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html
