# 可访问性(a11y) — 理论基础

## 1. WCAG 2.2 四大原则（POUR）

| 原则 | 含义 | 示例 |
|------|------|------|
| **P**erceivable | 可感知 | 图片提供 alt 文本、视频提供字幕 |
| **O**perable | 可操作 | 所有功能可通过键盘访问 |
| **U**nderstandable | 可理解 | 表单错误提示清晰 |
| **R**obust | 健壮 | 兼容辅助技术（屏幕阅读器）|

## 2. ARIA 角色与属性

- **角色（role）**: 定义元素语义（`role="button"`、`role="navigation"`）
- **状态（state）**: 动态变化的信息（`aria-expanded`、`aria-checked`）
- **属性（property）**: 相对稳定的关系（`aria-label`、`aria-describedby`）

ARIA 使用原则：**优先使用原生 HTML 语义，ARIA 作为补充**。

## 3. 键盘导航

- **Tab 顺序**: 使用 `tabindex` 控制焦点顺序
- **焦点管理**: 模态框打开时焦点进入，关闭时焦点返回
- **快捷键**: 提供键盘快捷键，但不与屏幕阅读器冲突
- **Skip Link**: 跳过导航直接访问主内容的链接

## 4. 视觉可访问性

- **颜色对比度**: 正文至少 4.5:1，大文本至少 3:1
- **不依赖颜色**: 错误状态不仅用红色，还需图标/文字
- **文本缩放**: 支持 200% 缩放不丢失功能
- **动画**: 尊重 `prefers-reduced-motion` 设置

## 5. 与相邻模块的关系

- **51-ui-components**: 组件库的可访问性设计
- **18-frontend-frameworks**: 框架的无障碍支持
- **37-pwa**: PWA 的可访问性要求
