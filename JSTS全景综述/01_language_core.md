---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# JavaScript/TypeScript 语言核心特性全览

> 版本范围：ES2020–ES2025 正式版 (ES11–ES16) + ES2026 Stage 4 前瞻 + TypeScript 5.8–6.0（含 7.0 前瞻）
> 最后更新：2026年4月

> 🧠 **深度专题**：如需按知识领域深入理解语言机制，请参阅 [jsts-language-core-system](../jsts-language-core-system/) — 52 篇深度文档（>5000 字节/篇），覆盖类型系统、变量系统、控制流、执行模型、执行流与 ECMAScript 规范基础。

---

## 目录

- [JavaScript/TypeScript 语言核心特性全览](#javascripttypescript-语言核心特性全览)
  - [目录](#目录)
  - [1. JavaScript 演进概览](#1-javascript-演进概览)
    - [1.1 ECMAScript 版本时间线](#11-ecmascript-版本时间线)
    - [1.2 特性分类矩阵](#12-特性分类矩阵)
  - [2. ES2020 特性详解](#2-es2020-特性详解)
    - [2.1 BigInt - 任意精度整数](#21-bigint---任意精度整数)
      - [概念定义（形式化）](#概念定义形式化)
      - [语法形式（BNF风格）](#语法形式bnf风格)
      - [属性特征](#属性特征)
      - [使用示例](#使用示例)
      - [反例/常见错误](#反例常见错误)
      - [与其他特性的关系](#与其他特性的关系)
    - [2.2 Promise.allSettled - 等待所有Promise完成](#22-promiseallsettled---等待所有promise完成)
      - [概念定义（形式化）](#概念定义形式化-1)
      - [语法形式（BNF风格）](#语法形式bnf风格-1)
      - [属性特征](#属性特征-1)
      - [使用示例](#使用示例-1)
      - [反例/常见错误](#反例常见错误-1)
      - [与其他特性的关系](#与其他特性的关系-1)
    - [2.3 globalThis - 统一的全局对象](#23-globalthis---统一的全局对象)
      - [概念定义（形式化）](#概念定义形式化-2)
      - [语法形式（BNF风格）](#语法形式bnf风格-2)
      - [属性特征](#属性特征-2)
      - [使用示例](#使用示例-2)
      - [反例/常见错误](#反例常见错误-2)
    - [2.4 可选链操作符 Optional Chaining (?.)](#24-可选链操作符-optional-chaining-)
      - [概念定义（形式化）](#概念定义形式化-3)
      - [语法形式（BNF风格）](#语法形式bnf风格-3)
      - [属性特征](#属性特征-3)
      - [使用示例](#使用示例-3)
      - [反例/常见错误](#反例常见错误-3)
    - [2.5 空值合并运算符 Nullish Coalescing (??)](#25-空值合并运算符-nullish-coalescing-)
      - [概念定义（形式化）](#概念定义形式化-4)
      - [属性特征](#属性特征-4)
      - [使用示例](#使用示例-4)
      - [反例/常见错误](#反例常见错误-4)
    - [2.6 动态 import()](#26-动态-import)
      - [概念定义（形式化）](#概念定义形式化-5)
      - [语法形式（BNF风格）](#语法形式bnf风格-4)
      - [属性特征](#属性特征-5)
      - [使用示例](#使用示例-5)
      - [反例/常见错误](#反例常见错误-5)
  - [3. ES2021 特性详解](#3-es2021-特性详解)
    - [3.1 Promise.any - 第一个成功的Promise](#31-promiseany---第一个成功的promise)
      - [概念定义（形式化）](#概念定义形式化-6)
      - [属性特征](#属性特征-6)
      - [使用示例](#使用示例-6)
      - [反例/常见错误](#反例常见错误-6)
    - [3.2 逻辑赋值运算符](#32-逻辑赋值运算符)
      - [概念定义（形式化）](#概念定义形式化-7)
      - [属性特征](#属性特征-7)
      - [使用示例](#使用示例-7)
      - [反例/常见错误](#反例常见错误-7)
    - [3.3 数字分隔符](#33-数字分隔符)
      - [概念定义（形式化）](#概念定义形式化-8)
      - [使用示例](#使用示例-8)
      - [反例/常见错误](#反例常见错误-8)
    - [3.4 WeakRef 与 FinalizationRegistry](#34-weakref-与-finalizationregistry)
      - [概念定义（形式化）](#概念定义形式化-9)
      - [属性特征](#属性特征-8)
      - [使用示例](#使用示例-9)
      - [反例/常见错误](#反例常见错误-9)
    - [3.5 String.prototype.replaceAll](#35-stringprototypereplaceall)
      - [概念定义（形式化）](#概念定义形式化-10)
      - [使用示例](#使用示例-10)
  - [4. ES2022 特性详解](#4-es2022-特性详解)
    - [4.1 Class 私有字段和方法](#41-class-私有字段和方法)
      - [概念定义（形式化）](#概念定义形式化-11)
      - [语法形式（BNF风格）](#语法形式bnf风格-5)
      - [属性特征](#属性特征-9)
      - [使用示例](#使用示例-11)
      - [反例/常见错误](#反例常见错误-10)
      - [与其他特性的关系](#与其他特性的关系-2)
    - [4.2 Class 静态块 (Static Block)](#42-class-静态块-static-block)
      - [概念定义（形式化）](#概念定义形式化-12)
      - [使用示例](#使用示例-12)
    - [4.3 at() 方法](#43-at-方法)
      - [概念定义（形式化）](#概念定义形式化-13)
      - [使用示例](#使用示例-13)
      - [反例/常见错误](#反例常见错误-11)
    - [4.4 Object.hasOwn()](#44-objecthasown)
      - [概念定义（形式化）](#概念定义形式化-14)
      - [使用示例](#使用示例-14)
    - [4.5 Error Cause](#45-error-cause)
      - [概念定义（形式化）](#概念定义形式化-15)
      - [使用示例](#使用示例-15)
  - [5. ES2023 特性详解](#5-es2023-特性详解)
    - [5.1 不可变数组方法](#51-不可变数组方法)
      - [概念定义（形式化）](#概念定义形式化-16)
      - [使用示例](#使用示例-16)
      - [反例/常见错误](#反例常见错误-12)
    - [5.2 findLast / findLastIndex](#52-findlast--findlastindex)
      - [概念定义（形式化）](#概念定义形式化-17)
      - [使用示例](#使用示例-17)
    - [5.3 Hashbang 支持](#53-hashbang-支持)
      - [概念定义（形式化）](#概念定义形式化-18)
      - [使用示例](#使用示例-18)
  - [6. ES2024 特性详解](#6-es2024-特性详解)
    - [6.1 Object.groupBy / Map.groupBy](#61-objectgroupby--mapgroupby)
      - [概念定义（形式化）](#概念定义形式化-19)
      - [使用示例](#使用示例-19)
    - [6.2 Promise.withResolvers](#62-promisewithresolvers)
      - [概念定义（形式化）](#概念定义形式化-20)
      - [使用示例](#使用示例-20)
    - [6.3 String isWellFormed / toWellFormed](#63-string-iswellformed--towellformed)
      - [概念定义（形式化）](#概念定义形式化-21)
      - [使用示例](#使用示例-21)
    - [6.4 RegExp `v` flag（unicodeSets）](#64-regexp-v-flagunicodesets)
      - [概念定义（形式化）](#概念定义形式化-22)
      - [使用示例](#使用示例-22)
  - [7. ES2025 特性详解](#7-es2025-特性详解)
    - [7.1 Atomics.pause](#71-atomicspause)
      - [概念定义（形式化）](#概念定义形式化-23)
      - [使用示例](#使用示例-23)
    - [7.2 Iterator 辅助方法](#72-iterator-辅助方法)
      - [概念定义（形式化）](#概念定义形式化-24)
      - [使用示例](#使用示例-24)
    - [7.3 Set 数学方法](#73-set-数学方法)
      - [概念定义（形式化）](#概念定义形式化-25)
      - [使用示例](#使用示例-25)
    - [7.4 RegExp 增强（ES2025）](#74-regexp-增强es2025)
      - [概念定义（形式化）](#概念定义形式化-26)
      - [使用示例](#使用示例-26)
    - [7.5 Promise.try](#75-promisetry)
      - [概念定义（形式化）](#概念定义形式化-27)
      - [使用示例](#使用示例-27)
    - [7.6 Import Attributes（JSON 模块）](#76-import-attributesjson-模块)
      - [概念定义（形式化）](#概念定义形式化-28)
      - [使用示例](#使用示例-28)
    - [7.7 Float16Array](#77-float16array)
      - [概念定义（形式化）](#概念定义形式化-29)
      - [使用示例](#使用示例-29)
  - [8. TypeScript 5.x 核心特性](#8-typescript-5x-核心特性)
    - [8.1 装饰器元数据 (Decorator Metadata)](#81-装饰器元数据-decorator-metadata)
      - [概念定义（形式化）](#概念定义形式化-30)
      - [使用示例](#使用示例-30)
    - [8.2 const 类型参数](#82-const-类型参数)
      - [概念定义（形式化）](#概念定义形式化-31)
      - [使用示例](#使用示例-31)
    - [8.3 NoInfer](#83-noinfer)
      - [概念定义（形式化）](#概念定义形式化-32)
      - [使用示例](#使用示例-32)
    - [8.4 satisfies 运算符](#84-satisfies-运算符)
      - [概念定义（形式化）](#概念定义形式化-33)
      - [使用示例](#使用示例-33)
    - [8.5 using 声明与显式资源管理](#85-using-声明与显式资源管理)
      - [概念定义（形式化）](#概念定义形式化-34)
      - [使用示例](#使用示例-34)
    - [8.6 模块解析与类型剥离](#86-模块解析与类型剥离)
      - [概念定义（形式化）](#概念定义形式化-35)
      - [配置示例](#配置示例)
    - [8.7 TypeScript 6.x 核心特性](#87-typescript-6x-核心特性)
      - [8.7.1 `es2025` target/lib 的语义](#871-es2025-targetlib-的语义)
      - [8.7.2 Temporal API 类型：与 `Date` 的本质差异](#872-temporal-api-类型与-date-的本质差异)
      - [8.7.3 `#/` subpath imports：package.json `imports` 字段的解析语义](#873--subpath-importspackagejson-imports-字段的解析语义)
      - [8.7.4 `import defer`：延迟求值的精确语义与工程场景](#874-import-defer延迟求值的精确语义与工程场景)
      - [8.7.5 方法推断改进：`this`-less functions 不再无条件被视为上下文敏感](#875-方法推断改进this-less-functions-不再无条件被视为上下文敏感)
      - [使用示例](#使用示例-35)
    - [8.8 TypeScript 7.0 前瞻：Go 重写与 LSP 迁移](#88-typescript-70-前瞻go-重写与-lsp-迁移)
      - [为什么从 JavaScript 迁移到 Go？](#为什么从-javascript-迁移到-go)
      - [对生态的影响](#对生态的影响)
      - [为 TypeScript 7.0 做准备的建议](#为-typescript-70-做准备的建议)
  - [9. 类型系统深度解析](#9-类型系统深度解析)
    - [9.1 基础类型系统](#91-基础类型系统)
      - [9.1.1 原始类型](#911-原始类型)
      - [9.1.2 对象类型](#912-对象类型)
    - [9.2 联合类型与交叉类型](#92-联合类型与交叉类型)
      - [9.2.1 联合类型 (Union Types)](#921-联合类型-union-types)
      - [9.2.2 交叉类型 (Intersection Types)](#922-交叉类型-intersection-types)
    - [9.3 条件类型](#93-条件类型)
      - [9.3.1 基本条件类型](#931-基本条件类型)
      - [9.3.2 内置条件类型](#932-内置条件类型)
    - [9.4 映射类型](#94-映射类型)
      - [9.4.1 基本映射类型](#941-基本映射类型)
      - [9.4.2 高级映射模式](#942-高级映射模式)
    - [9.5 模板字面量类型](#95-模板字面量类型)
      - [9.5.1 基本模板字面量类型](#951-基本模板字面量类型)
      - [9.5.2 高级模板字面量模式](#952-高级模板字面量模式)
    - [9.6 类型推断与类型守卫](#96-类型推断与类型守卫)
      - [9.6.1 类型推断](#961-类型推断)
      - [9.6.2 类型守卫](#962-类型守卫)
    - [9.7 类型谓词与类型断言](#97-类型谓词与类型断言)
      - [9.7.1 类型谓词详解](#971-类型谓词详解)
      - [9.7.2 类型断言](#972-类型断言)
    - [9.8 逆变、协变、双变与不变](#98-逆变协变双变与不变)
      - [9.8.1 类型系统变型理论](#981-类型系统变型理论)
      - [9.8.2 变型在实际代码中的影响](#982-变型在实际代码中的影响)
  - [10. 形式化类型理论](#10-形式化类型理论)
    - [10.1 类型系统的形式化定义](#101-类型系统的形式化定义)
      - [10.1.1 类型判断规则](#1011-类型判断规则)
      - [10.1.2 TypeScript 类型关系的形式化](#1012-typescript-类型关系的形式化)
    - [10.2 类型推断的形式化](#102-类型推断的形式化)
      - [10.2.1 基于约束求解的类型推断](#1021-基于约束求解的类型推断)
      - [10.2.2 与 Hindley-Milner 的核心区别](#1022-与-hindley-milner-的核心区别)
    - [10.3 条件类型的形式化](#103-条件类型的形式化)
      - [10.3.1 条件类型求值规则](#1031-条件类型求值规则)
      - [10.3.2 条件类型推导示例](#1032-条件类型推导示例)
    - [10.4 类型系统可靠性分析](#104-类型系统可靠性分析)
      - [10.4.1 类型安全边界](#1041-类型安全边界)
      - [10.4.2 类型系统限制](#1042-类型系统限制)
  - [附录](#附录)
    - [A. 类型速查表](#a-类型速查表)
    - [B. ES 版本特性对照表](#b-es-版本特性对照表)

---

## 1. JavaScript 演进概览

### 1.1 ECMAScript 版本时间线

```
ES2015 (ES6)    → 2015年6月  → let/const, 箭头函数, Class, Module, Promise
ES2016 (ES7)    → 2016年6月  → 指数运算符**, Array.prototype.includes
ES2017 (ES8)    → 2017年6月  → async/await, Object.entries/values
ES2018 (ES9)    → 2018年6月  → 展开运算符..., Promise.finally
ES2019 (ES10)   → 2019年6月  → Object.fromEntries, Array.flat/flatMap
ES2020 (ES11)   → 2020年6月  → BigInt, 可选链, 空值合并
ES2021 (ES12)   → 2021年6月  → Promise.any, 数字分隔符
ES2022 (ES13)   → 2022年6月  → Class私有字段, at(), Object.hasOwn
ES2023 (ES14)   → 2023年6月  → 不可变数组方法, findLast
ES2024 (ES15)   → 2024年6月  → Array分组, Promise.withResolvers, RegExp v flag
ES2025 (ES16)   → 2025年6月  → Iterator辅助方法, Set数学方法, Float16Array, Explicit Resource Management, Promise.try, RegExp.escape, Import Attributes, Array.fromAsync, Math.sumPrecise
ES2026 (ES17)   → 2026年6月（预计）→ Temporal API, Error.isError, Atomics.pause, import defer, Decorators, Joint Iteration, Source Phase Imports 等（Stage 3/4）
```

*来源：ECMA-262 16th Edition, June 2025; TC39 Temporal Proposal Stage 4; TC39 import defer Proposal Stage 3*

### 1.2 特性分类矩阵

| 类别 | ES2020 | ES2021 | ES2022 | ES2023 | ES2024 | ES2025 | ES2026(Stage 3/4) |
|------|--------|--------|--------|--------|--------|--------|-------------------|
| 数据类型 | BigInt | - | - | - | - | Float16Array | Temporal API |
| 异步编程 | allSettled | any, WeakRef | - | - | withResolvers | Promise.try | - |
| 数组/迭代器操作 | - | - | at() | toSorted等 | groupBy | Iterator helpers | Joint Iteration |
| 集合操作 | - | - | - | - | - | Set 数学方法 | - |
| 对象操作 | globalThis | - | hasOwn() | - | groupBy | - | - |
| 类相关 | - | - | 私有字段 | - | - | - | Decorators |
| 字符串 | - | replaceAll | - | - | isWellFormed | RegExp 增强 | - |
| 并发/内存 | - | - | - | - | waitAsync | - | Atomics.pause |
| 模块 | 动态 import | - | - | - | - | Import Attributes | import defer |

---

## 2. ES2020 特性详解

### 2.1 BigInt - 任意精度整数

#### 概念定义（形式化）

**BigInt** 是 JavaScript 的第七种原始数据类型，表示任意精度的整数。

**形式化定义：**

```
BigInt ∈ PrimitiveType
BigInt = { n | n ∈ ℤ }  // 理论上无上限，实现受限于可用内存
```

*注意：此前文档中出现的 `|n| < 2^(2^53 - 1)` 表述在数学上无意义。ECMAScript 规范对 BigInt 的描述是"arbitrary-precision"，即任意精度整数，不存在此类固定上限；唯一的限制来自宿主环境的内存与实现。*
*来源：ECMA-262 §6.1.6.2*

#### 语法形式（BNF风格）

```bnf
BigIntLiteral ::= DecimalIntegerLiteral "n"
                | BinaryIntegerLiteral "n"
                | OctalIntegerLiteral "n"
                | HexIntegerLiteral "n"

DecimalIntegerLiteral ::= "0" | NonZeroDigit DecimalDigits?
BinaryIntegerLiteral ::= "0b" BinaryDigits | "0B" BinaryDigits
OctalIntegerLiteral ::= "0o" OctalDigits | "0O" OctalDigits
HexIntegerLiteral ::= "0x" HexDigits | "0X" HexDigits
```

*来源：ECMA-262 §11.8.3*

#### 属性特征

| 属性 | 值 |
|------|-----|
| 类型 | primitive |
| typeof | `"bigint"` |
| 包装对象 | `BigInt` |
| 可序列化 | JSON.stringify 抛出错误 |
| 运算支持 | +, -, *, /, %, **, &, \|, ^, ~, <<, >> |

#### 使用示例

```javascript
// ===== 基本创建方式 =====

// 1. 字面量语法（推荐）
const big1 = 9007199254740991n;        // Number.MAX_SAFE_INTEGER
const big2 = 0x1fffffffffffffn;        // 十六进制 BigInt
const big3 = 0b11111111111111111111111111111111111111111111111111111n; // 二进制
const big4 = 0o377777777777777777n;    // 八进制

// 2. BigInt 构造函数
const big5 = BigInt(9007199254740991);
const big6 = BigInt("9007199254740991999999999999");
const big7 = BigInt(true);             // 1n

// ===== 基本运算 =====
const a = 123456789012345678901234567890n;
const b = 987654321098765432109876543210n;

console.log(a + b);  // 1111111110111111111011111111100n
console.log(a * b);  // 121932631356500531591068431581771877391399573056100n
console.log(a ** 2n); // 幂运算

// ===== 比较运算 =====
console.log(0n === 0);      // false (类型不同)
console.log(0n == 0);       // true (松散相等)
console.log(0n < 1);        // true (可跨类型比较)

// ===== 与 Number 的转换 =====
const num = Number(123456789012345678901234567890n);
// ⚠️ 可能丢失精度: 1.2345678901234568e+29

const safe = Number(123n);  // 123 (安全转换)
```

#### 反例/常见错误

```javascript
// ❌ 错误1: BigInt 与 Number 混合运算
const wrong = 1n + 2;  // TypeError: Cannot mix BigInt and other types

// ✅ 正确做法：显式转换
const correct = 1n + BigInt(2);  // 3n

// ❌ 错误2: JSON 序列化
JSON.stringify({ value: 10n });
// TypeError: Do not know how to serialize a BigInt

// ✅ 解决方案：自定义 toJSON 或 replacer
const data = {
  value: 10n,
  toJSON() {
    return { value: this.value.toString() };
  }
};
JSON.stringify(data);  // '{"value":"10"}'

// ❌ 错误3: 使用 Math 方法
Math.max(1n, 2n);  // TypeError

// ❌ 错误4: 除零
1n / 0n;  // RangeError: Division by zero

// ❌ 错误5: 小数 BigInt
BigInt(1.5);  // RangeError: The number 1.5 cannot be converted to BigInt
```

#### 与其他特性的关系

```
BigInt ──→ 与 Number 的关系：
    ├── 不兼容算术运算（类型安全）
    ├── 可进行比较运算（值语义）
    └── 转换可能丢失精度

BigInt ──→ 与 Symbol 的关系：
    └── 同为 ES6+ 新增原始类型

BigInt ──→ 与 TypedArray 的关系：
    └── BigInt64Array / BigUint64Array 专门存储
```

---

### 2.2 Promise.allSettled - 等待所有Promise完成

#### 概念定义（形式化）

**Promise.allSettled** 接收一个 Promise 可迭代对象，返回一个在所有给定 Promise 都已敲定（fulfilled 或 rejected）后完成的 Promise。

**形式化定义：**

```
allSettled: Iterable<Promise<T>> → Promise<Array<SettlementResult<T>>>

SettlementResult<T> =
  | { status: "fulfilled", value: T }
  | { status: "rejected", reason: any }
```

*来源：ECMA-262 §27.2.4.3*

#### 语法形式（BNF风格）

```bnf
PromiseAllSettled ::= "Promise.allSettled" "(" Iterable ")"

Iterable ::= Array | Set | Map | Generator | Iterator
```

#### 属性特征

| 属性 | 值 |
|------|-----|
| 返回类型 | `Promise<Array>` |
| 完成条件 | 所有 Promise 都 settled |
| 错误处理 | 永不 reject，所有错误在结果中 |
| 顺序保证 | 结果顺序与输入顺序一致 |
| 空数组 | 立即 resolve 为空数组 |

#### 使用示例

```javascript
// ===== 基本用法 =====
const promises = [
  Promise.resolve('success1'),
  Promise.reject('error1'),
  Promise.resolve('success2'),
  Promise.reject('error2')
];

const results = await Promise.allSettled(promises);
console.log(results);
// [
//   { status: 'fulfilled', value: 'success1' },
//   { status: 'rejected', reason: 'error1' },
//   { status: 'fulfilled', value: 'success2' },
//   { status: 'rejected', reason: 'error2' }
// ]

// ===== 结果分类处理 =====
const fulfilled = results.filter(r => r.status === 'fulfilled').map(r => r.value);
const rejected = results.filter(r => r.status === 'rejected').map(r => r.reason);

// ===== 与 Promise.all 对比 =====
async function compare() {
  const urls = ['/api/a', '/api/b', '/api/c'];

  // Promise.all - 一个失败全部失败
  try {
    const all = await Promise.all(urls.map(fetch));
  } catch (e) {
    // 只要有一个失败就进入这里
  }

  // Promise.allSettled - 获取所有结果
  const settled = await Promise.allSettled(urls.map(fetch));
  const successful = settled
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
}

// ===== 空数组处理 =====
const empty = await Promise.allSettled([]);
console.log(empty);  // []
```

#### 反例/常见错误

```javascript
// ❌ 错误1: 忘记处理两种状态
const results = await Promise.allSettled(promises);
// 假设所有都成功
const values = results.map(r => r.value);  // 可能有 undefined！

// ✅ 正确做法：先过滤
const values = results
  .filter(r => r.status === 'fulfilled')
  .map(r => r.value);

// ❌ 错误2: 传入非 Promise 值
// 实际上没问题，非 Promise 会被包装为 resolved Promise
const mixed = await Promise.allSettled([1, 2, 3]);
// [{status: 'fulfilled', value: 1}, ...]

// ❌ 错误3: 与 Promise.all 混淆使用场景
// 需要原子性操作时用 all，需要容错时用 allSettled
```

#### 与其他特性的关系

```
Promise.allSettled ──→ Promise 组合器对比：
    ├── Promise.all: 全部成功/任一失败
    ├── Promise.race: 第一个 settled
    ├── Promise.any: 第一个 fulfilled
    └── Promise.allSettled: 等待全部 settled

决策矩阵：
┌─────────────────┬─────────────┬─────────────┬─────────────┐
│     场景        │   all()     │   any()     │ allSettled()│
├─────────────────┼─────────────┼─────────────┼─────────────┤
│ 需要所有结果    │     ✓       │     ✗       │     ✓       │
│ 容错处理        │     ✗       │     ✓       │     ✓       │
│ 快速失败        │     ✓       │     ✓       │     ✗       │
│ 知道哪些失败    │     ✗       │     ✗       │     ✓       │
└─────────────────┴─────────────┴─────────────┴─────────────┘
```

---

### 2.3 globalThis - 统一的全局对象

#### 概念定义（形式化）

**globalThis** 是一个标准方式，用于在任何 JavaScript 环境中访问全局对象。

**形式化定义：**

```
globalThis: GlobalObject

GlobalObject =
  | window        (浏览器主线程)
  | self          (Web Worker)
  | global        (Node.js)
  | globalThis    (标准，所有环境)
```

*来源：ECMA-262 §19.1*

#### 语法形式（BNF风格）

```bnf
GlobalThisExpression ::= "globalThis"

GlobalPropertyAccess ::= "globalThis" "." Identifier
                       | "globalThis" "[" Expression "]"
```

#### 属性特征

| 属性 | 值 |
|------|-----|
| 可写性 | 只读（不能被赋值） |
| 可配置性 | false |
| 可枚举性 | false |
| 环境统一 | 所有 JavaScript 环境 |
| 严格模式 | 可用 |

#### 使用示例

```javascript
// ===== 跨环境库编写 =====
// 之前需要条件判断
const globalObject =
  (typeof window !== 'undefined') ? window :
  (typeof global !== 'undefined') ? global :
  (typeof self !== 'undefined') ? self : this;

// 现在统一使用 globalThis
const globalObject = globalThis;

// ===== 全局变量操作 =====
// 设置全局变量（不推荐，但某些场景需要）
globalThis.APP_CONFIG = { version: '1.0.0' };

// 检查全局变量
if (globalThis.fetch) {
  console.log('fetch is available');
}

// ===== Polyfill 注入 =====
if (!globalThis.structuredClone) {
  globalThis.structuredClone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

// ===== 跨 iframe/worker 通信 =====
// 在主线程和 Worker 中使用相同的代码
function getGlobal() {
  return globalThis;
}
// 在两种环境中都能正常工作
```

#### 反例/常见错误

```javascript
// ❌ 错误1: 尝试赋值
globalThis = {};  // TypeError: Assignment to constant variable.

// ❌ 错误2: 与 window 对象混淆
// globalThis 指向全局对象，但不一定是 window
// 在 iframe 中，globalThis 指向 iframe 的全局对象

// ❌ 错误3: 滥用全局命名空间
// 污染全局命名空间是反模式
globalThis.myVar = 'bad practice';  // ❌ 避免这样做

// ✅ 更好的做法：使用模块或命名空间
const MyLib = (function() {
  const privateVar = 'internal';
  return { publicMethod: () => privateVar };
})();
```

---

### 2.4 可选链操作符 Optional Chaining (?.)

#### 概念定义（形式化）

**可选链操作符** `?.` 允许读取位于连接对象链深处的属性值，而不必明确验证链中的每个引用是否有效。

**形式化定义：**

```
OptionalChain ::= Expression "?." Identifier
                | Expression "?." "[" Expression "]"
                | Expression "?." Arguments

语义：如果 Expression 为 null/undefined，则整个表达式短路返回 undefined
```

*来源：ECMA-262 §13.3*

#### 语法形式（BNF风格）

```bnf
OptionalExpression ::= MemberExpression OptionalChain*

OptionalChain ::= "?." IdentifierName
                | "?." "[" Expression "]"
                | "?." Arguments
                | "?." TemplateLiteral

// 组合形式
ShortCircuit ::= Expression "?." Expression
```

#### 属性特征

| 属性 | 值 |
|------|-----|
| 短路特性 | 遇到 null/undefined 立即停止 |
| 返回值 | 成功时值本身，失败时 undefined |
| 调用保护 | 支持方法调用保护 |
| 计算属性 | 支持方括号访问 |
| 组合使用 | 可与空值合并 ?? 配合 |

#### 使用示例

```javascript
// ===== 基本属性访问 =====
const user = {
  profile: {
    name: 'John',
    address: {
      city: 'New York'
    }
  }
};

// 传统写法
const city = user && user.profile && user.profile.address && user.profile.address.city;

// 可选链写法
const city = user?.profile?.address?.city;  // 'New York'

// 处理 null
const empty = null;
console.log(empty?.profile?.name);  // undefined，不报错

// ===== 方法调用保护 =====
const obj = {
  greet: () => 'Hello!'
};

console.log(obj.greet?.());      // 'Hello!'
console.log(obj.unknown?.());    // undefined，不报错

// ===== 计算属性访问 =====
const key = 'name';
console.log(user?.profile?.[key]);  // 'John'

// ===== 数组访问 =====
const arr = [1, 2, { value: 3 }];
console.log(arr?.[2]?.value);    // 3
console.log(arr?.[10]?.value);   // undefined

// ===== 与空值合并配合 =====
const name = user?.profile?.name ?? 'Anonymous';
```

#### 反例/常见错误

```javascript
// ❌ 错误1: 用于赋值左侧
user?.profile?.name = 'New Name';  // SyntaxError

// ✅ 正确做法：先检查存在性
if (user?.profile) {
  user.profile.name = 'New Name';
}

// ❌ 错误2: 过度使用导致隐藏错误
const result = data?.nested?.value;  // undefined
// 如果 data 应该存在但为 null，错误被静默忽略

// ✅ 正确做法：区分可选和必需的字段
const required = data.nested.value;  // 报错如果缺失
const optional = data?.metadata?.tag;  // 可选字段

// ❌ 错误3: 与 && 混淆优先级
const x = a?.b && c?.d;  // 逻辑与优先级低于可选链

// ❌ 错误4: 删除操作
delete user?.profile;  // 语法错误，delete 不支持可选链
```

---

### 2.5 空值合并运算符 Nullish Coalescing (??)

#### 概念定义（形式化）

**空值合并运算符** `??` 是一个逻辑运算符，当左侧操作数为 `null` 或 `undefined` 时，返回右侧操作数。

**形式化定义：**

```
NullishCoalescing ::= Expression "??" Expression

语义：
left ?? right =
  if left ∈ {null, undefined} then right
  else left
```

*来源：ECMA-262 §13.12*

#### 属性特征

| 属性 | 值 |
|------|-----|
| 空值定义 | 仅 null 和 undefined |
| 与 \|\| 区别 | 不将 0, '', false 视为空值 |
| 优先级 | 低于 \|\|，高于三元运算符 |
| 短路特性 | 左侧非空值时不计算右侧 |
| 结合性 | 右结合 |

#### 使用示例

```javascript
// ===== 基本用法 =====
const value = null ?? 'default';        // 'default'
const value2 = undefined ?? 'default';  // 'default'
const value3 = 0 ?? 'default';          // 0 (0 不是空值)
const value4 = '' ?? 'default';         // '' (空字符串不是空值)
const value5 = false ?? 'default';      // false

// ===== 与逻辑或 || 对比 =====
const count = 0;
console.log(count || 10);   // 10 (0 被视为 falsy)
console.log(count ?? 10);   // 0  (0 不是 nullish)

// ===== 默认值设置 =====
function greet(name) {
  // 允许传入空字符串作为有效名称
  const userName = name ?? 'Guest';
  return `Hello, ${userName}!`;
}

greet('');      // 'Hello, !' (空字符串被保留)
greet(null);    // 'Hello, Guest!'
greet();        // 'Hello, Guest!'

// ===== 配置对象默认值 =====
const config = {
  timeout: 0,        // 0 是有效值
  retries: null      // null 表示使用默认
};

const timeout = config.timeout ?? 5000;   // 0 (保留用户设置)
const retries = config.retries ?? 3;      // 3 (使用默认值)
```

#### 反例/常见错误

```javascript
// ❌ 错误1: 与 && 或 || 混用无括号
const x = a || b ?? c;  // SyntaxError: Unexpected token '??'

// ✅ 正确做法：使用括号明确优先级
const x = (a || b) ?? c;
const y = a || (b ?? c);

// ❌ 错误2: 与三元运算符混用无括号
const z = a ?? b ? c : d;  // 歧义

// ✅ 正确做法：加括号
const z = (a ?? b) ? c : d;

// ❌ 错误3: 滥用 ?? 代替 ||
// 当需要 falsy 值触发默认时，应该用 ||
const shouldShow = isVisible ?? true;  // 可能不是想要的
const shouldShow = isVisible || true;  // 更符合直觉
```

---

### 2.6 动态 import()

#### 概念定义（形式化）

**动态 import()** 是一个函数形式的导入语句，返回一个 Promise，允许在运行时按需加载模块。

**形式化定义：**

```
DynamicImport ::= "import" "(" ModuleSpecifier ")"

ModuleSpecifier ::= StringLiteral

返回类型: Promise<ModuleNamespaceObject>
```

*来源：ECMA-262 §13.3.10*

#### 语法形式（BNF风格）

```bnf
ImportCall ::= "import" "(" AssignmentExpression ")"

ImportMeta ::= "import" "." "meta"
```

#### 属性特征

| 属性 | 值 |
|------|-----|
| 返回类型 | `Promise<Module>` |
| 执行时机 | 运行时动态执行 |
| 条件加载 | 支持 |
| 代码分割 | 自动触发代码分割 |
| 模块标识符 | 可以是表达式（部分限制） |

#### 使用示例

```javascript
// ===== 基本动态导入 =====
async function loadModule() {
  const module = await import('./utils.js');
  module.doSomething();
}

// ===== 条件加载 =====
async function loadPolyfill() {
  if (!window.fetch) {
    await import('whatwg-fetch');
  }
}

// ===== 根据环境加载 =====
async function loadConfig() {
  const config = await import(`./config/${process.env.NODE_ENV}.js`);
  return config.default;
}

// ===== 错误处理 =====
async function safeImport(modulePath) {
  try {
    const module = await import(modulePath);
    return module;
  } catch (error) {
    console.error(`Failed to load ${modulePath}:`, error);
    return null;
  }
}

// ===== 解构导入 =====
async function loadAndUse() {
  const { default: myDefault, namedExport } = await import('./module.js');
  myDefault();
  namedExport();
}

// ===== 与 React.lazy 配合 =====
const LazyComponent = React.lazy(() => import('./HeavyComponent'));
```

#### 反例/常见错误

```javascript
// ❌ 错误1: 在顶层 await 之前使用（旧环境）
const module = await import('./module.js');  // 需要顶层 await 支持

// ✅ 正确做法：包裹在 async 函数中
async function init() {
  const module = await import('./module.js');
}

// ❌ 错误2: 使用完全动态路径
const module = await import(someVariable);  // 可能无法分析

// ✅ 正确做法：使用部分静态路径
const module = await import(`./locales/${language}.json`);

// ❌ 错误3: 忘记 await
const module = import('./module.js');
module.doSomething();  // Error: doSomething is not a function

// ✅ 正确做法：await Promise
const module = await import('./module.js');
```

---

## 3. ES2021 特性详解

### 3.1 Promise.any - 第一个成功的Promise

#### 概念定义（形式化）

**Promise.any** 接收一个 Promise 可迭代对象，返回第一个 fulfilled 的 Promise 的值。如果所有 Promise 都被 reject，则返回 AggregateError。

**形式化定义：**

```
Promise.any: Iterable<Promise<T>> → Promise<T>

结果：
- 任一 Promise fulfilled → 返回其 value
- 所有 Promise rejected → throw AggregateError
```

*来源：ECMA-262 §27.2.4.2*

#### 属性特征

| 属性 | 值 |
|------|-----|
| 成功条件 | 第一个 fulfilled 的 Promise |
| 失败条件 | 所有 Promise 都被 rejected |
| 错误类型 | AggregateError |
| 错误信息 | All promises were rejected |
| 错误属性 | errors: Array<Error> |

#### 使用示例

```javascript
// ===== 基本用法 =====
const promises = [
  fetch('/api/fast-but-might-fail'),
  fetch('/api/slow-but-reliable'),
  fetch('/api/cached')
];

try {
  const fastestResponse = await Promise.any(promises);
  console.log('First successful:', fastestResponse);
} catch (error) {
  console.log('All failed:', error.errors);
}

// ===== 多数据源获取 =====
async function fetchFromMultipleSources(urls) {
  const requests = urls.map(url =>
    fetch(url).then(res => {
      if (!res.ok) throw new Error(`${url} failed`);
      return res.json();
    })
  );

  try {
    return await Promise.any(requests);
  } catch (aggregateError) {
    console.error('All sources failed:', aggregateError.errors);
    throw aggregateError;
  }
}

// ===== 与 Promise.race 对比 =====
const p1 = new Promise((_, reject) => setTimeout(reject, 100, 'error'));
const p2 = new Promise(resolve => setTimeout(resolve, 200, 'success'));

Promise.race([p1, p2]).catch(e => console.log('race:', e));  // 'error'
Promise.any([p1, p2]).then(v => console.log('any:', v));      // 'success'
```

#### 反例/常见错误

```javascript
// ❌ 错误1: 忘记处理 AggregateError
try {
  await Promise.any(promises);
} catch (e) {
  console.log(e.message);  // 只知道"All promises were rejected"
  // 丢失了具体的错误信息！
}

// ✅ 正确做法：访问 errors 属性
try {
  await Promise.any(promises);
} catch (e) {
  if (e instanceof AggregateError) {
    e.errors.forEach((err, i) => {
      console.log(`Promise ${i} failed:`, err.message);
    });
  }
}

// ❌ 错误2: 空数组
await Promise.any([]);  // AggregateError: All promises were rejected
```

---

### 3.2 逻辑赋值运算符

#### 概念定义（形式化）

**逻辑赋值运算符** 将逻辑运算与赋值结合，提供简洁的默认值设置方式。

**形式化定义：**

```
LogicalAssignment ::=
  | Expression "||=" Expression    (逻辑或赋值)
  | Expression "&&=" Expression    (逻辑与赋值)
  | Expression "??=" Expression    (空值合并赋值)

语义：
a ||= b  ⟺  a || (a = b)
a &&= b  ⟺  a && (a = b)
a ??= b  ⟺  a ?? (a = b)
```

*来源：ECMA-262 §13.15*

#### 属性特征

| 运算符 | 赋值条件 | 等价表达式 |
|--------|----------|------------|
| `\|\|=` | a 为 falsy | `a \|\| (a = b)` |
| `&&=` | a 为 truthy | `a && (a = b)` |
| `??=` | a 为 nullish | `a ?? (a = b)` |

#### 使用示例

```javascript
// ===== 逻辑或赋值 ||= =====
let config = {};
config.timeout ||= 5000;      // config.timeout = 5000
config.timeout ||= 3000;      // 保持 5000 (已有值)

// ===== 逻辑与赋值 &&= =====
let user = { name: 'John' };
user.name &&= user.name.toUpperCase();  // 'JOHN'

let empty = null;
empty &&= empty.toUpperCase();  // null (短路，不执行)

// ===== 空值合并赋值 ??= =====
let settings = { port: 0 };
settings.port ??= 8080;       // 保持 0 (0 不是 nullish)
settings.host ??= 'localhost'; // 'localhost'

// ===== 实际应用场景 =====
class PluginManager {
  plugins = new Map();

  register(name, plugin) {
    // 只在不存在时注册
    this.plugins.get(name) ??= plugin;
  }
}

// ===== 函数参数默认值 =====
function processData(data, options) {
  options ??= {};
  options.timeout ??= 5000;
  options.retries ??= 3;
  // ...
}
```

#### 反例/常见错误

```javascript
// ❌ 错误1: 与可选链混淆
obj?.prop ??= defaultValue;  // SyntaxError

// ❌ 错误2: 连续使用无括号
a ??= b ||= c;  // 歧义，需要括号

// ✅ 正确做法：明确优先级
(a ??= b) ||= c;
a ??= (b ||= c);

// ❌ 错误3: ??= 与 ||= 选择错误
let count = 0;
count ||= 10;   // count 变为 10 (可能不是想要的)
count ??= 10;   // count 保持 0 (正确)
```

---

### 3.3 数字分隔符

#### 概念定义（形式化）

**数字分隔符** 允许在数字字面量中使用下划线 `_` 作为视觉分隔符，提高大数字的可读性。

**形式化定义：**

```
NumericLiteral ::=
  | DecimalDigits ("_" DecimalDigits)*
  | BinaryIntegerLiteral
  | OctalIntegerLiteral
  | HexIntegerLiteral
  | BigIntLiteral

分隔符规则：
- 不能出现在开头或结尾
- 不能连续出现
- 不能出现在小数点前后
```

*来源：ECMA-262 §11.8.3*

#### 使用示例

```javascript
// ===== 十进制数字 =====
const billion = 1_000_000_000;
const bytes = 1_048_576;           // 1 MB
const creditCard = 1234_5678_9012_3456n;

// ===== 二进制数字 =====
const flags = 0b1010_0001_1000_0101;
const mask = 0b1111_0000;

// ===== 八进制数字 =====
const permissions = 0o755;
const max = 0o777_777;

// ===== 十六进制数字 =====
const color = 0xFF_00_FF;
const address = 0xDEAD_BEEF;
const maxInt = 0x7FFF_FFFF_FFFF_FFFF;

// ===== BigInt =====
const huge = 9_007_199_254_740_991n;
```

#### 反例/常见错误

```javascript
// ❌ 错误1: 开头使用分隔符
const wrong = _123;  // ReferenceError: _123 is not defined

// ❌ 错误2: 结尾使用分隔符
const wrong = 123_;  // SyntaxError

// ❌ 错误3: 连续分隔符
const wrong = 1__000;  // SyntaxError

// ❌ 错误4: 小数点周围使用
const wrong = 1._23;   // SyntaxError
const wrong = 1_.23;   // SyntaxError

// ❌ 错误5: 科学计数法中
const wrong = 1e_10;   // SyntaxError

// ✅ 正确用法
const correct = 1_000.000_001;  // 可以
```

---

### 3.4 WeakRef 与 FinalizationRegistry

#### 概念定义（形式化）

**WeakRef** 创建对对象的弱引用，不阻止垃圾回收。

**FinalizationRegistry** 注册回调函数，在对象被垃圾回收时执行清理。

**形式化定义：**

```
WeakRef: Object → WeakRef<Object>
  语义：持有目标对象的弱引用

FinalizationRegistry: (heldValue → void) → FinalizationRegistry
  方法：
  - register(target, heldValue, unregisterToken?)
  - unregister(unregisterToken)
```

*来源：ECMA-262 §26.1, §26.2*

#### 属性特征

| 特性 | WeakRef | FinalizationRegistry |
|------|---------|---------------------|
| 引用强度 | 弱引用 | 不适用 |
| 阻止GC | 否 | 否 |
| 可预测性 | 不可预测 | 不可预测 |
| 主要用途 | 缓存、大对象管理 | 资源清理 |
| 访问方式 | .deref() | 回调函数 |

#### 使用示例

```javascript
// ===== WeakRef 基本用法 =====
class LargeObjectCache {
  #cache = new Map();

  get(id) {
    const ref = this.#cache.get(id);
    if (ref) {
      const obj = ref.deref();
      if (obj) return obj;
      // 对象已被回收，清理缓存
      this.#cache.delete(id);
    }
    return null;
  }

  set(id, obj) {
    this.#cache.set(id, new WeakRef(obj));
  }
}

// ===== FinalizationRegistry 清理 =====
class ExternalResourceManager {
  #registry = new FinalizationRegistry((heldValue) => {
    console.log(`Cleaning up resource: ${heldValue}`);
    // 执行清理操作：关闭文件、释放内存等
  });

  #resources = new Map();

  create(id) {
    const resource = { id, data: new ArrayBuffer(1024 * 1024) };
    this.#resources.set(id, resource);

    // 注册清理回调
    this.#registry.register(resource, id, resource);

    return resource;
  }

  release(resource) {
    // 手动释放时注销
    this.#registry.unregister(resource);
    this.#resources.delete(resource.id);
  }
}

// ===== 实际应用：DOM 元素缓存 =====
class DOMCache {
  #elementRefs = new Map();
  #registry = new FinalizationRegistry((key) => {
    this.#elementRefs.delete(key);
    console.log(`Element ${key} was garbage collected`);
  });

  set(key, element) {
    const ref = new WeakRef(element);
    this.#elementRefs.set(key, ref);
    this.#registry.register(element, key);
  }

  get(key) {
    const ref = this.#elementRefs.get(key);
    return ref ? ref.deref() : null;
  }
}
```

#### 反例/常见错误

```javascript
// ❌ 错误1: 依赖 WeakRef 的确定性
const ref = new WeakRef({ data: 'important' });
// 无法预测何时被回收
console.log(ref.deref());  // 可能返回对象，也可能返回 undefined

// ❌ 错误2: 在 FinalizationRegistry 回调中访问对象
const registry = new FinalizationRegistry((obj) => {
  console.log(obj.data);  // ❌ 对象已被回收，无法访问
});

// ✅ 正确做法：使用 heldValue 传递信息
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`Cleaned: ${heldValue}`);  // 使用注册时传递的值
});
registry.register(obj, obj.id);  // 传递 id 作为 heldValue

// ❌ 错误3: 用 WeakRef 代替正常引用
// 如果对象需要保持存活，不要用 WeakRef
```

---

### 3.5 String.prototype.replaceAll

#### 概念定义（形式化）

**replaceAll** 返回一个新字符串，其中所有匹配模式都被替换。

**形式化定义：**

```
replaceAll: (searchValue: string | RegExp, replaceValue: string | ReplacerFunction) → string

约束：
- 如果 searchValue 是全局正则，直接使用
- 如果 searchValue 是非全局正则，抛出 TypeError
- 如果 searchValue 是字符串，替换所有出现
```

*来源：ECMA-262 §22.1.3.23*

#### 使用示例

```javascript
// ===== 字符串替换 =====
const str = 'The quick brown fox jumps over the lazy dog. If the dog reacted, was it really lazy?';

// 之前需要正则全局标志
const oldWay = str.replace(/dog/g, 'monkey');

// 现在更简单
const newWay = str.replaceAll('dog', 'monkey');

// ===== 正则表达式 =====
const withRegex = str.replaceAll(/\s+/g, '-');  // 替换所有空白

// ❌ 非全局正则会报错
try {
  str.replaceAll(/dog/, 'monkey');  // TypeError!
} catch (e) {
  console.log(e.message);  // "String.prototype.replaceAll called with a non-global RegExp"
}

// ===== 替换函数 =====
const replaced = 'aabbcc'.replaceAll(/[a-c]/g, (match, offset) => {
  return `${match.toUpperCase()}(${offset})`;
});
// 'A(0)A(1)B(2)B(3)C(4)C(5)'

// ===== 特殊替换字符串 =====
'$$ $& $` $\' $1'.replaceAll('$', '#');
// '## $& $` $\' $1' ($$ 被替换为 $)
```

---

## 4. ES2022 特性详解

### 4.1 Class 私有字段和方法

#### 概念定义（形式化）

**私有字段** 以 `#` 为前缀，只能在声明它们的类内部访问。

**形式化定义：**

```
PrivateIdentifier ::= "#" IdentifierName

PrivateFieldDeclaration ::= PrivateIdentifier "=" Expression
PrivateMethodDeclaration ::= PrivateIdentifier "(" Parameters ")" Block
PrivateGetter ::= "get" PrivateIdentifier "()" Block
PrivateSetter ::= "set" PrivateIdentifier "(" Parameter ")" Block

访问控制：
- 类外部：不可访问（SyntaxError 或 undefined）
- 子类：不可访问
- 类实例间：可互相访问（同一类）
```

*来源：ECMA-262 §15.7*

#### 语法形式（BNF风格）

```bnf
ClassElement ::=
  | PublicField
  | PrivateField
  | PublicMethod
  | PrivateMethod
  | StaticBlock

PrivateField ::= "#" IdentifierName ("=" Initializer)? ";"
PrivateMethod ::= "#" MethodDefinition
StaticPrivateField ::= "static" "#" IdentifierName ("=" Initializer)? ";"
```

#### 属性特征

| 特性 | 公有字段 | 私有字段 |
|------|----------|----------|
| 访问范围 | 任何地方 | 仅类内部 |
| 继承 | 可继承 | 不可继承 |
| 反射访问 | `Reflect.ownKeys()` | 不可枚举 |
| 原型链 | 在实例上 | 在实例上（但受限访问） |
| 检查存在 | `in` 操作符 | `#field in obj` |

#### 使用示例

```javascript
// ===== 基本私有字段 =====
class Counter {
  #count = 0;  // 私有字段声明

  increment() {
    this.#count++;
    return this;
  }

  get value() {
    return this.#count;
  }
}

const counter = new Counter();
counter.increment();
console.log(counter.value);    // 1
console.log(counter.#count);   // SyntaxError: Private field must be declared

// ===== 私有方法 =====
class SecureStorage {
  #data = new Map();

  // 私有方法
  #validate(key) {
    if (typeof key !== 'string') {
      throw new TypeError('Key must be a string');
    }
  }

  set(key, value) {
    this.#validate(key);
    this.#data.set(key, value);
  }

  get(key) {
    this.#validate(key);
    return this.#data.get(key);
  }
}

// ===== 私有 getter/setter =====
class Temperature {
  #celsius = 0;

  get #fahrenheit() {
    return this.#celsius * 9/5 + 32;
  }

  set #fahrenheit(value) {
    this.#celsius = (value - 32) * 5/9;
  }

  get celsius() { return this.#celsius; }
  set celsius(v) { this.#celsius = v; }

  get fahrenheit() { return this.#fahrenheit; }
  set fahrenheit(v) { this.#fahrenheit = v; }
}

// ===== 静态私有字段 =====
class Database {
  static #connectionPool = new Map();
  static #maxConnections = 10;

  static #getConnection(url) {
    if (this.#connectionPool.size >= this.#maxConnections) {
      throw new Error('Connection pool exhausted');
    }
    // ...
  }
}

// ===== in 操作符检查私有字段 =====
class Container {
  #private = 'secret';
  public = 'open';

  static hasPrivate(obj) {
    return #private in obj;  // 检查 obj 是否有 #private 字段
  }
}

const container = new Container();
console.log(Container.hasPrivate(container));  // true
console.log(Container.hasPrivate({}));          // false
```

#### 反例/常见错误

```javascript
// ❌ 错误1: 类外部访问
class MyClass {
  #secret = 42;
}
const obj = new MyClass();
console.log(obj.#secret);  // SyntaxError

// ❌ 错误2: 子类访问
class Parent {
  #private = 'parent';
}
class Child extends Parent {
  getPrivate() {
    return this.#private;  // SyntaxError: Private field not found
  }
}

// ❌ 错误3: 忘记声明直接使用
class Bad {
  constructor() {
    this.#undeclared = 1;  // SyntaxError
  }
}

// ❌ 错误4: 尝试动态访问
const fieldName = '#private';
obj[fieldName];  // 访问的是公有属性 '#private'，不是私有字段

// ✅ 正确做法：如果需要动态访问，使用 WeakMap
const privateData = new WeakMap();
class DynamicPrivate {
  constructor() {
    privateData.set(this, { secret: 42 });
  }
}
```

#### 与其他特性的关系

```
私有字段 ──→ 封装机制演进：
    ├── ES5: 闭包 + WeakMap (运行时封装)
    ├── ES6: Symbol (可枚举但难猜测)
    ├── ES2022: #private (真正的语言级私有)
    └── TypeScript: private (编译时检查，运行时可访问)

私有字段 vs WeakMap：
┌─────────────────┬──────────────┬──────────────┐
│     特性        │  #private    │   WeakMap    │
├─────────────────┼──────────────┼──────────────┤
│ 语言支持        │   ES2022+    │   ES6+       │
│ 性能            │   更好       │   稍慢       │
│ 动态访问        │   不支持     │   支持       │
│ 调试可见性      │   DevTools   │   隐藏       │
│ 子类访问        │   不支持     │   可设计     │
└─────────────────┴──────────────┴──────────────┘
```

---

### 4.2 Class 静态块 (Static Block)

#### 概念定义（形式化）

**静态块** 允许在类定义中包含静态初始化代码块，在类求值时执行。

**形式化定义：**

```
StaticBlock ::= "static" "{" StatementList "}"

语义：
- 在类加载时执行（类似静态构造函数）
- 可以访问类的私有静态成员
- 可以有多个，按顺序执行
```

*来源：ECMA-262 §15.7.10*

#### 使用示例

```javascript
// ===== 基本静态块 =====
class Config {
  static settings = {};
  static #privateConfig = {};

  static {
    // 静态初始化代码
    console.log('Static block 1 executed');
    this.settings = this.#loadConfig();
  }

  static {
    // 可以有多个静态块
    console.log('Static block 2 executed');
    this.#validateConfig();
  }

  static #loadConfig() {
    return { apiUrl: '/api', timeout: 5000 };
  }

  static #validateConfig() {
    if (!this.settings.apiUrl) {
      throw new Error('API URL required');
    }
  }
}

// ===== 与外部变量交互 =====
let externalValue = null;

class Service {
  static config = {};

  static {
    // 可以访问外部作用域
    externalValue = 'initialized';
    this.config = { version: '1.0' };
  }
}

console.log(externalValue);  // 'initialized'

// ===== 复杂初始化场景 =====
class DatabaseConnection {
  static #pool = null;
  static #initialized = false;

  static {
    // 复杂的初始化逻辑
    try {
      this.#pool = this.#createPool();
      this.#initialized = true;
    } catch (error) {
      console.error('Failed to initialize pool:', error);
      this.#initialized = false;
    }
  }

  static #createPool() {
    return { connections: [], maxSize: 10 };
  }

  static get isReady() {
    return this.#initialized;
  }
}
```

---

### 4.3 at() 方法

#### 概念定义（形式化）

**at()** 方法返回数组或字符串中指定索引处的元素，支持负索引。

**形式化定义：**

```
at: (index: number) → T | undefined

语义：
- index ≥ 0: 返回 this[index]
- index < 0: 返回 this[length + index]
- |index| ≥ length: 返回 undefined
```

*来源：ECMA-262 §23.1.3.1 (Array), §22.1.3.1 (String)*

#### 使用示例

```javascript
// ===== 数组 at() =====
const arr = [1, 2, 3, 4, 5];

// 正索引
console.log(arr.at(0));   // 1
console.log(arr.at(2));   // 3

// 负索引（从末尾开始）
console.log(arr.at(-1));  // 5 (最后一个)
console.log(arr.at(-2));  // 4 (倒数第二个)

// 越界
console.log(arr.at(10));   // undefined
console.log(arr.at(-10));  // undefined

// ===== 字符串 at() =====
const str = 'Hello';
console.log(str.at(-1));  // 'o'
console.log(str.at(-2));  // 'l'

// ===== 与传统方式对比 =====
const arr = [1, 2, 3, 4, 5];

// 获取最后一个元素
const last1 = arr[arr.length - 1];  // 传统方式
const last2 = arr.slice(-1)[0];      // 另一种方式
const last3 = arr.at(-1);            // 简洁方式 ✓

// 获取倒数第 N 个
const nth1 = arr[arr.length - N];    // 需要计算
const nth2 = arr.at(-N);              // 直接获取 ✓

// ===== TypedArray 也支持 =====
const typed = new Int32Array([10, 20, 30]);
console.log(typed.at(-1));  // 30
```

#### 反例/常见错误

```javascript
// ❌ 错误1: 与 slice 混淆
const arr = [1, 2, 3];
arr.at(-1, -2);  // 只使用第一个参数，-2 被忽略

// ✅ 正确做法：分别调用
const lastTwo = [arr.at(-2), arr.at(-1)];

// ❌ 错误2: 修改数组
arr.at(-1) = 100;  // 语法错误，at() 返回的是值，不是引用

// ✅ 正确做法：直接索引赋值
arr[arr.length - 1] = 100;
```

---

### 4.4 Object.hasOwn()

#### 概念定义（形式化）

**Object.hasOwn()** 检查对象是否将指定属性作为自身属性（而非继承）。

**形式化定义：**

```
Object.hasOwn: (obj: Object, prop: PropertyKey) → boolean

语义：
- 返回 true: 属性是对象的自有属性（包括不可枚举）
- 返回 false: 属性不存在或是继承的

等价于：Object.prototype.hasOwnProperty.call(obj, prop)
```

*来源：ECMA-262 §20.1.2.4*

#### 使用示例

```javascript
// ===== 基本用法 =====
const obj = { name: 'John', age: 30 };

console.log(Object.hasOwn(obj, 'name'));     // true
console.log(Object.hasOwn(obj, 'age'));      // true
console.log(Object.hasOwn(obj, 'toString')); // false (继承的)
console.log(Object.hasOwn(obj, 'unknown'));  // false

// ===== 与 hasOwnProperty 对比 =====
const obj = Object.create(null);  // 无原型的对象
obj.name = 'test';

// 传统方式会失败
// obj.hasOwnProperty('name');  // TypeError: obj.hasOwnProperty is not a function

// Object.hasOwn 总是工作
console.log(Object.hasOwn(obj, 'name'));  // true

// ===== 处理覆盖 hasOwnProperty 的对象 =====
const malicious = {
  hasOwnProperty: () => true,  // 恶意覆盖
  legit: 'value'
};

// 传统方式不可靠
console.log(malicious.hasOwnProperty('nonexistent'));  // true (错误！)

// Object.hasOwn 可靠
console.log(Object.hasOwn(malicious, 'nonexistent'));  // false
console.log(Object.hasOwn(malicious, 'legit'));        // true

// ===== 遍历对象属性 =====
const data = { a: 1, b: 2 };
Object.setPrototypeOf(data, { c: 3 });

for (const key in data) {
  if (Object.hasOwn(data, key)) {
    console.log(`Own: ${key} = ${data[key]}`);
  } else {
    console.log(`Inherited: ${key} = ${data[key]}`);
  }
}
// Own: a = 1
// Own: b = 2
// Inherited: c = 3
```

---

### 4.5 Error Cause

#### 概念定义（形式化）

**Error Cause** 允许在创建 Error 时指定 cause 选项，保留原始错误信息。

**形式化定义：**

```
ErrorConstructor ::= new Error(message, options?)

options ::= { cause: any }

语义：
- 新 Error 的 .cause 属性引用原始错误
- 支持所有 Error 子类
```

*来源：ECMA-262 §20.5.1*

#### 使用示例

```javascript
// ===== 基本用法 =====
try {
  try {
    JSON.parse('invalid json');
  } catch (parseError) {
    throw new Error('Failed to parse config', { cause: parseError });
  }
} catch (error) {
  console.log(error.message);           // 'Failed to parse config'
  console.log(error.cause.message);     // 'Unexpected token i in JSON'
  console.log(error.cause);             // 原始 SyntaxError
}

// ===== 错误链 =====
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch user ${userId}`, { cause: error });
  }
}

async function displayUserProfile(userId) {
  try {
    const user = await fetchUserData(userId);
    renderProfile(user);
  } catch (error) {
    // 可以追溯整个错误链
    console.error('Display failed:', error.message);
    console.error('Caused by:', error.cause?.message);
    console.error('Root cause:', error.cause?.cause?.message);
    showErrorUI(error);
  }
}

// ===== 自定义 Error 类 =====
class ValidationError extends Error {
  constructor(message, { field, cause } = {}) {
    super(message, { cause });
    this.field = field;
    this.name = 'ValidationError';
  }
}

// ===== 类型安全的错误处理 =====
function processData(data) {
  try {
    validateData(data);
    transformData(data);
    saveData(data);
  } catch (error) {
    throw new AppError('Data processing failed', {
      cause: error,
      context: { data, timestamp: Date.now() }
    });
  }
}
```

---

## 5. ES2023 特性详解

### 5.1 不可变数组方法

#### 概念定义（形式化）

ES2023 引入了四个新的数组方法，它们返回新数组而不修改原数组。

**形式化定义：**

```
toSorted: (compareFn?: (a, b) => number) → Array<T>
toReversed: () → Array<T>
toSpliced: (start, deleteCount?, ...items) → Array<T>
with: (index, value) → Array<T>

语义：
- 所有方法返回新数组
- 原数组保持不变
```

*来源：ECMA-262 §23.1.3*

#### 使用示例

```javascript
// ===== toSorted() =====
const original = [3, 1, 4, 1, 5];
const sorted = original.toSorted();

console.log(original);  // [3, 1, 4, 1, 5] - 未改变
console.log(sorted);    // [1, 1, 3, 4, 5] - 新数组

// 自定义比较函数
const people = [{ age: 30 }, { age: 20 }, { age: 40 }];
const byAge = people.toSorted((a, b) => a.age - b.age);

// ===== toReversed() =====
const arr = [1, 2, 3, 4, 5];
const reversed = arr.toReversed();

console.log(arr);       // [1, 2, 3, 4, 5]
console.log(reversed);  // [5, 4, 3, 2, 1]

// ===== toSpliced() =====
const items = ['a', 'b', 'c', 'd', 'e'];

// 删除元素
const removed = items.toSpliced(1, 2);
console.log(removed);  // ['a', 'd', 'e']
console.log(items);    // ['a', 'b', 'c', 'd', 'e']

// 替换元素
const replaced = items.toSpliced(1, 2, 'X', 'Y');
console.log(replaced);  // ['a', 'X', 'Y', 'd', 'e']

// ===== with() =====
const nums = [1, 2, 3, 4, 5];
const updated = nums.with(2, 99);

console.log(nums);      // [1, 2, 3, 4, 5]
console.log(updated);   // [1, 2, 99, 4, 5]

// 负索引支持
const lastUpdated = nums.with(-1, 99);  // [1, 2, 3, 4, 99]

// ===== 函数式编程风格 =====
const data = [3, 1, 4, 1, 5];

const result = data
  .toSorted()
  .toReversed()
  .with(0, 100);

console.log(result);  // [100, 5, 4, 3, 1, 1]
console.log(data);    // [3, 1, 4, 1, 5] - 原数组不变
```

#### 反例/常见错误

```javascript
// ❌ 错误1: 以为修改了原数组
const arr = [3, 1, 2];
arr.toSorted();
console.log(arr);  // [3, 1, 2] - 没变！

// ✅ 正确做法：使用返回值
const sorted = arr.toSorted();

// ❌ 错误2: with 方法越界
const arr = [1, 2, 3];
arr.with(10, 99);  // RangeError: Invalid index

// ❌ 错误3: 与旧方法混淆
const arr = [1, 2, 3];
const copy = [...arr];
copy.sort();  // 修改 copy
copy.reverse();  // 修改 copy

// ✅ 新方法更简洁
const result = arr.toSorted().toReversed();
```

---

### 5.2 findLast / findLastIndex

#### 概念定义（形式化）

**findLast** 从数组末尾开始查找，返回满足条件的最后一个元素。

**findLastIndex** 从数组末尾开始查找，返回满足条件的最后一个元素的索引。

**形式化定义：**

```
findLast: (predicate: (value, index, array) => boolean, thisArg?) → T | undefined
findLastIndex: (predicate: (value, index, array) => boolean, thisArg?) → number

语义：
- 从数组最后一个元素开始遍历
- 返回第一个满足 predicate 的元素/索引
- 未找到返回 undefined / -1
```

*来源：ECMA-262 §23.1.3.15, §23.1.3.16*

#### 使用示例

```javascript
// ===== findLast =====
const numbers = [5, 12, 8, 130, 44, 8];

// 找最后一个大于 10 的数
const lastBig = numbers.findLast(n => n > 10);
console.log(lastBig);  // 44

// 与 find 对比
const firstBig = numbers.find(n => n > 10);      // 12
const lastBig = numbers.findLast(n => n > 10);   // 44

// ===== findLastIndex =====
const index = numbers.findLastIndex(n => n > 10);
console.log(index);  // 4 (44 的索引)

// ===== 实际应用场景 =====
const events = [
  { type: 'click', timestamp: 1000 },
  { type: 'scroll', timestamp: 2000 },
  { type: 'click', timestamp: 3000 },
  { type: 'resize', timestamp: 4000 },
  { type: 'click', timestamp: 5000 }
];

// 找最后一次点击事件
const lastClick = events.findLast(e => e.type === 'click');
console.log(lastClick);  // { type: 'click', timestamp: 5000 }

// 找最后一次点击的索引
const lastClickIndex = events.findLastIndex(e => e.type === 'click');

// ===== 与反向数组对比 =====
const arr = [1, 2, 3, 2, 1];

// 旧方式：需要复制和反转
const lastIndexOld = arr.length - 1 - [...arr].reverse().findIndex(x => x === 2);

// 新方式：直接查找
const lastIndexNew = arr.findLastIndex(x => x === 2);  // 3
```

---

### 5.3 Hashbang 支持

#### 概念定义（形式化）

**Hashbang**（Shebang）允许 JavaScript 脚本以 `#!` 开头，指定解释器路径。

**形式化定义：**

```
Hashbang ::= "#!" SingleLineCommentCharacters? LineTerminator

语义：
- 必须是文件的第一个字符
- 被解析器视为单行注释
- 不影响代码执行
```

*来源：ECMA-262 §12.5*

#### 使用示例

```javascript
#!/usr/bin/env node
// 上面这一行是 Hashbang

// 现在可以直接运行这个文件：./script.js
console.log('Hello from Node.js!');

// 文件需要可执行权限：chmod +x script.js
```

```javascript
#!/usr/bin/env -S node --experimental-modules
// 带参数的 Hashbang

import { readFile } from 'fs/promises';

const content = await readFile('./data.txt', 'utf-8');
console.log(content);
```

---

## 6. ES2024 特性详解

### 6.1 Object.groupBy / Map.groupBy

#### 概念定义（形式化）

**Object.groupBy** 将可迭代对象按回调函数返回的键分组为对象。

**Map.groupBy** 将可迭代对象按回调函数返回的键分组为 Map。

**形式化定义：**

```
Object.groupBy: (items: Iterable<T>, callback: (T, number) => string) → Record<string, T[]>
Map.groupBy: (items: Iterable<T>, callback: (T, number) => K) → Map<K, T[]>

语义：
- 遍历 items，对每个元素调用 callback
- 按返回的键将元素分组
- Object.groupBy 键必须是字符串或可以转为字符串
```

*来源：ECMA-262 §20.1.2.13, §24.1.2.2*

> **版本归属说明**：`Object.groupBy` 与 `Map.groupBy` 是 **ES2024 (ES15)** 的特性，而非 ES2025。ES2025 在此基础上扩展了 `Iterator` 辅助方法与 `Set` 数学方法。

#### 使用示例

```javascript
// ===== Object.groupBy =====
const people = [
  { name: 'Alice', age: 25, city: 'NYC' },
  { name: 'Bob', age: 30, city: 'LA' },
  { name: 'Carol', age: 25, city: 'NYC' },
  { name: 'David', age: 30, city: 'LA' }
];

// 按城市分组
const byCity = Object.groupBy(people, person => person.city);
console.log(byCity);
// {
//   NYC: [{ name: 'Alice', ... }, { name: 'Carol', ... }],
//   LA: [{ name: 'Bob', ... }, { name: 'David', ... }]
// }

// 按年龄段分组
const byAgeGroup = Object.groupBy(people, person =>
  person.age < 30 ? 'young' : 'adult'
);

// ===== Map.groupBy =====
// 使用非字符串键
const byAge = Map.groupBy(people, person => person.age);
console.log(byAge.get(25));  // [{ name: 'Alice', ... }, { name: 'Carol', ... }]

// 使用对象作为键
const categories = new Map();
const byCategory = Map.groupBy(products, product => {
  return categories.get(product.categoryId);
});

// ===== 与 reduce 对比 =====
// 旧方式
const byCityOld = people.reduce((acc, person) => {
  const key = person.city;
  acc[key] = acc[key] || [];
  acc[key].push(person);
  return acc;
}, {});

// 新方式
const byCityNew = Object.groupBy(people, p => p.city);

// ===== 处理 null/undefined =====
const items = [1, 2, null, 3, undefined, 4];
const grouped = Object.groupBy(items, x => x ?? 'nullish');
// { '1': [1], '2': [2], 'nullish': [null, undefined], '3': [3], '4': [4] }
```

---

### 6.2 Promise.withResolvers

#### 概念定义（形式化）

**Promise.withResolvers** 返回一个对象，包含 Promise 及其 resolve/reject 函数。

**形式化定义：**

```
Promise.withResolvers: () → { promise: Promise<T>, resolve: (T) => void, reject: (any) => void }

语义：
- 创建一个未解决的 Promise
- 将 resolve/reject 暴露给外部
- 用于需要外部控制 Promise 状态的场景
```

*来源：ECMA-262 §27.2.4.6*

> **版本归属说明**：`Promise.withResolvers` 是 **ES2024 (ES15)** 的特性。ES2025 新增了 `Promise.try()` 用于统一处理同步/异步错误。

#### 使用示例

```javascript
// ===== 基本用法 =====
const { promise, resolve, reject } = Promise.withResolvers();

// 稍后解决
setTimeout(() => resolve('Done!'), 1000);

const result = await promise;
console.log(result);  // 'Done!'

// ===== 实际应用场景：可取消的请求 =====
class CancelableRequest {
  #controller = null;

  async fetch(url) {
    this.#controller = new AbortController();
    const { promise, resolve, reject } = Promise.withResolvers();

    fetch(url, { signal: this.#controller.signal })
      .then(resolve)
      .catch(reject);

    return promise;
  }

  cancel() {
    this.#controller?.abort();
  }
}

// ===== 手动控制异步流程 =====
function createDeferred() {
  const { promise, resolve, reject } = Promise.withResolvers();
  return {
    promise,
    resolve,
    reject,
    // 便捷方法
    then: (fn) => promise.then(fn),
    catch: (fn) => promise.catch(fn)
  };
}

// ===== 与旧方式对比 =====
// 旧方式
let outerResolve, outerReject;
const oldPromise = new Promise((resolve, reject) => {
  outerResolve = resolve;
  outerReject = reject;
});

// 新方式
const { promise, resolve, reject } = Promise.withResolvers();
```

---

### 6.3 String isWellFormed / toWellFormed

#### 概念定义（形式化）

**isWellFormed** 检查字符串是否是格式良好的 UTF-16。

**toWellFormed** 将字符串中的孤立代理对替换为替换字符（U+FFFD）。

**形式化定义：**

```
isWellFormed: () → boolean
toWellFormed: () → string

语义：
- 代理对：UTF-16 中用于表示增补字符的 16 位码元对
- 孤立代理：不成对的代理码元（无效）
- toWellFormed 将孤立代理替换为 \uFFFD
```

*来源：ECMA-262 §22.1.3.13, §22.1.3.14*

#### 使用示例

```javascript
// ===== isWellFormed =====
const wellFormed = 'Hello';
console.log(wellFormed.isWellFormed());  // true

// 创建格式不良的字符串（包含孤立代理）
const illFormed = 'Hello\uD800';  // \uD800 是高代理，没有低代理配对
console.log(illFormed.isWellFormed());  // false

// ===== toWellFormed =====
const illFormed = 'Hello\uD800World';
const wellFormed = illFormed.toWellFormed();
console.log(wellFormed);  // 'Hello\uFFFDWorld'

// ===== 实际应用场景 =====
// 处理外部数据
function safeJSONStringify(obj) {
  const str = JSON.stringify(obj);
  return str.toWellFormed();
}

// 确保字符串可以安全编码
function safeEncode(str) {
  if (!str.isWellFormed()) {
    console.warn('String contains ill-formed code units, fixing...');
    return str.toWellFormed();
  }
  return str;
}

// ===== 与 encodeURI 对比 =====
const illFormed = '\uD800';

try {
  encodeURI(illFormed);  // URIError: URI malformed
} catch (e) {
  console.log('encodeURI failed');
}

const fixed = illFormed.toWellFormed();
console.log(encodeURI(fixed));  // 正常工作
```

---

### 6.4 RegExp `v` flag（unicodeSets）

#### 概念定义（形式化）

ES2024 引入了 `v` flag（`unicodeSets`），作为 `u` flag（`unicode`）的超集，为正则表达式提供更强大的 Unicode 集合操作能力。在 `RegExp.prototype[Symbol.match]` 等方法的调用中，`v` flag 改变了正则引擎对字符类的解析语义：它允许使用集合运算（交集 `&&`、差集 `--`、并集）、Unicode 字符串属性（`\p{...}`）以及字符串字面量（`\q{...}`）。

**形式化定义：**

```
RegExpLiteral ::= "/" Pattern "/" [gimsuvy]*

v-flag 语义扩展：
- 字符类支持集合运算：[[A]&&[B]]、[[A]--[B]]
- 支持 \p{Property=Value} 的字符串属性
- 支持 \q{string} 多码点字符串字面量
- 在 Symbol.match 上下文中按 grapheme cluster 匹配
```

*来源：ECMA-262 §22.2*

> **版本归属说明**：`v` flag 是 **ES2024 (ES15)** 引入的。ES2025 在此基础上增加了重复命名捕获组、内联标志修饰符和 `RegExp.escape()`。

#### 使用示例

```javascript
// ===== 集合运算：交集 =====
// 匹配希腊语小写字母
const greekLower = /[\p{Lowercase}&&\p{Script=Greek}]/v;
console.log(greekLower.test('α')); // true
console.log(greekLower.test('Α')); // false (大写)
console.log(greekLower.test('a')); // false (非希腊语)

// ===== 集合运算：差集 =====
// 匹配 ASCII 字母，但排除元音
const noVowels = /^[[a-zA-Z]--[aeiouAEIOU]]+$/v;
console.log(noVowels.test('rhythm')); // true
console.log(noVowels.test('hello'));  // false

// ===== 字符串属性与字面量 =====
// 匹配表情符号键帽序列或特定字符串
const re = /^[\p{Emoji_Keycap_Sequence}\q{🇧🇪|abc}0-9]$/v;
console.log(re.test('4️⃣')); // true
console.log(re.test('🇧🇪')); // true
console.log(re.test('abc')); // true

// ===== Symbol.match 语义影响 =====
const str = 'Hello world';
const matchResult = str.match(/\p{Letter}+/gv);
console.log(matchResult); // ['Hello', 'world']

// v flag 下多码点字符正确匹配
const flagRe = /[\p{RGI_Emoji_Flag_Sequence}]/v;
console.log('🇧🇪'.match(flagRe)); // ['🇧🇪'] — 在 v flag 下按完整 grapheme 处理
```

---

## 7. ES2025 特性详解

### 7.1 Atomics.pause

#### 概念定义（形式化）

**Atomics.pause** 为自旋锁（spinlock）和忙等待（busy-waiting）场景提供 CPU 提示，允许处理器在等待共享内存状态变化时降低功耗、减少总线竞争，并提升多线程代码的性能。

**形式化定义：**

```
Atomics.pause: (iterationHint?: number) → undefined

语义：
- iterationHint 为可选提示值，指示当前处于第几次自旋迭代
- 具体行为由底层硬件/宿主环境决定，通常是执行 PAUSE 或 YIELD 指令
- 不保证任何可观察的内存效果，仅作为性能优化提示
```

*来源：ECMA-262 §25.4.11*

#### 使用示例

```javascript
// ===== 自旋锁优化 =====
const sharedArray = new Int32Array(new SharedArrayBuffer(4));

// 等待共享内存状态改变
while (Atomics.load(sharedArray, 0) === 0) {
  Atomics.pause(); // 让出 CPU，降低功耗
}

// ===== 带迭代提示的自旋 =====
for (let i = 0; Atomics.load(sharedArray, 0) === 0; i++) {
  Atomics.pause(i);
  // 底层实现可根据迭代次数调整退避策略
}

// ===== 与 Atomics.wait / waitAsync 对比 =====
// wait/waitAsync：阻塞线程，适合长等待
// Atomics.pause：非阻塞提示，适合短自旋
```

---

### 7.2 Iterator 辅助方法

#### 概念定义（形式化）

ES2025 引入了全局的 `Iterator` 构造函数及其原型上的辅助方法，允许对任意可迭代对象进行惰性（lazy）的链式操作，类似于数组方法但不在中间步骤创建数组。

**形式化定义：**

```
Iterator.from(object: Iterable<T> | Iterator<T>): IteratorObject<T>

Iterator.prototype 方法：
- map(mapper): IteratorObject<U>
- filter(predicate): IteratorObject<T>
- take(limit): IteratorObject<T>
- drop(limit): IteratorObject<T>
- flatMap(mapper): IteratorObject<U>
- reduce(reducer, initial?): U
- toArray(): T[]
- forEach(fn): void
- some(predicate): boolean
- every(predicate): boolean
- find(predicate): T | undefined
- zip(...iterables): IteratorObject<T[]>
```

*来源：ECMA-262 §27.1.4*

#### 使用示例

```javascript
// ===== 链式惰性操作 =====
const arr = ['a', '', 'b', '', 'c', '', 'd', '', 'e'];

const result = arr.values()
  .filter(x => x.length > 0)
  .drop(1)
  .take(3)
  .map(x => `=${x}=`)
  .toArray();

console.log(result); // ['=b=', '=c=', '=d=']

// ===== 与生成器配合 =====
function* naturals() {
  let n = 1;
  while (true) yield n++;
}

const firstFiveEvens = Iterator.from(naturals())
  .filter(n => n % 2 === 0)
  .take(5)
  .toArray();

console.log(firstFiveEvens); // [2, 4, 6, 8, 10]

// ===== zip 同步遍历 =====
const names = ['Alice', 'Bob'];
const ages = [25, 30];

for (const [name, age] of Iterator.zip(names, ages)) {
  console.log(`${name} is ${age}`);
}
// Alice is 25
// Bob is 30
```

---

### 7.3 Set 数学方法

#### 概念定义（形式化）

ES2025 为 `Set.prototype` 添加了数学集合运算方法，使 `Set` 成为更完整的数据结构。

**形式化定义：**

```
Set.prototype.union(other): Set<T>              // 并集
Set.prototype.intersection(other): Set<T>       // 交集
Set.prototype.difference(other): Set<T>         // 差集
Set.prototype.symmetricDifference(other): Set<T>// 对称差集
Set.prototype.isSubsetOf(other): boolean
Set.prototype.isSupersetOf(other): boolean
Set.prototype.isDisjointFrom(other): boolean
```

*来源：ECMA-262 §24.2.4*

#### 使用示例

```javascript
const setA = new Set([1, 2, 3, 4]);
const setB = new Set([3, 4, 5, 6]);

// ===== 并集 =====
console.log([...setA.union(setB)]); // [1, 2, 3, 4, 5, 6]

// ===== 交集 =====
console.log([...setA.intersection(setB)]); // [3, 4]

// ===== 差集 =====
console.log([...setA.difference(setB)]); // [1, 2]

// ===== 对称差集 =====
console.log([...setA.symmetricDifference(setB)]); // [1, 2, 5, 6]

// ===== 子集/超集判断 =====
const setC = new Set([1, 2]);
console.log(setC.isSubsetOf(setA));     // true
console.log(setA.isSupersetOf(setC));   // true
console.log(setA.isDisjointFrom(setB)); // false
console.log(setC.isDisjointFrom(setB)); // true (无共同元素)
```

---

### 7.4 RegExp 增强（ES2025）

#### 概念定义（形式化）

ES2025 在 ES2024 `v` flag 的基础上进一步增强了正则表达式：引入 `RegExp.escape()`、内联标志修饰符（inline modifiers）以及重复命名捕获组（duplicate named capturing groups）。

**形式化定义：**

```
RegExp.escape(string: string): string
  // 将字符串中的正则元字符转义，使其可安全用于构造 RegExp

Inline Modifiers:
  (?i:pattern)   // 局部启用忽略大小写
  (?-i:pattern)  // 局部禁用忽略大小写
  (?ims:pattern) // 局部启用多个标志
  (?-ims:pattern)// 局部禁用多个标志

Duplicate Named Groups:
  // 允许在不同分支中使用同名捕获组
  /(?<year>\d{4})-(?<month>\d{2})|(?<month>\d{2})\/(?<year>\d{4})/
```

*来源：ECMA-262 §22.2.3, §22.2.1*

#### 使用示例

```javascript
// ===== RegExp.escape =====
const userInput = 'file.(txt)';
const safePattern = RegExp.escape(userInput); // "file\.\(txt\)"
const re = new RegExp(safePattern, 'i');
console.log(re.test('File.(TXT)')); // true

// ===== 内联标志修饰符 =====
// 仅对括号内部分启用忽略大小写
const re1 = /^[a-z](?-i:[a-z])$/i;
console.log(re1.test('ab'));  // true
console.log(re1.test('Ab'));  // true
console.log(re1.test('aB'));  // false (B 不受外部 i 影响)

const re2 = /^(?i:[a-z])[a-z]$/;
console.log(re2.test('ab'));  // true
console.log(re2.test('Ab'));  // true
console.log(re2.test('aB'));  // false

// ===== 重复命名捕获组 =====
const dateRe = /(?<year>\d{4})-(?<month>\d{2})|(?<month>\d{2})\/(?<year>\d{4})/;
console.log("2025-06".match(dateRe).groups); // { year: "2025", month: "06" }
console.log("06/2025".match(dateRe).groups); // { year: "2025", month: "06" }
```

---

### 7.5 Promise.try

#### 概念定义（形式化）

**Promise.try** 接受一个回调函数，将其返回值包装为 Promise，并统一捕获同步抛出的异常和异步的 reject。它消除了 `Promise.resolve().then()` 的微任务延迟问题。

**形式化定义：**

```
Promise.try: (fn: () => T | Promise<T>) → Promise<T>

语义：
- 若 fn 同步返回 value，则返回 resolved Promise(value)
- 若 fn 同步抛出异常，则返回 rejected Promise(error)
- 若 fn 返回 Promise，则直接传递该 Promise
```

*来源：ECMA-262 §27.2.4.7*

#### 使用示例

```javascript
// ===== 统一处理同步/异步错误 =====
Promise.try(() => {
  if (Math.random() > 0.5) throw new Error('同步错误');
  return fetchData(); // 可能返回 Promise
}).catch(console.error);

// ===== 对比旧方式 =====
// 旧方式有微任务延迟
Promise.resolve()
  .then(() => maybeThrow())
  .catch(handleError);

// 新方式立即执行
Promise.try(() => maybeThrow())
  .catch(handleError);

// ===== 确保函数结果总是 Promise =====
function safeCall(fn) {
  return Promise.try(fn);
}

safeCall(() => 42).then(v => console.log(v));        // 42
safeCall(() => { throw new Error('oops'); }).catch(e => console.log(e.message)); // 'oops'
```

---

### 7.6 Import Attributes（JSON 模块）

#### 概念定义（形式化）

ES2025 标准化了 Import Attributes 语法（`with { type: 'json' }`），允许在导入模块时声明模块的属性，最初用于安全地导入 JSON 模块。

**形式化定义：**

```
ImportDeclaration ::=
  "import" ImportClause "from" ModuleSpecifier "with" "{" AttributeList "}"

AttributeList ::=
  Identifier ":" StringLiteral

动态导入：
  import(moduleSpecifier, { with: { type: 'json' } })
```

*来源：ECMA-262 §16.2.2*

#### 使用示例

```javascript
// ===== 静态导入 JSON 模块 =====
import config from './config.json' with { type: 'json' };
console.log(config.apiUrl);

// ===== 动态导入 JSON 模块 =====
const data = await import('./data.json', {
  with: { type: 'json' }
});
console.log(data.default);

// ===== 与 assert 的演进关系 =====
// 旧语法（已废弃）：
// import config from './config.json' assert { type: 'json' };
// 新语法（ES2025 标准）：
// import config from './config.json' with { type: 'json' };
```

---

### 7.7 Float16Array

#### 概念定义（形式化）

ES2025 引入了 `Float16Array` —— 一种 16 位半精度浮点数的 TypedArray，适用于 WebGPU、机器学习模型传输等需要节省内存的场景。

**形式化定义：**

```
Float16Array: TypedArray
DataView.prototype.getFloat16(byteOffset, littleEndian?): number
DataView.prototype.setFloat16(byteOffset, value, littleEndian?): void
Math.f16round(x: number): number
```

*来源：ECMA-262 §24.1, §24.3*

#### 使用示例

```javascript
// ===== 创建 Float16Array =====
const halfPrecision = new Float16Array([1.2, 3.4, 5.6]);
console.log(halfPrecision.BYTES_PER_ELEMENT); // 2

// ===== DataView 读写 =====
const buffer = new ArrayBuffer(4);
const view = new DataView(buffer);
view.setFloat16(0, 1.337, true); // 小端序
console.log(view.getFloat16(0, true)); // 1.3369140625 (精度损失)

// ===== Math.f16round =====
console.log(Math.f16round(1.337)); // 1.3369140625

// ===== 应用场景：WebGPU/ML =====
// 相比 Float32Array 节省 50% 内存
const modelWeights = new Float16Array(1024 * 1024);
```

---

## 8. TypeScript 5.x 核心特性

### 8.1 装饰器元数据 (Decorator Metadata)

#### 概念定义（形式化）

TypeScript 5.0 实现了 ECMAScript Stage 3 装饰器提案，并增加了元数据支持。装饰器上下文对象包含 `metadata` 属性，用于存储与装饰目标关联的元数据。

**形式化定义：**

```
装饰器上下文包含：
- kind: 'class' | 'method' | 'getter' | 'setter' | 'field' | 'accessor'
- name: string | symbol
- access: { get?(), set?() }
- private?: boolean
- static?: boolean
- addInitializer?: (initializer) => void
- metadata?: Record<symbol, any>  // 元数据存储
```

*来源：TypeScript 5.0 Release Notes, TC39 Decorators Proposal*

#### 使用示例

```typescript
// ===== 启用装饰器元数据 =====
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": false,  // 使用新的装饰器
    "emitDecoratorMetadata": true     // 启用元数据发射
  }
}

// ===== 元数据装饰器 =====
import 'reflect-metadata';

const DESIGN_TYPE = Symbol.for('design:type');
const DESIGN_PARAM_TYPES = Symbol.for('design:paramtypes');
const DESIGN_RETURN_TYPE = Symbol.for('design:returntype');

function LogType(target: any, propertyKey: string) {
  const type = Reflect.getMetadata(DESIGN_TYPE, target, propertyKey);
  console.log(`${propertyKey} type:`, type);
}

function Injectable(target: any) {
  const paramTypes = Reflect.getMetadata(DESIGN_PARAM_TYPES, target);
  console.log(`${target.name} dependencies:`, paramTypes);
  return target;
}

// ===== 实际应用：依赖注入 =====
@Injectable
class DatabaseService {
  constructor(
    @Inject('CONFIG') private config: Config,
    @Inject('LOGGER') private logger: Logger
  ) {}

  @LogType
  connect(): Promise<Connection> {
    // ...
  }
}

// ===== 自定义元数据装饰器 =====
const COLUMN_KEY = Symbol('column');

function Column(options: { name?: string; type?: string } = {}) {
  return function(target: any, propertyKey: string) {
    const existing = Reflect.getMetadata(COLUMN_KEY, target) || [];
    Reflect.defineMetadata(COLUMN_KEY, [
      ...existing,
      { property: propertyKey, ...options }
    ], target);
  };
}

@Entity('users')
class User {
  @Column({ name: 'user_id', type: 'uuid' })
  id: string;

  @Column({ name: 'user_name', type: 'varchar' })
  name: string;

  @Column({ type: 'timestamp' })
  createdAt: Date;
}

// 读取元数据
const columns = Reflect.getMetadata(COLUMN_KEY, User.prototype);
console.log(columns);
// [
//   { property: 'id', name: 'user_id', type: 'uuid' },
//   { property: 'name', name: 'user_name', type: 'varchar' },
//   { property: 'createdAt', type: 'timestamp' }
// ]
```

---

### 8.2 const 类型参数

#### 概念定义（形式化）

**const 类型参数** 允许在类型参数声明中使用 `const` 修饰符，使推断的类型更加精确（字面量类型而非拓宽类型）。

**形式化定义：**

```
ConstTypeParameter ::= "const" TypeParameter

语义：
- 推断时尽可能使用字面量类型
- 类似于在调用时使用 as const
```

*来源：TypeScript 5.0 Release Notes*

#### 使用示例

```typescript
// ===== 基本用法 =====
// 不使用 const 类型参数
function createArray<T>(items: readonly T[]): T[] {
  return [...items];
}

const arr1 = createArray([1, 2, 3]);
// T 被推断为 number，返回 number[]

// 使用 const 类型参数
function createArrayConst<const T>(items: readonly T[]): T[] {
  return [...items];
}

const arr2 = createArrayConst([1, 2, 3]);
// T 被推断为 readonly [1, 2, 3]，返回 [1, 2, 3]

// ===== 实际应用场景 =====
// 路由定义
type Route<Path extends string> = {
  path: Path;
  component: ComponentType;
};

function defineRoute<const P extends string>(
  route: Route<P>
): Route<P> {
  return route;
}

const homeRoute = defineRoute({
  path: '/home',
  component: HomeComponent
});
// path 类型为 '/home' 而不是 string

// ===== 事件处理 =====
function createEvent<const T extends string, const P>(
  type: T,
  payload: P
): { type: T; payload: P } {
  return { type, payload };
}

const event = createEvent('USER_LOGIN', { userId: 123 });
// event.type 类型为 'USER_LOGIN' 而不是 string

// ===== 与泛型约束配合 =====
function pick<const T extends Record<string, any>, const K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

const user = { name: 'John', age: 30, email: 'john@example.com' };
const picked = pick(user, ['name', 'age'] as const);
// picked 类型为 { name: string; age: number }
// 而不是 Pick<{...}, 'name' | 'age'>
```

---

### 8.3 NoInfer<T>

#### 概念定义（形式化）

**`NoInfer<T>`** 是 TypeScript 5.4 引入的内置工具类型，其语义是：阻止该位置作为类型参数 `T` 的推断来源。换言之，当函数签名中存在多个可作为推断依据的位置时，被 `NoInfer<T>` 包裹的位置不会参与对 `T` 的推断，从而使 `T` 仅由其他位置推断得出。

**形式化定义：**

```
NoInfer<T>  // intrinsic 类型

语义：
- 在类型推断阶段，NoInfer<T> 所在的位置不作为 T 的推断候选
- 除推断外，NoInfer<T> 与 T 被视为同一类型
```

*来源：TypeScript 5.4 Release Notes, PR #53098*

#### 使用示例

```typescript
// ===== 阻止从第二个参数推断 =====
function createStreetLight<C extends string>(
  colors: C[],
  defaultColor?: NoInfer<C>
) {
  // ...
}

createStreetLight(["red", "yellow", "green"], "blue");
// ~~~~~~
// error: Argument of type '"blue"' is not assignable to parameter of type
// '"red" | "yellow" | "green" | undefined'.
// 若不用 NoInfer，C 会被推断为 "red" | "yellow" | "green" | "blue"

// ===== 配置对象推断控制 =====
function makeFSM<TState extends string>(config: {
  states: TState[];
  initial: NoInfer<TState>;
}) {
  return config;
}

makeFSM({
  states: ["open", "closed"],
  initial: "not-allowed"
  // ~~~~~
  // error: Type '"not-allowed"' is not assignable to type '"open" | "closed"'
});

// ===== 与默认值结合 =====
function search<T>(items: T[], target: NoInfer<T>) {
  return items.indexOf(target);
}

search(["a", "b", "c"], "d");
// ~~~~~~~~~~~~~~~~~~~~ error: "d" 不能赋给 "a" | "b" | "c"
```

---

### 8.4 satisfies 运算符

#### 概念定义（形式化）

**`satisfies`** 运算符（TypeScript 4.9 引入，5.x 持续完善）用于检查表达式是否满足给定的类型约束，但**不改变表达式的推断类型**。这与 `as`（类型断言）有本质区别：`as` 是告诉编译器"相信我，按这个类型处理"，可能隐藏类型错误；`satisfies` 则是要求编译器验证"该值至少满足此约束"，同时保留原始推断类型。

**形式化定义：**

```
SatisfiesExpression ::= Expression "satisfies" Type

语义：
- 检查 Expression 的类型可赋值给 Type（子类型检查）
- 最终类型保持为 Expression 的原始推断类型
- 与 as 的本质区别：as 是单向强制转换，satisfies 是双向验证+保留推断
```

*来源：TypeScript 4.9 Release Notes*

#### 使用示例

```typescript
// ===== 与 as 的对比 =====
const config1 = {
  host: 'localhost',
  port: 3000
} as Record<string, string | number>;
// config1.host 类型为 string | number — 丢失了字面量信息

const config2 = {
  host: 'localhost',
  port: 3000
} satisfies Record<string, string | number>;
// config2.host 类型为 'localhost' — 保留推断，同时验证约束

// ===== 检查多余属性同时保留精确类型 =====
type Routes = Record<string, string>;

const routes = {
  home: '/',
  about: '/about',
  contact: '/contact'
} satisfies Routes;

// routes.home 仍是 '/':string 字面量类型
// 若缺少属性或类型不匹配，会报错

// ===== 在泛型配置中的使用 =====
interface ThemeConfig {
  colors: { primary: string; secondary: string };
  fonts: { heading: string; body: string };
}

const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d'
  },
  fonts: {
    heading: 'Inter',
    body: 'Roboto'
  }
} satisfies ThemeConfig;

// theme.colors.primary 类型为 '#007bff' 而不是 string
```

---

### 8.5 using 声明与显式资源管理

#### 概念定义（形式化）

**`using` 与 `await using`** 声明基于 ECMAScript Explicit Resource Management（**Stage 4 / 已纳入 ECMAScript 2025 标准**），用于在代码块结束时自动调用对象的 `Symbol.dispose` 或 `Symbol.asyncDispose` 方法，实现确定性的资源释放。

**形式化定义：**

```
UsingDeclaration ::= "using" BindingIdentifier "=" Expression
AwaitUsingDeclaration ::= "await using" BindingIdentifier "=" Expression

语义：
- 表达式必须实现 Disposable 接口（具有 [Symbol.dispose] 方法）
- await using 要求对象实现 AsyncDisposable（具有 [Symbol.asyncDispose] 方法）
- 当 using 声明所在的块作用域退出时，自动按声明的逆序调用 dispose
- 即使在抛出异常时也会执行 dispose（类似 finally）
```

*来源：TypeScript 5.2 Release Notes, ECMA-262 §34.2（Explicit Resource Management）*

#### 使用示例

```typescript
// ===== 同步资源释放 =====
{
  using file = openFile('data.txt');
  // file[Symbol.dispose]() 会在块结束时自动调用
  const content = file.read();
} // dispose 在这里调用

// ===== 异步资源释放 =====
async function processData() {
  await using conn = await createDatabaseConnection();
  // conn[Symbol.asyncDispose]() 会在块结束时自动 await 调用
  const result = await conn.query('SELECT * FROM users');
  return result;
} // asyncDispose 在这里调用

// ===== 自定义 Disposable 对象 =====
class TempFile implements Disposable {
  #path: string;

  constructor(path: string) {
    this.#path = path;
    // 创建临时文件...
  }

  [Symbol.dispose]() {
    // 清理临时文件
    fs.unlinkSync(this.#path);
    console.log(`Cleaned up ${this.#path}`);
  }
}

function doWork() {
  using file = new TempFile('/tmp/temp-123.txt');
  // 使用 file...
} // 自动调用 file[Symbol.dispose]()

// ===== 异常安全 =====
function riskyOperation() {
  using resource = acquireResource();
  throw new Error('Something went wrong');
  // resource[Symbol.dispose]() 仍会在抛出前调用
}
```

---

### 8.6 模块解析与类型剥离

#### 概念定义（形式化）

TypeScript 5.0+ 引入了 `verbatimModuleSyntax`，5.8 引入了 `erasableSyntaxOnly`。这两个标志在 Node.js 原生 TypeScript 支持（类型剥离 / type stripping）场景下尤为重要。

- **`verbatimModuleSyntax`**：强制使用 `import type` / `export type` 进行纯类型导入导出，禁止 TypeScript 自动删除（elide）或重写 import 语句。启用后，若导入仅用于类型位置但未标记 `type`，则报错。
- **`erasableSyntaxOnly`**（TS 5.8+）：禁止任何无法通过简单删除类型语法来转换为 JavaScript 的 TypeScript 特性（如 `enum`、命名空间、构造函数的参数属性、JSX、尖括号类型断言 `<T>val` 等）。它确保代码可以安全地通过 "type stripping" 运行，无需编译转换。

**语义边界：**

```
verbatimModuleSyntax:
  - 允许：import type { Foo } from './foo'
  - 报错：import { Foo } from './foo'  （若 Foo 仅用于类型）
  - 保证 import 语句在输出中保持不变（或被显式标记为 type-only）

erasableSyntaxOnly:
  - 允许：interface、type alias、as 断言、泛型参数标注
  - 报错：enum、namespace、constructor(public x: number)、JSX、<T>val
```

*来源：TypeScript 5.0 & 5.8 Release Notes, Node.js Type Stripping Documentation*

#### 配置示例

```json
// tsconfig.json — 推荐用于 Node.js 原生 TypeScript 执行
{
  "compilerOptions": {
    "target": "esnext",
    "module": "nodenext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "rewriteRelativeImportExtensions": true,
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

```typescript
// ===== verbatimModuleSyntax 示例 =====
// ❌ 错误：Foo 仅用于类型，但未标记 type
import { Foo } from './types';
function useFoo(foo: Foo) {}

// ✅ 正确
import type { Foo } from './types';
function useFoo(foo: Foo) {}

// ===== erasableSyntaxOnly 示例 =====
// ❌ 错误：enum 需要代码生成，不能通过类型剥离移除
enum Color { Red, Green, Blue }

// ❌ 错误：参数属性需要代码生成
class Point {
  constructor(public x: number, public y: number) {}
}

// ❌ 错误：尖括号断言语法与 JSX 冲突，无法安全擦除
const val = <string>someValue;

// ✅ 正确：as 断言可安全擦除
const val = someValue as string;
```

---

### 8.7 TypeScript 6.x 核心特性

TypeScript 6.0 于 **2026 年 3 月**正式发布，是 TypeScript 在 Go 重写（7.0）之前的最后一个主要 JavaScript 实现版本。该版本聚焦于 ES2025 标准对齐、Temporal API 类型支持、模块系统增强，以及为原生编译器过渡做准备。

#### 8.7.1 `es2025` target/lib 的语义

TypeScript 6.0 将以下已达 Stage 4 的 ECMAScript 特性从 `esnext` 定型到 `es2025`：

| 特性类别 | 具体 API | 规范来源 |
|---------|---------|---------|
| Promise 扩展 | `Promise.try()` | ECMA-262 §27.2.4.8 |
| 正则表达式 | `RegExp.escape()` | ECMA-262 §22.2.3 |
| Iterator 辅助方法 | `Iterator.prototype.map/filter/take/drop/flatMap/reduce/toArray` | ECMA-262 §27.1.4 |
| Set 数学方法 | `Set.prototype.union/intersection/difference/symmetricDifference/isSubsetOf/isSupersetOf/isDisjointFrom` | ECMA-262 §24.2.4 |
| 显式资源管理 | `Symbol.dispose`, `Symbol.asyncDispose` | ECMA-262 §19.4.2.10 |

**配置语义**：

```
target: "ES2025"  // 编译目标为 ES2025，保留上述原生 API 调用
lib: ["ES2025"]   // 类型声明包含上述 API 的类型定义
```

与 `"ESNext"` 的区别：`ES2025` 是固定的快照，保证编译后的代码在支持 ES2025 的运行时（Node.js 24+、现代浏览器）上可执行，而 `ESNext` 可能包含尚未稳定的实验性 API。

#### 8.7.2 Temporal API 类型：与 `Date` 的本质差异

Temporal 提案已达 **Stage 4**，作为 ECMAScript 2026 的确定成员，TypeScript 6.0 提供完整的类型声明。

**核心类型体系**：

| 类型 | 语义 | 与 `Date` 的差异 |
|------|------|-----------------|
| `Temporal.Instant` | 纳秒精度的绝对时间点 | `Date` 仅毫秒精度；`Instant` 无时区信息 |
| `Temporal.PlainDate` | 日历日期（年-月-日） | `Date` 混合了日期和时间；`PlainDate` 无时间分量 |
| `Temporal.PlainTime` |  wall-clock 时间 | 独立于日期的纯时间 |
| `Temporal.PlainDateTime` | 本地日期+时间 | 无时区，用于用户输入场景 |
| `Temporal.ZonedDateTime` | 带时区的完整日期时间 | 替代 `Date` 的最接近等价物，但时区感知 |
| `Temporal.Duration` | 时间长度/间隔 | 明确区分时间点和时间段 |

**不可变性与时区安全**：

```typescript
// Date 的问题：可变、时区不安全、精度不足
const d = new Date('2025-06-15T10:00:00');
d.setHours(12); // 修改了原对象！

// Temporal：不可变、显式时区处理
const date = Temporal.PlainDate.from('2025-06-15');
const nextDay = date.add({ days: 1 }); // 返回新对象，date 不变
// nextDay 为 2025-06-16，类型仍为 PlainDate

// 时区安全转换
const zoned = Temporal.Now.zonedDateTimeISO('Asia/Shanghai');
const instant = zoned.toInstant(); // 明确的时区剥离
const inTokyo = instant.toZonedDateTimeISO('Asia/Tokyo'); // 显式时区转换
```

**类型系统意义**：Temporal 的类型设计消除了 `Date` 的以下歧义：

1. 本地时间 vs UTC 的混淆 → 通过 `Plain*` vs `Zoned*` 类型分离
2. 时间点 vs 时间段的混淆 → `Instant`/`ZonedDateTime` vs `Duration`
3. 可变状态的副作用 → 所有对象不可变

#### 8.7.3 `#/` subpath imports：package.json `imports` 字段的解析语义

Node.js 支持在 `package.json` 中使用 `imports` 字段定义模块子路径映射，允许使用 `#` 前缀进行内部模块导入。TypeScript 6.0 增强了对该解析语义的支持。

**package.json 配置**：

```json
{
  "imports": {
    "#root/*": "./*",
    "#utils/*": "./src/utils/*",
    "#config": "./src/config/index.ts"
  }
}
```

**TypeScript 解析语义**：

```
解析规则（需配合 --moduleResolution bundler 或 nodenext）：
1. 以 "#" 开头的导入说明符被视为 subpath import
2. TypeScript 按照 Node.js 的解析算法查找 package.json 中的 "imports" 字段
3. 支持类型导入的解析：import type { Config } from '#config'
4. 路径映射后的文件扩展名处理遵循当前 moduleResolution 策略
```

**与 `paths` 配置的对比**：

| 特性 | `paths` (tsconfig) | `imports` (package.json) |
|------|-------------------|-------------------------|
| 适用范围 | TypeScript 编译时 | Node.js 运行时 + TypeScript |
| 消费者可见性 | 仅 TypeScript 感知 | 所有 ESM 消费者 |
| 条件导出 | 不支持 | 支持（development/production 等条件）|
| 子路径 | 需显式配置 | 支持通配符 |

**最佳实践**：库作者应优先使用 `package.json` 的 `imports` 而非 `tsconfig.json` 的 `paths`，以确保类型解析与运行时行为一致。

#### 8.7.4 `import defer`：延迟求值的精确语义与工程场景

`import defer` 是 TC39 Stage 3 提案，TypeScript 6.0 提供完整支持。它引入模块加载的**延迟求值（lazy evaluation）**机制。

**语法形式**：

```typescript
import defer * as heavyModule from './heavy-module';
```

**精确语义**：

```
语义模型：
1. 声明同步性：语法层面与常规 import 相同（模块顶层、同步声明）
2. 加载 vs 求值分离：
   - 加载（Fetch/Instantiate）：可能仍提前发生（宿主决定）
   - 求值（Evaluation）：延迟到首次访问命名空间属性时执行
3. 单次求值保证：遵循 ECMA-262 模块记录语义，仅执行一次
4. 类型系统处理：命名空间类型与常规 import * 完全一致
```

**与 `dynamic import()` 的本质区别**：

| 特性 | `import defer` | `dynamic import()` |
|------|----------------|-------------------|
| **语法位置** | 模块顶层声明 | 表达式，可在任意位置 |
| **返回类型** | 模块命名空间对象（同步）| Promise<Module>（异步）|
| **对调用链的影响** | 无需 async/await | 需要 async 上下文 |
| **求值触发时机** | 首次访问命名空间属性 | Promise 解决时 |
| **代码分割** | 由宿主决定 | 明确触发代码分割 |

**工程应用场景**：

```typescript
// 场景：CLI 工具，某些命令需要重型依赖
import defer * as heavyAnalyzer from './analyzer';
import { parseArgs } from './args';

async function main() {
  const args = parseArgs();

  if (args.command === 'analyze') {
    // 仅当执行 analyze 命令时才加载并求值 analyzer 模块
    const results = heavyAnalyzer.runAnalysis(args.input);
    console.log(results);
  }
  // 其他命令不会触发 heavyAnalyzer 的求值，减少启动时间
}
```

#### 8.7.5 方法推断改进：`this`-less functions 不再无条件被视为上下文敏感

TypeScript 6.0 引入了一项重要的类型推断精度优化：**无显式 `this` 参数声明的函数不再被无条件标记为上下文敏感（context-sensitive）**。这一改动从根本上改善了多位置联合推断场景下的泛型推断行为，减少了此前因过度上下文敏感化而导致的推断发散与类型宽泛化问题。

**问题背景：过度上下文敏感的代价**

在 TypeScript 5.x 及更早版本中，编译器对函数表达式的上下文敏感判定较为激进。当对象字面量中的多个属性均为函数类型，且这些函数需要共同推断一个泛型参数时，旧策略会将所有函数同时视为上下文敏感，导致每个函数独立参与推断，最终合并为过于宽泛的联合类型或回退到 unknown：

```typescript
// TS 5.x 推断行为示例
declare function createService<T>(handlers: {
  onStart: (ctx: T) => void;
  onStop: (ctx: T) => void;
}): T;

const svc = createService({
  onStart: (ctx) => ctx.init(),   // 推断源 A: { init(): void }
  onStop: (ctx) => ctx.cleanup(), // 推断源 B: { cleanup(): void }
});
// TS 5.x 中 svc 可能推断为 unknown，因为两个上下文敏感的推断源冲突
```

问题的根源在于：旧编译器将**所有**回调函数都视为上下文敏感，使得每个回调的参数类型都试图从自身函数体中独立推断 `T`，而不是由一个主导推断源确定 `T` 后再反向约束其他回调。

**改进语义：this-less 推断解耦**

TypeScript 6.0 的改进规则可概括为：

`
推断规则（简化）：

1. 若函数表达式无显式 this 参数标注，且未在函数体中引用 this
2. 则该函数不再无条件触发上下文敏感推断
3. 泛型参数 T 优先从非上下文敏感位置（如返回值、非函数属性）推断
4. 一旦 T 确定，函数参数的类型通过反向赋值检查绑定，而非独立推断
`

```typescript
// TS 6.0 改进后的行为
declare function configure<T>(options: {
  primary: () => T;
  handler: (value: T) => void;
}): T;

const cfg = configure({
  primary: () => ({ id: 1, name: 'app' }), // T 从此处优先推断
  handler: (value) => console.log(value.id), // value: { id: number; name: string }
});
// cfg 的类型为 { id: number; name: string }
```

在此示例中，primary 的返回类型首先确定了 T，随后 handler 的参数 `value` 被反向约束为 `T`，而不是从 `value`.id 的访问中独立推断 `T`。这消除了多源推断冲突，使得复杂配置对象的类型推断更加稳定。

**显式 `this` 标注的保留**

当函数显式声明了 `this` 参数类型时，它仍会被视为上下文敏感。这是因为 `this` 的绑定本质上完全由调用上下文决定，无法脱离上下文进行推断：

```typescript
interface ClickHandler {
  handle(this: HTMLElement, e: MouseEvent): void;
}

const btnHandler: ClickHandler = {
  handle(e) {
    // this: HTMLElement — 必须从 ClickHandler 上下文推断
    this.classList.add('active');
  }
};
```

此外，若函数体中实际使用了 `this`（即使未显式标注类型），编译器仍可能将其视为上下文敏感，以确保 `this` 类型的安全性。

**工程影响与最佳实践**

1. **减少显式泛型参数**：大量此前需要 `createService<ConcreteType>()` 的场景现在可正确推断
2. **降低 `as` 断言需求**：配置对象中的回调类型推断更稳定
3. **与 NoInfer<T> 的协同**：在需要精细控制推断源时，可结合 NoInfer<T> 明确排除特定位置的推断参与权
4. **完全向后兼容**：此改进仅放宽了推断限制，不会导致现有合法代码产生新的类型错误

```typescript
// 结合 NoInfer<T> 的精细控制（TS 5.4+）
declare function pipeline<T>(
  extract: () => T,
  transform: (v: NoInfer<T>) => T
): T;

pipeline(
  () => 'hello',
  (v) => v.toUpperCase() // v 被约束为 string，但 transform 的返回类型参与 T 的推断
);
```

*来源：TypeScript 6.0 Release Notes, PR #58716*

*来源：[TS 6.0 Release Notes], [TC39 Temporal Proposal Stage 4], [Node.js Subpath Imports Documentation], [TC39 import defer Proposal Stage 3]*

#### 使用示例

```typescript
// ===== es2025 target/lib =====
// TS 6.0 将以下 API 从 esnext 定型到 es2025：
// - RegExp.escape
// - Promise.try
// - Iterator.map / filter / take / drop / flatMap 等
// - Set.prototype.union / intersection / difference / symmetricDifference / isSubsetOf 等

// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2025",
    "lib": ["ES2025"]
  }
}

// ===== Temporal API 类型 =====
// Temporal 提案已达 Stage 4，TypeScript 6.0 提供完整类型声明

const now = Temporal.Now.instant(); // Instant — 纳秒精度、无时区时间点
const date = Temporal.PlainDate.from('2025-06-15'); // PlainDate — 日历日期，无时区
const zoned = Temporal.Now.zonedDateTimeISO('Asia/Shanghai');

// 与 Date 的本质差异：
// 1. 不可变性 — 所有 Temporal 对象不可变
const d1 = Temporal.PlainDate.from('2025-01-01');
const d2 = d1.add({ days: 1 }); // 返回新对象，d1 不变

// 2. 纳秒精度 — Instant 存储自 Unix 纪元以来的纳秒（bigint）
const ns = now.epochNanoseconds; // bigint

// 3. 时区安全 — PlainDate/PlainTime 与 ZonedDateTime 严格分离
// 4. 无 2038 年问题 — 使用 bigint 存储时间戳，不受 32 位限制

// ===== #/ subpath imports =====
// Node.js 在 package.json 中支持 "imports" 字段，允许使用 # 前缀进行子路径映射
// TypeScript 6.0 增强了对该解析语义的支持（配合 --moduleResolution bundler / nodenext）

// package.json
// {
//   "imports": {
//     "#root/*": "./*",
//     "#utils": "./src/utils/index.ts"
//   }
// }

// TypeScript 代码中可直接解析：
// import { helper } from '#utils';        // → ./src/utils/index.ts
// import type { Config } from '#root/config'; // → ./config

// ===== import defer =====
// TC39 Stage 3 提案，TypeScript 6.0 已支持
// 与 dynamic import() 的本质区别：同步句法、惰性求值

// 动态 import() — 运行时返回 Promise，异步加载
const mod = await import('./heavy-module');

// import defer — 同步句法，但模块求值延迟到首次访问命名空间属性时才执行
// import defer * as heavy from './heavy-module';
// heavy.someExport; // 首次访问此属性时，才执行该模块的求值（evaluation）

// 核心语义：
// - 语法位置与常规 import 相同（模块顶层）
// - 模块的加载（fetch/parse）仍可能提前发生，但 evaluation 被延迟
// - 首次访问模块命名空间的任何属性时，才触发模块求值
```

---

### 8.8 TypeScript 7.0 前瞻：Go 重写与 LSP 迁移

微软正在推进 **TypeScript 7.0 / Go 重写（代号 Corsa）** 这一重大工程。这是 TypeScript 自 2012 年发布以来最重大的架构变革。

#### 为什么从 JavaScript 迁移到 Go？

**根本动因**：当前的 JavaScript/TypeScript 实现的 `tsc` 受限于单线程事件循环，在超大型代码库（数百万行代码）上的类型检查性能已触及瓶颈。具体技术原因包括：

| 限制因素 | JavaScript/TypeScript 实现 | Go 实现的优势 |
|---------|--------------------------|--------------|
| **并发模型** | 单线程事件循环，无法利用多核 CPU | 原生 goroutine，轻松并行化类型检查 |
| **内存布局** | 动态类型和 GC 开销大 | 静态类型、值类型、更紧凑的内存布局 |
| **类型检查吞吐量** | 大型项目类型检查可达数十秒 | 目标 **10 倍性能提升**，实现秒级检查 |
| **增量检查** | 复杂依赖图的增量更新成本高 | 更激进的增量分析与缓存策略 |
| **编译器启动** | Node.js 启动开销 | 原生二进制，即时启动 |

**为什么不继续使用 JavaScript/TypeScript？**

- 类型检查算法本身是 CPU 密集型的，JavaScript 的异步 I/O 优势在此不适用
- 现有架构经过多年演进，并发改造成本不亚于重写
- Go 在编译器实现领域有成熟生态（如 Go 编译器本身、LSP 实现）

#### 对生态的影响

**1. JS 版 tsc 维护模式**

- JavaScript 版本的 `tsc` 将在 6.x 系列结束后进入**维护模式**
- 6.x 期间两个版本将并行维护，以保证生态平滑过渡
- 新语言特性将优先在 Go 版本中实现，JS 版本仅接收关键 bug 修复

**2. LSP 统一与编辑器集成变革**

语言服务（Language Service）将全面迁移至 **Language Server Protocol (LSP)**：

```
架构演进：
现在：编辑器插件 ←→ TypeScript 语言服务 API（紧密耦合）
      ↓
TS 7.0：编辑器插件 ←→ LSP ←→ Go 实现的 TypeScript 语言服务器
```

- **编辑器无关性**：任何支持 LSP 的编辑器（Vim、Emacs、Helix、Zed）都将获得一流的 TypeScript 支持
- **降低耦合度**：编辑器不再依赖 TypeScript 特定的 API，通过标准协议交互
- **性能提升**：语言服务器的响应速度将显著改善编辑器体验（自动完成、错误提示的延迟降低）

**3. 对开发者工具链的影响**

| 工具类型 | 影响 | 应对策略 |
|---------|------|---------|
| `tsc` CLI | 新的原生二进制 | 命令行参数保持兼容 |
| 构建工具（Vite、Webpack）| 需要适配新的编译器接口 | 社区已提前准备 |
| 代码分析工具（ESLint）| AST 格式可能变化 | 使用 `@typescript-eslint` 的抽象层 |
| 自定义 Transformer | 需要迁移到新的插件 API | 提前使用 `ts-morph` 等抽象库 |

**4. 源码级兼容保证**

微软多次强调，TypeScript 7.0 将保持**源码级向后兼容**：

- 现有 `.ts` 文件无需修改
- `tsconfig.json` 配置语义保持不变
- 类型系统行为完全一致（Go 重写是编译器工程革命，非类型理论革命）

**5. 时间线预测**

| 阶段 | 预计时间 | 里程碑 |
|------|---------|--------|
| 内部原型 | 2025 年 Q1-Q2 | Go 编译器核心验证 |
| 公共预览版 | 2025 年中 | 开发者可测试 Go 版本 |
| 完整语言服务 | 2025 年底 | LSP 功能完备，编辑器集成稳定 |
| Beta 发布 | 2026 年 Q1 | 主要功能完整 |
| 正式版 (7.0) | 2026 年 Q2-Q3 | 全面发布，JS 版进入维护模式 |

#### 为 TypeScript 7.0 做准备的建议

1. **启用 `isolatedModules` 和 `erasableSyntaxOnly`**：确保代码可被独立编译，与 Go 编译器的单文件处理模型兼容
2. **避免依赖 TypeScript 内部 API**：使用 `ts-morph` 等高级抽象而非直接操作 `ts` 模块内部
3. **关注 LSP 生态**：熟悉 Language Server Protocol 的工作原理，为新的编辑器体验做准备

*来源：[Microsoft Blog: TypeScript Native Port], [TypeScript Roadmap 2025]*

---

## 9. 类型系统深度解析

### 9.1 基础类型系统

#### 9.1.1 原始类型

```typescript
// ===== 基本原始类型 =====
let str: string = 'hello';
let num: number = 42;
let bool: boolean = true;
let nil: null = null;
let undef: undefined = undefined;
let sym: symbol = Symbol('key');
let big: bigint = 100n;

// ===== 字面量类型 =====
let literal: 'hello' = 'hello';  // 只能是 'hello'
let numLiteral: 42 = 42;          // 只能是 42
let boolLiteral: true = true;     // 只能是 true

// ===== any 类型 =====
let anything: any = 4;
anything = 'string';  // OK
anything.toFixed();   // OK (无类型检查)

// ===== unknown 类型 =====
let unknownValue: unknown = 4;
// unknownValue.toFixed();  // Error: 需要先类型检查
if (typeof unknownValue === 'number') {
  unknownValue.toFixed();  // OK
}

// ===== never 类型 =====
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}

// ===== void 类型 =====
function logMessage(message: string): void {
  console.log(message);
  // 可以没有 return 或 return undefined
}
```

#### 9.1.2 对象类型

```typescript
// ===== 对象字面量类型 =====
interface Person {
  name: string;
  age: number;
  email?: string;           // 可选属性
  readonly id: string;      // 只读属性
}

// ===== 索引签名 =====
interface Dictionary {
  [key: string]: number;    // 任意字符串键映射到 number
}

const dict: Dictionary = {
  a: 1,
  b: 2
};

// ===== 混合类型 =====
interface Counter {
  (start: number): string;  // 调用签名
  interval: number;         // 属性
  reset(): void;            // 方法
}

// ===== 类类型 =====
class Animal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  move(distance: number): void {
    console.log(`${this.name} moved ${distance}m`);
  }
}

interface Dog extends Animal {
  breed: string;
  bark(): void;
}
```

---

### 9.2 联合类型与交叉类型

#### 9.2.1 联合类型 (Union Types)

```typescript
// ===== 基本联合类型 =====
type StringOrNumber = string | number;
let value: StringOrNumber = 'hello';
value = 42;  // OK

// ===== 可辨识联合类型 =====
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'rectangle'; width: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.side ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    default:
      // 穷尽检查
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

// ===== 字面量联合类型 =====
type Status = 'pending' | 'loading' | 'success' | 'error';
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// ===== null/undefined 联合 =====
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type Maybe<T> = T | null | undefined;
```

#### 9.2.2 交叉类型 (Intersection Types)

```typescript
// ===== 基本交叉类型 =====
interface ErrorHandling {
  success: boolean;
  error?: string;
}

interface ArtworksData {
  artworks: { title: string }[];
}

type ArtworksResponse = ArtworksData & ErrorHandling;

const response: ArtworksResponse = {
  artworks: [{ title: 'Mona Lisa' }],
  success: true
};

// ===== 同名属性的交叉 =====
interface A { x: string; }
interface B { x: number; }
type AB = A & B;  // x: never (冲突)
```

---

### 9.3 条件类型

#### 9.3.1 基本条件类型

```typescript
// ===== 基本语法 =====
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;   // true
type B = IsString<number>;   // false

// ===== 分布式条件类型 =====
type ToArray<T> = T extends any ? T[] : never;

type StrOrNumArray = ToArray<string | number>;
// string[] | number[] (分布式)

// 阻止分布
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type ArrayOfUnion = ToArrayNonDist<string | number>;
// (string | number)[]

// ===== infer 关键字 =====
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

type Fn = (x: number, y: string) => boolean;
type FnReturn = ReturnType<Fn>;    // boolean
type FnParams = Parameters<Fn>;    // [number, string]

// ===== 递归条件类型 =====
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

// ===== 条件类型链 =====
type TypeName<T> =
  T extends string ? 'string' :
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  T extends undefined ? 'undefined' :
  T extends Function ? 'function' :
  'object';
```

#### 9.3.2 内置条件类型

```typescript
// ===== Exclude / Extract =====
type T0 = Exclude<'a' | 'b' | 'c', 'a'>;           // 'b' | 'c'
type T1 = Extract<'a' | 'b' | 'c', 'a' | 'f'>;     // 'a'

// ===== NonNullable =====
type T2 = NonNullable<string | number | undefined>;  // string | number

// ===== Parameters / ReturnType =====
declare function f1(arg: { a: number; b: string }): void;
type T3 = Parameters<typeof f1>;    // [{ a: number; b: string }]
type T4 = ReturnType<typeof f1>;    // void

// ===== InstanceType =====
class C {
  x = 0;
  y = 0;
}
type T5 = InstanceType<typeof C>;   // C

// ===== ThisParameterType / OmitThisParameter =====
function toHex(this: Number) {
  return this.toString(16);
}
type T6 = ThisParameterType<typeof toHex>;      // Number
type T7 = OmitThisParameter<typeof toHex>;      // () => string

// ===== ThisType =====
type ObjectDescriptor<D, M> = {
  data?: D;
  methods?: M & ThisType<D & M>;
};

function makeObject<D, M>(desc: ObjectDescriptor<D, M>): D & M {
  const data: object = desc.data || {};
  const methods: object = desc.methods || {};
  return { ...data, ...methods } as D & M;
}

const obj = makeObject({
  data: { x: 0, y: 0 },
  methods: {
    moveBy(dx: number, dy: number) {
      this.x += dx;  // this 被推断为 { x: number; y: number } & { moveBy: ... }
      this.y += dy;
    }
  }
});
```

---

### 9.4 映射类型

#### 9.4.1 基本映射类型

```typescript
// ===== 基础映射 =====
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];  // -? 移除可选性
};

type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Record<K extends keyof any, T> = {
  [P in K]: T;
};

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

// ===== 键重映射 =====
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// {
//   getName: () => string;
//   getAge: () => number;
// }

// ===== 过滤键 =====
type RemoveKindField<T> = {
  [K in keyof T as Exclude<K, 'kind'>]: T[K];
};

interface Circle {
  kind: 'circle';
  radius: number;
}

type KindlessCircle = RemoveKindField<Circle>;
// { radius: number }
```

#### 9.4.2 高级映射模式

```typescript
// ===== 深度映射 =====
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ===== 事件处理器映射 =====
type EventHandlers<Events extends Record<string, any>> = {
  [K in keyof Events as `on${Capitalize<string & K>}`]:
    (payload: Events[K]) => void;
};

interface UserEvents {
  login: { userId: string };
  logout: { userId: string };
  update: { userId: string; data: Partial<User> };
}

type UserEventHandlers = EventHandlers<UserEvents>;
// {
//   onLogin: (payload: { userId: string }) => void;
//   onLogout: (payload: { userId: string }) => void;
//   onUpdate: (payload: { userId: string; data: Partial<User> }) => void;
// }

// ===== 路径类型 =====
type Path<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? `${K}` | `${K}.${Path<T[K]>}`
    : `${K}`
  : never;

interface Nested {
  a: {
    b: {
      c: string;
    };
    d: number;
  };
  e: boolean;
}

type NestedPaths = Path<Nested>;
// 'a' | 'a.b' | 'a.b.c' | 'a.d' | 'e'

// ===== 路径值类型 =====
type PathValue<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? PathValue<T[K], Rest>
      : never
    : P extends keyof T
    ? T[P]
    : never;

type CType = PathValue<Nested, 'a.b.c'>;  // string
```

---

### 9.5 模板字面量类型

#### 9.5.1 基本模板字面量类型

```typescript
// ===== 字符串模板 =====
type World = 'world';
type Greeting = `hello ${World}`;  // 'hello world'

// ===== 联合类型展开 =====
type Color = 'red' | 'green' | 'blue';
type Size = 'small' | 'medium' | 'large';
type Style = `${Color}-${Size}`;
// 'red-small' | 'red-medium' | 'red-large' |
// 'green-small' | 'green-medium' | 'green-large' |
// 'blue-small' | 'blue-medium' | 'blue-large'

// ===== 内置字符串操作类型 =====
type T1 = Uppercase<'hello'>;      // 'HELLO'
type T2 = Lowercase<'WORLD'>;      // 'world'
type T3 = Capitalize<'hello'>;     // 'Hello'
type T4 = Uncapitalize<'Hello'>;   // 'hello'
```

#### 9.5.2 高级模板字面量模式

```typescript
// ===== CSS 属性类型 =====
type CSSUnit = 'px' | 'em' | 'rem' | '%';
type CSSValue = number | `${number}${CSSUnit}`;

interface CSSProperties {
  width: CSSValue;
  height: CSSValue;
  margin: CSSValue | `${CSSValue} ${CSSValue}` |
          `${CSSValue} ${CSSValue} ${CSSValue}` |
          `${CSSValue} ${CSSValue} ${CSSValue} ${CSSValue}`;
}

// ===== 路由参数提取 =====
type ExtractParams<T extends string> =
  T extends `${infer Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<Rest>]: string }
    : T extends `${infer Start}:${infer Param}`
    ? { [K in Param]: string }
    : {};

type UserRoute = ExtractParams<'/users/:id/posts/:postId'>;
// { id: string; postId: string }

// ===== 事件名称模式 =====
type EventName<T extends string> = `on${Capitalize<T>}`;

type MouseEvents = 'click' | 'dblclick' | 'mousedown' | 'mouseup';
type MouseEventHandlers = {
  [K in MouseEvents as EventName<K>]: (event: MouseEvent) => void;
};
// {
//   onClick: (event: MouseEvent) => void;
//   onDblclick: (event: MouseEvent) => void;
//   ...
// }
```

---

### 9.6 类型推断与类型守卫

#### 9.6.1 类型推断

```typescript
// ===== 变量类型推断 =====
let x = 3;           // number
let y = 'hello';     // string
let z = [1, 2, 3];   // number[]

// ===== 上下文类型推断 =====
window.onmousedown = function(event) {
  console.log(event.button);  // event 被推断为 MouseEvent
};

// ===== 最佳通用类型 =====
let arr = [0, 1, null];  // (number | null)[]

// ===== 上下文类型 =====
class Animal {
  move() {}
}
class Dog extends Animal {
  woof() {}
}

let createAnimal: () => Animal;
createAnimal = () => new Dog();  // OK，返回类型兼容

// ===== 泛型类型推断 =====
function identity<T>(arg: T): T {
  return arg;
}

let output = identity('myString');  // T 被推断为 'myString'
let output2 = identity<string>('myString');  // 显式指定

// ===== 复杂推断 =====
function map<T, U>(array: T[], fn: (item: T) => U): U[] {
  return array.map(fn);
}

const numbers = [1, 2, 3];
const strings = map(numbers, n => n.toString());
// U 被推断为 string
```

#### 9.6.2 类型守卫

```typescript
// ===== typeof 类型守卫 =====
function padLeft(value: string | number, padding: string | number) {
  if (typeof padding === 'number') {
    return Array(padding + 1).join(' ') + value;  // padding: number
  }
  if (typeof padding === 'string') {
    return padding + value;  // padding: string
  }
  throw new Error(`Expected string or number, got '${padding}'`);
}

// ===== instanceof 类型守卫 =====
class SpaceRepeatingPadder {
  constructor(private numSpaces: number) {}
  getPaddingString() {
    return Array(this.numSpaces + 1).join(' ');
  }
}

class StringPadder {
  constructor(private value: string) {}
  getPaddingString() {
    return this.value;
  }
}

function getRandomPadder() {
  return Math.random() < 0.5
    ? new SpaceRepeatingPadder(4)
    : new StringPadder('  ');
}

const padder = getRandomPadder();
if (padder instanceof SpaceRepeatingPadder) {
  padder;  // SpaceRepeatingPadder
}
if (padder instanceof StringPadder) {
  padder;  // StringPadder
}

// ===== in 类型守卫 =====
interface Fish {
  swim: () => void;
}

interface Bird {
  fly: () => void;
}

function move(animal: Fish | Bird) {
  if ('swim' in animal) {
    return animal.swim();  // animal: Fish
  }
  return animal.fly();     // animal: Bird
}

// ===== 自定义类型守卫 (类型谓词) =====
function isFish(animal: Fish | Bird): animal is Fish {
  return (animal as Fish).swim !== undefined;
}

function zoo(animal: Fish | Bird) {
  if (isFish(animal)) {
    animal.swim();  // animal: Fish
  } else {
    animal.fly();   // animal: Bird
  }
}

// ===== 可辨识联合类型守卫 =====
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'rectangle'; width: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.side ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    default:
      // 穷尽检查
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}

// ===== 断言函数 =====
function assertIsString(val: any): asserts val is string {
  if (typeof val !== 'string') {
    throw new Error('Not a string!');
  }
}

function assertNonNull<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error('Value is null or undefined!');
  }
}

function handleInput(input: string | undefined) {
  assertNonNull(input);  // 此后 input 类型为 string
  console.log(input.toUpperCase());
}
```

---

### 9.7 类型谓词与类型断言

#### 9.7.1 类型谓词详解

```typescript
// ===== 基本类型谓词 =====
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

function isArrayOf<T>(
  value: unknown,
  itemCheck: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(itemCheck);
}

// ===== 复杂类型谓词 =====
interface User {
  id: string;
  name: string;
  email: string;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value &&
    typeof (value as User).id === 'string' &&
    typeof (value as User).name === 'string' &&
    typeof (value as User).email === 'string'
  );
}

// ===== 泛型类型谓词 =====
function hasProperty<T extends string>(
  obj: object,
  prop: T
): obj is Record<T, unknown> {
  return prop in obj;
}

const data: object = { name: 'John', age: 30 };
if (hasProperty(data, 'name')) {
  console.log(data.name);  // OK，data 被推断为 Record<'name', unknown>
}

// ===== 联合类型谓词 =====
type Status = 'loading' | 'success' | 'error';

function isValidStatus(value: string): value is Status {
  return ['loading', 'success', 'error'].includes(value as Status);
}
```

#### 9.7.2 类型断言

```typescript
// ===== 基本类型断言 =====
let someValue: unknown = 'this is a string';
let strLength: number = (someValue as string).length;
// 或者使用尖括号语法（在 JSX 中不推荐）
let strLength2: number = (<string>someValue).length;

// ===== 双重断言 =====
// 当类型完全不兼容时使用
let value = 'hello' as unknown as number;  // 谨慎使用！

// ===== const 断言 =====
let arr = [1, 2, 3] as const;
// arr 类型为 readonly [1, 2, 3]

let obj = { x: 10, y: 20 } as const;
// obj 类型为 { readonly x: 10; readonly y: 20 }

// ===== satisfies 关键字 =====
const config = {
  host: 'localhost',
  port: 3000
} satisfies Record<string, string | number>;

// config.host 类型为 'localhost' (字面量类型)
// 而不是 string | number

// ===== 非空断言 =====
function processNullable(value: string | null | undefined) {
  // 使用非空断言（当你确定值不为 null/undefined 时）
  const length = value!.length;  // 告诉编译器 value 不为 null

  // 更安全的做法是先检查
  if (value) {
    const length2 = value.length;  // OK，value 被收窄为 string
  }
}
```

---

### 9.8 逆变、协变、双变与不变

#### 9.8.1 类型系统变型理论

TypeScript 采用**结构类型系统（structural typing）**。在结构子类型关系中，复合类型的变型（variance）取决于其组成部分的变型位置：

- **协变（Covariant）**：若 `A <: B`，则 `F<A> <: F<B>`。子类型关系与复合类型同向。
- **逆变（Contravariant）**：若 `A <: B`，则 `F<B> <: F<A>`。子类型关系与复合类型反向。
- **双变（Bivariant）**：同时允许协变和逆变。
- **不变（Invariant）**：既不允许协变也不允许逆变，要求类型完全一致。

在 TypeScript 中：

- **返回值位置是协变的**：如果函数 `f` 的返回类型是 `Dog`，函数 `g` 的返回类型是 `Animal`，且 `Dog <: Animal`，则 `f` 可以赋值给期望返回 `Animal` 的位置。
- **参数位置是逆变的**：如果期望一个接收 `Animal` 参数的函数，那么一个接收 `Dog` 参数的函数**不能**安全赋值给它（因为调用者可能传入 `Cat`）。反之，一个接收 `Animal` 参数的函数可以赋值给期望接收 `Dog` 参数的位置。
- **属性读取位置是协变的**：`{ get(): T }` 中 `T` 是协变的。
- **属性写入位置是逆变的**：`{ set(value: T): void }` 中 `T` 是逆变的。

**关键设计权衡**：TypeScript 在**方法参数位置默认采用双变（bivariant）**。这是为了兼容大量现有 JavaScript 代码（如 EventHandler 接口），而非类型理论的必然结果。开启 `strictFunctionTypes` 后，函数类型参数变为严格的逆变，但**对象属性中的方法参数仍保持双变**。
*来源：TypeScript Handbook — Type Compatibility, PR #18654*

```typescript
// ===== 协变示例：数组元素 =====
interface Animal {
  name: string;
}

interface Dog extends Animal {
  bark(): void;
}

declare let animals: Animal[];
declare let dogs: Dog[];

animals = dogs;  // OK: Dog[] <: Animal[] (数组元素协变)

// ===== 逆变示例：函数参数 =====
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

let handleAnimal: AnimalHandler = (animal) => console.log(animal.name);
let handleDog: DogHandler = (dog) => dog.bark();

handleDog = handleAnimal;  // OK: AnimalHandler <: DogHandler (参数逆变)
// handleAnimal = handleDog;  // Error! (strictFunctionTypes 开启时)

// ===== 对象属性：方法参数的双变行为 =====
interface Comparator<T> {
  compare(a: T, b: T): number;  // 方法参数默认双变
}

let animalComparator: Comparator<Animal> = {
  compare(a, b) { return a.name.localeCompare(b.name); }
};

let dogComparator: Comparator<Dog> = {
  compare(a, b) { return a.bark.length - b.bark.length; }
};

// 在默认配置下，以下赋值双向都通过（双变），即使理论上不安全
animalComparator = dogComparator;  // 默认允许
dogComparator = animalComparator;  // 默认允许
// 若开启 strictFunctionTypes，部分场景会收紧，但方法属性仍保持双变

// ===== 显式变型注解（TypeScript 4.7+） =====
interface Producer<out T> {
  produce(): T;
}

interface Consumer<in T> {
  consume(value: T): void;
}

interface Processor<in T, out U> {
  process(value: T): U;
}

// out = 协变位置（输出）
// in = 逆变位置（输入）
```

#### 9.8.2 变型在实际代码中的影响

```typescript
// ===== 常见陷阱 =====
// 1. 数组协变的问题
let dogs: Dog[] = [{ name: 'Rex', bark: () => {} }];
let animals: Animal[] = dogs;  // OK，协变
animals.push({ name: 'Cat' });  // 编译通过，但 dogs 中现在有了非 Dog！

// 2. 函数参数逆变
function trainDog(dog: Dog) { /* ... */ }
function trainAnimal(animal: Animal) { /* ... */ }

type Trainer = (animal: Animal) => void;
let trainer: Trainer = trainDog;  // strictFunctionTypes 开启时报错

// ===== 解决方案 =====
// 1. 使用 readonly 数组
let readonlyDogs: readonly Dog[] = [{ name: 'Rex', bark: () => {} }];
let readonlyAnimals: readonly Animal[] = readonlyDogs;  // OK
// readonlyAnimals.push(...);  // 编译错误

// 2. 显式变型注解
interface ReadOnlyContainer<out T> {
  getValue(): T;
}

interface WriteOnlyContainer<in T> {
  setValue(value: T): void;
}

// ===== strictFunctionTypes 的影响 =====
// 开启前：
// let f: (x: Animal) => void = (x: Dog) => {}; // 可能通过（双变）

// 开启后：
// let f: (x: Animal) => void = (x: Dog) => {}; // Error: 参数位置要求逆变

// 但注意：对象字面量中的方法声明仍可能保持双变
interface EventHandler<T> {
  handle(event: T): void;  // 方法，默认双变
}
```

---

## 10. 形式化类型理论

### 10.1 类型系统的形式化定义

#### 10.1.1 类型判断规则

以下采用自然演绎风格描述类型系统的基本规则：

```
变量规则:
  Γ ⊢ x : T    (如果 x:T ∈ Γ)

常量规则:
  Γ ⊢ c : T    (如果 c 有类型 T)

函数抽象:
  Γ, x:T₁ ⊢ e : T₂
  ────────────────────
  Γ ⊢ λx:T₁.e : T₁ → T₂

函数应用:
  Γ ⊢ f : T₁ → T₂    Γ ⊢ a : T₁
  ───────────────────────────────
  Γ ⊢ f(a) : T₂

子类型规则:
  Γ ⊢ e : S    S <: T
  ────────────────────
  Γ ⊢ e : T
```

#### 10.1.2 TypeScript 类型关系的形式化

```typescript
// ===== 子类型关系 =====
// S <: T 表示 S 是 T 的子类型

// 宽度子类型（对象）
interface Animal { name: string }
interface Dog extends Animal { bark(): void }
// Dog <: Animal

// 函数子类型（参数逆变，返回协变）
// (T₁ → T₂) <: (S₁ → S₂) 当且仅当 S₁ <: T₁ 且 T₂ <: S₂
// 这是 Liskov 替换原则（LSP）在函数类型上的直接推论
// 来源：Pierce, "Types and Programming Languages", §15.3

// 数组/元组子类型
// readonly T[] <: readonly U[] 当且仅当 T <: U (协变)
// [T₁, T₂] <: [U₁, U₂] 当且仅当 T₁ <: U₁ 且 T₂ <: U₂

// ===== 类型等价 =====
// S ≡ T 表示 S 和 T 是等价的类型

// 结构等价（TypeScript 使用）
interface Point1 { x: number; y: number }
interface Point2 { x: number; y: number }
// Point1 ≡ Point2 (结构等价)

// ===== 最具体类型 =====
// 字面量类型比基础类型更具体
// 'hello' <: string
// 42 <: number
// true <: boolean
```

### 10.2 类型推断的形式化

#### 10.2.1 基于约束求解的类型推断

**重要纠正**：TypeScript 的类型推断**并非**"Hindley-Milner 算法的扩展版本"。TypeScript 使用的是**基于约束求解的类型推断（constraint-based type inference）**。
*来源：TypeScript Design Goals & Handbook, Microsoft TypeScript Team Blog*

在基于约束求解的框架中，类型推断过程如下：

1. **引入类型变量**：对每个泛型参数 `T`，引入一个待定的类型变量。
2. **收集约束**：在类型检查过程中，每当发现某个值必须可赋值给 `T`（或 `T` 必须可赋值给某个类型），就生成一个约束。
3. **求解约束集**：使用 TypeScript 的**最佳通用类型（best common type）**算法和**结构化子类型规则**来求解约束集，得到 `T` 的具体类型。

```typescript
// ===== 示例推断过程 =====
function identity<T>(x: T): T {
  return x;
}

const result = identity('hello');
// 推断过程：
// 1. 调用 identity('hello')
// 2. 'hello' 的类型是 'hello' (字面量类型)
// 3. 约束：'hello' <: T
// 4. TypeScript 选择最精确解：T = 'hello'
// 5. 结果类型：'hello'

// ===== 多态推断 =====
function map<T, U>(array: T[], fn: (x: T) => U): U[] {
  return array.map(fn);
}

const nums = [1, 2, 3];
const strs = map(nums, n => n.toString());
// 推断过程：
// 1. nums: number[]
// 2. fn: (n: number) => string
// 3. 约束：number <: T, string <: U
// 4. 结果：T = number, U = string
// 5. 结果类型：string[]

// ===== 上下文类型推断 =====
window.onmousedown = function(event) {
  // event 从上下文推断为 MouseEvent
};
```

#### 10.2.2 与 Hindley-Milner 的核心区别

| 特性 | Hindley-Milner | TypeScript 约束求解 |
|------|----------------|---------------------|
| **完备性** | 具有**主类型（principal type）**：对任意表达式，存在最一般的类型 | **不保证主类型**：可能存在多个不可比较的最佳候选 |
| **联合类型** | 通常不支持（ML 风格） | **原生支持**：推断结果可以是联合类型 |
| **子类型** | 基于参数多态（parametric polymorphism），无子类型 | **基于结构子类型**：推断受子类型约束影响 |
| **类型断言** | 不允许 | **允许 `as`**，可绕过推断 |
| **any/unknown** | 无对应概念 | **支持**，影响推断的可靠性 |
| **上下文敏感性** | 有限 | **强上下文敏感**：大量依赖上下文类型 |

*来源：TypeScript Compiler Internals, "How TypeScript's Type Inference Works"; Pierce, TAPL §22.3*

### 10.3 条件类型的形式化

#### 10.3.1 条件类型求值规则

```
条件类型求值：

基本规则:
T extends U ? X : Y

分布规则:
(A | B) extends U ? X : Y
  ⟹ (A extends U ? X : Y) | (B extends U ? X : Y)

[T] extends [U] ? X : Y  (非分布)
  ⟹ 直接求值，不展开联合类型

infer 规则:
T extends infer X ? F<X> : Y
  ⟹ X 被推断为 T 的最具体类型

递归规则:
type Rec<T> = T extends Base ? T : Rec<Sub<T>>;
  ⟹ 递归展开直到满足条件
```

#### 10.3.2 条件类型推导示例

```typescript
// ===== 推导 ReturnType =====
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 推导 ReturnType<(x: number) => string>:
// 1. (x: number) => string extends (...args: any[]) => infer R
// 2. 匹配成功，R 被推断为 string
// 3. 结果：string

// ===== 推导 Parameters =====
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// 推导 Parameters<(x: number, y: string) => void>:
// 1. 匹配成功，P 被推断为 [number, string]
// 2. 结果：[number, string]

// ===== 递归条件类型 =====
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

// 推导 DeepReadonly<{ a: { b: number } }>:
// 1. T = { a: { b: number } }
// 2. { b: number } extends object ? true
// 3. 递归：DeepReadonly<{ b: number }>
// 4. number extends object ? false
// 5. 结果：{ readonly a: { readonly b: number } }
```

### 10.4 类型系统可靠性分析

#### 10.4.1 类型安全边界

在形式化类型理论中，**类型安全定理（Type Safety）**通常表述为：

> 如果 `⊢ e : T`（表达式 `e` 有类型 `T`），那么：
>
> 1. **进度（Progress）**：`e` 是一个值，或者存在一个 `e'` 使得 `e → e'`
> 2. **保持（Preservation）**：如果 `e → e'`，那么 `⊢ e' : T`

TypeScript **不保证**上述定理的严格成立，因为它是**设计为对 JavaScript 进行可选类型检查的超集**，而非一个独立的、封闭的类型安全语言。TypeScript 的类型系统可以被描述为：

- **结构上有意图的（Structurally Intentional）**：类型检查器尽量捕获常见的运行时错误模式。
- **非可靠的（Not Sound）**：存在多种合法的 TypeScript 程序会在运行时抛出类型相关的错误。

*来源：TypeScript Design Goals §1, §6; "TypeScript and Soundness" — Anders Hejlsberg*

#### 10.4.2 类型系统限制

```typescript
// ===== 类型系统的不完备性 =====

// 1. any 类型破坏类型安全
let x: any = 'string';
x.toFixed();  // 编译通过，运行时错误

// 2. 类型断言可以绕过检查
let y = 'hello' as unknown as number;
y.toFixed();  // 编译通过，运行时错误

// 3. 数组协变问题
interface Animal { name: string }
interface Dog extends Animal { bark(): void }

let dogs: Dog[] = [];
let animals: Animal[] = dogs;  // 协变允许
animals.push({ name: 'Cat' });  // dogs 中现在有非 Dog！

// 4. 可选属性与 undefined
interface Config {
  value?: number;
}
const config: Config = {};
// config.value 类型为 number | undefined
// 但 TypeScript 允许直接访问

// ===== 严格模式改进 =====
// strictNullChecks: 强制处理 null/undefined
// strictFunctionTypes: 函数参数严格的逆变检查
// strictPropertyInitialization: 属性初始化检查
// noImplicitAny: 禁止隐式 any
// noImplicitReturns: 函数必须有返回

// ===== 类型安全最佳实践 =====
// 1. 启用所有严格选项
// 2. 避免使用 any
// 3. 谨慎使用类型断言
// 4. 使用 unknown 替代 any
// 5. 使用 readonly 防止意外修改
// 6. 使用类型守卫进行运行时检查
```

---

## 附录

### A. 类型速查表

```typescript
// ===== 常用工具类型 =====
type Partial<T> = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
type Record<K extends keyof any, T> = { [P in K]: T };
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type NonNullable<T> = T extends null | undefined ? never : T;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type InstanceType<T> = T extends new (...args: any[]) => infer R ? R : never;

// ===== 新增工具类型 =====
type NoInfer<T> = intrinsic;  // TS 5.4+

// ===== 条件类型工具 =====
type IsNever<T> = [T] extends [never] ? true : false;
type IsAny<T> = 0 extends (1 & T) ? true : false;
type IsUnknown<T> = unknown extends T ? true : false;
type IsEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;

// ===== 数组/元组工具 =====
type Head<T> = T extends [infer H, ...infer _] ? H : never;
type Tail<T> = T extends [infer _, ...infer R] ? R : never;
type Last<T> = T extends [...infer _, infer L] ? L : never;
type Length<T extends readonly any[]> = T['length'];
type Prepend<T, Arr extends readonly any[]> = [T, ...Arr];
type Reverse<T extends readonly any[]> = T extends
  [infer F, ...infer R] ? [...Reverse<R>, F] : [];

// ===== 对象路径工具 =====
type Path<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? K | `${K}.${Path<T[K]>}`
    : K
  : never;

type PathValue<T, P extends string> = P extends `${infer K}.${infer R}`
  ? K extends keyof T ? PathValue<T[K], R> : never
  : P extends keyof T ? T[P] : never;
```

### B. ES 版本特性对照表

| 特性 | ES2020 | ES2021 | ES2022 | ES2023 | ES2024 | ES2025 | ES2026(Stage 3/4) |
|------|--------|--------|--------|--------|--------|--------|-------------------|
| BigInt | ✓ | | | | | | |
| Promise.allSettled | ✓ | | | | | | |
| globalThis | ✓ | | | | | | |
| 可选链 ?. | ✓ | | | | | | |
| 空值合并 ?? | ✓ | | | | | | |
| 动态 import() | ✓ | | | | | | |
| Promise.any | | ✓ | | | | | |
| WeakRef | | ✓ | | | | | |
| 逻辑赋值 ||=/&&=/??= | | ✓ | | | | | |
| 数字分隔符 | | ✓ | | | | | |
| replaceAll | | ✓ | | | | | |
| Class 私有字段 | | | ✓ | | | | |
| Class 静态块 | | | ✓ | | | | |
| at() | | | ✓ | | | | |
| Object.hasOwn() | | | ✓ | | | | |
| Error cause | | | ✓ | | | | |
| toSorted/toReversed | | | | ✓ | | | |
| toSpliced/with | | | | ✓ | | | |
| findLast/findLastIndex | | | | ✓ | | | |
| Hashbang | | | | ✓ | | | |
| Object.groupBy | | | | | ✓ | | |
| Map.groupBy | | | | | ✓ | | |
| Promise.withResolvers | | | | | ✓ | | |
| isWellFormed/toWellFormed | | | | | ✓ | | |
| RegExp v flag | | | | | ✓ | | |
| Atomics.pause | | | | | | | ✓ |
| Iterator helpers | | | | | | ✓ | |
| Set 数学方法 | | | | | | ✓ | |
| RegExp.escape | | | | | | ✓ | |
| 重复命名捕获组 | | | | | | ✓ | |
| 正则内联标志 | | | | | | ✓ | |
| Promise.try | | | | | | ✓ | |
| Import Attributes | | | | | | ✓ | |
| Float16Array | | | | | | ✓ | |
| Explicit Resource Management (using) | | | | | | ✓ | |
| Temporal API | | | | | | | ✓ |
| import defer | | | | | | | ✓ |
| Decorators | | | | | | | ✓ |
| Joint Iteration | | | | | | | ✓ |

---

*文档结束*
