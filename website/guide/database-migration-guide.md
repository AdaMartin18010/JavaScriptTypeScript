---
title: 数据库迁移指南
description: 'Prisma、Drizzle、TypeORM、Knex 等 ORM 迁移策略，覆盖零停机迁移、数据回填、回滚策略与多环境管理'
---

# 数据库迁移指南

> 最后更新: 2026-05-01

---

## 概述

数据库迁移是应用演进中最敏感的操作之一。本指南覆盖从零停机迁移到多环境管理的完整策略，帮助团队安全地演进数据库 schema。

---

## 迁移策略对比

| 策略 | 停机时间 | 复杂度 | 适用场景 |
|------|:--------:|:------:|---------|
| **直接迁移** | 有 | 低 | 开发环境 |
| **蓝绿部署** | 无 | 中 | 生产环境 |
| **扩展/收缩模式** | 无 | 高 | 大表结构变更 |
| **影子表** | 无 | 高 | 数据类型转换 |

---

## 数据库版本控制工具深度对比

数据库版本控制（Database Version Control）是现代 CI/CD 流水线的核心环节。以下对主流工具进行多维度深度对比，数据来源于各官方文档及社区基准测试（2026-04）。

### 工具概览

| 工具 | 语言 | 驱动方式 | 开源协议 | 首次发布 | 2026 社区活跃度 |
|------|------|---------|---------|---------|----------------|
| **Flyway** | Java | 命令行 / Java API / Maven / Gradle | Apache-2.0 | 2010 | 高 |
| **Liquibase** | Java | 命令行 / Java API / Maven / Gradle | Apache-2.0 | 2006 | 高 |
| **Prisma Migrate** | TypeScript | CLI / 程序化 API | Apache-2.0 | 2020 | 极高 |
| **Drizzle Kit** | TypeScript | CLI | Apache-2.0 | 2023 | 高 |
| **Atlas** | Go | CLI / Go API | Apache-2.0 | 2021 | 中高 |

### Flyway

Flyway 采用**基于 SQL 脚本**的迁移模型，核心理念是"约定优于配置"。

```sql
-- V1__create_users_table.sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- V2__add_user_phone.sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- R__refresh_user_stats.sql  (可重复执行)
CREATE OR REPLACE VIEW user_stats AS
SELECT DATE(created_at) AS day, COUNT(*) AS count
FROM users
GROUP BY DATE(created_at);
```

```bash
# 基线已有数据库
flyway baseline -url=jdbc:postgresql://localhost:5432/mydb \
  -user=postgres -password=secret

# 执行迁移
flyway migrate -locations=filesystem:./migrations

# 验证待执行迁移
flyway validate

# 查看当前版本
flyway info
```

**特性亮点：**

- 严格的版本号校验（`V{version}__{description}.sql`）
- 支持 Java 迁移（复杂数据转换逻辑）
- 企业版提供 Undo 迁移（`U{version}__...`）
- 与 Spring Boot 深度集成

### Liquibase

Liquibase 采用**基于变更集（Changeset）**的声明式模型，支持 XML / YAML / JSON / SQL 四种格式。

```yaml
# db/changelog/db.changelog-master.yaml
databaseChangeLog:
  - changeSet:
      id: 1
      author: alice
      changes:
        - createTable:
            tableName: users
            columns:
              - column:
                  name: id
                  type: BIGSERIAL
                  constraints:
                    primaryKey: true
              - column:
                  name: email
                  type: VARCHAR(255)
                  constraints:
                    nullable: false
                    unique: true

  - changeSet:
      id: 2
      author: bob
      preConditions:
        - onFail: MARK_RAN
        - not:
            - columnExists:
                tableName: users
                columnName: phone
      changes:
        - addColumn:
            tableName: users
            columns:
              - column:
                  name: phone
                  type: VARCHAR(20)
      rollback:
        - dropColumn:
            tableName: users
            columnName: phone
```

```bash
# 更新数据库
liquibase --changeLogFile=db/changelog/db.changelog-master.yaml update

# 生成回滚 SQL（不执行）
liquibase --changeLogFile=... rollbackCountSQL 1

# Diff 两个数据库生成变更集
liquibase --url=jdbc:postgresql://dev/db \
  --referenceUrl=jdbc:postgresql://prod/db diffChangeLog
```

**特性亮点：**

- 内置回滚语义（每个 changeset 可声明 rollback）
- 跨数据库抽象（同一 changelog 可在 MySQL/PostgreSQL/Oracle 运行）
- 强大的前置条件（preConditions）系统
- 支持上下文（contexts）和标签（labels）实现环境差异化

### Prisma Migrate

Prisma Migrate 是**Schema 驱动**的迁移工具，通过 Prisma Schema 文件生成并执行迁移。

```prisma
// schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  phone     String?
  createdAt DateTime @default(now()) @map("created_at")

  @@map("users")
}

model Post {
  id       String @id @default(cuid())
  title    String
  authorId String @map("author_id")
  author   User   @relation(fields: [authorId], references: [id])

  @@map("posts")
}
```

```bash
# 开发环境：生成并立即应用迁移
npx prisma migrate dev --name add_posts_table

# 生成迁移但不应用（用于审查）
npx prisma migrate dev --create-only --name add_posts_table

# 生产/CI 环境：仅应用待执行迁移
npx prisma migrate deploy

# 标记迁移已解决（冲突恢复）
npx prisma migrate resolve --applied "20260501120000_add_posts_table"
```

**特性亮点：**

- 与 Prisma Client 的类型安全深度集成
- 自动 schema 漂移检测（`prisma migrate diff`）
- Shadow Database 机制确保迁移可重放
- 支持 Baseline（已有数据库接入）

### Drizzle Kit

Drizzle Kit 是 Drizzle ORM 的配套迁移工具，轻量、类型安全、无隐藏魔法。

```ts
// schema.ts
import { pgTable, serial, varchar, timestamp, text } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content'),
  authorId: serial('author_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
```

```bash
# 生成迁移文件
npx drizzle-kit generate

# 执行迁移（通过迁移脚本）
npx drizzle-kit migrate

# 仅生成 SQL 不创建迁移记录
npx drizzle-kit generate --custom

# 数据库推送（开发环境快速原型）
npx drizzle-kit push
```

