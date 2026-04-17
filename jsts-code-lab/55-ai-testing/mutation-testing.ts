/**
 * @file 突变测试（Mutation Testing）原理实现
 * @category AI Testing → Mutation Testing
 * @difficulty hard
 * @tags ai-testing, mutation-testing, test-quality, code-coverage
 *
 * @description
 * 突变测试通过自动修改源代码（引入"突变体"），验证测试套件能否检测到这些错误。
 * 如果测试无法捕获突变体，说明测试覆盖存在漏洞。
 *
 * 突变算子：
 * - 算术运算符替换：+ → -, * → /
 * - 关系运算符替换：> → >=, === → !==
 * - 逻辑运算符替换：&& → ||
 * - 常量替换：true → false, 0 → 1
 * - 语句删除：移除条件分支中的语句
 * - 边界值偏移：数组索引 +1 / -1
 *
 * 突变体状态：
 * - KILLED: 测试检测到突变，预期失败
 * - SURVIVED: 测试未检测到突变，全部通过（危险！）
 * - TIMEOUT: 突变导致无限循环
 * - ERROR: 突变导致语法/运行时错误
 */

export enum MutantStatus {
  KILLED = 'killed',
  SURVIVED = 'survived',
  TIMEOUT = 'timeout',
  ERROR = 'error'
}

export interface Mutant {
  id: string;
  type: string;
  original: string;
  replacement: string;
  location: { line: number; column: number };
  status: MutantStatus;
  killedBy?: string;
}

export interface MutationReport {
  totalMutants: number;
  killed: number;
  survived: number;
  timeout: number;
  error: number;
  mutationScore: number;
  mutants: Mutant[];
}

// ==================== 突变算子 ====================

export interface MutationOperator {
  name: string;
  apply(code: string): Mutant[];
}

/** 算术运算符突变 */
export class ArithmeticOperatorMutator implements MutationOperator {
  name = 'ArithmeticOperator';

  private readonly replacements: Record<string, string[]> = {
    '+': ['-', '*'],
    '-': ['+', '/'],
    '*': ['/', '+'],
    '/': ['*', '-']
  };

  apply(code: string): Mutant[] {
    const mutants: Mutant[] = [];
    const regex = /(?<![+-])\s*([+\-*/])\s*(?![+-])/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(code)) !== null) {
      const original = match[1];
      const alternatives = this.replacements[original];
      if (!alternatives) continue;

      for (const replacement of alternatives) {
        const mutated = code.slice(0, match.index) + replacement + code.slice(match.index + 1);
        mutants.push({
          id: `arith-${match.index}`,
          type: this.name,
          original,
          replacement,
          location: this.computeLocation(code, match.index),
          status: MutantStatus.SURVIVED
        });
      }
    }

    return mutants;
  }

  private computeLocation(code: string, index: number): { line: number; column: number } {
    const lines = code.slice(0, index).split('\n');
    return { line: lines.length, column: lines[lines.length - 1].length + 1 };
  }
}

/** 关系运算符突变 */
export class RelationalOperatorMutator implements MutationOperator {
  name = 'RelationalOperator';

  private readonly replacements: Record<string, string[]> = {
    '>': ['>=', '<', '==='],
    '<': ['<=', '>', '==='],
    '>=': ['>', '<=', '==='],
    '<=': ['<', '>=', '==='],
    '===': ['!=='],
    '!==': ['===']
  };

