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
- `30-knowledge-base/30.10-native`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
