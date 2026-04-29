---
dimension: 综合
sub-dimension: Accessibility a11y
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Accessibility a11y 核心概念与工程实践。

## 包含内容

- 本模块聚焦 accessibility a11y 核心概念与工程实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
## 目录内容

- 📄 ARCHIVED.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 a11y-utils.test.ts
- 📄 a11y-utils.ts
- 📄 index.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 子模块速查

| 子模块 | 核心能力 | 关联文件 |
|--------|----------|----------|
| A11y Utils | 焦点管理、跳过链接、ARIA 属性辅助函数 | `a11y-utils.ts` |
| A11y Testing | 可访问性断言与自动化测试工具封装 | `a11y-utils.test.ts` |

## 代码示例：焦点陷阱与 ARIA 工具函数

```typescript
/**
 * 将焦点限制在模态框内（Focus Trap），满足 WCAG 2.2 Focus Trap 要求
 */
export function createFocusTrap(container: HTMLElement) {
  const focusableSelectors = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function getFocusables() {
    return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    const focusables = getFocusables();
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }

  container.addEventListener('keydown', handleKeyDown);
  return () => container.removeEventListener('keydown', handleKeyDown);
}

// ── 动态 ARIA 属性更新工具 ──
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', priority);
  el.className = 'sr-only';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}
```

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| W3C WAI-ARIA Practices | 官方模式与示例 | [w3.org/WAI/ARIA/apg](https://www.w3.org/WAI/ARIA/apg/) |
| axe-core | 可访问性测试引擎 | [github.com/dequelabs/axe-core](https://github.com/dequelabs/axe-core) |
| WCAG 2.2 | 官方标准 | [w3.org/WAI/WCAG22](https://www.w3.org/WAI/WCAG22/) |
| MDN — Accessibility | 文档 | [developer.mozilla.org/en-US/docs/Web/Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility) |
| web.dev — Accessibility | 指南 | [web.dev/accessibility](https://web.dev/accessibility) |

---

*最后更新: 2026-04-29*
