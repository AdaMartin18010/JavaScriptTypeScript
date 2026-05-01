# CJS/ESM 互操作深度解析 (CJS/ESM Interoperability Deep Dive)

> **形式化定义**：CJS/ESM 互操作（Interoperability）是指在单一 Node.js 运行时或跨平台 JavaScript 运行时（Node.js / Bun / Deno）中，CommonJS 模块与 ECMAScript Modules 模块之间进行相互引用、调用和类型转换时所涉及的完整语义规则集。该规则集由 Node.js 的模块加载器实现、TypeScript 的类型擦除策略、打包工具（Bundler）的转换层以及各运行时的扩展机制共同定义。其核心矛盾在于 CJS 的**动态导出对象语义（Dynamic Export Object Semantics）**与 ESM 的**静态绑定映射语义（Static Binding Map Semantics）**之间的结构性不匹配。
>
> 设 CJS 导出语义为函数 $E_{CJS}: \text{ModuleBody} \to \text{Object}$，即模块体执行完毕后产生一个普通 JavaScript 对象；而 ESM 导出语义为函数 $E_{ESM}: \text{ModuleBody} \to \text{BindingMap}$，即模块体在编译阶段产生一组不可变的绑定（Binding）到变量名的映射。互操作的本质是构造一个适配层 $A: \text{Object} \to \text{BindingMap}$（CJS → ESM）及其逆 $A^{-1}: \text{BindingMap} \to \text{Object}$（ESM → CJS），使得两个模块系统能够无损或受控损失地交换信息。
>
> 对齐版本：Node.js 22–23 | TypeScript 5.7–5.8 | ECMAScript 2025 (ES16) | Bun 1.2

---

## 1. 双模块问题 (The Dual-Module Problem in Node.js)

### 1.1 问题起源与历史演进

Node.js 于 v12 引入原生 ESM 支持（`--experimental-modules`），于 v14 稳定化，v15+ 全面推广，`type: "module"` 成为推荐实践。同一生态系统中同时存在两种模块格式：

- **CommonJS（CJS）**：`require()` / `module.exports`，同步加载，运行时解析，顶层 `this` 指向 `module.exports`；
- **ECMAScript Modules（ESM）**：`import` / `export`，异步求值，编译时解析，隐式严格模式（Strict Mode），顶层 `this` 为 `undefined`。

这两种格式在**加载时序（Loading Timing）**、**导出语义（Export Semantics）**、**作用域规则（Scope Rules）**和**错误模型（Error Model）**上存在根本性差异，导致互操作（Interoperability）成为一个非平凡的工程问题。可以把 CJS 想象成「即取即用的快递柜」——你随时可以用钥匙（`require`）打开取货；而 ESM 则是「预定制的订阅服务」——所有合约（`import`/`export`）在开业前（编译阶段）就已签好，开业后（运行时）只按合约履约。

### 1.2 核心矛盾矩阵

| 维度 | CommonJS | ESM | 互操作影响 |
|------|---------|-----|----------|
| 加载时序 | 同步（Synchronous） | 异步（Asynchronous） | CJS 无法同步 `require` ESM，必须用 `import()` |
| 导出结构 | 单一对象 `module.exports` | 命名绑定集合 `ExportEntries` | ESM 导入 CJS 时需将对象「拆解」为绑定 |
| 解析时机 | 运行时（Runtime） | 编译时（Compile Time） | ESM 的 Tree Shaking 依赖静态结构，CJS 难以分析 |
| 顶层 `this` | `module.exports` | `undefined`（严格模式） | 混用时 `this` 绑定行为突变 |
| 动态导入 | `require()` 任意位置 | `import()` 表达式 | 语义等价但语法不同 |
| 模块记录缓存 | `require.cache` | 内部 Loader 缓存 | 两个缓存不互通，可能导致状态分裂 |
| 顶层 await | 不支持 | 支持（ES2022） | ESM 模块求值可异步，CJS 求值必须同步完成 |
| JSON / C++ Addon 导入 | `require('./data.json')` | `import json from './data.json' with { type: 'json' }` | Node.js 22+ 稳定 |

---

## 2. `__esModule` 属性与 Babel 互操作

### 2.1 历史起源与语义

Babel 在将 ESM 源码转译为 CJS 时，为了保留 ESM 的语义信息（尤其是 `default export` 与 `named exports` 的区分），引入了 `__esModule` 标记：

```javascript
Object.defineProperty(exports, "__esModule", { value: true });
```

该标记的语义为：「本模块虽然以 CJS 格式输出，但其源语义是 ESM，默认导出应通过 `.default` 属性访问」。这个标记本质上是一个**元数据信号（Metadata Signal）**，告诉互操作层「不要把我当作普通 CJS 对象处理」。

### 2.2 Babel 的 `_interopRequireDefault` 辅助函数

当 CJS 代码通过 Babel 消费 ESM 转译产物时，Babel 会注入如下互操作层：

```javascript
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
```

| 场景 | `__esModule` 值 | `_interopRequireDefault` 行为 | 最终访问方式 |
|------|---------------|------------------------------|-------------|
| Babel 转译的 ESM → CJS | `true` | 返回原对象，保留 `default` 属性 | `mod.default` |
| TypeScript `tsc` 转译的 ESM → CJS | `true` | 同上 | `mod.default` |
| 原生 CJS 模块 | `undefined` / `false` | 将整个 `module.exports` 包装为 `{ default: obj }` | `mod.default`（间接访问原对象） |

TypeScript 编译器（`tsc`）在 `module: "commonjs"` 模式下也会生成 `__esModule` 标记，但其辅助函数与 Babel 略有差异：

```javascript
// TypeScript 生成的辅助函数（简化版）
var __createBinding = (this && this.__createBinding) || (Object.create
  ? function(o, m, k, k2) { if (k2 === undefined) k2 = k; Object.defineProperty(o, k2, {
      enumerable: true, get: function() { return m[k]; }
    }); }
  : function(o, m, k, k2) { if (k2 === undefined) k2 = k; o[k2] = m[k]; });

var __exportStar = (this && this.__exportStar) || function(m, exports) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
    __createBinding(exports, m, p);
};
```

### 2.3 `__esModule` 的陷阱与正确用法

**负面示例**：错误地假设所有 ESM 转译产物都有 `default` 导出。

```typescript
// ❌ 错误：原生 ESM 没有 __esModule，但 Node.js 的 Synthetic Module 也不暴露 __esModule
import * as cjs from "./legacy.cjs";
console.log(cjs.__esModule); // undefined — 但这不是判断标准！

// ✅ 正确：使用 Node.js 的标准导入方式
import cjs from "./legacy.cjs"; // 若 legacy.cjs 用 module.exports = { foo: 1 }
console.log(cjs.foo); // 1
```

