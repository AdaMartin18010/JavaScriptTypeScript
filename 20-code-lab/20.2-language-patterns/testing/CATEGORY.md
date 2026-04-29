---
dimension: 综合
sub-dimension: Testing
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Testing 核心概念与工程实践。

## 包含内容

- 本模块聚焦 testing 核心概念与工程实践。
- 单元测试、集成测试、E2E 测试、Mock/Stub、TDD/BDD 方法论。

## 子模块总览

| 子模块 | 说明 | 文件 |
|--------|------|------|
| Unit Test Patterns | 最小可测单元的断言与隔离 | `unit-test-patterns.ts` / `unit-test-patterns.test.ts` |
| Integration Testing | 多模块协作的正确性验证 | `integration-testing.ts` / `integration-testing.test.ts` |
| E2E Testing | 端到端用户场景仿真 | `e2e-testing.ts` / `e2e-testing.test.ts` |
| Mock & Stub | 依赖替身与行为录制 | `mock-stub.ts` / `mock-stub.test.ts` |
| TDD & BDD | 测试驱动与行为驱动开发范式 | `tdd-bdd.ts` / `tdd-bdd.test.ts` |

## 代码示例：Vitest 单元测试

```typescript
// unit-test-patterns.test.ts — 纯函数与副作用隔离
import { describe, it, expect, vi } from 'vitest';
import { calculateDiscount, fetchPrice } from './unit-test-patterns';

describe('calculateDiscount', () => {
  it('returns 20% discount for VIP', () => {
    expect(calculateDiscount(100, 'VIP')).toBe(80);
  });

  it('calls fetchPrice and applies discount', async () => {
    const mockFetch = vi.fn().mockResolvedValue(200);
    const price = await fetchPrice('sku-1', mockFetch);
    expect(mockFetch).toHaveBeenCalledWith('sku-1');
    expect(price).toBe(200);
  });
});
```

### Playwright E2E 测试示例

```typescript
// e2e-testing.test.ts — 端到端结账流程
import { test, expect } from '@playwright/test';

test('user can complete checkout', async ({ page }) => {
  await page.goto('/products');
  await page.locator('[data-testid="add-to-cart"]').first().click();
  await page.locator('[data-testid="cart-link"]').click();
  await page.locator('text=Checkout').click();
  await page.fill('[name="email"]', 'test@example.com');
  await page.locator('text=Place Order').click();
  await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
});
```

### Mock & Stub 深度示例

```typescript
// mock-stub.test.ts — 测试替身与行为验证
import { describe, it, expect, vi } from 'vitest';

interface PaymentGateway {
  charge(amount: number, token: string): Promise<{ id: string }>;
}

class OrderService {
  constructor(private gateway: PaymentGateway) {}

  async checkout(cart: { total: number }, token: string) {
    const receipt = await this.gateway.charge(cart.total, token);
    return { orderId: `ord-${receipt.id}` };
  }
}

describe('OrderService', () => {
  it('charges the correct amount', async () => {
    const stubGateway: PaymentGateway = {
      charge: vi.fn().mockResolvedValue({ id: 'tx-42' }),
    };

    const service = new OrderService(stubGateway);
    const result = await service.checkout({ total: 199 }, 'tok_visa');

    expect(stubGateway.charge).toHaveBeenCalledWith(199, 'tok_visa');
    expect(result.orderId).toBe('ord-tx-42');
  });
});
```

### 参数化测试与数据驱动

```typescript
// parameterized-tests.test.ts
import { describe, it, expect } from 'vitest';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

describe('isValidEmail', () => {
  it.each([
    ['alice@example.com', true],
    ['bob+tag@sub.domain.co.uk', true],
    ['not-an-email', false],
    ['@missing-local.org', false],
    ['missing-tld@domain', false],
  ])('validates "%s" as %s', (input, expected) => {
    expect(isValidEmail(input)).toBe(expected);
  });
});
```

### MSW（Mock Service Worker）API 模拟

```typescript
// msw-handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Alice',
      email: 'alice@example.com',
    });
  }),

  http.post('/api/orders', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ orderId: 'ord-123', ...body }, { status: 201 });
  }),
];

// vitest.setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './msw-handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 e2e-testing.test.ts
- 📄 e2e-testing.ts
- 📄 index.ts
- 📄 integration-testing.test.ts
- 📄 integration-testing.ts
- 📄 mock-stub.test.ts
- 📄 mock-stub.ts
- 📄 tdd-bdd.test.ts
- 📄 tdd-bdd.ts
- 📄 unit-test-patterns.test.ts
- 📄 unit-test-patterns.ts

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Vitest Docs | 文档 | [vitest.dev](https://vitest.dev/) |
| Testing Library | 文档 | [testing-library.com](https://testing-library.com/) |
| Playwright E2E | 文档 | [playwright.dev](https://playwright.dev/) |
| Jest Docs | 文档 | [jestjs.io/docs/getting-started](https://jestjs.io/docs/getting-started) |
| Test Patterns (xUnit) | 书籍 | [xunitpatterns.com](http://xunitpatterns.com/) |
| Martin Fowler — Test Pyramid | 文章 | [martinfowler.com/articles/practical-test-pyramid.html](https://martinfowler.com/articles/practical-test-pyramid.html) |
| Google Testing Blog | 博客 | [testing.googleblog.com](https://testing.googleblog.com/) |
| Cypress Documentation | 文档 | [docs.cypress.io](https://docs.cypress.io/) |
| Node.js Test Runner | 官方文档 | [nodejs.org/api/test.html](https://nodejs.org/api/test.html) |
| Mock Service Worker (MSW) | 文档 | [mswjs.io](https://mswjs.io/) |
| MSW Getting Started | 文档 | [mswjs.io/docs/getting-started](https://mswjs.io/docs/getting-started) |
| Kent C. Dodds — Testing JavaScript | 课程 | [testingjavascript.com](https://testingjavascript.com) |
| React Testing Library | 文档 | [testing-library.com/react](https://testing-library.com/docs/react-testing-library/intro/) |

---

*最后更新: 2026-04-29*
