/**
 * @file Web Vitals 性能采集器
 * @category Observability → Performance
 * @difficulty medium
 * @tags performance-observer, web-vitals, lcp, cls, inp, ttfb
 */

// ============================================================================
// 1. 核心 Web Vitals 指标类型
// ============================================================================

export interface WebVitalMetric {
  /** 指标名称 */
  name: 'LCP' | 'FID' | 'INP' | 'CLS' | 'TTFB' | 'FCP';
  /** 指标值（LCP/FID/INP/TTFB/FCP 为毫秒，CLS 为分数） */
  value: number;
  /** 指标评级 */
  rating: 'good' | 'needs-improvement' | 'poor';
  /** 采集时间戳 */
  timestamp: number;
  /** 额外元数据 */
  entries?: PerformanceEntryList;
}

export interface WebVitalsCollectorOptions {
  /** 指标上报回调 */
  onReport: (metric: WebVitalMetric) => void;
  /** 是否上报所有中间值（LCP/CLS 会多次变化），默认 false */
  reportAllChanges?: boolean;
}

// ============================================================================
// 2. 阈值定义（基于 Google Web Vitals 标准）
// ============================================================================

const THRESHOLDS: Record<string, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  FCP: { good: 1800, poor: 3000 }
};

export function getRating(name: string, value: number): WebVitalMetric['rating'] {
  const t = THRESHOLDS[name];
  if (!t) return 'good';
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
}

// ============================================================================
// 3. LCP (Largest Contentful Paint)
// ============================================================================

/**
 * 采集 LCP 指标
 *  largest-contentful-paint 记录视口中最大可见元素渲染时间
 */
export function observeLCP(options: WebVitalsCollectorOptions): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return () => {};

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
    if (!lastEntry) return;

    const value = lastEntry.startTime;
    options.onReport({
      name: 'LCP',
      value,
      rating: getRating('LCP', value),
      timestamp: Date.now(),
      entries
    });
  });

  try {
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // 不支持该 entryType
    return () => {};
  }

  return () => observer.disconnect();
}

// ============================================================================
// 4. CLS (Cumulative Layout Shift)
// ============================================================================

/**
 * 采集 CLS 指标
 *  layout-shift 记录可见元素在视口中意外移动的累计分数
 */
export function observeCLS(options: WebVitalsCollectorOptions): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return () => {};

  let clsValue = 0;
  let sessionValue = 0;
  let sessionEntries: PerformanceEntry[] = [];

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const lsEntry = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
      // 忽略用户输入后 500ms 内的 layout shift
      if (lsEntry.hadRecentInput) continue;

      const firstSessionEntry = sessionEntries[0];
      const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

      // 如果与上一个 entry 间隔超过 1000ms 或窗口超过 5000ms，开启新 session
      if (
        firstSessionEntry &&
        (lsEntry.startTime - lastSessionEntry!.startTime > 1000 ||
          lsEntry.startTime - firstSessionEntry.startTime > 5000)
      ) {
        sessionValue = 0;
        sessionEntries = [];
      }

      sessionValue += lsEntry.value;
      sessionEntries.push(entry);

      if (sessionValue > clsValue) {
        clsValue = sessionValue;
        if (options.reportAllChanges || document.visibilityState === 'hidden') {
          options.onReport({
            name: 'CLS',
            value: clsValue,
            rating: getRating('CLS', clsValue),
            timestamp: Date.now(),
            entries: [...sessionEntries]
          });
        }
      }
    }
  });

  try {
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch {
    return () => {};
  }

  // 页面隐藏时上报最终值
  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden' && clsValue > 0) {
      options.onReport({
        name: 'CLS',
        value: clsValue,
        rating: getRating('CLS', clsValue),
        timestamp: Date.now()
      });
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}

// ============================================================================
// 5. INP (Interaction to Next Paint) / FID (First Input Delay)
// ============================================================================

/**
 * 采集 INP 指标（Chrome ≥ 96 支持 event-timing）
 * 如果浏览器不支持 INP，降级采集 FID
 */
