---
title: 测试策略完全指南
description: JavaScript/TypeScript 测试金字塔、TDD/BDD、E2E 策略、覆盖率治理与 AI 测试生成
---

# 测试策略完全指南

> 最后更新: 2026-05-01

---

## 1. 测试金字塔

```
    /
   / \      E2E (10%) — Playwright
  /   \     Integration (30%) — Vitest + MSW
 /     \    Unit (60%) — Vitest/Jest
/_______\
```

## 2. 测试类型矩阵

| 类型 | 工具 | 速度 | 覆盖目标 |
|------|------|------|---------|
| **Unit** | Vitest, Jest | < 100ms | 函数、组件 |
| **Integration** | Vitest + MSW | < 1s | API、数据库 |
| **E2E** | Playwright | < 10s | 用户流程 |
| **Visual** | Chromatic, Percy | < 1min | UI 回归 |
| **Performance** | Lighthouse CI | < 2min | 性能指标 |

## 3. TDD 循环

```
Red  → 编写失败的测试
Green → 编写最简单的通过代码
Refactor → 重构，保持测试通过
```

## 4. 覆盖率治理

```json
// vitest.config.ts
{
  "coverage": {
    "thresholds": {
      "lines": 80,
      "functions": 80,
      "branches": 70
    }
  }
}
```

## 延伸阅读

- [测试分类](../categories/testing)
- [测试生态分类](../categories/testing-ecosystem)
