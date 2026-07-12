'use client';
import { useMemo } from 'react';

const SITE_TYPES = {
  'E-commerce': {
    signals: ['Shopify', 'WooCommerce', 'Stripe', 'PayPal', 'Cart', 'Checkout', 'Product', 'Pricing'],
    icon: '🛒',
    description: 'Online store with product listings, cart, and payment processing',
    typical: ['Payment processor', 'Shopping cart', 'Product catalog', 'Inventory management'],
  },
  'SaaS Platform': {
    signals: ['Dashboard', 'Pricing', 'Account', 'Login', 'API', 'Workspace', 'Settings', 'Billing'],
    icon: '☁️',
    description: 'Software-as-a-Service product with user accounts and subscriptions',
    typical: ['Authentication', 'Billing/subscription', 'Dashboard', 'API layer'],
  },
  'Blog / Content Site': {
    signals: ['Blog', 'Post', 'Article', 'News', 'Category', 'Author', 'Comment', 'RSS'],
    icon: '📰',
    description: 'Content-focused site with articles, posts, and editorial content',
    typical: ['CMS', 'RSS feed', 'Comments', 'Social sharing'],
  },
  'Portfolio / Agency': {
    signals: ['Portfolio', 'Work', 'Case Study', 'Client', 'Project', 'Showcase', 'Services', 'Team'],
    icon: '🎨',
    description: 'Creative portfolio or agency site showcasing work and services',
    typical: ['Image gallery', 'Contact form', 'Project showcase', 'Animation'],
  },
  'Corporate Website': {
    signals: ['About', 'Team', 'Careers', 'Contact', 'Investor', 'Press', 'Enterprise', 'Company'],
    icon: '🏢',
    description: 'Company or enterprise website with business information',
    typical: ['CMS', 'Analytics', 'Contact forms', 'Careers page'],
  },
  'Social / Community': {
    signals: ['Community', 'Forum', 'Chat', 'Group', 'Feed', 'Follow', 'Profile', 'Message'],
    icon: '👥',
    description: 'Social network or community platform with user interactions',
    typical: ['Real-time messaging', 'User profiles', 'Feed system', 'Notifications'],
  },
  'AI / ML Product': {
    signals: ['AI', 'ML', 'Model', 'GPT', 'LLM', 'Inference', 'Neural', 'Training', 'Dataset'],
    icon: '🤖',
    description: 'AI or machine learning product or tool',
    typical: ['Python backend', 'GPU compute', 'API endpoints', 'Model serving'],
  },
  'Education / LMS': {
    signals: ['Course', 'Learn', 'Student', 'School', 'University', 'Lesson', 'Quiz', 'Certificate'],
    icon: '📚',
    description: 'Educational platform or learning management system',
    typical: ['Video hosting', 'Progress tracking', 'Quizzes', 'Certificates'],
  },
  'Finance / Fintech': {
    signals: ['Bank', 'Finance', 'Payment', 'Invest', 'Trading', 'Wallet', 'Balance', 'Transfer'],
    icon: '🏦',
    description: 'Financial services, banking, or fintech application',
    typical: ['Security headers', 'Encryption', 'Compliance', 'Audit logging'],
  },
  'Healthcare': {
    signals: ['Health', 'Medical', 'Doctor', 'Patient', 'Clinic', 'Hospital', 'Appointment', 'Prescription'],
    icon: '🏥',
    description: 'Healthcare, medical, or wellness platform',
    typical: ['HIPAA compliance', 'Patient auth', 'Appointment booking', 'Telemedicine'],
  },
  'Media / Entertainment': {
    signals: ['Watch', 'Stream', 'Video', 'Music', 'Movie', 'Show', 'Episode', 'Player'],
    icon: '🎬',
    description: 'Streaming, media, or entertainment platform',
    typical: ['Video player', 'CDN', 'Content delivery', 'DRM'],
  },
  'Developer Tool': {
    signals: ['Docs', 'API', 'Developer', 'SDK', 'CLI', 'GitHub', 'Code', 'Terminal', 'Package'],
    icon: '🛠️',
    description: 'Developer-focused tool, platform, or documentation',
    typical: ['API documentation', 'Code examples', 'SDK', 'CLI tool'],
  },
};

function detectSiteType(domain, categories, summary) {
  const allTechs = [];
  const allText = [domain || ''];
  categories?.forEach((cat) => {
    allText.push(cat.category);
    cat.technologies.forEach((t) => {
      allTechs.push(t.name);
      allText.push(t.name);
    });
  });

  const combined = allText.join(' ').toLowerCase();

  let bestType = 'Corporate Website';
  let bestScore = 0;

  Object.entries(SITE_TYPES).forEach(([name, config]) => {
    const matches = config.signals.filter((s) => combined.includes(s.toLowerCase())).length;
    const techBonus = allTechs.filter((t) => config.signals.some((s) => t.toLowerCase().includes(s.toLowerCase()))).length;
    const score = matches * 2 + techBonus;
    if (score > bestScore) {
      bestScore = score;
      bestType = name;
    }
  });

  return SITE_TYPES[bestType] ? { type: bestType, ...SITE_TYPES[bestType] } : null;
}

export default function AutoCategorization({ domain, categories, summary }) {
  const siteType = useMemo(
    () => detectSiteType(domain, categories, summary),
    [domain, categories, summary]
  );

  if (!siteType) return null;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 4h16v16H4z" />
            <path d="M4 9h16M9 4v16" />
          </svg>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Site Category</h3>
        </div>
        <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          {siteType.icon} {siteType.type}
        </span>
      </div>

      <p className="mb-3 text-sm text-muted leading-relaxed">{siteType.description}</p>

      <div className="rounded-xl border border-border bg-bg/50 p-3">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-faint">
          Typical requirements for {siteType.type}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {siteType.typical.map((req) => (
            <span key={req} className="rounded-full border border-border bg-bg px-2.5 py-1 text-[11px] text-muted">
              {req}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
