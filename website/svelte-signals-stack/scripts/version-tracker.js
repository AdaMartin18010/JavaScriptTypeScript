#!/usr/bin/env node
/**
 * 版本跟踪脚本
 * 检测 Svelte / TypeScript / Vite / Chrome 的最新版本
 * 与文档中声明的版本对比，生成差异报告
 * 
 * 运行方式: node scripts/version-tracker.js
 */

const fs = require('fs');
const path = require('path');

// 文档中声明的基线版本
const BASELINE = {
  svelte: '5.55.5',
  sveltekit: '2.59.x',
  typescript: '5.8.x',
  vite: '6.3.x',
  chrome: '130+',
  tc39_signals: 'Stage 1'
};

// npm registry 检查点
const NPM_PACKAGES = {
  svelte: 'https://registry.npmjs.org/svelte/latest',
  sveltekit: 'https://registry.npmjs.org/@sveltejs/kit/latest',
  typescript: 'https://registry.npmjs.org/typescript/latest',
  vite: 'https://registry.npmjs.org/vite/latest'
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(level, msg) {
  const color = level === 'error' ? colors.red : level === 'warn' ? colors.yellow : colors.green;
  console.log(`${color}${msg}${colors.reset}`);
}

async function fetchNpmVersion(pkg, url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.version;
  } catch (e) {
    log('error', `❌ 获取 ${pkg} 版本失败: ${e.message}`);
    return null;
  }
}

function compareVersions(current, latest) {
  if (!latest) return { status: 'unknown', diff: null };
  if (latest === current) return { status: 'current', diff: null };
  
  const c = current.replace(/\^|~|x|\+|>=|>/g, '').split('.').map(Number);
  const l = latest.split('.').map(Number);
  
  // 简单的主版本/次版本对比
  if (l[0] > c[0]) return { status: 'major', diff: `${current} → ${latest}` };
  if (l[1] > c[1]) return { status: 'minor', diff: `${current} → ${latest}` };
  if (l[2] > c[2]) return { status: 'patch', diff: `${current} → ${latest}` };
  return { status: 'current', diff: null };
}

async function main() {
  log('info', '\n🔍 Svelte Signals Stack 版本跟踪器');
  log('info', '=====================================\n');
  
  const results = {};
  
  for (const [pkg, url] of Object.entries(NPM_PACKAGES)) {
    const latest = await fetchNpmVersion(pkg, url);
    const baseline = BASELINE[pkg];
    const comparison = compareVersions(baseline, latest);
    
    results[pkg] = {
      baseline,
      latest,
      status: comparison.status,
      diff: comparison.diff
    };
    
    const icon = comparison.status === 'current' ? '✅' : 
                 comparison.status === 'patch' ? '🟡' : 
                 comparison.status === 'minor' ? '🟠' : '🔴';
    
    log(
      comparison.status === 'current' ? 'info' : 'warn',
      `${icon} ${pkg}: 文档基线 ${baseline} | 最新 ${latest || 'unknown'}${comparison.diff ? ` | ${comparison.diff}` : ''}`
    );
  }
  
  // 手动检查项
  log('info', `📝 Chrome: 文档基线 ${BASELINE.chrome} | 请手动检查 Chrome Releases`);
  log('info', `📝 TC39 Signals: 文档基线 ${BASELINE.tc39_signals} | 请手动检查 tc39/proposal-signals`);
  
  // 生成报告
  const reportPath = path.join(__dirname, 'version-check-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    baseline: BASELINE,
    results
  }, null, 2));
  
  log('info', `\n📄 报告已保存: ${reportPath}\n`);
  
  // 如果有重要更新，输出行动建议
  const needsUpdate = Object.values(results).some(r => r.status === 'major' || r.status === 'minor');
  if (needsUpdate) {
    log('warn', '⚠️ 检测到重要版本更新，建议执行以下动作:');
    for (const [pkg, r] of Object.entries(results)) {
      if (r.status === 'major' || r.status === 'minor') {
        log('warn', `   - 更新 ${pkg} 相关文档（当前 ${r.baseline} → 最新 ${r.latest}）`);
      }
    }
  } else {
    log('info', '✅ 所有依赖版本与文档基线一致，无需更新');
  }
}

main().catch(e => {
  log('error', `脚本执行失败: ${e.message}`);
  process.exit(1);
});
