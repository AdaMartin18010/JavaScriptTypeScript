/**
 * @file 六边形架构 / 端口与适配器模式
 * @category Architecture Patterns → Hexagonal
 * @difficulty hard
 * @tags hexagonal-architecture, ports-and-adapters
 */

// ============================================================================
// 1. 领域模型
// ============================================================================

export class User {
  constructor(
    public id: string,
    public email: string,
    public name: string
  ) {}

  updateEmail(newEmail: string): void {
    if (!this.isValidEmail(newEmail)) {
      throw new Error('Invalid email');
    }
    this.email = newEmail;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// ============================================================================
// 2. 端口
// ============================================================================

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export interface NotificationService {
  sendWelcomeEmail(email: string, name: string): Promise<void>;
}

// ============================================================================
// 3. 应用服务
// ============================================================================

export class UserService {
  constructor(
    private userRepo: UserRepository,
    private notification: NotificationService
  ) {}

  async createUser(email: string, name: string): Promise<User> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new Error('Email exists');

    const user = new User(Math.random().toString(36), email, name);
    await this.userRepo.save(user);
    await this.notification.sendWelcomeEmail(email, name);
    return user;
  }
}

// ============================================================================
// 4. 适配器
// ============================================================================

export class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();
  
  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }
  
  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }
  
  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }
}

export class ConsoleNotification implements NotificationService {
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    console.log(`Welcome ${name} to ${email}`);
  }
}

// ============================================================================
// 导出
// ============================================================================

// (已在上方使用 export class 直接导出，此处无需重复导出)
