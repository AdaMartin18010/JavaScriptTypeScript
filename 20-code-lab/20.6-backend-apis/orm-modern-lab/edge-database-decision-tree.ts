/**
 * @file 边缘数据库决策树代码示例
 * @category ORM Modern Lab → Edge Database Decision Tree
 * @difficulty medium
 * @tags edge-database, decision-tree, turso, d1, neon, drizzle, architecture
 *
 * @description
 * 本文件提供可执行的边缘数据库选型决策逻辑，以及多平台统一数据库层封装。
 * 覆盖：
 * - 基于项目特征的自动化选型推荐
 * - 多边缘数据库的统一抽象层
 * - 运行时环境自动检测与适配
 * - 成本估算与冷启动预测
 */

// ============================================================================
// 1. 项目特征模型
// ============================================================================

/** 项目特征，用于驱动选型决策 */
export interface ProjectProfile {
  /** 部署平台 */
  platform: 'cloudflare-workers' | 'vercel-edge' | 'deno-deploy' | 'aws-lambda' | 'nodejs'
  /** 预估数据量 */
  dataSize: 'small' | 'medium' | 'large' // < 1GB, 1-10GB, > 10GB
  /** 查询复杂度 */
  queryComplexity: 'simple' | 'moderate' | 'complex'
  /** 读写比例 */
  readWriteRatio: 'read-heavy' | 'balanced' | 'write-heavy'
  /** 是否需要完整 PostgreSQL 功能 */
  needsPostgres: boolean
  /** 是否已有 MySQL 生态 */
  hasMysqlEcosystem: boolean
  /** 是否需要多租户 */
  multiTenant: boolean
  /** 全球用户分布 */
  globalUsers: boolean
  /** 预算敏感度 */
  budget: 'free-tier' | 'moderate' | 'enterprise'
  /** 事务复杂度 */
  transactionComplexity: 'simple' | 'complex'
}

// ============================================================================
// 2. 边缘数据库选型决策树（可执行代码）
// ============================================================================

export interface DatabaseRecommendation {
  database: 'turso' | 'cloudflare-d1' | 'neon' | 'planetscale' | 'supabase' | 'sqlite-cloud'
  orm: 'drizzle' | 'prisma7'
  driver: string
  confidence: 'high' | 'medium' | 'low'
  reasons: string[]
  warnings: string[]
  estimatedColdStartMs: number
  estimatedMonthlyCost: 'free' | 'low' | 'medium' | 'high'
}

/**
 * 基于项目特征的选型决策函数
 */
