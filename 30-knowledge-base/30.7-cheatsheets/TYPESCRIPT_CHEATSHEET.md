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

// 对象路径类型推导
type Path<T> = T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? `${K}` | `${K}.${Path<T[K]>}`
        : never
    }[keyof T]
  : never

// 类型安全的 get 辅助
type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends Path<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P]
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

## TS 5.7+ 前瞻特性

```typescript
// 显式资源管理（using / await using）
// 需要 target: ES2022+ 且 lib 包含 "esnext.disposable"
{
  using conn = await createDbConnection();
  // conn 在块结束时自动调用 [Symbol.dispose]()
}

// 类型导入属性（Import Attributes）
import pkg from './package.json' with { type: 'json' };
// pkg 被推断为 JSON 对象的类型

// 装饰器元数据（Stage 3 实验性）
// tsconfig.json: "experimentalDecorators": false, "emitDecoratorMetadata": true
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

// satisfies 运算符（TS 4.9+）
const config = {
  host: 'localhost',
  port: 3000,
} satisfies { host: string; port: number }
// config.host 被推断为精确的字面量 'localhost'，同时保证整体结构匹配

// const 类型参数（TS 5.0+）
function createRoute<const T extends string>(path: T) {
  return { path }
}
const route = createRoute('/users/:id') // T 推断为 "/users/:id" 而非 string
```

## 高级类型模式

```typescript
// 分布式条件类型
type ToArray<T> = T extends any ? T[] : never
type StrOrNumArray = ToArray<string | number> // string[] | number[]

// 逆变/协变控制
type Contravariant<T> = (x: T) => void
type Covariant<T> = T extends unknown ? T : never

// 类型级字符串操作
type TrimLeft<S extends string> = S extends ` ${infer Rest}` ? TrimLeft<Rest> : S
type TrimRight<S extends string> = S extends `${infer Rest} ` ? TrimRight<Rest> : S
type Trim<S extends string> = TrimLeft<TrimRight<S>>

// 联合类型转交叉类型
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

// 函数参数类型提取
type ArgType<T> = T extends (arg: infer A) => any ? A : never

// 非空属性过滤
type NonNullableProperties<T> = {
  [K in keyof T as T[K] extends null | undefined ? never : K]: T[K]
}
```

## 配置速查（tsconfig.json）

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## 参考资源

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript 5.6 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-6/)
- [TypeScript 5.7 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-7/)
- [Total TypeScript](https://www.totaltypescript.com/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
- [TypeScript Deep Dive (Basarat)](https://basarat.gitbook.io/typescript/)
- [TypeScript AST Viewer](https://ts-ast-viewer.com/) — 在线 AST 可视化工具
- [TypeScript Playground](https://www.typescriptlang.org/play) — 官方在线编辑器
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig) — 完整配置选项参考
- [Matt Pocock — Zod & TypeScript](https://www.totaltypescript.com/tutorials/zod) — 运行时类型验证
- [Effective TypeScript — Dan Vanderkam](https://effectivetypescript.com/)
- [Learning TypeScript — Josh Goldberg](https://www.learningtypescript.com/)
- [ts-pattern](https://github.com/gvergnaud/ts-pattern) —  exhaustively 模式匹配库

---

*最后更新: 2026-04-29*
