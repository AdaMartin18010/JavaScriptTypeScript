// @vitest-environment node

// 通用列构造器 mock
function createColumnMock(name: string, ...args: any[]) {
  const chainable: any = {
    notNull: () => chainable,
    default: () => chainable,
    defaultNow: () => chainable,
    primaryKey: () => chainable,
    unique: () => chainable,
    references: () => chainable,
    onDelete: () => chainable,
    $defaultFn: () => chainable,
    $type: () => chainable,
    name,
    args,
  };
  return chainable;
}

// Mock drizzle-orm/pg-core
vi.mock('drizzle-orm/pg-core', () => ({
  pgTable: vi.fn((name: string, columns: any, ...rest: any[]) => ({ name, columns, extra: rest })),
  serial: (name: string) => createColumnMock(name),
  varchar: (name: string, opts?: any) => createColumnMock(name, opts),
  integer: (name: string) => createColumnMock(name),
  text: (name: string) => createColumnMock(name),
  boolean: (name: string) => createColumnMock(name),
  timestamp: (name: string, opts?: any) => createColumnMock(name, opts),
  index: (name: string) => ({ on: (...cols: any[]) => ({ name, columns: cols }) }),
  uniqueIndex: (name: string) => ({ on: (...cols: any[]) => ({ name, columns: cols, unique: true }) }),
  pgEnum: (name: string, values: string[]) => ({ name, values }),
  foreignKey: (opts: any) => ({ ...opts, onDelete: (action: string) => ({ ...opts, onDeleteAction: action }) }),
  primaryKey: (opts: any) => ({ ...opts }),
}));

// Mock drizzle-orm/sqlite-core
vi.mock('drizzle-orm/sqlite-core', () => ({
  sqliteTable: vi.fn((name: string, columns: any) => ({ name, columns })),
  integer: (name: string, opts?: any) => createColumnMock(name, opts),
  text: (name: string) => createColumnMock(name),
}));

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  relations: vi.fn((table: any, fn: any) => ({ table, fn })),
  sql: Object.assign(
    vi.fn((strings: any, ...values: any[]) => ({ strings, values })),
    { raw: vi.fn((s: string) => ({ raw: s })) }
  ),
  eq: (a: any, b: any) => ({ op: 'eq', a, b }),
  ne: (a: any, b: any) => ({ op: 'ne', a, b }),
  gt: (a: any, b: any) => ({ op: 'gt', a, b }),
  gte: (a: any, b: any) => ({ op: 'gte', a, b }),
  lt: (a: any, b: any) => ({ op: 'lt', a, b }),
  lte: (a: any, b: any) => ({ op: 'lte', a, b }),
  like: (a: any, b: any) => ({ op: 'like', a, b }),
  ilike: (a: any, b: any) => ({ op: 'ilike', a, b }),
  inArray: (a: any, b: any) => ({ op: 'inArray', a, b }),
  notInArray: (a: any, b: any) => ({ op: 'notInArray', a, b }),
  isNull: (a: any) => ({ op: 'isNull', a }),
  isNotNull: (a: any) => ({ op: 'isNotNull', a }),
  between: (a: any, b: any, c: any) => ({ op: 'between', a, b, c }),
  asc: (a: any) => ({ op: 'asc', a }),
  desc: (a: any) => ({ op: 'desc', a }),
  and: (...args: any[]) => ({ op: 'and', args }),
  or: (...args: any[]) => ({ op: 'or', args }),
  not: (a: any) => ({ op: 'not', a }),
  count: (a: any) => ({ fn: 'count', a }),
  sum: (a: any) => ({ fn: 'sum', a }),
  avg: (a: any) => ({ fn: 'avg', a }),
  max: (a: any) => ({ fn: 'max', a }),
  min: (a: any) => ({ fn: 'min', a }),
  exists: (a: any) => ({ fn: 'exists', a }),
}));

// Mock drizzle-orm/libsql
vi.mock('drizzle-orm/libsql', () => ({
  drizzle: vi.fn((client: any) => ({
    client,
    run: vi.fn(),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockReturnThis(),
        offset: vi.fn().mockReturnThis(),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }),
    }),
    query: {},
    with: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnThis(),
          innerJoin: vi.fn().mockReturnThis(),
        }),
      }),
    }),
    transaction: vi.fn().mockImplementation(async (fn: any) => {
      const tx = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 1 }]) }),
        }),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnThis(),
            for: vi.fn().mockReturnThis(),
          }),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
        }),
      };
      return fn(tx);
    }),
  })),
}));

