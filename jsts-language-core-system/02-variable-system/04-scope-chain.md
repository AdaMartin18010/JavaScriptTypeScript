# 作用域链

> 变量解析机制：从当前作用域到全局的查找路径
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 作用域链的定义

作用域链是**变量解析的路径**，从当前词法环境向外层链接：

```javascript
const global = "global";

function outer() {
  const outerVar = "outer";
  
  function middle() {
    const middleVar = "middle";
    
    function inner() {
      const innerVar = "inner";
      console.log(innerVar);  // inner（当前作用域）
      console.log(middleVar); // middle（外层作用域）
      console.log(outerVar);  // outer（更外层）
      console.log(global);    // global（全局作用域）
    }
    
    inner();
  }
  
  middle();
}

outer();
```

作用域链：`inner → middle → outer → global → null`

---

## 2. 词法作用域 vs 动态作用域

| 特性 | 词法作用域（JavaScript） | 动态作用域 |
|------|------------------------|-----------|
| 解析时机 | 定义时 | 调用时 |
| 依赖 | 代码结构 | 调用栈 |
| 可预测性 | 高 | 低 |
| 闭包支持 | 是 | 否 |

```javascript
const x = "global";

function log() {
  console.log(x); // 词法作用域：总是 "global"
}

function test() {
  const x = "local";
  log(); // 输出 "global"（不是 "local"）
}

test();
```

---

## 3. 作用域类型

### 3.1 全局作用域

```javascript
const globalVar = "I'm global";

function useGlobal() {
  console.log(globalVar); // 通过作用域链访问
}
```

### 3.2 函数作用域

```javascript
function scope() {
  var funcVar = "function scoped";
  let blockVar = "block scoped";
  
  if (true) {
    var funcVar2 = "also function scoped"; // var 穿透 if 块
    let blockVar2 = "block scoped";        // let 只在 if 块内
  }
  
  console.log(funcVar2); // ✅ 可访问
  console.log(blockVar2); // ❌ ReferenceError
}
```

### 3.3 块级作用域

```javascript
{
  let blockVar = "block";
  const BLOCK_CONST = "const";
}
// blockVar 和 BLOCK_CONST 不可访问

// for 循环的块级作用域
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2
}
// i 不可访问
```

### 3.4 模块作用域

```javascript
// module.js
const moduleVar = "module scoped";
export const exported = "exported";

// 其他文件无法访问 moduleVar，除非导出
```

---

## 4. 变量遮蔽（Shadowing）

```javascript
const x = "outer";

function test() {
  const x = "inner"; // 遮蔽外层 x
  console.log(x);    // "inner"
  
  if (true) {
    const x = "block"; // 再次遮蔽
    console.log(x);    // "block"
  }
  
  console.log(x); // "inner"（块级 x 已释放）
}

test();
console.log(x); // "outer"
```

### 4.1 var 的特殊行为

```javascript
var x = "global";

function test() {
  console.log(x); // undefined（不是 "global"！）
  var x = "local";
}

test();
```

`var` 的声明提升导致内部 `x` 在函数开始时已存在（值为 undefined），遮蔽了全局 `x`。

---

## 5. 作用域链与闭包

```javascript
function createCounter() {
  let count = 0; // 被闭包捕获
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const counter = createCounter();
counter.increment(); // count = 1
counter.increment(); // count = 2
console.log(counter.getCount()); // 2
```

`createCounter` 返回后，其词法环境仍被闭包引用，保留在内存中。

### 5.1 闭包的内存模型

```javascript
function outer() {
  let a = 1;
  let b = 2; // 未被引用，可被优化释放
  
  return function inner() {
    return a; // 只引用 a
  };
}

const fn = outer();
// 理论上引擎可以只保留 a，释放 b
```

---

## 6. with 语句与作用域链

```javascript
const obj = { a: 1, b: 2 };

with (obj) {
  console.log(a); // 1（obj.a）
  a = 3;          // 修改 obj.a
  const c = 4;    // 局部变量，不在 obj 上
}

console.log(obj.a); // 3
```

`with` 将对象插入作用域链前端，但已在严格模式废弃。

---

## 7. 作用域链的性能

```javascript
// 深层作用域链查找较慢
function deep() {
  const a1 = 1;
  function level1() {
    const a2 = 2;
    function level2() {
      const a3 = 3;
      function level3() {
        console.log(a1); // 需要遍历 3 层作用域链
      }
      level3();
    }
    level2();
  }
  level1();
}
```

现代引擎（V8）优化：
- 将频繁访问的变量提升到本地上下文
- 使用隐藏类加速属性查找

---

**参考规范**：ECMA-262 §8.1 Lexical Environments | ECMA-262 §8.2 Resolution of Binding

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
