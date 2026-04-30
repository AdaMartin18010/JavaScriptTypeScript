# ES2020 新特性

> **定位**：`20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/es2020`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块聚焦 ECMAScript 2020 标准新增的 7 项核心特性，解决 JavaScript 在空值处理、大整数、模块化动态加载等方面的表达能力不足。通过形式化示例展示语法特性在实际代码中的应用方式。

### 1.2 形式化基础

| 特性 | 规范章节 | 状态 |
|------|----------|------|
| 可选链 `?.` | ECMA-262 §13.3.9 | Stage 4 (ES2020) |
| 空值合并 `??` | ECMA-262 §13.12 | Stage 4 (ES2020) |
| 动态 `import()` | ECMA-262 §13.3.10 | Stage 4 (ES2020) |
| BigInt | ECMA-262 §6.1.6.2 | Stage 4 (ES2020) |
| `Promise.allSettled` | ECMA-262 §27.2.4.3 | Stage 4 (ES2020) |
| `globalThis` | ECMA-262 §19.1 | Stage 4 (ES2020) |
| `for-in` 枚举顺序 | ECMA-262 §14.7.5 | Stage 4 (ES2020) |

### 1.3 关键概念

| 特性 | 定义 | 关联 |
|------|------|------|
| 可选链 | 短路求值的属性访问运算符，避免深层空值检查 | 空值合并 |
| 空值合并 | 仅对 `null` 或 `undefined` 进行默认值回退 | 逻辑或 `\|\|` |
| BigInt | 任意精度整数类型，以 `n` 结尾 | Number 安全整数限制 |
| 动态导入 | 运行时异步加载模块，返回 Promise | 静态 `import` 声明 |

---

## 二、设计原理

### 2.1 为什么存在

ECMAScript 2020 针对开发者日常编码中的高频痛点进行填补：深层属性访问的空值防御（可选链）、零与假值的区分（空值合并）、金融与加密场景的整数溢出（BigInt）、代码分割与懒加载（动态 import）。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 原生新特性 | 代码简洁、语义清晰 | 需要 polyfill/转译 | 现代浏览器环境 |
| 传统兼容写法 | 全平台支持 | 代码冗长、易出错 | 遗留系统维护 |
| 工具库（Lodash） | 功能丰富 | 增加依赖体积 | 需要额外工具函数 |

### 2.3 与相关技术的对比

与 Babel 转译方案对比：原生支持减少运行时开销，但需要更长的兼容性等待期。动态 `import()` 与 Webpack `require.ensure` 对比：前者是语言标准，后者是打包工具特性。

---

## 三、实践映射

### 3.1 可选链与空值合并

```typescript
// 深层安全访问
const userCity = user?.address?.city ?? 'Unknown';

// 对比传统写法
const userCityLegacy = user && user.address && user.address.city ? user.address.city : 'Unknown';

// 函数调用可选链
const result = someObj.maybeFn?.(arg1, arg2);

// 表达式可选链
const firstItem = arr?.[0];
```

### 3.2 BigInt

```typescript
// 超过 Number.MAX_SAFE_INTEGER 的运算
const huge = 9007199254740993n;
const sum = huge + 1n; // 9007199254740994n

// 不能与 Number 混用
// huge + 1; // TypeError

// 比较可以混用
huge > 0; // true

// 序列化注意
JSON.stringify({ value: huge }); // { "value": "9007199254740993" }
```

### 3.3 动态 import

```typescript
// 条件懒加载
async function loadChartLibrary() {
  if (shouldUseCharts) {
    const { Chart } = await import('./chart-library.js');
    return new Chart(container);
  }
}

// 基于路径变量的动态导入（需打包工具支持）
async function loadLocale(locale: string) {
  const messages = await import(`./locales/${locale}.json`);
  return messages.default;
}
```

#### 进阶：动态导入的错误处理与预加载

```typescript
// 带错误边界和超时控制的动态导入
async function safeImport<T>(
  modulePath: string,
  options: { timeout?: number; fallback?: T } = {}
): Promise<T | undefined> {
  const { timeout = 5000, fallback } = options;

  try {
    const modulePromise = import(/* webpackChunkName: "[request]" */ modulePath);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Import timeout: ${modulePath}`)), timeout)
    );

    const module = await Promise.race([modulePromise, timeoutPromise]);
    return (module as { default: T }).default ?? (module as T);
  } catch (err) {
    console.error(`Failed to load module ${modulePath}:`, err);
    return fallback;
  }
}

// 预加载关键模块（不阻塞渲染）
function preloadModule(path: string): void {
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = path;
  document.head.appendChild(link);
}

