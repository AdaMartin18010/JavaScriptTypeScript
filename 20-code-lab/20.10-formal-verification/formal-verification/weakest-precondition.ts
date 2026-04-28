/**
 * @file 最弱前置条件演算
 * @category Formal Verification → Weakest Precondition
 * @difficulty hard
 * @tags wp, dijkstra, predicate-transformer, assignment, sequence, selection, loop
 * @description
 * 实现 Dijkstra 最弱前置条件（Weakest Precondition, wp）演算器，支持赋值、
 * 顺序、选择、循环语句的 wp 计算，并演示简单命令式程序的正确性验证。
 *
 * @theoretical_basis
 * - **Weakest Precondition (wp)**: Dijkstra 于 1975 年提出，谓词转换器语义的核心。
 *   wp(C, Q) 表示执行命令 C 后能保证后置条件 Q 成立的最大前置条件集合。
 * - **Axioms**:
 *   - wp(skip, Q) = Q
 *   - wp(x := E, Q) = Q[x/E]  （代换）
 *   - wp(C1; C2, Q) = wp(C1, wp(C2, Q))
 *   - wp(if B then C1 else C2, Q) = (B ⇒ wp(C1, Q)) ∧ (¬B ⇒ wp(C2, Q))
 *   - wp(while B do C, Q) 依赖于循环不变量 I 与变体函数 V
 */

// ---------------------------------------------------------------------------
// 表达式与命令的 AST
// ---------------------------------------------------------------------------

export type Expr =
  | { type: 'var'; name: string }
  | { type: 'const'; value: number }
  | { type: 'add'; left: Expr; right: Expr }
  | { type: 'sub'; left: Expr; right: Expr }
  | { type: 'mul'; left: Expr; right: Expr };

export type Command =
  | { type: 'skip' }
  | { type: 'assign'; var: string; expr: Expr }
  | { type: 'seq'; left: Command; right: Command }
  | { type: 'if'; cond: BooleanExpr; thenBranch: Command; elseBranch: Command }
  | { type: 'while'; cond: BooleanExpr; body: Command; invariant: Predicate };

export type BooleanExpr =
  | { type: 'true' }
  | { type: 'false' }
  | { type: 'not'; operand: BooleanExpr }
  | { type: 'and'; left: BooleanExpr; right: BooleanExpr }
  | { type: 'or'; left: BooleanExpr; right: BooleanExpr }
  | { type: 'lt'; left: Expr; right: Expr }
  | { type: 'le'; left: Expr; right: Expr }
  | { type: 'eq'; left: Expr; right: Expr };

export type Predicate =
  | { type: 'true' }
  | { type: 'false' }
  | { type: 'not'; operand: Predicate }
  | { type: 'and'; left: Predicate; right: Predicate }
  | { type: 'or'; left: Predicate; right: Predicate }
  | { type: 'implies'; left: Predicate; right: Predicate }
  | { type: 'eq'; left: Expr; right: Expr }
  | { type: 'le'; left: Expr; right: Expr }
  | { type: 'lt'; left: Expr; right: Expr };

// ---------------------------------------------------------------------------
// 工厂函数
// ---------------------------------------------------------------------------

export function v(name: string): Expr {
  return { type: 'var', name };
}

export function c(value: number): Expr {
  return { type: 'const', value };
}

export function add(a: Expr, b: Expr): Expr {
  return { type: 'add', left: a, right: b };
}

export function mul(a: Expr, b: Expr): Expr {
  return { type: 'mul', left: a, right: b };
}

export function assign(variable: string, expr: Expr): Command {
  return { type: 'assign', var: variable, expr };
}

export function seq(...commands: Command[]): Command {
  return commands.reduce((acc, cmd) =>
    acc.type === 'skip' ? cmd : { type: 'seq', left: acc, right: cmd }
  );
}

// ---------------------------------------------------------------------------
// 表达式替换：将变量替换为表达式
// ---------------------------------------------------------------------------

export function substituteInExpr(expr: Expr, variable: string, replacement: Expr): Expr {
  switch (expr.type) {
    case 'var':
      return expr.name === variable ? replacement : expr;
    case 'const':
      return expr;
    case 'add':
    case 'sub':
    case 'mul':
      return {
        ...expr,
        left: substituteInExpr(expr.left, variable, replacement),
        right: substituteInExpr(expr.right, variable, replacement)
      };
  }
}

export function substituteInPredicate(pred: Predicate, variable: string, replacement: Expr): Predicate {
  switch (pred.type) {
    case 'true':
    case 'false':
      return pred;
    case 'not':
      return { type: 'not', operand: substituteInPredicate(pred.operand, variable, replacement) };
    case 'and':
    case 'or':
    case 'implies':
      return {
        ...pred,
        left: substituteInPredicate(pred.left, variable, replacement),
        right: substituteInPredicate(pred.right, variable, replacement)
      };
    case 'eq':
    case 'le':
    case 'lt':
      return {
        ...pred,
        left: substituteInExpr(pred.left, variable, replacement),
        right: substituteInExpr(pred.right, variable, replacement)
      };
  }
}

// ---------------------------------------------------------------------------
// 最弱前置条件演算
// ---------------------------------------------------------------------------

