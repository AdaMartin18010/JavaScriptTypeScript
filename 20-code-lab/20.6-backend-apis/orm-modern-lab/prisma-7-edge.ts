/**
 * @file Prisma 7 Edge Runtime 配置示例
 * @category ORM Modern Lab → Prisma 7 Edge
 * @difficulty medium
 * @tags prisma-7, edge, wasm, serverless, cloudflare-workers, vercel-edge
 *
 * @description
 * Prisma 7（2025.11 发布）彻底移除 Rust Query Engine 二进制依赖，改用 TypeScript/WASM 实现。
 * 本文件演示：
 * - Prisma 7 在 Edge Runtime（Cloudflare Workers / Vercel Edge / Deno Deploy）中的配置
 * - 与 Prisma 5/6 的差异（移除 Data Proxy）
 * - 驱动适配器（Driver Adapters）的使用
 * - 连接池与性能最佳实践
 * - 多环境配置（Node.js vs Edge）
 */

// ============================================================================
// 1. Prisma Schema（schema.prisma）
// ============================================================================

/**
 * ```prisma
 * generator client {
 *   provider = "prisma-client-js"
 * }
 *
 * datasource db {
 *   provider = "postgresql"
 *   url      = env("DATABASE_URL")
 * }
 *
 * model User {
 *   id        Int      @id @default(autoincrement())
 *   email     String   @unique
 *   name      String?
 *   posts     Post[]
 *   createdAt DateTime @default(now()) @map("created_at")
 *   updatedAt DateTime @updatedAt @map("updated_at")
 * }
 *
 * model Post {
 *   id       Int     @id @default(autoincrement())
 *   title    String
 *   content  String?
 *   published Boolean @default(false)
 *   author   User    @relation(fields: [authorId], references: [id])
 *   authorId Int     @map("author_id")
 * }
 * ```
 */

// ============================================================================
// 2. Prisma 7 Edge Runtime 客户端初始化
// ============================================================================

/**
 * Prisma 7 重大变化：
 * - Query Engine 从 Rust 二进制 → TypeScript/WASM
 * - bundle 大小从 ~14MB → ~1.6MB
 * - Edge Runtime 无需 Data Proxy，直连数据库
 * - 类型检查速度提升 ~70%
 *
 * 在 Edge Runtime 中，Prisma Client 使用 WASM 引擎 + 驱动适配器模式。
 */

// Cloudflare Workers 示例
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

/**
 * Cloudflare Workers + Neon (Serverless Postgres) 配置
 */
export function createPrismaClientForWorkers(env: { DATABASE_URL: string }) {
  // Neon serverless driver 使用 HTTP 而非 TCP，适合 Workers
  const pool = new Pool({ connectionString: env.DATABASE_URL })

  // Prisma 驱动适配器：将 Neon driver 桥接到 Prisma Client
  const adapter = new PrismaNeon(pool)

  // Prisma 7：直接传入 adapter，无需 binaryEngine 配置
  const prisma = new PrismaClient({ adapter })

  return prisma
}

// Vercel Edge + Turso (libSQL) 示例
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

/**
 * Vercel Edge + Turso 配置
 */
export function createPrismaClientForVercelEdge(env: {
  TURSO_DATABASE_URL: string
  TURSO_AUTH_TOKEN: string
}) {
  const libsql = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  })

  const adapter = new PrismaLibSQL(libsql)
  const prisma = new PrismaClient({ adapter })

  return prisma
}

