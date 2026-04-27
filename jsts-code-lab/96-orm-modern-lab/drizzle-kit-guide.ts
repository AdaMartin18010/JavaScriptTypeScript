/**
 * @file Drizzle Kit 完整指南
 * @category ORM Modern Lab → Drizzle Kit
 * @difficulty medium
 * @tags drizzle-kit, migration, schema, push, generate, drizzle-config
 *
 * @description
 * Drizzle Kit 是 Drizzle ORM 的官方 CLI 工具，负责数据库迁移的生成、执行和管理。
 * 本文件覆盖 Drizzle Kit 的完整功能：
 * - 配置文件（drizzle.config.ts）详解
 * - generate：从 Schema 变化生成迁移 SQL
 * - migrate：执行待处理的迁移
 * - push：直接将 Schema 推送到数据库（开发环境）
 * - pull / introspect：从现有数据库反向生成 Schema
 * - check：检测 Schema 与数据库的差异
 * - studio：内置 GUI 数据库管理工具
 */

// ============================================================================
// 1. Drizzle 配置文件（drizzle.config.ts）
// ============================================================================

/**
 * 基础配置示例
 */
export const basicConfig = `
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  // Schema 文件路径
  schema: './src/db/schema.ts',

  // 输出目录（迁移文件存放位置）
  out: './drizzle',

  // 数据库方言
  dialect: 'postgresql', // 'postgresql' | 'mysql' | 'sqlite'

  // 数据库连接（可被命令行参数覆盖）
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // 表名和列名在数据库中的 casing 策略
  casing: 'snake_case', // 'snake_case' | 'camelCase'

  // 严格模式（推荐）
  strict: true,

  // 详细日志
  verbose: true,
})
`

/**
 * 多环境配置（开发 / 测试 / 生产）
 */
export const multiEnvironmentConfig = `
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

const configMap = {
  development: {
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql' as const,
    dbCredentials: { url: process.env.DEV_DATABASE_URL! },
  },
  production: {
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql' as const,
    dbCredentials: { url: process.env.PROD_DATABASE_URL! },
  },
  turso: {
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite' as const,
    driver: 'turso',
    dbCredentials: {
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    },
  },
}

const env = (process.env.DRIZZLE_ENV || 'development') as keyof typeof configMap

export default defineConfig(configMap[env])
`

/**
 * SQLite / Turso / D1 特殊配置
 */
export const sqliteConfig = `
// drizzle.config.ts - Turso
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
})

// drizzle.config.ts - Cloudflare D1
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
})
`

// ============================================================================
// 2. 迁移命令详解
// ============================================================================

/**
 * Drizzle Kit CLI 命令速查
 */
export const cliCommands = {
  generate: {
    command: 'npx drizzle-kit generate',
    description: '对比当前 Schema 与上一次迁移状态，生成新的 SQL 迁移文件',
    output: '在 out 目录生成 000X_xxx.sql 迁移文件',
    useCase: 'Schema 变更后，生成可版本控制的迁移脚本',
    example: 'npx drizzle-kit generate --name add_user_profiles',
  },

  migrate: {
    command: 'npx drizzle-kit migrate',
    description: '执行所有待处理的迁移文件',
    output: '按顺序执行 SQL 迁移，并在数据库中记录迁移状态',
    useCase: '部署时更新数据库结构',
    example: 'npx drizzle-kit migrate',
  },

  push: {
    command: 'npx drizzle-kit push',
    description: '直接将 Schema 推送到数据库（不生成迁移文件）',
    output: '数据库结构与 Schema 同步',
    useCase: '快速原型开发、测试环境',
    warning: '⚠️ 生产环境不推荐：无法回滚，无迁移历史',
    example: 'npx drizzle-kit push',
  },

  pull: {
    command: 'npx drizzle-kit pull',
    description: '从现有数据库反向生成 Schema（Introspection）',
    output: '在 schema 路径生成 TypeScript Schema 文件',
    useCase: '遗留项目迁移到 Drizzle、数据库由其他工具管理',
    example: 'npx drizzle-kit pull',
  },

  check: {
    command: 'npx drizzle-kit check',
    description: '检测 Schema 文件与数据库的差异',
    output: '报告需要生成的迁移或结构差异',
    useCase: 'CI 中验证 Schema 是否已生成对应迁移',
    example: 'npx drizzle-kit check',
  },

  studio: {
    command: 'npx drizzle-kit studio',
    description: '启动内置 GUI 数据库管理工具',
    output: '在 http://localhost:4983 打开 Drizzle Studio',
    useCase: '可视化浏览和编辑数据',
    example: 'npx drizzle-kit studio --port 3001',
  },

  up: {
    command: 'npx drizzle-kit up',
    description: '执行下一个未应用的迁移（单步）',
    output: '应用一条迁移',
    useCase: '精细控制迁移过程',
    example: 'npx drizzle-kit up',
  },
}

