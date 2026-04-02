/**
 * @file 验证框架
 * @category Formal Verification → Framework
 * @difficulty hard
 * @tags invariant, model-checking, safety, liveness, contract, curry-howard
 * @description
 * 提供不变量检查器、模型检测器、类型级证明辅助与合约编程运行时验证。
 * 用于教学演示形式化验证的核心概念在 TypeScript 中的简化实现。
 *
 * @theoretical_basis
 * - **不变量 (Invariant)**: 源自 Floyd-Hoare 验证理论，程序执行过程中始终保持的断言。
 * - **模型检测 (Model Checking)**: Clarke, Emerson 与 Queille, Sifakis 提出的自动验证技术，
 *   通过遍历状态空间验证安全性 (Safety) 与活性 (Liveness) 性质。
 * - **合约编程 (Design by Contract)**: Meyer 提出的 Eiffel 语言概念，通过前置条件 (Precondition)、
 *   后置条件 (Postcondition) 与不变量约束组件行为。
 * - **类型即证明 (Curry-Howard 同构)**: 利用 TypeScript 的类型系统模拟轻量级证明，
 *   `Proved<T>` 类型标记表示该值已通过运行时验证。
 * - **CTL (Computation Tree Logic)**: 分支时序逻辑，Safety 对应 `AG ¬danger`
 *   （在所有路径的全局状态下，危险状态永不发生）；Liveness 对应 `AF success`
 *   （在所有路径上，成功状态最终必然发生）。
 *
 * @complexity_analysis
 * - `InvariantChecker.check`: O(n) 其中 n 为不变量数量，每个不变量对状态求值一次。
 * - `ModelChecker.checkReachability`: O(b^d) 最坏情况，b 为分支因子（动作数量），d 为最大深度。
 * - `ModelChecker.checkSafety`: O(b^d) 广度优先遍历状态空间。
 * - `ModelChecker.checkLiveness`: O(b^d * d) 需维护每条路径的访问集合以检测循环。
 * - `ContractEnforcer.enforce`: O(p + q) 其中 p 为前置条件数量，q 为后置条件数量。
 */

/**
 * 不变量检查器
 *
 * 在形式化方法中，不变量 I 是一个谓词 I(s)，对于所有可达状态 s 都必须为真。
 * 数学表达：∀s ∈ ReachableStates. I(s) = true
 */
export class InvariantChecker<T> {
  private invariants: Array<{ name: string; check: (state: T) => boolean }> = [];
  private violations: string[] = [];

  /**
   * 注册一个不变量
   * @param name - 不变量名称（用于报告）
   * @param check - 状态谓词
   */
  addInvariant(name: string, check: (state: T) => boolean): void {
    this.invariants.push({ name, check });
  }

  /**
   * 对给定状态检查所有已注册的不变量
   * @param state - 待验证状态
   * @returns 全部满足时返回 true
   */
  check(state: T): boolean {
    this.violations = [];

    for (const invariant of this.invariants) {
      if (!invariant.check(state)) {
        this.violations.push(invariant.name);
        console.error(`[Invariant] Violation: ${invariant.name}`);
      }
    }

    return this.violations.length === 0;
  }

  getViolations(): string[] {
    return [...this.violations];
  }
}

// 状态机模型检测
export interface StateMachine<S, A> {
  initial: S;
  states: S[];
  actions: A[];
  transition: (state: S, action: A) => S | null;
}

/**
 * 模型检测器
 *
 * 基于 Clarke-Emerson-Queille-Sifakis 的模型检测理论，对有限状态机进行
 * 自动验证。核心思想是将待验证性质转换为一组状态空间搜索问题。
 */
export class ModelChecker<S, A> {
  private visited = new Set<string>();
  private counterexamples: Array<{ path: A[]; property: string }> = [];

  constructor(private machine: StateMachine<S, A>) {}

