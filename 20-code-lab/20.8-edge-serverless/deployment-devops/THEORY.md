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
