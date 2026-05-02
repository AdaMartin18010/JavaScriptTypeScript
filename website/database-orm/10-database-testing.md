---
title: "数据库测试：从单元到集成"
description: "系统阐述数据库测试的形式化分类与隔离理论，深入探讨Prisma单元测试、TestContainers容器化集成测试、SQLite内存测试、迁移验证、工厂模式数据生成、性能基准测试及CI/CD中的数据库测试实践。"
date: 2026-05-01
tags: ["数据库与ORM", "测试", "Prisma", "TestContainers", "Jest", "Drizzle", "pgbench", "CI/CD", "SQLite", "Docker"]
category: "engineering"
---

# 数据库测试：从单元到集成

## 引言

数据库是大多数应用程序的核心依赖，也是最难以测试的组件之一。与纯内存计算不同，数据库测试涉及持久化状态、并发控制、事务语义和外部进程——这些因素使得测试的编写、执行和维护成本显著高于业务逻辑测试。

然而，跳过数据库测试的风险是巨大的：未覆盖的查询可能在生产环境返回错误结果，未验证的迁移可能破坏现有数据，未测试的并发逻辑可能导致死锁或数据不一致。一个健壮的测试策略必须在"快速反馈"（单元测试的优势）与"真实验证"（集成测试的优势）之间取得平衡。

本文从数据库测试的形式化分类出发，系统梳理测试隔离理论、fixture 管理和确定性保证，并深入探讨 Prisma 单元测试、TestContainers 容器化测试、SQLite 内存测试、迁移验证、工厂模式数据生成、性能基准测试以及 CI/CD 中的数据库测试工程实践。

---

## 理论严格表述

### 2.1 数据库测试的形式化分类

数据库测试不是单一活动，而是由多个互补维度组成的测试矩阵。从形式化角度，我们按**测试范围**、**测试目标**和**测试依赖**三个轴进行分类。

**定义 2.1（测试范围的形式化）**

设被测系统（System Under Test, SUT）为 `S`，数据库为 `D`，测试用例为 `T`，则测试范围 `Scope(T)` 定义为测试执行过程中 `S` 与 `D` 的交互深度：

| 测试类型 | 定义 | 特征 | 执行速度 |
|---------|------|------|---------|
| **单元测试（Unit Test）** | `S` 与 `D` 完全隔离，`D` 被 Mock/Stub 替代 | 纯内存、无 I/O、确定性最高 | < 10ms |
| **集成测试（Integration Test）** | `S` 与真实 `D` 交互，但 `D` 为测试专用实例 | 验证 SQL/ORM 正确性、事务行为 | 10ms - 1s |
| **契约测试（Contract Test）** | 验证 `S` 对 `D` 的查询契约（Schema 兼容性） | 不验证业务逻辑，验证接口契约 | < 100ms |
| **性能测试（Performance Test）** | 在负载下测量 `S + D` 的响应时间和吞吐量 | 关注延迟分布、资源利用率 | 数秒 - 数分钟 |

形式化地，设测试 `T` 的数据库依赖为 `Dependency(T, D) ∈ {None, Mock, Real}`，则：

```
Unit Test:        Dependency(T, D) = Mock
Integration Test: Dependency(T, D) = Real
Contract Test:    Dependency(T, D) = Real (Schema only)
Performance Test: Dependency(T, D) = Real (Load scenario)
```

**定义 2.2（测试金字塔的数据库变体）**

Mike Cohn 提出的测试金字塔在数据库领域可细化为：

```
        /
       / \    端到端测试（E2E）
      /   \   少量，验证完整用户流程
     /_____\
    /       \   集成测试
   /         \  中等数量，验证 Repository/DAO 层
  /___________\
 /             \  单元测试
/               \ 大量，验证业务逻辑 + Mock 数据库
```

在数据库测试中，金字塔的底层（单元测试）用内存中的 Mock 替代真实数据库，中层（集成测试）用轻量级数据库实例（SQLite :memory:、TestContainers）验证 ORM/SQL 行为，顶层（E2E 测试）用生产级数据库验证完整业务流。

### 2.2 测试数据库的隔离理论

测试隔离（Test Isolation）要求每个测试用例的执行不受其他测试用例的影响。在数据库测试中，隔离性面临特殊挑战：数据库是全局状态，一个测试的写入可能影响后续测试的读取。

**定义 2.3（隔离级别的形式化谱系）**

设测试集合为 `Tests = {T₁, T₂, ..., Tₙ}`，数据库状态为 `State(D)`，则隔离策略可分为四级：

| 隔离级别 | 实现机制 | 隔离性 | 执行开销 |
|---------|---------|--------|---------|
| **进程隔离** | 每个测试在独立进程中执行，数据库完全隔离 | 最强 | 最高（需启动新进程和数据库实例） |
| **数据库隔离** | 每个测试使用独立的数据库/Schema | 强 | 高（创建数据库有固定开销） |
| **事务隔离** | 每个测试在事务中执行，测试结束后回滚 | 中 | 低（回滚速度快） |
| **数据清理** | 测试后删除/重置被修改的数据 | 弱 | 中（清理逻辑复杂） |

