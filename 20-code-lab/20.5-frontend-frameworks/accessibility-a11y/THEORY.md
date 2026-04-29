# 可访问性(a11y) — 理论基础

## 1. WCAG 2.2 四大原则（POUR）

| 原则 | 含义 | 示例 |
|------|------|------|
| **P**erceivable | 可感知 | 图片提供 alt 文本、视频提供字幕 |
| **O**perable | 可操作 | 所有功能可通过键盘访问 |
| **U**nderstandable | 可理解 | 表单错误提示清晰 |
| **R**obust | 健壮 | 兼容辅助技术（屏幕阅读器）|

## 2. WCAG 2.2 合规等级

| 等级 | 要求 | 典型标准 | 适用场景 |
|------|------|----------|----------|
| **A** | 最低可访问性门槛 | 所有图片有替代文本、键盘可操作、不为空链接 | 法律合规底线 |
| **AA** | 广泛认可的行业标准 | 对比度 4.5:1、文本可缩放 200%、错误建议 | 政府/企业/金融站点强制要求 |
| **AAA** | 最高可访问性标准 | 对比度 7:1、手语视频、扩展阅读级内容 | 特殊教育、公益组织、可选增强 |

> **合规建议**：绝大多数商业产品应以 **AA 级** 为基准目标；AAA 级可作为渐进增强。

## 3. ARIA 角色与属性

- **角色（role）**: 定义元素语义（`role="button"`、`role="navigation"`）
- **状态（state）**: 动态变化的信息（`aria-expanded`、`aria-checked`）
- **属性（property）**: 相对稳定的关系（`aria-label`、`aria-describedby`）

ARIA 使用原则：**优先使用原生 HTML 语义，ARIA 作为补充**。

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

## 5. 键盘导航

- **Tab 顺序**: 使用 `tabindex` 控制焦点顺序
- **焦点管理**: 模态框打开时焦点进入，关闭时焦点返回
- **快捷键**: 提供键盘快捷键，但不与屏幕阅读器冲突
- **Skip Link**: 跳过导航直接访问主内容的链接

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

## 7. 与相邻模块的关系

- **51-ui-components**: 组件库的可访问性设计
- **18-frontend-frameworks**: 框架的无障碍支持
- **37-pwa**: PWA 的可访问性要求

## 权威参考链接

- [W3C WCAG 2.2 官方文档](https://www.w3.org/WAI/WCAG22/quickref/)
- [MDN ARIA 指南](https://developer.mozilla.org/zh-CN/docs/Web/Accessibility/ARIA)
- [WAI-ARIA 实践指南](https://www.w3.org/WAI/ARIA/apg/)
- [axe DevTools (Deque)](https://www.deque.com/axe/)
- [axe-core GitHub](https://github.com/dequelabs/axe-core)
- [WebAIM 对比度检查器](https://webaim.org/resources/contrastchecker/)
