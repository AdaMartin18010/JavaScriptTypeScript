/**
 * @file 责任链模式 (Chain of Responsibility Pattern)
 * @category Design Patterns → Behavioral
 * @difficulty medium
 * @tags chain-of-responsibility, behavioral, request-handling
 * 
 * @description
 * 使多个对象都有机会处理请求，从而避免请求的发送者和接收者之间的耦合关系
 */

// ============================================================================
// 1. 处理者接口
// ============================================================================

interface Handler<T> {
  setNext(handler: Handler<T>): Handler<T>;
  handle(request: T): T | null;
}

// ============================================================================
// 2. 基础处理者
// ============================================================================

abstract class AbstractHandler<T> implements Handler<T> {
  private nextHandler?: Handler<T>;

  setNext(handler: Handler<T>): Handler<T> {
    this.nextHandler = handler;
    return handler;
  }

  handle(request: T): T | null {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return null;
  }
}

// ============================================================================
// 3. 具体处理者 - 订单验证示例
// ============================================================================

interface Order {
  id: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  userId: string;
  couponCode?: string;
}

class StockCheckHandler extends AbstractHandler<Order> {
  private stock = new Map<string, number>([
    ['Apple', 100],
    ['Banana', 50],
    ['Orange', 0]
  ]);

  handle(order: Order): Order | null {
    for (const item of order.items) {
      const available = this.stock.get(item.name) || 0;
      if (available < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
    }
    console.log('Stock check passed');
    return super.handle(order) || order;
  }
}

class PaymentValidationHandler extends AbstractHandler<Order> {
  handle(order: Order): Order | null {
    const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (total <= 0) {
      throw new Error('Invalid order total');
    }
    console.log('Payment validation passed');
    return super.handle(order) || order;
  }
}

class CouponValidationHandler extends AbstractHandler<Order> {
  private validCoupons = new Set(['DISCOUNT10', 'SAVE20']);

  handle(order: Order): Order | null {
    if (order.couponCode && !this.validCoupons.has(order.couponCode)) {
      throw new Error('Invalid coupon code');
    }
    console.log('Coupon validation passed');
    return super.handle(order) || order;
  }
}

// ============================================================================
// 4. 中间件风格 (Express/Koa 风格)
// ============================================================================

type MiddlewareContext = Record<string, unknown>;
type NextFunction = () => void;
type Middleware = (ctx: MiddlewareContext, next: NextFunction) => void;

class MiddlewareChain {
  private middlewares: Middleware[] = [];

  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  execute(ctx: MiddlewareContext): void {
    let index = 0;

    const next = () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        middleware(ctx, next);
      }
    };

    next();
  }
}

// ============================================================================
// 5. 支持处理函数版本
// ============================================================================

type HandlerFunction<T> = (request: T) => T | null;

class FunctionalHandlerChain<T> {
  private handlers: HandlerFunction<T>[] = [];

  addHandler(handler: HandlerFunction<T>): this {
    this.handlers.push(handler);
    return this;
  }

  handle(request: T): T | null {
    for (const handler of this.handlers) {
      const result = handler(request);
      if (result !== null) {
        return result;
      }
    }
    return null;
  }
}

// ============================================================================
// 6. 日志处理示例
// ============================================================================

interface LogMessage {
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
  message: string;
}

abstract class LogHandler extends AbstractHandler<LogMessage> {
  constructor(private level: LogMessage['level']) {
    super();
  }

  handle(log: LogMessage): LogMessage | null {
    if (this.shouldHandle(log.level)) {
      this.write(log);
    }
    return super.handle(log) || log;
  }

  private shouldHandle(level: LogMessage['level']): boolean {
    const levels: LogMessage['level'][] = ['DEBUG', 'INFO', 'WARNING', 'ERROR'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  protected abstract write(log: LogMessage): void;
}

class ConsoleLogHandler extends LogHandler {
  constructor() {
    super('DEBUG');
  }

  protected write(log: LogMessage): void {
    console.log(`[${log.level}] ${log.message}`);
  }
}

class FileLogHandler extends LogHandler {
  private logs: string[] = [];

  constructor() {
    super('INFO');
  }

  protected write(log: LogMessage): void {
    this.logs.push(`[${log.level}] ${log.message}`);
  }

  getLogs(): string[] {
    return [...this.logs];
  }
}

class EmailLogHandler extends LogHandler {
  constructor() {
    super('ERROR');
  }

  protected write(log: LogMessage): void {
    console.log(`Sending email alert: ${log.message}`);
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  AbstractHandler,
  StockCheckHandler,
  PaymentValidationHandler,
  CouponValidationHandler,
  MiddlewareChain,
  FunctionalHandlerChain,
  ConsoleLogHandler,
  FileLogHandler,
  EmailLogHandler
};

export type { Handler, Order, MiddlewareContext, NextFunction, Middleware, LogMessage };
