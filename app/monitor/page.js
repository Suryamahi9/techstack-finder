'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const STORAGE_KEY = 'tsf-monitors';

function getLocalMonitors() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveLocalMonitors(m) { localStorage.setItem(STORAGE_KEY, JSON.stringify(m)); }

function extractDomain(url) {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
  }
}

function diffTechs(oldCats, newCats) {
  const oldT = new Set();
  const newT = new Set();
  (oldCats || []).forEach((c) => {
    const techs = typeof c === 'string' ? [] : (c.technologies || []);
    techs.forEach((t) => oldT.add(typeof t === 'string' ? t : t.name));
  });
  (newCats || []).forEach((c) => {
    const techs = typeof c === 'string' ? [] : (c.technologies || []);
    techs.forEach((t) => newT.add(typeof t === 'string' ? t : t.name));
  });
  return {
    added: [...newT].filter((n) => !oldT.has(n)),
    removed: [...oldT].filter((n) => !newT.has(n)),
    unchanged: [...newT].filter((n) => oldT.has(n)),
  };
}

async function scanSite(url) {
  const res = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

export default function MonitorPage() {
  const { data: session } = useSession();
  const [monitors, setMonitors] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [interval, setInterval_] = useState('daily');
  const [scanning, setScanning] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (session) {
        try {
          const res = await fetch('/api/monitors');
          const data = await res.json();
          if (data.success) {
            setMonitors(data.items.map((m) => ({
              id: m.id,
              domain: m.domain,
              url: m.url,
              interval: m.intervalHours <= 1 ? 'hourly' : m.intervalHours <= 24 ? 'daily' : 'weekly',
              addedAt: m.createdAt,
              lastScan: m.lastScanAt,
              lastTechs: m.lastTechs,
              history: m.history || [],
            })));
          }
        } catch {
          setMonitors(getLocalMonitors());
        }
      } else {
        setMonitors(getLocalMonitors());
      }
      setLoading(false);
    };
    load();
  }, [session]);

  const addMonitor = async () => {
    if (!newUrl.trim()) return;
    const url = newUrl.trim();
    const domain = extractDomain(url);
    const intervalHours = interval === 'hourly' ? 1 : interval === 'daily' ? 24 : 168;

    if (session) {
      const res = await fetch('/api/monitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, url, intervalHours }),
      }).catch(() => null);
      const data = res ? await res.json() : null;
      if (data?.success) {
        setMonitors((prev) => [{ id: data.item.id, domain, url, interval, addedAt: data.item.createdAt, lastScan: null, lastTechs: null, history: [] }, ...prev]);
      }
    } else {
      const m = { id: Date.now().toString(36), url, interval, addedAt: new Date().toISOString(), lastScan: null, lastTechs: null, history: [] };
      const updated = [m, ...monitors];
      setMonitors(updated);
      saveLocalMonitors(updated);
    }
    setNewUrl('');
  };

  const removeMonitor = async (id) => {
    const monitor = monitors.find((m) => m.id === id);
    if (session && monitor) {
      const domain = monitor.domain || extractDomain(monitor.url);
      await fetch(`/api/monitors?domain=${encodeURIComponent(domain)}`, { method: 'DELETE' }).catch(() => {});
    }
    const updated = monitors.filter((m) => m.id !== id);
    setMonitors(updated);
    saveLocalMonitors(updated);
  };

  const runScan = useCallback(async (monitor) => {
    setScanning(monitor.id);
    try {
      const data = await scanSite(monitor.url);
      const diff = monitor.lastTechs ? diffTechs(monitor.lastTechs, data.categories) : null;
      const snapshot = { scannedAt: new Date().toISOString(), total: data.summary.total, categories: data.categories, diff };
      const updated = monitors.map((m) => {
        if (m.id !== monitor.id) return m;
        const history = [snapshot, ...(m.history || [])].slice(0, 20);
        return { ...m, lastScan: snapshot.scannedAt, lastTechs: data.categories, history };
      });
      setMonitors(updated);
      saveLocalMonitors(updated);
      setResults((prev) => ({ ...prev, [monitor.id]: { diff, total: data.summary.total } }));
    } catch (e) {
      setResults((prev) => ({ ...prev, [monitor.id]: { error: e.message } }));
    } finally {
      setScanning(null);
    }
  }, [monitors]);

  return (
    <div className="relative min-h-screen">
      <Header />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
      </div>
      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Monitor</h1>
          <p className="mt-1 text-sm text-muted">Track changes to your monitored sites over time.</p>
        </div>

        <div className="mb-8 rounded-2xl border border-border bg-elevated p-5">
          <div className="mb-3 text-sm font-semibold text-fg">Add Site to Monitor</div>
          <div className="flex flex-wrap gap-3">
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addMonitor()}
              placeholder="e.g. https://vercel.com"
              className="flex-1 min-w-[200px] rounded-xl border border-border bg-bg px-4 py-2.5 font-mono text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"
            />
            <select
              value={interval}
              onChange={(e) => setInterval_(e.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-fg focus:border-accent focus:outline-none"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <button onClick={addMonitor} className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:brightness-110">Add</button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-elevated p-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm text-muted">Loading monitors...</p>
          </div>
        ) : monitors.length === 0 ? (
          <div className="rounded-2xl border border-border bg-elevated p-12 text-center">
            <svg className="mx-auto mb-4 h-10 w-10 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-9.33-5" />
              <path d="M13 21a2 2 0 01-3.46 0M12 3a6 6 0 016 6v3a2 2 0 01-2 2H8a2 2 0 01-2-2V9a6 6 0 016-6z" />
            </svg>
            <h3 className="text-lg font-semibold">No sites being monitored</h3>
            <p className="mt-2 text-sm text-muted">Add a site above to start tracking technology changes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {monitors.map((m) => {
              const res = results[m.id];
              const lastDiff = m.history?.[0]?.diff;
              return (
                <div key={m.id} className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <a href={`/results?site=${encodeURIComponent(m.url)}`} className="truncate font-mono text-sm font-semibold text-fg hover:text-accent">{m.url}</a>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-muted">
                        <span>Every {m.interval}</span>
                        {m.lastScan && <span>Last: {new Date(m.lastScan).toLocaleDateString()}</span>}
                        {m.lastTechs && <span>{m.history?.[0]?.total || 0} techs</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => runScan(m)}
                        disabled={scanning === m.id}
                        className="rounded-lg border border-accent/20 bg-accent/10 px-3 py-1.5 text-[11px] font-medium text-accent hover:bg-accent/20 disabled:opacity-50"
                      >
                        {scanning === m.id ? 'Scanning...' : 'Scan now'}
                      </button>
                      <button onClick={() => removeMonitor(m.id)} className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1.5 text-[11px] text-red-400 hover:bg-red-500/20">Remove</button>
                    </div>
                  </div>

                  {res?.error && <p className="mt-2 text-xs text-red-400">{res.error}</p>}

                  {lastDiff && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {lastDiff.added.length > 0 && (
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1">
                          <span className="text-[10px] font-semibold text-emerald-400">+{lastDiff.added.length} added</span>
                          <span className="ml-1 text-[10px] text-muted break-words">{lastDiff.added.join(', ')}</span>
                        </div>
                      )}
                      {lastDiff.removed.length > 0 && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-1">
                          <span className="text-[10px] font-semibold text-red-400">-{lastDiff.removed.length} removed</span>
                          <span className="ml-1 text-[10px] text-muted break-words">{lastDiff.removed.join(', ')}</span>
                        </div>
                      )}
                      {lastDiff.added.length === 0 && lastDiff.removed.length === 0 && (
                        <span className="text-[10px] text-muted">No changes detected</span>
                      )}
                    </div>
                  )}

                  {m.history && m.history.length > 1 && (
                    <div className="mt-3 border-t border-border pt-3">
                      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-faint">Scan History ({m.history.length})</div>
                      <div className="space-y-1">
                        {m.history.slice(0, 5).map((h, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-faint">{new Date(h.scannedAt).toLocaleString()}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted">{h.total} techs</span>
                              {h.diff?.added?.length > 0 && <span className="text-emerald-400">+{h.diff.added.length}</span>}
                              {h.diff?.removed?.length > 0 && <span className="text-red-400">-{h.diff.removed.length}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
