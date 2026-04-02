/**
 * @file SMT-LIB 风格问题生成器（Z3 桥接模拟）
 * @category Formal Verification → SMT Bridge
 * @difficulty hard
 * @description
 * 由于无法在 TypeScript 中完整实现 Z3，本模块实现一个 SMT-LIB v2 风格的问题生成器。
 * 支持线性整数算术（LIA）和等式逻辑的约束生成与格式化输出。演示「数组排序」
 * 与「调度问题」的约束编码过程，生成的 SMT-LIB 字符串可直接输入 Z3 求解。
 *
 * @theoretical_basis
 * - **SMT (Satisfiability Modulo Theories)**: 扩展 SAT 求解器以支持背景理论
 *   （如整数算术、数组、位向量、未解释函数）的判定过程。
 * - **SMT-LIB v2**: SMT 求解器的标准输入语言，采用 Lisp-like S-expression 语法。
 * - **LIA (Linear Integer Arithmetic)**: Presburger 算术的可判定片段，支持
 *   整数变量、加法、减法和常量乘法。
 * - **EUF (Equality with Uninterpreted Functions)**: 等式与未解释函数理论，
 *   常用于验证程序等价性。
 *
 * @complexity_analysis
 * - 约束生成: O(|vars| + |constraints|) 线性于变量与约束数量。
 * - SMT-LIB 格式化输出: O(|constraints| * maxArity) 其中 maxArity 为最大约束项数。
 * - 实际 SMT 求解为 NP-完全或更高复杂度（LIA 为 EXPSPACE-完全）。
 */

/** SMT 变量声明 */
export interface SMTVar {
  name: string;
  sort: 'Int' | 'Bool' | 'Real' | `Array_${string}`;
}

/** SMT 表达式基类 */
export interface SMTExpr {
  toSMTLIB(): string;
}

/** 常量 */
export class SMTConst implements SMTExpr {
  constructor(public readonly value: number | boolean) {}

  toSMTLIB(): string {
    if (typeof this.value === 'boolean') {
      return this.value ? 'true' : 'false';
    }
    return String(this.value);
  }
}

/** 变量引用 */
export class SMTVarRef implements SMTExpr {
  constructor(public readonly name: string) {}

  toSMTLIB(): string {
    return this.name;
  }
}

/** 函数应用（通用 n 元运算） */
export class SMTApply implements SMTExpr {
  constructor(
    public readonly op: string,
    public readonly args: SMTExpr[]
  ) {}

  toSMTLIB(): string {
    const argsStr = this.args.map(a => a.toSMTLIB()).join(' ');
    return `(${this.op} ${argsStr})`;
  }
}

/** 辅助构造器：算术与逻辑运算 */
export const SMT = {
  const(value: number | boolean): SMTConst {
    return new SMTConst(value);
  },
  var(name: string): SMTVarRef {
    return new SMTVarRef(name);
  },
  add(...args: SMTExpr[]): SMTApply {
    return new SMTApply('+', args);
  },
  sub(a: SMTExpr, b: SMTExpr): SMTApply {
    return new SMTApply('-', [a, b]);
  },
  mul(a: SMTExpr, b: SMTExpr): SMTApply {
    return new SMTApply('*', [a, b]);
  },
  eq(a: SMTExpr, b: SMTExpr): SMTApply {
    return new SMTApply('=', [a, b]);
  },
  lt(a: SMTExpr, b: SMTExpr): SMTApply {
    return new SMTApply('<', [a, b]);
  },
  le(a: SMTExpr, b: SMTExpr): SMTApply {
    return new SMTApply('<=', [a, b]);
  },
  gt(a: SMTExpr, b: SMTExpr): SMTApply {
    return new SMTApply('>', [a, b]);
  },
  ge(a: SMTExpr, b: SMTExpr): SMTApply {
    return new SMTApply('>=', [a, b]);
  },
  and(...args: SMTExpr[]): SMTApply {
    return new SMTApply('and', args);
  },
  or(...args: SMTExpr[]): SMTApply {
    return new SMTApply('or', args);
  },
  not(a: SMTExpr): SMTApply {
    return new SMTApply('not', [a]);
  },
  implies(a: SMTExpr, b: SMTExpr): SMTApply {
    return new SMTApply('=>', [a, b]);
  },
  distinct(...args: SMTExpr[]): SMTApply {
    return new SMTApply('distinct', args);
  }
};

