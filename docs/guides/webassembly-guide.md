# WebAssembly 完全指南

> 深入理解 WebAssembly (Wasm) 在 JavaScript/TypeScript 生态系统中的定位、集成方式与性能优化策略。

---

## 1. WebAssembly 概述

### 1.1 什么是 WebAssembly

WebAssembly (Wasm) 是一种面向现代浏览器的**二进制指令格式**，设计目标是作为 JavaScript 的补充而非替代品，实现：

- **接近原生的执行性能**（通常比 JS 快 10%-50%，特定场景可达 2-5 倍）
- **语言无关性**（C/C++、Rust、Go、AssemblyScript 等均可编译为 Wasm）
- **安全沙箱**（与 JS 共享同源策略和权限模型）
- **可移植性**（所有主流浏览器、Node.js、Deno、边缘计算平台均支持）

### 1.2 Wasm 与 JavaScript 的关系

```
┌─────────────────────────────────────────────┐
│              Web Application                │
├─────────────────────────────────────────────┤
│  JavaScript/TypeScript (协调层、UI、I/O)    │
│         ↕ JS ↔ Wasm 互操作边界              │
│  WebAssembly (计算密集型核心、编解码、算法) │
└─────────────────────────────────────────────┘
```

**最佳分工模式**：

- **JS**: DOM 操作、网络请求、业务逻辑、快速迭代
- **Wasm**: 图像/视频编解码、加密、物理模拟、数值计算、机器学习推理

---

## 2. 在 JS/TS 中使用 Wasm

### 2.1 基础加载模式

```typescript
// 基础加载模式
async function loadWasm(url: string): Promise<WebAssembly.Instance> {
  const response = await fetch(url)
  const bytes = await response.arrayBuffer()
  const module = await WebAssembly.compile(bytes)
  const instance = await WebAssembly.instantiate(module, {
    env: {
      memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }),
      __memory_base: 0,
      __table_base: 0,
      abort: () => { throw new Error('Wasm abort') }
    }
  })
  return instance
}

// 使用
const wasm = await loadWasm('/wasm/math.wasm')
const result = (wasm.exports.add as Function)(1, 2) // 3
```

### 2.2 内存管理

Wasm 使用线性内存（Linear Memory），与 JS 共享 ArrayBuffer：

```typescript
class WasmMemoryManager {
  private memory: WebAssembly.Memory

  constructor(initialPages = 256) {
    this.memory = new WebAssembly.Memory({
      initial: initialPages,
      maximum: initialPages * 4
    })
  }

  // 写入字符串到 Wasm 内存
  writeString(str: string, offset: number): void {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(str)
    const view = new Uint8Array(this.memory.buffer, offset, bytes.length + 1)
    view.set(bytes)
    view[bytes.length] = 0 // null terminator
  }

  // 从 Wasm 内存读取字符串
  readString(offset: number): string {
    const view = new Uint8Array(this.memory.buffer)
    const end = view.indexOf(0, offset)
    const decoder = new TextDecoder()
    return decoder.decode(view.subarray(offset, end === -1 ? undefined : end))
  }

  getMemory(): WebAssembly.Memory {
    return this.memory
  }
}
```

### 2.3 使用 wasm-bindgen (Rust → Wasm)

`wasm-bindgen` 是 Rust 生态中最成熟的 Wasm ↔ JS 绑定工具：

```rust
// Rust 侧 (lib.rs)
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

#[wasm_bindgen]
pub struct ImageProcessor {
    width: u32,
    height: u32,
}

#[wasm_bindgen]
impl ImageProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> Self {
        Self { width, height }
    }

    pub fn grayscale(&self, data: &[u8]) -> Vec<u8> {
        data.chunks(4)
            .flat_map(|pixel| {
                let gray = (pixel[0] as f32 * 0.299
                          + pixel[1] as f32 * 0.587
                          + pixel[2] as f32 * 0.114) as u8;
                [gray, gray, gray, pixel[3]]
            })
            .collect()
    }
}
```

```typescript
// JS/TS 侧
import init, { fibonacci, ImageProcessor } from './pkg/rust_wasm.js'

await init()

// 直接调用 Rust 函数
const result = fibonacci(40) // 比 JS 快 5-10x

// 使用 Rust 结构体
const processor = new ImageProcessor(1920, 1080)
const grayData = processor.grayscale(imageData)
```

---

## 3. AssemblyScript：TypeScript 语法编译到 Wasm

AssemblyScript 是 TypeScript 的子集，可直接编译为 Wasm：

```typescript
// assembly/index.ts (AssemblyScript)
export function add(a: i32, b: i32): i32 {
  return a + b
}

export function factorial(n: i32): i32 {
  let result: i32 = 1
  for (let i: i32 = 2; i <= n; i++) {
    result *= i
  }
  return result
}

// 固定数组操作
export function sumArray(arr: Int32Array): i32 {
  let sum: i32 = 0
  for (let i: i32 = 0; i < arr.length; i++) {
    sum += arr[i]
  }
  return sum
}
```