// ============================================================================
// 3. 迁移文件结构与管理
// ============================================================================

/**
 * 典型的 Drizzle 迁移目录结构
 */
export const migrationDirectoryStructure = `
drizzle/
├── 0000_nifty_professor_x.sql      # 迁移 SQL 文件
├── 0001_busy_spider_man.sql
├── 0002_damp_cyclops.sql
├── meta/
│   ├── 0000_snapshot.json          # 每次迁移后的 Schema 快照
│   ├── 0001_snapshot.json
│   ├── 0002_snapshot.json
│   └── _journal.json               # 迁移日志（记录已执行的迁移）
└zzle.config.ts
`

/**
 * 迁移 SQL 文件示例
 */
export const migrationSqlExample = `
-- drizzle/0001_add_user_profiles.sql

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "bio" text,
  "website" varchar(255),
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);

--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE cascade ON UPDATE no action;
`

/**
 * 迁移最佳实践
 */
export const migrationBestPractices = [
  '1. 始终通过 drizzle-kit generate 生成迁移，不手写 SQL（除非复杂场景）',
  '2. 迁移文件纳入版本控制（git add drizzle/）',
  '3. 部署前在 staging 环境测试 migrate',
  '4. 生产环境禁用 push，只用 migrate',
  '5. 大型表变更分多步迁移（先加列 → 回填数据 → 加约束）',
  '6. 使用 check 命令在 CI 中确保 Schema 与迁移同步',
  '7. 为每个迁移写清晰的命名：--name add_user_profiles',
]

// ============================================================================
// 4. 自定义迁移与高级模式
// ============================================================================

/**
 * 在迁移中执行自定义 SQL
 *
 * Drizzle Kit 的 custom 类型允许在 Schema 中注入原始 SQL，
 * 常用于数据库特性（如 RLS、触发器、扩展）的声明。
 */
export const customSqlInSchema = `
// src/db/schema.ts
import { pgTable, serial, text, integer, pgPolicy } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  tenantId: integer('tenant_id').notNull(),
}, (table) => [
  // 自定义策略：多租户数据隔离
  pgPolicy('tenant_isolation', {
    for: 'all',
    to: 'authenticated',
    using: sql\`\${table.tenantId} = current_setting('app.tenant_id')::int\`,
  }),
])
`

/**
 * 种子数据脚本（与 Drizzle Kit 配合使用）
 */
export const seedScript = `
// src/db/seed.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { users, posts } from './schema'

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const db = drizzle(pool)

  // 清空表（开发环境）
  await db.delete(posts)
  await db.delete(users)

  // 插入种子数据
  const seededUsers = await db.insert(users).values([
    { email: 'alice@example.com', name: 'Alice' },
    { email: 'bob@example.com', name: 'Bob' },
  ]).returning()

  await db.insert(posts).values([
    { title: 'Hello World', content: 'First post', authorId: seededUsers[0].id },
    { title: 'Drizzle Guide', content: 'How to use Drizzle', authorId: seededUsers[1].id },
  ])

  console.log('Seed completed')
  await pool.end()
}

seed().catch(console.error)
`

// ============================================================================
// 5. CI/CD 集成
// ============================================================================

/**
 * GitHub Actions 工作流示例
 */
