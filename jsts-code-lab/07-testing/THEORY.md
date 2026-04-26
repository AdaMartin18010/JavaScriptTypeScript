# 测试工程理论：从单元测试到质量门禁

> **目标读者**：全栈工程师、QA 工程师、关注代码质量的团队
> **关联文档**：[`docs/categories/07-testing.md`](../../docs/categories/07-testing.md)
> **版本**：2026-04
> **字数**：约 3,600 字

---

## 1. 测试金字塔与测试策略

### 1.1 经典测试金字塔

```
      /\
     /  \      E2E 测试 (少量)
    /____\     ─ 用户场景验证
   /      \    ─ 慢、脆弱、高价值
  /        \   
 /__________\  集成测试 (中量)
/            \ ─ 模块间协作
              ─ 数据库、API、外部服务
________________
                
单元测试 (大量) ─ 函数/组件逻辑
              ─ 快、稳定、低成本
```

**比例建议**：
- 单元测试：70-80%
- 集成测试：15-20%
- E2E 测试：5-10%

### 1.2 测试投资回报分析

| 测试层级 | 成本 | 稳定性 | 定位问题速度 | 维护成本 |
|---------|------|--------|-------------|---------|
| 单元测试 | 低 | 高 | 极快 | 低 |
| 集成测试 | 中 | 中 | 中 | 中 |
| E2E 测试 | 高 | 低 | 慢 | 高 |

**核心原则**：在最低可行的层级发现问题。

---

## 2. 单元测试方法论

### 2.1 AAA 模式

```typescript
// Arrange: 准备测试数据
const user = { name: 'Alice', age: 25 };

// Act: 执行被测操作
const result = canVote(user);

// Assert: 验证结果
expect(result).toBe(true);
```

### 2.2 测试替身（Test Doubles）

| 类型 | 目的 | 示例 |
|------|------|------|
| **Dummy** | 占位参数 | `new User(dummyId, 'name')` |
| **Fake** | 简化实现 | 内存数据库替代真实数据库 |
| **Stub** | 固定返回值 | `fetch.stub.returns(Promise.resolve(mockData))` |
| **Spy** | 观察调用 | `vi.spyOn(console, 'log')` |
| **Mock** | 验证交互 | `expect(mockFn).toHaveBeenCalledWith(arg)` |

### 2.3 属性测试（Property-Based Testing）

```typescript
import { fc, it } from '@fast-check/vitest';

// 传统测试：只验证几个具体值
it('should reverse string', () => {
  expect(reverse('hello')).toBe('olleh');
});

// 属性测试：验证所有可能输入的通用属性
it.prop([fc.string()])('reverse twice = original', (s) => {
  expect(reverse(reverse(s))).toBe(s);
});
```

---

## 3. 集成测试策略

### 3.1 测试数据库策略

| 策略 | 实现 | 优点 | 缺点 |
|------|------|------|------|
| **内存数据库** | SQLite :memory: | 快、隔离 | 与生产数据库行为差异 |
| **TestContainers** | Docker 数据库 | 与生产一致 | 慢、需 Docker |
| **共用数据库** | 独立 schema | 中等速度 | 测试间可能冲突 |

**推荐**：使用 TestContainers 进行关键路径测试，内存数据库用于快速反馈。

### 3.2 API 集成测试

```typescript
import { test, expect } from 'vitest';
import { createApp } from '../src/app';

const app = createApp();

test('POST /users creates a user', async () => {
  const response = await app.request('/users', {
    method: 'POST',
    body: JSON.stringify({ name: 'Alice', email: 'a@b.com' }),
    headers: { 'Content-Type': 'application/json' },
  });

  expect(response.status).toBe(201);
  const body = await response.json();
  expect(body.id).toBeDefined();
  expect(body.name).toBe('Alice');
});
```

---

## 4. E2E 测试与视觉回归

### 4.1 Playwright 最佳实践

```typescript
import { test, expect } from '@playwright/test';

test('user can complete checkout', async ({ page }) => {
  // Arrange
  await page.goto('/products');

  // Act
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="checkout"]');
  await page.fill('[data-testid="email"]', 'user@example.com');
  await page.click('[data-testid="submit-order"]');

  // Assert
  await expect(page.locator('[data-testid="success-message"]'))
    .toBeVisible();
});
```

