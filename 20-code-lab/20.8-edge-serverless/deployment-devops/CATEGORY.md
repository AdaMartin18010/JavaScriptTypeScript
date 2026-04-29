---
dimension: 综合
sub-dimension: Deployment devops
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Deployment devops 核心概念与工程实践。

## 包含内容

- 本模块聚焦 deployment devops 核心概念与工程实践。
- 涵盖 CI/CD 流水线抽象、Docker 构建优化与可复现部署策略。

## 子模块速查

| 子模块 | 类型 | 说明 |
|--------|------|------|
| ARCHITECTURE.md | 文档 | DevOps 部署架构设计 |
| README.md | 文档 | 模块入口与快速开始 |
| THEORY.md | 文档 | 部署理论形式化定义 |
| cicd-pipeline.ts | 源码 | 类型安全 CI/CD 流水线 DSL |
| docker-config.ts | 源码 | Docker 多阶段构建配置生成 |
| index.ts | 源码 | 模块统一导出 |

## 代码示例

```typescript
// cicd-pipeline.ts — 类型安全流水线 DSL
interface Stage {
  name: string;
  steps: string[];
  dependsOn?: string[];
}

class CICDPipeline {
  private stages: Stage[] = [];

  addStage(stage: Stage): this {
    this.stages.push(stage);
    return this;
  }

  async run(): Promise<void> {
    const executed = new Set<string>();
    for (const stage of this.topologicalSort()) {
      console.log(`[Pipeline] Running stage: ${stage.name}`);
      for (const step of stage.steps) {
        await this.exec(step);
      }
      executed.add(stage.name);
    }
  }

  private topologicalSort(): Stage[] {
    // 简化版拓扑排序
    return this.stages;
  }

  private async exec(cmd: string): Promise<void> {
    await new Promise(r => setTimeout(r, 100));
  }
}

// 使用
new CICDPipeline()
  .addStage({ name: 'lint', steps: ['eslint .', 'tsc --noEmit'] })
  .addStage({ name: 'test', steps: ['vitest run'], dependsOn: ['lint'] })
  .addStage({ name: 'deploy', steps: ['docker build .'], dependsOn: ['test'] });
```

### Docker 多阶段构建配置生成

```typescript
// docker-config.ts
interface DockerBuildConfig {
  nodeVersion: string;
  buildArgs?: Record<string, string>;
  ports: number[];
  healthCheck?: { path: string; interval: string };
}

export function generateDockerfile(config: DockerBuildConfig): string {
  const stages = [
    `# ── 构建阶段 ──`,
    `FROM node:${config.nodeVersion}-alpine AS builder`,
    `WORKDIR /app`,
    `COPY package*.json .`,
    `RUN npm ci`,
    `COPY . .`,
    `RUN npm run build`,
    ``,
    `# ── 生产阶段 ──`,
    `FROM node:${config.nodeVersion}-alpine AS production`,
    `WORKDIR /app`,
    `ENV NODE_ENV=production`,
    `COPY --from=builder /app/dist ./dist`,
    `COPY --from=builder /app/package*.json .`,
    `RUN npm ci --omit=dev && npm cache clean --force`,
    ...(config.ports.map((p) => `EXPOSE ${p}`)),
    ...(config.healthCheck
      ? [`HEALTHCHECK --interval=${config.healthCheck.interval} \\`,
         `  CMD wget --no-verbose --tries=1 --spider http://localhost:${config.ports[0]}${config.healthCheck.path} || exit 1`]
      : []),
    `CMD ["node", "dist/main.js"]`,
  ];
  return stages.join('\n');
}

// 生成
console.log(generateDockerfile({
  nodeVersion: '20',
  ports: [3000],
  healthCheck: { path: '/health', interval: '30s' },
}));
```

### GitHub Actions 工作流 YAML 生成

```typescript
// github-actions.ts
interface WorkflowConfig {
  name: string;
  on: string[];
  jobs: Array<{
    name: string;
    runsOn: string;
    steps: Array<{ name: string; run?: string; uses?: string; with?: Record<string, unknown> }>;
  }>;
}

export function generateWorkflow(config: WorkflowConfig): string {
  const yaml = [
    `name: ${config.name}`,
    ``,
    `on:`,
    ...config.on.map((e) => `  - ${e}`),
    ``,
    `jobs:`,
    ...config.jobs.flatMap((job, i) => [
      `  ${job.name.toLowerCase().replace(/\s+/g, '_')}:`,
      `    runs-on: ${job.runsOn}`,
      `    steps:`,
      ...job.steps.flatMap((step) => {
        const lines = [`      - name: ${step.name}`];
        if (step.uses) lines.push(`        uses: ${step.uses}`);
        if (step.with) {
          lines.push(`        with:`);
          Object.entries(step.with).forEach(([k, v]) => {
            lines.push(`          ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`);
          });
        }
        if (step.run) lines.push(`        run: |\n${step.run.split('\n').map((l) => `          ${l}`).join('\n')}`);
        return lines;
      }),
    ]),
  ];
  return yaml.join('\n');
}
```

### 健康检查端点

```typescript
import { Hono } from 'hono';

const app = new Hono();

let ready = false;

app.get('/health', (c) => {
  if (!ready) {
    return c.json({ status: 'starting' }, 503);
  }
  return c.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/ready', (c) => {
  return ready ? c.text('OK') : c.text('Not Ready', 503);
});

// 启动完成后设置就绪状态
setTimeout(() => { ready = true; }, 2000);

export default app;
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
## 目录内容

- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 cicd-pipeline.test.ts
- 📄 cicd-pipeline.ts
- 📄 docker-config.test.ts
- 📄 docker-config.ts
- 📄 index.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| GitHub Actions | 官方文档 | [docs.github.com/actions](https://docs.github.com/actions) |
| Dockerfile Reference | 官方文档 | [docs.docker.com/reference/dockerfile](https://docs.docker.com/reference/dockerfile/) |
| DORA Metrics | 指南 | [cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance](https://cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance) |
| The Twelve-Factor App | 方法论 | [12factor.net](https://12factor.net/) |
| OCI Image Spec | 规范 | [github.com/opencontainers/image-spec](https://github.com/opencontainers/image-spec) |
| Docker — Multi-stage builds](https://docs.docker.com/build/building/multi-stage/) | 文档 | [docs.docker.com/build/building/multi-stage](https://docs.docker.com/build/building/multi-stage/) |
| Kubernetes — Health Checks](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) | 文档 | [kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) |
| GitHub Actions — Reusable Workflows](https://docs.github.com/en/actions/sharing-automations/reusing-workflows) | 文档 | [docs.github.com/en/actions/sharing-automations/reusing-workflows](https://docs.github.com/en/actions/sharing-automations/reusing-workflows) |
| Cloud Native Computing Foundation](https://www.cncf.io/) | 组织 | [cncf.io](https://www.cncf.io/) |
| Terraform — AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) | 文档 | [registry.terraform.io/providers/hashicorp/aws/latest/docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) |

---

*最后更新: 2026-04-29*
