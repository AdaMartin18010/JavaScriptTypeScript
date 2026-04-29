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


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| LaunchDarkly Docs | 官方文档 | [docs.launchdarkly.com](https://docs.launchdarkly.com/) |
| Unleash | 开源特性开关 | [docs.getunleash.io](https://docs.getunleash.io/) |
| Martin Fowler — Feature Toggles | 权威文章 | [martinfowler.com](https://martinfowler.com/articles/feature-toggles.html) |
| OpenFeature | 开放标准 | [openfeature.dev](https://openfeature.dev/) |

---

*最后更新: 2026-04-29*
