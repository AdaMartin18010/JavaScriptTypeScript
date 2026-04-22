/**
 * jsts-language-core-system / 根入口
 *
 * 七大专题统一演示入口：
 *   01 类型系统 → 02 变量系统 → 03 控制流 → 04 执行模型 → 05 执行流 → 06 规范基础 → 07 JS/TS 对称差
 *
 * 运行全部: npx tsx jsts-language-core-system/index.ts
 * 运行单专题: npx tsx jsts-language-core-system/01-type-system/index.ts
 */

import { runAllDemos as runTypeSystem } from "./01-type-system/index.js";
import { runAllDemos as runVariableSystem } from "./02-variable-system/index.js";
import { runAllDemos as runControlFlow } from "./03-control-flow/index.js";
import { demo as runExecutionModel } from "./04-execution-model/index.js";
import { demo as runExecutionFlow } from "./05-execution-flow/index.js";
import { demo as runSpecFoundation } from "./06-ecmascript-spec-foundation/index.js";
import { runAllDemos as runSymmetricDifference } from "./07-js-ts-symmetric-difference/index.js";

/** 运行全部七大专题演示 */
export async function runAllDemos(): Promise<void> {
  const start = Date.now();

  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════════════════════╗");
  console.log("║                                                                      ║");
  console.log("║     🚀 jsts-language-core-system                                     ║");
  console.log("║        JavaScript / TypeScript 语言核心系统 — 七大专题完整演示       ║");
  console.log("║                                                                      ║");
  console.log("╚══════════════════════════════════════════════════════════════════════╝");

  // 01 类型系统
  console.log("\n\n【01/07】类型系统 (Type System)");
  console.log("──────────────────────────────────────────────────────────────────────");
  runTypeSystem();

  // 02 变量系统
  console.log("\n\n【02/07】变量系统 (Variable System)");
  console.log("──────────────────────────────────────────────────────────────────────");
  runVariableSystem();

  // 03 控制流
  console.log("\n\n【03/07】控制流 (Control Flow)");
  console.log("──────────────────────────────────────────────────────────────────────");
  await runControlFlow();

  // 04 执行模型
  console.log("\n\n【04/07】执行模型 (Execution Model)");
  console.log("──────────────────────────────────────────────────────────────────────");
  runExecutionModel();

  // 05 执行流
  console.log("\n\n【05/07】执行流 (Execution Flow)");
  console.log("──────────────────────────────────────────────────────────────────────");
  await runExecutionFlow();

  // 06 规范基础
  console.log("\n\n【06/07】ECMAScript 规范基础 (Spec Foundation)");
  console.log("──────────────────────────────────────────────────────────────────────");
  runSpecFoundation();

  // 07 JS/TS 对称差
  console.log("\n\n【07/07】JS/TS 对称差 (Symmetric Difference)");
  console.log("──────────────────────────────────────────────────────────────────────");
  await runSymmetricDifference();

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════════════════════╗");
  console.log("║                                                                      ║");
  console.log("║     ✅ 全部七大专题演示完成                                          ║");
  console.log(`║        耗时: ${elapsed.padEnd(52, " ")}║`);
  console.log("║                                                                      ║");
  console.log("╚══════════════════════════════════════════════════════════════════════╝");
  console.log("\n");
}

// 直接运行
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  runAllDemos();
}
