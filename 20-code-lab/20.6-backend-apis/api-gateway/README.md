# 61-api-gateway

API Gateway patterns and implementations in TypeScript.

## Topics

| Topic | File | Description |
|---|---|---|
| Gateway Implementation | `gateway-implementation.ts` | Core gateway request processing pipeline |
| Rate Limiting | `rate-limiting.ts` | Token bucket, sliding window rate limiters |
| Authentication | `authentication.ts` | JWT, API Key, OAuth2, composite auth middleware |
| Request Routing | `request-routing.ts` | Path matching, router, dynamic routing, middleware chain |
| Load Balancing | `load-balancing.ts` | Round-robin, least-connections, weighted strategies |
| Caching Layer | `caching-layer.ts` | Response caching with TTL and invalidation |
| Request Transformer | `request-transformer.ts` | Protocol adaptation, header/query/body mapping |
| Health Check | `health-check.ts` | Service health monitoring, readiness/liveness probes |
| Response Aggregator | `response-aggregator.ts` | Parallel backend requests with aggregation strategies |

## Running Tests

```bash
npx vitest run 61-api-gateway
```
