/**
 * @file API网关实现
 * @category API Gateway → Implementation
 * @difficulty hard
 * @tags api-gateway, routing, rate-limiting, circuit-breaker
 */

export interface GatewayRequest {
  id: string;
  path: string;
  method: string;
  headers: Record<string, string>;
  timestamp: number;
}

export interface GatewayResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  latency: number;
}

export interface RouteRule {
  path: string;
  methods: string[];
  target: string;
}

export class GatewayRouter {
  private routes: RouteRule[] = [];
  
  addRoute(rule: RouteRule): void {
    this.routes.push(rule);
  }
  
  match(request: GatewayRequest): RouteRule | null {
    return this.routes.find(r => {
      const pathMatch = this.matchPath(request.path, r.path);
      const methodMatch = r.methods.includes(request.method) || r.methods.includes('*');
      return pathMatch && methodMatch;
    }) || null;
  }
  
  private matchPath(requestPath: string, routePath: string): boolean {
    const pattern = routePath.replace(/:([^/]+)/g, '([^/]+)');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(requestPath);
  }
  
  extractParams(requestPath: string, routePath: string): Record<string, string> {
    const params: Record<string, string> = {};
    const paramNames = routePath.match(/:([^/]+)/g) || [];
    const pattern = routePath.replace(/:([^/]+)/g, '([^/]+)');
    const matches = new RegExp(`^${pattern}$`).exec(requestPath);
    
    if (matches) {
      paramNames.forEach((name, i) => {
        params[name.slice(1)] = matches[i + 1];
      });
    }
    
    return params;
  }
}

export class RateLimiter {
  private requests = new Map<string, number[]>();
  
  constructor(
    private windowMs = 60000,
    private maxRequests = 100
  ) {}
  
  isAllowed(clientId: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    let timestamps = this.requests.get(clientId) || [];
    timestamps = timestamps.filter(t => t > windowStart);
    
    const allowed = timestamps.length < this.maxRequests;
    
    if (allowed) {
      timestamps.push(now);
    }
    
    this.requests.set(clientId, timestamps);
    
    return {
      allowed,
      remaining: Math.max(0, this.maxRequests - timestamps.length)
    };
  }
}

export class CircuitBreaker {
  private state = new Map<string, { state: 'closed' | 'open' | 'half-open'; failures: number; lastFailureTime: number }>();
  
  constructor(
    private failureThreshold = 5,
    private resetTimeout = 30000
  ) {}
  
  async execute<T>(serviceName: string, operation: () => Promise<T>): Promise<T> {
    const s = this.getState(serviceName);
    
    if (s.state === 'open') {
      if (Date.now() - s.lastFailureTime > this.resetTimeout) {
        s.state = 'half-open';
        s.failures = 0;
      } else {
        throw new Error(`Circuit breaker is OPEN for ${serviceName}`);
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess(serviceName);
      return result;
    } catch (error) {
      this.onFailure(serviceName);
      throw error;
    }
  }
  
  private getState(serviceName: string) {
    if (!this.state.has(serviceName)) {
      this.state.set(serviceName, { state: 'closed', failures: 0, lastFailureTime: 0 });
    }
    return this.state.get(serviceName)!;
  }
  
  private onSuccess(serviceName: string): void {
    const s = this.getState(serviceName);
    if (s.state === 'half-open') {
      s.state = 'closed';
      s.failures = 0;
    }
  }
  
  private onFailure(serviceName: string): void {
    const s = this.getState(serviceName);
    s.failures++;
    s.lastFailureTime = Date.now();
    
    if (s.failures >= this.failureThreshold) {
      s.state = 'open';
      console.log(`[CircuitBreaker] ${serviceName} 已熔断`);
    }
  }
}

export class APIGateway {
  private router = new GatewayRouter();
  private rateLimiter = new RateLimiter();
  private circuitBreaker = new CircuitBreaker();
  
  route(rule: RouteRule): void {
    this.router.addRoute(rule);
  }
  
  async handle(request: GatewayRequest): Promise<GatewayResponse> {
    const startTime = Date.now();
    
    const clientId = request.headers['x-client-id'] || 'anonymous';
    const limitCheck = this.rateLimiter.isAllowed(clientId);
    
    if (!limitCheck.allowed) {
      return {
        status: 429,
        headers: { 'X-RateLimit-Remaining': '0' },
        body: { error: 'Too Many Requests' },
        latency: Date.now() - startTime
      };
    }
    
    const route = this.router.match(request);
    if (!route) {
      return {
        status: 404,
        headers: {},
        body: { error: 'Not Found' },
        latency: Date.now() - startTime
      };
    }
    
    try {
      const result = await this.circuitBreaker.execute(route.target, async () => {
        return { service: route.target, path: request.path };
      });
      
      return {
        status: 200,
        headers: { 'X-RateLimit-Remaining': limitCheck.remaining.toString() },
        body: result,
        latency: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 503,
        headers: {},
        body: { error: 'Service Unavailable' },
        latency: Date.now() - startTime
      };
    }
  }
}

export function demo(): void {
  console.log('=== API网关 ===\n');
  
  const gateway = new APIGateway();
  
  gateway.route({
    path: '/api/v1/users',
    methods: ['GET', 'POST'],
    target: 'user-service'
  });
  
  gateway.route({
    path: '/api/v1/users/:id',
    methods: ['GET', 'PUT', 'DELETE'],
    target: 'user-service'
  });
  
  const router = new GatewayRouter();
  router.addRoute({ path: '/api/:version/users', methods: ['GET'], target: 'users' });
  const params = router.extractParams('/api/v2/users', '/api/:version/users');
  console.log('路由参数:', params);
}
