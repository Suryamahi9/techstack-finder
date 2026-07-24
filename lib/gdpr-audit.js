const CONSENT_MANAGERS = [
  { name: 'OneTrust', patterns: ['onetrust', 'optanon', 'optanon-wrapper', 'OneTrust', 'onetrust-cmp'] },
  { name: 'Cookiebot', patterns: ['cookiebot', 'CookieConsent', 'cbCookieConsent'] },
  { name: 'TrustArc', patterns: ['trustarc', 'truste', 'truste-cp'] },
  { name: 'Iubenda', patterns: ['iubenda', 'iubenda-cs'] },
  { name: 'CookieYes', patterns: ['cookieyes', 'cky-consent'] },
  { name: 'Complianz', patterns: ['complianz', 'cmplz'] },
  { name: 'Quantcast', patterns: ['quantcast', 'qc-cmp'] },
  { name: 'Usercentrics', patterns: ['usercentrics', 'uc-usercentrics'] },
  { name: 'Didomi', patterns: ['didomi', 'didomi-host'] },
  { name: 'Cookie Information', patterns: ['cookieinformation', 'cookie_info'] },
  { name: 'Osano', patterns: ['osano', 'osano-cmp'] },
  { name: 'Borlabs Cookie', patterns: ['borlabs', 'BorlabsCookie'] },
  { name: 'GDPR Cookie Compliance', patterns: ['moove-gdpr', 'gdpr-cookie'] },
  { name: 'Klaro', patterns: ['klaro', 'klaro-cookie'] },
  { name: 'Civic Cookie Control', patterns: ['civic', 'CivicCookieControl'] },
  { name: 'Cookie Script', patterns: ['cookiescript', 'CookieScript'] },
  { name: 'Cookie Notice', patterns: ['cookie-notice', 'cookieNotice'] },
];

const TRACKER_CATEGORIES = {
  'Analytics': {
    patterns: ['google-analytics', 'googletagmanager', 'gtag', 'ga.js', 'analytics.js', 'analytics',
      'facebook.net/tr', 'fbevents.js', '_gaq', 'fbq', '_fbq', 'hotjar', 'hj(',
      'mixpanel', 'segment.com', 'segment.io', 'amplitude', 'heap', 'posthog',
      'plausible', 'matomo', 'piwik', 'woopra', 'clicky', 'kissmetrics',
      'pardot', 'marketo', 'hubspot', 'intercom'],
    scripts: ['google-analytics.com', 'googletagmanager.com', 'facebook.net', 'hotjar.com',
      'mixpanel.com', 'segment.com', 'segment.io', 'amplitude.com', 'heap.io',
      'posthog.com', 'plausible.io', 'matomo.org', 'piwik.org'],
  },
  'Advertising': {
    patterns: ['googlesyndication', 'doubleclick', 'googleads', 'adsbygoogle',
      'adsense', 'adnxs', 'prebid', 'rubicon', 'pubmatic', 'openx',
      'taboola', 'outbrain', 'amazon-adsystem', 'criteo', 'facebook.net/fbevents',
      'linkedin', 'twitter', 'snap', 'tiktok', 'pinterest', 'bing.com/uet'],
    scripts: ['googlesyndication.com', 'doubleclick.net', 'googleadservices.com',
      'adnxs.com', 'prebid.org', 'rubiconproject.com', 'pubmatic.com',
      'openx.com', 'taboola.com', 'outbrain.com', 'amazon-adsystem.com',
      'criteo.com', 'linkedin.com', 'snap.igodigital.com', 'ads-twitter.com',
      'bat.bing.com'],
  },
  'Social Media': {
    patterns: ['facebook.net', 'connect.facebook', 'platform.twitter', 'widgets.twitter',
      'linkedin.com/insight', 'snapchat.com', 'tiktok.com/i18n/pixel',
      'pinterest.com', 'reddit.com/static', 'whatsapp.com'],
    scripts: ['connect.facebook.net', 'platform.twitter.com', 'snap.com',
      'tiktok.com', 'pinterest.com', 'redditstatic.com'],
  },
  'Marketing': {
    patterns: ['hubspot', 'marketo', 'pardot', 'salesforce', 'intercom',
      'drift', 'crisp', 'zendesk', 'freshdesk', 'tawk',
      'activecampaign', 'mailchimp', 'sendgrid', 'klaviyo'],
    scripts: ['hubspot.com', 'marketo.com', 'pardot.com', 'salesforce.com',
      'intercom.io', 'drift.com', 'crisp.chat', 'zendesk.com',
      'activecampaign.com', 'mailchimp.com', 'sendgrid.com', 'klaviyo.com'],
  },
  'Fingerprinting': {
    patterns: ['fingerprint', 'fingerprintjs', 'canvas.toDataURL', 'webgl',
      'navigator.plugins', 'AudioContext', 'SpeechSynthesis'],
    scripts: ['fingerprint.com', 'fpjs.com'],
  },
  'Session Recording': {
    patterns: ['hotjar', 'fullstory', 'logrocket', 'smartlook', 'clarity',
      'mouseflow', 'luckyorange', 'inspector.realtime'],
    scripts: ['hotjar.com', 'fullstory.com', 'logrocket.com', 'smartlook.com',
      'clarity.ms', 'mouseflow.com', 'luckyorange.com'],
  },
};

