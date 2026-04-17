---
title: TypeScript 速查表
description: 涵盖常用语法、类型系统、泛型、工具类型等核心知识点的一页纸速查表
---

# TypeScript 速查表

> 一页纸打印版 | 涵盖常用语法、类型系统、泛型、工具类型等核心知识点

---

## 1. 基础类型速查表

| 类型 | 语法示例 | 说明 |
|:---:|:---|:---|
| `string` | `let s: string = "text"` | 字符串类型 |
| `number` | `let n: number = 42` | 数字（整数/浮点数） |
| `boolean` | `let b: boolean = true` | 布尔值 |
| `null` | `let x: null = null` | 空值 |
| `undefined` | `let y: undefined = undefined` | 未定义 |
| `any` | `let a: any = 任意值` | 禁用类型检查 |
| `unknown` | `let u: unknown = x` | 类型安全的any |
| `never` | `function err(): never { throw 1 }` | 永不返回 |
| `void` | `function fn(): void {}` | 无返回值 |
| `symbol` | `let s: symbol = Symbol()` | 符号类型 |
| `bigint` | `let b: bigint = 100n` | 大整数 |

---

## 2. 复合类型速查表

| 类型 | 语法示例 | 说明 |
|:---:|:---|:---|
| **数组** | `let arr: number[]` 或 `Array<number>` | 同类型元素数组 |
| **元组** | `let t: [string, number]` | 固定长度+类型的数组 |
| **可选元组** | `let t: [string, number?]` | 可选元素用 `?` |
| **剩余元组** | `let t: [string, ...number[]]` | 展开剩余元素 |
| **枚举** | `enum Color { Red, Green }` | 命名常量集合 |
| **数字枚举** | `enum E { A = 1, B = 2 }` | 可自定义起始值 |
| **字符串枚举** | `enum S { A = 'a', B = 'b' }` | 字符串成员 |
| **常量枚举** | `const enum E { A, B }` | 编译时内联 |
| **对象** | `let o: { name: string; age: number }` | 对象类型字面量 |
| **可选属性** | `{ name?: string }` | 可选属性用 `?` |
| **只读属性** | `{ readonly id: number }` | 只读修饰符 |
| **索引签名** | `{ [key: string]: number }` | 动态属性键 |

---

## 3. 接口 vs 类型别名 对比表

| 特性 | `interface` | `type` |
|:---:|:---|:---|
| **定义** | `interface A { x: number }` | `type A = { x: number }` |
| **合并声明** | ✅ 自动合并同名接口 | ❌ 不能重复定义 |
| **扩展方式** | `extends` | `&` (交叉类型) |
| **实现类** | ✅ `class C implements I` | ✅ `class C implements T` |
| **联合类型** | ❌ 不支持 | ✅ `type T = A \| B` |
| **元组类型** | ❌ 不支持 | ✅ `type T = [A, B]` |
| **映射类型** | ❌ 不支持 | ✅ `type M = { [K in T]: V }` |
| **条件类型** | ❌ 不支持 | ✅ `type C = T extends U ? X : Y` |
| **原始类型别名** | ❌ 不支持 | ✅ `type ID = string` |
| **适用场景** | 对象结构、类契约 | 复杂类型运算、联合/条件类型 |

---

## 4. 泛型常用模式速查表

| 模式 | 语法示例 | 说明 |
|:---:|:---|:---|
| **基础泛型** | `function f<T>(x: T): T` | 函数泛型 |
| **多类型参数** | `function f<T, U>(x: T, y: U)` | 多个泛型参数 |
| **约束泛型** | `function f<T extends { id: number }>` | 类型约束 |
| **默认类型** | `function f<T = string>(x: T)` | 默认泛型值 |
| **接口泛型** | `interface I<T> { data: T }` | 泛型接口 |
| **类泛型** | `class C<T> { value: T }` | 泛型类 |
| **类型别名泛型** | `type R<T> = { result: T }` | 泛型类型别名 |
| **泛型推断** | `const arr = [1, 2]; f(arr)` | 自动推断 `T=number` |
| **显式指定** | `f<string>("abc")` | 手动指定泛型参数 |
| **泛型工具** | `function f<T>(arr: T[]): T` | 数组元素类型推断 |

