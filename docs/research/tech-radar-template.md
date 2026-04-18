# 技术雷达模板 (Tech Radar Template)

> 采用 [ThoughtWorks Tech Radar](https://www.thoughtworks.com/radar) 格式
>
> 用于系统性追踪和评估 JavaScript/TypeScript 生态中的技术趋势

---

## 使用说明

技术雷达通过**四象限** × **四环**的矩阵，帮助团队可视化技术采纳策略：

### 四象限 (Quadrants)

| 象限 | 说明 | 典型条目 |
|------|------|----------|
| **Languages & Frameworks** | 编程语言与框架 | TypeScript、React、NestJS |
| **Tools** | 开发工具与库 | Vite、Prisma、Zod |
| **Platforms** | 基础设施与平台 | Node.js、Vercel、Cloudflare Workers |
| **Techniques** | 工程方法与模式 | RSC、微前端、TDD |

### 四环 (Rings)

| 环层 | 含义 | 行动建议 |
|------|------|----------|
| **Adopt** | 已验证，推荐采用 | 新项目默认选择，现有项目积极迁移 |
| **Trial** | 值得尝试 | 在低风险场景试点，积累团队经验 |
| **Assess** | 持续评估 | 关注社区动态，评估适用性 |
| **Hold** | 暂缓采纳 | 暂不使用，观察演进或等待成熟 |

---

## 填写模板

### Languages & Frameworks

| 技术 | 当前环 | 目标环 | 评估日期 | 迁移计划 | 负责人 |
|------|--------|--------|----------|----------|--------|
| TypeScript 7.0 (Go 编译器) | Assess | Trial | 2026-Q2 | 等待 RC 后试点 | @team-lead |
| React 19 (Compiler) | Trial | Adopt | 2026-Q2 | 下季度升级 | @frontend-lead |
| Vue 3 / Vapor Mode | Adopt | Adopt | 2026-Q2 | 已采用 | - |
| Svelte 5 (Runes) | Trial | Adopt | 2026-Q2 | 评估迁移成本 | @frontend-lead |
| Next.js 15 (App Router) | Adopt | Adopt | 2026-Q2 | 已采用 | - |
| Hono | Trial | Adopt | 2026-Q2 | 边缘服务试点 | @backend-lead |
| Elysia | Assess | Trial | 2026-Q3 | 等待生态成熟 | @backend-lead |
| Mastra | Assess | Assess | 2026-Q2 | 观察 AI Agent 演进 | @ai-lead |

### Tools

| 技术 | 当前环 | 目标环 | 评估日期 | 迁移计划 | 负责人 |
|------|--------|--------|----------|----------|--------|
| Vite 6 | Adopt | Adopt | 2026-Q2 | 已采用 | - |
| Turbopack | Trial | Adopt | 2026-Q2 | Next.js 默认后跟进 | @frontend-lead |
| SWC | Adopt | Adopt | 2026-Q2 | 已采用 | - |
| tRPC | Adopt | Adopt | 2026-Q2 | 已采用 | - |
| Drizzle ORM | Trial | Adopt | 2026-Q2 | 新服务采用 | @backend-lead |
| Prisma | Adopt | Adopt | 2026-Q2 | 现有服务维持 | - |
| better-auth | Trial | Adopt | 2026-Q2 | 认证服务重构试点 | @backend-lead |
| MCP SDK | Assess | Trial | 2026-Q2 | 构建内部工具 | @ai-lead |

### Platforms

| 技术 | 当前环 | 目标环 | 评估日期 | 迁移计划 | 负责人 |
|------|--------|--------|----------|----------|--------|
| Node.js 22 LTS | Adopt | Adopt | 2026-Q2 | 已采用 | - |
| Cloudflare Workers | Adopt | Adopt | 2026-Q2 | 已采用 | - |
| Vercel Edge | Trial | Adopt | 2026-Q2 | 全栈项目试点 | @devops-lead |
| Docker + K8s | Adopt | Adopt | 2026-Q2 | 已采用 | - |
| WinterTC 运行时 | Assess | Assess | 2026-Q3 | 跟踪标准化进展 | @platform-lead |

### Techniques

| 技术 | 当前环 | 目标环 | 评估日期 | 迁移计划 | 负责人 |
|------|--------|--------|----------|----------|--------|
| React Server Components | Trial | Adopt | 2026-Q2 | Next.js 项目推广 | @frontend-lead |
| Passkeys / WebAuthn | Trial | Adopt | 2026-Q2 | 登录流程改造 | @security-lead |
| Edge-First 架构 | Trial | Adopt | 2026-Q2 | 新服务默认边缘部署 | @architect |
| AI Agent 工作流 | Assess | Trial | 2026-Q3 | 内部工具试点 | @ai-lead |
| OpenTelemetry | Trial | Adopt | 2026-Q2 | 可观测性体系升级 | @devops-lead |
| Tailwind CSS v4 | Trial | Adopt | 2026-Q2 | 新项目采用 | @frontend-lead |

---

## 评审流程

1. **季度评审**：每季度末由技术委员会评审一次
2. **变更触发**：当出现以下情况时，可临时发起评审
   - 目标技术发布 Major 版本
   - 社区出现重大安全漏洞
   - 团队内部试点完成并形成结论
3. **归档规则**：从 Adopt 退出的技术需记录原因和替代方案

---

## 参考

- [ThoughtWorks Technology Radar](https://www.thoughtworks.com/radar)
- [CNCF Cloud Native Trail Map](https://github.com/cncf/trailmap)
