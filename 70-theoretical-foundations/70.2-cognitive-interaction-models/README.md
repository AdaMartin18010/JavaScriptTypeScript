# 70.2 — 认知交互模型 (Cognitive Interaction Models)

> **理论深度**: 跨学科（编程语言 × 认知科学 × HCI）
> **前置阅读**: 建议先读 `01-cognitive-science-primer-for-developers.md`
> **代码示例**: [code-examples/](code-examples/)

---

## 目标

从人类认知科学、感知心理学、人机交互（HCI）视角，系统分析 JavaScript/TypeScript 与 UI 框架的交互模型。
本方向是项目中的**完全空白领域**，旨在建立"代码如何被人类认知处理"的理论框架，覆盖：

- 开发者心智模型与工作记忆负荷
- UI 框架的多模型映射（Angular/React/Vue/Solid/Svelte）
- 渲染引擎与人类视觉感知的映射
- 数据交互、响应、异步并发的认知处理机制
- 专家-新手差异与认知维度评估

---

## 文件索引

| # | 文件 | 核心内容 | 字数 | 代码示例 |
|---|------|---------|------|----------|
| 01 | [01-cognitive-science-primer-for-developers.md](01-cognitive-science-primer-for-developers.md) | 工作记忆、认知负荷、心智模型、具身认知基础 | ≥8K | ≥6 |
| 02 | [02-mental-models-and-programming-languages.md](02-mental-models-and-programming-languages.md) | 动态类型 vs 静态类型的心智模型；渐进类型的认知切换成本 | ≥8K | ≥6 |
| 03 | [03-working-memory-load-in-javascript.md](03-working-memory-load-in-javascript.md) | 回调地狱/Promise/async/RxJS 的认知负荷对比 | ≥8K | ≥6 |
| 04 | [04-conceptual-models-of-ui-frameworks.md](04-conceptual-models-of-ui-frameworks.md) | Angular/React/Vue/Solid/Svelte 的多模型映射与认知成本 | ≥8K | ≥6 |
| 05 | [05-react-algebraic-effects-cognitive-analysis.md](05-react-algebraic-effects-cognitive-analysis.md) | Hooks 规则、Fiber 时间切片、Suspense 的认知分析 | ≥8K | ≥6 |
| 06 | [06-vue-reactivity-cognitive-model.md](06-vue-reactivity-cognitive-model.md) | Proxy 透明性、Ref vs Reactive、Composition vs Options | ≥8K | ≥6 |
| 07 | [07-angular-architecture-cognitive-load.md](07-angular-architecture-cognitive-load.md) | DI、RxJS 强制使用、模块层级、装饰器的认知负荷 | ≥8K | ≥6 |
| 08 | [08-rendering-engine-cognitive-perception.md](08-rendering-engine-cognitive-perception.md) | 帧率感知、渲染流水线与注意力、Core Web Vitals 与人类感知 | ≥8K | ≥6 |
| 09 | [09-data-flow-and-cognitive-trajectory.md](09-data-flow-and-cognitive-trajectory.md) | 单向 vs 双向数据流、全局状态的心智地图、不可变数据 | ≥8K | ≥6 |
| 10 | [10-async-concurrency-cognitive-models.md](10-async-concurrency-cognitive-models.md) | 人类并发直觉、Event Loop 的认知优势、竞态条件的检测困难 | ≥8K | ≥6 |
| 11 | [11-expert-novice-differences-in-js-ts.md](11-expert-novice-differences-in-js-ts.md) | Dreyfus 模型、模式识别、新手错误根源、TS 错误信息可理解性 | ≥8K | ≥6 |
| 12 | [12-multimodal-interaction-theory.md](12-multimodal-interaction-theory.md) | 代码+类型+运行时的多模态整合、IDE 认知工具、AI 辅助编程 | ≥8K | ≥6 |
| 13 | [13-frontend-framework-computation-models.md](13-frontend-framework-computation-models.md) | 前端框架内部计算模型形式化：React Fiber/VDOM Diff、Vue 响应式图论、Angular 变更检测、Solid Signals、Svelte 编译时 | ≥8K | ≥6 |
| 14 | [14-browser-rendering-engine-principles.md](14-browser-rendering-engine-principles.md) | 浏览器渲染引擎技术原理：DOM/CSSOM/Render Tree、Layout、Paint、Composite、V8 交互 | ≥8K | ≥6 |
| 15 | [15-edge-computing-cognitive-model.md](15-edge-computing-cognitive-model.md) | Edge Runtime 的开发者认知模型：三元心智、延迟分层、状态幻觉、成本直觉 | ≥8K | ≥6 |
| 16 | [16-developer-cognitive-modern-stack.md](16-developer-cognitive-modern-stack.md) | 现代前端技术栈的开发者认知模型：技术爆炸、认知过载、决策疲劳、框架选型 | ≥8K | ≥6 |

