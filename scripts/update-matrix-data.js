#!/usr/bin/env node
/**
 * update-matrix-data.js
 *
 * 自动更新对比矩阵中的 GitHub Stars 和 NPM 下载量数据。
 *
 * 用法:
 *   node scripts/update-matrix-data.js
 *   node scripts/update-matrix-data.js --dry-run
 *   node scripts/update-matrix-data.js --matrix=package-managers
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ─── ANSI Colors ───
const G = '\x1b[32m';
const Y = '\x1b[33m';
const R = '\x1b[31m';
const C = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

// ─── CLI Args ───
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const MATRIX_ARG = args.find(a => a.startsWith('--matrix='));
const TARGET_MATRIX = MATRIX_ARG ? MATRIX_ARG.replace('--matrix=', '') : null;

// ─── Mappings ───
const REPO_MAP = {
  // 后端框架
  express: 'expressjs/express',
  fastify: 'fastify/fastify',
  nestjs: 'nestjs/nest',
  koa: 'koajs/koa',
  hono: 'honojs/hono',
  elysia: 'elysiajs/elysia',

  // 前端框架
  react: 'facebook/react',
  vue: 'vuejs/core',
  svelte: 'sveltejs/svelte',
  solid: 'solidjs/solid',
  angular: 'angular/angular',

  // 构建工具
  vite: 'vitejs/vite',
  webpack: 'webpack/webpack',
  rollup: 'rollup/rollup',

  // 编译器 / 转译器
  tsc: 'microsoft/TypeScript',
  babel: 'babel/babel',
  swc: 'swc-project/swc',
  esbuild: 'evanw/esbuild',
  rolldown: 'rolldown/rolldown',
  tsgo: 'microsoft/typescript-go',

  // SSR 元框架
  'next.js': 'vercel/next.js',
  nuxt: 'nuxt/nuxt',
  sveltekit: 'sveltejs/kit',
  remix: 'remix-run/remix',
  'tanstack start': 'tanstack/start',

  // 状态管理
  zustand: 'pmndrs/zustand',
  redux: 'reduxjs/redux',
  jotai: 'pmndrs/jotai',
  pinia: 'vuejs/pinia',

  // 测试
  vitest: 'vitest-dev/vitest',
  jest: 'jestjs/jest',
  playwright: 'microsoft/playwright',

  // ORM
  prisma: 'prisma/prisma',
  drizzle: 'drizzle-team/drizzle-orm',
  typeorm: 'typeorm/typeorm',

  // UI 库
  'shadcn/ui': 'shadcn-ui/ui',
  mui: 'mui/material-ui',
  'ant design': 'ant-design/ant-design',
  'chakra ui': 'chakra-ui/chakra-ui',

  // 包管理器
  npm: 'npm/cli',
  'yarn v1': 'yarnpkg/yarn',
  'yarn berry': 'yarnpkg/berry',
  yarn: 'yarnpkg/berry',
  pnpm: 'pnpm/pnpm',
  bun: 'oven-sh/bun',
  deno: 'denoland/deno',

  // Monorepo
  turborepo: 'vercel/turborepo',
  nx: 'nrwl/nx',
  rush: 'microsoft/rushstack',
  bit: 'teambit/bit',
  bazel: 'bazelbuild/bazel',
  lerna: 'lerna/lerna',
  'pnpm workspaces': 'pnpm/pnpm',

  // 可观测性
  sentry: 'getsentry/sentry-javascript',
  winston: 'winstonjs/winston',
  pino: 'pinojs/pino',
  roarr: 'gajus/roarr',

  // CI/CD
  jenkins: 'jenkinsci/jenkins',
  'drone ci': 'harness/drone',
  buildkite: 'buildkite/agent',
  'github actions': 'actions/runner',
  'gitlab ci': 'gitlabhq/gitlab-runner',
  'travis ci': 'travis-ci/travis-ci',

  // 其他
  'core-js': 'zloirock/core-js',
};

const NPM_MAP = {
  express: 'express',
  fastify: 'fastify',
  nestjs: '@nestjs/core',
  koa: 'koa',
  hono: 'hono',
  elysia: 'elysia',
  react: 'react',
  vue: 'vue',
  svelte: 'svelte',
  solid: 'solid-js',
  angular: '@angular/core',
  'next.js': 'next',
  nuxt: 'nuxt',
  sveltekit: '@sveltejs/kit',
  remix: '@remix-run/dev',
  'tanstack start': '@tanstack/start',
  vite: 'vite',
  webpack: 'webpack',
  rollup: 'rollup',
  babel: '@babel/core',
  swc: '@swc/core',
  esbuild: 'esbuild',
  rolldown: 'rolldown',
  zustand: 'zustand',
  redux: 'redux',
  jotai: 'jotai',
  pinia: 'pinia',
  vitest: 'vitest',
  jest: 'jest',
  playwright: '@playwright/test',
  prisma: '@prisma/client',
  drizzle: 'drizzle-orm',
  typeorm: 'typeorm',
  mui: '@mui/material',
  'ant design': 'antd',
  'chakra ui': '@chakra-ui/react',
  npm: 'npm',
  yarn: 'yarn',
  'yarn v1': 'yarn',
  'yarn berry': 'yarn',
  pnpm: 'pnpm',
  bun: 'bun',
  deno: 'deno',
  turborepo: 'turbo',
  nx: 'nx',
  lerna: 'lerna',
  sentry: '@sentry/browser',
  winston: 'winston',
  pino: 'pino',
  roarr: 'roarr',
  'core-js': 'core-js',
};

// ─── Utilities ───
function log(kind, msg) {
  const prefix =
    kind === 'ok'
      ? `${G}✓${RESET}`
      : kind === 'skip'
        ? `${Y}⊘${RESET}`
        : kind === 'err'
          ? `${R}✗${RESET}`
          : `${C}ℹ${RESET}`;
  console.log(`${prefix} ${msg}`);
}

function cleanToolName(name) {
  return name
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function fmtNum(n) {
  if (n == null) return '?';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return Math.round(n / 1_000) + 'k';
  return String(n);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── HTTP Client ───
async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const opts = {
      headers: {
        'User-Agent': 'nodejs-matrix-updater/1.0',
        Accept: 'application/json',
      },
      timeout: 15000,
    };
    https
      .get(url, opts, res => {
        let data = '';
        res.on('data', c => (data += c));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, headers: res.headers, body: data });
          } else {
            reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          }
        });
      })
      .on('error', reject)
      .on('timeout', () => reject(new Error(`Timeout for ${url}`)));
  });
}

async function fetchWithRetry(url, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchJson(url);
    } catch (err) {
      if (i === retries - 1) throw err;
      if (err.message.includes('403') || err.message.includes('429')) {
        log('skip', `Rate limit hit, waiting ${delay / 1000}s before retry ${i + 1}/${retries}...`);
        await sleep(delay);
        delay *= 2;
      } else {
        throw err;
      }
    }
  }
}

// ─── Data Fetchers ───
async function fetchGitHubStars(repo) {
  try {
    const res = await fetchWithRetry(`https://api.github.com/repos/${repo}`);
    const json = JSON.parse(res.body);
    const remaining = res.headers['x-ratelimit-remaining'];
    return {
      stars: json.stargazers_count,
      remaining: remaining != null ? Number(remaining) : undefined,
    };
  } catch (err) {
    return { error: err.message };
  }
}

async function fetchNpmDownloads(pkg) {
  try {
    const res = await fetchWithRetry(
      `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(pkg)}`
    );
    const json = JSON.parse(res.body);
    return { downloads: json.downloads };
  } catch (err) {
    return { error: err.message };
  }
}

// ─── Markdown Parser ───
function parseMatrix(content) {
  const lines = content.split(/\r?\n/);
  let headerLine = null;
  let starsLine = null;
  let starsLineIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\|\s*特性\s*\|/.test(line) && !/^\|[-\s|]+\|$/.test(line)) {
      headerLine = line;
    } else if (/\*\*GitHub Stars\*\*/.test(line)) {
      starsLine = line;
      starsLineIndex = i;
    }
  }

  if (!headerLine) return null;

  const headers = headerLine
    .split('|')
    .map(h => h.trim())
    .filter(Boolean);
  const tools = headers.slice(1); // drop "特性"

  let existingStars = [];
  if (starsLine) {
    const cells = starsLine.split('|').map(c => c.trim());
    existingStars = cells.slice(2); // drop empty first + "GitHub Stars"
  }

  return { tools, existingStars, starsLineIndex };
}

