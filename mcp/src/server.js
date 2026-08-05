import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { tsfFetch, TsfApiError } from "./api.js";

function formatScan(data) {
  const site = data.site || {};
  const lines = [];
  lines.push(`TechStack Finder scan of ${site.url || "-"}`);
  lines.push(`Domain: ${site.domain || "-"}`);
  lines.push(`Title: ${site.title || "-"}`);
  lines.push(`Status: ${site.statusCode ?? "-"} | Health score: ${data.healthScore ?? "-"}/100 | Fingerprint: ${data.fingerprint?.uniqueId ? `#${data.fingerprint.uniqueId}` : "-"}`);
  lines.push(`Industry: ${data.industry?.primary || data.industry || "n/a"}`);
  lines.push(`Technologies detected: ${data.summary?.total ?? 0} (${data.summary?.frontend ?? 0} frontend, ${data.summary?.backend ?? 0} backend, ${data.summary?.infra ?? 0} infra)`);
  lines.push("");

  lines.push("DETECTED TECHNOLOGIES");
  const techs = data.technologies || [];
  if (!techs.length) {
    lines.push("- none detected");
  } else {
    for (const t of techs) {
      const version = t.version ? ` v${t.version}` : "";
      lines.push(`- ${t.name}${version} (${t.category || "unknown"}, confidence: ${t.confidence || "-"})`);
    }
  }

  if (Array.isArray(data.insights) && data.insights.length) {
    lines.push("");
    lines.push("INSIGHTS");
    for (const insight of data.insights) {
      const text = typeof insight === "string" ? insight : insight?.text || JSON.stringify(insight);
      lines.push(`- ${text}`);
    }
  }

  lines.push("");
  lines.push("STRUCTURED SUMMARY (JSON)");
  lines.push(
    JSON.stringify({
      site: data.site,
      summary: data.summary,
      healthScore: data.healthScore,
      fingerprint: data.fingerprint
        ? { uniqueId: data.fingerprint.uniqueId, techCount: data.fingerprint.techCount, dominantType: data.fingerprint.dominantType }
        : null,
      industry: data.industry,
      technologies: techs.map((t) => ({
        name: t.name,
        category: t.category,
        confidence: t.confidence,
        version: t.version,
        type: t.type,
      })),
      categories: (data.categories || []).map((c) => ({ category: c.category, count: c.technologies.length })),
    }, null, 2)
  );

  return lines.join("\n");
}

function formatTechList(data) {
  const lines = [];
  lines.push(`TechStack Finder directory — ${data.count} of ${data.totalLiveSites?.toLocaleString?.("en-US") ?? data.totalLiveSites} tracked live-site instances (updated ${data.updated})`);
  lines.push("");
  for (const t of data.technologies || []) {
    const share = t.currentShare != null ? ` | ${t.currentShare}% of sites${t.yoy ? ` (${t.yoy})` : ""}` : "";
    lines.push(`- ${t.name} (${t.slug}) — ${(t.liveSites ?? 0).toLocaleString("en-US")} live sites, ${(t.indianSites ?? 0).toLocaleString("en-US")} in India${share}`);
  }
  return lines.join("\n");
}

function formatTechDetail(data) {
  const t = data.technology;
  const lines = [];
  lines.push(`${t.name} (${t.slug})`);
  lines.push(`${t.description}`);
  lines.push(`Tags: ${(t.tags || []).join(", ")}`);
  lines.push(`Live sites: ${(t.liveSites ?? 0).toLocaleString("en-US")} | India: ${(t.indianSites ?? 0).toLocaleString("en-US")}`);
  if (t.marketShare) {
    const m = t.marketShare;
    lines.push(`Market share: ${m.currentShare}% of all websites (${m.category}, trend: ${m.trend})`);
    lines.push(`YoY: ${m.yoy?.label ?? "n/a"}`);
    const series = m.data.map((d) => `${d.year}: ${d.share}%`).join(", ");
    lines.push(`Share history: ${series}`);
    if (m.topSites?.length) lines.push(`Top sites: ${m.topSites.join(", ")}`);
  }
  if (t.countries) {
    const c = t.countries;
    lines.push(`Country breakdown — Worldwide: ${(c.WW ?? 0).toLocaleString("en-US")}, India: ${(c.IN ?? 0).toLocaleString("en-US")}, US: ${(c.US ?? 0).toLocaleString("en-US")}, GB: ${(c.GB ?? 0).toLocaleString("en-US")}, DE: ${(c.DE ?? 0).toLocaleString("en-US")}`);
  }
  if (t.relatedTechs?.length) {
    lines.push(`Related technologies: ${t.relatedTechs.map((r) => r.name).join(", ")}`);
  }
  lines.push("");
  lines.push("STRUCTURED DATA (JSON)");
  lines.push(JSON.stringify(t, null, 2));
  return lines.join("\n");
}

function formatOverview(data) {
  const lines = [];
  lines.push(`TechStack Finder trends overview (updated ${data.updated})`);
  lines.push(`Total tracked live-site instances: ${(data.totalLiveSites ?? 0).toLocaleString("en-US")}`);
  lines.push("");
  lines.push("SPOTLIGHT TECHNOLOGIES");
  for (const t of data.spotlight || []) {
    lines.push(`- ${t.name}: ${(t.liveSites ?? 0).toLocaleString("en-US")} live sites, ${(t.indianSites ?? 0).toLocaleString("en-US")} in India`);
  }
  lines.push("");
  lines.push(`TOP MARKET SHARE (${(data.marketShare || []).length})`);
  for (const m of data.marketShare || []) {
    lines.push(`- ${m.name}: ${m.currentShare}% of websites (${m.category}, trend: ${m.trend})`);
  }
  lines.push("");
  lines.push("TECHNOLOGY GROUPS");
  for (const g of data.groups || []) {
    lines.push(`- ${g.name}`);
  }
  lines.push("");
  lines.push(`Directory count: ${data.count ?? 0} technologies (use list_technologies / get_technology for details)`);
  return lines.join("\n");
}

function formatCompare(items, missing) {
  const lines = [];
  lines.push("MARKET SHARE COMPARISON (sorted by share)");
  for (const t of items) {
    const share = t.currentShare != null ? `${t.currentShare}%` : "not tracked";
    lines.push(`- ${t.name}: ${share} of websites (trend: ${t.trend || "n/a"}, ${t.yoy || "n/a"}), ${(t.liveSites ?? 0).toLocaleString("en-US")} live sites`);
  }
  if (missing.length) {
    lines.push("");
    lines.push(`Not found in directory: ${missing.join(", ")}`);
  }
  return lines.join("\n");
}

export function buildServer() {
  const server = new McpServer({
    name: "techstack-finder",
    version: "1.0.0",
  });

  server.registerTool(
    "scan_website",
    {
      description:
        "Scan a website and detect its technology stack: frameworks, libraries, CMS, hosting, analytics, security headers, health score, CVEs, GDPR audit, and plain-English insights. Calls the TechStack Finder API.",
      inputSchema: {
        url: z.string().describe("The website URL to scan, e.g. example.com or https://example.com"),
        timeout: z.number().optional().describe("Request timeout in milliseconds (default 25000 on serverless)"),
        headers: z.record(z.string(), z.string()).optional().describe("Optional extra HTTP request headers (object of key -> value)"),
        cookies: z.string().optional().describe("Optional raw Cookie header value to send"),
        proxy: z.string().optional().describe("Optional proxy URL to route the fetch through"),
      },
    },
    async ({ url, timeout, headers, cookies, proxy }) => {
      const data = await tsfFetch("/api/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, timeout, headers, cookies, proxy }),
      });
      return { content: [{ type: "text", text: formatScan(data) }] };
    }
  );

  server.registerTool(
    "list_technologies",
    {
      description:
        "List technologies from the TechStack Finder trends directory, sorted by live-site count. Optionally filter by search text or a category/tag.",
      inputSchema: {
        search: z.string().optional().describe("Free-text filter on name, slug, description, or tags"),
        category: z.string().optional().describe("Exact category/tag filter, e.g. \"Frameworks\", \"Content Management System\", \"Analytics and Tracking\""),
        limit: z.number().optional().describe("Max results to return (default 50, max 100)"),
        sort: z.string().optional().describe("Sort order: \"liveSites\" (default) or \"name\""),
      },
    },
    async ({ search, category, limit, sort }) => {
      const qs = new URLSearchParams();
      if (search) qs.set("search", search);
      if (category) qs.set("category", category);
      if (limit) qs.set("limit", String(limit));
      if (sort) qs.set("sort", sort);
      const data = await tsfFetch(`/api/trends?${qs.toString()}`);
      return { content: [{ type: "text", text: formatTechList(data) }] };
    }
  );

  server.registerTool(
    "get_technology",
    {
      description:
        "Get details for a single technology: live-site counts, market share history (2018-2026), YoY direction, country breakdown, top sites, and related technologies.",
      inputSchema: {
        tech: z.string().describe("Technology name or slug, e.g. \"React\", \"next-js\", \"WordPress\""),
      },
    },
    async ({ tech }) => {
      const data = await tsfFetch(`/api/trends?tech=${encodeURIComponent(tech)}`);
      return { content: [{ type: "text", text: formatTechDetail(data) }] };
    }
  );

  server.registerTool(
    "get_trends_overview",
    {
      description:
        "High-level overview of the TechStack Finder trends hub: spotlight technologies, top 20 market-share leaders, technology groups, and total tracked sites.",
      inputSchema: {},
    },
    async () => {
      const data = await tsfFetch("/api/trends");
      return { content: [{ type: "text", text: formatOverview(data) }] };
    }
  );

  server.registerTool(
    "compare_technologies",
    {
      description:
        "Compare two or more technologies by market share, trend direction, and live-site counts. Returns them sorted by current share of websites.",
      inputSchema: {
        techs: z.array(z.string()).describe("List of technologies to compare"),
      },
    },
    async ({ techs }) => {
      const items = [];
      const missing = [];
      for (const name of techs || []) {
        try {
          const data = await tsfFetch(`/api/trends?tech=${encodeURIComponent(name)}`);
          items.push(data.technology);
        } catch (err) {
          if (err instanceof TsfApiError && /no technology found/i.test(err.message)) {
            missing.push(name);
          } else {
            throw err;
          }
        }
      }
      items.sort((a, b) => (b.currentShare ?? -1) - (a.currentShare ?? -1));
      return { content: [{ type: "text", text: formatCompare(items, missing) }] };
    }
  );

  return server;
}
