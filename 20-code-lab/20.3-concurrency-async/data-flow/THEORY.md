# 数据流 — 理论基础

## 1. 单向数据流

数据从父组件流向子组件，通过 props 传递：

```
父组件状态 → props → 子组件 → 事件 → 父组件更新状态
```

优点：数据变化可预测，调试容易。代表：React、Vue（可选）。

## 2. 双向数据绑定

数据在视图和模型之间自动同步：

```
视图 <-> 视图模型 <-> 模型
```

优点：代码量少。缺点：大规模应用难以追踪数据变化来源。代表：Vue v-model、Angular ngModel。

## 3. 响应式数据流

基于观察者模式，数据变化自动传播：

- **Observable**: 可观察的数据源
- **Observer**: 订阅并响应变化的消费者
- **Operators**: map、filter、merge、switchMap 等转换操作

代表：RxJS、MobX、Vue 3 Reactivity、Solid Signals。

## 4. 状态管理架构

| 模式 | 特点 | 代表 |
|------|------|------|
| **Flux** | 单向数据流，Action → Dispatcher → Store → View | Redux |
| **Proxy 响应式** | 自动追踪依赖，细粒度更新 | Vue、MobX |
| **原子化状态** | 独立原子单元，组合使用 | Recoil、Jotai |
| **状态机** | 有限状态，显式转换 | XState |

## 5. 状态管理库深度对比

| 特性 | Redux | MobX | Zustand | Jotai |
|------|-------|------|---------|-------|
| **哲学** | 显式、不可变、可预测 | 隐式、响应式、自动追踪 | 极简、命令式、现代 Hook | 原子化、组合式、React 原生 |
| **样板代码** | 多（Action/Reducer/Store）| 少 | 极少 | 极少 |
| **学习曲线** | 陡峭 | 中等 | 平缓 | 平缓 |
| **DevTools** | 极为丰富 | 良好 | 良好 | 基础 |
| **中间件生态** | Redux-Thunk、Redux-Saga、RTK Query | mobx-state-tree | 内置异步、持久化 | 无 / 极简 |
| **TypeScript** | RTK 优秀 | 良好 | 原生优秀 | 原生优秀 |
| **体积（gzip）** | ~9 kB（RTK）| ~16 kB | ~1 kB | ~4 kB |
| **服务端渲染** | 复杂 | 中等 | 简单 | 简单 |
| **状态作用域** | 全局单一 Store | 多 Store / 类实例 | 多 Store | 原子级作用域 |
| **数据流追踪** | 时间旅行调试 | MobX 追踪图 | Zustand DevTools | React DevTools |
| **适用场景** | 大型企业应用 | 中大型企业应用 | 中小型项目、快速启动 | 原子化需求、细粒度 |
| **代表项目** | Twitter、Instagram | Mendix、Coinbase | Vercel、Twitch | 新兴项目 |

### 选型决策矩阵

```
需要最丰富的调试和时间旅行？
  ├─ 是 → Redux Toolkit
  └─ 否 → 项目规模？
            ├─ 大型团队 / 复杂业务 → Redux Toolkit
            ├─ 需要自动响应式追踪 → MobX
            ├─ 极简优先、快速启动 → Zustand
            └─ 细粒度原子状态 → Jotai
```

## 6. 代码示例：Zustand 现代状态管理

```bash
# 安装（无 Redux DevTools 依赖，体积仅 ~1KB）
npm install zustand
npm install -D @types/node  # 如需 TypeScript 辅助
```

```typescript
// src/store/types.ts — 类型定义
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
}

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export interface AppState {
  // ── 用户状态 ──
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void

  // ── 购物车状态 ──
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number

  // ── UI 状态 ──
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}
```

