#!/usr/bin/env node

/**
 * npm 下载量统计工具
 * 
 * 功能：
 * 1. 调用 npm registry API 获取包下载量
 * 2. 获取周下载量和月下载量
 * 3. 支持批量查询多个包
 * 4. 生成统计报告并保存到数据文件
 * 
 * API 端点：
 * - https://api.npmjs.org/downloads/point/last-week/:package
 * - https://api.npmjs.org/downloads/point/last-month/:package
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 配置文件路径
const DATA_DIR = path.join(__dirname, '..', 'data');
const NPM_STATS_FILE = path.join(DATA_DIR, 'npm-stats.json');

// 默认包列表（可以从 README 中提取或手动配置）
const DEFAULT_PACKAGES = [
  // 框架与运行时
  'express', 'fastify', 'koa', '@nestjs/core', 'hono', 'elysia',
  'next', 'nuxt', '@sveltejs/kit', '@remix-run/core', 'astro',
  // 构建工具
  'vite', 'esbuild', 'typescript', '@swc/core', 'rollup',
  // 测试框架
  'jest', 'vitest', '@playwright/test', 'cypress', 'mocha',
  // ORM 与数据库
  '@prisma/client', 'typeorm', 'drizzle-orm', 'sequelize', 'mongoose',
  // 实用库
  'lodash', 'ramda', 'dayjs', 'date-fns', 'zod', '@trpc/server',
  // 状态管理
  'zustand', 'redux', 'jotai', 'pinia', '@tanstack/react-query',
  // UI 组件库
  'antd', '@mui/material', '@chakra-ui/react', '@shadcn/ui',
  // 其他工具
  'eslint', 'prettier', 'biome', 'tsx', 'nodemon', 'pm2',
];

/**
 * 发起 HTTPS 请求获取数据
 * @param {string} url - API URL
 * @returns {Promise<Object>} - JSON 响应数据
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        'User-Agent': 'npm-stats-script/1.0.0',
        'Accept': 'application/json',
      },
      timeout: 10000,
    }, (response) => {
      // 处理重定向
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        fetchJson(response.headers.location).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (error) {
          reject(new Error(`JSON 解析失败: ${error.message}`));
        }
      });
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('请求超时'));
    });
  });
}

/**
 * 获取单个包的下载量统计
 * @param {string} packageName - npm 包名
 * @returns {Promise<Object>} - 下载量数据
 */
async function getPackageStats(packageName) {
  try {
    const encodedName = encodeURIComponent(packageName);
    
    // 并行获取周和月下载量
    const [weeklyData, monthlyData] = await Promise.all([
      fetchJson(`https://api.npmjs.org/downloads/point/last-week/${encodedName}`),
      fetchJson(`https://api.npmjs.org/downloads/point/last-month/${encodedName}`),
    ]);

    return {
      package: packageName,
      weekly: weeklyData.downloads || 0,
      monthly: monthlyData.downloads || 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      success: true,
    };
  } catch (error) {
    return {
      package: packageName,
      weekly: 0,
      monthly: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      success: false,
      error: error.message,
    };
  }
}

/**
 * 批量获取多个包的下载量统计
 * @param {string[]} packages - 包名数组
 * @param {Object} options - 配置选项
 * @returns {Promise<Object>} - 所有包的统计数据
 */
async function getBatchStats(packages, options = {}) {
  const { 
    concurrency = 5, 
    delay = 100,
    onProgress = null,
  } = options;

  const results = {};
  const total = packages.length;
  let completed = 0;

  console.log(`📦 开始获取 ${total} 个包的下载量统计...\n`);

  // 分批处理，控制并发
  for (let i = 0; i < packages.length; i += concurrency) {
    const batch = packages.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (pkg) => {
      const stats = await getPackageStats(pkg);
      results[pkg] = {
        weekly: stats.weekly,
        monthly: stats.monthly,
        lastUpdated: stats.lastUpdated,
      };
      
      completed++;
      
      if (stats.success) {
        console.log(`  ✅ ${pkg}: ${formatNumber(stats.weekly)}/周, ${formatNumber(stats.monthly)}/月`);
      } else {
        console.log(`  ⚠️  ${pkg}: 获取失败 - ${stats.error}`);
      }
      
      if (onProgress) {
        onProgress(completed, total, pkg, stats);
      }
      
      return stats;
    });

    await Promise.all(batchPromises);

    // 批次间延迟，避免请求过快
    if (i + concurrency < packages.length) {
      await sleep(delay);
    }
  }

  console.log(`\n✅ 完成! 成功: ${Object.values(results).filter(r => r.weekly > 0).length}/${total}`);
  
  return results;
}

/**
 * 从 README 中提取 npm 包名
 * @param {string} readmeContent - README 文件内容
 * @returns {string[]} - 包名数组
 */
function extractPackagesFromReadme(readmeContent) {
  const packages = new Set();
  
  // 匹配 npm 包链接或 scoped packages
  // 匹配模式: npmjs.com/package/:name 或简单的包名引用
  const npmRegex = /npmjs\.com\/package\/([^)\s]+)/g;
  let match;
  
  while ((match = npmRegex.exec(readmeContent)) !== null) {
    packages.add(match[1]);
  }
  
  return Array.from(packages);
}