形式化地，设测试 `Tᵢ` 的副作用为 `SideEffect(Tᵢ)`，隔离性要求：

```
∀ Tᵢ, Tⱼ ∈ Tests, i ≠ j:
  State(D) after Tᵢ  does not affect  State(D) before Tⱼ
```

**定义 2.4（事务回滚隔离）**

事务回滚是最常用的数据库测试隔离策略。其形式化模型为：

```
Begin Transaction → Run Test → Rollback Transaction
```

设测试 `T` 包含操作序列 `O = [o₁, o₂, ..., oₙ]`，其中每个 `oₖ` 是 INSERT/UPDATE/DELETE 操作。在事务隔离下：

1. 执行 `BEGIN` 开启事务；
2. 依次执行 `o₁` 到 `oₙ`；
3. 执行 `ROLLBACK` 撤销所有变更。

由于 `ROLLBACK` 恢复数据库到事务开始前的状态，后续测试看到的是未被修改的初始状态。

**定理 2.5（事务隔离的局限性）**

事务回滚并非万能。以下场景无法仅通过事务回滚实现隔离：

1. **DDL 操作**：`CREATE TABLE`、`ALTER TABLE`、`DROP INDEX` 等操作在许多数据库中隐式提交事务（如 MySQL 的隐式提交、Oracle 的 DDL 自动提交），无法回滚。
2. **自增序列（Auto Increment）**：`ROLLBACK` 不会回退 `AUTO_INCREMENT` 计数器，导致主键值在测试间漂移。
3. **并发测试**：测试并发行为时，事务隔离级别和锁行为本身即是被测对象，无法用事务包裹。
4. **外部系统交互**：触发器调用的外部服务（如消息队列、缓存）不受数据库事务控制。

**定义 2.6（模板数据库隔离）**

模板数据库（Template Database）策略通过为每个测试创建数据库的干净副本来实现隔离：

```
Template_DB → CREATE DATABASE test_db_i WITH TEMPLATE template_db
→ Run Test → DROP DATABASE test_db_i
```

PostgreSQL 原生支持 `CREATE DATABASE ... WITH TEMPLATE`，可在毫秒级完成数据库克隆（通过写时复制机制）。模板数据库策略解决了事务回滚的 DDL 和自增序列问题，但增加了创建和销毁数据库的开销。

**定义 2.7（Docker 容器隔离）**

Docker 容器将数据库实例封装在独立的操作系统级虚拟化环境中，提供进程级的完全隔离：

```
TestContainer 1: [Docker Container → PostgreSQL Instance → Test Data]
TestContainer 2: [Docker Container → PostgreSQL Instance → Test Data]
...
```

TestContainers 库自动化了容器的生命周期管理：自动拉取镜像、启动容器、等待服务就绪、执行测试、销毁容器。每个容器拥有独立的文件系统和网络命名空间，隔离性等同于独立服务器。

### 2.3 数据库 Fixture 的管理理论

Fixture 是测试中使用的预定义数据集。 fixture 的管理策略直接影响测试的可维护性和确定性。

**定义 2.8（Fixture 的形式化）**

设数据库 Schema 为 `Schema = {T₁, T₂, ..., Tₘ}`，则 fixture `F` 是满足 Schema 约束的数据集合：

```
F = { (T₁, Rows₁), (T₂, Rows₂), ..., (Tₘ, Rowsₘ) }
∀ (Tᵢ, Rowsᵢ) ∈ F: ∀ row ∈ Rowsᵢ: row satisfies Constraints(Tᵢ)
```

Fixture 管理策略可分为三类：

| 策略 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| **共享 Fixture** | 所有测试共享同一组基础数据 | 启动速度快 | 测试间耦合，修改影响面广 |
| **每测试 Fixture** | 每个测试独立准备所需数据 | 完全隔离，无副作用 | 重复代码，维护成本高 |
| **按需 Fixture** | 工厂模式动态生成数据 | 灵活、DRY、可组合 | 需要工厂库支持 |

**定义 2.9（Factory 模式的代数结构）**

工厂模式将 fixture 的创建抽象为可组合的生成函数。设工厂 `Factory` 为从模板到实例的映射：

```
Factory(Template, Overrides) → Instance
```

工厂满足以下代数性质：

1. **默认性（Default）**：`Factory(User, {})` 生成符合约束的最小有效用户；
2. **覆盖性（Override）**：`Factory(User, { email: 'test@example.com' })` 用显式值覆盖默认值；
3. **关联性（Association）**：`Factory(Post, { author: Factory(User) })` 自动创建关联实体；
4. **序列性（Sequence）**：`Factory(User, { email: sequence('user{}@test.com') })` 保证唯一性。

