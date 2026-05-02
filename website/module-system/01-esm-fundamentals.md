---
title: ESM 基础 — import/export、静态分析与 Tree Shaking
description: '深入解析 ECMAScript Modules 的语法特性、静态分析机制与 Tree Shaking 原理，包含完整代码示例'
keywords: 'ESM, ECMAScript Modules, import, export, static analysis, tree shaking, named export, default export, namespace import'
---

# 01 - ESM 基础

> ECMAScript Modules (ESM) 是 JavaScript 的官方模块标准（ES2015+）。本章深入解析 `import`/`export` 语法、静态分析机制与 Tree Shaking 原理。

---

## 1. 导入导出语法全景

### 1.1 命名导出 (Named Export)

```js
// utils.js
export const PI = 3.141592653;
export function add(a, b) {
  return a + b;
}
export class Calculator {
  multiply(a, b) {
    return a * b;
  }
}

// 导出时重命名
export { add as sum };
```

### 1.2 默认导出 (Default Export)

```js
// math.js
export default function multiply(a, b) {
  return a * b;
}

// 也可导出匿名值
export default {
  name: 'math-utils',
  version: '1.0.0'
};
```

> **最佳实践**：一个模块只应有一个默认导出，且默认导出应与文件名一致，便于 IDE 自动导入。

### 1.3 导入语法对照表

| 语法 | 说明 | 示例 |
|------|------|------|
| `import { a } from './mod'` | 命名导入 | 按名称导入绑定的引用 |
| `import * as ns from './mod'` | 命名空间导入 | 将所有导出聚合为对象 |
| `import def from './mod'` | 默认导入 | 导入默认导出 |
| `import def, { a } from './mod'` | 混合导入 | 同时导入默认和命名 |
| `import { a as b } from './mod'` | 重命名导入 | 解决命名冲突 |
| `import './mod'` | 副作用导入 | 仅执行模块，不绑定值 |
| `import.meta.url` | 模块元数据 | 当前模块的 URL |

```js
// main.js — 各种导入方式示例
import multiply, { PI, add } from './math.js';
import * as math from './math.js';
import { add as sum } from './utils.js';
import './side-effect.js';  // 仅执行副作用

console.log(import.meta.url);  // file:///path/to/main.js
```

---

## 2. 静态分析机制

### 2.1 编译时 vs 运行时

ESM 的**核心设计原则**是：所有导入导出关系必须在编译阶段确定，不能运行时动态决定。

```js
// ✅ 合法：静态路径
import { foo } from './constants.js';

// ❌ 非法：动态路径（浏览器原生 ESM 不支持）
const moduleName = './utils.js';
import { foo } from moduleName;  // SyntaxError

// ❌ 非法：条件导入在顶层
if (condition) {
  import { foo } from './a.js';  // SyntaxError
}
```

> 动态导入请使用 `import()` 表达式：

```js
// ✅ 动态导入（返回 Promise）
const module = await import('./utils.js');
const { foo } = await import(`./locales/${language}.js`);
```

### 2.2 绑定 (Binding) 而非值拷贝

ESM 的导入是**活绑定 (Live Binding)**，而非 CommonJS 的值拷贝。

```js
// counter.js
export let count = 0;
export function increment() {
  count++;
}

// main.js
import { count, increment } from './counter.js';

console.log(count);  // 0
increment();
console.log(count);  // 1 ✅ ESM 的绑定会自动更新
```

对比 CommonJS 的值拷贝行为：

```js
// counter.cjs
let count = 0;
module.exports = { count, increment: () => count++ };

// main.cjs
const { count, increment } = require('./counter.cjs');
console.log(count);  // 0
increment();
console.log(count);  // 0 ❌ CJS 解构时做了值拷贝
```

### 2.3 静态分析的优势

```mermaid
flowchart LR
    A[源代码] --> B[词法分析]
    B --> C[语法分析]
    C --> D[构建模块图]
    D --> E[Tree Shaking]
    E --> F[生成产物]

    style D fill:#e1f5fe
    style E fill:#fff3e0
```

