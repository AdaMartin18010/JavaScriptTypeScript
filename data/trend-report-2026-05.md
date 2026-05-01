# 📈 JSTS 生态趋势监测报告

> 生成时间: 2026-05-01 07:40:57
> 数据周期: 2025-01 至 2026-04
> 覆盖来源: State of JS 2025, Stack Overflow Developer Survey 2025, GitHub Octoverse 2025, npm trends, GitHub API

---

## 📊 概览

| 指标 | 数值 | 同比变化 |
|------|------|----------|
| TypeScript GitHub 排名 | **#1** | 首次超越 JS/Python |
| GitHub 全球开发者总数 | **1.8 亿+** | +10% YoY |
| GitHub 仓库总数 | **6.3 亿+** | — |
| AI 生成代码占比 | **29%** | +45% YoY |
| Edge Computing 市场 CAGR | **~28%** | — |

---

## 一、State of JavaScript 2025 关键发现

> 调查机构: Devographics | 受访者: 13,002 人 | 调查周期: 2025年9-11月
> [完整报告](https://stateofjs.com/en-US)

### 1.1 TypeScript 已"赢得"生态

- **40%** 的受访者现在**完全使用 TypeScript** 编写代码（2024年为34%，2022年为28%）
- **仅6%** 的开发者只使用纯 JavaScript
- Nuxt 核心团队负责人 Daniel Roe 总结：
  > "TypeScript has won. Not as a bundler, but as a language."
- Node.js v25.2.0 已将 TypeScript 类型剥离（type stripping）提升为稳定功能，可直接运行 `.ts` 文件

### 1.2 构建工具格局剧变

| 工具 | 使用率 | 满意度 | 趋势 |
|------|--------|--------|------|
| Webpack | 86% | 26% ↓ | 满意度从36%下降至26% |
| Vite | 84% | **98%** | 满意度碾压，即将在采用率上超越 Webpack |
| Turbopack | 28% | — | Vercel 赞助的 Rust 增量打包器，使用率仍低 |
| **Rolldown** | 10% | — | **从1%飙升至10%**，Rust 编写的 Rollup 替代品 |

- Rolldown 作为 Vite 未来默认打包器，2025年使用率增长 **900%**
- Daniel Roe 建议："2026 年是全面拥抱 Vite 工具链的一年"

### 1.3 前端框架稳定化

- **React**: 使用率 83.6%，但满意度下降，"框架疲劳"显著
- **Next.js**: 使用率 59%，但 17% 负面评价，开发者抱怨复杂度剧增和 Vercel 锁定
- **Astro**: 在元框架满意度中排名 **#1**，领先 Next.js 达 39 个百分点
- **Solid.js**: 连续第五年保持最高满意度
- 平均每位开发者职业生涯仅使用过 **2.6 个前端框架** — "频繁切换框架"的神话已破灭

### 1.4 后端运行时

| 运行时 | 使用率 | 变化 |
|--------|--------|------|
| Node.js | **90%** | — |
| Bun | **21%** | +4% YoY |
| Deno | **11%** | — |
| Cloudflare Workers | **12%** | 从1%暴增 |

---

## 二、Stack Overflow 2025 开发者调查亮点

> 调查机构: Stack Overflow | 受访者: 49,009 人（来自177个国家）| 调查周期: 2025年5-6月
> [完整报告](https://survey.stackoverflow.co/2025)

### 2.1 编程语言排名

| 排名 | 语言 | 使用率 | 同比变化 |
|------|------|--------|----------|
| 1 | JavaScript | **66%** | — |
| 2 | HTML/CSS | **61.9%** | — |
| 3 | SQL | **58.6%** | +7.5% |
| 4 | Python | **57.9%** | **+7%** |
| 5 | Bash/Shell | **48.7%** | +15% |
| 6 | **TypeScript** | **43.6%** | +2.5% |

- Python 以 **7个百分点** 的同比增长成为最大赢家，驱动力来自 AI/ML 爆发
- Rust  admiration（最受赞赏语言）连续第九年保持 **72%**
- TypeScript 在"使用 AI 工具的专业开发者"群体中采用率高达 **51.4%**

### 2.2 AI 工具采用率

| AI 工具 | 使用率 | 趋势 |
|---------|--------|------|
| ChatGPT | 60% | ↓ 从68%下降 |
| **Claude** | **44%** | ↑ 从22%翻倍 |
| **Cursor** | **26%** | ↑ 从11%翻倍有余 |
| GitHub Copilot | — | 80% 新开发者在首周使用 |
| Google Gemini | 35.3% | — |

- **85%** 的开发者现在定期使用 AI 工具
- **91%** 的 AI/ML 职位要求 Python 作为主要语言
- **84%** 的开发者使用 AI 编码辅助工具（2024年为76%）

### 2.3 数据库与云

- **Redis** 使用率同比增长 **+8%**
- **Docker** 使用率同比暴增 **+17个百分点**，成为近乎通用的工具
- **AWS** 使用率 48%（托管服务首选）
- **Vercel** 使用率 44%（第二大托管平台）

---

## 三、GitHub Octoverse 2025 JS/TS 趋势

> 发布机构: GitHub | 发布日期: 2026年2月
> [完整报告](https://github.blog/news-insights/octoverse/)

### 3.1 TypeScript 首次登顶

- **2025年8月**，TypeScript 首次超越 Python 和 JavaScript，成为 GitHub 上使用最多的语言
- TypeScript 贡献者年增长 **+66%**（增加超过 **100 万**贡献者）
- JavaScript 贡献者增长 **+24.79%**
- Python 贡献者增长 **+48.78%**
- 两者相差仅约 **42,000** 名贡献者

### 3.2 为什么 TypeScript 在 AI 时代胜出？

GitHub 官方解释：

> "As AI code generation becomes the default way to write code, developers naturally gravitate towards languages that offer better determinism and less ambiguity. TypeScript gives AI the structure it needs to write higher-quality code."

- 研究表明 TypeScript 在 AI 辅助开发中：**90% 更少的 ID 混淆错误**，**3 倍更快的 LLM 收敛速度**
- 2025年学术研究发现：**94%** 的 LLM 生成编译错误源于类型检查失败
- 所有主流框架（Next.js, Astro, SvelteKit, Angular, Remix）默认生成 TypeScript 代码库

### 3.3 AI 原生开发现状

- **1.8 亿+** 全球开发者
- **10 亿+** 年度提交
- **6300 万+** 仓库
- **110 万+** 公开仓库采用 LLM SDK
- AI 生成项目中 Shell 脚本使用同比增长 **206%**

---

## 四、2025-2026 新兴工具

### 4.1 Rolldown — Vite 的未来打包器

| 属性 | 详情 |
|------|------|
| GitHub Stars | ~10,500 |
| 状态 | Release Candidate (RC) |
| 组织 | VoidZero Inc. |
| 定位 | Rust 编写，Rollup API 兼容，esbuild 范围 |
| 采用率 | State of JS 2025 显示从 1% → 10% |
| 核心优势 | 为 Vite 提供原生速度的生产构建 |

- 使用 Oxc 作为底层解析器、转换器和 sourcemap 支持
- 目标是在 Vite 6+ 中成为默认生产打包器

### 4.2 Oxc — JavaScript 氧化编译器

| 属性 | 详情 |
|------|------|
| GitHub Stars | ~15,500 |
| 组织 | VoidZero Inc. |
| 定位 | 高性能 JS/TS 工具集合（Rust） |
| 核心组件 | Oxlint（50-100x ESLint 速度）、Oxfmt（30x Prettier 速度）、Parser（3x SWC 速度）、Transformer、Minifier |

- **Oxlint**: 已生产可用，被 Preact、Shopify、ByteDance、Shopee 采用
- **Oxfmt**: Beta 阶段，比 Biome 快 3 倍
- 为 Rolldown 和 Nuxt 提供底层解析基础设施
- 支持 TypeScript 类型感知 Linting（由 tsgo 驱动）

### 4.3 Biome — 统一的 JS 工具链

| 属性 | 详情 |
|------|------|
| GitHub Stars | ~18,000 |
| 状态 | v2.0 Beta |
| 定位 | 一体化 linter + formatter（Rust） |
| 周下载量 | ~420 万 |

- 作为 Rome 的精神继承者，Biome 在 2025-2026 年稳定成长
- 提供零配置的 ESLint + Prettier 替代方案
- 社区正在从早期"重写疲劳"转向务实采用

### 4.4 tsgo / Project Corsa — TypeScript 的 Go 移植

| 属性 | 详情 |
|------|------|
| 组织 | Microsoft TypeScript 团队 |
| 发布时间 | 2025年11月预览 |
| 性能提升 | **~10 倍** 类型检查速度 |
| 状态 | 原生预览版早期测试 |

- Microsoft 将 TypeScript 编译器和语言服务移植到 Go
- 大幅改善大型代码库的类型检查速度和内存占用
- 预计 2026 年下半年进入更广泛测试

### 4.5 新兴工具速览

| 工具 | 类型 | Stars | 亮点 |
|------|------|-------|------|
| Rspack | Webpack 替代品 (Rust) | ~10,500 | 字节跳动出品，企业级 drop-in 兼容 |
| Farm | 构建工具 (Rust) | ~5,000 | 无打包开发，WASM 友好 |
| Moon | Monorepo 管理 (Rust) | ~8,000 | 多语言工作区支持 |
| dprint | 格式化平台 (Rust) | ~6,500 | Svelte/Astro 插件生态 |
| ast-grep | 结构化搜索替换 | ~4,500 | Tree-sitter + YAML 规则 |

---

## 五、AI 编程助手采用率

### 5.1 采用率概览

| 工具 | 2024 | 2025 | 变化 |
|------|------|------|------|
| ChatGPT | 68% | 60% | -8% |
| Claude | 22% | **44%** | **+22%** |
| Cursor | 11% | **26%** | **+15%** |
| GitHub Copilot | — | ~55% | 80% 新用户首周使用 |

### 5.2 对开发工作流的影响

- **29%** 的代码由 AI 生成（2024年为20%，+45% YoY）
- **30%** 的开发者报告手写代码量比上一年减少
- **51.4%** 使用 AI 工具的开发者采用 TypeScript（vs 普通专业开发者 48.8%）
- AI 原生编辑器（Cursor, Zed）合计超过 **4,100** 名用户选择
- 从"代码补全"到"自主 Agent"的转变加速：
  - GitHub Copilot 推出自主 Agent 模式
  - Claude Code 具备完整系统访问权限
  - MCP (Model Context Protocol) 成为 AI 与开发基础设施交互的标准

### 5.3 开发技能转变

> "框架选择的重要性正在降低，当 AI 能流畅处理语法时，重要的是知道生成的代码是否安全、可访问、架构合理。"

- 核心技能从语法知识转向：系统设计、代码审查、架构理解
- TypeScript 类型系统成为 AI "护栏"，减少幻觉生成

---

## 六、Edge Computing 增长指标

### 6.1 市场规模与增长

| 指标 | 数值 | 来源 |
|------|------|------|
| 全球云计算市场 (2025) | $6,800 亿 | 行业分析 |
| 预计全球云计算市场 (2026) | $9,470 亿 | 行业分析 |
| Edge & Hybrid 市场 CAGR | **~28%** | 行业分析 |
| Edge 函数覆盖节点 | **300+ 全球位置** | Cloudflare, Vercel |
| 相对传统 serverless 成本节省 | **70%** | Zylos Research 2026 |

### 6.2 主流平台对比

| 平台 | 冷启动 | 内存限制 | 执行时间 | 特点 |
|------|--------|----------|----------|------|
| Cloudflare Workers | 亚毫秒 | 128MB | 30s (付费) | 零出口费用，300+ 城市 |
| Vercel Edge Functions | 亚毫秒 | 128MB | 30s | Next.js 原生集成 |
| Deno Deploy | 亚毫秒 | — | 50ms CPU (免费) / 200ms (付费) | Web 标准优先 |

### 6.3 Edge 采用趋势

- **Cloudflare Workers** 在 State of JS 2025 中使用率从 **1% → 12%**
- Edge 函数已从"酷炫演示"变为"现代 Web 默认架构"
- 典型 Edge 场景：认证、A/B 测试、个性化、API 路由、地理位置、速率限制
- **80%** 的 AI 推理正在向 Edge 和设备端迁移
- WebAssembly 标准化推动 Edge 可移植性

### 6.4 Edge 数据库兴起

| 数据库 | 提供商 | 特点 |
|--------|--------|------|
| Cloudflare D1 | Cloudflare | SQLite 兼容，全球复制 |
| Turso | libSQL | Edge 原生 SQLite 分支 |
| PlanetScale | PlanetScale | MySQL 兼容，无服务器 |
| Neon | Neon | 无服务器 PostgreSQL |
| Supabase | Supabase | PostgreSQL 即服务 |

---

## 七、关键趋势总结

### 7.1 2025-2026 十大趋势

1. **TypeScript 成为 GitHub #1 语言** — AI 驱动类型安全需求
2. **Vite 超越 Webpack** — 满意度 98% vs 26%，迁移潮加速
3. **Rust 工具链统治构建层** — Rolldown, Oxc, Rspack, Biome 全面崛起
4. **AI 编码成为默认** — 29% 代码 AI 生成，Agent 模式取代补全
5. **Edge 成为默认架构** — 300+ 节点，70% 成本节省
6. **框架战争结束** — 生态稳定，竞争转向元框架和工具链
7. **MCP 协议标准化** — AI 与外部工具/数据库/部署管道的统一接口
8. **tsgo 预示编译器革命** — 10x 类型检查速度提升
9. **Cloudflare Workers 爆发** — 使用率从 1% 跃升至 12%
10. **开发者幸福感停滞** — 连续五年维持在 3.8/5，"疲劳"成为关键词

### 7.2 选型建议矩阵

| 场景 | 2026 推荐栈 |
|------|-------------|
| 内容型网站 (博客/文档/营销) | Astro + Vite + Edge DB |
| 交互式 Web 应用 | React/Next.js + Vite + TypeScript |
| 性能关键项目 | Svelte 5 + SvelteKit |
| Vue 生态团队 | Nuxt + Vite + TypeScript |
| 全栈 API | Hono/Elysia + Drizzle + Edge |
| AI Agent 应用 | Mastra + MCP SDK + Vercel |

---

> 由 scripts/trend-monitor.js 自动生成，数据人工校验于 2026-05-01
> 数据来源: npm registry, GitHub API, State of JS 2025, Stack Overflow Survey 2025, GitHub Octoverse 2025