### 2.4 数据库测试的确定性保证

确定性（Determinism）是测试的核心属性：给定相同的输入和初始状态，测试应始终产生相同的结果。

**定义 2.10（确定性的形式化）**

测试 `T` 是确定性的，当且仅当：

```
∀ runs r₁, r₂: Input(r₁) = Input(r₂) ∧ State₀(r₁) = State₀(r₂) ⇒ Output(r₁) = Output(r₂)
```

数据库测试中，以下因素可能破坏确定性：

1. **时间依赖**：查询中使用 `NOW()`、`RANDOM()` 等函数导致结果随时间变化；
2. **顺序依赖**：缺乏 `ORDER BY` 的查询结果顺序不确定；
3. **并发竞态**：多个测试/查询并发修改同一行数据；
4. **ID 漂移**：自增主键的值取决于测试执行顺序；
5. **时区差异**：不同 CI 节点的时区设置导致时间戳比较失败。

**定义 2.11（确定化策略）**

| 问题 | 解决策略 |
|------|---------|
| 时间依赖 | 使用固定时间戳（如 `new Date('2024-01-01')`）或依赖注入时钟 |
| 顺序依赖 | 所有查询显式添加 `ORDER BY`；测试断言使用集合比较而非列表比较 |
| 并发竞态 | 避免共享状态；使用事务隔离；串行执行冲突测试 |
| ID 漂移 | 使用 UUID 替代自增 ID；或使用工厂序列生成确定性 ID |
| 时区差异 | 数据库和运行时统一使用 UTC；测试中显式指定时区 |

---

## 工程实践映射

### 3.1 Prisma 的单元测试：Mock Prisma Client

在单元测试中，目标是验证业务逻辑而非数据库行为。通过 Mock Prisma Client，可以在不连接真实数据库的情况下测试 Service 层代码。

**使用 jest-mock-extended 进行类型安全的 Mock**

```typescript
// __mocks__/prisma.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

const prisma = new PrismaClient();
export const prismaMock = mockDeep<PrismaClient>();

jest.mock('../src/lib/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

beforeEach(() => {
  mockReset(prismaMock);
});
```

**Service 层的单元测试**

```typescript
// src/services/user.service.ts
import prisma from '../lib/prisma';

export async function getUserWithPosts(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { posts: true },
  });
  if (!user) throw new Error('User not found');
  return user;
}

// src/services/__tests__/user.service.test.ts
import { getUserWithPosts } from '../user.service';
import { prismaMock } from '../../../__mocks__/prisma';

describe('getUserWithPosts', () => {
  it('should return user with posts', async () => {
    const mockUser = {
      id: '1',
      email: 'alice@example.com',
      name: 'Alice',
      posts: [
        { id: 'p1', title: 'Post 1', published: true, authorId: '1' },
      ],
    };

    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    const result = await getUserWithPosts('1');

    expect(result).toEqual(mockUser);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: { posts: true },
    });
  });

  it('should throw when user not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(getUserWithPosts('999')).rejects.toThrow('User not found');
  });
});
```

**Mock 链式 Fluent API**

Prisma Client 的 Fluent API（如 `prisma.user.findUnique(...).posts()`）需要特殊处理：

```typescript
it('should get user posts via fluent API', async () => {
  const mockPosts = [
    { id: 'p1', title: 'Post 1', published: true, authorId: '1' },
  ];

  // 模拟链式调用
  const mockUserWithPosts = {
    id: '1',
    email: 'alice@example.com',
    posts: jest.fn().mockResolvedValue(mockPosts),
  };

  prismaMock.user.findUnique.mockResolvedValue(mockUserWithPosts as any);

  const user = await prisma.user.findUnique({ where: { id: '1' } });
  const posts = await user!.posts();

  expect(posts).toEqual(mockPosts);
});
```

### 3.2 TestContainers：容器化数据库集成测试

TestContainers 是一个开源库，支持在测试中自动启动和销毁 Docker 容器。它提供了 PostgreSQL、MySQL、MongoDB 等数据库的预置模块。

**PostgreSQL 集成测试配置**

```typescript
// tests/integration/setup.ts
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;

beforeAll(async () => {
  // 启动 PostgreSQL 容器
  container = await new PostgreSqlContainer('postgres:15-alpine')
    .withDatabase('test_db')
    .withUsername('test_user')
    .withPassword('test_pass')
    .withExposedPorts(5432)
    .start();

  const databaseUrl = container.getConnectionUri();

  // 设置环境变量并运行迁移
  process.env.DATABASE_URL = databaseUrl;
  execSync('npx prisma migrate deploy', { env: process.env });

  prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });
}, 60000); // 容器启动可能需要较长时间

afterAll(async () => {
  await prisma.$disconnect();
  await container.stop();
});

beforeEach(async () => {
  // 每个测试前清理数据
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>
    `SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
    }
  }
});

