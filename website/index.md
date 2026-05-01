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
      link: https://github.com/AdaMartin18010/JavaScriptTypeScript

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
    details: Vite、Rolldown、Rspack、esbuild 等构建工具对比与最佳实践
    link: /categories/build-tools
  - icon: 📊
    title: 数据可视化
    details: D3.js、ECharts、Chart.js、Three.js 等可视化方案
    link: /categories/data-visualization
  - icon: 🗂️
    title: 状态管理
    details: Zustand、Redux、Jotai、Pinia 等状态管理方案深度解析
    link: /categories/state-management
  - icon: 🦀
    title: Rust 工具链
    details: Rolldown、Oxc、Oxlint、Rspack、Biome 等 Rust 编写的高性能工具链
    link: /categories/rust-toolchain
  - icon: 🤖
    title: AI 与前沿
    details: AI-Native 开发、MCP 协议、Vercel AI SDK、Mastra、Transformers.js
    link: /categories/ai-agent-infrastructure
  - icon: 📱
    title: 跨平台开发
    details: React Native、Expo、Tauri、Electron、WebAssembly 跨平台方案
    link: /categories/mobile-development
  - icon: 🛠️
    title: 开发工具
    details: ESLint、Prettier、Vitest、Playwright、Oxlint 等工程化工具
    link: /categories/linting-formatting
  - icon: 🌐
    title: Edge 与部署
    details: Cloudflare Workers、Vercel、Docker、Serverless 边缘计算与部署平台
    link: /categories/deployment-hosting
---

<script setup>
import { ref, computed } from 'vue'

// 统计数据
const stats = ref({
  libraries: 280,
  categories: 33,
  contributors: 8,
  lastUpdated: '2026-05'
})

// 最新更新
const updates = ref([
  { date: '2026-05', tag: '发布', content: '🚀 v5.1 发布：全面梳理2026十大趋势，覆盖语言/编译/构建/运行时/框架/架构全栈' },
  { date: '2026-05', tag: '新增', content: '新增 Rust 工具链专题（Rolldown/Oxc/Biome/Rspack）、AI-Native开发、Edge-First架构' },
  { date: '2026-05', tag: '新增', content: '新增浏览器API 2026、桌面开发、实时通信、AI/ML in JS等8个分类' },
  { date: '2026-05', tag: '更新', content: '更新所有对比矩阵至2026 Q2数据：Vite满意度98%、Cloudflare Workers 12%、TS登顶GitHub' },
  { date: '2026-05', tag: '重构', content: '网站架构升级：VitePress 1.6 + Rolldown构建、Oxlint统一、Node 24 LTS' },
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
  <a href="/categories/rust-toolchain" class="category-card">
    <div class="icon">🦀</div>
    <h3>Rust 工具链</h3>
    <p>Rolldown、Oxc、Biome、Rspack</p>
  </a>
  <a href="/categories/ai-agent-infrastructure" class="category-card">
    <div class="icon">🤖</div>
    <h3>AI / ML</h3>
    <p>MCP、Transformers.js、Mastra、Vercel AI</p>
  </a>
  <a href="/categories/webassembly" class="category-card">
    <div class="icon">🔷</div>
    <h3>WebAssembly</h3>
    <p>WASM 2.0、WASI、Rust→WASM、Edge WASM</p>
  </a>
  <a href="/categories/mobile-development" class="category-card">
    <div class="icon">📱</div>
    <h3>移动端</h3>
    <p>React Native、Expo、Flutter、Capacitor</p>
  </a>
  <a href="/categories/desktop-development" class="category-card">
    <div class="icon">💻</div>
    <h3>桌面端</h3>
    <p>Tauri v2、Electron、Flutter Desktop</p>
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