```typescript
// src/store/useAppStore.ts — Zustand Store 实现
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { AppState } from './types'

/**
 * Zustand + Immer + Persist 组合
 * - Immer: 允许直接修改状态（不可变转换自动处理）
 * - Persist: 自动持久化到 localStorage
 * - 类型安全：完整 TypeScript 推断
 */
export const useAppStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      // ── 初始状态 ──
      user: null,
      isAuthenticated: false,
      cart: [],
      sidebarOpen: false,
      theme: 'system',

      // ── 用户操作 ──
      setUser: (user) =>
        set((state) => {
          state.user = user
          state.isAuthenticated = user !== null
        }),

      logout: () =>
        set((state) => {
          state.user = null
          state.isAuthenticated = false
          state.cart = [] // 登出清空购物车
        }),

      // ── 购物车操作 ──
      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((i) => i.productId === item.productId)
          if (existing) {
            existing.quantity += item.quantity
          } else {
            state.cart.push(item)
          }
        }),

      removeFromCart: (productId) =>
        set((state) => {
          state.cart = state.cart.filter((i) => i.productId !== productId)
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          const item = state.cart.find((i) => i.productId === productId)
          if (item) {
            if (quantity <= 0) {
              state.cart = state.cart.filter((i) => i.productId !== productId)
            } else {
              item.quantity = quantity
            }
          }
        }),

      clearCart: () =>
        set((state) => {
          state.cart = []
        }),

      // ── 派生计算（get）──
      getCartTotal: () => {
        return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getCartCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0)
      },

      // ── UI 操作 ──
      toggleSidebar: () =>
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen
        }),

      setTheme: (theme) =>
        set((state) => {
          state.theme = theme
        })
    })),
    {
      name: 'app-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // 仅持久化用户和主题，购物车不持久化
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme
      })
    }
  )
)
```

```tsx
// src/components/CartBadge.tsx — 组件中使用（细粒度订阅）
import { useAppStore } from '../store/useAppStore'

/**
 * Zustand 选择器模式：仅订阅 cart 数组长度变化
 * 其他状态（theme、user、sidebarOpen）变化不会触发重渲染
 */
export function CartBadge() {
  const count = useAppStore((state) => state.getCartCount())
  const cart = useAppStore((state) => state.cart)

  return (
    <span className="cart-badge">
      🛒 {count > 0 && <span className="count">{count}</span>}
    </span>
  )
}

// src/components/AddToCartButton.tsx
import { useAppStore } from '../store/useAppStore'

interface Product {
  id: string
  name: string
  price: number
}

export function AddToCartButton({ product }: { product: Product }) {
  // 仅订阅需要的 action，不订阅状态 → 永不触发重渲染
  const addToCart = useAppStore((state) => state.addToCart)

  return (
    <button
      onClick={() =>
        addToCart({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        })
      }
    >
      Add to Cart
    </button>
  )
}

// src/components/CartSummary.tsx — 使用多个切片
export function CartSummary() {
  const { cart, getCartTotal, clearCart } = useAppStore(
    (state) => ({
      cart: state.cart,
      total: state.getCartTotal(),
      clear: state.clearCart
    })
  )

  return (
    <div className="cart-summary">
      <h3>Cart ({cart.length} items)</h3>
      <ul>
        {cart.map((item) => (
          <li key={item.productId}>
            {item.name} x {item.quantity} = ${item.price * item.quantity}
          </li>
        ))}
      </ul>
      <p>Total: ${getCartTotal.toFixed(2)}</p>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  )
}
```

```typescript
// src/store/useAppStore.ts — 高级：异步 Action + 中间件
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

interface AsyncState {
  posts: Post[]
  loading: boolean
  error: string | null
  fetchPosts: () => Promise<void>
}

export const useAsyncStore = create<AsyncState>()(
  devtools(
    subscribeWithSelector((set) => ({
      posts: [],
      loading: false,
      error: null,

      fetchPosts: async () => {
        set({ loading: true, error: null }, false, 'posts/fetchStart')
        try {
          const res = await fetch('/api/posts')
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const posts = await res.json()
          set({ posts, loading: false }, false, 'posts/fetchSuccess')
        } catch (err) {
          set(
            { error: (err as Error).message, loading: false },
            false,
            'posts/fetchError'
          )
        }
      }
    })),
    { name: 'AsyncStore' }
  )
)

// 外部订阅（非 React 上下文）
useAsyncStore.subscribe(
  (state) => state.error,
  (error) => {
    if (error) console.error('Store error:', error)
  }
)
```

## 7. 权威外部资源

- [Zustand 官方文档](https://docs.pmnd.rs/zustand)
- [Redux Toolkit 官方文档](https://redux-toolkit.js.org/)
- [MobX 官方文档](https://mobx.js.org/)
- [Jotai 官方文档](https://jotai.org/)
- [React 官方 — Thinking in React](https://react.dev/learn/thinking-in-react)
- [Flux 架构官方文档](https://facebook.github.io/flux/)
- [XState 官方文档](https://stately.ai/docs/xstate)
- [Recoil 官方文档](https://recoiljs.org/)
- [State of JS — State Management](https://stateofjs.com/en-US/other-tools/state_management)

## 8. 与相邻模块的关系

- **14-execution-flow**: 执行顺序与异步控制
- **18-frontend-frameworks**: 前端框架的状态管理
- **53-app-architecture**: 应用架构中的数据层
