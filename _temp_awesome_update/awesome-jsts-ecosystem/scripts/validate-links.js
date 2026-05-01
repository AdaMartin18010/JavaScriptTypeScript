#!/usr/bin/env node

/**
 * validate-links.js
 * 
 * 功能：
 * - 检查 README.md 中所有链接的可访问性
 * - 报告失效链接及其位置
 * - 支持重定向跟踪
 * 
 * 使用方法：
 *   node validate-links.js [--timeout=<ms>] [--concurrency=<n>] [--output=<path>]
 * 
 * 选项：
 *   --timeout=<ms>      请求超时时间（默认 10000ms）
 *   --concurrency=<n>   并发请求数（默认 5）
 *   --output=<path>     输出报告文件路径
 *   --include-redirects 将重定向视为警告而非通过
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// 配置
const CONFIG = {
  readmePath: path.join(__dirname, '..', 'README.md'),
  timeout: 10000,
  concurrency: 5,
  retries: 2,
  retryDelay: 1000,
};

// 链接检查结果类型
const STATUS = {
  OK: 'ok',
  WARNING: 'warning',
  ERROR: 'error',
  SKIPPED: 'skipped',
};

// 解析命令行参数
function parseArgs() {
  const args = {
    timeout: CONFIG.timeout,
    concurrency: CONFIG.concurrency,
    output: null,
    includeRedirects: process.argv.includes('--include-redirects'),
  };
  
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--timeout=')) {
      args.timeout = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--concurrency=')) {
      args.concurrency = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--output=')) {
      args.output = arg.split('=')[1];
    }
  });
  
  return args;
}

// 提取所有链接
function extractLinks(content) {
  const links = [];
  const lines = content.split('\n');
  
  // Markdown 链接 [text](url)
  const markdownLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  // 裸 URL
  const urlRegex = /(https?:\/\/[^\s\)\]<>"]+)/g;
  // HTML 链接 <a href="url">
  const htmlLinkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  // 图片链接 ![alt](url)
  const imageLinkRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  
  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    
    // Markdown 链接
    let match;
    while ((match = markdownLinkRegex.exec(line)) !== null) {
      const url = match[2].split(' ')[0]; // 移除可能的 title 属性
      if (isExternalUrl(url)) {
        links.push({
          url,
          text: match[1],
          lineNumber,
          type: 'markdown',
        });
      }
    }
    
    // HTML 链接
    while ((match = htmlLinkRegex.exec(line)) !== null) {
      const url = match[1];
      if (isExternalUrl(url)) {
        links.push({
          url,
          text: '',
          lineNumber,
          type: 'html',
        });
      }
    }
    
    // 图片链接
    while ((match = imageLinkRegex.exec(line)) !== null) {
      const url = match[2];
      if (isExternalUrl(url)) {
        links.push({
          url,
          text: match[1] || 'image',
          lineNumber,
          type: 'image',
        });
      }
    }
  });
  
  // 去重（基于 URL 和行号）
  const seen = new Set();
  return links.filter(link => {
    const key = `${link.url}:${link.lineNumber}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 判断是否为外部 URL
function isExternalUrl(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

// 检查链接是否可访问
function checkLink(link, timeout) {
  return new Promise((resolve) => {
    const url = new URL(link.url);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'HEAD',
      timeout: timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
      // 允许自签名证书（某些开发服务器）
      rejectUnauthorized: false,
    };
    
    const req = client.request(options, (res) => {
      const statusCode = res.statusCode;
      const finalUrl = res.headers.location || link.url;
      
      // 处理重定向
      if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
        resolve({
          ...link,
          status: STATUS.WARNING,
          statusCode,
          message: `重定向到: ${res.headers.location}`,
          finalUrl,
        });
        return;
      }
      
      // 成功
      if (statusCode >= 200 && statusCode < 300) {
        resolve({
          ...link,
          status: STATUS.OK,
          statusCode,
          message: 'OK',
          finalUrl,
        });
        return;
      }
      
      // 客户端错误
      if (statusCode >= 400 && statusCode < 500) {
        // 某些服务器不允许 HEAD 请求，尝试 GET
        if (statusCode === 405 || statusCode === 403) {
          resolve(checkWithGet(link, timeout));
          return;
        }
        
        resolve({
          ...link,
          status: STATUS.ERROR,
          statusCode,
          message: `客户端错误: ${statusCode}`,
          finalUrl,
        });
        return;
      }
      
      // 服务器错误
      resolve({
        ...link,
        status: STATUS.ERROR,
        statusCode,
        message: `服务器错误: ${statusCode}`,
        finalUrl,
      });
    });
    
    req.on('error', (error) => {
      resolve({
        ...link,
        status: STATUS.ERROR,
        statusCode: null,
        message: `请求失败: ${error.message}`,
        finalUrl: link.url,
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        ...link,
        status: STATUS.ERROR,
        statusCode: null,
        message: '请求超时',
        finalUrl: link.url,
      });
    });
    
    req.end();
  });
}

// 使用 GET 方法检查（用于不支持 HEAD 的服务器）
function checkWithGet(link, timeout) {
  return new Promise((resolve) => {
    const url = new URL(link.url);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      timeout: timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
      },
    };
    
    const req = client.request(options, (res) => {
      // 立即中止请求，我们只关心状态码
      req.destroy();
      
      const statusCode = res.statusCode;
      
      if (statusCode >= 200 && statusCode < 300) {
        resolve({
          ...link,
          status: STATUS.OK,
          statusCode,
          message: 'OK (GET)',
          finalUrl: res.headers.location || link.url,
        });
      } else if (statusCode >= 300 && statusCode < 400) {
        resolve({
          ...link,
          status: STATUS.WARNING,
          statusCode,
          message: `重定向: ${res.headers.location}`,
          finalUrl: res.headers.location,
        });
      } else {
        resolve({
          ...link,
          status: STATUS.ERROR,
          statusCode,
          message: `错误: ${statusCode}`,
          finalUrl: link.url,
        });
      }
    });
    
    req.on('error', (error) => {
      resolve({
        ...link,
        status: STATUS.ERROR,
        statusCode: null,
        message: `GET 请求失败: ${error.message}`,
        finalUrl: link.url,
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        ...link,
        status: STATUS.ERROR,
        statusCode: null,
        message: 'GET 请求超时',
        finalUrl: link.url,
      });
    });
    
    req.end();
  });
}

// 带重试的检查
async function checkLinkWithRetry(link, timeout, retries, retryDelay) {
  let lastResult;
  
  for (let i = 0; i <= retries; i++) {
    lastResult = await checkLink(link, timeout);
    
    // 如果成功或者是客户端错误（4xx），不需要重试
    if (lastResult.status === STATUS.OK || 
        (lastResult.statusCode && lastResult.statusCode >= 400 && lastResult.statusCode < 500)) {
      return lastResult;
    }
    
    // 最后一次尝试，返回结果
    if (i === retries) {
      return lastResult;
    }
    
    // 等待后重试
    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }
  
  return lastResult;
}

// 并发执行检查
async function checkLinksConcurrently(links, config) {
  const results = [];
  const queue = [...links];
  
  async function processBatch() {
    while (queue.length > 0) {
      const link = queue.shift();
      const result = await checkLinkWithRetry(
        link, 
        config.timeout, 
        CONFIG.retries, 
        CONFIG.retryDelay
      );
      results.push(result);
      
      // 实时输出
      const icon = result.status === STATUS.OK ? '✅' : 
                   result.status === STATUS.WARNING ? '⚠️' : '❌';
      console.log(`   ${icon} ${link.url.substring(0, 60)}${link.url.length > 60 ? '...' : ''}`);
      
      if (result.status !== STATUS.OK) {
        console.log(`      ${result.message}`);
      }
    }
  }
  
  // 启动多个并发 worker
  const workers = Array(config.concurrency).fill(null).map(processBatch);
  await Promise.all(workers);
  
  return results;
}

// 生成报告
function generateReport(results, config) {
  const ok = results.filter(r => r.status === STATUS.OK);
  const warnings = results.filter(r => r.status === STATUS.WARNING);
  const errors = results.filter(r => r.status === STATUS.ERROR);
  
  let report = `# 🔗 链接检查报告\n\n`;
  report += `生成时间：${new Date().toLocaleString('zh-CN')}\n\n`;
  
  // 汇总
  report += `## 📊 汇总\n\n`;
  report += `- 总计链接：${results.length}\n`;
  report += `- ✅ 正常：${ok.length}\n`;
  report += `- ⚠️  警告：${warnings.length}\n`;
  report += `- ❌ 错误：${errors.length}\n\n`;
  
  // 错误详情
  if (errors.length > 0) {
    report += `## ❌ 失效链接\n\n`;
    report += `| 链接 | 状态码 | 错误信息 | 行号 |\n`;
    report += `|------|:------:|----------|:----:|\n`;
    
    errors.forEach(err => {
      const shortUrl = err.url.length > 50 ? err.url.substring(0, 50) + '...' : err.url;
      report += `| [${shortUrl}](${err.url}) | ${err.statusCode || '-'} | ${err.message} | ${err.lineNumber} |\n`;
    });
    
    report += `\n`;
  }
  
  // 警告详情
  if (warnings.length > 0) {
    report += `## ⚠️ 警告链接（重定向）\n\n`;
    report += `| 链接 | 状态码 | 重定向目标 | 行号 |\n`;
    report += `|------|:------:|------------|:----:|\n`;
    
    warnings.forEach(warn => {
      const shortUrl = warn.url.length > 40 ? warn.url.substring(0, 40) + '...' : warn.url;
      const shortFinal = warn.finalUrl && warn.finalUrl.length > 40 
        ? warn.finalUrl.substring(0, 40) + '...' 
        : warn.finalUrl;
      report += `| [${shortUrl}](${warn.url}) | ${warn.statusCode} | ${shortFinal ? `[链接](${warn.finalUrl})` : '-'} | ${warn.lineNumber} |\n`;
    });
    
    report += `\n`;
  }
  
  // 正常链接（折叠）
  if (ok.length > 0) {
    report += `## ✅ 正常链接（${ok.length} 个）\n\n`;
    report += `<details>\n<summary>点击查看</summary>\n\n`;
    report += `| 链接 | 状态码 | 行号 |\n`;
    report += `|------|:------:|:----:|\n`;
    
    ok.forEach(item => {
      const shortUrl = item.url.length > 60 ? item.url.substring(0, 60) + '...' : item.url;
      report += `| [${shortUrl}](${item.url}) | ${item.statusCode} | ${item.lineNumber} |\n`;
    });
    
    report += `\n</details>\n`;
  }
  
  return report;
}

// 主函数
async function main() {
  console.log('🚀 开始检查链接...\n');
  
  const args = parseArgs();
  
  // 读取 README.md
  console.log(`📖 读取 ${CONFIG.readmePath}...`);
  if (!fs.existsSync(CONFIG.readmePath)) {
    console.error(`❌ 错误：找不到文件 ${CONFIG.readmePath}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(CONFIG.readmePath, 'utf-8');
  
  // 提取链接
  console.log('🔗 提取链接...');
  const links = extractLinks(content);
  console.log(`   找到 ${links.length} 个外部链接\n`);
  
  if (links.length === 0) {
    console.log('⚠️  未找到任何外部链接');
    return;
  }
  
  // 显示链接列表
  console.log('📋 链接列表：');
  links.slice(0, 10).forEach(link => {
    const shortUrl = link.url.length > 60 ? link.url.substring(0, 60) + '...' : link.url;
    console.log(`   - ${shortUrl} (第 ${link.lineNumber} 行)`);
  });
  if (links.length > 10) {
    console.log(`   ... 还有 ${links.length - 10} 个链接`);
  }
  console.log('');
  
  // 检查链接
  console.log(`🔍 开始检查链接（超时: ${args.timeout}ms, 并发: ${args.concurrency}）...\n`);
  const startTime = Date.now();
  const results = await checkLinksConcurrently(links, args);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log(`\n⏱️  检查完成，耗时 ${duration} 秒\n`);
  
  // 生成报告
  console.log('📝 生成报告...');
  const report = generateReport(results, args);
  
  // 输出到文件
  if (args.output) {
    fs.writeFileSync(args.output, report, 'utf-8');
    console.log(`   ✅ 报告已保存到 ${args.output}`);
  }
  
  // 控制台输出摘要
  const ok = results.filter(r => r.status === STATUS.OK);
  const warnings = results.filter(r => r.status === STATUS.WARNING);
  const errors = results.filter(r => r.status === STATUS.ERROR);
  
  console.log('\n📊 检查结果摘要：');
  console.log(`   ✅ 正常: ${ok.length}`);
  console.log(`   ⚠️  警告: ${warnings.length}`);
  console.log(`   ❌ 错误: ${errors.length}`);
  
  // 如果有错误，显示详细信息
  if (errors.length > 0) {
    console.log('\n❌ 失效链接详情：');
    errors.forEach(err => {
      console.log(`   - 第 ${err.lineNumber} 行: ${err.url}`);
      console.log(`     ${err.message}`);
    });
  }
  
  // 如果有警告且 include-redirects 为 true
  if (args.includeRedirects && warnings.length > 0) {
    console.log('\n⚠️  重定向警告：');
    warnings.forEach(warn => {
      console.log(`   - 第 ${warn.lineNumber} 行: ${warn.url}`);
      console.log(`     -> ${warn.finalUrl}`);
    });
  }
  
  console.log('\n✨ 完成！');
  
  // 如果有错误，以非零状态退出
  if (errors.length > 0) {
    process.exit(1);
  }
}

// 错误处理
main().catch(error => {
  console.error('❌ 发生错误:', error);
  process.exit(1);
});
