# Rust 工具链

> **定位**：`20-code-lab/20.11-rust-toolchain`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 Rust 工具链在 JavaScript 生态系统中的集成问题。涵盖 napi-rs、WASM 绑定和构建流程优化。

### 1.2 形式化基础

Rust 的所有权系统可形式化为区域类型（Region Typing）`Γ; Σ ⊢ e : τ`，其中 `Σ` 为所有权上下文，确保任何时刻对堆数据最多存在一个可变引用或任意数量不可变引用。这一线性类型约束通过借用检查器（Borrow Checker）在编译期验证，零运行时成本地消除数据竞争和 use-after-free。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| napi-rs | Rust 与 Node.js 的 FFI 绑定框架 | napi-examples/ |
| cargo-cp-artifact | 构建产物的自动复制工具 | build.rs |
| wasm-bindgen | Rust 与 WebAssembly 的高级绑定工具 | wasm-examples/ |
| rust-toolchain.toml | 工具链版本锁定与组件配置 | toolchain-configuration/ |

---

## 二、设计原理

### 2.1 为什么存在

Rust 提供了内存安全和并发安全的保证，同时性能接近 C++。将其引入 JS 生态可以显著提升计算密集型模块的可靠性和性能。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| napi-rs | 类型安全绑定、预编译发布 | 额外学习成本 | Node.js 原生扩展 |
| WASM 编译 | 跨平台、沙箱安全、浏览器可用 | 边界开销、无直接文件系统访问 | 浏览器端、跨平台 CLI |
| Node-API (C++) | 官方维护、生态成熟 | 手动内存管理、UB 风险高 | 遗留 C++ 资产复用 |

### 2.3 与相关技术的对比

| 维度 | napi-rs | neon | wasm-bindgen | wasmer-js | Node-API (C++) |
|------|---------|------|--------------|-----------|----------------|
| 绑定语言 | Rust | Rust | Rust | 任意 WASM | C / C++ |
| 目标平台 | Node.js | Node.js | Web / Node | Web / Node | Node.js |
| 类型安全 | 优秀（宏生成） | 良好 | 优秀 | 需手动封装 | 手动 |
| 异步支持 | 原生（`async`/`Promise`） | 中等 | Promise | 中等 | 手动 |
| 预编译发布 | cargo-napi | neon-cli | wasm-pack | 无需 | node-gyp |
| 维护活跃度 | 高 | 中 | 高 | 中 | 高（Node 官方） |
| 学习曲线 | 中 | 中 | 中 | 低 | 高 |

与 Node-API (C++) 对比：Rust 内存安全但学习曲线更陡；WASM 在浏览器场景不可替代。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 Rust 工具链核心机制的理解，并观察不同实现选择带来的行为差异。

#### 可运行示例：napi-rs 最小可工作模块

```rust
// src/lib.rs — napi-rs 最小模块，需配合 Cargo.toml 使用
// 依赖：napi = "2", napi-derive = "2", napi-build = "2"

use napi_derive::napi;

/// 斐波那契数列（Rust 实现）
#[napi]
pub fn fibonacci(n: u32) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => {
            let mut a = 0u64;
            let mut b = 1u64;
            for _ in 2..=n {
                let next = a + b;
                a = b;
                b = next;
            }
            b
        }
    }
}

/// 并行求和（演示 Rust 并发安全）
#[napi]
pub fn parallel_sum(numbers: Vec<f64>) -> f64 {
    use rayon::prelude::*;
    numbers.par_iter().sum()
}
```

```javascript
// index.js — JS 端调用示例（运行前需执行 napi build）
const { fibonacci, parallelSum } = require('./index.node');

console.time('fibonacci(40)');
console.log('Result:', fibonacci(40)); // 102334155
console.timeEnd('fibonacci(40)');

console.time('parallelSum');
console.log('Sum:', parallelSum(Array.from({ length: 1_000_000 }, (_, i) => i)));
console.timeEnd('parallelSum');
```

```toml
# Cargo.toml
[package]
name = "my-napi-module"
version = "0.1.0"
edition = "2021"

[dependencies]
napi = { version = "2", features = ["napi8"] }
napi-derive = "2"
rayon = "1"

[build-dependencies]
napi-build = "2"

[lib]
crate-type = ["cdylib"]
```

