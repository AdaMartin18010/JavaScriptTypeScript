---
title: '全栈 TypeScript 部署拓扑'
description: 'Fullstack TypeScript Deployment Topology: Monorepo, Turborepo, Docker vs V8 Isolate, Platform Lock-in'
last-updated: 2026-05-05
review-cycle: 6 months
next-review: 2026-11-05
status: complete
priority: P0
english-abstract: 'A comprehensive analysis of fullstack TypeScript deployment topologies, covering monorepo architectures with Turborepo and Nx, container-based vs V8 Isolate deployments, build system optimization, and platform lock-in trade-offs.'
references:
  - 'Vercel, Turborepo Documentation'
  - 'Nx, Monorepo Tools'
  - 'Docker, Container Best Practices'
  - 'Cloudflare, Pages and Workers'
  - 'AWS, Copilot and ECS'
---

# 全栈 TypeScript 部署拓扑

> **理论深度**: 高级
> **前置阅读**: [32-module-system-and-web-components.md](../70.4-web-platform-fundamentals/32-module-system-and-web-components.md), [34-edge-runtime-architecture.md](34-edge-runtime-architecture.md)
> **目标读者**: 平台工程师、DevOps 架构师、技术负责人
> **核心问题**: 如何将 TypeScript 单体应用高效部署到生产环境？容器和 Edge Isolate 的取舍是什么？

---

## 目录