**正面示例**：手写 CJS 兼容 ESM 消费者的正确方式。

```typescript
// dual-utils.cjs — 手动标记 __esModule 以兼容 Babel/tsc 消费者
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function dualHelper() { return 42; };
exports.namedHelper = function namedHelper() { return 43; };
```

---

## 3. `createRequire(import.meta.url)`：ESM → CJS 的桥梁

### 3.1 机制说明与边界条件

在 ESM 模块中，不存在原生的 `require()` 函数。Node.js 提供 `module.createRequire` API，允许 ESM 模块基于自身路径创建一个 CJS 风格的 `require` 函数：

```typescript
// ESM 文件 (.mjs 或 type: module)
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const cjs = require("./legacy.cjs");
```

### 3.2 关键语义与缓存共享

- `createRequire` 创建的 `require` 函数与原生 CJS `require` **共享同一个 `require.cache`**；
- `import.meta.url` 用于确定解析的基准路径（Base URL），其值为 `file:///path/to/file.mjs` 格式的 URL 字符串；
- 该机制使得**渐进式迁移（Incremental Migration）**成为可能——ESM 模块可以逐步替换 CJS 依赖，而无需一次性重构整个代码库。

**代码示例：ESM 中使用 CJS 的 `__dirname` 和 `__filename` 等价物**

```typescript
// utils.mjs
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 现在可以像 CJS 一样读取 JSON 文件
const pkg = require("./package.json");
console.log(__dirname, pkg.name);

// 也可以解析 CJS 模块的真实路径
const cjsPath = require.resolve("./legacy.cjs");
console.log("Resolved to:", cjsPath);
```

**代码示例：在 ESM 中动态加载 `.node` 原生插件**

```typescript
// native-loader.mjs
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

// ESM 不能直接 require .node 文件，但 createRequire 可以
const nativeAddon = require("./build/Release/myaddon.node");
console.log(nativeAddon.process(42));
```

### 3.3 边缘案例：`createRequire` 与 `import.meta.resolve`

Node.js 20+ 提供了 `import.meta.resolve`，它可以解析模块指定符为 URL，但**不执行模块**：

```typescript
// compare-resolve.mjs
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// require.resolve 同步返回绝对路径
const cjsPath = require.resolve("lodash");

// import.meta.resolve 同步返回 file:// URL（Node.js 20+ 稳定）
const esmUrl = import.meta.resolve("lodash");

console.log(cjsPath); // /project/node_modules/lodash/lodash.js
console.log(esmUrl);  // file:///project/node_modules/lodash/lodash.js
```

两者关键差异：`require.resolve` 会触发模块加载器的**路径解析算法**，而 `import.meta.resolve` 触发的是**ESM 解析算法**，两者在处理 `"exports"` 条件时的行为是一致的，但 `import.meta.resolve` 不访问 `require.cache`。

---

## 4. CJS → ESM：动态 `import()`

### 4.1 语法与语义

CJS 模块无法使用 `require()` 加载 ESM 模块（Node.js 会抛出 `ERR_REQUIRE_ESM`）。但 CJS 可以使用动态导入表达式 `import()`：

```typescript
// CJS 文件
async function loadEsm() {
  const esm = await import("./module.mjs");
  console.log(esm.default);
}
```

### 4.2 异步性约束与顶层 await

由于 ESM 模块的顶层求值可能是异步的（例如包含顶层 `await`），`import()` 返回一个 `Promise<ModuleNamespaceObject>`。这要求 CJS 代码必须以异步方式消费 ESM：

| 方向 | 语法 | 同步性 | 支持状态 | 运行时行为 |
|------|------|--------|---------|----------|
| CJS → ESM | `require("esm")` | 同步 | ❌ 禁止（`ERR_REQUIRE_ESM`） | 抛出错误 |
| CJS → ESM | `import("esm")` | 异步 | ✅ 支持 | 返回 Promise，解析为 Namespace Object |
| ESM → CJS | `import cjs from "cjs"` | 同步 | ✅ 支持 | 将 `module.exports` 包装为 Synthetic Namespace |
| ESM → CJS | `require("cjs")` via `createRequire` | 同步 | ✅ 支持 | 直接调用 CJS require |

**代码示例：CJS 中动态导入 ESM 并处理命名导出**

```typescript
// loader.cjs
async function loadUtils() {
  // 动态导入 ESM 模块 — 解构命名导出和默认导出
  const { foo, bar, default: defaultExport } = await import("./utils.mjs");

  console.log(foo, bar);
  console.log(defaultExport);
}

// 在 CJS 顶层使用立即执行异步函数
(async () => {
  await loadUtils();
})();
```

**代码示例：CJS 中条件加载 ESM 子模块（Plugin 架构）**

```typescript
// plugin-loader.cjs
const plugins = new Map();

async function registerPlugin(name) {
  // 动态导入允许运行时决定加载哪个模块
  const plugin = await import(`./plugins/${name}.mjs`);
  plugins.set(name, plugin.default ?? plugin);
}

(async () => {
  await registerPlugin("logger");
  await registerPlugin("metrics");
  plugins.get("logger").log("System ready");
})();
```

---

## 5. Dual Package Hazard（双包危害）

### 5.1 问题定义与数学直觉

当同一个 npm 包同时以 CJS 和 ESM 两种格式发布，且两种格式的构建产物各自维护独立的状态时，可能导致**状态分裂（State Splitting）**。从集合论的角度看，设包的 CJS 实例状态为 $S_{CJS}$，ESM 实例状态为 $S_{ESM}$，理想情况下应有 $S_{CJS} = S_{ESM}$（单例共享），但 Dual Package Hazard 导致 $S_{CJS} \cap S_{ESM} = \emptyset$（状态完全隔离）。

$$
> \text{理想状态：} S_{total} = S_{CJS} \cup S_{ESM}, \quad S_{CJS} = S_{ESM} \text{（单例）}
> $$
> $$
> \text{危险状态：} S_{total} = S_{CJS} \sqcup S_{ESM} \text{（不交并），消费者看到不一致视图}
> $$

### 5.2 典型危害场景与复现

假设 `pkg` 内部维护一个全局计数器：

- CJS 消费者 `require('pkg')` 修改计数器 → CJS 实例状态变更；
- ESM 消费者 `import 'pkg'` 读取计数器 → ESM 实例状态未变；
- 两者观察到不一致的状态，导致逻辑错误。

**代码示例：复现 Dual Package Hazard**

