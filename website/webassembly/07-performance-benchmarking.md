# 07. 性能优化与基准测试

> 诊断 Wasm 与 JS 的边界开销、利用 SIMD 和 Streaming 编译榨取极限性能。

---

## JS vs Wasm 性能基线

| 场景 | JS (V8) | Wasm | 加速比 |
|------|---------|------|--------|
| Fibonacci(40) | 1.2s | 0.8s | 1.5x |
| SHA-256 (1MB) | 45ms | 8ms | 5.6x |
| PNG 解码 | 120ms | 35ms | 3.4x |
| 矩阵乘法 (1024²) | 2.5s | 0.6s | 4.2x |
| JSON 解析 | 15ms | 22ms | 0.7x ⚠️ |

> ⚠️ **JSON 解析在 Wasm 中反而更慢**：字符串处理是 Wasm 的弱项，此类任务留在 JS 中更高效。

---

## 边界开销诊断

JS ↔ Wasm 每次调用的固定开销约为 **50-200ns**（现代浏览器）。当调用频率 > 1M/s 时，总开销显著。

### 优化策略：批量处理

```rust
// 差：每次调用处理一个像素
#[wasm_bindgen]
pub fn process_pixel(r: u8, g: u8, b: u8) -> u8 {
    grayscale(r, g, b)
}

// 好：一次处理整个图像
#[wasm_bindgen]
pub fn process_image(data: &[u8], width: u32, height: u32) -> Vec<u8> {
    let mut output = vec![0u8; data.len()];
    for y in 0..height {
        for x in 0..width {
            let i = ((y * width + x) * 4) as usize;
            output[i] = grayscale(data[i], data[i+1], data[i+2]);
            output[i+3] = data[i+3]; // alpha
        }
    }
    output
}
```

---

## SIMD 加速

Wasm SIMD（128 位向量）对图像/音频处理至关重要：

```rust
#[cfg(target_arch = "wasm32")]
use std::arch::wasm32::*;

pub fn simd_grayscale(input: &[u8], output: &mut [u8]) {
    unsafe {
        for chunk in input.chunks_exact(64) {
            let v = v128_load(chunk.as_ptr() as *const v128);
            // ... SIMD 操作
            v128_store(output.as_mut_ptr() as *mut v128, v);
        }
    }
}
```

编译时启用 SIMD：

```bash
RUSTFLAGS="-C target-feature=+simd128" wasm-pack build
```

---

## Streaming 编译

```typescript
// 差：先下载完，再编译
const buffer = await fetch(url).then(r => r.arrayBuffer());
const module = await WebAssembly.compile(buffer);

// 好：流式编译
const module = await WebAssembly.compileStreaming(fetch(url));
// 或一步到位
const { instance } = await WebAssembly.instantiateStreaming(fetch(url), imports);
```

---

## 内存管理优化

### 避免内存增长失效

```typescript
const memory = new WebAssembly.Memory({ initial: 256 });
const uint8 = new Uint8Array(memory.buffer);

// 危险：当 Wasm 调用 memory.grow() 时，buffer 会被替换
wasm.grow_memory();  // 旧 buffer 失效！
uint8[0] = 1;  // 可能写入错误的内存

// 安全：重新获取 buffer
const newUint8 = new Uint8Array(memory.buffer);
```

### 预分配策略

```rust
#[wasm_bindgen]
pub struct ImageProcessor {
    buffer: Vec<u8>,
}

#[wasm_bindgen]
impl ImageProcessor {
    pub fn new(max_size: usize) -> Self {
        Self { buffer: vec![0; max_size] }
    }

    pub fn process(&mut self, input: &[u8]) -> &[u8] {
        self.buffer[..input.len()].copy_from_slice(input);
        // 原地处理
        &self.buffer[..input.len()]
    }
}
```

---

## 基准测试工具

| 工具 | 用途 |
|------|------|
| **Benchmark.js** | 浏览器端 JS/Wasm 对比 |
| **criterion.rs** | Rust 基准测试（`wasm32` 目标） |
| **Chrome DevTools** | Performance 面板分析 Wasm 调用栈 |
| **Firefox Profiler** |  Wasm 函数级火焰图 |
