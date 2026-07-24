const IMPLIED_TECH = {
  'Next.js': [
    { name: 'React', category: 'Frontend Framework', confidence: 'high' },
    { name: 'Node.js', category: 'Platform / Language', confidence: 'high' },
    { name: 'Vercel', category: 'CDN / Hosting', confidence: 'medium' },
    { name: 'TypeScript', category: 'Platform / Language', confidence: 'medium' },
  ],
  'Nuxt.js': [
    { name: 'Vue.js', category: 'Frontend Framework', confidence: 'high' },
    { name: 'Node.js', category: 'Platform / Language', confidence: 'high' },
    { name: 'TypeScript', category: 'Platform / Language', confidence: 'medium' },
  ],
  'Gatsby': [
    { name: 'React', category: 'Frontend Framework', confidence: 'high' },
    { name: 'GraphQL', category: 'API Protocol', confidence: 'high' },
    { name: 'Node.js', category: 'Platform / Language', confidence: 'high' },
  ],
  'Remix': [
    { name: 'React', category: 'Frontend Framework', confidence: 'high' },
    { name: 'Node.js', category: 'Platform / Language', confidence: 'high' },
  ],
  'Astro': [
    { name: 'Vite', category: 'Build Tool', confidence: 'high' },
  ],
  'SvelteKit': [
    { name: 'Svelte', category: 'Frontend Framework', confidence: 'high' },
    { name: 'Vite', category: 'Build Tool', confidence: 'high' },
  ],
  'Angular': [
    { name: 'TypeScript', category: 'Platform / Language', confidence: 'high' },
    { name: 'RxJS', category: 'JavaScript Library', confidence: 'medium' },
  ],
  'WordPress': [
    { name: 'PHP', category: 'Platform / Language', confidence: 'high' },
    { name: 'MySQL', category: 'Database', confidence: 'medium' },
  ],
  'Shopify': [
    { name: 'Ruby on Rails', category: 'Backend Framework', confidence: 'medium' },
    { name: 'Liquid', category: 'CMS', confidence: 'high' },
  ],
  'WooCommerce': [
    { name: 'WordPress', category: 'CMS', confidence: 'high' },
    { name: 'PHP', category: 'Platform / Language', confidence: 'high' },
  ],
  'Django': [
    { name: 'Python', category: 'Platform / Language', confidence: 'high' },
    { name: 'PostgreSQL', category: 'Database', confidence: 'medium' },
  ],
  'Laravel': [
    { name: 'PHP', category: 'Platform / Language', confidence: 'high' },
    { name: 'Composer', category: 'Package Manager', confidence: 'medium' },
  ],
  'Ruby on Rails': [
    { name: 'Ruby', category: 'Platform / Language', confidence: 'high' },
    { name: 'PostgreSQL', category: 'Database', confidence: 'medium' },
  ],
  'Express': [
    { name: 'Node.js', category: 'Platform / Language', confidence: 'high' },
  ],
  'Flask': [
    { name: 'Python', category: 'Platform / Language', confidence: 'high' },
  ],
  'Spring Boot': [
    { name: 'Java', category: 'Platform / Language', confidence: 'high' },
  ],
  'ASP.NET': [
    { name: 'C#', category: 'Platform / Language', confidence: 'high' },
    { name: '.NET', category: 'Backend Framework', confidence: 'high' },
  ],
  'Tailwind CSS': [
    { name: 'PostCSS', category: 'Build Tool', confidence: 'high' },
  ],
  'Bootstrap': [
    { name: 'jQuery', category: 'JavaScript Library', confidence: 'low' },
  ],
  'Material UI': [
    { name: 'React', category: 'Frontend Framework', confidence: 'high' },
  ],
  'Chakra UI': [
    { name: 'React', category: 'Frontend Framework', confidence: 'high' },
  ],
  'Vuetify': [
    { name: 'Vue.js', category: 'Frontend Framework', confidence: 'high' },
  ],
  'Angular Material': [
    { name: 'Angular', category: 'Frontend Framework', confidence: 'high' },
  ],
  'Firebase': [
    { name: 'Google Cloud', category: 'Cloud Platform', confidence: 'medium' },
  ],
  'Supabase': [
    { name: 'PostgreSQL', category: 'Database', confidence: 'high' },
    { name: 'Deno', category: 'Platform / Language', confidence: 'medium' },
  ],
  'Prisma': [
    { name: 'TypeScript', category: 'Platform / Language', confidence: 'medium' },
  ],
  'Vercel Analytics': [
    { name: 'Vercel', category: 'CDN / Hosting', confidence: 'high' },
  ],
  'Netlify': [
    { name: 'Git', category: 'VCS / Git Hosting', confidence: 'medium' },
  ],
  'Heroku': [
    { name: 'PostgreSQL', category: 'Database', confidence: 'medium' },
  ],
  'Stripe.js': [
    { name: 'Stripe', category: 'Payment Processor', confidence: 'high' },
  ],
  'Google Analytics': [
    { name: 'Google Tag Manager', category: 'Tag Manager', confidence: 'high' },
  ],
  'Google Analytics 4': [
    { name: 'Google Tag Manager', category: 'Tag Manager', confidence: 'high' },
  ],
  'Segment': [
    { name: 'Analytics', category: 'Analytics', confidence: 'medium' },
  ],
  'Hotjar': [
    { name: 'Analytics', category: 'Analytics', confidence: 'medium' },
  ],
  'Sentry': [
    { name: 'Error Tracking', category: 'Monitoring', confidence: 'high' },
  ],
  'Cloudflare': [
    { name: 'CDN', category: 'CDN / Hosting', confidence: 'high' },
    { name: 'DNS', category: 'DNS', confidence: 'high' },
  ],
  'Docker': [
    { name: 'Linux', category: 'Operating System', confidence: 'medium' },
  ],
  'Kubernetes': [
    { name: 'Docker', category: 'Container', confidence: 'high' },
    { name: 'Linux', category: 'Operating System', confidence: 'medium' },
  ],
  'GraphQL': [
    { name: 'REST API', category: 'API Protocol', confidence: 'low' },
  ],
  'Webpack': [
    { name: 'JavaScript', category: 'Platform / Language', confidence: 'medium' },
  ],
  'Vite': [
    { name: 'ES Modules', category: 'Build Tool', confidence: 'high' },
  ],
  'Storybook': [
    { name: 'React', category: 'Frontend Framework', confidence: 'low' },
  ],
  'Algolia': [
    { name: 'Search', category: 'Search', confidence: 'high' },
  ],
  'Elasticsearch': [
    { name: 'Search', category: 'Search', confidence: 'high' },
  ],
  'Redis': [
    { name: 'Cache', category: 'Cache Tools', confidence: 'high' },
  ],
  'MongoDB': [
    { name: 'NoSQL', category: 'Database', confidence: 'high' },
  ],
  'PostgreSQL': [
    { name: 'SQL', category: 'Database', confidence: 'high' },
  ],
};

