---
title: WebAssembly 完全指南
description: "Awesome JS/TS Ecosystem 指南: WebAssembly 完全指南"
---

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

> 数据来源: [W3C WebAssembly Core Specification](https://www.w3.org/TR/wasm-core-2/), 2024

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

### 1.3 WebAssembly 2.0 新特性

WebAssembly 2.0（Phase 4 已定稿）引入了多项关键扩展，显著提升了 Wasm 的表达能力和性能上限。[来源: W3C Wasm 2.0 Spec, 2024]

#### 多内存 (Multi-Memory)

Wasm 2.0 允许模块定义多个线性内存，解决了多模块间内存隔离与大型数据缓冲的问题：

```wasm
;; WAT (WebAssembly Text Format) 示例
(module
  ;; 定义两个独立的内存空间
  (memory $heap 1)      ;; 主堆内存
  (memory $buffer 2)    ;; 数据缓冲区

  ;; 从 $buffer 内存加载数据，写入 $heap
  (func $copy_data (param $src i32) (param $dst i32) (param $len i32)
    (local $i i32)
    (local.set $i (i32.const 0))
    (block $done
      (loop $loop
        (br_if $done (i32.ge_u (local.get $i) (local.get $len)))
        ;; 从 $buffer 读取
        (i32.store $heap
          (i32.add (local.get $dst) (local.get $i))
          ;; 向 $buffer 写入
          (i32.load $buffer (i32.add (local.get $src) (local.get $i)))
        )
        (local.set $i (i32.add (local.get $i) (i32.const 4)))
        (br $loop)
      )
    )
  )
)
```

在 JS 中使用多内存模块：

```typescript
// TypeScript: 为 Wasm 2.0 多内存模块提供导入
const memoryHeap = new WebAssembly.Memory({ initial: 1 })
const memoryBuffer = new WebAssembly.Memory({ initial: 2 })

const instance = await WebAssembly.instantiate(module, {
  env: {
    memory: memoryHeap,       // 对应 $heap
    memory2: memoryBuffer     // 对应 $buffer (命名需在编译时映射)
  }
})
```

#### 尾调用优化 (Tail Calls)

尾调用提案允许编译器将尾递归优化为循环，避免栈溢出，对函数式语言编译到 Wasm 至关重要：

```rust
// Rust 示例：使用 trunk 尾递归风格的列表求和
// 编译器在启用 tail-call 标志后可将其优化为跳转
#[wasm_bindgen]
pub fn sum_list_tail(acc: i64, n: i64) -> i64 {
    if n <= 0 {
        acc
    } else {
        sum_list_tail(acc + n, n - 1) // 尾调用位置
    }
}
```

> 注意：截至 2025 年底，V8 与 SpiderMonkey 已实现尾调用，但需在编译时显式启用 `--enable-tail-call` 或对应 target feature。[来源: V8 博客, 2024]

#### SIMD 128

Wasm SIMD 提供 128 位向量操作，通过 `v128` 类型支持 `i8x16`、`i16x8`、`i32x4`、`f32x4` 等lane 配置：

```rust
// Rust + packed_simd 示例：使用 SIMD 加速向量加法
#[cfg(target_arch = "wasm32")]
use core::arch::wasm32::*;

#[wasm_bindgen]
pub fn simd_add_arrays(a: &[f32], b: &[f32], out: &mut [f32]) {
    assert_eq!(a.len(), b.len());
    assert_eq!(a.len(), out.len());

    let chunks = a.len() / 4;
    for i in 0..chunks {
        let va = v128_load(a.as_ptr().add(i * 4) as *const v128);
        let vb = v128_load(b.as_ptr().add(i * 4) as *const v128);
        let vr = f32x4_add(va, vb);
        v128_store(out.as_mut_ptr().add(i * 4) as *mut v128, vr);
    }
    // 处理剩余元素
    for i in (chunks * 4)..a.len() {
        out[i] = a[i] + b[i];
    }
}
```

```typescript
// TypeScript 侧：加载并调用 SIMD 优化模块
import init, { simd_add_arrays } from './pkg/simd_wasm.js'

await init()

const a = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8])
const b = new Float32Array([8, 7, 6, 5, 4, 3, 2, 1])
const out = new Float32Array(8)

simd_add_arrays(a, b, out)
console.log(out) // Float32Array([9, 9, 9, 9, 9, 9, 9, 9])
```

> 性能数据：SIMD 加速在图像处理和矩阵运算中通常可带来 **3x–8x** 的吞吐提升。[来源: Google Wasm SIMD 基准测试, 2024]

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

### 2.3 JS ↔ WASM 互操作进阶

#### TypedArray 零拷贝传递

```typescript
// 通过内存共享实现零拷贝数据传递
interface WasmImageModule {
  exports: {
    memory: WebAssembly.Memory
    process_rgba: (ptr: number, width: number, height: number) => void
    malloc: (size: number) => number
    free: (ptr: number) => void
  }
}

async function processImageZeroCopy(
  wasm: WasmImageModule,
  imageData: ImageData
): Promise<ImageData> {
  const { memory, process_rgba, malloc, free } = wasm.exports
  const bytes = imageData.data.length

  // 在 Wasm 堆上分配内存
  const ptr = malloc(bytes)
  if (ptr === 0) throw new Error('Wasm malloc failed')

  try {
    // 直接写入 Wasm Memory（零拷贝视图）
    const wasmBuffer = new Uint8Array(memory.buffer, ptr, bytes)
    wasmBuffer.set(imageData.data)

    // 调用 Wasm 处理
    process_rgba(ptr, imageData.width, imageData.height)

    // 读取结果（同一缓冲区，无需复制）
    return new ImageData(
      new Uint8ClampedArray(memory.buffer, ptr, bytes),
      imageData.width,
      imageData.height
    )
  } finally {
    free(ptr)
  }
}
```

#### 函数表与回调

```typescript
// TypeScript: 将 JS 函数作为回调传递给 Wasm
const importObject = {
  env: {
    memory: new WebAssembly.Memory({ initial: 256 }),
    // Wasm 可通过函数表索引反向调用 JS
    __indirect_function_table: new WebAssembly.Table({
      initial: 10,
      element: 'anyfunc'
    })
  },
  js: {
    // 直接导入的 JS 函数
    console_log: (ptr: number, len: number) => {
      const bytes = new Uint8Array(memory.buffer, ptr, len)
      console.log(new TextDecoder().decode(bytes))
    }
  }
}

// 在 Wasm Table 中注册回调
const table = importObject.env.__indirect_function_table
const callbackIdx = 0
table.set(callbackIdx, (x: number, y: number) => x + y)
```

### 2.4 Web Worker 中运行 WASM

在 Worker 中运行 Wasm 可避免阻塞主线程，尤其适用于重型计算：

```typescript
// worker.ts：WASM Worker 实现
let wasmModule: WebAssembly.Instance | null = null

self.onmessage = async (event: MessageEvent) => {
  const { type, payload, id } = event.data

  if (type === 'init') {
    const response = await fetch(payload.wasmUrl)
    const bytes = await response.arrayBuffer()
    const module = await WebAssembly.compile(bytes)
    wasmModule = await WebAssembly.instantiate(module, {
      env: { memory: new WebAssembly.Memory({ initial: 256, maximum: 1024, shared: true }) }
    })
    self.postMessage({ type: 'init_done', id })
    return
  }

  if (type === 'compute' && wasmModule) {
    const start = performance.now()
    const result = (wasmModule.exports[payload.fn] as Function)(...payload.args)
    const duration = performance.now() - start
    self.postMessage({ type: 'result', id, result, duration })
  }
}
```

```typescript
// main.ts：主线程调用封装
class WasmWorkerPool {
  private workers: Worker[] = []
  private queue: Array<{ resolve: Function; reject: Function; task: any }> = []

  constructor(workerUrl: string, poolSize = navigator.hardwareConcurrency || 4) {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerUrl, { type: 'module' })
      worker.onmessage = (e) => this.handleMessage(e)
      this.workers.push(worker)
    }
  }

  async init(wasmUrl: string): Promise<void> {
    await Promise.all(
      this.workers.map(
        (w) =>
          new Promise<void>((resolve) => {
            w.postMessage({ type: 'init', payload: { wasmUrl } })
            w.addEventListener('message', function handler(e) {
              if (e.data.type === 'init_done') {
                w.removeEventListener('message', handler)
                resolve()
              }
            })
          })
      )
    )
  }

  private handleMessage(e: MessageEvent) {
    // 任务调度逻辑...
  }

  async compute(fn: string, args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject, task: { fn, args } })
      this.schedule()
    })
  }

  private schedule() {
    // 轮询分配任务到空闲 Worker
  }
}

// 使用
const pool = new WasmWorkerPool('/workers/wasm-worker.js')
await pool.init('/wasm/heavy-math.wasm')
const result = await pool.compute('matrix_multiply', [matrixA, matrixB])
```

### 2.5 SharedArrayBuffer 共享内存

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
  offset: 0,
  length: 1024
})
```

> 注意：使用 `SharedArrayBuffer` 需要设置正确的 COOP/COEP 响应头。[来源: MDN Web Docs, 2024]

---

## 3. Rust → WASM 完整开发流

### 3.1 wasm-bindgen

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

### 3.2 wasm-pack

`wasm-pack` 是 Rust → Wasm 的一站式构建和发布工具：

```bash
# 安装
npm install -g wasm-pack

