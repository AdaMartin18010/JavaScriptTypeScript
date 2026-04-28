/**
 * @file 设计模式模块入口
 * @description GoF 23种设计模式完整实现
 */

// 创建型模式 (5种)
export * as AbstractFactory from './creational/abstract-factory.js';
export * as Builder from './creational/builder.js';
export * as Factory from './creational/factory.js';
export * as Prototype from './creational/prototype.js';
export * as Singleton from './creational/singleton.js';

// 结构型模式 (7种)
export * as Adapter from './structural/adapter.js';
export * as Bridge from './structural/bridge.js';
export * as Composite from './structural/composite.js';
export * as Decorator from './structural/decorator.js';
export * as Facade from './structural/facade.js';
export * as Flyweight from './structural/flyweight.js';
export * as Proxy from './structural/proxy.js';

// 行为型模式 (11种)
export * as ChainOfResponsibility from './behavioral/chain-of-responsibility.js';
export * as Command from './behavioral/command.js';
export * as Interpreter from './behavioral/interpreter.js';
export * as Iterator from './behavioral/iterator.js';
export * as Mediator from './behavioral/mediator.js';
export * as Memento from './behavioral/memento.js';
export * as Observer from './behavioral/observer.js';
export * as State from './behavioral/state.js';
export * as Strategy from './behavioral/strategy.js';
export * as TemplateMethod from './behavioral/template-method.js';
export * as Visitor from './behavioral/visitor.js';

// JS/TS 特定模式
