'use client';

const LOGOS = [
  { name: 'React', color: '#61dafb' },
  { name: 'Node.js', color: '#68a063' },
  { name: 'Python', color: '#3776ab' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'PostgreSQL', color: '#336791' },
  { name: 'Docker', color: '#2496ed' },
  { name: 'AWS', color: '#ff9900' },
  { name: 'Redis', color: '#dc382d' },
  { name: 'GraphQL', color: '#e535ab' },
  { name: 'Vue.js', color: '#42b883' },
  { name: 'Go', color: '#00add8' },
  { name: 'Rust', color: '#dea584' },
];

function FloatingItem({ logo, index }) {
  const duration = 28 + (index % 5) * 6;
  const delay = index * 2;
  const startX = 5 + (index * 17) % 88;

  return (
    <div
      className="pointer-events-none absolute will-change-transform"
      style={{
        left: `${startX}%`,
        animation: `floatUp ${duration}s linear ${delay}s infinite`,
        opacity: 0,
      }}
    >
      <div
        className="flex items-center gap-1.5 rounded-full border border-white/[0.04] bg-white/[0.02] px-2.5 py-1 backdrop-blur-sm"
        style={{ animation: `driftSide ${duration * 0.3}s ease-in-out ${delay}s infinite alternate` }}
      >
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke={logo.color} strokeWidth="1.5" opacity="0.5">
          <circle cx="12" cy="12" r="10" />
        </svg>
        <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: logo.color, opacity: 0.4 }}>
          {logo.name}
        </span>
      </div>
    </div>
  );
}

export default function FloatingLogos() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {LOGOS.map((logo, i) => (
        <FloatingItem key={logo.name} logo={logo} index={i} />
      ))}
    </div>
  );
}
