import http from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { buildServer } from "./server.js";

const NAME = "techstack-finder";
const VERSION = "1.0.0";

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve(null);
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers": "Mcp-Session-Id",
  });
  res.end(JSON.stringify(body));
}

function methodNotAllowed(res) {
  sendJson(res, 405, {
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed." },
    id: null,
  });
}

export function startHttpServer(_server, { port, host }) {
  const httpServer = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, Authorization, MCP-Protocol-Version",
      });
      return res.end();
    }

    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
      return sendJson(res, 200, { ok: true, name: NAME, version: VERSION, endpoint: "/mcp" });
    }

    if (url.pathname !== "/mcp") {
      return sendJson(res, 404, { error: "Not found" });
    }

    if (req.method !== "POST") {
      return methodNotAllowed(res);
    }

    let body;
    try {
      body = await readBody(req);
    } catch (err) {
      return sendJson(res, 400, {
        jsonrpc: "2.0",
        error: { code: -32700, message: err.message || "Parse error" },
        id: null,
      });
    }

    // Stateless Streamable HTTP: a fresh server + transport per request.
    const server = buildServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
      res.on("close", () => {
        transport.close().catch(() => {});
        server.close().catch(() => {});
      });
    } catch (err) {
      console.error("MCP HTTP error:", err);
      if (!res.headersSent) {
        sendJson(res, 500, {
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  httpServer.listen(port, host, () => {
    console.error(`techstack-finder MCP server listening on http://${host}:${port}/mcp`);
  });
}
