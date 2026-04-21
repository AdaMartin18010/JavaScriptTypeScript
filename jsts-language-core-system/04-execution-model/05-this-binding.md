# this 绑定机制

> this 的四种绑定规则与箭头函数的词法 this
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. this 的四种绑定规则

### 1.1 默认绑定（Default Binding）

```javascript
function greet() {
  console.log(this.name);
}

greet(); // this = global/undefined（严格模式）
```

非严格模式下，`this` 指向全局对象；严格模式下为 `undefined`。

### 1.2 隐式绑定（Implicit Binding）

```javascript
const user = {
  name: "Alice",
  greet() {
    console.log(this.name);
  }
};

user.greet(); // this = user
```

### 1.3 显式绑定（Explicit Binding）

```javascript
function greet() {
  console.log(this.name);
}

const user = { name: "Alice" };

greet.call(user);    // this = user
greet.apply(user);   // this = user
const bound = greet.bind(user);
bound();             // this = user
```

### 1.4 new 绑定（Constructor Binding）

```javascript
function Person(name) {
  this.name = name;
}

const alice = new Person("Alice");
// this = 新创建的 {}
```

---

## 2. 箭头函数的 this

箭头函数没有自己的 `this`，从外层词法作用域继承：

```javascript
const user = {
  name: "Alice",
  greet: () => {
    console.log(this.name); // this = 外层 this（可能是 undefined）
  }
};

// 正确用法
const user2 = {
  name: "Alice",
  greet() {
    setTimeout(() => {
      console.log(this.name); // ✅ this = user2
    }, 0);
  }
};
```

---

## 3. this 绑定优先级

```
new 绑定 > 显式绑定（call/apply/bind）> 隐式绑定 > 默认绑定
```

---

## 4. 常见陷阱

### 4.1 方法提取丢失 this

```javascript
const user = {
  name: "Alice",
  greet() {
    console.log(this.name);
  }
};

const greet = user.greet;
greet(); // ❌ this = undefined（严格模式）

// 解决
greet.call(user);
// 或
const boundGreet = user.greet.bind(user);
```

### 4.2 回调中的 this

```javascript
const user = {
  name: "Alice",
  greet() {
    setTimeout(function() {
      console.log(this.name); // ❌ this = global/undefined
    }, 0);
  }
};

// 解决：使用箭头函数
setTimeout(() => {
  console.log(this.name); // ✅
}, 0);
```

---

**参考规范**：ECMA-262 §10.2.1.1 OrdinaryCallBindThis