  apply(code: string): Mutant[] {
    const mutants: Mutant[] = [];
    // 按长度降序匹配，避免 === 被误匹配为 ==
    const operators = Object.keys(this.replacements).sort((a, b) => b.length - a.length);
    const regex = new RegExp(`(${operators.map(o => o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');

    let match: RegExpExecArray | null;
    while ((match = regex.exec(code)) !== null) {
      const original = match[1];
      const alternatives = this.replacements[original];
      if (!alternatives) continue;

      for (const replacement of alternatives) {
        mutants.push({
          id: `rel-${match.index}`,
          type: this.name,
          original,
          replacement,
          location: this.computeLocation(code, match.index),
          status: MutantStatus.SURVIVED
        });
      }
    }

    return mutants;
  }

  private computeLocation(code: string, index: number): { line: number; column: number } {
    const lines = code.slice(0, index).split('\n');
    return { line: lines.length, column: lines[lines.length - 1].length + 1 };
  }
}

/** 逻辑运算符突变 */
export class LogicalOperatorMutator implements MutationOperator {
  name = 'LogicalOperator';

  private readonly replacements: Record<string, string[]> = {
    '&&': ['||'],
    '||': ['&&']
  };

  apply(code: string): Mutant[] {
    const mutants: Mutant[] = [];
    const regex = /(&&|\|\|)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(code)) !== null) {
      const original = match[1];
      const alternatives = this.replacements[original];
      if (!alternatives) continue;

      for (const replacement of alternatives) {
        mutants.push({
          id: `logic-${match.index}`,
          type: this.name,
          original,
          replacement,
          location: this.computeLocation(code, match.index),
          status: MutantStatus.SURVIVED
        });
      }
    }

    return mutants;
  }

  private computeLocation(code: string, index: number): { line: number; column: number } {
    const lines = code.slice(0, index).split('\n');
    return { line: lines.length, column: lines[lines.length - 1].length + 1 };
  }
}

/** 常量替换突变 */
export class ConstantMutator implements MutationOperator {
  name = 'Constant';

  apply(code: string): Mutant[] {
    const mutants: Mutant[] = [];

    // 布尔常量
    let match: RegExpExecArray | null;
    const boolRegex = /\b(true|false)\b/g;
    while ((match = boolRegex.exec(code)) !== null) {
      const original = match[1];
      const replacement = original === 'true' ? 'false' : 'true';
      mutants.push({
        id: `const-bool-${match.index}`,
        type: this.name,
        original,
        replacement,
        location: this.computeLocation(code, match.index),
        status: MutantStatus.SURVIVED
      });
    }

    // 数字常量（简单的整数字面量）
    const numRegex = /\b(\d+)\b/g;
    while ((match = numRegex.exec(code)) !== null) {
      const original = match[1];
      const num = parseInt(original, 10);
      const replacements = [String(num + 1), String(num - 1), '0', String(-num)];

      for (const replacement of replacements) {
        if (replacement === original) continue;
        mutants.push({
          id: `const-num-${match.index}`,
          type: this.name,
          original,
          replacement,
          location: this.computeLocation(code, match.index),
          status: MutantStatus.SURVIVED
        });
      }
    }

    return mutants;
  }

  private computeLocation(code: string, index: number): { line: number; column: number } {
    const lines = code.slice(0, index).split('\n');
    return { line: lines.length, column: lines[lines.length - 1].length + 1 };
  }
}

/** 条件边界突变 */
export class BoundaryMutator implements MutationOperator {
  name = 'Boundary';

  apply(code: string): Mutant[] {
    const mutants: Mutant[] = [];
    // 数组索引 [i] → [i+1] / [i-1]
    const regex = /\[([^\]]+)\]/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(code)) !== null) {
      const original = match[0];
      const inner = match[1].trim();

      // 避免替换函数调用或复杂表达式
      if (inner.includes('(') || inner.includes(',')) continue;

      for (const replacement of [`[${inner} + 1]`, `[${inner} - 1]`]) {
        if (replacement === original) continue;
        mutants.push({
          id: `boundary-${match.index}`,
          type: this.name,
          original,
          replacement,
          location: this.computeLocation(code, match.index),
          status: MutantStatus.SURVIVED
        });
      }
    }

    return mutants;
  }

  private computeLocation(code: string, index: number): { line: number; column: number } {
    const lines = code.slice(0, index).split('\n');
    return { line: lines.length, column: lines[lines.length - 1].length + 1 };
  }
}

// ==================== 突变测试引擎 ====================

export class MutationEngine {
  private operators: MutationOperator[] = [
    new ArithmeticOperatorMutator(),
    new RelationalOperatorMutator(),
    new LogicalOperatorMutator(),
    new ConstantMutator(),
    new BoundaryMutator()
  ];

  addOperator(operator: MutationOperator): void {
    this.operators.push(operator);
  }

  /**
   * 生成所有突变体
   */
  generateMutants(code: string): Mutant[] {
    const allMutants: Mutant[] = [];

    for (const operator of this.operators) {
      const mutants = operator.apply(code);
      allMutants.push(...mutants);
    }

    // 去重：相同位置和替换的突变体
    const seen = new Set<string>();
    return allMutants.filter(m => {
      const key = `${m.location.line}:${m.location.column}:${m.replacement}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * 应用突变到代码
   */
  applyMutant(code: string, mutant: Mutant): string {
    const index = this.findIndexAtLocation(code, mutant.location);
    if (index === -1) return code;

    // 简单替换：在找到的位置替换 original 为 replacement
    // 实际实现应更精确，这里做简化处理
    const lines = code.split('\n');
    const line = lines[mutant.location.line - 1];
    const newLine = line.replace(mutant.original, mutant.replacement);
    lines[mutant.location.line - 1] = newLine;
    return lines.join('\n');
  }

  /**
   * 运行突变测试
   * @param code 原始代码
   * @param testRunner 运行测试的回调，返回是否全部通过
   */
  run(
    code: string,
    testRunner: (mutatedCode: string) => { passed: boolean; error?: string; timeout?: boolean }
  ): MutationReport {
    const mutants = this.generateMutants(code);
    const report: MutationReport = {
      totalMutants: mutants.length,
      killed: 0,
      survived: 0,
      timeout: 0,
      error: 0,
      mutationScore: 0,
      mutants
    };

    for (const mutant of mutants) {
      const mutatedCode = this.applyMutant(code, mutant);
      const result = testRunner(mutatedCode);

      if (result.timeout) {
        mutant.status = MutantStatus.TIMEOUT;
        report.timeout++;
      } else if (result.error) {
        mutant.status = MutantStatus.ERROR;
        report.error++;
      } else if (!result.passed) {
        mutant.status = MutantStatus.KILLED;
        mutant.killedBy = result.error || 'test-failure';
        report.killed++;
      } else {
        mutant.status = MutantStatus.SURVIVED;
        report.survived++;
      }
    }

    report.mutationScore = report.totalMutants > 0
      ? (report.killed / report.totalMutants) * 100
      : 0;

    return report;
  }

  private findIndexAtLocation(code: string, location: { line: number; column: number }): number {
    const lines = code.split('\n');
    let index = 0;
    for (let i = 0; i < location.line - 1 && i < lines.length; i++) {
      index += lines[i].length + 1; // +1 for newline
    }
    return index + location.column - 1;
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 突变测试 ===\n');

  const sampleCode = `
function max(a, b) {
  if (a > b) {
    return a;
  }
  return b;
}
`;

  const engine = new MutationEngine();
  const mutants = engine.generateMutants(sampleCode);

  console.log(`--- 生成突变体 (${mutants.length} 个) ---`);
  for (const mutant of mutants.slice(0, 5)) {
    console.log(`  [${mutant.type}] ${mutant.original} → ${mutant.replacement} (line ${mutant.location.line})`);
  }

  // 模拟测试运行
  const report = engine.run(sampleCode, (mutatedCode) => {
    // 简单模拟：如果突变将 > 改为 <，测试应该失败
    if (mutatedCode.includes('a < b')) {
      return { passed: false, error: 'expected max(5,3)=5 but got 3' };
    }
    return { passed: true };
  });

  console.log('\n--- 突变测试报告 ---');
  console.log(`  总突变体: ${report.totalMutants}`);
  console.log(`  被杀死 (KILLED): ${report.killed}`);
  console.log(`  存活 (SURVIVED): ${report.survived}`);
  console.log(`  突变分数: ${report.mutationScore.toFixed(1)}%`);
}
