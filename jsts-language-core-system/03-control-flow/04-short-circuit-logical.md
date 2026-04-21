# 短路逻辑运算

> &&、||、?? 的短路求值、逻辑赋值与实战模式
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 逻辑与（&&）

```javascript
// 如果左操作数为 falsy，返回左操作数
false && anything(); // false（anything() 不会执行）
0 && anything();     // 0
"" && anything();    // ""
null && anything();  // null

// 如果左操作数为 truthy，返回右操作数
true && 42;          // 42
1 && "hello";        // "hello"
```

### 1.1 条件执行模式

```javascript
// 短路执行
isValid && processData();
// 等价于
if (isValid) processData();

// 多个条件
user && user.isActive && user.hasPermission && executeAction();
```

---

## 2. 逻辑或（||）

```javascript
// 如果左操作数为 truthy，返回左操作数
true || anything();  // true（anything() 不会执行）
1 || anything();     // 1
"hello" || anything(); // "hello"

// 如果左操作数为 falsy，返回右操作数
false || 42;         // 42
0 || "default";      // "default"
null || "default";   // "default"
```

### 2.1 默认值模式

```javascript
const value = userInput || "default";

// ⚠️ 注意：0、""、false 也是 falsy
const count = userCount || 10; // 如果 userCount 是 0，结果为 10（可能不是预期）
```

---

## 3. 空值合并（??）

```javascript
// 如果左操作数为 nullish（null 或 undefined），返回右操作数
null ?? "default";      // "default"
undefined ?? "default"; // "default"

// 如果左操作数为非 nullish，返回左操作数
0 ?? "default";         // 0
"" ?? "default";        // ""
false ?? "default";     // false
```

### 3.1 与 || 的区别

```javascript
const count = 0;

console.log(count || 10);  // 10（0 是 falsy）
console.log(count ?? 10);  // 0（0 不是 nullish）
```

### 3.2 不可与 &&、|| 混用

```javascript
// ❌ 语法错误
const value = a ?? b || c;

// ✅ 使用括号
const value = (a ?? b) || c;
```

---

## 4. 逻辑赋值运算符（ES2021）

```javascript
let a = 1;
a &&= 2; // a = a && 2 → a = 1（1 是 truthy，但返回 1）

let b = 0;
b ||= 3; // b = b || 3 → b = 3

let c = null;
c ??= 4; // c = c ?? 4 → c = 4
```

### 4.1 使用场景

```javascript
// 仅在属性存在时赋值
obj.prop &&= newValue;

// 设置默认值
obj.prop ||= defaultValue;

// 仅在 nullish 时赋值
obj.prop ??= defaultValue;
```

---

## 5. 可选链与空值合并结合

```javascript
const theme = user?.settings?.theme ?? "default";
// 如果 user、settings 或 theme 为 nullish，返回 "default"
```

---

**参考规范**：ECMA-262 §13.12 Binary Logical Operators | ECMA-262 §13.15 Coalesce Expression
