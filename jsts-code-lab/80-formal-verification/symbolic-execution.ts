/**
 * @file 符号执行引擎
 * @category Formal Verification → Symbolic Execution
 * @difficulty hard
 * @tags symbolic-execution, path-exploration, constraint-solving, klee, smt
 * @description
 * 实现符号执行引擎的简化版，对简单的算术程序进行路径探索。
 * 每个路径维护符号状态和路径约束（path constraints）。
 *
 * @theoretical_basis
 * - **Symbolic Execution**: King 于 1976 年提出，用符号值代替具体输入执行程序，
 *   收集每条路径的约束条件，再通过 SMT 求解器判定路径可行性。
 * - **Path Constraint (PC)**: 布尔公式，表示到达某条路径所需满足的输入条件。
 * - **Forking**: 遇到条件分支时，符号执行引擎将状态复制为两个分支，分别追加
 *   条件为真/为假的约束。
 */

export type SymbolicValue =
  | { type: 'const'; value: number }
  | { type: 'var'; name: string }
  | { type: 'add'; left: SymbolicValue; right: SymbolicValue }
  | { type: 'sub'; left: SymbolicValue; right: SymbolicValue }
  | { type: 'mul'; left: SymbolicValue; right: SymbolicValue };

export type Constraint =
  | { type: 'eq'; left: SymbolicValue; right: SymbolicValue }
  | { type: 'ne'; left: SymbolicValue; right: SymbolicValue }
  | { type: 'lt'; left: SymbolicValue; right: SymbolicValue }
  | { type: 'gt'; left: SymbolicValue; right: SymbolicValue }
  | { type: 'and'; left: Constraint; right: Constraint };

export interface SymbolicState {
  variables: Map<string, SymbolicValue>;
  pathConstraint: Constraint[];
}

// ---------------------------------------------------------------------------
// 辅助：构造符号表达式
// ---------------------------------------------------------------------------

export function symConst(value: number): SymbolicValue {
  return { type: 'const', value };
}

export function symVar(name: string): SymbolicValue {
  return { type: 'var', name };
}

export function symAdd(a: SymbolicValue, b: SymbolicValue): SymbolicValue {
  return { type: 'add', left: a, right: b };
}

export function symSub(a: SymbolicValue, b: SymbolicValue): SymbolicValue {
  return { type: 'sub', left: a, right: b };
}

export function symMul(a: SymbolicValue, b: SymbolicValue): SymbolicValue {
  return { type: 'mul', left: a, right: b };
}

// ---------------------------------------------------------------------------
// 约束求解器（教学级：有界穷举）
// ---------------------------------------------------------------------------

function evaluateSymbolic(val: SymbolicValue, assignment: Map<string, number>): number {
  switch (val.type) {
    case 'const': return val.value;
    case 'var': return assignment.get(val.name) ?? 0;
    case 'add': return evaluateSymbolic(val.left, assignment) + evaluateSymbolic(val.right, assignment);
    case 'sub': return evaluateSymbolic(val.left, assignment) - evaluateSymbolic(val.right, assignment);
    case 'mul': return evaluateSymbolic(val.left, assignment) * evaluateSymbolic(val.right, assignment);
  }
}

function checkConstraint(c: Constraint, assignment: Map<string, number>): boolean {
  switch (c.type) {
    case 'eq': return evaluateSymbolic(c.left, assignment) === evaluateSymbolic(c.right, assignment);
    case 'ne': return evaluateSymbolic(c.left, assignment) !== evaluateSymbolic(c.right, assignment);
    case 'lt': return evaluateSymbolic(c.left, assignment) < evaluateSymbolic(c.right, assignment);
    case 'gt': return evaluateSymbolic(c.left, assignment) > evaluateSymbolic(c.right, assignment);
    case 'and': return checkConstraint(c.left, assignment) && checkConstraint(c.right, assignment);
  }
}