export function recommendEdgeDatabase(profile: ProjectProfile): DatabaseRecommendation {
  const reasons: string[] = []
  const warnings: string[] = []

  // 决策路径 1：Cloudflare 生态内优先 D1
  if (profile.platform === 'cloudflare-workers') {
    if (profile.dataSize !== 'large' && profile.queryComplexity !== 'complex') {
      reasons.push('Cloudflare D1 与 Workers 原生绑定，零网络开销')
      reasons.push('D1 在 CF 生态内有最低延迟（< 5ms）')
      return {
        database: 'cloudflare-d1',
        orm: 'drizzle',
        driver: 'drizzle-orm/d1',
        confidence: 'high',
        reasons,
        warnings: profile.dataSize === 'medium'
          ? ['D1 存储上限 500GB，长期需评估升级']
          : [],
        estimatedColdStartMs: 5,
        estimatedMonthlyCost: profile.dataSize === 'small' ? 'free' : 'low',
      }
    }
    warnings.push('数据量大或查询复杂，D1 可能受限')
  }

  // 决策路径 2：需要完整 PostgreSQL → Neon
  if (profile.needsPostgres || profile.queryComplexity === 'complex') {
    reasons.push('Neon 提供完整 PostgreSQL 兼容性（JSONB、数组、CTE、窗口函数）')
    reasons.push('Serverless HTTP driver 适合边缘环境')
    return {
      database: 'neon',
      orm: profile.platform === 'nodejs' ? 'prisma7' : 'drizzle',
      driver: '@neondatabase/serverless',
      confidence: 'high',
      reasons,
      warnings: profile.globalUsers
        ? ['Neon 读取延迟高于边缘副本数据库（~50-150ms vs < 50ms）']
        : [],
      estimatedColdStartMs: profile.platform === 'cloudflare-workers' ? 100 : 50,
      estimatedMonthlyCost: profile.dataSize === 'small' ? 'free' : 'medium',
    }
  }

  // 决策路径 3：多租户 + 全球用户 → Turso
  if (profile.multiTenant && profile.globalUsers) {
    reasons.push('Turso 支持 500 个免费数据库，天然适合多租户')
    reasons.push('全球边缘副本提供 < 50ms 读取延迟')
    reasons.push('写主读副架构适合读多写少的 SaaS')
    return {
      database: 'turso',
      orm: 'drizzle',
      driver: '@libsql/client',
      confidence: 'high',
      reasons,
      warnings: profile.writeHeavy
        ? ['Turso 写吞吐受限于单主库，写密集型场景需谨慎']
        : [],
      estimatedColdStartMs: 20,
      estimatedMonthlyCost: profile.dataSize === 'small' ? 'free' : 'low',
    }
  }

  // 决策路径 4：已有 MySQL 生态 → PlanetScale
  if (profile.hasMysqlEcosystem) {
    reasons.push('PlanetScale 基于 Vitess，完全兼容 MySQL')
    reasons.push('强大的数据库分支工作流（Git-like branching）')
    return {
      database: 'planetscale',
      orm: 'drizzle',
      driver: '@planetscale/database',
      confidence: 'medium',
      reasons,
      warnings: [
        'PlanetScale 无免费 tier（最低 $39/月）',
        'Edge 场景集成度不如 Turso/D1/Neon',
      ],
      estimatedColdStartMs: 80,
      estimatedMonthlyCost: 'medium',
    }
  }

  // 决策路径 5：全栈平台需求 → Supabase
  if (profile.platform === 'vercel-edge' && profile.budget === 'moderate') {
    reasons.push('Supabase 提供 PostgreSQL + Auth + Realtime + Storage 全栈方案')
    reasons.push('RLS 行级安全与认证深度集成')
    return {
      database: 'supabase',
      orm: 'drizzle',
      driver: '@supabase/supabase-js',
      confidence: 'medium',
      reasons,
      warnings: ['供应商锁定度较高，数据迁移出 Supabase 需额外工作'],
      estimatedColdStartMs: 60,
      estimatedMonthlyCost: 'low',
    }
  }

  // 默认路径：小型项目 / 通用推荐
  if (profile.dataSize === 'small' && profile.queryComplexity === 'simple') {
    reasons.push('Turso 免费 tier  generous（500 DB），适合快速启动')
    reasons.push('Drizzle + libSQL 是最轻量的边缘组合')
    return {
      database: 'turso',
      orm: 'drizzle',
      driver: '@libsql/client',
      confidence: 'high',
      reasons,
      warnings: [],
      estimatedColdStartMs: 20,
      estimatedMonthlyCost: 'free',
    }
  }

  // 兜底：中型通用项目
  reasons.push('Neon 提供最均衡的功能与边缘兼容性')
  reasons.push('永久免费 tier 对中型项目友好')
  return {
    database: 'neon',
    orm: 'drizzle',
    driver: '@neondatabase/serverless',
    confidence: 'medium',
    reasons,
    warnings: ['如数据量保持小型，Turso 可能更经济'],
    estimatedColdStartMs: 80,
    estimatedMonthlyCost: 'low',
  }
}

// ============================================================================
// 3. 统一数据库抽象层
// ============================================================================

/**
 * 统一的边缘数据库接口，屏蔽底层差异
 */
export interface UnifiedEdgeDB {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>
  execute(sql: string, params?: unknown[]): Promise<{ rowsAffected: number }>
  transaction<T>(fn: (tx: UnifiedEdgeDB) => Promise<T>): Promise<T>
}

/** 数据库配置 */
export type EdgeDBConfig =
  | { provider: 'turso'; url: string; authToken: string }
  | { provider: 'd1'; binding: D1Database }
  | { provider: 'neon'; connectionString: string }

/**
 * Turso 适配器
 */
async function createTursoAdapter(config: { url: string; authToken: string }): Promise<UnifiedEdgeDB> {
  const { createClient } = await import('@libsql/client')
  const client = createClient(config)

  return {
    async query(sql, params = []) {
      const result = await client.execute({ sql, args: params })
      return result.rows as unknown[]
    },
    async execute(sql, params = []) {
      const result = await client.execute({ sql, args: params })
      return { rowsAffected: result.rowsAffected }
    },
    async transaction(fn) {
      const tx = await client.transaction('write')
      try {
        const result = await fn({
          async query(sql, params = []) {
            const r = await tx.execute({ sql, args: params })
            return r.rows as unknown[]
          },
          async execute(sql, params = []) {
            const r = await tx.execute({ sql, args: params })
            return { rowsAffected: r.rowsAffected }
          },
          async transaction() { throw new Error('嵌套事务不支持') },
        })
        await tx.commit()
        return result
      } catch (error) {
        await tx.rollback()
        throw error
      }
    },
  }
}

/**
 * D1 适配器
 */