---

## 5. 工具类型速查表

| 工具类型 | 语法 | 效果 | 示例 |
|:---:|:---|:---|:---|
| `Partial<T>` | `{ [P in keyof T]?: T[P] }` | 所有属性可选 | `Partial<{a:1}>` → `{a?:1}` |
| `Required<T>` | `{ [P in keyof T]-?: T[P] }` | 所有属性必选 | `-?` 移除可选 |
| `Readonly<T>` | `{ readonly [P in keyof T]: T[P] }` | 所有属性只读 | 不可重新赋值 |
| `Pick<T,K>` | `{ [P in K]: T[P] }` | 选取部分属性 | `Pick<A,'a'\|'b'>` |
| `Omit<T,K>` | `Pick<T, Exclude<keyof T, K>>` | 排除部分属性 | `Omit<A,'a'>` |
| `Record<K,T>` | `{ [P in K]: T }` | 构造记录类型 | `Record<string, number>` |
| `Exclude<T,U>` | `T extends U ? never : T` | 从T排除U类型 | `Exclude<A\|B, A>` → `B` |
| `Extract<T,U>` | `T extends U ? T : never` | 提取T中属于U的类型 | `Extract<A\|B, A\|C>` → `A` |
| `NonNullable<T>` | `Exclude<T, null \| undefined>` | 排除null/undefined | 只保留有效类型 |
| `Parameters<T>` | 获取函数参数类型 | 元组形式 | `Parameters<(a:string)=>void>` |
| `ReturnType<T>` | 获取函数返回值类型 | 提取return类型 | `ReturnType<()=>string>` |
| `InstanceType<T>` | 获取构造函数的实例类型 | 类实例类型 | `InstanceType<typeof C>` |
| `ThisParameterType<T>` | 获取this参数类型 | 提取this类型 | - |
| `OmitThisParameter<T>` | 移除this参数 | 净化函数类型 | - |
| `ThisType<T>` | 指定上下文this类型 | 对象方法中的this | 需配合noImplicitThis |

---

## 6. 类型推断规则速查表

| 场景 | 推断规则 | 示例 |
|:---:|:---|:---|
| **变量初始化** | 从初始值推断 | `let x = 1` → `number` |
| **数组字面量** | 元素类型的联合 | `[1, "a"]` → `(number\|string)[]` |
| **函数返回** | 从return语句推断 | `() => 1` → `() => number` |
| **上下文类型** | 从上下文推断 | 回调函数参数类型 |
| **最佳公共类型** | 找出所有类型的共同父类型 | `[Dog, Cat]` → `Animal` |
| **结构性推断** | 根据对象结构推断 | `{name:"a"}` → `{name:string}` |
| **泛型推断** | 从实参推断类型参数 | `f([1])` → `T=number` |
| **默认推断** | 无约束时推断为 `{}` | 空对象类型 |
| **const断言** | 最精确字面量类型 | `as const` → 只读字面量 |
| **条件推断** | `infer` 关键字提取类型 | `T extends infer R ? R : never` |

---

## 7. 类型保护方法速查表

| 方法 | 语法 | 作用范围 |
|:---:|:---|:---|
| `typeof` | `typeof x === "string"` | 基础类型判断 |
| `instanceof` | `x instanceof Class` | 类实例判断 |
| `in` | `"prop" in x` | 属性存在判断 |
| **自定义守卫** | `function isA(x): x is A` | 自定义类型谓词 |
| **等值判断** | `x === "value"` | 字面量类型收窄 |
| **`Array.isArray`** | `Array.isArray(x)` | 数组类型判断 |
| **`switch`/`if-else`** | 穷尽检查 | 联合类型收窄 |
| **`never`检查** | `const check: never = x` | 穷尽类型检查 |
| **可选链** | `x?.prop` | 存在性检查+访问 |
| **空值合并** | `x ?? default` | null/undefined默认值 |

---

## 8. 装饰器速查表

