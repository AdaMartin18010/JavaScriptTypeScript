/**
 * @file 07-js-ts-symmetric-difference 模块入口
 * @description
 * JavaScript / TypeScript 对称差分析 — 从集合论视角理解两个语言的关系。
 */

export { demo as demoJsOnlyRuntimeFeatures } from './01-js-only-runtime-features.js';
export { demo as demoTsOnlyCompileTimeFeatures } from './02-ts-only-compile-time-features.js';
export { demo as demoRuntimeImpactingTsFeatures } from './03-runtime-impacting-ts-features.js';
export { demo as demoWhatTsCannotCheck } from './04-what-ts-cannot-check.js';
export { demo as demoTsToJsReverseMapping } from './05-ts-to-js-reverse-mapping.js';

export async function runAllDemos(): Promise<void> {
  const { demo: demo1 } = await import('./01-js-only-runtime-features.js');
  const { demo: demo2 } = await import('./02-ts-only-compile-time-features.js');
  const { demo: demo3 } = await import('./03-runtime-impacting-ts-features.js');
  const { demo: demo4 } = await import('./04-what-ts-cannot-check.js');
  const { demo: demo5 } = await import('./05-ts-to-js-reverse-mapping.js');

  demo1();
  console.log('\n');
  demo2();
  console.log('\n');
  demo3();
  console.log('\n');
  demo4();
  console.log('\n');
  demo5();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runAllDemos();
}
