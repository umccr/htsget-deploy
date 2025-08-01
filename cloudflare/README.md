# htsget-rs Cloudflare container worker 

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/containers-template)

## Prerequisites

The docker container must be built for `linux/amd64` support explicitly, which is what Cloudflare Docker (Beta) currently supports:

```
docker build --platform="linux/amd64" -t htsget-rs-exposed:latest -f docker/Dockerfile .
```

## Getting Started

First, run:

```bash
npm install
```

Then run the development server (using the package manager of your choice):

```bash
npm run dev
```

Open [http://localhost:8787](http://localhost:8787) with your browser to see the result.

You can start editing your Worker by modifying `src/index.ts` and you can start
editing your Container by editing the content of `container_src`.

## Deploying To Production

First adjust the [CORS config for your R2 bucket](https://developers.cloudflare.com/r2/buckets/cors/) (YMMV):

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:8787",
      "https://htsget-rs.umccr.workers.dev"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD"
    ]
  }
]
```

Then deploy your application to Cloudflare:


| Command          | Action                                |
| :--------------- | :------------------------------------ |
| `npm run deploy` | Deploy your application to Cloudflare |

## Learn More

To learn more about Containers, take a look at the following resources:

- [Container Documentation](https://developers.cloudflare.com/containers/) - learn about Containers
- [Container Class](https://github.com/cloudflare/containers) - learn about the Container helper class

Your feedback and contributions are welcome!