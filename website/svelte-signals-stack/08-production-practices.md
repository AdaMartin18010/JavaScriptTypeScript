---
title: Svelte 生产实践
description: '测试策略、CI/CD、Core Web Vitals 优化、CSP 安全、监控与部署最佳实践'
---

# Svelte 生产实践

> 最后更新: 2026-05-01
> 数据来源: Web Almanac 2024、Chrome UX Report (CrUX) 2024Q4、Svelte 官方文档 (5.28.2)、MDN、OWASP Cheat Sheet Series 2024

---

## 测试策略

> 来源: [Vitest 官方文档](https://vitest.dev/) (v3.0)、[@testing-library/svelte](https://testing-library.com/docs/svelte-testing-library/intro/) (v5.2)、[Playwright 官方文档](https://playwright.dev/) (v1.51)、[MSW 官方文档](https://mswjs.io/) (v2.7)

### 单元测试 (Vitest + @testing-library/svelte)

```bash
npm install -D vitest @testing-library/svelte jsdom @testing-library/jest-dom @testing-library/user-event
```

**vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['src/test/**', '**/*.d.ts', '**/*.config.*']
    }
  }
});
```

**src/test/setup.ts**

```ts
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// 模拟 $app/stores
vi.mock('$app/stores', () => ({
  page: {
    subscribe: vi.fn((fn) => {
      fn({ url: new URL('http://localhost/'), params: {}, route: { id: null } });
      return () => {};
    })
  },
  navigating: { subscribe: vi.fn((fn) => { fn(null); return () => {}; }) },
  updated: { subscribe: vi.fn((fn) => { fn(false); return () => {}; }) }
}));
```

#### 组件渲染测试

```ts
// Counter.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import Counter from './Counter.svelte';

describe('Counter', () => {
  it('renders with initial count', () => {
    render(Counter, { props: { initial: 5 } });
    expect(screen.getByRole('button')).toHaveTextContent('5');
  });

  it('increments on click', async () => {
    render(Counter, { props: { initial: 0 } });
    const button = screen.getByRole('button');
    await fireEvent.click(button);
    expect(button).toHaveTextContent('1');
  });

  it('decrements on right click', async () => {
    render(Counter, { props: { initial: 0 } });
    const button = screen.getByRole('button');
    await fireEvent.contextMenu(button);
    expect(button).toHaveTextContent('-1');
  });
});
```

#### 表单交互与验证测试

```ts
// LoginForm.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from './LoginForm.svelte';

describe('LoginForm', () => {
  it('validates email format', async () => {
    const user = userEvent.setup();
    render(LoginForm);
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    await user.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  it('submits with valid data', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(LoginForm, { props: { onSubmit } });
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123'
    }));
  });
});
```

#### 状态与副作用测试

```ts
// Timer.test.ts
import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Timer from './Timer.svelte';

describe('Timer', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('counts down from initial value', async () => {
    render(Timer, { props: { seconds: 10 } });
    expect(screen.getByText('10s')).toBeInTheDocument();
    vi.advanceTimersByTime(3000);
    await waitFor(() => expect(screen.getByText('7s')).toBeInTheDocument());
  });
});
```

#### 集成测试：页面级组件

```ts
// DashboardPage.test.ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import DashboardPage from './+page.svelte';

describe('DashboardPage', () => {
  it('renders data from page store', () => {
    const data = {
      stats: { users: 1000, revenue: 50000 }
    };
    render(DashboardPage, { props: { data } });
    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
  });
});
```

### 端到端测试 (Playwright)

> 来源: [Playwright 最佳实践](https://playwright.dev/docs/best-practices) (v1.51)

```bash
npm install -D @playwright/test
npx playwright install
```

**playwright.config.ts**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:4173',
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
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI
  }
});
```

#### Page Object Model (POM)

