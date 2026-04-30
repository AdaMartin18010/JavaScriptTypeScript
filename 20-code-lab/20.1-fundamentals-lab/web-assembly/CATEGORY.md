---
dimension: 性能与底层
sub-dimension: WebAssembly
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「性能与底层」** 维度，聚焦 WebAssembly 核心概念与工程实践。

## 包含内容

- Wasm 模块编译、宿主交互、性能临界路径、多语言集成。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHIVED.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 index.ts
- 📁 wasm-component-model
- 📄 wasm-component-model.ts
- 📄 wasm-integration.test.ts
- 📄 wasm-integration.ts

## 子模块速查

| 子模块 | 说明 | 入口文件 |
|--------|------|----------|
| wasm-component-model | WebAssembly Component Model 与 WIT 接口定义 | `wasm-component-model.ts` |
| wasm-integration | JS 与 Wasm 模块的宿主交互与内存共享 | `wasm-integration.ts` |

## 运行时对比

| 运行时 | 语言 | 适用场景 | JIT / AOT | 模块系统 | 代表项目 |
|--------|------|----------|-----------|----------|----------|
| V8 (浏览器) | C++ | 浏览器内嵌 Wasm | Liftoff → TurboFan | MVP + 提案 | Chrome, Edge, Node.js |
| Wasmtime | Rust | 服务端 / 边缘 / CLI | Cranelift | Component Model | Bytecode Alliance |
| Wasm3 | C | 嵌入式 / IoT | 解释执行 | MVP | Arduino, ESP32 |
| WAMR | C | 轻量级嵌入式 | LLVM AOT / 解释 | MVP + 线程 | Intel, Zephyr RTOS |
| JCO | JavaScript | Node.js / 浏览器垫片 | N/A | Component Model | Bytecode Alliance |

## 代码示例

以下展示在 TypeScript 中加载并实例化一个 Wasm 模块，并调用其导出的加法函数：

```typescript
// wasm-integration.ts
async function loadWasm(url: string) {
  const response = await fetch(url);
  const bytes = await response.arrayBuffer();
  const module = await WebAssembly.compile(bytes);
  const instance = await WebAssembly.instantiate(module, {
    env: {
      memory: new WebAssembly.Memory({ initial: 10, maximum: 100 }),
      abort: () => { throw new Error('Wasm abort'); },
    },
  });
  return instance.exports;
}

// 使用
const exports = await loadWasm('./math.wasm') as { add: (a: number, b: number) => number };
console.log(exports.add(2, 3)); // 5
```

#### 共享内存与 TypedArray 交互

当 Wasm 模块需要处理大型二进制数据（如图像、音频）时，通过共享 `WebAssembly.Memory` 避免复制开销：

```typescript
// wasm-memory-share.ts
const memory = new WebAssembly.Memory({ initial: 1, maximum: 10, shared: true });
const wasmBuffer = new Uint8Array(memory.buffer);

// 假设 Wasm 导出了 process_image(offset: number, len: number): number
const exports = await loadWasmWithMemory('./image.wasm', memory);
const input = new Uint8Array([0x89, 0x50, 0x4e, 0x47]); // PNG header
wasmBuffer.set(input, 0);
const resultPtr = (exports.process_image as (o: number, l: number) => number)(0, input.length);
```

#### 流式编译与实例化（优化首屏）

浏览器支持在下载过程中即时编译 Wasm 字节码，减少总加载时间：

```typescript
// wasm-streaming.ts
async function loadWasmStreaming(url: string) {
  const response = await fetch(url);
  // 边下载边编译，无需等待完整 ArrayBuffer
  const module = await WebAssembly.compileStreaming(response);
  const instance = await WebAssembly.instantiate(module, importObject);
  return instance.exports;
}
```

#### 多内存与 SIMD（Wasm 提案特性）

```typescript
// wasm-advanced-features.ts
// 检测环境支持
function checkWasmFeatures(): Record<string, boolean> {
  return {
    bulkMemory: WebAssembly.validate(new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00])),
    simd: typeof WebAssembly.validate === 'function' && WebAssembly.validate(
      new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
        0x01, 0x05, 0x01, 0x60, 0x01, 0x7f, 0x01, 0x7f,
        0x03, 0x02, 0x01, 0x00, 0x07, 0x07, 0x01, 0x03,
        0x61, 0x64, 0x64, 0x00, 0x00, 0x0a, 0x0a, 0x01,
        0x08, 0x00, 0x20, 0x00, 0x20, 0x00, 0xfd, 0x0f,
        0x1a, 0x0b,
      ])
    ),
    threads: typeof SharedArrayBuffer !== 'undefined',
    referenceTypes: false, // 需运行时检测
  };
}
```

