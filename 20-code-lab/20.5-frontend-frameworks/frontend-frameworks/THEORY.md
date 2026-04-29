# 前端框架 — 理论基础

## 1. 响应式系统

响应式编程是前端框架的核心范式，数据变化自动驱动视图更新：

### 1.1 基于依赖追踪（Vue / MobX）

- 运行时追踪属性访问，建立依赖图
- 数据变化时通知依赖的副作用（渲染函数、计算属性）
- 优点：自动、精确；缺点：运行时开销

### 1.2 基于信号（Solid / Preact Signals / Vue Vapor）

- 细粒度订阅：每个信号独立追踪订阅者
- 编译优化：静态模板分析减少运行时追踪
- 优点：高性能、低内存；缺点：需要显式使用信号 API

### 1.3 基于不可变数据（React）

- 状态不可变，每次更新创建新引用
- 通过比对引用判断是否需要重新渲染
- 优点：可预测、时间旅行调试；缺点：需要 Immutable 库或结构化共享

## 2. 虚拟 DOM

在内存中维护 UI 的轻量表示，通过 Diff 算法最小化真实 DOM 操作：

- **创建阶段**: 将模板/JSX 编译为虚拟 DOM 树
- **更新阶段**: 比较新旧虚拟 DOM，生成 patch 队列
- **提交阶段**: 批量执行 DOM 操作

现代优化：编译时静态分析标记动态节点（Vue 3 Compiler、Svelte Compile）。

## 3. 服务端渲染（SSR）

| 模式 | 渲染时机 | 优点 | 缺点 |
|------|---------|------|------|
| **CSR** | 客户端 | 交互丰富 | SEO 差、首屏慢 |
| **SSR** | 服务端每次请求 | SEO 好、首屏快 | 服务器负载高 |
| **SSG** | 构建时 | 最快、CDN 友好 | 动态内容需重建 |
| **ISR** | 构建+增量更新 | 平衡 | 首次访问可能陈旧 |
| **RSC** | 服务端组件 | 零 Bundle 体积 | 学习曲线陡 |

## 4. 主流前端框架深度对比（2026）

| 特性 | React 19 | Vue 3.5 | Svelte 5 | Solid 1.9 | Angular 19 |
|------|---------|---------|----------|-----------|------------|
| **发布年份** | 2013/2024 | 2014/2020 | 2016/2024 | 2021/2024 | 2010/2024 |
| **响应式模型** | 不可变 + Compiler | Proxy 依赖追踪 | 编译时信号（Runes）| 细粒度信号 | Signals + Zone.js |
| **虚拟 DOM** | ✅ | ✅ | ❌（编译为命令式 DOM）| ❌ | ✅ |
| **编译策略** | React Compiler（可选）| 模板编译 | Svelte Compiler | JSX 编译 | AOT 编译 |
| **运行时大小** | ~40 kB | ~28 kB | ~5 kB | ~7 kB | ~60 kB |
| **学习曲线** | 中等 | 平缓 | 平缓 | 中等 | 陡峭 |
| **官方路由** | React Router | Vue Router | SvelteKit | Solid Router | Angular Router |
| **官方状态** | Context + 第三方 | Pinia | Svelte Stores | Solid Signals | RxJS + Signals |
| **元框架** | Next.js | Nuxt | SvelteKit | SolidStart | Analog |
| **RSC 支持** | ✅ 原生 | ⚠️ 实验性 | ❌ | ⚠️ 社区 | ❌ |
| **TypeScript** | 极好 | 极好 | 良好 | 极好 | 强制内置 |
| **Signals API** | useSignal（实验）| ref / shallowRef | $state / $derived | createSignal | signals（Angular 16+）|
| **并发渲染** | ✅ Concurrent Features | 无 | 无 | 无 | 无 |
| **主要维护方** | Meta | 社区（Evan You）| Vercel | 社区 | Google |
| **代表企业** | Meta、Netflix、Airbnb | 阿里、Bilibili、GitLab | NYT、Spotify | 新兴项目 | Google、Microsoft、Forbes |

### 框架选型决策矩阵

```
需要最高生态成熟度 + 招聘容易？
  ├─ 是 → React + Next.js
  └─ 否 → 性能是首要目标？
            ├─ 是 → 交互密集 → Solid；内容密集 → Svelte
            ├─ 否 → 团队偏好类型安全强约束？
            │           ├─ 是 → Angular
            │           └─ 否 → 渐进增强、易上手 → Vue
            └─ 需要 RSC / Streaming？ → React / Next.js
```

## 5. 代码示例：React Server Component（RSC）

```bash
# Next.js 15 App Router 项目创建
npx create-next-app@latest my-rsc-app --typescript --app --tailwind
```

```tsx
// app/page.tsx — Server Component（默认在服务端执行）
import { Suspense } from 'react'
import { ProductList } from './components/ProductList'
import { ProductSkeleton } from './components/ProductSkeleton'
import { RealtimePrice } from './components/RealtimePrice'

// 此 fetch 在服务端执行，结果可参与 SSR / SSG / ISR
async function getProducts(): Promise<Product[]> {
  const res = await fetch('https://api.example.com/products', {
    // Next.js 自动 dedup（去重）相同 URL 的 fetch
    next: { revalidate: 60 } // ISR：每 60 秒重新验证
  })
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

/**
 * Server Component 特性：
 * 1. 零客户端 Bundle 体积（代码不发送到浏览器）
 * 2. 直接访问后端资源（数据库、文件系统、内部 API）
 * 3. 自动代码分割和流式传输
 */
export default async function ProductPage() {
  // 注意：这里可以 await，因为整个组件在服务端异步渲染
  const productsPromise = getProducts()

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Product Catalog</h1>

      {/* Suspense 边界：实现流式 SSR */}
      <Suspense fallback={<ProductSkeleton count={6} />}>
        <ProductList productsPromise={productsPromise} />
      </Suspense>

      {/* 客户端交互组件 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Live Market Price</h2>
        <RealtimePrice symbol="BTC-USD" />
      </section>
    </main>
  )
}
```

