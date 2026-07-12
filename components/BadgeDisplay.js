'use client';
import { useState } from 'react';

export default function BadgeDisplay({ domain }) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(null);

  if (!domain) return null;

  const badgeUrl = `/api/badge?url=${encodeURIComponent(domain)}&theme=dark`;
  const embedHtml = `<a href="https://${domain}" target="_blank" rel="noopener"><img src="https://techstack-finder.vercel.app/api/badge?url=${encodeURIComponent(domain)}&theme=dark" alt="Tech detected by TechStack Finder" /></a>`;
  const markdown = `[![TechStack Finder](https://techstack-finder.vercel.app/api/badge?url=${encodeURIComponent(domain)}&theme=dark)](https://${domain})`;

  const copy = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Embeddable Badge</h3>
        <button
          onClick={() => setShowCode(!showCode)}
          className="text-[10px] text-accent hover:text-accent/80 transition-colors"
        >
          {showCode ? 'Hide code' : 'Get embed code'}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badgeUrl} alt="TechStack Finder badge" className="h-[68px] w-[340px] rounded-lg border border-border" />

        <div className="flex gap-2">
          <button
            onClick={() => copy(`https://techstack-finder.vercel.app${badgeUrl}`, 'url')}
            className="rounded-lg border border-border bg-bg px-2.5 py-1 text-[10px] text-muted hover:border-border-strong hover:text-fg transition-colors"
          >
            {copied === 'url' ? 'Copied!' : 'Copy URL'}
          </button>
          <button
            onClick={() => copy(embedHtml, 'html')}
            className="rounded-lg border border-border bg-bg px-2.5 py-1 text-[10px] text-muted hover:border-border-strong hover:text-fg transition-colors"
          >
            {copied === 'html' ? 'Copied!' : 'HTML'}
          </button>
          <button
            onClick={() => copy(markdown, 'md')}
            className="rounded-lg border border-border bg-bg px-2.5 py-1 text-[10px] text-muted hover:border-border-strong hover:text-fg transition-colors"
          >
            {copied === 'md' ? 'Copied!' : 'Markdown'}
          </button>
        </div>
      </div>

      {showCode && (
        <div className="mt-4 rounded-xl border border-border bg-bg p-4 animate-fade-up">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-faint">HTML</div>
          <pre className="overflow-x-auto font-mono text-[11px] text-muted whitespace-pre-wrap break-all">{embedHtml}</pre>
          <div className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-faint">Markdown</div>
          <pre className="overflow-x-auto font-mono text-[11px] text-muted whitespace-pre-wrap break-all">{markdown}</pre>
        </div>
      )}
    </div>
  );
}
