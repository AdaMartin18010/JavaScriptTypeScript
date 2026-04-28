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

## 核心模块

### 低代码平台 (`jsts-code-lab/97-lowcode-platform/`)

| 文件 | 主题 | 覆盖范围 |
|------|------|----------|
| `lowcode-engine.ts` | 低代码引擎 | 组件库、页面设计器（含撤销重做）、React 代码生成、工作流引擎、表达式引擎 |
| `schema-definition.ts` | Schema 定义系统 | 类型安全的组件/页面 Schema、预置组件库、Schema 验证 |
| `01-form-engine.ts` | 表单引擎设计与实现 | 动态表单 Schema、校验引擎、字段联动、数据源绑定 |
| `02-drag-drop-builder.ts` | 拖拽构建器核心 | 画布节点系统、拖拽控制器、撤销重做、放置指示器算法 |
| `03-schema-driven-ui.ts` | JSON Schema 驱动 UI | Schema 解析器、UI 生成器（表单/表格/详情）、多视图生成 |
| `04-workflow-engine.ts` | 工作流引擎基础 | DAG 流程定义、状态机执行、审批节点、任务调度 |

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
