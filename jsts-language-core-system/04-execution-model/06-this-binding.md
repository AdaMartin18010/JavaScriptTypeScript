# this 绑定机制

> JavaScript 中最易混淆的概念：this 的四种绑定规则与优先级
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 四种绑定规则

### 1.1 默认绑定（Default Binding）

独立函数调用时，`this` 绑定到全局对象（非严格模式）或 `undefined`（严格模式）：

```javascript
function foo() {
  console.log(this);
}

foo(); // 非严格模式：window/global | 严格模式：undefined
```

### 1.2 隐式绑定（Implicit Binding）

通过对象方法调用时，`this` 绑定到调用它的对象：

```javascript
const obj = {
  name: "Alice",
  greet() {
    console.log(this.name);
  }
};

obj.greet(); // "Alice"
```

### 1.3 显式绑定（Explicit Binding）

使用 `call`、`apply`、`bind` 显式指定 `this`：

```javascript
function greet() {
  console.log(this.name);
}

const alice = { name: "Alice" };
const bob = { name: "Bob" };

greet.call(alice);  // "Alice"
greet.apply(bob);   // "Bob"

const boundGreet = greet.bind(alice);
boundGreet(); // "Alice"
```

### 1.4 new 绑定（Constructor Binding）

使用 `new` 调用函数时，`this` 绑定到新创建的实例：

```javascript
function Person(name) {
  this.name = name;
}

const alice = new Person("Alice");
console.log(alice.name); // "Alice"
```

---

## 2. 绑定优先级

从高到低：

```
new 绑定 > 显式绑定（call/apply/bind）> 隐式绑定 > 默认绑定
```

```javascript
function foo() {
  console.log(this.a);
}

const obj1 = { a: 1, foo };
const obj2 = { a: 2, foo };

obj1.foo.call(obj2); // 2（显式绑定 > 隐式绑定）
```

---

## 3. 箭头函数的 this

箭头函数**不绑定自己的 this**，它捕获外层词法环境的 `this`：

```javascript
const obj = {
  name: "Alice",
  regular: function() {
    console.log(this.name); // "Alice"
  },
  arrow: () => {
    console.log(this.name); // undefined（this 是外层的全局对象）
  }
};

obj.regular(); // "Alice"
obj.arrow();   // undefined
```

箭头函数的 `this` 在定义时确定，不可通过 `call`/`apply`/`bind` 改变：

```javascript
const arrow = () => console.log(this);
arrow.call({ name: "Alice" }); // 仍然输出全局对象/undefined
```

---

## 4. 严格模式影响

```javascript
function strictFoo() {
  "use strict";
  console.log(this); // undefined
}

function sloppyFoo() {
  console.log(this); // window/global
}
```

---

## 5. 类中的 this

### 5.1 类方法的 this

```javascript
class User {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(this.name);
  }
}

const user = new User("Alice");
user.greet(); // "Alice"

// 但提取方法后 this 丢失
const greet = user.greet;
greet(); // undefined（严格模式下）
```

### 5.2 类字段箭头函数

```javascript
class User {
  name = "Alice";
  greet = () => {
    console.log(this.name); // 始终绑定到实例
  }
}

const user = new User();
const greet = user.greet;
greet(); // "Alice"
```

---

## 6. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 回调函数中的 this 丢失 | 方法作为回调传递时 this 改变 | 使用箭头函数或 .bind() |
| DOM 事件处理器的 this | 指向触发事件的元素 | 使用箭头函数或保存 this 引用 |
| 解构方法时的 this 丢失 | `const { method } = obj` | 使用箭头函数或 .bind() |
| setTimeout 中的 this | 指向全局对象 | 使用箭头函数或 .bind() |

---

**参考规范**：ECMA-262 §10.2.1.1 OrdinaryCallBindThis | ECMA-262 §15.3.4 Arrow Function Definitions
