/**
 * @file 基础 Web 服务器
 * @category Real World Examples → Web Server
 * @difficulty medium
 * @tags web-server, http, router, middleware
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';

// ============================================================================
// 1. 路由系统
// ============================================================================

type Handler = (req: IncomingMessage, res: ServerResponse, params: Record<string, string>) => void | Promise<void>;
type Middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => void | Promise<void>;

interface Route {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: Handler;
}

export class Router {
  private routes: Route[] = [];
  private middlewares: Middleware[] = [];

  private pathToPattern(path: string): { pattern: RegExp; keys: string[] } {
    const keys: string[] = [];
    const pattern = path.replace(/:([^/]+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    });
    return { pattern: new RegExp(`^${pattern}$`), keys };
  }

  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  get(path: string, handler: Handler): this {
    const { pattern, keys } = this.pathToPattern(path);
    this.routes.push({ method: 'GET', pattern, keys, handler });
    return this;
  }

  post(path: string, handler: Handler): this {
    const { pattern, keys } = this.pathToPattern(path);
    this.routes.push({ method: 'POST', pattern, keys, handler });
    return this;
  }

  put(path: string, handler: Handler): this {
    const { pattern, keys } = this.pathToPattern(path);
    this.routes.push({ method: 'PUT', pattern, keys, handler });
    return this;
  }

  delete(path: string, handler: Handler): this {
    const { pattern, keys } = this.pathToPattern(path);
    this.routes.push({ method: 'DELETE', pattern, keys, handler });
    return this;
  }

  async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = req.url || '/';
    const method = req.method || 'GET';

    // 执行中间件
    let middlewareIndex = 0;
    const next = async () => {
      if (middlewareIndex < this.middlewares.length) {
        const middleware = this.middlewares[middlewareIndex++];
        await middleware(req, res, next);
      }
    };
    await next();

    // 查找路由
    for (const route of this.routes) {
      if (route.method !== method) continue;

      const match = url.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.keys.forEach((key, i) => {
          params[key] = match[i + 1];
        });

        await route.handler(req, res, params);
        return;
      }
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
}

// ============================================================================
// 2. 常用中间件
// ============================================================================

export const jsonMiddleware: Middleware = (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
};

export const corsMiddleware: Middleware = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

export const loggerMiddleware: Middleware = (req, res, next) => {
  const start = Date.now();
  console.log(`${req.method} ${req.url}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// ============================================================================
// 3. 请求体解析
// ============================================================================

export function parseBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve(body);
      }
    });
    req.on('error', reject);
  });
}

// ============================================================================
// 4. 创建服务器
// ============================================================================

export function createApp(): Router {
  return new Router();
}

export function startServer(router: Router, port = 3000): void {
  const server = createServer((req, res) => {
    router.handle(req, res).catch(err => {
      console.error(err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    });
  });

  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
}

// ============================================================================
// 5. 使用示例
// ============================================================================

/*
const app = createApp();

app
  .use(loggerMiddleware)
  .use(jsonMiddleware)
  .use(corsMiddleware)
  .get('/users', async (req, res) => {
    res.writeHead(200);
    res.end(JSON.stringify([{ id: 1, name: 'Alice' }]));
  })
  .get('/users/:id', async (req, res, params) => {
    res.writeHead(200);
    res.end(JSON.stringify({ id: params.id, name: 'User ' + params.id }));
  })
  .post('/users', async (req, res) => {
    const body = await parseBody(req);
    res.writeHead(201);
    res.end(JSON.stringify({ id: 2, ...body as object }));
  });

startServer(app, 3000);
*/

// ============================================================================
// 6. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 基础 Web 服务器演示 ===\n');

  // 创建应用
  const app = createApp();

  // 添加中间件
  app
    .use(loggerMiddleware)
    .use(jsonMiddleware)
    .use(corsMiddleware);

  // 添加路由
  app
    .get('/api/users', async (req, res) => {
      console.log('[模拟] 获取用户列表');
    })
    .get('/api/users/:id', async (req, res, params) => {
      console.log(`[模拟] 获取用户 ${params.id}`);
    })
    .post('/api/users', async (req, res) => {
      const body = parseBody(req);
      console.log('[模拟] 创建用户:', body);
    });

  console.log('路由已注册:');
  console.log('  GET    /api/users');
  console.log('  GET    /api/users/:id');
  console.log('  POST   /api/users');

  // 模拟请求处理
  console.log('\n模拟请求:');
  
  const mockReq = {
    method: 'GET',
    url: '/api/users/123',
    headers: {}
  } as IncomingMessage;

  const mockRes = {
    writeHead: (code: number, headers?: any) => {
      console.log(`  响应状态: ${code}`);
    },
    end: (data?: any) => {
      console.log(`  响应数据: ${data}`);
    },
    on: (event: string, cb: any) => {},
    setHeader: (name: string, value: string) => {},
    statusCode: 200
  } as unknown as ServerResponse;

  app.handle(mockReq, mockRes).catch(console.error);

  console.log('\n服务器功能演示完成');
  console.log('实际启动请取消注释底部的 startServer(app, 3000)');
}

// ============================================================================
// 导出
// ============================================================================

export {
  Router,
  jsonMiddleware,
  corsMiddleware,
  loggerMiddleware,
  parseBody,
  createApp,
  startServer
};

export type { Handler, Middleware, Route };
