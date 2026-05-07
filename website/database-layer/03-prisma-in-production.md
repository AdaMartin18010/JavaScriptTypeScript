# 03. Prisma 生产级实践

## 核心优势

Prisma 的最大差异化：**基于 Schema 的代码生成**。Schema 是唯一的真实来源，TypeScript 类型、迁移、客户端全部由此生成。

## Schema 设计最佳实践

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // 用于迁移 (绕过连接池)
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  profile   Profile? @relation(fields: [profileId], references: [id])
  profileId String?  @unique
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@index([createdAt])
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  tags      Tag[]
}

model Profile {
  id     String @id @default(cuid())
  bio    String?
  avatar String?
  user   User?
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  posts Post[]
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

## 客户端模式

### 单例模式

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 扩展客户端 (Middleware)

```typescript
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
}).$extends({
  model: {
    user: {
      async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
      },
    },
  },
});
```

## Edge 部署: Prisma Accelerate

```bash
npm install @prisma/extension-accelerate
```

```typescript
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

// 自动连接池 + 全局缓存
const user = await prisma.user.findUnique({
  where: { id: '1' },
  cacheStrategy: { ttl: 60, swr: 300 },
});
```

## 迁移策略

```bash
# 开发环境
npx prisma migrate dev --name add_user_role

# 部署前检查
npx prisma migrate status

# 生产环境
npx prisma migrate deploy

# 数据修复 (Custom SQL)
prisma migrate dev --create-only
# 编辑生成的 SQL 文件
# 然后执行 migrate dev
```

## 性能优化

```typescript
// 1. 选择字段 (减少数据传输)
await prisma.user.findMany({
  select: { id: true, name: true },
});

// 2. 批量操作
await prisma.user.createMany({
  data: users.map(u => ({ name: u.name, email: u.email })),
  skipDuplicates: true,
});

// 3. 连接查询优化
await prisma.user.findMany({
  include: {
    posts: { take: 5, orderBy: { createdAt: 'desc' } },
  },
});

// 4. 原始 SQL (性能敏感场景)
await prisma.$queryRaw`SELECT * FROM users WHERE age > ${minAge}`;
```

## 延伸阅读

- [Prisma 生产检查清单](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Prisma Accelerate](https://www.prisma.io/data-platform/accelerate)
