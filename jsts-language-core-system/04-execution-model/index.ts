/**
 * @file 04-execution-model 模块入口
 * @description 执行模型：执行上下文、事件循环、内存管理、Agent/Realm
 */

export * as ExecutionContext from './execution-context.js';
export * as EventLoopSimulation from './event-loop-simulation.js';
export * as MemoryGC from './memory-gc.js';
export * as AgentRealm from './agent-realm.js';

import { demo as executionContextDemo } from './execution-context.js';
import { demo as eventLoopDemo } from './event-loop-simulation.js';
import { demo as memoryGCDemo } from './memory-gc.js';
import { demo as agentRealmDemo } from './agent-realm.js';

export function demo(): void {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║     04 Execution Model 执行模型演示                      ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  executionContextDemo();
  eventLoopDemo();
  memoryGCDemo();
  agentRealmDemo();
}
