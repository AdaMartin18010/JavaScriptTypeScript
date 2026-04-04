/**
 * @file 请求路由
 * @category API Gateway → Request Routing
 * @difficulty medium
 * @tags routing, load-balancing, path-matching, middleware
 *
 * @description
 * API 网关请求路由：路径匹配、中间件链、路由分组、动态路由
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface Request {
  id: string;
  method: HttpMethod;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body?: unknown;
  timestamp: number;
}

export interface Response {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type Handler = (req: Request, res: Response) => Promise<Response> | Response;

export type Middleware = (req: Request, res: Response, next: () => Promise<Response>) => Promise<Response>;

export interface Route {
  method: HttpMethod | '*';
  pattern: string;
  handler: Handler;
  middlewares: Middleware[];
  params: string[];
}

// ============================================================================
// 路径匹配器
// ============================================================================

export class PathMatcher {
  /**
   * 将路由模式转换为正则表达式
   * /users/:id -> /^\/users\/([^\/]+)$/
   * /files/* -> /^\/files\/(.+)$/
   */
  static patternToRegex(pattern: string): { regex: RegExp; params: string[] } {
    const params: string[] = [];
    
    // 转义特殊字符
    let regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&');

    // 处理命名参数 :param
    regexPattern = regexPattern.replace(/\\:([^\/\\]+)/g, (_, paramName) => {
      params.push(paramName);
      return '([^/]+)';
    });

    // 处理通配符 *
    regexPattern = regexPattern.replace(/\\\*/g, () => {
      params.push('wildcard');
      return '(.+)';
    });

    return {
      regex: new RegExp(`^${regexPattern}$`),
      params
    };
  }

  /**
   * 匹配路径
   */
  static match(pattern: string, path: string): { matched: boolean; params?: Record<string, string> } {
    const { regex, params } = this.patternToRegex(pattern);
    const match = path.match(regex);

    if (!match) {
      return { matched: false };
    }

    const paramValues: Record<string, string> = {};
    params.forEach((name, index) => {
      paramValues[name] = match[index + 1];
    });

    return { matched: true, params: paramValues };
  }

  /**
   * 检查模式是否静态（无参数）
   */
  static isStatic(pattern: string): boolean {
    return !pattern.includes(':') && !pattern.includes('*');
  }
}

// ============================================================================
// 路由表
// ============================================================================

export class Router {
  private routes: Route[] = [];
  private staticRoutes: Map<string, Route> = new Map();
  private dynamicRoutes: Route[] = [];
  private middlewares: Middleware[] = [];

