# JavaScript/TypeScript 语言核心特性全览

> 版本范围：ES2020-ES2024 (ES15-ES15) + TypeScript 5.x
> 最后更新：2024年

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
      - [形式化推理论证](#形式化推理论证)
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
  - [7. Stage 3 提案预览](#7-stage-3-提案预览)
    - [7.1 装饰器 (Decorators)](#71-装饰器-decorators)
      - [概念定义（形式化）](#概念定义形式化-22)
      - [使用示例](#使用示例-22)
    - [7.2 Records \& Tuples](#72-records--tuples)
      - [概念定义（形式化）](#概念定义形式化-23)
      - [使用示例](#使用示例-23)
    - [7.3 Pattern Matching](#73-pattern-matching)
      - [概念定义（形式化）](#概念定义形式化-24)
      - [使用示例](#使用示例-24)
  - [8. TypeScript 5.x 核心特性](#8-typescript-5x-核心特性)
    - [8.1 装饰器元数据 (Decorator Metadata)](#81-装饰器元数据-decorator-metadata)
      - [概念定义（形式化）](#概念定义形式化-25)
      - [使用示例](#使用示例-25)
    - [8.2 const 类型参数](#82-const-类型参数)
      - [概念定义（形式化）](#概念定义形式化-26)
      - [使用示例](#使用示例-26)
    - [8.3 更好的 infer 和 extends 约束推断](#83-更好的-infer-和-extends-约束推断)
      - [概念定义（形式化）](#概念定义形式化-27)
      - [使用示例](#使用示例-27)
    - [8.4 JSDoc 增强](#84-jsdoc-增强)
      - [概念定义（形式化）](#概念定义形式化-28)
      - [使用示例](#使用示例-28)
    - [8.5 模块解析策略](#85-模块解析策略)
      - [概念定义（形式化）](#概念定义形式化-29)
      - [配置示例](#配置示例)
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
      - [10.2.1 Hindley-Milner 类型推断](#1021-hindley-milner-类型推断)
    - [10.3 条件类型的形式化](#103-条件类型的形式化)
      - [10.3.1 条件类型求值规则](#1031-条件类型求值规则)
      - [10.3.2 条件类型推导示例](#1032-条件类型推导示例)
    - [10.4 类型系统完备性分析](#104-类型系统完备性分析)
      - [10.4.1 类型安全定理](#1041-类型安全定理)
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
ES2024 (ES15)   → 2024年6月  → Array分组, Promise.withResolvers
```

### 1.2 特性分类矩阵

| 类别 | ES2020 | ES2021 | ES2022 | ES2023 | ES2024 |
|------|--------|--------|--------|--------|--------|
| 数据类型 | BigInt | - | - | - | - |
| 异步编程 | allSettled | any, WeakRef | - | - | withResolvers |
| 数组操作 | - | - | at() | toSorted等 | groupBy |
| 对象操作 | globalThis | - | hasOwn() | - | - |
| 类相关 | - | - | 私有字段 | - | - |
| 字符串 | - | replaceAll | - | - | isWellFormed |

---

## 2. ES2020 特性详解

### 2.1 BigInt - 任意精度整数

#### 概念定义（形式化）

**BigInt** 是 JavaScript 的第七种原始数据类型，表示任意精度的整数。

**形式化定义：**

```
BigInt ∈ PrimitiveType
BigInt = { n | n ∈ ℤ, |n| < 2^(2^53 - 1) }  // 理论上无上限
```

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

#### 形式化推理论证

**定理：** BigInt 运算结果仍为 BigInt（类型封闭性）

**证明：**

```
∀ a, b ∈ BigInt:
  a + b ∈ BigInt  ✓ (BigInt + BigInt → BigInt)
  a - b ∈ BigInt  ✓
  a * b ∈ BigInt  ✓
  a / b ∈ BigInt  ✓ (整数除法，向零取整)
  a % b ∈ BigInt  ✓
  a ** b ∈ BigInt ✓ (当 b ≥ 0)
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

## 7. Stage 3 提案预览

### 7.1 装饰器 (Decorators)

#### 概念定义（形式化）

**装饰器** 是一种特殊的声明，可以附加到类声明、方法、访问器、属性或参数上。

**形式化定义：**

```
Decorator ::= "@" DecoratorExpression

DecoratorExpression ::=
  | Identifier
  | MemberExpression
  | CallExpression

应用目标：
- class
- method
- getter/setter
- field
- auto-accessor
```

#### 使用示例

```javascript
// ===== 类装饰器 =====
function logged(value, { kind, name }) {
  if (kind === 'class') {
    return class extends value {
      constructor(...args) {
        console.log(`Creating instance of ${name}`);
        super(...args);
      }
    };
  }
}

@logged
class Person {
  constructor(name) {
    this.name = name;
  }
}

// ===== 方法装饰器 =====
function timing(value, { kind, name }) {
  if (kind === 'method') {
    return function(...args) {
      const start = performance.now();
      const result = value.apply(this, args);
      const end = performance.now();
      console.log(`${name} took ${end - start}ms`);
      return result;
    };
  }
}

class Calculator {
  @timing
  heavyComputation() {
    // 耗时操作
  }
}

// ===== 字段装饰器 =====
function readonly(value, { kind }) {
  if (kind === 'field') {
    return {
      get() { return value; },
      set() { throw new Error('Cannot modify readonly field'); }
    };
  }
}

class Config {
  @readonly version = '1.0.0';
}

// ===== 访问器装饰器 =====
function memoized(value, { kind, name }) {
  if (kind === 'getter') {
    const cache = new WeakMap();
    return function() {
      if (!cache.has(this)) {
        cache.set(this, value.call(this));
      }
      return cache.get(this);
    };
  }
}

class DataProvider {
  @memoized
  get expensiveData() {
    // 昂贵计算
    return computeExpensiveData();
  }
}
```

---

### 7.2 Records & Tuples

#### 概念定义（形式化）

**Records** 是不可变的、按值比较的对象。

**Tuples** 是不可变的、按值比较的数组。

**形式化定义：**

```
Record ::= #{ } | #{ PropertyDefinitionList }
Tuple ::= #[ ] | #[ ElementList ]

语义：
- 创建后不可修改
- 按值比较（深相等）
- 可以包含原始值和其他 Records/Tuples
- 不能包含普通对象/函数
```

#### 使用示例

```javascript
// ===== Records =====
const point = #{ x: 1, y: 2 };
const samePoint = #{ x: 1, y: 2 };

// 按值比较
console.log(point === samePoint);  // true

// 尝试修改会报错
// point.x = 3;  // TypeError

// 创建新 Record
const moved = #{ ...point, x: 3 };  // #{ x: 3, y: 2 }

// ===== Tuples =====
const coords = #[1, 2, 3];
const sameCoords = #[1, 2, 3];

console.log(coords === sameCoords);  // true

// 支持数组方法（返回新 Tuple）
const doubled = coords.map(x => x * 2);  // #[2, 4, 6]

// ===== 嵌套 =====
const data = #{
  user: #{
    name: 'John',
    tags: #['admin', 'user']
  },
  settings: #{
    theme: 'dark'
  }
};

// ===== 与对象/数组对比 =====
// 普通对象 - 按引用比较
const obj1 = { x: 1 };
const obj2 = { x: 1 };
console.log(obj1 === obj2);  // false

// Record - 按值比较
const rec1 = #{ x: 1 };
const rec2 = #{ x: 1 };
console.log(rec1 === rec2);  // true

// ===== 作为 Map/Set 的键 =====
const cache = new Map();
cache.set(#{ id: 1 }, 'data');
console.log(cache.get(#{ id: 1 }));  // 'data' (按值查找)
```

---

### 7.3 Pattern Matching

#### 概念定义（形式化）

**Pattern Matching** 提供声明式的方式来匹配和解构数据。

**形式化定义：**

```
MatchExpression ::= "match" "(" Expression ")" "{" MatchClause* "}"

MatchClause ::= Pattern "when" Expression "=>" Expression
              | Pattern "=>" Expression
              | "default" "=>" Expression

Pattern ::=
  | Literal
  | Identifier
  | ArrayPattern
  | ObjectPattern
  | ConstructorPattern
  | "..." Identifier
```

#### 使用示例

```javascript
// ===== 基本匹配 =====
const result = match (value) {
  when 1 => 'one',
  when 2 => 'two',
  when x if x > 10 => 'big number',
  default => 'other'
};

// ===== 数组解构匹配 =====
const result = match (arr) {
  when [] => 'empty',
  when [single] => `one item: ${single}`,
  when [first, ...rest] => `first: ${first}, rest: ${rest.length}`,
  default => 'unknown'
};

// ===== 对象解构匹配 =====
const result = match (response) {
  when { status: 200, data } => `Success: ${data}`,
  when { status: 404 } => 'Not found',
  when { status: code } if code >= 500 => 'Server error',
  default => 'Unknown error'
};

// ===== 与类配合 =====
class Point { constructor(x, y) { this.x = x; this.y = y; } }
class Circle { constructor(radius) { this.radius = radius; } }

const area = match (shape) {
  when Point(x, y) => 0,  // 点面积为0
  when Circle(r) => Math.PI * r * r,
  default => null
};

// ===== 实际应用：Redux reducer =====
const reducer = (state, action) => match (action) {
  when { type: 'INCREMENT' } => ({ count: state.count + 1 }),
  when { type: 'DECREMENT' } => ({ count: state.count - 1 }),
  when { type: 'SET', payload } => ({ count: payload }),
  default => state
};
```

---


---

## 8. TypeScript 5.x 核心特性

### 8.1 装饰器元数据 (Decorator Metadata)

#### 概念定义（形式化）

TypeScript 5.0 实现了 Stage 3 装饰器提案，并增加了元数据支持。

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

### 8.3 更好的 infer 和 extends 约束推断

#### 概念定义（形式化）

TypeScript 5.0 改进了 `infer` 在 `extends` 约束中的使用方式。

**形式化定义：**

```
改进的约束推断：
- 允许在 extends 约束中使用 infer
- 支持多个 infer 声明
- 更好的类型推断深度
```

#### 使用示例

```typescript
// ===== 改进的 infer 使用 =====
// 之前的写法
 type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 现在可以在约束中使用
 type FirstElement<T extends readonly any[]> =
   T extends readonly [infer F, ...infer _] ? F : never;

// ===== 递归类型推断 =====
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

// ===== 模板字面量类型推断 =====
type ExtractParams<T extends string> =
  T extends `${infer Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<Rest>]: string }
    : T extends `${infer Start}:${infer Param}`
    ? { [K in Param]: string }
    : {};

type UserRouteParams = ExtractParams<'/users/:id/posts/:postId'>;
// { id: string; postId: string }

// ===== 条件类型链 =====
type Flatten<T> = T extends Array<infer U>
  ? Flatten<U>
  : T;

type DeepFlatten<T extends readonly any[]> = T extends readonly [
  infer First,
  ...infer Rest
]
  ? [...DeepFlatten<First>, ...DeepFlatten<Rest>]
  : T extends readonly (infer U)[]
  ? [U]
  : [T];

type Flat = DeepFlatten<[1, [2, 3], [[4]]]>;
// [1, 2, 3, 4]
```

---

### 8.4 JSDoc 增强

#### 概念定义（形式化）

TypeScript 5.0 增强了对 JSDoc 的支持，允许在 JavaScript 文件中使用更多 TypeScript 类型特性。

**形式化定义：**

```
支持的 JSDoc 特性：
- @satisfies - 类型满足检查
- @overload - 函数重载
- @param {import('./types').Type} - 类型导入
- @template - 泛型参数
- @typedef {import('./types').Type} - 类型别名
```

#### 使用示例

```javascript
// ===== @satisfies 标签 =====
// @ts-check

/** @type {Record<string, string>} */
const config = {
  apiUrl: '/api',
  timeout: 5000  // Error: number 不能赋值给 string
};

// 使用 @satisfies 进行类型检查但不改变推断类型
/** @satisfies {Record<string, string | number>} */
const betterConfig = {
  apiUrl: '/api',
  timeout: 5000  // OK
};
// betterConfig.timeout 类型为 number 而不是 string | number

// ===== @overload 标签 =====
/**
 * @overload
 * @param {string} id
 * @returns {User}
 */
/**
 * @overload
 * @param {number} age
 * @param {string} name
 * @returns {User[]}
 */
/**
 * @param {string | number} param1
 * @param {string} [param2]
 * @returns {User | User[]}
 */
function findUser(param1, param2) {
  // 实现
}

// ===== 类型导入 =====
/** @param {import('./types').Config} config */
function initialize(config) {
  // config 有完整的类型提示
}

// ===== 泛型参数 =====
/**
 * @template T
 * @param {T[]} array
 * @param {(item: T) => boolean} predicate
 * @returns {T | undefined}
 */
function find(array, predicate) {
  for (const item of array) {
    if (predicate(item)) return item;
  }
  return undefined;
}

// ===== 类型别名 =====
/**
 * @typedef {import('./api').Response} ApiResponse
 * @typedef {ApiResponse['data']} UserData
 */

/** @returns {Promise<ApiResponse>} */
async function fetchUser() {
  // ...
}
```

---

### 8.5 模块解析策略

#### 概念定义（形式化）

TypeScript 5.0 引入了新的模块解析策略 `bundler`，更好地与现代打包工具配合。

**形式化定义：**

```
moduleResolution 选项：
- 'classic' - 传统策略
- 'node' - Node.js 策略
- 'node16'/'nodenext' - ESM 支持
- 'bundler' - 打包工具兼容
```

#### 配置示例

```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ESNext",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

```typescript
// ===== bundler 模块解析特性 =====

// 1. 支持扩展名省略
import { utils } from './utils';  // 解析为 ./utils.ts, ./utils.tsx, ./utils.js 等

// 2. 支持 package.json exports
import { something } from 'package/subpath';  // 遵循 exports 字段

// 3. 支持条件导出
// package.json
{
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js",
      "types": "./dist/types/index.d.ts"
    }
  }
}

// ===== isolatedModules 配置 =====
{
  "compilerOptions": {
    "isolatedModules": true  // 确保每个文件可以独立编译
  }
}

// 需要显式类型导出的场景
// ❌ 错误：无法确定导出类型
export { SomeType } from './types';

// ✅ 正确：显式标记类型导出
export type { SomeType } from './types';
```

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

// ===== 混入模式 =====
class Disposable {
  isDisposed: boolean = false;
  dispose() {
    this.isDisposed = true;
  }
}

class Activatable {
  isActive: boolean = false;
  activate() {
    this.isActive = true;
  }
  deactivate() {
    this.isActive = false;
  }
}

class SmartObject implements Disposable, Activatable {
  constructor() {
    setInterval(() => {
      console.log(this.isActive + ' : ' + this.isDisposed);
    }, 500);
  }

  interact() {
    this.activate();
  }

  // 实现混入
  isDisposed: boolean = false;
  dispose: () => void;
  isActive: boolean = false;
  activate: () => void;
  deactivate: () => void;
}

applyMixins(SmartObject, [Disposable, Activatable]);

function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
          Object.create(null)
      );
    });
  });
}

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

// ===== 使用示例 =====
interface Person {
  name: string;
  age: number;
  email: string;
}

type ReadonlyPerson = Readonly<Person>;
type PartialPerson = Partial<Person>;
type PersonNameAndAge = Pick<Person, 'name' | 'age'>;
type PersonWithoutEmail = Omit<Person, 'email'>;

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

// ===== 条件映射 =====
type Stringify<T> = {
  [K in keyof T]: string;
};

type NullableProps<T> = {
  [K in keyof T]: T[K] | null;
};
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
type Uppercase<S extends string> = intrinsic;
type Lowercase<S extends string> = intrinsic;
type Capitalize<S extends string> = intrinsic;
type Uncapitalize<S extends string> = intrinsic;

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

// ===== 类型安全的 fetch URL =====
type APIRoutes =
  | '/users'
  | '/users/:id'
  | '/users/:id/posts'
  | '/posts/:id';

type ExtractRouteParams<Route extends string> =
  Route extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractRouteParams<`/${Rest}`>
    : Route extends `${infer _Start}:${infer Param}`
    ? { [K in Param]: string }
    : {};

declare function fetchAPI<
  Route extends APIRoutes
>(
  route: Route,
  params: ExtractRouteParams<Route>
): Promise<any>;

fetchAPI('/users/:id', { id: '123' });  // OK
fetchAPI('/users/:id/posts', { id: '123' });  // OK
// fetchAPI('/users/:id', { userId: '123' });  // Error: id 缺失
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
interface Padder {
  getPaddingString(): string;
}

class SpaceRepeatingPadder implements Padder {
  constructor(private numSpaces: number) {}
  getPaddingString() {
    return Array(this.numSpaces + 1).join(' ');
  }
}

class StringPadder implements Padder {
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

const padder: Padder = getRandomPadder();
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
    throw new AssertionError('Not a string!');
  }
}

function assertNonNull<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new AssertionError('Value is null or undefined!');
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

```typescript
// ===== 基本概念 =====
// 协变 (Covariant): A <: B 则 F<A> <: F<B>
// 逆变 (Contravariant): A <: B 则 F<B> <: F<A>
// 双变 (Bivariant): 既是协变又是逆变
// 不变 (Invariant): 既不是协变也不是逆变

// ===== 协变示例 =====
interface Animal {
  name: string;
}

interface Dog extends Animal {
  bark(): void;
}

// 数组是协变的
declare let animals: Animal[];
declare let dogs: Dog[];

animals = dogs;  // OK: Dog[] <: Animal[]

// ===== 逆变示例 =====
// 函数参数是逆变的
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

let handleAnimal: AnimalHandler = (animal) => console.log(animal.name);
let handleDog: DogHandler = (dog) => dog.bark();

handleDog = handleAnimal;  // OK: AnimalHandler <: DogHandler
// handleAnimal = handleDog;  // Error!

// ===== 不变示例 =====
// 对象属性默认是不变的
interface Container<T> {
  value: T;
  setValue(val: T): void;
}

// ===== TypeScript 中的变型 =====
// 1. 对象属性：协变（读取）
interface Getter<T> {
  get(): T;
}
let animalGetter: Getter<Animal>;
let dogGetter: Getter<Dog> = { get: () => ({ name: 'Rex', bark: () => {} }) };
animalGetter = dogGetter;  // OK

// 2. 函数参数：逆变
interface Setter<T> {
  set(value: T): void;
}
let animalSetter: Setter<Animal> = { set: (a) => {} };
let dogSetter: Setter<Dog>;
dogSetter = animalSetter;  // OK

// 3. 方法：默认双变（strictFunctionTypes 开启后为逆变）
interface Comparator<T> {
  compare(a: T, b: T): number;
}

// ===== 变型注解 =====
// 使用 variance annotations (TypeScript 4.7+)
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
let dogs: Dog[] = [/* ... */];
let animals: Animal[] = dogs;  // OK，协变
animals.push({ name: 'Cat' });  // 运行时错误！dogs 中有了非 Dog

// 2. 函数参数逆变
function trainDog(dog: Dog) { /* ... */ }
function trainAnimal(animal: Animal) { /* ... */ }

type Trainer = (animal: Animal) => void;
let trainer: Trainer = trainDog;  // 在 strictFunctionTypes 下会报错

// ===== 解决方案 =====
// 1. 使用 readonly 数组
let readonlyDogs: readonly Dog[] = [/* ... */];
let readonlyAnimals: readonly Animal[] = readonlyDogs;  // OK
// readonlyAnimals.push(...);  // 编译错误

// 2. 显式变型注解
interface ReadOnlyContainer<out T> {
  getValue(): T;
}

interface WriteOnlyContainer<in T> {
  setValue(value: T): void;
}

// ===== 变型与泛型 =====
// 协变泛型
interface Box<out T> {
  value: T;
}

// 逆变泛型
interface Handler<in T> {
  handle(value: T): void;
}

// 不变泛型
interface MutableBox<T> {
  value: T;
  setValue(value: T): void;
}
```

---

## 10. 形式化类型理论

### 10.1 类型系统的形式化定义

#### 10.1.1 类型判断规则

```
类型系统基本规则（自然演绎风格）：

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

// 函数子类型（逆变参数，协变返回）
// (T₁ → T₂) <: (S₁ → S₂) 当且仅当 S₁ <: T₁ 且 T₂ <: S₂

// 数组/元组子类型
// T[] <: U[] 当且仅当 T <: U (协变)
// [T₁, T₂] <: [U₁, U₂] 当且仅当 T₁ <: U₁ 且 T₂ <: U₂

// ===== 类型等价 =====
// S ≡ T 表示 S 和 T 是等价的类型

// 结构等价（TypeScript 使用）
interface Point1 { x: number; y: number }
interface Point2 { x: number; y: number }
// Point1 ≡ Point2

// ===== 最具体类型 =====
// 字面量类型比基础类型更具体
// 'hello' <: string
// 42 <: number
// true <: boolean
```

---

### 10.2 类型推断的形式化

#### 10.2.1 Hindley-Milner 类型推断

```typescript
// TypeScript 使用基于约束的类型推断

// ===== 类型变量与约束 =====
// 推断 f<T>(x: T): T 时：
// 1. 引入类型变量 T
// 2. 收集约束：x 的类型必须可赋值给 T
// 3. 求解约束得到 T 的具体类型

// ===== 示例推断过程 =====
function identity<T>(x: T): T {
  return x;
}

const result = identity('hello');
// 推断过程：
// 1. 调用 identity('hello')
// 2. 'hello' 的类型是 'hello' (字面量类型)
// 3. 约束：'hello' <: T
// 4. 最一般的解：T = 'hello'
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
// 3. T = number, U = string
// 4. 结果：string[]

// ===== 上下文类型推断 =====
window.onmousedown = function(event) {
  // event 从上下文推断为 MouseEvent
};

// ===== 最佳通用类型 =====
let arr = [0, 1, null];
// 候选类型：number, number, null
// 最佳通用类型：number | null
```

---

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

// ===== 模板字面量类型推导 =====
type EventName<T extends string> = `on${Capitalize<T>}`;

// 推导 EventName<'click'>:
// 1. Capitalize<'click'> = 'Click'
// 2. 结果：'onClick'
```

---

### 10.4 类型系统完备性分析

#### 10.4.1 类型安全定理

```
类型安全定理（Type Safety）：

如果 ⊢ e : T（表达式 e 有类型 T），那么：
1. 进度（Progress）：e 是一个值，或者存在一个 e' 使得 e → e'
2. 保持（Preservation）：如果 e → e'，那么 ⊢ e' : T

TypeScript 的类型系统是：
- 结构上完整的（Structurally Sound）
- 但不是完全可靠的（Not Fully Sound），因为：
  * any 类型绕过类型检查
  * 类型断言可以强制转换
  * 数组协变可能导致运行时错误
```

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
// strictFunctionTypes: 函数参数逆变检查
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

| 特性 | ES2020 | ES2021 | ES2022 | ES2023 | ES2024 |
|------|--------|--------|--------|--------|--------|
| BigInt | ✓ | | | | |
| Promise.allSettled | ✓ | | | | |
| globalThis | ✓ | | | | |
| 可选链 ?. | ✓ | | | | |
| 空值合并 ?? | ✓ | | | | |
| 动态 import() | ✓ | | | | |
| Promise.any | | ✓ | | | |
| WeakRef | | ✓ | | | |
| 逻辑赋值 ||=/&&=/??= | | ✓ | | | |
| 数字分隔符 | | ✓ | | | |
| replaceAll | | ✓ | | | |
| Class 私有字段 | | | ✓ | | |
| Class 静态块 | | | ✓ | | |
| at() | | | ✓ | | |
| Object.hasOwn() | | | ✓ | | |
| Error cause | | | ✓ | | |
| toSorted/toReversed | | | | ✓ | |
| toSpliced/with | | | | ✓ | |
| findLast/findLastIndex | | | | ✓ | |
| Hashbang | | | | ✓ | |
| Object.groupBy | | | | | ✓ |
| Map.groupBy | | | | | ✓ |
| Promise.withResolvers | | | | | ✓ |
| isWellFormed/toWellFormed | | | | | ✓ |

---

*文档结束*
