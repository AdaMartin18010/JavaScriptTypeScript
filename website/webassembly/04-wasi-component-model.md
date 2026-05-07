# 04. WASI 与 Component Model

> 从浏览器到服务端：WASI Preview 2、WIT 接口定义与能力安全模型。

---

## WASI 演进路线

```mermaid
flowchart LR
    P0[WASI Preview 0<br/>2019] --> P1[WASI Preview 1<br/>模块化系统调用]
    P1 --> P2[WASI Preview 2<br/>Component Model]
    P2 --> P3[WASI Preview 3<br/>异步/IO_uring]
```

---

## WASI Preview 1

基于模块化系统调用的 POSIX 子集：

```rust
use std::fs::File;
use std::io::{self, Read};

fn main() -> io::Result<()> {
    let mut file = File::open("/data/input.txt")?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    println!("{}", contents);
    Ok(())
}
```

编译为 WASI 目标：

```bash
rustup target add wasm32-wasi
cargo build --target wasm32-wasi
```

运行时执行：

```bash
wasmtime run target/wasm32-wasi/debug/app.wasm --dir /data
```

---

## WASI Preview 2：Component Model

### 核心概念

**Component** = Wasm 模块 + 接口定义 + 能力声明

```wit
// calculator.wit
package example:calculator;

interface operations {
    add: func(a: s32, b: s32) -> s32;
    mul: func(a: s32, b: s32) -> s32;
}

world calculator-world {
    export operations;
}
```

### 实现 Component

```rust
// src/lib.rs
wit_bindgen::generate!({
    world: "calculator-world",
    path: "wit"
});

struct Calculator;

impl exports::example::calculator::operations::Guest for Calculator {
    fn add(a: i32, b: i32) -> i32 { a + b }
    fn mul(a: i32, b: i32) -> i32 { a * b }
}

export!(Calculator);
```

### 组合与调用

```bash
# 编译为 Component
wasm-tools component new target/wasm32-wasi/debug/app.wasm -o app.component.wasm

# 运行时调用
wasmtime run app.component.wasm
```

---

## 能力安全模型

与传统 POSIX "所有或 nothing" 不同，WASI 采用**细粒度能力授权**：

```bash
# 传统：运行时拥有全部权限
wasmtime run app.wasm

# WASI：显式授予所需能力
wasmtime run app.wasm \
  --dir /data::/data \
  --env KEY=VALUE \
  --tcp-listen localhost:8080
```

| 能力 | 说明 |
|------|------|
| `--dir` | 文件系统目录访问 |
| `--env` | 环境变量 |
| `--tcp-listen` | 网络监听 |
| `--clock` | 时间戳访问 |
| `--stdio` | 标准输入输出 |

---

## 主流运行时对比

| 运行时 | 支持版本 | 特点 |
|--------|----------|------|
| **Wasmtime** | Preview 2 | Bytecode Alliance 官方，Rust 编写 |
| **Wasmer** | Preview 2 | 多后端（LLVM、Cranelift、Singlepass） |
| **WasmEdge** | Preview 2 | 高性能，支持 AI 推理插件 |
| **WAMR** | Preview 1 | 微控制器/嵌入式，体积极小 |
| **JCO** | Preview 2 | JavaScript 组件工具链（Node.js/Browser） |