**特性亮点：**

- 极小包体积（~200KB vs Prisma ~50MB）
- 纯 SQL 透明化，迁移文件可直接审查和修改
- 支持 `drizzle-kit introspect` 反向工程已有数据库
- 与 `drizzle-orm` 的类型推断零开销

### Atlas

Atlas 是由 Ariga 开发的**Schema-as-Code** 工具，支持 HCL 和 SQL 定义数据库状态。

```hcl
# schema.hcl
schema "public" {}

table "users" {
  schema = schema.public
  column "id" {
    type = bigserial
  }
  column "email" {
    type = varchar(255)
    null = false
  }
  column "phone" {
    type = varchar(20)
    null = true
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_email" {
    unique = true
    columns = [column.email]
  }
}
```

```bash
# 应用 schema 到数据库
atlas schema apply \
  --url "postgres://user:pass@localhost:5432/mydb?sslmode=disable" \
  --to "file://schema.hcl" \
  --dev-url "postgres://user:pass@localhost:5432/dev?sslmode=disable"

# 生成版本化迁移
atlas migrate diff add_user_phone \
  --dir "file://migrations" \
  --to "file://schema.hcl" \
  --dev-url "postgres://user:pass@localhost:5432/dev?sslmode=disable"

# 执行迁移
atlas migrate apply \
  --url "postgres://user:pass@localhost:5432/mydb?sslmode=disable" \
  --dir "file://migrations"
```

**特性亮点：**

- 声明式 Schema 管理（类似 Terraform）
- 内置 Schema 可视化（`atlas schema inspect`）
- 支持数据库策略（Policy-as-Code）
- 云版提供 CI/CD 集成和漂移监控

### 深度对比矩阵

| 维度 | Flyway | Liquibase | Prisma Migrate | Drizzle Kit | Atlas |
|------|--------|-----------|----------------|-------------|-------|
| **迁移范式** | 命令式 SQL | 声明式 Changeset | Schema 驱动 | Schema 驱动 | Schema-as-Code (HCL/SQL) |
| **回滚支持** | 企业版原生 / 社区版手动 | ✅ 内置 rollback | ⚠️ 需手动管理 | ⚠️ 需手动管理 | ✅ 自动生成反向迁移 |
| **跨数据库** | ⚠️ 需手写兼容 SQL | ✅ 自动抽象 | ⚠️ 按 connector 区分 | ⚠️ 按 dialect 区分 | ✅ 多方言支持 |
| **CI/CD 集成** | ✅ 成熟 | ✅ 成熟 | ✅ 极成熟 | ✅ 轻量 | ✅ 云原生 |
| **现有数据库接入** | ✅ baseline | ✅ generateChangeLog | ✅ baselining | ✅ introspect | ✅ inspect |
| **数据迁移脚本** | ✅ Java/SQL | ✅ 多种格式 | ⚠️ 需手写 SQL | ✅ SQL 文件 | ✅ SQL / HCL |
| **Schema 漂移检测** | ❌ | ❌ | ✅ diff | ❌ | ✅ 内置 |
| **包体积** | ~10MB | ~15MB | ~50MB (含引擎) | ~200KB | ~30MB |
| **学习曲线** | 低 | 中 | 低 | 低 | 中 |
| **JS/TS 生态契合** | 中 | 中 | 极高 | 极高 | 中 |

> 📊 数据来源：各工具官方文档、GitHub Stars 趋势（2026-04）、npm 下载量统计、社区调查 State of Databases 2026

---

## ORM 迁移工具对比

### TypeORM Migrations

```ts
// migrations/1714550400000-AddUserPhone.ts
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddUserPhone1714550400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'phone',
        type: 'varchar',
        length: '20',
        isNullable: true,
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phone')
  }
}
```

```bash
# 生成空迁移
npx typeorm migration:create src/migrations/AddUserPhone

# 基于实体变化自动生成
npx typeorm migration:generate src/migrations/AutoMigration -d ./data-source.ts

# 执行迁移
npx typeorm migration:run -d ./data-source.ts

# 回滚最近迁移
npx typeorm migration:revert -d ./data-source.ts
```

### Knex.js Migrations

```ts
// migrations/20240501120000_add_user_phone.ts
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.string('phone', 20).nullable()
    table.index('phone', 'idx_users_phone')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropIndex('phone', 'idx_users_phone')
    table.dropColumn('phone')
  })
}
```

```bash
# 创建迁移骨架
npx knex migrate:make add_user_phone --migrations-directory ./migrations

# 执行待运行迁移
npx knex migrate:latest

# 回滚最近一批
npx knex migrate:rollback

# 回滚到指定版本
npx knex migrate:down 20240501120000_add_user_phone.ts
```

### 对比矩阵

| 特性 | Prisma | Drizzle | TypeORM | Knex |
|------|:------:|:-------:|:-------:|:----:|
| 类型安全 | ✅ 生成 | ✅ 推断 | ⚠️ 装饰器 | ❌ |
| 迁移生成 | ✅ 自动 | ✅ 自动 | ⚠️ 半自动 | ❌ 手动 |
| 回滚 | ✅ | ✅ | ✅ | ✅ |
| 数据种子 | ✅ | ⚠️ | ✅ | ✅ |
| 多数据库 | ✅ | ✅ | ✅ | ✅ |
| 包大小 | 大 | 小 | 中 | 小 |

---

## 零停机迁移模式

### 扩展/收缩模式 (Expand/Contract) 完整 4 阶段

扩展/收缩模式（Expand/Contract Pattern）是零停机迁移的黄金标准。以下以"将 `users.email` 从 VARCHAR(255) 迁移到带校验的 TEXT 且添加归一化字段"为例，展示完整 4 阶段流程。

#### Phase 1: 扩展（Expand）— 新增 Schema，双写数据

```sql
-- migration_001_expand.sql
-- 1.1 新增目标列（可空，避免阻塞写入）
ALTER TABLE users ADD COLUMN email_normalized TEXT;
ALTER TABLE users ADD COLUMN email_v2 TEXT;

-- 1.2 为回填查询创建部分索引，加速后续步骤
CREATE INDEX CONCURRENTLY idx_users_email_v2_null
  ON users(id) WHERE email_v2 IS NULL;

-- 1.3 添加 CHECK 约束（先不验证已有数据，避免锁表）
ALTER TABLE users ADD CONSTRAINT chk_email_v2_format
  CHECK (email_v2 ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
  NOT VALID;
```

