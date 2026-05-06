#!/usr/bin/env node
/**
 * version-tracker-template.js
 * ============================
 * Svelte 版本追踪机器人模板
 * 
 * 用途：监控 Svelte 仓库的 tag 更新，检测源码文件变更，生成升级影响评估报告
 * 运行方式：可配置为 GitHub Actions cron job 或本地手动执行
 * 
 * 设计原则：
 *   - 不克隆仓库，仅使用 GitHub REST API
 *   - 缓存上次检查结果，增量比较
 *   - 生成 Markdown 格式的变更报告
 * 
 * 环境变量:
 *   GITHUB_TOKEN  (可选) — 提高 API 速率限制
 *   CACHE_FILE    (可选) — 缓存文件路径，默认 ./.version-tracker-cache.json
 * 
 * 使用方法:
 *   node scripts/version-tracker-template.js
 *   GITHUB_TOKEN=ghp_xxx node scripts/version-tracker-template.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============ 配置 ============
const CONFIG = {
  owner: 'sveltejs',
  repo: 'svelte',
  currentTag: 'svelte@5.55.5',
  // 需要监控的核心源码文件（相对仓库根目录）
  trackedFiles: [
    'packages/svelte/src/internal/client/reactivity/sources.js',
    'packages/svelte/src/internal/client/reactivity/deriveds.js',
    'packages/svelte/src/internal/client/reactivity/effects.js',
    'packages/svelte/src/internal/client/reactivity/batch.js',
    'packages/svelte/src/internal/client/reactivity/proxy.js',
    'packages/svelte/src/internal/client/runtime.js',
    'packages/svelte/src/internal/client/dom/operations.js',
    'packages/svelte/src/internal/client/dom/template.js',
    'packages/svelte/src/internal/client/dom/elements/class.js',
    'packages/svelte/src/internal/client/dom/elements/style.js',
    'packages/svelte/src/compiler/phases/1-parse/index.js',
    'packages/svelte/src/compiler/phases/3-transform/index.js',
  ],
  // 需要监控的外部依赖版本
  externalDeps: [
    { name: 'vite', repo: 'vitejs/vite', currentVersion: '6.3.x' },
    { name: 'typescript', repo: 'microsoft/TypeScript', currentVersion: '5.8.x' },
    { name: 'rolldown', repo: 'rolldown/rolldown', currentVersion: '0.x' },
  ],
  cacheFile: process.env.CACHE_FILE || join(__dirname, '.version-tracker-cache.json'),
};

const C = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

function log(msg, color = 'reset') {
  console.log(`${C[color]}${msg}${C.reset}`);
}

// ============ GitHub API 工具 ============

async function githubAPI(path) {
  const url = `https://api.github.com/${path}`;
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// ============ 缓存管理 ============

function loadCache() {
  if (!existsSync(CONFIG.cacheFile)) {
    return { lastCheck: null, fileHashes: {}, tags: [] };
  }
  return JSON.parse(readFileSync(CONFIG.cacheFile, 'utf-8'));
}

function saveCache(cache) {
  writeFileSync(CONFIG.cacheFile, JSON.stringify(cache, null, 2));
}

// ============ 核心功能 ============

/**
 * 获取仓库最新 tag 列表
 */
async function fetchLatestTags(limit = 5) {
  const tags = await githubAPI(
    `repos/${CONFIG.owner}/${CONFIG.repo}/tags?per_page=${limit}`
  );
  return tags.map(t => ({
    name: t.name,
    sha: t.commit.sha,
    url: t.commit.url,
  }));
}

/**
 * 获取指定文件在指定 ref 下的内容哈希
 */
async function fetchFileInfo(path, ref) {
  try {
    const data = await githubAPI(
      `repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}?ref=${ref}`
    );
    return {
      path,
      sha: data.sha,
      size: data.size,
      htmlUrl: data.html_url,
      lastModified: null, // 需要单独请求 commits API
    };
  } catch (e) {
    return { path, error: e.message };
  }
}

/**
 * 获取两个 ref 之间某文件的 diff 统计
 */
async function fetchFileCommits(path, sinceRef, untilRef) {
  // 简化：获取该文件最近的提交
  const commits = await githubAPI(
    `repos/${CONFIG.owner}/${CONFIG.repo}/commits?path=${encodeURIComponent(path)}&sha=${untilRef}&per_page=5`
  );
  return commits.map(c => ({
    sha: c.sha,
    message: c.commit.message.split('\n')[0],
    author: c.commit.author.name,
    date: c.commit.author.date,
    url: c.html_url,
  }));
}

