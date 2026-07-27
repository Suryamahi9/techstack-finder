const TEAM_REQUIREMENTS = {
  'React':       { min: 2, max: 5, skill: 'Frontend', complexity: 'medium' },
  'Next.js':     { min: 2, max: 4, skill: 'Full-stack', complexity: 'medium' },
  'Vue.js':      { min: 1, max: 3, skill: 'Frontend', complexity: 'low' },
  'Angular':     { min: 3, max: 6, skill: 'Frontend', complexity: 'high' },
  'Svelte':      { min: 1, max: 2, skill: 'Frontend', complexity: 'low' },
  'Node.js':     { min: 2, max: 4, skill: 'Backend', complexity: 'medium' },
  'Django':      { min: 2, max: 4, skill: 'Backend', complexity: 'medium' },
  'Flask':       { min: 1, max: 3, skill: 'Backend', complexity: 'low' },
  'Rails':       { min: 2, max: 4, skill: 'Full-stack', complexity: 'medium' },
  'Laravel':     { min: 2, max: 4, skill: 'Backend', complexity: 'medium' },
  'Spring Boot': { min: 3, max: 6, skill: 'Backend', complexity: 'high' },
  'ASP.NET':     { min: 3, max: 6, skill: 'Backend', complexity: 'high' },
  'PostgreSQL':  { min: 1, max: 2, skill: 'Data/DevOps', complexity: 'medium' },
  'MongoDB':     { min: 1, max: 2, skill: 'Data', complexity: 'low' },
  'Redis':       { min: 0, max: 1, skill: 'DevOps', complexity: 'low' },
  'Docker':      { min: 1, max: 2, skill: 'DevOps', complexity: 'medium' },
  'Kubernetes':  { min: 2, max: 4, skill: 'DevOps/SRE', complexity: 'high' },
  'AWS':         { min: 1, max: 3, skill: 'DevOps/Cloud', complexity: 'high' },
  'Terraform':   { min: 1, max: 2, skill: 'DevOps', complexity: 'high' },
  'GraphQL':     { min: 1, max: 2, skill: 'Backend', complexity: 'medium' },
  'TypeScript':  { min: 0, max: 0, skill: 'N/A', complexity: 'low' },
  'Python':      { min: 2, max: 5, skill: 'Backend/ML', complexity: 'medium' },
  'Go':          { min: 2, max: 4, skill: 'Backend/Infra', complexity: 'high' },
  'Rust':        { min: 2, max: 4, skill: 'Systems/Infra', complexity: 'very high' },
  'Machine Learning': { min: 2, max: 5, skill: 'Data Science', complexity: 'high' },
};

function matchTeamReq(techName) {
  const exact = TEAM_REQUIREMENTS[techName];
  if (exact) return exact;
  const lower = techName.toLowerCase();
  for (const [key, val] of Object.entries(TEAM_REQUIREMENTS)) {
    if (key.toLowerCase() === lower) return val;
  }
  return null;
}

export function estimateTeamSize(technologies) {
  const roles = {};
  let totalMin = 0;
  let totalMax = 0;
  const details = [];

  for (const tech of technologies) {
    const req = matchTeamReq(tech.name);
    if (!req || req.min === 0) continue;

    if (!roles[req.skill]) roles[req.skill] = { min: 0, max: 0, techs: [] };
    roles[req.skill].min += req.min;
    roles[req.skill].max += req.max;
    roles[req.skill].techs.push(tech.name);

    totalMin += req.min;
    totalMax += req.max;

    details.push({ name: tech.name, ...req });
  }

  const deduplicatedMin = Math.max(2, Math.ceil(totalMin * 0.6));
  const deduplicatedMax = Math.max(deduplicatedMin + 1, Math.ceil(totalMax * 0.5));

  const roleList = Object.entries(roles).map(([skill, data]) => ({
    skill,
    min: data.min,
    max: data.max,
    techs: data.techs,
  })).sort((a, b) => b.min - a.min);

  const seniorityMix = {
    senior: Math.ceil(deduplicatedMin * 0.3),
    mid: Math.ceil(deduplicatedMin * 0.4),
    junior: deduplicatedMin - Math.ceil(deduplicatedMin * 0.3) - Math.ceil(deduplicatedMin * 0.4),
  };

  const complexity = details.some(d => d.complexity === 'very high') ? 'very high'
    : details.some(d => d.complexity === 'high') ? 'high'
    : details.some(d => d.complexity === 'medium') ? 'medium' : 'low';

  return {
    teamSize: { min: deduplicatedMin, max: deduplicatedMax },
    roles: roleList,
    seniorityMix,
    complexity,
    details,
    hiringAdvice: [
      deduplicatedMin >= 5 ? 'Consider hiring a dedicated DevOps/Platform engineer.' : null,
      roleList.length > 4 ? 'Many skill areas needed — consider full-stack engineers to reduce headcount.' : null,
      complexity === 'very high' || complexity === 'high' ? 'High-complexity stack — prioritize senior engineers with domain experience.' : null,
    ].filter(Boolean),
  };
}
