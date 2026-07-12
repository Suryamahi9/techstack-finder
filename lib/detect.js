import * as cheerio from 'cheerio';
import { fetchCssJsResources, probePaths, browserScan, buildPathProbesSummary } from './deep-scan.js';

const RULES = [
  // ── Frontend Frameworks ──
  { name: 'Next.js', category: 'Frontend Framework', versionPattern: /(?:Next\.?js|next)[\/\s]?v?(\d+(?:\.\d+)+)/i, patterns: [
    { type: 'html', regex: /__NEXT_DATA__/, via: 'script tag __NEXT_DATA__' },
    { type: 'html', regex: /\/_next\/static\//, via: 'Next.js asset path' },
    { type: 'header', key: 'x-powered-by', regex: /next\.?js/i, via: 'X-Powered-By header' }
  ]},
  { name: 'Nuxt.js', category: 'Frontend Framework', patterns: [
    { type: 'html', regex: /__NUXT__|\/_nuxt\//, via: 'Nuxt data object' },
    { type: 'header', key: 'x-powered-by', regex: /nuxt/i, via: 'X-Powered-By header' }
  ]},
  { name: 'React', category: 'Frontend Framework', versionPattern: /react[\/@]?(\d+(?:\.\d+)+)/i, patterns: [
    { type: 'html', regex: /data-reactroot|data-react-(?:root|helmet)|__REACT_DEVTOOLS_GLOBAL_HOOK__/, via: 'React DOM attributes' },
    { type: 'script_src', regex: /react(?:-[a-z]+)?(?:\.production|\.development)?(?:\.min)?\.js/i, via: 'React script src' }
  ]},
  { name: 'Vue', category: 'Frontend Framework', versionPattern: /vue[\/@]?(\d+(?:\.\d+)+)/i, patterns: [
    { type: 'html', regex: /data-v-[a-z0-9]{6,8}|__vue_app__|vue\.config\./, via: 'Vue scoped attributes' },
    { type: 'script_src', regex: /vue(?:\.runtime)?(?:\.min)?\.js/i, via: 'Vue script src' }
  ]},
  { name: 'Angular', category: 'Frontend Framework', versionPattern: /ng-version=["'](\d+(?:\.\d+)+)/i, patterns: [
    { type: 'html', regex: /ng-version|_ngcontent|ng-app|ng-controller/, via: 'Angular attributes' }
  ]},
  { name: 'Svelte', category: 'Frontend Framework', patterns: [
    { type: 'html', regex: /svelte-[a-z0-9]{6}/, via: 'Svelte scoped class' }
  ]},
  { name: 'Gatsby', category: 'Frontend Framework', patterns: [
    { type: 'html', regex: /___gatsby|gatsby-(?:image|link)/, via: 'Gatsby DOM markers' }
  ]},
  { name: 'Astro', category: 'Frontend Framework', patterns: [
    { type: 'html', regex: /astro-island|astro-slot/, via: 'Astro island component' }
  ]},
  { name: 'Remix', category: 'Frontend Framework', patterns: [
    { type: 'html', regex: /__remixContext|window\.__remix/, via: 'Remix context' }
  ]},
  { name: 'Ember.js', category: 'Frontend Framework', patterns: [
    { type: 'html', regex: /ember\.js|__ember/, via: 'Ember runtime' }
  ]},
  { name: 'Backbone.js', category: 'Frontend Framework', patterns: [
    { type: 'script_src', regex: /backbone(?:\.min)?\.js/i, via: 'Backbone script src' }
  ]},
  { name: 'Solid.js', category: 'Frontend Framework', patterns: [
    { type: 'html', regex: /solid-[a-z0-9-]+|data-solid|__SOLID__/, via: 'Solid.js attributes/markers' }
  ]},
  { name: 'Qwik', category: 'Frontend Framework', patterns: [
    { type: 'html', regex: /q:base|q:id|q:route|qwik\./i, via: 'Qwik framework markers' }
  ]},
  { name: 'Preact', category: 'Frontend Framework', patterns: [
    { type: 'script_src', regex: /preact(?:\.min)?\.js/i, via: 'Preact script src' },
    { type: 'html', regex: /__preact_hydrate__/, via: 'Preact hydrate marker' }
  ]},
  { name: 'Lit', category: 'Frontend Framework', patterns: [
    { type: 'html', regex: /lit-version|lit-element|lit-html/, via: 'Lit library markers' }
  ]},
  { name: 'HTMX', category: 'Frontend Framework', patterns: [
    { type: 'script_src', regex: /htmx(?:\.min)?\.js/i, via: 'HTMX script src' },
    { type: 'html', regex: /hx-(?:get|post|put|delete|target|swap|trigger|indicator)/, via: 'HTMX attribute' }
  ]},
  { name: 'Alpine.js', category: 'Frontend Framework', patterns: [
    { type: 'script_src', regex: /alpine(?:\.min)?\.js/i, via: 'Alpine.js script src' },
    { type: 'html', regex: /x-data=|x-show=|x-cloak/, via: 'Alpine directive' }
  ]},
  { name: 'Turbo (Hotwire)', category: 'Frontend Framework', patterns: [
    { type: 'script_src', regex: /turbo(?:\.js|\.min\.js)/i, via: 'Turbo script src' },
    { type: 'html', regex: /data-turbo-track|turbo-frame|turbo-stream/, via: 'Turbo attributes' }
  ]},
  { name: 'Stimulus', category: 'Frontend Framework', patterns: [
    { type: 'html', regex: /data-controller|data-action|data-target/, via: 'Stimulus data attributes' }
  ]},
  { name: 'Mithril.js', category: 'Frontend Framework', patterns: [
    { type: 'script_src', regex: /mithril(?:\.min)?\.js/i, via: 'Mithril script src' }
  ]},
  { name: 'Marko', category: 'Frontend Framework', patterns: [
    { type: 'html', regex: /data-marko|marko\.json/, via: 'Marko framework markers' }
  ]},

  // ── CMS ──
  { name: 'WordPress', category: 'CMS', versionPattern: /WordPress\s*(\d+(?:\.\d+)+)/i, patterns: [
    { type: 'meta_generator', regex: /wordpress/i, via: 'meta generator tag' },
    { type: 'html', regex: /wp-content\/themes|wp-content\/plugins|wp-includes\//, via: 'WordPress asset paths' },
    { type: 'header', key: 'link', regex: /wp-json/i, via: 'WP REST API link header' }
  ]},
  { name: 'Shopify', category: 'CMS', patterns: [
    { type: 'html', regex: /cdn\.shopify\.com|shopify\.theme/, via: 'Shopify CDN reference' },
    { type: 'header', key: 'set-cookie', regex: /_shopify/i, via: 'Shopify cookie' },
    { type: 'header', key: 'x-shopify-stage', regex: /.+/, via: 'X-Shopify-Stage header' },
    { type: 'header', key: 'x-shopid', regex: /.+/, via: 'X-ShopId header' }
  ]},
  { name: 'Webflow', category: 'CMS', patterns: [
    { type: 'meta_generator', regex: /webflow/i, via: 'meta generator tag' },
    { type: 'html', regex: /webflow\.com|w-nav|w-layout/, via: 'Webflow CSS classes' }
  ]},
  { name: 'Squarespace', category: 'CMS', patterns: [
    { type: 'html', regex: /static1\.squarespace\.com|squarespace\.com/, via: 'Squarespace asset host' },
    { type: 'header', key: 'set-cookie', regex: /squarespace/i, via: 'Squarespace cookie' }
  ]},
  { name: 'Wix', category: 'CMS', patterns: [
    { type: 'meta_generator', regex: /wix\.com/i, via: 'meta generator tag' },
    { type: 'html', regex: /static\.wixstatic\.com|wix\.com/, via: 'Wix static asset host' }
  ]},
  { name: 'Drupal', category: 'CMS', patterns: [
    { type: 'meta_generator', regex: /drupal/i, via: 'meta generator tag' },
    { type: 'header', key: 'x-generator', regex: /drupal/i, via: 'X-Generator header' },
    { type: 'html', regex: /sites\/default\/files\/|drupal\.js/, via: 'Drupal asset path' }
  ]},
  { name: 'Ghost', category: 'CMS', patterns: [
    { type: 'meta_generator', regex: /ghost/i, via: 'meta generator tag' }
  ]},
  { name: 'Joomla', category: 'CMS', patterns: [
    { type: 'meta_generator', regex: /joomla/i, via: 'meta generator tag' }
  ]},
  { name: 'Contentful', category: 'CMS', patterns: [
    { type: 'html', regex: /cdn\.contentful\.com|images\.ctfassets\.net/, via: 'Contentful CDN' }
  ]},
  { name: 'Sanity', category: 'CMS', patterns: [
    { type: 'html', regex: /cdn\.sanity\.io/, via: 'Sanity CDN' }
  ]},
  { name: 'Strapi', category: 'CMS', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /strapi/i, via: 'X-Powered-By header' }
  ]},
  { name: 'Prismic', category: 'CMS', patterns: [
    { type: 'script_src', regex: /prismic\.io/, via: 'Prismic script src' }
  ]},
  { name: 'Storyblok', category: 'CMS', patterns: [
    { type: 'html', regex: /storyblok\.com|a\.storyblok\.com/, via: 'Storyblok CDN' }
  ]},
  { name: 'Builder.io', category: 'CMS', patterns: [
    { type: 'script_src', regex: /builder\.io/, via: 'Builder.io script' }
  ]},
  { name: 'ButterCMS', category: 'CMS', patterns: [
    { type: 'html', regex: /buttercms\.com/, via: 'ButterCMS reference' }
  ]},
  { name: 'Contentstack', category: 'CMS', patterns: [
    { type: 'html', regex: /contentstack\.com|contentstack\-cdn/, via: 'Contentstack CDN' }
  ]},
  { name: 'Directus', category: 'CMS', patterns: [
    { type: 'html', regex: /directus\.io|directus\-cdn/, via: 'Directus reference' }
  ]},
  { name: 'TinaCMS', category: 'CMS', patterns: [
    { type: 'html', regex: /tina\.io|tina-admin/, via: 'TinaCMS reference' }
  ]},
  { name: 'KeystoneJS', category: 'CMS', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /keystone/i, via: 'X-Powered-By header' }
  ]},
  { name: 'DatoCMS', category: 'CMS', patterns: [
    { type: 'html', regex: /datocms\-cdn|datocms\.com/, via: 'DatoCMS CDN' }
  ]},
  { name: 'Hygraph', category: 'CMS', patterns: [
    { type: 'html', regex: /hygraph\.com|graphcms/, via: 'Hygraph reference' }
  ]},
  { name: 'Cockpit CMS', category: 'CMS', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /cockpit/i, via: 'X-Powered-By header' }
  ]},
  { name: 'Sitecore', category: 'CMS', patterns: [
    { type: 'html', regex: /sitecore|sc_mode|sc_version/, via: 'Sitecore markers' }
  ]},
  { name: 'AEM (Adobe Experience Manager)', category: 'CMS', patterns: [
    { type: 'html', regex: /adobe\.experience|slingresource/, via: 'AEM reference' }
  ]},
  { name: 'Kentico', category: 'CMS', patterns: [
    { type: 'html', regex: /kentico\.cdn|kentico\.com/, via: 'Kentico CDN' }
  ]},
  { name: 'Umbraco', category: 'CMS', patterns: [
    { type: 'html', regex: /umbraco|umb\-page/, via: 'Umbraco reference' }
  ]},

  // ── Analytics ──
  { name: 'Google Analytics', category: 'Analytics', patterns: [
    { type: 'html', regex: /google-analytics\.com\/(?:ga|analytics)\.js/, via: 'UA analytics.js' },
    { type: 'html', regex: /www\.googletagmanager\.com\/a\/analytics/, via: 'UA analytics script' },
    { type: 'cookie', regex: /_ga=|_gid=/, via: '_ga cookie' }
  ]},
  { name: 'GA4', category: 'Analytics', patterns: [
    { type: 'html', regex: /googletagmanager\.com\/gtag\/js/, via: 'gtag.js script (GA4)' },
    { type: 'html', regex: /gtag\(['"]config['"]/, via: 'gtag() config call (GA4)' }
  ]},
  { name: 'Google Tag Manager', category: 'Analytics', patterns: [
    { type: 'html', regex: /googletagmanager\.com\/gtm\.js/, via: 'GTM script' },
    { type: 'html', regex: /GTM-[A-Z0-9]{6,}/, via: 'GTM container ID' }
  ]},
  { name: 'Facebook Pixel', category: 'Analytics', patterns: [
    { type: 'html', regex: /connect\.facebook\.net\/.*fbevents\.js/, via: 'Facebook Pixel script' }
  ]},
  { name: 'Hotjar', category: 'Analytics', patterns: [
    { type: 'html', regex: /static\.hotjar\.com|hotjar\.com\/c\/hotjar/, via: 'Hotjar script' }
  ]},
  { name: 'Mixpanel', category: 'Analytics', patterns: [
    { type: 'html', regex: /cdn\.mxpnl\.com|mixpanel\.com\/libs/, via: 'Mixpanel script' }
  ]},
  { name: 'Plausible', category: 'Analytics', patterns: [
    { type: 'html', regex: /plausible\.io\/js/, via: 'Plausible script' }
  ]},
  { name: 'Fathom', category: 'Analytics', patterns: [
    { type: 'html', regex: /cdn\.usefathom\.com/, via: 'Fathom script' }
  ]},
  { name: 'Segment', category: 'Analytics', patterns: [
    { type: 'html', regex: /cdn\.segment\.com\/analytics\.js/, via: 'Segment script' }
  ]},
  { name: 'Amplitude', category: 'Analytics', patterns: [
    { type: 'html', regex: /cdn\.amplitude\.com/, via: 'Amplitude script' }
  ]},
  { name: 'LinkedIn Insight', category: 'Analytics', patterns: [
    { type: 'html', regex: /snap\.licdn\.com\/li\.insight\.min\.js/, via: 'LinkedIn Insight tag' }
  ]},
  { name: 'PostHog', category: 'Analytics', patterns: [
    { type: 'html', regex: /posthog\.com\/static\/array\.js|posthog\.init|ph\.capture/, via: 'PostHog script' }
  ]},
  { name: 'Heap', category: 'Analytics', patterns: [
    { type: 'html', regex: /heapanalytics\.com\/js\/heap/, via: 'Heap script' }
  ]},
  { name: 'FullStory', category: 'Analytics', patterns: [
    { type: 'html', regex: /fullstory\.com\/s\/fs\.js|FS\(['"]restore['"]/, via: 'FullStory script' }
  ]},
  { name: 'LogRocket', category: 'Analytics', patterns: [
    { type: 'html', regex: /logrocket\.com\/js\/logrocket\.js|LogRocket\.init/, via: 'LogRocket script' }
  ]},
  { name: 'Matomo', category: 'Analytics', patterns: [
    { type: 'html', regex: /matomo\.js|piwik\.js|_paq\.push/, via: 'Matomo/Piwik script' }
  ]},
  { name: 'Datadog RUM', category: 'Analytics', patterns: [
    { type: 'html', regex: /datadog\-rum|dd_runtime|DD_RUM/, via: 'Datadog RUM script' }
  ]},
  { name: 'New Relic', category: 'Analytics', patterns: [
    { type: 'html', regex: /newrelic\.com\/nr\/browser|NREUM/, via: 'New Relic Browser agent' }
  ]},
  { name: 'Vercel Analytics', category: 'Analytics', patterns: [
    { type: 'html', regex: /vercel\.com\/_analytics|va\.q?\(/, via: 'Vercel Analytics script' }
  ]},
  { name: 'Umami', category: 'Analytics', patterns: [
    { type: 'html', regex: /umami\.js|umami\.is\/script/, via: 'Umami analytics script' }
  ]},
  { name: 'Simple Analytics', category: 'Analytics', patterns: [
    { type: 'html', regex: /simpleanalyticscdn\.com/, via: 'Simple Analytics script' }
  ]},
  { name: 'Splitbee', category: 'Analytics', patterns: [
    { type: 'html', regex: /splitbee\.io\/js/, via: 'Splitbee script' }
  ]},
  { name: 'Crazy Egg', category: 'Analytics', patterns: [
    { type: 'html', regex: /crazyegg\.com\/scripts|CE_SITE_ID/, via: 'Crazy Egg script' }
  ]},
  { name: 'Mouseflow', category: 'Analytics', patterns: [
    { type: 'html', regex: /mouseflow\.com\/js\/mouseflow/, via: 'Mouseflow script' }
  ]},
  { name: 'Smartlook', category: 'Analytics', patterns: [
    { type: 'html', regex: /smartlook\.com\/dist\/smartlook/, via: 'Smartlook script' }
  ]},
  { name: 'Clicky', category: 'Analytics', patterns: [
    { type: 'html', regex: /static\.clicky\.com\/js/, via: 'Clicky script' }
  ]},
  { name: 'GoatCounter', category: 'Analytics', patterns: [
    { type: 'html', regex: /gc\.zgo\.at|goatcounter\.com/, via: 'GoatCounter script' }
  ]},

  // ── CDN / Hosting ──
  { name: 'Cloudflare', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'server', regex: /cloudflare/i, via: 'Server header' },
    { type: 'header', key: 'cf-ray', regex: /.+/, via: 'CF-Ray header' }
  ]},
  { name: 'Vercel', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'server', regex: /vercel/i, via: 'Server header' },
    { type: 'header', key: 'x-vercel-id', regex: /.+/, via: 'X-Vercel-ID header' },
    { type: 'header', key: 'x-vercel-cache', regex: /.+/, via: 'X-Vercel-Cache header' }
  ]},
  { name: 'Netlify', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'server', regex: /netlify/i, via: 'Server header' },
    { type: 'header', key: 'x-nf-request-id', regex: /.+/, via: 'Netlify request ID' }
  ]},
  { name: 'Amazon CloudFront', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'x-amz-cf-id', regex: /.+/, via: 'X-Amz-Cf-Id header' },
    { type: 'header', key: 'via', regex: /cloudfront/i, via: 'Via header' },
    { type: 'header', key: 'server', regex: /cloudfront/i, via: 'Server header' }
  ]},
  { name: 'Amazon S3', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'server', regex: /amazonaws|amazons3/i, via: 'Server header' }
  ]},
  { name: 'AWS', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'server', regex: /amazon|aws/i, via: 'Server header' },
    { type: 'header', key: 'x-amz-', regex: /.+/, via: 'AWS header' }
  ]},
  { name: 'Fastly', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'server', regex: /fastly/i, via: 'Server header' },
    { type: 'header', key: 'x-served-by', regex: /cache-/i, via: 'Fastly cache header' },
    { type: 'header', key: 'via', regex: /varnish|fastly/i, via: 'Via header' }
  ]},
  { name: 'Akamai', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'server', regex: /akamai/i, via: 'Server header' },
    { type: 'header', key: 'x-akamai-transformed', regex: /.+/, via: 'Akamai header' }
  ]},
  { name: 'GitHub Pages', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'server', regex: /github/i, via: 'Server header' }
  ]},
  { name: 'Pantheon', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'server', regex: /pantheon/i, via: 'Server header' },
    { type: 'header', key: 'x-pantheon-endpoint', regex: /.+/, via: 'Pantheon header' }
  ]},
  { name: 'Azure CDN', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'server', regex: /azure|azurewebsites/i, via: 'Server header' },
    { type: 'header', key: 'x-azure-ref', regex: /.+/, via: 'Azure CDN header' }
  ]},
  { name: 'Google Cloud CDN', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'via', regex: /google\s*cloud\s*cdn/i, via: 'Via header' },
    { type: 'header', key: 'server', regex: /gse|gws/i, via: 'Google Frontend header' }
  ]},
  { name: 'Bunny CDN', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'server', regex: /bunnycdn/i, via: 'Server header' },
    { type: 'header', key: 'x-bunny-region', regex: /.+/, via: 'Bunny CDN header' }
  ]},
  { name: 'KeyCDN', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'x-keycdn-region', regex: /.+/, via: 'KeyCDN header' },
    { type: 'header', key: 'server', regex: /keycdn/i, via: 'Server header' }
  ]},
  { name: 'StackPath', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'server', regex: /stackpath/i, via: 'Server header' },
    { type: 'header', key: 'x-stackpath-', regex: /.+/, via: 'StackPath header' }
  ]},
  { name: 'CacheFly', category: 'CDN / Hosting', patterns: [
    { type: 'html', regex: /cachefly\.net/, via: 'CacheFly asset path' }
  ]},
  { name: 'CDN77', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'server', regex: /cdn77/i, via: 'Server header' }
  ]},
  { name: 'Fly.io', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'server', regex: /fly\.io/i, via: 'Server header' },
    { type: 'header', key: 'x-fly-request-id', regex: /.+/, via: 'Fly.io request ID' }
  ]},
  { name: 'Deno Deploy', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'server', regex: /deno/i, via: 'Server header' }
  ]},
  { name: 'Cloudflare Pages', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'x-pages-route', regex: /.+/, via: 'Pages route header' },
    { type: 'header', key: 'cf-pages-', regex: /.+/, via: 'CF Pages header' }
  ]},

  // ── JavaScript Libraries ──
  { name: 'jQuery', category: 'JavaScript Library', versionPattern: /jquery[-\/]?(\d+(?:\.\d+)+)/i, patterns: [
    { type: 'script_src', regex: /jquery(?:-\d+(?:\.\d+)*|core)?(?:\.min)?\.js/i, via: 'jQuery script src' },
    { type: 'html', regex: /jQuery v\d|jquery\.com/, via: 'jQuery reference' }
  ]},
  { name: 'GSAP', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /gsap(?:\.min)?\.js|greensock/i, via: 'GSAP script src' }
  ]},
  { name: 'Lodash', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /lodash(?:-\d|\.min)?\.js/i, via: 'Lodash script src' }
  ]},
  { name: 'Moment.js', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /moment(?:-\d|\.min)?\.js/i, via: 'Moment.js script src' }
  ]},
  { name: 'Three.js', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /three(?:\.min)?\.js/i, via: 'Three.js script src' }
  ]},
  { name: 'Bootstrap', category: 'CSS Framework', versionPattern: /bootstrap[\/-]?(\d+(?:\.\d+)+)/i, patterns: [
    { type: 'script_src', regex: /bootstrap(?:\.bundle)?(?:\.min)?\.js/i, via: 'Bootstrap script src' },
    { type: 'html', regex: /bootstrap(?:-\d)?(?:\.min)?\.(?:css|js)/i, via: 'Bootstrap asset' }
  ]},
  { name: 'Tailwind CSS', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /cdn\.tailwindcss\.com/, via: 'Tailwind CDN script' },
    { type: 'html', regex: /tailwind\.css/, via: 'Tailwind stylesheet' }
  ]},
  { name: 'Font Awesome', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /fontawesome|font-awesome/i, via: 'Font Awesome reference' }
  ]},
  { name: 'Lottie', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /lottie/i, via: 'Lottie script src' }
  ]},
  { name: 'Swiper', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /swiper(?:\.bundle|\.min)?\.js/i, via: 'Swiper script src' }
  ]},
  { name: 'Axios', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /axios(?:\.min)?\.js/i, via: 'Axios script src' }
  ]},
  { name: 'Framer Motion', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /framer-motion/i, via: 'Framer Motion script src' }
  ]},
  { name: 'PixiJS', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /pixi(?:\.min)?\.js/i, via: 'PixiJS script src' }
  ]},
  { name: 'Anime.js', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /anime(?:\.min)?\.js/i, via: 'Anime.js script src' }
  ]},
  { name: 'Hammer.js', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /hammer(?:\.min)?\.js/i, via: 'Hammer.js script src' }
  ]},
  { name: 'Modernizr', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /modernizr(?:\.min)?\.js/, via: 'Modernizr script src' }
  ]},
  { name: 'Highlight.js', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /highlight(?:\.min)?\.js|hljs\.highlight/, via: 'Highlight.js script' }
  ]},
  { name: 'Isotope', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /isotope(?:\.min)?\.js/i, via: 'Isotope script src' }
  ]},
  { name: 'Masonry', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /masonry(?:\.min)?\.js/i, via: 'Masonry script src' },
    { type: 'html', regex: /masonry\-layout/, via: 'Masonry layout reference' }
  ]},
  { name: 'Slick Carousel', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /slick(?:\.min)?\.js/i, via: 'Slick script src' },
    { type: 'html', regex: /slick\-slider|slick\-slide/, via: 'Slick carousel class' }
  ]},
  { name: 'Owl Carousel', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /owl\.carousel(?:\.min)?\.js/i, via: 'Owl Carousel script src' },
    { type: 'html', regex: /owl\-carousel|owl\-stage|owl\-item/, via: 'Owl Carousel class' }
  ]},
  { name: 'AOS (Animate On Scroll)', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /aos\.init|aos\.js|data-aos=/, via: 'AOS library' }
  ]},
  { name: 'ScrollReveal', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /scrollreveal(?:\.min)?\.js/i, via: 'ScrollReveal script src' }
  ]},
  { name: 'Typed.js', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /typed(?:\.min)?\.js/i, via: 'Typed.js script src' }
  ]},
  { name: 'Particles.js', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /particles\.js|particlesJS|particles\-container/, via: 'Particles.js' }
  ]},
  { name: 'DataTables', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /datatables(?:\.min)?\.css|\.DataTable\(|dataTable|cdataTable/i, via: 'DataTables reference' }
  ]},
  { name: 'Select2', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /select2(?:\.min)?\.(?:js|css)/i, via: 'Select2 library' }
  ]},
  { name: 'Flatpickr', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /flatpickr(?:\.min)?\.(?:js|css)/i, via: 'Flatpickr datepicker' }
  ]},
  { name: 'Quill Editor', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /quill(?:\.min)?\.(?:js|css)|quill\-editor/i, via: 'Quill rich text editor' }
  ]},
  { name: 'TinyMCE', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /tinymce(?:\.min)?\.js/i, via: 'TinyMCE editor script src' },
    { type: 'html', regex: /tinymce\.init/i, via: 'TinyMCE init call' }
  ]},
  { name: 'CKEditor', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /ckeditor|CKEDITOR/i, via: 'CKEditor reference' }
  ]},
  { name: 'CodeMirror', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /codemirror(?:\.min)?\.(?:js|css)/i, via: 'CodeMirror reference' }
  ]},
  { name: 'Prism.js', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /prism(?:\.min)?\.(?:js|css)/i, via: 'Prism.js syntax highlighter' }
  ]},
  { name: 'marked.js', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /marked(?:\.min)?\.js/i, via: 'marked.js script src' }
  ]},
  { name: 'howler.js', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /howler(?:\.min)?\.js/i, via: 'howler.js script src' }
  ]},
  { name: 'pdf.js', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /pdf\.js\/viewer|pdfjsLib|mozilla.github\.io\/pdf/, via: 'pdf.js viewer' }
  ]},
  { name: 'DOMPurify', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /dompurify(?:\.min)?\.js|DOMPurify\.sanitize/i, via: 'DOMPurify script' }
  ]},
  { name: 'Immer', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /immer(?:\.min)?\.js/i, via: 'Immer script src' }
  ]},
  { name: 'Zustand', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /zustand/i, via: 'Zustand script src' }
  ]},
  { name: 'Zod', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /zod(?:\.min)?\.js/i, via: 'Zod script src' }
  ]},
  { name: 'React Router', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /react-router(?:-dom)?(?:\.min)?\.js/i, via: 'React Router script src' }
  ]},

  // ── Web Servers ──
  { name: 'Nginx', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /nginx/i, via: 'Server header' }
  ]},
  { name: 'Apache', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /apache/i, via: 'Server header' }
  ]},
  { name: 'Express', category: 'Web Server', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /express/i, via: 'X-Powered-By header' }
  ]},
  { name: 'IIS', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /microsoft-iis/i, via: 'Server header' }
  ]},
  { name: 'LiteSpeed', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /litespeed/i, via: 'Server header' }
  ]},
  { name: 'Caddy', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /caddy/i, via: 'Server header' }
  ]},
  { name: 'Tomcat', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /tomcat/i, via: 'Server header' }
  ]},
  { name: 'Jetty', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /jetty/i, via: 'Server header' }
  ]},
  { name: 'Envoy', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /envoy/i, via: 'Server header' }
  ]},
  { name: 'HAProxy', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /haproxy/i, via: 'Server header' },
    { type: 'header', key: 'x-haproxy-', regex: /.+/, via: 'HAProxy header' }
  ]},
  { name: 'Traefik', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /traefik/i, via: 'Server header' }
  ]},
  { name: 'OpenResty', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /openresty/i, via: 'Server header' }
  ]},
  { name: 'Kestrel', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /kestrel/i, via: 'Server header' }
  ]},
  { name: 'Gunicorn', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /gunicorn/i, via: 'Server header' }
  ]},
  { name: 'uWSGI', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /uwsgi/i, via: 'Server header' }
  ]},
  { name: 'Lighttpd', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /lighttpd/i, via: 'Server header' }
  ]},

  // ── Payment Processors ──
  { name: 'Stripe', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /js\.stripe\.com\/v3\/?/, via: 'Stripe.js script' },
    { type: 'html', regex: /pk_live_[a-zA-Z0-9]+|pk_test_[a-zA-Z0-9]+/, via: 'Stripe publishable key' }
  ]},
  { name: 'PayPal', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /paypal\.com\/sdk\/js|paypal\.com\/checkoutscript/, via: 'PayPal SDK' }
  ]},
  { name: 'Snipcart', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /cdn\.snipcart\.com/, via: 'Snipcart script' }
  ]},
  { name: 'Square', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /js\.squareup\.com/, via: 'Square script' }
  ]},
  { name: 'Braintree', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /braintreegateway\.com|js\.braintree/, via: 'Braintree script' }
  ]},
  { name: 'Paddle', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /cdn\.paddle\.com\/paddle\/|paddle\.js/, via: 'Paddle.js script' }
  ]},
  { name: 'Lemon Squeezy', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /lmsqueezy\.com|lemon\.squeezy|lemon-squeezy/, via: 'Lemon Squeezy reference' }
  ]},
  { name: 'Gumroad', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /gumroad\.com\/js\/gumroad|gumroad\-overlay/, via: 'Gumroad overlay script' }
  ]},
  { name: 'Chargebee', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /chargebee\.com\/js|chargebee\-static/, via: 'Chargebee script' }
  ]},
  { name: 'Adyen', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /adyen\.com\/static|checkoutshopper/, via: 'Adyen checkout' }
  ]},
  { name: 'Razorpay', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /razorpay\.com\/static\/js/, via: 'Razorpay script' }
  ]},
  { name: 'Mollie', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /mollie\.com\/js|mollie\.cdn/, via: 'Mollie script' }
  ]},
  { name: 'Klarna', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /klarna\.com\/onsite\/js|klarna\-cdn/, via: 'Klarna checkout' }
  ]},
  { name: 'Recurly', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /recurly\.com\/js/, via: 'Recurly script' }
  ]},

  // ── Page Builders ──
  { name: 'Elementor', category: 'Page Builder', patterns: [
    { type: 'html', regex: /elementor(?:-\d+)?[\.\/ ]/i, via: 'Elementor CSS class' }
  ]},
  { name: 'WPBakery', category: 'Page Builder', patterns: [
    { type: 'html', regex: /wpb_composer|vc_/i, via: 'WPBakery class' }
  ]},
  { name: 'Divi', category: 'Page Builder', patterns: [
    { type: 'html', regex: /et_builder|divi-/i, via: 'Divi builder class' }
  ]},
  { name: 'Beaver', category: 'Page Builder', patterns: [
    { type: 'html', regex: /fl-builder|fl-module|fl-col/i, via: 'Beaver Builder CSS classes' }
  ]},
  { name: 'Oxygen Builder', category: 'Page Builder', patterns: [
    { type: 'html', regex: /oxygen\-builder|ct_section|ct-divider/i, via: 'Oxygen Builder reference' }
  ]},
  { name: 'Bricks Builder', category: 'Page Builder', patterns: [
    { type: 'html', regex: /brxe-/i, via: 'Bricks Builder CSS class' }
  ]},
  { name: 'Gutenberg', category: 'Page Builder', patterns: [
    { type: 'html', regex: /wp-block-|wp-block-editor|block-editor-wrapper/i, via: 'Gutenberg block classes' }
  ]},
  { name: 'Brizy', category: 'Page Builder', patterns: [
    { type: 'html', regex: /brz-/i, via: 'Brizy CSS class' }
  ]},
  { name: 'SiteOrigin', category: 'Page Builder', patterns: [
    { type: 'html', regex: /siteorigin|siteorigin-panels/i, via: 'SiteOrigin builder reference' }
  ]},
  { name: 'Cornerstone', category: 'Page Builder', patterns: [
    { type: 'html', regex: /cstm\-btn|cornerstone/i, via: 'Cornerstone builder' }
  ]},
  { name: 'Thrive Architect', category: 'Page Builder', patterns: [
    { type: 'html', regex: /tve\-builder|thrive\-theme|thrive\-wrapper/i, via: 'Thrive Architect builder' }
  ]},

  // ── Cookie Consent ──
  { name: 'Cookiebot', category: 'Cookie Consent', patterns: [
    { type: 'html', regex: /cookiebot\.com/i, via: 'Cookiebot script' }
  ]},
  { name: 'OneTrust', category: 'Cookie Consent', patterns: [
    { type: 'html', regex: /onetrust\.com|Optanon/, via: 'OneTrust banner' }
  ]},
  { name: 'CookieYes', category: 'Cookie Consent', patterns: [
    { type: 'html', regex: /cookieyes\.com/i, via: 'CookieYes script' }
  ]},
  { name: 'Cookie Script', category: 'Cookie Consent', patterns: [
    { type: 'html', regex: /cookie\-script\.com/i, via: 'Cookie Script' }
  ]},
  { name: 'Osano', category: 'Cookie Consent', patterns: [
    { type: 'html', regex: /osano\.com|cookieconsent\.min/i, via: 'Osano cookie consent' }
  ]},
  { name: 'Finsweet', category: 'Cookie Consent', patterns: [
    { type: 'html', regex: /finsweet\.com\/cookie/, via: 'Finsweet cookie consent' }
  ]},

  // ── Authentication ──
  { name: 'Auth0', category: 'Authentication', patterns: [
    { type: 'html', regex: /auth0\.com\/js|auth0\-cdn|auth0\.js/i, via: 'Auth0 script' }
  ]},
  { name: 'Firebase Auth', category: 'Authentication', patterns: [
    { type: 'html', regex: /firebase\.com\/web\/auth|firebaseui./i, via: 'Firebase Auth script' }
  ]},
  { name: 'Clerk', category: 'Authentication', patterns: [
    { type: 'html', regex: /clerk\.accounts/i, via: 'Clerk script' }
  ]},
  { name: 'Supabase Auth', category: 'Authentication', patterns: [
    { type: 'html', regex: /supabase\.co\/auth|supabase\.js/i, via: 'Supabase Auth script' }
  ]},

  // ── E-Commerce ──
  { name: 'WooCommerce', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /wp-content\/plugins\/woocommerce|woocommerce/i, via: 'WooCommerce plugin paths' }
  ]},
  { name: 'Magento', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /magento\-version|requirejs\/mage/i, via: 'Magento JS' },
    { type: 'header', key: 'x-magento-init', regex: /.+/, via: 'X-Magento-Init header' }
  ]},
  { name: 'BigCommerce', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /bigcommerce\.com|cdn\.bigcommerce/i, via: 'BigCommerce CDN' }
  ]},
  { name: 'Saleor', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /saleor\.io|graphql\.saleor/i, via: 'Saleor reference' }
  ]},
  { name: 'Medusa.js', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /medusa\-js|medusa\.app/i, via: 'Medusa.js reference' }
  ]},
  { name: 'Ecwid', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /ecwid\.com\/script|ecwid\-widget/i, via: 'Ecwid widget' }
  ]},
  { name: 'Shopify', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /cdn\.shopify\.com|shopify\.theme/, via: 'Shopify CDN reference' },
    { type: 'header', key: 'set-cookie', regex: /_shopify/i, via: 'Shopify cookie' },
    { type: 'header', key: 'x-shopify-stage', regex: /.+/, via: 'X-Shopify-Stage header' },
    { type: 'header', key: 'x-shopid', regex: /.+/, via: 'X-ShopId header' }
  ]},

  // ── Customer Support ──
  { name: 'Intercom', category: 'Customer Support', patterns: [
    { type: 'html', regex: /intercom\.io\/widget|Intercom\b/i, via: 'Intercom widget script' }
  ]},
  { name: 'Drift', category: 'Customer Support', patterns: [
    { type: 'html', regex: /drift\.com\/snippet|drift\.widget/i, via: 'Drift widget' }
  ]},
  { name: 'Crisp', category: 'Customer Support', patterns: [
    { type: 'html', regex: /crisp\.chat\/|crisp\-site/i, via: 'Crisp chat widget' }
  ]},
  { name: 'Zendesk', category: 'Customer Support', patterns: [
    { type: 'html', regex: /zendesk\.com\/embeddable|zopim|widget\.zopim/i, via: 'Zendesk widget' }
  ]},
  { name: 'Tawk.to', category: 'Customer Support', patterns: [
    { type: 'html', regex: /tawk\.to\/widget|Tawk_API/i, via: 'Tawk.to widget' }
  ]},
  { name: 'LiveChat', category: 'Customer Support', patterns: [
    { type: 'html', regex: /livechat\.com\/js\/widget|livechatinc/i, via: 'LiveChat widget' }
  ]},
  { name: 'Freshchat', category: 'Customer Support', patterns: [
    { type: 'html', regex: /freshchat\.com\/js\/widget|freshworks\.com/i, via: 'Freshchat widget' }
  ]},
  { name: 'HubSpot Chat', category: 'Customer Support', patterns: [
    { type: 'html', regex: /hubspot\.com\/chat|hs\-chat|hsConversations/i, via: 'HubSpot chat widget' }
  ]},

  // ── Marketing ──
  { name: 'HubSpot', category: 'Marketing', patterns: [
    { type: 'html', regex: /hubspot\.com\/__hmc|hs\-analytics|hs\-scripts/i, via: 'HubSpot marketing scripts' }
  ]},
  { name: 'Mailchimp', category: 'Marketing', patterns: [
    { type: 'html', regex: /mailchimp\.com\/js|chimpstatic/i, via: 'Mailchimp script' }
  ]},
  { name: 'ConvertKit', category: 'Marketing', patterns: [
    { type: 'html', regex: /convertkit\.com\/js|ck_form|ckid/i, via: 'ConvertKit script' }
  ]},
  { name: 'Marketo', category: 'Marketing', patterns: [
    { type: 'html', regex: /marketo\.com\/js\/mkto|mktoTrack|MktoForms/i, via: 'Marketo script' }
  ]},
  { name: 'ActiveCampaign', category: 'Marketing', patterns: [
    { type: 'html', regex: /activecampaign\.com\/js|trackcmp/i, via: 'ActiveCampaign script' }
  ]},
  { name: 'MailerLite', category: 'Marketing', patterns: [
    { type: 'html', regex: /mailerlite\.com\/js|ml\-form|ml\-subscribe/i, via: 'MailerLite form' }
  ]},
  { name: 'Klaviyo', category: 'Marketing', patterns: [
    { type: 'html', regex: /klaviyo\.com\/onsite|klaviyo\.com\/js/i, via: 'Klaviyo script' }
  ]},

  // ── Security ──
  { name: 'reCAPTCHA', category: 'Security', patterns: [
    { type: 'html', regex: /google\.com\/recaptcha\/api\.js|recaptcha\/api\.js/i, via: 'reCAPTCHA script' }
  ]},
  { name: 'hCaptcha', category: 'Security', patterns: [
    { type: 'html', regex: /hcaptcha\.com\/1\/api\.js|hcaptcha\-widget/i, via: 'hCaptcha script' }
  ]},
  { name: 'Turnstile', category: 'Security', patterns: [
    { type: 'html', regex: /challenges\.cloudflare\.com\/turnstile|turnstile\.render/i, via: 'Turnstile widget' }
  ]},
  { name: 'Sucuri', category: 'Security', patterns: [
    { type: 'header', key: 'x-sucuri-id', regex: /.+/, via: 'Sucuri header' },
    { type: 'header', key: 'x-sucuri-cache', regex: /.+/, via: 'Sucuri cache header' }
  ]},
  { name: 'ModSecurity', category: 'Security', patterns: [
    { type: 'header', key: 'x-ms-', regex: /.+/, via: 'ModSecurity header' }
  ]},

  // ── Platform / Language ──
  { name: 'PHP', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /php/i, via: 'X-Powered-By header' },
    { type: 'header', key: 'set-cookie', regex: /PHPSESSID/i, via: 'PHP session cookie' }
  ]},
  { name: 'Python', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'server', regex: /python|gunicorn|uwsgi/i, via: 'Server header' },
    { type: 'header', key: 'x-powered-by', regex: /python/i, via: 'X-Powered-By header' }
  ]},
  { name: 'Ruby', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'server', regex: /ruby|passenger|puma/i, via: 'Server header' },
    { type: 'header', key: 'x-powered-by', regex: /ruby/i, via: 'X-Powered-By header' }
  ]},
  { name: 'Java', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /java|servlet/i, via: 'X-Powered-By header' }
  ]},
  { name: '.NET', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /asp\.net/i, via: 'X-Powered-By header' },
    { type: 'header', key: 'set-cookie', regex: /\.ASPXAUTH|ASP\.NET_SessionId/i, via: 'ASP.NET cookie' }
  ]},
  { name: 'Node.js', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /node/i, via: 'X-Powered-By header' }
  ]},
  { name: 'Go', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'server', regex: /gojek|golang/i, via: 'Server header' }
  ]},
  { name: 'Cloudflare Workers', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'cf-worker', regex: /.+/, via: 'CF-Worker header' }
  ]},
  { name: 'Supabase', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /supabase/i, via: 'Supabase header' },
    { type: 'html', regex: /supabase\.co|supabase\.js/i, via: 'Supabase reference' }
  ]},
  { name: 'Firebase', category: 'Platform / Language', patterns: [
    { type: 'html', regex: /firebase(?:\.min)?\.js|firebaseio\.com|firestore\.googleapis/i, via: 'Firebase SDK' }
  ]},
  { name: 'Render', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'server', regex: /render/i, via: 'Server header' }
  ]},
  { name: 'Railway', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'server', regex: /railway/i, via: 'Server header' }
  ]},

  // ── Monitoring ──
  { name: 'Pingdom', category: 'Monitoring', patterns: [
    { type: 'html', regex: /pingdom\.com\/pingcheck|_prum/i, via: 'Pingdom script' }
  ]},
  { name: 'Uptime Robot', category: 'Monitoring', patterns: [
    { type: 'html', regex: /uptimerobot\.com\//, via: 'Uptime Robot reference' }
  ]},
  { name: 'Statuspage', category: 'Monitoring', patterns: [
    { type: 'html', regex: /statuspage\.(?:io|com)/, via: 'Statuspage reference' }
  ]},
  { name: 'Better Stack', category: 'Monitoring', patterns: [
    { type: 'html', regex: /betterstack\.com\/status/, via: 'Better Stack status' }
  ]},

  // ── Backend Frameworks ──
  { name: 'Laravel', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /laravel/i, via: 'X-Powered-By header' },
    { type: 'cookie', regex: /laravel_session/i, via: 'Laravel session cookie' }
  ]},
  { name: 'Django', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'server', regex: /django|wsgi/i, via: 'Server header' },
    { type: 'cookie', regex: /csrftoken|sessionid/i, via: 'Django cookies' }
  ]},
  { name: 'Ruby on Rails', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /rails/i, via: 'X-Powered-By header' },
    { type: 'cookie', regex: /_session_id|_rails/i, via: 'Rails session cookie' }
  ]},
  { name: 'ASP.NET', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /asp\.net/i, via: 'X-Powered-By header' },
    { type: 'header', key: 'x-aspnet-version', regex: /.+/, via: 'X-AspNet-Version header' }
  ]},
  { name: 'Spring Boot', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'x-application-context', regex: /.+/, via: 'Spring header' }
  ]},
  { name: 'Flask', category: 'Backend Framework', patterns: [
    { type: 'cookie', regex: /session=|flask/i, via: 'Flask session cookie' }
  ]},
  { name: 'FastAPI', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'server', regex: /uvicorn/i, via: 'Uvicorn server' }
  ]},
  { name: 'Koa.js', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /koa/i, via: 'X-Powered-By header' }
  ]},
  { name: 'Next.js (API)', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /next\.?js/i, via: 'Next.js API routes' }
  ]},

  // ── Database ──
  { name: 'MySQL', category: 'Database', patterns: [
    { type: 'header', key: 'set-cookie', regex: /mysql/i, via: 'MySQL cookie' },
    { type: 'header', key: 'x-powered-by', regex: /mysql/i, via: 'Server header' }
  ]},
  { name: 'PostgreSQL', category: 'Database', patterns: [
    { type: 'header', key: 'server', regex: /postgres|pgsql/i, via: 'PostgreSQL server' }
  ]},
  { name: 'Microsoft SQL Server', category: 'Database', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /sql\s*server/i, via: 'SQL Server header' }
  ]},
  { name: 'MongoDB', category: 'Database', patterns: [
    { type: 'header', key: 'server', regex: /mongodb/i, via: 'MongoDB server' },
    { type: 'cookie', regex: /mongo/i, via: 'MongoDB cookie' }
  ]},
  { name: 'Redis', category: 'Database', patterns: [
    { type: 'cookie', regex: /redis/i, via: 'Redis session' }
  ]},
  { name: 'SQLite', category: 'Database', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /sqlite/i, via: 'SQLite header' }
  ]},

  // ── Cloud Platform ──
  { name: 'AWS', category: 'Cloud Platform', patterns: [
    { type: 'header', key: 'x-amz-', regex: /.+/, via: 'AWS header' },
    { type: 'header', key: 'server', regex: /amazon|aws/i, via: 'AWS server' }
  ]},
  { name: 'Google Cloud', category: 'Cloud Platform', patterns: [
    { type: 'header', key: 'server', regex: /google\s*cloud|gcp|gws/i, via: 'GCP server' },
    { type: 'header', key: 'via', regex: /google\s*cloud/i, via: 'GCP via header' }
  ]},
  { name: 'Azure', category: 'Cloud Platform', patterns: [
    { type: 'header', key: 'server', regex: /azure|azurewebsites/i, via: 'Azure server' },
    { type: 'header', key: 'x-azure-ref', regex: /.+/, via: 'Azure header' }
  ]},
  { name: 'DigitalOcean', category: 'Cloud Platform', patterns: [
    { type: 'header', key: 'server', regex: /digitalocean/i, via: 'DigitalOcean server' },
    { type: 'header', key: 'do-', regex: /.+/, via: 'DigitalOcean header' }
  ]},
  { name: 'Heroku', category: 'Cloud Platform', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /heroku/i, via: 'Heroku header' }
  ]},

  // ── Mobile Framework ──
  { name: 'React Native', category: 'Mobile Framework', patterns: [
    { type: 'html', regex: /react\-native/i, via: 'React Native reference' }
  ]},
  { name: 'Flutter', category: 'Mobile Framework', patterns: [
    { type: 'html', regex: /flutter\.js|flutter\-service-worker|flutter\.io/i, via: 'Flutter script' }
  ]},
  { name: 'Ionic', category: 'Mobile Framework', patterns: [
    { type: 'html', regex: /ionic\.io\/js|ionic\.bundle|ion\-app/i, via: 'Ionic framework' }
  ]},

  // ── Package Manager ──
  { name: 'npm', category: 'Package Manager', patterns: [
    { type: 'html', regex: /package-lock\.json|npm\.js|npm\.org/i, via: 'npm reference' }
  ]},
  { name: 'yarn', category: 'Package Manager', patterns: [
    { type: 'html', regex: /yarn\.lock|yarnpkg/i, via: 'yarn reference' }
  ]},
  { name: 'pnpm', category: 'Package Manager', patterns: [
    { type: 'html', regex: /pnpm-lock|pnpm\.io/i, via: 'pnpm reference' }
  ]},

  // ── VCS / Git Hosting ──
  { name: 'GitHub', category: 'VCS / Git Hosting', patterns: [
    { type: 'html', regex: /github\.com\/(?!.*\.(?:js|css|png|jpg))/i, via: 'GitHub link' }
  ]},
  { name: 'GitLab', category: 'VCS / Git Hosting', patterns: [
    { type: 'html', regex: /gitlab\.com\/(?!.*\.(?:js|css|png|jpg))/i, via: 'GitLab link' }
  ]},
  { name: 'Bitbucket', category: 'VCS / Git Hosting', patterns: [
    { type: 'html', regex: /bitbucket\.org\/(?!.*\.(?:js|css|png|jpg))/i, via: 'Bitbucket link' }
  ]},

  // ── CI/CD ──
  { name: 'Jenkins', category: 'CI/CD', patterns: [
    { type: 'header', key: 'x-jenkins', regex: /.+/, via: 'Jenkins header' }
  ]},
  { name: 'GitHub Actions', category: 'CI/CD', patterns: [
    { type: 'html', regex: /github\.com\/.*\/actions|github\.com\/.*\/workflows/i, via: 'GitHub Actions reference' }
  ]},
  { name: 'GitLab CI', category: 'CI/CD', patterns: [
    { type: 'html', regex: /gitlab\.com\/.*\/pipelines|\.gitlab-ci/i, via: 'GitLab CI reference' }
  ]},
  { name: 'CircleCI', category: 'CI/CD', patterns: [
    { type: 'html', regex: /circleci\.com\/gh\//i, via: 'CircleCI reference' }
  ]},

  // ── Container / Orchestration ──
  { name: 'Docker', category: 'Container / Orchestration', patterns: [
    { type: 'header', key: 'server', regex: /docker/i, via: 'Docker server' }
  ]},
  { name: 'Kubernetes', category: 'Container / Orchestration', patterns: [
    { type: 'header', key: 'server', regex: /kubernetes|kube/i, via: 'Kubernetes server' }
  ]},

  // ── Testing ──
  { name: 'Jest', category: 'Testing', patterns: [
    { type: 'html', regex: /jest\.js|jest\.io/i, via: 'Jest reference' }
  ]},
  { name: 'Cypress', category: 'Testing', patterns: [
    { type: 'html', regex: /cypress\.io|cypress\.js/i, via: 'Cypress reference' }
  ]},
  { name: 'Playwright', category: 'Testing', patterns: [
    { type: 'html', regex: /playwright\.dev|playwright\.js/i, via: 'Playwright reference' }
  ]},

  // ── API Protocol ──
  { name: 'GraphQL', category: 'API Protocol', patterns: [
    { type: 'html', regex: /\/graphql|graphql\.js|graphql\.org/i, via: 'GraphQL endpoint' }
  ]},
  { name: 'REST API', category: 'API Protocol', patterns: [
    { type: 'html', regex: /\/api\/|api\.json|application\/json/i, via: 'REST API reference' }
  ]},
  { name: 'WebSocket', category: 'API Protocol', patterns: [
    { type: 'header', key: 'upgrade', regex: /websocket/i, via: 'WebSocket upgrade header' },
    { type: 'html', regex: /new\s+WebSocket|ws:\/\/|wss:\/\//i, via: 'WebSocket connection' }
  ]},

  // ── Authentication ──
  { name: 'JWT', category: 'Authentication', patterns: [
    { type: 'html', regex: /json\s*web\s*token|jwt\.io|jwt\.decode/i, via: 'JWT reference' }
  ]},
  { name: 'OAuth', category: 'Authentication', patterns: [
    { type: 'html', regex: /oauth|oauth2|oauth\.net/i, via: 'OAuth reference' }
  ]},

  // ── Advertising / Ad Tech ──
  { name: 'Google AdSense', category: 'Advertising', patterns: [
    { type: 'html', regex: /googlesyndication\.com|pagead2\.google|adsbygoogle/i, via: 'AdSense script' }
  ]},
  { name: 'Google Ad Manager', category: 'Advertising', patterns: [
    { type: 'html', regex: /googletagservices\.com|gpt\.js|googletag\.defineSlot/i, via: 'Google Ad Manager (DFP)' }
  ]},
  { name: 'Amazon Ads', category: 'Advertising', patterns: [
    { type: 'html', regex: /amazon-adsystem\.com|aax\.amazon|amznadsi/i, via: 'Amazon Ads script' }
  ]},
  { name: 'Meta Ads (Facebook)', category: 'Advertising', patterns: [
    { type: 'html', regex: /connect\.facebook\.net\/.*fbevents|fbq\(/i, via: 'Meta Ads pixel' }
  ]},
  { name: 'Criteo', category: 'Advertising', patterns: [
    { type: 'html', regex: /criteo\.com\/js|criteo\.net|criteo\-tap/i, via: 'Criteo script' }
  ]},
  { name: 'Taboola', category: 'Advertising', patterns: [
    { type: 'html', regex: /taboola\.com\/js|taboola\.net/i, via: 'Taboola script' }
  ]},
  { name: 'Outbrain', category: 'Advertising', patterns: [
    { type: 'html', regex: /outbrain\.com\/js|outbrain\.net|OBR\.extern/i, via: 'Outbrain script' }
  ]},
  { name: 'The Trade Desk', category: 'Advertising', patterns: [
    { type: 'html', regex: /adsrvr\.org|thetradedesk\.com/i, via: 'The Trade Desk script' }
  ]},
  { name: 'Xandr (AppNexus)', category: 'Advertising', patterns: [
    { type: 'html', regex: /xandr\.com\/js|adnxs\.com|appnexus/i, via: 'Xandr/AppNexus script' }
  ]},
  { name: 'PubMatic', category: 'Advertising', patterns: [
    { type: 'html', regex: /pubmatic\.com\/js|pubmatic\.net/i, via: 'PubMatic script' }
  ]},
  { name: 'TripleLift', category: 'Advertising', patterns: [
    { type: 'html', regex: /triplelift\.com|3lift\.com/i, via: 'TripleLift script' }
  ]},
  { name: 'Index Exchange', category: 'Advertising', patterns: [
    { type: 'html', regex: /indexww\.com|ix\.co\/js/i, via: 'Index Exchange script' }
  ]},
  { name: 'OpenX', category: 'Advertising', patterns: [
    { type: 'html', regex: /openx\.net\/js|openx\.org/i, via: 'OpenX script' }
  ]},
  { name: 'Magnite (Rubicon)', category: 'Advertising', patterns: [
    { type: 'html', regex: /rubiconproject\.com|magnite\.com/i, via: 'Magnite/Rubicon script' }
  ]},
  { name: 'Media.net', category: 'Advertising', patterns: [
    { type: 'html', regex: /media\.net\/js|media\.net\/ads/i, via: 'Media.net script' }
  ]},

  // ── Email Services ──
  { name: 'SendGrid', category: 'Email', patterns: [
    { type: 'html', regex: /sendgrid\.com\/v|sendgrid\.net/i, via: 'SendGrid reference' }
  ]},
  { name: 'Amazon SES', category: 'Email', patterns: [
    { type: 'html', regex: /amazonaws\.com\/ses|ses\.amazon/i, via: 'Amazon SES reference' }
  ]},
  { name: 'Mailgun', category: 'Email', patterns: [
    { type: 'html', regex: /mailgun\.com|mailgun\.net/i, via: 'Mailgun reference' }
  ]},
  { name: 'SparkPost', category: 'Email', patterns: [
    { type: 'html', regex: /sparkpost\.com|sparkpost\.net/i, via: 'SparkPost reference' }
  ]},
  { name: 'Postmark', category: 'Email', patterns: [
    { type: 'html', regex: /postmarkapp\.com|postmark\.net/i, via: 'Postmark reference' }
  ]},
  { name: 'Constant Contact', category: 'Email', patterns: [
    { type: 'html', regex: /constantcontact\.com\/js|ctct/i, via: 'Constant Contact script' }
  ]},
  { name: 'Campaign Monitor', category: 'Email', patterns: [
    { type: 'html', regex: /campaignmonitor\.com|createsend\.com/i, via: 'Campaign Monitor reference' }
  ]},
  { name: 'Google Workspace', category: 'Email', patterns: [
    { type: 'html', regex: /google\.com\/a\//, via: 'Google Workspace domains' }
  ]},
  { name: 'Microsoft 365', category: 'Email', patterns: [
    { type: 'html', regex: /microsoft\.com\/microsoft\-365|outlook\.office/i, via: 'Microsoft 365 reference' }
  ]},

  // ── Operating Systems ──
  { name: 'Linux', category: 'Operating System', patterns: [
    { type: 'header', key: 'server', regex: /linux/i, via: 'Server OS header' }
  ]},
  { name: 'Ubuntu', category: 'Operating System', patterns: [
    { type: 'header', key: 'server', regex: /ubuntu/i, via: 'Ubuntu server header' }
  ]},
  { name: 'Debian', category: 'Operating System', patterns: [
    { type: 'header', key: 'server', regex: /debian/i, via: 'Debian server header' }
  ]},
  { name: 'CentOS', category: 'Operating System', patterns: [
    { type: 'header', key: 'server', regex: /centos/i, via: 'CentOS server header' }
  ]},
  { name: 'Windows Server', category: 'Operating System', patterns: [
    { type: 'header', key: 'server', regex: /win32|windows/i, via: 'Windows server header' }
  ]},
  { name: 'FreeBSD', category: 'Operating System', patterns: [
    { type: 'header', key: 'server', regex: /freebsd/i, via: 'FreeBSD server header' }
  ]},
  { name: 'macOS Server', category: 'Operating System', patterns: [
    { type: 'header', key: 'server', regex: /macos|mac_os/i, via: 'macOS server header' }
  ]},

  // ── SSL / Certificate Authority ──
  { name: 'Let\'s Encrypt', category: 'SSL / TLS', patterns: [
    { type: 'header', key: 'strict-transport-security', regex: /.+/, via: 'HSTS present' }
  ]},
  { name: 'DigiCert', category: 'SSL / TLS', patterns: [
    { type: 'header', key: 'server', regex: /digicert/i, via: 'DigiCert server header' }
  ]},
  { name: 'GlobalSign', category: 'SSL / TLS', patterns: [
    { type: 'header', key: 'server', regex: /globalsign/i, via: 'GlobalSign server header' }
  ]},
  { name: 'Sectigo', category: 'SSL / TLS', patterns: [
    { type: 'header', key: 'server', regex: /sectigo/i, via: 'Sectigo server header' }
  ]},
  { name: 'Cloudflare SSL', category: 'SSL / TLS', patterns: [
    { type: 'header', key: 'cf-ray', regex: /.+/, via: 'Cloudflare SSL termination' }
  ]},

  // ── Font Scripts ──
  { name: 'Google Fonts', category: 'Font Scripts', patterns: [
    { type: 'html', regex: /fonts\.googleapis\.com|fonts\.gstatic\.com/, via: 'Google Fonts stylesheet/link' }
  ]},
  { name: 'Adobe Fonts / Typekit', category: 'Font Scripts', patterns: [
    { type: 'html', regex: /typekit\.com|use\.typekit\.net|ptype\.com/, via: 'Typekit script or CSS' }
  ]},
  { name: 'Fontsource', category: 'Font Scripts', patterns: [
    { type: 'html', regex: /fontsource\.org|@fontsource\//, via: 'Fontsource npm packages' }
  ]},
  { name: 'Bunny Fonts', category: 'Font Scripts', patterns: [
    { type: 'html', regex: /fonts\.bunny\.net|bunny\.net\/fonts/, via: 'Bunny Fonts CDN' }
  ]},
  { name: 'Font Squirrel', category: 'Font Scripts', patterns: [
    { type: 'html', regex: /fontsquirrel\.com|fontssquirrel\.net/, via: 'Font Squirrel reference' }
  ]},

  // ── Video Players ──
  { name: 'YouTube Player', category: 'Video Players', patterns: [
    { type: 'html', regex: /youtube\.com\/iframe_api|youtube\.com\/embed\/|youtube\.com\/player/, via: 'YouTube embed/player' }
  ]},
  { name: 'Vimeo', category: 'Video Players', patterns: [
    { type: 'html', regex: /player\.vimeo\.com\/video|vimeo\.com\/video\/|vimeocdn\.com/, via: 'Vimeo embed' }
  ]},
  { name: 'JW Player', category: 'Video Players', patterns: [
    { type: 'html', regex: /jwplayer\.com\/players|jwplayer\.com\/embed|jwplayer\.js/, via: 'JW Player script' }
  ]},
  { name: 'Video.js', category: 'Video Players', patterns: [
    { type: 'html', regex: /vjs\-|video\.js|videojs/, via: 'Video.js CSS/Script' }
  ]},
  { name: 'Plyr', category: 'Video Players', patterns: [
    { type: 'html', regex: /plyr(?:\.io|\-cdn|\.min)?\.(?:js|css)|plyr__player/i, via: 'Plyr player' }
  ]},
  { name: 'Wistia', category: 'Video Players', patterns: [
    { type: 'html', regex: /wistia\.com\/|wistia\-async|wistia\-embed/, via: 'Wistia video player' }
  ]},
  { name: 'Brightcove', category: 'Video Players', patterns: [
    { type: 'html', regex: /players\.brightcove\.net|bcove\.me|brightcove\.com/, via: 'Brightcove player' }
  ]},
  { name: 'Dailymotion', category: 'Video Players', patterns: [
    { type: 'html', regex: /dailymotion\.com\/embed|dailymotion\.com\/video/, via: 'Dailymotion embed' }
  ]},

  // ── Comment Systems ──
  { name: 'Disqus', category: 'Comment Systems', patterns: [
    { type: 'html', regex: /disqus\.com\/embed|disqus\.com\/count|disqus_thread|disqus_config/, via: 'Disqus embed script' }
  ]},
  { name: 'Facebook Comments', category: 'Comment Systems', patterns: [
    { type: 'html', regex: /facebook\.com\/plugins\/comment|fb\-comments/, via: 'Facebook Comments plugin' }
  ]},
  { name: 'Hyvor Talk', category: 'Comment Systems', patterns: [
    { type: 'html', regex: /hyvor\.com\/talk|hyvortalk/, via: 'Hyvor Talk comment system' }
  ]},
  { name: 'Commento', category: 'Comment Systems', patterns: [
    { type: 'html', regex: /commento\.io|commento\-cdn/, via: 'Commento comment system' }
  ]},

  // ── Search ──
  { name: 'Algolia', category: 'Search', patterns: [
    { type: 'html', regex: /algolia\.net\/|algolia\.com\/libs|algoliasearch/, via: 'Algolia search' },
    { type: 'html', regex: /data\-algolia|aa\.algolia/, via: 'Algolia data attributes' }
  ]},
  { name: 'Elasticsearch', category: 'Search', patterns: [
    { type: 'html', regex: /elastic\.co|elasticsearch/, via: 'Elasticsearch reference' }
  ]},
  { name: 'Meilisearch', category: 'Search', patterns: [
    { type: 'html', regex: /meilisearch\.com|meili\-search/, via: 'Meilisearch reference' }
  ]},
  { name: 'Typesense', category: 'Search', patterns: [
    { type: 'html', regex: /typesense\.org|typesense\.js/, via: 'Typesense reference' }
  ]},
  { name: 'Swiftype', category: 'Search', patterns: [
    { type: 'html', regex: /swiftype\.com|swiftype\-cdn/, via: 'Swiftype search' }
  ]},

  // ── Charts / Data Visualization ──
  { name: 'Chart.js', category: 'Charts / Data Visualization', patterns: [
    { type: 'html', regex: /chart\.js|chartjs\.org/, via: 'Chart.js script' }
  ]},
  { name: 'ApexCharts', category: 'Charts / Data Visualization', patterns: [
    { type: 'html', regex: /apexcharts\.com|apexcharts\.min|apexcharts\/dist/, via: 'ApexCharts script' }
  ]},
  { name: 'ECharts', category: 'Charts / Data Visualization', patterns: [
    { type: 'html', regex: /echarts|echarts\.min\.js/, via: 'ECharts library' }
  ]},
  { name: 'Recharts', category: 'Charts / Data Visualization', patterns: [
    { type: 'html', regex: /recharts|recharts\.org/, via: 'Recharts library' }
  ]},
  { name: 'D3.js', category: 'Charts / Data Visualization', patterns: [
    { type: 'html', regex: /d3js\.org|d3\.min\.js/, via: 'D3.js data visualization' }
  ]},
  { name: 'Nivo', category: 'Charts / Data Visualization', patterns: [
    { type: 'html', regex: /nivo\.rocks|@nivo\//, via: 'Nivo chart library' }
  ]},
  { name: 'Plotly', category: 'Charts / Data Visualization', patterns: [
    { type: 'html', regex: /plotly\.com\/|plotly(?:\.min)?\.js/, via: 'Plotly chart library' }
  ]},
  { name: 'Highcharts', category: 'Charts / Data Visualization', patterns: [
    { type: 'html', regex: /highcharts(?:\.min)?\.js|highcharts\.com/, via: 'Highcharts script' }
  ]},
  { name: 'Google Charts', category: 'Charts / Data Visualization', patterns: [
    { type: 'html', regex: /google\.com\/jsapi|google\.visualization/, via: 'Google Charts API' }
  ]},

  // ── Image CDN / Optimization ──
  { name: 'Cloudinary', category: 'Image CDN', patterns: [
    { type: 'html', regex: /res\.cloudinary\.com|cloudinary\.com\/js/, via: 'Cloudinary image CDN' }
  ]},
  { name: 'Imgix', category: 'Image CDN', patterns: [
    { type: 'html', regex: /imgix\.net|\.imgix\.net|imgix\.js/, via: 'Imgix image CDN' }
  ]},
  { name: 'ImageKit', category: 'Image CDN', patterns: [
    { type: 'html', regex: /ik\.imagekit\.io|imagekit\.io\/js/, via: 'ImageKit CDN' }
  ]},
  { name: 'Cloudimage', category: 'Image CDN', patterns: [
    { type: 'html', regex: /cloudimage\.io|cloudimage\-cdn/, via: 'Cloudimage service' }
  ]},
  { name: 'Next.js Image', category: 'Image CDN', patterns: [
    { type: 'html', regex: /_next\/image\?|__next_image/, via: 'Next.js Image optimization' }
  ]},

  // ── Animation / Scroll Libraries ──
  { name: 'Lenis', category: 'Animation', patterns: [
    { type: 'html', regex: /lenis(?:\.min)?\.js|lenis\-scroll/i, via: 'Lenis smooth scroll library' }
  ]},
  { name: 'Locomotive Scroll', category: 'Animation', patterns: [
    { type: 'html', regex: /locomotive-scroll|locomotivemtl/i, via: 'Locomotive Scroll library' }
  ]},
  { name: 'Barba.js', category: 'Animation', patterns: [
    { type: 'html', regex: /barba\.js|barba\.css|barba\-wrapper/, via: 'Barba.js page transition library' }
  ]},
  { name: 'Swup', category: 'Animation', patterns: [
    { type: 'html', regex: /swup\.js|swup\-cdn/, via: 'Swup page transition library' }
  ]},
  { name: 'Motion One', category: 'Animation', patterns: [
    { type: 'html', regex: /motion\.min\.js|motion\-dev|@motionone\//, via: 'Motion One animation library' }
  ]},
  { name: 'Rive', category: 'Animation', patterns: [
    { type: 'html', regex: /rive\.min\.js|rive\.app|rive\.wasm/, via: 'Rive animation player' }
  ]},

  // ── Maps ──
  { name: 'Google Maps', category: 'Maps', patterns: [
    { type: 'html', regex: /maps\.googleapis\.com\/maps\/api\/js/, via: 'Google Maps JS API' },
    { type: 'html', regex: /google\.maps\.Map|google\.maps\.Marker/, via: 'Google Maps API call' }
  ]},
  { name: 'Mapbox', category: 'Maps', patterns: [
    { type: 'html', regex: /api\.mapbox\.com\/mapbox\-gl|\/mapbox\-gl/, via: 'Mapbox GL JS' }
  ]},
  { name: 'Leaflet', category: 'Maps', patterns: [
    { type: 'html', regex: /leaflet(?:\.min)?\.(?:js|css)|leaflet\-dist/, via: 'Leaflet library' }
  ]},
  { name: 'MapLibre', category: 'Maps', patterns: [
    { type: 'html', regex: /maplibre|maplibre\-gl/, via: 'MapLibre GL JS' }
  ]},
  { name: 'Mapbox GL JS', category: 'Maps', patterns: [
    { type: 'html', regex: /mapbox-gl|mapboxgl\./, via: 'Mapbox GL JS library' }
  ]},
  { name: 'OpenLayers', category: 'Maps', patterns: [
    { type: 'html', regex: /openlayers\.org|ol\.min\.js|openlayers/, via: 'OpenLayers library' }
  ]},

  // ── Forums / Community ──
  { name: 'Discourse', category: 'Forums / Community', patterns: [
    { type: 'html', regex: /discourse\.org|discourse\.com|discourse\/assets/, via: 'Discourse forum' },
    { type: 'html', regex: /discourse\-topic|discourse\-post/, via: 'Discourse topics' }
  ]},
  { name: 'phpBB', category: 'Forums / Community', patterns: [
    { type: 'html', regex: /phpbb|phpbb3/, via: 'phpBB forum' }
  ]},
  { name: 'vBulletin', category: 'Forums / Community', patterns: [
    { type: 'html', regex: /vbulletin|vb\.org/, via: 'vBulletin forum' }
  ]},
  { name: 'XenForo', category: 'Forums / Community', patterns: [
    { type: 'html', regex: /xenforo\.com|xf\-skin|xfrm/, via: 'XenForo forum' }
  ]},
  { name: 'Flarum', category: 'Forums / Community', patterns: [
    { type: 'html', regex: /flarum\.org|flarum\-cdn/, via: 'Flarum forum' }
  ]},
  { name: 'Vanilla Forums', category: 'Forums / Community', patterns: [
    { type: 'html', regex: /vanillaforums\.com|vanillajs\.min/, via: 'Vanilla Forums' }
  ]},

  // ── Blog / Publishing ──
  { name: 'Medium', category: 'Blog / Publishing', patterns: [
    { type: 'html', regex: /medium\.com\/|cdn\-static\.medium/, via: 'Medium publishing' }
  ]},
  { name: 'Blogger / Blogspot', category: 'Blog / Publishing', patterns: [
    { type: 'html', regex: /blogspot\.com|blogger\.com/, via: 'Blogger platform' }
  ]},
  { name: 'Tumblr', category: 'Blog / Publishing', patterns: [
    { type: 'html', regex: /tumblr\.com|assets\.tumblr/, via: 'Tumblr blog' }
  ]},
  { name: 'Substack', category: 'Blog / Publishing', patterns: [
    { type: 'html', regex: /substack\.com\/|substackcdn/, via: 'Substack newsletter' }
  ]},
  { name: 'Ghost (Blog)', category: 'Blog / Publishing', patterns: [
    { type: 'html', regex: /ghost\.io\/assets|ghost\.app/, via: 'Ghost blog platform' }
  ]},
  { name: 'Hashnode', category: 'Blog / Publishing', patterns: [
    { type: 'html', regex: /hashnode\.com|hashnode\.dev|cdn\.hashnode/, via: 'Hashnode blog' }
  ]},
  { name: 'Dev.to', category: 'Blog / Publishing', patterns: [
    { type: 'html', regex: /dev\.to|devto|practicaldev\.github/, via: 'Dev.to community' }
  ]},

  // ── LMS / Education ──
  { name: 'Moodle', category: 'LMS / Education', patterns: [
    { type: 'html', regex: /moodle\.org|moodle\.js|theme\.moodle/, via: 'Moodle LMS' }
  ]},
  { name: 'Teachable', category: 'LMS / Education', patterns: [
    { type: 'html', regex: /teachable\.com\/|teachablecdn\.com/, via: 'Teachable platform' }
  ]},
  { name: 'Thinkific', category: 'LMS / Education', patterns: [
    { type: 'html', regex: /thinkific\.com|cdn\.thinkific/, via: 'Thinkific LMS' }
  ]},
  { name: 'Kajabi', category: 'LMS / Education', patterns: [
    { type: 'html', regex: /kajabi\.com|kajabi\-cdn/, via: 'Kajabi platform' }
  ]},
  { name: 'LearnDash', category: 'LMS / Education', patterns: [
    { type: 'html', regex: /learndash|ld\-topic|ld\-lesson/, via: 'LearnDash LMS plugin' }
  ]},
  { name: 'LifterLMS', category: 'LMS / Education', patterns: [
    { type: 'html', regex: /lifterlms|llms\-/, via: 'LifterLMS plugin' }
  ]},

  // ── Documentation ──
  { name: 'Swagger UI', category: 'Documentation', patterns: [
    { type: 'html', regex: /swaggerui|swagger\.json|swagger\.yaml|swaggerui\.js/, via: 'Swagger UI' }
  ]},
  { name: 'Redoc', category: 'Documentation', patterns: [
    { type: 'html', regex: /redoc\.standalone|redoc\.min\.js|redocly/, via: 'Redoc API docs' }
  ]},
  { name: 'ReadMe', category: 'Documentation', patterns: [
    { type: 'html', regex: /readme\.io|readme\-cdn/, via: 'ReadMe documentation' }
  ]},
  { name: 'GitBook', category: 'Documentation', patterns: [
    { type: 'html', regex: /gitbook\.io|gitbookcdn|gitbook\.com/, via: 'GitBook documentation' }
  ]},
  { name: 'Stoplight', category: 'Documentation', patterns: [
    { type: 'html', regex: /stoplight\.io|stoplight\-cdn/, via: 'Stoplight API docs' }
  ]},
  { name: 'Docusaurus', category: 'Documentation', patterns: [
    { type: 'html', regex: /docusaurus(?:\.min)?\.js|docusaurus\.io/, via: 'Docusaurus docs site' }
  ]},

  // ── Project Management ──
  { name: 'Trello', category: 'Project Management', patterns: [
    { type: 'html', regex: /trello\.com\/\w/, via: 'Trello link' }
  ]},
  { name: 'Asana', category: 'Project Management', patterns: [
    { type: 'html', regex: /asana\.com|app\.asana/, via: 'Asana link' }
  ]},
  { name: 'Notion', category: 'Project Management', patterns: [
    { type: 'html', regex: /notion\.(?:so|site|com)|notioncdn/, via: 'Notion link' }
  ]},
  { name: 'Linear', category: 'Project Management', patterns: [
    { type: 'html', regex: /linear\.app|linear\.io/, via: 'Linear link' }
  ]},
  { name: 'Monday.com', category: 'Project Management', patterns: [
    { type: 'html', regex: /monday\.com|mondaycdn/, via: 'Monday.com link' }
  ]},
  { name: 'Jira', category: 'Project Management', patterns: [
    { type: 'html', regex: /atlassian\.(?:net|com)\/jira|jira\.\w+/i, via: 'Jira reference' }
  ]},
  { name: 'ClickUp', category: 'Project Management', patterns: [
    { type: 'html', regex: /clickup\.com|clickupcdn/, via: 'ClickUp project management' }
  ]},

  // ── Business Tools / CRM ──
  { name: 'Salesforce', category: 'Business Tools', patterns: [
    { type: 'html', regex: /salesforce\.com|salesforce\-cdn|sfdc/, via: 'Salesforce CRM' }
  ]},
  { name: 'Pipedrive', category: 'Business Tools', patterns: [
    { type: 'html', regex: /pipedrive\.com|pipedrivecdn/, via: 'Pipedrive CRM' }
  ]},
  { name: 'Zoho', category: 'Business Tools', patterns: [
    { type: 'html', regex: /zoho\.com|zohopublic/, via: 'Zoho platform' }
  ]},
  { name: 'Freshworks', category: 'Business Tools', patterns: [
    { type: 'html', regex: /freshworks\.com|freshdesk\.com|freshsales/, via: 'Freshworks platform' }
  ]},
  { name: 'Airtable', category: 'Business Tools', patterns: [
    { type: 'html', regex: /airtable\.com|airtable\.embed/, via: 'Airtable spreadsheet' }
  ]},

  // ── Cache Tools ──
  { name: 'Varnish Cache', category: 'Cache Tools', patterns: [
    { type: 'header', key: 'x-varnish', regex: /.+/, via: 'Varnish cache header' },
    { type: 'header', key: 'via', regex: /varnish/i, via: 'Varnish via header' }
  ]},
  { name: 'Memcached', category: 'Cache Tools', patterns: [
    { type: 'header', key: 'x-cache', regex: /memcached/i, via: 'Memcached cache header' }
  ]},

  // ── Rich Text Editors (additional) ──
  { name: 'Draft.js', category: 'Rich Text Editor', patterns: [
    { type: 'html', regex: /draft(?:\.min)?\.js|DraftEditor|draftjs/i, via: 'Draft.js editor' }
  ]},
  { name: 'ProseMirror', category: 'Rich Text Editor', patterns: [
    { type: 'html', regex: /prosemirror|ProseMirror/, via: 'ProseMirror editor' }
  ]},
  { name: 'Trix Editor', category: 'Rich Text Editor', patterns: [
    { type: 'html', regex: /trix(?:\.min)?\.js|trix\-editor/, via: 'Trix rich text editor' }
  ]},
  { name: 'Slate.js', category: 'Rich Text Editor', patterns: [
    { type: 'html', regex: /slate(?:\.min)?\.js|slate\-react/, via: 'Slate.js editor' }
  ]},
  { name: 'Toast UI Editor', category: 'Rich Text Editor', patterns: [
    { type: 'html', regex: /toastui|uicdn\.toast/, via: 'Toast UI Editor' }
  ]},
  { name: 'TipTap', category: 'Rich Text Editor', patterns: [
    { type: 'html', regex: /tiptap(?:\.min)?\.js|tiptap\-core/, via: 'TipTap editor' }
  ]},

  // ── Podcasting ──
  { name: 'Buzzsprout', category: 'Podcasting', patterns: [
    { type: 'html', regex: /buzzsprout\.com\/|buzzsprout\-player/, via: 'Buzzsprout podcast player' }
  ]},
  { name: 'Transistor.fm', category: 'Podcasting', patterns: [
    { type: 'html', regex: /transistor\.fm\/|transistorcdn/, via: 'Transistor podcast hosting' }
  ]},
  { name: 'Anchor.fm', category: 'Podcasting', patterns: [
    { type: 'html', regex: /anchor\.fm\/|anchor\-cdn|anchor\-player/, via: 'Anchor podcast' }
  ]},
  { name: 'Simplecast', category: 'Podcasting', patterns: [
    { type: 'html', regex: /simplecast\.com\/|simplecastcdn/, via: 'Simplecast podcast' }
  ]},
  { name: 'Podbean', category: 'Podcasting', patterns: [
    { type: 'html', regex: /podbean\.com\/|pbcdn/, via: 'Podbean podcast hosting' }
  ]},
  { name: 'Spreaker', category: 'Podcasting', patterns: [
    { type: 'html', regex: /spreaker\.com\/|spreakercdn/, via: 'Spreaker podcast' }
  ]},

  // ── Webmail ──
  { name: 'Roundcube', category: 'Webmail', patterns: [
    { type: 'html', regex: /roundcube\.net|roundcube_|rcmail/, via: 'Roundcube webmail' }
  ]},
  { name: 'SquirrelMail', category: 'Webmail', patterns: [
    { type: 'html', regex: /squirrelmail|sqm\.php/, via: 'SquirrelMail webmail' }
  ]},
  { name: 'RainLoop', category: 'Webmail', patterns: [
    { type: 'html', regex: /rainloop\.net|rainloop|rlio/, via: 'RainLoop webmail' }
  ]},

  // ── Captcha (additional) ──
  { name: 'Altcha', category: 'Captcha', patterns: [
    { type: 'html', regex: /altcha\.org\/widget|altcha\-widget/, via: 'Altcha spam filter' }
  ]},
  { name: 'MTCaptcha', category: 'Captcha', patterns: [
    { type: 'html', regex: /mtcaptcha\.com|mtcaptcha\-cdn/, via: 'MTCaptcha service' }
  ]},
  { name: 'Friendly Captcha', category: 'Captcha', patterns: [
    { type: 'html', regex: /friendlycaptcha\.com|frcaptcha/, via: 'Friendly Captcha' }
  ]},

  // ── JavaScript Graphics (additional) ──
  { name: 'Babylon.js', category: 'JavaScript Graphics', patterns: [
    { type: 'html', regex: /babylon\.js|babylon\.max\.js|babylon\.cdn/, via: 'Babylon.js 3D engine' }
  ]},
  { name: 'Matter.js', category: 'JavaScript Graphics', patterns: [
    { type: 'html', regex: /matter\.min\.js|matterjs/, via: 'Matter.js physics engine' }
  ]},
  { name: 'Paper.js', category: 'JavaScript Graphics', patterns: [
    { type: 'html', regex: /paper\.js|paperjs/, via: 'Paper.js vector graphics' }
  ]},
  { name: 'Two.js', category: 'JavaScript Graphics', patterns: [
    { type: 'html', regex: /two\.min\.js|two\.js/, via: 'Two.js 2D library' }
  ]},
  { name: 'p5.js', category: 'JavaScript Graphics', patterns: [
    { type: 'html', regex: /p5(?:\.min)?\.js|p5js/, via: 'p5.js creative coding library' }
  ]},
  { name: 'Canvas', category: 'JavaScript Graphics', patterns: [
    { type: 'html', regex: /<canvas\b|getContext\(["']2d["']\)/, via: 'HTML5 Canvas element' }
  ]},
  { name: 'WebGL', category: 'JavaScript Graphics', patterns: [
    { type: 'html', regex: /webgl|getContext\(["']webgl["']\)/, via: 'WebGL 3D context' }
  ]},

  // ── Cookie Banners (additional) ──
  { name: 'Cookie Information', category: 'Cookie Consent', patterns: [
    { type: 'html', regex: /cookieinformation\.com|cookie\-law/, via: 'Cookie Information banner' }
  ]},
  { name: 'Cookie Notice', category: 'Cookie Consent', patterns: [
    { type: 'html', regex: /cookie\-notice|cn-notice/, via: 'Cookie Notice banner' }
  ]},
  { name: 'Termly', category: 'Cookie Consent', patterns: [
    { type: 'html', regex: /termly\.io\/cookie|termly\-consent/, via: 'Termly cookie consent' }
  ]},
  { name: 'Cookiebot', category: 'Cookie Consent', patterns: [
    { type: 'html', regex: /cookiebot\.com/, via: 'Cookiebot CMP' }
  ]},
  { name: 'Complianz', category: 'Cookie Consent', patterns: [
    { type: 'html', regex: /complianz|cmplz\-/, via: 'Complianz GDPR' }
  ]},

  // ── Design Tools ──
  { name: 'Figma', category: 'Design Tools', patterns: [
    { type: 'html', regex: /figma\.com\/embed|figma\.com\/file|framer\.com/, via: 'Figma embed' }
  ]},
  { name: 'Framer', category: 'Design Tools', patterns: [
    { type: 'html', regex: /framer\.com\/|framercdn/, via: 'Framer design tool' }
  ]},
  { name: 'Webflow (Design)', category: 'Design Tools', patterns: [
    { type: 'html', regex: /webflow\.com\/design|webflow\-css/, via: 'Webflow design platform' }
  ]},

  // ── Social Feed / Embeds ──
  { name: 'Instagram Feed', category: 'Social Feeds', patterns: [
    { type: 'html', regex: /instagram\.com\/embed|instagram\.com\/p\/|instafeed/, via: 'Instagram embed/feed' }
  ]},
  { name: 'Twitter / X Embed', category: 'Social Feeds', patterns: [
    { type: 'html', regex: /platform\.twitter\.com\/widgets|syndication\.twitter|twttr\.widgets|twitter\-timeline/, via: 'Twitter embed widget' }
  ]},
  { name: 'Facebook Embed', category: 'Social Feeds', patterns: [
    { type: 'html', regex: /facebook\.com\/plugins\/|fb\-page|fb\-post/, via: 'Facebook embed plugin' }
  ]},
  { name: 'LinkedIn Embed', category: 'Social Feeds', patterns: [
    { type: 'html', regex: /linkedin\.com\/embed|platform\.linkedin/i, via: 'LinkedIn embed' }
  ]},
  { name: 'TikTok Embed', category: 'Social Feeds', patterns: [
    { type: 'html', regex: /tiktok\.com\/embed|tiktok\-cdn/, via: 'TikTok embed' }
  ]},

  // ── Developer Tools ──
  { name: 'Sentry', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /sentry\.min\.js|browser\.sentry|Sentry\.init/, via: 'Sentry error tracking' }
  ]},
  { name: 'Rollbar', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /rollbar\.com\/js|rollbar\.config|_rollbar/i, via: 'Rollbar error tracking' }
  ]},
  { name: 'Bugsnag', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /bugsnag\.com\/js|bugsnag\.min\.js|Bugsnag\.start/, via: 'Bugsnag error monitoring' }
  ]},
  { name: 'OpenTelemetry', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /opentelemetry|otel\.io/, via: 'OpenTelemetry observability' }
  ]},
  { name: 'Socket.io', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /socket\.io\/js|socketio|io\.connect/, via: 'Socket.IO client' }
  ]},

  // ── Additional Analytics ──
  { name: 'Snowplow', category: 'Analytics', patterns: [
    { type: 'html', regex: /snowplow\.io|snowplow\.js|snowplow\-sp/, via: 'Snowplow analytics' }
  ]},
  { name: 'Adobe Analytics', category: 'Analytics', patterns: [
    { type: 'html', regex: /adobe\.com\/analytics|sc\.omtrdc\.net|s\.t\(\)|s\.tl\(\)/, via: 'Adobe Analytics' }
  ]},
  { name: 'RudderStack', category: 'Analytics', patterns: [
    { type: 'html', regex: /rudderstack\.com|rudderanalytics|rudder\-cdn/, via: 'RudderStack CDP' }
  ]},
  { name: 'mParticle', category: 'Analytics', patterns: [
    { type: 'html', regex: /mparticle\.com\/js|mparticle\.min/, via: 'mParticle CDP' }
  ]},
  { name: 'Tealium', category: 'Analytics', patterns: [
    { type: 'html', regex: /tealium\.com\/js|tealium\-cdn|utag\.js/, via: 'Tealium tag manager' }
  ]},
  { name: 'Adobe Launch', category: 'Analytics', patterns: [
    { type: 'html', regex: /launch\.adobe\.com|assets\.adobedtm/, via: 'Adobe Launch tag manager' }
  ]},
  { name: 'Google Optimize', category: 'Analytics', patterns: [
    { type: 'html', regex: /optimize\.googleapis\.com|googleoptimize/, via: 'Google Optimize AB testing' }
  ]},
  { name: 'VWO (Visual Website Optimizer)', category: 'Analytics', patterns: [
    { type: 'html', regex: /vwo\.com\/js|vwo\.cdn|_vwo_code/, via: 'VWO A/B testing' }
  ]},
  { name: 'Optimizely', category: 'Analytics', patterns: [
    { type: 'html', regex: /optimizely\.com\/js|optimizelycdn|optimizely/, via: 'Optimizely experimentation' }
  ]},
  { name: 'Lucky Orange', category: 'Analytics', patterns: [
    { type: 'html', regex: /luckyorange\.com\/js|luckyorange/, via: 'Lucky Orange session replay' }
  ]},
  { name: 'Bing Ads Universal Event Tracking', category: 'Analytics', patterns: [
    { type: 'html', regex: /bing\.com\/s\/.*uet|uet\.js|bing\-uet/, via: 'Bing Ads UET' }
  ]},
  { name: 'TikTok Pixel', category: 'Analytics', patterns: [
    { type: 'html', regex: /tiktok\.com\/analytics|tiktok\-pixel/, via: 'TikTok Pixel' }
  ]},
  { name: 'Pinterest Tag', category: 'Analytics', patterns: [
    { type: 'html', regex: /pinterest\.com\/js\/pin|pintrk|pin\_init/, via: 'Pinterest tag' }
  ]},
  { name: 'Snapchat Pixel', category: 'Analytics', patterns: [
    { type: 'html', regex: /snapchat\.com\/snap|snap\.licdn|snap\-pixel/, via: 'Snapchat pixel' }
  ]},
  { name: 'Twitter Ads', category: 'Analytics', patterns: [
    { type: 'html', regex: /static\.ads-twitter\.com|twq\(/i, via: 'Twitter Ads conversion tracking' }
  ]},
  { name: 'Reddit Pixel', category: 'Analytics', patterns: [
    { type: 'html', regex: /reddit\.com\/static\/ads|reddit\-pixel/, via: 'Reddit Pixel' }
  ]},
  { name: 'HubSpot Analytics', category: 'Analytics', patterns: [
    { type: 'html', regex: /hs\-analytics|hs\-track|hubspot\.com\/__hmc/, via: 'HubSpot analytics' }
  ]},
  { name: 'Woopra', category: 'Analytics', patterns: [
    { type: 'html', regex: /woopra\.com\/js|woopra\-cdn/, via: 'Woopra analytics' }
  ]},
  { name: 'Kissmetrics', category: 'Analytics', patterns: [
    { type: 'html', regex: /kissmetrics\.com\/js|kissmetrics/, via: 'Kissmetrics analytics' }
  ]},

  // ── Additional Customer Support ──
  { name: 'Helpscout', category: 'Customer Support', patterns: [
    { type: 'html', regex: /helpscout\.net\/js|helpscoutcdn/, via: 'Help Scout support' }
  ]},
  { name: 'Gorgias', category: 'Customer Support', patterns: [
    { type: 'html', regex: /gorgias\.com|gorgias\.chat/, via: 'Gorgias customer support' }
  ]},
  { name: 'Zendesk Chat', category: 'Customer Support', patterns: [
    { type: 'html', regex: /zendesk\.com\/embeddable|zopim\.com|widget\.zopim/, via: 'Zendesk Chat' }
  ]},
  { name: 'Olark', category: 'Customer Support', patterns: [
    { type: 'html', regex: /olark\.com\/js|olarkcdn/, via: 'Olark live chat' }
  ]},
  { name: 'Smartsupp', category: 'Customer Support', patterns: [
    { type: 'html', regex: /smartsupp\.com\/js|smartsuppcdn/, via: 'Smartsupp chat' }
  ]},
  { name: 'Tidio', category: 'Customer Support', patterns: [
    { type: 'html', regex: /tidio\.co\/js|tidiochat/, via: 'Tidio chat' }
  ]},
  { name: 'UserVoice', category: 'Customer Support', patterns: [
    { type: 'html', regex: /uservoice\.com\/js|uservoicecdn/, via: 'UserVoice feedback' }
  ]},
  { name: 'JivoChat', category: 'Customer Support', patterns: [
    { type: 'html', regex: /jivosite\.com\/js|jivochat/, via: 'JivoChat live chat' }
  ]},
  { name: 'Chatra', category: 'Customer Support', patterns: [
    { type: 'html', regex: /chatra\.io\/js|chatracdn/, via: 'Chatra live chat' }
  ]},

  // ── Additional Marketing ──
  { name: 'Brevo (Sendinblue)', category: 'Marketing', patterns: [
    { type: 'html', regex: /sendinblue\.com\/js|brevo\.com|sib\.js/, via: 'Brevo/Sendinblue marketing' }
  ]},
  { name: 'Drip', category: 'Marketing', patterns: [
    { type: 'html', regex: /drip\.com\/js|getdrip\.com/, via: 'Drip marketing automation' }
  ]},
  { name: 'Iterable', category: 'Marketing', patterns: [
    { type: 'html', regex: /iterable\.com\/js|iterablecdn/, via: 'Iterable marketing platform' }
  ]},
  { name: 'Omnisend', category: 'Marketing', patterns: [
    { type: 'html', regex: /omnisend\.com\/js|omnisendcdn/, via: 'Omnisend marketing' }
  ]},
  { name: 'Customer.io', category: 'Marketing', patterns: [
    { type: 'html', regex: /customer\.io\/js|customerio/, via: 'Customer.io messaging' }
  ]},
  { name: 'Braze', category: 'Marketing', patterns: [
    { type: 'html', regex: /braze\.com\/js|braze\-cdn|appboy/, via: 'Braze customer engagement' }
  ]},
  { name: 'Autopilot', category: 'Marketing', patterns: [
    { type: 'html', regex: /autopilothq\.com\/js|autopilotcdn/, via: 'Autopilot marketing' }
  ]},

  // ── Additional Security ──
  { name: 'Imperva', category: 'Security', patterns: [
    { type: 'header', key: 'x-iinfo', regex: /.+/, via: 'Imperva security header' },
    { type: 'header', key: 'server', regex: /imperva/i, via: 'Imperva WAF' }
  ]},
  { name: 'Cloudflare WAF', category: 'Security', patterns: [
    { type: 'header', key: 'cf-ray', regex: /.+/, via: 'Cloudflare WAF/Ray ID' }
  ]},
  { name: 'AWS WAF', category: 'Security', patterns: [
    { type: 'header', key: 'x-amz-waf', regex: /.+/, via: 'AWS WAF header' }
  ]},
  { name: 'Akamai WAF', category: 'Security', patterns: [
    { type: 'header', key: 'x-akamai-waf', regex: /.+/, via: 'Akamai WAF header' }
  ]},
  { name: 'Wordfence', category: 'Security', patterns: [
    { type: 'html', regex: /wordfence|wfwaf/, via: 'Wordfence security plugin' }
  ]},
  { name: 'Barracuda WAF', category: 'Security', patterns: [
    { type: 'header', key: 'server', regex: /barracuda/i, via: 'Barracuda WAF' }
  ]},
  { name: 'F5 Networks', category: 'Security', patterns: [
    { type: 'header', key: 'server', regex: /big\-ip|f5\-/i, via: 'F5 BIG-IP' }
  ]},

  // ── Additional Advertising ──
  { name: 'AdRoll', category: 'Advertising', patterns: [
    { type: 'html', regex: /adroll\.com\/js|adrollcdn/, via: 'AdRoll retargeting' }
  ]},
  { name: 'HubSpot Ads', category: 'Advertising', patterns: [
    { type: 'html', regex: /hubspot\.com\/ads|hs\-ads/, via: 'HubSpot Ads tracking' }
  ]},
  { name: 'LinkedIn Ads', category: 'Advertising', patterns: [
    { type: 'html', regex: /snap\.licdn\.com\/li|linkedin\.com\/px|_linkedin/, via: 'LinkedIn Ads' }
  ]},
  { name: 'Snapchat Ads', category: 'Advertising', patterns: [
    { type: 'html', regex: /snapchat\.com\/static\/ads|snap\-ads/, via: 'Snapchat Ads' }
  ]},
  { name: 'Pinterest Ads', category: 'Advertising', patterns: [
    { type: 'html', regex: /pinterest\.com\/js\/pin|pin\.init/, via: 'Pinterest Ads' }
  ]},
  { name: 'TikTok Ads', category: 'Advertising', patterns: [
    { type: 'html', regex: /tiktok\.com\/pixel|tiktok\-ads/, via: 'TikTok Ads' }
  ]},
  { name: 'Yahoo Ads', category: 'Advertising', patterns: [
    { type: 'html', regex: /yahoo\.com\/pixel|adserver\.yahoo/, via: 'Yahoo Ads' }
  ]},
  { name: 'Amobee', category: 'Advertising', patterns: [
    { type: 'html', regex: /amobee\.com\/js|amobee\-cdn/, via: 'Amobee advertising' }
  ]},
  { name: '33Across', category: 'Advertising', patterns: [
    { type: 'html', regex: /33across\.com\/js|33across/, via: '33Across ad platform' }
  ]},
  { name: 'Sovrn', category: 'Advertising', patterns: [
    { type: 'html', regex: /sovrn\.com\/js|sovrn/, via: 'Sovrn ad network' }
  ]},
  { name: 'ShareThrough', category: 'Advertising', patterns: [
    { type: 'html', regex: /sharethrough\.com\/js|sharethrough/, via: 'ShareThrough native ads' }
  ]},

  // ── Additional CMS ──
  { name: 'Craft CMS', category: 'CMS', patterns: [
    { type: 'html', regex: /craft\.com|craftcms|crafteco/, via: 'Craft CMS' }
  ]},
  { name: 'Statamic', category: 'CMS', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /statamic/i, via: 'Statamic CMS' }
  ]},
  { name: 'October CMS', category: 'CMS', patterns: [
    { type: 'meta_generator', regex: /octobercms/i, via: 'October CMS' }
  ]},
  { name: 'Concrete CMS', category: 'CMS', patterns: [
    { type: 'meta_generator', regex: /concretecms|concrete5/i, via: 'Concrete CMS' }
  ]},
  { name: 'TYPO3', category: 'CMS', patterns: [
    { type: 'meta_generator', regex: /typo3/i, via: 'TYPO3 CMS' }
  ]},
  { name: 'ExpressionEngine', category: 'CMS', patterns: [
    { type: 'html', regex: /expressionengine|exp\-cdn/, via: 'ExpressionEngine CMS' }
  ]},
  { name: 'SilverStripe', category: 'CMS', patterns: [
    { type: 'meta_generator', regex: /silverstripe/i, via: 'SilverStripe CMS' }
  ]},
  { name: 'ProcessWire', category: 'CMS', patterns: [
    { type: 'html', regex: /processwire|wire\-cdn/, via: 'ProcessWire CMS' }
  ]},
  { name: 'DotCMS', category: 'CMS', patterns: [
    { type: 'html', regex: /dotcms|dotCMS/, via: 'dotCMS platform' }
  ]},
  { name: 'Liferay', category: 'CMS', patterns: [
    { type: 'html', regex: /liferay(?:\.com)?/, via: 'Liferay DXP' }
  ]},
  { name: 'Hugo', category: 'CMS', patterns: [
    { type: 'meta_generator', regex: /hugo/i, via: 'Hugo static site generator' }
  ]},
  { name: 'Jekyll', category: 'CMS', patterns: [
    { type: 'meta_generator', regex: /jekyll/i, via: 'Jekyll static site generator' }
  ]},
  { name: 'Eleventy (11ty)', category: 'CMS', patterns: [
    { type: 'html', regex: /11ty\.io|eleventy/, via: 'Eleventy static site generator' }
  ]},
  // ── Additional Web Servers ──
  { name: 'WildFly', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /wildfly|jboss/i, via: 'WildFly/JBoss' }
  ]},
  { name: 'Tengine', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /tengine/i, via: 'Tengine web server' }
  ]},
  { name: 'Cowboy', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /cowboy/i, via: 'Cowboy web server (Erlang)' }
  ]},
  { name: 'Node.js (Server)', category: 'Web Server', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /node/i, via: 'Node.js server header' }
  ]},

  // ── Additional Databases ──
  { name: 'MariaDB', category: 'Database', patterns: [
    { type: 'header', key: 'server', regex: /mariadb/i, via: 'MariaDB server' }
  ]},
  { name: 'CouchDB', category: 'Database', patterns: [
    { type: 'header', key: 'server', regex: /couchdb/i, via: 'CouchDB server' }
  ]},
  { name: 'DynamoDB', category: 'Database', patterns: [
    { type: 'header', key: 'x-amz-id', regex: /.+/, via: 'DynamoDB (via AWS)' }
  ]},
  { name: 'Firebase Firestore', category: 'Database', patterns: [
    { type: 'html', regex: /firestore\.googleapis|firebaseio\.com/, via: 'Firebase Firestore' }
  ]},
  { name: 'Supabase DB', category: 'Database', patterns: [
    { type: 'html', regex: /supabase\.co|supabase\.js/, via: 'Supabase database' }
  ]},
  { name: 'PlanetScale', category: 'Database', patterns: [
    { type: 'html', regex: /planetscale\.com|planetscale/, via: 'PlanetScale database' }
  ]},
  { name: 'Neon', category: 'Database', patterns: [
    { type: 'html', regex: /neon\.tech|neondb/, via: 'Neon serverless Postgres' }
  ]},
  { name: 'Prisma', category: 'Database', patterns: [
    { type: 'html', regex: /prisma\.io|prisma\/client/, via: 'Prisma ORM' }
  ]},
  { name: 'Drizzle', category: 'Database', patterns: [
    { type: 'html', regex: /drizzle\.team|drizzle\-orm/, via: 'Drizzle ORM' }
  ]},

  // ── Additional Monitoring ──
  { name: 'Datadog', category: 'Monitoring', patterns: [
    { type: 'html', regex: /datadoghq\.com|dd\-rum|datadog\-rum/, via: 'Datadog monitoring' }
  ]},
  { name: 'AppDynamics', category: 'Monitoring', patterns: [
    { type: 'html', regex: /appdynamics\.com\/js|adrum/, via: 'AppDynamics monitoring' }
  ]},
  { name: 'Dynatrace', category: 'Monitoring', patterns: [
    { type: 'html', regex: /dynatrace\.com\/js|dtagent|dynatrace/, via: 'Dynatrace monitoring' }
  ]},
  { name: 'Grafana', category: 'Monitoring', patterns: [
    { type: 'html', regex: /grafana\.com|grafana\.net/, via: 'Grafana dashboards' }
  ]},
  { name: 'Splunk', category: 'Monitoring', patterns: [
    { type: 'html', regex: /splunk\.com|splunkcdn/, via: 'Splunk monitoring' }
  ]},
  { name: 'Sumo Logic', category: 'Monitoring', patterns: [
    { type: 'html', regex: /sumologic\.com|sumo\-cdn/, via: 'Sumo Logic monitoring' }
  ]},
  { name: 'Checkly', category: 'Monitoring', patterns: [
    { type: 'html', regex: /checkly\.io|checklyhq/, via: 'Checkly monitoring' }
  ]},
  { name: 'Squadcast', category: 'Monitoring', patterns: [
    { type: 'html', regex: /squadcast\.com|squadcast/, via: 'Squadcast incident management' }
  ]},
  { name: 'PagerDuty', category: 'Monitoring', patterns: [
    { type: 'html', regex: /pagerduty\.com|pagerdutycdn/, via: 'PagerDuty incident management' }
  ]},

  // ── Additional Payment Processors ──
  { name: 'Stripe', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /js\.stripe\.com\/v3/, via: 'Stripe.js payment' }
  ]},
  { name: 'PayPal', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /paypal\.com\/sdk\/js|paypal\.com\/checkout/, via: 'PayPal checkout' }
  ]},
  { name: 'Braintree', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /braintreegateway\.com|js\.braintree/, via: 'Braintree payments' }
  ]},
  { name: 'Alipay', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /alipay\.com|alipayobjects\.com/, via: 'Alipay payment' }
  ]},
  { name: 'WeChat Pay', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /pay\.weixin\.qq\.com|wxpay/, via: 'WeChat Pay' }
  ]},
  { name: 'GoCardless', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /gocardless\.com\/js|gocardless/, via: 'GoCardless direct debit' }
  ]},
  { name: 'Checkout.com', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /checkout\.com\/js|cko\-cdn/, via: 'Checkout.com payments' }
  ]},
  { name: 'Worldpay', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /worldpay\.com\/js|worldpay/, via: 'Worldpay payments' }
  ]},
  { name: 'Authorize.net', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /authorize\.net\/js|authorizenet/, via: 'Authorize.net payments' }
  ]},
  { name: '2Checkout', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /2checkout\.com\/js|2checkout/, via: '2Checkout payment' }
  ]},
  { name: 'Mercado Pago', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /mercadopago\.com\/js|mercadopago/, via: 'Mercado Pago' }
  ]},
  { name: 'PayU', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /payu\.com\/js|payucdn/, via: 'PayU payment' }
  ]},

  // ── Additional Backend Frameworks ──
  { name: 'Phoenix Framework', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /phoenix/i, via: 'Phoenix Framework' }
  ]},
  { name: 'Symfony', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /symfony/i, via: 'Symfony PHP framework' },
    { type: 'html', regex: /symfony|sf_/, via: 'Symfony class/marker' }
  ]},
  { name: 'CodeIgniter', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /codeigniter/i, via: 'CodeIgniter framework' }
  ]},
  { name: 'CakePHP', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'server', regex: /cakephp/i, via: 'CakePHP server' },
    { type: 'cookie', regex: /CAKEPHP/i, via: 'CakePHP session cookie' }
  ]},
  { name: 'Yii', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /yii/i, via: 'Yii framework' }
  ]},
  { name: 'NestJS', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /nestjs/i, via: 'NestJS framework' }
  ]},
  { name: 'AdonisJS', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /adonis/i, via: 'AdonisJS framework' }
  ]},
  { name: 'Sails.js', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /sails/i, via: 'Sails.js framework' }
  ]},
  { name: 'Meteor', category: 'Backend Framework', patterns: [
    { type: 'html', regex: /meteor\.js|Meteor\./, via: 'Meteor framework' }
  ]},
  { name: 'Deno', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'server', regex: /deno/i, via: 'Deno runtime' }
  ]},
  { name: 'Bun', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /bun/i, via: 'Bun runtime' }
  ]},
  { name: 'Rocket', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'server', regex: /rocket/i, via: 'Rocket (Rust) framework' }
  ]},
  { name: 'Actix Web', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'server', regex: /actix/i, via: 'Actix Web (Rust)' }
  ]},

  // ── Additional Platforms / Languages ──
  { name: 'Rust', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'server', regex: /rust|actix|rocket|axum/i, via: 'Rust server' }
  ]},
  { name: 'Elixir', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'server', regex: /elixir|phoenix|cowboy/i, via: 'Elixir server' }
  ]},
  { name: 'Scala', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'server', regex: /scala|play|akka/i, via: 'Scala server' }
  ]},
  { name: 'Kotlin', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'server', regex: /kotlin|ktor/i, via: 'Kotlin server' }
  ]},
  { name: 'Erlang', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'server', regex: /erlang|cowboy/i, via: 'Erlang server' }
  ]},
  { name: 'Crystal', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'server', regex: /crystal|amber/i, via: 'Crystal server' }
  ]},
  { name: 'Swift (Vapor)', category: 'Platform / Language', patterns: [
    { type: 'header', key: 'server', regex: /vapor|swift/i, via: 'Swift/Vapor server' }
  ]},

  // ── Additional Container / Orchestration ──
  { name: 'ECS', category: 'Container / Orchestration', patterns: [
    { type: 'header', key: 'server', regex: /ecs|amazon-ecs/i, via: 'Amazon ECS' }
  ]},
  { name: 'Docker Compose', category: 'Container / Orchestration', patterns: [
    { type: 'html', regex: /docker\-compose/i, via: 'Docker Compose reference' }
  ]},
  { name: 'Podman', category: 'Container / Orchestration', patterns: [
    { type: 'header', key: 'server', regex: /podman/i, via: 'Podman container' }
  ]},

  // ── Additional CI/CD ──
  { name: 'Travis CI', category: 'CI/CD', patterns: [
    { type: 'html', regex: /travis-ci\.com|travis-ci\.org|\.travis\.yml/i, via: 'Travis CI' }
  ]},
  { name: 'TeamCity', category: 'CI/CD', patterns: [
    { type: 'header', key: 'server', regex: /teamcity/i, via: 'TeamCity CI' }
  ]},
  { name: 'Bitbucket Pipelines', category: 'CI/CD', patterns: [
    { type: 'html', regex: /bitbucket\.org\/.*\/pipelines/i, via: 'Bitbucket Pipelines' }
  ]},
  { name: 'Vercel CI', category: 'CI/CD', patterns: [
    { type: 'header', key: 'x-vercel-id', regex: /.+/, via: 'Vercel deployment' }
  ]},
  { name: 'Cloudflare Pages CI', category: 'CI/CD', patterns: [
    { type: 'header', key: 'x-pages-route', regex: /.+/, via: 'Cloudflare Pages CI' }
  ]},
  { name: 'ArgoCD', category: 'CI/CD', patterns: [
    { type: 'html', regex: /argocd|argo\-cd/i, via: 'ArgoCD deployment' }
  ]},
  { name: 'Drone CI', category: 'CI/CD', patterns: [
    { type: 'html', regex: /drone\.ci|droneio/i, via: 'Drone CI' }
  ]},

  // ── Additional Infrastructure ──
  { name: 'Terraform', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /terraform\.io|hashicorp\/terraform|\.tf\b/i, via: 'Terraform reference' }
  ]},
  { name: 'Pulumi', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /pulumi\.com|pulumi\-cdn/i, via: 'Pulumi infrastructure' }
  ]},
  { name: 'Ansible', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /ansible\.com|ansible\-play|ansible/i, via: 'Ansible automation' }
  ]},
  { name: 'Puppet', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /puppet\.com|puppetlabs/i, via: 'Puppet configuration management' }
  ]},
  { name: 'Chef', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /chef\.io|chef\-server|chef\.com/i, via: 'Chef automation' }
  ]},
  { name: 'Nginx (Reverse Proxy)', category: 'Infrastructure', patterns: [
    { type: 'header', key: 'server', regex: /nginx/i, via: 'Nginx reverse proxy' }
  ]},
  { name: 'HAProxy (LB)', category: 'Infrastructure', patterns: [
    { type: 'header', key: 'server', regex: /haproxy/i, via: 'HAProxy load balancer' }
  ]},

  // ── Additional Testing ──
  { name: 'Selenium', category: 'Testing', patterns: [
    { type: 'html', regex: /selenium\.dev|selenium\.js/, via: 'Selenium testing' }
  ]},
  { name: 'Mocha', category: 'Testing', patterns: [
    { type: 'html', regex: /mochajs\.org|mocha\.js/, via: 'Mocha testing' }
  ]},
  { name: 'Jasmine', category: 'Testing', patterns: [
    { type: 'html', regex: /jasmine\.io|jasmine\.js/, via: 'Jasmine testing' }
  ]},
  { name: 'Vitest', category: 'Testing', patterns: [
    { type: 'html', regex: /vitest\.dev|vitest/, via: 'Vitest testing' }
  ]},
  { name: 'Testing Library', category: 'Testing', patterns: [
    { type: 'html', regex: /testing\-library|@testing-library/, via: 'Testing Library' }
  ]},
  { name: 'Storybook', category: 'Testing', patterns: [
    { type: 'html', regex: /storybook\.js|storybookcdn/, via: 'Storybook component explorer' }
  ]},

  // ── CSS Frameworks ──
  { name: 'Bulma', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /bulma\.(?:min\.)?css|cdn\.jsdelivr\.net\/npm\/bulma/, via: 'Bulma CSS stylesheet' }
  ]},
  { name: 'Foundation', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /foundation\.(?:min\.)?(?:css|js)/, via: 'Foundation framework asset' }
  ]},
  { name: 'Materialize CSS', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /materialize\.(?:min\.)?(?:css|js)/, via: 'Materialize CSS asset' }
  ]},
  { name: 'Spectre.css', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /spectre\.(?:min\.)?css/, via: 'Spectre.css stylesheet' }
  ]},
  { name: 'Tachyons', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /tachyons(?:\.min)?\.css|tachyons-[a-z0-9]+/, via: 'Tachyons CSS library' }
  ]},
  { name: 'Chakra UI', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /chakra-ui|data-chakra/, via: 'Chakra UI framework' }
  ]},
  { name: 'MUI (Material UI)', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /@mui\/material|mui\.(?:min\.)?css/, via: 'MUI component library' }
  ]},
  { name: 'Ant Design', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /antd\.(?:min\.)?css|@ant-design/, via: 'Ant Design library' }
  ]},
  { name: 'Semantic UI', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /semantic\.(?:min\.)?(?:css|js)/, via: 'Semantic UI framework' }
  ]},
  { name: 'Radix UI', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /@radix-ui\//, via: 'Radix UI component library' }
  ]},
  { name: 'Headless UI', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /data-headlessui-state|@headlessui\//, via: 'Headless UI framework' }
  ]},
  { name: 'NextUI', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /@nextui-org/, via: 'NextUI component library' }
  ]},
  { name: 'Prime UI', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /primereact|primefaces|primeicons/, via: 'Prime UI component library' }
  ]},
  { name: 'UnoCSS', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /unocss|cdn\.unocss\.com/, via: 'UnoCSS engine' }
  ]},
  { name: 'Windi CSS', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /windi-|windicss/, via: 'Windi CSS framework' }
  ]},
  { name: 'Open Props', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /open-props\.css|unpkg\.com\/open-props/, via: 'Open Props CSS variables' }
  ]},

  // ── Additional Analytics ──
  { name: 'Microsoft Clarity', category: 'Analytics', patterns: [
    { type: 'html', regex: /clarity\.ms\/js|clarity\.js|MicrosoftClarity/, via: 'Microsoft Clarity analytics' }
  ]},
  { name: 'Pirsch', category: 'Analytics', patterns: [
    { type: 'html', regex: /pirsch\.io\/js|pirsch\.io\/api/, via: 'Pirsch analytics script' }
  ]},
  { name: 'Countly', category: 'Analytics', patterns: [
    { type: 'html', regex: /countly\.min\.js|countly\.com\/sdk/, via: 'Countly analytics' }
  ]},

  // ── Additional Frontend Frameworks ──
  { name: 'SvelteKit', category: 'Frontend Framework', patterns: [
    { type: 'html', regex: /sveltekit|__sveltekit/, via: 'SvelteKit framework markers' }
  ]},
  { name: 'Riot.js', category: 'Frontend Framework', patterns: [
    { type: 'script_src', regex: /riot(?:\.min)?\.js/i, via: 'Riot.js script src' }
  ]},
  { name: 'Aurelia', category: 'Frontend Framework', patterns: [
    { type: 'html', regex: /aurelia|au-app/, via: 'Aurelia framework reference' }
  ]},

  // ── Additional JavaScript Libraries ──
  { name: 'Day.js', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /dayjs(?:\.min)?\.js|cdn\.jsdelivr\.net\/npm\/dayjs/, via: 'Day.js script src' }
  ]},
  { name: 'date-fns', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /date-fns(?:\.min)?\.js/i, via: 'date-fns script src' }
  ]},
  { name: 'Redux', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /__REDUX_DEVTOOLS_EXTENSION__|redux\.min\.js/, via: 'Redux state management' }
  ]},
  { name: 'NProgress', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /nprogress(?:\.min)?\.(?:js|css)/, via: 'NProgress loading bar' }
  ]},
  { name: 'TanStack Query', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /tanstack\.com\/query|@tanstack\/react-query/, via: 'TanStack Query data fetching' }
  ]},
  { name: 'tRPC', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /\/api\/trpc|trpc\.io/, via: 'tRPC API endpoint' }
  ]},
  { name: 'React Hook Form', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /react-hook-form|reacthookform/, via: 'React Hook Form library' }
  ]},
  { name: 'TanStack Table', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /@tanstack\/react-table/, via: 'TanStack Table' }
  ]},
  { name: 'Sonner', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /sonner(?:\.min)?\.js/, via: 'Sonner toast script' }
  ]},

  // ── Additional Backend Frameworks ──
  { name: 'Hono', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'server', regex: /hono/i, via: 'Hono framework header' }
  ]},
  { name: 'Elysia', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /elysia/i, via: 'Elysia framework header' }
  ]},
  { name: 'Fastify', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'server', regex: /fastify/i, via: 'Fastify framework header' }
  ]},
  { name: 'Hapi.js', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /hapi/i, via: 'Hapi.js framework header' }
  ]},
  { name: 'RedwoodJS', category: 'Backend Framework', patterns: [
    { type: 'html', regex: /redwoodjs|redwood\.js/, via: 'RedwoodJS framework' }
  ]},
  { name: 'Blitz.js', category: 'Backend Framework', patterns: [
    { type: 'html', regex: /blitz\.js|blitz\.app/, via: 'Blitz.js framework' }
  ]},
  { name: 'Wasp', category: 'Backend Framework', patterns: [
    { type: 'html', regex: /wasp\.dev|wasp-lang/, via: 'Wasp full-stack framework' }
  ]},

  // ── Additional CMS ──
  { name: 'Payload CMS', category: 'CMS', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /payload/i, via: 'Payload CMS header' }
  ]},
  { name: 'Wagtail', category: 'CMS', patterns: [
    { type: 'meta_generator', regex: /wagtail/i, via: 'Wagtail CMS meta generator' }
  ]},
  { name: 'Apostrophe CMS', category: 'CMS', patterns: [
    { type: 'meta_generator', regex: /apostrophe/i, via: 'Apostrophe CMS meta generator' }
  ]},
  { name: 'PocketBase', category: 'CMS', patterns: [
    { type: 'html', regex: /pocketbase\.io|_pb\//, via: 'PocketBase reference' }
  ]},

  // ── Additional Email ──
  { name: 'Resend', category: 'Email', patterns: [
    { type: 'html', regex: /resend\.com\/api|resend\.com\/emails/, via: 'Resend email service' }
  ]},
  { name: 'Loops', category: 'Email', patterns: [
    { type: 'html', regex: /loops\.so\/api/, via: 'Loops email platform' }
  ]},
  { name: 'Buttondown', category: 'Email', patterns: [
    { type: 'html', regex: /buttondown\.email|buttondown\.com/, via: 'Buttondown newsletter' }
  ]},

  // ── Additional Developer Tools ──
  { name: 'Vite', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /\/@vite\/|data-vite|__vite__/, via: 'Vite build tool' }
  ]},
  { name: 'Appwrite', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /appwrite\.io|appwrite\/sdk/, via: 'Appwrite backend platform' }
  ]},
  { name: 'Coolify', category: 'Developer Tools', patterns: [
    { type: 'header', key: 'server', regex: /coolify/i, via: 'Coolify self-hosted platform' }
  ]},
  { name: 'Ngrok', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /ngrok\.io|ngrok\.com|ngrok\-agent/, via: 'Ngrok tunneling service' }
  ]},
  { name: 'OpenNext', category: 'Developer Tools', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /opennext/i, via: 'OpenNext deployment' }
  ]},

  // ── Additional Marketing ──
  { name: 'Beehiiv', category: 'Marketing', patterns: [
    { type: 'html', regex: /beehiiv\.com\/|beehiivcdn/, via: 'Beehiiv newsletter platform' }
  ]},
  { name: 'Usermaven', category: 'Marketing', patterns: [
    { type: 'html', regex: /usermaven\.com\/js|usermaven\.min\.js/, via: 'Usermaven analytics' }
  ]},
  // ── Additional Frontend Frameworks ──
  { name: 'Petite-Vue', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /petite-vue|v-scope|v-effect/, via: 'Petite-Vue directives' }
  ]},
  { name: 'Imba', category: 'Frontend Framework', patterns: [
    { type: 'html', regex: /imba-[a-z0-9]+|__imba/i, via: 'Imba framework markers' }
  ]},
  { name: 'Inferno', category: 'Frontend Framework', patterns: [
    { type: 'html', regex: /inferno[\.\-]core|inferno[\.\-]vdom|__inferno/i, via: 'Inferno framework markers' }
  ]},
  { name: 'Morphdom', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /morphdom(?:\.min)?\.js/i, via: 'Morphdom DOM diffing' }
  ]},
  { name: 'Web Components', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /shadow-root|customElements\.define\(/i, via: 'Web Components API' }
  ]},
  { name: 'Alpine.js 2', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /alpinejs(?:\.min)?\.js/i, via: 'Alpine.js script' }
  ]},

  // ── Additional Carousels / Sliders / Lightboxes ──
  { name: 'Splide', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /splide(?:-js|-iife)?(?:\.min)?\.js/i, via: 'Splide carousel script' },
    { type: 'html', regex: /splide__track|splide__list|splide__slide/i, via: 'Splide carousel classes' }
  ]},
  { name: 'Flickity', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /flickity(?:\.pkgd|\.min)?\.js/i, via: 'Flickity carousel script' },
    { type: 'link_tag', regex: /flickity(?:\.min)?\.css/i, via: 'Flickity stylesheet' }
  ]},
  { name: 'GLightbox', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /glightbox(?:\.min)?\.js/i, via: 'GLightbox lightbox script' }
  ]},
  { name: 'PhotoSwipe', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /photoswipe(?:-lightbox)?(?:\.min)?\.js/i, via: 'PhotoSwipe gallery script' },
    { type: 'html', regex: /pswp--open|pswp__container/i, via: 'PhotoSwipe DOM classes' }
  ]},
  { name: 'Embla Carousel', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /embla-carousel|embla__viewport|embla__container/i, via: 'Embla carousel markers' }
  ]},

  // ── Additional Tooltips / Popovers ──
  { name: 'Tippy.js', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /tippy(?:\.bundle|\.umd|\.min)?\.js/i, via: 'Tippy.js tooltip script' }
  ]},

  // ── Additional Date / Time ──
  { name: 'Luxon', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /luxon(?:\.min)?\.js/i, via: 'Luxon date library' }
  ]},
  { name: 'Temporal', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /Temporal\.(?:Now|PlainDate|PlainTime|ZonedDateTime)/i, via: 'Temporal API usage' }
  ]},

  // ── Additional Utilities ──
  { name: 'Ramda', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /ramda(?:\.min)?\.js/i, via: 'Ramda functional library' }
  ]},
  { name: 'XState', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /xstate|createMachine|interpret\(/i, via: 'XState state machines' }
  ]},
  { name: 'Jotai', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /jotai|useAtom|atom\(/i, via: 'Jotai atomic state' }
  ]},
  { name: 'Valtio', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /valtio|proxy\(|useSnapshot/i, via: 'Valtio proxy state' }
  ]},
  { name: 'Nanostores', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /nanostores|atom\(|useStore/i, via: 'Nanostores' }
  ]},
  { name: 'TanStack Form', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /tanstack.*form|@tanstack\/form/i, via: 'TanStack Form' }
  ]},

  // ── Additional CSS Frameworks / UI Kits ──
  { name: 'DaisyUI', category: 'CSS Framework', patterns: [
    { type: 'css_class', regex: /\b(btn-(?:primary|secondary|accent|ghost|info|success|warning|error)|badge-(?:primary|secondary|accent)|alert-(?:info|success|warning|error)|card-(?:side|normal)|dropdown-(?:end|start)|menu-title|stat-(?:figure|value|desc))/i, via: 'DaisyUI component classes' }
  ]},
  { name: 'Flowbite', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /flowbite/i, via: 'Flowbite library reference' },
    { type: 'css_class', regex: /\bflowbite\b/i, via: 'Flowbite CSS class' }
  ]},
  { name: 'shadcn/ui', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /@radix-ui|shadcn|data-\[state=/i, via: 'shadcn/ui component patterns' }
  ]},
  { name: 'vanilla-extract', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /vanilla-extract|\.css\.ts|\.styles\.ts/i, via: 'vanilla-extract zero-runtime CSS' }
  ]},
  { name: 'Ariakit', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /ariakit|@ariakit\/react/i, via: 'Ariakit headless UI' }
  ]},
  { name: 'Park UI', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /park-ui|@park-ui/i, via: 'Park UI component library' }
  ]},
  { name: 'Melt UI', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /melt-ui|@melt-ui/i, via: 'Melt UI Svelte primitives' }
  ]},
  { name: 'Skeleton UI', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /skeleton-ui|@skeletonlabs/i, via: 'Skeleton UI toolkit' }
  ]},
  { name: 'Flowbite React', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /flowbite-react|@flowbite-react/i, via: 'Flowbite React components' }
  ]},
  { name: 'Mantine', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /@mantine\/|mantine\.css|mantines/i, via: 'Mantine React components' }
  ]},
  { name: 'React Aria', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /react-aria|@react-aria\//i, via: 'React Aria accessible hooks' }
  ]},
  { name: 'Radix Themes', category: 'CSS Framework', patterns: [
    { type: 'html', regex: /@radix-ui\/themes|radix-themes/i, via: 'Radix Themes' }
  ]},

  // ── Additional CMS ──
  { name: 'Keystatic', category: 'CMS', patterns: [
    { type: 'html', regex: /keystatic|@keystatic\/core/i, via: 'Keystatic headless CMS' }
  ]},
  { name: 'Pagefind', category: 'CMS', patterns: [
    { type: 'html', regex: /pagefind|_pagefind/i, via: 'Pagefind static search' }
  ]},
  { name: 'Decap CMS', category: 'CMS', patterns: [
    { type: 'html', regex: /decap-cms|netlify-cms/i, via: 'Decap CMS (formerly Netlify CMS)' }
  ]},
  { name: 'Ghost Content API', category: 'CMS', patterns: [
    { type: 'html', regex: /ghost\/content\/api|ghost-api/i, via: 'Ghost Content API' }
  ]},
  { name: 'Sanity Studio', category: 'CMS', patterns: [
    { type: 'html', regex: /sanity-studio|sanity\.io|@sanity\/client/i, via: 'Sanity Studio' }
  ]},
  { name: 'Builder.io Visual', category: 'CMS', patterns: [
    { type: 'html', regex: /builder\.io|data-builder-content|builderio/i, via: 'Builder.io visual editor' }
  ]},
  { name: 'Prepr CMS', category: 'CMS', patterns: [
    { type: 'html', regex: /prepr\.io|prepr-io/i, via: 'Prepr CMS' }
  ]},

  // ── Additional Backend Frameworks ──
  { name: 'Fiber', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'server', regex: /fiber|gofiber/i, via: 'Fiber Go web framework' }
  ]},
  { name: 'Echo', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'server', regex: /echo/i, via: 'Echo Go framework' }
  ]},
  { name: 'Gin', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'server', regex: /gin-gonic/i, via: 'Gin Go framework' }
  ]},
  { name: 'Chi', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'server', regex: /go-chi/i, via: 'Chi Go router' }
  ]},
  { name: 'Nitro', category: 'Backend Framework', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /nitro/i, via: 'Nitro server engine' }
  ]},
  { name: 'Watt', category: 'Backend Framework', patterns: [
    { type: 'html', regex: /watt\.js|@fastify\/watt/i, via: 'Watt server framework' }
  ]},
  { name: 'Strapi v5', category: 'Backend Framework', patterns: [
    { type: 'html', regex: /strapi-v5|strapi5/i, via: 'Strapi v5 marker' }
  ]},
  { name: 'Appwrite Functions', category: 'Backend Framework', patterns: [
    { type: 'html', regex: /appwrite\.cloud\/functions|X-Appwrite-Function/i, via: 'Appwrite Functions' }
  ]},
  { name: 'Supabase Edge Functions', category: 'Backend Framework', patterns: [
    { type: 'html', regex: /supabase\.co\/functions|sb-/i, via: 'Supabase Edge Functions' }
  ]},

  // ── Additional Authentication ──
  { name: 'NextAuth.js', category: 'Authentication', patterns: [
    { type: 'html', regex: /next-auth|nextauth|__NEXT_AUTH/i, via: 'NextAuth.js session markers' },
    { type: 'cookie', regex: /next-auth\.session-token|next-auth\.csrf-token/i, via: 'NextAuth cookies' }
  ]},
  { name: 'Lucia Auth', category: 'Authentication', patterns: [
    { type: 'html', regex: /lucia-auth|lucia\.dev/i, via: 'Lucia Auth references' }
  ]},
  { name: 'Kinde', category: 'Authentication', patterns: [
    { type: 'html', regex: /kinde\.com|kinde-auth/i, via: 'Kinde authentication' }
  ]},
  { name: 'WorkOS', category: 'Authentication', patterns: [
    { type: 'html', regex: /workos\.com|workos-/i, via: 'WorkOS auth platform' }
  ]},
  { name: 'Stytch', category: 'Authentication', patterns: [
    { type: 'html', regex: /stytch\.com|stytch-/i, via: 'Stytch authentication' }
  ]},
  { name: 'Descope', category: 'Authentication', patterns: [
    { type: 'html', regex: /descope\.com|descope-/i, via: 'Descope authentication' }
  ]},
  { name: 'FusionAuth', category: 'Authentication', patterns: [
    { type: 'html', regex: /fusionauth|@fusionauth/i, via: 'FusionAuth platform' }
  ]},
  { name: 'Keycloak', category: 'Authentication', patterns: [
    { type: 'html', regex: /keycloak|KEYCLOAK/i, via: 'Keycloak SSO' },
    { type: 'header', key: 'x-powered-by', regex: /keycloak/i, via: 'Keycloak server' }
  ]},

  // ── Additional E-Commerce ──
  { name: 'Spree Commerce', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /spree-commerce|spree_/i, via: 'Spree Commerce' }
  ]},
  { name: 'Sylius', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /sylius/i, via: 'Sylius Symfony commerce' }
  ]},
  { name: 'Paddle.js', category: 'Payment Processor', patterns: [
    { type: 'script_src', regex: /paddle(?:\.js|\.min\.js)/i, via: 'Paddle payment script' }
  ]},

  // ── Additional Databases ──
  { name: 'SurrealDB', category: 'Database', patterns: [
    { type: 'header', key: 'server', regex: /surrealdb/i, via: 'SurrealDB server' },
    { type: 'html', regex: /surrealdb|@surrealdb/i, via: 'SurrealDB client' }
  ]},
  { name: 'ClickHouse', category: 'Database', patterns: [
    { type: 'header', key: 'x-clickhouse-server', regex: /.+/i, via: 'ClickHouse HTTP interface' },
    { type: 'header', key: 'x-clickhouse-summary', regex: /.+/i, via: 'ClickHouse response header' }
  ]},
  { name: 'InfluxDB', category: 'Database', patterns: [
    { type: 'html', regex: /influxdb|influx\.js|influx-/i, via: 'InfluxDB time-series database' }
  ]},
  { name: 'CockroachDB', category: 'Database', patterns: [
    { type: 'html', regex: /cockroachdb|cockroach-/i, via: 'CockroachDB' }
  ]},
  { name: 'TiDB', category: 'Database', patterns: [
    { type: 'html', regex: /tidb\.com|tidb-/i, via: 'TiDB distributed database' }
  ]},
  { name: 'Turso', category: 'Database', patterns: [
    { type: 'html', regex: /turso\.tech|turso\.io|libsql/i, via: 'Turso/libSQL database' }
  ]},
  { name: 'DuckDB', category: 'Database', patterns: [
    { type: 'html', regex: /duckdb|duckdb-wasm/i, via: 'DuckDB analytics database' }
  ]},
  { name: 'Valkey', category: 'Database', patterns: [
    { type: 'header', key: 'server', regex: /valkey/i, via: 'Valkey Redis fork' }
  ]},
  { name: 'Dragonfly', category: 'Database', patterns: [
    { type: 'header', key: 'server', regex: /dragonfly/i, via: 'Dragonfly Redis-compatible' }
  ]},
  { name: 'KeyDB', category: 'Database', patterns: [
    { type: 'header', key: 'server', regex: /keydb/i, via: 'KeyDB Redis alternative' }
  ]},
  { name: 'Deno KV', category: 'Database', patterns: [
    { type: 'html', regex: /deno\.kv|Deno\.openKv/i, via: 'Deno KV store' }
  ]},

  // ── Additional Search ──
  { name: 'ZincSearch', category: 'Search', patterns: [
    { type: 'header', key: 'server', regex: /zinc/i, via: 'ZincSearch server' }
  ]},
  { name: 'Typesense Cloud', category: 'Search', patterns: [
    { type: 'html', regex: /typesense\.cloud|typesense-/i, via: 'Typesense Cloud' }
  ]},
  { name: 'Manticore Search', category: 'Search', patterns: [
    { type: 'header', key: 'server', regex: /manticore/i, via: 'Manticore Search' }
  ]},
  { name: 'Meilisearch Cloud', category: 'Search', patterns: [
    { type: 'html', regex: /meilisearch\.com|meilisearch\.run/i, via: 'Meilisearch Cloud' }
  ]},
  { name: 'Orama', category: 'Search', patterns: [
    { type: 'html', regex: /oramajs|@oramasearch|orama/i, via: 'Orama full-text search' }
  ]},

  // ── Additional Analytics ──
  { name: 'Heap Analytics', category: 'Analytics', patterns: [
    { type: 'script_src', regex: /heap-[\d]+\.js|heap-analytics|heapanalytics/i, via: 'Heap analytics script' }
  ]},
  { name: 'Clarity', category: 'Analytics', patterns: [
    { type: 'script_src', regex: /clarity\.ms|clarity\.js/i, via: 'Microsoft Clarity script' }
  ]},
  { name: 'Statcounter', category: 'Analytics', patterns: [
    { type: 'script_src', regex: /statcounter\.com|statcounter-/i, via: 'StatCounter analytics' }
  ]},
  { name: 'Snowplow Analytics', category: 'Analytics', patterns: [
    { type: 'script_src', regex: /snowplow|sp\.js|snowplow-/i, via: 'Snowplow data collection' }
  ]},
  { name: 'Sentry Browser', category: 'Monitoring', patterns: [
    { type: 'script_src', regex: /browser\.sentry-cdn\.com|sentry-/i, via: 'Sentry browser SDK' }
  ]},
  { name: 'Highlight.io', category: 'Monitoring', patterns: [
    { type: 'script_src', regex: /highlight\.run|highlightio|highlight-/i, via: 'Highlight.io monitoring' }
  ]},

  // ── Additional Marketing / CRM ──
  { name: 'Ghost (Headless)', category: 'Blog / Publishing', patterns: [
    { type: 'html', regex: /ghost\.io\/ghost\/api|ghost-/i, via: 'Ghost Headless CMS API' }
  ]},

  // ── Additional Ads / Tracking Pixels ──
  { name: 'Google Ads', category: 'Advertising', patterns: [
    { type: 'script_src', regex: /googleads\.g\.doubleclick\.net|adservice\.google\.com/i, via: 'Google Ads scripts' }
  ]},
  { name: 'Microsoft Ads', category: 'Advertising', patterns: [
    { type: 'script_src', regex: /bat\.bing\.com|clarity\.ms\/tag/i, via: 'Microsoft Advertising tag' }
  ]},

  // ── Additional SEO ──
  { name: 'RankMath', category: 'Marketing', patterns: [
    { type: 'html', regex: /rank-math|rankmath/i, via: 'RankMath SEO plugin' }
  ]},
  { name: 'Yoast SEO', category: 'Marketing', patterns: [
    { type: 'html', regex: /yoast\.com|yoast-seo|wpseo-/i, via: 'Yoast SEO plugin' }
  ]},
  { name: 'SEOPress', category: 'Marketing', patterns: [
    { type: 'html', regex: /seopress|seopress-/i, via: 'SEOPress plugin' }
  ]},
  { name: 'Schema.org', category: 'Marketing', patterns: [
    { type: 'html', regex: /schema\.org|itemtype="https?:\/\/schema\.org/i, via: 'Schema.org structured data' }
  ]},

  // ── Additional Page Builders ──
  { name: 'Kadence', category: 'Page Builder', patterns: [
    { type: 'html', regex: /kadence|kadence-/i, via: 'Kadence page builder' }
  ]},
  { name: 'GeneratePress', category: 'Page Builder', patterns: [
    { type: 'html', regex: /generatepress|generatepress-/i, via: 'GeneratePress theme' }
  ]},
  { name: 'Flavor Theme Builder', category: 'Page Builder', patterns: [
    { type: 'html', regex: /flavor-theme|flavortheme/i, via: 'Flavor Theme Builder' }
  ]},
  { name: 'Live Composer', category: 'Page Builder', patterns: [
    { type: 'html', regex: /live-composer|dlp-/i, via: 'Live Composer page builder' }
  ]},
  { name: 'Page Builder Framework', category: 'Page Builder', patterns: [
    { type: 'html', regex: /page-builder-framework|pbf-/i, via: 'Page Builder Framework theme' }
  ]},

  // ── Additional Social / Embeds ──
  { name: 'Threads Embed', category: 'Social Feeds', patterns: [
    { type: 'html', regex: /threads\.net|threads-embed/i, via: 'Threads social embed' }
  ]},
  { name: 'Bluesky Embed', category: 'Social Feeds', patterns: [
    { type: 'html', regex: /bsky\.app|bluesky-embed/i, via: 'Bluesky social embed' }
  ]},
  { name: 'Mastodon Embed', category: 'Social Feeds', patterns: [
    { type: 'html', regex: /mastodon\.social|mastodon-embed/i, via: 'Mastodon social embed' }
  ]},
  { name: 'Lemon Squeezy Storefront', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /lemonsqueezy\.com|ls-/i, via: 'Lemon Squeezy storefront' }
  ]},

  // ── Additional Comment Systems ──
  { name: 'Giscus', category: 'Comment Systems', patterns: [
    { type: 'html', regex: /giscus\.app|giscus-/i, via: 'Giscus GitHub Discussions comments' }
  ]},
  { name: 'Cusdis', category: 'Comment Systems', patterns: [
    { type: 'html', regex: /cusdis\.com|cusdis-/i, via: 'Cusdis lightweight comments' }
  ]},
  { name: 'Twikoo', category: 'Comment Systems', patterns: [
    { type: 'html', regex: /twikoo|twikoo-/i, via: 'Twikoo comment system' }
  ]},
  { name: 'Waline', category: 'Comment Systems', patterns: [
    { type: 'html', regex: /waline|@waline/i, via: 'Waline comment system' }
  ]},
  { name: 'Artalk', category: 'Comment Systems', patterns: [
    { type: 'html', regex: /artalk|@artalk/i, via: 'Artalk comment system' }
  ]},

  // ── Additional DevOps / CI/CD ──
  { name: 'Turborepo', category: 'CI/CD', patterns: [
    { type: 'html', regex: /turborepo|turbo\.json|@turbo/i, via: 'Turborepo monorepo tool' }
  ]},
  { name: 'Nx', category: 'CI/CD', patterns: [
    { type: 'html', regex: /nx\.dev|nx\.json|@nx\/|nxwl/i, via: 'Nx monorepo tool' }
  ]},
  { name: 'Changesets', category: 'CI/CD', patterns: [
    { type: 'html', regex: /changesets|@changesets\//i, via: 'Changesets versioning' }
  ]},
  { name: 'Lerna', category: 'CI/CD', patterns: [
    { type: 'html', regex: /lerna\.json|lerna-/i, via: 'Lerna monorepo tool' }
  ]},
  { name: 'Semantic Release', category: 'CI/CD', patterns: [
    { type: 'html', regex: /semantic-release|semrel/i, via: 'Semantic Release automation' }
  ]},
  { name: 'Buddy', category: 'CI/CD', patterns: [
    { type: 'html', regex: /buddy\.works|buddy-/i, via: 'Buddy CI/CD platform' }
  ]},
  { name: 'Woodpecker CI', category: 'CI/CD', patterns: [
    { type: 'header', key: 'server', regex: /woodpecker/i, via: 'Woodpecker CI server' },
    { type: 'html', regex: /woodpecker-ci|woodpecker\.yml/i, via: 'Woodpecker CI config' }
  ]},
  { name: 'Gitea Actions', category: 'CI/CD', patterns: [
    { type: 'header', key: 'server', regex: /gitea/i, via: 'Gitea self-hosted Git' }
  ]},
  { name: 'Forgejo', category: 'VCS / Git Hosting', patterns: [
    { type: 'header', key: 'server', regex: /forgejo/i, via: 'Forgejo Gitea fork' }
  ]},

  // ── Additional CDN / Edge / Hosting ──
  { name: 'Fastly CDN', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'x-served-by', regex: /cache-?\w+/i, via: 'Fastly CDN edge' },
    { type: 'header', key: 'x-cache', regex: /HIT|MISS|fastly/i, via: 'Fastly cache header' }
  ]},
  { name: 'Cloudflare Images', category: 'Image CDN', patterns: [
    { type: 'html', regex: /imagedelivery\.net|cf-static\.|images\.cloudflare/i, via: 'Cloudflare Images' }
  ]},
  { name: 'Vercel Edge Network', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'x-vercel-id', regex: /.+/i, via: 'Vercel edge request ID' }
  ]},
  { name: 'Netlify Edge', category: 'CDN / Hosting', patterns: [
    { type: 'header', key: 'x-nf-request-id', regex: /.+/i, via: 'Netlify edge request' }
  ]},

  // ── Additional Cloud Platforms ──
  { name: 'DigitalOcean App Platform', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /digitalocean\.com\/apps|do-/i, via: 'DigitalOcean App Platform' }
  ]},
  { name: 'AWS Amplify', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /amplify\.?aws|aws-amplify/i, via: 'AWS Amplify framework' }
  ]},
  { name: 'Firebase Hosting', category: 'Cloud Platform', patterns: [
    { type: 'header', key: 'server', regex: /firebase/i, via: 'Firebase Hosting server' }
  ]},
  { name: 'Supabase Edge', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /supabase\.co|supabase\.com/i, via: 'Supabase platform' }
  ]},
  { name: 'Neon Postgres', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /neon\.tech|neon-/i, via: 'Neon serverless Postgres' }
  ]},

  // ── Additional Security / WAF ──
  { name: 'Cloudflare Turnstile', category: 'Captcha', patterns: [
    { type: 'html', regex: /turnstile|cf-turnstile|challenges\.cloudflare/i, via: 'Cloudflare Turnstile captcha' }
  ]},
  { name: 'Sucuri WAF', category: 'Security', patterns: [
    { type: 'header', key: 'server', regex: /sucuri/i, via: 'Sucuri cloud proxy' }
  ]},
  { name: 'Imperva WAF', category: 'Security', patterns: [
    { type: 'header', key: 'server', regex: /imperva|incapsula/i, via: 'Imperva/Incapsula WAF' }
  ]},

  // ── Additional Web Servers ──
  { name: 'H2O', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /h2o/i, via: 'H2O HTTP server' }
  ]},
  { name: 'Istio', category: 'Container / Orchestration', patterns: [
    { type: 'header', key: 'x-envoy-upstream-service-time', regex: /.+/i, via: 'Istio service mesh via Envoy' }
  ]},

  // ── Additional Infrastructure / Tools ──
  { name: 'Terraform Cloud', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /terraform\.cloud|app\.terraform\.io/i, via: 'Terraform Cloud platform' }
  ]},
  { name: 'Consul', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /consul\.io|consul-/i, via: 'Consul service mesh' }
  ]},
  { name: 'Vault', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /vault\.io|vaultproject|vault-/i, via: 'HashiCorp Vault secrets' }
  ]},
  { name: 'Nomad', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /nomad\.io|nomadjob/i, via: 'HashiCorp Nomad orchestrator' }
  ]},

  // ── Additional Languages / Runtimes ──
  { name: 'Gleam', category: 'Platform / Language', patterns: [
    { type: 'html', regex: /gleam\.lang|gleam-/i, via: 'Gleam language' }
  ]},
  { name: 'Zig', category: 'Platform / Language', patterns: [
    { type: 'html', regex: /ziglang\.org|zig-/i, via: 'Zig programming language' }
  ]},
  { name: 'Nim', category: 'Platform / Language', patterns: [
    { type: 'html', regex: /nim-lang\.org|nim-/i, via: 'Nim programming language' }
  ]},
  { name: 'V (lang)', category: 'Platform / Language', patterns: [
    { type: 'html', regex: /vlang\.io|vlang-/i, via: 'V programming language' }
  ]},

  // ── Additional Testing ──

  // ── Additional Forums / Community ──
  { name: 'NodeBB', category: 'Forums / Community', patterns: [
    { type: 'html', regex: /nodebb|nodebb-/i, via: 'NodeBB forum software' }
  ]},
  { name: 'Lemmy', category: 'Forums / Community', patterns: [
    { type: 'html', regex: /lemmy|lemmy-/i, via: 'Lemmy Reddit alternative' }
  ]},

  // ── Additional Documentation ──
  { name: 'VitePress', category: 'Documentation', patterns: [
    { type: 'html', regex: /vitepress|vitepress-/i, via: 'VitePress documentation' }
  ]},
  { name: 'Nextra', category: 'Documentation', patterns: [
    { type: 'html', regex: /nextra|nextra-/i, via: 'Nextra Next.js docs' }
  ]},
  { name: 'Starlight', category: 'Documentation', patterns: [
    { type: 'html', regex: /starlight\.astro|starlight-/i, via: 'Starlight Astro docs' }
  ]},
  { name: 'MkDocs', category: 'Documentation', patterns: [
    { type: 'html', regex: /mkdocs|mkdocs-/i, via: 'MkDocs documentation' }
  ]},
  { name: 'Sphinx', category: 'Documentation', patterns: [
    { type: 'html', regex: /sphinx\.doc|sphinx-/i, via: 'Sphinx documentation generator' }
  ]},

  { name: 'esbuild', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /esbuild|esbuild-/i, via: 'esbuild bundler' }
  ]},

  { name: 'Rollup', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /rollup\.js|rollup-/i, via: 'Rollup bundler' }
  ]},

  { name: 'Parcel', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /parceljs|parcel-/i, via: 'Parcel bundler' }
  ]},

  { name: 'SWC', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /swc\.|@swc\/|swc-loader/i, via: 'SWC compiler' }
  ]},

  { name: 'Biome', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /biomejs|biome\.json|@biomejs/i, via: 'Biome toolchain' }
  ]},

  { name: 'tsup', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /tsup|tsup\.config/i, via: 'tsup bundler' }
  ]},

  { name: 'Unbuild', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /unbuild|unbuild\.config/i, via: 'Unbuild build system' }
  ]},

  { name: 'Webpack', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /webpackJsonp|webpackChunk|__webpack_require__/i, via: 'Webpack runtime' },
    { type: 'script_src', regex: /webpack\.js|webpack\.min\.js/i, via: 'Webpack bundle' }
  ]},

  { name: 'Rspack', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /rspack|__rspack_runtime__/i, via: 'Rspack bundler' }
  ]},


  { name: 'tsx', category: 'Platform / Language', patterns: [
    { type: 'html', regex: /tsx\.run|tsx-loader/i, via: 'tsx TypeScript executor' }
  ]},

  { name: 'ts-node', category: 'Platform / Language', patterns: [
    { type: 'html', regex: /ts-node|ts-node-dev/i, via: 'ts-node TypeScript runner' }
  ]},


  { name: 'Focus Trap', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /focus-trap|@focus-trap/i, via: 'Focus Trap accessibility' }
  ]},

  { name: 'Intersect.js', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /intersect\.js|is-in-viewport/i, via: 'Intersect viewport detection' }
  ]},

  { name: 'Body Scroll Lock', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /body-scroll-lock|disableScroll/i, via: 'Body Scroll Lock' }
  ]},

  { name: 'Command Menu', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /cmdk|command-menu|cmdk-/i, via: 'cmdk command menu' }
  ]},

  { name: 'Vaul', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /vaul|@vaul/i, via: 'Vaul drawer component' }
  ]},

  { name: 'Pragmatic Drag and Drop', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /pragmatic-drag-and-drop|@atlaskit\/pragmatic/i, via: 'Atlassian drag and drop' }
  ]},

  { name: 'dnd-kit', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /dnd-kit|@dnd-kit/i, via: 'dnd-kit drag and drop' }
  ]},

  { name: 'Howler.js', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /howler(?:\.min)?\.js/i, via: 'Howler.js audio' }
  ]},

  { name: 'Marked.js', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /marked(?:\.min)?\.js/i, via: 'Marked.js markdown parser' }
  ]},

  { name: 'highlight.js', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /highlight(?:\.min|\.pack)?\.js|hljs/i, via: 'highlight.js syntax highlighting' }
  ]},

  { name: 'React Spring', category: 'Animation', patterns: [
    { type: 'html', regex: /react-spring|@react-spring/i, via: 'React Spring animations' }
  ]},

  { name: 'Fabric.js', category: 'JavaScript Graphics', patterns: [
    { type: 'script_src', regex: /fabric(?:\.min)?\.js/i, via: 'Fabric.js canvas library' }
  ]},

  { name: 'Konva', category: 'JavaScript Graphics', patterns: [
    { type: 'script_src', regex: /konva(?:\.min)?\.js/i, via: 'Konva 2D canvas library' }
  ]},

  { name: 'Choices.js', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /choices(?:\.min|\.js)/i, via: 'Choices.js select boxes' }
  ]},

  { name: 'NoUiSlider', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /nouislider(?:\.min)?\.js/i, via: 'noUiSlider range slider' },
    { type: 'link_tag', regex: /nouislider(?:\.min)?\.css/i, via: 'noUiSlider styles' }
  ]},

  { name: 'Popper.js 2', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /@popperjs\/core|popper2/i, via: 'Popper.js v2 positioning' }
  ]},

  { name: 'Microtip', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /microtip|role="tooltip"/i, via: 'Microtip tooltips' }
  ]},


  { name: 'Animate.css', category: 'CSS Framework', patterns: [
    { type: 'link_tag', regex: /animate(?:\.min)?\.css/i, via: 'Animate.css library' },
    { type: 'html', regex: /animate__|animate__fadeIn|animate__bounce/i, via: 'Animate.css class names' },
    { type: 'css_class', regex: /\banimate__(?:fadeIn|bounce|flash|pulse|rubberBand|shake|slideIn|zoomIn|heartBeat|jackInTheBox|lightSpeedIn|rollIn|rotateIn|swing|tada|wobble|jello|backIn|flip|lightSpeedOut)/i, via: 'Animate.css animation classes' }
  ]},

  { name: 'Normalize.css', category: 'CSS Framework', patterns: [
    { type: 'link_tag', regex: /normalize(?:\.min)?\.css/i, via: 'Normalize.css reset' }
  ]},

  { name: 'Modern Normalize', category: 'CSS Framework', patterns: [
    { type: 'link_tag', regex: /modern-normalize|modernnormalize/i, via: 'Modern Normalize CSS reset' }
  ]},

  { name: 'Reset CSS', category: 'CSS Framework', patterns: [
    { type: 'link_tag', regex: /reset\.css|reset-css/i, via: 'CSS Reset' }
  ]},

  { name: 'Milligram', category: 'CSS Framework', patterns: [
    { type: 'link_tag', regex: /milligram(?:\.min)?\.css/i, via: 'Milligram minimal CSS' }
  ]},

  { name: 'MVP.css', category: 'CSS Framework', patterns: [
    { type: 'link_tag', regex: /mvp\.css|mvp\.min\.css/i, via: 'MVP.css classless CSS' }
  ]},

  { name: 'Pico.css', category: 'CSS Framework', patterns: [
    { type: 'link_tag', regex: /pico(?:\.min)?\.css|@picocss/i, via: 'Pico.css classless CSS' }
  ]},

  { name: 'Water.css', category: 'CSS Framework', patterns: [
    { type: 'link_tag', regex: /water\.css|water\.min\.css/i, via: 'Water.css classless CSS' }
  ]},

  { name: 'Chota', category: 'CSS Framework', patterns: [
    { type: 'link_tag', regex: /chota(?:\.min)?\.css/i, via: 'Chota micro CSS framework' }
  ]},

  { name: 'Sakura', category: 'CSS Framework', patterns: [
    { type: 'link_tag', regex: /sakura(?:\.min)?\.css/i, via: 'Sakura classless CSS' }
  ]},


  { name: 'Amazon Cognito', category: 'Authentication', patterns: [
    { type: 'html', regex: /amazoncognito|cognito-idp|amazon-cognito/i, via: 'Amazon Cognito auth' }
  ]},

  { name: 'Firebase Phone Auth', category: 'Authentication', patterns: [
    { type: 'html', regex: /firebaseui|firebase-auth-phone|recaptcha.*firebase/i, via: 'Firebase Phone Auth' }
  ]},

  { name: 'Nhost', category: 'Authentication', patterns: [
    { type: 'html', regex: /nhost\.io|@nhost/i, via: 'Nhost auth platform' }
  ]},

  { name: 'SuperTokens', category: 'Authentication', patterns: [
    { type: 'html', regex: /supertokens|@supertokens/i, via: 'SuperTokens auth' }
  ]},


  { name: 'Prometheus', category: 'Monitoring', patterns: [
    { type: 'html', regex: /prometheus|prometheus-/i, via: 'Prometheus monitoring' }
  ]},

  { name: 'Jaeger', category: 'Monitoring', patterns: [
    { type: 'html', regex: /jaeger|jaeger-/i, via: 'Jaeger tracing' }
  ]},

  { name: 'Zipkin', category: 'Monitoring', patterns: [
    { type: 'html', regex: /zipkin|zipkin-/i, via: 'Zipkin distributed tracing' }
  ]},


  { name: 'FastSpring', category: 'Payment Processor', patterns: [
    { type: 'script_src', regex: /fastspring|fs-[a-z]+\.js/i, via: 'FastSpring payments' }
  ]},

  { name: 'Gumroad Overlay', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /gumroad\.com\/overlay|gumroad-overlay/i, via: 'Gumroad payment overlay' }
  ]},

  { name: 'Zuora', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /zuora|zuora-/i, via: 'Zuora subscription management' }
  ]},


  { name: 'Mux', category: 'Video Players', patterns: [
    { type: 'html', regex: /mux\.com|mux\.video|@mux\/|mux-player/i, via: 'Mux video hosting' }
  ]},

  { name: 'Cloudflare Stream', category: 'Video Players', patterns: [
    { type: 'html', regex: /cloudflarestream|cloudflare\.com\/cdn-cgi/i, via: 'Cloudflare Stream' }
  ]},

  { name: 'Bunny Stream', category: 'Video Players', patterns: [
    { type: 'html', regex: /bunny\.net\/stream|bunny-stream/i, via: 'Bunny Stream video' }
  ]},

  { name: 'Formik', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /formik|withFormik|useFormik/i, via: 'Formik form library' }
  ]},

  { name: 'Yup', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /yup\.|yup-/i, via: 'Yup schema validation' }
  ]},

  { name: 'Valibot', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /valibot|@valibot/i, via: 'Valibot validation' }
  ]},

  { name: 'SWR', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /swr\.vercel|@swr\/|useSWR/i, via: 'SWR data fetching' }
  ]},

  { name: 'Apollo Client', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /apollo-client|@apollo\/client|ApolloProvider/i, via: 'Apollo GraphQL client' }
  ]},

  { name: 'urql', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /urql|@urql\/|useQuery/i, via: 'urql GraphQL client' }
  ]},

  { name: 'GraphQL Yoga', category: 'API Protocol', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /graphql-yoga/i, via: 'GraphQL Yoga server' }
  ]},

  { name: 'Mercurius', category: 'API Protocol', patterns: [
    { type: 'header', key: 'x-powered-by', regex: /mercurius/i, via: 'Mercurius GraphQL adapter' }
  ]},


  { name: 'next-intl', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /next-intl|@next-intl/i, via: 'next-intl i18n' }
  ]},

  { name: 'react-i18next', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /react-i18next|@react-i18next/i, via: 'react-i18next translation' }
  ]},

  { name: 'i18next', category: 'JavaScript Library', patterns: [
    { type: 'script_src', regex: /i18next(?:\.min)?\.js/i, via: 'i18next internationalization' }
  ]},

  { name: 'FormatJS', category: 'JavaScript Library', patterns: [
    { type: 'html', regex: /formatjs|@formatjs|intl-/i, via: 'FormatJS i18n' }
  ]},

  { name: 'Cal.com', category: 'Business Tools', patterns: [
    { type: 'html', regex: /cal\.com|calcom-/i, via: 'Cal.com scheduling' }
  ]},

  { name: 'Calendly', category: 'Business Tools', patterns: [
    { type: 'html', regex: /calendly\.com|calendly-/i, via: 'Calendly scheduling' }
  ]},

  { name: 'Typeform', category: 'Business Tools', patterns: [
    { type: 'html', regex: /typeform\.com|typeform-/i, via: 'Typeform surveys' }
  ]},

  { name: 'Tally', category: 'Business Tools', patterns: [
    { type: 'html', regex: /tally\.so|tally-forms/i, via: 'Tally forms' }
  ]},

  { name: 'Loom', category: 'Business Tools', patterns: [
    { type: 'html', regex: /loom\.com|loom-/i, via: 'Loom video messaging' }
  ]},

  { name: 'Plane', category: 'Project Management', patterns: [
    { type: 'html', regex: /plane\.sh|plane-/i, via: 'Plane project management' }
  ]},

  { name: 'Shortcut', category: 'Project Management', patterns: [
    { type: 'html', regex: /shortcut\.com|shortcut-/i, via: 'Shortcut project management' }
  ]},

  { name: 'Height', category: 'Project Management', patterns: [
    { type: 'html', regex: /height\.app|height-/i, via: 'Height project management' }
  ]},

  // ── Deep scan rules: CSS content analysis ──
  { name: 'Tailwind CSS (deep)', category: 'CSS Framework', patterns: [
    { type: 'css_content', regex: /\.tailwind|tailwindcss|@layer\s+components|@layer\s+utilities|@apply\s+/i, via: 'Tailwind CSS in stylesheet content' }
  ]},
  { name: 'Bootstrap (deep)', category: 'CSS Framework', patterns: [
    { type: 'css_content', regex: /\.btn-primary|\.form-control|\.navbar|\.modal-content|\.carousel-item|\.card-body|\.alert-|\.badge-|\.jumbotron/i, via: 'Bootstrap CSS class definitions' }
  ]},
  { name: 'Bulma (deep)', category: 'CSS Framework', patterns: [
    { type: 'css_content', regex: /\.is-primary|\.is-link|\.hero-body|\.navbar-brand|\.section\.is-|\.button\.is-/i, via: 'Bulma CSS class definitions' }
  ]},
  { name: 'Foundation (deep)', category: 'CSS Framework', patterns: [
    { type: 'css_content', regex: /\.grid-x|\.cell\.large-|\.top-bar|\.callout|\.orbit|\.reveal-modal/i, via: 'Foundation CSS class definitions' }
  ]},
  { name: 'Materialize (deep)', category: 'CSS Framework', patterns: [
    { type: 'css_content', regex: /\.btn\.waves-effect|\.card-panel|\.chip\.materialize|\.collection-item|\.sidenav\.sidenav-/i, via: 'Materialize CSS class definitions' }
  ]},
  { name: 'Animate.css (deep)', category: 'Animation', patterns: [
    { type: 'css_content', regex: /@keyframes\s+(fadeIn|bounceIn|slideIn|zoomIn|flipIn|rotateIn|lightSpeedIn|jackInTheBox)/i, via: 'Animate.css keyframe definitions' }
  ]},
  { name: 'AOS (deep)', category: 'Animation', patterns: [
    { type: 'css_content', regex: /data-aos|aos-init|aos-animate|\.aos-/i, via: 'AOS animation library in CSS' }
  ]},
  { name: 'Open Props (deep)', category: 'CSS Framework', patterns: [
    { type: 'css_content', regex: /--default-font|--gray-|--surface-|open-props|@custom-media/i, via: 'Open Props CSS custom properties' }
  ]},
  { name: 'vanilla-extract (deep)', category: 'CSS Framework', patterns: [
    { type: 'css_content', regex: /\.vanilla-extract|ve-[a-z0-9]+\.css|vanilla\.extract/i, via: 'vanilla-extract generated CSS' }
  ]},
  { name: 'Styled Components (deep)', category: 'CSS Framework', patterns: [
    { type: 'css_content', regex: /sc-[a-z0-9]+|styled-components|__sc-/i, via: 'Styled Components generated classes' }
  ]},
  { name: 'UnoCSS (deep)', category: 'CSS Framework', patterns: [
    { type: 'css_content', regex: /unocss|uno\.css|@uno|layer\(--un-/i, via: 'UnoCSS atomic engine output' }
  ]},

  // ── Deep scan rules: JS content analysis ──
  { name: 'React (deep)', category: 'Frontend Framework', patterns: [
    { type: 'js_content', regex: /React\.createElement|ReactDOM\.render|react-dom|__REACT_DEVTOOLS|react\.production|react\.development/i, via: 'React framework in JS bundle' }
  ]},
  { name: 'Vue (deep)', category: 'Frontend Framework', patterns: [
    { type: 'js_content', regex: /Vue\.createApp|Vue\.component|vue\.runtime|__vue__|createApp\(\)|vue-router|vuex|pinia/i, via: 'Vue framework in JS bundle' }
  ]},
  { name: 'Angular (deep)', category: 'Frontend Framework', patterns: [
    { type: 'js_content', regex: /angular\.js|ng\.injector|angular\.module|@angular\/core|zone\.js|polyfills\.js.*angular/i, via: 'Angular framework in JS bundle' }
  ]},
  { name: 'Svelte (deep)', category: 'Frontend Framework', patterns: [
    { type: 'js_content', regex: /svelte\/internal|svelte\/store|svelte\/transition|svelte\/animate|__svelte/i, via: 'Svelte framework in JS bundle' }
  ]},
  { name: 'Next.js (deep)', category: 'Frontend Framework', patterns: [
    { type: 'js_content', regex: /_next\/static|next\/dist|next\/client|next\/server|__NEXT_DATA__|next\.config/i, via: 'Next.js framework in JS bundle' }
  ]},
  { name: 'Nuxt.js (deep)', category: 'Frontend Framework', patterns: [
    { type: 'js_content', regex: /_nuxt\/|nuxt\.js|nuxt\.dist|__NUXT__|nuxt\.config|createNuxtApp/i, via: 'Nuxt.js framework in JS bundle' }
  ]},
  { name: 'Remix (deep)', category: 'Frontend Framework', patterns: [
    { type: 'js_content', regex: /remix\.run|__remixContext|remix\.loader|remix\.action|remix-server/i, via: 'Remix framework in JS bundle' }
  ]},
  { name: 'Astro (deep)', category: 'Frontend Framework', patterns: [
    { type: 'js_content', regex: /astro-island|astro-component|@astro\/|astro\.config/i, via: 'Astro framework in JS bundle' }
  ]},
  { name: 'jQuery (deep)', category: 'JavaScript Library', patterns: [
    { type: 'js_content', regex: /jquery\.js|jquery-\d|jQuery\(|jquery\.min|jquery\.migrate/i, via: 'jQuery library in JS bundle' }
  ]},
  { name: 'Lodash (deep)', category: 'JavaScript Library', patterns: [
    { type: 'js_content', regex: /lodash\.js|lodash\.min|lodash\.compat|_\.forEach|_\.map\(|_\.filter\(|_\.reduce\(/i, via: 'Lodash utility in JS bundle' }
  ]},
  { name: 'Moment.js (deep)', category: 'JavaScript Library', patterns: [
    { type: 'js_content', regex: /moment\.js|moment\.min|moment\.locale|moment\.duration|moment\(\)/i, via: 'Moment.js date library in JS bundle' }
  ]},
  { name: 'Axios (deep)', category: 'JavaScript Library', patterns: [
    { type: 'js_content', regex: /axios\.js|axios\.min|axios\.create|XMLHttpRequest|axios\.get|axios\.post/i, via: 'Axios HTTP client in JS bundle' }
  ]},
  { name: 'D3.js (deep)', category: 'Charts / Data Visualization', patterns: [
    { type: 'js_content', regex: /d3\.js|d3\.scale|d3\.select|d3\.axis|d3\.line|d3\.pie|d3\.arc|d3\.force/i, via: 'D3.js visualization in JS bundle' }
  ]},
  { name: 'Chart.js (deep)', category: 'Charts / Data Visualization', patterns: [
    { type: 'js_content', regex: /chart\.js|Chart\.js|new\s+Chart\(|chart\.defaults|chart\.controllers/i, via: 'Chart.js in JS bundle' }
  ]},
  { name: 'GSAP (deep)', category: 'Animation', patterns: [
    { type: 'js_content', regex: /gsap\.js|gsap\.to|gsap\.from|gsap\.timeline|ScrollTrigger|ScrollMagic/i, via: 'GSAP animation in JS bundle' }
  ]},
  { name: 'Stripe.js (deep)', category: 'Payment Processor', patterns: [
    { type: 'js_content', regex: /stripe\.js|Stripe\(|stripe\.elements|stripe\.createPayment|payment_intent/i, via: 'Stripe payment in JS bundle' }
  ]},
  { name: 'PayPal SDK (deep)', category: 'Payment Processor', patterns: [
    { type: 'js_content', regex: /paypal\.js|paypal\.Buttons|paypal\.Order|paypal\.Payment|paypal-sdk/i, via: 'PayPal SDK in JS bundle' }
  ]},
  { name: 'reCAPTCHA (deep)', category: 'Captcha', patterns: [
    { type: 'js_content', regex: /recaptcha|grecaptcha|recaptcha\.execute|recaptcha\.render|google\.com\/recaptcha/i, via: 'reCAPTCHA in JS bundle' }
  ]},
  { name: 'Google Tag Manager (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /googletagmanager\.com|gtm\.js|dataLayer\.push|gtag\(|googletag/i, via: 'GTM in JS bundle' }
  ]},
  { name: 'Facebook Pixel (deep)', category: 'Advertising', patterns: [
    { type: 'js_content', regex: /facebook\.net\/en_US\/fbevents|fbq\(|_fbq|facebook\.com\/tr|fbevents\.js/i, via: 'Facebook Pixel in JS bundle' }
  ]},
  { name: 'Hotjar (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /hotjar\.com|hj\(|_hjSettings|hj\.tagCommand|hj\.q/i, via: 'Hotjar analytics in JS bundle' }
  ]},
  { name: 'Segment (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /analytics\.js|analytics\.load|analytics\.identify|analytics\.track|cdn\.segment\.com/i, via: 'Segment CDP in JS bundle' }
  ]},
  { name: 'Intercom (deep)', category: 'Customer Support', patterns: [
    { type: 'js_content', regex: /intercom\.js|Intercom\(|intercomSettings|widget\.intercom\.io|intercom-/i, via: 'Intercom messenger in JS bundle' }
  ]},
  { name: 'Crisp (deep)', category: 'Customer Support', patterns: [
    { type: 'js_content', regex: /crisp\.chat|CRISP_WEBSITE_ID|crisp\.js|\$crisp/i, via: 'Crisp chat in JS bundle' }
  ]},
  { name: 'Tawk.to (deep)', category: 'Customer Support', patterns: [
    { type: 'js_content', regex: /tawk\.to|Tawk_API|tawk\.js|embed\.tawk\.to/i, via: 'Tawk.to chat in JS bundle' }
  ]},
  { name: 'Zendesk (deep)', category: 'Customer Support', patterns: [
    { type: 'js_content', regex: /zendesk\.com|zE\(|zendesk\.widget|zdassets\.com/i, via: 'Zendesk support in JS bundle' }
  ]},
  { name: 'Drift (deep)', category: 'Customer Support', patterns: [
    { type: 'js_content', regex: /drift\.t\.id|drift\.js|drift\.load|Drift\(/i, via: 'Drift chat in JS bundle' }
  ]},
  { name: 'HubSpot (deep)', category: 'Marketing', patterns: [
    { type: 'js_content', regex: /hubspot\.com|hs-scripts|_hsq\.push|hubspot\.analytics|hbspt\./i, via: 'HubSpot tracking in JS bundle' }
  ]},
  { name: 'Marketo (deep)', category: 'Marketing', patterns: [
    { type: 'js_content', regex: /marketo\.com|MktoForms2|marketo\.js|landing\.marketo/i, via: 'Marketo marketing in JS bundle' }
  ]},
  { name: 'Salesforce (deep)', category: 'Business Tools', patterns: [
    { type: 'js_content', regex: /salesforce\.com|force\.com|sf\.js|sfdc_/i, via: 'Salesforce platform in JS bundle' }
  ]},
  { name: 'ServiceNow (deep)', category: 'Business Tools', patterns: [
    { type: 'js_content', regex: /servicenow\.com|now\.js|gsftnow|ServiceNow/i, via: 'ServiceNow platform in JS bundle' }
  ]},
  { name: 'Webflow (deep)', category: 'Page Builder', patterns: [
    { type: 'js_content', regex: /webflow\.com|wf-cdn|webflow\.js|webflow-/i, via: 'Webflow in JS bundle' }
  ]},
  { name: 'Squarespace (deep)', category: 'Page Builder', patterns: [
    { type: 'js_content', regex: /squarespace\.com|squarespace-cdn|sqsp-/i, via: 'Squarespace in JS bundle' }
  ]},
  { name: 'Wix (deep)', category: 'Page Builder', patterns: [
    { type: 'js_content', regex: /wix\.com|wixstatic|wix-html|wix\.build|wixCodeSdk/i, via: 'Wix in JS bundle' }
  ]},
  { name: 'Shopify (deep)', category: 'E-Commerce', patterns: [
    { type: 'js_content', regex: /shopify\.com|shopify\.js|Shopify\.theme|shopify-/i, via: 'Shopify in JS bundle' }
  ]},
  { name: 'WooCommerce (deep)', category: 'E-Commerce', patterns: [
    { type: 'js_content', regex: /woocommerce|wc-cart|wc-checkout|woocommerce-/i, via: 'WooCommerce in JS bundle' }
  ]},

  // ── Deep scan rules: path probing ──
  { name: 'WordPress (probe)', category: 'CMS', patterns: [
    { type: 'path_probe', regex: /wp-login\.php|wp-admin|wp-json|wp-content|wp-includes|xmlrpc\.php|feed/i, via: 'WordPress path signatures' }
  ]},
  { name: 'Drupal (probe)', category: 'CMS', patterns: [
    { type: 'path_probe', regex: /\/core\/misc\/drupal\.js|Drupal\.settings|sites\/default\/files/i, via: 'Drupal path signatures' }
  ]},
  { name: 'Ghost (probe)', category: 'CMS', patterns: [
    { type: 'path_probe', regex: /\/ghost\/|ghost\/content\/api/i, via: 'Ghost path signatures' }
  ]},
  { name: 'Joomla (probe)', category: 'CMS', patterns: [
    { type: 'path_probe', regex: /\/administrator\/|components\/com_|modules\/mod_|Joomla!/i, via: 'Joomla path signatures' }
  ]},
  { name: 'Umbraco (probe)', category: 'CMS', patterns: [
    { type: 'path_probe', regex: /\/umbraco\/|umbraco\.log/i, via: 'Umbraco path signatures' }
  ]},
  { name: 'Sitecore (probe)', category: 'CMS', patterns: [
    { type: 'path_probe', regex: /\/sitecore\/|\/shell\/sitecore/i, via: 'Sitecore path signatures' }
  ]},
  { name: 'Hugo (probe)', category: 'CMS', patterns: [
    { type: 'path_probe', regex: /\/hugo\/| hugo |generated by hugo/i, via: 'Hugo static site generator' }
  ]},
  { name: 'Jekyll (probe)', category: 'CMS', patterns: [
    { type: 'path_probe', regex: /jekyll|\/_posts\/|\/_layouts\/|generated by jekyll/i, via: 'Jekyll static site generator' }
  ]},
  { name: 'Gatsby (probe)', category: 'CMS', patterns: [
    { type: 'path_probe', regex: /___gatsby|gatsby-config|gatsby-browser|gatsby-ssr/i, via: 'Gatsby path signatures' }
  ]},
  { name: 'Next.js (probe)', category: 'Frontend Framework', patterns: [
    { type: 'path_probe', regex: /_next\/static|__next|_next\/data/i, via: 'Next.js path signatures' }
  ]},
  { name: 'Nuxt.js (probe)', category: 'Frontend Framework', patterns: [
    { type: 'path_probe', regex: /_nuxt\/|__nuxt|_nuxt\/builds/i, via: 'Nuxt.js path signatures' }
  ]},
  { name: 'Astro (probe)', category: 'Frontend Framework', patterns: [
    { type: 'path_probe', regex: /_astro\/|astro\.icon/i, via: 'Astro path signatures' }
  ]},
  { name: 'Sitemap.xml (probe)', category: 'SEO', patterns: [
    { type: 'path_probe', regex: /sitemap\.xml\s+->\s+200|sitemap_index\.xml\s+->\s+200/i, via: 'XML sitemap detected' }
  ]},
  { name: 'robots.txt (probe)', category: 'SEO', patterns: [
    { type: 'path_probe', regex: /robots\.txt\s+->\s+200/i, via: 'robots.txt detected' }
  ]},
  { name: 'GraphQL (probe)', category: 'API Protocol', patterns: [
    { type: 'path_probe', regex: /\/graphql\s+->\s+(200|400)/i, via: 'GraphQL endpoint detected' }
  ]},
  { name: 'API (probe)', category: 'API Protocol', patterns: [
    { type: 'path_probe', regex: /\/api\/\s+->\s+(200|401|403)/i, via: 'API endpoint detected' }
  ]},

  // ── Deep scan rules: browser-based detection ──
  { name: 'React (browser)', category: 'Frontend Framework', patterns: [
    { type: 'browser_var', regex: /React|__REACT_DEVTOOLS|reactRoot/i, via: 'React global variable in browser' }
  ]},
  { name: 'Vue (browser)', category: 'Frontend Framework', patterns: [
    { type: 'browser_var', regex: /Vue|__vue__|vueApp/i, via: 'Vue global variable in browser' }
  ]},
  { name: 'Angular (browser)', category: 'Frontend Framework', patterns: [
    { type: 'browser_var', regex: /angular|ng\.probe|getAllAngularRootElements/i, via: 'Angular global variable in browser' }
  ]},
  { name: 'jQuery (browser)', category: 'JavaScript Library', patterns: [
    { type: 'browser_var', regex: /jQuery|\$\.(fn|ajax|get|post)/i, via: 'jQuery global variable in browser' }
  ]},
  { name: 'd3 (browser)', category: 'Charts / Data Visualization', patterns: [
    { type: 'browser_var', regex: /^d3$/i, via: 'D3.js global variable in browser' }
  ]},
  { name: 'Google Maps (browser)', category: 'Maps', patterns: [
    { type: 'browser_var', regex: /google\.maps|google\.maps\.Map/i, via: 'Google Maps API in browser' }
  ]},
  { name: 'Stripe (browser)', category: 'Payment Processor', patterns: [
    { type: 'browser_var', regex: /^Stripe$|Stripe\(/i, via: 'Stripe global in browser' }
  ]},
  { name: 'Google Analytics (browser)', category: 'Analytics', patterns: [
    { type: 'browser_var', regex: /gtag|ga\(|dataLayer|google_tag_manager/i, via: 'Google Analytics globals in browser' }
  ]},
  { name: 'Facebook Pixel (browser)', category: 'Advertising', patterns: [
    { type: 'browser_var', regex: /fbq|_fbq|facebook\.pixel/i, via: 'Facebook Pixel global in browser' }
  ]},
  { name: 'Service Worker (browser)', category: 'PWA', patterns: [
    { type: 'browser_var', regex: /^serviceWorker$/i, via: 'Service Worker API in browser' }
  ]},
  { name: 'PWA Manifest (browser)', category: 'PWA', patterns: [
    { type: 'browser', regex: /manifest\.json|manifest\.webmanifest/i, via: 'PWA manifest in rendered HTML' }
  ]},

  // ── Deep scan rules: browser network requests ──
  { name: 'Firebase (network)', category: 'Cloud Platform', patterns: [
    { type: 'browser_network', regex: /firebaseio\.com|firebasestorage\.googleapis|firebase\.google\.com/i, via: 'Firebase network requests' }
  ]},
  { name: 'Supabase (network)', category: 'Cloud Platform', patterns: [
    { type: 'browser_network', regex: /supabase\.co|supabase\.com/i, via: 'Supabase network requests' }
  ]},
  { name: 'Vercel Analytics (network)', category: 'Analytics', patterns: [
    { type: 'browser_network', regex: /vercel-analytics|_vercel\/insights/i, via: 'Vercel Analytics network requests' }
  ]},
  { name: 'Cloudflare (network)', category: 'CDN / Hosting', patterns: [
    { type: 'browser_network', regex: /cloudflare-insights|challenges\.cloudflare|cdnjs\.cloudflare/i, via: 'Cloudflare network requests' }
  ]},
  { name: 'Datadog RUM (network)', category: 'Monitoring', patterns: [
    { type: 'browser_network', regex: /browser-intake-datadoghq|datadoghq\.com/i, via: 'Datadog RUM network requests' }
  ]},
  { name: 'Sentry (network)', category: 'Monitoring', patterns: [
    { type: 'browser_network', regex: /sentry-cdn\.com|sentry\.io\/api\//i, via: 'Sentry error tracking network requests' }
  ]},
  { name: 'New Relic (network)', category: 'Monitoring', patterns: [
    { type: 'browser_network', regex: /newrelic\.com|nr-data\.net/i, via: 'New Relic network requests' }
  ]},
  { name: 'Segment (network)', category: 'Analytics', patterns: [
    { type: 'browser_network', regex: /cdn\.segment\.com|api\.segment\.io/i, via: 'Segment CDN network requests' }
  ]},
  { name: 'Algolia (network)', category: 'Search', patterns: [
    { type: 'browser_network', regex: /algolia\.net|algolianet\.com|dsn\.algolia\.net/i, via: 'Algolia search network requests' }
  ]},
  { name: 'Meilisearch (network)', category: 'Search', patterns: [
    { type: 'browser_network', regex: /meilisearch|ms-./i, via: 'Meilisearch network requests' }
  ]},


  // ═══════════════════════════════════════════════════════════════
  // MEGA EXPANSION: Additional detection rules
  // ═══════════════════════════════════════════════════════════════

  // ── E-Commerce SaaS / Shopify Apps ──
  { name: 'Attentive', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /attentive\.com|attentive-/i, via: 'Attentive SMS marketing' },
    { type: 'js_content', regex: /attentive|attentivesms|attn_/i, via: 'Attentive JS SDK' }
  ]},
  { name: 'Yotpo', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /yotpo\.com|yotpo-/i, via: 'Yotpo reviews & loyalty' },
    { type: 'js_content', regex: /yotpo|yotpoWidget|yotpo-reviews/i, via: 'Yotpo JS widget' }
  ]},
  { name: 'LoyaltyLion', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /loyaltylion\.com|loyaltylion-/i, via: 'LoyaltyLion loyalty program' },
    { type: 'js_content', regex: /loyaltylion|ll_/i, via: 'LoyaltyLion JS SDK' }
  ]},
  { name: 'Recharge', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /rechargepayments\.com|recharge-/i, via: 'Recharge subscriptions' },
    { type: 'js_content', regex: /recharge|rc-subscription|recharge-checkout/i, via: 'Recharge JS SDK' }
  ]},
  { name: 'Judge.me', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /judge\.me|judge-me|jdgm-/i, via: 'Judge.me product reviews' },
    { type: 'js_content', regex: /judge\.me|jdgm|Judge\.me/i, via: 'Judge.me review widget' }
  ]},
  { name: 'Okendo', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /okendo\.io|okendo-/i, via: 'Okendo reviews & surveys' },
    { type: 'js_content', regex: /okendo|okendoReviews/i, via: 'Okendo JS widget' }
  ]},
  { name: 'Stamped.io', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /stamped\.io|stamped-/i, via: 'Stamped.io reviews' },
    { type: 'js_content', regex: /stamped\.io|stampedReviews|Stamped_/i, via: 'Stamped.io widget' }
  ]},
  { name: 'Loox', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /loox\.io|loox-app|loox-/i, via: 'Loox photo reviews' }
  ]},
  { name: 'AliReviews', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /alireviews|ali-reviews/i, via: 'AliReviews Shopify app' }
  ]},
  { name: 'Vitals', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /vitals\.app|vitals-plan|vitals-/i, via: 'Vitals Shopify toolkit' }
  ]},
  { name: 'Rebuy', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /rebuyengine\.com|rebuy-/i, via: 'Rebuy personalization engine' }
  ]},
  { name: 'Nosto', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /nosto\.com|nosto-/i, via: 'Nosto commerce experience' },
    { type: 'js_content', regex: /nosto|nostoScript|nosto-recommendation/i, via: 'Nosto JS SDK' }
  ]},
  { name: 'Dynamic Yield', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /dynamicyield\.com|dy-/i, via: 'Dynamic Yield personalization' },
    { type: 'js_content', regex: /dy\.segment|dynamicyield|DY\.API/i, via: 'Dynamic Yield JS SDK' }
  ]},
  { name: 'Bold Subscriptions', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /boldapps\.com|bold-subscriptions|bold-recurring/i, via: 'Bold Subscriptions Shopify' }
  ]},
  { name: 'Seal Subscriptions', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /sealsubs\.com|seal-subscriptions/i, via: 'Seal Subscriptions Shopify' }
  ]},
  { name: 'Appstle', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /appstle\.com|appstle-/i, via: 'Appstle subscriptions & loyalty' }
  ]},
  { name: 'Skio', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /skio\.com|skio-/i, via: 'Skio subscriptions' }
  ]},
  { name: 'Loop Subscriptions', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /loopsubscriptions\.com|loop-subscriptions/i, via: 'Loop Subscriptions Shopify' }
  ]},
  { name: 'Rebuy Engine', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /rebuyengine|rebuy-/i, via: 'Rebuy smart cart' }
  ]},
  { name: 'Frequently Bought Together', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /frequently-bought|fbt-recommendation/i, via: 'FBT recommendation app' }
  ]},
  { name: 'Wishlist Plus', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /wishlist-plus|swym\.reviews/i, via: 'Wishlist Plus by Swym' }
  ]},
  { name: 'Swym', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /swym\.me|swym-/i, via: 'Swym wishlist & alerts' }
  ]},
  { name: 'Privy', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /privy\.com|privy-/i, via: 'Privy email & popups' },
    { type: 'js_content', regex: /privy_|privy\.on|privyEmbed/i, via: 'Privy JS widget' }
  ]},
  { name: 'Justuno', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /justuno\.com|justuno-/i, via: 'Justuno popups & promotions' }
  ]},
  { name: 'OptiMonk', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /optimonk\.com|optimonk-/i, via: 'OptiMonk popup builder' }
  ]},
  { name: 'Sumo', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /sumo\.com|sumo\.me|sumo-/i, via: 'Sumo list building' },
    { type: 'js_content', regex: /sumo\.me|sumo\.load|sumo_/i, via: 'Sumo JS SDK' }
  ]},
  { name: 'Wheelio', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /wheelio\.com|wheelio-/i, via: 'Wheelio gamified popup' }
  ]},
  { name: 'Picreel', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /picreel\.com|picreel-/i, via: 'Picreel exit popup' }
  ]},
  { name: 'Bloomreach', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /bloomreach\.com|bloomreach-/i, via: 'Bloomreach commerce experience' },
    { type: 'js_content', regex: /bloomreach|br_data|bloomreach-/i, via: 'Bloomreach JS SDK' }
  ]},
  { name: 'Searchspring', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /searchspring\.com|searchspring-/i, via: 'Searchspring site search' }
  ]},
  { name: 'Klevu', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /klevu\.com|klevu-/i, via: 'Klevu AI search' }
  ]},
  { name: 'Constructor.io', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /constructor\.io|constructorio/i, via: 'Constructor.io product discovery' }
  ]},
  { name: 'Nosto Search', category: 'Search', patterns: [
    { type: 'html', regex: /nosto\.com\/search|nosto-search/i, via: 'Nosto site search' }
  ]},
  { name: 'Findify', category: 'Search', patterns: [
    { type: 'html', regex: /findify\.io|findify-/i, via: 'Findify smart search' }
  ]},
  { name: 'Swell', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /swell\.is|swell-/i, via: 'Swell commerce platform' }
  ]},
  { name: 'Spocket', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /spocket\.co|spocket-/i, via: 'Spocket dropshipping' }
  ]},
  { name: 'DSers', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /dsers\.com|dsers-/i, via: 'DSers dropshipping' }
  ]},
  { name: 'Oberlo', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /oberlo\.com|oberlo-/i, via: 'Oberlo dropshipping' }
  ]},
  { name: 'Printful', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /printful\.com|printful-/i, via: 'Printful print-on-demand' }
  ]},
  { name: 'Printify', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /printify\.com|printify-/i, via: 'Printify print-on-demand' }
  ]},
  { name: 'Gelato', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /gelato\.com|gelato-/i, via: 'Gelato print-on-demand' }
  ]},
  { name: 'Paddle.js (deep)', category: 'Payment Processor', patterns: [
    { type: 'js_content', regex: /paddle\.com|Paddle\(|paddle\.checkout|paddleComplete/i, via: 'Paddle payment in JS bundle' }
  ]},
  { name: 'Gumroad (deep)', category: 'E-Commerce', patterns: [
    { type: 'js_content', regex: /gumroad\.com|gumroad\.overlay|gumroad_/i, via: 'Gumroad in JS bundle' }
  ]},
  { name: 'Shop Pay', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /shop-pay|shopPay|shop_pay/i, via: 'Shop Pay express checkout' }
  ]},
  { name: 'Apple Pay', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /apple-pay|applePay|apple_pay/i, via: 'Apple Pay checkout' }
  ]},
  { name: 'Google Pay', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /google-pay|googlePay|google_pay|gpay/i, via: 'Google Pay checkout' }
  ]},
  { name: 'Afterpay', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /afterpay\.com|afterpay-/i, via: 'Afterpay BNPL' },
    { type: 'js_content', regex: /afterpay|AfterpayCheckout|afterpay-/i, via: 'Afterpay JS SDK' }
  ]},
  { name: 'Affirm', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /affirm\.com|affirm-/i, via: 'Affirm BNPL' },
    { type: 'js_content', regex: /affirm|_affirm_|affirm\.checkout/i, via: 'Affirm JS SDK' }
  ]},
  { name: 'Sezzle', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /sezzle\.com|sezzle-/i, via: 'Sezzle BNPL' }
  ]},
  { name: 'Zip (Quadpay)', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /zip\.co|zip-pay|quadpay/i, via: 'Zip BNPL' }
  ]},
  { name: 'ZipPay', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /zippay|zip\.co\/us/i, via: 'ZipPay checkout' }
  ]},
  { name: 'Clearpay', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /clearpay\.co\.uk|clearpay-/i, via: 'Clearpay BNPL (UK Afterpay)' }
  ]},
  { name: 'Humm', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /humm\.com|humm-/i, via: 'Humm BNPL' }
  ]},
  { name: 'Laybuy', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /laybuy\.com|laybuy-/i, via: 'Laybuy BNPL' }
  ]},
  { name: 'Klarna (deep)', category: 'Payment Processor', patterns: [
    { type: 'js_content', regex: /klarna\.com\/js\/|klarna-payment|KlarnaPay|iDEAL_Klarna/i, via: 'Klarna JS integration' }
  ]},
  { name: 'Venmo', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /venmo\.com|venmo-/i, via: 'Venmo payment' }
  ]},
  { name: 'Cash App Pay', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /cashapp|cash-app-pay|squareup\.com\/cash/i, via: 'Cash App Pay' }
  ]},
  { name: 'Revolut Pay', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /revolut\.com|revolut-pay/i, via: 'Revolut Pay' }
  ]},
  { name: 'GrabPay', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /grab\.com|grabpay/i, via: 'GrabPay payment' }
  ]},
  { name: 'GoPay', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /gopay\.co\.id|gopay/i, via: 'GoPay Indonesia' }
  ]},
  { name: 'DOKU', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /doku\.com|doku-/i, via: 'DOKU payment gateway' }
  ]},
  { name: 'Xendit', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /xendit\.com|xendit-/i, via: 'Xendit payment gateway' }
  ]},
  { name: 'Midtrans', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /midtrans\.com|midtrans-/i, via: 'Midtrans payment gateway' }
  ]},
  { name: 'Paystack', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /paystack\.com|paystack-/i, via: 'Paystack payment gateway' },
    { type: 'js_content', regex: /PaystackPop|paystack\.js/i, via: 'Paystack JS SDK' }
  ]},
  { name: 'Flutterwave', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /flutterwave\.com|flutterwave-/i, via: 'Flutterwave payment gateway' },
    { type: 'js_content', regex: /Flutterwave|flutterwave\.js/i, via: 'Flutterwave JS SDK' }
  ]},
  { name: 'Stripe (deep)', category: 'Payment Processor', patterns: [
    { type: 'js_content', regex: /stripe\.com\/v3|Stripe\(|stripe\.js|_stripe_/i, via: 'Stripe JS integration' }
  ]},
  { name: 'Braintree (deep)', category: 'Payment Processor', patterns: [
    { type: 'js_content', regex: /braintree\.com|braintree-web|braintree\.dropin/i, via: 'Braintree JS SDK' }
  ]},
  { name: 'MercadoPago', category: 'Payment Processor', patterns: [
    { type: 'html', regex: /mercadopago\.com|mercadopago-/i, via: 'MercadoPago payments' },
    { type: 'js_content', regex: /MercadoPago|mercadopago\.js/i, via: 'MercadoPago JS SDK' }
  ]},
  { name: 'Chargebee (deep)', category: 'Payment Processor', patterns: [
    { type: 'js_content', regex: /chargebee|Chargebee\(/i, via: 'Chargebee subscription billing' }
  ]},
  { name: 'Recurly (deep)', category: 'Payment Processor', patterns: [
    { type: 'js_content', regex: /recurly\.js|recurly\.Recurly|recurly-/i, via: 'Recurly subscription JS' }
  ]},

  // ── Analytics, A/B Testing, Heatmaps, Session Replay ──
  { name: 'VWO', category: 'Analytics', patterns: [
    { type: 'html', regex: /vwo\.com|vwo-/i, via: 'VWO A/B testing' },
    { type: 'js_content', regex: /vwo_|_vwo|vwo\.com/i, via: 'VWO JS SDK' }
  ]},
  { name: 'AB Tasty', category: 'Analytics', patterns: [
    { type: 'html', regex: /abtasty\.com|abtasty-/i, via: 'AB Tasty experimentation' },
    { type: 'js_content', regex: /abtasty|ABTasty/i, via: 'AB Tasty JS SDK' }
  ]},
  { name: 'Convert', category: 'Analytics', patterns: [
    { type: 'html', regex: /convert\.com|convert-/i, via: 'Convert A/B testing' }
  ]},
  { name: 'Kameleoon', category: 'Analytics', patterns: [
    { type: 'html', regex: /kameleoon\.com|kameleoon-/i, via: 'Kameleoon personalization' },
    { type: 'js_content', regex: /kameleoon|Kameleoon\.API/i, via: 'Kameleoon JS SDK' }
  ]},
  { name: 'ABConvert', category: 'Analytics', patterns: [
    { type: 'html', regex: /abconvert\.com|abconvert-/i, via: 'ABConvert testing' }
  ]},
  { name: 'Nosto Experience Cloud', category: 'Analytics', patterns: [
    { type: 'html', regex: /nosto\.com\/experience|nosto-experience/i, via: 'Nosto experience' }
  ]},
  { name: 'Lucky Orange (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /luckyorange\.com|luckyorange_|LO\.init/i, via: 'Lucky Orange JS SDK' }
  ]},
  { name: 'Microsoft Clarity (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /clarity\.ms|h\.\(i\)|claritytag|clarity-js/i, via: 'Microsoft Clarity JS SDK' }
  ]},
  { name: 'FullStory (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /fullstory\.com|fs\.sandbox|FS\(|_fs_debug/i, via: 'FullStory JS SDK' }
  ]},
  { name: 'Heap (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /heap\.com|heap-\d+\.js|heap\.analytics|heapanalytics/i, via: 'Heap analytics JS' }
  ]},
  { name: 'Crazy Egg (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /crazyegg\.com|crazyegg\.js|CE2_/i, via: 'Crazy Egg JS SDK' }
  ]},
  { name: 'Mouseflow (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /mouseflow\.com|mouseflow\.js|_mfq/i, via: 'Mouseflow JS SDK' }
  ]},
  { name: 'Smartlook (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /smartlook\.com|smartlook\.js|smartlook-/i, via: 'Smartlook JS SDK' }
  ]},
  { name: 'Contentsquare', category: 'Analytics', patterns: [
    { type: 'html', regex: /contentsquare\.com|contentsquare-/i, via: 'Contentsquare digital insights' },
    { type: 'js_content', regex: /contentsquare|cszzle|CS_/i, via: 'Contentsquare JS SDK' }
  ]},
  { name: 'Quantum Metric', category: 'Analytics', patterns: [
    { type: 'html', regex: /quantummetric\.com|quantummetric-/i, via: 'Quantum Metric analytics' },
    { type: 'js_content', regex: /quantummetric|qm-/i, via: 'Quantum Metric JS SDK' }
  ]},
  { name: 'Glassbox', category: 'Analytics', patterns: [
    { type: 'html', regex: /glassbox\.com|glassbox-/i, via: 'Glassbox digital experience' },
    { type: 'js_content', regex: /glassbox|_glassbox/i, via: 'Glassbox JS SDK' }
  ]},
  { name: 'Telerik Fiddler', category: 'Analytics', patterns: [
    { type: 'html', regex: /telerik\.com|fiddler-/i, via: 'Telerik Fiddler' }
  ]},
  { name: 'Mixpanel (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /mixpanel\.com|mixpanel\.init|mixpanel\.track|mp\.track/i, via: 'Mixpanel JS SDK' }
  ]},
  { name: 'Amplitude (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /amplitude\.com|amplitude\.getInstance|amplitude\.init|amplitude\.track/i, via: 'Amplitude JS SDK' }
  ]},
  { name: 'mParticle (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /mparticle\.com|mparticle\.js|MP\.init|mparticle-/i, via: 'mParticle CDP JS' }
  ]},
  { name: 'RudderStack (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /rudderstack\.com|rudder-sdk|rudderanalytics|RudderStack\(/i, via: 'RudderStack JS SDK' }
  ]},
  { name: 'Tealium (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /tealiumiq|tags\.tiqcdn\.com|utag_|tealium-/i, via: 'Tealium JS tag' }
  ]},
  { name: 'Adobe Analytics (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /omtrdc\.net|adobe.*analytics|s_code|AppMeasurement|satellite\.lib/i, via: 'Adobe Analytics JS' }
  ]},
  { name: 'Adobe Launch (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /adobedtm\.com|launch-[a-z0-9]+\.min\.js|satellite\.js/i, via: 'Adobe Launch tag manager' }
  ]},
  { name: 'Google Analytics 4 (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /gtag\('config'|gtag\('event'|GA4|google-analytics\.com\/g\/collect/i, via: 'GA4 measurement' }
  ]},
  { name: 'PostHog (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /posthog\.js|posthog\.com|posthog\.init|ph-/i, via: 'PostHog product analytics' }
  ]},
  { name: 'Plausible (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /plausible\.io|plausible\.js|plausible-/i, via: 'Plausible analytics JS' }
  ]},
  { name: 'Fathom (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /usefathom\.com|fathom\.js|fathom\.cloud/i, via: 'Fathom analytics JS' }
  ]},
  { name: 'Simple Analytics (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /simpleanalytics\.com|simpleanalytics\.js|sa\.event/i, via: 'Simple Analytics JS' }
  ]},
  { name: 'Matomo (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /matomo\.js|piwik\.js|_paq\.push|matomo-/i, via: 'Matomo/Piwik analytics JS' }
  ]},
  { name: 'GoatCounter (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /goatcounter\.com|gc\.js|goatcounter-/i, via: 'GoatCounter analytics JS' }
  ]},
  { name: 'Clicky (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /clicky\.com|clicky\.js|clicky-/i, via: 'Clicky analytics JS' }
  ]},
  { name: 'Statcounter (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /statcounter\.com|statcounter-/i, via: 'StatCounter analytics JS' }
  ]},
  { name: 'Snowplow (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /snowplow|sp\.js|snowplow-web|snowplow-/i, via: 'Snowplow data collection JS' }
  ]},
  { name: 'Pirsch (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /pirsch\.io|pirsch\.js|pirsch-/i, via: 'Pirsch analytics JS' }
  ]},
  { name: 'Umami (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /umami\.js|umami\.cloud|umami-/i, via: 'Umami analytics JS' }
  ]},
  { name: 'Woopra (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /woopra\.com|woopra\.js|woopra-/i, via: 'Woopra analytics JS' }
  ]},
  { name: 'Kissmetrics (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /kissmetrics\.com|km-[a-z0-9]+\.js|kissmetrics-/i, via: 'Kissmetrics analytics JS' }
  ]},
  { name: 'Countly (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /countly\.com|countly\.js|Countly\.init/i, via: 'Countly analytics JS' }
  ]},
  { name: 'Splitbee (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /splitbee\.com|splitbee\.js|splitbee-/i, via: 'Splitbee analytics JS' }
  ]},
  { name: 'Tinybird', category: 'Analytics', patterns: [
    { type: 'html', regex: /tinybird\.co|tinybird-/i, via: 'Tinybird real-time analytics' }
  ]},
  { name: 'Vercel Analytics (deep)', category: 'Analytics', patterns: [
    { type: 'js_content', regex: /vercel-analytics|_vercel\/insights|va\.js/i, via: 'Vercel Analytics JS' }
  ]},
  { name: 'SpeedCurve', category: 'Analytics', patterns: [
    { type: 'html', regex: /speedcurve\.com|speedcurve-/i, via: 'SpeedCurve performance monitoring' },
    { type: 'js_content', regex: /speedcurve\.com|lux\.js|speedcurve-/i, via: 'SpeedCurve JS' }
  ]},
  { name: 'Calibre', category: 'Analytics', patterns: [
    { type: 'html', regex: /calibreapp\.com|calibre-/i, via: 'Calibre performance monitoring' }
  ]},
  { name: 'DebugBear', category: 'Analytics', patterns: [
    { type: 'html', regex: /debugbear\.com|debugbear-/i, via: 'DebugBear performance monitoring' }
  ]},
  { name: 'Mux (deep)', category: 'Video Players', patterns: [
    { type: 'js_content', regex: /mux\.com|mux\.video|@mux\/|mux-player|mux\.monitor/i, via: 'Mux video analytics JS' }
  ]},

  // ── Customer Support / Chat / Helpdesk / CRM ──
  { name: 'Freshdesk', category: 'Customer Support', patterns: [
    { type: 'html', regex: /freshdesk\.com|freshdesk-/i, via: 'Freshdesk helpdesk' },
    { type: 'js_content', regex: /freshdesk|FreshworksWidget|freshworks-/i, via: 'Freshdesk JS widget' }
  ]},
  { name: 'Help Scout', category: 'Customer Support', patterns: [
    { type: 'html', regex: /helpscout\.com|help-scout|helpscout-/i, via: 'Help Scout support' },
    { type: 'js_content', regex: /helpscout|HelpScoutBeacon/i, via: 'Help Scout JS beacon' }
  ]},
  { name: 'Tidio (deep)', category: 'Customer Support', patterns: [
    { type: 'html', regex: /tidio\.com|tidio-/i, via: 'Tidio live chat' },
    { type: 'js_content', regex: /tidio\.com|tidio\.js|tidiochat-/i, via: 'Tidio JS widget' }
  ]},
  { name: 'Pure Chat', category: 'Customer Support', patterns: [
    { type: 'html', regex: /purechat\.com|pure-chat/i, via: 'Pure Chat live chat' }
  ]},
  { name: 'Snap! Webchat', category: 'Customer Support', patterns: [
    { type: 'html', regex: /snap-webchat|snap-apps/i, via: 'Snap Webchat' }
  ]},
  { name: 'Convertful', category: 'Customer Support', patterns: [
    { type: 'html', regex: /convertful\.com|convertful-/i, via: 'Convertful popups & forms' }
  ]},
  { name: 'Canny', category: 'Customer Support', patterns: [
    { type: 'html', regex: /canny\.io|canny-/i, via: 'Canny feedback boards' }
  ]},
  { name: 'Nolt', category: 'Customer Support', patterns: [
    { type: 'html', regex: /nolt\.io|nolt-/i, via: 'Nolt feedback boards' }
  ]},
  { name: 'SatisMeter', category: 'Customer Support', patterns: [
    { type: 'html', regex: /satisometer\.com|satisometer-/i, via: 'SatisMeter NPS surveys' }
  ]},
  { name: 'Delighted', category: 'Customer Support', patterns: [
    { type: 'html', regex: /delighted\.com|delighted-/i, via: 'Delighted NPS surveys' }
  ]},
  { name: 'Typeform (deep)', category: 'Business Tools', patterns: [
    { type: 'js_content', regex: /typeform\.com|typeform-embed|Typeform/i, via: 'Typeform JS embed' }
  ]},
  { name: 'Tally (deep)', category: 'Business Tools', patterns: [
    { type: 'js_content', regex: /tally\.so|tally-forms|tally-/i, via: 'Tally forms JS' }
  ]},
  { name: 'Calendly (deep)', category: 'Business Tools', patterns: [
    { type: 'js_content', regex: /calendly\.com|calendly-/i, via: 'Calendly scheduling JS' }
  ]},
  { name: 'Cal.com (deep)', category: 'Business Tools', patterns: [
    { type: 'js_content', regex: /cal\.com|calcom-/i, via: 'Cal.com scheduling JS' }
  ]},
  { name: 'Notion (deep)', category: 'Business Tools', patterns: [
    { type: 'js_content', regex: /notion\.so|notion-static|notion-/i, via: 'Notion embed JS' }
  ]},
  { name: 'Airtable (deep)', category: 'Business Tools', patterns: [
    { type: 'js_content', regex: /airtable\.com|airtable-static|airtable-/i, via: 'Airtable embed JS' }
  ]},
  { name: 'Monday.com (deep)', category: 'Project Management', patterns: [
    { type: 'js_content', regex: /monday\.com|monday-apps|monday-/i, via: 'Monday.com JS' }
  ]},
  { name: 'Asana (deep)', category: 'Project Management', patterns: [
    { type: 'js_content', regex: /asana\.com|asana-/i, via: 'Asana embed JS' }
  ]},
  { name: 'Trello (deep)', category: 'Project Management', patterns: [
    { type: 'js_content', regex: /trello\.com|trello-/i, via: 'Trello embed JS' }
  ]},
  { name: 'Jira (deep)', category: 'Project Management', patterns: [
    { type: 'js_content', regex: /atlassian\.net|jira\.atlassian|jira-/i, via: 'Jira embed JS' }
  ]},
  { name: 'Linear (deep)', category: 'Project Management', patterns: [
    { type: 'js_content', regex: /linear\.app|linear-/i, via: 'Linear project management JS' }
  ]},
  { name: 'ClickUp (deep)', category: 'Project Management', patterns: [
    { type: 'js_content', regex: /clickup\.com|clickup-/i, via: 'ClickUp JS' }
  ]},
  { name: 'Loom (deep)', category: 'Business Tools', patterns: [
    { type: 'js_content', regex: /loom\.com|loom-/i, via: 'Loom video embed JS' }
  ]},
  { name: 'Loom Embed', category: 'Business Tools', patterns: [
    { type: 'html', regex: /loom\.com\/embed|loom\.com\/share/i, via: 'Loom video embed' }
  ]},
  { name: 'Wistia (deep)', category: 'Video Players', patterns: [
    { type: 'js_content', regex: /wistia\.com|wistia\.js|wistia-/i, via: 'Wistia video JS' }
  ]},
  { name: 'Vimeo (deep)', category: 'Video Players', patterns: [
    { type: 'js_content', regex: /vimeo\.com|vimeo\.player|player\.vimeo/i, via: 'Vimeo player JS' }
  ]},
  { name: 'YouTube (deep)', category: 'Video Players', patterns: [
    { type: 'js_content', regex: /youtube\.com|youtube-nocookie|youtube\.embed|YT\.Player/i, via: 'YouTube player JS' }
  ]},
  { name: 'Sprout Video', category: 'Video Players', patterns: [
    { type: 'html', regex: /sproutvideo\.com|sproutvideo-/i, via: 'Sprout Video hosting' }
  ]},
  { name: 'Vidyard', category: 'Video Players', patterns: [
    { type: 'html', regex: /vidyard\.com|vidyard-/i, via: 'Vidyard video hosting' },
    { type: 'js_content', regex: /vidyard\.com|vidyard-|Vidyard/i, via: 'Vidyard JS' }
  ]},
  { name: 'Loom Analytics', category: 'Analytics', patterns: [
    { type: 'html', regex: /loom\.com\/analytics|loom-analytics/i, via: 'Loom analytics' }
  ]},
  { name: 'Memberstack', category: 'Authentication', patterns: [
    { type: 'html', regex: /memberstack\.com|memberstack-/i, via: 'Memberstack memberships' }
  ]},
  { name: 'Outseta', category: 'Authentication', patterns: [
    { type: 'html', regex: /outseta\.com|outseta-/i, via: 'Outseta memberships' }
  ]},
  { name: 'Foxy', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /foxy\.io|foxycart|foxy-/i, via: 'Foxy commerce' }
  ]},
  { name: 'Ecwid (deep)', category: 'E-Commerce', patterns: [
    { type: 'js_content', regex: /ecwid\.com|Ecwid\(|ecwid-/i, via: 'Ecwid JS cart' }
  ]},
  { name: 'Snipcart (deep)', category: 'E-Commerce', patterns: [
    { type: 'js_content', regex: /snipcart\.com|snipcart\.js|snipcart-/i, via: 'Snipcart JS cart' }
  ]},

  // ── CDN, Hosting, Cloud, DNS, Edge, Security ──
  { name: 'Vercel Edge (deep)', category: 'CDN / Hosting', patterns: [
    { type: 'browser_network', regex: /vercel-insights|_vercel\/insights|vercel-analytics/i, via: 'Vercel edge network requests' }
  ]},
  { name: 'Netlify Edge (deep)', category: 'CDN / Hosting', patterns: [
    { type: 'browser_network', regex: /netlify\.com|netlify-/i, via: 'Netlify edge network requests' }
  ]},
  { name: 'Cloudflare R2', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /r2\.cloudflarestorage\.com|r2-/i, via: 'Cloudflare R2 storage' }
  ]},
  { name: 'Cloudflare D1', category: 'Database', patterns: [
    { type: 'html', regex: /d1\.cloudflare\.com|d1-/i, via: 'Cloudflare D1 database' }
  ]},
  { name: 'Cloudflare KV', category: 'Database', patterns: [
    { type: 'html', regex: /kv\.cloudflare\.com|workers\.kv/i, via: 'Cloudflare KV store' }
  ]},
  { name: 'Cloudflare Queues', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /queues\.cloudflare\.com|cloudflare-queues/i, via: 'Cloudflare Queues' }
  ]},
  { name: 'Cloudflare AI', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /ai\.cloudflare\.com|cloudflare-ai/i, via: 'Cloudflare AI gateway' }
  ]},
  { name: 'AWS Lambda', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /lambda\.amazonaws\.com|lambda-/i, via: 'AWS Lambda serverless' }
  ]},
  { name: 'AWS S3', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /s3\.amazonaws\.com|s3-/i, via: 'AWS S3 storage' }
  ]},
  { name: 'AWS CloudFront', category: 'CDN / Hosting', patterns: [
    { type: 'html', regex: /cloudfront\.net|cloudfront-/i, via: 'AWS CloudFront CDN' }
  ]},
  { name: 'AWS API Gateway', category: 'API Protocol', patterns: [
    { type: 'html', regex: /execute-api\..*\.amazonaws\.com|api\.amazonaws/i, via: 'AWS API Gateway' }
  ]},
  { name: 'AWS WAF (deep)', category: 'Security', patterns: [
    { type: 'browser_network', regex: /awswaf\.com|aws-waf|awswaf-/i, via: 'AWS WAF network requests' }
  ]},
  { name: 'Google Cloud Run', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /run\.app|cloud\.run/i, via: 'Google Cloud Run' }
  ]},
  { name: 'Google Cloud Functions', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /cloudfunctions\.net|cloud-functions/i, via: 'Google Cloud Functions' }
  ]},
  { name: 'Google Cloud Storage', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /storage\.googleapis\.com|storage\.cloud\.google/i, via: 'Google Cloud Storage' }
  ]},
  { name: 'Azure Functions', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /azurewebsites\.net|azure-functions/i, via: 'Azure Functions' }
  ]},
  { name: 'Azure Blob Storage', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /blob\.core\.windows\.net|azure-blob/i, via: 'Azure Blob Storage' }
  ]},
  { name: 'DigitalOcean Spaces', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /digitaloceanspaces\.com|spaces\.cdn/i, via: 'DigitalOcean Spaces' }
  ]},
  { name: 'DigitalOcean App Platform (deep)', category: 'Cloud Platform', patterns: [
    { type: 'browser_network', regex: /digitalocean\.com|do-app/i, via: 'DigitalOcean network requests' }
  ]},
  { name: 'Linode', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /linode\.com|linode-/i, via: 'Linode cloud hosting' }
  ]},
  { name: 'Vultr', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /vultr\.com|vultr-/i, via: 'Vultr cloud hosting' }
  ]},
  { name: 'Hetzner', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /hetzner\.com|hetzner-/i, via: 'Hetzner cloud hosting' }
  ]},
  { name: 'Scaleway', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /scaleway\.com|scaleway-/i, via: 'Scaleway cloud hosting' }
  ]},
  { name: 'Koyeb', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /koyeb\.com|koyeb-/i, via: 'Koyeb serverless platform' }
  ]},
  { name: 'Zeabur', category: 'Cloud Platform', patterns: [
    { type: 'html', regex: /zeabur\.com|zeabur-/i, via: 'Zeabur deployment platform' }
  ]},
  { name: 'WunderGraph', category: 'Developer Tools', patterns: [
    { type: 'html', regex: /wundergraph\.com|wundergraph-/i, via: 'WunderGraph API gateway' }
  ]},
  { name: 'Coolify (deep)', category: 'Cloud Platform', patterns: [
    { type: 'browser_network', regex: /coolify\.io|coolify-/i, via: 'Coolify self-hosted PaaS' }
  ]},
  { name: 'Dokku', category: 'Cloud Platform', patterns: [
    { type: 'header', key: 'server', regex: /dokku/i, via: 'Dokku mini-Heroku' }
  ]},
  { name: 'CapRover', category: 'Cloud Platform', patterns: [
    { type: 'header', key: 'server', regex: /caprover/i, via: 'CapRover PaaS' }
  ]},
  { name: 'YunoHost', category: 'Cloud Platform', patterns: [
    { type: 'header', key: 'server', regex: /yunohost/i, via: 'YunoHost self-hosting' }
  ]},
  { name: 'Cloudflare DNS', category: 'Infrastructure', patterns: [
    { type: 'header', key: 'cf-ray', regex: /.+/i, via: 'Cloudflare DNS proxy' }
  ]},
  { name: 'AWS Route 53', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /route53\.amazonaws\.com|route-53/i, via: 'AWS Route 53 DNS' }
  ]},
  { name: 'Fastly (deep)', category: 'CDN / Hosting', patterns: [
    { type: 'browser_network', regex: /fastly\.net|fastly-/i, via: 'Fastly CDN network requests' }
  ]},
  { name: 'Bunny CDN (deep)', category: 'CDN / Hosting', patterns: [
    { type: 'browser_network', regex: /bunnycdn\.com|bunny\.net/i, via: 'Bunny CDN network requests' }
  ]},
  { name: 'KeyCDN (deep)', category: 'CDN / Hosting', patterns: [
    { type: 'browser_network', regex: /kxcdn\.com|keycdn\.com/i, via: 'KeyCDN network requests' }
  ]},
  { name: 'jsDelivr', category: 'CDN / Hosting', patterns: [
    { type: 'script_src', regex: /jsdelivr\.net/i, via: 'jsDelivr CDN' },
    { type: 'link_tag', regex: /jsdelivr\.net/i, via: 'jsDelivr CDN link' }
  ]},
  { name: 'unpkg', category: 'CDN / Hosting', patterns: [
    { type: 'script_src', regex: /unpkg\.com/i, via: 'unpkg CDN' },
    { type: 'link_tag', regex: /unpkg\.com/i, via: 'unpkg CDN link' }
  ]},
  { name: 'cdnjs', category: 'CDN / Hosting', patterns: [
    { type: 'script_src', regex: /cdnjs\.cloudflare\.com/i, via: 'cdnjs CDN' }
  ]},
  { name: 'Skypack', category: 'CDN / Hosting', patterns: [
    { type: 'script_src', regex: /skypack\.dev/i, via: 'Skypack CDN' }
  ]},
  { name: 'esm.sh', category: 'CDN / Hosting', patterns: [
    { type: 'script_src', regex: /esm\.sh/i, via: 'esm.sh CDN' }
  ]},
  { name: 'jspm', category: 'CDN / Hosting', patterns: [
    { type: 'script_src', regex: /jspm\.dev|jspm\.io/i, via: 'jspm CDN' }
  ]},
  { name: 'Sucuri (deep)', category: 'Security', patterns: [
    { type: 'browser_network', regex: /sucuri\.net|sucuri-/i, via: 'Sucuri WAF network requests' }
  ]},
  { name: 'Wordfence (deep)', category: 'Security', patterns: [
    { type: 'js_content', regex: /wordfence\.com|wfLoginsBlock|wordfence-/i, via: 'Wordfence JS' }
  ]},
  { name: 'ModSecurity (deep)', category: 'Security', patterns: [
    { type: 'header', key: 'server', regex: /mod_security|modsecurity/i, via: 'ModSecurity WAF header' }
  ]},
  { name: 'Barracuda WAF (deep)', category: 'Security', patterns: [
    { type: 'header', key: 'server', regex: /barracuda/i, via: 'Barracuda WAF header' }
  ]},
  { name: 'F5 WAF (deep)', category: 'Security', patterns: [
    { type: 'header', key: 'server', regex: /BIG-IP|f5\.com/i, via: 'F5 BIG-IP WAF' }
  ]},
  { name: 'Imperva (deep)', category: 'Security', patterns: [
    { type: 'browser_network', regex: /imperva\.com|incapsula/i, via: 'Imperva WAF network requests' }
  ]},
  { name: 'hCaptcha (deep)', category: 'Captcha', patterns: [
    { type: 'js_content', regex: /hcaptcha\.com|hcaptcha-/i, via: 'hCaptcha JS' }
  ]},
  { name: 'Turnstile (deep)', category: 'Captcha', patterns: [
    { type: 'js_content', regex: /turnstile|challenges\.cloudflare|cf-turnstile/i, via: 'Cloudflare Turnstile JS' }
  ]},
  { name: 'Arkose Labs', category: 'Captcha', patterns: [
    { type: 'html', regex: /arkoselabs\.com|arkose-/i, via: 'Arkose Labs challenge' },
    { type: 'js_content', regex: /arkoselabs\.com|fc-/i, via: 'Arkose Labs JS' }
  ]},
  { name: 'GeeTest', category: 'Captcha', patterns: [
    { type: 'html', regex: /geetest\.com|geetest-/i, via: 'GeeTest CAPTCHA' },
    { type: 'js_content', regex: /geetest|gt_/i, via: 'GeeTest JS' }
  ]},
  { name: 'Friendly Captcha (deep)', category: 'Captcha', patterns: [
    { type: 'js_content', regex: /friendlycaptcha|frc-/i, via: 'Friendly Captcha JS' }
  ]},
  { name: 'Altcha (deep)', category: 'Captcha', patterns: [
    { type: 'js_content', regex: /altcha|ALTCHA-/i, via: 'Altcha proof-of-work JS' }
  ]},

  // ── CMS, Page Builders, E-Commerce Platforms ──
  { name: 'Contentstack (deep)', category: 'CMS', patterns: [
    { type: 'js_content', regex: /contentstack\.com|contentstack-/i, via: 'Contentstack CMS JS' }
  ]},
  { name: 'Sanity (deep)', category: 'CMS', patterns: [
    { type: 'js_content', regex: /sanity\.io|@sanity\/client|sanity-studio/i, via: 'Sanity CMS JS' }
  ]},
  { name: 'Contentful (deep)', category: 'CMS', patterns: [
    { type: 'js_content', regex: /contentful\.com|@contentful|contentful-/i, via: 'Contentful CMS JS' }
  ]},
  { name: 'Prismic (deep)', category: 'CMS', patterns: [
    { type: 'js_content', regex: /prismic\.io|@prismicio|prismic-/i, via: 'Prismic CMS JS' }
  ]},
  { name: 'Strapi (deep)', category: 'CMS', patterns: [
    { type: 'js_content', regex: /strapi\.io|strapi-/i, via: 'Strapi CMS JS' }
  ]},
  { name: 'Storyblok (deep)', category: 'CMS', patterns: [
    { type: 'js_content', regex: /storyblok\.com|storyblok-/i, via: 'Storyblok CMS JS' }
  ]},
  { name: 'KeystoneJS (deep)', category: 'CMS', patterns: [
    { type: 'js_content', regex: /keystonejs\.com|@keystonejs/i, via: 'KeystoneJS CMS JS' }
  ]},
  { name: 'Payload CMS (deep)', category: 'CMS', patterns: [
    { type: 'js_content', regex: /payloadcms\.com|payload-/i, via: 'Payload CMS JS' }
  ]},
  { name: 'Directus (deep)', category: 'CMS', patterns: [
    { type: 'js_content', regex: /directus\.io|@directus\/sdk|directus-/i, via: 'Directus CMS JS' }
  ]},
  { name: 'Ghost (deep)', category: 'CMS', patterns: [
    { type: 'js_content', regex: /ghost\.io|ghost\.org|ghost-/i, via: 'Ghost CMS JS' }
  ]},
  { name: 'WordPress (deep)', category: 'CMS', patterns: [
    { type: 'js_content', regex: /wp-content|wp-includes|wp-json|wordpress/i, via: 'WordPress JS bundle' }
  ]},
  { name: 'Squarespace Commerce', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /squarespace\.com\/commerce|squarespace-commerce/i, via: 'Squarespace Commerce' }
  ]},
  { name: 'Wix Stores', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /wix\.com\/ecommerce|wixstores/i, via: 'Wix Stores' }
  ]},
  { name: 'Magento (deep)', category: 'E-Commerce', patterns: [
    { type: 'js_content', regex: /magento\.com|requirejs\/|mage\/|Magento_|magento-/i, via: 'Magento JS' }
  ]},
  { name: 'PrestaShop', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /prestashop\.com|prestashop-/i, via: 'PrestaShop platform' },
    { type: 'js_content', regex: /prestashop|prestashop\.js/i, via: 'PrestaShop JS' }
  ]},
  { name: 'OpenCart', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /opencart\.com|opencart-/i, via: 'OpenCart platform' },
    { type: 'js_content', regex: /opencart|opencart\.js/i, via: 'OpenCart JS' }
  ]},
  { name: 'Zen Cart', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /zen-cart\.com|zen-cart/i, via: 'Zen Cart platform' }
  ]},
  { name: 'osCommerce', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /oscommerce\.com|oscommerce-/i, via: 'osCommerce platform' }
  ]},
  { name: 'X-Cart', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /x-cart\.com|xcart-/i, via: 'X-Cart platform' }
  ]},
  { name: 'CS-Cart', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /cs-cart\.com|cs-cart/i, via: 'CS-Cart platform' }
  ]},
  { name: 'Medusa (deep)', category: 'E-Commerce', patterns: [
    { type: 'js_content', regex: /medusajs\.com|@medusajs|medusa-/i, via: 'Medusa.js commerce JS' }
  ]},
  { name: 'Saleor (deep)', category: 'E-Commerce', patterns: [
    { type: 'js_content', regex: /saleor\.com|saleor-/i, via: 'Saleor commerce JS' }
  ]},
  { name: 'Commerce.js', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /commerce\.js|commercejs-/i, via: 'Commerce.js headless commerce' }
  ]},
  { name: 'Crystallize', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /crystallize\.com|crystallize-/i, via: 'Crystallize headless commerce' }
  ]},
  { name: 'Handshake', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /shake\.com|handshake-/i, via: 'Handshake wholesale marketplace' }
  ]},
  { name: 'Sana Commerce', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /sana-commerce|sanacommerce/i, via: 'Sana Commerce' }
  ]},
  { name: 'Vend', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /vend\.com|vend-/i, via: 'Vend POS' }
  ]},
  { name: 'Lightspeed', category: 'E-Commerce', patterns: [
    { type: 'html', regex: /lightspeed\.com|lightspeed-/i, via: 'Lightspeed POS & commerce' }
  ]},
  { name: 'Klaviyo (deep)', category: 'E-Commerce', patterns: [
    { type: 'js_content', regex: /klaviyo\.com|klaviyo\.js|_klOnsite|klaviyo_/i, via: 'Klaviyo JS SDK' }
  ]},
  { name: 'Attentive (deep)', category: 'E-Commerce', patterns: [
    { type: 'js_content', regex: /attentive\.com|attentive\.js|attn_/i, via: 'Attentive JS SDK' }
  ]},
  { name: 'Yotpo (deep)', category: 'E-Commerce', patterns: [
    { type: 'js_content', regex: /yotpo\.com|yotpo\.js|yotpoWidget/i, via: 'Yotpo JS widget' }
  ]},
  { name: 'LoyaltyLion (deep)', category: 'E-Commerce', patterns: [
    { type: 'js_content', regex: /loyaltylion\.com|loyaltylion\.js|ll_/i, via: 'LoyaltyLion JS SDK' }
  ]},
  { name: 'Recharge (deep)', category: 'E-Commerce', patterns: [
    { type: 'js_content', regex: /rechargepayments\.com|recharge\.js|rc-subscription/i, via: 'Recharge JS SDK' }
  ]},
  { name: 'Judge.me (deep)', category: 'E-Commerce', patterns: [
    { type: 'js_content', regex: /judge\.me|judge\.me\.js|jdgm_/i, via: 'Judge.me JS widget' }
  ]},
  { name: 'Gorgias (deep)', category: 'Customer Support', patterns: [
    { type: 'js_content', regex: /gorgias\.com|gorgias\.js|Gorgias-/i, via: 'Gorgias helpdesk JS' }
  ]},
  { name: 'Freshchat (deep)', category: 'Customer Support', patterns: [
    { type: 'js_content', regex: /freshchat\.com|freshchat\.js|FreshworksWidget/i, via: 'Freshchat JS widget' }
  ]},
  { name: 'Brave (Brave Browser)', category: 'Web Server', patterns: [
    { type: 'header', key: 'server', regex: /brave/i, via: 'Brave browser server header' }
  ]},
  { name: 'Deno Deploy (deep)', category: 'CDN / Hosting', patterns: [
    { type: 'browser_network', regex: /deno\.dev|deno\.land|deno-deploy/i, via: 'Deno Deploy network requests' }
  ]},
  { name: 'Netlify (deep)', category: 'CDN / Hosting', patterns: [
    { type: 'browser_network', regex: /netlify\.app|netlify\.com|netlify-/i, via: 'Netlify network requests' }
  ]},
  { name: 'Vercel (deep)', category: 'CDN / Hosting', patterns: [
    { type: 'browser_network', regex: /vercel\.app|vercel\.com|vercel-/i, via: 'Vercel network requests' }
  ]},
  { name: 'Firebase (deep)', category: 'Cloud Platform', patterns: [
    { type: 'browser_network', regex: /firebaseio\.com|firebasestorage\.googleapis|firebaseapp\.com/i, via: 'Firebase network requests' }
  ]},
  { name: 'Supabase (deep)', category: 'Cloud Platform', patterns: [
    { type: 'browser_network', regex: /supabase\.co|supabase\.in|supabase-/i, via: 'Supabase network requests' }
  ]},
  { name: 'Heroku (deep)', category: 'Cloud Platform', patterns: [
    { type: 'browser_network', regex: /herokuapp\.com|heroku\.com/i, via: 'Heroku network requests' }
  ]},
  { name: 'Fly.io (deep)', category: 'Cloud Platform', patterns: [
    { type: 'browser_network', regex: /fly\.dev|fly\.io|fly-/i, via: 'Fly.io network requests' }
  ]},
  { name: 'Railway (deep)', category: 'Cloud Platform', patterns: [
    { type: 'browser_network', regex: /railway\.app|railway\.run/i, via: 'Railway network requests' }
  ]},
  { name: 'Render (deep)', category: 'Cloud Platform', patterns: [
    { type: 'browser_network', regex: /onrender\.com|render-/i, via: 'Render network requests' }
  ]},
  { name: 'PlanetScale (deep)', category: 'Database', patterns: [
    { type: 'browser_network', regex: /planetscale\.com|planet-/i, via: 'PlanetScale network requests' }
  ]},
  { name: 'Neon (deep)', category: 'Database', patterns: [
    { type: 'browser_network', regex: /neon\.tech|neon-/i, via: 'Neon network requests' }
  ]},
  { name: 'Turso (deep)', category: 'Database', patterns: [
    { type: 'browser_network', regex: /turso\.tech|turso\.io|libsql/i, via: 'Turso network requests' }
  ]},

  // ── Backend, Database, Search, API, DevOps ──
  { name: 'Supabase Auth (deep)', category: 'Authentication', patterns: [
    { type: 'browser_network', regex: /supabase\.co\/auth|gotrue|supabase-auth/i, via: 'Supabase Auth network' }
  ]},
  { name: 'Clerk (deep)', category: 'Authentication', patterns: [
    { type: 'browser_network', regex: /clerk\.com|clerk\.accounts|clerk-/i, via: 'Clerk auth network' }
  ]},
  { name: 'Auth0 (deep)', category: 'Authentication', patterns: [
    { type: 'browser_network', regex: /auth0\.com|auth0-/i, via: 'Auth0 auth network' }
  ]},
  { name: 'Firebase Auth (deep)', category: 'Authentication', patterns: [
    { type: 'browser_network', regex: /identitytoolkit\.googleapis|securetoken\.googleapis|firebase-auth/i, via: 'Firebase Auth network' }
  ]},
  { name: 'NextAuth.js (deep)', category: 'Authentication', patterns: [
    { type: 'browser_cookie', regex: /next-auth\.session-token|next-auth\.csrf-token/i, via: 'NextAuth session cookies' }
  ]},
  { name: 'Supabase DB (deep)', category: 'Database', patterns: [
    { type: 'browser_network', regex: /supabase\.co\/rest\/|postgrest|supabase-db/i, via: 'Supabase PostgREST network' }
  ]},
  { name: 'PlanetScale DB (deep)', category: 'Database', patterns: [
    { type: 'browser_network', regex: /planetscale\.com\/db|planetscale-connect/i, via: 'PlanetScale DB network' }
  ]},
  { name: 'Redis (deep)', category: 'Database', patterns: [
    { type: 'header', key: 'server', regex: /redis/i, via: 'Redis server header' }
  ]},
  { name: 'MongoDB Atlas', category: 'Database', patterns: [
    { type: 'html', regex: /mongodb\.com\/atlas|mongodb-atlas/i, via: 'MongoDB Atlas' },
    { type: 'browser_network', regex: /mongodb\.net|mongodb\.com\/data|atlas-/i, via: 'MongoDB Atlas network' }
  ]},
  { name: 'Elasticsearch (deep)', category: 'Search', patterns: [
    { type: 'browser_network', regex: /elastic\.co|elasticsearch-/i, via: 'Elasticsearch network' }
  ]},
  { name: 'Algolia (deep)', category: 'Search', patterns: [
    { type: 'browser_network', regex: /algolia\.net|algolianet\.com|dsn\.algolia\.net/i, via: 'Algolia search network' }
  ]},
  { name: 'Meilisearch (deep)', category: 'Search', patterns: [
    { type: 'browser_network', regex: /meilisearch\.com|meilisearch-/i, via: 'Meilisearch network' }
  ]},
  { name: 'Typesense (deep)', category: 'Search', patterns: [
    { type: 'browser_network', regex: /typesense\.org|typesense-/i, via: 'Typesense search network' }
  ]},
  { name: 'GraphQL (deep)', category: 'API Protocol', patterns: [
    { type: 'browser_network', regex: /\/graphql|graphql-playground|graphiql/i, via: 'GraphQL endpoint network' }
  ]},
  { name: 'tRPC (deep)', category: 'API Protocol', patterns: [
    { type: 'browser_network', regex: /\/trpc\/|trpc-/i, via: 'tRPC endpoint network' }
  ]},
  { name: 'REST API (deep)', category: 'API Protocol', patterns: [
    { type: 'browser_network', regex: /\/api\/v\d|\/api\/rest|\/rest\//i, via: 'REST API endpoint network' }
  ]},
  { name: 'WebSocket (deep)', category: 'API Protocol', patterns: [
    { type: 'browser_network', regex: /wss?:\/\/|websocket/i, via: 'WebSocket connection' }
  ]},
  { name: 'Socket.io (deep)', category: 'API Protocol', patterns: [
    { type: 'browser_network', regex: /socket\.io|socket\.io\/client|socketio/i, via: 'Socket.io connection' }
  ]},
  { name: 'Server-Sent Events (deep)', category: 'API Protocol', patterns: [
    { type: 'browser_network', regex: /eventsource|text\/event-stream/i, via: 'Server-Sent Events connection' }
  ]},
  { name: 'Vercel KV', category: 'Database', patterns: [
    { type: 'html', regex: /vercel\.com\/kv|vercel-kv/i, via: 'Vercel KV store' },
    { type: 'browser_network', regex: /vercel\.com\/kv|vercel-kv/i, via: 'Vercel KV network' }
  ]},
  { name: 'Vercel Postgres', category: 'Database', patterns: [
    { type: 'html', regex: /vercel\.com\/postgres|vercel-postgres/i, via: 'Vercel Postgres' },
    { type: 'browser_network', regex: /vercel\.com\/postgres|vercel-postgres/i, via: 'Vercel Postgres network' }
  ]},
  { name: 'Upstash', category: 'Database', patterns: [
    { type: 'html', regex: /upstash\.com|upstash-/i, via: 'Upstash serverless Redis' },
    { type: 'browser_network', regex: /upstash\.io|upstash-/i, via: 'Upstash network' }
  ]},
  { name: 'Inngest', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /inngest\.com|inngest-/i, via: 'Inngest serverless queue' },
    { type: 'browser_network', regex: /inngest\.com|inngest-/i, via: 'Inngest network' }
  ]},
  { name: 'Svix', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /svix\.com|svix-/i, via: 'Svix webhooks' }
  ]},
  { name: 'Inngest (deep)', category: 'Infrastructure', patterns: [
    { type: 'js_content', regex: /inngest\.com|inngest-/i, via: 'Inngest JS SDK' }
  ]},
  { name: 'Trigger.dev', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /trigger\.dev|triggerdev/i, via: 'Trigger.dev background jobs' }
  ]},
  { name: 'QStash', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /qstash\.upstash|qstash-/i, via: 'QStash message queue' }
  ]},
  { name: 'Novu', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /novu\.co|novu-/i, via: 'Novu notification infrastructure' }
  ]},
  { name: 'Resend (deep)', category: 'Email', patterns: [
    { type: 'html', regex: /resend\.com|resend-/i, via: 'Resend email API' },
    { type: 'js_content', regex: /resend\.com|resend-/i, via: 'Resend JS SDK' }
  ]},
  { name: 'Loops (deep)', category: 'Email', patterns: [
    { type: 'html', regex: /loops\.so|loops-/i, via: 'Loops email API' }
  ]},
  { name: 'Plunk', category: 'Email', patterns: [
    { type: 'html', regex: /plunk\.com|plunk-/i, via: 'Plunk email API' }
  ]},
  { name: 'Mailmodo', category: 'Email', patterns: [
    { type: 'html', regex: /mailmodo\.com|mailmodo-/i, via: 'Mailmodo email API' }
  ]},
  { name: 'Brevo (deep)', category: 'Email', patterns: [
    { type: 'js_content', regex: /sendinblue\.com|brevo\.com|brevo-/i, via: 'Brevo (Sendinblue) JS' }
  ]},
  { name: 'Mailchimp (deep)', category: 'Email', patterns: [
    { type: 'js_content', regex: /mailchimp\.com|mailchimp-/i, via: 'Mailchimp JS' }
  ]},
  { name: 'Postmark (deep)', category: 'Email', patterns: [
    { type: 'js_content', regex: /postmarkapp\.com|postmark-/i, via: 'Postmark JS SDK' }
  ]},
  { name: 'SendGrid (deep)', category: 'Email', patterns: [
    { type: 'js_content', regex: /sendgrid\.com|sendgrid-/i, via: 'SendGrid JS SDK' }
  ]},
  { name: 'Mailgun (deep)', category: 'Email', patterns: [
    { type: 'js_content', regex: /mailgun\.com|mailgun-/i, via: 'Mailgun JS SDK' }
  ]},
  { name: 'Amazon SES (deep)', category: 'Email', patterns: [
    { type: 'js_content', regex: /ses\.amazonaws|amazon-ses|amazonaws.*ses/i, via: 'Amazon SES SDK' }
  ]},
  { name: 'SparkPost (deep)', category: 'Email', patterns: [
    { type: 'js_content', regex: /sparkpost\.com|sparkpost-/i, via: 'SparkPost JS SDK' }
  ]},
  { name: 'ConvertKit (deep)', category: 'Email', patterns: [
    { type: 'js_content', regex: /convertkit\.com|convertkit-/i, via: 'ConvertKit JS' }
  ]},
  { name: 'ActiveCampaign (deep)', category: 'Email', patterns: [
    { type: 'js_content', regex: /activecampaign\.com|activecampaign-/i, via: 'ActiveCampaign JS' }
  ]},
  { name: 'Drip (deep)', category: 'Email', patterns: [
    { type: 'js_content', regex: /drip\.com|drip\.js|drip-/i, via: 'Drip JS SDK' }
  ]},
  { name: 'Iterable (deep)', category: 'Email', patterns: [
    { type: 'js_content', regex: /iterable\.com|iterable-/i, via: 'Iterable JS SDK' }
  ]},
  { name: 'Customer.io (deep)', category: 'Email', patterns: [
    { type: 'js_content', regex: /customer\.io|customerio-/i, via: 'Customer.io JS SDK' }
  ]},
  { name: 'Braze (deep)', category: 'Email', patterns: [
    { type: 'js_content', regex: /braze\.com|braze\.js|appboy/i, via: 'Braze JS SDK' }
  ]},
  { name: 'OneSignal', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /onesignal\.com|onesignal-/i, via: 'OneSignal push notifications' },
    { type: 'js_content', regex: /onesignal\.com|OneSignal|iZ0e-/i, via: 'OneSignal JS SDK' }
  ]},
  { name: 'Pusher', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /pusher\.com|pusher-/i, via: 'Pusher real-time' },
    { type: 'js_content', regex: /pusher\.com|Pusher\(|pusher\.js/i, via: 'Pusher JS SDK' }
  ]},
  { name: 'Ably', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /ably\.com|ably-/i, via: 'Ably real-time messaging' },
    { type: 'js_content', regex: /ably\.com|Ably\(|ably\.js/i, via: 'Ably JS SDK' }
  ]},
  { name: 'Stream', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /getstream\.io|stream-/i, via: 'Stream activity feeds' }
  ]},
  { name: 'Liveblocks', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /liveblocks\.io|liveblocks-/i, via: 'Liveblocks real-time collaboration' },
    { type: 'browser_network', regex: /liveblocks\.io|liveblocks-/i, via: 'Liveblocks network' }
  ]},
  { name: 'PartyKit', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /partykit\.io|partykit-/i, via: 'PartyKit edge computing' }
  ]},
  { name: 'Val Town', category: 'Infrastructure', patterns: [
    { type: 'html', regex: /val\.town|valtown-/i, via: 'Val Town serverless' }
  ]},

  // ── Monitoring, Logging, Error Tracking, Observability ──
  { name: 'Datadog (deep)', category: 'Monitoring', patterns: [
    { type: 'browser_network', regex: /datadoghq\.com|browser-intake-datadoghq|dd-rum/i, via: 'Datadog RUM network' }
  ]},
  { name: 'Sentry (deep)', category: 'Monitoring', patterns: [
    { type: 'browser_network', regex: /sentry-cdn\.com|sentry\.io\/api|sentry-/i, via: 'Sentry error network' }
  ]},
  { name: 'New Relic (deep)', category: 'Monitoring', patterns: [
    { type: 'browser_network', regex: /newrelic\.com|nr-data\.net|newrelic-/i, via: 'New Relic network' }
  ]},
  { name: 'Bugsnag (deep)', category: 'Monitoring', patterns: [
    { type: 'browser_network', regex: /bugsnag\.com|bugsnag-/i, via: 'Bugsnag error network' }
  ]},
  { name: 'LogRocket (deep)', category: 'Monitoring', patterns: [
    { type: 'browser_network', regex: /logrocket\.com|logrocket-/i, via: 'LogRocket network' }
  ]},
  { name: 'Highlight.io (deep)', category: 'Monitoring', patterns: [
    { type: 'browser_network', regex: /highlight\.run|highlightio|highlight-/i, via: 'Highlight.io network' }
  ]},
  { name: 'Rollbar (deep)', category: 'Monitoring', patterns: [
    { type: 'browser_network', regex: /rollbar\.com|rollbar-/i, via: 'Rollbar error network' }
  ]},
  { name: 'Dynatrace (deep)', category: 'Monitoring', patterns: [
    { type: 'browser_network', regex: /dynatrace\.com|dynatrace-/i, via: 'Dynatrace network' }
  ]},
  { name: 'Elastic APM', category: 'Monitoring', patterns: [
    { type: 'browser_network', regex: /elastic\.co\/apm|elastic-apm/i, via: 'Elastic APM network' }
  ]},
  { name: 'Grafana (deep)', category: 'Monitoring', patterns: [
    { type: 'browser_network', regex: /grafana\.com|grafana-/i, via: 'Grafana network' }
  ]},
  { name: 'PagerDuty (deep)', category: 'Monitoring', patterns: [
    { type: 'browser_network', regex: /pagerduty\.com|pagerduty-/i, via: 'PagerDuty network' }
  ]},
  { name: 'Instatus', category: 'Monitoring', patterns: [
    { type: 'html', regex: /instatus\.com|instatus-/i, via: 'Instatus status page' }
  ]},
  { name: 'BetterStack (deep)', category: 'Monitoring', patterns: [
    { type: 'browser_network', regex: /betterstack\.com|betterstack-/i, via: 'BetterStack network' }
  ]},
  { name: 'Checkly (deep)', category: 'Monitoring', patterns: [
    { type: 'browser_network', regex: /checkly\.com|checkly-/i, via: 'Checkly network' }
  ]},
  { name: 'Cronitor', category: 'Monitoring', patterns: [
    { type: 'html', regex: /cronitor\.io|cronitor-/i, via: 'Cronitor monitoring' }
  ]},
  { name: 'Pingdom (deep)', category: 'Monitoring', patterns: [
    { type: 'browser_network', regex: /pingdom\.com|pingdom-/i, via: 'Pingdom monitoring' }
  ]},
  { name: 'Assertible', category: 'Monitoring', patterns: [
    { type: 'html', regex: /assertible\.com|assertible-/i, via: 'Assertible monitoring' }
  ]},
  { name: 'Gatus', category: 'Monitoring', patterns: [
    { type: 'html', regex: /gatus\.io|gatus-/i, via: 'Gatus health dashboard' }
  ]},
  { name: 'Upptime', category: 'Monitoring', patterns: [
    { type: 'html', regex: /upptime\.js\.org|upptime-/i, via: 'Upptime uptime monitor' }
  ]},
  { name: 'Squidside Uptime', category: 'Monitoring', patterns: [
    { type: 'html', regex: /squidside|uptime-/i, via: 'Squidside uptime monitor' }
  ]},
  { name: 'Squadcast (deep)', category: 'Monitoring', patterns: [
    { type: 'html', regex: /squadcast\.com|squadcast-/i, via: 'Squadcast incident management' }
  ]},
  { name: 'Opsgenie', category: 'Monitoring', patterns: [
    { type: 'html', regex: /opsgenie\.com|opsgenie-/i, via: 'Opsgenie incident management' }
  ]},
  { name: 'Grafana OnCall', category: 'Monitoring', patterns: [
    { type: 'html', regex: /grafana\.com\/products\/oncall|grafana-oncall/i, via: 'Grafana OnCall' }
  ]},

  // ── Frontend: More UI libraries, State management, Build tools ──
  { name: 'Framer (deep)', category: 'Animation', patterns: [
    { type: 'js_content', regex: /framer\.com|framer-motion|motion\.(div|span)|framer-/i, via: 'Framer Motion JS' }
  ]},
  { name: 'Lenis (deep)', category: 'JavaScript Library', patterns: [
    { type: 'js_content', regex: /lenis\.js|lenis\.min\.js|lenis\.lenis|lenis-/i, via: 'Lenis smooth scroll JS' }
  ]},
  { name: 'Swiper (deep)', category: 'JavaScript Library', patterns: [
    { type: 'js_content', regex: /swiper\.com|swiper\.js|swiper\.min|Swiper\(/i, via: 'Swiper carousel JS' }
  ]},
  { name: 'Embla (deep)', category: 'JavaScript Library', patterns: [
    { type: 'js_content', regex: /embla-carousel|embla\.js|EmblaCarousel/i, via: 'Embla carousel JS' }
  ]},
  { name: 'Splide (deep)', category: 'JavaScript Library', patterns: [
    { type: 'js_content', regex: /splide\.js|Splide|splide-/i, via: 'Splide carousel JS' }
  ]},
  { name: 'Three.js (deep)', category: 'JavaScript Graphics', patterns: [
    { type: 'js_content', regex: /three\.js|three\.min|THREE\.|threejs|three-/i, via: 'Three.js 3D JS' }
  ]},
  { name: 'PixiJS (deep)', category: 'JavaScript Graphics', patterns: [
    { type: 'js_content', regex: /pixi\.js|pixi\.min|PIXI\.|pixijs/i, via: 'PixiJS 2D WebGL JS' }
  ]},
  { name: 'ApexCharts (deep)', category: 'Charts / Data Visualization', patterns: [
    { type: 'js_content', regex: /apexcharts\.com|apexcharts\.js|ApexCharts/i, via: 'ApexCharts JS' }
  ]},
  { name: 'Highcharts (deep)', category: 'Charts / Data Visualization', patterns: [
    { type: 'js_content', regex: /highcharts\.com|Highcharts\.chart|highcharts\.js/i, via: 'Highcharts JS' }
  ]},
  { name: 'Plotly (deep)', category: 'Charts / Data Visualization', patterns: [
    { type: 'js_content', regex: /plotly\.com|plotly\.js|Plotly\.newPlot/i, via: 'Plotly JS' }
  ]},
  { name: 'ECharts (deep)', category: 'Charts / Data Visualization', patterns: [
    { type: 'js_content', regex: /echarts\.com|echarts\.js|echarts\.init/i, via: 'Apache ECharts JS' }
  ]},
  { name: 'Leaflet (deep)', category: 'Maps', patterns: [
    { type: 'js_content', regex: /leaflet\.js|leaflet\.com|L\.map|leaflet-/i, via: 'Leaflet maps JS' }
  ]},
  { name: 'Mapbox GL (deep)', category: 'Maps', patterns: [
    { type: 'js_content', regex: /mapbox\.com|mapboxgl\.|MapboxGL/i, via: 'Mapbox GL maps JS' }
  ]},
  { name: 'Google Maps (deep)', category: 'Maps', patterns: [
    { type: 'js_content', regex: /google\.maps|googleapis\.com\/maps|google-maps/i, via: 'Google Maps JS' }
  ]},
  { name: 'CKEditor (deep)', category: 'Rich Text Editor', patterns: [
    { type: 'js_content', regex: /ckeditor\.com|CKEDITOR\.|ckeditor-/i, via: 'CKEditor JS' }
  ]},
  { name: 'TinyMCE (deep)', category: 'Rich Text Editor', patterns: [
    { type: 'js_content', regex: /tinymce\.com|tinymce\.js|tinymce-/i, via: 'TinyMCE JS' }
  ]},
  { name: 'Quill (deep)', category: 'Rich Text Editor', patterns: [
    { type: 'js_content', regex: /quill\.js|quill\.com|quill-/i, via: 'Quill editor JS' }
  ]},
  { name: 'ProseMirror (deep)', category: 'Rich Text Editor', patterns: [
    { type: 'js_content', regex: /prosemirror\.net|prosemirror-/i, via: 'ProseMirror editor JS' }
  ]},
  { name: 'TipTap (deep)', category: 'Rich Text Editor', patterns: [
    { type: 'js_content', regex: /tiptap\.dev|tiptap-/i, via: 'TipTap editor JS' }
  ]},
  { name: 'Slate (deep)', category: 'Rich Text Editor', patterns: [
    { type: 'js_content', regex: /slatejs\.org|slate-react|slate-/i, via: 'Slate editor JS' }
  ]},
  { name: 'Disqus (deep)', category: 'Comment Systems', patterns: [
    { type: 'js_content', regex: /disqus\.com|disqus\.js|disqus-/i, via: 'Disqus comments JS' }
  ]},
  { name: 'Commento (deep)', category: 'Comment Systems', patterns: [
    { type: 'js_content', regex: /commento\.io|commento\.js|commento-/i, via: 'Commento comments JS' }
  ]},
  { name: 'Giscus (deep)', category: 'Comment Systems', patterns: [
    { type: 'js_content', regex: /giscus\.app|giscus\.js|giscus-/i, via: 'Giscus comments JS' }
  ]},
  { name: 'Twikoo (deep)', category: 'Comment Systems', patterns: [
    { type: 'js_content', regex: /twikoo\.js|twikoo\.ru|twikoo-/i, via: 'Twikoo comments JS' }
  ]},
  { name: 'Waline (deep)', category: 'Comment Systems', patterns: [
    { type: 'js_content', regex: /waline\.js|@waline|waline-/i, via: 'Waline comments JS' }
  ]},
  { name: 'Artalk (deep)', category: 'Comment Systems', patterns: [
    { type: 'js_content', regex: /artalk\.js|@artalk|artalk-/i, via: 'Artalk comments JS' }
  ]},
  { name: 'Utterances', category: 'Comment Systems', patterns: [
    { type: 'html', regex: /utteranc\.es|utterances-/i, via: 'Utterances GitHub comments' }
  ]},
  { name: 'Cusdis (deep)', category: 'Comment Systems', patterns: [
    { type: 'js_content', regex: /cusdis\.js|cusdis\.com|cusdis-/i, via: 'Cusdis comments JS' }
  ]},
  { name: 'Isso', category: 'Comment Systems', patterns: [
    { type: 'html', regex: /isso\.js|isso-/i, via: 'Isso comments' }
  ]},
  { name: 'Remark42', category: 'Comment Systems', patterns: [
    { type: 'html', regex: /remark42\.com|remark42-/i, via: 'Remark42 comments' }
  ]},
  { name: 'Talkyard', category: 'Comment Systems', patterns: [
    { type: 'html', regex: /talkyard\.io|talkyard-/i, via: 'Talkyard comments' }
  ]},
  { name: 'GraphComment', category: 'Comment Systems', patterns: [
    { type: 'html', regex: /graphcomment\.com|graphcomment-/i, via: 'GraphComment comments' }
  ]},
  { name: 'SpotIM (OpenWeb)', category: 'Comment Systems', patterns: [
    { type: 'html', regex: /spot\.im|spotim-/i, via: 'SpotIM comments' }
  ]},
  { name: 'Muut', category: 'Comment Systems', patterns: [
    { type: 'html', regex: /muut\.com|muut-/i, via: 'Muut comments & forum' }
  ]},


];

