# 13. 测试框架生态 (Testing Ecosystem)

> **趋势**: Vitest 取代 Jest 成为首选，Playwright 超越 Cypress/Selenium 成为 E2E 测试新标准

---

## 📊 生态概览

| 类别 | 工具数量 | 推荐选择 | 学习优先级 |
|------|----------|----------|------------|
| 单元测试框架 | 6 | **Vitest** | ⭐⭐⭐⭐⭐ |
| E2E测试 | 5 | **Playwright** | ⭐⭐⭐⭐⭐ |
| 组件测试 | 4 | **Testing Library + Storybook** | ⭐⭐⭐⭐ |
| 视觉回归测试 | 3 | **Chromatic** | ⭐⭐⭐ |
| 覆盖率工具 | 3 | **Vitest 内置 / c8** | ⭐⭐⭐⭐ |
| Mock/Stub工具 | 3 | **MSW** | ⭐⭐⭐⭐ |

---

## 1️⃣ 单元测试框架 (Unit Testing)

### 🏆 Vitest ⭐43k

| 属性 | 详情 |
|------|------|
| **Stars** | 43k+ (GitHub) |
| **TS支持** | ✅ 原生支持，无需配置 |
| **特点** | 极速冷启动，Vite原生集成，Jest API兼容，HMR支持 |
| **官网** | <https://vitest.dev> |
| **GitHub** | <https://github.com/vitest-dev/vitest> |
| **测试类型** | 单元测试、集成测试、组件测试 |
| **配置难度** | 🟢 简单 (开箱即用) |

```typescript
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

**推荐理由**: Vite生态默认选择，比 Jest 快 10-20 倍，配置极简

---

### Jest ⭐44k

| 属性 | 详情 |
|------|------|
| **Stars** | 44k+ (GitHub) |
| **TS支持** | ⚠️ 需 ts-jest 或 Babel 配置 |
| **特点** | Facebook出品，生态成熟，快照测试，Mock功能强大 |
| **官网** | <https://jestjs.io> |
| **GitHub** | <https://github.com/jestjs/jest> |
| **测试类型** | 单元测试、集成测试、快照测试 |
| **配置难度** | 🟡 中等 (需额外配置TS) |

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage'
}
```

**现状**: 仍是企业主流，但新项目推荐 Vitest

---

### Mocha ⭐23k

| 属性 | 详情 |
|------|------|
| **Stars** | 23k+ (GitHub) |
| **TS支持** | ⚠️ 需额外配置 |
| **特点** | 灵活轻量，老牌框架，丰富的插件生态 |
| **官网** | <https://mochajs.org> |
| **GitHub** | <https://github.com/mochajs/mocha> |
| **测试类型** | 单元测试、集成测试、BDD/TDD风格 |
| **配置难度** | 🟡 中等 (需搭配 Chai/Sinon) |

```typescript
// 基本用法
describe('Array', () => {
  describe('#indexOf()', () => {
    it('should return -1 when not present', () => {
      assert.equal([1,2,3].indexOf(4), -1)
    })
  })
})
```

---

### AVA ⭐21k

| 属性 | 详情 |
|------|------|
| **Stars** | 21k+ (GitHub) |
| **TS支持** | ⚠️ 需配置 |
| **特点** | 并行测试执行，轻量快速，ESM优先 |
| **官网** | <https://avajs.dev> |
| **GitHub** | <https://github.com/avajs/ava> |
| **测试类型** | 单元测试 |
| **配置难度** | 🟡 中等 |

**特色**: 每个测试文件并行运行，适合CPU密集型测试

---

### node:test (原生)

| 属性 | 详情 |
|------|------|
| **Stars** | Node.js 内置 |
| **TS支持** | ⚠️ 需 tsx 或 ts-node |
| **特点** | Node 18+ 原生，零依赖，TAP输出格式 |
| **文档** | <https://nodejs.org/api/test.html> |
| **测试类型** | 单元测试、集成测试 |
| **配置难度** | 🟢 简单 |

```typescript
import { test, describe } from 'node:test'
import assert from 'node:assert'

describe('数学运算', () => {
  test('加法', () => {
    assert.equal(1 + 1, 2)
  })
})
```

---

### tap ⭐6k

| 属性 | 详情 |
|------|------|
| **Stars** | 6k+ (GitHub) |
| **TS支持** | ⚠️ 需配置 |
| **特点** | TAP协议实现，简洁输出，并行执行 |
| **官网** | <https://node-tap.org> |
| **GitHub** | <https://github.com/tapjs/node-tap> |
| **测试类型** | 单元测试 |
| **配置难度** | 🟢 简单 |

---

