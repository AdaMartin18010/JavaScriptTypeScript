# 数据分析 — 理论基础

> **定位**：`20-code-lab/20.6-backend-apis/analytics`
> **关联**：`87-realtime-analytics` | `66-feature-flags` | `17-debugging-monitoring`

---

## 1. 埋点体系

### 代码埋点

开发者在关键位置手动插入追踪代码：

```javascript
// 基础事件追踪
analytics.track('button_click', {
  button_id: 'submit',
  page: 'checkout',
  user_id: 'user_123',
  timestamp: Date.now(),
});

// 带业务属性的结构化事件（Google Analytics 4 推荐格式）
analytics.track('purchase', {
  transaction_id: 'T_12345',
  value: 299.99,
  currency: 'CNY',
  items: [
    { item_id: 'SKU_123', item_name: 'TypeScript 进阶课程', quantity: 1, price: 299.99 },
  ],
});
```

### 可视化埋点

通过 UI 工具圈选元素自动追踪，无需代码修改：

```typescript
// 可视化埋点 SDK 的 DOM 监控实现原理
class VisualTracker {
  private observer: MutationObserver;

  constructor() {
    // 监听 DOM 变化，自动为带有 data-track-id 的元素绑定事件
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            this.bindTrackableElements(node);
          }
        });
      });
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
    this.bindTrackableElements(document.body);
  }

  private bindTrackableElements(root: Element) {
    root.querySelectorAll('[data-track-id]').forEach((el) => {
      const eventType = el.getAttribute('data-track-event') || 'click';
      const trackId = el.getAttribute('data-track-id')!;
      const props = this.parseProps(el.getAttribute('data-track-props'));

      el.addEventListener(eventType, () => {
        this.send({ event: trackId, ...props, path: location.pathname });
      });
    });
  }

  private parseProps(raw: string | null): Record<string, unknown> {
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  private send(payload: Record<string, unknown>) {
    navigator.sendBeacon?.('/analytics/collect', JSON.stringify(payload));
  }
}

// 使用：无需代码，由运营在可视化平台圈选配置
// <button data-track-id="buy_now" data-track-event="click" data-track-props='{"product":"course"}'>立即购买</button>
```

### 无埋点（全埋点）

自动采集所有用户交互，事后通过分析平台定义事件：

```typescript
// 全埋点自动采集器
class AutoTracker {
  private sessionId = crypto.randomUUID();
  private startTime = performance.now();

  init() {
    // 自动采集点击
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      this.collect({
        type: 'click',
        target: this.getElementPath(target),
        text: target.innerText?.slice(0, 50),
        x: e.clientX,
        y: e.clientY,
      });
    });

    // 自动采集页面浏览
    this.collect({ type: 'pageview', url: location.href, referrer: document.referrer });

    // 自动采集性能指标
    window.addEventListener('load', () => {
      setTimeout(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        this.collect({
          type: 'performance',
          ttfb: nav.responseStart - nav.startTime,
          fcp: this.getFCP(),
          lcp: this.getLCP(),
          cls: this.getCLS(),
        });
      }, 0);
    });
  }

  private getElementPath(el: HTMLElement): string {
    const parts: string[] = [];
    let current: HTMLElement | null = el;
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) selector += `#${current.id}`;
      else if (current.className) selector += `.${current.className.split(' ')[0]}`;
      parts.unshift(selector);
      current = current.parentElement;
    }
    return parts.join(' > ');
  }

  private getFCP(): number | null {
    const entry = performance.getEntriesByName('first-contentful-paint')[0];
    return entry ? entry.startTime : null;
  }

  private getLCP(): number | null {
    const entries = performance.getEntriesByType('largest-contentful-paint');
    return entries.length ? (entries[entries.length - 1] as any).startTime : null;
  }

  private getCLS(): number {
    let cls = 0;
    performance.getEntriesByType('layout-shift').forEach((entry: any) => {
      if (!entry.hadRecentInput) cls += entry.value;
    });
    return cls;
  }

  private collect(data: Record<string, unknown>) {
    const payload = {
      session_id: this.sessionId,
      timestamp: Date.now(),
      ...data,
    };
    // 批量发送或实时发送
    this.flush(payload);
  }

  private flush(payload: Record<string, unknown>) {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/analytics/auto', JSON.stringify(payload));
    } else {
      fetch('/analytics/auto', { method: 'POST', body: JSON.stringify(payload), keepalive: true });
    }
  }
}
```

---

## 2. 用户行为分析

### 漏斗分析

```typescript
// 多步骤转化率计算
interface FunnelStep {
  name: string;
  event: string;
  filter?: (event: AnalyticsEvent) => boolean;
}

