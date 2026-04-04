#!/usr/bin/env node

/**
 * update-stats.js
 * 
 * 功能：
 * - 读取 README.md 中的 GitHub 链接
 * - 调用 GitHub API 获取 Stars、最后更新时间
 * - 更新文件中的徽章
 * - 生成报告
 * 
 * 使用方法：
 *   node update-stats.js [--token=<github_token>] [--dry-run]
 * 
 * 环境变量：
 *   GITHUB_TOKEN - GitHub Personal Access Token（可选，用于提高 API 限制）
 */

const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

// 配置
const CONFIG = {
  readmePath: path.join(__dirname, '..', 'README.md'),
  reportPath: path.join(__dirname, '..', 'docs', 'stats-report.md'),
  dryRun: process.argv.includes('--dry-run'),
};

// 解析命令行参数
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--token=')) {
      args.token = arg.split('=')[1];
    }
    if (arg === '--dry-run') {
      args.dryRun = true;
    }
  });
  return args;
}

// 初始化 Octokit
function initOctokit(token) {
  const authToken = token || process.env.GITHUB_TOKEN;
  if (!authToken) {
    console.warn('⚠️  未提供 GitHub Token，使用匿名访问（限制 60 请求/小时）');
  }
  return new Octokit({
    auth: authToken,
    throttle: {
      onRateLimit: (retryAfter, options) => {
        console.warn(`⏳ 触发速率限制，等待 ${retryAfter} 秒后重试...`);
        return true;
      },
      onSecondaryRateLimit: (retryAfter, options) => {
        console.warn(`⏳ 触发二级速率限制，等待 ${retryAfter} 秒后重试...`);
        return true;
      },
    },
  });
}

// 从 README.md 中提取 GitHub 链接
function extractGitHubLinks(content) {
  const links = new Set();
  
  // 匹配 Markdown 链接 [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\((https:\/\/github\.com\/[^\/\s]+\/[^\/\s\)]+)\)/g;
  let match;
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    links.add(match[2]);
  }
  
  // 匹配裸 URL
  const urlRegex = /https:\/\/github\.com\/[^\/\s]+\/[^\/\s\)\]>,]+/g;
  while ((match = urlRegex.exec(content)) !== null) {
    links.add(match[0]);
  }
  
  return Array.from(links);
}

// 解析 GitHub URL
function parseGitHubUrl(url) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, '').replace(/\/$/, ''),
  };
}

// 获取仓库统计信息
async function fetchRepoStats(octokit, owner, repo) {
  try {
    const { data } = await octokit.rest.repos.get({ owner, repo });
    return {
      name: data.full_name,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      lastUpdated: data.updated_at,
      lastPushed: data.pushed_at,
      createdAt: data.created_at,
      description: data.description,
      language: data.language,
      license: data.license?.name || 'N/A',
      url: data.html_url,
      success: true,
    };
  } catch (error) {
    return {
      name: `${owner}/${repo}`,
      error: error.message,
      success: false,
    };
  }
}

// 格式化数字
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`;
  return `${Math.floor(diffDays / 365)} 年前`;
}

// 生成徽章 URL
function generateBadgeUrl(repo, stars) {
  return `https://img.shields.io/github/stars/${repo}?style=flat-square&logo=github`;
}

// 更新 README.md 中的徽章
function updateBadges(content, stats) {
  let updatedContent = content;
  
  for (const stat of stats) {
    if (!stat.success) continue;
    
    const repoPattern = new RegExp(
      `(\\[.*?\\]\\(https:\\/\\/github\\.com\\/${stat.name.replace('/', '\\/')}\\).*?)(?:!\\[Stars\\]\\(https:\\/\\/img\\.shields\\.io\\/github\\/stars\\/[^\\)]+\\))?`,
      'g'
    );
    
    const badgeUrl = generateBadgeUrl(stat.name, stat.stars);
    const badgeMarkdown = ` ![Stars](${badgeUrl})`;
    
    updatedContent = updatedContent.replace(repoPattern, (match, p1) => {
      // 如果已有 Stars 徽章，替换它
      if (match.includes('![Stars]')) {
        return match.replace(/!\[Stars\]\([^)]+\)/, `![Stars](${badgeUrl})`);
      }
      // 否则添加新徽章
      return p1 + badgeMarkdown;
    });
  }
  
  return updatedContent;
}

