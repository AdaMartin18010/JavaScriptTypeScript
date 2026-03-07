/**
 * @file ESM 基础
 * @category Language Core → Modules
 * @difficulty warm
 * @tags esm, modules, import, export
 */

// ============================================================================
// 1. 命名导出
// ============================================================================

export const PI = 3.14159;
export const E = 2.71828;

export function add(a: number, b: number): number {
  return a + b;
}

export class Calculator {
  value = 0;

  add(n: number): this {
    this.value += n;
    return this;
  }

  result(): number {
    return this.value;
  }
}

// ============================================================================
// 2. 默认导出
// ============================================================================

export default function greet(name: string): string {
  return `Hello, ${name}!`;
}

// 一个模块只能有一个默认导出
const Utils = {
  add,
  PI,
  greet
};

// 导出别名
export { Utils as utils };

// ============================================================================
// 3. 重新导出
// ============================================================================

// 从其他模块重新导出
export { add as addNumbers } from './math.js';
export * from './constants.js';

// 重新导出并重命名
export { default as MathUtils } from './math.js';

// ============================================================================
// 4. 类型导出 (TypeScript)
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export type Vector = Point;

export type Shape = 'circle' | 'square' | 'triangle';

// 单独的类型导出 (TS 4.5+)
export type { Config } from './types.js';

// ============================================================================
// 5. 命名空间导出
// ============================================================================

import * as MathConstants from './constants.js';
export { MathConstants };

// 或者
export * as Math from './math.js';
