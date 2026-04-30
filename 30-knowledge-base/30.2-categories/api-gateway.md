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

## Envoy Proxy 基础配置（边缘网关）

```yaml
# envoy.yaml — 静态配置示例
static_resources:
  listeners:
    - name: listener_0
      address:
        socket_address: { address: 0.0.0.0, port_value: 8080 }
      filter_chains:
        - filters:
            - name: envoy.filters.network.http_connection_manager
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                stat_prefix: ingress_http
                route_config:
                  name: local_route
                  virtual_hosts:
                    - name: backend
                      domains: ["*"]
                      routes:
                        - match: { prefix: "/api/v1/" }
                          route: { cluster: backend_service }
                http_filters:
                  - name: envoy.filters.http.router
                    typed_config:
                      "@type": type.googleapis.com/envoy.extensions.filters.http.router.v3.Router
  clusters:
    - name: backend_service
      connect_timeout: 0.25s
      type: STRICT_DNS
      lb_policy: ROUND_ROBIN
      load_assignment:
        cluster_name: backend_service
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address: { address: backend, port_value: 8081 }
```

## Traefik Kubernetes IngressRoute CRD

```yaml
# ingressroute.yaml — Traefik v3 CRD
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: api-route
  namespace: default
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(`api.example.com`) && PathPrefix(`/v1`)
      kind: Rule
      services:
        - name: api-service
          port: 80
      middlewares:
        - name: rate-limit
        - name: jwt-verify
  tls:
    certResolver: letsencrypt
---
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: rate-limit
spec:
  rateLimit:
    average: 100
    burst: 50
```

## OpenAPI 驱动的网关路由声明

```yaml
# openapi-gateway.yaml — 使用 OpenAPI 规范自动生成路由与鉴权
openapi: 3.0.3
info:
  title: E-Commerce API
  version: 1.0.0
paths:
  /products:
    get:
      x-kong-route: { strip_path: false }
      x-ratelimit: { minute: 120 }
      responses:
        '200':
          description: Product list
  /orders:
    post:
      security:
        - bearerAuth: []
      x-kong-plugin-jwt: {}
      responses:
        '201':
          description: Order created
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## 自定义网关插件（Kong JS Plugin）

```javascript
// custom-auth.js — Kong Gateway JS Plugin（Pongo 测试框架兼容）
'use strict';

class CustomAuthHandler {
  constructor(config) {
    this.config = config;
  }

  async access(kong) {
    const header = await kong.request.getHeader('x-api-key');
    if (!header || header !== this.config.expected_key) {
      return await kong.response.exit(401, JSON.stringify({ error: 'Unauthorized' }));
    }
  }
}

module.exports = {
  Plugin: CustomAuthHandler,
  Schema: [
    { expected_key: { type: 'string', required: true } },
  ],
  Version: '1.0.0',
};
```

---

## 代码示例：Express Gateway 中间件限流实现

```typescript
// express-gateway-limiter.ts — 基于 Express 的轻量级网关限流
import express, { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// 基于 Redis 的分布式限流
const distributedLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 1000, // 1 分钟
  max: (req: Request) => {
    // 根据 API Key 等级动态调整配额
    const tier = req.headers['x-api-tier'] as string || 'free';
    return tier === 'premium' ? 10000 : tier === 'pro' ? 1000 : 100;
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip ?? 'unknown',
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too Many Requests',
      retryAfter: Math.ceil((distributedLimiter as any).windowMs / 1000),
    });
  },
});

// 基于内存的本地限流（兜底）
const localLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
});

const app = express();
app.use(localLimiter);
app.use('/api/v1/', distributedLimiter);

// 反向代理到上游服务
import { createProxyMiddleware } from 'http-proxy-middleware';

app.use('/api/v1/users', createProxyMiddleware({
  target: 'http://user-service:8080',
  changeOrigin: true,
  pathRewrite: { '^/api/v1/users': '/users' },
}));

app.listen(3000, () => console.log('Express Gateway on :3000'));
```

## 代码示例：Envoy WASM 过滤器基础

```rust
// envoy-wasm-filter.rs — 使用 Rust 编写 Envoy WASM 过滤器
// 编译: cargo build --target=wasm32-wasi --release

