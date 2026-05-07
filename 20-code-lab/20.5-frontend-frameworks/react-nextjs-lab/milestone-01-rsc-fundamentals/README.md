# M1: React Server Components 基础实验

## 目标

理解 RSC 的核心概念：服务端组件 vs 客户端组件的边界、渲染流程、数据获取模式。

## 实验环境

```bash
cd milestone-01-rsc-fundamentals
npx create-next-app@latest rsc-lab --typescript --tailwind --app --no-src-dir
cd rsc-lab
```

## 实验任务

### 任务 1: 服务端组件 vs 客户端组件

创建以下文件结构，观察不同组件的渲染行为差异：

```
app/
├── page.tsx              # Server Component (默认)
├── ClientCounter.tsx     # 'use client' 标记
└── ServerData.tsx        # 纯服务端数据获取
```

**核心观察点:**

- 服务端组件的 bundle size 影响
- 客户端组件的 hydration 过程
- `console.log` 在服务端 vs 客户端的输出位置

### 任务 2: 服务端数据获取

```tsx
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 }
  });
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

**实验要点:**

- 观察 Network Tab：数据请求发生在服务端还是客户端？
- 查看页面源码：HTML 是否已包含数据？
- 修改 `revalidate` 值，测试 ISR 行为

### 任务 3: 组件传递规则

测试以下场景哪些能工作、哪些会报错：

```tsx
// 场景 A: 服务端组件导入客户端组件 ✅
import ClientButton from './ClientButton';

// 场景 B: 客户端组件直接导入服务端组件 ❌
// 需要通过 props.children 传递
```

## 验证清单

- [ ] `next build` 成功，无 RSC 边界错误
- [ ] 浏览器 Network Tab 无直接的数据 API 请求（由服务端获取）
- [ ] 页面源码包含完整的渲染后 HTML
- [ ] 客户端组件的交互事件正常响应

## 延伸阅读

- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Next.js App Router 文档](https://nextjs.org/docs/app)
