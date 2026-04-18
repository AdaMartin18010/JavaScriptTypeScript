#!/usr/bin/env node
/**
 * update-ecosystem-stats.js
 * 自动化获取 JS/TS 生态包统计信息
 *
 * 用法:
 *   node scripts/update-ecosystem-stats.js          # 生成/更新 data/ecosystem-stats.json
 *   node scripts/update-ecosystem-stats.js --check  # 对比本地与远程，输出过期警告
 */

const fs = require('fs');
const path = require('path');

// ==================== 配置 ====================

const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'ecosystem-stats.json');

// 需要跟踪的 npm 包（覆盖前端框架、后端框架、构建工具、AI SDK、ORM 等 50+ 包）
const PACKAGES = [
  // 前端框架
  'react', 'vue', 'angular', '@angular/core', 'svelte', 'solid-js', 'preact',
  // 后端框架
  'express', 'fastify', '@nestjs/core', 'koa', 'hono', 'elysia', 'h3',
  // 全栈元框架
  'next', 'nuxt', '@sveltejs/kit', 'astro', '@remix-run/react', '@tanstack/react-start',
  // 构建工具
  'vite', 'webpack', 'esbuild', '@swc/core', 'rollup', 'turbopack',
  // AI SDK
  'ai', 'langchain', '@mastra/core', '@modelcontextprotocol/sdk',
  // ORM
  'prisma', 'drizzle-orm', 'typeorm', 'sequelize', 'mongoose',
  // UI 库
  '@mui/material', 'antd', 'framer-motion',
  // 状态管理
  'redux', 'zustand', 'jotai', 'pinia',
  // 测试框架
  'jest', 'vitest', '@playwright/test', 'cypress',
  // TypeScript 工具链
  'typescript', 'tsx',
  // CSS 方案
  'tailwindcss', 'postcss', 'sass', 'styled-components',
  // 现代认证
  'better-auth', 'next-auth', '@auth/core',
  // 通用工具
  'lodash', 'ramda', 'zod', '@trpc/server', 'axios', 'date-fns', 'dayjs',
  // 代码质量
  'eslint', 'prettier', '@biomejs/biome', 'oxlint',
  // Monorepo
  'turbo', 'nx', 'lerna',
  // 日志/可观测性
  'pino', 'winston', '@sentry/node',
  // 数据库驱动
  'pg', 'mysql2', 'ioredis',
  // 消息队列
  'bullmq', 'bull',
];

// 需要跟踪的 GitHub 仓库
const REPOSITORIES = [
  'facebook/react', 'vuejs/core', 'angular/angular', 'sveltejs/svelte', 'solidjs/solid',
  'expressjs/express', 'fastify/fastify', 'nestjs/nest', 'koajs/koa', 'honojs/hono', 'elysiajs/elysia',
  'vercel/next.js', 'nuxt/nuxt', 'sveltejs/kit', 'withastro/astro', 'remix-run/remix',
  'vitejs/vite', 'webpack/webpack', 'evanw/esbuild', 'swc-project/swc', 'rollup/rollup',
  'vercel/ai', 'langchain-ai/langchainjs', 'mastra-ai/mastra', 'modelcontextprotocol/typescript-sdk',
  'prisma/prisma', 'drizzle-team/drizzle-orm', 'typeorm/typeorm', 'sequelize/sequelize',
  'mui/material-ui', 'ant-design/ant-design', 'colinhacks/zod', 'trpc/trpc',
  'tailwindlabs/tailwindcss', 'microsoft/typescript', 'biomejs/biome', 'oven-sh/bun',
  'denoland/deno', 'TanStack/tanstack-start', 'jaredhanson/passport',
  'auth0/node-jsonwebtoken', 'helmetjs/helmet',
];

