---
title: 11 测试策略
description: 掌握 Next.js App Router 的测试方法：RSC 单元测试、E2E 测试、Mock 策略、MSW 和测试最佳实践。
---

# 11 测试策略

> **前置知识**：React 测试基础、Next.js App Router
>
> **目标**：能够建立完整的 Next.js 测试体系

---

## 1. RSC 测试

### 1.1 服务端组件测试

```typescript
// app/page.test.tsx
import { render } from '@testing-library/react';
import Page from './page';
import { db } from '@/lib/db';

jest.mock('@/lib/db');

describe('Page', () => {
  it('renders user data', async () => {
    (db.users.findById as jest.Mock).mockResolvedValue({
      name: 'Alice',
      email: 'alice@example.com',
    });

    const page = await Page({ params: { id: '1' } });
    const { getByText } = render(page);

    expect(getByText('Alice')).toBeInTheDocument();
    expect(getByText('alice@example.com')).toBeInTheDocument();
  });
});
```

### 1.2 Async Component 测试

```typescript
// 测试异步 Server Component
import { render, screen } from '@testing-library/react';

async function renderServerComponent(Component: React.ComponentType<any>) {
  const rendered = await Component({});
  return render(rendered);
}

it('loads data on server', async () => {
  await renderServerComponent(Page);
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

---

## 2. E2E 测试

### 2.1 Playwright 配置

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
  },
});
```

### 2.2 E2E 测试用例

```typescript
// e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test('navigates between pages', async ({ page }) => {
  await page.goto('/');

  await page.click('text=About');
  await expect(page).toHaveURL('/about');
  await expect(page.locator('h1')).toContainText('About');
});

test('submits form', async ({ page }) => {
  await page.goto('/contact');

  await page.fill('input[name="name"]', 'Alice');
  await page.fill('input[name="email"]', 'alice@example.com');
  await page.click('button[type="submit"]');

  await expect(page.locator('.success')).toBeVisible();
});
```

---

## 3. Mock 策略

### 3.1 MSW (Mock Service Worker)

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/user', () => {
    return HttpResponse.json({ id: '1', name: 'Alice' });
  }),

  http.post('/api/posts', async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({ id: '123', ...data });
  }),
];
```

```typescript
// jest.setup.ts
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 3.2 Next.js fetch Mock

```typescript
// 测试中使用原生 fetch mock
jest.spyOn(global, 'fetch').mockImplementation(
  jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ data: 'mocked' }),
    })
  ) as jest.Mock
);
```

---

## 4. 测试最佳实践

### 4.1 测试金字塔

```
        /\
       /  \     E2E (Playwright)     5%
      /----\    慢、昂贵、高置信度
     /      \
    /--------\   Integration (MSW)    20%
   /          \  中等速度
  /------------\ Unit (Jest/Vitest)   75%
 /              \ 快、便宜、低置信度
/----------------\
```

### 4.2 测试清单

- [ ] 组件渲染测试
- [ ] 用户交互测试
- [ ] 数据获取测试
- [ ] 错误边界测试
- [ ] 加载状态测试
- [ ] 路由导航测试
- [ ] 表单验证测试
- [ ] 认证流程测试

---

## 延伸阅读

- [Testing Next.js](https://nextjs.org/docs/app/building-your-application/testing)
- [Playwright](https://playwright.dev/)
- [MSW](https://mswjs.io/)
