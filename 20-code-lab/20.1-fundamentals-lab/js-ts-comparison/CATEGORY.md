---
category: language-core
dimension: 语言核心
created: 2026-04-27
---

# CATEGORY.md — 10-js-ts-comparison

## 所属维度

**语言核心（Language Core）**

## 边界说明

本模块从语法、语义模型、类型理论到编译工程实践，对 JavaScript 与 TypeScript 进行全方位对比分析。内容涵盖类型擦除、运行时差异、编译器 API 等语言核心议题，是理解 TS 作为 JS 超集的本质边界的关键模块。

**非本模块内容**：框架选型对比、工具链对比、运行时平台（Node/Deno/Bun）对比。

## 在语言核心体系中的位置

```
语言核心
  ├── 10-fundamentals/10.1-language-semantics → 类型系统理论
  ├── 10-fundamentals/10.7-js-ts-symmetric-difference → JS/TS 对称差
  └── 10-js-ts-comparison（本模块）→ 对比实验与编译器 API 实践
```

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `syntax-diffs/` | 语法差异对比实验 | `variable-declarations.ts`, `type-annotations.js` |
| `type-erasure/` | 类型擦除与运行时行为 | `erasure-demos.ts`, `runtime-types.js` |
| `compiler-api/` | TypeScript Compiler API 实践 | `ast-traversal.ts`, `transformer-api.ts` |
| `performance/` | 编译性能与输出对比 | `benchmark-compilation.js`, `output-size.md` |

## 语法对比矩阵

| 特性 | JavaScript (ES2024+) | TypeScript (5.x) | 运行时差异 |
|------|----------------------|------------------|------------|
| **变量声明** | `let`, `const` | `let`, `const` + 显式类型注解 | 无（类型擦除） |
| **函数参数类型** | JSDoc 注解或运行时检查 | 编译时类型检查 | 无 |
| **接口/类型别名** | 无原生支持 | `interface`, `type` | 完全擦除 |
| **枚举** | 无 | `enum`（编译为对象） | 生成 IIFE 对象 |
| **泛型** | 无 | `<T>(arg: T): T` | 擦除为 `any` 或具体类型 |
| **装饰器** | Stage 3（ECMAScript） | 实验性/旧版支持 | 依赖编译器转换 |
| **模块系统** | ESM / CJS | ESM / CJS + 声明文件 | 额外 `.d.ts` 输出 |
| **空值合并** | `??` | `??` + 严格空检查 (`strictNullChecks`) | 仅编译期影响 |
| **可选链** | `?.` | `?.` + 类型收窄 | 无 |

### 类型擦除示例

```typescript
// TypeScript 源码
interface User {
  id: number;
  name: string;
}

function greet(user: User): string {
  return `Hello, ${user.name}`;
}

// 编译后的 JavaScript（类型擦除）
function greet(user) {
  return "Hello, " + user.name;
}
```

### 枚举编译差异

```typescript
// TypeScript
enum Status {
  Pending,
  Approved,
  Rejected,
}

// 编译为 JavaScript（ES5 目标）
var Status;
(function (Status) {
  Status[Status["Pending"] = 0] = "Pending";
  Status[Status["Approved"] = 1] = "Approved";
  Status[Status["Rejected"] = 2] = "Rejected";
})(Status || (Status = {}));
```

### JSDoc 类型注解 vs TypeScript

```javascript
// JavaScript with JSDoc（无需构建步骤即可获得类型提示）
/** @type {(user: { id: number; name: string }) => string} */
function greet(user) {
  return `Hello, ${user.name}`;
}

// TypeScript（编译时检查，需构建步骤）
function greet(user: { id: number; name: string }): string {
  return `Hello, ${user.name}`;
}
```

### Compiler API 极简示例

```typescript
// ast-traversal.ts — 使用 TS Compiler API 提取文件中所有接口名
import ts from 'typescript';

function extractInterfaceNames(sourceFile: ts.SourceFile): string[] {
  const names: string[] = [];
  ts.forEachChild(sourceFile, function visit(node) {
    if (ts.isInterfaceDeclaration(node)) {
      names.push(node.name.text);
    }
    ts.forEachChild(node, visit);
  });
  return names;
}

const program = ts.createProgram(['./sample.ts'], {});
const source = program.getSourceFile('./sample.ts')!;
console.log(extractInterfaceNames(source));
```

### `satisfies` 运算符：推断与约束兼得

