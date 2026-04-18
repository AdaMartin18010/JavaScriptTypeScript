# 90-web-apis-lab: 现代 Web APIs 实战实验室

## 模块说明

本模块聚焦现代浏览器原生 Web APIs 的高级用法，涵盖网络请求、流处理、Service Worker 离线策略以及浏览器观察器 API。所有代码均可在支持 ES2022+ 的现代浏览器中直接运行。

## 学习目标

1. 掌握 Fetch API 的高级特性：AbortController、流式读取、上传/下载进度追踪
2. 理解 Streams API 的管道组合、背压控制与数据转换
3. 实现 Service Worker 离线优先策略与 Background Sync
4. 熟练运用 IntersectionObserver、ResizeObserver、MutationObserver 解决实际场景问题

## 文件清单

| 文件 | 说明 |
|---|---|
| `fetch-advanced.ts` | Fetch API 高级用法 |
| `streams-pipeline.ts` | Streams API 管道与背压 |
| `service-worker-cache.ts` | Service Worker + Cache API |
| `observer-patterns.ts` | 浏览器观察器模式实战 |
| `web-apis-lab.test.ts` | 集成测试 |
| `index.ts` | 模块入口 |

## 运行方式

```bash
# 运行测试
pnpm vitest run 90-web-apis-lab

# TypeScript 类型检查
pnpm tsc --noEmit 90-web-apis-lab/*.ts
```

## 浏览器兼容性

- Chrome ≥ 90
- Edge ≥ 90
- Firefox ≥ 90
- Safari ≥ 15
