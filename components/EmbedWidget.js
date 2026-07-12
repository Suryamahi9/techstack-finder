'use client';
import { useState } from 'react';

export default function EmbedWidget({ domain }) {
  const [size, setSize] = useState('medium');
  const [showBorder, setShowBorder] = useState(true);
  const [copied, setCopied] = useState(null);

  if (!domain) return null;

  const sizes = { small: { w: 200, h: 80 }, medium: { w: 300, h: 120 }, large: { w: 400, h: 160 } };
  const s = sizes[size];

  const embedCode = `<iframe
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/badge?domain=${encodeURIComponent(domain)}&size=${size}"
  width="${s.w}" height="${s.h}"
  frameborder="0"
  style="border-radius:12px;${showBorder ? 'border:1px solid rgba(139,92,246,0.2);' : 'border:none;'}"
  loading="lazy"
  title="TechStack badge for ${domain}"
></iframe>`;

  const markdownCode = `[![TechStack](https://your-domain.com/api/badge?domain=${encodeURIComponent(domain)}&size=${size})](https://your-domain.com/results?site=${encodeURIComponent(domain)})`;


  const copy = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Embed Widget</h3>
      </div>
      <p className="mb-3 text-[11px] text-muted">Embed a TechStack badge on your site or README.</p>

      <div className="mb-4 rounded-xl border border-border bg-bg/50 p-4 text-center">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-faint">Preview</div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-4 py-2.5">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7l8-4 8 4-8 4-8-4z" /></svg>
          <span className="font-sans text-sm font-semibold text-fg">{domain}</span>
          <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">{size}</span>
        </div>
      </div>

      <div className="mb-3 flex gap-2">
        {['small', 'medium', 'large'].map((sz) => (
          <button key={sz} onClick={() => setSize(sz)} className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${size === sz ? 'bg-accent/10 text-accent border border-accent/30' : 'text-faint border border-transparent'}`}>
            {sz.charAt(0).toUpperCase() + sz.slice(1)}
          </button>
        ))}
        <button onClick={() => setShowBorder(!showBorder)} className={`ml-auto rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${showBorder ? 'bg-accent/10 text-accent border border-accent/30' : 'text-faint border border-transparent'}`}>
          {showBorder ? 'Border On' : 'Border Off'}
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-faint">HTML</span>
            <button onClick={() => copy(embedCode, 'html')} className="text-[10px] text-accent hover:underline">{copied === 'html' ? 'Copied!' : 'Copy'}</button>
          </div>
          <pre className="overflow-x-auto rounded-xl border border-border bg-bg/80 p-2.5 text-[10px] leading-relaxed text-muted max-h-[80px] overflow-y-auto">{embedCode}</pre>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-faint">Markdown</span>
            <button onClick={() => copy(markdownCode, 'md')} className="text-[10px] text-accent hover:underline">{copied === 'md' ? 'Copied!' : 'Copy'}</button>
          </div>
          <pre className="overflow-x-auto rounded-xl border border-border bg-bg/80 p-2.5 text-[10px] leading-relaxed text-muted max-h-[50px] overflow-y-auto">{markdownCode}</pre>
        </div>
      </div>
    </div>
  );
}