```ts
// application-v1.1.ts — 双写逻辑
import { eq } from 'drizzle-orm'
import { users } from './schema'

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

async function createUser(email: string, name: string) {
  const normalized = normalizeEmail(email)
  return db.insert(users).values({
    email,                          // 旧列
    emailV2: email,                 // 新列
    emailNormalized: normalized,    // 归一化列
    name,
  })
}

async function updateUserEmail(userId: number, newEmail: string) {
  const normalized = normalizeEmail(newEmail)
  return db.update(users)
    .set({
      email: newEmail,
      emailV2: newEmail,
      emailNormalized: normalized,
    })
    .where(eq(users.id, userId))
}
```

#### Phase 2: 回填（Backfill）— 迁移历史数据

```ts
// backfill-job.ts — 幂等批量回填
import { eq, isNull, sql } from 'drizzle-orm'
import { users } from './schema'

const BATCH_SIZE = 500
const SLEEP_MS = 50  // 降低数据库负载

async function backfillBatch() {
  const batch = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(isNull(users.emailV2))
    .limit(BATCH_SIZE)

  if (batch.length === 0) return false

  // 使用单个 UPDATE 的 CASE 语句减少往返
  const cases = batch
    .map((u) => `WHEN ${u.id} THEN '${u.email.replace(/'/g, "''")}'`)
    .join(' ')

  const normalizedCases = batch
    .map((u) => `WHEN ${u.id} THEN '${normalizeEmail(u.email).replace(/'/g, "''")}'`)
    .join(' ')

  const ids = batch.map((u) => u.id).join(',')

  await db.execute(sql`
    UPDATE users
    SET email_v2 = CASE id ${sql.raw(cases)} END,
        email_normalized = CASE id ${sql.raw(normalizedCases)} END
    WHERE id IN (${sql.raw(ids)})
  `)

  console.log(`Backfilled ${batch.length} rows`)
  return true
}

async function runBackfill() {
  let hasMore = true
  while (hasMore) {
    hasMore = await backfillBatch()
    if (hasMore) await new Promise((r) => setTimeout(r, SLEEP_MS))
  }
  console.log('Backfill complete')
}

// 运行回填
runBackfill().catch(console.error)
```

#### Phase 3: 切换（Switchover）— 读取新 Schema

```sql
-- migration_002_validate.sql
-- 3.1 验证所有旧数据已回填
SELECT COUNT(*) FROM users WHERE email_v2 IS NULL;
-- 期望返回 0

-- 3.2 验证 CHECK 约束（在业务低峰期执行，会扫描全表）
ALTER TABLE users VALIDATE CONSTRAINT chk_email_v2_format;

-- 3.3 将新列改为非空（确认回填完成后）
ALTER TABLE users ALTER COLUMN email_v2 SET NOT NULL;
```

```ts
// application-v1.2.ts — 读取切换
// 此时写入仍双写，但读取切换到新列

async function getUserByEmail(email: string) {
  const normalized = normalizeEmail(email)
  return db.select().from(users)
    .where(eq(users.emailNormalized, normalized))
    .limit(1)
}

async function getUser(userId: number) {
  const [user] = await db.select({
    id: users.id,
    // 读取新列
    email: users.emailV2,
    emailNormalized: users.emailNormalized,
    name: users.name,
  }).from(users).where(eq(users.id, userId))
  return user
}
```

#### Phase 4: 收缩（Contract）— 删除旧 Schema

```sql
-- migration_003_contract.sql
-- 4.1 删除旧列相关索引和约束
DROP INDEX IF EXISTS idx_users_email_old;

-- 4.2 删除旧列（PostgreSQL 会重写表，大表注意锁）
-- 对于大表，建议使用 pt-online-schema-change 或 gh-ost
ALTER TABLE users DROP COLUMN email;

-- 4.3 重命名新列为原列名（可选，取决于应用兼容性）
ALTER TABLE users RENAME COLUMN email_v2 TO email;

-- 4.4 清理回填辅助索引
DROP INDEX IF EXISTS idx_users_email_v2_null;

-- 4.5 将旧约束重命名为新约束
ALTER TABLE users RENAME CONSTRAINT chk_email_v2_format TO chk_email_format;
```

```ts
// application-v1.3.ts — 最终版本
// 删除所有旧列引用，仅使用新 schema

async function createUserFinal(email: string, name: string) {
  return db.insert(users).values({
    email,                    // 现在指向原 email_v2 的列
    emailNormalized: normalizeEmail(email),
    name,
  })
}
```

### 添加非空字段

```sql
-- 1. 添加可空字段（不阻塞）
ALTER TABLE users ADD COLUMN timezone VARCHAR(50);

-- 2. 回填默认值（批量，低峰期运行）
UPDATE users
SET timezone = 'UTC'
WHERE timezone IS NULL
  AND id BETWEEN 1 AND 10000;
-- 重复分批直到全部完成

-- 3. 验证回填完整性
SELECT COUNT(*) FROM users WHERE timezone IS NULL;

-- 4. 改为非空（会短暂锁表，验证所有行）
ALTER TABLE users ALTER COLUMN timezone SET NOT NULL;

-- 5. 添加默认值（供后续新行使用）
ALTER TABLE users ALTER COLUMN timezone SET DEFAULT 'UTC';
```

---

## 大表迁移策略

当表数据量超过百万级时，原生 `ALTER TABLE` 可能引发长时间锁表、复制延迟、I/O 飙升。以下工具专门解决此问题。

### pt-online-schema-change (Percona Toolkit)

```bash
# 安装
apt-get install percona-toolkit

# 基本用法：在线给 1 亿行表添加索引
pt-online-schema-change \
  --alter "ADD COLUMN bio TEXT, ADD INDEX idx_bio(bio(100))" \
  --execute \
  --max-load "Threads_running=25" \
  --critical-load "Threads_running=50" \
  --chunk-size 1000 \
  --pause-file /tmp/osc.pause \
  D=mydb,t=users,u=admin,p=secret,h=db.prod

