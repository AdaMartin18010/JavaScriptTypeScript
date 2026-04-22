# 智能性能优化：AI 驱动的性能工程

> **目标读者**：性能工程师、关注 AI 辅助优化的开发者
> **关联文档**：[`docs/categories/54-intelligent-performance.md`](../../docs/categories/54-intelligent-performance.md)
> **版本**：2026-04

---

## 1. AI 辅助性能优化

### 1.1 代码级优化

- **Copilot / Claude**：识别低效算法，建议优化方案
- **静态分析 + ML**：预测性能瓶颈
- **自动重构**：将 O(n²) 改为 O(n log n)

### 1.2 运行时优化

- **自适应加载**：根据设备性能调整资源
- **预测性预加载**：AI 预测用户下一步，提前加载
- **智能缓存**：基于访问模式的缓存策略

---

## 2. 性能预算自动化

```yaml
# performance-budget.yml
budgets:
  - path: "/"
    resources:
      - type: javascript
        budget: 200KB
        warn: 150KB
      - type: image
        budget: 500KB
```

---

## 3. 总结

AI 不会取代性能工程师，但会**放大性能工程师的能力**。

---

## 参考资源

- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)