## 2️⃣ E2E测试 (End-to-End Testing)

### 🏆 Playwright ⭐68k

| 属性 | 详情 |
|------|------|
| **Stars** | 68k+ (GitHub) |
| **TS支持** | ✅ 原生支持 |
| **特点** | Microsoft出品，多浏览器(Chromium/Firefox/WebKit)，自动等待，Trace Viewer |
| **官网** | <https://playwright.dev> |
| **GitHub** | <https://github.com/microsoft/playwright> |
| **测试类型** | E2E测试、UI测试、API测试、视觉回归 |
| **配置难度** | 🟢 简单 (CLI一键配置) |

```typescript
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
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
})
```

```typescript
// 示例测试
test('用户登录流程', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'user@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  await expect(page.locator('.dashboard')).toBeVisible()
})
```

**推荐理由**: 当前最推荐的E2E工具，功能全面，微软背书

---

### Cypress ⭐47k

| 属性 | 详情 |
|------|------|
| **Stars** | 47k+ (GitHub) |
| **TS支持** | ✅ 原生支持 |
| **特点** | 实时重载，时间旅行调试，前端友好，丰富的GUI |
| **官网** | <https://www.cypress.io> |
| **GitHub** | <https://github.com/cypress-io/cypress> |
| **测试类型** | E2E测试、组件测试 |
| **配置难度** | 🟢 简单 |

```typescript
// cypress/e2e/login.cy.ts
describe('登录页面', () => {
  it('成功登录', () => {
    cy.visit('/login')
    cy.get('[data-testid="email"]').type('user@example.com')
    cy.get('[data-testid="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })
})
```

**注意**: 仅支持 Chromium 系浏览器，Firefox/ Safari 支持有限

---

### Puppeteer ⭐89k

| 属性 | 详情 |
|------|------|
| **Stars** | 89k+ (GitHub) |
| **TS支持** | ✅ 原生支持 |
| **特点** | Google出品，Chrome DevTools协议，强大的页面控制能力 |
| **官网** | <https://pptr.dev> |
| **GitHub** | <https://github.com/puppeteer/puppeteer> |
| **测试类型** | E2E测试、网页抓取、PDF生成、性能分析 |
| **配置难度** | 🟡 中等 |

```typescript
import puppeteer from 'puppeteer'

const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.goto('https://example.com')
await page.screenshot({ path: 'example.png' })
await browser.close()
```

---

### WebdriverIO ⭐9k

| 属性 | 详情 |
|------|------|
| **Stars** | 9k+ (GitHub) |
| **TS支持** | ✅ 原生支持 |
| **特点** | Selenium WebDriver协议，跨浏览器，移动端支持 |
| **官网** | <https://webdriver.io> |
| **GitHub** | <https://github.com/webdriverio/webdriverio> |
| **测试类型** | E2E测试、移动端测试、桌面应用测试 |
| **配置难度** | 🟡 中等 |

---

### TestCafe ⭐10k

| 属性 | 详情 |
|------|------|
| **Stars** | 10k+ (GitHub) |
| **TS支持** | ✅ 原生支持 |
| **特点** | 无需WebDriver，内置等待机制，多浏览器并行 |
| **官网** | <https://testcafe.io> |
| **GitHub** | <https://github.com/DevExpress/testcafe> |
| **测试类型** | E2E测试 |
| **配置难度** | 🟢 简单 |

---

## 3️⃣ 组件测试 (Component Testing)

### 🏆 Testing Library ⭐19k

| 属性 | 详情 |
|------|------|
| **Stars** | 19k+ (GitHub) |
| **TS支持** | ✅ 原生支持 |
| **特点** | 测试最佳实践，关注用户行为而非实现细节，可访问性优先 |
| **官网** | <https://testing-library.com> |
| **GitHub** | <https://github.com/testing-library> |
| **测试类型** | 组件测试、React/Vue/Angular/Svelte |
| **配置难度** | 🟢 简单 |

**核心原则**:

- 测试用户可见的行为，而非内部状态
- 优先使用可访问性查询 (`getByRole`, `getByLabelText`)
- 避免测试实现细节

```typescript
// React Testing Library 示例
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

test('提交表单时调用onSubmit', async () => {
  const handleSubmit = vi.fn()
  render(<LoginForm onSubmit={handleSubmit} />)

  await userEvent.type(screen.getByLabelText(/邮箱/i), 'test@example.com')
  await userEvent.type(screen.getByLabelText(/密码/i), 'password123')
  await userEvent.click(screen.getByRole('button', { name: /登录/i }))

  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123'
  })
})
```

---

### React Testing Library

