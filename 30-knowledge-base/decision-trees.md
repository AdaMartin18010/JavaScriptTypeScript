# 决策树总览

> 技术选型决策树的顶层导航与可视化决策流程。

---

## 决策树分类

| 类别 | 位置 | 决策维度 | 更新状态 |
|------|------|---------|---------|
| **前端框架** | `30.1-guides/decision-trees.md` | 应用类型、团队规模、性能要求、生态成熟度 | 2026-Q2 |
| **状态管理** | `30.2-categories/04-state-management.md` | 应用规模、持久化需求、跨平台需求、调试需求 | 2026-Q2 |
| **构建工具** | `30.3-comparison-matrices/js-ts-compilers-compare.md` | 项目规模、兼容性要求、CI 速度、插件生态 | 2026-Q2 |
| **部署平台** | `30.2-categories/09-deployment-platforms.md` | 流量模式、合规要求、预算、团队运维能力 | 2026-Q2 |
| **包管理器** | `30.2-categories/07-package-managers.md` | 工作区支持、磁盘效率、锁文件策略、生态兼容性 | 2026-Q2 |

---

## 1. 前端框架选型决策树

```mermaid
flowchart TD
    A[开始: 新项目前端框架选型] --> B{需要 SSR / SSG?}
    B -->|是| C{内容驱动还是应用驱动?}
    B -->|否| D{性能敏感度?}

    C -->|内容驱动<br>博客/文档/营销页| E[Astro<br> Islands Architecture]
    C -->|应用驱动<br>电商/ SaaS / Dashboard| F{团队 React 经验?}

    F -->|丰富| G[Next.js 15+<br>App Router + RSC]
    F -->|有限| H[Nuxt 3+<br>Vue 生态 + 约定优于配置]

    D -->|极高<br>动画密集型| I[SolidJS<br>无 VDOM, 细粒度响应式]
    D -->|高<br>大型数据表格/仪表板| J[Svelte 5<br>编译时优化, 极小运行时]
    D -->|中等| K{团队偏好?}

    K -->|类型优先 + 大生态| L[React 19 + Vite 8<br>最大生态, Signals 兼容]
    K -->|渐进式 + 易上手| M[Vue 3.5+<br>组合式 API, 优秀文档]
    K -->|全栈类型安全| N[Angular 18+<br>Signals + 依赖注入]

    E --> O[部署: Vercel / Netlify / Cloudflare Pages]
    G --> P[部署: Vercel / AWS / 自有 Node.js 服务器]
    H --> P
    I --> Q[部署: 任意静态/CDN]
    J --> Q
    L --> Q
    M --> Q
    N --> R[部署: 企业级 Node.js / Java 后端]
```

### 关键决策因子权重

| 因子 | Astro | Next.js | Nuxt | SolidJS | Svelte | React 19 | Vue 3.5 | Angular |
|------|-------|---------|------|---------|--------|----------|---------|---------|
| 学习曲线 (低=优) | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★☆☆ | ★★★★★ | ★★★☆☆ | ★★★★★ | ★★☆☆☆ |
| SSR/SSG 能力 | ★★★★★ | ★★★★★ | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★★★ | ★★★★☆ | ★★★★☆ |
| 运行时性能 | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★★★ | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★☆☆ |
| 生态成熟度 | ★★★★☆ | ★★★★★ | ★★★★☆ | ★★☆☆☆ | ★★★★☆ | ★★★★★ | ★★★★★ | ★★★★☆ |
| TypeScript 集成 | ★★★★☆ | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ |

---

## 2. 后端运行时与框架选型决策树

