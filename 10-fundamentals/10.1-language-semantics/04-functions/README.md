# 函数

> JavaScript 函数的定义、调用模式与高级特性。

---

## 函数定义

```javascript
// 函数声明
function greet(name) { return `Hello, ${name}` }

// 函数表达式
const greet = function(name) { return `Hello, ${name}` }

// 箭头函数
const greet = (name) => `Hello, ${name}`

// 方法简写
const obj = { greet(name) { return `Hello, ${name}` } }
```

## this 绑定

```javascript
const obj = {
  name: 'Alice',
  greet() { return this.name },        // 'Alice'
  arrow: () => this.name               // 外层 this
}
```

---

*最后更新: 2026-04-29*