const CATEGORY_TYPES = {
  'Frontend Framework': 'frontend',
  'JavaScript Library': 'frontend',
  'Analytics': 'frontend',
  'Customer Support': 'frontend',
  'Marketing': 'frontend',
  'Page Builder': 'frontend',
  'Cookie Consent': 'frontend',
  'Mobile Framework': 'frontend',
  'CSS Framework': 'frontend',
  'Advertising': 'frontend',
  'Font Scripts': 'frontend',
  'Video Players': 'frontend',
  'Comment Systems': 'frontend',
  'Charts / Data Visualization': 'frontend',
  'Image CDN': 'frontend',
  'Animation': 'frontend',
  'Maps': 'frontend',
  'Rich Text Editor': 'frontend',
  'Blog / Publishing': 'frontend',
  'Project Management': 'frontend',
  'Social Feeds': 'frontend',
  'Design Tools': 'frontend',
  'JavaScript Graphics': 'frontend',
  'Podcasting': 'frontend',
  'CMS': 'backend',
  'Backend Framework': 'backend',
  'Platform / Language': 'backend',
  'Authentication': 'backend',
  'E-Commerce': 'backend',
  'Payment Processor': 'backend',
  'Database': 'backend',
  'API Protocol': 'backend',
  'Testing': 'backend',
  'Email': 'backend',
  'Search': 'backend',
  'Forums / Community': 'backend',
  'LMS / Education': 'backend',
  'Documentation': 'backend',
  'Business Tools': 'backend',
  'Webmail': 'backend',
  'Captcha': 'backend',
  'Developer Tools': 'backend',
  'Package Manager': 'infra',
  'VCS / Git Hosting': 'infra',
  'CI/CD': 'infra',
  'Container / Orchestration': 'infra',
  'Web Server': 'infra',
  'CDN / Hosting': 'infra',
  'Cloud Platform': 'infra',
  'Security': 'infra',
  'Monitoring': 'infra',
  'Operating System': 'infra',
  'SSL / TLS': 'infra',
  'Cache Tools': 'infra',
  'Infrastructure': 'infra',
};

