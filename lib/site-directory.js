// Curated directory of real sites used by the product-list tools
// (eCommerce Product Lists, Keyword Lists, LeadsEye, Future Customers, Ask).
// Each site is tagged with technology names that match browse-data / market-share.

export const SITE_DIRECTORY = [
  // ── E-Commerce (Shopify) ──
  { domain: 'allbirds.com', url: 'https://allbirds.com', category: 'E-Commerce', tags: ['Shopify'], desc: 'Sustainable footwear store' },
  { domain: 'gymshark.com', url: 'https://gymshark.com', category: 'E-Commerce', tags: ['Shopify'], desc: 'Athletic apparel store' },
  { domain: 'fashionnova.com', url: 'https://fashionnova.com', category: 'E-Commerce', tags: ['Shopify'], desc: 'Fast-fashion store' },
  { domain: 'skims.com', url: 'https://skims.com', category: 'E-Commerce', tags: ['Shopify'], desc: 'Shapewear and apparel' },
  { domain: 'colourpop.com', url: 'https://colourpop.com', category: 'E-Commerce', tags: ['Shopify'], desc: 'Cosmetics store' },
  { domain: 'kyliecosmetics.com', url: 'https://kyliecosmetics.com', category: 'E-Commerce', tags: ['Shopify'], desc: 'Cosmetics store' },

  // ── E-Commerce (Adobe Commerce / Magento) ──
  { domain: 'nordstrom.com', url: 'https://nordstrom.com', category: 'E-Commerce', tags: ['Magento'], desc: 'Department store' },
  { domain: 'kiehls.com', url: 'https://kiehls.com', category: 'E-Commerce', tags: ['Magento'], desc: 'Skincare store' },
  { domain: 'coca-colastore.com', url: 'https://coca-colastore.com', category: 'E-Commerce', tags: ['Magento'], desc: 'Branded merchandise store' },

  // ── E-Commerce (custom / React) ──
  { domain: 'etsy.com', url: 'https://etsy.com', category: 'E-Commerce', tags: ['React'], desc: 'Marketplace for handmade goods' },
  { domain: 'wayfair.com', url: 'https://wayfair.com', category: 'E-Commerce', tags: ['React'], desc: 'Furniture store' },
  { domain: 'walmart.com', url: 'https://walmart.com', category: 'E-Commerce', tags: ['React'], desc: 'Retail marketplace' },
  { domain: 'asos.com', url: 'https://asos.com', category: 'E-Commerce', tags: ['React'], desc: 'Fashion marketplace' },

  // ── CMS (WordPress) ──
  { domain: 'techcrunch.com', url: 'https://techcrunch.com', category: 'CMS', tags: ['WordPress'], desc: 'Tech news publication' },
  { domain: 'time.com', url: 'https://time.com', category: 'CMS', tags: ['WordPress'], desc: 'News magazine' },
  { domain: 'variety.com', url: 'https://variety.com', category: 'CMS', tags: ['WordPress'], desc: 'Entertainment news' },
  { domain: 'fortune.com', url: 'https://fortune.com', category: 'CMS', tags: ['WordPress'], desc: 'Business publication' },
  { domain: 'bbc.co.uk', url: 'https://bbc.co.uk', category: 'CMS', tags: ['WordPress'], desc: 'Public broadcaster' },
  { domain: 'cnn.com', url: 'https://cnn.com', category: 'CMS', tags: ['WordPress'], desc: 'News network' },

  // ── Frontend (Next.js / React) ──
  { domain: 'vercel.com', url: 'https://vercel.com', category: 'Developer Tools', tags: ['Next.js', 'React', 'Tailwind CSS'], desc: 'Deployment platform' },
  { domain: 'linear.app', url: 'https://linear.app', category: 'Developer Tools', tags: ['Next.js', 'React', 'GraphQL'], desc: 'Issue tracking' },
  { domain: 'notion.so', url: 'https://notion.so', category: 'Productivity', tags: ['React', 'Stripe'], desc: 'Docs and workspace' },
  { domain: 'stripe.com', url: 'https://stripe.com', category: 'Payments', tags: ['React', 'Node.js', 'GraphQL'], desc: 'Payments platform' },
  { domain: 'openai.com', url: 'https://openai.com', category: 'AI', tags: ['Next.js', 'React', 'Tailwind CSS'], desc: 'AI research lab' },
  { domain: 'figma.com', url: 'https://figma.com', category: 'Design', tags: ['React', 'TypeScript'], desc: 'Design tool' },
  { domain: 'dub.co', url: 'https://dub.co', category: 'Developer Tools', tags: ['Next.js', 'Tailwind CSS'], desc: 'Link management' },
  { domain: 'cal.com', url: 'https://cal.com', category: 'Productivity', tags: ['Next.js', 'TypeScript'], desc: 'Scheduling tool' },
  { domain: 'airbnb.com', url: 'https://airbnb.com', category: 'Travel', tags: ['React', 'Next.js'], desc: 'Travel marketplace' },
  { domain: 'netlify.com', url: 'https://netlify.com', category: 'Developer Tools', tags: ['Next.js', 'React'], desc: 'Hosting platform' },
  { domain: 'twitch.tv', url: 'https://twitch.tv', category: 'Media', tags: ['Next.js', 'Cloudflare'], desc: 'Live streaming' },
  { domain: 'hulu.com', url: 'https://hulu.com', category: 'Media', tags: ['Next.js', 'React'], desc: 'Streaming service' },
  { domain: 'lego.com', url: 'https://lego.com', category: 'E-Commerce', tags: ['Next.js', 'React'], desc: 'Toy store' },

  // ── Frontend (Vue.js) ──
  { domain: 'alibaba.com', url: 'https://alibaba.com', category: 'E-Commerce', tags: ['Vue.js'], desc: 'B2B marketplace' },
  { domain: 'nintendo.com', url: 'https://nintendo.com', category: 'Gaming', tags: ['Vue.js'], desc: 'Game maker' },
  { domain: 'adobe.com', url: 'https://adobe.com', category: 'Design', tags: ['Vue.js'], desc: 'Creative software' },
  { domain: 'gitlab.com', url: 'https://gitlab.com', category: 'Developer Tools', tags: ['Vue.js', 'Docker'], desc: 'DevOps platform' },
  { domain: 'baidu.com', url: 'https://baidu.com', category: 'Search', tags: ['Vue.js'], desc: 'Search engine' },

  // ── Frontend (Angular) ──
  { domain: 'youtube.com', url: 'https://youtube.com', category: 'Media', tags: ['Angular'], desc: 'Video platform' },
  { domain: 'paypal.com', url: 'https://paypal.com', category: 'Payments', tags: ['Angular', 'Node.js'], desc: 'Payments platform' },
  { domain: 'microsoft.com', url: 'https://microsoft.com', category: 'Enterprise', tags: ['Angular', 'TypeScript'], desc: 'Software company' },
  { domain: 'gmail.com', url: 'https://gmail.com', category: 'Email', tags: ['Angular'], desc: 'Email service' },

  // ── Frontend (Svelte) ──
  { domain: 'apple.com', url: 'https://apple.com', category: 'Enterprise', tags: ['Svelte'], desc: 'Consumer electronics' },
  { domain: 'newyorker.com', url: 'https://newyorker.com', category: 'Media', tags: ['Svelte'], desc: 'Magazine' },
  { domain: 'nba.com', url: 'https://nba.com', category: 'Sports', tags: ['Svelte'], desc: 'Basketball league' },

  // ── Platforms / infra ──
  { domain: 'linkedin.com', url: 'https://linkedin.com', category: 'Social', tags: ['Node.js'], desc: 'Professional network' },
  { domain: 'reddit.com', url: 'https://reddit.com', category: 'Social', tags: ['Python'], desc: 'Community platform' },
  { domain: 'dropbox.com', url: 'https://dropbox.com', category: 'Storage', tags: ['Python'], desc: 'File storage' },
  { domain: 'discord.com', url: 'https://discord.com', category: 'Social', tags: ['Cloudflare'], desc: 'Chat platform' },
  { domain: 'canva.com', url: 'https://canva.com', category: 'Design', tags: ['Cloudflare'], desc: 'Design tool' },
  { domain: 'supabase.com', url: 'https://supabase.com', category: 'Developer Tools', tags: ['PostgreSQL'], desc: 'Backend as a service' },
  { domain: 'yelp.com', url: 'https://yelp.com', category: 'Local', tags: ['GraphQL'], desc: 'Business reviews' },
  { domain: 'shopify.com', url: 'https://shopify.com', category: 'E-Commerce', tags: ['Shopify', 'Stripe'], desc: 'Commerce platform' },
];

export const DIRECTORY_CATEGORIES = [...new Set(SITE_DIRECTORY.map((s) => s.category))];
export const DIRECTORY_TECHS = [...new Set(SITE_DIRECTORY.flatMap((s) => s.tags))].sort();
