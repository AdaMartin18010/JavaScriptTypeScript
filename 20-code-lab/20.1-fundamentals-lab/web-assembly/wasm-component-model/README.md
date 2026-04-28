# Wasm Component Model 实践

> WebAssembly Component Model 是 WASI Preview 2 的核心抽象，允许不同语言编译的 Wasm 模块通过标准接口互操作。

---

## 1. Component Model 核心概念

### 1.1 与旧版 Wasm 的区别

| 特性 | Wasm Module (WASI 0.1) | Wasm Component (WASI Preview 2) |
|------|------------------------|--------------------------------|
| 接口定义 | 无标准接口 | WIT (Wasm Interface Types) |
| 跨语言调用 | 需手动绑定 | 通过 `wit-bindgen` 自动生成 |
| 包管理 | 无 | Warg / Wasmtime Registry |
| 兼容性 | 模块级 | 组件级组合 |

### 1.2 WIT 接口定义示例

```wit
// calculator.wit
package example:calculator@1.0.0;

interface operations {
    enum op { add, sub, mul, div }
    record calc-request {
        op: op,
        left: f64,
        right: f64,
    }
    calc: func(req: calc-request) -> result<f64, string>;
}

world calculator {
    export operations;
}
```

---

## 2. JavaScript 调用 Wasm Component

### 2.1 使用 jco (JavaScript Component Toolkit)

```typescript
// host.ts - 在 JS 运行时调用 Wasm Component
import { instantiate } from './calculator.js';

async function main() {
    const calc = await instantiate(
        fetch('./calculator.wasm'),
        {
            // 导入宿主能力（如文件系统、网络）
        }
    );

    const result = calc.operations.calc({
        op: 'add',
        left: 10.5,
        right: 20.3,
    });

    console.log(result); // 30.8
}

main();
```

### 2.2 在 Node.js 中使用

```typescript
// node-host.ts
import { readFile } from 'node:fs/promises';
import { createComponent } from '@bytecodealliance/componentize-js';

async function runComponent() {
    const wasm = await readFile('./calculator.wasm');
    const component = await WebAssembly.instantiate(wasm, {
        // 适配器
    });

    const exports = component.exports;
    const calc = exports['example:calculator/operations@1.0.0'];

    const res = calc.calc({ op: 'mul', left: 6, right: 7 });
    console.log(res); // 42
}
```

---

## 3. 将 JS/TS 编译为 Wasm Component

### 3.1 使用 ComponentizeJS

```bash
# 安装工具
npm install -g @bytecodealliance/jco @bytecodealliance/componentize-js

# 编写 WIT 接口
# example.wit

# 编写实现
# src/index.ts
```

```typescript
// src/index.ts
// @ts-ignore
import { calc } from 'wasi:example/operations';

// 实现 WIT 接口中定义的 export
export function calc(req: { op: string; left: number; right: number }): number {
    switch (req.op) {
        case 'add': return req.left + req.right;
        case 'sub': return req.left - req.right;
        case 'mul': return req.left * req.right;
        case 'div': return req.left / req.right;
        default: throw new Error(`Unknown op: ${req.op}`);
    }
}
```

```bash
# 编译为 Component
npx componentize-js src/index.ts -w example.wit -o example.wasm
```

---

## 4. 组件组合 (Composition)

### 4.1 多个组件组合

```typescript
// compose-components.ts
import { transpile } from '@bytecodealliance/jco';

async function compose() {
    // 将多个 Wasm Component 组合为一个
    const composed = await transpile(
        './composed.wasm',
        {
            name: 'composed-app',
            map: [
                ['example:logger', './logger.wasm'],
                ['example:database', './database.wasm'],
            ],
        }
    );

    await Bun.write('./composed-app.js', composed.files['composed-app.js']);
}
```

---

## 5. 实战场景

### 5.1 插件系统

```typescript
// plugin-system.ts
interface Plugin {
    name: string;
    version: string;
    execute(input: unknown): unknown;
}

class WasmPluginHost {
    private plugins = new Map<string, WebAssembly.Instance>();

    async loadPlugin(path: string): Promise<Plugin> {
        const wasm = await readFile(path);
        const component = await WebAssembly.instantiate(wasm, this.getImports());

        const meta = component.exports['metadata'] as () => { name: string; version: string };
        const exec = component.exports['execute'] as (input: unknown) => unknown;

        return {
            name: meta().name,
            version: meta().version,
            execute: exec,
        };
    }

    private getImports() {
        return {
            // 宿主能力注入
            'wasi:io/streams': { /* ... */ },
            'wasi:cli/stdout': { /* ... */ },
        };
    }
}
```

### 5.2 边缘计算中的 Wasm Component

```typescript
// edge-deployment.ts
// 在 Cloudflare Workers 或 Deno Deploy 中运行

export default {
    async fetch(request: Request): Promise<Response> {
        const wasm = await WebAssembly.compileStreaming(
            fetch('https://cdn.example.com/image-processor.wasm')
        );

        const instance = await WebAssembly.instantiate(wasm, {
            // WASI Preview 2 适配
        });

        const processor = instance.exports as {
            processImage(buffer: Uint8Array, format: string): Uint8Array;
        };

        const imageData = new Uint8Array(await request.arrayBuffer());
        const processed = processor.processImage(imageData, 'webp');

        return new Response(processed, {
            headers: { 'Content-Type': 'image/webp' },
        });
    },
};
```

---

## 6. 工具链

| 工具 | 用途 | 状态 |
|------|------|------|
| `wit-bindgen` | 从 WIT 生成绑定代码 | 稳定 |
| `jco` | JS Component Toolkit（运行+转译） | 活跃开发 |
| `componentize-js` | JS/TS → Wasm Component | 活跃开发 |
| `wasmtime` | Wasm 运行时（支持 Component） | 稳定 |
| `wac` | Wasm Composition 工具 | 实验性 |

---

## 7. 参考资源

- [WASI Preview 2 规范](https://github.com/WebAssembly/WASI/blob/main/preview2/README.md)
- [Component Model 规范](https://github.com/WebAssembly/component-model)
- [jco 文档](https://github.com/bytecodealliance/jco)
- [wit-bindgen](https://github.com/bytecodealliance/wit-bindgen)
