#!/usr/bin/env node

/**
 * Svelte 专题数据自动刷新脚本
 *
 * 功能：
 * 1. 从 GitHub API 获取 sveltejs/svelte 和 sveltejs/kit 的 Stars 数
 * 2. 从 npm Registry 获取 Svelte 生态包的下载量
 * 3. 更新 data/stats.json 和 data/npm-stats.json
 * 4. 将最新数据同步到 website/svelte-signals-stack/ 专题文件
 *
 * 环境变量：
 *   GITHUB_TOKEN - GitHub Personal Access Token（可选，强烈建议配置以提高 rate limit）
 *
 * 使用方法：
 *   node scripts/update-svelte-data.js
 *   GITHUB_TOKEN=your_token node scripts/update-svelte-data.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ==================== 配置 ====================

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

const DATA_DIR = path.join(__dirname, '..', 'data');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const NPM_STATS_FILE = path.join(DATA_DIR, 'npm-stats.json');

const TOPIC_DIR = path.join(__dirname, '..', 'website', 'svelte-signals-stack');

// Svelte 生态 GitHub 仓库
const SVELTE_REPOS = [
  { owner: 'sveltejs', repo: 'svelte', name: 'Svelte', npmPackage: 'svelte' },
  { owner: 'sveltejs', repo: 'kit', name: 'SvelteKit', npmPackage: '@sveltejs/kit' },
];

// Svelte 生态 npm 包（按优先级排序）
const SVELTE_NPM_PACKAGES = [
  'svelte',
  '@sveltejs/kit',
  'vite-plugin-svelte',
  '@sveltejs/adapter-node',
  '@sveltejs/adapter-cloudflare',
  '@sveltejs/adapter-vercel',
  '@sveltejs/adapter-static',
  'svelte-check',
  'svelte-preprocess',
  '@sveltejs/adapter-auto',
  'create-svelte',
];

// ==================== 工具函数 ====================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

function formatStars(num) {
  if (num >= 10000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toLocaleString();
}

/**
 * 带 429 重试的 HTTPS GET JSON 请求
 */
function fetchJSON(url, options = {}) {
  const { retries = 3, delay = 1000, headers = {} } = options;

  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers, timeout: 15000 }, (res) => {
      // 重定向
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchJSON(res.headers.location, { retries, delay, headers }).then(resolve).catch(reject);
        return;
      }

      // 429 速率限制处理
      if (res.statusCode === 429 && retries > 0) {
        const retryAfter = res.headers['retry-after'];
        const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : delay;
        const source = url.includes('github') ? 'GitHub' : 'npm';
        console.warn(`  ⚠️  ${source} API 429，${waitMs}ms 后重试... (剩余 ${retries} 次)`);
        setTimeout(() => {
          fetchJSON(url, { retries: retries - 1, delay: delay * 2, headers })
            .then(resolve)
            .catch(reject);
        }, waitMs);
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`${res.statusCode}: ${json.message || res.statusMessage || data.slice(0, 200)}`));
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(new Error(`JSON 解析失败: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

// ==================== GitHub API ====================

async function fetchGitHubRepo(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const headers = {
    'User-Agent': 'JSTS-Svelte-Data-Updater',
    'Accept': 'application/vnd.github.v3+json',
  };
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  const data = await fetchJSON(url, { headers });

  return {
    owner,
    repo,
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    pushedAt: data.pushed_at,
    language: data.language,
    description: data.description,
    fetchedAt: new Date().toISOString(),
    source: 'GitHub API',
  };
}

// ==================== npm Registry API ====================

async function fetchNpmDownloads(packageName) {
  const encoded = encodeURIComponent(packageName);

  const [weeklyData, monthlyData] = await Promise.all([
    fetchJSON(`https://api.npmjs.org/downloads/point/last-week/${encoded}`),
    fetchJSON(`https://api.npmjs.org/downloads/point/last-month/${encoded}`),
  ]);

  return {
    package: packageName,
    weekly: weeklyData.downloads || 0,
    monthly: monthlyData.downloads || 0,
    lastUpdated: new Date().toISOString().split('T')[0],
    source: 'npm Registry API',
  };
}

