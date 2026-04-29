# 技术雷达模板（2026 版）

> 团队技术雷达的标准化模板，用于定期评估技术栈健康度。
> **权威参考**: [ThoughtWorks Technology Radar](https://www.thoughtworks.com/radar) | [Zalando Tech Radar](https://opensource.zalando.com/tech-radar/) | [Khan Academy Tech Radar](https://github.com/khan/tech-radar) | [CNCF Cloud Native Landscape](https://landscape.cncf.io/)

---

## 四象限定义

| 象限 | 说明 | 行动准则 | 示例 |
|------|------|----------|------|
| **Adopt（采用）** | 已验证，团队应默认使用 | 新项目优先选择；旧项目逐步迁移 | React 19, TypeScript 5.7, PostgreSQL 16 |
| **Trial（试验）** | 有前景，可在非核心项目尝试 | 选择 1-2 个试点项目；设定 3 个月评估期 | Oxc 编译器, Deno 2, Rspack |
| **Assess（评估）** | 值得关注，需持续跟踪 | 阅读文档、PoC、参加社区会议 | tsgo (Go TypeScript), Bolt.new AI |
| **Hold（暂缓）** | 已过时或有明显缺陷，避免新项目使用 | 不再接受新需求；制定迁移计划 | Babel (新项目), Webpack (新项目), Create React App |

---

## 雷达分类

| 分类 | 说明 | 示例技术 |
|------|------|---------|
| **语言与框架** | 编程语言、UI 框架、元框架 | React, Vue, Svelte, Next.js, Angular, Rust |
| **工具链** | 构建工具、测试框架、代码质量 | Vite, Turborepo, Biome, pnpm, Playwright |
| **平台与基础设施** | 云服务、托管、容器编排 | Vercel, Cloudflare, Railway, Kubernetes, Docker |
| **数据与 AI** | 数据库、缓存、AI SDK、向量存储 | PostgreSQL, TanStack Query, OpenAI SDK, pgvector, MCP |
| **运行时** | JS/TS 执行环境 | Node.js 22, Bun 2, Deno 2, Cloudflare Workers |

---

## 技术雷达评估标准

| 评估维度 | 权重 | 评分标准 (1-5) |
|---------|------|---------------|
| **技术成熟度** | 25% | 1=实验性, 3=生产可用, 5=行业标杆 |
| **社区生态** | 20% | 1=个人项目, 3=活跃社区, 5=巨头背书 |
| **团队熟悉度** | 20% | 1=无人了解, 3=有人使用过, 5=团队精通 |
| **与现有栈兼容性** | 15% | 1=完全不兼容, 3=需适配层, 5=即插即用 |
| **长期维护风险** | 10% | 1=高风险弃用, 3=中等风险, 5=长期支持承诺 |
| **成本效益** | 10% | 1=成本极高, 3=合理, 5=显著降本增效 |

### 评分换算规则

```
加权总分 = Σ(维度得分 × 权重)

≥ 4.5 → Adopt
3.5 - 4.4 → Trial
2.5 - 3.4 → Assess
< 2.5 → Hold
```

---

## 技术雷达 JSON 配置示例

```json
{
  "$schema": "https://example.com/tech-radar-schema.json",
  "meta": {
    "title": "Frontend Team Tech Radar 2026-Q2",
    "team": "Platform Engineering",
    "lastUpdated": "2026-04-29",
    "reviewCycle": "quarterly"
  },
  "quadrants": [
    { "id": "adopt", "name": "Adopt", "description": "Industry standard for our stack" },
    { "id": "trial", "name": "Trial", "description": "Evaluate in non-production" },
    { "id": "assess", "name": "Assess", "description": "Explore and monitor" },
    { "id": "hold", "name": "Hold", "description": "Avoid for new projects" }
  ],
  "categories": [
    { "id": "languages", "name": "Languages & Frameworks" },
    { "id": "tools", "name": "Tools & Build" },
    { "id": "platforms", "name": "Platforms & Infrastructure" },
    { "id": "data", "name": "Data & AI" }
  ],
  "technologies": [
    {
      "id": "react-19",
      "name": "React 19",
      "quadrant": "adopt",
      "category": "languages",
      "moved": 0,
      "score": 4.8,
      "description": "With Server Components and React Compiler",
      "links": ["https://react.dev", "https://nextjs.org"]
    },
    {
      "id": "typescript-5-7",
      "name": "TypeScript 5.7",
      "quadrant": "adopt",
      "category": "languages",
      "moved": 0,
      "score": 4.9,
      "description": "Native ESM, path rewriting, performance improvements"
    },
    {
      "id": "oxc",
      "name": "Oxc",
      "quadrant": "trial",
      "category": "tools",
      "moved": 1,
      "score": 3.6,
      "description": "Rust-based unified toolchain (parser, transformer, linter, minifier)",
      "pilotProject": "internal-component-lib",
      "pilotDeadline": "2026-07-01"
    },
    {
      "id": "tsgo",
      "name": "tsgo (Go TypeScript)",
      "quadrant": "assess",
      "category": "tools",
      "moved": 1,
      "score": 2.8,
      "description": "Microsoft's native Go port of TypeScript compiler",
      "assessmentTasks": ["Watch GitHub repo", "Read design docs", "PoC by Q3"]
    },
    {
      "id": "webpack",
      "name": "Webpack",
      "quadrant": "hold",
      "category": "tools",
      "moved": -1,
      "score": 2.0,
      "description": "Legacy projects only; migrate to Vite/Rspack",
      "migrationTarget": "Vite 6",
      "migrationDeadline": "2026-12-31"
    },
    {
      "id": "bun-2",
      "name": "Bun 2",
      "quadrant": "trial",
      "category": "platforms",
      "moved": 0,
      "score": 3.7,
      "description": "Ultra-fast runtime for serverless/edge workloads",
      "pilotProject": "edge-api-gateway"
    },
    {
      "id": "mcp",
      "name": "MCP (Model Context Protocol)",
      "quadrant": "trial",
      "category": "data",
      "moved": 1,
      "score": 3.5,
      "description": "Standardize AI tool interfaces across agents",
      "pilotProject": "ai-dev-assistant"
    }
  ],
  "assessmentHistory": [
    {
      "date": "2026-01-15",
      "technologyId": "oxc",
      "fromQuadrant": "assess",
      "toQuadrant": "trial",
      "reason": "Completed PoC; 30x faster than Babel in our build pipeline"
    },
    {
      "date": "2026-01-15",
      "technologyId": "webpack",
      "fromQuadrant": "adopt",
      "toQuadrant": "hold",
      "reason": "All new projects using Vite; remaining 3 legacy apps scheduled for migration"
    }
  ]
}
```

---

## 使用方式

1. **每季度组织技术雷达评审会**（建议 2 小时）
   - 会前：各技术负责人提交评估表
   - 会中：逐项讨论边界案例（Trial ↔ Assess）
   - 会后：更新 JSON 配置并发布可视化雷达图

2. **每个技术由实际使用者提供评估依据**
   - 必须包含生产环境运行数据（如可用性、性能指标）
   - Trial 阶段技术必须指定试点项目和截止日期

3. **记录技术迁移决策**
   - 从 Trial → Adopt：需 2 个以上试点项目成功运行 3 个月
   - 从 Adopt → Hold：需制定迁移计划和时间表
   - 所有变更记录到 `assessmentHistory`

4. **将雷达结果写入团队知识库**
   - 生成静态站点或 Mermaid 雷达图
   - 在新人 onboarding 中作为必读材料

---

## Mermaid 雷达图可视化

```mermaid
quadrantChart
    title Tech Radar 2026-Q2
    quadrant-names Adopt, Trial, Assess, Hold
    Languages & Frameworks: [React 19, TypeScript 5.7, Vue 3.5, Angular 19]
    Tools & Build: [Vite, Biome, Oxc, tsgo, Webpack]
    Platforms: [Cloudflare, Vercel, Bun 2, Deno 2]
    Data & AI: [PostgreSQL, pgvector, MCP, OpenAI SDK]
```

> 📖 参考：[Mermaid Quadrant Chart](https://mermaid.js.org/syntax/quadrantChart.html) | [ThoughtWorks Radar Methodology](https://www.thoughtworks.com/radar/byor)

---

## 关联模板

| 模板 | 用途 | 路径 |
|------|------|------|
| 技术选型决策记录 | ADR (Architecture Decision Record) | `60-meta-content/templates/adr-template.md` |
| 技术试点报告 | Trial Report | `60-meta-content/templates/trial-report.md` |
| 迁移计划 | Migration Plan | `60-meta-content/templates/migration-plan.md` |

---

*最后更新: 2026-04-29*