```typescript
// TS 4.9+ 引入 satisfies，既保留推断类型，又约束结构
const config = {
  host: 'localhost',
  port: 3000,
  ssl: false,
} satisfies Record<string, string | number | boolean>;

// config.port 仍为 number 类型（而非 string | number | boolean）
const url = `http://${config.host}:${config.port}`;
```

### Branded Types：零开销名义类型

```typescript
// 使用交叉类型创建名义类型，编译后完全擦除
type UserId = string & { __brand: 'UserId' };
type OrderId = string & { __brand: 'OrderId' };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createOrderId(id: string): OrderId {
  return id as OrderId;
}

function queryUser(id: UserId) { /* ... */ }

const uid = createUserId('u-123');
const oid = createOrderId('o-456');

queryUser(uid);   // ✅ OK
// queryUser(oid); // ❌ 编译错误：OrderId 不能赋值给 UserId
```

### `as const` 深度只读推断

```typescript
// JavaScript
const jsRoles = ['admin', 'user', 'guest'];
// jsRoles[0] 运行时可以是任意字符串

// TypeScript with as const
const tsRoles = ['admin', 'user', 'guest'] as const;
// tsRoles 类型为 readonly ['admin', 'user', 'guest']
// tsRoles[0] 精确为字面量 'admin'
type Role = (typeof tsRoles)[number]; // 'admin' | 'user' | 'guest'
```

### Type Predicate 类型谓词：运行时类型守卫

```typescript
interface Cat { meow: () => void; kind: 'cat'; }
interface Dog { bark: () => void; kind: 'dog'; }
type Animal = Cat | Dog;

function isCat(animal: Animal): animal is Cat {
  return animal.kind === 'cat';
}

function makeSound(animal: Animal) {
  if (isCat(animal)) { animal.meow(); }
  else { animal.bark(); }
}
```

### Template Literal Types：字符串层面的类型编程

```typescript
type Endpoint = `/api/v1/${'users' | 'orders'}/${number}`;
const validUrl: Endpoint = '/api/v1/users/42'; // ✅

type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<'click'>; // "onClick"
```

### Discriminated Union 可辨识联合模式

```typescript
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'rectangle': return shape.width * shape.height;
    default: const _exhaustive: never = shape; return _exhaustive;
  }
}
```

### `infer` 关键字：类型提取

```typescript
// 从 Promise<T> 中提取 T
type Awaited<T> = T extends Promise<infer U> ? U : T;
type Result = Awaited<Promise<string>>; // string

// 从函数返回类型中提取
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Fn = () => number;
type R = ReturnType<Fn>; // number

// 从数组中提取元素类型
type ElementType<T> = T extends Array<infer E> ? E : never;
type Num = ElementType<number[]>; // number
```

### Mapped Types：批量类型变换

```typescript
// 将所有属性变为可选
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// 将所有属性变为只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 将所有属性变为必填（去除 undefined）
type Required<T> = {
  [P in keyof T]-?: T[P];
};

// 自定义：给每个值加上 getter
type WithGetters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface User {
  name: string;
  age: number;
}

type UserGetters = WithGetters<User>;
// { getName: () => string; getAge: () => number }
```

### Conditional Types：条件类型

```typescript
// 基本语法
type IsString<T> = T extends string ? true : false;
type A = IsString<'hello'>; // true
type B = IsString<42>;      // false

// 分发条件类型
type ToArray<T> = T extends any ? T[] : never;
type StrOrNumArray = ToArray<string | number>; // string[] | number[]

// 排除 null / undefined
type NonNullable<T> = T extends null | undefined ? never : T;
type C = NonNullable<string | null>; // string
```

### `keyof` / `typeof` 组合使用

```typescript
const httpStatus = {
  OK: 200,
  NotFound: 404,
  ServerError: 500,
} as const;

// 获取对象键的联合类型
type HttpStatusCode = (typeof httpStatus)[keyof typeof httpStatus]; // 200 | 404 | 500

// 生成反向映射（值 → 键）
type HttpStatusName = keyof typeof httpStatus; // 'OK' | 'NotFound' | 'ServerError'

// 类型安全的配置对象
type Config = typeof httpStatus;
function isValidStatus(code: number): code is HttpStatusCode {
  return Object.values(httpStatus).includes(code as HttpStatusCode);
}
```

### 代码示例：const enum 与 enum 的编译差异

```typescript
// const enum — 编译时完全内联，无运行时对象
const enum HttpStatus {
  OK = 200,
  NotFound = 404,
  ServerError = 500,
}

const status = HttpStatus.OK;
// 编译为：const status = 200 /* HttpStatus.OK */;

// 普通 enum — 运行时生成反向映射对象
enum Color {
  Red = 1,
  Green = 2,
  Blue = 4,
}

