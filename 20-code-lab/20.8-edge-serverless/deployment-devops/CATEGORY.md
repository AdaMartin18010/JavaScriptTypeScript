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

### Docker Compose 本地开发栈生成

```typescript
// docker-compose-gen.ts — 生成本地开发用 Docker Compose 配置
interface ServiceConfig {
  name: string;
  image: string;
  ports: string[];
  env?: Record<string, string>;
  volumes?: string[];
  dependsOn?: string[];
}

export function generateCompose(services: ServiceConfig[]): string {
  const lines = ['services:'];
  for (const svc of services) {
    lines.push(`  ${svc.name}:`);
    lines.push(`    image: ${svc.image}`);
    lines.push(`    ports:`);
    for (const p of svc.ports) lines.push(`      - "${p}"`);
    if (svc.env) {
      lines.push(`    environment:`);
      for (const [k, v] of Object.entries(svc.env)) {
        lines.push(`      ${k}: ${v}`);
      }
    }
    if (svc.volumes) {
      lines.push(`    volumes:`);
      for (const vol of svc.volumes) lines.push(`      - ${vol}`);
    }
    if (svc.dependsOn) {
      lines.push(`    depends_on:`);
      for (const dep of svc.dependsOn) lines.push(`      - ${dep}`);
    }
  }
  return lines.join('\n');
}

// 示例：生成本地全栈开发环境
console.log(generateCompose([
  { name: 'app', image: 'node:20-alpine', ports: ['3000:3000'], dependsOn: ['db', 'redis'] },
  { name: 'db', image: 'postgres:16-alpine', ports: ['5432:5432'], env: { POSTGRES_DB: 'dev' }, volumes: ['pgdata:/var/lib/postgresql/data'] },
  { name: 'redis', image: 'redis:7-alpine', ports: ['6379:6379'] },
]));
```

### Kubernetes 部署清单生成

```typescript
// k8s-manifest-gen.ts — 生成基础 K8s Deployment + Service
interface K8sDeploymentConfig {
  name: string;
  image: string;
  replicas: number;
  port: number;
  env?: Record<string, string>;
}

export function generateK8sManifest(config: K8sDeploymentConfig): string {
  const envBlock = config.env
    ? Object.entries(config.env).map(([k, v]) =>
        `        - name: ${k}\n          value: "${v}"`).join('\n')
    : '';

  return `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${config.name}
spec:
  replicas: ${config.replicas}
  selector:
    matchLabels:
      app: ${config.name}
  template:
    metadata:
      labels:
        app: ${config.name}
    spec:
      containers:
      - name: app
        image: ${config.image}
        ports:
        - containerPort: ${config.port}
${envBlock}
        livenessProbe:
          httpGet:
            path: /health
            port: ${config.port}
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: ${config.port}
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: ${config.name}
spec:
  selector:
    app: ${config.name}
  ports:
  - port: 80
    targetPort: ${config.port}
  type: ClusterIP
`.trim();
}
```

### Terraform CDK (cdktf) 基础设施即代码

```typescript
// cdktf-stack.ts — 使用 CDK for Terraform 定义 Cloudflare Workers 基础设施
import { Construct } from 'constructs';
import { App, TerraformStack, CloudBackend, NamedCloudWorkspace } from 'cdktf';
import { CloudflareProvider, WorkerScript, WorkerRoute } from '@cdktf/provider-cloudflare';

class EdgeStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new CloudflareProvider(this, 'cloudflare', {
      apiToken: process.env.CLOUDFLARE_API_TOKEN!,
    });

    const worker = new WorkerScript(this, 'edge-worker', {
      name: 'api-gateway',
      content: `export default { async fetch(req) { return new Response('OK'); } };`,
      module: true,
    });

    new WorkerRoute(this, 'api-route', {
      zoneId: process.env.CLOUDFLARE_ZONE_ID!,
      pattern: 'api.example.com/*',
      scriptName: worker.name,
    });
  }
}

const app = new App();
const stack = new EdgeStack(app, 'edge-infra');
new CloudBackend(stack, {
  hostname: 'app.terraform.io',
  organization: 'my-org',
  workspaces: new NamedCloudWorkspace('edge-production'),
});
app.synth();
```

### 多阶段 Docker Buildx 构建（跨平台）

```typescript
// docker-buildx.ts — 生成跨平台 Edge Worker 构建命令
interface BuildxConfig {
  platforms: string[];       // e.g. ['linux/amd64', 'linux/arm64']
  tags: string[];
  push: boolean;
  cacheTo?: string;
  cacheFrom?: string;
}

export function generateBuildxCommand(config: BuildxConfig): string {
  const parts = [
    'docker buildx build',
    `--platform ${config.platforms.join(',')}`,
    ...config.tags.map((t) => `-t ${t}`),
    config.push ? '--push' : '--load',
    config.cacheTo ? `--cache-to=type=registry,ref=${config.cacheTo}` : '',
    config.cacheFrom ? `--cache-from=type=registry,ref=${config.cacheFrom}` : '',
    '.',
  ];
  return parts.filter(Boolean).join(' \
  ');
}

// 示例输出
console.log(generateBuildxCommand({
  platforms: ['linux/amd64', 'linux/arm64'],
  tags: ['ghcr.io/myorg/edge-worker:v1.2.0'],
  push: true,
  cacheTo: 'ghcr.io/myorg/edge-worker:cache',
}));
```

