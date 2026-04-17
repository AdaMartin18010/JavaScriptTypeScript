/**
 * @file 可观测性技术栈
 * @category Observability → Stack
 * @difficulty hard
 * @tags observability, metrics, logging, tracing, o11y
 */

// 指标系统
export interface MetricValue {
  timestamp: number;
  value: number;
  labels: Record<string, string>;
}

export class MetricsCollector {
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();
  private histograms = new Map<string, number[]>();
  private history = new Map<string, MetricValue[]>();
  
  // 计数器（单调递增）
  counter(name: string, labels: Record<string, string> = {}, value = 1): void {
    const key = this.serializeLabels(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    this.recordHistory(name, current + value, labels);
  }
  
  // 仪表盘（可增可减）
  gauge(name: string, labels: Record<string, string> = {}, value: number): void {
    const key = this.serializeLabels(name, labels);
    this.gauges.set(key, value);
    this.recordHistory(name, value, labels);
  }
  
  // 直方图（分布统计）
  histogram(name: string, labels: Record<string, string> = {}, value: number): void {
    const key = this.serializeLabels(name, labels);
    if (!this.histograms.has(key)) {
      this.histograms.set(key, []);
    }
    this.histograms.get(key)!.push(value);
    
    // 保留最近1000个样本
    const samples = this.histograms.get(key)!;
    if (samples.length > 1000) {
      samples.shift();
    }
    
    this.recordHistory(name, value, labels);
  }
  
  private serializeLabels(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return labelStr ? `${name}{${labelStr}}` : name;
  }
  
  private recordHistory(name: string, value: number, labels: Record<string, string>): void {
    if (!this.history.has(name)) {
      this.history.set(name, []);
    }
    
    this.history.get(name)!.push({
      timestamp: Date.now(),
      value,
      labels
    });
    
    // 保留最近100个数据点
    const hist = this.history.get(name)!;
    if (hist.length > 100) {
      hist.shift();
    }
  }
  
  getHistogramStats(name: string, labels: Record<string, string> = {}): {
    count: number;
    sum: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const key = this.serializeLabels(name, labels);
    const values = this.histograms.get(key);
    
    if (!values || values.length === 0) return null;
    
    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    
    return {
      count: sorted.length,
      sum,
      avg: sum / sorted.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }
  
  exportPrometheusFormat(): string {
    const lines: string[] = [];
    
    // Counters
    for (const [key, value] of this.counters) {
      lines.push(`# TYPE ${key} counter`);
      lines.push(`${key} ${value}`);
    }
    
    // Gauges
    for (const [key, value] of this.gauges) {
      lines.push(`# TYPE ${key} gauge`);
      lines.push(`${key} ${value}`);
    }
    
    return lines.join('\n');
  }
}

// 结构化日志
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  fields: Record<string, unknown>;
  traceId?: string;
  spanId?: string;
}

export class StructuredLogger {
  private level: LogLevel = LogLevel.INFO;
  private outputs: ((entry: LogEntry) => void)[] = [];
  private context: Record<string, unknown> = {};
  
  setLevel(level: LogLevel): void {
    this.level = level;
  }
  
  addOutput(handler: (entry: LogEntry) => void): void {
    this.outputs.push(handler);
  }
  
  withContext(context: Record<string, unknown>): StructuredLogger {
    const child = new StructuredLogger();
    child.level = this.level;
    child.outputs = this.outputs;
    child.context = { ...this.context, ...context };
    return child;
  }
  
  debug(message: string, fields: Record<string, unknown> = {}): void {
    this.log(LogLevel.DEBUG, message, fields);
  }
  
  info(message: string, fields: Record<string, unknown> = {}): void {
    this.log(LogLevel.INFO, message, fields);
  }
  
  warn(message: string, fields: Record<string, unknown> = {}): void {
    this.log(LogLevel.WARN, message, fields);
  }
  
  error(message: string, fields: Record<string, unknown> = {}): void {
    this.log(LogLevel.ERROR, message, fields);
  }
  
  private log(level: LogLevel, message: string, fields: Record<string, unknown>): void {
    if (level < this.level) return;
    
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      fields: { ...this.context, ...fields }
    };
    
    for (const output of this.outputs) {
      output(entry);
    }
  }
  
  // 默认JSON输出
  static jsonOutput(): (entry: LogEntry) => void {
    return (entry) => {
      console.log(JSON.stringify(entry));
    };
  }
  
  // 格式化输出
  static prettyOutput(): (entry: LogEntry) => void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
    const colors = ['\x1b[36m', '\x1b[32m', '\x1b[33m', '\x1b[31m', '\x1b[35m'];
    const reset = '\x1b[0m';
    
    return (entry) => {
      const time = new Date(entry.timestamp).toISOString();
      const levelStr = levelNames[entry.level];
      const color = colors[entry.level];
      const fields = Object.entries(entry.fields)
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(' ');
      
      console.log(`${time} ${color}${levelStr}${reset} ${entry.message} ${fields}`);
    };
  }
}

