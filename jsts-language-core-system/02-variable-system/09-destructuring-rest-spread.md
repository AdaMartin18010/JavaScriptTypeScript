# 解构、剩余与展开

> ES6+ 的解构赋值语法与剩余/展开运算符的完整语义
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 数组解构

```javascript
const [a, b, c] = [1, 2, 3];
console.log(a, b, c); // 1, 2, 3

// 跳过元素
const [, second, , fourth] = [1, 2, 3, 4];
console.log(second, fourth); // 2, 4

// 默认值
const [x = 10, y = 20] = [1];
console.log(x, y); // 1, 20

// 嵌套解构
const [a, [b, c]] = [1, [2, 3]];
```

---

## 2. 对象解构

```javascript
const { name, age } = { name: "Alice", age: 30 };

// 重命名
const { name: fullName, age: years } = { name: "Alice", age: 30 };
console.log(fullName); // "Alice"

// 默认值
const { name, role = "user" } = { name: "Alice" };

// 嵌套解构
const { user: { name } } = { user: { name: "Alice" } };

// 与剩余运算符结合
const { a, b, ...rest } = { a: 1, b: 2, c: 3, d: 4 };
console.log(rest); // { c: 3, d: 4 }
```

---

## 3. 剩余运算符（Rest）

### 3.1 函数参数

```javascript
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4); // 10
```

### 3.2 与解构结合

```javascript
const [first, ...rest] = [1, 2, 3, 4];
console.log(first); // 1
console.log(rest);  // [2, 3, 4]

const { a, ...others } = { a: 1, b: 2, c: 3 };
console.log(others); // { b: 2, c: 3 }
```

### 3.3 注意事项

```javascript
// ❌ 剩余元素必须是最后一个
const [a, ...rest, b] = [1, 2, 3]; // SyntaxError

// ❌ 对象解构中，剩余属性不能赋值给已声明变量
const a = 1;
{ a, ...rest } = { a: 1, b: 2 }; // SyntaxError（需要括号）
({ a, ...rest } = { a: 1, b: 2 }); // ✅
```

---

## 4. 展开运算符（Spread）

### 4.1 数组展开

```javascript
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4]

// 复制数组
const copy = [...arr];

// 合并数组
const merged = [...arr1, ...arr2];
```

### 4.2 对象展开

```javascript
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// 复制对象（浅拷贝）
const copy = { ...obj };

// 覆盖属性
const updated = { ...obj, name: "Bob" }; // 后面的 name 覆盖前面的
```

### 4.3 函数调用

```javascript
const nums = [1, 2, 3];
Math.max(...nums); // 3（等价于 Math.max(1, 2, 3)）
```

---

## 5. 解构的应用模式

### 5.1 函数参数解构

```javascript
// 对象参数解构
function createUser({ name, age, role = "user" }) {
  return { name, age, role };
}

createUser({ name: "Alice", age: 30 });

// 嵌套解构
function processData({ user: { name }, items: [first] }) {
  console.log(name, first);
}
```

### 5.2 交换变量

```javascript
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b); // 2, 1
```

### 5.3 从数组/对象提取

```javascript
// 从正则匹配结果提取
const [, year, month, day] = /(\d{4})-(\d{2})-(\d{2})/.exec("2025-06-15");

// 从 API 响应提取
const { data: { users } } = await fetch("/api/users").then(r => r.json());
```

---

**参考规范**：ECMA-262 §13.15 Destructuring Assignment | ECMA-262 §13.6 Spread Element
