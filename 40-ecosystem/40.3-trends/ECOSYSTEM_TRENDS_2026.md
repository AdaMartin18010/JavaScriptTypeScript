# JS/TS 生态趋势报告 2026

> **定位**：`40-ecosystem/40.3-trends/`
> **更新周期**：季度更新
> **权威来源**：State of JS 2025、Stack Overflow 2025 Developer Survey、JetBrains Developer Ecosystem 2025、npm 统计数据
> **最后更新**：2026-04

---

## 一、宏观趋势

### 1.1 运行时三足鼎立成熟化

2026 年，Node.js、Bun、Deno 的竞争进入**收敛期**：

- **Node.js v24+ LTS**：原生 `--experimental-strip-types` 稳定化（类型剥离），内置测试运行器成熟，Permission Model 细粒度权限（v22.13+）
- **Bun v1.2+**：npm 兼容性达 **99.7%**，内置 S3/SQLite 客户端，`bun install` 10-20x 快于 npm
- **Deno v2.x**：npm 兼容性 ~95%，Deno Deploy 边缘运行时成熟，WinterCG 合规

**结论**：混合运行时架构成为企业标准（Node.js 主服务 + Bun 边缘函数 + Deno 敏感计算）。

#### 代码示例：Node.js 原生 TypeScript 类型剥离

```typescript
// math.ts — 无需 ts-node 或 tsx，Node.js 24+ 原生执行
export function add(a: number, b: number): number {
  return a + b;
}

// main.ts
import { add } from './math.js'; // 注意：仍使用 .js 扩展名
console.log(add(2, 3)); // 5
```

```bash
# Node.js v24+ 原生运行 TypeScript（类型在运行时被剥离）
node --experimental-strip-types main.ts

# 配合 package.json 脚本
{
  "scripts": {
    "dev": "node --experimental-strip-types --watch src/main.ts",
    "test": "node --test --experimental-strip-types src/**/*.test.ts"
  }
}
```

#### 代码示例：Deno 权限模型与安全计算

```typescript
// Deno 默认安全：无文件/网络/环境变量访问权限
// 运行时必须显式授权
import { serve } from 'https://deno.land/std@0.220.0/http/server.ts';

// 读取环境变量（需 --allow-env）
const apiKey = Deno.env.get('API_KEY');

// 文件操作（需 --allow-read）
const data = await Deno.readTextFile('./data.json');

serve(async (req) => {
  return new Response('Hello from Deno');
}, { port: 8000 });
```

```bash
# 运行 Deno 程序，显式声明最小权限
deno run --allow-net=0.0.0.0:8000 --allow-env=API_KEY --allow-read=./data.json app.ts
```

#### 代码示例：Bun 内置 API 与 SQLite

```typescript
// Bun 内置 SQLite 客户端，无需额外依赖
import { Database } from 'bun:sqlite';

const db = new Database('app.db');

// 创建表
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE
  )
`);

// 参数化查询（自动防 SQL 注入）
const insert = db.query('INSERT INTO users (name, email) VALUES ($name, $email)');
insert.run({ $name: 'Alice', $email: 'alice@example.com' });

// 读取
const users = db.query('SELECT * FROM users WHERE name = ?').all('Alice');
console.log(users);

// Bun 内置 HTTP 服务器
Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response('Hello from Bun!');
  },
});
```

### 1.2 Rust 重写工具链加速

| 领域 | JS/旧工具 | Rust 新工具 | 2026 替代进度 | 关键里程碑 |
|------|----------|-------------|--------------|-----------|
| 编译器 | tsc | tsgo (Go) / Oxc / stc | 30% | tsgo 预览版发布，编译速度提升 10x |
| Bundler | Webpack | Rspack / Rolldown / Farm | **70%** | Rolldown 1.0 Stable (2026-04)；GitLab 迁移后构建快 7x |
| Linter | ESLint | oxlint / Biome | 30% | oxlint 支持 TypeScript 类型感知 Lint (Alpha) |
| 格式化 | Prettier | Biome / dprint / oxfmt | 35% | oxfmt 速度约 Prettier 30x (Alpha) |
| CSS | PostCSS | Lightning CSS | **75%** | Next.js 15 / Vite 默认集成 |
| 解析器 | Babel | SWC / Oxc | **85%** | Next.js / Vite / Rspack 默认使用 |

> *"Rust-based tools like Rolldown and RSPack are rapidly gaining adoption because they aim to provide Webpack compatibility with Rust-level performance."* — DeCODE Bundler Benchmark 2026

#### 代码示例：Oxc Linter 集成

```bash
# 零配置，比 ESLint 快 50-100 倍
npx oxlint@latest ./src

