# 现代 ORM 实验室 — 理论基础

## 1. ORM 的本质

对象关系映射（ORM）是面向对象编程与关系型数据库之间的**阻抗匹配层**。核心问题：如何将继承、多态、集合等 OOP 概念映射到表、行、外键等关系模型。

## 2. 两种设计哲学

### 2.1 Active Record（以 Django、Rails、Prisma 早期为代表）

- 模型类即数据访问层
- 简洁直观，适合简单 CRUD
- 风险：业务逻辑与数据访问耦合

### 2.2 Data Mapper（以 TypeORM、Drizzle、SQLAlchemy 为代表）

- 实体（Entity）与仓储（Repository）分离
- 领域模型纯净，不依赖持久化细节
- 适合复杂业务领域

## 3. 类型安全查询

现代 ORM 的核心竞争力是**编译时类型安全**：

```typescript
// Drizzle: 纯 SQL 抽象，零运行时开销
const result = await db.select().from(users).where(eq(users.age, 25))
// result 类型自动推断为 User[]

// Prisma: 声明式 Schema，自动生成类型
const user = await prisma.user.findUnique({ where: { id: 1 } })
// user 类型为 User | null
```

## 4. 边缘数据库适配

边缘计算环境对 ORM 提出新要求：

- **连接池限制**: 边缘函数无持久连接，需 HTTP 协议数据库（如 Turso HTTP mode）
- **WASM 编译**: Prisma 7 将查询引擎编译为 WASM，在边缘运行
- **轻量级驱动**: LibSQL（Turso）比 SQLite 更适合边缘场景

## 5. 迁移策略

| 策略 | 特点 | 工具 |
|------|------|------|
| **声明式** | Schema 定义即真相 | Prisma Migrate、Django Migrations |
| **命令式** | 手写迁移脚本 | Flyway、Liquibase、node-pg-migrate |
| **混合式** | 声明式生成 + 手动调整 | Alembic、TypeORM Migrations |

## 6. 与相邻模块的关系

- **20-database-orm**: 数据库与 ORM 基础概念
- **32-edge-computing**: 边缘环境下的数据库访问
- **93-deployment-edge-lab**: 边缘部署中的数据持久化
