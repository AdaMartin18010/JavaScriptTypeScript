const fs = require('fs');
const path = require('path');

const ROOT = 'E:\\_src\\JavaScriptTypeScript';

// Mapping of old paths to new base paths (from project root)
const pathMappings = {
  'docs/categories-index.md': '30-knowledge-base/30.2-categories/README.md',
  'docs/language-core-index.md': '10-fundamentals/10.1-language-semantics/README.md',
  'docs/frameworks-index.md': '30-knowledge-base/30.2-categories/README.md',
  'docs/': '30-knowledge-base/30.1-guides/',
  'JSTS全景综述/': '30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/',
  'jsts-code-lab/': '20-code-lab/',
  'jsts-language-core-system/': '10-fundamentals/',
};

function getRelativePath(fromFile, toFile) {
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, toFile).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

function fixLinksInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const linkRegex = /\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const originalLink = match[1];
    if (originalLink.startsWith('http')) continue;
    if (originalLink.startsWith('#')) continue;
    if (originalLink.startsWith('mailto:')) continue;

    const sourceDir = path.dirname(filePath);
    const resolvedTarget = path.resolve(sourceDir, originalLink.split('#')[0]);
    const relTarget = path.relative(ROOT, resolvedTarget).replace(/\\/g, '/');

    // Check if this is a broken link pointing to old structure
    if (!fs.existsSync(resolvedTarget)) {
      let newTarget = null;

      // Check each mapping
      for (const [oldPrefix, newPrefix] of Object.entries(pathMappings)) {
        if (relTarget.startsWith(oldPrefix)) {
          newTarget = relTarget.replace(oldPrefix, newPrefix);
          break;
        }
      }

      if (newTarget) {
        const newTargetFull = path.join(ROOT, newTarget);
        if (fs.existsSync(newTargetFull)) {
          // Calculate correct relative path
          let newRel = getRelativePath(filePath, newTargetFull);
          // Preserve anchor if any
          const anchor = originalLink.includes('#') ? '#' + originalLink.split('#')[1] : '';
          const newLink = newRel + anchor;

          if (newLink !== originalLink) {
            // Replace this specific occurrence
            const before = content.substring(0, match.index);
            const after = content.substring(match.index + match[0].length);
            content = before + '](' + newLink + ')' + after;
            modified = true;
            // Reset regex since content changed
            linkRegex.lastIndex = match.index + newLink.length + 3;
          }
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// Process all markdown files in new architecture
const newDirs = ['10-fundamentals', '20-code-lab', '30-knowledge-base', '40-ecosystem', '50-examples', '60-meta-content'];
let fixed = 0;
let scanned = 0;

for (const dir of newDirs) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) continue;

  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        scanned++;
        if (fixLinksInFile(fullPath)) {
          fixed++;
        }
      }
    }
  }
  walk(fullDir);
}

console.log(`Scanned ${scanned} markdown files`);
console.log(`Fixed links in ${fixed} files`);
