# WASM 组件模型

> **定位**：`20-code-lab/20.1-fundamentals-lab/web-assembly/wasm-component-model`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 WebAssembly 组件模型的集成问题。探讨 WASM 与 JS 的边界交互、内存管理和性能优化。

### 1.2 形式化基础

组件模型将 WASM 模块提升为组件（Component），其接口由 WIT（Wasm Interface Types）描述。形式化为接口签名 `Sigma = (imports: Ti*, exports: Te*)`，其中类型系统涵盖记录（record）、变体（variant）、结果（result）等高级类型，通过规范化的升降级（lifting/lowering）规则实现跨语言边界的数据编解码。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| WIT | WebAssembly 接口类型定义 | interfaces/ |
| 线性内存 | WASM 与 JS 共享的连续字节缓冲区 | memory-utils.ts |

---

## 二、设计原理

### 2.1 为什么存在

WebAssembly 提供了接近原生的执行性能，但早期版本与宿主环境交互受限。组件模型标准化了跨语言接口，使 WASM 成为真正的可组合模块。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 组件模型 | 跨语言互操作 | 工具链不成熟 | 多语言协作 |
| 直接绑定 | 简单直接 | 平台锁定 | JS-Rust 专用 |

### 2.3 与相关技术的对比

| 维度 | Component Model | WASI Preview 1 | Emscripten | napi-rs / Node-API |
|------|-----------------|----------------|------------|--------------------|
| 互操作范围 | 任意语言宿主 | 命令行/系统接口 | JS + Web | Node.js 专用 |
| 接口描述 | WIT（IDL） | 预定义 syscalls | embind / WebIDL | 手写 C 绑定 |
| 沙箱粒度 | 能力导向（capability） | 文件/网络 | 无（需浏览器沙箱） | 操作系统进程 |
| 内存模型 | 共享线性内存 | 共享线性内存 | 共享线性内存 | Node.js 堆内存 |
| 打包格式 | Wasm Component (.wasm) | Core Wasm | Core Wasm + JS glue | `.node` 原生模块 |
| 工具链成熟度 | 成长中 | 稳定 | 非常成熟 | 成熟 |

与 WASI 对比：组件模型关注接口，WASI 关注系统能力。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 WASM 组件模型 核心机制的理解，并观察不同实现选择带来的行为差异。

#### 可运行示例：JS 宿主与 WASM 线性内存交互

```typescript
// memory-bridge.ts — JS/WASM 边界内存管理示例，可运行 (Node.js >=20 / Deno)
// 需要安装：npm i @bytecodealliance/componentize-js
// 或使用任意导出 malloc/free 的 WASM 模块

interface WasmExports {
  memory: WebAssembly.Memory;
  add: (a: number, b: number) => number;
  malloc: (size: number) => number;
  free: (ptr: number) => void;
}

class WasmBridge {
  private exports: WasmExports;
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();

  constructor(instance: WebAssembly.Instance) {
    this.exports = instance.exports as unknown as WasmExports;
  }

  // 将 JS 字符串写入 WASM 内存并返回指针
  writeString(str: string): { ptr: number; len: number } {
    const bytes = this.encoder.encode(str);
    const ptr = this.exports.malloc(bytes.length + 1);
    const mem = new Uint8Array(this.exports.memory.buffer);
    mem.set(bytes, ptr);
    mem[ptr + bytes.length] = 0; // null terminator
    return { ptr, len: bytes.length };
  }

  // 从 WASM 内存读取 C 风格字符串
  readString(ptr: number): string {
    const mem = new Uint8Array(this.exports.memory.buffer);
    let end = ptr;
    while (mem[end] !== 0) end++;
    return this.decoder.decode(mem.subarray(ptr, end));
  }

  // 释放指针
  release(ptr: number) {
    this.exports.free(ptr);
  }

  // 演示：调用导出的 add 函数
  add(a: number, b: number): number {
    return this.exports.add(a, b);
  }
}

// ===== 演示（以简化的假设 WASM 为例） =====
async function demo() {
  // 实际运行时需要提供合法的 .wasm 二进制
  // const wasmBuffer = await fs.readFile('./math.wasm');
  // const { instance } = await WebAssembly.instantiate(wasmBuffer);
  // const bridge = new WasmBridge(instance);
  // console.log(bridge.add(2, 3)); // 5
  // const s = bridge.writeString('Hello WASM');
  // console.log(bridge.readString(s.ptr));
  // bridge.release(s.ptr);
}

// 以下为纯 JS 模拟，展示接口契约
const mockMemory = new WebAssembly.Memory({ initial: 1 });
const mockExports: WasmExports = {
  memory: mockMemory,
  add: (a, b) => a + b,
  malloc: (size) => 64, // 简化为固定偏移
  free: () => {},
};
const mockInstance = { exports: mockExports } as unknown as WebAssembly.Instance;
const bridge = new WasmBridge(mockInstance);
console.log('2 + 3 =', bridge.add(2, 3));

const { ptr, len } = bridge.writeString('WASM');
console.log('Written at', ptr, 'length', len);
console.log('Read back:', bridge.readString(ptr));
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| WASM 替代 JS | WASM 与 JS 是互补关系，各有适用域 |
| WASM 性能总是优于 JS | 边界调用和数据转换有额外开销 |

### 3.3 更多代码示例

#### WIT 接口定义与 JS 绑定

```wit
// math.wit
package example:math;

