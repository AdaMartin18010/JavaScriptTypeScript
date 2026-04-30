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

## 3. APM 工具对比

| 维度 | Sentry | Datadog APM | Elastic APM | New Relic | OpenTelemetry + SigNoz |
|------|--------|-------------|-------------|-----------|------------------------|
| **核心定位** | 错误追踪 + 性能监控 | 全栈云监控平台 | 搜索驱动可观测性 | 云原生全链路观测 | 开源 OTel 原生 APM |
| **定价模式** | 按错误事件 + 性能单元 | 按主机/服务 + 摄取量 | 自托管免费 / SaaS 按资源 | 按摄取数据量 (CCU) | 开源免费 / 云版按数据量 |
| **JS/TS SDK** | `@sentry/browser/node` | `dd-trace` | `elastic-apm-node` | `newrelic` | `@opentelemetry/sdk-node` |
| **自动埋点** | HTTP, DB, Redis, GraphQL | 极丰富（500+ 集成） | HTTP, DB, Messaging | HTTP, DB, Serverless | 依赖社区 instrumentation |
| **分布式追踪** | ✅ OpenTelemetry 兼容 | ✅ 原生 W3C Trace Context | ✅ 原生 + OTel 兼容 | ✅ 自动关联 | ✅ 原生 OTLP |
| **会话回放** | ✅ 高性能压缩回放 | ❌（需第三方集成） | ❌ | ✅ | ❌ |
| **Profiling** | ✅ 持续 Profiling（Node） | ✅ 持续 Profiling | ✅ Universal Profiling | ✅ CodeStream Profiling | ✅ 持续 Profiling |
| **告警能力** | 中（规则较简单） | **强**（ML 异常检测） | 强（Kibana Alerting） | 强（NRQL Alerting） | 中（开源版） |
| **自托管** | ✅ Sentry.io 或私有 | ❌ 仅 SaaS | ✅ Elastic Stack 本地部署 | ❌ 仅 SaaS | ✅ SigNoz / Jaeger 本地 |
| **数据保留** | 90 天（默认） | 15 个月（默认） | 自定义（磁盘决定） | 8 天（默认） | 自定义 |
| **最佳场景** | 错误优先 + 快速集成 | 企业全栈、多云混合 | 日志/搜索驱动、安全合规 | 云原生微服务、预算充足 | 成本敏感、开源优先、OTel |

> **选型建议**：
>
> - **初创团队 / 快速集成**：Sentry（免费额度 generous，5 分钟接入）
> - **企业级全栈监控**：Datadog（功能最全，但成本最高）
> - **已有 Elastic Stack**：Elastic APM（无缝集成 Kibana，搜索能力强）
> - **开源 / 成本敏感**：OpenTelemetry + SigNoz 或 Jaeger + Prometheus
> - **Serverless / 边缘**：New Relic 或 Datadog（对 Lambda/Workers 支持最佳）

## 4. 性能预算

设定性能指标的阈值，超过时阻止部署：

```json
{
  "budgets": [
    { "type": "bundle", "maximumWarning": "200kb", "maximumError": "250kb" },
    { "type": "lcp", "maximumWarning": "2s", "maximumError": "2.5s" }
  ]
}
```

## 5. 代码示例：Web Vitals 采集与上报

### 5.1 浏览器端 Core Web Vitals 实时上报

```typescript
// web-vitals-reporter.ts
import {
  onCLS,
  onFID,
  onFCP,
  onLCP,
  onINP,
  onTTFB,
  type Metric,
  type ReportOpts,
} from 'web-vitals';

interface VitalsPayload {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  // 附加上下文
  url: string;
  userAgent: string;
  deviceMemory?: number;
  connectionType?: string;
}

/**
 * 统一上报函数
 * 可替换为 Sentry.captureEvent、Datadog RUM api、或自研埋点接口
 */
async function reportVital(metric: Metric, apiEndpoint: string = '/api/vitals') {
  const payload: VitalsPayload = {
    name: metric.name,           // 'CLS' | 'FID' | 'FCP' | 'LCP' | 'INP' | 'TTFB'
    value: metric.value,
    rating: metric.rating,       // Google 评级阈值
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType || 'navigate',
    url: location.href,
    userAgent: navigator.userAgent,
    deviceMemory: (navigator as any).deviceMemory,
    connectionType: (navigator as any).connection?.effectiveType,
  };

  // 使用 sendBeacon 确保页面卸载时也能发送
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(apiEndpoint, blob);
  } else {
    // 回退到 fetch + keepalive
    await fetch(apiEndpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * 初始化 Web Vitals 监控
 * @param opts.attribution — 是否启用归因分析（定位导致慢指标的元素/请求）
 */
export function initWebVitalsReporting(opts: { attribution?: boolean; endpoint?: string } = {}) {
  const reportOpts: ReportOpts = {
    reportAllChanges: false, // true 会在每次变化时上报（如 CLS 持续累积）
  };

  // 归因版 API 可定位具体元素和加载资源
  const attribution = opts.attribution ?? false;

  onCLS((metric) => reportVital(metric, opts.endpoint), reportOpts);
  onFID((metric) => reportVital(metric, opts.endpoint), reportOpts);
  onFCP((metric) => reportVital(metric, opts.endpoint), reportOpts);
  onLCP((metric) => reportVital(metric, opts.endpoint), reportOpts);
  onINP((metric) => reportVital(metric, opts.endpoint), reportOpts);
  onTTFB((metric) => reportVital(metric, opts.endpoint), reportOpts);

  console.log('[Web Vitals] Reporting initialized');
}

// ===== 使用示例 =====
// 在应用入口（如 main.tsx 或 _app.tsx）调用：
// initWebVitalsReporting({ attribution: true, endpoint: '/api/vitals' });
```

