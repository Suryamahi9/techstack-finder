import { buildServer } from "./server.js";

function parseArg(args, name) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : undefined;
}

const args = process.argv.slice(2);
const transport = parseArg(args, "--transport") || process.env.TSF_TRANSPORT || "stdio";
const port = Number(parseArg(args, "--port") || process.env.TSF_PORT || "3001");
const host = parseArg(args, "--host") || process.env.TSF_HOST || "0.0.0.0";

const server = buildServer();

if (transport === "http") {
  const { startHttpServer } = await import("./http.js");
  startHttpServer(server, { port, host });
} else {
  const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
  const stdio = new StdioServerTransport();
  await server.connect(stdio);
  console.error("techstack-finder MCP server running over stdio");
}