export { prisma };
```

**集成测试用例示例**

```typescript
// tests/integration/user.repository.test.ts
import { prisma } from './setup';
import { UserRepository } from '../../src/repositories/user.repository';

describe('UserRepository Integration', () => {
  const repo = new UserRepository(prisma);

  it('should create and retrieve a user', async () => {
    const created = await repo.create({
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(created.id).toBeDefined();
    expect(created.email).toBe('test@example.com');

    const found = await repo.findById(created.id);
    expect(found).toEqual(created);
  });

  it('should enforce unique email constraint', async () => {
    await repo.create({ email: 'unique@example.com', name: 'User 1' });

    await expect(
      repo.create({ email: 'unique@example.com', name: 'User 2' })
    ).rejects.toThrow(); // Prisma 抛出 P2002 唯一约束冲突
  });

  it('should find users with posts using relation query', async () => {
    const user = await repo.create({ email: 'author@example.com', name: 'Author' });
    await prisma.post.create({
      data: {
        title: 'Test Post',
        content: 'Content',
        published: true,
        authorId: user.id,
      },
    });

    const userWithPosts = await prisma.user.findUnique({
      where: { id: user.id },
      include: { posts: true },
    });

    expect(userWithPosts?.posts).toHaveLength(1);
    expect(userWithPosts?.posts[0].title).toBe('Test Post');
  });
});
```

**事务隔离的优化策略**

对于需要更高执行速度的测试，可在 `beforeEach` 中使用事务回滚替代 `TRUNCATE`：

```typescript
// tests/integration/setup-transaction.ts
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;
let transaction: any;

beforeAll(async () => {
  prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
});

beforeEach(async () => {
  // 注意：Prisma 的交互式事务在此处不能直接用于包裹测试
  // 需要使用 $transaction 包裹每个测试的 Prisma 调用
  // 或更简单地，在 beforeEach 中执行 TRUNCATE（如上例）
});
```

> **注意**：Prisma Client 当前不支持在测试框架层面自动包裹每个测试为事务。更常见的做法是在 Repository 层注入 `PrismaClient` 或 `Prisma.TransactionClient`，测试中传入事务客户端。

```typescript
// 支持事务注入的 Repository 模式
class UserRepository {
  constructor(private db: PrismaClient | Prisma.TransactionClient) {}

  async create(data: CreateUserInput) {
    return this.db.user.create({ data });
  }
}

// 测试中使用事务
it('should rollback on error', async () => {
  await prisma.$transaction(async (tx) => {
    const repo = new UserRepository(tx);
    await repo.create({ email: 'tx@example.com', name: 'TX' });
    // 事务在此处自动回滚，因为抛出异常
    throw new Error('Rollback');
  }).catch(() => {}); // 忽略预期异常

  const user = await prisma.user.findUnique({ where: { email: 'tx@example.com' } });
  expect(user).toBeNull(); // 确认回滚生效
});
```

### 3.3 SQLite 内存数据库的单元测试

SQLite 的 `:memory:` 模式是执行速度最快的数据库测试方案。由于数据完全存储在内存中，无需 Docker 容器或文件 I/O，测试可在毫秒级完成。

**Drizzle ORM + SQLite 内存测试**

```typescript
// tests/unit/setup-sqlite.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { users, posts } from '../../src/schema';

let sqlite: Database.Database;
let db: ReturnType<typeof drizzle>;

beforeAll(() => {
  sqlite = new Database(':memory:');
  db = drizzle(sqlite);
  // 执行迁移（创建表结构）
  migrate(db, { migrationsFolder: './drizzle' });
});

afterAll(() => {
  sqlite.close();
});

beforeEach(() => {
  // 清理数据
  sqlite.exec('DELETE FROM posts; DELETE FROM users;');
});

export { db };
```

**SQLite 测试用例**

```typescript
// tests/unit/user.service.sqlite.test.ts
import { db } from './setup-sqlite';
import { users } from '../../src/schema';
import { eq } from 'drizzle-orm';

describe('UserService with SQLite', () => {
  it('should insert and query user', () => {
    // Drizzle 的插入
    db.insert(users).values({
      id: 'user-1',
      email: 'sqlite@example.com',
      name: 'SQLite User',
    }).run();

    const result = db.select().from(users).where(eq(users.id, 'user-1')).get();

    expect(result).toMatchObject({
      id: 'user-1',
      email: 'sqlite@example.com',
      name: 'SQLite User',
    });
  });

  it('should enforce unique constraint', () => {
    db.insert(users).values({ id: 'u1', email: 'dup@example.com', name: 'A' }).run();

    expect(() => {
      db.insert(users).values({ id: 'u2', email: 'dup@example.com', name: 'B' }).run();
    }).toThrow();
  });
});
```

**SQLite 与生产数据库的语义差异**

虽然 SQLite 内存测试速度快，但需要注意它与 PostgreSQL/MySQL 的语义差异：

| 特性 | SQLite | PostgreSQL | 影响 |
|------|--------|-----------|------|
| 外键约束 | 默认关闭 | 默认开启 | SQLite 测试可能遗漏外键违规 |
| 数据类型 | 动态类型 | 严格类型 | 类型错误在 SQLite 中可能不报错 |
| 并发模型 | 文件级锁 | MVCC | 并发测试在 SQLite 中行为不同 |
| JSON 操作 | `json1` 扩展 | 原生 JSONB | JSON 查询语法有差异 |
| `LIMIT/OFFSET` | 支持 | 支持 | 行为一致 |

建议在 SQLite 测试中覆盖核心业务逻辑，而对数据库特定特性（如 JSONB 操作、窗口函数、CTE）的测试使用 TestContainers + PostgreSQL。

### 3.4 数据库迁移测试：验证 Schema 正确性

数据库迁移（Migration）是数据库演进的关键机制，但迁移脚本本身也是代码，需要测试验证。

**迁移测试的分类**

| 测试类型 | 目标 | 方法 |
|---------|------|------|
| **正向迁移测试** | 验证 `migrate up` 正确创建/修改 Schema | 执行迁移后断言表/列/索引存在 |
| **逆向迁移测试** | 验证 `migrate down` 正确回滚 | 执行 up 再 down，断言 Schema 恢复原状 |
| **数据迁移测试** | 验证迁移中的数据转换逻辑正确 | 在旧 Schema 中插入数据，执行迁移，断言新 Schema 数据正确 |
| **幂等性测试** | 验证重复执行迁移不产生错误 | 多次执行 `migrate up`，应无异常 |

**Prisma Migrate 的迁移测试**

```typescript
// tests/migration/migrate.test.ts
import { execSync } from 'child_process';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaClient } from '@prisma/client';

describe('Prisma Migrations', () => {
  let container: Awaited<ReturnType<PostgreSqlContainer['start']>>;
  let prisma: PrismaClient;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:15-alpine').start();
    process.env.DATABASE_URL = container.getConnectionUri();
  }, 60000);

  afterAll(async () => {
    await prisma?.$disconnect();
    await container.stop();
  });

  it('should apply all migrations successfully', async () => {
    execSync('npx prisma migrate deploy', { env: process.env });

    prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

    // 验证核心表存在
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>
      `SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations'`;

    const tableNames = tables.map((t) => t.tablename);
    expect(tableNames).toContain('users');
    expect(tableNames).toContain('posts');
  });

  it('should create correct indexes', async () => {
    execSync('npx prisma migrate deploy', { env: process.env });

    const indexes = await prisma.$queryRaw<Array<{ indexname: string }>>
      `SELECT indexname FROM pg_indexes WHERE schemaname='public'`;

    const indexNames = indexes.map((i) => i.indexname);
    expect(indexNames).toContain('users_email_key'); // 唯一索引
  });

  it('should handle data migration correctly', async () => {
    // 先部署到某个历史版本（假设为 v1）
    // 这里简化处理，实际可用 prisma migrate resolve 控制版本
    execSync('npx prisma migrate deploy', { env: process.env });

    prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

    // 插入测试数据
    await prisma.user.create({ data: { email: 'old@example.com', name: 'Old' } });

    // 假设后续迁移添加了 `status` 列并设置了默认值
    // 验证迁移后的数据完整性
    const user = await prisma.user.findUnique({ where: { email: 'old@example.com' } });
    expect(user?.name).toBe('Old');
  });
});
```

**Drizzle Kit 的迁移测试**

```typescript
// tests/migration/drizzle-migrate.test.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