function normalizeUrl(input) {
  let url = input.trim();
  if (!url) throw new Error('URL is required');
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid URL — could not parse');
  }
  if (!parsed.hostname.includes('.') || !/\.[a-z]{2,}$/i.test(parsed.hostname)) {
    url = 'https://' + input.trim() + '.com';
    try {
      parsed = new URL(url);
    } catch {
      throw new Error('Please enter a valid domain (e.g. example.com)');
    }
  }
  return parsed.href;
}

function extractCompanyInfo($, headers) {
  const info = {
    name: null,
    description: null,
    logo: null,
    socialLinks: [],
    email: null,
    phone: null,
    address: null,
    foundingDate: null,
    employeeCount: null,
    industry: null,
    linkedIn: null,
    twitter: null,
    github: null,
    facebook: null,
    youtube: null,
    instagram: null,
  };

  // ── JSON-LD ──
  const jsonldScripts = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html());
      jsonldScripts.push(parsed);
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => jsonldScripts.push(item));
      }
    } catch {}
  });

  const org = jsonldScripts.find((s) => s['@type'] === 'Organization' || s['@type'] === 'Corporation');
  const site = jsonldScripts.find((s) => s['@type'] === 'WebSite');
  const localBiz = jsonldScripts.find((s) => s['@type'] === 'LocalBusiness');
  const primary = org || localBiz || site;

  if (primary) {
    if (!info.name) info.name = primary.name || null;
    if (!info.description) info.description = primary.description || null;
    if (!info.logo) {
      const logo = primary.logo;
      if (typeof logo === 'string') info.logo = logo;
      else if (logo && logo.url) info.logo = logo.url;
    }
    if (primary.sameAs && Array.isArray(primary.sameAs)) {
      for (const url of primary.sameAs) {
        classifySocialLink(info, url);
      }
    }
    if (primary.foundingDate) info.foundingDate = primary.foundingDate;
    if (primary.numberOfEmployees) {
      info.employeeCount = typeof primary.numberOfEmployees === 'object' ? primary.numberOfEmployees.value : primary.numberOfEmployees;
    }
    if (primary.contactPoint) {
      const cp = Array.isArray(primary.contactPoint) ? primary.contactPoint[0] : primary.contactPoint;
      if (cp.email) info.email = cp.email;
      if (cp.telephone) info.phone = cp.telephone;
    }
    if (primary.address) {
      const addr = typeof primary.address === 'object' ? primary.address : null;
      if (addr) {
        info.address = [addr.streetAddress, addr.addressLocality, addr.addressRegion, addr.postalCode, addr.addressCountry].filter(Boolean).join(', ');
      }
    }
  }

  // ── OG / meta tags ──
  if (!info.name) info.name = $('meta[property="og:site_name"]').attr('content') || $('meta[name="application-name"]').attr('content') || null;
  if (!info.description) info.description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || null;
  if (!info.logo) info.logo = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || null;

  // ── Social from meta ──
  const twitterSite = $('meta[name="twitter:site"]').attr('content');
  if (twitterSite && twitterSite !== '@') {
    const handle = twitterSite.replace('@', '');
    if (!info.twitter) info.twitter = `https://twitter.com/${handle}`;
  }

  // ── Social from anchor links ──
  const seenUrls = new Set(Object.values(info).filter(Boolean));
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href || seenUrls.has(href)) return;
    classifySocialLink(info, href);
    seenUrls.add(href);
  });

  // ── Email from mailto ──
  if (!info.email) {
    $('a[href^="mailto:"]').each((_, el) => {
      const mailto = $(el).attr('href').replace('mailto:', '').split('?')[0].trim();
      if (mailto && !info.email) info.email = mailto;
    });
  }

  // ── Phone from tel ──
  if (!info.phone) {
    $('a[href^="tel:"]').each((_, el) => {
      if (!info.phone) info.phone = $(el).attr('href').replace('tel:', '');
    });
  }

  // ── Clean up: remove null/empty ──
  for (const key of Object.keys(info)) {
    if (info[key] === null || info[key] === undefined || (Array.isArray(info[key]) && info[key].length === 0)) {
      if (Array.isArray(info[key])) info[key] = [];
      else info[key] = null;
    }
  }

  info.socialLinks = [info.twitter, info.github, info.linkedIn, info.facebook, info.youtube, info.instagram].filter(Boolean);

  return info;
}

