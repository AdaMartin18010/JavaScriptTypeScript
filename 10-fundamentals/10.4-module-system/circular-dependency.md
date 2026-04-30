# 循环依赖：检测、分析与解决

> **定位**：`10-fundamentals/10.4-module-system/`
> **规范来源**：ECMA-262 §16.2.1 Module Semantics | CommonJS Module System

---

## 一、定义

**循环依赖（Circular Dependency）**：模块 A 依赖模块 B，模块 B（直接 or 间接）依赖模块 A，形成有向图中的环。

```
A.js ──→ B.js
  ↑         │
  └─────────┘
```

---

## 二、ESM 与 CJS 的循环依赖处理深度对比

| 维度 | ESM (ECMAScript Modules) | CJS (CommonJS) |
|------|-------------------------|----------------|
| **解析阶段** | 链接阶段（Linking）静态解析所有导入 | 运行时（Runtime）动态执行 `require()` |
| **绑定机制** | 实时绑定（Live Binding）—— 对导出引用的绑定 | 值拷贝（Value Copy）—— `module.exports` 的浅拷贝 |
| **未初始化访问** | TDZ（Temporal Dead Zone）→ `ReferenceError` | 返回 `{}` 或部分已执行导出（不完整状态） |
| **可预测性** | 高（静态分析可检测） | 低（运行时行为难以预测） |
| **检测工具** | ESLint `import/no-cycle`、Rollup 构建报错 | `madge --circular`、运行时日志 |
| **规范依据** | ECMA-262 §16.2.1.5.2 InnerModuleLinking | Node.js `module.js` 实现 |
| **解决策略** | 重构为无环图、动态 `import()` | 延迟 require / 事件总线 / DI |

---

## 三、代码示例：ESM vs CJS 循环依赖处理

```javascript
// ============================================
// ESM 循环依赖演示：TDZ 保护机制
// ============================================

// a.mjs
import { b } from './b.mjs';  // b 的绑定存在但可能未初始化（TDZ）
console.log('a.mjs executing, b =', b); // 若 b 未初始化 → ReferenceError (TDZ)
export const a = 'a-value';

// b.mjs
import { a } from './a.mjs';  // a 的绑定存在但可能未初始化
console.log('b.mjs executing, a =', a); // 若 a 未初始化 → ReferenceError (TDZ)
export const b = 'b-value';

// 运行：node a.mjs
// 输出顺序（取决于入口）：
// 1. 静态分析确定依赖图
// 2. 实例化阶段创建所有绑定（但值为 <uninitialized>）
// 3. 评估阶段按深度优先顺序执行模块体
// 4. 若 a.mjs 先执行，导入 b 时 b 尚未评估 → TDZ 错误

// ============================================
// ESM 安全模式：函数导出避免 TDZ
// ============================================

// safe-a.mjs
import { getB } from './safe-b.mjs';
export function getA() {
  // 函数体在调用时才执行，此时所有模块已评估完毕
  return 'a-value + ' + getB();
}

// safe-b.mjs
import { getA } from './safe-a.mjs';
export function getB() {
  return 'b-value + ' + getA();
}

// 虽然存在循环依赖，但函数体延迟执行，避免 TDZ
console.log(getA()); // 可能栈溢出（无限递归），但至少无 TDZ 错误

// ============================================
// ESM 重构模式：提取公共依赖打破循环
// ============================================

// types.mjs —— 共享类型/常量（无业务逻辑，无循环风险）
export const STATUS_PENDING = 'pending';
export const STATUS_DONE = 'done';

// user.mjs
import { STATUS_PENDING } from './types.mjs';
import { getOrder } from './order.mjs'; // 现在 order → user 不形成环
export class User {
  getStatus() { return STATUS_PENDING; }
}

// order.mjs
import { STATUS_DONE } from './types.mjs';
export function getOrder() { /* ... */ }

// ============================================
// CJS 循环依赖演示：不完整状态陷阱
// ============================================

// cjs-a.js
console.log('cjs-a start');
const b = require('./cjs-b.js');
console.log('cjs-a: b.bValue =', b.bValue); // undefined！b 尚未完成导出
console.log('cjs-a: b.partial =', b.partial); // 'partial-from-b'（部分可用）
module.exports.aValue = 'a-value';
console.log('cjs-a end');

// cjs-b.js
console.log('cjs-b start');
const a = require('./cjs-a.js');
console.log('cjs-b: a.aValue =', a.aValue); // undefined！a 尚未完成导出
module.exports.partial = 'partial-from-b';
console.log('cjs-b: about to export bValue');
module.exports.bValue = 'b-value';
console.log('cjs-b end');

// 运行：node cjs-a.js
// cjs-a start
// cjs-b start
// cjs-b: a.aValue = undefined
// cjs-b: about to export bValue
// cjs-b end
// cjs-a: b.bValue = undefined       ← 陷阱：b 在 bValue 导出前已返回
// cjs-a: b.partial = partial-from-b ← 部分导出可用
// cjs-a end

// ============================================
// CJS 延迟 require 缓解模式
// ============================================

// lazy-a.js
let bCache;
function getB() {
  if (!bCache) {
    bCache = require('./lazy-b.js'); // 延迟到首次调用时加载
  }
  return bCache;
}

module.exports = {
  doWork() {
    const b = getB();
    return 'a-work + ' + b.doWork();
  }
};

// lazy-b.js
let aCache;
function getA() {
  if (!aCache) {
    aCache = require('./lazy-a.js');
  }
  return aCache;
}

module.exports = {
  doWork() {
    // 避免在顶层 require，防止循环时获取空对象
    return 'b-work';
  }
};

// ============================================
// 混合模式：ESM 动态 import() 打破循环
// ============================================

// dynamic-a.mjs
export class ServiceA {
  constructor() {
    this.bPromise = null;
  }

  async getB() {
    if (!this.bPromise) {
      // 动态 import 不形成静态循环依赖
      this.bPromise = import('./dynamic-b.mjs');
    }
    const { ServiceB } = await this.bPromise;
    return new ServiceB();
  }

  async doWork() {
    const b = await this.getB();
    return 'A + ' + b.doWork();
  }
}

// dynamic-b.mjs
export class ServiceB {
  async getA() {
    const { ServiceA } = await import('./dynamic-a.mjs');
    return new ServiceA();
  }

  doWork() {
    return 'B';
  }
}
```

