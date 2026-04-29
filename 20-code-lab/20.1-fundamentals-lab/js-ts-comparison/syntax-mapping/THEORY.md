# 语法映射关系

> **定位**：`20-code-lab/20.1-fundamentals-lab/js-ts-comparison/syntax-mapping`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块建立 JS 与 TS 语法元素之间的显式映射关系，揭示 TS 类型构造如何对应到 JS 值空间的行为，降低学习者在两种语法体系间转换的认知负担。

### 1.2 形式化基础

设 JS 值空间为 `V`，TS 类型空间为 `T`。语法映射是函数 `⟦·⟧: T → P(V)`（类型的值解释），满足：

- `⟦number⟧ = { v ∈ V | typeof v === 'number' }`
- `⟦A & B⟧ = ⟦A⟧ ∩ ⟦B⟧`（交集类型对应值集合的交）
- `⟦A | B⟧ = ⟦A⟧ ∪ ⟦B⟧`（联合类型对应值集合的并）

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 类型注解 | 为值附加编译期类型约束 | `: number`, `: string` |
| 类型推断 | 编译器自动推导省略的类型 | `let x = 1` → `x: number` |
| 类型擦除 | 编译后 TS 特有语法被移除 | `.d.ts` / `.js` 输出 |
| 语法糖 | TS 提供便捷写法，编译为等效 JS | `?.`, `??`, `as const` |

---

## 二、设计原理

### 2.1 为什么存在

TS 类型系统建立在 JS 运行时之上。语法映射建立了两者之间的认知桥梁，帮助开发者理解：类型构造不仅是「额外语法」，更是对值空间行为的精确描述。

### 2.2 语法映射表

| TS 语法 | JS 对应/编译结果 | 语义说明 |
|--------|-----------------|---------|
| `let x: number` | `let x` | 类型擦除，运行时无检查 |
| `interface P { x: number }` | 无 | 仅编译期结构契约 |
| `type ID = string` | 无 | 类型别名，零运行时开销 |
| `function f<T>(x: T): T` | `function f(x) { return x; }` | 泛型擦除为任意参数 |
| `enum Color { R, G }` | 反向映射对象 | 部分保留运行时结构 |
| `class C { private x: number }` | `class C { constructor() { this.x = ... } }` | `private` 仅 TS 检查 |
| `x?.y ?? z` | `(x == null ? void 0 : x.y) != null ? x.y : z` | 可选链 + 空值合并（ES2020+） |
| `const a = [1, 2] as const` | `const a = [1, 2]` | 字面量类型窄化 |
| `satisfies T` | 无 | 仅约束不拓宽类型 |

### 2.3 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 显式类型注解 | 文档即代码、自解释 | 编写冗余 | 公共 API、团队边界 |
| 类型推断 | 减少样板 | 复杂场景难追踪 | 内部实现、局部变量 |
| `satisfies` | 推断 + 约束双重保障 | TS 4.9+ | 配置对象、常量结构 |

---

## 三、实践映射

### 3.1 语法映射代码示例

```ts
// === 基础类型映射 ===
let count: number = 10;        // JS: let count = 10;
let name: string = 'TS';       // JS: let name = 'TS';
let active: boolean = true;    // JS: let active = true;

// === 对象与接口映射 ===
interface User {
  id: number;
  name: string;
  readonly createdAt: Date;
}

const u: User = {
  id: 1,
  name: 'Alice',
  createdAt: new Date(),
};
// JS 输出：const u = { id: 1, name: 'Alice', createdAt: new Date() };
// readonly 不生成任何运行时保护

// === 函数签名映射 ===
function add(a: number, b: number): number {
  return a + b;
}
// JS: function add(a, b) { return a + b; }

// 默认参数 + 可选参数
function greet(name: string, greeting = 'Hello'): string {
  return `${greeting}, ${name}`;
}
// JS: function greet(name, greeting = 'Hello') { ... }

// === 联合类型与窄化 ===
function format(input: string | number): string {
  if (typeof input === 'string') {
    return input.trim();       // 窄化为 string
  }
  return input.toFixed(2);     // 窄化为 number
}
// JS: function format(input) { if (typeof input === 'string') ... }

// === 泛型擦除 ===
function identity<T>(arg: T): T {
  return arg;
}
const n = identity<number>(42);
// JS: function identity(arg) { return arg; }
// JS: const n = identity(42);

// === as const 映射 ===
const config = {
  host: 'localhost',
  port: 3000,
} as const;
// config.host 类型为字面量 'localhost'，非 string
// JS: const config = { host: 'localhost', port: 3000 };
```

#### 进阶：泛型约束与条件类型

```typescript
// 泛型约束映射：TS 编译时检查，JS 完全擦除
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
// JS: function longest(a, b) { return a.length >= b.length ? a : b; }

const longerString = longest('alice', 'bob');     // ✅ string
const longerArray = longest([1, 2], [1, 2, 3]);   // ✅ number[]
// longest(1, 2); // ❌ 编译错误：number 无 length 属性

// 条件类型：仅存在于类型空间
 type IsString<T> = T extends string ? true : false;
 type A = IsString<'hello'>;  // true
 type B = IsString<123>;      // false
// JS 输出：无任何代码

// infer 关键字：类型级模式匹配
 type ReturnType<T> = T extends (...args: unknown[]) => infer R ? R : never;
 type FnReturn = ReturnType<() => string>; // string
```

#### 进阶：namespace 与模块编译映射

