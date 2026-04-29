# React 设计模式

> React 生态常用设计模式与最佳实践速查。

---

## 组件模式

| 模式 | 说明 | 示例 |
|------|------|------|
| **Compound Components** | 相关组件共享隐式状态 | `<Select><Option /></Select>` |
| **Render Props** | 通过 props 传递渲染逻辑 | `<Mouse render={pos => <div />} />` |
| **HOC** | 高阶组件复用逻辑 | `withAuth(Component)` |
| **Custom Hooks** | 提取可复用状态逻辑 | `useLocalStorage`, `useFetch` |
| **Container/Presentational** | 分离数据与展示 | Container 获取数据，Presentational 渲染 |

## 性能模式

| 模式 | 说明 |
|------|------|
| **React.memo** | 纯组件 props 不变跳过渲染 |
| **useMemo / useCallback** | 缓存 expensive 计算和回调（React 19 逐步淘汰） |
| **Virtualization** | 仅渲染视口内列表项（react-window） |
| **Code Splitting** | 动态导入减少初始包（React.lazy + Suspense） |
| **Streaming SSR** | `<Suspense>` 流式传输，渐进渲染 |

## 状态模式

| 模式 | 适用场景 |
|------|---------|
| **Lifting State Up** | 兄弟组件共享状态 |
| **State Reducer** | 复杂状态逻辑，需外部控制 |
| **Provider Pattern** | 深层组件树共享状态 |
| **Signals** | 细粒度响应式，避免 Virtual DOM 开销 |

---

*最后更新: 2026-04-29*
