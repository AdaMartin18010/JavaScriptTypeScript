# ESM/CJS 互操作与模块加载语义

> **定位**：`10-fundamentals/10.4-module-system/` — L1 语言核心层：模块系统专题
> **关联**：`jsts-code-lab/12-package-management/` | `docs/guides/module-system-guide.md`
> **规范来源**：ECMA-262 §16.2 Modules | Node.js ESM Docs | TypeScript Module Resolution

---

## 一、核心命题

JavaScript 的模块系统在 2026 年仍处于 **ESM (ECMAScript Modules)** 与 **CJS (CommonJS)** 的双轨制状态。理解两者的互操作机制，是掌握现代 JS/TS 工程的核心前提。

---

## 二、公理化基础

### 公理 1（静态性公理）

ESM 的导入绑定在**解析阶段**即已确定，模块依赖图在代码执行前完全可构建。

### 公理 2（动态性公理）

CJS 的 `require()` 在**执行阶段**动态解析，模块图在运行时才能完整确定。

### 公理 3（互操作公理）

Node.js 作为宿主环境，通过**规范转换层**将 CJS 模块包装为 ESM 兼容的命名空间对象，实现双轨互通。

---

## 三、ESM 加载语义的形式化

### 3.1 模块记录（Module Record）

ECMA-262 定义了抽象的 **Source Text Module Record**，其关键字段：

| 字段 | 类型 | 语义 |
|------|------|------|
| `[[ECMAScriptCode]]` | Parse Node | 模块的 AST |
| `[[ImportEntries]]` | List | 静态导入条目 |
| `[[LocalExportEntries]]` | List | 本地导出条目 |
| `[[StarExportEntries]]` | List | `export *` 条目 |

### 3.2 加载算法

```
1. 解析模块说明符
2. 获取模块源码
3. 创建模块记录
4. 构建依赖图（Link）
5. 执行模块（Evaluate：DFS 拓扑排序）
```

### 3.3 Node.js 模块解析策略

| 策略 | 配置 | 说明 |
|------|------|------|
| CommonJS 解析 | 无 `"type": "module"` | `require()` 使用 CJS 算法 |
| ESM 解析 | `"type": "module"` 或 `.mjs` | `import` 使用 ESM 算法 |
| TS 解析 | `tsconfig.json` | `--module nodenext` / `--module bundler` |

---

## 四、ESM ↔ CJS 互操作矩阵

### 4.1 CJS 导入 ESM

| 场景 | 支持状态 | 限制 |
|------|---------|------|
| `require('./esm.mjs')` | v22+ | 同步加载，顶层 await 阻塞 |
| `require('esm-package')` | v22+ | 包需定义 `exports` |
| 动态 `import()` | 所有版本 | 返回 Promise，异步加载 |

**CJS 中使用动态 `import()`：**

```javascript
// utils.cjs
async function loadFormatter() {
  // ESM-only 包（如 chalk 5+、ora 7+）必须通过动态 import 加载
  const { default: chalk } = await import('chalk');
  return (text) => chalk.green(text);
}

module.exports = { loadFormatter };
```

**Node.js 22+ `require(esm)` 同步加载行为：**

```javascript
// Node.js 22 起，require() 可直接加载 ESM 模块（实验性/稳定中）
// 但若 ESM 模块包含顶层 await，require() 会抛出 ERR_REQUIRE_ASYNC_MODULE

try {
  const esmMod = require('./esm-module.mjs');
  console.log(esmMod.default);
} catch (err) {
  if (err.code === 'ERR_REQUIRE_ASYNC_MODULE') {
    // 回退到动态 import
    const esmMod = await import('./esm-module.mjs');
    console.log(esmMod.default);
  }
}
```

### 4.2 ESM 导入 CJS

**互操作规则表**：

| CJS 导出形式 | ESM 默认导入 | ESM 命名导入 | 说明 |
|-------------|-------------|-------------|------|
| `module.exports = x` | `import x from '...'` | 无命名导入 | `default` 绑定到 `x` |
| `exports.foo = x` | `import mod from '...'` | `import { foo }` | `mod.foo` 或解构 |
| `exports.__esModule = true` | 按 Babel 兼容处理 | 可能提升命名导出 | 互操作暗语 |

