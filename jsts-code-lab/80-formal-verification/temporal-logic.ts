/**
 * @file 线性时序逻辑（LTL）简化模型检测器
 * @category Formal Verification → Temporal Logic
 * @difficulty hard
 * @description
 * 实现线性时序逻辑（LTL）的简化模型检测器。支持 G (Globally)、F (Finally)、
 * U (Until)、X (Next) 算子。对一个有限状态机进行 LTL 公式验证，
 * 演示安全性与活性性质的自动检测。
 *
 * @theoretical_basis
 * - **LTL (Linear Temporal Logic)**: Pnueli 于 1977 年提出，用于规约并发系统
 *   的时序性质。公式在行为的单个执行路径上解释。
 * - **G φ (Globally)**: φ 在当前状态及之后的所有状态上成立。
 * - **F φ (Finally)**: φ 在当前状态之后的某个状态上成立。
 * - **φ U ψ (Until)**: ψ 最终成立，且在此之前 φ 一直成立。
 * - **X φ (Next)**: φ 在下一个状态上成立。
 * - **模型检测复杂度**: LTL 模型检测为 PSPACE-完全问题。本实现通过遍历
 *   状态机的所有有限路径前缀进行简化验证。
 *
 * @complexity_analysis
 * - 路径展开: O(b^d) 其中 b 为分支因子，d 为最大深度。
 * - LTL 公式求值: O(d * |φ|) 对单条路径，|φ| 为公式大小。
 * - 整体模型检测: O(b^d * d * |φ|) 对于教学用的简化实现。
 */

/** LTL 公式抽象语法树 */
export type LTLFormula =
  | { type: 'atom'; predicate: (state: string) => boolean }
  | { type: 'not'; sub: LTLFormula }
  | { type: 'and'; left: LTLFormula; right: LTLFormula }
  | { type: 'or'; left: LTLFormula; right: LTLFormula }
  | { type: 'G'; sub: LTLFormula }
  | { type: 'F'; sub: LTLFormula }
  | { type: 'X'; sub: LTLFormula }
  | { type: 'U'; left: LTLFormula; right: LTLFormula };

/** 转移关系：状态 -> (动作, 下一状态)[] */
export type Transitions = Record<string, Array<{ action: string; next: string }>>;

/** 有限状态机 */
export interface FiniteStateMachine {
  initial: string;
  transitions: Transitions;
}

/** 单条路径 */
export type Path = string[];

/** LTL 模型检测结果 */
export interface LTLResult {
  holds: boolean;
  counterexample?: Path;
  checkedPaths: number;
}

/**
 * LTL 模型检测器。
 */
export class LTLModelChecker {
  constructor(private fsm: FiniteStateMachine, private maxDepth: number = 10) {}

  /**
   * 检测 LTL 公式是否在所有路径上成立。
   */
  check(formula: LTLFormula): LTLResult {
    const paths = this.generateAllPaths();
    let checkedPaths = 0;

    for (const path of paths) {
      checkedPaths++;
      if (!this.evaluateOnPath(formula, path)) {
        return { holds: false, counterexample: path, checkedPaths };
      }
    }

    return { holds: true, checkedPaths };
  }

  /**
   * 生成所有有限路径前缀（深度不超过 maxDepth）。
   */
  private generateAllPaths(): Path[] {
    const paths: Path[] = [];
    const dfs = (state: string, path: string[]) => {
      const currentPath = [...path, state];
      if (currentPath.length >= this.maxDepth) {
        paths.push(currentPath);
        return;
      }
      const nexts = this.fsm.transitions[state] ?? [];
      if (nexts.length === 0) {
        paths.push(currentPath);
        return;
      }
      for (const t of nexts) {
        dfs(t.next, currentPath);
      }
    };
    dfs(this.fsm.initial, []);
    return paths;
  }

  /**
   * 在单条路径上求值 LTL 公式。
   */
  private evaluateOnPath(formula: LTLFormula, path: Path): boolean {
    return this.evalAtIndex(formula, path, 0);
  }

