// Scan trend tracking (localStorage-backed) shared between the results page
// and the Trends page. Kept out of the trends page component so importing it
// does not bundle the entire page into another route.

const TRENDS_KEY = 'tsf-scan-trends';

export function getScanTrends() {
  try {
    return JSON.parse(localStorage.getItem(TRENDS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveScanTrend(entry) {
  const trends = getScanTrends();
  trends.push(entry);
  if (trends.length > 50) trends.splice(0, trends.length - 50);
  localStorage.setItem(TRENDS_KEY, JSON.stringify(trends));
}
