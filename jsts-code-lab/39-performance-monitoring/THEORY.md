# 性能监控 — 理论基础

## 1. Core Web Vitals

Google 提出的用户体验量化指标：

| 指标 | 定义 | 目标值 |
|------|------|--------|
| **LCP** | 最大内容绘制时间 | ≤ 2.5s |
| **FID** | 首次输入延迟 | ≤ 100ms |
| **CLS** | 累积布局偏移 | ≤ 0.1 |
| **INP** | 交互到下一帧绘制 | ≤ 200ms |
| **TTFB** | 首字节时间 | ≤ 600ms |

## 2. 性能监控类型

### RUM（Real User Monitoring）
- 采集真实用户的性能数据
- 工具：web-vitals 库、Sentry Performance、Datadog RUM
- 优势：反映真实场景，包含网络环境、设备差异

### Synthetic Monitoring
- 在受控环境中模拟用户访问
- 工具：Lighthouse CI、WebPageTest、Pingdom
- 优势：可重复、可对比、可设置基线

## 3. 性能预算

设定性能指标的阈值，超过时阻止部署：
```json
{
  "budgets": [
    { "type": "bundle", "maximumWarning": "200kb", "maximumError": "250kb" },
    { "type": "lcp", "maximumWarning": "2s", "maximumError": "2.5s" }
  ]
}
```

## 4. 性能回归检测

- **持续基准测试**: 每次 CI 运行性能测试，与基线对比
- **统计显著性**: 使用 t-test 判断性能变化是否显著
- **火焰图对比**: 定位性能回归的具体函数

## 5. 与相邻模块的关系

- **08-performance**: 性能优化策略
- **11-benchmarks**: 基准测试方法论
- **74-observability**: 可观测性体系
