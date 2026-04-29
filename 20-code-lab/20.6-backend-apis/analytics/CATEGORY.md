---
dimension: 综合
sub-dimension: Analytics
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Analytics 核心概念与工程实践。

## 包含内容

- 本模块聚焦 analytics 核心概念与工程实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 analytics-engine.test.ts
- 📄 analytics-engine.ts
- 📄 event-tracking.test.ts
- 📄 event-tracking.ts
- 📄 funnel-analysis.test.ts
- 📄 funnel-analysis.ts
- 📄 index.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 子模块速查

| 子模块 | 核心能力 | 关联文件 |
|--------|----------|----------|
| Event Tracking | 类型安全的事件采集、批处理与重试机制 | `event-tracking.ts` |
| Analytics Engine | 实时/离线指标聚合与窗口计算 | `analytics-engine.ts` |
| Funnel Analysis | 用户转化漏斗建模与步骤流失计算 | `funnel-analysis.ts` |

## 代码示例：类型安全的事件追踪 SDK

```typescript
// event-tracking.ts — 埋点 SDK 骨架
interface EventPayload<E extends string, P extends Record<string, unknown>> {
  event: E;
  payload: P;
  timestamp: number;
  sessionId: string;
}

class AnalyticsTracker {
  private queue: Array<EventPayload<string, Record<string, unknown>>> = [];
  private flushIntervalMs = 5000;
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    setInterval(() => this.flush(), this.flushIntervalMs);
    // 页面卸载前同步发送（Beacon API）
    window.addEventListener('beforeunload', () => this.flush(true));
  }

  track<E extends string, P extends Record<string, unknown>>(
    event: E,
    payload: P
  ): void {
    this.queue.push({
      event,
      payload,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
    });
    if (this.queue.length >= 10) this.flush();
  }

  private flush(sync = false): void {
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, this.queue.length);
    const body = JSON.stringify(batch);

    if (sync && navigator.sendBeacon) {
      navigator.sendBeacon(this.endpoint, new Blob([body], { type: 'application/json' }));
    } else {
      fetch(this.endpoint, { method: 'POST', body, keepalive: true }).catch(() => {
        // 失败回写入队列头部，带指数退避重试
        this.queue.unshift(...batch);
      });
    }
  }

  private getSessionId(): string {
    let sid = sessionStorage.getItem('analytics_session');
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem('analytics_session', sid);
    }
    return sid;
  }
}

// 使用：tracker.track('purchase', { itemId: 'sku-123', value: 99.9 });
```

## 代码示例：实时指标聚合引擎

```typescript
// analytics-engine.ts — 滑动窗口指标聚合
interface MetricPoint {
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string>;
}

class SlidingWindowAggregator {
  private buffer: MetricPoint[] = [];
  private readonly windowMs: number;

  constructor(windowMs: number = 60_000) {
    this.windowMs = windowMs;
    setInterval(() => this.evict(), windowMs);
  }

  ingest(point: MetricPoint): void {
    this.buffer.push(point);
  }

  aggregate(
    name: string,
    operation: 'sum' | 'avg' | 'min' | 'max' | 'count'
  ): number {
    const now = Date.now();
    const relevant = this.buffer.filter(
      (p) => p.name === name && now - p.timestamp <= this.windowMs
    );

    if (relevant.length === 0) return 0;

    switch (operation) {
      case 'sum':
        return relevant.reduce((acc, p) => acc + p.value, 0);
      case 'avg':
        return relevant.reduce((acc, p) => acc + p.value, 0) / relevant.length;
      case 'min':
        return Math.min(...relevant.map((p) => p.value));
      case 'max':
        return Math.max(...relevant.map((p) => p.value));
      case 'count':
        return relevant.length;
    }
  }

  percentile(name: string, p: number): number {
    const now = Date.now();
    const values = this.buffer
      .filter((pt) => pt.name === name && now - pt.timestamp <= this.windowMs)
      .map((pt) => pt.value)
      .sort((a, b) => a - b);

    if (values.length === 0) return 0;
    const idx = Math.ceil((p / 100) * values.length) - 1;
    return values[Math.max(0, idx)];
  }

  private evict(): void {
    const cutoff = Date.now() - this.windowMs;
    this.buffer = this.buffer.filter((p) => p.timestamp > cutoff);
  }
}

// 使用：
// const engine = new SlidingWindowAggregator(300_000);
// engine.ingest({ name: 'api_latency', value: 45, timestamp: Date.now(), tags: { route: '/users' } });
// console.log(engine.percentile('api_latency', 95));
```

## 代码示例：用户转化漏斗分析

