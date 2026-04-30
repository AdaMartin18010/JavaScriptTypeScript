# 可访问性(a11y) — 理论基础

## 1. WCAG 2.2 四大原则（POUR）

| 原则 | 含义 | 示例 |
|------|------|------|
| **P**erceivable | 可感知 | 图片提供 alt 文本、视频提供字幕 |
| **O**perable | 可操作 | 所有功能可通过键盘访问 |
| **U**nderstandable | 可理解 | 表单错误提示清晰 |
| **R**obust | 健壮 | 兼容辅助技术（屏幕阅读器）|

---

## 2. WCAG 2.2 合规等级

| 等级 | 要求 | 典型标准 | 适用场景 |
|------|------|----------|----------|
| **A** | 最低可访问性门槛 | 所有图片有替代文本、键盘可操作、不为空链接 | 法律合规底线 |
| **AA** | 广泛认可的行业标准 | 对比度 4.5:1、文本可缩放 200%、错误建议 | 政府/企业/金融站点强制要求 |
| **AAA** | 最高可访问性标准 | 对比度 7:1、手语视频、扩展阅读级内容 | 特殊教育、公益组织、可选增强 |

> **合规建议**：绝大多数商业产品应以 **AA 级** 为基准目标；AAA 级可作为渐进增强。

---

## 3. ARIA 角色与属性

- **角色（role）**: 定义元素语义（`role="button"`、`role="navigation"`）
- **状态（state）**: 动态变化的信息（`aria-expanded`、`aria-checked`）
- **属性（property）**: 相对稳定的关系（`aria-label`、`aria-describedby`）

ARIA 使用原则：**优先使用原生 HTML 语义，ARIA 作为补充**。

---

## 4. ARIA 代码示例

```html
<!-- 可展开导航菜单 -->
<nav aria-label="主导航">
  <button
    aria-expanded="false"
    aria-controls="menu-list"
    id="menu-toggle"
  >
    菜单
  </button>
  <ul id="menu-list" role="menu" aria-labelledby="menu-toggle" hidden>
    <li role="none"><a href="/" role="menuitem">首页</a></li>
    <li role="none"><a href="/about" role="menuitem">关于</a></li>
  </ul>
</nav>

<!-- 表单错误提示 -->
<label for="email">邮箱</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert">请输入有效的邮箱地址</span>

<!-- 模态对话框 -->
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">确认删除</h2>
  <p>此操作不可撤销。</p>
  <button>取消</button>
  <button>确认删除</button>
</div>
```

**React 中的 ARIA 组件化实践**：

```tsx
// components/AccessibleModal.tsx
import { useRef, useEffect, useCallback } from 'react';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function AccessibleModal({ isOpen, onClose, title, children }: AccessibleModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // 焦点管理：打开时聚焦对话框，关闭时返回原焦点
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      dialogRef.current?.focus();
    } else {
      previousFocus.current?.focus();
    }
  }, [isOpen]);

  // ESC 关闭
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  // 焦点陷阱（Focus Trap）
  const handleTabKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onKeyDown={(e) => { handleKeyDown(e); handleTabKey(e); }}
        style={{ background: '#fff', padding: 24, borderRadius: 8, maxWidth: 480 }}
      >
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}
```

---

## 5. 键盘导航

- **Tab 顺序**: 使用 `tabindex` 控制焦点顺序
- **焦点管理**: 模态框打开时焦点进入，关闭时焦点返回
- **快捷键**: 提供键盘快捷键，但不与屏幕阅读器冲突
- **Skip Link**: 跳过导航直接访问主内容的链接

```html
<!-- Skip Link 模式 -->
<a href="#main-content" class="skip-link">跳转到主内容</a>
<nav><!-- 导航内容 --></nav>
<main id="main-content" tabindex="-1">
  <!-- 页面主体 -->
</main>
```

```css
/* 仅对键盘用户可见的 Skip Link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
  transition: top 0.3s;
}
.skip-link:focus {
  top: 0;
}
```

---

## 6. 视觉可访问性

