/**
 * @file BFF (Backend-for-Frontend) 模式
 * @category Fullstack Patterns → BFF
 * @difficulty medium
 * @tags bff, api-gateway, frontend-backend, aggregation
 *
 * @description
 * BFF 模式：为每个前端客户端（Web、Mobile、Admin）定制专属后端，
 * 解决通用 API 与前端需求不匹配的问题。
 */

// ============================================================================
// 1. 设备类型与请求上下文
// ============================================================================

export type DeviceType = 'web' | 'mobile' | 'admin' | 'iot'

export interface RequestContext {
  device: DeviceType
  userId: string
  locale: string
  networkQuality: 'fast' | 'slow' | 'offline'
  screenSize?: { width: number; height: number }
}

// ============================================================================
// 2. 领域模型（模拟下游服务返回的数据）
// ============================================================================

interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  department: string
  createdAt: Date
  updatedAt: Date
  preferences: Record<string, unknown>
}

interface Order {
  id: string
  userId: string
  items: Array<{ productId: string; quantity: number; price: number }>
  status: 'pending' | 'paid' | 'shipped' | 'delivered'
  total: number
  shippingAddress: Record<string, string>
  createdAt: Date
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  inventory: number
  metadata: Record<string, unknown>
}

// ============================================================================
// 3. BFF 响应模型（按设备定制）
// ============================================================================

export interface WebDashboard {
  user: Pick<User, 'id' | 'name' | 'email' | 'avatar'>
  recentOrders: Array<Pick<Order, 'id' | 'status' | 'total' | 'createdAt'>>
  recommendations: Array<Pick<Product, 'id' | 'name' | 'price' | 'images'>>
  stats: { totalSpent: number; orderCount: number }
}

export interface MobileDashboard {
  user: Pick<User, 'name' | 'avatar'>
  orders: Array<{ id: string; status: string; itemCount: number; total: number }>
  quickActions: string[]
}

export interface AdminDashboard {
  user: Pick<User, 'id' | 'name' | 'role'>
  allOrders: Order[]
  products: Product[]
  analytics: { revenue: number; activeUsers: number; conversionRate: number }
}

// ============================================================================
// 4. 下游服务客户端（模拟）
// ============================================================================

class DownstreamService {
  async getUser(userId: string): Promise<User> {
    return {
      id: userId,
      name: '张三',
      email: 'zhangsan@example.com',
      avatar: 'https://cdn.example.com/avatar.jpg',
      role: 'user',
      department: 'Engineering',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-06-01'),
      preferences: { theme: 'dark', notifications: true }
    }
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return [
      {
        id: 'ord-001',
        userId,
        items: [{ productId: 'prod-1', quantity: 2, price: 99 }],
        status: 'delivered',
        total: 198,
        shippingAddress: { city: '北京', street: '中关村大街1号' },
        createdAt: new Date('2024-05-01')
      },
      {
        id: 'ord-002',
        userId,
        items: [{ productId: 'prod-2', quantity: 1, price: 299 }],
        status: 'shipped',
        total: 299,
        shippingAddress: { city: '上海', street: '陆家嘴环路2号' },
        createdAt: new Date('2024-06-10')
      }
    ]
  }

  async getRecommendations(userId: string): Promise<Product[]> {
    return [
      { id: 'prod-3', name: '无线耳机', description: '降噪耳机', price: 399, images: ['img1.jpg'], category: 'electronics', inventory: 100, metadata: {} },
      { id: 'prod-4', name: '机械键盘', description: 'RGB键盘', price: 599, images: ['img2.jpg'], category: 'electronics', inventory: 50, metadata: {} }
    ]
  }

  async getAnalytics(): Promise<AdminDashboard['analytics']> {
    return { revenue: 150000, activeUsers: 3420, conversionRate: 0.034 }
  }
}

// ============================================================================
// 5. BFF 服务实现
// ============================================================================

export class BffService {
  private downstream = new DownstreamService()

  async getDashboard(ctx: RequestContext): Promise<WebDashboard | MobileDashboard | AdminDashboard> {
    switch (ctx.device) {
      case 'web':
        return this.buildWebDashboard(ctx)
      case 'mobile':
        return this.buildMobileDashboard(ctx)
      case 'admin':
        return this.buildAdminDashboard(ctx)
      default:
        return this.buildWebDashboard(ctx)
    }
  }

