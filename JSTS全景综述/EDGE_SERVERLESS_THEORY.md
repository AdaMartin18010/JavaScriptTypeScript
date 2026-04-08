# 边缘 Serverless 计算理论与实践

> 本文档深入探讨边缘计算与 Serverless 架构的核心理论、技术实现和最佳实践。

---

## 目录

- [边缘 Serverless 计算理论与实践](#边缘-serverless-计算理论与实践)
  - [目录](#目录)
  - [一、边缘计算的理论基础](#一边缘计算的理论基础)
    - [1.1 核心驱动力](#11-核心驱动力)
    - [1.2 延迟理论模型](#12-延迟理论模型)
      - [边缘 vs 中心化延迟对比](#边缘-vs-中心化延迟对比)
    - [1.3 带宽经济学](#13-带宽经济学)
    - [1.4 隐私与合规理论](#14-隐私与合规理论)
    - [1.5 最佳实践](#15-最佳实践)
  - [二、Serverless 计算的形式化](#二serverless-计算的形式化)
    - [2.1 形式化定义](#21-形式化定义)
    - [2.2 FaaS 架构](#22-faas-架构)
    - [2.3 BaaS 组件](#23-baas-组件)
    - [2.4 代码示例](#24-代码示例)
    - [2.5 性能对比](#25-性能对比)
  - [三、Vercel Edge Functions 架构](#三vercel-edge-functions-架构)
    - [3.1 架构概览](#31-架构概览)
    - [3.2 运行时模型](#32-运行时模型)
    - [3.3 代码示例](#33-代码示例)
    - [3.4 性能对比](#34-性能对比)
    - [3.5 最佳实践](#35-最佳实践)
  - [四、Cloudflare Workers 隔离模型](#四cloudflare-workers-隔离模型)
    - [4.1 架构与隔离模型](#41-架构与隔离模型)
    - [4.2 隔离技术详解](#42-隔离技术详解)
    - [4.3 代码示例](#43-代码示例)
    - [4.4 性能对比](#44-性能对比)
    - [4.5 最佳实践](#45-最佳实践)
  - [五、AWS Lambda 执行模型和冷启动](#五aws-lambda-执行模型和冷启动)
    - [5.1 执行模型架构](#51-执行模型架构)
    - [5.2 冷启动 vs 热启动](#52-冷启动-vs-热启动)
    - [5.3 冷启动优化对比](#53-冷启动优化对比)
    - [5.4 代码示例](#54-代码示例)
    - [5.5 最佳实践](#55-最佳实践)
  - [六、Deno Deploy 即时边缘部署](#六deno-deploy-即时边缘部署)
    - [6.1 架构概览](#61-架构概览)
    - [6.2 即时部署流程](#62-即时部署流程)
    - [6.3 代码示例](#63-代码示例)
    - [6.4 性能对比](#64-性能对比)
  - [七、边缘缓存策略](#七边缘缓存策略)
    - [7.1 缓存策略架构](#71-缓存策略架构)
    - [7.2 缓存策略详解](#72-缓存策略详解)
    - [7.3 代码示例](#73-代码示例)
    - [7.4 最佳实践](#74-最佳实践)
  - [八、边缘数据库](#八边缘数据库)
    - [8.1 架构对比](#81-架构对比)
    - [8.2 代码示例](#82-代码示例)
  - [九、边缘 AI 推理](#九边缘-ai-推理)
    - [9.1 TensorFlow.js @ Edge 架构](#91-tensorflowjs--edge-架构)
    - [9.2 性能对比](#92-性能对比)
    - [9.3 代码示例](#93-代码示例)
    - [9.4 最佳实践](#94-最佳实践)
  - [十、Serverless 的性能优化](#十serverless-的性能优化)
    - [10.1 Bundle 大小优化](#101-bundle-大小优化)
    - [10.2 运行时选择](#102-运行时选择)
    - [10.3 代码示例](#103-代码示例)
    - [10.4 性能监控指标](#104-性能监控指标)
    - [10.5 总结](#105-总结)
  - [附录: 对比总结表](#附录-对比总结表)
    - [边缘平台对比](#边缘平台对比)
    - [缓存策略对比](#缓存策略对比)
    - [边缘数据库对比](#边缘数据库对比)

---

## 一、边缘计算的理论基础

### 1.1 核心驱动力

边缘计算的兴起源于三大核心问题：延迟、带宽和隐私。

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        边缘计算核心驱动力                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────┐      ┌──────────┐      ┌──────────┐                     │
│   │  延迟    │      │  带宽    │      │  隐私    │                     │
│   │  LATENCY │      │ BANDWIDTH│      │ PRIVACY  │                     │
│   └────┬─────┘      └────┬─────┘      └────┬─────┘                     │
│        │                 │                 │                           │
│        ▼                 ▼                 ▼                           │
│   ┌──────────┐      ┌──────────┐      ┌──────────┐                     │
│   │  RTT优化 │      │ 数据就近 │      │ 本地处理 │                     │
│   │ < 50ms   │      │ 减少传输 │      │ 数据不出 │                     │
│   │          │      │ 节省成本 │      │ 境合规   │                     │
│   └──────────┘      └──────────┘      └──────────┘                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 延迟理论模型

```
总延迟 = 传播延迟 + 传输延迟 + 处理延迟 + 排队延迟
```

| 延迟类型 | 公式 | 优化方法 |
|---------|------|---------|
| 传播延迟 | 距离 / 光速 | 边缘节点缩短距离 |
| 传输延迟 | 数据量 / 带宽 | 压缩、分片 |
| 处理延迟 | 协议处理时间 | 0-RTT、连接复用 |
| 排队延迟 | 队列长度 / 处理速率 | 负载均衡、流量整形 |

#### 边缘 vs 中心化延迟对比

| 场景 | 中心化 (us-east-1) | 边缘节点 | 改善倍数 |
|------|-------------------|---------|---------|
| 纽约用户 | 20ms | 5ms | **4x** |
| 伦敦用户 | 80ms | 10ms | **8x** |
| 东京用户 | 120ms | 8ms | **15x** |
| 悉尼用户 | 180ms | 12ms | **15x** |

### 1.3 带宽经济学

中心化架构 vs 边缘架构成本对比：

| 项目 | 中心化 | 边缘架构 | 节省比例 |
|------|--------|---------|---------|
| 出口带宽 | $0.09/GB | $0.01/GB | **89%** |
| 请求处理 | $2/百万 | $0.5/百万 | **75%** |
| 数据传输 | 100% | 10% (缓存后) | **90%** |

### 1.4 隐私与合规理论

```
┌─────────────────────────────────────────────────────────────┐
│                    数据主权架构                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    全球控制平面                       │   │
│  │              (配置、编排、监控)                        │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                   │
│         ┌───────────────┼───────────────┐                  │
│         ▼               ▼               ▼                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 欧盟边缘区  │  │美国边缘区   │  │亚太边缘区   │        │
│  │ (GDPR合规)  │  │(CCPA合规)   │  │(PIPL合规)   │        │
│  │             │  │             │  │             │        │
│  │ • 数据本地化│  │ • 数据加密  │  │ • 跨境传输  │        │
│  │ • 隐私计算  │  │ • 审计日志  │  │   白名单    │        │
│  │ • 同意管理  │  │ • 访问控制  │  │ • 本地存储  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  核心原则: 数据在产生地处理，敏感信息不出境                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.5 最佳实践

```typescript
// 边缘数据本地化示例
export const config = {
  runtime: 'edge',
  regions: ['iad1', 'fra1', 'hkg1'], // 指定边缘区域
};

// 根据用户地理位置路由到合规区域
function getCompliantRegion(userLocation: string): string {
  const regionMap: Record<string, string> = {
    'EU': 'fra1',      // GDPR
    'US': 'iad1',      // CCPA
    'CN': 'hkg1',      // PIPL
    'JP': 'hnd1',      // APPI
  };
  return regionMap[userLocation] || 'iad1';
}

// 边缘数据脱敏
function sanitizeAtEdge(data: UserData): SanitizedData {
  return {
    ...data,
    // 敏感字段在边缘处理，不上传到中心
    email: hashEmail(data.email),
    phone: maskPhone(data.phone),
    // 仅传输匿名化数据
  };
}
```

---

## 二、Serverless 计算的形式化

### 2.1 形式化定义

```
┌─────────────────────────────────────────────────────────────┐
│              Serverless 计算的形式化定义                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Serverless = (F, E, T, S) 其中:                            │
│                                                             │
│  F = {f₁, f₂, ..., fₙ}  函数集合                             │
│  E = {e₁, e₂, ..., eₘ}  事件集合                             │
│  T = {t₁, t₂, ..., tₖ}  触发器集合                           │
│  S = 状态管理器                                              │
│                                                             │
│  执行语义: ∀e ∈ E, ∃t ∈ T, t(e) → f ∈ F                     │
│                                                             │
│  关键特性:                                                   │
│  1. 事件驱动: 函数由事件触发执行                             │
│  2. 无状态: 执行之间不保持状态 (除非使用 S)                   │
│  3. 自动扩展: 并发度随负载自动调整                           │
│  4. 按需计费: 按实际执行时间和资源计费                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 FaaS 架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FaaS 架构模型                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        控制平面                                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │   │
│  │  │ API 网关  │ │ 身份认证  │ │ 日志监控  │ │ 计费系统  │            │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        数据平面                                  │   │
│  │                                                                 │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │   │
│  │  │  事件队列    │───▶│  调度器      │───▶│  函数执行器  │         │   │
│  │  │  (SQS/Kafka)│    │  (Scheduler)│    │  (Sandbox)  │         │   │
│  │  └─────────────┘    └─────────────┘    └─────────────┘         │   │
│  │         │                                    │                  │   │
│  │         ▼                                    ▼                  │   │
│  │  ┌─────────────┐                      ┌─────────────┐          │   │
│  │  │  事件源      │                      │  容器/沙箱   │          │   │
│  │  │ • HTTP      │                      │ • 冷启动     │          │   │
│  │  │ • Timer     │                      │ • 热启动     │          │   │
│  │  │ • Queue     │                      │ • 执行隔离   │          │   │
│  │  │ • Storage   │                      │ • 资源限制   │          │   │
│  │  └─────────────┘                      └─────────────┘          │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 BaaS 组件

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     BaaS 服务栈架构                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        FaaS 函数层                               │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │  Auth   │ │ Database│ │ Storage │ │ Search  │ │ Realtime│   │   │
│  │  │ 函数    │ │ 函数    │ │ 函数    │ │ 函数    │ │ 函数    │   │   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │   │
│  └───────┼───────────┼───────────┼───────────┼───────────┼────────┘   │
│          │           │           │           │           │             │
│  ┌───────┼───────────┼───────────┼───────────┼───────────┼────────┐   │
│  │       ▼           ▼           ▼           ▼           ▼        │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │   │
│  │  │Identity │ │  NoSQL  │ │  Object │ │  Full   │ │   Web   │  │   │
│  │  │Provider │ │  Store  │ │  Store  │ │  Text   │ │  Socket │  │   │
│  │  │(Cognito)│ │(DynamoDB)│ │   (S3)  │ │ Search  │ │         │  │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │   │
│  │                        BaaS 服务层                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.4 代码示例

```typescript
// ==================== FaaS 函数定义 ====================

// 1. HTTP 触发函数 (REST API)
interface APIGatewayEvent {
  httpMethod: string;
  path: string;
  headers: Record<string, string>;
  queryStringParameters: Record<string, string>;
  body: string;
}

interface Context {
  functionName: string;
  memoryLimitInMB: string;
  invokedFunctionArn: string;
  awsRequestId: string;
}

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<{ statusCode: number; body: string }> => {
  console.log('Request ID:', context.awsRequestId);

  const { httpMethod, path, body } = event;

  switch (`${httpMethod} ${path}`) {
    case 'GET /users':
      return { statusCode: 200, body: JSON.stringify(await listUsers()) };
    case 'POST /users':
      return { statusCode: 201, body: JSON.stringify(await createUser(JSON.parse(body))) };
    default:
      return { statusCode: 404, body: JSON.stringify({ error: 'Not Found' }) };
  }
};

// 2. 事件驱动函数 (SQS 队列)
export const processOrder = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const order = JSON.parse(record.body);
    await validateOrder(order);
    await processPayment(order);
    await sendConfirmation(order);
  }
};

// 3. 定时触发函数 (CloudWatch Events)
export const cleanupOldData = async (): Promise<void> => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await db.delete('logs')
    .where('created_at', '<', thirtyDaysAgo)
    .execute();
};

// ==================== BaaS 集成 ====================

// 使用第三方 BaaS 服务
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// 数据访问层抽象
class UserRepository {
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(user: CreateUserDTO): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// ==================== 边缘 Serverless 函数 ====================

// Vercel Edge Function
export const config = {
  runtime: 'edge',
};

export default async function edgeHandler(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  // 边缘缓存检查
  const cache = caches.default;
  const cacheKey = new Request(request.url);
  let response = await cache.match(cacheKey);

  if (!response) {
    const user = await fetchUserFromOrigin(userId!);
    response = new Response(JSON.stringify(user), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    });
    await cache.put(cacheKey, response.clone());
  }

  return response;
}
```

### 2.5 性能对比

| 指标 | 传统服务器 | FaaS Serverless | 边缘 FaaS |
|------|-----------|----------------|-----------|
| 冷启动时间 | N/A (常驻) | 100-1000ms | 0-5ms |
| 平均响应延迟 | 10-50ms | 50-500ms | 5-50ms |
| 并发扩展 | 分钟级 | 秒级 | 毫秒级 |
| 基础设施管理 | 完全托管 | 无服务器 | 无服务器 |
| 成本模型 | 预留付费 | 按调用付费 | 按CPU时间付费 |
| 可用区覆盖 | 单区域 | 多区域 | 全球边缘 |

---

## 三、Vercel Edge Functions 架构

### 3.1 架构概览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Vercel Edge Functions 架构                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Vercel 控制平面                             │   │
│  │         (构建、部署、域名管理、分析)                              │   │
│  └────────────────────────────┬────────────────────────────────────┘   │
│                               │                                         │
│                               ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Vercel Edge Network                         │   │
│  │                                                                  │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │   │
│  │  │  iad1   │  │  fra1   │  │  hkg1   │  │  gru1   │            │   │
│  │  │华盛顿DC │  │ 法兰克福 │  │  香港   │  │ 圣保罗  │            │   │
│  │  │         │  │         │  │         │  │         │            │   │
│  │  │┌───────┐│  │┌───────┐│  │┌───────┐│  │┌───────┐│            │   │
│  │  ││V8     ││  ││V8     ││  ││V8     ││  ││V8     ││            │   │
│  │  ││Isolate││  ││Isolate││  ││Isolate││  ││Isolate││            │   │
│  │  │└───────┘│  │└───────┘│  │└───────┘│  │└───────┘│            │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │   │
│  │                                                                  │   │
│  │  全球 100+ 边缘节点，基于 AWS CloudFront + Lambda@Edge           │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 运行时模型

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Edge Function 运行时生命周期                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  构建阶段                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  1. 构建时 (Build Time)                                          │   │
│  │     • Next.js / SvelteKit / Nuxt 构建                           │   │
│  │     • 生成静态页面 (SSG)                                          │   │
│  │     • 边缘函数代码打包                                            │   │
│  │     • 中间件代码提取                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                               │                                         │
│                               ▼                                         │
│  部署阶段                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  2. 部署时 (Deploy Time)                                         │   │
│  │     • 代码分发到全球边缘节点                                       │   │
│  │     • V8 Isolate 预初始化                                         │   │
│  │     • 路由规则配置                                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                               │                                         │
│                               ▼                                         │
│  运行时阶段                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  3. 请求时 (Request Time)                                        │   │
│  │     • 最近边缘节点接收请求                                        │   │
│  │     • V8 Isolate 复用或新建                                       │   │
│  │     • 中间件执行 (Middleware)                                    │   │
│  │     • Edge Function 执行                                          │   │
│  │     • 响应返回 (支持流式传输)                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.3 代码示例

```typescript
// ==================== Edge API Route ====================
// app/api/hello/route.ts (Next.js App Router)

export const runtime = 'edge'; // 指定 Edge Runtime

export async function GET(request: Request) {
  // 获取地理位置信息
  const country = request.headers.get('x-vercel-ip-country');
  const city = request.headers.get('x-vercel-ip-city');
  const latitude = request.headers.get('x-vercel-ip-latitude');
  const longitude = request.headers.get('x-vercel-ip-longitude');

  // 基于地理位置的个性化内容
  const greeting = getLocalizedGreeting(country || 'US');

  return Response.json({
    message: greeting,
    location: { country, city, latitude, longitude },
    timestamp: new Date().toISOString(),
  });
}

// ==================== Edge Middleware ====================
// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // A/B 测试
  const testGroup = request.cookies.get('test-group')?.value ||
    (Math.random() > 0.5 ? 'A' : 'B');

  // 根据测试组重写到不同页面
  if (request.nextUrl.pathname === '/landing') {
    const url = request.nextUrl.clone();
    url.pathname = testGroup === 'A' ? '/landing-a' : '/landing-b';

    const response = NextResponse.rewrite(url);
    response.cookies.set('test-group', testGroup, { maxAge: 60 * 60 * 24 * 7 });
    return response;
  }

  // 地理围栏 (Geo-blocking)
  const country = request.geo?.country || 'US';
  const blockedCountries = ['CN', 'RU', 'IR'];

  if (blockedCountries.includes(country)) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  // 认证检查
  const token = request.headers.get('authorization');
  if (!token && request.nextUrl.pathname.startsWith('/api/protected')) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|favicon.ico).*)'],
};

// ==================== 流式响应 ====================
// app/api/stream/route.ts

export const runtime = 'edge';

export async function POST(request: Request) {
  const { message } = await request.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // 模拟 AI 流式响应
      const words = generateResponse(message).split(' ');

      for (const word of words) {
        const chunk = JSON.stringify({ word, done: false });
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      controller.enqueue(encoder.encode('data: {"done": true}\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### 3.4 性能对比

| 特性 | Node.js Runtime | Edge Runtime |
|------|----------------|--------------|
| 冷启动 | 100-500ms | 0-1ms |
| 执行环境 | Node.js 完整 API | V8 Isolate (轻量) |
| 内存限制 | 1024MB | 128MB |
| 执行超时 | 60s | 30s |
| 包大小 | 50MB | 1MB |
| npm 模块 | 全部支持 | 部分支持 (需兼容 Edge) |
| 流式支持 | 是 | 是 (更优) |

### 3.5 最佳实践

```typescript
// 1. 减少冷启动：使用全局变量缓存连接
const globalForDb = globalThis as unknown as {
  db: Database | undefined;
};

export const db = globalForDb.db ?? createDatabase();
if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

// 2. 使用 Edge Config 存储低延迟配置
import { get } from '@vercel/edge-config';

export async function middleware(request: NextRequest) {
  // Edge Config 读取延迟 < 5ms
  const maintenanceMode = await get('maintenanceMode');

  if (maintenanceMode) {
    return new NextResponse('Under Maintenance', { status: 503 });
  }

  return NextResponse.next();
}

// 3. 条件性使用 Edge Runtime
export const config = {
  runtime: 'edge',
  // 指定区域减少延迟
  regions: ['iad1', 'fra1', 'hkg1'],
};

// 4. 流式处理大响应
export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of fetchLargeData()) {
        controller.enqueue(new TextEncoder().encode(chunk));
      }
      controller.close();
    },
  });

  return new Response(stream);
}
```

---

## 四、Cloudflare Workers 隔离模型

### 4.1 架构与隔离模型

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Cloudflare Workers 隔离架构                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      全局 Cloudflare 网络                        │   │
│  │                    300+ 数据中心，遍及 100+ 国家                  │   │
│  │                                                                  │   │
│  │   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │   │
│  │   │  POP 1  │ │  POP 2  │ │  POP 3  │ │  POP N  │              │   │
│  │   │  纽约   │ │  伦敦   │ │  东京   │ │  ...    │              │   │
│  │   └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘              │   │
│  │        │           │           │           │                   │   │
│  │        ▼           ▼           ▼           ▼                   │   │
│  │   ┌─────────────────────────────────────────────────────┐     │   │
│  │   │              V8 Isolate 沙箱池                       │     │   │
│  │   │                                                      │     │   │
│  │   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │     │   │
│  │   │  │  Worker A   │  │  Worker B   │  │  Worker C   │  │     │   │
│  │   │  │  Isolate    │  │  Isolate    │  │  Isolate    │  │     │   │
│  │   │  │  (1MB heap) │  │  (1MB heap) │  │  (1MB heap) │  │     │   │
│  │   │  │             │  │             │  │             │  │     │   │
│  │   │  │ • CPU 限制  │  │ • CPU 限制  │  │ • CPU 限制  │  │     │   │
│  │   │  │ • 内存限制  │  │ • 内存限制  │  │ • 内存限制  │  │     │   │
│  │   │  │ • 时间限制  │  │ • 时间限制  │  │ • 时间限制  │  │     │   │
│  │   │  └─────────────┘  └─────────────┘  └─────────────┘  │     │   │
│  │   │                                                      │     │   │
│  │   │  隔离机制:                                           │     │   │
│  │   │  • 进程级隔离 (Linux namespaces)                     │     │   │
│  │   │  • V8 Isolate (内存隔离)                             │     │   │
│  │   │  • Spectre 缓解 (站点隔离)                           │     │   │
│  │   └─────────────────────────────────────────────────────┘     │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 隔离技术详解

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    V8 Isolate 隔离技术                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  传统容器隔离 vs V8 Isolate 隔离:                                        │
│                                                                         │
│  ┌─────────────────────────┐      ┌─────────────────────────┐          │
│  │      容器隔离            │      │     V8 Isolate 隔离      │          │
│  ├─────────────────────────┤      ├─────────────────────────┤          │
│  │                         │      │                         │          │
│  │  ┌─────────────────┐   │      │  ┌─────────────────┐    │          │
│  │  │   应用进程       │   │      │  │   V8 Isolate    │    │          │
│  │  │   + 运行时       │   │      │  │   (单线程)       │    │          │
│  │  │   + 依赖库       │   │      │  │                 │    │          │
│  │  │   (~100MB)      │   │      │  │  ~1MB 内存占用   │    │          │
│  │  └────────┬────────┘   │      │  └────────┬────────┘    │          │
│  │           │            │      │           │             │          │
│  │  ┌────────▼────────┐   │      │  ┌────────▼────────┐    │          │
│  │  │   Linux 容器    │   │      │  │   V8 引擎       │    │          │
│  │  │   (cgroups)     │   │      │  │   (共享实例)     │    │          │
│  │  │                 │   │      │  │                 │    │          │
│  │  │ • 独立内核      │   │      │  │ • 共享编译代码  │    │          │
│  │  │ • 独立文件系统  │   │      │  │ • 独立堆内存    │    │          │
│  │  │ • 独立网络栈    │   │      │  │ • 独立上下文    │    │          │
│  │  └────────┬────────┘   │      │  └────────┬────────┘    │          │
│  │           │            │      │           │             │          │
│  │  ┌────────▼────────┐   │      │  ┌────────▼────────┐    │          │
│  │  │    Linux 内核   │   │      │  │    Linux 进程   │    │          │
│  │  └─────────────────┘   │      │  └─────────────────┘    │          │
│  │                         │      │                         │          │
│  │  启动时间: ~100ms       │      │  启动时间: ~0ms         │          │
│  │  内存: ~100MB           │      │  内存: ~1MB             │          │
│  │  密度: 低               │      │  密度: 高 (千级/节点)    │          │
│  │                         │      │                         │          │
│  └─────────────────────────┘      └─────────────────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 代码示例

```typescript
// ==================== Worker 脚本 ====================
// src/index.ts

export interface Env {
  // 环境变量绑定
  API_KEY: string;
  // KV 存储绑定
  CACHE: KVNamespace;
  // D1 数据库绑定
  DB: D1Database;
  // R2 对象存储绑定
  BUCKET: R2Bucket;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // 路由分发
    switch (url.pathname) {
      case '/api/users':
        return handleUsers(request, env);
      case '/api/cache':
        return handleCache(request, env);
      case '/api/stream':
        return handleStream(request, env, ctx);
      default:
        return new Response('Not Found', { status: 404 });
    }
  },
};

// ==================== 使用 KV 缓存 ====================
async function handleCache(request: Request, env: Env): Promise<Response> {
  const cacheKey = new URL(request.url).searchParams.get('key');

  if (!cacheKey) {
    return new Response('Missing key', { status: 400 });
  }

  // 尝试从 KV 读取
  let value = await env.CACHE.get(cacheKey);

  if (!value) {
    // 缓存未命中，生成数据
    value = await generateExpensiveData(cacheKey);
    // 写入 KV，TTL 设置为 1 小时
    await env.CACHE.put(cacheKey, value, { expirationTtl: 3600 });
  }

  return new Response(value, {
    headers: { 'Content-Type': 'application/json' },
  });
}

// ==================== D1 数据库查询 ====================
async function handleUsers(request: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    'SELECT * FROM users WHERE active = ?'
  )
    .bind(1)
    .all();

  return Response.json(results);
}

// ==================== 流式响应与后台任务 ====================
async function handleStream(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const { message } = await request.json();

  // 创建流
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // 后台处理 (不阻塞响应)
  ctx.waitUntil(
    (async () => {
      try {
        const response = await fetchAIResponse(message);

        // 流式输出
        for await (const chunk of response) {
          await writer.write(encoder.encode(chunk));
        }
      } finally {
        writer.close();
      }
    })()
  );

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
    },
  });
}

// ==================== Durable Objects ====================
// 有状态边缘计算

export class ChatRoom {
  private sessions: WebSocket[] = [];
  private messages: string[] = [];

  constructor(
    private state: DurableObjectState,
    private env: Env
  ) {}

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade');

    if (upgradeHeader === 'websocket') {
      const [client, server] = Object.values(new WebSocketPair());

      this.sessions.push(server);

      server.accept();

      // 发送历史消息
      this.messages.forEach(msg => server.send(msg));

      server.addEventListener('message', async ({ data }) => {
        // 广播消息给所有客户端
        this.sessions.forEach(s => s.send(data));

        // 持久化到存储
        this.messages.push(data.toString());
        await this.state.storage.put('messages', this.messages);
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    return new Response('Expected WebSocket', { status: 400 });
  }
}
```

### 4.4 性能对比

| 特性 | Cloudflare Workers | AWS Lambda | Vercel Edge |
|------|-------------------|------------|-------------|
| 冷启动 | 0ms | 100-1000ms | 0-1ms |
| 全球节点 | 300+ | 30+ | 100+ |
| 执行时间限制 | 50ms (免费) / 30min (付费) | 15min | 30s |
| CPU 时间 | 10ms-30s | 无限制 | 50ms-5s |
| 内存 | 128MB | 128MB-10GB | 128MB |
| 有状态支持 | Durable Objects | 无 | 无 |
| 定价/百万请求 | $0.50 | $0.20 | $0.00 (前) |

### 4.5 最佳实践

```typescript
// 1. 使用 waitUntil 处理后台任务
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // 立即响应用户
    const response = new Response('OK');

    // 后台记录分析 (不阻塞响应)
    ctx.waitUntil(
      env.ANALYTICS.write({
        timestamp: Date.now(),
        url: request.url,
        country: request.cf?.country,
      })
    );

    return response;
  },
};

// 2. 智能缓存策略
async function getCachedOrFetch(
  cache: KVNamespace,
  key: string,
  fetcher: () => Promise<string>,
  ttl: number
): Promise<string> {
  // 尝试获取缓存
  const cached = await cache.get(key);
  if (cached) return cached;

  // 获取新数据
  const data = await fetcher();

  // 异步写入缓存 (不阻塞)
  cache.put(key, data, { expirationTtl: ttl }).catch(console.error);

  return data;
}

// 3. 使用 Durable Objects 处理会话
export class Session {
  private state: Map<string, any> = new Map();

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/get') {
      const key = url.searchParams.get('key');
      const value = this.state.get(key);
      return Response.json({ key, value });
    }

    if (url.pathname === '/set') {
      const { key, value } = await request.json();
      this.state.set(key, value);
      await this.state.storage.put('data', Object.fromEntries(this.state));
      return Response.json({ success: true });
    }

    return new Response('Not Found', { status: 404 });
  }
}

// 4. 错误处理与重试
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;

      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 100));
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }

  throw new Error('Max retries exceeded');
}
```

---

## 五、AWS Lambda 执行模型和冷启动

### 5.1 执行模型架构

AWS Lambda 使用 Firecracker MicroVM 技术实现轻量级虚拟化：

| 组件 | 功能 | 性能特点 |
|------|------|---------|
| Firecracker | 轻量级虚拟化 | < 125ms 启动 |
| Runtime API | 与 Lambda 服务通信 | HTTP 本地接口 |
| Execution Context | 执行环境复用 | 热启动 < 10ms |
| /tmp 存储 | 临时文件系统 | 512MB-10GB |

### 5.2 冷启动 vs 热启动

| 阶段 | 冷启动耗时 | 热启动耗时 |
|------|-----------|-----------|
| 创建执行环境 | 50-200ms | 0ms |
| 下载代码 | 50-200ms | 0ms |
| 启动 MicroVM | 100-300ms | 0ms |
| 初始化 Runtime | 100-500ms | 0ms |
| 执行 Handler | 实际执行 | 实际执行 |
| **总计** | **300-1200ms** | **1-10ms** |

### 5.3 冷启动优化对比

| 运行时 | 冷启动时间 | 优化建议 |
|--------|-----------|---------|
| Node.js 18 | 150-300ms | ES modules, tree-shaking |
| Python 3.11 | 100-200ms | Lambda Powertools |
| Java 17 | 500-2000ms | GraalVM Native Image |
| Go 1.x | 100-200ms | 静态二进制文件 |
| .NET 7 | 300-800ms | ReadyToRun |

### 5.4 代码示例

```typescript
// Lambda 函数处理器 - 连接复用优化
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

// 全局客户端在 Execution Context 复用时保持连接
const dynamoClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ maxAttempts: 3 })
);

// 缓存层
const cache = new Map<string, any>();

export const handler = async (event: APIGatewayEvent, context: Context) => {
  console.log('Request ID:', context.awsRequestId);

  const userId = event.pathParameters?.id;
  if (!userId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'ID required' }) };
  }

  // 检查内存缓存
  if (cache.has(userId)) {
    return { statusCode: 200, body: JSON.stringify(cache.get(userId)) };
  }

  // 查询 DynamoDB
  const result = await dynamoClient.send(
    new GetCommand({ TableName: process.env.TABLE_NAME, Key: { userId } })
  );

  if (result.Item) {
    cache.set(userId, result.Item);
  }

  return {
    statusCode: result.Item ? 200 : 404,
    body: JSON.stringify(result.Item || { error: 'Not found' }),
  };
};
```

### 5.5 最佳实践

```typescript
// 1. 幂等性设计
async function processPayment(paymentId: string, idempotencyKey: string) {
  const existing = await getPaymentByIdempotencyKey(idempotencyKey);
  if (existing) return existing;

  const result = await executePayment(paymentId);
  await saveIdempotencyRecord(idempotencyKey, result);
  return result;
}

// 2. 超时处理
export const handler = async (event: any, context: Context) => {
  const SAFE_MARGIN = 500;
  const deadline = Date.now() + context.getRemainingTimeInMillis() - SAFE_MARGIN;

  const results: any[] = [];
  for (const item of event.items) {
    if (Date.now() >= deadline) {
      await saveCheckpoint(item.index);
      break;
    }
    results.push(await processItem(item));
  }
  return results;
};
```

---

## 六、Deno Deploy 即时边缘部署

### 6.1 架构概览

```
Deno Deploy 架构:

Git Push --> Build --> Deploy --> Global Edge (100+ nodes)
              |          |
              v          v
           TypeScript  V8 Isolate
           Check      Pre-init

特性:
- 零冷启动 (< 1ms)
- 原生 TypeScript
- Web 标准 API
- 内置权限模型
```

### 6.2 即时部署流程

| 阶段 | 时间 | 操作 |
|------|------|------|
| Git 触发 | < 1s | Webhook 接收 push |
| 构建 | < 30s | 类型检查、打包 |
| 全球部署 | < 10s | 分发到边缘节点 |
| 总时间 | < 1分钟 | 全球可用 |

### 6.3 代码示例

```typescript
// Deno Deploy 基础示例
import { Hono } from 'https://deno.land/x/hono/mod.ts';

const app = new Hono();

// KV 存储
const kv = await Deno.openKv();

app.get('/', (c) => {
  return c.json({
    runtime: 'Deno',
    version: Deno.version.deno,
    region: Deno.env.get('DENO_REGION'),
  });
});

app.get('/counter/:id', async (c) => {
  const id = c.req.param('id');
  const result = await kv.atomic()
    .sum(['counters', id], 1n)
    .commit();
  return c.json({ id, count: result.ok });
});

// WebSocket 支持
app.get('/ws', (c) => {
  const { socket, response } = Deno.upgradeWebSocket(c.req.raw);
  socket.onmessage = (e) => socket.send(`Echo: ${e.data}`);
  return response;
});

Deno.serve(app.fetch);
```

### 6.4 性能对比

| 特性 | Deno Deploy | Cloudflare Workers | Vercel Edge |
|------|-------------|-------------------|-------------|
| 冷启动 | 0ms | 0ms | 0-1ms |
| 部署时间 | < 1分钟 | < 5分钟 | < 2分钟 |
| TypeScript | 原生 | 需编译 | 需编译 |
| WebSocket | 原生 | 需 DO | 有限 |

---

## 七、边缘缓存策略

### 7.1 缓存策略架构

```
用户请求 --> Edge Layer --> Origin Layer
              |
    +---------+---------+
    v         v         v
   CDN       ISR       DPR
静态缓存   增量再生   按需再生
```

### 7.2 缓存策略详解

| 策略 | 延迟 | 实时性 | 适用场景 |
|------|------|--------|---------|
| SSG | < 50ms | 构建时 | 营销页面 |
| CDN | < 50ms | TTL控制 | 静态资源 |
| ISR | < 100ms | 分钟级 | 博客、电商 |
| SSR | < 500ms | 实时 | 个性化内容 |
| DPR | < 50ms | API触发 | 大型站点 |

### 7.3 代码示例

```typescript
// Next.js ISR
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await fetchPopularPosts();
  return posts.map(p => ({ slug: p.slug }));
}

// Edge 缓存控制
export async function GET(request: Request) {
  const data = await fetchData();
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=300',
      'CDN-Cache-Control': 'public, max-age=60',
    },
  });
}
```

### 7.4 最佳实践

```typescript
// 分级缓存策略
export async function GET(request: Request) {
  return new Response(JSON.stringify(data), {
    headers: {
      'Cache-Control': 'public, max-age=60',
      'CDN-Cache-Control': 'public, s-maxage=300',
      'Vercel-CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
```

---

## 八、边缘数据库

### 8.1 架构对比

| 数据库 | 读取延迟 | 写入延迟 | 一致性 | 定价 |
|--------|---------|---------|--------|------|
| Turso | < 10ms | < 100ms | 最终一致 | $0.25/百万行 |
| Cloudflare D1 | < 50ms | < 100ms | 强一致 | $5/百万行 |
| FaunaDB | < 50ms | < 100ms | 强一致 | $0.25/百万读 |
| Upstash Redis | < 5ms | < 5ms | 最终一致 | $0.2/10万请求 |

### 8.2 代码示例

```typescript
// Turso (SQLite@Edge)
import { createClient } from '@libsql/client/web';

const turso = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function getUserById(id: string) {
  const result = await turso.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id],
  });
  return result.rows[0];
}

// Cloudflare D1
export default {
  async fetch(request: Request, env: { DB: D1Database }) {
    const { results } = await env.DB.prepare('SELECT * FROM users').all();
    return Response.json(results);
  },
};

// Upstash Redis
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const data = await fetcher();
  await redis.set(key, data, { ex: ttl });
  return data;
}
```

---

## 九、边缘 AI 推理

### 9.1 TensorFlow.js @ Edge 架构

```
模型部署选项:

1. 预加载模型 (推荐小模型 < 10MB)
   代码 --> 边缘节点 --> 本地推理 --> 响应

2. 按需加载模型
   代码 --> 检查缓存 --> 加载模型 --> 推理 --> 响应

3. 模型分片
   大模型分割 --> 按需加载分片 --> 流式推理
```

### 9.2 性能对比

| 模型类型 | 大小 | 边缘推理时间 | 云端推理时间 |
|---------|------|-------------|-------------|
| MobileNet | 16MB | 50ms | 100ms + 网络延迟 |
| TinyBERT | 60MB | 200ms | 150ms + 网络延迟 |
| GPT-2 Small | 500MB | 不推荐使用 | 500ms |

### 9.3 代码示例

```typescript
// TensorFlow.js @ Edge (Vercel)
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-cpu';

// 使用全局缓存模型
let model: tf.LayersModel | null = null;

async function loadModel() {
  if (!model) {
    // 从远程加载或使用预加载
    model = await tf.loadLayersModel('https://cdn.example.com/model.json');
  }
  return model;
}

export const config = { runtime: 'edge' };

export async function POST(request: Request) {
  const { image } = await request.json();

  const model = await loadModel();
  const tensor = preprocessImage(image);

  // 边缘推理
  const predictions = model.predict(tensor) as tf.Tensor;
  const results = await predictions.data();

  return Response.json({ predictions: Array.from(results) });
}

// ONNX Runtime Web
import * as ort from 'onnxruntime-web';

export async function runInference(input: Float32Array) {
  const session = await ort.InferenceSession.create('/model.onnx');
  const tensor = new ort.Tensor('float32', input, [1, 224, 224, 3]);

  const results = await session.run({ input: tensor });
  return results.output.data;
}
```

### 9.4 最佳实践

```typescript
// 1. 模型量化
const quantizedModel = await tf.loadLayersModel('model-quantized.json');
// INT8 量化可减少 4x 模型大小

// 2. 缓存模型
const globalForModel = globalThis as unknown as { model: tf.LayersModel };
export const getModel = () => globalForModel.model ?? loadModel();

// 3. 批处理推理
async function batchInference(inputs: Float32Array[]) {
  const batchTensor = tf.stack(inputs.map(preprocess));
  return model.predict(batchTensor);
}

// 4. 模型分片加载 (大模型)
async function loadModelShards(shardUrls: string[]) {
  const shards = await Promise.all(
    shardUrls.map(url => fetch(url).then(r => r.arrayBuffer()))
  );
  return concatenateShards(shards);
}
```

---

## 十、Serverless 的性能优化

### 10.1 Bundle 大小优化

| 优化技术 | 效果 | 实施难度 |
|---------|------|---------|
| Tree Shaking | 减少 30-70% | 低 |
| Code Splitting | 按需加载 | 中 |
| Minification | 减少 20-40% | 低 |
| Compression | 减少 60-80% | 低 |
| 依赖替换 | 视情况而定 | 中 |

### 10.2 运行时选择

| 场景 | 推荐运行时 | 理由 |
|------|-----------|------|
| 简单 API | Node.js 18 | 生态丰富 |
| 高性能计算 | Go | 编译快、体积小 |
| 机器学习 | Python 3.11 | 库支持好 |
| 超低延迟 | Edge Runtime | 零冷启动 |

### 10.3 代码示例

```typescript
// 1. Bundle 优化 - 动态导入
export async function heavyOperation() {
  // 只在需要时加载大型库
  const { heavyLibrary } = await import('./heavy-library');
  return heavyLibrary.process();
}

// 2. 连接池管理
const globalForDb = globalThis as unknown as { db: Database };
export const db = globalForDb.db ?? createDatabase();
if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

// 3. 流式处理减少内存占用
export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of fetchLargeData()) {
        controller.enqueue(new TextEncoder().encode(chunk));
      }
      controller.close();
    },
  });
  return new Response(stream);
}

// 4. 智能缓存策略
async function cachedOperation<T>(
  key: string,
  operation: () => Promise<T>,
  ttl: number
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const result = await operation();
  await redis.setex(key, ttl, result);
  return result;
}

// 5. 错误重试与熔断
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime?: number;
  private readonly threshold = 5;
  private readonly timeout = 60000;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    if (this.failures < this.threshold) return false;
    if (!this.lastFailureTime) return false;
    return Date.now() - this.lastFailureTime < this.timeout;
  }

  private onSuccess() {
    this.failures = 0;
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
  }
}
```

### 10.4 性能监控指标

| 指标 | 目标值 | 监控工具 |
|------|-------|---------|
| P50 延迟 | < 50ms | CloudWatch/ Vercel Analytics |
| P99 延迟 | < 200ms | Datadog/ New Relic |
| 冷启动率 | < 5% | Lambda Insights |
| 错误率 | < 0.1% | Sentry/ CloudWatch |
| 内存使用 | < 70% 限制 | 内置监控 |

### 10.5 总结

边缘 Serverless 计算的关键优化点：

1. **架构层面**
   - 选择合适的运行时和区域
   - 使用边缘缓存减少回源
   - 数据库就近部署

2. **代码层面**
   - 减少 Bundle 大小
   - 复用连接和全局状态
   - 使用流式处理

3. **运维层面**
   - 预置并发消除冷启动
   - 智能重试和熔断
   - 全面的监控告警

---

## 附录: 对比总结表

### 边缘平台对比

| 特性 | Vercel Edge | Cloudflare Workers | Deno Deploy | AWS Lambda |
|------|-------------|-------------------|-------------|------------|
| 冷启动 | 0-1ms | 0ms | 0ms | 100-1000ms |
| 全球节点 | 100+ | 300+ | 35+ | 30+ |
| 内存限制 | 128MB | 128MB | 512MB | 128MB-10GB |
| 执行超时 | 30s | 50ms-30min | 60s | 15min |
| TypeScript | 需编译 | 需编译 | 原生 | 需编译 |
| 定价/百万 | $0-20 | $0.50 | $2-5 | $0.20 |

### 缓存策略对比

| 策略 | 延迟 | 实时性 | 最佳场景 |
|------|------|--------|---------|
| CDN | < 50ms | TTL | 静态资源 |
| ISR | < 100ms | 分钟级 | 内容站点 |
| DPR | < 50ms | API触发 | 大型电商 |
| SSR | < 500ms | 实时 | 后台管理 |

### 边缘数据库对比

| 数据库 | 读取 | 写入 | 一致性 | 最佳场景 |
|--------|------|------|--------|---------|
| Turso | < 10ms | < 100ms | 最终 | 读多写少 |
| D1 | < 50ms | < 100ms | 强一致 | 事务应用 |
| Fauna | < 50ms | < 100ms | 强一致 | 复杂查询 |
| Upstash | < 5ms | < 5ms | 最终 | 缓存/会话 |

---

*文档版本: 1.0*
*最后更新: 2026-04-08*