# 创建项目
wasm-pack new my-wasm-project --template wasm32-unknown-unknown
cd my-wasm-project

# Cargo.toml 关键配置
# [package]
# name = "my-wasm-project"
# version = "0.1.0"
# edition = "2021"
#
# [lib]
# crate-type = ["cdylib"]
#
# [dependencies]
# wasm-bindgen = "0.2.90"
# js-sys = "0.3.67"
# web-sys = { version = "0.3.67", features = ["console"] }
#
# [profile.release]
# opt-level = 3
# lto = true        # 启用 Link-Time Optimization，显著减小体积
# codegen-units = 1

# 构建 (开发模式)
wasm-pack build --target web --out-dir pkg

# 构建 (生产模式，启用最大优化)
wasm-pack build --release --target web --out-dir pkg
```

构建产物说明：

| 文件 | 说明 |
|------|------|
| `pkg/my_wasm_project.js` | JS 胶水代码，封装内存管理和 API 绑定 |
| `pkg/my_wasm_project_bg.wasm` | 编译后的 Wasm 二进制文件 |
| `pkg/package.json` | 可直接发布的 npm 包配置 |

### 3.3 trunk：Rust/WASM 前端构建工具

`trunk` 是专为 Rust → Wasm 前端应用设计的零配置构建工具：

```bash
# 安装
cargo install trunk wasm-bindgen-cli