interface AnalyticsEvent {
  user_id: string;
  event: string;
  timestamp: number;
  properties: Record<string, unknown>;
}

function calculateFunnel(events: AnalyticsEvent[], steps: FunnelStep[], windowHours = 24): number[] {
  const windowMs = windowHours * 60 * 60 * 1000;

  // 按用户分组，保留时间排序的事件
  const userEvents = groupBy(events, 'user_id');

  const conversions: number[] = new Array(steps.length).fill(0);

  for (const [, userEvts] of Object.entries(userEvents)) {
    const sorted = userEvts.sort((a, b) => a.timestamp - b.timestamp);
    let stepIndex = 0;
    let lastTimestamp = sorted[0]?.timestamp ?? 0;

    for (const evt of sorted) {
      if (stepIndex >= steps.length) break;
      const step = steps[stepIndex];

      if (evt.event === step.event && (!step.filter || step.filter(evt))) {
        if (stepIndex === 0 || evt.timestamp - lastTimestamp <= windowMs) {
          conversions[stepIndex]++;
          stepIndex++;
          lastTimestamp = evt.timestamp;
        }
      }
    }
  }

  return conversions;
}

// 示例：电商购买漏斗
const steps: FunnelStep[] = [
  { name: '浏览商品', event: 'product_view' },
  { name: '加入购物车', event: 'add_to_cart' },
  { name: '进入结算', event: 'begin_checkout' },
  { name: '完成支付', event: 'purchase' },
];

const conversions = calculateFunnel(rawEvents, steps, 48);
// [10000, 3500, 1200, 800] -> 转化率 35%, 34.3%, 66.7%
```

### 留存分析

```typescript
// Cohort 留存分析
interface CohortRetention {
  cohortDate: string; // YYYY-MM-DD
  totalUsers: number;
  retention: number[]; // Day 0, Day 1, Day 7, Day 30
}

function computeCohortRetention(
  events: AnalyticsEvent[],
  activationEvent: string
): CohortRetention[] {
  // 找到每个用户的首次激活日期
  const userFirstActive = new Map<string, string>();
  events
    .filter(e => e.event === activationEvent)
    .forEach(e => {
      const date = new Date(e.timestamp).toISOString().slice(0, 10);
      const existing = userFirstActive.get(e.user_id);
      if (!existing || date < existing) {
        userFirstActive.set(e.user_id, date);
      }
    });

  // 按日期分 cohort
  const cohorts = new Map<string, Set<string>>();
  userFirstActive.forEach((date, userId) => {
    if (!cohorts.has(date)) cohorts.set(date, new Set());
    cohorts.get(date)!.add(userId);
  });

  // 计算每个 cohort 的每日回流
  const result: CohortRetention[] = [];
  const sortedDates = Array.from(cohorts.keys()).sort();

  for (const date of sortedDates) {
    const users = cohorts.get(date)!;
    const retention: number[] = [];

    for (const day of [0, 1, 7, 14, 30]) {
      const checkDate = new Date(date);
      checkDate.setDate(checkDate.getDate() + day);
      const checkDateStr = checkDate.toISOString().slice(0, 10);

      const activeUsers = new Set(
        events
          .filter(e => {
            const evtDate = new Date(e.timestamp).toISOString().slice(0, 10);
            return evtDate === checkDateStr && users.has(e.user_id);
          })
          .map(e => e.user_id)
      );

      retention.push(activeUsers.size / users.size);
    }

    result.push({ cohortDate: date, totalUsers: users.size, retention });
  }

  return result;
}
```

### 路径分析（桑基图数据准备）

```typescript
interface PathNode {
  source: string;
  target: string;
  value: number;
}