// 使用
preloadModule('/chunks/admin-dashboard.js');
const AdminDashboard = await safeImport('/chunks/admin-dashboard.js');
```

### 3.4 Promise.allSettled

```typescript
const promises = [
  fetch('/api/users'),
  fetch('/api/orders'),
  fetch('/api/products'),
];

const results = await Promise.allSettled(promises);

const ok = results
  .filter((r): r is PromiseFulfilledResult<Response> => r.status === 'fulfilled')
  .map(r => r.value);

const failed = results
  .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
  .map(r => r.reason);
```

#### 进阶：Promise.allSettled 结果分类工具

```typescript
interface PartitionedResults<T> {
  fulfilled: T[];
  rejected: Error[];
}

function partitionSettled<T>(
  results: PromiseSettledResult<T>[]
): PartitionedResults<T> {
  return results.reduce<PartitionedResults<T>>(
    (acc, result) => {
      if (result.status === 'fulfilled') {
        acc.fulfilled.push(result.value);
      } else {
        acc.rejected.push(result.reason);
      }
      return acc;
    },
    { fulfilled: [], rejected: [] }
  );
}

// 实际应用：批量 API 调用，部分失败不影响整体
async function fetchUserData(userIds: string[]) {
  const promises = userIds.map(id =>
    fetch(`/api/users/${id}`).then(r => {
      if (!r.ok) throw new Error(`User ${id} not found`);
      return r.json();
    })
  );

  const { fulfilled, rejected } = partitionSettled(await Promise.allSettled(promises));

  console.warn(`${rejected.length} users failed to load`);
  return fulfilled;
}
```

### 3.5 globalThis

```typescript
// 跨环境全局对象访问
const root = globalThis;

// 浏览器: window
// Node.js: global
// Web Worker: self
// globalThis: 统一访问

if (globalThis.Buffer === undefined) {
  // 浏览器环境，可能需要 polyfill
}
```

#### 进阶：跨环境全局工具注册

```typescript
// lib/global-utils.ts
// 在浏览器、Node.js、Worker 中都能安全运行的工具函数

declare global {
  interface globalThis {
    __APP_VERSION__?: string;
    __BUILD_TIME__?: string;
  }
}

export function getGlobalConfig(): { version: string; buildTime: string } {
  return {
    version: globalThis.__APP_VERSION__ ?? 'dev',
    buildTime: globalThis.__BUILD_TIME__ ?? new Date().toISOString(),
  };
}

// 安全地检查当前运行时
export function getRuntime(): 'browser' | 'node' | 'worker' | 'unknown' {
  if (typeof window !== 'undefined') return 'browser';
  if (typeof process !== 'undefined' && process.versions?.node) return 'node';
  if (typeof self !== 'undefined' && typeof importScripts === 'function') return 'worker';
  return 'unknown';
}
```

### 3.6 String.prototype.matchAll

```typescript
// 提取正则所有匹配，包括捕获组
const text = 'Contact: alice@example.com, bob@test.org';
const emailRegex = /(\w+)@(\w+\.\w+)/g;

// ES2020 之前：需循环 exec，容易出错
// ES2020+：matchAll 返回迭代器
for (const match of text.matchAll(emailRegex)) {
  console.log(match[0]); // 完整匹配: alice@example.com
  console.log(match[1]); // 用户名: alice
  console.log(match[2]); // 域名: example.com
  console.log(match.index); // 匹配位置
}

// 转换为数组
const allEmails = Array.from(text.matchAll(emailRegex));
```

### 3.7 import.meta

```typescript
// 获取当前模块的元数据（ES 模块专用）
console.log(import.meta.url);      // file:///path/to/module.js 或 http://...
console.log(import.meta.resolve);  // 解析相对路径为绝对 URL

// 条件编译/环境检测
if (import.meta.env?.MODE === 'development') {
  console.log('Running in dev mode');
}

// Vite 中的典型用法
const imageUrl = new URL('./assets/logo.png', import.meta.url).href;
```

### 3.8 BigInt 在加密与金融场景

```typescript
// 场景 1：精确的金融计算（避免浮点数精度问题）
function calculateInterest(principal: bigint, ratePercent: bigint, periods: bigint): bigint {
  // 使用整数运算模拟百分比：(principal * rate) / 100
  return (principal * ratePercent) / 100n * periods;
}

const principal = 1000000000n; // 1亿，以最小货币单位计（如分）
const interest = calculateInterest(principal, 5n, 12n); // 年利率 5%，12 年
console.log(interest.toString()); // 精确结果

// 场景 2：64 位整数处理（如数据库 ID、雪花算法）
function parseSnowflake(id: string): { timestamp: bigint; workerId: bigint; sequence: bigint } {
  const bigintId = BigInt(id);
  return {
    timestamp: (bigintId >> 22n) + 1609459200000n,
    workerId: (bigintId >> 12n) & 0x3ffn,
    sequence: bigintId & 0xfffn,
  };
}

