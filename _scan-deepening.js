const fs = require('fs');
const path = require('path');

const TARGET_DIRS = ['10-fundamentals','20-code-lab','30-knowledge-base','40-ecosystem','50-examples'];
const EXCLUDE_NAMES = ['CATEGORY.md', '_MIGRATED_FROM.md', 'README.md'];

// 技术领域优先级权重
const PRIORITY_KEYWORDS = {
  high: ['react','typescript','vite','nextjs','bun','deno','nodejs','ecmascript','signals','compiler','ai','mcp','agent','wasm','webassembly','graphql','serverless','edge'],
  medium: ['testing','performance','security','observability','microservices','orm','database','cache','queue','event','stream']
};

function scorePriority(content, filename) {
  const text = (content + ' ' + filename).toLowerCase();
  let score = 0;
  for (const kw of PRIORITY_KEYWORDS.high) {
    if (text.includes(kw)) score += 3;
  }
  for (const kw of PRIORITY_KEYWORDS.medium) {
    if (text.includes(kw)) score += 1;
  }
  return score;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const size = fs.statSync(filePath).size;
  if (size < 1024 || size > 10240) return null; // 聚焦 1KB-10KB 的半成品

  const lines = content.split('\n').length;
  const hasCode = content.includes('```');
  const hasLink = /https?:\/\//.test(content);
  const hasTable = /\|.*\|.*\|/.test(content);
  const hasENRef = /MDN|ECMA-262|TC39|W3C|WHATWG|caniuse|nodejs\.org|typescriptlang\.org|react\.dev|vitejs\.dev|web\.dev/i.test(content);
  const todoCount = (content.match(/TODO|FIXME|待补充|待完善/ig) || []).length;
  const priority = scorePriority(content, path.basename(filePath));

  // 深化空间评分：有代码基础 + 缺权威引用 + 高优先级主题
  let deepenScore = 0;
  if (hasCode) deepenScore += 2;
  if (!hasLink) deepenScore += 2;
  if (!hasENRef) deepenScore += 3;
  if (!hasTable) deepenScore += 1;
  deepenScore += priority;
  deepenScore -= todoCount * 0.5;

  return {
    file: filePath.replace(process.cwd() + path.sep, '').replace(/\\/g, '/'),
    sizeKB: (size/1024).toFixed(1),
    lines,
    hasCode: hasCode ? 'Y' : 'N',
    hasLink: hasLink ? 'Y' : 'N',
    hasTable: hasTable ? 'Y' : 'N',
    hasENRef: hasENRef ? 'Y' : 'N',
    todoCount,
    priority,
    deepenScore: deepenScore.toFixed(1)
  };
}

const results = [];
for (const dir of TARGET_DIRS) {
  const fullDir = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullDir)) continue;
  function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.md') && !EXCLUDE_NAMES.includes(e.name)) {
        const r = analyzeFile(p);
        if (r && r.deepenScore >= 5) results.push(r);
      }
    }
  }
  walk(fullDir);
}

results.sort((a, b) => b.deepenScore - a.deepenScore);
console.log('=== 有明确深化空间的文件（按深化价值排序）===');
console.table(results.slice(0, 25));
console.log(`\n总计: ${results.length} 个文件有深化价值`);
