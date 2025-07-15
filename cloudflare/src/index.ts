import { Container, getContainer } from "@cloudflare/containers";
import { Hono } from "hono";

export class MyContainer extends Container {
  // Port the container listens on (default: 8080)
  defaultPort = 8080;

  // Optional lifecycle hooks
  override onStart() {
    console.log("Container successfully started");
  }

  override onStop() {
    console.log("Container successfully shut down");
  }
}

// Create Hono app with proper typing for Cloudflare Workers
const app = new Hono<{
  Bindings: { MY_CONTAINER: DurableObjectNamespace<MyContainer> };
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

