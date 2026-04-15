# UI 组件库对比矩阵

> 最后更新：2026年4月

## 核心对比表

| 特性 | shadcn/ui | MUI | Ant Design | Chakra UI |
|------|-----------|-----|------------|-----------|
| **GitHub Stars** | 82k | 94k | 93k | 38k |
| **包大小** | - | 大 (~300KB+) | 大 (~500KB+) | 中 (~100KB) |
| **TypeScript 支持** | 🟢 原生 | 🟢 原生 | 🟢 原生 | 🟢 原生 |
| **定制性** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **主题系统** | CSS 变量 | sx 属性 | Less | CSS 变量 |
| **无障碍支持 (a11y)** | ✅ | ✅ | ✅ | ✅ |
| **暗色模式** | ✅ 内置 | ✅ | ✅ | ✅ |
| **服务端渲染 (SSR)** | ✅ | ✅ | ✅ | ✅ |

## 详细分析

### shadcn/ui

```bash
npx shadcn add button
```

- **定位**: Copy-paste 组件集合
- **优势**: 完全可控、无运行时依赖、Tailwind CSS 集成
- **劣势**: 需要手动维护组件代码
- **适用场景**: 需要高度定制的项目

### Material UI (MUI)

```bash
npm install @mui/material @emotion/react @emotion/styled
```

- **定位**: 企业级 Material Design 组件库
- **优势**: 组件丰富、文档完善、生态成熟
- **劣势**: 包体积大、定制较复杂
- **适用场景**: 中大型企业应用

### Ant Design

```bash
npm install antd
```

- **定位**: 企业级中后台 UI 解决方案
- **优势**: 组件最全面、设计规范完善、工具链丰富
- **劣势**: 包体积极大、设计风格固定
- **适用场景**: 中后台管理系统

### Chakra UI

```bash
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

- **定位**: 现代、可访问的组件库
- **优势**: 开发体验好、样式即属性、暗色模式简单
- **劣势**: 社区规模较小、组件数量中等
- **适用场景**: 快速开发、注重 DX 的项目

## 选型建议

| 场景 | 推荐 |
|------|------|
| 需要完全控制组件 | shadcn/ui |
| 中大型企业应用 | MUI |
| 中后台管理系统 | Ant Design |
| 快速原型开发 | Chakra UI |
| 注重包体积 | shadcn/ui + 按需加载 |