# 初始化项目
cargo new --lib trunk-app
cd trunk-app
```

```rust
// src/lib.rs (Yew / Leptos / 纯 wasm-bindgen 均可)
use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen(start)]
pub fn main() {
    console::log_1(&"Hello from Trunk + Rust WASM!".into());
}

#[wasm_bindgen]
pub fn compute_primes(limit: u32) -> Vec<u32> {
    let mut primes = Vec::new();
    for n in 2..=limit {
        if is_prime(n) { primes.push(n); }
    }
    primes
}

fn is_prime(n: u32) -> bool {
    if n < 2 { return false; }
    for i in 2..=((n as f32).sqrt() as u32) {
        if n % i == 0 { return false; }
    }
    true
}
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Trunk WASM App</title>
  <link data-trunk rel="rust" href="Cargo.toml" data-wasm-opt="z" />
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

```bash
# 开发服务器（自动热重载）
trunk serve

# 生产构建（启用 wasm-opt 体积压缩）
trunk build --release
```

> `wasm-opt` 是 Binaryen 工具链的一部分，使用 `-Oz` 标志可将 Wasm 体积压缩 **20%–50%**。[来源: Binaryen 文档, 2024]

---

## 4. AssemblyScript：TypeScript 语法编译到 WASM

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

### 4.1 AssemblyScript 进阶：手动内存管理

```typescript
// assembly/memory.ts
import { memory } from './memory'

// 导出自定义 malloc / free（或使用 AssemblyScript 运行时）
export function process_large_buffer(inputPtr: i32, len: i32): i32 {
  const outputPtr = heap.alloc(len * 2) as i32

  for (let i: i32 = 0; i < len; i++) {
    const val = load<i32>(inputPtr + i * 4)
    store<i32>(outputPtr + i * 4, val * 2)
  }

  return outputPtr // JS 侧负责释放
}

export function free_buffer(ptr: i32): void {
  heap.free(ptr)
}
```

```typescript
// JS/TS 使用侧
import {
  process_large_buffer,
  free_buffer,
  memory
} from './build/release.js'

const input = new Int32Array([1, 2, 3, 4, 5])
const inputLen = input.length

// 写入 Wasm 内存
const inputPtr = malloc(inputLen * 4) // 假设有导出 malloc
const view = new Int32Array(memory.buffer, inputPtr, inputLen)
view.set(input)

// 调用处理函数
const outputPtr = process_large_buffer(inputPtr, inputLen)
const output = new Int32Array(memory.buffer, outputPtr, inputLen)
console.log(output) // [2, 4, 6, 8, 10]

// 释放内存
free_buffer(outputPtr)
```

---

## 5. 多语言 WASM 生态

Wasm 的语言支持已远超 C/C++ 和 Rust，以下语言均具备生产级编译能力。[来源: WebAssembly.org 语言列表, 2025]

### 5.1 TinyGo

TinyGo 是 Go 语言的轻量级编译器，支持 `GOOS=js GOARCH=wasm` 以及更优的 WASI 目标：

