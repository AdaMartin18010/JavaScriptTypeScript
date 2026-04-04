#!/usr/bin/env node

/**
 * 统计数据集成脚本
 * 
 * 功能：
 * 1. 合并 GitHub Stars 和 npm 下载量数据
 * 2. 生成完整的统计报告
 * 3. 支持多种输出格式（JSON、Markdown）
 * 4. 可与 GitHub Actions 集成自动更新
 * 
 * 使用方法:
 *   node scripts/update-stats.js              # 完整更新
 *   node scripts/update-stats.js --stars-only # 仅更新 Stars
 *   node scripts/update-stats.js --npm-only   # 仅更新 npm 数据
 *   node scripts/update-stats.js --report     # 生成报告
 */

const fs = require('fs');
const path = require('path');
const { 
  getBatchStats, 
  saveStats: saveNpmStats, 
  loadStats: loadNpmStats,
  generateReport: generateNpmReport,
  DEFAULT_PACKAGES 
} = require('./npm-stats');

// 路径配置
const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const README_PATH = path.join(ROOT_DIR, 'README.md');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const NPM_STATS_FILE = path.join(DATA_DIR, 'npm-stats.json');
const REPORT_FILE = path.join(DATA_DIR, 'STATS_REPORT.md');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * 从 README 提取 GitHub 仓库信息
 * @param {string} content - README 内容
 * @returns {Array<{owner: string, repo: string, fullName: string}>}
 */
function extractGitHubRepos(content) {
  const repoRegex = /https:\/\/github\.com\/([^/\s]+)\/([^/\s)]+)/g;
  const repos = [];
  const seen = new Set();
  
  let match;
  while ((match = repoRegex.exec(content)) !== null) {
    const [, owner, repo] = match;
    const fullName = `${owner}/${repo}`;
    
    if (!seen.has(fullName)) {
      seen.add(fullName);
      repos.push({ owner, repo, fullName });
    }
  }
  
  return repos;
}

/**
 * 从 GitHub URL 推断 npm 包名
 * @param {string} owner - 仓库所有者
 * @param {string} repo - 仓库名
 * @returns {string|null} - 可能的 npm 包名
 */
function inferNpmPackage(owner, repo) {
  // 常见映射
  const specialCases = {
    'expressjs': 'express',
    'fastify': 'fastify',
    'nestjs': '@nestjs/core',
    'honojs': 'hono',
    'elysiajs': 'elysia',
    'vercel': 'next',
    'nuxt': 'nuxt',
    'sveltejs': '@sveltejs/kit',
    'remix-run': '@remix-run/core',
    'withastro': 'astro',
    'vitejs': 'vite',
    'evanw': 'esbuild',
    'microsoft': 'typescript',
    'swc-project': '@swc/core',
    'rollup': 'rollup',
    'jestjs': 'jest',
    'vitest-dev': 'vitest',
    'prisma': '@prisma/client',
    'typeorm': 'typeorm',
    'drizzle-team': 'drizzle-orm',
    'sequelize': 'sequelize',
    'automattic': 'mongoose',
    'lodash': 'lodash',
    'ramda': 'ramda',
    'iamkun': 'dayjs',
    'date-fns': 'date-fns',
    'colinhacks': 'zod',
    'trpc': '@trpc/server',
    'pmndrs': 'zustand',
    'reduxjs': 'redux',
    'tanstack': '@tanstack/react-query',
    'ant-design': 'antd',
    'mui': '@mui/material',
    'chakra-ui': '@chakra-ui/react',
    'shadcn': '@shadcn/ui',
    'eslint': 'eslint',
    'prettier': 'prettier',
    'biomejs': 'biome',
    'privatenumber': 'tsx',
    'unitech': 'pm2',
  };
  
  if (specialCases[owner]) {
    return specialCases[owner];
  }
  
  // 默认使用仓库名
  return repo.toLowerCase()
    .replace(/^node-/, '')
    .replace(/\.js$/, '');
}

/**
 * 更新 README 中的 Stars 徽章（带时间戳防缓存）
 * @param {string} content - README 内容
 * @returns {string} - 更新后的内容
 */