#### WASI 预览与 Node.js 集成

```typescript
// wasi-node.ts
import { WASI } from 'wasi';
import { argv, env } from 'node:process';
import { readFile } from 'node:fs/promises';

async function runWasiModule(wasmPath: string) {
  const wasi = new WASI({
    version: 'preview1',
    args: argv,
    env,
    preopens: { '/sandbox': '/some/real/path' },
  });

  const wasm = await WebAssembly.compile(await readFile(wasmPath));
  const instance = await WebAssembly.instantiate(wasm, {
    wasi_snapshot_preview1: wasi.wasiImport,
  });

  wasi.start(instance);
}
```

#### WebAssembly Component Model（WIT 接口）

```wit
// calculator.wit
package example:calculator;

interface ops {
  enum op { add, sub, mul, div }
  eval: func(a: float64, b: float64, op: op) -> result<float64, string>;
}

world calculator {
  export ops;
}
```

```typescript
// jco-bindings.ts
// 使用 @bytecodealliance/jco 生成 TypeScript 绑定
import { ops } from './calculator.js';

const result = ops.eval(10, 5, 'add');
if (result.tag === 'ok') {
  console.log(result.val); // 15
} else {
  console.error(result.err);
}
```

#### AssemblyScript — TypeScript 子集编译到 Wasm

```typescript
// assembly/index.ts（AssemblyScript 语法，近似 TypeScript）
export function fib(n: i32): i32 {
  if (n <= 1) return n;
  let a: i32 = 0, b: i32 = 1;
  for (let i: i32 = 2; i <= n; i++) {
    const t = a + b;
    a = b;
    b = t;
  }
  return b;
}

// 宿主 JavaScript 加载
const wasmModule = await WebAssembly.instantiateStreaming(
  fetch('./build/release.wasm')
);
console.log(wasmModule.exports.fib(40)); // 102334155
```

#### Wasm 内存动态增长监控

```typescript
// wasm-memory-growth.ts
function trackMemoryGrowth(instance: WebAssembly.Instance) {
  const memory = instance.exports.memory as WebAssembly.Memory;
  const initialPages = memory.buffer.byteLength / (64 * 1024);

  return new Proxy(memory, {
    get(target, prop) {
      if (prop === 'grow') {
        return (delta: number) => {
          const before = target.buffer.byteLength;
          const result = target.grow(delta);
          const after = target.buffer.byteLength;
          console.log(`Memory grew: ${before} → ${after} bytes (pages: ${result})`);
          return result;
        };
      }
      return (target as any)[prop];
    },
  });
}
```

#### Rust wasm-bindgen 双向互操作

```rust
// src/lib.rs (Rust)
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[wasm_bindgen]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

#[wasm_bindgen]
impl Point {
    pub fn distance(&self, other: &Point) -> f64 {
        ((self.x - other.x).powi(2) + (self.y - other.y).powi(2)).sqrt()
    }
}
```

```typescript
// 宿主 TypeScript 调用 Rust 导出
import init, { greet, Point } from './pkg/rust_wasm.js';

await init();
console.log(greet('WebAssembly')); // "Hello, WebAssembly!"

const p1 = new Point(0, 0);
const p2 = new Point(3, 4);
console.log(p1.distance(p2)); // 5
```

#### Wasm 异常处理与陷阱捕获