```go
// main.go
package main

import "fmt"

//export add
func add(a, b int32) int32 {
 return a + b
}

//export greet
func greet(namePtr *byte) *byte {
 name := tinygoString(namePtr)
 msg := fmt.Sprintf("Hello, %s from TinyGo WASM!", name)
 return stringToTinygo(msg)
}

func main() {}
```

```bash
# 编译为 Wasm（WASI 目标，体积更小）
tinygo build -o main.wasm -target wasm .       # 浏览器目标
tinygo build -o main.wasi.wasm -target wasi .  # WASI 目标
```

```typescript
// JS/TS 加载 TinyGo Wasm
const go = new Go() // TinyGo 提供的小型 JS 运行时
const wasm = await WebAssembly.instantiateStreaming(
  fetch('./main.wasm'),
  go.importObject
)
go.run(wasm.instance)
```

> TinyGo 生成的 Wasm 体积通常比官方 Go 编译器小 **10x–100x**（~2KB vs ~2MB），适合前端场景。[来源: TinyGo 官方文档, 2024]

### 5.2 Grain

Grain 是专为 WebAssembly 设计的函数式语言，语法接近 OCaml/Reason：

```grain
// math.gr
module Math

export let rec fib = (n) => {
  if (n <= 1) {
    n
  } else {
    fib(n - 1) + fib(n - 2)
  }
}

export let sum = (arr) => {
  Array.reduce((acc, x) => acc + x, 0, arr)
}
```

```bash
# 编译
grain compile math.gr -o math.wasm
```

```typescript
// JS/TS 使用
const { instance } = await WebAssembly.instantiateStreaming(
  fetch('./math.wasm')
)
console.log(instance.exports.fib(10)) // 55
```

### 5.3 Swift WASM

Swift 通过 `swiftwasm` 工具链支持编译到 Wasm，适合 iOS 团队复用算法代码：

```swift
// Package.swift 需添加 swiftwasm 工具链
// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "SwiftWasmLib",
    products: [.library(name: "SwiftWasmLib", targets: ["SwiftWasmLib"])],
    targets: [.target(name: "SwiftWasmLib")]
)
```

```swift
// Sources/SwiftWasmLib/lib.swift
import JavaScriptKit

@_cdecl("sha256_hash")
public func sha256Hash(dataPtr: Int32, len: Int32) -> Int32 {
    // 使用 Swift Crypto 库计算哈希
    let buffer = UnsafeBufferPointer(start: UnsafePointer<UInt8>(bitPattern: Int(dataPtr)), count: Int(len))
    let hash = computeSHA256(Array(buffer))
    return copyToHeap(hash) // 返回指向堆内存的指针
}
```

```bash
# 使用 swiftwasm 编译
swift build --triple wasm32-unknown-wasi
```

> Swift WASM 生态系统仍在快速发展中，JavaScriptKit 提供了与 DOM 和 JS 互操作的能力。[来源: SwiftWasm 项目, 2025]

---

## 6. 性能优化策略

### 6.1 减少 JS ↔ Wasm 边界跨越

每次跨越边界都有开销（类型转换、序列化）：

```typescript
// ❌ 低效：频繁调用
for (let i = 0; i < 1000000; i++) {
  wasm.exports.process_single(data[i]) // 100万次边界跨越
}

// ✅ 高效：批量处理
wasm.exports.process_batch(dataPtr, data.length) // 1次边界跨越
```

### 6.2 共享内存策略

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

### 6.3 SIMD 加速

Wasm SIMD 128 位向量操作：

```rust
// Rust 侧：SIMD 矩阵乘法
#[cfg(target_arch = "wasm32")]
use core::arch::wasm32::*;

#[wasm_bindgen]
pub fn simd_matmul_4x4(a: &[f32], b: &[f32], out: &mut [f32]) {
    assert_eq!(a.len(), 16);
    assert_eq!(b.len(), 16);
    assert_eq!(out.len(), 16);

    for i in 0..4 {
        let a_row = f32x4(a[i*4], a[i*4+1], a[i*4+2], a[i*4+3]);
        for j in 0..4 {
            let b_col = f32x4(b[j], b[j+4], b[j+8], b[j+12]);
            let prod = f32x4_mul(a_row, b_col);
            // 水平相加提取结果...
            out[i*4+j] = f32x4_extract_lane::<0>(prod) + f32x4_extract_lane::<1>(prod)
                       + f32x4_extract_lane::<2>(prod) + f32x4_extract_lane::<3>(prod);
        }
    }
}
```

### 6.4 WASM 打包大小优化

Wasm 二进制体积直接影响网络传输和启动时间：