const CANONICAL_NAMES = {
  'Google Analytics 4': 'Google Analytics',
  'GA4': 'Google Analytics',
  'Google Analytics (Universal)': 'Google Analytics',
  'Google Tag Manager (GTM)': 'Google Tag Manager',
  'GTM': 'Google Tag Manager',
  'Material Design': 'Material UI',
  '@mui/material': 'Material UI',
  'React Router': 'React Router',
  'react-router-dom': 'React Router',
  'next/router': 'Next.js',
  'next/image': 'Next.js',
  'next/link': 'Next.js',
  'Vue Router': 'Vue.js',
  'vue-router': 'Vue.js',
  'Vuex': 'Vue.js',
  'Pinia': 'Vue.js',
  'Webpack 5': 'Webpack',
  'Webpack 4': 'Webpack',
  'esbuild': 'Vite',
  'Rollup': 'Vite',
  'jQuery Migrate': 'jQuery',
  'jQuery UI': 'jQuery',
  '$.fn.jquery': 'jQuery',
  'Bootstrap 5': 'Bootstrap',
  'Bootstrap 4': 'Bootstrap',
  'Bootstrap 3': 'Bootstrap',
  'Font Awesome 6': 'Font Awesome',
  'Font Awesome 5': 'Font Awesome',
  'Font Awesome Free': 'Font Awesome',
  'Open Sans': 'Google Fonts',
  'Roboto': 'Google Fonts',
  'Inter Font': 'Google Fonts',
  'Lato': 'Google Fonts',
  'Montserrat': 'Google Fonts',
  'Amazon S3': 'AWS',
  'Amazon CloudFront': 'AWS',
  'AWS Lambda': 'AWS',
  'AWS EC2': 'AWS',
  'Amazon Web Services': 'AWS',
  'Google Cloud Platform': 'Google Cloud',
  'GCP': 'Google Cloud',
  'Firebase Hosting': 'Firebase',
  'Firebase Auth': 'Firebase',
  'Firebase Firestore': 'Firebase',
  'Microsoft Azure': 'Azure',
  'Azure DevOps': 'Azure',
  'GitHub Pages': 'GitHub',
  'GitHub Actions': 'GitHub',
  'Netlify CDN': 'Netlify',
  'Vercel Edge': 'Vercel',
  'Vercel CDN': 'Vercel',
  'Stripe Checkout': 'Stripe',
  'Stripe Elements': 'Stripe',
  'Stripe Billing': 'Stripe',
  'PayPal Checkout': 'PayPal',
  'PayPal SDK': 'PayPal',
  'Cloudflare CDN': 'Cloudflare',
  'Cloudflare Workers': 'Cloudflare',
  'Cloudflare Pages': 'Cloudflare',
  'Cloudflare DNS': 'Cloudflare',
  'New Relic APM': 'New Relic',
  'Datadog APM': 'Datadog',
  'Datadog RUM': 'Datadog',
  'Sentry Error Tracking': 'Sentry',
  'Sentry Performance': 'Sentry',
  'Segment Analytics': 'Segment',
  'Twilio Segment': 'Segment',
  'HubSpot CRM': 'HubSpot',
  'HubSpot Marketing': 'HubSpot',
  'Marketo Engage': 'Marketo',
  'Salesforce CRM': 'Salesforce',
  'Salesforce Marketing Cloud': 'Salesforce',
  'Intercom Messenger': 'Intercom',
  'Zendesk Chat': 'Zendesk',
  'Zendesk Support': 'Zendesk',
  'Crisp Chat': 'Crisp',
  'Drift Chat': 'Drift',
  'Tawk.to': 'Tawk.to',
  'LiveChat': 'LiveChat',
  'PostHog Analytics': 'PostHog',
  'Mixpanel Analytics': 'Mixpanel',
  'Amplitude Analytics': 'Amplitude',
  'Heap Analytics': 'Heap',
  'Plausible Analytics': 'Plausible',
  'Matomo Analytics': 'Matomo',
  'Fathom Analytics': 'Fathom',
  'Umami Analytics': 'Umami',
};

