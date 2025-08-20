import { Container, getContainer } from "@cloudflare/containers";
import { Hono } from "hono";

interface EnvWithCustomVariables extends Env {
  R2_TOKEN: string;
  AWS_ENDPOINT: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  R2_BUCKET: string;
  // Htsget
  HTSGET_LOCATIONS: string;
  // Rust debugging
  RUST_LOG: string;
  LOG_SENSITIVE_BODIES: string;
}

export class MyContainer extends Container<EnvWithCustomVariables> {
  constructor(ctx: DurableObjectState, env: EnvWithCustomVariables) {
    super(ctx, env);

    // Port the container listens on (default: 8080)
    this.defaultPort = 8080;

    this.envVars = {
      AWS_ACCESS_KEY_ID: env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: env.AWS_SECRET_ACCESS_KEY,
      R2_BUCKET: env.R2_BUCKET,
      HTSGET_LOCATIONS: env.HTSGET_LOCATIONS,
      AWS_REGION: "auto", // Otherwise S3 sdk will error out: ResolveEndpointError { message: "A region must be set when sending requests to S3. }. Can also be safely set to 'us-east-1'"
      // RUST_LOG:
      //   "trace,htsget_lambda=trace,htsget_lambda=trace,htsget_config=trace,htsget_http=trace,htsget_search=trace,htsget_test=trace",
      LOG_SENSITIVE_BODIES: "false", // aws-sdk-rust will show ALL trace info
      LOG_SIGNABLE_BODY: "false", // will log sensitive data
    };
  }
}

// Create Hono app with proper typing for Cloudflare Workers
const app = new Hono<{
  Bindings: {
    MY_CONTAINER: DurableObjectNamespace<MyContainer>;
    ASSETS: Fetcher;
    MY_BUCKET: R2Bucket;
  };
}>();

// Home route with available endpoints
app.get("/", (c) => {
  return c.env.ASSETS.fetch("index.html");
});

// Route requests to a specific container using the container ID
app.get("/*", async (c) => {
  const container = getContainer(c.env.MY_CONTAINER);
  return await container.containerFetch(c.req.raw);
});

export default app;
