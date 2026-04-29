# 部署与 DevOps — 架构设计

## 1. 架构概述

本模块实现了 CI/CD 流水线的核心阶段模拟，包括代码检查、测试、构建、部署和健康检查。展示自动化部署的完整生命周期。架构采用"管道即代码"（Pipeline as Code）的设计理念，将整个交付流程定义为可版本化、可复现、可审计的配置，每个阶段都设有质量门禁，确保只有满足条件的产物才能进入下一阶段。

## 2. 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         触发层 (Trigger Layer)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Git Push   │  │   PR Merge   │  │   Scheduled  │                   │
│  │   (Webhook)  │  │   (Webhook)  │  │   (Cron)     │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      流水线引擎 (Pipeline Engine)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Pipeline   │  │    Stage     │  │   Artifact   │                   │
│  │   Runner     │  │   Executor   │  │   Manager    │                   │
│  │ (Dependency  │  │ (Parallel /  │  │ (Versioned   │                   │
│  │  Graph)      │  │  Serial)     │  │  Storage)    │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      质量门禁层 (Quality Gates)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Lint   │  │   Test   │  │ Security │  │ Coverage │  │  Build   │  │
│  │   Gate   │->│   Gate   │->│   Gate   │->│   Gate   │->│   Gate   │  │
│  │ (ESLint /│  │(Unit/Int/│  │(Snyk/    │  │(Threshold│  │(Compile /│  │
│  │ Prettier)│  │ E2E)     │  │ Trivy)   │  │  Check)  │  │ Bundle)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│       |             |             |             |             |         │
│    [FAIL]        [FAIL]        [FAIL]        [FAIL]        [FAIL]      │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      部署编排层 (Deployment Orchestration)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Environment  │  │  Strategy    │  │   Health     │  │  Rollback   │ │
│  │   Manager    │  │   Selector   │  │   Checker    │  │   Trigger   │ │
│  │(dev/staging/ │  │(Blue-Green / │  │ (Liveness /  │  │ (Automatic  │ │
│  │   prod)      │  │ Canary /     │  │  Readiness / │  │  / Manual)  │ │
│  │              │  │ Rolling)     │  │  Business)   │  │             │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          └─────────────────┼─────────────────┘                 │
                            │                                   │
                            ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      基础设施层 (Infrastructure)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Docker     │  │  Kubernetes  │  │   Cloud      │  │   Edge      │ │
│  │   Registry   │  │   Cluster    │  │   Provider   │  │   Node      │ │
│  │              │  │              │  │ (AWS/GCP/    │  │ (Vercel /   │ │
│  │              │  │              │  │  Azure)      │  │  Cloudflare)│ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. 核心组件

### 3.1 流水线引擎

| 组件 | 职责 | 关键技术 | 调度策略 |
|------|------|----------|----------|
| Pipeline Runner | 阶段编排和依赖管理 | DAG 拓扑排序 | 依赖就绪即执行 |
| Stage Executor | 并行/串行执行步骤 | Worker 池 | 资源限制 |
| Artifact Manager | 构建产物存储和版本管理 | 内容寻址存储 | 不可变 |

### 3.2 质量门禁

| 组件 | 职责 | 工具示例 | 失败策略 |
|------|------|----------|----------|
| Lint Gate | 代码风格检查 | ESLint, Prettier, Biome | 阻断 |
| Test Gate | 单元/集成/E2E 测试 | Vitest, Playwright | 阻断 |
| Security Gate | 依赖漏洞扫描、密钥检测 | Snyk, Trivy, TruffleHog | 阻断/警告 |
| Coverage Gate | 测试覆盖率阈值 | Istanbul, v8 coverage | 阻断 |

### 3.3 部署编排

| 组件 | 职责 | 部署策略 | 风险等级 |
|------|------|----------|----------|
| Environment Manager | 多环境配置管理（dev/staging/prod） | 环境隔离 | — |
| Strategy Selector | 蓝绿/金丝雀/滚动部署策略 | 渐进式流量切换 | 低 |
| Rollback Trigger | 健康检查失败自动回滚 | 快速切流 | 最低 |

## 4. 数据流

```
Push -> Build -> Test -> Security Scan -> Package -> Deploy -> Health Check -> Monitor
         |      |           |            |         |            |
       Fail   Fail       Fail         Success   Success     Fail->Rollback
```

## 5. 技术栈对比

| 工具/平台 | 配置方式 | 运行环境 | 并行能力 | 生态集成 | 自托管 | 适用规模 |
|-----------|----------|----------|----------|----------|--------|----------|
| 本实验室 | TypeScript DSL | 本地/容器 | 中 | 教学 | 是 | 学习/原型 |
| GitHub Actions | YAML | 托管/自托管 | 高 | ★★★★★ | 可选 | 全规模 |
| GitLab CI | YAML | 托管/自托管 | 高 | ★★★★ | 可选 | 全规模 |
| Jenkins | Groovy / Declarative | 自托管 | 高 | ★★★★ | 必须 | 企业级 |
| CircleCI | YAML | 托管 | 高 | ★★★★ | 否 | 中小 |
| ArgoCD | YAML (GitOps) | K8s | 高 | ★★★ | 是 | K8s 原生 |
| Flux CD | YAML (GitOps) | K8s | 高 | ★★★ | 是 | K8s 原生 |

