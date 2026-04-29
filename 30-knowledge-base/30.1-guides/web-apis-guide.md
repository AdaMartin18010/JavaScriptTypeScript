# Web API 指南

> 2026 年现代 Web API 速查：从 View Transitions 到 Popover 的渐进增强实践。

---

## 2024–2026 新增 API

| API | 支持度 | 说明 |
|-----|--------|------|
| **View Transitions** | Chrome 126+ | 页面间平滑动画，MPA 体验提升 |
| **Popover API** | Chrome 114+, Safari 17+ | 原生弹层，自动焦点管理 |
| **Invokers** | Chrome 135+ | `commandfor` 属性触发任意元素行为 |
| **Anchor Positioning** | Chrome 125+ | 元素相对锚点定位，替代 Popper.js |
| **@starting-style** | Chrome 117+ | CSS 进入动画，无需 JS |
| **Scoped CSS** | Chrome 131+ | `@scope` 限定样式作用域 |

---

## 代码示例

### View Transitions

```javascript
// 单页应用导航动画
document.startViewTransition(() => {
  updateDOM() // 更新内容
})
```

### Popover API

```html
<button popovertarget="menu">打开菜单</button>
<div id="menu" popover>
  <ul><li>选项 1</li><li>选项 2</li></ul>
</div>
```

### Anchor Positioning

```css
#tooltip {
  position: absolute;
  anchor-default: --trigger;
  inset-area: top;
}
```

---

## 渐进增强策略

```javascript
// 特性检测
if ('startViewTransition' in document) {
  // 使用 View Transitions
} else {
  // 降级到普通更新
}
```

---

*最后更新: 2026-04-29*
