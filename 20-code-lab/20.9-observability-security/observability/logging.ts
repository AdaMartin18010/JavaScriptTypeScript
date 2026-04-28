/**
 * @file 结构化日志系统
 * @category Observability → Logging
 * @difficulty hard
 * @tags observability, logging, structured-logging, log-aggregation
 *
 * @description
 * 高性能结构化日志系统，支持多种输出格式和日志聚合。
 *
 * 日志级别（RFC 5424）：
 * - DEBUG (7): 调试信息
 * - INFO (6): 一般信息
 * - NOTICE (5): 重要但正常的事件
 * - WARN (4): 警告
 * - ERROR (3): 错误
 * - CRITICAL (2): 严重错误
 * - ALERT (1): 需要立即处理
 * - EMERGENCY (0): 系统不可用
 *
 * 结构化字段：
 * - timestamp: ISO 8601 格式
 * - level: 日志级别
 * - message: 消息内容
 * - service: 服务名称
 * - trace_id: 追踪 ID
 * - span_id: Span ID
 * - source: 源代码位置
 * - context: 上下文数据
 */

export enum LogLevel {
  DEBUG = 7,
  INFO = 6,
  NOTICE = 5,
  WARN = 4,
  ERROR = 3,
  CRITICAL = 2,
  ALERT = 1,
  EMERGENCY = 0
}

export const LogLevelNames: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.NOTICE]: 'NOTICE',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.CRITICAL]: 'CRITICAL',
  [LogLevel.ALERT]: 'ALERT',
  [LogLevel.EMERGENCY]: 'EMERGENCY'
};

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  message: string;
  service?: string;
  traceId?: string;
  spanId?: string;
  source?: {
    file?: string;
    line?: number;
    function?: string;
  };
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export type LogFormatter = (entry: LogEntry) => string;
export type LogTransport = (entry: LogEntry) => void;

// ==================== 格式化器 ====================

export class Formatters {
  /**
   * JSON 格式
   */
  static json(): LogFormatter {
    return (entry: LogEntry) => JSON.stringify(entry);
  }

  /**
   * 简洁文本格式
   */
  static simple(): LogFormatter {
    return (entry: LogEntry) => {
      const time = entry.timestamp.split('T')[1].split('.')[0];
      return `[${time}] ${entry.levelName}: ${entry.message}`;
    };
  }

  /**
   * 详细文本格式
   */
  static detailed(): LogFormatter {
    return (entry: LogEntry) => {
      const parts = [
        entry.timestamp,
        `[${entry.levelName}]`,
        entry.service ? `{${entry.service}}` : '',
        entry.message
      ];

      if (entry.traceId) {
        parts.push(`trace=${entry.traceId}`);
      }

      if (entry.context && Object.keys(entry.context).length > 0) {
        parts.push(JSON.stringify(entry.context));
      }

      if (entry.error) {
        parts.push(`\n${entry.error.stack || `${entry.error.name}: ${entry.error.message}`}`);
      }

      return parts.filter(Boolean).join(' ');
    };
  }

  /**
   * Logfmt 格式 (key=value 格式)
   */
  static logfmt(): LogFormatter {
    return (entry: LogEntry) => {
      const fields: Record<string, string> = {
        ts: entry.timestamp,
        level: entry.levelName,
        msg: entry.message
      };

      if (entry.service) fields.service = entry.service;
      if (entry.traceId) fields.trace_id = entry.traceId;

      return Object.entries(fields)
        .map(([k, v]) => `${k}="${v.replace(/"/g, '\\"')}"`)
        .join(' ');
    };
  }
}

// ==================== 传输器 ====================

export class Transports {
  /**
   * 控制台传输
   */
  static console(formatter: LogFormatter = Formatters.simple()): LogTransport {
    return (entry: LogEntry) => {
      const output = formatter(entry);

      switch (entry.level) {
        case LogLevel.ERROR:
        case LogLevel.CRITICAL:
        case LogLevel.ALERT:
        case LogLevel.EMERGENCY:
          console.error(output);
          break;
        case LogLevel.WARN:
          console.warn(output);
          break;
        case LogLevel.DEBUG:
          console.debug(output);
          break;
        default:
          console.log(output);
      }
    };
  }

