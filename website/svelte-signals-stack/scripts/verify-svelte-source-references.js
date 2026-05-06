#!/usr/bin/env node
/**
 * verify-svelte-source-references.js
 * ==================================
 * Svelte 源码引用校验脚本
 *
 * 用途：验证文档中引用的 Svelte 源码路径是否指向 svelte@5.55.5 标签下的真实文件
 * 校验方式：通过 GitHub Web API (raw) 验证文件存在性，不克隆仓库
 *
 * 使用方法:
 *   node scripts/verify-svelte-source-references.js [文件或目录]
 *   node scripts/verify-svelte-source-references.js --ci   # CI 模式：仅 JSON 输出
 *   默认扫描: ../ 目录下所有 .md 文件
 *
 * 输出: 控制台报告 + verify-report-[timestamp].json
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SVELTE_TAG = 'svelte@5.55.5';
const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/sveltejs/svelte/refs/tags/${SVELTE_TAG}`;

// CI 模式检测
const CI_MODE = process.argv.includes('--ci');

// 需要验证的路径模式
const SVELTE_PATH_PATTERNS = [
  /packages\/svelte\/src\/internal\/client\/[\w\/\-.]+/g,
  /packages\/svelte\/src\/compiler\/[\w\/\-.]+/g,
  /packages\/svelte\/src\/internal\/shared\/[\w\/\-.]+/g,
];

// 颜色输出（CI 模式禁用）
const C = CI_MODE
  ? { reset: '', green: '', red: '', yellow: '', cyan: '', gray: '' }
  : {
      reset: '\x1b[0m',
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      cyan: '\x1b[36m',
      gray: '\x1b[90m',
    };

function log(msg, color = 'reset') {
  console.log(`${C[color]}${msg}${C.reset}`);
}

/**
 * 从 Markdown 文本中提取所有 GitHub Svelte 源码引用
 */
function extractReferences(content, filePath) {
  const refs = [];
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // 匹配完整的 GitHub blob URL
    const blobMatches = line.matchAll(
      /https:\/\/github\.com\/sveltejs\/svelte\/blob\/[^/]+\/([^)\s]+)/g
    );
    for (const m of blobMatches) {
      refs.push({
        type: 'github-blob',
        path: m[1],
        line: idx + 1,
        context: line.trim(),
        sourceFile: filePath,
      });
    }

    // 匹配 raw 引用
    const rawMatches = line.matchAll(
      /https:\/\/raw\.githubusercontent\.com\/sveltejs\/svelte\/[^/]+\/([^)\s]+)/g
    );
    for (const m of rawMatches) {
      refs.push({
        type: 'github-raw',
        path: m[1],
        line: idx + 1,
        context: line.trim(),
        sourceFile: filePath,
      });
    }

    // 匹配相对路径引用（如 `packages/svelte/src/...`）
    for (const pattern of SVELTE_PATH_PATTERNS) {
      const matches = line.matchAll(pattern);
      for (const m of matches) {
        // 去重：如果已经有完整 URL 引用，跳过
        const alreadyCovered = refs.some(r => m[0].startsWith(r.path));
        if (!alreadyCovered) {
          refs.push({
            type: 'relative-path',
            path: m[0],
            line: idx + 1,
            context: line.trim(),
            sourceFile: filePath,
          });
        }
      }
    }
  });

  return refs;
}

/**
 * 判断路径是否为目录（以 / 结尾或无文件扩展名）
 */
function isDirectoryPath(path) {
  // 以 / 结尾的是目录
  if (path.endsWith('/')) return true;
  // 检查最后一段是否包含文件扩展名
  const lastSegment = path.split('/').pop();
  // 如果最后一段没有点号，或者点号后看起来不像扩展名（如 .d 或 .test）
  // 这里采用保守策略：只有明确的文件扩展名才视为文件
  const hasFileExtension = /\.[a-zA-Z0-9]{1,10}$/.test(lastSegment);
  return !hasFileExtension;
}

/**
 * 验证单个路径在 GitHub 上是否存在
 */