function buildUserPaths(events: AnalyticsEvent[], maxSteps = 5): PathNode[] {
  const userEvents = groupBy(events, 'user_id');
  const transitions = new Map<string, number>();

  for (const [, evts] of Object.entries(userEvents)) {
    const sorted = evts
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, maxSteps);

    for (let i = 0; i < sorted.length - 1; i++) {
      const source = sorted[i].event;
      const target = sorted[i + 1].event;
      const key = `${source} -> ${target}`;
      transitions.set(key, (transitions.get(key) || 0) + 1);
    }
  }

  return Array.from(transitions.entries()).map(([key, value]) => {
    const [source, target] = key.split(' -> ');
    return { source, target, value };
  });
}

function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key]);
    acc[k] = acc[k] || [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
```

---

## 3. 隐私合规

- **GDPR**: 欧盟数据保护，需用户明确同意
- **CCPA**: 加州消费者隐私法
- **匿名化**: 去除 PII（个人身份信息）
- **数据最小化**: 只收集必要数据

### 隐私保护实现示例

```typescript
// privacy-utils.ts

import { createHash } from 'crypto';

// k-匿名化：确保每个记录至少有 k 条相同属性组合
function kAnonymize(records: Record<string, string>[], quasiIdentifiers: string[], k = 5): Record<string, string>[] {
  // 泛化算法：对邮编取前3位，年龄取区间
  return records.map(record => {
    const generalized = { ...record };
    if (record.zipcode) {
      generalized.zipcode = record.zipcode.slice(0, 3) + '**';
    }
    if (record.age) {
      const age = parseInt(record.age);
      const lower = Math.floor(age / 10) * 10;
      generalized.age = `${lower}-${lower + 9}`;
    }
    return generalized;
  }).filter(record => {
    // 简化的 k-匿名检查
    const key = quasiIdentifiers.map(q => record[q]).join('|');
    const count = records.filter(r => quasiIdentifiers.map(q => r[q]).join('|') === key).length;
    return count >= k;
  });
}

// 差分隐私：向聚合结果添加拉普拉斯噪声
function differentialPrivacyCount(trueCount: number, epsilon = 1.0): number {
  const sensitivity = 1; // 计数查询的敏感度
  const scale = sensitivity / epsilon;
  const noise = laplaceRandom(0, scale);
  return Math.max(0, Math.round(trueCount + noise));
}

function laplaceRandom(mu: number, b: number): number {
  const u = Math.random() - 0.5;
  return mu - b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

// 假名化（Pseudonymization）
function pseudonymize(userId: string, secret: string): string {
  return createHash('sha256').update(userId + secret).digest('hex').slice(0, 16);
}

// GDPR 数据删除请求处理
class GDPRComplianceManager {
  private retentionDays = 90;

  async handleDeletionRequest(userId: string, eventStore: EventStore) {
    // 1. 删除可识别信息
    await eventStore.anonymizeUserEvents(userId, { user_id: 'DELETED', ip: null });
    // 2. 删除用户画像
    await eventStore.deleteUserProfile(userId);
    // 3. 记录删除审计日志
    await eventStore.logAudit({ action: 'user_deletion', userId, timestamp: Date.now() });
  }

  async purgeExpiredData(eventStore: EventStore) {
    const cutoff = Date.now() - this.retentionDays * 24 * 60 * 60 * 1000;
    await eventStore.deleteEventsBefore(cutoff);
  }
}
```

---

## 4. 采样与性能优化

```typescript
// sampling.ts — 客户端采样以降低服务端压力
class SamplingTracker {
  private sampleRate: number;

  constructor(sampleRate = 1.0) {
    this.sampleRate = Math.max(0, Math.min(1, sampleRate));
  }

  shouldTrack(): boolean {
    if (this.sampleRate >= 1) return true;
    return Math.random() < this.sampleRate;
  }

  // 按用户 ID 一致性采样：同一用户始终命中或始终丢弃
  shouldTrackUser(userId: string): boolean {
    if (this.sampleRate >= 1) return true;
    const hash = userId.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
    const normalized = (Math.abs(hash) % 1000) / 1000;
    return normalized < this.sampleRate;
  }
}

// 服务端采样：在高并发场景下对事件进行降采样
function reservoirSample<T>(stream: T[], k: number): T[] {
  const reservoir: T[] = stream.slice(0, k);
  for (let i = k; i < stream.length; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    if (j < k) reservoir[j] = stream[i];
  }
  return reservoir;
}
```

---

## 5. 实时分析 WebSocket 流

```typescript
// realtime-analytics.ts — 服务端实时聚合流
import { WebSocketServer } from 'ws';

interface AnalyticsWindow {
  start: number;
  events: number;
  uniqueUsers: Set<string>;
}

class RealtimeAnalytics {
  private window: AnalyticsWindow = { start: Date.now(), events: 0, uniqueUsers: new Set() };
  private windowMs = 60_000; // 1 分钟滑动窗口

  record(event: AnalyticsEvent) {
    const now = Date.now();
    if (now - this.window.start > this.windowMs) {
      this.emitSummary();
      this.window = { start: now, events: 0, uniqueUsers: new Set() };
    }
    this.window.events++;
    this.window.uniqueUsers.add(event.user_id);
  }

  private emitSummary() {
    const summary = {
      interval: new Date(this.window.start).toISOString(),
      events: this.window.events,
      uniqueUsers: this.window.uniqueUsers.size,
    };
    // 推送到监控仪表盘
    console.log('[Realtime]', summary);
  }

  attach(wss: WebSocketServer) {
    wss.on('connection', (ws) => {
      // 每 10 秒推送当前窗口统计
      const interval = setInterval(() => {
        ws.send(JSON.stringify({
          events: this.window.events,
          uniqueUsers: this.window.uniqueUsers.size,
        }));
      }, 10_000);
      ws.on('close', () => clearInterval(interval));
    });
  }
}
```

---

## 6. 与相邻模块的关系

- **87-realtime-analytics**: 实时数据分析
- **66-feature-flags**: 特性开关与 A/B 测试
- **17-debugging-monitoring**: 监控与日志

---

## 7. 参考资源

### 规范与标准

- [Google Analytics 4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4) — GA4 服务端埋点协议
- [W3C Web Analytics Definitions](https://www.w3.org/TR/web-analytics/) — Web 分析术语标准
- [ISO/IEC 27001](https://www.iso.org/standard/27001) — 信息安全管理（数据合规）
- [IETF RFC 7234 — Caching](https://tools.ietf.org/html/rfc7234) — HTTP 缓存机制（影响埋点上报策略）
- [W3C Privacy-Preserving Ad Measurement](https://www.w3.org/community/privacy-preserving-ad-measurement/) — 隐私保护测量提案

### 开源工具

- [Plausible Analytics](https://plausible.io/) — 隐私优先、开源的网站分析（GDPR 合规）
- [PostHog](https://posthog.com/) — 开源产品分析平台（事件追踪、漏斗、A/B 测试）
- [Matomo](https://matomo.org/) — 自托管 Google Analytics 替代方案
- [Snowplow](https://snowplow.io/) — 企业级事件数据收集管道
- [Jitsu](https://jitsu.com/) — 实时事件收集（Segment 开源替代）
- [OpenReplay](https://openreplay.com/) — 开源会话录制与回放
- [Sentry Session Replay](https://docs.sentry.io/platforms/javascript/session-replay/) — 前端会话录制 SDK
- [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) — 隐私友好、无需 Cookie 的分析

### 隐私合规

- [GDPR.eu](https://gdpr.eu/) — GDPR 官方指南
- [OWASP Privacy Risks](https://owasp.org/www-project-top-10-privacy-risks/) — 隐私风险 Top 10
- [Differential Privacy — Google](https://github.com/google/differential-privacy) — 差分隐私开源库
- [Privacy Sandbox](https://developer.chrome.com/docs/privacy-sandbox/) — Chrome 隐私沙盒提案

### 性能测量

- [web.dev — Core Web Vitals](https://web.dev/articles/vitals) — Google 核心网页指标
- [MDN Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API) — 浏览器性能测量 API
- [MDN Navigator.sendBeacon](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) — 可靠的事件上报 API
- [Navigation Timing Level 2](https://www.w3.org/TR/navigation-timing-2/) — W3C 页面加载性能标准
- [Segment Spec — Event Tracking](https://segment.com/academy/collecting-data/) — 事件追踪规范与最佳实践

---

*最后更新: 2026-04-30*
