/**
 * @file 分布式追踪实现
 * @category Observability → Tracing
 * @difficulty hard
 * @tags observability, distributed-tracing, opentelemetry, jaeger, zipkin
 *
 * @description
 * 分布式追踪实现，支持 OpenTelemetry 风格的 Span 和 Trace 管理。
 *
 * 核心概念：
 * - Trace: 一次完整的分布式调用链，由多个 Span 组成
 * - Span: 追踪的基本单元，表示一个操作（如 HTTP 请求、数据库查询）
 * - SpanContext: 用于跨服务传播的追踪上下文（traceId, spanId, flags）
 * - Baggage: 跨 Span 传播的键值对数据
 *
 * 传播协议：
 * - W3C Trace Context: traceparent, tracestate 头
 * - Jaeger: uber-trace-id 头
 * - B3: X-B3-TraceId, X-B3-SpanId 等头
 */

export interface SpanContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  traceFlags: number; // 0x00 = not sampled, 0x01 = sampled
  traceState?: string;
}

export type SpanAttributes = Record<string, string | number | boolean | (string | number | boolean)[]>;

export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: SpanAttributes;
}

export interface SpanLink {
  context: SpanContext;
  attributes?: SpanAttributes;
}

export enum SpanStatusCode {
  UNSET = 0,
  OK = 1,
  ERROR = 2
}

export interface SpanStatus {
  code: SpanStatusCode;
  message?: string;
}

export enum SpanKind {
  INTERNAL = 0,
  SERVER = 1,
  CLIENT = 2,
  PRODUCER = 3,
  CONSUMER = 4
}

export interface Span {
  context: SpanContext;
  name: string;
  kind: SpanKind;
  startTime: number;
  endTime?: number;
  attributes: SpanAttributes;
  events: SpanEvent[];
  links: SpanLink[];
  status: SpanStatus;
  parentContext?: SpanContext;
}

export interface Trace {
  traceId: string;
  spans: Span[];
}

// ==================== Span 构建器 ====================

export class SpanBuilder {
  private attributes: SpanAttributes = {};
  private events: SpanEvent[] = [];
  private links: SpanLink[] = [];
  private status: SpanStatus = { code: SpanStatusCode.UNSET };
  private parentContext?: SpanContext;

  constructor(
    private name: string,
    private kind: SpanKind = SpanKind.INTERNAL,
    private traceId?: string,
    private spanId?: string
  ) {}

  setParent(parentContext: SpanContext): this {
    this.parentContext = parentContext;
    return this;
  }

  setAttribute(key: string, value: SpanAttributes[string]): this {
    this.attributes[key] = value;
    return this;
  }

  setAttributes(attrs: SpanAttributes): this {
    Object.assign(this.attributes, attrs);
    return this;
  }

  addEvent(name: string, attributes?: SpanAttributes): this {
    this.events.push({
      name,
      timestamp: performance.now(),
      attributes
    });
    return this;
  }

  addLink(context: SpanContext, attributes?: SpanAttributes): this {
    this.links.push({ context, attributes });
    return this;
  }

  setStatus(code: SpanStatusCode, message?: string): this {
    this.status = { code, message };
    return this;
  }

  start(): Span {
    const traceId = this.traceId || this.generateId(16);
    const spanId = this.spanId || this.generateId(8);

    return {
      context: {
        traceId,
        spanId,
        parentSpanId: this.parentContext?.spanId,
        traceFlags: this.parentContext?.traceFlags ?? 0x01
      },
      name: this.name,
      kind: this.kind,
      startTime: performance.now(),
      attributes: { ...this.attributes },
      events: [...this.events],
      links: [...this.links],
      status: { ...this.status },
      parentContext: this.parentContext
    };
  }

  private generateId(bytes: number): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

// ==================== Tracer 提供者 ====================

export class Tracer {
  private activeSpans = new Map<string, Span>();
  private completedSpans: Span[] = [];
  private spanProcessors: ((span: Span) => void)[] = [];

  constructor(private name: string) {}

  addSpanProcessor(processor: (span: Span) => void): void {
    this.spanProcessors.push(processor);
  }

  startSpan(
    name: string,
    options: {
      kind?: SpanKind;
      parentContext?: SpanContext;
      attributes?: SpanAttributes;
      links?: SpanLink[];
    } = {}
  ): Span {
    const builder = new SpanBuilder(
      name,
      options.kind ?? SpanKind.INTERNAL,
      options.parentContext?.traceId
    );

    if (options.parentContext) {
      builder.setParent(options.parentContext);
    }

    if (options.attributes) {
      builder.setAttributes(options.attributes);
    }

    if (options.links) {
      for (const link of options.links) {
        builder.addLink(link.context, link.attributes);
      }
    }

    const span = builder.start();
    this.activeSpans.set(span.context.spanId, span);

    return span;
  }

