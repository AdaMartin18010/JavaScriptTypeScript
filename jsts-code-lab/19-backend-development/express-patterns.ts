/**
 * @file Express.js 后端开发模式
 * @category Backend Development → Express
 * @difficulty medium
 * @tags express, nodejs, middleware, routing, rest-api
 * 
 * @description
 * Express.js 应用开发模式：
 * - 中间件架构
 * - 路由组织
 * - 错误处理
 * - 请求验证
 */

// 占位类型，避免安装 express 依赖
type Request = { body: unknown; params: Record<string, string>; query: Record<string, unknown>; headers: Record<string, string>; method?: string; path?: string; user?: { id: string; email: string } };
type Response = { status(code: number): Response; json(body: unknown): Response; send(body?: unknown): Response; on(event: string, callback: () => void): Response; statusCode?: number };
type NextFunction = () => void;
type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;
type ErrorRequestHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => void;

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

// ============================================================================
// 1. 中间件类型定义
// ============================================================================

type Middleware = (req: Request, res: Response, next: NextFunction) => void;
type AsyncMiddleware = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// ============================================================================
// 2. 请求验证中间件
// ============================================================================

interface ValidationSchema {
  body?: Record<string, (value: unknown) => boolean>;
  query?: Record<string, (value: unknown) => boolean>;
  params?: Record<string, (value: unknown) => boolean>;
}

export const validateRequest = (schema: ValidationSchema): Middleware => {
  return (req, res, next) => {
    const errors: string[] = [];

    // 验证 body
    if (schema.body) {
      for (const [field, validator] of Object.entries(schema.body)) {
        if (!validator((req.body as Record<string, unknown>)[field])) {
          errors.push(`Invalid body field: ${field}`);
        }
      }
    }

    // 验证 query
    if (schema.query) {
      for (const [field, validator] of Object.entries(schema.query)) {
        if (!validator(req.query[field])) {
          errors.push(`Invalid query field: ${field}`);
        }
      }
    }

    // 验证 params
    if (schema.params) {
      for (const [field, validator] of Object.entries(schema.params)) {
        if (!validator(req.params[field])) {
          errors.push(`Invalid param field: ${field}`);
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    next();
  };
};

// 使用示例
const userCreateSchema: ValidationSchema = {
  body: {
    email: (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    name: (v) => typeof v === 'string' && v.length >= 2,
    age: (v) => typeof v === 'number' && v >= 0 && v <= 150
  }
};

// ============================================================================
// 3. 异步错误处理包装器
// ============================================================================

export const asyncHandler = (fn: AsyncMiddleware): Middleware => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 使用示例
const getUserHandler = asyncHandler(async (req, res) => {
  const user = await Promise.resolve({ id: req.params.id, name: 'John' });
  res.json(user);
});

// ============================================================================
// 4. 路由组织模式
// ============================================================================

interface RouteDefinition {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  path: string;
  middlewares: Middleware[];
  handler: Middleware;
}

export class RouteBuilder {
  private routes: RouteDefinition[] = [];

  get(path: string, ...handlers: Middleware[]): this {
    const [middlewares, handler] = this.separateHandlers(handlers);
    this.routes.push({ method: 'get', path, middlewares, handler });
    return this;
  }

  post(path: string, ...handlers: Middleware[]): this {
    const [middlewares, handler] = this.separateHandlers(handlers);
    this.routes.push({ method: 'post', path, middlewares, handler });
    return this;
  }

  put(path: string, ...handlers: Middleware[]): this {
    const [middlewares, handler] = this.separateHandlers(handlers);
    this.routes.push({ method: 'put', path, middlewares, handler });
    return this;
  }

  delete(path: string, ...handlers: Middleware[]): this {
    const [middlewares, handler] = this.separateHandlers(handlers);
    this.routes.push({ method: 'delete', path, middlewares, handler });
    return this;
  }

  private separateHandlers(handlers: Middleware[]): [Middleware[], Middleware] {
    const handler = handlers.pop()!;
    return [handlers, handler];
  }

  build(): RouteDefinition[] {
    return this.routes;
  }
}

// ============================================================================
// 5. 控制器基类
// ============================================================================

export abstract class BaseController {
  protected success<T>(res: Response, data: T, statusCode = 200): void {
    res.status(statusCode).json({
      success: true,
      data
    });
  }

  protected error(res: Response, message: string, statusCode = 500, details?: unknown): void {
    res.status(statusCode).json({
      success: false,
      error: {
        message,
        details
      }
    });
  }

  protected created<T>(res: Response, data: T): void {
    this.success(res, data, 201);
  }

  protected noContent(res: Response): void {
    res.status(204).send();
  }
}

// ============================================================================
// 6. 日志中间件
// ============================================================================

export const requestLogger: Middleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

// ============================================================================
// 7. 认证中间件
// ============================================================================

export const authMiddleware: Middleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    // 验证 token
    req.user = { id: '123', email: 'user@example.com' };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============================================================================
// 8. 错误处理中间件
// ============================================================================

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);

  if ((err as Error).name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation Error',
      details: (err as Error).message
    });
    return;
  }

  if ((err as Error).name === 'UnauthorizedError') {
    res.status(401).json({
      error: 'Unauthorized'
    });
    return;
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? (err as Error).message : undefined
  });
};

// ============================================================================
// 9. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== Express.js 后端开发模式 ===\n');

  console.log('1. 请求验证中间件');
  console.log('   validateRequest(schema) - 统一验证请求参数');

  console.log('\n2. 异步错误处理');
  console.log('   asyncHandler() - 自动捕获异步错误');

  console.log('\n3. 路由构建器');
  console.log('   RouteBuilder - 声明式路由定义');

  console.log('\n4. 控制器基类');
  console.log('   BaseController - 统一响应格式');

  console.log('\n5. 中间件');
  console.log('   - requestLogger: 请求日志');
  console.log('   - authMiddleware: 认证检查');
  console.log('   - errorHandler: 错误处理');

  console.log('\nExpress 开发要点:');
  console.log('- 使用中间件处理横切关注点');
  console.log('- 统一错误处理避免崩溃');
  console.log('- 验证输入防止安全问题');
  console.log('- 异步函数使用 try-catch');
}

// ============================================================================
// 导出
// ============================================================================

// Classes/functions already exported inline above
export { userCreateSchema };

export type {
  Middleware,
  AsyncMiddleware,
  ValidationSchema,
  RouteDefinition
};
