# 容器编排 — 理论基础

## 1. 容器基础

容器是轻量级、可移植的运行环境：

- **镜像**: 只读模板，包含应用和依赖
- **容器**: 镜像的运行实例
- **层（Layer）**: 镜像由多个层组成，共享基础层节省空间

## 2. Kubernetes 核心概念

| 概念 | 作用 |
|------|------|
| **Pod** | 最小部署单元，可包含多个容器 |
| **Deployment** | 声明式管理 Pod 副本 |
| **Service** | 稳定的网络端点，负载均衡到 Pod |
| **Ingress** | HTTP/HTTPS 路由规则 |
| **ConfigMap/Secret** | 配置和敏感数据注入 |
| **PersistentVolume** | 持久化存储 |

## 3. 声明式配置

通过 YAML 描述期望状态，K8s 控制器持续调整实际状态：

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: myapp:v1
```

## 4. Kubernetes Service 与 Ingress 实战配置

```yaml
# service.yaml — 集群内负载均衡
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: my-api
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
---
# ingress.yaml — 七层路由 + TLS
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
    - hosts:
        - api.example.com
      secretName: api-tls
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
```

## 5. Docker Compose 多服务编排示例

```yaml
# docker-compose.yml — 本地开发与边缘测试
version: "3.9"
services:
  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - postgres
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api
volumes:
  pgdata:
```

## 6. Helm Chart 模板片段

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "mychart.fullname" . }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ include "mychart.name" . }}
  template:
    metadata:
      labels:
        app: {{ include "mychart.name" . }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          ports:
            - containerPort: {{ .Values.service.port }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

## 7. 代码示例：TypeScript K8s 客户端操作

```typescript
// k8s-client.ts — 使用 @kubernetes/client-node 与集群交互

import * as k8s from '@kubernetes/client-node';

const kc = new k8s.KubeConfig();
kc.loadFromDefault(); // 加载 ~/.kube/config

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

async function listPods(namespace = 'default') {
  const { body } = await k8sApi.listNamespacedPod(namespace);
  return body.items.map((pod) => ({
    name: pod.metadata?.name,
    status: pod.status?.phase,
    node: pod.spec?.nodeName,
  }));
}

async function getPodLogs(podName: string, namespace = 'default') {
  const { body } = await k8sApi.readNamespacedPodLog(podName, namespace);
  return body;
}

async function createConfigMap(name: string, data: Record<string, string>, namespace = 'default') {
  const configMap: k8s.V1ConfigMap = {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: { name, namespace },
    data,
  };
  await k8sApi.createNamespacedConfigMap(namespace, configMap);
}

// 使用
listPods().then((pods) => console.table(pods));
```

## 8. 代码示例：Node.js 健康检查端点

```typescript
// health-check.ts — 符合 K8s 探针规范的健康检查端点

import http from 'http';

interface HealthState {
  ready: boolean;
  alive: boolean;
  checks: Record<string, { status: 'pass' | 'fail'; responseTime: number }>;
}

let state: HealthState = {
  ready: false,
  alive: true,
  checks: {},
};

async function runChecks(): Promise<HealthState> {
  const start = Date.now();

  // 模拟依赖检查（数据库、缓存等）
  const dbCheck = await checkDatabase().then(() => ({
    status: 'pass' as const, responseTime: Date.now() - start,
  })).catch(() => ({ status: 'fail' as const, responseTime: Date.now() - start }));

  state.checks = { database: dbCheck };
  state.ready = dbCheck.status === 'pass';
  state.alive = true;
  return state;
}

async function checkDatabase(): Promise<void> {
  // 实际项目中执行真实 DB ping
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), 10);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/healthz') {
    // Liveness Probe — 进程是否存活
    res.writeHead(state.alive ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: state.alive ? 'alive' : 'dead' }));
    return;
  }

  if (req.url === '/readyz') {
    // Readiness Probe — 是否可接受流量
    const current = await runChecks();
    res.writeHead(current.ready ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ready: current.ready, checks: current.checks }));
    return;
  }

  if (req.url === '/startupz') {
    // Startup Probe — 启动是否完成
    res.writeHead(state.ready ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ started: state.ready }));
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