## 6. 代码示例

### 6.1 流水线定义 DSL

```typescript
// deployment-devops/src/pipeline/PipelineDSL.ts
interface Stage {
  name: string;
  needs?: string[];
  steps: Step[];
  parallel?: boolean;
  environment?: string;
}

interface Step {
  name: string;
  run: () => Promise<StepResult>;
  timeout?: number;
  allowFailure?: boolean;
}

interface StepResult {
  success: boolean;
  duration: number;
  output: string;
  artifacts?: string[];
}

class Pipeline {
  private stages: Stage[] = [];

  addStage(stage: Stage): this {
    this.stages.push(stage);
    return this;
  }

  async execute(context: PipelineContext): Promise<PipelineResult> {
    const executed = new Set<string>();
    const results: Record<string, StageResult> = {};

    // 拓扑排序执行
    const executeStage = async (stage: Stage): Promise<StageResult> => {
      if (executed.has(stage.name)) return results[stage.name];

      // 等待依赖
      if (stage.needs) {
        await Promise.all(stage.needs.map(n => executeStage(this.findStage(n)!)));
      }

      const start = Date.now();
      try {
        const stepResults: StepResult[] = [];

        if (stage.parallel) {
          const r = await Promise.all(stage.steps.map(s => this.runStep(s)));
          stepResults.push(...r);
        } else {
          for (const step of stage.steps) {
            const r = await this.runStep(step);
            stepResults.push(r);
            if (!r.success && !step.allowFailure) break;
          }
        }

        const success = stepResults.every(r => r.success);
        const result: StageResult = {
          name: stage.name,
          success,
          duration: Date.now() - start,
          steps: stepResults,
        };

        executed.add(stage.name);
        results[stage.name] = result;
        return result;
      } catch (err) {
        const result: StageResult = {
          name: stage.name,
          success: false,
          duration: Date.now() - start,
          steps: [],
          error: (err as Error).message,
        };
        executed.add(stage.name);
        results[stage.name] = result;
        return result;
      }
    };

    for (const stage of this.stages) {
      if (!executed.has(stage.name)) {
        await executeStage(stage);
      }
    }

    return { stages: results, success: Object.values(results).every(r => r.success) };
  }

  private async runStep(step: Step): Promise<StepResult> {
    const start = Date.now();
    const timeout = step.timeout ?? 300000;
    const timer = setTimeout(() => { throw new Error(`Step ${step.name} timed out`); }, timeout);

    try {
      const output = await step.run();
      clearTimeout(timer);
      return { success: true, duration: Date.now() - start, output: JSON.stringify(output) };
    } catch (err) {
      clearTimeout(timer);
      return { success: false, duration: Date.now() - start, output: (err as Error).message };
    }
  }

  private findStage(name: string): Stage | undefined {
    return this.stages.find(s => s.name === name);
  }
}
```

### 6.2 部署策略实现

```typescript
// deployment-devops/src/deploy/Strategies.ts
interface DeploymentConfig {
  environment: string;
  version: string;
  healthCheckUrl: string;
}

interface Deployer {
  deploy(config: DeploymentConfig): Promise<void>;
}

class CanaryDeployer implements Deployer {
  private trafficPercent = [5, 25, 50, 100];

  async deploy(config: DeploymentConfig): Promise<void> {
    for (const percent of this.trafficPercent) {
      console.log(`Routing ${percent}% traffic to new version ${config.version}`);
      await this.shiftTraffic(config.environment, config.version, percent);
      await this.wait(30000); // 观察窗口

      const healthy = await this.healthCheck(config.healthCheckUrl);
      if (!healthy) {
        await this.rollback(config.environment);
        throw new Error(`Health check failed at ${percent}% canary`);
      }
    }
  }

  private async shiftTraffic(env: string, version: string, percent: number): Promise<void> {
    // 调用负载均衡器 API 切换流量
  }

  private async healthCheck(url: string): Promise<boolean> {
    try {
      const res = await fetch(url);
      return res.status === 200;
    } catch {
      return false;
    }
  }

  private async rollback(env: string): Promise<void> {
    console.log(`Rolling back ${env} to previous version`);
  }

  private async wait(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }
}
```

## 7. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 部署策略 | 金丝雀 + 自动回滚 | 风险最小化 |
| 配置管理 | 环境变量 + 配置中心 | 12-Factor 原则 |
| 健康检查 | 多层（存活/就绪/业务） | 精准故障定位 |

## 8. 质量属性

- **可靠性**: 自动回滚保障稳定性
- **可追溯性**: 每次部署关联代码版本和审批记录
- **效率**: 并行执行缩短交付周期

## 9. 参考链接

- [The Twelve-Factor App](https://12factor.net/) — 云原生应用方法论
- [GitHub Actions Documentation](https://docs.github.com/en/actions) — GitHub CI/CD 官方文档
- [Kubernetes Deployment Strategies](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) — K8s 部署策略
- [OWASP CI/CD Security](https://owasp.org/www-project-top-10-ci-cd-security-risks/) — CI/CD 安全风险清单
- [DORA Metrics](https://cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance) — DevOps 效能度量标准
- [Spinnaker - CD Platform](https://spinnaker.io/) — 多云持续交付平台
