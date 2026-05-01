---
title: TypeScript 语言全景指南
description: "Awesome JS/TS Ecosystem: TypeScript 语言核心全景梳理，覆盖 5.5-5.8 新特性、类型系统深度、类型体操、编译器 API、工程化配置、工具链与 2026 趋势"
---

# TypeScript 语言全景指南

> 最后更新: 2026-05-01 | 覆盖版本: TypeScript 5.5 / 5.6 / 5.7 / 5.8 | 对齐来源: TypeScript 官方发布说明、GitHub Roadmap、TS Go 仓库

---

## 目录

- [TypeScript 语言全景指南](#typescript-语言全景指南)
  - [目录](#目录)
  - [1. TypeScript 5.5 - 5.8 新特性速览](#1-typescript-55---58-新特性速览)
    - [1.5 Inferred Type Predicates](#15-inferred-type-predicates)
    - [1.5 JSDoc `@import` Tag](#15-jsdoc-import-tag)
    - [1.6 迭代器辅助函数（Iterator Helpers）](#16-迭代器辅助函数iterator-helpers)
    - [1.7 `NoInfer<T>` 类型工具](#17-noinfert-类型工具)
    - [1.5 基于 `--module` 的 `rewriteRelativeImportExtensions`](#15-基于---module-的-rewriterelativeimportextensions)
    - [1.8 严格空值检查改进](#18-严格空值检查改进)
    - [1.8 `require(esm)` 互操作支持](#18-requireesm-互操作支持)
  - [2. 类型系统深度](#2-类型系统深度)
    - [2.1 条件类型 (Conditional Types)](#21-条件类型-conditional-types)
    - [2.2 映射类型 (Mapped Types)](#22-映射类型-mapped-types)
    - [2.3 模板字面量类型 (Template Literal Types)](#23-模板字面量类型-template-literal-types)
    - [2.4 递归类型限制与规避](#24-递归类型限制与规避)
  - [3. 类型体操实战：工具类型实现](#3-类型体操实战工具类型实现)
    - [3.1 `PartialByKeys<T, K>`](#31-partialbykeyst-k)
    - [3.2 `DeepReadonly<T>`](#32-deepreadonlyt)
    - [3.3 `UnionToIntersection<U>`](#33-uniontointersectionu)
    - [3.4 `IsEqual<A, B>`](#34-isequala-b)
    - [3.5 `Flatten<T>` 与 `TupleToUnion`](#35-flattent-与-tupletounion)
    - [3.6 `StringToUnion<S>`](#36-stringtounions)
  - [4. TypeScript 编译器 API](#4-typescript-编译器-api)
    - [4.1 Program 与 TypeChecker](#41-program-与-typechecker)
    - [4.2 Transformer 基础用法](#42-transformer-基础用法)
    - [4.3 自定义诊断收集](#43-自定义诊断收集)
  - [5. TS 配置工程化](#5-ts-配置工程化)
    - [5.1 `tsconfig.json` 全字段速查](#51-tsconfigjson-全字段速查)
    - [5.2 严格模式策略矩阵](#52-严格模式策略矩阵)
    - [5.3 项目引用 (Project References)](#53-项目引用-project-references)
    - [5.4 多环境配置拆分](#54-多环境配置拆分)
  - [6. 类型安全边界](#6-类型安全边界)
    - [6.1 `any` vs `unknown`](#61-any-vs-unknown)
    - [6.2 `type` vs `interface`](#62-type-vs-interface)
    - [6.3 Branded Types（名义子类型）](#63-branded-types名义子类型)
  - [7. 工具链全景](#7-工具链全景)
    - [7.1 tsgo（Go 重写 TC）](#71-tsgogo-重写-tc)
    - [7.2 Deno 的 TypeScript 支持](#72-deno-的-typescript-支持)
    - [7.3 Bun 的 TypeScript 支持](#73-bun-的-typescript-支持)
  - [8. 2026 趋势展望](#8-2026-趋势展望)
    - [8.1 tsgo 对生态的影响](#81-tsgo-对生态的影响)
    - [8.2 类型导入自动处理](#82-类型导入自动处理)
    - [8.3 ESM 互操作终局](#83-esm-互操作终局)
  - [参考资源](#参考资源)

---

## 1. TypeScript 5.5 - 5.8 新特性速览

### 1.5 Inferred Type Predicates

> 来源: TypeScript 5.5 Release Notes | [microsoft/TypeScript#57465](https://github.com/microsoft/TypeScript/pull/57465)

TypeScript 5.5 起，编译器可自动从过滤函数体中推断类型谓词 `is`，无需显式标注。

```typescript
// 之前：必须手写 is string[]
function filterStrings(values: (string | number)[]): string[] {
  return values.filter((x): x is string => typeof x === 'string');
}

// TypeScript 5.5+：自动推断 x is string
function filterStringsAuto(values: (string | number)[]) {
  return values.filter((x) => typeof x === 'string');
  // ^? 推断为 string[]，而非 (string | number)[]
}
```

**适用场景**：`filter`、`find`、`some`、`every` 等数组高阶函数的内联回调。

---

### 1.5 JSDoc `@import` Tag

> 来源: TypeScript 5.5 Release Notes | [microsoft/TypeScript#57207](https://github.com/microsoft/TypeScript/pull/57207)

在纯 JavaScript 文件中使用类型导入的新语法，替代 `/// <reference types="..." />` 的冗长写法。

```javascript
// @filename: utils.js
// TypeScript 5.5+ JSDoc @import 语法
/** @import { User, Config } from './types.d.ts' */

/** @type {User} */
const currentUser = { id: 1, name: 'Alice' };

/** @type {Config} */
const appConfig = { env: 'production', debug: false };
```

对比旧写法：

```javascript
// 旧写法（仍可工作）
/// <reference types="./types.d.ts" />
/** @typedef {import('./types').User} User */
```

---

### 1.6 迭代器辅助函数（Iterator Helpers）

> 来源: TypeScript 5.6 Release Notes | [tc39/proposal-iterator-helpers](https://github.com/tc39/proposal-iterator-helpers)

TypeScript 5.6 将 ES2024 迭代器辅助函数纳入类型系统。注意：这是 **JS 运行时特性**，TS 提供类型声明。

```typescript
// ES2024 Iterator Helpers（需 target ES2024+ 或 lib 包含 "ES2024.Iterator"）
function* generateIds() {
  yield 1; yield 2; yield 3;
}

const iter = generateIds()
  .map((x) => x * 2)
  .filter((x) => x > 2)
  .take(2);

console.log([...iter]); // [4, 6]
```

| 方法 | 说明 | 版本 |
|------|------|------|
| `Iterator.prototype.map` | 映射 | 5.6+ |
| `Iterator.prototype.filter` | 过滤 | 5.6+ |
| `Iterator.prototype.take` | 取前 N 个 | 5.6+ |
| `Iterator.prototype.drop` | 跳过前 N 个 | 5.6+ |
| `Iterator.prototype.flatMap` | 展平映射 | 5.6+ |
| `Iterator.prototype.reduce` | 归约 | 5.6+ |
| `Iterator.prototype.toArray` | 转为数组 | 5.6+ |
| `Iterator.prototype.forEach` | 遍历副作用 | 5.6+ |
| `Iterator.prototype.some` | 是否存在 | 5.6+ |
| `Iterator.prototype.every` | 是否全部 | 5.6+ |
| `Iterator.prototype.find` | 查找首个 | 5.6+ |

---

### 1.7 `NoInfer<T>` 类型工具

> 来源: TypeScript 5.7 Release Notes | [microsoft/TypeScript#57690](https://github.com/microsoft/TypeScript/pull/57690)

`NoInfer<T>` 阻止 TypeScript 从某位置推断类型，强制从其他位置推断，解决泛型推断"泄漏"问题。

```typescript
// 问题：T 从 defaultValue 推断为 "light"，导致 createTheme("dark") 报错
declare function createTheme<T extends string>(
  theme: T,
  defaultValue?: T
): T;

const t1 = createTheme("dark", "light"); // T = "dark" | "light"

// 5.7+ 使用 NoInfer：defaultValue 不参与推断
declare function createThemeFixed<T extends string>(
  theme: T,
  defaultValue?: NoInfer<T>
): T;

const t2 = createThemeFixed("dark", "dark");   // ✅ T = "dark"
const t3 = createThemeFixed("dark", "light");  // ❌ 类型不兼容

// 实际应用：React useState 的初始值
function useStateFixed<T>(initial: T): [T, (v: NoInfer<T>) => void];
```

---

### 1.5 基于 `--module` 的 `rewriteRelativeImportExtensions`

> 来源: TypeScript 5.7 Release Notes

TypeScript 5.7 将 `--rewriteRelativeImportExtensions` 提升为正式选项，配合 `--module preserve` 或 `--module nodenext` 自动将 `.ts` 导入重写为 `.js`。

```typescript
// 源代码 (src/main.ts)
import { helper } from './helper.ts';

// 编译输出 (dist/main.js)
import { helper } from './helper.js';
```

```json
// tsconfig.json 配置
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "rewriteRelativeImportExtensions": true,
    "outDir": "./dist"
  }
}
```

---

### 1.8 严格空值检查改进

> 来源: TypeScript 5.8 Release Notes | [microsoft/TypeScript#59905](https://github.com/microsoft/TypeScript/pull/59905)

TypeScript 5.8 在 `strictNullChecks` 下对 `== null` / `!= null` 的守卫逻辑做了更精确的类型收窄，减少不必要的 `as` 断言。

```typescript
interface Node {
  parent?: Node;
  children?: Node[];
}

function getRoot(node: Node): Node {
  // 5.8+：更精确的 truthiness narrowing
  if (node.parent != null) {
    // 之前可能需要 node.parent as Node
    return getRoot(node.parent); // 自动收窄为 Node（非 undefined）
  }
  return node;
}
```

---

### 1.8 `require(esm)` 互操作支持

> 来源: TypeScript 5.8 Release Notes | Node.js 20+ `require(esm)` 实验特性

TypeScript 5.8 正式识别 Node.js 的 `require(esm)` 能力（无需 `--experimental-require-module` 标志即可 require ESM 模块），并在 `--module commonjs` 模式下正确处理 `.cts` 文件对 ESM 包的导入。

```typescript
// config.cts
// TypeScript 5.8+ 允许在 CommonJS 文件中正确解析 ESM-only 包的类型
import { readFile } from 'node:fs/promises'; // ESM-only submodule

export async function loadConfig(path: string) {
  const content = await readFile(path, 'utf-8');
  return JSON.parse(content);
}
```

---

## 2. 类型系统深度

### 2.1 条件类型 (Conditional Types)

条件类型是 TS 类型级编程的核心基础设施，形式为 `T extends U ? X : Y`。

```typescript
// 基础条件类型
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>; // true
type B = IsString<42>;      // false

// 分布式条件类型（Distributive Conditional Types）
type ToArray<T> = T extends any ? T[] : never;
type StringOrNumberArray = ToArray<string | number>;
// => string[] | number[]（分发到联合类型的每个成员）

// 阻止分发：用元组包裹
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type MixedArray = ToArrayNonDist<string | number>;
// => (string | number)[]（不分发）

// infer 关键字：在 extends 子句中推断类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type FnRet = ReturnType<() => Promise<string>>; // Promise<string>

// 提取数组元素
type ElementType<T> = T extends (infer E)[] ? E : never;
type Num = ElementType<number[]>; // number

// 提取 Promise 的解析类型
type Awaited<T> = T extends Promise<infer R> ? Awaited<R> : T;
type Deep = Awaited<Promise<Promise<string>>>; // string
```

**关键陷阱**：

```typescript
// 裸类型参数才会触发分发
type Naked<T> = T extends string ? 'yes' : 'no';
type Wrapped<T> = [T] extends [string] ? 'yes' : 'no';

type N = Naked<string | number>;   // "yes" | "no"（分发）
type W = Wrapped<string | number>; // "no"（不分发）
```

---

### 2.2 映射类型 (Mapped Types)

映射类型基于键集合生成新对象类型，是工具类型的基石。

```typescript
// 基础映射：所有属性变为可选
type Partial<T> = { [P in keyof T]?: T[P] };

// 所有属性变为只读
type Readonly<T> = { readonly [P in keyof T]: T[P] };

// 选取子集键
type Pick<T, K extends keyof T> = { [P in K]: T[P] };

// 重映射键（Remap Keys）
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface User {
  name: string;
  age: number;
}

type UserGetters = Getters<User>;
// => { getName: () => string; getAge: () => number }

// 过滤键（通过 as never 移除）
type RemoveStringKeys<T> = {
  [K in keyof T as T[K] extends string ? never : K]: T[K];
};

type Filtered = RemoveStringKeys<{ a: string; b: number; c: boolean }>;
// => { b: number; c: boolean }

// 组合修饰符：-? 移除可选，-readonly 移除只读
type Required<T> = { [P in keyof T]-?: T[P] };
type Mutable<T> = { -readonly [P in keyof T]: T[P] };
```

---

### 2.3 模板字面量类型 (Template Literal Types)

模板字面量类型将字符串类型拼接，支持模式匹配和字符串操作。

```typescript
// 基础拼接
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<'click'>; // "onClick"

// CSS 变量生成
type CSSVariable<T extends string> = `--${T}`;
type PrimaryColor = CSSVariable<'color-primary'>; // "--color-primary"

// 路由参数提取
type ExtractParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : T extends `${infer _Start}:${infer Param}`
      ? Param
      : never;

type Params = ExtractParams<'/users/:userId/posts/:postId'>;
// => "userId" | "postId"

// 联合类型展开
type Color = 'red' | 'blue';
type Size = 'small' | 'large';
type Variant = `${Color}-${Size}`;
// => "red-small" | "red-large" | "blue-small" | "blue-large"

// 结合 intrinsic 字符串操作
type TrimLeft<S extends string> = S extends ` ${infer Rest}` ? TrimLeft<Rest> : S;
type TrimRight<S extends string> = S extends `${infer Rest} ` ? TrimRight<Rest> : S;
type Trim<S extends string> = TrimLeft<TrimRight<S>>;

type T = Trim<'  hello  '>; // "hello"
```

---

### 2.4 递归类型限制与规避

TypeScript 对递归类型有深度限制（约 50 层实例化），超限会得到 `Type instantiation is excessively deep and possibly infinite`。

```typescript
// 问题：深度递归
type DeepJSON =
  | string
  | number
  | boolean
  | null
  | DeepJSON[]
  | { [key: string]: DeepJSON };

// 规避 1：添加尾端条件类型截断
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

// 规避 2：使用接口的间接递归（接口不触发实例化深度限制）
interface JsonArray extends Array<JsonValue> {}
interface JsonObject {
  [key: string]: JsonValue;
}
type JsonValue = string | number | boolean | null | JsonArray | JsonObject;

// 规避 3：尾递归优化（TS 4.5+）
type Join<
  T extends string[],
  Delimiter extends string = ',',
  Result extends string = ''
> = T extends [infer First, ...infer Rest]
  ? Rest extends string[]
    ? First extends string
      ? Result extends ''
        ? Join<Rest, Delimiter, First>
        : Join<Rest, Delimiter, `${Result}${Delimiter}${First}`>
      : never
    : never
  : Result;

type J = Join<['a', 'b', 'c']>; // "a,b,c"
```

---

## 3. 类型体操实战：工具类型实现

### 3.1 `PartialByKeys<T, K>`

使指定键变为可选，其余保持原样。

```typescript
type PartialByKeys<T, K extends keyof T = keyof T> =
  & { [P in Exclude<keyof T, K>]: T[P] }
  & { [P in K]?: T[P] };

// 使用示例
interface User {
  id: number;
  name: string;
  email: string;
}

type UpdateUser = PartialByKeys<User, 'name' | 'email'>;
// => { id: number } & { name?: string; email?: string }

const update: UpdateUser = { id: 1, name: 'Alice' }; // ✅ email 可选
```

---

### 3.2 `DeepReadonly<T>`

深度只读，递归冻结所有嵌套对象和数组。

```typescript
type DeepReadonly<T> = T extends (infer R)[]
  ? ReadonlyArray<DeepReadonly<R>>
  : T extends (...args: any[]) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

// 使用示例
interface Config {
  server: { port: number; host: string };
  db: { url: string; pool: { min: number; max: number } };
}

type FrozenConfig = DeepReadonly<Config>;

const cfg: FrozenConfig = {
  server: { port: 3000, host: '0.0.0.0' },
  db: { url: 'postgres://...', pool: { min: 2, max: 10 } },
};

// cfg.server.port = 4000; // ❌ Cannot assign to 'port' because it is a read-only property
// cfg.db.pool.min = 5;    // ❌ 深度只读生效
```

---

### 3.3 `UnionToIntersection<U>`

将联合类型转换为交叉类型，是高级类型体操的常用基石。

```typescript
type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends (x: infer I) => void
    ? I
    : never;

// 原理：利用函数参数位置的逆变（contravariance）
// 联合类型在参数位置会转化为交叉类型

type U = { a: string } | { b: number };
type I = UnionToIntersection<U>;
// => { a: string } & { b: number }

// 实际应用：合并多个 Partial 配置
function mergeConfigs<T extends Record<string, any>[]>(
  ...configs: T
): UnionToIntersection<T[number]> {
  return Object.assign({}, ...configs) as any;
}

const merged = mergeConfigs({ a: 1 }, { b: 2 }, { c: 3 });
// merged: { a: number } & { b: number } & { c: number }
```

---

### 3.4 `IsEqual<A, B>`

判断两个类型是否严格相等，处理联合类型和分布的特殊情况。

```typescript
type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

// 原理：利用泛型函数的惰式评估，避免分布式条件类型的干扰

type T1 = IsEqual<string, string>;       // true
type T2 = IsEqual<string | number, string>; // false
type T3 = IsEqual<{ a: 1 }, { a: 1 }>;   // true
type T4 = IsEqual<any, unknown>;         // false
type T5 = IsEqual<never, never>;         // true

// 与 === 对比
type BadEqual<A, B> = A extends B ? (B extends A ? true : false) : false;
type Bad = BadEqual<any, unknown>; // true（错误！）
```

---

### 3.5 `Flatten<T>` 与 `TupleToUnion`

```typescript
// 扁平化元组
type Flatten<T extends any[]> = T extends [infer F, ...infer R]
  ? F extends any[]
    ? [...Flatten<F>, ...Flatten<R>]
    : [F, ...Flatten<R>]
  : [];

type F = Flatten<[1, [2, [3, 4]], 5]>;
// => [1, 2, 3, 4, 5]

// 元组转联合
type TupleToUnion<T extends any[]> = T[number];
type U = TupleToUnion<['a', 'b', 'c']>; // "a" | "b" | "c"

// 结合：从字符串数组生成联合的 Union
type StringTupleToUnion<T extends readonly string[]> = T[number];
const ROUTES = ['/home', '/about', '/contact'] as const;
type Route = StringTupleToUnion<typeof ROUTES>;
// => "/home" | "/about" | "/contact"
```

---

### 3.6 `StringToUnion<S>`

将字符串拆分为字符联合类型。

```typescript
type StringToUnion<S extends string> =
  S extends `${infer C}${infer Rest}` ? C | StringToUnion<Rest> : never;

type Chars = StringToUnion<'hello'>;
// => "h" | "e" | "l" | "o"

// 扩展：检查字符串是否包含某字符
type Contains<S extends string, C extends string> =
  S extends `${infer _}${C}${infer _}` ? true : false;

type HasA = Contains<'hello', 'e'>; // true
type HasZ = Contains<'hello', 'z'>; // false
```

---

## 4. TypeScript 编译器 API

> 来源: [TypeScript Compiler API 文档](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)

### 4.1 Program 与 TypeChecker

`ts.createProgram` 是编译器 API 的入口，负责解析源码并构建类型检查上下文。

```typescript
import * as ts from 'typescript';

// ===== 创建 Program =====
const fileName = 'src/app.ts';
const program = ts.createProgram([fileName], {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  strict: true,
  noEmit: true, // 只分析，不输出
});

// ===== 获取 TypeChecker =====
const checker = program.getTypeChecker();

// ===== 遍历源文件的 AST =====
const sourceFile = program.getSourceFile(fileName)!;

function visit(node: ts.Node) {
  if (ts.isFunctionDeclaration(node) && node.name) {
    const symbol = checker.getSymbolAtLocation(node.name);
    if (symbol) {
      const type = checker.getTypeOfSymbolAtLocation(symbol, node.name);
      console.log(
        `Function: ${node.name.text}, ` +
        `Type: ${checker.typeToString(type)}`
      );
    }
  }
  ts.forEachChild(node, visit);
}

visit(sourceFile);
```

---

### 4.2 Transformer 基础用法

Transformer 在编译阶段对 AST 进行转换，常用于代码生成和宏展开。

```typescript
import * as ts from 'typescript';

// 示例：将所有 console.log 调用替换为空语句（tree-shaking 辅助）
const stripConsoleLog: ts.TransformerFactory<ts.SourceFile> = (context) => {
  return (sourceFile) => {
    function visit(node: ts.Node): ts.Node {
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === 'console' &&
        ts.isIdentifier(node.expression.name) &&
        node.expression.name.text === 'log'
      ) {
        // 替换为空语句
        return ts.factory.createEmptyStatement();
      }
      return ts.visitEachChild(node, visit, context);
    }
    return ts.visitNode(sourceFile, visit) as ts.SourceFile;
  };
};

// 使用 transformer 发射代码
const result = ts.transpileModule(
  `console.log('hello'); const x = 1;`,
  {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
    transformers: { before: [stripConsoleLog] },
  }
);

console.log(result.outputText);
// => ";const x = 1;"
```

**更实用的 Transformer：为所有函数添加耗时监控**

```typescript
const addTiming: ts.TransformerFactory<ts.SourceFile> = (context) => {
  return (sourceFile) => {
    function visit(node: ts.Node): ts.Node {
      if (ts.isFunctionDeclaration(node) && node.name) {
        const fnName = node.name.text;
        const start = ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('console'),
            'time'
          ),
          undefined,
          [ts.factory.createStringLiteral(fnName)]
        );
        const end = ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('console'),
            'timeEnd'
          ),
          undefined,
          [ts.factory.createStringLiteral(fnName)]
        );

        const body = ts.isBlock(node.body!)
          ? ts.factory.updateBlock(node.body, [
              ts.factory.createExpressionStatement(start),
              ...node.body.statements,
              ts.factory.createExpressionStatement(end),
            ])
          : node.body!;

        return ts.factory.updateFunctionDeclaration(
          node,
          node.modifiers,
          node.asteriskToken,
          node.name,
          node.typeParameters,
          node.parameters,
          node.type,
          body
        );
      }
      return ts.visitEachChild(node, visit, context);
    }
    return ts.visitNode(sourceFile, visit) as ts.SourceFile;
  };
};
```

---

### 4.3 自定义诊断收集

```typescript
import * as ts from 'typescript';

function getDiagnostics(fileNames: string[], options: ts.CompilerOptions) {
  const program = ts.createProgram(fileNames, options);
  const diagnostics = [
    ...program.getConfigFileParsingDiagnostics(),
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics(),
  ];

  return diagnostics.map((d) => {
    const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
    const file = d.file;
    if (file && d.start !== undefined) {
      const { line, character } = file.getLineAndCharacterOfPosition(d.start);
      return `${file.fileName}:${line + 1}:${character + 1} - ${message}`;
    }
    return message;
  });
}

// 使用
const errors = getDiagnostics(['src/index.ts'], {
  target: ts.ScriptTarget.ES2022,
  strict: true,
});

console.log(errors.join('\n'));
```

---

## 5. TS 配置工程化

### 5.1 `tsconfig.json` 全字段速查

```json
{
  "compilerOptions": {
    // ===== 目标与模块 =====
    "target": "ES2022",           // 编译目标 JS 版本
    "module": "NodeNext",         // 模块系统: CommonJS/ESNext/NodeNext/Preserve
    "moduleResolution": "NodeNext", // 模块解析策略
    "lib": ["ES2022", "DOM"],     // 内置 API 声明

    // ===== 输出控制 =====
    "outDir": "./dist",           // 输出目录
    "rootDir": "./src",           // 源码根目录
    "declaration": true,          // 生成 .d.ts 声明文件
    "declarationMap": true,       // 生成 .d.ts.map
    "sourceMap": true,            // 生成 .js.map
    "inlineSourceMap": false,     // 内联 source map（与 sourceMap 互斥）
    "emitDeclarationOnly": false, // 只输出 .d.ts
    "noEmit": true,               // 不输出文件（仅类型检查）
    "noEmitOnError": true,        // 有错误时不输出

    // ===== 严格类型检查 =====
    "strict": true,               // 启用所有严格选项（推荐）
    "noImplicitAny": true,        // 禁止隐式 any
    "strictNullChecks": true,     // 严格 null/undefined 检查
    "strictFunctionTypes": true,  // 严格函数参数逆变检查
    "strictBindCallApply": true,  // 严格 bind/call/apply 类型检查
    "strictPropertyInitialization": true, // 类属性必须初始化
    "noImplicitReturns": true,    // 函数所有分支必须返回
    "noFallthroughCasesInSwitch": true, // switch 禁止 fallthrough
    "noUncheckedIndexedAccess": true, // 索引访问返回 T | undefined
    "exactOptionalPropertyTypes": true, // 区分 undefined 与可选

    // ===== 模块互操作 =====
    "esModuleInterop": true,      // 兼容 CommonJS 默认导出
    "allowSyntheticDefaultImports": true, // 允许合成默认导入
    "forceConsistentCasingInFileNames": true, // 强制文件名大小写一致
    "resolveJsonModule": true,    // 导入 JSON 文件
    "isolatedModules": true,      // 确保每个文件可独立编译（Babel/swc 要求）
    "verbatimModuleSyntax": true, // 保留 import type / export type
    "rewriteRelativeImportExtensions": true, // 重写 .ts -> .js（5.7+）

    // ===== 装饰器（旧版与新版）=====
    "experimentalDecorators": true,      // 旧版装饰器
    "emitDecoratorMetadata": true,       // 旧版元数据
    // 新版装饰器（ES2023+）不需要上述标志

    // ===== JSX =====
    "jsx": "react-jsx",           // react-jsx / react / preserve
    "jsxImportSource": "react",   // JSX 转换来源

    // ===== 路径映射 =====
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@utils/*": ["./src/utils/*"]
    },
    "rootDirs": [],               // 虚拟根目录（合并目录）

    // ===== 高级 =====
    "skipLibCheck": true,         // 跳过 .d.ts 类型检查（加速编译）
    "incremental": true,          // 增量编译
    "tsBuildInfoFile": ".tsbuildinfo",
    "composite": true,            // 项目引用（必须开启）
    "declarationDir": "./types",  // .d.ts 输出目录
    "preserveSymlinks": true,     // 保留符号链接
    "customConditions": ["dev"]   // package.json exports conditions
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"],
  "references": [
    { "path": "../shared" }
  ]
}
```

---

### 5.2 严格模式策略矩阵

| 选项 | 作用 | 迁移建议 | 风险等级 |
|------|------|---------|---------|
| `strict` | 启用所有严格选项 | 新项目必开，旧项目逐步开启 | 低 |
| `strictNullChecks` | null/undefined 必须显式处理 | 优先开启，修复空值错误 | 中 |
| `noImplicitAny` | 禁止隐式 any | 配合类型补全逐步修复 | 中 |
| `strictFunctionTypes` | 函数参数严格协变 | 影响回调类型定义 | 低 |
| `noUncheckedIndexedAccess` | `arr[i]` 返回 `T \| undefined` | 需大量添加非空断言 | 高 |
| `exactOptionalPropertyTypes` | `prop?: T` 不接受显式 `undefined` | 影响 API 类型定义 | 中 |
| `isolatedModules` | 单文件可独立编译 | swc/Babel 必须开启 | 低 |

**渐进式迁移策略**：

```json
// 阶段 1：基础严格（新项目默认）
{
  "strict": true,
  "isolatedModules": true,
  "skipLibCheck": true
}

// 阶段 2：进阶安全
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
}

// 阶段 3：最严格（库开发推荐）
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "forceConsistentCasingInFileNames": true
}
```

---

### 5.3 项目引用 (Project References)

项目引用是大型 TypeScript 代码库的核心组织方式，支持增量编译和逻辑拆分。

```json
// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,       // 必须：启用项目引用
    "declaration": true,     // 必须：生成 .d.ts
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true
  },
  "include": ["src/**/*"]
}

// packages/app/tsconfig.json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true
  },
  "references": [
    { "path": "../shared" }   // 引用 shared 包
  ]
}
```

**构建命令**：

```bash
# 使用 --build 模式编译整个项目图
tsc --build packages/app

# 只构建有变化的部分（增量）
tsc --build packages/app --force    # 强制全量
```

**workspace 结构示例**：

```
monorepo/
├── tsconfig.base.json          # 共享基础配置
├── packages/
│   ├── shared/                 # 基础工具库
│   │   ├── tsconfig.json       # extends ../../tsconfig.base.json
│   │   └── src/
│   ├── api/                    # 后端服务
│   │   ├── tsconfig.json       # references: ["../shared"]
│   │   └── src/
│   └── web/                    # 前端应用
│       ├── tsconfig.json       # references: ["../shared"]
│       └── src/
```

---

### 5.4 多环境配置拆分

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true
  }
}

// tsconfig.app.json（应用编译）
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist/app",
    "rootDir": "./src",
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"]
}

// tsconfig.node.json（Vite/构建脚本）
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist/node",
    "rootDir": "./scripts",
    "types": ["node"]
  },
  "include": ["scripts/**/*", "vite.config.ts"]
}

// tsconfig.test.json（测试）
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist/test",
    "types": ["vitest/globals", "node"]
  },
  "include": ["src/**/*.test.ts", "src/**/*.spec.ts"]
}
```

---

## 6. 类型安全边界

### 6.1 `any` vs `unknown`

| 特性 | `any` | `unknown` |
|------|-------|-----------|
| 赋值兼容性 | 可赋值给任何类型 | 只能赋值给 `unknown` / `any` |
| 属性访问 | 允许任意属性访问 | 禁止（必须先类型收窄） |
| 函数调用 | 允许作为任意函数调用 | 禁止 |
| 安全等级 | 关闭类型检查（逃生舱） | 强制类型守卫 |
| 使用场景 | 遗留代码迁移、动态内容 | 安全的顶层类型、API 输入 |

```typescript
// ❌ any：完全关闭类型检查
function parseAny(input: any): any {
  return input.data.nested.value; // 运行时可能崩溃
}

// ✅ unknown：强制类型守卫
function parseUnknown(input: unknown): string {
  if (
    typeof input === 'object' &&
    input !== null &&
    'data' in input &&
    typeof (input as Record<string, any>).data === 'object'
  ) {
    const data = (input as Record<string, any>).data;
    if ('value' in data && typeof data.value === 'string') {
      return data.value;
    }
  }
  throw new Error('Invalid input shape');
}

// ✅ 更优雅的守卫函数
function isStringRecord(obj: unknown): obj is Record<string, string> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Object.values(obj).every((v) => typeof v === 'string')
  );
}
```

---

### 6.2 `type` vs `interface`

| 特性 | `type` | `interface` |
|------|--------|-------------|
| 合并声明（Declaration Merging） | ❌ 不可重复声明 | ✅ 同名自动合并 |
| extends / implements | 通过 `&` 交叉 | 通过 `extends` 继承 |
| 联合/交叉类型 | ✅ 支持 `A \| B` | ❌ 不可直接定义联合 |
| 映射类型键 | ✅ 可用于映射键 | ❌ 不可直接用于 `in` |
| 性能（大规模项目） | 可能产生深层嵌套 | 更适合递归结构，缓存友好 |
| 错误信息可读性 | 交叉类型错误较冗长 | 继承链错误更清晰 |

```typescript
// interface 合并：扩展第三方类型
interface Window {
  __REDUX_DEVTOOLS_EXTENSION__?: () => any;
}

// interface 继承链
interface Animal {
  name: string;
}
interface Dog extends Animal {
  breed: string;
}

// type 优势：联合类型、条件类型
type Status = 'idle' | 'loading' | 'success' | 'error';
type Response<T> = { data: T; status: 'success' } | { error: Error; status: 'error' };

// type 用于工具类型
type Nullable<T> = T | null;
type KeysOf<T> = keyof T;

// 推荐策略：
// - 对象形状/类实现 → interface（可合并、错误友好）
// - 联合类型、工具类型、条件类型 → type
// - 需要扩展第三方类型 → interface（declaration merging）
```

---

### 6.3 Branded Types（名义子类型）

TypeScript 默认采用结构类型（structural typing），Branded Types 通过交叉类型模拟名义类型（nominal typing），防止不同语义值的混淆。

```typescript
// 基础 Brand 类型
type Brand<K, T> = T & { readonly __brand: K };

// 定义名义子类型
type UserId = Brand<'UserId', number>;
type OrderId = Brand<'OrderId', number>;
type Email = Brand<'Email', string>;

// 工厂函数（类型断言是安全的，因为运行时无差异）
function UserId(id: number): UserId {
  return id as UserId;
}
function OrderId(id: number): OrderId {
  return id as OrderId;
}
function Email(value: string): Email {
  if (!value.includes('@')) throw new Error('Invalid email');
  return value as Email;
}

// 使用
const uid = UserId(42);
const oid = OrderId(42);

function getUser(id: UserId) { /* ... */ }

getUser(uid); // ✅
// getUser(oid); // ❌ 类型错误：OrderId 不可赋值给 UserId
// getUser(42);  // ❌ 类型错误：number 不可赋值给 UserId

// 实际应用：单位类型
type Meters = Brand<'Meters', number>;
type Seconds = Brand<'Seconds', number>;

function meters(v: number): Meters { return v as Meters; }
function seconds(v: number): Seconds { return v as Seconds; }

function velocity(d: Meters, t: Seconds): number {
  return (d as number) / (t as number);
}

velocity(meters(100), seconds(10)); // ✅
// velocity(seconds(10), meters(100)); // ❌ 编译时阻止单位错误
```

---

## 7. 工具链全景

### 7.1 tsgo（Go 重写 TC）

> 来源: [microsoft/typescript-go](https://github.com/microsoft/typescript-go) | 状态: 活跃开发中（2025-2026）

TypeScript 团队于 2024 年底宣布用 Go 语言重写 TypeScript 编译器（原代号 "tsgo"），目标是将类型检查速度提升 **10 倍**。

| 维度 | tsc (Node.js) | tsgo (Go) |
|------|---------------|-----------|
| 编译器语言 | TypeScript | Go |
| 单线程/多线程 | 单线程 | 多线程并行 |
| 内存管理 | GC（V8） | GC（Go） |
| 类型检查性能 | 基准 | **~10x 提升（目标）** |
| 输出格式 | .js + .d.ts | 兼容 tsc 输出 |
| LSP 支持 | tsserver（Node） | 新 LSP 实现 |
| 发布时间 | 2012-至今 | 预计 2026 Beta |

**当前状态（2026-05）**：

- 类型检查器核心已完成移植，通过 99%+ 的现有测试套件
- CLI 工具链正在对接中
- LSP（语言服务器协议）实现仍在开发
- 目标：与现有 `tsconfig.json` 完全兼容

**对生态的影响**：

- 构建工具（Vite、esbuild）无需改动，因为 tsgo 只替代类型检查层
- IDE（VS Code）将获得极速类型反馈
- CI 类型检查时间从分钟级降至秒级

---

### 7.2 Deno 的 TypeScript 支持

> 来源: [Deno Manual](https://docs.deno.com/runtime/)

Deno 原生内置 TypeScript 支持，无需 `tsconfig.json` 或 `tsc`。

```typescript
// Deno 直接运行 TypeScript（无需编译步骤）
// $ deno run --allow-net src/server.ts

import { serve } from "https://deno.land/std@0.220.0/http/server.ts";

// Deno 全局类型
const encoder = new TextEncoder();
const data = encoder.encode("Hello Deno");

// Deno 命名空间 API
Deno.readTextFile("./config.json").then(console.log);

// 内置严格模式：默认启用 strict 选项
// 通过 deno.json 配置
```

```json
// deno.json
{
  "compilerOptions": {
    "strict": true,
    "lib": ["deno.window"],
    "jsx": "react-jsx",
    "jsxImportSource": "https://esm.sh/react@18"
  },
  "imports": {
    "@std/http": "jsr:@std/http@^0.220.0"
  }
}
```

| 特性 | Deno | Node + tsc |
|------|------|-----------|
| 内置 TS 支持 | ✅ 原生 | ❌ 需 tsc/swc |
| tsconfig.json | ❌ 不需要 | ✅ 需要 |
| 外部类型声明 | 自动缓存 | 需 @types/* |
| JSR 注册表 | ✅ 原生 | 通过 npm 兼容层 |
| npm 兼容 | ✅ `npm:` 前缀 | ✅ 原生 |

---

### 7.3 Bun 的 TypeScript 支持

> 来源: [Bun Docs](https://bun.sh/docs/typescript)

Bun 内置 TypeScript transpiler（基于 Zig 编写），将 TS 转译为 JS 的速度极快，但类型检查仍委托给 `tsc`。

```typescript
// Bun 直接运行 TypeScript
// $ bun run src/index.ts

// 支持 TS 路径别名（自动读取 tsconfig.json paths）
import { helper } from "@/utils/helper";

// 支持 TSX（无需额外配置）
function Component({ name }: { name: string }) {
  return <div>Hello {name}</div>;
}

// Bun 特有的类型：bun-types
/// <reference types="bun" />
Bun.write("output.txt", "Hello");
```

```json
// tsconfig.json（Bun 推荐配置）
{
  "compilerOptions": {
    "lib": ["ESNext"],
    "module": "ESNext",
    "target": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "types": ["bun-types"],
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

| 特性 | Bun | Node + tsx/ts-node |
|------|-----|-------------------|
| Transpile 速度 | **极快**（Zig） | 中等 |
| 类型检查 | 需 `tsc --noEmit` | 需 `tsc --noEmit` |
| 内置 Test Runner | ✅ `bun:test` | 需 Vitest/Jest |
| 包管理器 | ✅ 内置 | npm/pnpm/yarn |
| 运行时兼容 | Node 兼容层 | 原生 Node |

---

## 8. 2026 趋势展望

### 8.1 tsgo 对生态的影响

tsgo 的推出将从根本上改变 TypeScript 生态的底层基础设施：

| 领域 | 当前痛点 | tsgo 解决后 |
|------|---------|------------|
| IDE 体验 | tsserver 大型项目卡顿 | 亚秒级类型反馈 |
| CI/CD | 类型检查占构建时间 30-50% | 降至 <5% |
| Monorepo | 跨项目类型检查分钟级 | 秒级增量检查 |
| 边缘部署 | 无法运行 tsc | tsgo 二进制直接部署 |
| 库开发 | .d.ts 生成慢 | 即时声明生成 |

**迁移准备**：

- 保持 `tsconfig.json` 标准化（tsgo 承诺完全兼容）
- 避免依赖未文档化的 tsc 内部行为
- 关注 `typescript-go` 仓库的 Beta 发布计划

---

### 8.2 类型导入自动处理

TypeScript 5.0 引入的 `verbatimModuleSyntax` 标志着类型导入的明确化趋势，2026 年将进一步强化：

```typescript
// 当前最佳实践（明确区分值与类型）
import { type Config } from './types';   // TS 4.5+ import type
import { helper } from './utils';        // 值导入

// 未来趋势：编译器自动优化
// tsgo 计划支持自动将未使用的值导入降级为 type-only
// 无需手动标记，编译器从使用场景推断
```

| 方向 | 说明 | 状态 |
|------|------|------|
| `verbatimModuleSyntax` 普及 | 强制显式 `import type` | 已发布，逐渐 adoption |
| 自动 type elision | 编译器自动剥离类型导入 | 社区讨论中 |
| 运行时类型元数据 | 装饰器元数据提案 Stage 3 | ES2026 可能纳入 |

---

### 8.3 ESM 互操作终局

TypeScript 5.7-5.8 在 ESM/CJS 互操作上的持续投入预示 2026 年的终局方向：

```typescript
// 现状（TypeScript 5.8）
// .cts 文件可以正确 require ESM 包（配合 Node 20+）
// .mts 文件保持纯 ESM

// tsconfig.json 推荐配置（2026）
{
  "compilerOptions": {
    "module": "NodeNext",           // Node.js 官方推荐
    "moduleResolution": "NodeNext",
    "rewriteRelativeImportExtensions": true,  // 自动 .ts → .js
    "verbatimModuleSyntax": true    // 明确值/类型导入
  }
}
```

| 趋势 | 影响 |
|------|------|
| `"type": "module"` 成为默认 | 新项目推荐 ESM first |
| `.ts` 扩展名导入标准化 | Node.js 实验性支持 `.ts` 直接运行 |
| CJS 逐步边缘化 | 库作者优先发布 ESM |
| TS 双发布模式简化 | `tsc` + `tsgo` 统一 ESM 输出 |

---

## 参考资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript 5.5 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/)
- [TypeScript 5.6 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-6/)
- [TypeScript 5.7 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-7/)
- [TypeScript 5.8 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/)
- [TypeScript Compiler API Wiki](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [tsgo (typescript-go) 仓库](https://github.com/microsoft/typescript-go)
- [Deno TypeScript 文档](https://docs.deno.com/runtime/)
- [Bun TypeScript 文档](https://bun.sh/docs/typescript)
- [type-challenges](https://github.com/type-challenges/type-challenges) — 类型体操题库
- [Total TypeScript](https://www.totaltypescript.com/) — Matt Pocock 进阶教程
