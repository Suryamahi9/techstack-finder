'use client';

const RULES = [
  { id: 'img-alt', severity: 'critical', title: 'Images without alt text', description: 'All images must have an alt attribute for screen readers.' },
  { id: 'link-empty', severity: 'critical', title: 'Empty links', description: 'Links must have discernible text content.' },
  { id: 'label', severity: 'critical', title: 'Form inputs without labels', description: 'Form elements must have an associated label.' },
  { id: 'html-lang', severity: 'serious', title: 'Missing html lang attribute', description: 'The <html> element must have a lang attribute.' },
  { id: 'viewport', severity: 'serious', title: 'Viewport disables zooming', description: 'Users must be able to zoom the page.' },
  { id: 'heading-order', severity: 'moderate', title: 'Heading levels skipped', description: 'Heading levels should not skip (e.g., h1 → h3).' },
  { id: 'duplicate-id', severity: 'serious', title: 'Duplicate IDs', description: 'ID attributes must be unique across the page.' },
  { id: 'link-name', severity: 'critical', title: 'Links without accessible name', description: 'Links must have text, aria-label, or an image with alt.' },
  { id: 'document-title', severity: 'serious', title: 'Missing document title', description: 'Pages must have a <title> element.' },
  { id: 'meta-viewport', severity: 'serious', title: 'Missing viewport meta tag', description: 'A viewport meta tag is required for responsive design.' },
  { id: 'skip-link', severity: 'moderate', title: 'No skip navigation link', description: 'A "skip to content" link helps keyboard users navigate.' },
  { id: 'aria-hidden', severity: 'moderate', title: 'Interactive elements hidden from assistive tech', description: 'aria-hidden="true" on focusable elements blocks screen readers.' },
  { id: 'tabindex', severity: 'moderate', title: 'Positive tabindex values', description: 'Positive tabindex disrupts natural tab order.' },
  { id: 'autoplay', severity: 'serious', title: 'Autoplaying media', description: 'Auto-playing audio or video can disorient users.' },
  { id: 'color-contrast', severity: 'moderate', title: 'Low contrast text', description: 'Text should have sufficient color contrast (4.5:1 minimum).' },
];

function ViolationBadge({ severity }) {
  const colors = {
    critical: 'bg-red-500/15 text-red-400 border-red-500/20',
    serious: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    moderate: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colors[severity] || colors.moderate}`}>
      {severity}
    </span>
  );
}

export default function AccessibilityReport({ a11y }) {
  if (!a11y) return null;

  const violations = RULES.filter((rule) => a11y[rule.id]);
  const passed = RULES.length - violations.length;
  const score = Math.round((passed / RULES.length) * 100);

  const gradeColors = {
    90: 'text-emerald-400',
    75: 'text-amber-400',
    50: 'text-orange-400',
    0: 'text-red-400',
  };
  const gradeColor = Object.entries(gradeColors)
    .sort((a, b) => b[0] - a[0])
    .find(([min]) => score >= parseInt(min))?.[1] || 'text-muted';

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="8" r="2" />
            <path d="M8 20c0-2.2 1.8-4 4-4s4 1.8 4 4" />
          </svg>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Accessibility</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-mono text-lg font-bold ${gradeColor}`}>{score}%</span>
          <span className="text-[10px] text-faint">{passed}/{RULES.length} passed</span>
        </div>
      </div>

      {violations.length === 0 ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
          <svg className="mx-auto mb-2 h-6 w-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </svg>
          <p className="text-xs font-medium text-emerald-400">No violations detected</p>
          <p className="mt-1 text-[10px] text-muted">All {RULES.length} checks passed</p>
        </div>
      ) : (
        <div className="space-y-2">
          {violations.map((rule) => (
            <div
              key={rule.id}
              className="rounded-lg border border-border bg-bg/50 px-3 py-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-fg">{rule.title}</span>
                <ViolationBadge severity={rule.severity} />
              </div>
              <p className="mt-1 text-[11px] text-muted leading-relaxed">{rule.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {['critical', 'serious', 'moderate'].map((sev) => {
          const count = violations.filter((v) => v.severity === sev).length;
          return (
            <div key={sev} className="rounded-lg border border-border bg-bg/30 px-2 py-1.5">
              <div className="font-mono text-sm font-bold text-fg">{count}</div>
              <div className="text-[9px] uppercase tracking-wider text-faint">{sev}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