#  dry-run 模式（仅打印不执行）
pt-online-schema-change \
  --alter "DROP COLUMN old_field" \
  --dry-run \
  D=mydb,t=users,u=admin,p=secret,h=db.prod
```

**工作原理：**

1. 创建与原表结构相同的新表（影子表）
2. 在新表上执行 `ALTER`
3. 创建触发器捕获原表的 INSERT/UPDATE/DELETE
4. 分批复制数据（chunked copy）
5. 重命名表（原子性 RENAME）
6. 删除触发器和旧表

> ⚠️ 注意：要求表必须有主键或唯一索引；外键处理需加 `--alter-foreign-keys-method`。

### gh-ost (GitHub Online Schema Migration)

gh-ost 是 GitHub 开源的触发器-free 方案，基于二进制日志（binlog）异步复制变更。

```bash
# 安装
go install github.com/github/gh-ost@latest

# 基本用法
gh-ost \
  --user="admin" \
  --password="secret" \
  --host="db.prod" \
  --database="mydb" \
  --table="users" \
  --alter="ADD COLUMN preferences JSON, ADD INDEX idx_preferences((preferences->>'$.theme'))" \
  --execute

# 交互式控制：限速、暂停、切换
# 在另一个终端连接 gh-ost 的 Unix Socket 或 HTTP 接口
echo "chunk-size=500" | nc -U /tmp/gh-ost.mydb.users.sock
echo "throttle" | nc -U /tmp/gh-ost.mydb.users.sock
echo "no-throttle" | nc -U /tmp/gh-ost.mydb.users.sock

# 原子切换（cut-over）前可以测试
echo "status" | nc -U /tmp/gh-ost.mydb.users.sock
```

**gh-ost vs pt-osc 对比：**

| 维度 | pt-online-schema-change | gh-ost |
|------|------------------------|--------|
| 触发器 | 需要（增加写入开销） | 不需要（读 binlog） |
| 主从延迟 | 可能加剧 | 可控（可暂停） |
| 可测试性 | 低 | 高（支持 cut-over 前切换测试） |
| 暂停/恢复 | 有限 | 完整支持 |
| 主键要求 | 必须有 | 必须有 |
| 社区维护 | Percona | GitHub（更活跃） |

> 📊 数据来源：GitHub Engineering Blog 2024、Percona 官方 Benchmark

### 在线 DDL（原生方案）

#### MySQL 8.0+ InnoDB

```sql
-- MySQL 8.0 支持 INSTANT ALTER（部分操作秒级完成）
-- 查看算法支持
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500),
  ALGORITHM=INSTANT;  -- 仅支持加列（最后位置）、加虚拟列等

-- 对于不支持 INSTANT 的操作，使用 INPLACE（在线重建）
ALTER TABLE users ADD INDEX idx_created_at(created_at),
  ALGORITHM=INPLACE, LOCK=NONE;

-- 查看进度（MySQL 8.0.16+）
SELECT * FROM performance_schema.events_stages_current;
```

#### PostgreSQL

```sql
-- PostgreSQL 原生支持并发的 CREATE INDEX
CREATE INDEX CONCURRENTLY idx_users_phone ON users(phone);

-- 添加列（不阻塞，因为 PG 的 MVCC 实现）
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';

-- 但修改列类型或添加 DEFAULT 到已有行会重写表
-- 解决方案：分多步（即 Expand/Contract 模式）

-- 监控锁等待
SELECT * FROM pg_locks WHERE NOT granted;
SELECT * FROM pg_stat_activity WHERE wait_event_type = 'Lock';
```

---

## 数据回填与一致性

### 批量回填脚本

```ts
// robust-backfill.ts
import { sql } from 'drizzle-orm'

interface BackfillConfig {
  table: string
  column: string
  compute: (row: any) => any
  batchSize: number
  sleepMs: number
  maxRetries: number
  dryRun?: boolean
}

async function robustBackfill(config: BackfillConfig) {
  const { table, column, compute, batchSize, sleepMs, maxRetries, dryRun } = config
  let processed = 0
  let failures = 0
  let lastId = 0

  while (true) {
    let retries = 0
    let success = false

    while (retries < maxRetries && !success) {
      try {
        const rows = await db.execute(sql`
          SELECT id, raw_data
          FROM ${sql.raw(table)}
          WHERE ${sql.raw(column)} IS NULL
            AND id > ${lastId}
          ORDER BY id
          LIMIT ${batchSize}
          FOR UPDATE SKIP LOCKED
        `)

        if (rows.length === 0) {
          console.log(`Backfill complete. Processed: ${processed}, Failures: ${failures}`)
          return
        }

        if (dryRun) {
          console.log(`[DRY-RUN] Would update ${rows.length} rows`)
          lastId = rows[rows.length - 1].id
          processed += rows.length
          success = true
          continue
        }

        // 批量更新
        const updates = rows.map((r) => ({
          id: r.id,
          value: compute(r),
        }))

        await db.transaction(async (trx) => {
          for (const u of updates) {
            await trx.execute(sql`
              UPDATE ${sql.raw(table)}
              SET ${sql.raw(column)} = ${u.value}
              WHERE id = ${u.id}
            `)
          }
        })

        lastId = rows[rows.length - 1].id
        processed += rows.length
        success = true
      } catch (err) {
        retries++
        failures++
        console.error(`Batch failed (retry ${retries}/${maxRetries}):`, err)
        await new Promise((r) => setTimeout(r, sleepMs * retries))
      }
    }

    if (!success) {
      throw new Error(`Failed to process batch after ${maxRetries} retries. Last ID: ${lastId}`)
    }

    if (sleepMs > 0) {
      await new Promise((r) => setTimeout(r, sleepMs))
    }
  }
}

// 使用示例
robustBackfill({
  table: 'users',
  column: 'display_name',
  compute: (row) => row.raw_data?.name?.trim() || 'Anonymous',
  batchSize: 500,
  sleepMs: 100,
  maxRetries: 3,
  dryRun: process.env.DRY_RUN === 'true',
})
```

### 校验和验证

```sql
-- 迁移前后计算表校验和（PostgreSQL）
-- 需要安装 pgcrypto 扩展
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 计算全表校验和
SELECT encode(digest(
  string_agg(
    id::text || COALESCE(email, '') || COALESCE(phone, '') || COALESCE(name, ''),
    '' ORDER BY id
  ),
  'sha256'
), 'hex') AS table_checksum
FROM users;