// 模拟启动完成
setTimeout(() => { state.ready = true; }, 5000);

server.listen(3000, () => console.log('Health server on :3000'));
```

## 9. 代码示例：Kubernetes HPA 指标采集（自定义 Metrics Server）

```typescript
// custom-metrics.ts — 暴露 Prometheus 风格指标供 HPA 使用

import http from 'http';

interface GaugeMetric {
  name: string;
  value: number;
  labels: Record<string, string>;
}

class MetricsRegistry {
  private gauges = new Map<string, GaugeMetric>();

  setGauge(name: string, value: number, labels: Record<string, string> = {}) {
    const key = `${name}{${Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(',')}}`;
    this.gauges.set(key, { name, value, labels });
  }

  scrape(): string {
    const lines: string[] = [];
    for (const [, metric] of this.gauges) {
      lines.push(`# TYPE ${metric.name} gauge`);
      const labelStr = Object.entries(metric.labels).map(([k, v]) => `${k}="${v}"`).join(',');
      lines.push(`${metric.name}{${labelStr}} ${metric.value}`);
    }
    return lines.join('\n');
  }
}

const registry = new MetricsRegistry();

// 模拟队列深度指标（供 HPA 扩缩容决策）
setInterval(() => {
  const queueDepth = Math.floor(Math.random() * 100);
  registry.setGauge('app_queue_depth', queueDepth, { service: 'worker' });
}, 5000);

http.createServer((req, res) => {
  if (req.url === '/metrics') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(registry.scrape());
    return;
  }
  res.writeHead(404);
  res.end();
}).listen(9090, () => console.log('Metrics server on :9090'));
```

## 10. 与相邻模块的关系

- **22-deployment-devops**: DevOps 与 CI/CD
- **73-service-mesh-advanced**: 服务网格
- **25-microservices**: 微服务部署

## 参考资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Kubernetes 官方文档 | 文档 | [kubernetes.io/docs](https://kubernetes.io/docs/) |
| Docker 官方文档 | 文档 | [docs.docker.com](https://docs.docker.com/) |
| Helm 官方文档 | 文档 | [helm.sh/docs](https://helm.sh/docs/) |
| CNCF Cloud Native Landscape | 生态 | [landscape.cncf.io](https://landscape.cncf.io/) |
| Kubernetes Patterns 书籍 | 指南 | [k8spatterns.io](https://k8spatterns.io/) |
| Ingress-NGINX 文档 | 文档 | [kubernetes.github.io/ingress-nginx](https://kubernetes.github.io/ingress-nginx/) |
| cert-manager 文档 | 文档 | [cert-manager.io](https://cert-manager.io/docs/) |
| MDN Web Docs | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| TC39 Proposals | 规范 | [tc39.es](https://tc39.es) |
| Kubernetes API Reference | API | [kubernetes.io/docs/reference/kubernetes-api](https://kubernetes.io/docs/reference/kubernetes-api/) |
| @kubernetes/client-node | npm | [www.npmjs.com/package/@kubernetes/client-node](https://www.npmjs.com/package/@kubernetes/client-node) |
| Prometheus Metrics Format | 规范 | [prometheus.io/docs/instrumenting/exposition_formats](https://prometheus.io/docs/instrumenting/exposition_formats/) |
| Google — Site Reliability Engineering (SRE Book) | 书籍 | [sre.google/sre-book/table-of-contents](https://sre.google/sre-book/table-of-contents/) |
| Open Container Initiative (OCI) | 规范 | [opencontainers.org](https://opencontainers.org/) |

---

*最后更新: 2026-04-29*
