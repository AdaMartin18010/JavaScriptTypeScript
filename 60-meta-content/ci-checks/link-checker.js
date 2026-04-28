#!/usr/bin/env node

/**
 * 内部链接检查器
 *
 * 扫描所有 .md 文件中的相对路径链接，检查指向的文件是否存在。
 * 忽略外部链接（http/https）、锚点链接、邮件链接等。
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// 需要排除的目录
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  '.vitepress',
  'dist',
  'build',
  '.azure',
  // 旧备份目录（保留原始文件，不检查其链接）
  'jsts-code-lab',
  'docs',
  'JSTS全景综述',
  'examples',
  'awesome-jsts-ecosystem',
  'jsts-language-core-system',
  'website',
  'view',
];

/**
 * 递归获取所有 .md 文件
 */
function getAllMarkdownFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.includes(entry.name)) continue;
      if (entry.name.startsWith('.')) continue;
      getAllMarkdownFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 从 markdown 内容中提取内部相对链接
 */
function extractInternalLinks(content) {
  const links = [];
  // 匹配 [text](url) 和 [text](url "title")
  const regex = /\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const linkText = match[1];
    const url = match[2];

    // 跳过外部链接
    if (/^(https?:|mailto:|tel:|ftp:|#)/i.test(url)) continue;
    // 跳过纯锚点链接
    if (url.startsWith('#')) continue;
    // 跳过常见占位符和模板链接
    if (url === 'link' || url === 'value' || url === 'hint' || url === 'instance') continue;
    // 跳过 GitHub 特殊相对路径（issues/discussions 在仓库页面上有效）
    if (/^(\.\.\/)*issues\/?$/.test(url) || /^(\.\.\/)*discussions\/?$/.test(url)) continue;
    // 跳过含方括号的代码片段（如 parsed[key]）
    if (/\[.*\]/.test(url)) continue;
    // 跳过 ECMAScript 规范参数和数学符号（非文件链接）
    if (/[\u0370-\u03FF]/.test(url)) continue; // 希腊字母（如 σ）
    if (/,\s/.test(url)) continue; // 包含逗号+空格的参数列表（如 P, Receiver）
    if (/:\s/.test(url)) continue; // 包含冒号+空格的（如 instance: any）
    if (/^\.{0,2}\/[^/]*\?/.test(url)) continue; // 包含问号的（如 ?-i:[a-z]）
    if (/^\.{0,2}\/[^/]*\*/.test(url)) continue; // 包含星号的
    if (/^\.{0,2}\/[A-Z]$/.test(url)) continue; // 单个大写字母（如 /N, /P, /V）
    if (/^\.{0,2}\/c$/.test(url)) continue; // 单个小写 c
    if (/^\.{0,2}\/\d/.test(url)) continue; // 以数字开头的（如 /1, /2024）
    if (/^\\d/.test(url)) continue; // 正则表达式 \d 开头
    if (/^\.{0,2}\/\.\.\.$/.test(url)) continue; // /...
    if (url === '...' || url === 'github-repo-link') continue; // 占位符

    links.push({ text: linkText, url });
  }

  return links;
}

/**
 * 解析相对链接为绝对文件路径
 */
function resolveLink(baseDir, url) {
  // 移除 URL 中的锚点部分
  const cleanUrl = url.split('#')[0];
  if (!cleanUrl) return null;

  const resolved = path.resolve(baseDir, cleanUrl);

  // 如果链接指向目录，尝试查找 index.md 或 README.md
  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
    const indexPath = path.join(resolved, 'index.md');
    if (fs.existsSync(indexPath)) return indexPath;
    const readmePath = path.join(resolved, 'README.md');
    if (fs.existsSync(readmePath)) return readmePath;
    return resolved; // 目录存在但没有 index/README
  }

  // 如果链接没有 .md 后缀，尝试追加 .md
  if (!cleanUrl.endsWith('.md')) {
    const withMd = resolved + '.md';
    if (fs.existsSync(withMd)) return withMd;
  }

  return resolved;
}

/**
 * 主检查逻辑
 */
function runLinkCheck() {
  console.log('🔗 开始检查内部链接...\n');

  const mdFiles = getAllMarkdownFiles(PROJECT_ROOT);
  const brokenLinks = [];
  let totalLinks = 0;
  let checkedFiles = 0;

  for (const filePath of mdFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const links = extractInternalLinks(content);

    if (links.length === 0) continue;

    checkedFiles++;
    const baseDir = path.dirname(filePath);
    const lines = content.split('\n');

    for (const link of links) {
      totalLinks++;
      const targetPath = resolveLink(baseDir, link.url);

      if (!targetPath || !fs.existsSync(targetPath)) {
        // 查找行号
        const lineNum = lines.findIndex(line =>
          line.includes(`[${link.text}](${link.url})`)
        );

        brokenLinks.push({
          file: path.relative(PROJECT_ROOT, filePath),
          line: lineNum >= 0 ? lineNum + 1 : '?',
          text: link.text || '(空文本)',
          url: link.url,
        });
      }
    }
  }

  // 输出报告
  console.log(`📄 扫描文件: ${mdFiles.length} 个 Markdown 文件`);
  console.log(`📋 检查文件: ${checkedFiles} 个包含内部链接`);
  console.log(`🔗 检查链接: ${totalLinks} 个`);

  if (brokenLinks.length > 0) {
    console.log(`\n❌ 发现 ${brokenLinks.length} 个断裂链接:\n`);
    brokenLinks.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.file}:${item.line}`);
      console.log(`     文本: "${item.text}"`);
      console.log(`     链接: ${item.url}`);
    });
  } else {
    console.log('\n✅ 所有内部链接均正常！');
  }

  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: mdFiles.length,
    checkedFiles,
    totalLinks,
    brokenCount: brokenLinks.length,
    brokenLinks,
    passed: brokenLinks.length === 0,
  };

  // 可选写入 JSON 报告
  const reportPath = path.join(__dirname, 'link-check-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n📁 报告已保存: ${path.relative(PROJECT_ROOT, reportPath)}`);

  return report;
}

if (require.main === module) {
  const report = runLinkCheck();
  process.exit(report.passed ? 0 : 2);
}

module.exports = { runLinkCheck };
