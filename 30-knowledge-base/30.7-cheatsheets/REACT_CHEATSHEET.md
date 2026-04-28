# React 速查表（2026）

> **定位**：`30-knowledge-base/30.7-cheatsheets/`

---

## Hooks

| Hook | 用途 | 依赖 |
|------|------|------|
| `useState` | 状态管理 | — |
| `useReducer` | 复杂状态逻辑 | — |
| `useEffect` | 副作用 | deps 数组 |
| `useLayoutEffect` | 同步副作用（DOM测量） | deps 数组 |
| `useRef` | 可变引用 / DOM 访问 | — |
| `useMemo` | 缓存计算值 | deps 数组 |
| `useCallback` | 缓存函数引用 | deps 数组 |
| `useContext` | 上下文消费 | Context |
| `useId` | 生成唯一 ID | — |
| `useTransition` | 非紧急更新 | — |
| `useDeferredValue` | 延迟值 | value |
| `useActionState` | 表单状态（React 19） | action |
| `useOptimistic` | 乐观更新（React 19） | — |

## React 19 新特性

| 特性 | 说明 |
|------|------|
| **Server Components** | 服务端执行，减少客户端 JS |
| **Actions** | 表单自动提交 + 乐观更新 |
| **React Compiler** | 自动记忆化，无需 useMemo |
| **Document Metadata** | 原生 `<title>` / `<meta>` 支持 |
| **Asset Loading** | 内置 `preload` / `prefetch` |

## 性能优化检查清单

- [ ] 使用 React Compiler（React 19+）
- [ ] 大数据列表使用虚拟化（react-window）
- [ ] 图片懒加载 + 响应式
- [ ] Code Splitting（React.lazy + Suspense）
- [ ] 避免 Context 滥用（考虑 Signals）
- [ ] useMemo/useCallback 仅用于昂贵计算

---

*速查表仅列核心 API，详细用法参见官方文档。*
