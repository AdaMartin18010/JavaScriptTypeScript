/**
 * @file 设计模式模块入口
 * @description GoF 23种设计模式完整实现
 */

// 创建型模式 (5种)
export * from './creational/abstract-factory';
export * from './creational/builder';
export * from './creational/factory';
export * from './creational/prototype';
export * from './creational/singleton';

// 结构型模式 (7种)
export * from './structural/adapter';
export * from './structural/bridge';
export * from './structural/composite';
export * from './structural/decorator';
export * from './structural/facade';
export * from './structural/flyweight';
export * from './structural/proxy';

// 行为型模式 (11种)
export * from './behavioral/chain-of-responsibility';
export * from './behavioral/command';
export * from './behavioral/interpreter';
export * from './behavioral/iterator';
export * from './behavioral/mediator';
export * from './behavioral/memento';
export * from './behavioral/observer';
export * from './behavioral/state';
export * from './behavioral/strategy';
export * from './behavioral/template-method';
export * from './behavioral/visitor';

// JS/TS 特定模式
export * from './js-ts-specific/mixin';
export * from './js-ts-specific/module';