function classifySocialLink(info, url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace('www.', '').toLowerCase();
    if (host === 'twitter.com' || host === 'x.com') info.twitter = url;
    else if (host === 'github.com') info.github = url;
    else if (host === 'linkedin.com') info.linkedIn = url;
    else if (host === 'facebook.com') info.facebook = url;
    else if (host === 'youtube.com' || host === 'youtu.be') info.youtube = url;
    else if (host === 'instagram.com') info.instagram = url;
  } catch {}
}

function extractPageMetadata($, headers, html) {
  const lang = $('html').attr('lang') || null;
  const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || null;
  const viewport = $('meta[name="viewport"]').attr('content') || null;
  const canonical = $('link[rel="canonical"]').attr('href') || null;
  const robots = $('meta[name="robots"]').attr('content') || $('meta[name="robots"]').attr('content') || null;
  const author = $('meta[name="author"]').attr('content') || null;
  const themeColor = $('meta[name="theme-color"]').attr('content') || null;
  const contentType = headers['content-type'] || null;
  const contentLength = headers['content-length'] ? parseInt(headers['content-length'], 10) : html ? new TextEncoder().encode(html).length : null;

  const hreflangs = [];
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const hreflang = $(el).attr('hreflang');
    const href = $(el).attr('href');
    if (hreflang && href) hreflangs.push({ hreflang, href });
  });

  return {
    lang,
    charset,
    viewport,
    canonical,
    robots,
    author,
    themeColor,
    contentType,
    contentLength,
    hreflangs: hreflangs.length > 0 ? hreflangs : null,
  };
}

