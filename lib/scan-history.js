'use client';

const HISTORY_KEY = 'tsf-scan-history';

export function getScanHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveScanSnapshot(data) {
  const history = getScanHistory();
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    domain: data.site?.domain,
    url: data.site?.url,
    favicon: data.site?.favicon,
    scannedAt: data.site?.scannedAt,
    total: data.summary?.total || 0,
    frontend: data.summary?.frontend || 0,
    backend: data.summary?.backend || 0,
    infra: data.summary?.infra || 0,
    categories: (data.categories || []).map((cat) => ({
      category: cat.category,
      technologies: cat.technologies.map((t) => ({
        name: t.name,
        type: t.type,
        confidence: t.confidence,
        detectedVia: t.detectedVia,
        version: t.version,
      })),
    })),
    summary: data.summary,
    company: data.company,
    seo: data.seo,
    performance: data.performance,
    security: data.security,
    pageMetadata: data.pageMetadata,
    responseHeaders: data.responseHeaders,
  };

  history.unshift(entry);
  if (history.length > 50) history.splice(50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  window.dispatchEvent(new Event('tsf-scan-history-updated'));
  return entry;
}

export function getHistoryForDomain(domain) {
  return getScanHistory().filter((h) => h.domain === domain);
}

export function diffScans(oldScan, newScan) {
  const oldTechs = new Set();
  const newTechs = new Set();
  const oldTechMap = {};
  const newTechMap = {};

  (oldScan?.categories || []).forEach((cat) => {
    cat.technologies.forEach((t) => {
      oldTechs.add(t.name);
      oldTechMap[t.name] = { ...t, category: cat.category };
    });
  });

  (newScan?.categories || []).forEach((cat) => {
    cat.technologies.forEach((t) => {
      newTechs.add(t.name);
      newTechMap[t.name] = { ...t, category: cat.category };
    });
  });

  const added = [...newTechs].filter((n) => !oldTechs.has(n)).map((n) => newTechMap[n]);
  const removed = [...oldTechs].filter((n) => !newTechs.has(n)).map((n) => oldTechMap[n]);
  const unchanged = [...newTechs].filter((n) => oldTechs.has(n)).map((n) => newTechMap[n]);

  return { added, removed, unchanged, oldTotal: oldTechs.size, newTotal: newTechs.size };
}

export function clearScanHistory() {
  localStorage.removeItem(HISTORY_KEY);
  window.dispatchEvent(new Event('tsf-scan-history-updated'));
}
