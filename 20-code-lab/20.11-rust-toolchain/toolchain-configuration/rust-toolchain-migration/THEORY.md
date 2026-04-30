# Rust 工具链迁移

> **定位**：`20-code-lab/20.11-rust-toolchain/toolchain-configuration/rust-toolchain-migration`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 Rust 工具链在 JavaScript 生态系统中的升级与迁移问题。涵盖 Edition 迁移、MSRV（Minimum Supported Rust Version）管理和构建流程的平滑过渡。

### 1.2 形式化基础

Rust Edition 是语言的向后兼容快照。形式化上，Edition `N` 定义了语法和 borrow checker 的规则集合 `R_N`，编译器通过 `--edition` 标志选择规则集。关键性质：`R_N ⊂ R_{N+1}`（语义保持），即 Edition `N` 代码在 `N+1` 下编译结果不变，但可能触发新的 lint 或弃用警告。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| Edition | 不破坏兼容性的语言演进机制 | edition-guide.md |
| MSRV |  crate 承诺支持的最低 Rust 版本 | msrv-policy.md |
| cargo fix | 自动应用 Edition 迁移建议 | migration-scripts/ |

---

## 二、设计原理

### 2.1 为什么存在

Rust 承诺长期稳定性，但语言需要演进。Edition 机制允许在不破坏现有代码的前提下引入不兼容的语法改进（如 Rust 2021 的闭包捕获规则改进、Rust 2024 的 `gen` 关键字）。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 自动迁移 (cargo fix) | 快速、低风险 | 复杂场景需手动调整 | Edition 升级 |
| 手动迁移 | 精确控制 | 耗时、易遗漏 | 深度定制代码库 |
| 锁定旧版 | 无迁移成本 | 无法使用新特性 / 安全修复 | 遗留维护项目 |

### 2.3 与相关技术的对比

| 维度 | Rust Edition | Python 2→3 | Java LTS | Node.js LTS |
|------|--------------|------------|----------|-------------|
| 兼容性策略 | 同编译器多 Edition | 完全断裂 | 向后兼容 | SemVer 主版本 |
| 自动迁移工具 | `cargo fix` | `2to3` / `six` | 无（自然兼容） | N/A |
| 并行共存 | ✅ 同 crate 可混用 | ❌ | ✅ | ✅ |
| 生命周期 | 3 年左右 | 永久断裂 | 长期支持 | 3 年 Active |
| 迁移强制性 | 可选（旧 Edition 长期支持） | 强制（2 已 EOL） | 无 | 无 |
| 工具链锁定 | `rust-toolchain.toml` | `requirements.txt` | 无 | `package.json` |

与 Node-API (C++) 对比：Rust 内存安全但学习曲线更陡。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 Rust 工具链迁移 核心机制的理解，并观察不同实现选择带来的行为差异。

#### 可运行示例：Edition 迁移配置与 CI 集成

```toml
# rust-toolchain.toml — 团队级工具链锁定
[toolchain]
channel = "1.79.0"        # 锁定具体版本，避免 CI 与本地行为不一致
components = ["rustfmt", "clippy", "rust-src"]
targets = ["wasm32-unknown-unknown", "x86_64-pc-windows-msvc"]
profile = "default"
```

```toml
# Cargo.toml — Edition 与 MSRV 声明
[package]
name = "my-js-binding"
version = "0.1.0"
edition = "2021"          # 明确声明 Edition
rust-version = "1.70"     # MSRV：保证在此版本及以上可编译

[dependencies]
# 使用语义化版本锁定，配合 Cargo.lock
napi = "2"
serde = { version = "1", features = ["derive"] }

[workspace.metadata.cargo-machete]
ignored = ["serde"]       # 避免误报未使用依赖
```

```yaml
# .github/workflows/rust.yml — CI 中的 MSRV 与 Edition 检查
name: Rust CI

on: [push, pull_request]

jobs:
  check:
    strategy:
      matrix:
        rust: [stable, beta, "1.70.0"]  # 显式测试 MSRV
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{ matrix.rust }}
          components: clippy, rustfmt
      - run: cargo fmt -- --check
      - run: cargo clippy --all-targets --all-features -- -D warnings
      - run: cargo test
      - run: cargo check --all-features
        if: matrix.rust == '1.70.0'       # MSRV 验证
```

```bash
#!/bin/bash
# migrate-edition.sh — Edition 迁移脚本示例
set -e

TARGET_EDITION="2021"

echo "=== Step 1: 更新 Cargo.toml edition ==="
sed -i.bak "s/^edition = .*/edition = \"${TARGET_EDITION}\"/" Cargo.toml

echo "=== Step 2: cargo fix 自动修复 ==="
cargo fix --edition --allow-dirty --allow-staged

echo "=== Step 3: cargo clippy 检查新 lint ==="
cargo clippy --all-targets --all-features -- -D warnings

echo "=== Step 4: 运行测试套件 ==="
cargo test

echo "=== Step 5: 检查废弃 API ==="
cargo check --features deprecated-check || true

echo "=== Migration to ${TARGET_EDITION} complete ==="
```

```javascript
// scripts/check-msrv.js — JS 生态中调用 Rust 前的版本检查（Node.js）
const { execSync } = require('child_process');

const REQUIRED_MSRV = '1.70.0';

function parseVersion(v) {
  return v.split('.').map(Number);
}

function cmp(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

try {
  const raw = execSync('rustc --version', { encoding: 'utf8' });
  const match = raw.match(/rustc (\d+\.\d+\.\d+)/);
  if (!match) throw new Error('Cannot parse rustc version');
  const current = parseVersion(match[1]);
  const required = parseVersion(REQUIRED_MSRV);
  if (cmp(current, required) < 0) {
    console.error(`Error: Rust ${match[1]} installed, but MSRV is ${REQUIRED_MSRV}`);
    console.error('Please run: rustup update');
    process.exit(1);
  }
  console.log(`Rust ${match[1]} satisfies MSRV ${REQUIRED_MSRV}`);
} catch (e) {
  console.error('Rust not found. Install via https://rustup.rs/');
  process.exit(1);
}
```