-- MySQL 校验和
SELECT COUNT(*) AS row_count,
       MD5(GROUP_CONCAT(
         CONCAT(id, IFNULL(email, ''), IFNULL(phone, ''))
         ORDER BY id
         SEPARATOR ''
       )) AS checksum
FROM users;
```

```ts
// checksum-validator.ts
import { createHash } from 'crypto'

async function validateTableChecksum(table: string, expectedColumns: string[]) {
  const columns = expectedColumns.join(', ')
  const rows = await db.execute(`SELECT ${columns} FROM ${table} ORDER BY id`)

  const hash = createHash('sha256')
  for (const row of rows) {
    const normalized = expectedColumns
      .map((c) => (row[c] ?? '').toString().trim())
      .join('|')
    hash.update(normalized + '\n')
  }

  return hash.digest('hex')
}

// 在迁移前后分别运行并比对
const before = await validateTableChecksum('users', ['id', 'email', 'phone', 'name'])
// ... 执行迁移 ...
const after = await validateTableChecksum('users', ['id', 'email', 'phone', 'name'])

if (before !== after) {
  throw new Error('Data integrity check failed: checksum mismatch')
}
```

### 数据修复脚本

```ts
// data-repair.ts — 发现不一致后的修复
async function repairOrphanedPosts() {
  // 查找没有有效作者的 posts
  const orphaned = await db.execute(sql`
    SELECT p.id
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE u.id IS NULL
    LIMIT 1000
  `)

  if (orphaned.length === 0) return

  console.warn(`Found ${orphaned.length} orphaned posts`)

  // 策略 1：软删除
  await db.execute(sql`
    UPDATE posts
    SET status = 'orphaned',
        updated_at = NOW()
    WHERE id IN (${sql.raw(orphaned.map((o) => o.id).join(','))})
  `)

  // 策略 2：关联到默认用户（备选）
  // await db.execute(sql`
  //   UPDATE posts
  //   SET author_id = (SELECT id FROM users WHERE email = 'system@example.com')
  //   WHERE id IN (...)
  // `)
}
```

---

## 多环境管理

### 环境配置

```bash
# .env.development
DATABASE_URL="postgresql://dev@localhost:5432/app_dev"
MIGRATION_MODE="dev"           # 允许自动创建和删除
SHADOW_DATABASE_URL="postgresql://dev@localhost:5432/app_dev_shadow"

# .env.staging
DATABASE_URL="postgresql://staging@db.staging.internal:5432/app_staging"
MIGRATION_MODE="deploy"        # 仅应用预生成迁移
CONNECTION_LIMIT="10"
STATEMENT_TIMEOUT="30000"      # 30s

# .env.production
DATABASE_URL="postgresql://prod@db.prod.internal:5432/app_prod"
MIGRATION_MODE="deploy"
CONNECTION_LIMIT="5"
STATEMENT_TIMEOUT="60000"      # 60s
LOCK_TIMEOUT="5000"            # 5s，避免长时间锁表
MIGRATION_BACKUP_BEFORE_RUN="true"
```

### 环境差异化迁移策略

| 策略维度 | 开发 (Development) | 预发布 (Staging) | 生产 (Production) |
|---------|-------------------|-----------------|------------------|
| **迁移生成** | ✅ `prisma migrate dev` 自动生成 | ❌ 仅应用已审查的迁移 | ❌ 仅应用已审查的迁移 |
| **数据种子** | ✅ 每次重置后自动填充 | ⚠️ 匿名化生产子集 | ❌ 不自动填充 |
| **Schema 推送** | ✅ `drizzle-kit push` 允许 | ❌ 禁止 | ❌ 禁止 |
| **破坏性变更** | ✅ 允许（快速迭代） | ⚠️ 需工单审批 | ✅ 需 RFC + 双人审批 |
| **执行时间窗口** | 任意 | 业务低峰期 | 维护窗口（通常凌晨） |
| **回滚测试** | ⚠️ 建议 | ✅ 必须 | ✅ 必须 |
| **监控告警** | ❌ | ✅ 基础监控 | ✅ 全链路监控 |
| **影子数据库** | ✅ 本地 Shadow DB | ✅ 独立 Shadow DB | ❌ 不直接操作 |

### 环境迁移 CI/CD 流水线

```yaml
# .github/workflows/database-migration.yml
name: Database Migration

on:
  push:
    paths:
      - 'prisma/migrations/**'
      - 'drizzle/migrations/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate migration files
        run: |
          npx prisma migrate status --preview-feature
          # 检查迁移文件命名规范
          ./scripts/check-migration-naming.sh

  migrate-staging:
    needs: validate
    environment: staging
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Apply migrations to staging
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
        run: npx prisma migrate deploy
      - name: Run data integrity checks
        run: npx tsx scripts/post-migration-checks.ts

  migrate-production:
    needs: migrate-staging
    environment: production  # 需要人工审批
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Backup before migration
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
        run: |
          pg_dump $DATABASE_URL | gzip > backup-$(date +%s).sql.gz
      - name: Apply migrations to production
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
        run: npx prisma migrate deploy
      - name: Post-migration validation
        run: npx tsx scripts/post-migration-checks.ts
      - name: Notify on failure
        if: failure()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -d '{"text":"🚨 Production migration failed!"}'
```

### 迁移检查清单

| 检查项 | 开发 | 预发布 | 生产 |
|--------|:----:|:------:|:----:|
| 迁移脚本审查 | ⚠️ | ✅ | ✅ |
| 数据备份 | ❌ | ✅ | ✅ |
| 回滚计划 | ❌ | ✅ | ✅ |
| 性能影响评估 | ❌ | ⚠️ | ✅ |
| 监控告警 | ❌ | ⚠️ | ✅ |
| 蓝绿部署 | ❌ | ⚠️ | ✅ |

---

## 回滚与灾难恢复

### 事务回滚

```sql
-- PostgreSQL：在事务中执行迁移，失败自动回滚
BEGIN;

ALTER TABLE orders ADD COLUMN delivery_notes TEXT;
UPDATE orders SET delivery_notes = 'N/A' WHERE delivery_notes IS NULL;
ALTER TABLE orders ALTER COLUMN delivery_notes SET NOT NULL;

