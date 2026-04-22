/**
 * @file 05-execution-flow 模块入口
 * @description 执行流：Promise 状态机、async/await 展开、Top-Level Await
 */

export * as PromiseStateMachine from './promise-state-machine.js';
export * as AsyncTransform from './async-transform.js';
export * as TopLevelAwait from './top-level-await.js';

import { demo as promiseDemo } from './promise-state-machine.js';
import { demo as asyncTransformDemo } from './async-transform.js';
import { demo as topLevelAwaitDemo } from './top-level-await.js';

export async function demo(): Promise<void> {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║     05 Execution Flow 执行流演示                         ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  promiseDemo();
  await asyncTransformDemo();
  await topLevelAwaitDemo();
}
