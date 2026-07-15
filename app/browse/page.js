'use client';
import { useState, useMemo } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import browseData from '../../lib/browse-data.json';

const { categories, popular } = browseData;

const categoryIcons = {
  'Analytics': '📊', 'CMS': '📝', 'E-Commerce': '🛒', 'CDN / Hosting': '☁️',
  'JavaScript Library': '📦', 'CSS Framework': '🎨', 'Frontend Framework': '⚛️',
  'Backend Framework': '🔧', 'Database': '🗄️', 'Cloud Platform': '🌐',
  'Authentication': '🔐', 'Payment Processor': '💳', 'Monitoring': '📡',
  'Marketing': '📣', 'Email': '✉️', 'Security': '🛡️', 'Search': '🔍',
  'Advertising': '📢', 'Web Server': '🖥️', 'AI / ML': '🤖',
  'Charts / Data Visualization': '📈', 'Video Players': '🎬', 'Maps': '🗺️',
  'Customer Support': '💬', 'Form Builder': '📋', 'Cookie Consent': '🍪',
  'Error Tracking': '🐛', 'Feature Flags': '🚩', 'Session Recording': '📹',
  'Newsletter': '📰', 'Comment Systems': '💬', 'Social Feeds': '📱',
  'Page Builder': '🏗️', 'Rich Text Editor': '✏️', 'State Management': '🔄',
  'Container / Orchestration': '🐳', 'CI/CD': '🚀', 'DNS Provider': '🌍',
  'SSL / TLS': '🔒', 'Web3 / Blockchain': '⛓️', 'Video Hosting': '🎥',
  'Video Conferencing': '📹', 'Documentation': '📚', 'Testing': '🧪',
  'Developer Tools': '🛠️', 'Platform / Language': '💻', 'Infrastructure': '🏗️',
  'Font Scripts': '🔤', 'Font Service': '✏️', 'Static Site Generator': '⚡',
  'Mobile Framework': '📱', 'PWA Framework': '📲', 'Edge Runtime': '⚡',
  'Tag Manager': '🏷️', 'Server Framework': '⚙️', 'Real-time / WebSocket': '🔌',
  'Podcasting': '🎙️', 'Blog / Publishing': '✍️', 'Forums / Community': '👥',
  'LMS / Education': '🎓', 'Booking': '📅', 'Build Tool': '🔨',
  'Bundler': '📦', 'Business Tools': '💼', 'Changelog': '📋',
  'Chat Widget': '💭', 'Code Editor': '💻', 'Code Quality': '✅',
  'Dependency Security': '🔐', 'Design Tools': '🎨', 'E-Signature': '✍️',
  'File Upload': '📁', 'Graph Database': '🕸️', 'Image CDN': '🖼️',
  'Invoice / Billing': '💰', 'JavaScript Graphics': '📊', 'Log Management': '📋',
  'Message Queue': '📨', 'Notification Service': '🔔', 'Object Storage': '🪣',
  'Operating System': '💻', 'Package Manager': '📦', 'PDF Generation': '📄',
  'Project Management': '📋', 'PWA': '📲', 'SEO': '🔍',
  'Search Platform': '🔎', 'Structured Data': '📋', 'Survey': '📝',
  'Time Series DB': '⏱️', 'VCS / Git Hosting': '🔀', 'Vector Database': '🧬',
  'Webmail': '📧', 'A/B Testing': '🔬', 'AI Coding': '🤖',
  'Status Page': '📊', 'Cache Tools': '⚡', 'Captcha': '🧩',
  'Font Service': '✏️', 'Podcasting': '🎙️', 'A/B Testing': '🔬',
  'Web3 / Blockchain': '⛓️',
};

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function BrowsePage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllInCategory, setShowAllInCategory] = useState({});

  const categoryNames = useMemo(() => Object.keys(categories).sort(), []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categoryNames;
    const q = searchQuery.toLowerCase();
    return categoryNames.filter(cat => {
      if (cat.toLowerCase().includes(q)) return true;
      return categories[cat].some(t => t.name.toLowerCase().includes(q));
    });
  }, [searchQuery, categoryNames]);

  const selectedTechs = useMemo(() => {
    if (!selectedCategory) return [];
    return categories[selectedCategory] || [];
  }, [selectedCategory]);

  const totalTechs = useMemo(() => {
    return Object.values(categories).reduce((sum, techs) => sum + techs.length, 0);
  }, []);

  return (
    <div className="relative min-h-screen">
      <Header />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Browse <span className="text-accent">Categories</span>
          </h1>
          <p className="mt-3 text-sm text-muted max-w-2xl mx-auto">
            Explore {totalTechs.toLocaleString()} technologies across {categoryNames.length} categories detected by our engine.
          </p>
        </div>

        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search categories or technologies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-elevated pl-10 pr-4 py-2.5 text-sm text-fg placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-border bg-elevated p-4 scrollbar-thin">
              <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-faint">
                Browse by Category
              </h3>
              <div className="space-y-0.5">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all ${
                      selectedCategory === cat
                        ? 'bg-accent/10 text-accent border border-accent/20'
                        : 'text-fg hover:bg-border/50 border border-transparent'
                    }`}
                  >
                    <span className="truncate flex items-center gap-2">
                      <span className="text-base">{categoryIcons[cat] || '📁'}</span>
                      <span className="truncate">{cat}</span>
                    </span>
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold ${
                      selectedCategory === cat ? 'bg-accent/20 text-accent' : 'bg-border text-faint'
                    }`}>
                      {categories[cat].length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-9">
            {!selectedCategory && (
              <section className="mb-10">
                <h2 className="mb-4 text-lg font-bold tracking-tight">
                  Most Popular Technologies
                </h2>
                <p className="mb-6 text-sm text-muted">
                  Technologies with the most detection patterns across our rule engine.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {popular.map((tech, i) => {
                    const maxCount = popular[0]?.count || 1;
                    const pct = (tech.count / maxCount) * 100;
                    return (
                      <div
                        key={`${tech.name}-${i}`}
                        className="group flex items-center gap-3 rounded-xl border border-border bg-elevated p-3 transition-all hover:border-accent/30 hover:bg-elevated/80"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-border/50 font-mono text-xs font-bold text-faint group-hover:bg-accent/10 group-hover:text-accent">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-fg">{tech.name}</span>
                            <span className="hidden shrink-0 rounded-full bg-border/70 px-1.5 py-0.5 text-[9px] text-faint sm:inline-block">
                              {tech.category}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border/50">
                            <div
                              className="h-full rounded-full bg-accent/60 transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-accent">
                          {tech.count} signals
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {selectedCategory && (
              <section>
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-3xl">{categoryIcons[selectedCategory] || '📁'}</span>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">{selectedCategory}</h2>
                    <p className="text-sm text-muted">{selectedTechs.length} technologies detected</p>
                  </div>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="ml-auto rounded-lg border border-border bg-elevated px-3 py-1.5 text-xs text-faint hover:text-fg hover:border-accent/30 transition-all"
                  >
                    ← Back to all
                  </button>
                </div>

                <div className="rounded-2xl border border-border bg-elevated">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-faint">#</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-faint">Technology</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-faint">Detection Signals</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-faint">Coverage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(showAllInCategory[selectedCategory] ? selectedTechs : selectedTechs.slice(0, 20)).map((tech, i) => {
                          const maxCount = selectedTechs[0]?.count || 1;
                          const pct = (tech.count / maxCount) * 100;
                          return (
                            <tr key={tech.name} className="border-b border-border/50 last:border-0 hover:bg-border/20 transition-colors">
                              <td className="px-4 py-2.5 font-mono text-xs text-faint">{i + 1}</td>
                              <td className="px-4 py-2.5 font-medium text-fg">{tech.name}</td>
                              <td className="px-4 py-2.5 text-right font-mono text-xs text-muted">{tech.count}</td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-24 overflow-hidden rounded-full bg-border/50">
                                    <div
                                      className="h-full rounded-full bg-accent/60"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="font-mono text-[10px] text-faint">{Math.round(pct)}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {selectedTechs.length > 20 && !showAllInCategory[selectedCategory] && (
                    <div className="border-t border-border p-4 text-center">
                      <button
                        onClick={() => setShowAllInCategory(prev => ({ ...prev, [selectedCategory]: true }))}
                        className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-medium text-accent hover:bg-accent/20 transition-all"
                      >
                        Show all {selectedTechs.length} technologies
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {!selectedCategory && (
              <section>
                <h2 className="mb-6 text-lg font-bold tracking-tight">
                  All Categories
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {categoryNames.map((cat) => {
                    const techs = categories[cat];
                    const topThree = techs.slice(0, 3);
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className="group rounded-2xl border border-border bg-elevated p-5 text-left transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-2xl">{categoryIcons[cat] || '📁'}</span>
                          <span className="rounded-full bg-border px-2.5 py-0.5 font-mono text-[10px] font-semibold text-faint">
                            {techs.length} techs
                          </span>
                        </div>
                        <h3 className="mb-2 text-sm font-semibold text-fg group-hover:text-accent transition-colors">{cat}</h3>
                        <div className="space-y-1">
                          {topThree.map((t) => (
                            <div key={t.name} className="flex items-center justify-between text-xs text-muted">
                              <span className="truncate">{t.name}</span>
                              <span className="ml-2 shrink-0 font-mono text-faint">{t.count}</span>
                            </div>
                          ))}
                        </div>
                        {techs.length > 3 && (
                          <div className="mt-2 text-[10px] text-faint">
                            +{techs.length - 3} more
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
