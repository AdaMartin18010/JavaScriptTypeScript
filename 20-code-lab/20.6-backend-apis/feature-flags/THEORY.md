# 特性开关 理论解读

## 概述

本模块系统讲解特性开关（Feature Flag）的工程实践，涵盖开关策略设计、渐进式发布、A/B 测试与用户分群等核心机制。特性开关是现代持续交付体系中不可或缺的解耦工具，它让功能发布与代码部署分离，显著降低发布风险。

## 核心概念

### 开关生命周期管理

特性开关按用途分为发布开关、实验开关、运维开关与权限开关。发布开关和实验开关应在功能稳定或实验结束后及时移除，避免技术债务累积；运维开关与权限开关通常长期保留，用于紧急熔断和分级功能控制。

### 一致性哈希分桶

基于用户标识的一致性哈希算法确保同一用户始终落入相同的开关桶或实验组。这不仅保证了用户体验的连续性，也使得实验结果具有统计学意义，避免用户在不同变体间频繁切换。

### 依赖与组管理

开关之间可能存在依赖关系（如"新仪表盘"依赖"认证 v2"），需要在评估时递归检查。开关组则允许按业务维度批量启用或禁用一组功能，提升运维效率。

## 关键模式

| 模式 | 适用场景 | 注意事项 |
|------|----------|----------|
| 金丝雀发布 | 新功能逐步放量，观察稳定性 | 配合监控指标，设定自动回滚阈值 |
| A/B 实验 | 验证产品假设，数据驱动决策 | 确保实验组与对照组样本量足够，避免辛普森悖论 |
| Kill Switch | 线上故障时秒级关闭问题功能 | 开关检查路径必须极简，避免引入额外依赖导致自身失效 |

## 主流平台对比

| 维度 | LaunchDarkly | Unleash | Flagsmith | OpenFeature |
|------|-------------|---------|-----------|-------------|
| **托管方式** | SaaS / 企业自托管 | 开源自托管 / SaaS | SaaS / 自托管 | 纯开源规范 + SDK |
| **定价模式** | 按 MAU 计费，起步较贵 | 开源免费，Pro 按席位 | 免费额度 + 按请求 | 免费（需自建后端） |
| **实时更新** | ✅ SSE 实时推送 | ✅ 客户端轮询 / SSE | ✅ SSE | 依赖 Provider 实现 |
| **A/B 测试** | ✅ 内置高级分析 | ⚠️ 需配合外部分析 | ⚠️ 基础分桶 | ❌ 规范层面不涉及 |
| **边缘支持** | ✅ Edge SDK | ⚠️ 有限 | ⚠️ 有限 | ✅ 可对接任意 Provider |
| **治理功能** | ✅ 审批流、审计日志 | ✅ 策略约束、审批 | ⚠️ 基础审计 | ❌ 由 Provider 决定 |
| **厂商锁定** | 高 | 中 | 中 | **无**（可切换 Provider） |
| **最佳场景** | 企业级全功能需求 | 开源优先、数据主权 | 快速启动中小团队 | 多云/多厂商、避免锁定 |

> **选型建议**：追求功能全面选 LaunchDarkly；数据必须在本地选 Unleash；预算敏感选 Flagsmith；希望避免厂商锁定或已有自研开关系统，选 **OpenFeature** 统一 SDK 层。

## 代码示例

### OpenFeature SDK 使用（Node.js）

```typescript
import { OpenFeature, InMemoryProvider } from '@openfeature/server-sdk';

// 1. 配置 Provider（生产环境可替换为 LaunchDarkly/Unleash/Flagsmith Provider）
const provider = new InMemoryProvider({
  'new-checkout-ui': { enabled: true, variant: 'v2-blue' },
  'dark-mode': { enabled: false },
});
await OpenFeature.setProviderAndWait(provider);

// 2. 获取客户端
const client = OpenFeature.getClient('my-app');

// 3. 基础布尔开关
const isNewCheckout = await client.getBooleanValue('new-checkout-ui', false);
if (isNewCheckout) {
  renderCheckoutV2();
} else {
  renderCheckoutV1();
}

// 4. 带用户上下文的渐进发布（一致性哈希分桶）
const context = {
  targetingKey: 'user-12345', // 稳定用户标识
  attributes: {
    tier: 'premium',
    region: 'ap-east-1',
  },
};
const variant = await client.getStringValue('new-checkout-ui', 'v1-default', context);
renderCheckout(variant); // "v2-blue" | "v1-default"

// 5. Kill Switch — 极简路径，零依赖
const isPaymentEnabled = await client.getBooleanValue('payment-gateway', true);
if (!isPaymentEnabled) {
  return res.status(503).json({ error: 'Payment temporarily unavailable' });
}
```