/**
 * 生成变更影响评估
 */
function assessImpact(filePath, commits) {
  const path = filePath.toLowerCase();

  // 影响等级判定
  if (path.includes('reactivity/sources.js')) {
    return { level: 'CRITICAL', reason: 'Source 信号核心实现变更，直接影响所有 $state 行为' };
  }
  if (path.includes('reactivity/deriveds.js')) {
    return { level: 'HIGH', reason: 'Derived 计算逻辑变更，影响 $derived 语义' };
  }
  if (path.includes('reactivity/effects.js')) {
    return { level: 'HIGH', reason: 'Effect 调度变更，影响 $effect 执行时机' };
  }
  if (path.includes('reactivity/batch.js')) {
    return { level: 'HIGH', reason: 'Batch/flush 机制变更，影响更新原子性' };
  }
  if (path.includes('compiler/')) {
    return { level: 'MEDIUM', reason: '编译器行为变更，需重新验证编译输出' };
  }
  if (path.includes('dom/')) {
    return { level: 'MEDIUM', reason: 'DOM 操作辅助函数变更' };
  }
  if (path.includes('proxy.js')) {
    return { level: 'HIGH', reason: 'Proxy 响应式层变更，影响对象/数组响应式' };
  }
  return { level: 'LOW', reason: '一般性变更' };
}

/**
 * 生成 Markdown 报告
 */
