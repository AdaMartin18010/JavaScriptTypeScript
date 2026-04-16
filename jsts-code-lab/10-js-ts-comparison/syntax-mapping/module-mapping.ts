/**
 * @file 模块系统映射：JavaScript → TypeScript
 * @description 展示 ESM/CJS 在 TS 中的类型导入导出、动态导入、声明文件映射
 * @aligns ECMA-262 §16, TypeScript Spec §11
 */

// ============================================================================
// JS ESM Version
// ============================================================================

// math.js
// export const PI = 3.14159;
// export function add(a, b) { return a + b; }

// main.js
// import { add } from "./math.js";
// import * as math from "./math.js";

// ============================================================================
// TS ESM Version: 类型标注 + 类型导入导出 + 动态导入
// ============================================================================

// 1. 导出类型与值
export interface Point {
  x: number;
  y: number;
}

export const PI = 3.14159;

export function add(a: number, b: number): number {
  return a + b;
}

// 2. 仅导出类型（编译后擦除）—— 若未在上方导出值/类型，可单独使用 export type
// export type { Point }; // 示例：已在上文 export interface Point 中导出，此处省略避免重复导出冲突

// 3. 类型导入（零运行时开销）
// import type { Point } from "./module-mapping.js";

// 4. 动态导入带类型推断
export async function loadMathModule() {
  const mod = await import("./module-mapping.js");
  return mod.add(1, 2); // mod 的类型被推断为 typeof import("./module-mapping.js")
}

// 5. 模块增强（Ambient Module Augmentation）
// @ts-ignore standalone compile may report on ambient wildcard module declarations
 declare module "*.json" {
  const value: unknown;
  export default value;
}

// 6. import attributes (TS 6.0 推荐使用 with 而非 assert)
// import data from "./data.json" with { type: "json" };