| 装饰器类型 | 语法 | 参数说明 |
|:---:|:---|:---|
| **类装饰器** | `@decorator class C {}` | `(target: typeof C) => void` |
| **方法装饰器** | `@decorator method() {}` | `(target, key, descriptor) => void` |
| **属性装饰器** | `@decorator prop: type` | `(target, key) => void` |
| **访问器装饰器** | `@decorator get x() {}` | `(target, key, descriptor) => void` |
| **参数装饰器** | `method(@decorator arg) {}` | `(target, key, index) => void` |
| **装饰器工厂** | `@decorator(args)` | 返回装饰器函数的函数 |
| **元数据键** | `Reflect.metadata(key, value)` | `design:type/params/returntype` |
| **启用配置** | `tsconfig.json` | `"experimentalDecorators": true` |
| **元数据配置** | `tsconfig.json` | `"emitDecoratorMetadata": true` |

### 装饰器执行顺序

| 顺序 | 装饰器类型 | 说明 |
|:---:|:---|:---|
| 1 | 参数装饰器 | 从左到右，从下到上 |
| 2 | 方法/访问器装饰器 | 从下到上 |
| 3 | 属性装饰器 | 从下到上 |
| 4 | 类装饰器 | 从下到上 |

---

## 9. 条件类型常用模式

| 模式 | 语法 | 用途 |
|:---:|:---|:---|
| **基础条件** | `T extends U ? X : Y` | 类型选择 |
| **类型提取** | `T extends (infer R)[] ? R : never` | 提取数组元素类型 |
| **类型提取(函数)** | `T extends (...args: any[]) => infer R ? R : never` | 提取返回值 |
| **类型提取(参数)** | `T extends (arg: infer P) => any ? P : never` | 提取参数类型 |
| **递归条件** | `type Deep<T> = T extends object ? { [K in keyof T]: Deep<T[K]> } : T` | 深度处理 |
| **分发条件** | `T extends U ? X : Y` (T是泛型) | 联合类型分发 |
| **非分发条件** | `[T] extends [U] ? X : Y` | 禁用分发行为 |
| **类型过滤** | `T extends U ? never : T` | 排除特定类型 |
| **类型映射** | `T extends U ? X : Y` | 类型转换映射 |
| **类型约束** | `T extends U ? T : never` | 约束类型范围 |

---

## 10. 映射类型模板

| 模板 | 语法 | 效果 |
|:---:|:---|:---|
| **全可选** | `{ [K in keyof T]?: T[K] }` | `Partial<T>` |
| **全只读** | `{ readonly [K in keyof T]: T[K] }` | `Readonly<T>` |
| **全必选** | `{ [K in keyof T]-?: T[K] }` | `Required<T>` |
| **移除只读** | `{ -readonly [K in keyof T]: T[K] }` | 可变版本 |
| **重命名键** | `{ [K in keyof T as NewKey]: T[K] }` | 键名转换 (TS4.1+) |
| **过滤键** | `{ [K in keyof T as K extends U ? K : never]: T[K] }` | 选择特定键 |
| **Getter模板** | `{ [K in keyof T as`get${Capitalize<string & K>}`]: () => T[K] }` | 生成getter方法名 |
| **值转换** | `{ [K in keyof T]: Transform<T[K]> }` | 递归转换值类型 |
| **只读递归** | `{ [K in keyof T]: T[K] extends object ? ReadonlyDeep<T[K]> : T[K] }` | 深度只读 |
| **Promise包装** | `{ [K in keyof T]: Promise<T[K]> }` | 所有属性Promise化 |

---

## 附录：快速参考代码片段

```typescript
// 常用类型工具
 type Nullable<T> = T | null;
 type Optional<T> = T | undefined;
 type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };
 type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };
 type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];
 type PickByType<T, U> = Pick<T, KeysOfType<T, U>>;
 type Mutable<T> = { -readonly [P in keyof T]: T[P] };

// 类型守卫函数模板
 function isOfType<T>(target: unknown, prop: keyof T): target is T {
   return (target as T)[prop] !== undefined;
 }

// 安全的对象访问
 function hasOwnProperty<X extends {}, Y extends PropertyKey>
   (obj: X, prop: Y): obj is X & Record<Y, unknown> {
   return obj.hasOwnProperty(prop);
 }
```

---

*最后更新：2026-04-08 | TypeScript 5.x 适用*