function generateReport(newTag, changes, externalUpdates) {
  const date = new Date().toISOString().split('T')[0];
  const lines = [
    '# Svelte 版本追踪报告',
    '',
    `> **生成时间**: ${new Date().toISOString()}`,
    `> **基准版本**: ${CONFIG.currentTag}`,
    `> **检测到新版本**: ${newTag || '无'}`,
    '',
    '## 目录',
    '',
    '- [源码文件变更](#源码文件变更)',
    '- [外部依赖更新](#外部依赖更新)',
    '- [升级建议](#升级建议)',
    '',
    '---',
    '',
    '## 源码文件变更',
    '',
  ];

  if (changes.length === 0) {
    lines.push('✅ 所有追踪的源码文件在最新 tag 中未检测到变更。');
  } else {
    lines.push('| 文件 | 影响等级 | 变更说明 | 最近提交 |');
    lines.push('|:---|:---:|:---|:---|');
    for (const c of changes) {
      const impact = assessImpact(c.path, c.commits);
      const commitInfo = c.commits.length > 0
        ? `[${c.commits[0].message.substring(0, 40)}](${c.commits[0].url})`
        : 'N/A';
      lines.push(`| \`${c.path}\` | **${impact.level}** | ${impact.reason} | ${commitInfo} |`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 外部依赖更新');
  lines.push('');

  if (externalUpdates.length === 0) {
    lines.push('✅ 所有追踪的外部依赖未检测到新版本。');
  } else {
    lines.push('| 依赖 | 当前版本 | 最新版本 | 影响评估 |');
    lines.push('|:---|:---|:---|:---|');
    for (const u of externalUpdates) {
      lines.push(`| ${u.name} | ${u.currentVersion} | ${u.latestVersion} | ${u.assessment} |`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 升级建议');
  lines.push('');
  lines.push('### 文档维护检查清单');
  lines.push('');
  lines.push('```markdown');
  lines.push('- [ ] 验证所有源码引用的行号是否仍然准确');
  lines.push('- [ ] 检查 [25-reactivity-source-proofs](25-reactivity-source-proofs.md) 中的定理是否需要更新');
  lines.push('- [ ] 检查 [22-browser-rendering-pipeline](22-browser-rendering-pipeline.md) 的 Blink 引用是否仍然适用');
  lines.push('- [ ] 运行 `node scripts/verify-svelte-source-references.js` 重新验证');
  lines.push('- [ ] 更新文档 frontmatter 中的 `last updated` 日期');
  lines.push('- [ ] 在 [meta/MAINTENANCE_GUIDE](meta/MAINTENANCE_GUIDE.md) 中记录本次更新');
  lines.push('```');
  lines.push('');
  lines.push('### 自动化建议');
  lines.push('');
  lines.push('若变更影响等级包含 **CRITICAL** 或 **HIGH**：');
  lines.push('1. 优先人工审查相关源码文件的变更差异');
  lines.push('2. 更新对应文档中的源码引用和行号标注');
  lines.push('3. 重新验证所有形式化证明（如 25.md 中的定理）');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`> 报告由 version-tracker-template.js 自动生成`);

  return lines.join('\n');
}

// ============ 主流程 ============

async function main() {
  log('🤖 Svelte 版本追踪机器人', 'cyan');
  log(`   基准版本: ${CONFIG.currentTag}`, 'gray');
  log(`   追踪文件: ${CONFIG.trackedFiles.length} 个`, 'gray');
  log('');

  const cache = loadCache();

  // 1. 获取最新 tag
  log('📡 获取最新 tag...', 'cyan');
  const latestTags = await fetchLatestTags(10);
  const latestTag = latestTags.find(t => t.name.startsWith('svelte@'));

  if (!latestTag) {
    log('⚠️ 未找到 svelte@ 前缀的 tag', 'yellow');
    process.exit(0);
  }

  log(`   最新 tag: ${latestTag.name}`, latestTag.name === CONFIG.currentTag ? 'green' : 'yellow');
  log('');

  // 2. 检查外部依赖
  log('📡 检查外部依赖版本...', 'cyan');
  const externalUpdates = [];
  for (const dep of CONFIG.externalDeps) {
    try {
      const [owner, repo] = dep.repo.split('/');
      const tags = await githubAPI(`repos/${owner}/${repo}/tags?per_page=3`);
      const latest = tags[0]?.name || 'unknown';
      if (latest !== dep.currentVersion && !latest.includes(dep.currentVersion.replace('.x', ''))) {
        externalUpdates.push({
          ...dep,
          latestVersion: latest,
          assessment: '需要评估兼容性',
        });
        log(`   ⚠️ ${dep.name}: ${dep.currentVersion} → ${latest}`, 'yellow');
      } else {
        log(`   ✅ ${dep.name}: ${dep.currentVersion} (最新: ${latest})`, 'gray');
      }
    } catch (e) {
      log(`   ⚠️ ${dep.name}: 检查失败 (${e.message})`, 'yellow');
    }
  }
  log('');

  // 3. 检查源码文件变更
  log('📡 检查源码文件变更...', 'cyan');
  const changes = [];

  for (const file of CONFIG.trackedFiles) {
    try {
      const currentInfo = await fetchFileInfo(file, CONFIG.currentTag);
      const latestInfo = await fetchFileInfo(file, latestTag.name);

      if (currentInfo.error || latestInfo.error) {
        log(`   ⚠️ ${file}: 获取失败`, 'yellow');
        continue;
      }

      if (currentInfo.sha !== latestInfo.sha) {
        const commits = await fetchFileCommits(file, CONFIG.currentTag, latestTag.name);
        changes.push({
          path: file,
          currentSha: currentInfo.sha,
          latestSha: latestInfo.sha,
          commits: commits.slice(0, 3),
        });
        const impact = assessImpact(file, commits);
        log(`   📝 ${file}: 已变更 [${impact.level}]`, impact.level === 'CRITICAL' ? 'red' : 'yellow');
      } else {
        log(`   ✅ ${file}: 未变更`, 'gray');
      }

      // API 速率限制保护
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      log(`   ⚠️ ${file}: ${e.message}`, 'yellow');
    }
  }
  log('');

  // 4. 生成报告
  const report = generateReport(latestTag.name, changes, externalUpdates);
  const reportPath = join(__dirname, `version-tracker-report-${Date.now()}.md`);
  writeFileSync(reportPath, report);

  // 5. 更新缓存
  cache.lastCheck = new Date().toISOString();
  cache.lastTag = latestTag.name;
  cache.fileHashes = changes.reduce((acc, c) => {
    acc[c.path] = c.latestSha;
    return acc;
  }, cache.fileHashes || {});
  saveCache(cache);

  // 6. 控制台摘要
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('📊 追踪摘要', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log(`  最新 Svelte tag: ${latestTag.name}`, latestTag.name === CONFIG.currentTag ? 'green' : 'yellow');
  log(`  源码文件变更: ${changes.length} 个`, changes.length > 0 ? 'yellow' : 'green');
  log(`  外部依赖更新: ${externalUpdates.length} 个`, externalUpdates.length > 0 ? 'yellow' : 'green');
  log(`  报告已保存: ${reportPath}`, 'cyan');

  if (changes.some(c => assessImpact(c.path, c.commits).level === 'CRITICAL')) {
    log('');
    log('🚨 检测到 CRITICAL 级别变更！请立即人工审查。', 'red');
  }

  log('');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(2);
});
