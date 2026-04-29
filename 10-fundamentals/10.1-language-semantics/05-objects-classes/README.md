# 对象与类

> JavaScript 对象模型、原型链与 Class 语法。

---

## 对象创建

```javascript
// 对象字面量
const obj = { name: 'Alice', age: 30 }

// 构造函数
function Person(name) { this.name = name }

// Class 语法
class Person {
  constructor(name) { this.name = name }
  greet() { return `Hello, ${this.name}` }
}
```

## 原型链

```javascript
const animal = { speak: () => 'sound' }
const dog = Object.create(animal)
dog.speak = () => 'woof'
```

---

*最后更新: 2026-04-29*