```typescript
// counter-lib/index.cjs
let count = 0;
module.exports = {
  increment() { return ++count; },
  getCount() { return count; }
};

// counter-lib/index.mjs
let count = 0;
export const increment = () => ++count;
export const getCount = () => count;

// consumer.cjs
const cjsCounter = require("counter-lib");
console.log(cjsCounter.increment()); // 1

// consumer.mjs
import * as esmCounter from "counter-lib";
console.log(esmCounter.getCount()); // 0 — 状态分裂！

// 更糟糕的场景：同一进程同时加载两者
// mixed-consumer.mjs
import { getCount as esmGetCount } from "counter-lib";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const cjsCounter = require("counter-lib");

cjsCounter.increment();
cjsCounter.increment();
console.log("CJS count:", cjsCounter.getCount()); // 2
console.log("ESM count:", esmGetCount());       // 0 — 灾难！
```

### 5.3 消除策略深度分析

| 策略 | 实现方式 | 适用场景 | 局限性 |
|------|---------|---------|--------|
| 状态隔离 | 将共享状态抽离至独立 CJS 模块，ESM 入口通过 `createRequire` 引用 | 已有 CJS 状态库需兼容 ESM | ESM 消费者仍需通过 CJS 层访问状态 |
| ESM 封装 CJS | 仅发布 CJS 构建，ESM 入口为薄封装层（Thin Wrapper） | 库作者控制发布格式 | 失去 ESM 的 Tree Shaking 优势 |
| Wrapper 模式 | CJS 和 ESM 均引用同一内部实现，入口自身无状态 | 推荐方案，现代库标准做法 | 构建配置复杂度增加 |
| 状态外置 | 使用全局 `globalThis` 或外部存储（Redis） | 必须跨格式共享状态时 | 引入全局可变状态，违背模块化 |

**代码示例：Wrapper 模式消除 Dual Package Hazard（推荐）**

```typescript
// my-lib/package.json
{
  "name": "my-lib",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}

// my-lib/src/_core.cjs — 单一实现源（CJS 格式）
const state = new Map();
function setState(key, value) { state.set(key, value); }
function getState(key) { return state.get(key); }
module.exports = { setState, getState };

// my-lib/dist/index.mjs — ESM 薄封装
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
export const { setState, getState } = require("./_core.cjs");

// my-lib/dist/index.cjs — CJS 薄封装（直接 re-export）
module.exports = require("./_core.cjs");
```

---

## 6. Conditional Exports：`package.json` 的 `exports` 字段

### 6.1 机制说明与条件键优先级

`package.json` 的 `exports` 字段是 Node.js 解决互操作问题的核心机制。它允许包作者根据消费者的模块系统（CJS 或 ESM）提供不同的入口文件。条件键（Condition Keys）的匹配顺序遵循**声明优先（Declaration Priority）**原则：

```json
{
  "name": "my-lib",
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      },
      "default": "./dist/index.js"
    }
  }
}
```

### 6.2 条件键完整优先级（Node.js 22+）

Node.js 和 TypeScript 支持的条件键按典型使用顺序排列：

| 优先级 | 条件键 | 说明 | 适用场景 |
|--------|--------|------|---------|
| 1 | `"types"` | TypeScript 类型声明路径 | **推荐放在首位**，使 TS 优先匹配类型 |
| 2 | `"node"` / `"node-addons"` | Node.js 环境专属 | 区分 Node.js 与浏览器 |
| 3 | `"import"` | ESM 导入上下文 | `import` / `import()` 语句 |
| 4 | `"require"` | CJS 导入上下文 | `require()` 语句 |
| 5 | `"default"` | 兜底条件 | 必须放在最后，无匹配时回退 |
| — | `"browser"` | 浏览器环境（打包工具识别） | Webpack / Rollup / Vite |
| — | `"worker"` | Web Worker 环境 | Cloudflare Workers, Deno Deploy |
| — | `"deno"` / `"bun"` | 特定运行时 | Deno / Bun 专属入口 |

**重要规则**：条件键匹配是**短路求值**的——一旦某个条件键匹配成功，其对应的值即被返回，后续条件键不再检查。因此 `"default"` 必须放在最后。

### 6.3 TypeScript 5.7+ 的 `types` 条件首位置要求

TypeScript 5.7 强化了 `"types"` 条件的处理：当 `"types"` 作为 `exports` 对象的第一个键时，TypeScript 编译器会**优先**读取该路径以获取类型信息，而不论当前的模块解析条件是什么。这对于双格式库至关重要：

```json
{
  "exports": {
    ".": {
      "types": {
        "import": "./dist/index.d.mts",
        "require": "./dist/index.d.cts"
      },
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

### 6.4 子路径导出与模式匹配

```json
{
  "name": "my-lib",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    },
    "./features/*.js": {
      "types": "./dist/features/*.d.ts",
      "import": "./dist/features/*.mjs",
      "require": "./dist/features/*.cjs"
    },
    "./package.json": "./package.json"
  }
}
```

**代码示例：使用通配符子路径导出的完整 TypeScript 库配置**

```typescript
// 消费者代码（ESM）
import { helper } from "my-lib/utils";
import { featureA } from "my-lib/features/a.js"; // 注意：通配符匹配要求指定扩展名

// 消费者代码（CJS）
const { helper } = require("my-lib/utils");
const { featureA } = require("my-lib/features/a.js");
```

---

## 7. `.mjs` / `.cjs` 扩展名与 `"type": "module"`

### 7.1 Node.js 模块类型判定规则

Node.js 通过以下规则判定 `.js` 文件的模块类型：

| package.json `type` | 文件扩展名 | 模块格式 | 严格模式 | 备注 |
|-------------------|-----------|---------|---------|------|
| 未指定 | `.js` | CJS | 否（Sloppy Mode） | 默认行为 |
| 未指定 | `.mjs` | ESM | 是（隐式 Strict） | 强制 ESM |
| 未指定 | `.cjs` | CJS | 否 | 强制 CJS |
| `"commonjs"` | `.js` | CJS | 否 | 显式声明 |
| `"commonjs"` | `.mjs` | ESM | 是 | `.mjs` 优先于 `type` |
| `"module"` | `.js` | ESM | 是 | 推荐方案 |
| `"module"` | `.cjs` | CJS | 否 | `.cjs` 优先于 `type` |
| `"module"` | `.mts` | ESM | 是 | TypeScript 专用 |
| `"module"` | `.cts` | CJS | 否 | TypeScript 专用 |

### 7.2 Node.js 22 `--experimental-detect-module` 的影响

Node.js 22 引入了**自动模块检测（Auto-Module Detection）**：当 `package.json` 未指定 `type` 字段时，Node.js 会检查文件内容，若发现 ESM 语法（`import` / `export` 关键字），则自动将其作为 ESM 处理，无需 `.mjs` 扩展名。这减少了互操作摩擦，但也引入了新的边缘情况：

```typescript
// detect-module-test.js（无 package.json type 字段）
export const foo = 1; // Node.js 22+ 自动检测为 ESM

