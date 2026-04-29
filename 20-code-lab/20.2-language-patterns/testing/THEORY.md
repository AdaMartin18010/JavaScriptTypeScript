# 测试基础 — 理论基础

## 1. 测试金字塔

```
    /\
   /  \     E2E 测试（少而精）
  /____\
 /      \   集成测试（中等数量）
/________\
          单元测试（大量）
```

- **单元测试**: 测试单个函数/组件，快速、独立、可重复
- **集成测试**: 测试模块间交互，验证接口契约
- **E2E 测试**: 模拟用户操作，验证完整业务流程

## 2. 测试层级深度对比

| 维度 | 单元测试 (Unit) | 集成测试 (Integration) | E2E 测试 (End-to-End) |
|------|----------------|----------------------|----------------------|
| **测试范围** | 单一函数/类/组件 | 多个模块协作（DB、API、缓存） | 完整用户旅程（浏览器/移动端） |
| **执行速度** | < 10ms / 测试 | 10ms - 1s / 测试 | 秒级 - 分钟级 |
| **依赖隔离** | 完全隔离（Mock/Stub） | 部分真实依赖（测试数据库） | 真实环境或准生产环境 |
| **稳定性** | 极高（无外部依赖） | 中等（依赖状态管理） | 较低（网络、UI 变化敏感） |
| **定位问题** | 精确到代码行 | 模块接口边界 | 用户可见功能异常 |
| **维护成本** | 低 | 中等 | 高（选择器变更、流程变更） |
| **工具示例** | Vitest、Jest、Mocha | Vitest、Supertest、MSW | Playwright、Cypress、Selenium |
| **覆盖率目标** | > 80% | 核心流程覆盖 | 关键路径覆盖 |

> **金字塔原则**：底层单元测试数量应远大于上层 E2E 测试，比例建议约为 70% : 20% : 10%。

## 3. Vitest 测试代码示例

```typescript
// src/utils/cart.ts — 被测试模块
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export class ShoppingCart {
  private items: CartItem[] = [];

  add(item: CartItem): void {
    const existing = this.items.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.items.push({ ...item });
    }
  }

  remove(id: string): void {
    this.items = this.items.filter(i => i.id !== id);
  }

  get total(): number {
    return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  get count(): number {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  clear(): void {
    this.items = [];
  }
}

// src/utils/cart.test.ts — Vitest 单元测试
import { describe, it, expect, beforeEach } from 'vitest';
import { ShoppingCart } from './cart';

describe('ShoppingCart', () => {
  let cart: ShoppingCart;

  beforeEach(() => {
    cart = new ShoppingCart();
  });

  it('should add a new item', () => {
    cart.add({ id: '1', name: 'Apple', price: 2, quantity: 3 });
    expect(cart.count).toBe(3);
    expect(cart.total).toBe(6);
  });

  it('should increase quantity for existing item', () => {
    cart.add({ id: '1', name: 'Apple', price: 2, quantity: 1 });
    cart.add({ id: '1', name: 'Apple', price: 2, quantity: 2 });
    expect(cart.count).toBe(3);
    expect(cart.total).toBe(6);
  });

  it('should remove item by id', () => {
    cart.add({ id: '1', name: 'Apple', price: 2, quantity: 1 });
    cart.remove('1');
    expect(cart.count).toBe(0);
    expect(cart.total).toBe(0);
  });

  it('should clear all items', () => {
    cart.add({ id: '1', name: 'Apple', price: 2, quantity: 1 });
    cart.add({ id: '2', name: 'Banana', price: 1, quantity: 5 });
    cart.clear();
    expect(cart.count).toBe(0);
  });

  // 边界条件测试
  it('should handle empty cart total', () => {
    expect(cart.total).toBe(0);
  });

  it('should not mutate original item object', () => {
    const item = { id: '1', name: 'Apple', price: 2, quantity: 1 };
    cart.add(item);
    item.quantity = 999;
    expect(cart.count).toBe(1);
  });
});

// API 集成测试示例（使用 Vitest + 本地服务器）
import { describe, it, expect } from 'vitest';

describe('POST /api/orders', () => {
  it('should create order with valid payload', async () => {
    const res = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'p1', quantity: 2 }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({
      id: expect.any(String),
      productId: 'p1',
      quantity: 2,
    });
  });

  it('should reject invalid quantity', async () => {
    const res = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'p1', quantity: -1 }),
    });

    expect(res.status).toBe(400);
  });
});
```

