#!/usr/bin/env node

/**
 * Library Stats Update Script
 * 
 * 功能：
 * 1. 解析 README 和 docs 中的 GitHub 仓库链接
 * 2. 调用 GitHub GraphQL API 获取 Stars、最后更新时间等信息
 * 3. 更新徽章和统计数据
 * 4. 生成更新报告
 */

import { graphql } from '@octokit/graphql';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  // API 配置
  apiUrl: 'https://api.github.com/graphql',
  perPage: 100,
  
  // 限流配置
  rateLimitBuffer: 100,  // 保留的 API 调用余量
  requestDelay: 100,     // 请求间隔 (ms)
  
  // 文件配置
  readmePath: 'README.md',
  docsDir: 'docs',
  logsDir: 'logs',
  
  // 更新配置
  forceUpdate: process.env.FORCE_UPDATE === 'true',
  minStarsChange: 5,     // 最小 Stars 变化才更新（减少无意义的提交）
};

// 日志工具
class Logger {
  constructor() {
    this.logs = [];
    this.logsDir = path.join(process.cwd(), CONFIG.logsDir);
    this.ensureLogsDir();
  }
  
  ensureLogsDir() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }
  
  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, level, message, data };
    this.logs.push(entry);
    
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    console.log(`${prefix} ${message}`);
    if (data && level === 'error') {
      console.error(data);
    }
  }
  
  info(message, data) { this.log('info', message, data); }
  warn(message, data) { this.log('warn', message, data); }
  error(message, data) { this.log('error', message, data); }
  debug(message, data) { this.log('debug', message, data); }
  
  save(filename) {
    const filepath = path.join(this.logsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(this.logs, null, 2));
    this.info(`Logs saved to ${filepath}`);
  }
}

const logger = new Logger();

// 解析 GitHub URL
function parseGitHubUrl(url) {
  if (!url) return null;
  
  const patterns = [
    // https://github.com/owner/repo
    /github\.com\/([^\/]+)\/([^\/\s\)]+)/,
    // [text](https://github.com/owner/repo)
    /github\.com\/([^\/]+)\/([^\/\s\)]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1].toLowerCase(),
        repo: match[2].replace(/\/$/, '').toLowerCase(),
        fullName: `${match[1].toLowerCase()}/${match[2].replace(/\/$/, '').toLowerCase()}`
      };
    }
  }
  return null;
}

// 提取 Markdown 文件中的所有 GitHub 链接
function extractGitHubLinks(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const links = new Map(); // 使用 Map 去重
  
  // 匹配 Markdown 链接 [text](url)
  const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/github\.com\/[^\/\s]+\/[^\/\s\)]+)\)/g;
  let match;
  while ((match = mdLinkRegex.exec(content)) !== null) {
    const parsed = parseGitHubUrl(match[2]);
    if (parsed && !parsed.repo.includes('.')) { // 过滤掉特殊页面
      links.set(parsed.fullName, {
        ...parsed,
        url: match[2],
        text: match[1],
        source: filePath
      });
    }
  }
  
  // 匹配裸链接
  const bareLinkRegex = /https?:\/\/github\.com\/([^\/\s]+)\/([^\/\s\)]+)/g;
  while ((match = bareLinkRegex.exec(content)) !== null) {
    const parsed = parseGitHubUrl(match[0]);
    if (parsed && !parsed.repo.includes('.') && !links.has(parsed.fullName)) {
      links.set(parsed.fullName, {
        ...parsed,
        url: match[0],
        text: parsed.repo,
        source: filePath
      });
    }
  }
  
  return Array.from(links.values());
}

// 获取所有需要扫描的文件
function getMarkdownFiles(dir) {
  const files = [];
  
  function scanDir(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(dir);
  return files;
}

// 调用 GitHub GraphQL API
async function fetchRepoStats(repos, token) {
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${token}`,
    },
  });
  
  // 构建 GraphQL 查询
  const queryParts = repos.map((repo, index) => `
    repo${index}: repository(owner: "${repo.owner}", name: "${repo.repo}") {
      nameWithOwner
      stargazerCount
      forkCount
      updatedAt
      pushedAt
      createdAt
      description
      isArchived
      isTemplate
      releases(last: 1) {
        nodes {
          tagName
          publishedAt
          isLatest
        }
      }
      defaultBranchRef {
        name
        target {
          ... on Commit {
            committedDate
          }
        }
      }
      licenseInfo {
        spdxId
        name
      }
    }
  `);
  
  const query = `
    query {
      ${queryParts.join('\n')}
      rateLimit {
        limit
        remaining
        resetAt
        cost
      }
    }
  `;
  
  try {
    const response = await graphqlWithAuth(query);
    return response;
  } catch (error) {
    logger.error('GraphQL query failed', error.message);
    throw error;
  }
}

// 检查限流状态
async function checkRateLimit(token) {
  const response = await fetch('https://api.github.com/rate_limit', {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Rate limit check failed: ${response.status}`);
  }
  
  return await response.json();
}

