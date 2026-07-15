import { chromium } from 'playwright';

const PROBE_PATHS = [
  '/robots.txt',
  '/sitemap.xml',
  '/sitemap_index.xml',
  '/wp-admin/install.php',
  '/wp-login.php',
  '/wp-json/wp/v2/posts',
  '/wp-content/',
  '/wp-includes/',
  '/xmlrpc.php',
  '/feed/',
  '/comments/feed/',
  '/?feed=rss2',
  '/api/',
  '/graphql',
  '/_next/',
  '/__next/',
  '/_nuxt/',
  '/__nuxt/',
  '/admin/',
  '/login',
  '/ghost/',
  '/umbraco/',
  '/sitecore/',
  '/epi/',
  '/content/',
  '/static/',
  '/assets/',
  '/media/',
  '/uploads/',
  '/.well-known/',
  '/favicon.ico',
  '/manifest.json',
  '/service-worker.js',
  '/sw.js',
  '/_vercel/insights/view',
  '/.env',
  '/.git/config',
  '/package.json',
  '/composer.json',
  '/Gemfile',
  '/requirements.txt',
  '/Dockerfile',
  '/docker-compose.yml',
  '/.dockerignore',
  '/server.js',
  '/app.js',
  '/index.php',
  '/wp-config.php.bak',
  '/debug/',
  '/test/',
  '/staging/',
  '/dev/',
  '/api/v1/',
  '/api/v2/',
  '/api/health',
  '/api/status',
  '/_debug/',
  '/django-admin/',
  '/admin/login',
  '/user/login',
  '/ghost/#/signin',
  '/ghost/api/',
  '/strapi/',
  '/directus/',
  '/keystone/',
  '/payload/',
  '/sanity/',
  '/prismic/',
  '/contentful/',
  '/storyblok/',
  '/_content/',
  '/_api/',
  '/_data/',
  '/.well-known/assetlinks.json',
  '/.well-known/apple-app-site-association',
  '/browserconfig.xml',
  '/crossdomain.xml',
  '/humans.txt',
  '/security.txt',
  '/.htaccess',
  '/nginx.conf',
  '/error_log',
  '/wp-json/',
  '/xmlrpc.php',
  '/feed.xml',
  '/rss.xml',
  '/atom.xml',
  '/sitemap',
  '/sitemap-0.xml',
  '/index.xml',
  '/web.config',
  '/config.json',
  '/config.js',
  '/config.yml',
  '/config.yaml',
  '/config.toml',
  '/settings.json',
  '/.DS_Store',
  '/Thumbs.db',
  '/backup/',
  '/bak/',
  '/old/',
  '/tmp/',
  '/temp/',
  '/cache/',
  '/logs/',
  '/log/',
  '/debug.log',
  '/error.log',
  '/access.log',
  '/phpinfo.php',
  '/info.php',
  '/test.php',
  '/elmah.axd',
  '/trace.axd',
  '/actuator',
  '/actuator/health',
  '/metrics',
  '/prometheus',
  '/grafana/',
  '/kibana/',
  '/jenkins/',
  '/gitlab/',
  '/bitbucket/',
  '/gitea/',
  '/gogs/',
  '/drone/',
  '/argo-cd/',
  '/tekton/',
  '/sonarqube/',
  '/nexus/',
  '/artifactory/',
  '/vault/',
  '/consul/',
  '/etcd/',
  '/zookeeper/',
  '/kafka/',
  '/rabbitmq/',
  '/redis/',
  '/memcached/',
  '/postgres/',
  '/mysql/',
  '/mongo/',
  '/neo4j/',
  '/elasticsearch/',
  '/opensearch/',
  '/solr/',
  '/couchdb/',
  '/couchbase/',
  '/cassandra/',
  '/influxdb/',
  '/timescaledb/',
  '/clickhouse/',
  '/datadog/',
  '/newrelic/',
  '/sentry/',
  '/rollbar/',
  '/bugsnag/',
  '/airbrake/',
  '/loggly/',
  '/papertrail/',
  '/sumologic/',
  '/splunk/',
  '/fluentd/',
  '/logstash/',
  '/kibana/',
];