// ==================== 工具函数 ====================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'jsts-ecosystem-stats/1.0',
    ...options.headers,
  };

  // 如果有 GITHUB_TOKEN，添加到 GitHub 请求
  if (url.includes('api.github.com') && process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { ...options, headers });

      // Rate limit 处理
      if (response.status === 429 || response.status === 403) {
        const retryAfter = response.headers.get('Retry-After');
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : delay * Math.pow(2, i);
        console.warn(`  ⚠️ Rate limited (${url}), waiting ${waitMs}ms...`);
        await sleep(waitMs);
        continue;
      }

      if (!response.ok) {
        if (response.status === 404) {
          // 404 是合法的（如仓库无 release）
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      const waitMs = delay * Math.pow(2, i);
      console.warn(`  ⚠️ Retry ${i + 1}/${retries} for ${url}: ${error.message}`);
      await sleep(waitMs);
    }
  }
  return null;
}

async function getNpmPackageInfo(pkg) {
  const registryUrl = `https://registry.npmjs.org/${encodeURIComponent(pkg)}`;
  const downloadsUrl = `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(pkg)}`;

  const [registryData, downloadsData] = await Promise.all([
    fetchWithRetry(registryUrl),
    fetchWithRetry(downloadsUrl),
  ]);

  if (!registryData) return null;

  const version = registryData['dist-tags']?.latest || 'unknown';
  const downloads = downloadsData?.downloads || 0;

  return { version, downloads };
}

async function getGitHubRepoInfo(repo) {
  const [owner, name] = repo.split('/');
  const repoUrl = `https://api.github.com/repos/${owner}/${name}`;
  const releaseUrl = `https://api.github.com/repos/${owner}/${name}/releases/latest`;

  const [repoData, releaseData] = await Promise.all([
    fetchWithRetry(repoUrl),
    fetchWithRetry(releaseUrl),
  ]);

  if (!repoData) return null;

  return {
    stars: repoData.stargazers_count || 0,
    latestRelease: releaseData?.tag_name || null,
  };
}

// ==================== 主逻辑 ====================

async function generateStats() {
  console.log('🚀 开始获取生态统计数据...\n');

  const packages = {};
  const repositories = {};
  const errors = [];

  // 分批处理 npm 包（避免并发过大）
  const BATCH_SIZE = 5;
  for (let i = 0; i < PACKAGES.length; i += BATCH_SIZE) {
    const batch = PACKAGES.slice(i, i + BATCH_SIZE);
    console.log(`📦 处理 npm 包 ${i + 1}–${Math.min(i + BATCH_SIZE, PACKAGES.length)} / ${PACKAGES.length}`);

    await Promise.all(batch.map(async (pkg) => {
      try {
        const info = await getNpmPackageInfo(pkg);
        if (info) {
          packages[pkg] = info;
          console.log(`  ✅ ${pkg}: v${info.version}, ${info.downloads.toLocaleString()} downloads/week`);
        } else {
          console.warn(`  ❌ ${pkg}: 获取失败`);
          errors.push({ type: 'npm', name: pkg, reason: 'fetch_failed' });
        }
      } catch (error) {
        console.warn(`  ❌ ${pkg}: ${error.message}`);
        errors.push({ type: 'npm', name: pkg, reason: error.message });
      }
    }));

    // 批次间延迟，避免触发 rate limit
    if (i + BATCH_SIZE < PACKAGES.length) {
      await sleep(500);
    }
  }

  console.log('');

  // 分批处理 GitHub 仓库
  for (let i = 0; i < REPOSITORIES.length; i += BATCH_SIZE) {
    const batch = REPOSITORIES.slice(i, i + BATCH_SIZE);
    console.log(`⭐ 处理 GitHub 仓库 ${i + 1}–${Math.min(i + BATCH_SIZE, REPOSITORIES.length)} / ${REPOSITORIES.length}`);

    await Promise.all(batch.map(async (repo) => {
      try {
        const info = await getGitHubRepoInfo(repo);
        if (info) {
          repositories[repo] = info;
          const releaseStr = info.latestRelease ? `, ${info.latestRelease}` : '';
          console.log(`  ✅ ${repo}: ${info.stars.toLocaleString()} stars${releaseStr}`);
        } else {
          console.warn(`  ❌ ${repo}: 获取失败`);
          errors.push({ type: 'github', name: repo, reason: 'fetch_failed' });
        }
      } catch (error) {
        console.warn(`  ❌ ${repo}: ${error.message}`);
        errors.push({ type: 'github', name: repo, reason: error.message });
      }
    }));

    if (i + BATCH_SIZE < REPOSITORIES.length) {
      await sleep(1000);
    }
  }

  const result = {
    generatedAt: new Date().toISOString(),
    packages,
    repositories,
    errors: errors.length > 0 ? errors : undefined,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));
  console.log(`\n✅ 数据已保存到 ${OUTPUT_PATH}`);
  console.log(`   包数量: ${Object.keys(packages).length}`);
  console.log(`   仓库数量: ${Object.keys(repositories).length}`);
  if (errors.length > 0) {
    console.log(`   错误数量: ${errors.length}`);
  }

  return result;
}

