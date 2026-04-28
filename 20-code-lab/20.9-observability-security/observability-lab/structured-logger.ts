/**
 * @file 生产级结构化日志器
 * @category Observability → Logging
 * @difficulty medium
 * @tags logger, structured-logging, json, pino, redact
 */

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  level: LogLevel;
  msg: string;
  time: string;
  pid?: number;
  hostname?: string;
  [key: string]: unknown;
}

export interface LoggerOptions {
  /** 最低输出级别，默认 info */
  level?: LogLevel;
  /** 基础上下文，每条日志自动混入 */
  base?: Record<string, unknown>;
  /** 需要脱敏的字段路径 */
  redact?: string[];
  /** 自定义输出目标，默认 console */
  destination?: { write: (log: string) => void };
  /** 是否美化输出（开发环境），默认 false */
  pretty?: boolean;
  /** 时间戳函数 */
  timestamp?: () => string;
}

const LEVEL_VALUES: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60
};

/**
 * 生产级结构化日志器，支持 JSON 输出、上下文注入、敏感字段脱敏
 * 输出格式兼容 pino，可直接对接 ELK / Loki 等日志系统
 */
export class StructuredLogger {
  private level: LogLevel;
  private levelValue: number;
  private base: Record<string, unknown>;
  private redactPaths: string[];
  private destination: { write: (log: string) => void };
  private pretty: boolean;
  private timestamp: () => string;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? 'info';
    this.levelValue = LEVEL_VALUES[this.level];
    this.base = { ...options.base };
    this.redactPaths = options.redact ? [...options.redact] : [];
    this.destination = options.destination ?? { write: (log) => console.log(log) };
    this.pretty = options.pretty ?? false;
    this.timestamp = options.timestamp ?? (() => new Date().toISOString());
  }

  /**
   * 创建子日志器，自动合并上下文
   */
  child(bindings: Record<string, unknown>): StructuredLogger {
    return new StructuredLogger({
      level: this.level,
      base: { ...this.base, ...bindings },
      redact: this.redactPaths,
      destination: this.destination,
      pretty: this.pretty,
      timestamp: this.timestamp
    });
  }

  private log(level: LogLevel, msg: string, extra: Record<string, unknown> = {}): void {
    if (LEVEL_VALUES[level] < this.levelValue) return;

    const entry: LogEntry = {
      level,
      msg,
      time: this.timestamp(),
      ...this.base,
      ...extra
    };

    // 注入进程信息（Node.js 环境）
    if (typeof process !== 'undefined') {
      entry.pid = process.pid;
      entry.hostname = entry.hostname ?? (process.env['HOSTNAME'] || 'unknown');
    }

    // 脱敏处理
    this.redact(entry);

    if (this.pretty) {
      this.destination.write(this.formatPretty(entry));
    } else {
      this.destination.write(JSON.stringify(entry));
    }
  }

  /**
   * 按路径脱敏敏感字段，支持嵌套路径如 "user.password"
   */
  private redact(entry: Record<string, unknown>): void {
    for (const path of this.redactPaths) {
      const keys = path.split('.');
      let current: Record<string, unknown> | unknown[] = entry;

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]!;
        if (current === null || current === undefined) break;

        if (i === keys.length - 1) {
          if (typeof current === 'object' && key in current) {
            (current as Record<string, unknown>)[key] = '[REDACTED]';
          }
        } else {
          current = (current as Record<string, unknown>)[key] as Record<string, unknown> | unknown[];
        }
      }
    }
  }

  private formatPretty(entry: LogEntry): string {
    const { level, time, msg, ...rest } = entry;
    const levelColor: Record<LogLevel, string> = {
      trace: '\x1b[90m',
      debug: '\x1b[36m',
      info: '\x1b[32m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
      fatal: '\x1b[35m'
    };
    const reset = '\x1b[0m';
    const color = levelColor[level] ?? '';
    const extras = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : '';
    return `${color}[${time}] ${level.toUpperCase()}${reset}: ${msg}${extras}`;
  }

  trace(msg: string, extra?: Record<string, unknown>): void {
    this.log('trace', msg, extra);
  }

  debug(msg: string, extra?: Record<string, unknown>): void {
    this.log('debug', msg, extra);
  }

  info(msg: string, extra?: Record<string, unknown>): void {
    this.log('info', msg, extra);
  }

  warn(msg: string, extra?: Record<string, unknown>): void {
    this.log('warn', msg, extra);
  }

  error(msg: string, extra?: Record<string, unknown>): void {
    this.log('error', msg, extra);
  }

  fatal(msg: string, extra?: Record<string, unknown>): void {
    this.log('fatal', msg, extra);
  }

  /**
   * 获取当前日志级别
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * 动态设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
    this.levelValue = LEVEL_VALUES[level];
  }
}

/**
 * 全局默认日志器实例
 */
export const logger = new StructuredLogger();

// ============================================================================
// Demo
// ============================================================================

export function demo(): void {
  console.log('=== 结构化日志器演示 ===\n');

  // 1. 基础 JSON 日志
  console.log('--- 1. 基础 JSON 日志 ---');
  const jsonLogger = new StructuredLogger({ level: 'debug' });
  jsonLogger.info('用户登录成功', { userId: '42', ip: '192.168.1.1' });
  jsonLogger.error('数据库连接失败', { error: 'ECONNREFUSED', retryCount: 3 });

  // 2. 脱敏日志
  console.log('\n--- 2. 敏感字段脱敏 ---');
  const secureLogger = new StructuredLogger({
    redact: ['user.password', 'token', 'creditCard.number']
  });
  secureLogger.info('用户注册', {
    user: { id: '1', name: 'Alice', password: 'secret123' },
    token: 'jwt-token-string',
    creditCard: { number: '4111111111111111', expiry: '12/25' }
  });

  // 3. 美化输出（开发环境）
  console.log('\n--- 3. 美化输出 ---');
  const prettyLogger = new StructuredLogger({ pretty: true, level: 'debug' });
  prettyLogger.debug('调试信息');
  prettyLogger.warn('警告信息', { code: 'DEPRECATED_API' });

  // 4. 子日志器
  console.log('\n--- 4. 子日志器（上下文继承） ---');
  const requestLogger = jsonLogger.child({ requestId: 'req-123', traceId: 'abc-def' });
  requestLogger.info('处理请求开始');
  requestLogger.info('处理请求完成', { durationMs: 45 });

  console.log('\n=== 演示结束 ===\n');
}
