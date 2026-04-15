# 国际权威 JS/TS 生态资源报告

> 更新时间：2024-2025年度综合报告
>
> 本文档汇总国际权威机构的 JavaScript/TypeScript 生态调研数据，为技术选型提供数据支撑。

---

## 📊 2024-2025 JS/TS 生态趋势摘要

### 核心趋势速览

| 趋势领域 | 关键变化 | 影响评级 |
|---------|---------|---------|
| **语言格局** | TypeScript 首次超越 JavaScript 成为 GitHub 最活跃语言 | ⭐⭐⭐⭐⭐ |
| **前端框架** | React 稳固，Svelte/Solid 满意度领先，框架战争趋于平静 | ⭐⭐⭐⭐ |
| **构建工具** | Vite 即将超越 webpack，Rust 工具链兴起 | ⭐⭐⭐⭐⭐ |
| **测试框架** | Playwright 快速崛起，Vitest 挑战 Jest | ⭐⭐⭐⭐ |
| **CSS 方案** | Tailwind 超越 Bootstrap，原生 CSS 能力增强 | ⭐⭐⭐⭐ |
| **AI 集成** | 29% 代码由 AI 生成，AI 辅助开发成为主流 | ⭐⭐⭐⭐⭐ |

---

## 1. State of JavaScript 2024/2025

### 来源链接

- **官方站点**: <https://stateofjs.com/>
- **2024 完整报告**: <https://2024.stateofjs.com/>
- **方法论**: 由 Devographics 组织，超过 13,002 名开发者参与（2025年9-11月）

### 关键发现摘要

#### 1.1 前端框架满意度

| 框架 | 使用率 | 满意度 | 趋势 |
|-----|-------|-------|-----|
| React | 82% | 76% | 稳定，主导地位 |
| Vue | 51% | 87% | 稳定 |
| Angular | 50% | 54% | 略有下降 |
| Svelte | 26% | 88% | 快速上升 |
| Solid | ~10% | 90% | 连续5年满意度第一 |

> **关键洞察**: 开发者平均整个职业生涯只使用 2.6 个前端框架，"框架跳跃"的神话已结束。

#### 1.2 元框架（Meta-Frameworks）

- **Astro**: 满意度领先 Next.js 39 个百分点，标志着向内容优先架构的转变
- **Next.js**: 使用率最高但满意度有争议
- **SvelteKit**: 与 Svelte 同步增长

#### 1.3 构建工具使用情况

| 工具 | 使用率 | 满意度 (净得分) | 趋势 |
|-----|-------|----------------|-----|
| webpack | 86.4% | +14% / -37% = **-23** | 被逐步替代 |
| Vite | 84.4% | +56% / -1% = **+55** | 即将超越 webpack |
| Rollup | - | 稳定 | 基础工具 |
| Rspack | - | 新兴 | Rust 重写 |

> **满意度差距**: Vite 与 webpack 的满意度差距达 **78 个百分点**

#### 1.4 测试框架趋势

| 框架 | 使用率变化 | 满意度 | 备注 |
|-----|-----------|-------|-----|
| Jest | 稳定 | 高 | 单元测试标准 |
| Playwright | +14% YoY | 94% 留存率 | 增长最快 |
| Cypress | 持平 | 下降 | 被 Playwright 追赶 |
| Vitest | +14% YoY | 高 | Vite 生态原生 |
| Selenium | 下降 | - | 被标记为 Hold |

#### 1.5 AI 开发现状

- **29%** 的代码由 AI 生成（2025年底数据）
- 同比增长 **45%**
- **76%** 的开发者正在使用或计划使用 AI 工具
- 仅 **43%** 的开发者信任 AI 工具的准确性

### 对库选择的指导意义

1. **框架选择**: React 仍是安全选择，但 Svelte/Solid 提供更好 DX
2. **构建工具**: 新项目优先选择 Vite，webpack 仅用于遗留项目
3. **测试策略**: E2E 测试首选 Playwright，单元测试考虑 Vitest（Vite 项目）或 Jest
4. **AI 准备**: 评估 AI 辅助开发工具，但保持代码质量审查

---

## 2. State of CSS 2024

