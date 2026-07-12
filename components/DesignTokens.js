'use client';
import { useState, useMemo } from 'react';

function extractColors(categories, pageMetadata) {
  const colors = new Map();

  const cssVars = [
    { name: '--accent', fallback: '#8b5cf6' },
    { name: '--bg', fallback: '#0a0a0f' },
    { name: '--fg', fallback: '#f8fafc' },
    { name: '--border', fallback: '#1e293b' },
  ];

  cssVars.forEach((v) => colors.set(v.name, v.fallback));

  const brandIndicators = categories?.flatMap((c) =>
    c.technologies.filter((t) => ['Tailwind CSS', 'Bootstrap', 'Material UI', 'Chakra UI', 'Ant Design'].includes(t.name)).map((t) => t.name)
  ) || [];

  return Object.fromEntries(colors);
}

function extractFonts(pageMetadata, categories) {
  const fonts = [];

  const fontTechs = categories?.flatMap((c) =>
    c.technologies.filter((t) => ['Google Fonts', 'Font Awesome'].includes(t.name)).map((t) => t.name)
  ) || [];

  if (fontTechs.includes('Google Fonts')) {
    fonts.push({ name: 'System Font Stack', source: 'Google Fonts', weights: ['400', '500', '600', '700'] });
  }

  fonts.push({ name: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto', source: 'System', weights: ['400', '500', '600'] });

  return fonts;
}

function TokenRow({ token, value, type }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isColor = type === 'color' && (value.startsWith('#') || value.startsWith('rgb'));

  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 transition-all hover:border-border hover:bg-bg/50 w-full text-left"
    >
      {isColor && (
        <div className="h-4 w-4 shrink-0 rounded-md border border-border" style={{ background: value }} />
      )}
      <span className="font-mono text-[11px] text-muted truncate flex-1">{token}</span>
      <span className="font-mono text-[10px] text-faint truncate">{value}</span>
      {copied && <span className="text-[9px] text-accent">copied</span>}
    </button>
  );
}

export default function DesignTokens({ categories, pageMetadata }) {
  const [activeTab, setActiveTab] = useState('css');

  const tokens = useMemo(() => {
    const colors = {};
    const fonts = [];

    // Extract from technologies
    const hasTailwind = categories?.some((c) => c.technologies.some((t) => t.name === 'Tailwind CSS'));
    const hasBootstrap = categories?.some((c) => c.technologies.some((t) => t.name === 'Bootstrap'));
    const hasMaterialUI = categories?.some((c) => c.technologies.some((t) => t.name === 'Material UI'));
    const hasGoogleFonts = categories?.some((c) => c.technologies.some((t) => t.name === 'Google Fonts'));
    const hasFontAwesome = categories?.some((c) => c.technologies.some((t) => t.name === 'Font Awesome'));

    // Common design tokens
    colors['--color-primary'] = hasMaterialUI ? '#1976d2' : '#8b5cf6';
    colors['--color-primary-hover'] = hasMaterialUI ? '#1565c0' : '#7c3aed';
    colors['--color-background'] = '#ffffff';
    colors['--color-surface'] = '#f8fafc';
    colors['--color-text'] = '#0f172a';
    colors['--color-text-secondary'] = '#64748b';
    colors['--color-border'] = '#e2e8f0';
    colors['--color-success'] = '#10b981';
    colors['--color-warning'] = '#f59e0b';
    colors['--color-error'] = '#ef4444';

    if (hasTailwind) {
      colors['--spacing-unit'] = '4px';
      colors['--border-radius'] = '0.5rem';
      colors['--font-size-xs'] = '0.75rem';
      colors['--font-size-sm'] = '0.875rem';
      colors['--font-size-base'] = '1rem';
      colors['--font-size-lg'] = '1.125rem';
      colors['--font-size-xl'] = '1.25rem';
    } else {
      colors['--spacing-unit'] = '8px';
      colors['--border-radius'] = '0.375rem';
      colors['--font-size-xs'] = '0.75rem';
      colors['--font-size-sm'] = '0.875rem';
      colors['--font-size-base'] = '1rem';
      colors['--font-size-lg'] = '1.125rem';
    }

    // Fonts
    fonts.push({ name: 'Primary', value: hasGoogleFonts ? '"Inter", system-ui, sans-serif' : 'system-ui, -apple-system, sans-serif' });
    fonts.push({ name: 'Monospace', value: hasFontAwesome ? '"Fira Code", monospace' : 'ui-monospace, monospace' });
    fonts.push({ name: 'Display', value: hasGoogleFonts ? '"Inter", system-ui, sans-serif' : 'system-ui, sans-serif' });

    return { colors, fonts };
  }, [categories]);

  const tabs = [
    { id: 'css', label: 'CSS Variables' },
    { id: 'figma', label: 'Figma Tokens' },
    { id: 'json', label: 'JSON' },
  ];

  const generateFigma = () => {
    let out = '{\n  "color": {\n';
    Object.entries(tokens.colors || {}).forEach(([key, val]) => {
      if (key.startsWith('--color')) {
        const name = key.replace('--color-', '');
        out += `    "${name}": { "value": "${val}", "type": "color" },\n`;
      }
    });
    out += '  },\n  "spacing": {\n';
    Object.entries(tokens.colors || {}).forEach(([key, val]) => {
      if (key.startsWith('--spacing') || key.startsWith('--border-radius') || key.startsWith('--font-size')) {
        const name = key.replace('--', '');
        out += `    "${name}": { "value": "${val}", "type": "dimension" },\n`;
      }
    });
    out += '  },\n  "typography": {\n';
    (tokens.fonts || []).forEach((f) => {
      out += `    "${f.name}": { "value": "${f.value}", "type": "fontFamily" },\n`;
    });
    out += '  }\n}';
    return out;
  };

  const generateJSON = () => {
    return JSON.stringify({ colors: tokens.colors, fonts: tokens.fonts }, null, 2);
  };

  const generateCSS = () => {
    let css = ':root {\n';
    Object.entries(tokens.colors).forEach(([key, val]) => {
      css += `  ${key}: ${val};\n`;
    });
    tokens.fonts.forEach((f) => {
      css += `  --font-${f.name.toLowerCase().replace(/\s+/g, '-')}: ${f.value};\n`;
    });
    css += '}';
    return css;
  };

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="13.5" cy="6.5" r="2.5" />
          <circle cx="17.5" cy="15.5" r="2.5" />
          <circle cx="8.5" cy="15.5" r="2.5" />
        </svg>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Design Tokens</h3>
      </div>

      <div className="mb-3 flex gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-accent/10 text-accent border border-accent/30'
                : 'text-faint hover:text-muted border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-bg/80 overflow-hidden">
        <pre className="overflow-x-auto p-3 text-[11px] leading-relaxed text-muted max-h-[300px] overflow-y-auto">
          <code>{activeTab === 'css' ? generateCSS() : activeTab === 'figma' ? generateFigma() : generateJSON()}</code>
        </pre>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-faint">Colors</div>
        <div className="space-y-0.5">
          {Object.entries(tokens.colors).filter(([k]) => k.startsWith('--color')).map(([key, val]) => (
            <TokenRow key={key} token={key} value={val} type="color" />
          ))}
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-faint">Typography</div>
        <div className="space-y-0.5">
          {tokens.fonts.map((f) => (
            <TokenRow key={f.name} token={`--font-${f.name.toLowerCase()}`} value={f.value} type="font" />
          ))}
        </div>
      </div>
    </div>
  );
}
