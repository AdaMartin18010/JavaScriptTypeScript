#!/usr/bin/env node

/**
 * 内容过时标记机制 - 批量处理脚本
 *
 * 功能：
 * 1. 扫描 docs/, JSTS全景综述/, guides/ 下的 .md 文件
 * 2. 如果文件 frontmatter 中缺少 last-updated / review-cycle / status，则添加
 * 3. 安全处理已有 frontmatter 的文件（合并而非覆盖）
 *
 * 使用方法:
 *   node scripts/add-content-metadata.js
 */

const fs = require('fs');
const path = require('path');

const TODAY = '2026-04-27';
const NEXT_REVIEW = '2026-10-27';

const REQUIRED_FIELDS = ['last-updated', 'review-cycle', 'next-review', 'status'];
const DEFAULT_VALUES = {
  'last-updated': TODAY,
  'review-cycle': '6 months',
  'next-review': NEXT_REVIEW,
  'status': 'current',
};

const SCAN_DIRS = [
  path.join(__dirname, '..', 'docs'),
  path.join(__dirname, '..', 'JSTS全景综述'),
  path.join(__dirname, '..', 'guides'),
];

function parseFrontmatter(content) {
  const result = {
    hasFrontmatter: false,
    rawFrontmatter: '',
    body: content,
    data: {},
    lineEnd: '\n',
  };

  // Detect line ending
  if (content.includes('\r\n')) {
    result.lineEnd = '\r\n';
  }

  const trimmed = content.trimStart();
  if (!trimmed.startsWith('---')) {
    return result;
  }

  // Find the closing ---
  const lines = content.split(result.lineEnd);
  if (lines[0].trim() !== '---') {
    return result;
  }

  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    return result;
  }

  result.hasFrontmatter = true;
  result.rawFrontmatter = lines.slice(1, endIndex).join(result.lineEnd);
  result.body = lines.slice(endIndex + 1).join(result.lineEnd);

  // Parse YAML (simple key: value parser)
  const fmLines = result.rawFrontmatter.split(result.lineEnd);
  for (const line of fmLines) {
    const match = line.match(/^([\w-]+)\s*:\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      result.data[key] = value;
    }
  }

  return result;
}

function buildFrontmatter(data, lineEnd) {
  const lines = ['---'];
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (typeof val === 'string' && (val.includes(':') || val.includes('#') || val.includes('"'))) {
      lines.push(`${key}: "${val}"`);
    } else {
      lines.push(`${key}: ${val}`);
    }
  }
  lines.push('---');
  return lines.join(lineEnd) + lineEnd;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = parseFrontmatter(content);

  let needsUpdate = false;
  const mergedData = { ...parsed.data };

  for (const field of REQUIRED_FIELDS) {
    if (!(field in mergedData) || !mergedData[field]) {
      mergedData[field] = DEFAULT_VALUES[field];
      needsUpdate = true;
    }
  }

  if (!needsUpdate) {
    return { updated: false, path: filePath };
  }

  // Preserve original field order and append new ones at the end
  const orderedData = {};
  for (const key of Object.keys(parsed.data)) {
    orderedData[key] = parsed.data[key];
  }
  for (const field of REQUIRED_FIELDS) {
    if (!(field in parsed.data) || !parsed.data[field]) {
      orderedData[field] = DEFAULT_VALUES[field];
    }
  }

  const newFrontmatter = buildFrontmatter(orderedData, parsed.lineEnd);
  const newContent = newFrontmatter + parsed.body;

  fs.writeFileSync(filePath, newContent, 'utf-8');
  return { updated: true, path: filePath, added: REQUIRED_FIELDS.filter(f => !(f in parsed.data) || !parsed.data[f]) };
}

function findMarkdownFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findMarkdownFiles(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function main() {
  console.log('📝 开始扫描并添加内容元数据...\n');

  const allFiles = [];
  for (const dir of SCAN_DIRS) {
    const files = findMarkdownFiles(dir);
    console.log(`📂 ${path.relative(path.join(__dirname, '..'), dir)}: 发现 ${files.length} 个 .md 文件`);
    allFiles.push(...files);
  }

  console.log(`\n🔍 总计待扫描: ${allFiles.length} 个文件\n`);

  let updatedCount = 0;
  let skippedCount = 0;
  const updatedFiles = [];

  for (const filePath of allFiles) {
    const result = processFile(filePath);
    if (result.updated) {
      updatedCount++;
      const relPath = path.relative(path.join(__dirname, '..'), filePath);
      updatedFiles.push(relPath);
      console.log(`✅ ${relPath}`);
      console.log(`   添加字段: ${result.added.join(', ')}`);
    } else {
      skippedCount++;
    }
  }

  console.log(`\n📊 处理结果`);
  console.log(`   已更新: ${updatedCount}`);
  console.log(`   已跳过 (无需更新): ${skippedCount}`);
  console.log(`   总计: ${allFiles.length}`);

  if (updatedCount > 0) {
    console.log(`\n📝 已更新文件列表:`);
    for (const f of updatedFiles) {
      console.log(`   - ${f}`);
    }
  }
}

main();
