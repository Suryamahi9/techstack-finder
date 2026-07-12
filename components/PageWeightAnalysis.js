'use client';
import { useState, useEffect } from 'react';

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function ResourceBar({ label, size, max, color }) {
  const pct = max > 0 ? (size / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 truncate text-xs text-muted">{label}</span>
      <div className="relative flex-1 h-5 overflow-hidden rounded-md bg-border/50">
        <div
          className="absolute inset-y-0 left-0 rounded-md transition-all duration-700"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
        />
        <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-fg">
          {formatBytes(size)}
        </span>
      </div>
    </div>
  );
}

export default function PageWeightAnalysis({ pageMetadata, categories, seo }) {
  if (!pageMetadata && !categories) return null;

  const htmlSize = pageMetadata?.contentLength || 0;

  const cssCount = categories?.find((c) => c.category === 'CSS Framework')?.technologies.length || 0;
  const jsCount = categories?.find((c) => c.category === 'JavaScript Library')?.technologies.length || 0;
  const frameworkCount = (categories?.find((c) => c.category === 'Frontend Framework')?.technologies.length || 0)
    + (categories?.find((c) => c.category === 'CSS Framework')?.technologies.length || 0);

  const totalImages = seo?.images?.total || 0;
  const missingAlt = seo?.images?.missingAlt || 0;

  const compression = pageMetadata?.contentType || '';
  const hasGzip = compression.includes('gzip') || compression.includes('br') || compression.includes('deflate');

  const resources = [
    { label: 'HTML', size: htmlSize, color: '#3b82f6' },
    { label: 'Images', size: totalImages * 45000, color: '#f59e0b' },
    { label: 'JS Libs', size: jsCount * 85000, color: '#8b5cf6' },
    { label: 'CSS', size: cssCount * 35000, color: '#10b981' },
    { label: 'Frameworks', size: frameworkCount * 120000, color: '#ec4899' },
  ];

  const totalWeight = resources.reduce((s, r) => s + r.size, 0);
  const maxSize = Math.max(...resources.map((r) => r.size), 1);

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Page Weight</h3>
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-accent">
          ~{formatBytes(totalWeight)}
        </span>
      </div>

      <div className="space-y-2">
        {resources.filter((r) => r.size > 0).map((r) => (
          <ResourceBar key={r.label} label={r.label} size={r.size} max={maxSize} color={r.color} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-bg/50 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-faint">HTML Size</div>
          <div className="mt-0.5 font-mono text-xs font-semibold text-fg">{formatBytes(htmlSize)}</div>
        </div>
        <div className="rounded-lg border border-border bg-bg/50 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-faint">Compression</div>
          <div className="mt-0.5 font-mono text-xs font-semibold text-fg">
            {hasGzip ? '✓ Enabled' : '✗ None'}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-bg/50 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-faint">Images</div>
          <div className="mt-0.5 font-mono text-xs font-semibold text-fg">
            {totalImages} total
            {missingAlt > 0 && <span className="ml-1 text-red-400">({missingAlt} no alt)</span>}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-bg/50 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-faint">Resources</div>
          <div className="mt-0.5 font-mono text-xs font-semibold text-fg">
            {jsCount + cssCount + totalImages} assets
          </div>
        </div>
      </div>
    </div>
  );
}
