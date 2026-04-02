/**
 * @file Hoare 逻辑验证框架
 * @category Formal Verification → Hoare Logic
 * @difficulty hard
 * @description
 * 实现 Hoare 三元组 `{P} C {Q}` 的运行时验证框架。支持前置条件、后置条件的
 * 断言检查，并通过不变量模拟循环正确性证明。演示求和循环、交换变量等经典例子的
 * 部分正确性验证。
 *
 * @theoretical_basis
 * - **Hoare 三元组 (Hoare Triple)**: C. A. R. Hoare 于 1969 年提出，形如 `{P} C {Q}`，
 *   表示若前置条件 P 成立，执行命令 C 后后置条件 Q 成立。
 * - **循环不变量 (Loop Invariant)**: 循环体每次执行前后均保持的断言，
 *   结合变体函数 (variant) 可证明循环终止性与完全正确性。
 * - **赋值公理 (Assignment Axiom)**: `{Q[E/V]} V := E {Q}`，即后置条件 Q 中
 *   将 V 替换为 E 得到前置条件。
 * - **顺序组合规则**: 若 `{P} C1 {R}` 且 `{R} C2 {Q}`，则 `{P} C1; C2 {Q}`。
 *
 * @complexity_analysis
 * - 前置/后置条件检查: O(p + q) 其中 p、q 分别为条件数量。
 * - 循环验证: O(n * i) 其中 n 为迭代次数，i 为不变量数量。
 * - 整体框架为运行时模拟，非静态验证，复杂度随程序执行路径线性增长。
 */

/** 变量存储环境 */
export type Env = Record<string, number>;

/** 断言：关于环境的布尔谓词 */
export type Assertion = (env: Env) => boolean;

/** 命令：修改环境的操作 */
export type Command = (env: Env) => Env;

/** Hoare 三元组验证结果 */
export interface HoareResult {
  valid: boolean;
  violations: string[];
}

/** 不变量包装器：附带名称与检查函数 */
export interface Invariant {
  name: string;
  check: (env: Env) => boolean;
}

/**
 * Hoare 验证器：在运行时模拟 Hoare 逻辑验证。
 */
export class HoareVerifier {
  private violations: string[] = [];

  /**
   * 验证顺序命令：先检查前置条件，执行命令，再检查后置条件。
   */
  verifyCommand(
    env: Env,
    pre: Assertion[],
    cmd: Command,
    post: Assertion[]
  ): { env: Env; result: HoareResult } {
    this.violations = [];

    // 检查前置条件
    for (let i = 0; i < pre.length; i++) {
      if (!pre[i]!(env)) {
        this.violations.push(`Precondition #${i} failed before command`);
      }
    }

    const newEnv = cmd(env);

    // 检查后置条件
    for (let i = 0; i < post.length; i++) {
      if (!post[i]!(newEnv)) {
        this.violations.push(`Postcondition #${i} failed after command`);
      }
    }

    return {
      env: newEnv,
      result: {
        valid: this.violations.length === 0,
        violations: [...this.violations]
      }
    };
  }

  /**
   * 验证循环：使用不变量模拟部分正确性证明。
   * 在循环的每次迭代前后检查不变量，并在循环结束后检查后置条件。
   */
  verifyLoop(
    initEnv: Env,
    condition: (env: Env) => boolean,
    body: (env: Env) => Env,
    invariants: Invariant[],
    post: Assertion[]
  ): HoareResult {
    this.violations = [];
    let env = { ...initEnv };

    // 检查初始不变量
    for (const inv of invariants) {
      if (!inv.check(env)) {
        this.violations.push(`Invariant "${inv.name}" failed before loop`);
      }
    }

    let iterations = 0;
    const maxIterations = 1000; // 防止无限循环

    while (condition(env) && iterations < maxIterations) {
      env = body(env);
      iterations++;

      for (const inv of invariants) {
        if (!inv.check(env)) {
          this.violations.push(`Invariant "${inv.name}" failed at iteration ${iterations}`);
        }
      }
    }

    if (iterations >= maxIterations) {
      this.violations.push('Loop exceeded maximum iterations (possible non-termination)');
    }

    // 循环结束后检查后置条件
    for (let i = 0; i < post.length; i++) {
      if (!post[i]!(env)) {
        this.violations.push(`Postcondition #${i} failed after loop`);
      }
    }

    return {
      valid: this.violations.length === 0,
      violations: [...this.violations]
    };
  }

  /**
   * 验证赋值语句 `{P} x := e {Q}`，
   * 通过运行时检查模拟赋值公理。
   */
  verifyAssignment(
    env: Env,
    varName: string,
    expr: (env: Env) => number,
    post: Assertion[]
  ): { env: Env; result: HoareResult } {
    const newEnv = { ...env, [varName]: expr(env) };
    this.violations = [];

    for (let i = 0; i < post.length; i++) {
      if (!post[i]!(newEnv)) {
        this.violations.push(`Postcondition #${i} failed after assignment to ${varName}`);
      }
    }

    return {
      env: newEnv,
      result: {
        valid: this.violations.length === 0,
        violations: [...this.violations]
      }
    };
  }
}

export function demo(): void {
  console.log('=== Hoare 逻辑演示 ===\n');
  const verifier = new HoareVerifier();

  // 演示 1：交换两个变量
  console.log('--- 交换变量 x, y ---');
  const swapEnv: Env = { x: 5, y: 3 };
  const swapPre: Assertion[] = [
    e => e['x'] !== undefined && e['y'] !== undefined,
    e => typeof e['x'] === 'number' && typeof e['y'] === 'number'
  ];
  const swapCmd: Command = e => {
    const t = e['x']!;
    return { ...e, x: e['y']!, y: t };
  };
  const swapPost: Assertion[] = [
    e => e['x'] === 3 && e['y'] === 5
  ];
  const swapResult = verifier.verifyCommand(swapEnv, swapPre, swapCmd, swapPost);
  console.log('交换后环境:', swapResult.env);
  console.log('验证结果:', swapResult.result);

  // 演示 2：求和循环 {n >= 0} sum = 0; i = 0; while (i < n) { i++; sum += i; } {sum = n*(n+1)/2}
  console.log('\n--- 求和循环验证 ---');
  const loopInit: Env = { n: 10, i: 0, sum: 0 };
  const loopCondition = (e: Env) => e['i']! < e['n']!;
  const loopBody = (e: Env) => ({
    ...e,
    i: e['i']! + 1,
    sum: e['sum']! + e['i']! + 1
  });
  const loopInvariants: Invariant[] = [
    {
      name: 'i-in-range',
      check: e => e['i']! >= 0 && e['i']! <= e['n']!
    },
    {
      name: 'sum-invariant',
      check: e => e['sum']! === (e['i']! * (e['i']! + 1)) / 2
    }
  ];
  const loopPost: Assertion[] = [
    e => e['i'] === e['n'],
    e => e['sum'] === (e['n']! * (e['n']! + 1)) / 2
  ];
  const loopResult = verifier.verifyLoop(loopInit, loopCondition, loopBody, loopInvariants, loopPost);
  console.log('循环验证结果:', loopResult);

  // 演示 3：失败的不变量（教学用）
  console.log('\n--- 故意失败的不变量演示 ---');
  const badInit: Env = { n: 3, i: 0, sum: 0 };
  const badInvariants: Invariant[] = [
    {
      name: 'wrong-sum',
      check: e => e['sum'] === e['i'] * e['i'] // 错误的不变量
    }
  ];
  const badResult = verifier.verifyLoop(badInit, loopCondition, loopBody, badInvariants, []);
  console.log('错误不变量检测结果:', badResult);
}
