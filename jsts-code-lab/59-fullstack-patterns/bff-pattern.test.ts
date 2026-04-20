import { describe, it, expect } from 'vitest'
import { BffService, ApiGateway, RequestContext } from './bff-pattern'

describe('BFF Pattern', () => {
  const createContext = (device: RequestContext['device']): RequestContext => ({
    device,
    userId: 'user-001',
    locale: 'zh-CN',
    networkQuality: 'fast'
  })

  it('should build web dashboard with full data', async () => {
    const bff = new BffService()
    const ctx = createContext('web')
    const dash = await bff.getDashboard(ctx) as { user: { name: string }; recentOrders: unknown[]; recommendations: unknown[]; stats: unknown }

    expect(dash.user.name).toBe('张三')
    expect(dash.recentOrders.length).toBeGreaterThan(0)
    expect(dash.recommendations.length).toBeGreaterThan(0)
    expect(dash.stats).toHaveProperty('totalSpent')
  })

  it('should build mobile dashboard with reduced data', async () => {
    const bff = new BffService()
    const ctx = createContext('mobile')
    const dash = await bff.getDashboard(ctx) as { user: { name: string }; orders: unknown[]; quickActions: string[] }

    expect(dash.user.name).toBe('张三')
    expect(dash.orders.length).toBeGreaterThan(0)
    expect(dash.quickActions).toContain('下单')
  })

  it('should adapt to slow network', async () => {
    const bff = new BffService()
    const ctx: RequestContext = { ...createContext('web'), networkQuality: 'slow' }
    const dash = await bff.getDashboardAdaptive(ctx)

    expect(dash).toHaveProperty('user')
  })
})

describe('API Gateway', () => {
  it('should route requests to correct service', async () => {
    const gateway = new ApiGateway()
    gateway.addRoute({ path: '/api/users', methods: ['GET'], target: 'user-service' })

    const res = await gateway.handle({
      method: 'GET',
      path: '/api/users',
      headers: {},
      query: {},
      requestId: 'req-1'
    })

    expect(res.status).toBe(200)
  })

  it('should return 404 for unknown routes', async () => {
    const gateway = new ApiGateway()
    const res = await gateway.handle({
      method: 'GET',
      path: '/api/unknown',
      headers: {},
      query: {},
      requestId: 'req-2'
    })

    expect(res.status).toBe(404)
  })
})