# 指定规则集
npx oxlint@latest ./src --deny correctness --deny suspicious

# 与 Rspack 集成（vite.config.ts）
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // Vite 6+ 原生支持 Rolldown（实验性）
  ],
  build: {
    // 使用 Oxc 替代 esbuild 进行代码压缩（实验性）
    minify: 'oxc',
  },
});
```

### 1.3 AI 原生开发工具爆发

| 工具类别 | 2024 状态 | 2026 状态 | 变化 |
|---------|----------|----------|------|
| **AI IDE** | GitHub Copilot 主导 | Cursor (26%) / Windsurf / Zed AI / Claude Code 竞争 | Cursor 使用率翻倍 (11%→26%) |
| **AI 聊天** | ChatGPT 68% | ChatGPT 60%，Claude 44% (22%→44%) | Claude 翻倍，ChatGPT 微降 |
| **Agent 框架** | LangChain 主导 | Mastra / CrewAI / LangGraph / Vercel AI SDK 竞争 | 框架碎片化，MCP 成为连接标准 |
| **协议标准化** | 无标准 | MCP (Anthropic) + A2A (Google) 双轨 | MCP 9700 万月下载，10000+ Servers |

#### 代码示例：Vercel AI SDK + MCP 集成

```typescript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { experimental_createMCPClient } from 'ai';

// 创建 MCP 客户端连接本地文件系统服务
const mcpClient = await experimental_createMCPClient({
  transport: {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/project/docs'],
  },
});

// 获取 MCP 工具并注入到 AI SDK
tools = await mcpClient.tools();

const { text } = await generateText({
  model: openai('gpt-4o'),
  tools,
  prompt: '读取 README.md 并总结项目的主要功能',
});

console.log(text);
await mcpClient.close();
```

### 1.4 TypeScript 成为事实标准

| 指标 | 数据 | 来源 |
|------|------|------|
| 专业开发者使用率 | **73%** (2020 年仅 34%) | Stack Overflow 2025 |
| 独占 TypeScript 用户 | **40%** (2024: 34%) | State of JS 2025 |
| npm 周下载量 | **2500 万+** (Q1 2026) | npm 统计 |
| 美国薪资中位数 | **$132,000** (JS-only: $115,000) | Stack Overflow 2025 |
| 生产 bug 减少 | **15% 更少**，60-80% 编译期捕获 | Slack/Airbnb/Asana 工程博客 |
| 前端岗位需求 | **65%** 要求/偏好 TypeScript | LinkedIn 2025 |

> *"TypeScript has won. Not as a bundler, but as a language. And now, type stripping means you can write it natively in stable Node.js versions."* — Daniel Roe, Nuxt Core Team, State of JS 2025

#### 代码示例：类型安全 API 契约（端到端类型安全）

```typescript
// shared/api.ts — 服务端与客户端共享的类型契约
export interface ApiRoutes {
  '/api/users': {
    GET: { response: User[] };
    POST: { body: CreateUserDto; response: User };
  };
  '/api/users/:id': {
    GET: { params: { id: string }; response: User };
    DELETE: { params: { id: string }; response: { success: boolean } };
  };
}

// server/handler.ts — 服务端类型安全实现
import type { ApiRoutes } from '../shared/api';

export async function getUsers(): Promise<ApiRoutes['/api/users']['GET']['response']> {
  return db.user.findMany();
}

// client/fetch.ts — 客户端类型安全调用
import type { ApiRoutes } from '../shared/api';

type Route = keyof ApiRoutes;

