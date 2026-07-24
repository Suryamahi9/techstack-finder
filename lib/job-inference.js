const JOB_TECH_SIGNALS = {
  'React': { keywords: ['react', 'reactjs', 'react.js', 'react developer', 'react hooks', 'react native'], weight: 10 },
  'Next.js': { keywords: ['nextjs', 'next.js', 'next js', 'next developer'], weight: 10 },
  'Vue.js': { keywords: ['vue', 'vuejs', 'vue.js', 'vue developer', 'vuejs developer', 'nuxt'], weight: 10 },
  'Angular': { keywords: ['angular', 'angularjs', 'angular developer', 'angular 2+'], weight: 10 },
  'Node.js': { keywords: ['nodejs', 'node.js', 'node js', 'node developer', 'express.js', 'expressjs'], weight: 9 },
  'TypeScript': { keywords: ['typescript', 'typescript developer', 'ts'], weight: 8 },
  'Python': { keywords: ['python', 'python developer', 'django', 'flask', 'fastapi'], weight: 9 },
  'Java': { keywords: ['java', 'java developer', 'spring boot', 'spring framework', 'j2ee'], weight: 9 },
  'Go': { keywords: ['golang', 'go developer', 'go language'], weight: 8 },
  'Rust': { keywords: ['rust', 'rust developer', 'rustlang'], weight: 8 },
  'Ruby': { keywords: ['ruby', 'ruby on rails', 'rails developer', 'ruby developer'], weight: 8 },
  'PHP': { keywords: ['php', 'php developer', 'laravel', 'symfony', 'wordpress developer'], weight: 8 },
  'C#': { keywords: ['c#', 'csharp', 'c sharp', '.net developer', 'asp.net', 'dotnet'], weight: 8 },
  'Swift': { keywords: ['swift', 'swiftui', 'ios developer', 'swift developer'], weight: 8 },
  'Kotlin': { keywords: ['kotlin', 'kotlin developer', 'android developer'], weight: 7 },
  'Docker': { keywords: ['docker', 'dockerfile', 'docker-compose', 'containerization'], weight: 7 },
  'Kubernetes': { keywords: ['kubernetes', 'k8s', 'kubectl', 'helm', 'k8s developer'], weight: 9 },
  'AWS': { keywords: ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'aws developer'], weight: 9 },
  'GCP': { keywords: ['gcp', 'google cloud', 'bigquery', 'cloud run', 'cloud functions'], weight: 7 },
  'Azure': { keywords: ['azure', 'microsoft azure', 'azure devops', 'azure functions'], weight: 7 },
  'PostgreSQL': { keywords: ['postgresql', 'postgres', 'psql'], weight: 7 },
  'MongoDB': { keywords: ['mongodb', 'mongo', 'nosql'], weight: 6 },
  'Redis': { keywords: ['redis', 'caching', 'memcached'], weight: 6 },
  'GraphQL': { keywords: ['graphql', 'graph ql', 'apollo', 'graphQL developer'], weight: 7 },
  'Terraform': { keywords: ['terraform', 'infrastructure as code', 'iac'], weight: 7 },
  'CI/CD': { keywords: ['ci/cd', 'ci cd', 'continuous integration', 'github actions', 'gitlab ci', 'jenkins'], weight: 6 },
  'Tailwind CSS': { keywords: ['tailwind', 'tailwind css', 'tailwindcss'], weight: 6 },
  'Svelte': { keywords: ['svelte', 'sveltejs', 'svelte developer', 'sveltekit'], weight: 7 },
  'Machine Learning': { keywords: ['machine learning', 'ml engineer', 'deep learning', 'tensorflow', 'pytorch', 'data scientist'], weight: 8 },
  'DevOps': { keywords: ['devops', 'devops engineer', 'site reliability', 'sre'], weight: 7 },
  'Figma': { keywords: ['figma', 'figma designer', 'figma developer'], weight: 5 },
  'React Native': { keywords: ['react native', 'react-native', 'rn developer'], weight: 8 },
  'Flutter': { keywords: ['flutter', 'flutter developer', 'dart'], weight: 8 },
  'Elixir': { keywords: ['elixir', 'phoenix', 'elixir developer'], weight: 7 },
};