### GitHub Actions 矩阵部署（多环境 + 金丝雀）

```yaml
# .github/workflows/edge-deploy.yml
name: Edge Multi-Environment Deploy

on:
  push:
    branches: [main, canary]

jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [staging, production]
        include:
          - environment: staging
            cloudflare_account: ${{ secrets.CF_ACCOUNT_STAGING }}
            route: 'api-staging.example.com/*'
          - environment: production
            cloudflare_account: ${{ secrets.CF_ACCOUNT_PROD }}
            route: 'api.example.com/*'
    environment:
      name: ${{ matrix.environment }}
      url: https://${{ matrix.route }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ matrix.cloudflare_account }}
          command: deploy --env ${{ matrix.environment }}
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
| Docker — Multi-stage builds](<https://docs.docker.com/build/building/multi-stage/>) | 文档 | [docs.docker.com/build/building/multi-stage](https://docs.docker.com/build/building/multi-stage/) |
| Kubernetes — Health Checks](<https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/>) | 文档 | [kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) |
| GitHub Actions — Reusable Workflows](<https://docs.github.com/en/actions/sharing-automations/reusing-workflows>) | 文档 | [docs.github.com/en/actions/sharing-automations/reusing-workflows](https://docs.github.com/en/actions/sharing-automations/reusing-workflows) |
| Cloud Native Computing Foundation](<https://www.cncf.io/>) | 组织 | [cncf.io](https://www.cncf.io/) |
| Terraform — AWS Provider](<https://registry.terraform.io/providers/hashicorp/aws/latest/docs>) | 文档 | [registry.terraform.io/providers/hashicorp/aws/latest/docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) |
| Docker Compose Specification | 规范 | [github.com/compose-spec/compose-spec](https://github.com/compose-spec/compose-spec) |
| Kubernetes Documentation | 官方文档 | [kubernetes.io/docs](https://kubernetes.io/docs/) |
| Helm — Kubernetes 包管理 | 官方文档 | [helm.sh/docs](https://helm.sh/docs/) |
| Argo CD — GitOps 持续交付 | 官方文档 | [argo-cd.readthedocs.io](https://argo-cd.readthedocs.io/) |
| GitHub Actions — Composite Actions | 官方文档 | [docs.github.com/en/actions/sharing-automations/creating-a-composite-action](https://docs.github.com/en/actions/sharing-automations/creating-a-composite-action) |
| Podman Documentation | 官方文档 | [podman.io/docs](https://podman.io/docs) |
| BuildKit / Buildx | 文档 | [docs.docker.com/build/buildkit](https://docs.docker.com/build/buildkit/) |
| SLSA — Supply-chain Levels for Software Artifacts | 规范 | [slsa.dev](https://slsa.dev/) |
| Cosign — Container Signing | 仓库 | [github.com/sigstore/cosign](https://github.com/sigstore/cosign) |
| Terraform CDK Documentation | 官方文档 | [developer.hashicorp.com/terraform/cdktf](https://developer.hashicorp.com/terraform/cdktf) |
| Cloudflare Wrangler CLI | 官方文档 | [developers.cloudflare.com/workers/wrangler](https://developers.cloudflare.com/workers/wrangler/) |
| Vercel CLI Documentation | 官方文档 | [vercel.com/docs/cli](https://vercel.com/docs/cli) |
| Deno Deployctl | 官方文档 | [docs.deno.com/deploy/manual/deployctl](https://docs.deno.com/deploy/manual/deployctl/) |
| Docker BuildKit Documentation | 官方文档 | [docs.docker.com/build/buildkit](https://docs.docker.com/build/buildkit/) |
| GitHub Actions — Deployment Environments | 官方文档 | [docs.github.com/en/actions/deployment/targeting-different-environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment) |
| GitHub Actions — Reusable Workflows | 官方文档 | [docs.github.com/en/actions/sharing-automations/reusing-workflows](https://docs.github.com/en/actions/sharing-automations/reusing-workflows) |
| Google Cloud Build Documentation | 官方文档 | [cloud.google.com/build/docs](https://cloud.google.com/build/docs) |
| AWS CodePipeline Documentation | 官方文档 | [docs.aws.amazon.com/codepipeline](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html) |
| Azure DevOps Pipelines | 官方文档 | [learn.microsoft.com/en-us/azure/devops/pipelines](https://learn.microsoft.com/en-us/azure/devops/pipelines/) |
| Fly.io Deployment Docs | 官方文档 | [fly.io/docs](https://fly.io/docs/) |
| Railway Deployment Docs | 官方文档 | [docs.railway.app](https://docs.railway.app/) |

---

*最后更新: 2026-04-29*
