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

## 6. 文档站点工具深度对比

| 特性 | Docusaurus | VitePress | Starlight | Mintlify |
|------|-----------|-----------|-----------|----------|
| **构建工具** | Webpack / Rspack | Vite | Astro | 专有平台 |
| **框架** | React | Vue 3 | Astro 组件 | React |
| **搜索** | Algolia DocSearch | local / Algolia | Pagefind（内置） | 内置全文搜索 |
| **国际化** | ✅ 完整支持 | ✅ 完整支持 | ✅ 完整支持 | ✅ 完整支持 |
| **版本控制** | ✅ 多版本 | 插件实现 | ✅ 多版本 | ✅ 多版本 |
| **MDX 支持** | ✅ 原生 | ✅ 原生 | ✅ 原生 | ✅ 原生 |
| **API 文档** | 插件 | vitepress-plugin-api-docs | 插件 | OpenAPI 自动同步 |
| **部署方式** | 静态托管 | 静态托管 | 静态托管 | 云平台 / 自托管 |
| **TypeScript** | 配置支持 | 完全基于 TS | 完全基于 TS | 配置支持 |
| **启动速度** | 中等 | 极快（<300ms）| 快 | 快 |
| **适用场景** | 大型开源项目 | 中小型快速迭代 | Astro 生态项目 | 商业产品文档 |
| **代表用户** | React Native、Redux | Vue、Rollup、Vitest | Astro、Biome | Linear、Arc |

## 7. 代码示例：VitePress 配置与自定义主题

```typescript
// docs/.vitepress/config.ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'My Project Docs',
  description: 'A modern documentation site built with VitePress',

  lastUpdated: true,
  cleanUrls: true,

  // 多语言配置
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh'
    },
    en: {
      label: 'English',
      lang: 'en',
      link: '/en/'
    }
  },

  // 主题配置
  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          collapsed: false,
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' }
          ]
        },
        {
          text: '进阶',
          collapsed: false,
          items: [
            { text: '配置', link: '/guide/configuration' },
            { text: '部署', link: '/guide/deployment' }
          ]
        }
      ]
    },

    // Algolia 搜索
    search: {
      provider: 'algolia',
      options: {
        appId: 'YOUR_APP_ID',
        apiKey: 'YOUR_SEARCH_API_KEY',
        indexName: 'your_index'
      }
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/your-org/your-repo/edit/main/docs/:path'
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/your-repo' }
    ],

    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Your Organization'
    }
  },

  // Markdown 增强
  markdown: {
    lineNumbers: true,
    config: (md) => {
      // 自定义 Markdown 插件
      md.use(require('markdown-it-task-checkbox'))
    }
  },

  // Vite 配置
  vite: {
    resolve: {
      alias: {
        '@components': './.vitepress/components'
      }
    }
  }
})
```

```vue
<!-- docs/.vitepress/theme/Layout.vue — 自定义主题 -->
<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
</script>

<template>
  <Layout>
    <template #home-hero-info-after>
      <div class="custom-badge">
        <span v-if="frontmatter.beta" class="badge beta">Beta</span>
      </div>
    </template>

    <template #doc-footer-before>
      <div class="feedback-section">
        <p>Was this page helpful?
          <a :href="`https://github.com/your-org/issues/new?title=Feedback: ${frontmatter.title}`">
            Give us feedback
          </a>
        </p>
      </div>
    </template>
  </Layout>
</template>

<style>
.badge.beta {
  background: #f0ad4e;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
}
</style>
```

```yaml
# .github/workflows/docs.yml — CI/CD 自动部署
name: Deploy Docs
on:
  push:
    branches: [main]
    paths: ['docs/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run docs:build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/.vitepress/dist
```

## 8. 权威外部资源

- [VitePress 官方文档](https://vitepress.dev/)
- [Docusaurus 官方文档](https://docusaurus.io/)
- [Starlight 官方文档](https://starlight.astro.build/)
- [Mintlify 官方文档](https://mintlify.com/)
- [Diátaxis 文档框架](https://diataxis.fr/)
- [MDN — Writing Great Documentation](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines)
- [Write the Docs 社区](https://www.writethedocs.org/)
- [Google Technical Writing Course](https://developers.google.com/tech-writing)

## 9. 与相邻模块的关系

- **16-application-development**: 开发流程中的文档环节
- **60-developer-experience**: 文档作为开发者体验的核心
- **18-frontend-frameworks**: 组件文档与 Storybook
