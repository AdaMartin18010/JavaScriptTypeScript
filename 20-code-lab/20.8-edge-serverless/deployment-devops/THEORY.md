# 部署与 DevOps — 理论基础

## 1. CI/CD 流水线

### 持续集成（CI）

- 代码提交后自动构建和测试
- 关键检查：单元测试、类型检查、代码风格、安全扫描
- 目标：快速发现集成问题，保持主干健康

### 持续交付/部署（CD）

- **持续交付**: 代码自动构建、测试，手动触发部署到生产
- **持续部署**: 通过所有检查后自动部署到生产
- 关键检查：集成测试、E2E 测试、性能基准、金丝雀分析

## 2. 基础设施即代码（IaC）

| 工具 | 范式 | 适用场景 |
|------|------|---------|
| **Terraform** | 声明式 | 多云资源管理 |
| **Pulumi** | 编程式 | 复杂逻辑基础设施 |
| **AWS CDK** | 编程式 | AWS 专属，TypeScript 友好 |
| **Ansible** | 命令式 | 服务器配置管理 |

### Terraform CDK for TypeScript（CDKTF）

```typescript
// cdktf-stack.ts — 用 TypeScript 定义 Terraform 基础设施
import { Construct } from 'constructs';
import { App, TerraformStack, TerraformOutput } from 'cdktf';
import { AwsProvider, ec2 } from '@cdktf/provider-aws';

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, 'AWS', { region: 'us-east-1' });

    const instance = new ec2.Instance(this, 'Compute', {
      ami: 'ami-0123456789abcdef0',
      instanceType: 't3.micro',
      tags: { Name: 'cdktf-example' },
    });

    new TerraformOutput(this, 'public_ip', { value: instance.publicIp });
  }
}

const app = new App();
new MyStack(app, 'cdktf-ts-demo');
app.synth();
```

## 3. GitOps

以 Git 为唯一真相来源的部署模式：

- **声明式**: 目标状态存储在 Git 中
- **版本化**: 所有变更可审计、可回滚
- **自动同步**: 控制器持续比较实际状态与期望状态
- **工具**: ArgoCD、Flux、GitLab CI + Kubernetes

## 4. 部署策略深度对比

| 策略 | 风险 | 资源需求 | 回滚速度 | 用户影响 | 实现复杂度 | 最佳场景 |
|------|------|---------|---------|---------|-----------|---------|
| **滚动更新 (Rolling)** | 中 | 1x | 慢（需重新部署旧版本） | 部分用户可能访问新旧版本 | 低 | 资源受限、允许短暂不一致 |
| **蓝绿部署 (Blue-Green)** | 低 | 2x | 秒级（切换负载均衡器） | 无（瞬时切换） | 中 | 金融交易、关键业务系统 |
| **金丝雀 (Canary)** | 低 | 1.1x-1.5x | 快（停止流量分配） | 极小（仅部分用户） | 高 | 大规模用户、A/B 验证 |
| **不可变部署 (Immutable)** | 低 | 2x | 快（替换整个实例组） | 无 | 中 | 云原生应用、容器化服务 |
| **A/B 测试** | 低 | 2x | 快 | 无 | 高 | 产品功能验证、转化率优化 |
| **影子流量 (Shadow)** | 极低 | 2x | 不适用 | 无（生产流量不返回） | 高 | 高压测试、新版本验证 |

## 5. 代码示例：GitHub Actions 蓝绿部署

```yaml
# .github/workflows/blue-green-deploy.yml
name: Blue-Green Deployment

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      APP_NAME: my-app
      RESOURCE_GROUP: prod-rg

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install & Build
        run: |
          npm ci
          npm run build

      - name: Determine inactive slot
        id: slot
        run: |
          # 获取当前生产槽位
          CURRENT=$(az webapp deployment slot list \
            --name ${{ env.APP_NAME }} \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --query "[?name!='production'].[name, state]" -o tsv | grep "Running" | head -1 | cut -f1)
          if [ "$CURRENT" == "staging" ]; then
            echo "target=blue" >> $GITHUB_OUTPUT
            echo "inactive=staging" >> $GITHUB_OUTPUT
          else
            echo "target=staging" >> $GITHUB_OUTPUT
            echo "inactive=blue" >> $GITHUB_OUTPUT
          fi

      - name: Deploy to inactive slot
        run: |
          az webapp deployment source config-zip \
            --name ${{ env.APP_NAME }} \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --slot ${{ steps.slot.outputs.target }} \
            --src ./dist.zip

      - name: Smoke test on target slot
        run: |
          SLOT_URL=$(az webapp show \
            --name ${{ env.APP_NAME }} \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --slot ${{ steps.slot.outputs.target }} \
            --query defaultHostName -o tsv)
          curl -sf "https://$SLOT_URL/health" || exit 1

      - name: Swap slots (Blue-Green switch)
        run: |
          az webapp deployment slot swap \
            --name ${{ env.APP_NAME }} \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --slot ${{ steps.slot.outputs.target }} \
            --target-slot production

      - name: Rollback on failure
        if: failure()
        run: |
          echo "Deployment failed. Rolling back to ${{ steps.slot.outputs.inactive }}"
          az webapp deployment slot swap \
            --name ${{ env.APP_NAME }} \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --slot ${{ steps.slot.outputs.inactive }} \
            --target-slot production
```

