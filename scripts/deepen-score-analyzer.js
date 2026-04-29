#!/usr/bin/env node

/**
 * 深化评分分析器
 *
 * 扫描新架构目录，评估每个 Markdown 文件的深化价值，输出优先级列表。
 * 8 维度评分：sizeKB、lines、hasCode、hasLink、hasTable、hasENRef、todoCount、priority
 *
 * 使用：node scripts/deepen-score-analyzer.js
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

const SCAN_DIRS = [
  '10-fundamentals',
  '20-code-lab',
  '30-knowledge-base',
  '40-ecosystem',
  '50-examples',
];

const EXCLUDE_PATTERNS = [
  /_MIGRATED_FROM\.md$/,
  /ARCHIVED\.md$/,
  /node_modules/,
  /\.vitepress/,
  /dist/,
  /build/,
];

// 扩展的权威英文来源域名白名单
const ENGLISH_AUTHORITY_DOMAINS = [
  // 标准与规范
  'mdn', 'developer.mozilla.org',
  'w3c', 'w3.org', 'whatwg.org', 'tc39.es', 'ecma-international.org',
  // 浏览器/运行时官方
  'v8.dev', 'chromestatus.com', 'developer.chrome.com',
  'web.dev', 'blog.mozilla.org',
  'nodejs.org', 'bun.sh', 'deno.com', 'deno.land',
  // 框架官方
  'react.dev', 'angular.io', 'vuejs.org', 'svelte.dev', 'sveltejs.org',
  'astro.build', 'nextjs.org', 'nuxt.com', 'tanstack.com',
  'trpc.io', 'trpc.dev', 'orpc.dev',
  // 构建工具
  'vitejs.dev', 'vitejs.cn', 'rollupjs.org', 'webpack.js.org',
  'rspack.dev', 'rolldown.rs', 'swc.rs', 'oxc.rs', 'esbuild.github.io',
  // 类型系统
  'typescriptlang.org', 'devblogs.microsoft.com',
  // 云/边缘
  'cloudflare.com', 'vercel.com', 'netlify.com', 'fly.io', 'deno.com/deploy',
  // AI/协议
  'modelcontextprotocol.io', 'mcp.dev', 'anthropic.com', 'openai.com',
  // 工程博客
  'engineering.linkedin.com', 'netflixtechblog.com',
  'instagram-engineering.com', 'stripe.com', 'shopify.engineering',
  'uber.com', 'airbnb.io', 'stackoverflow.blog',
  // 技术社区
  'patterns.dev', 'web.dev', 'webplatform.news',
  'javascriptweekly.com', 'nodeweekly.com', 'frontendfoc.us',
  // 安全/性能
  'owasp.org', 'snyk.io', 'semver.org',
  // 其他权威
  'github.com', 'gitlab.com',
  'npmjs.com', 'jsr.io',
  'rust-lang.org', 'blog.rust-lang.org',
  'infoq.com', 'martinfowler.com',
  'javacodegeeks.com', 'dzone.com',
  'encore.dev', 'encore.cloud',
  'docs.github.com',
  'docs.npmjs.com',
];

function shouldExclude(filePath) {
  for (const p of EXCLUDE_PATTERNS) {
    if (p.test(filePath)) return true;
  }
  return false;
}

function getAllMarkdownFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      getAllMarkdownFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      if (!shouldExclude(fullPath)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function hasCodeBlocks(content) {
  return /```(?:typescript|javascript|ts|js|tsx|jsx|rust|go|python|bash|sh|yaml|json)/i.test(content);
}

function hasExternalLinks(content) {
  return /\[.+?\]\(https?:\/\/.+?\)/.test(content);
}

function hasTables(content) {
  return /^\|.+\|/m.test(content);
}

function hasEnglishAuthorityRef(content) {
  const urlRegex = /https?:\/\/([^\/\s\)]+)/g;
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    const domain = match[1].toLowerCase();
    for (const auth of ENGLISH_AUTHORITY_DOMAINS) {
      if (domain.includes(auth)) return true;
    }
  }
  return false;
}

function countTODOs(content) {
  // 严格匹配真正的 TODO/FIXME 标记：单词边界 + 后接标点/空格/行尾
  // 排除 toDomain/TodoModel/TodoMaster 等代码标识符误匹配
  const matches = content.match(/\b(TODO|FIXME)\b[\s:：,;.!]|\b(TODO|FIXME)\b$/gm);
  const cnMatches = content.match(/待补充|待完善/g);
  let count = 0;
  if (matches) count += matches.length;
  if (cnMatches) count += cnMatches.length;
  return count;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').length;
  const sizeKB = content.length / 1024;
  const baseName = path.basename(filePath);

  // 跳过非空 README/INDEX（保留 <200B 的空骨架用于识别）
  if (/README|INDEX/i.test(baseName) && sizeKB > 0.2) return null;

  const hasCode = hasCodeBlocks(content) ? 'Y' : 'N';
  const hasLink = hasExternalLinks(content) ? 'Y' : 'N';
  const hasTable = hasTables(content) ? 'Y' : 'N';
  const hasENRef = hasEnglishAuthorityRef(content) ? 'Y' : 'N';
  const todoCount = countTODOs(content);

  // 评分公式
  let score = 0;
  if (hasCode === 'N') score += 5;
  if (hasLink === 'N') score += 5;
  if (hasTable === 'N') score += 5;
  if (hasENRef === 'N') score += 10;
  score += todoCount * 3;
  score += Math.max(0, 30 - Math.round(sizeKB));
  score += Math.max(0, 30 - Math.round(lines / 10));

  // 优先级调整：THEORY.md 和分类文档权重更高
  let priority = 'normal';
  if (baseName === 'THEORY.md') priority = 'high';
  else if (/category|categories|guide|cheatsheet/i.test(filePath)) priority = 'medium';

  if (priority === 'high') score += 5;
  if (priority === 'medium') score += 3;

  return {
    path: path.relative(PROJECT_ROOT, filePath),
    sizeKB: Math.round(sizeKB * 10) / 10,
    lines,
    hasCode,
    hasLink,
    hasTable,
    hasENRef,
    todoCount,
    priority,
    score,
  };
}

function main() {
  const allFiles = [];
  for (const dir of SCAN_DIRS) {
    const fullDir = path.join(PROJECT_ROOT, dir);
    if (fs.existsSync(fullDir)) {
      const files = getAllMarkdownFiles(fullDir);
      allFiles.push(...files);
    }
  }

  const results = [];
  for (const file of allFiles) {
    const r = analyzeFile(file);
    if (r) results.push(r);
  }

  // 按分数降序排列
  results.sort((a, b) => b.score - a.score);

  console.log(`\n📊 深化评分分析结果`);
  console.log(`═══════════════════════════════════════════════════════════════════════════════`);
  console.log(`扫描文件: ${allFiles.length} 个 | 有效评分: ${results.length} 个`);
  console.log(`═══════════════════════════════════════════════════════════════════════════════`);
  console.log(`
🏆 Top 30 深化优先级（分数越高越优先）：\n`);

  const top30 = results.slice(0, 30);
  console.log(`${'排名'.padEnd(4)} ${'分数'.padEnd(5)} ${'大小'.padEnd(6)} ${'行数'.padEnd(5)} ${'代码'.padEnd(4)} ${'链接'.padEnd(4)} ${'表格'.padEnd(4)} ${'英权'.padEnd(4)} ${'TODO'.padEnd(4)} ${'文件路径'}`);
  console.log(`${'─'.repeat(4)} ${'─'.repeat(5)} ${'─'.repeat(6)} ${'─'.repeat(5)} ${'─'.repeat(4)} ${'─'.repeat(4)} ${'─'.repeat(4)} ${'─'.repeat(4)} ${'─'.repeat(4)} ${'─'.repeat(60)}`);

  top30.forEach((r, i) => {
    const rank = String(i + 1).padEnd(4);
    const score = String(r.score).padEnd(5);
    const size = String(r.sizeKB + 'KB').padEnd(6);
    const lines = String(r.lines).padEnd(5);
    const code = r.hasCode.padEnd(4);
    const link = r.hasLink.padEnd(4);
    const table = r.hasTable.padEnd(4);
    const en = r.hasENRef.padEnd(4);
    const todo = String(r.todoCount).padEnd(4);
    console.log(`${rank} ${score} ${size} ${lines} ${code} ${link} ${table} ${en} ${todo} ${r.path}`);
  });

  // 统计摘要
  const needsCode = results.filter(r => r.hasCode === 'N').length;
  const needsLink = results.filter(r => r.hasLink === 'N').length;
  const needsTable = results.filter(r => r.hasTable === 'N').length;
  const needsENRef = results.filter(r => r.hasENRef === 'N').length;

  console.log(`\n📈 统计摘要`);
  console.log(`  缺代码示例: ${needsCode} 个`);
  console.log(`  缺外部链接: ${needsLink} 个`);
  console.log(`  缺表格对比: ${needsTable} 个`);
  console.log(`  缺英文权威来源: ${needsENRef} 个`);

  // 保存完整报告
  const reportPath = path.join(PROJECT_ROOT, '60-meta-content', 'ci-checks', 'deepen-score-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalScanned: allFiles.length,
    totalRated: results.length,
    top30,
    allResults: results,
    summary: { needsCode, needsLink, needsTable, needsENRef },
  }, null, 2));
  console.log(`\n📁 完整报告已保存: ${path.relative(PROJECT_ROOT, reportPath)}`);
}

main();
