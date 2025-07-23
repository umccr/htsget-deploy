import { Container, getContainer } from "@cloudflare/containers";
import { Hono } from "hono";

interface EnvWithCustomVariables extends Env {
  R2_TOKEN: string;
  R2_ENDPOINT: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET: string;
}


export class MyContainer extends Container<EnvWithCustomVariables> {
  constructor(ctx: DurableObjectState, env: EnvWithCustomVariables) {
        super(ctx, env);
        let envConfig: Record<string, string> = {};

        // Port the container listens on (default: 8080)
        this.defaultPort = 8080;

        // Add R2 Data Catalog credentials if provided -> For Iceberg to work
        if (env.R2_TOKEN && env.R2_ENDPOINT) {
          envConfig = {
            ...envConfig,
            R2_TOKEN: env.R2_TOKEN,
            R2_ENDPOINT: env.R2_ENDPOINT,
          };
        }

        // Add R2 credentials if provided
        if (
          env.R2_ACCESS_KEY_ID &&
          env.R2_SECRET_ACCESS_KEY &&
          env.R2_BUCKET
        ) {
          this.envVars = {
            ...envConfig,
            R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
            R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
            R2_BUCKET: env.R2_BUCKET
          };
        }
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
      "GET /reads/<ID> - Query alignment objects" +
      "GET /variants/<ID> - Query variant objects",
  );
});

// Route requests to a specific container using the container ID
app.get("/reads/:id", async (c) => {
  const container = getContainer(c.env.MY_CONTAINER);
  return await container.containerFetch(c.req.raw);
});

// Route requests to a specific container using the container ID
app.get("/variants/:id", async (c) => {
  const container = getContainer(c.env.MY_CONTAINER);
  return await container.containerFetch(c.req.raw);
});

export default app;

