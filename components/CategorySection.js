import CategoryIcon from './CategoryIcon';
import TechCard from './TechCard';

export default function CategorySection({ category, technologies, index }) {
  return (
    <section
      className="border-t border-white/[0.04] pt-8 pb-4 animate-fade-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="grid gap-5 sm:grid-cols-[180px_1fr] sm:gap-8">
        <div className="sticky top-20 self-start">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-accent">
              <CategoryIcon category={category} className="h-4 w-4" />
            </span>
            <h3 className="text-base font-semibold tracking-tight">{category}</h3>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted" style={{ paddingLeft: '2.6rem' }}>
            <span className="font-mono text-accent">{technologies.length}</span>
            <span>{technologies.length === 1 ? 'technology' : 'technologies'}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {technologies.map((tech, i) => (
            <div key={tech.name} className="w-full min-w-[280px] max-w-[420px] flex-1">
              <TechCard tech={tech} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
