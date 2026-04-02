/**
 * @file JavaScript / TypeScript 对比分析模块入口
 * @description JS/TS 差异分析、互操作性、类型理论
 */

// 类型理论
export * as FormalTypeSystem from './type-theory/formal-type-system.js';

// JS 实现对比
export * as SingletonJs from './js-implementations/singleton-js.js';
export * as FactoryJs from './js-implementations/factory-js.js';

// 互操作性
export * as JsTsInterop from './interoperability/js-ts-interop.js';