async function verifyPath(ref) {
  // 目录路径跳过验证（GitHub raw API 不支持目录）
  if (isDirectoryPath(ref.path)) {
    return {
      ...ref,
      status: 'SKIPPED',
      ok: false,
      skipped: true,
      reason: 'directory path not verifiable via raw API',
      checkedUrl: `${GITHUB_RAW_BASE}/${ref.path}`,
    };
  }

  const url = `${GITHUB_RAW_BASE}/${ref.path}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, { signal: controller.signal, method: 'HEAD' });
    clearTimeout(timeout);

    return {
      ...ref,
      status: res.status,
      ok: res.status === 200,
      checkedUrl: url,
    };
  } catch (e) {
    return {
      ...ref,
      status: 0,
      ok: false,
      error: e.message,
      checkedUrl: url,
    };
  }
}

/**
 * 递归获取目录下所有 .md 文件
 */
function getMarkdownFiles(dir, files = []) {
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      // 跳过 node_modules 和 .git
      if (item === 'node_modules' || item === '.git' || item === 'scripts') continue;
      getMarkdownFiles(fullPath, files);
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * 主函数
 */
async function main() {
  const targetArg = process.argv.find((arg, idx) => idx > 1 && !arg.startsWith('--'));
  const target = targetArg || resolve(__dirname, '..');

  if (!CI_MODE) {
    log('🔍 Svelte 源码引用校验工具', 'cyan');
    log(`   目标: ${target}`, 'gray');
    log(`   基准标签: ${SVELTE_TAG}`, 'gray');
    log('');
  }

  const mdFiles = statSync(target).isDirectory()
    ? getMarkdownFiles(target)
    : [target];

  if (!CI_MODE) {
    log(`📄 扫描到 ${mdFiles.length} 个 Markdown 文件`, 'cyan');
    log('');
  }

  let allRefs = [];

  // 提取所有引用
  for (const file of mdFiles) {
    const content = readFileSync(file, 'utf-8');
    const refs = extractReferences(content, file);
    allRefs.push(...refs);
    if (!CI_MODE && refs.length > 0) {
      log(`  ${refs.length} 个引用: ${file.replace(__dirname, '')}`, 'gray');
    }
  }

  // 去重
  const seen = new Set();
  allRefs = allRefs.filter(r => {
    const key = `${r.path}:${r.line}:${r.sourceFile}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (!CI_MODE) {
    log('');
    log(`🔗 共提取 ${allRefs.length} 个唯一引用`, 'cyan');
    log('');
  }

  // 分批验证（避免并发过多）
  const BATCH_SIZE = 5;
  const results = [];

  for (let i = 0; i < allRefs.length; i += BATCH_SIZE) {
    const batch = allRefs.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(verifyPath));
    results.push(...batchResults);

    if (!CI_MODE) {
      const progress = Math.round(((i + batch.length) / allRefs.length) * 100);
      process.stdout.write(`\r  验证进度: ${progress}% (${i + batch.length}/${allRefs.length})`);
    }
  }
  if (!CI_MODE) process.stdout.write('\r\n');

  // 分类结果
  const passed = results.filter(r => r.ok);
  const skipped = results.filter(r => r.skipped);
  const failed = results.filter(r => !r.ok && !r.skipped);

  // 控制台报告
  if (!CI_MODE) {
    log('');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('📊 校验报告', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log(`  ✅ 通过: ${passed.length}`, 'green');
    log(`  ⏭️  跳过: ${skipped.length} (目录路径)`, 'yellow');
    log(`  ❌ 失败: ${failed.length}`, failed.length > 0 ? 'red' : 'green');
    log('');

    if (failed.length > 0) {
      log('❌ 失败的引用:', 'red');
      for (const r of failed) {
        log(`  [${r.sourceFile.split(/[\\/]/).pop()}:${r.line}]`, 'yellow');
        log(`    路径: ${r.path}`, 'gray');
        log(`    状态: ${r.status} ${r.error || ''}`, 'red');
        log(`    上下文: ${r.context.substring(0, 100)}`, 'gray');
        log('');
      }
    }

    if (passed.length > 0) {
      log('✅ 通过的引用摘要（按文件）:', 'green');
      const byFile = passed.reduce((acc, r) => {
        acc[r.sourceFile] = (acc[r.sourceFile] || 0) + 1;
        return acc;
      }, {});
      for (const [file, count] of Object.entries(byFile)) {
        log(`  ${file.split(/[\\/]/).pop()}: ${count} 个`, 'gray');
      }
      log('');
    }
  }

  // 写入报告文件
  const reportPath = join(__dirname, `verify-report-${Date.now()}.json`);
  const reportData = {
    meta: {
      timestamp: new Date().toISOString(),
      svelteTag: SVELTE_TAG,
      totalRefs: allRefs.length,
      passed: passed.length,
      skipped: skipped.length,
      failed: failed.length,
    },
    passed: passed.map(r => ({
      path: r.path,
      line: r.line,
      sourceFile: r.sourceFile,
      checkedUrl: r.checkedUrl,
    })),
    skipped: skipped.map(r => ({
      path: r.path,
      line: r.line,
      sourceFile: r.sourceFile,
      reason: r.reason,
    })),
    failed: failed.map(r => ({
      path: r.path,
      line: r.line,
      sourceFile: r.sourceFile,
      status: r.status,
      error: r.error,
      context: r.context.substring(0, 200),
    })),
  };
  writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

  if (!CI_MODE) {
    log(`📄 详细报告已保存: ${reportPath}`, 'cyan');
  }

  // CI 模式输出 JSON 到 stdout
  if (CI_MODE) {
    console.log(JSON.stringify({
      summary: {
        total: allRefs.length,
        passed: passed.length,
        skipped: skipped.length,
        failed: failed.length,
      },
      failed: failed.map(r => ({
        file: r.sourceFile.split(/[\\/]/).pop(),
        line: r.line,
        path: r.path,
      })),
    }));
  }

  // 返回码：仅真正的失败才返回 1，跳过不算失败
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(2);
});
