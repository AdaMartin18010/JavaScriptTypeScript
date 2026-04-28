# 63-caching-strategies

Caching strategies and implementations in TypeScript.

## Topics

| Topic | File | Description |
|---|---|---|
| Cache Patterns | `cache-patterns.ts` | General caching patterns and abstractions |
| Cache Aside | `cache-aside.ts` | Lazy loading cache with hit/miss statistics |
| Write Strategies | `write-strategies.ts` | Write-Through, Write-Behind, Write-Around, Batch Write |
| Distributed Cache | `distributed-cache.ts` | Distributed cache with consistency patterns |
| LRU Cache | `lru-cache.ts` | Least Recently Used cache with doubly-linked list |
| TTL Cache | `ttl-cache.ts` | Time-based expiration cache with cleanup and tiered storage |
| Cache Protection | `cache-protection.ts` | Penetration, breakdown, avalanche guards with Bloom filter |
| Cache Consistency | `cache-consistency.ts` | Distributed cache invalidation and version vectors |

## Running Tests

```bash
npx vitest run 63-caching-strategies
```