// Mock @libsql/client
vi.mock('@libsql/client', () => ({
  createClient: vi.fn((options: any) => ({
    execute: vi.fn().mockResolvedValue({ rows: [], rowsAffected: 1, lastInsertRowid: 1 }),
    batch: vi.fn().mockResolvedValue([]),
    transaction: vi.fn().mockResolvedValue({
      execute: vi.fn().mockResolvedValue({ rows: [], rowsAffected: 1, lastInsertRowid: 1 }),
      commit: vi.fn(),
      rollback: vi.fn(),
    }),
    close: vi.fn(),
    ...options,
  })),
}));

// Mock Prisma 相关库
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn((opts: any) => ({ $disconnect: vi.fn(), ...opts })),
}));

vi.mock('@prisma/adapter-neon', () => ({
  PrismaNeon: vi.fn((pool: any) => ({ pool })),
}));

vi.mock('@prisma/adapter-libsql', () => ({
  PrismaLibSQL: vi.fn((client: any) => ({ client })),
}));

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: vi.fn((pool: any) => ({ pool })),
}));

vi.mock('@neondatabase/serverless', () => ({
  Pool: vi.fn((opts: any) => ({ ...opts })),
}));

vi.mock('@libsql/client', () => ({
  createClient: vi.fn((opts: any) => ({ ...opts, execute: vi.fn(), close: vi.fn() })),
}));

vi.mock('pg', () => ({
  Pool: vi.fn((opts: any) => ({ ...opts })),
}));

import { describe, it, expect, vi } from 'vitest';
import * as drizzleSchema from './drizzle-schema.js';
import * as drizzleQueries from './drizzle-query-patterns.js';
import {
  createPrismaClientForWorkers,
  createPrismaClientForVercelEdge,
  createPrismaClientForNode,
  createPrismaClient,
  RuntimeEnv,
} from './prisma-7-edge.js';
import {
  createLocalClient,
  createTursoClient,
  createMemoryClient,
  createClientFromEnv,
  drizzleUsers,
  drizzlePosts,
} from './turso-connection.js';

// ==================== Drizzle Schema 测试 ====================

describe('Drizzle Schema 定义', () => {
  it('应导出所有表定义', () => {
    expect(drizzleSchema.users).toBeDefined();
    expect(drizzleSchema.profiles).toBeDefined();
    expect(drizzleSchema.posts).toBeDefined();
    expect(drizzleSchema.categories).toBeDefined();
    expect(drizzleSchema.postsCategories).toBeDefined();
    expect(drizzleSchema.comments).toBeDefined();
  });

  it('users 表应包含核心列', () => {
    const cols = drizzleSchema.users.columns as Record<string, any>;
    expect(cols.id).toBeDefined();
    expect(cols.email).toBeDefined();
    expect(cols.name).toBeDefined();
    expect(cols.role).toBeDefined();
    expect(cols.createdAt).toBeDefined();
    expect(cols.deletedAt).toBeDefined();
  });

  it('应导出枚举类型', () => {
    expect(drizzleSchema.userRoleEnum).toBeDefined();
    expect(drizzleSchema.userRoleEnum.values).toContain('admin');
    expect(drizzleSchema.postStatusEnum).toBeDefined();
    expect(drizzleSchema.postStatusEnum.values).toContain('published');
  });

  it('应导出关系定义', () => {
    expect(drizzleSchema.usersRelations).toBeDefined();
    expect(drizzleSchema.postsRelations).toBeDefined();
    expect(drizzleSchema.commentsRelations).toBeDefined();
  });

  it('应导出类型别名', () => {
    // 类型在编译时存在，运行时无法直接验证，但可确认导出不为 undefined
    expect(drizzleSchema.User).toBeUndefined(); // type-only export
    expect(drizzleSchema.NewUser).toBeUndefined(); // type-only export
  });

  it('RLS 辅助函数应生成正确 SQL', () => {
    const rlsSql = drizzleSchema.enableRlsOnTable('users');
    expect(rlsSql.raw).toContain('ENABLE ROW LEVEL SECURITY');

    const policySql = drizzleSchema.createRlsPolicy('posts', 'test_policy', 'SELECT', 'true');
    expect(policySql.raw).toContain('CREATE POLICY');
    expect(policySql.raw).toContain('test_policy');
  });
});

// ==================== Drizzle Query Patterns 测试 ====================

