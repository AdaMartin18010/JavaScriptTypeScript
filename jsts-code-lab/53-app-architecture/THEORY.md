# 应用架构理论：从单体到微前端

> **目标读者**：前端架构师、技术负责人
> **关联文档**：[`docs/categories/53-app-architecture.md`](../../docs/categories/53-app-architecture.md)
> **版本**：2026-04

---

## 1. 前端架构演进

```
2010: 单体 jQuery
  ↓
2015: MVC (Backbone/Angular 1)
  ↓
2018: 组件化 (React/Vue)
  ↓
2020: 微前端 (qiankun/single-spa)
  ↓
2023: 模块联邦 (Module Federation)
  ↓
2026: 混合架构 (RSC + 微前端 + AI Agent)
```

---

## 2. 架构模式

### 2.1 微前端

| 方案 | 集成方式 | 特点 |
|------|---------|------|
| **qiankun** | 运行时沙箱 | 国内最流行 |
| **single-spa** | 生命周期管理 | 生态广 |
| **Module Federation** | 编译时共享 | Webpack 原生 |
| **iframe** | 浏览器隔离 | 简单但体验差 |

### 2.2 模块联邦 2.0

```typescript
// 远程模块声明
const remotes = {
  marketing: 'marketing@https://marketing.app/remoteEntry.js',
  checkout: 'checkout@https://checkout.app/remoteEntry.js',
};

// 运行时加载
const { Banner } = await import('marketing/Banner');
```

---

## 3. 状态管理架构

| 规模 | 方案 | 说明 |
|------|------|------|
| 小型 | Context + useReducer | 内置，零依赖 |
| 中型 | Zustand / Valtio | 轻量、现代 |
| 大型 | Redux Toolkit / Pinia | 生态、DevTools |
| 跨应用 | RxJS / Event Bus | 微前端通信 |

---

## 4. 总结

前端架构的核心是**在一致性与自治之间找到平衡**。

---

## 参考资源

- [Micro Frontends](https://micro-frontends.org/)
- [Module Federation](https://module-federation.io/)

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `data-fetching-patterns.ts`
- `dependency-injection-models.ts`
- `index.ts`
- `llm-driven-architecture.ts`
- `module-bundling-models.ts`
- `mvc-derivatives.ts`
- `routing-navigation-models.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **模式一**：待根据代码具体分析
2. **模式二**：待根据代码具体分析
3. **模式三**：待根据代码具体分析

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

---

> 📅 理论深化更新：2026-04-27