async function api<K extends Route>(
  url: K,
  options?: ApiRoutes[K]['GET'] extends { response: infer R } ? RequestInit : never
): Promise<ApiRoutes[K]['GET']['response']> {
  const res = await fetch(url, options);
  return res.json();
}

// 使用时完全类型安全
const users = await api('/api/users'); // User[]
const user = await api('/api/users/123'); // User
```

### 1.5 Signals 跨框架标准化

- **alien-signals** 成为框架无关的响应式原语（Vue 3.5、Preact、Solid 底层使用）
- **TC39 Signals 提案**（Stage 1）推动语言级标准化
- Angular 19 原生 Signals、Svelte 5 Runes、Vue 3.5 响应式重构—— Signals 范式成为 2026 主流

#### 代码示例：TC39 Signals Stage 1 提案用法

```typescript
// 基于 TC39 Signals 提案的响应式系统（使用 polyfill）
import { Signal } from 'signal-polyfill';

// 创建状态信号
const count = new Signal.State(0);

// 创建计算信号（自动依赖追踪）
const doubled = new Signal.Computed(() => count.get() * 2);

// 创建副作用（watch）
const effect = new Signal.Effect(() => {
  console.log(`count = ${count.get()}, doubled = ${doubled.get()}`);
});

// 状态变更自动触发计算和副作用
count.set(1); // 输出: count = 1, doubled = 2
count.set(2); // 输出: count = 2, doubled = 4

// 框架集成示例（Vue 3.5 底层使用 alien-signals）
import { signal, computed, effect } from 'alien-signals';

const price = signal(100);
const quantity = signal(2);
const total = computed(() => price.get() * quantity.get());

effect(() => {
  console.log(`Total: $${total.get()}`);
});

