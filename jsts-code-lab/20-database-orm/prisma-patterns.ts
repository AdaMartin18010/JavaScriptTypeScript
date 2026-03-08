/**
 * @file 数据库 ORM 模式
 * @category Database → ORM
 * @difficulty medium
 * @tags orm, prisma, database, crud, relations
 * 
 * @description
 * 数据库 ORM 使用模式：
 * - CRUD 操作
 * - 关联查询
 * - 事务处理
 * - 分页与过滤
 */

// ============================================================================
// 1. 数据模型定义 (Prisma Schema 风格)
// ============================================================================

interface User {
  id: string;
  email: string;
  name: string | null;
  posts: Post[];
  profile: Profile | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Post {
  id: string;
  title: string;
  content: string | null;
  published: boolean;
  author: User;
  authorId: string;
  categories: Category[];
  createdAt: Date;
  updatedAt: Date;
}

interface Profile {
  id: string;
  bio: string | null;
  user: User;
  userId: string;
}

interface Category {
  id: string;
  name: string;
  posts: Post[];
}

// ============================================================================
// 2. Repository 模式
// ============================================================================

export interface Repository<T, CreateInput, UpdateInput> {
  findMany(options?: QueryOptions<T>): Promise<T[]>;
  findUnique(id: string): Promise<T | null>;
  findFirst(where: Partial<T>): Promise<T | null>;
  create(data: CreateInput): Promise<T>;
  update(id: string, data: UpdateInput): Promise<T>;
  delete(id: string): Promise<T>;
  count(where?: Partial<T>): Promise<number>;
}

interface QueryOptions<T> {
  where?: Partial<T>;
  orderBy?: { [K in keyof T]?: 'asc' | 'desc' };
  skip?: number;
  take?: number;
  include?: { [K in keyof T]?: boolean };
}

// 用户 Repository 实现
export class UserRepository implements Repository<User, CreateUserInput, UpdateUserInput> {
  private users: Map<string, User> = new Map();

  async findMany(options?: QueryOptions<User>): Promise<User[]> {
    let results = Array.from(this.users.values());
    
    if (options?.where) {
      results = results.filter(u => this.matchWhere(u, options.where!));
    }
    
    if (options?.orderBy) {
      const [key, order] = Object.entries(options.orderBy)[0];
      results.sort((a, b) => {
        const aVal = a[key as keyof User];
        const bVal = b[key as keyof User];
        return order === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
      });
    }
    
    if (options?.skip) {
      results = results.slice(options.skip);
    }
    
    if (options?.take) {
      results = results.slice(0, options.take);
    }
    
    return results;
  }

