/**
 * @file 性能监控 - Core Web Vitals
 * @category Performance → Monitoring
 * @difficulty medium
 * @tags performance, web-vitals, core-web-vitals, rum, metrics
 * 
 * @description
 * 性能监控实现：
 * - Core Web Vitals 采集
 * - 真实用户监控 (RUM)
 * - 性能指标计算
 * - 性能预算
 * - 报告与分析
 */

// ============================================================================
// 1. Core Web Vitals 指标
// ============================================================================

export interface WebVitalsMetric {
  name: 'CLS' | 'LCP' | 'FID' | 'INP' | 'FCP' | 'TTFB' | 'FMP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  entries: PerformanceEntry[];
  navigationType?: string;
}

export interface WebVitalsReport {
  url: string;
  timestamp: number;
  metrics: Map<string, WebVitalsMetric>;
  deviceInfo: DeviceInfo;
  connectionInfo: ConnectionInfo;
}

export interface DeviceInfo {
  memory?: number;
  cores: number;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
}

export interface ConnectionInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

// CLS (Cumulative Layout Shift)
export class CLSMonitor {
  private value = 0;
  private entries: PerformanceEntry[] = [];
  private observer: PerformanceObserver | null = null;

  start(): void {
    if (!('PerformanceObserver' in window)) return;

    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          this.value += (entry as any).value;
          this.entries.push(entry);
        }
      }
    });

    this.observer.observe({ entryTypes: ['layout-shift'] as any });
  }

  getMetric(): WebVitalsMetric {
    const rating = this.value < 0.1 ? 'good' : 
                   this.value < 0.25 ? 'needs-improvement' : 'poor';
    
    return {
      name: 'CLS',
      value: Math.round(this.value * 1000) / 1000,
      rating,
      entries: [...this.entries]
    };
  }

  stop(): void {
    this.observer?.disconnect();
  }
}

// LCP (Largest Contentful Paint)
export class LCPMonitor {
  private value = 0;
  private entries: PerformanceEntry[] = [];
  private observer: PerformanceObserver | null = null;

  start(): void {
    if (!('PerformanceObserver' in window)) return;

    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.value = lastEntry.startTime;
      this.entries.push(lastEntry);
    });

    this.observer.observe({ entryTypes: ['largest-contentful-paint'] as any });
  }

  getMetric(): WebVitalsMetric {
    const rating = this.value < 2500 ? 'good' : 
                   this.value < 4000 ? 'needs-improvement' : 'poor';
    
    return {
      name: 'LCP',
      value: Math.round(this.value),
      rating,
      entries: [...this.entries]
    };
  }

  stop(): void {
    this.observer?.disconnect();
  }
}

// FID (First Input Delay)
export class FIDMonitor {
  private value = 0;
  private entries: PerformanceEntry[] = [];
  private listener: ((e: Event) => void) | null = null;

  start(): void {
    this.listener = (event: Event) => {
      const entry = performance.now();
      const targetTime = (event as any).timeStamp;
      this.value = entry - targetTime;
      
      // 创建模拟的 PerformanceEntry
      this.entries.push({
        name: 'first-input',
        entryType: 'first-input',
        startTime: targetTime,
        duration: this.value,
        toJSON: () => ({})
      } as PerformanceEntry);

      // 只记录第一次输入
      if (this.listener) {
        window.removeEventListener('click', this.listener);
        window.removeEventListener('keydown', this.listener);
        window.removeEventListener('touchstart', this.listener);
      }
    };

    window.addEventListener('click', this.listener, { once: true });
    window.addEventListener('keydown', this.listener, { once: true });
    window.addEventListener('touchstart', this.listener, { once: true });
  }

  getMetric(): WebVitalsMetric {
    const rating = this.value < 100 ? 'good' : 
                   this.value < 300 ? 'needs-improvement' : 'poor';
    
    return {
      name: 'FID',
      value: Math.round(this.value),
      rating,
      entries: [...this.entries]
    };
  }

  stop(): void {
    if (this.listener) {
      window.removeEventListener('click', this.listener);
      window.removeEventListener('keydown', this.listener);
      window.removeEventListener('touchstart', this.listener);
    }
  }
}

