import { Container, getContainer } from "@cloudflare/containers";
import { Hono } from "hono";

export class MyContainer extends Container {
  // Port the container listens on (default: 8080)
  defaultPort = 8080;
  // Time before container sleeps due to inactivity (default: 30s)
  sleepAfter = "2m";
  // Environment variables passed to the container
  envVars = {
    MESSAGE: "I was passed in via the container class!",
  };

  // Optional lifecycle hooks
  override onStart() {
    console.log("Container successfully started");
  }

  override onStop() {
    console.log("Container successfully shut down");
  }

  override onError(error: unknown) {
    console.log("Container error:", error);
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
  return await container.fetch(c.req.raw);
});

// Route requests to a specific container using the container ID
app.get("/variants/:id", async (c) => {
  const container = getContainer(c.env.MY_CONTAINER);
  return await container.fetch(c.req.raw);
});

// Demonstrate error handling - this route forces a panic in the container
app.get("/error", async (c) => {
  const container = getContainer(c.env.MY_CONTAINER, "error-test");
  return await container.fetch(c.req.raw);
});

export default app;