const AI_BUILDERS = {
  'v0': {
    name: 'v0',
    vendor: 'Vercel',
    description: 'AI-generated React components by Vercel',
    signals: [
      { type: 'html', regex: /v0\.dev|v0-prefab|data-v0|v0-/i, via: 'v0 generated markup' },
      { type: 'script_src', regex: /v0\.dev|v0-cdn/i, via: 'v0 script reference' },
      { type: 'html', regex: /@vercel\/ui|@radix-ui\/|@shadcn/i, via: 'v0 typical dependencies' },
      { type: 'js_content', regex: /v0\.dev|prefab-id|v0Generated/i, via: 'v0 generated code markers' },
    ],
  },
  'Lovable': {
    name: 'Lovable',
    vendor: 'Lovable (formerly GPT Engineer)',
    description: 'AI full-stack app generator',
    signals: [
      { type: 'html', regex: /lovable\.dev|lovable-project|gptengineer/i, via: 'Lovable project marker' },
      { type: 'script_src', regex: /lovable\.dev/i, via: 'Lovable script' },
      { type: 'html', regex: /supabase\.io.*lovable|lovable.*supabase/i, via: 'Lovable + Supabase pattern' },
    ],
  },
  'Bolt.new': {
    name: 'Bolt.new',
    vendor: 'StackBlitz',
    description: 'AI-powered full-stack coding in the browser',
    signals: [
      { type: 'html', regex: /bolt\.new|boltapp|stackblitz/i, via: 'Bolt.new marker' },
      { type: 'script_src', regex: /bolt\.new|stackblitz-webcontainer/i, via: 'Bolt/StackBlitz script' },
      { type: 'js_content', regex: /boltGenerated|bolt\.new/i, via: 'Bolt generated marker' },
    ],
  },
  'Cursor': {
    name: 'Cursor',
    vendor: 'Anysphere',
    description: 'AI-assisted code editor (Cursor IDE)',
    signals: [
      { type: 'html', regex: /cursor\.sh|cursor\.com|cursor-/i, via: 'Cursor badge' },
      { type: 'html', regex: /generated by cursor|built with cursor|made with cursor/i, via: 'Cursor attribution' },
    ],
  },
  'Bolt.diy': {
    name: 'Bolt.diy',
    vendor: 'StackBlitz (open source)',
    description: 'Open-source AI coding in the browser',
    signals: [
      { type: 'html', regex: /bolt\.diy|bolt-diy/i, via: 'Bolt.diy marker' },
    ],
  },
  'Windsurf': {
    name: 'Windsurf',
    vendor: 'Codeium',
    description: 'AI-powered code editor',
    signals: [
      { type: 'html', regex: /windsurf|codeium/i, via: 'Windsurf badge' },
    ],
  },
};

