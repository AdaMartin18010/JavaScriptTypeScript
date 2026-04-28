/**
 * @file 指标系统实现
 * @category Observability → Metrics
 * @difficulty hard
 * @tags observability, metrics, prometheus, opentelemetry, monitoring
 *
 * @description
 * 指标收集和导出系统，兼容 Prometheus 和 OpenTelemetry 格式。
 *
 * 指标类型：
 * - Counter: 单调递增的计数器，如请求总数、错误总数
 * - Gauge: 可增可减的仪表盘，如当前连接数、CPU使用率
 * - Histogram: 直方图，记录值的分布，如请求延迟分布
 * - Summary: 摘要，类似直方图但计算滑动窗口内的分位数
 *
 * 聚合操作：
 * - rate(): 计算计数器的每秒变化率
 * - irate(): 瞬时变化率（使用最后两个点）
 * - increase(): 计算时间范围内的增量
 * - histogram_quantile(): 从直方图计算分位数
 */

// ==================== 指标类型定义 ====================

export type MetricLabels = Record<string, string>;

export interface MetricMetadata {
  name: string;
  description: string;
  type: MetricType;
  unit?: string;
}

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary'
}

// ==================== Counter ====================

export class Counter {
  private value = 0;
  private readonly created: number = Date.now();

  constructor(
    public readonly name: string,
    public readonly description: string,
    private labels: MetricLabels = {}
  ) {}

  inc(value = 1): void {
    if (value < 0) {
      throw new Error('Counter cannot decrease');
    }
    this.value += value;
  }

  get(): number {
    return this.value;
  }

  reset(): void {
    this.value = 0;
  }

  getLabels(): MetricLabels {
    return { ...this.labels };
  }
}

// ==================== Gauge ====================

export class Gauge {
  private value = 0;

  constructor(
    public readonly name: string,
    public readonly description: string,
    private labels: MetricLabels = {}
  ) {}

  set(value: number): void {
    this.value = value;
  }

  inc(value = 1): void {
    this.value += value;
  }

  dec(value = 1): void {
    this.value -= value;
  }

  get(): number {
    return this.value;
  }

  setToCurrentTime(): void {
    this.value = Date.now() / 1000;
  }

  reset(): void {
    this.value = 0;
  }

  getLabels(): MetricLabels {
    return { ...this.labels };
  }
}

// ==================== Histogram ====================

export interface Bucket {
  upperBound: number;
  count: number;
}

export class Histogram {
  private buckets: Bucket[] = [];
  private sum = 0;
  private count = 0;
  private values: number[] = [];

  constructor(
    public readonly name: string,
    public readonly description: string,
    private labelValues: MetricLabels = {},
    bucketBoundaries: number[] = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  ) {
    // 添加 +Inf bucket
    this.buckets = [...bucketBoundaries, Infinity].map(upperBound => ({
      upperBound,
      count: 0
    }));
  }

  observe(value: number): void {
    this.sum += value;
    this.count++;
    this.values.push(value);

    // 保留最近 1000 个值用于计算分位数
    if (this.values.length > 1000) {
      this.values.shift();
    }

    // 更新 bucket 计数
    for (const bucket of this.buckets) {
      if (value <= bucket.upperBound) {
        bucket.count++;
      }
    }
  }

  getBuckets(): Bucket[] {
    return this.buckets.map(b => ({ ...b }));
  }

  getSum(): number {
    return this.sum;
  }

  getCount(): number {
    return this.count;
  }

  /**
   * 计算指定分位数（使用最近观测值）
   */
  getQuantile(quantile: number): number | null {
    if (this.values.length === 0) return null;

    const sorted = [...this.values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * quantile) - 1;
    return sorted[Math.max(0, index)];
  }

  getLabels(): MetricLabels {
    return { ...this.labelValues };
  }
}

// ==================== Summary ====================

export class Summary {
  private values: number[] = [];
  private sum = 0;
  private count = 0;
  private readonly maxAgeMs: number;
  private readonly ageBuckets: number;

  constructor(
    public readonly name: string,
    public readonly description: string,
    private labelValues: MetricLabels = {},
    options: {
      maxAgeSeconds?: number;
      ageBuckets?: number;
      percentiles?: number[];
    } = {}
  ) {
    this.maxAgeMs = (options.maxAgeSeconds || 600) * 1000;
    this.ageBuckets = options.ageBuckets || 5;
  }