---

## 核心理论框架

### 1. 认知负荷理论在编程中的应用

根据 Sweller 的认知负荷理论，代码阅读涉及三种负荷：

| 负荷类型 | 定义 | JS/TS 示例 |
|---------|------|-----------|
| **内在负荷 (Intrinsic)** | 任务本身的复杂度 | 理解递归类型定义、嵌套泛型 |
| **外在负荷 (Extraneous)** | 信息呈现方式带来的负担 | 回调地狱的嵌套、无类型注解的隐式转换 |
| **相关负荷 (Germane)** | 促进图式建构的处理 | 类型守卫 `isX(a)` 帮助构建心智模型 |

### 2. UI 框架的多模型映射

每个前端框架都同时维持多个概念模型：

```
React:    概念模型(函数式UI) ──→ 数据模型(单向流) ──→ 渲染模型(Virtual DOM Diff)
Vue:      概念模型(响应式代理) ──→ 数据模型(双向绑定) ──→ 渲染模型(模板编译+Patch)
Solid:    概念模型(Signal) ──→ 数据模型(细粒度依赖) ──→ 渲染模型(直接DOM更新)
Svelte:   概念模型(编译时框架) ──→ 数据模型(编译期分析) ──→ 渲染模型(无运行时VDOM)
Angular:  概念模型(MVC/MVVM) ──→ 数据模型(RxJS流) ──→ 渲染模型(变更检测)
```

框架切换的认知成本 = 概念模型冲突程度 × 工作记忆负荷

### 3. 渲染流水线的人类感知映射

| 渲染阶段 | 时间预算 | 人类感知阈值 | 认知影响 |
|---------|---------|-------------|---------|
| First Contentful Paint (FCP) | < 1.8s | 注意力保持窗口 | 超过 → 用户注意力转移 |
| Largest Contentful Paint (LCP) | < 2.5s | 工作记忆刷新周期 | 超过 → 内容理解中断 |
| Cumulative Layout Shift (CLS) | < 0.1 | 前庭系统稳定预期 | 超过 → 空间定向混乱 |
| Frame Rate | 60fps (16.67ms/帧) | 视觉暂留 (~100ms) | 低于 → 流畅感丧失 |

---

## 与现有内容的交叉引用

| 本文件 | 引用现有内容 | 关系 |
|--------|-------------|------|
| `04-conceptual-models` | `FRONTEND_FRAMEWORK_THEORY.md` | 从认知科学补充形式化模型 |
| `05-react-cognitive` | `FRONTEND_FRAMEWORK_THEORY.md` §1 | 认知分析补充代数效应理论 |
| `08-rendering` | `web-rendering THEORY.md` | 从人类感知深化渲染流水线分析 |
| `10-async-concurrency` | `CONCURRENCY_MODELS_DEEP_DIVE.md` | 认知分析补充形式化并发模型 |
| `12-multimodal` | `guides/ai-coding-workflow.md` | 认知科学分析 AI 辅助编程 |

---

## 参考文献

- Baddeley, *Working Memory* (2007)
- Sweller, *Cognitive Load Theory* (2011)
- Norman, *The Design of Everyday Things* (2013)
- Card, Moran & Newell, *The Psychology of Human-Computer Interaction* (1983)
- Green & Petre, "Cognitive Dimensions of Notations" (1996)
- Blackwell & Green, "Cognitive Dimensions of Notations: Tutorial" (2003)
- Johnson-Laird, *Mental Models* (1983)
- Stefik & Hanenberg, "The Programming Language Wars" (2014)
- Ousterhout, *A Philosophy of Software Design* (2018)
- Ericsson et al., "Expertise in Problem Solving" (1993)
- Nielsen, *Usability Engineering* (1993)
