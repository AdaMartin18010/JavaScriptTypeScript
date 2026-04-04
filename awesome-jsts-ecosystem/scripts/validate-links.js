#!/usr/bin/env node

/**
 * Link Validation Script
 * 
 * 功能：
 * 1. 批量检查 README 和 docs 中的所有外部链接
 * 2. 实现超时处理和重试机制
 * 3. 生成失效链接报告
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  // 检查配置
  timeout: 30000,           // 单个请求超时 (ms)
  retries: 3,               // 重试次数
  retryDelay: 1000,         // 重试间隔 (ms)
  concurrency: 10,          // 并发数
  
  // 文件配置
  readmePath: 'README.md',
  docsDir: 'docs',
  logsDir: 'logs',
  
  // 检查范围
  checkExternal: process.env.CHECK_EXTERNAL !== 'false',
  checkAnchors: false,      // 是否检查锚点（较慢）
  
  // 跳过模式
  skipPatterns: [
    /^mailto:/,
    /^#/,
    /^javascript:/,
    /localhost/,
    /127\.0\.0\.1/,
    /example\.com/,
    /\.local($|\/)/,
  ],
  
  // 允许的 HTTP 状态码（某些网站返回非标准状态码但实际可用）
  allowedStatusCodes: [200, 201, 204, 301, 302, 303, 307, 308, 401, 403, 405, 429, 503],
  
  // 用户代理
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0'
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
}

const logger = new Logger();

// 链接信息类
class LinkChecker {
  constructor() {
    this.results = {
      total: 0,
      ok: 0,
      broken: 0,
      skipped: 0,
      errors: 0,
      details: []
    };
    this.cache = new Map(); // 缓存检查结果
  }
  
  // 检查是否需要跳过
  shouldSkip(url) {
    return CONFIG.skipPatterns.some(pattern => pattern.test(url));
  }
  
  // 规范化 URL
  normalizeUrl(url, basePath) {
    // 处理相对路径
    if (url.startsWith('./') || url.startsWith('../')) {
      const baseDir = path.dirname(basePath);
      return path.resolve(baseDir, url);
    }
    
    // 处理根相对路径
    if (url.startsWith('/')) {
      return path.join(process.cwd(), url);
    }
    
    return url;
  }
  
  // 检查单个链接
  async checkLink(linkInfo) {
    const { url, text, file, line } = linkInfo;
    const cacheKey = url;
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return { ...cached, file, line, text };
    }
    
    // 跳过特定模式
    if (this.shouldSkip(url)) {
      this.results.skipped++;
      const result = { url, status: 'skipped', ok: true };
      this.cache.set(cacheKey, result);
      return { ...result, file, line, text };
    }
    
    // 本地文件检查
    if (!url.startsWith('http')) {
      return this.checkLocalFile(url, file, text, line);
    }
    
    // 外部链接检查
    if (!CONFIG.checkExternal) {
      this.results.skipped++;
      return { url, status: 'skipped_external', ok: true, file, line, text };
    }
    
    return this.checkExternalLink(url, file, text, line);
  }
  
  // 检查本地文件
  async checkLocalFile(url, sourceFile, text, line) {
    const normalizedPath = this.normalizeUrl(url, sourceFile);
    
    try {
      const exists = fs.existsSync(normalizedPath);
      const result = {
        url,
        normalizedPath,
        status: exists ? 200 : 404,
        ok: exists,
        file: sourceFile,
        line,
        text
      };
      
      if (exists) {
        this.results.ok++;
      } else {
        this.results.broken++;
        this.results.details.push(result);
      }
      
      this.cache.set(url, { url, status: result.status, ok: result.ok });
      return result;
      
    } catch (error) {
      const result = {
        url,
        status: 'error',
        error: error.message,
        ok: false,
        file: sourceFile,
        line,
        text
      };
      this.results.broken++;
      this.results.details.push(result);
      return result;
    }
  }
  
  // 检查外部链接
  async checkExternalLink(url, sourceFile, text, line) {
    let lastError = null;
    
    for (let attempt = 1; attempt <= CONFIG.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
        
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': CONFIG.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
          },
          redirect: 'follow'
        });
        
        clearTimeout(timeoutId);
        
        const isOk = CONFIG.allowedStatusCodes.includes(response.status);
        const result = {
          url,
          status: response.status,
          statusText: response.statusText,
          ok: isOk,
          file: sourceFile,
          line,
          text,
          attempts: attempt
        };
        
        if (isOk) {
          this.results.ok++;
        } else {
          this.results.broken++;
          this.results.details.push(result);
        }
        
        this.cache.set(url, { url, status: response.status, ok: isOk });
        return result;
        
      } catch (error) {
        lastError = error;
        
        if (error.name === 'AbortError') {
          logger.debug(`Timeout checking ${url} (attempt ${attempt})`);
        } else {
          logger.debug(`Error checking ${url} (attempt ${attempt}): ${error.message}`);
        }
        
        if (attempt < CONFIG.retries) {
          await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
        }
      }
    }
    
    // 所有重试失败
    const result = {
      url,
      status: 'error',
      error: lastError?.message || 'Unknown error',
      ok: false,
      file: sourceFile,
      line,
      text,
      attempts: CONFIG.retries
    };
    
    this.results.broken++;
    this.results.details.push(result);
    this.cache.set(url, { url, status: 'error', ok: false });
    return result;
  }
  
  // 批量检查链接（带并发控制）
  async checkLinks(links) {
    const results = [];
    const queue = [...links];
    
    async function processBatch() {
      while (queue.length > 0) {
        const link = queue.shift();
        const result = await this.checkLink(link);
        results.push(result);
        
        // 每检查10个链接输出一次进度
        if (results.length % 10 === 0) {
          logger.info(`Progress: ${results.length}/${links.length} (${((results.length / links.length) * 100).toFixed(1)}%)`);
        }
      }
    }
    
    // 启动并发 workers
    const workers = Array(CONFIG.concurrency).fill().map(() => processBatch.call(this));
    await Promise.all(workers);
    
    return results;
  }
}

// 提取 Markdown 中的所有链接
function extractLinks(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const links = [];
  const lines = content.split('\n');
  
  // 匹配 Markdown 链接 [text](url "title")
  const mdLinkRegex = /\[([^\]]+)\]\(([^\s\)]+)(?:\s+"[^"]*")?\)/g;
  
  // 匹配裸链接
  const bareLinkRegex = /<(https?:\/\/[^>]+)>/g;
  
  // 匹配 HTML 链接
  const htmlLinkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
  
  // 匹配图片链接
  const imageLinkRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Markdown 链接
    let match;
    while ((match = mdLinkRegex.exec(line)) !== null) {
      links.push({
        url: match[2],
        text: match[1],
        file: filePath,
        line: lineNum,
        type: 'markdown'
      });
    }
    
    // 裸链接
    while ((match = bareLinkRegex.exec(line)) !== null) {
      links.push({
        url: match[1],
        text: match[1],
        file: filePath,
        line: lineNum,
        type: 'bare'
      });
    }
    
    // HTML 链接
    while ((match = htmlLinkRegex.exec(line)) !== null) {
      links.push({
        url: match[1],
        text: match[2] || match[1],
        file: filePath,
        line: lineNum,
        type: 'html'
      });
    }
    
    // 图片链接（只检查 URL 有效性）
    while ((match = imageLinkRegex.exec(line)) !== null) {
      const imageUrl = match[2].split(' ')[0]; // 移除可能的标题
      if (imageUrl.startsWith('http')) {
        links.push({
          url: imageUrl,
          text: match[1] || 'image',
          file: filePath,
          line: lineNum,
          type: 'image'
        });
      }
    }
  });
  
  return links;
}

// 获取所有 Markdown 文件
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

// 生成报告
function generateReport(checker) {
  const { results } = checker;
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.total,
      ok: results.ok,
      broken: results.broken,
      skipped: results.skipped,
      successRate: results.total > 0 ? ((results.ok / results.total) * 100).toFixed(2) + '%' : '0%'
    },
    brokenLinks: results.details.filter(d => !d.ok)
  };
  
  // 保存 JSON 报告
  const reportPath = path.join(CONFIG.logsDir, 'link-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  logger.info(`JSON report saved to ${reportPath}`);
  
  // 生成 Markdown 报告
  const mdReport = generateMarkdownReport(report);
  const mdPath = path.join(CONFIG.logsDir, 'broken-links.md');
  fs.writeFileSync(mdPath, mdReport);
  logger.info(`Markdown report saved to ${mdPath}`);
  
  return report;
}

// 生成 Markdown 格式报告
function generateMarkdownReport(report) {
  const lines = [
    '# Link Validation Report',
    '',
    `**Generated:** ${new Date(report.timestamp).toLocaleString()}`,
    '',
    '## Summary',
    '',
    '| Metric | Count |',
    '|--------|-------|',
    `| Total Links | ${report.summary.total} |`,
    `| ✅ OK | ${report.summary.ok} |`,
    `| ❌ Broken | ${report.summary.broken} |`,
    `| ⏭️ Skipped | ${report.summary.skipped} |`,
    `| Success Rate | ${report.summary.successRate} |`,
    '',
    '## Broken Links',
    ''
  ];
  
  if (report.brokenLinks.length === 0) {
    lines.push('*No broken links found! 🎉*');
  } else {
    lines.push('| URL | Status | File | Line | Text |');
    lines.push('|-----|--------|------|------|------|');
    
    for (const link of report.brokenLinks) {
      const status = link.error ? `Error: ${link.error}` : `${link.status} ${link.statusText || ''}`;
      const file = link.file ? path.relative(process.cwd(), link.file) : 'N/A';
      const line = link.line || '-';
      const text = link.text ? (link.text.length > 30 ? link.text.substring(0, 30) + '...' : link.text) : '-';
      const url = link.url.length > 60 ? link.url.substring(0, 60) + '...' : link.url;
      
      lines.push(`| \`${url}\` | ${status} | ${file} | ${line} | ${text} |`);
    }
  }
  
  return lines.join('\n');
}

// 主函数
async function main() {
  const startTime = Date.now();
  logger.info('Starting link validation...');
  
  try {
    const checker = new LinkChecker();
    const allLinks = [];
    
    // 扫描 README
    if (fs.existsSync(CONFIG.readmePath)) {
      logger.info('Scanning README.md...');
      const links = extractLinks(CONFIG.readmePath);
      allLinks.push(...links);
      logger.info(`Found ${links.length} links in README.md`);
    }
    
    // 扫描 docs 目录
    if (fs.existsSync(CONFIG.docsDir)) {
      const docFiles = getMarkdownFiles(CONFIG.docsDir);
      logger.info(`Found ${docFiles.length} markdown files in docs/`);
      
      for (const file of docFiles) {
        const links = extractLinks(file);
        allLinks.push(...links);
      }
    }
    
    // 去重
    const uniqueLinks = [];
    const seen = new Set();
    for (const link of allLinks) {
      const key = `${link.url}:${link.file}:${link.line}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLinks.push(link);
      }
    }
    
    checker.results.total = uniqueLinks.length;
    logger.info(`Total unique links to check: ${uniqueLinks.length}`);
    
    if (uniqueLinks.length === 0) {
      logger.info('No links found to validate');
      process.exit(0);
    }
    
    // 执行检查
    logger.info('Checking links...');
    await checker.checkLinks(uniqueLinks);
    
    // 生成报告
    const report = generateReport(checker);
    
    // 输出摘要
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info(`Validation completed in ${duration}s`);
    logger.info(`Results: ${report.summary.ok} OK, ${report.summary.broken} Broken, ${report.summary.skipped} Skipped`);
    logger.info(`Success rate: ${report.summary.successRate}`);
    
    // 设置 GitHub Actions 输出
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `broken_count=${report.summary.broken}\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `total_count=${report.summary.total}\n`);
    }
    
    // 如果有失效链接，设置失败退出码（除非环境变量指定不失败）
    if (report.summary.broken > 0 && process.env.FAIL_ON_ERROR !== 'false') {
      logger.error(`${report.summary.broken} broken link(s) found`);
      process.exit(1);
    }
    
  } catch (error) {
    logger.error('Validation failed', error.stack);
    process.exit(1);
  }
}

// 运行主函数
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