### 客户端（React）OpenFeature Hook

```typescript
import { useBooleanFlagValue } from '@openfeature/react-sdk';

function Dashboard() {
  const { value: showNewWidget, error } = useBooleanFlagValue('new-widget', false);
  if (error) return <ErrorBanner error={error} />;
  return (
    <div>
      {showNewWidget ? <NewWidget /> : <LegacyWidget />}
    </div>
  );
}
```

### Unleash Node.js SDK 实战

```typescript
import { startUnleash, Unleash } from 'unleash-client';

// 连接自托管 Unleash 实例
const unleash: Unleash = await startUnleash({
  url: 'http://unleash:4242/api/',
  appName: 'payment-service',
  customHeaders: { Authorization: process.env.UNLEASH_API_TOKEN! },
});

// 带用户属性的动态开关判断
const isEnabled = unleash.isEnabled('new-payment-gateway', {
  userId: 'user-12345',
  sessionId: 'sess-abc',
  remoteAddress: '192.168.1.1',
  properties: { plan: 'enterprise', region: 'us-east-1' },
});

// 渐进发布：按 userId 末位数字分桶，逐步从 0% 提升到 100%
const rollout = unleash.isEnabled('canary-checkout-v2', {
  userId: 'user-12345',
});
```

### 金丝雀发布 Express 中间件

```typescript
import { NextFunction, Request, Response } from 'express';
import { OpenFeature } from '@openfeature/server-sdk';

function canaryMiddleware(flagName: string, rolloutPercentage: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const client = OpenFeature.getClient();
    const context = {
      targetingKey: req.user?.id ?? req.ip,
      attributes: { path: req.path, method: req.method },
    };
    const isCanary = await client.getBooleanValue(flagName, false, context);
    req.headers['x-canary'] = isCanary ? 'true' : 'false';
    next();
  };
}

// 使用：仅 5% 用户路由到新版本 API
app.use('/api/v2/orders', canaryMiddleware('orders-api-v2', 5), orderV2Router);
app.use('/api/v2/orders', orderV1Router);
```

### 开关清理策略（Node.js 定时任务）

```typescript
import { glob } from 'glob';
import { readFileSync } from 'node:fs';

interface FlagAuditEntry {
  name: string;
  createdAt: Date;
  lastEvaluatedAt?: Date;
  references: string[];
}

async function auditFeatureFlags(flagRegistry: Map<string, FlagAuditEntry>): Promise<void> {
  const sourceFiles = await glob('src/**/*.{ts,tsx}');
  const flagRefs = new Map<string, string[]>();

  for (const file of sourceFiles) {
    const content = readFileSync(file, 'utf-8');
    for (const [flagName] of flagRegistry) {
      if (content.includes(flagName)) {
        const refs = flagRefs.get(flagName) ?? [];
        refs.push(file);
        flagRefs.set(flagName, refs);
      }
    }
  }

  // 标记 30 天未引用且创建超过 90 天的开关为待清理
  const now = new Date();
  for (const [name, entry] of flagRegistry) {
    const refs = flagRefs.get(name) ?? [];
    const daysSinceCreation = (now.getTime() - entry.createdAt.getTime()) / 86400000;
    const daysSinceEval = entry.lastEvaluatedAt
      ? (now.getTime() - entry.lastEvaluatedAt.getTime()) / 86400000
      : Infinity;

    if (daysSinceCreation > 90 && daysSinceEval > 30 && refs.length === 0) {
      console.warn(`[TECH DEBT] Flag "${name}" stale — consider removal`);
    }
  }
}
```

