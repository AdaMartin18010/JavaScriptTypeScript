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

---

*最后更新: 2026-04-29*
