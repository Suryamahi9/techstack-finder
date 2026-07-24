const COMPANY_DB = {
  'vercel.com': { name: 'Vercel', size: 'Mid-Market (200-500)', revenue: '$100M-200M ARR', industry: 'Developer Tools', hq: 'San Francisco, CA', founded: 2015, employees: 350, techStack: 'React, Next.js, TypeScript', techBudget: 'High' },
  'netlify.com': { name: 'Netlify', size: 'Mid-Market (100-200)', revenue: '$50M-100M ARR', industry: 'Cloud Platform', hq: 'San Francisco, CA', founded: 2014, employees: 150, techStack: 'React, Next.js, Go', techBudget: 'High' },
  'shopify.com': { name: 'Shopify', size: 'Enterprise (5000+)', revenue: '$7B+ revenue', industry: 'E-Commerce', hq: 'Ottawa, Canada', founded: 2006, employees: 11000, techStack: 'Ruby on Rails, React, GraphQL', techBudget: 'Very High' },
  'github.com': { name: 'GitHub', size: 'Enterprise (5000+)', revenue: 'N/A (Microsoft)', industry: 'Developer Tools', hq: 'San Francisco, CA', founded: 2008, employees: 3000, techStack: 'Ruby on Rails, React, TypeScript', techBudget: 'Very High' },
  'stripe.com': { name: 'Stripe', size: 'Enterprise (5000+)', revenue: '$14B+ revenue', industry: 'FinTech', hq: 'San Francisco, CA', founded: 2010, employees: 8000, techStack: 'Ruby, React, Java', techBudget: 'Very High' },
  'notion.so': { name: 'Notion', size: 'Mid-Market (500-1000)', revenue: '$200M+ ARR', industry: 'SaaS', hq: 'San Francisco, CA', founded: 2013, employees: 700, techStack: 'React, TypeScript, Node.js', techBudget: 'High' },
  'figma.com': { name: 'Figma', size: 'Mid-Market (500-1000)', revenue: '$400M+ ARR', industry: 'Design Tools', hq: 'San Francisco, CA', founded: 2012, employees: 800, techStack: 'TypeScript, C++, WebAssembly', techBudget: 'High' },
  'linear.app': { name: 'Linear', size: 'Startup (50-100)', revenue: '$10M-30M ARR', industry: 'SaaS', hq: 'San Francisco, CA', founded: 2019, employees: 70, techStack: 'React, TypeScript, GraphQL', techBudget: 'High' },
  'resend.com': { name: 'Resend', size: 'Startup (10-50)', revenue: '$5M-10M ARR', industry: 'Developer Tools', hq: 'San Francisco, CA', founded: 2022, employees: 25, techStack: 'Next.js, React, TypeScript', techBudget: 'Medium' },
  'dub.co': { name: 'Dub', size: 'Startup (10-50)', revenue: '$1M-5M ARR', industry: 'SaaS', hq: 'Remote', founded: 2022, employees: 10, techStack: 'Next.js, Tailwind, Planetscale', techBudget: 'Medium' },
  'cal.com': { name: 'Cal.com', size: 'Startup (50-100)', revenue: '$5M-10M ARR', industry: 'SaaS', hq: 'San Francisco, CA', founded: 2021, employees: 60, techStack: 'Next.js, Prisma, PostgreSQL', techBudget: 'Medium' },
  'supabase.com': { name: 'Supabase', size: 'Mid-Market (100-200)', revenue: '$30M-50M ARR', industry: 'Developer Tools', hq: 'San Francisco, CA', founded: 2020, employees: 120, techStack: 'Elixir, TypeScript, PostgreSQL', techBudget: 'High' },
  'planetscale.com': { name: 'PlanetScale', size: 'Mid-Market (100-200)', revenue: '$20M-50M ARR', industry: 'Developer Tools', hq: 'San Francisco, CA', founded: 2018, employees: 100, techStack: 'Go, Rust, Vitess', techBudget: 'High' },
  'cloudflare.com': { name: 'Cloudflare', size: 'Enterprise (2000+)', revenue: '$1.3B+ revenue', industry: 'Cloud Infrastructure', hq: 'San Francisco, CA', founded: 2009, employees: 3000, techStack: 'Go, C, Rust', techBudget: 'Very High' },
  'docker.com': { name: 'Docker', size: 'Mid-Market (500-1000)', revenue: '$100M+ ARR', industry: 'Developer Tools', hq: 'San Francisco, CA', founded: 2013, employees: 600, techStack: 'Go, Python, TypeScript', techBudget: 'High' },
  'atlassian.com': { name: 'Atlassian', size: 'Enterprise (10000+)', revenue: '$3.5B+ revenue', industry: 'Developer Tools', hq: 'Sydney, Australia', founded: 2002, employees: 11000, techStack: 'Java, React, Kotlin', techBudget: 'Very High' },
  'gitlab.com': { name: 'GitLab', size: 'Enterprise (2000+)', revenue: '$500M+ revenue', industry: 'Developer Tools', hq: 'San Francisco, CA', founded: 2011, employees: 2000, techStack: 'Ruby, Vue.js, Go', techBudget: 'Very High' },
  'hashicorp.com': { name: 'HashiCorp', size: 'Enterprise (2000+)', revenue: '$600M+ revenue', industry: 'Infrastructure', hq: 'San Francisco, CA', founded: 2012, employees: 2200, techStack: 'Go, TypeScript', techBudget: 'Very High' },
  'mongodb.com': { name: 'MongoDB', size: 'Enterprise (5000+)', revenue: '$1.7B+ revenue', industry: 'Database', hq: 'New York, NY', founded: 2007, employees: 5200, techStack: 'C++, JavaScript, Go', techBudget: 'Very High' },
  'redis.io': { name: 'Redis', size: 'Mid-Market (500-1000)', revenue: '$100M-200M ARR', industry: 'Database', hq: 'Mountain View, CA', founded: 2011, employees: 600, techStack: 'C, Java, Go', techBudget: 'High' },
  'netflix.com': { name: 'Netflix', size: 'Enterprise (10000+)', revenue: '$33B+ revenue', industry: 'Media & Entertainment', hq: 'Los Gatos, CA', founded: 1997, employees: 13000, techStack: 'Java, React, Node.js', techBudget: 'Very High' },
  'airbnb.com': { name: 'Airbnb', size: 'Enterprise (5000+)', revenue: '$9.9B+ revenue', industry: 'Travel & Hospitality', hq: 'San Francisco, CA', founded: 2008, employees: 6800, techStack: 'Ruby on Rails, React, Java', techBudget: 'Very High' },
  'uber.com': { name: 'Uber', size: 'Enterprise (20000+)', revenue: '$37B+ revenue', industry: 'Transportation', hq: 'San Francisco, CA', founded: 2009, employees: 32000, techStack: 'Node.js, Go, Java', techBudget: 'Very High' },
  'spotify.com': { name: 'Spotify', size: 'Enterprise (5000+)', revenue: '$13B+ revenue', industry: 'Media & Entertainment', hq: 'Stockholm, Sweden', founded: 2006, employees: 9000, techStack: 'Python, Java, React', techBudget: 'Very High' },
  'discord.com': { name: 'Discord', size: 'Mid-Market (500-1000)', revenue: '$100M+ ARR', industry: 'Communication', hq: 'San Francisco, CA', founded: 2015, employees: 600, techStack: 'Elixir, React, TypeScript', techBudget: 'High' },
  'twitch.tv': { name: 'Twitch', size: 'Enterprise (1000+)', revenue: 'N/A (Amazon)', industry: 'Media & Entertainment', hq: 'San Francisco, CA', founded: 2011, employees: 1500, techStack: 'Java, React, Rust', techBudget: 'Very High' },
  'hulu.com': { name: 'Hulu', size: 'Enterprise (2000+)', revenue: 'N/A (Disney)', industry: 'Media & Entertainment', hq: 'Santa Monica, CA', founded: 2007, employees: 2500, techStack: 'Next.js, React, Java', techBudget: 'Very High' },
  'dropbox.com': { name: 'Dropbox', size: 'Enterprise (2000+)', revenue: '$2.5B+ revenue', industry: 'SaaS', hq: 'San Francisco, CA', founded: 2007, employees: 2800, techStack: 'Python, Rust, React', techBudget: 'Very High' },
  'slack.com': { name: 'Slack', size: 'Enterprise (5000+)', revenue: 'N/A (Salesforce)', industry: 'Communication', hq: 'San Francisco, CA', founded: 2013, employees: 2500, techStack: 'TypeScript, Java, React', techBudget: 'Very High' },
  'paypal.com': { name: 'PayPal', size: 'Enterprise (20000+)', revenue: '$29B+ revenue', industry: 'FinTech', hq: 'San Jose, CA', founded: 1998, employees: 26000, techStack: 'Java, Node.js, React', techBudget: 'Very High' },
  'twitter.com': { name: 'X (Twitter)', size: 'Enterprise (5000+)', revenue: '$3.4B+ revenue', industry: 'Social Media', hq: 'San Francisco, CA', founded: 2006, employees: 1500, techStack: 'Java, React, Scala', techBudget: 'Very High' },
  'facebook.com': { name: 'Meta', size: 'Enterprise (50000+)', revenue: '$134B+ revenue', industry: 'Social Media', hq: 'Menlo Park, CA', founded: 2004, employees: 67000, techStack: 'React, PHP (HHVM), Hack', techBudget: 'Very High' },
  'youtube.com': { name: 'YouTube', size: 'Enterprise (1000+)', revenue: 'N/A (Google)', industry: 'Media & Entertainment', hq: 'San Bruno, CA', founded: 2005, employees: 1500, techStack: 'Angular, Java, Go', techBudget: 'Very High' },
  'google.com': { name: 'Google', size: 'Enterprise (100000+)', revenue: '$307B+ revenue', industry: 'Technology', hq: 'Mountain View, CA', founded: 1998, employees: 180000, techStack: 'Angular, Java, Go, TypeScript', techBudget: 'Very High' },
  'microsoft.com': { name: 'Microsoft', size: 'Enterprise (100000+)', revenue: '$211B+ revenue', industry: 'Technology', hq: 'Redmond, WA', founded: 1975, employees: 221000, techStack: 'C#, TypeScript, React', techBudget: 'Very High' },
  'amazon.com': { name: 'Amazon', size: 'Enterprise (100000+)', revenue: '$574B+ revenue', industry: 'E-Commerce', hq: 'Seattle, WA', founded: 1994, employees: 1500000, techStack: 'Java, React, DynamoDB', techBudget: 'Very High' },
  'apple.com': { name: 'Apple', size: 'Enterprise (100000+)', revenue: '$383B+ revenue', industry: 'Technology', hq: 'Cupertino, CA', founded: 1976, employees: 164000, techStack: 'Swift, WebKit, React', techBudget: 'Very High' },
};

