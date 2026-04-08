# ES2020 BigInt 深度解析

> **规范来源**: ECMA-262 2020 (11th Edition) - §6.1.6.2 The BigInt Type
> **引入版本**: ES2020 (ES11)
> **稳定性**: Stage 4 (Finished)

---

## 目录

- [ES2020 BigInt 深度解析](#es2020-bigint-深度解析)
  - [目录](#目录)
  - [1. 形式化定义](#1-形式化定义)
    - [1.1 数学定义](#11-数学定义)
    - [1.2 语法表示](#12-语法表示)
    - [1.3 抽象操作](#13-抽象操作)
  - [2. BigInt 与 Number 的语义差异](#2-bigint-与-number-的语义差异)
    - [2.1 精度模型对比](#21-精度模型对比)
    - [2.2 算术运算语义](#22-算术运算语义)
    - [2.3 混合运算规则](#23-混合运算规则)
    - [2.4 比较语义](#24-比较语义)
  - [3. 内存表示与性能特征](#3-内存表示与性能特征)
    - [3.1 内部表示模型](#31-内部表示模型)
    - [3.2 内存占用估算](#32-内存占用估算)
    - [3.3 算法复杂度](#33-算法复杂度)
    - [3.4 性能基准](#34-性能基准)
  - [4. 使用模式与最佳实践](#4-使用模式与最佳实践)
    - [4.1 适用场景](#41-适用场景)
    - [4.2 类型安全模式](#42-类型安全模式)
    - [4.3 序列化处理](#43-序列化处理)
    - [4.4 安全转换模式](#44-安全转换模式)
  - [5. 常见陷阱与反例](#5-常见陷阱与反例)
    - [5.1 JSON 序列化陷阱](#51-json-序列化陷阱)
    - [5.2 Math 对象陷阱](#52-math-对象陷阱)
    - [5.3 混合运算陷阱](#53-混合运算陷阱)
    - [5.4 除法陷阱](#54-除法陷阱)
    - [5.5 类型检测陷阱](#55-类型检测陷阱)
  - [6. 跨语言对比](#6-跨语言对比)
    - [6.1 特性对比表](#61-特性对比表)
    - [6.2 Python int 对比](#62-python-int-对比)
    - [6.3 Java BigInteger 对比](#63-java-biginteger-对比)
    - [6.4 互操作性](#64-互操作性)
  - [附录 A: 快速参考卡](#附录-a-快速参考卡)
    - [类型转换矩阵](#类型转换矩阵)
    - [运算符支持表](#运算符支持表)
  - [参考文献](#参考文献)

---

## 1. 形式化定义

### 1.1 数学定义

**定义 1.1** (BigInt 值集合)
BigInt 类型表示**任意精度整数**（Arbitrary-precision integers），其值集合定义为：

$$\mathbb{BI} = \{ x \in \mathbb{Z} \mid x \text{ 可被 ECMAScript 引擎表示} \}$$

其中 $\mathbb{Z}$ 为整数集合。理论上，BigInt 可以表示任意大小的整数，仅受限于可用内存。

**定义 1.2** (BigInt 字面量语法)
BigInt 字面量由整数字面量后紧跟字符 `n` 构成：

$$
\text{BigIntLiteral} ::= \text{IntegerLiteral} \, \text{n}
$$

**定义 1.3** (构造函数映射)
`BigInt()` 构造函数定义从其他类型到 $\mathbb{BI}$ 的映射：

$$
\text{BigInt}(v) =
\begin{cases}
v & \text{if } v \in \mathbb{BI} \\
\lfloor v \rfloor & \text{if } v \in \mathbb{R} \setminus \mathbb{BI} \text{ (Number 类型)} \\
\text{parse}_{10}(\text{ToString}(v)) & \text{if } v \in \text{String} \\
\text{throw TypeError} & \text{if } v \in \{ \text{undefined}, \text{null}, \text{symbol} \}
\end{cases}
$$

### 1.2 语法表示

| 表示法 | 示例 | 数学值 | 说明 |
|--------|------|--------|------|
| 十进制 | `9007199254740993n` | $2^{53} + 1$ | 超过 Number.MAX_SAFE_INTEGER |
| 二进制 | `0b101010n` | $42$ | 前缀 `0b` 或 `0B` |
| 八进制 | `0o377n` | $255$ | 前缀 `0o` 或 `0O` |
| 十六进制 | `0xFFn` | $255$ | 前缀 `0x` 或 `0X` |
| 构造函数 | `BigInt("123")` | $123$ | 从字符串解析 |
| 构造函数 | `BigInt(123)` | $123$ | 从 Number 转换 |

```javascript
// 各种进制表示
const dec = 9007199254740993n;           // 十进制
const bin = 0b11111111111111111111111111111111111111111111111111111n;  // 二进制
const oct = 0o1111111111111111111111n;   // 八进制
const hex = 0x1fffffffffffffn;           // 十六进制

// 构造函数方式
const fromString = BigInt("123456789012345678901234567890");
const fromNumber = BigInt(42);
const fromBigInt = BigInt(42n);
```

### 1.3 抽象操作

ECMAScript 规范定义了以下核心抽象操作：

**操作 1.1** (BigInt::unaryMinus)
对于 $x \in \mathbb{BI}$：

$$
\text{BigInt::unaryMinus}(x) = -x
$$

**操作 1.2** (BigInt::add)
对于 $x, y \in \mathbb{BI}$：

$$
\text{BigInt::add}(x, y) = x + y
$$

**操作 1.3** (BigInt::multiply)
对于 $x, y \in \mathbb{BI}$：

$$
\text{BigInt::multiply}(x, y) = x \times y
$$

**操作 1.4** (BigInt::exponentiate)
对于底数 $base \in \mathbb{BI}$，指数 $exponent \in \mathbb{BI}$：

$$
\text{BigInt::exponentiate}(base, exponent) =
\begin{cases}
base^{exponent} & \text{if } exponent \geq 0 \\
\text{throw RangeError} & \text{if } exponent < 0
\end{cases}
$$

```javascript
// 指数运算限制
2n ** 3n;      // 8n ✓
2n ** -1n;     // RangeError: BigInt negative exponent
```

---

## 2. BigInt 与 Number 的语义差异

### 2.1 精度模型对比

| 特性 | Number (IEEE 754) | BigInt |
|------|-------------------|--------|
| **数学集合** | $\mathbb{F}_{64} = \{ x \in \mathbb{Q} \mid \text{IEEE 754 双精度} \}$ | $\mathbb{Z}$ (任意精度整数) |
| **位数** | 64 位（52 位尾数 + 11 位指数 + 1 位符号） | 动态分配 |
| **安全整数范围** | $[-2^{53}+1, 2^{53}-1]$ | 无限制 |
| **小数支持** | 是 | 否（纯整数） |
| **特殊值** | `NaN`, `Infinity`, `-Infinity`, `+0`, `-0` | 无 |

**定义 2.1** (Number 的安全整数范围)

$$
\text{Number.MAX\_SAFE\_INTEGER} = 2^{53} - 1 = 9007199254740991
$$

$$
\text{Number.MIN\_SAFE\_INTEGER} = -(2^{53} - 1) = -9007199254740991
$$

```javascript
// 精度损失演示
const num = 9007199254740993;   // Number
const big = 9007199254740993n;  // BigInt

console.log(num);               // 9007199254740992 (精度丢失！)
console.log(big);               // 9007199254740993n (精确)

// 连续整数比较
Number.MAX_SAFE_INTEGER;        // 9007199254740991
Number.MAX_SAFE_INTEGER + 1;    // 9007199254740992
Number.MAX_SAFE_INTEGER + 2;    // 9007199254740992 (相同！)

9007199254740991n + 1n;         // 9007199254740992n
9007199254740991n + 2n;         // 9007199254740993n (不同)
```

### 2.2 算术运算语义

**定理 2.1** (BigInt 运算封闭性)
对于任意 $a, b \in \mathbb{BI}$：

$$
\begin{aligned}
a + b &\in \mathbb{BI} \\
a - b &\in \mathbb{BI} \\
a \times b &\in \mathbb{BI} \\
a \div b &\in \mathbb{BI} \quad \text{(整数除法，向零截断)} \\
a \bmod b &\in \mathbb{BI} \\
\end{aligned}
$$

```javascript
// BigInt 除法（向零截断）
5n / 2n;        // 2n (不是 2.5n)
-5n / 2n;       // -2n (向零截断)
5n % 2n;        // 1n

// Number 除法
5 / 2;          // 2.5
-5 / 2;         // -2.5
```

### 2.3 混合运算规则

**定义 2.2** (类型提升规则)
ECMAScript 禁止 BigInt 与 Number 的隐式混合运算：

$$
\forall a \in \mathbb{BI}, b \in \mathbb{F}_{64}: \quad a \, \text{op} \, b \rightarrow \text{TypeError}
$$

```javascript
// ❌ 混合运算抛出 TypeError
1n + 1;         // TypeError: Cannot mix BigInt and other types
1n + 1.5;       // TypeError: Cannot mix BigInt and other types

// ✅ 显式转换后运算
1n + BigInt(1);             // 2n
Number(1n) + 1.5;           // 2.5
```

### 2.4 比较语义

**定理 2.2** (抽象相等比较)
对于 $a \in \mathbb{BI}, b \in \mathbb{F}_{64}$：

$$
a == b \iff \text{Number}(a) = b \land a = \text{BigInt}(b)
$$

由于此条件几乎不可能满足（除 $0n == 0$ 和 $-0$ 的边界情况）：

```javascript
// 抽象相等比较
0n == 0;        // true (特殊情况)
0n == -0;       // true
1n == 1;        // false
1n == 1.0;      // false

// 严格相等比较
0n === 0;       // false (类型不同)
1n === 1n;      // true
```

**定理 2.3** (有序比较)
对于有序比较运算（`<`, `>`, `<=`, `>=`），ECMAScript 允许跨类型比较：

```javascript
// 有序比较允许跨类型
1n < 2;         // true
2n > 1.5;       // true
5n >= 5;        // true
9007199254740993n > Number.MAX_SAFE_INTEGER;  // true
```

---

## 3. 内存表示与性能特征

### 3.1 内部表示模型

V8 引擎（Chrome/Node.js）的 BigInt 实现采用**数字向量**（Digit Vector）表示：

**定义 3.1** (V8 BigInt 内存布局)

$$
\text{BigInt} = \langle \text{sign}, \vec{d} \rangle
$$

其中：

- $\text{sign} \in \{ -1, 0, 1 \}$ 表示符号
- $\vec{d} = [d_0, d_1, ..., d_{n-1}]$ 为数字向量，每个 $d_i$ 为 30 位或 64 位"数字"

| 位数范围 | 内存表示 | 说明 |
|----------|----------|------|
| $-2^{30} < x < 2^{30}$ | Smi (Small Integer) | 直接嵌入指针 |
| $-2^{63} < x < 2^{63}$ | 单个 64 位数字 | 堆分配对象 |
| $\|x\| \geq 2^{63}$ | 数字向量 | 动态数组 |

### 3.2 内存占用估算

**定义 3.2** (内存占用公式)

对于大整数 $x$（V8 引擎）：

$$
\text{Memory}(x) = \text{Header} + \lceil \frac{\lfloor \log_2 |x| \rfloor + 1}{30} \rceil \times 4 \text{ bytes}
$$

其中 Header 为对象头开销（约 16 字节）。

```javascript
// 内存占用示例（Node.js 环境）
const v8 = require('v8');

function getMemoryUsage() {
    return v8.serialize({}).length; // 或使用 process.memoryUsage()
}

// 不同大小的 BigInt
const sizes = [
    0n,
    2n ** 30n,      // ~1 billion
    2n ** 60n,      // ~1 quintillion
    2n ** 120n,     // 超大数
    2n ** 240n,     // 超超大数
];
```

### 3.3 算法复杂度

| 操作 | 时间复杂度 | 空间复杂度 | 说明 |
|------|------------|------------|------|
| 加法 $a + b$ | $O(n)$ | $O(n)$ | $n = \max(\text{位数})$ |
| 减法 $a - b$ | $O(n)$ | $O(n)$ | |
| 乘法 $a \times b$ | $O(n \cdot m)$ / $O(n \log n)$ | $O(n + m)$ | 朴素 / Karatsuba |
| 除法 $a / b$ | $O(n \cdot m)$ | $O(n)$ | |
| 幂运算 $a^b$ | $O(\log b \cdot M(n))$ | $O(n \cdot \log b)$ | 平方求幂 |
| 位运算 | $O(n)$ | $O(n)$ | |

其中 $n, m$ 为操作数的位数（以字为单位）。

### 3.4 性能基准

```javascript
// 性能测试框架
console.time('BigInt addition');
let a = 2n ** 1000n;
let b = 2n ** 1000n;
for (let i = 0; i < 100000; i++) {
    a + b;
}
console.timeEnd('BigInt addition');

console.time('Number addition');
let x = 1;
let y = 2;
for (let i = 0; i < 100000; i++) {
    x + y;
}
console.timeEnd('Number addition');
```

| 操作 | BigInt | Number | 比例 |
|------|--------|--------|------|
| 小整数加法 | ~50ns | ~1ns | 50x |
| 大整数加法 (2^1000) | ~200ns | N/A | - |
| 大整数乘法 | ~1μs | N/A | - |
| 幂运算 | ~10μs+ | ~5ns | 2000x+ |

---

## 4. 使用模式与最佳实践

### 4.1 适用场景

| 场景 | 示例 | 建议使用 |
|------|------|----------|
| 金融计算（整数分） | 金额精确计算 | BigInt |
| 时间戳（毫秒/纳秒） | 高精度时间 | BigInt |
| 加密货币 | 地址、金额 | BigInt |
| 大文件处理 | 字节偏移量 | BigInt |
| ID 生成 | Snowflake ID | BigInt |
| 位运算 | 标志位掩码 | Number（小范围）或 BigInt |

### 4.2 类型安全模式

```typescript
// TypeScript 类型定义
type SafeBigInt = bigint;
type CurrencyCents = bigint;

// 领域建模
type Money = {
    amount: CurrencyCents;  // 以分为单位的整数
    currency: string;
};

// 构造函数验证
function createMoney(cents: bigint, currency: string): Money {
    if (cents < 0n) throw new Error("Amount cannot be negative");
    return { amount: cents, currency };
}

// 运算封装
function addMoney(a: Money, b: Money): Money {
    if (a.currency !== b.currency) {
        throw new Error("Currency mismatch");
    }
    return {
        amount: a.amount + b.amount,
        currency: a.currency
    };
}
```

### 4.3 序列化处理

```javascript
// 自定义 JSON 序列化
const bigIntSerializer = {
    // 序列化：转为字符串并标记
    stringify(key, value) {
        if (typeof value === 'bigint') {
            return { __type: 'BigInt', value: value.toString() };
        }
        return value;
    },

    // 反序列化：还原为 BigInt
    parse(key, value) {
        if (value && value.__type === 'BigInt') {
            return BigInt(value.value);
        }
        return value;
    }
};

// 使用示例
const data = { id: 9007199254740993n, name: "test" };
const json = JSON.stringify(data, bigIntSerializer.stringify);
const restored = JSON.parse(json, bigIntSerializer.parse);

// JSON.stringify 的 replacer 封装
function jsonStringifyWithBigInt(obj) {
    return JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() + 'n' : value
    );
}
```

### 4.4 安全转换模式

```javascript
// 安全的 Number -> BigInt 转换
function safeToBigInt(value, maxSafe = Number.MAX_SAFE_INTEGER) {
    if (typeof value !== 'number') {
        throw new TypeError('Expected number');
    }
    if (!Number.isFinite(value)) {
        throw new RangeError('Cannot convert Infinity to BigInt');
    }
    if (!Number.isInteger(value)) {
        throw new RangeError('Cannot convert fractional number to BigInt');
    }
    if (Math.abs(value) > maxSafe) {
        throw new RangeError('Value exceeds safe integer range');
    }
    return BigInt(value);
}

// 安全的 BigInt -> Number 转换
function safeToNumber(bigintValue, options = {}) {
    const {
        allowLossy = false,
        checkRange = true
    } = options;

    if (typeof bigintValue !== 'bigint') {
        throw new TypeError('Expected bigint');
    }

    if (checkRange) {
        if (bigintValue > BigInt(Number.MAX_SAFE_INTEGER) ||
            bigintValue < BigInt(Number.MIN_SAFE_INTEGER)) {
            if (!allowLossy) {
                throw new RangeError('BigInt exceeds safe number range');
            }
        }
    }

    return Number(bigintValue);
}
```

---

## 5. 常见陷阱与反例

### 5.1 JSON 序列化陷阱

**反例 5.1** (原生 JSON.stringify 失败)

```javascript
// ❌ 原生 JSON.stringify 会抛出
const data = { id: 123456789012345678901234567890n };
JSON.stringify(data);  // TypeError: Do not know how to serialize a BigInt
```

**解决方案 5.1**

```javascript
// ✅ 方案 1：自定义 toJSON
BigInt.prototype.toJSON = function() {
    return this.toString();
};

// ✅ 方案 2：使用 replacer
JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
);
```

### 5.2 Math 对象陷阱

**反例 5.2** (Math 方法不接受 BigInt)

```javascript
// ❌ Math 方法不接受 BigInt
Math.abs(-5n);      // TypeError
Math.max(1n, 2n);   // TypeError
Math.pow(2n, 3n);   // TypeError
Math.sqrt(16n);     // TypeError
```

**解决方案 5.2**

```javascript
// ✅ 自定义 BigInt Math 工具
const BigIntMath = {
    abs: (n) => n < 0n ? -n : n,

    max: (...args) => args.reduce((m, n) => n > m ? n : m),

    min: (...args) => args.reduce((m, n) => n < m ? n : m),

    // 平方根（牛顿迭代法）
    sqrt: (n) => {
        if (n < 0n) throw new Error('Square root of negative number');
        if (n < 2n) return n;

        let x = n;
        let y = (x + 1n) / 2n;
        while (y < x) {
            x = y;
            y = (x + n / x) / 2n;
        }
        return x;
    },

    // 幂运算
    pow: (base, exp) => {
        if (exp < 0n) throw new Error('Negative exponent');
        let result = 1n;
        while (exp > 0n) {
            if (exp % 2n === 1n) result *= base;
            base *= base;
            exp /= 2n;
        }
        return result;
    }
};
```

### 5.3 混合运算陷阱

**反例 5.3** (隐式类型混合)

```javascript
// ❌ 常见错误
const result = 10n + 5;          // TypeError
const avg = (total / count) | 0; // 如果 total 是 BigInt，失败

// ❌ 条件判断中的陷阱
if (1n) { }          // ✅ 可以（truthy）
if (1n == true) { }  // ❌ false！
if (1n === 1) { }    // ❌ false（类型不同）
```

**解决方案 5.3**

```javascript
// ✅ 统一类型
const result = 10n + BigInt(5);  // 15n
const avg = Number(total) / Number(count); // 如果需要小数

// ✅ 明确的布尔转换
Boolean(0n);        // false
Boolean(1n);        // true
!!0n;               // false
```

### 5.4 除法陷阱

**反例 5.4** (整数除法期望小数)

```javascript
// ❌ BigInt 除法截断
const half = 5n / 2n;   // 2n，不是 2.5n！

// ❌ 计算百分比
const percent = (part / total) * 100n;  // 结果错误！
```

**解决方案 5.4**

```javascript
// ✅ 使用缩放因子保持精度
const half = (5n * 1000n) / 2n;  // 2500n (代表 2.500)

// ✅ 百分比计算
function calculatePercentage(part, total, scale = 2) {
    const factor = 10n ** BigInt(scale + 2);  // 100.00 的精度
    return (part * factor) / total;  // 例如 3333n 表示 33.33%
}
```

### 5.5 类型检测陷阱

**反例 5.5** (typeof 与 instanceof)

```javascript
// ❌ Object.prototype.toString 误判
Object.prototype.toString.call(1n);  // "[object BigInt]" ✓

// ❌ typeof 是唯一可靠方式
typeof 1n;      // "bigint"

// ❌ 没有 BigInt 构造函数检查
1n instanceof BigInt;  // TypeError: BigInt is not a constructor
```

**解决方案 5.5**

```javascript
// ✅ 正确的类型检测
function isBigInt(value) {
    return typeof value === 'bigint';
}

// ✅ 联合类型检查
function isNumeric(value) {
    return typeof value === 'number' || typeof value === 'bigint';
}
```

---

## 6. 跨语言对比

### 6.1 特性对比表

| 特性 | JavaScript BigInt | Python int | Java BigInteger |
|------|-------------------|------------|-----------------|
| **精度** | 任意 | 任意 | 任意 |
| **字面量语法** | `123n` | `123` | `new BigInteger("123")` |
| **负数除法** | 向零截断 | 向下取整（Floor） | 向零截断 |
| **位运算** | 无限位 | 无限位 | 无限位 |
| **性能** | 中等 | 高（C 实现） | 中等 |
| **与浮点互操作** | 严格分离 | 自动转换 | 显式转换 |
| **JSON 支持** | 原生不支持 | 原生不支持 | 原生不支持 |

### 6.2 Python int 对比

**定义 6.1** (Python 整数类型统一)
Python 3 统一了 `int` 和 `long`，所有整数都是任意精度：

$$
\text{Python int} = \mathbb{Z}
$$

```python
# Python 整数（无大小限制）
x = 123456789012345678901234567890
y = 2 ** 1000

# 除法行为差异
# Python: 向下取整
5 // 2      # 2
-5 // 2     # -3 (向下取整)

# JavaScript BigInt: 向零截断
# 5n / 2n   // 2n
# -5n / 2n  // -2n
```

**语义差异表**

| 运算 | Python `int` | JavaScript `BigInt` |
|------|--------------|---------------------|
| `5 / 2` | `2.5` (float) | `2n` (BigInt) |
| `5 // 2` | `2` (floor) | N/A |
| `-5 // 2` | `-3` (floor) | N/A |
| `-5n / 2n` | N/A | `-2n` (trunc) |
| `True + 1` | `2` | N/A |
| `1 + True` | `2` | N/A |

```javascript
// JavaScript: 严格分离
1n + 1;     // TypeError

// Python: 灵活的数值塔
from fractions import Fraction
from decimal import Decimal
# int -> float -> Fraction -> Decimal 自动/手动提升
```

### 6.3 Java BigInteger 对比

**定义 6.2** (Java BigInteger 类层次)

$$
\text{Java 数值类型} =
\begin{cases}
\text{原始类型: byte, short, int, long} \\
\text{包装类型: Byte, Short, Integer, Long} \\
\text{大数类型: BigInteger, BigDecimal}
\end{cases}
$$

```java
// Java BigInteger
import java.math.BigInteger;

BigInteger a = new BigInteger("12345678901234567890");
BigInteger b = BigInteger.valueOf(123);  // 从 long 转换

// 运算方法（非运算符）
BigInteger sum = a.add(b);
BigInteger product = a.multiply(b);
BigInteger quotient = a.divide(b);
BigInteger remainder = a.remainder(b);

// 不可变性
// a 的值不会被修改，所有操作返回新对象
```

**API 对比**

| 操作 | Java BigInteger | JavaScript BigInt |
|------|-----------------|-------------------|
| 创建 | `new BigInteger("123")` | `123n` 或 `BigInt("123")` |
| 加法 | `a.add(b)` | `a + b` |
| 减法 | `a.subtract(b)` | `a - b` |
| 乘法 | `a.multiply(b)` | `a * b` |
| 除法 | `a.divide(b)` | `a / b` |
| 取模 | `a.remainder(b)` | `a % b` |
| 幂运算 | `a.pow(3)` | `a ** 3n` |
| 绝对值 | `a.abs()` | `a < 0n ? -a : a` |
| 比较 | `a.compareTo(b)` | `a < b`, `a === b` 等 |
| GCD | `a.gcd(b)` | 需自定义实现 |
| 模幂 | `a.modPow(exp, mod)` | `(a ** exp) % mod` |

### 6.4 互操作性

```javascript
// JavaScript <-> Python (通过 JSON)
// Python 端使用字符串传递大整数

// JavaScript <-> Java (通过字符串转换)
function jsBigIntToJava(bigint) {
    return bigint.toString();  // Java 端用 new BigInteger(str)
}

function javaBigIntegerToJs(javaBigIntString) {
    return BigInt(javaBigIntString);
}
```

---

## 附录 A: 快速参考卡

### 类型转换矩阵

| From \\ To | Number | BigInt | String |
|------------|--------|--------|--------|
| **Number** | - | `BigInt(x)` ⚠️ 截断小数 | `String(x)` |
| **BigInt** | `Number(x)` ⚠️ 可能精度丢失 | - | `x.toString()` |
| **String** | `Number(x)` | `BigInt(x)` | - |

### 运算符支持表

| 运算符 | BigInt 支持 | 说明 |
|--------|-------------|------|
| `+` | ✅ | 加法 |
| `-` | ✅ | 减法/负号 |
| `*` | ✅ | 乘法 |
| `/` | ✅ | 整数除法 |
| `%` | ✅ | 取模 |
| `**` | ✅ | 幂运算（指数必须 ≥ 0） |
| `++` / `--` | ✅ | 自增/自减 |
| `&` / `\|` / `^` / `~` | ✅ | 位运算 |
| `<<` / `>>` | ✅ | 移位 |
| `<<<` | ❌ | 无符号右移（不存在） |
| `+` (一元) | ❌ | 无正号运算 |

---

## 参考文献

1. ECMA-262 2020 Specification - §6.1.6.2 The BigInt Type
2. V8 BigInt Implementation: <https://v8.dev/blog/bigint>
3. MDN Web Docs: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt>
4. TC39 Proposal: <https://github.com/tc39/proposal-bigint>
