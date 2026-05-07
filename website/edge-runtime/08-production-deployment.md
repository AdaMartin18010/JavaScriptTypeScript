# 08. 生产部署与监控

## 部署清单

### 1. 环境变量配置

```bash
# .env.local (开发)
EDGE_CONFIG=your-edge-config-token
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret

# Vercel Dashboard (生产)
# 或使用 Infisical / Doppler 管理密钥
```

### 2. CI/CD 流水线

```yaml
# .github/workflows/deploy.yml
name: Deploy Edge

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          
      - name: Install
        run: npm ci
        
      - name: Lint & Type Check
        run: |
          npm run lint
          npm run typecheck
          
      - name: Test
        run: npm test
        
      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Deploy to Cloudflare
        run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
```

### 3. 监控与告警

```typescript
// 结构化日志
export async function GET(request: Request) {
  const start = Date.now();
  
  try {
    const result = await fetchData();
    
    console.log(JSON.stringify({
      level: 'info',
      method: 'GET',
      path: request.url,
      duration: Date.now() - start,
      status: 200,
      region: request.headers.get('x-vercel-id')?.split(':')[1],
    }));
    
    return Response.json(result);
  } catch (error) {
    console.log(JSON.stringify({
      level: 'error',
      method: 'GET',
      path: request.url,
      duration: Date.now() - start,
      error: error.message,
      stack: error.stack,
    }));
    
    return Response.json({ error: 'Internal Error' }, { status: 500 });
  }
}
```

## 性能基准

| 指标 | 目标值 | 监控工具 |
|------|--------|----------|
| P50 延迟 | < 50ms | Vercel Analytics / Cloudflare Analytics |
| P99 延迟 | < 200ms | 同上 |
| 错误率 | < 0.1% | Sentry / Datadog |
| 冷启动 | < 10ms | 平台内置指标 |

## 降级策略

```typescript
export async function GET(request: Request) {
  try {
    // 尝试边缘数据库
    const data = await fetchFromEdgeDB();
    return Response.json(data);
  } catch (edgeError) {
    // 降级到源站 API
    console.warn('Edge DB failed, falling back to origin');
    const data = await fetchFromOrigin();
    return Response.json(data);
  }
}
```

## 成本优化

| 优化手段 | 节省效果 |
|---------|----------|
| 缓存静态内容 | 90%+ 请求不计算 |
| 使用 Edge Config 替代数据库查询 | 消除数据库调用 |
| 批量处理写操作 | 减少请求次数 |
| 合理选择区域 | 减少跨区数据传输 |

## 延伸阅读

- [Vercel Monitoring](https://vercel.com/docs/concepts/edge-network/compression)
- [Cloudflare Analytics](https://developers.cloudflare.com/analytics/)