由于导入导出关系在编译时即可确定，打包器可以：

1. **构建精确的模块依赖图** — 无需执行代码即可知道依赖关系
2. **实现 Tree Shaking** — 精确标记死代码并消除
3. **作用域提升 (Scope Hoisting)** — 将多个模块合并到一个作用域，减少运行时开销
4. **提前报错** — 循环引用、未导出符号等问题在编译期即可发现

---

## 3. Tree Shaking 深度解析

### 3.1 基本原理

Tree Shaking 是一种**死代码消除 (Dead Code Elimination, DCE)** 技术，利用 ESM 的静态结构，在打包时移除未被使用的导出。

```js
// utils.js — 工具库
export function usedFunction() {
  return 'I am used';
}

export function unusedFunction() {
  return 'I will be shaken away';
}

export const CONSTANT_USED = 42;
export const CONSTANT_UNUSED = 99;

// main.js — 只导入需要的部分
import { usedFunction, CONSTANT_USED } from './utils.js';

console.log(usedFunction(), CONSTANT_USED);
// 最终产物中不会包含 unusedFunction 和 CONSTANT_UNUSED
```

### 3.2 副作用与 `"sideEffects"`

某些模块的执行具有副作用（如修改全局变量、注册 polyfill），打包器无法安全地移除它们。

```json
{
  "name": "my-library",
  "sideEffects": [
    "./src/polyfill.js",
    "*.css"
  ]
}
```

| `sideEffects` 值 | 含义 |
|-----------------|------|
| `false` | 该包完全没有副作用，所有未使用的导出都可以安全移除 |
| `["./polyfill.js", "*.css"]` | 指定具有副作用的文件模式，其余文件可 Tree Shake |
| `true` / 省略 | 所有文件都可能有副作用，不进行 Tree Shaking |

```js
// polyfill.js — 具有副作用
if (!Array.prototype.flat) {
  Array.prototype.flat = function(depth = 1) {
    // polyfill 实现...
  };
}
export {};  // 空导出，仅用于执行副作用
```

### 3.3 Tree Shaking 的限制

```js
// ❌ 难以 Tree Shake：动态属性访问
import * as utils from './utils.js';
const fnName = 'usedFunction';
utils[fnName]();  // 打包器无法确定实际调用了哪个函数

// ❌ 难以 Tree Shake：通过 eval 使用
import { foo } from './lib.js';
eval('foo()');

// ✅ 可以 Tree Shake：直接静态使用
import { foo, bar } from './lib.js';
foo();  // bar 将被移除
```

### 3.4 打包器 Tree Shaking 对比

| 打包器 | Tree Shaking 策略 | 作用域提升 | 备注 |
|--------|------------------|-----------|------|
| **Rollup** | 基于 ESM 原生支持，效果最佳 | ✅ 完整支持 | ESM-first 设计 |
| **Webpack** | `usedExports` + `sideEffects` 标记 | ⚠️ 部分支持 | 需配置 `optimization` |
| **Vite** | Rollup（生产构建） | ✅ 支持 | 开发时使用 ESM 原生加载 |
| **Rspack** | 与 Webpack 兼容 | ⚠️ 部分支持 | Rust 实现，性能更优 |
| **esbuild** | 基础 DCE | ❌ 不支持 | 以速度优先 |

---

## 4. 顶级 await

ESM 支持模块顶层的 `await`，无需包裹在 async 函数中。

```js
// config.js
const response = await fetch('/api/config');
export const config = await response.json();

// main.js
import { config } from './config.js';
// 此处 config 已经解析完成，可以直接同步使用
console.log(config.apiEndpoint);
```

> ⚠️ **注意**：使用顶级 await 的模块会成为**异步模块**，其依赖者会隐式等待它完成加载。

---

## 5. 完整示例：构建一个 ESM 工具库

### 项目结构

```
esm-utils/
├── package.json
├── src/
│   ├── index.js
│   ├── string.js
│   ├── math.js
│   └── constants.js
└── dist/
```

