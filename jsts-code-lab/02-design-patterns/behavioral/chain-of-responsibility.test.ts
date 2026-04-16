import { describe, it, expect } from 'vitest';
import {
  StockCheckHandler,
  PaymentValidationHandler,
  CouponValidationHandler,
  MiddlewareChain,
  FunctionalHandlerChain,
  FileLogHandler
} from './chain-of-responsibility.js';

describe('chain of responsibility pattern', () => {
  it('should pass order through all handlers successfully', () => {
    const stockHandler = new StockCheckHandler();
    const paymentHandler = new PaymentValidationHandler();
    const couponHandler = new CouponValidationHandler();

    stockHandler.setNext(paymentHandler).setNext(couponHandler);

    const validOrder = {
      id: 'order-1',
      items: [{ name: 'Apple', quantity: 5, price: 10 }],
      userId: 'user-1',
      couponCode: 'DISCOUNT10'
    };

    const result = stockHandler.handle(validOrder);
    expect(result).toEqual(validOrder);
  });

  it('should throw on insufficient stock', () => {
    const stockHandler = new StockCheckHandler();
    const order = {
      id: 'order-2',
      items: [{ name: 'Orange', quantity: 5, price: 10 }],
      userId: 'user-1'
    };

    expect(() => stockHandler.handle(order)).toThrow('Insufficient stock for Orange');
  });

  it('should throw on invalid coupon', () => {
    const stockHandler = new StockCheckHandler();
    const paymentHandler = new PaymentValidationHandler();
    const couponHandler = new CouponValidationHandler();

    stockHandler.setNext(paymentHandler).setNext(couponHandler);

    const order = {
      id: 'order-3',
      items: [{ name: 'Apple', quantity: 1, price: 10 }],
      userId: 'user-1',
      couponCode: 'INVALID'
    };

    expect(() => stockHandler.handle(order)).toThrow('Invalid coupon code');
  });

  it('MiddlewareChain should execute middlewares in order', () => {
    const chain = new MiddlewareChain();
    const logs: string[] = [];

    chain
      .use((_ctx: unknown, next: () => void) => {
        logs.push('before-1');
        next();
        logs.push('after-1');
      })
      .use((_ctx: unknown, next: () => void) => {
        logs.push('before-2');
        next();
        logs.push('after-2');
      });

    chain.execute({});
    expect(logs).toEqual(['before-1', 'before-2', 'after-2', 'after-1']);
  });

  it('FunctionalHandlerChain should return first non-null result', () => {
    const chain = new FunctionalHandlerChain<string>();
    chain
      .addHandler((req: string) => (req === 'a' ? 'handled-a' : null))
      .addHandler((req: string) => (req === 'b' ? 'handled-b' : null));

    expect(chain.handle('a')).toBe('handled-a');
    expect(chain.handle('b')).toBe('handled-b');
    expect(chain.handle('c')).toBeNull();
  });

  it('FileLogHandler should collect logs above INFO level', () => {
    const fileHandler = new FileLogHandler();
    fileHandler.handle({ level: 'INFO', message: 'App started' });
    fileHandler.handle({ level: 'DEBUG', message: 'Debug info' });
    fileHandler.handle({ level: 'ERROR', message: 'Something wrong' });

    const logs = fileHandler.getLogs();
    expect(logs).toHaveLength(2);
    expect(logs[0]).toContain('App started');
    expect(logs[1]).toContain('Something wrong');
  });
});
