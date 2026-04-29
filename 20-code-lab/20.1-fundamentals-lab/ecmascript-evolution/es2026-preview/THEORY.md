# ES2026 预览特性

> **定位**：`20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/es2026-preview`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块追踪 ES2026（ECMAScript 17）候选提案，涵盖当前 TC39 Stage 3 的 Import Attributes、RegExp.escape、`Error.isError`、Float16Array 等特性，为标准化前的技术预研提供参考。

### 1.2 形式化基础

Stage 3 门槛要求：规范文本完成、至少有 2 个兼容实现通过 Test262 测试套件、无重大设计变更预期。本模块所列特性均满足此门槛。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| Import Attributes | 模块导入时附带元数据（如 `type: 'json'`） | `import ... with { }` |
| Source Phase Imports | 在源码阶段而非实例化阶段导入模块 | `import source` |
| Float16Array | 16 位浮点 TypedArray（IEEE 754 half-precision） | WebGPU/ML 场景 |

---

## 二、设计原理

### 2.1 为什么存在

ES2026 候选特性解决了模块系统灵活性、错误类型安全、数值计算精度与正则表达式安全性的遗留缺口。提前理解这些提案有助于设计面向未来的架构。

### 2.2 Stage 追踪表（ES2026 周期）

| 提案 | Stage | 核心内容 | 主要推动方 |
|------|-------|---------|-----------|
| Import Attributes | 3 | `import ... with { type: 'json' }` | TC39 Module Harmony |
| Source Phase Imports | 3 | `import source mod from './mod.js'` | TC39 Module Harmony |
| RegExp.escape | 3 | `RegExp.escape(str)` 安全转义字面量 | TC39 |
| Error.isError | 3 | 跨 Realm 的可靠 `Error` 判断 | TC39 |
| Float16Array | 3 | 16-bit float TypedArray | WebGPU WG |
| Uint8Array Base64/Hex | 3 | `Uint8Array.fromBase64`, `toBase64` | TC39 |
| Explicit Resource Management | 3 | `using`/`await using` 块级资源释放 | TypeScript/TC39 |

### 2.3 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Import Attributes | 声明式模块元数据、安全 | 旧打包器需适配 | JSON/CSS 模块导入 |
| `RegExp.escape` | 防 ReDoS、用户输入安全 | 新增 API 学习成本 | 动态正则构造 |
| `using` 语句 | 块级自动释放、免 finally 样板 | 需转译/实验标志 | 文件句柄、锁管理 |

---

## 三、实践映射

### 3.1 从理论到代码

```js
// === Import Attributes（需实验标志或最新 Node）===
import config from './config.json' with { type: 'json' };
console.log(config.version);

// 动态导入同样支持
const data = await import('./data.json', { with: { type: 'json' } });

// === Source Phase Imports（Stage 3，工具链实验支持）===
// import source modSrc from './module.js';
// modSrc 是 ModuleSource 对象，可用于自定义加载器

// === RegExp.escape ===
const userInput = 'Price: $5.00 [VIP]';
const safe = RegExp.escape(userInput);
console.log(safe); // 'Price:\ \$5\.00\ \[VIP\]'
const re = new RegExp(safe);
re.test(userInput); // true

// === Error.isError ===
// 跨 iframe/Realm 时 instanceof 失效
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const ForeignError = iframe.contentWindow.Error;

const err = new ForeignError('oops');
err instanceof Error;       // false（跨 Realm）
Error.isError(err);         // true（可靠判断）

// === Explicit Resource Management（TypeScript 5.2+ 实验性支持）===
// 使用 Symbol.dispose / Symbol.asyncDispose
class TempFile {
  #handle;
  constructor(path) { this.#handle = fs.openSync(path, 'w'); }
  [Symbol.dispose]() { fs.closeSync(this.#handle); }
}

// 块退出时自动调用 dispose
{
  using file = new TempFile('/tmp/log.txt');
  fs.writeSync(file.handle, 'data');
} // <- file[Symbol.dispose]() 自动调用

// === Float16Array（Node.js 实验性 / 浏览器最新版）===
const f16 = new Float16Array([1.0, 2.5, 3.1]);
console.log(f16.BYTES_PER_ELEMENT); // 2
// WebGPU 中常用 half-precision 纹理数据
```

### 3.2 高级代码示例

#### Uint8Array Base64/Hex 编解码

```javascript
// binary-utils.js — Uint8Array 与 Base64/Hex 互转（ES2026 Stage 3）

// 编码：Uint8Array → Base64
const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
const base64 = bytes.toBase64();
console.log(base64); // "SGVsbG8="

// 支持 URL-safe base64
const urlSafe = bytes.toBase64({ alphabet: 'base64url' });
console.log(urlSafe); // "SGVsbG8"

// 解码：Base64 → Uint8Array
const decoded = Uint8Array.fromBase64(base64);
console.log(new TextDecoder().decode(decoded)); // "Hello"

// Hex 编解码
const hex = bytes.toHex();
console.log(hex); // "48656c6c6f"

const fromHex = Uint8Array.fromHex(hex);
console.log(fromHex); // Uint8Array [72, 101, 108, 108, 111]

// 流式处理大文件分块
async function hashLargeFile(fileStream) {
  const chunks = [];
  for await (const chunk of fileStream) {
    chunks.push(chunk.toBase64());
  }
  return chunks.join('');
}
```

