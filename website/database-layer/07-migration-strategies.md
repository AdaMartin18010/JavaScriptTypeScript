# 07. 迁移策略与版本控制

## 迁移类型

| 类型 | 说明 | 工具 |
|------|------|------|
| Schema 迁移 | 表结构变更 | Drizzle Kit, Prisma Migrate |
| 数据迁移 | 数据转换 | 自定义脚本, pg-dump |
| 种子数据 | 初始化数据 | Prisma Seed, 自定义脚本 |

## 零停机迁移原则

### 1. 向后兼容变更

```sql
-- ✅ 安全: 添加可空列
ALTER TABLE users ADD COLUMN bio TEXT;

-- ⚠️ 谨慎: 添加非空列 (需默认值)
ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

-- ❌ 危险: 删除列 (先确认无代码引用)
-- ALTER TABLE users DROP COLUMN old_field;
```

### 2. 扩展-收缩模式 (Expand-Contract)

```sql
-- Phase 1: 扩展 (Deploy 1)
ALTER TABLE users ADD COLUMN email_new TEXT;
-- 应用代码同时读写 email 和 email_new

-- Phase 2: 数据同步
UPDATE users SET email_new = email;

-- Phase 3: 切换 (Deploy 2)
-- 应用代码只读写 email_new

-- Phase 4: 收缩 (Deploy 3)
ALTER TABLE users DROP COLUMN email;
ALTER TABLE users RENAME COLUMN email_new TO email;
```

## Drizzle 迁移工作流

```bash
# 1. 修改 schema.ts
# 2. 生成迁移
npx drizzle-kit generate

# 3. 审查生成的 SQL
# cat drizzle/0001_add_user_bio.sql

# 4. 本地测试
npx drizzle-kit migrate

# 5. 生产部署
npx drizzle-kit migrate  # CI/CD 中执行
```

## Prisma 迁移工作流

```bash
# 开发环境
npx prisma migrate dev --name add_user_bio

# 生成 SQL 文件供审查
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script

# 生产部署 (只执行，不生成)
npx prisma migrate deploy
```

## 回滚策略

```bash
# Drizzle: 手动回滚
npx drizzle-kit drop  # 删除最后一次迁移
# 或手动执行 DOWN SQL

# Prisma: 无原生回滚，需手动
# 1. 创建修复迁移
npx prisma migrate dev --create-only
# 2. 编辑 SQL 为回滚操作
# 3. 执行
```

## CI/CD 集成

```yaml
# .github/workflows/migrate.yml
name: Database Migration

on:
  push:
    branches: [main]
    paths: ['db/schema.ts', 'prisma/schema.prisma']

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
      - name: Install
        run: npm ci
      - name: Run Migrations
        run: npx drizzle-kit migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## 延伸阅读

- [Prisma Migrate 文档](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Drizzle Kit 迁移](https://orm.drizzle.team/kit-docs/overview)
