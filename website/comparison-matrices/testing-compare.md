---
title: 测试框架对比矩阵
description: "2025-2026 年 测试框架对比矩阵 对比矩阵，覆盖主流方案选型数据与工程实践建议"
---

# 测试框架对比矩阵

> 最后更新：2026年4月

## 核心对比表

| 特性 | Vitest | Jest | Playwright |
|------|--------|------|------------|
| **GitHub Stars** | 15k | 43k | 70k |
| **测试类型** | 单元/集成 | 单元/集成 | E2E (端到端) |
| **运行环境** | Node / Edge | Node | Node (控制浏览器) |
| **执行速度** | ⚡ 极快 | 🐢 较慢 | 🐢 较慢 (真实浏览器) |
| **TypeScript 支持** | 🟢 原生 | 🔵 需配置 | 🟢 原生 |
| **ESM 支持** | ⭐⭐⭐ 完美 | ⭐⭐ 一般 | ⭐⭐⭐ 完美 |
| **配置复杂度** | ⭐ 低 | ⭐⭐ 中 | ⭐⭐ 中 |
| **快照测试** | ✅ | ✅ | ✅ |
| **Mock 功能** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **覆盖率** | ✅ c8/v8 | ✅ Istanbul | ❌ (需结合其他工具) |
| **UI 模式** | ✅ 内置 | ❌ | ✅ 内置 |
| **浏览器测试** | ❌ | ❌ (需配合) | ⭐⭐⭐ 核心功能 |
| **并行执行** | ⭐⭐⭐ 默认 | ⭐⭐ 需配置 | ⭐⭐⭐ 默认 |
| **Watch 模式** | ✅ | ✅ | ✅ |

## 详细分析

### Vitest

```bash
npm install -D vitest
```

- **定位**: 由 Vite 驱动的下一代测试框架
- **核心优势**: 与 Vite 生态无缝集成，极快执行速度
- **特点**:
  - 兼容 Jest API，迁移成本低
  - 原生 ESM 支持
  - 极快的 HMR (热模块替换)
  - 内置 TypeScript 支持
  - 与 Vite 配置共享
- **适用场景**: Vite 项目、追求速度的单元测试、现代 ES 项目

```typescript
// sum.test.ts
import { describe, it, expect } from 'vitest'
import { sum } from './sum'

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(1, 2)).toBe(3)
  })

  it('matches snapshot', () => {
    expect({ name: 'test', value: 42 }).toMatchSnapshot()
  })
})
```

```javascript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
```

### Jest

```bash
npm install -D jest @types/jest ts-jest
```

- **定位**: 最成熟的 JavaScript 测试框架
- **核心优势**: 生态最丰富，社区资源最多
- **特点**:
  - Snapshot Testing 开创者
  - 完善的 Mock 功能
  - 丰富的匹配器 (matchers)
  - 广泛的 IDE 支持
- **劣势**: ESM 支持较复杂、配置相对繁琐、启动较慢
- **适用场景**: 传统项目、需要丰富插件生态的项目

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testMatch: ['**/*.test.ts']
}
```

```typescript
// sum.test.ts
import { sum } from './sum'

describe('sum', () => {
  test('adds two numbers', () => {
    expect(sum(1, 2)).toBe(3)
  })

  // Mock 示例
  test('mock function', () => {
    const mockFn = jest.fn()
    mockFn('arg')
    expect(mockFn).toHaveBeenCalledWith('arg')
  })
})
```

### Playwright

```bash
npm init playwright@latest
```

- **定位**: 现代 Web 应用的端到端测试框架
- **核心优势**: 多浏览器支持、可靠性高、开发者体验优秀
- **特点**:
  - 支持 Chromium、Firefox、WebKit
  - 自动等待机制
  - 可视化测试 (截图对比)
  - 强大的代码生成器 (`codegen`)
  - Trace Viewer 调试工具
  - 组件测试 (实验性)
- **适用场景**: E2E 测试、跨浏览器测试、关键业务流程验证

```typescript
// example.spec.ts
import { test, expect } from '@playwright/test'