/** SMT 问题容器 */
export class SMTProblem {
  private variables: SMTVar[] = [];
  private assertions: SMTExpr[] = [];

  declareInt(name: string): this {
    this.variables.push({ name, sort: 'Int' });
    return this;
  }

  declareBool(name: string): this {
    this.variables.push({ name, sort: 'Bool' });
    return this;
  }

  assert(expr: SMTExpr): this {
    this.assertions.push(expr);
    return this;
  }

  toSMTLIB(): string {
    const lines: string[] = [];
    lines.push('(set-logic QF_LIA)');
    for (const v of this.variables) {
      lines.push(`(declare-fun ${v.name} () ${v.sort})`);
    }
    for (const a of this.assertions) {
      lines.push(`(assert ${a.toSMTLIB()})`);
    }
    lines.push('(check-sat)');
    lines.push('(get-model)');
    return lines.join('\n');
  }

  getAssertions(): readonly SMTExpr[] {
    return this.assertions;
  }

  getVariables(): readonly SMTVar[] {
    return this.variables;
  }
}

/**
 * 生成数组排序验证的 SMT-LIB 问题。
 * 验证对于给定的 3 个整数，它们满足非递减排序。
 */
export function generateArraySortProblem(): SMTProblem {
  const problem = new SMTProblem();
  problem
    .declareInt('a0')
    .declareInt('a1')
    .declareInt('a2')
    .assert(SMT.le(SMT.var('a0'), SMT.var('a1')))
    .assert(SMT.le(SMT.var('a1'), SMT.var('a2')));
  return problem;
}

/**
 * 生成调度问题的 SMT-LIB 问题。
 * 两个任务 T1, T2 需要在机器 M1, M2 上执行，变量 start1, start2 为开始时间，
 * duration1=3, duration2=2。要求任务不能在同一台机器上重叠。
 */
export function generateSchedulingProblem(): SMTProblem {
  const problem = new SMTProblem();
  problem
    .declareInt('start1')
    .declareInt('start2')
    .declareBool('onM1_t1')
    .declareBool('onM1_t2')
    // 开始时间非负
    .assert(SMT.ge(SMT.var('start1'), SMT.const(0)))
    .assert(SMT.ge(SMT.var('start2'), SMT.const(0)))
    // 若两个任务都在 M1 上，则不能重叠
    .assert(
      SMT.or(
        SMT.not(SMT.and(SMT.var('onM1_t1'), SMT.var('onM1_t2'))),
        SMT.or(
          SMT.le(SMT.add(SMT.var('start1'), SMT.const(3)), SMT.var('start2')),
          SMT.le(SMT.add(SMT.var('start2'), SMT.const(2)), SMT.var('start1'))
        )
      )
    )
    // 若两个任务都在 M2 上（即都不在 M1 上），则不能重叠
    .assert(
      SMT.or(
        SMT.or(SMT.var('onM1_t1'), SMT.var('onM1_t2')),
        SMT.or(
          SMT.le(SMT.add(SMT.var('start1'), SMT.const(3)), SMT.var('start2')),
          SMT.le(SMT.add(SMT.var('start2'), SMT.const(2)), SMT.var('start1'))
        )
      )
    );
  return problem;
}

export function demo(): void {
  console.log('=== SMT-LIB 桥接演示 ===\n');

  // 演示 1：数组排序约束
  console.log('--- 数组排序约束 ---');
  const sortProblem = generateArraySortProblem();
  console.log(sortProblem.toSMTLIB());

  // 演示 2：调度问题
  console.log('\n--- 调度问题约束 ---');
  const scheduleProblem = generateSchedulingProblem();
  console.log(scheduleProblem.toSMTLIB());

  // 演示 3：自定义 LIA 问题
  console.log('\n--- 自定义 LIA 问题：2x + 3y = 10 ---');
  const custom = new SMTProblem();
  custom
    .declareInt('x')
    .declareInt('y')
    .assert(SMT.eq(SMT.add(SMT.mul(SMT.const(2), SMT.var('x')), SMT.mul(SMT.const(3), SMT.var('y'))), SMT.const(10)))
    .assert(SMT.ge(SMT.var('x'), SMT.const(0)))
    .assert(SMT.ge(SMT.var('y'), SMT.const(0)));
  console.log(custom.toSMTLIB());
}
