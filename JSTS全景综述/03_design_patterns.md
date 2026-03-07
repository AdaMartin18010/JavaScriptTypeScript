# JavaScript/TypeScript 设计模式完全指南

> **版本**: 1.0
> **目标**: 全面梳理GoF 23种设计模式及现代JS/TS特有模式，提供类型安全的TypeScript实现

---

## 目录

- [JavaScript/TypeScript 设计模式完全指南](#javascripttypescript-设计模式完全指南)
  - [目录](#目录)
  - [1. 创建型模式](#1-创建型模式)
    - [1.1 单例模式 (Singleton Pattern)](#11-单例模式-singleton-pattern)
      - [定义与意图](#定义与意图)
      - [适用场景](#适用场景)
      - [先决条件](#先决条件)
      - [UML类图](#uml类图)
      - [TypeScript实现](#typescript实现)
      - [完整使用示例](#完整使用示例)
      - [反例（错误实现）](#反例错误实现)
      - [优缺点分析](#优缺点分析)
      - [与其他模式的关系](#与其他模式的关系)
      - [形式化论证](#形式化论证)
    - [1.2 工厂方法模式 (Factory Method Pattern)](#12-工厂方法模式-factory-method-pattern)
      - [定义与意图](#定义与意图-1)
      - [适用场景](#适用场景-1)
      - [先决条件](#先决条件-1)
      - [UML类图](#uml类图-1)
      - [TypeScript实现](#typescript实现-1)
      - [完整使用示例](#完整使用示例-1)
      - [反例（错误实现）](#反例错误实现-1)
      - [优缺点分析](#优缺点分析-1)
      - [与其他模式的关系](#与其他模式的关系-1)
    - [1.3 抽象工厂模式 (Abstract Factory Pattern)](#13-抽象工厂模式-abstract-factory-pattern)
      - [定义与意图](#定义与意图-2)
      - [适用场景](#适用场景-2)
      - [先决条件](#先决条件-2)
      - [UML类图](#uml类图-2)
      - [TypeScript实现](#typescript实现-2)
      - [完整使用示例](#完整使用示例-2)
      - [反例（错误实现）](#反例错误实现-2)
      - [优缺点分析](#优缺点分析-2)
      - [与其他模式的关系](#与其他模式的关系-2)
    - [1.4 建造者模式 (Builder Pattern)](#14-建造者模式-builder-pattern)
      - [定义与意图](#定义与意图-3)
      - [适用场景](#适用场景-3)
      - [先决条件](#先决条件-3)
      - [UML类图](#uml类图-3)
      - [TypeScript实现](#typescript实现-3)
      - [完整使用示例](#完整使用示例-3)
      - [反例（错误实现）](#反例错误实现-3)
      - [优缺点分析](#优缺点分析-3)
      - [与其他模式的关系](#与其他模式的关系-3)
    - [1.5 原型模式 (Prototype Pattern)](#15-原型模式-prototype-pattern)
      - [定义与意图](#定义与意图-4)
      - [适用场景](#适用场景-4)
      - [先决条件](#先决条件-4)
      - [UML类图](#uml类图-4)
      - [TypeScript实现](#typescript实现-4)
      - [完整使用示例](#完整使用示例-4)
      - [反例（错误实现）](#反例错误实现-4)
      - [优缺点分析](#优缺点分析-4)
      - [与其他模式的关系](#与其他模式的关系-4)
  - [2. 结构型模式](#2-结构型模式)
    - [2.1 适配器模式 (Adapter Pattern)](#21-适配器模式-adapter-pattern)
      - [定义与意图](#定义与意图-5)
      - [适用场景](#适用场景-5)
      - [先决条件](#先决条件-5)
      - [UML类图](#uml类图-5)
      - [TypeScript实现](#typescript实现-5)
      - [完整使用示例](#完整使用示例-5)
      - [反例（错误实现）](#反例错误实现-5)
      - [优缺点分析](#优缺点分析-5)
      - [与其他模式的关系](#与其他模式的关系-5)
    - [2.2 桥接模式 (Bridge Pattern)](#22-桥接模式-bridge-pattern)
      - [定义与意图](#定义与意图-6)
      - [适用场景](#适用场景-6)
      - [先决条件](#先决条件-6)
      - [UML类图](#uml类图-6)
      - [TypeScript实现](#typescript实现-6)
      - [完整使用示例](#完整使用示例-6)
      - [反例（错误实现）](#反例错误实现-6)
      - [优缺点分析](#优缺点分析-6)
      - [与其他模式的关系](#与其他模式的关系-6)
    - [2.3 组合模式 (Composite Pattern)](#23-组合模式-composite-pattern)
      - [定义与意图](#定义与意图-7)
      - [适用场景](#适用场景-7)
      - [先决条件](#先决条件-7)
      - [UML类图](#uml类图-7)
      - [TypeScript实现](#typescript实现-7)
      - [完整使用示例](#完整使用示例-7)
      - [反例（错误实现）](#反例错误实现-7)
      - [优缺点分析](#优缺点分析-7)
      - [与其他模式的关系](#与其他模式的关系-7)
    - [2.4 装饰器模式 (Decorator Pattern)](#24-装饰器模式-decorator-pattern)
      - [定义与意图](#定义与意图-8)
      - [适用场景](#适用场景-8)
      - [先决条件](#先决条件-8)
      - [UML类图](#uml类图-8)
      - [TypeScript实现](#typescript实现-8)
      - [完整使用示例](#完整使用示例-8)
      - [反例（错误实现）](#反例错误实现-8)
      - [优缺点分析](#优缺点分析-8)
      - [与其他模式的关系](#与其他模式的关系-8)
    - [2.5 外观模式 (Facade Pattern)](#25-外观模式-facade-pattern)
      - [定义与意图](#定义与意图-9)
      - [适用场景](#适用场景-9)
      - [先决条件](#先决条件-9)
      - [UML类图](#uml类图-9)
      - [TypeScript实现](#typescript实现-9)
      - [完整使用示例](#完整使用示例-9)
      - [反例（错误实现）](#反例错误实现-9)
      - [优缺点分析](#优缺点分析-9)
      - [与其他模式的关系](#与其他模式的关系-9)
    - [2.6 享元模式 (Flyweight Pattern)](#26-享元模式-flyweight-pattern)
      - [定义与意图](#定义与意图-10)
      - [适用场景](#适用场景-10)
      - [先决条件](#先决条件-10)
      - [UML类图](#uml类图-10)
      - [TypeScript实现](#typescript实现-10)
      - [完整使用示例](#完整使用示例-10)
      - [反例（错误实现）](#反例错误实现-10)
      - [优缺点分析](#优缺点分析-10)
      - [与其他模式的关系](#与其他模式的关系-10)
    - [2.7 代理模式 (Proxy Pattern)](#27-代理模式-proxy-pattern)
      - [定义与意图](#定义与意图-11)
      - [适用场景](#适用场景-11)
      - [先决条件](#先决条件-11)
      - [UML类图](#uml类图-11)
      - [TypeScript实现](#typescript实现-11)
      - [完整使用示例](#完整使用示例-11)
      - [反例（错误实现）](#反例错误实现-11)
      - [优缺点分析](#优缺点分析-11)
      - [与其他模式的关系](#与其他模式的关系-11)
  - [3. 行为型模式](#3-行为型模式)
    - [3.1 责任链模式 (Chain of Responsibility Pattern)](#31-责任链模式-chain-of-responsibility-pattern)
      - [定义与意图](#定义与意图-12)
      - [适用场景](#适用场景-12)
      - [先决条件](#先决条件-12)
      - [UML类图](#uml类图-12)
      - [TypeScript实现](#typescript实现-12)
      - [完整使用示例](#完整使用示例-12)
      - [反例（错误实现）](#反例错误实现-12)
      - [优缺点分析](#优缺点分析-12)
      - [与其他模式的关系](#与其他模式的关系-12)
    - [3.2 命令模式 (Command Pattern)](#32-命令模式-command-pattern)
      - [定义与意图](#定义与意图-13)
      - [适用场景](#适用场景-13)
      - [先决条件](#先决条件-13)
      - [UML类图](#uml类图-13)
      - [TypeScript实现](#typescript实现-13)
      - [完整使用示例](#完整使用示例-13)
      - [反例（错误实现）](#反例错误实现-13)
      - [优缺点分析](#优缺点分析-13)
      - [与其他模式的关系](#与其他模式的关系-13)
    - [3.3 解释器模式 (Interpreter Pattern)](#33-解释器模式-interpreter-pattern)
      - [定义与意图](#定义与意图-14)
      - [适用场景](#适用场景-14)
      - [先决条件](#先决条件-14)
      - [UML类图](#uml类图-14)
      - [TypeScript实现](#typescript实现-14)
      - [完整使用示例](#完整使用示例-14)
      - [反例（错误实现）](#反例错误实现-14)
      - [优缺点分析](#优缺点分析-14)
      - [与其他模式的关系](#与其他模式的关系-14)
    - [3.4 迭代器模式 (Iterator Pattern)](#34-迭代器模式-iterator-pattern)
      - [定义与意图](#定义与意图-15)
      - [适用场景](#适用场景-15)
      - [先决条件](#先决条件-15)
      - [UML类图](#uml类图-15)
      - [TypeScript实现](#typescript实现-15)
      - [完整使用示例](#完整使用示例-15)
      - [反例（错误实现）](#反例错误实现-15)
      - [优缺点分析](#优缺点分析-15)
      - [与其他模式的关系](#与其他模式的关系-15)
    - [3.5 中介者模式 (Mediator Pattern)](#35-中介者模式-mediator-pattern)
      - [定义与意图](#定义与意图-16)
      - [适用场景](#适用场景-16)
      - [先决条件](#先决条件-16)
      - [UML类图](#uml类图-16)
      - [TypeScript实现](#typescript实现-16)
      - [完整使用示例](#完整使用示例-16)
      - [反例（错误实现）](#反例错误实现-16)
      - [优缺点分析](#优缺点分析-16)
      - [与其他模式的关系](#与其他模式的关系-16)
    - [3.6 备忘录模式 (Memento Pattern)](#36-备忘录模式-memento-pattern)
      - [定义与意图](#定义与意图-17)
      - [适用场景](#适用场景-17)
      - [先决条件](#先决条件-17)
      - [UML类图](#uml类图-17)
      - [TypeScript实现](#typescript实现-17)
      - [完整使用示例](#完整使用示例-17)
      - [反例（错误实现）](#反例错误实现-17)
      - [优缺点分析](#优缺点分析-17)
      - [与其他模式的关系](#与其他模式的关系-17)
    - [3.7 观察者模式 (Observer Pattern)](#37-观察者模式-observer-pattern)
      - [定义与意图](#定义与意图-18)
      - [适用场景](#适用场景-18)
      - [先决条件](#先决条件-18)
      - [UML类图](#uml类图-18)
      - [TypeScript实现](#typescript实现-18)
      - [完整使用示例](#完整使用示例-18)
      - [反例（错误实现）](#反例错误实现-18)
      - [优缺点分析](#优缺点分析-18)
      - [与其他模式的关系](#与其他模式的关系-18)
    - [3.8 状态模式 (State Pattern)](#38-状态模式-state-pattern)
      - [定义与意图](#定义与意图-19)
      - [适用场景](#适用场景-19)
      - [先决条件](#先决条件-19)
      - [UML类图](#uml类图-19)
      - [TypeScript实现](#typescript实现-19)
      - [完整使用示例](#完整使用示例-19)
      - [反例（错误实现）](#反例错误实现-19)
      - [优缺点分析](#优缺点分析-19)
      - [与其他模式的关系](#与其他模式的关系-19)
    - [3.9 策略模式 (Strategy Pattern)](#39-策略模式-strategy-pattern)
      - [定义与意图](#定义与意图-20)
      - [适用场景](#适用场景-20)
      - [先决条件](#先决条件-20)
      - [UML类图](#uml类图-20)
      - [TypeScript实现](#typescript实现-20)
      - [完整使用示例](#完整使用示例-20)
      - [反例（错误实现）](#反例错误实现-20)
      - [优缺点分析](#优缺点分析-20)
      - [与其他模式的关系](#与其他模式的关系-20)
    - [3.10 模板方法模式 (Template Method Pattern)](#310-模板方法模式-template-method-pattern)
      - [定义与意图](#定义与意图-21)
      - [适用场景](#适用场景-21)
      - [先决条件](#先决条件-21)
      - [UML类图](#uml类图-21)
      - [TypeScript实现](#typescript实现-21)
      - [完整使用示例](#完整使用示例-21)
      - [反例（错误实现）](#反例错误实现-21)
      - [优缺点分析](#优缺点分析-21)
      - [与其他模式的关系](#与其他模式的关系-21)
    - [3.11 访问者模式 (Visitor Pattern)](#311-访问者模式-visitor-pattern)
      - [定义与意图](#定义与意图-22)
      - [适用场景](#适用场景-22)
      - [先决条件](#先决条件-22)
      - [UML类图](#uml类图-22)
      - [TypeScript实现](#typescript实现-22)
      - [完整使用示例](#完整使用示例-22)
      - [反例（错误实现）](#反例错误实现-22)
      - [优缺点分析](#优缺点分析-22)
      - [与其他模式的关系](#与其他模式的关系-22)
  - [4. 现代JS/TS特有模式](#4-现代jsts特有模式)
    - [4.1 模块模式 (Module Pattern)](#41-模块模式-module-pattern)
      - [定义与意图](#定义与意图-23)
      - [适用场景](#适用场景-23)
      - [TypeScript实现](#typescript实现-23)
      - [完整使用示例](#完整使用示例-23)
    - [4.2 揭示模块模式 (Revealing Module Pattern)](#42-揭示模块模式-revealing-module-pattern)
      - [定义与意图](#定义与意图-24)
      - [TypeScript实现](#typescript实现-24)
      - [完整使用示例](#完整使用示例-24)
    - [4.3 混入模式 (Mixin Pattern)](#43-混入模式-mixin-pattern)
      - [定义与意图](#定义与意图-25)
      - [TypeScript实现](#typescript实现-25)
      - [完整使用示例](#完整使用示例-25)
    - [4.4 高阶组件模式 (Higher-Order Component Pattern)](#44-高阶组件模式-higher-order-component-pattern)
      - [定义与意图](#定义与意图-26)
      - [TypeScript实现](#typescript实现-26)
      - [完整使用示例](#完整使用示例-26)
    - [4.5 组合优于继承模式 (Composition over Inheritance)](#45-组合优于继承模式-composition-over-inheritance)
      - [定义与意图](#定义与意图-27)
      - [TypeScript实现](#typescript实现-27)
      - [完整使用示例](#完整使用示例-27)
    - [4.6 依赖注入与控制反转 (Dependency Injection \& IoC)](#46-依赖注入与控制反转-dependency-injection--ioc)
      - [定义与意图](#定义与意图-28)
      - [TypeScript实现](#typescript实现-28)
      - [完整使用示例](#完整使用示例-28)
  - [5. 模式对比与选择指南](#5-模式对比与选择指南)
    - [5.1 创建型模式对比](#51-创建型模式对比)
    - [5.2 结构型模式对比](#52-结构型模式对比)
    - [5.3 行为型模式对比](#53-行为型模式对比)
    - [5.4 模式选择决策树](#54-模式选择决策树)
    - [5.5 SOLID原则与设计模式](#55-solid原则与设计模式)
    - [5.6 常见反模式](#56-常见反模式)
  - [6. 形式化论证总结](#6-形式化论证总结)
    - [6.1 设计模式的形式化基础](#61-设计模式的形式化基础)
      - [6.1.1 类型系统](#611-类型系统)
      - [6.1.2 子类型关系](#612-子类型关系)
      - [6.1.3 多态](#613-多态)
    - [6.2 模式的正确性条件](#62-模式的正确性条件)
    - [6.3 设计原则的数学表达](#63-设计原则的数学表达)
      - [开闭原则](#开闭原则)
      - [单一职责](#单一职责)
      - [依赖倒置](#依赖倒置)
  - [7. TypeScript最佳实践](#7-typescript最佳实践)
    - [7.1 类型安全的设计模式](#71-类型安全的设计模式)
    - [7.2 现代TypeScript特性](#72-现代typescript特性)
  - [8. 总结](#8-总结)
    - [8.1 设计模式的核心价值](#81-设计模式的核心价值)
    - [8.2 使用设计模式的建议](#82-使用设计模式的建议)
    - [8.3 学习路径](#83-学习路径)
  - [附录：快速参考](#附录快速参考)
    - [A. 模式速查表](#a-模式速查表)
    - [B. TypeScript装饰器速查](#b-typescript装饰器速查)

---

## 1. 创建型模式

创建型模式关注对象的创建机制，提供创建对象的灵活方式，将对象的创建与使用分离。

---

### 1.1 单例模式 (Singleton Pattern)

#### 定义与意图

**形式化定义**: 确保一个类只有一个实例，并提供一个全局访问点。

$$
\forall x, y \in \text{Singleton} : x = y
$$

**意图**: 控制唯一实例的创建，确保系统中某个类只有一个实例存在，并提供一个访问它的全局访问点。

#### 适用场景

- 需要严格控制唯一实例的场景（数据库连接池、配置管理器）
- 需要全局状态管理的场景
- 资源共享场景（线程池、缓存）
- 需要频繁创建和销毁的对象

#### 先决条件

- 实例化成本高
- 需要全局协调
- 状态需要保持一致

#### UML类图

```
┌─────────────────┐
│   Singleton     │
├─────────────────┤
│ -instance: T    │
│ -constructor()  │
├─────────────────┤
│ +getInstance()  │
│ +businessMethod()│
└─────────────────┘
```

#### TypeScript实现

```typescript
/**
 * 线程安全的单例模式实现
 * 使用静态属性和私有构造函数
 */
class Singleton {
  // 静态实例引用
  private static instance: Singleton | null = null;

  // 私有构造函数防止外部实例化
  private constructor() {
    // 初始化逻辑
    console.log('Singleton instance created');
  }

  /**
   * 获取唯一实例的全局访问点
   * 懒加载实现
   */
  public static getInstance(): Singleton {
    if (Singleton.instance === null) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }

  /**
   * 业务方法
   */
  public businessMethod(): void {
    console.log('Executing business logic');
  }

  /**
   * 获取实例标识（用于验证唯一性）
   */
  public getId(): string {
    return `Singleton@${this.constructor.name}`;
  }
}

// ============================================
// 饿汉式单例（立即初始化）
// ============================================
class EagerSingleton {
  private static instance: EagerSingleton = new EagerSingleton();

  private constructor() {}

  public static getInstance(): EagerSingleton {
    return EagerSingleton.instance;
  }
}

// ============================================
// 使用闭包实现的单例（更严格的封装）
// ============================================
const ClosureSingleton = (() => {
  let instance: { data: string; getData: () => string } | null = null;

  function createInstance(): { data: string; getData: () => string } {
    return {
      data: 'Singleton Data',
      getData(): string {
        return this.data;
      }
    };
  }

  return {
    getInstance(): { data: string; getData: () => string } {
      if (instance === null) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

// ============================================
// 泛型单例工厂（可复用的单例创建器）
// ============================================
class SingletonFactory<T> {
  private static instances: Map<string, unknown> = new Map();

  static getInstance<T>(
    key: string,
    factory: () => T
  ): T {
    if (!SingletonFactory.instances.has(key)) {
      SingletonFactory.instances.set(key, factory());
    }
    return SingletonFactory.instances.get(key) as T;
  }
}
```

#### 完整使用示例

```typescript
// 示例1：配置管理器单例
class AppConfig {
  private static instance: AppConfig | null = null;
  private config: Map<string, string> = new Map();

  private constructor() {
    // 加载默认配置
    this.config.set('apiUrl', 'https://api.example.com');
    this.config.set('timeout', '5000');
  }

  static getInstance(): AppConfig {
    if (AppConfig.instance === null) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  get(key: string): string | undefined {
    return this.config.get(key);
  }

  set(key: string, value: string): void {
    this.config.set(key, value);
  }
}

// 使用
const config1 = AppConfig.getInstance();
const config2 = AppConfig.getInstance();
console.log(config1 === config2); // true

config1.set('theme', 'dark');
console.log(config2.get('theme')); // 'dark' - 共享状态

// 示例2：数据库连接池单例
interface DatabaseConnection {
  query(sql: string): Promise<unknown[]>;
  close(): void;
}

class ConnectionPool {
  private static instance: ConnectionPool | null = null;
  private connections: DatabaseConnection[] = [];
  private maxConnections: number = 10;

  private constructor() {
    console.log('Initializing connection pool...');
  }

  static getInstance(): ConnectionPool {
    if (ConnectionPool.instance === null) {
      ConnectionPool.instance = new ConnectionPool();
    }
    return ConnectionPool.instance;
  }

  getConnection(): DatabaseConnection | null {
    return this.connections.length > 0
      ? this.connections.pop()!
      : null;
  }

  releaseConnection(conn: DatabaseConnection): void {
    if (this.connections.length < this.maxConnections) {
      this.connections.push(conn);
    }
  }
}
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：公开构造函数
class BadSingleton1 {
  // 公开构造函数 - 可以被多次实例化
  public constructor() {}
}
const a = new BadSingleton1();
const b = new BadSingleton1();
console.log(a === b); // false - 不是单例

// ❌ 错误2：实例引用不是静态的
class BadSingleton2 {
  private instance: BadSingleton2 | null = null; // 非静态！

  public static getInstance(): BadSingleton2 {
    // 每次调用都创建新实例
    return new BadSingleton2();
  }
}

// ❌ 错误3：没有空值检查
class BadSingleton3 {
  private static instance: BadSingleton3;

  public static getInstance(): BadSingleton3 {
    // 每次都会覆盖实例
    BadSingleton3.instance = new BadSingleton3();
    return BadSingleton3.instance;
  }
}

// ❌ 错误4：TypeScript中通过类型断言绕过私有构造函数
class BadSingleton4 {
  private constructor() {}
  static instance = new BadSingleton4();
}
// 可以通过 Object.create 绕过（运行时）
const bypassed = Object.create(BadSingleton4.prototype);
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 控制实例数量，节约资源 | 违反单一职责原则 |
| 全局访问点，方便使用 | 隐藏依赖关系，难以测试 |
| 懒加载，按需创建 | 多线程环境需要额外同步 |
| 避免重复创建高开销对象 | 与依赖注入原则冲突 |

#### 与其他模式的关系

- **工厂模式**: 单例可以看作工厂模式的特例（只生产一个产品）
- **外观模式**: 单例经常作为外观模式的实现方式
- **依赖注入**: 单例与DI容器常结合使用

#### 形式化论证

**唯一性证明**:

设 `S` 为单例类，`getInstance()` 为获取方法。

1. 初始状态: `S.instance = null`
2. 第一次调用 `getInstance()`: 创建实例 `s₁`，`S.instance = s₁`
3. 后续调用 `getInstance()`: 返回 `S.instance = s₁`
4. 由于构造函数私有，无法通过 `new S()` 创建实例

$$
\therefore \forall i, j \in \mathbb{N} : \text{getInstance}()_i = \text{getInstance}()_j
$$

---

### 1.2 工厂方法模式 (Factory Method Pattern)

#### 定义与意图

**形式化定义**: 定义一个创建对象的接口，让子类决定实例化哪一个类。工厂方法使一个类的实例化延迟到其子类。

$$
\text{Creator} \xrightarrow{\text{factoryMethod()}} \text{Product}
$$

**意图**: 将对象的创建与使用分离，通过子类化来变化创建的对象类型。

#### 适用场景

- 创建对象需要大量重复代码
- 创建对象需要访问某些信息（如配置），而调用者不应该知道
- 需要解耦对象的创建和使用
- 需要支持未来扩展新产品类型

#### 先决条件

- 产品具有共同的接口
- 创建逻辑可能变化
- 需要运行时决定产品类型

#### UML类图

```
        ┌─────────────────┐         ┌─────────────────┐
        │  <<interface>>  │         │  <<interface>>  │
        │    Product      │◄────────│     Creator     │
        └─────────────────┘         ├─────────────────┤
                ▲                   │ +factoryMethod()│
                │                   │ +operation()    │
        ┌───────┴───────┐           └─────────────────┘
        │               │                    ▲
   ┌────┴────┐    ┌────┴────┐        ┌───────┴───────┐
   │Concrete │    │Concrete │        │  Concrete     │
   │ProductA │    │ProductB │        │   Creator     │
   └─────────┘    └─────────┘        │+factoryMethod()│
                                     └───────────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 产品接口层次
// ============================================

/**
 * 产品接口 - 定义所有产品的通用操作
 */
interface Product {
  readonly name: string;
  operation(): string;
  getDescription(): string;
}

/**
 * 具体产品A
 */
class ConcreteProductA implements Product {
  readonly name = 'ProductA';

  operation(): string {
    return 'ConcreteProductA: Performing operation';
  }

  getDescription(): string {
    return 'This is Product A - High performance variant';
  }
}

/**
 * 具体产品B
 */
class ConcreteProductB implements Product {
  readonly name = 'ProductB';

  operation(): string {
    return 'ConcreteProductB: Performing operation differently';
  }

  getDescription(): string {
    return 'This is Product B - Resource efficient variant';
  }
}

// ============================================
// 创建者接口层次
// ============================================

/**
 * 创建者抽象类 - 声明工厂方法
 */
abstract class Creator {
  /**
   * 工厂方法 - 由子类实现
   */
  abstract factoryMethod(): Product;

  /**
   * 业务逻辑 - 使用工厂方法创建的产品
   */
  someOperation(): string {
    const product = this.factoryMethod();
    return `Creator: Working with ${product.name}\n${product.operation()}`;
  }

  /**
   * 获取产品描述
   */
  getProductInfo(): string {
    return this.factoryMethod().getDescription();
  }
}

/**
 * 具体创建者A - 创建产品A
 */
class ConcreteCreatorA extends Creator {
  factoryMethod(): Product {
    return new ConcreteProductA();
  }
}

/**
 * 具体创建者B - 创建产品B
 */
class ConcreteCreatorB extends Creator {
  factoryMethod(): Product {
    return new ConcreteProductB();
  }
}

// ============================================
// 参数化工厂方法（简化版）
// ============================================

type ProductType = 'A' | 'B';

class ParameterizedCreator {
  private productRegistry: Map<ProductType, new () => Product> = new Map();

  registerProduct(type: ProductType, productClass: new () => Product): void {
    this.productRegistry.set(type, productClass);
  }

  factoryMethod(type: ProductType): Product {
    const ProductClass = this.productRegistry.get(type);
    if (!ProductClass) {
      throw new Error(`Unknown product type: ${type}`);
    }
    return new ProductClass();
  }
}
```

#### 完整使用示例

```typescript
// 示例：UI组件工厂

// 产品接口
interface Button {
  render(): void;
  onClick(callback: () => void): void;
}

// 具体产品：Windows按钮
class WindowsButton implements Button {
  render(): void {
    console.log('Rendering Windows-style button');
  }

  onClick(callback: () => void): void {
    console.log('Windows button clicked');
    callback();
  }
}

// 具体产品：Mac按钮
class MacButton implements Button {
  render(): void {
    console.log('Rendering Mac-style button');
  }

  onClick(callback: () => void): void {
    console.log('Mac button clicked');
    callback();
  }
}

// 创建者
abstract class Dialog {
  abstract createButton(): Button;

  renderDialog(): void {
    const button = this.createButton();
    console.log('--- Dialog Rendering ---');
    button.render();
    button.onClick(() => console.log('Dialog closed'));
  }
}

// 具体创建者
class WindowsDialog extends Dialog {
  createButton(): Button {
    return new WindowsButton();
  }
}

class MacDialog extends Dialog {
  createButton(): Button {
    return new MacButton();
  }
}

// 使用
function createDialog(os: 'windows' | 'mac'): Dialog {
  if (os === 'windows') {
    return new WindowsDialog();
  }
  return new MacDialog();
}

const dialog = createDialog('windows');
dialog.renderDialog();
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：创建者直接实例化具体产品
class BadCreator {
  // 违反开闭原则，无法扩展新产品
  createProduct(type: string): Product {
    if (type === 'A') {
      return new ConcreteProductA();
    } else if (type === 'B') {
      return new ConcreteProductB();
    }
    throw new Error('Unknown type');
  }
}

// ❌ 错误2：工厂方法返回具体类型而非接口
class BadCreator2 {
  // 返回具体类型，违反依赖倒置原则
  factoryMethod(): ConcreteProductA {
    return new ConcreteProductA();
  }
}

// ❌ 错误3：工厂方法包含过多业务逻辑
abstract class BadCreator3 {
  abstract factoryMethod(): Product;

  someOperation(): string {
    const product = this.factoryMethod();
    // 过多的业务逻辑耦合
    if (product instanceof ConcreteProductA) {
      // 特殊处理A
    } else if (product instanceof ConcreteProductB) {
      // 特殊处理B
    }
    return '';
  }
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 符合开闭原则，易于扩展 | 代码复杂度增加 |
| 避免创建者与具体产品耦合 | 需要创建多个子类 |
| 单一职责，创建逻辑集中 | 简单场景可能过度设计 |
| 支持运行时切换产品 | 增加系统抽象层次 |

#### 与其他模式的关系

- **抽象工厂**: 工厂方法常用于实现抽象工厂
- **模板方法**: 创建者中的 `someOperation` 就是模板方法
- **原型模式**: 可以用原型模式替代工厂方法

---

### 1.3 抽象工厂模式 (Abstract Factory Pattern)

#### 定义与意图

**形式化定义**: 提供一个创建一系列相关或相互依赖对象的接口，而无需指定它们具体的类。

$$
\text{AbstractFactory} \xrightarrow{\text{createProductA()}} \text{ProductA} \\
\text{AbstractFactory} \xrightarrow{\text{createProductB()}} \text{ProductB}
$$

**意图**: 创建相关对象家族，确保产品之间的兼容性。

#### 适用场景

- 系统需要独立于产品的创建、组合和表示
- 系统需要配置多个产品系列之一
- 相关产品对象需要一起使用
- 需要提供产品类库，只暴露接口不暴露实现

#### 先决条件

- 存在多个产品系列
- 产品之间有依赖关系
- 需要保证产品兼容性

#### UML类图

```
┌─────────────────────────────────────────────────────────┐
│                    Client                                │
│  ┌─────────────────┐    ┌─────────────────┐             │
│  │  AbstractFactory│    │  AbstractProduct│             │
│  │  +createA()     │◄───│  +operation()   │             │
│  │  +createB()     │    └─────────────────┘             │
│  └────────┬────────┘           ▲                        │
│           ▲                    │                        │
└───────────┼────────────────────┼────────────────────────┘
            │            ┌───────┴───────┐
    ┌───────┴───────┐    │               │
    │               │  ┌─┴─┐           ┌─┴─┐
┌───┴───┐     ┌────┴┐ │A1 │           │A2 │
│Factory│     │Factory│ └───┘           └───┘
│   1   │     │   2   │
└───┬───┘     └───┬───┘
    │             │
┌───┴───┐     ┌───┴───┐
│createA│     │createA│
│createB│     │createB│
└───┬───┘     └───┬───┘
    │             │
  ┌─┴─┐         ┌─┴─┐
  │B1 │         │B2 │
  └───┘         └───┘
```

#### TypeScript实现

```typescript
// ============================================
// 抽象产品接口
// ============================================

/**
 * 按钮产品接口
 */
interface Button {
  render(): void;
  onClick(callback: () => void): void;
}

/**
 * 复选框产品接口
 */
interface Checkbox {
  render(): void;
  toggle(): void;
  isChecked(): boolean;
}

/**
 * 文本框产品接口
 */
interface TextField {
  render(): void;
  setValue(value: string): void;
  getValue(): string;
}

// ============================================
// 抽象工厂接口
// ============================================

/**
 * 抽象工厂 - UI组件工厂
 */
interface GUIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
  createTextField(): TextField;
}

// ============================================
// Windows风格产品族
// ============================================

class WindowsButton implements Button {
  render(): void {
    console.log('Rendering Windows-style button [□]');
  }

  onClick(callback: () => void): void {
    console.log('Windows button clicked');
    callback();
  }
}

class WindowsCheckbox implements Checkbox {
  private checked = false;

  render(): void {
    const state = this.checked ? '[X]' : '[ ]';
    console.log(`Rendering Windows-style checkbox ${state}`);
  }

  toggle(): void {
    this.checked = !this.checked;
  }

  isChecked(): boolean {
    return this.checked;
  }
}

class WindowsTextField implements TextField {
  private value = '';

  render(): void {
    console.log(`Rendering Windows-style text field: "${this.value}"`);
  }

  setValue(value: string): void {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }
}

// ============================================
// Mac风格产品族
// ============================================

class MacButton implements Button {
  render(): void {
    console.log('Rendering Mac-style button (●)');
  }

  onClick(callback: () => void): void {
    console.log('Mac button clicked');
    callback();
  }
}

class MacCheckbox implements Checkbox {
  private checked = false;

  render(): void {
    const state = this.checked ? '(●)' : '(○)';
    console.log(`Rendering Mac-style checkbox ${state}`);
  }

  toggle(): void {
    this.checked = !this.checked;
  }

  isChecked(): boolean {
    return this.checked;
  }
}

class MacTextField implements TextField {
  private value = '';

  render(): void {
    console.log(`Rendering Mac-style text field: "${this.value}"`);
  }

  setValue(value: string): void {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }
}

// ============================================
// 具体工厂
// ============================================

class WindowsFactory implements GUIFactory {
  createButton(): Button {
    return new WindowsButton();
  }

  createCheckbox(): Checkbox {
    return new WindowsCheckbox();
  }

  createTextField(): TextField {
    return new WindowsTextField();
  }
}

class MacFactory implements GUIFactory {
  createButton(): Button {
    return new MacButton();
  }

  createCheckbox(): Checkbox {
    return new MacCheckbox();
  }

  createTextField(): TextField {
    return new MacTextField();
  }
}

// ============================================
// 客户端应用
// ============================================

class Application {
  private factory: GUIFactory;
  private button: Button;
  private checkbox: Checkbox;
  private textField: TextField;

  constructor(factory: GUIFactory) {
    this.factory = factory;
    this.button = factory.createButton();
    this.checkbox = factory.createCheckbox();
    this.textField = factory.createTextField();
  }

  renderUI(): void {
    console.log('--- Rendering Application UI ---');
    this.button.render();
    this.checkbox.render();
    this.textField.render();
  }

  getButton(): Button {
    return this.button;
  }
}
```

#### 完整使用示例

```typescript
// 工厂提供者 - 根据配置返回合适的工厂
class FactoryProvider {
  static getFactory(os: 'windows' | 'mac'): GUIFactory {
    switch (os) {
      case 'windows':
        return new WindowsFactory();
      case 'mac':
        return new MacFactory();
      default:
        throw new Error(`Unsupported OS: ${os}`);
    }
  }
}

// 使用
const os = 'mac'; // 可以从配置读取
const factory = FactoryProvider.getFactory(os);
const app = new Application(factory);
app.renderUI();

// 输出：
// --- Rendering Application UI ---
// Rendering Mac-style button (●)
// Rendering Mac-style checkbox (○)
// Rendering Mac-style text field: ""
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：工厂返回不兼容的产品
class BadFactory implements GUIFactory {
  createButton(): Button {
    return new WindowsButton();
  }

  createCheckbox(): Checkbox {
    // 错误：返回Mac风格的复选框，与Windows按钮不兼容
    return new MacCheckbox();
  }

  createTextField(): TextField {
    return new WindowsTextField();
  }
}

// ❌ 错误2：工厂方法签名不一致
interface BadGUIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
  // 缺少createTextField，违反接口隔离
}

// ❌ 错误3：客户端直接实例化产品
class BadApplication {
  constructor() {
    // 直接依赖具体产品
    this.button = new WindowsButton(); // 错误！
  }
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 确保产品族的一致性 | 增加代码复杂度 |
| 符合开闭原则 | 新增产品族困难 |
| 隔离具体类 | 需要大量接口和类 |
| 易于切换产品族 | 扩展新产品类型困难 |

#### 与其他模式的关系

- **工厂方法**: 抽象工厂通常用工厂方法实现
- **单例**: 工厂通常是单例
- **原型**: 可以用原型模式实现抽象工厂

---

### 1.4 建造者模式 (Builder Pattern)

#### 定义与意图

**形式化定义**: 将一个复杂对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示。

$$
\text{Director} \xrightarrow{\text{construct()}} \text{Builder} \xrightarrow{\text{buildPart()}} \text{Product}
$$

**意图**: 分步骤创建复杂对象，允许使用相同的创建代码生成不同类型和形式的对象。

#### 适用场景

- 创建复杂对象需要多个步骤
- 需要创建不同表示的相似对象
- 构造过程需要独立于组成部分
- 需要控制构造过程的顺序

#### 先决条件

- 对象构造复杂
- 存在多种构造变体
- 需要延迟某些属性的设置

#### UML类图

```
┌─────────────┐         ┌─────────────────┐
│   Director  │────────►│     Builder     │
│             │         │ <<interface>>   │
│ construct() │         │ +buildPartA()   │
└─────────────┘         │ +buildPartB()   │
                        │ +getResult()    │
                        └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────┴─────┐            ┌─────┴─────┐
              │ Concrete  │            │ Concrete  │
              │ Builder1  │            │ Builder2  │
              └─────┬─────┘            └─────┬─────┘
                    │                        │
                    └──────────┬─────────────┘
                               │
                          ┌────┴────┐
                          │ Product │
                          └─────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 产品类
// ============================================

/**
 * 复杂产品 - 电脑
 */
class Computer {
  private cpu: string = '';
  private ram: string = '';
  private storage: string = '';
  private gpu: string = '';
  private hasWifi: boolean = false;
  private hasBluetooth: boolean = false;

  setCPU(cpu: string): void {
    this.cpu = cpu;
  }

  setRAM(ram: string): void {
    this.ram = ram;
  }

  setStorage(storage: string): void {
    this.storage = storage;
  }

  setGPU(gpu: string): void {
    this.gpu = gpu;
  }

  setWifi(hasWifi: boolean): void {
    this.hasWifi = hasWifi;
  }

  setBluetooth(hasBluetooth: boolean): void {
    this.hasBluetooth = hasBluetooth;
  }

  getSpecs(): string {
    return `
Computer Specifications:
  CPU: ${this.cpu}
  RAM: ${this.ram}
  Storage: ${this.storage}
  GPU: ${this.gpu}
  WiFi: ${this.hasWifi}
  Bluetooth: ${this.hasBluetooth}
    `.trim();
  }
}

// ============================================
// 建造者接口
// ============================================

interface ComputerBuilder {
  reset(): void;
  setCPU(cpu: string): this;
  setRAM(ram: string): this;
  setStorage(storage: string): this;
  setGPU(gpu: string): this;
  setWifi(enabled: boolean): this;
  setBluetooth(enabled: boolean): this;
  build(): Computer;
}

// ============================================
// 具体建造者
// ============================================

class ConcreteComputerBuilder implements ComputerBuilder {
  private computer: Computer;

  constructor() {
    this.computer = new Computer();
  }

  reset(): void {
    this.computer = new Computer();
  }

  setCPU(cpu: string): this {
    this.computer.setCPU(cpu);
    return this;
  }

  setRAM(ram: string): this {
    this.computer.setRAM(ram);
    return this;
  }

  setStorage(storage: string): this {
    this.computer.setStorage(storage);
    return this;
  }

  setGPU(gpu: string): this {
    this.computer.setGPU(gpu);
    return this;
  }

  setWifi(enabled: boolean): this {
    this.computer.setWifi(enabled);
    return this;
  }

  setBluetooth(enabled: boolean): this {
    this.computer.setBluetooth(enabled);
    return this;
  }

  build(): Computer {
    const result = this.computer;
    this.reset();
    return result;
  }
}

// ============================================
// 指导者（可选）
// ============================================

class ComputerDirector {
  private builder: ComputerBuilder;

  constructor(builder: ComputerBuilder) {
    this.builder = builder;
  }

  setBuilder(builder: ComputerBuilder): void {
    this.builder = builder;
  }

  buildGamingComputer(): Computer {
    return this.builder
      .setCPU('Intel i9-13900K')
      .setRAM('64GB DDR5')
      .setStorage('2TB NVMe SSD')
      .setGPU('RTX 4090')
      .setWifi(true)
      .setBluetooth(true)
      .build();
  }

  buildOfficeComputer(): Computer {
    return this.builder
      .setCPU('Intel i5-13400')
      .setRAM('16GB DDR4')
      .setStorage('512GB SSD')
      .setGPU('Integrated')
      .setWifi(true)
      .setBluetooth(false)
      .build();
  }

  buildBudgetComputer(): Computer {
    return this.builder
      .setCPU('AMD Ryzen 5 5600')
      .setRAM('8GB DDR4')
      .setStorage('256GB SSD')
      .setGPU('Integrated')
      .setWifi(false)
      .setBluetooth(false)
      .build();
  }
}
```

#### 完整使用示例

```typescript
// 方式1：使用链式调用（流式接口）
const builder = new ConcreteComputerBuilder();
const customComputer = builder
  .setCPU('AMD Ryzen 9 7950X')
  .setRAM('32GB DDR5')
  .setStorage('1TB NVMe SSD')
  .setGPU('RTX 4080')
  .setWifi(true)
  .setBluetooth(true)
  .build();

console.log(customComputer.getSpecs());

// 方式2：使用指导者
const director = new ComputerDirector(new ConcreteComputerBuilder());
const gamingPC = director.buildGamingComputer();
const officePC = director.buildOfficeComputer();

console.log(gamingPC.getSpecs());
console.log(officePC.getSpecs());

// 方式3：分步构建（适用于需要条件判断的场景）
const stepBuilder = new ConcreteComputerBuilder();
stepBuilder.setCPU('Intel i7-13700K');

const needHighRAM = true;
if (needHighRAM) {
  stepBuilder.setRAM('32GB DDR5');
} else {
  stepBuilder.setRAM('16GB DDR5');
}

const needGPU = true;
if (needGPU) {
  stepBuilder.setGPU('RTX 4070');
}

const conditionalPC = stepBuilder.build();
console.log(conditionalPC.getSpecs());
```

#### 反例（错误实现）

```typescript
// ❌ 错误1： telescoping constructor（构造函数参数爆炸）
class BadComputer {
  constructor(
    cpu: string,
    ram: string,
    storage: string,
    gpu?: string,
    hasWifi?: boolean,
    hasBluetooth?: boolean,
    // ... 更多参数
  ) {
    // 难以使用，参数顺序容易出错
  }
}
// 使用：new BadComputer('i7', '16GB', '512GB', undefined, true, false)

// ❌ 错误2：setter链导致对象处于不一致状态
class BadComputer2 {
  private cpu = '';
  private ram = '';

  setCPU(cpu: string): void {
    this.cpu = cpu;
  }

  setRAM(ram: string): void {
    this.ram = ram;
  }

  // 问题：可以在不设置必需属性的情况下使用
  operate(): void {
    // cpu或ram可能为空
  }
}

// ❌ 错误3：建造者不返回this，无法链式调用
class BadBuilder {
  setCPU(cpu: string): void { // 返回void
    this.cpu = cpu;
  }
  // 无法链式调用
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 分步构建，控制精细 | 代码量增加 |
| 避免构造函数参数爆炸 | 需要创建多个类 |
| 复用相同的构建代码 | 简单对象可能过度设计 |
| 构建过程可延迟 | 增加复杂度 |

#### 与其他模式的关系

- **工厂方法**: 建造者专注于复杂对象的逐步构建
- **组合模式**: 常用于构建树形结构
- **桥接模式**: 建造者可以创建桥接模式的产品

---

### 1.5 原型模式 (Prototype Pattern)

#### 定义与意图

**形式化定义**: 用原型实例指定创建对象的种类，并通过复制这些原型创建新对象。

$$
\text{Prototype} \xrightarrow{\text{clone()}} \text{Prototype}'
$$

**意图**: 通过复制现有对象来创建新对象，而不是从头构建。

#### 适用场景

- 创建对象的成本较高
- 需要避免与产品类层次耦合
- 需要创建的对象与现有对象相似
- 运行时决定创建的对象类型

#### 先决条件

- 对象可以安全地复制
- 存在复杂对象的配置模板
- 需要保留对象的历史状态

#### UML类图

```
┌─────────────────────────────────────┐
│         <<interface>>               │
│          Prototype                  │
│         +clone(): Prototype         │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
   ┌────┴────┐         ┌────┴────┐
   │Concrete │         │Concrete │
   │Prototype1          │Prototype2
   │+clone() │         │+clone() │
   └─────────┘         └─────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 原型接口
// ============================================

/**
 * 原型接口 - 定义克隆方法
 */
interface Prototype<T> {
  clone(): T;
}

// ============================================
// 具体原型类
// ============================================

/**
 * 形状基类
 */
abstract class Shape implements Prototype<Shape> {
  protected x: number;
  protected y: number;
  protected color: string;

  constructor(source?: Shape) {
    if (source) {
      this.x = source.x;
      this.y = source.y;
      this.color = source.color;
    } else {
      this.x = 0;
      this.y = 0;
      this.color = 'black';
    }
  }

  abstract clone(): Shape;
  abstract draw(): void;

  move(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  setColor(color: string): void {
    this.color = color;
  }

  getInfo(): string {
    return `Shape at (${this.x}, ${this.y}) with color ${this.color}`;
  }
}

/**
 * 圆形
 */
class Circle extends Shape {
  private radius: number;

  constructor(source?: Circle) {
    super(source);
    this.radius = source ? source.radius : 0;
  }

  clone(): Circle {
    return new Circle(this);
  }

  draw(): void {
    console.log(`Drawing circle at (${this.x}, ${this.y}) with radius ${this.radius}`);
  }

  setRadius(radius: number): void {
    this.radius = radius;
  }

  getRadius(): number {
    return this.radius;
  }
}

/**
 * 矩形
 */
class Rectangle extends Shape {
  private width: number;
  private height: number;

  constructor(source?: Rectangle) {
    super(source);
    this.width = source ? source.width : 0;
    this.height = source ? source.height : 0;
  }

  clone(): Rectangle {
    return new Rectangle(this);
  }

  draw(): void {
    console.log(`Drawing rectangle at (${this.x}, ${this.y}) with size ${this.width}x${this.height}`);
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
}

/**
 * 复杂对象 - 包含引用类型
 */
class Document implements Prototype<Document> {
  private title: string;
  private content: string;
  private metadata: Map<string, string>;
  private author: Author;

  constructor(source?: Document) {
    if (source) {
      this.title = source.title;
      this.content = source.content;
      // 深拷贝引用类型
      this.metadata = new Map(source.metadata);
      this.author = source.author.clone();
    } else {
      this.title = '';
      this.content = '';
      this.metadata = new Map();
      this.author = new Author('');
    }
  }

  clone(): Document {
    return new Document(this);
  }

  setTitle(title: string): void {
    this.title = title;
  }

  setContent(content: string): void {
    this.content = content;
  }

  setMetadata(key: string, value: string): void {
    this.metadata.set(key, value);
  }

  setAuthor(author: Author): void {
    this.author = author;
  }

  getInfo(): string {
    return `Document: ${this.title} by ${this.author.getName()}`;
  }

  // 验证深拷贝
  getMetadataRef(): Map<string, string> {
    return this.metadata;
  }
}

class Author implements Prototype<Author> {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  clone(): Author {
    return new Author(this.name);
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }
}

// ============================================
// 原型注册表
// ============================================

class PrototypeRegistry {
  private prototypes: Map<string, Shape> = new Map();

  register(name: string, prototype: Shape): void {
    this.prototypes.set(name, prototype);
  }

  create(name: string): Shape | null {
    const prototype = this.prototypes.get(name);
    return prototype ? prototype.clone() : null;
  }

  getRegisteredNames(): string[] {
    return Array.from(this.prototypes.keys());
  }
}
```

#### 完整使用示例

```typescript
// 示例1：基本克隆
const originalCircle = new Circle();
originalCircle.move(10, 20);
originalCircle.setColor('red');
originalCircle.setRadius(50);

const clonedCircle = originalCircle.clone();
clonedCircle.move(30, 40); // 独立的位置
clonedCircle.setColor('blue'); // 独立的颜色

console.log(originalCircle.getInfo()); // Shape at (10, 20) with color red
console.log(clonedCircle.getInfo());   // Shape at (30, 40) with color blue

// 示例2：深拷贝验证
const doc1 = new Document();
doc1.setTitle('Original');
doc1.setMetadata('version', '1.0');
doc1.setAuthor(new Author('Alice'));

const doc2 = doc1.clone();
doc2.setTitle('Clone');
doc2.setMetadata('version', '2.0');
doc2.setAuthor(new Author('Bob'));

console.log(doc1.getInfo()); // Document: Original by Alice
console.log(doc2.getInfo()); // Document: Clone by Bob

// 验证深拷贝 - metadata引用不同
console.log(doc1.getMetadataRef() === doc2.getMetadataRef()); // false

// 示例3：原型注册表
const registry = new PrototypeRegistry();

// 注册原型
const redCircle = new Circle();
redCircle.setColor('red');
redCircle.setRadius(100);
registry.register('red-circle', redCircle);

const blueRectangle = new Rectangle();
blueRectangle.setColor('blue');
blueRectangle.setSize(200, 100);
registry.register('blue-rectangle', blueRectangle);

// 从注册表创建对象
const circle1 = registry.create('red-circle');
const circle2 = registry.create('red-circle');
circle1?.move(0, 0);
circle2?.move(100, 100);

console.log(circle1?.getInfo()); // Shape at (0, 0) with color red
console.log(circle2?.getInfo()); // Shape at (100, 100) with color red
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：浅拷贝导致引用问题
class BadDocument implements Prototype<BadDocument> {
  private metadata: Map<string, string> = new Map();

  clone(): BadDocument {
    const clone = new BadDocument();
    clone.metadata = this.metadata; // 浅拷贝！共享引用
    return clone;
  }
}

// 问题：修改一个会影响另一个
const doc1 = new BadDocument();
doc1.setMetadata('key', 'value1');
const doc2 = doc1.clone();
doc2.setMetadata('key', 'value2');
// doc1的metadata也被修改了！

// ❌ 错误2：使用Object.assign进行浅拷贝
class BadShape {
  private nested = { x: 0, y: 0 };

  clone(): BadShape {
    return Object.assign(new BadShape(), this); // 浅拷贝问题
  }
}

// ❌ 错误3：没有复制构造函数，手动复制容易遗漏
class BadPrototype {
  private a: string;
  private b: number;
  private c: boolean;
  // ... 更多字段

  clone(): BadPrototype {
    const clone = new BadPrototype();
    clone.a = this.a;
    clone.b = this.b;
    // 遗漏了c！
    return clone;
  }
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 无需知道对象的具体类 | 克隆复杂对象可能困难 |
| 避免重复的初始化代码 | 深拷贝实现复杂 |
| 运行时添加/删除产品 | 循环引用处理困难 |
| 保留对象的历史状态 | 某些语言不支持克隆 |

#### 与其他模式的关系

- **抽象工厂**: 原型可以作为抽象工厂的一种替代
- **组合模式**: 原型模式可以复制复杂的组合结构
- **装饰器模式**: 可以克隆并装饰对象

---

## 2. 结构型模式

结构型模式关注如何组合类和对象以形成更大的结构。

---

### 2.1 适配器模式 (Adapter Pattern)

#### 定义与意图

**形式化定义**: 将一个类的接口转换成客户希望的另外一个接口。适配器模式使得原本由于接口不兼容而不能一起工作的那些类可以一起工作。

$$
\text{Client} \xrightarrow{\text{Target Interface}} \text{Adapter} \xrightarrow{\text{Adaptee Interface}} \text{Adaptee}
$$

**意图**: 解决接口不兼容问题，使不兼容的接口能够协同工作。

#### 适用场景

- 使用已有的类，但其接口不符合需求
- 创建可复用的类，与不相关或不可预见的类协同工作
- 需要统一多个类的接口
- 需要使用第三方库但接口不匹配

#### 先决条件

- 存在不兼容的接口
- 需要复用现有类
- 无法修改现有类的接口

#### UML类图

```
┌─────────────┐         ┌──────────────┐
│   Client    │────────►│    Target    │
│             │         │ <<interface>>│
└─────────────┘         │  +request()  │
                        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │    Adapter   │
                        │  +request()  │
                        │  -adaptee    │
                        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │    Adaptee   │
                        │+specificReq()│
                        └──────────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 目标接口（客户端期望的接口）
// ============================================

/**
 * 目标接口 - 媒体播放器标准接口
 */
interface MediaPlayer {
  play(audioType: string, fileName: string): void;
}

// ============================================
// 被适配者（已有的不兼容接口）
// ============================================

/**
 * 高级媒体播放器 - 支持MP4和VLC
 */
interface AdvancedMediaPlayer {
  playVlc(fileName: string): void;
  playMp4(fileName: string): void;
}

class VlcPlayer implements AdvancedMediaPlayer {
  playVlc(fileName: string): void {
    console.log(`Playing vlc file: ${fileName}`);
  }

  playMp4(fileName: string): void {
    // VLC不支持MP4
  }
}

class Mp4Player implements AdvancedMediaPlayer {
  playVlc(fileName: string): void {
    // MP4播放器不支持VLC
  }

  playMp4(fileName: string): void {
    console.log(`Playing mp4 file: ${fileName}`);
  }
}

// ============================================
// 适配器
// ============================================

/**
 * 媒体适配器 - 将AdvancedMediaPlayer适配为MediaPlayer
 */
class MediaAdapter implements MediaPlayer {
  private advancedMusicPlayer: AdvancedMediaPlayer | null = null;

  constructor(audioType: string) {
    if (audioType === 'vlc') {
      this.advancedMusicPlayer = new VlcPlayer();
    } else if (audioType === 'mp4') {
      this.advancedMusicPlayer = new Mp4Player();
    }
  }

  play(audioType: string, fileName: string): void {
    if (audioType === 'vlc' && this.advancedMusicPlayer) {
      this.advancedMusicPlayer.playVlc(fileName);
    } else if (audioType === 'mp4' && this.advancedMusicPlayer) {
      this.advancedMusicPlayer.playMp4(fileName);
    }
  }
}

/**
 * 音频播放器 - 客户端类
 */
class AudioPlayer implements MediaPlayer {
  private mediaAdapter: MediaAdapter | null = null;

  play(audioType: string, fileName: string): void {
    // 内置支持MP3
    if (audioType === 'mp3') {
      console.log(`Playing mp3 file: ${fileName}`);
    }
    // 使用适配器支持其他格式
    else if (audioType === 'vlc' || audioType === 'mp4') {
      this.mediaAdapter = new MediaAdapter(audioType);
      this.mediaAdapter.play(audioType, fileName);
    }
    else {
      console.log(`Invalid media. ${audioType} format not supported`);
    }
  }
}

// ============================================
// 对象适配器 vs 类适配器
// ============================================

// 对象适配器（组合）- 推荐
class ObjectAdapter implements MediaPlayer {
  constructor(private adaptee: AdvancedMediaPlayer) {}

  play(audioType: string, fileName: string): void {
    if (audioType === 'vlc') {
      this.adaptee.playVlc(fileName);
    } else if (audioType === 'mp4') {
      this.adaptee.playMp4(fileName);
    }
  }
}
```

#### 完整使用示例

```typescript
// 示例：第三方API适配

// 第三方支付接口（不可修改）
class ThirdPartyPayment {
  makePayment(amount: number, currency: string): boolean {
    console.log(`Processing ${amount} ${currency} via third-party`);
    return true;
  }

  checkStatus(transactionId: string): string {
    return 'completed';
  }
}

// 我们的标准支付接口
interface PaymentProcessor {
  processPayment(amount: number): boolean;
  getPaymentStatus(paymentId: string): 'pending' | 'completed' | 'failed';
}

// 支付适配器
class PaymentAdapter implements PaymentProcessor {
  private thirdPartyPayment: ThirdPartyPayment;
  private currency: string;

  constructor(currency: string = 'USD') {
    this.thirdPartyPayment = new ThirdPartyPayment();
    this.currency = currency;
  }

  processPayment(amount: number): boolean {
    return this.thirdPartyPayment.makePayment(amount, this.currency);
  }

  getPaymentStatus(paymentId: string): 'pending' | 'completed' | 'failed' {
    const status = this.thirdPartyPayment.checkStatus(paymentId);
    if (status === 'completed') return 'completed';
    if (status === 'failed') return 'failed';
    return 'pending';
  }
}

// 使用
const paymentProcessor: PaymentProcessor = new PaymentAdapter('USD');
paymentProcessor.processPayment(100);
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：修改客户端代码来适应被适配者
class BadClient {
  // 客户端不应该知道被适配者的存在
  constructor(private adaptee: AdvancedMediaPlayer) {}

  doSomething(): void {
    // 直接调用被适配者的方法，违反适配器模式意图
    this.adaptee.playVlc('file.vlc');
  }
}

// ❌ 错误2：适配器暴露被适配者的接口
class BadAdapter implements MediaPlayer {
  public adaptee: AdvancedMediaPlayer; // 不应该暴露

  constructor(adaptee: AdvancedMediaPlayer) {
    this.adaptee = adaptee;
  }

  play(audioType: string, fileName: string): void {
    // ...
  }
}

// ❌ 错误3：适配器包含过多业务逻辑
class BadAdapter2 implements MediaPlayer {
  constructor(private adaptee: AdvancedMediaPlayer) {}

  play(audioType: string, fileName: string): void {
    // 适配器应该只做接口转换，不应该有业务逻辑
    if (fileName.includes('premium')) {
      // 验证用户权限...
      // 记录日志...
      // 太多职责！
    }
    this.adaptee.playVlc(fileName);
  }
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 解耦客户端和目标类 | 增加代码复杂度 |
| 复用现有类 | 可能需要多个适配器 |
| 符合开闭原则 | 过多适配器导致系统混乱 |
| 增加系统透明度 | 调试困难 |

#### 与其他模式的关系

- **桥接模式**: 桥接预先设计，适配器是事后补救
- **装饰器模式**: 装饰器增强功能，适配器改变接口
- **代理模式**: 代理控制访问，适配器改变接口

---

### 2.2 桥接模式 (Bridge Pattern)

#### 定义与意图

**形式化定义**: 将抽象部分与它的实现部分分离，使它们都可以独立地变化。

$$
\text{Abstraction} \leftrightarrow \text{Implementation} \\
\text{（独立变化）} \quad \text{（独立变化）}
$$

**意图**: 将继承关系转换为组合关系，减少类的数量。

#### 适用场景

- 需要避免抽象和实现之间的永久绑定
- 抽象和实现都需要通过子类扩展
- 实现细节应该对客户透明
- 需要在多个对象间共享实现

#### 先决条件

- 存在两个独立变化的维度
- 需要运行时切换实现
- 类的数量呈爆炸式增长

#### UML类图

```
      Abstraction                    Implementation
      ┌──────────────┐               ┌──────────────┐
      │  +operation()│──────────────►│+operationImpl│
      │  -implementor│               │   ()         │
      └───────┬──────┘               └──────┬───────┘
              │                              │
      ┌───────┴──────┐              ┌────────┴────────┐
      │              │              │                 │
┌─────┴─────┐  ┌─────┴─────┐  ┌────┴───┐        ┌────┴───┐
│Refined    │  │Refined    │  │Concrete│        │Concrete│
│Abstraction│  │Abstraction│  │Impl A  │        │Impl B  │
│   A       │  │   B       │  └────────┘        └────────┘
└───────────┘  └───────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 实现部分接口
// ============================================

/**
 * 颜色接口 - 实现维度
 */
interface Color {
  applyColor(): string;
  getHexCode(): string;
}

/**
 * 具体实现：红色
 */
class RedColor implements Color {
  applyColor(): string {
    return 'Applying red color';
  }

  getHexCode(): string {
    return '#FF0000';
  }
}

/**
 * 具体实现：蓝色
 */
class BlueColor implements Color {
  applyColor(): string {
    return 'Applying blue color';
  }

  getHexCode(): string {
    return '#0000FF';
  }
}

/**
 * 具体实现：绿色
 */
class GreenColor implements Color {
  applyColor(): string {
    return 'Applying green color';
  }

  getHexCode(): string {
    return '#00FF00';
  }
}

// ============================================
// 抽象部分
// ============================================

/**
 * 形状抽象类 - 抽象维度
 */
abstract class Shape {
  protected color: Color;

  constructor(color: Color) {
    this.color = color;
  }

  abstract draw(): string;
  abstract calculateArea(): number;

  getColorInfo(): string {
    return `Color: ${this.color.getHexCode()}`;
  }
}

/**
 * 细化抽象：圆形
 */
class Circle extends Shape {
  private radius: number;

  constructor(color: Color, radius: number) {
    super(color);
    this.radius = radius;
  }

  draw(): string {
    return `Drawing Circle with radius ${this.radius}. ${this.color.applyColor()}`;
  }

  calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }
}

/**
 * 细化抽象：矩形
 */
class Rectangle extends Shape {
  private width: number;
  private height: number;

  constructor(color: Color, width: number, height: number) {
    super(color);
    this.width = width;
    this.height = height;
  }

  draw(): string {
    return `Drawing Rectangle ${this.width}x${this.height}. ${this.color.applyColor()}`;
  }

  calculateArea(): number {
    return this.width * this.height;
  }
}

/**
 * 细化抽象：三角形
 */
class Triangle extends Shape {
  private base: number;
  private height: number;

  constructor(color: Color, base: number, height: number) {
    super(color);
    this.base = base;
    this.height = height;
  }

  draw(): string {
    return `Drawing Triangle with base ${this.base} and height ${this.height}. ${this.color.applyColor()}`;
  }

  calculateArea(): number {
    return 0.5 * this.base * this.height;
  }
}

// ============================================
// 另一个桥接示例：设备和遥控器
// ============================================

/**
 * 设备接口 - 实现
 */
interface Device {
  isEnabled(): boolean;
  enable(): void;
  disable(): void;
  getVolume(): number;
  setVolume(percent: number): void;
  getChannel(): number;
  setChannel(channel: number): void;
}

/**
 * 具体实现：电视
 */
class TV implements Device {
  private on = false;
  private volume = 30;
  private channel = 1;

  isEnabled(): boolean {
    return this.on;
  }

  enable(): void {
    this.on = true;
    console.log('TV is now ON');
  }

  disable(): void {
    this.on = false;
    console.log('TV is now OFF');
  }

  getVolume(): number {
    return this.volume;
  }

  setVolume(percent: number): void {
    this.volume = Math.max(0, Math.min(100, percent));
    console.log(`TV volume set to ${this.volume}%`);
  }

  getChannel(): number {
    return this.channel;
  }

  setChannel(channel: number): void {
    this.channel = channel;
    console.log(`TV channel set to ${this.channel}`);
  }
}

/**
 * 具体实现：收音机
 */
class Radio implements Device {
  private on = false;
  private volume = 20;
  private channel = 88;

  isEnabled(): boolean {
    return this.on;
  }

  enable(): void {
    this.on = true;
    console.log('Radio is now ON');
  }

  disable(): void {
    this.on = false;
    console.log('Radio is now OFF');
  }

  getVolume(): number {
    return this.volume;
  }

  setVolume(percent: number): void {
    this.volume = Math.max(0, Math.min(100, percent));
    console.log(`Radio volume set to ${this.volume}%`);
  }

  getChannel(): number {
    return this.channel;
  }

  setChannel(channel: number): void {
    this.channel = channel;
    console.log(`Radio frequency set to ${this.channel} FM`);
  }
}

/**
 * 遥控器抽象 - 抽象部分
 */
abstract class RemoteControl {
  protected device: Device;

  constructor(device: Device) {
    this.device = device;
  }

  togglePower(): void {
    if (this.device.isEnabled()) {
      this.device.disable();
    } else {
      this.device.enable();
    }
  }

  volumeDown(): void {
    this.device.setVolume(this.device.getVolume() - 10);
  }

  volumeUp(): void {
    this.device.setVolume(this.device.getVolume() + 10);
  }

  channelDown(): void {
    this.device.setChannel(this.device.getChannel() - 1);
  }

  channelUp(): void {
    this.device.setChannel(this.device.getChannel() + 1);
  }
}

/**
 * 高级遥控器 - 扩展抽象
 */
class AdvancedRemoteControl extends RemoteControl {
  mute(): void {
    console.log('Muting device');
    this.device.setVolume(0);
  }

  setFavoriteChannel(channel: number): void {
    console.log(`Setting favorite channel to ${channel}`);
    this.device.setChannel(channel);
  }
}
```

#### 完整使用示例

```typescript
// 示例1：形状和颜色
const redCircle = new Circle(new RedColor(), 5);
const blueRectangle = new Rectangle(new BlueColor(), 10, 20);
const greenTriangle = new Triangle(new GreenColor(), 10, 5);

console.log(redCircle.draw());
console.log(blueRectangle.draw());
console.log(greenTriangle.draw());

// 示例2：设备和遥控器
const tv = new TV();
const radio = new Radio();

const tvRemote = new RemoteControl(tv);
const radioRemote = new AdvancedRemoteControl(radio);

tvRemote.togglePower();
tvRemote.volumeUp();
tvRemote.volumeUp();

radioRemote.togglePower();
radioRemote.setFavoriteChannel(101);
radioRemote.mute();

// 运行时切换实现
const advancedTVRemote = new AdvancedRemoteControl(tv);
advancedTVRemote.togglePower();
advancedTVRemote.mute();
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：使用继承而非组合（类爆炸）
class RedCircle extends Circle { /* ... */ }
class BlueCircle extends Circle { /* ... */ }
class GreenCircle extends Circle { /* ... */ }
class RedRectangle extends Rectangle { /* ... */ }
class BlueRectangle extends Rectangle { /* ... */ }
// 3种颜色 × 3种形状 = 9个类！

// ❌ 错误2：抽象和实现耦合
class BadShape {
  // 直接依赖具体实现
  private color = new RedColor();

  draw(): string {
    return `Drawing with ${this.color.getHexCode()}`;
  }
}

// ❌ 错误3：桥接过度设计
// 只有一个实现时不需要桥接
class SimpleButton {
  // 不需要桥接，直接实现即可
  private renderer = new ButtonRenderer(); // 过度设计
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 分离抽象和实现 | 增加代码复杂度 |
| 提高可扩展性 | 需要正确识别两个维度 |
| 符合开闭原则 | 对简单系统可能过度设计 |
| 隐藏实现细节 | 增加理解和设计难度 |

#### 与其他模式的关系

- **适配器模式**: 桥接是预先设计，适配器是事后补救
- **策略模式**: 桥接通常与策略模式一起使用
- **抽象工厂**: 可以创建桥接中的具体实现

---

### 2.3 组合模式 (Composite Pattern)

#### 定义与意图

**形式化定义**: 将对象组合成树形结构以表示"部分-整体"的层次结构。组合模式使得用户对单个对象和组合对象的使用具有一致性。

$$
\text{Client} \xrightarrow{\text{统一操作}} \begin{cases} \text{Leaf} \\ \text{Composite} \end{cases}
$$

**意图**: 统一处理单个对象和组合对象，形成树形结构。

#### 适用场景

- 需要表示对象的部分-整体层次结构
- 希望客户端忽略组合对象与单个对象的差异
- 需要递归组合对象
- 需要动态添加或删除组件

#### 先决条件

- 存在部分-整体关系
- 需要统一处理个体和组合
- 结构呈树形

#### UML类图

```
                    ┌──────────────┐
                    │  Component   │
                    │ <<interface>>│
                    │  +operation()│
                    │  +add()      │
                    │  +remove()   │
                    │  +getChild() │
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │                              │
      ┌─────┴─────┐                  ┌─────┴─────┐
      │   Leaf    │                  │ Composite │
      │+operation│                  │ -children │
      └───────────┘                  │+operation│
                                     │+add()    │
                                     │+remove() │
                                     └──────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 组件接口
// ============================================

/**
 * 组件接口 - 定义叶子和组合的公共接口
 */
interface FileSystemComponent {
  getName(): string;
  getSize(): number;
  display(indent?: string): void;
  // 可选的默认实现
  add?(component: FileSystemComponent): void;
  remove?(component: FileSystemComponent): void;
  getChild?(index: number): FileSystemComponent | null;
}

// ============================================
// 叶子节点
// ============================================

/**
 * 文件 - 叶子节点
 */
class File implements FileSystemComponent {
  private name: string;
  private size: number;

  constructor(name: string, size: number) {
    this.name = name;
    this.size = size;
  }

  getName(): string {
    return this.name;
  }

  getSize(): number {
    return this.size;
  }

  display(indent: string = ''): void {
    console.log(`${indent}📄 ${this.name} (${this.size} bytes)`);
  }
}

// ============================================
// 组合节点
// ============================================

/**
 * 文件夹 - 组合节点
 */
class Folder implements FileSystemComponent {
  private name: string;
  private children: FileSystemComponent[] = [];

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  getSize(): number {
    return this.children.reduce((total, child) => total + child.getSize(), 0);
  }

  add(component: FileSystemComponent): void {
    this.children.push(component);
  }

  remove(component: FileSystemComponent): void {
    const index = this.children.indexOf(component);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  getChild(index: number): FileSystemComponent | null {
    return this.children[index] || null;
  }

  display(indent: string = ''): void {
    console.log(`${indent}📁 ${this.name} (${this.getSize()} bytes)`);
    for (const child of this.children) {
      child.display(indent + '  ');
    }
  }
}

// ============================================
// 更严格的类型安全实现
// ============================================

/**
 * 抽象组件基类
 */
abstract class Component {
  protected parent: Component | null = null;

  setParent(parent: Component | null): void {
    this.parent = parent;
  }

  getParent(): Component | null {
    return this.parent;
  }

  abstract operation(): string;
  abstract isComposite(): boolean;
}

/**
 * 叶子节点
 */
class Leaf extends Component {
  private name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  operation(): string {
    return `Leaf ${this.name}`;
  }

  isComposite(): boolean {
    return false;
  }
}

/**
 * 组合节点
 */
class Composite extends Component {
  private children: Component[] = [];
  private name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  add(component: Component): void {
    this.children.push(component);
    component.setParent(this);
  }

  remove(component: Component): void {
    const index = this.children.indexOf(component);
    if (index !== -1) {
      this.children.splice(index, 1);
      component.setParent(null);
    }
  }

  getChildren(): Component[] {
    return [...this.children];
  }

  operation(): string {
    const results: string[] = [];
    for (const child of this.children) {
      results.push(child.operation());
    }
    return `Branch ${this.name}(${results.join('+')})`;
  }

  isComposite(): boolean {
    return true;
  }
}
```

#### 完整使用示例

```typescript
// 创建文件系统结构
const root = new Folder('root');
const documents = new Folder('documents');
const pictures = new Folder('pictures');
const music = new Folder('music');

// 添加文件
const readme = new File('readme.txt', 1024);
const photo1 = new File('photo1.jpg', 2048000);
const photo2 = new File('photo2.jpg', 1536000);
const song1 = new File('song1.mp3', 4096000);
const song2 = new File('song2.mp3', 5120000);

// 构建树形结构
documents.add(readme);
pictures.add(photo1);
pictures.add(photo2);
music.add(song1);
music.add(song2);

root.add(documents);
root.add(pictures);
root.add(music);

// 统一操作
root.display();
// 输出：
// 📁 root (12803072 bytes)
//   📁 documents (1024 bytes)
//     📄 readme.txt (1024 bytes)
//   📁 pictures (3584000 bytes)
//     📄 photo1.jpg (2048000 bytes)
//     📄 photo2.jpg (1536000 bytes)
//   📁 music (9216000 bytes)
//     📄 song1.mp3 (4096000 bytes)
//     📄 song2.mp3 (5120000 bytes)

// 递归计算总大小
console.log(`Total size: ${root.getSize()} bytes`);

// 使用严格类型安全版本
const tree = new Composite('root');
const branch1 = new Composite('branch1');
const branch2 = new Composite('branch2');
const leaf1 = new Leaf('leaf1');
const leaf2 = new Leaf('leaf2');
const leaf3 = new Leaf('leaf3');

branch1.add(leaf1);
branch1.add(leaf2);
branch2.add(leaf3);
tree.add(branch1);
tree.add(branch2);

console.log(tree.operation());
// 输出：Branch root(Branch branch1(Leaf leaf1+Leaf leaf2)+Branch branch2(Leaf leaf3))
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：叶子节点实现add/remove
class BadLeaf implements FileSystemComponent {
  add(component: FileSystemComponent): void {
    // 叶子节点不应该支持add
    throw new Error('Cannot add to a file');
  }

  remove(component: FileSystemComponent): void {
    throw new Error('Cannot remove from a file');
  }
}

// ❌ 错误2：客户端需要区分叶子和组合
class BadClient {
  process(component: FileSystemComponent): void {
    if (component instanceof Folder) {
      // 特殊处理组合
      for (const child of (component as Folder).getChildren?.() || []) {
        this.process(child);
      }
    } else {
      // 处理叶子
      component.display();
    }
  }
}

// ❌ 错误3：父组件引用导致循环
class BadComposite extends Component {
  private children: Component[] = [];

  add(component: Component): void {
    this.children.push(component);
    component.setParent(this);
    // 错误：如果component已经是this的祖先，会形成循环
  }
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 统一处理个体和组合 | 设计更加抽象 |
| 易于新增组件类型 | 限制类型变得困难 |
| 形成灵活的树形结构 | 可能过度设计简单场景 |
| 符合开闭原则 | 遍历开销 |

#### 与其他模式的关系

- **迭代器模式**: 用于遍历组合结构
- **访问者模式**: 用于对组合执行操作
- **享元模式**: 共享叶子节点以节省内存
- **责任链模式**: 组合可以形成责任链

---

### 2.4 装饰器模式 (Decorator Pattern)

#### 定义与意图

**形式化定义**: 动态地给一个对象添加一些额外的职责。就增加功能来说，装饰器模式相比生成子类更为灵活。

$$
\text{Component} \xleftarrow{\text{wraps}} \text{Decorator} \xrightarrow{\text{wraps}} \text{ConcreteComponent}
$$

**意图**: 在不改变原有对象结构的情况下，动态地给对象添加功能。

#### 适用场景

- 需要动态、透明地给对象添加职责
- 需要扩展功能但继承不切实际
- 需要撤销添加的功能
- 需要组合多个功能

#### 先决条件

- 对象的核心职责和装饰职责可以分离
- 需要运行时添加/移除功能
- 继承会导致类爆炸

#### UML类图

```
┌─────────────────┐
│  <<interface>>  │
│   Component     │
│  +operation()   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───┴───┐  ┌──┴──────────┐
│Concrete│  │  Decorator  │
│Component  │  -component │
│+operation│  │+operation()│
└─────────┘  └─────┬─────┘
                   │
         ┌─────────┴─────────┐
         │                   │
   ┌─────┴─────┐       ┌─────┴─────┐
   │ Concrete  │       │ Concrete  │
   │DecoratorA │       │DecoratorB │
   │+operation │       │+operation │
   └───────────┘       └───────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 组件接口
// ============================================

/**
 * 咖啡接口 - 组件
 */
interface Coffee {
  cost(): number;
  description(): string;
  getIngredients(): string[];
}

// ============================================
// 具体组件
// ============================================

/**
 * 简单咖啡 - 基础实现
 */
class SimpleCoffee implements Coffee {
  cost(): number {
    return 10;
  }

  description(): string {
    return 'Simple coffee';
  }

  getIngredients(): string[] {
    return ['coffee', 'water'];
  }
}

// ============================================
// 装饰器基类
// ============================================

/**
 * 咖啡装饰器基类
 */
abstract class CoffeeDecorator implements Coffee {
  protected decoratedCoffee: Coffee;

  constructor(coffee: Coffee) {
    this.decoratedCoffee = coffee;
  }

  cost(): number {
    return this.decoratedCoffee.cost();
  }

  description(): string {
    return this.decoratedCoffee.description();
  }

  getIngredients(): string[] {
    return this.decoratedCoffee.getIngredients();
  }
}

// ============================================
// 具体装饰器
// ============================================

/**
 * 牛奶装饰器
 */
class MilkDecorator extends CoffeeDecorator {
  cost(): number {
    return super.cost() + 2;
  }

  description(): string {
    return `${super.description()}, milk`;
  }

  getIngredients(): string[] {
    return [...super.getIngredients(), 'milk'];
  }
}

/**
 * 糖装饰器
 */
class SugarDecorator extends CoffeeDecorator {
  cost(): number {
    return super.cost() + 1;
  }

  description(): string {
    return `${super.description()}, sugar`;
  }

  getIngredients(): string[] {
    return [...super.getIngredients(), 'sugar'];
  }
}

/**
 * 奶油装饰器
 */
class WhipDecorator extends CoffeeDecorator {
  cost(): number {
    return super.cost() + 3;
  }

  description(): string {
    return `${super.description()}, whip`;
  }

  getIngredients(): string[] {
    return [...super.getIngredients(), 'whip'];
  }
}

/**
 * 香草装饰器
 */
class VanillaDecorator extends CoffeeDecorator {
  cost(): number {
    return super.cost() + 2.5;
  }

  description(): string {
    return `${super.description()}, vanilla`;
  }

  getIngredients(): string[] {
    return [...super.getIngredients(), 'vanilla'];
  }
}

// ============================================
// 另一个示例：数据流装饰器
// ============================================

/**
 * 数据源接口
 */
interface DataSource {
  write(data: string): void;
  read(): string;
}

/**
 * 文件数据源
 */
class FileDataSource implements DataSource {
  private filename: string;
  private data = '';

  constructor(filename: string) {
    this.filename = filename;
  }

  write(data: string): void {
    this.data = data;
    console.log(`Writing to file ${this.filename}`);
  }

  read(): string {
    console.log(`Reading from file ${this.filename}`);
    return this.data;
  }
}

/**
 * 数据源装饰器基类
 */
abstract class DataSourceDecorator implements DataSource {
  protected wrappee: DataSource;

  constructor(source: DataSource) {
    this.wrappee = source;
  }

  write(data: string): void {
    this.wrappee.write(data);
  }

  read(): string {
    return this.wrappee.read();
  }
}

/**
 * 加密装饰器
 */
class EncryptionDecorator extends DataSourceDecorator {
  write(data: string): void {
    const encrypted = this.encrypt(data);
    super.write(encrypted);
  }

  read(): string {
    const data = super.read();
    return this.decrypt(data);
  }

  private encrypt(data: string): string {
    // 简化加密
    return btoa(data);
  }

  private decrypt(data: string): string {
    return atob(data);
  }
}

/**
 * 压缩装饰器
 */
class CompressionDecorator extends DataSourceDecorator {
  write(data: string): void {
    const compressed = this.compress(data);
    super.write(compressed);
  }

  read(): string {
    const data = super.read();
    return this.decompress(data);
  }

  private compress(data: string): string {
    // 简化压缩
    return `COMPRESSED[${data}]`;
  }

  private decompress(data: string): string {
    return data.replace(/^COMPRESSED\[(.*)\]$/, '$1');
  }
}
```

#### 完整使用示例

```typescript
// 示例1：咖啡订单
let coffee: Coffee = new SimpleCoffee();
console.log(`${coffee.description()} - $${coffee.cost()}`);
// Simple coffee - $10

coffee = new MilkDecorator(coffee);
console.log(`${coffee.description()} - $${coffee.cost()}`);
// Simple coffee, milk - $12

coffee = new SugarDecorator(coffee);
console.log(`${coffee.description()} - $${coffee.cost()}`);
// Simple coffee, milk, sugar - $13

coffee = new WhipDecorator(coffee);
console.log(`${coffee.description()} - $${coffee.cost()}`);
// Simple coffee, milk, sugar, whip - $16

// 可以任意组合
coffee = new VanillaDecorator(new SugarDecorator(new SimpleCoffee()));
console.log(`${coffee.description()} - $${coffee.cost()}`);
// Simple coffee, sugar, vanilla - $13.5

// 示例2：数据流处理
let source: DataSource = new FileDataSource('data.txt');
source = new CompressionDecorator(source);
source = new EncryptionDecorator(source);

source.write('Hello, World!');
// 先压缩，再加密，最后写入文件

const data = source.read();
// 从文件读取，先解密，再解压
console.log(data); // Hello, World!

// 可以动态改变组合
source = new FileDataSource('plain.txt'); // 只有文件，无装饰
source.write('Plain text');
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：装饰器不保持接口一致性
class BadDecorator implements Coffee {
  constructor(private coffee: Coffee) {}

  cost(): number {
    return this.coffee.cost() + 5;
  }

  // 忘记实现description和getIngredients！
  description(): string {
    throw new Error('Not implemented');
  }

  getIngredients(): string[] {
    throw new Error('Not implemented');
  }
}

// ❌ 错误2：装饰器修改原有行为而非扩展
class BadDecorator2 extends CoffeeDecorator {
  cost(): number {
    // 错误：完全替换而非扩展
    return 999;
  }

  description(): string {
    // 错误：完全替换而非扩展
    return 'Bad decorator';
  }
}

// ❌ 错误3：使用继承而非组合
class BadMilkCoffee extends SimpleCoffee {
  // 使用继承，无法动态组合
  cost(): number {
    return super.cost() + 2;
  }
}
// 问题：无法创建 Milk + Sugar 的组合，除非再创建一个类

// ❌ 错误4：装饰器依赖具体组件
class BadDecorator3 extends CoffeeDecorator {
  constructor(coffee: SimpleCoffee) { // 依赖具体类而非接口
    super(coffee);
  }
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 比继承更灵活 | 产生许多小对象 |
| 运行时添加/移除功能 | 调试困难 |
| 符合单一职责原则 | 装饰顺序可能重要 |
| 可以组合多个装饰器 | 过多装饰影响性能 |

#### 与其他模式的关系

- **代理模式**: 装饰器增强功能，代理控制访问
- **适配器模式**: 装饰器改变职责，适配器改变接口
- **组合模式**: 装饰器是组合模式的特例
- **策略模式**: 装饰器可以改变对象的外表，策略改变内核

---

### 2.5 外观模式 (Facade Pattern)

#### 定义与意图

**形式化定义**: 为子系统中的一组接口提供一个一致的界面。外观模式定义了一个高层接口，这个接口使得这一子系统更加容易使用。

$$
\text{Client} \xrightarrow{\text{简单接口}} \text{Facade} \xrightarrow{\text{复杂接口}} \text{Subsystems}
$$

**意图**: 简化复杂系统的接口，提供统一的访问点。

#### 适用场景

- 需要简化复杂系统的接口
- 需要将系统分层
- 需要解耦客户端和子系统
- 需要构建多层架构

#### 先决条件

- 系统足够复杂
- 存在多个相互依赖的子系统
- 客户端不需要了解内部细节

#### UML类图

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Facade   │
│  +operation │
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌─────┐ ┌─────┐
│SubA │ │SubB │
└─────┘ └─────┘
```

#### TypeScript实现

```typescript
// ============================================
// 子系统类
// ============================================

/**
 * 音频子系统
 */
class AudioSystem {
  private volume = 50;
  private isOn = false;

  turnOn(): void {
    this.isOn = true;
    console.log('Audio system: ON');
  }

  turnOff(): void {
    this.isOn = false;
    console.log('Audio system: OFF');
  }

  setVolume(level: number): void {
    this.volume = Math.max(0, Math.min(100, level));
    console.log(`Audio volume set to ${this.volume}%`);
  }

  play(source: string): void {
    if (this.isOn) {
      console.log(`Playing audio from ${source}`);
    }
  }
}

/**
 * 视频子系统
 */
class VideoSystem {
  private isOn = false;
  private source = '';

  turnOn(): void {
    this.isOn = true;
    console.log('Video system: ON');
  }

  turnOff(): void {
    this.isOn = false;
    console.log('Video system: OFF');
  }

  setSource(source: string): void {
    this.source = source;
    console.log(`Video source set to ${source}`);
  }

  display(): void {
    if (this.isOn) {
      console.log(`Displaying video from ${this.source}`);
    }
  }
}

/**
 * 灯光子系统
 */
class LightingSystem {
  private brightness = 100;
  private isOn = false;

  turnOn(): void {
    this.isOn = true;
    console.log('Lights: ON');
  }

  turnOff(): void {
    this.isOn = false;
    console.log('Lights: OFF');
  }

  dim(percent: number): void {
    this.brightness = percent;
    console.log(`Lights dimmed to ${percent}%`);
  }
}

/**
 * 网络子系统
 */
class NetworkSystem {
  private connected = false;

  connect(): void {
    this.connected = true;
    console.log('Network: Connected');
  }

  disconnect(): void {
    this.connected = false;
    console.log('Network: Disconnected');
  }

  stream(url: string): void {
    if (this.connected) {
      console.log(`Streaming from ${url}`);
    }
  }
}

// ============================================
// 外观类
// ============================================

/**
 * 家庭影院外观
 */
class HomeTheaterFacade {
  private audio: AudioSystem;
  private video: VideoSystem;
  private lighting: LightingSystem;
  private network: NetworkSystem;

  constructor() {
    this.audio = new AudioSystem();
    this.video = new VideoSystem();
    this.lighting = new LightingSystem();
    this.network = new NetworkSystem();
  }

  /**
   * 一键观影模式
   */
  watchMovie(movie: string): void {
    console.log('\n=== Getting ready to watch movie ===');
    this.lighting.dim(20);
    this.network.connect();
    this.video.turnOn();
    this.video.setSource('HDMI 1');
    this.audio.turnOn();
    this.audio.setVolume(70);
    this.network.stream(movie);
    console.log('Movie is now playing!\n');
  }

  /**
   * 一键结束观影
   */
  endMovie(): void {
    console.log('\n=== Shutting down movie theater ===');
    this.network.disconnect();
    this.audio.turnOff();
    this.video.turnOff();
    this.lighting.turnOn();
    this.lighting.dim(100);
    console.log('Good night!\n');
  }

  /**
   * 一键听音乐
   */
  listenToMusic(source: string): void {
    console.log('\n=== Getting ready to listen to music ===');
    this.lighting.dim(50);
    this.audio.turnOn();
    this.audio.setVolume(40);
    this.audio.play(source);
    console.log('Music is now playing!\n');
  }
}

// ============================================
// 另一个示例：API外观
// ============================================

/**
 * 数据库子系统
 */
class Database {
  query(sql: string): unknown[] {
    console.log(`Executing: ${sql}`);
    return [];
  }
}

/**
 * 缓存子系统
 */
class Cache {
  private data = new Map<string, unknown>();

  get(key: string): unknown | undefined {
    return this.data.get(key);
  }

  set(key: string, value: unknown): void {
    this.data.set(key, value);
  }
}

/**
 * 日志子系统
 */
class Logger {
  log(message: string): void {
    console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
  }
}

/**
 * 数据访问外观
 */
class DataAccessFacade {
  private db = new Database();
  private cache = new Cache();
  private logger = new Logger();

  getUser(userId: string): unknown {
    this.logger.log(`Fetching user ${userId}`);

    // 先查缓存
    const cached = this.cache.get(`user:${userId}`);
    if (cached) {
      this.logger.log(`Cache hit for user ${userId}`);
      return cached;
    }

    // 缓存未命中，查数据库
    this.logger.log(`Cache miss for user ${userId}`);
    const user = this.db.query(`SELECT * FROM users WHERE id = ${userId}`);

    // 写入缓存
    this.cache.set(`user:${userId}`, user);

    return user;
  }
}
```

#### 完整使用示例

```typescript
// 使用外观
const homeTheater = new HomeTheaterFacade();

// 一键观影
homeTheater.watchMovie('Netflix');
// 输出：
// === Getting ready to watch movie ===
// Lights dimmed to 20%
// Network: Connected
// Video system: ON
// Video source set to HDMI 1
// Audio system: ON
// Audio volume set to 70%
// Streaming from Netflix
// Movie is now playing!

// 一键结束
homeTheater.endMovie();

// 一键听音乐
homeTheater.listenToMusic('Spotify');

// 使用数据访问外观
const dataAccess = new DataAccessFacade();
const user = dataAccess.getUser('123');
// 客户端不需要知道缓存、数据库、日志的存在
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：外观包含业务逻辑
class BadFacade {
  constructor(private subA: SubsystemA, private subB: SubsystemB) {}

  operation(): void {
    // 外观应该只是委托，不应该有业务逻辑
    if (this.subA.getStatus() === 'ready' && this.subB.getStatus() === 'ready') {
      // 复杂的业务逻辑...
    }
  }
}

// ❌ 错误2：外观暴露子系统
class BadFacade2 {
  public subA: SubsystemA; // 不应该暴露
  public subB: SubsystemB;

  constructor() {
    this.subA = new SubsystemA();
    this.subB = new SubsystemB();
  }
}

// ❌ 错误3：外观过于复杂
class BadFacade3 {
  // 外观应该简化接口，而不是成为另一个复杂系统
  operation1(): void {}
  operation2(): void {}
  operation3(): void {}
  // ... 几十个方法
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 简化接口 | 可能成为上帝对象 |
| 解耦子系统 | 限制客户端的灵活性 |
| 分层架构 | 额外的一层间接 |
| 易于使用 | 不符合开闭原则 |

#### 与其他模式的关系

- **单例模式**: 外观通常是单例
- **抽象工厂**: 可以用抽象工厂创建子系统
- **中介者模式**: 外观是单向的，中介者是双向的
- **代理模式**: 外观简化接口，代理控制访问

---

### 2.6 享元模式 (Flyweight Pattern)

#### 定义与意图

**形式化定义**: 运用共享技术有效地支持大量细粒度的对象。

$$
\text{Intrinsic State} + \text{Extrinsic State} = \text{Object}
$$

其中 Intrinsic State（内部状态）可共享，Extrinsic State（外部状态）不可共享。

**意图**: 通过共享对象来减少内存使用，提高性能。

#### 适用场景

- 需要创建大量相似对象
- 对象的大部分状态可以外部化
- 可以用较少的共享对象替代多组对象
- 应用程序不依赖于对象标识

#### 先决条件

- 对象可以划分为内部状态和外部状态
- 内部状态相对稳定
- 外部状态可以计算或存储

#### UML类图

```
┌─────────────────────────────────────────────┐
│              FlyweightFactory               │
│  -flyweights: Map<string, Flyweight>        │
│  +getFlyweight(key): Flyweight              │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  Flyweight    │
              │ <<interface>> │
              │+operation()   │
              └───────┬───────┘
                      │
            ┌─────────┴─────────┐
            │                   │
      ┌─────┴─────┐       ┌─────┴─────┐
      │Concrete   │       │ Unshared  │
      │Flyweight  │       │Concrete   │
      │-intrinsic │       │Flyweight  │
      │ state     │       │-all state │
      └───────────┘       └───────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 享元接口
// ============================================

/**
 * 树类型接口 - 享元
 */
interface TreeType {
  render(x: number, y: number, age: number): void;
  getName(): string;
  getColor(): string;
  getTexture(): string;
}

// ============================================
// 具体享元
// ============================================

/**
 * 具体树类型 - 包含内部状态
 */
class ConcreteTreeType implements TreeType {
  private name: string;
  private color: string;
  private texture: string;

  constructor(name: string, color: string, texture: string) {
    this.name = name;
    this.color = color;
    this.texture = texture;
  }

  render(x: number, y: number, age: number): void {
    console.log(`Rendering ${this.name} tree at (${x}, ${y}), age: ${age}`);
    console.log(`  Color: ${this.color}, Texture: ${this.texture}`);
  }

  getName(): string {
    return this.name;
  }

  getColor(): string {
    return this.color;
  }

  getTexture(): string {
    return this.texture;
  }
}

// ============================================
// 享元工厂
// ============================================

/**
 * 树类型工厂 - 管理享元对象
 */
class TreeFactory {
  private static treeTypes: Map<string, TreeType> = new Map();

  static getTreeType(name: string, color: string, texture: string): TreeType {
    const key = `${name}-${color}-${texture}`;

    if (!TreeFactory.treeTypes.has(key)) {
      console.log(`Creating new tree type: ${key}`);
      TreeFactory.treeTypes.set(
        key,
        new ConcreteTreeType(name, color, texture)
      );
    } else {
      console.log(`Reusing existing tree type: ${key}`);
    }

    return TreeFactory.treeTypes.get(key)!;
  }

  static getTreeTypeCount(): number {
    return TreeFactory.treeTypes.size;
  }

  static getAllTypes(): string[] {
    return Array.from(TreeFactory.treeTypes.keys());
  }
}

// ============================================
// 上下文 - 包含外部状态
// ============================================

/**
 * 树 - 包含外部状态
 */
class Tree {
  private x: number;
  private y: number;
  private age: number;
  private type: TreeType;

  constructor(x: number, y: number, age: number, type: TreeType) {
    this.x = x;
    this.y = y;
    this.age = age;
    this.type = type;
  }

  render(): void {
    this.type.render(this.x, this.y, this.age);
  }

  getType(): TreeType {
    return this.type;
  }
}

// ============================================
// 森林 - 管理所有树
// ============================================

class Forest {
  private trees: Tree[] = [];

  plantTree(
    x: number,
    y: number,
    name: string,
    color: string,
    texture: string,
    age: number
  ): void {
    const type = TreeFactory.getTreeType(name, color, texture);
    const tree = new Tree(x, y, age, type);
    this.trees.push(tree);
  }

  render(): void {
    for (const tree of this.trees) {
      tree.render();
    }
  }

  getTreeCount(): number {
    return this.trees.length;
  }

  getTreeTypeCount(): number {
    return TreeFactory.getTreeTypeCount();
  }
}

// ============================================
// 另一个示例：字符享元
// ============================================

/**
 * 字符享元接口
 */
interface CharacterFlyweight {
  display(fontSize: number, x: number, y: number): void;
}

/**
 * 具体字符享元
 */
class ConcreteCharacter implements CharacterFlyweight {
  private symbol: string;

  constructor(symbol: string) {
    this.symbol = symbol;
  }

  display(fontSize: number, x: number, y: number): void {
    console.log(`Displaying '${this.symbol}' at (${x}, ${y}), size: ${fontSize}`);
  }
}

/**
 * 字符工厂
 */
class CharacterFactory {
  private characters: Map<string, CharacterFlyweight> = new Map();

  getCharacter(symbol: string): CharacterFlyweight {
    if (!this.characters.has(symbol)) {
      this.characters.set(symbol, new ConcreteCharacter(symbol));
    }
    return this.characters.get(symbol)!;
  }

  getCharacterCount(): number {
    return this.characters.size;
  }
}

/**
 * 格式化字符 - 包含外部状态
 */
class FormattedCharacter {
  constructor(
    private character: CharacterFlyweight,
    private fontSize: number,
    private x: number,
    private y: number
  ) {}

  display(): void {
    this.character.display(this.fontSize, this.x, this.y);
  }
}
```

#### 完整使用示例

```typescript
// 示例1：森林
const forest = new Forest();

// 种植10000棵树，但只有3种类型
for (let i = 0; i < 5000; i++) {
  forest.plantTree(
    Math.random() * 1000,
    Math.random() * 1000,
    'Oak',
    'Green',
    'Rough',
    Math.random() * 100
  );
}

for (let i = 0; i < 3000; i++) {
  forest.plantTree(
    Math.random() * 1000,
    Math.random() * 1000,
    'Pine',
    'Dark Green',
    'Smooth',
    Math.random() * 100
  );
}

for (let i = 0; i < 2000; i++) {
  forest.plantTree(
    Math.random() * 1000,
    Math.random() * 1000,
    'Birch',
    'White',
    'Striped',
    Math.random() * 100
  );
}

console.log(`\nTotal trees: ${forest.getTreeCount()}`);
console.log(`Tree types (shared): ${forest.getTreeTypeCount()}`);
console.log(`Memory saved: ${forest.getTreeCount() - forest.getTreeTypeCount()} objects`);

// 示例2：文本渲染
const charFactory = new CharacterFactory();
const text: FormattedCharacter[] = [];

const message = 'Hello, World! Hello, World!';
let x = 0;
const y = 100;

for (const symbol of message) {
  const char = charFactory.getCharacter(symbol);
  text.push(new FormattedCharacter(char, 12, x, y));
  x += 10;
}

console.log(`\nMessage length: ${message.length}`);
console.log(`Unique characters: ${charFactory.getCharacterCount()}`);
console.log(`Memory saved: ${message.length - charFactory.getCharacterCount()} objects`);
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：享元包含外部状态
class BadFlyweight {
  private intrinsicState: string; // 内部状态 - 正确
  private extrinsicState: string; // 错误：外部状态不应该在享元中

  constructor(intrinsic: string, extrinsic: string) {
    this.intrinsicState = intrinsic;
    this.extrinsicState = extrinsic; // 错误！
  }
}

// ❌ 错误2：没有使用工厂，直接创建享元
class BadClient {
  // 每次创建新的享元，没有共享
  createTree(): TreeType {
    return new ConcreteTreeType('Oak', 'Green', 'Rough');
  }
}

// ❌ 错误3：享元工厂没有正确管理实例
class BadFactory {
  private flyweights: Flyweight[] = [];

  getFlyweight(key: string): Flyweight {
    // 每次都创建新的，没有复用
    const flyweight = new ConcreteFlyweight();
    this.flyweights.push(flyweight);
    return flyweight;
  }
}

// ❌ 错误4：依赖对象标识
class BadClient2 {
  process(flyweight1: Flyweight, flyweight2: Flyweight): void {
    if (flyweight1 === flyweight2) {
      // 错误：享元模式不保证对象标识
    }
  }
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 大幅减少内存使用 | 代码复杂度增加 |
| 提高性能 | 需要分离内外状态 |
| 集中管理对象 | 运行时开销 |
| 符合单一职责 | 不适合所有场景 |

#### 与其他模式的关系

- **工厂模式**: 享元工厂通常用工厂模式实现
- **组合模式**: 享元可以作为组合模式的叶子节点
- **单例模式**: 享元工厂通常是单例
- **策略模式**: 享元可以实现策略对象

---

### 2.7 代理模式 (Proxy Pattern)

#### 定义与意图

**形式化定义**: 为其他对象提供一种代理以控制对这个对象的访问。

$$
\text{Client} \xrightarrow{\text{通过代理}} \text{Proxy} \xrightarrow{\text{控制访问}} \text{RealSubject}
$$

**意图**: 在不改变目标对象的情况下，控制对其的访问。

#### 适用场景

- 需要延迟加载（虚拟代理）
- 需要访问控制（保护代理）
- 需要记录日志（日志代理）
- 需要缓存结果（缓存代理）
- 需要远程访问（远程代理）

#### 先决条件

- 需要控制对对象的访问
- 需要添加额外的访问逻辑
- 目标对象创建成本高或需要保护

#### UML类图

```
┌─────────────┐         ┌──────────────┐
│   Client    │────────►│   Subject    │
│             │         │ <<interface>>│
└─────────────┘         │  +request()  │
                        └──────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
        ┌─────┴─────┐    ┌─────┴─────┐   ┌─────┴─────┐
        │   Real    │    │   Proxy   │   │   Proxy   │
        │  Subject  │    │  (Cache)  │   │ (Access)  │
        │ +request()│    │ +request()│   │ +request()│
        └───────────┘    │ -realSub  │   │ -realSub  │
                         └───────────┘   └───────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 主题接口
// ============================================

/**
 * 图片接口 - 主题
 */
interface Image {
  display(): void;
  getFileName(): string;
  getDimensions(): { width: number; height: number };
}

// ============================================
// 真实主题
// ============================================

/**
 * 真实图片 - 加载成本高
 */
class RealImage implements Image {
  private fileName: string;
  private width: number;
  private height: number;
  private data: string;

  constructor(fileName: string) {
    this.fileName = fileName;
    this.loadFromDisk();
    this.width = 1920;
    this.height = 1080;
  }

  private loadFromDisk(): void {
    console.log(`Loading image: ${this.fileName}`);
    // 模拟昂贵的加载操作
    this.data = `Image data for ${this.fileName}`;
  }

  display(): void {
    console.log(`Displaying: ${this.fileName}`);
  }

  getFileName(): string {
    return this.fileName;
  }

  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }
}

// ============================================
// 虚拟代理
// ============================================

/**
 * 图片代理 - 延迟加载
 */
class ProxyImage implements Image {
  private realImage: RealImage | null = null;
  private fileName: string;

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  display(): void {
    if (this.realImage === null) {
      this.realImage = new RealImage(this.fileName);
    }
    this.realImage.display();
  }

  getFileName(): string {
    return this.fileName;
  }

  getDimensions(): { width: number; height: number } {
    if (this.realImage === null) {
      // 可以从元数据获取，无需加载完整图片
      console.log('Returning cached dimensions');
      return { width: 1920, height: 1080 };
    }
    return this.realImage.getDimensions();
  }
}

// ============================================
// 保护代理
// ============================================

/**
 * 用户角色
 */
type UserRole = 'admin' | 'user' | 'guest';

interface User {
  name: string;
  role: UserRole;
}

/**
 * 文档接口
 */
interface Document {
  read(): string;
  write(content: string): void;
  delete(): void;
}

/**
 * 真实文档
 */
class RealDocument implements Document {
  private content: string;
  private fileName: string;

  constructor(fileName: string, content: string) {
    this.fileName = fileName;
    this.content = content;
  }

  read(): string {
    return this.content;
  }

  write(content: string): void {
    this.content = content;
    console.log(`Document ${this.fileName} updated`);
  }

  delete(): void {
    console.log(`Document ${this.fileName} deleted`);
  }
}

/**
 * 保护代理 - 访问控制
 */
class DocumentProxy implements Document {
  private realDocument: RealDocument;
  private user: User;

  constructor(fileName: string, content: string, user: User) {
    this.realDocument = new RealDocument(fileName, content);
    this.user = user;
  }

  private checkPermission(action: string): boolean {
    const permissions: Record<UserRole, string[]> = {
      admin: ['read', 'write', 'delete'],
      user: ['read', 'write'],
      guest: ['read']
    };
    return permissions[this.user.role].includes(action);
  }

  read(): string {
    if (this.checkPermission('read')) {
      console.log(`${this.user.name} is reading the document`);
      return this.realDocument.read();
    }
    throw new Error('Access denied: cannot read');
  }

  write(content: string): void {
    if (this.checkPermission('write')) {
      console.log(`${this.user.name} is writing to the document`);
      this.realDocument.write(content);
    } else {
      throw new Error('Access denied: cannot write');
    }
  }

  delete(): void {
    if (this.checkPermission('delete')) {
      console.log(`${this.user.name} is deleting the document`);
      this.realDocument.delete();
    } else {
      throw new Error('Access denied: cannot delete');
    }
  }
}

// ============================================
// 缓存代理
// ============================================

type CacheKey = string;
type CacheValue = unknown;

/**
 *  expensive 操作接口
 */
interface ExpensiveOperation {
  compute(input: string): number;
}

/**
 * 真实计算服务
 */
class RealComputation implements ExpensiveOperation {
  compute(input: string): number {
    console.log(`Computing result for: ${input}`);
    // 模拟昂贵的计算
    let result = 0;
    for (let i = 0; i < input.length; i++) {
      result += input.charCodeAt(i);
    }
    return result;
  }
}

/**
 * 缓存代理
 */
class CachingProxy implements ExpensiveOperation {
  private realComputation: RealComputation;
  private cache: Map<CacheKey, CacheValue>;

  constructor() {
    this.realComputation = new RealComputation();
    this.cache = new Map();
  }

  compute(input: string): number {
    if (this.cache.has(input)) {
      console.log(`Cache hit for: ${input}`);
      return this.cache.get(input) as number;
    }

    console.log(`Cache miss for: ${input}`);
    const result = this.realComputation.compute(input);
    this.cache.set(input, result);
    return result;
  }

  clearCache(): void {
    this.cache.clear();
    console.log('Cache cleared');
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

// ============================================
// 日志代理
// ============================================

/**
 * 服务接口
 */
interface Service {
  execute(): void;
}

/**
 * 真实服务
 */
class RealService implements Service {
  execute(): void {
    console.log('Executing service...');
  }
}

/**
 * 日志代理
 */
class LoggingProxy implements Service {
  private service: Service;
  private serviceName: string;

  constructor(service: Service, serviceName: string) {
    this.service = service;
    this.serviceName = serviceName;
  }

  execute(): void {
    console.log(`[LOG] ${new Date().toISOString()}: Entering ${this.serviceName}.execute()`);
    this.service.execute();
    console.log(`[LOG] ${new Date().toISOString()}: Exiting ${this.serviceName}.execute()`);
  }
}
```

#### 完整使用示例

```typescript
// 示例1：虚拟代理 - 图片库
const images: Image[] = [
  new ProxyImage('photo1.jpg'),
  new ProxyImage('photo2.jpg'),
  new ProxyImage('photo3.jpg')
];

// 此时图片还未加载
console.log('Images created, but not loaded yet');

// 获取尺寸（不需要加载完整图片）
console.log(images[0].getDimensions());

// 显示图片时才加载
images[0].display();
images[1].display();

// 示例2：保护代理 - 文档访问
const admin: User = { name: 'Alice', role: 'admin' };
const user: User = { name: 'Bob', role: 'user' };
const guest: User = { name: 'Charlie', role: 'guest' };

const adminDoc = new DocumentProxy('secret.txt', 'Top secret content', admin);
const userDoc = new DocumentProxy('document.txt', 'Normal content', user);
const guestDoc = new DocumentProxy('public.txt', 'Public content', guest);

adminDoc.read(); // 成功
adminDoc.write('New content'); // 成功
adminDoc.delete(); // 成功

userDoc.read(); // 成功
userDoc.write('User update'); // 成功
try {
  userDoc.delete(); // 抛出错误
} catch (e) {
  console.log((e as Error).message);
}

guestDoc.read(); // 成功
try {
  guestDoc.write('Guest update'); // 抛出错误
} catch (e) {
  console.log((e as Error).message);
}

// 示例3：缓存代理
const computation = new CachingProxy();
console.log(computation.compute('hello')); // 计算
console.log(computation.compute('hello')); // 缓存命中
console.log(computation.compute('world')); // 计算
console.log(computation.compute('hello')); // 缓存命中
console.log(`Cache size: ${computation.getCacheSize()}`);

// 示例4：日志代理
const service = new LoggingProxy(new RealService(), 'RealService');
service.execute();
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：代理修改目标对象的行为
class BadProxy implements Image {
  private realImage: RealImage;

  constructor(fileName: string) {
    this.realImage = new RealImage(fileName);
  }

  display(): void {
    // 错误：修改了行为
    console.log('Doing something else first');
    console.log('Not calling realImage.display()');
  }
}

// ❌ 错误2：代理不实现相同的接口
class BadProxy2 {
  // 没有实现Image接口
  constructor(private realImage: RealImage) {}

  show(): void {
    // 方法名不同
    this.realImage.display();
  }
}

// ❌ 错误3：代理在构造函数中创建真实对象（虚拟代理）
class BadVirtualProxy implements Image {
  private realImage: RealImage;

  constructor(fileName: string) {
    // 错误：立即创建，失去了延迟加载的意义
    this.realImage = new RealImage(fileName);
  }

  display(): void {
    this.realImage.display();
  }
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 控制对对象的访问 | 增加响应时间 |
| 延迟加载 | 代码复杂度增加 |
| 增强安全性 | 可能过度设计 |
| 透明地添加功能 | 代理过多影响性能 |

#### 与其他模式的关系

- **适配器模式**: 代理控制访问，适配器改变接口
- **装饰器模式**: 代理控制访问，装饰器增强功能
- **外观模式**: 代理控制单个对象，外观简化子系统

---

## 3. 行为型模式

行为型模式关注对象之间的通信和责任分配。

---

### 3.1 责任链模式 (Chain of Responsibility Pattern)

#### 定义与意图

**形式化定义**: 使多个对象都有机会处理请求，从而避免请求的发送者和接收者之间的耦合关系。将这些对象连成一条链，并沿着这条链传递请求，直到有一个对象处理它为止。

$$
\text{Client} \rightarrow \text{Handler}_1 \rightarrow \text{Handler}_2 \rightarrow \text{Handler}_3 \rightarrow \text{...} \rightarrow \text{null}
$$

**意图**: 解耦请求发送者和接收者，让多个对象都有机会处理请求。

#### 适用场景

- 多个对象可以处理同一请求，具体处理者运行时确定
- 需要动态指定处理请求的对象集合
- 需要在不明确接收者的情况下向多个对象发送请求

#### 先决条件

- 请求可以沿链传递
- 处理者可以决定是否处理请求
- 存在默认处理机制

#### UML类图

```
┌─────────────────────────────────────┐
│           <<interface>>             │
│            Handler                  │
│  +setNext(handler): Handler         │
│  +handle(request): Response|null    │
└───────────────┬─────────────────────┘
                │
        ┌───────┴───────┐
        │               │
   ┌────┴────┐     ┌────┴────┐
   │Concrete │     │Concrete │
   │HandlerA │     │HandlerB │
   │+handle()│     │+handle()│
   └─────────┘     └─────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 处理者接口
// ============================================

/**
 * 支持请求类型
 */
interface SupportRequest {
  type: 'technical' | 'billing' | 'general' | 'critical';
  description: string;
  priority: number;
}

/**
 * 处理结果
 */
interface HandlerResult {
  handled: boolean;
  handler: string;
  message: string;
}

/**
 * 支持处理者接口
 */
interface SupportHandler {
  setNext(handler: SupportHandler): SupportHandler;
  handle(request: SupportRequest): HandlerResult;
}

// ============================================
// 抽象处理者
// ============================================

/**
 * 抽象处理者基类
 */
abstract class AbstractSupportHandler implements SupportHandler {
  private nextHandler: SupportHandler | null = null;
  protected handlerName: string;

  constructor(name: string) {
    this.handlerName = name;
  }

  setNext(handler: SupportHandler): SupportHandler {
    this.nextHandler = handler;
    return handler;
  }

  handle(request: SupportRequest): HandlerResult {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return {
      handled: false,
      handler: 'None',
      message: `Request could not be handled: ${request.description}`
    };
  }

  protected canHandle(request: SupportRequest): boolean {
    return false;
  }

  protected process(request: SupportRequest): HandlerResult {
    return {
      handled: true,
      handler: this.handlerName,
      message: `${this.handlerName} handled: ${request.description}`
    };
  }
}

// ============================================
// 具体处理者
// ============================================

/**
 * 一线支持 - 处理一般问题
 */
class Level1Support extends AbstractSupportHandler {
  constructor() {
    super('Level 1 Support');
  }

  handle(request: SupportRequest): HandlerResult {
    if (request.type === 'general' && request.priority <= 3) {
      console.log(`${this.handlerName} handling general request`);
      return this.process(request);
    }
    console.log(`${this.handlerName} cannot handle, escalating...`);
    return super.handle(request);
  }
}

/**
 * 技术支持 - 处理技术问题
 */
class TechnicalSupport extends AbstractSupportHandler {
  constructor() {
    super('Technical Support');
  }

  handle(request: SupportRequest): HandlerResult {
    if (request.type === 'technical') {
      console.log(`${this.handlerName} handling technical request`);
      return this.process(request);
    }
    console.log(`${this.handlerName} cannot handle, escalating...`);
    return super.handle(request);
  }
}

/**
 * 账单支持 - 处理账单问题
 */
class BillingSupport extends AbstractSupportHandler {
  constructor() {
    super('Billing Support');
  }

  handle(request: SupportRequest): HandlerResult {
    if (request.type === 'billing') {
      console.log(`${this.handlerName} handling billing request`);
      return this.process(request);
    }
    console.log(`${this.handlerName} cannot handle, escalating...`);
    return super.handle(request);
  }
}

/**
 * 经理 - 处理高优先级和关键问题
 */
class Manager extends AbstractSupportHandler {
  constructor() {
    super('Manager');
  }

  handle(request: SupportRequest): HandlerResult {
    if (request.priority >= 4 || request.type === 'critical') {
      console.log(`${this.handlerName} handling high priority/critical request`);
      return this.process(request);
    }
    console.log(`${this.handlerName} cannot handle, escalating...`);
    return super.handle(request);
  }
}

// ============================================
// 另一个示例：中间件链
// ============================================

/**
 * HTTP请求
 */
interface HttpRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  body?: unknown;
}

/**
 * HTTP响应
 */
interface HttpResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

/**
 * 中间件接口
 */
interface Middleware {
  setNext(middleware: Middleware): Middleware;
  process(request: HttpRequest, response: HttpResponse): HttpResponse;
}

/**
 * 抽象中间件
 */
abstract class AbstractMiddleware implements Middleware {
  private nextMiddleware: Middleware | null = null;

  setNext(middleware: Middleware): Middleware {
    this.nextMiddleware = middleware;
    return middleware;
  }

  process(request: HttpRequest, response: HttpResponse): HttpResponse {
    const processedResponse = this.handle(request, response);
    if (this.nextMiddleware) {
      return this.nextMiddleware.process(request, processedResponse);
    }
    return processedResponse;
  }

  protected abstract handle(
    request: HttpRequest,
    response: HttpResponse
  ): HttpResponse;
}

/**
 * 日志中间件
 */
class LoggingMiddleware extends AbstractMiddleware {
  protected handle(request: HttpRequest, response: HttpResponse): HttpResponse {
    console.log(`[LOG] ${request.method} ${request.url}`);
    return response;
  }
}

/**
 * 认证中间件
 */
class AuthMiddleware extends AbstractMiddleware {
  protected handle(request: HttpRequest, response: HttpResponse): HttpResponse {
    const token = request.headers['Authorization'];
    if (!token) {
      return {
        status: 401,
        headers: {},
        body: { error: 'Unauthorized' }
      };
    }
    console.log('[AUTH] Token validated');
    return response;
  }
}

/**
 * 缓存中间件
 */
class CacheMiddleware extends AbstractMiddleware {
  private cache = new Map<string, HttpResponse>();

  protected handle(request: HttpRequest, response: HttpResponse): HttpResponse {
    if (request.method === 'GET') {
      const cached = this.cache.get(request.url);
      if (cached) {
        console.log('[CACHE] Cache hit');
        return { ...cached, headers: { ...cached.headers, 'X-Cache': 'HIT' } };
      }
      this.cache.set(request.url, response);
    }
    return response;
  }
}
```

#### 完整使用示例

```typescript
// 示例1：支持请求链
const level1 = new Level1Support();
const technical = new TechnicalSupport();
const billing = new BillingSupport();
const manager = new Manager();

// 构建责任链
level1.setNext(technical).setNext(billing).setNext(manager);

// 测试各种请求
const requests: SupportRequest[] = [
  { type: 'general', description: 'How do I reset my password?', priority: 2 },
  { type: 'technical', description: 'Server error 500', priority: 4 },
  { type: 'billing', description: 'Incorrect charge', priority: 3 },
  { type: 'critical', description: 'System down', priority: 5 },
  { type: 'general', description: 'Feature request', priority: 1 }
];

for (const request of requests) {
  console.log(`\n--- New Request: ${request.type} ---`);
  const result = level1.handle(request);
  console.log(`Result: ${result.message} (handled by: ${result.handler})`);
}

// 示例2：中间件链
const logging = new LoggingMiddleware();
const auth = new AuthMiddleware();
const cache = new CacheMiddleware();

// 构建中间件链
logging.setNext(auth).setNext(cache);

const request: HttpRequest = {
  url: '/api/users',
  method: 'GET',
  headers: { 'Authorization': 'Bearer token123' }
};

const response: HttpResponse = {
  status: 200,
  headers: {},
  body: { users: [] }
};

const finalResponse = logging.process(request, response);
console.log('Final response:', finalResponse);
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：处理者不调用下一个处理者
class BadHandler implements SupportHandler {
  private next: SupportHandler | null = null;

  setNext(handler: SupportHandler): SupportHandler {
    this.next = handler;
    return handler;
  }

  handle(request: SupportRequest): HandlerResult {
    if (this.canHandle(request)) {
      return { handled: true, handler: 'Bad', message: 'Handled' };
    }
    // 错误：没有调用下一个处理者
    return { handled: false, handler: 'None', message: 'Not handled' };
  }
}

// ❌ 错误2：循环链
const handler1 = new Level1Support();
const handler2 = new TechnicalSupport();
handler1.setNext(handler2);
handler2.setNext(handler1); // 循环！会导致无限递归

// ❌ 错误3：客户端知道具体处理者
class BadClient {
  constructor(
    private level1: Level1Support,
    private technical: TechnicalSupport
  ) {}

  process(request: SupportRequest): void {
    // 客户端不应该知道处理链的结构
    if (request.type === 'general') {
      this.level1.handle(request);
    } else if (request.type === 'technical') {
      this.technical.handle(request);
    }
  }
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 解耦发送者和接收者 | 请求可能未被处理 |
| 动态改变链 | 性能问题（遍历链） |
| 符合单一职责 | 调试困难 |
| 易于扩展新处理者 | 循环链风险 |

#### 与其他模式的关系

- **组合模式**: 责任链可以用组合模式实现
- **命令模式**: 请求可以封装为命令对象
- **装饰器模式**: 两者都使用链式结构

---

### 3.2 命令模式 (Command Pattern)

#### 定义与意图

**形式化定义**: 将一个请求封装为一个对象，从而使你可用不同的请求对客户进行参数化；对请求排队或记录请求日志，以及支持可撤销的操作。

$$
\text{Invoker} \xrightarrow{\text{Command}} \text{Receiver} \\
\text{（调用者）} \quad \text{（命令对象）} \quad \text{（接收者）}
$$

**意图**: 将请求封装为对象，支持请求的参数化、排队、日志和撤销。

#### 适用场景

- 需要将请求调用者和接收者解耦
- 需要支持撤销/重做
- 需要记录请求历史
- 需要组合多个请求

#### 先决条件

- 请求可以被参数化
- 需要支持操作的撤销
- 需要延迟或排队执行

#### UML类图

```
┌─────────────┐      ┌─────────────────┐      ┌─────────────┐
│   Invoker   │─────►│   <<interface>> │      │   Receiver  │
│  -command   │      │     Command     │─────►│  +action()  │
│  +execute() │      │  +execute()     │      └─────────────┘
└─────────────┘      │  +undo()        │
                     └────────┬────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              ┌─────┴─────┐       ┌─────┴─────┐
              │ Concrete  │       │ Concrete  │
              │ CommandA  │       │ CommandB  │
              │ +execute()│       │ +execute()│
              │ +undo()   │       │ +undo()   │
              └───────────┘       └───────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 命令接口
// ============================================

/**
 * 命令接口
 */
interface Command {
  execute(): void;
  undo(): void;
  getDescription(): string;
}

// ============================================
// 接收者
// ============================================

/**
 * 文本编辑器 - 接收者
 */
class TextEditor {
  private text = '';
  private selectionStart = 0;
  private selectionEnd = 0;

  getText(): string {
    return this.text;
  }

  insertText(position: number, text: string): void {
    this.text = this.text.slice(0, position) + text + this.text.slice(position);
  }

  deleteText(start: number, end: number): string {
    const deleted = this.text.slice(start, end);
    this.text = this.text.slice(0, start) + this.text.slice(end);
    return deleted;
  }

  setSelection(start: number, end: number): void {
    this.selectionStart = start;
    this.selectionEnd = end;
  }

  getSelection(): { start: number; end: number } {
    return { start: this.selectionStart, end: this.selectionEnd };
  }

  getSelectionText(): string {
    return this.text.slice(this.selectionStart, this.selectionEnd);
  }
}

// ============================================
// 具体命令
// ============================================

/**
 * 插入文本命令
 */
class InsertTextCommand implements Command {
  private editor: TextEditor;
  private position: number;
  private text: string;

  constructor(editor: TextEditor, position: number, text: string) {
    this.editor = editor;
    this.position = position;
    this.text = text;
  }

  execute(): void {
    this.editor.insertText(this.position, this.text);
  }

  undo(): void {
    this.editor.deleteText(this.position, this.position + this.text.length);
  }

  getDescription(): string {
    return `Insert "${this.text}" at position ${this.position}`;
  }
}

/**
 * 删除文本命令
 */
class DeleteTextCommand implements Command {
  private editor: TextEditor;
  private start: number;
  private end: number;
  private deletedText = '';

  constructor(editor: TextEditor, start: number, end: number) {
    this.editor = editor;
    this.start = start;
    this.end = end;
  }

  execute(): void {
    this.deletedText = this.editor.deleteText(this.start, this.end);
  }

  undo(): void {
    this.editor.insertText(this.start, this.deletedText);
  }

  getDescription(): string {
    return `Delete text from ${this.start} to ${this.end}`;
  }
}

/**
 * 复制粘贴命令
 */
class CopyPasteCommand implements Command {
  private editor: TextEditor;
  private pastePosition: number;
  private pastedText = '';

  constructor(editor: TextEditor, pastePosition: number) {
    this.editor = editor;
    this.pastePosition = pastePosition;
  }

  execute(): void {
    this.pastedText = this.editor.getSelectionText();
    this.editor.insertText(this.pastePosition, this.pastedText);
  }

  undo(): void {
    this.editor.deleteText(
      this.pastePosition,
      this.pastePosition + this.pastedText.length
    );
  }

  getDescription(): string {
    return `Paste "${this.pastedText}" at position ${this.pastePosition}`;
  }
}

// ============================================
// 调用者
// ============================================

/**
 * 命令历史管理器
 */
class CommandHistory {
  private history: Command[] = [];
  private currentIndex = -1;

  execute(command: Command): void {
    // 清除redo历史
    this.history = this.history.slice(0, this.currentIndex + 1);

    command.execute();
    this.history.push(command);
    this.currentIndex++;
    console.log(`Executed: ${command.getDescription()}`);
  }

  undo(): void {
    if (this.currentIndex >= 0) {
      const command = this.history[this.currentIndex];
      command.undo();
      this.currentIndex--;
      console.log(`Undone: ${command.getDescription()}`);
    } else {
      console.log('Nothing to undo');
    }
  }

  redo(): void {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      command.execute();
      console.log(`Redone: ${command.getDescription()}`);
    } else {
      console.log('Nothing to redo');
    }
  }

  getHistory(): string[] {
    return this.history.map((cmd, i) =>
      `${i === this.currentIndex ? '>' : ' '} ${cmd.getDescription()}`
    );
  }
}

// ============================================
// 宏命令
// ============================================

/**
 * 宏命令 - 组合多个命令
 */
class MacroCommand implements Command {
  private commands: Command[] = [];
  private description: string;

  constructor(description: string) {
    this.description = description;
  }

  add(command: Command): void {
    this.commands.push(command);
  }

  execute(): void {
    for (const command of this.commands) {
      command.execute();
    }
  }

  undo(): void {
    // 逆序撤销
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }

  getDescription(): string {
    return `Macro: ${this.description}`;
  }
}

// ============================================
// 另一个示例：遥控器
// ============================================

/**
 * 灯光 - 接收者
 */
class Light {
  private location: string;
  private isOn = false;

  constructor(location: string) {
    this.location = location;
  }

  on(): void {
    this.isOn = true;
    console.log(`${this.location} light is ON`);
  }

  off(): void {
    this.isOn = false;
    console.log(`${this.location} light is OFF`);
  }

  getState(): boolean {
    return this.isOn;
  }
}

/**
 * 开灯命令
 */
class LightOnCommand implements Command {
  private light: Light;

  constructor(light: Light) {
    this.light = light;
  }

  execute(): void {
    this.light.on();
  }

  undo(): void {
    this.light.off();
  }

  getDescription(): string {
    return 'Turn light ON';
  }
}

/**
 * 关灯命令
 */
class LightOffCommand implements Command {
  private light: Light;

  constructor(light: Light) {
    this.light = light;
  }

  execute(): void {
    this.light.off();
  }

  undo(): void {
    this.light.on();
  }

  getDescription(): string {
    return 'Turn light OFF';
  }
}

/**
 * 遥控器 - 调用者
 */
class RemoteControl {
  private commands: Map<string, Command> = new Map();
  private lastCommand: Command | null = null;

  setCommand(slot: string, command: Command): void {
    this.commands.set(slot, command);
  }

  pressButton(slot: string): void {
    const command = this.commands.get(slot);
    if (command) {
      command.execute();
      this.lastCommand = command;
    }
  }

  pressUndo(): void {
    if (this.lastCommand) {
      this.lastCommand.undo();
    }
  }
}
```

#### 完整使用示例

```typescript
// 示例1：文本编辑器
const editor = new TextEditor();
const history = new CommandHistory();

// 执行一系列操作
history.execute(new InsertTextCommand(editor, 0, 'Hello'));
console.log(`Text: "${editor.getText()}"`);

history.execute(new InsertTextCommand(editor, 5, ' World'));
console.log(`Text: "${editor.getText()}"`);

history.execute(new DeleteTextCommand(editor, 5, 11));
console.log(`Text: "${editor.getText()}"`);

// 撤销操作
history.undo();
console.log(`After undo: "${editor.getText()}"`);

history.undo();
console.log(`After undo: "${editor.getText()}"`);

// 重做
history.redo();
console.log(`After redo: "${editor.getText()}"`);

// 示例2：遥控器
const livingRoomLight = new Light('Living Room');
const kitchenLight = new Light('Kitchen');

const remote = new RemoteControl();
remote.setCommand('A', new LightOnCommand(livingRoomLight));
remote.setCommand('B', new LightOffCommand(livingRoomLight));
remote.setCommand('C', new LightOnCommand(kitchenLight));
remote.setCommand('D', new LightOffCommand(kitchenLight));

remote.pressButton('A'); // Living Room light is ON
remote.pressButton('C'); // Kitchen light is ON
remote.pressUndo(); // Kitchen light is OFF

// 示例3：宏命令
const partyMode = new MacroCommand('Party Mode');
partyMode.add(new LightOnCommand(livingRoomLight));
partyMode.add(new LightOnCommand(kitchenLight));

partyMode.execute();
partyMode.undo();
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：命令直接调用接收者，没有封装
class BadCommand {
  constructor(private editor: TextEditor) {}

  execute(): void {
    // 直接操作，没有封装请求
    this.editor.insertText(0, 'text');
  }

  // 没有undo方法
}

// ❌ 错误2：命令包含业务逻辑
class BadCommand2 implements Command {
  constructor(private editor: TextEditor) {}

  execute(): void {
    // 错误：命令不应该包含业务逻辑
    if (this.editor.getText().length > 100) {
      console.log('Text too long');
      return;
    }
    this.editor.insertText(0, 'text');
  }

  undo(): void {
    // ...
  }

  getDescription(): string {
    return '';
  }
}

// ❌ 错误3：调用者直接创建命令
class BadInvoker {
  private editor = new TextEditor();

  insertText(text: string): void {
    // 错误：调用者不应该知道如何创建命令
    const command = new InsertTextCommand(this.editor, 0, text);
    command.execute();
  }
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 解耦调用者和接收者 | 产生大量小类 |
| 支持撤销/重做 | 代码复杂度增加 |
| 支持命令队列 | 每个命令需要实现undo |
| 易于组合命令 | 可能过度设计简单场景 |

#### 与其他模式的关系

- **组合模式**: 宏命令使用组合模式
- **备忘录模式**: 用于实现命令的撤销
- **原型模式**: 可以克隆命令
- **责任链模式**: 可以用责任链处理命令

---

### 3.3 解释器模式 (Interpreter Pattern)

#### 定义与意图

**形式化定义**: 给定一个语言，定义它的文法的一种表示，并定义一个解释器，这个解释器使用该表示来解释语言中的句子。

$$
\text{Expression} \rightarrow \text{Terminal} \mid \text{NonTerminal}(\text{Expression}, ...)
$$

**意图**: 为特定领域语言(DSL)创建解释器。

#### 适用场景

- 需要解释特定领域语言
- 文法简单且稳定
- 效率不是关键
- 需要频繁添加新的表达式

#### 先决条件

- 文法相对简单
- 可以构建抽象语法树
- 效率要求不高

#### UML类图

```
┌─────────────────────────────────────────┐
│  <<interface>>                          │
│  Expression                             │
│  +interpret(context): number            │
└──────────────────┬──────────────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
┌──────┴──────┐          ┌─────┴─────────┐
│  Terminal   │          │  NonTerminal  │
│Expression   │          │  Expression   │
│ -value      │          │ -expressions  │
│+interpret() │          │+interpret()   │
└─────────────┘          └───────────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 表达式接口
// ============================================

/**
 * 表达式接口
 */
interface Expression {
  interpret(context: Map<string, number>): number;
  toString(): string;
}

// ============================================
// 终结符表达式
// ============================================

/**
 * 数字表达式
 */
class NumberExpression implements Expression {
  private value: number;

  constructor(value: number) {
    this.value = value;
  }

  interpret(): number {
    return this.value;
  }

  toString(): string {
    return this.value.toString();
  }
}

/**
 * 变量表达式
 */
class VariableExpression implements Expression {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  interpret(context: Map<string, number>): number {
    const value = context.get(this.name);
    if (value === undefined) {
      throw new Error(`Variable ${this.name} not defined`);
    }
    return value;
  }

  toString(): string {
    return this.name;
  }
}

// ============================================
// 非终结符表达式
// ============================================

/**
 * 加法表达式
 */
class AddExpression implements Expression {
  private left: Expression;
  private right: Expression;

  constructor(left: Expression, right: Expression) {
    this.left = left;
    this.right = right;
  }

  interpret(context: Map<string, number>): number {
    return this.left.interpret(context) + this.right.interpret(context);
  }

  toString(): string {
    return `(${this.left.toString()} + ${this.right.toString()})`;
  }
}

/**
 * 减法表达式
 */
class SubtractExpression implements Expression {
  private left: Expression;
  private right: Expression;

  constructor(left: Expression, right: Expression) {
    this.left = left;
    this.right = right;
  }

  interpret(context: Map<string, number>): number {
    return this.left.interpret(context) - this.right.interpret(context);
  }

  toString(): string {
    return `(${this.left.toString()} - ${this.right.toString()})`;
  }
}

/**
 * 乘法表达式
 */
class MultiplyExpression implements Expression {
  private left: Expression;
  private right: Expression;

  constructor(left: Expression, right: Expression) {
    this.left = left;
    this.right = right;
  }

  interpret(context: Map<string, number>): number {
    return this.left.interpret(context) * this.right.interpret(context);
  }

  toString(): string {
    return `(${this.left.toString()} * ${this.right.toString()})`;
  }
}

/**
 * 除法表达式
 */
class DivideExpression implements Expression {
  private left: Expression;
  private right: Expression;

  constructor(left: Expression, right: Expression) {
    this.left = left;
    this.right = right;
  }

  interpret(context: Map<string, number>): number {
    const divisor = this.right.interpret(context);
    if (divisor === 0) {
      throw new Error('Division by zero');
    }
    return this.left.interpret(context) / divisor;
  }

  toString(): string {
    return `(${this.left.toString()} / ${this.right.toString()})`;
  }
}

// ============================================
// 解析器
// ============================================

/**
 * 简单表达式解析器
 */
class ExpressionParser {
  private tokens: string[] = [];
  private position = 0;

  parse(expression: string): Expression {
    this.tokens = expression.match(/\d+|[a-zA-Z]+|[+\-*/()]/g) || [];
    this.position = 0;
    return this.parseExpression();
  }

  private parseExpression(): Expression {
    let left = this.parseTerm();

    while (this.currentToken() === '+' || this.currentToken() === '-') {
      const operator = this.consume();
      const right = this.parseTerm();
      if (operator === '+') {
        left = new AddExpression(left, right);
      } else {
        left = new SubtractExpression(left, right);
      }
    }

    return left;
  }

  private parseTerm(): Expression {
    let left = this.parseFactor();

    while (this.currentToken() === '*' || this.currentToken() === '/') {
      const operator = this.consume();
      const right = this.parseFactor();
      if (operator === '*') {
        left = new MultiplyExpression(left, right);
      } else {
        left = new DivideExpression(left, right);
      }
    }

    return left;
  }

  private parseFactor(): Expression {
    const token = this.consume();

    if (token === '(') {
      const expr = this.parseExpression();
      this.consume(); // consume ')'
      return expr;
    }

    if (/^\d+$/.test(token)) {
      return new NumberExpression(parseInt(token, 10));
    }

    return new VariableExpression(token);
  }

  private currentToken(): string {
    return this.tokens[this.position] || '';
  }

  private consume(): string {
    return this.tokens[this.position++] || '';
  }
}

// ============================================
// 另一个示例：规则引擎
// ============================================

/**
 * 规则表达式
 */
interface RuleExpression {
  evaluate(data: Record<string, unknown>): boolean;
}

/**
 * 比较表达式
 */
class ComparisonExpression implements RuleExpression {
  constructor(
    private field: string,
    private operator: '>' | '<' | '=' | '>=',
    private value: number
  ) {}

  evaluate(data: Record<string, unknown>): boolean {
    const fieldValue = data[this.field] as number;

    switch (this.operator) {
      case '>':
        return fieldValue > this.value;
      case '<':
        return fieldValue < this.value;
      case '=':
        return fieldValue === this.value;
      case '>=':
        return fieldValue >= this.value;
      default:
        return false;
    }
  }
}

/**
 * AND表达式
 */
class AndExpression implements RuleExpression {
  constructor(private expressions: RuleExpression[]) {}

  evaluate(data: Record<string, unknown>): boolean {
    return this.expressions.every((expr) => expr.evaluate(data));
  }
}

/**
 * OR表达式
 */
class OrExpression implements RuleExpression {
  constructor(private expressions: RuleExpression[]) {}

  evaluate(data: Record<string, unknown>): boolean {
    return this.expressions.some((expr) => expr.evaluate(data));
  }
}
```

#### 完整使用示例

```typescript
// 示例1：数学表达式
const parser = new ExpressionParser();
const expression = parser.parse('(a + b) * c');

const context = new Map<string, number>([
  ['a', 2],
  ['b', 3],
  ['c', 4]
]);

console.log(`Expression: ${expression.toString()}`);
console.log(`Result: ${expression.interpret(context)}`); // 20

// 更复杂的表达式
const expr2 = parser.parse('10 + 5 * 2');
console.log(`Expression: ${expr2.toString()}`);
console.log(`Result: ${expr2.interpret(new Map())}`); // 20

// 示例2：规则引擎
const rule = new AndExpression([
  new ComparisonExpression('age', '>=', 18),
  new ComparisonExpression('income', '>', 50000)
]);

const user1 = { age: 25, income: 60000 };
const user2 = { age: 16, income: 70000 };

console.log(`User1 passes: ${rule.evaluate(user1)}`); // true
console.log(`User2 passes: ${rule.evaluate(user2)}`); // false
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：文法过于复杂
// 解释器模式不适合复杂文法，应该使用解析器生成器

// ❌ 错误2：表达式不返回统一类型
interface BadExpression {
  interpret(): unknown; // 返回类型不统一
}

// ❌ 错误3：解释器包含解析逻辑
class BadExpression implements Expression {
  private expressionString: string;

  constructor(expr: string) {
    this.expressionString = expr;
  }

  interpret(): number {
    // 错误：解释器不应该包含解析逻辑
    return eval(this.expressionString); // 危险！
  }
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 易于改变和扩展文法 | 复杂文法难以维护 |
| 易于实现表达式 | 效率较低 |
| 符合单一职责 | 不适合复杂文法 |

#### 与其他模式的关系

- **组合模式**: 抽象语法树是组合结构
- **访问者模式**: 可以扩展解释器功能
- **享元模式**: 共享终结符表达式

---

### 3.4 迭代器模式 (Iterator Pattern)

#### 定义与意图

**形式化定义**: 提供一种方法顺序访问一个聚合对象中的各个元素，而又不需要暴露该对象的内部表示。

$$
\text{Iterator} \xrightarrow{\text{遍历}} \text{Aggregate}
$$

**意图**: 统一遍历集合的接口，隐藏内部实现。

#### 适用场景

- 需要访问聚合对象内容而不暴露内部表示
- 需要支持多种遍历方式
- 需要为不同的聚合结构提供统一的遍历接口

#### 先决条件

- 存在聚合对象
- 需要遍历聚合
- 聚合的内部结构可能变化

#### UML类图

```
┌─────────────────┐         ┌─────────────────┐
│   <<interface>> │         │   <<interface>> │
│    Iterator     │◄────────│   Aggregate     │
│  +hasNext()     │         │  +createIterator│
│  +next()        │         │     ():Iterator │
│  +current()     │         └────────┬────────┘
└────────┬────────┘                  │
         │                    ┌──────┴──────┐
         │                    │             │
   ┌─────┴─────┐        ┌─────┴─────┐ ┌─────┴─────┐
   │ Concrete  │        │ Concrete  │ │ Concrete  │
   │ Iterator  │        │AggregateA │ │AggregateB │
   │+hasNext() │        │+createIter│ │+createIter│
   │+next()    │        └───────────┘ └───────────┘
   └───────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 迭代器接口
// ============================================

/**
 * 泛型迭代器接口
 */
interface Iterator<T> {
  hasNext(): boolean;
  next(): T;
  current(): T;
  reset(): void;
}

// ============================================
// 聚合接口
// ============================================

/**
 * 可迭代聚合接口
 */
interface IterableCollection<T> {
  createIterator(): Iterator<T>;
  createReverseIterator(): Iterator<T>;
}

// ============================================
// 具体集合
// ============================================

/**
 * 书籍
 */
class Book {
  constructor(
    private title: string,
    private author: string,
    private year: number
  ) {}

  getTitle(): string {
    return this.title;
  }

  getAuthor(): string {
    return this.author;
  }

  getYear(): number {
    return this.year;
  }

  toString(): string {
    return `"${this.title}" by ${this.author} (${this.year})`;
  }
}

/**
 * 书架 - 具体聚合
 */
class BookShelf implements IterableCollection<Book> {
  private books: Book[] = [];

  addBook(book: Book): void {
    this.books.push(book);
  }

  getBookAt(index: number): Book {
    return this.books[index];
  }

  getLength(): number {
    return this.books.length;
  }

  createIterator(): Iterator<Book> {
    return new BookShelfIterator(this);
  }

  createReverseIterator(): Iterator<Book> {
    return new BookShelfReverseIterator(this);
  }
}

// ============================================
// 具体迭代器
// ============================================

/**
 * 正向迭代器
 */
class BookShelfIterator implements Iterator<Book> {
  private bookShelf: BookShelf;
  private index: number;

  constructor(bookShelf: BookShelf) {
    this.bookShelf = bookShelf;
    this.index = 0;
  }

  hasNext(): boolean {
    return this.index < this.bookShelf.getLength();
  }

  next(): Book {
    if (!this.hasNext()) {
      throw new Error('No more elements');
    }
    return this.bookShelf.getBookAt(this.index++);
  }

  current(): Book {
    return this.bookShelf.getBookAt(this.index);
  }

  reset(): void {
    this.index = 0;
  }
}

/**
 * 反向迭代器
 */
class BookShelfReverseIterator implements Iterator<Book> {
  private bookShelf: BookShelf;
  private index: number;

  constructor(bookShelf: BookShelf) {
    this.bookShelf = bookShelf;
    this.index = bookShelf.getLength() - 1;
  }

  hasNext(): boolean {
    return this.index >= 0;
  }

  next(): Book {
    if (!this.hasNext()) {
      throw new Error('No more elements');
    }
    return this.bookShelf.getBookAt(this.index--);
  }

  current(): Book {
    return this.bookShelf.getBookAt(this.index);
  }

  reset(): void {
    this.index = this.bookShelf.getLength() - 1;
  }
}

// ============================================
// TypeScript内置迭代器实现
// ============================================

/**
 * 使用生成器的迭代器
 */
class TreeNode<T> {
  value: T;
  left: TreeNode<T> | null = null;
  right: TreeNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

class BinaryTree<T> implements Iterable<T> {
  private root: TreeNode<T> | null = null;

  insert(value: T): void {
    this.root = this.insertNode(this.root, value);
  }

  private insertNode(node: TreeNode<T> | null, value: T): TreeNode<T> {
    if (node === null) {
      return new TreeNode(value);
    }
    if (value < node.value) {
      node.left = this.insertNode(node.left, value);
    } else {
      node.right = this.insertNode(node.right, value);
    }
    return node;
  }

  // 实现Symbol.iterator
  *[Symbol.iterator](): Iterator<T> {
    yield* this.inOrderTraversal(this.root);
  }

  private *inOrderTraversal(node: TreeNode<T> | null): Generator<T> {
    if (node) {
      yield* this.inOrderTraversal(node.left);
      yield node.value;
      yield* this.inOrderTraversal(node.right);
    }
  }

  // 前序遍历
  *preOrder(): Generator<T> {
    yield* this.preOrderTraversal(this.root);
  }

  private *preOrderTraversal(node: TreeNode<T> | null): Generator<T> {
    if (node) {
      yield node.value;
      yield* this.preOrderTraversal(node.left);
      yield* this.preOrderTraversal(node.right);
    }
  }
}
```

#### 完整使用示例

```typescript
// 示例1：书架迭代
const bookShelf = new BookShelf();
bookShelf.addBook(new Book('Design Patterns', 'GoF', 1994));
bookShelf.addBook(new Book('Clean Code', 'Robert Martin', 2008));
bookShelf.addBook(new Book('Refactoring', 'Martin Fowler', 1999));

// 正向遍历
console.log('Forward iteration:');
const iterator = bookShelf.createIterator();
while (iterator.hasNext()) {
  console.log(iterator.next().toString());
}

// 反向遍历
console.log('\nReverse iteration:');
const reverseIterator = bookShelf.createReverseIterator();
while (reverseIterator.hasNext()) {
  console.log(reverseIterator.next().toString());
}

// 示例2：二叉树遍历
const tree = new BinaryTree<number>();
tree.insert(5);
tree.insert(3);
tree.insert(7);
tree.insert(1);
tree.insert(4);
tree.insert(6);
tree.insert(8);

console.log('\nIn-order traversal:');
for (const value of tree) {
  console.log(value);
}

console.log('\nPre-order traversal:');
for (const value of tree.preOrder()) {
  console.log(value);
}
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：聚合暴露内部表示
class BadCollection<T> {
  public items: T[] = []; // 不应该暴露内部数组

  // 客户端可以直接修改items，破坏封装
}

// ❌ 错误2：迭代器修改集合
class BadIterator<T> implements Iterator<T> {
  private collection: T[];
  private index = 0;

  constructor(collection: T[]) {
    this.collection = collection;
  }

  next(): T {
    // 错误：迭代器不应该修改集合
    return this.collection.pop()!;
  }

  hasNext(): boolean {
    return this.collection.length > 0;
  }

  current(): T {
    return this.collection[this.index];
  }

  reset(): void {
    this.index = 0;
  }
}

// ❌ 错误3：迭代器不检查边界
class BadIterator2<T> implements Iterator<T> {
  private collection: T[];
  private index = 0;

  constructor(collection: T[]) {
    this.collection = collection;
  }

  next(): T {
    // 错误：没有检查hasNext
    return this.collection[this.index++];
  }

  hasNext(): boolean {
    return this.index < this.collection.length;
  }

  current(): T {
    throw new Error('Not implemented');
  }

  reset(): void {
    this.index = 0;
  }
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 统一遍历接口 | 增加代码量 |
| 隐藏内部实现 | 简单场景可能过度设计 |
| 支持多种遍历方式 | 遍历期间修改集合的问题 |
| 符合单一职责 | 额外的间接层 |

#### 与其他模式的关系

- **组合模式**: 迭代器常用于遍历组合结构
- **工厂方法**: 聚合使用工厂方法创建迭代器
- **备忘录模式**: 用于保存迭代状态

---

### 3.5 中介者模式 (Mediator Pattern)

#### 定义与意图

**形式化定义**: 用一个中介对象来封装一系列的对象交互。中介者使各对象不需要显式地相互引用，从而使其耦合松散，而且可以独立地改变它们之间的交互。

$$
\text{Colleague}_i \leftrightarrow \text{Mediator} \leftrightarrow \text{Colleague}_j
$$

**意图**: 集中管理对象间的交互，减少对象间的直接依赖。

#### 适用场景

- 对象间有复杂的引用关系
- 需要集中控制交互逻辑
- 需要解耦多个对象
- 对象间的关系动态变化

#### 先决条件

- 多个对象相互通信
- 通信逻辑复杂
- 需要集中管理

#### UML类图

```
        ┌─────────────────────────────────────┐
        │           <<interface>>             │
        │            Mediator                 │
        │  +send(message, colleague)          │
        └─────────────────┬───────────────────┘
                          │
                    ┌─────┴─────┐
                    │ Concrete  │
                    │ Mediator  │
                    └─────┬─────┘
                          │
            ┌─────────────┼─────────────┐
            │             │             │
      ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐
      │ Colleague │ │ Colleague │ │ Colleague │
      │    A      │ │    B      │ │    C      │
      └───────────┘ └───────────┘ └───────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 中介者接口
// ============================================

/**
 * 聊天中介者接口
 */
interface ChatMediator {
  sendMessage(message: string, user: User): void;
  addUser(user: User): void;
}

// ============================================
// 同事类
// ============================================

/**
 * 用户 - 同事类
 */
abstract class User {
  protected mediator: ChatMediator;
  protected name: string;

  constructor(mediator: ChatMediator, name: string) {
    this.mediator = mediator;
    this.name = name;
  }

  abstract send(message: string): void;
  abstract receive(message: string, from: string): void;

  getName(): string {
    return this.name;
  }
}

/**
 * 具体用户
 */
class ChatUser extends User {
  send(message: string): void {
    console.log(`${this.name} sends: ${message}`);
    this.mediator.sendMessage(message, this);
  }

  receive(message: string, from: string): void {
    console.log(`${this.name} receives from ${from}: ${message}`);
  }
}

// ============================================
// 具体中介者
// ============================================

/**
 * 聊天室中介者
 */
class ChatRoom implements ChatMediator {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
    console.log(`${user.getName()} joined the chat`);
  }

  sendMessage(message: string, sender: User): void {
    for (const user of this.users) {
      // 不发送给自己
      if (user !== sender) {
        user.receive(message, sender.getName());
      }
    }
  }
}

// ============================================
// 另一个示例：组件协调
// ============================================

/**
 * 组件事件
 */
interface ComponentEvent {
  source: string;
  type: string;
  data?: unknown;
}

/**
 * 组件接口
 */
interface Component {
  getName(): string;
  onEvent(event: ComponentEvent): void;
  setMediator(mediator: ComponentMediator): void;
}

/**
 * 组件中介者
 */
interface ComponentMediator {
  notify(sender: Component, event: ComponentEvent): void;
  registerComponent(component: Component): void;
}

/**
 * 按钮组件
 */
class Button implements Component {
  private name: string;
  private mediator: ComponentMediator | null = null;
  private enabled = true;

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  setMediator(mediator: ComponentMediator): void {
    this.mediator = mediator;
  }

  click(): void {
    if (this.enabled && this.mediator) {
      this.mediator.notify(this, {
        source: this.name,
        type: 'click'
      });
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  onEvent(event: ComponentEvent): void {
    if (event.type === 'enable') {
      this.setEnabled(true);
    } else if (event.type === 'disable') {
      this.setEnabled(false);
    }
  }
}

/**
 * 文本框组件
 */
class TextBox implements Component {
  private name: string;
  private mediator: ComponentMediator | null = null;
  private text = '';

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  setMediator(mediator: ComponentMediator): void {
    this.mediator = mediator;
  }

  setText(text: string): void {
    this.text = text;
    if (this.mediator) {
      this.mediator.notify(this, {
        source: this.name,
        type: 'textChanged',
        data: text
      });
    }
  }

  getText(): string {
    return this.text;
  }

  clear(): void {
    this.text = '';
  }

  onEvent(): void {
    // 处理事件
  }
}

/**
 * 对话框中介者
 */
class DialogMediator implements ComponentMediator {
  private components: Map<string, Component> = new Map();
  private submitButton: Button;
  private cancelButton: Button;
  private nameField: TextBox;
  private emailField: TextBox;

  constructor() {
    this.submitButton = new Button('Submit');
    this.cancelButton = new Button('Cancel');
    this.nameField = new TextBox('Name');
    this.emailField = new TextBox('Email');

    this.registerComponent(this.submitButton);
    this.registerComponent(this.cancelButton);
    this.registerComponent(this.nameField);
    this.registerComponent(this.emailField);
  }

  registerComponent(component: Component): void {
    this.components.set(component.getName(), component);
    component.setMediator(this);
  }

  notify(sender: Component, event: ComponentEvent): void {
    if (sender === this.nameField || sender === this.emailField) {
      if (event.type === 'textChanged') {
        this.validateForm();
      }
    } else if (sender === this.submitButton && event.type === 'click') {
      this.submitForm();
    } else if (sender === this.cancelButton && event.type === 'click') {
      this.cancelForm();
    }
  }

  private validateForm(): void {
    const nameValid = this.nameField.getText().length > 0;
    const emailValid = this.emailField.getText().includes('@');
    const isValid = nameValid && emailValid;

    this.submitButton.setEnabled(isValid);
    console.log(`Form validation: ${isValid ? 'valid' : 'invalid'}`);
  }

  private submitForm(): void {
    console.log('Form submitted:');
    console.log(`  Name: ${this.nameField.getText()}`);
    console.log(`  Email: ${this.emailField.getText()}`);
  }

  private cancelForm(): void {
    this.nameField.clear();
    this.emailField.clear();
    this.submitButton.setEnabled(false);
    console.log('Form cancelled');
  }

  getNameField(): TextBox {
    return this.nameField;
  }

  getEmailField(): TextBox {
    return this.emailField;
  }

  getSubmitButton(): Button {
    return this.submitButton;
  }

  getCancelButton(): Button {
    return this.cancelButton;
  }
}
```

#### 完整使用示例

```typescript
// 示例1：聊天室
const chatRoom = new ChatRoom();

const user1 = new ChatUser(chatRoom, 'Alice');
const user2 = new ChatUser(chatRoom, 'Bob');
const user3 = new ChatUser(chatRoom, 'Charlie');

chatRoom.addUser(user1);
chatRoom.addUser(user2);
chatRoom.addUser(user3);

user1.send('Hello everyone!');
user2.send('Hi Alice!');

// 示例2：对话框
const dialog = new DialogMediator();

const nameField = dialog.getNameField();
const emailField = dialog.getEmailField();
const submitButton = dialog.getSubmitButton();

// 输入名称
nameField.setText('John');
// 输入邮箱
emailField.setText('john@example.com');

// 提交
submitButton.click();

// 清空
const cancelButton = dialog.getCancelButton();
cancelButton.click();
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：同事类直接通信
class BadUser {
  private otherUsers: BadUser[] = []; // 直接引用其他同事

  send(message: string): void {
    // 错误：直接发送给其他用户
    for (const user of this.otherUsers) {
      user.receive(message);
    }
  }
}

// ❌ 错误2：中介者包含业务逻辑
class BadMediator implements ChatMediator {
  sendMessage(message: string, user: User): void {
    // 错误：中介者不应该包含业务逻辑
    if (message.includes('spam')) {
      this.blockUser(user);
    }
    // ...
  }
}

// ❌ 错误3：中介者成为上帝对象
class BadMediator2 {
  // 包含太多职责
  private users: User[] = [];
  private messages: Message[] = [];
  private permissions: Permission[] = [];
  private settings: Settings = {};
  // ... 太多状态
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 减少对象间耦合 | 中介者可能变得复杂 |
| 集中控制交互 | 中介者成为瓶颈 |
| 易于修改交互逻辑 | 可能违反单一职责 |
| 复用同事类 | 调试困难 |

#### 与其他模式的关系

- **外观模式**: 外观简化接口，中介者集中控制
- **观察者模式**: 中介者可以用观察者实现
- **单例模式**: 中介者通常是单例

---

### 3.6 备忘录模式 (Memento Pattern)

#### 定义与意图

**形式化定义**: 在不破坏封装性的前提下，捕获一个对象的内部状态，并在该对象之外保存这个状态。这样以后就可将该对象恢复到原先保存的状态。

$$
\text{Originator} \xrightarrow{\text{createMemento()}} \text{Memento} \\
\text{Originator} \xleftarrow{\text{restore(memento)}} \text{Memento}
$$

**意图**: 保存和恢复对象的内部状态。

#### 适用场景

- 需要保存对象状态的快照
- 需要实现撤销功能
- 需要避免暴露对象内部实现
- 需要检查点功能

#### 先决条件

- 对象状态可以被保存
- 状态恢复是可行的
- 需要隐藏内部实现

#### UML类图

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │      │  Originator  │      │   Memento   │
│             │      │  +createMemento│     │  -state     │
│             │◄────►│  +restore()  │◄────►│  +getState()│
└─────────────┘      └──────────────┘      └─────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │   Caretaker  │
                       │  -mementos   │
                       │  +add()      │
                       │  +get()      │
                       └──────────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 备忘录接口（窄接口）
// ============================================

/**
 * 备忘录接口 - 对外暴露的接口
 */
interface Memento {
  getName(): string;
  getDate(): string;
}

// ============================================
// 具体备忘录
// ============================================

/**
 * 编辑器备忘录 - 包含完整状态
 */
class EditorMemento implements Memento {
  private state: EditorState;
  private date: string;

  constructor(state: EditorState) {
    this.state = { ...state }; // 深拷贝
    this.date = new Date().toISOString();
  }

  getState(): EditorState {
    return { ...this.state };
  }

  getName(): string {
    return `${this.date} / (${this.state.content.substring(0, 20)}...)`;
  }

  getDate(): string {
    return this.date;
  }
}

/**
 * 编辑器状态
 */
interface EditorState {
  content: string;
  cursorPosition: number;
  selectionStart: number;
  selectionEnd: number;
}

// ============================================
// 原发器
// ============================================

/**
 * 文本编辑器 - 原发器
 */
class TextEditor {
  private content = '';
  private cursorPosition = 0;
  private selectionStart = 0;
  private selectionEnd = 0;

  setContent(content: string): void {
    this.content = content;
  }

  getContent(): string {
    return this.content;
  }

  setCursorPosition(position: number): void {
    this.cursorPosition = position;
  }

  setSelection(start: number, end: number): void {
    this.selectionStart = start;
    this.selectionEnd = end;
  }

  getSelection(): string {
    return this.content.substring(this.selectionStart, this.selectionEnd);
  }

  /**
   * 创建备忘录
   */
  save(): Memento {
    return new EditorMemento({
      content: this.content,
      cursorPosition: this.cursorPosition,
      selectionStart: this.selectionStart,
      selectionEnd: this.selectionEnd
    });
  }

  /**
   * 从备忘录恢复
   */
  restore(memento: Memento): void {
    if (!(memento instanceof EditorMemento)) {
      throw new Error('Invalid memento');
    }
    const state = memento.getState();
    this.content = state.content;
    this.cursorPosition = state.cursorPosition;
    this.selectionStart = state.selectionStart;
    this.selectionEnd = state.selectionEnd;
  }

  getState(): string {
    return `Content: "${this.content.substring(0, 30)}...", Cursor: ${this.cursorPosition}`;
  }
}

// ============================================
// 负责人
// ============================================

/**
 * 历史记录管理器 - 负责人
 */
class History {
  private mementos: Memento[] = [];
  private currentIndex = -1;

  backup(memento: Memento): void {
    // 删除当前位置之后的所有备忘录
    this.mementos = this.mementos.slice(0, this.currentIndex + 1);
    this.mementos.push(memento);
    this.currentIndex++;
  }

  undo(): Memento | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.mementos[this.currentIndex];
    }
    return null;
  }

  redo(): Memento | null {
    if (this.currentIndex < this.mementos.length - 1) {
      this.currentIndex++;
      return this.mementos[this.currentIndex];
    }
    return null;
  }

  showHistory(): void {
    console.log('History:');
    for (let i = 0; i < this.mementos.length; i++) {
      const marker = i === this.currentIndex ? '> ' : '  ';
      console.log(`${marker}${i}: ${this.mementos[i].getName()}`);
    }
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }
}

// ============================================
// 另一个示例：游戏存档
// ============================================

/**
 * 游戏状态
 */
interface GameState {
  level: number;
  health: number;
  position: { x: number; y: number };
  inventory: string[];
}

/**
 * 游戏存档
 */
class GameSave implements Memento {
  private state: GameState;
  private saveName: string;
  private date: string;

  constructor(name: string, state: GameState) {
    this.saveName = name;
    this.state = JSON.parse(JSON.stringify(state)); // 深拷贝
    this.date = new Date().toISOString();
  }

  getState(): GameState {
    return JSON.parse(JSON.stringify(this.state));
  }

  getName(): string {
    return this.saveName;
  }

  getDate(): string {
    return this.date;
  }
}

/**
 * 游戏角色 - 原发器
 */
class GameCharacter {
  private level = 1;
  private health = 100;
  private position = { x: 0, y: 0 };
  private inventory: string[] = [];

  levelUp(): void {
    this.level++;
    this.health = 100;
    console.log(`Leveled up to ${this.level}!`);
  }

  takeDamage(damage: number): void {
    this.health = Math.max(0, this.health - damage);
    console.log(`Took ${damage} damage. Health: ${this.health}`);
  }

  move(x: number, y: number): void {
    this.position = { x, y };
    console.log(`Moved to (${x}, ${y})`);
  }

  addItem(item: string): void {
    this.inventory.push(item);
    console.log(`Added ${item} to inventory`);
  }

  save(name: string): Memento {
    return new GameSave(name, {
      level: this.level,
      health: this.health,
      position: { ...this.position },
      inventory: [...this.inventory]
    });
  }

  restore(memento: Memento): void {
    if (!(memento instanceof GameSave)) {
      throw new Error('Invalid save file');
    }
    const state = memento.getState();
    this.level = state.level;
    this.health = state.health;
    this.position = state.position;
    this.inventory = state.inventory;
    console.log(`Game restored from: ${memento.getName()}`);
  }

  getStatus(): string {
    return `Level: ${this.level}, Health: ${this.health}, Position: (${this.position.x}, ${this.position.y}), Inventory: [${this.inventory.join(', ')}]`;
  }
}

/**
 * 存档管理器
 */
class SaveManager {
  private saves: Map<string, Memento> = new Map();

  save(name: string, memento: Memento): void {
    this.saves.set(name, memento);
    console.log(`Save "${name}" created`);
  }

  load(name: string): Memento | null {
    return this.saves.get(name) || null;
  }

  listSaves(): string[] {
    return Array.from(this.saves.keys());
  }

  deleteSave(name: string): void {
    this.saves.delete(name);
  }
}
```

#### 完整使用示例

```typescript
// 示例1：文本编辑器撤销/重做
const editor = new TextEditor();
const history = new History();

// 初始状态
editor.setContent('Hello');
history.backup(editor.save());

// 修改
editor.setContent('Hello World');
editor.setCursorPosition(11);
history.backup(editor.save());

// 更多修改
editor.setContent('Hello World!');
history.backup(editor.save());

// 显示历史
history.showHistory();

// 撤销
const undoMemento = history.undo();
if (undoMemento) {
  editor.restore(undoMemento);
  console.log('After undo:', editor.getState());
}

// 重做
const redoMemento = history.redo();
if (redoMemento) {
  editor.restore(redoMemento);
  console.log('After redo:', editor.getState());
}

// 示例2：游戏存档
const player = new GameCharacter();
const saveManager = new SaveManager();

// 游戏进度
player.levelUp();
player.move(10, 20);
player.addItem('Sword');
player.addItem('Shield');
console.log(player.getStatus());

// 存档
saveManager.save('level2', player.save('Before Boss'));

// 继续游戏
player.takeDamage(30);
player.levelUp();
console.log(player.getStatus());

// 另一个存档
saveManager.save('level3', player.save('After Level Up'));

// 加载旧存档
const oldSave = saveManager.load('level2');
if (oldSave) {
  player.restore(oldSave);
  console.log('After restore:', player.getStatus());
}
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：备忘录暴露内部状态
class BadMemento {
  public state: EditorState; // 不应该公开

  constructor(state: EditorState) {
    this.state = state;
  }
}

// ❌ 错误2：原发器不创建备忘录的副本
class BadEditor {
  save(): Memento {
    // 错误：返回引用而非副本
    return new BadMemento(this.state);
  }
}

// ❌ 错误3：负责人修改备忘录
class BadHistory {
  private mementos: Memento[] = [];

  modifyMemento(index: number, newState: EditorState): void {
    // 错误：负责人不应该修改备忘录
    (this.mementos[index] as BadMemento).state = newState;
  }
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 不破坏封装性 | 内存开销大 |
| 简化原发器 | 维护成本高 |
| 支持撤销/重做 | 可能影响性能 |
| 状态管理集中 | 深拷贝可能复杂 |

#### 与其他模式的关系

- **命令模式**: 命令可以使用备忘录实现撤销
- **迭代器模式**: 可以遍历备忘录历史
- **原型模式**: 备忘录可以用原型实现

---

### 3.7 观察者模式 (Observer Pattern)

#### 定义与意图

**形式化定义**: 定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都得到通知并被自动更新。

$$
\text{Subject} \xrightarrow{\text{notify()}} \text{Observer}_1, \text{Observer}_2, ..., \text{Observer}_n
$$

**意图**: 建立对象间的发布-订阅机制，实现松耦合通信。

#### 适用场景

- 一个对象的改变需要同时改变其他对象
- 需要事件处理系统
- 需要解耦发布者和订阅者
- 需要支持广播通信

#### 先决条件

- 存在一对多关系
- 对象状态变化需要通知
- 需要松耦合

#### UML类图

```
┌─────────────────────────────────────────┐
│           <<interface>>                 │
│           Subject                       │
│  +attach(observer: Observer)            │
│  +detach(observer: Observer)            │
│  +notify()                              │
└──────────────────┬──────────────────────┘
                   │
            ┌──────┴──────┐
            │ Concrete    │
            │  Subject    │
            │  -observers │
            │  -state     │
            └─────────────┘
                   │
                   ▼ notifies
┌─────────────────────────────────────────┐
│           <<interface>>                 │
│           Observer                      │
│  +update(subject: Subject)              │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────┴────┐           ┌────┴────┐
   │Concrete │           │Concrete │
   │Observer1│           │Observer2│
   └─────────┘           └─────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 观察者接口
// ============================================

/**
 * 观察者接口
 */
interface Observer {
  update(subject: Subject): void;
  getId(): string;
}

// ============================================
// 主题接口
// ============================================

/**
 * 主题接口
 */
interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(): void;
}

// ============================================
// 具体主题
// ============================================

/**
 * 天气数据 - 具体主题
 */
class WeatherData implements Subject {
  private observers: Observer[] = [];
  private temperature = 0;
  private humidity = 0;
  private pressure = 0;

  attach(observer: Observer): void {
    const isExist = this.observers.includes(observer);
    if (isExist) {
      console.log('Observer already attached');
      return;
    }
    this.observers.push(observer);
    console.log(`Observer ${observer.getId()} attached`);
  }

  detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index === -1) {
      console.log('Observer not found');
      return;
    }
    this.observers.splice(index, 1);
    console.log(`Observer ${observer.getId()} detached`);
  }

  notify(): void {
    console.log('Notifying observers...');
    for (const observer of this.observers) {
      observer.update(this);
    }
  }

  /**
   * 测量数据变化时调用
   */
  measurementsChanged(): void {
    this.notify();
  }

  setMeasurements(temperature: number, humidity: number, pressure: number): void {
    this.temperature = temperature;
    this.humidity = humidity;
    this.pressure = pressure;
    this.measurementsChanged();
  }

  getTemperature(): number {
    return this.temperature;
  }

  getHumidity(): number {
    return this.humidity;
  }

  getPressure(): number {
    return this.pressure;
  }
}

// ============================================
// 具体观察者
// ============================================

/**
 * 当前条件显示 - 观察者
 */
class CurrentConditionsDisplay implements Observer {
  private id: string;
  private temperature = 0;
  private humidity = 0;

  constructor(id: string) {
    this.id = id;
  }

  update(subject: Subject): void {
    if (subject instanceof WeatherData) {
      this.temperature = subject.getTemperature();
      this.humidity = subject.getHumidity();
      this.display();
    }
  }

  display(): void {
    console.log(
      `${this.id} - Current conditions: ${this.temperature}°C, ${this.humidity}% humidity`
    );
  }

  getId(): string {
    return this.id;
  }
}

/**
 * 统计显示 - 观察者
 */
class StatisticsDisplay implements Observer {
  private id: string;
  private temperatures: number[] = [];

  constructor(id: string) {
    this.id = id;
  }

  update(subject: Subject): void {
    if (subject instanceof WeatherData) {
      this.temperatures.push(subject.getTemperature());
      this.display();
    }
  }

  display(): void {
    const avg =
      this.temperatures.reduce((a, b) => a + b, 0) / this.temperatures.length;
    const max = Math.max(...this.temperatures);
    const min = Math.min(...this.temperatures);
    console.log(
      `${this.id} - Avg/Max/Min: ${avg.toFixed(1)}/${max}/${min}`
    );
  }

  getId(): string {
    return this.id;
  }
}

/**
 * 预测显示 - 观察者
 */
class ForecastDisplay implements Observer {
  private id: string;
  private lastPressure = 0;
  private currentPressure = 0;

  constructor(id: string) {
    this.id = id;
  }

  update(subject: Subject): void {
    if (subject instanceof WeatherData) {
      this.lastPressure = this.currentPressure;
      this.currentPressure = subject.getPressure();
      this.display();
    }
  }

  display(): void {
    let forecast = 'Forecast: ';
    if (this.currentPressure > this.lastPressure) {
      forecast += 'Improving weather!';
    } else if (this.currentPressure === this.lastPressure) {
      forecast += 'More of the same';
    } else {
      forecast += 'Watch out for cooler, rainy weather';
    }
    console.log(`${this.id} - ${forecast}`);
  }

  getId(): string {
    return this.id;
  }
}

// ============================================
// TypeScript内置EventEmitter实现
// ============================================

type EventCallback = (...args: unknown[]) => void;

/**
 * 事件发射器 - TypeScript风格实现
 */
class EventEmitter {
  private listeners: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    // 返回取消订阅函数
    return () => this.off(event, callback);
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: unknown[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const callback of callbacks) {
        callback(...args);
      }
    }
  }

  once(event: string, callback: EventCallback): void {
    const onceCallback = (...args: unknown[]) => {
      this.off(event, onceCallback);
      callback(...args);
    };
    this.on(event, onceCallback);
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// ============================================
// 使用TypeScript的Proxy实现响应式
// ============================================

/**
 * 响应式对象创建器
 */
function createReactive<T extends object>(
  target: T,
  onChange: (key: string, value: unknown) => void
): T {
  return new Proxy(target, {
    set(obj, prop, value) {
      const key = String(prop);
      const oldValue = obj[prop as keyof T];
      (obj as Record<string, unknown>)[key] = value;
      if (oldValue !== value) {
        onChange(key, value);
      }
      return true;
    }
  });
}
```

#### 完整使用示例

```typescript
// 示例1：气象站
const weatherData = new WeatherData();

const currentDisplay = new CurrentConditionsDisplay('Current');
const statisticsDisplay = new StatisticsDisplay('Statistics');
const forecastDisplay = new ForecastDisplay('Forecast');

weatherData.attach(currentDisplay);
weatherData.attach(statisticsDisplay);
weatherData.attach(forecastDisplay);

weatherData.setMeasurements(25, 65, 1013);
weatherData.setMeasurements(26, 70, 1012);
weatherData.setMeasurements(24, 90, 1010);

weatherData.detach(forecastDisplay);
weatherData.setMeasurements(22, 85, 1008);

// 示例2：事件发射器
const emitter = new EventEmitter();

const unsubscribe1 = emitter.on('data', (data) => {
  console.log('Received data:', data);
});

const unsubscribe2 = emitter.on('error', (error) => {
  console.error('Error:', error);
});

emitter.emit('data', { message: 'Hello' });
emitter.emit('error', new Error('Something went wrong'));

unsubscribe1(); // 取消订阅
emitter.emit('data', { message: 'This will not be received' });

// 示例3：响应式对象
interface User {
  name: string;
  age: number;
}

const user = createReactive<User>(
  { name: 'John', age: 30 },
  (key, value) => {
    console.log(`Property ${key} changed to ${value}`);
  }
);

user.name = 'Jane'; // Property name changed to Jane
user.age = 31; // Property age changed to 31
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：观察者直接访问主题内部状态
class BadObserver implements Observer {
  update(subject: Subject): void {
    // 错误：应该通过getter访问，而不是直接访问内部状态
    if (subject instanceof WeatherData) {
      // 不要这样做：
      // const temp = (subject as any).temperature;
    }
  }
}

// ❌ 错误2：主题在通知时修改观察者列表
class BadSubject implements Subject {
  private observers: Observer[] = [];

  notify(): void {
    for (const observer of this.observers) {
      observer.update(this);
      // 错误：在遍历时修改数组
      this.detach(observer);
    }
  }
}

// ❌ 错误3：观察者循环引用
class BadObserver2 implements Observer {
  private subject: Subject;

  constructor(subject: Subject) {
    this.subject = subject;
    subject.attach(this);
  }

  update(): void {
    // 可能导致循环更新
    this.subject.notify();
  }
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 松耦合 | 可能导致内存泄漏 |
| 支持广播 | 通知顺序不确定 |
| 符合开闭原则 | 调试困难 |
| 动态关系 | 可能意外触发更新 |

#### 与其他模式的关系

- **中介者模式**: 观察者是一种特殊的中介者
- **单例模式**: 主题通常是单例
- **备忘录模式**: 观察者状态可以用备忘录保存

---

### 3.8 状态模式 (State Pattern)

#### 定义与意图

**形式化定义**: 允许对象在其内部状态改变时改变它的行为。对象看起来似乎修改了它的类。

$$
\text{Context} \xrightarrow{\text{state.handle()}} \text{State}_i \xrightarrow{\text{transition}} \text{State}_j
$$

**意图**: 将状态相关的行为封装到独立的状态类中。

#### 适用场景

- 对象行为依赖于其状态
- 需要处理大量条件语句
- 状态转换复杂
- 需要添加新状态

#### 先决条件

- 对象有明确的状态
- 状态影响行为
- 状态可以转换

#### UML类图

```
┌─────────────────────────────────────────┐
│           Context                       │
│  -state: State                          │
│  +request()                             │
│  +setState(state: State)                │
└──────────────────┬──────────────────────┘
                   │ uses
                   ▼
┌─────────────────────────────────────────┐
│           <<interface>>                 │
│           State                         │
│  +handle(context: Context)              │
│  +getName(): string                     │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        │          │          │          │
   ┌────┴────┐┌────┴────┐┌────┴────┐┌────┴────┐
   │ StateA  ││ StateB  ││ StateC  ││ StateD  │
   │+handle()││+handle()││+handle()││+handle()│
   └─────────┘└─────────┘└─────────┘└─────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 状态接口
// ============================================

/**
 * 文档状态接口
 */
interface DocumentState {
  publish(document: Document): void;
  reject(document: Document): void;
  getName(): string;
}

// ============================================
// 上下文
// ============================================

/**
 * 文档 - 上下文
 */
class Document {
  private state: DocumentState;
  private content: string;
  private author: string;

  constructor(content: string, author: string) {
    this.content = content;
    this.author = author;
    this.state = new DraftState(); // 初始状态
  }

  setState(state: DocumentState): void {
    console.log(`Transitioning from ${this.state.getName()} to ${state.getName()}`);
    this.state = state;
  }

  publish(): void {
    this.state.publish(this);
  }

  reject(): void {
    this.state.reject(this);
  }

  getContent(): string {
    return this.content;
  }

  getAuthor(): string {
    return this.author;
  }

  getStateName(): string {
    return this.state.getName();
  }
}

// ============================================
// 具体状态
// ============================================

/**
 * 草稿状态
 */
class DraftState implements DocumentState {
  publish(document: Document): void {
    console.log('Submitting document for moderation...');
    document.setState(new ModerationState());
  }

  reject(document: Document): void {
    console.log('Draft rejected and discarded');
    document.setState(new RejectedState());
  }

  getName(): string {
    return 'Draft';
  }
}

/**
 * 审核中状态
 */
class ModerationState implements DocumentState {
  publish(document: Document): void {
    console.log('Document approved and published!');
    document.setState(new PublishedState());
  }

  reject(document: Document): void {
    console.log('Document rejected, returning to draft');
    document.setState(new DraftState());
  }

  getName(): string {
    return 'Moderation';
  }
}

/**
 * 已发布状态
 */
class PublishedState implements DocumentState {
  publish(document: Document): void {
    console.log('Document is already published');
  }

  reject(document: Document): void {
    console.log('Cannot reject published document');
  }

  getName(): string {
    return 'Published';
  }
}

/**
 * 已拒绝状态
 */
class RejectedState implements DocumentState {
  publish(document: Document): void {
    console.log('Cannot publish rejected document');
  }

  reject(document: Document): void {
    console.log('Document is already rejected');
  }

  getName(): string {
    return 'Rejected';
  }
}

// ============================================
// 另一个示例：订单状态机
// ============================================

/**
 * 订单状态接口
 */
interface OrderState {
  pay(order: Order): void;
  ship(order: Order): void;
  deliver(order: Order): void;
  cancel(order: Order): void;
  getName(): string;
}

/**
 * 订单 - 上下文
 */
class Order {
  private state: OrderState;
  private id: string;
  private items: string[];

  constructor(id: string, items: string[]) {
    this.id = id;
    this.items = items;
    this.state = new PendingState();
  }

  setState(state: OrderState): void {
    console.log(`Order ${this.id}: ${this.state.getName()} -> ${state.getName()}`);
    this.state = state;
  }

  pay(): void {
    this.state.pay(this);
  }

  ship(): void {
    this.state.ship(this);
  }

  deliver(): void {
    this.state.deliver(this);
  }

  cancel(): void {
    this.state.cancel(this);
  }

  getId(): string {
    return this.id;
  }

  getItems(): string[] {
    return this.items;
  }
}

/**
 * 待支付状态
 */
class PendingState implements OrderState {
  pay(order: Order): void {
    console.log(`Processing payment for order ${order.getId()}`);
    order.setState(new PaidState());
  }

  ship(order: Order): void {
    console.log('Cannot ship unpaid order');
  }

  deliver(order: Order): void {
    console.log('Cannot deliver unpaid order');
  }

  cancel(order: Order): void {
    console.log(`Order ${order.getId()} cancelled`);
    order.setState(new CancelledState());
  }

  getName(): string {
    return 'Pending';
  }
}

/**
 * 已支付状态
 */
class PaidState implements OrderState {
  pay(order: Order): void {
    console.log('Order is already paid');
  }

  ship(order: Order): void {
    console.log(`Shipping order ${order.getId()}`);
    order.setState(new ShippedState());
  }

  deliver(order: Order): void {
    console.log('Cannot deliver unshipped order');
  }

  cancel(order: Order): void {
    console.log(`Order ${order.getId()} cancelled and refunded`);
    order.setState(new CancelledState());
  }

  getName(): string {
    return 'Paid';
  }
}

/**
 * 已发货状态
 */
class ShippedState implements OrderState {
  pay(order: Order): void {
    console.log('Order is already paid');
  }

  ship(order: Order): void {
    console.log('Order is already shipped');
  }

  deliver(order: Order): void {
    console.log(`Delivering order ${order.getId()}`);
    order.setState(new DeliveredState());
  }

  cancel(order: Order): void {
    console.log('Cannot cancel shipped order');
  }

  getName(): string {
    return 'Shipped';
  }
}

/**
 * 已送达状态
 */
class DeliveredState implements OrderState {
  pay(order: Order): void {
    console.log('Order is already paid');
  }

  ship(order: Order): void {
    console.log('Order is already shipped');
  }

  deliver(order: Order): void {
    console.log('Order is already delivered');
  }

  cancel(order: Order): void {
    console.log('Cannot cancel delivered order');
  }

  getName(): string {
    return 'Delivered';
  }
}

/**
 * 已取消状态
 */
class CancelledState implements OrderState {
  pay(order: Order): void {
    console.log('Cannot pay cancelled order');
  }

  ship(order: Order): void {
    console.log('Cannot ship cancelled order');
  }

  deliver(order: Order): void {
    console.log('Cannot deliver cancelled order');
  }

  cancel(order: Order): void {
    console.log('Order is already cancelled');
  }

  getName(): string {
    return 'Cancelled';
  }
}
```

#### 完整使用示例

```typescript
// 示例1：文档工作流
const document = new Document('My Article', 'John');
console.log(`Initial state: ${document.getStateName()}`);

document.publish(); // Draft -> Moderation
document.publish(); // Moderation -> Published
document.reject(); // Already published

// 示例2：订单状态机
const order = new Order('ORD-001', ['Item1', 'Item2']);
console.log(`\nOrder ${order.getId()} created`);

order.ship(); // Cannot ship unpaid order
order.pay(); // Pending -> Paid
order.pay(); // Already paid
order.ship(); // Paid -> Shipped
order.deliver(); // Shipped -> Delivered
order.cancel(); // Cannot cancel delivered order

// 取消流程
const order2 = new Order('ORD-002', ['Item3']);
order2.cancel(); // Pending -> Cancelled
order2.pay(); // Cannot pay cancelled order
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：使用大量条件语句
class BadDocument {
  private state = 'draft';

  publish(): void {
    // 错误：大量条件语句
    if (this.state === 'draft') {
      this.state = 'moderation';
    } else if (this.state === 'moderation') {
      this.state = 'published';
    } else if (this.state === 'published') {
      console.log('Already published');
    }
    // ... 更多条件
  }
}

// ❌ 错误2：状态不管理状态转换
class BadState implements DocumentState {
  publish(document: Document): void {
    // 错误：状态应该决定下一个状态
    console.log('Publishing...');
  }
}

// ❌ 错误3：上下文暴露过多给状态
class BadContext {
  public state: DocumentState; // 不应该公开
  public data: unknown; // 不应该公开
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 消除条件语句 | 增加类数量 |
| 状态转换明确 | 简单场景可能过度设计 |
| 易于添加新状态 | 状态逻辑分散 |
| 符合单一职责 | 上下文可能过大 |

#### 与其他模式的关系

- **策略模式**: 状态模式是策略模式的扩展
- **单例模式**: 状态通常是单例
- **享元模式**: 状态可以共享

---

### 3.9 策略模式 (Strategy Pattern)

#### 定义与意图

**形式化定义**: 定义一系列的算法，把它们一个个封装起来，并且使它们可相互替换。策略模式让算法的变化独立于使用算法的客户。

$$
\text{Context} \xrightarrow{\text{setStrategy()}} \text{Strategy}_i \xrightarrow{\text{execute()}} \text{Result}
$$

**意图**: 将算法族封装起来，使它们可以互相替换。

#### 适用场景

- 需要在运行时选择算法
- 有许多相关的类，区别只在行为
- 需要使用算法的不同变体
- 需要避免暴露复杂的算法数据结构

#### 先决条件

- 存在算法族
- 算法可以互换
- 客户端不需要知道算法细节

#### UML类图

```
┌─────────────────────────────────────────┐
│           Context                       │
│  -strategy: Strategy                    │
│  +setStrategy(strategy: Strategy)       │
│  +executeStrategy(data)                 │
└──────────────────┬──────────────────────┘
                   │ uses
                   ▼
┌─────────────────────────────────────────┐
│           <<interface>>                 │
│           Strategy                      │
│  +execute(data): Result                 │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        │          │          │          │
   ┌────┴────┐┌────┴────┐┌────┴────┐┌────┴────┐
   │StrategyA││StrategyB││StrategyC││StrategyD│
   │+execute()│+execute()│+execute()│+execute()│
   └─────────┘└─────────┘└─────────┘└─────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 策略接口
// ============================================

/**
 * 支付策略接口
 */
interface PaymentStrategy {
  pay(amount: number): boolean;
  getName(): string;
}

// ============================================
// 具体策略
// ============================================

/**
 * 信用卡支付
 */
class CreditCardPayment implements PaymentStrategy {
  private cardNumber: string;
  private cvv: string;
  private expiryDate: string;

  constructor(cardNumber: string, cvv: string, expiryDate: string) {
    this.cardNumber = cardNumber;
    this.cvv = cvv;
    this.expiryDate = expiryDate;
  }

  pay(amount: number): boolean {
    console.log(`Paying $${amount} using Credit Card ${this.maskCardNumber()}`);
    // 验证卡号等逻辑
    return true;
  }

  getName(): string {
    return 'Credit Card';
  }

  private maskCardNumber(): string {
    return '****-****-****-' + this.cardNumber.slice(-4);
  }
}

/**
 * PayPal支付
 */
class PayPalPayment implements PaymentStrategy {
  private email: string;
  private password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  pay(amount: number): boolean {
    console.log(`Paying $${amount} using PayPal account ${this.email}`);
    // PayPal API调用
    return true;
  }

  getName(): string {
    return 'PayPal';
  }
}

/**
 * 加密货币支付
 */
class CryptoPayment implements PaymentStrategy {
  private walletAddress: string;
  private cryptoType: string;

  constructor(walletAddress: string, cryptoType: string) {
    this.walletAddress = walletAddress;
    this.cryptoType = cryptoType;
  }

  pay(amount: number): boolean {
    console.log(
      `Paying $${amount} using ${this.cryptoType} wallet ${this.maskAddress()}`
    );
    return true;
  }

  getName(): string {
    return `${this.cryptoType}`;
  }

  private maskAddress(): string {
    return this.walletAddress.slice(0, 6) + '...' + this.walletAddress.slice(-4);
  }
}

// ============================================
// 上下文
// ============================================

/**
 * 购物车 - 上下文
 */
class ShoppingCart {
  private items: { name: string; price: number }[] = [];
  private paymentStrategy: PaymentStrategy | null = null;

  addItem(name: string, price: number): void {
    this.items.push({ name, price });
    console.log(`Added ${name} ($${price}) to cart`);
  }

  setPaymentStrategy(strategy: PaymentStrategy): void {
    this.paymentStrategy = strategy;
    console.log(`Payment method set to: ${strategy.getName()}`);
  }

  calculateTotal(): number {
    return this.items.reduce((total, item) => total + item.price, 0);
  }

  checkout(): boolean {
    if (!this.paymentStrategy) {
      console.log('Please select a payment method');
      return false;
    }

    const amount = this.calculateTotal();
    console.log(`\nTotal: $${amount}`);
    return this.paymentStrategy.pay(amount);
  }

  getItems(): string[] {
    return this.items.map((item) => item.name);
  }
}

// ============================================
// 另一个示例：排序策略
// ============================================

/**
 * 排序策略接口
 */
interface SortStrategy<T> {
  sort(data: T[]): T[];
  getName(): string;
}

/**
 * 冒泡排序
 */
class BubbleSortStrategy<T> implements SortStrategy<T> {
  sort(data: T[]): T[] {
    const result = [...data];
    const n = result.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (result[j] > result[j + 1]) {
          [result[j], result[j + 1]] = [result[j + 1], result[j]];
        }
      }
    }
    return result;
  }

  getName(): string {
    return 'Bubble Sort';
  }
}

/**
 * 快速排序
 */
class QuickSortStrategy<T> implements SortStrategy<T> {
  sort(data: T[]): T[] {
    if (data.length <= 1) return [...data];

    const pivot = data[Math.floor(data.length / 2)];
    const left = data.filter((x) => x < pivot);
    const middle = data.filter((x) => x === pivot);
    const right = data.filter((x) => x > pivot);

    return [
      ...this.sort(left),
      ...middle,
      ...this.sort(right)
    ];
  }

  getName(): string {
    return 'Quick Sort';
  }
}

/**
 * 归并排序
 */
class MergeSortStrategy<T> implements SortStrategy<T> {
  sort(data: T[]): T[] {
    if (data.length <= 1) return [...data];

    const mid = Math.floor(data.length / 2);
    const left = this.sort(data.slice(0, mid));
    const right = this.sort(data.slice(mid));

    return this.merge(left, right);
  }

  private merge(left: T[], right: T[]): T[] {
    const result: T[] = [];
    let i = 0,
      j = 0;

    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }

    return result.concat(left.slice(i)).concat(right.slice(j));
  }

  getName(): string {
    return 'Merge Sort';
  }
}

/**
 * 排序上下文
 */
class Sorter<T> {
  private strategy: SortStrategy<T>;

  constructor(strategy: SortStrategy<T>) {
    this.strategy = strategy;
  }

  setStrategy(strategy: SortStrategy<T>): void {
    this.strategy = strategy;
  }

  sort(data: T[]): T[] {
    console.log(`Sorting using ${this.strategy.getName()}`);
    return this.strategy.sort(data);
  }
}
```

#### 完整使用示例

```typescript
// 示例1：购物车支付
const cart = new ShoppingCart();
cart.addItem('Laptop', 999);
cart.addItem('Mouse', 29);
cart.addItem('Keyboard', 79);

// 使用信用卡支付
cart.setPaymentStrategy(new CreditCardPayment('1234567890123456', '123', '12/25'));
cart.checkout();

// 切换到PayPal
cart.setPaymentStrategy(new PayPalPayment('user@example.com', 'password'));
cart.checkout();

// 示例2：排序策略
const data = [64, 34, 25, 12, 22, 11, 90];

const sorter = new Sorter<number>(new BubbleSortStrategy());
console.log('Bubble:', sorter.sort(data));

sorter.setStrategy(new QuickSortStrategy());
console.log('Quick:', sorter.sort(data));

sorter.setStrategy(new MergeSortStrategy());
console.log('Merge:', sorter.sort(data));

// 运行时选择策略
function getSortStrategy<T>(dataSize: number): SortStrategy<T> {
  if (dataSize < 50) {
    return new BubbleSortStrategy();
  } else if (dataSize < 1000) {
    return new MergeSortStrategy();
  }
  return new QuickSortStrategy();
}

const largeData = Array.from({ length: 100 }, () => Math.random());
const optimalStrategy = getSortStrategy<number>(largeData.length);
const optimalSorter = new Sorter(optimalStrategy);
optimalSorter.sort(largeData);
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：使用大量条件语句
class BadShoppingCart {
  private paymentType: string;

  checkout(): void {
    // 错误：大量条件语句
    if (this.paymentType === 'credit') {
      // 信用卡支付逻辑
    } else if (this.paymentType === 'paypal') {
      // PayPal支付逻辑
    } else if (this.paymentType === 'crypto') {
      // 加密货币支付逻辑
    }
  }
}

// ❌ 错误2：策略包含上下文逻辑
class BadStrategy implements PaymentStrategy {
  pay(amount: number): boolean {
    // 错误：策略不应该知道上下文的细节
    const cart = new ShoppingCart();
    // ...
    return true;
  }
}

// ❌ 错误3：策略接口过于具体
interface BadStrategy {
  payWithCreditCard(amount: number, cardNumber: string): boolean;
  payWithPayPal(amount: number, email: string): boolean;
  // 错误：接口应该通用
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 算法可互换 | 增加类数量 |
| 消除条件语句 | 客户端需要知道策略 |
| 符合开闭原则 | 通信开销 |
| 复用算法 | 简单场景可能过度设计 |

#### 与其他模式的关系

- **状态模式**: 策略模式是状态模式的简化版
- **装饰器模式**: 可以组合策略
- **工厂模式**: 用于创建策略

---

### 3.10 模板方法模式 (Template Method Pattern)

#### 定义与意图

**形式化定义**: 定义一个操作中的算法的骨架，而将一些步骤延迟到子类中。模板方法使得子类可以不改变一个算法的结构即可重定义该算法的某些特定步骤。

$$
\text{TemplateMethod} = \text{Step}_1 + \text{Step}_2^{abstract} + \text{Step}_3 + \text{Step}_4^{hook}
$$

**意图**: 定义算法骨架，让子类实现可变部分。

#### 适用场景

- 有多个类有共同的方法，但细节不同
- 需要控制子类的扩展
- 需要复用公共代码
- 需要定义算法的骨架

#### 先决条件

- 算法有固定步骤
- 部分步骤可变
- 需要复用公共代码

#### UML类图

```
┌─────────────────────────────────────────┐
│           AbstractClass                 │
│  +templateMethod()                      │
│  { step1(); step2(); step3(); }         │
│  #step1() { ... }                       │
│  #step2() { abstract }                  │
│  #step3() { ... }                       │
│  #hook() { }                            │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────┴────┐           ┌────┴────┐
   │Concrete1│           │Concrete2│
   │#step2() │           │#step2() │
   │#hook()  │           │        │
   └─────────┘           └─────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 抽象类
// ============================================

/**
 * 数据挖掘算法抽象类
 */
abstract class DataMiner {
  /**
   * 模板方法 - 定义算法骨架
   */
  mine(path: string): void {
    const file = this.openFile(path);
    const rawData = this.extractData(file);
    const data = this.parseData(rawData);
    const analysis = this.analyze(data);
    this.sendReport(analysis);
    this.closeFile(file);
    this.hook(); // 钩子方法
  }

  /**
   * 具体步骤 - 通用实现
   */
  protected analyze(data: unknown[]): unknown {
    console.log('Analyzing data...');
    // 通用分析逻辑
    return { summary: 'Analysis results', count: data.length };
  }

  protected sendReport(analysis: unknown): void {
    console.log('Sending report:', analysis);
  }

  /**
   * 抽象步骤 - 子类必须实现
   */
  protected abstract openFile(path: string): unknown;
  protected abstract extractData(file: unknown): string;
  protected abstract parseData(rawData: string): unknown[];
  protected abstract closeFile(file: unknown): void;

  /**
   * 钩子方法 - 可选覆盖
   */
  protected hook(): void {
    // 默认空实现
  }
}

// ============================================
// 具体类
// ============================================

/**
 * PDF数据挖掘
 */
class PDFDataMiner extends DataMiner {
  protected openFile(path: string): unknown {
    console.log(`Opening PDF file: ${path}`);
    return { type: 'pdf', path };
  }

  protected extractData(file: unknown): string {
    console.log('Extracting data from PDF');
    return 'PDF raw data';
  }

  protected parseData(rawData: string): unknown[] {
    console.log('Parsing PDF data');
    return rawData.split('\n');
  }

  protected closeFile(file: unknown): void {
    console.log('Closing PDF file');
  }
}

/**
 * CSV数据挖掘
 */
class CSVDataMiner extends DataMiner {
  protected openFile(path: string): unknown {
    console.log(`Opening CSV file: ${path}`);
    return { type: 'csv', path };
  }

  protected extractData(file: unknown): string {
    console.log('Extracting data from CSV');
    return 'CSV raw data';
  }

  protected parseData(rawData: string): unknown[] {
    console.log('Parsing CSV data');
    return rawData.split(',');
  }

  protected closeFile(file: unknown): void {
    console.log('Closing CSV file');
  }

  protected hook(): void {
    console.log('CSV processing completed!');
  }
}

/**
 * 数据库数据挖掘
 */
class DatabaseDataMiner extends DataMiner {
  private connectionString: string;

  constructor(connectionString: string) {
    super();
    this.connectionString = connectionString;
  }

  protected openFile(path: string): unknown {
    console.log(`Connecting to database: ${this.connectionString}`);
    return { type: 'database', connection: this.connectionString };
  }

  protected extractData(file: unknown): string {
    console.log('Executing SQL query');
    return 'Database query results';
  }

  protected parseData(rawData: string): unknown[] {
    console.log('Parsing database results');
    return rawData.split('\n');
  }

  protected closeFile(file: unknown): void {
    console.log('Closing database connection');
  }
}

// ============================================
// 另一个示例：游戏AI
// ============================================

/**
 * 游戏AI基类
 */
abstract class GameAI {
  /**
   * 模板方法 - AI回合
   */
  takeTurn(): void {
    this.collectResources();
    this.buildStructures();
    this.buildUnits();
    this.attack();
  }

  /**
   * 具体步骤
   */
  protected collectResources(): void {
    console.log('Collecting resources...');
  }

  /**
   * 抽象步骤
   */
  protected abstract buildStructures(): void;
  protected abstract buildUnits(): void;

  /**
   * 具体步骤，但可覆盖
   */
  protected attack(): void {
    console.log('Attacking enemy...');
  }
}

/**
 * 兽人AI
 */
class OrcsAI extends GameAI {
  protected buildStructures(): void {
    console.log('Building orc structures: burrows, watchtowers');
  }

  protected buildUnits(): void {
    console.log('Training orc units: grunts, raiders');
  }

  protected attack(): void {
    console.log('Orcs charging!');
    super.attack();
  }
}

/**
 * 人类AI
 */
class HumansAI extends GameAI {
  protected buildStructures(): void {
    console.log('Building human structures: farms, barracks');
  }

  protected buildUnits(): void {
    console.log('Training human units: footmen, knights');
  }
}

/**
 * 怪物AI（简化版）
 */
class MonstersAI extends GameAI {
  protected buildStructures(): void {
    // 怪物不建造建筑
    console.log('Monsters do not build structures');
  }

  protected buildUnits(): void {
    // 怪物不训练单位
    console.log('Monsters do not train units');
  }

  protected collectResources(): void {
    // 怪物不收集资源
    console.log('Monsters do not collect resources');
  }
}
```

#### 完整使用示例

```typescript
// 示例1：数据挖掘
console.log('=== PDF Data Mining ===');
const pdfMiner = new PDFDataMiner();
pdfMiner.mine('data.pdf');

console.log('\n=== CSV Data Mining ===');
const csvMiner = new CSVDataMiner();
csvMiner.mine('data.csv');

console.log('\n=== Database Data Mining ===');
const dbMiner = new DatabaseDataMiner('postgresql://localhost/db');
dbMiner.mine('query');

// 示例2：游戏AI
console.log('\n=== Orcs AI ===');
const orcsAI = new OrcsAI();
orcsAI.takeTurn();

console.log('\n=== Humans AI ===');
const humansAI = new HumansAI();
humansAI.takeTurn();

console.log('\n=== Monsters AI ===');
const monstersAI = new MonstersAI();
monstersAI.takeTurn();
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：模板方法不定义为final
class BadAbstractClass {
  // 错误：模板方法应该防止子类覆盖
  mine(path: string): void {
    this.openFile(path);
    this.extractData();
    // ...
  }
}

// ❌ 错误2：子类覆盖模板方法
class BadConcreteClass extends BadAbstractClass {
  // 错误：不应该覆盖模板方法
  mine(path: string): void {
    // 完全不同的实现
  }
}

// ❌ 错误3：步骤调用顺序不明确
class BadTemplate {
  algorithm(): void {
    this.step2(); // 错误：顺序混乱
    this.step1();
    this.step3();
  }
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 复用公共代码 | 可能限制灵活性 |
| 控制算法结构 | 类数量增加 |
| 易于扩展 | 继承的局限性 |
| 符合单一职责 | 某些客户端可能受限 |

#### 与其他模式的关系

- **工厂方法**: 模板方法常用工厂方法
- **策略模式**: 模板方法使用继承，策略使用组合

---

### 3.11 访问者模式 (Visitor Pattern)

#### 定义与意图

**形式化定义**: 表示一个作用于某对象结构中的各元素的操作。它使你可以在不改变各元素的类的前提下定义作用于这些元素的新操作。

$$
\text{Visitor} \xrightarrow{\text{visit(Element}_i)} \text{Element}_i \xrightarrow{\text{accept(Visitor)}} \text{Visitor.visit(this)}
$$

**意图**: 将算法与对象结构分离，便于添加新操作。

#### 适用场景

- 需要对对象结构中的元素执行多种操作
- 需要添加新操作而不修改元素类
- 对象结构很少改变，但操作经常改变
- 需要累积状态

#### 先决条件

- 有稳定的对象结构
- 需要多种操作
- 需要避免污染元素类

#### UML类图

```
┌─────────────────────────────────────────┐
│           <<interface>>                 │
│           Visitor                       │
│  +visitConcreteElementA(e: ElementA)    │
│  +visitConcreteElementB(e: ElementB)    │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────┴────┐           ┌────┴────┐
   │Visitor1 │           │Visitor2 │
   │+visitA()│           │+visitA()│
   │+visitB()│           │+visitB()│
   └─────────┘           └─────────┘
                   │
                   │ visits
                   ▼
┌─────────────────────────────────────────┐
│           <<interface>>                 │
│           Element                       │
│  +accept(v: Visitor)                    │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────┴────┐           ┌────┴────┐
   │ElementA │           │ElementB │
   │+accept()│           │+accept()│
   └─────────┘           └─────────┘
```

#### TypeScript实现

```typescript
// ============================================
// 访问者接口
// ============================================

/**
 * 形状访问者接口
 */
interface ShapeVisitor {
  visitCircle(circle: Circle): void;
  visitRectangle(rectangle: Rectangle): void;
  visitTriangle(triangle: Triangle): void;
}

// ============================================
// 元素接口
// ============================================

/**
 * 形状接口
 */
interface Shape {
  accept(visitor: ShapeVisitor): void;
  getName(): string;
}

// ============================================
// 具体元素
// ============================================

/**
 * 圆形
 */
class Circle implements Shape {
  private radius: number;

  constructor(radius: number) {
    this.radius = radius;
  }

  accept(visitor: ShapeVisitor): void {
    visitor.visitCircle(this);
  }

  getName(): string {
    return 'Circle';
  }

  getRadius(): number {
    return this.radius;
  }
}

/**
 * 矩形
 */
class Rectangle implements Shape {
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  accept(visitor: ShapeVisitor): void {
    visitor.visitRectangle(this);
  }

  getName(): string {
    return 'Rectangle';
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}

/**
 * 三角形
 */
class Triangle implements Shape {
  private base: number;
  private height: number;

  constructor(base: number, height: number) {
    this.base = base;
    this.height = height;
  }

  accept(visitor: ShapeVisitor): void {
    visitor.visitTriangle(this);
  }

  getName(): string {
    return 'Triangle';
  }

  getBase(): number {
    return this.base;
  }

  getHeight(): number {
    return this.height;
  }
}

// ============================================
// 具体访问者
// ============================================

/**
 * 面积计算访问者
 */
class AreaCalculator implements ShapeVisitor {
  private totalArea = 0;

  visitCircle(circle: Circle): void {
    const area = Math.PI * circle.getRadius() ** 2;
    console.log(`Circle area: ${area.toFixed(2)}`);
    this.totalArea += area;
  }

  visitRectangle(rectangle: Rectangle): void {
    const area = rectangle.getWidth() * rectangle.getHeight();
    console.log(`Rectangle area: ${area}`);
    this.totalArea += area;
  }

  visitTriangle(triangle: Triangle): void {
    const area = 0.5 * triangle.getBase() * triangle.getHeight();
    console.log(`Triangle area: ${area}`);
    this.totalArea += area;
  }

  getTotalArea(): number {
    return this.totalArea;
  }
}

/**
 * 周长计算访问者
 */
class PerimeterCalculator implements ShapeVisitor {
  private totalPerimeter = 0;

  visitCircle(circle: Circle): void {
    const perimeter = 2 * Math.PI * circle.getRadius();
    console.log(`Circle perimeter: ${perimeter.toFixed(2)}`);
    this.totalPerimeter += perimeter;
  }

  visitRectangle(rectangle: Rectangle): void {
    const perimeter = 2 * (rectangle.getWidth() + rectangle.getHeight());
    console.log(`Rectangle perimeter: ${perimeter}`);
    this.totalPerimeter += perimeter;
  }

  visitTriangle(triangle: Triangle): void {
    // 简化计算，假设等腰三角形
    const side = Math.sqrt(
      (triangle.getBase() / 2) ** 2 + triangle.getHeight() ** 2
    );
    const perimeter = triangle.getBase() + 2 * side;
    console.log(`Triangle perimeter: ${perimeter.toFixed(2)}`);
    this.totalPerimeter += perimeter;
  }

  getTotalPerimeter(): number {
    return this.totalPerimeter;
  }
}

/**
 * XML导出访问者
 */
class XMLExportVisitor implements ShapeVisitor {
  private xml = '<?xml version="1.0"?>\n<shapes>\n';

  visitCircle(circle: Circle): void {
    this.xml += `  <circle radius="${circle.getRadius()}" />\n`;
  }

  visitRectangle(rectangle: Rectangle): void {
    this.xml += `  <rectangle width="${rectangle.getWidth()}" height="${rectangle.getHeight()}" />\n`;
  }

  visitTriangle(triangle: Triangle): void {
    this.xml += `  <triangle base="${triangle.getBase()}" height="${triangle.getHeight()}" />\n`;
  }

  getXML(): string {
    return this.xml + '</shapes>';
  }
}

// ============================================
// 对象结构
// ============================================

/**
 * 形状集合
 */
class ShapeCollection {
  private shapes: Shape[] = [];

  add(shape: Shape): void {
    this.shapes.push(shape);
  }

  accept(visitor: ShapeVisitor): void {
    for (const shape of this.shapes) {
      shape.accept(visitor);
    }
  }
}

// ============================================
// 另一个示例：员工访问者
// ============================================

/**
 * 员工接口
 */
interface Employee {
  accept(visitor: EmployeeVisitor): void;
  getName(): string;
  getSalary(): number;
}

/**
 * 普通员工
 */
class RegularEmployee implements Employee {
  constructor(
    private name: string,
    private salary: number,
    private department: string
  ) {}

  accept(visitor: EmployeeVisitor): void {
    visitor.visitRegularEmployee(this);
  }

  getName(): string {
    return this.name;
  }

  getSalary(): number {
    return this.salary;
  }

  getDepartment(): string {
    return this.department;
  }
}

/**
 * 经理
 */
class Manager implements Employee {
  constructor(
    private name: string,
    private salary: number,
    private bonus: number
  ) {}

  accept(visitor: EmployeeVisitor): void {
    visitor.visitManager(this);
  }

  getName(): string {
    return this.name;
  }

  getSalary(): number {
    return this.salary;
  }

  getBonus(): number {
    return this.bonus;
  }
}

/**
 * 员工访问者接口
 */
interface EmployeeVisitor {
  visitRegularEmployee(employee: RegularEmployee): void;
  visitManager(manager: Manager): void;
}

/**
 * 工资计算访问者
 */
class PayrollCalculator implements EmployeeVisitor {
  private totalPayroll = 0;

  visitRegularEmployee(employee: RegularEmployee): void {
    const salary = employee.getSalary();
    console.log(`${employee.getName()}: $${salary}`);
    this.totalPayroll += salary;
  }

  visitManager(manager: Manager): void {
    const total = manager.getSalary() + manager.getBonus();
    console.log(`${manager.getName()}: $${total} (includes $${manager.getBonus()} bonus)`);
    this.totalPayroll += total;
  }

  getTotalPayroll(): number {
    return this.totalPayroll;
  }
}

/**
 * 报告生成访问者
 */
class ReportGenerator implements EmployeeVisitor {
  private report = 'Employee Report\n==============\n';

  visitRegularEmployee(employee: RegularEmployee): void {
    this.report += `\n${employee.getName()}\n`;
    this.report += `  Department: ${employee.getDepartment()}\n`;
    this.report += `  Salary: $${employee.getSalary()}\n`;
  }

  visitManager(manager: Manager): void {
    this.report += `\n${manager.getName()} (Manager)\n`;
    this.report += `  Salary: $${manager.getSalary()}\n`;
    this.report += `  Bonus: $${manager.getBonus()}\n`;
  }

  getReport(): string {
    return this.report;
  }
}
```

#### 完整使用示例

```typescript
// 示例1：形状计算
const shapes = new ShapeCollection();
shapes.add(new Circle(5));
shapes.add(new Rectangle(4, 6));
shapes.add(new Triangle(3, 4));

console.log('=== Area Calculation ===');
const areaCalculator = new AreaCalculator();
shapes.accept(areaCalculator);
console.log(`Total area: ${areaCalculator.getTotalArea().toFixed(2)}`);

console.log('\n=== Perimeter Calculation ===');
const perimeterCalculator = new PerimeterCalculator();
shapes.accept(perimeterCalculator);
console.log(`Total perimeter: ${perimeterCalculator.getTotalPerimeter().toFixed(2)}`);

console.log('\n=== XML Export ===');
const xmlExporter = new XMLExportVisitor();
shapes.accept(xmlExporter);
console.log(xmlExporter.getXML());

// 示例2：员工管理
const employees: Employee[] = [
  new RegularEmployee('Alice', 50000, 'Engineering'),
  new RegularEmployee('Bob', 45000, 'Marketing'),
  new Manager('Charlie', 80000, 20000)
];

console.log('\n=== Payroll Calculation ===');
const payroll = new PayrollCalculator();
for (const employee of employees) {
  employee.accept(payroll);
}
console.log(`Total payroll: $${payroll.getTotalPayroll()}`);

console.log('\n=== Report Generation ===');
const report = new ReportGenerator();
for (const employee of employees) {
  employee.accept(report);
}
console.log(report.getReport());
```

#### 反例（错误实现）

```typescript
// ❌ 错误1：元素不调用访问者
class BadElement implements Shape {
  accept(visitor: ShapeVisitor): void {
    // 错误：没有调用visitor.visit
    console.log('Doing something else');
  }
}

// ❌ 错误2：访问者修改元素状态
class BadVisitor implements ShapeVisitor {
  visitCircle(circle: Circle): void {
    // 错误：访问者不应该修改元素
    (circle as any).radius = 999;
  }
  // ...
}

// ❌ 错误3：使用类型检查而非双重分派
class BadClient {
  process(shapes: Shape[]): void {
    for (const shape of shapes) {
      // 错误：使用类型检查
      if (shape instanceof Circle) {
        // 处理圆形
      } else if (shape instanceof Rectangle) {
        // 处理矩形
      }
    }
  }
}
```

#### 优缺点分析

| 优点 | 缺点 |
|------|------|
| 易于添加新操作 | 难以添加新元素 |
| 集中相关操作 | 破坏封装 |
| 累积状态 | 代码复杂度增加 |
| 符合单一职责 | 需要元素配合 |

#### 与其他模式的关系

- **组合模式**: 访问者常用于遍历组合结构
- **迭代器模式**: 可以一起使用
- **解释器模式**: 访问者可以用于遍历AST

---

## 4. 现代JS/TS特有模式

现代JavaScript和TypeScript提供了许多独特的语言特性，使得一些经典设计模式有了更简洁的实现方式，同时也催生了一些新的模式。

---

### 4.1 模块模式 (Module Pattern)

#### 定义与意图

**形式化定义**: 使用闭包封装私有变量和方法，只暴露公共API。

$$
\text{Module} = \text{Private Members} + \text{Public API}
$$

**意图**: 创建封装的作用域，实现信息隐藏。

#### 适用场景

- 需要封装私有状态
- 需要避免全局命名空间污染
- 需要创建单例对象
- 需要组织相关功能

#### TypeScript实现

```typescript
// ============================================
// ES6模块模式
// ============================================

// mathUtils.ts
// 私有变量
const PI = 3.14159;
const E = 2.71828;

// 私有函数
function validateNumber(n: number): boolean {
  return typeof n === 'number' && !isNaN(n);
}

// 公共API
export function add(a: number, b: number): number {
  if (!validateNumber(a) || !validateNumber(b)) {
    throw new Error('Invalid input');
  }
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function circleArea(radius: number): number {
  return PI * radius * radius;
}

// ============================================
// 命名空间模块模式
// ============================================

namespace Validation {
  // 私有
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 公共接口
  export interface StringValidator {
    isValid(s: string): boolean;
  }

  // 公共类
  export class EmailValidator implements StringValidator {
    isValid(s: string): boolean {
      return emailRegex.test(s);
    }
  }

  export class PhoneValidator implements StringValidator {
    isValid(s: string): boolean {
      return /^\d{10}$/.test(s.replace(/\D/g, ''));
    }
  }
}

// ============================================
// 闭包模块模式（传统方式）
// ============================================

const CounterModule = (() => {
  // 私有变量
  let count = 0;
  const history: number[] = [];

  // 私有函数
  function logHistory(): void {
    console.log('History:', history);
  }

  // 公共API
  return {
    increment(): number {
      count++;
      history.push(count);
      return count;
    },

    decrement(): number {
      count--;
      history.push(count);
      return count;
    },

    getCount(): number {
      return count;
    },

    reset(): void {
      count = 0;
      history.length = 0;
    },

    showHistory(): void {
      logHistory();
    }
  };
})();

// ============================================
// 增强模块模式
// ============================================

interface Config {
  apiUrl: string;
  timeout: number;
  retries: number;
}

const ConfigModule = (() => {
  // 私有配置
  let config: Config = {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3
  };

  // 私有验证
  function validateConfig(newConfig: Partial<Config>): boolean {
    if (newConfig.timeout && newConfig.timeout < 0) return false;
    if (newConfig.retries && newConfig.retries < 0) return false;
    return true;
  }

  // 公共API
  return {
    getConfig(): Readonly<Config> {
      return { ...config };
    },

    setConfig(newConfig: Partial<Config>): boolean {
      if (!validateConfig(newConfig)) {
        console.error('Invalid config');
        return false;
      }
      config = { ...config, ...newConfig };
      return true;
    },

    getApiUrl(): string {
      return config.apiUrl;
    },

    getTimeout(): number {
      return config.timeout;
    }
  };
})();

// ============================================
// 依赖注入模块
// ============================================

interface Logger {
  log(message: string): void;
  error(message: string): void;
}

interface Database {
  query(sql: string): unknown[];
}

class UserServiceModule {
  private logger: Logger;
  private db: Database;

  constructor(logger: Logger, db: Database) {
    this.logger = logger;
    this.db = db;
  }

  getUser(id: string): unknown {
    this.logger.log(`Fetching user ${id}`);
    return this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }

  createUser(data: unknown): void {
    this.logger.log('Creating user');
    // ...
  }
}

// 工厂函数创建模块
function createUserService(logger: Logger, db: Database): UserServiceModule {
  return new UserServiceModule(logger, db);
}
```

#### 完整使用示例

```typescript
// 使用模块
console.log(CounterModule.getCount()); // 0
CounterModule.increment();
CounterModule.increment();
console.log(CounterModule.getCount()); // 2
CounterModule.showHistory(); // History: [1, 2]

// 使用配置模块
console.log(ConfigModule.getApiUrl());
ConfigModule.setConfig({ timeout: 10000 });
console.log(ConfigModule.getConfig());

// 使用验证命名空间
const emailValidator = new Validation.EmailValidator();
console.log(emailValidator.isValid('test@example.com')); // true
console.log(emailValidator.isValid('invalid')); // false
```

---

### 4.2 揭示模块模式 (Revealing Module Pattern)

#### 定义与意图

**形式化定义**: 模块模式的变体，所有方法和变量定义为私有，通过返回对象揭示公共成员。

**意图**: 提供更清晰的公共API定义，统一暴露方式。

#### TypeScript实现

```typescript
// ============================================
// 基本揭示模块模式
// ============================================

const RevealingCounter = (() => {
  // 所有成员默认私有
  let count = 0;
  let step = 1;

  function increment(): number {
    count += step;
    return count;
  }

  function decrement(): number {
    count -= step;
    return count;
  }

  function getCount(): number {
    return count;
  }

  function setStep(newStep: number): void {
    step = newStep;
  }

  function reset(): void {
    count = 0;
    step = 1;
  }

  // 揭示公共API
  return {
    increment,
    decrement,
    getCount,
    setStep,
    reset
  };
})();

// ============================================
// 带命名约定的揭示模块
// ============================================

const DataRepository = (() => {
  // 私有成员（以下划线开头）
  const _data: Map<string, unknown> = new Map();
  const _subscribers: Set<(key: string, value: unknown) => void> = new Set();

  function _notify(key: string, value: unknown): void {
    for (const subscriber of _subscribers) {
      subscriber(key, value);
    }
  }

  function set(key: string, value: unknown): void {
    _data.set(key, value);
    _notify(key, value);
  }

  function get(key: string): unknown {
    return _data.get(key);
  }

  function remove(key: string): boolean {
    const existed = _data.has(key);
    _data.delete(key);
    return existed;
  }

  function subscribe(callback: (key: string, value: unknown) => void): () => void {
    _subscribers.add(callback);
    return () => _subscribers.delete(callback);
  }

  function clear(): void {
    _data.clear();
  }

  // 揭示公共API（可以有选择地暴露）
  return {
    set,
    get,
    remove,
    subscribe,
    clear
    // _notify 不暴露，保持私有
  };
})();

// ============================================
// 类风格的揭示模块
// ============================================

interface TimerAPI {
  start(): void;
  stop(): number;
  reset(): void;
  getElapsed(): number;
  isRunning(): boolean;
}

function createTimer(): TimerAPI {
  // 私有状态
  let startTime = 0;
  let elapsed = 0;
  let running = false;

  // 私有方法
  function getCurrentTime(): number {
    return Date.now();
  }

  // 公共方法
  function start(): void {
    if (!running) {
      startTime = getCurrentTime() - elapsed;
      running = true;
    }
  }

  function stop(): number {
    if (running) {
      elapsed = getCurrentTime() - startTime;
      running = false;
    }
    return elapsed;
  }

  function reset(): void {
    elapsed = 0;
    startTime = 0;
    running = false;
  }

  function getElapsed(): number {
    if (running) {
      return getCurrentTime() - startTime;
    }
    return elapsed;
  }

  function isRunning(): boolean {
    return running;
  }

  // 揭示API
  return { start, stop, reset, getElapsed, isRunning };
}

// ============================================
// 异步揭示模块
// ============================================

interface AsyncCacheAPI<K, V> {
  get(key: K): Promise<V | undefined>;
  set(key: K, value: V): Promise<void>;
  has(key: K): boolean;
  delete(key: K): Promise<boolean>;
  clear(): Promise<void>;
}

function createAsyncCache<K, V>(
  fetcher: (key: K) => Promise<V>
): AsyncCacheAPI<K, V> {
  const cache = new Map<K, V>();
  const pending = new Map<K, Promise<V>>();

  async function get(key: K): Promise<V | undefined> {
    // 检查缓存
    if (cache.has(key)) {
      return cache.get(key);
    }

    // 检查是否有进行中的请求
    if (pending.has(key)) {
      return pending.get(key);
    }

    // 发起新请求
    const promise = fetcher(key).then((value) => {
      cache.set(key, value);
      pending.delete(key);
      return value;
    });

    pending.set(key, promise);
    return promise;
  }

  async function set(key: K, value: V): Promise<void> {
    cache.set(key, value);
  }

  function has(key: K): boolean {
    return cache.has(key);
  }

  async function delete_(key: K): Promise<boolean> {
    return cache.delete(key);
  }

  async function clear(): Promise<void> {
    cache.clear();
    pending.clear();
  }

  return { get, set, has, delete: delete_, clear };
}
```

#### 完整使用示例

```typescript
// 使用揭示计数器
RevealingCounter.setStep(5);
console.log(RevealingCounter.increment()); // 5
console.log(RevealingCounter.increment()); // 10
console.log(RevealingCounter.decrement()); // 5

// 使用数据仓库
const unsubscribe = DataRepository.subscribe((key, value) => {
  console.log(`Data changed: ${key} = ${value}`);
});

DataRepository.set('user', { name: 'John' });
console.log(DataRepository.get('user'));
unsubscribe();

// 使用计时器
const timer = createTimer();
timer.start();
setTimeout(() => {
  console.log(`Elapsed: ${timer.stop()}ms`);
}, 100);

// 使用异步缓存
const userCache = createAsyncCache<string, { id: string; name: string }>(
  async (id) => {
    console.log(`Fetching user ${id}`);
    // 模拟API调用
    return { id, name: `User ${id}` };
  }
);

(async () => {
  const user1 = await userCache.get('123');
  const user2 = await userCache.get('123'); // 从缓存获取
  console.log(user1 === user2); // true
})();
```

---

### 4.3 混入模式 (Mixin Pattern)

#### 定义与意图

**形式化定义**: 通过组合而非继承，将功能"混入"到类中。

$$
\text{Class} + \text{Mixin}_1 + \text{Mixin}_2 + ... = \text{Enhanced Class}
$$

**意图**: 实现代码复用，避免继承层次过深。

#### TypeScript实现

```typescript
// ============================================
// 基础混入函数
// ============================================

type Constructor<T = {}> = new (...args: unknown[]) => T;

/**
 * 可序列化混入
 */
function Serializable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    serialize(): string {
      return JSON.stringify(this);
    }

    deserialize(json: string): void {
      const data = JSON.parse(json);
      Object.assign(this, data);
    }
  };
}

/**
 * 可时间戳混入
 */
function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt = new Date();
    updatedAt = new Date();

    updateTimestamp(): void {
      this.updatedAt = new Date();
    }
  };
}

/**
 * 可激活混入
 */
function Activatable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    isActive = false;

    activate(): void {
      this.isActive = true;
    }

    deactivate(): void {
      this.isActive = false;
    }

    toggle(): void {
      this.isActive = !this.isActive;
    }
  };
}

// ============================================
// 使用混入
// ============================================

class User {
  constructor(
    public name: string,
    public email: string
  ) {}
}

// 组合多个混入
const SerializableUser = Serializable(Timestamped(Activatable(User)));

// 使用增强后的类
const user = new SerializableUser('John', 'john@example.com');
user.activate();
user.updateTimestamp();
console.log(user.serialize());

// ============================================
// 带约束的混入
// ============================================

interface Printable {
  toString(): string;
}

/**
 * 日志混入 - 需要目标类有toString方法
 */
function Loggable<TBase extends Constructor<Printable>>(Base: TBase) {
  return class extends Base {
    log(): void {
      console.log(`[LOG] ${this.toString()}`);
    }

    logError(error: Error): void {
      console.error(`[ERROR] ${this.toString()}: ${error.message}`);
    }
  };
}

class Product implements Printable {
  constructor(
    public name: string,
    public price: number
  ) {}

  toString(): string {
    return `Product(${this.name}, $${this.price})`;
  }
}

const LoggableProduct = Loggable(Product);
const product = new LoggableProduct('Laptop', 999);
product.log();

// ============================================
// 多个独立混入组合
// ============================================

/**
 * 事件发射器混入
 */
function EventEmitterMixin<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    private listeners: Map<string, Array<(...args: unknown[]) => void>> = new Map();

    on(event: string, callback: (...args: unknown[]) => void): () => void {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event)!.push(callback);

      return () => {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
          const index = callbacks.indexOf(callback);
          if (index !== -1) {
            callbacks.splice(index, 1);
          }
        }
      };
    }

    emit(event: string, ...args: unknown[]): void {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        for (const callback of callbacks) {
          callback(...args);
        }
      }
    }

    off(event: string): void {
      this.listeners.delete(event);
    }
  };
}

/**
 * 验证混入
 */
function ValidatableMixin<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    private errors: Map<string, string> = new Map();

    addError(field: string, message: string): void {
      this.errors.set(field, message);
    }

    getErrors(): Record<string, string> {
      return Object.fromEntries(this.errors);
    }

    hasErrors(): boolean {
      return this.errors.size > 0;
    }

    clearErrors(): void {
      this.errors.clear();
    }

    isValid(): boolean {
      return !this.hasErrors();
    }
  };
}

// 组合多个混入
class BaseModel {
  id: string;
  constructor(id: string) {
    this.id = id;
  }
}

const EnhancedModel = EventEmitterMixin(ValidatableMixin(BaseModel));

class UserModel extends EnhancedModel {
  name = '';
  email = '';

  validate(): boolean {
    this.clearErrors();

    if (!this.name) {
      this.addError('name', 'Name is required');
    }

    if (!this.email.includes('@')) {
      this.addError('email', 'Invalid email');
    }

    return this.isValid();
  }
}

// 使用增强模型
const userModel = new UserModel('123');
userModel.name = 'John';
userModel.email = 'invalid';

const unsubscribe = userModel.on('validated', (isValid: boolean) => {
  console.log('Validation result:', isValid);
});

if (!userModel.validate()) {
  console.log('Errors:', userModel.getErrors());
  userModel.emit('validated', false);
}

// ============================================
// 运行时混入（对象组合）
// ============================================

/**
 * 对象混入函数
 */
function applyMixins(target: object, ...sources: object[]): void {
  for (const source of sources) {
    const descriptors = Object.getOwnPropertyDescriptors(source);
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (key !== 'constructor') {
        Object.defineProperty(target, key, descriptor);
      }
    }
  }
}

// 混入对象
const TimestampMixin = {
  createdAt: new Date(),
  getAge(): number {
    return Date.now() - this.createdAt.getTime();
  }
};

const VersionMixin = {
  version: '1.0.0',
  getVersionInfo(): string {
    return `v${this.version}`;
  }
};

// 应用混入
class Document {
  title = '';
  content = '';
}

interface Document extends TimestampMixin, VersionMixin {}
applyMixins(Document.prototype, TimestampMixin, VersionMixin);

const doc = new Document();
doc.title = 'My Doc';
console.log(doc.getAge());
console.log(doc.getVersionInfo());
```

#### 完整使用示例

```typescript
// 创建带混入的组件
class Component {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const EnhancedComponent = Serializable(Timestamped(EventEmitterMixin(Component)));

const component = new EnhancedComponent('MyComponent');
component.on('loaded', () => console.log('Component loaded'));
component.emit('loaded');
console.log(component.serialize());

// 使用用户模型
const user2 = new UserModel('456');
user2.name = 'Jane';
user2.email = 'jane@example.com';

if (user2.validate()) {
  console.log('User is valid');
  user2.emit('validated', true);
}
```

---

### 4.4 高阶组件模式 (Higher-Order Component Pattern)

#### 定义与意图

**形式化定义**: 接收组件作为参数并返回新组件的函数。

$$
\text{HOC} = \text{Component} \rightarrow \text{Enhanced Component}
$$

**意图**: 复用组件逻辑，增强组件功能。

#### TypeScript实现

```typescript
// ============================================
// 基础HOC类型定义
// ============================================

import React, { ComponentType, useState, useEffect } from 'react';

/**
 * HOC类型
 */
type HOC<P = {}> = <T extends P>(
  WrappedComponent: ComponentType<T>
) => ComponentType<T>;

// ============================================
// 通用HOC实现
// ============================================

/**
 * 日志HOC
 */
function withLogging<P extends object>(
  WrappedComponent: ComponentType<P>
): ComponentType<P> {
  return function WithLogging(props: P) {
    useEffect(() => {
      console.log(`[${WrappedComponent.name}] Mounted`);
      return () => {
        console.log(`[${WrappedComponent.name}] Unmounted`);
      };
    }, []);

    return React.createElement(WrappedComponent, props);
  };
}

/**
 * 加载状态HOC
 */
interface WithLoadingProps {
  isLoading?: boolean;
}

function withLoading<P extends object>(
  WrappedComponent: ComponentType<P>
): ComponentType<P & WithLoadingProps> {
  return function WithLoading({
    isLoading,
    ...props
  }: P & WithLoadingProps) {
    if (isLoading) {
      return React.createElement('div', null, 'Loading...');
    }
    return React.createElement(WrappedComponent, props as P);
  };
}

/**
 * 错误边界HOC
 */
interface WithErrorProps {
  error?: Error | null;
}

function withErrorHandling<P extends object>(
  WrappedComponent: ComponentType<P>
): ComponentType<P & WithErrorProps> {
  return function WithErrorHandling({
    error,
    ...props
  }: P & WithErrorProps) {
    if (error) {
      return React.createElement(
        'div',
        { style: { color: 'red' } },
        `Error: ${error.message}`
      );
    }
    return React.createElement(WrappedComponent, props as P);
  };
}

// ============================================
// 数据获取HOC
// ============================================

interface WithDataProps<T> {
  data?: T;
  fetchData: () => Promise<T>;
}

function withData<T, P extends WithDataProps<T>>(
  WrappedComponent: ComponentType<P>
): ComponentType<Omit<P, 'data'>> {
  return function WithData(props: Omit<P, 'data'>) {
    const [data, setData] = useState<T | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const result = await (props as P).fetchData();
          setData(result);
        } catch (err) {
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, []);

    if (loading) {
      return React.createElement('div', null, 'Loading data...');
    }

    if (error) {
      return React.createElement('div', null, `Error: ${error.message}`);
    }

    return React.createElement(WrappedComponent, {
      ...props,
      data
    } as P);
  };
}

// ============================================
// 权限控制HOC
// ============================================

interface WithAuthProps {
  user?: { role: string } | null;
  requiredRole?: string;
}

function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  requiredRole?: string
): ComponentType<P & WithAuthProps> {
  return function WithAuth(props: P & WithAuthProps) {
    const { user } = props;

    if (!user) {
      return React.createElement('div', null, 'Please log in');
    }

    if (requiredRole && user.role !== requiredRole) {
      return React.createElement('div', null, 'Access denied');
    }

    return React.createElement(WrappedComponent, props as P);
  };
}

// ============================================
// 组合多个HOC
// ============================================

/**
 * HOC组合函数
 */
function compose<H, P>(
  ...hocs: HOC[]
): (component: ComponentType<P>) => ComponentType<P> {
  return (component: ComponentType<P>) =>
    hocs.reduceRight((acc, hoc) => hoc(acc), component);
}

// 示例组件
interface UserProfileProps {
  userId: string;
  data?: { name: string; email: string };
}

function UserProfile({ data }: UserProfileProps) {
  if (!data) return null;
  return React.createElement(
    'div',
    null,
    React.createElement('h1', null, data.name),
    React.createElement('p', null, data.email)
  );
}

// 组合HOC
const EnhancedUserProfile = compose(
  withLogging,
  withLoading,
  withErrorHandling
)(UserProfile);

// ============================================
// 装饰器风格的HOC（TypeScript实验性特性）
// ============================================

function logMethod(
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: unknown[]) {
    console.log(`Calling ${propertyKey} with args:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`${propertyKey} returned:`, result);
    return result;
  };

  return descriptor;
}

function measureTime(
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: unknown[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const end = performance.now();
    console.log(`${propertyKey} took ${end - start}ms`);
    return result;
  };

  return descriptor;
}

// 使用装饰器
class Calculator {
  @logMethod
  @measureTime
  add(a: number, b: number): number {
    return a + b;
  }

  @logMethod
  @measureTime
  factorial(n: number): number {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }
}
```

#### 完整使用示例

```typescript
// 使用HOC增强组件
interface ProductListProps {
  data?: { products: Array<{ id: string; name: string; price: number }> };
}

function ProductList({ data }: ProductListProps) {
  if (!data) return null;
  return React.createElement(
    'ul',
    null,
    data.products.map((p) =>
      React.createElement('li', { key: p.id }, `${p.name}: $${p.price}`)
    )
  );
}

const fetchProducts = async () => {
  // 模拟API调用
  return {
    products: [
      { id: '1', name: 'Laptop', price: 999 },
      { id: '2', name: 'Mouse', price: 29 }
    ]
  };
};

const DataProductList = withData(ProductList);
// 使用: <DataProductList fetchData={fetchProducts} />

// 使用装饰器
const calc = new Calculator();
calc.add(2, 3);
calc.factorial(5);
```

---

### 4.5 组合优于继承模式 (Composition over Inheritance)

#### 定义与意图

**形式化定义**: 优先使用对象组合而非类继承来实现代码复用。

$$
\text{Class} \xrightarrow{\text{has-a}} \text{Component}_1 + \text{Component}_2 + ...
$$

**意图**: 提高代码灵活性，减少耦合。

#### TypeScript实现

```typescript
// ============================================
// 问题：继承的局限性
// ============================================

// ❌ 继承导致类爆炸
class Animal {
  move(): void {
    console.log('Moving');
  }
}

class FlyingAnimal extends Animal {
  fly(): void {
    console.log('Flying');
  }
}

class SwimmingAnimal extends Animal {
  swim(): void {
    console.log('Swimming');
  }
}

// 问题：鸭子既能飞又能游，怎么办？
// 需要 FlyingSwimmingAnimal，导致类爆炸

// ============================================
// 解决方案：组合
// ============================================

/**
 * 行为接口
 */
interface FlyBehavior {
  fly(): void;
}

interface SwimBehavior {
  swim(): void;
}

interface QuackBehavior {
  quack(): void;
}

/**
 * 具体行为实现
 */
class FlyWithWings implements FlyBehavior {
  fly(): void {
    console.log('Flying with wings!');
  }
}

class CannotFly implements FlyBehavior {
  fly(): void {
    console.log('Cannot fly');
  }
}

class SwimNormally implements SwimBehavior {
  swim(): void {
    console.log('Swimming normally');
  }
}

class CannotSwim implements SwimBehavior {
  swim(): void {
    console.log('Cannot swim');
  }
}

class QuackLoudly implements QuackBehavior {
  quack(): void {
    console.log('QUACK! QUACK!');
  }
}

class Squeak implements QuackBehavior {
  quack(): void {
    console.log('Squeak!');
  }
}

class Silent implements QuackBehavior {
  quack(): void {
    console.log('...');
  }
}

/**
 * 鸭子类 - 使用组合
 */
class Duck {
  private flyBehavior: FlyBehavior;
  private swimBehavior: SwimBehavior;
  private quackBehavior: QuackBehavior;
  private name: string;

  constructor(
    name: string,
    flyBehavior: FlyBehavior,
    swimBehavior: SwimBehavior,
    quackBehavior: QuackBehavior
  ) {
    this.name = name;
    this.flyBehavior = flyBehavior;
    this.swimBehavior = swimBehavior;
    this.quackBehavior = quackBehavior;
  }

  display(): void {
    console.log(`I'm a ${this.name}`);
  }

  performFly(): void {
    this.flyBehavior.fly();
  }

  performSwim(): void {
    this.swimBehavior.swim();
  }

  performQuack(): void {
    this.quackBehavior.quack();
  }

  // 运行时改变行为
  setFlyBehavior(fb: FlyBehavior): void {
    this.flyBehavior = fb;
  }

  setSwimBehavior(sb: SwimBehavior): void {
    this.swimBehavior = sb;
  }

  setQuackBehavior(qb: QuackBehavior): void {
    this.quackBehavior = qb;
  }
}

// ============================================
// 组件组合模式
// ============================================

/**
 * 渲染组件接口
 */
interface RenderComponent {
  render(): string;
}

/**
 * 位置组件
 */
interface PositionComponent {
  x: number;
  y: number;
  move(dx: number, dy: number): void;
}

/**
 * 物理组件
 */
interface PhysicsComponent {
  velocity: { x: number; y: number };
  mass: number;
  applyForce(fx: number, fy: number): void;
  update(): void;
}

/**
 * 输入组件
 */
interface InputComponent {
  handleInput(): void;
}

/**
 * 游戏实体 - 组合多个组件
 */
class GameEntity {
  private name: string;
  private renderComponent: RenderComponent | null = null;
  private positionComponent: PositionComponent | null = null;
  private physicsComponent: PhysicsComponent | null = null;
  private inputComponent: InputComponent | null = null;

  constructor(name: string) {
    this.name = name;
  }

  addRenderComponent(component: RenderComponent): void {
    this.renderComponent = component;
  }

  addPositionComponent(component: PositionComponent): void {
    this.positionComponent = component;
  }

  addPhysicsComponent(component: PhysicsComponent): void {
    this.physicsComponent = component;
  }

  addInputComponent(component: InputComponent): void {
    this.inputComponent = component;
  }

  update(): void {
    this.inputComponent?.handleInput();
    this.physicsComponent?.update();
  }

  render(): string {
    return this.renderComponent?.render() || '';
  }

  getName(): string {
    return this.name;
  }
}

// 具体组件实现
class SpriteRenderer implements RenderComponent {
  constructor(private sprite: string) {}

  render(): string {
    return `Rendering sprite: ${this.sprite}`;
  }
}

class Transform implements PositionComponent {
  x = 0;
  y = 0;

  move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }
}

class RigidBody implements PhysicsComponent {
  velocity = { x: 0, y: 0 };
  mass = 1;

  applyForce(fx: number, fy: number): void {
    this.velocity.x += fx / this.mass;
    this.velocity.y += fy / this.mass;
  }

  update(): void {
    // 更新物理状态
  }
}

class PlayerInput implements InputComponent {
  handleInput(): void {
    console.log('Handling player input');
  }
}

class AIInput implements InputComponent {
  handleInput(): void {
    console.log('AI making decisions');
  }
}

// ============================================
// 函数组合模式
// ============================================

type Fn<T, R> = (arg: T) => R;

/**
 * 函数组合
 */
function compose<T, U, V>(f: Fn<U, V>, g: Fn<T, U>): Fn<T, V> {
  return (x) => f(g(x));
}

/**
 * 管道函数
 */
function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg) => fns.reduce((acc, fn) => fn(acc), arg);
}

// 示例：数据处理管道
const addOne = (x: number) => x + 1;
const double = (x: number) => x * 2;
const toString = (x: number) => x.toString();

const process = pipe(addOne, double, toString);
console.log(process(5)); // "12"

// ============================================
// React Hooks风格的组合
// ============================================

/**
 * 自定义Hook风格的组合
 */
function useCounter(initial = 0) {
  let count = initial;

  return {
    get count() {
      return count;
    },
    increment() {
      count++;
    },
    decrement() {
      count--;
    },
    reset() {
      count = initial;
    }
  };
}

function useLogger<T extends object>(obj: T): T {
  return new Proxy(obj, {
    get(target, prop) {
      console.log(`Getting ${String(prop)}`);
      return target[prop as keyof T];
    },
    set(target, prop, value) {
      console.log(`Setting ${String(prop)} to ${value}`);
      target[prop as keyof T] = value;
      return true;
    }
  });
}

function usePersist<T extends object>(obj: T, key: string): T {
  // 从localStorage加载
  const saved = localStorage.getItem(key);
  if (saved) {
    Object.assign(obj, JSON.parse(saved));
  }

  // 自动保存
  return new Proxy(obj, {
    set(target, prop, value) {
      target[prop as keyof T] = value;
      localStorage.setItem(key, JSON.stringify(target));
      return true;
    }
  });
}

// 组合使用
const counter = usePersist(useLogger(useCounter(0)), 'counter');
counter.increment();
console.log(counter.count);
```

#### 完整使用示例

```typescript
// 创建各种鸭子
const mallard = new Duck(
  'Mallard Duck',
  new FlyWithWings(),
  new SwimNormally(),
  new QuackLoudly()
);

const rubberDuck = new Duck(
  'Rubber Duck',
  new CannotFly(),
  new SwimNormally(),
  new Squeak()
);

const decoyDuck = new Duck(
  'Decoy Duck',
  new CannotFly(),
  new CannotSwim(),
  new Silent()
);

// 测试鸭子
mallard.display();
mallard.performFly();
mallard.performQuack();

rubberDuck.display();
rubberDuck.performFly();
rubberDuck.performQuack();

// 运行时改变行为
console.log('\n--- Changing behavior ---');
mallard.setFlyBehavior(new CannotFly());
mallard.performFly(); // 现在不能飞了

// 创建游戏实体
const player = new GameEntity('Player');
player.addRenderComponent(new SpriteRenderer('player.png'));
player.addPositionComponent(new Transform());
player.addPhysicsComponent(new RigidBody());
player.addInputComponent(new PlayerInput());

const enemy = new GameEntity('Enemy');
enemy.addRenderComponent(new SpriteRenderer('enemy.png'));
enemy.addPositionComponent(new Transform());
enemy.addPhysicsComponent(new RigidBody());
enemy.addInputComponent(new AIInput());

player.update();
enemy.update();
console.log(player.render());
```

---

### 4.6 依赖注入与控制反转 (Dependency Injection & IoC)

#### 定义与意图

**形式化定义**:

- **控制反转(IoC)**: 将对象的创建和依赖关系的管理从对象本身转移到外部容器。
- **依赖注入(DI)**: 实现IoC的一种方式，通过构造函数、属性或方法将依赖传递给对象。

$$
\text{Class} \xleftarrow{\text{injected}} \text{Dependency}_1, \text{Dependency}_2, ...
$$

**意图**: 降低耦合，提高可测试性和可维护性。

#### TypeScript实现

```typescript
// ============================================
// 服务接口定义
// ============================================

/**
 * 日志服务接口
 */
interface ILogger {
  log(message: string): void;
  error(message: string, error?: Error): void;
}

/**
 * 数据库服务接口
 */
interface IDatabase {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

/**
 * 缓存服务接口
 */
interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * 邮件服务接口
 */
interface IEmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

// ============================================
// 具体服务实现
// ============================================

class ConsoleLogger implements ILogger {
  log(message: string): void {
    console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
  }

  error(message: string, error?: Error): void {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
  }
}

class MockDatabase implements IDatabase {
  private data = new Map<string, unknown[]>();

  async connect(): Promise<void> {
    console.log('Mock database connected');
  }

  async disconnect(): Promise<void> {
    console.log('Mock database disconnected');
  }

  async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    console.log(`Executing: ${sql}`, params);
    return (this.data.get(sql) || []) as T[];
  }

  setData<T>(sql: string, data: T[]): void {
    this.data.set(sql, data);
  }
}

class MemoryCache implements ICache {
  private cache = new Map<string, { value: unknown; expiry: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl = 3600): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

class MockEmailService implements IEmailService {
  sentEmails: Array<{ to: string; subject: string; body: string }> = [];

  async send(to: string, subject: string, body: string): Promise<void> {
    this.sentEmails.push({ to, subject, body });
    console.log(`Email sent to ${to}: ${subject}`);
  }
}

// ============================================
// 构造函数注入
// ============================================

class UserService {
  private logger: ILogger;
  private database: IDatabase;
  private cache: ICache;

  constructor(logger: ILogger, database: IDatabase, cache: ICache) {
    this.logger = logger;
    this.database = database;
    this.cache = cache;
  }

  async getUser(id: string): Promise<{ id: string; name: string } | null> {
    this.logger.log(`Fetching user ${id}`);

    // 尝试从缓存获取
    const cached = await this.cache.get<{ id: string; name: string }>(
      `user:${id}`
    );
    if (cached) {
      this.logger.log(`Cache hit for user ${id}`);
      return cached;
    }

    // 从数据库获取
    const users = await this.database.query<{ id: string; name: string }>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (users.length > 0) {
      await this.cache.set(`user:${id}`, users[0], 300);
      return users[0];
    }

    return null;
  }

  async createUser(name: string, email: string): Promise<void> {
    this.logger.log(`Creating user: ${name}`);
    await this.database.query('INSERT INTO users (name, email) VALUES (?, ?)', [
      name,
      email
    ]);
  }
}

// ============================================
// 属性注入
// ============================================

class NotificationService {
  logger!: ILogger;
  emailService!: IEmailService;

  async notifyUser(email: string, message: string): Promise<void> {
    this.logger.log(`Notifying user: ${email}`);
    await this.emailService.send(email, 'Notification', message);
  }
}

// ============================================
// 方法注入
// ============================================

class ReportGenerator {
  async generate(
    database: IDatabase,
    logger: ILogger
  ): Promise<string> {
    logger.log('Generating report...');
    const data = await database.query('SELECT * FROM sales');
    return JSON.stringify(data);
  }
}

// ============================================
// 简单DI容器
// ============================================

type Constructor<T> = new (...args: unknown[]) => T;
type ServiceIdentifier = string | symbol;

interface ServiceDefinition<T> {
  identifier: ServiceIdentifier;
  implementation: Constructor<T>;
  singleton: boolean;
  instance?: T;
  dependencies: ServiceIdentifier[];
}

class Container {
  private services = new Map<ServiceIdentifier, ServiceDefinition<unknown>>();
  private singletons = new Map<ServiceIdentifier, unknown>();

  register<T>(
    identifier: ServiceIdentifier,
    implementation: Constructor<T>,
    dependencies: ServiceIdentifier[] = [],
    singleton = false
  ): this {
    this.services.set(identifier, {
      identifier,
      implementation,
      singleton,
      dependencies
    });
    return this;
  }

  registerInstance<T>(identifier: ServiceIdentifier, instance: T): this {
    this.singletons.set(identifier, instance);
    return this;
  }

  resolve<T>(identifier: ServiceIdentifier): T {
    // 检查是否有预注册的单例
    if (this.singletons.has(identifier)) {
      return this.singletons.get(identifier) as T;
    }

    const definition = this.services.get(identifier);
    if (!definition) {
      throw new Error(`Service not found: ${String(identifier)}`);
    }

    // 如果是单例且已创建，直接返回
    if (definition.singleton && definition.instance) {
      return definition.instance as T;
    }

    // 解析依赖
    const dependencies = definition.dependencies.map((dep) =>
      this.resolve(dep)
    );

    // 创建实例
    const instance = new definition.implementation(...dependencies);

    // 如果是单例，保存实例
    if (definition.singleton) {
      definition.instance = instance;
    }

    return instance as T;
  }

  createScope(): Container {
    const scope = new Container();
    scope.services = this.services;
    return scope;
  }
}

// ============================================
// 装饰器风格的DI
// ============================================

const INJECT_KEY = Symbol('inject');

function Injectable<T extends Constructor<unknown>>(target: T): T {
  // 标记类为可注入
  return target;
}

function Inject(identifier: ServiceIdentifier): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const existingInjections =
      Reflect.getMetadata(INJECT_KEY, target) || [];
    existingInjections[parameterIndex] = identifier;
    Reflect.defineMetadata(INJECT_KEY, existingInjections, target);
  };
}

// ============================================
// 使用DI容器
// ============================================

// 创建容器
const container = new Container();

// 注册服务
container
  .register<ILogger>('logger', ConsoleLogger, [], true)
  .register<IDatabase>('database', MockDatabase, [], true)
  .register<ICache>('cache', MemoryCache, [], true)
  .register<IEmailService>('email', MockEmailService, [], false)
  .register<UserService>('userService', UserService, [
    'logger',
    'database',
    'cache'
  ]);

// 解析服务
const userService = container.resolve<UserService>('userService');
```

#### 完整使用示例

```typescript
// 手动依赖注入
const logger = new ConsoleLogger();
const database = new MockDatabase();
const cache = new MemoryCache();

const userService = new UserService(logger, database, cache);

// 设置测试数据
(database as MockDatabase).setData('SELECT * FROM users WHERE id = ?', [
  { id: '1', name: 'John' }
]);

// 使用服务
(async () => {
  const user = await userService.getUser('1');
  console.log('User:', user);

  // 第二次调用应该从缓存获取
  const cachedUser = await userService.getUser('1');
  console.log('Cached user:', cachedUser);
})();

// 使用属性注入
const notificationService = new NotificationService();
notificationService.logger = logger;
notificationService.emailService = new MockEmailService();

notificationService.notifyUser('user@example.com', 'Hello!');

// 使用容器
const containerUserService = container.resolve<UserService>('userService');
console.log('Container resolved service:', containerUserService);
```

---

## 5. 模式对比与选择指南

### 5.1 创建型模式对比

| 模式 | 意图 | 使用场景 | 复杂度 |
|------|------|----------|--------|
| **单例** | 确保唯一实例 | 全局状态、资源管理 | 低 |
| **工厂方法** | 延迟实例化到子类 | 需要灵活创建对象 | 中 |
| **抽象工厂** | 创建产品族 | 需要兼容的产品组合 | 高 |
| **建造者** | 分步构建复杂对象 | 对象构造复杂 | 中 |
| **原型** | 通过复制创建对象 | 创建成本高、需要克隆 | 中 |

### 5.2 结构型模式对比

| 模式 | 意图 | 使用场景 | 与继承的关系 |
|------|------|----------|--------------|
| **适配器** | 接口转换 | 集成不兼容接口 | 事后补救 |
| **桥接** | 分离抽象和实现 | 多维度变化 | 预先设计 |
| **组合** | 统一处理个体和组合 | 树形结构 | 替代继承 |
| **装饰器** | 动态添加功能 | 功能扩展 | 优于继承 |
| **外观** | 简化复杂接口 | 子系统封装 | 简化而非替代 |
| **享元** | 共享对象 | 大量相似对象 | 减少实例 |
| **代理** | 控制访问 | 延迟加载、保护 | 控制而非替代 |

### 5.3 行为型模式对比

| 模式 | 通信方式 | 使用场景 | 关键特征 |
|------|----------|----------|----------|
| **责任链** | 链式传递 | 多级处理 | 动态链 |
| **命令** | 封装请求 | 撤销、队列 | 请求对象化 |
| **解释器** | 语法解析 | DSL | 文法表示 |
| **迭代器** | 顺序访问 | 遍历集合 | 统一接口 |
| **中介者** | 集中协调 | 多对象交互 | 减少依赖 |
| **备忘录** | 状态保存 | 撤销恢复 | 封装状态 |
| **观察者** | 发布订阅 | 事件通知 | 一对多 |
| **状态** | 状态转换 | 状态机 | 行为随状态变 |
| **策略** | 算法替换 | 多种算法 | 可互换 |
| **模板方法** | 骨架定义 | 算法框架 | 固定步骤 |
| **访问者** | 双分派 | 新操作 | 分离算法 |

### 5.4 模式选择决策树

```
需要创建对象？
├── 是 → 需要唯一实例？
│   ├── 是 → 单例模式
│   └── 否 → 需要产品族？
│       ├── 是 → 抽象工厂
│       └── 否 → 构造复杂？
│           ├── 是 → 建造者
│           └── 否 → 需要运行时决定？
│               ├── 是 → 工厂方法
│               └── 否 → 原型
└── 否 → 需要改变结构？
    ├── 是 → 接口不兼容？
    │   ├── 是 → 适配器
    │   └── 否 → 多维度变化？
    │       ├── 是 → 桥接
    │       └── 否 → 树形结构？
    │           ├── 是 → 组合
    │           └── 否 → 动态添加功能？
    │               ├── 是 → 装饰器
    │               └── 否 → 简化接口？
    │                   ├── 是 → 外观
    │                   └── 否 → 控制访问？
    │                       ├── 是 → 代理
    │                       └── 否 → 享元
    └── 否 → 需要改变行为？
        ├── 是 → 算法变化？
        │   ├── 是 → 骨架固定？
        │   │   ├── 是 → 模板方法
        │   │   └── 否 → 策略
        │   └── 否 → 状态变化？
        │       ├── 是 → 状态
        │       └── 否 → 多级处理？
        │           ├── 是 → 责任链
        │           └── 否 → 请求封装？
        │               ├── 是 → 命令
        │               └── 否 → 事件通知？
        │                   ├── 是 → 观察者
        │                   └── 否 → 遍历集合？
        │                       ├── 是 → 迭代器
        │                       └── 否 → 多对象交互？
        │                           ├── 是 → 中介者
        │                           └── 否 → 状态保存？
        │                               ├── 是 → 备忘录
        │                               └── 否 → 新操作？
        │                                   ├── 是 → 访问者
        │                                   └── 否 → 语法解析？
        │                                       └── 是 → 解释器
```

### 5.5 SOLID原则与设计模式

| 原则 | 相关模式 |
|------|----------|
| **单一职责(SRP)** | 所有模式都支持 |
| **开闭原则(OCP)** | 策略、装饰器、访问者、模板方法 |
| **里氏替换(LSP)** | 工厂方法、策略、状态 |
| **接口隔离(ISP)** | 适配器、外观 |
| **依赖倒置(DIP)** | 工厂方法、抽象工厂、策略、桥接 |

### 5.6 常见反模式

| 反模式 | 问题 | 解决方案 |
|--------|------|----------|
| **上帝对象** | 一个类做太多事 | 拆分职责，使用组合 |
| **过度设计** | 简单问题复杂化 | YAGNI原则，按需设计 |
| **模式滥用** | 强行套用模式 | 理解意图，灵活使用 |
| **紧耦合** | 类间依赖过强 | 使用接口，依赖注入 |
| **重复代码** | 多处相同逻辑 | 提取公共代码，使用模板方法 |

---

## 6. 形式化论证总结

### 6.1 设计模式的形式化基础

设计模式的形式化可以通过以下数学概念描述：

#### 6.1.1 类型系统

$$
\Gamma \vdash e : T
$$

表示在上下文$\Gamma$中，表达式$e$具有类型$T$。

#### 6.1.2 子类型关系

$$
T_1 <: T_2 \Rightarrow \forall x: T_1, x : T_2
$$

如果$T_1$是$T_2$的子类型，则任何$T_1$的实例也是$T_2$的实例。

#### 6.1.3 多态

$$
\forall T. C<T> \quad \text{(参数多态)}
$$

### 6.2 模式的正确性条件

| 模式 | 正确性条件 |
|------|------------|
| 单例 | $\forall x, y \in \text{Singleton} : x = y$ |
| 工厂 | $\text{Creator}.\text{factoryMethod}() : \text{Product}$ |
| 适配器 | $\text{Adapter} : \text{Target} \land \text{Adapter} \to \text{Adaptee}$ |
| 观察者 | $\text{Subject.notify}() \Rightarrow \forall o \in \text{Observers} : o.\text{update}()$ |
| 策略 | $\text{Context}.\text{execute}() = \text{Strategy}.\text{execute}()$ |

### 6.3 设计原则的数学表达

#### 开闭原则

$$
\frac{\partial \text{Behavior}}{\partial \text{Extension}} > 0, \quad \frac{\partial \text{Behavior}}{\partial \text{Modification}} = 0
$$

#### 单一职责

$$
\text{Cohesion}(C) = \frac{\text{Related Methods}}{\text{Total Methods}} \to 1
$$

#### 依赖倒置

$$
\text{High Level Module} \not\to \text{Low Level Module} \\
\text{Both} \to \text{Abstraction}
$$

---

## 7. TypeScript最佳实践

### 7.1 类型安全的设计模式

```typescript
// 使用泛型增强类型安全
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

// 使用类型守卫
function isValidUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj
  );
}

// 使用映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};
```

### 7.2 现代TypeScript特性

```typescript
// 使用const断言
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
} as const;

// 使用模板字面量类型
type EventName<T extends string> = `on${Capitalize<T>}`;
// EventName<'click'> = 'onClick'

// 使用条件类型
type NonNullable<T> = T extends null | undefined ? never : T;

// 使用infer
type ReturnType<T> = T extends (...args: unknown[]) => infer R ? R : never;
```

---

## 8. 总结

### 8.1 设计模式的核心价值

1. **复用经验**: 使用经过验证的解决方案
2. **统一语言**: 提供共同的词汇表
3. **提高质量**: 遵循最佳实践
4. **便于维护**: 结构清晰，易于理解

### 8.2 使用设计模式的建议

1. **理解意图**: 不要只记住结构，要理解为什么
2. **按需使用**: 不要为了用模式而用模式
3. **灵活变通**: 根据实际情况调整
4. **持续学习**: 模式是工具，不是教条

### 8.3 学习路径

```
初学者 → 掌握基本模式（单例、工厂、观察者、策略）
    ↓
中级 → 理解结构型模式（适配器、装饰器、代理）
    ↓
高级 → 掌握复杂模式（访问者、解释器、组合）
    ↓
专家 → 灵活运用，创造新模式
```

---

## 附录：快速参考

### A. 模式速查表

| 问题 | 推荐模式 |
|------|----------|
| 需要全局唯一实例 | 单例 |
| 需要延迟加载 | 代理、虚拟代理 |
| 需要撤销功能 | 命令、备忘录 |
| 需要事件系统 | 观察者 |
| 需要状态机 | 状态 |
| 需要算法替换 | 策略 |
| 需要接口适配 | 适配器 |
| 需要功能扩展 | 装饰器 |
| 需要简化接口 | 外观 |
| 需要对象共享 | 享元 |
| 需要树形结构 | 组合 |
| 需要多维度变化 | 桥接 |

### B. TypeScript装饰器速查

```typescript
// 类装饰器
declare type ClassDecorator = <TFunction extends Function>(
  target: TFunction
) => TFunction | void;

// 方法装饰器
declare type MethodDecorator = <T>(
  target: Object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;

// 属性装饰器
declare type PropertyDecorator = (
  target: Object,
  propertyKey: string | symbol
) => void;

// 参数装饰器
declare type ParameterDecorator = (
  target: Object,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
) => void;
```

---

**文档结束**

> **注意**: 本文档涵盖了GoF 23种设计模式及现代JavaScript/TypeScript特有模式，提供了类型安全的TypeScript实现。实际使用时，请根据具体场景灵活选择和调整。