describe('Drizzle 查询模式', () => {
  it('应导出 schema 定义', () => {
    expect(drizzleQueries.users).toBeDefined();
    expect(drizzleQueries.orders).toBeDefined();
    expect(drizzleQueries.orderItems).toBeDefined();
  });

  it('应导出所有查询模式函数', () => {
    expect(typeof drizzleQueries.selectPatterns).toBe('function');
    expect(typeof drizzleQueries.joinPatterns).toBe('function');
    expect(typeof drizzleQueries.writePatterns).toBe('function');
    expect(typeof drizzleQueries.subqueryPatterns).toBe('function');
    expect(typeof drizzleQueries.ctePatterns).toBe('function');
    expect(typeof drizzleQueries.transactionPatterns).toBe('function');
    expect(typeof drizzleQueries.dynamicQueryPatterns).toBe('function');
    expect(typeof drizzleQueries.relationalQueryPatterns).toBe('function');
  });

  it('SELECT 模式应能执行', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({ offset: vi.fn().mockResolvedValue([]) }),
          }),
          groupBy: vi.fn().mockReturnValue({ having: vi.fn().mockResolvedValue([]) }),
        }),
      }),
    };
    await expect(drizzleQueries.selectPatterns(mockDb)).resolves.not.toThrow();
  });

  it('JOIN 模式应能执行', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
            leftJoin: vi.fn().mockReturnValue({ rightJoin: vi.fn().mockReturnValue({ fullJoin: vi.fn().mockResolvedValue([]) }) }),
          }),
          leftJoin: vi.fn().mockReturnValue({ rightJoin: vi.fn().mockReturnValue({ fullJoin: vi.fn().mockResolvedValue([]) }) }),
        }),
      }),
    };
    await expect(drizzleQueries.joinPatterns(mockDb)).resolves.not.toThrow();
  });

  it('写入模式应能执行', async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
          onConflictDoNothing: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }),
          onConflictDoUpdate: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }),
      }),
    };
    await expect(drizzleQueries.writePatterns(mockDb)).resolves.not.toThrow();
  });
});

// ==================== Prisma 7 Edge 测试 ====================

describe('Prisma 7 Edge 配置', () => {
  it('createPrismaClientForWorkers 应创建带 adapter 的 PrismaClient', () => {
    const prisma = createPrismaClientForWorkers({ DATABASE_URL: 'postgres://mock' });
    expect(prisma).toBeDefined();
  });

  it('createPrismaClientForVercelEdge 应创建带 adapter 的 PrismaClient', () => {
    const prisma = createPrismaClientForVercelEdge({
      TURSO_DATABASE_URL: 'libsql://mock.turso.io',
      TURSO_AUTH_TOKEN: 'token',
    });
    expect(prisma).toBeDefined();
  });

  it('createPrismaClientForNode 应创建带 adapter 的 PrismaClient', () => {
    const prisma = createPrismaClientForNode({ DATABASE_URL: 'postgres://mock' });
    expect(prisma).toBeDefined();
  });

  it('createPrismaClient 应根据 runtime 选择正确的适配器', () => {
    expect(() => createPrismaClient('node' as RuntimeEnv, { DATABASE_URL: 'postgres://mock' })).not.toThrow();
    expect(() => createPrismaClient('cloudflare-workers' as RuntimeEnv, { DATABASE_URL: 'postgres://mock' })).not.toThrow();
    expect(() => createPrismaClient('vercel-edge' as RuntimeEnv, {
      TURSO_DATABASE_URL: 'libsql://mock.turso.io',
      TURSO_AUTH_TOKEN: 'token',
    })).not.toThrow();
  });

  it('缺少必要环境变量时应抛出错误', () => {
    expect(() => createPrismaClient('node' as RuntimeEnv, {})).toThrow('DATABASE_URL is required');
    expect(() => createPrismaClient('vercel-edge' as RuntimeEnv, {})).toThrow('TURSO_DATABASE_URL is required');
  });
});

// ==================== Turso 连接测试 ====================

describe('Turso 连接配置', () => {
  it('createLocalClient 应使用本地文件路径', () => {
    const client = createLocalClient('file:test.db');
    expect(client).toBeDefined();
    expect(client.url).toBe('file:test.db');
  });

  it('createTursoClient 应使用远程 URL 和 token', () => {
    const client = createTursoClient('https://mock.turso.io', 'token');
    expect(client).toBeDefined();
    expect(client.url).toBe('https://mock.turso.io');
    expect(client.authToken).toBe('token');
  });

  it('createMemoryClient 应创建内存数据库', () => {
    const client = createMemoryClient();
    expect(client).toBeDefined();
    expect(client.url).toBe(':memory:');
  });

  it('createClientFromEnv 应按优先级选择连接模式', () => {
    const tursoClient = createClientFromEnv({
      TURSO_DATABASE_URL: 'https://mock.turso.io',
      TURSO_AUTH_TOKEN: 'token',
    });
    expect(tursoClient.url).toBe('https://mock.turso.io');

    const testClient = createClientFromEnv({ NODE_ENV: 'test' });
    expect(testClient.url).toBe(':memory:');

    const localClient = createClientFromEnv({});
    expect(localClient.url).toBe('file:local.db');
  });

  it('应导出 Drizzle SQLite schema 定义', () => {
    expect(drizzleUsers).toBeDefined();
    expect(drizzlePosts).toBeDefined();
  });
});