const colorName = Color[2]; // 'Green' — 反向映射
// 编译为 IIFE 生成的对象，包含 Red:1, 1:'Red', Green:2, 2:'Green' ...
```

### 代码示例：Declaration Merging（声明合并）

```typescript
// 接口声明合并 — 同名接口自动合并
type User {
  name: string;
}

type User {
  age: number;
}

// 等效于：
// type User = { name: string; age: number; }

// 命名空间与类合并 — 实现"静态属性 + 实例属性"模式
class Album {
  label!: Album.AlbumLabel;
}
namespace Album {
  export class AlbumLabel {
    constructor(public stations: number) {}
  }
}

const album = new Album();
album.label = new Album.AlbumLabel(10);
```

### 代码示例：Unique Symbol 创建私有键

```typescript
// 使用 unique symbol 创建编译时唯一的属性键
declare const brand: unique symbol;

type Brand<T, TBrand> = T & { [brand]: TBrand };

type USD = Brand<number, 'USD'>;
type EUR = Brand<number, 'EUR'>;

function usd(amount: number): USD {
  return amount as USD;
}
function eur(amount: number): EUR {
  return amount as EUR;
}

const price = usd(100);
// price + eur(50); // ❌ 编译错误：不能将 EUR 赋值给 USD
```

## 关联索引

- [10-fundamentals/10.1-language-semantics/README.md](../../../10-fundamentals/10.1-language-semantics/README.md)
- [30-knowledge-base/30.2-categories/00-language-core.md](../../../30-knowledge-base/30.2-categories/00-language-core.md)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) — 官方手册
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) — Basarat Ali Syed 开源书籍
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig) — 官方编译器配置参考
- [ECMA-262 Language Specification](https://tc39.es/ecma262/) — JavaScript 语言规范
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) — 微软官方编译器 API 文档
- [TypeScript Evolution](https://mariusschulz.com/blog/series/typescript-evolution) — 按版本详解 TS 特性演进
- [TypeScript Playground](https://www.typescriptlang.org/play) — 官方在线 TS→JS 编译演示
- [DefinitelyTyped](https://definitelytyped.org/) — 社区维护的 JavaScript 库类型定义仓库
- [JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html) — TypeScript 官方 JSDoc 类型支持文档
- [tc39/proposals](https://github.com/tc39/proposals) — ECMAScript 提案跟踪仓库
- [AST Explorer](https://astexplorer.net/) — 多语言 AST 可视化工具，支持 TypeScript
- [TypeScript `satisfies` Operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator) — TS 4.9 发布说明
- [Nominal Typing Techniques](https://www.typescriptlang.org/docs/handbook/advanced-types.html#nominal-type-techniques) — 名义类型模拟技术
- [Microsoft TypeScript Wiki](https://github.com/microsoft/TypeScript/wiki) — 官方 Wiki，含设计原则与路线图
- [Total TypeScript](https://www.totaltypescript.com/) — Matt Pocock 的 TypeScript 进阶课程
- [Type Challenges](https://github.com/type-challenges/type-challenges) — 类型体操练习题集
- [TypeScript Type Predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) — 官方类型谓词文档
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) — 模板字面量类型手册
- [Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) — 可辨识联合官方说明
- [TypeScript Design Goals](https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals) — TS 语言设计目标
- [Execute Program: TypeScript](https://www.executeprogram.com/courses/typescript) — 交互式 TypeScript 课程
- [TypeScript Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) — 映射类型官方手册
- [TypeScript Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) — 条件类型官方手册
- [TypeScript `infer` Keyword](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types) — infer 提取类型详解
- [TypeScript `keyof` Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html) — 索引类型查询
- [TypeScript Enums](https://www.typescriptlang.org/docs/handbook/enums.html) — 枚举类型官方文档
- [TypeScript Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) — 声明合并机制
- [TypeScript `unique symbol`](https://www.typescriptlang.org/docs/handbook/symbols.html#unique-symbol) — 唯一符号类型
- [TypeScript `const enum`](https://www.typescriptlang.org/docs/handbook/enums.html#const-enums) — 常量枚举编译行为
- [TypeScript `namespace`](https://www.typescriptlang.org/docs/handbook/namespaces.html) — 命名空间模块模式
- [ECMAScript Decorators Proposal](https://github.com/tc39/proposal-decorators) — TC39 装饰器提案
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) — TS 装饰器实验性功能
- [JSDoc @type Tag](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#type) — JSDoc 类型注解
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) — Google TypeScript 风格指南
