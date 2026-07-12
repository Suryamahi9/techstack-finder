const SOCIAL_ICONS = {
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-2.06c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.93 10.93 0 0 1 5.74 0c2.18-1.49 3.14-1.18 3.14-1.18.63 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.68 5.38-5.24 5.67.42.36.79 1.08.79 2.18v3.23c0 .31.21.66.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  ),
  linkedIn: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
};

export default function CompanyProfile({ company, summary }) {
  const hasAny = company.name || company.description || company.socialLinks?.length > 0 || company.email || company.phone || company.address || company.foundingDate || company.employeeCount || company.industry;

  if (!hasAny) return null;

  return (
    <section className="animate-fade-up overflow-hidden rounded-2xl border border-border bg-elevated p-6 sm:p-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M2 20V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
            <path d="M6 2v4M18 2v4M2 12h20" />
          </svg>
          <span className="font-mono text-sm uppercase tracking-wider text-faint">Company Profile</span>
        </div>
        {summary && (
          <div className="flex items-center gap-4 rounded-xl border border-border bg-bg/50 px-5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-bold text-accent">{summary.total}</span>
              <span className="text-xs text-muted">technologies</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span className="text-faint">{summary.frontend} frontend</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-faint">{summary.backend} backend</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-faint">{summary.infra} infra</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        {company.logo && (
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={company.logo}
              alt={`${company.name || ''} logo`}
              className="h-20 w-20 rounded-2xl border border-border bg-bg object-contain p-2"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          {company.name && (
            <h3 className="break-words text-2xl font-bold tracking-tight">{company.name}</h3>
          )}

          {company.description && (
            <p className="mt-2 max-w-3xl text-sm text-muted leading-relaxed break-words">{company.description}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            {company.industry && (
              <span className="flex items-center gap-2">
                <span className="text-faint">Industry:</span> {company.industry}
              </span>
            )}
            {company.foundingDate && (
              <span className="flex items-center gap-2">
                <span className="text-faint">Founded:</span> {company.foundingDate}
              </span>
            )}
            {company.employeeCount && (
              <span className="flex items-center gap-2">
                <span className="text-faint">Employees:</span> {company.employeeCount}
              </span>
            )}
          </div>

          {(company.email || company.phone || company.address) && (
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {company.email && (
                <a href={`mailto:${company.email}`} className="flex items-center gap-2 text-muted hover:text-accent">
                  <svg className="h-3.5 w-3.5 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 4L12 13 2 4" />
                  </svg>
                  {company.email}
                </a>
              )}
              {company.phone && (
                <span className="flex items-center gap-2 text-muted">
                  <svg className="h-3.5 w-3.5 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {company.phone}
                </span>
              )}
              {company.address && (
                <span className="flex items-center gap-2 text-muted">
                  <svg className="h-3.5 w-3.5 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {company.address}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {company.socialLinks?.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-5">
          <span className="text-xs uppercase tracking-widest text-faint">Find them on</span>
          {company.twitter && (
            <a href={company.twitter} target="_blank" rel="noreferrer" className="social-icon twitter" title="Twitter / X">
              {SOCIAL_ICONS.twitter}
            </a>
          )}
          {company.github && (
            <a href={company.github} target="_blank" rel="noreferrer" className="social-icon github" title="GitHub">
              {SOCIAL_ICONS.github}
            </a>
          )}
          {company.linkedIn && (
            <a href={company.linkedIn} target="_blank" rel="noreferrer" className="social-icon linkedin" title="LinkedIn">
              {SOCIAL_ICONS.linkedIn}
            </a>
          )}
          {company.facebook && (
            <a href={company.facebook} target="_blank" rel="noreferrer" className="social-icon facebook" title="Facebook">
              {SOCIAL_ICONS.facebook}
            </a>
          )}
          {company.youtube && (
            <a href={company.youtube} target="_blank" rel="noreferrer" className="social-icon youtube" title="YouTube">
              {SOCIAL_ICONS.youtube}
            </a>
          )}
          {company.instagram && (
            <a href={company.instagram} target="_blank" rel="noreferrer" className="social-icon instagram" title="Instagram">
              {SOCIAL_ICONS.instagram}
            </a>
          )}
        </div>
      )}
    </section>
  );
}
