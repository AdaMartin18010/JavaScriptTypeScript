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

---

*最后更新: 2026-04-29*
