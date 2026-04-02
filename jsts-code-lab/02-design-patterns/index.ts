/**
 * @file 设计模式模块入口
 * @description GoF 23种设计模式完整实现
 */

// 创建型模式 (5种)
export * from './creational/abstract-factory.js';
export * from './creational/builder.js';
export * from './creational/factory.js';
export * from './creational/prototype.js';
export * from './creational/singleton.js';

// 结构型模式 (7种)
export * from './structural/adapter.js';
export * from './structural/bridge.js';
export * from './structural/composite.js';
export * from './structural/decorator.js';
export * from './structural/facade.js';
export * from './structural/flyweight.js';
export * from './structural/proxy.js';

// 行为型模式 (11种)
export * from './behavioral/chain-of-responsibility.js';
export * from './behavioral/command.js';
export * from './behavioral/interpreter.js';
export * from './behavioral/iterator.js';
export * from './behavioral/mediator.js';
export * from './behavioral/memento.js';
export * from './behavioral/observer.js';
export * from './behavioral/state.js';
export * from './behavioral/strategy.js';
export * from './behavioral/template-method.js';
export * from './behavioral/visitor.js';

// JS/TS 特定模式
export * from './js-ts-specific/mixin.js';
export * from './js-ts-specific/module.js';