const INDUSTRY_CATEGORIES = {
  'SaaS': {
    signals: ['dashboard', 'pricing', 'account', 'login', 'api', 'workspace', 'settings', 'billing', 'subscription', 'trial', 'plan'],
    techSignals: ['Stripe', 'Auth0', 'Intercom', 'Crisp', 'HubSpot', 'Segment', 'PostHog', 'Mixpanel'],
    icon: 'S',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  'E-Commerce': {
    signals: ['shop', 'cart', 'checkout', 'product', 'price', 'buy', 'store', 'order', 'shipping', 'wishlist'],
    techSignals: ['Shopify', 'WooCommerce', 'Stripe', 'PayPal', 'Magento', 'BigCommerce', 'Snipcart', 'Squarespace Commerce'],
    icon: 'E',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  'Media & Publishing': {
    signals: ['article', 'news', 'blog', 'post', 'editorial', 'magazine', 'journal', 'opinion', 'review', 'report'],
    techSignals: ['WordPress', 'Ghost', 'Contentful', 'Sanity', 'Prismic', 'Strapi', 'Storyblok'],
    icon: 'M',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  'Social & Community': {
    signals: ['profile', 'feed', 'follow', 'like', 'comment', 'share', 'community', 'forum', 'chat', 'message'],
    techSignals: ['Discourse', 'NodeBB', 'Mighty Networks', 'Circle', 'Ghost'],
    icon: 'C',
    color: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  },
  'AI & Machine Learning': {
    signals: ['ai', 'ml', 'model', 'gpt', 'llm', 'inference', 'neural', 'training', 'dataset', 'prompt', 'copilot'],
    techSignals: ['OpenAI', 'Hugging Face', 'TensorFlow', 'PyTorch', 'LangChain', 'Pinecone'],
    icon: 'A',
    color: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
  'Developer Tools': {
    signals: ['docs', 'api', 'sdk', 'cli', 'developer', 'github', 'code', 'terminal', 'package', 'npm', 'registry'],
    techSignals: ['Swagger', 'Readme.io', 'Docusaurus', 'GitBook', 'Storybook', 'VitePress'],
    icon: 'D',
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  'FinTech & Banking': {
    signals: ['bank', 'finance', 'payment', 'invest', 'trading', 'wallet', 'balance', 'transfer', 'crypto', 'defi'],
    techSignals: ['Stripe', 'Plaid', 'Square', 'Affirm', 'Klarna', 'Coinbase'],
    icon: 'F',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  'Healthcare & Wellness': {
    signals: ['health', 'medical', 'doctor', 'patient', 'clinic', 'hospital', 'appointment', 'prescription', 'fitness', 'wellness'],
    techSignals: ['Epic', 'Cerner', 'Fitbit', 'Apple HealthKit'],
    icon: 'H',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  'Education & Learning': {
    signals: ['course', 'learn', 'student', 'school', 'university', 'lesson', 'quiz', 'certificate', 'curriculum', 'enrollment'],
    techSignals: ['Moodle', 'Canvas', 'Teachable', 'Thinkific', 'Kajabi', 'LearnDash'],
    icon: 'L',
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  'Real Estate': {
    signals: ['property', 'listing', 'real estate', 'rent', 'lease', 'mortgage', 'agent', 'broker', 'home', 'apartment'],
    techSignals: ['Zillow API', 'Realtor', 'MLS'],
    icon: 'R',
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
  'Food & Delivery': {
    signals: ['food', 'delivery', 'restaurant', 'menu', 'order', 'meal', 'recipe', 'cook', 'dine', 'takeout'],
    techSignals: ['DoorDash', 'Uber Eats', 'Square', 'Toast'],
    icon: 'O',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  'Travel & Hospitality': {
    signals: ['hotel', 'flight', 'travel', 'booking', 'reservation', 'vacation', 'tour', 'destination', 'airbnb', 'rental'],
    techSignals: ['Booking.com', 'Airbnb', 'Expedia', 'TripAdvisor'],
    icon: 'T',
    color: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  },
  'Gaming': {
    signals: ['game', 'play', 'player', 'score', 'level', 'achievement', 'leaderboard', 'arena', 'match', 'battle'],
    techSignals: ['Unity', 'Unreal', 'Phaser', 'PixiJS', 'Three.js', 'Babylon.js'],
    icon: 'G',
    color: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
  },
  'Creative & Design': {
    signals: ['design', 'creative', 'portfolio', 'art', 'gallery', 'studio', 'agency', 'brand', 'logo', 'visual'],
    techSignals: ['Figma', 'Webflow', 'Squarespace', 'Wix', 'Webflow', 'Spline', 'Framer'],
    icon: 'X',
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  'Marketing & Advertising': {
    signals: ['campaign', 'marketing', 'ad', 'conversion', 'funnel', 'lead', 'prospect', 'audience', 'targeting', 'retarget'],
    techSignals: ['Google Ads', 'Facebook Pixel', 'TikTok Pixel', 'LinkedIn Insight', 'Marketo', 'ActiveCampaign', 'Mailchimp'],
    icon: 'P',
    color: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  },
  'Communication': {
    signals: ['email', 'inbox', 'compose', 'sent', 'draft', 'calendar', 'meeting', 'video', 'call', 'conference'],
    techSignals: ['Twilio', 'SendGrid', 'Mailgun', 'Postmark', 'Zoom', 'Daily.co'],
    icon: 'I',
    color: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  'Analytics & Data': {
    signals: ['dashboard', 'report', 'metric', 'kpi', 'chart', 'graph', 'insight', 'trend', 'forecast', 'data'],
    techSignals: ['Google Analytics', 'Mixpanel', 'Amplitude', 'PostHog', 'Heap', 'Segment', 'Plausible'],
    icon: 'N',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  'Infrastructure & Cloud': {
    signals: ['server', 'deploy', 'pipeline', 'ci/cd', 'monitor', 'scale', 'container', 'cluster', 'node', 'pod'],
    techSignals: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'Ansible', 'Vercel', 'Netlify'],
    icon: 'W',
    color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
  'Cybersecurity': {
    signals: ['security', 'vulnerability', 'threat', 'firewall', 'encrypt', 'auth', 'identity', 'compliance', 'audit', 'pentest'],
    techSignals: ['Cloudflare', 'Auth0', 'Okta', 'Snyk', 'SonarQube', 'Vault'],
    icon: 'Y',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  'Project Management': {
    signals: ['task', 'project', 'sprint', 'kanban', 'board', 'milestone', 'deadline', 'backlog', 'epic', 'story'],
    techSignals: ['Jira', 'Asana', 'Notion', 'Linear', 'Monday.com', 'ClickUp', 'Trello'],
    icon: 'J',
    color: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
  'Legal & Compliance': {
    signals: ['legal', 'compliance', 'policy', 'terms', 'privacy', 'gdpr', 'consent', 'regulation', 'contract', 'agreement'],
    techSignals: ['OneTrust', 'Cookiebot', 'TrustArc', 'iubenda'],
    icon: 'Q',
    color: 'bg-stone-500/10 text-stone-400 border-stone-500/20',
  },
  'Nonprofit & Government': {
    signals: ['donate', 'volunteer', 'nonprofit', 'ngo', 'cause', 'charity', 'grant', 'public', 'government', 'civic'],
    techSignals: ['WordPress', 'NationBuilder', 'CiviCRM'],
    icon: 'Z',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  'Portfolio & Personal': {
    signals: ['about', 'cv', 'resume', 'contact', 'projects', 'skills', 'experience', 'testimonial', 'blog', 'hire'],
    techSignals: ['Squarespace', 'Wix', 'Webflow', 'Framer'],
    icon: 'B',
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  },
  'Utilities & Tools': {
    signals: ['calculator', 'converter', 'generator', 'tool', 'utility', 'checker', 'scanner', 'tester', 'optimizer'],
    techSignals: ['Vercel', 'Netlify', 'Cloudflare Workers'],
    icon: 'U',
    color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  },
};

export function inferImpliedTechs(technologies) {
  const existingNames = new Set(technologies.map(t => t.name));
  const implied = [];

  for (const tech of technologies) {
    const deps = IMPLIED_TECH[tech.name];
    if (!deps) continue;
    for (const dep of deps) {
      if (existingNames.has(dep.name)) continue;
      if (implied.some(i => i.name === dep.name)) continue;
      implied.push({
        name: dep.name,
        category: dep.category,
        type: CATEGORY_TYPES[dep.category] || 'frontend',
        confidence: dep.confidence,
        inferredFrom: tech.name,
        isImplied: true,
      });
    }
  }

  return implied;
}

export function canonicalize(technologies) {
  const byCanonical = {};

  for (const tech of technologies) {
    const canonical = CANONICAL_NAMES[tech.name] || tech.name;
    if (!byCanonical[canonical]) {
      byCanonical[canonical] = {
        ...tech,
        name: canonical,
        aliases: [],
        detectionCount: 1,
      };
    } else {
      byCanonical[canonical].detectionCount++;
      if (tech.name !== canonical) {
        byCanonical[canonical].aliases.push(tech.name);
      }
      if (tech.confidence === 'high' && byCanonical[canonical].confidence !== 'high') {
        byCanonical[canonical].confidence = 'high';
      }
      if (tech.version && !byCanonical[canonical].version) {
        byCanonical[canonical].version = tech.version;
      }
    }
  }

  return Object.values(byCanonical);
}

export function classifyIndustry(domain, categories, technologies, pageMetadata) {
  const allTechNames = technologies.map(t => t.name);
  const allText = [
    domain || '',
    ...(pageMetadata?.title ? [pageMetadata.title] : []),
    ...(pageMetadata?.description ? [pageMetadata.description] : []),
    ...(categories || []).map(c => c.category),
    ...allTechNames,
  ].join(' ').toLowerCase();

  const scores = {};

  for (const [name, config] of Object.entries(INDUSTRY_CATEGORIES)) {
    let score = 0;
    for (const signal of config.signals) {
      if (allText.includes(signal.toLowerCase())) score += 2;
    }
    for (const tech of config.techSignals) {
      if (allTechNames.includes(tech)) score += 5;
      if (allText.includes(tech.toLowerCase())) score += 1;
    }
    scores[name] = score;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const best = sorted[0];

  if (!best || best[1] === 0) {
    return { primary: 'Other', confidence: 'low', all: [] };
  }

  const top = sorted.slice(0, 3).filter(([, s]) => s > 0).map(([name, score]) => ({
    name,
    score,
    ...INDUSTRY_CATEGORIES[name],
  }));

  return {
    primary: best[0],
    confidence: best[1] >= 10 ? 'high' : best[1] >= 5 ? 'medium' : 'low',
    all: top,
    ...INDUSTRY_CATEGORIES[best[0]],
  };
}

export function detectAiBuilders(technologies, htmlContent) {
  const found = [];
  const techNames = technologies.map(t => t.name.toLowerCase());

  for (const [key, builder] of Object.entries(AI_BUILDERS)) {
    const detected = technologies.some(t => t.name.toLowerCase() === key.toLowerCase() || t.name.toLowerCase().includes(key.toLowerCase()));
    if (detected) {
      found.push({
        name: builder.name,
        vendor: builder.vendor,
        description: builder.description,
        confidence: 'high',
        via: 'detected technology',
      });
      continue;
    }

    if (htmlContent) {
      const lower = htmlContent.substring(0, 100000).toLowerCase();
      for (const signal of builder.signals) {
        if (signal.regex.test && signal.regex.test(htmlContent)) {
          found.push({
            name: builder.name,
            vendor: builder.vendor,
            description: builder.description,
            confidence: 'medium',
            via: signal.via,
          });
          break;
        }
      }
    }
  }

  return found;
}

export function generateInsights(domain, categories, technologies, healthScore, dnsTls, adsTxt, gdpr, cveSummary, company) {
  const techNames = technologies.map(t => t.name);
  const byType = { frontend: [], backend: [], infra: [] };
  const byCategory = {};

  technologies.forEach(t => {
    byType[t.type]?.push(t.name);
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t.name);
  });

  const name = company?.name || domain;
  const sentences = [];

  // Opening — plain English stack summary
  const framework = byType.frontend?.find(n => ['Next.js', 'Nuxt.js', 'Gatsby', 'Remix', 'Astro', 'Angular', 'Vue.js', 'Svelte'].includes(n));
  const backend = byType.backend?.find(n => ['Django', 'Laravel', 'Ruby on Rails', 'Express', 'Flask', 'Spring Boot', 'ASP.NET'].includes(n));

  if (framework && backend) {
    sentences.push(`${name} is a ${framework}-powered application with a ${backend} backend, delivering a modern full-stack web experience.`);
  } else if (framework) {
    const platform = techNames.includes('Vercel') ? 'hosted on Vercel edge network' : techNames.includes('Netlify') ? 'deployed on Netlify' : 'powered by a modern JavaScript stack';
    sentences.push(`${name} is built with ${framework} ${platform}.`);
  } else if (backend) {
    sentences.push(`${name} runs on ${backend} with ${byType.frontend?.length || 0} frontend technologies.`);
  } else if (techNames.length > 0) {
    sentences.push(`${name} uses ${techNames.slice(0, 4).join(', ')}${techNames.length > 4 ? ` and ${techNames.length - 4} other technologies` : ''}.`);
  }

  // Infra insight
  if (dnsTls?.cloudProviders?.length > 0) {
    sentences.push(`The site is served through ${dnsTls.cloudProviders.join(' and ')}.`);
  }
  if (dnsTls?.dns?.provider) {
    sentences.push(`DNS is managed by ${dnsTls.dns.provider}.`);
  }
  if (dnsTls?.tls?.sslProvider) {
    sentences.push(`TLS certificates are issued by ${dnsTls.tls.sslProvider}.`);
  }

  // Ads insight
  if (adsTxt?.found && adsTxt.summary) {
    const s = adsTxt.summary;
    if (s.hasHeaderBidding) {
      sentences.push(`The site runs header bidding with ${s.uniqueDomains} advertising partners, maximizing ad revenue through real-time auctions.`);
    } else if (s.uniqueDomains > 0) {
      sentences.push(`Monetization includes ${s.uniqueDomains} ad tech partner${s.uniqueDomains > 1 ? 's' : ''} via ads.txt.`);
    }
  }

  // GDPR insight
  if (gdpr) {
    if (gdpr.hasConsentManager) {
      sentences.push(`GDPR compliance is managed through ${gdpr.consentManagers[0]}, with ${gdpr.totalTrackers} tracking script${gdpr.totalTrackers !== 1 ? 's' : ''} detected across ${gdpr.trackerCategories.length} categories.`);
    } else if (gdpr.totalTrackers > 0) {
      sentences.push(`Warning: ${gdpr.totalTrackers} tracking scripts detected but no consent management platform was found.`);
    }
  }

  // Security insight
  if (cveSummary && cveSummary.totalCves > 0) {
    const sev = cveSummary.critical > 0 ? 'critical' : cveSummary.high > 0 ? 'high' : 'known';
    sentences.push(`There ${cveSummary.totalCves === 1 ? 'is' : 'are'} ${cveSummary.totalCves} ${sev} CVE${cveSummary.totalCves !== 1 ? 's' : ''} across detected technology versions.`);
  }

  // Health score commentary
  if (typeof healthScore === 'number') {
    if (healthScore >= 85) {
      sentences.push(`Overall stack health is excellent at ${healthScore}/100 — strong security posture, modern tooling, and good compliance practices.`);
    } else if (healthScore >= 70) {
      sentences.push(`Stack health scores ${healthScore}/100 — solid foundation with room for improvement in security or compliance.`);
    } else if (healthScore >= 50) {
      sentences.push(`Stack health is moderate at ${healthScore}/100 — several areas need attention including security headers, CVE patching, or consent management.`);
    } else {
      sentences.push(`Stack health is concerning at ${healthScore}/100 — significant security, compliance, or infrastructure issues detected.`);
    }
  }

  return {
    sentences,
    stackSummary: sentences.join(' '),
    techCount: techNames.length,
    categoryCount: Object.keys(byCategory).length,
    frontendCount: byType.frontend?.length || 0,
    backendCount: byType.backend?.length || 0,
    infraCount: byType.infra?.length || 0,
  };
}
