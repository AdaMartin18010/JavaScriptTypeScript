const fs = require('fs');
const path = require('path');
const report = JSON.parse(fs.readFileSync('60-meta-content/ci-checks/link-check-report.json', 'utf8'));

const specialChars = ['?', '[', ']', '*', '|', '<', '>', ':', ','];
const oldDirRoots = ['jsts-code-lab', 'docs', 'JSTS全景综述'];
const rootFiles = ['CONTRIBUTING.md', 'LICENSE', 'README.md', 'GLOSSARY.md', 'CROSS-REFERENCE.md'];

let skipSpecial = [];
let skipOldDir = [];
let skipNoDir = [];
let toFix = [];
let toCreate = [];

for (const item of report.brokenLinks) {
  const link = item.url;
  const sourceFile = item.file.replace(/\\/g, '/');
  const filename = path.basename(link);

  // Rule 1: special chars in filename, or backslash escapes, or absolute non-project paths
  if (specialChars.some(c => filename.includes(c)) || filename === 'link' || link.startsWith('/mnt/')) {
    skipSpecial.push({sourceFile, link, reason: 'special chars or placeholder'});
    continue;
  }

  // Resolve relative link
  const sourceDir = path.dirname(sourceFile);
  let resolved = link;
  if (!path.isAbsolute(link)) {
    resolved = path.normalize(path.join(sourceDir, link)).replace(/\\/g, '/');
  } else {
    resolved = link.replace(/^\//, '');
  }

  // Rule 2: old directories as ROOT-level target dirs
  const resolvedParts = resolved.split('/').filter(p => p);
  if (oldDirRoots.some(r => resolvedParts[0] === r)) {
    skipOldDir.push({sourceFile, link, resolved, reason: 'old dir target'});
    continue;
  }

  // Rule 4: root files
  const basename = path.basename(link);
  if (rootFiles.includes(basename)) {
    toFix.push({sourceFile, link, resolved, basename, targetExists: fs.existsSync(basename)});
    continue;
  }

  // Rule 3: target directory doesn't exist
  const targetDir = path.dirname(resolved);
  if (!fs.existsSync(targetDir)) {
    skipNoDir.push({sourceFile, link, resolved, reason: 'target dir missing: ' + targetDir});
    continue;
  }

  // Skip if target already exists
  if (fs.existsSync(resolved)) {
    continue;
  }

  toCreate.push({sourceFile, link, resolved});
}

console.log('Skip special:', skipSpecial.length);
console.log('Skip old dir:', skipOldDir.length);
console.log('Skip no dir:', skipNoDir.length);
console.log('To fix:', toFix.length);
console.log('To create:', toCreate.length);

console.log('\n--- TO CREATE ---');
for (const c of toCreate) {
  console.log(c.resolved + ' (from ' + c.sourceFile + ' link ' + c.link + ')');
}

console.log('\n--- TO FIX ---');
for (const f of toFix) {
  console.log(f.sourceFile + ' -> ' + f.link + ' (resolved: ' + f.resolved + ') targetExists=' + f.targetExists);
}

console.log('\n--- SKIP NO DIR samples ---');
for (const s of skipNoDir.slice(0, 20)) {
  console.log(s.sourceFile + ' -> ' + s.link + ' (' + s.resolved + ') ' + s.reason);
}

fs.writeFileSync('_to_create.json', JSON.stringify(toCreate, null, 2));
fs.writeFileSync('_to_fix.json', JSON.stringify(toFix, null, 2));
fs.writeFileSync('_skip_special.json', JSON.stringify(skipSpecial, null, 2));
fs.writeFileSync('_skip_old_dir.json', JSON.stringify(skipOldDir, null, 2));
fs.writeFileSync('_skip_no_dir.json', JSON.stringify(skipNoDir, null, 2));
