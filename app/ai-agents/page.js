'use client';
import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import InlineScan from '../../components/InlineScan';

const SAMPLE_URL = 'https://vercel.com';

export default function AiAgentsPage() {
  const [preview, setPreview] = useState(null);
  const [state, setState] = useState('idle');

  const runExample = async () => {
    setState('loading');
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: SAMPLE_URL }),
      });
      const json = await res.json();
      setPreview(JSON.stringify(json, null, 2).slice(0, 2400));
      setState('done');
    } catch {
      setPreview('// failed to reach /api/scan — is the dev server running?');
      setState('done');
    }
  };

  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pt-28 sm:pt-32">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">API & AI Agents</p>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl font-normal tracking-tight text-fg sm:text-5xl">
            TechStackFinder + AI
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
            Connect your AI agents and applications to live technology data. One POST, structured JSON back —
            designed for agents to reason over the stack of any site.
          </p>
        </div>

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-bg p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Endpoint</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded bg-tag-green-bg px-1.5 py-0.5 font-mono text-[10px] text-tag-green-fg">POST</span>
                <code className="font-mono text-xs text-fg">/api/scan</code>
              </div>
              <pre className="mt-4 overflow-x-auto rounded border border-border bg-elevated p-4 font-mono text-[11px] leading-relaxed text-muted">
{`{
  "url": "${SAMPLE_URL}",
  "headers": {},
  "cookies": {},
  "timeout": 25
}`}
              </pre>
              <button
                onClick={runExample}
                disabled={state === 'loading'}
                className="mt-4 bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {state === 'loading' ? 'Fetching…' : 'Run live example'}
              </button>
            </div>

            <div className="rounded-lg border border-border bg-bg p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Response</p>
              <pre className="mt-3 max-h-[420px] overflow-auto rounded border border-border bg-elevated p-4 font-mono text-[11px] leading-relaxed text-muted">
{preview || '// click "Run live example" to see the real detection payload'}
              </pre>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Try it in the browser first</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            The same endpoint powers the product UI. Scan any URL below and the result feeds straight back
            into agents and workflows.
          </p>
          <InlineScan className="mt-6" />
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-14">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {[
              'REST API with granular key scoping',
              'Structured responses designed for agent consumption',
              'Rate tiers from hobby to enterprise throughput',
            ].map((b) => (
              <div key={b} className="bg-bg px-6 py-8">
                <p className="text-sm leading-relaxed text-muted">{b}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