Vitest 配置：

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // 或 'jsdom' 用于前端组件
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

## 4. TDD 与 BDD

### 测试驱动开发（TDD）

```
编写失败测试 → 编写最小实现 → 重构 → 重复
```

### 行为驱动开发（BDD）

- 用自然语言描述行为（Given-When-Then）
- 工具：Cucumber、Jest describe/it
- 促进开发、测试、产品三方沟通

## 5. 测试替身

| 类型 | 用途 | 示例 |
|------|------|------|
| **Dummy** | 填充参数 | 空对象 |
| **Fake** | 简化实现 | 内存数据库 |
| **Stub** | 预设返回值 | 模拟 API 响应 |
| **Mock** | 验证交互 | 断言函数被调用次数 |
| **Spy** | 记录调用 | 包装真实函数 |

## 6. 测试覆盖率

- **语句覆盖**: 每行代码至少执行一次
- **分支覆盖**: 每个 if/else 分支都执行
- **函数覆盖**: 每个函数都被调用
- **行覆盖**: 可执行行被覆盖的比例

注意：高覆盖率 ≠ 高质量测试。覆盖率的真正价值在于发现未测试的风险区域。

## 7. 与相邻模块的关系

- **28-testing-advanced**: 高级测试技术（模糊测试、契约测试）
- **09-real-world-examples**: 生产环境的测试策略
- **11-benchmarks**: 性能测试与基准测试

## 8. E2E 测试示例（Playwright）

```typescript
// tests/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('user can complete checkout', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await page.goto('/cart');
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.fill('[name="email"]', 'test@example.com');
  await page.getByRole('button', { name: 'Pay' }).click();
  await expect(page.locator('h1')).toHaveText('Order Confirmed');
});
```

## 9. Mock Service Worker 示例（MSW）

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/user/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Alice',
      role: 'admin',
    });
  }),

  http.post('/api/login', async ({ request }) => {
    const body = (await request.json()) as { email: string };
    if (body.email.endsWith('@example.com')) {
      return HttpResponse.json({ token: 'mock-jwt-token' });
    }
    return HttpResponse.json({ error: 'Invalid email' }, { status: 401 });
  }),
];
```

```typescript
// vitest.setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './src/mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 10. 属性驱动测试（fast-check）

```typescript
// src/utils/reverse.test.ts
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

describe('reverse', () => {
  it('should be involutive (reverse(reverse(x)) == x)', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        const reverse = (s: string) => [...s].reverse().join('');
        expect(reverse(reverse(str))).toBe(str);
      })
    );
  });

  it('should preserve length', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const reversed = [...arr].reverse();
        expect(reversed.length).toBe(arr.length);
      })
    );
  });
});
```

## 11. 快照测试与回归防护

```typescript
// src/components/Alert.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Alert } from './Alert';

describe('<Alert />', () => {
  it('renders correctly', () => {
    const { container } = render(<Alert type="error">Connection lost</Alert>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

## 参考链接

- [Vitest Documentation](https://vitest.dev/)
- [Testing Trophy — Kent C. Dodds](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Playwright Documentation](https://playwright.dev/)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [Google Testing Blog](https://testing.googleblog.com/)
- [Testing Library](https://testing-library.com/)
- [fast-check — Property-based testing](https://fast-check.dev/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Documentation](https://docs.cypress.io/)
- [Supertest — HTTP assertions](https://github.com/ladjs/supertest)
