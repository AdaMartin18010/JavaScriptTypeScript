/**
 * @file 分层架构 (Layered Architecture)
 * @category Architecture Patterns → Layered
 * @difficulty medium
 * @tags architecture, layered, separation-of-concerns
 * 
 * @description
 * 将应用分为多个层次：表现层 -> 业务逻辑层 -> 数据访问层
 */

// ============================================================================
// 1. 数据层 (Data Layer)
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
}

class UserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}

// ============================================================================
// 2. 业务逻辑层 (Business Logic Layer)
// ============================================================================

class UserService {
  constructor(private userRepo: UserRepository) {}

  async getUser(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  async createUser(name: string, email: string): Promise<User> {
    // 业务验证
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email');
    }

    const user: User = {
      id: this.generateId(),
      name,
      email
    };

    await this.userRepo.save(user);
    return user;
  }

  async updateEmail(userId: string, newEmail: string): Promise<User> {
    if (!this.isValidEmail(newEmail)) {
      throw new Error('Invalid email');
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updated = { ...user, email: newEmail };
    await this.userRepo.save(updated);
    return updated;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}

// ============================================================================
// 3. 表现层 (Presentation Layer)
// ============================================================================

class UserController {
  constructor(private userService: UserService) {}

  async getUser(id: string) {
    try {
      const user = await this.userService.getUser(id);
      return user ? { success: true, data: user } : { success: false, error: 'Not found' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async createUser(name: string, email: string) {
    try {
      const user = await this.userService.createUser(name, email);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

// ============================================================================
// 4. 依赖注入容器
// ============================================================================

class Container {
  private services: Map<string, any> = new Map();

  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory);
  }

  resolve<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service ${key} not found`);
    }
    return factory();
  }
}

// 配置依赖
const container = new Container();
container.register('userRepository', () => new UserRepository());
container.register('userService', () => new UserService(container.resolve('userRepository')));
container.register('userController', () => new UserController(container.resolve('userService')));

// ============================================================================
// 5. 使用示例
// ============================================================================

async function demo() {
  const controller = container.resolve<UserController>('userController');

  // 创建用户
  const createResult = await controller.createUser('Alice', 'alice@example.com');
  console.log('Created:', createResult);

  // 获取用户
  if (createResult.success && createResult.data) {
    const getResult = await controller.getUser(createResult.data.id);
    console.log('Retrieved:', getResult);
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  UserRepository,
  UserService,
  UserController,
  Container,
  container,
  demo
};

export type { User };
