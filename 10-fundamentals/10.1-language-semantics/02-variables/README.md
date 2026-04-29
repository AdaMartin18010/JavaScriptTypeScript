# 变量系统

> JavaScript 变量声明、作用域与提升机制。

---

## 声明方式

```javascript
var     // 函数作用域，可提升，可重复声明 — 避免使用
let     // 块作用域，不可提升，不可重复声明
const   // 块作用域，不可重新赋值 — 默认选择
```

## 作用域

```javascript
// 词法作用域
function outer() {
  const a = 1
  function inner() {
    console.log(a) // 1 — 闭包访问外部变量
  }
  inner()
}

// TDZ（Temporal Dead Zone）
console.log(b) // ReferenceError
let b = 2
```

---

*最后更新: 2026-04-29*
