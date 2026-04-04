#!/usr/bin/env node

/**
 * 安全漏洞扫描脚本
 * 
 * 此脚本会：
 * 1. 读取项目中所有 package.json 文件
 * 2. 使用 npm audit 检查依赖安全漏洞
 * 3. 可选：使用 OSV.dev API 检查漏洞
 * 4. 生成安全报告并标记漏洞等级
 * 
 * 使用方法:
 *   node scripts/security-check.js              # 扫描所有项目
 *   node scripts/security-check.js --json       # 输出 JSON 格式
 *   node scripts/security-check.js --osv        # 使用 OSV API
 *   node scripts/security-check.js --fix        # 尝试自动修复
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  // 扫描的根目录
  scanDirs: [
    path.join(__dirname, '..', 'jsts-code-lab'),
  ],
  // 输出文件路径
  outputPath: path.join(__dirname, '..', 'security-report.json'),
  // Markdown 报告路径
  markdownPath: path.join(__dirname, '..', 'SECURITY.md'),
  // 是否包含 devDependencies
  includeDev: true,
  // 严重程度映射
  severityLevels: {
    critical: 4,
    high: 3,
    moderate: 2,
    low: 1,
    info: 0
  }
};

// 标记系统
const MARKERS = {
  safe: '🟢',      // 安全
  low: '🟡',       // 低危漏洞
  moderate: '🟠',  // 中危漏洞
  high: '🔴',      // 高危漏洞
  critical: '🔴'   // 严重漏洞
};

// 颜色代码 (终端)
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  orange: '\x1b[38;5;208m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

/**
 * 查找所有 package.json 文件
 */
function findPackageJsonFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      // 跳过 node_modules 和隐藏目录
      if (item.name === 'node_modules' || item.name.startsWith('.')) continue;
      findPackageJsonFiles(fullPath, files);
    } else if (item.name === 'package.json') {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * 运行 npm audit 并解析结果
 */
function runNpmAudit(packageJsonPath) {
  const dir = path.dirname(packageJsonPath);
  const result = {
    path: packageJsonPath,
    vulnerabilities: {},
    total: 0,
    severity: 'safe',
    details: [],
    error: null
  };

  try {
    // 检查是否有 node_modules
    if (!fs.existsSync(path.join(dir, 'node_modules'))) {
      result.error = 'Dependencies not installed. Run npm install first.';
      return result;
    }

    // 运行 npm audit --json
    const output = execSync('npm audit --json', {
      cwd: dir,
      encoding: 'utf-8',
      timeout: 60000,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const audit = JSON.parse(output);
    
    // 解析漏洞信息
    if (audit.vulnerabilities) {
      for (const [name, info] of Object.entries(audit.vulnerabilities)) {
        const severity = info.severity || 'low';
        
        if (!result.vulnerabilities[severity]) {
          result.vulnerabilities[severity] = 0;
        }
        result.vulnerabilities[severity]++;
        result.total++;

        // 添加详细信息
        const detail = {
          package: name,
          severity: severity,
          range: info.via?.[0]?.range || info.range || 'unknown',
          fixAvailable: info.fixAvailable !== false,
          via: info.via?.map(v => typeof v === 'string' ? v : v.title).filter(Boolean) || []
        };
        result.details.push(detail);
      }
    }

    // 计算总体严重程度
    result.severity = calculateOverallSeverity(result.vulnerabilities);

  } catch (error) {
    // npm audit 以非零退出码返回漏洞，需要解析 stderr 或 stdout
    try {
      const output = error.stdout || error.message;
      const audit = JSON.parse(output);
      
      if (audit.vulnerabilities) {
        for (const [name, info] of Object.entries(audit.vulnerabilities)) {
          const severity = info.severity || 'low';
          
          if (!result.vulnerabilities[severity]) {
            result.vulnerabilities[severity] = 0;
          }
          result.vulnerabilities[severity]++;
          result.total++;

          const detail = {
            package: name,
            severity: severity,
            range: info.via?.[0]?.range || info.range || 'unknown',
            fixAvailable: info.fixAvailable !== false,
            via: info.via?.map(v => typeof v === 'string' ? v : v.title).filter(Boolean) || []
          };
          result.details.push(detail);
        }
      }
      
      // 计算元数据
      if (audit.metadata) {
        result.metadata = {
          totalDependencies: audit.metadata.totalDependencies,
          vulnerableDependencies: audit.metadata.vulnerableDependencies
        };
      }
      
      result.severity = calculateOverallSeverity(result.vulnerabilities);
    } catch (parseError) {
      result.error = `Failed to parse audit: ${error.message}`;
    }
  }

  return result;
}

/**
 * 计算总体严重程度
 */
function calculateOverallSeverity(vulnerabilities) {
  if (vulnerabilities.critical > 0) return 'critical';
  if (vulnerabilities.high > 0) return 'high';
  if (vulnerabilities.moderate > 0) return 'moderate';
  if (vulnerabilities.low > 0) return 'low';
  return 'safe';
}

/**
 * 查询 OSV.dev API
 */
async function queryOSV(packageName, version) {
  try {
    const response = await fetch('https://api.osv.dev/v1/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        package: {
          name: packageName,
          ecosystem: 'npm'
        },
        version: version
      })
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    return data.vulns || [];
  } catch (error) {
    return null;
  }
}

/**
 * 使用 OSV API 扫描
 */
async function scanWithOSV(packageJsonPath) {
  const content = fs.readFileSync(packageJsonPath, 'utf-8');
  const pkg = JSON.parse(content);
  
  const dependencies = {
    ...pkg.dependencies,
    ...pkg.devDependencies
  };

  const results = [];

  for (const [name, version] of Object.entries(dependencies)) {
    // 清理版本号
    const cleanVersion = version.replace(/^[^0-9]*/, '');
    
    const vulns = await queryOSV(name, cleanVersion);
    if (vulns && vulns.length > 0) {
      results.push({
        package: name,
        version: cleanVersion,
        vulnerabilities: vulns.map(v => ({
          id: v.id,
          summary: v.summary,
          severity: v.severity?.[0]?.score || 'unknown',
          published: v.published
        }))
      });
    }
    
    // 添加延迟避免速率限制
    await new Promise(r => setTimeout(r, 100));
  }

  return results;
}

/**
 * 运行 Snyk 测试
 */
function runSnykTest(packageJsonPath) {
  const dir = path.dirname(packageJsonPath);
  
  try {
    // 检查 snyk 是否安装
    execSync('snyk --version', { stdio: 'pipe' });
  } catch {
    return { error: 'Snyk CLI not installed. Install with: npm install -g snyk' };
  }

  try {
    const output = execSync('snyk test --json', {
      cwd: dir,
      encoding: 'utf-8',
      timeout: 120000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    return JSON.parse(output);
  } catch (error) {
    try {
      const output = error.stdout || '{}';
      return JSON.parse(output);
    } catch {
      return { error: error.message };
    }
  }
}

/**
 * 尝试自动修复
 */
function tryAutoFix(packageJsonPath) {
  const dir = path.dirname(packageJsonPath);
  
  try {
    const output = execSync('npm audit fix --json', {
      cwd: dir,
      encoding: 'utf-8',
      timeout: 120000
    });
    
    return JSON.parse(output);
  } catch (error) {
    try {
      return JSON.parse(error.stdout || '{}');
    } catch {
      return { error: error.message };
    }
  }
}

/**
 * 生成 JSON 报告
 */
function generateJSONReport(results) {
  const report = {};
  
  for (const result of results) {
    const relativePath = path.relative(process.cwd(), result.path);
    report[relativePath] = {
      vulnerabilities: result.total,
      severity: result.severity,
      details: result.details,
      breakdown: result.vulnerabilities
    };
  }

  return report;
}

/**
 * 生成 Markdown 安全报告
 */
function generateMarkdownReport(results) {
  const timestamp = new Date().toISOString();
  let md = `# 安全扫描报告\n\n`;
  md += `> 生成时间: ${timestamp}\n\n`;
  
  // 摘要
  let totalVulns = 0;
  let safeProjects = 0;
  let vulnerableProjects = 0;
  
  for (const result of results) {
    totalVulns += result.total;
    if (result.total === 0) safeProjects++;
    else vulnerableProjects++;
  }
  
  md += `## 摘要\n\n`;
  md += `- **扫描项目数**: ${results.length}\n`;
  md += `- **安全项目**: ${safeProjects} ${MARKERS.safe}\n`;
  md += `- **存在漏洞**: ${vulnerableProjects}\n`;
  md += `- **总漏洞数**: ${totalVulns}\n\n`;
  
  // 严重程度分布
  md += `## 漏洞分布\n\n`;
  md += `| 严重程度 | 标记 |\n`;
  md += `|---------|------|\n`;
  md += `| 严重 | ${MARKERS.critical} Critical |\n`;
  md += `| 高危 | ${MARKERS.high} High |\n`;
  md += `| 中危 | ${MARKERS.moderate} Moderate |\n`;
  md += `| 低危 | ${MARKERS.low} Low |\n`;
  md += `| 安全 | ${MARKERS.safe} Safe |\n\n`;
  
  // 详细报告
  md += `## 详细报告\n\n`;
  
  for (const result of results) {
    const relativePath = path.relative(process.cwd(), result.path);
    const marker = MARKERS[result.severity] || MARKERS.safe;
    
    md += `### ${marker} \`${relativePath}\`\n\n`;
    
    if (result.error) {
      md += `> ⚠️ ${result.error}\n\n`;
      continue;
    }
    
    if (result.total === 0) {
      md += `✅ 未发现安全漏洞\n\n`;
      continue;
    }
    
    md += `**漏洞统计**:\n`;
    md += `- 总计: ${result.total}\n`;
    
    for (const [sev, count] of Object.entries(result.vulnerabilities)) {
      if (count > 0) {
        md += `- ${sev}: ${count}\n`;
      }
    }
    
    md += `\n**漏洞详情**:\n\n`;
    md += `| 包名 | 严重程度 | 受影响版本 | 修复可用 | 描述 |\n`;
    md += `|------|---------|-----------|---------|------|\n`;
    
    for (const detail of result.details.slice(0, 10)) {
      const fixIcon = detail.fixAvailable ? '✅' : '❌';
      const desc = detail.via.join(', ').substring(0, 40);
      md += `| ${detail.package} | ${detail.severity} | ${detail.range} | ${fixIcon} | ${desc} |\n`;
    }
    
    if (result.details.length > 10) {
      md += `\n... 还有 ${result.details.length - 10} 个漏洞\n`;
    }
    
    md += `\n`;
  }
  
  // 修复建议
  md += `## 修复建议\n\n`;
  md += `1. **立即修复**: 对于高危和严重漏洞，建议立即更新依赖\n`;
  md += `2. **运行修复命令**: \`npm audit fix\` 或 \`npm audit fix --force\`\n`;
  md += `3. **查看详情**: \`npm audit\` 获取完整的漏洞信息\n`;
  md += `4. **定期检查**: 建议每周运行一次安全扫描\n\n`;
  
  // 自动化
  md += `## 自动化\n\n`;
  md += `- GitHub Action 每天自动扫描\n`;
  md += `- PR 时自动检查新引入的漏洞\n`;
  md += `- 严重漏洞会自动创建 Issue\n\n`;
  
  md += `---\n\n`;
  md += `*此报告由 security-check.js 自动生成*\n`;
  
  return md;
}

/**
 * 在终端打印彩色报告
 */
function printColoredReport(results) {
  console.log('\n' + '='.repeat(70));
  console.log('🔒 安全漏洞扫描报告');
  console.log('='.repeat(70) + '\n');

  for (const result of results) {
    const relativePath = path.relative(process.cwd(), result.path);
    const marker = MARKERS[result.severity] || MARKERS.safe;
    
    let color = COLORS.green;
    if (result.severity === 'critical') color = COLORS.red;
    else if (result.severity === 'high') color = COLORS.red;
    else if (result.severity === 'moderate') color = COLORS.orange;
    else if (result.severity === 'low') color = COLORS.yellow;
    
    console.log(`${color}${marker} ${relativePath}${COLORS.reset}`);
    
    if (result.error) {
      console.log(`  ${COLORS.gray}⚠️ ${result.error}${COLORS.reset}\n`);
      continue;
    }
    
    if (result.total === 0) {
      console.log(`  ${COLORS.green}✅ 未发现安全漏洞${COLORS.reset}\n`);
      continue;
    }
    
    console.log(`  漏洞总数: ${result.total}`);
    
    for (const [sev, count] of Object.entries(result.vulnerabilities)) {
      if (count > 0) {
        const sevColor = sev === 'critical' || sev === 'high' ? COLORS.red : 
                         sev === 'moderate' ? COLORS.orange : COLORS.yellow;
        console.log(`  ${sevColor}  - ${sev}: ${count}${COLORS.reset}`);
      }
    }
    
    // 显示前5个漏洞
    if (result.details.length > 0) {
      console.log(`  漏洞详情 (前5个):`);
      for (const detail of result.details.slice(0, 5)) {
        const fixIcon = detail.fixAvailable ? '✅' : '❌';
        console.log(`    - ${detail.package} (${detail.severity}): ${detail.range} ${fixIcon}`);
      }
    }
    
    console.log();
  }

  // 摘要
  const totalVulns = results.reduce((sum, r) => sum + r.total, 0);
  const safeCount = results.filter(r => r.total === 0).length;
  
  console.log('-'.repeat(70));
  console.log(`📊 摘要: ${results.length} 个项目, ${safeCount} 个安全, ${totalVulns} 个漏洞`);
  console.log('='.repeat(70) + '\n');
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const useOSV = args.includes('--osv');
  const outputJSON = args.includes('--json');
  const autoFix = args.includes('--fix');
  const quiet = args.includes('--quiet');

  if (!quiet && !outputJSON) {
    console.log('🔒 开始安全漏洞扫描...\n');
  }

  // 查找所有 package.json
  let packageFiles = [];
  for (const dir of CONFIG.scanDirs) {
    packageFiles = packageFiles.concat(findPackageJsonFiles(dir));
  }

  if (!quiet && !outputJSON) {
    console.log(`📦 发现 ${packageFiles.length} 个 package.json 文件\n`);
  }

  if (packageFiles.length === 0) {
    console.error('❌ 未找到任何 package.json 文件');
    process.exit(1);
  }

  // 扫描每个项目
  const results = [];

  for (const pkgPath of packageFiles) {
    if (!quiet && !outputJSON) {
      console.log(`🔍 扫描: ${path.relative(process.cwd(), pkgPath)}`);
    }

    // npm audit
    const auditResult = runNpmAudit(pkgPath);
    
    // 可选：OSV 扫描
    if (useOSV) {
      auditResult.osvResults = await scanWithOSV(pkgPath);
    }
    
    // 可选：自动修复
    if (autoFix && auditResult.total > 0) {
      if (!quiet && !outputJSON) console.log('  🔧 尝试自动修复...');
      auditResult.fixResult = tryAutoFix(pkgPath);
    }

    results.push(auditResult);
  }

  // 输出报告
  if (outputJSON) {
    const report = generateJSONReport(results);
    console.log(JSON.stringify(report, null, 2));
  } else if (!quiet) {
    printColoredReport(results);
  }
  
  // 静默模式下只输出错误信息
  if (quiet && results.some(r => r.error)) {
    for (const result of results) {
      if (result.error) {
        console.error(`⚠️ ${path.relative(process.cwd(), result.path)}: ${result.error}`);
      }
    }
  }

  // 保存 JSON 报告
  const jsonReport = generateJSONReport(results);
  fs.writeFileSync(CONFIG.outputPath, JSON.stringify(jsonReport, null, 2));
  
  if (!quiet && !outputJSON) {
    console.log(`📄 JSON 报告已保存: ${CONFIG.outputPath}`);
  }

  // 保存 Markdown 报告
  const mdReport = generateMarkdownReport(results);
  fs.writeFileSync(CONFIG.markdownPath, mdReport);
  
  if (!quiet && !outputJSON) {
    console.log(`📄 Markdown 报告已保存: ${CONFIG.markdownPath}\n`);
  }

  // 如果有高危或严重漏洞，退出码非零
  const hasCritical = results.some(r => 
    r.vulnerabilities.critical > 0 || r.vulnerabilities.high > 0
  );

  if (hasCritical) {
    if (!quiet && !outputJSON) {
      console.error(`${COLORS.red}❌ 发现高危/严重漏洞，请立即修复！${COLORS.reset}\n`);
    }
    process.exit(1);
  }

  if (!quiet && !outputJSON) {
    console.log(`${COLORS.green}✅ 安全扫描完成，未发现高危漏洞${COLORS.reset}\n`);
  }
}

// 运行
main().catch(error => {
  console.error('❌ 扫描失败:', error.message);
  process.exit(1);
});