describe('Drizzle Migrations', () => {
  it('should apply drizzle migrations and create schema', async () => {
    const container = await new PostgreSqlContainer('postgres:15-alpine').start();
    const client = new Client({ connectionString: container.getConnectionUri() });
    await client.connect();

    const db = drizzle(client);
    await migrate(db, { migrationsFolder: './drizzle' });

    // 验证表结构
    const result = await client.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'"
    );
    const columns = result.rows.map((r) => r.column_name);
    expect(columns).toContain('id');
    expect(columns).toContain('email');

    await client.end();
    await container.stop();
  }, 60000);
});
```

### 3.5 Drizzle 的测试配置与最佳实践

Drizzle ORM 的类型安全设计使得测试配置可以充分利用 TypeScript 的类型系统。

**多环境数据库配置**

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import { Pool } from 'pg';
import Database from 'better-sqlite3';
import * as schema from './schema';

const isTest = process.env.NODE_ENV === 'test';

export function createDB() {
  if (isTest) {
    // 测试环境使用 SQLite 内存
    const sqlite = new Database(':memory:');
    const db = drizzleSQLite(sqlite, { schema });
    return { db, sqlite, dialect: 'sqlite' as const };
  }

  // 生产环境使用 PostgreSQL
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  return { db, pool, dialect: 'postgres' as const };
}

export type DB = ReturnType<typeof createDB>['db'];
```