  endSpan(spanId: string, endTime = performance.now()): void {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    span.endTime = endTime;
    this.activeSpans.delete(spanId);
    this.completedSpans.push(span);

    // 通知处理器
    for (const processor of this.spanProcessors) {
      processor(span);
    }
  }

  recordException(spanId: string, error: Error): void {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    span.events.push({
      name: 'exception',
      timestamp: performance.now(),
      attributes: {
        'exception.type': error.name,
        'exception.message': error.message,
        'exception.stacktrace': error.stack || ''
      }
    });

    span.status = {
      code: SpanStatusCode.ERROR,
      message: error.message
    };
  }

  getActiveSpan(spanId: string): Span | undefined {
    return this.activeSpans.get(spanId);
  }

  getTrace(traceId: string): Span[] {
    return this.completedSpans.filter(s => s.context.traceId === traceId);
  }

  getCompletedSpans(): Span[] {
    return [...this.completedSpans];
  }

  clear(): void {
    this.activeSpans.clear();
    this.completedSpans = [];
  }
}

// ==================== 上下文传播 ====================

export class TraceContextPropagator {
  /**
   * 注入 SpanContext 到载体（如 HTTP headers）
   * 遵循 W3C Trace Context 规范
   */
  inject(context: SpanContext, carrier: Record<string, string>): void {
    // traceparent: 00-<traceId>-<spanId>-<flags>
    carrier.traceparent = `00-${context.traceId}-${context.spanId}-${context.traceFlags.toString(16).padStart(2, '0')}`;
    
    if (context.traceState) {
      carrier.tracestate = context.traceState;
    }
  }

  /**
   * 从载体提取 SpanContext
   */
  extract(carrier: Record<string, string>): SpanContext | null {
    const traceparent = carrier.traceparent;
    if (!traceparent) return null;

    const parts = traceparent.split('-');
    if (parts.length !== 4) return null;

    const [, traceId, spanId, flags] = parts;
    return {
      traceId,
      spanId,
      traceFlags: parseInt(flags, 16) || 0x00,
      traceState: carrier.tracestate
    };
  }
}

// ==================== Baggage 传播 ====================

export class Baggage {
  private entries = new Map<string, { value: string; metadata?: string }>();

  setEntry(key: string, value: string, metadata?: string): this {
    this.entries.set(key, { value, metadata });
    return this;
  }

  getEntry(key: string): { value: string; metadata?: string } | undefined {
    return this.entries.get(key);
  }

  removeEntry(key: string): this {
    this.entries.delete(key);
    return this;
  }

  getAllEntries(): [string, { value: string; metadata?: string }][] {
    return Array.from(this.entries.entries());
  }

  /**
   * 序列化为 HTTP header 格式
   */
  toString(): string {
    return Array.from(this.entries.entries())
      .map(([key, entry]) => {
        const encodedValue = encodeURIComponent(entry.value);
        return entry.metadata 
          ? `${key}=${encodedValue};${entry.metadata}`
          : `${key}=${encodedValue}`;
      })
      .join(',');
  }

  /**
   * 从 HTTP header 解析
   */
  static fromString(header: string): Baggage {
    const baggage = new Baggage();
    
    if (!header) return baggage;

    const entries = header.split(',');
    for (const entry of entries) {
      const [keyValue, ...metadataParts] = entry.split(';');
      const [key, value] = keyValue.split('=');
      
      if (key && value) {
        baggage.setEntry(
          key.trim(),
          decodeURIComponent(value.trim()),
          metadataParts.join(';').trim() || undefined
        );
      }
    }

    return baggage;
  }
}

// ==================== 采样器 ====================

export interface Sampler {
  shouldSample(traceId: string): boolean;
}

export class AlwaysOnSampler implements Sampler {
  shouldSample(): boolean {
    return true;
  }
}

export class AlwaysOffSampler implements Sampler {
  shouldSample(): boolean {
    return false;
  }
}

export class ProbabilitySampler implements Sampler {
  constructor(private probability: number) {
    this.probability = Math.max(0, Math.min(1, probability));
  }

