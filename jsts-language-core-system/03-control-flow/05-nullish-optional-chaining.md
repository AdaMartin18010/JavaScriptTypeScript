# 空值合并与可选链

> ??、?. 的安全访问与默认值机制
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 可选链（?.）

安全地访问嵌套属性，避免 `Cannot read property of undefined`：

```javascript
const user = {
  profile: {
    name: "Alice",
    address: {
      city: "Beijing"
    }
  }
};

// ✅ 可选链
console.log(user?.profile?.name);           // "Alice"
console.log(user?.profile?.email);          // undefined
console.log(user?.profile?.address?.city);  // "Beijing"
console.log(user?.profile?.address?.zip);   // undefined

// ❌ 不使用可选链
console.log(user.profile.email); // TypeError!
```

### 1.1 可选链的语法形式

```javascript
// 属性访问
obj?.prop
obj?.[expr]

// 函数调用
func?.(arg1, arg2)

// 数组访问
arr?.[index]
```

### 1.2 短路行为

```javascript
const obj = null;

// 一旦遇到 null/undefined，后续不再求值
console.log(obj?.prop.nested.deep); // undefined
// obj 是 null，所以 .prop.nested.deep 不会执行
```

---

## 2. 空值合并（??）

仅对 `null` 和 `undefined` 使用默认值：

```javascript
const value1 = null ?? "default";      // "default"
const value2 = undefined ?? "default"; // "default"
const value3 = 0 ?? "default";         // 0（0 不是 nullish）
const value4 = "" ?? "default";        // ""（空字符串不是 nullish）
const value5 = false ?? "default";     // false（false 不是 nullish）
```

### 2.1 与 || 的区别

```javascript
const count = 0;

// || 将 0 视为 falsy
const withOr = count || 10;      // 10（可能不是预期）

// ?? 仅对 null/undefined
const withNullish = count ?? 10; // 0（正确）
```

### 2.2 不能与 &&、|| 混用

```javascript
// ❌ 语法错误
const value = a ?? b || c;

// ✅ 使用括号
const value = (a ?? b) || c;
```

---

## 3. 组合使用

```javascript
// 安全访问 + 默认值
const city = user?.profile?.address?.city ?? "Unknown";

// 函数调用安全
const result = obj?.method?.(arg) ?? defaultValue;

// 数组安全访问
const first = arr?.[0] ?? null;
```

---

## 4. 逻辑赋值运算符（ES2021）

```javascript
let a = null;
a ??= "default"; // a = a ?? "default" → "default"

let b = 0;
b ??= 10; // b = 0（0 不是 nullish）

let c;
c &&= "value"; // c 未赋值（undefined），不执行

let d = true;
d &&= "value"; // d = "value"
```

---

## 5. 实际应用模式

### 5.1 配置默认值

```javascript
function createServer(options) {
  const config = {
    host: options?.host ?? "localhost",
    port: options?.port ?? 3000,
    timeout: options?.timeout ?? 5000,
    ssl: options?.ssl ?? false
  };
  return config;
}
```

### 5.2 DOM 操作

```javascript
const text = document?.querySelector?.(".title")?.textContent ?? "";
```

### 5.3 API 响应处理

```javascript
const userName = response?.data?.user?.profile?.name ?? "Guest";
```

---

## 6. 性能考虑

```javascript
// 可选链有轻微运行时开销
// 在热路径中，考虑前置检查

// 可选链
function getName1(user) {
  return user?.profile?.name;
}

// 等效但更冗长的写法（无语法糖）
function getName2(user) {
  return user == null ? undefined
    : user.profile == null ? undefined
    : user.profile.name;
}
```

---

**参考规范**：ECMA-262 §13.5 Optional Chains | ECMA-262 §13.12 Coalesce Expression

## 扩展话题：相关规范与实现细节

### 规范引用

ECMA-262 规范详细定义了本节所有机制。关键章节包括：
- §6.2.3 Completion Record 规范
- §9.1 Environment Records
- §9.4 Execution Contexts
- §10.2.1.1 OrdinaryCallBindThis

### 引擎实现差异

| 引擎 | 相关实现 |
|------|---------|
| V8 (Chrome/Node) | 快速属性访问、隐藏类优化 |
| SpiderMonkey (Firefox) | 形状(shape)系统、基线编译器 |
| JavaScriptCore (Safari) | DFG/FTL 编译器、类型推断 |

### 调试技巧

`javascript
// 使用 Chrome DevTools 检查内部状态
debugger; // 在 Sources 面板查看 Scope 链

// 使用 console.trace() 查看调用栈
function deep() {
  console.trace("Current stack");
}
`

### 常见面试题

1. 解释暂时性死区(TDZ)及其产生原因
2. var/let/const 的区别是什么？
3. 函数声明和函数表达式的提升行为有何不同？
4. 解释 this 的四种绑定规则
5. 什么是闭包？它如何工作？

### 推荐阅读

- ECMA-262 规范官方文档
- TypeScript Handbook
- You Don't Know JS (Kyle Simpson)
- JavaScript: The Definitive Guide

## 深入理解：内存模型与性能

### 内存布局

JavaScript 引擎在内存中组织对象和变量：

`
栈内存（Stack）：
  - 原始值（number, string, boolean等）
  - 函数调用帧
  - 局部变量引用

堆内存（Heap）：
  - 对象
  - 函数闭包
  - 大型数据结构
`

### V8 优化技术

| 技术 | 描述 |
|------|------|
| 隐藏类 | 为对象创建内部形状描述 |
| 内联缓存 | 缓存属性查找位置 |
| 标量替换 | 将小对象分解为局部变量 |
| 逃逸分析 | 确定对象是否离开作用域 |

### 性能基准

`javascript
// 快速属性访问（单态）
obj.x; // 优化：直接偏移访问

// 多态属性访问
if (condition) obj = { x: 1 }; else obj = { x: 2, y: 3 };
obj.x; // 降级：字典查找
`

### 垃圾回收影响

`javascript
// 减少 GC 压力
function process() {
  const data = new Array(1000000);
  // 使用 data...
  // 函数返回后，data 可被回收
}

// 避免内存泄漏
let cache = {};
// 定期清理或使用 WeakMap
`

### 最佳实践总结

1. **优先使用 const**：不可变性帮助引擎优化
2. **避免动态属性**：稳定结构利于隐藏类
3. **减少嵌套深度**：浅层作用域链查找更快
4. **使用箭头函数**：减少 this 绑定开销
5. **缓存频繁访问**：将深层属性提取到局部变量
