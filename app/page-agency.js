'use client';
import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import useInView from '../lib/useInView';

const EXAMPLE_SITES = [
  { label: 'github.com', desc: 'Dev platform' },
  { label: 'stripe.com', desc: 'Payments' },
  { label: 'vercel.com', desc: 'Hosting' },
  { label: 'shopify.com', desc: 'E-commerce' },
  { label: 'netflix.com', desc: 'Streaming' },
];

const STEPS = [
  {
    n: '01',
    title: 'Fetch',
    tag: 'HTTP client',
    body: 'Downloads the full HTML with a configurable timeout. No browser overhead.',
    stats: '2.4kb avg \u00b7 8s timeout',
  },
  {
    n: '02',
    title: 'Parse',
    tag: 'DOM analysis',
    body: 'Walks the document tree extracting scripts, meta tags, headers, and CSS.',
    stats: '50+ signals \u00b7 800ms',
  },
  {
    n: '03',
    title: 'Match',
    tag: 'rule engine',
    body: '2,300+ rules fingerprint each technology from the exact HTML signal.',
    stats: '92 categories \u00b7 2,300+ rules',
  },
];

const USE_CASES = [
  { title: 'Security audits', desc: 'Verify headers, CSP, and HTTPS enforcement across your stack.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', span: '' },
  { title: 'Competitive research', desc: 'Compare tech choices across similar products in your market.', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z', span: 'sm:col-span-2' },
  { title: 'Vendor due diligence', desc: 'Validate a vendor stack before committing to a platform.', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z', span: '' },
  { title: 'Portfolio tracking', desc: 'Track technology changes across sites you own or monitor.', icon: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z', span: '' },
  { title: 'Team onboarding', desc: "Get new engineers up to speed on a codebase's external dependencies.", icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z', span: '' },
  { title: 'Market intelligence', desc: 'Discover which platforms and tools dominate a market segment.', icon: 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5', span: '' },
];

export default function Home() {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#050505] text-[#f4f4f5]">
      <Header />

      {/* ── Ambient Background ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0 opacity-[0.35]" />
        <div
          className="absolute -top-[40%] -left-[20%] h-[80vh] w-[80vh] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-[30%] -right-[15%] h-[70vh] w-[70vh] rounded-full opacity-[0.035]"
          style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-[20%] right-[10%] h-[50vh] w-[50vh] rounded-full opacity-[0.025]"
          style={{ background: 'radial-gradient(circle, #c5fb45 0%, transparent 70%)' }}
        />
      </div>

      <main className="relative z-10">

        {/* ════════════════════════════════════════════ HERO ════════════════════════════════════════════ */}
        <section className="mx-auto max-w-7xl px-6 pt-20 pb-24 sm:px-8 sm:pt-28 lg:px-12 lg:pt-36">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">

            {/* Left */}
            <div className="flex-1 space-y-8">
              <HeroReveal delay={0}>
                <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-2 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c5fb45] opacity-40" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c5fb45]" />
                  </span>
                  <TypewriterBadge />
                </div>
              </HeroReveal>

              <HeroReveal delay={0.08}>
                <h1
                  className="font-sans font-bold tracking-tighter leading-[0.9]"
                  style={{ fontSize: 'clamp(3.5rem, 9vw, 10rem)' }}
                >
                  <span className="block text-[#f4f4f5]">What&apos;s it</span>
                  <span className="block bg-gradient-to-r from-[#c5fb45] via-[#c5fb45]/80 to-transparent bg-clip-text text-transparent">
                    built with?
                  </span>
                </h1>
              </HeroReveal>

              <HeroReveal delay={0.16}>
                <p className="max-w-[65ch] text-base leading-relaxed text-[#a1a1aa]">
                  Enter any URL and fingerprint the technologies powering it — frameworks, CMS, analytics, hosting, and more.
                </p>
              </HeroReveal>

              <HeroReveal delay={0.22}>
                <SearchBar />
              </HeroReveal>

              <HeroReveal delay={0.28}>
                <div className="flex flex-wrap items-center gap-2">
                  {EXAMPLE_SITES.map((site) => (
                    <a
                      key={site.label}
                      href={`/results?site=${encodeURIComponent(site.label)}`}
                      className="group flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-2 transition-all duration-300 hover:border-[#c5fb45]/20 hover:bg-[#c5fb45]/[0.04] hover:shadow-[0_0_24px_-4px_rgba(197,251,69,0.12)] active:scale-[0.97]"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${site.label}&sz=32`}
                        alt=""
                        className="h-3.5 w-3.5 rounded-sm"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <span className="font-mono text-xs text-[#a1a1aa] transition-colors group-hover:text-[#f4f4f5]">
                        {site.label}
                      </span>
                      <svg
                        className="h-2.5 w-2.5 text-zinc-600 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#c5fb45]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </a>
                  ))}
                </div>
              </HeroReveal>
            </div>

            {/* Right — Floating glass card */}
            <HeroReveal delay={0.32} className="w-full lg:w-[42%] shrink-0">
              <div className="relative">
                <div className="rounded-[2rem] border border-white/[0.06] bg-white/[0.03] p-[1px]">
                  <div className="rounded-[calc(2rem-1px)] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c5fb45] opacity-30" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c5fb45]" />
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Live Scan Preview</span>
                    </div>
                    <TerminalPreview />
                  </div>
                </div>
                {/* decorative glow behind card */}
                <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.5rem] bg-[#c5fb45]/[0.04] blur-3xl" />
              </div>
            </HeroReveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════ STATS ════════════════════════════════════════════ */}
        <section className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <AnimatedSection delay={0.1}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <DoubleBezelStat label="Detection rules" value={2300} suffix="+" icon="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              <DoubleBezelStat label="Categories" value={92} icon="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              <DoubleBezelStat label="Avg scan time" value={2} suffix="s" icon="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              <DoubleBezelStat label="No signup required" icon="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </div>
          </AnimatedSection>
        </section>

        {/* ════════════════════════════════════════════ USE CASES ════════════════════════════════════════════ */}
        <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-12">
          <AnimatedSection delay={0.05}>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 backdrop-blur-sm">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Use Cases</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Built for <span className="bg-gradient-to-r from-[#c5fb45] to-[#c5fb45]/40 bg-clip-text text-transparent">real workflows</span>
            </h2>
          </AnimatedSection>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((uc, i) => (
              <AnimatedSection key={uc.title} delay={0.08 + i * 0.06}>
                <div className={`group relative ${uc.span}`}>
                  <div className="rounded-[2rem] border border-white/[0.06] bg-white/[0.03] p-[1px] transition-all duration-300 hover:border-white/[0.12]" style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}>
                    <div className="rounded-[calc(2rem-1px)] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] text-[#a1a1aa] transition-colors duration-300 group-hover:border-[#c5fb45]/15 group-hover:text-[#c5fb45]">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d={uc.icon} />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-[#f4f4f5]/90 transition-colors group-hover:text-[#f4f4f5]">{uc.title}</h3>
                      <p className="mt-2 max-w-[50ch] text-sm leading-relaxed text-[#a1a1aa]">{uc.desc}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════ HOW IT WORKS ════════════════════════════════════════════ */}
        <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-12">
          <AnimatedSection delay={0.05}>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 backdrop-blur-sm">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Pipeline</span>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                How the <span className="bg-gradient-to-r from-[#c5fb45] to-[#c5fb45]/40 bg-clip-text text-transparent">engine works</span>
              </h2>
              <p className="max-w-xs text-sm leading-relaxed text-[#a1a1aa]">
                Three stages transform raw HTML into a structured technology report.
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-10 grid gap-5 lg:grid-cols-5">
            <div className="grid gap-5 sm:grid-cols-3 lg:col-span-3">
              {STEPS.map((step, i) => (
                <StepCard key={step.n} step={step} index={i} />
              ))}
            </div>
            <AnimatedSection delay={0.25} className="lg:col-span-2">
              <div className="h-full rounded-[2rem] border border-white/[0.06] bg-white/[0.03] p-[1px]">
                <div className="flex h-full flex-col rounded-[calc(2rem-1px)] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">scanner</span>
                  </div>
                  <TerminalScanner />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ════════════════════════════════════════════ COMPARE ════════════════════════════════════════════ */}
        <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-2">
            <AnimatedSection delay={0.05}>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 backdrop-blur-sm">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Compare</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Side by side <span className="bg-gradient-to-r from-[#c5fb45] to-[#c5fb45]/40 bg-clip-text text-transparent">comparison</span>
              </h2>
              <p className="mt-3 max-w-md text-base leading-relaxed text-[#a1a1aa]">
                Compare tech stacks across multiple sites. See what platforms share and where they differ.
              </p>
              <a
                href="/compare"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-xs font-medium text-[#a1a1aa] transition-all duration-300 hover:border-[#c5fb45]/20 hover:text-[#f4f4f5]"
                style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
              >
                Try it live
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="rounded-[2rem] border border-white/[0.06] bg-white/[0.03] p-[1px]">
                <div className="rounded-[calc(2rem-1px)] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Stack Comparison</span>
                  </div>
                  <ComparePreviewMock />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ════════════════════════════════════════════ EXPORT ════════════════════════════════════════════ */}
        <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-2">
            <AnimatedSection delay={0.05}>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 backdrop-blur-sm">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Export</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Share your <span className="bg-gradient-to-r from-[#c5fb45] to-[#c5fb45]/40 bg-clip-text text-transparent">findings</span>
              </h2>
              <p className="mt-3 max-w-md text-base leading-relaxed text-[#a1a1aa]">
                Export reports as JSON or CSV. Generate PDFs. Embed a live badge on your site or README.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {['JSON export', 'CSV export', 'PDF report', 'Embed badge'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-xs text-[#a1a1aa] transition-all duration-300 hover:border-[#c5fb45]/15 hover:text-[#f4f4f5]"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="flex items-center justify-center">
                <div className="rounded-[2rem] border border-white/[0.06] bg-white/[0.03] p-[1px]">
                  <div className="rounded-[calc(2rem-1px)] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Badge Preview</div>
                    <div className="inline-flex items-center gap-3 rounded-2xl border border-[#c5fb45]/20 bg-[#c5fb45]/[0.06] px-5 py-3 shadow-[0_4px_24px_-4px_rgba(197,251,69,0.12)]">
                      <svg className="h-5 w-5 text-[#c5fb45]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 7l8-4 8 4-8 4-8-4z" />
                      </svg>
                      <span className="font-sans text-sm font-semibold text-[#f4f4f5]">github.com</span>
                      <span className="rounded-full bg-[#c5fb45]/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#c5fb45]">medium</span>
                    </div>
                    <div className="mt-4 font-mono text-[10px] text-zinc-600">
                      Embed this badge in your README or site
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

      </main>

      <LiveStatusBar />
      <Footer />
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════════════════════════════════
   INTERNAL COMPONENTS
   ═════════════════════════════════════════════════════════════════════════════════════════════════════════ */

function TypewriterBadge() {
  const text = 'Live scanning \u00b7 v1.0';
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 45);
    return () => clearInterval(interval);
  }, []);
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
      {displayed}<span className="typewriter-cursor" />
    </span>
  );
}

function HeroReveal({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      className={inView ? `animate-fade-in-view ${className}` : `opacity-0 ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

function AnimatedSection({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      className={inView ? `animate-fade-in-view ${className}` : `opacity-0 ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ threshold: 0.5 });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function DoubleBezelStat({ label, value, suffix = '', icon }) {
  return (
    <div className="group">
      <div className="rounded-[2rem] border border-white/[0.06] bg-white/[0.03] p-[1px] transition-all duration-300 hover:border-white/[0.12]" style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}>
        <div className="flex flex-col items-center gap-2 rounded-[calc(2rem-1px)] bg-gradient-to-b from-white/[0.04] to-white/[0.01] px-4 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          {icon && (
            <svg className="mb-1 h-5 w-5 text-[#c5fb45]/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
          )}
          {value !== undefined ? (
            <div className="font-mono text-3xl font-bold tracking-tight text-[#f4f4f5] sm:text-4xl">
              <AnimatedCounter end={value} suffix={suffix} />
            </div>
          ) : (
            <div className="flex items-center justify-center font-mono text-3xl font-bold tracking-tight text-[#f4f4f5] sm:text-4xl">
              <svg className="h-7 w-7 text-[#c5fb45]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
          )}
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

function StepCard({ step, index }) {
  const tiltRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [sectionRef, inView] = useInView({ threshold: 0.2 });

  const onMove = (e) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTilt({
      x: -((e.clientY - rect.top) / rect.height - 0.5) * 8,
      y: ((e.clientX - rect.left) / rect.width - 0.5) * 8,
    });
  };

  return (
    <div
      ref={sectionRef}
      className={inView ? 'animate-fade-in-view' : 'opacity-0'}
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      <div
        ref={tiltRef}
        className="rounded-[2rem] border border-white/[0.06] bg-white/[0.03] p-[1px] will-change-transform"
        style={{
          transform: hovered
            ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
            : 'perspective(800px) rotateX(0deg) rotateY(0deg)',
          transition: hovered
            ? 'transform 0.08s cubic-bezier(0.32, 0.72, 0, 1)'
            : 'transform 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      >
        <div className="flex flex-col gap-3 rounded-[calc(2rem-1px)] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#c5fb45]/20 bg-[#c5fb45]/10 font-mono text-xs font-bold text-[#c5fb45] shadow-[inset_0_1px_0_rgba(197,251,69,0.15),0_4px_12px_-2px_rgba(197,251,69,0.12)]">
              {step.n}
            </div>
            <div className="min-w-0 flex-1">
              <span className="rounded-full border border-[#c5fb45]/10 bg-[#c5fb45]/5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[#c5fb45]">
                {step.tag}
              </span>
            </div>
          </div>
          <h3 className="text-base font-semibold tracking-tight text-[#f4f4f5]">{step.title}</h3>
          <p className="max-w-[40ch] text-sm leading-relaxed text-[#a1a1aa]">{step.body}</p>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-600">
            <svg className="h-3 w-3 text-[#c5fb45]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            {step.stats}
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminalPreview() {
  const lines = [
    { prefix: '$', text: 'tsf scan github.com', color: 'text-[#f4f4f5]' },
    { prefix: '>', text: 'Fetching HTML...', color: 'text-zinc-500' },
    { prefix: '>', text: 'Parsing DOM signals...', color: 'text-zinc-500' },
    { prefix: '>', text: 'Matching 2,300+ rules...', color: 'text-zinc-500' },
    { prefix: '', text: '', color: '' },
    { prefix: '+', text: 'React 18', color: 'text-[#c5fb45]' },
    { prefix: '+', text: 'Next.js 14', color: 'text-[#c5fb45]' },
    { prefix: '+', text: 'Tailwind CSS', color: 'text-[#c5fb45]' },
    { prefix: '+', text: 'TypeScript', color: 'text-[#c5fb45]' },
    { prefix: '+', text: 'Vercel', color: 'text-[#c5fb45]' },
    { prefix: '+', text: 'Prisma', color: 'text-[#c5fb45]' },
    { prefix: '', text: '', color: '' },
    { prefix: '>', text: '12 technologies found', color: 'text-zinc-500' },
    { prefix: '>', text: '8 categories matched', color: 'text-zinc-500' },
  ];

  return (
    <div className="rounded-xl bg-[#0a0a0a] p-4 font-mono text-xs leading-relaxed">
      {lines.map((line, i) => (
        <div key={i} className={`flex gap-2 ${line.color} ${line.text ? '' : 'h-3'}`}>
          {line.prefix && (
            <span className={line.prefix === '$' ? 'text-[#c5fb45]' : line.prefix === '+' ? 'text-[#c5fb45]/70' : 'text-zinc-700'}>
              {line.prefix === '$' ? '$' : line.prefix === '+' ? '+' : '\u2022'}
            </span>
          )}
          <span>{line.text}</span>
        </div>
      ))}
      <div className="mt-1 flex gap-2 text-zinc-500">
        <span>$</span>
        <span className="typewriter-cursor" />
      </div>
    </div>
  );
}

function TerminalScanner() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [ref, inView] = useInView({ threshold: 0.3 });

  const LINES = [
    { prefix: '$', text: 'tsf scan stripe.com', cls: 'text-[#f4f4f5]' },
    { prefix: '>', text: 'GET https://stripe.com/', cls: 'text-zinc-500' },
    { prefix: '>', text: '200 OK \u00b7 24.1kb \u00b7 1.2s', cls: 'text-zinc-500' },
    { prefix: '', text: '', cls: '' },
    { prefix: '+', text: 'React 18.2', cls: 'text-[#c5fb45]' },
    { prefix: '+', text: 'Next.js 14', cls: 'text-[#c5fb45]' },
    { prefix: '+', text: 'Tailwind CSS', cls: 'text-[#c5fb45]' },
    { prefix: '+', text: 'TypeScript', cls: 'text-[#c5fb45]' },
    { prefix: '+', text: 'Stripe API', cls: 'text-[#c5fb45]' },
    { prefix: '+', text: 'Vercel', cls: 'text-[#c5fb45]' },
    { prefix: '+', text: 'Google Analytics', cls: 'text-[#c5fb45]' },
    { prefix: '+', text: 'Intercom', cls: 'text-[#c5fb45]' },
    { prefix: '', text: '', cls: '' },
    { prefix: '>', text: '18 technologies \u00b7 92% confidence', cls: 'text-zinc-500' },
    { prefix: '>', text: 'Report ready', cls: 'text-[#c5fb45]' },
  ];

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= LINES.length) clearInterval(timer);
    }, 120);
    return () => clearInterval(timer);
  }, [inView]);

  return (
    <div ref={ref} className="flex-1 overflow-auto rounded-xl bg-[#0a0a0a] p-4 font-mono text-xs leading-relaxed">
      {LINES.slice(0, visibleLines).map((line, i) => (
        <div key={i} className={`flex gap-2 ${line.cls} ${line.text ? '' : 'h-3'}`}>
          {line.prefix && (
            <span className={line.prefix === '$' ? 'text-[#c5fb45]' : line.prefix === '+' ? 'text-[#c5fb45]/70' : 'text-zinc-700'}>
              {line.prefix === '$' ? '$' : line.prefix === '+' ? '+' : '\u2022'}
            </span>
          )}
          <span>{line.text}</span>
        </div>
      ))}
      {visibleLines < LINES.length && visibleLines > 0 && (
        <div className="flex gap-2 text-zinc-500">
          <span>\u2022</span>
          <span className="typewriter-cursor" />
        </div>
      )}
      {visibleLines >= LINES.length && (
        <div className="mt-1 flex gap-2 text-zinc-500">
          <span>$</span>
          <span className="typewriter-cursor" />
        </div>
      )}
    </div>
  );
}

function ComparePreviewMock() {
  const sites = [
    {
      name: 'github.com',
      techs: ['React', 'TypeScript', 'Primer', 'Go', 'Redis'],
    },
    {
      name: 'vercel.com',
      techs: ['Next.js', 'React', 'Tailwind', 'TypeScript', 'Vercel'],
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {sites.map((site) => (
        <div key={site.name} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
          <div className="mb-3 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://www.google.com/s2/favicons?domain=${site.name}&sz=32`}
              alt=""
              className="h-4 w-4 rounded-sm"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="font-mono text-xs text-[#f4f4f5]">{site.name}</span>
          </div>
          <div className="space-y-1.5">
            {site.techs.map((t) => (
              <div key={t} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#c5fb45]/60" />
                <span className="font-mono text-[11px] text-[#a1a1aa]">{t}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="col-span-2 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">
          3 shared \u00b7 2 unique
        </span>
      </div>
    </div>
  );
}

function LiveStatusBar() {
  const [time, setTime] = useState('');
  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const id = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.04] bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-2.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-[#c5fb45] opacity-40" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#c5fb45]" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">System online</span>
        <span className="ml-auto font-mono text-[10px] text-zinc-600">{time}</span>
      </div>
    </div>
  );
}
