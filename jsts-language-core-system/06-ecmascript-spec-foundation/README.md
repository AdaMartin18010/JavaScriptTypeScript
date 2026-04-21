# 06 ECMAScript 规范基础

> ECMA-262 规范核心概念：文法、类型转换、运算符与严格模式
>
> 文件数：4 | 对齐版本：ECMA-262 2025 (ES16)

---

## 学习路径

| # | 文件 | 内容 |
|---|------|------|
| 1 | [01-abstract-operations.md](./01-abstract-operations.md) | 抽象操作与类型转换 |
| 2 | [02-specification-types.md](./02-specification-types.md) | 规范类型：Reference、Completion Record |
| 3 | [03-internal-methods-slots.md](./03-internal-methods-slots.md) | 内部方法与内部槽 |
| 4 | [04-completion-records.md](./04-completion-records.md) | 完成记录与控制流 |

---

## 核心概念速查

```javascript
// 类型转换
"1" == 1     // true（字符串转数字）
null == undefined // true
0 == false   // true

// 严格模式
"use strict";
x = 1; // ReferenceError
```

---

**相关链接**：

- [ECMA-262 规范](https://tc39.es/ecma262/)
