# 06. 边缘计算中的 Wasm

> Cloudflare Workers、Fastly Compute@Edge、WasmEdge 与 Spin 的实战对比。

---

## 为什么边缘计算选择 Wasm

| 维度 | 传统容器 | Wasm |
|------|----------|------|
| 冷启动 | 100ms - 数秒 | < 1ms |
| 内存占用 | 100MB+ | < 10MB |
| 隔离级别 | OS 级 (heavy) | 沙箱级 (light) |
| 可移植性 | 架构绑定 | 跨平台二进制 |
| 安全模型 | Linux namespace | 能力安全 |

---

## Cloudflare Workers

V8 Isolate + Wasm 运行 JavaScript 和 Wasm：

```typescript
// worker.ts
import wasmModule from './image.wasm';

export default {
  async fetch(request: Request): Promise<Response> {
    const module = await WebAssembly.instantiate(wasmModule);
    const { resize } = module.instance.exports;

    const imageData = await request.arrayBuffer();
    // ... 写入 Wasm 内存并调用 resize

    return new Response(processedImage, {
      headers: { 'Content-Type': 'image/webp' }
    });
  }
};
```

部署：

```bash
wrangler deploy
```

限制：
- 免费版：10ms CPU 时间 / 请求
- 付费版：50ms CPU 时间 / 请求
- Wasm 模块大小 ≤ 1MB（压缩后）

---

## Fastly Compute@Edge

原生 Wasm 运行时（基于 Lucet → Wasmtime）：

```rust
// src/main.rs
use fastly::http::{StatusCode, Mime};
use fastly::{Error, Request, Response};

#[fastly::main]
fn main(req: Request) -> Result<Response, Error> {
    // Wasm 模块在编译时嵌入
    Ok(Response::from_status(StatusCode::OK)
        .with_content_type(Mime::TEXT_HTML)
        .with_body("Hello from Fastly Wasm!"))
}
```

优势：
- 无 V8 开销，纯 Wasm 执行
- 支持 WASI Preview 2
- 10MB 模块大小限制

---

## WasmEdge

CNCF 沙箱项目，高性能 Wasm 运行时：

```bash
# 安装
curl -sSf https://raw.githubusercontent.com/WasmEdge/WasmEdge/master/utils/install.sh | bash

# 运行
wasmedge app.wasm

# 带插件（AI 推理）
wasmedge --dir .:. app.wasm
```

### AI 推理插件

```rust
use wasmedge_tensorflow_interface::*;

fn main() {
    let model_data = include_bytes!("model.tflite");
    let image = image_to_tensor("image.jpg", 224, 224);
    let labels = include_str!("labels.txt");

    let mut session = TfLiteSession::new(model_data, TfLiteType::F32);
    session.add_input("input", &image);
    session.run();
    let output = session.get_output("output");
    // 解析分类结果
}
```

---

## 框架：Spin

Fermyon 开发的 Wasm 微服务框架：

```bash
# 安装
curl -fsSL https://developer.fermyon.com/downloads/install.sh | bash

# 创建 HTTP 触发器应用
spin new http-rust hello-spin
```

```rust
// src/lib.rs
use spin_sdk::http::{IntoResponse, Request, Response};
use spin_sdk::http_component;

#[http_component]
fn handle_hello(req: Request) -> anyhow::Result<impl IntoResponse> {
    Ok(Response::builder()
        .status(200)
        .header("Content-Type", "text/plain")
        .body("Hello from Spin!")
        .build())
}
```

部署：

```bash
spin build
spin deploy
```

---

## 选型决策矩阵

| 平台 | 语言 | 冷启动 | 限制 | 最佳场景 |
|------|------|--------|------|----------|
| **Cloudflare Workers** | JS/TS + Wasm | ~0ms | 50ms CPU | 低延迟 API、边缘渲染 |
| **Fastly** | Rust/Go/JS | ~0ms | 10MB Wasm | 高吞吐量、安全敏感 |
| **WasmEdge** | 任意 WASI | ~1ms | 自托管 | 私有化部署、AI 推理 |
| **Spin** | Rust/Go/TS | ~1ms | Fermyon Cloud | 微服务、事件驱动 |
