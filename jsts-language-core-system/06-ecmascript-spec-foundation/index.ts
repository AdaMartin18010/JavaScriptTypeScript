/**
 * @file 06-ecmascript-spec-foundation 模块入口
 * @description ECMAScript 规范基础：抽象操作、规范类型、内部方法、Completion Records
 */

export * as AbstractOperations from './abstract-operations.js';
export * as SpecTypes from './spec-types.js';
export * as InternalMethods from './internal-methods.js';
export * as CompletionRecords from './completion-records.js';

import { demo as abstractOpsDemo } from './abstract-operations.js';
import { demo as specTypesDemo } from './spec-types.js';
import { demo as internalMethodsDemo } from './internal-methods.js';
import { demo as completionRecordsDemo } from './completion-records.js';

export function demo(): void {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║     06 ECMAScript Spec Foundation 规范基础演示           ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  abstractOpsDemo();
  specTypesDemo();
  internalMethodsDemo();
  completionRecordsDemo();
}