**稳定性原则**：
- 使用 `data-testid` 而非 CSS 类选择器
- 避免固定等待时间，使用 `await expect().toBeVisible()`
- 每个测试独立，不共享状态

### 4.2 视觉回归测试

```typescript
// Playwright + Argos CI
test('homepage visual', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

**适用场景**：UI 组件库、设计系统、营销页面。

---

## 5. 测试覆盖率与质量门禁

### 5.1 覆盖率指标解读

| 指标 | 定义 | 目标 | 陷阱 |
|------|------|------|------|
| **行覆盖率** | 执行的代码行 / 总行数 | > 80% | 高行覆盖 ≠ 高测试质量 |
| **分支覆盖率** | 执行的分支 / 总分支 | > 70% | 更真实反映测试深度 |
| **函数覆盖率** | 调用的函数 / 总函数 | > 90% | 容易达标 |

**覆盖率不是目标，是指标**。100% 覆盖率仍可能有严重缺陷。

### 5.2 CI 质量门禁

```yaml
# .github/workflows/quality.yml
jobs:
  test:
    steps:
      - name: Run tests with coverage
        run: pnpm vitest --coverage

      - name: Check coverage threshold
        run: |
          if [ $(cat coverage/coverage-summary.json | jq '.total.lines.pct') -lt 80 ]; then
            echo "Coverage below 80%"
            exit 1
          fi
```

---

## 6. 测试反模式

### 反模式 1：测试实现细节

❌ 测试内部函数调用顺序。
✅ 测试输入输出的行为契约。

### 反模式 2：测试之间共享状态

❌ 测试 A 创建的数据影响测试 B。
✅ 每个测试独立 setup/teardown。

### 反模式 3：过度 Mock

❌ Mock 掉所有依赖，测试只验证自己调用了 mock。
✅ 集成测试中使用真实依赖，单元测试中只 mock 边界。

### 反模式 4：测试代码比生产代码更复杂

❌ 100 行测试代码验证 10 行生产代码。
✅ 复杂的测试提示生产代码需要重构。

---

## 7. 现代测试趋势

### 7.1 组件测试（Component Testing）

Vitest + Testing Library + happy-dom：
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from './Counter';

test('increments on click', () => {
  render(<Counter initial={0} />);
  fireEvent.click(screen.getByText('+'));
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

### 7.2 契约测试（Contract Testing）

```typescript
// Pact：消费者驱动契约
const pact = new PactV3({
  consumer: 'web-app',
  provider: 'user-service',
});

pact.addInteraction({
  uponReceiving: 'get user by id',
  withRequest: { method: 'GET', path: '/users/1' },
  willRespondWith: { status: 200, body: { id: 1, name: 'Alice' } },
});
```

### 7.3 AI 辅助测试生成

- **GitHub Copilot**：根据函数签名生成测试骨架
- **CodiumAI / CodeRabbit**：分析代码变更建议补充测试
- **Mutation Testing**：自动修改代码验证测试是否能捕获缺陷

---

## 8. 总结

测试不是成本，是**投资**。好的测试：

1. **赋能重构**：有安全网才敢改代码
2. **文档行为**：测试用例是活文档
3. **加速开发**：快速反馈环

**推荐栈（2026）**：
- 单元/集成：Vitest + Testing Library
- E2E：Playwright
- 覆盖率：v8（内置于 Vitest）
- Mock：vi.fn()（内置于 Vitest）

---

## 参考资源

- [Testing Library 指南](https://testing-library.com/)
- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)
- [TestContainers](https://testcontainers.com/)
- [Mutation Testing (Stryker)](https://stryker-mutator.io/)

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `e2e-testing.ts`
- `index.ts`
- `integration-testing.ts`
- `mock-stub.ts`
- `tdd-bdd.ts`
- `unit-test-patterns.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **模式一**：待根据代码具体分析
2. **模式二**：待根据代码具体分析
3. **模式三**：待根据代码具体分析

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

---

> 📅 理论深化更新：2026-04-27