```mermaid
flowchart TD
    A[开始: 后端技术选型] --> B{已有技术栈?}

    B -->|Node.js 生态| C{性能瓶颈类型?}
    B -->|无/全新项目| D{团队语言偏好?}
    B -->|需要边缘部署| E[边缘优先方案]

    C -->|I/O 密集型<br>高并发 API| F[Node.js 24 LTS + Fastify<br>或 Deno 2.x + Oak/Fresh]
    C -->|CPU 密集型<br>计算/编解码| G[Node.js + Rust/WASM addon<br>或迁移至 Rust/Go 微服务]
    C -->|混合型| H[NestJS 10+<br>模块化 + 微服务就绪]

    D -->|TypeScript 优先| I{需要边缘运行?}
    D -->|类型安全极致| J[Rust + Axum/Actix<br>或 Go + Gin/Echo]
    D -->|函数式偏好| K[Elixir/Phoenix<br>或 OCaml/Dream]

    I -->|是| L[Hono + Cloudflare Workers<br>或 Deno Deploy]
    I -->|否| M[Express 5 / Fastify 5 / Elysia<br>Bun/Deno/Node 均可]

    E --> N{延迟要求?}
    N -->|< 50ms 全球| O[Cloudflare Workers<br>V8 Isolate, 全球 310+ PoP]
    N -->|< 100ms 区域| P[Deno Deploy<br>或 Vercel Edge Functions]
    N -->|可接受 200ms+| Q[传统 Node.js VPS / K8s]
```

### 后端方案对比表

| 场景 | 推荐方案 | 吞吐量 (req/s) | 冷启动 | 适用规模 |
|------|---------|---------------|--------|---------|
| 高并发 REST API | Node.js 24 + Fastify | ~80k | N/A | 中-大 |
| 全栈 TypeScript | NestJS 10 + Prisma | ~30k | N/A | 大-企业 |
| 边缘 API / 中间件 | Hono + Cloudflare Workers | ~50k | ~0ms | 小-大 |
| 极致性能服务 | Rust + Axum | ~120k | N/A | 中-大 |
| Serverless 函数 | AWS Lambda + Node 22 | ~视并发而定 | ~150ms | 小-中 |
| 实时/WebSocket | Deno 2 + native WS | ~60k | N/A | 中 |

---

## 3. 数据库选型决策树

```mermaid
flowchart TD
    A[开始: 数据库选型] --> B{数据模型?}

    B -->|关系型 / 强 Schema| C{读写特征?}
    B -->|文档型 / 灵活 Schema| D{一致性要求?}
    B -->|图 / 复杂关系| E[Neo4j / Dgraph<br>或 PostgreSQL + pg_graphql]
    B -->|时序 / 分析| F[TimescaleDB / ClickHouse<br>或 DuckDB 嵌入式]
    B -->|键值 / 缓存| G[Redis 7 + Valkey<br>或 Cloudflare KV]

    C -->|读多写少| H[PostgreSQL 16 + 只读副本<br>或 PlanetScale MySQL]
    C -->|写密集型| I[CockroachDB / YugabyteDB<br>分布式 SQL, 水平扩展]
    C -->|标准 OLTP| J[PostgreSQL 16<br>最可靠的开源关系数据库]

    D -->|强一致性| K[MongoDB 7 ACID 事务<br>或 PostgreSQL jsonb]
    D -->|最终一致性| L[MongoDB Atlas / DynamoDB<br>或 Cloudflare D1]
    D -->|离线优先 / 边缘| M[SQLite 3.45 + libSQL<br>或 Electric SQL 同步]
```

### 数据库选型矩阵

| 需求 | PostgreSQL | MySQL/PlanetScale | MongoDB | SQLite | Redis | CockroachDB |
|------|-----------|-------------------|---------|--------|-------|-------------|
| 复杂查询 | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★★☆ | ★☆☆☆☆ | ★★★★☆ |
| 水平扩展 | ★★★☆☆ | ★★★★☆ | ★★★★★ | ★☆☆☆☆ | ★★★★★ | ★★★★★ |
| 边缘/嵌入式 | ★★☆☆☆ | ★☆☆☆☆ | ★☆☆☆☆ | ★★★★★ | ★★☆☆☆ | ★☆☆☆☆ |
| JSON 灵活性 | ★★★★★ | ★★★☆☆ | ★★★★★ | ★★★☆☆ | ★★★☆☆ | ★★★★☆ |
| 全托管方案 | Supabase / Neon | PlanetScale | MongoDB Atlas | Cloudflare D1 | Upstash | CockroachCloud |

