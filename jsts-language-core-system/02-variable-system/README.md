# 02 变量系统（Variable System）

> JavaScript 变量声明、作用域与生命周期的完整指南
>
> 文件数：9 | 对齐版本：ECMAScript 2025 (ES16)

---

## 学习路径

| # | 文件 | 内容 |
|---|------|------|
| 1 | [01-var-let-const.md](./01-var-let-const.md) | 三种声明方式的语义差异 |
| 2 | [02-hoisting.md](./02-hoisting.md) | 提升机制的本质与 TDZ |
| 3 | [03-temporal-dead-zone.md](./03-temporal-dead-zone.md) | TDZ 的编译期行为 |
| 4 | [04-scope-chain.md](./04-scope-chain.md) | 作用域链与变量查找 |
| 5 | [05-lexical-environment.md](./05-lexical-environment.md) | 词法环境与变量环境 |
| 6 | [06-closure-deep-dive.md](./06-closure-deep-dive.md) | 闭包的内存模型与实战 |
| 7 | [07-global-object.md](./07-global-object.md) | 全局对象与跨环境差异 |
| 8 | [08-symbol-private-state.md](./08-symbol-private-state.md) | Symbol 与私有字段 |
| 9 | [09-destructuring-rest-spread.md](./09-destructuring-rest-spread.md) | 解构、剩余与展开 |

---

## 核心概念速查

```javascript
// var vs let vs const 对比
var x = 1;          // 函数作用域、提升、可重复声明
let y = 2;          // 块级作用域、TDZ、不可重复声明
const z = 3;        // 块级作用域、TDZ、绑定不可变

// 最佳实践：默认 const，需要重新赋值用 let，不用 var
```

---

**相关链接**：

- [JSTS全景综述/01_language_core.md](../JSTS全景综述/01_language_core.md) — 语言核心综述