- **颜色对比度**: 正文至少 4.5:1，大文本至少 3:1
- **不依赖颜色**: 错误状态不仅用红色，还需图标/文字
- **文本缩放**: 支持 200% 缩放不丢失功能
- **动画**: 尊重 `prefers-reduced-motion` 设置

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**CSS 自定义属性实现高对比度支持**：

```css
:root {
  --color-text: #1a1a1a;
  --color-bg: #ffffff;
  --color-accent: #005fcc;
}

@media (prefers-contrast: more) {
  :root {
    --color-text: #000000;
    --color-bg: #ffffff;
    --color-accent: #0000ee;
  }
}
```

---

## 7. 自动化可访问性测试

```typescript
// a11y.test.ts — 使用 axe-core 进行自动化测试
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage should not have accessibility violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('modal should trap focus and be dismissible', async ({ page }) => {
  await page.goto('/dashboard');
  await page.keyboard.press('Tab'); // 聚焦到打开按钮
  await page.keyboard.press('Enter'); // 打开模态框

  // 验证焦点在模态框内
  const focused = await page.evaluate(() => document.activeElement?.getAttribute('role'));
  expect(focused).toBe('dialog');

  // ESC 关闭
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});
```

**Storybook A11y 插件配置**：

```typescript
// .storybook/main.ts
export default {
  addons: ['@storybook/addon-a11y'],
};
```

---

## 8. Live Region 与动态内容通知

屏幕阅读器用户无法感知视觉更新，需通过 Live Region 主动通知：

```html
<!-- 状态栏 Live Region -->
<div id="status-region" role="status" aria-live="polite" aria-atomic="true" class="sr-only">
  <!-- 动态插入通知文本 -->
</div>

<!-- 错误警告 Live Region -->
<div id="error-region" role="alert" aria-live="assertive" aria-atomic="true" class="sr-only">
  <!-- 紧急错误信息 -->
</div>
```

```typescript
// live-region.ts — React/Vanilla 通用的 Live Region 管理器
class LiveRegionAnnouncer {
  private statusRegion: HTMLElement;
  private alertRegion: HTMLElement;

  constructor() {
    this.statusRegion = document.getElementById('status-region')!;
    this.alertRegion = document.getElementById('error-region')!;
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const region = priority === 'assertive' ? this.alertRegion : this.statusRegion;
    // 先清空再写入，确保屏幕阅读器重新朗读
    region.textContent = '';
    requestAnimationFrame(() => {
      region.textContent = message;
    });
  }
}

// 使用
const announcer = new LiveRegionAnnouncer();
announcer.announce('文件上传完成');
announcer.announce('网络连接失败，请检查设置', 'assertive');
```

---

## 9. 代码示例：Skip Link React 组件

```tsx
// components/SkipLink.tsx
export function SkipLink({ targetId = 'main-content' }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="skip-link"
      onClick={(e) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
          target.tabIndex = -1;
          target.focus();
          target.scrollIntoView();
        }
      }}
    >
      跳转到主内容
    </a>
  );
}

// CSS
// .skip-link { position: absolute; top: -40px; left: 0; background: #000; color: #fff; padding: 8px; z-index: 100; transition: top 0.3s; }
// .skip-link:focus { top: 0; }
```

---

## 10. 代码示例：Accessible Tabs 组件