// 格式化数字
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// 更新文件中的徽章
function updateBadgesInFile(filePath, stats) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // 查找并更新 Stars 徽章
  // 支持格式: ![Stars](https://img.shields.io/github/stars/owner/repo?style=flat)
  // 或: <!-- STARS:owner/repo:1234 -->
  
  const badgeRegex = /!\[([^\]]*)\]\(https:\/\/img\.shields\.io\/github\/stars\/([^\/]+)\/([^\s\?\)]+)[^\)]*\)/g;
  const commentRegex = /<!--\s*STARS:([^:]+):(\d+)\s*-->/g;
  
  // 更新徽章 URL
  content = content.replace(badgeRegex, (match, label, owner, repo) => {
    const fullName = `${owner}/${repo}`.toLowerCase();
    if (stats[fullName]) {
      const stars = stats[fullName].stargazerCount;
      updated = true;
      return `![${label || 'Stars'}](https://img.shields.io/github/stars/${owner}/${repo}?style=flat&logo=github&color=blue&label=%E2%AD%90%20${formatNumber(stars)})`;
    }
    return match;
  });
  
  // 更新注释标记
  content = content.replace(commentRegex, (match, fullName, oldStars) => {
    const normalizedName = fullName.toLowerCase();
    if (stats[normalizedName]) {
      const stars = stats[normalizedName].stargazerCount;
      updated = true;
      return `<!-- STARS:${fullName}:${stars} -->`;
    }
    return match;
  });
  
  if (updated) {
    fs.writeFileSync(filePath, content);
    logger.info(`Updated badges in ${filePath}`);
  }
  
  return updated;
}