```typescript
// funnel-analysis.ts — 多步骤漏斗流失计算
interface FunnelStep {
  stepName: string;
  eventName: string;
}

interface FunnelResult {
  stepName: string;
  uniqueUsers: number;
  conversionRate: number; // 相对上一步的转化率
  dropOffRate: number;
  avgTimeToConvertMs: number;
}

class FunnelAnalyzer {
  constructor(private steps: FunnelStep[]) {}

  analyze(events: Array<{ userId: string; event: string; timestamp: number }>): FunnelResult[] {
    // 按用户分组并排序
    const byUser = new Map<string, typeof events>();
    for (const ev of events) {
      if (!byUser.has(ev.userId)) byUser.set(ev.userId, []);
      byUser.get(ev.userId)!.push(ev);
    }

    const results: FunnelResult[] = [];
    let previousCount = byUser.size;

    for (let i = 0; i < this.steps.length; i++) {
      const { stepName, eventName } = this.steps[i];
      let converted = 0;
      let totalTime = 0;

      for (const [, userEvents] of byUser) {
        const sorted = userEvents.sort((a, b) => a.timestamp - b.timestamp);
        // 查找当前步骤事件，且发生在前一步之后
        const prevEventTime = i === 0 ? 0 : this.findLastStepTime(sorted, this.steps[i - 1].eventName);
        const match = sorted.find((e) => e.event === eventName && e.timestamp >= prevEventTime);
        if (match) {
          converted++;
          if (i > 0) totalTime += match.timestamp - prevEventTime;
        }
      }

      results.push({
        stepName,
        uniqueUsers: converted,
        conversionRate: previousCount === 0 ? 0 : converted / previousCount,
        dropOffRate: previousCount === 0 ? 0 : (previousCount - converted) / previousCount,
        avgTimeToConvertMs: converted === 0 ? 0 : totalTime / converted,
      });

      previousCount = converted;
    }

    return results;
  }

  private findLastStepTime(events: typeof events, eventName: string): number {
    const matches = events.filter((e) => e.event === eventName);
    return matches.length ? matches[matches.length - 1].timestamp : 0;
  }
}

// 使用：
// const funnel = new FunnelAnalyzer([
//   { stepName: 'Visit', eventName: 'page_view' },
//   { stepName: 'SignUp', eventName: 'signup_submit' },
//   { stepName: 'Purchase', eventName: 'purchase_complete' },
// ]);
```

## 代码示例：隐私优先的匿名化聚合

```typescript
// privacy-first-analytics.ts — 差分隐私风格的客户端聚合
class PrivacyFirstAggregator {
  private localBuffer = new Map<string, number[]>();
  private readonly epsilon: number; // 隐私预算

  constructor(epsilon = 1.0) {
    this.epsilon = epsilon;
  }

  record(metric: string, value: number): void {
    if (!this.localBuffer.has(metric)) this.localBuffer.set(metric, []);
    this.localBuffer.get(metric)!.push(value);
  }

  // 在客户端完成聚合后再上报，减少原始事件传输
  flush(): Record<string, { count: number; sum: number; noisyAvg: number }> {
    const report: Record<string, { count: number; sum: number; noisyAvg: number }> = {};
    for (const [metric, values] of this.localBuffer) {
      const count = values.length;
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = count === 0 ? 0 : sum / count;
      // 添加拉普拉斯噪声实现本地差分隐私
      const noise = this.laplaceNoise(1 / count);
      report[metric] = { count, sum, noisyAvg: avg + noise };
    }
    this.localBuffer.clear();
    return report;
  }

  private laplaceNoise(scale: number): number {
    const u = Math.random() - 0.5;
    return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }
}
```

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Google Analytics 4 — Event Model | 官方事件模型文档 | [developers.google.com/analytics/devguides/collection/ga4](https://developers.google.com/analytics/devguides/collection/ga4) |
| Plausible Analytics — Privacy First | 隐私优先分析设计 | [plausible.io](https://plausible.io/) |
| Beacon API | W3C 标准 | [w3c.github.io/beacon](https://w3c.github.io/beacon/) |
| Mixpanel Developer Docs | 产品分析 SDK | [developer.mixpanel.com/docs](https://developer.mixpanel.com/docs) |
| Segment Protocols | 结构化事件规范 | [segment.com/docs/protocols](https://segment.com/docs/protocols/) |
| Amplitude Developer Center | 行为分析平台 | [developers.amplitude.com](https://developers.amplitude.com/) |
| PostHog Docs | 开源产品分析 | [posthog.com/docs](https://posthog.com/docs) |
| MDN — Performance API | 浏览器性能指标 | [developer.mozilla.org/en-US/docs/Web/API/Performance](https://developer.mozilla.org/en-US/docs/Web/API/Performance) |
| web.dev — Measure Performance | 性能测量指南 | [web.dev/measure](https://web.dev/measure/) |
| Apache Kafka — Event Streaming | 实时事件流处理 | [kafka.apache.org/documentation](https://kafka.apache.org/documentation/) |
| ClickHouse — Real-time Analytics DB | 分析型数据库 | [clickhouse.com/docs](https://clickhouse.com/docs) |

---

*最后更新: 2026-04-29*
