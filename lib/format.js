// Deterministic number formatting for server-rendered markup.
// Never use locale-sensitive toLocaleString() in shared/client markup —
// Node and browser locales differ and cause hydration mismatches.

export function formatCount(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return String(n ?? '');
  return String(Math.trunc(num)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
