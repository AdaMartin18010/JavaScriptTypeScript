/**
 * @file 测试覆盖率计算器
 * @category AI Testing → Coverage Analysis
 * @difficulty medium
 * @tags ai-testing, code-coverage, line-coverage, branch-coverage, function-coverage
 *
 * @description
 * 测试覆盖率计算系统，支持行覆盖、分支覆盖、函数覆盖和语句覆盖。
 * 通过解析源代码并追踪执行轨迹，计算覆盖率指标。
 *
 * 覆盖率类型：
 * - 语句覆盖 (Statement Coverage): 被执行的语句 / 总语句
 * - 分支覆盖 (Branch Coverage): 被执行的分支 / 总分支
 * - 函数覆盖 (Function Coverage): 被执行的函数 / 总函数
 * - 行覆盖 (Line Coverage): 被覆盖的行 / 总行数
 */

export interface CoverageLine {
  line: number;
  hits: number;
}

export interface CoverageBranch {
  line: number;
  branch: number;
  taken: boolean;
}

export interface CoverageFunction {
  name: string;
  line: number;
  hits: number;
}

export interface FileCoverage {
  path: string;
  lines: CoverageLine[];
  branches: CoverageBranch[];
  functions: CoverageFunction[];
  lineRate: number;
  branchRate: number;
  functionRate: number;
  statementRate: number;
}

export interface CoverageReport {
  totalLineRate: number;
  totalBranchRate: number;
  totalFunctionRate: number;
  totalStatementRate: number;
  files: FileCoverage[];
}

// ==================== 覆盖率收集器 ====================

export class CoverageCollector {
  private lineHits = new Map<string, Map<number, number>>();
  private branchHits = new Map<string, Map<string, boolean>>();
  private functionHits = new Map<string, Map<string, number>>();

  /** 记录一行被执行 */
  hitLine(filePath: string, line: number): void {
    if (!this.lineHits.has(filePath)) {
      this.lineHits.set(filePath, new Map());
    }
    const fileLines = this.lineHits.get(filePath)!;
    fileLines.set(line, (fileLines.get(line) || 0) + 1);
  }

  /** 记录一个分支被执行 */
  hitBranch(filePath: string, line: number, branchId: number, taken: boolean): void {
    const key = `${filePath}:${line}:${branchId}`;
    if (!this.branchHits.has(key)) {
      this.branchHits.set(key, new Map());
    }
    this.branchHits.get(key)!.set(String(taken), true);
  }

  /** 记录函数被执行 */
  hitFunction(filePath: string, functionName: string, line: number): void {
    if (!this.functionHits.has(filePath)) {
      this.functionHits.set(filePath, new Map());
    }
    const fileFunctions = this.functionHits.get(filePath)!;
    const key = `${functionName}:${line}`;
    fileFunctions.set(key, (fileFunctions.get(key) || 0) + 1);
  }

  /** 获取文件的行命中统计 */
  getLineHits(filePath: string): Map<number, number> {
    return new Map(this.lineHits.get(filePath) || []);
  }

  /** 获取文件的分支命中统计 */
  getBranchHits(filePath: string): Map<string, boolean> {
    const result = new Map<string, boolean>();
    for (const [key, values] of this.branchHits) {
      if (key.startsWith(`${filePath}:`)) {
        for (const [branch, hit] of values) {
          result.set(`${key}:${branch}`, hit);
        }
      }
    }
    return result;
  }

  clear(): void {
    this.lineHits.clear();
    this.branchHits.clear();
    this.functionHits.clear();
  }
}

// ==================== 代码分析器 ====================

export interface AnalyzedCode {
  totalLines: number;
  executableLines: number[];
  branches: { line: number; id: number }[];
  functions: { name: string; line: number }[];
}

export class CodeAnalyzer {
  /**
   * 简单分析源代码结构
   * 识别可执行行、分支点和函数定义
   */
  analyze(code: string): AnalyzedCode {
    const lines = code.split('\n');
    const executableLines: number[] = [];
    const branches: { line: number; id: number }[] = [];
    const functions: { name: string; line: number }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNum = i + 1;

      // 跳过空行和纯注释
      if (line === '' || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
        continue;
      }

      // 识别函数定义（简化正则）
      const functionMatch = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:function|\([^)]*\)\s*=>))/.exec(line);
      if (functionMatch) {
        const name = functionMatch[1] || functionMatch[2];
        if (name) {
          functions.push({ name, line: lineNum });
        }
      }

      // 识别分支语句
      if (/\b(if|else if|while|for|switch|case|&&|\|\|)\b/.test(line) || /\?.*:/.test(line)) {
        branches.push({ line: lineNum, id: branches.length });
      }

      // 可执行行（简化处理）
      if (!line.startsWith('}') && !line.startsWith(')')) {
        executableLines.push(lineNum);
      }
    }

    return {
      totalLines: lines.length,
      executableLines,
      branches,
      functions
    };
  }
}

// ==================== 覆盖率计算器 ====================

export class CoverageCalculator {
  private analyzer = new CodeAnalyzer();