use proxy_wasm::traits::*;
use proxy_wasm::types::*;

proxy_wasm::main! {{
    proxy_wasm::set_log_level(LogLevel::Trace);
    proxy_wasm::set_root_context(|_| -> Box<dyn RootContext> {
        Box::new(HttpAuthRoot)
    });
}}

struct HttpAuthRoot;

impl Context for HttpAuthRoot {}

impl RootContext for HttpAuthRoot {
    fn get_type(&self) -> Option<ContextType> {
        Some(ContextType::HttpContext)
    }

    fn create_http_context(&self, _context_id: u32) -> Option<Box<dyn HttpContext>> {
        Some(Box::new(HttpAuthFilter))
    }
}

struct HttpAuthFilter;

impl Context for HttpAuthFilter {}

impl HttpContext for HttpAuthFilter {
    fn on_http_request_headers(&mut self, _num_headers: usize, _end_of_stream: bool) -> Action {
        if let Some(token) = self.get_http_request_header("authorization") {
            if token.starts_with("Bearer ") && validate_token(&token[7..]) {
                return Action::Continue;
            }
        }
        self.send_http_response(401, vec![], Some(b"Unauthorized"));
        Action::Pause
    }
}

fn validate_token(token: &str) -> bool {
    // 简化的 token 验证逻辑
    token.len() > 20
}
```

## 代码示例：AWS API Gateway OpenAPI 导入与 Lambda 集成

```typescript
// aws-apigw-import.ts — 使用 AWS CDK 导入 OpenAPI 并集成 Lambda
import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new lambda.NodejsFunction(this, 'ApiHandler', {
      entry: './src/handler.ts',
      handler: 'handler',
      runtime: cdk.aws_lambda.Runtime.NODEJS_22_X,
    });

    const api = new apigw.RestApi(this, 'EcommerceApi', {
      restApiName: 'E-commerce API',
      deployOptions: {
        tracingEnabled: true,
        loggingLevel: apigw.MethodLoggingLevel.INFO,
      },
    });

    // OpenAPI 驱动的资源创建
    const products = api.root.addResource('products');
    products.addMethod('GET', new apigw.LambdaIntegration(handler), {
      methodResponses: [{ statusCode: '200' }],
      apiKeyRequired: true,
    });

    // 创建 API Key 与使用计划
    const plan = api.addUsagePlan('UsagePlan', {
      name: 'Standard',
      throttle: { rateLimit: 100, burstLimit: 50 },
      quota: { limit: 10000, period: apigw.Period.DAY },
    });

    const key = api.addApiKey('ApiKey');
    plan.addApiKey(key);
    plan.addApiStage({ stage: api.deploymentStage });
  }
}
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
- [OpenAPI Initiative Specification](https://spec.openapis.org/oas/latest.html)
- [CNCF API Gateway Landscape](https://landscape.cncf.io/guide#orchestration-management--api-gateway)
- [Google Cloud API Gateway Docs](https://cloud.google.com/api-gateway/docs)
- [Azure API Management Docs](https://learn.microsoft.com/en-us/azure/api-management/)
- [Kong Plugin Development Kit](https://docs.konghq.com/gateway/latest/plugin-development/)
- [Envoy WASM Filters](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/wasm_filter)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Express Rate Limit — npm](https://www.npmjs.com/package/express-rate-limit)
- [Envoy Proxy — Architecture Overview](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/)
- [AWS CDK — API Gateway Construct](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway-readme.html)
- [Kong — DB-less Declarative Configuration](https://docs.konghq.com/gateway/latest/production/deployment-topologies/db-less-and-declarative-config/)
- [Istio — Gateway Configuration](https://istio.io/latest/docs/tasks/traffic-management/ingress/ingress-control/)
- [NGINX — Rate Limiting](https://www.nginx.com/blog/rate-limiting-nginx/)
- [Microsoft — API Management Patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-offloading)
- [Google — API Design Guide](https://cloud.google.com/apis/design)
- [Envoy WASM SDK — proxy-wasm-rust-sdk](https://github.com/proxy-wasm/proxy-wasm-rust-sdk)

---

*最后更新: 2026-04-29*