```typescript
// JS/TS 使用侧
import { add, factorial, sumArray } from './build/release.js'

console.log(add(1, 2))        // 3
console.log(factorial(10))    // 3628800
```

**AssemblyScript 限制**：

- 仅支持 `i32`, `i64`, `f32`, `f64` 等数值类型
- 不支持动态对象、闭包、`any` 类型
- 需手动管理内存

---

## 4. 性能优化策略

### 4.1 减少 JS ↔ Wasm 边界跨越

每次跨越边界都有开销（类型转换、序列化）：

```typescript
// ❌ 低效：频繁调用
for (let i = 0; i < 1000000; i++) {
  wasm.exports.process_single(data[i]) // 100万次边界跨越
}

// ✅ 高效：批量处理
wasm.exports.process_batch(dataPtr, data.length) // 1次边界跨越
```

### 4.2 共享内存策略

```typescript
// 使用 SharedArrayBuffer 避免复制
const sharedMemory = new WebAssembly.Memory({
  initial: 256,
  maximum: 512,
  shared: true // 允许 Web Worker 共享
})

// Worker 中直接读写同一块内存
worker.postMessage({
  type: 'process',
  memory: sharedMemory,
  offset,
  length
})
```

### 4.3 SIMD 加速

Wasm SIMD 128 位向量操作：

```typescript
// 使用 SIMD 进行批量数值计算
// 需在编译时启用 SIMD 标志 (如 rust: -C target-feature=+simd128)
// 典型加速场景：图像处理、矩阵运算、音频处理
```

---

## 5. 运行时与工具链

| 工具/运行时 | 用途 | 推荐场景 |
|------------|------|---------|
| **wasm-pack** | Rust → Wasm 构建工具 | Rust 项目 |
| **AssemblyScript** | TS 子集 → Wasm | 前端团队快速上手 |
| **JCO** | Wasm 组件模型工具链 | WASI 组件化 |
| **Wasmtime** | 服务器端 Wasm 运行时 | Node.js / 边缘运行 |
| **WAMR** | 嵌入式 Wasm 运行时 | IoT / 微控制器 |

---

## 6. 典型应用场景

### 6.1 图像处理

```typescript
import init, { resize_image, apply_filter } from './image-processing/pkg'

await init()

// 在 Wasm 中完成重采样和滤镜，比 Canvas 快 3-5x
const resized = resize_image(imageData, 800, 600)
const filtered = apply_filter(resized, 'sharpen')
```

### 6.2 加密运算

```typescript
// 使用 Rust 的 ring 库编译的 Wasm 进行加密
import { pbkdf2_hmac, aes_gcm_encrypt } from './crypto/pkg'

const key = pbkdf2_hmac(password, salt, 100000)
const encrypted = aes_gcm_encrypt(plaintext, key, nonce)
```

### 6.3 游戏物理引擎

```typescript
// Matter.js 的部分计算可下放到 Wasm
const world = new WasmPhysicsWorld()
world.addBody({ x: 0, y: 0, mass: 1 })
world.step(1 / 60)
const positions = world.getPositions() // Float32Array，零拷贝
```

---

## 7. 调试与监控

### 7.1 Chrome DevTools 调试

1. 打开 Chrome DevTools → Sources
2. 找到 `wasm` 文件，设置断点
3. 使用 `--debug` 标志编译以保留调试信息

### 7.2 性能分析

```typescript
// 测量 Wasm 调用耗时
const start = performance.now()
const result = wasm.exports.heavyComputation()
const duration = performance.now() - start
console.log(`Wasm execution: ${duration.toFixed(2)}ms`)
```

---

## 8. 安全注意事项

- **同源策略**：Wasm 模块遵循与 JS 相同的 CORS 规则
- **内存安全**：Wasm 无法直接访问 JS 内存，但可通过共享 ArrayBuffer 交换数据
- **代码签名**：生产环境建议对 Wasm 模块进行校验和验证
- **WASI 沙箱**：服务器端使用 WASI 限制文件系统/网络访问

---

> **关联文档**
>
> - `jsts-code-lab/36-web-assembly/` — WebAssembly 实战代码示例
> - [构建工具对比](../comparison-matrices/build-tools-compare.md)
> - [性能优化指南](../guides/performance-optimization.md)


---

> 📦 **归档说明（2026-04-27）**
>
> 本文档与 `docs/categories/21-webassembly.md` 内容高度重叠。更详细的 WebAssembly 生态内容请参见 **[categories/21-webassembly.md](../categories/21-webassembly.md)**（850+ 行）。
>
> 本文档保留作为速查入口，核心内容已迁移至 categories/ 目录。
