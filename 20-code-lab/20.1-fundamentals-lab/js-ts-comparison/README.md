# 10-js-ts-comparison: JavaScript / TypeScript 对比分析

> **维度：语言核心（Language Core）**
>
> 从语法、语义模型、类型理论到编译工程实践的全方位对比分析模块。本模块属于语言核心中的**语言边界与语义差异维度**，帮助理解 TypeScript 作为 JavaScript 超集的本质边界、类型擦除机制与运行时行为差异。

---

## 📚 模块导航

### 理论基础

- **[THEORY.md](./THEORY.md)** — 三层语义模型（动态语义 / 静态语义 / 擦除语义）与编译阶段映射的理论基础

### 形式化类型系统

- **[type-theory/formal-type-system.ts](./type-theory/formal-type-system.ts)** — 可运行的形式化类型检查器，包含子类型判断、一致性关系 `~`、里氏替换原则（LSP）证明

### 语义模型演示

- **[semantic-models/compiler-phase-demo.ts](./semantic-models/compiler-phase-demo.ts)** — 使用真实 TypeScript API 演示编译器前端流水线（Lexer → Parser → AST → TypeChecker → Emitter）
- **[semantic-models/type-erasure-demo.ts](./semantic-models/type-erasure-demo.ts)** — 使用 `ts.TransformerFactory` 在 AST 层面实现类型擦除，展示 TS 类型在运行时消失的证据
- **[semantic-models/gradual-boundary-demo.ts](./semantic-models/gradual-boundary-demo.ts)** — 在 typed/untyped 边界模拟运行时一致性检查，对比 `any` 与 `unknown` 的行为差异
- **[semantic-models/variance-demo.ts](./semantic-models/variance-demo.ts)** — 结构化子类型、函数参数逆变与返回值协变的可编译示例

### 编译器 API 工程实践

- **[compiler-api/extract-types.ts](./compiler-api/extract-types.ts)** — 使用自定义 `CompilerHost` 从内存源码中提取变量/函数类型信息
- **[compiler-api/custom-transformer.ts](./compiler-api/custom-transformer.ts)** — 编写 `ts.TransformerFactory` 自动为类属性追加 `readonly`
- **[compiler-api/generate-dts.ts](./compiler-api/generate-dts.ts)** — 程序化调用编译器生成 `.d.ts` 文件内容
- **[compiler-api/README.md](./compiler-api/README.md)** — 各示例的详细说明与运行命令

### 运行时语义对比

- **[class-runtime-comparison.ts](./class-runtime-comparison.ts)** — 对比 JS `#private` 与 TS `private` 在编译后产物、原型链可见性、反射访问上的运行时差异

### 互操作与迁移

- **[interoperability/js-ts-interop.ts](./interoperability/js-ts-interop.ts)** — JS/TS 互操作边界、`.d.ts` 桥接、`satisfies` 运算符
- **[pattern-migration/](./pattern-migration/)** — 设计模式从 JS 闭包/IIFE 到 TS 泛型类的类型化升级
- **[js-implementations/](./js-implementations/)** — 纯 JS 实现的设计模式（与 TS 版本形成对照）

### 双轨算法

- **[dual-track-algorithms/](./dual-track-algorithms/)** — 动态实现 vs 类型化实现（图、哈希表、排序、动态规划）

---

## 🚀 快速运行

```bash
# 运行形式化类型系统演示
pnpm exec tsx jsts-code-lab/10-js-ts-comparison/type-theory/formal-type-system.ts

# 运行语义模型演示
pnpm exec tsx jsts-code-lab/10-js-ts-comparison/semantic-models/compiler-phase-demo.ts
pnpm exec tsx jsts-code-lab/10-js-ts-comparison/semantic-models/type-erasure-demo.ts
pnpm exec tsx jsts-code-lab/10-js-ts-comparison/semantic-models/gradual-boundary-demo.ts

# 运行编译器 API 示例
pnpm exec tsx jsts-code-lab/10-js-ts-comparison/compiler-api/extract-types.ts
pnpm exec tsx jsts-code-lab/10-js-ts-comparison/compiler-api/custom-transformer.ts
pnpm exec tsx jsts-code-lab/10-js-ts-comparison/compiler-api/generate-dts.ts

# 运行运行时对比
pnpm exec tsx jsts-code-lab/10-js-ts-comparison/class-runtime-comparison.ts
```

---

## 🧪 测试

```bash
pnpm test jsts-code-lab/10-js-ts-comparison
```

---

## 🔗 关联文档

- [JS_TS_语言语义模型全面分析](../../../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/JS_TS_语言语义模型全面分析.md) — 项目旗舰文档，规范级语义分析
- [GRADUAL_TYPING_THEORY.md](../../../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/GRADUAL_TYPING_THEORY.md) — 渐进类型理论专著
- [TYPE_SOUNDNESS_ANALYSIS.md](../../../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/TYPE_SOUNDNESS_ANALYSIS.md) — 类型健全性分析
- [js-ts-compilers-compare.md](../../../30-knowledge-base/30.3-comparison-matrices/js-ts-compilers-compare.md) — 编译器/转译器语义对比矩阵

---

*模块版本: v2.0 | 最后更新: 2026-04-17*
