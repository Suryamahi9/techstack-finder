import CategoryIcon from './CategoryIcon';
import TechCard from './TechCard';

export default function CategorySection({ category, technologies, index }) {
  return (
    <section
      className="border-t border-border py-10 animate-fade-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="grid gap-6 sm:grid-cols-[180px_1fr] sm:gap-8">
        <div className="sticky top-20 self-start">
          <div className="flex items-center gap-2.5">
            <span className="text-accent">
              <CategoryIcon category={category} className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-semibold tracking-tight">{category}</h3>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted">
            <span className="font-mono text-accent">{technologies.length}</span>
            <span>{technologies.length === 1 ? 'technology' : 'technologies'} detected</span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {technologies.map((tech, i) => (
            <TechCard key={tech.name} tech={tech} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