function extractSeoAnalysis($, headers, html, pageTitle, generator) {
  const title = pageTitle || '';
  const description = $('meta[name="description"]').attr('content') || '';
  const ogTitle = $('meta[property="og:title"]').attr('content') || null;
  const ogDesc = $('meta[property="og:description"]').attr('content') || null;
  const ogImage = $('meta[property="og:image"]').attr('content') || null;
  const ogType = $('meta[property="og:type"]').attr('content') || null;
  const twitterCard = $('meta[name="twitter:card"]').attr('content') || null;
  const twitterSite = $('meta[name="twitter:site"]').attr('content') || null;
  const twitterImage = $('meta[name="twitter:image"]').attr('content') || null;
  const canonical = $('link[rel="canonical"]').attr('href') || null;
  const robots = $('meta[name="robots"]').attr('content') || null;
  const hreflangs = [];
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const h = $(el).attr('hreflang');
    const href = $(el).attr('href');
    if (h && href) hreflangs.push(h);
  });

  // Title analysis
  const titleLength = title.length;
  const titleHasBrand = title.includes('|') || title.includes('—') || title.includes('–') || title.includes('-');
  const titleTooShort = titleLength > 0 && titleLength < 30;
  const titleTooLong = titleLength > 70;
  const titleOk = titleLength >= 30 && titleLength <= 70;

  // Description analysis
  const descLength = description.length;
  const descOk = descLength >= 120 && descLength <= 160;
  const descTooShort = descLength > 0 && descLength < 120;
  const descTooLong = descLength > 160;
  const descMissing = !description;

  // Headings
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;
  const missingH1 = h1Count === 0;
  const multipleH1 = h1Count > 1;

  // Images
  const totalImages = $('img').length;
  const missingAlt = $('img:not([alt])').length + $('img[alt=""]').length;

  // Links
  const totalLinks = $('a[href]').length;
  const internalLinks = $('a[href^="/"], a[href^="' + ($('base').attr('href') || '') + '"]').length;
  const externalLinks = totalLinks - internalLinks;

  // Structured data
  const jsonldTypes = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const d = JSON.parse($(el).html());
      const items = Array.isArray(d) ? d : [d];
      items.forEach((item) => {
        if (item['@type']) jsonldTypes.push(item['@type']);
      });
    } catch {}
  });

  // Resource hints
  const resourceHints = [];
  $('link[rel="preconnect"]').each(() => resourceHints.push('preconnect'));
  $('link[rel="preload"]').each(() => resourceHints.push('preload'));
  $('link[rel="prefetch"]').each(() => resourceHints.push('prefetch'));
  $('link[rel="dns-prefetch"]').each(() => resourceHints.push('dns-prefetch'));

  // HTTPS check
  const isHttp = headers[':scheme'] === 'http' || headers['x-forwarded-proto'] === 'http' || false;

  // Compression
  const contentEncoding = headers['content-encoding'] || null;

  // Compute score
  let score = 100;
  const checks = [];

  if (missingH1) { score -= 10; checks.push('no-h1'); }
  if (multipleH1) { score -= 5; checks.push('multiple-h1'); }
  if (titleTooShort) { score -= 8; checks.push('title-short'); }
  if (titleTooLong) { score -= 5; checks.push('title-long'); }
  if (!titleHasBrand) { score -= 3; checks.push('title-no-brand'); }
  if (title.length === 0) { score -= 15; checks.push('title-missing'); }
  if (descMissing) { score -= 10; checks.push('desc-missing'); }
  if (descTooShort) { score -= 5; checks.push('desc-short'); }
  if (descTooLong) { score -= 3; checks.push('desc-long'); }
  if (missingAlt > 0) { score -= Math.min(missingAlt * 2, 10); checks.push('missing-alt'); }
  if (!ogTitle) { score -= 4; checks.push('no-og-title'); }
  if (!ogDesc) { score -= 3; checks.push('no-og-desc'); }
  if (!ogImage) { score -= 3; checks.push('no-og-image'); }
  if (!canonical && hreflangs.length === 0) { score -= 3; checks.push('no-canonical'); }
  if (jsonldTypes.length === 0) { score -= 5; checks.push('no-structured-data'); }
  if (hreflangs.length === 0 && $('html').attr('lang')) { /* optional, no penalty */ }
  if (robots && robots.includes('noindex')) { score -= 20; checks.push('noindex'); }
  if (totalImages > 0 && missingAlt === totalImages) { score -= 3; checks.push('all-images-no-alt'); }
  if (resourceHints.length === 0) { score -= 2; checks.push('no-resource-hints'); }

  // score floor / ceiling (unlikely to exceed but safe)
  score = Math.max(0, Math.min(100, score));

  // Grade
  let grade = 'A';
  if (score < 90) grade = 'B';
  if (score < 75) grade = 'C';
  if (score < 55) grade = 'D';
  if (score < 35) grade = 'F';

  const gradeColors = { A: 'text-accent', B: 'text-emerald-300', C: 'text-amber-300', D: 'text-orange-300', F: 'text-red-300' };

  return {
    score,
    grade,
    gradeColor: gradeColors[grade] || 'text-accent',
    checks,
    title: {
      text: title || null,
      length: titleLength,
      status: title.length === 0 ? 'missing' : titleOk ? 'good' : titleTooShort ? 'short' : 'long',
    },
    description: {
      text: description || null,
      length: descLength,
      status: descMissing ? 'missing' : descOk ? 'good' : descTooShort ? 'short' : 'long',
    },
    headings: {
      h1: h1Count,
      h2: h2Count,
      h3: h3Count,
      status: missingH1 ? 'missing' : multipleH1 ? 'multiple' : 'good',
    },
    images: {
      total: totalImages,
      missingAlt,
      coverage: totalImages > 0 ? Math.round(((totalImages - missingAlt) / totalImages) * 100) : null,
    },
    links: { total: totalLinks, internal: internalLinks, external: externalLinks },
    openGraph: { title: ogTitle, description: ogDesc, image: ogImage, type: ogType },
    twitterCard: { card: twitterCard, site: twitterSite, image: twitterImage },
    structuredData: jsonldTypes.length > 0 ? jsonldTypes : null,
    resourceHints: resourceHints.length > 0 ? [...new Set(resourceHints)] : null,
    canonical,
    robots,
    hreflangs: hreflangs.length > 0 ? hreflangs : null,
    compression: contentEncoding,
  };
}

