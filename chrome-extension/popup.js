const API_BASE = 'https://techstack-finder.vercel.app';

const scanBtn = document.getElementById('scanBtn');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const error = document.getElementById('error');
const currentUrlEl = document.getElementById('currentUrl');
const techGrid = document.getElementById('techGrid');
const summaryRows = document.getElementById('summaryRows');
const scoreFill = document.getElementById('scoreFill');
const scoreLabel = document.getElementById('scoreLabel');
const fullReportLink = document.getElementById('fullReportLink');
const historyBtn = document.getElementById('historyBtn');

let currentDomain = '';

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function scoreColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

function renderResults(data) {
  const score = data.healthScore || 0;
  scoreFill.style.width = score + '%';
  scoreFill.style.backgroundColor = scoreColor(score);
  scoreLabel.textContent = score;
  scoreLabel.style.color = scoreColor(score);

  techGrid.innerHTML = '';
  const cats = (data.categories || []).slice(0, 12);
  cats.forEach(cat => {
    cat.technologies.forEach(t => {
      const typeClass = t.type === 'frontend' ? 'frontend' : t.type === 'backend' ? 'backend' : 'infra';
      const badge = document.createElement('span');
      badge.className = `tech-badge ${typeClass}`;
      badge.textContent = t.name;
      techGrid.appendChild(badge);
    });
  });

  summaryRows.innerHTML = '';
  const rows = [
    ['Technologies', data.summary?.total || 0],
    ['Frontend', data.summary?.frontend || 0],
    ['Backend', data.summary?.backend || 0],
    ['Infrastructure', data.summary?.infra || 0],
    ['Categories', data.summary?.categories || 0],
  ];
  if (data.cveSummary && data.cveSummary.totalCves > 0) {
    rows.push(['Known CVEs', data.cveSummary.totalCves]);
  }
  if (data.dnsTls?.tls?.issuer) {
    rows.push(['TLS Issuer', data.dnsTls.tls.issuer]);
  }
  rows.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'summary-row';
    row.innerHTML = `<span>${label}</span><span>${value}</span>`;
    summaryRows.appendChild(row);
  });

  fullReportLink.href = `${API_BASE}/results?site=${encodeURIComponent(currentDomain)}`;

  loading.classList.remove('active');
  results.classList.add('active');
  error.classList.remove('active');

  chrome.storage.local.get('scanHistory', (result) => {
    const history = result.scanHistory || [];
    history.unshift({
      domain: currentDomain,
      scannedAt: new Date().toISOString(),
      total: data.summary?.total || 0,
      score: score,
    });
    chrome.storage.local.set({ scanHistory: history.slice(0, 50) });
  });
}

async function scanSite() {
  const tab = await getCurrentTab();
  if (!tab || !tab.url) return;

  currentDomain = getDomain(tab.url);
  currentUrlEl.textContent = currentDomain;

  scanBtn.style.display = 'none';
  loading.classList.add('active');
  results.classList.remove('active');
  error.classList.remove('active');

  try {
    const res = await fetch(`${API_BASE}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: currentDomain }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || `Scan failed (${res.status})`);
    }
    renderResults(data);
  } catch (err) {
    loading.classList.remove('active');
    error.textContent = err.message || 'Scan failed. Try again.';
    error.classList.add('active');
    scanBtn.style.display = 'flex';
  }
}

historyBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: `${API_BASE}/history` });
});

scanBtn.addEventListener('click', scanSite);

getCurrentTab().then(tab => {
  if (tab && tab.url) {
    currentDomain = getDomain(tab.url);
    currentUrlEl.textContent = currentDomain;
  }
});