async function createD1Adapter(config: { binding: D1Database }): Promise<UnifiedEdgeDB> {
  const db = config.binding

  return {
    async query(sql, params = []) {
      const stmt = db.prepare(sql)
      const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all()
      return (result.results ?? []) as unknown[]
    },
    async execute(sql, params = []) {
      const stmt = db.prepare(sql)
      const result = params.length > 0 ? await stmt.bind(...params).run() : await stmt.run()
      return { rowsAffected: result.meta?.changes ?? 0 }
    },
    async transaction(fn) {
      // D1 的 batch 可作为简化事务
      await fn({
        async query(sql, params = []) {
          const stmt = db.prepare(sql)
          const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all()
          return (result.results ?? []) as unknown[]
        },
        async execute(sql, params = []) {
          const stmt = db.prepare(sql)
          const result = params.length > 0 ? await stmt.bind(...params).run() : await stmt.run()
          return { rowsAffected: result.meta?.changes ?? 0 }
        },
        async transaction() { throw new Error('D1 不支持嵌套事务') },
      })
      return undefined as unknown
    },
  }
}

/**
 * Neon 适配器
 */
async function createNeonAdapter(config: { connectionString: string }): Promise<UnifiedEdgeDB> {
  const { neon } = await import('@neondatabase/serverless')
  const sql = neon(config.connectionString)

  return {
    async query(sqlStr, params = []) {
      // 简单参数替换（生产环境需使用参数化查询）
      const result = await sql(sqlStr, params)
      return Array.isArray(result) ? result : [result]
    },
    async execute(sqlStr, params = []) {
      await sql(sqlStr, params)
      return { rowsAffected: 1 }
    },
    async transaction(fn) {
      // Neon serverless 无状态，事务需通过 SQL 实现
      await sql`BEGIN`
      try {
        const result = await fn({
          async query(s, p = []) { return this.query(s, p) },
          async execute(s, p = []) { return this.execute(s, p) },
          async transaction() { throw new Error('嵌套事务不支持') },
        } as UnifiedEdgeDB)
        await sql`COMMIT`
        return result
      } catch (error) {
        await sql`ROLLBACK`
        throw error
      }
    },
  }
}

/**
 * 统一工厂函数
 */
export async function createEdgeDB(config: EdgeDBConfig): Promise<UnifiedEdgeDB> {
  switch (config.provider) {
    case 'turso':
      return createTursoAdapter(config)
    case 'd1':
      return createD1Adapter(config)
    case 'neon':
      return createNeonAdapter(config)
    default:
      throw new Error(`Unsupported edge database provider`)
  }
}

// ============================================================================
// 4. 运行时环境自动检测
// ============================================================================

export type RuntimeEnvironment = 'cloudflare-workers' | 'vercel-edge' | 'deno-deploy' | 'nodejs' | 'unknown'

/**
 * 自动检测当前 JavaScript 运行时环境
 */
export function detectRuntime(): RuntimeEnvironment {
  // Cloudflare Workers
  if (typeof (globalThis as any).WebSocketPair !== 'undefined') {
    return 'cloudflare-workers'
  }

  // Deno
  if (typeof (globalThis as any).Deno !== 'undefined') {
    return 'deno-deploy'
  }

  // Node.js
  if (typeof process !== 'undefined' && process.versions?.node) {
    return 'nodejs'
  }

  // Vercel Edge（难以直接检测，通常通过构建时注入）
  if (typeof EdgeRuntime !== 'undefined' || process.env.NEXT_RUNTIME === 'edge') {
    return 'vercel-edge'
  }

  return 'unknown'
}

/**
 * 根据运行时自动推荐数据库配置
 */
export function autoConfigForRuntime(): Partial<ProjectProfile> {
  const runtime = detectRuntime()

  const defaults: Record<RuntimeEnvironment, Partial<ProjectProfile>> = {
    'cloudflare-workers': {
      platform: 'cloudflare-workers',
      budget: 'free-tier',
    },
    'vercel-edge': {
      platform: 'vercel-edge',
      budget: 'free-tier',
    },
    'deno-deploy': {
      platform: 'deno-deploy',
      budget: 'free-tier',
    },
    'nodejs': {
      platform: 'nodejs',
      budget: 'moderate',
    },
    'unknown': {
      platform: 'nodejs',
      budget: 'moderate',
    },
  }

  return defaults[runtime]
}

// ============================================================================
// 5. 成本估算器
// ============================================================================

export interface CostEstimate {
  database: string
  scenario: string
  monthlyCostUsd: number
  notes: string[]
}

/**
 * 粗略成本估算（2026 年定价，仅供参考）
 */