### package.json

```json
{
  "name": "esm-utils",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "exports": {
    ".": "./dist/index.js",
    "./string": "./dist/string.js",
    "./math": "./dist/math.js"
  },
  "sideEffects": false
}
```

### 源码

```js
// src/constants.js
export const PI = 3.141592653589793;
export const E = 2.718281828459045;

// src/string.js
export function camelCase(str) {
  return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
}

export function kebabCase(str) {
  return str.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`);
}

// src/math.js
import { PI } from './constants.js';

export function circleArea(radius) {
  return PI * radius * radius;
}

export function circleCircumference(radius) {
  return 2 * PI * radius;
}

// src/index.js
export { camelCase, kebabCase } from './string.js';
export { circleArea, circleCircumference } from './math.js';
export { PI, E } from './constants.js';
```

### 使用

```js
// 全量导入（但 Tree Shaking 会移除未使用的导出）
import { camelCase, circleArea } from 'esm-utils';

// 子路径导入（精确加载，无需 Tree Shaking）
import { camelCase } from 'esm-utils/string';
```

---

## 6. ESM vs CommonJS 深度对比

### 6.1 语法差异

| 特性 | ESM (`import`/`export`) | CommonJS (`require`/`module.exports`) |
|------|------------------------|--------------------------------------|
| 加载时机 | 编译时静态解析 | 运行时动态执行 |
| 语法位置 | 仅顶层，不可条件导入 | 任意位置，可条件加载 |
| 导出类型 | 活绑定 (Live Binding) | 值拷贝 (Value Copy) |
| 循环依赖处理 | 支持（通过绑定） | 部分支持（通过模块缓存） |
| 异步加载 | 原生支持 `import()` | 需借助 `require.ensure` 或动态 `require` |
| 浏览器支持 | 原生支持（`<script type="module">`） | 需打包工具转换 |
| Tree Shaking | 原生支持 | 难以实现（副作用分析困难） |
| 顶级 await | 支持 | 不支持（模块立即执行完成） |
| `this` 值 | `undefined` | `module.exports` |

### 6.2 运行时行为差异

**值绑定 vs 值拷贝**：

```js
// ESM: 活绑定
counter.mjs:
export let count = 0;
export function increment() { count++; }

main.mjs:
import { count, increment } from './counter.mjs';
console.log(count); // 0
increment();
console.log(count); // 1 ✅ 自动更新

// CJS: 值拷贝
counter.cjs:
let count = 0;
module.exports = { count, increment: () => count++ };

main.cjs:
const { count, increment } = require('./counter.cjs');
console.log(count); // 0
increment();
console.log(count); // 0 ❌ 拷贝的值不会更新
```

### 6.3 互操作性

**CJS 导入 ESM（Node.js 14+）**：

```js
// 动态导入是唯一方式
async function loadESM() {
  const { foo } = await import('./esm-module.mjs');
  return foo();
}
```

**ESM 导入 CJS**：

```js
// Node.js 支持直接导入 CJS
import cjsModule from './cjs-module.cjs';
// 等效于：const cjsModule = require('./cjs-module.cjs');

