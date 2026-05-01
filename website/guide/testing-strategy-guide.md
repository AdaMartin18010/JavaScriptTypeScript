---
title: 测试策略完全指南
description: JavaScript/TypeScript 测试金字塔、TDD/BDD、E2E 策略、覆盖率治理与 AI 测试生成
---

# 测试策略完全指南

> 最后更新: 2026-05-01
> 数据基准: Vitest 3.x, Playwright 1.51, Jest 30.x, MSW 2.x

---

## 1. 测试金字塔

```
    /
   / \      E2E (10%) — Playwright
  /   \     Integration (30%) — Vitest + MSW
 /     \    Unit (60%) — Vitest/Jest
/_______\
```

### 1.1 比例与成本模型

测试金字塔的底层逻辑是 **成本-置信度权衡**：越靠近顶层的测试，运行越慢、维护越贵、定位越困难，但对用户行为的仿真度越高。

| 层级 | 比例建议 | 单次耗时 | 维护成本 | 缺陷定位精度 | 用户仿真度 |
|------|---------|---------|---------|------------|-----------|
| **Unit** | 60-70% | < 100ms | 低 | 高（函数级） | 低 |
| **Integration** | 20-30% | < 1s | 中 | 中（模块级） | 中 |
| **E2E** | 5-10% | < 10s | 高 | 低（流程级） | 高 |
| **Visual** | 2-5% | < 1min | 高 | 中（像素级） | 高 |

> 来源：Google Testing Blog "Just Say No to More End-to-End Tests" (2015)，实践比例经 2024-2025 社区调研修正。

成本模型公式（经验值）：

```
总测试成本 = Σ(用例数 × 单次耗时 × 维护系数)
维护系数：Unit=1.0, Integration=2.5, E2E=6.0
```

一个典型中型项目（10万行 TS）的测试资产分布：

```text
Unit:        2,000 用例 × 50ms  × 1.0  →  100s  基准
Integration:   600 用例 × 300ms × 2.5  →  450s  (7.5min)
E2E:           150 用例 × 5s    × 6.0  →  4,500s (75min)
─────────────────────────────────────────────────────────
Total: 3,200 用例, CI 并行后 ~8-12min
```

---

## 2. 单元测试

### 2.1 Vitest vs Jest 深度对比

| 维度 | Vitest 3.x | Jest 30.x |
|------|-----------|-----------|
| **配置方式** | 与 Vite 共享配置 | 独立 `jest.config.js` |
| **ESM 原生** | ✅ 开箱即用 | ⚠️ 需 `--experimental-vm-modules` |
| **TypeScript** | ✅ 原生，无需 transform | 需 `ts-jest` 或 `babel-jest` |
| **启动速度** | 极快（复用 Vite 管道） | 中等（独立解析管道） |
| **Watch 模式** | 基于 Vite HMR，增量 < 50ms | 全量重跑或依赖图分析 |
| **快照测试** | 内置，与 Jest 格式兼容 | 内置，生态成熟 |
| **Mock 机制** | `vi.fn()`, `vi.mock()` | `jest.fn()`, `jest.mock()` |
| **并发测试** | `describe.concurrent()` | 需手动控制 worker |
| **浏览器模式** | ✅ `vitest --browser` | 需 `jest-environment-jsdom` |
| **源码内联测试** | ✅ `*.test.ts` 或文件内 `if (import.meta.vitest)` | ❌ 不支持 |

> 来源：Vitest 官方 Benchmark (2025-12)，Jest 官方文档 v30。

**Vitest 推荐配置（可运行）**：

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    },
    // 并发控制：CPU 核心数 - 1
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4
      }
    }
  }
})
```

**Jest 等效配置（可运行）**：

```js
// jest.config.js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80
    }
  },
  maxWorkers: '50%',
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts']
}
```

### 2.2 Mock 策略

单元测试的核心是隔离。Vitest/Jest 提供四层 Mock 能力：

```ts
// src/utils/payment.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processPayment } from './payment'
import * as stripeApi from './stripe-api'

