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

## 4. 与相邻模块的关系

- **87-realtime-analytics**: 实时数据分析
- **66-feature-flags**: 特性开关与 A/B 测试
- **17-debugging-monitoring**: 监控与日志

---

## 5. 参考资源

### 规范与标准
- [Google Analytics 4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4) — GA4 服务端埋点协议
- [W3C Web Analytics Definitions](https://www.w3.org/TR/web-analytics/) — Web 分析术语标准
- [ISO/IEC 27001](https://www.iso.org/standard/27001) — 信息安全管理（数据合规）

### 开源工具
- [Plausible Analytics](https://plausible.io/) — 隐私优先、开源的网站分析（GDPR 合规）
- [PostHog](https://posthog.com/) — 开源产品分析平台（事件追踪、漏斗、A/B 测试）
- [Matomo](https://matomo.org/) — 自托管 Google Analytics 替代方案
- [Snowplow](https://snowplow.io/) — 企业级事件数据收集管道
- [Jitsu](https://jitsu.com/) — 实时事件收集（Segment 开源替代）

### 隐私合规
- [GDPR.eu](https://gdpr.eu/) — GDPR 官方指南
- [OWASP Privacy Risks](https://owasp.org/www-project-top-10-privacy-risks/) — 隐私风险 Top 10
- [Differential Privacy — Google](https://github.com/google/differential-privacy) — 差分隐私开源库

### 性能测量
- [web.dev — Core Web Vitals](https://web.dev/articles/vitals) — Google 核心网页指标
- [MDN Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API) — 浏览器性能测量 API

---

*最后更新: 2026-04-29*