// 生成统计报告
function generateReport(stats) {
  const successful = stats.filter(s => s.success);
  const failed = stats.filter(s => !s.success);
  
  // 按 stars 排序
  const sortedByStars = [...successful].sort((a, b) => b.stars - a.stars);
  
  let report = `# 📊 仓库统计报告\n\n`;
  report += `生成时间：${new Date().toLocaleString('zh-CN')}\n\n`;
  
  // 汇总信息
  report += `## 📈 汇总\n\n`;
  report += `- 总计仓库：${stats.length}\n`;
  report += `- 成功获取：${successful.length}\n`;
  report += `- 失败：${failed.length}\n`;
  report += `- 总 Stars：${formatNumber(successful.reduce((sum, s) => sum + s.stars, 0))}\n\n`;
  
  // Stars 排行榜
  report += `## ⭐ Stars 排行榜（Top 20）\n\n`;
  report += `| 排名 | 仓库 | Stars | 语言 | 最后更新 |\n`;
  report += `|:----:|------|:-----:|:----:|:--------:|\n`;
  
  sortedByStars.slice(0, 20).forEach((stat, index) => {
    const emoji = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}`;
    report += `| ${emoji} | [${stat.name}](${stat.url}) | ${formatNumber(stat.stars)} | ${stat.language || '-'} | ${formatDate(stat.lastPushed)} |\n`;
  });
  
  report += `\n`;
  
  // 最近更新
  report += `## 🔄 最近更新（Top 10）\n\n`;
  const sortedByUpdate = [...successful].sort((a, b) => new Date(b.lastPushed) - new Date(a.lastPushed));
  
  report += `| 仓库 | 最后推送 | 描述 |\n`;
  report += `|------|:--------:|------|\n`;
  
  sortedByUpdate.slice(0, 10).forEach(stat => {
    const desc = stat.description ? stat.description.substring(0, 50) + (stat.description.length > 50 ? '...' : '') : '-';
    report += `| [${stat.name}](${stat.url}) | ${formatDate(stat.lastPushed)} | ${desc} |\n`;
  });
  
  report += `\n`;
  
  // 失败列表
  if (failed.length > 0) {
    report += `## ❌ 获取失败的仓库\n\n`;
    failed.forEach(stat => {
      report += `- **${stat.name}**: ${stat.error}\n`;
    });
    report += `\n`;
  }
  
  // 详细信息表格
  report += `## 📋 详细信息\n\n`;
  report += `<details>\n<summary>点击展开所有仓库详情</summary>\n\n`;
  report += `| 仓库 | ⭐ Stars | 🍴 Forks | 🐛 Issues | 语言 | 许可证 | 最后更新 |\n`;
  report += `|------|:-------:|:--------:|:---------:|:----:|:------:|:--------:|\n`;
  
  sortedByStars.forEach(stat => {
    report += `| [${stat.name}](${stat.url}) | ${formatNumber(stat.stars)} | ${formatNumber(stat.forks)} | ${formatNumber(stat.openIssues)} | ${stat.language || '-'} | ${stat.license} | ${formatDate(stat.lastPushed)} |\n`;
  });
  
  report += `\n</details>\n`;
  
  return report;
}

// 主函数
async function main() {
  console.log('🚀 开始更新仓库统计信息...\n');
  
  const args = parseArgs();
  const octokit = initOctokit(args.token);
  
  // 读取 README.md
  console.log(`📖 读取 ${CONFIG.readmePath}...`);
  if (!fs.existsSync(CONFIG.readmePath)) {
    console.error(`❌ 错误：找不到文件 ${CONFIG.readmePath}`);
    process.exit(1);
  }
  
  const readmeContent = fs.readFileSync(CONFIG.readmePath, 'utf-8');
  
  // 提取 GitHub 链接
  console.log('🔗 提取 GitHub 链接...');
  const links = extractGitHubLinks(readmeContent);
  console.log(`   找到 ${links.length} 个 GitHub 链接\n`);
  
  if (links.length === 0) {
    console.log('⚠️  未找到任何 GitHub 链接');
    return;
  }
  
  // 解析仓库信息
  const repos = links
    .map(parseGitHubUrl)
    .filter(r => r !== null);
  
  // 去重
  const uniqueRepos = Array.from(new Map(repos.map(r => [`${r.owner}/${r.repo}`, r])).values());
  console.log(`📦 解析到 ${uniqueRepos.length} 个唯一仓库\n`);
  
  // 获取统计信息
  console.log('📊 正在获取仓库统计信息...');
  const stats = [];
  const batchSize = 10; // 每批处理的仓库数
  
  for (let i = 0; i < uniqueRepos.length; i += batchSize) {
    const batch = uniqueRepos.slice(i, i + batchSize);
    console.log(`   处理第 ${i + 1}-${Math.min(i + batchSize, uniqueRepos.length)} 个仓库...`);
    
    const batchStats = await Promise.all(
      batch.map(async ({ owner, repo }) => {
        const stat = await fetchRepoStats(octokit, owner, repo);
        if (stat.success) {
          console.log(`     ✅ ${stat.name}: ⭐ ${formatNumber(stat.stars)}`);
        } else {
          console.log(`     ❌ ${stat.name}: ${stat.error}`);
        }
        return stat;
      })
    );
    
    stats.push(...batchStats);
    
    // 避免速率限制，添加延迟
    if (i + batchSize < uniqueRepos.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n');
  
  // 生成报告
  console.log('📝 生成统计报告...');
  const report = generateReport(stats);
  
  // 确保 docs 目录存在
  const docsDir = path.dirname(CONFIG.reportPath);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  if (!args.dryRun && !CONFIG.dryRun) {
    fs.writeFileSync(CONFIG.reportPath, report, 'utf-8');
    console.log(`   ✅ 报告已保存到 ${CONFIG.reportPath}`);
    
    // 更新 README.md 中的徽章
    console.log('\n🏷️  更新 README.md 徽章...');
    const updatedReadme = updateBadges(readmeContent, stats);
    fs.writeFileSync(CONFIG.readmePath, updatedReadme, 'utf-8');
    console.log('   ✅ README.md 已更新');
  } else {
    console.log('   📝 [Dry Run] 报告内容预览：');
    console.log('   ' + report.split('\n').join('\n   ').substring(0, 500) + '...');
  }
  
  // 输出摘要
  const successful = stats.filter(s => s.success);
  console.log('\n📈 统计摘要：');
  console.log(`   ✅ 成功: ${successful.length}`);
  console.log(`   ❌ 失败: ${stats.length - successful.length}`);
  console.log(`   ⭐ 总 Stars: ${formatNumber(successful.reduce((sum, s) => sum + s.stars, 0))}`);
  
  console.log('\n✨ 完成！');
}

// 错误处理
main().catch(error => {
  console.error('❌ 发生错误:', error);
  process.exit(1);
});
