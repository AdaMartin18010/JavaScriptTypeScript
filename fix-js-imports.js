const fs = require('fs');
const path = require('path');

const dirs = [
  'jsts-code-lab/61-api-gateway',
  'jsts-code-lab/62-message-queue',
  'jsts-code-lab/63-caching-strategies',
  'jsts-code-lab/64-search-engine',
  'jsts-code-lab/65-analytics',
  'jsts-code-lab/66-feature-flags',
  'jsts-code-lab/67-multi-tenancy',
  'jsts-code-lab/68-plugin-system',
  'jsts-code-lab/69-cli-framework',
  'jsts-code-lab/70-distributed-systems',
  'jsts-code-lab/72-container-orchestration',
  'jsts-code-lab/73-service-mesh-advanced',
  'jsts-code-lab/74-observability',
  'jsts-code-lab/75-chaos-engineering',
  'jsts-code-lab/76-ml-engineering',
  'jsts-code-lab/78-metaprogramming',
  'jsts-code-lab/79-compiler-design',
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  // Fix relative imports without extension: add .js
  // Matches import ... from './path' or import './path'
  // Does not touch imports already having an extension or bare specifiers
  content = content.replace(
    /(from\s+['"])(\.[\/][^'"]+)(['"])/g,
    (match, p1, p2, p3) => {
      if (p2.endsWith('.js') || p2.endsWith('.ts') || p2.endsWith('.json') || p2.endsWith('.css')) {
        return match;
      }
      return p1 + p2 + '.js' + p3;
    }
  );

  // Also side-effect imports: import './path'
  content = content.replace(
    /(import\s+['"])(\.[\/][^'"]+)(['"])/g,
    (match, p1, p2, p3) => {
      if (p2.endsWith('.js') || p2.endsWith('.ts') || p2.endsWith('.json') || p2.endsWith('.css')) {
        return match;
      }
      return p1 + p2 + '.js' + p3;
    }
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated', filePath);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else if (stat.isFile() && full.endsWith('.ts')) {
      processFile(full);
    }
  }
}

for (const d of dirs) {
  walk(d);
}
