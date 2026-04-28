# Milestone 4: Conditional Types —— 条件类型与映射类型

## 理论基础

### 条件类型的语义

条件类型是类型层面的**三元运算符**：

```
T extends U ? X : Y
```

**求值规则**：
1. 若 `T` 是已知类型（非泛型参数），检查 `T <: U`：
   - 成立 → 结果为 `X`
   - 不成立 → 结果为 `Y`
2. 若 `T` 是未绑定的泛型参数，类型保持**延迟求值（deferred）**

**分布式条件类型（Distributive Conditional Types）**

当 `T` 是泛型参数且条件类型位于裸类型参数上时，条件类型自动分发：

```
T extends U ? X : Y   (其中 T = A | B)
→ (A extends U ? X : Y) | (B extends U ? X : Y)
```

本实现支持基础的分发语义。

### infer 关键字

`infer` 在条件类型的 `extends` 子句中引入**类型变量绑定**：

```
T extends Array<infer U> ? U : never
```

语义：尝试将 `T` 与模式 `Array<...>` 进行**结构匹配**，提取内部类型。

这与 Prolog/Ml 中的模式匹配类似：
- `Array<number>` 匹配 `Array<infer U>` → `U = number`
- `string` 不匹配 `Array<infer U>` → 条件为假 → `never`

### 映射类型

```
{ [K in keyof T]: X }
```

语义：遍历 `T` 的所有属性键 `K`，为每个键创建新属性，类型为 `X`（可引用 `K`）。

本实现支持：
- `Readonly<T>`: 所有属性变为只读（值层面标记）
- `Partial<T>`: 所有属性变为可选
- `Record<K, V>`: 从键联合创建对象类型

## 关键代码 Walkthrough

### `conditionalTypes.ts`

`TypeEvaluator` 是核心类，实现类型层面的求值：

- `evaluateConditional(check, extends, trueBranch, falseBranch)`:
  1. 若 check 是 union，分发求值
  2. 否则检查 `isSubtype(check, extends)`
  3. 若 extends 包含 infer 模式，先进行模式匹配提取绑定
  4. 返回对应分支

- `matchPattern(type, pattern)`:
  实现 `infer` 的模式匹配。例如 `Array<number>` 与 `Array<infer U>` 匹配成功，返回 `{ U: number }`。

- `evaluateMappedType(source, mapper)`:
  遍历 source 的属性，应用映射函数。

- 内置工具类型：
  - `exclude(union, excluded)`
  - `extract(union, extracted)`
  - `returnType(func)`
  - `parameters(func)`
  - `awaited(promiseLike)`

## 运行测试

```bash
pnpm test examples/advanced-compiler-workshop/milestone-04-conditional-types
```

## 延伸阅读

- TypeScript Handbook: [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- TypeScript Handbook: [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- `jsts-code-lab/40-type-theory-formal/THEORY.md` §4.2 —— TypeScript 推断的关键差异
