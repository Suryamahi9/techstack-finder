'use client';
import { useState, useCallback } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MergedPdfButton from '../../components/MergedPdfButton';
import Skeleton from '../../components/Skeleton';

async function scan(url) {
  const res = await fetch('/api/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Scan failed');
  return data;
}

function DiffBar({ left, right, total }) {
  if (total === 0) return null;
  const leftPct = (left / total) * 100;
  const rightPct = (right / total) * 100;
  const shared = total - left - right;
  const sharedPct = (shared / total) * 100;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-border">
      <div className="flex h-full">
        {leftPct > 0 && (
          <div
            className="bg-accent"
            style={{ width: `${leftPct}%` }}
            title={`${left} unique to left`}
          />
        )}
        {sharedPct > 0 && (
          <div
            className="bg-sky-400"
            style={{ width: `${sharedPct}%` }}
            title={`${shared} shared`}
          />
        )}
        {rightPct > 0 && (
          <div
            className="bg-emerald-400"
            style={{ width: `${rightPct}%` }}
            title={`${right} unique to right`}
          />
        )}
      </div>
    </div>
  );
}

function SiteColumn({ data, side, loading, error, otherTechs }) {
  const sideColor = side === 'left' ? 'accent' : 'emerald-400';
  const sideBg = side === 'left' ? 'accent' : 'emerald-400';
  const label = side === 'left' ? 'A' : 'B';

  return (
    <div className="flex-1 min-w-0">
      <div className={`mb-4 flex items-center gap-2`}>
        <span className={`flex h-6 w-6 items-center justify-center rounded-md bg-${sideBg}/15 font-mono text-xs font-bold text-${sideColor}`}>
          {label}
        </span>
        {data && (
          <span className="truncate font-mono text-xs text-muted">{data.site?.domain}</span>
        )}
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton />
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-border bg-elevated p-8 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="rounded-2xl border border-border bg-elevated p-5">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="font-mono text-2xl font-bold text-fg">{data.summary?.total || 0}</div>
                <div className="text-[11px] text-faint uppercase tracking-wider">Total Techs</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-fg">{data.summary?.categories || 0}</div>
                <div className="text-[11px] text-faint uppercase tracking-wider">Categories</div>
              </div>
            </div>
            <div className="mt-4 flex justify-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                <span className="text-muted">{data.summary?.frontend || 0} FE</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-muted">{data.summary?.backend || 0} BE</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span className="text-muted">{data.summary?.infra || 0} Infra</span>
              </span>
            </div>
          </div>

          {/* Tech list */}
          {(data.categories || []).map((cat) => (
            <div key={cat.category} className="rounded-2xl border border-border bg-elevated p-5">
              <h3 className="mb-3 font-semibold text-fg">{cat.category}</h3>
              <div className="space-y-2">
                {cat.technologies.map((tech) => {
                  const shared = otherTechs?.has(tech.name.toLowerCase());
                  return (
                    <div
                      key={tech.name}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                        shared
                          ? 'bg-bg text-muted'
                          : `bg-${sideBg}/5 border border-${sideColor}/20 text-fg`
                      }`}
                    >
                      <span className="font-medium">{tech.name}</span>
                      <div className="flex items-center gap-2">
                        {tech.version && (
                          <span className="font-mono text-xs text-faint">{tech.version}</span>
                        )}
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                          tech.type === 'frontend'
                            ? 'bg-sky-400/10 text-sky-400'
                            : tech.type === 'backend'
                            ? 'bg-emerald-400/10 text-emerald-400'
                            : 'bg-amber-400/10 text-amber-400'
                        }`}>
                          {tech.type}
                        </span>
                        {shared ? (
                          <span className="text-[10px] text-faint" title="Shared with other site">both</span>
                        ) : (
                          <span className={`text-[10px] text-${sideColor}`} title="Unique to this site">only</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompareInput({ label, value, onChange, placeholder }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 font-mono text-xs font-bold text-accent">
        {label}
      </span>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 font-mono text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
      />
    </div>
  );
}

export default function CompareContent() {
  const [urlA, setUrlA] = useState('');
  const [urlB, setUrlB] = useState('');
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [errorA, setErrorA] = useState('');
  const [errorB, setErrorB] = useState('');

  const runCompare = useCallback(async () => {
    if (!urlA.trim() || !urlB.trim()) return;
    setDataA(null);
    setDataB(null);
    setErrorA('');
    setErrorB('');
    setLoadingA(true);
    setLoadingB(true);

    const [resultA, resultB] = await Promise.allSettled([
      scan(urlA.trim()).finally(() => setLoadingA(false)),
      scan(urlB.trim()).finally(() => setLoadingB(false)),
    ]);

    if (resultA.status === 'fulfilled') setDataA(resultA.value);
    else setErrorA(resultA.reason?.message || 'Scan failed');

    if (resultB.status === 'fulfilled') setDataB(resultB.value);
    else setErrorB(resultB.reason?.message || 'Scan failed');
  }, [urlA, urlB]);

  const allTechsA = new Set();
  const allTechsB = new Set();
  (dataA?.categories || []).forEach((c) => c.technologies.forEach((t) => allTechsA.add(t.name.toLowerCase())));
  (dataB?.categories || []).forEach((c) => c.technologies.forEach((t) => allTechsB.add(t.name.toLowerCase())));

  const sharedCount = [...allTechsA].filter((t) => allTechsB.has(t)).length;
  const uniqueA = allTechsA.size - sharedCount;
  const uniqueB = allTechsB.size - sharedCount;
  const totalUnique = allTechsA.size + allTechsB.size - sharedCount;
  const similarity = totalUnique > 0 ? Math.round((sharedCount / totalUnique) * 100) : 0;

  const showResults = dataA || dataB || loadingA || loadingB;

  return (
    <div className="relative min-h-screen">
      <Header />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24">
        <div className="mb-8 max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight">Compare Stacks</h1>
          <p className="mt-1 text-sm text-muted">
            Scan two sites side-by-side. Technologies unique to each are highlighted.
          </p>

          <div className="mt-6 space-y-3">
            <CompareInput
              label="A"
              value={urlA}
              onChange={setUrlA}
              placeholder="e.g. https://vercel.com"
            />
            <CompareInput
              label="B"
              value={urlB}
              onChange={setUrlB}
              placeholder="e.g. https://netlify.com"
            />
            <button
              onClick={runCompare}
              disabled={!urlA.trim() || !urlB.trim() || loadingA || loadingB}
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loadingA || loadingB ? 'Scanning…' : 'Compare'}
            </button>
          </div>
        </div>

        {/* Diff summary */}
        {dataA && dataB && (
          <div className="mb-8 rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
            {/* Similarity score */}
            <div className="mb-5 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="relative shrink-0">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke={similarity >= 70 ? '#10b981' : similarity >= 40 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 * (1 - similarity / 100)}
                    transform="rotate(-90 40 40)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-extrabold text-fg">{similarity}%</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-fg">Stack Similarity</h3>
                <p className="mt-1 text-sm text-muted">
                  {similarity >= 70
                    ? 'These sites share a very similar tech stack.'
                    : similarity >= 40
                    ? 'Moderate overlap — some shared technologies.'
                    : 'Very different tech stacks.'}
                </p>
                <p className="mt-1 text-xs text-faint">
                  {sharedCount} of {totalUnique} technologies are shared
                </p>
              </div>
              <MergedPdfButton dataA={dataA} dataB={dataB} />
            </div>

            <div className="flex items-center justify-between text-xs text-muted mb-3">
              <span className="text-accent">{uniqueA} unique to A</span>
              <span className="text-sky-400">{sharedCount} shared</span>
              <span className="text-emerald-400">{uniqueB} unique to B</span>
            </div>
            <DiffBar left={uniqueA} right={uniqueB} total={totalUnique} />
            <div className="mt-3 flex justify-between text-[11px] text-faint">
              <span>{allTechsA.size} total in A</span>
              <span>{allTechsB.size} total in B</span>
            </div>
          </div>
        )}

        {/* Side by side */}
        {showResults && (
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-6">
            <SiteColumn
              data={dataA}
              side="left"
              loading={loadingA}
              error={errorA}
              otherTechs={allTechsB}
            />
            <SiteColumn
              data={dataB}
              side="right"
              loading={loadingB}
              error={errorB}
              otherTechs={allTechsA}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
