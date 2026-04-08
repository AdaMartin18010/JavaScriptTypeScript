# JavaScript/TypeScript 测试模式指南

本文档涵盖了前端开发中常用的10种测试模式，包括概念解释、TypeScript + Jest/Vitest/Playwright 代码示例以及最佳实践。

---

## 目录

- [JavaScript/TypeScript 测试模式指南](#javascripttypescript-测试模式指南)
  - [目录](#目录)
  - [1. AAA模式（Arrange-Act-Assert）](#1-aaa模式arrange-act-assert)
    - [概念解释](#概念解释)
    - [代码示例](#代码示例)
    - [进阶示例：复杂场景](#进阶示例复杂场景)
    - [最佳实践](#最佳实践)
  - [2. Given-When-Then（BDD风格）](#2-given-when-thenbdd风格)
    - [概念解释](#概念解释-1)
    - [代码示例](#代码示例-1)
    - [最佳实践](#最佳实践-1)
  - [3. 测试替身](#3-测试替身)
    - [概念解释](#概念解释-2)
    - [代码示例](#代码示例-2)
    - [最佳实践](#最佳实践-2)
  - [4. Page Object模式（E2E测试）](#4-page-object模式e2e测试)
    - [概念解释](#概念解释-3)
    - [代码示例](#代码示例-3)
    - [组件对象模式（Component Object Pattern）](#组件对象模式component-object-pattern)
    - [最佳实践](#最佳实践-3)
  - [5. 快照测试模式](#5-快照测试模式)
    - [概念解释](#概念解释-4)
    - [代码示例](#代码示例-4)
    - [结构化快照测试](#结构化快照测试)
    - [行内快照（Inline Snapshot）](#行内快照inline-snapshot)
    - [快照更新策略](#快照更新策略)
    - [最佳实践](#最佳实践-4)
  - [6. 参数化测试](#6-参数化测试)
    - [概念解释](#概念解释-5)
    - [代码示例](#代码示例-5)
    - [复杂参数化测试场景](#复杂参数化测试场景)
    - [使用 describe.each 组织测试](#使用-describeeach-组织测试)
    - [最佳实践](#最佳实践-5)
  - [7. 并行测试策略](#7-并行测试策略)
    - [概念解释](#概念解释-6)
    - [代码示例](#代码示例-6)
    - [并发测试模式](#并发测试模式)
    - [受控并发模式](#受控并发模式)
    - [测试隔离保证](#测试隔离保证)
    - [最佳实践](#最佳实践-6)
  - [8. 测试数据工厂模式](#8-测试数据工厂模式)
    - [概念解释](#概念解释-7)
    - [代码示例](#代码示例-7)
    - [最佳实践](#最佳实践-7)
  - [9. 契约测试模式](#9-契约测试模式)
    - [概念解释](#概念解释-8)
    - [代码示例](#代码示例-8)
    - [提供者验证](#提供者验证)
    - [OpenAPI 契约测试](#openapi-契约测试)
    - [最佳实践](#最佳实践-8)
  - [10. 视觉回归测试](#10-视觉回归测试)
    - [概念解释](#概念解释-9)
    - [代码示例](#代码示例-9)
    - [Storybook 视觉测试](#storybook-视觉测试)
    - [动态内容处理](#动态内容处理)
    - [最佳实践](#最佳实践-9)
  - [总结](#总结)

---

## 1. AAA模式（Arrange-Act-Assert）

### 概念解释

AAA模式是单元测试的基础结构，将测试分为三个清晰的阶段：

- **Arrange（准备）**：设置测试环境，初始化数据，创建被测对象
- **Act（执行）**：执行被测操作
- **Assert（断言）**：验证结果是否符合预期

这种清晰的结构使测试更易读、更易维护。

### 代码示例

```typescript
// calculator.ts
export class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }

  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error('Cannot divide by zero');
    }
    return a / b;
  }
}
```

```typescript
// calculator.test.ts
import { describe, it, expect } from 'vitest';
import { Calculator } from './calculator';

describe('Calculator', () => {
  it('should add two numbers correctly', () => {
    // Arrange
    const calculator = new Calculator();
    const a = 5;
    const b = 3;

    // Act
    const result = calculator.add(a, b);

    // Assert
    expect(result).toBe(8);
  });

  it('should throw error when dividing by zero', () => {
    // Arrange
    const calculator = new Calculator();
    const a = 10;
    const b = 0;

    // Act & Assert
    expect(() => calculator.divide(a, b)).toThrow('Cannot divide by zero');
  });
});
```

### 进阶示例：复杂场景

```typescript
// user-service.ts
interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export class UserService {
  constructor(private repository: UserRepository) {}

  async activateUser(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    const activatedUser = { ...user, isActive: true };
    await this.repository.save(activatedUser);

    return activatedUser;
  }
}
```

```typescript
// user-service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { UserService } from './user-service';

describe('UserService', () => {
  it('should activate an inactive user', async () => {
    // Arrange
    const mockUser = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      isActive: false
    };

    const mockRepository = {
      findById: vi.fn().mockResolvedValue(mockUser),
      save: vi.fn().mockResolvedValue(undefined)
    };

    const userService = new UserService(mockRepository);

    // Act
    const result = await userService.activateUser('user-123');

    // Assert
    expect(result.isActive).toBe(true);
    expect(mockRepository.findById).toHaveBeenCalledWith('user-123');
    expect(mockRepository.save).toHaveBeenCalledWith({
      ...mockUser,
      isActive: true
    });
  });
});
```

### 最佳实践

1. **空行分隔阶段**：在每个阶段之间添加空行，提高可读性
2. **保持测试简短**：每个测试只验证一个概念
3. **避免多个Act**：如果一个测试有多个Act，考虑拆分成多个测试
4. **清晰的命名**：测试名称应该描述行为，如 `should do something when condition`
5. **避免测试间依赖**：每个测试应该独立运行

---

## 2. Given-When-Then（BDD风格）

### 概念解释

Given-When-Then 是行为驱动开发（BDD）的核心模式，用业务语言描述测试：

- **Given**：设置前置条件（上下文）
- **When**：执行操作（触发事件）
- **Then**：验证结果（期望结果）

这种模式使测试用例更贴近业务需求，便于非技术人员理解。

### 代码示例

```typescript
// shopping-cart.ts
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export class ShoppingCart {
  private items: CartItem[] = [];

  addItem(item: CartItem): void {
    const existingItem = this.items.find(i => i.productId === item.productId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.items.push(item);
    }
  }

  removeItem(productId: string): void {
    this.items = this.items.filter(i => i.productId !== productId);
  }

  getTotal(): number {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  getItemCount(): number {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }
}
```

```typescript
// shopping-cart.test.ts
import { describe, it, expect } from 'vitest';
import { ShoppingCart } from './shopping-cart';

describe('ShoppingCart', () => {
  describe('Given an empty shopping cart', () => {
    it('Then total should be 0', () => {
      const cart = new ShoppingCart();
      expect(cart.getTotal()).toBe(0);
    });
  });

  describe('Given a cart with items', () => {
    it('When adding the same product Then quantities should combine', () => {
      const cart = new ShoppingCart();
      cart.addItem({ productId: 'p1', name: 'iPhone', price: 999, quantity: 1 });

      cart.addItem({ productId: 'p1', name: 'iPhone', price: 999, quantity: 2 });

      expect(cart.getItemCount()).toBe(3);
      expect(cart.getTotal()).toBe(2997);
    });
  });
});
```

### 最佳实践

1. **使用 describe 组织 Given 场景**：用 `describe('Given...')` 组织相关测试
2. **业务语言描述**：使用业务术语，避免技术细节
3. **协作工具**：与产品经理、测试人员共同编写 Gherkin 风格的场景
4. **单一职责**：每个测试一个 When，避免复杂的 When 组合

---

## 3. 测试替身

### 概念解释

测试替身（Test Doubles）用于替代真实依赖，包括五种类型：

| 类型 | 用途 | 行为 |
|------|------|------|
| **Dummy** | 填充参数 | 不使用 |
| **Fake** | 简化实现 | 有工作实现 |
| **Stub** | 控制输入 | 返回固定值 |
| **Spy** | 验证交互 | 记录调用 |
| **Mock** | 验证输出 | 预编程期望 |

### 代码示例

```typescript
// types.ts
interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

interface Logger {
  log(message: string): void;
}

interface PaymentGateway {
  processPayment(amount: number, currency: string): Promise<PaymentResult>;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
}
```

```typescript
// order-service.ts
export class OrderService {
  constructor(
    private paymentGateway: PaymentGateway,
    private emailService: EmailService,
    private logger: Logger
  ) {}

  async placeOrder(order: Order): Promise<OrderResult> {
    this.logger.log(`Processing order for ${order.customerEmail}`);

    const payment = await this.paymentGateway.processPayment(
      order.total,
      order.currency
    );

    if (payment.success) {
      await this.emailService.sendEmail(
        order.customerEmail,
        'Order Confirmed',
        `Your order #${payment.transactionId} has been confirmed.`
      );
      return { success: true, orderId: payment.transactionId };
    }

    return { success: false, error: 'Payment failed' };
  }
}
```

```typescript
// order-service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { OrderService } from './order-service';

describe('OrderService - Test Doubles', () => {
  // Dummy: 仅填充参数，不被使用
  it('should use dummy logger', async () => {
    const dummyLogger = { log: vi.fn() };
    const stubPaymentGateway = {
      processPayment: vi.fn().mockResolvedValue({
        success: true,
        transactionId: 'txn-123'
      })
    };
    const mockEmailService = {
      sendEmail: vi.fn().mockResolvedValue(undefined)
    };

    const service = new OrderService(
      stubPaymentGateway,
      mockEmailService,
      dummyLogger  // Dummy: 我们不会验证它的调用
    );

    await service.placeOrder({
      customerEmail: 'test@example.com',
      total: 100,
      currency: 'USD'
    });

    // 我们只验证关键行为，不关心 dummyLogger
    expect(stubPaymentGateway.processPayment).toHaveBeenCalled();
  });

  // Fake: 轻量级工作实现
  class FakePaymentGateway implements PaymentGateway {
    private transactions: Map<string, PaymentResult> = new Map();

    async processPayment(amount: number, currency: string): Promise<PaymentResult> {
      const txnId = `fake-txn-${Date.now()}`;
      const result = { success: amount > 0, transactionId: txnId };
      this.transactions.set(txnId, result);
      return result;
    }

    getTransaction(id: string): PaymentResult | undefined {
      return this.transactions.get(id);
    }
  }

  it('should work with fake payment gateway', async () => {
    const fakeGateway = new FakePaymentGateway();
    const mockEmailService = { sendEmail: vi.fn().mockResolvedValue(undefined) };
    const logger = { log: vi.fn() };

    const service = new OrderService(fakeGateway, mockEmailService, logger);

    const result = await service.placeOrder({
      customerEmail: 'test@example.com',
      total: 100,
      currency: 'USD'
    });

    expect(result.success).toBe(true);
    expect(fakeGateway.getTransaction(result.orderId)).toBeDefined();
  });

  // Stub: 控制输入，返回固定值
  it('should handle successful payment with stub', async () => {
    const stubGateway = {
      processPayment: vi.fn().mockResolvedValue({
        success: true,
        transactionId: 'stubbed-txn-123'
      })
    };
    const mockEmailService = { sendEmail: vi.fn().mockResolvedValue(undefined) };
    const logger = { log: vi.fn() };

    const service = new OrderService(stubGateway, mockEmailService, logger);

    const result = await service.placeOrder({
      customerEmail: 'test@example.com',
      total: 100,
      currency: 'USD'
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('stubbed-txn-123');
  });

  // Spy: 验证交互行为
  it('should spy on logger calls', async () => {
    const stubGateway = {
      processPayment: vi.fn().mockResolvedValue({
        success: true,
        transactionId: 'txn-123'
      })
    };
    const mockEmailService = { sendEmail: vi.fn().mockResolvedValue(undefined) };
    const spyLogger = { log: vi.fn() };

    const service = new OrderService(stubGateway, mockEmailService, spyLogger);

    await service.placeOrder({
      customerEmail: 'customer@example.com',
      total: 100,
      currency: 'USD'
    });

    // Spy: 验证 logger 被正确调用
    expect(spyLogger.log).toHaveBeenCalledTimes(1);
    expect(spyLogger.log).toHaveBeenCalledWith(
      'Processing order for customer@example.com'
    );
  });

  // Mock: 验证输出（行为验证）
  it('should send email on successful payment with mock', async () => {
    const stubGateway = {
      processPayment: vi.fn().mockResolvedValue({
        success: true,
        transactionId: 'txn-456'
      })
    };

    // Mock: 预编程期望
    const mockEmailService = {
      sendEmail: vi.fn().mockResolvedValue(undefined)
    };
    const logger = { log: vi.fn() };

    const service = new OrderService(stubGateway, mockEmailService, logger);

    await service.placeOrder({
      customerEmail: 'test@example.com',
      total: 100,
      currency: 'USD'
    });

    // Mock 验证：确保邮件被正确发送
    expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Order Confirmed',
      'Your order #txn-456 has been confirmed.'
    );
  });
});
```

### 最佳实践

1. **选择合适的替身**：
   - 不需要验证交互 → 使用 Stub
   - 需要验证调用次数/参数 → 使用 Mock
   - 需要简化实现 → 使用 Fake
   - 仅填充参数 → 使用 Dummy

2. **避免过度指定**：Mock 的期望要合理，不要验证无关紧要的细节

3. **保持测试独立**：每个测试应该控制自己的替身

4. **使用工厂函数**：为常用替身创建工厂函数，提高代码复用

---

## 4. Page Object模式（E2E测试）

### 概念解释

Page Object 模式将页面元素定位和业务操作封装到独立的类中，实现：

- **关注点分离**：测试逻辑与页面实现细节分离
- **可维护性**：页面变化只需修改一处
- **可读性**：测试代码更接近业务描述
- **可复用性**：页面操作可在多个测试中复用

### 代码示例

```typescript
// pages/base-page.ts
import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async waitForElement(locator: Locator, timeout = 5000): Promise<void> {
    await locator.waitFor({ timeout });
  }
}
```

```typescript
// pages/login-page.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
  // 元素定位器
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly welcomeMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('[data-testid="username"]');
    this.passwordInput = page.locator('[data-testid="password"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
  }

  // 页面操作
  async goto(): Promise<void> {
    await super.goto('/login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginAsAdmin(): Promise<void> {
    await this.login('admin', 'admin123');
  }

  // 断言助手
  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage).toHaveText(message);
  }

  async expectSuccessfulLogin(): Promise<void> {
    await expect(this.welcomeMessage).toBeVisible();
  }
}
```

```typescript
// pages/product-page.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export interface Product {
  id: string;
  name: string;
  price: number;
}

export class ProductPage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productList: Locator;
  readonly addToCartButton: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.searchButton = page.locator('[data-testid="search-button"]');
    this.productList = page.locator('[data-testid="product-list"]');
    this.addToCartButton = page.locator('[data-testid="add-to-cart"]');
    this.cartBadge = page.locator('[data-testid="cart-badge"]');
  }

  async searchProduct(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
  }

  async getProducts(): Promise<Product[]> {
    const products: Product[] = [];
    const items = await this.productList.locator('.product-item').all();

    for (const item of items) {
      const name = await item.locator('.product-name').textContent() || '';
      const priceText = await item.locator('.product-price').textContent() || '0';
      const id = await item.getAttribute('data-product-id') || '';

      products.push({
        id,
        name,
        price: parseFloat(priceText.replace('$', ''))
      });
    }

    return products;
  }

  async addProductToCart(productId: string): Promise<void> {
    const product = this.page.locator(`[data-product-id="${productId}"]`);
    await product.locator('[data-testid="add-to-cart"]').click();
  }

  async getCartItemCount(): Promise<number> {
    const text = await this.cartBadge.textContent() || '0';
    return parseInt(text, 10);
  }

  async expectProductCount(count: number): Promise<void> {
    await expect(this.productList.locator('.product-item')).toHaveCount(count);
  }
}
```

```typescript
// tests/e2e/shopping-flow.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { ProductPage } from '../pages/product-page';

test.describe('Shopping Flow E2E', () => {
  test('user can login and add product to cart', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    const productPage = new ProductPage(page);

    // Act - Login
    await loginPage.goto();
    await loginPage.login('testuser', 'password123');
    await loginPage.expectSuccessfulLogin();

    // Act - Search and add product
    await productPage.searchProduct('laptop');
    await productPage.expectProductCount(3);

    const products = await productPage.getProducts();
    await productPage.addProductToCart(products[0].id);

    // Assert
    const cartCount = await productPage.getCartItemCount();
    expect(cartCount).toBe(1);
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('wrong', 'wrong');

    await loginPage.expectErrorMessage('Invalid username or password');
  });
});
```

### 组件对象模式（Component Object Pattern）

```typescript
// components/cart.component.ts
import { Page, Locator, expect } from '@playwright/test';

export class CartComponent {
  readonly container: Locator;
  readonly items: Locator;
  readonly total: Locator;
  readonly checkoutButton: Locator;

  constructor(private page: Page) {
    this.container = page.locator('[data-testid="cart"]');
    this.items = this.container.locator('.cart-item');
    this.total = this.container.locator('.cart-total');
    this.checkoutButton = this.container.locator('[data-testid="checkout"]');
  }

  async getItemCount(): Promise<number> {
    return await this.items.count();
  }

  async removeItem(index: number): Promise<void> {
    await this.items.nth(index).locator('.remove-btn').click();
  }

  async getTotal(): Promise<number> {
    const text = await this.total.textContent() || '0';
    return parseFloat(text.replace('$', ''));
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}

// 在 Page Object 中使用组件
export class CheckoutPage extends BasePage {
  readonly cart: CartComponent;

  constructor(page: Page) {
    super(page);
    this.cart = new CartComponent(page);
  }
}
```

### 最佳实践

1. **使用 data-testid**：避免使用 CSS 类名或文本内容定位元素
2. **单一职责**：每个 Page Object 对应一个页面或功能模块
3. **封装细节**：测试不应直接操作定位器，应通过方法调用
4. **返回值**：方法可返回其他 Page Object 支持链式导航
5. **错误处理**：在 Page Object 中处理常见的等待和错误场景

---

## 5. 快照测试模式

### 概念解释

快照测试（Snapshot Testing）通过比较当前输出与存储的"快照"来检测意外变更：

- **适用场景**：UI 组件、复杂数据结构、API 响应
- **优势**：快速检测回归，减少断言代码
- **风险**：过度依赖可能导致忽略真正的变更

### 代码示例

```typescript
// components/user-profile.tsx
import React from 'react';

interface UserProfileProps {
  user: {
    name: string;
    email: string;
    avatar: string;
    role: 'admin' | 'user' | 'guest';
  };
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <div className="user-profile" data-testid="user-profile">
      <img src={user.avatar} alt={user.name} className="avatar" />
      <div className="user-info">
        <h2 className="user-name">{user.name}</h2>
        <p className="user-email">{user.email}</p>
        <span className={`role-badge role-${user.role}`}>
          {user.role.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
```

```typescript
// components/__tests__/user-profile.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { UserProfile } from '../user-profile';

describe('UserProfile Snapshot Tests', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg',
    role: 'admin' as const
  };

  it('should match snapshot for admin user', () => {
    const { container } = render(<UserProfile user={mockUser} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot for regular user', () => {
    const user = { ...mockUser, role: 'user' as const };
    const { container } = render(<UserProfile user={user} />);
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot for guest user', () => {
    const user = { ...mockUser, role: 'guest' as const };
    const { asFragment } = render(<UserProfile user={user} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
```

### 结构化快照测试

```typescript
// utils/data-transformer.ts
interface RawData {
  id: number;
  first_name: string;
  last_name: string;
  created_at: string;
}

interface TransformedUser {
  id: string;
  fullName: string;
  createdAt: Date;
}

export function transformUser(data: RawData): TransformedUser {
  return {
    id: `user_${data.id}`,
    fullName: `${data.first_name} ${data.last_name}`,
    createdAt: new Date(data.created_at)
  };
}
```

```typescript
// utils/__tests__/data-transformer.test.ts
import { describe, it, expect } from 'vitest';
import { transformUser } from '../data-transformer';

describe('Data Transformer Snapshots', () => {
  it('should transform user data correctly', () => {
    const rawData = {
      id: 123,
      first_name: 'Jane',
      last_name: 'Smith',
      created_at: '2024-01-15T10:30:00Z'
    };

    const result = transformUser(rawData);

    // 结构化快照：只比较特定属性
    expect(result).toMatchSnapshot({
      id: expect.any(String),
      fullName: 'Jane Smith',
      createdAt: expect.any(Date)
    });
  });
});
```

### 行内快照（Inline Snapshot）

```typescript
// api/response-formatter.ts
export function formatApiResponse<T>(data: T, success = true) {
  return {
    success,
    data,
    timestamp: new Date().toISOString(),
    version: 'v1'
  };
}

// api/__tests__/response-formatter.test.ts
describe('API Response Formatter', () => {
  it('should format success response', () => {
    const result = formatApiResponse({ users: [] });

    // 行内快照：结果直接写入测试文件
    expect(result).toMatchInlineSnapshot(
      {
        timestamp: expect.any(String)
      },
      `
      {
        "data": {
          "users": [],
        },
        "success": true,
        "timestamp": Any<String>,
        "version": "v1",
      }
    `
    );
  });
});
```

### 快照更新策略

```typescript
// jest.config.js or vitest.config.ts
export default {
  test: {
    // 快照格式配置
    snapshotFormat: {
      escapeString: true,
      printBasicPrototype: true
    },
    // 快照序列化器
    snapshotSerializers: ['@emotion/jest/serializer']
  }
};
```

### 最佳实践

1. **谨慎使用**：快照测试适合稳定、复杂的输出，不适合频繁变化的 UI
2. **审查变更**：使用 `-u` 更新快照后，务必审查 diff
3. **结合断言**：配合具体断言使用，不要仅依赖快照
4. **结构化快照**：使用属性匹配器处理动态值（时间戳、随机 ID）
5. **快照位置**：大型快照使用外部文件，小型快照使用行内快照
6. **团队协作**：将快照纳入代码审查流程

---

## 6. 参数化测试

### 概念解释

参数化测试（Parameterized Tests）使用多组数据运行同一测试逻辑：

- **优势**：减少重复代码，提高覆盖率，便于添加边界用例
- **适用场景**：边界值测试、等价类测试、多语言支持测试

### 代码示例

```typescript
// validators/password-validator.ts
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return { valid: errors.length === 0, errors };
}
```

```typescript
// validators/__tests__/password-validator.test.ts
import { describe, it, expect } from 'vitest';
import { validatePassword } from '../password-validator';

describe('Password Validator - Parameterized Tests', () => {
  // 基础参数化测试
  describe('valid passwords', () => {
    it.each([
      ['ValidPass1!'],
      ['MyP@ssw0rd'],
      ['C0mpl3x!Pass'],
      ['A1b2C3d4!@#']
    ])('should accept valid password: %s', (password) => {
      const result = validatePassword(password);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // 带描述的参数化测试
  describe('invalid passwords', () => {
    it.each([
      ['short1!', 'too short'],
      ['nouppercase123!', 'missing uppercase'],
      ['NOLOWERCASE123!', 'missing lowercase'],
      ['NoDigits!@#', 'missing digits'],
      ['NoSpecial123', 'missing special character']
    ])('should reject password "%s" (%s)', (password, description) => {
      const result = validatePassword(password);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  // 对象格式的参数化测试
  describe('specific error messages', () => {
    it.each([
      {
        password: 'short1!',
        expectedErrors: ['Password must be at least 8 characters']
      },
      {
        password: 'lowercase123!',
        expectedErrors: ['Password must contain at least one uppercase letter']
      },
      {
        password: 'UPPERCASE123!',
        expectedErrors: ['Password must contain at least one lowercase letter']
      },
      {
        password: 'Short1!',
        expectedErrors: [
          'Password must be at least 8 characters',
          'Password must contain at least one special character'
        ]
      }
    ])('should return correct errors for $password', ({ password, expectedErrors }) => {
      const result = validatePassword(password);
      expect(result.errors).toEqual(expect.arrayContaining(expectedErrors));
    });
  });
});
```

### 复杂参数化测试场景

```typescript
// utils/price-calculator.ts
export interface DiscountRule {
  threshold: number;
  percentage: number;
}

export function calculatePrice(
  basePrice: number,
  quantity: number,
  discountRules: DiscountRule[]
): { unitPrice: number; totalPrice: number; discountApplied: number } {
  const applicableDiscount = discountRules
    .filter(rule => quantity >= rule.threshold)
    .sort((a, b) => b.percentage - a.percentage)[0];

  const discountRate = applicableDiscount?.percentage ?? 0;
  const unitPrice = basePrice * (1 - discountRate);
  const totalPrice = unitPrice * quantity;

  return {
    unitPrice,
    totalPrice,
    discountApplied: discountRate
  };
}
```

```typescript
// utils/__tests__/price-calculator.test.ts
describe('Price Calculator', () => {
  const discountRules: DiscountRule[] = [
    { threshold: 10, percentage: 0.1 },
    { threshold: 50, percentage: 0.2 },
    { threshold: 100, percentage: 0.3 }
  ];

  // 使用 test.each 进行表格驱动测试
  it.each`
    basePrice | quantity | expectedDiscount | expectedTotal | description
    ${100}    | ${1}     | ${0}             | ${100}        | ${'no discount for single item'}
    ${100}    | ${10}    | ${0.1}           | ${900}        | ${'10% discount for 10 items'}
    ${100}    | ${50}    | ${0.2}           | ${4000}       | ${'20% discount for 50 items'}
    ${100}    | ${100}   | ${0.3}           | ${7000}       | ${'30% discount for 100 items'}
    ${50}     | ${25}    | ${0.1}           | ${1125}       | ${'10% discount applies for 25 items'}
  `('$description', ({ basePrice, quantity, expectedDiscount, expectedTotal }) => {
    const result = calculatePrice(basePrice, quantity, discountRules);

    expect(result.discountApplied).toBe(expectedDiscount);
    expect(result.totalPrice).toBe(expectedTotal);
  });
});
```

### 使用 describe.each 组织测试

```typescript
// formatters/currency-formatter.ts
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}

// formatters/__tests__/currency-formatter.test.ts
describe.each([
  { locale: 'en-US', currency: 'USD', amount: 1234.56, expected: '$1,234.56' },
  { locale: 'en-GB', currency: 'GBP', amount: 1234.56, expected: '£1,234.56' },
  { locale: 'de-DE', currency: 'EUR', amount: 1234.56, expected: '1.234,56 €' },
  { locale: 'ja-JP', currency: 'JPY', amount: 1234, expected: '￥1,234' },
  { locale: 'zh-CN', currency: 'CNY', amount: 1234.56, expected: '¥1,234.56' }
])('Currency formatting for $locale', ({ locale, currency, amount, expected }) => {
  it(`should format ${currency} correctly`, () => {
    const result = formatCurrency(amount, currency, locale);
    expect(result).toBe(expected);
  });
});
```

### 最佳实践

1. **描述性命名**：使用占位符让测试名称具有描述性
2. **边界值优先**：优先测试边界条件和边界值
3. **组合测试**：使用对象格式处理多个参数
4. **避免过多用例**：参数化测试不应替代真正的单元测试
5. **独立用例**：每个参数组合应该独立运行，互不干扰

---

## 7. 并行测试策略

### 概念解释

并行测试通过同时运行多个测试来提高执行速度：

- **文件级并行**：不同测试文件并行运行
- **工作线程**：使用多个工作进程/线程
- **测试隔离**：确保测试之间无共享状态

### 代码示例

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 并行配置
    pool: 'threads',        // 使用线程池: 'threads' | 'forks' | 'vmThreads'
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,      // 最大线程数
        minThreads: 1,      // 最小线程数
        useAtomics: true    // 使用原子操作同步
      }
    },

    // 文件级并行
    fileParallelism: true,

    // 全局设置
    globals: true,
    environment: 'jsdom'
  }
});
```

```typescript
// jest.config.js
module.exports = {
  // 并行工作进程
  maxWorkers: '50%',        // 使用50%的CPU核心
  // maxWorkers: 4,         // 固定工作进程数

  // 并行测试文件模式
  workerIdleMemoryLimit: '512MB',  // 防止内存泄漏

  // 测试隔离
  resetMocks: true,
  restoreMocks: true,
  clearMocks: true
};
```

### 并发测试模式

```typescript
// services/api-client.ts
export class ApiClient {
  async fetchUser(id: string): Promise<User> {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }
    return response.json();
  }

  async fetchOrders(userId: string): Promise<Order[]> {
    const response = await fetch(`/api/users/${userId}/orders`);
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status}`);
    }
    return response.json();
  }
}

interface User {
  id: string;
  name: string;
}

interface Order {
  id: string;
  total: number;
}
```

```typescript
// services/__tests__/api-client.concurrent.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../api-client';

// 并发测试文件命名约定: *.concurrent.test.ts
describe.concurrent('ApiClient - Concurrent Tests', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient();
    global.fetch = vi.fn();
  });

  // 使用 describe.concurrent 让测试并发执行
  it.concurrent('should fetch user successfully', async () => {
    const mockUser = { id: '1', name: 'John' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    } as Response);

    const result = await client.fetchUser('1');
    expect(result).toEqual(mockUser);
  });

  it.concurrent('should fetch orders successfully', async () => {
    const mockOrders = [{ id: 'o1', total: 100 }];
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders
    } as Response);

    const result = await client.fetchOrders('1');
    expect(result).toEqual(mockOrders);
  });

  it.concurrent('should handle user fetch error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404
    } as Response);

    await expect(client.fetchUser('999')).rejects.toThrow('Failed to fetch user');
  });

  it.concurrent('should handle orders fetch error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500
    } as Response);

    await expect(client.fetchOrders('1')).rejects.toThrow('Failed to fetch orders');
  });
});
```

### 受控并发模式

```typescript
// utils/__tests__/data-processor.sequential.test.ts
import { describe, it, expect } from 'vitest';

describe('Data Processor', () => {
  // 串行测试：使用 describe.sequential
  describe.sequential('sequential operations', () => {
    const sharedState: string[] = [];

    it('should add first item', () => {
      sharedState.push('first');
      expect(sharedState).toHaveLength(1);
    });

    it('should add second item (depends on first)', () => {
      sharedState.push('second');
      expect(sharedState).toHaveLength(2);
      expect(sharedState[0]).toBe('first');
    });
  });

  // 使用 test.sequential 标记单个串行测试
  it.sequential('must run after previous tests', () => {
    // 这个测试会在同级的其他测试完成后执行
  });
});
```

### 测试隔离保证

```typescript
// setup.ts - 全局测试隔离设置
import { beforeEach, afterEach, vi } from 'vitest';

// 每个测试前的清理
beforeEach(() => {
  // 清除所有 mock
  vi.clearAllMocks();

  // 重置模块缓存（防止状态泄漏）
  vi.resetModules();

  // 清理 localStorage/sessionStorage
  localStorage.clear();
  sessionStorage.clear();
});

// 每个测试后的清理
afterEach(() => {
  // 清理 DOM
  document.body.innerHTML = '';

  // 恢复所有被 spy 的方法
  vi.restoreAllMocks();
});
```

### 最佳实践

1. **确保测试隔离**：
   - 避免测试间共享状态
   - 使用 `beforeEach` 重置环境
   - 不要依赖测试执行顺序

2. **合理使用并发**：
   - CPU 密集型测试使用 `forks` 池
   - I/O 密集型测试使用 `threads` 池
   - 需要共享内存的测试保持串行

3. **监控资源使用**：
   - 设置内存限制防止 OOM
   - 使用 `--reporter=verbose` 查看执行时间

4. **文件命名约定**：
   - `.concurrent.test.ts` - 可安全并行
   - `.sequential.test.ts` - 必须串行

---

## 8. 测试数据工厂模式

### 概念解释

测试数据工厂模式使用工厂函数或类来生成测试数据：

- **优势**：
  - 减少重复代码
  - 易于维护测试数据
  - 支持数据变化（覆盖默认值）
  - 生成真实感数据

- **常见实现**：
  - Object Mother：预定义对象集合
  - Builder 模式：链式构建对象
  - Factory 函数：简单工厂方法

### 代码示例

```typescript
// factories/types.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  isActive: boolean;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  avatar: string;
  bio: string;
  website: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  totalAmount: number;
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}
```

```typescript
// factories/user-factory.ts
import { faker } from '@faker-js/faker';
import type { User, UserProfile } from './types';

// Builder 模式实现
export class UserBuilder {
  private user: Partial<User> = {};

  constructor() {
    this.withDefaults();
  }

  private withDefaults(): this {
    this.user = {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      age: faker.number.int({ min: 18, max: 80 }),
      isActive: true,
      role: 'user',
      createdAt: faker.date.past()
    };
    return this;
  }

  withId(id: string): this {
    this.user.id = id;
    return this;
  }

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  withName(firstName: string, lastName: string): this {
    this.user.firstName = firstName;
    this.user.lastName = lastName;
    return this;
  }

  withRole(role: User['role']): this {
    this.user.role = role;
    return this;
  }

  inactive(): this {
    this.user.isActive = false;
    return this;
  }

  withProfile(profile: Partial<UserProfile>): this {
    this.user.profile = {
      avatar: faker.image.avatar(),
      bio: faker.lorem.sentence(),
      website: faker.internet.url(),
      ...profile
    };
    return this;
  }

  aged(age: number): this {
    this.user.age = age;
    return this;
  }

  build(): User {
    return this.user as User;
  }

  buildMany(count: number): User[] {
    return Array.from({ length: count }, () => new UserBuilder().build());
  }
}

// 工厂函数快捷方式
export const userFactory = {
  create: (overrides: Partial<User> = {}): User => {
    return new UserBuilder()
      .withDefaults()
      .build();
  },

  admin: (): User => {
    return new UserBuilder()
      .withRole('admin')
      .build();
  },

  guest: (): User => {
    return new UserBuilder()
      .withRole('guest')
      .inactive()
      .build();
  },

  createMany: (count: number, overrides: Partial<User> = {}): User[] => {
    return Array.from({ length: count }, () => userFactory.create(overrides));
  }
};
```

```typescript
// factories/order-factory.ts
import { faker } from '@faker-js/faker';
import type { Order, OrderItem, User } from './types';
import { UserBuilder } from './user-factory';

export class OrderBuilder {
  private order: Partial<Order> = {};
  private items: OrderItem[] = [];

  constructor() {
    this.withDefaults();
  }

  private withDefaults(): this {
    this.order = {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      status: 'pending',
      totalAmount: 0,
      createdAt: faker.date.recent()
    };
    return this;
  }

  forUser(user: User | string): this {
    this.order.userId = typeof user === 'string' ? user : user.id;
    return this;
  }

  withItem(item: Partial<OrderItem>): this {
    const newItem: OrderItem = {
      productId: faker.string.uuid(),
      productName: faker.commerce.productName(),
      quantity: faker.number.int({ min: 1, max: 5 }),
      unitPrice: parseFloat(faker.commerce.price()),
      ...item
    };
    this.items.push(newItem);
    this.recalculateTotal();
    return this;
  }

  withItems(count: number): this {
    for (let i = 0; i < count; i++) {
      this.withItem({});
    }
    return this;
  }

  withStatus(status: Order['status']): this {
    this.order.status = status;
    return this;
  }

  withTotal(amount: number): this {
    this.order.totalAmount = amount;
    return this;
  }

  confirmed(): this {
    return this.withStatus('confirmed');
  }

  shipped(): this {
    return this.withStatus('shipped');
  }

  delivered(): this {
    return this.withStatus('delivered');
  }

  private recalculateTotal(): void {
    this.order.totalAmount = this.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
  }

  build(): Order {
    return {
      ...this.order,
      items: [...this.items]
    } as Order;
  }
}

// 关联工厂：创建带订单的用户
export async function createUserWithOrders(
  orderCount: number = 1
): Promise<{ user: User; orders: Order[] }> {
  const user = new UserBuilder().build();
  const orders = Array.from({ length: orderCount }, () =>
    new OrderBuilder().forUser(user).withItems(2).confirmed().build()
  );

  return { user, orders };
}
```

```typescript
// factories/__tests__/user-service.test.ts
import { describe, it, expect } from 'vitest';
import { UserBuilder, userFactory } from '../user-factory';
import { OrderBuilder, createUserWithOrders } from '../order-factory';

describe('UserService with Factories', () => {
  it('should process admin user correctly', () => {
    // 使用 Builder 模式
    const admin = new UserBuilder()
      .withEmail('admin@company.com')
      .withName('Admin', 'User')
      .withRole('admin')
      .withProfile({ bio: 'System Administrator' })
      .build();

    expect(admin.role).toBe('admin');
    expect(admin.email).toBe('admin@company.com');
  });

  it('should handle multiple guest users', () => {
    // 使用工厂函数批量创建
    const guests = userFactory.createMany(5);

    expect(guests).toHaveLength(5);
    guests.forEach(guest => {
      expect(guest.id).toBeDefined();
      expect(guest.email).toBeDefined();
    });
  });

  it('should create order with specific items', () => {
    const order = new OrderBuilder()
      .withItem({ productName: 'iPhone 15', quantity: 1, unitPrice: 999 })
      .withItem({ productName: 'AirPods', quantity: 2, unitPrice: 199 })
      .confirmed()
      .build();

    expect(order.items).toHaveLength(2);
    expect(order.totalAmount).toBe(1397);
    expect(order.status).toBe('confirmed');
  });

  it('should create user with related orders', async () => {
    const { user, orders } = await createUserWithOrders(3);

    expect(orders).toHaveLength(3);
    orders.forEach(order => {
      expect(order.userId).toBe(user.id);
      expect(order.status).toBe('confirmed');
    });
  });
});
```

### 最佳实践

1. **使用 Builder 模式**：当对象有多个可选属性时
2. **合理默认值**：使用 faker 生成真实感数据
3. **工厂组合**：创建关联对象的组合工厂
4. **类型安全**：保持 TypeScript 类型完整
5. **文档化**：为工厂方法添加 JSDoc 注释

---

## 9. 契约测试模式

### 概念解释

契约测试验证服务之间的接口契约：

- **消费者驱动契约（CDC）**：消费者定义期望的契约
- **提供者验证**：提供者验证是否满足契约
- **工具**：Pact 是最流行的契约测试框架

### 代码示例

```typescript
// consumers/user-api-consumer.ts
export interface UserApiConsumer {
  getUser(id: string): Promise<User>;
  createUser(user: CreateUserRequest): Promise<User>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export class HttpUserApiConsumer implements UserApiConsumer {
  constructor(private baseUrl: string) {}

  async getUser(id: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to get user: ${response.status}`);
    }
    return response.json();
  }

  async createUser(user: CreateUserRequest): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.status}`);
    }
    return response.json();
  }
}
```

```typescript
// consumers/__tests__/user-api.pact.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Pact } from '@pact-foundation/pact';
import path from 'path';
import { HttpUserApiConsumer } from '../user-api-consumer';

const provider = new Pact({
  consumer: 'UserFrontend',
  provider: 'UserApi',
  port: 1234,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'warn'
});

describe('User API Consumer Contract', () => {
  beforeAll(async () => {
    await provider.setup();
  });

  afterAll(async () => {
    await provider.finalize();
  });

  afterEach(async () => {
    await provider.verify();
  });

  it('should get user by id', async () => {
    // 定义契约期望
    await provider.addInteraction({
      state: 'user with id 123 exists',
      uponReceiving: 'a request to get user 123',
      withRequest: {
        method: 'GET',
        path: '/users/123',
        headers: { Accept: 'application/json' }
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: provider.given('123'),
          name: provider.given('John Doe'),
          email: provider.given('john@example.com'),
          createdAt: provider.given('2024-01-15T10:30:00Z')
        }
      }
    });

    // 执行消费者测试
    const api = new HttpUserApiConsumer(provider.mockService.baseUrl);
    const user = await api.getUser('123');

    expect(user).toMatchObject({
      id: '123',
      name: 'John Doe',
      email: 'john@example.com'
    });
  });

  it('should create a new user', async () => {
    await provider.addInteraction({
      state: 'ready to create user',
      uponReceiving: 'a request to create a new user',
      withRequest: {
        method: 'POST',
        path: '/users',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: {
          name: 'Jane Smith',
          email: 'jane@example.com'
        }
      },
      willRespondWith: {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: provider.like('uuid-123'),
          name: provider.given('Jane Smith'),
          email: provider.given('jane@example.com'),
          createdAt: provider.like('2024-01-15T10:30:00Z')
        }
      }
    });

    const api = new HttpUserApiConsumer(provider.mockService.baseUrl);
    const user = await api.createUser({
      name: 'Jane Smith',
      email: 'jane@example.com'
    });

    expect(user.name).toBe('Jane Smith');
    expect(user.email).toBe('jane@example.com');
    expect(user.id).toBeDefined();
  });

  it('should return 404 for non-existent user', async () => {
    await provider.addInteraction({
      state: 'user with id 999 does not exist',
      uponReceiving: 'a request for non-existent user',
      withRequest: {
        method: 'GET',
        path: '/users/999'
      },
      willRespondWith: {
        status: 404,
        body: {
          error: provider.given('User not found')
        }
      }
    });

    const api = new HttpUserApiConsumer(provider.mockService.baseUrl);

    await expect(api.getUser('999')).rejects.toThrow('Failed to get user: 404');
  });
});
```

### 提供者验证

```typescript
// providers/__tests__/user-api.provider.test.ts
import { describe, it, beforeAll, afterAll } from 'vitest';
import { Verifier } from '@pact-foundation/pact';
import path from 'path';
import { startServer, stopServer } from '../server';

describe('User API Provider Verification', () => {
  let serverUrl: string;

  beforeAll(async () => {
    serverUrl = await startServer(3001);
  });

  afterAll(async () => {
    await stopServer();
  });

  it('should validate the expectations of UserFrontend', async () => {
    const verifier = new Verifier({
      provider: 'UserApi',
      providerBaseUrl: serverUrl,
      pactUrls: [
        path.resolve(process.cwd(), 'pacts', 'userfrontend-userapi.json')
      ],

      // 状态设置
      stateHandlers: {
        'user with id 123 exists': async () => {
          // 在数据库中创建测试用户
          await seedUser({ id: '123', name: 'John Doe', email: 'john@example.com' });
        },
        'user with id 999 does not exist': async () => {
          // 确保用户不存在
          await deleteUser('999');
        },
        'ready to create user': async () => {
          // 清理可能影响测试的数据
          await cleanupTestUsers();
        }
      },

      // 发布验证结果到 Pact Broker
      publishVerificationResult: process.env.CI === 'true',
      providerVersionBranch: process.env.GIT_BRANCH,
      providerVersion: process.env.GIT_COMMIT
    });

    const output = await verifier.verify();
    console.log('Pact verification complete:', output);
  });
});
```

### OpenAPI 契约测试

```typescript
// contracts/openapi-validator.ts
import { validate } from 'openapi-schema-validator';
import { OpenAPIV3 } from 'openapi-types';

export function validateAgainstOpenAPI(
  response: unknown,
  schema: OpenAPIV3.SchemaObject
): boolean {
  // 验证响应是否符合 OpenAPI Schema
  const validator = new validate.OpenAPISchemaValidator({
    version: '3.0.0'
  });

  const result = validator.validate(schema);
  return result.errors.length === 0;
}

// 使用 Dredd 进行 API 契约测试
import { Dredd } from 'dredd';

export async function runApiContractTests(openapiPath: string, apiUrl: string) {
  const dredd = new Dredd({
    blueprintPath: openapiPath,
    endpoint: apiUrl,
    options: {
      'dry-run': false,
      reporter: 'spec'
    }
  });

  return new Promise((resolve, reject) => {
    dredd.run((err, stats) => {
      if (err) {
        reject(err);
      } else if (stats.failures > 0) {
        reject(new Error(`API contract test failed: ${stats.failures} failures`));
      } else {
        resolve(stats);
      }
    });
  });
}
```

### 最佳实践

1. **消费者优先**：先写消费者测试，再让提供者验证
2. **独立运行**：契约测试应该能在 CI/CD 中独立运行
3. **版本管理**：使用 Pact Broker 管理契约版本
4. **状态管理**：正确使用 `state` 设置测试前置条件
5. **契约范围**：只测试公共接口，不测试内部实现

---

## 10. 视觉回归测试

### 概念解释

视觉回归测试通过比较 UI 截图来检测意外的视觉变化：

- **工具选择**：
  - **Playwright**：内置截图和比较功能
  - **Storybook + Chromatic**：组件级视觉测试
  - **Percy**：云端视觉测试平台
  - **Loki**：基于 Storybook 的本地测试

- **测试策略**：
  - 全页面截图 vs 组件截图
  - 跨浏览器/跨设备测试
  - 动画和动态内容处理

### 代码示例

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 720 }
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { browserName: 'chromium' }
    },
    {
      name: 'Mobile Safari',
      use: {
        browserName: 'webkit',
        viewport: { width: 375, height: 812 }
      }
    }
  ]
});
```

```typescript
// e2e/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 禁用动画以获得一致的截图
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
        }
      `
    });
  });

  test('homepage should match screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 全页截图比较
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixels: 100  // 允许的像素差异阈值
    });
  });

  test('login form should match screenshot', async ({ page }) => {
    await page.goto('/login');

    // 等待特定元素
    await page.waitForSelector('[data-testid="login-form"]');

    // 元素级截图
    const loginForm = page.locator('[data-testid="login-form"]');
    await expect(loginForm).toHaveScreenshot('login-form.png', {
      mask: [page.locator('[data-testid="captcha"]')]  // 遮罩动态内容
    });
  });

  test('product card hover state', async ({ page }) => {
    await page.goto('/products');

    const firstCard = page.locator('.product-card').first();
    await firstCard.hover();

    // 添加短暂等待确保悬停效果完成
    await page.waitForTimeout(100);

    await expect(firstCard).toHaveScreenshot('product-card-hover.png');
  });

  test('responsive layout - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true
    });
  });
});
```

### Storybook 视觉测试

```typescript
// components/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Components/Button',
  parameters: {
    chromatic: {
      disableSnapshot: false,
      delay: 100  // 等待动画完成
    }
  }
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click me'
  }
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Click me'
  }
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...'
  }
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button disabled>Disabled</Button>
      <Button loading>Loading</Button>
    </div>
  ),
  parameters: {
    chromatic: {
      viewports: [320, 768, 1200]
    }
  }
};
```

```typescript
// .storybook/test-runner.ts
import type { TestRunnerConfig } from '@storybook/test-runner';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

const config: TestRunnerConfig = {
  async preRender(page) {
    // 禁用所有动画
    await page.addStyleTag({
      content: `
        * {
          animation: none !important;
          transition: none !important;
        }
      `
    });
  },

  async postRender(page, context) {
    // 视觉回归测试
    const image = await page.screenshot();

    expect.extend({ toMatchImageSnapshot });
    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: './__snapshots__',
      customSnapshotIdentifier: context.id
    });
  }
};

export default config;
```

### 动态内容处理

```typescript
// e2e/utils/visual-helpers.ts
import { Page, Locator } from '@playwright/test';

export async function maskDynamicContent(
  page: Page,
  selectors: string[]
): Promise<void> {
  // 用统一颜色遮罩动态内容
  for (const selector of selectors) {
    await page.evaluate((sel) => {
      const elements = document.querySelectorAll(sel);
      elements.forEach(el => {
        (el as HTMLElement).style.backgroundColor = '#cccccc';
        (el as HTMLElement).style.color = '#cccccc';
        (el as HTMLElement).textContent = 'masked';
      });
    }, selector);
  }
}

export async function waitForStableUI(
  page: Page,
  options: { timeout?: number; pollInterval?: number } = {}
): Promise<void> {
  const { timeout = 5000, pollInterval = 100 } = options;
  const startTime = Date.now();
  let lastHTML = '';

  while (Date.now() - startTime < timeout) {
    const currentHTML = await page.content();
    if (currentHTML === lastHTML) {
      return; // UI 已稳定
    }
    lastHTML = currentHTML;
    await page.waitForTimeout(pollInterval);
  }

  throw new Error('UI did not stabilize within timeout');
}

// 使用示例
export async function takeStableScreenshot(
  page: Page,
  selector: string
): Promise<Buffer> {
  await waitForStableUI(page);

  await maskDynamicContent(page, [
    '[data-testid="timestamp"]',
    '[data-testid="random-id"]',
    '.loading-spinner'
  ]);

  const element = page.locator(selector);
  return await element.screenshot();
}
```

### 最佳实践

1. **稳定环境**：
   - 使用一致的浏览器版本
   - 固定视口大小
   - 禁用动画和过渡效果

2. **处理动态内容**：
   - 使用 `mask` 遮罩日期、随机数等
   - 设置等待条件确保内容稳定
   - 使用数据属性标记测试元素

3. **阈值设置**：
   - 全页截图：设置合理的 `maxDiffPixels`
   - 组件截图：使用百分比阈值
   - 考虑抗锯齿造成的像素差异

4. **CI/CD 集成**：
   - 自动接受基线截图需谨慎
   - 人工审查视觉变更
   - 存储截图在版本控制或外部存储

5. **维护策略**：
   - 定期更新基线截图
   - 删除不再使用的截图
   - 使用有意义的命名

---

## 总结

本文档涵盖了 JavaScript/TypeScript 项目中10种重要的测试模式：

| 模式 | 适用场景 | 核心收益 |
|------|----------|----------|
| **AAA模式** | 所有单元测试 | 清晰的测试结构 |
| **Given-When-Then** | BDD场景 | 业务语言描述 |
| **测试替身** | 依赖隔离 | 可控的测试环境 |
| **Page Object** | E2E测试 | 可维护的页面对象 |
| **快照测试** | UI组件、数据结构 | 快速回归检测 |
| **参数化测试** | 边界值测试 | 减少重复代码 |
| **并行测试** | 大型测试套件 | 缩短执行时间 |
| **测试数据工厂** | 复杂测试数据 | 数据生成复用 |
| **契约测试** | 服务间集成 | API兼容性保证 |
| **视觉回归** | UI一致性 | 视觉变化检测 |

根据项目需求选择合适的测试模式组合，建立完善的测试策略。