// 命名导入通过静态分析模拟
import { namedExport } from './cjs-module.cjs';
// 注意：仅当 CJS 模块有 __esModule 标记时才可靠
```

**package.json 中的 `type` 字段**：

```json
{
  "type": "module",
  "main": "./dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

| `type` 值 | `.js` 文件 | `.mjs` 文件 | `.cjs` 文件 |
|----------|-----------|------------|------------|
| `"module"` | ESM | ESM | CJS |
| `"commonjs"`（默认） | CJS | ESM | CJS |

### 6.4 Node.js ESM 实践

**条件导出 (Conditional Exports)**：

```json
{
  "name": "my-lib",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "default": "./dist/index.mjs"
    },
    "./package.json": "./package.json",
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  }
}
```

**子路径导入 (Subpath Imports)**：

```json
{
  "imports": {
    "#config": "./src/config.js",
    "#utils/*": "./src/utils/*.js"
  }
}
```

```js
// 项目中可以使用自引用导入
import { apiUrl } from '#config';
import { formatDate } from '#utils/date';
```

**`import.meta` 元数据**：

```js
// 当前模块的绝对路径（file:///path/to/module.js）
console.log(import.meta.url);

// 解析相对路径为绝对路径
const configPath = new URL('./config.json', import.meta.url);
const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));

// Node.js 特有的 import.meta
console.log(import.meta.dirname);  // 模块所在目录（Node 20.11+）
console.log(import.meta.filename); // 模块文件路径（Node 20.11+）
```

---

## 7. 动态导入与代码分割

### 7.1 `import()` 表达式

```js
// 条件加载
if (userPreference.language === 'zh') {
  const { messages } = await import('./locales/zh.js');
  i18n.setMessages(messages);
}

// 错误处理
try {
  const heavyModule = await import('./heavy-computation.js');
  heavyModule.run();
} catch (e) {
  console.error('Failed to load module:', e);
}

// 并行加载
const [moduleA, moduleB] = await Promise.all([
  import('./a.js'),
  import('./b.js')
]);
```

### 7.2 打包器代码分割策略

| 策略 | 配置示例 | 适用场景 |
|------|---------|----------|
| 路由级别 | `() => import('./pages/Home.js')` | SPA 路由懒加载 |
| 组件级别 | `const Chart = lazy(() => import('./Chart'))` | 大型组件按需加载 |
| 库级别 | `import('lodash-es/debounce')` | 第三方库按需引入 |
| 手动分割 | `import(/* webpackChunkName: "admin" */ './AdminPanel')` | 按业务域分割 |

---

## 8. 常见陷阱

### 8.1 默认导出与命名导出的互操作

```js
// module.js
export default function foo() {}
export const bar = 1;

// ❌ 错误：默认导出没有 named 绑定
import { default as foo, bar } from './module.js';  // ✅ 正确
import { foo, bar } from './module.js';             // ❌ 错误
```

### 8.2 循环依赖的 ESM 行为

```js
// a.js
import { b } from './b.js';
console.log('a.js executing, b =', b);
export const a = 'a-value';

// b.js
import { a } from './a.js';
console.log('b.js executing, a =', a);  // undefined（TDZ）
export const b = 'b-value';
```

ESM 中循环依赖的导入在对方模块未执行完成前为**未初始化 (TDZ)** 状态，访问会抛出错误。

### 8.3 Node.js ESM 与 CJS 混用陷阱

```js
// ❌ 在 ESM 中无法使用 __dirname / __filename
console.log(__dirname); // ReferenceError

// ✅ 替代方案
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ❌ 在 ESM 中无法使用 require（除非创建）
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// 仅用于读取 JSON 文件等特殊情况
const pkg = require('./package.json');
```

### 8.4 路径解析差异

```js
// ESM 要求完整路径（包括扩展名）
import { foo } from './utils.js';     // ✅
import { foo } from './utils';        // ❌ Node.js ESM 中失败

// CJS 自动补全扩展名
const { foo } = require('./utils');    // ✅ 自动尝试 .js/.json/.node
```

---

## 9. 构建工具配置最佳实践

### 9.1 发布双模式包

```json
{
  "name": "my-library",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "sideEffects": false
}
```

### 9.2 TypeScript + ESM 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

```json
// package.json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "test": "node --test dist/**/*.test.js"
  }
}
```

---

## 参考

- [ECMAScript Specification - Module Semantics](https://tc39.es/ecma262/#sec-modules)
- [Rollup Guide on Tree Shaking](https://rollupjs.org/guide/en/#tree-shaking)
- [Webpack Tree Shaking Documentation](https://webpack.js.org/guides/tree-shaking/)
- [Node.js ESM Documentation](https://nodejs.org/api/esm.html) 📘
- [TypeScript ESM Guide](https://www.typescriptlang.org/docs/handbook/esm-node.html) 📘
- [Pure ESM Package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) 📄
