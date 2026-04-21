# 词法环境变量解析

> 变量查找算法：从当前环境记录到全局的标识符解析
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 变量解析过程

当代码引用一个标识符时，引擎执行以下算法：

```
1. 从当前 LexicalEnvironment 开始
2. 检查 Environment Record 是否有该绑定
   - 有？返回绑定的值
   - 无？检查 OuterEnv（外层环境）
3. 重复步骤 2 直到找到或到达全局环境
4. 全局环境也没有？抛出 ReferenceError
```

---

## 2. 环境记录的绑定类型

| 绑定类型 | 创建时机 | 可写性 | 示例 |
|---------|---------|--------|------|
| 可变绑定 | 执行声明时 | 可 | `let`、`var` |
| 不可变绑定 | 执行声明时 | 不可 | `const` |
| 严格绑定 | 执行声明时 | 可/不可 | 模块导入 |

---

## 3. 标识符解析示例

```javascript
const global = "global";

function outer() {
  const outerVar = "outer";

  function inner() {
    const innerVar = "inner";

    console.log(innerVar);  // 当前环境 → 找到
    console.log(outerVar);  // 当前 → 无 → 外层 → 找到
    console.log(global);    // 当前 → 无 → 外层 → 全局 → 找到
    console.log(unknown);   // 当前 → 无 → ... → 全局 → 无 → ReferenceError
  }

  inner();
}

outer();
```

---

## 4. 动态查找与静态查找

### 4.1 eval 的动态查找

```javascript
let x = "global";

function test() {
  let x = "local";
  eval("console.log(x)"); // "local"（动态查找当前环境）
}

test();
```

### 4.2 with 的对象环境记录

```javascript
const obj = { a: 1 };

with (obj) {
  console.log(a); // 1（从 obj 的环境记录查找）
  a = 2;          // 修改 obj.a
}

console.log(obj.a); // 2
```

`with` 语句将对象转换为环境记录插入作用域链，但已在严格模式废弃。

---

## 5. 全局环境记录

全局环境记录是**复合记录**：

```
Global Environment Record = {
  [[ObjectRecord]]: Object Environment Record,    // 全局对象属性
  [[DeclarativeRecord]]: Declarative Environment Record, // let/const/class
  [[VarNames]]: List<String>,                     // var 声明列表
  [[OuterEnv]]: null
}
```

```javascript
var x = 1;      // 存储在 ObjectRecord → globalThis.x
let y = 2;      // 存储在 DeclarativeRecord
const z = 3;    // 存储在 DeclarativeRecord

console.log("x" in globalThis); // true
console.log("y" in globalThis); // false
console.log("z" in globalThis); // false
```

---

## 6. 模块环境记录

ES Module 使用专门的模块环境记录：

```javascript
// math.js
export const PI = 3.14;
export function add(a, b) { return a + b; }

// app.js
import { PI, add } from "./math.js";
```

模块环境记录特点：

- 导入绑定是**不可变**的间接引用
- 导出绑定可以是局部绑定或间接引用
- 模块的 `this` 是 `undefined`

---

## 7. 性能优化

```javascript
// 作用域链深度影响查找性能
function deep() {
  const a1 = 1;
  function level1() {
    const a2 = 2;
    function level2() {
      const a3 = 3;
      function level3() {
        console.log(a1); // 遍历 3 层作用域链
      }
      level3();
    }
    level2();
  }
  level1();
}
```

现代引擎优化：

- **隐藏类**：将环境记录形状化
- **内联缓存**：缓存变量位置
- **作用域分析**：编译时确定变量位置

---

**参考规范**：ECMA-262 §8.1.1 Environment Records | ECMA-262 §8.3.2 ResolveBinding

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
