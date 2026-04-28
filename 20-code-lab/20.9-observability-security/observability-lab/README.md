# 92-observability-lab: 可观测性实战实验室

## 模块说明

本模块实现生产级可观测性基础设施，包含结构化日志器、错误上报 SDK 与 Web Vitals 性能采集器。所有组件均为零依赖实现，可直接集成到浏览器或 Node.js 应用中。

## 学习目标

1. 实现支持多级别、上下文注入、敏感字段脱敏的结构化日志器
2. 实现具备全局错误捕获、采样率控制、离线队列的错误上报 SDK
3. 使用 PerformanceObserver API 采集 LCP、FID/INP、CLS、TTFB 等 Web Vitals 指标

## 文件清单

| 文件 | 说明 |
|---|---|
| `structured-logger.ts` | 生产级结构化日志器 |
| `error-reporter.ts` | 错误上报 SDK |
| `performance-observer.ts` | Web Vitals 性能采集 |
| `observability-lab.test.ts` | 集成测试 |
| `index.ts` | 模块入口 |

## 运行方式

```bash
# 运行测试
pnpm vitest run 92-observability-lab

# 类型检查
pnpm tsc --noEmit 92-observability-lab/*.ts
```

## 兼容性

- 现代浏览器（Chrome ≥ 88, Firefox ≥ 90, Safari ≥ 14.1）
- Node.js ≥ 18（日志器与错误上报 SDK 部分）