### 来源链接

- **官方站点**: <https://stateofcss.com/>
- **2024 完整报告**: <https://2024.stateofcss.com/>
- **参与规模**: 9,704 名开发者，来自 20+ 国家

### 关键发现摘要

#### 2.1 CSS 框架使用情况

| 框架 | 使用率排名 | 趋势 |
|-----|-----------|-----|
| Tailwind CSS | #1 | 已超越 Bootstrap |
| Bootstrap | #2 | 下降 |
| PureCSS | - | 高留存率 |
| Panda CSS | - | 最受关注 |

> **重要发现**: "不使用 CSS 框架"的选项排名第 13，原生 CSS 能力增强导致部分开发者放弃框架

#### 2.2 CSS 新特性采用

| 特性 | 使用率 | 关注度 |
|-----|-------|-------|
| CSS Filter Effects | 最高 | - |
| `:has()` 伪类 | 高 | 颠覆性特性 |
| Cascade Layers | 18.7% | 中等 |
| Container Queries | 增长中 | 高 |
| Anchor Positioning | 4.8% | 上升 |
| `@scope` | 4.8% | 新兴 |

#### 2.3 CSS 预/后处理器

- **Sass**: 仍占主导
- **PostCSS**: 广泛使用
- **不使用预处理器**: 19% 的受访者选择纯 CSS

#### 2.4 最期待的 CSS 特性

1. **Mixins** - CSS 函数和 mixins 草案已发布
2. **Conditional Logic** - `if()` 条件已加入 CSS Values Module Level 5
3. **Masonry Layout** - 两种竞争提案正在推进

### 对库选择的指导意义

1. **CSS 框架**: Tailwind CSS 是新项目首选，但考虑原生 CSS 新特性
2. **布局方案**: 优先学习 Container Queries 和 `:has()`，减少 JavaScript 依赖
3. **样式架构**: 考虑 Cascade Layers 管理复杂样式

---

## 3. Stack Overflow Developer Survey 2024

### 来源链接

- **官方报告**: <https://survey.stackoverflow.co/2024/>
- **技术板块**: <https://survey.stackoverflow.co/2024/technology>
- **参与规模**: 超过 65,000 名开发者

### 关键发现摘要

#### 3.1 最喜爱的编程语言

| 语言 | 使用率 | 最受喜爱 | 备注 |
|-----|-------|---------|-----|
| JavaScript | 62.3% | - | 连续12年最受欢迎 |
| HTML/CSS | 52.9% | - | 基础技术 |
| Python | 51% | 最渴望使用 | 数据/AI 主导 |
| TypeScript | - | - | 快速增长 |
| Rust | - | 83% 最受赞赏 | 连续领先 |

#### 3.2 最喜爱的 Web 框架和技术

| 技术 | 使用率 | 备注 |
|-----|-------|-----|
| Node.js | 40.8% | 峰值 51%（2020年） |
| React | 高 | 与 Node.js 配合使用 |
| Next.js | 34% | React 用户首选 |
| Svelte | 73% 留存率 | Stack Overflow 自家采用 |

#### 3.3 数据库排名

| 数据库 | 使用率 | 趋势 |
|-------|-------|-----|
| PostgreSQL | 49% | 连续两年第一 |
| MySQL | 40.3% | 稳定 |
| SQLite | 33.1% | 上升 |

#### 3.4 开发工具

| 工具 | 使用率 | 备注 |
|-----|-------|-----|
| Visual Studio Code | 73.6% | 主导 IDE |
| Docker | 53.9% | 最受赞赏 (78%) |
| npm | 49.6% | 新手首选 |
| Vite | 19.9% | 快速增长 |

#### 3.5 云平台

| 平台 | 使用率 | 趋势 |
|-----|-------|-----|
| AWS | 48% | 稳定 |
| Azure | 28% | 上升 (+2%) |
| Google Cloud | 25% | 上升 (+1%) |
| Hetzner | - | 最受赞赏 (75%) |

#### 3.6 AI 工具采用

- **76%** 的开发者正在使用或计划使用 AI 工具（vs 2023年 70%）
- **43%** 信任 AI 结果
- **31%** 对 AI 持怀疑态度
- **70%** 不认为 AI 会威胁工作

