import CategoryIcon from './CategoryIcon';

const CATEGORY_COLORS = {
  'Frontend Framework': 'text-cyan-300',
  'CSS Framework': 'text-cyan-400',
  CMS: 'text-emerald-300',
  Analytics: 'text-amber-300',
  'CDN / Hosting': 'text-orange-300',
  'JavaScript Library': 'text-pink-300',
  'Web Server': 'text-violet-300',
  'Payment Processor': 'text-lime-300',
  'Page Builder': 'text-rose-300',
  'Platform / Language': 'text-sky-300',
  'Platform': 'text-sky-300',
  Authentication: 'text-indigo-300',
  'E-Commerce': 'text-teal-300',
  'Customer Support': 'text-yellow-300',
  Marketing: 'text-fuchsia-300',
  'Cookie Consent': 'text-stone-300',
  Security: 'text-red-300',
  Monitoring: 'text-blue-300',
  'Backend Framework': 'text-emerald-400',
  Database: 'text-purple-300',
  'Cloud Platform': 'text-sky-400',
  'Mobile Framework': 'text-cyan-300',
  'Package Manager': 'text-yellow-400',
  'VCS / Git Hosting': 'text-orange-400',
  'CI/CD': 'text-rose-400',
  'Container / Orchestration': 'text-violet-400',
  Testing: 'text-lime-400',
  'API Protocol': 'text-teal-400',
  Advertising: 'text-orange-300',
  Email: 'text-blue-300',
  'Operating System': 'text-stone-300',
  'SSL / TLS': 'text-emerald-300',
  'Font Scripts': 'text-indigo-300',
  'Video Players': 'text-rose-400',
  'Comment Systems': 'text-yellow-400',
  'Charts / Data Visualization': 'text-sky-400',
  'Image CDN': 'text-orange-400',
  Animation: 'text-pink-400',
  Maps: 'text-emerald-400',
  'Rich Text Editor': 'text-violet-400',
  'Blog / Publishing': 'text-fuchsia-400',
  'Project Management': 'text-cyan-400',
  'Social Feeds': 'text-blue-400',
  'Design Tools': 'text-stone-400',
  'JavaScript Graphics': 'text-purple-400',
  Podcasting: 'text-lime-400',
  Search: 'text-teal-400',
  'Forums / Community': 'text-orange-400',
  'LMS / Education': 'text-green-400',
  Documentation: 'text-sky-400',
  'Business Tools': 'text-indigo-400',
  Webmail: 'text-blue-400',
  Captcha: 'text-red-400',
  'Developer Tools': 'text-yellow-400',
  'Cache Tools': 'text-slate-400',
  Infrastructure: 'text-amber-400',
};

const CONFIDENCE_COLORS = {
  high: 'bg-accent text-black',
  medium: 'bg-amber-500 text-black',
  low: 'bg-red-500 text-white',
};

const TYPE_COLORS = {
  frontend: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  backend: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  infra: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
};

export default function TechCard({ tech, index = 0 }) {
  const color = CATEGORY_COLORS[tech.category] || 'text-accent';
  const confColor = CONFIDENCE_COLORS[tech.confidence] || CONFIDENCE_COLORS.medium;
  const typeColor = TYPE_COLORS[tech.type] || TYPE_COLORS.frontend;

  return (
    <div
      className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-elevated p-4 sm:p-5 sm:gap-4 transition-all duration-300 hover:border-border-strong hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)] animate-fade-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`${color} shrink-0 opacity-80 transition-opacity group-hover:opacity-100`}>
            <CategoryIcon category={tech.category} className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <h4 className="break-words font-mono text-sm font-semibold tracking-tight sm:text-base leading-snug transition-colors group-hover:text-fg">
            {tech.name}
          </h4>
          {tech.version && (
            <span className="shrink-0 rounded-md border border-accent/20 bg-accent/8 px-1.5 py-0.5 font-mono text-[10px] text-accent sm:px-2 sm:text-[11px] transition-colors group-hover:bg-accent/12">
              v{tech.version}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 self-start">
          <span className={`${typeColor} rounded-md border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider sm:px-2 sm:text-[10px]`}>
            {tech.type}
          </span>
          <span
            className={`h-2 w-2 shrink-0 rounded-full transition-transform duration-200 group-hover:scale-125 ${
              tech.confidence === 'high' ? 'bg-accent' : tech.confidence === 'medium' ? 'bg-amber-500' : 'bg-red-500'
            }`}
            title={`${tech.confidence} confidence`}
          />
          <span className={`${confColor} rounded-md px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider sm:px-2 sm:text-[10px]`}>
            {tech.confidence}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 border-t border-white/[0.04] pt-2.5">
        <div className="flex items-start gap-1.5 text-xs text-faint">
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-faint/70 mt-0.5">via</span>
          <span className="text-muted leading-relaxed">{tech.detectedVia}</span>
        </div>
      </div>
    </div>
  );
}
