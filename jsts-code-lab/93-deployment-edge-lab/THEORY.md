# 边缘部署实验室 — 理论基础

## 1. 部署范式对比

| 维度 | 传统云部署 | 边缘部署 |
|------|-----------|---------|
| 基础设施 | 虚拟机/容器 | V8 Isolate / WASM |
| 冷启动 | 秒级 | 毫秒级 |
| 地理分布 | 3-5 区域 | 200+ 边缘节点 |
| 状态管理 | 数据库连接池 | KV / Durable Objects |
| 成本模型 | 按小时计费 | 按请求计费 |

## 2. 边缘平台生态

- **Vercel Edge Functions**: Next.js 原生集成，基于 Cloudflare Workers
- **Cloudflare Workers**: 最成熟的边缘平台，Durable Objects 提供状态
- **Netlify Edge Functions**: Deno 运行时，与 Netlify 生态深度集成
- **AWS Lambda@Edge**: CloudFront 集成，Node.js 运行时
- **Deno Deploy**: 原生 TypeScript，全球隔离实例

## 3. 部署策略

### 3.1 蓝绿部署

同时运行两个相同环境，通过流量切换实现零停机发布。边缘场景下利用 CDN 配置快速切换。

### 3.2 灰度发布

按用户比例（1% → 5% → 20% → 100%）逐步放量，配合特征开关实现精细控制。

### 3.3 A/B 测试

边缘层根据用户属性（地域、设备、随机哈希）路由到不同版本，收集指标后决策。

## 4. 边缘缓存策略

```
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

- `s-maxage`: CDN 缓存 60 秒
- `stale-while-revalidate`: 过期后返回旧内容并后台刷新（300 秒窗口）
- `Cache-Tag`: 细粒度缓存失效（如商品库存更新时仅清除相关标签）

## 5. 与相邻模块的关系

- **22-deployment-devops**: 传统部署与 CI/CD 流程
- **32-edge-computing**: 边缘计算架构与运行时
- **31-serverless**: Serverless 与边缘函数的对比
