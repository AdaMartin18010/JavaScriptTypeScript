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

## 五、规范阅读方法论

### 5.1 追踪算法路径

以 `1 + '2'` 为例：

```
1. 求值 AdditiveExpression：1 + '2'
2. 调用 Abstract Relational Comparison（实际为 ApplyStringOrNumericBinaryOperator）
3. 令 lprim 为 ? ToPrimitive(lhs) → 1
4. 令 rprim 为 ? ToPrimitive(rhs) → '2'
5. 若 lprim 或 rprim 是 String：
   a. 令 lstr 为 ? ToString(lprim) → '1'
   b. 令 rstr 为 ? ToString(rprim) → '2'
   c. 返回 lstr + rstr → '12'
```

### 5.2 关键洞察

理解规范算法的价值不在于记忆步骤，而在于：
1. **识别边界行为**：`[] + {}` 为何等于 `"[object Object]"`
2. **预测新特性**：Temporal API 的规范设计模式
3. **调试引擎差异**：V8 vs JSC vs SpiderMonkey 的规范实现偏差

---

*本文件为 ECMAScript 规范基础专题的首篇，后续将补充 `abstract-operations.md` 与 `completion-records.md`。*