// 场景 3：BigInt 与 TypedArray 互操作
const buffer = new ArrayBuffer(8);
const view = new DataView(buffer);
view.setBigInt64(0, 9007199254740993n); // 写入 64 位大整数
const readBack = view.getBigInt64(0);   // 读取
console.log(readBack === 9007199254740993n); // true
```

### 3.9 常见误区

| 误区 | 正确理解 |
|------|---------|
| 新特性可以立即在生产环境使用 | 需评估目标运行时支持与转译成本 |
| 所有特性都向后兼容 | 部分特性需要 polyfill 或语法转换 |
| `??` 可以替代所有 `\|\|` | `??` 仅对 `null/undefined` 生效，`\|\|` 对 falsy 值生效 |
| BigInt 与 Number 可以互换 | 运算不能混用，需显式转换 |
| 动态 import 支持任意表达式 | 路径表达式受打包工具限制，不能完全动态 |

---

## 四、进阶代码示例

### 4.1 可选链的安全导航模式

```typescript
// 深层对象安全访问与默认值
const config = {
  server: {
    ports: [8080, 8081]
  }
};

const primaryPort = config?.server?.ports?.[0] ?? 3000;
const backupPort = config?.server?.ports?.[1] ?? primaryPort;

// 可选链与函数调用
const logger = {
  debug: (msg: string) => console.log(`[DEBUG] ${msg}`)
};
logger.debug?.('optional chaining works'); // 安全调用
```

### 4.2 结合 `??` 与 `||` 的精确默认值

```typescript
function createServer(options: { port?: number; host?: string; timeout?: number }) {
  // ?? 仅对 null/undefined 生效，适合数值 0 是合法值的情况
  const port = options.port ?? 8080;
  // || 对所有 falsy 值生效，适合字符串 "" 也应被替换的情况
  const host = options.host || 'localhost';
  const timeout = options.timeout ?? 5000;

  return { port, host, timeout };
}

console.log(createServer({ port: 0 }));       // { port: 0, host: 'localhost', timeout: 5000 }
console.log(createServer({ port: undefined })); // { port: 8080, ... }
```

### 4.3 动态 import 实现路由级代码分割

```typescript
// router.ts
const routes = {
  '/dashboard': () => import('./pages/Dashboard.js'),
  '/settings': () => import('./pages/Settings.js'),
  '/profile': () => import('./pages/Profile.js'),
};

async function navigate(path: string) {
  const loader = routes[path as keyof typeof routes];
  if (!loader) return null;

  const module = await loader();
  return module.default;
}
```

### 4.4 globalThis 跨环境存储

```typescript
// lib/storage.ts
const globalStore = (() => {
  const map = new Map<string, any>();
  return {
    get<T>(key: string): T | undefined {
      if (globalThis.__SHARED_STORE__) {
        return globalThis.__SHARED_STORE__.get(key);
      }
      return map.get(key);
    },
    set<T>(key: string, value: T) {
      if (!globalThis.__SHARED_STORE__) {
        globalThis.__SHARED_STORE__ = new Map();
      }
      globalThis.__SHARED_STORE__.set(key, value);
    }
  };
})();

declare global {
  var __SHARED_STORE__: Map<string, any> | undefined;
}
```

---

## 五、权威参考

- [ECMA-262 — 2020 Language Specification](https://262.ecma-international.org/11.0/) — 官方规范
- [MDN — Optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) — Mozilla 文档
- [MDN — Nullish coalescing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) — Mozilla 文档
- [MDN — BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) — Mozilla 文档
- [MDN — Dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) — Mozilla 文档
- [MDN — Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled) — Mozilla 文档
- [MDN — globalThis](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis) — Mozilla 文档
- [MDN — String.matchAll](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll) — Mozilla 文档
- [MDN — import.meta](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta) — Mozilla 文档
- [V8 Blog — ES2020 Features](https://v8.dev/features/tags/es2020) — V8 引擎实现解析
- [2ality — ES2020 Feature Overview](https://2ality.com/2019/12/ecmascript-2020.html) — Dr. Axel Rauschmayer 深度解析
- [TC39 Proposals](https://github.com/tc39/proposals) — ECMAScript 提案仓库
- [Can I Use — ES2020](https://caniuse.com/?search=es2020) — 浏览器兼容性矩阵
- [Core-JS Polyfills](https://github.com/zloirock/core-js) — ES2020+ polyfill 实现参考
- [MDN — DataView.setBigInt64](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setBigInt64) — TypedArray BigInt 互操作

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