function extractPerformance(headers) {
  return {
    compression: headers['content-encoding'] || null,
    cacheControl: headers['cache-control'] || null,
    keepAlive: headers['connection'] || headers['keep-alive'] || null,
    httpVersion: headers['cf-http2'] ? 'HTTP/2' : headers['alt-svc'] ? 'HTTP/2 (+ HTTP/3 via alt-svc)' : headers[':scheme'] === 'h2' ? 'HTTP/2' : null,
    isHttps: headers['strict-transport-security'] ? true : null,
    altSvc: headers['alt-svc'] || null,
    via: headers['via'] || null,
  };
}

function extractSecurity(headers) {
  const parsePolicy = (val) => {
    if (!val) return null;
    return val.split(';').map((d) => d.trim()).filter(Boolean);
  };
  return {
    contentSecurityPolicy: headers['content-security-policy'] || headers['content-security-policy-report-only'] || null,
    strictTransportSecurity: headers['strict-transport-security'] || null,
    xFrameOptions: headers['x-frame-options'] || null,
    xContentTypeOptions: headers['x-content-type-options'] || null,
    referrerPolicy: headers['referrer-policy'] || null,
    permissionsPolicy: headers['permissions-policy'] || headers['feature-policy'] || null,
    xssProtection: headers['x-xss-protection'] || null,
    cors: headers['access-control-allow-origin'] ? {
      allowOrigin: headers['access-control-allow-origin'],
      allowMethods: headers['access-control-allow-methods'] || null,
      allowHeaders: headers['access-control-allow-headers'] || null,
    } : null,
  };
}