  /**
   * 内存传输（用于测试）
   */
  static memory(buffer: LogEntry[]): LogTransport {
    return (entry: LogEntry) => {
      buffer.push({ ...entry });
    };
  }

  /**
   * 批量传输
   */
  static batch(
    transport: LogTransport,
    options: { maxSize?: number; flushIntervalMs?: number } = {}
  ): LogTransport {
    const { maxSize = 100, flushIntervalMs = 1000 } = options;
    const buffer: LogEntry[] = [];

    const flush = () => {
      if (buffer.length === 0) return;
      
      // 批量发送
      for (const entry of buffer) {
        transport(entry);
      }
      buffer.length = 0;
    };

    // 定时刷新
    setInterval(flush, flushIntervalMs);

    return (entry: LogEntry) => {
      buffer.push(entry);
      
      if (buffer.length >= maxSize) {
        flush();
      }
    };
  }

  /**
   * 过滤传输
   */
  static filter(
    transport: LogTransport,
    predicate: (entry: LogEntry) => boolean
  ): LogTransport {
    return (entry: LogEntry) => {
      if (predicate(entry)) {
        transport(entry);
      }
    };
  }

  /**
   * 多路传输
   */
  static multi(...transports: LogTransport[]): LogTransport {
    return (entry: LogEntry) => {
      for (const transport of transports) {
        transport(entry);
      }
    };
  }
}

// ==================== 日志记录器 ====================

export interface LoggerConfig {
  level: LogLevel;
  service?: string;
  transport: LogTransport;
  defaultContext?: Record<string, unknown>;
}