  private async buildWebDashboard(ctx: RequestContext): Promise<WebDashboard> {
    const [user, orders, recommendations] = await Promise.all([
      this.downstream.getUser(ctx.userId),
      this.downstream.getUserOrders(ctx.userId),
      this.downstream.getRecommendations(ctx.userId)
    ])

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      recentOrders: orders.slice(0, 5).map(o => ({
        id: o.id,
        status: o.status,
        total: o.total,
        createdAt: o.createdAt
      })),
      recommendations: recommendations.slice(0, 4).map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        images: p.images.slice(0, 2)
      })),
      stats: {
        totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
        orderCount: orders.length
      }
    }
  }

  private async buildMobileDashboard(ctx: RequestContext): Promise<MobileDashboard> {
    const [user, orders] = await Promise.all([
      this.downstream.getUser(ctx.userId),
      this.downstream.getUserOrders(ctx.userId)
    ])

    // 移动端：精简数据，减少传输量
    return {
      user: { name: user.name, avatar: user.avatar },
      orders: orders.map(o => ({
        id: o.id,
        status: o.status,
        itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
        total: o.total
      })),
      quickActions: ['下单', '查物流', '联系客服', '退款']
    }
  }

  private async buildAdminDashboard(ctx: RequestContext): Promise<AdminDashboard> {
    const [user, orders, analytics] = await Promise.all([
      this.downstream.getUser(ctx.userId),
      this.downstream.getUserOrders(ctx.userId),
      this.downstream.getAnalytics()
    ])

    return {
      user: { id: user.id, name: user.name, role: user.role },
      allOrders: orders,
      products: [], // admin 可能有独立的产品管理接口
      analytics
    }
  }

  // 网络质量自适应：慢网络返回更少数据
  async getDashboardAdaptive(ctx: RequestContext): Promise<unknown> {
    if (ctx.networkQuality === 'slow') {
      // 仅返回核心数据
      const user = await this.downstream.getUser(ctx.userId)
      return { user: { name: user.name }, orders: [] }
    }
    return this.getDashboard(ctx)
  }
}

// ============================================================================
// 6. API Gateway 组合模式
// ============================================================================

export class ApiGateway {
  private bffServices = new Map<DeviceType, BffService>()

  registerBff(device: DeviceType, service: BffService): void {
    this.bffServices.set(device, service)
  }

  async route(ctx: RequestContext): Promise<unknown> {
    const service = this.bffServices.get(ctx.device) ?? new BffService()
    return service.getDashboard(ctx)
  }
}

// ============================================================================
// 7. Demo
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== BFF 模式演示 ===\n')

  const bff = new BffService()

  console.log('1. Web 端 Dashboard')
  const webCtx: RequestContext = {
    device: 'web',
    userId: 'user-001',
    locale: 'zh-CN',
    networkQuality: 'fast'
  }
  const webDash = await bff.getDashboard(webCtx) as WebDashboard
  console.log('  用户:', webDash.user.name)
  console.log('  最近订单数:', webDash.recentOrders.length)
  console.log('  推荐商品数:', webDash.recommendations.length)
  console.log('  消费统计:', webDash.stats)

  console.log('\n2. Mobile 端 Dashboard')
  const mobileCtx: RequestContext = { ...webCtx, device: 'mobile' }
  const mobileDash = await bff.getDashboard(mobileCtx) as MobileDashboard
  console.log('  用户:', mobileDash.user.name)
  console.log('  订单数:', mobileDash.orders.length)
  console.log('  快捷操作:', mobileDash.quickActions)

  console.log('\n3. Admin 端 Dashboard')
  const adminCtx: RequestContext = { ...webCtx, device: 'admin' }
  const adminDash = await bff.getDashboard(adminCtx) as AdminDashboard
  console.log('  用户:', adminDash.user.name, '角色:', adminDash.user.role)
  console.log('  分析数据:', adminDash.analytics)

  console.log('\n4. 慢网络自适应')
  const slowCtx: RequestContext = { ...webCtx, networkQuality: 'slow' }
  const adaptive = await bff.getDashboardAdaptive(slowCtx)
  console.log('  自适应结果:', JSON.stringify(adaptive))

  console.log('\nBFF 模式要点:')
  console.log('- 每个前端有自己的后端适配层')
  console.log('- 数据聚合减少前端请求数')
  console.log('- 数据裁剪减少传输量')
  console.log('- 网络自适应优化体验')
}
