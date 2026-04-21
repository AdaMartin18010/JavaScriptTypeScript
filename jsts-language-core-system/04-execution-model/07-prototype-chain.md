# 原型链（Prototype Chain）

> 对象继承机制与属性查找算法
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 原型基础

### 1.1 __proto__ 与 prototype

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function() {
  console.log(`${this.name} makes a sound`);
};

const dog = new Animal("Buddy");
console.log(dog.__proto__ === Animal.prototype); // true
dog.speak(); // "Buddy makes a sound"
```

### 1.2 Object.create

```javascript
const proto = { greet() { return "Hello"; } };
const obj = Object.create(proto);

console.log(obj.greet()); // "Hello"
console.log(obj.__proto__ === proto); // true
```

---

## 2. 属性查找算法

```javascript
function getProperty(obj, prop) {
  let current = obj;
  while (current) {
    if (current.hasOwnProperty(prop)) {
      return current[prop];
    }
    current = Object.getPrototypeOf(current);
  }
  return undefined;
}
```

---

## 3. 原型链终点

```javascript
const obj = {};
console.log(obj.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__);          // null
```

所有原型链最终指向 `null`。

---

## 4. ES6 Class 语法糖

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(`${this.name} makes a sound`);
  }
}

class Dog extends Animal {
  speak() {
    console.log(`${this.name} barks`);
  }
}

const dog = new Dog("Buddy");
dog.speak(); // "Buddy barks"
```

---

**参考规范**：ECMA-262 §7.3.19 OrdinaryGetPrototypeOf | ECMA-262 §7.3.2 Get