### 5.2 Node.js 服务端性能追踪（集成 OpenTelemetry）

```typescript
// server-performance-span.ts
import { trace, SpanStatusCode, type Tracer } from '@opentelemetry/api';

const tracer: Tracer = trace.getTracer('performance-lab', '1.0.0');

/**
 * 包装 Express 路由处理器，自动创建性能 Span
 */
export function withPerformanceSpan(routeName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      return tracer.startActiveSpan(`http.${routeName}`, async (span) => {
        const startTime = performance.now();
        try {
          const result = await original.apply(this, args);
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (err) {
          span.setStatus({ code: SpanStatusCode.ERROR, message: (err as Error).message });
          span.recordException(err as Error);
          throw err;
        } finally {
          const duration = performance.now() - startTime;
          span.setAttribute('http.route', routeName);
          span.setAttribute('http.duration_ms', duration);
          if (duration > 500) {
            span.setAttribute('performance.degraded', true);
          }
          span.end();
        }
      });
    };
    return descriptor;
  };
}
```

### 5.3 资源加载性能 Observer（Resource Timing + Long Tasks）

```typescript
// resource-observer.ts
/**
 * 监控长任务（Long Tasks > 50ms）阻塞主线程
 */
export function observeLongTasks(callback: (entries: PerformanceEntry[]) => void) {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries());
    });
    observer.observe({ entryTypes: ['longtask'] });
    return () => observer.disconnect();
  }
  return () => {};
}

/**
 * 监控资源加载耗时，识别慢 CDN / API
 */
export function observeResourceTiming(
  filter: (entry: PerformanceResourceTiming) => boolean = () => true,
  callback: (slowResources: PerformanceResourceTiming[]) => void
) {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[];
      const slow = entries.filter(filter).filter((e) => e.responseEnd - e.startTime > 1000);
      if (slow.length) callback(slow);
    });
    observer.observe({ entryTypes: ['resource'] });
    return () => observer.disconnect();
  }
  return () => {};
}

// 使用
observeLongTasks((entries) => {
  console.warn('[Long Task] Main thread blocked:', entries.map((e) => e.duration));
});

observeResourceTiming(
  (e) => e.initiatorType === 'fetch' || e.initiatorType === 'xmlhttprequest',
  (slow) => {
    console.warn('[Slow API]', slow.map((s) => ({ url: s.name, duration: s.responseEnd - s.startTime })));
  }
);
```

## 6. 性能回归检测

- **持续基准测试**: 每次 CI 运行性能测试，与基线对比
- **统计显著性**: 使用 t-test 判断性能变化是否显著
- **火焰图对比**: 定位性能回归的具体函数

## 7. 代码示例：性能预算 CI 检查器

```typescript
// performance-budget-ci.ts — CI 中阻止超预算的部署
interface BudgetRule {
  type: 'bundle' | 'lcp' | 'fcp' | 'ttfb' | 'custom';
  maximumWarning: number;
  maximumError: number;
  unit: 'kb' | 'ms' | 's';
}

interface PerformanceReport {
  metrics: Record<string, number>;
  bundleSize?: number;
}

function checkBudgets(report: PerformanceReport, budgets: BudgetRule[]): { passed: boolean; violations: string[] } {
  const violations: string[] = [];

  for (const budget of budgets) {
    let value: number | undefined;
    if (budget.type === 'bundle') value = report.bundleSize;
    else value = report.metrics[budget.type];

    if (value === undefined) continue;

    if (value > budget.maximumError) {
      violations.push(`❌ FAIL: ${budget.type} = ${value}${budget.unit} exceeds max ${budget.maximumError}${budget.unit}`);
    } else if (value > budget.maximumWarning) {
      violations.push(`⚠️ WARN: ${budget.type} = ${value}${budget.unit} exceeds warning ${budget.maximumWarning}${budget.unit}`);
    }
  }

  return { passed: violations.filter((v) => v.startsWith('❌')).length === 0, violations };
}

// CI 脚本中使用
// const report = await runLighthouse(url);
// const result = checkBudgets(report, budgets);
// if (!result.passed) process.exit(1);
```