  /**
   * 检查可达性：目标状态是否从初始状态可达
   *
   * 数学定义：∃路径 π = s₀ →a₁ s₁ →a₂ ... →ak sk，使得 sk = target
   */
  checkReachability(target: S, maxDepth: number = 10): { reachable: boolean; path?: A[] } {
    const queue: Array<{ state: S; path: A[] }> = [{ state: this.machine.initial, path: [] }];

    while (queue.length > 0) {
      const { state, path } = queue.shift()!;

      if (this.stateEquals(state, target)) {
        return { reachable: true, path };
      }

      if (path.length >= maxDepth) continue;

      for (const action of this.machine.actions) {
        const next = this.machine.transition(state, action);
        if (next && !this.isVisited(next, path)) {
          queue.push({ state: next, path: [...path, action] });
        }
      }
    }

    return { reachable: false };
  }

  /**
   * 检查安全性 (Safety)
   *
   * Safety 的含义是"不该发生的事情永远不会发生"。
   * 在 CTL 中对应公式：`AG ¬danger`，即在所有路径的全局状态下，
   * 危险状态（¬property）永远不会出现。
   *
   * 数学定义：∀路径 π. ∀i ≥ 0. property(π[i]) = true
   */
  checkSafety(property: (state: S) => boolean, maxDepth: number = 10): { holds: boolean; counterexample?: A[] } {
    const queue: Array<{ state: S; path: A[] }> = [{ state: this.machine.initial, path: [] }];

    while (queue.length > 0) {
      const { state, path } = queue.shift()!;

      if (!property(state)) {
        return { holds: false, counterexample: path };
      }

      if (path.length >= maxDepth) continue;

      for (const action of this.machine.actions) {
        const next = this.machine.transition(state, action);
        if (next) {
          queue.push({ state: next, path: [...path, action] });
        }
      }
    }

    return { holds: true };
  }

  /**
   * 检查活性 (Liveness)
   *
   * Liveness 的含义是"该发生的事情最终会发生"。
   * 在 CTL 中对应公式：`AF success`，即从任意状态出发，
   * 在所有路径上目标性质最终必然成立。
   *
   * 数学定义：∀路径 π. ∃i ≥ 0. targetProperty(π[i]) = true
   */
  checkLiveness(
    targetProperty: (state: S) => boolean,
    maxDepth: number = 10
  ): { holds: boolean; counterexample?: A[] } {
    // 简化实现：检查是否所有路径最终都能到达目标
    const queue: Array<{ state: S; path: A[]; visited: Set<string> }> = [{
      state: this.machine.initial,
      path: [],
      visited: new Set()
    }];

    while (queue.length > 0) {
      const { state, path, visited } = queue.shift()!;

      if (targetProperty(state)) {
        continue; // 这条路径满足
      }

      if (path.length >= maxDepth) {
        return { holds: false, counterexample: path };
      }

      const stateKey = JSON.stringify(state);
      if (visited.has(stateKey)) {
        // 循环但没有达到目标
        return { holds: false, counterexample: path };
      }

      const newVisited = new Set(visited);
      newVisited.add(stateKey);

      for (const action of this.machine.actions) {
        const next = this.machine.transition(state, action);
        if (next) {
          queue.push({ state: next, path: [...path, action], visited: newVisited });
        }
      }
    }

    return { holds: true };
  }

  private stateEquals(a: S, b: S): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  private isVisited(state: S, path: A[]): boolean {
    const key = JSON.stringify({ state, pathLength: path.length });
    if (this.visited.has(key)) return true;
    this.visited.add(key);
    return false;
  }
}

// 类型级别的证明辅助（模拟）
export type Proved<T> = T & { __proved: true };