### 对库选择的指导意义

1. **技术栈**: JavaScript/TypeScript + Node.js + PostgreSQL 是主流选择
2. **工具链**: VS Code + Docker 是标准配置
3. **云服务**: AWS 仍是默认选择，但 Azure/Google Cloud 在增长
4. **学习路径**: Python 是最渴望学习的语言

---

## 4. GitHub Octoverse 2024/2025

### 来源链接

- **2024 报告**: <https://github.blog/news-insights/octoverse/octoverse-2024/>
- **2025 报告**: <https://github.blog/news-insights/octoverse/octoverse-a-new-developer> joins-github-every-second-as-ai-leads-typescript-to-1/

### 关键发现摘要

#### 4.1 编程语言趋势（2025年里程碑）

| 语言 | GitHub 排名 | 同比增长 | 说明 |
|-----|-----------|---------|-----|
| TypeScript | **#1**（首次） | +78% | 超越 Python 和 JavaScript |
| Python | #2 | +53% | AI/数据科学主导 |
| JavaScript | #3 | +15% | 基础语言，增长放缓 |
| Java | #4 | +9% | 企业稳定 |
| C++ | #5 | +12% | 性能关键场景 |

> **历史性转变**: 2025年8月，TypeScript 首次成为 GitHub 上使用最多的语言

#### 4.2 TypeScript 增长详情

- **100万+** 新贡献者（同比增长 66%）
- 现代框架默认使用 TypeScript
- AI 辅助开发与类型系统配合更好

#### 4.3 热门项目趋势

**增长最快的项目**:

| 项目 | 领域 |
|-----|-----|
| zen-browser/desktop | 隐私浏览器 |
| vllm-project/vllm | AI 推理 |
| ollama/ollama | 本地模型运行 |
| continue-dev/continue | AI 编码助手 |
| astral-sh/uv | Python 包管理 |
| NixOS/nixpkgs | 确定性构建 |

#### 4.4 AI 项目爆发

- **430万+** AI 相关仓库（近两年翻倍）
- **113万+** 项目导入 LLM SDK（同比增长 178%）
- **50%** 开源项目至少有一名维护者使用 Copilot
- 平均每月 **43.2M** PR 合并（同比增长 23%）

#### 4.5 开发者增长

- **1.8亿+** GitHub 开发者
- 每秒超过 1 名新开发者加入
- **印度** 新增 520 万开发者，预计 2030 年占新增开发者 1/3

### 对库选择的指导意义

1. **语言选择**: TypeScript 已成为现代 Web 开发的事实标准
2. **AI 集成**: 考虑 AI SDK 集成（如 Vercel AI SDK、LangChain）
3. **性能工具**: 关注 Rust 重写工具（Rolldown、Oxc）
4. **隐私安全**: 隐私优先工具（如 Zen Browser）受到关注

---

## 5. npm 趋势 2024-2025

### 来源链接

- **npmcharts**: <https://www.npmcharts.com/>
- **npm rank**: <https://gist.github.com/anvaka/8e8fa57c7ee1350e3491>

### 关键发现摘要

#### 5.1 下载量排名（前 20）

| 排名 | 包名 | 类别 |
|-----|-----|-----|
| 1 | lodash | 工具库 |
| 2 | chalk | CLI 工具 |
| 3 | react | UI 框架 |
| 4 | express | Web 框架 |
| 5 | axios | HTTP 客户端 |
| 6 | debug | 调试工具 |
| 7 | typescript | 语言 |
| 8 | ts-node | TypeScript 运行 |
| 9 | @types/node | 类型定义 |
| 10 | commander | CLI 框架 |

#### 5.2 增长最快的包

| 包名 | 用途 | 增长率 |
|-----|-----|-------|
| @biomejs/biome |  lint/format | 极高 |
| rolldown | 打包工具 | 高 |
| oxc | 编译器 | 高 |
| @tanstack/query | 数据获取 | 高 |
| zustand | 状态管理 | 高 |

#### 5.3 测试框架 npm 下载份额