function estimateCompanyFromDomain(domain) {
  const d = domain.toLowerCase().replace(/^www\./, '');

  const direct = COMPANY_DB[d];
  if (direct) return { ...direct, source: 'known' };

  for (const [key, val] of Object.entries(COMPANY_DB)) {
    if (d.includes(key.replace('.com', '').replace('.io', '').replace('.app', ''))) {
      return { ...val, source: 'partial match' };
    }
  }

  const name = d.split('.')[0];
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);

  let size = 'Unknown';
  let techBudget = 'Unknown';

  if (d.endsWith('.gov') || d.endsWith('.edu') || d.endsWith('.org')) {
    size = 'Organization';
    techBudget = 'Medium';
  } else if (d.endsWith('.io') || d.endsWith('.dev') || d.endsWith('.app')) {
    size = 'Startup/Scale-up';
    techBudget = 'Medium';
  }

  return {
    name: capitalized,
    size,
    revenue: 'Not available',
    industry: 'Not classified',
    hq: 'Not available',
    founded: null,
    employees: null,
    techStack: 'Not available',
    techBudget,
    source: 'estimated',
  };
}

export function enrichCompany(domain, detectedTechs) {
  const base = estimateCompanyFromDomain(domain);

  const techNames = detectedTechs.map(t => t.name);
  const categories = [...new Set(detectedTechs.map(t => t.category))];

  let techScore = 0;
  if (techNames.some(t => ['React', 'Next.js', 'Vue.js', 'Angular', 'Svelte'].includes(t))) techScore += 2;
  if (techNames.some(t => ['TypeScript', 'Go', 'Rust', 'Kotlin'].includes(t))) techScore += 1;
  if (techNames.some(t => ['Docker', 'Kubernetes', 'Terraform'].includes(t))) techScore += 2;
  if (techNames.some(t => ['AWS', 'GCP', 'Azure', 'Cloudflare'].includes(t))) techScore += 1;
  if (techNames.some(t => ['PostgreSQL', 'MongoDB', 'Redis'].includes(t))) techScore += 1;
  if (techNames.some(t => ['Stripe', 'Auth0', 'Sentry'].includes(t))) techScore += 1;

  if (base.techBudget === 'Unknown') {
    if (techScore >= 6) base.techBudget = 'Very High';
    else if (techScore >= 4) base.techBudget = 'High';
    else if (techScore >= 2) base.techBudget = 'Medium';
    else base.techBudget = 'Low';
  }

  base.techScore = techScore;
  base.detectedCategories = categories;

  return base;
}