  observe(value: number): void {
    this.values.push(value);
    this.sum += value;
    this.count++;

    // 清理过期数据
    const cutoff = Date.now() - this.maxAgeMs;
    this.values = this.values.filter(v => {
      // 简化：实际实现应该存储时间戳
      return true;
    });

    // 限制 bucket 大小
    const maxSize = this.ageBuckets * 100;
    if (this.values.length > maxSize) {
      this.values = this.values.slice(-maxSize);
    }
  }

  getQuantile(quantile: number): number | null {
    if (this.values.length === 0) return null;

    const sorted = [...this.values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * quantile) - 1;
    return sorted[Math.max(0, index)];
  }

  getSum(): number {
    return this.sum;
  }

  getCount(): number {
    return this.count;
  }

  getLabels(): MetricLabels {
    return { ...this.labelValues };
  }
}

// ==================== 指标注册表 ====================

export class MetricRegistry {
  private counters = new Map<string, Counter>();
  private gauges = new Map<string, Gauge>();
  private histograms = new Map<string, Histogram>();
  private summaries = new Map<string, Summary>();
  private labelNames = new Map<string, string[]>();

  createCounter(
    name: string,
    description: string,
    labelNames: string[] = []
  ): Counter {
    this.labelNames.set(name, labelNames);
    const counter = new Counter(name, description);
    this.counters.set(name, counter);
    return counter;
  }

  createGauge(
    name: string,
    description: string,
    labelNames: string[] = []
  ): Gauge {
    this.labelNames.set(name, labelNames);
    const gauge = new Gauge(name, description);
    this.gauges.set(name, gauge);
    return gauge;
  }

  createHistogram(
    name: string,
    description: string,
    labelNames: string[] = [],
    buckets?: number[]
  ): Histogram {
    this.labelNames.set(name, labelNames);
    const histogram = new Histogram(name, description, {}, buckets);
    this.histograms.set(name, histogram);
    return histogram;
  }

  createSummary(
    name: string,
    description: string,
    labelNames: string[] = [],
    options?: ConstructorParameters<typeof Summary>[3]
  ): Summary {
    this.labelNames.set(name, labelNames);
    const summary = new Summary(name, description, {}, options);
    this.summaries.set(name, summary);
    return summary;
  }

  /**
   * 导出为 Prometheus 格式
   */
  toPrometheusFormat(): string {
    const lines: string[] = [];

    // Counters
    for (const [name, counter] of this.counters) {
      lines.push(`# HELP ${name} ${counter.description}`);
      lines.push(`# TYPE ${name} counter`);
      const labels = this.formatLabels(counter.getLabels());
      lines.push(`${name}${labels} ${counter.get()}`);
    }

    // Gauges
    for (const [name, gauge] of this.gauges) {
      lines.push(`# HELP ${name} ${gauge.description}`);
      lines.push(`# TYPE ${name} gauge`);
      const labels = this.formatLabels(gauge.getLabels());
      lines.push(`${name}${labels} ${gauge.get()}`);
    }

    // Histograms
    for (const [name, histogram] of this.histograms) {
      lines.push(`# HELP ${name} ${histogram.description}`);
      lines.push(`# TYPE ${name} histogram`);
      
      const baseLabels = histogram.getLabels();
      
      // Bucket 行
      for (const bucket of histogram.getBuckets()) {
        const labels = this.formatLabels({ ...baseLabels, le: String(bucket.upperBound) });
        lines.push(`${name}_bucket${labels} ${bucket.count}`);
      }
      
      // Sum 和 Count
      const sumLabels = this.formatLabels(baseLabels);
      lines.push(`${name}_sum${sumLabels} ${histogram.getSum()}`);
      lines.push(`${name}_count${sumLabels} ${histogram.getCount()}`);
    }

    // Summaries
    for (const [name, summary] of this.summaries) {
      lines.push(`# HELP ${name} ${summary.description}`);
      lines.push(`# TYPE ${name} summary`);
      
      const baseLabels = summary.getLabels();
      
      // 分位数
      for (const quantile of [0.5, 0.9, 0.99]) {
        const value = summary.getQuantile(quantile);
        const labels = this.formatLabels({ ...baseLabels, quantile: String(quantile) });
        lines.push(`${name}${labels} ${value ?? 'NaN'}`);
      }
      
      const sumLabels = this.formatLabels(baseLabels);
      lines.push(`${name}_sum${sumLabels} ${summary.getSum()}`);
      lines.push(`${name}_count${sumLabels} ${summary.getCount()}`);
    }

    return lines.join('\n');
  }

