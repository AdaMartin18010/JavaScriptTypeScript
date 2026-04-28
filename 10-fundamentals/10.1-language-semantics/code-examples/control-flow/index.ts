/**
 * @file 控制流模块入口
 * @description JavaScript/TypeScript 控制流核心概念演示
 */

export * as ShortCircuit from './short-circuit.js';
export * as NullishOptional from './nullish-optional.js';
export * as GeneratorIterator from './generator-iterator.js';
export * as AsyncControl from './async-control.js';
export * as ExplicitResource from './explicit-resource.js';
export * as PatternMatching from './pattern-matching.js';

import { demo as demoShortCircuit } from './short-circuit.js';
import { demo as demoNullishOptional } from './nullish-optional.js';
import { demo as demoGeneratorIterator } from './generator-iterator.js';
import { demo as demoAsyncControl } from './async-control.js';
import { demo as demoExplicitResource } from './explicit-resource.js';
import { demo as demoPatternMatching } from './pattern-matching.js';

/** 运行所有控制流演示 */
export async function runAllDemos(): Promise<void> {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     jsts-language-core-system / 03-control-flow               ║");
  console.log("║     Running all control flow demonstrations...                ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");

  demoShortCircuit();
  console.log("\n────────────────────────────────────────────────────────────────\n");
  demoNullishOptional();
  console.log("\n────────────────────────────────────────────────────────────────\n");
  demoGeneratorIterator();
  console.log("\n────────────────────────────────────────────────────────────────\n");
  await demoAsyncControl();
  console.log("\n────────────────────────────────────────────────────────────────\n");
  await demoExplicitResource();
  console.log("\n────────────────────────────────────────────────────────────────\n");
  demoPatternMatching();

  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     All control flow demonstrations completed ✅              ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("\n");
}

// 直接运行
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  runAllDemos();
}
