# Svelte 5 Dashboard Analytics Lab

> **Learning Level**: 5–6 (Advanced — Actions, Data Binding, Real-time Updates, Component Integration)

一个基于 **Svelte 5** + **SvelteKit** + **D3.js** 的数据可视化 Dashboard，演示现代响应式数据面板的完整构建方式。

---

## 🚀 运行方式

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行单元测试
npm run test

# 运行 E2E 测试
npm run test:e2e

# Docker 构建
docker build -t svelte5-dashboard .
docker run -p 3000:3000 svelte5-dashboard
```

---

## 📚 学习要点

### Svelte 5 Runes
- **`$state`** — 声明组件与模块级响应式状态
- **`$derived`** — 派生计算（KPI 汇总、过滤后数据）
- **`$effect`** — 副作用同步（图表重绘、标题更新）
- **`$props`** — 带类型约束的组件 Props

### Svelte Actions
- **`use:resizeObserver`** — 自定义 Action 监听容器尺寸，驱动 D3 图表响应式重绘
- **`use:clickOutside`** — 扩展 Action 模式（表格下拉菜单关闭）

### Snippets
- **`{#snippet}` / `{@render}`** — 可复用模板片段（表格行、空状态、加载骨架）

### 数据流与实时更新
- **`.svelte.ts` Store** — 使用 Runes 编写的跨组件数据存储
- **模拟实时数据** — `setInterval` 推送新数据点，驱动全链路响应式更新

### D3.js 集成
- **Svelte Action + D3** — 在 `use:` 钩子中初始化 D3，通过 `$effect` 响应数据变更
- **响应式 SVG** — 监听容器尺寸，自动重计算比例尺与布局

### 测试
- **Vitest** — 组件级单元测试（Store 逻辑、工具函数）
- **Playwright** — E2E 场景测试（页面渲染、交互、图表存在性）

---

## 🏗 项目结构

```
.
├── src/
│   ├── app.html                 # SvelteKit HTML 模板
│   ├── app.d.ts                 # 全局类型声明
│   ├── routes/
│   │   ├── +layout.svelte       # Dashboard 布局（侧边栏 + 暗色主题）
│   │   └── +page.svelte         # Dashboard 首页
│   └── lib/
│       ├── components/
│       │   ├── KpiCard.svelte   # KPI 卡片
│       │   ├── LineChart.svelte # 折线图（D3 + Action）
│       │   ├── BarChart.svelte  # 柱状图
│       │   └── DataTable.svelte # 数据表格（排序/分页/搜索）
│       ├── actions/
│       │   └── resizeObserver.ts # 尺寸监听 Action
│       ├── stores/
│       │   └── dataStore.ts     # 数据存储（Runes）
│       └── utils/
│           └── formatters.ts    # 数字/日期格式化
├── tests/
│   ├── dashboard.spec.ts        # Vitest 单元测试
│   └── e2e/
│       └── dashboard.e2e.spec.ts # Playwright E2E
├── Dockerfile
├── package.json
├── vite.config.ts
├── svelte.config.js
└── tsconfig.json
```

---

## 🎯 核心特性

| 特性 | 实现方式 |
|------|----------|
| 暗色主题 | CSS 变量 + `:global` 主题切换 |
| 响应式图表 | `resizeObserver` Action + D3 比例尺重算 |
| 实时数据 | `dataStore.ts` 定时器 + `$effect` 驱动 UI |
| KPI 卡片 | `$derived` 汇总统计 + 趋势箭头 |
| 数据表格 | `{#each}` + `$state` 排序/分页/搜索 |
| 可访问性 | ARIA 标签、键盘导航、焦点管理 |

---

## 📄 License

MIT
