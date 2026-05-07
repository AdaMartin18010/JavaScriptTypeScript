# 05. 边缘缓存策略

## 边缘缓存的独特优势

在 Edge Runtime 中，缓存不仅是性能优化，更是架构核心 —— 它决定了你的应用能否真正利用全球边缘节点的低延迟。

## 缓存层级

```
浏览器缓存 (Client) → CDN 缓存 (Edge) → 应用缓存 (KV/Redis) → 源站 (Origin)
     < 1ms              < 5ms               < 10ms                50-300ms
```

## 策略模式

### 1. Stale-While-Revalidate (SWR)

```typescript
export async function GET(request: Request) {
  // 1. 尝试从 CDN 缓存获取
  const cache = caches.default;
  const cached = await cache.match(request);
  
  if (cached) {
    // 在后台重新验证
    ctx.waitUntil(revalidate(request, cache));
    return cached;
  }
  
  // 2. 缓存未命中，获取并缓存
  const response = await fetchOrigin(request);
  response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400');
  await cache.put(request, response.clone());
  
  return response;
}
```

### 2. 基于 Cookie 的个性化缓存

```typescript
export async function GET(request: Request) {
  const userTier = request.headers.get('Cookie')?.match(/tier=(\w+)/)?.[1] || 'free';
  
  // 为不同用户层级缓存不同版本
  const cacheKey = new Request(request.url + `?tier=${userTier}`, request);
  
  const cache = caches.default;
  let response = await cache.match(cacheKey);
  
  if (!response) {
    response = await generateContent(userTier);
    response.headers.set('Vary', 'Cookie');
    await cache.put(cacheKey, response.clone());
  }
  
  return response;
}
```

### 3. 边缘渲染缓存 (ISR on Edge)

```typescript
// Next.js App Router + Edge Runtime
export const runtime = 'edge';

export async function GET() {
  // 手动实现 ISR 逻辑
  const cacheKey = 'homepage-html';
  const cached = await env.KV.get(cacheKey);
  
  if (cached) {
    return new Response(cached, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  const html = await renderPage();
  await env.KV.put(cacheKey, html, { expirationTtl: 60 });
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
```

## 缓存失效策略

| 策略 | 适用场景 | 实现复杂度 |
|------|----------|-----------|
| TTL | 内容更新频率固定 | 低 |
| Tag-based | 关联内容批量失效 | 中 |
| Webhook | 源站变更主动通知 | 中 |
| 版本控制 | 部署时全量刷新 | 低 |

```typescript
// Tag-based 失效
await env.KV.put('post:123', html, {
  metadata: { tags: ['post:123', 'author:456', 'category:tech'] }
});

// 批量失效
await purgeByTag('author:456'); // 清除该作者所有文章缓存
```

## 延伸阅读

- [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Cloudflare Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/)