// 主函数
async function main() {
  const startTime = Date.now();
  logger.info('Starting library stats update...');
  
  // 获取 GitHub Token
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    logger.error('GITHUB_TOKEN environment variable is required');
    process.exit(1);
  }
  
  try {
    // 检查限流状态
    logger.info('Checking rate limit...');
    const rateLimit = await checkRateLimit(token);
    const remaining = rateLimit.resources.graphql?.remaining || rateLimit.rate.remaining;
    const limit = rateLimit.resources.graphql?.limit || rateLimit.rate.limit;
    
    logger.info(`Rate limit: ${remaining}/${limit} remaining`);
    
    if (remaining < CONFIG.rateLimitBuffer) {
      const resetAt = new Date(rateLimit.resources.graphql?.resetAt || rateLimit.rate.reset * 1000);
      logger.error(`Rate limit too low. Resets at ${resetAt}`);
      process.exit(1);
    }
    
    // 收集所有 GitHub 链接
    logger.info('Scanning markdown files...');
    const allLinks = [];
    
    // 扫描 README
    if (fs.existsSync(CONFIG.readmePath)) {
      const links = extractGitHubLinks(CONFIG.readmePath);
      allLinks.push(...links);
      logger.info(`Found ${links.length} repos in README.md`);
    }
    
    // 扫描 docs 目录
    if (fs.existsSync(CONFIG.docsDir)) {
      const docFiles = getMarkdownFiles(CONFIG.docsDir);
      logger.info(`Found ${docFiles.length} markdown files in docs/`);
      
      for (const file of docFiles) {
        const links = extractGitHubLinks(file);
        allLinks.push(...links);
      }
    }
    
    // 去重
    const uniqueRepos = new Map();
    for (const link of allLinks) {
      if (!uniqueRepos.has(link.fullName)) {
        uniqueRepos.set(link.fullName, link);
      }
    }
    
    const repos = Array.from(uniqueRepos.values());
    logger.info(`Total unique repositories: ${repos.length}`);
    
    if (repos.length === 0) {
      logger.warn('No repositories found to update');
      process.exit(0);
    }
    
    // 分批获取统计信息
    const stats = {};
    const batchSize = 50; // GraphQL 查询复杂度限制
    
    for (let i = 0; i < repos.length; i += batchSize) {
      const batch = repos.slice(i, i + batchSize);
      logger.info(`Fetching batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(repos.length / batchSize)} (${batch.length} repos)`);
      
      try {
        const response = await fetchRepoStats(batch, token);
        
        // 处理结果
        Object.keys(response).forEach(key => {
          if (key.startsWith('repo')) {
            const repoData = response[key];
            if (repoData) {
              stats[repoData.nameWithOwner.toLowerCase()] = repoData;
            }
          }
        });
        
        // 记录限流信息
        if (response.rateLimit) {
          logger.info(`Rate limit after query: ${response.rateLimit.remaining}/${response.rateLimit.limit} (cost: ${response.rateLimit.cost})`);
        }
        
        // 请求间隔，避免触发限流
        if (i + batchSize < repos.length) {
          await new Promise(resolve => setTimeout(resolve, CONFIG.requestDelay));
        }
        
      } catch (error) {
        logger.error(`Failed to fetch batch ${Math.floor(i / batchSize) + 1}`, error.message);
        // 继续处理下一批
      }
    }
    
    logger.info(`Successfully fetched stats for ${Object.keys(stats).length} repositories`);
    
    // 生成报告
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: repos.length,
        fetched: Object.keys(stats).length,
        updated: 0
      },
      repositories: []
    };
    
    // 统计热门仓库
    const sortedRepos = Object.entries(stats)
      .sort((a, b) => b[1].stargazerCount - a[1].stargazerCount)
      .slice(0, 20);
    
    for (const [fullName, data] of sortedRepos) {
      report.repositories.push({
        name: fullName,
        stars: data.stargazerCount,
        forks: data.forkCount,
        lastPush: data.pushedAt,
        lastUpdate: data.updatedAt,
        latestRelease: data.releases?.nodes?.[0]?.tagName || null,
        isArchived: data.isArchived
      });
    }
    
    // 更新文件中的徽章
    logger.info('Updating badges in files...');
    
    if (fs.existsSync(CONFIG.readmePath)) {
      if (updateBadgesInFile(CONFIG.readmePath, stats)) {
        report.summary.updated++;
      }
    }
    
    if (fs.existsSync(CONFIG.docsDir)) {
      const docFiles = getMarkdownFiles(CONFIG.docsDir);
      for (const file of docFiles) {
        if (updateBadgesInFile(file, stats)) {
          report.summary.updated++;
        }
      }
    }
    
    // 保存报告
    const reportPath = path.join(CONFIG.logsDir, 'update-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    logger.info(`Report saved to ${reportPath}`);
    
    // 生成 Markdown 报告
    const markdownReport = generateMarkdownReport(report, stats);
    const mdReportPath = path.join(CONFIG.logsDir, 'update-report.md');
    fs.writeFileSync(mdReportPath, markdownReport);
    
    // 输出 GitHub Actions 变量
    if (process.env.GITHUB_OUTPUT) {
      const updatedLibs = report.repositories
        .slice(0, 10)
        .map(r => `- ${r.name}: ⭐ ${formatNumber(r.stars)}`)
        .join('\\n');
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `updated_libs=${updatedLibs}\n`);
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info(`Update completed in ${duration}s`);
    logger.info(`Summary: ${report.summary.fetched}/${report.summary.total} repos fetched, ${report.summary.updated} files updated`);
    
    // 保存日志
    logger.save('update-stats.log.json');
    
  } catch (error) {
    logger.error('Update failed', error.stack);
    logger.save('update-stats-error.log.json');
    process.exit(1);
  }
}

// 生成 Markdown 格式报告
function generateMarkdownReport(report, stats) {
  const lines = [
    '# Library Stats Update Report',
    '',
    `**Generated:** ${new Date(report.timestamp).toLocaleString()}`,
    '',
    '## Summary',
    '',
    `- **Total repositories:** ${report.summary.total}`,
    `- **Successfully fetched:** ${report.summary.fetched}`,
    `- **Files updated:** ${report.summary.updated}`,
    '',
    '## Top Repositories by Stars',
    '',
    '| Repository | Stars | Forks | Last Push | Release |',
    '|------------|-------|-------|-----------|---------|'
  ];
  
  for (const repo of report.repositories.slice(0, 20)) {
    const status = repo.isArchived ? ' 🏛️ Archived' : '';
    lines.push(
      `| ${repo.name}${status} | ⭐ ${formatNumber(repo.stars)} | 🍴 ${formatNumber(repo.forks)} | ${formatDate(repo.lastPush)} | ${repo.latestRelease || '-'} |`
    );
  }
  
  lines.push('', '## Recently Active', '');
  
  const recentlyActive = Object.entries(stats)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => new Date(b.pushedAt) - new Date(a.pushedAt))
    .slice(0, 10);
  
  for (const repo of recentlyActive) {
    lines.push(`- **${repo.nameWithOwner}** - pushed ${formatDate(repo.pushedAt)}`);
  }
  
  return lines.join('\n');
}

// 运行主函数
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
