import { Container, getContainer } from "@cloudflare/containers";
import { Hono } from "hono";

interface EnvWithCustomVariables extends Env {
  R2_TOKEN: string;
  R2_ENDPOINT: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET: string;
  // Htsget
  HTSGET_LOCATIONS: string;
  RUST_LOG: string;
}

export class MyContainer extends Container<EnvWithCustomVariables> {
  constructor(ctx: DurableObjectState, env: EnvWithCustomVariables) {
        super(ctx, env);

        // Port the container listens on (default: 8080)
        this.defaultPort = 8080;

        this.envVars = {
          AWS_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
          AWS_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
          R2_BUCKET: env.R2_BUCKET,
          HTSGET_LOCATIONS: env.HTSGET_LOCATIONS,
          AWS_DEFAULT_REGION: "auto", // Otherwise S3 sdk will error out: ResolveEndpointError { message: "A region must be set when sending requests to S3."
          RUST_LOG: 'info,htsget_lambda=trace,htsget_lambda=trace,htsget_config=trace,htsget_http=trace,htsget_search=trace,htsget_test=trace'
        };
    }
}

// Create Hono app with proper typing for Cloudflare Workers
const app = new Hono<{
  Bindings: { MY_CONTAINER: DurableObjectNamespace<MyContainer>,
              MY_BUCKET: R2Bucket,
              // MY_SECRETS: SecretsStoreSecret
   };
}>();

// Home route with available endpoints
app.get("/", (c) => {
  return c.text(
    "Available endpoints:\n" +
      "GET /reads/<ID> - Query alignment objects\n" +
      "GET /variants/<ID> - Query variant objects",
  );
});

// Route requests to a specific container using the container ID
app.get("/*", async (c) => {
  const container = getContainer(c.env.MY_CONTAINER);
  return await container.containerFetch(c.req.raw);
});

export default app;