**实际互操作示例：**

```javascript
// cjs-lib.cjs
module.exports = function add(a, b) { return a + b; };
module.exports.subtract = (a, b) => a - b;
module.exports.PI = 3.14159;
```

```typescript
// consumer.mjs
import add, { subtract, PI } from './cjs-lib.cjs';

console.log(add(2, 3));           // 5
console.log(subtract(5, 2));      // 3
console.log(PI);                  // 3.14159
```

**TypeScript `esModuleInterop` 下的命名空间导入：**

```typescript
// tsconfig.json: "esModuleInterop": true, "moduleResolution": "nodenext"
import * as lib from './cjs-lib.cjs';

// lib 同时具有命名空间属性和 callable default
lib.default(2, 3);   // 5
lib.subtract(5, 2);  // 3
```

**ESM 中使用 `createRequire` 读取 CJS 元数据：**

```typescript
// esm-consumer.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

// 读取 CJS 包的 package.json（不加载主入口）
const pkg = require('lodash/package.json');
console.log(pkg.version);

// 同步 require CJS 模块
const cjsUtil = require('./legacy-util.cjs');
```

---

## 五、双模式库发布（Dual Package）

现代 npm 库需要同时支持 ESM 和 CJS。推荐配置：

```json
{
  "name": "my-lib",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    "./package.json": "./package.json"
  },
  "files": ["dist"]
}
```

**条件导出的 TypeScript 构建脚本（tsup）：**

```json
{
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts --clean"
  }
}
```

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
```

---

## 六、循环依赖（Circular Dependencies）

### 6.1 ESM 中的循环依赖

ESM 通过**TDZ（Temporal Dead Zone）** 保护未初始化绑定，避免访问 `undefined`。

**定理（ESM 循环依赖安全定理）**：ESM 的循环依赖在链接阶段即可检测，未初始化绑定通过 TDZ 保护。

```javascript
// a.mjs
import { b } from './b.mjs';
export const a = 'a-value';
console.log('In a.mjs, b =', b); // ✅ 'b-value'
```

```javascript
// b.mjs
import { a } from './a.mjs';
export const b = 'b-value';
console.log('In b.mjs, a =', a); // ✅ 'a-value'
```

**TDZ 保护示例（访问未初始化绑定会抛出 ReferenceError）：**

```javascript
// first.mjs
import { second } from './second.mjs';
export const first = `first sees: ${second}`;

// second.mjs
import { first } from './first.mjs';
// 此时 first 尚未初始化，处于 TDZ
export const second = `second sees: ${first}`; // ❌ ReferenceError: Cannot access 'first' before initialization
```

### 6.2 CJS 中的循环依赖

CJS 的循环依赖更隐蔽，可能返回**不完整的模块导出**（`{}`）。

```javascript
// first.cjs
const second = require('./second.cjs');
module.exports.first = `first sees: ${second.second}`;

// second.cjs
const first = require('./first.cjs');
// first 此时是 {}（空对象占位符）
module.exports.second = `second sees: ${first.first}`; // "second sees: undefined"
```

**解决 CJS 循环依赖的模式：**

```javascript
// first.cjs
module.exports = { getFirst };

const second = require('./second.cjs');

function getFirst() {
  return `first sees: ${second.getSecond()}`;
}
```

```javascript
// second.cjs
module.exports = { getSecond };

const first = require('./first.cjs');

function getSecond() {
  return `second sees: ${first.getFirst ? first.getFirst() : 'not ready'}`;
}
```

---

## 七、Import Attributes 与 Defer

### 7.1 Import Attributes（ES2025）

```javascript
import json from './data.json' with { type: 'json' };

// TypeScript 5.3+ 支持
import type { Config } from './config.json' with { type: 'json' };
const config: Config = (await import('./config.json', { with: { type: 'json' } })).default;
```

### 7.2 Import Defer（Stage 3）

```javascript
import defer * as heavy from './heavy-module.js';

// heavy 模块延迟加载，首次访问属性时触发实际加载
const result = heavy.compute(); // 此时才真正执行 heavy-module.js
```

---

## 八、TypeScript 模块解析配置

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  }
}
```

**`moduleResolution` 策略对比：**