## 8. 代码示例：Node.js 内存泄漏检测器

```typescript
// memory-leak-detector.ts — 基于 heapdump 的内存监控
import { writeHeapSnapshot } from 'node:v8';
import os from 'node:os';

class MemoryLeakDetector {
  private snapshots: Array<{ timestamp: number; heapUsedMB: number }> = [];
  private thresholdMB: number;
  private growthRateThreshold = 1.2; // 20% 增长阈值

  constructor(thresholdMB = 512) {
    this.thresholdMB = thresholdMB;
  }

  check(): { leaking: boolean; growthRate: number; recommendation: string } {
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;

    this.snapshots.push({ timestamp: Date.now(), heapUsedMB });
    if (this.snapshots.length > 10) this.snapshots.shift();

    // 计算增长率
    let growthRate = 1;
    if (this.snapshots.length >= 3) {
      const first = this.snapshots[0].heapUsedMB;
      const last = this.snapshots[this.snapshots.length - 1].heapUsedMB;
      growthRate = last / first;
    }

    const leaking = heapUsedMB > this.thresholdMB && growthRate > this.growthRateThreshold;

    return {
      leaking,
      growthRate,
      recommendation: leaking
        ? `Potential memory leak detected. Heap: ${heapUsedMB.toFixed(1)}MB, Growth: ${((growthRate - 1) * 100).toFixed(1)}%`
        : 'Memory usage within normal range',
    };
  }

  captureSnapshot(path?: string): string {
    const filename = path ?? `heap-${Date.now()}.heapsnapshot`;
    writeHeapSnapshot(filename);
    return filename;
  }
}

// 使用：定时检查
// const detector = new MemoryLeakDetector(512);
// setInterval(() => {
//   const result = detector.check();
//   if (result.leaking) {
//     console.error(result.recommendation);
//     detector.captureSnapshot();
//   }
// }, 60_000);
```

## 9. 与相邻模块的关系

- **08-performance**: 性能优化策略
- **11-benchmarks**: 基准测试方法论
- **74-observability**: 可观测性体系

## 10. 权威参考链接

- [web-vitals npm package](https://github.com/GoogleChrome/web-vitals) — Google 官方 Web Vitals 库
- [Core Web Vitals by Google](https://web.dev/articles/vitals) — Google 核心 Web 指标详解
- [Sentry Performance Monitoring Docs](https://docs.sentry.io/platforms/javascript/performance/) — Sentry JS 性能监控文档
- [Datadog APM Docs](https://docs.datadoghq.com/tracing/) — Datadog 应用性能监控指南
- [Elastic APM Node.js Agent](https://www.elastic.co/guide/en/apm/agent/nodejs/current/index.html) — Elastic APM Node.js 代理文档
- [New Relic Browser Monitoring](https://docs.newrelic.com/docs/browser/browser-monitoring/getting-started/introduction-browser-monitoring/) — New Relic 浏览器监控
- [SigNoz Open Source APM](https://signoz.io/docs/) — 开源 OpenTelemetry APM 平台
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) — 自动化 Lighthouse 持续集成
- [W3C Performance Timeline](https://www.w3.org/TR/performance-timeline/) — W3C 性能时间线规范
- [OpenTelemetry JS SDK](https://opentelemetry.io/docs/languages/js/) — OpenTelemetry JavaScript 官方文档
- [Google Chrome — Performance API](https://developer.chrome.com/docs/devtools/performance/overview) — Chrome DevTools 性能分析指南
- [web.dev — Optimize LCP](https://web.dev/articles/optimize-lcp) — LCP 优化最佳实践
- [web.dev — Optimize INP](https://web.dev/articles/optimize-inp) — INP 交互性能优化
- [Node.js — Performance Hooks](https://nodejs.org/api/perf_hooks.html) — Node.js 内置性能测量 API
- [V8 — Memory Management](https://v8.dev/blog/trash-talk) — V8 垃圾回收与内存管理深度解析
- [Chrome User Experience Report (CrUX)](https://developer.chrome.com/docs/crux/) — 真实用户体验大数据集
- [SpeedCurve — Performance Budgets](https://www.speedcurve.com/blog/performance-budgets/) — 性能预算方法论
- [WebPageTest](https://www.webpagetest.org/) — 开源网页性能测试平台
- [Calibre — Performance Monitoring](https://calibreapp.com/) — 性能监控与预算工具
- [OpenTelemetry — W3C Trace Context](https://www.w3.org/TR/trace-context/) — 分布式追踪标准
- [Grafana — Frontend Observability](https://grafana.com/solutions/frontend-observability/) — 前端性能仪表盘

---

*最后更新: 2026-04-30*
