const KNOWN_ADSSP = {
  'google.com': { name: 'Google Ad Manager (DFP)', type: 'SSP' },
  'doubleclick.net': { name: 'Google DoubleClick', type: 'Ad Network' },
  'googlesyndication.com': { name: 'Google AdSense', type: 'Ad Network' },
  'googleadservices.com': { name: 'Google Ads', type: 'Ad Network' },
  'adsenseformobileapps.com': { name: 'Google AdSense (Apps)', type: 'Ad Network' },
  'adnxs.com': { name: 'Xandr (AppNexus)', type: 'SSP' },
  'pubmatic.com': { name: 'PubMatic', type: 'SSP' },
  'openx.com': { name: 'OpenX', type: 'SSP' },
  'rubiconproject.com': { name: 'Magnite (Rubicon)', type: 'SSP' },
  'magnite.com': { name: 'Magnite', type: 'SSP' },
  'spotxchange.com': { name: 'SpotX', type: 'SSP' },
  'spotx.tv': { name: 'SpotX', type: 'SSP' },
  'indexexchange.com': { name: 'Index Exchange', type: 'SSP' },
  'casalemedia.com': { name: 'Index Exchange (Casale)', type: 'SSP' },
  'sharethrough.com': { name: 'Sharethrough', type: 'SSP' },
  'teads.tv': { name: 'Teads', type: 'SSP' },
  'outbrain.com': { name: 'Outbrain', type: 'Native Ad Network' },
  'taboola.com': { name: 'Taboola', type: 'Native Ad Network' },
  'amazon-adsystem.com': { name: 'Amazon Publisher Services', type: 'SSP' },
  'aps.amazon.com': { name: 'Amazon Publisher Services', type: 'SSP' },
  'media.net': { name: 'Media.net', type: 'Ad Network' },
  'yahoo.com': { name: 'Yahoo Ad Network', type: 'Ad Network' },
  'verve.com': { name: 'Verve (InMobi)', type: 'SSP' },
  'smartadserver.com': { name: 'Smart AdServer', type: 'SSP' },
  'criteo.com': { name: 'Criteo', type: 'Ad Network' },
  'criteo.net': { name: 'Criteo', type: 'Ad Network' },
  'twitter.com': { name: 'X (Twitter) Ads', type: 'Social Ad' },
  'ads-twitter.com': { name: 'X (Twitter) Ads', type: 'Social Ad' },
  'facebook.com': { name: 'Meta (Facebook) Ads', type: 'Social Ad' },
  'facebook.net': { name: 'Meta Pixel', type: 'Social Ad' },
  'linkedin.com': { name: 'LinkedIn Ads', type: 'Social Ad' },
  'snap.com': { name: 'Snapchat Ads', type: 'Social Ad' },
  'snapchat.com': { name: 'Snapchat Ads', type: 'Social Ad' },
  'tiktok.com': { name: 'TikTok Ads', type: 'Social Ad' },
  'pinterest.com': { name: 'Pinterest Ads', type: 'Social Ad' },
  'prebid.org': { name: 'Prebid.js (Header Bidding)', type: 'Header Bidding' },
  'prebid.com': { name: 'Prebid', type: 'Header Bidding' },
  'yieldmo.com': { name: 'Yieldmo', type: 'SSP' },
  'sonobi.com': { name: 'Sonobi', type: 'SSP' },
  'triplelift.com': { name: 'TripleLift', type: 'SSP' },
  'freewheel.tv': { name: 'FreeWheel (Comcast)', type: 'SSP' },
  'lijit.com': { name: 'Sovrn (Lijit)', type: 'SSP' },
  'sovrn.com': { name: 'Sovrn', type: 'SSP' },
  'bidswitch.com': { name: 'BidSwitch (IPONWEB)', type: 'SSP' },
  'bidswitch.net': { name: 'BidSwitch', type: 'SSP' },
  'contextweb.com': { name: 'PulsePoint', type: 'SSP' },
  'turn.com': { name: 'Amobee (Turn)', type: 'DSP' },
  'advertising.com': { name: 'AOL Advertising', type: 'Ad Network' },
  'moat.com': { name: 'Oracle Moat (Verification)', type: 'Ad Verification' },
  'moatads.com': { name: 'Oracle Moat', type: 'Ad Verification' },
  'doubleverify.com': { name: 'DoubleVerify', type: 'Ad Verification' },
  'dvtps.com': { name: 'DoubleVerify', type: 'Ad Verification' },
  'adsafeprotected.com': { name: 'IAS (Integral Ad Science)', type: 'Ad Verification' },
  'iasds01.com': { name: 'IAS', type: 'Ad Verification' },
  'confiant.com': { name: 'Confiant', type: 'Ad Quality' },
  'tagger.media': { name: 'Tagger (Sprinklr)', type: 'Influencer Marketing' },
  'gumgum.com': { name: 'GumGum', type: 'SSP' },
  'seedtag.com': { name: 'Seedtag', type: 'Contextual Ad' },
  'braze.com': { name: 'Braze (Appboy)', type: 'Ad Tech' },
  'onesignal.com': { name: 'OneSignal', type: 'Push Notifications' },
  'braintreegateway.com': { name: 'Braintree (PayPal)', type: 'Payments' },
  'stripe.com': { name: 'Stripe', type: 'Payments' },
  'paypal.com': { name: 'PayPal', type: 'Payments' },
  'klarna.com': { name: 'Klarna', type: 'Payments' },
  'affirm.com': { name: 'Affirm', type: 'BNPL' },
};

function parseAdsTxtLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;

  const parts = trimmed.split(',').map(p => p.trim());
  if (parts.length < 3) return null;

  const [domain, account_id, relation, ...optional] = parts;

  if (!domain || !account_id) return null;

  const rel = (relation || '').toUpperCase();
  const relationType = rel === 'DIRECT' ? 'DIRECT' : rel === 'RESELLER' ? 'RESELLER' : 'UNKNOWN';

  return {
    domain: domain.toLowerCase(),
    accountId: account_id,
    relation: relationType,
    tagId: optional[0] || null,
    comment: optional[1] || null,
  };
}

function identifyAdNetwork(domain) {
  const d = domain.toLowerCase();
  for (const [key, info] of Object.entries(KNOWN_ADSSP)) {
    if (d === key || d.endsWith('.' + key) || d.includes(key)) {
      return info;
    }
  }
  return { name: domain, type: 'Unknown SSP' };
}

export async function fetchAdsTxt(origin, proxy) {
  const adsTxtUrl = origin.replace(/\/$/, '') + '/ads.txt';

  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 8000);
    const fetchOpts = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'text/plain, */*',
      },
      signal: ctrl.signal,
    };
    if (proxy) {
      try {
        const { ProxyAgent } = await import('undici');
        fetchOpts.dispatcher = new ProxyAgent(proxy);
      } catch {}
    }
    const res = await fetch(adsTxtUrl, fetchOpts);
    clearTimeout(tid);

    if (!res.ok) return { found: false, entries: [], networks: [], summary: null };

    const text = await res.text();
    const lines = text.split('\n');
    const entries = [];

    for (const line of lines) {
      const entry = parseAdsTxtLine(line);
      if (entry) entries.push(entry);
    }

    const networks = [];
    const seenDomains = new Set();
    for (const entry of entries) {
      if (!seenDomains.has(entry.domain)) {
        seenDomains.add(entry.domain);
        const info = identifyAdNetwork(entry.domain);
        networks.push({
          ...info,
          domain: entry.domain,
          accountIds: entries
            .filter(e => e.domain === entry.domain)
            .map(e => e.accountId),
          relations: [...new Set(entries.filter(e => e.domain === entry.domain).map(e => e.relation))],
        });
      }
    }

    const directCount = entries.filter(e => e.relation === 'DIRECT').length;
    const resellerCount = entries.filter(e => e.relation === 'RESELLER').length;
    const totalSsps = networks.filter(n => n.type === 'SSP').length;
    const totalAdNetworks = networks.filter(n => n.type === 'Ad Network').length;
    const totalSocialAds = networks.filter(n => n.type === 'Social Ad').length;
    const totalNativeAds = networks.filter(n => n.type === 'Native Ad Network').length;
    const hasHeaderBidding = networks.some(n => n.type === 'Header Bidding');
    const hasAdVerification = networks.some(n => n.type === 'Ad Verification');
    const hasPrebid = entries.some(e => e.domain.includes('prebid'));

    const summary = {
      totalEntries: entries.length,
      uniqueDomains: networks.length,
      directCount,
      resellerCount,
      totalSsps,
      totalAdNetworks,
      totalSocialAds,
      totalNativeAds,
      hasHeaderBidding,
      hasPrebid,
      hasAdVerification,
    };

    return {
      found: true,
      url: adsTxtUrl,
      entries,
      networks,
      summary,
    };
  } catch {
    return { found: false, entries: [], networks: [], summary: null };
  }
}

export function adsTxtToTechnologies(adsTxtResult) {
  if (!adsTxtResult || !adsTxtResult.found) return [];
  return adsTxtResult.networks.map(n => ({
    name: n.name,
    category: n.type === 'Social Ad' ? 'Advertising' : 'Advertising',
    detectedVia: 'ads.txt',
    confidence: 'high',
  }));
}
