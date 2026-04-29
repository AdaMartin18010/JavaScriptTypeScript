# ECMA-262 规范算法：抽象操作与形式化步骤

> **定位**：`10-fundamentals/10.6-ecmascript-spec/`
> **规范来源**：ECMA-262 §5.2 Algorithm Conventions | §7 Abstract Operations

---

## 一、规范的语言

ECMA-262 使用**伪代码（Pseudo-code）**描述语言语义，而非形式化逻辑或具体实现代码。这种伪代码具有以下特征：

1. **步骤化（Step-by-step）**：每个操作分解为带编号的步骤
2. **断言（Assert）**：前置条件与不变性检查
3. **抽象操作（Abstract Operations）**：可复用的子程序
4. **内部方法（Internal Methods）**：定义对象行为接口
5. **记法约定（Notational Conventions）**：`?`（ReturnIfAbrupt）、`!`（假设正常完成）

---

## 二、核心抽象操作索引

| 抽象操作 | 规范位置 | 语义 | 应用频率 |
|---------|---------|------|---------|
| `ToPrimitive` | §7.1.1 | 将对象转为原始值 | 高（比较、运算） |
| `ToString` | §7.1.17 | 将值转为字符串 | 高 |
| `ToNumber` | §7.1.4 | 将值转为数字 | 高 |
| `ToBoolean` | §7.1.2 | 将值转为布尔 | 高 |
| `RequireObjectCoercible` | §7.2.1 | 确保值可转为对象 | 高 |
| `SameValue` | §7.2.11 | 严格相等（含 NaN 处理） | 中 |
| `SameValueZero` | §7.2.12 | 同 SameValue 但 +0 === -0 | 中 |
| `IsExtensible` | §7.3.14 | 检查对象是否可扩展 | 低 |
| `SpeciesConstructor` | §7.3.22 | 获取派生对象的构造函数 | 低 |

---

## 三、`?` 与 `!` 记法

### `?` — ReturnIfAbrupt

```
? Operation(arg)
```

等价于：

```
1. 令 result 为 Operation(arg)
2. 若 result 是 abrupt completion，返回 result
3. 令 result 为 result.[[Value]]
```

### `!` — 假设正常完成

```
! Operation(arg)
```

等价于：

```
1. 令 result 为 Operation(arg)
2. Assert：result 不是 abrupt completion
3. 令 result 为 result.[[Value]]
```

---

## 四、完成记录（Completion Record）

所有 ECMAScript 语句和表达式的求值结果都是 **Completion Record**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `[[Type]]` | normal / break / continue / return / throw | 完成类型 |
| `[[Value]]` | any | 关联值（normal/return 时） |
| `[[Target]]` | String / empty | 目标标签（break/continue 时） |

**定理（完成记录传播定理）**： abrupt completion（break/continue/return/throw）会沿调用栈向上传播，直到被对应的处理机制捕获。

---

## 五、代码示例：`ToPrimitive` 抽象操作详解

`ToPrimitive(input, preferredType)` 是 ECMA-262 中最频繁调用的抽象操作之一，它解释了 JavaScript 中大量「隐式转换」的边界行为。