// 但以下文件仍会被检测为 CJS（无 ESM 语法）
const bar = 2;
module.exports = { bar };
```

**注意**：自动检测仅在**无 `package.json`** 或 **`package.json` 无 `type` 字段**时生效。显式配置总是优先。

---

## 8. TypeScript `moduleResolution`：`"nodenext"` vs `"bundler"`

### 8.1 设计目标差异与形式化对比

TypeScript 5.0+ 引入了 `"moduleResolution": "bundler"`，与 `"nodenext"` 形成对比。设 TypeScript 的解析函数为 $R_{TS}: (\text{specifier}, \text{config}) \to \text{Path}$，两种模式的核心差异在于对**扩展名约束**和**条件键支持**的处理：

| 维度 | `"nodenext"` | `"bundler"` | `"node"` |
|------|-------------|------------|---------|
| 设计目标 | 精确匹配 Node.js 运行时行为 | 匹配打包工具（Vite/Webpack/Rollup）行为 | 兼容 Node.js CJS |
| 扩展名要求 | 强制 `.js`/`.mjs`/`.cjs` | 可省略扩展名 | 可省略扩展名 |
| `type` 字段 | 严格遵循 | 可忽略 | 忽略 |
| 条件导出 | 严格匹配（`import`/`require`/`types`） | 宽松匹配，支持 `"browser"` | 不支持 |
| `imports` 裸指定符 | 遵循 Node.js 解析算法 | 支持 `package.json` 中的 `"imports"` | 不支持 |
| 适用场景 | Node.js 原生 ESM/CJS 库 | Web 应用、打包工具项目 | 遗留 CJS 项目 |
| TS 5.7 新特性 | `rewriteRelativeImportExtensions` | `customConditions` | — |

### 8.2 TypeScript 5.7 的 `rewriteRelativeImportExtensions`

TypeScript 5.7 引入了 `rewriteRelativeImportExtensions` 选项，允许在 `nodenext` 模式下编写 `.ts` 扩展名，编译器会自动将其重写为 `.js`：

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rewriteRelativeImportExtensions": true
  }
}
```

```typescript
// 源码中可以写 .ts（开发体验提升）
import { foo } from "./foo.ts"; // ✅ TS 5.7+ 编译为 import { foo } from "./foo.js"

// 但不适用于 .mts / .cts
import { bar } from "./bar.mts"; // ❌ 仍会被保留为 .mts
```

**推理链**：若项目最终由 Vite 打包，则 `"bundler"` 更贴近实际行为；若项目发布为 npm 包供 Node.js 直接使用，则 `"nodenext"` 是必要的，否则运行时可能出现路径解析失败。`rewriteRelativeImportExtensions`  bridging 了开发体验与运行时正确性之间的鸿沟。

### 8.3 `module: "preserve"` 与类型检查边界

TypeScript 5.4+ 引入了 `"module": "preserve"`，该模式下 TypeScript 仅做类型检查，不转换模块语法，同时自动选择最合适的 `moduleResolution`：

```json
{
  "compilerOptions": {
    "module": "preserve",
    "moduleResolution": "bundler"
  }
}
```

此配置特别适用于**仅类型检查**的场景（如配合 `tsup` / `esbuild` 做独立构建），避免了 tsc 的 emit 与打包工具之间的重复工作。

**代码示例：Node.js 库的 `tsconfig.json` 配置（TS 5.7 推荐）**

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rewriteRelativeImportExtensions": true,
    "declaration": true,
    "declarationMap": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

---

## 9. Node.js 22/23 模块系统新特性

### 9.1 `module-sync` 输出格式实验

Node.js 23 实验性引入了 `require(esm)` 的支持，允许在特定条件下用 `require()` 同步加载 ESM 模块。这要求 ESM 模块：**不含顶层 await**、**通过 `--experimental-require-module` 标志启用**。对应的 TypeScript 输出格式为 `"module-sync"`：

```json
{
  "compilerOptions": {
    "module": "module-sync"
  }
}
```

该特性旨在缩小 CJS/ESM 互操作的最后鸿沟，但截至 Node.js 23 仍为实验性，生产环境不推荐依赖。

### 9.2 `import.meta.resolve` 稳定化

Node.js 20 将 `import.meta.resolve` 标记为稳定 API，Node.js 22+ 进一步完善了其与 `exports` 条件的交互：`import.meta.resolve(specifier, parentURL)` 支持第二个参数指定父模块 URL，影响 `node_modules` 查找的起点。

```typescript
// Node.js 22+ import.meta.resolve 的完整签名
const resolved = import.meta.resolve("lodash", "file:///other/project/");
// 从 /other/project/node_modules 开始查找 lodash，而非当前文件所在目录
```

### 9.3 JSON 模块导入的稳定化

Node.js 22+ 稳定支持 ESM JSON 导入，使用 `with` 断言（替代已废弃的 `assert`）：

```typescript
import pkg from "./package.json" with { type: "json" };
console.log(pkg.version);
```

---

## 10. 平台特定条件导出与运行时差异

### 10.1 多运行时条件键

现代 JavaScript 库往往需要支持多个运行时。`exports` 字段支持运行时特定的条件键：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "bun": "./dist/index.bun.mjs",
      "deno": "./dist/index.deno.mjs",
      "worker": "./dist/index.worker.mjs",
      "browser": "./dist/index.browser.mjs",
      "node": {
        "import": "./dist/index.node.mjs",
        "require": "./dist/index.node.cjs"
      },
      "default": "./dist/index.mjs"
    }
  }
}
```

### 10.2 Bun 的模块互操作特性

Bun 1.0+ 对 CJS/ESM 互操作采取了更宽松（也更危险）的策略：

- Bun 允许在 ESM 文件中**直接**使用 `require()`，无需 `createRequire`；
- Bun 的 `require()` 可以同步加载 ESM 模块（Node.js 会抛错）；
- Bun 支持 `.toml` 文件的直接 `import`。

**代码示例：Bun 的宽松互操作（注意：Node.js 不兼容）**

```typescript
// bun-only.mjs — 仅在 Bun 中运行！
// Bun 允许 ESM 中直接使用 require
const cjs = require("./legacy.cjs");

// Bun 允许同步 require ESM
const esm = require("./module.mjs");