const FETCH_OPTS = {
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Accept: '*/*',
  },
  redirect: 'follow',
};

async function safeFetch(url, timeoutMs = 8000, proxy) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const fetchOpts = { ...FETCH_OPTS, signal: ctrl.signal };
    if (proxy) {
      try {
        const { ProxyAgent } = await import('undici');
        fetchOpts.dispatcher = new ProxyAgent(proxy);
      } catch {}
    }
    const res = await fetch(url, fetchOpts);
    clearTimeout(tid);
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('text/') || ct.includes('javascript') || ct.includes('json') || ct.includes('xml') || ct.includes('application/')) {
      return { text: await res.text(), contentType: ct, status: res.status };
    }
    return null;
  } catch {
    clearTimeout(tid);
    return null;
  }
}

export async function fetchCssJsResources($, origin, proxy) {
  const cssUrls = [];
  const jsUrls = [];

  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      try { cssUrls.push(new URL(href, origin).href); } catch {}
    }
  });

  $('link[rel="preconnect"], link[rel="dns-prefetch"], link[rel="preload"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      try { cssUrls.push(new URL(href, origin).href); } catch {}
    }
  });

  $('script[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src && !src.includes('google') && !src.includes('facebook') && !src.includes('twitter') && !src.includes('analytics')) {
      try { jsUrls.push(new URL(src, origin).href); } catch {}
    }
  });

  const cssContent = [];
  const jsContent = [];

  const cssPromises = cssUrls.slice(0, 15).map(async (url) => {
    const r = await safeFetch(url, 6000, proxy);
    if (r && r.text) cssContent.push(r.text);
  });

  const jsPromises = jsUrls.slice(0, 15).map(async (url) => {
    const r = await safeFetch(url, 6000, proxy);
    if (r && r.text) jsContent.push(r.text);
  });

  await Promise.allSettled([...cssPromises, ...jsPromises]);

  return {
    cssUrls,
    jsUrls,
    cssContent: cssContent.join('\n'),
    jsContent: jsContent.join('\n'),
  };
}

export async function probePaths(origin, proxy) {
  const results = {};

  const probes = PROBE_PATHS.map(async (path) => {
    const url = origin.replace(/\/$/, '') + path;
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 5000);
      const fetchOpts = { ...FETCH_OPTS, signal: ctrl.signal };
      if (proxy) {
        try {
          const { ProxyAgent } = await import('undici');
          fetchOpts.dispatcher = new ProxyAgent(proxy);
        } catch {}
      }
      const res = await fetch(url, fetchOpts);
      clearTimeout(tid);
      const headers = {};
      res.headers.forEach((v, k) => { headers[k] = v; });
      results[path] = {
        status: res.status,
        contentType: res.headers.get('content-type') || '',
        server: headers['server'] || '',
        poweredBy: headers['x-powered-by'] || '',
        cfRay: headers['cf-ray'] || '',
        vercelId: headers['x-vercel-id'] || '',
      };
    } catch {
      results[path] = { status: 0, contentType: '', server: '', poweredBy: '', cfRay: '', vercelId: '' };
    }
  });

  await Promise.allSettled(probes);
  return results;
}

