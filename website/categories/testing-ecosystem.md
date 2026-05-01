---
title: 测试框架生态
description: JavaScript/TypeScript 测试生态 2025-2026 — Vitest v3 统治单元测试、Playwright 统治 E2E、AI 辅助测试与策略金字塔
---

# 测试生态

> **趋势洞察**：Vitest v3（2025 年初发布）凭借 Vite 原生集成和极致速度，彻底取代 Jest 成为单元测试首选；Playwright 以多浏览器支持与 Trace Viewer 巩固 E2E 霸主地位；Cypress 增长停滞进入维护期；AI 辅助测试（生成用例、视觉对比）从实验走向生产可用。

---

## 核心数据概览（2026年5月）

| 工具 | GitHub Stars | npm 周下载量 | 定位 |
|------|-------------|-------------|------|
| Vitest v3 | ~52k | ~500 万+ | 🟢 单元/集成测试首选 |
| Playwright | ~78k | ~450 万+ | 🟢 E2E 测试统治级 |
| Storybook v8 | ~88k | ~300 万+ | 🟢 组件开发与测试 |
| Jest | ~44k | ~700 万+ | 🟡 存量项目主流，新项目减少 |
| Cypress | ~48k | ~150 万+ | 🟡 增长停滞，仅 Chromium |
| WebdriverIO v9 | ~9.5k | ~40 万+ | 🟢 跨浏览器协议标准 |
| MSW v2 | ~17k | ~200 万+ | 🟢 API Mock 标准 |
| Testing Library | ~20k | ~400 万+ | 🟢 组件测试理念标准 |

---

## 单元测试：Vitest v3 的统治

Vitest v3 于 **2025 年初** 发布，标志着 Jest 时代的正式落幕。

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
      },
    },
  },
})
```

**Vitest 为何替代 Jest？**

| 维度 | Vitest v3 | Jest |
|------|-----------|------|
| 冷启动时间 | ~100ms | ~3-5s |
| TypeScript | 原生支持，零配置 | 需 ts-jest / Babel |
| Vite 集成 | 原生共享配置 | 需额外适配 |
| HMR 热重载 | ✅ 测试级热更新 | ❌ 全量重跑 |
| ESM 支持 | 一等公民 | CommonJS 遗留问题 |
| 浏览器模式 | `@vitest/browser` 内置 | jsdom / happy-dom 外部 |
| Workspace | 内置 monorepo 支持 | 需独立配置 |

```ts
// 示例：Vitest + Testing Library 组件测试
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('提交有效表单后触发 onSubmit', async () => {
    const handleSubmit = vi.fn()
    render(<LoginForm onSubmit={handleSubmit} />)

    await userEvent.type(screen.getByLabelText(/邮箱/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/密码/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /登录/i }))

    expect(handleSubmit).toHaveBeenCalledOnce()
  })
})
```

---

## E2E 测试：Playwright 的绝对优势

Playwright 由 Microsoft 维护，2025-2026 年已成为 E2E 测试的事实标准。

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 7'] } },
  ],
})
```

**Playwright vs Cypress vs Selenium**：

| 特性 | Playwright | Cypress | Selenium |
|------|-----------|---------|----------|
| 浏览器支持 | Chromium / Firefox / WebKit | Chromium 为主 | 全部，但配置复杂 |
| 执行速度 | ⚡ 最快（并行 + 隔离） | 中等 | 慢 |
| 跨页面/多标签 | ✅ 原生支持 | ⚠️ 有限 | ✅ |
| Trace / 调试 | ✅ Trace Viewer | ✅ Time Travel | ❌ |
| API 测试 | ✅ 内置 request | ⚠️ 需 cy.request | ❌ |
| CI 稳定性 | 自动等待，最稳定 | 偶发 flaky | 依赖显式等待 |
| 架构 | 进程外（更稳定） | 进程内（有局限） | 进程外 |

> ⚠️ **Cypress 现状**：2024-2025 年新增功能放缓，企业裁员潮影响维护团队，市场份额被 Playwright 持续侵蚀。新项目强烈建议选用 Playwright。