  shouldSample(): boolean {
    return Math.random() < this.probability;
  }
}

export class ParentBasedSampler implements Sampler {
  constructor(
    private rootSampler: Sampler,
    private remoteParentSampled: Sampler = new AlwaysOnSampler(),
    private remoteParentNotSampled: Sampler = new AlwaysOffSampler(),
    private localParentSampled: Sampler = new AlwaysOnSampler(),
    private localParentNotSampled: Sampler = new AlwaysOffSampler()
  ) {}

  shouldSample(traceId: string, parentContext?: SpanContext): boolean {
    if (!parentContext) {
      return this.rootSampler.shouldSample(traceId);
    }

    const isSampled = (parentContext.traceFlags & 0x01) === 0x01;
    // 简化处理：假设都是远程父节点
    return isSampled 
      ? this.remoteParentSampled.shouldSample(traceId)
      : this.remoteParentNotSampled.shouldSample(traceId);
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 分布式追踪 ===\n');

  // 创建 Tracer
  const tracer = new Tracer('demo-service');
  
  // 添加处理器来打印完成的 Span
  tracer.addSpanProcessor((span) => {
    const duration = span.endTime! - span.startTime;
    console.log(`  [Span] ${span.name} | ${duration.toFixed(2)}ms | ${SpanStatusCode[span.status.code]}`);
  });

  // 模拟一个分布式调用链
  console.log('--- 模拟 API 调用链 ---');
  
  // 1. 接收外部请求（SERVER Span）
  const serverSpan = tracer.startSpan('GET /api/users', {
    kind: SpanKind.SERVER,
    attributes: {
      'http.method': 'GET',
      'http.route': '/api/users',
      'http.target': '/api/users?page=1'
    }
  });

  // 2. 查询数据库（CLIENT Span）
  const dbSpan = tracer.startSpan('SELECT users', {
    kind: SpanKind.CLIENT,
    parentContext: serverSpan.context,
    attributes: {
      'db.system': 'postgresql',
      'db.statement': 'SELECT * FROM users LIMIT 10'
    }
  });

  // 模拟数据库操作
  setTimeout(() => {
    tracer.endSpan(dbSpan.context.spanId);

    // 3. 调用下游服务（CLIENT Span）
    const httpSpan = tracer.startSpan('GET /auth/validate', {
      kind: SpanKind.CLIENT,
      parentContext: serverSpan.context,
      attributes: {
        'http.method': 'GET',
        'http.url': 'http://auth-service/validate'
      }
    });

    setTimeout(() => {
      tracer.endSpan(httpSpan.context.spanId);
      tracer.endSpan(serverSpan.context.spanId);

      // 打印追踪结果
      console.log('\n--- 追踪结果 ---');
      const trace = tracer.getTrace(serverSpan.context.traceId);
      console.log(`Trace ID: ${serverSpan.context.traceId}`);
      console.log(`Span 数量: ${trace.length}`);
      
      for (const span of trace) {
        const depth = span.parentContext ? 1 : 0;
        const indent = '  '.repeat(depth);
        console.log(`${indent}├── ${span.name} (${SpanKind[span.kind]})`);
      }
    }, 20);
  }, 50);

  // 上下文传播演示
  console.log('\n--- W3C Trace Context 传播 ---');
  const propagator = new TraceContextPropagator();
  const headers: Record<string, string> = {};
  
  propagator.inject(serverSpan.context, headers);
  console.log('注入的 Headers:', JSON.stringify(headers));
  
  const extracted = propagator.extract(headers);
  console.log('提取的 Context:', extracted);

  // Baggage 演示
  console.log('\n--- Baggage 传播 ---');
  const baggage = new Baggage()
    .setEntry('user.id', '12345')
    .setEntry('tenant.id', 'acme-corp');
  
  const baggageHeader = baggage.toString();
  console.log('Baggage Header:', baggageHeader);
  
  const parsedBaggage = Baggage.fromString(baggageHeader);
  console.log('解析结果:', parsedBaggage.getAllEntries());

  // 采样器演示
  console.log('\n--- 采样策略 ---');
  const samplers: { name: string; sampler: Sampler }[] = [
    { name: 'AlwaysOn', sampler: new AlwaysOnSampler() },
    { name: 'AlwaysOff', sampler: new AlwaysOffSampler() },
    { name: '30%概率', sampler: new ProbabilitySampler(0.3) }
  ];

  for (const { name, sampler } of samplers) {
    const samples = Array.from({ length: 100 }, () => sampler.shouldSample('test'));
    const sampledCount = samples.filter(s => s).length;
    console.log(`  ${name}: ${sampledCount}/100 采样`);
  }
}