```tsx
// app/components/ProductList.tsx — 仍可以是 Server Component
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
}

interface ProductListProps {
  productsPromise: Promise<Product[]>
}

/**
 * 接收 Promise 并在组件内 await — React 19 的 use() API 或直接 await
 * 由于本组件也是 Server Component，await 在服务端完成
 */
export async function ProductList({ productsPromise }: ProductListProps) {
  const products = await productsPromise

  return (
    <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <li key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
          <Link href={`/products/${product.id}`}>
            <Image
              src={product.image}
              alt={product.name}
              width={400}
              height={300}
              className="w-full h-48 object-cover"
              // 自动优化图片格式（WebP/AVIF）、尺寸、加载策略
            />
            <div className="p-4">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
              <p className="text-lg font-bold mt-2">${product.price.toFixed(2)}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

```tsx
// app/components/RealtimePrice.tsx — Client Component（'use client'）
'use client'

import { useState, useEffect } from 'react'

/**
 * 使用 'use client' 指令标记客户端组件
 * 该组件及其依赖会打包到客户端 Bundle
 * 适合：交互、浏览器 API、useEffect、状态管理
 */
export function RealtimePrice({ symbol }: { symbol: string }) {
  const [price, setPrice] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const ws = new WebSocket(`wss://ws.example.com/prices/${symbol}`)

    ws.onopen = () => setIsConnected(true)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setPrice(data.price)
    }
    ws.onclose = () => setIsConnected(false)

    return () => ws.close()
  }, [symbol])

  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
      />
      <span className="font-mono text-2xl">
        {price !== null ? `$${price.toLocaleString()}` : 'Loading...'}
      </span>
    </div>
  )
}
```

```tsx
// app/components/AddToCartButton.tsx — Client Component with Server Action
'use client'

import { useTransition } from 'react'
import { addToCart } from '../actions/cart' // Server Action

/**
 * Server Action：从客户端直接调用服务端函数
 * 无需手动创建 API 路由
 */
export function AddToCartButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          // 直接调用服务端函数，类型安全、自动序列化
          const result = await addToCart({ productId, quantity: 1 })
          if (result.success) {
            // 乐观更新或显示 toast
            console.log('Added to cart:', result.cartItem)
          }
        })
      }}
      className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
    >
      {isPending ? 'Adding...' : 'Add to Cart'}
    </button>
  )
}
```

```typescript
// app/actions/cart.ts — Server Action
'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

interface AddToCartInput {
  productId: string
  quantity: number
}

interface CartResult {
  success: boolean
  cartItem?: { id: string; quantity: number }
  error?: string
}

/**
 * Server Action：在服务端安全执行，可访问数据库、Cookie 等
 * 自动处理 CSRF 防护和输入序列化
 */
export async function addToCart(input: AddToCartInput): Promise<CartResult> {
  // 服务端验证
  if (input.quantity < 1) {
    return { success: false, error: 'Quantity must be at least 1' }
  }

  // 获取用户会话（服务端可直接访问 Cookie）
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session-id')?.value

  if (!sessionId) {
    return { success: false, error: 'Not authenticated' }
  }

  // 数据库操作（直接调用，无需 API 层）
  // const cartItem = await db.cartItems.create({ ... })

  // 重新验证缓存路径
  revalidatePath('/cart')

  return {
    success: true,
    cartItem: { id: input.productId, quantity: input.quantity }
  }
}
```

### RSC 架构图

```
用户请求 → Next.js Server
              │
              ├── Server Components（服务端渲染）
              │     ├── 数据获取（直接 DB / API）
              │     ├── 零客户端 Bundle
              │     └── 输出：RSC Payload（流式）
              │
              ├── Client Components（浏览器 Hydrate）
              │     ├── 交互逻辑
              │     ├── useState / useEffect
              │     └── 输出：JS Bundle
              │
              └── Server Actions（RPC 调用）
                    ├── 表单提交
                    ├── 直接服务端执行
                    └── 自动渐进增强
```

## 6. 权威外部资源

- [React 官方文档](https://react.dev/)
- [Vue 官方文档](https://vuejs.org/)
- [Svelte 官方文档](https://svelte.dev/)
- [Solid 官方文档](https://www.solidjs.com/)
- [Angular 官方文档](https://angular.dev/)
- [Next.js 官方文档](https://nextjs.org/)
- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Vercel — How React Server Components Work](https://vercel.com/blog/how-react-server-components-work)
- [State of JS 2024](https://stateofjs.com/)
- [Web Framework Benchmarks](https://github.com/krausest/js-framework-benchmark)

## 7. 与相邻模块的关系

- **52-web-rendering**: 渲染技术的深度分析
- **51-ui-components**: UI 组件设计与系统
- **53-app-architecture**: 前端应用架构