---

## 四、CJS 循环依赖的诊断与修复

### 4.1 诊断工具

```bash
# madge：循环依赖检测
npx madge --circular src/

# dependency-cruiser：依赖可视化
npx depcruise --config .dependency-cruiser.js src/

# 输出示例：
# src/models/user.js → src/services/order.js → src/models/user.js
```

### 4.2 修复策略

| 策略 | 方法 | 适用场景 |
|------|------|---------|
| **重构为无环** | 提取公共依赖到独立模块 | 架构级循环 |
| **延迟加载** | 将 require 移入函数内部 | 运行时循环 |
| **事件总线** | 用发布-订阅替代直接依赖 | 复杂交互 |
| **依赖注入** | 通过构造函数/配置传入依赖 | 测试友好型重构 |
| **动态 import** | ESM 中使用 `await import()` | 模块边界处 |

---

## 五、Monorepo 中的循环依赖

Monorepo 中循环依赖的破坏性更大：

```
@org/users ──→ @org/orders
     ↑              │
     └──────────────┘
```

**类型系统检测**：TypeScript Project References 在编译期即可检测包级循环依赖。

```json
// tsconfig.json —— 若 @org/users 引用 @org/orders，
// 同时 @org/orders 的 references 包含 @org/users，
// tsc --build 将报错
{
  "references": [
    { "path": "../orders" }
  ]
}
```

---

## 六、进阶：真实场景中的循环依赖案例

### 6.1 Express 路由文件循环

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();
const orderRoutes = require('./orders'); // 循环风险点

router.get('/:id/orders', (req, res) => {
  // 使用 orderRoutes 中的逻辑
});

module.exports = router;

// routes/orders.js
const express = require('express');
const router = express.Router();
const userRoutes = require('./users'); // ← 循环依赖！

router.get('/:id/user', (req, res) => {
  // 使用 userRoutes 中的逻辑
});

