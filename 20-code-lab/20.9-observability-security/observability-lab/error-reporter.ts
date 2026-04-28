/**
 * @file 错误上报 SDK
 * @category Observability → Error Reporting
 * @difficulty medium
 * @tags error-reporting, source-map, sampling, offline-queue
 */

export interface ErrorReport {
  id: string;
  type: string;
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  url: string;
  userAgent?: string;
  extra?: Record<string, unknown>;
}

export interface ErrorReporterOptions {
  /** 上报目标 URL */
  endpoint: string;
  /** 采样率 0-1，默认 1.0（全量） */
  sampleRate?: number;
  /** 环境标识 */
  environment?: string;
  /** 版本号 */
  release?: string;
  /** 最大队列长度 */
  maxQueueSize?: number;
  /** 自定义上报函数（用于测试或自定义传输） */
  transport?: (reports: ErrorReport[]) => Promise<void> | void;
  /** 去重窗口毫秒，默认 5000 */
  dedupWindowMs?: number;
  /** 全局附加数据 */
  globalContext?: Record<string, unknown>;
}

/**
 * 简易错误上报 SDK，支持全局错误捕获、采样率控制、离线队列与去重
 */
export class ErrorReporter {
  private endpoint: string;
  private sampleRate: number;
  private environment: string;
  private release: string;
  private maxQueueSize: number;
  private transport: (reports: ErrorReport[]) => Promise<void> | void;
  private dedupWindowMs: number;
  private globalContext: Record<string, unknown>;

  private queue: ErrorReport[] = [];
  private seenErrors = new Map<string, number>(); // fingerprint -> timestamp
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isOnline = true;

  constructor(options: ErrorReporterOptions) {
    this.endpoint = options.endpoint;
    this.sampleRate = options.sampleRate ?? 1.0;
    this.environment = options.environment ?? 'production';
    this.release = options.release ?? 'unknown';
    this.maxQueueSize = options.maxQueueSize ?? 50;
    this.transport = options.transport ?? this.defaultTransport.bind(this);
    this.dedupWindowMs = options.dedupWindowMs ?? 5000;
    this.globalContext = { ...options.globalContext };

    this.startAutoFlush();
    this.bindOnlineOffline();
  }

  /**
   * 生成错误指纹用于去重
   */
  private fingerprint(report: ErrorReport): string {
    return `${report.type}:${report.message}:${report.filename}:${report.lineno}`.slice(0, 200);
  }

  /**
   * 默认传输：使用 sendBeacon（浏览器）或 fetch
   */
  private async defaultTransport(reports: ErrorReport[]): Promise<void> {
    const payload = JSON.stringify({ reports, env: this.environment, release: this.release });

    // 浏览器环境优先使用 sendBeacon（页面关闭时仍可发送）
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([payload], { type: 'application/json' });
      const sent = navigator.sendBeacon(this.endpoint, blob);
      if (sent) return;
    }

    // 降级到 fetch
    if (typeof fetch !== 'undefined') {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      });
    }
  }

  /**
   * 绑定网络状态监听（浏览器环境）
   */
  private bindOnlineOffline(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flush().catch(() => {});
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  /**
   * 启动自动刷新定时器
   */
  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0 && this.isOnline) {
        this.flush().catch(() => {});
      }
    }, 30000);
  }

  /**
   * 上报一个错误
   */
  captureError(error: Error, extra?: Record<string, unknown>): string | null {
    // 采样
    if (Math.random() > this.sampleRate) return null;

    const report = this.buildReport(error, extra);
    const fp = this.fingerprint(report);

    // 去重：相同错误在窗口期内只上报一次
    const now = Date.now();
    const lastSeen = this.seenErrors.get(fp);
    if (lastSeen && now - lastSeen < this.dedupWindowMs) {
      return null;
    }
    this.seenErrors.set(fp, now);

    // 清理过期指纹
    for (const [key, ts] of this.seenErrors) {
      if (now - ts > this.dedupWindowMs * 2) {
        this.seenErrors.delete(key);
      }
    }

    this.enqueue(report);
    return report.id;
  }

  /**
   * 手动上报一个异常对象（兼容 window.onerror 参数格式）
   */
  captureException(
    message: string,
    filename?: string,
    lineno?: number,
    colno?: number,
    error?: Error,
    extra?: Record<string, unknown>
  ): string | null {
    const err = error ?? new Error(message);
    const report = this.buildReport(err, {
      ...extra,
      filename,
      lineno,
      colno
    });

    if (Math.random() > this.sampleRate) return null;
    this.enqueue(report);
    return report.id;
  }

  private buildReport(error: Error, extra?: Record<string, unknown>): ErrorReport {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: typeof location !== 'undefined' ? location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      extra: { ...this.globalContext, ...extra }
    };
  }

  private enqueue(report: ErrorReport): void {
    this.queue.push(report);
    if (this.queue.length > this.maxQueueSize) {
      this.queue.shift(); // 丢弃最旧的
    }
  }

  /**
   * 立即刷新队列
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, this.queue.length);
    try {
      await this.transport(batch);
    } catch {
      // 上报失败，放回队列（保留一半避免无限膨胀）
      const restoreCount = Math.min(batch.length, Math.floor(this.maxQueueSize / 2));
      this.queue.unshift(...batch.slice(0, restoreCount));
    }
  }

  /**
   * 获取队列长度
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * 安装全局错误处理器（浏览器环境）
   */
  installGlobalHandlers(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.captureException(
        event.message,
        event.filename,
        event.lineno,
        event.colno,
        event.error as Error
      );
    });

    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      this.captureError(error, { type: 'unhandledrejection' });
    });
  }

  /**
   * 销毁上报器，清理资源
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

/**
 * 简易 Source Map 解析器接口（实际生产环境需使用 source-map 库）
 */
export interface SourceMapPosition {
  source: string;
  line: number;
  column: number;
  name?: string;
}

/**
 * 解析堆栈中的原始位置（占位实现，实际需加载 .map 文件）
 */
export async function resolveSourceMap(
  _stack: string,
  _mapUrl?: string
): Promise<SourceMapPosition | null> {
  // 生产环境应集成 mozilla/source-map 库
  // const { SourceMapConsumer } = await import('source-map');
  return null;
}

// ============================================================================
// Demo
// ============================================================================

export function demo(): void {
  console.log('=== 错误上报 SDK 演示 ===\n');

  const logs: ErrorReport[] = [];
  const reporter = new ErrorReporter({
    endpoint: 'https://logs.example.com/errors',
    sampleRate: 1.0,
    environment: 'demo',
    release: '1.0.0',
    transport: (reports) => {
      logs.push(...reports);
    }
  });

  // 1. 捕获错误
  console.log('--- 1. 捕获异常 ---');
  const err = new Error('演示异常');
  const id = reporter.captureError(err, { module: 'demo' });
  console.log('上报 ID:', id);

  // 2. 手动捕获
  console.log('\n--- 2. 手动捕获 window.onerror 格式 ---');
  reporter.captureException('Script error', 'app.js', 10, 5);

  // 3. 刷新队列
  console.log('\n--- 3. 刷新队列 ---');
  reporter.flush().then(() => {
    console.log('已上报错误数:', logs.length);
    reporter.destroy();
  });

  console.log('\n=== 演示结束 ===\n');
}