```javascript
// ============================================
// ToPrimitive 规范步骤对应代码演示
// ============================================

// ECMA-262 §7.1.1 ToPrimitive 算法概要：
// 1. 若 input 是原始值，直接返回
// 2. 获取 input 的 @@toPrimitive 符号方法（ES2015+）
// 3. 若存在，调用 hint 为 preferredType（default/number/string）
// 4. 否则，按 preferredType 调用 OrdinaryToPrimitive(input, hint)
//    - hint === 'string'：先尝试 toString()，再尝试 valueOf()
//    - hint === 'number'：先尝试 valueOf()，再尝试 toString()
//    - hint === 'default'（如 ==、+）：按 number 处理

// ============================================
// 示例 1：自定义 @@toPrimitive
// ============================================

const money = {
  amount: 100,
  currency: 'USD',
  [Symbol.toPrimitive](hint) {
    if (hint === 'string') {
      return `${this.amount} ${this.currency}`;
    }
    if (hint === 'number') {
      return this.amount;
    }
    // hint === 'default'（如 ==、+ 运算符）
    return this.amount;
  }
};

console.log(String(money));  // "100 USD"  (hint='string')
console.log(Number(money));  // 100        (hint='number')
console.log(money + 50);     // 150        (hint='default' → number)
console.log(`${money}`);     // "100 USD"  (hint='string')

// ============================================
// 示例 2：对象默认的 OrdinaryToPrimitive 行为
// ============================================

const obj = {
  valueOf() {
    console.log('valueOf called');
    return 42;
  },
  toString() {
    console.log('toString called');
    return '[object Custom]';
  }
};

// + 运算符触发 ToPrimitive(obj, 'default') → 按 number 处理
// 因此先调用 valueOf()，再调用 toString()
console.log(obj + 1);
// valueOf called
// 43

// 模板字符串触发 ToPrimitive(obj, 'string')
// 因此先调用 toString()
console.log(`${obj}`);
// toString called
// [object Custom]

// ============================================
// 示例 3：边界行为 —— [] + {} 为何等于 "[object Object]"
// ============================================

// 规范路径：
// 1. + 运算符触发 ApplyStringOrNumericBinaryOperator
// 2. 令 lprim 为 ? ToPrimitive([]) —— hint='default' → 按 number
//    - [].valueOf() 返回 []（数组对象，非原始值）
//    - [].toString() 返回 ""（空字符串）
//    → lprim = ""
// 3. 令 rprim 为 ? ToPrimitive({}) —— hint='default' → 按 number
//    - {}.valueOf() 返回 {}（对象，非原始值）
//    - {}.toString() 返回 "[object Object]"
//    → rprim = "[object Object]"
// 4. lprim 是 String → 执行字符串拼接
// 5. "" + "[object Object]" = "[object Object]"

console.log([] + {});           // "[object Object]"
console.log({} + []);           // 0（某些引擎中 {} 被解析为空块，+[] = 0）
console.log(String([]));        // ""
console.log(String({}));        // "[object Object]"

// ============================================
// 示例 4：Date 对象的特例
// ============================================

// Date 对象重写默认行为：@@toPrimitive 不存在时，
// hint='default' 被当作 'string' 处理（这是 ToPrimitive 中的特例）

const d = new Date('2026-04-29');
console.log(d + 1);             // "Tue Apr 29 2026 ..." + "1" = 字符串拼接
console.log(Number(d));         // 时间戳数字

// ============================================
// 示例 5：规范算法路径追踪 —— 1 + '2'
// ============================================

console.log(1 + '2'); // "12"

// 规范追踪：
// 1. 求值 AdditiveExpression：1 + '2'
// 2. 令 lref 为 1 的求值结果，lval 为 GetValue(lref) → 1
// 3. 令 rref 为 '2' 的求值结果，rval 为 GetValue(rref) → "2"
// 4. 令 lprim 为 ? ToPrimitive(lval) → 1（已是原始值）
// 5. 令 rprim 为 ? ToPrimitive(rval) → "2"（已是原始值）
// 6. 若 lprim 或 rprim 是 String：
//    a. 令 lstr 为 ? ToString(lprim) → "1"
//    b. 令 rstr 为 ? ToString(rprim) → "2"
//    c. 返回 lstr + rstr → "12"
```

---

## 六、规范阅读方法论

### 6.1 追踪算法路径

以 `1 + '2'` 为例：

```
1. 求值 AdditiveExpression：1 + '2'
2. 调用 ApplyStringOrNumericBinaryOperator
3. 令 lprim 为 ? ToPrimitive(lhs) → 1
4. 令 rprim 为 ? ToPrimitive(rhs) → '2'
5. 若 lprim 或 rprim 是 String：
   a. 令 lstr 为 ? ToString(lprim) → '1'
   b. 令 rstr 为 ? ToString(rprim) → '2'
   c. 返回 lstr + rstr → '12'
```

### 6.2 关键洞察

理解规范算法的价值不在于记忆步骤，而在于：

1. **识别边界行为**：`[] + {}` 为何等于 `"[object Object]"`
2. **预测新特性**：Temporal API 的规范设计模式
3. **调试引擎差异**：V8 vs JSC vs SpiderMonkey 的规范实现偏差

---

## 权威参考链接

| 资源 | 说明 | 链接 |
|------|------|------|
| **ECMA-262 §5.2** | 规范算法约定与记法 | [tc39.es/ecma262/#sec-algorithm-conventions](https://tc39.es/ecma262/#sec-algorithm-conventions) |
| **ECMA-262 §7.1.1** | ToPrimitive 抽象操作定义 | [tc39.es/ecma262/#sec-toprimitive](https://tc39.es/ecma262/#sec-toprimitive) |
| **ECMA-262 §7.1.4** | ToNumber 抽象操作 | [tc39.es/ecma262/#sec-tonumber](https://tc39.es/ecma262/#sec-tonumber) |
| **2ality: Converting values to primitives** | Dr. Axel Rauschmayer 深度讲解 | [2ality.com/2022/11/coercion-to-primitive.html](https://2ality.com/2022/11/coercion-to-primitive.html) |
| **V8 Blog: Understanding the ECMASpec** | 从引擎开发者视角读规范 | [v8.dev/blog/understanding-ecmascript-part-1](https://v8.dev/blog/understanding-ecmascript-part-1) |
| **JavaScript Spec Explorer** | 交互式规范浏览工具 | [tc39.es/ecma262](https://tc39.es/ecma262) |

---

*本文件为 ECMAScript 规范基础专题的首篇，已增强 `ToPrimitive` 代码示例与权威链接。*
