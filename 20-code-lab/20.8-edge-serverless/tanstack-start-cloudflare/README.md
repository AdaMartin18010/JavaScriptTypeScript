# TanStack Start + Cloudflare 代码实验室

> 基准版本：`@tanstack/react-start@1.154.0`

本目录包含 TanStack Start 在 Cloudflare Workers 平台上从基础配置到生产实践的完整示例代码。

---

## 目录结构

```
tanstack-start-cloudflare/
├── THEORY.md                          # 边缘渲染语义、Server Function 模型、类型安全路由原理
├── 01-basic-setup/
│   ├── vite.config.ts                 # Vite + Cloudflare 插件 + TanStack Start 插件配置
│   ├── wrangler.jsonc                 # Cloudflare Workers 标准配置
│   └── package.json                   # 依赖与 scripts（含 cf-typegen）
├── 02-server-functions/
│   ├── api-server-fn.ts               # createServerFn 基础示例
│   ├── d1-example.ts                  # D1 查询示例（prepare / first / all / run）
│   └── kv-example.ts                  # KV 读写示例（get / put / delete）
├── 03-auth/
│   ├── drizzle-schema.ts              # 用户/会话/账户/验证表最小 Schema
│   └── auth-config.ts                 # better-auth + D1 (sqlite) 集成配置
├── 04-performance/
│   ├── ssr-streaming.ts               # SSR Streaming 入口/处理器配置
│   └── router-preload.ts              # Router Preloading（staleTime / gcTime）配置
├── index.ts                           # 聚合导出
└── README.md                          # 本文件
```

---

## 快速使用

### 1. 基础配置

复制 `01-basic-setup/` 下的三个文件到你的项目根目录：

```bash
cp 01-basic-setup/vite.config.ts ./vite.config.ts
cp 01-basic-setup/wrangler.jsonc ./wrangler.jsonc
cp 01-basic-setup/package.json ./package.json
```

安装依赖：

```bash
npm install
```

### 2. 本地开发

```bash
npm run dev
```

`@cloudflare/vite-plugin` 会自动模拟 Cloudflare Workers 运行时，并读取 `wrangler.jsonc` 中的 Bindings 配置。

### 3. 生成 Bindings 类型

每次修改 `wrangler.jsonc` 后运行：

```bash
npm run cf-typegen
```

这会生成 `worker-configuration.d.ts`，为 `env` 对象提供完整 TypeScript 类型。

### 4. 部署

```bash
# 首次使用需登录
npx wrangler login

# 构建并部署
npm run deploy
```

---

## 关键约束与注意事项

1. **Node.js API 兼容**：`wrangler.jsonc` 中必须包含 `"compatibility_flags": ["nodejs_compat"]`。
2. **环境变量访问**：在 Cloudflare Workers 中，**切勿**使用 `process.env`，应通过 `cloudflare:workers` 的 `env` 对象访问。
3. **Vite 插件顺序**：`cloudflare()` 插件必须位于 `tanstackStart()` 之前。
4. **预渲染与 Bindings**：若路由在 build 阶段触发静态预渲染（prerender），此时无法访问 D1/KV/R2。请在 loader 中判断 `context.cloudflare` 是否存在，或对依赖 Bindings 的路由设置 `prerender: false`。
5. **Server Function 安全**：`createServerFn` 会被编译为 RPC 端点，避免在 handler 中返回未脱敏的敏感数据。

---

## 参考链接

- [Cloudflare Workers - TanStack Start 官方指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/)
- [TanStack Start 部署文档](https://tanstack.com/router/latest/docs/framework/react/start/deployment)
- [TanStack Router 数据加载与缓存](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
