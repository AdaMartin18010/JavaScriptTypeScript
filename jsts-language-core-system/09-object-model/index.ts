/**
 * jsts-language-core-system / 09-object-model
 *
 * 对象模型模块导出入口
 * 运行全部演示: tsx index.ts
 */

import { demo as demoObjectModelOverview } from "./01-object-model-overview.js";
import { demo as demoPrototypeChain } from "./02-prototype-chain.js";
import { demo as demoProxyAndReflect } from "./03-proxy-and-reflect.js";
import { demo as demoPrivateFields } from "./04-private-fields.js";
import { demo as demoObjectCreationPatterns } from "./05-object-creation-patterns.js";

export {
  demoObjectModelOverview,
  demoPrototypeChain,
  demoProxyAndReflect,
  demoPrivateFields,
  demoObjectCreationPatterns,
};

/** 运行所有对象模型演示 */
export function runAllDemos() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     jsts-language-core-system / 09-object-model               ║");
  console.log("║     Running all object model demonstrations...                ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");

  demoObjectModelOverview();
  demoPrototypeChain();
  demoProxyAndReflect();
  demoPrivateFields();
  demoObjectCreationPatterns();

  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     All object model demonstrations completed ✅              ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("\n");
}

// 直接运行
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  runAllDemos();
}
