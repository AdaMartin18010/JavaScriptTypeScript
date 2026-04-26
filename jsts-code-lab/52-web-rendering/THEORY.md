# Web 渲染理论：从 SSR 到岛屿架构

> **目标读者**：前端工程师、关注性能与架构的技术负责人
> **关联文档**：[`docs/categories/52-web-rendering.md`](../../docs/categories/52-web-rendering.md)
> **版本**：2026-04
> **字数**：约 3,200 字

---

## 1. 渲染模式全景

### 1.1 渲染模式矩阵

| 模式 | 首屏 | 交互 | SEO | 服务器成本 | 代表 |
|------|------|------|-----|-----------|------|
| **CSR** | 慢 | 快 | 差 | 低 | SPA (React/Vue) |
| **SSR** | 快 | 中 | 好 | 高 | Next.js pages |
| **SSG** | 极快 | 快 | 好 | 极低 | Astro, Hugo |
| **ISR** | 快 | 快 | 好 | 中 | Next.js revalidate |
| **RSC** | 快 | 快 | 好 | 中 | Next.js App Router |
| **PPR** | 极快 | 快 | 好 | 中 | Next.js 15 |

### 1.2 渲染模式演进

```
2010: 服务端模板 (PHP/JSP)
  ↓
2015: SPA + CSR (React/Vue/Angular)
  ↓
2020: SSR 回归 (Next.js, Nuxt)
  ↓
2022: 混合模式 (SSG + ISR)
  ↓
2024: RSC + Streaming
  ↓
2025: PPR (Partial Prerendering)
```

---

## 2. React Server Components

### 2.1 RSC 的核心创新

```
传统 SSR: 服务端渲染 HTML → 客户端 hydrate → 交互
RSC:      服务端渲染组件 → 流式传输 → 客户端增量更新

关键区别：
- RSC 不生成 HTML，生成序列化的 React 树
- RSC 组件不 hydrate，没有客户端 bundle
- RSC 可以访问服务端资源（数据库、文件系统）
```

### 2.2 Server Actions

```typescript
// Server Action：服务端函数客户端直接调用
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  await db.posts.create({ title });
  revalidatePath('/posts');
}
```

**安全边界**：
- Server Actions 自动验证请求来源
- 输入验证在服务端执行
- 无需手动编写 API 路由

---

## 3. 岛屿架构 (Islands Architecture)

### 3.1 原理

```html
<!-- 静态 HTML 岛屿 -->
<header>...</header>
<main>
  <!-- 交互岛屿 -->
  <SearchWidget client:load />
  <!-- 静态内容 -->
  <article>...</article>
  <!-- 交互岛屿 -->
  <CommentSection client:visible />
</main>
<footer>...</footer>
```

**特点**：
- 页面大部分是静态 HTML
- 只有需要的部分是交互式的
- 每个岛屿独立 hydrate

### 3.2 框架实现

| 框架 | 实现方式 | 特点 |
|------|---------|------|
| **Astro** | `client:*` 指令 | 零 JS 默认 |
| **Fresh** | Preact + 岛屿 | Deno 原生 |
| **Eleventy** | WebC + 渐进增强 | 静态优先 |

---

## 4. PPR (Partial Prerendering)

### 4.1 概念

```
PPR = SSG 的静态部分 + SSR 的动态部分

页面请求:
  1. 立即返回预渲染的静态 Shell
  2. 流式插入动态内容（Suspense boundaries）
```

**Next.js 15 实现**：
```tsx
export const experimental_ppr = true;

export default function Page() {
  return (
    <>
      <StaticHeader />        {/* 预渲染 */}
      <Suspense fallback={<Skeleton />}>
        <DynamicContent />    {/* 流式动态 */}
      </Suspense>
    </>
  );
}
```

---

## 5. 性能指标

### 5.1 Core Web Vitals 与渲染

| 指标 | 目标 | 渲染模式影响 |
|------|------|-------------|
| **LCP** | < 2.5s | SSR/SSG 优于 CSR |
| **INP** | < 200ms | 岛屿架构减少 hydrate 量 |
| **CLS** | < 0.1 | 预渲染避免布局偏移 |
| **TTFB** | < 600ms | Edge 部署降低延迟 |
| **FCP** | < 1.8s | Streaming 提前首字节 |

---

## 6. 反模式

### 反模式 1：全量 hydrate

❌ 整个页面 hydrate，包括纯静态内容。
✅ 使用岛屿架构或 RSC，只 hydrate 必要部分。

### 反模式 2： waterfalls

❌ 串行数据获取：页面 → 布局 → 组件 → 子组件。
✅ 使用 `Promise.all` 或 RSC 并行获取。

---

## 7. 总结

渲染模式的选择是**性能、交互性和开发体验的权衡**。

**2026 年推荐策略**：
- 内容型网站 → Astro / Next.js SSG
- 应用型网站 → Next.js App Router (RSC + Server Actions)
- 电商平台 → PPR + Edge 部署

---

## 参考资源

- [Next.js Rendering](https://nextjs.org/docs/app/building-your-application/rendering)
- [Astro Islands](https://docs.astro.build/en/concepts/islands/)
- [Rendering on the Web](https://web.dev/rendering-on-the-web/)
- [Core Web Vitals](https://web.dev/vitals/)

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `accessibility-models.ts`
- `animations-motion-models.ts`
- `css-layout-models.ts`
- `index.ts`
- `input-handling-models.ts`
- `intelligent-rendering.ts`
- `responsive-design-models.ts`

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
