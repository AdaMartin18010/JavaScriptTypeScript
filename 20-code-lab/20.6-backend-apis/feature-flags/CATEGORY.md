---
dimension: 综合
sub-dimension: Feature flags
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Feature flags 核心概念与工程实践。

## 包含内容

- 本模块聚焦 feature flags 核心概念与工程实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 feature-flag-system.test.ts
- 📄 feature-flag-system.ts
- 📄 feature-toggles.test.ts
- 📄 feature-toggles.ts
- 📄 index.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 子模块索引

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| `feature-flag-system/` | 规则引擎驱动的功能开关系统 | `feature-flag-system.ts`, `feature-flag-system.test.ts` |
| `feature-toggles/` | 运行时动态切换与灰度发布 | `feature-toggles.ts`, `feature-toggles.test.ts` |
| `index/` | 模块入口与公共 API 导出 | `index.ts` |

## 代码示例

### 基于上下文的特性开关

```typescript
type Context = { userId: string; region: string; betaGroup?: boolean };

class FeatureFlagSystem {
  private rules = new Map<string, (ctx: Context) => boolean>();

  register(flag: string, rule: (ctx: Context) => boolean) {
    this.rules.set(flag, rule);
  }

  isEnabled(flag: string, ctx: Context): boolean {
    const rule = this.rules.get(flag);
    return rule ? rule(ctx) : false;
  }
}

const flags = new FeatureFlagSystem();
flags.register('new-dashboard', (c) => c.betaGroup === true);
```

## 代码示例：百分比灰度发布与一致性哈希

```typescript
// feature-toggles.ts — 百分比 rollout，保证同一用户始终看到相同结果
import { createHash } from 'crypto';

interface RolloutConfig {
  percentage: number;     // 0-100
  salt: string;           // 防止不同 flag 哈希冲突
  stickiness: 'userId' | 'sessionId' | 'ip';
}

class PercentageRollout {
  private configs = new Map<string, RolloutConfig>();

  setConfig(flag: string, config: RolloutConfig) {
    this.configs.set(flag, config);
  }

  isEnabled(flag: string, context: Record<string, string>): boolean {
    const config = this.configs.get(flag);
    if (!config) return false;

    const key = context[config.stickiness];
    if (!key) return false;

    // 一致性哈希：保证同一 key 对同一 flag 的结果稳定
    const hash = createHash('sha256')
      .update(`${flag}:${config.salt}:${key}`)
      .digest('hex');
    
    // 取前 8 位 hex 转数字，映射到 0-9999
    const bucket = parseInt(hash.slice(0, 8), 16) % 10000;
    const threshold = config.percentage * 100;

    return bucket < threshold;
  }
}

// 使用示例
const rollout = new PercentageRollout();
rollout.setConfig('ai-assistant', {
  percentage: 10,      // 10% 用户
  salt: 'v1-2026q2',
  stickiness: 'userId',
});

// 同一用户始终返回相同结果
console.log(rollout.isEnabled('ai-assistant', { userId: 'user-123' })); // true/false 稳定
```

## 代码示例：A/B 测试分组

```typescript
// feature-flag-system.ts — A/B 测试实验分组
interface Experiment {
  name: string;
  variants: Array<{ name: string; weight: number }>;
}

class ABTestEngine {
  private experiments = new Map<string, Experiment>();

  register(experiment: Experiment) {
    // 校验权重和为 100
    const total = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
    if (total !== 100) throw new Error(`Experiment "${experiment.name}" weights must sum to 100`);
    this.experiments.set(experiment.name, experiment);
  }

  assignVariant(experimentName: string, userId: string): string | null {
    const experiment = this.experiments.get(experimentName);
    if (!experiment) return null;

    // 确定性分配
    const hash = createHash('sha256')
      .update(`${experimentName}:${userId}`)
      .digest('hex');
    const bucket = parseInt(hash.slice(0, 8), 16) % 100;

    let cumulative = 0;
    for (const variant of experiment.variants) {
      cumulative += variant.weight;
      if (bucket < cumulative) return variant.name;
    }
    return experiment.variants[experiment.variants.length - 1].name;
  }
}

// 使用示例
const ab = new ABTestEngine();
ab.register({
  name: 'checkout-redesign',
  variants: [
    { name: 'control', weight: 50 },
    { name: 'treatment', weight: 50 },
  ],
});

const variant = ab.assignVariant('checkout-redesign', 'user-456');
if (variant === 'treatment') {
  renderNewCheckout();
} else {
  renderClassicCheckout();
}
```

## 代码示例：OpenFeature 标准集成

```typescript
// feature-flag-system.ts — OpenFeature 客户端集成
import { OpenFeature, InMemoryProvider } from '@openfeature/server-sdk';

// 内存提供者（适合测试和简单场景）
const provider = new InMemoryProvider({
  'new-dashboard': {
    enabled: true,
    variants: {
      on: true,
      off: false,
    },
    defaultVariant: 'on',
    contextEvaluator: (ctx) => {
      if (ctx.targetingKey && ctx.betaGroup === true) return 'on';
      return 'off';
    },
  },
});

// 注册提供者
await OpenFeature.setProviderAndWait(provider);
const client = OpenFeature.getClient();

// 在业务代码中使用
async function getDashboard(ctx: { userId: string; betaGroup: boolean }) {
  const enabled = await client.getBooleanValue(
    'new-dashboard',
    false, // 默认值
    { targetingKey: ctx.userId, betaGroup: ctx.betaGroup }
  );

  return enabled ? newDashboardService() : legacyDashboardService();
}
```


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| LaunchDarkly Docs | 官方文档 | [docs.launchdarkly.com](https://docs.launchdarkly.com/) |
| Unleash | 开源特性开关 | [docs.getunleash.io](https://docs.getunleash.io/) |
| Martin Fowler — Feature Toggles | 权威文章 | [martinfowler.com](https://martinfowler.com/articles/feature-toggles.html) |
| OpenFeature | 开放标准 | [openfeature.dev](https://openfeature.dev/) |
| OpenFeature JavaScript SDK | 文档 | [openfeature.dev/docs/reference/technologies/server/javascript/](https://openfeature.dev/docs/reference/technologies/server/javascript/) |
| Split.io Feature Flags | 文档 | [help.split.io/hc/en-us](https://help.split.io/hc/en-us) |
| Flagsmith | 开源特性管理 | [docs.flagsmith.com](https://docs.flagsmith.com/) |
| Google Growth Platform — Experimentation | 指南 | [developers.google.com/google-play/console/guides/experiments](https://developers.google.com/google-play/console/guides/experiments) |

---

*最后更新: 2026-04-29*