export async function detectTechnologies(rawInput, opts = {}) {
  const { timeout = 25000, headers: customHeaders = null, cookies: customCookies = null } = opts;
  const finalUrl = normalizeUrl(rawInput);
  const parsedUrl = new URL(finalUrl);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let response;
  try {
    const fetchHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
    };
    if (customHeaders) Object.assign(fetchHeaders, customHeaders);
    if (customCookies) fetchHeaders.Cookie = customCookies;

    response = await fetch(finalUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: fetchHeaders,
    });
    clearTimeout(timeoutId);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out — the site took too long to respond (${timeout}ms limit).`);
    }
    throw new Error(`Could not reach ${parsedUrl.hostname} — ${err.message || 'network error'}`);
  }

  if (!response.ok && response.status >= 400 && response.status < 500) {
    if (response.status === 404) {
      throw new Error(`Site returned 404 — ${parsedUrl.hostname} was not found.`);
    }
  }

  const headers = {};
  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  const title =
    $('title').first().text().trim() ||
    $('meta[property="og:title"]').attr('content')?.trim() ||
    parsedUrl.hostname;

  const generator = $('meta[name="generator"]').attr('content') || '';

  const scriptSrcs = [];
  $('script[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src) scriptSrcs.push(src);
  });

  const linkHrefs = [];
  $('link[href]').each((_, el) => {
    linkHrefs.push($(el).attr('href'));
  });

  const allMetaContent = $('meta')
    .map((_, el) => $(el).attr('content') || '')
    .get()
    .join(' ');

  const cssClasses = $('*')
    .map((_, el) => $(el).attr('class') || '')
    .get()
    .join(' ');

  const cookies = headers['set-cookie'] || '';

  const htmlCorpus = [
    html,
    allMetaContent,
    cssClasses,
  ].join('\n');

  // ── Deep scan: fetch CSS/JS resources and probe paths ──
  let cssContent = '';
  let jsContent = '';
  let pathProbesText = '';
  let browserData = null;

  try {
    const assets = await fetchCssJsResources($, parsedUrl.origin);
    cssContent = assets.cssContent;
    jsContent = assets.jsContent;
  } catch {}

  try {
    const probes = await probePaths(parsedUrl.origin);
    pathProbesText = buildPathProbesSummary(probes);
  } catch {}

  // ── Browser-based scan (fallback for thin HTML) ──
  const domSize = $('*').length;
  if (domSize < 50) {
    try {
      browserData = await browserScan(finalUrl, 15000);
    } catch {}
  }

  const deepCorpus = [
    cssContent,
    jsContent,
    pathProbesText,
    browserData ? browserData.html : '',
    browserData ? browserData.globalVars.join(' ') : '',
    browserData ? Object.keys(browserData.localStorage).join(' ') : '',
    browserData ? browserData.networkRequests.map((r) => r.url).join(' ') : '',
    browserData ? browserData.cssClasses : '',
  ].join('\n');

  function confidenceFor(pattern) {
  if (pattern.confidence) return pattern.confidence;
  const specific = ['meta_generator', 'header', 'script_src', 'css_class', 'link_tag', 'css_content', 'js_content', 'path_probe', 'browser', 'browser_var', 'browser_network', 'browser_cookie'];
  return specific.includes(pattern.type) ? 'high' : 'medium';
}

function extractVersion(rule, corpus) {
  if (!rule.versionPattern) return null;
  const m = corpus.match(rule.versionPattern);
  return m && m[1] ? m[1] : null;
}

  const detected = [];

  for (const rule of RULES) {
    let matched = false;
    for (const pattern of rule.patterns) {
      try {
        let hit = false;
        if (pattern.type === 'meta_generator') {
          hit = pattern.regex.test(generator);
        } else if (pattern.type === 'html') {
          hit = pattern.regex.test(htmlCorpus) || pattern.regex.test(scriptSrcs.join(' ')) || pattern.regex.test(linkHrefs.join(' '));
        } else if (pattern.type === 'script_src') {
          hit = scriptSrcs.some((s) => pattern.regex.test(s));
        } else if (pattern.type === 'header') {
          const val = headers[pattern.key.toLowerCase()] || '';
          hit = pattern.regex.test(val);
        } else if (pattern.type === 'cookie') {
          hit = pattern.regex.test(cookies);
        } else if (pattern.type === 'css_class') {
          hit = pattern.regex.test(cssClasses);
        } else if (pattern.type === 'link_tag') {
          hit = linkHrefs.some((h) => pattern.regex.test(h));
        } else if (pattern.type === 'css_content') {
          hit = pattern.regex.test(cssContent);
        } else if (pattern.type === 'js_content') {
          hit = pattern.regex.test(jsContent);
        } else if (pattern.type === 'path_probe') {
          hit = pattern.regex.test(pathProbesText);
        } else if (pattern.type === 'browser') {
          hit = browserData && pattern.regex.test(browserData.html);
        } else if (pattern.type === 'browser_var') {
          hit = browserData && browserData.globalVars.some((v) => pattern.regex.test(v));
        } else if (pattern.type === 'browser_network') {
          hit = browserData && browserData.networkRequests.some((r) => pattern.regex.test(r.url));
        } else if (pattern.type === 'browser_cookie') {
          hit = browserData && pattern.regex.test(browserData.cookies);
        }
        if (hit) {
          detected.push({
            name: rule.name,
            category: rule.category,
            detectedVia: pattern.via,
            confidence: confidenceFor(pattern),
            version: extractVersion(rule, htmlCorpus),
          });
          matched = true;
          break;
        }
      } catch {}
    }
    if (matched) continue;
  }

  const categoryOrder = [
    'Frontend Framework',
    'CSS Framework',
    'JavaScript Library',
    'JavaScript Graphics',
    'Charts / Data Visualization',
    'Animation',
    'Font Scripts',
    'Video Players',
    'Maps',
    'Rich Text Editor',
    'Comment Systems',
    'Social Feeds',
    'Blog / Publishing',
    'Podcasting',
    'Mobile Framework',
    'Design Tools',
    'CMS',
    'Backend Framework',
    'Platform / Language',
    'Database',
    'Search',
    'API Protocol',
    'Authentication',
    'E-Commerce',
    'Payment Processor',
    'LMS / Education',
    'Forums / Community',
    'Documentation',
    'Project Management',
    'Business Tools',
    'Email',
    'Webmail',
    'Advertising',
    'Customer Support',
    'Marketing',
    'Page Builder',
    'Cookie Consent',
    'Captcha',
    'Developer Tools',
    'Security',
    'Web Server',
    'CDN / Hosting',
    'Cloud Platform',
    'Image CDN',
    'Container / Orchestration',
    'Cache Tools',
    'Operating System',
    'SSL / TLS',
    'Infrastructure',
    'Analytics',
    'Monitoring',
    'Testing',
    'Package Manager',
    'VCS / Git Hosting',
    'CI/CD',
  ];

  const categories = {};
  for (const tech of detected) {
    if (!categories[tech.category]) categories[tech.category] = [];
    categories[tech.category].push(tech);
  }

  const orderedCategories = categoryOrder
    .filter((c) => categories[c])
    .map((c) => ({ category: c, technologies: categories[c] }));

  const company = extractCompanyInfo($, headers);
  const pageMetadata = extractPageMetadata($, headers, html);
  const seo = extractSeoAnalysis($, headers, html, title, generator);
  const performance = extractPerformance(headers);
  const security = extractSecurity(headers);

  // Version extraction for matched techs
  for (const tech of detected) {
    const rule = RULES.find((r) => r.name === tech.name && r.versionPattern);
    if (rule && rule.versionPattern) {
      const sources = [htmlCorpus, generator, ...scriptSrcs, cssContent, jsContent, deepCorpus].join(' ');
      const m = sources.match(rule.versionPattern);
      if (m && m[1]) tech.version = m[1];
    }
    tech.type = CATEGORY_TYPES[tech.category] || 'frontend';
  }

  const techByType = { frontend: [], backend: [], infra: [] };
  for (const tech of detected) {
    const t = CATEGORY_TYPES[tech.category] || 'frontend';
    if (techByType[t]) techByType[t].push(tech);
  }

  return {
    site: {
      url: finalUrl,
      domain: parsedUrl.hostname,
      title,
      favicon: `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`,
      scannedAt: new Date().toISOString(),
      statusCode: response.status,
    },
    company,
    pageMetadata,
    seo,
    performance,
    security,
    technologies: detected,
    categories: orderedCategories,
    techByType,
    summary: {
      total: detected.length,
      categories: orderedCategories.length,
      frontend: techByType.frontend.length,
      backend: techByType.backend.length,
      infra: techByType.infra.length,
    },
    responseHeaders: {
      server: headers['server'] || null,
      poweredBy: headers['x-powered-by'] || null,
      generator: generator || null,
    },
  };
}