function updateStarsBadges(content) {
  const timestamp = Date.now();
  const badgeRegex = /(https:\/\/img\.shields\.io\/github\/stars\/[^?\s]+)(\?[^\s]*)?/g;
  
  return content.replace(badgeRegex, (match, baseUrl) => {
    const cleanUrl = baseUrl.replace(/\?.*$/, '');
    return `${cleanUrl}?style=flat-square&cacheSeconds=3600&t=${timestamp}`;
  });
}

/**
 * 获取 GitHub Stars 数据
 * 注意：实际获取 Stars 需要 GitHub API，这里模拟/占位
 * @param {Array} repos - 仓库列表
 * @returns {Object} - Stars 数据
 */
async function fetchGitHubStars(repos) {
  // 这里可以集成 GitHub API 获取真实数据
  // 目前使用 shields.io 的实时徽章，无需额外 API 调用
  console.log(`📊 发现 ${repos.length} 个 GitHub 仓库`);
  
  const starsData = {};
  repos.forEach(({ fullName }) => {
    starsData[fullName] = {
      url: `https://img.shields.io/github/stars/${fullName}?style=flat-square`,
      badge: `https://img.shields.io/github/stars/${fullName}?style=flat-square`,
    };
  });
  
  return starsData;
}

/**
 * 合并 GitHub 和 npm 统计数据
 * @param {Object} githubData - GitHub 数据
 * @param {Object} npmData - npm 数据
 * @param {Array} repos - 仓库列表
 * @returns {Object} - 合并后的数据
 */
function mergeStats(githubData, npmData, repos) {
  const merged = {
    generatedAt: new Date().toISOString(),
    totalRepos: repos.length,
    totalNpmPackages: Object.keys(npmData || {}).length,
    repositories: {},
    packages: npmData || {},
  };
  
  repos.forEach(({ owner, repo, fullName }) => {
    const npmPackage = inferNpmPackage(owner, repo);
    const npmStats = npmData?.[npmPackage];
    
    merged.repositories[fullName] = {
      owner,
      repo,
      github: {
        starsBadge: githubData[fullName]?.badge,
        url: `https://github.com/${fullName}`,
      },
      npm: npmStats ? {
        package: npmPackage,
        weekly: npmStats.weekly,
        monthly: npmStats.monthly,
      } : null,
    };
  });
  
  return merged;
}

/**
 * 保存统计数据
 * @param {Object} stats - 统计数据
 */
function saveStats(stats) {
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  console.log(`💾 统计数据已保存: ${STATS_FILE}`);
}

/**
 * 加载统计数据
 * @returns {Object|null}
 */
