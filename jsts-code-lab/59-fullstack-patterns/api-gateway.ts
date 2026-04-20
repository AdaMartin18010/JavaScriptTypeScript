/**
 * @file API Gateway 组合模式
 * @category Fullstack Patterns → API Gateway
 * @difficulty medium
 * @tags api-gateway, microservices, routing, middleware
 *
 * @description
 * API Gateway 是微服务架构的统一入口，负责路由、认证、限流、聚合等横切关注点。
 */

// ============================================================================
// 1. 核心类型定义
// ============================================================================

export interface GatewayRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  headers: Record<string, string>
  query: Record<string, string>
  body?: unknown
  userId?: string
  requestId: string
}

export interface GatewayResponse {
  status: number
  headers: Record<string, string>
  body: unknown
  latency: number
}

export interface ServiceRoute {
  path: string
  methods: string[]
  target: string
  stripPrefix?: boolean
  retries?: number
  timeout?: number
  circuitBreaker?: CircuitBreakerConfig
}

export interface CircuitBreakerConfig {
  failureThreshold: number
  recoveryTimeout: number
  halfOpenMaxCalls: number
}

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: GatewayRequest) => string
}

// ============================================================================
// 2. 中间件系统
// ============================================================================

export type Middleware = (req: GatewayRequest, next: () => Promise<GatewayResponse>) => Promise<GatewayResponse>

export class MiddlewarePipeline {
  private middlewares: Middleware[] = []

  use(mw: Middleware): void {
    this.middlewares.push(mw)
  }

  async execute(req: GatewayRequest, handler: () => Promise<GatewayResponse>): Promise<GatewayResponse> {
    let index = 0
    const next = async (): Promise<GatewayResponse> => {
      if (index < this.middlewares.length) {
        return this.middlewares[index++](req, next)
      }
      return handler()
    }
    return next()
  }
}

// 认证中间件
export const authMiddleware = (tokenValidator: (token: string) => Promise<{ userId: string } | null>): Middleware => {
  return async (req, next) => {
    const authHeader = req.headers['authorization']
    if (!authHeader?.startsWith('Bearer ')) {
      return { status: 401, headers: {}, body: { error: 'Unauthorized' }, latency: 0 }
    }
    const token = authHeader.slice(7)
    const user = await tokenValidator(token)
    if (!user) {
      return { status: 401, headers: {}, body: { error: 'Invalid token' }, latency: 0 }
    }
    req.userId = user.userId
    return next()
  }
}

// 日志中间件
export const loggingMiddleware: Middleware = async (req, next) => {
  const start = Date.now()
  const res = await next()
  console.log(`[Gateway] ${req.method} ${req.path} → ${res.status} (${Date.now() - start}ms)`)
  return res
}

// 限流中间件
export const rateLimitMiddleware = (config: RateLimitConfig): Middleware => {
  const requests = new Map<string, Array<number>>()

  return async (req, next) => {
    const key = config.keyGenerator?.(req) ?? req.userId ?? 'anonymous'
    const now = Date.now()
    const window = config.windowMs

    const timestamps = requests.get(key) ?? []
    const valid = timestamps.filter(t => now - t < window)

    if (valid.length >= config.maxRequests) {
      return { status: 429, headers: { 'Retry-After': String(Math.ceil(window / 1000)) }, body: { error: 'Rate limit exceeded' }, latency: 0 }
    }

    valid.push(now)
    requests.set(key, valid)
    return next()
  }
}

// ============================================================================
// 3. 熔断器
// ============================================================================

export enum CircuitState { CLOSED, OPEN, HALF_OPEN }

export class CircuitBreaker {
  private state = CircuitState.CLOSED
  private failures = 0
  private lastFailureTime = 0
  private halfOpenCalls = 0

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.config.recoveryTimeout) {
        this.state = CircuitState.HALF_OPEN
        this.halfOpenCalls = 0
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (err) {
      this.onFailure()
      throw err
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenCalls++
      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
        this.state = CircuitState.CLOSED
        this.failures = 0
      }
    } else {
      this.failures = 0
    }
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.state === CircuitState.HALF_OPEN || this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN
    }
  }

  getState(): CircuitState {
    return this.state
  }
}

// ============================================================================
// 4. API Gateway 实现
// ============================================================================

export class ApiGateway {
  private routes: ServiceRoute[] = []
  private pipeline = new MiddlewarePipeline()
  private breakers = new Map<string, CircuitBreaker>()

  constructor() {
    this.pipeline.use(loggingMiddleware)
  }

  addRoute(route: ServiceRoute): void {
    this.routes.push(route)
    if (route.circuitBreaker) {
      this.breakers.set(route.path, new CircuitBreaker(route.circuitBreaker))
    }
  }