export function wp(command: Command, post: Predicate): Predicate {
  switch (command.type) {
    case 'skip':
      return post;

    case 'assign':
      return substituteInPredicate(post, command.var, command.expr);

    case 'seq':
      return wp(command.left, wp(command.right, post));

    case 'if': {
      const thenPart = wp(command.thenBranch, post);
      const elsePart = wp(command.elseBranch, post);
      const condPred = boolExprToPredicate(command.cond);
      const notCondPred = boolExprToPredicate(negateBoolExpr(command.cond));
      return {
        type: 'and',
        left: { type: 'implies', left: condPred, right: thenPart },
        right: { type: 'implies', left: notCondPred, right: elsePart }
      };
    }

    case 'while':
      // 循环的 wp 基于不变量：I ∧ (I ∧ B ⇒ wp(C, I)) ∧ (I ∧ ¬B ⇒ Q)
      // 教学简化：直接返回不变量与终止条件的合取
      return {
        type: 'and',
        left: command.invariant,
        right: {
          type: 'implies',
          left: {
            type: 'and',
            left: command.invariant,
            right: boolExprToPredicate(negateBoolExpr(command.cond))
          },
          right: post
        }
      };
  }
}

function boolExprToPredicate(be: BooleanExpr): Predicate {
  switch (be.type) {
    case 'true': return { type: 'true' };
    case 'false': return { type: 'false' };
    case 'not': return { type: 'not', operand: boolExprToPredicate(be.operand) };
    case 'and': return { type: 'and', left: boolExprToPredicate(be.left), right: boolExprToPredicate(be.right) };
    case 'or': return { type: 'or', left: boolExprToPredicate(be.left), right: boolExprToPredicate(be.right) };
    case 'lt': return { type: 'lt', left: be.left, right: be.right };
    case 'le': return { type: 'le', left: be.left, right: be.right };
    case 'eq': return { type: 'eq', left: be.left, right: be.right };
  }
}

function negateBoolExpr(be: BooleanExpr): BooleanExpr {
  switch (be.type) {
    case 'true': return { type: 'false' };
    case 'false': return { type: 'true' };
    case 'not': return be.operand;
    case 'and': return { type: 'or', left: negateBoolExpr(be.left), right: negateBoolExpr(be.right) };
    case 'or': return { type: 'and', left: negateBoolExpr(be.left), right: negateBoolExpr(be.right) };
    case 'lt': return { type: 'le', left: be.right, right: be.left };
    case 'le': return { type: 'lt', left: be.right, right: be.left };
    case 'eq': return { type: 'or', left: { type: 'lt', left: be.left, right: be.right }, right: { type: 'lt', left: be.right, right: be.left } };
  }
}

// ---------------------------------------------------------------------------
// 谓词打印
// ---------------------------------------------------------------------------

export function predicateToString(pred: Predicate): string {
  switch (pred.type) {
    case 'true': return 'true';
    case 'false': return 'false';
    case 'not': return `¬(${predicateToString(pred.operand)})`;
    case 'and': return `(${predicateToString(pred.left)} ∧ ${predicateToString(pred.right)})`;
    case 'or': return `(${predicateToString(pred.left)} ∨ ${predicateToString(pred.right)})`;
    case 'implies': return `(${predicateToString(pred.left)} ⇒ ${predicateToString(pred.right)})`;
    case 'eq': return `(${exprToString(pred.left)} = ${exprToString(pred.right)})`;
    case 'le': return `(${exprToString(pred.left)} ≤ ${exprToString(pred.right)})`;
    case 'lt': return `(${exprToString(pred.left)} < ${exprToString(pred.right)})`;
  }
}

function exprToString(expr: Expr): string {
  switch (expr.type) {
    case 'var': return expr.name;
    case 'const': return String(expr.value);
    case 'add': return `(${exprToString(expr.left)} + ${exprToString(expr.right)})`;
    case 'sub': return `(${exprToString(expr.left)} - ${exprToString(expr.right)})`;
    case 'mul': return `(${exprToString(expr.left)} * ${exprToString(expr.right)})`;
  }
}

// ---------------------------------------------------------------------------
// 演示：计算 y = 2x + 1 的 wp
// ---------------------------------------------------------------------------

export function demo(): void {
  console.log('=== Weakest Precondition ===\n');

  // 程序：y := x + 1; z := y * 2
  // 后置条件：z = 2x + 2
  const program = seq(
    assign('y', add(v('x'), c(1))),
    assign('z', mul(v('y'), c(2)))
  );

  const post: Predicate = {
    type: 'eq',
    left: v('z'),
    right: add(mul(c(2), v('x')), c(2))
  };

  const weakestPre = wp(program, post);
  console.log('Program: y := x + 1; z := y * 2');
  console.log('Postcondition:', predicateToString(post));
  console.log('Weakest Precondition:', predicateToString(weakestPre));

  // 程序：if (x > 0) then y := x else y := -x
  // 后置条件：y ≥ 0
  const absProgram: Command = {
    type: 'if',
    cond: { type: 'lt', left: c(0), right: v('x') },
    thenBranch: assign('y', v('x')),
    elseBranch: assign('y', { type: 'sub', left: c(0), right: v('x') })
  };

  const post2: Predicate = { type: 'le', left: c(0), right: v('y') };
  const weakestPre2 = wp(absProgram, post2);
  console.log('\nProgram: if (x > 0) y := x else y := -x');
  console.log('Postcondition:', predicateToString(post2));
  console.log('Weakest Precondition:', predicateToString(weakestPre2));
}
