# 空值合并与可选链

> ?? 与 ?. 的语义、优先级、性能与实战模式
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 可选链（?.）

### 1.1 基本用法

```javascript
const user = { profile: { name: "Alice" } };

// 安全访问深层属性
const name = user?.profile?.name;     // "Alice"
const bio = user?.profile?.bio;       // undefined（不报错）
const deep = user?.settings?.theme;   // undefined

// 与函数调用结合
const result = someObject?.method?.(); // 如果 method 不存在，返回 undefined

// 与计算属性结合
const key = "name";
const value = user?.profile?.[key]; // "Alice"
```

### 1.2 短路行为

```javascript
// 如果 user 为 nullish，整个表达式短路
const count = user?.getCount?.(); // user 为 null → 返回 undefined

// 不会继续访问 getCount
```

### 1.3 不能用于赋值

```javascript
// ❌ 语法错误
user?.profile?.name = "Bob";

// ✅ 使用条件判断
if (user?.profile) {
  user.profile.name = "Bob";
}
```

---

## 2. 空值合并（??）

### 2.1 基本用法

```javascript
const value = null ?? "default";        // "default"
const value2 = undefined ?? "default";  // "default"
const value3 = 0 ?? "default";          // 0（0 不是 nullish）
const value4 = "" ?? "default";         // ""（空字符串不是 nullish）
const value5 = false ?? "default";      // false（false 不是 nullish）
```

### 2.2 与 || 的区别

```javascript
const count = 0;

console.log(count || 10);  // 10（0 是 falsy）
console.log(count ?? 10);  // 0（0 不是 nullish）

const text = "";
console.log(text || "default"); // "default"
console.log(text ?? "default"); // ""
```

---

## 3. 结合使用

```javascript
// 常见模式：安全访问 + 默认值
const theme = user?.settings?.theme ?? "default";
// 如果 user、settings 或 theme 为 nullish，返回 "default"

// 多层默认值
const port = config?.server?.port ?? 3000;
const host = config?.server?.host ?? "localhost";
```

---

## 4. 优先级注意事项

```javascript
// ?? 不能与 && 或 || 直接混用
const value = a ?? b || c; // ❌ SyntaxError

// 需要使用括号
const value = (a ?? b) || c; // ✅

// 三元运算符中可以混用
const result = condition ? a ?? b : c ?? d; // ✅
```

---

## 5. 实战模式

### 5.1 配置对象默认值

```javascript
function createServer(options) {
  const host = options?.host ?? "localhost";
  const port = options?.port ?? 3000;
  const timeout = options?.timeout ?? 5000;
  return { host, port, timeout };
}
```

### 5.2 函数参数默认值

```javascript
function greet(user) {
  const name = user?.name ?? "Guest";
  const greeting = user?.preferences?.greeting ?? "Hello";
  return `${greeting}, ${name}!`;
}
```

### 5.3 链式安全访问

```javascript
// 深度安全访问
const city = order?.customer?.address?.city ?? "Unknown";

// 安全调用深层方法
const displayName = user?.getDisplayName?.() ?? user?.name ?? "Anonymous";
```

---

## 6. 性能考虑

### 6.1 可选链的编译输出

```javascript
// 源码
const name = user?.profile?.name;

// 编译后（简化）
const name = user == null ? undefined : user.profile == null ? undefined : user.profile.name;
```

### 6.2 短路求值的优势

```javascript
// 可选链在第一个 nullish 处停止
const result = a?.b?.c?.d?.e;
// 如果 a 为 null，不会访问 b、c、d、e

// 对比手动检查
const result = a && a.b && a.b.c && a.b.c.d && a.b.c.d.e;
// 功能相同，但可选链更清晰
```

---

**参考规范**：ECMA-262 §13.5 Optional Chains | ECMA-262 §13.15 Coalesce Expression
