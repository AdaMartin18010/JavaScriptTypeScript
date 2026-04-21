# 编译阶段 vs 执行阶段

> JavaScript 的两阶段处理模型：预编译与运行时
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 编译阶段（Parsing & Compilation）

### 1.1 词法分析（Tokenization）

将源代码分割为 Token：

```javascript
// 源码
const x = 42;

// Token 序列
[
  { type: "Keyword", value: "const" },
  { type: "Identifier", value: "x" },
  { type: "Punctuator", value: "=" },
  { type: "Numeric", value: "42" },
  { type: "Punctuator", value: ";" }
]
```

### 1.2 语法分析（Parsing → AST）

根据文法规则将 Token 组织为抽象语法树。

### 1.3 预编译处理

编译阶段完成的关键工作：

- **变量/函数声明提升**：创建环境记录中的绑定
- **作用域分析**：确定变量的词法作用域
- **语法错误检查**：检测语法违规

```javascript
// 编译阶段处理
console.log(x); // 编译时：x 的绑定已创建（var 初始化为 undefined）
var x = 42;
```

### 1.4 字节码生成

```javascript
// 源码
function add(a, b) {
  return a + b;
}

// V8 字节码
CreateClosure [0], [0], #3
Star r0
Return

// add 函数内部：
Ldar a0          // 加载参数 a
Add a1, [0]      // a + b
Return           // 返回
```

---

## 2. 执行阶段（Execution）

### 2.1 全局代码执行

1. 创建全局执行上下文
2. 执行全局代码（逐行）
3. 遇到函数调用 → 创建函数执行上下文

### 2.2 函数调用执行

```javascript
function greet(name) {
  const message = "Hello, " + name;
  return message;
}

greet("Alice");
```

执行过程：

1. 创建函数执行上下文
2. 创建函数环境记录，绑定参数和局部变量
3. 绑定 `this`
4. 执行函数体代码
5. 返回结果，销毁执行上下文

---

## 3. 即时编译（JIT）

### 3.1 基线编译

函数首次被调用时，引擎使用基线编译器快速生成机器码：

```javascript
// 第一次调用
add(1, 2); // Ignition 解释执行，同时收集类型反馈

// 多次调用后，判定为热点代码
add(3, 4); // 触发 Sparkplug 基线编译
add(5, 6); // 执行基线机器码
```

### 3.2 优化编译

基于类型反馈进行推测性优化：

```javascript
// 类型反馈：a 和 b 都是 Smi（小整数）
add(1, 2);
add(3, 4);
add(5, 6);

// TurboFan 生成优化代码：假设参数始终为 number
// 编译为：直接整数加法指令（无类型检查）
```

### 3.3 去优化

当假设不成立时，回退到字节码：

```javascript
// 优化代码假设参数是 number
add("hello", "world"); // 类型不匹配！触发去优化
```

---

## 4. 惰性解析（Lazy Parsing）

### 4.1 预解析（Pre-parsing）

```javascript
function outer() {
  // 预解析阶段：只解析 outer 的头部，记录 inner 的位置
  function inner() {
    return 42;
  }
  return inner;
}

outer(); // 只执行 outer，inner 未被调用
// inner 不会被完全解析，节省时间和内存
```

### 4.2 完全解析的触发条件

- 函数被调用
- 函数被 `eval` 使用
- 函数被 `new Function` 使用

---

## 5. 与类型系统的关系

### 5.1 TypeScript 编译时 vs JS 运行时

```typescript
// TypeScript 编译时（类型检查）
function greet(name: string): string {
  return `Hello, ${name}`;
}

// JavaScript 运行时（类型已擦除）
function greet(name) {
  return "Hello, " + name;
}
```

### 5.2 类型擦除的时机

TypeScript 编译器在**编译阶段**完成类型检查并擦除类型，输出纯 JavaScript。JavaScript 引擎在**编译/执行阶段**处理的是无类型信息的代码。

---

**参考规范**：ECMA-262 §9 Operations on Objects | ECMA-262 §10 ECMAScript Language: Source Text
