'use client';
import { useState } from 'react';

const VIEWPORTS = [
  { key: 'mobile', label: 'Mobile', width: 'w-[200px]', icon: 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm5 18.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z', dims: '375×667' },
  { key: 'tablet', label: 'Tablet', width: 'w-[280px]', icon: 'M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm6 18.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z', dims: '768×1024' },
  { key: 'desktop', label: 'Desktop', width: 'w-full', icon: 'M3 3h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm4 16h10', dims: '1280×800' },
];

export default function ScreenshotGallery({ url, domain }) {
  const [active, setActive] = useState('desktop');
  const [loaded, setLoaded] = useState({});

  if (!url) return null;

  const getSrc = (vp) => `/api/screenshot?url=${encodeURIComponent(url)}&viewport=${vp}`;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Screenshots</h3>
        <div className="flex items-center gap-1.5">
          {VIEWPORTS.map((vp) => (
            <button
              key={vp.key}
              onClick={() => setActive(vp.key)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                active === vp.key
                  ? 'bg-accent/10 text-accent border border-accent/30'
                  : 'text-faint hover:text-muted border border-transparent'
              }`}
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={vp.icon} />
              </svg>
              {vp.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border bg-bg">
        {!loaded[active] && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent/40 border-t-accent" />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={active}
          src={getSrc(active)}
          alt={`Screenshot of ${domain} (${VIEWPORTS.find((v) => v.key === active)?.label})`}
          className={`w-full transition-opacity duration-300 ${loaded[active] ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded((prev) => ({ ...prev, [active]: true }))}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-faint">
        <span>{VIEWPORTS.find((v) => v.key === active)?.dims}</span>
        <span>{domain}</span>
      </div>
    </div>
  );
}
