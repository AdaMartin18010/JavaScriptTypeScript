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

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| Import Attributes 等同于 Import Assertions | Assertions（旧提案）已废弃，Attributes 使用 `with` 关键字且语义不同 |
| `using` 是 TypeScript 独有 | 是 TC39 Stage 3 提案，TS 已提前实现；JS 引擎跟进中 |
| Float16Array 精度与 Float32 相同 | half-precision 仅 10 位尾数，精度远低于 Float32，仅用于特定图形/ML 场景 |

### 3.3 扩展阅读

- [TC39 Active Proposals](https://github.com/tc39/proposals/blob/main/README.md)
- [TC39 Finished Proposals](https://github.com/tc39/proposals/blob/main/finished-proposals.md)
- [MDN: Import Attributes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with)
- [TypeScript 5.2: Using Declarations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management)
- [V8 Blog](https://v8.dev/blog)
- [SpiderMonkey Development](https://spidermonkey.dev/)
- `30-knowledge-base/30.1-language-evolution`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