-- 如果任何步骤失败，全部回滚
COMMIT;

-- 注意：MySQL 的 ALTER TABLE 会隐式提交，无法包裹在大事务中
-- 解决方案：使用 pt-osc / gh-ost 或分步迁移
```

```ts
// 程序化事务回滚（TypeScript）
async function runMigrationWithRollback(migrationSql: string[]) {
  const trx = await db.transaction()
  try {
    for (const sql of migrationSql) {
      await trx.execute(sql)
    }
    await trx.commit()
    console.log('Migration committed')
  } catch (err) {
    await trx.rollback()
    console.error('Migration rolled back:', err)
    throw err
  }
}
```

### 备份恢复

```bash
#!/bin/bash
# pre-migration-backup.sh

set -euo pipefail

DB_URL="${DATABASE_URL:?}"
BACKUP_DIR="/backups/migrations/$(date +%Y%m%d_%H%M%S)"
MIGRATION_NAME="${1:?Migration name required}"

mkdir -p "$BACKUP_DIR"

echo "Creating pre-migration backup..."
pg_dump "$DB_URL" \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_DIR/before_${MIGRATION_NAME}.dump"

# 同时导出纯文本版本（便于 diff）
pg_dump "$DB_URL" \
  --data-only \
  --inserts \
  --file="$BACKUP_DIR/before_${MIGRATION_NAME}_data.sql"

echo "Backup saved to $BACKUP_DIR"

# 记录迁移元数据
cat > "$BACKUP_DIR/meta.json" <<EOF
{
  "migration": "$MIGRATION_NAME",
  "timestamp": "$(date -Iseconds)",
  "database_url_hash": "$(echo "$DB_URL" | sha256sum | cut -d' ' -f1)",
  "backup_type": "pre_migration"
}
EOF
```

```bash
# 恢复脚本
#!/bin/bash
# restore-backup.sh

BACKUP_FILE="${1:?Backup file required}"
DB_URL="${DATABASE_URL:?}"

echo "Restoring from $BACKUP_FILE..."
pg_restore \
  --dbname="$DB_URL" \
  --clean \
  --if-exists \
  --verbose \
  "$BACKUP_FILE"

echo "Restore complete"
```

### CDC (Change Data Capture)

CDC 是灾难恢复的高级方案，可捕获并流式传输数据库变更。

#### Debezium + Kafka（开源方案）

```json
// debezium-postgres-connector.json
{
  "name": "postgres-users-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "db.prod.internal",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "secret",
    "database.dbname": "mydb",
    "database.server.name": "prod_db",
    "table.include.list": "public.users,public.orders",
    "plugin.name": "pgoutput",
    "snapshot.mode": "when_needed",
    "tombstones.on.delete": "true",
    "decimal.handling.mode": "string"
  }
}
```

```bash
# 注册连接器
curl -X POST http://kafka-connect:8083/connectors \
  -H "Content-Type: application/json" \
  -d @debezium-postgres-connector.json

# 查看连接器状态
curl http://kafka-connect:8083/connectors/postgres-users-connector/status
```

**CDC 用于迁移回滚：**

1. 迁移前启动 CDC 捕获全量快照
2. 执行迁移
3. 若迁移失败，消费 CDC 事件恢复到迁移前状态
4. 或利用 CDC 事件重建下游数据仓库 / 缓存

#### 数据库原生 CDC

```sql
-- PostgreSQL 逻辑复制（原生 CDC）
-- 1. 在 postgresql.conf 中启用
-- wal_level = logical
-- max_replication_slots = 4

-- 2. 创建发布
CREATE PUBLICATION migration_pub FOR TABLE users, orders;

-- 3. 创建复制槽
SELECT pg_create_logical_replication_slot('migration_slot', 'pgoutput');

-- 4. 消费变更（应用侧使用 pg_recvlogical 或逻辑解码库）
-- pg_recvlogical -d mydb --slot migration_slot --start -f -

-- 清理
SELECT pg_drop_replication_slot('migration_slot');
DROP PUBLICATION migration_pub;
```

---

## 云数据库迁移

### AWS DMS (Database Migration Service)

```json
// dms-replication-task.json
{
  "ReplicationTaskIdentifier": "prod-mysql-to-aurora",
  "SourceEndpointArn": "arn:aws:dms:us-east-1:123456789012:endpoint:source-mysql",
  "TargetEndpointArn": "arn:aws:dms:us-east-1:123456789012:endpoint:target-aurora-pg",
  "ReplicationInstanceArn": "arn:aws:dms:us-east-1:123456789012:rep:dms-instance",
  "MigrationType": "full-load-and-cdc",
  "TableMappings": {
    "rules": [
      {
        "rule-type": "selection",
        "rule-id": "1",
        "rule-name": "1",
        "object-locator": {
          "schema-name": "%",
          "table-name": "%"
        },
        "rule-action": "include"
      },
      {
        "rule-type": "transformation",
        "rule-id": "2",
        "rule-name": "2",
        "rule-action": "rename",
        "rule-target": "schema",
        "object-locator": {
          "schema-name": "old_schema"
        },
        "value": "new_schema"
      }
    ]
  }
}
```

```bash
# AWS CLI 创建复制任务
aws dms create-replication-task \
  --replication-task-identifier prod-mysql-to-aurora \
  --source-endpoint-arn arn:aws:dms:...:source-mysql \
  --target-endpoint-arn arn:aws:dms:...:target-aurora-pg \
  --replication-instance-arn arn:aws:dms:...:dms-instance \
  --migration-type full-load-and-cdc \
  --table-mappings file://table-mappings.json

# 启动迁移
aws dms start-replication-task \
  --replication-task-arn arn:aws:dms:...:task \
  --start-replication-task-type start-replication

# 监控进度
aws dms describe-replication-tasks \
  --filters Name=replication-task-arn,Values=arn:aws:dms:...:task
```

> 📊 AWS DMS 支持：Oracle、SQL Server、MySQL、PostgreSQL、MariaDB、MongoDB、SAP ASE、IBM Db2 等。

### GCP Database Migration Service

```bash
# gcloud CLI 创建连接配置文件
gcloud database-migration connection-profiles create cloudsql \
  source-connection-profile \
  --region=us-central1 \
  --display-name="Source MySQL" \
  --host=source.db.internal \
  --port=3306 \
  --username=dms_user \
  --password=secret