```typescript
// TS namespace（旧模块组织方式）
namespace Validation {
  export interface StringValidator {
    isAcceptable(s: string): boolean;
  }

  const lettersRegexp = /^[A-Za-z]+$/;

  export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
      return lettersRegexp.test(s);
    }
  }
}

// 编译为 JS（IIFE 模式）：
// var Validation;
// (function (Validation) {
//     var lettersRegexp = /^[A-Za-z]+$/;
//     var LettersOnlyValidator = /** @class */ (function () {
//         function LettersOnlyValidator() {}
//         LettersOnlyValidator.prototype.isAcceptable = function (s) {
//             return lettersRegexp.test(s);
//         };
//         return LettersOnlyValidator;
//     }());
//     Validation.LettersOnlyValidator = LettersOnlyValidator;
// })(Validation || (Validation = {}));

// 现代替代方案：ES Module
// validation.ts
export interface StringValidator {
  isAcceptable(s: string): boolean;
}

const lettersRegexp = /^[A-Za-z]+$/;

export class LettersOnlyValidator implements StringValidator {
  isAcceptable(s: string) {
    return lettersRegexp.test(s);
  }
}
// 编译后保留 import/export，需 bundler 处理
```

### 3.2 枚举（enum）运行时映射详解

```typescript
// 数字枚举：生成反向映射对象
enum Status {
  Pending,    // 0
  Approved,   // 1
  Rejected,   // 2
}

// JS 编译结果：
// var Status;
// (function (Status) {
//     Status[Status["Pending"] = 0] = "Pending";
//     Status[Status["Approved"] = 1] = "Approved";
//     Status[Status["Rejected"] = 2] = "Rejected";
// })(Status || (Status = {}));
// Status.Pending === 0, Status[0] === 'Pending'

// 字符串枚举：无反向映射
enum Direction {
  Up = 'UP',
  Down = 'DOWN',
}

// const enum：编译时完全内联，零运行时开销
const enum Permission {
  Read = 1,
  Write = 2,
  Execute = 4,
}
const p = Permission.Read | Permission.Write;
// JS: const p = 1 | 2;（完全内联，无对象生成）

// 现代替代方案：对象常量 + as const
const HttpStatus = {
  OK: 200,
  NotFound: 404,
  Error: 500,
} as const;

type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus]; // 200 | 404 | 500
```

### 3.3 装饰器映射（TS 实验性 vs TC39）

```ts
// TypeScript 实验装饰器（legacy）
function log(target: any, key: string, desc: PropertyDescriptor) {
  const original = desc.value;
  desc.value = function (...args: any[]) {
    console.log(`Call ${key}`);
    return original.apply(this, args);
  };
}

// TC39 Stage 3 装饰器（TS 5.0+ 支持）
function logged(target: Function, context: ClassMethodDecoratorContext) {
  return function (this: any, ...args: any[]) {
    console.log(`Calling ${String(context.name)}`);
    return target.apply(this, args);
  };
}
```

#### 进阶：类装饰器与元数据反射

```typescript
import 'reflect-metadata';

const REQUIRED_KEY = Symbol('required');

// 属性装饰器：标记必填字段
function Required(target: object, propertyKey: string | symbol) {
  const existing = Reflect.getMetadata(REQUIRED_KEY, target) || [];
  Reflect.defineMetadata(REQUIRED_KEY, [...existing, propertyKey], target);
}

// 类装饰器：运行时验证
function Validatable<T extends new (...args: any[]) => object>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      const requiredFields: (string | symbol)[] = Reflect.getMetadata(REQUIRED_KEY, this) || [];
      for (const key of requiredFields) {
        if ((this as Record<string | symbol, unknown>)[key] === undefined) {
          throw new Error(`Required field ${String(key)} is missing`);
        }
      }
    }
  };
}

@Validatable
class User {
  @Required
  name!: string;

  @Required
  email!: string;

  age?: number;
}

// 编译后装饰器变为对 __decorate 的调用
// 需 reflect-metadata 库支持（polyfill）
```

### 3.4 satisfies 关键字深度示例

```typescript
// satisfies 约束类型但不拓宽推断类型
const config = {
  host: 'localhost',
  port: 3000,
  ssl: false,
} satisfies Record<string, string | number | boolean>;

// config.port 推断为 3000（字面量），而非 number
// 但结构必须满足 Record<string, string | number | boolean>

// 对比：as const vs satisfies
const routes = {
  home: '/',
  about: '/about',
  contact: '/contact',
} as const satisfies Record<string, `/${string}`>;

// routes.home 类型为 '/'（字面量）
// 同时确保所有值都以 '/' 开头

// 错误示例：satisfies 会在编译时捕获
const badConfig = {
  host: 123, // ❌ 不满足 Record<string, string | number | boolean>... 实际上满足
} satisfies Record<string, string>; // ❌ number 不能赋值给 string
```

### 3.5 常见误区

| 误区 | 正确理解 |
|------|---------|
| TS 是 JS 的超集因此完全兼容 | 有效 JS 未必能通过 TS 类型检查（如 `[] + {}`） |
| 类型擦除不影响运行时 | 装饰器、枚举、`namespace` 会改变运行时结构 |
| `private` 在运行时是私有的 | TS `private` 仅在编译期检查，运行时仍可访问 |
| `interface` 会生成代码 | 接口完全擦除，零运行时开销 |

### 3.6 扩展阅读

- [TypeScript Handbook: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript Handbook: Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [AST Explorer: TS vs JS](https://astexplorer.net/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [TypeScript Compiler Internals](https://github.com/microsoft/TypeScript/wiki/Architectural-Overview) — 编译器架构
- [TC39 Decorators Proposal](https://github.com/tc39/proposal-decorators) — 装饰器规范
- [Reflect Metadata Proposal](https://rbuckton.github.io/reflect-metadata/) — 元数据反射 API
- `10-fundamentals/10.1-language-semantics/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
