---
dimension: 综合
sub-dimension: Testing advanced
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Testing advanced 核心概念与工程实践。

## 包含内容

本模块聚焦以下高级测试核心概念与工程实践：

- E2E 测试架构与最佳实践
- 性能测试与基准测试方法
- 混沌测试与故障注入
- 可视化回归测试
- 契约测试（Consumer-Driven Contract）

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `e2e-testing/` | 端到端测试策略 | `e2e-testing.ts`, `e2e-testing.test.ts` |
| `performance-testing/` | 性能与负载测试 | `benchmark-suite.ts`, `load-test-k6.js` |
| `chaos-testing/` | 混沌测试与故障注入 | `fault-injection.ts`, `network-degradation.ts` |
| `visual-regression/` | 视觉回归测试 | `screenshot-compare.ts`, `storybook-test.ts` |
| `contract-testing/` | 契约测试 | `pact-consumer.ts`, `pact-provider.ts` |

## 测试方法对比

| 维度 | 单元测试 | 集成测试 | E2E 测试 | 混沌测试 |
|------|----------|----------|----------|----------|
| **测试范围** | 单一函数/模块 | 多模块协作 | 完整用户流程 | 生产环境韧性 |
| **执行速度** | ⚡ 毫秒级 | 🚀 秒级 | 🐢 分钟级 | ⏱️ 小时级 |
| **依赖隔离** | Mock 全部依赖 | 部分真实依赖 | 全真实环境 | 真实生产环境 |
| **失败定位** | 精确到函数 | 模块间边界 | 用户场景 | 系统级瓶颈 |
| **维护成本** | 低 | 中等 | 高 | 高 |
| **代表工具** | Jest, Vitest | Jest + TestContainers | Playwright, Cypress | Chaos Monkey, Gremlin |

### 代码示例：属性测试（Property-Based Testing）

```typescript
// property-test.ts — 使用 fast-check 进行属性测试

import fc from 'fast-check';

// 测试数组反转的数学性质: reverse(reverse(arr)) === arr
fc.assert(
  fc.property(fc.array(fc.integer()), (arr) => {
    return JSON.stringify(arr.reverse().reverse()) === JSON.stringify(arr);
  })
);

// 测试排序的数学性质: 排序后数组应为非递减序列
fc.assert(
  fc.property(fc.array(fc.integer()), (arr) => {
    const sorted = [...arr].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i - 1] > sorted[i]) return false;
    }
    return true;
  })
);
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
- `20-code-lab/20.9-observability-security/chaos-engineering/` — 混沌工程理论基础

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Jest Docs | 文档 | [jestjs.io](https://jestjs.io) |
| Vitest Docs | 文档 | [vitest.dev](https://vitest.dev) |
| Playwright Docs | 文档 | [playwright.dev](https://playwright.dev) |
| fast-check | 文档 | [dubzzz.github.io/fast-check](https://dubzzz.github.io/fast-check/) — 属性测试库 |
| TestContainers | 文档 | [testcontainers.com](https://testcontainers.com) — 集成测试容器化 |
| Pact Docs | 文档 | [docs.pact.io](https://docs.pact.io) — 契约测试框架 |
| Testing JavaScript (Kent C. Dodds) | 课程 | [testingjavascript.com](https://testingjavascript.com) |
| Google Testing Blog | 博客 | [testing.googleblog.com](https://testing.googleblog.com) |

---

> 此分类文档由批量生成脚本自动创建，已根据实际模块内容补充和调整。

---

*最后更新: 2026-04-29*
