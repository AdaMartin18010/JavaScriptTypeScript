# 执行上下文

> 代码执行的运行时环境：栈帧、this绑定与词法环境
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 执行上下文的结构

```
Execution Context = {
  Code Evaluation State,    // 生成器/异步函数的恢复状态
  Function,                 // 函数对象（函数上下文）或 null（脚本/模块）
  Realm,                    // 关联的 Realm
  ScriptOrModule,           // 脚本或模块记录
  LexicalEnvironment,       // 词法环境（let/const）
  VariableEnvironment,      // 变量环境（var）
  PrivateEnvironment        // 私有字段环境（ES2022）
}
```

---

## 2. 执行上下文的类型

| 类型 | 创建时机 | 特征 |
|------|---------|------|
| 全局执行上下文 | 脚本开始执行 | 全局对象作为词法环境 |
| 函数执行上下文 | 函数被调用 | 包含参数和局部变量 |
| 模块执行上下文 | 模块开始执行 | 模块环境记录 |
| eval 执行上下文 | eval() 调用 | 继承调用者的词法环境 |

---

## 3. 执行上下文栈

```javascript
function a() { b(); }
function b() { c(); }
function c() {
  // 当前执行上下文
  console.trace();
  // c
  // b
  // a
  // (anonymous)
}

a();
```

### 3.1 栈的变化过程

```
Step 1: [Global]
Step 2: [Global, a]
Step 3: [Global, a, b]
Step 4: [Global, a, b, c]  ← 当前执行
Step 5: [Global, a, b]     ← c 返回
Step 6: [Global, a]        ← b 返回
Step 7: [Global]           ← a 返回
```

---

## 4. 词法环境 vs 变量环境

```javascript
var x = 1; // VariableEnvironment
let y = 2; // LexicalEnvironment

function test() {
  var a = 1; // VariableEnvironment
  let b = 2; // LexicalEnvironment

  // 变量环境用于 var
  // 词法环境用于 let/const/function
}
```

| 特性 | VariableEnvironment | LexicalEnvironment |
|------|-------------------|-------------------|
| 用途 | `var` 声明 | `let`/`const`/`function` |
| 初始化 | 进入作用域时 | 执行到声明时 |
| 是否可变更 | 是（重新赋值） | 是（新块级作用域） |

---

## 5. this 绑定

执行上下文的 `this` 绑定取决于调用方式：

```javascript
// 全局上下文
console.log(this); // 全局对象（浏览器 window，Node.js global）

// 函数调用
globalThis.name = "global";
function show() { console.log(this.name); }
show(); // "global"（非严格模式）或 undefined（严格模式）

// 方法调用
const obj = { name: "obj", show };
obj.show(); // "obj"

// 构造函数
function Person(name) { this.name = name; }
const p = new Person("Alice"); // this = 新对象

// 显式绑定
show.call(obj);   // "obj"
show.apply(obj);  // "obj"
show.bind(obj)(); // "obj"

// 箭头函数
const arrow = () => console.log(this.name);
arrow(); // 继承外层 this
```

---

## 6. 异步执行上下文

### 6.1 生成器上下文

```javascript
function* gen() {
  console.log("Start");
  yield 1;           // 暂停，保存执行上下文状态
  console.log("Resume");
  yield 2;
}

const g = gen();
g.next(); // "Start", { value: 1, done: false }
g.next(); // "Resume", { value: 2, done: false }
```

### 6.2 async/await 上下文

```javascript
async function asyncFunc() {
  console.log("Before await");
  await Promise.resolve(); // 暂停，保存状态
  console.log("After await"); // 恢复执行
}
```

`await` 会：

1. 暂停当前执行上下文
2. 保存局部变量和求值状态
3. 将恢复回调加入微任务队列
4. 稍后恢复执行

---

## 7. eval 的执行上下文

```javascript
let x = 1;

function test() {
  let x = 2;
  eval("console.log(x)"); // 2（使用调用者的词法环境）

  eval("var y = 3");      // 污染调用者的变量环境
  console.log(y);         // 3
}
```

`eval` 在执行时会：

- 创建新的执行上下文
- 词法环境指向调用者的词法环境
- 变量环境指向调用者的变量环境（间接 eval 除外）

---

## 8. 调试执行上下文

```javascript
function debug() {
  let local = 42;
  debugger; // Chrome DevTools: Scope 面板查看执行上下文
}
```

DevTools 可查看：

- **Local**：当前函数的局部变量
- **Closure**：闭包捕获的变量
- **Global**：全局对象
- **Script/Module**：脚本/模块级变量

---

**参考规范**：ECMA-262 §9.4 Execution Contexts

## 深入理解：引擎实现与优化

### V8 引擎视角

V8 是 Chrome 和 Node.js 使用的 JavaScript 引擎，其内部实现直接影响本节讨论的机制：

| 组件 | 功能 |
|------|------|
| Ignition | 解释器，生成字节码 |
| Sparkplug | 基线编译器，快速生成本地代码 |
| Maglev | 中层优化编译器，SSA 形式优化 |
| TurboFan | 顶层优化编译器，Sea of Nodes |

### 隐藏类与形状

```javascript
// V8 为相同结构的对象创建隐藏类
const p1 = { x: 1, y: 2 };
const p2 = { x: 3, y: 4 };
// p1 和 p2 共享同一个隐藏类

// 动态添加属性会创建新隐藏类
p1.z = 3; // 降级为字典模式
```

### 内联缓存（Inline Cache）

```javascript
function getX(obj) {
  return obj.x; // V8 缓存属性偏移
}

getX({ x: 1 }); // 单态（monomorphic）
getX({ x: 2 }); // 同类型，快速路径
```

### 性能提示

1. 对象初始化时声明所有属性
2. 避免动态删除属性
3. 数组使用连续数字索引
4. 函数参数类型保持一致

### 相关工具

- Chrome DevTools Performance 面板
- Node.js `--prof` 和 `--prof-process`
- V8 flags: `--trace-opt`, `--trace-deopt`
