# 08. 查询性能优化

## 诊断工具

### 查询日志

```typescript
// Drizzle: 启用日志
const db = drizzle(pool, { logger: true });

// Prisma: 查询日志
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Kysely: 编译时查看
const compiled = db.selectFrom('users').selectAll().compile();
console.log(compiled.sql); // 生成的 SQL
```

### EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
-- 检查是否使用了索引
```

## 常见性能陷阱

### 1. SELECT *

```typescript
// ❌ 获取不需要的字段
await db.select().from(users);

// ✅ 只选择需要的字段
await db.select({ id: users.id, name: users.name }).from(users);
```

### 2. 缺少 LIMIT

```typescript
// ❌ 可能返回百万行
await db.select().from(users);

// ✅ 分页
await db.select().from(users).limit(20).offset(0);
```

### 3. N+1 查询

```typescript
// ❌ 已在 Schema 设计章节讨论
// 解决: JOIN, DataLoader, 或 ORM 的 include/select

// Prisma 的解决方案
await prisma.user.findMany({
  include: { posts: { take: 5 } },
});
// Prisma 自动优化为 JOIN
```

### 4. 全表扫描

```sql
-- ❌ 无索引的 WHERE
SELECT * FROM users WHERE LOWER(name) = 'alice';

-- ✅ 函数索引 (PostgreSQL)
CREATE INDEX idx_users_name_lower ON users (LOWER(name));
```

## 批量操作

```typescript
// Drizzle
await db.insert(users).values([
  { name: 'Alice', email: 'a@example.com' },
  { name: 'Bob', email: 'b@example.com' },
]).onConflictDoNothing();

// Prisma
await prisma.user.createMany({
  data: users,
  skipDuplicates: true,
});
```

## 连接池配置

```typescript
// PostgreSQL (node-postgres)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,        // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Prisma (connection_limit)
// DATABASE_URL="postgresql://...?connection_limit=20"
```

## 查询优化检查清单

- [ ] 使用 `EXPLAIN ANALYZE` 检查执行计划
- [ ] 为 WHERE/JOIN 字段添加索引
- [ ] 避免 `SELECT *`，只取需要的字段
- [ ] 大表查询必加 `LIMIT`
- [ ] 使用批量操作替代循环插入
- [ ] 监控慢查询日志
- [ ] 连接池大小与并发量匹配

## 延伸阅读

- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Prisma Query Optimization](https://www.prisma.io/docs/guides/performance-and-optimization)
