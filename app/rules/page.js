'use client';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const STORAGE_KEY = 'tsf-custom-rules';

const PATTERN_TYPES = [
  { value: 'html', label: 'HTML Content', desc: 'Search raw HTML for text or regex' },
  { value: 'header', label: 'HTTP Header', desc: 'Match response header values' },
  { value: 'script_src', label: 'Script Source', desc: 'Match script src URLs' },
  { value: 'meta_generator', label: 'Meta Generator', desc: 'Match meta generator tag' },
  { value: 'cookie', label: 'Cookie', desc: 'Match cookie names' },
  { value: 'css_class', label: 'CSS Class', desc: 'Match CSS class names in HTML' },
  { value: 'link_tag', label: 'Link Tag', desc: 'Match link tag href/rel attributes' },
  { value: 'css_content', label: 'CSS Content', desc: 'Search CSS file contents' },
  { value: 'js_content', label: 'JS Content', desc: 'Search JavaScript file contents' },
  { value: 'path_probe', label: 'Path Probe', desc: 'Check if a URL path returns 200' },
];

const TECH_TYPES = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'infra', label: 'Infrastructure' },
];

const CATEGORIES = [
  'CMS', 'Framework', 'JavaScript Framework', 'UI Library', 'CSS Framework',
  'Analytics', 'Tag Manager', 'Web Server', 'CDN', 'Hosting', 'Database',
  'Email', 'Payment', 'Analytics', 'Testing', 'Performance', 'Security',
  'Font', 'Font Script', 'Accessibility', 'SEO', 'Widget', 'Map',
  'Live Chat', 'A/B Testing', 'Personalization', 'Video', 'Media',
  'Advertising', 'Affiliate', 'Feedback', 'Support', 'State Management',
];

function getRules() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRules(rules) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  window.dispatchEvent(new Event('tsf-custom-rules-updated'));
}

function emptyRule() {
  return {
    id: Date.now(),
    name: '',
    category: 'Framework',
    type: 'frontend',
    patternType: 'html',
    patterns: '',
    confidence: 0.9,
  };
}

function RuleForm({ rule, onChange, onRemove, index }) {
  const update = (field, value) => {
    onChange({ ...rule, [field]: value });
  };

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs text-faint">Rule #{index + 1}</span>
        <button
          onClick={onRemove}
          className="rounded-md p-1 text-faint hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">Name</label>
          <input
            type="text"
            value={rule.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="e.g. My Custom Framework"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">Category</label>
          <select
            value={rule.category}
            onChange={(e) => update('category', e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">Tech Type</label>
          <select
            value={rule.type}
            onChange={(e) => update('type', e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
          >
            {TECH_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">Pattern Type</label>
          <select
            value={rule.patternType}
            onChange={(e) => update('patternType', e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
          >
            {PATTERN_TYPES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">
          Patterns <span className="normal-case tracking-normal">(one per line — text match or /regex/)</span>
        </label>
        <textarea
          value={rule.patterns}
          onChange={(e) => update('patterns', e.target.value)}
          rows={3}
          placeholder={"my-framework\n/some-regex-pattern/\nanother-match"}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-xs text-fg placeholder:text-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
        />
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-faint">Confidence</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={rule.confidence}
            onChange={(e) => update('confidence', parseFloat(e.target.value))}
            className="w-24 accent-[var(--accent)]"
          />
          <span className="font-mono text-xs text-muted">{rule.confidence}</span>
        </div>
      </div>
    </div>
  );
}

export default function CustomRulesPage() {
  const [rules, setRules] = useState([]);
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setRules(getRules());
  }, []);

  const addRule = () => {
    setRules([...rules, emptyRule()]);
  };

  const updateRule = (index, updated) => {
    const next = [...rules];
    next[index] = updated;
    setRules(next);
  };

  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const persist = () => {
    saveRules(rules.filter((r) => r.name && r.patterns));
  };

  const exportRules = () => {
    const blob = new Blob([JSON.stringify(rules, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tsf-custom-rules.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importRules = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (Array.isArray(imported)) {
          setRules([...rules, ...imported]);
        }
      } catch {}
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const valid = rules.filter((r) => r.name && r.patterns);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    window.dispatchEvent(new Event('tsf-custom-rules-updated'));
  }, [rules]);

  const runTest = async () => {
    if (!testUrl.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl.trim(), customRules: rules.filter((r) => r.name && r.patterns) }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ error: 'Scan failed' });
    }
    setTesting(false);
  };

  return (
    <div className="relative min-h-screen">
      <Header />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
      </div>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Custom Rules</h1>
          <p className="mt-1 text-sm text-muted">
            Build your own detection patterns. Define what to search for and how to match it.
          </p>
        </div>

        {/* Action bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={addRule}
            className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Rule
          </button>
          <button
            onClick={exportRules}
            className="flex items-center gap-2 rounded-lg border border-border bg-elevated px-4 py-2 text-sm text-muted hover:border-border-strong hover:text-fg transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-elevated px-4 py-2 text-sm text-muted hover:border-border-strong hover:text-fg transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import
            <input type="file" accept=".json" onChange={importRules} className="hidden" />
          </label>
          <span className="ml-auto font-mono text-xs text-faint">{rules.length} rules</span>
        </div>

        {/* Rules list */}
        <div className="space-y-4">
          {rules.length === 0 ? (
            <div className="rounded-2xl border border-border bg-elevated p-12 text-center">
              <svg className="mx-auto mb-4 h-10 w-10 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
              </svg>
              <h3 className="text-lg font-semibold">No custom rules</h3>
              <p className="mt-2 text-sm text-muted">
                Click &quot;Add Rule&quot; to define your first custom detection pattern.
              </p>
            </div>
          ) : (
            rules.map((rule, i) => (
              <RuleForm
                key={rule.id}
                rule={rule}
                index={i}
                onChange={(updated) => updateRule(i, updated)}
                onRemove={() => removeRule(i)}
              />
            ))
          )}
        </div>

        {/* Test section */}
        {rules.some((r) => r.name && r.patterns) && (
          <div className="mt-10 rounded-2xl border border-border bg-elevated p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-faint">Test Custom Rules</h2>
            <div className="flex gap-3">
              <input
                type="url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="Enter a URL to test against"
                className="flex-1 rounded-xl border border-border bg-bg px-4 py-2.5 font-mono text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
              <button
                onClick={runTest}
                disabled={!testUrl.trim() || testing}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition-all hover:brightness-110 disabled:opacity-40"
              >
                {testing ? 'Testing…' : 'Test'}
              </button>
            </div>
            {testResult && (
              <div className="mt-4 rounded-lg border border-border bg-bg p-4 font-mono text-xs">
                {testResult.error ? (
                  <span className="text-red-400">{testResult.error}</span>
                ) : (
                  <div>
                    <span className="text-accent">{testResult.summary?.total || 0}</span> technologies detected
                    {testResult.categories && testResult.categories.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {testResult.categories.map((cat) => (
                          <div key={cat.category}>
                            <span className="text-muted">{cat.category}:</span>{' '}
                            {cat.technologies.map((t) => t.name).join(', ')}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