export class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: config.level ?? LogLevel.INFO,
      service: config.service,
      transport: config.transport ?? Transports.console(),
      defaultContext: config.defaultContext ?? {}
    };
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (level > this.config.level) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LogLevelNames[level],
      message,
      service: this.config.service,
      context: { ...this.config.defaultContext, ...context }
    };

    this.config.transport(entry);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  notice(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.NOTICE, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const errorContext: Record<string, unknown> = { ...context };
    
    if (error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    this.log(LogLevel.ERROR, message, errorContext);
  }

  critical(message: string, error?: Error, context?: Record<string, unknown>): void {
    const errorContext: Record<string, unknown> = { ...context };
    
    if (error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    this.log(LogLevel.CRITICAL, message, errorContext);
  }

  /**
   * 创建子日志记录器（继承配置）
   */
  child(additionalContext: Record<string, unknown>): Logger {
    return new Logger({
      ...this.config,
      defaultContext: { ...this.config.defaultContext, ...additionalContext }
    });
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * 获取当前日志级别
   */
  getLevel(): LogLevel {
    return this.config.level;
  }
}

// ==================== 日志轮转 ====================

export interface LogRotationOptions {
  maxSizeBytes: number;
  maxFiles: number;
  compress: boolean;
}

export class LogRotator {
  private currentSize = 0;
  private currentFile = 0;
  private files: string[] = [];

  constructor(
    private basePath: string,
    private options: LogRotationOptions
  ) {}

  write(data: string): void {
    const dataSize = Buffer.byteLength(data, 'utf-8');

    if (this.currentSize + dataSize > this.options.maxSizeBytes) {
      this.rotate();
    }

    this.currentSize += dataSize;
    // 实际实现中写入文件
  }

  private rotate(): void {
    this.currentFile++;
    this.currentSize = 0;

    // 清理旧文件
    while (this.files.length >= this.options.maxFiles) {
      const oldFile = this.files.shift();
      // 删除旧文件
    }

    this.files.push(`${this.basePath}.${this.currentFile}`);
  }
}

// ==================== 日志聚合器 ====================

export class LogAggregator {
  private patterns = new Map<string, RegExp>();
  private counters = new Map<string, number>();
  private timeWindows = new Map<string, number>();

  constructor(private windowSizeMs = 60000) {}

  /**
   * 注册模式用于聚合
   */
  registerPattern(name: string, pattern: RegExp): void {
    this.patterns.set(name, pattern);
  }

  /**
   * 处理日志条目
   */
  process(entry: LogEntry): void {
    const now = Date.now();

    for (const [name, pattern] of this.patterns) {
      if (pattern.test(entry.message)) {
        const key = `${name}:${Math.floor(now / this.windowSizeMs)}`;
        this.counters.set(key, (this.counters.get(key) || 0) + 1);
      }
    }

    // 清理旧窗口
    this.cleanupOldWindows(now);
  }

  /**
   * 获取聚合统计
   */
  getStats(patternName: string): { current: number; previous: number } {
    const now = Date.now();
    const currentWindow = Math.floor(now / this.windowSizeMs);
    const previousWindow = currentWindow - 1;

    return {
      current: this.counters.get(`${patternName}:${currentWindow}`) || 0,
      previous: this.counters.get(`${patternName}:${previousWindow}`) || 0
    };
  }

  private cleanupOldWindows(now: number): void {
    const cutoff = Math.floor(now / this.windowSizeMs) - 2;

    for (const key of this.counters.keys()) {
      const window = parseInt(key.split(':')[1]);
      if (window < cutoff) {
        this.counters.delete(key);
      }
    }
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 结构化日志系统 ===\n');

  // 基本日志记录
  console.log('--- 基本日志记录 ---');
  const logger = new Logger({
    level: LogLevel.DEBUG,
    service: 'demo-service',
    transport: Transports.console(Formatters.simple())
  });

  logger.debug('This is a debug message');
  logger.info('Application started', { version: '1.0.0', port: 8080 });
  logger.warn('High memory usage', { used: '85%', threshold: '80%' });
  logger.error('Database connection failed', new Error('ECONNREFUSED'));

  // JSON 格式
  console.log('\n--- JSON 格式 ---');
  const jsonLogger = new Logger({
    level: LogLevel.INFO,
    transport: Transports.console(Formatters.json())
  });

  jsonLogger.info('User logged in', { userId: '12345', ip: '192.168.1.1' });

  // Logfmt 格式
  console.log('\n--- Logfmt 格式 ---');
  const logfmtLogger = new Logger({
    level: LogLevel.INFO,
    service: 'api-gateway',
    transport: Transports.console(Formatters.logfmt())
  });

  logfmtLogger.info('Request processed', { method: 'GET', path: '/api/users', duration: '45ms' });

  // 子日志记录器
  console.log('\n--- 子日志记录器 ---');
  const requestLogger = logger.child({ requestId: 'req-abc-123' });
  requestLogger.info('Processing request');
  requestLogger.info('Query executed', { sql: 'SELECT * FROM users', rows: 10 });

  // 过滤传输
  console.log('\n--- 过滤传输（只记录 ERROR 及以上）---');
  const errorOnlyLogger = new Logger({
    level: LogLevel.ERROR,
    transport: Transports.filter(
      Transports.console(Formatters.simple()),
      (entry) => entry.level <= LogLevel.ERROR
    )
  });

  errorOnlyLogger.info('This should not appear');
  errorOnlyLogger.error('This is an error');

  // 多路传输
  console.log('\n--- 多路传输（同时输出到多个目标）---');
  const memoryBuffer: LogEntry[] = [];
  const multiLogger = new Logger({
    level: LogLevel.INFO,
    transport: Transports.multi(
      Transports.console(Formatters.simple()),
      Transports.memory(memoryBuffer)
    )
  });

  multiLogger.info('Message to both transports');
  console.log('Memory buffer length:', memoryBuffer.length);

  // 日志聚合
  console.log('\n--- 日志聚合 ---');
  const aggregator = new LogAggregator(60000);
  
  aggregator.registerPattern('error_rate', /error/i);
  aggregator.registerPattern('slow_query', /slow query/i);

  // 模拟日志处理
  for (let i = 0; i < 10; i++) {
    aggregator.process({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      levelName: 'ERROR',
      message: 'Database error occurred'
    });
  }

  const errorStats = aggregator.getStats('error_rate');
  console.log('Error rate stats:', errorStats);
}