---

## 组件测试与文档：Storybook v8

Storybook v8（2024 年发布）引入了 **Test Addon**，将组件文档、交互测试和视觉回归统一在同一平台。

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Components/Button',
}
export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: { variant: 'primary', children: '提交' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button'))
    await expect(canvas.getByText('提交')).toBeVisible()
  },
}
```

**Storybook 测试能力矩阵**：

| 测试类型 | 实现方式 | 状态 |
|---------|---------|------|
| 交互测试 | `play` 函数 + `@storybook/test` | 🟢 内置 |
| 视觉回归 | Chromatic / Storybook Test Addon | 🟢 生产可用 |
| 可访问性 | `@storybook/addon-a11y` | 🟢 自动检测 |
| 覆盖率 | 与 Vitest/istanbul 集成 | 🟢 可配置 |

---

## 2026 测试策略金字塔

现代前端项目的测试层次已扩展为五层：

```
        ▲
       / \    性能测试 (Lighthouse CI, Web Vitals)
      /   \   ──────────────────────────────
     /     \  视觉回归 (Chromatic, Percy, Playwright screenshot)
    /       \ ──────────────────────────────
   /   E2E   \ 端到端 (Playwright — 用户旅程)
  /───────────\────────────────────────────
 /   集成测试   \ (MSW + Testing Library + Vitest)
/─────────────────\────────────────────────
/     单元测试      \ (Vitest — 纯函数、工具、Hooks)
────────────────────────────────────────────
```

| 层级 | 工具推荐 | 数量比例 | 目标 |
|------|---------|---------|------|
| 单元测试 | Vitest | ~60% | 逻辑正确性 |
| 集成测试 | Vitest + MSW + Testing Library | ~25% | 组件协作 |
| E2E 测试 | Playwright | ~10% | 关键用户旅程 |
| 视觉回归 | Chromatic / Playwright | ~3% | UI 一致性 |
| 性能测试 | Lighthouse CI / Playwright | ~2% | Core Web Vitals |

---

## AI 辅助测试：从噱头到生产力

2025-2026 年，AI 在测试领域的应用从实验走向生产：

| 场景 | 工具/方案 | 成熟度 |
|------|----------|--------|
| **AI 生成测试用例** | GitHub Copilot / CodiumAI / V0 | 🟡 辅助编写，需人工 review |
| **AI 视觉回归** | Chromatic AI / Applitools | 🟢 可忽略动态内容（广告、时间）的噪声 |
| **智能测试选择** | Vitest 智能模式 / Jest --onlyChanged | 🟢 仅运行相关测试，CI 加速 |
| **失败分析** | Playwright 失败自动归类 / Copilot 解释 | 🟡 快速定位 flaky 根因 |
| **自愈测试** | 动态选择器（基于语义而非绝对路径） | 🟡 减少选择器变更导致的失败 |

```ts
// Playwright 视觉回归 + AI 忽略（动态区域）
test('首页视觉回归', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot('homepage.png', {
    mask: [page.locator('[data-testid="ad-banner"]')],
    maxDiffPixelRatio: 0.02,
  })
})
```

---

## 新兴与衰退工具

| 工具 | 趋势 | 说明 |
|------|------|------|
| WebdriverIO v9 | 🟢 上升 | W3C WebDriver 标准实现，移动端支持强 |
| Cypress | 🟡 停滞 | 仅 Chromium，团队缩减，新项目减少 |
| Selenium | 🔴 衰退 | 传统 WebDriver 被 Playwright 替代 |
| TestCafe | 🔴 衰退 | 社区活跃度下降 |
| node:test | 🟢 上升 | Node.js 原生，零依赖，适合工具库 |

---

> 📊 **数据统计时间**：2026年5月  
> ⭐ Stars 与下载量数据来源于 GitHub / npm 公开 API  
> 📎 关联实验室：[20.1-fundamentals-lab](../../20-code-lab/20.1-fundamentals-lab/)