  private evalAtIndex(formula: LTLFormula, path: Path, index: number): boolean {
    switch (formula.type) {
      case 'atom':
        return index < path.length && formula.predicate(path[index]!);
      case 'not':
        return !this.evalAtIndex(formula.sub, path, index);
      case 'and':
        return this.evalAtIndex(formula.left, path, index) && this.evalAtIndex(formula.right, path, index);
      case 'or':
        return this.evalAtIndex(formula.left, path, index) || this.evalAtIndex(formula.right, path, index);
      case 'G': {
        for (let i = index; i < path.length; i++) {
          if (!this.evalAtIndex(formula.sub, path, i)) {
            return false;
          }
        }
        return true;
      }
      case 'F': {
        for (let i = index; i < path.length; i++) {
          if (this.evalAtIndex(formula.sub, path, i)) {
            return true;
          }
        }
        return false;
      }
      case 'X':
        return index + 1 < path.length && this.evalAtIndex(formula.sub, path, index + 1);
      case 'U': {
        for (let i = index; i < path.length; i++) {
          if (this.evalAtIndex(formula.right, path, i)) {
            return true;
          }
          if (!this.evalAtIndex(formula.left, path, i)) {
            return false;
          }
        }
        return false;
      }
      default:
        return false;
    }
  }
}

/**
 * 辅助函数：构造 LTL 公式
 */
export const LTL = {
  atom(predicate: (state: string) => boolean): LTLFormula {
    return { type: 'atom', predicate };
  },
  not(sub: LTLFormula): LTLFormula {
    return { type: 'not', sub };
  },
  and(left: LTLFormula, right: LTLFormula): LTLFormula {
    return { type: 'and', left, right };
  },
  or(left: LTLFormula, right: LTLFormula): LTLFormula {
    return { type: 'or', left, right };
  },
  G(sub: LTLFormula): LTLFormula {
    return { type: 'G', sub };
  },
  F(sub: LTLFormula): LTLFormula {
    return { type: 'F', sub };
  },
  X(sub: LTLFormula): LTLFormula {
    return { type: 'X', sub };
  },
  U(left: LTLFormula, right: LTLFormula): LTLFormula {
    return { type: 'U', left, right };
  }
};

/**
 * 构造一个教学用的请求-响应状态机。
 * 状态: idle -> request -> processing -> response -> idle
 */
export function requestResponseFSM(): FiniteStateMachine {
  return {
    initial: 'idle',
    transitions: {
      idle: [{ action: 'send', next: 'request' }],
      request: [{ action: 'process', next: 'processing' }],
      processing: [
        { action: 'ok', next: 'response' }
      ],
      response: [{ action: 'reset', next: 'idle' }]
    }
  };
}

export function demo(): void {
  console.log('=== LTL 模型检测演示 ===\n');
  const fsm = requestResponseFSM();
  const checker = new LTLModelChecker(fsm, 6);

  // 性质 1：安全性 □(非 error)
  const safety = LTL.G(LTL.atom(s => s !== 'error'));
  console.log('--- 安全性：G(¬error) ---');
  const safetyResult = checker.check(safety);
  console.log('成立?', safetyResult.holds, '检查路径数:', safetyResult.checkedPaths);
  if (!safetyResult.holds) {
    console.log('反例路径:', safetyResult.counterexample);
  }

  // 性质 2：活性 F(response)
  const liveness = LTL.F(LTL.atom(s => s === 'response'));
  console.log('\n--- 活性：F(response) ---');
  const livenessResult = checker.check(liveness);
  console.log('成立?', livenessResult.holds, '检查路径数:', livenessResult.checkedPaths);
  if (!livenessResult.holds) {
    console.log('反例路径:', livenessResult.counterexample);
  }

  // 性质 3：request U processing（从 idle 开始需考虑 X）
  // 从初始状态后的路径来看：在 request 之后，processing 最终成立且 request 保持到那之前
  // 这里我们检测 G(request -> (request U processing)) 的简化版
  const untilProp = LTL.G(
    LTL.or(
      LTL.atom(s => s !== 'request'),
      LTL.U(LTL.atom(s => s === 'request'), LTL.atom(s => s === 'processing'))
    )
  );
  console.log('\n--- G(request → (request U processing)) ---');
  const untilResult = checker.check(untilProp);
  console.log('成立?', untilResult.holds, '检查路径数:', untilResult.checkedPaths);

  // 性质 4：X(request) 从 idle 出发的下一步
  const nextProp = LTL.X(LTL.atom(s => s === 'request'));
  console.log('\n--- X(request) (从 idle) ---');
  const nextResult = checker.check(nextProp);
  console.log('成立?', nextResult.holds);
}