- [全栈 TypeScript 部署拓扑](#全栈-typescript-部署拓扑)
  - [目录](#目录)
  - [1. Monorepo 架构范式](#1-monorepo-架构范式)
    - [1.1 Monorepo vs Polyrepo](#11-monorepo-vs-polyrepo)
    - [1.2 Turborepo 的任务管道](#12-turborepo-的任务管道)
    - [1.3 Nx 的分布式任务执行](#13-nx-的分布式任务执行)
  - [2. 构建系统与管道优化](#2-构建系统与管道优化)
    - [2.1 TypeScript 编译优化](#21-typescript-编译优化)
    - [2.2 Docker 多阶段构建](#22-docker-多阶段构建)
    - [2.3 Edge 部署的构建差异](#23-edge-部署的构建差异)
  - [3. 部署目标对比：容器 vs Isolate vs VM](#3-部署目标对比容器-vs-isolate-vs-vm)
    - [3.1 容器（Docker / Kubernetes）](#31-容器docker--kubernetes)
    - [3.2 V8 Isolate（Edge Runtime）](#32-v8-isolateedge-runtime)
    - [3.3 虚拟机（VM / Bare Metal）](#33-虚拟机vm--bare-metal)
  - [4. 平台锁定与可移植性](#4-平台锁定与可移植性)
    - [4.1 平台锁定的层次](#41-平台锁定的层次)
    - [4.2 缓解策略](#42-缓解策略)
  - [5. 边缘-中心混合拓扑](#5-边缘-中心混合拓扑)
    - [5.1 典型的全栈 TS 部署架构](#51-典型的全栈-ts-部署架构)
    - [5.2 数据同步策略](#52-数据同步策略)
  - [6. 范畴论语义：部署作为函子](#6-范畴论语义部署作为函子)
  - [7. 对称差分析：传统部署 vs 现代部署](#7-对称差分析传统部署-vs-现代部署)
  - [8. 工程决策矩阵](#8-工程决策矩阵)
  - [9. 反例与局限性](#9-反例与局限性)
    - [9.1 "一键部署"的幻觉](#91-一键部署的幻觉)
    - [9.2 Edge Runtime 的 npm 兼容性陷阱](#92-edge-runtime-的-npm-兼容性陷阱)
    - [9.3 Monorepo 的依赖地狱](#93-monorepo-的依赖地狱)
    - [9.4 远程缓存的安全性](#94-远程缓存的安全性)
  - [TypeScript 代码示例](#typescript-代码示例)
    - [示例 1：Monorepo 包依赖分析器](#示例-1monorepo-包依赖分析器)
    - [示例 2：构建缓存命中率分析器](#示例-2构建缓存命中率分析器)
    - [示例 3：运行时能力检测器](#示例-3运行时能力检测器)
    - [示例 4：Docker 层缓存优化器](#示例-4docker-层缓存优化器)
    - [示例 5：蓝绿部署切换器](#示例-5蓝绿部署切换器)
    - [示例 6：平台锁定风险评估器](#示例-6平台锁定风险评估器)
  - [参考文献](#参考文献)

---

## 1. Monorepo 架构范式

### 1.1 Monorepo vs Polyrepo

**Monorepo**（单一代码仓库）将所有相关项目（前端、后端、共享库、工具）放在同一个 Git 仓库中管理：

**优势**：

- **原子提交**：跨项目的更改可以在一次提交中完成，保证一致性
- **代码共享**：共享库（types、utils、schemas）无需发布 npm 包即可被多个应用引用
- **统一工具链**：相同的 ESLint、TypeScript、测试配置
- **依赖图可视化**：构建系统可以分析项目间的依赖关系，优化构建顺序

**劣势**：

- **仓库规模**：大型 monorepo 的 Git 操作变慢（`git status` 可能需要数秒）
- **权限管理**：无法为不同项目设置细粒度的访问控制
- **CI/CD 复杂度**：任何更改都可能触发全量构建（需要增量构建优化）

### 1.2 Turborepo 的任务管道

Turborepo 通过**任务管道（Task Pipeline）**和**远程缓存（Remote Cache）**优化 monorepo 构建：

```json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test": { "dependsOn": ["build"], "outputs": [] },
    "lint": { "dependsOn": [], "outputs": [] }
  }
}
```

**核心机制**：

- **拓扑排序**：根据 `dependsOn` 构建依赖图，确保先构建依赖项
- **输入哈希**：计算每个任务的输入文件哈希，若未变更则跳过
- **远程缓存**：将构建产物上传到 Vercel 或自托管缓存服务器，团队成员共享

**性能数据**：

- Next.js 仓库使用 Turborepo 后，CI 构建时间从 30 分钟减少到 5 分钟
- 本地开发中，未变更包的构建被完全跳过

### 1.3 Nx 的分布式任务执行

Nx 提供了更激进的**分布式任务执行（DTE）**：

- 将构建任务分发到多个 CI Agent 并行执行
- 自动处理任务间的依赖关系，确保正确的执行顺序
- 支持**affected 命令**：只构建和测试受当前更改影响的项目

**与 Turborepo 的对比**：

- Turborepo 更轻量，学习曲线低，适合中小型 monorepo
- Nx 功能更丰富（代码生成、模块边界规则、更强大的图分析），适合大型 enterprise monorepo

---

## 2. 构建系统与管道优化

### 2.1 TypeScript 编译优化

**Project References**：

- TypeScript 3.0+ 支持项目引用，将 monorepo 拆分为多个 `tsconfig.json` 项目
- 每个项目独立编译，通过 `.d.ts` 文件暴露公共 API
- 增量编译：只有变更的项目及其依赖需要重新编译

**SWC / esbuild 替代 tsc**：

- `tsc` 的编译速度为 ~50K LOC/s
- `esbuild` 的编译速度为 ~1000K LOC/s（20 倍提升）
- `SWC`（Rust 编写）的编译速度为 ~800K LOC/s
- 但 `esbuild` 和 `SWC` 只做转译，不做类型检查，需要并行运行 `tsc --noEmit`

### 2.2 Docker 多阶段构建

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
CMD ["node", "dist/main.js"]
```

**优化策略**：

- 利用层缓存：依赖变更频率低，代码变更频率高
- `node:alpine` 镜像：从 1GB+ 减少到 ~200MB
- `pnpm deploy`：仅复制生产依赖，移除 devDependencies

### 2.3 Edge 部署的构建差异

Edge Runtime 的构建与容器有本质差异：

- **无 Node.js 核心模块**：`fs`、`path`、`crypto`（部分）不可用，需使用 Web API 替代
- **Bundle 大小限制**：Cloudflare Workers 100MB（gzip 后），Vercel Edge 1MB
- **Tree Shaking 关键**：未使用的代码必须被完全移除，否则可能超出大小限制
- **平台 polyfill**：构建工具自动将 Node.js API 替换为 Edge-compatible 实现

---

## 3. 部署目标对比：容器 vs Isolate vs VM

### 3.1 容器（Docker / Kubernetes）

**适用场景**：

- 长时间运行的服务（WebSocket 服务器、消息队列消费者）
- 需要自定义运行时环境（特定 libc 版本、系统库）
- 大内存需求（> 4GB）或 GPU 访问

**部署流程**：

1. 构建 Docker 镜像
2. 推送到容器仓库（ECR、GCR、ACR）
3. 部署到 Kubernetes / ECS / Cloud Run
4. 配置负载均衡、自动扩展、健康检查

**复杂性**：

- 需要管理 Dockerfile、镜像安全扫描、CVE 补丁
- Kubernetes 的学习曲线陡峭（Pod、Service、Ingress、ConfigMap、Secret）
- 冷启动：分钟级（节点预配 + 镜像拉取 + 容器启动）

### 3.2 V8 Isolate（Edge Runtime）

**适用场景**：

- 请求响应型 API（REST、GraphQL）
- 内容分发和转换（HTML 重写、A/B 测试）
- 轻量级认证和授权中间件

**部署流程**：

1. `wrangler deploy`（Cloudflare）或 `vercel deploy`（Vercel）
2. 构建工具自动打包、优化、上传
3. 全球 PoP 在数秒内生效

**限制**：

- 无文件系统访问（`fs` 模块不可用）
- 无原生模块（无法使用 `bcrypt`、`sharp` 等依赖 C++ 扩展的包）
- 执行时间和内存严格受限

### 3.3 虚拟机（VM / Bare Metal）

**适用场景**：

- 极端性能要求（高频交易、游戏服务器）
- 合规要求（需要独占硬件、特定区域的数据驻留）
- 遗留系统迁移（无法容器化的应用）

**劣势**：

- 资源利用率低（平均 CPU 利用率 < 20%）
- 运维负担重（OS 补丁、安全更新、备份）
- 扩展缓慢（分钟到小时级）

---

## 4. 平台锁定与可移植性

### 4.1 平台锁定的层次

**Level 1 — 运行时 API 锁定**：

- Cloudflare Workers 的 `caches`、`crypto.subtle`、`ENV` 访问方式
- Vercel Edge 的 `geo`、`ip` 对象
- 这些代码无法直接迁移到其他平台

**Level 2 — 构建工具锁定**：

- `wrangler.toml`、`vercel.json`、`netlify.toml` 的配置格式差异
- 构建命令和输出目录的约定不同

**Level 3 — 生态系统锁定**：

- Cloudflare D1、Vercel Postgres、Supabase 等绑定的数据库服务
- 迁移数据需要 ETL 流程，成本高

### 4.2 缓解策略

**抽象层（Abstraction Layer）**：

- 使用 Hono、Express、Elysia 等跨运行时框架
- 将平台特定代码隔离在适配器（Adapter）中

**基础设施即代码（IaC）**：

- Terraform / Pulumi 定义可移植的基础设施
- 但 Edge Runtime 的配置往往不在 Terraform 覆盖范围内

**多云策略**：

- 核心逻辑使用标准 Web API（Fetch、WebCrypto、Streams）
- 平台特定功能通过条件编译或运行时检测注入

---

## 5. 边缘-中心混合拓扑

### 5.1 典型的全栈 TS 部署架构

```
[用户] → [CDN / Edge] → [Origin]
                ↓              ↓
          [静态资源]      [API 网关]
          [边缘函数]      [容器/VM]
          [缓存]          [数据库]
```

**边缘层（Edge Layer）**：

- 静态资源缓存（HTML、JS、CSS、图片）
- 边缘函数处理认证、A/B 测试、地理位置路由
- KV 缓存存储用户会话、配置

**中心层（Origin Layer）**：

- API 服务处理业务逻辑、数据库事务
- 长时间运行的任务（报表生成、数据分析）
- 无法边缘化的服务（WebSocket 集群、消息队列）

### 5.2 数据同步策略

边缘节点与中心数据库的数据同步是混合架构的核心挑战：

**读取路径**：

- 边缘 KV 缓存热点数据（用户配置、商品信息）
- 缓存未命中时回源到中心数据库
- 使用 stale-while-revalidate 减少延迟

**写入路径**：

- 边缘函数将写操作转发到中心 API
- 或使用异步队列（SQS、RabbitMQ）解耦
- 写后立即失效边缘缓存（或通过 TTL 自然过期）

---

## 6. 范畴论语义：部署作为函子

将**部署过程**形式化为一个**函子** **D: Code → Runtime**：

- **源范畴 Code**：TypeScript 源代码及其模块依赖图
- **目标范畴 Runtime**：运行时的执行环境（容器、Isolate、VM）
- **对象映射**：源码文件 → 编译产物（JS bundle / WASM / Docker image）
- **态射映射**：`import` 关系 → 运行时链接关系（动态导入 / 静态链接）

**函子性质**：

- **保持复合**：如果模块 A 导入 B，B 导入 C，则部署后的 A 可以访问 C（通过 B 的导出）
- **不保持同构**：源码层面的等价（如重构）可能在运行时产生不同的 bundle（Tree Shaking 效果不同）

**自然变换视角**：
不同构建工具（Webpack、esbuild、Rollup、Turbopack）可以看作从 **Code** 到 **Runtime** 的不同函子。它们之间的"等价性"（如输出行为一致）对应于**自然变换**。

---

## 7. 对称差分析：传统部署 vs 现代部署

| 维度 | 传统部署（VM + 手动配置） | 现代部署（Edge + CI/CD） | 交集 |
|------|------------------------|------------------------|------|
| 部署频率 | 周/月级 | 分钟/小时级 | 版本控制 |
| 回滚能力 | 慢（需重新部署） | 快（流量切换） | 蓝绿部署 |
| 资源管理 | 手动扩缩容 | 自动扩缩容 | 监控指标 |
| 地理分布 | 单区域或多区域手动配置 | 全球 PoP 自动分布 | DNS 路由 |
| 成本模型 | 固定成本（预留资源） | 可变成本（按使用） | 网络带宽 |
| 运维负担 | 高（OS 补丁、安全） | 低（平台托管） | 应用日志 |
| 调试能力 | 强（SSH、核心转储） | 弱（分布式日志） | 错误追踪 |
| 供应商锁定 | 低（可迁移 VM） | 高（Edge API 差异） | HTTP 接口 |

---

## 8. 工程决策矩阵

| 场景 | 推荐方案 | 理由 | 风险 |
|------|---------|------|------|
| 创业团队 MVP | Vercel / Netlify / Cloudflare Pages | 零运维，全球 CDN，自动 HTTPS | 流量增长后成本激增 |
| 企业级单体应用 | Kubernetes (EKS/GKE) + Docker | 完全控制，合规友好 | 运维复杂，需要 SRE 团队 |
| 微服务架构 | 混合：Edge（网关）+ K8s（服务） | 边缘处理路由/缓存，中心处理业务 | 架构复杂，调试困难 |
| 高频实时应用 | 专用 VM / Bare Metal | 网络延迟最低，无虚拟化开销 | 扩展慢，利用率低 |
| 合规敏感（金融/医疗） | 私有云 / 混合云 | 数据驻留，审计可控 | 成本高，技术债务大 |
| 开源项目 / 文档站 | GitHub Pages / Cloudflare Pages | 免费，与 Git 工作流集成 | 动态功能受限 |
| 大型 Monorepo | Turborepo + Vercel / Nx + AWS | 增量构建，远程缓存 | 配置复杂，学习曲线 |
| 多语言混合团队 | Docker + Kubernetes | 统一部署接口，语言无关 | 容器镜像管理负担 |

---

## 9. 反例与局限性

### 9.1 "一键部署"的幻觉

某团队使用 Vercel 部署 Next.js 应用，初期体验极佳：

- 但需要在 `vercel.json` 中配置复杂的路由重写和头部规则
- 需要设置环境变量、数据库连接字符串、第三方 API 密钥
- 需要配置 DNS、SSL 证书、自定义域名
- "一键部署"实际上掩盖了大量的平台特定配置

### 9.2 Edge Runtime 的 npm 兼容性陷阱

某团队将现有 Express 应用迁移到 Cloudflare Workers：

- 发现 `express` 依赖 `http` 模块，在 Workers 中不可用
- `bcrypt` 依赖原生 C++ 模块，无法打包
- 被迫重写路由层（切换到 Hono），更换密码哈希库（切换到 `bcryptjs`）
- 迁移成本远超预期

### 9.3 Monorepo 的依赖地狱

某团队将 50 个微服务合并为 monorepo：

- 不同服务依赖不同版本的 `lodash`、`react`、`typescript`
- pnpm 的 workspace 虽然支持多版本，但构建缓存失效频繁
- 一个服务的类型错误导致整个 CI 管道失败
- 解决方案：严格的模块边界规则（Nx enforced boundaries），共享库的版本锁定

### 9.4 远程缓存的安全性

Turborepo 的远程缓存默认使用 Vercel 的服务器：

- 构建产物（包含编译后的代码、环境变量注入）被上传到第三方服务器
- 某些企业合规要求禁止源代码离开公司网络
- 解决方案：自托管远程缓存（S3 + Turborepo 自定义远程缓存配置）

---

## TypeScript 代码示例

### 示例 1：Monorepo 包依赖分析器

```typescript
interface PackageJson {
  name: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

class MonorepoAnalyzer {
  private packages = new Map<string, PackageJson>();

  addPackage(pkg: PackageJson) {
    this.packages.set(pkg.name, pkg);
  }

  getDependencyGraph(): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();
    for (const [name, pkg] of this.packages) {
      const deps = new Set<string>();
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      for (const depName of Object.keys(allDeps)) {
        if (this.packages.has(depName)) deps.add(depName);
      }
      graph.set(name, deps);
    }
    return graph;
  }

  detectCircularDependencies(): string[][] {
    const graph = this.getDependencyGraph();
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (node: string, path: string[]) => {
      visited.add(node);
      recStack.add(node);
      path.push(node);

      for (const neighbor of graph.get(node) || []) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path]);
        } else if (recStack.has(neighbor)) {
          const cycleStart = path.indexOf(neighbor);
          cycles.push(path.slice(cycleStart).concat(neighbor));
        }
      }

      recStack.delete(node);
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) dfs(node, []);
    }

    return cycles;
  }
}
```

### 示例 2：构建缓存命中率分析器

```typescript
interface BuildTask {
  name: string;
  hash: string;
  cached: boolean;
  duration: number;
}

class BuildCacheAnalyzer {
  private tasks: BuildTask[] = [];

  record(task: BuildTask) {
    this.tasks.push(task);
  }

  getHitRate(): number {
    const cached = this.tasks.filter(t => t.cached).length;
    return cached / this.tasks.length;
  }

  getTimeSaved(): number {
    const uncachedAvg = this.tasks
      .filter(t => !t.cached)
      .reduce((sum, t) => sum + t.duration, 0) / this.tasks.filter(t => !t.cached).length || 1;

    return this.tasks
      .filter(t => t.cached)
      .reduce((sum, t) => sum + (uncachedAvg - t.duration), 0);
  }
}
```

### 示例 3：运行时能力检测器

```typescript
interface RuntimeCapabilities {
  nodejs: boolean;
  edge: boolean;
  supportsFS: boolean;
  supportsCrypto: boolean;
  supportsStreams: boolean;
  maxMemoryMB: number;
  maxExecutionTimeMs: number;
}

class RuntimeDetector {
  detect(): RuntimeCapabilities {
    const isNode = typeof process !== 'undefined' && !!process.versions?.node;
    const isEdge = typeof EdgeRuntime !== 'undefined' || typeof caches !== 'undefined';

    return {
      nodejs: isNode,
      edge: isEdge,
      supportsFS: isNode && typeof require !== 'undefined',
      supportsCrypto: typeof crypto !== 'undefined',
      supportsStreams: typeof ReadableStream !== 'undefined',
      maxMemoryMB: isNode ? 4096 : 128,
      maxExecutionTimeMs: isNode ? 0 : 50000,
    };
  }

  validateCompatibility(required: Partial<RuntimeCapabilities>): string[] {
    const current = this.detect();
    const issues: string[] = [];

    for (const [key, value] of Object.entries(required)) {
      const currentValue = current[key as keyof RuntimeCapabilities];
      if (typeof value === 'boolean' && value && !currentValue) {
        issues.push(`Runtime does not support: ${key}`);
      }
      if (typeof value === 'number' && typeof currentValue === 'number' && currentValue < value) {
        issues.push(`Runtime ${key} (${currentValue}) below required (${value})`);
      }
    }

    return issues;
  }
}
```

### 示例 4：Docker 层缓存优化器

```typescript
interface DockerfileLayer {
  command: string;
  files: string[];
  size: number;
}

class DockerfileOptimizer {
  analyzeLayers(layers: DockerfileLayer[]): { redundantLayers: number; optimizationSuggestions: string[] } {
    const suggestions: string[] = [];
    let redundant = 0;

    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];

      // Check for RUN apt-get update without cleanup
      if (layer.command.includes('apt-get update') && !layer.command.includes('rm -rf /var/lib/apt')) {
        suggestions.push(`Layer ${i}: Add 'rm -rf /var/lib/apt/lists/*' to reduce image size`);
      }

      // Check for npm install without package-lock
      if (layer.command.includes('npm install') && !layer.command.includes('package-lock')) {
        suggestions.push(`Layer ${i}: Use 'npm ci' with package-lock.json for reproducible builds`);
      }

      // Check for large files in wrong layer
      if (layer.size > 100 * 1024 * 1024 && i < layers.length - 1) {
        suggestions.push(`Layer ${i}: Large layer (${(layer.size / 1024 / 1024).toFixed(1)}MB) should be earlier to maximize cache hits`);
      }
    }

    return { redundantLayers: redundant, optimizationSuggestions: suggestions };
  }
}
```

### 示例 5：蓝绿部署切换器

```typescript
interface DeploymentVersion {
  id: string;
  color: 'blue' | 'green';
  trafficPercent: number;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
}

class BlueGreenDeployer {
  private versions: DeploymentVersion[] = [];

  addVersion(version: DeploymentVersion) {
    this.versions.push(version);
  }

  canPromote(versionId: string): { canPromote: boolean; reason?: string } {
    const version = this.versions.find(v => v.id === versionId);
    if (!version) return { canPromote: false, reason: 'Version not found' };
    if (version.healthStatus !== 'healthy') return { canPromote: false, reason: 'Version not healthy' };
    if (version.trafficPercent < 5) return { canPromote: false, reason: 'Version has no traffic (smoke test not performed)' };
    return { canPromote: true };
  }

  promote(versionId: string): void {
    const can = this.canPromote(versionId);
    if (!can.canPromote) throw new Error(can.reason);

    const target = this.versions.find(v => v.id === versionId)!;
    const otherColor = target.color === 'blue' ? 'green' : 'blue';

    // Shift all traffic to target
    target.trafficPercent = 100;
    for (const v of this.versions) {
      if (v.color === otherColor) v.trafficPercent = 0;
    }
  }
}
```

### 示例 6：平台锁定风险评估器

```typescript
interface PlatformDependency {
  service: string;
  api: string;
  migrationEffort: 'low' | 'medium' | 'high';
  alternatives: string[];
}

class LockInRiskAssessor {
  private deps: PlatformDependency[] = [];

  add(dep: PlatformDependency) {
    this.deps.push(dep);
  }

  assess(): { score: number; highRiskItems: PlatformDependency[] } {
    let score = 0;
    const highRisk: PlatformDependency[] = [];

    for (const dep of this.deps) {
      const effortScore = dep.migrationEffort === 'high' ? 3 : dep.migrationEffort === 'medium' ? 2 : 1;
      const alternativeScore = dep.alternatives.length === 0 ? 3 : dep.alternatives.length < 3 ? 1 : 0;
      const itemScore = effortScore + alternativeScore;
      score += itemScore;

      if (itemScore >= 5) highRisk.push(dep);
    }

    return { score, highRiskItems: highRisk };
  }
}
```

---

## 参考文献

1. Vercel. *Turborepo Documentation.* <https://turbo.build/repo/docs>
2. Nrwl. *Nx Documentation.* <https://nx.dev/getting-started/intro>
3. Docker. *Best Practices for Writing Dockerfiles.* <https://docs.docker.com/develop/dev-best-practices/>
4. Cloudflare. *Pages and Workers.* <https://developers.cloudflare.com/pages/>
5. AWS. *ECS Best Practices.* <https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/intro.html>
6. Kubernetes. *Production Best Practices.* <https://kubernetes.io/docs/setup/production-environment/>
7. Martin Fowler. *Monorepo vs Polyrepo.* <https://martinfowler.com/articles/monolith-vs-microservices.html>
8. Thoughtworks. *Technology Radar: Turborepo and Nx.* <https://www.thoughtworks.com/radar>
9. Google. *Bazel: Build and Test Tool.* <https://bazel.build/>
10. Deno. *Deploy Documentation.* <https://deno.com/deploy/docs>
