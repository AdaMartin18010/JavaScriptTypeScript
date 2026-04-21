# Symbol 与私有状态

> 使用 Symbol 和 WeakMap 实现真正的私有状态
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. Symbol 基础

### 1.1 Symbol 的创建与唯一性

```javascript
const s1 = Symbol("description");
const s2 = Symbol("description");
console.log(s1 === s2); // false（即使描述相同，Symbol 也是唯一的）
```

### 1.2 全局 Symbol 注册表

```javascript
const global1 = Symbol.for("app.id");
const global2 = Symbol.for("app.id");
console.log(global1 === global2); // true

console.log(Symbol.keyFor(global1)); // "app.id"
```

### 1.3 Well-known Symbols

```javascript
// 控制对象的内置行为
const obj = {
  [Symbol.iterator]: function* () {
    yield 1;
    yield 2;
    yield 3;
  }
};

console.log([...obj]); // [1, 2, 3]
```

| Well-known Symbol | 作用 |
|-------------------|------|
| `Symbol.iterator` | 定义默认迭代器 |
| `Symbol.toStringTag` | 控制 Object.prototype.toString 输出 |
| `Symbol.hasInstance` | 控制 instanceof 行为 |
| `Symbol.toPrimitive` | 控制对象到原始值的转换 |
| `Symbol.asyncIterator` | 定义异步迭代器 |

---

## 2. Symbol 作为属性键

```javascript
const privateKey = Symbol("private");

class MyClass {
  constructor() {
    this[privateKey] = "secret";
    this.public = "public";
  }
}

const obj = new MyClass();
console.log(obj.public);       // "public"
console.log(obj[privateKey]);  // "secret"
console.log(Object.keys(obj)); // ["public"]（Symbol 键不可枚举）
```

---

## 3. WeakMap / WeakSet

### 3.1 弱引用语义

```javascript
const weakMap = new WeakMap();
let obj = {};
weakMap.set(obj, "private data");

obj = null; // 对象不再被引用
// GC 可以回收该对象，WeakMap 中的条目自动消失
```

### 3.2 键必须是对象

```javascript
weakMap.set("key", "value"); // ❌ TypeError: Invalid value used as weak map key
```

---

## 4. 私有状态模式对比

| 方案 | 私有性 | 可枚举性 | 性能 | 调试 |
|------|--------|---------|------|------|
| Symbol 属性 | 中等（可通过反射访问）| 不可枚举 | 好 | 一般 |
| WeakMap | 强（外部无法访问）| N/A | 一般 | 差 |
| 类私有字段 `#` | 强（语言级私有）| 不可枚举 | 好 | 好 |
| 闭包 | 强 | N/A | 一般 | 差 |

### 4.1 类私有字段（ES2022）

```javascript
class User {
  #name; // 真正私有的字段
  
  constructor(name) {
    this.#name = name;
  }
  
  getName() {
    return this.#name;
  }
}

const user = new User("Alice");
console.log(user.getName()); // "Alice"
// console.log(user.#name);  // ❌ SyntaxError: Private field must be declared
```

### 4.2 WeakMap 私有数据

```javascript
const privateData = new WeakMap();

class User {
  constructor(name) {
    privateData.set(this, { name, createdAt: Date.now() });
  }
  
  getName() {
    return privateData.get(this).name;
  }
}
```

---

## 5. 选用策略

- **现代环境（ES2022+）**：优先使用 `#` 私有字段
- **需要外部完全不可访问**：使用 WeakMap
- **需要可枚举但隐藏**：使用 Symbol
- **兼容旧环境**：使用闭包或 Symbol

---

**参考规范**：ECMA-262 §6.1.5 The Symbol Type | ECMA-262 §24.3 WeakMap Objects | ECMA-262 §15.7 Private Names