| 属性 | 详情 |
|------|------|
| **安装** | `@testing-library/react` |
| **配合** | Vitest/Jest + jsdom |
| **特点** | React组件测试标准方案 |

```typescript
// setup.ts
import '@testing-library/jest-dom/vitest'

// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./setup.ts']
  }
})
```

---

### Vue Testing Library

| 属性 | 详情 |
|------|------|
| **安装** | `@testing-library/vue` |
| **配合** | Vitest + happy-dom/jsdom |
| **特点** | Vue组件测试，与Vue Test Utils互补 |

```typescript
import { render, screen } from '@testing-library/vue'
import Counter from './Counter.vue'

test('计数器增加', async () => {
  render(Counter)
  await userEvent.click(screen.getByText('增加'))
  expect(screen.getByText('1')).toBeInTheDocument()
})
```

---

### Storybook ⭐85k

| 属性 | 详情 |
|------|------|
| **Stars** | 85k+ (GitHub) |
| **TS支持** | ✅ 原生支持 |
| **特点** | 组件开发环境，文档生成，交互测试，视觉测试 |
| **官网** | <https://storybook.js.org> |
| **GitHub** | <https://github.com/storybookjs/storybook> |
| **测试类型** | 组件开发、视觉测试、交互测试、文档 |
| **配置难度** | 🟡 中等 |

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Components/Button'
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: '点击我'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button'))
    await expect(canvas.getByText('已点击')).toBeInTheDocument()
  }
}
```

**Storybook 测试模式**:

- **Storyshots**: 快照测试
- **Interaction tests**: 交互测试 (`play` 函数)
- **Visual tests**: 与Chromatic集成

---

## 4️⃣ 视觉回归测试 (Visual Regression Testing)

### Chromatic

| 属性 | 详情 |
|------|------|
| **价格** | 免费(开源) / 付费(私有) |
| **特点** | Storybook官方出品，云端视觉测试，CI集成 |
| **官网** | <https://www.chromatic.com> |
| **配合** | Storybook |
| **配置难度** | 🟢 简单 |

```yaml
# .github/workflows/chromatic.yml
- name: Publish to Chromatic
  uses: chromaui/action@latest
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

---

### Percy

| 属性 | 详情 |
|------|------|
| **价格** | 免费额度 / 付费 |
| **特点** | BrowserStack出品，支持多种框架，像素级对比 |
| **官网** | <https://percy.io> |
| **配合** | Playwright, Cypress, Puppeteer, Storybook |
| **配置难度** | 🟢 简单 |

---

### Loki

| 属性 | 详情 |
|------|------|
| **价格** | 免费开源 |
| **特点** | 基于Storybook，本地Docker运行，无云端依赖 |
| **GitHub** | <https://github.com/oblador/loki> |
| **配合** | Storybook |
| **配置难度** | 🟡 中等 |

```json
// loki.config.js
module.exports = {
  configurations: {
    'chrome.laptop': {
      target: 'chrome.docker',
      width: 1366,
      height: 768
    }
  }
}
```

---

## 5️⃣ 覆盖率工具 (Coverage Tools)

### 🏆 c8

| 属性 | 详情 |
|------|------|
| **TS支持** | ✅ 原生支持 |
| **特点** | Node原生V8覆盖率，快速，零配置 |
| **GitHub** | <https://github.com/bcoe/c8> |
| **配合** | 任何测试框架 |
| **配置难度** | 🟢 简单 |

```bash
# 使用c8运行测试
c8 vitest run
c8 npm test
```

```json
// package.json
{
  "scripts": {
    "test:coverage": "c8 vitest run"
  }
}
```

---

### Istanbul / nyc

| 属性 | 详情 |
|------|------|
| **Stars** | nyc 15k+ |
| **TS支持** | ⚠️ 需 source-map 支持 |
| **特点** | 老牌覆盖率工具，功能丰富，HTML报告 |
| **GitHub** | <https://github.com/istanbuljs/nyc> |
| **配合** | Jest, Mocha, AVA |
| **配置难度** | 🟡 中等 |

```bash
# nyc配置
nyc --reporter=html --reporter=text npm test
```

---

### Vitest 内置覆盖率

