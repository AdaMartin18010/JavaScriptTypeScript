# 状态管理 (State Management)

> 客户端状态管理的选型矩阵与决策框架，覆盖 React 生态主流方案及 2026 年 Signals 范式演进。

---

## 核心概念

现代前端状态管理已从「单一全局 Store」演进为**分层架构**：

- **服务端状态**（Server State）：来自 API 的数据，由 TanStack Query / SWR / RTK Query 管理
- **客户端全局状态**（Global Client State）：跨组件共享的 UI 状态
- **局部组件状态**（Local State）：组件内部 `useState` / `useReducer`
- **URL 状态**（URL State）：路由参数、查询字符串

> 2026 年最佳实践：优先将状态移至服务端，仅用客户端状态管理「纯 UI 状态」（侧边栏展开、当前标签页、表单草稿）。

---

## 主流方案对比矩阵

| 维度 | Redux Toolkit | Zustand | Jotai | Context API | Signals (Preact) |
|------|--------------|---------|-------|-------------|------------------|
| **心智模型** | 集中式 Store (Flux) | 集中式 Store (轻量) | 原子化图 (Atomic) | 依赖注入树 | 细粒度响应式 |
| **包体积 (gzip)** | ~15KB | ~1KB | ~2.5KB | 0 (内置) | ~1KB |
| **样板代码** | 中（Slice + Thunk） | 极少 | 极少 | 中（Provider） | 极少 |
| **TypeScript** | 优秀（自动生成类型） | 优秀（泛型推断） | 优秀（原子类型推断） | 需手动定义 | 优秀 |
| **SSR 支持** | 良好 | 良好（createStore 模式） | 优秀（内置 hydrate） | 良好 | 良好 |
| **DevTools** | Redux DevTools（时间旅行） | 内置 Redux DevTools | Jotai DevTools | React DevTools | 浏览器扩展 |
| **派生状态** | Reselect / createSelector | 手动 selectors | 自动（derived atoms） | useMemo | 自动（computed） |
| **中间件生态** | 丰富（redux-saga, persist） | persist, immer, logger | 与 TanStack Query 集成 | 无 | 有限 |
| **维护状态** | ✅ 活跃 | ✅ 活跃 | ✅ 活跃 | ✅ React 内置 | ✅ 活跃 |

---

## 选型决策树

```
是否需要跨多页面/多路由共享复杂状态？
├── 否 → useState / useReducer（组件级）
├── 是 → 状态变化频率如何？
│   ├── 低频（主题、认证、语言）→ Context API
│   └── 高频（表单、动画、实时数据）→
│       ├── 需要原子级派生状态（设计工具/电子表格）→ Jotai
│       ├── 需要细粒度响应式（Signal 驱动）→ Preact Signals / SolidJS Store
│       └── 标准业务逻辑（Dashboard / SaaS）→ Zustand
└── 大型团队（10+ 人）+ 严格规范 → Redux Toolkit
```

---

## 2026 生态动态

### Recoil 已归档

Recoil 官方 GitHub 仓库于 **2025-01-01 归档**，不再推荐用于新项目。现有 Recoil 项目应评估迁移至 Jotai（同为原子模型，API 相似）或 Zustand。

### Signals 范式崛起

- **Preact Signals**：~1KB，与 React 兼容（`@preact/signals-react`），自动细粒度订阅
- **Angular Signals**：Angular 16+ 内置，`computed()` / `effect()` 原生支持
- **Vue Vapor Mode**：编译时自动提取响应式依赖，对标 Signals 性能

### React 19 Compiler 影响

React 19 Compiler（自动记忆化）减少了对 `useMemo` / `useCallback` 的手动优化需求，但**不替代状态管理库**。状态管理仍负责跨组件共享，Compiler 仅优化组件级渲染。

---

## 最佳实践

1. **分离服务端与客户端状态**：用 TanStack Query 管理 API 数据，状态库仅管理 UI 状态
2. **避免过度全局化**：80% 的状态应停留在组件内部或最近公共祖先
3. **选择器优化**：Zustand/Redux 中使用 selectors 防止不必要重渲染
4. **持久化策略**：Zustand + `persist` 中间件或 Jotai `atomWithStorage` 实现 localStorage 同步
5. **类型安全优先**：利用 TypeScript 泛型约束 Store 形状，避免 `any` 污染

---

## 参考资源

- [Zustand Documentation](https://docs.pmndrs.dev/zustand)
- [Jotai Documentation](https://jotai.org/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [TanStack Query](https://tanstack.com/query/latest) — 服务端状态管理
- [Preact Signals](https://preactjs.com/blog/signal-boosting/) — Signals 权威解读
- [Recoil Archive Notice](https://github.com/facebookexperimental/Recoil) — 归档声明

---

## 关联文档

- `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/Signals_范式深度分析.md`
- `20-code-lab/20.5-frontend-frameworks/state-management/`
- `40-ecosystem/comparison-matrices/frontend-frameworks-compare.md`

---

*最后更新: 2026-04-29*