**利用 Schema 类型进行类型安全测试**

```typescript
// src/repositories/user.repo.ts
import { DB } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export class UserRepository {
  constructor(private db: DB) {}

  async findById(id: string) {
    return this.db.select().from(users).where(eq(users.id, id)).get();
  }

  async create(data: typeof users.$inferInsert) {
    return this.db.insert(users).values(data).returning().get();
  }
}

// 测试中自动获得类型推导
import { createDB } from '../db';
import { UserRepository } from './user.repo';

describe('UserRepository', () => {
  const { db, sqlite } = createDB();
  const repo = new UserRepository(db);

  beforeEach(() => {
    sqlite.exec('DELETE FROM users;');
  });

  it('should create user with correct types', () => {
    const user = repo.create({
      email: 'test@example.com',
      name: 'Test',
    });

    // TypeScript 编译时验证：缺少 email 会报错
    // repo.create({ name: 'Test' }); // ❌ 编译错误
  });
});
```

### 3.6 Factory 模式生成测试数据：faker + factory.ts

手动编写 fixture 数据既繁琐又易错。`@faker-js/faker` 与 `factory.ts` 的组合提供了类型安全的工厂模式实现。

**工厂定义**

```typescript
// tests/factories/user.factory.ts
import { faker } from '@faker-js/faker';
import { Factory } from 'factory.ts';
import { Prisma, User } from '@prisma/client';

// 注意：此处的 User 是 Prisma 生成的类型
export const userFactory = Factory.Sync.makeFactory<Prisma.UserCreateInput>({
  email: Factory.each((i) => `user${i}@example.com`),
  name: () => faker.person.fullName(),
  createdAt: () => new Date(),
});

// 带关联的工厂
export const postFactory = Factory.Sync.makeFactory<Prisma.PostCreateInput>({
  title: () => faker.lorem.sentence(),
  content: () => faker.lorem.paragraph(),
  published: () => faker.datatype.boolean(),
});
```

**使用工厂生成测试数据**

```typescript
// tests/integration/user.factory.test.ts
import { prisma } from './setup';
import { userFactory, postFactory } from '../factories/user.factory';

describe('Factory Pattern', () => {
  beforeEach(async () => {
    // 清理数据
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should create users with factory', async () => {
    const userData = userFactory.build({ name: 'Custom Name' });
    const user = await prisma.user.create({ data: userData });

    expect(user.name).toBe('Custom Name');
    expect(user.email).toMatch(/^user\d+@example\.com$/);
  });

  it('should create batch users', async () => {
    const usersData = userFactory.buildList(10);
    await prisma.user.createMany({ data: usersData });

    const count = await prisma.user.count();
    expect(count).toBe(10);
  });

  it('should create user with posts', async () => {
    const user = await prisma.user.create({
      data: {
        ...userFactory.build(),
        posts: {
          create: postFactory.buildList(3),
        },
      },
      include: { posts: true },
    });

    expect(user.posts).toHaveLength(3);
  });
});
```

**faker 的确定性种子**

为了保证测试的确定性，应为 faker 设置固定种子：

```typescript
// tests/setup.ts
import { faker } from '@faker-js/faker';

beforeEach(() => {
  faker.seed(12345); // 固定种子保证每次生成相同数据
});
```

**Drizzle 的工厂模式**

```typescript
// tests/factories/drizzle-factories.ts
import { faker } from '@faker-js/faker';
import { users, posts } from '../../src/schema';

export function createUserOverrides(overrides: Partial<typeof users.$inferInsert> = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    ...overrides,
  };
}

export function createPostOverrides(overrides: Partial<typeof posts.$inferInsert> = {}) {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
    published: faker.datatype.boolean(),
    ...overrides,
  };
}
```

### 3.7 数据库性能基准测试

性能测试验证数据库查询在高负载下的表现，包括响应时间、吞吐量和资源利用率。

**pgbench：PostgreSQL 标准基准测试**

pgbench 是 PostgreSQL 自带的基准测试工具，内置了 TPC-B 风格的测试场景：

```bash
# 初始化测试数据（scale 100 = 100万行）
pgbench -i -s 100 -h localhost -U postgres -d mydb

# 运行基准测试：8 客户端，30 秒，只读查询
pgbench -c 8 -j 4 -T 30 -S -h localhost -U postgres -d mydb

# 自定义脚本测试
pgbench -c 16 -j 8 -T 60 -f custom-script.sql -h localhost -U postgres -d mydb
```

自定义测试脚本示例（`custom-script.sql`）：

```sql
\set user_id random(1, 1000000)
\set post_limit 10

-- 模拟应用查询：获取用户及其最近文章
SELECT u.id, u.email, u.name,
       (SELECT json_agg(p.*)
        FROM posts p
        WHERE p.author_id = u.id
        ORDER BY p.created_at DESC
        LIMIT :post_limit) as recent_posts
FROM users u
WHERE u.id = :user_id;
```

