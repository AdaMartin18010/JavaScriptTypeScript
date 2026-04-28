#!/usr/bin/env node

/**
 * 版本号审计脚本
 *
 * 扫描所有 .md 文件中的技术版本号提及，与 2026 年已知最新版本对比，
 * 标记可能过期的版本号，提醒维护者更新。
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// 2026 年最新已知版本（LTS / Stable）
const LATEST_VERSIONS = {
  // Node.js
  'node\.js': { latest: 'v24', pattern: /Node\.js\s+v?(\d+)/gi },
  'nodejs': { latest: 'v24', pattern: /NodeJS?\s+v?(\d+)/gi },

  // React 生态
  'react': { latest: '19', pattern: /React\s+(?!Native\s+|Router\s+|Query\s+)(v?)(\d+)/gi },
  'next\.js': { latest: '15', pattern: /Next\.js\s+v?(\d+)/gi },

  // Vue 生态
  'vue': { latest: '3.5', pattern: /Vue\.js\s+v?(\d+(?:\.\d+)?)/gi },

  // Angular
  'angular': { latest: '19', pattern: /Angular\s+v?(\d+)/gi },

  // TypeScript
  'typescript': { latest: '5.8', pattern: /TypeScript\s+(v?)(\d+\.\d+)/gi },
  'ts': { latest: '5.8', pattern: /\bTS\s+(v?)(\d+\.\d+)/gi },

  // 构建工具
  'vite': { latest: '6', pattern: /Vite\s+v?(\d+)/gi },
  'webpack': { latest: '5', pattern: /Webpack\s+v?(\d+)/gi },
  'esbuild': { latest: '0.25', pattern: /esbuild\s+v?(\d+\.\d+)/gi },
  'rollup': { latest: '4', pattern: /Rollup\s+v?(\d+)/gi },
  'parcel': { latest: '2', pattern: /Parcel\s+v?(\d+)/gi },
  'turbopack': { latest: '1', pattern: /Turbopack\s+v?(\d+)/gi },

  // 包管理器
  'npm': { latest: '11', pattern: /npm\s+v?(\d+)/gi },
  'pnpm': { latest: '10', pattern: /pnpm\s+v?(\d+)/gi },
  'yarn': { latest: '4', pattern: /Yarn\s+v?(\d+)/gi },
  'bun': { latest: '1.2', pattern: /Bun\s+v?(\d+\.\d+)/gi },

  // 运行时
  'deno': { latest: '2', pattern: /Deno\s+v?(\d+)/gi },

  // 测试框架
  'jest': { latest: '30', pattern: /Jest\s+v?(\d+)/gi },
  'vitest': { latest: '3', pattern: /Vitest\s+v?(\d+)/gi },
  'playwright': { latest: '1.50', pattern: /Playwright\s+v?(\d+\.\d+)/gi },
  'cypress': { latest: '14', pattern: /Cypress\s+v?(\d+)/gi },

  // 状态管理
  'redux': { latest: '5', pattern: /Redux\s+v?(\d+)/gi },
  'zustand': { latest: '5', pattern: /Zustand\s+v?(\d+)/gi },

  // CSS 框架
  'tailwindcss': { latest: '4', pattern: /Tailwind\s+CSS\s+v?(\d+)/gi },

  // 后端框架
  'express': { latest: '5', pattern: /Express\.js\s+v?(\d+)/gi },
  'fastify': { latest: '5', pattern: /Fastify\s+v?(\d+)/gi },
  'nest': { latest: '11', pattern: /NestJS?\s+v?(\d+)/gi },
  'hono': { latest: '4', pattern: /Hono\s+v?(\d+)/gi },

  // 数据库/ORM
  'prisma': { latest: '6', pattern: /Prisma\s+v?(\d+)/gi },
  'drizzle': { latest: '1', pattern: /Drizzle\s+ORM\s+v?(\d+)/gi },

  // 其他
  'electron': { latest: '35', pattern: /Electron\s+v?(\d+)/gi },
  'tauri': { latest: '2', pattern: /Tauri\s+v?(\d+)/gi },
  'astro': { latest: '5', pattern: /Astro\s+v?(\d+)/gi },
  'svelte': { latest: '5', pattern: /Svelte\s+v?(\d+)/gi },
  'solid': { latest: '1', pattern: /SolidJS?\s+v?(\d+)/gi },
  'remix': { latest: '2', pattern: /Remix\s+v?(\d+)/gi },
  'nuxt': { latest: '3', pattern: /Nuxt\.js\s+v?(\d+)/gi },
  'quasar': { latest: '2', pattern: /Quasar\s+v?(\d+)/gi },
};

const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  '.vitepress',
  'dist',
  'build',
  '.azure',
];

function getAllMarkdownFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.includes(entry.name)) continue;
      if (entry.name.startsWith('.')) continue;
      getAllMarkdownFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * 比较版本号
 * 支持 x 和 x.y 格式
 */
