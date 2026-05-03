---
title: "Rust 工具链实验：NAPI-RS 原生模块开发"
description: "使用 NAPI-RS 将 Rust 编译为 Node.js 原生模块：项目搭建、类型映射、异步API与发布"
date: 2026-05-03
tags: ["实验", "Rust", "NAPI-RS", "原生模块", "Node.js", "性能优化"]
category: "code-lab"
---

# Rust 工具链实验：NAPI-RS 原生模块开发

> 预计用时：60 分钟 | 难度：🌿 中级

## 实验目标

1. 搭建 NAPI-RS 开发环境
2. 编写 Rust 函数并暴露给 Node.js
3. 实现同步和异步 API
4. 编译、测试和发布原生模块

## 环境准备

```bash
# 确保已安装 Rust
rustc --version

# 安装 Node.js 依赖
npm install -g @napi-rs/cli

# 创建项目
napi new native-utils
# 选择: TypeScript, npm, 平台选择当前系统
```

## 项目结构

```
native-utils/
├── Cargo.toml          # Rust 依赖
├── src/
│   └── lib.rs          # Rust 源码
├── index.d.ts          # TypeScript 类型定义
├── index.js            # JS 入口
└── package.json
```

## 编写 Rust 代码

```rust
// src/lib.rs
use napi_derive::napi;
use rayon::prelude::*;

// 同步函数：计算斐波那契数列
#[napi]
pub fn fibonacci(n: u32) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

// 并行计算
#[napi]
pub fn parallel_sum(numbers: Vec&lt;f64&gt;) -> f64 {
    numbers.par_iter().sum()
}

// 异步函数
#[napi]
pub async fn async_process(data: String) -> String {
    // 模拟异步IO
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
    format!("Processed: {}", data)
}

// 对象类型
#[napi(object)]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

#[napi]
pub fn calculate_distance(p1: &Point, p2: &Point) -> f64 {
    ((p2.x - p1.x).powi(2) + (p2.y - p1.y).powi(2)).sqrt()
}

// Buffer 处理（零拷贝）
#[napi]
pub fn process_buffer(buf: &mut [u8]) {
    for byte in buf.iter_mut() {
        *byte = byte.wrapping_add(1);
    }
}
```

## 编译与测试

```bash
# 编译（自动为当前平台）
napi build --platform

# 或编译所有平台
napi build --platform --target x86_64-pc-windows-msvc
napi build --platform --target x86_64-unknown-linux-gnu
napi build --platform --target aarch64-apple-darwin

# 测试
npm test
```

## Node.js 调用

```typescript
// test.ts
import &#123; fibonacci, parallel_sum, async_process, calculate_distance, Point, process_buffer &#125; from './index';

// 同步调用
console.log(fibonacci(40)); // 102334155

// 并行计算
const numbers = Array.from(&#123; length: 1000000 &#125;, () => Math.random());
console.time('parallel');
console.log(parallel_sum(numbers));
console.timeEnd('parallel');

// 异步调用
(async () => &#123;
  const result = await async_process('hello');
  console.log(result); // Processed: hello
&#125;)();

// 对象传递
const p1: Point = &#123; x: 0, y: 0 &#125;;
const p2: Point = &#123; x: 3, y: 4 &#125;;
console.log(calculate_distance(p1, p2)); // 5

// Buffer 处理（零拷贝）
const buf = Buffer.from([1, 2, 3, 4]);
process_buffer(buf);
console.log(buf); // &lt;Buffer 02 03 04 05&gt;
```

## 性能对比

| 操作 | JS (ms) | Rust NAPI (ms) | 加速比 |
|------|---------|----------------|--------|
| fibonacci(40) | 1200 | 450 | 2.7x |
| sum(1M numbers) | 12 | 2 | 6x |
| parallel sum | 12 | 0.8 | 15x |

## 发布到 npm

```bash
# 预发布二进制
napi prepublish -t npm

# 发布
npm publish
```

```json
// package.json
&#123;
  "name": "@your-org/native-utils",
  "version": "1.0.0",
  "main": "index.js",
  "types": "index.d.ts",
  "napi": &#123;
    "name": "native-utils",
    "triples": &#123;
      "additional": [
        "x86_64-unknown-linux-gnu",
        "aarch64-apple-darwin",
        "x86_64-pc-windows-msvc"
      ]
    &#125;
  &#125;
&#125;
```

## 验证清单

- [ ] `napi build --platform` 编译成功
- [ ] Node.js 可正确导入和调用
- [ ] TypeScript 类型定义正确
- [ ] 异步 API 正常工作
- [ ] Buffer 零拷贝修改生效
- [ ] 性能优于纯 JS 实现

## 参考资源

| 资源 | 链接 |
|------|------|
| NAPI-RS | <https://napi.rs/> |
| Rust NAPI Guide | <https://napi.rs/docs/introduction/getting-started> |
| napi-rs/cli | <https://github.com/napi-rs/napi-rs> |

---

 [← 返回代码实验室首页](/code-lab/)
