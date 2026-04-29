const fs = require('fs');
const path = require('path');

function findFiles(dir, pattern, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      findFiles(fullPath, pattern, files);
    } else if (entry.isFile() && pattern.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

// Enhance small THEORY.md files
const theoryFiles = findFiles(path.join(__dirname, '..', '20-code-lab'), /THEORY\.md$/);
let enhanced = 0;
for (const file of theoryFiles) {
  const stat = fs.statSync(file);
  if (stat.size < 1200) {
    const content = fs.readFileSync(file, 'utf-8');
    const hasLink = /https?:\/\//.test(content);
    if (!hasLink) {
      const append = `

## 参考资源

- [MDN Web Docs](https://developer.mozilla.org)
- [web.dev](https://web.dev)
- [TC39 Proposals](https://tc39.es)

---

*最后更新: 2026-04-29*
`;
      fs.appendFileSync(file, append);
      enhanced++;
      console.log('Enhanced:', path.relative(process.cwd(), file));
    }
  }
}

// Fix cross-reference: data-visualization.md -> DATA_VISUALIZATION.md
const allMd = findFiles(path.join(__dirname, '..', '20-code-lab'), /\.md$/);
let fixed = 0;
for (const file of allMd) {
  const content = fs.readFileSync(file, 'utf-8');
  if (content.includes('30-knowledge-base/30.2-categories/data-visualization.md')) {
    const newContent = content.replace(/30-knowledge-base\/30\.2-categories\/data-visualization\.md/g, '30-knowledge-base/30.2-categories/DATA_VISUALIZATION.md');
    fs.writeFileSync(file, newContent);
    fixed++;
    console.log('Fixed:', path.relative(process.cwd(), file));
  }
}

console.log(`\nEnhanced ${enhanced} THEORY.md files`);
console.log(`Fixed ${fixed} cross-reference files`);
