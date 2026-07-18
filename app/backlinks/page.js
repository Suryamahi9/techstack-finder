'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { getScanHistory, fetchServerHistory } from '../../lib/scan-history';

const BACKLINK_TOOLS = [
  { name: 'Ahrefs', url: (d) => `https://ahrefs.com/backlink-checker/${d}`, color: '#ff6b35' },
  { name: 'Moz', url: (d) => `https://moz.com/link-explorer/links?site=${d}`, color: '#1a73e8' },
  { name: 'Ubersuggest', url: (d) => `https://neilpatel.com/ubersuggest/?url=${d}`, color: '#7c3aed' },
  { name: 'SEMrush', url: (d) => `https://www.semrush.com/analytics/backlinks/?q=${d}`, color: '#ff6400' },
  { name: 'SmallSEOTools', url: (d) => `https://smallseotools.com/backlink-checker/?url=${d}`, color: '#0ea5e9' },
];

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return '—'; }
}

function getTechSummary(entry) {
  if (!entry.categories) return [];
  const all = [];
  (entry.categories || []).forEach((c) => {
    (c.technologies || []).forEach((t) => {
      all.push({ name: t.name, type: t.type, confidence: t.confidence });
    });
  });
  return all;
}

const LOCAL_MANUAL_KEY = 'tsf-backlinks-manual';