# 创建迁移作业
gcloud database-migration migration-jobs create prod-migration \
  --region=us-central1 \
  --source=source-connection-profile \
  --destination=target-connection-profile \
  --type=CONTINUOUS \
  --display-name="Production MySQL to Cloud SQL"

# 启动迁移作业
gcloud database-migration migration-jobs start prod-migration \
  --region=us-central1
```

### Azure Database Migration Service

```powershell
# Azure PowerShell 创建迁移项目
$sourceConnInfo = New-AzDataMigrationConnectionInfo `
  -ServerType SQL `
  -DataSource "source-sql-server.database.windows.net" `
  -AuthType SqlAuthentication `
  -TrustServerCertificate:$true

$targetConnInfo = New-AzDataMigrationConnectionInfo `
  -ServerType SQLDB `
  -DataSource "target-sql-server.database.windows.net"

New-AzDataMigrationProject `
  -ResourceGroupName "rg-migrations" `
  -Name "sql-to-sqldb" `
  -Location "East US" `
  -SourceType SQL `
  -TargetType SQLDB `
  -SourceConnection $sourceConnInfo `
  -TargetConnection $targetConnInfo
```

### 云迁移工具对比

| 特性 | AWS DMS | GCP DMS | Azure DMS |
|------|---------|---------|-----------|
| 支持源数据库 | 20+ | 10+ | 15+ |
| 持续复制 (CDC) | ✅ | ✅ | ✅ |
| Schema 转换 | ⚠️ 需 SCT | ✅ 内置 | ✅ 内置 |
| 同构 / 异构 | 都支持 | 主要为同构 | 都支持 |
| 无服务器选项 | ❌ | ✅ | ⚠️ 预览 |
| 私有连接 | ✅ VPN/Direct Connect | ✅ Private Service Connect | ✅ Private Link |
| 价格模型 | 按实例小时 + 数据传输 | 按实例小时 | 按 vCore 小时 |

> 📊 数据来源：AWS、GCP、Azure 官方文档及定价页面（2026-04）。

---

## 跨数据库迁移

### MySQL → PostgreSQL

```bash
# 方案 1：pg_dump + pg_restore（同构 PostgreSQL 之间）
# 对于 MySQL → PostgreSQL，推荐使用 pgloader 或 AWS SCT

# pgloader（开源，专用 MySQL→PG 工具）
cat > mysql-to-pg.load <<EOF
LOAD DATABASE
  FROM mysql://user:pass@mysql.host/mydb
  INTO postgresql://user:pass@pg.host/mydb

WITH include drop, create tables, create indexes, reset sequences
  SET maintenance_work_mem to '128MB', work_mem to '12MB'

CAST type datetime to timestamptz drop default drop not null using zero-dates-to-null,
     type tinyint to boolean using tinyint-to-boolean,
     type json to jsonb

EXCLUDE TABLE NAMES MATCHING 'temp_', 'backup_'
ALTER TABLE NAMES MATCHING 'user' RENAME TO 'users';
EOF

pgloader mysql-to-pg.load
```

```ts
// 方案 2：程序化迁移（TypeScript + Prisma）
// 双写阶段：写入 MySQL 的同时异步写入 PostgreSQL

async function dualWriteMigration() {
  const mysqlUser = await mysqlDb.user.create({ data: { email: 'a@b.com' } })

  // 异步写入 PostgreSQL（不阻塞主流程）
  pgDb.user.create({ data: { id: mysqlUser.id, email: mysqlUser.email } })
    .catch((err) => {
      console.error('PG write failed, enqueue for retry:', err)
      retryQueue.enqueue({ table: 'user', record: mysqlUser })
    })
}

// 校验脚本
async function verifyMigration() {
  const mysqlCount = await mysqlDb.user.count()
  const pgCount = await pgDb.user.count()

  if (mysqlCount !== pgCount) {
    throw new Error(`Count mismatch: MySQL=${mysqlCount}, PG=${pgCount}`)
  }

  // 抽样校验
  const sample = await pgDb.user.findMany({ take: 1000 })
  for (const pgUser of sample) {
    const mysqlUser = await mysqlDb.user.findUnique({ where: { id: pgUser.id } })
    if (!mysqlUser || mysqlUser.email !== pgUser.email) {
      throw new Error(`Data mismatch for user ${pgUser.id}`)
    }
  }

  console.log('Migration verified successfully')
}
```

### SQL → NoSQL

```ts
// SQL (PostgreSQL) → MongoDB 迁移示例
import { MongoClient } from 'mongodb'

const mongo = new MongoClient(process.env.MONGO_URL!)
const sqlDb = postgres(process.env.DATABASE_URL!)

async function migrateUsersToMongo() {
  const usersCollection = mongo.db('app').collection('users')

  // 创建目标索引
  await usersCollection.createIndex({ email: 1 }, { unique: true })
  await usersCollection.createIndex({ createdAt: -1 })

  // 游标方式批量迁移（避免内存溢出）
  const cursor = sqlDb`
    SELECT u.*,
           COALESCE(jsonb_agg(p.*) FILTER (WHERE p.id IS NOT NULL), '[]') AS posts
    FROM users u
    LEFT JOIN posts p ON p.author_id = u.id
    GROUP BY u.id
  `.cursor()

  let batch: any[] = []
  const BATCH_SIZE = 500

  for await (const row of cursor) {
    batch.push({
      _id: row.id,
      email: row.email,
      name: row.name,
      posts: row.posts.map((p: any) => ({
        title: p.title,
        content: p.content,
        createdAt: p.created_at,
      })),
      createdAt: row.created_at,
    })

    if (batch.length >= BATCH_SIZE) {
      await usersCollection.insertMany(batch, { ordered: false })
      batch = []
    }
  }

  if (batch.length > 0) {
    await usersCollection.insertMany(batch, { ordered: false })
  }

  console.log('Migration to MongoDB complete')
}
```

### 自托管 → 托管（On-Premise → Cloud SQL / RDS / Azure SQL）