| 策略 | 适用场景 | ESM 文件扩展名 | 条件导出 |
|------|---------|---------------|---------|
| `node` | CJS 项目（ legacy ） | 不强制 `.js` | 部分支持 |
| `nodenext` | ESM / 混合项目 | 强制 `.js` | 完整支持 |
| `bundler` | Vite / Webpack 项目 | 可省略扩展名 | 完整支持 |

---

## 九、决策树：何时用 ESM，何时用 CJS

```
项目类型分析
├── 新项目（Greenfield）
│   └── → 全部使用 ESM
├── 库（Library）
│   └── → 双模式发布（ESM + CJS 回退）
├── 遗留项目（Legacy）
│   └── → 渐进迁移（.mjs / 动态 import()）
└── TypeScript 项目
    └── → "module": "nodenext" 或 "bundler"
```

---

## 十、进阶互操作示例

### 10.1 检测当前模块系统

```javascript
// detect-module.cjs / detect-module.mjs
export function detectModuleSystem() {
  try {
    // 仅在 ESM 中可用
    return typeof import.meta.url === 'string' ? 'esm' : 'unknown';
  } catch {
    // 在 CJS 中 import.meta 会抛出 SyntaxError
    return typeof module !== 'undefined' && module.exports ? 'cjs' : 'unknown';
  }
}
```

### 10.2 跨模块系统的版本兼容入口

```javascript
// index.js —— 运行时判断模块系统
if (typeof module !== 'undefined' && module.exports) {
  // CJS 环境
  module.exports = require('./dist/index.cjs');
} else {
  // ESM 环境（由打包工具或运行时处理）
  export * from './dist/index.mjs';
}
```

### 10.3 `require(esm)` 边缘案例（Node.js 22+）

```javascript
// esm-with-tla.mjs
export const value = await Promise.resolve(42);

// cjs-consumer.js
try {
  const mod = require('./esm-with-tla.mjs');
} catch (err) {
  console.log(err.code); // 'ERR_REQUIRE_ASYNC_MODULE'
  // 必须使用动态 import
  const mod = await import('./esm-with-tla.mjs');
}
```

---

## 十一、权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| ECMA-262 §16.2 Modules | <https://tc39.es/ecma262/#sec-modules> | ECMAScript 模块规范原文 |
| Node.js ESM Documentation | <https://nodejs.org/api/esm.html> | Node.js 官方 ESM 文档 |
| Node.js Packages Documentation | <https://nodejs.org/api/packages.html> | 条件导出、双模式包规范 |
| Node.js CJS ↔ ESM Interop | <https://nodejs.org/api/esm.html#interoperability-with-commonjs> | 官方互操作详解 |
| Node.js `require(esm)` | <https://nodejs.org/api/modules.html#requireid> | Node 22+ 同步加载 ESM |
| TypeScript Module Resolution | <https://www.typescriptlang.org/docs/handbook/modules/reference.html> | TS 模块解析参考手册 |
| TypeScript `moduleResolution` | <https://www.typescriptlang.org/tsconfig#moduleResolution> | bundler / nodenext 配置说明 |
| Import Attributes Proposal | <https://github.com/tc39/proposal-import-attributes> | TC39 Stage 3 提案 |
| Import Defer Proposal | <https://github.com/tc39/proposal-defer-import-eval/> | TC39 Stage 3 延迟导入提案 |
| tsup — TypeScript Bundler | <https://tsup.egoist.dev/> | 零配置双模式构建工具 |
| Rollup Guide | <https://rollupjs.org/guide/en/> | ESM-first 打包器文档 |
| Bun ESM & CJS | <https://bun.sh/docs/runtime/modules> | Bun 运行时模块系统 |
| Deno Modules | <https://docs.deno.com/runtime/fundamentals/modules/> | Deno 模块与 npm 兼容 |
| Sindre Sorhus: Pure ESM Package | <https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c> | ESM 迁移权威指南 |
| 2ality — ESM in depth | <https://2ality.com/2014/09/es6-modules-final.html> | Dr. Axel 深度解析 |
| Webpack Module Federation | <https://webpack.js.org/concepts/module-federation/> | 微前端模块共享 |

---

*本文件为 L1 模块系统专题的首篇，后续将补充 `import-attributes-defer.md` 与 `circular-dependency.md`。*