---

## 4. 部署与托管平台决策树

```mermaid
flowchart TD
    A[开始: 部署平台选型] --> B{应用类型?}

    B -->|静态站点 / JAMstack| C{构建频率?}
    B -->|全栈应用 / SSR| D{容器化程度?}
    B -->|微服务 / API 集群| E{编排需求?}
    B -->|边缘函数 /  Worker| F[边缘平台直接部署]

    C -->|频繁<br>每次提交| G[Vercel / Netlify<br>Git 集成, 预览部署]
    C -->|低频<br>每周/月| H[Cloudflare Pages<br>或 AWS S3 + CloudFront]

    D -->|完全容器化| I{Docker / OCI 标准?}
    D -->|原生运行时| J{云厂商锁定接受度?}

    I -->|是| K[ fly.io<br>或 Railway / Render<br>开发者体验优先]
    I -->|部分 / 仅 Node| L[Coolify / Dokploy<br>自托管 PaaS 替代]

    J -->|接受| M[AWS Amplify / Azure Static Web Apps<br>或 GCP App Engine]
    J -->|避免| N[DigitalOcean App Platform<br>或 Hetzner Cloud + PM2]

    E -->|需要 K8s| O[AWS EKS / GKE / Azure AKS<br>或自托管 K3s]
    E -->|简单容器编排| P[Docker Swarm / Nomad<br>或 fly.io 自动扩展]

    F --> Q{全球分布要求?}
    Q -->|全球低延迟| R[Cloudflare Workers<br>或 Deno Deploy Edge]
    Q -->|区域部署| S[Vercel Edge / Netlify Edge<br>或 AWS Lambda@Edge]
```

### 平台选型成本对比 (月度估算, 中小型项目)

| 平台 | 免费 tier | 起步成本 | 扩展成本 | 全球 CDN | 最佳场景 |
|------|----------|---------|---------|---------|---------|
| **Vercel** |  generous | $20/月 | 按带宽 | 自动 | Next.js SSR, 预览部署 |
| **Netlify** |  generous | $19/月 | 按带宽 | 自动 | 静态站点, 表单处理 |
| **Cloudflare Pages** |  unlimited 请求 | $5/月 | 按 Worker 调用 | 全球 310+ PoP | 边缘渲染, 高流量静态 |
| **fly.io** |  $5/月 credit | ~$2/月/VM | 按 VM + 带宽 | 可选 | Docker 容器, 全球部署 |
| **Railway** |  $5/月 credit | ~$5/月 | 按资源 | 无 | 快速原型, PostgreSQL 内置 |
| **Render** |  generous | $7/月 | 按实例 | 无 | 全栈应用, 后台 Worker |
| **AWS Amplify** |  12 个月免费 | 按用量 | 按用量 | CloudFront | AWS 生态集成 |
| **Hetzner Cloud** |  无 | €5/月 | 线性 | 无 | 成本敏感, 自管理 |

---

## 权威链接

- [ThoughtWorks Technology Radar 2026](https://www.thoughtworks.com/radar) — 企业技术选型趋势权威参考。
- [State of JS 2025](https://stateofjs.com/) — 全球开发者框架与工具采用率调查。
- [State of DevOps Report](https://dora.dev/) — Google DORA 团队发布的 DevOps 效能研究。
- [DB-Engines Ranking](https://db-engines.com/en/ranking) — 数据库流行度月度排名。
- [Cloudflare Radar](https://radar.cloudflare.com/) — 全球互联网趋势与边缘部署洞察。
- [Web Framework Benchmarks](https://www.techempower.com/benchmarks/) — TechEmpower 后端框架性能基准测试。
- [JS Framework Benchmark](https://krausest.github.io/js-framework-benchmark/) — 前端框架运行时性能对比。
- [StackShare Trends](https://stackshare.io/trending/tools) — 企业技术栈实际采用趋势。
- [Serverless Patterns](https://serverlessland.com/patterns) — AWS 无服务器架构模式库。

---

*最后更新: 2026-04-29*