// Bun 支持 TOML 直接导入
import config from "./bunfig.toml";
console.log(config);
```

**重要警告**：Bun 的宽松策略虽然便利，但会破坏与 Node.js 的兼容性。编写跨平台库时应避免依赖 Bun 的扩展行为。

---

## 11. ESM Wrapper Pattern：现代双格式库的标准实践

### 11.1 问题背景

发布同时支持 CJS 和 ESM 的 npm 包时，最稳健的方案是**单一源码 + 双格式输出 + ESM Wrapper 消除状态分裂**。Vite / Rollup / tsup 等工具可以生成双格式输出，但库作者需要正确配置 `package.json`。

### 11.2 完整的现代库 `package.json` 配置

```json
{
  "name": "modern-lib",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": {
        "import": "./dist/index.d.mts",
        "require": "./dist/index.d.cts"
      },
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./package.json": "./package.json"
  },
  "files": ["dist"],
  "sideEffects": false
}
```

### 11.3 TypeScript 声明文件的双格式 Emit

TypeScript 5.0+ 支持 `.d.mts` 和 `.d.cts` 扩展名，分别对应 ESM 和 CJS 的类型声明。关键差异在于 `default export` 的处理：

```typescript
// index.d.mts — ESM 声明文件
export declare const foo: string;
export default function main(): void;

// index.d.cts — CJS 声明文件
export declare const foo: string;
export = main; // CJS 的 module.exports 赋值
export as namespace main; // 可选：UMD 支持
declare function main(): void;
```

---

## 12. pnpm Workspace 协议与互操作

### 12.1 `workspace:` 协议对模块解析的影响

在 pnpm monorepo 中，`workspace:` 协议允许包引用同一仓库内的其他包。该协议在模块解析层面影响互操作：

```json
{
  "dependencies": {
    "@my/lib": "workspace:*"
  }
}
```

解析时，pnpm 会将 `workspace:*` 替换为当前仓库中 `@my/lib` 的实际版本，并在 `node_modules` 中创建指向本地源码的符号链接。这意味着：

- 若 `@my/lib` 的 `package.json` 配置了 `exports` 字段，消费者将按标准算法解析；
- 若 `@my/lib` 使用 `type: "module"`，而消费者是 CJS，必须确保 `@my/lib` 提供了 `"require"` 条件导出。

### 12.2 `catalog:` 协议与版本统一

pnpm 9.5+ 引入了 `catalog:` 协议，用于在 monorepo 中统一管理依赖版本：

```yaml
# pnpm-workspace.yaml
catalog:
  typescript: "^5.7.0"
  rollup: "^4.0.0"
```

```json
// packages/app/package.json
{
  "devDependencies": {
    "typescript": "catalog:"
  }
}
```

这对互操作的影响在于：monorepo 中所有包使用相同版本的 TypeScript，确保 `moduleResolution` 行为一致，避免因版本差异导致的类型解析不一致。

---

## 13. CJS vs ESM 互操作能力全景对比表

| 能力 | CJS 消费者 | ESM 消费者 | 说明 |
|------|-----------|-----------|------|
| 导入 CJS | `require('cjs')` | `import cjs from 'cjs'` | ESM 将 CJS 包装为 Synthetic Namespace |
| 导入 ESM | `import('esm')`（异步） | `import esm from 'esm'` | CJS 禁止同步 `require()` ESM |
| 命名导入 CJS | `require('cjs').named` | `import { named } from 'cjs'`（启发式，不可靠） | Node.js 尝试静态分析 CJS 的 exports |
| `default` 导入 CJS | `require('cjs')`（直接访问） | `import cjs from 'cjs'` | CJS 的 `module.exports` 映射为 `default` |
| 在 ESM 中使用 `require` | N/A | `createRequire(import.meta.url)` | 创建局部 `require` 函数 |
| 动态导入 | `import()` | `import()` | 两者均支持，返回 Promise |
| 条件导出匹配 | `"require"` 条件 | `"import"` 条件 | 互斥条件 |
| Tree Shaking | 困难（运行时结构） | 天然支持（静态结构） | 打包工具对 CJS 使用启发式 |
| 顶层 `await` | 不支持 | 支持 | CJS 模块求值必须是同步的 |
| `import.meta.url` | 不支持 | 支持 | CJS 使用 `__filename` |
| `require.cache` 操作 | 支持 | 不直接支持 | ESM 无公开 cache API |
| JSON 导入 | `require('./x.json')` | `import x from './x.json' with { type: 'json' }` | Node.js 22+ 稳定 |
| `.node` Addon | `require('./x.node')` | `createRequire(import.meta.url)('./x.node')` | ESM 需借助 createRequire |

---

## 14. Node.js ESM 加载 CJS 的算法详解

当 ESM 执行 `import cjs from "./module.cjs"` 时，Node.js 执行以下转换，生成**合成模块命名空间对象（Synthetic Module Namespace Object）**：

```
ESMImportCJS(module.exports):
  if module.exports is not an object or is null:
    return { default: module.exports, [Symbol.toStringTag]: 'Module' }

  namespace ← CreateSyntheticModule()

  if module.exports.__esModule is true:
    for each key in module.exports:
      if key ≠ "__esModule":
        namespace[key] ← module.exports[key]
    namespace.default ← module.exports.default ?? module.exports
  else:
    namespace.default ← module.exports
    for each key in module.exports:
      if key ≠ "default":
        namespace[key] ← module.exports[key]

  return namespace
```

**关键语义**：

- CJS 的 `module.exports` 总是被包装为一个 Synthetic Module Namespace Object；
- 若 `__esModule` 为真，默认导出优先取 `module.exports.default`，否则整个 `module.exports` 成为 `default`；
- 命名导出通过遍历 `module.exports` 的键来生成，但对于非对象导出（如函数、字符串），只有 `default` 可用。

**代码示例：验证 ESM 对 CJS 的包装行为**

```typescript
// cjs-exports.cjs
module.exports = function main() { return 42; };
module.exports.helper = function helper() { return 43; };

// esm-importer.mjs
import cjs from "./cjs-exports.cjs";
import * as ns from "./cjs-exports.cjs";

console.log(typeof cjs);        // 'function'（default 为函数本身）
console.log(cjs.helper());      // 43（命名导出也挂在 default 上）
console.log(ns.helper());       // 43（命名导出）
console.log(ns.default.helper()); // 43（default 引用同一对象）
```

---

## 15. 实战：构建一个双格式兼容的 TypeScript 库

### 15.1 项目结构

```
dual-format-lib/
├── src/
│   ├── index.ts
│   └── utils.ts
├── dist/
│   ├── index.mjs / index.cjs
│   ├── index.d.mts / index.d.cts
│   └── utils.mjs / utils.cjs
├── package.json
└── tsconfig.json
```

### 15.2 配置代码

```json
// package.json
{
  "name": "dual-format-lib",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": {
        "import": "./dist/index.d.mts",
        "require": "./dist/index.d.cts"
      },
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "types": {
        "import": "./dist/utils.d.mts",
        "require": "./dist/utils.d.cts"
      },
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  },
  "files": ["dist"]
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

```typescript
// src/index.ts
export { add, multiply } from "./utils.js"; // 注意：.js 扩展名

export default function init() {
  console.log("Library initialized");
}
```

```typescript
// src/utils.ts
export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}
```

### 15.3 构建脚本（tsup）

