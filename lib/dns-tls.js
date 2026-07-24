import dns from 'dns';
import tls from 'tls';
import https from 'https';

const SAFE_FETCH = { method: 'HEAD', signal: AbortSignal.timeout(8000) };

export async function inspectDns(domain) {
  const result = {
    a: [],
    aaaa: [],
    cname: null,
    ns: [],
    mx: [],
    txt: [],
    soa: null,
    dnssec: false,
  };

  const resolve = (type) =>
    new Promise((resolve) => {
      const callback = (err, records) => resolve(err ? [] : records);
      try {
        if (type === 'A') dns.resolve(domain, callback);
        else if (type === 'AAAA') dns.resolve6(domain, callback);
        else if (type === 'CNAME') dns.resolveCname(domain, callback);
        else if (type === 'NS') dns.resolveNs(domain, callback);
        else if (type === 'MX') dns.resolveMx(domain, callback);
        else if (type === 'TXT') dns.resolveTxt(domain, callback);
        else if (type === 'SOA') dns.resolveSoa(domain, callback);
        else if (type === 'DNSSEC') dns.resolveDnssec(domain, callback);
        else resolve([]);
      } catch {
        resolve([]);
      }
    });

  const [a, aaaa, cname, ns, mx, txt, soa, dnssec] = await Promise.all([
    resolve('A'),
    resolve('AAAA'),
    resolve('CNAME'),
    resolve('NS'),
    resolve('MX'),
    resolve('TXT'),
    resolve('SOA'),
    resolve('DNSSEC'),
  ]);

  result.a = a;
  result.aaaa = aaaa;
  result.cname = Array.isArray(cname) && cname.length > 0 ? cname[0] : null;
  result.ns = ns;
  result.mx = mx.sort((a, b) => a.priority - b.priority);
  result.txt = txt.map((r) => r.join(' '));
  result.soa = soa;
  result.dnssec = dnssec && dnssec.length > 0;

  return result;
}

export async function inspectTls(domain, port = 443) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(null);
    }, 6000);

    try {
      const socket = tls.connect(
        { host: domain, port, servername: domain, rejectUnauthorized: false, timeout: 5000 },
        () => {
          try {
            const cert = socket.getPeerCertificate();
            if (!cert || !cert.subject) {
              clearTimeout(timeout);
              socket.destroy();
              return resolve(null);
            }

            const parseDate = (d) => {
              try {
                const parts = d.split(' ');
                const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
                return new Date(parseInt(parts[3], 10), months[parts[1]], parseInt(parts[2], 10), ...parts[4].split(':').map(Number));
              } catch {
                return null;
              }
            };

            const notBefore = parseDate(cert.valid_from);
            const notAfter = parseDate(cert.valid_to);
            const now = new Date();
            const daysRemaining = notAfter ? Math.ceil((notAfter - now) / (1000 * 60 * 60 * 24)) : null;

            const result = {
              subject: cert.subject ? {
                cn: cert.subject.CN || null,
                o: cert.subject.O || null,
                c: cert.subject.C || null,
              } : null,
              issuer: cert.issuer ? {
                cn: cert.issuer.CN || null,
                o: cert.issuer.O || null,
              } : null,
              serialNumber: cert.serialNumber || null,
              validFrom: notBefore ? notBefore.toISOString() : null,
              validTo: notAfter ? notAfter.toISOString() : null,
              daysRemaining,
              isExpired: notAfter ? now > notAfter : null,
              isExpiringSoon: daysRemaining !== null && daysRemaining < 30,
              protocol: socket.getProtocol() || null,
              cipher: socket.getCipher() ? {
                name: socket.getCipher().name,
                version: socket.getCipher().version,
                bits: socket.getCipher().bits,
              } : null,
              authorized: socket.authorized,
              authorizationError: socket.authorizationError || null,
              san: cert.subjectaltname ? cert.subjectaltname.split(',').map(s => s.trim().replace('DNS:', '')) : [],
            };

            clearTimeout(timeout);
            socket.destroy();
            resolve(result);
          } catch {
            clearTimeout(timeout);
            socket.destroy();
            resolve(null);
          }
        }
      );

      socket.on('error', () => {
        clearTimeout(timeout);
        resolve(null);
      });
    } catch {
      clearTimeout(timeout);
      resolve(null);
    }
  });
}

function identifyDnsProvider(dnsInfo) {
  const nsText = dnsInfo.ns.join(' ').toLowerCase();
  const cnameText = (dnsInfo.cname || '').toLowerCase();

  const providers = [
    { name: 'Cloudflare', patterns: ['cloudflare', 'ns.cloudflare'] },
    { name: 'AWS Route 53', patterns: ['awsdns', 'amazonaws', 'route53'] },
    { name: 'Google Cloud DNS', patterns: ['googledomains', 'google', 'googl-dns'] },
    { name: 'Azure DNS', patterns: ['azure-dns', 'azure'] },
    { name: 'Fastly', patterns: ['fastly'] },
    { name: 'Vercel', patterns: ['vercel-dns'] },
    { name: 'Netlify', patterns: ['dnsimple', 'netlify'] },
    { name: 'DigitalOcean', patterns: ['digitalocean'] },
    { name: 'Namecheap', patterns: ['namecheaphosting'] },
    { name: 'GoDaddy', patterns: ['domaincontrol', 'godaddy'] },
    { name: 'NS1', patterns: ['ns1'] },
    { name: 'Dyn', patterns: ['dynect', 'dyn'] },
    { name: 'DNSimple', patterns: ['dnsimple'] },
    { name: 'OVH', patterns: ['ovh'] },
  ];

  for (const p of providers) {
    for (const pat of p.patterns) {
      if (nsText.includes(pat) || cnameText.includes(pat)) return p.name;
    }
  }
  return null;
}