async function checkStats() {
  if (!fs.existsSync(OUTPUT_PATH)) {
    console.error(`❌ ${OUTPUT_PATH} 不存在，请先运行生成命令`);
    process.exit(1);
  }

  const local = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
  console.log('🔍 开始对比本地版本与远程最新版本...\n');
  console.log(`本地数据生成时间: ${local.generatedAt}\n`);

  const warnings = [];
  const BATCH_SIZE = 5;

  // 检查 npm 包
  for (let i = 0; i < PACKAGES.length; i += BATCH_SIZE) {
    const batch = PACKAGES.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (pkg) => {
      try {
        const remote = await getNpmPackageInfo(pkg);
        const localPkg = local.packages[pkg];

        if (!remote) return;
        if (!localPkg) {
          warnings.push({ pkg, local: 'N/A', remote: remote.version, severity: 'new' });
          return;
        }

        const [localMajor, localMinor] = localPkg.version.split('.').map(Number);
        const [remoteMajor, remoteMinor] = remote.version.split('.').map(Number);

        if (remoteMajor > localMajor) {
          warnings.push({ pkg, local: localPkg.version, remote: remote.version, severity: 'major' });
        } else if (remoteMajor === localMajor && remoteMinor > localMinor) {
          warnings.push({ pkg, local: localPkg.version, remote: remote.version, severity: 'minor' });
        } else if (remote.version !== localPkg.version) {
          warnings.push({ pkg, local: localPkg.version, remote: remote.version, severity: 'patch' });
        }
      } catch (error) {
        console.warn(`  ⚠️ ${pkg}: ${error.message}`);
      }
    }));
    await sleep(500);
  }

  // 检查 GitHub releases
  for (const repo of REPOSITORIES) {
    try {
      const remote = await getGitHubRepoInfo(repo);
      const localRepo = local.repositories[repo];

      if (!remote || !localRepo) continue;

      if (remote.latestRelease && remote.latestRelease !== localRepo.latestRelease) {
        warnings.push({ repo, local: localRepo.latestRelease, remote: remote.latestRelease, severity: 'release' });
      }
    } catch (error) {
      // ignore
    }
    await sleep(200);
  }

  console.log('');

  if (warnings.length === 0) {
    console.log('✅ 所有包均为最新版本');
    return;
  }

  const majorMinor = warnings.filter(w => w.severity === 'major' || w.severity === 'minor' || w.severity === 'release');
  const patch = warnings.filter(w => w.severity === 'patch');
  const newPkgs = warnings.filter(w => w.severity === 'new');

  if (majorMinor.length > 0) {
    console.log('🚨 重大版本变更:');
    majorMinor.forEach(w => {
      const name = w.pkg || w.repo;
      console.log(`   ${name}: ${w.local} → ${w.remote}`);
    });
  }

  if (newPkgs.length > 0) {
    console.log('📦 新增包:');
    newPkgs.forEach(w => {
      console.log(`   ${w.pkg}: ${w.remote}`);
    });
  }

  if (patch.length > 0) {
    console.log(`🔧 Patch 更新 (${patch.length} 个，略)`);
  }

  console.log(`\n总计: ${warnings.length} 个包需要更新`);
}

// ==================== 入口 ====================

const isCheck = process.argv.includes('--check');

if (isCheck) {
  checkStats().catch(err => {
    console.error(err);
    process.exit(1);
  });
} else {
  generateStats().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
