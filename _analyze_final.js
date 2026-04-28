const fs = require('fs');
const path = require('path');
const report = JSON.parse(fs.readFileSync('60-meta-content/ci-checks/link-check-report.json', 'utf8'));

const specialChars = ['?', '[', ']', '*', '|', '<', '>', ':', ','];
const oldDirRoots = ['jsts-code-lab', 'docs', 'JSTS全景综述'];
const rootFiles = ['CONTRIBUTING.md', 'LICENSE', 'README.md', 'GLOSSARY.md', 'CROSS-REFERENCE.md'];
const placeholderUrls = ['链接', '...', 'github-repo-link', 'value', 'hint', 'instance'];

let toCreate = new Map();
let toFix = [];
let skipped = [];

function shouldSkipUrl(url) {
  const noAnchor = url.split('#')[0];
  const filename = path.basename(noAnchor);
  if (specialChars.some(c => filename.includes(c))) return 'special char';
  if (placeholderUrls.includes(filename)) return 'placeholder';
  if (url.startsWith('/mnt/')) return 'external abs path';
  if (noAnchor.endsWith('/')) return 'directory link';
  if (/\.(ts|js|tsx|jsx|json|yaml|yml)$/.test(noAnchor)) return 'non-md file';
  if (!noAnchor.endsWith('.md') && !noAnchor.endsWith('/')) {
    // Links without extension that are not directories - could be website routes
    // But let's check if they might be routes
    if (url.startsWith('/')) return 'website route';
  }
  return null;
}

for (const item of report.brokenLinks) {
  const link = item.url;
  const sourceFile = item.file.replace(/\\/g, '/');
  const sourceDir = path.dirname(sourceFile);

  const skipReason = shouldSkipUrl(link);
  if (skipReason) {
    skipped.push({sourceFile, link, reason: skipReason});
    continue;
  }

  const linkNoAnchor = link.split('#')[0];

  let resolved = linkNoAnchor;
  if (!path.isAbsolute(linkNoAnchor)) {
    resolved = path.normalize(path.join(sourceDir, linkNoAnchor)).replace(/\\/g, '/');
  } else {
    resolved = linkNoAnchor.replace(/^\//, '');
  }

  const resolvedParts = resolved.split('/').filter(p => p);
  if (oldDirRoots.some(r => resolvedParts[0] === r)) {
    skipped.push({sourceFile, link, resolved, reason: 'old dir target'});
    continue;
  }

  const basename = path.basename(resolved);
  if (rootFiles.includes(basename)) {
    if (sourceDir === '.') {
      skipped.push({sourceFile, link, reason: 'root file from root, likely false positive'});
    } else {
      const depth = sourceDir.split('/').length;
      const correctPath = Array(depth).fill('..').join('/') + '/' + basename;
      toFix.push({sourceFile, link, resolved, basename, correctPath});
    }
    continue;
  }

  // Also handle LICENSE.md -> should map to LICENSE
  if (basename === 'LICENSE.md') {
    if (sourceDir === '.') {
      skipped.push({sourceFile, link, reason: 'LICENSE.md from root'});
    } else {
      const depth = sourceDir.split('/').length;
      const correctPath = Array(depth).fill('..').join('/') + '/LICENSE';
      toFix.push({sourceFile, link, resolved, basename: 'LICENSE.md', correctPath});
    }
    continue;
  }

  const targetDir = path.dirname(resolved);
  if (!fs.existsSync(targetDir)) {
    skipped.push({sourceFile, link, resolved, reason: 'target dir missing: ' + targetDir});
    continue;
  }

  if (fs.existsSync(resolved)) {
    skipped.push({sourceFile, link, resolved, reason: 'target already exists'});
    continue;
  }

  toCreate.set(resolved, {sourceFile, link, resolved});
}

console.log('To create:', toCreate.size);
for (const [k, v] of [...toCreate.entries()].sort()) {
  console.log(k, '(from', v.sourceFile, ')');
}

console.log('\nTo fix:', toFix.length);
for (const f of toFix) {
  console.log(f.sourceFile, ':', f.link, '->', f.correctPath);
}

console.log('\nSkipped:', skipped.length);

fs.writeFileSync('_to_create_final.json', JSON.stringify([...toCreate.values()], null, 2));
fs.writeFileSync('_to_fix_final.json', JSON.stringify(toFix, null, 2));
fs.writeFileSync('_skipped_final.json', JSON.stringify(skipped, null, 2));