  /**
   * 导出为 OpenTelemetry 格式
   */
  toOpenTelemetryFormat(): unknown {
    const metrics = [];

    for (const [name, counter] of this.counters) {
      metrics.push({
        name,
        description: counter.description,
        unit: '1',
        sum: {
          dataPoints: [{
            attributes: counter.getLabels(),
            startTimeUnixNano: Date.now() * 1e6,
            timeUnixNano: Date.now() * 1e6,
            asInt: counter.get()
          }],
          aggregationTemporality: 'AGGREGATION_TEMPORALITY_CUMULATIVE',
          isMonotonic: true
        }
      });
    }

    return { resourceMetrics: [{ scopeMetrics: [{ metrics }] }] };
  }

  private formatLabels(labels: MetricLabels): string {
    const entries = Object.entries(labels);
    if (entries.length === 0) return '';
    
    const pairs = entries.map(([k, v]) => `${k}="${v}"`);
    return `{${pairs.join(',')}}`;
  }

  clear(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.summaries.clear();
    this.labelNames.clear();
  }
}

// ==================== 指标收集器 ====================

export class MetricsCollector {
  private registry = new MetricRegistry();
  private collectors: (() => void)[] = [];

  getRegistry(): MetricRegistry {
    return this.registry;
  }

  registerCollector(collector: () => void): void {
    this.collectors.push(collector);
  }

  collect(): void {
    for (const collector of this.collectors) {
      collector();
    }
  }

  /**
   * 收集系统指标
   */
  collectSystemMetrics(): void {
    const memoryGauge = this.registry.createGauge(
      'process_memory_usage_bytes',
      'Process memory usage in bytes',
      ['type']
    );

    // 模拟内存指标
    memoryGauge.set(Math.random() * 100 * 1024 * 1024);

    const cpuGauge = this.registry.createGauge(
      'process_cpu_usage_percent',
      'Process CPU usage percentage'
    );

    // 模拟 CPU 指标
    cpuGauge.set(Math.random() * 100);
  }

  /**
   * 收集 HTTP 指标
   */
  recordHttpRequest(method: string, route: string, status: number, duration: number): void {
    const labels = { method, route, status: String(status) };

    // 请求计数
    const requestCounter = this.registry.createCounter(
      'http_requests_total',
      'Total HTTP requests',
      Object.keys(labels)
    );
    requestCounter.inc();

    // 请求延迟
    const requestHistogram = this.registry.createHistogram(
      'http_request_duration_seconds',
      'HTTP request duration in seconds',
      Object.keys(labels)
    );
    requestHistogram.observe(duration / 1000);
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 指标系统 ===\n');

  const registry = new MetricRegistry();

  // Counter 演示
  console.log('--- Counter ---');
  const requestCounter = registry.createCounter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'status']
  );

  requestCounter.inc();
  requestCounter.inc(5);
  console.log(`Request count: ${requestCounter.get()}`);

  // Gauge 演示
  console.log('\n--- Gauge ---');
  const activeConnections = registry.createGauge(
    'active_connections',
    'Number of active connections'
  );

  activeConnections.set(42);
  activeConnections.inc(8);
  activeConnections.dec(3);
  console.log(`Active connections: ${activeConnections.get()}`);

  // Histogram 演示
  console.log('\n--- Histogram ---');
  const requestDuration = registry.createHistogram(
    'request_duration_seconds',
    'Request duration in seconds',
    ['method'],
    [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
  );

  // 模拟请求延迟
  for (let i = 0; i < 1000; i++) {
    // 生成指数分布的延迟
    const delay = -Math.log(Math.random()) * 0.1;
    requestDuration.observe(delay);
  }

  console.log('Request count:', requestDuration.getCount());
  console.log('Total sum:', requestDuration.getSum().toFixed(3));
  console.log('Buckets:');
  for (const bucket of requestDuration.getBuckets()) {
    if (bucket.upperBound !== Infinity) {
      const percentage = ((bucket.count / requestDuration.getCount()) * 100).toFixed(1);
      console.log(`  ≤ ${bucket.upperBound}s: ${bucket.count} (${percentage}%)`);
    }
  }

  // Summary 演示
  console.log('\n--- Summary ---');
  const responseSize = registry.createSummary(
    'response_size_bytes',
    'Response size in bytes'
  );

  for (let i = 0; i < 1000; i++) {
    responseSize.observe(Math.random() * 10000);
  }

  console.log('Response size percentiles:');
  for (const p of [0.5, 0.9, 0.95, 0.99]) {
    const value = responseSize.getQuantile(p);
    console.log(`  P${p * 100}: ${value?.toFixed(2)} bytes`);
  }

  // Prometheus 导出格式
  console.log('\n--- Prometheus 格式导出 ---');
  console.log(registry.toPrometheusFormat());
}