// Node.js 环境（传统后端）示例
import { Pool as PgPool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * Node.js + PostgreSQL 配置
 * Prisma 7 在 Node.js 中同样使用 WASM 引擎，但可通过 adapter 使用原生 pg pool
 */
export function createPrismaClientForNode(env: { DATABASE_URL: string }) {
  const pool = new PgPool({ connectionString: env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  return prisma
}

// ============================================================================
// 3. 统一工厂函数（按运行时自动选择）
// ============================================================================

export type RuntimeEnv = 'node' | 'cloudflare-workers' | 'vercel-edge' | 'deno-deploy'

interface EnvConfig {
  DATABASE_URL?: string
  TURSO_DATABASE_URL?: string
  TURSO_AUTH_TOKEN?: string
}

/**
 * 根据运行环境自动创建对应的 Prisma Client
 * 这是实际项目中推荐的封装模式
 */
export function createPrismaClient(runtime: RuntimeEnv, env: EnvConfig) {
  switch (runtime) {
    case 'cloudflare-workers': {
      if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required for Neon')
      const { Pool: NeonPool } = require('@neondatabase/serverless')
      const { PrismaNeon: AdapterNeon } = require('@prisma/adapter-neon')
      const pool = new NeonPool({ connectionString: env.DATABASE_URL })
      return new PrismaClient({ adapter: new AdapterNeon(pool) })
    }

    case 'vercel-edge': {
      if (!env.TURSO_DATABASE_URL) throw new Error('TURSO_DATABASE_URL is required')
      const { createClient: createLibsqlClient } = require('@libsql/client')
      const { PrismaLibSQL: AdapterLibSQL } = require('@prisma/adapter-libsql')
      const libsql = createLibsqlClient({
        url: env.TURSO_DATABASE_URL,
        authToken: env.TURSO_AUTH_TOKEN,
      })
      return new PrismaClient({ adapter: new AdapterLibSQL(libsql) })
    }

    case 'node':
    default: {
      if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required')
      const { Pool: PgPoolNode } = require('pg')
      const { PrismaPg: AdapterPg } = require('@prisma/adapter-pg')
      const pool = new PgPoolNode({ connectionString: env.DATABASE_URL })
      return new PrismaClient({ adapter: new AdapterPg(pool) })
    }
  }
}

// ============================================================================
// 4. Edge Handler 示例
// ============================================================================

/**
 * Cloudflare Workers Handler（Prisma 7 + Neon）
 */
export async function handleCloudflareRequest(
  request: Request,
  env: { DATABASE_URL: string }
): Promise<Response> {
  const prisma = createPrismaClientForWorkers(env)

  try {
    // 读取操作
    const users = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { posts: { where: { published: true } } },
    })

    return new Response(JSON.stringify({ users }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Vercel Edge API Route（Prisma 7 + Turso）
 */
export async function handleVercelEdgeRequest(
  request: Request,
  env: { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN: string }
): Promise<Response> {
  const prisma = createPrismaClientForVercelEdge(env)

  try {
    // 写入操作（注意：Turso 写操作路由到主库）
    if (request.method === 'POST') {
      const body = await request.json() as { email: string; name?: string }
      const user = await prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
        },
      })
      return new Response(JSON.stringify({ user }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 读取操作（可路由到边缘副本）
    const users = await prisma.user.findMany({ take: 20 })
    return new Response(JSON.stringify({ users }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// ============================================================================
// 5. 性能最佳实践
// ============================================================================

/**
 * Prisma 7 Edge 性能优化建议：
 *
 * 1. 连接复用：
 *    - Neon Serverless Driver 自动通过 HTTP 复用连接
 *    - Turso/libSQL 通过本地副本减少延迟
 *    - 避免在请求中频繁创建/断开 Prisma Client
 *
 * 2. 查询优化：
 *    - 始终使用 `take` / `skip` 限制返回数据量
 *    - Edge 环境内存有限，避免大结果集的 `include` 嵌套
 *    - 使用 `select` 精确选择所需字段
 *
 * 3. 缓存策略：
 *    - 读密集型数据使用 Cloudflare Cache API 或 Vercel Edge Config
 *    - 对静态列表使用 stale-while-revalidate
 *
 * 4. 错误处理：
 *    - Edge Runtime 对未捕获异常敏感，务必包裹 try/catch
 *    - 使用 `prisma.$disconnect()` 清理资源
 */

// ============================================================================
// 6. Prisma 7 vs Prisma 5/6 差异速查
// ============================================================================

/**
 * | 特性 | Prisma 5/6 | Prisma 7 |
 * |------|-----------|----------|
 * | Query Engine | Rust 二进制 (~14MB) | TypeScript/WASM (~1.6MB) |
 * | Edge 支持 | 需 Data Proxy | 原生支持（通过 Adapter） |
 * | 类型检查 | 标准 | 快 ~70% |
 * | 部署复杂度 | 高（多平台二进制） | 低（单 JS/WASM bundle） |
 * | 连接方式 | 直接 TCP | 通过 Driver Adapter |
 * | 环境变量 | PRISMA_QUERY_ENGINE_BINARY | 无需（已移除） |
 * | Bundle Size | ~14MB+ | ~1.6MB |
 */

// ============================================================================
// 7. 演示入口
// ============================================================================

export function demo(): void {
  console.log('=== Prisma 7 Edge Runtime 配置 ===\n')

  console.log('核心变化:')
  console.log('- Query Engine: Rust 二进制 → TypeScript/WASM')
  console.log('- Bundle 大小: ~14MB → ~1.6MB')
  console.log('- Edge 支持: Data Proxy → 原生适配器模式')
  console.log('- 类型检查速度提升: ~70%')

  console.log('\n适配器列表:')
  console.log('- @prisma/adapter-pg      → Node.js + PostgreSQL')
  console.log('- @prisma/adapter-neon    → Cloudflare Workers + Neon')
  console.log('- @prisma/adapter-libsql  → Vercel Edge + Turso')
  console.log('- @prisma/adapter-planetscale → PlanetScale (MySQL)')

  console.log('\n环境配置要点:')
  console.log('- 移除 PRISMA_QUERY_ENGINE_* 环境变量')
  console.log('- 安装对应数据库的 serverless driver')
  console.log('- 通过 adapter 参数传入 PrismaClient')

  console.log('\n最佳实践:')
  console.log('- Edge 环境内存有限，限制查询结果集')
  console.log('- 使用 select 精确选择字段，避免大 include')
  console.log('- 读多写少场景配合边缘缓存')
  console.log('- 务必处理 disconnect 和异常')
}
