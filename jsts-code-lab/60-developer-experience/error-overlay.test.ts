import { describe, it, expect, vi } from 'vitest';
import { ErrorParser, ErrorOverlayManager, ConsoleErrorHandler, ErrorFormatter } from './error-overlay';

describe('ErrorParser', () => {
  it('parses runtime error with stack location', () => {
    const parser = new ErrorParser();
    const error = new Error('Oops');
    error.stack = 'Error: Oops\n    at foo (/src/app.ts:10:5)';
    const info = parser.parse(error);
    expect(info.message).toBe('Oops');
    expect(info.location).toEqual({ file: '/src/app.ts', line: 10, column: 5 });
  });

  it('parses compile error', () => {
    const parser = new ErrorParser();
    const info = parser.parseCompileError('Module not found', '/src/app.ts', 2, 15);
    expect(info.type).toBe('compile');
    expect(info.location).toEqual({ file: '/src/app.ts', line: 2, column: 15 });
  });

  it('generates code frame', () => {
    const parser = new ErrorParser();
    const code = 'line1\nline2\nline3\nline4\nline5';
    const frame = parser.generateCodeFrame(code, 3, 2);
    expect(frame).toContain('line3');
    expect(frame).toContain('^');
  });
});

describe('ErrorOverlayManager', () => {
  it('adds and retrieves errors sorted by timestamp', () => {
    const manager = new ErrorOverlayManager();
    manager.addError({ id: '1', type: 'runtime', message: 'a', severity: 'error', timestamp: 100 } as any);
    manager.addError({ id: '2', type: 'runtime', message: 'b', severity: 'error', timestamp: 200 } as any);
    const errors = manager.getErrors();
    expect(errors[0].timestamp).toBe(200);
  });

  it('filters errors by type', () => {
    const manager = new ErrorOverlayManager();
    manager.addError({ id: '1', type: 'runtime', message: 'a', severity: 'error', timestamp: 100 } as any);
    manager.addError({ id: '2', type: 'compile', message: 'b', severity: 'error', timestamp: 200 } as any);
    expect(manager.getErrorsByType('compile').length).toBe(1);
  });

  it('notifies subscribers', () => {
    const manager = new ErrorOverlayManager();
    const listener = vi.fn();
    manager.subscribe(listener);
    manager.addError({ id: '1', type: 'runtime', message: 'a', severity: 'error', timestamp: 100 } as any);
    expect(listener).toHaveBeenCalled();
  });
});

describe('ConsoleErrorHandler', () => {
  it('intercepts console.error for Error instances', () => {
    const onError = vi.fn();
    const handler = new ConsoleErrorHandler(onError);
    handler.intercept();
    console.error('Something failed', new Error('fail'));
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    handler.restore();
  });
});

describe('ErrorFormatter', () => {
  it('formats error info as string', () => {
    const formatter = new ErrorFormatter();
    const info = { type: 'runtime', message: 'fail', location: { file: 'a.ts', line: 1, column: 1 }, stack: 'Error\n  at a', severity: 'error', timestamp: 1, id: '1' } as any;
    const text = formatter.format(info);
    expect(text).toContain('[RUNTIME] fail');
    expect(text).toContain('a.ts:1:1');
  });

  it('formats to HTML and escapes content', () => {
    const formatter = new ErrorFormatter();
    const info = { type: 'runtime', message: '<script>', severity: 'error', timestamp: 1, id: '1' } as any;
    const html = formatter.formatToHTML(info);
    expect(html).toContain('&lt;script&gt;');
  });
});
