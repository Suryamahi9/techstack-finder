'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function maskKey(key) {
  if (!key) return '';
  return key.slice(0, 8) + '••••••••••••' + key.slice(-4);
}

export default function ApiKeysPage() {
  const { data: session } = useSession();
  const [keys, setKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [revealedKey, setRevealedKey] = useState(null);
  const [copied, setCopied] = useState(null);
  const [showUsage, setShowUsage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      fetch('/api/api-keys')
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setKeys(data.items.map((k) => ({
              id: k.id,
              name: k.name,
              key: k.key,
              created: k.createdAt,
              lastUsed: k.lastUsed,
              scans: k._count?.usageLogs || 0,
            })));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  const addKey = async () => {
    if (!newKeyName.trim() || !session) return;
    setError('');
    const res = await fetch('/api/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName.trim() }),
    }).catch(() => null);
    const data = res ? await res.json() : null;
    if (data?.success) {
      const k = data.item;
      setKeys((prev) => [...prev, {
        id: k.id,
        name: k.name,
        key: k.key,
        created: k.createdAt,
        lastUsed: null,
        scans: 0,
      }]);
      setNewKeyName('');
      setRevealedKey(k.key);
    } else {
      setError(data?.error || 'Failed to create key.');
    }
  };

  const deleteKey = async (id) => {
    await fetch(`/api/api-keys?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
    setKeys((prev) => prev.filter((k) => k.id !== id));
    if (revealedKey && !keys.find((k) => k.id !== id && k.key === revealedKey)) {
      setRevealedKey(null);
    }
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => {
      const input = document.createElement('input');
      input.value = key;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
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
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="mt-1 text-sm text-muted">
            Generate keys for higher rate limits. Use <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-xs text-accent">x-api-key</code> header.
          </p>
        </div>

        {!session ? (
          <div className="rounded-2xl border border-border bg-elevated p-12 text-center">
            <svg className="mx-auto mb-4 h-10 w-10 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
            <h3 className="text-lg font-semibold">Sign in required</h3>
            <p className="mt-2 text-sm text-muted">
              Sign in to generate and manage API keys.
            </p>
            <a
              href="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20"
            >
              Sign in
            </a>
          </div>
        ) : (
          <>
            {/* Rate limit info */}
            <div className="mb-6 rounded-2xl border border-border bg-elevated p-5">
              <button
                onClick={() => setShowUsage(!showUsage)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-sm font-semibold text-fg">Rate Limits</span>
                <svg className={`h-4 w-4 text-faint transition-transform ${showUsage ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showUsage && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 animate-fade-up">
                  <div className="rounded-xl border border-border bg-bg p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-faint">Anonymous</div>
                    <div className="mt-1 font-mono text-lg font-bold text-fg">10</div>
                    <div className="text-xs text-muted">requests/minute per IP</div>
                  </div>
                  <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">With API Key</div>
                    <div className="mt-1 font-mono text-lg font-bold text-accent">100</div>
                    <div className="text-xs text-muted">requests/minute per key</div>
                  </div>
                </div>
              )}
            </div>

            {/* Usage example */}
            <div className="mb-8 rounded-2xl border border-border bg-elevated p-5">
              <h3 className="mb-3 text-sm font-semibold text-fg">Quick Start</h3>
              <div className="overflow-x-auto rounded-lg bg-bg p-4 font-mono text-xs leading-relaxed">
                <span className="text-faint">curl</span>{' '}
                <span className="text-muted">-X POST</span>{' '}
                <span className="text-emerald-400">https://techstack-finder.vercel.app/api/scan</span>{'\n'}
                <span className="text-muted">{'  '}-H</span>{' '}
                <span className="text-amber-400">&quot;Content-Type: application/json&quot;</span>{'\n'}
                <span className="text-muted">{'  '}-H</span>{' '}
                <span className="text-amber-400">&quot;x-api-key: tsf_your_key_here&quot;</span>{'\n'}
                <span className="text-muted">{'  '}-d</span>{' '}
                <span className="text-amber-400">&apos;{`{"url": "example.com"}`}&apos;</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Generate new key */}
            <div className="mb-6 flex items-end gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-faint">Key Name</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. My Project Key"
                  className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                  onKeyDown={(e) => e.key === 'Enter' && addKey()}
                />
              </div>
              <button
                onClick={addKey}
                disabled={!newKeyName.trim()}
                className="shrink-0 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition-all hover:brightness-110 disabled:opacity-40"
              >
                Generate Key
              </button>
            </div>

            {/* Newly generated key */}
            {revealedKey && (
              <div className="mb-6 rounded-2xl border border-accent/30 bg-accent/5 p-5 animate-fade-up">
                <div className="mb-2 text-sm font-semibold text-accent">Your new API key</div>
                <p className="mb-3 text-xs text-muted">Copy this key now. It won&apos;t be shown again in plain text.</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg bg-bg p-3 font-mono text-xs break-all text-fg">{revealedKey}</code>
                  <button
                    onClick={() => copyKey(revealedKey)}
                    className="shrink-0 rounded-lg border border-border bg-elevated px-3 py-2 text-xs text-muted hover:border-border-strong hover:text-fg transition-colors"
                  >
                    {copied === revealedKey ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {/* Keys list */}
            {loading ? (
              <div className="rounded-2xl border border-border bg-elevated p-12 text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                <p className="text-sm text-muted">Loading keys...</p>
              </div>
            ) : keys.length === 0 ? (
              <div className="rounded-2xl border border-border bg-elevated p-12 text-center">
                <svg className="mx-auto mb-4 h-10 w-10 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
                <h3 className="text-lg font-semibold">No API keys</h3>
                <p className="mt-2 text-sm text-muted">
                  Generate a key above to get 10x higher rate limits.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {keys.map((k) => (
                  <div
                    key={k.id}
                    className="rounded-2xl border border-border bg-elevated p-5 transition-all hover:border-border-strong"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-fg">{k.name}</h3>
                        <div className="mt-1 font-mono text-xs text-muted">
                          {revealedKey === k.key ? k.key : maskKey(k.key)}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-[11px] text-faint">
                          <span>Created {new Date(k.created).toLocaleDateString()}</span>
                          <span>{k.scans} scans</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRevealedKey(revealedKey === k.key ? null : k.key)}
                          className="rounded-md border border-border bg-bg px-2 py-1 text-[10px] text-muted hover:border-border-strong hover:text-fg transition-colors"
                        >
                          {revealedKey === k.key ? 'Hide' : 'Reveal'}
                        </button>
                        <button
                          onClick={() => copyKey(k.key)}
                          className="rounded-md border border-border bg-bg px-2 py-1 text-[10px] text-muted hover:border-border-strong hover:text-fg transition-colors"
                        >
                          {copied === k.key ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => deleteKey(k.id)}
                          className="rounded-md border border-border bg-bg px-2 py-1 text-[10px] text-red-400 hover:border-red-400/30 hover:bg-red-500/10 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
