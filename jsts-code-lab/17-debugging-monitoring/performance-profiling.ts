/**
 * @file 性能分析与监控
 * @category Debugging & Monitoring → Profiling
 * @difficulty hard
 * @tags performance, profiling, monitoring, metrics, observability
 * 
 * @description
 * 应用性能监控与调试技术：
 * - 性能指标采集
 * - 内存分析
 * - 性能剖析 (Profiling)
 * - 实时监控
 */

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

declare global {
  interface PerformanceObserverInit {
    entryTypes?: string[];
  }
  interface Performance {
    memory?: MemoryInfo;
  }
}

// ============================================================================
// 1. 性能指标采集器
// ============================================================================

export interface PerformanceMetrics {
  // 时间指标
  fcp?: number;        // First Contentful Paint
  lcp?: number;        // Largest Contentful Paint
  fid?: number;        // First Input Delay
  cls?: number;        // Cumulative Layout Shift
  ttfb?: number;       // Time to First Byte
  
  // 资源加载
  resourceLoadTimes?: Array<{
    name: string;
    duration: number;
    size: number;
  }>;
  
  // JavaScript 执行
  longTasks?: Array<{
    duration: number;
    startTime: number;
  }>;
  
  // 内存使用
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: Array<() => void> = [];

  // 启动监控
  start(): void {
    this.observePaintTiming();
    this.observeLongTasks();
    this.observeMemory();
  }

  // 观察绘制时间
  private observePaintTiming(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
          }
          if (entry.entryType === 'largest-contentful-paint') {
            this.metrics.lcp = entry.startTime;
          }
        }
      });
      
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      this.observers.push(() => observer.disconnect());
    }
  }

  // 观察长任务
  private observeLongTasks(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        this.metrics.longTasks = this.metrics.longTasks || [];
        
        for (const entry of list.getEntries()) {
          this.metrics.longTasks!.push({
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(() => observer.disconnect());
    }
  }

  // 观察内存
  private observeMemory(): void {
    if ('memory' in performance) {
      const memory = performance.memory;
      if (memory) {
        this.metrics.memory = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        };
      }
    }
  }

  // 记录自定义指标
  recordCustomMetric(name: string, value: number): void {
    console.log(`[Metric] ${name}: ${value}ms`);
  }

  // 测量函数执行时间
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.recordCustomMetric(name, end - start);
    return result;
  }

  // 异步测量
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.recordCustomMetric(name, end - start);
    return result;
  }

  // 获取报告
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // 生成报告
  generateReport(): string {
    const m = this.metrics;
    return `
性能监控报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
核心 Web 指标:
  FCP: ${m.fcp ? m.fcp.toFixed(2) + 'ms' : 'N/A'}
  LCP: ${m.lcp ? m.lcp.toFixed(2) + 'ms' : 'N/A'}

内存使用:
  ${m.memory ? `${(m.memory.usedJSHeapSize / 1048576).toFixed(2)} MB / ${(m.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB` : 'N/A'}

长任务:
  ${m.longTasks ? m.longTasks.length + ' 个' : 'N/A'}
    `.trim();
  }

  // 停止监控
  stop(): void {
    this.observers.forEach(stop => stop());
    this.observers = [];
  }
}

// ============================================================================
// 2. 内存分析器
// ============================================================================

export interface MemorySnapshot {
  timestamp: number;
  used: number;
  total: number;
  objects: Map<string, number>;  // 类型 -> 数量
}

export class MemoryProfiler {
  private snapshots: MemorySnapshot[] = [];

  takeSnapshot(): MemorySnapshot {
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      used: 0,
      total: 0,
      objects: new Map()
    };

    if ('memory' in performance) {
      const memory = performance.memory;
      if (memory) {
        snapshot.used = memory.usedJSHeapSize;
        snapshot.total = memory.totalJSHeapSize;
      }
    }

    this.snapshots.push(snapshot);
    return snapshot;
  }

  // 检测内存泄漏
  detectLeak(checkInterval: number = 60000): { hasLeak: boolean; growthRate: number } {
    if (this.snapshots.length < 2) {
      return { hasLeak: false, growthRate: 0 };
    }

    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    const timeDiff = (last.timestamp - first.timestamp) / 1000; // seconds

    if (timeDiff === 0) return { hasLeak: false, growthRate: 0 };

    const growthRate = (last.used - first.used) / timeDiff; // bytes per second
    const hasLeak = growthRate > 1024; // 超过 1KB/s 认为可能有泄漏

    return { hasLeak, growthRate };
  }

  // 生成内存报告
  generateReport(): string {
    const leak = this.detectLeak();
    const latest = this.snapshots[this.snapshots.length - 1];

    return `
内存分析报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
快照数: ${this.snapshots.length}
最新使用: ${latest ? (latest.used / 1048576).toFixed(2) + ' MB' : 'N/A'}

泄漏检测:
  状态: ${leak.hasLeak ? '⚠️ 可能存在泄漏' : '✅ 正常'}
  增长率: ${leak.growthRate.toFixed(2)} bytes/s
    `.trim();
  }
}

