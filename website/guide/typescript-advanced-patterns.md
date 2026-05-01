---
title: TypeScript 高级模式指南
description: '条件类型、映射类型、模板字面量类型、类型体操与编译器 API 的深度指南'
---

# TypeScript 高级模式指南

> 最后更新: 2026-05-01

---

## 概述

TypeScript 的类型系统是一种图灵完备的语言。本指南深入解析高级类型模式，帮助开发者从"能用 TS"进阶到"精通 TS"。

---

## 条件类型

### 基础条件类型

```ts
type IsString<T> = T extends string ? true : false

type A = IsString<'hello'>     // true
type B = IsString<123>         // false
```

### 分布式条件类型

```ts
type ToArray<T> = T extends any ? T[] : never

type StrOrNumArray = ToArray<string | number>
// string[] | number[] (分布式)
```

### infer 提取类型

```ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

type Fn = () => string
type R = ReturnType<Fn>  // string

// 提取 Promise 返回值
type Awaited<T> = T extends Promise<infer R> ? R : T
type X = Awaited<Promise<number>>  // number
```

---

## 映射类型

### 基础映射

```ts
type Readonly<T> = {
  readonly [K in keyof T]: T[K]
}

type Partial<T> = {
  [K in keyof T]?: T[K]
}

type Required<T> = {
  [K in keyof T]-?: T[K]  // -? 移除可选
}
```

### Key Remapping (TS 4.1+)

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

interface User {
  name: string
  age: number
}

type UserGetters = Getters<User>
// { getName: () => string; getAge: () => number }
```

### 过滤键

```ts
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
}

interface Props {
  name: string
  age: number
  visible: boolean
}

type StringProps = PickByType<Props, string>
// { name: string }
```

---

## 模板字面量类型

### 基础用法

```ts
type EventName<T extends string> = `on${Capitalize<T>}`

type ClickEvent = EventName<'click'>  // 'onClick'
```

### 路径类型

```ts
type Path<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? `${K}.${Path<T[K], keyof T[K]>}` | K
    : K
  : never

interface User {
  name: string
  address: {
    city: string
    zip: number
  }
}

type UserPath = Path<User, keyof User>
// 'name' | 'address' | 'address.city' | 'address.zip'
```

---

## 类型体操挑战

### DeepReadonly

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K]
}
```

### Tuple to Union

```ts
type TupleToUnion<T extends readonly any[]> = T[number]

type R = TupleToUnion<[1, 2, 3]>  // 1 | 2 | 3
```

### Union to Intersection

```ts
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends
  (k: infer I) => void ? I : never

type R = UnionToIntersection<{ a: 1 } | { b: 2 }>
// { a: 1 } & { b: 2 }
```

---

## 编译器 API

### 创建 TypeScript 程序

```ts
import * as ts from 'typescript'

const program = ts.createProgram(['src/index.ts'], {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
})

const checker = program.getTypeChecker()

// 遍历源文件
for (const sourceFile of program.getSourceFiles()) {
  if (!sourceFile.isDeclarationFile) {
    ts.forEachChild(sourceFile, visit)
  }
}

function visit(node: ts.Node) {
  if (ts.isFunctionDeclaration(node) && node.name) {
    const symbol = checker.getSymbolAtLocation(node.name)
    const type = checker.getTypeOfSymbolAtLocation(symbol!, node.name)
    console.log(`${node.name.text}: ${checker.typeToString(type)}`)
  }
  ts.forEachChild(node, visit)
}
```

### 自定义 Transformer

```ts
const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
  return (sourceFile) => {
    const visitor = (node: ts.Node): ts.Node => {
      if (ts.isCallExpression(node) &&
          node.expression.getText(sourceFile) === 'console.log') {
        // 删除 console.log
        return ts.factory.createEmptyStatement()
      }
      return ts.visitEachChild(node, visitor, context)
    }
    return ts.visitNode(sourceFile, visitor)
  }
}
```

---

## 实用模式

### Brand Type (名义类型)

```ts
type Brand<K, T> = T & { __brand: K }

type UserId = Brand<'UserId', string>
type OrderId = Brand<'OrderId', string>

function createUserId(id: string): UserId {
  return id as UserId
}

const userId = createUserId('123')
// const orderId: OrderId = userId  // ❌ 编译错误
```

### 函数重载 vs 条件类型

```ts
// 函数重载
function process(value: string): string
function process(value: number): number
function process(value: string | number): string | number {
  return typeof value === 'string' ? value.toUpperCase() : value * 2
}

// 条件类型（更灵活）
type Process<T> = T extends string ? string : T extends number ? number : never
```

---

## 2026 新特性

| 特性 | TS 版本 | 说明 |
|------|:-------:|------|
| **NoInfer&lt;T&gt;** | 5.4 | 阻止类型推断 |
| **Object.groupBy** | 5.4 | 类型安全的分组 |
| **类型导入修饰符** | 5.0 | import type { ... } |
| **装饰器元数据** | 5.2 | TC39 标准装饰器 |
| **using 声明** | 5.2 | 显式资源管理 |
| **tsgo** | - | Go 重写，10-30x 速度提升 |

---

## 参考资源

- [TypeScript Handbook - Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html) 📚
- [type-challenges](https://github.com/type-challenges/type-challenges) 📚 GitHub 40k+ Stars
- [TS 编译器 API 文档](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) 📚
- [Total TypeScript](https://www.totaltypescript.com/) 📚 Matt Pocock