export function solveConstraints(
  constraints: Constraint[],
  variables: string[],
  bound: number = 5
): Map<string, number> | null {
  const n = variables.length;
  const assign = new Map<string, number>();

  const recurse = (idx: number): boolean => {
    if (idx === n) {
      return constraints.every(c => checkConstraint(c, assign));
    }
    for (let v = -bound; v <= bound; v++) {
      assign.set(variables[idx], v);
      if (recurse(idx + 1)) return true;
    }
    assign.delete(variables[idx]);
    return false;
  };

  if (recurse(0)) {
    return assign;
  }
  return null;
}

// ---------------------------------------------------------------------------
// 符号执行引擎
// ---------------------------------------------------------------------------

export class SymbolicExecutionEngine {
  private paths: SymbolicState[] = [];

  constructor(initialState: SymbolicState) {
    this.paths.push(initialState);
  }

  /**
   * 符号赋值：将变量更新为符号表达式
   */
  assign(state: SymbolicState, variable: string, expr: SymbolicValue): SymbolicState {
    const newVars = new Map(state.variables);
    newVars.set(variable, expr);
    return { variables: newVars, pathConstraint: [...state.pathConstraint] };
  }

  /**
   * 条件分支：Fork 两条路径
   */
  branch(state: SymbolicState, condition: Constraint): { trueBranch: SymbolicState; falseBranch: SymbolicState } {
    const notCondition = negateConstraint(condition);
    return {
      trueBranch: {
        variables: new Map(state.variables),
        pathConstraint: [...state.pathConstraint, condition]
      },
      falseBranch: {
        variables: new Map(state.variables),
        pathConstraint: [...state.pathConstraint, notCondition]
      }
    };
  }

  /**
   * 探索程序所有路径并求解可行输入
   */
  explore(
    program: (state: SymbolicState) => SymbolicState[],
    variables: string[],
    bound: number = 5
  ): Array<{ pathIndex: number; constraints: Constraint[]; model: Map<string, number> | null }> {
    const results: Array<{ pathIndex: number; constraints: Constraint[]; model: Map<string, number> | null }> = [];
    let pathIndex = 0;

    for (const path of this.paths) {
      const finalStates = program(path);
      for (const final of finalStates) {
        const model = solveConstraints(final.pathConstraint, variables, bound);
        results.push({ pathIndex: pathIndex++, constraints: final.pathConstraint, model });
      }
    }

    return results;
  }
}

function negateConstraint(c: Constraint): Constraint {
  switch (c.type) {
    case 'eq': return { type: 'ne', left: c.left, right: c.right };
    case 'ne': return { type: 'eq', left: c.left, right: c.right };
    case 'lt': return { type: 'gt', left: c.right, right: c.left };
    case 'gt': return { type: 'lt', left: c.right, right: c.left };
    case 'and': return { type: 'and', left: negateConstraint(c.left), right: negateConstraint(c.right) };
  }
}

// ---------------------------------------------------------------------------
// 演示：符号执行一个简单的条件程序
// ---------------------------------------------------------------------------

export function demo(): void {
  console.log('=== Symbolic Execution ===\n');

  // 程序：
  // x = input_x
  // y = input_y
  // z = x + y
  // if (z > 10)
  //   w = z * 2
  // else
  //   w = z - 5

  const initialState: SymbolicState = {
    variables: new Map([
      ['x', symVar('input_x')],
      ['y', symVar('input_y')]
    ]),
    pathConstraint: []
  };

  const engine = new SymbolicExecutionEngine(initialState);

  // 手动构造程序路径
  const state1 = engine.assign(initialState, 'z', symAdd(symVar('x'), symVar('y')));
  const branches = engine.branch(state1, { type: 'gt', left: symVar('z'), right: symConst(10) });

  const truePath = engine.assign(branches.trueBranch, 'w', symMul(symVar('z'), symConst(2)));
  const falsePath = engine.assign(branches.falseBranch, 'w', symSub(symVar('z'), symConst(5)));

  engine['paths'] = [truePath, falsePath];

  const results = engine.explore(s => [s], ['input_x', 'input_y'], 10);

  for (const r of results) {
    console.log(`Path ${r.pathIndex}:`);
    console.log('  Constraints:', r.constraints.map(c => JSON.stringify(c)));
    console.log('  Feasible model:', r.model ? Object.fromEntries(r.model) : 'INFEASIBLE');
  }
}