function isOutdated(foundVersion, latestVersion) {
  const foundParts = String(foundVersion).split('.').map(Number);
  const latestParts = String(latestVersion).split('.').map(Number);

  for (let i = 0; i < Math.max(foundParts.length, latestParts.length); i++) {
    const f = foundParts[i] || 0;
    const l = latestParts[i] || 0;
    if (f < l) return true;
    if (f > l) return false;
  }
  return false;
}

function runVersionAudit() {
  console.log('🔍 开始版本号审计...\n');

  const mdFiles = getAllMarkdownFiles(PROJECT_ROOT);
  const findings = [];
  let totalMentions = 0;

  for (const filePath of mdFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(PROJECT_ROOT, filePath);

    for (const [tech, config] of Object.entries(LATEST_VERSIONS)) {
      // 重置正则 lastIndex
      config.pattern.lastIndex = 0;

      let match;
      while ((match = config.pattern.exec(content)) !== null) {
        // 确定捕获的组（有些模式有两个捕获组）
        const versionStr = match[match.length - 1];
        if (!versionStr) continue;

        totalMentions++;

        if (isOutdated(versionStr, config.latest)) {
          // 计算行号
          const pos = match.index;
          const lineNum = content.substring(0, pos).split('\n').length;
          const lineText = lines[lineNum - 1] || '';

          findings.push({
            file: relativePath,
            line: lineNum,
            technology: tech,
            found: versionStr,
            latest: config.latest,
            context: lineText.trim().substring(0, 120),
          });
        }
      }
    }
  }

  // 去重：同一文件同一行同一技术只保留一条
  const seen = new Set();
  const uniqueFindings = findings.filter(f => {
    const key = `${f.file}:${f.line}:${f.technology}:${f.found}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 输出报告
  console.log(`📄 扫描文件: ${mdFiles.length} 个 Markdown 文件`);
  console.log(`🏷️  版本提及: ${totalMentions} 处`);

  if (uniqueFindings.length > 0) {
    console.log(`\n⚠️  发现 ${uniqueFindings.length} 处可能过期的版本号:\n`);

    // 按技术分组
    const byTech = {};
    for (const f of uniqueFindings) {
      byTech[f.technology] = byTech[f.technology] || [];
      byTech[f.technology].push(f);
    }

    for (const [tech, items] of Object.entries(byTech).sort()) {
      console.log(`  📦 ${tech.toUpperCase()} (最新: ${items[0].latest})`);
      for (const item of items) {
        console.log(`     ${item.file}:${item.line} — 发现 v${item.found}`);
        console.log(`     ${item.context}`);
      }
      console.log('');
    }
  } else {
    console.log('\n✅ 未发现明显过期的版本号！');
  }

  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: mdFiles.length,
    totalMentions,
    outdatedCount: uniqueFindings.length,
    findings: uniqueFindings,
    passed: uniqueFindings.length === 0,
  };

  const reportPath = path.join(__dirname, 'version-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`📁 报告已保存: ${path.relative(PROJECT_ROOT, reportPath)}`);

  return report;
}

if (require.main === module) {
  const report = runVersionAudit();
  process.exit(report.passed ? 0 : 1);
}

module.exports = { runVersionAudit };
