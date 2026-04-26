# 设计系统 — 理论基础

## 1. 设计系统定义

设计系统是**可复用组件和标准的集合**，用于管理设计的一致性：

- **设计原则**: 指导设计决策的价值观
- **模式库**: 可复用的 UI 组件
- **样式指南**: 颜色、字体、间距等视觉规范
- **内容指南**: 文案语气、术语使用

## 2. 设计令牌（Design Tokens）

设计系统的原子单位：

```json
{
  "color": { "primary": "#007bff", "danger": "#dc3545" },
  "spacing": { "small": "4px", "medium": "8px", "large": "16px" },
  "fontSize": { "body": "16px", "heading": "24px" }
}
```

工具：Style Dictionary、Amazon Style Dictionary

## 3. 组件库工程化

- **Monorepo 结构**: 组件、主题、文档、工具分离
- **构建输出**: ESM、CJS、UMD 多格式
- **Tree Shaking**: 确保未使用组件被移除
- **类型定义**: 自动生成 .d.ts

## 4. 与相邻模块的关系

- **51-ui-components**: UI 组件的设计与实现
- **56-code-generation**: 基于令牌的代码生成
- **13-code-organization**: 大型项目的代码组织
