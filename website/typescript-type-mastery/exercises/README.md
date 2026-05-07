# TypeScript 类型体操练习场

本目录包含 60+ 道类型体操练习题，按难度分级，覆盖 TypeScript 类型系统的核心能力。

## 难度分级

| 难度 | 数量 | 目录 | 核心能力 |
|------|------|------|----------|
| ⭐ Easy | 20 | [`easy/`](./easy/) | 泛型基础、映射类型、条件类型、类型推断 |
| ⭐⭐ Medium | 15 | [`medium/`](./medium/) | 递归类型、模板字面量、键重映射 |
| ⭐⭐⭐ Hard | 15 | [`hard/`](./hard/) | 分布式条件类型、逆变/协变、类型编程 |
| ⭐⭐⭐⭐ Extreme | 10 | [`extreme/`](./extreme/) | 编译器级别挑战、JSON Parser、完整类型系统 |

## Easy 题目列表 (20 道)

| # | 题目 | 能力点 |
|---|------|--------|
| 01 | [Pick](./easy/01-pick.ts) | 映射类型 |
| 02 | [Readonly](./easy/02-readonly.ts) | 只读映射 |
| 03 | [Tuple to Object](./easy/03-tuple-to-object.ts) | 索引访问 |
| 04 | [First of Array](./easy/04-first-of-array.ts) | 条件类型 + 推断 |
| 05 | [Length of Tuple](./easy/05-length-of-tuple.ts) | 元组属性访问 |
| 06 | [Exclude](./easy/06-exclude.ts) | 分布式条件类型 |
| 07 | [Awaited](./easy/07-awaited.ts) | 递归条件类型 + infer |
| 08 | [If](./easy/08-if.ts) | 泛型约束 + 条件 |
| 09 | [Concat](./easy/09-concat.ts) | 展开运算符 |
| 10 | [Includes](./easy/10-includes.ts) | 递归 + 类型相等判断 |
| 11 | [Push](./easy/11-push.ts) | 展开运算符 |
| 12 | [Unshift](./easy/12-unshift.ts) | 展开运算符 |
| 13 | [Parameters](./easy/13-parameters.ts) | infer + 函数类型 |
| 14 | [ReturnType](./easy/14-return-type.ts) | infer + 函数类型 |
| 15 | [Omit](./easy/15-omit.ts) | Pick + Exclude 组合 |
| 16 | [Tuple to Union](./easy/16-tuple-to-union.ts) | 索引访问 |
| 17 | [Last of Array](./easy/17-last-of-array.ts) | infer + rest 模式 |
| 18 | [PromiseAll](./easy/18-promise-all.ts) | 泛型函数声明 |
| 19 | [Type Lookup](./easy/19-type-lookup.ts) | 条件类型 + 属性匹配 |
| 20 | [String to Union](./easy/20-string-to-union.ts) | 模板字面量递归 |

## 如何练习

```bash
# 1. 安装 TypeScript
npm install -g typescript

# 2. 运行测试
cd easy
npx tsc --noEmit 01-pick.ts

# 3. 对比参考答案后，尝试不看答案重新实现
```

## 参考资源

- [type-challenges 官方仓库](https://github.com/type-challenges/type-challenges)
- [TypeScript 类型系统深度专题](../)
