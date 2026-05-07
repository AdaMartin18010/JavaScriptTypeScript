# TypeScript 类型体操练习场

本目录包含 60+ 道类型体操练习题，按难度分级，覆盖 TypeScript 类型系统的核心能力。

## 难度分级

| 难度 | 数量 | 目录 | 核心能力 |
|------|------|------|----------|
| ⭐ Easy | 20 | [`easy/`](./easy/) | 泛型基础、映射类型、条件类型、类型推断 |
| ⭐⭐ Medium | 15 | [`medium/`](./medium/) | 递归类型、模板字面量、元组操作、对象变换 |
| ⭐⭐⭐ Hard | 15 | [`hard/`](./hard/) | 分布式条件类型、类型谓词、深层对象操作 |
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

## Medium 题目列表 (15 道)

| # | 题目 | 能力点 |
|---|------|--------|
| 01 | [Deep Readonly](./medium/01-deep-readonly.ts) | 递归映射类型 |
| 02 | [Tuple to Nested Object](./medium/02-tuple-to-nested-object.ts) | 元组递归 |
| 03 | [Reverse](./medium/03-reverse.ts) | 元组递归 |
| 04 | [Flatten](./medium/04-flatten.ts) | 递归条件类型 |
| 05 | [Append to Object](./medium/05-append-to-object.ts) | 键操作 |
| 06 | [Absolute](./medium/06-absolute.ts) | 模板字面量 + infer |
| 07 | [String to Number](./medium/07-string-to-number.ts) | 递归计数 |
| 08 | [Object Entries](./medium/08-object-entries.ts) | 联合类型分发 |
| 09 | [Shift](./medium/09-shift.ts) | 元组模式匹配 |
| 10 | [Percentage Parser](./medium/10-percentage-parser.ts) | 模板字面量模式 |
| 11 | [Drop Char](./medium/11-drop-char.ts) | 字符串递归 |
| 12 | [Omit By Type](./medium/12-omit-by-type.ts) | 键重映射 |
| 13 | [Starts With](./medium/13-starts-with.ts) | 模板字面量推断 |
| 14 | [Ends With](./medium/14-ends-with.ts) | 模板字面量推断 |
| 15 | [Partial By Keys](./medium/15-partial-by-keys.ts) | 对象变换 |

## Hard 题目列表 (15 道)

| # | 题目 | 能力点 |
|---|------|--------|
| 01 | [Union to Intersection](./hard/01-union-to-intersection.ts) | 逆变位置推断 |
| 02 | [Is Any](./hard/02-is-any.ts) | 类型系统边界 |
| 03 | [Is Never](./hard/03-is-never.ts) | never 类型判定 |
| 04 | [Is Union](./hard/04-is-union.ts) | 分布式条件类型陷阱 |
| 05 | [Replace Keys](./hard/05-replace-keys.ts) | 联合类型分发映射 |
| 06 | [Remove Index Signature](./hard/06-remove-index-signature.ts) | 键过滤 |
| 07 | [Mutable](./hard/07-mutable.ts) | 只读修饰符移除 |
| 08 | [Required By Keys](./hard/08-required-by-keys.ts) | 可选修饰符控制 |
| 09 | [Merge](./hard/09-merge.ts) | 对象合并 |
| 10 | [Camel Case](./hard/10-camel-case.ts) | 字符串递归变换 |
| 11 | [Deep Pick](./hard/11-deep-pick.ts) | 路径解析 |
| 12 | [Get](./hard/12-get.ts) | 路径类型访问 |
| 13 | [Omit Index Signature](./hard/13-omit-index-signature.ts) | 索引签名检测 |
| 14 | [Pick By Type](./hard/14-pick-by-type.ts) | 值类型过滤 |
| 15 | [Flatten Object](./hard/15-flatten-object-type.ts) | 对象扁平化 |

## Extreme 题目列表 (10 道)

| # | 题目 | 能力点 |
|---|------|--------|
| 01 | [JSON Parser](./extreme/01-json-parser.ts) | 完整类型级解析器 |

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