// 1. 函数级 Mock：vi.fn()
describe('函数 Mock', () => {
  it('应记录调用参数', () => {
    const handler = vi.fn()
    handler('arg1', 42)

    expect(handler).toHaveBeenCalledWith('arg1', 42)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('应模拟返回值', async () => {
    const fetchUser = vi.fn().mockResolvedValue({ id: 1, name: 'Alice' })
    const user = await fetchUser(1)

    expect(user.name).toBe('Alice')
  })
})

// 2. 模块级 Mock：vi.mock()
describe('模块 Mock', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('应拦截 Stripe API 调用', async () => {
    // 自动提升（hoisted）到文件顶部
    vi.mock('./stripe-api', () => ({
      createCharge: vi.fn().mockResolvedValue({ id: 'ch_123', status: 'succeeded' }),
      refundCharge: vi.fn().mockResolvedValue({ id: 're_456' })
    }))

    const { createCharge } = await import('./stripe-api')
    const result = await createCharge({ amount: 1000, currency: 'usd' })

    expect(result.status).toBe('succeeded')
  })
})

// 3. 部分 Mock：vi.importActual()
describe('部分 Mock', () => {
  it('应保留原始工具函数，只 Mock API', async () => {
    const { formatAmount } = await vi.importActual('./stripe-api')

    vi.doMock('./stripe-api', async () => {
      const actual = await vi.importActual('./stripe-api')
      return {
        ...actual,
        createCharge: vi.fn().mockResolvedValue({ status: 'succeeded' })
      }
    })

    expect(formatAmount(1000)).toBe('$10.00')
  })
})

// 4. 全局 Mock：global / window
describe('全局 Mock', () => {
  it('应 Mock fetch', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] })
    } as Response)

    const res = await fetch('/api/items')
    const body = await res.json()
    expect(body.data).toEqual([])
  })

  it('应 Mock Date.now', () => {
    const mockNow = new Date('2026-01-01T00:00:00Z').getTime()
    vi.setSystemTime(mockNow)

    expect(Date.now()).toBe(mockNow)

    vi.useRealTimers() // 恢复
  })
})
```

**Mock 策略决策树**：

```text
需要 Mock 什么？
├── 外部 HTTP API → MSW（见第 3 节）
├── 数据库/文件系统 → 内存实现 / memfs / better-sqlite3(:memory:)
├── 第三方 SDK (Stripe/S3) → vi.mock() 模块级 Mock
├── 同层内部模块 → vi.fn() 间谍或 vi.mock() 同级模块
├── 时间/随机数 → vi.setSystemTime() / Math.random = vi.fn()
└── DOM API (matchMedia, IntersectionObserver) → jsdom mock + cleanup
```

### 2.3 Snapshot 测试

Snapshot 适合捕获**结构稳定、频繁回归**的输出：HTML 渲染结果、AST、错误消息、CLI 输出。

```ts
// src/components/Button.test.tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Button } from './Button'