export function observeINP(options: WebVitalsCollectorOptions): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return () => {};

  // 存储每个交互的延迟
  const interactionMap = new Map<number, number>(); // interactionId -> max duration

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const eventEntry = entry as PerformanceEntry & {
        interactionId: number;
        duration: number;
        startTime: number;
        processingStart: number;
      };

      // 忽略无 interactionId 的 entry（非用户交互）
      if (!eventEntry.interactionId) continue;

      const existing = interactionMap.get(eventEntry.interactionId) ?? 0;
      const duration = eventEntry.duration;
      if (duration > existing) {
        interactionMap.set(eventEntry.interactionId, duration);
      }
    }

    // INP 是所有交互中延迟最大的值
    const values = Array.from(interactionMap.values());
    if (values.length === 0) return;
    const inp = Math.max(...values);

    options.onReport({
      name: 'INP',
      value: inp,
      rating: getRating('INP', inp),
      timestamp: Date.now()
    });
  });

  try {
    observer.observe({ type: 'event', buffered: true, durationThreshold: 0 });
  } catch {
    return () => {};
  }

  // 页面隐藏时上报
  const onHidden = () => {
    if (document.visibilityState === 'hidden') {
      const values = Array.from(interactionMap.values());
      if (values.length > 0) {
        const inp = Math.max(...values);
        options.onReport({
          name: 'INP',
          value: inp,
          rating: getRating('INP', inp),
          timestamp: Date.now()
        });
      }
    }
  };
  document.addEventListener('visibilitychange', onHidden);

  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', onHidden);
  };
}

/**
 * 采集 FID（First Input Delay）
 * 适用于不支持 INP 的老版本浏览器
 */
export function observeFID(options: WebVitalsCollectorOptions): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return () => {};

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const firstEntry = entries[0] as PerformanceEntry & {
      processingStart: number;
      startTime: number;
    };
    if (!firstEntry) return;

    const value = firstEntry.processingStart - firstEntry.startTime;
    options.onReport({
      name: 'FID',
      value,
      rating: getRating('FID', value),
      timestamp: Date.now(),
      entries
    });
  });

  try {
    observer.observe({ type: 'first-input', buffered: true });
  } catch {
    return () => {};
  }

  return () => observer.disconnect();
}

// ============================================================================
// 6. TTFB (Time to First Byte)
// ============================================================================

/**
 * 采集 TTFB 指标：从请求发起到收到第一个字节的耗时
 */
export function observeTTFB(options: WebVitalsCollectorOptions): () => void {
  if (typeof window === 'undefined' || !('performance' in window)) return () => {};

  // 使用 navigation timing
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (navEntry) {
    const value = navEntry.responseStart;
    options.onReport({
      name: 'TTFB',
      value,
      rating: getRating('TTFB', value),
      timestamp: Date.now(),
      entries: [navEntry]
    });
  }

  return () => {};
}

// ============================================================================
// 7. FCP (First Contentful Paint)
// ============================================================================

/**
 * 采集 FCP 指标：首个内容渲染时间
 */
export function observeFCP(options: WebVitalsCollectorOptions): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return () => {};

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const firstEntry = entries[0] as PerformanceEntry & { startTime: number };
    if (!firstEntry) return;

    const value = firstEntry.startTime;
    options.onReport({
      name: 'FCP',
      value,
      rating: getRating('FCP', value),
      timestamp: Date.now(),
      entries
    });
  });

  try {
    observer.observe({ type: 'paint', buffered: true });
  } catch {
    return () => {};
  }

  return () => observer.disconnect();
}

// ============================================================================
// 8. 统一采集器
// ============================================================================

/**
 * 启动所有 Web Vitals 指标采集
 * @returns 一个函数，调用后停止所有观察器
 */
export function observeWebVitals(options: WebVitalsCollectorOptions): () => void {
  const disposers: (() => void)[] = [];

  disposers.push(observeLCP(options));
  disposers.push(observeCLS(options));
  disposers.push(observeINP(options));
  disposers.push(observeTTFB(options));
  disposers.push(observeFCP(options));

  // FID 降级（如果浏览器不支持 event-timing 的 interactionId）
  if (!('interactionId' in PerformanceEventTiming.prototype)) {
    disposers.push(observeFID(options));
  }

  return () => {
    for (const dispose of disposers) {
      dispose();
    }
  };
}

// ============================================================================
// Demo
// ============================================================================

export function demo(): void {
  console.log('=== Web Vitals 性能采集演示 ===\n');

  if (typeof window === 'undefined') {
    console.log('当前非浏览器环境，仅展示 API 调用方式');
    return;
  }

  const metrics: WebVitalMetric[] = [];

  const stop = observeWebVitals({
    onReport: (metric) => {
      metrics.push(metric);
      console.log(`[${metric.name}] ${metric.value.toFixed(2)} (${metric.rating})`);
    }
  });

  console.log('已启动 Web Vitals 采集，观察器数量:', metrics.length);

  // 实际指标采集是异步的，依赖页面加载和交互
  // 这里仅做演示，不阻塞
  setTimeout(() => {
    stop();
    console.log('\n=== 演示结束 ===\n');
  }, 100);
}
