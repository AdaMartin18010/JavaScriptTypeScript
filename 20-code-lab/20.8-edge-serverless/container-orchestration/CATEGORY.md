---
dimension: 综合
sub-dimension: Container orchestration
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Container orchestration 核心概念与工程实践。

## 包含内容

- 本模块聚焦 container orchestration 核心概念与工程实践。
- 涵盖容器编排引擎抽象、调度策略声明式配置与滚动升级模型。

## 子模块速查

| 子模块 | 类型 | 说明 |
|--------|------|------|
| README.md | 文档 | 模块入口与快速开始 |
| THEORY.md | 文档 | 编排理论形式化定义 |
| orchestration-engine.ts | 源码 | 最小编排引擎实现 |
| index.ts | 源码 | 模块统一导出 |

## 代码示例

```typescript
// orchestration-engine.ts — 声明式滚动更新编排器
interface Deployment {
  name: string;
  replicas: number;
  image: string;
  strategy: 'RollingUpdate' | 'Recreate';
}

class Orchestrator {
  private pods: Map<string, string> = new Map(); // id -> image

  async apply(spec: Deployment): Promise<void> {
    const current = Array.from(this.pods.values());
    const need = spec.replicas;
    if (spec.strategy === 'RollingUpdate') {
      // 25% 滚动批次
      const batch = Math.max(1, Math.floor(need * 0.25));
      for (let i = 0; i < need; i += batch) {
        for (let j = i; j < Math.min(i + batch, need); j++) {
          this.pods.set(`${spec.name}-${j}`, spec.image);
        }
        await this.healthCheck(spec.name);
      }
    } else {
      this.pods.clear();
      for (let i = 0; i < need; i++) {
        this.pods.set(`${spec.name}-${i}`, spec.image);
      }
    }
  }

  private async healthCheck(name: string): Promise<void> {
    await new Promise(r => setTimeout(r, 500));
  }
}
```

### 健康探针与自愈机制

```typescript
// health-probe.ts
interface ProbeConfig {
  path: string;
  port: number;
  intervalMs: number;
  timeoutMs: number;
  failureThreshold: number;
}

class Pod {
  constructor(
    public id: string,
    public image: string,
    public status: 'Pending' | 'Running' | 'Failed' | 'Succeeded' = 'Pending'
  ) {}
}

class HealthMonitor {
  private failureCounts = new Map<string, number>();

  constructor(
    private pods: Map<string, Pod>,
    private livenessProbe: ProbeConfig,
    private readinessProbe: ProbeConfig
  ) {}

  async startMonitoring(): Promise<void> {
    setInterval(async () => {
      for (const [id, pod] of this.pods) {
        if (pod.status !== 'Running') continue;

        const alive = await this.probe(this.livenessProbe);
        if (!alive) {
          const failures = (this.failureCounts.get(id) || 0) + 1;
          this.failureCounts.set(id, failures);

          if (failures >= this.livenessProbe.failureThreshold) {
            console.log(`Pod ${id} failed liveness check. Restarting...`);
            pod.status = 'Pending';
            this.failureCounts.set(id, 0);
            // 触发重新调度
            await this.restartPod(pod);
          }
        } else {
          this.failureCounts.set(id, 0);
        }
      }
    }, this.livenessProbe.intervalMs);
  }

  private async probe(config: ProbeConfig): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
      const res = await fetch(`http://localhost:${config.port}${config.path}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res.ok;
    } catch {
      return false;
    }
  }

  private async restartPod(pod: Pod): Promise<void> {
    pod.status = 'Pending';
    await new Promise(r => setTimeout(r, 1000));
    pod.status = 'Running';
    console.log(`Pod ${pod.id} restarted.`);
  }
}
```

### 服务发现与负载均衡

```typescript
// service-discovery.ts
interface Endpoint {
  podId: string;
  ip: string;
  port: number;
  weight: number;
  healthy: boolean;
}

class ServiceRegistry {
  private endpoints = new Map<string, Endpoint[]>();

