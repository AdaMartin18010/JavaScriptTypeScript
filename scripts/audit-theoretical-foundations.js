#!/usr/bin/env node
/**
 * 70-theoretical-foundations 内容新鲜度审计脚本
 *
 * 用法：
 *   node scripts/audit-theoretical-foundations.js
 *
 * 功能：
 *   - 扫描 70-theoretical-foundations/ 下所有 .md 文件
 *   - 检查 YAML frontmatter 完整性
 *   - 检查 last-updated 是否超过 6 个月
 *   - 检查 references 中的 URL 格式
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '70-theoretical-foundations');
const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000; // 约 6 个月
const NOW = Date.now();

const REQUIRED_FIELDS = ['title', 'description', 'last-updated'];
const OPTIONAL_BUT_CHECKED = ['category'];

const EXCLUDED_FILES = new Set([
  'README.md',
  'CRITICAL_ASSESSMENT_REPORT_2026.md',
  'MASTER_PLAN.md',
  'FOLLOW_UP_PLAN.md',
  'CROSS_REFERENCE.md',
  'KNOWLEDGE_GRAPH.md',
  'NOTATION_GUIDE.md'
]);

function findMarkdownFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name === '.content-audit') continue;
    if (entry.isDirectory()) {
      findMarkdownFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.md') && !EXCLUDED_FILES.has(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { hasFrontmatter: false, data: {} };

  const raw = match[1];
  const data = {};

  // 简单 YAML 解析（支持字符串、数组）
  const lines = raw.split(/\r?\n/);
  let currentKey = null;
  let indentStack = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '' || trimmed.startsWith('#')) continue;

    // 简单键值对: key: value
    const kvMatch = line.match(/^(\s*)([\w-]+):\s*(.*)$/);
    if (kvMatch) {
      const [, indentStr, key, val] = kvMatch;
      const indent = indentStr.length;

      // 重置栈
      while (indentStack.length && indentStack[indentStack.length - 1] >= indent) {
        indentStack.pop();
      }
      indentStack.push(indent);
      currentKey = key;

      if (val.trim() !== '') {
        data[key] = val.trim().replace(/^["'](.*)["']$/, '$1');
      } else {
        data[key] = [];
      }
      continue;
    }

    // 数组项: - value
    const arrMatch = line.match(/^(\s*)-\s+(.*)$/);
    if (arrMatch && currentKey && Array.isArray(data[currentKey])) {
      const val = arrMatch[2].trim();
      data[currentKey].push(val.replace(/^["'](.*)["']$/, '$1'));
    }
  }

  return { hasFrontmatter: true, data, rawLength: match[0].length };
}

function checkUrlFormat(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isReferenceUrl(ref) {
  return /^https?:\/\//.test(ref.trim());
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function pluralize(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function runAudit() {
  console.log('============================================================');
  console.log('  70-theoretical-foundations 内容新鲜度审计');
  console.log(`  执行时间: ${formatDate(new Date())}`);
  console.log('============================================================\n');

  if (!fs.existsSync(ROOT_DIR)) {
    console.error(`错误: 目录不存在 ${ROOT_DIR}`);
    process.exit(1);
  }

  const files = findMarkdownFiles(ROOT_DIR);
  console.log(`扫描到 ${files.length} 个 Markdown 文件\n`);

  const results = {
    total: files.length,
    passed: 0,
    warnings: 0,
    errors: 0,
    missingFrontmatter: [],
    staleDocs: [],
    invalidUrls: [],
    missingFields: []
  };

  for (const file of files) {
    const relPath = path.relative(process.cwd(), file);
    const content = fs.readFileSync(file, 'utf-8');
    const { hasFrontmatter, data } = parseFrontmatter(content);

    let fileIssues = [];

    if (!hasFrontmatter) {
      results.missingFrontmatter.push(relPath);
      fileIssues.push('❌ 缺少 YAML frontmatter');
    } else {
      // 检查必需字段
      for (const field of REQUIRED_FIELDS) {
        if (!data[field]) {
          results.missingFields.push({ file: relPath, field });
          fileIssues.push(`❌ 缺少 frontmatter 字段: ${field}`);
        }
      }

      // 检查 last-updated / date
      const dateStr = data['last-updated'] || data['date'];
      if (dateStr) {
        const docDate = new Date(dateStr);
        if (!isNaN(docDate.getTime())) {
          const ageMs = NOW - docDate.getTime();
          if (ageMs > SIX_MONTHS_MS) {
            const daysOld = Math.floor(ageMs / (24 * 60 * 60 * 1000));
            results.staleDocs.push({ file: relPath, date: dateStr, daysOld });
            fileIssues.push(`⚠️  last-updated 已过期 (${daysOld} 天前)`);
          }
        } else {
          fileIssues.push(`❌ last-updated 日期格式无效: ${dateStr}`);
        }
      }

      // 检查 references 中的 URL 格式
      if (Array.isArray(data['references']) && data['references'].length > 0) {
        const refs = data['references'];
        const badUrls = refs.filter(r => isReferenceUrl(r) && !checkUrlFormat(r));
        if (badUrls.length > 0) {
          results.invalidUrls.push({ file: relPath, urls: badUrls });
          fileIssues.push(`⚠️  references 中存在 ${badUrls.length} 个格式错误的 URL`);
        }
      }
    }

    if (fileIssues.length === 0) {
      results.passed++;
    } else {
      results.warnings += fileIssues.filter(i => i.includes('⚠️')).length;
      results.errors += fileIssues.filter(i => i.includes('❌')).length;
      console.log(`📄 ${relPath}`);
      fileIssues.forEach(issue => console.log(`   ${issue}`));
      console.log('');
    }
  }

  // 汇总报告
  console.log('============================================================');
  console.log('                         审计汇总                           ');
  console.log('============================================================');
  console.log(`  总文档数       : ${results.total}`);
  console.log(`  通过检查       : ${results.passed}`);
  console.log(`  警告数         : ${results.warnings}`);
  console.log(`  错误数         : ${results.errors}`);
  console.log(`  缺少 frontmatter: ${results.missingFrontmatter.length}`);
  console.log(`  字段缺失       : ${results.missingFields.length}`);
  console.log(`  过期文档 (>6月): ${results.staleDocs.length}`);
  console.log(`  无效 URL       : ${results.invalidUrls.length}`);
  console.log('============================================================\n');

  if (results.missingFrontmatter.length > 0) {
    console.log('【缺少 frontmatter 的文件】');
    results.missingFrontmatter.forEach(f => console.log(`  - ${f}`));
    console.log('');
  }

  if (results.staleDocs.length > 0) {
    console.log('【过期文档】');
    results.staleDocs.forEach(({ file, date, daysOld }) => {
      console.log(`  - ${file} (last-updated: ${date}, ${daysOld} 天前)`);
    });
    console.log('');
  }

  if (results.invalidUrls.length > 0) {
    console.log('【格式错误的 URL】');
    results.invalidUrls.forEach(({ file, urls }) => {
      console.log(`  - ${file}`);
      urls.forEach(u => console.log(`      → ${u}`));
    });
    console.log('');
  }

  if (results.missingFields.length > 0) {
    console.log('【缺少的字段】');
    results.missingFields.forEach(({ file, field }) => {
      console.log(`  - ${file} 缺少 ${field}`);
    });
    console.log('');
  }

  // 建议
  console.log('============================================================');
  console.log('                         行动建议                           ');
  console.log('============================================================');
  if (results.errors === 0 && results.warnings === 0) {
    console.log('  ✅ 所有文档通过检查，内容新鲜度良好。');
  } else {
    if (results.staleDocs.length > 0) {
      console.log('  • 请优先更新过期文档的 last-updated 字段或修订内容');
    }
    if (results.missingFrontmatter.length > 0) {
      console.log('  • 为缺少 frontmatter 的文档补充标准元数据');
    }
    if (results.invalidUrls.length > 0) {
      console.log('  • 修复 references 中格式错误的 URL');
    }
    console.log(`  • 下次审计日期: ${formatDate(new Date(NOW + SIX_MONTHS_MS))}`);
  }
  console.log('============================================================');

  // 以非零退出码标记存在错误或警告
  process.exit(results.errors > 0 || results.warnings > 0 ? 1 : 0);
}

runAudit();
