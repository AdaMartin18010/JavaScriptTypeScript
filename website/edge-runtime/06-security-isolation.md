# 06. 安全模型与隔离机制

## V8 Isolates 的安全设计

Edge Runtime 的核心安全假设：**代码隔离不依赖操作系统**，而是依赖 V8 引擎本身的沙箱机制。

```
┌─────────────────────────────────────────┐
│  V8 Process                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Isolate A│ │Isolate B│ │Isolate C│   │
│  │ 用户代码 │ │ 用户代码 │ │ 用户代码 │   │
│  │ 无文件   │ │ 无文件   │ │ 无文件   │   │
│  │ 无网络   │ │ 无网络   │ │ 无网络   │   │
│  │ (除非显式)│ │ (除非显式)│ │ (除非显式)│ │
│  └─────────┘ └─────────┘ └─────────┘   │
│  共享 V8 Heap (只读代码段)               │
└─────────────────────────────────────────┘
```

## 攻击面分析

| 攻击向量 | 传统 Container | V8 Isolate |
|---------|---------------|------------|
| 内核漏洞逃逸 | 可能 | 不可能 (无内核接口) |
| 文件系统遍历 | 可能 | 不可能 (无 fs API) |
| 侧信道 (Spectre) | 存在 | 缓解 (站点隔离) |
| 资源耗尽 | 可能 | 受 CPU/内存限制 |

## 安全最佳实践

### 1. 输入验证

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150),
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = schema.safeParse(body);
  
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  
  // 安全的输入
  const { email, age } = result.data;
}
```

### 2. 密钥管理

```typescript
// ❌ 错误: 硬编码密钥
const API_KEY = 'sk-123456';

// ✅ 正确: 使用环境变量
const API_KEY = process.env.API_KEY;

// ✅ 更好: 使用 Secrets 管理服务
import { getSecret } from '@vercel/edge-config';
const API_KEY = await getSecret('API_KEY');
```

### 3. CORS 配置

```typescript
export async function OPTIONS(request: Request) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://trusted-domain.com',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

### 4. 速率限制

```typescript
import { RateLimiter } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new RateLimiter({
  redis: Redis.fromEnv(),
  limiter: RateLimiter.slidingWindow(10, '10 s'),
});

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
  
  // 处理请求
}
```

## 平台特定安全特性

| 平台 | 安全特性 |
|------|----------|
| Cloudflare Workers | mTLS 到源站, WAF 集成, Bot Management |
| Vercel Edge | DDOS 防护, WAF, 自动 HTTPS |
| Deno Deploy | 权限模型 (默认无文件/网络访问), 代码签名 |

## 延伸阅读

- [Cloudflare Security Docs](https://developers.cloudflare.com/security/)
- [OWASP Top 10 for Edge](https://cheatsheetseries.owasp.org/)
