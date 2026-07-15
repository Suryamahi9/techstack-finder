const fs = require('fs');
const content = fs.readFileSync('lib/detect.js', 'utf8');

// Extract rules by matching: { name: '...', category: '...', patterns: [...] }
const rules = [];
const ruleRegex = /\{\s*name:\s*'([^']+)',\s*category:\s*'([^']+)',[^}]*patterns:\s*\[([\s\S]*?)\]\s*\}/g;
let m;
while ((m = ruleRegex.exec(content)) !== null) {
  const name = m[1];
  const category = m[2];
  const patternBlock = m[3];
  const patternCount = (patternBlock.match(/\{[^}]+\}/g) || []).length;
  rules.push({ name, category, count: Math.max(patternCount, 1) });
}

// Also get rules without patterns array (single pattern)
const simpleRegex = /\{\s*name:\s*'([^']+)',\s*category:\s*'([^']+)',\s*pattern:\s*\{[^}]+\}\s*\}/g;
while ((m = simpleRegex.exec(content)) !== null) {
  rules.push({ name: m[1], category: m[2], count: 1 });
}

// Group by category
const cats = {};
rules.forEach(r => {
  if (!cats[r.category]) cats[r.category] = {};
  if (!cats[r.category][r.name]) cats[r.category][r.name] = 0;
  cats[r.category][r.name] += r.count;
});

// Build output
const output = {};
for (const [cat, techs] of Object.entries(cats).sort((a, b) => a[0].localeCompare(b[0]))) {
  output[cat] = Object.entries(techs)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// Top techs across all categories
const allTechs = [];
for (const [cat, techs] of Object.entries(cats)) {
  for (const [name, count] of Object.entries(techs)) {
    allTechs.push({ name, category: cat, count });
  }
}
allTechs.sort((a, b) => b.count - a.count);

console.log('CATEGORIES_COUNT:', Object.keys(output).length);
console.log('TOTAL_RULES:', rules.length);
console.log('TOP_50:');
allTechs.slice(0, 50).forEach((t, i) => {
  console.log(`  ${i+1}. ${t.name} (${t.category}) - ${t.count} patterns`);
});
console.log('\nALL_CATEGORIES:');
for (const [cat, techs] of Object.entries(output)) {
  console.log(`  ${cat}: ${techs.length} techs`);
}
