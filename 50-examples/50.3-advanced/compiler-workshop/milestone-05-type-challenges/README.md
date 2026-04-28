# Milestone 5: Type Challenges —— 类型体操工坊

## 概述

本里程碑包含 **12 道渐进式类型体操题目**，从简单到地狱难度，覆盖 TypeScript 类型系统的核心技巧。

每道题包含：

- `challenges/XX-name.ts` —— 题目描述 + 起始代码 + 测试用例
- `solutions/XX-name.ts` —— 参考答案与解析

## 题目列表

| # | 题目 | 难度 | 核心技巧 |
|---|------|------|---------|
| 01 | Hello World | 🟢 | 泛型参数基础 |
| 02 | Deep Readonly | 🟢 | 递归映射类型 |
| 03 | Tuple to Union | 🟢 | 索引访问类型 |
| 04 | Chainable Options | 🟡 | 可变参数泛型、方法链 |
| 05 | Tuple Filter | 🟡 | 条件类型 + infer |
| 06 | Lookup | 🟡 | keyof 基础、索引访问 |
| 07 | Append to Object | 🟡 | 映射类型扩展 |
| 08 | Absolute | 🔴 | 模板字面量类型 |
| 09 | String Join | 🔴 | 递归类型、模板字面量 |
| 10 | Currying | 🔴 | 函数类型变换、递归 |
| 11 | Type Lookup in Union | 🔴 | 分布式条件类型 |
| 12 | JSON Parser Type | ⚫ | 极限类型级解析器 |

## 如何做题

1. 打开 `challenges/XX-name.ts`
2. 阅读题目描述和示例
3. 在 `// 你的代码 here` 处实现类型
4. 运行测试验证：

   ```bash
   pnpm test examples/advanced-compiler-workshop/milestone-05-type-challenges
   ```

5. 查看 `solutions/XX-name.ts` 参考答案

## 类型测试说明

本里程碑使用 **编译时类型检查** 作为测试手段。测试文件使用 `expectTypeOf`（Vitest 内置）和自定义 `AssertEqual` 工具验证类型正确性。

如果类型实现错误，TypeScript 编译将失败，测试无法通过。

## 与前面里程碑的关系

| Milestone | 层面 | 内容 |
|-----------|------|------|
| M1-M4 | 值层面 | 手写类型检查器（运行时操作类型对象） |
| M5 | 类型层面 | 使用 TypeScript 类型系统解决纯类型问题 |

M5 的每一题都可以看作是在**类型层面**模拟 M1-M4 中实现的算法：

- Deep Readonly ≈ M4 的 mapped type evaluator
- Tuple Filter ≈ M4 的 conditional type + infer
- JSON Parser Type ≈ M1 的 parser，但完全在类型层面实现

## 延伸阅读

- [type-challenges](https://github.com/type-challenges/type-challenges) —— 本里程碑的灵感来源
- `jsts-code-lab/78-metaprogramming/` —— TypeScript 元编程与模板字面量类型
- TypeScript Handbook: [Type Manipulation](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
