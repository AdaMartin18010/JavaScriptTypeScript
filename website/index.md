---
layout: home

hero:
  name: "Awesome JS/TS"
  text: "Ecosystem"
  tagline: 精心策划的 JavaScript/TypeScript 生态系统资源列表，涵盖框架、工具、库和最佳实践
  image:
    src: /hero-logo.svg
    alt: Awesome JS/TS Ecosystem
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 浏览分类
      link: /categories/frontend-frameworks
    - theme: alt
      text: GitHub
      link: https://github.com/yourusername/awesome-jsts-ecosystem

features:
  - icon: 🖥️
    title: 前端框架
    details: React、Vue、Angular、Svelte、Solid 等主流框架全面覆盖，包含生态库和选型建议
    link: /categories/frontend-frameworks
  - icon: 🎨
    title: UI 组件库
    details: shadcn/ui、Ant Design、MUI、Chakra 等现代组件库，助力快速构建界面
    link: /categories/ui-component-libraries
  - icon: ⚡
    title: 构建工具
    details: Vite、Webpack、Rollup、esbuild 等构建工具对比与最佳实践
    link: /categories/build-tools
  - icon: 📊
    title: 数据可视化
    details: D3.js、ECharts、Chart.js、Three.js 等可视化方案
    link: /categories/data-visualization
  - icon: 🗂️
    title: 状态管理
    details: Zustand、Redux、Jotai、Pinia 等状态管理方案深度解析
    link: /categories/state-management
  - icon: 🛠️
    title: 开发工具
    details: ESLint、Prettier、Vitest、Playwright 等工程化工具
    link: /categories/linting-formatting
---

<script setup>
import { ref, computed } from 'vue'

// 统计数据
const stats = ref({
  libraries: 213,
  categories: 20,
  contributors: 5,
  lastUpdated: '2026-04'
})

// 最新更新
const updates = ref([
  { date: '2026-04', tag: '发布', content: '🚀 v4.0 发布：JS/TS 语义模型全面升级，对齐 Stanford/MIT/CMU/Berkeley/UW 学术课程' },
  { date: '2026-04', tag: '新增', content: '新增编译器/转译器语义对比矩阵（tsc/Babel/SWC/esbuild/Rolldown/tsgo）' },
  { date: '2026-04', tag: '新增', content: '新增 TypeScript Compiler API 工程实践代码示例（AST 提取、Transformer、.d.ts 生成）' },
  { date: '2026-04', tag: '更新', content: '更新 ECMAScript 2025/2026 与 TypeScript 7.0 (Project Corsa) 前沿语义分析' },
  { date: '2026-04', tag: '更新', content: 'jsts-code-lab 代码实验室扩展至 83 个模块，744+ 个 TypeScript 代码文件' },
])
</script>

## 📊 站点统计

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-number">{{ stats.libraries }}+</div>
    <div class="stat-label">收录库</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">{{ stats.categories }}</div>
    <div class="stat-label">分类</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">{{ stats.contributors }}+</div>
    <div class="stat-label">贡献者</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">{{ stats.lastUpdated }}</div>
    <div class="stat-label">最后更新</div>
  </div>
</div>

## 🗂️ 分类浏览

<div class="category-grid">
  <a href="/categories/frontend-frameworks" class="category-card">
    <div class="icon">🖥️</div>
    <h3>前端框架</h3>
    <p>React、Vue、Angular、Svelte、Solid 及生态</p>
  </a>
  <a href="/categories/ui-component-libraries" class="category-card">
    <div class="icon">🎨</div>
    <h3>UI 组件库</h3>
    <p>shadcn/ui、Ant Design、MUI、Chakra 等</p>
  </a>
  <a href="/categories/build-tools" class="category-card">
    <div class="icon">⚡</div>
    <h3>构建工具</h3>
    <p>Vite、Webpack、Rollup、esbuild 对比</p>
  </a>
  <a href="/categories/data-visualization" class="category-card">
    <div class="icon">📊</div>
    <h3>数据可视化</h3>
    <p>D3.js、ECharts、Chart.js、Three.js</p>
  </a>
  <a href="/categories/state-management" class="category-card">
    <div class="icon">🗂️</div>
    <h3>状态管理</h3>
    <p>Zustand、Redux、Jotai、Pinia</p>
  </a>
  <a href="/categories/routing" class="category-card">
    <div class="icon">🛣️</div>
    <h3>路由</h3>
    <p>React Router、TanStack Router、Vue Router</p>
  </a>
  <a href="/categories/ssr-meta-frameworks" class="category-card">
    <div class="icon">🎭</div>
    <h3>SSR/Meta框架</h3>
    <p>Next.js、Nuxt、Remix、Astro</p>
  </a>
  <a href="/categories/orm-database" class="category-card">
    <div class="icon">🗄️</div>
    <h3>ORM/数据库</h3>
    <p>Prisma、Drizzle、TypeORM、Mongoose</p>
  </a>
  <a href="/categories/testing" class="category-card">
    <div class="icon">🧪</div>
    <h3>测试</h3>
    <p>Vitest、Jest、Playwright、Cypress</p>
  </a>
  <a href="/categories/backend-frameworks" class="category-card">
    <div class="icon">🔐</div>
    <h3>后端框架</h3>
    <p>Express、Fastify、NestJS、Hono</p>
  </a>
</div>

## 🔔 最新更新

<ul class="update-list">
  <li v-for="update in updates" :key="update.content">
    <span class="date">{{ update.date }}</span>
    <span class="tag">{{ update.tag }}</span>
    <span>{{ update.content }}</span>
  </li>
</ul>

<div style="text-align: center; margin-top: 3rem;">
  <a href="/guide/getting-started" class="VPButton medium brand">开始探索 →</a>
</div>
