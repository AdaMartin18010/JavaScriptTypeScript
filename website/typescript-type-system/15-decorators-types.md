---
title: 15 装饰器类型系统 — Stage 3 Decorators 与元数据类型
description: 全面解析 TypeScript 5.0+ Stage 3 Decorators 的类型系统支持。深入类装饰器、方法装饰器、属性装饰器、访问器装饰器的类型签名，装饰器上下文类型，元数据反射类型，以及从 Legacy Decorators 迁移的类型差异与最佳实践。
keywords:
  - typescript decorators
  - stage 3 decorators
  - decorator types
  - class decorator
  - method decorator
  - property decorator
  - accessor decorator
  - reflect-metadata
  - decorator context
  - legacy decorators
editLink: false
lastUpdated: true
---

# 15 装饰器类型系统 — Stage 3 Decorators 与元数据类型

:::tip 本章核心
TypeScript 5.0 实现了 TC39 Stage 3 Decorators 提案。新的装饰器系统拥有**更精确的类型签名**、**更清晰的执行语义**和**更轻量的运行时开销**。理解装饰器的类型上下文（Context）是编写类型安全装饰器的关键。
:::

---

## 15.1 装饰器演进：从 Legacy 到 Stage 3

### 15.1.1 两套装饰器系统对比

TypeScript 历史上存在两套装饰器实现，类型签名截然不同：

| 特性 | Legacy Decorators (`experimentalDecorators`) | Stage 3 Decorators (TS 5.0+) |
|------|---------------------------------------------|------------------------------|
| 启用方式 | `experimentalDecorators: true` | 原生支持，无需额外标志 |
| 提案状态 | TC39 Stage 2（已废弃） | TC39 Stage 3（标准化中） |
| 参数签名 | `(target, propertyKey, descriptor?)` | `(value, context)` |
| 方法装饰器返回值 | 替换 `PropertyDescriptor` | 替换被装饰的值（`value`） |
| 类装饰器参数 | 接收构造函数 | 接收 `value`（类本身）和 `context` |
| 参数装饰器 | 支持（`ParameterDecorator`） | **不支持**（需元数据替代） |
| 元数据支持 | `reflect-metadata` + `design:*` | `context.metadata` + `Symbol.metadata` |
| 运行时开销 | 较高（descriptor 操作复杂） | 较低（直接值替换） |

### 15.1.2 核心类型定义

Stage 3 装饰器的核心类型定义如下（可从 TypeScript 内置类型库中推导）：

```ts
// 装饰器上下文 — 所有装饰器共享的结构
type DecoratorContext = {
  kind: "class" | "method" | "getter" | "setter" | "field" | "accessor";
  name: string | symbol;
  access: {
    get?(): unknown;
    set?(value: unknown): void;
    has?(value: object): boolean;
  };
  static: boolean;
  private: boolean;
  metadata: Record<symbol, unknown>;
  addInitializer?(initializer: () => void): void;
};

// 类装饰器签名
function classDecorator<T extends new (...args: any[]) => object>(
  value: T,
  context: ClassDecoratorContext
): T | void;

// 方法装饰器签名
function methodDecorator<T extends (...args: any[]) => any>(
  value: T,
  context: DecoratorContext & { kind: "method" }
): T | void;

// 属性（字段）装饰器签名 — 无 value 参数（实例化时才有值）
function fieldDecorator(
  value: undefined,
  context: DecoratorContext & { kind: "field" }
): (initialValue: unknown) => unknown | void;

// 访问器装饰器签名
function accessorDecorator<T>(
  value: { get(): T; set(value: T): void },
  context: DecoratorContext & { kind: "accessor" }
): { get(): T; set(value: T): void } | void;
```

### 15.1.3 为什么 Stage 3 更优

```ts
// Legacy：操作 descriptor，容易出错，类型推断弱
function legacyLog(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${key}`);
    return original.apply(this, args);
  };
}

