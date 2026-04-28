import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  StructuredLogger,
  ErrorReporter,
  observeWebVitals,
  observeLCP,
  observeCLS,
  observeINP,
  observeFID,
  observeTTFB,
  observeFCP,
  getRating
} from './index.js';

describe('92-observability-lab', () => {
  describe('structured-logger', () => {
    it('should log at and above configured level', () => {
      const logs: string[] = [];
      const logger = new StructuredLogger({
        level: 'warn',
        destination: { write: (log) => logs.push(log) }
      });

      logger.info('info msg');
      logger.warn('warn msg');
      logger.error('error msg');

      expect(logs.length).toBe(2);
      expect(JSON.parse(logs[0]!).msg).toBe('warn msg');
      expect(JSON.parse(logs[1]!).msg).toBe('error msg');
    });

    it('should include base context', () => {
      const logs: string[] = [];
      const logger = new StructuredLogger({
        level: 'info',
        base: { service: 'test', version: '1.0' },
        destination: { write: (log) => logs.push(log) }
      });

      logger.info('hello');
      const entry = JSON.parse(logs[0]!);
      expect(entry.service).toBe('test');
      expect(entry.version).toBe('1.0');
      expect(entry.msg).toBe('hello');
    });

    it('should redact sensitive fields', () => {
      const logs: string[] = [];
      const logger = new StructuredLogger({
        level: 'info',
        redact: ['password', 'user.secret'],
        destination: { write: (log) => logs.push(log) }
      });

      logger.info('login', { user: { name: 'Alice', secret: 'abc' }, password: '123456' });
      const entry = JSON.parse(logs[0]!);
      expect(entry.password).toBe('[REDACTED]');
      expect(entry.user.secret).toBe('[REDACTED]');
      expect(entry.user.name).toBe('Alice');
    });

    it('child logger should inherit and extend context', () => {
      const logs: string[] = [];
      const parent = new StructuredLogger({
        level: 'info',
        base: { app: 'demo' },
        destination: { write: (log) => logs.push(log) }
      });
      const child = parent.child({ requestId: 'req-1' });

      child.info('request');
      const entry = JSON.parse(logs[0]!);
      expect(entry.app).toBe('demo');
      expect(entry.requestId).toBe('req-1');
    });

    it('should support pretty mode', () => {
      const logs: string[] = [];
      const logger = new StructuredLogger({
        level: 'info',
        pretty: true,
        destination: { write: (log) => logs.push(log) }
      });
      logger.info('pretty');
      expect(logs[0]).toContain('INFO');
      expect(logs[0]).toContain('pretty');
    });

    it('should support dynamic level change', () => {
      const logs: string[] = [];
      const logger = new StructuredLogger({
        level: 'error',
        destination: { write: (log) => logs.push(log) }
      });
      logger.warn('before');
      logger.setLevel('warn');
      logger.warn('after');
      expect(logs.length).toBe(1);
      expect(JSON.parse(logs[0]!).msg).toBe('after');
    });
  });

  describe('error-reporter', () => {
    it('should capture error and queue report', () => {
      const reports: any[] = [];
      const reporter = new ErrorReporter({
        endpoint: 'https://test.example.com',
        sampleRate: 1.0,
        transport: (batch) => {
          reports.push(...batch);
        }
      });

      const err = new Error('test error');
      const id = reporter.captureError(err, { context: 'test' });
      expect(id).not.toBeNull();
      expect(reporter.getQueueSize()).toBe(1);

      reporter.destroy();
    });

    it('should respect sample rate', () => {
      const reporter = new ErrorReporter({
        endpoint: 'https://test.example.com',
        sampleRate: 0, // 零采样
        transport: () => {}
      });

      const id = reporter.captureError(new Error('never'));
      expect(id).toBeNull();
      reporter.destroy();
    });

    it('should deduplicate errors within window', () => {
      const reports: any[] = [];
      const reporter = new ErrorReporter({
        endpoint: 'https://test.example.com',
        sampleRate: 1.0,
        dedupWindowMs: 10000,
        transport: (batch) => reports.push(...batch)
      });

      reporter.captureError(new Error('dup'));
      reporter.captureError(new Error('dup'));
      expect(reporter.getQueueSize()).toBe(1);
      reporter.destroy();
    });

    it('should flush queue via transport', async () => {
      const reports: any[] = [];
      const reporter = new ErrorReporter({
        endpoint: 'https://test.example.com',
        sampleRate: 1.0,
        transport: (batch) => reports.push(...batch)
      });

      reporter.captureException('msg', 'file.js', 1, 2);
      await reporter.flush();
      expect(reports.length).toBe(1);
      expect(reports[0].message).toBe('msg');
      reporter.destroy();
    });

    it('should restore failed reports to queue', async () => {
      const reporter = new ErrorReporter({
        endpoint: 'https://test.example.com',
        sampleRate: 1.0,
        maxQueueSize: 10,
        transport: () => {
          throw new Error('network error');
        }
      });

      reporter.captureError(new Error('fail'));
      await reporter.flush();
      // 失败后部分数据应被恢复
      expect(reporter.getQueueSize()).toBeGreaterThan(0);
      reporter.destroy();
    });

    it('should limit queue size', () => {
      const reporter = new ErrorReporter({
        endpoint: 'https://test.example.com',
        sampleRate: 1.0,
        maxQueueSize: 3,
        transport: () => {}
      });

      for (let i = 0; i < 10; i++) {
        reporter.captureError(new Error(`err ${i}`));
      }
      expect(reporter.getQueueSize()).toBe(3);
      reporter.destroy();
    });
  });

  describe('performance-observer', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
      (global as any).PerformanceEventTiming = function() {};
      (global as any).PerformanceEventTiming.prototype = {};
    });

    it('getRating should classify correctly', () => {
      expect(getRating('LCP', 2000)).toBe('good');
      expect(getRating('LCP', 3000)).toBe('needs-improvement');
      expect(getRating('LCP', 5000)).toBe('poor');
      expect(getRating('CLS', 0.05)).toBe('good');
      expect(getRating('CLS', 0.15)).toBe('needs-improvement');
    });

    it('observeLCP should return disposer', () => {
      const disposer = observeLCP({ onReport: () => {} });
      expect(typeof disposer).toBe('function');
      disposer();
    });

    it('observeCLS should return disposer', () => {
      const disposer = observeCLS({ onReport: () => {} });
      expect(typeof disposer).toBe('function');
      disposer();
    });

    it('observeINP should return disposer', () => {
      const disposer = observeINP({ onReport: () => {} });
      expect(typeof disposer).toBe('function');
      disposer();
    });

    it('observeFID should return disposer', () => {
      const disposer = observeFID({ onReport: () => {} });
      expect(typeof disposer).toBe('function');
      disposer();
    });

    it('observeTTFB should return disposer', () => {
      const disposer = observeTTFB({ onReport: () => {} });
      expect(typeof disposer).toBe('function');
      disposer();
    });

    it('observeFCP should return disposer', () => {
      const disposer = observeFCP({ onReport: () => {} });
      expect(typeof disposer).toBe('function');
      disposer();
    });

    it('observeWebVitals should start all observers', () => {
      const metrics: any[] = [];
      const stop = observeWebVitals({ onReport: (m) => metrics.push(m) });
      expect(typeof stop).toBe('function');
      stop();
    });
  });
});
