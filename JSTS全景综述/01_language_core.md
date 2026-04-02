# JavaScript/TypeScript 语言核心特性全览

> 版本范围：ES2020–ES2025 (ES11–ES16) + TypeScript 5.8
> 最后更新：2025年

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
ES2025 (ES16)   → 2025年6月  → Iterator辅助方法, Set数学方法, Atomics.pause, Float16Array
```

*来源：ECMA-262 16th Edition, June 2025*

### 1.2 特性分类矩阵

| 类别 | ES2020 | ES2021 | ES2022 | ES2023 | ES2024 | ES2025 |
|------|--------|--------|--------|--------|--------|--------|
| 数据类型 | BigInt | - | - | - | - | Float16Array |
| 异步编程 | allSettled | any, WeakRef | - | - | withResolvers | Promise.try |
| 数组/迭代器操作 | - | - | at() | toSorted等 | groupBy | Iterator helpers |
| 集合操作 | - | - | - | - | - | Set 数学方法 |
| 对象操作 | globalThis | - | hasOwn() | - | groupBy | - |
| 类相关 | - | - | 私有字段 | - | - | - |
| 字符串 | - | replaceAll | - | - | isWellFormed | RegExp 增强 |
| 并发/内存 | - | - | - | - | waitAsync | Atomics.pause |
| 模块 | 动态 import | - | - | - | - | Import Attributes |

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
