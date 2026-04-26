# 文档工程 — 理论基础

## 1. 文档即代码（Docs as Code）

将文档纳入软件开发流程：

- 使用 Markdown 编写，版本控制管理
- 代码审查流程审查文档变更
- CI/CD 自动构建和发布文档站点

## 2. 文档类型

| 类型 | 受众 | 内容 | 示例 |
|------|------|------|------|
| **教程** | 初学者 |  step-by-step 引导 | Getting Started |
| **指南** | 使用者 | 特定任务的详细说明 | Deployment Guide |
| **参考** | 开发者 | API 签名、配置选项 | API Reference |
| **解释** | 学习者 | 概念、设计决策说明 | Architecture Overview |
| **故障排除** | 运维者 | 常见问题和解决方案 | FAQ / Troubleshooting |

## 3. API 文档生成

- **JSDoc / TSDoc**: 代码注释生成文档
- **OpenAPI / Swagger**: REST API 规范，生成交互式文档
- **TypeDoc**: TypeScript 项目的文档生成器

## 4. 文档站点工具

- **VitePress / Docusaurus**: 静态站点生成器，支持搜索、国际化
- **MDX**: Markdown + JSX，在文档中嵌入交互式组件
- **Storybook**: 组件文档与交互式展示

## 5. 文档质量度量

- **完整性**: 所有公共 API 都有文档
- **准确性**: 文档与代码行为一致
- **可读性**: Flesch 阅读易度分数
- **时效性**: 最后更新时间

## 6. 与相邻模块的关系

- **16-application-development**: 开发流程中的文档环节
- **60-developer-experience**: 文档作为开发者体验的核心
- **18-frontend-frameworks**: 组件文档与 Storybook
