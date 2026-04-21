# 解构、剩余参数与展开运算符

> ES6+ 的变量提取与集合操作语法语义
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 解构赋值

### 1.1 数组解构

```javascript
const [a, b] = [1, 2];
console.log(a, b); // 1, 2

// 跳过元素
const [first, , third] = [1, 2, 3];
console.log(first, third); // 1, 3

// 默认值
const [x = 10, y = 20] = [1];
console.log(x, y); // 1, 20
```

### 1.2 对象解构

```javascript
const { name, age } = { name: "Alice", age: 30 };
console.log(name, age); // "Alice", 30

// 重命名
const { name: userName } = { name: "Alice" };
console.log(userName); // "Alice"

// 默认值
const { role = "user" } = { name: "Alice" };
console.log(role); // "user"

// 嵌套解构
const { address: { city } } = { address: { city: "Beijing" } };
console.log(city); // "Beijing"
```

### 1.3 嵌套解构

```javascript
const user = {
  name: "Alice",
  contact: {
    email: "alice@example.com",
    phone: "123-456"
  }
};

const { name, contact: { email } } = user;
console.log(name, email); // "Alice", "alice@example.com"
```

---

## 2. 剩余参数（Rest Parameters）

```javascript
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

console.log(sum(1, 2, 3, 4)); // 10

// 与命名参数结合
function greet(greeting, ...names) {
  return `${greeting}, ${names.join(" and ")}!`;
}

greet("Hello", "Alice", "Bob"); // "Hello, Alice and Bob!"
```

### 2.1 与 arguments 对象的对比

| 特性 | Rest Parameters | arguments |
|------|-----------------|-----------|
| 类型 | 真实数组 | 类数组对象 |
| 箭头函数支持 | ✅ | ❌ |
| 可命名 | ✅ | ❌ |
| 可与其他参数组合 | ✅ | N/A |

---

## 3. 展开运算符（Spread Operator）

### 3.1 数组展开

```javascript
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4]

// 数组拷贝（浅拷贝）
const copy = [...arr1];

// 数组合并
const merged = [...arr1, ...arr2];
```

### 3.2 对象展开（ES2018）

```javascript
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// 对象拷贝（浅拷贝）
const copy = { ...obj1 };

// 覆盖属性
const updated = { ...obj1, b: 20 }; // { a: 1, b: 20 }
```

### 3.3 函数调用展开

```javascript
const nums = [1, 2, 3];
console.log(Math.max(...nums)); // 3（等同于 Math.max(1, 2, 3)）
```

### 3.4 浅拷贝语义

```javascript
const obj = { nested: { value: 1 } };
const copy = { ...obj };

copy.nested.value = 2;
console.log(obj.nested.value); // 2（浅拷贝，nested 被共享）
```

---

## 4. 高级模式

### 4.1 解构与类型注解

```typescript
const { name, age }: { name: string; age: number } = user;

function process({ x, y }: { x: number; y: number }) {
  return x + y;
}
```

### 4.2 剩余元素类型推断

```javascript
const [head, ...tail] = [1, 2, 3, 4];
// head: number, tail: number[]
```

---

## 5. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 对象展开的覆盖行为 | 后面的属性覆盖前面 | 注意展开顺序 |
| 空值解构的默认值触发 | `const { a = 1 } = { a: undefined }` → a = 1 | 理解 undefined 触发默认值，null 不触发 |
| 深层解构的可读性 | 过度嵌套解构难以理解 | 限制嵌套深度，适时使用中间变量 |
| 对象展开与原型属性 | 展开不复制原型属性 | 使用 Object.assign 或手动复制 |

---

**参考规范**：ECMA-262 §13.15 Destructuring Assignment | ECMA-262 §13.6 Spread Syntax
