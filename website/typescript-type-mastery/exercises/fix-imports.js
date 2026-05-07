const fs = require('fs');
const path = require('path');

const root = __dirname;

function getRelativePrefix(filePath) {
  const rel = path.relative(root, path.dirname(filePath));
  const depth = rel.split(path.sep).length;
  return '../'.repeat(depth);
}

function fixImports(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const fullPath = path.join(dir, f.name);
    if (f.isDirectory() && f.name !== '_shared' && f.name !== 'node_modules') {
      fixImports(fullPath);
    } else if (f.isFile() && f.name.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("@type-challenges/utils")) {
        const prefix = getRelativePrefix(fullPath);
        content = content.replace(/@type-challenges\/utils/g, `${prefix}_shared/type-utils`);
        fs.writeFileSync(fullPath, content);
        console.log('Fixed:', path.relative(root, fullPath));
      }
    }
  }
}

fixImports(root);
console.log('Done!');
