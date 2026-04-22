#!/usr/bin/env node
/**
 * scripts/run-language-core-demos.ts
 *
 * 一键运行 jsts-language-core-system 全部七大专题演示。
 *
 * 用法:
 *   npx tsx scripts/run-language-core-demos.ts         # 运行全部
 *   npx tsx scripts/run-language-core-demos.ts 01      # 仅运行 01 类型系统
 *   npx tsx scripts/run-language-core-demos.ts 05 07   # 运行 05 和 07
 */

import { runAllDemos as runTypeSystem } from "../jsts-language-core-system/01-type-system/index.js";
import { runAllDemos as runVariableSystem } from "../jsts-language-core-system/02-variable-system/index.js";
import { runAllDemos as runControlFlow } from "../jsts-language-core-system/03-control-flow/index.js";
import { demo as runExecutionModel } from "../jsts-language-core-system/04-execution-model/index.js";
import { demo as runExecutionFlow } from "../jsts-language-core-system/05-execution-flow/index.js";
import { demo as runSpecFoundation } from "../jsts-language-core-system/06-ecmascript-spec-foundation/index.js";
import { runAllDemos as runSymmetricDifference } from "../jsts-language-core-system/07-js-ts-symmetric-difference/index.js";

const modules: Record<string, () => void | Promise<void>> = {
  "01": runTypeSystem,
  "type-system": runTypeSystem,
  "02": runVariableSystem,
  "variable-system": runVariableSystem,
  "03": runControlFlow,
  "control-flow": runControlFlow,
  "04": runExecutionModel,
  "execution-model": runExecutionModel,
  "05": runExecutionFlow,
  "execution-flow": runExecutionFlow,
  "06": runSpecFoundation,
  "spec-foundation": runSpecFoundation,
  "07": runSymmetricDifference,
  "symmetric-difference": runSymmetricDifference,
};

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // 运行全部（通过根入口）
    const { runAllDemos } = await import("../jsts-language-core-system/index.js");
    await runAllDemos();
    return;
  }

  // 运行指定模块
  for (const arg of args) {
    const key = arg.toLowerCase().replace(/^0*/, ""); // "01" → "1" → lookup
    const normalizedKey = arg.toLowerCase();
    const runner = modules[normalizedKey] || modules[key];

    if (!runner) {
      console.error(`❌ 未知模块: ${arg}`);
      console.error("可用模块: 01-07 或别名 (type-system, variable-system, control-flow, execution-model, execution-flow, spec-foundation, symmetric-difference)");
      process.exit(1);
    }

    console.log(`\n▶ 运行模块: ${normalizedKey}`);
    await runner();
  }
}

main().catch((err) => {
  console.error("运行失败:", err);
  process.exit(1);
});