// Stage 3：直接替换值，类型安全，语义清晰
function stage3Log<T extends (...args: any[]) => any>(
  value: T,
  context: ClassMethodDecoratorContext
): T {
  return function (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> {
    console.log(`Calling ${String(context.name)}`);
    return value.apply(this, args);
  } as T;
}
```

---

## 15.2 类装饰器（Class Decorator）

### 15.2.1 类型签名与约束

类装饰器接收类的构造函数/类本身，可以返回一个新的类来替换它：

```ts
// 精确的类装饰器类型签名
type ClassDecorator = <T extends abstract new (...args: any) => any>(
  value: T,
  context: ClassDecoratorContext<T>
) => T | void;

// 上下文类型细节
type ClassDecoratorContext<
  T extends abstract new (...args: any) => any = abstract new (...args: any) => any
> = {
  kind: "class";
  name: string | undefined;
  metadata: Record<symbol, unknown>;
  addInitializer(initializer: (this: T) => void): void;
};
```

### 15.2.2 可替换类装饰器

返回新类时，**必须满足原类的构造签名**：

```ts
function Timestamped<T extends new (...args: any[]) => object>(
  value: T,
  context: ClassDecoratorContext<T>
): T {
  // 返回的类必须 extends 原类，保证子类型关系
  return class extends value {
    timestamp = new Date();
    constructor(...args: any[]) {
      super(...args);
      console.log(`${context.name} created at ${this.timestamp}`);
    }
  };
}

@Timestamped
class User {
  constructor(public name: string) {}
}

const user = new User("Alice");
// user.timestamp 可用，因为返回类型保留了扩展属性
console.log((user as any).timestamp); // Date
```

### 15.2.3 类型安全的依赖注入容器

```ts
type Constructor<T = {}> = new (...args: any[]) => T;

const Injectable = <T extends Constructor>(target: T, context: ClassDecoratorContext<T>): T => {
  Registry.register(target);
  return target;
};

const Registry = new Map<string, Constructor>();

@Injectable
class DatabaseService {
  query(sql: string) { return []; }
}

@Injectable
class UserService {
  // DI 容器通过类型元数据解析依赖
  constructor(private db: DatabaseService) {}
}

// 装饰器保留了完整的类型信息
type DB = InstanceType<typeof DatabaseService>; // DatabaseService
```

### 15.2.4 类装饰器的初始化器

```ts
function singleton<T extends new (...args: any[]) => object>(
  value: T,
  context: ClassDecoratorContext<T>
): T {
  let instance: InstanceType<T> | null = null;

  // addInitializer 在类定义时执行
  context.addInitializer(function () {
    console.log(`Class ${context.name} initialized`);
  });

  return class extends value {
    constructor(...args: any[]) {
      if (instance) return instance as InstanceType<T>;
      super(...args);
      instance = this as InstanceType<T>;
    }
  };
}

@singleton
class Config {
  apiUrl = "https://api.example.com";
}

const c1 = new Config();
const c2 = new Config();
console.log(c1 === c2); // true
```

---

## 15.3 方法装饰器（Method Decorator）

### 15.3.1 类型签名详解

```ts
type MethodDecorator = <This, Args extends any[], Return>(
  value: (this: This, ...args: Args) => Return,
  context: {
    kind: "method";
    name: string | symbol;
    access: { get(): (this: This, ...args: Args) => Return };
    static: boolean;
    private: boolean;
    metadata: Record<symbol, unknown>;
    addInitializer(initializer: (this: This) => void): void;
  }
) => ((this: This, ...args: Args) => Return) | void;
```

关键洞察：

- `This` 是方法调用时的 `this` 类型
- `Args` 是参数元组类型
- `Return` 是返回值类型
- 返回类型必须与 `value` 类型兼容

### 15.3.2 类型安全的方法拦截

```ts
function measure<This, Args extends any[], Return>(
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
): (this: This, ...args: Args) => Return {
  return function (this: This, ...args: Args): Return {
    const start = performance.now();
    const result = value.apply(this, args);
    const elapsed = performance.now() - start;
    console.log(`${String(context.name)} took ${elapsed.toFixed(2)}ms`);
    return result;
  };
}

class DataProcessor {
  @measure
  process(items: string[]): number {
    return items.length * 2;
  }
}

const dp = new DataProcessor();
const count = dp.process(["a", "b"]); // number，类型完整保留
```

### 15.3.3 泛型方法的装饰器挑战

装饰器无法看到泛型方法的**调用时类型参数**，只能看到声明签名：

```ts
class Store {
  // 装饰器看到的类型是泛型签名本身，而非具体实例化
  @cache
  get<T>(key: string): T | undefined {
    // implementation
    return undefined;
  }
}

// 装饰器无法直接获取 T 的具体类型
function cache<This, Args extends any[], Return>(
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext
) {
  const cache = new Map<string, Return>();
  return function (this: This, ...args: Args): Return {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = value.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
```

> ⚠️ **限制**：Stage 3 Decorators 在装饰时**无法获知泛型参数的具体实例化**。如需类型感知的缓存键，需借助运行时元数据或显式传入类型信息。

### 15.3.4 异步方法的装饰器

```ts
function asyncMeasure<This, Args extends any[], Return>(
  value: (this: This, ...args: Args) => Promise<Return>,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Return>>
): (this: This, ...args: Args) => Promise<Return> {
  return async function (this: This, ...args: Args): Promise<Return> {
    const start = performance.now();
    const result = await value.apply(this, args);
    console.log(`${String(context.name)} async took ${(performance.now() - start).toFixed(2)}ms`);
    return result;
  };
}

class ApiClient {
  @asyncMeasure
  async fetchUser(id: string): Promise<{ id: string; name: string }> {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  }
}
```

---

## 15.4 属性/字段装饰器（Field Decorator）

### 15.4.1 独特的签名设计

字段装饰器在**类定义阶段**执行，此时还没有实例，因此 `value` 参数为 `undefined`，装饰器返回一个可选的初始化函数：

```ts
type FieldDecorator = <This, Value>(
  value: undefined,
  context: {
    kind: "field";
    name: string | symbol;
    access: {
      get(this: This): Value;
      set(this: This, value: Value): void;
    };
    static: boolean;
    private: boolean;
    metadata: Record<symbol, unknown>;
    addInitializer(initializer: (this: This) => void): void;
  }
) => ((this: This, value: Value) => Value) | void;
```

### 15.4.2 自动装箱与验证

```ts
function validated<This, Value extends string>(
  value: undefined,
  context: ClassFieldDecoratorContext<This, Value>
): (this: This, value: Value) => Value {
  return function (this: This, initialValue: Value): Value {
    if (initialValue.length < 3) {
      throw new Error(`${String(context.name)} must be at least 3 characters`);
    }
    return initialValue;
  };
}

class Account {
  @validated
  username: string = "ab"; // ❌ 运行时抛错
}

const account = new Account(); // Error: username must be at least 3 characters
```

### 15.4.3 Reactive 字段装饰器（Signal 模式）

```ts
function signal<Value>(
  value: undefined,
  context: ClassFieldDecoratorContext<any, Value>
): (this: any, value: Value) => { value: Value } {
  return function (this: any, initialValue: Value) {
    return reactive({ value: initialValue });
  };
}

// 简化版 reactive（类似 Vue/Svelte 的 Signal）
function reactive<T>(obj: T): T {
  return new Proxy(obj, {
    set(target, prop, value) {
      console.log(`[reactive] ${String(prop)} = ${value}`);
      return Reflect.set(target, prop, value);
    }
  });
}

class Component {
  @signal count = 0; // 实际类型：{ value: number }
}

const c = new Component();
c.count.value = 5; // [reactive] value = 5
```

### 15.4.4 静态字段的装饰

```ts
function readonlyField<This, Value>(
  value: undefined,
  context: ClassFieldDecoratorContext<This, Value>
): (this: This, value: Value) => Value {
  return function (this: This, initialValue: Value): Value {
    Object.defineProperty(this, context.name, {
      value: initialValue,
      writable: false,
      configurable: false,
      enumerable: true
    });
    return initialValue;
  };
}

class Constants {
  @readonlyField
  static MAX_RETRY = 3;
}

Constants.MAX_RETRY = 5; // ❌ TypeError: Cannot assign to read only property
```

---

## 15.5 访问器装饰器（Accessor Decorator）

### 15.5.1 统一 getter/setter 装饰

Stage 3 引入了 `accessor` 关键字来声明自动 getter/setter 字段，并支持对它们统一装饰：

```ts
type AccessorDecorator = <This, Value>(
  value: { get(): Value; set(value: Value): void },
  context: {
    kind: "accessor";
    name: string | symbol;
    access: {
      get(this: This): Value;
      set(this: This, value: Value): void;
    };
    static: boolean;
    private: boolean;
    metadata: Record<symbol, unknown>;
    addInitializer(initializer: (this: This) => void): void;
  }
) => { get(): Value; set(value: Value): void } | void;
```

### 15.5.2 自动存储与拦截

```ts
function loggedAccessor<This, Value>(
  value: { get(): Value; set(v: Value): void },
  context: ClassAccessorDecoratorContext<This, Value>
): { get(): Value; set(v: Value): void } {
  return {
    get(): Value {
      const result = value.get.call(this);
      console.log(`[get] ${String(context.name)} = ${JSON.stringify(result)}`);
      return result;
    },
    set(v: Value): void {
      console.log(`[set] ${String(context.name)} = ${JSON.stringify(v)}`);
      value.set.call(this, v);
    }
  };
}

class Product {
  @loggedAccessor
  accessor price: number = 0;
}

const p = new Product();
p.price = 100;        // [set] price = 100
console.log(p.price); // [get] price = 100, 输出 100
```

### 15.5.3 延迟初始化访问器

```ts
function lazy<This, Value>(
  value: { get(): Value; set(v: Value): void },
  context: ClassAccessorDecoratorContext<This, Value>
): { get(): Value; set(v: Value): void } {
  let initialized = false;
  let cached: Value;

  return {
    get(): Value {
      if (!initialized) {
        cached = value.get.call(this);
        initialized = true;
      }
      return cached;
    },
    set(v: Value): void {
      cached = v;
      initialized = true;
    }
  };
}

class ImageLoader {
  @lazy
  accessor thumbnail: ImageData = loadExpensiveImage();
}

const loader = new ImageLoader(); // thumbnail 尚未加载
loader.thumbnail; // 第一次访问时才执行 loadExpensiveImage()
```

---

## 15.6 装饰器上下文（Context）深度解析

### 15.6.1 Context 类型层级

```mermaid
classDiagram
    class DecoratorContext {
        +string|symbol kind
        +string|symbol name
        +boolean static
        +boolean private
        +Record~symbol,unknown~ metadata
        +addInitializer(fn)
    }
    class ClassDecoratorContext {
        +kind = "class"
    }
    class MethodDecoratorContext {
        +kind = "method"
        +access: { get() }
    }
    class FieldDecoratorContext {
        +kind = "field"
        +access: { get(), set() }
    }
    class AccessorDecoratorContext {
        +kind = "accessor"
        +access: { get(), set() }
    }
    DecoratorContext <|-- ClassDecoratorContext
    DecoratorContext <|-- MethodDecoratorContext
    DecoratorContext <|-- FieldDecoratorContext
    DecoratorContext <|-- AccessorDecoratorContext
```

### 15.6.2 access 对象的类型差异

| 装饰器类型 | `access.get` | `access.set` | `access.has` |
|-----------|-------------|-------------|-------------|
| class | — | — | — |
| method | ✅ 获取方法引用 | — | — |
| field | ✅ 获取字段值 | ✅ 设置字段值 | ✅ 检查存在性 |
| accessor | ✅ 调用 getter | ✅ 调用 setter | — |
| getter | ✅ 调用 getter | — | — |
| setter | — | ✅ 调用 setter | — |

```ts
function inspectField<This, Value>(
  value: undefined,
  context: ClassFieldDecoratorContext<This, Value>
) {
  return function (this: This, initialValue: Value): Value {
    console.log("Has field before init:", context.access.has(this)); // false
    const result = initialValue;
    console.log("Has field after init:", context.access.has(this));  // true
    return result;
  };
}
```

### 15.6.3 初始化器（Initializer）的执行顺序

```ts
function withInit(order: number) {
  return function (_: unknown, context: DecoratorContext) {
    context.addInitializer?.(function () {
      console.log(`Initializer ${order} for ${String(context.name)}`);
    });
  };
}

class OrderDemo {
  @withInit(1) static staticField = 1;
  @withInit(2) instanceField = 2;
  @withInit(3) method() {}
}

// 执行顺序：
// 1. 静态成员初始化器（从上到下）
// 2. 类装饰器 addInitializer
// 3. 实例成员初始化器（实例创建时）
```

---

## 15.7 元数据类型与反射

### 15.7.1 内置元数据 API

Stage 3 Decorators 通过 `context.metadata` 提供轻量级元数据支持：

```ts
type Metadata = Record<symbol, unknown>;

const SchemaKey = Symbol("schema");

function column(type: "string" | "number" | "boolean") {
  return function <This, Value>(
    value: undefined,
    context: ClassFieldDecoratorContext<This, Value>
  ) {
    // 向类级别的元数据对象写入
    const schema = (context.metadata[SchemaKey] as Record<string, string>) ?? {};
    schema[String(context.name)] = type;
    context.metadata[SchemaKey] = schema;
  };
}

class UserModel {
  @column("string") name: string = "";
  @column("number") age: number = 0;
  @column("boolean") active: boolean = false;
}

// 元数据挂载在类的 Symbol.metadata 上
const schema = UserModel[Symbol.metadata as any]?.[SchemaKey];
console.log(schema);
// { name: "string", age: "number", active: "boolean" }
```

### 15.7.2 reflect-metadata 与类型装饰器

对于需要**类型信息反射**的场景（如依赖注入、ORM 映射），仍需 `reflect-metadata`：

```ts
import "reflect-metadata";

const DesignTypeKey = Symbol("design:type");

function type(target: any, context: DecoratorContext) {
  // reflect-metadata 存储编译时类型信息
  const typeInfo = Reflect.getMetadata("design:type", target, context.name);
  context.metadata[DesignTypeKey] = typeInfo;
}

class Article {
  @type title: string = "";
  @type publishedAt: Date = new Date();
}
```

> ⚠️ `reflect-metadata` 依赖 `emitDecoratorMetadata`（Legacy 标志），在纯 Stage 3 模式下需配合 `tsc` 的 `--emitDecoratorMetadata` 使用，或手动维护类型映射。

### 15.7.3 元数据的类型安全封装

```ts
// 类型安全的元数据读写
type ClassMetadata<T> = {
  schema?: Record<string, string>;
  validators?: Array<(value: unknown) => boolean>;
  routes?: Array<{ path: string; method: string }>;
};

function defineMetadata<TKey extends keyof ClassMetadata<any>>(
  key: TKey,
  value: ClassMetadata<any>[TKey]
) {
  return function <This>(_: unknown, context: DecoratorContext) {
    const meta = (context.metadata as ClassMetadata<This>);
    meta[key] = value as any;
  };
}

@defineMetadata("routes", [{ path: "/users", method: "GET" }])
class UserController {}
```

---

## 15.8 装饰器工厂与类型推导

### 15.8.1 高阶装饰器的类型设计

```ts
// 装饰器工厂：接收配置，返回装饰器函数
function throttle<This, Args extends any[], Return>(
  ms: number
): (
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
) => (this: This, ...args: Args) => Return {
  return function (value, context) {
    let lastTime = 0;
    return function (this: This, ...args: Args): Return {
      const now = Date.now();
      if (now - lastTime < ms) {
        return undefined as Return; // 类型体操：需要更精确的处理
      }
      lastTime = now;
      return value.apply(this, args);
    };
  };
}

class SearchBox {
  @throttle(300)
  onInput(query: string): string[] {
    return [query];
  }
}
```

### 15.8.2 组合多个装饰器

装饰器从**下到上**执行，但初始化器从**上到下**注册：

```ts
function log<This, Args extends any[], Return>(
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext
): (this: This, ...args: Args) => Return {
  return function (this: This, ...args: Args): Return {
    console.log(`[log] ${String(context.name)}`);
    return value.apply(this, args);
  };
}

function validate<This, Args extends [string], Return>(
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext
): (this: This, ...args: Args) => Return {
  return function (this: This, ...args: Args): Return {
    if (args[0].length === 0) throw new Error("Empty input");
    return value.apply(this, args);
  };
}

class Service {
  @log      // 外层：先执行 validate，再执行 log
  @validate // 内层：先执行
  save(name: string): void {
    console.log("Saving", name);
  }
}

const s = new Service();
s.save("test"); // [log] save → Saving test
// s.save("");  // Error: Empty input
```

### 15.8.3 泛型装饰器工厂

```ts
function typedField<TSchema>() {
  return function <This, Value extends TSchema>(
    value: undefined,
    context: ClassFieldDecoratorContext<This, Value>
  ): (this: This, value: Value) => Value {
    return function (this: This, initialValue: Value): Value {
      return initialValue;
    };
  };
}

interface StringSchema {
  minLength?: number;
  maxLength?: number;
}

// 泛型约束保证装饰器与字段类型一致
class Form {
  @typedField<StringSchema>()
  username: string = "";
}
```

---

## 15.9 从 Legacy Decorators 迁移

### 15.9.1 迁移对照表

| Legacy 模式 | Stage 3 等效方案 | 类型差异 |
|------------|----------------|---------|
| `experimentalDecorators` | 原生支持，移除标志 | 签名从 3 参数变为 2 参数 |
| 类装饰器 `target: Function` | `value: T`（类本身） | `T` 类型更精确 |
| 方法装饰器操作 `descriptor` | 直接返回替换函数 | 无需操作 PropertyDescriptor |
| 属性装饰器无返回值 | 返回初始化函数 | 新增初始化函数能力 |
| `@decorator` 在参数上 | 不支持，改用方法装饰器 + 元数据 | 参数装饰器完全移除 |
| `Reflect.getMetadata` | `context.metadata` + `Symbol.metadata` | 元数据挂载点变化 |

### 15.9.2 方法装饰器迁移示例

```ts
// ========== Legacy ==========
function legacyAutobind(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const original = descriptor.value;
  return {
    configurable: true,
    get(): any {
      return original.bind(this);
    }
  };
}

// ========== Stage 3 ==========
function autobind<This, Args extends any[], Return>(
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
): (this: This, ...args: Args) => Return {
  return function (this: This, ...args: Args): Return {
    return value.apply(this, args);
  };
}

class Button {
  text = "Click";

  @autobind
  handleClick(): string {
    return this.text;
  }
}

const btn = new Button();
const fn = btn.handleClick;
console.log(fn()); // "Click" — this 正确绑定
```

### 15.9.3 参数装饰器的替代方案

Stage 3 移除了参数装饰器，但可以通过**方法装饰器 + 元数据**实现等效功能：

```ts
const ParamTypesKey = Symbol("param-types");

function inject<T>(token: T) {
  return function <This>(
    value: undefined,
    context: ClassFieldDecoratorContext<This, any>
  ) {
    const types = (context.metadata[ParamTypesKey] as any[]) ?? [];
    types.push(token);
    context.metadata[ParamTypesKey] = types;
  };
}

function injectable<T extends new (...args: any[]) => object>(
  value: T,
  context: ClassDecoratorContext<T>
): T {
  return class extends value {
    constructor(...args: any[]) {
      // 从 metadata 读取参数类型，从容器解析实例
      const paramTypes = (value as any)[Symbol.metadata]?.[ParamTypesKey] ?? [];
      const resolved = paramTypes.map((t: any) => Container.resolve(t));
      super(...resolved);
    }
  };
}

const Container = new Map<any, any>();
Container.set("DB", { query: () => [] });

class Database {}

@injectable
class UserRepo {
  @inject("DB")
  accessor db: any;
}
```

---

## 15.10 装饰器类型系统的边界与限制

### 15.10.1 已知的类型系统限制

| 限制 | 说明 |  workaround |
|------|------|-------------|
| 无法装饰函数声明 | 装饰器只能用于类成员 | 使用高阶函数替代 |
| 泛型参数信息缺失 | 装饰器无法获取调用时的 `T` | 通过参数传入类型标记 |
| `this` 类型推断 | 静态方法装饰器的 `this` 为类本身 | 显式标注 `this` 类型 |
| 私有字段兼容性 | `#private` 字段的装饰器支持有限 | 使用 `private` 关键字或 accessor |
| 类型收窄 | 装饰器返回的新类型不会自动收窄 | 使用类型断言或重载 |

### 15.10.2 运行时类型擦除的影响

```ts
function logType<This, Value>(
  value: undefined,
  context: ClassFieldDecoratorContext<This, Value>
) {
  // ❌ 运行时无法获取 Value 的具体类型
  // 因为泛型类型在编译后被擦除
  console.log(typeof value); // 总是 "undefined"
}

class Demo {
  @logType num: number = 1; // 运行时不知道这是 number
}
```

> 类型擦除是设计决策。如需运行时类型检查，必须显式传入类型信息或使用 `zod` 等 schema 库。

---

## 15.11 实战：构建类型安全的装饰器库

### 15.11.1 完整的 CRUD 装饰器框架

```ts
// ===== 核心类型 =====
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RouteMetadata {
  path: string;
  method: HttpMethod;
  middleware?: Array<(req: Request) => Response | void>;
}

const RoutesKey = Symbol("routes");

// ===== 装饰器工厂 =====
function route(path: string, method: HttpMethod = "GET") {
  return function <This>(
    value: (this: This, req: Request) => Response,
    context: ClassMethodDecoratorContext<This, (this: This, req: Request) => Response>
  ): (this: This, req: Request) => Response {
    const routes: RouteMetadata[] = (context.metadata[RoutesKey] as any) ?? [];
    routes.push({ path, method });
    context.metadata[RoutesKey] = routes as any;
    return value;
  };
}

const get = (path: string) => route(path, "GET");
const post = (path: string) => route(path, "POST");

// ===== 控制器基类 =====
abstract class Controller {
  static getRoutes(): RouteMetadata[] {
    return (this as any)[Symbol.metadata]?.[RoutesKey] ?? [];
  }
}

// ===== 使用示例 =====
class UserController extends Controller {
  @get("/users")
  list(req: Request): Response {
    return new Response(JSON.stringify([{ id: 1 }]));
  }

  @post("/users")
  create(req: Request): Response {
    return new Response("created", { status: 201 });
  }
}

console.log(UserController.getRoutes());
// [{ path: "/users", method: "GET" }, { path: "/users", method: "POST" }]
```

### 15.11.2 ORM 字段映射装饰器

```ts
const ColumnKey = Symbol("columns");

interface ColumnMeta {
  name: string;
  type: "string" | "number" | "date" | "boolean";
  nullable: boolean;
  primary?: boolean;
}

function column(meta: Omit<ColumnMeta, "name">) {
  return function <This, Value>(
    value: undefined,
    context: ClassFieldDecoratorContext<This, Value>
  ) {
    const columns: ColumnMeta[] = (context.metadata[ColumnKey] as any) ?? [];
    columns.push({ name: String(context.name), ...meta });
    context.metadata[ColumnKey] = columns as any;
  };
}

class User {
  @column({ type: "number", nullable: false, primary: true })
  id: number = 0;

  @column({ type: "string", nullable: false })
  name: string = "";

  @column({ type: "date", nullable: true })
  createdAt: Date | null = null;
}

// 类型安全的 SQL 生成器
function generateTableSQL<T extends new () => any>(
  ctor: T,
  tableName: string
): string {
  const columns: ColumnMeta[] = (ctor as any)[Symbol.metadata]?.[ColumnKey] ?? [];
  const defs = columns.map(c =>
    `${c.name} ${c.type.toUpperCase()}${c.nullable ? "" : " NOT NULL"}${c.primary ? " PRIMARY KEY" : ""}`
  );
  return `CREATE TABLE ${tableName} (${defs.join(", ")});`;
}

console.log(generateTableSQL(User, "users"));
// CREATE TABLE users (id NUMBER NOT NULL PRIMARY KEY, name STRING NOT NULL, createdAt DATE);
```

---

## 15.12 本章小结

| 概念 | 一句话总结 |
|------|------------|
| Stage 3 Decorators | TS 5.0+ 原生支持，签名 `(value, context)`，语义更清晰 |
| Legacy Decorators | `experimentalDecorators` 开启，三参数签名，逐步淘汰 |
| 类装饰器 | 接收类构造函数，可返回新类替换，类型约束 `extends` |
| 方法装饰器 | 接收方法引用，返回替换函数，保留 `This/Args/Return` 类型 |
| 字段装饰器 | `value` 为 `undefined`，返回初始化函数，用于值转换/验证 |
| 访问器装饰器 | 操作 `{get,set}` 对象，配合 `accessor` 关键字使用 |
| 装饰器上下文 | `kind/name/access/static/private/metadata/addInitializer` |
| 元数据 | `context.metadata` + `Symbol.metadata` 实现轻量反射 |
| 参数装饰器 | Stage 3 已移除，改用字段装饰器 + 元数据替代 |
| 类型限制 | 泛型实例化信息不可见，运行时类型擦除，需显式标记 |

---

## 参考与延伸阅读

1. [TypeScript 5.0 Decorators Documentation](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators) — 官方 Stage 3 Decorators 文档
2. [TC39 Decorators Proposal](https://github.com/tc39/proposal-decorators) — Stage 3 标准提案
3. [TypeScript Decorators Deep Dive](https://2ality.com/2022/10/javascript-decorators.html) — Dr. Axel Rauschmayer
4. [Reflect Metadata API](https://rbuckton.github.io/reflect-metadata/) — 运行时元数据反射规范
5. [Migrating from Legacy to Stage 3 Decorators](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#decorators) — Microsoft DevBlog
6. [Symbol.metadata Proposal](https://github.com/tc39/proposal-decorator-metadata) — TC39 装饰器元数据提案

---

:::info 下一章
深入 TypeScript 的配置核心，逐行解析 `compilerOptions` 的类型系统影响 → [16 tsconfig 完整配置指南](./16-tsconfig-deep-dive.md)
:::