| 属性 | 详情 |
|------|------|
| **TS支持** | ✅ 原生支持 |
| **特点** | 基于v8或istanbul，无需额外工具 |
| **配置难度** | 🟢 简单 |

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8', // 或 'istanbul'
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: ['node_modules/', 'dist/', '*.config.*']
    }
  }
})
```

```bash
# 运行带覆盖率的测试
vitest run --coverage
```

---

## 6️⃣ Mock/Stub工具 (Mocking Tools)

### 🏆 MSW (Mock Service Worker) ⭐16k

| 属性 | 详情 |
|------|------|
| **Stars** | 16k+ (GitHub) |
| **TS支持** | ✅ 原生支持 |
| **特点** | 拦截网络请求，浏览器/Node双环境，零侵入 |
| **官网** | <https://mswjs.io> |
| **GitHub** | <https://github.com/mswjs/msw> |
| **使用场景** | API Mock、测试、开发、Storybook |
| **配置难度** | 🟢 简单 |

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ])
  }),

  http.post('/api/login', async ({ request }) => {
    const body = await request.json()
    if (body.email === 'test@example.com') {
      return HttpResponse.json({ token: 'fake-jwt-token' })
    }
    return new HttpResponse(null, { status: 401 })
  })
]
```

```typescript
// 测试中使用
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('获取用户列表', async () => {
  const users = await fetchUsers()
  expect(users).toHaveLength(2)
})
```

**MSW 2.0 新特性**:

- 使用标准 Fetch API 的 `Request`/`Response`
- 更简洁的API设计
- 更好的TypeScript支持

---

### Sinon.js

| 属性 | 详情 |
|------|------|
| **Stars** | 9k+ (GitHub) |
| **TS支持** | ✅ `@types/sinon` |
| **特点** | 独立的Mock/Spy/Stub库，不依赖测试框架 |
| **官网** | <https://sinonjs.org> |
| **GitHub** | <https://github.com/sinonjs/sinon> |
| **使用场景** | 函数Mock、时间控制、XHR Mock |
| **配置难度** | 🟢 简单 |

```typescript
import sinon from 'sinon'

test('使用Sinon Mock', () => {
  const myObj = { method: () => 'original' }

  // Stub
  sinon.stub(myObj, 'method').returns('stubbed')
  expect(myObj.method()).toBe('stubbed')

  // Spy
  const callback = sinon.spy()
  myFunction(callback)
  sinon.assert.calledOnce(callback)

  // Fake timers
  const clock = sinon.useFakeTimers()
  setTimeout(() => console.log('delayed'), 1000)
  clock.tick(1000)
  clock.restore()
})
```

---

### testdouble.js

| 属性 | 详情 |
|------|------|
| **Stars** | 2k+ (GitHub) |
| **TS支持** | ✅ `@types/testdouble` |
| **特点** | 极简API，注重TDD，无全局污染 |
| **官网** | <https://github.com/testdouble/testdouble.js> |
| **GitHub** | <https://github.com/testdouble/testdouble.js> |
| **使用场景** | 单元测试Mock |
| **配置难度** | 🟢 简单 |

```typescript
import td from 'testdouble'

test('使用testdouble', () => {
  const fakeFetch = td.function('fetch')
  td.when(fakeFetch('/api/data')).thenResolve({ data: [] })

  const result = await fakeFetch('/api/data')
  expect(result.data).toEqual([])
})
```

---

## 📋 技术选型建议

### 新项目推荐组合 (2024)

| 场景 | 推荐工具 | 备选方案 |
|------|----------|----------|
| 单元测试 | **Vitest** | Jest (存量项目) |
| E2E测试 | **Playwright** | Cypress |
| 组件测试 | **Testing Library** + Vitest | Storybook |
| API Mock | **MSW** | Sinon |
| 覆盖率 | **Vitest内置** | c8 |
| 视觉回归 | **Chromatic** | Percy |

### 不同场景配置

```typescript
// ===== React + TypeScript 项目 =====
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts']
  }
})

// ===== Vue + TypeScript 项目 =====
// vitest.config.ts
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom'
  }
})

// ===== Node.js 项目 =====
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node'
  }
})
```

---

## 📚 相关资源

| 资源 | 链接 |
|------|------|
| Vitest 文档 | <https://vitest.dev/guide/> |
| Playwright 文档 | <https://playwright.dev/docs/intro> |
| Testing Library 文档 | <https://testing-library.com/docs/> |
| MSW 文档 | <https://mswjs.io/docs/> |
| Storybook 文档 | <https://storybook.js.org/docs> |

---

## 📈 趋势总结

| 趋势 | 说明 |
|------|------|
| **Vitest > Jest** | Vite生态推动，速度优势明显，配置更简单 |
| **Playwright > Cypress** | 多浏览器支持，更好的Trace/Debug能力 |
| **MSW 标准化** | 成为API Mock的事实标准 |
| **Testing Library 理念普及** | 测试行为而非实现成为最佳实践 |
| **视觉测试增长** | Chromatic/Percy等工具使用增加 |

---

> **文档版本**: 2024年4月
> **维护建议**: 每季度更新 Stars 数据和趋势分析
