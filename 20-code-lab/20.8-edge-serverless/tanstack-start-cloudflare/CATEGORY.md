---
dimension: 综合
sub-dimension: Tanstack start cloudflare
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Tanstack start cloudflare 核心概念与工程实践。

## 包含内容

- 本模块聚焦 tanstack start cloudflare 核心概念与工程实践。
- 涵盖 TanStack Start 框架基础设置、类型安全服务端函数、认证集成与边缘性能优化。

## 子模块速查

| 子模块 | 类型 | 说明 |
|--------|------|------|
| 01-basic-setup/ | 目录 | 框架初始化、SSR 与边缘适配 |
| 02-server-functions/ | 目录 | createServerFn 与 RPC 调用 |
| 03-auth/ | 目录 | OAuth2 PKCE 与边缘 Session |
| 04-performance/ | 目录 | 流式 SSR、缓存与 Islands |
| README.md | 文档 | 模块入口与快速开始 |
| THEORY.md | 文档 | TanStack Start 理论形式化定义 |
| index.ts | 源码 | 模块统一导出 |

## 代码示例

```typescript
// index.ts — TanStack Start Cloudflare 统一入口
export { default as appConfig } from './app.config';
export * from './01-basic-setup/root';
export * from './02-server-functions/todo';
export * from './03-auth/oauth-pkce';
export * from './04-performance/edge-cache';

// app.config.ts — 核心配置
import { defineConfig } from '@tanstack/react-start/config';

export default defineConfig({
  server: {
    preset: 'cloudflare-pages',
    rollupConfig: { output: { format: 'esm' } },
  },
});
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
## 目录内容

- 📁 01-basic-setup
- 📁 02-server-functions
- 📁 03-auth
- 📁 04-performance
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 index.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| TanStack Start Docs | 官方文档 | [tanstack.com/start/latest](https://tanstack.com/start/latest) |
| TanStack Router | 官方文档 | [tanstack.com/router/latest](https://tanstack.com/router/latest) |
| TanStack Query | 官方文档 | [tanstack.com/query/latest](https://tanstack.com/query/latest) |
| Cloudflare Pages | 官方文档 | [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages/) |
| Vinxi Universal Dev Server | 源码 | [github.com/nksaraf/vinxi](https://github.com/nksaraf/vinxi) |

---

*最后更新: 2026-04-29*
