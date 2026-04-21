# 规范类型（Specification Types）

> ECMA-262 内部使用的抽象类型：Reference、List、Completion Record 等
>
> 对齐版本：ECMA-262 2025 (ES16)

---

## 1. 规范类型概述

ECMA-262 定义了 JavaScript 语言类型（Number、String 等）和规范类型。规范类型仅在规范算法内部使用，对 JavaScript 代码不可见。

| 规范类型 | 用途 |
|---------|------|
| Reference | 解析标识符的结果 |
| List | 有序值集合 |
| Completion Record | 语句/表达式的执行结果 |
| Property Descriptor | 对象属性的特征 |
| Environment Record | 变量绑定的存储 |
| Abstract Closure | 抽象闭包 |

---

## 2. Reference 类型

Reference 是解析标识符（如变量名）的结果，包含三个组件：

```
Reference = {
  [[Base]]: Object | Environment Record | undefined,
  [[ReferencedName]]: String | Symbol,
  [[Strict]]: Boolean
}
```

### 2.1 示例

```javascript
// 解析 foo 得到 Reference
const foo = 1;
// Reference: { [[Base]]: Environment Record, [[ReferencedName]]: "foo", [[Strict]]: false }

// 解析 obj.prop 得到 Reference
const obj = { prop: 1 };
obj.prop;
// Reference: { [[Base]]: obj, [[ReferencedName]]: "prop", [[Strict]]: false }
```

### 2.2 GetValue 操作

从 Reference 中提取值：

```javascript
// 伪代码
function GetValue(V) {
  if (!IsReference(V)) return V;
  const base = V.[[Base]];
  if (base === undefined) throw ReferenceError;
  // ... 从 base 中获取属性值
}
```

---

## 3. Completion Record 类型

所有语句都返回 Completion Record：

```
Completion Record = {
  [[Type]]: normal | break | continue | return | throw,
  [[Value]]: any,
  [[Target]]: String | empty
}
```

### 3.1 类型说明

| [[Type]] | 含义 |
|---------|------|
| normal | 正常完成 |
| break | break 语句 |
| continue | continue 语句 |
| return | return 语句 |
| throw | throw 语句 |

### 3.2 示例

```javascript
// 表达式返回 Normal Completion
1 + 1;
// Completion: { [[Type]]: normal, [[Value]]: 2, [[Target]]: empty }

// return 语句返回 Return Completion
return 42;
// Completion: { [[Type]]: return, [[Value]]: 42, [[Target]]: empty }

// throw 返回 Throw Completion
throw new Error();
// Completion: { [[Type]]: throw, [[Value]]: Error, [[Target]]: empty }
```

---

## 4. Property Descriptor

```
Property Descriptor = {
  [[Value]]: any,
  [[Writable]]: Boolean,
  [[Get]]: Function | undefined,
  [[Set]]: Function | undefined,
  [[Enumerable]]: Boolean,
  [[Configurable]]: Boolean
}
```

```javascript
const obj = { x: 1 };
Object.getOwnPropertyDescriptor(obj, "x");
// { value: 1, writable: true, enumerable: true, configurable: true }
```

---

## 5. Environment Record

环境记录存储变量绑定：

```
Environment Record = {
  // Declarative Environment Record
  // 或
  // Object Environment Record
}
```

详见 [02-variable-system/05-lexical-environment.md](../02-variable-system/05-lexical-environment.md)。

---

**参考规范**：ECMA-262 §6.2.4 The Reference Specification Type | ECMA-262 §6.2.3 Completion Record Specification Type