export default function BacklinksPage() {
  const { data: session } = useSession();
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualSites, setManualSites] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedSites, setSelectedSites] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (session) {
        const serverData = await fetchServerHistory();
        if (serverData) {
          setHistory(serverData);
        } else {
          setHistory(getScanHistory());
        }
      } else {
        setHistory(getScanHistory());
      }
      try {
        const saved = localStorage.getItem(LOCAL_MANUAL_KEY);
        if (saved) setManualSites(JSON.parse(saved));
      } catch {}
      setLoading(false);
    };
    load();
  }, [session]);

  const allSites = [...history, ...manualSites.map((u) => ({ domain: u, url: `https://${u}`, scannedAt: null, total: 0, categories: [], manual: true }))];
  const domainSet = new Set();
  const uniqueSites = allSites.filter((s) => {
    if (domainSet.has(s.domain)) return false;
    domainSet.add(s.domain);
    return true;
  });

  const filteredSites = uniqueSites.filter((s) => {
    if (!searchQuery) return true;
    return s.domain.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedSites = [...filteredSites].sort((a, b) => {
    if (sortBy === 'date') {
      const da = a.scannedAt ? new Date(a.scannedAt).getTime() : 0;
      const db = b.scannedAt ? new Date(b.scannedAt).getTime() : 0;
      return sortDir === 'desc' ? db - da : da - db;
    }
    if (sortBy === 'techs') {
      return sortDir === 'desc' ? (b.total || 0) - (a.total || 0) : (a.total || 0) - (b.total || 0);
    }
    return sortDir === 'desc' ? b.domain.localeCompare(a.domain) : a.domain.localeCompare(b.domain);
  });

  const toggleSort = useCallback((col) => {
    if (sortBy === col) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortBy(col); setSortDir('desc'); }
  }, [sortBy]);

  const toggleSelect = (domain) => {
    setSelectedSites((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedSites.size === sortedSites.length) setSelectedSites(new Set());
    else setSelectedSites(new Set(sortedSites.map((s) => s.domain)));
  };

  const addManualSite = async () => {
    const domain = manualUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
    if (!domain || manualSites.includes(domain)) return;
    const updated = [...manualSites, domain];
    setManualSites(updated);
    localStorage.setItem(LOCAL_MANUAL_KEY, JSON.stringify(updated));
    setManualUrl('');
  };

  const removeManualSite = async (domain) => {
    const updated = manualSites.filter((d) => d !== domain);
    setManualSites(updated);
    localStorage.setItem(LOCAL_MANUAL_KEY, JSON.stringify(updated));
  };

  const exportCSV = () => {
    const sites = selectedSites.size > 0 ? sortedSites.filter((s) => selectedSites.has(s.domain)) : sortedSites;
    const rows = [['Domain', 'URL', 'Tech Count', 'Scanned', 'Frontend', 'Backend', 'Infra', 'Backlink Tools']];
    sites.forEach((s) => {
      const techs = getTechSummary(s);
      const tools = BACKLINK_TOOLS.map((t) => t.url(s.domain)).join(' | ');
      rows.push([s.domain, s.url || `https://${s.domain}`, s.total || techs.length, s.scannedAt || 'Manual', (s.categories || []).reduce((n, c) => n + c.technologies.filter((t) => t.type === 'frontend').length, 0), (s.categories || []).reduce((n, c) => n + c.technologies.filter((t) => t.type === 'backend').length, 0), (s.categories || []).reduce((n, c) => n + c.technologies.filter((t) => t.type === 'infra').length, 0), tools]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backlinks-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const openAllTools = (domains) => {
    domains.forEach((d) => {
      BACKLINK_TOOLS.forEach((t) => {
        window.open(t.url(d), '_blank', 'noopener');
      });
    });
  };

  return (
    <div className="min-h-screen bg-base">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-fg">Backlink Checker</h1>
              <p className="text-sm text-muted">Analyze backlinks for all scanned websites</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-elevated p-4">
            <div className="text-2xl font-bold text-accent">{uniqueSites.length}</div>
            <div className="text-xs text-muted uppercase">Total Sites</div>
          </div>
          <div className="rounded-xl border border-border bg-elevated p-4">
            <div className="text-2xl font-bold text-blue-400">{history.length}</div>
            <div className="text-xs text-muted uppercase">Scanned</div>
          </div>
          <div className="rounded-xl border border-border bg-elevated p-4">
            <div className="text-2xl font-bold text-amber-400">{manualSites.length}</div>
            <div className="text-xs text-muted uppercase">Manual</div>
          </div>
          <div className="rounded-xl border border-border bg-elevated p-4">
            <div className="text-2xl font-bold text-emerald-400">{BACKLINK_TOOLS.length}</div>
            <div className="text-xs text-muted uppercase">Tools</div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter sites..."
              className="rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-fg placeholder:text-dim focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
            <button onClick={selectAll} className="rounded-lg border border-border bg-elevated px-3 py-2 text-xs text-muted hover:text-fg transition-colors">
              {selectedSites.size === sortedSites.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {selectedSites.size > 0 && (
              <button onClick={() => openAllTools([...selectedSites])} className="rounded-lg bg-accent/10 border border-accent/30 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors">
                Check {selectedSites.size} Sites
              </button>
            )}
            <button onClick={exportCSV} className="rounded-lg border border-border bg-elevated px-4 py-2 text-sm text-muted hover:text-fg transition-colors">
              Export CSV
            </button>
          </div>
        </div>

        {/* Add manual URL */}
        <div className="mb-6 rounded-xl border border-border bg-elevated p-4">
          <div className="mb-2 text-xs font-semibold text-muted uppercase">Add Site Manually</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addManualSite()}
              placeholder="Enter domain (e.g. example.com)"
              className="flex-1 rounded-lg border border-border bg-base px-3 py-2 text-sm text-fg placeholder:text-dim focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
            <button onClick={addManualSite} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent/90 transition-colors">
              Add
            </button>
          </div>
        </div>

        {/* Sites Table */}
        {loading ? (
          <div className="rounded-xl border border-border bg-elevated p-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm text-muted">Loading sites...</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left">
                      <input type="checkbox" checked={selectedSites.size === sortedSites.length && sortedSites.length > 0} onChange={selectAll} className="accent-accent" />
                    </th>
                    <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold text-muted uppercase hover:text-fg" onClick={() => toggleSort('domain')}>
                      Domain {sortBy === 'domain' && (sortDir === 'desc' ? '↓' : '↑')}
                    </th>
                    <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold text-muted uppercase hover:text-fg" onClick={() => toggleSort('techs')}>
                      Techs {sortBy === 'techs' && (sortDir === 'desc' ? '↓' : '↑')}
                    </th>
                    <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold text-muted uppercase hover:text-fg" onClick={() => toggleSort('date')}>
                      Scanned {sortBy === 'date' && (sortDir === 'desc' ? '↓' : '↑')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Stack</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Backlink Tools</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSites.map((site) => {
                    const techs = getTechSummary(site);
                    const fe = techs.filter((t) => t.type === 'frontend').length;
                    const be = techs.filter((t) => t.type === 'backend').length;
                    const inf = techs.filter((t) => t.type === 'infra').length;
                    const topTechs = techs.slice(0, 5);
                    const isSelected = selectedSites.has(site.domain);

                    return (
                      <tr key={site.domain} className={`border-b border-border/50 transition-colors ${isSelected ? 'bg-accent/5' : 'hover:bg-border/20'}`}>
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(site.domain)} className="accent-accent" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {site.favicon ? (
                              <Image src={site.favicon} alt="" width={16} height={16} className="h-4 w-4 rounded" unoptimized onError={(e) => { e.target.style.display = 'none'; }} />
                            ) : (
                              <div className="h-4 w-4 rounded bg-border flex items-center justify-center text-[8px] font-bold text-dim">{site.domain[0]?.toUpperCase()}</div>
                            )}
                            <div>
                              <a href={site.url || `https://${site.domain}`} target="_blank" rel="noopener noreferrer" className="font-medium text-fg hover:text-accent transition-colors">
                                {site.domain}
                              </a>
                              {site.manual && <span className="ml-1.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400">MANUAL</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-semibold text-fg">{site.total || techs.length}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted">
                          {formatDate(site.scannedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {topTechs.map((t, i) => (
                              <span key={i} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${t.type === 'frontend' ? 'bg-blue-500/10 text-blue-400' : t.type === 'backend' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                {t.name}
                              </span>
                            ))}
                            {techs.length > 5 && <span className="text-[10px] text-dim">+{techs.length - 5}</span>}
                          </div>
                          <div className="mt-1 flex gap-2 text-[10px] text-dim">
                            {fe > 0 && <span>{fe} FE</span>}
                            {be > 0 && <span>{be} BE</span>}
                            {inf > 0 && <span>{inf} INF</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {BACKLINK_TOOLS.map((tool) => (
                              <a
                                key={tool.name}
                                href={tool.url(site.domain)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-md border border-border px-2 py-1 text-[10px] font-medium text-muted hover:border-border-strong hover:text-fg transition-colors"
                                style={{ borderColor: `${tool.color}30` }}
                              >
                                {tool.name}
                              </a>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <a href={`/site/${site.domain}`} className="rounded-md border border-border px-2 py-1 text-[10px] text-muted hover:text-fg transition-colors">
                              Scan
                            </a>
                            <a href={`/results?site=${site.domain}`} className="rounded-md border border-border px-2 py-1 text-[10px] text-muted hover:text-fg transition-colors">
                              Report
                            </a>
                            {site.manual && (
                              <button onClick={() => removeManualSite(site.domain)} className="rounded-md border border-red-500/20 px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/10 transition-colors">
                                Remove
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {sortedSites.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted">
                        {searchQuery ? 'No sites match your filter.' : 'No sites scanned yet. Scan a website first or add one manually above.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 rounded-xl border border-border bg-elevated p-6">
          <h3 className="mb-4 text-sm font-semibold text-fg uppercase">Free Backlink Checkers</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BACKLINK_TOOLS.map((tool) => (
              <div key={tool.name} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full" style={{ background: tool.color }} />
                  <span className="text-sm font-semibold text-fg">{tool.name}</span>
                </div>
                <p className="text-xs text-muted mb-2">Check backlinks, domain authority, and referring domains.</p>
                <a
                  href={`https://${tool.name.toLowerCase().replace(/\s/g, '')}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Open {tool.name} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