> 来源: [Playwright POM](https://playwright.dev/docs/pom)

```ts
// tests/pages/BasePage.ts
import type { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async expectTitle(pattern: RegExp) {
    await expect(this.page).toHaveTitle(pattern);
  }
}

// tests/pages/LoginPage.ts
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput = this.page.getByLabel('Email');
  readonly passwordInput = this.page.getByLabel('Password');
  readonly submitButton = this.page.getByRole('button', { name: 'Login' });
  readonly errorMessage = this.page.getByTestId('login-error');

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}

// tests/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Authentication', () => {
  test('successful login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/login');
    await loginPage.login('user@example.com', 'correct-password');
    await expect(page).toHaveURL('/dashboard');
  });

  test('failed login shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/login');
    await loginPage.login('user@example.com', 'wrong-password');
    await loginPage.expectError('Invalid credentials');
  });
});
```

#### 视觉回归测试

> 来源: [Playwright 截图](https://playwright.dev/docs/test-snapshots)、[Argos CI](https://argos-ci.com/)

```ts
// tests/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('homepage matches snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // 等待字体加载完成
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      threshold: 0.2,
      maxDiffPixelRatio: 0.01
    });
  });

  test('dark mode toggle', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /toggle theme/i }).click();
    await expect(page).toHaveScreenshot('homepage-dark.png', { fullPage: true });
  });
});
```

**package.json scripts**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:update-snapshots": "playwright test --update-snapshots"
  }
}
```

### Mock Service Worker (MSW) 在 SvelteKit 中的使用

> 来源: [MSW 官方文档](https://mswjs.io/docs/) (v2.7)、[SvelteKit Service Workers](https://kit.svelte.dev/docs/service-workers)

MSW 允许在浏览器和 Node 环境中拦截 HTTP 请求，是替代 mock fetch 的更优方案。

```bash
npm install -D msw
```

**mocks/handlers.ts**

```ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json({
      users: [
        { id: '1', name: 'Alice', email: 'alice@example.com' },
        { id: '2', name: 'Bob', email: 'bob@example.com' }
      ]
    });
  }),

  http.post('/api/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    if (body.email === 'user@example.com' && body.password === 'password') {
      return HttpResponse.json({ token: 'mock-jwt-token', user: { id: '1', name: 'Test User' } });
    }
    return new HttpResponse(null, { status: 401, statusText: 'Unauthorized' });
  }),

  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({ id, name: `User ${id}`, email: `user${id}@example.com` });
  })
];
```

**mocks/server.ts (Node 环境)**

```ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**mocks/browser.ts (浏览器环境)**

```ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

**src/test/setup.ts**

```ts
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '../../mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**hooks.client.ts (开发环境启用 MSW)**

```ts
import type { HandleClientError } from '@sveltejs/kit';

if (import.meta.env.DEV) {
  const { worker } = await import('../mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

export const handleError: HandleClientError = async ({ error, event, status, message }) => {
  console.error('Client error:', error);
};
```

**在组件测试中使用 MSW**

```ts
// UserList.test.ts
import { render, screen, waitFor } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { describe, it, expect } from 'vitest';
import UserList from './UserList.svelte';

describe('UserList', () => {
  it('renders users from API', async () => {
    render(UserList);
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  it('handles empty state', async () => {
    server.use(
      http.get('/api/users', () => HttpResponse.json({ users: [] }))
    );
    render(UserList);
    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  it('handles server error', async () => {
    server.use(
      http.get('/api/users', () => new HttpResponse(null, { status: 500 }))
    );
    render(UserList);
    await waitFor(() => {
      expect(screen.getByText('Failed to load users')).toBeInTheDocument();
    });
  });
});
```

---

## CI/CD

### GitHub Actions 完整工作流