test('homepage has title', async ({ page }) => {
  await page.goto('https://example.com')
  await expect(page).toHaveTitle(/Example Domain/)
})

test('user can login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'user@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
})
```

```javascript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
```

## 功能对比详解

### 单元/集成测试

| 功能 | Vitest | Jest | Playwright |
|------|--------|------|------------|
| **断言库** | 内置 (Chai-like) | 内置 (Jasmine-like) | 内置 |
| **Mock** | vi.fn() / vi.mock() | jest.fn() / jest.mock() | 有限支持 |
| **Spy** | vi.spyOn() | jest.spyOn() | - |
| **Timer Mock** | vi.useFakeTimers() | jest.useFakeTimers() | - |
| **模块 Mock** | ✅ | ✅ | - |
| **Setup/Teardown** | beforeEach/afterAll | beforeEach/afterAll | beforeEach/afterAll |
| **并发测试** | test.concurrent | - | ✅ 默认 |
| **数据驱动** | test.each | test.each | test.each |

### 测试环境

| 环境 | Vitest | Jest | Playwright |
|------|--------|------|------------|
| **Node.js** | ✅ | ✅ | ✅ |
| **JSDOM** | ✅ | ✅ | - |
| **Happy DOM** | ✅ | - | - |
| **真实浏览器** | ❌ | ❌ | ✅ |
| **Edge Runtime** | ✅ | ❌ | ⚠️ 部分 |

### 开发者体验

| 特性 | Vitest | Jest | Playwright |
|------|--------|------|------------|
| **IDE 插件** | ✅ | ✅ 最完善 | ✅ |
| **UI 界面** | ✅ Vitest UI | ❌ | ✅ Playwright UI |
| **VS Code 调试** | ✅ | ✅ | ✅ |
| **测试过滤** | ✅ t / f 模式 | ✅ | ✅ |
| **失败重试** | ❌ | ✅ | ✅ |

## 性能对比

| 指标 | Vitest | Jest | Playwright |
|------|--------|------|------------|
| **启动时间** | 极快 | 慢 | 中 |
| **执行速度** | 极快 | 慢 | 慢 (浏览器) |
| **内存占用** | 低 | 高 | 高 |
| **并行能力** | 优秀 | 良好 | 优秀 |
| **大型项目表现** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

## 选型建议

### 按测试类型选择

| 测试类型 | 推荐工具 |
|----------|----------|
| 单元测试 | Vitest (新项目) / Jest (旧项目) |
| 集成测试 | Vitest / Jest |
| 端到端测试 | Playwright |
| 组件测试 | Vitest + Testing Library / Playwright CT |
| 视觉回归 | Playwright + 截图对比 |
| API 测试 | Vitest / Jest / Playwright |

### 其他测试工具

| 工具 | Stars | 定位 | 2026 状态 |
|------|-------|------|:---------:|
| **Cypress** | 48k+ | E2E 测试 | 🟡 维护 |
| **WebdriverIO** | 9.5k+ | 跨浏览器自动化 | 🟢 活跃 |
| **AVA** | 20k+ | 极简测试 | 🟡 维护 |
| **Node.js Test Runner** | 内置 | 官方测试 | 🟢 增长 |
| **Bun Test** | 内置 | Bun 原生 | 🟢 新兴 |

**Cypress 现状**：2024-2025 增长停滞，仅支持 Chromium，企业裁员影响维护。新项目建议 Playwright。

```js
// Node.js 内置 Test Runner (v22)
import { test, describe } from 'node:test'
import assert from 'node:assert'