```json
// package.json scripts
{
  "scripts": {
    "build": "tsup src/index.ts src/utils.ts --format cjs,esm --dts --out-dir dist"
  }
}
```

`tsup` 会自动生成 `.mjs` / `.cjs` / `.d.mts` / `.d.cts` 文件，无需手动维护多份声明。

---

## 16. `import.meta.url` 与 CJS 全局变量的完整映射

### 16.1 互操作对照表

ESM 没有 `__dirname` 和 `__filename`，但 `import.meta.url` 提供了更强大的元信息能力：

| CJS 变量 | ESM 等效方案 | 说明 |
|---------|------------|------|
| `__filename` | `fileURLToPath(import.meta.url)` | 当前文件的绝对路径 |
| `__dirname` | `dirname(fileURLToPath(import.meta.url))` | 当前文件所在目录 |
| `require.main === module` | `process.argv[1] === fileURLToPath(import.meta.url)` | 是否为主入口 |
| `require.resolve(id)` | `import.meta.resolve(id)` | 解析模块路径 |
| `require.cache` | 无直接等效 | ESM 缓存不可访问 |
| `module.id` | `import.meta.url` | 模块标识符 |
| `module.hot` (Webpack) | `import.meta.hot` (Vite) | HMR API |

**代码示例：完整的 ESM 「CJS 兼容层」**

```typescript
// cjs-compat.mjs
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import process from "node:process";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);
export const require = createRequire(import.meta.url);
export const isMainModule = process.argv[1] === __filename;

// 使用方式
import { __dirname, require } from "./cjs-compat.mjs";
const pkg = require("../package.json");
console.log(join(__dirname, "config"));
```

---

## 17. JSON 导入、`with` 断言与 ESM/CJS 差异

### 17.1 从 `assert` 到 `with` 的演进

ESM JSON 导入的语法经历了从 `assert` 到 `with` 的演进：

```typescript
// ❌ 已废弃（Node.js 18–20 支持，22+ 弃用）
import pkg from "./package.json" assert { type: "json" };

// ✅ Node.js 22+ 推荐语法
import pkg from "./package.json" with { type: "json" };

// ✅ 导入具名属性（Node.js 22+ 实验性）
import { version } from "./package.json" with { type: "json" };
```

**CJS 对比**：CJS 的 `require('./package.json')` 直接返回解析后的对象，无需断言。这在互操作中造成摩擦——ESM 消费者必须知道文件类型并使用 `with` 语法，而 CJS 消费者无此要求。

### 17.2 模块格式对导入语法的影响矩阵

| 目标文件 | CJS 语法 | ESM 语法 | 备注 |
|---------|---------|---------|------|
| `.json` | `require('./x.json')` | `import x from './x.json' with { type: 'json' }` | ESM 必须带 `with` |
| `.node` | `require('./x.node')` | `createRequire(import.meta.url)('./x.node')` | ESM 需借助 createRequire |
| `.wasm` | 不支持 | `import('./x.wasm')` 或 WebAssembly API | ESM 原生支持 |
| `.txt` | `fs.readFileSync` | `fs.readFileSync` 或 Bun 的 `import` | 无标准 ESM 语法 |

---

## 18. Node.js 23 `module-sync` 与 `require(esm)` 的未来

### 18.1 `--experimental-require-module` 的语义边界

Node.js 23 的 `require(esm)` 实验性支持并非万能。它仅适用于**无顶层 await** 的 ESM 模块：

```typescript
// sync-compatible.mjs
export const value = 42;
export function helper() { return 42; }
// ✅ 无顶层 await，可被 require()

// async-incompatible.mjs
export const config = await loadConfig();
// ❌ 含顶层 await，require() 抛出 ERR_REQUIRE_ASYNC_MODULE
```

这对应 TypeScript 的 `"module": "module-sync"` 输出目标，该目标确保生成的 ESM 模块不含异步顶层代码。

### 18.2 互操作的未来趋势

随着 Node.js 逐步推进 `require(esm)`，CJS/ESM 互操作可能经历以下演变：

1. **短期（2025–2026）**：`require(esm)` 实验性稳定化，更多库开始提供 ESM-only 版本
2. **中期（2026–2027）**：TypeScript 可能引入 `"module": "esm-sync-cjs"` 统一输出
3. **长期（2028+）**：CJS 进入维护模式，Node.js 核心模块全面 ESM 化

---

## 19. `require.main` 与 `import.meta.main` 的互操作鸿沟

### 19.1 CJS 的 `require.main`

在 CJS 中，`require.main` 指向启动当前进程的入口模块。这常用于判断当前文件是否被直接运行：

```typescript
// cli.cjs
if (require.main === module) {
  console.log("直接运行");
  main();
}
```

### 19.2 ESM 的 `import.meta.main`

Deno 和 Bun 支持 `import.meta.main`，但**Node.js 不提供该属性**。Node.js ESM 中的等效判断需要借助 `process.argv[1]` 和 `import.meta.url`：

```typescript
// cli.mjs
import { fileURLToPath } from "node:url";
import process from "node:process";

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  console.log("直接运行");
  main();
}
```

**互操作痛点**：当 CJS 模块通过 `createRequire` 在 ESM 中使用时，`require.main` 仍然指向原始入口模块（可能是 ESM），而非当前 CJS 模块。这会导致基于 `require.main` 的逻辑在 ESM 上下文中行为异常。

---

## 20. 跨转译器的 `__esModule` 互操作矩阵

不同转译器对 `__esModule` 的处理存在细微差异，这在混合使用 Babel、TypeScript、`esbuild`、`swc` 的项目中可能引发问题：

| 转译器 | `__esModule` 标记 | 辅助函数 | `default` 导出处理 |
|--------|-----------------|---------|------------------|
| Babel | ✅ 显式添加 | `_interopRequireDefault` | 检查 `__esModule` |
| TypeScript `tsc` | ✅ 显式添加 | `__createBinding` / `__exportStar` | 检查 `__esModule` |
| esbuild | ❌ 不添加 | 无 | 始终将 `module.exports` 作为 `default` |
| swc | ✅ 显式添加（默认） | `_interop_require_default` | 检查 `__esModule` |
| Rollup (`@rollup/plugin-commonjs`) | ✅ 模拟添加 | 自定义 | 启发式分析 |

**esbuild 的特殊性**：esbuild 不添加 `__esModule` 标记，这意味着用 esbuild 打包的 CJS 库在被 ESM 消费时，整个 `module.exports` 会被当作 `default` 导出，即使原始源码有 `export default` 和 `export { named }`。这可能导致消费端的命名导入失败。

---

## 21. 实战：从 CJS 到 ESM 的渐进式迁移路线图

### 21.1 迁移阶段模型