> 来源: [GitHub Actions 官方文档](https://docs.github.com/en/actions) (2025)、[pnpm CI 最佳实践](https://pnpm.io/continuous-integration)

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '22'
  PNPM_VERSION: '10'

jobs:
  # ========== Stage 1: 类型检查与代码质量 ==========
  quality:
    name: Quality Gates
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm check

      - name: Lint
        run: pnpm lint

      - name: Format check
        run: pnpm format:check

  # ========== Stage 2: 单元与组件测试 ==========
  unit-test:
    name: Unit Tests
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v5
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  # ========== Stage 3: 端到端测试 ==========
  e2e-test:
    name: E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium firefox webkit

      - name: Build application
        run: pnpm build

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  # ========== Stage 4: 构建与部署 ==========
  build-and-deploy:
    name: Build & Deploy
    needs: [quality, unit-test, e2e-test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Build production
        run: pnpm build
        env:
          PUBLIC_SENTRY_DSN: ${{ secrets.PUBLIC_SENTRY_DSN }}
          PUBLIC_ANALYTICS_ID: ${{ secrets.PUBLIC_ANALYTICS_ID }}

      - name: Build Docker image
        run: docker build -t myapp:${{ github.sha }} .

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag myapp:${{ github.sha }} myregistry/myapp:${{ github.sha }}
          docker tag myapp:${{ github.sha }} myregistry/myapp:latest
          docker push myregistry/myapp:${{ github.sha }}
          docker push myregistry/myapp:latest

      - name: Deploy to production
        run: |
          # 执行部署脚本或触发平台部署
          curl -X POST ${{ secrets.DEPLOY_WEBHOOK }} \
            -H "Authorization: Bearer ${{ secrets.DEPLOY_TOKEN }}" \
            -d '{"image": "myregistry/myapp:${{ github.sha }}"}'
```

**package.json 补充脚本**

```json
{
  "scripts": {
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "lint": "eslint . --ext .ts,.svelte",
    "format:check": "prettier --check .",
    "format": "prettier --write .",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

---

## Docker 容器化部署

> 来源: [Node.js Docker 最佳实践](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/) (Node 22 LTS 2024)、[Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

### 多阶段构建 Dockerfile

```dockerfile
# ==========================================
# Stage 1: Dependencies
# ==========================================
FROM node:22-alpine AS deps
WORKDIR /app

# 单独缓存依赖层
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile --prod

# ==========================================
# Stage 2: Builder
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ==========================================
# Stage 3: Production Runner
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# 创建非 root 用户运行应用
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 sveltekit

# 仅复制必要文件
COPY --from=deps --chown=sveltekit:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=sveltekit:nodejs /app/build ./build
COPY --from=builder --chown=sveltekit:nodejs /app/package.json ./package.json

USER sveltekit

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/healthz', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "build"]
```

### Docker Compose 配置

```yaml
# docker-compose.yml
version: "3.9"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - PUBLIC_SENTRY_DSN=${PUBLIC_SENTRY_DSN}
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/healthz', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M

  # 可选：Redis 缓存层
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis-data:/data
    deploy:
      resources:
        limits:
          memory: 256M

volumes:
  redis-data:
```

### .dockerignore

```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.*
!.env.example
.vscode
.idea
coverage
.nyc_output
playwright-report
test-results
*.md
docs
```

---

## Core Web Vitals 优化清单

> 来源: [web.dev Core Web Vitals](https://web.dev/articles/vitals) (2024)、[Chrome UX Report](https://developer.chrome.com/docs/crux) (2024Q4)、[SvelteKit Performance](https://kit.svelte.dev/docs/performance)

### LCP (Largest Contentful Paint) — 目标 < 2.5s

| # | 策略 | 实施方式 | 预期提升 |
|---|------|---------|---------|
| 1 | **服务端渲染 (SSR)** | `export const ssr = true` + `adapter-node` | 减少 0.5-1.5s |
| 2 | **图片预加载** | `<link rel="preload" as="image" href="/hero.webp">` | 减少 200-500ms |
| 3 | **使用 WebP/AVIF** | `@sveltejs/enhanced-img` 自动生成现代格式 | 减少 30-50% 体积 |
| 4 | **关键图片 eager 加载** | `loading="eager"` 对首屏图片 | 避免懒加载延迟 |
| 5 | **CDN + Edge 缓存** | Vercel Edge / Cloudflare Pages | 减少 TTFB 100-300ms |
| 6 | **字体 display=swap** | `@font-face { font-display: swap }` | 避免 FOIT 阻塞 |
| 7 | **减少渲染阻塞 CSS** | 关键 CSS 内联，非关键异步加载 | 减少 100-300ms |

### INP (Interaction to Next Paint) — 目标 < 200ms

> 来源: [web.dev INP](https://web.dev/articles/inp) (2024)

| # | 策略 | 实施方式 | 预期提升 |
|---|------|---------|---------|
| 1 | **Svelte 5 Runes 细粒度更新** | `$state`、`$derived` 替代 `$:` | 减少无效重渲染 |
| 2 | **虚拟长列表** | `svelte-virtual-list` 或 `svelte-tiny-virtual-list` | 减少 DOM 节点 90%+ |
| 3 | **事件委托优化** | 避免内联箭头函数：`onclick={() => handle(i)}` → 数据属性 | 减少内存分配 |
| 4 | **requestIdleCallback 延迟加载** | 非关键逻辑延迟到空闲时段 | 减少主线程阻塞 |
| 5 | **Web Workers 处理数据** | `comlink` + Worker 处理大数据集 | 主线程零阻塞 |
| 6 | **减少第三方脚本** | `partytown` 将非关键脚本移至 Web Worker | INP 提升 40-60% |
| 7 | **CSS Containment** | `contain: layout paint` 隔离重渲染区域 | 减少布局范围 |

### CLS (Cumulative Layout Shift) — 目标 < 0.1

| # | 策略 | 实施方式 |
|---|------|---------|
| 1 | **图片尺寸声明** | `<img width="800" height="600">` 或 CSS `aspect-ratio` |
| 2 | **预留广告/嵌入位** | 固定高度的占位容器，避免内容跳动 |
| 3 | **字体预加载 + 回退栈** | `font-display: optional` + 系统字体回退 |
| 4 | **避免在已有内容上方插入** | 新内容追加到下方，而非插入顶部 |
| 5 | **动画使用 transform** | `transform: translateY()` 替代 `margin/top` 变化 |
| 6 | **骨架屏占位** | 数据加载前显示骨架屏，尺寸与真实内容一致 |

### TTFB (Time to First Byte) — 目标 < 600ms

| # | 策略 | 实施方式 | 预期提升 |
|---|------|---------|---------|
| 1 | **Edge 部署** | Vercel Edge / Cloudflare Pages / Deno Deploy | 减少 100-500ms |
| 2 | **Streaming SSR** | SvelteKit `streaming` 渐进返回 HTML | 首字节立即返回 |
| 3 | **数据库连接池** | `pg-bouncer` / `prisma accelerate` | 减少查询延迟 50%+ |
| 4 | **Edge 缓存 (CDN)** | `Cache-Control: s-maxage=60, stale-while-revalidate=86400` | 缓存命中时 < 50ms |
| 5 | **预渲染静态页面** | `export const prerender = true` 对营销页/文档 | TTFB ≈ CDN 延迟 |
| 6 | **HTTP/2 Server Push（已弃用）→ Early Hints** | `103 Early Hints` 预加载关键资源 | 减少 100-200ms |

### @sveltejs/enhanced-img 图片优化

> 来源: [@sveltejs/enhanced-img](https://kit.svelte.dev/docs/images) (SvelteKit 2.21+)

```bash
npm install -D @sveltejs/enhanced-img
```

**svelte.config.js**

```js
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default {
  preprocess: [vitePreprocess(), enhancedImages()],
  kit: { adapter: adapter() }
};
```

**组件中使用**

```svelte
<script>
  import hero from './hero.jpg?enhanced';
  import thumb from './thumb.png?enhanced';
</script>

<!-- 响应式图片：自动生成 srcset -->
<enhanced:img
  src={hero}
  alt="Hero banner"
  sizes="(min-width: 1280px) 1280px, 100vw"
  loading="eager"
  decoding="async"
/>

<!-- 固定尺寸缩略图 -->
<enhanced:img
  src={thumb}
  alt="Thumbnail"
  width={200}
  height={150}
  loading="lazy"
/>

<!-- 艺术指导 (Art Direction) -->
<picture>
  <source srcset={hero} media="(min-width: 1024px)" />
  <enhanced:img src={thumb} alt="Responsive image" />
</picture>
```

**生成格式**: 自动输出 WebP、AVIF（如配置），并生成多尺寸 `srcset`。

---

## 安全最佳实践

> 来源: [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) (2024)、[MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)、[SvelteKit Security](https://kit.svelte.dev/docs/security)

### Content Security Policy (CSP) 完整配置

#### 方案一：Nonce-based CSP（推荐）

> 来源: [SvelteKit CSP 指南](https://kit.svelte.dev/docs/security#content-security-policy)

```ts
// src/hooks.ts
import type { Handle } from '@sveltejs/kit';
import { randomBytes } from 'crypto';

export const handle: Handle = async ({ event, resolve }) => {
  const nonce = randomBytes(16).toString('base64');
  event.locals.nonce = nonce;

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace(/%sveltekit.nonce%/g, nonce);
    }
  });

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.example.com https://*.sentry.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  return response;
};
```

**svelte.config.js（启用 CSP nonce 占位符）**

```js
export default {
  kit: {
    csp: {
      mode: 'nonce',
      directives: {
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline']
      }
    }
  }
};
```

#### 方案二：Hash-based CSP（静态站点）

```ts
// svelte.config.js
export default {
  kit: {
    csp: {
      mode: 'hash',
      directives: {
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline']
      }
    }
  }
};
```

SvelteKit 在构建时自动计算内联 `<script>` 和 `<style>` 的 hash。

#### 方案三：strict-dynamic（第三方脚本）

```ts
// 允许受信任的根脚本加载子脚本
const csp = [
  "default-src 'self'",
  "script-src 'nonce-ABC123' 'strict-dynamic'",
  // strict-dynamic 下忽略 'self' 和 host 白名单
].join('; ');
```

> 注意: `'strict-dynamic'` 会忽略 `script-src` 中的域名白名单，仅信任带 nonce/hash 的脚本及其加载的子脚本。

### XSS 防护

```svelte
<!-- ✅ 安全：自动 HTML 实体转义 -->
<p>{userInput}</p>

<!-- ⚠️ 危险：仅用于可信/已净化内容 -->
{@html sanitizedHtml}

<!-- ✅ 使用 DOMPurify 净化 -->
<script>
  import DOMPurify from 'dompurify';
  const clean = DOMPurify.sanitize(dirtyHtml);
</script>
{@html clean}
```

### CSRF 防护

SvelteKit 默认启用同源策略 + CSRF 防护：

```ts
// svelte.config.js
export default {
  kit: {
    csrf: {
      checkOrigin: true  // 默认开启，验证 Origin/Referer
    }
  }
};
```

配合 `enhance` 使用：

```svelte
<form method="POST" action="/login" use:enhance>
  <!-- 自动携带 CSRF token -->
</form>
```

### 点击劫持防护

已通过 `X-Frame-Options: DENY` + `frame-ancestors 'none'` 双重防护。

### 依赖漏洞扫描

```bash
# npm audit
npm audit --audit-level moderate

# Snyk 深度扫描
npx snyk test

# GitHub Dependabot（自动 PR 修复）
# 配置 .github/dependabot.yml
```

**.github/dependabot.yml**

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "your-team"
```

---

## 监控与可观测性

> 来源: [Sentry SvelteKit SDK](https://docs.sentry.io/platforms/javascript/guides/sveltekit/) (v9.0)、[Vercel Analytics](https://vercel.com/docs/analytics) (2025)、[Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/) (2025)

### Sentry 错误追踪 + 性能监控

```bash
npm install @sentry/sveltekit
```

**vite.config.ts**

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { sentrySvelteKit } from '@sentry/sveltekit';

export default defineConfig({
  plugins: [
    sentrySvelteKit({
      sourceMapsUploadOptions: {
        org: 'your-org',
        project: 'your-project',
        authToken: process.env.SENTRY_AUTH_TOKEN
      }
    }),
    sveltekit()
  ]
});
```

**hooks.client.ts**

```ts
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: import.meta.env.PUBLIC_APP_VERSION,
  // 性能采样：生产 10%，开发 100%
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  // 回放采样
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false
    })
  ],
  beforeSend(event) {
    // 过滤敏感信息
    if (event.exception) {
      // 自定义过滤逻辑
    }
    return event;
  }
});

export const handleError = Sentry.handleErrorWithSentry();
```

**hooks.server.ts**

```ts
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  integrations: [Sentry.profileIntegration()]
});

export const handleError = Sentry.handleErrorWithSentry();
```

### Vercel Analytics

```bash
npm install @vercel/analytics
```

**+layout.svelte**

```svelte
<script>
  import { dev } from '$app/environment';
  import { inject } from '@vercel/analytics';

  inject({ mode: dev ? 'development' : 'production' });
</script>

<slot />
```

**Web Vitals 数据上报**

```svelte
<script>
  import { browser } from '$app/environment';

  if (browser) {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // 上报到自有分析平台
        fetch('/api/vitals', {
          method: 'POST',
          body: JSON.stringify({
            name: entry.name,
            value: entry.value,
            id: entry.id,
            navigationType: entry.navigationType
          }),
          keepalive: true
        });
      }
    }).observe({ type: 'web-vitals' });
  }
</script>
```

### Cloudflare Web Analytics

```html
<!-- 无需 JS bundle，纯隐私友好 -->
<!-- 在 app.html <head> 中插入 -->
<script
  defer
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "YOUR_TOKEN"}'
></script>
```

### 日志管理 (Structured Logging + Pino)

> 来源: [Pino 官方文档](https://getpino.io/) (v9.0)

```bash
npm install pino pino-pretty
```

**src/lib/logger.ts**

```ts
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss Z' }
      }
    : undefined,
  base: {
    service: 'sveltekit-app',
    version: process.env.PUBLIC_APP_VERSION || 'unknown'
  },
  // 生产环境 redact 敏感字段
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', '*.password'],
    remove: true
  }
});

// 子 logger 用于特定模块
export const authLogger = logger.child({ module: 'auth' });
export const dbLogger = logger.child({ module: 'database' });
```

**服务端使用**

```ts
// +page.server.ts
import { logger } from '$lib/logger';

export const load = async ({ request, locals }) => {
  const reqLogger = logger.child({ requestId: locals.requestId });
  reqLogger.info({ url: request.url }, 'Page load started');

  try {
    const data = await fetchData();
    reqLogger.info('Page load completed');
    return { data };
  } catch (err) {
    reqLogger.error({ err }, 'Page load failed');
    throw error(500, 'Internal error');
  }
};
```

**请求 ID 追踪**

```ts
// hooks.server.ts
import { randomUUID } from 'crypto';
import { logger } from '$lib/logger';

export const handle = async ({ event, resolve }) => {
  event.locals.requestId = randomUUID();
  event.locals.logger = logger.child({ requestId: event.locals.requestId });

  const start = Date.now();
  const response = await resolve(event);
  const duration = Date.now() - start;

  event.locals.logger.info({
    method: event.request.method,
    path: event.url.pathname,
    status: response.status,
    duration_ms: duration
  }, 'Request completed');

  response.headers.set('X-Request-Id', event.locals.requestId);
  return response;
};
```

---

## 安全审计清单

> 来源: [OWASP Top 10 2021](https://owasp.org/Top10/)、[OWASP ASVS 4.0](https://github.com/OWASP/ASVS)

| 类别 | 检查项 | 状态 | 工具/方法 |
|------|--------|------|----------|
| **XSS** | 1. 所有用户输入使用 `{expression}` 自动转义 | ☐ | 代码审查 |
| | 2. `{@html}` 仅用于 DOMPurify 净化后的内容 | ☐ | 代码审查 |
| | 3. CSP `script-src` 禁止 `unsafe-inline` (使用 nonce) | ☐ | CSP Evaluator |
| **CSRF** | 4. `checkOrigin: true` 已启用 | ☐ | 配置审查 |
| | 5. 所有状态变更操作使用 POST/PUT/DELETE | ☐ | 代码审查 |
| | 6. 敏感操作需要二次确认 (re-authentication) | ☐ | 设计审查 |
| **点击劫持** | 7. `X-Frame-Options: DENY` 或 `SAMEORIGIN` | ☐ | 响应头检查 |
| | 8. CSP `frame-ancestors 'none'` 已设置 | ☐ | 响应头检查 |
| **注入攻击** | 9. 使用参数化查询（Prisma/ Drizzle） | ☐ | ORM 审查 |
| | 10. 用户输入验证使用 Zod / Valibot | ☐ | 代码审查 |
| **依赖安全** | 11. `npm audit` 无 High/Critical 漏洞 | ☐ | `npm audit` |
| | 12. Dependabot 自动安全更新已启用 | ☐ | GitHub 设置 |
| | 13. 锁定文件 (lockfile) 完整性检查 | ☐ | CI 检查 |
| **传输安全** | 14. HTTPS 强制 (HSTS) | ☐ | SSL Labs 检测 |
| | 15. Cookie `Secure`、`HttpOnly`、`SameSite=Strict` | ☐ | 响应头检查 |
| **认证** | 16. 密码策略：bcrypt/Argon2，salt + pepper | ☐ | 代码审查 |
| | 17. JWT 使用 RS256，设置合理过期时间 | ☐ | 代码审查 |
| | 18. 会话管理：安全存储、定期轮换 | ☐ | 代码审查 |
| **信息泄露** | 19. 生产环境禁用详细错误信息 | ☐ | 配置审查 |
| | 20. 移除源代码映射文件 (`.map`) 或限制访问 | ☐ | 构建审查 |
| **Headers** | 21. `X-Content-Type-Options: nosniff` | ☐ | 响应头检查 |
| | 22. `Referrer-Policy` 已配置 | ☐ | 响应头检查 |
| | 23. `Permissions-Policy` 限制敏感 API | ☐ | 响应头检查 |

---

## 生产环境检查清单 (20+ 项)

> 来源: [The Twelve-Factor App](https://12factor.net/) (2024)、[SvelteKit 部署指南](https://kit.svelte.dev/docs/adapters)、[Google Lighthouse](https://developer.chrome.com/docs/lighthouse/)

### 构建与质量

- [ ] **类型检查通过** — `svelte-check` 零错误零警告
- [ ] **单元测试覆盖率 > 80%** — 核心业务逻辑全覆盖
- [ ] **E2E 测试通过** — 关键用户旅程 (登录、支付、核心功能)
- [ ] **Lint & Format 通过** — ESLint + Prettier 零问题
- [ ] **构建无警告** — Vite 构建无未使用变量/导入警告

### 性能

- [ ] **Lighthouse 评分 > 90** — Performance / Accessibility / Best Practices / SEO
- [ ] **LCP < 2.5s** — 首屏最大内容渲染时间
- [ ] **INP < 200ms** — 交互响应延迟
- [ ] **CLS < 0.1** — 累计布局偏移
- [ ] **TTFB < 600ms** — 首字节时间
- [ ] **图片已优化** — 使用 `enhanced-img` 或 CDN 图片服务
- [ ] **JS bundle 已分析** — `vite-bundle-visualizer` 无冗余依赖
- [ ] **Tree-shaking 生效** — 无未使用的库被打包

### 安全

- [ ] **CSP 配置正确** — nonce/hash 模式，无 `unsafe-inline` 脚本
- [ ] **HTTPS 强制** — HSTS 头已配置，证书有效
- [ ] **Cookie 安全属性** — `Secure`, `HttpOnly`, `SameSite`
- [ ] **依赖漏洞扫描通过** — `npm audit` 无高危漏洞
- [ ] **敏感信息未泄露** — 无 API Key / Secret 提交到仓库
- [ ] **错误处理无信息泄露** — 生产环境不暴露堆栈跟踪

### 部署与运维

- [ ] **环境变量配置正确** — `.env.production` 所有必需变量已设置
- [ ] **数据库迁移已执行** — 生产 schema 与代码版本一致
- [ ] **健康检查端点** — `/healthz` 或 `/api/health` 返回 200
- [ ] **Docker 镜像安全扫描** — Trivy / Snyk Container 无高危漏洞
- [ ] **非 root 用户运行** — Docker 容器使用 UID ≥ 1001
- [ ] **资源限制已设置** — CPU / 内存限制，防止 OOM
- [ ] **日志收集配置** — 结构化日志输出到 stdout/stderr
- [ ] **监控告警配置** — Sentry / 自研监控 错误率 / P95 延迟告警
- [ ] **回滚策略就绪** — 上一版本镜像保留，可快速回滚
- [ ] **域名 / SSL 配置** — 证书自动续期 (Let's Encrypt)
- [ ] **DNS / CDN 配置** — CNAME / A 记录正确，TTL 合理

### SEO 与可访问性

- [ ] **Meta 标签完整** — title, description, OG tags, Twitter cards
- [ ] **robots.txt / sitemap.xml** — 搜索引擎可正确索引
- [ ] **语义化 HTML** — 正确的 heading 层级，landmark 区域
- [ ] **键盘导航** — 所有交互元素可通过 Tab 访问
- [ ] **ARIA 标签** — 动态内容使用 `aria-live`，图标按钮有 `aria-label`
- [ ] **色彩对比度** — WCAG 2.1 AA 标准 (4.5:1)

---

> 最后更新: 2026-05-01
