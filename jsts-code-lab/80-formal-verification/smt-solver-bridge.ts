/**
 * @file SMT 求解器桥接器
 * @category Formal Verification → SMT
 * @difficulty hard
 * @tags smt, z3, sat, linear-arithmetic, assertion-stack
 * @description
 * 用 TypeScript 模拟一个极简的 SMT-LIB v2 风格求解器接口，封装 push/pop/assert/check-sat API，
 * 演示整数线性约束的可满足性（SAT）判定。
 *
 * @theoretical_basis
 * - **SMT (Satisfiability Modulo Theories)**: 在特定理论（如线性整数算术、数组、位向量）
 *   下判定一阶逻辑公式的可满足性。Z3、CVC5 是工业级代表。
 * - **DPLL(T)**: 将 SAT 求解器的 DPLL 算法与理论求解器 T-Solver 结合的架构。
 * - **Nelson-Oppen**: 用于组合多个理论求解器的标准方法。
 */

type SMTSort = 'Int' | 'Bool';

export interface SMTVariable {
  name: string;
  sort: SMTSort;
}

export interface SMTConstraint {
  toString(): string;
  evaluate(assignment: Map<string, number | boolean>): boolean;
}

export class SMTIntExpr implements SMTConstraint {
  constructor(
    private lhs: string | number,
    private op: '<=' | '>=' | '=' | '<' | '>',
    private rhs: string | number
  ) {}

  toString(): string {
    return `(${this.op} ${this.lhs} ${this.rhs})`;
  }

  evaluate(assignment: Map<string, number | boolean>): boolean {
    const getVal = (v: string | number): number =>
      typeof v === 'number' ? v : (assignment.get(v) as number);
    const l = getVal(this.lhs);
    const r = getVal(this.rhs);
    switch (this.op) {
      case '<=': return l <= r;
      case '>=': return l >= r;
      case '=': return l === r;
      case '<': return l < r;
      case '>': return l > r;
    }
  }
}

export class SMTBoolExpr implements SMTConstraint {
  constructor(
    private lhs: string | boolean,
    private op: 'and' | 'or' | 'not' | '=>',
    private rhs?: string | boolean
  ) {}

  toString(): string {
    if (this.op === 'not') {
      return `(not ${this.lhs})`;
    }
    return `(${this.op} ${this.lhs} ${this.rhs})`;
  }

  evaluate(assignment: Map<string, number | boolean>): boolean {
    const getVal = (v: string | boolean): boolean =>
      typeof v === 'boolean' ? v : (assignment.get(v) as boolean);
    switch (this.op) {
      case 'and': return getVal(this.lhs) && getVal(this.rhs!);
      case 'or': return getVal(this.lhs) || getVal(this.rhs!);
      case 'not': return !getVal(this.lhs);
      case '=>': return !getVal(this.lhs) || getVal(this.rhs!);
    }
  }
}

export class SMTSolverBridge {
  private variables = new Map<string, SMTVariable>();
  private assertionStack: SMTConstraint[][] = [[]];

  declareConst(name: string, sort: SMTSort): void {
    this.variables.set(name, { name, sort });
  }

  assert(constraint: SMTConstraint): void {
    this.currentScope().push(constraint);
  }

  push(): void {
    this.assertionStack.push([...this.currentScope()]);
  }

  pop(): void {
    if (this.assertionStack.length > 1) {
      this.assertionStack.pop();
    }
  }

  /**
   * 极简整数线性约束 SAT 判定器（采用有界穷举法）
   *
   * 对于教学目的，仅支持 [-bound, bound] 范围内的整数搜索。
   */
  checkSat(bound = 10): { sat: boolean; model?: Map<string, number | boolean> } {
    const constraints = this.currentScope();
    const intVars = Array.from(this.variables.values()).filter(v => v.sort === 'Int');
    const boolVars = Array.from(this.variables.values()).filter(v => v.sort === 'Bool');

    // 生成布尔变量的所有赋值组合
    const boolAssignments = this.generateBoolAssignments(boolVars);

    for (const boolAssign of boolAssignments) {
      const result = this.searchIntAssignments(intVars, constraints, bound, boolAssign);
      if (result) {
        return { sat: true, model: result };
      }
    }

    return { sat: false };
  }

  private currentScope(): SMTConstraint[] {
    return this.assertionStack[this.assertionStack.length - 1];
  }

  private generateBoolAssignments(vars: SMTVariable[]): Map<string, boolean>[] {
    if (vars.length === 0) return [new Map<string, boolean>()];
    const result: Map<string, boolean>[] = [];
    const recurse = (idx: number, current: Map<string, boolean>) => {
      if (idx === vars.length) {
        result.push(new Map(current));
        return;
      }
      current.set(vars[idx].name, false);
      recurse(idx + 1, current);
      current.set(vars[idx].name, true);
      recurse(idx + 1, current);
      current.delete(vars[idx].name);
    };
    recurse(0, new Map());
    return result;
  }

  private searchIntAssignments(
    vars: SMTVariable[],
    constraints: SMTConstraint[],
    bound: number,
    boolAssign: Map<string, boolean>
  ): Map<string, number | boolean> | null {
    const n = vars.length;
    const assign = new Map<string, number | boolean>(boolAssign);

    const recurse = (idx: number): boolean => {
      if (idx === n) {
        return constraints.every(c => c.evaluate(assign));
      }
      for (let v = -bound; v <= bound; v++) {
        assign.set(vars[idx].name, v);
        if (recurse(idx + 1)) return true;
      }
      assign.delete(vars[idx].name);
      return false;
    };

    if (recurse(0)) {
      return assign;
    }
    return null;
  }

  getAssertions(): string[] {
    return this.currentScope().map(c => c.toString());
  }
}

export function demo(): void {
  console.log('=== SMT Solver Bridge ===\n');

  const solver = new SMTSolverBridge();
  solver.declareConst('x', 'Int');
  solver.declareConst('y', 'Int');

  // x >= 1 ∧ y >= 1
  solver.assert(new SMTIntExpr('x', '>=', 1));
  solver.assert(new SMTIntExpr('y', '>=', 1));

  // push 一层假设：x = 2 ∧ y = 3
  solver.push();
  solver.assert(new SMTIntExpr('x', '=', 2));
  solver.assert(new SMTIntExpr('y', '=', 3));

  const sat1 = solver.checkSat(5);
  console.log(' SAT (x=2, y=3):', sat1.sat, 'Model:', sat1.model ? Object.fromEntries(sat1.model) : null);

  // pop 后恢复为仅 x>=1 ∧ y>=1
  solver.pop();
  solver.push();
  solver.assert(new SMTIntExpr('x', '>', 10));
  const sat2 = solver.checkSat(5);
  console.log('UNSAT (x>10 within bound 5):', !sat2.sat);

  solver.pop();

  console.log('\n--- 布尔约束演示 ---');
  const solver3 = new SMTSolverBridge();
  solver3.declareConst('p', 'Bool');
  solver3.declareConst('q', 'Bool');
  solver3.assert(new SMTBoolExpr('p', 'and', 'q'));
  solver3.assert(new SMTBoolExpr('p', '=>', true));
  const sat3 = solver3.checkSat(0);
  console.log('SAT (p ∧ q):', sat3.sat, 'Model:', sat3.model ? Object.fromEntries(sat3.model) : null);
}