async function fetchNpmWithRetry(pkg, delay = 1000) {
  try {
    const stats = await fetchNpmDownloads(pkg);
    console.log(`  ✅ ${pkg}: ${formatNumber(stats.weekly)}/周, ${formatNumber(stats.monthly)}/月`);
    return stats;
  } catch (error) {
    console.error(`  ❌ ${pkg}: ${error.message}`);
    // 如果是 429，已经在上层 retry 过了，这里直接返回失败
    return {
      package: pkg,
      weekly: 0,
      monthly: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      error: error.message,
      source: 'npm Registry API (failed)',
    };
  }
}

// ==================== 数据文件更新 ====================

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.warn(`⚠️  读取 ${filePath} 失败: ${e.message}`);
    return null;
  }
}

function saveJson(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * 更新 data/stats.json 中的 Svelte 相关数据
 */
function updateStatsJson(githubResults, npmResults) {
  const data = loadJson(STATS_FILE) || {
    generatedAt: new Date().toISOString(),
    totalRepos: 0,
    totalNpmPackages: 0,
    repositories: {},
    packages: {},
  };

  data.generatedAt = new Date().toISOString();

  // 更新 repositories 部分
  for (const repo of githubResults) {
    const key = `${repo.owner}/${repo.repo}`;
    data.repositories[key] = {
      owner: repo.owner,
      repo: repo.repo,
      github: {
        starsBadge: `https://img.shields.io/github/stars/${repo.owner}/${repo.repo}?style=flat-square`,
        url: `https://github.com/${repo.owner}/${repo.repo}`,
        stars: repo.stars,
        forks: repo.forks,
        openIssues: repo.openIssues,
        fetchedAt: repo.fetchedAt,
      },
      npm: null,
    };

    // 关联 npm 包
    const npmPkg = SVELTE_REPOS.find(r => r.owner === repo.owner && r.repo === repo.repo)?.npmPackage;
    if (npmPkg && npmResults[npmPkg] && npmResults[npmPkg].weekly > 0) {
      data.repositories[key].npm = {
        package: npmPkg,
        weekly: npmResults[npmPkg].weekly,
        monthly: npmResults[npmPkg].monthly,
        lastUpdated: npmResults[npmPkg].lastUpdated,
      };
    }
  }

  // 更新 packages 部分（合并所有 npm 结果）
  for (const [pkg, stats] of Object.entries(npmResults)) {
    if (stats.weekly > 0) {
      data.packages[pkg] = {
        weekly: stats.weekly,
        monthly: stats.monthly,
        lastUpdated: stats.lastUpdated,
      };
    }
  }

  saveJson(STATS_FILE, data);
  console.log(`💾 已更新: ${STATS_FILE}`);
}

/**
 * 更新 data/npm-stats.json 中的 Svelte 相关数据
 */
function updateNpmStatsJson(npmResults) {
  const data = loadJson(NPM_STATS_FILE) || {
    generatedAt: new Date().toISOString(),
    totalPackages: 0,
    stats: {},
  };

  data.generatedAt = new Date().toISOString();

  for (const [pkg, stats] of Object.entries(npmResults)) {
    if (stats.weekly > 0) {
      data.stats[pkg] = {
        weekly: stats.weekly,
        monthly: stats.monthly,
        lastUpdated: stats.lastUpdated,
      };
    }
  }

  data.totalPackages = Object.keys(data.stats).length;

  saveJson(NPM_STATS_FILE, data);
  console.log(`💾 已更新: ${NPM_STATS_FILE}`);
}

// ==================== Markdown 文件同步 ====================

/**
 * 安全替换 Markdown 文件中的表格数据
 * 如果找不到匹配模式，则返回 false 并输出提示
 */
function updateMarkdownTable(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  文件不存在: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let updated = false;

  for (const { pattern, replacement, description } of replacements) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      updated = true;
      console.log(`  ✏️  已更新: ${description}`);
    } else {
      console.warn(`  ⚠️  未找到匹配模式，跳过: ${description}`);
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  return updated;
}

/**
 * 同步数据到专题 Markdown 文件
 */
function syncTopicFiles(githubResults, npmResults) {
  console.log('\n📄 同步专题文件...\n');

  const svelte = githubResults.find(r => r.repo === 'svelte');
  const svelteKit = githubResults.find(r => r.repo === 'kit');
  const svelteNpm = npmResults['svelte'];
  const kitNpm = npmResults['@sveltejs/kit'];

  if (!svelte || !svelteKit) {
    console.warn('⚠️  缺少 GitHub 数据，跳过 Markdown 同步');
    return;
  }

  const svelteStars = formatStars(svelte.stars);
  const kitStars = formatStars(svelteKit.stars);

  // index.md: 技术栈核心数据表
  const indexPath = path.join(TOPIC_DIR, 'index.md');
  updateMarkdownTable(indexPath, [
    {
      description: 'index.md Svelte Stars',
      pattern: /(\*\*Svelte\*\* \| [\d.]+x? \| )[\d.k+]+/,
      replacement: `$1${svelteStars}+`,
    },
    {
      description: 'index.md SvelteKit Stars',
      pattern: /(\*\*SvelteKit\*\* \| [\d.]+x? \| )[\d.k+]+/,
      replacement: `$1${kitStars}+`,
    },
    {
      description: 'index.md 社区生态 Svelte Stars',
      pattern: /(\*\*Svelte\*\* \| )[\d.k+]+(\+? \| )[\d.MK+]+/,
      replacement: `$1${svelteStars}+$2${svelteNpm?.weekly ? formatNumber(svelteNpm.weekly) + '+' : 'N/A'}`,
    },
    {
      description: 'index.md 社区生态 SvelteKit Stars',
      pattern: /(\*\*SvelteKit\*\* \| )[\d.k+]+(\+? \| )[\d.MK+]+/,
      replacement: `$1${kitStars}+$2${kitNpm?.weekly ? formatNumber(kitNpm.weekly) + '+' : 'N/A'}`,
    },
    {
      description: 'index.md 数据来源时间戳',
      pattern: /> 数据来源：GitHub（\d{4}-\d{2}-\d{2}）、npm Registry（\d{4}-\d{2} 周均）/,
      replacement: `> 数据来源：GitHub（${new Date().toISOString().split('T')[0]}）、npm Registry（${new Date().toISOString().slice(0, 7)} 周均）`,
    },
    {
      description: 'index.md 最后更新',
      pattern: /> 最后更新: \d{4}-\d{2}-\d{2}/,
      replacement: `> 最后更新: ${new Date().toISOString().split('T')[0]}`,
    },
  ]);

  // 10-framework-comparison.md: 核心指标对比表
  const comparePath = path.join(TOPIC_DIR, '10-framework-comparison.md');
  updateMarkdownTable(comparePath, [
    {
      description: 'framework-comparison.md Svelte Stars',
      pattern: /(\*\*GitHub Stars\*\* \| )[\d.k]+( \| )/,
      replacement: `$1${svelteStars}$2`,
    },
    {
      description: 'framework-comparison.md Svelte npm',
      pattern: /(\*\*npm 周下载量\*\* \| )[\d.MK]+( \| )/,
      replacement: `$1${svelteNpm?.weekly ? formatNumber(svelteNpm.weekly) : 'N/A'}$2`,
    },
    {
      description: 'framework-comparison.md 数据基准时间',
      pattern: /(数据基准.*GitHub Stars )\d{4}-\d{2}(.*npm registry )\d{4}-\d{2}/,
      replacement: `$1${new Date().toISOString().slice(0, 7)}$2${new Date().toISOString().slice(0, 7)}`,
    },
    {
      description: 'framework-comparison.md 最后更新',
      pattern: /最后更新: \d{4}-\d{2}-\d{2}/,
      replacement: `最后更新: ${new Date().toISOString().split('T')[0]}`,
    },
  ]);

  // 19-frontier-tracking.md: 更新最后更新时间
  const trackingPath = path.join(TOPIC_DIR, '19-frontier-tracking.md');
  updateMarkdownTable(trackingPath, [
    {
      description: 'frontier-tracking.md 最后更新',
      pattern: /最后更新: \d{4}-\d{2}-\d{2}/g,
      replacement: `最后更新: ${new Date().toISOString().split('T')[0]}`,
    },
  ]);
}

// ==================== 手动更新提示 ====================

function printManualUpdateHints(githubResults, npmResults) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 手动更新提示（如果自动同步未完全覆盖）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const svelte = githubResults.find(r => r.repo === 'svelte');
  const svelteKit = githubResults.find(r => r.repo === 'kit');

  if (svelte) {
    console.log(`Svelte (sveltejs/svelte):`);
    console.log(`  Stars: ${svelte.stars.toLocaleString()} (${formatStars(svelte.stars)})`);
    console.log(`  Forks: ${svelte.forks.toLocaleString()}`);
    console.log(`  Open Issues: ${svelte.openIssues.toLocaleString()}`);
  }

  if (svelteKit) {
    console.log(`\nSvelteKit (sveltejs/kit):`);
    console.log(`  Stars: ${svelteKit.stars.toLocaleString()} (${formatStars(svelteKit.stars)})`);
    console.log(`  Forks: ${svelteKit.forks.toLocaleString()}`);
    console.log(`  Open Issues: ${svelteKit.openIssues.toLocaleString()}`);
  }

  console.log('\nnpm 下载量 (周/月):');
  for (const pkg of SVELTE_NPM_PACKAGES) {
    const stats = npmResults[pkg];
    if (stats && stats.weekly > 0) {
      console.log(`  ${pkg}: ${stats.weekly.toLocaleString()} / ${stats.monthly.toLocaleString()}`);
    } else {
      console.log(`  ${pkg}: 获取失败${stats?.error ? ` (${stats.error})` : ''}`);
    }
  }

  console.log('\n请检查以下文件中的数据表格是否需要手动更新：');
  console.log(`  - ${path.join('website', 'svelte-signals-stack', 'index.md')} (技术栈核心数据、社区生态数据)`);
  console.log(`  - ${path.join('website', 'svelte-signals-stack', '10-framework-comparison.md')} (核心指标对比)`);
  console.log(`  - ${path.join('website', 'svelte-signals-stack', '19-frontier-tracking.md')} (版本追踪)`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// ==================== 主流程 ====================

async function main() {
  console.log('🚀 Svelte 专题数据自动刷新\n');

  if (!GITHUB_TOKEN) {
    console.warn('⚠️  未设置 GITHUB_TOKEN 环境变量，GitHub API 速率限制为 60 请求/小时');
    console.warn('   建议配置: export GITHUB_TOKEN=ghp_xxxxxxxxxxxx\n');
  } else {
    console.log('✅ 已使用 GITHUB_TOKEN 进行认证\n');
  }

  const githubResults = [];
  const npmResults = {};
  let githubFailed = false;
  let npmFailed = false;

  // ---- 获取 GitHub 数据 ----
  console.log('📡 获取 GitHub Stars...');
  for (const repo of SVELTE_REPOS) {
    process.stdout.write(`  ${repo.owner}/${repo.repo}... `);
    try {
      const data = await fetchGitHubRepo(repo.owner, repo.repo);
      githubResults.push(data);
      console.log(`✅ ${data.stars.toLocaleString()} stars`);
    } catch (error) {
      console.error(`❌ ${error.message}`);
      githubFailed = true;
    }
    // GitHub API 请求间隔，避免触发 secondary rate limit
    await sleep(800);
  }

  // ---- 获取 npm 数据 ----
  console.log('\n📦 获取 npm 下载量...');
  for (const pkg of SVELTE_NPM_PACKAGES) {
    const stats = await fetchNpmWithRetry(pkg);
    npmResults[pkg] = stats;
    if (stats.error) npmFailed = true;
    // npm 请求间隔
    await sleep(600);
  }

  // ---- 保存 JSON 数据 ----
  console.log('\n💾 更新数据文件...');
  if (githubResults.length > 0 || Object.keys(npmResults).length > 0) {
    updateStatsJson(githubResults, npmResults);
    updateNpmStatsJson(npmResults);
  } else {
    console.error('❌ 没有任何数据获取成功，跳过文件更新');
  }

  // ---- 同步 Markdown ----
  syncTopicFiles(githubResults, npmResults);

  // ---- 输出手动提示 ----
  printManualUpdateHints(githubResults, npmResults);

  // ---- 总结 ----
  console.log('✨ 完成!\n');
  console.log(`GitHub: ${githubResults.length}/${SVELTE_REPOS.length} 成功`);
  console.log(`npm: ${Object.values(npmResults).filter(s => s.weekly > 0).length}/${SVELTE_NPM_PACKAGES.length} 成功`);

  if (githubFailed || npmFailed) {
    console.log('\n⚠️  部分数据获取失败，请查看上方提示进行手动补充');
    process.exitCode = 1;
  }
}

// 如果直接运行
if (require.main === module) {
  main().catch(err => {
    console.error('❌ 未处理的错误:', err);
    process.exit(1);
  });
}

module.exports = {
  fetchGitHubRepo,
  fetchNpmDownloads,
  updateStatsJson,
  updateNpmStatsJson,
  syncTopicFiles,
  SVELTE_REPOS,
  SVELTE_NPM_PACKAGES,
};