  /**
   * 计算单个文件的覆盖率
   */
  calculateFileCoverage(
    filePath: string,
    code: string,
    collector: CoverageCollector
  ): FileCoverage {
    const analysis = this.analyzer.analyze(code);
    const lineHits = collector.getLineHits(filePath);
    const branchHits = collector.getBranchHits(filePath);

    // 行覆盖
    const lines: CoverageLine[] = analysis.executableLines.map(line => ({
      line,
      hits: lineHits.get(line) || 0
    }));

    const coveredLines = lines.filter(l => l.hits > 0).length;
    const lineRate = analysis.executableLines.length > 0
      ? coveredLines / analysis.executableLines.length
      : 0;

    // 分支覆盖
    const branches: CoverageBranch[] = analysis.branches.map(b => {
      const trueHit = branchHits.get(`${filePath}:${b.line}:${b.id}:true`) || false;
      const falseHit = branchHits.get(`${filePath}:${b.line}:${b.id}:false`) || false;
      return {
        line: b.line,
        branch: b.id,
        taken: trueHit || falseHit
      };
    });

    const coveredBranches = branches.filter(b => b.taken).length;
    const branchRate = analysis.branches.length > 0
      ? coveredBranches / analysis.branches.length
      : 0;

    // 函数覆盖
    const functions: CoverageFunction[] = analysis.functions.map(f => ({
      name: f.name,
      line: f.line,
      hits: lineHits.get(f.line) || 0
    }));

    const coveredFunctions = functions.filter(f => f.hits > 0).length;
    const functionRate = analysis.functions.length > 0
      ? coveredFunctions / analysis.functions.length
      : 0;

    // 语句覆盖（这里简化为可执行行覆盖）
    const statementRate = lineRate;

    return {
      path: filePath,
      lines,
      branches,
      functions,
      lineRate,
      branchRate,
      functionRate,
      statementRate
    };
  }

  /**
   * 计算项目整体覆盖率
   */
  calculateReport(coverages: FileCoverage[]): CoverageReport {
    const totalExecutableLines = coverages.reduce((sum, c) =>
      sum + c.lines.length, 0);
    const totalCoveredLines = coverages.reduce((sum, c) =>
      sum + c.lines.filter(l => l.hits > 0).length, 0);

    const totalBranches = coverages.reduce((sum, c) =>
      sum + c.branches.length, 0);
    const totalCoveredBranches = coverages.reduce((sum, c) =>
      sum + c.branches.filter(b => b.taken).length, 0);

    const totalFunctions = coverages.reduce((sum, c) =>
      sum + c.functions.length, 0);
    const totalCoveredFunctions = coverages.reduce((sum, c) =>
      sum + c.functions.filter(f => f.hits > 0).length, 0);

    return {
      totalLineRate: totalExecutableLines > 0 ? totalCoveredLines / totalExecutableLines : 0,
      totalBranchRate: totalBranches > 0 ? totalCoveredBranches / totalBranches : 0,
      totalFunctionRate: totalFunctions > 0 ? totalCoveredFunctions / totalFunctions : 0,
      totalStatementRate: totalExecutableLines > 0 ? totalCoveredLines / totalExecutableLines : 0,
      files: coverages
    };
  }

  /**
   * 格式化覆盖率为人类可读字符串
   */
  formatReport(report: CoverageReport): string {
    const lines = [
      'Coverage Report',
      '================',
      `Line Rate:      ${(report.totalLineRate * 100).toFixed(2)}%`,
      `Branch Rate:    ${(report.totalBranchRate * 100).toFixed(2)}%`,
      `Function Rate:  ${(report.totalFunctionRate * 100).toFixed(2)}%`,
      `Statement Rate: ${(report.totalStatementRate * 100).toFixed(2)}%`,
      '',
      'File Details:',
      ...report.files.map(f =>
        `  ${f.path}: lines=${(f.lineRate * 100).toFixed(0)}% branches=${(f.branchRate * 100).toFixed(0)}% funcs=${(f.functionRate * 100).toFixed(0)}%`
      )
    ];
    return lines.join('\n');
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 测试覆盖率计算 ===\n');

  const sampleCode = `
function add(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Invalid arguments');
  }
  return a + b;
}

function subtract(a, b) {
  return a - b;
}
`;

  const collector = new CoverageCollector();

  // 模拟执行轨迹：只执行了 add 函数，未触发错误分支
  collector.hitLine('math.ts', 2);
  collector.hitLine('math.ts', 3);
  collector.hitLine('math.ts', 6);
  collector.hitFunction('math.ts', 'add', 2);

  // 未执行 subtract

  const calculator = new CoverageCalculator();
  const fileCoverage = calculator.calculateFileCoverage('math.ts', sampleCode, collector);

  console.log('--- 文件覆盖率 ---');
  console.log(`  行覆盖: ${(fileCoverage.lineRate * 100).toFixed(1)}%`);
  console.log(`  分支覆盖: ${(fileCoverage.branchRate * 100).toFixed(1)}%`);
  console.log(`  函数覆盖: ${(fileCoverage.functionRate * 100).toFixed(1)}%`);

  console.log('\n--- 详细行覆盖 ---');
  for (const line of fileCoverage.lines) {
    const status = line.hits > 0 ? '✓' : '✗';
    console.log(`  ${status} Line ${line.line}: ${line.hits} hits`);
  }

  const report = calculator.calculateReport([fileCoverage]);
  console.log('\n' + calculator.formatReport(report));
}
