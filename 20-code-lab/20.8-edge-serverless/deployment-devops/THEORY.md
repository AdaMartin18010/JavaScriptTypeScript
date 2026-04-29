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

## 7. 与相邻模块的关系

- **93-deployment-edge-lab**: 边缘环境的部署策略
- **72-container-orchestration**: Kubernetes 与容器编排
- **74-observability**: 生产环境监控与告警

## 8. 权威参考与外部链接

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

---

*最后更新: 2026-04-29*