function detectConsentManagers(html, cookies, scriptSrcs) {
  const found = [];
  const allText = html.substring(0, 50000).toLowerCase();
  const allScriptText = scriptSrcs.join(' ').toLowerCase();
  const allCookieText = cookies.toLowerCase();

  for (const cm of CONSENT_MANAGERS) {
    for (const p of cm.patterns) {
      if (allText.includes(p.toLowerCase()) || allScriptText.includes(p.toLowerCase())) {
        found.push(cm.name);
        break;
      }
    }
  }

  return [...new Set(found)];
}

function detectTrackers(html, scriptSrcs) {
  const found = {};
  const allText = html.substring(0, 100000).toLowerCase();
  const allScriptText = scriptSrcs.join(' ').toLowerCase();

  for (const [category, info] of Object.entries(TRACKER_CATEGORIES)) {
    const trackers = [];
    for (const pattern of [...info.patterns, ...info.scripts]) {
      if (allText.includes(pattern.toLowerCase()) || allScriptText.includes(pattern.toLowerCase())) {
        trackers.push(pattern);
      }
    }
    if (trackers.length > 0) {
      found[category] = [...new Set(trackers)];
    }
  }

  return found;
}

function detectCMPBanner(html) {
  const patterns = [
    'cookie consent', 'cookie notice', 'cookie policy',
    'we use cookies', 'this site uses cookies', 'accept cookies',
    'reject cookies', 'manage cookies', 'cookie preferences',
    'privacy policy', 'gdpr', 'consent', 'opt-in', 'opt-out',
    'do not sell', 'ccpa', 'data processing',
  ];

  const lower = html.substring(0, 20000).toLowerCase();
  const matches = patterns.filter(p => lower.includes(p));
  return {
    hasBanner: matches.length > 0,
    signals: matches,
  };
}

function checkTrackerOrder(html, scriptSrcs, consentManagers) {
  const hasConsentManager = consentManagers.length > 0;
  if (!hasConsentManager) {
    return {
      compliant: false,
      status: 'no_consent_manager',
      message: 'No consent management platform detected',
      details: 'Trackers may be loading without user consent',
    };
  }

  const trackers = detectTrackers(html, scriptSrcs);
  const trackerCount = Object.values(trackers).flat().length;

  if (trackerCount === 0) {
    return {
      compliant: true,
      status: 'no_trackers',
      message: 'No trackers detected',
      details: 'No third-party tracking scripts were found',
    };
  }

  const consentManagerLower = consentManagers.map(n => n.toLowerCase());
  const htmlLower = html.substring(0, 30000).toLowerCase();

  let consentManagerPosition = -1;
  for (const cm of consentManagerLower) {
    const idx = htmlLower.indexOf(cm);
    if (idx !== -1 && (consentManagerPosition === -1 || idx < consentManagerPosition)) {
      consentManagerPosition = idx;
    }
  }

  const hasDeferredLoading = htmlLower.includes('data-consent') ||
    htmlLower.includes('consent-before') ||
    htmlLower.includes('defer-until-consent') ||
    htmlLower.includes('data-cookies') ||
    htmlLower.includes('consent-mode');

  const status = hasDeferredLoading ? 'partial_deferred' : 'non_compliant';

  return {
    compliant: false,
    status,
    message: hasDeferredLoading
      ? 'Trackers may be partially deferred'
      : 'Trackers appear to load before consent',
    details: `${trackerCount} tracking scripts detected in ${Object.keys(trackers).length} categories. Consent manager (${consentManagers[0]}) present but loading order is unclear.`,
    trackers,
    consentManager: consentManagers[0],
    consentManagerPosition,
    trackerCount,
  };
}

export function auditGdpr(html, cookies, scriptSrcs) {
  const consentManagers = detectConsentManagers(html, cookies, scriptSrcs);
  const trackers = detectTrackers(html, scriptSrcs);
  const cmpBanner = detectCMPBanner(html);
  const trackerOrder = checkTrackerOrder(html, scriptSrcs, consentManagers);

  const trackerCategories = Object.keys(trackers);
  const totalTrackers = Object.values(trackers).flat().length;

  let complianceScore = 50;
  if (consentManagers.length > 0) complianceScore += 20;
  if (cmpBanner.hasBanner) complianceScore += 15;
  if (trackerOrder.compliant) complianceScore += 15;
  if (trackerOrder.status === 'partial_deferred') complianceScore += 5;
  if (totalTrackers === 0) complianceScore = 100;
  if (consentManagers.length === 0 && totalTrackers > 0) complianceScore = 20;

  return {
    consentManagers,
    hasConsentManager: consentManagers.length > 0,
    trackers,
    trackerCategories,
    totalTrackers,
    cmpBanner,
    complianceScore: Math.min(100, complianceScore),
    trackerOrder,
  };
}