const CAREER_PAGE_PATHS = [
  '/careers', '/jobs', '/open-positions', '/join-us', '/work-with-us',
  '/about/careers', '/company/careers', '/team', '/hiring',
];

const FETCH_OPTS = {
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    Accept: 'text/html,application/xhtml+xml,*/*',
  },
  redirect: 'follow',
};

async function fetchPage(url, timeoutMs = 8000) {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, { ...FETCH_OPTS, signal: ctrl.signal });
    clearTimeout(tid);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function inferFromJobPostings(domain, technologies) {
  const results = {
    careerPageFound: null,
    careerUrl: null,
    jobCount: 0,
    inferredTechs: [],
    rawMatches: [],
    confidence: 'low',
  };

  const baseUrls = [
    `https://${domain}`,
    `https://www.${domain}`,
  ];

  let careerHtml = null;
  let careerUrl = null;

  for (const base of baseUrls) {
    for (const path of CAREER_PAGE_PATHS) {
      const url = base + path;
      const html = await fetchPage(url);
      if (html && html.length > 1000) {
        careerHtml = html;
        careerUrl = url;
        break;
      }
    }
    if (careerHtml) break;
  }

  if (!careerHtml) {
    results.careerPageFound = false;
    return results;
  }

  results.careerPageFound = true;
  results.careerUrl = careerUrl;

  const lower = careerHtml.toLowerCase();

  for (const [tech, config] of Object.entries(JOB_TECH_SIGNALS)) {
    for (const keyword of config.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        const alreadyDetected = technologies.some(t => t.name === tech);
        results.inferredTechs.push({
          name: tech,
          confidence: alreadyDetected ? 'confirmed' : 'inferred',
          weight: config.weight,
          matchedKeyword: keyword,
          source: 'job postings',
        });
        results.rawMatches.push(keyword);
        break;
      }
    }
  }

  results.inferredTechs.sort((a, b) => b.weight - a.weight);
  results.jobCount = results.inferredTechs.length;
  results.confidence = results.inferredTechs.length >= 5 ? 'high' : results.inferredTechs.length >= 2 ? 'medium' : 'low';

  return results;
}

export function inferFromTechStack(technologies) {
  const inferred = [];

  const techNames = technologies.map(t => t.name);

  if (techNames.includes('Next.js') || techNames.includes('Nuxt.js')) {
    inferred.push({ name: 'Node.js', confidence: 'high', source: 'framework requirement' });
    inferred.push({ name: 'TypeScript', confidence: 'medium', source: 'common pairing' });
  }
  if (techNames.includes('Django') || techNames.includes('Flask') || techNames.includes('FastAPI')) {
    inferred.push({ name: 'Python', confidence: 'high', source: 'framework requirement' });
  }
  if (techNames.includes('Laravel') || techNames.includes('Symfony')) {
    inferred.push({ name: 'PHP', confidence: 'high', source: 'framework requirement' });
  }
  if (techNames.includes('Ruby on Rails')) {
    inferred.push({ name: 'Ruby', confidence: 'high', source: 'framework requirement' });
  }
  if (techNames.includes('Spring Boot') || techNames.includes('Spring Framework')) {
    inferred.push({ name: 'Java', confidence: 'high', source: 'framework requirement' });
  }
  if (techNames.includes('ASP.NET')) {
    inferred.push({ name: 'C#', confidence: 'high', source: 'framework requirement' });
  }
  if (techNames.includes('Kubernetes')) {
    inferred.push({ name: 'Docker', confidence: 'high', source: 'orchestration requires containers' });
  }
  if (techNames.includes('Vercel')) {
    inferred.push({ name: 'Node.js', confidence: 'high', source: 'Vercel runtime' });
  }
  if (techNames.includes('Firebase')) {
    inferred.push({ name: 'Google Cloud', confidence: 'medium', source: 'Firebase is GCP' });
  }
  if (techNames.includes('Supabase')) {
    inferred.push({ name: 'PostgreSQL', confidence: 'high', source: 'Supabase is PostgreSQL' });
  }

  const unique = [];
  const seen = new Set();
  for (const inf of inferred) {
    if (!seen.has(inf.name) && !techNames.includes(inf.name)) {
      seen.add(inf.name);
      unique.push(inf);
    }
  }
  return unique;
}