export async function browserScan(url, timeoutMs = 20000) {
  let browser = null;
  try {
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();

    const networkRequests = [];
    const consoleMessages = [];
    const jsErrors = [];

    page.on('request', (req) => {
      networkRequests.push({
        url: req.url(),
        type: req.resourceType(),
        method: req.method(),
      });
    });

    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
    });

    page.on('pageerror', (err) => {
      jsErrors.push(err.message);
    });

    await page.goto(url, { waitUntil: 'networkidle', timeout: timeoutMs });

    const html = await page.content();
    const title = await page.title();

    const localStorage = await page.evaluate(() => {
      try {
        const data = {};
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          data[key] = window.localStorage.getItem(key)?.substring(0, 200);
        }
        return data;
      } catch { return {}; }
    });

    const globalVars = await page.evaluate(() => {
      try {
        const keys = [];
        const globals = ['__NEXT_DATA__', '__NUXT__', '__remixContext', 'React', 'Vue', 'angular',
          'Svelte', '_angular', 'Ember', 'Backbone', 'jQuery', '$', 'd3', 'Chart', 'Three',
          'L', 'mapboxgl', 'google', 'fbq', '_fbq', 'gtag', 'dataLayer', 'hj', '_hsq',
          'analytics', 'mixpanel', 'posthog', 'amplitude', 'RudderStack', 'Heap', 'Intercom',
          'Drift', 'Crisp', 'Tawk', 'Zendesk', 'stripe', 'Stripe', 'paypal', 'PayPal',
          '__APP_STATE__', '__PRELOADED_STATE__', '__INITIAL_STATE__', '__APP_CONFIG__',
          '_sentryDebugIds', 'Sentry', 'Rollbar', 'Bugsnag', 'DD_RUM', 'NREUM',
          'Lottie', 'GSAP', 'ScrollTrigger', 'AOS', 'Wow', 'Swiper', 'Flickity',
          'Splide', 'GLightbox', 'PureCounter', 'Typed', 'Waypoint', 'LocomotiveScroll',
          'Lenis', 'barba', 'locomotive', 'LocomotiveScroll', 'Rive', 'rive',
          '__VUE__', '__pinia', 'Pinia', '__svelte__', 'Zustand', 'Recoil', 'Jotai', 'Valtio',
          'Shopify', 'shopify', 'WooCommerce', 'wc_', 'Snipcart',
          'Vercel', 'vercel', 'Netlify', 'netlify',
          'twq', 'twitter', '_linkedin_data_partner_ids', 'lintrk',
          'fbq', '_fbq', 'ttq', '_ttq',
          'cookieConsent', 'CookieConsent', 'Optanon', 'OneTrust',
          'Tawk_API', 'Tawk_LoadStart', '$crisp', 'Drift', 'Intercom',
          'Typeform', 'typeform', 'JotForm',
          'Vimeo', 'Wistia', '_wistia',
          'MathJax', 'KaTeX', 'Prism', 'highlight.js', 'hljs',
          'marked', 'showdown', 'markdown-it',
          'tippy', 'Popper', 'Tippy', 'tippy.js',
          'jsPDF', 'pdfMake', 'html2canvas', 'dom-to-image',
          'xlsx', 'SheetJS', 'Papa', 'PapaParse',
          'Sortable', 'dragula', 'interact.js',
          'Choices', 'TomSelect', 'SlimSelect', 'NiceSelect',
          'flatpickr', 'Pikaday', 'TempusDominus', 'Litepicker',
          'IMask', 'Cleave', 'Inputmask',
          'Tesseract', 'ocrad', 'esseract',
          'Konva', 'fabric', 'paper', 'Two',
          'p5', 'Processing', 'Sketch',
          'anime', 'animejs', 'mojs', 'popmotion', 'motion',
          'Zdog', 'Babylon', 'AFrame', 'aframe',
          'maplibre', 'MapboxGL', 'Leaflet', 'L',
          'Cytoscape', 'vis', 'sigma', 'ForceGraph',
          'mermaid', 'Chart', 'echarts', 'Highcharts', 'Plotly',
          'agGrid', 'AG_GRID', 'Handsontable', 'Tabulator',
          'Monaco', 'CodeMirror', 'ace', 'AceEditor',
          'tiptap', 'ProseMirror', 'Slate', 'Quill', 'DraftJS', 'Lexical',
          'marked', 'showdown', 'turndown', 'Readability',
          'highlight.js', 'hljs', 'Prism', 'shiki',
          'Tone', 'Howler', 'Howl', 'Pizzicato', 'Howler.js',
          'matter', 'cannon', 'ammo', 'rapier', 'planck',
          'nipplejs', 'gamepad', 'gamepad-API',
          'alpine', 'Alpine', 'Livewire',
          'Hyperscript', 'hyperscript', '_hyperscript',
          'PetiteVue', 'petite-vue',
          'QwikLoader', 'qwik', 'Qwik',
          'Solid', '__solid',
          'Marko', '__marko',
          'Mithril', 'm',
          'Inferno', '__inferno',
          'Preact', '__preact',
          'LitElement', 'lit-html', 'Lit',
          'Stencil', '__stencil',
          'Web Components', 'customElements',
          'shadowRoot', 'attachShadow'];
        for (const g of globals) {
          if (typeof window[g] !== 'undefined') keys.push(g);
        }
        return keys;
      } catch { return []; }
    });

    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
    });

    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('link[href]')).map(l => l.href);
    });

    const metaTags = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('meta')).map(m => ({
        name: m.getAttribute('name'),
        property: m.getAttribute('property'),
        content: m.getAttribute('content'),
      }));
    });

    const cssClasses = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('*')).map(e => e.className).filter(Boolean).join(' ');
    });

    const serviceWorker = await page.evaluate(() => {
      return !!navigator.serviceWorker?.controller;
    });

    const cookies = await context.cookies();

    await browser.close();
    browser = null;

    return {
      html,
      title,
      scripts,
      links,
      metaTags,
      cssClasses,
      localStorage,
      globalVars,
      networkRequests,
      consoleMessages,
      jsErrors,
      serviceWorker,
      cookies: cookies.map(c => `${c.name}=${c.value}`).join('; '),
    };
  } catch (err) {
    if (browser) {
      try { await browser.close(); } catch {}
    }
    return null;
  }
}

