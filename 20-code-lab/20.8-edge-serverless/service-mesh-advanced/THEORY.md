# 高级服务网格 理论解读

## 概述

本模块深入解析服务网格（Service Mesh）的架构原理与治理机制，涵盖 Sidecar 代理模式、流量管理、零信任安全与可观测性。服务网格将服务间通信的关注面从业务代码中剥离，是微服务架构演进到高级阶段的基础设施标配。

## 核心概念

### Sidecar 代理模式

每个应用 Pod 旁注入一个独立的代理容器（如 Envoy），拦截所有入站与出站流量。应用本身无需感知即可获得负载均衡、超时重试、熔断、mTLS 加密等能力，实现了业务逻辑与基础设施的彻底解耦。

### 控制平面与数据平面

数据平面由大量 Sidecar 代理组成，负责实际流量转发与策略执行；控制平面（如 Istiod）负责配置分发、证书管理与代理生命周期管理。两者分离使得策略变更可以集中下发、全局生效。

### 零信任安全（mTLS）

服务网格通过自动为每个服务签发 SPIFFE/SPIRE 身份证书，实现服务间双向 TLS 认证。即使在内网环境中，也不默认信任任何流量，将安全边界从网络 perimeter 下沉到每个服务实例。

## 关键模式

| 模式 | 适用场景 | 注意事项 |
|------|----------|----------|
| 金丝雀路由 | 新版本服务的小流量验证 | 需配合健康检查与自动回滚，避免故障扩散 |
| 熔断器 | 下游服务故障时的快速失败保护 | 合理设置半开探测间隔，防止故障恢复后流量瞬间打满 |
| 故障注入 | 混沌工程测试系统韧性 | 仅在可控环境执行，生产环境需严格审批与监控 |

## 服务网格产品对比

| 维度 | Istio | Linkerd | Consul Connect |
|------|-------|---------|---------------|
| **数据平面** | Envoy（功能丰富、资源较重） | Linkerd2-proxy（Rust 编写，轻量） | Envoy / 内置代理 |
| **控制平面** | Istiod（Pilot + Citadel + Galley） | Destination Controller（极简） | Consul Server + Sidecar |
| **资源开销** | 高（Sidecar 50~100MB+） | **低**（Sidecar < 20MB） | 中 |
| **mTLS 自动轮换** | ✅ SPIFFE/SPIRE | ✅ 自动 | ✅ 自动（Consul CA） |
| **多集群联邦** | ✅ 完善（多网络、单网络） | ⚠️ 基础多集群 | ✅ 原生 WAN Gossip |
| **VM / 非 K8s** | ✅ WorkloadEntry / VM 集成 | ⚠️ 有限支持 | ✅ 原生支持（Nomad、VM） |
| **Gateway API** | ✅ 原生支持 | ⚠️ 实验性 | ❌ 需额外集成 |
| **WebAssembly 扩展** | ✅ Wasm 插件生态 | ❌ 不支持 | ❌ 不支持 |
| **CNCF 状态** | 毕业 (Graduated) | 毕业 (Graduated) | 孵化 (Incubating) |
| **最佳场景** | 大规模多云、复杂策略 | 资源敏感、追求极简运维 | 混合部署（K8s + VM + Nomad） |

> **选型建议**：需要多集群、复杂流量策略和 Wasm 扩展选 **Istio**；追求最低资源占用和极简运维选 **Linkerd**；已有 HashiCorp 生态或混合 K8s/VM 部署选 **Consul Connect**。

## 代码示例

### Sidecar Proxy 配置（Istio EnvoyFilter）

```yaml
# 金丝雀流量分割 + 超时重试
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: payments-service
spec:
  hosts:
    - payments.prod.svc.cluster.local
  http:
    - match:
        - headers:
            x-canary:
              exact: "true"
      route:
        - destination:
            host: payments.prod.svc.cluster.local
            subset: v2
          weight: 100
    - route:
        - destination:
            host: payments.prod.svc.cluster.local
            subset: v1
          weight: 90
        - destination:
            host: payments.prod.svc.cluster.local
            subset: v2
          weight: 10
      timeout: 5s
      retries:
        attempts: 3
        perTryTimeout: 2s
        retryOn: gateway-error,connect-failure,refused-stream
---
# 熔断器配置
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: payments-circuit-breaker
spec:
  host: payments.prod.svc.cluster.local
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        maxRequestsPerConnection: 10
    outlierDetection:
      consecutive5xxErrors: 5      # 连续 5 次 5xx 触发熔断
      interval: 30s
      baseEjectionTime: 30s        # 逐出基础时长
      maxEjectionPercent: 50       # 最多逐出 50% 实例
  subsets:
    - name: v1
      labels:
        version: v1
    - name: v2
      labels:
        version: v2
```

### Linkerd 自动 mTLS 与重试（零配置）

```yaml
# Linkerd 默认已启用自动 mTLS，仅需在 Namespace 标注注入
apiVersion: v1
kind: Namespace
metadata:
  name: prod
  annotations:
    linkerd.io/inject: enabled
---
# 可选：细粒度重试预算（避免重试风暴）
apiVersion: policy.linkerd.io/v1beta2
kind: HTTPRetryBudget
metadata:
  name: payments-retry
  namespace: prod
spec:
  retryRatio:
    maxRetries: 10          # 每秒最大重试数
    retryRate:
      value: 0.2            # 重试请求不超过原始请求的 20%
```

### Sidecar 资源限制最佳实践

```yaml
# 为 Envoy Sidecar 设置合理的资源配额，防止其挤占业务容器资源
apiVersion: v1
kind: Pod
metadata:
  annotations:
    sidecar.istio.io/proxyCPU: "100m"
    sidecar.istio.io/proxyMemory: "128Mi"
    sidecar.istio.io/proxyLimitCPU: "500m"
    sidecar.istio.io/proxyLimitMemory: "256Mi"
spec:
  containers:
    - name: payments-app
      resources:
        requests:
          cpu: "500m"
          memory: "512Mi"
```

## 关联模块

- `72-container-orchestration` — Kubernetes 容器编排与服务发现基础
- `25-microservices` — 微服务拆分策略与服务间通信模式
- `74-observability` — 分布式追踪、指标采集与日志聚合

## 参考

- [Istio Documentation](https://istio.io/latest/docs/)
- [Linkerd Documentation](https://linkerd.io/2.15/overview/)
- [Consul Service Mesh](https://developer.hashicorp.com/consul/docs/connect)
- [Envoy Proxy Documentation](https://www.envoyproxy.io/docs/envoy/latest/)
- [SMI (Service Mesh Interface) Spec](https://smi-spec.io/)
- [CNCF Service Mesh Landscape](https://landscape.cncf.io/card-mode?category=service-mesh&grouping=category)
- 本模块 `README.md` — 模块主题与学习路径
- 本模块 `mesh-architecture.ts` — Sidecar 代理、流量管理、mTLS 与可观测性实现
