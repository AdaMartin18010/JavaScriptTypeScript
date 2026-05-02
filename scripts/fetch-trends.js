#!/usr/bin/env node

/**
 * 获取 GitHub Stars 历史趋势数据
 * 
 * 此脚本会：
 * 1. 使用 GitHub API 获取仓库的当前 stars 数量
 * 2. 生成模拟的历史趋势数据（基于创建时间和当前stars）
 * 3. 计算月度/年度增长率
 * 4. 生成趋势数据 JSON 文件
 * 
 * 使用方法:
 *   node scripts/fetch-trends.js
 *   
 * 环境变量:
 *   GITHUB_TOKEN - GitHub API Token (可选，用于提高速率限制)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 输出路径
const OUTPUT_DIR = path.join(__dirname, '..', 'website', 'data');
const TRENDS_FILE = path.join(OUTPUT_DIR, 'trends.json');

// GitHub Token (可选)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

// 要追踪的仓库列表 - 按分类组织
const REPOSITORIES = {
  // 前端框架
  frontend: [
    { owner: 'facebook', repo: 'react', name: 'React' },
    { owner: 'vuejs', repo: 'vue', name: 'Vue.js' },
    { owner: 'angular', repo: 'angular', name: 'Angular' },
    { owner: 'sveltejs', repo: 'svelte', name: 'Svelte' },
    { owner: 'solidjs', repo: 'solid', name: 'SolidJS' },
    { owner: 'preactjs', repo: 'preact', name: 'Preact' },
    { owner: 'alpinejs', repo: 'alpine', name: 'Alpine.js' },
    { owner: 'lit', repo: 'lit', name: 'Lit' },
  ],
  // 全栈框架
  fullstack: [
    { owner: 'vercel', repo: 'next.js', name: 'Next.js' },
    { owner: 'nuxt', repo: 'nuxt', name: 'Nuxt' },
    { owner: 'sveltejs', repo: 'kit', name: 'SvelteKit' },
    { owner: 'remix-run', repo: 'remix', name: 'Remix' },
    { owner: 'withastro', repo: 'astro', name: 'Astro' },
    { owner: 'redwoodjs', repo: 'redwood', name: 'RedwoodJS' },
  ],
  // 构建工具
  buildTools: [
    { owner: 'vitejs', repo: 'vite', name: 'Vite' },
    { owner: 'webpack', repo: 'webpack', name: 'Webpack' },
    { owner: 'evanw', repo: 'esbuild', name: 'esbuild' },
    { owner: 'swc-project', repo: 'swc', name: 'SWC' },
    { owner: 'vercel', repo: 'turbopack', name: 'Turbopack' },
    { owner: 'rollup', repo: 'rollup', name: 'Rollup' },
    { owner: 'parcel-bundler', repo: 'parcel', name: 'Parcel' },
    { owner: 'rsbuild', repo: 'rsbuild', name: 'Rsbuild' },
  ],
  // Web 框架 (后端)
  webFrameworks: [
    { owner: 'expressjs', repo: 'express', name: 'Express' },
    { owner: 'fastify', repo: 'fastify', name: 'Fastify' },
    { owner: 'nestjs', repo: 'nest', name: 'NestJS' },
    { owner: 'koajs', repo: 'koa', name: 'Koa' },
    { owner: 'honojs', repo: 'hono', name: 'Hono' },
    { owner: 'elysiajs', repo: 'elysia', name: 'Elysia' },
    { owner: 'hapijs', repo: 'hapi', name: 'Hapi' },
  ],
  // ORM 与数据库工具
  orm: [
    { owner: 'prisma', repo: 'prisma', name: 'Prisma' },
    { owner: 'typeorm', repo: 'typeorm', name: 'TypeORM' },
    { owner: 'drizzle-team', repo: 'drizzle-orm', name: 'Drizzle ORM' },
    { owner: 'sequelize', repo: 'sequelize', name: 'Sequelize' },
    { owner: 'Automattic', repo: 'mongoose', name: 'Mongoose' },
    { owner: 'knex', repo: 'knex', name: 'Knex.js' },
  ],
  // 测试框架
  testing: [
    { owner: 'jestjs', repo: 'jest', name: 'Jest' },
    { owner: 'vitest-dev', repo: 'vitest', name: 'Vitest' },
    { owner: 'microsoft', repo: 'playwright', name: 'Playwright' },
    { owner: 'cypress-io', repo: 'cypress', name: 'Cypress' },
    { owner: 'mochajs', repo: 'mocha', name: 'Mocha' },
  ],
  // 运行时
  runtime: [
    { owner: 'nodejs', repo: 'node', name: 'Node.js' },
    { owner: 'denoland', repo: 'deno', name: 'Deno' },
    { owner: 'oven-sh', repo: 'bun', name: 'Bun' },
  ],
  // 工具库
  utils: [
    { owner: 'lodash', repo: 'lodash', name: 'Lodash' },
    { owner: 'ramda', repo: 'ramda', name: 'Ramda' },
    { owner: 'iamkun', repo: 'dayjs', name: 'Day.js' },
    { owner: 'date-fns', repo: 'date-fns', name: 'date-fns' },
    { owner: 'colinhacks', repo: 'zod', name: 'Zod' },
    { owner: 'trpc', repo: 'trpc', name: 'tRPC' },
  ],
  // 新兴库 (快速增长)
  emerging: [
    { owner: 'honojs', repo: 'hono', name: 'Hono' },
    { owner: 'drizzle-team', repo: 'drizzle-orm', name: 'Drizzle ORM' },
    { owner: 'elysiajs', repo: 'elysia', name: 'Elysia' },
    { owner: 'biomejs', repo: 'biome', name: 'Biome' },
    { owner: 'rsbuild', repo: 'rsbuild', name: 'Rsbuild' },
    { owner: 'privatenumber', repo: 'tsx', name: 'tsx' },
    { owner: 'unjs', repo: 'nitro', name: 'Nitro' },
  ],
};

/**
 * 发送 HTTP GET 请求（带 429 重试和指数退避）
 * @param {string} url - 请求 URL
 * @param {Object} options - 选项
 * @param {number} options.retries - 剩余重试次数（默认 3）
 * @param {number} options.delay - 初始退避延迟 ms（默认 1000）
 */
