# 本体论框架（Ontology）

> **定位**：`10-fundamentals/10.1-language-semantics/ontology/`
> **关联**：`axioms/` | `theorems/` | `30.8-research/tsjs-stack-panorama-2026/`

---

## 形式-工程-感知三重本体论

### 形式层（Formal Layer）

语言的形式语义，包括：

- ECMA-262 规范算法
- 类型系统的逻辑基础
- 编译理论中的抽象解释

### 工程层（Engineering Layer）

生产环境中的实现与优化，包括：

- V8 / SpiderMonkey / JavaScriptCore 引擎实现
- 构建工具链（Vite / SWC / Rolldown）
- 运行时环境（Node.js / Bun / Deno）

### 感知层（Perceptual Layer）

开发者体验与认知负荷，包括：

- 类型系统作为认知脚手架
- DX（Developer Experience）度量
- 学习曲线与心智模型

---

## 三重统一图谱

```
         ┌─────────────┐
         │   形式层     │  ← 规范、逻辑、证明
         │  (Formal)   │
         └──────┬──────┘
                │ 实现
                ▼
         ┌─────────────┐
         │   工程层     │  ← 性能、工具、运行时
         │(Engineering)│
         └──────┬──────┘
                │ 体验
                ▼
         ┌─────────────┐
         │   感知层     │  ← DX、认知、学习
         │ (Perceptual)│
         └─────────────┘
```

*参见 `30.8-research/tsjs-stack-panorama-2026/full-analysis.md` 中的完整论证。*