// 分布式追踪
export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  tags: Record<string, string>;
  logs: { timestamp: number; event: string; fields: Record<string, unknown> }[];
}

export class Tracer {
  private spans: Span[] = [];
  private activeSpans = new Map<string, Span>();
  
  startSpan(name: string, parentContext?: { traceId: string; spanId: string }): { traceId: string; spanId: string } {
    const traceId = parentContext?.traceId || this.generateId();
    const spanId = this.generateId();
    
    const span: Span = {
      traceId,
      spanId,
      parentSpanId: parentContext?.spanId,
      name,
      startTime: Date.now(),
      tags: {},
      logs: []
    };
    
    this.spans.push(span);
    this.activeSpans.set(spanId, span);
    
    return { traceId, spanId };
  }
  
  endSpan(spanId: string): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.endTime = Date.now();
      this.activeSpans.delete(spanId);
    }
  }
  
  addTag(spanId: string, key: string, value: string): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.tags[key] = value;
    }
  }
  
  logEvent(spanId: string, event: string, fields: Record<string, unknown> = {}): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.logs.push({
        timestamp: Date.now(),
        event,
        fields
      });
    }
  }
  
  getTrace(traceId: string): Span[] {
    return this.spans.filter(s => s.traceId === traceId);
  }
  
  getSpanDuration(spanId: string): number | null {
    const span = this.spans.find(s => s.spanId === spanId);
    if (!span?.endTime) return null;
    return span.endTime - span.startTime;
  }
  
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// 关联分析 (Correlation)
export class CorrelationEngine {
  private events = new Map<string, { timestamp: number; type: string; data: unknown }[]>();
  
  correlate(key: string, event: { timestamp: number; type: string; data: unknown }): void {
    if (!this.events.has(key)) {
      this.events.set(key, []);
    }
    this.events.get(key)!.push(event);
  }
  
  analyze(key: string): {
    timeline: { timestamp: number; type: string }[];
    patterns: string[];
  } {
    const events = this.events.get(key) || [];
    const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
    
    // 简单模式检测
    const patterns: string[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const gap = curr.timestamp - prev.timestamp;
      
      if (gap < 1000 && prev.type === 'error' && curr.type === 'retry') {
        patterns.push('快速重试模式');
      }
    }
    
    return {
      timeline: sorted.map(e => ({ timestamp: e.timestamp, type: e.type })),
      patterns: [...new Set(patterns)]
    };
  }
}

export function demo(): void {
  console.log('=== 可观测性技术栈 ===\n');
  
  // 指标
  const metrics = new MetricsCollector();
  
  metrics.counter('http_requests_total', { method: 'GET', status: '200' }, 1);
  metrics.counter('http_requests_total', { method: 'POST', status: '201' }, 1);
  metrics.gauge('active_connections', {}, 42);
  
  // 记录一些延迟数据
  for (let i = 0; i < 100; i++) {
    metrics.histogram('request_duration_ms', {}, Math.random() * 200 + 10);
  }
  
  console.log('直方图统计:');
  console.log(metrics.getHistogramStats('request_duration_ms'));
  
  // 结构化日志
  console.log('\n--- 结构化日志 ---');
  const logger = new StructuredLogger();
  logger.addOutput(StructuredLogger.prettyOutput());
  
  const requestLogger = logger.withContext({ requestId: 'req-123', userId: 'user-456' });
  requestLogger.info('处理请求开始', { endpoint: '/api/users' });
  requestLogger.info('处理请求完成', { duration: 45 });
  
  // 分布式追踪
  console.log('\n--- 分布式追踪 ---');
  const tracer = new Tracer();
  
  const root = tracer.startSpan('handle-request');
  tracer.addTag(root.spanId, 'http.method', 'GET');
  tracer.addTag(root.spanId, 'http.url', '/api/data');
  
  const child = tracer.startSpan('query-database', root);
  tracer.logEvent(child.spanId, 'db.query', { sql: 'SELECT * FROM users' });
  tracer.endSpan(child.spanId);
  
  tracer.endSpan(root.spanId);
  
  console.log('Span持续时间:', tracer.getSpanDuration(root.spanId), 'ms');
  
  // 关联分析
  console.log('\n--- 关联分析 ---');
  const correlation = new CorrelationEngine();
  
  correlation.correlate('request-1', { timestamp: Date.now(), type: 'start', data: {} });
  correlation.correlate('request-1', { timestamp: Date.now() + 50, type: 'query', data: {} });
  correlation.correlate('request-1', { timestamp: Date.now() + 100, type: 'error', data: {} });
  correlation.correlate('request-1', { timestamp: Date.now() + 150, type: 'retry', data: {} });
  
  const analysis = correlation.analyze('request-1');
  console.log('时间线:', analysis.timeline.map(t => t.type));
  console.log('检测到的模式:', analysis.patterns);
}