| 框架 | 周下载量 | 市场份额 |
|-----|---------|---------|
| Playwright | ~33.2M | ~70% |
| Cypress | ~6.6M | ~14% |
| Puppeteer | ~6.3M | ~13% |
| Selenium (JS) | ~2.1M | ~4% |

### 对库选择的指导意义

1. **优先选择高 PageRank 的包**: 代表生态系统依赖度
2. **关注增长曲线**: 新工具如 Biome、Rolldown 值得关注
3. **类型安全**: @types/* 包的高下载量显示 TS 生态成熟
4. **测试选择**: Playwright 的下载量优势验证了行业趋势

---

## 6. ThoughtWorks Technology Radar 2024/2025

### 来源链接

- **官方雷达**: <https://www.thoughtworks.com/radar>
- **Vol 32 (2025年4月)**: <https://www.thoughtworks.com/content/dam/thoughtworks/documents/radar/2025/04/tr_technology_radar_vol_32_en.pdf>
- **Vol 33 (2025年11月)**: <https://www.thoughtworks.com/content/dam/thoughtworks/documents/radar/2025/11/tr_technology_radar_vol_33_en.pdf>

### 关键发现摘要

#### 6.1 采纳建议（Adopt）

| 技术/工具 | 类别 | 说明 |
|----------|-----|-----|
| Cursor | AI IDE | 集成 AI 的 VS Code 编辑器 |
| Bruno | API 客户端 | 数据隐私优先的 Postman 替代品 |
| Dependency Cruiser | 架构工具 | JS/TS 依赖可视化 |
| Visual Regression Testing | 测试 | 视觉回归测试 |
| Continuous Deployment | 实践 | 持续部署 |

#### 6.2 试验阶段（Trial）

| 技术/工具 | 类别 | 说明 |
|----------|-----|-----|
| Claude Code | AI 编码 | Anthropic 的 agentic AI 工具 |
| Rspack | 构建工具 | webpack 的 Rust 替代品 |
| GitButler | Git 工具 | 分支管理创新 |
| Mise | 版本管理 | 多语言版本管理器 |
| Zed | 编辑器 | 高性能 Rust 编辑器 |

#### 6.3 评估阶段（Assess）

| 技术/工具 | 类别 | 说明 |
|----------|-----|-----|
| Valibot | 验证库 | 轻量级 Zod 替代品 |
| Vercel AI SDK | AI 开发 | 全栈 AI 工具包 |
| ElysiaJS | 后端框架 | Bun 优先的 TypeScript 框架 |
| assistant-ui | UI 库 | AI 聊天界面组件 |
| JSR | 包管理 | 现代包注册表 |

#### 6.4 暂缓阶段（Hold）

| 技术 | 说明 |
|-----|-----|
| Selenium | 新项目建议使用 Playwright |
| Webpack | 建议迁移到 Vite/Rspack |

### 对库选择的指导意义

1. **AI 工具**: 积极尝试 Cursor、Claude Code 等 AI 辅助工具
2. **构建工具**: 评估从 webpack 迁移到 Rspack/Vite
3. **验证方案**: 新项目考虑 Valibot 替代 Zod 以减少包体积
4. **测试策略**: 采用视觉回归测试和 Playwright

---

## 7. InfoQ Architecture Trends 2025

### 来源链接

- **2025 报告**: <https://www.infoq.com/articles/architecture-trends-2025/>
- **播客讨论**: <https://www.infoq.com/presentations/video-podcast-ad-trends-report-2025/>

### 关键发现摘要

#### 7.1 采用曲线定位

**创新者（Innovators）**:

- Agentic AI（自主 AI 代理）
- Small Language Models（小型语言模型）
- Green Software（绿色软件）
- Privacy Engineering（隐私工程）

**早期采用者（Early Adopters）**:

- Retrieval-Augmented Generation（RAG）
- Cell-based Architecture（单元架构）
- Socio-technical Architecture（社会技术架构）

**早期多数（Early Majority）**:

- AI-assisted Development（AI 辅助开发）
- Platform Engineering（平台工程）

**晚期多数（Late Majority）**:

- Large Language Models（LLM）

#### 7.2 前端架构趋势

| 趋势 | 阶段 | 说明 |
|-----|-----|-----|
| AI 辅助开发 | 早期多数 | 替代低代码/无代码 |
| RAG | 早期采用者 | 提升 LLM 输出质量 |
| Agentic AI | 创新者 | 自主决策代理 |
| 绿色软件 | 创新者 | 碳效率优先 |
| 隐私工程 | 创新者 | 设计时考虑隐私 |

#### 7.3 AI 对架构的影响

1. **架构师角色转变**: 从直接决策者转向促进者
2. **数据驱动架构**: 系统设计考虑 RAG 消费
3. **去中心化决策**: 减少架构师瓶颈
4. **工具演进**: 从低代码转向 AI 辅助

### 对库选择的指导意义

1. **AI 集成**: 设计系统时预留 RAG 和 AI 代理接口
2. **可持续性**: 评估库的性能和碳足迹
3. **隐私优先**: 选择支持隐私保护的库
4. **团队体验**: 关注开发者体验（DevEx）

---

## 📋 资源汇总清单

| 资源名称 | 链接 | 更新频率 | 数据规模 |
|---------|------|---------|---------|
| State of JS | <https://stateofjs.com/> | 年度 | 13,000+ 开发者 |
| State of CSS | <https://stateofcss.com/> | 年度 | 9,700+ 开发者 |
| Stack Overflow Survey | <https://survey.stackoverflow.co/> | 年度 | 65,000+ 开发者 |
| GitHub Octoverse | <https://github.blog/news-insights/octoverse/> | 年度 | 1.8亿+ 开发者 |
| npm Charts | <https://www.npmcharts.com/> | 实时 | 全量包数据 |
| ThoughtWorks Radar | <https://www.thoughtworks.com/radar> | 半年 | 专家评估 |
| InfoQ Trends | <https://www.infoq.com/articles/> | 年度 | 专家面板 |

---

## 🎯 技术选型决策矩阵

### 前端框架选择

| 场景 | 推荐 | 备选 |
|-----|-----|-----|
| 大型企业应用 | React + TypeScript | Angular |
| 快速原型/MVP | Svelte | Vue |
| 高性能应用 | Solid | Svelte |
| 内容驱动站点 | Astro | Next.js |

### 构建工具选择

| 场景 | 推荐 | 备注 |
|-----|-----|-----|
| 新项目 | Vite | 生态成熟 |
| 从 webpack 迁移 | Rspack | 渐进式迁移 |
| 企业级应用 | Rolldown (2026) | Vite 下一代 |

### 测试框架选择

| 场景 | 推荐 | 备选 |
|-----|-----|-----|
| 单元测试 (Vite) | Vitest | Jest |
| 单元测试 (其他) | Jest | Mocha |
| E2E 测试 | Playwright | Cypress |
| 视觉回归 | Playwright/BackstopJS | Applitools |

### CSS 方案选择

| 场景 | 推荐 | 备注 |
|-----|-----|-----|
| 快速开发 | Tailwind CSS | 生态丰富 |
| 设计系统 | CSS Modules + 原生 | 可控性高 |
| 零运行时 | 原生 CSS + 新特性 | 学习成本高 |

---

## 📌 总结与建议

### 2024-2025 核心建议

1. **拥抱 TypeScript**: 已成为 GitHub 最活跃语言，现代框架默认支持
2. **迁移到 Vite**: webpack 进入维护模式，Vite 生态成熟
3. **采用 Playwright**: E2E 测试新标准，微软持续投入
4. **学习 AI 工具**: 29% 代码 AI 生成，工具链正在重塑
5. **关注原生 CSS**: 新特性减少工具依赖
6. **评估 Rust 工具**: 下一代高性能工具链的基础

### 风险与注意事项

- **AI 代码质量**: 仅 43% 开发者信任 AI 输出，需要严格审查
- **框架碎片化**: 虽然框架战争结束，但元框架选择增多
- **技能过时**: 工具链快速演进，持续学习变得重要
- **供应链安全**: npm 依赖复杂，需要安全审计

---

*报告整理时间: 2025年4月*
*建议定期（每季度）回顾本报告以获取最新趋势*
