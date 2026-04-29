# API 网关

> API 网关的选型、设计与最佳实践。

---

## 核心功能

| 功能 | 说明 |
|------|------|
| **路由** | 请求转发到后端服务 |
| **认证** | JWT/OAuth/API Key 校验 |
| **限流** | 防止过载，保护后端 |
| **缓存** | 减少后端压力 |
| **转换** | 协议转换（REST ↔ gRPC） |
| **可观测性** | 日志、指标、追踪 |

---

## 主流方案对比

| 维度 | Kong | Traefik | Envoy | AWS API Gateway |
|------|------|---------|-------|-----------------|
| **部署模式** | 自托管 / Kong Cloud | 自托管 / 云原生 | 自托管 / Sidecar | 全托管 AWS |
| **配置方式** | 声明式 (YAML/DB) / Admin API | 动态标签 (Docker/K8s) | xDS / YAML | 控制台 / IaC |
| **插件生态** | 丰富（Lua / Go / JS） | 中间件插件 | WASM / Lua | AWS 原生集成 |
| **协议支持** | HTTP / gRPC / WebSocket | HTTP / TCP / UDP | HTTP / gRPC / HTTP2 / TCP | HTTP / WebSocket / REST |
| **性能** | 高（OpenResty/Nginx） | 高 | 极高（C++） | 托管（自动扩展） |
| **服务发现** | Consul / DNS / K8s | 原生 K8s / Consul / ECS | 原生 xDS / K8s | Cloud Map / Lambda |
| **金丝雀/蓝绿** | 插件支持 | 原生权重路由 | 原生支持 |  Canary 部署支持 |
| **mTLS** | 支持 | 支持 | 原生支持 | 支持 |
| **适用场景** | 企业网关 / 混合云 | 云原生 / K8s Ingress | Service Mesh Sidecar | AWS 无服务器 / 快速上线 |
| **2026 状态** | ✅ 活跃 | ✅ 活跃 | ✅ 活跃 | ✅ 活跃 |

---

## 配置示例：Kong 声明式配置 (DB-less)

```yaml
_format_version: "3.0"

services:
  - name: user-service
    url: http://user-api:8080
    routes:
      - name: user-routes
        paths:
          - /api/v1/users
        strip_path: false
        methods:
          - GET
          - POST
    plugins:
      - name: rate-limiting
        config:
          minute: 60
          policy: local
      - name: jwt
        config:
          uri_param_names: []
          cookie_names: []
          key_claim_name: iss
          secret_is_base64: false
          claims_to_verify:
            - exp
      - name: cors
        config:
          origins:
            - "https://app.example.com"
          methods:
            - GET
            - POST
            - PUT
            - DELETE
          headers:
            - Authorization
            - Content-Type
          max_age: 3600

consumers:
  - username: mobile-app
    jwt_secrets:
      - algorithm: HS256
        key: mobile-app-issuer
        secret: ${JWT_SECRET}
```

---

## 选型建议

| 场景 | 推荐网关 |
|------|----------|
| Kubernetes 原生 Ingress | Traefik / Envoy Gateway |
| 企业级 API 管理（多团队） | Kong / Apigee |
| Service Mesh 数据面 | Envoy |
| AWS 全托管 / Serverless | AWS API Gateway |
| 高性能边缘网关 | Envoy / Kong |

---

## 权威参考链接

- [Kong 官方文档](https://docs.konghq.com/)
- [Traefik 官方文档](https://doc.traefik.io/traefik/)
- [Envoy Proxy 官方文档](https://www.envoyproxy.io/docs/envoy/latest/)
- [AWS API Gateway 官方文档](https://docs.aws.amazon.com/apigateway/)
- [NGINX Gateway Fabric](https://docs.nginx.com/nginx-gateway-fabric/)
- [OpenAPI Gateway Patterns](https://learning.oreilly.com/library/view/designing-web-apis/9781492026914/)

---

*最后更新: 2026-04-29*
