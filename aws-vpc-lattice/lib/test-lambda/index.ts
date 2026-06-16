import { request } from "node:https";

/**
 * The event for this test function. Specifies the htsget path to request along with optional
 * query parameters.
 */
interface TestEvent {
  /**
   * The htsget path to request. Defaults to `/reads/service-info`.
   */
  path?: string;

  /**
   * The reference sequence name to query.
   */
  referenceName?: string;

  /**
   * The 0-based start coordinate of the query range.
   */
  start?: number;

  /**
   * The 0-based end coordinate of the query range.
   */
  end?: number;

  /**
   * The requested format.
   */
  format?: string;

  /**
   * Request only the `header` or `body` of the response.
   */
  class?: "header" | "body";
}

/**
 * The parts of the response from the htsget VPC Lattice service.
 */
interface LatticeResponse {
  statusCode?: number;
  body: string;
}

/**
 * Call the htsget VPC Lattice service from inside the VPC and return its response.
 */
export const handler = async (event: TestEvent) => {
  const host = process.env.LATTICE_SERVICE;
  const path = buildPath(event);

  if (host === undefined) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "LATTICE_SERVICE environment variable is not set",
      }),
    };
  }

  console.log("Calling VPC Lattice service:", `https://${host}${path}`);

  try {
    const response = await get(host, path);
    console.log("VPC Lattice response:", response);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Successfully called VPC Lattice service",
        latticeResponse: {
          statusCode: response.statusCode,
          body: JSON.parse(response.body) as unknown,
          timestamp: new Date().toISOString(),
        },
      }),
    };
  } catch (error) {
    const err = error as Error;
    console.error("Error calling VPC Lattice:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to call VPC Lattice service",
        message: err.message,
        stack: err.stack,
      }),
    };
  }
};

/**
 * Build the request path from the event.
 */
function buildPath(event: TestEvent): string {
  const path = event.path ?? "/reads/service-info";

  const params = new URLSearchParams();
  if (event.referenceName !== undefined) {
    params.set("referenceName", event.referenceName);
  }
  if (event.start !== undefined) {
    params.set("start", event.start.toString());
  }
  if (event.end !== undefined) {
    params.set("end", event.end.toString());
  }
  if (event.format !== undefined) {
    params.set("format", event.format);
  }
  if (event.class !== undefined) {
    params.set("class", event.class);
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

/**
 * Perform a GET request against the host and path.
 */
function get(host: string, path: string): Promise<LatticeResponse> {
  return new Promise((resolve, reject) => {
    const req = request(
      {
        hostname: host,
        port: 443,
        path,
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
      (res) => {
        let body = "";
        res
          .on("data", (chunk: Buffer) => {
            body += chunk.toString();
          })
          .on("end", () => {
            resolve({ statusCode: res.statusCode, body });
          });
      },
    );

    req
      .on("error", reject)
      .setTimeout(300, () => {
        req.destroy();
        reject(new Error("Request timeout"));
      })
      .end();
  });
}