export function assume<T>(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assumption failed: ${message}`);
  }
}

export function verify<T>(value: T, predicate: (v: T) => boolean): Proved<T> | null {
  if (predicate(value)) {
    return value as Proved<T>;
  }
  return null;
}

// 合约编程
export interface Contract<T> {
  preconditions: Array<(input: T) => boolean>;
  postconditions: Array<(input: T, output: unknown) => boolean>;
}

/**
 * 合约执行器（Design by Contract）
 *
 * 基于 Meyer 的契约式设计理论，在运行时强制前置条件与后置条件。
 * 前置条件保证调用者提供合法输入；后置条件保证被调用者产生正确输出。
 */
export class ContractEnforcer {
  private contracts = new Map<string, Contract<unknown>>();

  register<T>(fnName: string, contract: Contract<T>): void {
    this.contracts.set(fnName, contract as Contract<unknown>);
  }

  enforce<T, R>(fnName: string, fn: (input: T) => R, input: T): R {
    const contract = this.contracts.get(fnName);
    if (!contract) return fn(input);

    // 检查前置条件
    for (const pre of contract.preconditions) {
      if (!pre(input)) {
        throw new Error(`Precondition violation in ${fnName}`);
      }
    }

    const result = fn(input);

    // 检查后置条件
    for (const post of contract.postconditions) {
      if (!post(input, result)) {
        throw new Error(`Postcondition violation in ${fnName}`);
      }
    }

    return result;
  }
}

// 程序验证示例：银行账户
interface BankAccount {
  balance: number;
  frozen: boolean;
}

export function demo(): void {
  console.log('=== 形式化验证 ===\n');

  // 不变量检查示例
  console.log('--- 不变量检查 ---');
  const accountChecker = new InvariantChecker<BankAccount>();

  accountChecker.addInvariant('balance-non-negative', acc => acc.balance >= 0);
  accountChecker.addInvariant('frozen-accounts-cannot-have-negative-balance', acc =>
    !(acc.frozen && acc.balance < 0)
  );

  const validAccount: BankAccount = { balance: 100, frozen: false };
  const invalidAccount: BankAccount = { balance: -50, frozen: true };

  console.log('有效账户检查:', accountChecker.check(validAccount));
  console.log('无效账户检查:', accountChecker.check(invalidAccount));
  console.log('违规项:', accountChecker.getViolations());

  // 状态机模型检测
  console.log('\n--- 模型检测 ---');

  // 定义一个简单的交通灯状态机
  type TrafficLightState = 'red' | 'green' | 'yellow';
  type TrafficLightAction = 'timer';

  const trafficLight: StateMachine<TrafficLightState, TrafficLightAction> = {
    initial: 'red',
    states: ['red', 'green', 'yellow'],
    actions: ['timer'],
    transition: (state, action) => {
      if (action === 'timer') {
        switch (state) {
          case 'red': return 'green';
          case 'green': return 'yellow';
          case 'yellow': return 'red';
        }
      }
      return null;
    }
  };

  const checker = new ModelChecker(trafficLight);

  // 检查是否可以从red到达green
  const reachability = checker.checkReachability('green', 5);
  console.log('能否到达绿灯:', reachability.reachable, '路径:', reachability.path);

  // 安全性检查：永远不会同时是红灯和绿灯
  // 对应 CTL: AG ¬(red ∧ green)
  const safety = checker.checkSafety(
    state => !(state === 'red' && state === 'green'),
    10
  );
  console.log('安全性检查通过 (CTL: AG ¬(red ∧ green)):', safety.holds);

  // 活性检查：最终一定会变绿灯
  // 对应 CTL: AF green
  const liveness = checker.checkLiveness(state => state === 'green', 10);
  console.log('活性检查通过 (CTL: AF green):', liveness.holds);

  // 合约编程
  console.log('\n--- 合约编程 ---');
  const contractSystem = new ContractEnforcer();

  contractSystem.register<number>('sqrt', {
    preconditions: [
      x => x >= 0 // 平方根的前提：输入必须非负
    ],
    postconditions: [
      (x, result) => Math.abs((result as number) ** 2 - x) < 0.0001 // 结果的平方应该接近原数
    ]
  });

  try {
    const result = contractSystem.enforce('sqrt', Math.sqrt, 16);
    console.log('sqrt(16) =', result);

    // 这会触发前置条件违规
    // contractSystem.enforce('sqrt', Math.sqrt, -4);
  } catch (e) {
    console.error('合约违规:', (e as Error).message);
  }
}