```bash
# 1. wasm-opt (Binaryen)：体积压缩与性能优化
wasm-opt -Oz input.wasm -o output.wasm    # 最小体积
wasm-opt -O3 input.wasm -o output.wasm    # 最大性能

# 2. wasm-strip：移除调试信息和自定义段
wasm-strip output.wasm

# 3. twiggy：分析 Rust WASM 体积构成
cargo install twiggy
twiggy top -n 10 pkg/*.wasm

# 4. gzip / brotli 压缩（CDN 通常自动处理）
brotli -q 11 -o output.wasm.br output.wasm
```

```typescript
// TypeScript：运行时加载压缩后的 Wasm
async function loadCompressedWasm(url: string): Promise<WebAssembly.Module> {
  const response = await fetch(url, {
    headers: { 'Accept-Encoding': 'br, gzip' }
  })
  // 浏览器自动解压 Content-Encoding
  const bytes = await response.arrayBuffer()
  return WebAssembly.compile(bytes)
}
```

> 优化效果：通过 `wasm-opt -Oz` + `wasm-strip`，典型 Rust Wasm 模块可从 **500KB** 降至 **80KB–120KB**（原始体积），配合 Brotli 压缩后可达 **30KB–50KB**。[来源: Rust Wasm 工作组最佳实践, 2024]

### 6.5 启动时间优化

```typescript
// 策略 1：流式编译与实例化
const module = await WebAssembly.compileStreaming(
  fetch('/wasm/app.wasm')
)
const instance = await WebAssembly.instantiate(module, imports)

// 策略 2：预编译缓存（Service Worker / IndexedDB）
async function getCachedModule(url: string): Promise<WebAssembly.Module> {
  const cache = await caches.open('wasm-cache-v1')
  const cached = await cache.match(url)
  if (cached) {
    return WebAssembly.compile(await cached.arrayBuffer())
  }
  const response = await fetch(url)
  await cache.put(url, response.clone())
  return WebAssembly.compileStreaming(Promise.resolve(response))
}

// 策略 3：异步初始化 + 骨架屏
// 先渲染 UI，后台并行加载 Wasm
const wasmPromise = loadWasm('/wasm/engine.wasm')
renderSkeletonUI()
const wasm = await wasmPromise
bindUIEvents(wasm)
```

### 6.6 内存管理最佳实践

```typescript
// 使用对象池复用 Wasm 内存，避免频繁分配
class WasmBufferPool {
  private pool: Array<{ ptr: number; size: number }> = []
  private inUse = new Set<number>()

  constructor(private wasm: { malloc: (n: number) => number; free: (n: number) => void }) {}

  acquire(size: number): number {
    const idx = this.pool.findIndex(b => b.size >= size && !this.inUse.has(b.ptr))
    if (idx !== -1) {
      this.inUse.add(this.pool[idx].ptr)
      return this.pool[idx].ptr
    }
    const ptr = this.wasm.malloc(size)
    this.pool.push({ ptr, size })
    this.inUse.add(ptr)
    return ptr
  }

  release(ptr: number): void {
    this.inUse.delete(ptr)
  }

  dispose(): void {
    for (const { ptr } of this.pool) {
      this.wasm.free(ptr)
    }
    this.pool = []
  }
}
```

---

## 7. 典型应用场景

### 7.1 图像处理

```typescript
import init, { resize_image, apply_filter } from './image-processing/pkg'

await init()

// 在 Wasm 中完成重采样和滤镜，比 Canvas 快 3-5x
const resized = resize_image(imageData, 800, 600)
const filtered = apply_filter(resized, 'sharpen')
```

### 7.2 视频编解码

使用 FFmpeg + Wasm 在浏览器端实现视频转码：

```typescript
// ffmpeg.wasm 使用示例
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

const ffmpeg = new FFmpeg()
await ffmpeg.load()

// 写入输入文件到 Wasm FS
ffmpeg.writeFile('input.mp4', await fetchFile('/assets/input.mp4'))

// 在 Wasm 中执行转码
await ffmpeg.exec([
  '-i', 'input.mp4',
  '-c:v', 'libx264',
  '-preset', 'ultrafast',
  '-crf', '23',
  'output.mp4'
])

const data = await ffmpeg.readFile('output.mp4')
const blob = new Blob([data], { type: 'video/mp4' })
const url = URL.createObjectURL(blob)
```

> `ffmpeg.wasm` 单线程版约 **24MB**，多线程版（SIMD + SharedArrayBuffer）可提升 **3x–5x** 转码速度。[来源: ffmpeg.wasm 官方基准测试, 2024]

### 7.3 加密运算