### LaunchDarkly Node.js SDK 实战

```typescript
// launchdarkly-patterns.ts
import { init, LDClient } from 'launchdarkly-node-server-sdk';

const client: LDClient = init(process.env.LD_SDK_KEY!);

await client.waitForInitialization();

const isEnabled = client.boolVariation('new-dashboard', {
  key: 'user-12345',
  custom: { tier: 'enterprise', region: 'us-west-2' },
}, false);
```

### Flagsmith 远程配置

```typescript
// flagsmith-patterns.ts
import Flagsmith from 'flagsmith';

const flagsmith = new Flagsmith({
  environmentID: process.env.FLAGSMITH_ENV_ID!,
});

const flags = await flagsmith.getEnvironmentFlags();
const isEnabled = flags.isFeatureEnabled('new-logo');
const buttonColor = flags.getFeatureValue('button-color');
```

### 一致性哈希分桶实现

```typescript
// consistent-hash-bucket.ts
import { createHash } from 'node:crypto';

export function getBucket(userId: string, totalBuckets: number = 100): number {
  const hash = createHash('sha256').update(userId).digest('hex');
  const intHash = parseInt(hash.slice(0, 8), 16);
  return intHash % totalBuckets;
}

// 渐进发布：仅对前 10% 的桶启用
export function isInRollout(userId: string, percentage: number): boolean {
  const bucket = getBucket(userId);
  return bucket < percentage;
}
```

### NestJS 装饰器模式开关

```typescript
// feature-flag.decorator.ts
import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { OpenFeature } from '@openfeature/server-sdk';

export const FeatureFlag = Reflector.createDecorator<string>();

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const flagName = new Reflector().get(FeatureFlag, context.getHandler());
    if (!flagName) return true;
    const request = context.switchToHttp().getRequest();
    return OpenFeature.getClient().getBooleanValue(flagName, false, {
      targetingKey: request.user?.id,
    });
  }
}
```

## 关联模块

- `65-analytics` — A/B 测试的数据分析与实验结果统计
- `22-deployment-devops` — 部署策略与持续交付流水线
- `16-application-development` — 开发流程中的开关治理规范

## 参考

- [OpenFeature Specification](https://openfeature.dev/specification/)
- [OpenFeature Node.js SDK](https://www.npmjs.com/package/@openfeature/server-sdk)
- [LaunchDarkly Docs](https://docs.launchdarkly.com/)
- [Unleash Documentation](https://docs.getunleash.io/)
- [Flagsmith Documentation](https://docs.flagsmith.com/)
- [Feature Toggles (Feature Flags) — Martin Fowler](https://martinfowler.com/articles/feature-toggles.html)
- [OpenFeature React SDK](https://www.npmjs.com/package/@openfeature/react-sdk)
- [Unleash Node.js Client](https://docs.getunleash.io/reference/sdks/node)
- [LaunchDarkly Node.js Server SDK](https://docs.launchdarkly.com/sdk/server-side/node-js)
- [Flagsmith Node.js SDK](https://docs.flagsmith.com/clients/server-side/#nodejs)
- [CNCF Feature Flags Wiki](https://github.com/cncf/tag-app-delivery/blob/main/feature-flags/README.md)
- [Google SRE — Feature Flags Best Practices](https://sre.google/workbook/implementing-slos/)
- [Etsy — Feature Flags at Scale](https://www.etsy.com/codeascraft/feature-flags-at-etsy)
- [LaunchDarkly SDK Reference — Node.js](https://docs.launchdarkly.com/sdk/server-side/node-js)
- [OpenFeature .NET / Java / Go SDKs](https://openfeature.dev/docs/reference/technologies/)
- [Feature Flags Best Practices — LaunchDarkly](https://docs.launchdarkly.com/guides/best-practices)
- [Flagsmith API Documentation](https://docs.flagsmith.com/quickstart)
- 本模块 `README.md` — 模块主题与学习路径
- 本模块 `feature-flag-system.ts` — 开关规则评估与渐进发布实现
- 本模块 `feature-toggles.ts` — 开关管理器、环境配置与组管理实现