function loadStats() {
  if (!fs.existsSync(STATS_FILE)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
}

/**
 * 生成完整统计报告
 * @param {Object} stats - 统计数据
 * @returns {string} - Markdown 报告
 */
function generateFullReport(stats) {
  const { repositories, packages, generatedAt } = stats;
  
  let report = '# 📊 完整统计报告\n\n';
  report += `> 生成时间: ${generatedAt}\n\n`;
  
  // GitHub 统计
  report += '## 🌟 GitHub 统计\n\n';
  report += `- 收录仓库数: ${Object.keys(repositories).length}\n\n`;
  
  // npm 统计
  const packageEntries = Object.entries(packages);
  const successfulPackages = packageEntries.filter(([, data]) => data.weekly > 0);
  
  report += '## 📦 npm 下载量统计\n\n';
  report += `- 追踪包数: ${packageEntries.length}\n`;
  report += `- 成功获取: ${successfulPackages.length}\n`;
  report += `- 总周下载量: ${formatNumber(successfulPackages.reduce((sum, [, d]) => sum + d.weekly, 0))}\n`;
  report += `- 总月下载量: ${formatNumber(successfulPackages.reduce((sum, [, d]) => sum + d.monthly, 0))}\n\n`;
  
  // 热门包排行
  if (successfulPackages.length > 0) {
    report += '### 🔥 热门 npm 包 Top 20\n\n';
    report += '| 排名 | 包名 | 周下载量 | 月下载量 |\n';
    report += '|------|------|----------|----------|\n';
    
    successfulPackages
      .sort((a, b) => b[1].weekly - a[1].weekly)
      .slice(0, 20)
      .forEach(([name, data], index) => {
        report += `| ${index + 1} | \`${name}\` | ${formatNumber(data.weekly)} | ${formatNumber(data.monthly)} |\n`;
      });
    
    report += '\n';
  }
  
  // 详细信息表
  report += '## 📋 详细数据\n\n';
  report += '| 仓库 | npm 包 | 周下载量 | 月下载量 |\n';
  report += '|------|--------|----------|----------|\n';
  
  Object.entries(repositories)
    .filter(([, data]) => data.npm)
    .sort((a, b) => (b[1].npm?.weekly || 0) - (a[1].npm?.weekly || 0))
    .forEach(([, data]) => {
      const npm = data.npm;
      report += `| [${data.owner}/${data.repo}](${data.github.url}) | \`${npm.package}\` | ${formatNumber(npm.weekly)} | ${formatNumber(npm.monthly)} |\n`;
    });
  
  return report;
}

/**
 * 格式化数字
 * @param {number} num 
 * @returns {string}
 */
function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const starsOnly = args.includes('--stars-only');
  const npmOnly = args.includes('--npm-only');
  const reportOnly = args.includes('--report');
  const help = args.includes('--help') || args.includes('-h');
  
  if (help) {
    console.log(`
📊 统计数据集成脚本

用法: node update-stats.js [选项]

选项:
  --stars-only    仅更新 GitHub Stars 徽章
  --npm-only      仅获取 npm 下载量
  --report        仅生成报告（基于已有数据）
  --help, -h      显示帮助

示例:
  node update-stats.js              # 完整更新所有数据
  node update-stats.js --stars-only # 仅更新 Stars
  node update-stats.js --npm-only   # 仅更新 npm 数据
`);
    return;
  }
  
  console.log('🚀 开始更新统计数据...\n');
  
  try {
    // 读取 README
    let readmeContent = fs.readFileSync(README_PATH, 'utf-8');
    const repos = extractGitHubRepos(readmeContent);
    
    // 仅生成报告
    if (reportOnly) {
      const stats = loadStats();
      if (!stats) {
        console.error('❌ 没有找到统计数据，请先运行完整更新');
        process.exit(1);
      }
      const report = generateFullReport(stats);
      fs.writeFileSync(REPORT_FILE, report, 'utf-8');
      console.log(`📄 报告已生成: ${REPORT_FILE}`);
      return;
    }
    
    let githubData = {};
    let npmData = loadNpmStats() || {};
    
    // 更新 GitHub Stars
    if (!npmOnly) {
      console.log('🌟 更新 GitHub Stars 徽章...');
      githubData = await fetchGitHubStars(repos);
      readmeContent = updateStarsBadges(readmeContent);
      fs.writeFileSync(README_PATH, readmeContent, 'utf-8');
      console.log('✅ Stars 徽章已更新\n');
    }
    
    // 更新 npm 数据
    if (!starsOnly) {
      console.log('📦 获取 npm 下载量数据...\n');
      npmData = await getBatchStats(DEFAULT_PACKAGES, {
        concurrency: 5,
        delay: 100,
      });
      saveNpmStats(npmData, NPM_STATS_FILE);
      console.log('');
    }
    
    // 合并并保存
    if (!starsOnly && !npmOnly) {
      console.log('🔄 合并统计数据...');
      const mergedStats = mergeStats(githubData, npmData, repos);
      saveStats(mergedStats);
      
      // 生成报告
      const report = generateFullReport(mergedStats);
      fs.writeFileSync(REPORT_FILE, report, 'utf-8');
      console.log(`📄 报告已生成: ${REPORT_FILE}`);
    }
    
    console.log('\n✨ 完成!');
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    process.exit(1);
  }
}

// 导出模块供其他脚本使用
module.exports = {
  extractGitHubRepos,
  inferNpmPackage,
  mergeStats,
  generateFullReport,
};

// 如果直接运行
if (require.main === module) {
  main();
}
