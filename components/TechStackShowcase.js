const TECH_LOGOS = [
  { name: 'React', color: '#61dafb', bg: '#61dafb20', shape: 'M12 2L2 7v10l10 5 10-5V7z' },
  { name: 'Next.js', color: '#fff', bg: '#ffffff10', shape: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' },
  { name: 'TypeScript', color: '#3178c6', bg: '#3178c620', shape: 'M2 2h20v20H2z' },
  { name: 'Node.js', color: '#68a063', bg: '#68a06320', shape: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' },
  { name: 'Python', color: '#3776ab', bg: '#3776ab20', shape: 'M4 4h16v16H4z' },
  { name: 'Go', color: '#00add8', bg: '#00add820', shape: 'M2 12l10-8 10 8-10 8z' },
  { name: 'Rust', color: '#dea584', bg: '#dea58420', shape: 'M12 2L2 7v10l10 5 10-5V7z' },
  { name: 'Vue', color: '#42b883', bg: '#42b88320', shape: 'M12 2L2 7v10l10 5 10-5V7z' },
  { name: 'Angular', color: '#dd0031', bg: '#dd003120', shape: 'M4 4h16v16H4z' },
  { name: 'Svelte', color: '#ff3e00', bg: '#ff3e0020', shape: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' },
  { name: 'Docker', color: '#2496ed', bg: '#2496ed20', shape: 'M2 12l10-8 10 8-10 8z' },
  { name: 'Kubernetes', color: '#326ce5', bg: '#326ce520', shape: 'M12 2L2 7v10l10 5 10-5V7z' },
  { name: 'PostgreSQL', color: '#336791', bg: '#33679120', shape: 'M4 4h16v16H4z' },
  { name: 'MongoDB', color: '#47a248', bg: '#47a24820', shape: 'M2 12l10-8 10 8-10 8z' },
  { name: 'Redis', color: '#dc382d', bg: '#dc382d20', shape: 'M12 2L2 7v10l10 5 10-5V7z' },
  { name: 'GraphQL', color: '#e535ab', bg: '#e535ab20', shape: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' },
  { name: 'AWS', color: '#ff9900', bg: '#ff990020', shape: 'M2 2h20v20H2z' },
  { name: 'Tailwind', color: '#38bdf8', bg: '#38bdf820', shape: 'M2 12l10-8 10 8-10 8z' },
  { name: 'Prisma', color: '#2d3748', bg: '#2d374820', shape: 'M12 2L2 7v10l10 5 10-5V7z' },
  { name: 'Stripe', color: '#635bff', bg: '#635bff20', shape: 'M4 4h16v16H4z' },
];

export default function TechStackShowcase() {
  return (
    <div className="relative">
      <div className="mx-auto grid max-w-3xl grid-cols-5 gap-2 sm:grid-cols-10">
        {TECH_LOGOS.map((tech) => (
          <div
            key={tech.name}
            className="group relative flex items-center justify-center rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 transition-all duration-300 hover:scale-110 hover:border-white/[0.12] hover:bg-white/[0.04]"
          >
            <svg
              className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              stroke={tech.color}
              strokeWidth="1.5"
              opacity="0.6"
            >
              <path d={tech.shape} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 transition-all duration-200 group-hover:top-[-32px] group-hover:opacity-100">
              <div className="whitespace-nowrap rounded-lg border border-white/[0.06] bg-zinc-950 px-2 py-1 text-[9px] text-fg/80 shadow-xl">
                {tech.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
