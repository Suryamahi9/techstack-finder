const fs = require('fs');
const path = require('path');

const detectPath = path.join(__dirname, '..', 'lib', 'detect.js');
const categoriesPath = path.join(__dirname, '_generated_categories.js');

console.log('Reading detect.js...');
let detect = fs.readFileSync(detectPath, 'utf8');

// Add import at top (after existing imports)
const importLine = "import _genRules from '../scripts/_generated_rules.json' assert { type: 'json' };\n";

// For Next.js, use require instead (SWC doesn't support import assertions for JSON in some configs)
const requireLine = "import { createRequire } from 'module'; const _require = createRequire(import.meta.url); const _genRules = _require('../scripts/_generated_rules.json');\n";

// Actually, simplest approach: use a dynamic import helper
// But for Node.js/Next.js, we'll load JSON synchronously via fs
const fsImport = "import { readFileSync } from 'fs';\nimport { fileURLToPath } from 'url';\nimport { dirname, join } from 'path';\nconst _genRulesPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', '_generated_rules.json');\nconst _genRules = JSON.parse(readFileSync(_genRulesPath, 'utf8'));\n";

// Find where to add the import (after existing imports)
const lastImportIdx = detect.lastIndexOf("import ");
const firstCodeAfterImports = detect.indexOf("\n\n", lastImportIdx + 100);
if (lastImportIdx !== -1) {
  // Find the end of the last import line
  let insertIdx = detect.indexOf('\n', lastImportIdx);
  if (insertIdx === -1) insertIdx = lastImportIdx;
  detect = detect.substring(0, insertIdx + 1) + fsImport + '\n' + detect.substring(insertIdx + 1);
}

// Now add the merge line before RULES array ends
const rulesArrayEnd = detect.indexOf('];\n', detect.indexOf('const RULES'));
if (rulesArrayEnd !== -1) {
  const mergeLine = "\n// Merged generated rules (70K+ fingerprints)\n_genRules.forEach(r => { if (!RULES.find(e => e.name === r.name)) RULES.push(r));\n";
  detect = detect.substring(0, rulesArrayEnd) + mergeLine + detect.substring(rulesArrayEnd);
}

// Update CATEGORY_TYPES
const catTypesStart = detect.indexOf('const CATEGORY_TYPES = {');
const catTypesEnd = detect.indexOf('};', catTypesStart);
if (catTypesStart !== -1 && catTypesEnd !== -1) {
  console.log('Reading generated categories...');
  const categories = fs.readFileSync(categoriesPath, 'utf8');
  const before = detect.substring(0, catTypesStart);
  const after = detect.substring(catTypesEnd + 2);
  detect = before + 'const CATEGORY_TYPES = {\n' + categories + '\n};' + after;
}

console.log('Writing updated detect.js...');
fs.writeFileSync(detectPath, detect, 'utf8');

const lineCount = detect.split('\n').length;
console.log(`Done! detect.js is now ${lineCount} lines`);
console.log(`File size: ${(Buffer.byteLength(detect) / 1024).toFixed(0)} KB`);
