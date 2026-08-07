// Content for catch-all marketing pages served by app/[...slug]/page.js.
// Each entry maps a slug to the PageShell props.

export const MARKETING_PAGES = {
  ecommerce: {
    eyebrow: 'Products',
    title: 'eCommerce Product Lists',
    lede: 'Find every online store running a specific platform, theme, or feature — then export the list and start outreach. Updated daily from a live crawl of the web.',
    bullets: [
      'Filter by platform, theme, country, and traffic band',
      'Export clean CSV or JSON with storefront metadata',
      'New stores and platform switches tracked every day',
    ],
  },
  keywords: {
    eyebrow: 'Products',
    title: 'Keyword Lists',
    lede: 'Build lists of sites that rank for the keywords that matter to your business, enrich them with the technology they run, and turn them into pipeline.',
    bullets: [
      'Search sites by keyword or phrase across the web',
      'Combine keyword matches with tech usage filters',
      'One-click export for CRM and outreach tools',
    ],
  },
  leads: {
    eyebrow: 'Products',
    title: 'LeadsEye',
    lede: 'Future customers for your product: sites that just adopted a technology, dropped a competitor, or started growing fast. Lead generation with the timing on your side.',
    bullets: [
      'Spot adoption and churn signals before rivals do',
      'Segment by technology, geography, and growth',
      'Export leads enriched with contactable context',
    ],
  },
  ask: {
    eyebrow: 'Products',
    title: 'TechStack Finder',
    lede: 'Ask questions about any site or market in plain English — which of my accounts run a vulnerable library, what is trending in eCommerce, who is on my competitor\'s stack. The data answers.',
    bullets: [
      'Natural-language queries over live technology data',
      'Answers with the exact sites and evidence behind them',
      'Save queries and re-run them on fresh data',
    ],
  },
  'future-customers': {
    eyebrow: 'Features',
    title: 'Future Customers',
    lede: 'Stop prospecting the same tired lists. Future Customers surfaces accounts that are about to switch, adopt, or scale — the people who need you right now.',
    bullets: [
      'Trigger-based alerts for adoption and switches',
      'Accounts scoring by fit and intent',
      'Build-a-list in seconds and export to your pipeline',
    ],
  },
  'cyber-risk': {
    eyebrow: 'Features',
    title: 'Cyber Risk Auditing',
    lede: 'A continuous view of the third-party technology running on your attack surface — what is out there, who owns it, and what is now a liability.',
    bullets: [
      'Automated asset discovery across domains and subdomains',
      'Outdated or end-of-life software flagged as it appears',
      'Board-ready reports on exposure and ownership',
    ],
  },
  'alternative-data': {
    eyebrow: 'Features',
    title: 'Alternative Data',
    lede: 'Usage signals no one else publishes. Adoption curves, churn, and growth across millions of sites — the non-financial data that moves investment and sales decisions.',
    bullets: [
      'Daily install, usage, and removal counts',
      'Trends broken down by category and geography',
      'CSV, JSON, and API delivery on any cadence',
    ],
  },
  coverage: {
    eyebrow: 'Features',
    title: 'Global Data Coverage',
    lede: '600M+ pages across 270 technology categories, re-crawled daily in 280+ countries. If it ships to the browser or the server, we fingerprint it.',
    bullets: [
      '1,870 hand-crafted rules plus 8,384 generated patterns',
      'HTML, JavaScript, headers, cookies, and path probes',
      'Worldwide coverage refreshed on a daily schedule',
    ],
  },
  customers: {
    eyebrow: 'Resources',
    title: 'Customers',
    lede: 'Sales, marketing, security, and research teams use TechStack Finder to understand the technology of the web and act on it.',
    bullets: [
      'Sales teams build targeted lists in minutes',
      'Security teams monitor their attack surface daily',
      'Analysts track adoption curves before they trend',
    ],
  },
  faq: {
    eyebrow: 'Resources',
    title: 'FAQ',
    lede: 'Answers to the questions we get most — about detection, data freshness, API access, and plans.',
    bullets: [
      'How fresh is the data? Every technology set is re-crawled daily.',
      'Do I need an account to scan? No — paste a URL and scan.',
      'How do I get API access? Any plan includes keys via the dashboard.',
    ],
  },
  blog: {
    eyebrow: 'Resources',
    title: 'Blog',
    lede: 'Notes on technology trends, tooling, and the data behind the web — written by the team that fingerprints it.',
    bullets: [
      'Deep dives into adoption trends across categories',
      'Detection engineering notes and rule releases',
      'Product updates and data-format documentation',
    ],
  },
  about: {
    eyebrow: 'Resources',
    title: 'About Us',
    lede: 'We map the technology that powers the internet. TechStack Finder started as a detection engine and grew into a market-intelligence platform.',
    bullets: [
      '10,000+ detection rules covering 270 categories',
      'Built for speed — scans resolve in seconds, not minutes',
      'Independent data, not vendor self-reporting',
    ],
  },
  contact: {
    eyebrow: 'Resources',
    title: 'Contact Us',
    lede: 'Talk to a human about plans, data licensing, or partnerships. We answer within one business day.',
    bullets: [
      'Sales: plans, datasets, and API licensing',
      'Support: detection gaps and account help',
      'Partnerships: affiliates, integrations, and data deals',
    ],
  },
  affiliates: {
    eyebrow: 'Resources',
    title: 'Affiliates',
    lede: 'Earn recurring commissions by referring teams to TechStack Finder. Real-time reporting, generous payouts, and a dedicated landing page for your audience.',
    bullets: [
      'Recurring revenue on every paying referral',
      'Real-time dashboard with payout history',
      'Marketing materials and unique referral links',
    ],
  },
  datasets: {
    eyebrow: 'API & AI Agents',
    title: 'Datasets',
    lede: 'Download-ready exports of technology usage, adoption, and market share — delivered on a schedule you control.',
    bullets: [
      'Technology usage by site, category, and geography',
      'Adoption curves and market-share snapshots',
      'Full or delta exports via API or object storage',
    ],
  },
  'ai-agents': {
    eyebrow: 'API & AI Agents',
    title: 'TechStackFinder + AI',
    lede: 'Connect your AI agents and applications to live technology data. Ask, augment, and automate over the stack of any site.',
    bullets: [
      'REST API with granular key scoping',
      'Structured responses designed for agent consumption',
      'Rate tiers from hobby to enterprise throughput',
    ],
  },
  extensions: {
    eyebrow: 'API & AI Agents',
    title: 'Browser Extensions',
    lede: 'See the stack of any site instantly, right from the browser. No new tab, no copy-paste — the technology is on the page.',
    bullets: [
      'One-click scan from the toolbar',
      'Frameworks, analytics, hosting, and CMS at a glance',
      'Available for Chrome, Edge, and Firefox',
    ],
  },
  integrations: {
    eyebrow: 'API & AI Agents',
    title: 'CRM Integrations',
    lede: 'Push technology-enriched leads straight into your pipeline. Native integrations keep Salesforce, HubSpot, and your sales stack in sync.',
    bullets: [
      'Two-way sync for accounts and custom fields',
      'Automated list-to-CRM workflows',
      'Webhooks for anything your stack connects to',
    ],
  },
};
