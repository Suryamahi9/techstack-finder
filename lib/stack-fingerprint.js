const FINGERPRINT_SEEDS = {
  'React': 0xA1, 'Next.js': 0xB2, 'Vue.js': 0xC3, 'Angular': 0xD4, 'Svelte': 0xE5,
  'Node.js': 0xF6, 'Django': 0x17, 'Rails': 0x28, 'Laravel': 0x39, 'Express': 0x4A,
  'PostgreSQL': 0x5B, 'MongoDB': 0x6C, 'Redis': 0x7D, 'MySQL': 0x8E,
  'Docker': 0x9F, 'Kubernetes': 0xA0, 'AWS': 0xB1, 'Cloudflare': 0xC2, 'Vercel': 0xD3,
  'Tailwind CSS': 0xE4, 'Bootstrap': 0xF5, 'WordPress': 0x16, 'Shopify': 0x27,
  'TypeScript': 0x38, 'Python': 0x49, 'Go': 0x5A, 'Rust': 0x6B, 'PHP': 0x7C,
  'Java': 0x8D, 'C#': 0x9E, 'Ruby': 0xAF,
};

function hashTech(name) {
  let h = FINGERPRINT_SEEDS[name] || 0;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function generateDnaSequence(technologies) {
  const seq = [];
  for (const tech of technologies) {
    const h = hashTech(tech.name);
    const types = ['A', 'T', 'G', 'C'];
    seq.push(types[h % 4]);
    seq.push(types[(h >> 2) % 4]);
    seq.push(types[(h >> 4) % 4]);
  }
  return seq.slice(0, 48).join('');
}

function generateBarcodes(technologies) {
  return technologies.slice(0, 24).map((tech, i) => {
    const h = hashTech(tech.name);
    return {
      name: tech.name,
      width: 1 + (h % 3),
      height: 0.4 + (h % 60) / 100,
      opacity: 0.6 + (h % 40) / 100,
      color: [
        'var(--accent)',
        '#60a5fa',
        '#34d399',
        '#f97316',
        '#a78bfa',
        '#f472b6',
        '#22d3ee',
      ][h % 7],
    };
  });
}

export function generateStackFingerprint(technologies) {
  const dna = generateDnaSequence(technologies);
  const barcodes = generateBarcodes(technologies);
  const totalHash = technologies.reduce((acc, t) => (acc + hashTech(t.name)) | 0, 0);

  const uniqueId = Math.abs(totalHash).toString(16).toUpperCase().padStart(8, '0');

  return {
    dna,
    barcodes,
    uniqueId,
    techCount: technologies.length,
    dominantType: technologies.reduce((acc, t) => {
      const key = t.type || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  };
}