将大型 CJS 代码库迁移到 ESM 可分为五个阶段，每个阶段保持可运行状态：

**阶段 1：双格式兼容（Dual-format Compatibility）**
- 在 `package.json` 中添加 `exports` 字段，同时保留 `main`
- 使用 `tsup` / `rollup` 生成 `.mjs` 和 `.cjs` 双格式输出
- 不修改源码模块系统

**阶段 2：内部 ESM 化（Internal ESM Adoption）**
- 新文件使用 `.mjs` 或 `"type": "module"`
- 现有 CJS 文件通过 `createRequire` 被 ESM 消费
- 测试套件同时覆盖两种格式

**阶段 3：源码 ESM 化（Source ESM Conversion）**
- 将 `.js` 源码改为 ESM 语法（`import` / `export`）
- 使用 `.cjs` 保留必要的 CJS 入口
- 配置 `"type": "module"` 于 `package.json`

**阶段 4：移除 CJS（CJS Deprecation）**
- 从 `exports` 中移除 `"require"` 条件（ breaking change ）
- 更新文档，宣布 CJS 支持结束
- 主版本号升级（Major Version Bump）

**阶段 5：纯 ESM（ESM-only）**
- 仅发布 ESM 格式
- 利用 ESM 的静态结构优化 Tree Shaking
- 要求消费者使用 `import` 或动态 `import()`

### 21.2 迁移中的互操作检查清单

- [ ] `package.json` 是否配置了正确的 `exports` 字段？
- [ ] 双格式输出是否通过实际 `require()` 和 `import` 测试？
- [ ] TypeScript 声明文件是否提供了 `.d.mts` 和 `.d.cts`？
- [ ] 是否存在 `__esModule` 相关的消费者依赖？
- [ ] 状态共享模块是否避免了 Dual Package Hazard？
- [ ] 动态 `import()` 是否在 CJS 入口中正确处理了异步性？
- [ ] CI 是否同时测试 Node.js CJS 和 ESM 加载路径？

---

## 22. 调试互操作错误：常见错误码与诊断

### 22.1 `ERR_REQUIRE_ESM`

当 CJS 代码尝试用 `require()` 加载 ESM 模块时抛出。诊断流程：

1. 检查目标包的 `package.json` 是否包含 `"type": "module"`
2. 检查目标文件扩展名是否为 `.mjs`
3. 将 CJS 中的 `require()` 替换为 `await import()`
4. 若必须在 CJS 中同步使用，考虑为目标包添加 `"require"` 条件导出

### 22.2 `ERR_MODULE_NOT_FOUND`

ESM 导入失败时抛出。与 CJS 的 `MODULE_NOT_FOUND` 不同，ESM 错误信息包含尝试过的完整 URL：

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/project/src/utils'
    at finalizeResolution (internal/modules/esm/resolve.js:...)
```

**常见原因**：
- ESM 中省略了 `.js` 扩展名
- `exports` 字段配置错误，导致子路径无法解析
- TypeScript 编译后未保留正确的相对路径

### 22.3 `ERR_PACKAGE_PATH_NOT_EXPORTED`

当 `exports` 字段存在，但请求的子路径未被定义时抛出：

```
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './internal' is not defined by "exports"
```

**修复**：在 `package.json` 的 `exports` 字段中添加对应子路径，或使用 `"./package.json": "./package.json"` 允许访问包元数据。

---

## 23. `__esModule` 的历史遗产与现代替代

### 23.1 `__esModule` 的完整语义分析

`__esModule` 是 JavaScript 模块互操作历史上最重要的"暗语"之一。理解其语义对于调试跨模块系统的导入问题至关重要。

```typescript
// __esModule 语义真值表

// 场景 1：Babel 转译的 ESM → CJS
// 源码：export default function add(a, b) { return a + b; }
// 转译后：
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function add(a: number, b: number) { return a + b; };

// ESM 消费者导入：
import add from './babel-output.cjs';
// Node.js 检测 __esModule = true，将 exports.default 映射为 default 导出

// 场景 2：原生 CJS（无 __esModule）
module.exports = function add(a: number, b: number) { return a + b; };

// ESM 消费者导入：
import add from './native-cjs.cjs';
// Node.js 检测 __esModule 不存在或 falsy
// 整个 module.exports 被包装为 { default: module.exports }

// 场景 3：混合导出（有 __esModule + named exports）
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function add(a: number, b: number) { return a + b; };
exports.subtract = function(a: number, b: number) { return a - b; };