```typescript
// 使用 Rust 的 ring 库编译的 Wasm 进行加密
import { pbkdf2_hmac, aes_gcm_encrypt } from './crypto/pkg'

const key = pbkdf2_hmac(password, salt, 100000)
const encrypted = aes_gcm_encrypt(plaintext, key, nonce)
```

### 7.4 游戏引擎

```typescript
// Matter.js 的部分计算可下放到 Wasm
const world = new WasmPhysicsWorld()
world.addBody({ x: 0, y: 0, mass: 1 })
world.step(1 / 60)
const positions = world.getPositions() // Float32Array，零拷贝
```

**Bevy / macroquad WASM 游戏构建**：

```rust
// Cargo.toml
// [dependencies]
// macroquad = "0.4"

// src/main.rs
use macroquad::prelude::*;

#[macroquad::main("WASM Game")]
async fn main() {
    loop {
        clear_background(BLACK);
        draw_circle(screen_width()/2., screen_height()/2., 30., RED);
        next_frame().await
    }
}
```

```bash
# 使用 trunk 构建并部署
trunk build --release
cp dist/* ./docs/
```

### 7.5 科学计算

在浏览器中运行线性代数库（如 nalgebra、ndarray）：

```rust
// Rust 侧：矩阵特征值分解
use nalgebra::DMatrix;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn matrix_eigenvalues(data: &[f64], n: usize) -> Vec<f64> {
    let mat = DMatrix::from_row_slice(n, n, data);
    let eigen = mat.symmetric_eigen();
    eigen.eigenvalues.iter().cloned().collect()
}
```

```typescript
// JS/TS 侧：在浏览器中运行科学计算
import init, { matrix_eigenvalues } from './linalg/pkg'

await init()

const matrix = new Float64Array([
  4, -2, 1,
  3, 6, -1,
  2, 1, 8
])
const eigen = matrix_eigenvalues(matrix, 3)
console.log('Eigenvalues:', eigen)
```

---

## 8. WASI Preview 2 与组件模型

WASI Preview 2（2024 年正式发布）标志着 Wasm 从浏览器走向通用运行时。其核心是 **组件模型 (Component Model)**，定义了模块间的标准接口。[来源: Bytecode Alliance WASI Preview 2 公告, 2024]

### 8.1 组件模型 (Component Model)

组件模型允许将不同语言编译的 Wasm 模块组合成可互操作的应用：

```wit
// calculator.wit (WIT = Wasm Interface Types)
package example:calculator@1.0.0;

interface operations {
    add: func(a: f64, b: f64) -> f64;
    multiply: func(a: f64, b: f64) -> f64;
}

world calculator {
    export operations;
}
```

```rust
// Rust 实现组件
wit_bindgen::generate!({
    world: "calculator",
    path: "./calculator.wit"
});

struct Calculator;

impl exports::example::calculator::operations::Guest for Calculator {
    fn add(a: f64, b: f64) -> f64 { a + b }
    fn multiply(a: f64, b: f64) -> f64 { a * b }
}

export!(Calculator);
```

```bash
# 使用 wasm-tools 和 cargo-component 构建
cargo install cargo-component
cargo component build --release
wasm-tools compose target/wasm32-wasi/release/calculator.wasm -o calculator.component.wasm
```

### 8.2 WASI-IO / WASI-HTTP / WASI-Filesystem

WASI Preview 2 将系统能力拆分为细粒度世界 (world) 和能力 (capability)：

```wit
// HTTP 代理服务示例
package example:proxy@1.0.0;

interface handler {
    use wasi:http/types@0.2.0.{incoming-request, outgoing-response};

    handle: func(req: incoming-request) -> outgoing-response;
}

world proxy-world {
    export handler;
    import wasi:http/incoming-handler@0.2.0;
    import wasi:filesystem/types@0.2.0;
}
```

```typescript
// 使用 JCO (JavaScript Component Tools) 在 Node.js 中运行组件
import { componentize } from '@bytecodealliance/componentize-js'
import { transpile } from '@bytecodealliance/jco'

// 1. 将 JS 组件化为 Wasm Component
const { component } = await componentize(`
  export function greet(name) {
    return \`Hello, \${name} from JS Component!\`;
  }
`, {
  witSource: 'package local:pkg\nworld component { export greet: func(name: string) -> string; }'
})

await writeFile('component.wasm', component)

// 2. 使用 JCO transpile 生成 Node.js 可运行的 JS 封装
await transpile('component.wasm', {
  name: 'my-component',
  outDir: './generated'
})
```

```typescript
// 运行生成的组件
import { greet } from './generated/my-component.js'
console.log(greet('WASI')) // "Hello, WASI from JS Component!"
```

### 8.3 在 wasmtime 中运行 WASI 组件

```bash
# 安装 wasmtime
curl https://wasmtime.dev/install.sh -sSf | bash