// ─── Write-back helper ───
function updateStarsLine(line, newValues) {
  const cells = line.split('|');
  // cells[0] is empty because line starts with |
  for (let i = 2; i < cells.length; i++) {
    const cell = cells[i].trim();
    if (cell === '-' || cell === '官方产品' || cell === '') continue;
    const idx = i - 2;
    if (idx < newValues.length && newValues[idx] != null) {
      const match = cell.match(/^[\d.]+[kM]?\b/);
      if (match) {
        const rest = cell.slice(match[0].length);
        cells[i] = ` ${newValues[idx]}${rest} `;
      }
    }
  }
  return cells.join('|');
}

// ─── Main ───
async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const matricesDir = path.join(rootDir, 'docs', 'comparison-matrices');
  const dataDir = path.join(rootDir, 'data');

  if (!fs.existsSync(matricesDir)) {
    log('err', `Matrices directory not found: ${matricesDir}`);
    process.exit(1);
  }

  let files = fs
    .readdirSync(matricesDir)
    .filter(f => f.endsWith('-compare.md'))
    .sort();

  if (TARGET_MATRIX) {
    files = files.filter(f => f === `${TARGET_MATRIX}-compare.md` || f.startsWith(`${TARGET_MATRIX}-`));
    if (files.length === 0) {
      log('err', `No matrix file matches "${TARGET_MATRIX}"`);
      process.exit(1);
    }
  }

  log('info', `Found ${files.length} matrix file(s) to process`);
  if (DRY_RUN) log('info', `${Y}Dry-run mode enabled — no files will be written${RESET}`);

  const summary = {};
  let totalTools = 0;
  let successStars = 0;
  let successNpm = 0;
  let skipTools = 0;
  let failStars = 0;
  let failNpm = 0;
  let githubQuota = 60;

  const MIN_INTERVAL = 1200; // ms between requests to avoid GitHub rate limits
  let lastRequestTime = 0;

  async function throttled(fn) {
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < MIN_INTERVAL) {
      await sleep(MIN_INTERVAL - elapsed);
    }
    lastRequestTime = Date.now();
    return fn();
  }

  for (const file of files) {
    const filepath = path.join(matricesDir, file);
    const content = fs.readFileSync(filepath, 'utf8');
    const parsed = parseMatrix(content);

    if (!parsed) {
      log('skip', `${file}: no table header found`);
      continue;
    }

    console.log(`\n${C}▶${RESET} ${file} (${parsed.tools.length} tools)`);
    summary[file] = [];
    const newStars = [];

    for (let i = 0; i < parsed.tools.length; i++) {
      const rawTool = parsed.tools[i];
      const clean = cleanToolName(rawTool);
      const repo = REPO_MAP[clean];
      const npmPkg = NPM_MAP[clean];
      totalTools++;

      let stars = null;
      let downloads = null;
      let starsErr = null;
      let npmErr = null;

      // GitHub Stars
      if (repo) {
        if (githubQuota <= 0) {
          starsErr = 'GitHub API quota exhausted (60 req/hr unauthenticated)';
          log('skip', `  ${rawTool}: ${starsErr}`);
          skipTools++;
        } else {
          process.stdout.write(`  ${DIM}Fetching ${rawTool}...${RESET}\r`);
          const result = await throttled(() => fetchGitHubStars(repo));
          if (result.error) {
            starsErr = result.error;
            log('err', `  ${rawTool} GitHub: ${starsErr}`);
            failStars++;
          } else {
            stars = result.stars;
            githubQuota = result.remaining ?? githubQuota - 1;
            log('ok', `  ${rawTool} GitHub: ${fmtNum(stars)} ★  (quota left: ${githubQuota})`);
            successStars++;
          }
        }
      } else {
        starsErr = 'no repo mapping';
        skipTools++;
      }

      // NPM Downloads
      if (npmPkg) {
        const result = await throttled(() => fetchNpmDownloads(npmPkg));
        if (result.error) {
          npmErr = result.error;
          log('err', `  ${rawTool} NPM: ${npmErr}`);
          failNpm++;
        } else {
          downloads = result.downloads;
          log('ok', `  ${rawTool} NPM: ${fmtNum(downloads)}/week ↓`);
          successNpm++;
        }
      } else {
        npmErr = 'no npm mapping';
      }

      summary[file].push({
        tool: rawTool,
        repo: repo || null,
        npmPackage: npmPkg || null,
        stars,
        starsError: starsErr,
        weeklyDownloads: downloads,
        npmError: npmErr,
        updatedAt: new Date().toISOString(),
      });

      newStars.push(stars != null ? fmtNum(stars) : null);
    }

    // ─── Write-back to Markdown ───
    if (parsed.starsLineIndex >= 0 && !DRY_RUN) {
      const lines = content.split(/\r?\n/);
      const oldLine = lines[parsed.starsLineIndex];
      const newLine = updateStarsLine(oldLine, newStars);
      if (newLine !== oldLine) {
        lines[parsed.starsLineIndex] = newLine;
        fs.writeFileSync(filepath, lines.join('\n'), 'utf8');
        log('ok', `  Updated Stars row in ${file}`);
      }
    }
  }

  // ─── Summary JSON ───
  const outputPath = path.join(dataDir, 'matrix-latest-data.json');
  const payload = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    targetMatrix: TARGET_MATRIX,
    stats: {
      totalTools,
      successStars,
      successNpm,
      skipped: skipTools,
      failStars,
      failNpm,
    },
    data: summary,
  };

  if (!DRY_RUN) {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf8');
    log('ok', `Summary written to ${path.relative(rootDir, outputPath)}`);
  } else {
    log('info', `Dry-run preview (first 3 entries):`);
    const preview = {};
    const keys = Object.keys(summary).slice(0, 3);
    keys.forEach(k => {
      preview[k] = summary[k].slice(0, 2);
    });
    console.log(JSON.stringify(preview, null, 2));
  }

  // ─── Final stats ───
  console.log('\n' + '─'.repeat(50));
  console.log(`${C}Done!${RESET}`);
  console.log(`  Total tools scanned : ${totalTools}`);
  console.log(`  ${G}GitHub Stars fetched: ${successStars}${RESET}`);
  console.log(`  ${G}NPM Downloads fetched: ${successNpm}${RESET}`);
  console.log(`  ${Y}Skipped / no mapping: ${skipTools}${RESET}`);
  console.log(`  ${R}GitHub failures     : ${failStars}${RESET}`);
  console.log(`  ${R}NPM failures        : ${failNpm}${RESET}`);
  console.log('─'.repeat(50));
}

main().catch(err => {
  log('err', err.message);
  process.exit(1);
});