module.exports = router;
```

**修复**：提取共享服务层，路由仅依赖服务，不互相依赖。

```javascript
// services/userService.js
exports.getUserById = async (id) => { /* ... */ };

// services/orderService.js
exports.getOrderById = async (id) => { /* ... */ };

// routes/users.js —— 仅依赖 service，不依赖其他 route
const { getOrderById } = require('../services/orderService');
```

### 6.2 前端 Store/Model 循环（Redux Ducks 模式）

```javascript
// store/usersSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchOrders } from './ordersSlice'; // ← 循环

const usersSlice = createSlice({ /* ... */ });
export const { actions } = usersSlice;

// store/ordersSlice.js
import { setCurrentUser } from './usersSlice'; // ← 循环

const ordersSlice = createSlice({ /* ... */ });
```

**修复**：引入事件总线或中介层（middleware/thunk）。

```javascript
// store/middlewares/crossSliceMiddleware.js
export const crossSliceMiddleware = (store) => (next) => (action) => {
  if (action.type === 'users/setCurrentUser') {
    store.dispatch({ type: 'orders/invalidateCache' });
  }
  return next(action);
};
```

---

## 七、Webpack / Rollup 构建时循环检测

```javascript
// webpack.config.js
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = {
  plugins: [
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      include: /src/,
      failOnError: true,
      allowAsyncCycles: false,
      cwd: process.cwd(),
      onDetected({ module: webpackModuleRecord, paths, compilation }) {
        compilation.warnings.push(new Error(paths.join(' -> ')));
      },
    }),
  ],
};
```

```javascript
// rollup.config.js —— Rollup 原生在 ESM 循环时报错
// 若检测到循环依赖，Rollup 会输出：
// Error: Circular dependency: src/a.js -> src/b.js -> src/a.js
```

---

## 权威参考链接

| 资源 | 说明 | 链接 |
|------|------|------|
| **ECMA-262 §16.2.1** | ESM 模块语义规范 | [tc39.es/ecma262/#sec-modules](https://tc39.es/ecma262/#sec-modules) |
| **Node.js Modules: CJS Cycles** | Node.js 官方循环依赖文档 | [nodejs.org/api/modules.html#modules_cycles](https://nodejs.org/api/modules.html#modules_cycles) |
| **Node.js ESM Interop** | Node.js ESM 与 CJS 互操作详解 | [nodejs.org/api/esm.html#interoperability-with-commonjs](https://nodejs.org/api/esm.html#interoperability-with-commonjs) |
| **madge** | 循环依赖检测 CLI | [github.com/pahen/madge](https://github.com/pahen/madge) |
| **dependency-cruiser** | 依赖图可视化与分析 | [github.com/sverweij/dependency-cruiser](https://github.com/sverweij/dependency-cruiser) |
| **ESLint: import/no-cycle** | 静态循环依赖检测规则 | [github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-cycle.md](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-cycle.md) |
| **Webpack: Circular Dependency Plugin** | 构建时循环检测 | [github.com/aackerman/circular-dependency-plugin](https://github.com/aackerman/circular-dependency-plugin) |
| **JavaScript Modules: A Beginner's Guide** | MDN ESM 基础教程 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) |
| **Rollup: Circular Dependencies** | Rollup 对循环依赖的处理 | [rollupjs.org/troubleshooting/#warning-circular-dependencies](https://rollupjs.org/troubleshooting/#warning-circular-dependencies) |
| **TypeScript Project References** | 编译期包级循环检测 | [typescriptlang.org/docs/handbook/project-references.html](https://www.typescriptlang.org/docs/handbook/project-references.html) |
| **Vite: Dependency Pre-Bundling** | Vite 预打包与循环依赖 | [vitejs.dev/guide/dep-pre-bundling.html](https://vitejs.dev/guide/dep-pre-bundling.html) |
| **2ality — ESM vs CJS** | Dr. Axel Rauschmayer 深度解析 | [2ality.com/2019/04/eval-via-import.html](https://2ality.com/2019/04/eval-via-import.html) |

---

*本文件为模块系统专题的循环依赖专项分析，已增强 ESM/CJS 对比与完整代码示例。*
