/**
 * @file 全栈数据流模式
 * @category Fullstack Patterns → Data Flow
 * @difficulty hard
 * @tags server-components, trpc, server-actions, data-flow
 *
 * @description
 * 现代全栈应用的数据流模式：Server Component → Client Component 数据流、
 * tRPC 风格类型安全路由、Server Action 模式。
 */

// ============================================================================
// 1. 类型安全的 API Router (tRPC 风格模拟)
// ============================================================================

export type ProcedureType = 'query' | 'mutation' | 'subscription'

export interface Procedure<Input, Output> {
  type: ProcedureType
  resolver: (input: Input, ctx: Context) => Promise<Output>
  inputValidator?: (input: unknown) => Input
}

export interface Context {
  userId?: string
  requestId: string
  headers: Record<string, string>
}

export class TypeSafeRouter {
  private procedures = new Map<string, Procedure<unknown, unknown>>()

  query<Input, Output>(
    name: string,
    config: { resolver: (input: Input, ctx: Context) => Promise<Output>; input?: (input: unknown) => Input }
  ): void {
    this.procedures.set(name, {
      type: 'query',
      resolver: config.resolver as (input: unknown, ctx: Context) => Promise<unknown>,
      inputValidator: config.input
    })
  }

  mutation<Input, Output>(
    name: string,
    config: { resolver: (input: Input, ctx: Context) => Promise<Output>; input?: (input: unknown) => Input }
  ): void {
    this.procedures.set(name, {
      type: 'mutation',
      resolver: config.resolver as (input: unknown, ctx: Context) => Promise<unknown>,
      inputValidator: config.input
    })
  }

  async call(name: string, input: unknown, ctx: Context): Promise<unknown> {
    const proc = this.procedures.get(name)
    if (!proc) throw new Error(`Procedure not found: ${name}`)

    const validated = proc.inputValidator ? proc.inputValidator(input) : input
    return proc.resolver(validated, ctx)
  }

  getRouterTypes(): Record<string, ProcedureType> {
    const types: Record<string, ProcedureType> = {}
    for (const [name, proc] of this.procedures) {
      types[name] = proc.type
    }
    return types
  }
}

// ============================================================================
// 2. Server Component → Client Component 数据流
// ============================================================================

export interface ServerComponentProps<T> {
  data: T
  streaming?: boolean
}

export interface ClientComponentProps<T> {
  initialData: T
  onUpdate?: (data: T) => void
}

// 模拟 React Server Component 的数据获取
export class ServerComponentDataFlow {
  // Server 端：直接查询数据库/内部服务
  async fetchProductPage(productId: string): Promise<{
    product: { id: string; name: string; price: number }
    reviews: Array<{ user: string; rating: number; comment: string }>
    relatedProducts: Array<{ id: string; name: string }>
  }> {
    // 在服务器端直接访问数据库，无需 HTTP API
    console.log(`[Server] Fetching product ${productId} from database`)

    return {
      product: { id: productId, name: '示例商品', price: 299 },
      reviews: [
        { user: '用户A', rating: 5, comment: '非常好' },
        { user: '用户B', rating: 4, comment: '不错' }
      ],
      relatedProducts: [
        { id: 'rel-1', name: '相关商品1' },
        { id: 'rel-2', name: '相关商品2' }
      ]
    }
  }

  // 流式数据：先返回骨架，再填充
  async *streamProductPage(productId: string): AsyncGenerator<unknown> {
    // 第一帧：产品基础信息（快速返回）
    yield { type: 'product', data: { id: productId, name: '示例商品', price: 299 } }

    await new Promise(r => setTimeout(r, 100))

    // 第二帧：评论（稍慢）
    yield {
      type: 'reviews',
      data: [
        { user: '用户A', rating: 5, comment: '非常好' },
        { user: '用户B', rating: 4, comment: '不错' }
      ]
    }

    await new Promise(r => setTimeout(r, 100))

    // 第三帧：相关推荐（最慢）
    yield {
      type: 'related',
      data: [
        { id: 'rel-1', name: '相关商品1' },
        { id: 'rel-2', name: '相关商品2' }
      ]
    }
  }
}

// ============================================================================
// 3. Server Action 模式
// ============================================================================

export interface ServerAction<TInput, TOutput> {
  (input: TInput): Promise<TOutput>
  $$typeof: 'server-action'
  actionId: string
}

export class ServerActionRegistry {
  private actions = new Map<string, (input: unknown) => Promise<unknown>>()

  register<TInput, TOutput>(
    id: string,
    handler: (input: TInput) => Promise<TOutput>
  ): ServerAction<TInput, TOutput> {
    this.actions.set(id, handler as (input: unknown) => Promise<unknown>)

    const action = async (input: TInput): Promise<TOutput> => {
      // 模拟服务器端执行
      console.log(`[Server Action] Executing ${id}`)
      return handler(input)
    }

    return Object.assign(action, {
      $$typeof: 'server-action' as const,
      actionId: id
    })
  }

  async execute(actionId: string, input: unknown): Promise<unknown> {
    const handler = this.actions.get(actionId)
    if (!handler) throw new Error(`Server action not found: ${actionId}`)
    return handler(input)
  }
}

// 表单处理 Server Action
export interface FormState {
  success: boolean
  errors?: Record<string, string[]>
  message?: string
}

