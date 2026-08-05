'use client';
import { useState, useMemo } from 'react';
import DataChart from './DataChart';
import CsvDownload from './CsvDownload';
import { formatCount } from '../lib/format';

// Interactive report filter: search, category, trend, and sort controls over a
// technology dataset, with a live CSV export of the filtered rows.

export default function ReportFilter({ rows = [] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [trend, setTrend] = useState('all');
  const [sort, setSort] = useState('share');

  const categories = useMemo(() => [...new Set(rows.map((r) => r.category))].sort(), [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    if (category !== 'all') list = list.filter((r) => r.category === category);
    if (trend !== 'all') list = list.filter((r) => r.trend === trend);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      if (sort === 'share') return b.currentShare - a.currentShare;
      if (sort === 'usage') return b.usageCount - a.usageCount;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [rows, category, trend, query, sort]);

  const controls =
    'border border-border bg-bg px-2.5 py-1.5 font-mono text-[10px] text-muted focus:border-border-strong focus:outline-none';

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search technology or category…"
          aria-label="Filter by search"
          className={`${controls} w-56 placeholder:text-faint`}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category" className={controls}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={trend} onChange={(e) => setTrend(e.target.value)} aria-label="Filter by trend" className={controls}>
          <option value="all">All trends</option>
          <option value="growing">Growing</option>
          <option value="stable">Stable</option>
          <option value="declining">Declining</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort results" className={controls}>
          <option value="share">Sort · share</option>
          <option value="usage">Sort · usage</option>
          <option value="name">Sort · name</option>
        </select>
        <CsvDownload
          filename="filtered-report.csv"
          headers={['technology', 'category', 'trend', 'current_share_pct', 'usage_count']}
          rows={filtered.map((r) => [r.name, r.category, r.trend, r.currentShare, formatCount(r.usageCount)])}
          label="Export filtered CSV"
        />
      </div>

      <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
        {filtered.length} of {rows.length} technologies match
      </p>

      <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-bg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">Technology</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">Category</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">Trend</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-faint">Share %</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-faint">Usage</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">8-yr curve</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.name} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-2.5 font-medium text-fg">{r.name}</td>
                <td className="px-4 py-2.5 text-xs text-muted">{r.category}</td>
                <td className="px-4 py-2.5">
                  <span className={`font-mono text-[10px] ${r.trend === 'growing' ? 'text-tag-green-fg' : r.trend === 'declining' ? 'text-tag-red-fg' : 'text-muted'}`}>
                    {r.trend}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-fg">{r.currentShare}</td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-muted">{formatCount(r.usageCount)}</td>
                <td className="px-4 py-2.5">
                  <div className="w-28">
                    <DataChart data={r.data} height={56} />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                  No technologies match these filters — try clearing a filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
