---
title: 🦀 Rust 工具链全景
description: JavaScript/TypeScript 生态 Rust 工具链完全指南，覆盖 Rolldown、Oxc、Oxlint、Oxfmt、Rspack、SWC、Biome 等下一代构建工具
---

# 🦀 Rust 工具链全景

> 最后更新: 2026-05-01 | 状态: 🚀 高速演进中

---

## 概述

2025-2026 年，Rust 正在全面重塑 JavaScript/TypeScript 的工具链基础设施。从编译器到打包器，从 Linter 到 Formatter，Rust 编写的工具以 **10-100 倍** 的性能提升接管了 JS 生态的核心基建。

---

## 核心工具矩阵

| 工具 | 类型 | 组织 | 状态 | 性能提升 | 关键采用者 |
|------|------|------|------|----------|-----------|
| **Rolldown** | 打包器 | VoidZero | v1.0 RC | 10-30x vs Rollup | Vite 8 默认 |
| **Oxc** | 编译器/工具集 | VoidZero | 多阶段 | 50-100x vs ESLint | Preact, Shopify, ByteDance |
| **Oxlint** | Linter | VoidZero | v1.0 稳定 | 50-100x vs ESLint | Vue.js, Sentry, Hugging Face |
| **Oxfmt** | Formatter | VoidZero | Beta | 30x vs Prettier | 逐步推广 |
| **Biome** | Linter + Formatter | Biomejs | v2.0 Beta | 10x vs ESLint+Prettier | 社区广泛采用 |
| **Rspack** | 打包器 | 字节跳动 | v1.3 稳定 | 5-10x vs Webpack | TikTok, Discord, Microsoft |
| **SWC** | 编译器 | Vercel | 稳定 | 20x vs Babel | Next.js, Vercel |
| **Turbopack** | 打包器 | Vercel | 稳定 | 2-5x vs Webpack | Next.js 16 默认 |

---

## Rolldown — Vite 的未来打包器

### 定位

Rolldown 是由 VoidZero（Evan You 创立）开发的 Rust 编写的下一代打包器，目标是**统一 Vite 的开发和生产构建管道**，替代现有的 esbuild + Rollup 组合。

### 核心特性

- **Rollup API 兼容**: 现有插件生态无缝迁移
- **esbuild 范围**: 支持 advanced chunk splitting、CSS bundling
- **Oxc 原生集成**: 共享解析器、转换器、minifier
- **多线程并行**: 利用 Rust 原生并发能力

### 采用时间线

| 时间 | 里程碑 |
|------|--------|
| 2025-05 | Rolldown-Vite Beta 发布 |
| 2025-06 | Vite 7.0 引入 rolldown-vite 包 |
| 2025-11 | Vite 8 Beta 默认使用 Rolldown |
| 2026-01 | Rolldown v1.0 RC |
| 2026-H1 | 预计成为 Vite 默认生产打包器 |

### 性能基准

```
大型前端项目生产构建:
- Rollup: 46s
- Rolldown: 6s  (7.7x 提升)
- 内存占用降低高达 100x
```

---

## Oxc — JavaScript 氧化编译器

### 架构概览

```
Oxc 工具链
├── Parser      (3x SWC 速度)
├── Transformer (TypeScript/JSX 降级)
├── Minifier    (Alpha)
├── Resolver    (28x 竞争对手)
├── Oxlint      (50-100x ESLint)
└── Oxfmt       (30x Prettier)
```

### Oxlint 生产采用

Oxlint 已达到 **v1.0 稳定**，被以下组织生产采用：

- **Shopify**: CI 管道 lint 时间从 31s → 499ms
- **Airbnb**: 126,000 文件多文件分析 7s 完成
- **ByteDance / Shopee**: 大型代码库每日构建

### 与 ESLint 的共存策略

```bash
# 推荐迁移路径（大型项目）
# 1. 先用 Oxlint 覆盖基础规则
oxlint .

# 2. 再用 ESLint 处理 type-aware 规则（通过 eslint-plugin-oxlint 禁用重叠规则）
eslint . --ext .ts,.tsx
```

---

## Biome — 统一的 JS 工具链

### 与 Oxc 的差异

| 维度 | Biome | Oxc |
|------|-------|-----|
| 工具形态 | 单一二进制 (linter + formatter) | 独立工具集 |
| 配置方式 | 零配置优先 | 兼容 ESLint/Prettier 配置 |
| Type-aware Linting | Biotype (75-85% ts-eslint 覆盖) | 由 tsgo 驱动 (开发中) |
| 插件系统 | v2.0 引入 GritQL 插件 | 支持 ESLint JS 插件 |
| 适用场景 | 新项目零配置启动 | 现有项目渐进迁移 |

---

## Rspack — 企业级 Webpack 替代

### 定位

字节跳动开源的 Webpack drop-in 替代品，追求**完全 API 兼容**前提下的性能提升。

### 生产采用者

- TikTok、Discord、Microsoft、Amazon
- 适用于无法迁移到 Vite 的大型遗留项目

---

## 选型决策树

```
新项目?
├── 是 → Vite + Rolldown/Oxc 工具链
│         ├── 需要零配置? → Biome
│         └── 需要最大兼容? → Oxlint + Oxfmt
└── 否 → 遗留项目迁移
          ├── 使用 Webpack? → Rspack (渐进替换)
          ├── 使用 Rollup? → Rolldown
          └── 使用 Babel? → SWC / Oxc Transformer
```

---

## 2026 演进预测

1. **Vite 8 将全面默认 Rolldown**，标志着 JS 构建进入 Rust 时代
2. **Oxfmt 将达到 Prettier 95%+ 兼容**，Formatter 市场重新洗牌
3. **tsgo (TypeScript Go 移植)** 将与 Oxc 解析器整合，实现端到端原生工具链
4. **Biome v2 稳定版**将证明"统一工具链"模式的可行性

---

## 参考资源

- [Rolldown 官方文档](https://rolldown.rs)
- [Oxc 项目主页](https://oxc.rs)
- [VoidZero 博客](https://voidzero.dev)
- [Biome 文档](https://biomejs.dev)
- [Rspack 文档](https://rspack.dev)
