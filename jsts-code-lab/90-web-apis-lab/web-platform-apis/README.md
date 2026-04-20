# Web 平台 API 专项模块

> 模块编号: 90-web-apis-lab/web-platform-apis
> 复杂度: ⭐⭐⭐ (中级)
> 前置依赖: 00-language-core, 90-web-apis-lab

---

## 学习目标

完成本模块后，你将能够：

1. 使用 Popover API 替代 Tippy.js/Popper.js 实现弹出层
2. 使用 View Transitions API 实现页面/元素过渡动画
3. 了解 Temporal API 的 API 设计和迁移路径
4. 使用 Navigation API 替代 History API 实现 SPA 路由
5. 使用 CSS Anchor Positioning 替代 JS 定位计算
6. 设计渐进增强策略（特性检测 + 回退方案）

---

## 文件结构

| 文件 | 内容 | 浏览器支持 |
|------|------|-----------|
| `popover-api.ts` | 原生 Popover API（声明式 + 程序化控制） | Baseline 2025 ✅ |
| `view-transitions-api.ts` | 页面/元素过渡动画（同一文档 + 跨文档） | Baseline 2025 ✅ |
| `temporal-api.ts` | 现代化日期时间 API（替代 Date） | Chrome 144+ / Firefox |
| `navigation-api.ts` | 程序化导航（替代 History API） | Chrome 102+ / Firefox 127+ |
| `anchor-positioning.ts` | CSS 锚点定位（替代 JS 定位计算） | Chrome 125+ / Interop 2026 |

---

## 核心概念

### 为什么浏览器原生 API 越来越重要？

| 维度 | 第三方库 | 原生 API |
|------|---------|---------|
| **性能** | 需下载、解析、执行 JS | 浏览器内置，零下载 |
| **可靠性** | 可能停止维护 | 浏览器厂商长期支持 |
| **无障碍** | 依赖库的实现质量 | 浏览器原生实现通常更好 |
| **学习成本** | 需学习库特定 API | 学习一次，到处使用 |
| **生态锁定** | 深度集成后难以替换 | 标准化，可移植 |

### 渐进增强策略

```typescript
if (supportsPopover()) {
  // 使用原生 Popover API
} else {
  // 回退到 CSS + JS 方案
}
```

---

## 对第三方库的冲击

| 原生 API | 受冲击的库 | 替代程度 |
|---------|-----------|---------|
| Popover API | Tippy.js, Popper.js, Floating UI | 80% |
| View Transitions API | Framer Motion（页面过渡部分）| 60% |
| Temporal API | date-fns, moment.js, dayjs | 70%（发布后）|
| Navigation API | React Router（部分功能）| 30% |
| Anchor Positioning | Floating UI, Popper.js | 90% |

**注意**：原生 API 不会完全消灭第三方库，但会取代其核心场景。复杂交互逻辑仍需库辅助。

---

## 学习路径

1. 阅读各 API 文件，理解 API 设计哲学
2. 在支持这些 API 的浏览器中运行示例代码
3. 尝试将现有项目中的第三方库替换为原生 API
4. 设计特性检测和回退方案

---

## 关联内容

- **理论文档**: `JSTS全景综述/`（如有时效性相关文档）
- **指南**: `docs/guides/web-apis-guide.md`
- **浏览器兼容性**: [MDN - Baseline](https://developer.mozilla.org/en-US/docs/Glossary/Baseline)
- **Interop 2026**: [Web Platform Tests](https://wpt.fyi/)
