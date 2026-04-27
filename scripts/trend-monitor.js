#!/usr/bin/env node

/**
 * 自动化趋势监测脚本
 *
 * 功能：
 * 1. 读取 data/ecosystem-stats.json 和 data/matrix-latest-data.json
 * 2. 与上一次的 baseline 对比，检测 GitHub Stars 增速 >20% 或 npm 周下载量变化 >30%
 * 3. 输出 Markdown 格式的趋势报告到 data/trend-report-YYYY-MM-DD.md
 *
 * 使用方法:
 *   node scripts/trend-monitor.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BASELINE_FILE = path.join(DATA_DIR, '.trend-monitor-baseline.json');

function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.error(`❌ 解析失败: ${filePath} - ${e.message}`);
    return null;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function formatNumber(num) {
  if (num === null || num === undefined) return 'N/A';
  return num.toLocaleString('en-US');
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function generateReport(current, baseline) {
  const today = getToday();
  const reportPath = path.join(DATA_DIR, `trend-report-${today}.md`);

  let md = `# 📈 JSTS 生态趋势监测报告\n\n`;
  md += `> 生成时间: ${today} ${new Date().toLocaleTimeString('zh-CN')}\n\n`;

  const starAlerts = [];
  const npmAlerts = [];
  const allItems = [];

  // 1. 检查 ecosystem-stats.json 中的 repositories (stars) 和 packages (downloads)
  if (current.ecosystem) {
    const prevEcosystem = baseline?.ecosystem || {};

    // Stars
    if (current.ecosystem.repositories) {
      for (const [repo, info] of Object.entries(current.ecosystem.repositories)) {
        const prevStars = prevEcosystem.repositories?.[repo]?.stars;
        const currStars = info.stars;
        if (typeof currStars === 'number' && typeof prevStars === 'number' && prevStars > 0) {
          const growth = (currStars - prevStars) / prevStars;
          allItems.push({ type: 'star', name: repo, prev: prevStars, curr: currStars, growth });
          if (growth > 0.20) {
            starAlerts.push({ name: repo, prev: prevStars, curr: currStars, growth });
          }
        }
      }
    }

    // Packages downloads
    if (current.ecosystem.packages) {
      for (const [pkg, info] of Object.entries(current.ecosystem.packages)) {
        const prevDownloads = prevEcosystem.packages?.[pkg]?.downloads;
        const currDownloads = info.downloads;
        if (typeof currDownloads === 'number' && typeof prevDownloads === 'number' && prevDownloads > 0) {
          const change = (currDownloads - prevDownloads) / prevDownloads;
          allItems.push({ type: 'npm', name: pkg, prev: prevDownloads, curr: currDownloads, growth: change });
          if (Math.abs(change) > 0.30) {
            npmAlerts.push({ name: pkg, prev: prevDownloads, curr: currDownloads, change });
          }
        }
      }
    }
  }

  // 2. 检查 matrix-latest-data.json
  if (current.matrix?.data) {
    const prevMatrix = baseline?.matrix?.data || {};
    for (const [fileKey, tools] of Object.entries(current.matrix.data)) {
      const prevTools = prevMatrix[fileKey] || [];
      const prevMap = new Map(prevTools.map(t => [t.tool, t]));

      for (const tool of tools) {
        const prev = prevMap.get(tool.tool);
        if (!prev) continue;

        // Stars
        if (typeof tool.stars === 'number' && typeof prev.stars === 'number' && prev.stars > 0) {
          const growth = (tool.stars - prev.stars) / prev.stars;
          allItems.push({ type: 'star', name: `${tool.tool} (${fileKey})`, prev: prev.stars, curr: tool.stars, growth });
          if (growth > 0.20) {
            starAlerts.push({ name: `${tool.tool} (${fileKey})`, prev: prev.stars, curr: tool.stars, growth });
          }
        }

        // Weekly downloads
        if (typeof tool.weeklyDownloads === 'number' && typeof prev.weeklyDownloads === 'number' && prev.weeklyDownloads > 0) {
          const change = (tool.weeklyDownloads - prev.weeklyDownloads) / prev.weeklyDownloads;
          allItems.push({ type: 'npm', name: `${tool.tool} (${fileKey})`, prev: prev.weeklyDownloads, curr: tool.weeklyDownloads, growth: change });
          if (Math.abs(change) > 0.30) {
            npmAlerts.push({ name: `${tool.tool} (${fileKey})`, prev: prev.weeklyDownloads, curr: tool.weeklyDownloads, change });
          }
        }
      }
    }
  }

  // Summary
  md += `## 📊 概览\n\n`;
  md += `- 监测项目总数: **${allItems.length}**\n`;
  md += `- Stars 异常增长 (>20%): **${starAlerts.length}**\n`;
  md += `- npm 下载量异常变化 (>30%): **${npmAlerts.length}**\n`;
  md += `- 基线对比日期: ${baseline?.generatedAt || '无'}\n\n`;

  // Alerts
  md += `---\n\n`;

  if (starAlerts.length > 0) {
    md += `## 🚀 Stars 增速异常 (>20%)\n\n`;
    md += `| 项目 | 上次 Stars | 当前 Stars | 增速 |\n`;
    md += `|------|-----------|-----------|------|\n`;
    for (const a of starAlerts.sort((a, b) => b.growth - a.growth)) {
      md += `| ${a.name} | ${formatNumber(a.prev)} | ${formatNumber(a.curr)} | +${(a.growth * 100).toFixed(1)}% |\n`;
    }
    md += `\n`;
  } else {
    md += `## 🚀 Stars 增速异常 (>20%)\n\n无异常项目。\n\n`;
  }

  if (npmAlerts.length > 0) {
    md += `## 📦 npm 下载量异常变化 (>30%)\n\n`;
    md += `| 包名 | 上次下载量 | 当前下载量 | 变化 |\n`;
    md += `|------|-----------|-----------|------|\n`;
    for (const a of npmAlerts.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))) {
      const sign = a.change > 0 ? '+' : '';
      md += `| ${a.name} | ${formatNumber(a.prev)} | ${formatNumber(a.curr)} | ${sign}${(a.change * 100).toFixed(1)}% |\n`;
    }
    md += `\n`;
  } else {
    md += `## 📦 npm 下载量异常变化 (>30%)\n\n无异常项目。\n\n`;
  }

  // Top movers
  const topStarMovers = allItems
    .filter(i => i.type === 'star')
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 10);

  const topNpmMovers = allItems
    .filter(i => i.type === 'npm')
    .sort((a, b) => Math.abs(b.growth) - Math.abs(a.growth))
    .slice(0, 10);

  md += `---\n\n`;
  md += `## 📈 Stars 增长 Top 10\n\n`;
  md += `| 排名 | 项目 | 增速 | 上次 → 当前 |\n`;
  md += `|------|------|------|-------------|\n`;
  topStarMovers.forEach((item, idx) => {
    md += `| ${idx + 1} | ${item.name} | +${(item.growth * 100).toFixed(1)}% | ${formatNumber(item.prev)} → ${formatNumber(item.curr)} |\n`;
  });
  md += `\n`;

  md += `## 📦 npm 变化 Top 10 (按绝对值)\n\n`;
  md += `| 排名 | 包名 | 变化 | 上次 → 当前 |\n`;
  md += `|------|------|------|-------------|\n`;
  topNpmMovers.forEach((item, idx) => {
    const sign = item.growth > 0 ? '+' : '';
    md += `| ${idx + 1} | ${item.name} | ${sign}${(item.growth * 100).toFixed(1)}% | ${formatNumber(item.prev)} → ${formatNumber(item.curr)} |\n`;
  });
  md += `\n`;

  md += `---\n\n> 由 scripts/trend-monitor.js 自动生成\n`;

  fs.writeFileSync(reportPath, md, 'utf-8');
  console.log(`📝 趋势报告已生成: ${reportPath}`);

  return { starAlerts, npmAlerts, allItems };
}

function main() {
  console.log('🔍 开始趋势监测...\n');

  const ecosystem = readJSON(path.join(DATA_DIR, 'ecosystem-stats.json'));
  const matrix = readJSON(path.join(DATA_DIR, 'matrix-latest-data.json'));

  if (!ecosystem && !matrix) {
    console.error('❌ 未找到 ecosystem-stats.json 或 matrix-latest-data.json');
    process.exit(1);
  }

  const current = {
    generatedAt: new Date().toISOString(),
    ecosystem,
    matrix,
  };

  const baseline = fs.existsSync(BASELINE_FILE) ? readJSON(BASELINE_FILE) : null;

  if (!baseline) {
    console.log('⚠️ 未找到基线数据，将当前数据设为基线，本次不生成异常报告。');
    writeJSON(BASELINE_FILE, current);
    console.log(`💾 基线已保存: ${BASELINE_FILE}`);

    // 仍然生成一个说明性的报告
    const today = getToday();
    const reportPath = path.join(DATA_DIR, `trend-report-${today}.md`);
    let md = `# 📈 JSTS 生态趋势监测报告\n\n`;
    md += `> 生成时间: ${today}\n\n`;
    md += `## 📊 概览\n\n`;
    md += `这是首次运行，已建立基线数据。后续运行将基于此基线检测趋势异常。\n\n`;
    md += `- 基线文件: \`.trend-monitor-baseline.json\`\n`;
    md += `- 监测来源: ecosystem-stats.json, matrix-latest-data.json\n`;
    md += `\n---\n\n> 由 scripts/trend-monitor.js 自动生成\n`;
    fs.writeFileSync(reportPath, md, 'utf-8');
    console.log(`📝 趋势报告已生成: ${reportPath}`);
    process.exit(0);
  }

  console.log(`📊 基线日期: ${baseline.generatedAt || '未知'}`);
  console.log(`📦 ecosystem-stats: ${ecosystem ? '✅' : '❌'}`);
  console.log(`📊 matrix-latest-data: ${matrix ? '✅' : '❌'}`);

  const result = generateReport(current, baseline);

  console.log(`\n✅ 检测完成`);
  console.log(`   Stars 异常增长: ${result.starAlerts.length}`);
  console.log(`   npm 异常变化: ${result.npmAlerts.length}`);
  console.log(`   总监测项: ${result.allItems.length}`);

  // 更新基线
  writeJSON(BASELINE_FILE, current);
  console.log(`\n💾 基线已更新: ${BASELINE_FILE}`);
}

main();
