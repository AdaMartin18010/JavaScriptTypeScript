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

## 代码示例

### 属性测试（Property-Based Testing）

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

### Playwright E2E 测试：Page Object 模式

```typescript
// login-page.ts — Page Object 封装
import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="submit"]');
  }

  async expectError(message: string) {
    await expect(this.page.locator('[data-testid="error"]')).toHaveText(message);
  }
}

// login.spec.ts
import { test } from '@playwright/test';
import { LoginPage } from './login-page';

test('user can log in', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login('user@example.com', 'password123');
  await expect(page).toHaveURL('/dashboard');
});
```

### 混沌测试：网络故障注入

```typescript
// chaos-network.ts — 模拟网络延迟与丢包
import { setTimeout } from 'timers/promises';

class ChaoticFetch {
  constructor(
    private latencyMs: number = 0,
    private failureRate: number = 0
  ) {}

  async fetch(url: string, init?: RequestInit): Promise<Response> {
    // 注入延迟
    if (this.latencyMs > 0) {
      await setTimeout(this.latencyMs * (0.5 + Math.random()));
    }

    // 注入随机故障
    if (Math.random() < this.failureRate) {
      throw new Error(`CHAOS: Simulated network failure for ${url}`);
    }

    return globalThis.fetch(url, init);
  }
}

// 测试重试逻辑在混沌条件下的表现
async function testResilience() {
  const chaos = new ChaoticFetch(100, 0.3); // 100ms 延迟，30% 失败率
  let attempts = 0;

  for (let i = 0; i < 10; i++) {
    try {
      attempts++;
      const res = await chaos.fetch('https://api.example.com/data');
      if (res.ok) {
        console.log(`Success after ${attempts} attempts`);
        break;
      }
    } catch (err) {
      await setTimeout(200); // 退避重试
    }
  }
}
```

### 契约测试：Pact Consumer

```typescript
// pact-consumer.ts — 消费者驱动契约测试
import { Pact } from '@pact-foundation/pact';
import { like, integer, string } from '@pact-foundation/pact/dsl/matchers';

const provider = new Pact({
  consumer: 'FrontendApp',
  provider: 'UserService',
  port: 1234,
  log: './logs/pact.log',
  dir: './pacts',
});

await provider.setup();

await provider.addInteraction({
  state: 'user with id 1 exists',
  uponReceiving: 'a request for user 1',
  withRequest: {
    method: 'GET',
    path: '/users/1',
  },
  willRespondWith: {
    status: 200,
    body: {
      id: integer(1),
      name: string('Alice'),
      email: like('alice@example.com'),
    },
  },
});

// 运行实际请求，Pact 会验证并记录契约
const user = await fetch('http://localhost:1234/users/1').then((r) => r.json());
expect(user.name).toBe('Alice');

await provider.finalize();
```

## 权威参考链接

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
| Chaos Engineering (Principles of Chaos) | 规范 | [principlesofchaos.org](https://principlesofchaos.org/) |
| k6 Load Testing | 工具 | [k6.io](https://k6.io) |
| Cypress Docs | 文档 | [docs.cypress.io](https://docs.cypress.io) |
| Storybook Testing | 文档 | [storybook.js.org/docs/writing-tests](https://storybook.js.org/docs/writing-tests) |

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
- `20-code-lab/20.9-observability-security/chaos-engineering/` — 混沌工程理论基础

---

> 此分类文档由批量生成脚本自动创建，已根据实际模块内容补充和调整。

---

*最后更新: 2026-04-29*