  /**
   * 添加中间件
   */
  use(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * 注册路由
   */
  add(method: HttpMethod | '*', pattern: string, handler: Handler, ...middlewares: Middleware[]): void {
    const { params } = PathMatcher.patternToRegex(pattern);
    
    const route: Route = {
      method,
      pattern,
      handler,
      middlewares,
      params
    };

    this.routes.push(route);

    // 分类存储以优化查找
    if (PathMatcher.isStatic(pattern) && method !== '*') {
      this.staticRoutes.set(`${method}:${pattern}`, route);
    } else {
      this.dynamicRoutes.push(route);
    }
  }

  /**
   * HTTP 方法快捷方式
   */
  get(pattern: string, handler: Handler, ...middlewares: Middleware[]): void {
    this.add('GET', pattern, handler, ...middlewares);
  }

  post(pattern: string, handler: Handler, ...middlewares: Middleware[]): void {
    this.add('POST', pattern, handler, ...middlewares);
  }

  put(pattern: string, handler: Handler, ...middlewares: Middleware[]): void {
    this.add('PUT', pattern, handler, ...middlewares);
  }

  delete(pattern: string, handler: Handler, ...middlewares: Middleware[]): void {
    this.add('DELETE', pattern, handler, ...middlewares);
  }

  patch(pattern: string, handler: Handler, ...middlewares: Middleware[]): void {
    this.add('PATCH', pattern, handler, ...middlewares);
  }

  /**
   * 路由分组
   */
  group(prefix: string, config: (router: Router) => void): void {
    const subRouter = new Router();
    config(subRouter);

    // 将子路由器的路由添加到当前路由器，并添加前缀
    for (const route of subRouter.routes) {
      const fullPattern = this.joinPaths(prefix, route.pattern);
      this.add(
        route.method,
        fullPattern,
        route.handler,
        ...route.middlewares
      );
    }

    // 继承子路由器的中间件
    this.middlewares.push(...subRouter.middlewares);
  }

  /**
   * 匹配请求
   */
  match(request: Request): { route: Route; params: Record<string, string> } | null {
    // 先尝试静态路由
    const staticKey = `${request.method}:${request.path}`;
    const staticRoute = this.staticRoutes.get(staticKey);
    if (staticRoute) {
      return { route: staticRoute, params: {} };
    }

    // 尝试动态路由
    for (const route of this.dynamicRoutes) {
      // 方法匹配
      if (route.method !== '*' && route.method !== request.method) {
        continue;
      }

      // 路径匹配
      const match = PathMatcher.match(route.pattern, request.path);
      if (match.matched) {
        return { route, params: match.params || {} };
      }
    }

    return null;
  }

  /**
   * 执行请求
   */
  async execute(request: Request): Promise<Response> {
    const match = this.match(request);

    if (!match) {
      return {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        body: { error: 'Not Found', path: request.path, method: request.method }
      };
    }

    // 构建带参数的请求
    const enrichedRequest: Request = {
      ...request,
      // params 可以通过扩展类型添加
    };
    (enrichedRequest as Request & { params: Record<string, string> }).params = match.params;

    const baseResponse: Response = {
      status: 200,
      headers: {},
      body: null
    };

    // 构建中间件链
    const allMiddlewares = [
      ...this.middlewares,
      ...match.route.middlewares
    ];

    let index = 0;
    const next = async (): Promise<Response> => {
      if (index < allMiddlewares.length) {
        const middleware = allMiddlewares[index++];
        return middleware(enrichedRequest, baseResponse, next);
      }
      return match.route.handler(enrichedRequest, baseResponse);
    };

    return next();
  }

  /**
   * 获取所有路由
   */
  getRoutes(): Route[] {
    return [...this.routes];
  }

  private joinPaths(a: string, b: string): string {
    const normalizedA = a.endsWith('/') ? a.slice(0, -1) : a;
    const normalizedB = b.startsWith('/') ? b : '/' + b;
    return normalizedA + normalizedB;
  }
}

// ============================================================================
// 动态路由发现
// ============================================================================

export interface ServiceEndpoint {
  serviceId: string;
  host: string;
  port: number;
  health: 'healthy' | 'unhealthy' | 'unknown';
  metadata?: Record<string, unknown>;
}

export class DynamicRouter {
  private services: Map<string, ServiceEndpoint[]> = new Map();
  private routes: Map<string, string> = new Map(); // pattern -> serviceId

  /**
   * 注册服务
   */
  registerService(serviceId: string, endpoint: ServiceEndpoint): void {
    if (!this.services.has(serviceId)) {
      this.services.set(serviceId, []);
    }
    this.services.get(serviceId)!.push(endpoint);
  }

  /**
   * 注销服务实例
   */
  deregisterService(serviceId: string, host: string, port: number): void {
    const endpoints = this.services.get(serviceId);
    if (endpoints) {
      const index = endpoints.findIndex(e => e.host === host && e.port === port);
      if (index > -1) {
        endpoints.splice(index, 1);
      }
    }
  }

  /**
   * 绑定路由到服务
   */
  bindRoute(pattern: string, serviceId: string): void {
    this.routes.set(pattern, serviceId);
  }

  /**
   * 解析目标地址
   */
  resolve(request: Request): ServiceEndpoint | null {
    // 找到匹配的路由
    let matchedServiceId: string | undefined;
    
    for (const [pattern, serviceId] of this.routes) {
      const match = PathMatcher.match(pattern, request.path);
      if (match.matched) {
        matchedServiceId = serviceId;
        break;
      }
    }

    if (!matchedServiceId) {
      return null;
    }

    // 获取健康的服务实例
    const endpoints = this.services.get(matchedServiceId) || [];
    const healthy = endpoints.filter(e => e.health === 'healthy');
    
    if (healthy.length === 0) {
      return null;
    }

    // 简单轮询
    const index = Math.floor(Math.random() * healthy.length);
    return healthy[index];
  }