price.set(150); // 输出: Total: $300
```

---

## 二、关键数据更新

### 2.1 框架与工具使用率（State of JS 2025）

| 项目 | 2024 数据 | 2025 数据 | 变化 | 满意度 |
|------|----------|----------|------|--------|
| **React** | 使用率 ~82% | **83.6%** | +1.6pp | 高（但 Next.js 复杂度引争议） |
| **Next.js** | 使用率 ~55% | **59%** | +4pp | 21% 正面 / 17% 负面（最多评论） |
| **Vue** | 使用率 ~50% | ~48% | -2pp | 高 |
| **Angular** | 使用率 ~45% | ~42% | -3pp | 中等 |
| **Svelte** | 使用率 ~28% | ~32% | +4pp | **第 1 名**（连续 5 年最高满意度） |
| **Solid.js** | 使用率 ~12% | ~15% | +3pp | **最高满意度** |
| **Vite** | 使用率 ~78% | **84%** | +6pp | **98%** |
| **Webpack** | 使用率 ~88% | **87%** | -1pp | **26%** (↓ from 36%) |
| **Turbopack** | 使用率 ~15% | **28%** | +13pp | 上升中 |
| **Node.js** | 后端 ~88% | **90%** | +2pp | 稳定 |
| **Bun** | 后端 ~17% | **21%** | +4pp | 快速增长 |
| **Deno** | 后端 ~13% | **11%** | -2pp | 稳定 |

### 2.2 语言与运行时

| 项目 | 2025 数据 | 2026-04 数据 | 变化 |
|------|----------|-------------|------|
| **TypeScript** | GitHub #3 语言 | **GitHub #3** (新仓库数超 Python) | 持续上升 |
| **Node.js** | 下载 50 亿/年 | 下载 **55 亿/年** | +10% |
| **Bun** | v1.1 | **v1.2+** (v2.0 预期 2026 H2) | 稳定迭代 |
| **Deno** | v1.x | **v2.x** (v3.0 RC) | 重大版本 |
| **React** | v18 | **v19** (Compiler 1.0 Stable) | 稳定 |
| **Vue** | v3.4 | **v3.5** / Vapor Mode | 新范式 |
| **Hono** | 25K stars | **~22K stars** (~2M npm/周) | 调整（更精确统计） |
| **MCP SDK** | 创建 | **9700 万月下载**，10000+ Servers | 爆发 |

---

## 三、收购与治理事件

| 时间 | 事件 | 影响 |
|------|------|------|
| 2025 Q4 | Bun / Anthropic 合作 | AI 工具链集成，Bun 内置 AI SDK 支持 |
| 2025 Q4 | Cloudflare 收购 Astro | 边缘框架深化，Astro + Workers 原生集成 |
| 2026 Q1 | Neon / Databricks | 边缘数据库企业化，Serverless Postgres 竞争加剧 |
| 2026 Q1 | VoidZero (Evan You) / NuxtLabs | Vite + Nuxt 统一工具链生态，Rolldown 商业化 |
| 2026 Q1 | React Foundation 成立 | React 长期治理结构独立（脱离 Meta 单一控制） |
| 2025-12 | MCP 捐赠 Linux Foundation (AAIF) | 成为厂商中立的 Agent 基础设施标准 |

---

## 四、2026-2027 预判

| 方向 | 置信度 | 时间线 | 关键驱动力 |
|------|--------|--------|-----------|
| TypeScript 类型系统运行时化 | 中 | 2027-2028 | TC39 类型注解提案、Deno/Bun 原生 TS |
| WASM 作为性能关键路径标准后端 | 高 | 2026-2027 | WasmGC 成熟、WASI 1.0 (2026-2027)、组件模型 |
| AI 原生 IDE 成为默认 | 高 | 2026 | Cursor 26%、Claude Code 5.5x 收入增长 |
| WinterCG API 全面统一 | 中 | 2027 | Ecma TC55 标准化、Hono/WinterTC 合规 |
| Secure-by-default 新标准 | 中 | 2027 | npm 供应链攻击、Deno 权限模型、Node Permission |
| React Compiler 消除手动 memoization | 高 | 2026-2027 | React 19.1+ 默认启用、框架广泛采纳 |
| Partial Prerendering (PPR) 成为默认 | 高 | 2026-2027 | Next.js 15 PPR Stable、其他框架跟进 |

---

## 五、开发者幸福感

State of JS 2025 显示：开发者整体幸福感连续第 5 年保持在 **3.8/5**，表明生态系统正在**稳定而非剧烈动荡**。

> *"The ecosystem is settling rather than churning."* — State of JS 2025 结论

---

## 参考来源

1. **State of JS 2025** — [官方结果](https://stateofjs.com/) (2026-02 发布，2025-11 调查)
2. **Stack Overflow 2025 Developer Survey** — [Developer Survey](https://stackoverflow.com/insights/survey/2025) (2025)
3. **Tech Insider** — [TypeScript vs JavaScript 2026](https://tech-insider.org/typescript-vs-javascript-2026-2/) (2026-04-25)
4. **InfoQ** — [State of JS 2025 分析](https://www.infoq.com/news/2026/03/state-of-js-survey-2025/) (2026-03-20)
5. **JetBrains Developer Ecosystem 2025** — [调查报告](https://blog.jetbrains.com/rust/2026/01/27/rust-vs-javascript-typescript/) (2025)
6. **RadixWeb** — [JavaScript Statistics 2026](https://radixweb.com/blog/top-javascript-usage-statistics) (2026-04-16)
7. **Node.js Documentation** — [Type Stripping](https://nodejs.org/api/typescript.html#type-stripping) (Node.js 24+)
8. **Bun Documentation** — [Bun SQLite](https://bun.sh/docs/api/sqlite) & [HTTP Server](https://bun.sh/docs/api/http)
9. **Deno Documentation** — [Permissions](https://docs.deno.com/runtime/fundamentals/security/) & [Deno 2 Migration](https://docs.deno.com/runtime/reference/migration_guide/)
10. **TC39 Signals Proposal** — [GitHub tc39/proposal-signals](https://github.com/tc39/proposal-signals) (Stage 1)
11. **Vercel AI SDK** — [MCP Integration](https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling#model-context-protocol-mcp-tools)
12. **VoidZero / Rolldown** — [Rolldown 1.0 Release](https://rolldown.rs/) (2026-04)