### Docker 多阶段构建优化

```dockerfile
# Dockerfile — 多阶段构建最小化最终镜像
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json .
RUN npm ci --ignore-scripts --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Kubernetes HPA + 滚动更新配置

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: myregistry/api:v1.2.3
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-deployment
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

## 6. 容器化

- **Docker**: 应用打包标准
- **Kubernetes**: 容器编排平台，提供服务发现、负载均衡、自动扩缩容
- **Helm**: Kubernetes 包管理器
- **服务网格**: Istio、Linkerd，提供 mTLS、流量管理、可观测性

## 7. 代码示例：金丝雀发布 TypeScript 控制器

```typescript
// canary-controller.ts — 基于权重的渐进式流量切换
interface Deployment {
  version: string;
  replicas: number;
  weight: number; // 0-100 的流量权重
}

class CanaryController {
  private stable: Deployment;
  private canary: Deployment;
  private stepSize = 10;

  constructor(stableVersion: string, canaryVersion: string, totalReplicas: number) {
    this.stable = { version: stableVersion, replicas: totalReplicas, weight: 100 };
    this.canary = { version: canaryVersion, replicas: 0, weight: 0 };
  }

  startCanary(canaryReplicas: number): void {
    this.canary.replicas = canaryReplicas;
    this.stable.replicas -= canaryReplicas;
    console.log(`[Canary] Started: stable=${this.stable.replicas}, canary=${this.canary.replicas}`);
  }

  promote(): void {
    // 逐步增加 canary 权重
    while (this.canary.weight < 100) {
      this.canary.weight = Math.min(100, this.canary.weight + this.stepSize);
      this.stable.weight = 100 - this.canary.weight;
      console.log(`[Canary] Weight: stable=${this.stable.weight}%, canary=${this.canary.weight}%`);
      // 实际场景中此处会调用负载均衡器 API 更新权重
    }
    // 切换完成，canary 成为新的 stable
    this.stable = { ...this.canary, weight: 100 };
    this.canary = { version: '', replicas: 0, weight: 0 };
    console.log('[Canary] Promotion complete');
  }

  rollback(): void {
    this.canary.weight = 0;
    this.stable.weight = 100;
    this.stable.replicas += this.canary.replicas;
    this.canary.replicas = 0;
    console.log('[Canary] Rolled back to stable');
  }
}

// 使用示例
const ctrl = new CanaryController('v1.2.3', 'v1.3.0', 10);
ctrl.startCanary(2); // 先放 2 个 canary 实例
// 经过监控验证后...
ctrl.promote();      // 逐步切流量
```

## 8. 代码示例：健康检查端点与优雅关闭

```typescript
// health-check.ts — Express/Fastify 通用健康检查与优雅关闭
import { createServer } from 'node:http';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, { status: 'pass' | 'fail'; latencyMs: number }>;
  uptime: number;
}

class HealthChecker {
  private startTime = Date.now();
  private shuttingDown = false;
  private checks = new Map<string, () => Promise<boolean>>();

  register(name: string, check: () => Promise<boolean>) {
    this.checks.set(name, check);
  }

  async runChecks(): Promise<HealthStatus> {
    const results: HealthStatus['checks'] = {};
    let allPass = true;

    for (const [name, check] of this.checks) {
      const start = performance.now();
      try {
        const pass = await check();
        results[name] = { status: pass ? 'pass' : 'fail', latencyMs: Math.round(performance.now() - start) };
        if (!pass) allPass = false;
      } catch {
        results[name] = { status: 'fail', latencyMs: Math.round(performance.now() - start) };
        allPass = false;
      }
    }

    return {
      status: this.shuttingDown ? 'unhealthy' : allPass ? 'healthy' : 'degraded',
      checks: results,
      uptime: Date.now() - this.startTime,
    };
  }

  initiateShutdown(signal: string, server: ReturnType<typeof createServer>) {
    console.log(`Received ${signal}, initiating graceful shutdown...`);
    this.shuttingDown = true;

    // 停止接受新连接，等待现有请求完成
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });

    // 强制退出兜底
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30_000);
  }
}

// Express 集成示例
// app.get('/health', async (_req, res) => {
//   const status = await healthChecker.runChecks();
//   res.status(status.status === 'healthy' ? 200 : 503).json(status);
// });
```

## 9. 代码示例：GitOps 资源同步状态检测

```typescript
// gitops-sync-check.ts — 检查 Git 期望状态与集群实际状态差异
interface K8sResource {
  kind: string;
  name: string;
  namespace: string;
  desiredImage: string;
  actualImage?: string;
}

