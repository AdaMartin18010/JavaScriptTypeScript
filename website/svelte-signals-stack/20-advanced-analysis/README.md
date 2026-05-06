# 20-25 深度分析专题

> **定位**: Svelte 5 Signals 编译器生态的进阶深度分析层
> **覆盖**: 源码级形式证明、浏览器渲染管线、编译器 IR、TypeScript 融合、TC39 标准化对齐

---

## 目录结构

```
20-advanced-analysis/
├── README.md                              # 本文件
├── 20-browser-rendering-pipeline-optimization.md  # INP 优化实战指南
├── 21-tc39-signals-alignment.md           # TC39 Signals ↔ Svelte Runes 语义对齐
├── 22-browser-rendering-pipeline.md       # 浏览器渲染管线全链路理论映射
├── 23-compiler-ir-buildchain.md           # Compiler IR 设计与 Vite 6.3 构建链
├── 24-typescript-58-svelte-fusion.md      # TypeScript 5.8+ 与 Svelte Runes 深度融合
└── 25-reactivity-source-proofs.md         # 基于 Svelte 5.55.5 源码的形式证明 (15 定理)
```

---

## 阅读路径

### 路径 A: 标准化研究者

```
21 (TC39 对齐) → 25 (形式证明) → 22 (浏览器管线)
```

### 路径 B: 性能工程师

```
20 (优化实战) → 22 (理论管线) → 25 (复杂度定理)
```

### 路径 C: 编译器/工具链开发者

```
23 (Compiler IR) → 24 (TS 融合) → 25 (源码证明)
```

### 路径 D: 全栈通读

```
20 → 21 → 22 → 23 → 24 → 25 (按编号顺序)
```

---

## 与原有文档的关系

本目录下的 6 个文档与根目录的 20 个原有文档（01-19）形成互补：

- **原有文档 (01-19)**: 工程实践指南，覆盖语法、框架使用、部署、生态
- **本目录文档 (20-25)**: 源码级深度分析，覆盖编译器、运行时、标准对齐、形式证明

**交叉引用**: 详见 `../meta/CROSS_REFERENCE_INDEX.md`

---

## 技术对齐基准

| 技术 | 版本 |
|:---|:---|
| Svelte | 5.55.5 |
| TypeScript | 5.8.x / 5.9.x |
| Vite | 6.3.x |
| TC39 Signals | Stage 1 (2026-04) |
| Chrome | 124+ |
| Firefox | 125+ |
| Safari | 17+ |

---

> 维护: JSTS 技术社区 | 协议: CC BY-SA 4.0
