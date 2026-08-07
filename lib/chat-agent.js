import { detectTechnologies } from './detect';
import { TECH_DIRECTORY } from './trends-data';
import { getMarketShare, getTrendDirection } from './market-share';

/* Site-aware chat agent. Thin server-side wrapper over an OpenAI-compatible
   chat-completions API (Groq free tier by default, OpenRouter free models
   supported) with tools wired directly to the in-process detection engine and
   the trends/market-share data. Falls back to a friendly "not configured"
   reply when no AI_CHAT_API_KEY is set. */

const PROVIDERS = {
  groq: { baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  openrouter: { baseUrl: 'https://openrouter.ai/api/v1', model: 'meta-llama/llama-3.3-70b-instruct:free' },
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  deepseek: { baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  nvidia: { baseUrl: 'https://integrate.api.nvidia.com/v1', model: 'minimaxai/minimax-m3' },
};

export function chatConfig() {
  const provider = process.env.AI_CHAT_PROVIDER || 'groq';
  const preset = PROVIDERS[provider] || PROVIDERS.groq;
  return {
    enabled: !!process.env.AI_CHAT_API_KEY,
    provider,
    baseUrl: process.env.AI_CHAT_BASE_URL || preset.baseUrl,
    model: process.env.AI_CHAT_MODEL || preset.model,
    apiKey: process.env.AI_CHAT_API_KEY || '',
  };
}

const SYSTEM_PROMPT = `You are the AI assistant for TechStack Finder (techstack-finder.vercel.app), a tool that fingerprints any website's technology stack — frameworks, CMS, analytics, hosting, CDN, libraries, and more — with 2,300+ detection rules.

You have real tools — ALWAYS call one instead of guessing:
- scan_website(url): detect the full tech stack of any public website. Use it whenever the user names or pastes a website.
- get_tech_trends(tech): live-site counts, market share, and trend direction for a technology.
- list_technologies(category): the most-used technologies, optionally filtered by a category (e.g. "CMS", "analytics", "hosting", "framework").
- compare_stacks(url1, url2): scan two websites and list what's unique to each plus what they share.

Style rules:
- Be concise and direct. Use plain text with newlines. Use "- " for lists. Do NOT use markdown asterisks, backticks, or hashtags.
- Answer in the user's language.
- When scan results are partial or blocked (behind Cloudflare etc.), say so and suggest a proxy/VPN.
- Never invent numbers — only report what a tool returned. If a tool errors, say the site couldn't be scanned and why.
- You may briefly mention TechStack Finder features (scans, trends hub, monitoring, bulk scans, MCP server) when relevant.`;

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'scan_website',
      description: 'Scan a website and return its detected technology stack (frameworks, CMS, analytics, hosting, CDN, libraries).',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Website URL or bare domain, e.g. "https://vercel.com" or "react.dev"' },
        },
        required: ['url'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_tech_trends',
      description: 'Get market data for a technology: live sites, India sites, market share and trend direction.',
      parameters: {
        type: 'object',
        properties: {
          tech: { type: 'string', description: 'Technology name, e.g. "React" or "WordPress"' },
        },
        required: ['tech'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_technologies',
      description: 'List the most widely used technologies, optionally filtered by category/tag.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Optional category filter, e.g. "Content Management System", "analytics", "hosting"' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compare_stacks',
      description: 'Scan two websites and compare their technology stacks.',
      parameters: {
        type: 'object',
        properties: {
          url1: { type: 'string', description: 'First website URL or domain' },
          url2: { type: 'string', description: 'Second website URL or domain' },
        },
        required: ['url1', 'url2'],
      },
    },
  },
];

const TOOL_TIMEOUT = 15000;

function findTech(query) {
  const q = String(query || '').toLowerCase().trim();
  if (!q) return null;
  return (
    TECH_DIRECTORY.find((t) => t.slug === q) ||
    TECH_DIRECTORY.find((t) => t.name.toLowerCase() === q) ||
    TECH_DIRECTORY.find((t) => t.name.toLowerCase().includes(q)) ||
    null
  );
}

async function scanWebsite(url) {
  try {
    const r = await detectTechnologies(url, { timeout: TOOL_TIMEOUT, fast: true });
    const techs = (r.technologies || [])
      .slice(0, 25)
      .map((t) => `${t.name}${t.version ? ' ' + t.version : ''} (${t.confidence || 'medium'})`);
    return JSON.stringify(
      {
        url: r.site && r.site.url,
        title: r.site && r.site.title,
        httpStatus: r.site && r.site.statusCode,
        partialResults: !!r.partialResults,
        summary: r.summary || {},
        categories: r.categories || [],
        industry: r.industry || null,
        technologies: techs,
      },
      null,
      2
    );
  } catch (e) {
    return `error: could not scan ${url} — ${e.message}`;
  }
}

function techTrends(tech) {
  const t = findTech(tech);
  if (!t) {
    return JSON.stringify({ found: false, query: tech, hint: 'Use list_technologies to see top technologies.' });
  }
  const share = getMarketShare(t.name);
  const direction = getTrendDirection(t.name);
  return JSON.stringify(
    {
      found: true,
      name: t.name,
      slug: t.slug,
      description: t.description,
      tags: t.tags,
      liveSites: t.liveSites,
      indianSites: t.indianSites,
      marketShare: share || null,
      trendDirection: direction || null,
    },
    null,
    2
  );
}

function listTechnologies(category) {
  const cat = String(category || '').toLowerCase().trim();
  let list = TECH_DIRECTORY;
  if (cat) {
    list = list.filter((t) => t.tags.some((tag) => tag.toLowerCase().includes(cat)));
  }
  return JSON.stringify(
    [...list]
      .sort((a, b) => b.liveSites - a.liveSites)
      .slice(0, 20)
      .map((t) => ({ name: t.name, liveSites: t.liveSites, indianSites: t.indianSites, tags: t.tags })),
    null,
    2
  );
}

async function compareStacks(url1, url2) {
  try {
    const [ra, rb] = await Promise.all([
      detectTechnologies(url1, { timeout: TOOL_TIMEOUT, fast: true }),
      detectTechnologies(url2, { timeout: TOOL_TIMEOUT, fast: true }),
    ]);
    const namesOf = (r) => new Set((r.technologies || []).map((t) => t.name));
    const setA = namesOf(ra);
    const setB = namesOf(rb);
    return JSON.stringify(
      {
        a: { url: ra.site && ra.site.url, title: ra.site && ra.site.title },
        b: { url: rb.site && rb.site.url, title: rb.site && rb.site.title },
        onlyA: [...setA].filter((n) => !setB.has(n)).sort(),
        onlyB: [...setB].filter((n) => !setA.has(n)).sort(),
        shared: [...setA].filter((n) => setB.has(n)).sort(),
      },
      null,
      2
    );
  } catch (e) {
    return `error: could not compare stacks — ${e.message}`;
  }
}

async function dispatchTool(name, args) {
  if (name === 'scan_website') return scanWebsite(args.url);
  if (name === 'get_tech_trends') return techTrends(args.tech);
  if (name === 'list_technologies') return listTechnologies(args.category);
  if (name === 'compare_stacks') return compareStacks(args.url1, args.url2);
  return `error: unknown tool ${name}`;
}

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function urlFromText(text) {
  const m = String(text || '').match(/(?:https?:\/\/)?([\w-]+\.)+[a-z]{2,}(?:\/[\w\-./?=&%@#+]*)?/i);
  if (!m) return null;
  const raw = m[0];
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

function findTechInText(text) {
  const lower = String(text || '').toLowerCase();
  for (const t of TECH_DIRECTORY) {
    const names = [t.name, t.slug];
    for (const n of names) {
      const esc = String(n).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`, 'i');
      if (re.test(lower)) return t;
    }
  }
  return null;
}

const CATEGORY_KEYWORDS = [
  ['content management system', 'content management system'],
  ['cms', 'content management system'],
  ['analytics', 'analytics'],
  ['hosting', 'hosting'],
  ['framework', 'framework'],
  ['frameworks', 'framework'],
  ['database', 'database'],
  ['ecommerce', 'ecommerce'],
  ['e-commerce', 'ecommerce'],
  ['payment', 'payment'],
  ['javascript', 'javascript'],
  ['css', 'css'],
  ['email', 'email'],
  ['advertising', 'advertis'],
  ['ads', 'advertis'],
];

function categoryFromText(text) {
  const lower = String(text || '').toLowerCase();
  for (const [kw, tag] of CATEGORY_KEYWORDS) {
    const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`, 'i').test(lower)) return tag;
  }
  return null;
}

const CAPABILITY_REPLY = `Hi! I'm the TechStack Assistant. Here's what I can do:

- Scan any website's technology stack - just tell me a URL (e.g. "scan stripe.com")
- Look up trends and market share for a technology (e.g. "React market share")
- List the most popular technologies by category (e.g. "top CMS platforms", "best analytics tools", "hosting providers")
- Compare the stacks of two websites

Right now the AI model that phrases my answers is busy (free-tier providers queue requests), so I'm answering from my local knowledge base. Try one of the examples above!`;

function templateToolOutput(toolOutputs) {
  const last = toolOutputs[toolOutputs.length - 1];
  if (!last) return "I couldn't reach the AI model in time. Try again in a moment.";
  try {
    const d = JSON.parse(last.output);
    if (last.name === 'scan_website') {
      if (String(last.output).startsWith('error')) return last.output;
      const techs = d.technologies || [];
      return [
        `Scan results for ${d.url || 'the site'}:`,
        `- Status: ${d.httpStatus || 'n/a'}`,
        `- Title: ${d.title || 'n/a'}`,
        `- Technologies (${techs.length}): ${techs.join(', ') || 'none detected'}`,
      ].join('\n');
    }
    if (last.name === 'get_tech_trends') {
      if (!d.found) return `No data found for "${d.query}". ${d.hint || ''}`;
      const live = typeof d.liveSites === 'number' ? d.liveSites.toLocaleString() : d.liveSites;
      const indian = typeof d.indianSites === 'number' ? d.indianSites.toLocaleString() : d.indianSites;
      const share = d.marketShare && typeof d.marketShare.currentShare === 'number' ? `, ${d.marketShare.currentShare}% market share` : '';
      const trend = d.trendDirection && d.trendDirection.label ? ` Trend: ${d.trendDirection.label}.` : '';
      return `${d.name}: ${live} live sites${indian ? `, ${indian} in India` : ''}${share}.${trend}`;
    }
    if (last.name === 'list_technologies') {
      const arr = Array.isArray(d) ? d : [];
      if (!arr.length) return 'No technologies found.';
      return (
        'Top technologies:\n' +
        arr.map((t) => `- ${t.name} (${typeof t.liveSites === 'number' ? t.liveSites.toLocaleString() : t.liveSites} sites)`).join('\n')
      );
    }
    if (last.name === 'compare_stacks') {
      const a = d.a && d.a.url ? d.a.url : 'site A';
      const b = d.b && d.b.url ? d.b.url : 'site B';
      return [
        `Comparing ${a} and ${b}:`,
        `- Only in A: ${(d.onlyA || []).join(', ') || 'none'}`,
        `- Only in B: ${(d.onlyB || []).join(', ') || 'none'}`,
        `- Shared: ${(d.shared || []).join(', ') || 'none'}`,
      ].join('\n');
    }
    return last.output;
  } catch {
    return last.output;
  }
}

async function fallbackForUser(convo) {
  const lastUser = [...convo].reverse().find((m) => m.role === 'user');
  const text = (lastUser && lastUser.content) || '';

  const url = urlFromText(text);
  if (url) {
    try {
      const out = await scanWebsite(url);
      if (out && !String(out).startsWith('error')) {
        return { disabled: false, reply: templateToolOutput([{ name: 'scan_website', output: out }]) };
      }
      return { disabled: false, reply: String(out).startsWith('error') ? out : CAPABILITY_REPLY };
    } catch {}
  }

  const tech = findTechInText(text);
  if (tech) {
    try {
      const out = techTrends(tech.name);
      if (out && !String(out).startsWith('error')) {
        return { disabled: false, reply: templateToolOutput([{ name: 'get_tech_trends', output: out }]) };
      }
    } catch {}
  }

  const category = categoryFromText(text);
  if (category) {
    try {
      const out = listTechnologies(category);
      if (out) {
        return { disabled: false, reply: templateToolOutput([{ name: 'list_technologies', output: out }]) };
      }
    } catch {}
  }

  if (/(what can you do|who are you|what are you|help|capabilit|features?)/i.test(text)) {
    return { disabled: false, reply: CAPABILITY_REPLY };
  }

  if (/^(hi+|hello|hey|yo|hola|namaste|namaskar|good\s+(morning|afternoon|evening))[!.\s]*$/i.test(text.trim())) {
    return {
      disabled: false,
      reply: "Hi! I can scan websites, look up technology trends, and compare stacks. Try asking me to scan a site (e.g. \"scan stripe.com\"), or name a technology like \"React market share\".",
    };
  }

  return {
    disabled: false,
    reply:
      "The AI model is busy right now (free-tier providers queue requests, so it can take a minute). Please try again in a few seconds.",
  };
}

const ROUND_TIMEOUT_FIRST = 12000;
const ROUND_TIMEOUT_FIRST_GENERAL = 20000;
const ROUND_TIMEOUT_FOLLOWUP = 10000;
const SKIP_FOLLOWUP_AFTER_MS = 15000;

function callLLM(cfg, messages, signal, timeoutMs) {
  const ctrl = new AbortController();
  const onOuterAbort = () => ctrl.abort();
  if (signal) signal.addEventListener('abort', onOuterAbort);
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  return (async () => {
    try {
      const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
        method: 'POST',
        signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
        body: JSON.stringify({
          model: cfg.model,
          messages,
          tools: TOOLS,
          tool_choice: 'auto',
          temperature: 0.4,
          max_tokens: 900,
          // minimax-m3 (NVIDIA NIM) "thinks" by default, adding 20-50s latency.
          // Disable reasoning — the agent replies with plain text anyway.
          ...(cfg.provider === 'nvidia' ? { chat_template_kwargs: { thinking_mode: 'disabled' } } : {}),
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`LLM request failed (${res.status}): ${text.slice(0, 300)}`);
      }
      const data = await res.json();
      return data.choices && data.choices[0];
    } catch (e) {
      if (ctrl.signal.aborted) throw new Error('LLM_TIMEOUT');
      throw e;
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener('abort', onOuterAbort);
    }
  })();
}

const MAX_ROUNDS = 6;

function isTransient(e) {
  return !!(e && (e.message === 'LLM_TIMEOUT' || e.name === 'AbortError' || /^LLM request failed \((429|5\d\d)\)/.test(e.message)));
}

export async function runChatAgent(messages) {
  const cfg = chatConfig();
  if (!cfg.enabled) {
    return {
      disabled: true,
      reply:
        "Hi! I'm the TechStack Assistant, but I'm not turned on yet. Drop a free-tier API key into the AI_CHAT_API_KEY environment variable to wake me up. In the meantime you can scan any site from the homepage or browse the Trends hub.",
    };
  }

  const controller = new AbortController();
  const budget = process.env.VERCEL ? 50000 : 60000;
  const timer = setTimeout(() => controller.abort(), budget);
  try {
    const convo = [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-20)];
    const toolOutputs = [];
    const agentStart = Date.now();
    const lastUserText = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const mappable = !!(
      urlFromText(lastUserText) ||
      findTechInText(lastUserText) ||
      categoryFromText(lastUserText) ||
      /(what can you do|who are you|what are you|help|capabilit|features?)/i.test(lastUserText)
    );
    let reply = '';
    let round0Attempts = 0;
    for (let i = 0; i < MAX_ROUNDS; i += 1) {
      if (i > 0 && Date.now() - agentStart > SKIP_FOLLOWUP_AFTER_MS) {
        reply = templateToolOutput(toolOutputs);
        break;
      }
      let choice;
      try {
        choice = await callLLM(
          cfg,
          convo,
          controller.signal,
          i === 0 ? (mappable ? ROUND_TIMEOUT_FIRST : ROUND_TIMEOUT_FIRST_GENERAL) : ROUND_TIMEOUT_FOLLOWUP
        );
      } catch (e) {
        if (isTransient(e) && i === 0 && !mappable && round0Attempts < 1) {
          round0Attempts += 1;
          i -= 1;
          continue;
        }
        if (isTransient(e)) {
          if (i === 0) return fallbackForUser(convo);
          return { disabled: false, reply: templateToolOutput(toolOutputs) };
        }
        throw e;
      }
      const msg = choice && choice.message;
      if (!msg) throw new Error('Empty LLM response');
      if (msg.tool_calls && msg.tool_calls.length) {
        convo.push(msg);
        for (const tc of msg.tool_calls) {
          const args = safeParse(tc.function && tc.function.arguments);
          let out;
          try {
            out = await dispatchTool(tc.function.name, args);
          } catch (e) {
            out = `error: ${e.message}`;
          }
          toolOutputs.push({ name: tc.function.name, output: out });
          convo.push({ role: 'tool', tool_call_id: tc.id, content: String(out).slice(0, 6000) });
        }
        continue;
      }
      reply = String(msg.content || '').trim();
      break;
    }
    if (!reply) {
      reply = templateToolOutput(toolOutputs);
    }
    return { disabled: false, reply };
  } finally {
    clearTimeout(timer);
  }
}
