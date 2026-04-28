/**
 * @file 线性时序逻辑 (LTL) 解释器
 * @category Formal Verification → Temporal Logic
 * @difficulty hard
 * @tags ltl, temporal-logic, trace, semantics, model-checking
 * @description
 * 实现线性时序逻辑（LTL）的语法树与解释器，能够对有限状态迹（trace）进行
 * G (Globally)、F (Finally)、U (Until)、X (Next) 的求值。
 *
 * @theoretical_basis
 * - **LTL (Linear Temporal Logic)**: Pnueli 于 1977 年提出，用于描述程序执行迹上的时序性质。
 *   语法：φ ::= p | ¬φ | φ ∧ φ | X φ | F φ | G φ | φ U φ
 * - **Trace Semantics**: 给定有限迹 π = s₀, s₁, ..., sₙ，LTL 公式在位置 i 上的满足关系
 *   ⊨ 递归定义。为简化教学，本实现基于有限迹语义（Finite-Trace LTL）。
 */

// ---------------------------------------------------------------------------
// LTL 语法树
// ---------------------------------------------------------------------------

export type LTLFormula<T> =
  | { type: 'atom'; predicate: (state: T) => boolean }
  | { type: 'not'; operand: LTLFormula<T> }
  | { type: 'and'; left: LTLFormula<T>; right: LTLFormula<T> }
  | { type: 'or'; left: LTLFormula<T>; right: LTLFormula<T> }
  | { type: 'X'; operand: LTLFormula<T> }          // Next
  | { type: 'F'; operand: LTLFormula<T> }          // Finally
  | { type: 'G'; operand: LTLFormula<T> }          // Globally
  | { type: 'U'; left: LTLFormula<T>; right: LTLFormula<T> }; // Until

// ---------------------------------------------------------------------------
// 工厂函数
// ---------------------------------------------------------------------------

export function atom<T>(predicate: (state: T) => boolean): LTLFormula<T> {
  return { type: 'atom', predicate };
}

export function not<T>(operand: LTLFormula<T>): LTLFormula<T> {
  return { type: 'not', operand };
}

export function and<T>(left: LTLFormula<T>, right: LTLFormula<T>): LTLFormula<T> {
  return { type: 'and', left, right };
}

export function or<T>(left: LTLFormula<T>, right: LTLFormula<T>): LTLFormula<T> {
  return { type: 'or', left, right };
}

export function next<T>(operand: LTLFormula<T>): LTLFormula<T> {
  return { type: 'X', operand };
}

export function finally_<T>(operand: LTLFormula<T>): LTLFormula<T> {
  return { type: 'F', operand };
}

export function globally<T>(operand: LTLFormula<T>): LTLFormula<T> {
  return { type: 'G', operand };
}

export function until<T>(left: LTLFormula<T>, right: LTLFormula<T>): LTLFormula<T> {
  return { type: 'U', left, right };
}

// ---------------------------------------------------------------------------
// LTL 有限迹解释器
// ---------------------------------------------------------------------------

export class LTLInterpreter<T> {
  /**
   * 在迹 trace 的位置 pos 上求值公式 formula
   *
   * 语义规则（有限迹版本）：
   * - π, i ⊨ p       ⟺  p(π[i]) = true
   * - π, i ⊨ ¬φ      ⟺  π, i ⊭ φ
   * - π, i ⊨ φ ∧ ψ   ⟺  π, i ⊨ φ 且 π, i ⊨ ψ
   * - π, i ⊨ X φ     ⟺  i+1 < |π| 且 π, i+1 ⊨ φ
   * - π, i ⊨ F φ     ⟺  ∃j ≥ i. π, j ⊨ φ
   * - π, i ⊨ G φ     ⟺  ∀j ≥ i. π, j ⊨ φ
   * - π, i ⊨ φ U ψ   ⟺  ∃j ≥ i. π, j ⊨ ψ 且 ∀k ∈ [i, j). π, k ⊨ φ
   */
  evaluate(formula: LTLFormula<T>, trace: T[], pos = 0): boolean {
    switch (formula.type) {
      case 'atom':
        if (pos >= trace.length) return false;
        return formula.predicate(trace[pos]);

      case 'not':
        return !this.evaluate(formula.operand, trace, pos);

      case 'and':
        return this.evaluate(formula.left, trace, pos) && this.evaluate(formula.right, trace, pos);

      case 'or':
        return this.evaluate(formula.left, trace, pos) || this.evaluate(formula.right, trace, pos);

      case 'X':
        return pos + 1 < trace.length && this.evaluate(formula.operand, trace, pos + 1);

      case 'F':
        for (let i = pos; i < trace.length; i++) {
          if (this.evaluate(formula.operand, trace, i)) return true;
        }
        return false;

      case 'G':
        for (let i = pos; i < trace.length; i++) {
          if (!this.evaluate(formula.operand, trace, i)) return false;
        }
        return true;

      case 'U': {
        for (let j = pos; j < trace.length; j++) {
          if (this.evaluate(formula.right, trace, j)) {
            for (let k = pos; k < j; k++) {
              if (!this.evaluate(formula.left, trace, k)) return false;
            }
            return true;
          }
        }
        return false;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 演示
// ---------------------------------------------------------------------------

interface SystemState { temp: number; alert: boolean }

export function demo(): void {
  console.log('=== Linear Temporal Logic (LTL) ===\n');

  const trace: SystemState[] = [
    { temp: 20, alert: false },
    { temp: 35, alert: false },
    { temp: 45, alert: false },
    { temp: 55, alert: true },
    { temp: 60, alert: true },
  ];

  const interpreter = new LTLInterpreter<SystemState>();

  // G(temp > 0): 全局温度始终大于 0
  const f1 = globally(atom<SystemState>(s => s.temp > 0));
  console.log('G(temp > 0):', interpreter.evaluate(f1, trace));

  // F(alert): 最终会发生警报
  const f2 = finally_(atom<SystemState>(s => s.alert));
  console.log('F(alert):', interpreter.evaluate(f2, trace));

  // X(alert): 下一步就发生警报（在位置 1 求值，对应 trace[2]）
  const f3 = next(atom<SystemState>(s => s.alert));
  console.log('X(alert) @ pos 1:', interpreter.evaluate(f3, trace, 1));
  console.log('X(alert) @ pos 2:', interpreter.evaluate(f3, trace, 2));

  // (temp < 50) U (alert): 在警报响起之前，温度始终小于 50
  const f4 = until(
    atom<SystemState>(s => s.temp < 50),
    atom<SystemState>(s => s.alert)
  );
  console.log('(temp < 50) U alert:', interpreter.evaluate(f4, trace));

  // G(¬alert) ∨ F(alert): 始终无警报或最终有警报（排中律演示）
  const f5 = or(
    globally(not(atom<SystemState>(s => s.alert))),
    finally_(atom<SystemState>(s => s.alert))
  );
  console.log('G(¬alert) ∨ F(alert):', interpreter.evaluate(f5, trace));
}
