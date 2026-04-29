# TypeScript 速查表

> TypeScript 5.6+ 核心语法与类型体操快速参考。

---

## 基础类型

```typescript
// 原始类型
string | number | boolean | null | undefined | symbol | bigint

// 字面量类型
type Status = 'pending' | 'success' | 'error'
type HttpCode = 200 | 404 | 500

// 常用工具类型
Partial<T>      // 所有属性可选
Required<T>     // 所有属性必填
Readonly<T>     // 所有属性只读
Pick<T, K>      // 选取部分属性
Omit<T, K>      // 排除部分属性
Record<K, V>    // 键值映射对象
ReturnType<F>   // 函数返回类型
Parameters<F>    // 函数参数类型元组
```

## 泛型

```typescript
// 基础泛型
function identity<T>(arg: T): T { return arg }

// 泛型约束
function logLength<T extends { length: number }>(arg: T) {
  console.log(arg.length)
}

// 条件类型
type IsString<T> = T extends string ? true : false

// infer 推断
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never
```

## 类型体操

```typescript
// 深度 Readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K]
}

// 模板字面量类型
type EventName<T extends string> = `on${Capitalize<T>}`
// EventName<'click'> → 'onClick'

// 递归类型
type DeepPick<T, Path extends string> =
  Path extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? { [P in K]: DeepPick<T[K], Rest> }
      : never
    : Path extends keyof T
      ? { [P in Path]: T[P] }
      : never
```

## TS 5.6 新特性

```typescript
// strictBuiltinIteratorReturn
// 数组迭代器现在正确返回 number 而非 any
for (const x of [1, 2, 3]) {
  x.toFixed()  // ✅ x 推断为 number
}

// NoInfer<T> — 阻止类型推断
function createLogger<T>(options: { level: NoInfer<T> }): T {
  return options.level
}
const level = createLogger({ level: 'debug' as const })
// level 类型为 'debug'，不从参数推断更宽泛的类型

// 类型收窄改进
const arr = [1, 2, 3] as const
if (arr.includes(x)) {
  // x 被收窄为 1 | 2 | 3
}
```

## 接口 vs 类型别名

```typescript
// interface — 可声明合并，适合对象形状
interface User {
  name: string
}
interface User {        // ✅ 合并声明
  age: number
}

// type — 支持联合/交叉，不能合并
type ID = string | number
type Admin = User & { role: 'admin' }
```

## 常用模式

```typescript
// 品牌类型（名义类型）
type UserId = string & { __brand: 'UserId' }
type PostId = string & { __brand: 'PostId' }
function createUserId(id: string): UserId {
  return id as UserId
}

// 函数重载
function process(input: string): string
function process(input: number): number
function process(input: string | number) {
  return typeof input === 'string' ? input.toUpperCase() : input * 2
}

// 类型守卫
function isString(value: unknown): value is string {
  return typeof value === 'string'
}
```

---

## 参考资源

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript 5.6 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-6/)
- [Total TypeScript](https://www.totaltypescript.com/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)

---

*最后更新: 2026-04-29*
