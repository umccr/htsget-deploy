# htsget-deploy

Deploys a cloud-based implementation of [htsget-rs]. This project provides several ways to deploy
htsget-rs, depending on where the data lives and how it needs to be accessed:

- [**AWS API Gateway**][aws-deploy]: a reusable CDK construct that deploys
  htsget-lambda using AWS [API Gateway][aws-api-gateway] function and optional JWT authorization.
- [**AWS VPC Lattice**][aws-vpc-lattice-deploy]: CDK constructs that deploy htsget-lambda as a
  [VPC Lattice][vpc-lattice] service and share it across AWS accounts using [RAM][ram], so the
  data in a producer account can be accessed securely via a VPC from consumer account.
- [**Cloudflare Containers**][cloudflare-deploy]: a [Cloudflare Containers][cloudflare-containers]
  Wrangler configuration that deploys [htsget-rs], using htsget-axum.


[htsget-rs]: https://github.com/umccr/htsget-rs
[aws-deploy]: aws/README.md
[aws-vpc-lattice-deploy]: aws-vpc-lattice/README.md
[cloudflare-deploy]: cloudflare/README.md
[cloudflare-containers]: https://developers.cloudflare.com/containers/
[aws-api-gateway]: https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html
[vpc-lattice]: https://docs.aws.amazon.com/vpc-lattice/latest/ug/what-is-vpc-lattice.html
[ram]: https://docs.aws.amazon.com/ram/latest/userguide/what-is.html