// INP (Interaction to Next Paint)
export class INPMonitor {
  private interactions: Array<{ delay: number; entry: PerformanceEntry }> = [];
  private observer: PerformanceObserver | null = null;

  start(): void {
    if (!('PerformanceObserver' in window)) return;

    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const duration = (entry as any).duration;
        this.interactions.push({ delay: duration, entry });
      }
    });

    this.observer.observe({ entryTypes: ['event'] as any, buffered: true });
  }

  getMetric(): WebVitalsMetric {
    // 取 98 百分位数
    const sorted = [...this.interactions].sort((a, b) => b.delay - a.delay);
    const index = Math.floor(sorted.length * 0.02);
    const value = sorted[index]?.delay || 0;
    
    const rating = value < 200 ? 'good' : 
                   value < 500 ? 'needs-improvement' : 'poor';
    
    return {
      name: 'INP',
      value: Math.round(value),
      rating,
      entries: sorted.slice(0, 10).map(i => i.entry)
    };
  }

  stop(): void {
    this.observer?.disconnect();
  }
}

// ============================================================================
// 2. 性能指标收集器
// ============================================================================

export class PerformanceCollector {
  private metrics: Map<string, WebVitalsMetric> = new Map();
  private monitors: Map<string, { start: () => void; getMetric: () => WebVitalsMetric; stop: () => void }> = new Map();
  private isCollecting = false;

  constructor() {
    this.monitors.set('cls', new CLSMonitor());
    this.monitors.set('lcp', new LCPMonitor());
    this.monitors.set('fid', new FIDMonitor());
    this.monitors.set('inp', new INPMonitor());
  }

  start(): void {
    if (this.isCollecting) return;
    
    this.isCollecting = true;
    this.monitors.forEach(monitor => monitor.start());
    
    // 传统指标
    this.collectTraditionalMetrics();
  }

  stop(): WebVitalsReport {
    this.isCollecting = false;
    
    this.monitors.forEach((monitor, key) => {
      const metric = monitor.getMetric();
      this.metrics.set(key, metric);
      monitor.stop();
    });

    return this.generateReport();
  }

  getMetrics(): Map<string, WebVitalsMetric> {
    // 实时获取当前指标
    this.monitors.forEach((monitor, key) => {
      if (this.isCollecting) {
        this.metrics.set(key, monitor.getMetric());
      }
    });
    
    return new Map(this.metrics);
  }

  private collectTraditionalMetrics(): void {
    // FCP
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
    
    if (fcpEntry) {
      const fcp = fcpEntry.startTime;
      this.metrics.set('fcp', {
        name: 'FCP',
        value: Math.round(fcp),
        rating: fcp < 1800 ? 'good' : fcp < 3000 ? 'needs-improvement' : 'poor',
        entries: [fcpEntry]
      });
    }

    // TTFB
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      const ttfb = navEntry.responseStart - navEntry.startTime;
      this.metrics.set('ttfb', {
        name: 'TTFB',
        value: Math.round(ttfb),
        rating: ttfb < 800 ? 'good' : ttfb < 1800 ? 'needs-improvement' : 'poor',
        entries: [navEntry]
      });
    }
  }

  private generateReport(): WebVitalsReport {
    return {
      url: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: Date.now(),
      metrics: new Map(this.metrics),
      deviceInfo: this.getDeviceInfo(),
      connectionInfo: this.getConnectionInfo()
    };
  }

  private getDeviceInfo(): DeviceInfo {
    return {
      memory: (navigator as any).deviceMemory,
      cores: navigator.hardwareConcurrency || 1,
      userAgent: navigator.userAgent,
      screenWidth: typeof window !== 'undefined' ? window.screen.width : 0,
      screenHeight: typeof window !== 'undefined' ? window.screen.height : 0,
      devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1
    };
  }

  private getConnectionInfo(): ConnectionInfo {
    const conn = (navigator as any).connection || {};
    
    return {
      effectiveType: conn.effectiveType || '4g',
      downlink: conn.downlink || 10,
      rtt: conn.rtt || 50,
      saveData: conn.saveData || false
    };
  }
}

// ============================================================================
// 3. 真实用户监控 (RUM)
// ============================================================================

