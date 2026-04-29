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

## 代码示例：Skip Link 与 Heading Outline 检查器

```typescript
// skip-link.ts — WCAG 2.4.1 Bypass Blocks

export function injectSkipLink(targetId: string): HTMLAnchorElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = '跳到主要内容';
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute; top: -40px; left: 0;
    background: #000; color: #fff; padding: 8px;
    z-index: 100; transition: top 0.3s;
  `;
  skipLink.addEventListener('focus', () => { skipLink.style.top = '0'; });
  skipLink.addEventListener('blur', () => { skipLink.style.top = '-40px'; });
  document.body.prepend(skipLink);
  return skipLink;
}

// heading-outline.ts — 检查标题层级是否断裂（WCAG 1.3.1）
export interface HeadingViolation {
  level: number;
  text: string;
  expected: number;
}

export function auditHeadingOutline(container: HTMLElement = document.body): HeadingViolation[] {
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const violations: HeadingViolation[] = [];
  let previousLevel = 0;

  headings.forEach(h => {
    const level = parseInt(h.tagName[1]);
    if (level > previousLevel + 1) {
      violations.push({ level, text: h.textContent || '', expected: previousLevel + 1 });
    }
    previousLevel = level;
  });

  return violations;
}

// 使用
const violations = auditHeadingOutline();
if (violations.length) {
  console.warn('Heading outline violations:', violations);
}
```

## 代码示例：Reduced Motion 与键盘可访问按钮

```typescript
// reduced-motion.ts — 尊重用户系统偏好（WCAG 2.3.3）

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getAccessibleTransition(duration: number): string {
  return prefersReducedMotion() ? 'none' : `${duration}ms ease`;
}

// 监听系统偏好变化
window.matchMedia('(prefers-reduced-motion: reduce)')
  .addEventListener('change', (e) => {
    document.documentElement.classList.toggle('reduce-motion', e.matches);
  });

// keyboard-accessible.ts — 确保自定义控件完全键盘可操作
export function makeAccessibleButton(
  element: HTMLElement,
  onActivate: () => void
): void {
  if (element.tagName !== 'BUTTON') {
    element.setAttribute('role', 'button');
    element.setAttribute('tabindex', '0');
  }

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate();
    }
  });

  element.addEventListener('click', onActivate);
}

// 使用：将 div 转换为可访问按钮
const customBtn = document.getElementById('custom-button')!;
makeAccessibleButton(customBtn, () => console.log('Activated'));
```

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| W3C WAI-ARIA Practices | 官方模式与示例 | [w3.org/WAI/ARIA/apg](https://www.w3.org/WAI/ARIA/apg/) |
| axe-core | 可访问性测试引擎 | [github.com/dequelabs/axe-core](https://github.com/dequelabs/axe-core) |
| WCAG 2.2 | 官方标准 | [w3.org/WAI/WCAG22](https://www.w3.org/WAI/WCAG22/) |
| MDN — Accessibility | 文档 | [developer.mozilla.org/en-US/docs/Web/Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility) |
| web.dev — Accessibility | 指南 | [web.dev/accessibility](https://web.dev/accessibility) |
| A11y Project — Checklist | 检查清单 | [www.a11yproject.com/checklist](https://www.a11yproject.com/checklist/) |
| W3C — Accessible Rich Internet Applications (WAI-ARIA) 1.2 | 规范 | [w3.org/TR/wai-aria-1.2](https://www.w3.org/TR/wai-aria-1.2/) |
| WebAIM — Introduction to Web Accessibility | 入门指南 | [webaim.org/articles](https://webaim.org/articles/) |
| MDN — prefers-reduced-motion | CSS 媒体特性 | [developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) |

---

*最后更新: 2026-04-29*