  /**
   * 健康检查
   */
  async healthCheck(serviceId: string, checker: (endpoint: ServiceEndpoint) => Promise<boolean>): Promise<void> {
    const endpoints = this.services.get(serviceId);
    if (!endpoints) return;

    for (const endpoint of endpoints) {
      try {
        const isHealthy = await checker(endpoint);
        endpoint.health = isHealthy ? 'healthy' : 'unhealthy';
      } catch {
        endpoint.health = 'unhealthy';
      }
    }
  }
}

// ============================================================================
// 路由中间件
// ============================================================================

export const loggingMiddleware: Middleware = async (req, res, next) => {
  const start = Date.now();
  const response = await next();
  const duration = Date.now() - start;
  
  console.log(`[${req.method}] ${req.path} - ${response.status} (${duration}ms)`);
  return response;
};

export const corsMiddleware = (options: { origin?: string; methods?: string[] } = {}): Middleware => {
  const { origin = '*', methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] } = options;
  
  return async (req, res, next) => {
    res.headers['Access-Control-Allow-Origin'] = origin;
    res.headers['Access-Control-Allow-Methods'] = methods.join(', ');
    res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    
    if (req.method === 'OPTIONS') {
      return { ...res, status: 204, body: null };
    }
    
    return next();
  };
};

export const authMiddleware = (validateToken: (token: string) => boolean): Middleware => {
  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        ...res,
        status: 401,
        body: { error: 'Unauthorized' }
      };
    }

    const token = authHeader.slice(7);
    if (!validateToken(token)) {
      return {
        ...res,
        status: 401,
        body: { error: 'Invalid token' }
      };
    }

    return next();
  };
};

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 请求路由演示 ===\n');

  const router = new Router();

  // 1. 基础路由
  console.log('--- 基础路由 ---');
  router.get('/health', () => ({
    status: 200,
    headers: {},
    body: { status: 'ok' }
  }));

  router.get('/users', () => ({
    status: 200,
    headers: {},
    body: { users: [] }
  }));

  // 2. 带参数的路由
  console.log('--- 参数路由 ---');
  router.get('/users/:id', (req) => {
    const params = (req as Request & { params: Record<string, string> }).params;
    return {
      status: 200,
      headers: {},
      body: { userId: params.id }
    };
  });

  router.get('/files/*path', (req) => {
    const params = (req as Request & { params: Record<string, string> }).params;
    return {
      status: 200,
      headers: {},
      body: { path: params.wildcard }
    };
  });

  // 3. 路由分组
  console.log('--- 路由分组 ---');
  router.group('/api/v1', (api) => {
    api.get('/status', () => ({
      status: 200,
      headers: {},
      body: { version: 'v1' }
    }));
    
    api.get('/resources', () => ({
      status: 200,
      headers: {},
      body: { resources: [] }
    }));
  });

  // 4. 使用中间件
  console.log('--- 中间件 ---');
  router.use(loggingMiddleware);
  router.use(corsMiddleware({ origin: 'https://example.com' }));

  // 5. 查看所有路由
  console.log('\n--- 注册的路由 ---');
  router.getRoutes().forEach(route => {
    console.log(`  ${route.method.padEnd(6)} ${route.pattern}`);
  });

  // 6. 测试路由匹配
  console.log('\n--- 路由匹配测试 ---');
  const testRequests: Request[] = [
    { id: '1', method: 'GET', path: '/health', headers: {}, query: {}, timestamp: Date.now() },
    { id: '2', method: 'GET', path: '/users/123', headers: {}, query: {}, timestamp: Date.now() },
    { id: '3', method: 'GET', path: '/files/path/to/file.txt', headers: {}, query: {}, timestamp: Date.now() },
    { id: '4', method: 'GET', path: '/api/v1/status', headers: {}, query: {}, timestamp: Date.now() },
    { id: '5', method: 'GET', path: '/not-found', headers: {}, query: {}, timestamp: Date.now() }
  ];

  for (const req of testRequests) {
    router.execute(req).then(res => {
      console.log(`  ${req.method} ${req.path} -> ${res.status}`);
    });
  }

  // 7. 动态路由
  console.log('\n--- 动态路由发现 ---');
  const dynamicRouter = new DynamicRouter();
  
  dynamicRouter.registerService('user-service', {
    serviceId: 'user-service',
    host: 'localhost',
    port: 8001,
    health: 'healthy'
  });
  
  dynamicRouter.registerService('user-service', {
    serviceId: 'user-service',
    host: 'localhost',
    port: 8002,
    health: 'healthy'
  });

  dynamicRouter.bindRoute('/api/users/*', 'user-service');

  const target = dynamicRouter.resolve({
    id: '6',
    method: 'GET',
    path: '/api/users/profile',
    headers: {},
    query: {},
    timestamp: Date.now()
  });

  if (target) {
    console.log(`  Resolved to: ${target.host}:${target.port}`);
  }
}