function identifySslProvider(tlsInfo) {
  if (!tlsInfo || !tlsInfo.issuer) return null;
  const issuerO = (tlsInfo.issuer.o || '').toLowerCase();
  const issuerCn = (tlsInfo.issuer.cn || '').toLowerCase();
  const text = issuerO + ' ' + issuerCn;

  const providers = [
    { name: "Let's Encrypt", patterns: ["let's encrypt", "letsencrypt", "isrg"] },
    { name: 'Cloudflare', patterns: ['cloudflare'] },
    { name: 'DigiCert', patterns: ['digicert'] },
    { name: 'Sectigo', patterns: ['sectigo', 'comodo'] },
    { name: 'GlobalSign', patterns: ['globalsign'] },
    { name: 'Amazon (ACM)', patterns: ['amazon', 'aws'] },
    { name: 'Google Trust Services', patterns: ['google trust', 'google'] },
    { name: 'Entrust', patterns: ['entrust'] },
    { name: 'GoDaddy', patterns: ['godaddy', 'starfield'] },
    { name: 'GeoTrust', patterns: ['geotrust'] },
    { name: 'Thawte', patterns: ['thawte'] },
    { name: 'RapidSSL', patterns: ['rapidssl', 'geotrust'] },
  ];

  for (const p of providers) {
    for (const pat of p.patterns) {
      if (text.includes(pat)) return p.name;
    }
  }
  return null;
}

function identifyCloudProvider(dnsInfo, tlsInfo) {
  const indicators = [];
  const nsText = dnsInfo.ns.join(' ').toLowerCase();
  const cnameText = (dnsInfo.cname || '').toLowerCase();
  const sanText = (tlsInfo?.san || []).join(' ').toLowerCase();

  if (nsText.includes('cloudflare') || cnameText.includes('cloudflare') || cnameText.includes('.cdn.cloudflare.net')) {
    indicators.push('Cloudflare CDN');
  }
  if (nsText.includes('awsdns') || cnameText.includes('amazonaws') || cnameText.includes('cloudfront')) {
    indicators.push('AWS (CloudFront/Route53)');
  }
  if (nsText.includes('azure') || cnameText.includes('azure')) {
    indicators.push('Azure CDN');
  }
  if (cnameText.includes('fastly') || sanText.includes('fastly')) {
    indicators.push('Fastly CDN');
  }
  if (cnameText.includes('vercel') || cnameText.includes('.vercel.app') || cnameText.includes('.vercel-dns')) {
    indicators.push('Vercel');
  }
  if (cnameText.includes('netlify') || cnameText.includes('.netlify.app')) {
    indicators.push('Netlify');
  }
  if (cnameText.includes('firebaseapp') || cnameText.includes('firebase')) {
    indicators.push('Firebase Hosting');
  }
  if (cnameText.includes('github.io') || cnameText.includes('githubusercontent')) {
    indicators.push('GitHub Pages');
  }
  if (cnameText.includes('googlehosted') || cnameText.includes('google')) {
    indicators.push('Google Cloud');
  }
  if (cnameText.includes('herokuapp') || cnameText.includes('herokudns')) {
    indicators.push('Heroku');
  }
  if (cnameText.includes('pages.dev') || cnameText.includes('workers.dev')) {
    indicators.push('Cloudflare Pages/Workers');
  }
  if (cnameText.includes('surge.sh') || cnameText.includes('surge.sh')) {
    indicators.push('Surge.sh');
  }
  if (cnameText.includes('shopify') || cnameText.includes('myshopify')) {
    indicators.push('Shopify CDN');
  }
  if (cnameText.includes('wpengine') || cnameText.includes('wpenginepowered')) {
    indicators.push('WP Engine');
  }
  if (cnameText.includes('fly.dev') || cnameText.includes('fly.io')) {
    indicators.push('Fly.io');
  }

  return indicators;
}

export async function deepDnsTlsScan(domain) {
  const [dnsInfo, tlsInfo] = await Promise.all([
    inspectDns(domain).catch(() => ({
      a: [], aaaa: [], cname: null, ns: [], mx: [], txt: [], soa: null, dnssec: false,
    })),
    inspectTls(domain).catch(() => null),
  ]);

  const dnsProvider = identifyDnsProvider(dnsInfo);
  const sslProvider = identifySslProvider(tlsInfo);
  const cloudProviders = identifyCloudProvider(dnsInfo, tlsInfo);

  return {
    dns: {
      ...dnsInfo,
      provider: dnsProvider,
    },
    tls: tlsInfo ? {
      ...tlsInfo,
      sslProvider,
    } : null,
    cloudProviders,
    technologies: [
      ...(dnsProvider ? [{ name: dnsProvider + ' DNS', category: 'Infrastructure', detectedVia: 'dns', confidence: 'high' }] : []),
      ...(sslProvider ? [{ name: sslProvider + ' SSL', category: 'SSL / TLS', detectedVia: 'tls', confidence: 'high' }] : []),
      ...cloudProviders.map((cp) => ({
        name: cp,
        category: 'CDN / Hosting',
        detectedVia: 'dns-tls',
        confidence: 'high',
      })),
    ],
  };
}
