# 05. 浏览器集成与 JS 互操作

> SharedArrayBuffer、Worker、零拷贝模式与 JSPI：打通 JS 与 Wasm 的高性能通道。

---

## 加载 Wasm 模块的四种方式

### 1. 直接实例化（适合小型模块）

```typescript
const wasmBuffer = await fetch('./module.wasm').then(r => r.arrayBuffer());
const wasmModule = await WebAssembly.instantiate(wasmBuffer, {
  env: { memory: new WebAssembly.Memory({ initial: 256 }) }
});
wasmModule.instance.exports.add(1, 2);
```

### 2. Streaming 编译（推荐）

```typescript
const wasmModule = await WebAssembly.instantiateStreaming(
  fetch('./module.wasm'),
  importObject
);
```

> Streaming 编译在下载的同时解析 Wasm，减少 TTI（Time to Interactive）。

### 3. wasm-bindgen 集成（Rust）

```typescript
import init, { process_image } from './pkg/image_processor.js';

await init();
const result = process_image(imageData);
```

### 4. JCO（Component Model in JS）

```typescript
import { instantiate } from '@bytecodealliance/jco';

const component = await instantiate(
  fetch('./app.component.wasm'),
  {
    'wasi:cli/stdout@0.2.0': { getStdout: () => console.log }
  }
);
```

---

## 零拷贝数据传输

Wasm 与 JS 之间最大的性能瓶颈是**数据复制**。解决方案：

### SharedArrayBuffer

```typescript
// 创建共享内存
const sharedMemory = new WebAssembly.Memory({
  initial: 1,
  maximum: 4,
  shared: true  // 关键！
});

// Worker 中直接操作同一块内存
const worker = new Worker('worker.js');
worker.postMessage({ memory: sharedMemory.buffer }, [sharedMemory.buffer]);

// worker.js
self.onmessage = (e) => {
  const buffer = e.data.memory;
  const uint8 = new Uint8Array(buffer);
  // 直接读写，零拷贝！
};
```

### Transferable Objects

```typescript
const array = new Uint8Array(1024 * 1024);
worker.postMessage({ data: array }, [array.buffer]);
// array.buffer 被转移，主线程不再可用
```

---

## JSPI：JavaScript Promise Integration

Wasm 模块同步调用异步 JS API 的提案：

```rust
// Rust 代码（使用 wasm-bindgen-futures）
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;

#[wasm_bindgen]
pub async fn fetch_data(url: String) -> Result<String, JsValue> {
    let window = web_sys::window().unwrap();
    let resp = JsFuture::from(window.fetch_with_str(&url)).await?;
    let resp: web_sys::Response = resp.dyn_into()?;
    let text = JsFuture::from(resp.text()?).await?;
    Ok(text.as_string().unwrap())
}
```

JS 侧调用：

```typescript
import { fetch_data } from './pkg/app.js';

// 异步调用 Rust 函数
const html = await fetch_data('https://api.example.com/data');
```

---

## 性能优化清单

| 优化项 | 策略 |
|--------|------|
| 减少边界穿越 | 批量处理数据，减少 JS↔Wasm 调用次数 |
| 预分配内存 | 避免 Wasm 内存增长导致的 ArrayBuffer 失效 |
| 使用 TypedArray | 直接读写 Wasm 内存，避免字符串转换 |
| SIMD | 使用 128 位向量指令加速计算 |
| Streaming | `instantiateStreaming` 减少加载延迟 |
| 缓存模块 | `WebAssembly.Module` 可缓存，避免重复编译 |