```typescript
// wasm-error-handling.ts
async function safeWasmCall<T>(fn: () => T): Promise<{ ok: true; value: T } | { ok: false; error: WebAssembly.RuntimeError }> {
  try {
    return { ok: true, value: fn() };
  } catch (err) {
    if (err instanceof WebAssembly.RuntimeError) {
      console.error('Wasm runtime error:', err.message);
      return { ok: false, error: err };
    }
    throw err;
  }
}

// 使用
const result = await safeWasmCall(() => exports.divide(10, 0));
if (!result.ok) {
  // 处理除零陷阱
  console.error('Division by zero in Wasm module');
}
```

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/WebAssembly) |
| WebAssembly.org | 规范 | [webassembly.org](https://webassembly.org/) |
| W3C Wasm WG | 标准 | [w3.org/wasm](https://www.w3.org/wasm/) |
| Bytecode Alliance | 组件模型 | [bytecodealliance.org](https://bytecodealliance.org/) |
| web.dev — Wasm performance | 指南 | [web.dev/tags/webassembly/](https://web.dev/tags/webassembly/) |
| WebAssembly Component Model | 规范 | [component-model.bytecodealliance.org](https://component-model.bytecodealliance.org/) |
| Wasmtime Docs | 文档 | [docs.wasmtime.dev](https://docs.wasmtime.dev/) |
| WebAssembly JavaScript Interface | W3C 推荐标准 | [www.w3.org/TR/wasm-js-api-2/](https://www.w3.org/TR/wasm-js-api-2/) |
| WebAssembly Core Specification | W3C 核心规范 | [www.w3.org/TR/wasm-core-2/](https://www.w3.org/TR/wasm-core-2/) |
| AssemblyScript | TypeScript-to-Wasm 编译器 | [www.assemblyscript.org](https://www.assemblyscript.org/) |
| Rust and WebAssembly Book | 教程 | [rustwasm.github.io/docs/book/](https://rustwasm.github.io/docs/book/) |
| wasm-bindgen | Rust/JS 交互工具 | [rustwasm.github.io/wasm-bindgen/](https://rustwasm.github.io/wasm-bindgen/) |
| JCO (JavaScript Component Toolkit) | 组件模型工具链 | [github.com/bytecodealliance/jco](https://github.com/bytecodealliance/jco) |
| WASI Preview 2 | 标准文档 | [github.com/WebAssembly/WASI](https://github.com/WebAssembly/WASI) |
| Wasm GC Proposal | 提案文档 | [github.com/WebAssembly/gc](https://github.com/WebAssembly/gc) |
| Wasm SIMD Proposal | 提案文档 | [github.com/WebAssembly/simd](https://github.com/WebAssembly/simd) |
| WebAssembly Weekly | 社区周报 | [wasmweekly.news](https://wasmweekly.news/) |
| Figma — WebAssembly Cut File Load Time by 3x | 工程案例 | [figma.com/blog/webassembly-cut-figmas-load-time-by-3x](https://www.figma.com/blog/webassembly-cut-figmas-load-time-by-3x/) |
| WebAssembly System Interface (WASI) | W3C 文档 | [wasi.dev](https://wasi.dev/) |
| wasm-pack | Rust/Wasm 构建工具 | [rustwasm.github.io/wasm-pack/](https://rustwasm.github.io/wasm-pack/) |
| Emscripten | C/C++ 到 Wasm 编译器 | [emscripten.org](https://emscripten.org/) |
| WABT (WebAssembly Binary Toolkit) | 二进制工具 | [github.com/WebAssembly/wabt](https://github.com/WebAssembly/wabt) |
| WebAssembly Micro Runtime (WAMR) | 文档 | [github.com/bytecodealliance/wasm-micro-runtime](https://github.com/bytecodealliance/wasm-micro-runtime) |
| Google — WebAssembly for Web Developers | 指南 | [developers.google.com/web/updates/2018/03/wasm](https://developers.google.com/web/updates/2018/03/wasm) |

#### WebAssembly.Table 与动态链接

```typescript
// wasm-table.ts — 使用 Table 实现函数指针动态分发
const table = new WebAssembly.Table({ initial: 2, element: 'anyfunc' });

const importObject = {
  js: {
    table,
    log: (x: number) => console.log(x),
  },
};

const wasm = await WebAssembly.instantiateStreaming(fetch('./table.wasm'), importObject);

// Wasm 模块可以通过索引调用 table 中的函数
(table as any).set(0, wasm.exports.add);
(table as any).set(1, wasm.exports.sub);
```

#### 多线程 Wasm：SharedArrayBuffer + Atomics

```typescript
// worker.ts — 在 Worker 中与 Wasm 共享内存
const memory = new WebAssembly.Memory({ initial: 1, maximum: 4, shared: true });
const wasmModule = await WebAssembly.compileStreaming(fetch('./multithread.wasm'));
const instance = await WebAssembly.instantiate(wasmModule, { env: { memory } });

// 主线程与 Worker 通过 Atomics 协作
Atomics.store(new Int32Array(memory.buffer), 0, 42);
Atomics.notify(new Int32Array(memory.buffer), 0, 1);
```

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 新增权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN — WebAssembly.Memory | 文档 | [developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Memory](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Memory) |
| MDN — WebAssembly.Table | 文档 | [developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Table](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Table) |
| MDN — SharedArrayBuffer | 文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) |
| WebAssembly Threads Proposal | 提案 | [github.com/WebAssembly/threads](https://github.com/WebAssembly/threads) |
| Wasmtime TypeScript Embedding | 文档 | [docs.wasmtime.dev/lang-typescript.html](https://docs.wasmtime.dev/lang-typescript.html) |
| Emscripten Documentation | 文档 | [emscripten.org/docs](https://emscripten.org/docs) |
| AssemblyScript Standard Library | 文档 | [www.assemblyscript.org/stdlib.html](https://www.assemblyscript.org/stdlib.html) |
| Rust wasm-pack | 工具 | [rustwasm.github.io/wasm-pack](https://rustwasm.github.io/wasm-pack/) |

---

*最后更新: 2026-04-30*