```rust
// build.rs
fn main() {
    napi_build::setup();
}
```

#### WASM 绑定示例：wasm-bindgen + JS 交互

```rust
// src/lib.rs — wasm-bindgen 模块
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[wasm_bindgen]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

#[wasm_bindgen]
impl Point {
    #[wasm_bindgen(constructor)]
    pub fn new(x: f64, y: f64) -> Point {
        Point { x, y }
    }

    pub fn distance(&self, other: &Point) -> f64 {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        (dx * dx + dy * dy).sqrt()
    }
}
```

```javascript
// index.mjs — 浏览器或 Node.js (with wasm-pack) 调用
import init, { add, Point } from './pkg/rust_wasm.js';

await init();

console.log(add(1, 2)); // 3

const p1 = new Point(0, 0);
const p2 = new Point(3, 4);
console.log(p1.distance(p2)); // 5
```

```toml
# Cargo.toml (WASM)
[package]
name = "rust-wasm"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
wasm-bindgen = "0.2"
```

#### Rust 工具链锁定配置

```toml
# rust-toolchain.toml
[toolchain]
channel = "stable"
components = ["rustfmt", "clippy", "rust-src"]
targets = ["wasm32-unknown-unknown", "x86_64-pc-windows-msvc"]
profile = "default"
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| Rust 完全替代 Node C++ 扩展 | Rust 是选项之一，需评估团队技能栈与构建复杂度 |
| WASM 比原生绑定更快 | 边界序列化开销使 WASM 在小计算量时不占优；适合跨平台与沙箱场景 |
| 忽略 `rust-toolchain.toml` 的版本锁定 | 团队应统一工具链，避免 CI 与本地行为不一致 |

### 3.3 扩展阅读

- [napi-rs 官方文档](https://napi.rs/)
- [The Rust Programming Language Book](https://doc.rust-lang.org/book/)
- [The Rustonomicon — 高级 Rust 编程](https://doc.rust-lang.org/nomicon/)
- [wasm-bindgen Guide](https://rustwasm.github.io/wasm-bindgen/)
- [WebAssembly Specification — W3C](https://webassembly.github.io/spec/core/)
- [Cargo 官方文档](https://doc.rust-lang.org/cargo/)
- [Rust FFI 安全指南 — Rustnomicon](https://doc.rust-lang.org/nomicon/ffi.html)
- [Node-API 官方文档 — Node.js](https://nodejs.org/api/n-api.html)
- [rayon — 数据并行库](https://github.com/rayon-rs/rayon)
- `30-knowledge-base/30.10-native`

---

### napi-rs 错误处理与异步 API

```rust
use napi::bindgen_prelude::*;
use napi_derive::napi;

#[napi]
pub fn safe_divide(a: f64, b: f64) -> Result<f64> {
  if b == 0.0 { return Err(Error::from_reason("division by zero")); }
  Ok(a / b)
}

#[napi]
pub async fn fetch_data(url: String) -> Result<String> {
  let body = reqwest::get(&url).await.map_err(|e| Error::from_reason(e.to_string()))?
    .text().await.map_err(|e| Error::from_reason(e.to_string()))?;
  Ok(body)
}
```

```javascript
const { safeDivide, fetchData } = require('./index.node');
try { safeDivide(10, 0); } catch (err) { console.error(err.message); }
fetchData('https://api.example.com/data').then(console.log);
```

### Cargo Workspace 多 crate 配置

```toml
[workspace]
members = ["packages/napi-native", "packages/wasm-bindings"]
resolver = "2"

[workspace.dependencies]
napi = { version = "2", features = ["napi8"] }
napi-derive = "2"
wasm-bindgen = "0.2"
```

---

## 更多权威参考链接

- [napi-rs 异步任务指南](https://napi.rs/docs/concepts/async-task) — 异步模式详解
- [Rustnomicon: FFI](https://doc.rust-lang.org/nomicon/ffi.html) — 不安全 FFI 编程指南
- [wasm-pack 指南](https://rustwasm.github.io/wasm-pack/book/) — WASM 包构建与发布
- [Cargo Workspaces](https://doc.rust-lang.org/cargo/reference/workspaces.html) — 官方工作区配置参考
- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/) — 官方 API 设计准则
- [The Rust Performance Book](https://nnethercote.github.io/perf-book/) — Rust 性能优化

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