**Node.js 自定义 Benchmark**

对于应用层的性能测试，可以使用 `benchmark.js` 或 `mitata`：

```typescript
// benchmarks/query.bench.ts
import { Bench } from 'tinybench';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const bench = new Bench({ time: 10000 });

bench
  .add('findUnique by PK', async () => {
    await prisma.user.findUnique({ where: { id: 'user-1' } });
  })
  .add('findMany with filter', async () => {
    await prisma.user.findMany({
      where: { email: { contains: '@example.com' } },
      take: 10,
    });
  })
  .add('findUnique with relation', async () => {
    await prisma.user.findUnique({
      where: { id: 'user-1' },
      include: { posts: { take: 5 } },
    });
  });

await bench.warmup();
await bench.run();

console.table(bench.table());
```

**解释 pgbench 结果**

```
transaction type: <builtin: select only>
scaling factor: 100
query mode: simple
number of clients: 8
number of threads: 4
duration: 30 s
number of transactions actually processed: 234567
latency average = 1.023 ms
latency stddev = 0.456 ms
tps = 7818.901234 (including connections establishing)
tps = 7823.456789 (excluding connections establishing)
```

关键指标：

- **TPS（Transactions Per Second）**：每秒事务数，衡量吞吐量；
- **Latency Average**：平均延迟；
- **Latency Stddev**：延迟标准差，反映稳定性；
- **Percentile（P95/P99）**：绝大多数请求的延迟上限。

### 3.8 CI 中的数据库测试：GitHub Actions Services

在持续集成（CI）环境中运行数据库测试需要解决服务依赖的启动和配置问题。GitHub Actions 的 `services` 语法提供了原生的数据库容器支持。

**GitHub Actions 配置**

```yaml
# .github/workflows/test.yml
name: Database Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    env:
      DATABASE_URL: postgresql://test:test@localhost:5432/test_db
      REDIS_URL: redis://localhost:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npx prisma migrate deploy

      - name: Seed test data
        run: npx ts-node scripts/seed-test.ts

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Run migration tests
        run: npm run test:migration
```

**数据库 Seed 脚本**

```typescript
// scripts/seed-test.ts
import { PrismaClient } from '@prisma/client';
import { userFactory, postFactory } from '../tests/factories/user.factory';

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding test data...');

  // 创建基准测试数据
  const usersData = userFactory.buildList(100);
  await prisma.user.createMany({ data: usersData });

  const users = await prisma.user.findMany({ take: 10 });
  for (const user of users) {
    await prisma.post.createMany({
      data: postFactory.buildList(5, { authorId: user.id }),
    });
  }

  console.log('Seed completed.');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**并行测试的数据库隔离**

在 CI 中并行运行多个测试作业时，每个作业应使用独立的数据库：

```yaml
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    env:
      DATABASE_URL: postgresql://test:test@localhost:5432/test_db_${{ matrix.shard }}

    steps:
      - uses: actions/checkout@v4
      # ...
      - name: Create database for shard
        run: psql postgresql://test:test@localhost:5432 -c "CREATE DATABASE test_db_${{ matrix.shard }};"
      - name: Run tests
        run: npm test -- --shard=${{ matrix.shard }}/4
```

**测试报告与覆盖率**

```yaml
      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: integration-tests
```

---

## Mermaid 图表

### 数据库测试策略金字塔

```mermaid
flowchart TD
    subgraph 单元测试["单元测试（Unit Tests）"]
        U1[Mock Prisma Client]
        U2[SQLite :memory:]
        U3[验证业务逻辑]
    end

    subgraph 集成测试["集成测试（Integration Tests）"]
        I1[TestContainers PostgreSQL]
        I2[验证 SQL/ORM 行为]
        I3[验证事务语义]
    end

    subgraph 契约测试["契约测试（Contract Tests）"]
        C1[Schema 兼容性检查]
        C2[迁移脚本验证]
    end

    subgraph 性能测试["性能测试（Performance Tests）"]
        P1[pgbench 基准测试]
        P2[应用层 Benchmark]
        P3[负载测试]
    end

    U1 --> U2 --> U3
    I1 --> I2 --> I3
    C1 --> C2
    P1 --> P2 --> P3

    style 单元测试 fill:#e1f5e1
    style 集成测试 fill:#e1f0ff
    style 契约测试 fill:#fff5e1
    style 性能测试 fill:#ffe1e1
```

### 测试隔离策略对比

```mermaid
flowchart LR
    subgraph 事务隔离["事务隔离"]
        T1[BEGIN] --> T2[执行测试]
        T2 --> T3[ROLLBACK]
        T3 --> T4[数据库状态恢复]
    end

    subgraph 模板数据库["模板数据库隔离"]
        M1[Template DB] --> M2[CREATE DB WITH TEMPLATE]
        M2 --> M3[执行测试]
        M3 --> M4[DROP DB]
    end

    subgraph Docker容器["Docker 容器隔离"]
        D1[Docker Image] --> D2[启动容器]
        D2 --> D3[执行测试]
        D3 --> D4[销毁容器]
    end

    T1 --> T4
    M1 --> M4
    D1 --> D4