  register(serviceName: string, endpoint: Endpoint): void {
    const list = this.endpoints.get(serviceName) || [];
    list.push(endpoint);
    this.endpoints.set(serviceName, list);
  }

  deregister(serviceName: string, podId: string): void {
    const list = this.endpoints.get(serviceName) || [];
    this.endpoints.set(
      serviceName,
      list.filter((e) => e.podId !== podId)
    );
  }

  // 加权轮询选择
  select(serviceName: string): Endpoint | null {
    const healthy = (this.endpoints.get(serviceName) || []).filter((e) => e.healthy);
    if (healthy.length === 0) return null;

    const totalWeight = healthy.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;
    for (const ep of healthy) {
      random -= ep.weight;
      if (random <= 0) return ep;
    }
    return healthy[healthy.length - 1];
  }
}
```

### 金丝雀发布策略

```typescript
// canary-deployment.ts
interface CanaryStrategy {
  stableImage: string;
  canaryImage: string;
  totalReplicas: number;
  canaryPercent: number; // 0 - 100
  promotionThreshold: number; // 错误率阈值
}

class CanaryDeployer {
  async deploy(strategy: CanaryStrategy, metrics: MetricsClient): Promise<void> {
    const canaryCount = Math.max(
      1,
      Math.floor((strategy.canaryPercent / 100) * strategy.totalReplicas)
    );
    const stableCount = strategy.totalReplicas - canaryCount;

    console.log(`Deploying ${canaryCount} canary pods, ${stableCount} stable pods`);

    // 阶段 1：部署金丝雀实例
    for (let i = 0; i < canaryCount; i++) {
      await this.deployPod(`canary-${i}`, strategy.canaryImage);
    }

    // 阶段 2：观察期
    await this.observe(300_000); // 5 分钟

    // 阶段 3：检查指标
    const canaryErrorRate = await metrics.errorRate('canary');
    if (canaryErrorRate > strategy.promotionThreshold) {
      console.error('Canary failed. Rolling back...');
      await this.rollback(strategy.stableImage, strategy.totalReplicas);
      return;
    }

    // 阶段 4：全量推广
    console.log('Canary successful. Promoting to 100%...');
    for (let i = 0; i < stableCount; i++) {
      await this.deployPod(`stable-${i}`, strategy.canaryImage);
    }
  }

  private async deployPod(id: string, image: string): Promise<void> {
    console.log(`Deploying pod ${id} with image ${image}`);
  }

  private async observe(durationMs: number): Promise<void> {
    return new Promise((r) => setTimeout(r, durationMs));
  }

  private async rollback(image: string, replicas: number): Promise<void> {
    console.log(`Rolling back all ${replicas} pods to ${image}`);
  }
}
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHIVED.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 index.ts
- 📄 orchestration-engine.test.ts
- 📄 orchestration-engine.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Kubernetes Docs | 官方文档 | [kubernetes.io/docs](https://kubernetes.io/docs) |
| Kubernetes Scheduling Framework | 设计文档 | [kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework](https://kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework/) |
| Nomad by HashiCorp | 官方文档 | [developer.hashicorp.com/nomad](https://developer.hashicorp.com/nomad/docs) |
| Docker Swarm | 官方文档 | [docs.docker.com/engine/swarm](https://docs.docker.com/engine/swarm/) |
| Borg, Omega, and Kubernetes | 论文 | [research.google/pubs/pub43438](https://research.google/pubs/pub43438/) |
| Kubernetes Best Practices | 指南 | [kubernetes.io/docs/concepts/configuration/overview](https://kubernetes.io/docs/concepts/configuration/overview/) |
| containerd — Container Runtime | 文档 | [containerd.io/docs](https://containerd.io/docs/) |
| CRI-O — Kubernetes Container Runtime | 文档 | [cri-o.io](https://cri-o.io/) |
| CNCF Cloud Native Trail Map | 指南 | [landscape.cncf.io](https://landscape.cncf.io/) |

---

*最后更新: 2026-04-29*