#### napi-rs Node 扩展绑定示例

```rust
// src/lib.rs — 将 Rust 函数暴露给 Node.js
use napi_derive::napi;

#[napi]
pub fn fibonacci(n: u32) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

#[napi(object)]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

#[napi]
pub fn distance(a: &Point, b: &Point) -> f64 {
    ((b.x - a.x).powi(2) + (b.y - a.y).powi(2)).sqrt()
}
```

```typescript
// __test__/index.spec.ts — Node.js 侧调用 Rust 绑定
import { fibonacci, distance, Point } from '../index';

describe('Rust bindings', () => {
  it('fibonacci works', () => {
    expect(fibonacci(10)).toBe(55);
  });

  it('distance works', () => {
    const a: Point = { x: 0, y: 0 };
    const b: Point = { x: 3, y: 4 };
    expect(distance(a, b)).toBeCloseTo(5.0);
  });
});
```

#### WASM 打包配置与加载

```toml
# wasm/Cargo.toml — WASM 目标配置
[package]
name = "wasm-utils"
version = "0.1.0"
edition = "2021"
rust-version = "1.70"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
serde = { version = "1", features = ["derive"] }
serde-wasm-bindgen = "0.6"

[profile.release]
opt-level = 3
lto = true
```

```rust
// wasm/src/lib.rs
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct AnalysisResult {
    pub word_count: usize,
    pub char_count: usize,
}

#[wasm_bindgen]
pub fn analyze_text(input: &str) -> JsValue {
    let result = AnalysisResult {
        word_count: input.split_whitespace().count(),
        char_count: input.chars().count(),
    };
    serde_wasm_bindgen::to_value(&result).unwrap()
}
```

```typescript
// web/load-wasm.ts — 浏览器中加载 WASM
async function loadWasm() {
  const { analyze_text } = await import('./pkg/wasm_utils.js');
  const result = analyze_text('Hello WASM world') as {
    word_count: number;
    char_count: number;
  };
  console.log(result.word_count, result.char_count); // 3 16
}
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| Rust 完全替代 Node C++ 扩展 | Rust 是选项之一，需评估团队技能栈 |
| WASM 比原生绑定更快 | 边界开销使 WASM 在小计算量时不占优 |
| cargo fix 能解决所有迁移问题 | 语义变更（如闭包捕获）可能需要人工审查 |

### 3.3 扩展阅读

- [Rust Edition Guide](https://doc.rust-lang.org/edition-guide/)
- [Cargo Book: The Manifest Format](https://doc.rust-lang.org/cargo/reference/manifest.html)
- [rustup 文档](https://rust-lang.github.io/rustup/)
- [Semantic Versioning in Rust (Cargo)](https://doc.rust-lang.org/cargo/reference/semver.html)
- [napi-rs 文档](https://napi.rs/) — Node.js 原生扩展 Rust 绑定
- [wasm-bindgen Guide](https://rustwasm.github.io/wasm-bindgen/) — Rust/WASM/JS 互操作
- [Rust Language Cheat Sheet](https://cheats.rs/) — 快速参考
- [The Rust Performance Book](https://nnethercote.github.io/perf-book/) — 性能优化指南
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/) — 交互式学习
- [Crates.io](https://crates.io/) — Rust 包注册中心
- [Rustup Components History](https://rust-lang.github.io/rustup-components-history/) — 工具链组件可用性
- [This Week in Rust](https://this-week-in-rust.org/) — Rust 社区周刊
- `30-knowledge-base/30.10-native`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*

## 深化补充

### 新增代码示例：cargo-outdated 集成与 MSRV CI 检查

```bash
#!/bin/bash
# check-msrv.sh — 在 CI 中验证 MSRV

set -e
MSRV="1.70.0"

echo "=== Checking MSRV: $MSRV ==="
rustup install "$MSRV"
cargo +"$MSRV" check --all-targets --all-features

echo "=== Running cargo-outdated ==="
cargo install cargo-outdated
cargo outdated --exit-code 1
```

```yaml
# .github/workflows/msrv.yml
name: MSRV Check
on: [pull_request]
jobs:
  msrv:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: 1.70.0
      - run: cargo check --all-features
      - run: cargo test
```

### 权威外部链接扩展

| 资源 | 链接 | 说明 |
|------|------|------|
| Rust Edition Guide | [doc.rust-lang.org/edition-guide](https://doc.rust-lang.org/edition-guide/) | Edition 迁移官方指南 |
| Cargo SemVer | [doc.rust-lang.org/cargo/reference/semver.html](https://doc.rust-lang.org/cargo/reference/semver.html) | Cargo 语义化版本 |
| rustup components history | [rust-lang.github.io/rustup-components-history](https://rust-lang.github.io/rustup-components-history/) | 组件可用性历史 |
| This Week in Rust | [this-week-in-rust.org](https://this-week-in-rust.org/) | 社区周刊 |
| cargo-outdated | [github.com/kbknapp/cargo-outdated](https://github.com/kbknapp/cargo-outdated) | 依赖更新检查 |
| cargo-msrv | [github.com/foresterre/cargo-msrv](https://github.com/foresterre/cargo-msrv) | MSRV 自动查找 |
| Rust Release Blog | [blog.rust-lang.org](https://blog.rust-lang.org/) | 官方发布博客 |