export function estimateMonthlyCost(
  database: DatabaseRecommendation['database'],
  requestsPerDay: number,
  storageGb: number
): CostEstimate {
  const scenarios: Record<string, CostEstimate> = {
    turso: {
      database: 'Turso',
      scenario: `${Math.round(requestsPerDay / 1000)}k req/day, ${storageGb}GB`,
      monthlyCostUsd: storageGb < 1 && requestsPerDay < 10000 ? 0 : Math.max(29, storageGb * 2),
      notes: [
        '免费 tier: 500 DB, 10GB 传输/月',
        '付费起步 $29/月',
        '按数据库数和请求量计费',
      ],
    },
    'cloudflare-d1': {
      database: 'Cloudflare D1',
      scenario: `${Math.round(requestsPerDay / 1000)}k req/day, ${storageGb}GB`,
      monthlyCostUsd: storageGb < 5 && requestsPerDay < 25000000 ? 0 : 5 + storageGb * 0.5,
      notes: [
        '免费 tier: 5GB 存储, 25M 读/天',
        'Workers Paid $5/月 + 请求计费',
        '注意 Workers 调用费独立于 D1',
      ],
    },
    neon: {
      database: 'Neon',
      scenario: `${Math.round(requestsPerDay / 1000)}k req/day, ${storageGb}GB`,
      monthlyCostUsd: storageGb < 0.5 ? 0 : 19 + storageGb * 0.5,
      notes: [
        '免费 tier 永久: 500MB, 计算小时有限',
        'Launch 计划 $19/月',
        '按计算时间和存储计费',
      ],
    },
    planetscale: {
      database: 'PlanetScale',
      scenario: `${Math.round(requestsPerDay / 1000)}k req/day, ${storageGb}GB`,
      monthlyCostUsd: 39,
      notes: [
        '无免费 tier',
        '起步 $39/月',
        '按存储和请求计费',
      ],
    },
    supabase: {
      database: 'Supabase',
      scenario: `${Math.round(requestsPerDay / 1000)}k req/day, ${storageGb}GB`,
      monthlyCostUsd: storageGb < 0.5 ? 0 : 25 + storageGb * 0.5,
      notes: [
        '免费 tier: 500MB',
        'Pro $25/月',
        '包含 Auth, Realtime, Storage',
      ],
    },
  }

  return scenarios[database] ?? scenarios.turso
}

// ============================================================================
// 6. 演示入口
// ============================================================================

export function demo(): void {
  console.log('=== 边缘数据库决策树 ===\n')

  // 示例 1：Cloudflare Workers 小型应用
  const cfProfile: ProjectProfile = {
    platform: 'cloudflare-workers',
    dataSize: 'small',
    queryComplexity: 'simple',
    readWriteRatio: 'read-heavy',
    needsPostgres: false,
    hasMysqlEcosystem: false,
    multiTenant: false,
    globalUsers: true,
    budget: 'free-tier',
    transactionComplexity: 'simple',
  }

  const cfRec = recommendEdgeDatabase(cfProfile)
  console.log('场景 1: Cloudflare Workers 小型博客')
  console.log('  推荐:', cfRec.database, '+', cfRec.orm)
  console.log('  信心:', cfRec.confidence)
  console.log('  理由:', cfRec.reasons.join('; '))
  console.log('  冷启动:', cfRec.estimatedColdStartMs, 'ms')
  console.log('  预估成本:', cfRec.estimatedMonthlyCost)
  console.log()

  // 示例 2：多租户 SaaS
  const saasProfile: ProjectProfile = {
    platform: 'vercel-edge',
    dataSize: 'medium',
    queryComplexity: 'moderate',
    readWriteRatio: 'read-heavy',
    needsPostgres: false,
    hasMysqlEcosystem: false,
    multiTenant: true,
    globalUsers: true,
    budget: 'moderate',
    transactionComplexity: 'simple',
  }

  const saasRec = recommendEdgeDatabase(saasProfile)
  console.log('场景 2: Vercel Edge 多租户 SaaS')
  console.log('  推荐:', saasRec.database, '+', saasRec.orm)
  console.log('  信心:', saasRec.confidence)
  console.log('  理由:', saasRec.reasons.join('; '))
  console.log('  冷启动:', saasRec.estimatedColdStartMs, 'ms')
  console.log('  预估成本:', saasRec.estimatedMonthlyCost)
  console.log()

  // 示例 3：复杂分析型应用
  const analyticsProfile: ProjectProfile = {
    platform: 'nodejs',
    dataSize: 'large',
    queryComplexity: 'complex',
    readWriteRatio: 'balanced',
    needsPostgres: true,
    hasMysqlEcosystem: false,
    multiTenant: false,
    globalUsers: false,
    budget: 'enterprise',
    transactionComplexity: 'complex',
  }

  const analyticsRec = recommendEdgeDatabase(analyticsProfile)
  console.log('场景 3: Node.js 数据分析平台')
  console.log('  推荐:', analyticsRec.database, '+', analyticsRec.orm)
  console.log('  信心:', analyticsRec.confidence)
  console.log('  理由:', analyticsRec.reasons.join('; '))
  console.log()

  console.log('运行时检测:', detectRuntime())
  console.log('自动配置:', autoConfigForRuntime())
}