async function detectDrift(desired: K8sResource[]): Promise<K8sResource[]> {
  const drifted: K8sResource[] = [];

  for (const res of desired) {
    // 实际场景中通过 Kubernetes API 获取实际状态
    const actual = await getClusterResource(res.kind, res.name, res.namespace);
    if (actual?.image !== res.desiredImage) {
      drifted.push({ ...res, actualImage: actual?.image });
    }
  }

  return drifted;
}

// 模拟 K8s API 调用
async function getClusterResource(kind: string, name: string, namespace: string): Promise<{ image: string } | undefined> {
  // 此处应调用 kubectl / Kubernetes Client API
  return { image: `registry/${kind.toLowerCase()}:${name}-${namespace}` };
}
```

## 10. 与相邻模块的关系

- **93-deployment-edge-lab**: 边缘环境的部署策略
- **72-container-orchestration**: Kubernetes 与容器编排
- **74-observability**: 生产环境监控与告警

## 11. 权威参考与外部链接

| 资源 | 描述 | 链接 |
|------|------|------|
| **The Twelve-Factor App** | 云原生应用设计方法论 | [12factor.net](https://12factor.net/) |
| **GitHub Actions Docs** | 官方 CI/CD 文档 | [docs.github.com/actions](https://docs.github.com/en/actions) |
| **ArgoCD** | 声明式 GitOps 持续交付 | [argo-cd.readthedocs.io](https://argo-cd.readthedocs.io/) |
| **Flux CD** | CNCF 毕业 GitOps 工具 | [fluxcd.io](https://fluxcd.io/) |
| **Kubernetes Deployment Strategies** | 官方部署策略指南 | [kubernetes.io/docs/concepts/workloads/controllers/deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) |
| **AWS Well-Architected** | 云架构最佳实践框架 | [aws.amazon.com/architecture/well-architected](https://aws.amazon.com/architecture/well-architected/) |
| **Google SRE Book** | 站点可靠性工程经典 | [sre.google/sre-book/table-of-contents](https://sre.google/sre-book/table-of-contents/) |
| **DORA Metrics** | DevOps 研究与评估指标 | [cloud.google.com/blog/products/devops-sre](https://cloud.google.com/blog/products/devops-sre/) |
| **Dockerfile Best Practices** | 官方构建优化指南 | [docs.docker.com/develop/dev-best-practices](https://docs.docker.com/develop/dev-best-practices/) |
| **Pulumi Documentation** | 编程式 IaC | [pulumi.com/docs](https://www.pulumi.com/docs/) |
| **CDK for Terraform** | TypeScript Terraform | [developer.hashicorp.com/terraform/cdktf](https://developer.hashicorp.com/terraform/cdktf) |
| **CNCF Cloud Native Trail Map** | 云原生技术全景 | [cncf.io/trail-map](https://www.cncf.io/trail-map/) |
| **Istio Service Mesh Docs** | 服务网格指南 | [istio.io/latest/docs](https://istio.io/latest/docs/) |
| **GitLab CI/CD Documentation** | 官方流水线文档 | [docs.gitlab.com/ee/ci](https://docs.gitlab.com/ee/ci/) |
| **Kubernetes HPA Documentation** | 自动扩缩容指南 | [kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) |
| **Azure — Blue-Green Deployment** | 蓝绿部署最佳实践 | [learn.microsoft.com/en-us/azure/architecture/reference-architectures/containers/aks-mission-critical](https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/containers/aks-mission-critical) |
| **AWS — Canary Deployments** | 金丝雀发布指南 | [docs.aws.amazon.com/whitepapers/latest/blue-green-deployments/blue-green-deployments.html](https://docs.aws.amazon.com/whitepapers/latest/blue-green-deployments/blue-green-deployments.html) |
| **Spotify — Backstage** | 开发者平台开源项目 | [backstage.io](https://backstage.io/) — 内部开发者门户 |
| **OpenGitOps** | GitOps 标准工作组 | [opengitops.dev](https://opengitops.dev/) |
| **CNCF — DevOps Toolkit** | 云原生 DevOps 工具集 | [cncf.io/projects/](https://www.cncf.io/projects/) |

---

## 进阶部署与 IaC 示例

### Serverless Framework 配置

```yaml

# serverless.yml

service: my-api

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  environment:
    STAGE: ${opt:stage, 'dev'}

functions:
  hello:
    handler: dist/hello.handler
    events:
      - httpApi:
          path: /hello
          method: get

plugins:

- serverless-offline
```

---

## 更多权威参考

| 资源 | 描述 | 链接 |
|------|------|------|
| Terraform Documentation | 声明式 IaC | <https://developer.hashicorp.com/terraform/docs> |
| Pulumi Documentation | 编程式 IaC | <https://www.pulumi.com/docs/> |
| Serverless Framework Docs | Serverless YAML | <https://www.serverless.com/framework/docs> |
| Dagger.io | 可编程 CI/CD | <https://dagger.io/> |
| Argo Rollouts | 渐进式交付 | <https://argoproj.github.io/argo-rollouts/> |

*最后更新: 2026-04-30*