#### `using` 与 `await using` 资源管理实战

```typescript
// resource-manager.ts
import { open, type FileHandle } from 'fs/promises';

// 同步 dispose 资源
class ScopedLock {
  #released = false;
  constructor(private key: string) {}
  [Symbol.dispose]() {
    if (!this.#released) {
      console.log(`Releasing lock: ${this.key}`);
      this.#released = true;
    }
  }
}

// 异步 dispose 资源
class AsyncDatabaseConnection {
  #handle: unknown;
  async connect() { /* ... */ return this; }
  [Symbol.asyncDispose] = async () => {
    console.log('Closing DB connection');
    // await this.#handle.close();
  };
}

// 同步 using 块
function processWithLock(data: string) {
  using lock = new ScopedLock('resource-1');
  // 模拟处理
  const result = data.toUpperCase();
  // lock 在此处自动释放，无需 finally
  return result;
}

// 异步 await using 块
async function queryDatabase(sql: string) {
  await using conn = await new AsyncDatabaseConnection().connect();
  // conn.query(sql) ...
  const result = { rows: [] };
  // conn 在块退出时自动异步关闭
  return result;
}

// 嵌套资源管理
function multiResourceOperation() {
  using lock1 = new ScopedLock('A');
  using lock2 = new ScopedLock('B');
  // 退出时按 LIFO 顺序释放：先 B 后 A
  return compute();
}
```

#### `RegExp.escape` 安全搜索高亮

```javascript
// search-highlighter.js
function highlightMatches(text, query) {
  // 安全转义用户输入，防止注入恶意正则
  const safeQuery = RegExp.escape(query);
  const re = new RegExp(`(${safeQuery})`, 'gi');
  return text.replace(re, '<mark>$1</mark>');
}

// 用户输入可能包含正则特殊字符
const userQuery = '(price) [VIP] $100';
const content = 'The (price) [VIP] $100 package includes premium support.';

console.log(highlightMatches(content, userQuery));
// The <mark>(price) [VIP] $100</mark> package includes premium support.

// 对比：未转义会导致错误
// new RegExp(userQuery); // SyntaxError: invalid quantifier
```

#### `Error.isError` 跨 Realm 异常处理

```javascript
// safe-error-handler.js
function normalizeError(maybeError) {
  if (Error.isError(maybeError)) {
    return {
      type: maybeError.constructor.name,
      message: maybeError.message,
      stack: maybeError.stack,
    };
  }
  if (maybeError instanceof Error) {
    // 同一 Realm 内 instanceof 仍然有效
    return { type: 'Error', message: maybeError.message };
  }
  return { type: 'unknown', message: String(maybeError) };
}

// 跨 iframe/Worker 场景
function handleWorkerError(worker) {
  worker.onmessage = ({ data }) => {
    if (data.error && Error.isError(data.error)) {
      // data.error 是从 Worker Realm 序列化过来的 Error 对象
      console.error('Worker failed:', data.error.message);
    }
  };
}

// 与 structured clone 配合使用
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const foreignErr = new iframe.contentWindow.TypeError('foreign');

console.log(foreignErr instanceof TypeError); // false
console.log(Error.isError(foreignErr));       // true
console.log(Object.prototype.toString.call(foreignErr) === '[object Error]'); // true，但不可靠
```

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| Import Attributes 等同于 Import Assertions | Assertions（旧提案）已废弃，Attributes 使用 `with` 关键字且语义不同 |
| `using` 是 TypeScript 独有 | 是 TC39 Stage 3 提案，TS 已提前实现；JS 引擎跟进中 |
| Float16Array 精度与 Float32 相同 | half-precision 仅 10 位尾数，精度远低于 Float32，仅用于特定图形/ML 场景 |

### 3.4 扩展阅读

- [TC39 Active Proposals](https://github.com/tc39/proposals/blob/main/README.md)
- [TC39 Finished Proposals](https://github.com/tc39/proposals/blob/main/finished-proposals.md)
- [MDN: Import Attributes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with)
- [TypeScript 5.2: Using Declarations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management)
- [MDN: Float16Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float16Array)
- [WebGPU — WGSL  half-precision types](https://www.w3.org/TR/webgpu/)
- [V8 Blog](https://v8.dev/blog)
- [SpiderMonkey Development](https://spidermonkey.dev/)
- [JavaScript Weekly — TC39 动态追踪](https://javascriptweekly.com/)
- [Test262 — ECMAScript 测试套件](https://github.com/tc39/test262)
- `30-knowledge-base/30.1-language-evolution`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
