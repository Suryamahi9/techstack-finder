export default function Skeleton() {
  return (
    <div className="animate-fade-in">
      <div className="skeleton h-32 rounded-2xl" />

      <div className="mt-8 space-y-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border-t border-border pt-8">
            <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
              <div>
                <div className="skeleton h-6 w-32 rounded" />
                <div className="skeleton mt-2 h-3 w-20 rounded" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((j) => (
                  <div key={j} className="skeleton h-20 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
