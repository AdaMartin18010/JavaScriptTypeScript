# 编译阶段 vs 执行阶段

> JavaScript 的两阶段处理模型：解析、编译与运行时的完整流程
>
> 对齐版本：ECMAScript 2025 (ES16) | V8 12.x

---

## 1. 编译阶段（Parsing & Compilation）

### 1.1 词法分析（Tokenization）

JavaScript 源码首先被分割为 Token 序列：

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

根据 ECMA-262 文法将 Token 组织为抽象语法树（AST）：

```javascript
// 源码
function add(a, b) { return a + b; }

// ESTree 格式 AST（简化）
{
  type: "FunctionDeclaration",
  id: { type: "Identifier", name: "add" },
  params: [
    { type: "Identifier", name: "a" },
    { type: "Identifier", name: "b" }
  ],
  body: {
    type: "BlockStatement",
    body: [{
      type: "ReturnStatement",
      argument: {
        type: "BinaryExpression",
        operator: "+",
        left: { type: "Identifier", name: "a" },
        right: { type: "Identifier", name: "b" }
      }
    }]
  }
}
```

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

### 1.4 字节码生成（Ignition）

```javascript
// 源码
function add(a, b) {
  return a + b;
}

// V8 Ignition 字节码
CreateClosure [0], [0], #3
Star r0
Return

// add 函数内部：
Ldar a1          // 加载参数 a
Add a0, [0]      // a + b，[0] 是 FeedbackVector 槽位
Return           // 返回结果
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

### 3.1 基线编译（Sparkplug）

函数首次被调用时，引擎使用 Sparkplug 快速生成机器码：

```javascript
// 第一次调用
add(1, 2); // Ignition 解释执行，同时收集类型反馈

// ~8 次调用后，判定为温代码
add(3, 4); // 触发 Sparkplug 基线编译
add(5, 6); // 执行基线机器码
```

### 3.2 优化编译（Maglev & TurboFan）

基于类型反馈进行推测性优化：

```javascript
// 类型反馈：a 和 b 都是 Smi（小整数）
add(1, 2);
add(3, 4);
add(5, 6);

// Maglev（~500 次调用）：生成优化代码
// TurboFan（~6000 次调用）：生成高度优化代码
// 假设参数始终为 number，编译为直接整数加法指令
```

### 3.3 去优化（Deoptimization）

当假设不成立时，回退到字节码：

```javascript
// 优化代码假设参数是 number
add("hello", "world"); // 类型不匹配！触发去优化
// 回退到 Ignition 字节码执行
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
- 函数被 `Function.prototype.toString()` 调用

---

## 5. TypeScript 编译时 vs JavaScript 运行时

### 5.1 类型擦除

TypeScript 编译器在**编译阶段**完成类型检查并擦除类型：

```typescript
// TypeScript 源码
function greet(name: string): string {
  return `Hello, ${name}`;
}

// JavaScript 输出（类型已擦除）
function greet(name) {
  return "Hello, " + name;
}
```

### 5.2 Node.js 23.6+ 直接运行 TypeScript

Node.js 23.6+ 支持直接运行 TypeScript 文件（实验性），但仅支持**可擦除语法**：

```typescript
// ✅ 可直接运行（类型注解可擦除）
const greeting: string = "Hello";
function add(a: number, b: number): number {
  return a + b;
}

// ❌ 不可直接运行（有运行时代码）
enum Direction { Up, Down } // enum 生成运行时代码
class Point {
  constructor(public x: number) {} // 参数属性
}
```

```bash
# Node.js 直接运行 TypeScript
node --experimental-strip-types app.ts
```

---

**参考规范**：ECMA-262 §9 Operations on Objects | ECMA-262 §10 ECMAScript Language: Source Text