describe('Button Snapshot', () => {
  it('应匹配主按钮快照', () => {
    const { container } = render(<Button variant="primary">Click</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('应匹配内联快照（推荐）', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>)
    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="btn btn-ghost"
        type="button"
      >
        Ghost
      </button>
    `)
  })
})
```

**Snapshot 最佳实践**：

- 快照文件必须进入代码审查（`*.snap`）
- 避免快照捕获动态数据（日期、随机 ID）
- 使用 `toMatchInlineSnapshot` 减少文件碎片化
- 定期执行 `vitest -u` 更新，但审查每一次 diff

---

## 3. 集成测试

### 3.1 MSW (Mock Service Worker)

MSW 在浏览器/Node 的**网络层**拦截请求，是集成测试的黄金标准。与模块级 Mock 的区别：MSW 拦截的是 HTTP 请求本身，被测代码无需感知测试环境。

```ts
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get('page') ?? '1'

    return HttpResponse.json({
      data: [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' }
      ],
      meta: { page: Number(page), total: 2 }
    })
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json()

    if (!body.name || !body.email) {
      return HttpResponse.json(
        { error: 'name and email are required' },
        { status: 400 }
      )
    }

    return HttpResponse.json(
      { id: 3, ...body },
      { status: 201 }
    )
  }),

  http.get('/api/users/:id', ({ params }) => {
    const { id } = params

    if (id === '999') {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return HttpResponse.json({ id: Number(id), name: 'Alice', email: 'alice@example.com' })
  })
]
```

```ts
// src/services/user-api.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from '../mocks/handlers'
import { fetchUsers, createUser, fetchUserById } from './user-api'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('User API Integration', () => {
  it('应获取分页用户列表', async () => {
    const result = await fetchUsers({ page: 1 })

    expect(result.data).toHaveLength(2)
    expect(result.meta.total).toBe(2)
  })

  it('应创建新用户并返回 201', async () => {
    const user = await createUser({ name: 'Charlie', email: 'charlie@example.com' })

    expect(user.id).toBe(3)
    expect(user.name).toBe('Charlie')
  })

  it('应处理 404 错误', async () => {
    await expect(fetchUserById(999)).rejects.toThrow('Not found')
  })

  it('应支持运行时覆盖 handler', async () => {
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json({ data: [], meta: { page: 1, total: 0 } })
      })
    )

    const result = await fetchUsers({ page: 1 })
    expect(result.data).toHaveLength(0)
  })
})
```

**MSW 2.x 迁移要点**：`rest` → `http`，`req/res/ctx` → `{ request } + HttpResponse`，类型安全性提升。

> 来源：MSW 官方文档 v2.0 Migration Guide。

### 3.2 Testing Library 理念

Testing Library 的核心哲学：**测试方式应接近用户使用方式**。

```ts
// src/components/LoginForm.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

describe('LoginForm — 用户中心测试', () => {
  it('应允许用户填写表单并提交', async () => {
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)

    // ❌ 避免：查询实现细节
    // const input = container.querySelector('input[name="email"]')

    // ✅ 推荐：通过标签文本查询（可访问性驱动）
    const emailInput = screen.getByLabelText(/邮箱/i)
    const passwordInput = screen.getByLabelText(/密码/i)
    const submitBtn = screen.getByRole('button', { name: /登录/i })

    // userEvent 比 fireEvent 更接近真实用户行为（触发连续事件）
    await userEvent.type(emailInput, 'alice@example.com')
    await userEvent.type(passwordInput, 'secret123')
    await userEvent.click(submitBtn)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'alice@example.com',
        password: 'secret123'
      })
    })
  })

  it('应在邮箱格式错误时显示提示', async () => {
    render(<LoginForm onSubmit={vi.fn()} />)

    const emailInput = screen.getByLabelText(/邮箱/i)
    await userEvent.type(emailInput, 'invalid-email')
    await userEvent.tab() // 失焦触发校验

    expect(await screen.findByText(/邮箱格式不正确/i)).toBeInTheDocument()
  })
})
```

**查询优先级**（Testing Library 推荐）：

1. `getByRole` — 最贴近屏幕阅读器
2. `getByLabelText` — 表单元素
3. `getByPlaceholderText` — 次选
4. `getByText` — 可见文本
5. `getByDisplayValue` — 当前表单值
6. `getByTestId` — 最后手段（需 `data-testid`）

### 3.3 数据库测试

Node.js 集成测试中，使用内存 SQLite 或 Testcontainers 隔离数据库状态。

```ts
// src/repositories/user.repo.test.ts
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import Database from 'better-sqlite3'
import { UserRepository } from './user.repo'

// 每个测试文件独立的内存数据库
const db = new Database(':memory:')

beforeEach(() => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  db.exec("DELETE FROM users")
})

afterAll(() => db.close())

describe('UserRepository', () => {
  it('应创建并查询用户', () => {
    const repo = new UserRepository(db)

    const created = repo.create({ name: 'Alice', email: 'alice@example.com' })
    expect(created.id).toBeDefined()

    const found = repo.findById(created.id)
    expect(found?.name).toBe('Alice')
  })

  it('应强制邮箱唯一约束', () => {
    const repo = new UserRepository(db)
    repo.create({ name: 'Alice', email: 'alice@example.com' })

    expect(() => {
      repo.create({ name: 'Alice2', email: 'alice@example.com' })
    }).toThrow(/UNIQUE constraint failed/)
  })
})
```

**PostgreSQL 真实实例（Testcontainers）**：

```ts
import { GenericContainer } from 'testcontainers'
import { Client } from 'pg'

const container = await new GenericContainer('postgres:16-alpine')
  .withEnvironment({ POSTGRES_USER: 'test', POSTGRES_PASSWORD: 'test', POSTGRES_DB: 'testdb' })
  .withExposedPorts(5432)
  .start()

const client = new Client({
  host: container.getHost(),
  port: container.getMappedPort(5432),
  user: 'test',
  password: 'test',
  database: 'testdb'
})
await client.connect()
// 执行迁移 + 测试
```

---

## 4. E2E 测试

### 4.1 Playwright vs Cypress vs Selenium

| 维度 | Playwright 1.51 | Cypress 14.x | Selenium 4.x |
|------|----------------|--------------|--------------|
| **浏览器支持** | Chromium/Firefox/WebKit | Chromium/Firefox/WebKit | 全浏览器（含移动端） |
| **执行模型** | 进程外，多浏览器并发 | 进程内，单标签页限制 | WebDriver 协议，多进程 |
| **API 风格** | 异步 `await page.click()` | 链式 `cy.get().click()` | 异步/同步混合 |
| **并行执行** | 原生 sharding，多 worker | 需 Dashboard 商业版 | Selenium Grid |
| **移动端仿真** | 设备预设 + 触摸事件 | 视口模拟 | Appium 扩展 |
| **测试生成器** | Codegen + Trace Viewer | 录制插件 | 第三方工具 |
| **CI 稳定性** | 自动等待 + 重试 + 追踪 | 自动等待 + 快照调试 | 需显式等待 |
| **TypeScript** | 原生 | 需配置 | 社区支持 |
| **包体积** | ~50MB | ~300MB+ | 依赖驱动 |

> 来源：Playwright 官方 Benchmark (2025)，State of JS 2024 E2E 工具调研。

**Playwright 可运行配置**：

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['github'] // CI 中生成 Annotations
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 7'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 14'] } }
  ],
  // 测试分片：CI 矩阵中按 shardIndex/shardTotal 拆分
  shard: {
    total: 4,
    current: Number(process.env.SHARD_INDEX ?? 1)
  }
})
```

```ts
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('结账流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')
  })

  test('完整用户下单流程', async ({ page }) => {
    // 1. 添加商品
    await page.getByTestId('add-to-cart').first().click()
    await expect(page.getByTestId('cart-count')).toHaveText('1')

    // 2. 进入结算
    await page.getByRole('button', { name: /去结算/i }).click()
    await page.waitForURL('/checkout')

    // 3. 填写地址
    await page.getByLabel(/收件人/i).fill('Alice')
    await page.getByLabel(/手机号/i).fill('13800138000')
    await page.getByLabel(/详细地址/i).fill('上海市浦东新区')

    // 4. 提交订单
    await page.getByRole('button', { name: /提交订单/i }).click()

    // 5. 断言成功页
    await page.waitForURL(/\/order\/\d+$/)
    await expect(page.getByText(/订单提交成功/i)).toBeVisible()

    // 6. 视觉快照对比
    await expect(page).toHaveScreenshot('order-success.png', {
      maxDiffPixels: 100
    })
  })

  test('库存不足时阻止下单', async ({ page }) => {
    // 使用 route 拦截并模拟 409
    await page.route('/api/orders', async (route) => {
      await route.fulfill({
        status: 409,
        body: JSON.stringify({ error: '库存不足' })
      })
    })

    await page.getByTestId('add-to-cart').first().click()
    await page.getByRole('button', { name: /去结算/i }).click()
    await page.getByRole('button', { name: /提交订单/i }).click()

    await expect(page.getByText(/库存不足/i)).toBeVisible()
  })
})
```

### 4.2 并行执行与测试分片

Playwright 原生支持 worker 级并行 + CI 矩阵分片：

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push]
jobs:
  e2e:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report-${{ matrix.shardIndex }}
          path: playwright-report/
```