```tsx
// components/AccessibleTabs.tsx
import { useState, useRef, KeyboardEvent } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function AccessibleTabs({ tabs }: { tabs: Tab[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex = activeIndex;
    if (e.key === 'ArrowRight') nextIndex = (activeIndex + 1) % tabs.length;
    if (e.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') nextIndex = 0;
    if (e.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex !== activeIndex) {
      e.preventDefault();
      setActiveIndex(nextIndex);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div>
      <div role="tablist" aria-label="示例标签页">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[i] = el; }}
            role="tab"
            aria-selected={i === activeIndex}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={i === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(i)}
            onKeyDown={handleKeyDown}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={i !== activeIndex}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

---

## 11. 与相邻模块的关系

- **51-ui-components**: 组件库的可访问性设计
- **18-frontend-frameworks**: 框架的无障碍支持
- **37-pwa**: PWA 的可访问性要求

---

## 12. 权威参考链接

- [W3C WCAG 2.2 官方文档](https://www.w3.org/WAI/WCAG22/quickref/)
- [MDN ARIA 指南](https://developer.mozilla.org/zh-CN/docs/Web/Accessibility/ARIA)
- [WAI-ARIA 实践指南](https://www.w3.org/WAI/ARIA/apg/)
- [axe DevTools (Deque)](https://www.deque.com/axe/)
- [axe-core GitHub](https://github.com/dequelabs/axe-core)
- [WebAIM 对比度检查器](https://webaim.org/resources/contrastchecker/)

## 13. 扩展权威资源

| 资源 | 链接 | 说明 |
|------|------|------|
| W3C WCAG 2.2 规范原文 | [w3.org/TR/WCAG22](https://www.w3.org/TR/WCAG22/) | W3C 官方推荐标准 |
| ARIA Authoring Practices Guide (APG) | [w3.org/WAI/ARIA/apg](https://www.w3.org/WAI/ARIA/apg/) | 官方 ARIA 设计模式与交互指南 |
| MDN — Accessibility | [developer.mozilla.org/en-US/docs/Web/Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility) | MDN 无障碍综合文档 |
| axe-core Playwright 集成 | [github.com/dequelabs/axe-core-npm](https://github.com/dequelabs/axe-core-npm) | 自动化无障碍测试官方集成 |
| Radix UI — 无障碍原语 | [radix-ui.com/primitives/docs/overview/accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility) | 现代 React 无障碍组件库 |
| React Spectrum (Adobe) | [react-spectrum.adobe.com/react-aria](https://react-spectrum.adobe.com/react-aria/) | Adobe 无障碍钩子集合 |
| GOV.UK — Accessibility | [accessibility.blog.gov.uk](https://accessibility.blog.gov.uk/) | 英国政府数字服务无障碍实践 |
| WebAIM 年度调查 | [webaim.org/projects/screenreadersurvey9](https://webaim.org/projects/screenreadersurvey9/) | 屏幕阅读器使用统计 |
| Stark (Figma 插件) | [getstark.co](https://www.getstark.co/) | 设计阶段无障碍检查工具 |
| European Accessibility Act | [digital-strategy.ec.europa.eu/policies/web-accessibility](https://digital-strategy.ec.europa.eu/en/policies/web-accessibility) | 欧盟无障碍法规要求 |
| HTML Accessibility API Mappings 1.0 | [w3.org/TR/html-aam-1.0](https://www.w3.org/TR/html-aam-1.0/) | HTML 到无障碍 API 映射规范 |
| W3C — Accessible Rich Internet Applications (WAI-ARIA) 1.2 | [w3.org/TR/wai-aria-1.2](https://www.w3.org/TR/wai-aria-1.2/) | ARIA 1.2 规范 |
| MDN — prefers-reduced-motion | [developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) | 减少动画偏好媒体查询 |
| MDN — prefers-contrast | [developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast) | 对比度偏好媒体查询 |
| The A11Y Project — Checklist | [a11yproject.com/checklist](https://www.a11yproject.com/checklist/) | 社区维护的无障碍检查清单 |
| Pa11y — Automated Accessibility Testing | [pa11y.org](https://pa11y.org/) | 命令行与 CI 无障碍测试工具 |
| W3C — ARIA 1.3 Draft](<https://w3c.github.io/aria/>) | W3C ARIA 1.3 工作草案 |
| W3C — Accessibility Conformance Testing (ACT) Rules | [w3.org/WAI/standards-guidelines/act](https://www.w3.org/WAI/standards-guidelines/act/) | 无障碍一致性测试规则 |
| MDN — Landmark Regions | [developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/region_role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/region_role) | ARIA 地标角色指南 |
| Web.dev — Accessibility Foundations](<https://web.dev/accessibility>) | Google Web 开发者无障碍基础 |

---

*最后更新: 2026-04-29*
