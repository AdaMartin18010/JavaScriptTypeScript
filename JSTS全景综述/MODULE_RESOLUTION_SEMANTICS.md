---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# JavaScript/TypeScript 模块解析语义深度解析

> 本文档深入解析 JavaScript 生态系统中模块解析的各种语义，包括 ESM、CJS、TypeScript 模块策略以及最新的语言特性。

---

## 目录

- [JavaScript/TypeScript 模块解析语义深度解析](#javascripttypescript-模块解析语义深度解析)
  - [目录](#目录)
  - [1. ESM 模块语义（ECMA-262 规范）](#1-esm-模块语义ecma-262-规范)
    - [1.1 核心概念](#11-核心概念)
    - [1.2 模块加载生命周期](#12-模块加载生命周期)
    - [1.3 导入导出语法详解](#13-导入导出语法详解)
      - [命名导出/导入](#命名导出导入)
      - [默认导出/导入](#默认导出导入)
      - [混合导入](#混合导入)
    - [1.4 实时绑定（Live Binding）机制](#14-实时绑定live-binding机制)
    - [1.5 循环依赖处理](#15-循环依赖处理)
    - [1.6 模块标识符解析算法](#16-模块标识符解析算法)
  - [2. CJS 模块语义（Node.js 文档）](#2-cjs-模块语义nodejs-文档)
    - [2.1 核心概念](#21-核心概念)
    - [2.2 模块包装器](#22-模块包装器)
    - [2.3 导出机制详解](#23-导出机制详解)
      - [module.exports vs exports](#moduleexports-vs-exports)
    - [2.4 require 解析算法](#24-require-解析算法)
    - [2.5 require 缓存机制](#25-require-缓存机制)
    - [2.6 循环依赖处理](#26-循环依赖处理)
  - [3. ESM/CJS 互操作语义（Node.js 22+ 新特性）](#3-esmcjs-互操作语义nodejs-22-新特性)
    - [3.1 互操作演进历程](#31-互操作演进历程)
    - [3.2 ESM 导入 CJS](#32-esm-导入-cjs)
      - [基本语法](#基本语法)
      - [命名空间分析（Node.js 算法）](#命名空间分析nodejs-算法)
    - [3.3 CJS 导入 ESM（Node.js 22+）](#33-cjs-导入-esmnodejs-22)
    - [3.4 互操作边界情况](#34-互操作边界情况)
    - [3.5 条件导出（Conditional Exports）](#35-条件导出conditional-exports)
  - [4. TypeScript 模块解析策略](#4-typescript-模块解析策略)
    - [4.1 四种模块解析策略对比](#41-四种模块解析策略对比)
    - [4.2 配置与影响矩阵](#42-配置与影响矩阵)
    - [4.3 Node 策略详解](#43-node-策略详解)
    - [4.4 NodeNext 策略详解](#44-nodenext-策略详解)
    - [4.5 Bundler 策略详解](#45-bundler-策略详解)
    - [4.6 类型声明文件解析](#46-类型声明文件解析)
  - [5. import defer 语义（Stage 3 提案）](#5-import-defer-语义stage-3-提案)
    - [5.1 提案概述](#51-提案概述)
    - [5.2 语义详解](#52-语义详解)
    - [5.3 语法变体](#53-语法变体)
    - [5.4 与动态导入的对比](#54-与动态导入的对比)
    - [5.5 实际使用场景](#55-实际使用场景)
    - [5.6 提案当前状态](#56-提案当前状态)
  - [6. 模块加载的时序和副作用分析](#6-模块加载的时序和副作用分析)
    - [6.1 模块执行顺序基础](#61-模块执行顺序基础)
    - [6.2 副作用与纯模块](#62-副作用与纯模块)
    - [6.3 时序问题案例分析](#63-时序问题案例分析)
      - [案例 1: 初始化顺序依赖](#案例-1-初始化顺序依赖)
      - [案例 2: 动态配置问题](#案例-2-动态配置问题)
    - [6.4 微任务与模块执行](#64-微任务与模块执行)
    - [6.5 顶层 await 的影响](#65-顶层-await-的影响)
    - [6.6 副作用管理最佳实践](#66-副作用管理最佳实践)
    - [6.7 模块加载性能优化](#67-模块加载性能优化)
  - [附录](#附录)
    - [A. 快速参考卡片](#a-快速参考卡片)
    - [B. 常见错误与解决方案](#b-常见错误与解决方案)

---

## 1. ESM 模块语义（ECMA-262 规范）

### 1.1 核心概念

ECMAScript 模块（ESM）是基于规范的静态模块系统，具有以下关键特性：

| 特性 | 说明 |
|------|------|
| **静态结构** | 导入/导出在解析阶段确定，不可动态修改 |
| **严格模式** | 自动启用严格模式，无需 `'use strict'` |
| **独立作用域** | 每个模块拥有独立的作用域 |
| **单例模式** | 同一模块在同一上下文中只加载执行一次 |
| **实时绑定** | 导出的是绑定（binding）而非值 |

### 1.2 模块加载生命周期

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESM 模块加载生命周期                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │  1. 构造    │───▶│  2. 实例化   │───▶│  3. 求值 (Evaluate) │ │
│  │  (Construct)│    │ (Instantiate)│    │                     │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
│         │                  │                    │               │
│         ▼                  ▼                    ▼               │
│    ┌──────────┐      ┌──────────┐        ┌──────────────┐      │
│    │ 查找并加 │      │ 创建环境 │        │ 执行模块顶层 │      │
│    │ 载源码  │      │ 记录、建 │        │ 代码，处理   │      │
│    │ 解析为   │      │ 立导入导 │        │ 副作用       │      │
│    │ Module   │      │ 出绑定   │        │              │      │
│    │ Record   │      │          │        │              │      │
│    └──────────┘      └──────────┘        └──────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 导入导出语法详解

#### 命名导出/导入

```javascript
// ===== math.js =====
// 导出声明
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export class Calculator { /* ... */ }

// 重命名导出
export { add as addNumbers, PI as PI_CONSTANT };

// ===== main.js =====
// 命名导入
import { PI, add, Calculator } from './math.js';

// 重命名导入
import { add as sum, PI as MATH_PI } from './math.js';

// 命名空间导入
import * as math from './math.js';
console.log(math.PI);  // 3.14159
```

#### 默认导出/导入

```javascript
// ===== utils.js =====
// 默认导出（每个模块只能有一个）
export default function greet(name) {
  return `Hello, ${name}!`;
}

// 也可以导出匿名值
export default 42;
export default { foo: 'bar' };
export default class MyClass { }

// ===== main.js =====
// 默认导入（名称可以任意）
import greet from './utils.js';
import myDefault from './utils.js';  // 任意合法标识符
```

#### 混合导入

```javascript
// ===== module.js =====
export const named = 'named export';
export default 'default export';

// ===== main.js =====
// 同时导入默认和命名导出
import myDefault, { named } from './module.js';
import myDefault, * as namespace from './module.js';
```

### 1.4 实时绑定（Live Binding）机制

```javascript
// ===== counter.js =====
export let count = 0;

export function increment() {
  count++;
}

// ===== main.js =====
import { count, increment } from './counter.js';

console.log(count);  // 0
increment();
console.log(count);  // 1（实时反映导出模块的变化）

// 注意：不能重新赋值导入的绑定
count = 10;  // ❌ TypeError: Assignment to constant variable.
```

**实时绑定原理图：**

```
┌─────────────────┐         ┌─────────────────┐
│   counter.js    │         │    main.js      │
│                 │         │                 │
│  ┌───────────┐  │         │  ┌───────────┐  │
│  │ count: 1  │◀─┼─────────┼──│ count     │  │
│  │ (可变绑定) │  │  绑定引用  │  │ (只读引用) │  │
│  └───────────┘  │         │  └───────────┘  │
│        ▲        │         │                 │
│   increment()   │         │                 │
└─────────────────┘         └─────────────────┘
```

### 1.5 循环依赖处理

ESM 通过声明式的依赖图天然支持循环依赖：

```javascript
// ===== a.js =====
import { b } from './b.js';
export const a = 'a';
export function getAWithB() {
  return `${a} sees ${b}`;
}
console.log('a.js executing, b =', b);  // b is already resolved

// ===== b.js =====
import { a } from './a.js';
export const b = 'b';
export function getBWithA() {
  return `${b} sees ${a}`;
}
console.log('b.js executing, a =', a);  // a is still undefined!

// ===== main.js =====
import { getAWithB } from './a.js';
import { getBWithA } from './b.js';
console.log(getAWithB());  // "a sees b"
console.log(getBWithA());  // "b sees a"
```

**执行时序分析：**

```
main.js 导入 a.js
    │
    ▼
a.js 开始执行 ───────────┐
    │                    │
    ▼                    │
遇到 import { b }        │
    │                    │
    ▼                    │
暂停执行 a.js ───────────┼──▶ b.js 开始执行
    │                    │      │
    │                    │      ▼
    │                    │  遇到 import { a }
    │                    │      │
    │                    │      ▼
    │                    │  a.js 已经在加载中
    │                    │  获取已存在的 a 模块记录
    │                    │  （此时 a 还未求值）
    │                    │      │
    │                    │      ▼
    │                    │  console.log('a =', a)
    │                    │  输出: "a = undefined"
    │                    │      │
    │                    │      ▼
    │                    │  export const b = 'b'
    │                    │  b.js 求值完成
    │                    │      │
    │◀───────────────────┼──────┘
    ▼                    │
继续执行 a.js            │
console.log('b =', b)    │
输出: "b = b"            │
    │                    │
    ▼                    │
export const a = 'a'     │
a.js 求值完成            │
    │                    │
    ▼                    │
main.js 继续执行         │
```

### 1.6 模块标识符解析算法

ESM 使用 **HostResolveImportedModule** 抽象操作解析模块标识符：

```
输入: referencingScriptOrModule, specifier
输出: Module Record

1. 如果 referencingScriptOrModule 是 null:
   a. 返回 HostResolveImportedModule(null, specifier)

2. 令 moduleURL 为 referencingScriptOrModule.[[URL]]

3. 令 resolutionOption 为 undefined

4. 如果 referencingScriptOrModule.[[HostDefined]] 包含断言:
   a. 令 resolutionOption 为相关选项

5. 执行解析算法（宿主环境定义）:
   - 相对路径: "./foo.js", "../bar.js"
   - 绝对路径: "/foo.js" (浏览器环境)
   - 裸导入: "lodash", "vue" (需导入映射)
   - URL: "https://example.com/module.js"
```

**浏览器 vs Node.js 解析差异：**

| 标识符类型 | 浏览器行为 | Node.js 行为 |
|-----------|-----------|-------------|
| `./foo.js` | 相对当前文档 URL 解析 | 相对当前文件路径解析 |
| `/foo.js` | 相对域名根路径 | 绝对文件系统路径 |
| `foo` | ❌ 裸导入错误（需 import map） | ✅ 解析 node_modules |
| `foo/bar` | ❌ 裸导入错误 | ✅ 解析子路径 |
| `https://...` | ✅ 直接加载 | ⚠️ 需要 --experimental-network-imports |
| `#internal` | ❌ 不支持 | ✅ 子路径导入（package.json imports） |

---

## 2. CJS 模块语义（Node.js 文档）

### 2.1 核心概念

CommonJS 是 Node.js 的模块系统，设计于 ESM 之前：

| 特性 | 说明 |
|------|------|
| **运行时加载** | `require()` 在代码运行时同步执行 |
| **值拷贝** | 导出的是值的拷贝，而非引用 |
| **模块包装** | 每个模块被包装在函数中执行 |
| **非严格模式** | 默认非严格，可手动启用 |
| **缓存机制** | 模块首次加载后缓存，后续返回缓存 |

### 2.2 模块包装器

Node.js 在执行模块代码前进行包装：

```javascript
(function(exports, require, module, __filename, __dirname) {
  // 用户模块代码在此执行
});
```

这解释了为什么这些变量在每个模块中都可用：

```javascript
// 这些变量实际上来自包装函数的参数
console.log(__filename);  // 当前文件的绝对路径
console.log(__dirname);   // 当前文件所在目录的绝对路径
console.log(module);      // 当前模块的引用
console.log(exports);     // module.exports 的别名
console.log(require);     // 用于加载其他模块的函数
```

### 2.3 导出机制详解

#### module.exports vs exports

```javascript
// ===== 基础导出 =====
// module.exports 是真正的导出对象
module.exports = {
  foo: 'bar',
  greet() { return 'hello'; }
};

// exports 初始时指向 module.exports
exports.hello = 'world';  // 等同于 module.exports.hello

// ===== 常见陷阱 =====
// ❌ 错误：exports 不再指向 module.exports
exports = { foo: 'bar' };  // 这只是重写了本地变量

// ✅ 正确：直接赋值给 module.exports
module.exports = { foo: 'bar' };

// ✅ 正确：如果必须用 exports，逐个属性添加
exports.foo = 'bar';
exports.bar = 'baz';
```

**exports 与 module.exports 关系图：**

```
初始状态:
┌─────────────┐
│   exports   │────┐
│  (引用变量)  │    │
└─────────────┘    │    ┌─────────────────┐
                   ├───▶│  module.exports │
┌─────────────┐    │    │  (真正的导出对象) │
│   module    │────┘    └─────────────────┘
│  (模块对象)  │              │
└─────────────┘              │
                             ▼
                        被 require() 返回

重新赋值 exports 后:
┌─────────────┐              ┌─────────────────┐
│   exports   │───▶ {foo}    │  module.exports │
│  (现在指向   │    新对象    │  (仍然是原对象)  │
│   新对象)   │              │                 │
└─────────────┘              └─────────────────┘
                                    │
                                    ▼
                             被 require() 返回
                             (foo 不会被导出！)
```

### 2.4 require 解析算法

Node.js 的模块解析是一个复杂的算法：

```
require(X) 从模块 Y 开始解析:

1. 如果 X 是核心模块 (如 'fs', 'path'):
   a. 返回核心模块
   b. 停止

2. 如果 X 以 '/' 开头:
   a. 设 Y 为文件系统根路径
   b. 执行 LOAD_AS_FILE(Y + X)
   c. 执行 LOAD_AS_DIRECTORY(Y + X)

3. 如果 X 以 './' 或 '/' 或 '../' 开头:
   a. 执行 LOAD_AS_FILE(Y + X)
   b. 执行 LOAD_AS_DIRECTORY(Y + X)
   c. 抛出 "not found"

4. 如果 X 以 '#' 开头:
   a. 执行 LOAD_PACKAGE_IMPORTS(X, Y)

5. (裸导入) 执行 LOAD_PACKAGE_SELF(X, Y)
   然后 LOAD_NODE_MODULES(X, Y)

6. 抛出 "not found"

LOAD_AS_FILE(X):
1. 如果 X 是文件，加载为 JavaScript 文本
2. 如果 X.js 存在，加载 X.js 为 JavaScript 文本
3. 如果 X.json 存在，解析为 JSON 文本
4. 如果 X.node 存在，加载为二进制插件

LOAD_AS_DIRECTORY(X):
1. 如果 X/package.json 存在:
   a. 解析 X/package.json，查找 "main" 字段
   b. 执行 LOAD_AS_FILE(X/main)
2. 如果 X/index.js 存在，加载为 JavaScript 文本
3. 如果 X/index.json 存在，解析为 JSON 文本
4. 如果 X/index.node 存在，加载为二进制插件

LOAD_NODE_MODULES(X, START):
1. 从 START 目录开始，向上遍历父目录
2. 在每个目录 D 中:
   a. 执行 LOAD_PACKAGE_EXPORTS(X, D/node_modules/X)
   b. 执行 LOAD_AS_FILE(D/node_modules/X)
   c. 执行 LOAD_AS_DIRECTORY(D/node_modules/X)
3. 到达文件系统根目录时停止
```

### 2.5 require 缓存机制

```javascript
// ===== cache-demo.js =====
console.log('Module executing!');
module.exports = { value: Math.random() };

// ===== main.js =====
const a = require('./cache-demo');
const b = require('./cache-demo');

console.log(a === b);        // true (同一对象)
console.log(a.value === b.value);  // true

// 查看缓存
console.log(require.cache[require.resolve('./cache-demo')]);

// 清除缓存
delete require.cache[require.resolve('./cache-demo')];
const c = require('./cache-demo');  // 重新执行！
console.log(a === c);  // false
```

**缓存机制示意图：**

```
首次 require('./module.js'):
┌────────────┐    ┌──────────────┐    ┌──────────────┐
│  require() │───▶│  读取文件    │───▶│  编译执行    │
│            │    │  module.js   │    │              │
└────────────┘    └──────────────┘    └──────┬───────┘
                                             │
                                             ▼
┌────────────┐    ┌──────────────┐    ┌──────────────┐
│  返回      │◀───│  存入缓存    │◀───│  module.exports│
│  exports   │    │  require.cache│   │  被赋值       │
└────────────┘    └──────────────┘    └──────────────┘

后续 require('./module.js'):
┌────────────┐    ┌──────────────┐    ┌──────────────┐
│  require() │───▶│  检查缓存    │───▶│  直接返回    │
│            │    │  cache[key]  │    │  缓存的 exports│
└────────────┘    └──────────────┘    └──────────────┘
                          │
                          ▼
                    ┌──────────────┐
                    │  命中缓存    │
                    │  不重新执行  │
                    └──────────────┘
```

### 2.6 循环依赖处理

CJS 的循环依赖处理与 ESM 不同：

```javascript
// ===== a.js =====
console.log('a.js 开始执行');
exports.done = false;

const b = require('./b.js');
console.log('a.js: b.done =', b.done);

exports.done = true;
console.log('a.js 执行完毕');

// ===== b.js =====
console.log('b.js 开始执行');
exports.done = false;

const a = require('./a.js');  // 获取 a.js 的不完整导出
console.log('b.js: a.done =', a.done);  // false（a 还没执行完）

exports.done = true;
console.log('b.js 执行完毕');

// ===== main.js =====
console.log('main.js 开始执行');
const a = require('./a.js');
const b = require('./b.js');
console.log('main.js: a.done =', a.done);
console.log('main.js: b.done =', b.done);
```

**执行输出：**

```
main.js 开始执行
a.js 开始执行
b.js 开始执行
b.js: a.done = false
b.js 执行完毕
a.js: b.done = true
a.js 执行完毕
main.js: a.done = true
main.js: b.done = true
```

**关键差异：** CJS 在循环依赖时返回**当前已导出的不完整对象**，而 ESM 的实时绑定会在后续自动更新。

---

## 3. ESM/CJS 互操作语义（Node.js 22+ 新特性）

### 3.1 互操作演进历程

```
Node.js 模块系统演进:
┌─────────────────────────────────────────────────────────────────┐
│ Node.js 12 (2019)                                                │
│ ├── ESM 实验性支持 (--experimental-modules)                      │
│ └── .mjs / .cjs 扩展名                                           │
├─────────────────────────────────────────────────────────────────┤
│ Node.js 14-16                                                    │
│ ├── ESM 稳定化                                                   │
│ ├── "type": "module" in package.json                             │
│ └── 基本的 ESM↔CJS 互操作                                        │
├─────────────────────────────────────────────────────────────────┤
│ Node.js 18-20                                                    │
│ ├── 改进的互操作性                                               │
│ ├── JSON 导入 (assertions)                                       │
│ └── 网络导入 (实验性)                                            │
├─────────────────────────────────────────────────────────────────┤
│ Node.js 22+ (当前)                                               │
│ ├── require(esm) - 无需标志                                      │
│ ├── 同步 ESM 导入                                                │
│ ├── import.meta.dirname                                          │
│ ├── 改进的裸导入处理                                             │
│ └── 更快的模块加载                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 ESM 导入 CJS

#### 基本语法

```javascript
// ESM 模块可以导入 CJS 模块
import fs from 'fs';           // ✅ 命名空间导入（推荐）
import { readFile } from 'fs'; // ✅ 命名导入（Node 分析 exports）
import * as fs from 'fs';      // ✅ 命名空间导入

// 导入自定义 CJS 模块
import cjsModule from './cjs-module.cjs';
import { namedExport } from './cjs-module.cjs';
```

#### 命名空间分析（Node.js 算法）

```javascript
// ===== cjs-module.cjs =====
module.exports = function() { return 'default'; };
module.exports.named = 'named export';
module.exports.value = 42;

// ===== esm-module.mjs =====
import cjs from './cjs-module.cjs';
import { named, value } from './cjs-module.cjs';
import * as namespace from './cjs-module.cjs';

console.log(cjs);           // [Function]
console.log(cjs.named);     // 'named export'
console.log(named);         // 'named export'
console.log(value);         // 42

// 命名空间对象的结构
console.log(namespace);
// {
//   [Symbol.for('CommonJS')]: 0,
//   default: [Function],
//   named: 'named export',
//   value: 42
// }
```

**Node.js CJS 命名空间生成算法：**

```
生成 CJS 模块的 ES 模块命名空间:

1. 执行 CJS 模块，获取 module.exports

2. 创建 ES 模块命名空间对象:

3. 如果 module.exports 是原始值或 null:
   a. 抛出错误（无法从原始值创建命名空间）

4. 如果 module.exports 是普通对象或函数:
   a. 默认导出 = module.exports
   b. 对于 module.exports 的每个可枚举属性 key:
      - 创建命名导出 key
      - 值 = module.exports[key]

5. 返回命名空间对象
```

### 3.3 CJS 导入 ESM（Node.js 22+）

Node.js 22 正式支持 `require()` 加载 ESM 模块（无需实验性标志）：

```javascript
// ===== esm-module.mjs =====
export const named = 'ESM named export';
export const value = 100;

export default function defaultExport() {
  return 'ESM default export';
}

// ===== cjs-module.cjs =====
// Node.js 22+: 可以直接 require ESM 模块
const esm = require('./esm-module.mjs');

console.log(esm);
// {
//   [Symbol.for('CommonJS')]: 0,
//   default: [Function: defaultExport],
//   named: 'ESM named export',
//   value: 100
// }

console.log(esm.default());  // 'ESM default export'
console.log(esm.named);      // 'ESM named export'
```

**重要限制：** `require(esm)` 是**同步**的，但被加载的 ESM 模块不能有**顶层 await**：

```javascript
// ===== bad-esm.mjs =====
export const value = await Promise.resolve(42);  // ❌ 顶层 await

// ===== cjs-module.cjs =====
const bad = require('./bad-esm.mjs');  // ❌ Error: require() of ES Module with TLA
```

### 3.4 互操作边界情况

```javascript
// ===== edge-cases.cjs =====
// 情况 1: module.exports 是原始值
module.exports = 42;

// ESM 导入:
import num from './edge-cases.cjs';  // ✅ num = 42
import { default as num2 } from './edge-cases.cjs';  // ✅
import * as ns from './edge-cases.cjs';  // ✅ ns.default = 42

// 情况 2: module.exports 是 null
module.exports = null;

// ESM 导入:
import n from './null-export.cjs';  // ✅ n = null
import * as ns from './null-export.cjs';  // ✅ ns.default = null

// 情况 3: getter 属性
Object.defineProperty(module.exports, 'computed', {
  get() { return Math.random(); },
  enumerable: true
});

// ESM 导入:
import { computed } from './getter-export.cjs';
console.log(computed);  // 每次访问都会执行 getter！

// 情况 4: 循环依赖 ESM ↔ CJS
// a.mjs 导入 b.cjs，b.cjs 导入 a.mjs
// Node.js 会正确处理，但需要注意执行顺序
```

### 3.5 条件导出（Conditional Exports）

`package.json` 中的 `exports` 字段可以针对不同模块类型提供不同入口：

```json
{
  "name": "my-package",
  "exports": {
    ".": {
      "import": {
        "types": "./lib/index.d.mts",
        "default": "./lib/index.mjs"
      },
      "require": {
        "types": "./lib/index.d.cts",
        "default": "./lib/index.cjs"
      }
    },
    "./feature": {
      "import": "./lib/feature.mjs",
      "require": "./lib/feature.cjs"
    }
  },
  "type": "module"
}
```

**解析流程：**

```
导入 "my-package":
         │
         ▼
┌─────────────────┐
│ 检查 exports 字段 │
│ "import" 条件？   │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
 是(ESM导入)  否(CJS导入)
    │         │
    ▼         ▼
./index.mjs  ./index.cjs
```

---

## 4. TypeScript 模块解析策略

### 4.1 四种模块解析策略对比

| 策略 | `moduleResolution` | 主要用途 | 特点 |
|-----|-------------------|---------|------|
| Classic | `classic` | 旧版 TypeScript | 简单递归查找，已弃用 |
| Node | `node` | Node.js CJS 项目 | 模拟 Node.js CommonJS 解析 |
| NodeNext | `nodenext` / `node16` | 现代 Node.js ESM 项目 | 完整支持 ESM/CJS 互操作 |
| Bundler | `bundler` | 打包工具（Vite, webpack等） | 支持 ESM 语法，解析更宽松 |

### 4.2 配置与影响矩阵

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TypeScript 模块配置矩阵                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  module               │ moduleResolution │ 输出目标      │ 适用场景      │
│  ─────────────────────┼──────────────────┼───────────────┼──────────────│
│  "commonjs"           │ "node"           │ CJS           │ 传统 Node.js  │
│  "ES2020"+            │ "node"           │ ESM (需转换)  │ 混合项目      │
│  "ES2020"+            │ "nodenext"       │ ESM           │ 纯 ESM Node.js│
│  "commonjs"           │ "nodenext"       │ CJS           │ CJS 库开发    │
│  "ES2020"+            │ "bundler"        │ ESM           │ 前端/打包项目 │
│  "preserve"           │ "bundler"        │ 保留原语法    │ 类型检查专用  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Node 策略详解

**传统 CJS 项目配置：**

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

**解析算法：**

```
Node 策略解析 "./utils":

1. 尝试文件:
   - ./utils.ts
   - ./utils.tsx
   - ./utils.d.ts

2. 尝试目录 (./utils/):
   - ./utils/package.json (查找 "types" 字段)
   - ./utils/index.ts
   - ./utils/index.tsx
   - ./utils/index.d.ts

3. 尝试添加扩展名:
   - ./utils.js → 查找对应的 .d.ts

4. 向上遍历 node_modules...
```

### 4.4 NodeNext 策略详解

**现代 ESM 项目配置：**

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "esModuleInterop": true,
    "strict": true
  }
}
```

**关键特性：**

```typescript
// 1. 强制使用完整的相对路径（包含扩展名）
import { foo } from './utils';      // ❌ 错误：缺少扩展名
import { foo } from './utils.js';   // ✅ 正确（注意：是 .js 不是 .ts）

// 2. 支持 package.json "exports"
import pkg from 'my-pkg';  // 解析 exports 字段

// 3. 条件类型导入
import type { SomeType } from 'my-pkg';  // 类型-only 导入

// 4. 自动检测模块格式
// .ts 文件根据最近的 package.json "type" 字段决定格式
```

**文件扩展名映射表（NodeNext）：**

| 源文件 | 导入路径 | 说明 |
|-------|---------|------|
| `utils.ts` | `./utils.js` | TypeScript 文件，运行时需编译为 .js |
| `utils.mts` | `./utils.mjs` | ESM TypeScript 文件 |
| `utils.cts` | `./utils.cjs` | CJS TypeScript 文件 |
| `utils.d.ts` | `./utils.js` | 类型声明文件 |
| `utils.d.mts` | `./utils.mjs` | ESM 类型声明 |
| `utils.d.cts` | `./utils.cjs` | CJS 类型声明 |

### 4.5 Bundler 策略详解

**Vite/Webpack 项目配置：**

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "allowImportingTsExtensions": true,  // 允许导入 .ts 扩展名
    "noEmit": true  // 类型检查专用，实际编译由打包工具处理
  }
}
```

**与 NodeNext 的关键差异：**

```typescript
// Bundler 策略更宽松:

// 1. 不需要完整的相对路径扩展名
import { a } from './utils';     // ✅ 打包工具会解析
import { b } from './utils.ts';  // ✅ 允许（需 allowImportingTsExtensions）

// 2. 支持更多扩展名
import './styles.css';   // ✅ 打包工具支持
import './logo.svg';    // ✅ 资源导入

// 3. 支持裸导入的更多变体
import lodash from 'lodash';  // ✅ 正常工作

// 4. 支持路径别名（需在打包工具中配置）
import { utils } from '@app/utils';  // ✅ 解析为项目内路径
```

**三种策略路径解析对比：**

```typescript
// 项目结构:
// src/
//   utils/
//     index.ts
//     helper.ts
//   main.ts

// main.ts 中的导入:

// Node 策略:
import { helper } from './utils';        // ✅ 解析为 ./utils/index.ts
import { helper } from './utils/index'; // ✅ 解析为 ./utils/index.ts

// NodeNext 策略:
import { helper } from './utils/index.js'; // ✅ 需要完整路径 + .js 扩展名
import { helper } from './utils';          // ❌ 缺少扩展名

// Bundler 策略:
import { helper } from './utils';        // ✅ 灵活解析
import { helper } from './utils/index'; // ✅ 灵活解析
import { helper } from './utils/index.ts'; // ✅ 允许 .ts 扩展名
```

### 4.6 类型声明文件解析

```
解析导入 "lodash":

┌─────────────────────────────────────────────────────────────────┐
│                         Node/Bundler 策略                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  node_modules/lodash/                                           │
│  ├── package.json                                               │
│  │   ├── "types": "index.d.ts"  ─────────┐                    │
│  │   ├── "typings": "index.d.ts" ────────┼──▶ 优先使用         │
│  │   └── "main": "lodash.js"             │                    │
│  │                                        │                    │
│  ├── index.d.ts ◀─────────────────────────┘ 直接类型入口        │
│  └── lodash.d.ts  ◀──────────────────────── 回退查找            │
│                                                                 │
│  @types/lodash/        (如果上述未找到)                         │
│  ├── package.json                                               │
│  └── index.d.ts                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       NodeNext 策略                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  node_modules/lodash/                                           │
│  ├── package.json                                               │
│  │   └── "exports": {                                           │
│  │       ".": {                                                 │
│  │         "import": {                                          │
│  │           "types": "./index.d.mts",  ◀── ESM 类型            │
│  │           "default": "./index.mjs"                          │
│  │         },                                                   │
│  │         "require": {                                         │
│  │           "types": "./index.d.cts",  ◀── CJS 类型            │
│  │           "default": "./index.cjs"                          │
│  │         }                                                    │
│  │       }                                                      │
│  │     }                                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. import defer 语义（Stage 3 提案）

### 5.1 提案概述

`import defer` 是 TC39 Stage 3 提案，用于延迟加载模块直到实际使用：

```javascript
// 传统静态导入 - 模块立即加载和执行
import { heavyFunction } from './heavy-module.js';

// 动态导入 - 按需加载，但语法较繁琐
const { heavyFunction } = await import('./heavy-module.js');

// import defer - 延迟加载，使用直观
import defer { heavyFunction } from './heavy-module.js';
// heavy-module.js 此时还未加载！

// 首次使用时自动加载
heavyFunction();  // 此时加载并执行 heavy-module.js
```

### 5.2 语义详解

```
┌─────────────────────────────────────────────────────────────────┐
│              import defer 加载时序                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  时间轴 ──────────────────────────────────────────────────────▶ │
│                                                                 │
│  │  ┌─────────┐    ┌─────────┐    ┌─────────────────────────┐ │
│  │  │ 解析阶段 │    │ 执行阶段 │    │ 首次访问 deferred 导入   │ │
│  │  │         │    │         │    │                         │ │
│  │  │ ┌─────┐ │    │ ┌─────┐ │    │ ┌─────────────────────┐ │ │
│  │  │ │记录 │ │    │ │注册 │ │    │ │ 1. 触发模块加载      │ │ │
│  │  │ │依赖 │ │───▶│ │deferred│ │───▶│ 2. 执行模块          │ │ │
│  │  │ │关系 │ │    │ │导入  │ │    │ 3. 返回实际导出      │ │ │
│  │  │ └─────┘ │    │ └─────┘ │    │ └─────────────────────┘ │ │
│  │  │ 不加载  │    │ 不加载  │    │      阻塞直到完成        │ │
│  │  │ deferred│   │ deferred│   │                          │ │
│  │  │ 模块    │    │ 模块    │    │                          │ │
│  │  └─────────┘    └─────────┘    └─────────────────────────┘ │
│  │                                                              │
│  │  💡 关键点: deferred 模块的加载被推迟到首次实际使用            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 语法变体

```javascript
// 延迟命名导入
import defer { foo, bar } from './module.js';

// 延迟默认导入
import defer foo from './module.js';

// 延迟命名空间导入
import defer * as namespace from './module.js';

// 混合导入
import defer { foo } from './module.js';
import { bar } from './module.js';  // 正常立即导入
```

### 5.4 与动态导入的对比

```javascript
// ===== 方案 1: 动态导入 =====
async function doSomething() {
  // 每次调用都重新加载（除非有缓存）
  const { heavyFunction } = await import('./heavy.js');
  heavyFunction();
}

// ===== 方案 2: 条件动态导入 =====
let heavyModule;
async function doSomething() {
  // 手动实现缓存逻辑
  if (!heavyModule) {
    heavyModule = await import('./heavy.js');
  }
  heavyModule.heavyFunction();
}

// ===== 方案 3: import defer（提案）=====
import defer { heavyFunction } from './heavy.js';

function doSomething() {
  // 语法简洁，自动缓存，同步调用
  heavyFunction();
}
```

| 特性 | `import()` | `import defer` |
|-----|-----------|----------------|
| 加载时机 | 显式调用时 | 首次访问时自动 |
| 语法 | 异步，需 await | 同步，像普通导入 |
| 缓存控制 | 手动管理 | 自动单例 |
| 代码分割 | 显式拆包 | 自动拆包 |
| 使用场景 | 条件/延迟加载 | 延迟但频繁使用 |

### 5.5 实际使用场景

```javascript
// ===== CLI 工具 =====
import defer { buildCommand } from './commands/build.js';
import defer { serveCommand } from './commands/serve.js';
import defer { testCommand } from './commands/test.js';

// 根据 CLI 参数决定使用哪个命令
const command = process.argv[2];
switch(command) {
  case 'build':
    buildCommand();  // 只有此时才加载 build.js
    break;
  case 'serve':
    serveCommand();  // 只有此时才加载 serve.js
    break;
  // test.js 永远不会被加载，如果不使用 test 命令
}

// ===== 大型库的功能模块 =====
import defer { advancedChart } from './features/charts-advanced.js';
import { basicChart } from './features/charts-basic.js';

export function createChart(type, data) {
  if (type === 'basic') {
    return basicChart(data);  // charts-advanced.js 未加载
  }
  if (type === 'advanced') {
    return advancedChart(data);  // 此时加载 charts-advanced.js
  }
}

// ===== 测试/调试代码 =====
import defer { debugTools } from './debug-tools.js';

if (process.env.DEBUG) {
  debugTools.enable();  // 只在 DEBUG 模式下加载调试工具
}
```

### 5.6 提案当前状态

```
┌─────────────────────────────────────────────────────────────────┐
│              TC39 提案阶段流程                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Stage 0 (Strawperson) ──▶ 初始想法                             │
│         │                                                       │
│         ▼                                                       │
│  Stage 1 (Proposal) ────▶ 正式提案，需要冠军（champion）          │
│         │                                                       │
│         ▼                                                       │
│  Stage 2 (Draft) ───────▶ 初步规范文本，语法语义确定              │
│         │                                                       │
│         ▼                                                       │
│  Stage 3 (Candidate) ───▶ ✅ import defer 当前在此阶段           │
│           │         规范完整，需要实现和测试                      │
│           │                                                     │
│           ▼                                                     │
│  Stage 4 (Finished) ────▶ 已准备好纳入标准，有多个实现           │
│                                                                 │
│  预计纳入: ES2025 或 ES2026                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. 模块加载的时序和副作用分析

### 6.1 模块执行顺序基础

```javascript
// ===== main.js =====
console.log('main: start');
import './a.js';
console.log('main: after import a');
import './b.js';
console.log('main: after import b');
import './c.js';
console.log('main: end');

// ===== a.js =====
console.log('a: executing');

// ===== b.js =====
console.log('b: executing');

// ===== c.js =====
console.log('c: executing');
```

**输出结果：**

```
a: executing
b: executing
c: executing
main: start
main: after import a
main: after import b
main: end
```

**原因：** ESM 的导入声明会被提升到模块顶部，所有依赖先执行，然后才执行当前模块。

### 6.2 副作用与纯模块

```javascript
// ===== 副作用模块 (side-effect.js) =====
// 执行时产生外部可观察的效果
console.log('Side effect executed!');
window.globalState = { initialized: true };
document.title = 'Modified';

// 使用方式
import './side-effect.js';  // 只执行副作用，不导入绑定

// ===== 纯模块 (pure-module.js) =====
// 只导出绑定，执行不产生副作用
export const data = [1, 2, 3];
export function process(x) { return x * 2; }

// 使用方式
import { data, process } from './pure-module.js';
```

### 6.3 时序问题案例分析

#### 案例 1: 初始化顺序依赖

```javascript
// ===== config.js =====
export const config = {
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  debug: process.env.DEBUG === 'true'
};
console.log('Config loaded:', config);

// ===== api.js =====
import { config } from './config.js';

export function fetchData() {
  return fetch(`${config.apiUrl}/data`);
}
console.log('API module loaded');

// ===== app.js =====
import { fetchData } from './api.js';
// config.js 和 api.js 都已经执行完毕
fetchData();
```

#### 案例 2: 动态配置问题

```javascript
// ===== problematic-config.js =====
export let settings = {};

export function initialize(config) {
  settings = { ...config };
}

// ===== problematic-api.js =====
import { settings } from './problematic-config.js';

export function makeRequest() {
  // 危险：settings 可能在 initialize 之前被使用
  return fetch(settings.apiUrl);
}

// ===== main.js =====
import { initialize } from './problematic-config.js';
import { makeRequest } from './problematic-api.js';  // makeRequest 可能使用未初始化的 settings

initialize({ apiUrl: 'https://api.example.com' });
makeRequest();  // 如果模块加载时有自动请求，可能出错！
```

**解决方案：**

```javascript
// ===== better-config.js =====
export let settings = null;

export function initialize(config) {
  settings = { ...config };
}

export function ensureInitialized() {
  if (!settings) {
    throw new Error('Config not initialized. Call initialize() first.');
  }
  return settings;
}

// ===== better-api.js =====
import { ensureInitialized } from './better-config.js';

export function makeRequest() {
  const config = ensureInitialized();
  return fetch(config.apiUrl);
}
```

### 6.4 微任务与模块执行

```javascript
// ===== microtask-demo.js =====
console.log('1. sync start');

Promise.resolve().then(() => {
  console.log('3. microtask 1');
});

queueMicrotask(() => {
  console.log('4. microtask 2');
});

console.log('2. sync end');

// 输出:
// 1. sync start
// 2. sync end
// 3. microtask 1
// 4. microtask 2
```

**模块间的微任务：**

```javascript
// ===== a.js =====
console.log('a: 1');
Promise.resolve().then(() => console.log('a: microtask'));
console.log('a: 2');

// ===== b.js =====
console.log('b: 1');
Promise.resolve().then(() => console.log('b: microtask'));
console.log('b: 2');

// ===== main.js =====
console.log('main: 1');
import './a.js';
import './b.js';
Promise.resolve().then(() => console.log('main: microtask'));
console.log('main: 2');

// 输出:
// a: 1
// a: 2
// b: 1
// b: 2
// main: 1
// main: 2
// a: microtask
// b: microtask
// main: microtask
```

### 6.5 顶层 await 的影响

```javascript
// ===== async-module.js =====
console.log('async: start');
const data = await fetch('/api/config').then(r => r.json());
console.log('async: data loaded');
export { data };

// ===== dependent-module.js =====
import { data } from './async-module.js';
console.log('dependent: got data', data);
export const processed = data.map(x => x * 2);

// ===== main.js =====
console.log('main: start');
import { processed } from './dependent-module.js';
console.log('main: end', processed);
```

**执行流程：**

```
main.js 开始加载
    │
    ├──▶ dependent-module.js 依赖 async-module.js
    │          │
    │          └──▶ async-module.js 开始执行
    │                   │
    │                   ├──▶ console.log('async: start')
    │                   │
    │                   ├──▶ await fetch(...)  [暂停执行]
    │                   │        │
    │                   │        ▼
    │                   │    [等待网络响应...]
    │                   │        │
    │                   │        ▼
    │                   │    fetch 完成
    │                   │
    │                   ├──▶ console.log('async: data loaded')
    │                   │
    │                   └──▶ async-module.js 执行完成
    │                            │
    │◀───────────────────────────┘
    │
    ├──▶ dependent-module.js 继续执行
    │          │
    │          ├──▶ console.log('dependent: got data', data)
    │          │
    │          └──▶ export processed
    │
    ├──▶ console.log('main: start')
    │
    ├──▶ console.log('main: end', processed)
    │
    └──▶ main.js 执行完成
```

### 6.6 副作用管理最佳实践

```javascript
// ===== antipattern.js （反模式）=====
// 在模块顶层执行副作用
const db = createDatabaseConnection();  // 立即连接数据库
export { db };

// ===== bestpractice.js （最佳实践）=====
let db = null;

export async function initializeDatabase() {
  if (!db) {
    db = await createDatabaseConnection();
  }
  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

// ===== main.js =====
import { initializeDatabase, getDatabase } from './bestpractice.js';

// 在应用启动时初始化
await initializeDatabase();

// 之后安全使用
const db = getDatabase();
```

### 6.7 模块加载性能优化

```
┌─────────────────────────────────────────────────────────────────┐
│              模块加载优化策略                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 延迟加载                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ import defer { heavy } from './heavy.js';              │   │
│  │ // 或使用动态导入                                       │   │
│  │ const heavy = await import('./heavy.js');              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  2. 预加载关键模块                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ <!-- 浏览器环境 -->                                      │   │
│  │ <link rel="modulepreload" href="./critical.js">        │   │
│  │                                                         │   │
│  │ // Node.js: 提前 require 热路径模块                     │   │
│  │ require('./frequently-used');                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  3. 代码分割                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ // 路由级代码分割                                        │   │
│  │ const router = {                                        │   │
│  │   '/dashboard': () => import('./pages/dashboard.js'),  │   │
│  │   '/profile': () => import('./pages/profile.js')       │   │
│  │ };                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  4. 树摇优化 (Tree Shaking)                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ // 使用命名导出，避免默认导出大对象                       │   │
│  │ export { funcA, funcB, funcC }  ✅                      │   │
│  │ export default { funcA, funcB, funcC }  ❌ 难以树摇     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  5. 副作用标记                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ // package.json                                         │   │
│  │ {                                                       │   │
│  │   "sideEffects": false,  // 纯模块，可安全树摇          │   │
│  │   // 或                                                 │   │
│  │   "sideEffects": ["*.css", "./src/polyfill.js"]        │   │
│  │ }                                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 附录

### A. 快速参考卡片

```
┌─────────────────────────────────────────────────────────────────┐
│                     模块语法速查表                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ESM                          CJS                              │
│  ───────────────────────────────────────────────────────────── │
│  export { a }                 exports.a = a                     │
│  export default x             module.exports = x                │
│  export const a = 1           exports.a = 1                     │
│  import { a } from 'x'        const { a } = require('x')        │
│  import a from 'x'            const a = require('x')            │
│  import * as ns from 'x'      const ns = require('x')           │
│  import './x'                 require('./x')                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TypeScript 模块配置                                             │
│  ───────────────────────────────────────────────────────────── │
│  "module": "commonjs"          // 输出 CommonJS                 │
│  "module": "ESNext"            // 保持 ES 模块语法              │
│  "module": "nodenext"          // Node.js ESM/CJS 混合          │
│                                                                 │
│  "moduleResolution": "node"    // 传统 Node.js 解析             │
│  "moduleResolution": "nodenext"// Node.js 12+ 解析              │
│  "moduleResolution": "bundler" // 打包工具友好                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### B. 常见错误与解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `Cannot use import statement outside a module` | 在 CJS 中使用 ESM 语法 | 改 `.js` 为 `.mjs` 或添加 `"type": "module"` |
| `require() of ES modules is not supported` | Node.js < 22 尝试 require ESM | 升级到 Node.js 22+ 或使用动态 import() |
| `ERR_MODULE_NOT_FOUND` | 模块路径解析失败 | 检查扩展名、文件是否存在、大小写 |
| `The requested module does not provide an export named 'X'` | ESM 导入 CJS 时命名导出不存在 | 检查 CJS 的 module.exports 结构 |
| `Must use import to load ES Module` | 使用 require 加载 ESM 文件 | 使用 import 语法或动态 import() |

---

*文档版本: 1.0 | 最后更新: 2026年4月*
*参考规范: ECMA-262 2024, Node.js 22.x Documentation, TypeScript 5.4*
