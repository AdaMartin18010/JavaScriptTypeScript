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

### 性能基准测试（Benchmark.js）

```typescript
// benchmark-suite.ts — 使用 tinybench 进行微基准测试
import { Bench } from 'tinybench';

const bench = new Bench({ time: 100 });

const data = Array.from({ length: 1000 }, (_, i) => i);

bench
  .add('for loop', () => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    return sum;
  })
  .add('reduce', () => {
    return data.reduce((a, b) => a + b, 0);
  })
  .add('for...of', () => {
    let sum = 0;
    for (const n of data) sum += n;
    return sum;
  });

await bench.run();

console.table(bench.table());
```

### 负载测试：k6 脚本

```typescript
// load-test-k6.ts — 使用 k6 进行 HTTP 负载测试
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // 渐进增长到 100 VU
    { duration: '5m', target: 100 },   // 保持 100 VU
    { duration: '2m', target: 200 },   // 提升到 200 VU
    { duration: '5m', target: 200 },   // 保持 200 VU
    { duration: '2m', target: 0 },     // 逐步下降
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],   // 95% 请求 < 500ms
    http_req_failed: ['rate<0.01'],     // 错误率 < 1%
  },
};

export default function () {
  const res = http.get('https://api.example.com/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

### 视觉回归测试：Playwright Screenshot

```typescript
// visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test('homepage visual regression', async ({ page }) => {
  await page.goto('/');
  // 等待关键字体与动画稳定
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixels: 100,
    mask: [page.locator('[data-testid="timestamp"]')], // 掩码动态内容
  });
});
```

### 突变测试（Stryker）

```typescript
// stryker.config.mjs — 检测测试有效性的突变测试配置
export default {
  testRunner: 'vitest',
  reporters: ['progress', 'html', 'clear-text'],
  mutator: {
    plugins: [],
  },
  coverageAnalysis: 'perTest',
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },
};
```

### TestContainers 数据库集成测试

```typescript
// integration-testcontainers.test.ts
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { Client } from 'pg';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

describe('UserRepository with real Postgres', () => {
  let container: Awaited<ReturnType<PostgreSqlContainer['start']>>;
  let client: Client;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    client = new Client({ connectionString: container.getConnectionUri() });
    await client.connect();
    await client.query(`
      CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT NOT NULL);
    `);
  });

  afterAll(async () => {
    await client.end();
    await container.stop();
  });

  it('inserts and retrieves a user', async () => {
    await client.query("INSERT INTO users (email) VALUES ('test@example.com')");
    const res = await client.query('SELECT * FROM users WHERE email = $1', ['test@example.com']);
    expect(res.rows[0].email).toBe('test@example.com');
  });
});
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
| tinybench | 仓库 | [github.com/tinylibs/tinybench](https://github.com/tinylibs/tinybench) — 现代基准测试库 |
| Lighthouse CI | 文档 | [github.com/GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci) — 性能回归持续集成 |
| Playwright Visual Comparisons | 文档 | [playwright.dev/docs/test-snapshots](https://playwright.dev/docs/test-snapshots) |
| k6 Documentation | 文档 | [grafana.com/docs/k6/latest/](https://grafana.com/docs/k6/latest/) |
| Stryker Mutator | 文档 | [stryker-mutator.io](https://stryker-mutator.io/) — JavaScript 突变测试 |
| TestContainers Node.js | 文档 | [node.testcontainers.org](https://node.testcontainers.org/) |
| Chaos Monkey for Spring Boot | 工具 | [codecentric.github.io/chaos-monkey-spring-boot](https://codecentric.github.io/chaos-monkey-spring-boot/) |
| Netflix Chaos Engineering | 博客 | [netflixtechblog.com/tagged/chaos-engineering](https://netflixtechblog.com/tagged/chaos-engineering) |
| AWS Fault Injection Simulator | 文档 | [aws.amazon.com/fis](https://aws.amazon.com/fis/) |
| OWASP Testing Guide | 文档 | [owasp.org/www-project-web-security-testing-guide](https://owasp.org/www-project-web-security-testing-guide/) |
| Google PageSpeed Insights | 工具 | [pagespeed.web.dev](https://pagespeed.web.dev/) |

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
- `20-code-lab/20.9-observability-security/chaos-engineering/` — 混沌工程理论基础

---

> 此分类文档由批量生成脚本自动创建，已根据实际模块内容补充和调整。

### 分布式追踪与测试集成

```typescript
// tracing.test.ts — 使用 OpenTelemetry 在测试中验证追踪链
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor, InMemorySpanExporter } from '@opentelemetry/sdk-trace-base';

const provider = new NodeTracerProvider();
const exporter = new InMemorySpanExporter();
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

const tracer = provider.getTracer('test-tracer');

async function tracedOperation() {
  return tracer.startActiveSpan('process-payment', async (span) => {
    span.setAttribute('amount', 99.9);
    await new Promise((r) => setTimeout(r, 10));
    span.end();
  });
}

// 测试中验证 span 生成
await tracedOperation();
const spans = exporter.getFinishedSpans();
expect(spans.some((s) => s.name === 'process-payment')).toBe(true);
```

### Lighthouse CI 性能预算测试

```json
// lighthouserc.json
{
  "ci": {
    "collect": { "url": ["http://localhost:3000/"] },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }]
      }
    }
  }
}
```

### 新增权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| OpenTelemetry Documentation | 文档 | [opentelemetry.io/docs](https://opentelemetry.io/docs/) |
| Lighthouse CI | GitHub | [github.com/GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci) |
| OWASP ZAP | 工具 | [www.zaproxy.org](https://www.zaproxy.org/) |
| Artillery.io Load Testing | 工具 | [www.artillery.io](https://www.artillery.io/) |
| Grafana k6 Documentation | 文档 | [grafana.com/docs/k6/latest](https://grafana.com/docs/k6/latest/) |

---

*最后更新: 2026-04-30*
