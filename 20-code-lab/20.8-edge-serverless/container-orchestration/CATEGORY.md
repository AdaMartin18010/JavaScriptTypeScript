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

### 资源配额与亲和性调度

```typescript
// resource-scheduler.ts — 简化版 K8s 调度约束
interface ResourceRequirements {
  cpu: number;      // millicores
  memory: number;   // MiB
}

interface Node {
  id: string;
  availableCpu: number;
  availableMemory: number;
  labels: Record<string, string>;
  taints: Array<{ key: string; value: string; effect: 'NoSchedule' | 'PreferNoSchedule' }>;
}

interface PodSpec {
  name: string;
  resources: ResourceRequirements;
  nodeSelector?: Record<string, string>;
  affinity?: {
    nodeAffinity?: {
      required?: Array<{ key: string; operator: 'In'; values: string[] }>;
      preferred?: Array<{ weight: number; key: string; operator: 'In'; values: string[] }>;
    };
    podAntiAffinity?: {
      required?: Array<{ labelSelector: Record<string, string>; topologyKey: string }>;
    };
  };
  tolerations?: Array<{ key: string; operator: 'Equal'; value: string }>;
}

class Scheduler {
  schedule(pod: PodSpec, nodes: Node[]): Node | null {
    const candidates = nodes.filter((node) => {
      // 资源检查
      if (node.availableCpu < pod.resources.cpu) return false;
      if (node.availableMemory < pod.resources.memory) return false;

      // Node Selector
      if (pod.nodeSelector) {
        for (const [key, value] of Object.entries(pod.nodeSelector)) {
          if (node.labels[key] !== value) return false;
        }
      }

      // Taints & Tolerations
      for (const taint of node.taints) {
        if (taint.effect === 'NoSchedule') {
          const tolerated = pod.tolerations?.some(
            (t) => t.key === taint.key && t.value === taint.value
          );
          if (!tolerated) return false;
        }
      }

      return true;
    });

    // 按剩余资源最多排序（Best Fit 变体）
    candidates.sort((a, b) =>
      (b.availableCpu + b.availableMemory) - (a.availableCpu + a.availableMemory)
    );

    return candidates[0] ?? null;
  }
}
```

### 优雅关闭与信号处理

```typescript
// graceful-shutdown.ts — 容器化应用的优雅关闭
import http from 'http';

let isShuttingDown = false;

const server = http.createServer((req, res) => {
  if (isShuttingDown) {
    res.writeHead(503, { 'Connection': 'close' });
    res.end('Server is shutting down');
    return;
  }
  res.writeHead(200);
  res.end('OK');
});

function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  isShuttingDown = true;

  // 停止接受新连接
  server.close(async () => {
    console.log('HTTP server closed');

    // 关闭数据库连接
    await db.disconnect();
    console.log('Database disconnected');

    // 清理其他资源
    process.exit(0);
  });

  // 强制关闭超时
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

server.listen(3000, () => console.log('Server on :3000'));
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

### 多阶段 Dockerfile 优化

```dockerfile
# Dockerfile.optimized — 多阶段构建优化生产镜像
# 阶段 1：依赖安装（利用 Docker 层缓存）
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 阶段 2：构建（包含 devDependencies）
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 阶段 3：运行（最小镜像）
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# 仅复制必要文件
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# 非 root 用户运行
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/healthz', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"
CMD ["node", "dist/main.js"]
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
| Kubernetes Resource Management](<https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/>) | 官方文档 | 容器资源配额与限制 |
| Kubernetes Taints and Tolerations](<https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/>) | 官方文档 | 污点与容忍调度 |
| Kubernetes Pod Disruption Budgets](<https://kubernetes.io/docs/concepts/workloads/pods/disruptions/>) | 官方文档 | Pod 中断预算 |
| Docker Best Practices](<https://docs.docker.com/build/building/best-practices/>) | 官方文档 | Docker 构建最佳实践 |
| Graceful Shutdown in Node.js](<https://nodejs.org/api/process.html#process_signal_events>) | 官方文档 | Node.js 信号处理 |
| The Twelve-Factor App](<https://12factor.net/>) | 方法论 | 云原生应用设计原则 |
| Kubernetes Patterns Book](<https://k8spatterns.io/>) | 书籍 | Kubernetes 设计模式 |
| Envoy Proxy Documentation](<https://www.envoyproxy.io/docs/envoy/latest/>) | 官方文档 | 服务代理与负载均衡 |
| Docker Multi-Stage Builds](<https://docs.docker.com/build/building/multi-stage/>) | 官方文档 | 多阶段构建优化镜像 |
| Kubernetes Health Probes](<https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/>) | 官方文档 | 存活、就绪与启动探针 |
| Istio Service Mesh](<https://istio.io/latest/docs/>) | 官方文档 | 服务网格与服务发现 |
| Helm Charts Best Practices](<https://helm.sh/docs/chart_best_practices/>) | 官方文档 | Helm Chart 最佳实践 |
| Prometheus Operator](<https://prometheus-operator.dev/>) | 官方文档 | Kubernetes 监控部署 |

---

*最后更新: 2026-04-30*