# 运行 WASI CLI 组件
wasmtime run --wasi http calculator.component.wasm

# 限制能力（仅允许 stdout，禁止文件系统访问）
wasmtime run --wasi inherit-stdio --dir .::/sandbox:ro calculator.component.wasm
```

> wasmtime 支持 `capability-based security`，默认拒绝所有系统访问，需显式授予权限。[来源: Wasmtime 官方文档, 2025]

---

## 9. Edge WASM

### 9.1 Cloudflare Workers WASM

Cloudflare Workers 原生支持 Wasm，可在全球 300+ 边缘节点运行高性能代码：

```typescript
// worker.ts：在 Cloudflare Workers 中运行 Rust Wasm
import wasmModule from './pkg/index_bg.wasm'

// 使用 wasm-bindgen 生成的 JS 胶水
import { greet, hash_password } from './pkg/index.js'

export interface Env {
  KV: KVNamespace
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/hash') {
      const { password } = await request.json<{ password: string }>()
      // 在边缘节点运行 Rust Argon2 哈希
      const hash = hash_password(password)
      return new Response(JSON.stringify({ hash }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (url.pathname === '/greet') {
      const name = url.searchParams.get('name') || 'World'
      return new Response(greet(name))
    }

    return new Response('Not Found', { status: 404 })
  }
}
```

```bash
# 使用 wrangler 构建与部署
npm create cloudflare@latest my-worker -- --template wasm
wrangler deploy
```

> Cloudflare Workers 的 Wasm 冷启动时间通常 **< 1ms**，适合加密验证、A/B 测试算法、自定义路由逻辑。[来源: Cloudflare Workers 文档, 2024]

### 9.2 Vercel Edge Functions WASM

Vercel Edge Functions 基于 Edge Runtime，同样支持 Wasm：

```typescript
// api/edge.ts
import type { NextRequest } from 'next/server'

// 动态导入 Wasm 模块
const { compute } = await import('../pkg/vercel_edge.js')

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
  const { data } = await req.json()

  // 在边缘节点执行 WASM 计算密集型任务
  const result = compute(data)

  return new Response(JSON.stringify({ result }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60'
    }
  })
}
```

```toml
# vercel.json
{
  "functions": {
    "api/edge.ts": {
      "maxDuration": 10
    }
  }
}
```

> Vercel Edge Runtime 基于 JavaScript V8 isolates，Wasm 模块需在构建时静态导入或动态 `await import()`。[来源: Vercel Edge Runtime 文档, 2024]

---

## 10. 调试与工具链

### 10.1 Chrome DevTools WASM 调试

1. 打开 Chrome DevTools → Sources
2. 找到 `wasm` 文件，设置断点
3. 使用 `--debug` 标志编译以保留调试信息

```bash
# Rust：生成 DWARF 调试信息
wasm-pack build --dev --target web

# 或使用 rustc 直接控制
rustc --target wasm32-unknown-unknown -g -O0 lib.rs -o debug.wasm
```

在 Chrome DevTools 中：

- Sources 面板直接显示 Wasm 文本格式（WAT）
- Scope 面板可查看局部变量和内存视图
- Memory 面板可检查 Wasm Linear Memory 的十六进制内容

> Chrome 88+ 支持原生 Wasm DWARF 调试，可在 C/C++/Rust 源代码级别设置断点。[来源: Chrome Developers Blog, 2024]

### 10.2 wasmtime

Wasmtime 是 Bytecode Alliance 推出的服务器端 Wasm 运行时，完全支持 WASI：

```bash
# 运行独立 Wasm 模块
wasmtime run app.wasm --invoke main

# 作为库嵌入 Rust 应用
# Cargo.toml: wasmtime = "18.0"
```

```rust
// 使用 Wasmtime 嵌入引擎（Rust 示例）
use wasmtime::{Engine, Module, Store, Instance};

fn main() -> anyhow::Result<()> {
    let engine = Engine::default();
    let module = Module::from_file(&engine, "./guest.wasm")?;

    let mut store = Store::new(&engine, ());
    let instance = Instance::new(&mut store, &module, &[])?;

    let add = instance.get_typed_func::<(i32, i32), i32>(&mut store, "add")?;
    let result = add.call(&mut store, (1, 2))?;
    println!("1 + 2 = {}", result);

    Ok(())
}
```

### 10.3 wasmer

Wasmer 是另一款高性能 Wasm 运行时，支持多种后端（LLVM、Cranelift、Singlepass）：

```bash
# CLI 使用
wasmer run module.wasm