interface operations {
  add: func(a: s32, b: s32) -> s32;
  greet: func(name: string) -> string;
}

world math-world {
  export operations;
}
```

```typescript
// jco-bindings.ts — 使用 @bytecodealliance/jco 生成绑定后调用
// npm install @bytecodealliance/jco
import { operations } from './generated/math.js';

console.log(operations.add(2, 3)); // 5
console.log(operations.greet('WASM')); // 'Hello, WASM!'
```

#### 资源生命周期管理

```typescript
// resource-wrapper.ts
class WasmResource<T extends WebAssembly.Resource> {
  private handle: T | null = null;
  constructor(private factory: () => T) {}
  acquire(): T {
    if (!this.handle) this.handle = this.factory();
    return this.handle;
  }
  release() {
    if (this.handle) {
      (this.handle as any).dispose?.();
      this.handle = null;
    }
  }
}

// Usage
const memory = new WasmResource(() => new WebAssembly.Memory({ initial: 1 }));
const mem = memory.acquire();
// ... use mem ...
memory.release();
```

#### 组件模型运行时实例化

```typescript
// component-runtime.ts — 使用 JCO 运行 WASM Component
import { instantiate } from '@bytecodealliance/jco';

async function loadComponent(wasmPath: string) {
  const component = await WebAssembly.compileStreaming(fetch(wasmPath));
  // 提供 imports（如 WASI 接口）
  const imports = await instantiate(component, {
    'wasi:cli/stdout@0.2.0': { getStdout: () => ({ write: (data: Uint8Array) => { console.log(new TextDecoder().decode(data)); } }) },
  });
  return imports;
}

// 加载并使用组件
async function main() {
  const component = await loadComponent('./app.wasm');
  if ('run' in component) {
    (component as any).run();
  }
}
```

#### WASI Preview 2 文件系统访问

```typescript
// wasi-filesystem.ts — 使用 @bytecodealliance/preview2-shim
import { WASI } from '@bytecodealliance/preview2-shim';

async function runWithFilesystem(wasmPath: string, rootDir: string) {
  const wasi = new WASI({
    preopens: { '/sandbox': rootDir },
    args: ['wasm-app'],
    env: {},
  });

  const wasm = await WebAssembly.compile(await Deno.readFile(wasmPath));
  const instance = await WebAssembly.instantiate(wasm, {
    'wasi_snapshot_preview1': wasi.wasiImport,
  });

  wasi.start(instance);
}
```

#### wit-bindgen 生成的 Rust 组件调用

```rust
// lib.rs — Rust 端使用 wit-bindgen
use wit_bindgen::generate;

generate!({ path: "math.wit" });

struct MathImpl;

impl exports::example::math::operations::Guest for MathImpl {
    fn add(a: i32, b: i32) -> i32 {
        a + b
    }
    fn greet(name: String) -> String {
        format!("Hello, {name}!")
    }
}

export_math_world!(MathImpl);
```

```typescript
// 生成的 JS 绑定使用
import { operations } from './math.js';
const sum = operations.add(40, 2); // 42
```

#### 跨组件组合（Component Composition）

```wit
// calculator.wit
package example:calculator;
interface calc { eval: func(expr: string) -> result<f64, string>; }
world calculator-world { import example:math/operations; export calc; }
```

```typescript
// 使用 wasm-tools compose 组合组件后生成
import { calc } from './calculator-js/calculator-world.js';
const result = calc.eval('2 + 2');
if (result.tag === 'ok') { console.log('Result:', result.val); }
```

### 3.3 扩展阅读

- [WASM Component Model](https://component-model.bytecodealliance.org/)
- [WebAssembly 官方规范](https://webassembly.github.io/spec/core/)
- [Wasmtime Runtime 文档](https://docs.wasmtime.dev/)
- [WIT 接口定义指南](https://component-model.bytecodealliance.org/design/wit.html)
- `30-knowledge-base/30.9-webassembly`

---


## 进阶代码示例

### WIT 接口定义与 JS 绑定

```wit
// math.wit
package example:math;

