/**
 * @file ES2022 Class 字段与私有成员
 * @category ECMAScript Evolution → ES2022
 * @difficulty easy
 * @tags es2022, class, private-fields, static-block
 */

// ============================================================================
// 1. 公共实例字段
// ============================================================================

class Person {
  // 公共字段可以直接初始化
  name = 'Anonymous';
  age = 0;

  constructor(name?: string, age?: number) {
    if (name) this.name = name;
    if (age) this.age = age;
  }
}

// ============================================================================
// 2. 私有字段 (#)
// ============================================================================

class BankAccount {
  // 真正的私有字段，外部无法访问
  #balance = 0;
  #accountNumber: string;

  constructor(accountNumber: string, initialBalance = 0) {
    this.#accountNumber = accountNumber;
    this.#balance = initialBalance;
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error('Invalid amount');
    this.#balance += amount;
  }

  withdraw(amount: number): void {
    if (amount > this.#balance) throw new Error('Insufficient funds');
    this.#balance -= amount;
  }

  getBalance(): number {
    return this.#balance;
  }

  // 私有 getter
  get #formattedBalance(): string {
    return `$${this.#balance.toFixed(2)}`;
  }

  // 私有方法
  #validateAmount(amount: number): boolean {
    return amount > 0 && Number.isFinite(amount);
  }
}

// 外部无法访问私有字段
const account = new BankAccount('12345', 1000);
// account.#balance; // ❌ SyntaxError

// ============================================================================
// 3. 私有静态字段和方法
// ============================================================================

class Database {
  // 私有静态字段
  static #instance: Database | null = null;
  static #connectionString: string = '';

  // 静态私有方法
  static #validateConnectionString(conn: string): boolean {
    return conn.startsWith('mongodb://') || conn.startsWith('postgres://');
  }

  static getInstance(connString: string): Database {
    if (!Database.#instance) {
      if (!Database.#validateConnectionString(connString)) {
        throw new Error('Invalid connection string');
      }
      Database.#connectionString = connString;
      Database.#instance = new Database();
    }
    return Database.#instance;
  }

  // 静态块 (见下方)
}

// ============================================================================
// 4. 检查私有字段 (in 操作符)
// ============================================================================

class Container {
  #privateData = 42;
  publicData = 100;

  hasPrivateData(): boolean {
    return #privateData in this;
  }

  static hasPrivateData(obj: Container): boolean {
    return #privateData in obj;
  }
}

const container = new Container();
console.log('publicData' in container); // true (ES2022+)
console.log(Container.hasPrivateData(container)); // true

// ============================================================================
// 5. 静态块 (Static Block)
// ============================================================================

class Config {
  static settings: Record<string, string> = {};
  static version: string;
  static environment: 'dev' | 'prod' | 'test';

  // 第一个静态块
  static {
    console.log('Initializing Config...');
    const env = process.env.NODE_ENV || 'development';
    Config.environment = env as 'dev' | 'prod' | 'test';
  }

  // 第二个静态块
  static {
    Config.settings = {
      apiUrl: Config.environment === 'prod' 
        ? 'https://api.prod.com' 
        : 'https://api.dev.com',
      timeout: '5000'
    };
    Config.version = '1.0.0';
  }

  // 静态块可以使用 try-catch
  static {
    try {
      // 可能抛出异常的操作
      const config = JSON.parse(process.env.CONFIG || '{}');
      Object.assign(Config.settings, config);
    } catch (e) {
      console.error('Failed to parse config:', e);
    }
  }
}

// ============================================================================
// 6. 类字段与 TypeScript
// ============================================================================

interface UserData {
  id: string;
  name: string;
  email: string;
}

class User implements UserData {
  // 使用 declare 避免双重声明
  id: string;
  name: string;
  email: string;

  // 可选字段
  avatar?: string;

  // 只读字段
  readonly createdAt: Date;

  // 私有字段
  #passwordHash: string;

  constructor(data: UserData & { password: string }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.createdAt = new Date();
    this.#passwordHash = this.#hashPassword(data.password);
  }

  #hashPassword(password: string): string {
    // 简化的哈希
    return btoa(password);
  }

  validatePassword(password: string): boolean {
    return this.#hashPassword(password) === this.#passwordHash;
  }
}

// ============================================================================
// 7. 与旧方案的对比
// ============================================================================

// 旧方案：使用 WeakMap 模拟私有字段
const _private = new WeakMap<OldBankAccount, { balance: number }>();

class OldBankAccount {
  constructor(initialBalance = 0) {
    _private.set(this, { balance: initialBalance });
  }

  getBalance(): number {
    return _private.get(this)!.balance;
  }
}

// ES2022 方案：更清晰、更高效
class NewBankAccount {
  #balance = 0;

  getBalance(): number {
    return this.#balance;
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  Person,
  BankAccount,
  Database,
  Container,
  Config,
  User,
  OldBankAccount,
  NewBankAccount
};

export type { UserData };
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== ES2022 Class Fields Demo ===");
  
  // 公共实例字段
  const person = new Person("Alice", 30);
  console.log("Person:", { name: person.name, age: person.age });
  
  // 私有字段
  const account = new BankAccount("ACC-123", 1000);
  account.deposit(500);
  account.withdraw(200);
  console.log("Bank balance:", account.getBalance());
  
  // 单例模式
  const db1 = Database.getInstance("mongodb://localhost/db");
  const db2 = Database.getInstance("mongodb://localhost/db");
  console.log("Same instance:", db1 === db2);
  
  // 私有字段检查
  const container = new Container();
  console.log("Has private data:", container.hasPrivateData());
  console.log("Static check:", Container.hasPrivateData(container));
  
  // User 类
  const user = new User({
    id: "1",
    name: "Bob",
    email: "bob@example.com",
    password: "secret123"
  });
  console.log("User created at:", user.createdAt);
  console.log("Password valid:", user.validatePassword("secret123"));
  
  console.log("=== End of Demo ===\n");
}
