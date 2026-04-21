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

## 5. 实战模式

### 5.1 安全访问与默认值

```javascript
// 多层默认值
const port = config?.server?.port ?? 3000;
const host = config?.server?.host ?? "localhost";
const timeout = config?.server?.timeout ?? 5000;
```

### 5.2 函数参数默认值

```javascript
function greet(user) {
  const name = user?.name ?? "Guest";
  const greeting = user?.preferences?.greeting ?? "Hello";
  return `${greeting}, ${name}!`;
}
```

### 5.3 配置合并

```javascript
const finalConfig = {
  ...defaultConfig,
  host: userConfig.host ?? defaultConfig.host,
  port: userConfig.port || 3000,
  debug: userConfig.debug ?? false
};
```

---

## 6. 逻辑运算与类型收窄

```typescript
// && 收窄类型
function process(value: string | number) {
  if (typeof value === "string" && value.length > 0) {
    // value 被收窄为 string
    console.log(value.toUpperCase());
  }
}

// || 提供默认值
function greet(name: string | undefined) {
  const finalName = name || "Guest";
  // finalName: string
}
```

---

**参考规范**：ECMA-262 §13.12 Binary Logical Operators | ECMA-262 §13.15 Coalesce Expression

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