# 发布到 Wasmer Registry
wasmer publish
```

```typescript
// Node.js 中使用 @wasmer/sdk
import { init, Wasmer } from '@wasmer/sdk'

await init()

// 从 Wasmer Registry 运行包
const pkg = await Wasmer.fromRegistry("python/python@3.12")
const instance = await pkg.entrypoint.run({ args: ["-c", "print('Hello from Wasmer')"] })
await instance.wait()
```

> Wasmer 的 Singlepass 编译器适合 JIT 场景，编译速度极快但执行性能略低于 Cranelift。[来源: Wasmer 文档, 2024]

### 10.4 性能分析

```typescript
// 测量 Wasm 调用耗时
const start = performance.now()
const result = wasm.exports.heavyComputation()
const duration = performance.now() - start
console.log(`Wasm execution: ${duration.toFixed(2)}ms`)
```

```typescript
// 使用 Chrome Performance API 分析内存增长
const memory = wasm.exports.memory as WebAssembly.Memory

setInterval(() => {
  const pages = memory.buffer.byteLength / (64 * 1024)
  console.log(`Wasm memory pages: ${pages}`)
}, 1000)
```

---

## 11. 2026 趋势与展望

WebAssembly 生态在 2025–2026 年呈现以下关键趋势：

### 11.1 组件模型标准化

- **WASI Preview 2** 已获主流运行时（wasmtime、wasmer、WAMR）支持
- **WIT (Wasm Interface Types)** 成为跨语言接口定义的事实标准
- 2026 年，组件模型将进入 **W3C 推荐阶段 (Recommendation)**，彻底打通多语言互操作壁垒

### 11.2 WASI 普及与扩展

| WASI 提案 | 状态 | 应用场景 |
|-----------|------|----------|
| WASI-IO | 稳定 | 标准输入输出流 |
| WASI-HTTP | 稳定 | 边缘 HTTP 服务 |
| WASI-Filesystem | 稳定 | 沙箱文件系统 |
| WASI-Sockets | 草案 | 网络套接字 |
| WASI-Threads | 草案 | 多线程 Wasm |

### 11.3 WASM 作为通用运行时

- **容器替代方案**：Docker 与 wasmtime 集成 (`docker run --runtime=io.containerd.wasm.v1`) 使 Wasm 成为微服务的轻量级运行时
- **Serverless 2.0**：FaaS 平台（AWS Lambda、Azure Functions、Cloudflare Workers）均支持 Wasm，冷启动比传统容器快 **100x**
- **插件系统**：Extism 等框架使用 Wasm 作为跨语言插件运行时，实现安全的第三方扩展

```rust
// Extism 插件示例：用 Rust 编写，任意宿主语言加载
#[plugin_fn]
pub fn analyze(input: String) -> FnResult<String> {
    let word_count = input.split_whitespace().count();
    Ok(format!("Word count: {}", word_count))
}
```

```typescript
// 宿主（JS/TS）加载 Extism 插件
import { createPlugin } from '@extism/extism'

const plugin = await createPlugin('https://example.com/plugin.wasm')
const output = await plugin.call('analyze', 'Hello WASM plugin system')
console.log(output) // "Word count: 3"
```

> 据 Bytecode Alliance 2025 年度报告，Wasm 组件模型的企业采用率同比增长 **340%**，金融、电信和边缘计算是前三大应用行业。[来源: Bytecode Alliance Annual Report, 2025]

---

## 12. 安全注意事项

- **同源策略**：Wasm 模块遵循与 JS 相同的 CORS 规则
- **内存安全**：Wasm 无法直接访问 JS 内存，但可通过共享 ArrayBuffer 交换数据
- **代码签名**：生产环境建议对 Wasm 模块进行校验和验证

```typescript
// Wasm 模块完整性校验
async function verifyWasmIntegrity(
  url: string,
  expectedHash: string
): Promise<ArrayBuffer> {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  if (hashHex !== expectedHash) {
    throw new Error(`Wasm integrity check failed: expected ${expectedHash}, got ${hashHex}`)
  }
  return buffer
}
```

- **WASI 沙箱**：服务器端使用 WASI 限制文件系统/网络访问

```bash
# wasmtime 能力限制：仅允许读取 /data 目录
wasmtime run --dir /data::/data:ro app.wasm
```

---

> **关联文档**
>
> - `jsts-code-lab/36-web-assembly/` — WebAssembly 实战代码示例
> - [构建工具对比](../comparison-matrices/build-tools-compare.md)
> - [性能优化指南](./getting-started.md)