export async function browserScanRemote(url, timeoutMs = 30000) {
  const apiKey = process.env.BROWSERLESS_API_KEY;
  if (!apiKey) return null;

  try {
    const browserlessUrl = `https://production-sfo.browserless.io/content?token=${apiKey}&timeout=${timeoutMs}&waitUntil=networkidle2&blockAds=true&blockResources=font,media`;
    const response = await fetch(browserlessUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, gotoOptions: { waitUntil: 'networkidle2', timeout: timeoutMs } }),
      signal: AbortSignal.timeout(timeoutMs + 5000),
    });

    if (!response.ok) {
      console.warn('[browserScanRemote] Browserless error:', response.status, await response.text());
      return null;
    }

    const html = await response.text();
    if (!html || html.length < 500) return null;

    // Parse HTML with Cheerio to extract same data as local browserScan
    const { load } = await import('cheerio');
    const $ = load(html);

    const scripts = $('script[src]').map((_, el) => $(el).attr('src')).get().filter(Boolean);
    const links = $('link[href]').map((_, el) => $(el).attr('href')).get().filter(Boolean);
    const metaTags = $('meta').map((_, el) => ({
      name: $(el).attr('name'),
      property: $(el).attr('property'),
      content: $(el).attr('content'),
    })).get();

    const cssClasses = $('*').map((_, el) => $(el).attr('class') || '').get().filter(Boolean).join(' ');

    return {
      html,
      title: $('title').first().text().trim() || '',
      scripts,
      links,
      metaTags,
      cssClasses,
      localStorage: {},
      globalVars: [],
      networkRequests: [],
      consoleMessages: [],
      jsErrors: [],
      serviceWorker: false,
      cookies: '',
      remote: true,
    };
  } catch (err) {
    console.warn('[browserScanRemote] failed:', err.message);
    return null;
  }
}

export function buildPathProbesSummary(probes) {
  const summaries = [];
  for (const [path, result] of Object.entries(probes)) {
    if (result.status === 200) {
      let line = `${path} -> ${result.status}`;
      if (result.server) line += ` [${result.server}]`;
      if (result.poweredBy) line += ` [${result.poweredBy}]`;
      summaries.push(line);
    } else if (result.status >= 300 && result.status < 400) {
      summaries.push(`${path} -> ${result.status} redirect`);
    } else if (result.status === 401 || result.status === 403) {
      let line = `${path} -> ${result.status} protected`;
      if (result.server) line += ` [${result.server}]`;
      summaries.push(line);
    }
  }
  return summaries.join('\n');
}
