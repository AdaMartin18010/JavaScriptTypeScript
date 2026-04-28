const fs = require('fs');
const path = require('path');
const report = JSON.parse(fs.readFileSync('60-meta-content/ci-checks/link-check-report.json', 'utf8'));

const specialChars = ['?', '[', ']', '*', '|', '<', '>', ':', ',', '\\'];
const oldDirRoots = ['jsts-code-lab', 'docs', 'JSTS全景综述'];
const rootFiles = ['CONTRIBUTING.md', 'LICENSE', 'README.md', 'GLOSSARY.md', 'CROSS-REFERENCE.md'];
const placeholders = ['链接', '...', 'github-repo-link', 'value', 'hint', 'instance'];

let toCreateSet = new Map();
let toFixSet = [];
let skipped = [];

for (const item of report.brokenLinks) {
  const link = item.url;
  const sourceFile = item.file.replace(/\\/g, '/');
  const sourceDir = path.dirname(sourceFile);

  const linkNoAnchor = link.split('#')[0];
  const filename = path.basename(linkNoAnchor);

  if (specialChars.some(c => filename.includes(c)) || placeholders.includes(filename) || link.startsWith('/mnt/')) {
    skipped.push({sourceFile, link, reason: 'special/placeholder'});
    continue;
  }

  if (linkNoAnchor.endsWith('/')) {
    skipped.push({sourceFile, link, reason: 'directory link'});
    continue;
  }

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
      toFixSet.push({sourceFile, link, resolved, basename, correctPath, reason: 'wrong relative path to root file'});
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

  toCreateSet.set(resolved, {sourceFile, link, resolved});
}

console.log('To create:', toCreateSet.size);
for (const [k, v] of toCreateSet) {
  console.log(k, '(from', v.sourceFile, ')');
}

console.log('\nTo fix:', toFixSet.length);
for (const f of toFixSet) {
  console.log(f.sourceFile, ':', f.link, '->', f.correctPath);
}

console.log('\nSkipped:', skipped.length);

fs.writeFileSync('_to_create.json', JSON.stringify([...toCreateSet.values()], null, 2));
fs.writeFileSync('_to_fix.json', JSON.stringify(toFixSet, null, 2));
