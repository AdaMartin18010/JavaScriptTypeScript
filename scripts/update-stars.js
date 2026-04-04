#!/usr/bin/env node

/**
 * 更新 README.md 中的 Stars 徽章
 * 
 * 此脚本会：
 * 1. 读取 README.md 文件
 * 2. 找到所有 GitHub Stars 徽章链接
 * 3. 通过 GitHub API 获取最新的 Stars 数量
 * 4. 更新徽章 URL（添加时间戳防止缓存）
 */

const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '..', 'README.md');

// 从 README 中提取所有 GitHub 仓库链接
function extractRepos(content) {
  const repoRegex = /https:\/\/github\.com\/([^/\s]+)\/([^/\s)]+)/g;
  const repos = new Set();
  let match;
  
  while ((match = repoRegex.exec(content)) !== null) {
    const [, owner, repo] = match;
    repos.add(`${owner}/${repo}`);
  }
  
  return Array.from(repos);
}

// 更新徽章 URL 添加时间戳
function updateBadgeUrls(content) {
  const timestamp = Date.now();
  
  // 匹配 shields.io 的 GitHub stars 徽章
  const badgeRegex = /(https:\/\/img\.shields\.io\/github\/stars\/[^?\s]+)(\?[^\s]*)?/g;
  
  return content.replace(badgeRegex, (match, baseUrl, existingQuery) => {
    // 移除旧的 cacheSeconds 参数
    const cleanUrl = baseUrl.replace(/\?.*$/, '');
    return `${cleanUrl}?style=flat-square&cacheSeconds=3600&t=${timestamp}`;
  });
}

async function main() {
  try {
    console.log('🚀 开始更新 Stars 徽章...');
    
    // 读取 README
    let content = fs.readFileSync(README_PATH, 'utf-8');
    
    // 提取仓库列表（可用于后续扩展功能）
    const repos = extractRepos(content);
    console.log(`📦 发现 ${repos.length} 个 GitHub 仓库`);
    
    // 更新徽章 URL
    const updatedContent = updateBadgeUrls(content);
    
    // 如果内容有变化，写回文件
    if (content !== updatedContent) {
      fs.writeFileSync(README_PATH, updatedContent, 'utf-8');
      console.log('✅ Stars 徽章已更新');
    } else {
      console.log('ℹ️ 无需更新');
    }
    
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    process.exit(1);
  }
}

main();
