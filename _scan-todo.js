const fs = require('fs');
const path = require('path');
const PROJECT_ROOT = process.cwd();

// 1. 扫描 THEORY.md 骨架
const theorySkeletons = [];
function scanTheory(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      scanTheory(p);
    } else if (e.name === 'THEORY.md') {
      const stat = fs.statSync(p);
      if (stat.size < 1000) {
        theorySkeletons.push({ path: path.relative(PROJECT_ROOT, p), size: stat.size });
      }
    }
  }
}
scanTheory(PROJECT_ROOT);

console.log('=== 1. THEORY.md 骨架 (< 1000 bytes) ===');
console.log('总数:', theorySkeletons.length);
theorySkeletons.slice(0, 15).forEach(t => console.log('  ' + t.size.toString().padStart(5) + '  ' + t.path));
if (theorySkeletons.length > 15) console.log('  ... 还有 ' + (theorySkeletons.length - 15) + ' 个');

// 2. 扫描空白图片
const blankImgPaths = [
  '30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/chart.png',
  'JSTS全景综述/chart.png',
  '30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/hero.jpg',
  '30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/below-fold.jpg',
  'JSTS全景综述/hero.jpg',
  'JSTS全景综述/below-fold.jpg',
  'docs/cat.png',
  'website/cat.png',
  'website/img/card-top.jpg',
];
console.log('\n=== 2. 空白图片占位 ===');
let imgCount = 0;
for (const p of blankImgPaths) {
  const fp = path.join(PROJECT_ROOT, p);
  if (fs.existsSync(fp)) {
    const size = fs.statSync(fp).size;
    if (size < 1000) {
      console.log('  ' + size.toString().padStart(4) + ' bytes  ' + p);
      imgCount++;
    }
  }
}
console.log('总数:', imgCount);

// 3. 扫描版本号过期（新架构中 React 18 / Angular 16）
const newArchDirs = ['10-fundamentals', '20-code-lab', '30-knowledge-base', '40-ecosystem', '50-examples', '60-meta-content'];
const versionMatches = [];
const versionRegex = /React\s+18|Angular\s+(v?16|17)|Next\.js\s+14|Tailwind\s+CSS\s+v?3/gi;

for (const topDir of newArchDirs) {
  const topPath = path.join(PROJECT_ROOT, topDir);
  if (!fs.existsSync(topPath)) continue;
  function scanDir(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name.startsWith('.') || e.name === 'node_modules') continue;
        scanDir(p);
      } else if (e.name.endsWith('.md')) {
        const content = fs.readFileSync(p, 'utf-8');
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const m = lines[i].match(versionRegex);
          if (m) {
            versionMatches.push({ file: path.relative(PROJECT_ROOT, p), line: i + 1, text: lines[i].trim().substring(0, 100), match: m[0] });
          }
        }
      }
    }
  }
  scanDir(topPath);
}

console.log('\n=== 3. 新架构中可能的过期版本号 ===');
console.log('总数:', versionMatches.length);
versionMatches.slice(0, 15).forEach(v => console.log('  [' + v.match + '] ' + v.file + ':' + v.line));
if (versionMatches.length > 15) console.log('  ... 还有 ' + (versionMatches.length - 15) + ' 个');

// 4. 扫描空 CATEGORY.md
const emptyCategories = [];
for (const topDir of newArchDirs) {
  const topPath = path.join(PROJECT_ROOT, topDir);
  if (!fs.existsSync(topPath)) continue;
  function scanCat(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name.startsWith('.')) continue;
        scanCat(p);
      } else if (e.name === 'CATEGORY.md') {
        const stat = fs.statSync(p);
        if (stat.size < 500) {
          emptyCategories.push({ path: path.relative(PROJECT_ROOT, p), size: stat.size });
        }
      }
    }
  }
  scanCat(topPath);
}
console.log('\n=== 4. 空 CATEGORY.md (< 500 bytes) ===');
console.log('总数:', emptyCategories.length);
emptyCategories.slice(0, 10).forEach(c => console.log('  ' + c.size.toString().padStart(4) + '  ' + c.path));
if (emptyCategories.length > 10) console.log('  ... 还有 ' + (emptyCategories.length - 10) + ' 个');