function fetchJSON(url, options = {}) {
  const { retries = 3, delay = 1000, ...rest } = options;

  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'JSTS-Trends-Fetcher',
      'Accept': 'application/vnd.github.v3+json',
      ...rest.headers,
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const req = https.get(url, { headers }, (res) => {
      // 处理重定向
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchJSON(res.headers.location, { retries, delay, ...rest }).then(resolve).catch(reject);
        return;
      }

      // 处理速率限制 (429 Too Many Requests)
      if (res.statusCode === 429 && retries > 0) {
        const retryAfter = res.headers['retry-after'];
        const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : delay;
        console.warn(`  ⚠️  GitHub API 429 (Rate Limit)，${waitMs}ms 后重试... (剩余 ${retries} 次)`);
        setTimeout(() => {
          fetchJSON(url, { retries: retries - 1, delay: delay * 2, ...rest })
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
            reject(new Error(`API Error ${res.statusCode}: ${json.message || res.statusMessage}`));
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * 获取仓库信息
 */
async function fetchRepoInfo(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  try {
    const data = await fetchJSON(url);
    // 防御性检查：确保关键字段存在
    if (typeof data.stargazers_count !== 'number') {
      throw new Error(`Invalid response: missing stargazers_count`);
    }
    return {
      owner,
      repo,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      language: data.language,
      description: data.description,
    };
  } catch (error) {
    console.error(`  ❌ Failed to fetch ${owner}/${repo}: ${error.message}`);
    return null;
  }
}

/**
 * 生成历史趋势数据
 * 基于 S 型增长曲线模拟历史数据
 */
function generateHistoryData(repoInfo, months = 24) {
  const history = [];
  const now = new Date();
  const createdAt = new Date(repoInfo.createdAt);
  const currentStars = repoInfo.stars;
  
  // 计算仓库年龄（月）
  const ageInMonths = Math.max(
    months,
    Math.floor((now - createdAt) / (1000 * 60 * 60 * 24 * 30))
  );
  
  // 使用 S 型曲线模拟增长
  // 早期增长慢，中期快速增长，后期趋于平稳
  for (let i = ageInMonths; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const progress = 1 - (i / ageInMonths); // 0 到 1 的进度
    
    // S 型曲线: 1 / (1 + e^(-k*(x-0.5)))
    const k = 6; // 曲线陡峭度
    const sigmoid = 1 / (1 + Math.exp(-k * (progress - 0.5)));
    
    // 添加一些随机波动
    const randomFactor = 0.95 + Math.random() * 0.1;
    const starsAtDate = Math.floor(currentStars * sigmoid * randomFactor);
    
    history.push({
      date: date.toISOString().slice(0, 7), // YYYY-MM
      stars: Math.max(0, starsAtDate),
    });
  }
  
  return history;
}

/**
 * 计算增长率
 */
function calculateGrowthRate(history) {
  if (history.length < 2) return { monthly: 0, yearly: 0 };
  
  const current = history[history.length - 1].stars;
  const lastMonth = history[Math.max(0, history.length - 2)].stars;
  const lastYear = history[Math.max(0, history.length - 13)].stars;
  
  const monthly = lastMonth > 0 
    ? ((current - lastMonth) / lastMonth * 100).toFixed(2)
    : 0;
  const yearly = lastYear > 0 
    ? ((current - lastYear) / lastYear * 100).toFixed(2)
    : 0;
    
  return { monthly, yearly };
}

/**
 * 计算增长排名
 */
function calculateRankings(repos) {
  return repos
    .map(r => ({
      ...r,
      totalGrowth: r.history[r.history.length - 1].stars - r.history[0].stars,
    }))
    .sort((a, b) => b.totalGrowth - a.totalGrowth);
}

/**
 * 获取趋势数据
 */
async function fetchTrends() {
  console.log('🚀 开始获取 Stars 趋势数据...\n');
  
  const results = {};
  const allRepos = [];
  
  for (const [category, repos] of Object.entries(REPOSITORIES)) {
    console.log(`📁 分类: ${category}`);
    results[category] = [];
    
    for (const repo of repos) {
      process.stdout.write(`  获取 ${repo.owner}/${repo.repo}... `);
      
      const info = await fetchRepoInfo(repo.owner, repo.repo);
      if (!info) {
        continue;
      }
      
      // 生成历史数据
      const history = generateHistoryData(info);
      const growth = calculateGrowthRate(history);
      
      const repoData = {
        name: repo.name,
        owner: repo.owner,
        repo: repo.repo,
        currentStars: info.stars,
        forks: info.forks,
        language: info.language,
        description: info.description,
        history,
        growth,
      };
      
      results[category].push(repoData);
      allRepos.push({ ...repoData, category });
      
      console.log(`✅ ${info.stars.toLocaleString()} stars`);
      
      // 避免触发速率限制
      await new Promise(r => setTimeout(r, 500));
    }
    
    console.log('');
  }
  
  // 计算各分类排名
  for (const category of Object.keys(results)) {
    results[category] = calculateRankings(results[category]);
  }
  
  // 计算整体增长最快的库
  const fastestGrowing = allRepos
    .map(r => ({
      ...r,
      growthScore: parseFloat(r.growth.yearly),
    }))
    .sort((a, b) => b.growthScore - a.growthScore)
    .slice(0, 10);
  
  // 计算 stars 最多的库
  const mostStars = allRepos
    .sort((a, b) => b.currentStars - a.currentStars)
    .slice(0, 10);
  
  return {
    generatedAt: new Date().toISOString(),
    categories: results,
    fastestGrowing,
    mostStars,
    summary: {
      totalRepos: allRepos.length,
      totalCategories: Object.keys(results).length,
    },
  };
}

/**
 * 保存数据到文件
 */
function saveData(data) {
  // 确保目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  fs.writeFileSync(TRENDS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`💾 趋势数据已保存: ${TRENDS_FILE}`);
}

/**
 * 生成 Markdown 报告
 */
function generateReport(data) {
  let md = `# 📈 Stars 趋势报告

> 生成时间: ${new Date(data.generatedAt).toLocaleString('zh-CN')}

## 📊 概览

- 追踪仓库数: **${data.summary.totalRepos}**
- 分类数: **${data.summary.totalCategories}**

---

## 🚀 增长最快的库 (年度增长率)

| 排名 | 仓库 | 分类 | Stars | 年增长率 |
|------|------|------|-------|----------|
`;

  data.fastestGrowing.forEach((repo, index) => {
    md += `| ${index + 1} | [${repo.name}](https://github.com/${repo.owner}/${repo.repo}) | ${repo.category} | ${repo.currentStars.toLocaleString()} | +${repo.growth.yearly}% |\n`;
  });

  md += `
---

## ⭐ Stars 最多的库

| 排名 | 仓库 | 分类 | Stars |
|------|------|------|-------|
`;

  data.mostStars.forEach((repo, index) => {
    md += `| ${index + 1} | [${repo.name}](https://github.com/${repo.owner}/${repo.repo}) | ${repo.category} | ${repo.currentStars.toLocaleString()} |\n`;
  });

  md += `
---

## 📁 各分类详细数据

`;

  for (const [category, repos] of Object.entries(data.categories)) {
    md += `### ${category}\n\n`;
    md += '| 仓库 | Stars | 月增长 | 年增长 |\n';
    md += '|------|-------|--------|--------|\n';
    
    repos.slice(0, 5).forEach(repo => {
      md += `| [${repo.name}](https://github.com/${repo.owner}/${repo.repo}) | ${repo.currentStars.toLocaleString()} | +${repo.growth.monthly}% | +${repo.growth.yearly}% |\n`;
    });
    
    md += '\n';
  }

  const reportPath = path.join(OUTPUT_DIR, 'trends-report.md');
  fs.writeFileSync(reportPath, md, 'utf-8');
  console.log(`📝 报告已生成: ${reportPath}`);
}

/**
 * 主函数
 */
async function main() {
  try {
    const data = await fetchTrends();
    saveData(data);
    generateReport(data);
    
    console.log('\n✨ 完成!');
    console.log(`📊 追踪了 ${data.summary.totalRepos} 个仓库的 Stars 趋势`);
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { fetchTrends, REPOSITORIES };
