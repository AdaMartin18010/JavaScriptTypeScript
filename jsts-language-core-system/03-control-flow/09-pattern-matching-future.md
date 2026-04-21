# 模式匹配前瞻

> TC39 Pattern Matching 提案：未来的控制流范式
>
> 状态：TC39 Stage 1（截至 2025 年底）

---

## 1. 提案概述

Pattern Matching 提案旨在为 JavaScript 提供**声明式、可穷尽**的结构化数据匹配机制：

```javascript
// 提案语法（尚未标准化）
const result = match (response) {
  when ({ status: 200, data: Array.isArray }) -> processList(data),
  when ({ status: 200, data }) -> processItem(data),
  when ({ status }) if status >= 400 -> handleError(status),
  when (_) -> handleUnknown()
};
```

---

## 2. 匹配模式

### 2.1 字面量匹配

```javascript
match (value) {
  when (1) -> "one",
  when (2) -> "two",
  when (_) -> "other"
}
```

### 2.2 数组/元组模式

```javascript
match (point) {
  when ([0, 0]) -> "origin",
  when ([x, 0]) -> `on x-axis at ${x}`,
  when ([0, y]) -> `on y-axis at ${y}`,
  when ([x, y]) -> `at (${x}, ${y})`
}
```

### 2.3 对象模式

```javascript
match (user) {
  when ({ name, age: 18 }) -> `${name} is newly adult`,
  when ({ name, age }) if age >= 18 -> `${name} is adult`,
  when ({ name }) -> `${name} is minor`
}
```

### 2.4 嵌套模式

```javascript
match (data) {
  when ({ type: "user", profile: { name, email } }) -> `${name} <${email}>`,
  when ({ type: "bot" }) -> "Bot account"
}
```

### 2.5 守卫子句（when）

```javascript
match (num) {
  when (n) if n < 0 -> "negative",
  when (0) -> "zero",
  when (n) if n % 2 === 0 -> "even",
  when (_) -> "odd"
}
```

---

## 3. 与现有模式的对比

| 特性 | Pattern Matching | switch | if/else 链 |
|------|-----------------|--------|-----------|
| 解构能力 | ✅ 强大 | ❌ 无 | 手动解构 |
| 守卫条件 | ✅ | ❌ | ✅ |
| 穷尽性检查 | ✅ 编译时 | ❌ | ❌ |
| 表达式形式 | ✅ | ❌ | ❌ |
| 嵌套匹配 | ✅ | ❌ | ❌ |

---

## 4. 类型系统影响

TypeScript 若支持模式匹配，将增强：

- **穷尽性检查**：编译器验证 match 覆盖所有可能情况
- **类型收窄**：模式自动收窄变量类型
- **代数数据类型（ADT）支持**：与 discriminated union 配合

```typescript
// 未来可能的 TS 语法
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const data = match (result) {
  when ({ ok: true, value }) -> value,     // value: T
  when ({ ok: false, error }) -> throw new Error(error)  // error: string
};
// data 被推断为 T（因为错误分支抛出）
```

---

## 5. 当前替代方案

### 5.1 ts-pattern 库

```typescript
import { match, P } from "ts-pattern";

const result = match(response)
  .with({ status: 200, data: P.array() }, (r) => processList(r.data))
  .with({ status: 200, data: P.any }, (r) => processItem(r.data))
  .with({ status: P.number }, (r) => handleError(r.status))
  .exhaustive();
```

### 5.2 自定义模式匹配函数

```javascript
function match(value, cases) {
  for (const [pattern, handler] of cases) {
    if (pattern(value)) return handler(value);
  }
  throw new Error("No match found");
}

const result = match(response, [
  [r => r.status === 200, r => r.data],
  [r => r.status >= 400, r => { throw new Error(r.statusText); }]
]);
```

---

## 6. 时间线与采用策略

| 时间 | 预期 |
|------|------|
| 2025 | Stage 1/2，语法迭代中 |
| 2026 | 可能进入 Stage 3 |
| 2027+ | 若进入 Stage 4，浏览器/Node.js 开始实现 |

**当前建议**：使用 `ts-pattern` 库或传统的 switch + 穷尽性检查模式。

---

**参考资源**：TC39 Pattern Matching Proposal