> 分片策略：按测试文件哈希均匀分布，4 分片可将 30min E2E 降至 ~8min。

### 4.3 视觉回归测试

Playwright `toHaveScreenshot` + Argos CI / Chromatic：

```ts
// e2e/visual.spec.ts
import { test, expect } from '@playwright/test'

test('主页视觉回归', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // 隐藏动态元素（时间、随机 ID）
  await page.evaluate(() => {
    document.querySelectorAll('[data-testid="timestamp"]').forEach(el => {
      el.textContent = '2026-01-01 00:00:00'
    })
  })

  await expect(page).toHaveScreenshot('homepage.png', {
    animations: 'disabled',
    mask: [page.locator('[data-testid="ad-banner"]')]
  })
})
```

---

## 5. 性能测试

### 5.1 Lighthouse CI

在 CI 中持续监控 Core Web Vitals：

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": ["http://localhost:5173/", "http://localhost:5173/dashboard"],
      "startServerCommand": "npm run preview",
      "startServerReadyPattern": "ready in",
      "startServerReadyTimeout": 20000
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "first-contentful-paint": ["warn", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

```yaml
# .github/workflows/lighthouse.yml
- run: npm install -g @lhci/cli
- run: lhci autorun
```

> 来源：Google Lighthouse v12 评分标准 (2025)。

### 5.2 k6 负载测试

```js
// load-tests/api-load.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // 渐进加压到 100 VU
    { duration: '5m', target: 100 },   // 稳态
    { duration: '2m', target: 200 },   // 峰值
    { duration: '2m', target: 0 }      // 回落
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],   // 95% 请求 < 200ms
    http_req_failed: ['rate<0.01'],     // 错误率 < 1%
    http_reqs: ['rate>1000']            // RPS > 1000
  }
}

export default function () {
  const res = http.get('https://api.example.com/products')

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
    'has products array': (r) => Array.isArray(r.json('data'))
  })

  sleep(1)
}
```

运行：`k6 run --out json=results.json load-tests/api-load.js`

### 5.3 Artillery 场景测试

```yaml
# load-tests/artillery-scenario.yml
config:
  target: https://api.example.com
  phases:
    - duration: 60
      arrivalRate: 10
      rampTo: 50
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
  plugins:
    ensure:
      thresholds:
        - http.response_time.p95: 200
        - http.error_rate: 1

scenarios:
  - name: "Browse and checkout"
    weight: 80
    flow:
      - get:
          url: "/products"
      - think: 2
      - get:
          url: "/products/{{ $randomItem([1,2,3,4,5]) }}"
      - think: 1

  - name: "Search"
    weight: 20
    flow:
      - post:
          url: "/search"
          json:
            query: "{{ $randomString() }}"
          capture:
            - json: "$.results[0].id"
              as: "firstResult"
```

运行：`artillery run load-tests/artillery-scenario.yml`

---

## 6. 安全测试

### 6.1 OWASP ZAP 自动化

```yaml
# .github/workflows/security.yml
name: Security Scan
on: [pull_request]
jobs:
  zap:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Start app
        run: |
          npm ci
          npm run preview &
          npx wait-on http://localhost:5173
      - name: ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.14.0
        with:
          target: 'http://localhost:5173'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'
```

### 6.2 Snyk 依赖漏洞扫描

```yaml
# .github/workflows/snyk.yml
- name: Snyk Test
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --severity-threshold=high --fail-on=all

- name: Snyk Monitor (持续监控)
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    command: monitor
    args: --org=my-org --project-name=my-app
```

### 6.3 npm audit 与替代工具

```json
// package.json
{
  "scripts": {
    "audit:fix": "npm audit fix",
    "audit:ci": "npm audit --audit-level=moderate",
    "security:check": "snyk test && npm audit"
  }
}
```

```bash
# 使用 better-npm-audit 自定义例外
npx better-npm-audit audit --exclude 1092310,1092311
```

---

## 7. 测试覆盖率

### 7.1 Istanbul/nyc → v8 coverage

Node.js 内置 `v8` 覆盖率引擎比传统 Istanbul/nyc 快 **3-5 倍**，内存占用更低。

| 工具 | 引擎 | 速度 | ESM 支持 | 精确性 |
|------|------|------|---------|--------|
| nyc | Istanbul | 慢 | 差 | 高 |
| istanbul + jest | Istanbul | 中等 | 需配置 | 高 |
| c8 | V8 | 快 | 好 | 中（存在行偏移问题） |
| Vitest v8 | V8 | 极快 | 原生 | 高（修复偏移） |

> 来源：Vitest 官方 Benchmark，c8 GitHub README 已知问题列表。

### 7.2 覆盖率门禁

```ts
// vitest.config.ts — 覆盖率门禁
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/mocks/**',
        'src/main.tsx',
        'src/**/*.stories.tsx'
      ],
      reporter: ['text', 'text-summary', 'json-summary', 'html', 'lcov'],
      // 全局门禁
      thresholds: {
        global: {
          lines: 80,
          functions: 80,
          branches: 70,
          statements: 80
        },
        // 核心模块更严格
        './src/core/**': {
          lines: 90,
          functions: 90,
          branches: 80
        }
      },
      // 每次 PR 生成报告对比
      reportsDirectory: './coverage'
    }
  }
})
```

```yaml
# .github/workflows/coverage.yml
- name: Upload Coverage
  uses: codecov/codecov-action@v4
  with:
    files: ./coverage/lcov.info
    fail_ci_if_error: true
    flags: unittests
    name: codecov-umbrella
```

**覆盖率报告 PR 评论（可运行 Action）**：

```yaml
- name: Report Coverage
  uses: davelosert/vitest-coverage-report-action@v2
  if: always()
  with:
    vite-config-path: ./vitest.config.ts
    json-summary-path: ./coverage/coverage-summary.json
    json-final-path: ./coverage/coverage-final.json
```

---

## 8. TDD / BDD

### 8.1 Red-Green-Refactor 循环

```text
┌─────────────┐
│   Red       │  ← 编写一个失败的测试（编译/运行都失败）
│  (1-2min)   │
└──────┬──────┘
       ▼
┌─────────────┐
│   Green     │  ← 编写最简单的通过代码（允许丑陋）
│  (2-5min)   │
└──────┬──────┘
       ▼
┌─────────────┐
│  Refactor   │  ← 重构，消除重复，保持测试通过
│  (3-10min)  │
└──────┬──────┘
       └──────────────────────────────────────┐
                                              ▼
                                        ┌─────────────┐
                                        │   Red       │
                                        └─────────────┘
```

**实战示例（可运行 TDD  kata）**：

```ts
// src/fizzbuzz.test.ts
import { describe, it, expect } from 'vitest'

// 被测函数（先写测试，再实现）
function fizzBuzz(n: number): string | number {
  if (n % 15 === 0) return 'FizzBuzz'
  if (n % 3 === 0) return 'Fizz'
  if (n % 5 === 0) return 'Buzz'
  return n
}

describe('FizzBuzz TDD', () => {
  it('应返回数字本身（Red → Green 第一步）', () => {
    expect(fizzBuzz(1)).toBe(1)
    expect(fizzBuzz(2)).toBe(2)
  })

  it('应返回 Fizz（被 3 整除）', () => {
    expect(fizzBuzz(3)).toBe('Fizz')
    expect(fizzBuzz(6)).toBe('Fizz')
  })

  it('应返回 Buzz（被 5 整除）', () => {
    expect(fizzBuzz(5)).toBe('Buzz')
    expect(fizzBuzz(10)).toBe('Buzz')
  })

  it('应返回 FizzBuzz（被 15 整除）', () => {
    expect(fizzBuzz(15)).toBe('FizzBuzz')
    expect(fizzBuzz(30)).toBe('FizzBuzz')
  })
})
```

### 8.2 Cucumber BDD

```gherkin
# features/checkout.feature
Feature: 在线结账

  Scenario: 使用优惠券成功下单
    Given 用户已登录
    And 购物车中有 2 件商品
    When 用户输入优惠券码 "SAVE20"
    Then 订单总额应减少 20%
    And 用户应看到 "优惠已应用" 提示

  Scenario Outline: 多种优惠券测试
    Given 用户已登录
    And 购物车总额是 <original>
    When 用户输入优惠券码 "<code>"
    Then 订单总额应为 <final>

    Examples:
      | original | code    | final |
      | 100      | SAVE20  | 80    |
      | 200      | SAVE50  | 100   |
      | 50       | INVALID | 50    |
```

```ts
// features/step_definitions/checkout.steps.ts
import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../support/world'

Given('用户已登录', async function (this: CustomWorld) {
  await this.page.goto('/login')
  await this.page.fill('[name="email"]', 'user@example.com')
  await this.page.fill('[name="password"]', 'password')
  await this.page.click('button[type="submit"]')
})

Given('购物车中有 {int} 件商品', async function (this: CustomWorld, count: number) {
  for (let i = 0; i < count; i++) {
    await this.page.goto(`/product/${i + 1}`)
    await this.page.click('[data-testid="add-to-cart"]')
  }
})

When('用户输入优惠券码 {string}', async function (this: CustomWorld, code: string) {
  await this.page.fill('[data-testid="coupon-input"]', code)
  await this.page.click('[data-testid="apply-coupon"]')
})

Then('订单总额应减少 {int}%', async function (this: CustomWorld, percent: number) {
  const totalText = await this.page.textContent('[data-testid="order-total"]')
  const total = Number(totalText?.replace(/[^0-9.]/g, ''))
  expect(total).toBeLessThan(this.originalTotal * (1 - percent / 100))
})
```

### 8.3 Storybook 测试驱动

Storybook + Test Runner 实现组件级视觉+交互测试：

```ts
// src/components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Components/Button'
}
export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: { variant: 'primary', children: 'Click me' },
  // 交互测试直接在故事中编写
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /click me/i })

    await userEvent.click(button)
    await expect(button).toHaveAttribute('data-clicked', 'true')
  }
}

export const Loading: Story = {
  args: { variant: 'primary', loading: true, children: 'Submit' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('progressbar')).toBeVisible()
    await expect(canvas.getByRole('button')).toBeDisabled()
  }
}
```

```bash
# 运行 Storybook 测试
npx test-storybook --coverage
```

---

## 9. CI 集成

### 9.1 GitHub Actions 测试矩阵

```yaml
# .github/workflows/test.yml
name: Test Matrix
on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        node: [20, 22, 23]
        shard: [1, 2, 3, 4]
    name: Unit (Node ${{ matrix.node }}, Shard ${{ matrix.shard }}/4)
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: ${{ matrix.node }} }
      - run: npm ci
      - run: npx vitest run --shard=${{ matrix.shard }}/4
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-unit-${{ matrix.node }}-${{ matrix.shard }}
          path: coverage/

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: testdb
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgres://test:test@localhost:5432/testdb

  e2e:
    runs-on: ubuntu-latest
    needs: [unit]
    strategy:
      matrix:
        project: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npx playwright install --with-deps ${{ matrix.project }}
      - run: npx playwright test --project=${{ matrix.project }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-${{ matrix.project }}
          path: playwright-report/
```

### 9.2 测试分片（Sharding）

```bash
# 手动 4 分片示例
npx vitest run --shard=1/4 &
npx vitest run --shard=2/4 &
npx vitest run --shard=3/4 &
npx vitest run --shard=4/4 &
wait

# 合并覆盖率报告
npx nyc merge coverage/.tmp coverage/coverage-final.json
```

---

## 10. 2026 趋势

### 10.1 AI 辅助测试生成

```ts
// AI 生成的测试示例（基于 ChatGPT / Claude / Copilot）
// Prompt: "为以下函数生成边界条件测试"
function parsePagination(query: Record<string, string>) {
  const page = Math.max(1, parseInt(query.page ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)))
  return { page, limit, offset: (page - 1) * limit }
}

// AI 生成输出（需人工审查）：
describe('parsePagination', () => {
  it('应使用默认值', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 20, offset: 0 })
  })
  it('应限制最大 limit', () => {
    expect(parsePagination({ limit: '200' })).toEqual({ page: 1, limit: 100, offset: 0 })
  })
  it('应处理负数 page', () => {
    expect(parsePagination({ page: '-5' })).toEqual({ page: 1, limit: 20, offset: 0 })
  })
  it('应处理非数字字符串', () => {
    expect(parsePagination({ page: 'abc', limit: 'xyz' }))
      .toEqual({ page: 1, limit: 20, offset: 0 })
  })
})
```

**AI 测试工具现状（2026 Q1）**：

| 工具 | 能力 | 准确率（社区反馈） |
|------|------|-----------------|
| GitHub Copilot | 基于注释/函数名生成测试用例 | ~70% |
| CodiumAI / Qodo | 意图分析 + 边界条件生成 | ~75% |
| Symflower | 基于符号执行生成 Go/Java 测试 | ~80% |
| Pythagora (gpt-pilot) | 全栈 E2E 录制回放生成 | ~60% |

> 来源：State of JS 2025 "AI in Testing" 专项调研，GitHub Copilot 官方数据。

**关键结论**：AI 生成测试适合**样板代码和边界条件启发**，不能替代人类对业务规则的理解。必须要求：生成后人工审查 + 运行验证。

### 10.2 视觉回归自动化

```ts
// Playwright + Argos CI 集成
import { test, expect } from '@playwright/test'
import { argosScreenshot } from '@argos-ci/playwright'

test('关键页面视觉快照', async ({ page }) => {
  await page.goto('/dashboard')
  await argosScreenshot(page, 'dashboard', {
    viewports: ['macbook-16', 'ipad-2', 'iphone-x']
  })
})
```

### 10.3 Contract Testing (契约测试)

消费者驱动契约（CDC）确保服务间 API 兼容性：

```ts
// tests/contracts/user-service.contract.test.ts
import { describe, it } from 'vitest'
import { PactV4, MatchersV3 } from '@pact-foundation/pact'
import { fetchUserById } from '../../src/services/user-api'

const pact = new PactV4({
  consumer: 'web-frontend',
  provider: 'user-service',
  dir: './pacts'
})

describe('User Service Contract', () => {
  it('应获取用户详情', async () => {
    await pact
      .addInteraction()
      .uponReceiving('a request for user by id')
      .withRequest('GET', '/users/1')
      .willRespondWith(200, (builder) => {
        builder.jsonBody({
          id: MatchersV3.integer(1),
          name: MatchersV3.string('Alice'),
          email: MatchersV3.email('alice@example.com')
        })
      })
      .executeTest(async (mockServer) => {
        // 临时切换 API baseURL 到 mock server
        const user = await fetchUserById(1, { baseURL: mockServer.url })
        expect(user.name).toBe('Alice')
      })
  })
})
```

```bash
# 验证提供者是否满足契约
npx pact-verifier \
  --provider user-service \
  --provider-base-url http://localhost:3000 \
  --pact-broker-base-url https://pact.mycompany.com \
  --publish-verification-results
```

---

## 附录：测试策略决策速查表

| 场景 | 推荐工具 | 测试层级 |
|------|---------|---------|
| 纯函数/工具库 | Vitest | Unit |
| React/Vue 组件 | Vitest + Testing Library + jsdom | Unit |
| 浏览器特有行为 | Vitest Browser Mode / Playwright component tests | Integration |
| REST API 调用 | Vitest + MSW | Integration |
| 数据库 Repository | Vitest + better-sqlite3(:memory:) / Testcontainers | Integration |
| 完整用户流程 | Playwright | E2E |
| 跨浏览器兼容性 | Playwright (chromium/firefox/webkit) | E2E |
| 视觉/UI 回归 | Playwright + Argos/Chromatic | E2E / Visual |
| Core Web Vitals | Lighthouse CI | Performance |
| API 负载/压力 | k6 / Artillery | Performance |
| 依赖漏洞 | Snyk + npm audit | Security |
| API 契约兼容性 | Pact | Contract |

---

## 延伸阅读

- [测试分类](../categories/testing)
- [测试生态分类](../categories/testing-ecosystem)
- [Vitest 官方文档](https://vitest.dev/)
- [Playwright 官方文档](https://playwright.dev/)
- [MSW 官方文档](https://mswjs.io/)
- [Testing Library 指导原则](https://testing-library.com/docs/guiding-principles/)
- [Google Testing Blog](https://testing.googleblog.com/)
- [k6 文档](https://k6.io/docs/)
- [Pact 契约测试](https://pact.io/)
