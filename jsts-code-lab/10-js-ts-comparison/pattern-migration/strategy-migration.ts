/**
 * @file Strategy 模式迁移: JavaScript -> TypeScript
 * @category JS/TS Comparison → Pattern Migration
 * @difficulty medium
 * @tags migration, strategy, discriminated-union, exhaustiveness-check
 *
 * @description
 * 展示如何将 JavaScript 的对象映射策略函数迁移到 TypeScript 的
 * Discriminated Union + Exhaustiveness Check (assertNever)。
 */

// ============================================================================
// JavaScript 版本: 对象映射策略函数
// ============================================================================

/*
const strategies = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b
};

function execute(strategyName, a, b) {
  const fn = strategies[strategyName];
  if (!fn) {
    throw new Error('Unknown strategy: ' + strategyName);
  }
  return fn(a, b);
}

console.log(execute('add', 2, 3)); // 5
// console.log(execute('divide', 2, 3)); // 运行时错误
// 问题: strategyName 可以是任意字符串；strategies 和 execute 之间无静态关联
*/

// ============================================================================
// TypeScript 版本: Discriminated Union + Exhaustiveness Check
// ============================================================================

export type StrategyAction =
  | { type: 'add'; a: number; b: number }
  | { type: 'subtract'; a: number; b: number }
  | { type: 'multiply'; a: number; b: number }
  | { type: 'divide'; a: number; b: number };

export function assertNever(value: never): never {
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
}

export function calculate(action: StrategyAction): number {
  switch (action.type) {
    case 'add':
      return action.a + action.b;
    case 'subtract':
      return action.a - action.b;
    case 'multiply':
      return action.a * action.b;
    case 'divide':
      if (action.b === 0) {
        throw new Error('Division by zero');
      }
      return action.a / action.b;
    default:
      return assertNever(action);
  }
}

// 扩展策略无需修改对象结构，只需在 union 和 switch 中添加分支
export type ExtendedStrategyAction =
  | StrategyAction
  | { type: 'power'; base: number; exponent: number };

export function calculateExtended(action: ExtendedStrategyAction): number {
  switch (action.type) {
    case 'add':
      return action.a + action.b;
    case 'subtract':
      return action.a - action.b;
    case 'multiply':
      return action.a * action.b;
    case 'divide':
      if (action.b === 0) throw new Error('Division by zero');
      return action.a / action.b;
    case 'power':
      return Math.pow(action.base, action.exponent);
    default:
      return assertNever(action);
  }
}

// ============================================================================
// 迁移收益
// ============================================================================

/**
 * 1. Discriminated Union 让策略类型在编译期完全确定，杜绝非法策略名。
 * 2. switch + assertNever 提供穷尽性检查：漏掉分支会编译报错。
 * 3. 每个分支自动收窄到对应类型，字段类型安全且 IDE 提示精准。
 * 4. 运行时无需字符串查找，直接通过 type 标签分发，性能更优。
 */