  use(middleware: Middleware): void {
    this.pipeline.use(middleware)
  }

  async handle(req: GatewayRequest): Promise<GatewayResponse> {
    return this.pipeline.execute(req, async () => {
      const route = this.matchRoute(req)
      if (!route) {
        return { status: 404, headers: {}, body: { error: 'Not found' }, latency: 0 }
      }

      const start = Date.now()
      try {
        const response = await this.forward(req, route)
        return { ...response, latency: Date.now() - start }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal error'
        return { status: 502, headers: {}, body: { error: message }, latency: Date.now() - start }
      }
    })
  }

  private matchRoute(req: GatewayRequest): ServiceRoute | undefined {
    return this.routes.find(r => {
      const pathMatch = req.path === r.path || req.path.startsWith(r.path + '/')
      const methodMatch = r.methods.includes(req.method) || r.methods.includes('*')
      return pathMatch && methodMatch
    })
  }

  private async forward(req: GatewayRequest, route: ServiceRoute): Promise<GatewayResponse> {
    const targetPath = route.stripPrefix
      ? req.path.replace(route.path, '') || '/'
      : req.path

    const forwardReq = { ...req, path: targetPath }

    const breaker = this.breakers.get(route.path)
    if (breaker) {
      return breaker.execute(() => this.callService(forwardReq, route))
    }

    return this.callService(forwardReq, route)
  }

  private async callService(req: GatewayRequest, route: ServiceRoute): Promise<GatewayResponse> {
    // 模拟服务调用
    console.log(`[Gateway] Forwarding ${req.method} ${req.path} → ${route.target}`)

    // 模拟延迟和响应
    await new Promise(r => setTimeout(r, Math.random() * 50))

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { service: route.target, path: req.path, requestId: req.requestId },
      latency: 0
    }
  }
}

// ============================================================================
// 5. Demo
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== API Gateway 模式演示 ===\n')

  const gateway = new ApiGateway()

  // 注册路由
  gateway.addRoute({
    path: '/api/users',
    methods: ['GET', 'POST'],
    target: 'http://user-service:3001',
    stripPrefix: true,
    circuitBreaker: { failureThreshold: 5, recoveryTimeout: 30000, halfOpenMaxCalls: 3 }
  })

  gateway.addRoute({
    path: '/api/orders',
    methods: ['GET', 'POST'],
    target: 'http://order-service:3002',
    stripPrefix: true
  })

  // 添加认证和限流
  gateway.use(authMiddleware(async (token) => {
    if (token === 'valid-token') return { userId: 'user-001' }
    return null
  }))

  gateway.use(rateLimitMiddleware({ windowMs: 60000, maxRequests: 100 }))

  console.log('1. 正常请求（带有效 Token）')
  const req1: GatewayRequest = {
    method: 'GET',
    path: '/api/users/profile',
    headers: { authorization: 'Bearer valid-token' },
    query: {},
    requestId: 'req-001'
  }
  const res1 = await gateway.handle(req1)
  console.log('  响应:', res1.status, res1.body)

  console.log('\n2. 未授权请求')
  const req2: GatewayRequest = {
    method: 'GET',
    path: '/api/users/profile',
    headers: {},
    query: {},
    requestId: 'req-002'
  }
  const res2 = await gateway.handle(req2)
  console.log('  响应:', res2.status, res2.body)

  console.log('\n3. 路由不存在')
  const req3: GatewayRequest = {
    method: 'GET',
    path: '/api/unknown',
    headers: { authorization: 'Bearer valid-token' },
    query: {},
    requestId: 'req-003'
  }
  const res3 = await gateway.handle(req3)
  console.log('  响应:', res3.status, res3.body)

  console.log('\n4. 熔断器演示')
  const breakerRoute: ServiceRoute = {
    path: '/api/flaky',
    methods: ['GET'],
    target: 'http://flaky-service:3003',
    circuitBreaker: { failureThreshold: 3, recoveryTimeout: 5000, halfOpenMaxCalls: 2 }
  }
  gateway.addRoute(breakerRoute)
  const breaker = new CircuitBreaker(breakerRoute.circuitBreaker!)

  for (let i = 0; i < 5; i++) {
    try {
      await breaker.execute(async () => {
        if (i < 3) throw new Error('Service down')
        return 'ok'
      })
      console.log(`  调用 ${i + 1}: 成功`)
    } catch {
      console.log(`  调用 ${i + 1}: 失败 (熔断器状态: ${breaker.getState()})`)
    }
  }

  console.log('\nAPI Gateway 要点:')
  console.log('- 统一入口，解耦客户端与微服务')
  console.log('- 中间件链处理横切关注点')
  console.log('- 熔断器防止级联故障')
  console.log('- 限流保护后端服务')
}