```bash
# 通用流程
# 1. 评估兼容性
# PostgreSQL: pg_dump --schema-only 分析不兼容类型
# MySQL: pt-query-digest 分析查询模式

# 2. 建立 VPN / Private Link 连接
# AWS: aws ec2 create-vpn-connection
# Azure: az network vpn-gateway create
# GCP: gcloud compute vpn-gateways create

# 3. 全量迁移（低峰期）
pg_dump -h on-prem-db -U admin -d mydb --format=custom | \
  pg_restore -h cloud-rds-endpoint -U admin -d mydb --verbose

# 4. 增量同步（CDC）
# 使用上述云 DMS 服务或自建 Debezium

# 5. 切换流量（蓝绿切换）
# - 将应用数据库连接池指向云数据库
# - 保留自托管库只读一段时间（观察期）
# - 确认无误后关闭自托管库
```

---

## 2026 趋势

### Schema-as-Code

Schema-as-Code 将数据库 schema 视为基础设施的一部分，通过代码定义、版本控制和自动化部署。

```hcl
# atlas.hcl — 环境差异化配置
env "local" {
  src = "file://schema.hcl"
  url = "postgres://localhost:5432/dev?sslmode=disable"
  dev = "postgres://localhost:5432/dev_shadow?sslmode=disable"
}

env "production" {
  src = "file://schema.hcl"
  url = env("DATABASE_URL")
  dev = env("SHADOW_DATABASE_URL")

  migration {
    dir = "file://migrations"
  }

  # 生产环境策略：禁止删除列
  lint {
    destructive {
      error = true
    }
  }
}
```

```bash
# CI 中强制执行 Schema 策略
atlas migrate lint \
  --dir "file://migrations" \
  --dev-url "postgres://localhost:5432/dev_shadow?sslmode=disable" \
  --latest 1
```

### GitOps 迁移

GitOps 将迁移脚本纳入 Git 工作流，通过 Pull Request 审查和自动化流水线执行。

```yaml
# .github/workflows/gitops-migration.yml
name: GitOps Database Migration

on:
  pull_request:
    paths: ['migrations/**']

jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate migration plan
        run: |
          atlas migrate diff --dir file://migrations \
            --to file://schema.hcl \
            --dev-url "$SHADOW_DATABASE_URL"
      - name: Comment PR with diff
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs')
            const diff = fs.readFileSync('migrations/*.sql', 'utf8')
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🗄️ Migration Plan\n\`\`\`sql\n${diff}\n\`\`\``
            })

  apply:
    needs: plan
    if: github.ref == 'refs/heads/main'
    environment: production
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Apply approved migrations
        run: atlas migrate apply --dir file://migrations --url "$DATABASE_URL"
```

### AI 辅助迁移

2026 年，AI 工具已深度介入数据库迁移流程：

```ts
// 使用 AI 生成迁移脚本（基于自然语言描述）
// 示例：基于 OpenAI API 的迁移助手

import OpenAI from 'openai'

const openai = new OpenAI()

async function generateMigration(description: string, currentSchema: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      {
        role: 'system',
        content: `You are a database migration expert. Generate safe, zero-downtime SQL migration scripts.
Rules:
- Use PostgreSQL syntax
- Follow expand/contract pattern for breaking changes
- Add appropriate indexes CONCURRENTLY
- Include rollback statements
- Comment each phase`,
      },
      {
        role: 'user',
        content: `Current schema:\n${currentSchema}\n\nMigration needed:\n${description}`,
      },
    ],
  })

  return response.choices[0].message.content
}

// 使用示例
const migration = await generateMigration(
  'Split the full_name column into first_name and last_name',
  await fs.readFile('schema.prisma', 'utf8')
)
console.log(migration)
```

**AI 在迁移中的实际应用场景：**

| 场景 | AI 能力 | 工具示例 |
|------|--------|---------|
| SQL 生成 | 自然语言 → 安全迁移脚本 | ChatGPT, Claude, GitHub Copilot |
| Schema 审查 | 检测破坏性变更、性能隐患 | Atlas Cloud AI, Prisma AI Advisor |
| 查询优化 | 索引建议、慢查询重写 | pg.ai, Azure SQL AI Insights |
| 数据分类 | 自动识别 PII，生成脱敏规则 | BigID, Collibra AI |
| 异常检测 | 迁移后性能异常自动告警 | Datadog DBM, New Relic AI |

> 📊 数据来源：Gartner "Hype Cycle for Data Management 2025"、DB-Engines 年度趋势报告、各大云厂商 2026 Q1 产品发布。

### 2026 最佳实践

| 实践 | 说明 |
|------|------|
| **迁移即代码** | 所有迁移纳入版本控制，通过 CI/CD 执行 |
| **幂等迁移** | 确保迁移可重复执行无副作用 |
| **小步快跑** | 每个迁移只做一件事，降低风险 |
| **数据验证** | 迁移后运行数据完整性检查 |
| **影子读取** | 新 schema 并行验证后再切换写入 |
| **Schema-as-Code** | 使用 HCL/Prisma Schema 声明式管理数据库 |
| **GitOps 迁移** | PR 审查迁移，自动化部署到各环境 |
| **AI 辅助审查** | 利用 AI 检测破坏性变更和性能隐患 |

---

## 参考资源

- [Prisma Migrate 文档](https://www.prisma.io/docs/orm/prisma-migrate) 📚
- [Drizzle Kit 文档](https://orm.drizzle.team/docs/migrations) 📚
- [Flyway 数据库迁移](https://documentation.red-gate.com/flyway) 📚
- [Liquibase 官方文档](https://docs.liquibase.com) 📚
- [Atlas 文档](https://atlasgo.io) 📚
- [PostgreSQL 零停机迁移](https://www.postgresql.org/docs/current/sql-altertable.html) 📚
- [gh-ost GitHub 仓库](https://github.com/github/gh-ost) 📚
- [Percona Toolkit pt-online-schema-change](https://docs.percona.com/percona-toolkit/pt-online-schema-change.html) 📚
- [AWS Database Migration Service](https://docs.aws.amazon.com/dms/) 📚
- [Debezium 官方文档](https://debezium.io/documentation/) 📚
- [State of Databases 2026](https://stateofdb.com) 📊
- [Gartner Hype Cycle for Data Management 2025](https://www.gartner.com) 📊
