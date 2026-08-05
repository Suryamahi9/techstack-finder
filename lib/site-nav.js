// Site-wide navigation (BuiltWith-style mega menus).
// Top-level entries are either plain links (`href`) or dropdowns with a
// `panel`: 'mega' (multi-column grid) or 'list' (single column).

export const NAV = [
  {
    key: 'products',
    label: 'Products',
    panel: 'mega',
    columns: [
      {
        heading: 'Lookup & Trends',
        items: [
          { label: 'Technology Lookup', href: '/browse', desc: 'See the full stack behind any website' },
          { label: 'Technology Trends', href: '/trends', desc: 'Adoption, rise, and fall of technologies' },
          { label: 'Top Sites', href: '/leaderboard', desc: 'Sites ranked by usage and reach' },
        ],
      },
      {
        heading: 'Lists',
        items: [
          { label: 'eCommerce Product Lists', href: '/ecommerce', desc: 'Every store using a platform or theme' },
          { label: 'Keyword Lists', href: '/keywords', desc: 'Build lists from the keywords that matter' },
          { label: 'LeadsEye', href: '/leads', desc: 'Find future customers before rivals do' },
        ],
      },
      {
        heading: 'AI & Data',
        items: [
          { label: 'BuiltWith Ask', href: '/ask', desc: 'Ask market questions in plain English' },
          { label: 'API & AI Agents', href: '/ai-agents', desc: 'Programmatic access for your tools' },
          { label: 'Datasets', href: '/datasets', desc: 'Download-ready usage and market share' },
        ],
      },
    ],
  },
  {
    key: 'features',
    label: 'Features',
    panel: 'list',
    items: [
      { label: 'Lead Generation', href: '/lead-generation' },
      { label: 'Market Analysis', href: '/market-analysis' },
      { label: 'Sales Intelligence', href: '/sales-intelligence' },
      { label: 'Future Customers', href: '/future-customers' },
      { label: 'Cyber Risk Auditing', href: '/cyber-risk' },
      { label: 'Alternative Data', href: '/alternative-data' },
      { label: 'Report Filtering', href: '/report-filtering' },
      { label: 'Global Data Coverage', href: '/coverage' },
      { label: 'All Features · Use Cases', href: '/browse' },
      { label: 'Screencast Demo', href: '/screencast' },
    ],
  },
  {
    key: 'resources',
    label: 'Resources',
    panel: 'list',
    items: [
      { label: 'Knowledge Base', href: '/docs' },
      { label: 'Exportable Fields', href: '/exportable-fields' },
      { label: 'Screencast', href: '/screencast' },
      { label: 'Customers', href: '/customers' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Blog', href: '/blog' },
      { label: 'About Us', href: '/about' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Affiliates', href: '/affiliates' },
    ],
  },
  {
    key: 'api',
    label: 'API & AI Agents',
    panel: 'list',
    items: [
      { label: 'Datasets', href: '/datasets' },
      { label: 'TechStackFinder + AI', href: '/ai-agents' },
      { label: 'Browser Extensions', href: '/extensions' },
      { label: 'CRM Integrations', href: '/integrations' },
    ],
  },
  {
    key: 'pricing',
    label: 'Plans & Pricing',
    href: '/pricing',
  },
];

export const FLAT_NAV_LINKS = NAV.reduce((acc, item) => {
  if (item.href) acc.push(item);
  else if (item.panel === 'mega') item.columns.forEach((c) => acc.push(...c.items));
  else acc.push(...item.items);
  return acc;
}, []);