/**
 * 保存统计数据到文件
 * @param {Object} stats - 统计数据
 * @param {string} outputPath - 输出文件路径
 */
function saveStats(stats, outputPath = NPM_STATS_FILE) {
  // 确保数据目录存在
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const data = {
    generatedAt: new Date().toISOString(),
    totalPackages: Object.keys(stats).length,
    stats,
  };

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\n💾 数据已保存到: ${outputPath}`);
}

/**
 * 加载已有的统计数据
 * @param {string} filePath - 文件路径
 * @returns {Object|null} - 统计数据或 null
 */
function loadStats(filePath = NPM_STATS_FILE) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return data.stats || data;
  } catch (error) {
    console.warn(`⚠️  加载历史数据失败: ${error.message}`);
    return null;
  }
}

/**
 * 格式化数字显示
 * @param {number} num - 数字
 * @returns {string} - 格式化后的字符串
 */
function formatNumber(num) {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * 延迟函数
 * @param {number} ms - 毫秒
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成统计报告
 * @param {Object} stats - 统计数据
 * @returns {string} - 报告文本
 */
function generateReport(stats) {
  const packages = Object.entries(stats);
  const successful = packages.filter(([, data]) => data.weekly > 0);
  
  // 按周下载量排序
  successful.sort((a, b) => b[1].weekly - a[1].weekly);
  
  let report = '# npm 下载量统计报告\n\n';
  report += `生成时间: ${new Date().toISOString()}\n\n`;
  report += `## 汇总\n\n`;
  report += `- 总包数: ${packages.length}\n`;
  report += `- 成功获取: ${successful.length}\n`;
  report += `- 总周下载量: ${formatNumber(successful.reduce((sum, [, d]) => sum + d.weekly, 0))}\n`;
  report += `- 总月下载量: ${formatNumber(successful.reduce((sum, [, d]) => sum + d.monthly, 0))}\n\n`;
  
  report += '## 热门包 Top 20\n\n';
  report += '| 排名 | 包名 | 周下载量 | 月下载量 |\n';
  report += '|------|------|----------|----------|\n';
  
  successful.slice(0, 20).forEach(([name, data], index) => {
    report += `| ${index + 1} | ${name} | ${formatNumber(data.weekly)} | ${formatNumber(data.monthly)} |\n`;
  });
  
  return report;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // 显示帮助信息
  if (command === '--help' || command === '-h') {
    console.log(`
用法: node npm-stats.js [命令] [选项]

命令:
  fetch [packages...]  获取指定包的下载量
  fetch-all            获取默认列表所有包
  report               生成统计报告
  load                 加载已保存的统计数据

选项:
  --output, -o         指定输出文件路径
  --format, -f         输出格式 (json|markdown)

示例:
  node npm-stats.js fetch express fastify
  node npm-stats.js fetch-all
  node npm-stats.js report -o stats.md
`);
    return;
  }

  try {
    switch (command) {
      case 'fetch': {
        const packages = args.slice(1).filter(arg => !arg.startsWith('-'));
        if (packages.length === 0) {
          console.error('❌ 请指定至少一个包名');
          process.exit(1);
        }
        
        const stats = await getBatchStats(packages);
        
        const outputIndex = args.indexOf('-o') || args.indexOf('--output');
        const outputPath = outputIndex > -1 ? args[outputIndex + 1] : NPM_STATS_FILE;
        
        saveStats(stats, outputPath);
        break;
      }
        
      case 'fetch-all': {
        const stats = await getBatchStats(DEFAULT_PACKAGES);
        
        const outputIndex = args.indexOf('-o') || args.indexOf('--output');
        const outputPath = outputIndex > -1 ? args[outputIndex + 1] : NPM_STATS_FILE;
        
        saveStats(stats, outputPath);
        break;
      }
        
      case 'report': {
        const stats = loadStats();
        if (!stats) {
          console.error('❌ 没有找到已保存的统计数据，请先运行 fetch');
          process.exit(1);
        }
        
        const report = generateReport(stats);
        const outputIndex = args.indexOf('-o') || args.indexOf('--output');
        const outputPath = outputIndex > -1 ? args[outputIndex + 1] : 'npm-stats-report.md';
        
        fs.writeFileSync(outputPath, report, 'utf-8');
        console.log(`📊 报告已生成: ${outputPath}`);
        break;
      }
        
      case 'load': {
        const stats = loadStats();
        if (stats) {
          console.log(JSON.stringify(stats, null, 2));
        } else {
          console.log('{}');
        }
        break;
      }
        
      default: {
        // 默认行为：获取默认包列表的统计
        console.log('🚀 未指定命令，默认获取热门包统计...\n');
        const stats = await getBatchStats(DEFAULT_PACKAGES);
        saveStats(stats);
      }
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

// 导出模块供其他脚本使用
module.exports = {
  getPackageStats,
  getBatchStats,
  extractPackagesFromReadme,
  saveStats,
  loadStats,
  generateReport,
  DEFAULT_PACKAGES,
};

// 如果直接运行此脚本
if (require.main === module) {
  main();
}