describe('math', () => {
  test('addition', () => {
    assert.strictEqual(1 + 1, 2)
  })
})
```

### 按项目类型选择

| 项目类型 | 推荐 |
|----------|------|
| Vite 项目 | Vitest |
| Create React App | Jest (内置) |
| Next.js | Vitest (单元) + Playwright (E2E) |
| 传统 Node 项目 | Jest 或 Vitest |
| 需要跨浏览器测试 | Playwright |
| 纯 Node.js 库 | Node.js Test Runner / Vitest |
| Bun 生态 | Bun Test |

---

## 2026 趋势

| 趋势 | 描述 |
|------|------|
| **Vitest 统治** | 新项目默认选择，Jest 存量维护 |
| **Playwright 霸主** | E2E 测试事实标准 |
| **Cypress 衰退** | 新功能放缓，市场份额流失 |
| **AI 测试生成** | Copilot / Cursor 自动生成测试 |
| **视觉回归普及** | Playwright + Argos / Chromatic |
| **Node.js 内置** | 官方 test runner 成为轻量选择 |

### 组合方案

```bash
# 推荐的测试组合
npm install -D vitest @testing-library/react
npm install -D @playwright/test
```

| 层级 | 工具 | 占比 |
|------|------|------|
| 单元测试 | Vitest | 70% |
| 集成测试 | Vitest | 20% |
| E2E 测试 | Playwright | 10% |

## 配置示例

### 完整测试配置 (Vitest + Playwright)

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "@playwright/test": "^1.x",
    "@vitest/coverage-v8": "^1.x",
    "@vitest/ui": "^1.x",
    "vitest": "^1.x"
  }
}
```

## 迁移建议

### Jest → Vitest

- 替换 `jest` 导入为 `vitest`
- 配置 `globals: true` 以兼容全局 API
- 更新 mock 语法 (大部分兼容)

## 测试覆盖率工具

| 工具 | 引擎 | 速度 | 精度 | 报告格式 |
|------|------|:----:|:----:|:--------:|
| **v8 coverage** | V8 | 快 | 高 | HTML/LCOV/JSON |
| **Istanbul/nyc** | Babel | 慢 | 最高 | HTML/LCOV |
| **c8** | V8 | 快 | 高 | HTML/LCOV |

```json
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
})
```

## 视觉回归测试

| 工具 | 价格 | 集成 | 像素对比 | 2026 状态 |
|------|:----:|:----:|:--------:|:---------:|
| **Chromatic** | $/月 | Storybook | ✅ | 🟢 首选 |
| **Argos** | $/月 | CI | ✅ | 🟢 增长 |
| **Percy** | $/月 | 多框架 | ✅ | 🟡 维护 |
| **Loki** | 免费 | Storybook | ✅ | 🟢 开源 |
| **Playwright** | 免费 | 内置 | ⚠️ 基础 | 🟢 增长 |

## 性能测试

| 工具 | 类型 | 适用场景 |
|------|------|---------|
| **Lighthouse CI** | 合成测试 | Core Web Vitals |
| **k6** | 负载测试 | API 压力测试 |
| **Artillery** | 负载测试 | 微服务 |
| **Autocannon** | 基准测试 | Node.js HTTP |

```js
// k6 负载测试
import http from 'k6/http'
import { check } from 'k6'

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
}

export default function () {
  const res = http.get('https://api.example.com/users')
  check(res, { 'status is 200': (r) => r.status === 200 })
}
```

## 测试数据管理

| 策略 | 工具 | 适用 |
|------|------|------|
| **Mock Service Worker** | MSW | API Mock |
| **faker-js** | faker | 假数据生成 |
| **Testcontainers** | docker | 数据库集成测试 |
| **工厂模式** | factory.ts | 测试对象构建 |

```ts
// MSW 2.x 示例
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ])
  }),
]
```

### 注意事项

- Playwright 用于 E2E，不替代单元测试框架
- Vitest 和 Jest 可以共存，但不推荐
- 覆盖率工具选择：V8 (快) vs Istanbul (准)