export interface RUMConfig {
  endpoint: string;
  apiKey: string;
  sampleRate?: number;
  batchSize?: number;
  flushInterval?: number;
}

export class RUMMonitor {
  private config: Required<RUMConfig>;
  private queue: WebVitalsReport[] = [];
  private flushTimer: number | null = null;
  private collector: PerformanceCollector;

  constructor(config: RUMConfig) {
    this.config = {
      sampleRate: 1.0,
      batchSize: 10,
      flushInterval: 5000,
      ...config
    };
    
    this.collector = new PerformanceCollector();
  }

  start(): void {
    // 采样检查
    if (Math.random() > this.config.sampleRate) {
      console.log('[RUM] Skipped due to sample rate');
      return;
    }

    this.collector.start();
    
    // 页面加载完成后收集指标
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.collectAndSend();
        }, 100);
      });

      // 页面卸载前发送剩余数据
      window.addEventListener('beforeunload', () => {
        this.flush();
      });

      // 定期发送
      this.startFlushTimer();
    }
  }

  stop(): void {
    this.collector.stop();
    this.flush();
    this.stopFlushTimer();
  }

  // 手动触发数据收集
  collectAndSend(): void {
    const report = this.collector.stop();
    this.queue.push(report);
    
    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    }
    
    // 重新开始收集
    this.collector.start();
  }

  // 发送数据到服务器
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify({
          timestamp: Date.now(),
          reports: batch
        }),
        // 使用 keepalive 确保在页面卸载时也能发送
        keepalive: true
      });
      
      console.log(`[RUM] Flushed ${batch.length} reports`);
    } catch (error) {
      console.error('[RUM] Failed to send:', error);
      // 发送失败时保留数据
      this.queue.unshift(...batch);
    }
  }

  // 获取当前性能分数
  getPerformanceScore(): number {
    const metrics = this.collector.getMetrics();
    
    // 基于 Core Web Vitals 计算分数
    const weights = {
      lcp: 0.25,
      fcp: 0.15,
      fid: 0.30,
      cls: 0.30
    };

    let score = 0;
    let totalWeight = 0;

    for (const [key, weight] of Object.entries(weights)) {
      const metric = metrics.get(key);
      if (metric) {
        const metricScore = metric.rating === 'good' ? 1 : 
                           metric.rating === 'needs-improvement' ? 0.5 : 0;
        score += metricScore * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0;
  }

  private startFlushTimer(): void {
    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

// ============================================================================
// 4. 性能预算
// ============================================================================

export interface PerformanceBudget {
  metric: string;
  max: number;
  warning: number;
}

export class PerformanceBudgetChecker {
  private budgets: PerformanceBudget[] = [];
  private violations: Array<{ budget: PerformanceBudget; actual: number; timestamp: number }> = [];

  addBudget(budget: PerformanceBudget): void {
    this.budgets.push(budget);
  }

  removeBudget(metric: string): void {
    this.budgets = this.budgets.filter(b => b.metric !== metric);
  }

  check(metrics: Map<string, WebVitalsMetric>): Array<{
    metric: string;
    budget: number;
    actual: number;
    status: 'pass' | 'warning' | 'fail';
    overBudget: number;
  }> {
    const results = [];

    for (const budget of this.budgets) {
      const metric = metrics.get(budget.metric);
      if (!metric) continue;

      const actual = metric.value;
      let status: 'pass' | 'warning' | 'fail';

      if (actual <= budget.warning) {
        status = 'pass';
      } else if (actual <= budget.max) {
        status = 'warning';
      } else {
        status = 'fail';
        this.violations.push({
          budget,
          actual,
          timestamp: Date.now()
        });
      }

      results.push({
        metric: budget.metric,
        budget: budget.max,
        actual,
        status,
        overBudget: Math.max(0, actual - budget.max)
      });
    }

    return results;
  }

  // 生成性能预算报告
  generateReport(): {
    summary: { pass: number; warning: number; fail: number };
    violations: typeof this.violations;
    recommendations: string[];
  } {
    const results = this.check(new Map()); // 空检查获取最新状态
    
    const summary = {
      pass: results.filter(r => r.status === 'pass').length,
      warning: results.filter(r => r.status === 'warning').length,
      fail: results.filter(r => r.status === 'fail').length
    };

    const recommendations: string[] = [];
    
    for (const violation of this.violations.slice(-5)) {
      if (violation.budget.metric === 'lcp') {
        recommendations.push('Optimize LCP by reducing server response time and optimizing images');
      } else if (violation.budget.metric === 'cls') {
        recommendations.push('Fix CLS by reserving space for images and ads');
      } else if (violation.budget.metric === 'fid') {
        recommendations.push('Reduce FID by breaking up long tasks and using web workers');
      }
    }

    return {
      summary,
      violations: [...this.violations],
      recommendations: [...new Set(recommendations)]
    };
  }

  getViolations(): typeof this.violations {
    return [...this.violations];
  }
}

// ============================================================================
// 5. 性能分析工具
// ============================================================================

export class PerformanceAnalyzer {
  // 分析资源加载性能
  static analyzeResources(): Array<{
    name: string;
    type: string;
    duration: number;
    size: number;
    rating: 'good' | 'slow' | 'large';
  }> {
    const entries = performance.getEntriesByType('resource');
    
    return entries.map(entry => {
      const duration = entry.duration;
      const size = (entry as any).transferSize || 0;
      
      let rating: 'good' | 'slow' | 'large' = 'good';
      if (duration > 1000) rating = 'slow';
      if (size > 500 * 1024) rating = 'large';
      
      return {
        name: entry.name,
        type: (entry as any).initiatorType || 'unknown',
        duration: Math.round(duration),
        size,
        rating
      };
    }).sort((a, b) => b.duration - a.duration);
  }

  // 分析长任务
  static analyzeLongTasks(): Array<{
    startTime: number;
    duration: number;
    rating: 'critical' | 'warning' | 'acceptable';
  }> {
    if (!('PerformanceObserver' in window)) return [];

    const entries = performance.getEntriesByType('longtask');
    
    return entries.map(entry => {
      const duration = entry.duration;
      
      let rating: 'critical' | 'warning' | 'acceptable' = 'acceptable';
      if (duration > 200) rating = 'critical';
      else if (duration > 50) rating = 'warning';
      
      return {
        startTime: entry.startTime,
        duration,
        rating
      };
    });
  }

  // 分析内存使用
  static analyzeMemory(): {
    used: number;
    total: number;
    limit: number;
    usagePercent: number;
  } | null {
    const memory = (performance as any).memory;
    
    if (!memory) return null;
    
    const used = memory.usedJSHeapSize;
    const total = memory.totalJSHeapSize;
    const limit = memory.jsHeapSizeLimit;
    
    return {
      used,
      total,
      limit,
      usagePercent: Math.round((used / limit) * 100)
    };
  }

  // 生成性能报告
  static generateReport(): {
    summary: {
      totalResources: number;
      slowResources: number;
      largeResources: number;
      longTasks: number;
      memoryUsage: number | null;
    };
    recommendations: string[];
  } {
    const resources = this.analyzeResources();
    const longTasks = this.analyzeLongTasks();
    const memory = this.analyzeMemory();

    const recommendations: string[] = [];

    // 资源优化建议
    const slowResources = resources.filter(r => r.rating === 'slow');
    if (slowResources.length > 0) {
      recommendations.push(`Optimize ${slowResources.length} slow-loading resources`);
    }

    const largeResources = resources.filter(r => r.rating === 'large');
    if (largeResources.length > 0) {
      recommendations.push(`Compress ${largeResources.length} large resources`);
    }

    // 长任务建议
    const criticalTasks = longTasks.filter(t => t.rating === 'critical');
    if (criticalTasks.length > 0) {
      recommendations.push(`Break up ${criticalTasks.length} critical long tasks`);
    }

    // 内存建议
    if (memory && memory.usagePercent > 80) {
      recommendations.push('High memory usage detected - check for memory leaks');
    }

    return {
      summary: {
        totalResources: resources.length,
        slowResources: slowResources.length,
        largeResources: largeResources.length,
        longTasks: longTasks.length,
        memoryUsage: memory?.usagePercent || null
      },
      recommendations
    };
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 性能监控 - Core Web Vitals ===\n');

  console.log('1. Core Web Vitals 指标');
  console.log('   LCP (Largest Contentful Paint):');
  console.log('     Good: < 2.5s, Needs Improvement: 2.5-4s, Poor: > 4s');
  console.log('   FID (First Input Delay):');
  console.log('     Good: < 100ms, Needs Improvement: 100-300ms, Poor: > 300ms');
  console.log('   CLS (Cumulative Layout Shift):');
  console.log('     Good: < 0.1, Needs Improvement: 0.1-0.25, Poor: > 0.25');
  console.log('   INP (Interaction to Next Paint):');
  console.log('     Good: < 200ms, Needs Improvement: 200-500ms, Poor: > 500ms');

  console.log('\n2. 性能指标收集器');
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    const collector = new PerformanceCollector();
    
    console.log('   Starting collection...');
    collector.start();
    
    // 模拟收集
    setTimeout(() => {
      const report = collector.stop();
      
      console.log('   Collected metrics:');
      report.metrics.forEach((metric, key) => {
        console.log(`     ${metric.name}: ${metric.value}${key === 'cls' ? '' : 'ms'} (${metric.rating})`);
      });
      
      console.log('   Device info:');
      console.log(`     Cores: ${report.deviceInfo.cores}`);
      console.log(`     Screen: ${report.deviceInfo.screenWidth}x${report.deviceInfo.screenHeight}`);
      
      console.log('   Connection info:');
      console.log(`     Type: ${report.connectionInfo.effectiveType}`);
      console.log(`     RTT: ${report.connectionInfo.rtt}ms`);
    }, 100);
  } else {
    console.log('   (Skipped in Node.js environment - requires browser Performance API)');
  }

  console.log('\n3. 真实用户监控 (RUM)');
  const rum = new RUMMonitor({
    endpoint: 'https://analytics.example.com/rum',
    apiKey: 'demo-key',
    sampleRate: 0.1
  });
  
  console.log('   RUM configuration:');
  console.log('     Endpoint: https://analytics.example.com/rum');
  console.log('     Sample Rate: 10%');
  console.log('     Batch Size: 10');
  console.log('     Flush Interval: 5s');

  console.log('\n4. 性能预算');
  const budgetChecker = new PerformanceBudgetChecker();
  
  budgetChecker.addBudget({ metric: 'lcp', max: 2500, warning: 2000 });
  budgetChecker.addBudget({ metric: 'fid', max: 100, warning: 80 });
  budgetChecker.addBudget({ metric: 'cls', max: 0.1, warning: 0.05 });
  
  console.log('   Performance budgets:');
  console.log('     LCP: max 2500ms, warning 2000ms');
  console.log('     FID: max 100ms, warning 80ms');
  console.log('     CLS: max 0.1, warning 0.05');

  console.log('\n5. 性能分析');
  if (typeof window !== 'undefined') {
    const analyzerReport = PerformanceAnalyzer.generateReport();
    
    console.log('   Performance summary:');
    console.log(`     Total resources: ${analyzerReport.summary.totalResources}`);
    console.log(`     Slow resources: ${analyzerReport.summary.slowResources}`);
    console.log(`     Large resources: ${analyzerReport.summary.largeResources}`);
    console.log(`     Long tasks: ${analyzerReport.summary.longTasks}`);
    
    console.log('   Recommendations:');
    analyzerReport.recommendations.forEach(rec => {
      console.log(`     - ${rec}`);
    });
  } else {
    console.log('   (Skipped in Node.js environment - requires browser Performance API)');
  }

  console.log('\n性能监控要点:');
  console.log('- Core Web Vitals: Google 核心性能指标，影响搜索排名');
  console.log('- RUM: 收集真实用户数据，了解实际体验');
  console.log('- 性能预算: 设定性能目标，防止性能退化');
  console.log('- 长任务: 识别阻塞主线程的任务，优化交互响应');
  console.log('- 资源分析: 优化加载慢或体积大的资源');
  console.log('- 内存监控: 检测内存泄漏，保持应用流畅');
}

// ============================================================================
// 导出（已在文件中使用 export class 导出）
// ============================================================================
