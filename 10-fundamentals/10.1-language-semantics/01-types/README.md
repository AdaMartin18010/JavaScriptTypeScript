# 类型系统基础

> JavaScript 类型系统的核心概念：原始类型、对象类型、类型转换与强制类型。

---

## 原始类型

```javascript
string | number | boolean | null | undefined | symbol | bigint
```

## 类型检测

```javascript
typeof 'hello'     // 'string'
typeof 42          // 'number'
typeof null        // 'object' (历史 bug)
typeof []          // 'object'
Array.isArray([])  // true
```

## 类型转换

```javascript
// 显式转换
Number('42')       // 42
String(42)         // '42'
Boolean(0)         // false

// 隐式转换（避免使用）
[] + {}            // '[object Object]'
{} + []            // 0 (语句块 vs 对象)
```

---

*最后更新: 2026-04-29*