export function createFormAction<T>(
  registry: ServerActionRegistry,
  validator: (data: unknown) => { valid: true; data: T } | { valid: false; errors: Record<string, string[]> },
  handler: (data: T) => Promise<FormState>
): ServerAction<unknown, FormState> {
  return registry.register(`form-${Date.now()}`, async (input: unknown) => {
    const validation = validator(input)
    if (!validation.valid) {
      return { success: false, errors: validation.errors }
    }
    return handler(validation.data)
  })
}

// ============================================================================
// 4. GraphQL Resolver 组合
// ============================================================================

export interface GraphQLResolver<TSource, TArgs, TContext, TOutput> {
  (source: TSource, args: TArgs, context: TContext): Promise<TOutput>
}

export class ResolverComposer {
  private resolvers = new Map<string, GraphQLResolver<unknown, unknown, Context, unknown>>()

  addQuery<TArgs, TOutput>(
    name: string,
    resolver: GraphQLResolver<null, TArgs, Context, TOutput>
  ): void {
    this.resolvers.set(`Query.${name}`, resolver as GraphQLResolver<unknown, unknown, Context, unknown>)
  }

  addMutation<TArgs, TOutput>(
    name: string,
    resolver: GraphQLResolver<null, TArgs, Context, TOutput>
  ): void {
    this.resolvers.set(`Mutation.${name}`, resolver as GraphQLResolver<unknown, unknown, Context, unknown>)
  }

  addField<TSource, TOutput>(
    type: string,
    field: string,
    resolver: GraphQLResolver<TSource, Record<string, never>, Context, TOutput>
  ): void {
    this.resolvers.set(`${type}.${field}`, resolver as GraphQLResolver<unknown, unknown, Context, unknown>)
  }

  async resolve(path: string, source: unknown, args: unknown, ctx: Context): Promise<unknown> {
    const resolver = this.resolvers.get(path)
    if (!resolver) throw new Error(`Resolver not found: ${path}`)
    return resolver(source, args, ctx)
  }
}

// ============================================================================
// 5. Demo
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== 全栈数据流模式演示 ===\n')

  console.log('1. tRPC 风格类型安全路由')
  const router = new TypeSafeRouter()

  router.query('user.getById', {
    input: (input: unknown) => {
      if (typeof input !== 'object' || input === null) throw new Error('Invalid input')
      const id = (input as Record<string, unknown>).id
      if (typeof id !== 'string') throw new Error('id must be string')
      return { id }
    },
    resolver: async ({ id }, ctx) => {
      console.log(`  [Resolver] user.getById(${id}), requestId=${ctx.requestId}`)
      return { id, name: '张三', email: 'zhangsan@example.com' }
    }
  })

  router.mutation('user.updateProfile', {
    input: (input: unknown) => {
      const data = input as Record<string, unknown>
      return { name: String(data.name), bio: String(data.bio) }
    },
    resolver: async (input, ctx) => {
      console.log(`  [Resolver] user.updateProfile`, input)
      return { success: true, updatedFields: Object.keys(input) }
    }
  })

  const ctx: Context = { requestId: 'req-001', headers: {} }
  const user = await router.call('user.getById', { id: 'user-001' }, ctx)
  console.log('  查询结果:', user)

  const update = await router.call('user.updateProfile', { name: '李四', bio: 'Hello' }, ctx)
  console.log('  更新结果:', update)

  console.log('\n2. Server Component 数据流')
  const serverFlow = new ServerComponentDataFlow()

  // 直接服务器端获取（无 HTTP 开销）
  const pageData = await serverFlow.fetchProductPage('prod-001')
  console.log('  商品页数据:', {
    product: pageData.product.name,
    reviewCount: pageData.reviews.length,
    relatedCount: pageData.relatedProducts.length
  })

  console.log('\n3. 流式数据')
  for await (const chunk of serverFlow.streamProductPage('prod-001')) {
    console.log('  流式帧:', (chunk as Record<string, unknown>).type)
  }

  console.log('\n4. Server Action')
  const registry = new ServerActionRegistry()

  const submitContact = registry.register('submit-contact', async (input: unknown) => {
    const data = input as { name: string; email: string; message: string }
    console.log(`  [Server Action] 收到联系表单: ${data.name} <${data.email}>`)
    return { success: true, message: '感谢您的留言！' }
  })

  const result = await submitContact({
    name: '王五',
    email: 'wangwu@example.com',
    message: '你好，我对你们的产品感兴趣。'
  })
  console.log('  Server Action 结果:', result)

  console.log('\n5. GraphQL Resolver 组合')
  const gql = new ResolverComposer()

  gql.addQuery('users', async (_source, args, ctx) => {
    console.log(`  [GraphQL] Query.users, requestId=${ctx.requestId}`)
    return [{ id: '1', name: '张三' }]
  })

  gql.addField('User', 'email', async (source, _args, ctx) => {
    console.log(`  [GraphQL] Resolve User.email for ${(source as { name: string }).name}`)
    return 'zhangsan@example.com'
  })

  const users = await gql.resolve('Query.users', null, {}, ctx)
  console.log('  GraphQL 查询结果:', users)

  console.log('\n全栈数据流要点:')
  console.log('- Server Component 减少客户端 JS 和请求数')
  console.log('- tRPC 提供端到端类型安全')
  console.log('- Server Action 简化表单和突变')
  console.log('- GraphQL 灵活聚合多数据源')
}