// ESM 消费者：
import add, { subtract } from './mixed.cjs';
// add → exports.default
// subtract → exports.subtract
```

### 23.2 现代替代方案：原生双模式发布

随着 Node.js 22+ 和 TypeScript 5.8+ 的成熟，`__esModule` 的必要性正在降低。现代库应采用条件导出（Conditional Exports）替代 Babel 转译：

```json
{
  "name": "modern-lib",
  "type": "module",
  "exports": {
    ".": {
      "types": {
        "import": "./dist/index.d.mts",
        "require": "./dist/index.d.cts"
      },
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

---

## 24. TypeScript `esModuleInterop` 深度解析

### 24.1 编译选项的行为矩阵

| `esModuleInterop` | `allowSyntheticDefaultImports` | 效果 |
|-------------------|-------------------------------|------|
| false | false | 严格的 ESM/CJS 互操作，无辅助函数 |
| false | true | 允许对无 default 的模块使用 default 导入（仅类型检查） |
| true | true（隐式） | 生成 `__importDefault` 和 `__importStar` 辅助函数 |

```typescript
// TypeScript 源码
import express from 'express';
import * as path from 'path';

// esModuleInterop: true 编译后
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for (var k in mod) {
            if (Object.prototype.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        }
    }
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path = __importStar(require("path"));
```

### 24.2 `__importStar` 的命名空间导入语义

`__importStar` 确保命名空间导入（`import * as x`）始终包含 `default` 属性，即使原始模块没有 `__esModule` 标记：

```typescript
// 原生 CJS 模块：module.exports = { foo: 1, bar: 2 };
import * as lib from './native-cjs.cjs';

// esModuleInterop: true 时：
console.log(lib.foo);      // 1
console.log(lib.bar);      // 2
console.log(lib.default);  // { foo: 1, bar: 2 }（整个模块对象）

// esModuleInterop: false 时：
// lib.default 为 undefined（原生 CJS 无 default 导出）
```

---

## 25. Dual Package Hazard 的量化分析

### 25.1 状态分裂的数学模型

设库 $L$ 的内部状态为 $S$，CJS 实例的状态为 $S_{\text{cjs}}$，ESM 实例的状态为 $S_{\text{esm}}$。若 $L$ 以 Dual Package 模式发布且未做状态同步：

$$
\forall t > 0,\; S_{\text{cjs}}(t) \neq S_{\text{esm}}(t) \quad \text{（假设发生过写操作）}
$$

这意味着对状态的任何修改操作都会导致两个实例 diverge。

### 25.2 检测 Dual Package Hazard

```typescript
// detect-dual-package.ts —— 检测库是否存在 Dual Package Hazard

import { createRequire } from 'node:module';

export async function detectDualPackageHazard(packageName: string): Promise<boolean> {
  // 同时通过 ESM 和 CJS 导入同一包
  const esmImport = await import(packageName);
  
  // @ts-ignore
  const require = createRequire(import.meta.url);
  const cjsRequire = require(packageName);
  
  // 检查是否共享同一引用
  if (esmImport === cjsRequire) {
    return false; // 共享同一实例，无 Hazard
  }
  
  // 检查关键导出是否为同一引用
  const esmDefault = esmImport.default ?? esmImport;
  const cjsDefault = cjsRequire.default ?? cjsRequire;
  
  if (esmDefault === cjsDefault) {
    return false; // default 导出共享
  }
  
  return true; // 可能存在 Dual Package Hazard
}
```

---

## 26. 更多实战代码示例

### 26.1 跨模块系统的日志库封装

```typescript
// logger.ts —— 在 ESM 和 CJS 中行为一致的日志库

export interface Logger {
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

class DefaultLogger implements Logger {
  private prefix: string;
  
  constructor(prefix: string = '[App]') {
    this.prefix = prefix;
  }
  
  info(message: string, ...args: unknown[]): void {
    console.log(`${this.prefix} INFO:`, message, ...args);
  }
  
  warn(message: string, ...args: unknown[]): void {
    console.warn(`${this.prefix} WARN:`, message, ...args);
  }
  
  error(message: string, ...args: unknown[]): void {
    console.error(`${this.prefix} ERROR:`, message, ...args);
  }
}

let globalLogger: Logger | null = null;

export function getLogger(prefix?: string): Logger {
  if (!globalLogger) {
    globalLogger = new DefaultLogger(prefix);
  }
  return globalLogger;
}

export function setLogger(logger: Logger): void {
  globalLogger = logger;
}

export default getLogger();
```

### 26.2 Node.js 22+ `require(esm)` 完整兼容性层

```typescript
// compat-loader.ts —— 兼容所有 Node.js 版本的 ESM 加载器

export interface LoadOptions {
  timeoutMs?: number;
  retryCount?: number;
}

export async function universalLoad<T>(
  modulePath: string,
  options: LoadOptions = {}
): Promise<T> {
  const { timeoutMs = 30000, retryCount = 0 } = options;
  
  const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
  
  // Node.js 22+ 尝试同步 require（仅适用于无 TLA 的 ESM）
  if (nodeMajor >= 22) {
    try {
      // @ts-ignore
      const mod = require(modulePath);
      return mod as T;
    } catch (err: any) {
      if (err.code !== 'ERR_REQUIRE_ASYNC_MODULE' && err.code !== 'ERR_REQUIRE_ESM') {
        throw err;
      }
      // 回退到动态导入
    }
  }
  
  // 动态导入（通用方案）
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      const mod = await import(modulePath);
      return (mod.default ?? mod) as T;
    } catch (err) {
      lastError = err as Error;
      if (attempt < retryCount) {
        await new Promise(r => setTimeout(r, 100 * (attempt + 1)));
      }
    }
  }
  
  throw lastError ?? new Error(`Failed to load module: ${modulePath}`);
}
```

### 26.3 运行时模块系统自适应工厂

```typescript
// adaptive-factory.ts —— 根据环境自动选择最优实现

export interface HashFunction {
  (data: string): string;
}

export async function createHasher(): Promise<HashFunction> {
  // ESM 环境优先使用原生 crypto
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    return async (data: string) => {
      const encoder = new TextEncoder();
      const hash = await crypto.subtle.digest('SHA-256', encoder.encode(data));
      return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    };
  }
  
  // Node.js 环境
  if (typeof process !== 'undefined' && process.versions?.node) {
    const { createHash } = await import('node:crypto');
    return (data: string) => createHash('sha256').update(data).digest('hex');
  }
  
  // 降级方案
  return (data: string) => `unhashed-${data}`;
}
```

---

## 27. 权威参考 (References)

| 来源 | 链接 | 相关章节 |
|------|------|---------|
| Node.js ESM Interop | [nodejs.org/api/esm.html](https://nodejs.org/api/esm.html) | Interoperability with CommonJS |
| Node.js Packages | [nodejs.org/api/packages.html](https://nodejs.org/api/packages.html) | Conditional Exports, Type Field |
| Node.js require(esm) | [nodejs.org/api/modules.html#requireid](https://nodejs.org/api/modules.html#requireid) | Node 22+ 同步加载 ESM |
| TypeScript Modules | [typescriptlang.org/docs/handbook/modules](https://www.typescriptlang.org/docs/handbook/modules) | Module Resolution |
| TypeScript esModuleInterop | [typescriptlang.org/tsconfig#esModuleInterop](https://www.typescriptlang.org/tsconfig#esModuleInterop) | 互操作编译选项 |
| TC39 ESM Spec | [tc39.es/ecma262/#sec-modules](https://tc39.es/ecma262/#sec-modules) | Module Semantics |
| Babel Plugin | [babeljs.io/docs/babel-plugin-transform-modules-commonjs](https://babeljs.io/docs/babel-plugin-transform-modules-commonjs) | __esModule |
| Vite Library Mode | [vitejs.dev/guide/build.html#library-mode](https://vitejs.dev/guide/build.html#library-mode) | 打包 ESM/CJS 双格式库 |
| Rollup Output Formats | [rollupjs.org/configuration-options/#output-format](https://rollupjs.org/configuration-options/#output-format) | cjs / es 输出配置 |
| webpack Module Federation | [webpack.js.org/concepts/module-federation](https://webpack.js.org/concepts/module-federation) | 跨构建运行时模块共享 |
| Node.js ERR_REQUIRE_ESM | [nodejs.org/api/errors.html#err_require_esm](https://nodejs.org/api/errors.html#err_require_esm) | 错误码说明 |
| Bun ESM & CJS | [bun.sh/docs/runtime/modules](https://bun.sh/docs/runtime/modules) | Bun 运行时模块系统 |
| Deno npm Compatibility | [docs.deno.com/runtime/fundamentals/node/](https://docs.deno.com/runtime/fundamentals/node/) | Deno 的 npm/CJS 兼容 |
| Sindre Sorhus: Pure ESM Package | [gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) | ESM 迁移权威指南 |

---

**参考规范**：Node.js ESM Interop | TypeScript Handbook: Module Resolution | ECMA-262 §16.2 | CommonJS Modules/1.1.1 | Node.js 22+ require(esm)
