/**
 * jsts-language-core-system / 01-type-system
 *
 * 类型系统模块导出入口
 * 运行全部演示: tsx index.ts
 */

import { demo as demoTypeFoundations } from "./type-foundations";
import { demo as demoTypeInferenceAnnotations } from "./type-inference-annotations";
import { demo as demoUnionsIntersections } from "./unions-intersections";
import { demo as demoNarrowingGuards } from "./narrowing-guards";
import { demo as demoGenerics } from "./generics";
import { demo as demoConditionalMappedTypes } from "./conditional-mapped-types";
import { demo as demoUtilityTypesPatterns } from "./utility-types-patterns";
import { demo as demoVariance } from "./variance";
import { demo as demoStructuralNominal } from "./structural-nominal";
import { demo as demoTypeSoundnessBoundary } from "./type-soundness-boundary";

export {
  demoTypeFoundations,
  demoTypeInferenceAnnotations,
  demoUnionsIntersections,
  demoNarrowingGuards,
  demoGenerics,
  demoConditionalMappedTypes,
  demoUtilityTypesPatterns,
  demoVariance,
  demoStructuralNominal,
  demoTypeSoundnessBoundary,
};

/** 运行所有类型系统演示 */
export function runAllDemos() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     jsts-language-core-system / 01-type-system                ║");
  console.log("║     Running all type system demonstrations...                 ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");

  demoTypeFoundations();
  demoTypeInferenceAnnotations();
  demoUnionsIntersections();
  demoNarrowingGuards();
  demoGenerics();
  demoConditionalMappedTypes();
  demoUtilityTypesPatterns();
  demoVariance();
  demoStructuralNominal();
  demoTypeSoundnessBoundary();

  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     All type system demonstrations completed ✅               ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("\n");
}

// 直接运行
if (require.main === module) {
  runAllDemos();
}