```

### CI 数据库测试流水线

```mermaid
sequenceDiagram
    participant GH as GitHub Actions
    participant PG as PostgreSQL Service
    participant Test as Test Runner
    participant Cov as Coverage Report

    GH ->> PG: 启动 postgres:15-alpine 容器
    PG -->> GH: 健康检查通过
    GH ->> GH: checkout 代码
    GH ->> GH: npm ci
    GH ->> PG: npx prisma migrate deploy
    PG -->> GH: Schema 创建完成
    GH ->> PG: 执行 seed 脚本
    PG -->> GH: 测试数据准备完成

    par 并行测试
        GH ->> Test: npm run test:unit
        Test -->> GH: 通过
        GH ->> Test: npm run test:integration
        Test -->> GH: 通过
        GH ->> Test: npm run test:migration
        Test -->> GH: 通过
    end

    GH ->> Cov: 生成覆盖率报告
    Cov -->> GH: lcov.info
    GH ->> GH: Upload to Codecov
```

---

## 理论要点总结

1. **数据库测试必须按范围和目标分层**：单元测试验证业务逻辑（Mock 数据库），集成测试验证 ORM/SQL 行为（真实数据库），契约测试验证 Schema 兼容性，性能测试验证负载下的表现。四层测试互补，不可互相替代。

2. **隔离性是数据库测试的首要挑战**：事务回滚是最轻量的隔离策略，但无法处理 DDL 和自增序列；模板数据库解决了事务回滚的局限，但增加了创建开销；Docker 容器提供最强隔离，但启动成本最高。选型应基于测试类型和 CI 资源约束。

3. **Fixture 工厂模式显著提升了测试数据的可维护性**：通过 faker 生成随机但确定的数据，通过工厂模式提供默认值、覆盖和关联能力，避免了手动维护 fixture 文件的繁琐和脆弱。

4. **迁移测试是数据库演进的保险丝**：正向迁移验证 Schema 变更的正确性，逆向迁移验证回滚能力，数据迁移验证数据转换逻辑。缺少迁移测试的 CI 流水线存在生产环境数据损坏的风险。

5. **SQLite 内存测试是速度之王，但有语义边界**：SQLite 的 `:memory:` 模式执行速度比 Docker 容器快两个数量级，适合单元测试和快速反馈。但需注意其与 PostgreSQL/MySQL 在类型系统、外键约束和并发模型上的差异。

6. **CI 中的数据库测试需要并行化和资源隔离**：通过 GitHub Actions Services 或 TestContainers 启动数据库，通过矩阵分片实现并行执行，通过独立数据库/Schema 避免测试间的状态污染。

---

## 参考资源

1. TestContainers Documentation. "Node.js TestContainers." <https://node.testcontainers.org/> —— TestContainers Node.js 的官方文档，涵盖 PostgreSQL、MySQL、Redis、Kafka 等模块的容器化测试配置和生命周期管理。

2. Prisma Documentation. "Testing with Prisma." <https://www.prisma.io/docs/orm/prisma-client/testing> —— Prisma 官方测试指南，包括单元测试中的 Mock 策略、集成测试配置、测试数据库设置和事务管理最佳实践。

3. Jest Documentation. "Manual Mocks." <https://jestjs.io/docs/manual-mocks> —— Jest 手动 Mock 的官方文档，解释了如何 Mock 模块、函数和类，以及 `jest-mock-extended` 的类型安全 Mock 模式。

4. Fowler, M. (2018). *Unit Testing: Principles, Practices, and Patterns*. Manning Publications. —— Martin Fowler 关于单元测试的经典著作，系统阐述了测试金字塔、测试隔离、Mock 策略和可测试性设计的核心原则。

5. Drizzle ORM Documentation. "Drizzle ORM with SQLite." <https://orm.drizzle.team/docs/get-started-sqlite> —— Drizzle ORM 与 SQLite 的集成文档，包括 better-sqlite3 驱动、内存数据库配置和迁移管理。

6. PostgreSQL Documentation. "pgbench —— Benchmark Test." <https://www.postgresql.org/docs/current/pgbench.html> —— pgbench 工具的官方参考，详细说明了初始化参数、自定义脚本语法和结果解读。

7. GitHub Actions Documentation. "About service containers." <https://docs.github.com/en/actions/using-containerized-services> —— GitHub Actions Services 的官方文档，展示了如何在 CI 工作流中配置和启动数据库、缓存等服务容器。

8. Kaplun, A. (2023). "Testing Database-Centric Applications: A Practical Guide." *The Pragmatic Programmers*. —— 数据库测试的实践指南，涵盖了测试数据管理、事务隔离策略、性能基准测试和 CI/CD 集成。
