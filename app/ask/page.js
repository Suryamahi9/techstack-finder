'use client';
import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import InlineScan from '../../components/InlineScan';

const SUGGESTIONS = [
  'What is the stack behind vercel.com?',
  'Which of these stores run on Shopify?',
  'Is example.com using a CMS?',
  'What hosts the most popular sites here?',
];

export default function AskPage() {
  const [suggestion, setSuggestion] = useState('');

  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pt-28 sm:pt-32">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Products</p>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl font-normal tracking-tight text-fg sm:text-5xl">
            TechStack Finder
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
            Ask questions about any site or market in plain English — the detection engine answers with the
            exact technologies and the evidence behind them.
          </p>
        </div>

        <section className="mx-auto max-w-6xl px-6 pt-10">
          <div className="rounded-lg border border-border bg-bg p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
              Try a real question — paste a URL below
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSuggestion(s)}
                  className="border border-border bg-surface px-2.5 py-1 font-mono text-[10px] text-muted transition-colors hover:border-border-strong hover:text-fg"
                >
                  {s}
                </button>
              ))}
            </div>
            <InlineScan url={suggestion.startsWith('http') ? '' : 'https://vercel.com'} className="mt-6" />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-10">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {[
              'Natural-language queries over live technology data',
              'Answers with the exact sites and evidence behind them',
              'Save queries and re-run them on fresh data',
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
