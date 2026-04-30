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

### Snapshot Testing 快照测试

```typescript
import { describe, it, expect } from 'vitest';

function renderButton(props: { label: string; disabled?: boolean }) {
  return `<button ${props.disabled ? 'disabled ' : ''}class="btn">${props.label}</button>`;
}

describe('renderButton', () => {
  it('matches snapshot for default state', () => {
    expect(renderButton({ label: 'Submit' })).toMatchSnapshot();
  });
});
```

### Property-Based Testing 基于属性的测试

```typescript
import { describe, it } from 'vitest';
import * as fc from 'fast-check';

function add(a: number, b: number): number { return a + b; }

describe('add', () => {
  it('is commutative', () => {
    fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
      expect(add(a, b)).toBe(add(b, a));
    }));
  });
});
```

### React Testing Library 组件测试

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from './Counter';

describe('Counter', () => {
  it('increments count on click', () => {
    render(<Counter initial={0} />);
    const button = screen.getByRole('button', { name: /increment/i });
    fireEvent.click(button);
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});
```

### BDD 风格测试（Vitest + Gherkin 语义）

```typescript
// bdd-style.test.ts — 行为驱动描述
import { describe, it, expect } from 'vitest';
import { ShoppingCart } from './shopping-cart';

describe('Shopping Cart', () => {
  describe('Given an empty cart', () => {
    const cart = new ShoppingCart();

    it('When adding a product Then total equals product price', () => {
      cart.add({ id: 'p1', price: 100 });
      expect(cart.total()).toBe(100);
    });

    it('When adding multiple products Then total is sum of prices', () => {
      cart.add({ id: 'p1', price: 100 });
      cart.add({ id: 'p2', price: 200 });
      expect(cart.total()).toBe(300);
    });
  });

  describe('Given a cart with items', () => {
    const cart = new ShoppingCart();
    beforeEach(() => {
      cart.add({ id: 'p1', price: 100 });
    });

    it('When removing an item Then total decreases', () => {
      cart.remove('p1');
      expect(cart.total()).toBe(0);
    });
  });
});
```

### 测试覆盖率阈值配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      exclude: ['**/*.d.ts', '**/*.test.ts', '**/node_modules/**'],
    },
  },
});
```

### Node.js 原生 Test Runner

```typescript
// node-native-test.test.ts — Node.js 20+ 内置测试运行器
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sum } from './math';

describe('math', () => {
  it('sums two numbers', () => {
    assert.equal(sum(2, 3), 5);
  });

  it('throws on non-number input', () => {
    assert.throws(() => sum('a' as any, 1), TypeError);
  });
});
```

### 测试金字塔的代码化实践

```typescript
// 1. 单元测试（大量、快速、隔离）: 纯函数、工具类
// 2. 集成测试（服务边界、数据库、API）: 事务回滚、模块协作
// 3. E2E 测试（关键用户路径、少量）: 登录-下单-支付完整流程
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
| fast-check | 文档 | [fast-check.dev](https://fast-check.dev/) — 基于属性的测试库 |
| Vitest Snapshot Testing | 文档 | [vitest.dev/guide/snapshot.html](https://vitest.dev/guide/snapshot.html) — 快照测试官方文档 |
| Testing Library Queries | 文档 | [testing-library.com/docs/queries/about/](https://testing-library.com/docs/queries/about/) — 查询优先级与最佳实践 |
| Test Double | 文档 | [testdouble.com](https://testdouble.com/) — 测试替身最佳实践 |
| GitHub Actions CI | 文档 | [docs.github.com/en/actions](https://docs.github.com/en/actions) — 持续集成官方文档 |
| Vitest Coverage | 文档 | [vitest.dev/guide/coverage.html](https://vitest.dev/guide/coverage.html) — 覆盖率配置指南 |
| Node.js Test Runner Migration | 指南 | [nodejs.org/en/learn/test-runner/using-test-runner](https://nodejs.org/en/learn/test-runner/using-test-runner) |
| BDD Wikipedia | 百科 | [en.wikipedia.org/wiki/Behavior-driven_development](https://en.wikipedia.org/wiki/Behavior-driven_development) |
| TDD by Example (Kent Beck) | 书籍 | [amazon.com/Test-Driven-Development-Kent-Beck](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530) |

### Mocking ES Modules with `vi.mock`

```typescript
// math.ts
export const add = (a: number, b: number) => a + b;

// math.test.ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('./math', () => ({
  add: vi.fn().mockReturnValue(42),
}));

import { add } from './math';

describe('mocked module', () => {
  it('returns mocked value', () => {
    expect(add(1, 2)).toBe(42);
  });
});
```

### Accessibility Testing with jest-axe

```typescript
// a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from './Button';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 新增权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| Vitest Mocking Guide | 文档 | [vitest.dev/guide/mocking.html](https://vitest.dev/guide/mocking.html) |
| Jest Mock Functions | 文档 | [jestjs.io/docs/mock-functions](https://jestjs.io/docs/mock-functions) |
| axe-core Documentation | GitHub | [github.com/dequelabs/axe-core](https://github.com/dequelabs/axe-core) |
| Testing Library Query Priority | 文档 | [testing-library.com/docs/queries/about/#priority](https://testing-library.com/docs/queries/about/#priority) |
| Cypress Component Testing | 文档 | [docs.cypress.io/guides/component-testing/overview](https://docs.cypress.io/guides/component-testing/overview) |
| Storybook Interaction Tests | 文档 | [storybook.js.org/docs/writing-tests/interaction-testing](https://storybook.js.org/docs/writing-tests/interaction-testing) |

---

*最后更新: 2026-04-30*
