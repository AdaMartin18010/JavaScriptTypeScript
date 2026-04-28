#!/usr/bin/env node

/**
 * 内容质量检查总控脚本
 *
 * 依次运行：
 *   1. link-checker.js      — 内部链接完整性
 *   2. version-audit.js     — 版本号时效性
 *   3. cross-reference-validator.js — 理论-实践闭环完整性
 *
 * 汇总输出 JSON 质量报告，并返回统一退出码：
 *   0 = 全部通过
 *   1 = 有警告（版本过期、部分模块缺 THEORY.md）
 *   2 = 有错误（断裂链接、断裂引用）
 */

const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..', '..');

const CHECKS = [
  {
    name: 'link-checker',
    report: 'link-check',
    weight: 'error',
    run: () => require('./link-checker.js').runLinkCheck(),
  },
  {
    name: 'version-audit',
    report: 'version-audit',
    weight: 'warning',
    run: () => require('./version-audit.js').runVersionAudit(),
  },
  {
    name: 'cross-reference-validator',
    report: 'cross-reference',
    weight: 'error',
    run: () => require('./cross-reference-validator.js').runCrossReferenceValidation(),
  },
];

function loadReport(reportName) {
  const reportPath = path.join(SCRIPT_DIR, `${reportName}-report.json`);
  if (fs.existsSync(reportPath)) {
    try {
      return JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    } catch {
      return null;
    }
  }
  return null;
}

function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║      JS/TS 全景知识库 · 内容质量检查        ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const results = [];
  let maxExitCode = 0;
  const reportData = {};

  for (const check of CHECKS) {
    console.log(`▶️  运行 ${check.name}...`);
    console.log('─'.repeat(50));

    let report;
    try {
      report = check.run();
    } catch (error) {
      console.error(`❌ ${check.name} 执行失败: ${error.message}`);
      results.push({ name: check.name, status: 'failed', exitCode: 2 });
      maxExitCode = Math.max(maxExitCode, 2);
      reportData[check.name] = { passed: false, error: error.message };
      console.log('');
      continue;
    }

    // 确定状态与退出码
    let status = 'passed';
    let exitCode = 0;

    if (!report.passed) {
      if (check.weight === 'error') {
        status = 'error';
        exitCode = 2;
      } else {
        status = 'warning';
        exitCode = 1;
      }
    }

    results.push({ name: check.name, status, exitCode, weight: check.weight });
    maxExitCode = Math.max(maxExitCode, exitCode);

    // 加载对应 JSON 报告
    const detail = loadReport(check.report);
    if (detail) {
      reportData[check.name] = detail;
    }

    console.log('');
  }

  // 汇总
  console.log('╔════════════════════════════════════════════╗');
  console.log('║              检 查 汇 总                    ║');
  console.log('╚════════════════════════════════════════════╝');

  for (const r of results) {
    const icon = r.status === 'passed' ? '✅' : r.status === 'warning' ? '⚠️' : '❌';
    console.log(`  ${icon} ${r.name.padEnd(30)} ${r.status.toUpperCase()}`);
  }

  const summary = {
    timestamp: new Date().toISOString(),
    overallStatus: maxExitCode === 0 ? 'passed' : maxExitCode === 1 ? 'warning' : 'error',
    exitCode: maxExitCode,
    results: reportData,
  };

  const summaryPath = path.join(SCRIPT_DIR, 'quality-report.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');

  console.log(`\n📁 综合报告已保存: ${path.relative(PROJECT_ROOT, summaryPath)}`);

  if (maxExitCode === 0) {
    console.log('\n✅ 全部检查通过！');
  } else if (maxExitCode === 1) {
    console.log('\n⚠️  存在警告，建议查看并更新。');
  } else {
    console.log('\n❌ 存在错误，请务必修复。');
  }

  process.exit(maxExitCode);
}

main();
