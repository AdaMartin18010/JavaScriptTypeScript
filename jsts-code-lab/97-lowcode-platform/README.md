# 低代码平台模块

> 模块编号: 97-lowcode-platform
> 复杂度: ⭐⭐⭐⭐⭐ (专家级)
> 目标读者: 平台工程师、可视化开发工具开发者

---

## 模块概述

本模块实现低代码平台的核心引擎：通过配置化方式构建应用，涵盖组件库管理、可视化设计器、代码生成和工作流编排。

## 核心内容

| 文件 | 主题 | 覆盖范围 |
|------|------|----------|
| `lowcode-engine.ts` | 低代码引擎 | 组件库、页面设计器（含撤销重做）、React 代码生成、工作流引擎、表达式引擎 |
| `schema-definition.ts` | Schema 定义系统 | 类型安全的组件/页面 Schema、预置组件库、Schema 验证、React 代码生成 |

## 架构层次

```
表现层    → 组件库（ComponentLibrary）+ 属性面板（PropertySchema）
设计层    → 页面设计器（PageDesigner）+ 撤销重做历史栈
生成层    → React/Vue 代码生成器（CodeGenerator）
逻辑层    → 工作流引擎（WorkflowEngine）+ 表达式引擎（ExpressionEngine）
数据层    → 数据源定义（DataSource）+ 变量系统（Variable）
```

## 关键概念

- **Schema-First**: 所有组件和页面均由 Schema 定义驱动，实现类型安全
- **Undo/Redo**: 基于深拷贝的历史栈，支持 50 步操作回溯
- **代码生成**: 将可视化配置转换为可运行的 React 组件代码
- **工作流**: 基于 DAG 的审批/业务流程编排引擎

## 关联模块

- `56-code-generation` — AST 转换、OpenAPI 客户端生成、模板引擎
- `02-design-patterns` — 组合模式、访问者模式在低代码中的应用
- `docs/platforms/DATA_VISUALIZATION.md` — 数据可视化组件

## 参考资源

- [React DnD](https://react-dnd.github.io/react-dnd/) — 拖拽实现参考
- [Blockly](https://developers.google.com/blockly) — Google 可视化编程工具