  async findUnique(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findFirst(where: Partial<User>): Promise<User | null> {
    return Array.from(this.users.values()).find(u => this.matchWhere(u, where)) || null;
  }

  async create(data: CreateUserInput): Promise<User> {
    const user: User = {
      id: generateId(),
      email: data.email,
      name: data.name || null,
      posts: [],
      profile: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const user = await this.findUnique(id);
    if (!user) throw new Error('User not found');
    
    Object.assign(user, { ...data, updatedAt: new Date() });
    return user;
  }

  async delete(id: string): Promise<User> {
    const user = await this.findUnique(id);
    if (!user) throw new Error('User not found');
    
    this.users.delete(id);
    return user;
  }

  async count(where?: Partial<User>): Promise<number> {
    if (!where) return this.users.size;
    return Array.from(this.users.values()).filter(u => this.matchWhere(u, where)).length;
  }

  private matchWhere(user: User, where: Partial<User>): boolean {
    for (const [key, value] of Object.entries(where)) {
      if ((user as any)[key] !== value) return false;
    }
    return true;
  }
}

interface CreateUserInput {
  email: string;
  name?: string;
}

interface UpdateUserInput {
  email?: string;
  name?: string | null;
}

// ============================================================================
// 3. 关联查询模式
// ============================================================================

export class RelationLoader {
  // 预加载 (Eager Loading)
  async loadWithPosts(userId: string): Promise<User | null> {
    // SELECT ... FROM users JOIN posts ON ...
    const user = await Promise.resolve({
      id: userId,
      email: 'user@example.com',
      posts: [
        { id: '1', title: 'Post 1', authorId: userId },
        { id: '2', title: 'Post 2', authorId: userId }
      ]
    } as User);
    return user;
  }

  // 延迟加载 (Lazy Loading)
  async loadPostsLazy(userId: string): Promise<Post[]> {
    // 只在需要时查询
    return Promise.resolve([
      { id: '1', title: 'Post 1', authorId: userId },
      { id: '2', title: 'Post 2', authorId: userId }
    ] as Post[]);
  }

  // 选择特定字段
  async selectFields(userId: string): Promise<Partial<User>> {
    return Promise.resolve({
      id: userId,
      email: 'user@example.com',
      name: 'John'
    });
  }
}

// ============================================================================
// 4. 事务处理
// ============================================================================

export class TransactionManager {
  private operations: Array<() => Promise<void>> = [];

  add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.operations.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
          throw error;
        }
      });
    });
  }

  async commit(): Promise<void> {
    // 实际实现应使用数据库事务
    for (const op of this.operations) {
      await op();
    }
    this.operations = [];
  }

  async rollback(): Promise<void> {
    // 回滚操作
    this.operations = [];
  }
}

// ============================================================================
// 5. 分页与过滤
// ============================================================================

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class PaginationHelper {
  static async paginate<T>(
    query: () => Promise<T[]>,
    countQuery: () => Promise<number>,
    page: number,
    pageSize: number
  ): Promise<PaginationResult<T>> {
    const skip = (page - 1) * pageSize;
    
    const [data, totalItems] = await Promise.all([
      query(),
      countQuery()
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  static createCursor<T extends { id: string }>(
    items: T[],
    limit: number
  ): { data: T[]; nextCursor: string | null } {
    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, nextCursor };
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export async function demo(): Promise<void> {
  console.log('=== 数据库 ORM 模式 ===\n');

  const userRepo = new UserRepository();

  // 创建用户
  console.log('--- 创建用户 ---');
  const user = await userRepo.create({
    email: 'john@example.com',
    name: 'John Doe'
  });
  console.log('Created:', user);

  // 查询用户
  console.log('\n--- 查询用户 ---');
  const found = await userRepo.findUnique(user.id);
  console.log('Found:', found);

  // 更新用户
  console.log('\n--- 更新用户 ---');
  const updated = await userRepo.update(user.id, { name: 'Jane Doe' });
  console.log('Updated:', updated);

  // 分页查询
  console.log('\n--- 分页查询 ---');
  await userRepo.create({ email: 'user1@example.com' });
  await userRepo.create({ email: 'user2@example.com' });
  await userRepo.create({ email: 'user3@example.com' });

  const users = await userRepo.findMany({
    orderBy: { email: 'asc' },
    take: 2,
    skip: 0
  });
  console.log('Paginated:', users.map(u => u.email));

  // 关联查询
  console.log('\n--- 关联查询 ---');
  const loader = new RelationLoader();
  const userWithPosts = await loader.loadWithPosts(user.id);
  console.log('User with posts:', userWithPosts?.posts.length);

  console.log('\nORM 模式要点:');
  console.log('- Repository 模式封装数据访问');
  console.log('- 关联查询支持预加载和延迟加载');
  console.log('- 事务保证数据一致性');
  console.log('- 分页支持 Offset 和 Cursor 方式');
}

// ============================================================================
// 导出
// ============================================================================

// Classes already exported inline above

export type {
  User,
  Post,
  Profile,
  Category,
  Repository,
  QueryOptions,
  PaginationResult,
  CreateUserInput,
  UpdateUserInput
};