export const ciCdWorkflow = `
# .github/workflows/migrate.yml
name: Database Migration

on:
  push:
    branches: [main]
    paths:
      - 'src/db/schema.ts'
      - 'drizzle/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Check migrations are generated
        run: npx drizzle-kit check
        env:
          DATABASE_URL: \${{ secrets.DATABASE_URL }}

      - name: Run migrations
        run: npx drizzle-kit migrate
        env:
          DATABASE_URL: \${{ secrets.DATABASE_URL }}
`

/**
 * 迁移安全检查清单
 */
export const migrationSafetyChecklist = [
  '□ drizzle-kit check 通过（Schema 与迁移同步）',
  '□ 迁移文件已提交到 git',
  '□ Staging 环境 migrate 成功',
  '□ 应用代码与 Schema 版本兼容',
  '□ 大型表变更已评估锁定时间',
  '□ 回滚方案已准备（如有必要）',
]

// ============================================================================
// 6. Drizzle Studio 使用指南
// ============================================================================

/**
 * Drizzle Studio 是内置的数据库 GUI 工具
 */
export const studioGuide = {
  launch: 'npx drizzle-kit studio',
  defaultUrl: 'http://localhost:4983',
  features: [
    '可视化浏览所有表和数据',
    '直接编辑单元格',
    '执行自定义 SQL 查询',
    '查看表结构和关系',
    '导出数据',
  ],
  configuration: `
    // 自定义端口
    npx drizzle-kit studio --port 3001

    // 配置中启用/禁用
    // drizzle.config.ts
    export default defineConfig({
      // ...其他配置
      studio: {
        enabled: true,
        port: 4983,
      },
    })
  `,
}

// ============================================================================
// 7. 故障排除
// ============================================================================

/**
 * 常见问题与解决方案
 */
export const troubleshooting = {
  'generate 没有生成新迁移': [
    '检查 schema 文件路径是否正确（drizzle.config.ts 中的 schema 字段）',
    '确认 Schema 确实发生了变更',
    '删除 out 目录下的 snapshot 可能解决问题（不推荐生产环境）',
  ],
  'migrate 失败：表已存在': [
    '数据库中已有手动创建的表，与迁移冲突',
    '解决：清理数据库或调整迁移文件（删除 CREATE TABLE IF NOT EXISTS）',
  ],
  'push 后数据丢失警告': [
    'push 会删除 Schema 中未定义的列',
    '开发环境可用，生产环境绝对禁用',
  ],
  'Studio 无法连接': [
    '检查 dbCredentials 配置',
    '确认数据库可被本地访问（网络/VPN）',
    '检查防火墙规则',
  ],
  'D1 特殊错误': [
    'D1 不支持某些 SQLite 特性（如 ALTER COLUMN）',
    '遇到错误时考虑使用 D1 的 wrangler migrations',
  ],
}

// ============================================================================
// 8. 演示入口
// ============================================================================

export function demo(): void {
  console.log('=== Drizzle Kit 完整指南 ===\n')

  console.log('核心命令:')
  console.log('  generate  - 从 Schema 生成迁移 SQL')
  console.log('  migrate   - 执行待处理迁移')
  console.log('  push      - 直接推送 Schema（开发环境）')
  console.log('  pull      - 反向生成 Schema')
  console.log('  check     - 检测 Schema 与迁移差异')
  console.log('  studio    - GUI 数据库管理工具\n')

  console.log('配置文件要点:')
  console.log('  schema    - TypeScript Schema 文件路径')
  console.log('  out       - 迁移输出目录')
  console.log('  dialect   - postgresql | mysql | sqlite')
  console.log('  driver    - turso | d1-http（SQLite 专用）\n')

  console.log('最佳实践:')
  console.log('  ✓ 生产环境只用 migrate，禁用 push')
  console.log('  ✓ 迁移文件纳入版本控制')
  console.log('  ✓ CI 中运行 drizzle-kit check')
  console.log('  ✓ 大型变更分多步迁移')
  console.log('  ✓ 使用 Drizzle Studio 快速查看数据\n')

  console.log('与 Prisma Migrate 对比:')
  console.log('  Drizzle Kit: 生成原始 SQL，开发者完全掌控')
  console.log('  Prisma Migrate: 自动生成 + 影子数据库（更自动化但较黑盒）')
}
