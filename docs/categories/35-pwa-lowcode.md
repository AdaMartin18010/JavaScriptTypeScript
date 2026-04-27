---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# PWA 与低代码平台（Application Domain）

> **维度**: 应用领域 | **边界**: 本文档聚焦 PWA 应用和低代码平台产品技术，通用 UI 组件库和构建工具请参见 `docs/categories/02-ui-component-libraries.md` 和 `docs/categories/03-build-tools.md`。

---

## 分类概览

| 类别 | 代表技术 | 适用场景 |
|------|----------|----------|
| PWA 框架 | Workbox, Vite PWA | Service Worker、离线应用 |
| 低代码平台 | Appsmith, ToolJet, Budibase | 内部工具、管理后台 |
| 可视化搭建 | React DnD, @dnd-kit, Formily | 拖拽设计器、表单搭建 |
| 报表 BI | Apache ECharts, AntV, Metabase | 数据大屏、可视化报表 |

---

## 与基础设施的边界

```
应用领域 (本文档)                     基础设施层
├─ PWA 应用产品                        ├─ Service Worker API 规范
├─ 低代码平台产品                      ├─ 组件库 (Ant Design/MUI)
├─ 可视化报表系统                      ├─ 构建工具 (Vite/Webpack)
└─ 无代码工作流                        └─ 状态管理 (Redux/Zustand)
```

---

## 关联资源

- `jsts-code-lab/37-pwa/` — Service Worker、缓存策略、Manifest
- `jsts-code-lab/97-lowcode-platform/` — 低代码引擎、Schema 定义
- `jsts-code-lab/58-data-visualization/` — 图表渲染、动画
- `docs/application-domains-index.md` — 应用领域总索引

---

> 📅 最后更新: 2026-04-27