interface operations {
  add: func(a: s32, b: s32) -> s32;
  greet: func(name: string) -> string;
}

world math-world {
  export operations;
}
```

```typescript
// jco-bindings.ts — 使用 @bytecodealliance/jco 生成绑定后调用
// npm install @bytecodealliance/jco
import { operations } from './generated/math.js';

console.log(operations.add(2, 3)); // 5
console.log(operations.greet('WASM')); // 'Hello, WASM!'
```

### 资源生命周期管理

```typescript
// resource-wrapper.ts
class WasmResource<T extends WebAssembly.Resource> {
  private handle: T | null = null;
  constructor(private factory: () => T) {}
  acquire(): T {
    if (!this.handle) this.handle = this.factory();
    return this.handle;
  }
  release() {
    if (this.handle) {
      (this.handle as any).dispose?.();
      this.handle = null;
    }
  }
}

// Usage
const memory = new WasmResource(() => new WebAssembly.Memory({ initial: 1 }));
const mem = memory.acquire();
// ... use mem ...
memory.release();
```

## 新增权威参考链接

- [JCO (JavaScript Component Tools)](https://github.com/bytecodealliance/jco) — Bytecode Alliance JS 组件工具
- [Componentize-js](https://github.com/bytecodealliance/componentize-js) — 将 JS 编译为 WASM 组件
- [WASI Preview 2](https://github.com/WebAssembly/WASI/tree/main/preview2) — WASI 预览 2 规范
- [Deno WebAssembly](https://docs.deno.com/runtime/manual/runtime/webassembly) — Deno WASM 支持
- [Rust wasm-bindgen](https://rustwasm.github.io/wasm-bindgen/) — Rust 与 JS 绑定
- [WebAssembly Interface Types Proposal](https://github.com/WebAssembly/interface-types) — W3C 接口类型提案

### 组件组合与包管理实战

```wit
package example:calculator;
interface calc { eval: func(expr: string) -> result<f64, string>; }
world calculator-world { import example:math/operations; export calc; }
```

```typescript
import { calc } from './calculator-js/calculator-world.js';
const result = calc.eval('2 + 2');
if (result.tag === 'ok') { console.log('Result:', result.val); }
```

### 升降级（Lifting/Lowering）数据流

```typescript
// JS number -> Lifting -> WASM i32 -> 执行 -> Lowering -> JS number
// JS string -> UTF-8 -> WASM linear memory (ptr, len) -> JS string
```

---

## 更多权威参考链接

- [WIT 语法参考](https://component-model.bytecodealliance.org/design/wit.html) — WIT 接口定义完整语法
- [JCO Transpiler](https://github.com/bytecodealliance/jco) — JS 宿主组件工具
- [Wasmtime 运行时](https://docs.wasmtime.dev/) — 生产级 WASM 运行时
- [WASI Preview 2 规范](https://github.com/WebAssembly/WASI/tree/main/preview2) — 系统接口标准
- [Bytecode Alliance 博客](https://bytecodealliance.org/articles) — 组件模型深度文章
- [Fermyon Spin 组件实践](https://developer.fermyon.com/spin/v2/javascript-components) — 服务端 WASM 组件
- [W3C WebAssembly 工作组](https://www.w3.org/wasm/) — 官方标准组织
- [WebAssembly Community Group](https://github.com/WebAssembly/community-groups) — 社区组仓库
- [wasm-tools CLI](https://github.com/bytecodealliance/wasm-tools) — WASM 二进制工具集
- [WebAssembly JS API](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface) — MDN JS API 文档
- [WebAssembly MDN 教程](https://developer.mozilla.org/en-US/docs/WebAssembly) — MDN 入门指南
- [Wasmtime Embedding C API](https://docs.wasmtime.dev/c-api/) — C 语言嵌入文档
- [WebAssembly Spec: Core Specification](https://webassembly.github.io/spec/core/) — 核心规范
- [WebAssembly Spec: JS Interface](https://webassembly.github.io/spec/js-api/) — JS 接口规范
- [WebAssembly Spec: Web API](https://webassembly.github.io/spec/web-api/) — Web API 规范
- [Rust and WebAssembly Book](https://rustwasm.github.io/book/) — Rust WASM 官方书籍

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
