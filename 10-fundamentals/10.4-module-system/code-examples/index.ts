/**
 * jsts-language-core-system / 08-module-system
 *
 * 模块系统专题导出入口
 * 运行全部演示: tsx index.ts
 */

import { demo as demoModuleSystemOverview } from "./01-module-system-overview.js";
import { demo as demoEsmDeepDive } from "./02-esm-deep-dive.js";
import { demo as demoCommonjsMechanics } from "./03-commonjs-mechanics.js";
import { demo as demoCjsEsmInterop } from "./04-cjs-esm-interop.js";
import { demo as demoModuleResolution } from "./05-module-resolution.js";
import { demo as demoCyclicDependencies } from "./06-cyclic-dependencies.js";

export {
  demoModuleSystemOverview,
  demoEsmDeepDive,
  demoCommonjsMechanics,
  demoCjsEsmInterop,
  demoModuleResolution,
  demoCyclicDependencies,
};

/** 运行所有模块系统演示 */
export async function runAllDemos() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     jsts-language-core-system / 08-module-system               ║");
  console.log("║     Running all module system demonstrations...               ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");

  demoModuleSystemOverview();
  await demoEsmDeepDive();
  demoCommonjsMechanics();
  demoCjsEsmInterop();
  demoModuleResolution();
  await demoCyclicDependencies();

  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     All module system demonstrations completed                ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("\n");
}

// 直接运行
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  runAllDemos();
}