// ============================================================================
// 3. 代码剖析 (Profiling)
// ============================================================================

export interface FunctionProfile {
  name: string;
  callCount: number;
  totalTime: number;
  avgTime: number;
  maxTime: number;
  minTime: number;
}

export class CodeProfiler {
  private profiles = new Map<string, FunctionProfile>();
  private activeTimers = new Map<string, number>();

  // 开始计时
  start(name: string): void {
    this.activeTimers.set(name, performance.now());
  }

  // 结束计时
  end(name: string): void {
    const startTime = this.activeTimers.get(name);
    if (startTime === undefined) return;

    const duration = performance.now() - startTime;
    this.activeTimers.delete(name);

    let profile = this.profiles.get(name);
    if (!profile) {
      profile = {
        name,
        callCount: 0,
        totalTime: 0,
        avgTime: 0,
        maxTime: 0,
        minTime: Infinity
      };
      this.profiles.set(name, profile);
    }

    profile.callCount++;
    profile.totalTime += duration;
    profile.avgTime = profile.totalTime / profile.callCount;
    profile.maxTime = Math.max(profile.maxTime, duration);
    profile.minTime = Math.min(profile.minTime, duration);
  }

  // 包装函数进行剖析
  profile<T extends (...args: any[]) => any>(
    name: string,
    fn: T
  ): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
      this.start(name);
      try {
        return fn(...args);
      } finally {
        this.end(name);
      }
    }) as T;
  }

  // 获取热点函数
  getHotspots(limit: number = 5): FunctionProfile[] {
    return Array.from(this.profiles.values())
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, limit);
  }

  generateReport(): string {
    const hotspots = this.getHotspots();
    
    let report = '代码剖析报告\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n热点函数:\n';
    
    hotspots.forEach((p, i) => {
      report += `  ${i + 1}. ${p.name}\n`;
      report += `     调用: ${p.callCount}次, 平均: ${p.avgTime.toFixed(2)}ms, 总计: ${p.totalTime.toFixed(2)}ms\n`;
    });

    return report;
  }
}

// ============================================================================
// 4. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 性能分析与监控 ===\n');

  // 性能监控示例
  console.log('--- 性能监控 ---');
  const monitor = new PerformanceMonitor();
  monitor.start();

  // 测量函数执行
  monitor.measure('heavy computation', () => {
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += i;
    }
    return sum;
  });

  console.log(monitor.generateReport());

  // 内存分析示例
  console.log('\n--- 内存分析 ---');
  const memProfiler = new MemoryProfiler();
  
  memProfiler.takeSnapshot();
  
  // 模拟内存分配
  const arr: number[] = [];
  for (let i = 0; i < 10000; i++) {
    arr.push(i);
  }
  
  memProfiler.takeSnapshot();
  console.log(memProfiler.generateReport());

  // 代码剖析示例
  console.log('\n--- 代码剖析 ---');
  const profiler = new CodeProfiler();

  const fibonacci = profiler.profile('fibonacci', (n: number): number => {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  });

  fibonacci(20);
  fibonacci(20);
  fibonacci(20);

  console.log(profiler.generateReport());

  // 清理
  monitor.stop();

  console.log('\n性能监控要点:');
  console.log('1. 关注核心 Web 指标 (FCP, LCP, CLS)');
  console.log('2. 定期检查内存泄漏');
  console.log('3. 使用代码剖析找到性能瓶颈');
  console.log('4. 监控长任务避免阻塞主线程');
}

// ============================================================================
// 导出
// ============================================================================

;

;
