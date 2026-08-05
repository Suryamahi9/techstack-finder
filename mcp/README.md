# TechStack Finder MCP Server

Model Context Protocol server that gives AI assistants access to
[TechStack Finder](https://techstack-finder.vercel.app) — scan any website for its
technology stack and query the market/trends directory.

The server is a thin client over two public HTTP endpoints on the site:

- `POST /api/scan` — tech-stack detection (rate-limited; see `/api/scan` docs)
- `GET /api/trends` — read-only market/trends data (no auth required)

## Tools

| Tool | Description |
| --- | --- |
| `scan_website` | Scan a URL and return the detected stack: frameworks, libraries, CMS, hosting, analytics, security headers, health score, CVEs, GDPR audit, plain-English insights, and the `#XXXX-XXXX` stack fingerprint. |
| `list_technologies` | List the trends directory (sorted by live-site count) with optional `search`, `category`, `limit`, `sort`. |
| `get_technology` | Detail for one technology: live-site counts, market-share history 2018–2026, YoY direction, country breakdown, top sites, related technologies. |
| `get_trends_overview` | Spotlight technologies, top-20 market-share leaders, technology groups, total tracked sites. |
| `compare_technologies` | Compare technologies by market share and trend, sorted by share of websites. |

## Requirements

- Node.js 18+
- A network connection to `https://techstack-finder.vercel.app` (or a custom
  `TSF_API_URL` pointing at a local/dev instance)

## Quick start

```bash
npm install
# stdio mode (default) — for Claude Desktop, Cursor, opencode, etc.
node src/index.js
# HTTP mode — for remote/always-on hosting
node src/index.js --transport http --port 3001
```

### Configuration

| Env var | Default | Description |
| --- | --- | --- |
| `TSF_API_URL` | `https://techstack-finder.vercel.app` | Base URL of the TechStack Finder site. Point at `http://localhost:3000` for a dev instance. |
| `TSF_API_KEY` | *(none)* | `x-api-key` header sent with scans. Recommended: generate one at `/api-keys` on the site. Trends calls are anonymous and don't need it. |
| `TSF_TRANSPORT` | `stdio` | Transport mode: `stdio` or `http`. Override with `--transport`. |
| `TSF_PORT` | `3001` | HTTP port (HTTP mode only). |
| `TSF_HOST` | `0.0.0.0` | Bind address (HTTP mode only). |

`--transport`, `--port`, and `--host` CLI flags take precedence over env vars.

## Client configuration

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "techstack-finder": {
      "command": "node",
      "args": ["C:\\path\\to\\techstack-finder\\mcp\\src\\index.js"],
      "env": {
        "TSF_API_KEY": "tsf_your_key_here"
      }
    }
  }
}
```

### opencode (`opencode.json`)

```json
{
  "mcp": {
    "techstack-finder": {
      "type": "local",
      "command": ["node", "C:\\path\\to\\techstack-finder\\mcp\\src\\index.js"],
      "environment": { "TSF_API_KEY": "tsf_your_key_here" }
    }
  }
}
```

### Remote HTTP (any MCP client that supports Streamable HTTP)

```
https://your-host:3001/mcp
```

## Deployment notes

- **The API lives on Vercel** (`/api/scan`, `/api/trends`). The MCP server is a
  plain Node process — it cannot run as a Vercel serverless function, so run it
  anywhere with a stable network path to the site (your laptop, the Hetzner VPS,
  a small VPS/Render/Fly instance). The HTTP transport is stateless, so it also
  works behind a reverse proxy / pm2.
- **Rate limits**: without a `TSF_API_KEY`, scans use the anonymous tier
  (10 req/min, 50 scans/month). Set `TSF_API_KEY` to a real key for tier limits.
- Scan responses include a `rateLimit` object — clients hitting `429` should
  back off and retry.

## Security

- The server never stores scan results or keys beyond the in-flight call.
- Treat `TSF_API_KEY` as a secret: it is sent only to the `TSF_API_URL` host as
  the `x-api-key` header.
- `/api/trends` is read-only public data; `/api/scan` enforces the site's
  standard rate limits and quotas.
