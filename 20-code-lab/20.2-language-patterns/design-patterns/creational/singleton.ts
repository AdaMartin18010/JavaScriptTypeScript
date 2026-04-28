/**
 * @file 单例模式 (Singleton Pattern)
 * @category Design Patterns → Creational
 * @difficulty easy
 * @tags singleton, creational, global-state
 * 
 * @description
 * 确保一个类只有一个实例，并提供一个全局访问点
 */

// ============================================================================
// 1. 基础实现
// ============================================================================

class BasicSingleton {
  private static instance: BasicSingleton | null = null;

  private constructor() {
    // 私有构造函数
  }

  static getInstance(): BasicSingleton {
    if (!BasicSingleton.instance) {
      BasicSingleton.instance = new BasicSingleton();
    }
    return BasicSingleton.instance;
  }
}

// ============================================================================
// 2. 线程安全 (JavaScript 是单线程，但考虑异步初始化)
// ============================================================================

class AsyncSingleton {
  private static instance: AsyncSingleton | null = null;
  private static initializing: Promise<AsyncSingleton> | null = null;

  private data = '';

  private constructor() {}

  static async getInstance(): Promise<AsyncSingleton> {
    if (AsyncSingleton.instance) {
      return AsyncSingleton.instance;
    }

    if (!AsyncSingleton.initializing) {
      AsyncSingleton.initializing = this.createInstance();
    }

    return AsyncSingleton.initializing;
  }

  private static async createInstance(): Promise<AsyncSingleton> {
    const instance = new AsyncSingleton();
    await instance.initialize();
    AsyncSingleton.instance = instance;
    return instance;
  }

  private async initialize(): Promise<void> {
    // 模拟异步初始化
    this.data = await fetchConfig();
  }

  getData(): string {
    return this.data;
  }
}

async function fetchConfig(): Promise<string> {
  return 'config data';
}

// ============================================================================
// 3. ES6 Module 单例 (推荐方式)
// ============================================================================

class ConfigManager {
  private settings = new Map<string, unknown>();

  set(key: string, value: unknown): void {
    this.settings.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.settings.get(key) as T | undefined;
  }

  has(key: string): boolean {
    return this.settings.has(key);
  }
}

// ES Module 只执行一次，天然单例
export const config = new ConfigManager();

// ============================================================================
// 4. 使用闭包的单例
// ============================================================================

const createSingleton = <T>(factory: () => T): (() => T) => {
  let instance: T | null = null;
  return () => {
    if (!instance) {
      instance = factory();
    }
    return instance;
  };
};

// 使用
class Database {
  query(sql: string) {
    return `Result of ${sql}`;
  }
}

const getDatabase = createSingleton(() => new Database());

// ============================================================================
// 5. 单例的装饰器实现
// ============================================================================

function Singleton<T extends new (...args: any[]) => any>(Target: T): T {
  let instance: InstanceType<T> | null = null;

  return class extends Target {
    constructor(...args: any[]) {
      if (instance) {
        return instance;
      }
      super(...args);
      instance = this as InstanceType<T>;
    }
  } as T;
}

@Singleton
class Logger {
  private logs: string[] = [];

  log(message: string): void {
    this.logs.push(`${new Date().toISOString()}: ${message}`);
  }

  getLogs(): string[] {
    return [...this.logs];
  }
}

// ============================================================================
// 6. 单例的测试问题与解决
// ============================================================================

class TestableSingleton {
  private static instance: TestableSingleton | null = null;
  private counter = 0;

  private constructor() {}

  static getInstance(): TestableSingleton {
    if (!TestableSingleton.instance) {
      TestableSingleton.instance = new TestableSingleton();
    }
    return TestableSingleton.instance;
  }

  // 测试用的重置方法
  static resetInstance(): void {
    TestableSingleton.instance = null;
  }

  increment(): number {
    return ++this.counter;
  }

  getCount(): number {
    return this.counter;
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  BasicSingleton,
  AsyncSingleton,
  ConfigManager,
  createSingleton,
  Database,
  getDatabase,
  Singleton,
  Logger,
  TestableSingleton
};
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Singleton Pattern Demo ===");
  
  // 基础单例
  const s1 = BasicSingleton.getInstance();
  const s2 = BasicSingleton.getInstance();
  console.log("Same instance:", s1 === s2);
  
  // ES Module 单例
  config.set("apiUrl", "https://api.example.com");
  console.log("Config value:", config.get("apiUrl"));
  
  // 闭包单例
  const db1 = getDatabase();
  const db2 = getDatabase();
  console.log("Database same instance:", db1 === db2);
  db1.query("SELECT * FROM users");
  
  // 装饰器单例
  const logger1 = new Logger();
  const logger2 = new Logger();
  console.log("Logger same instance:", logger1 === logger2);
  logger1.log("Test message");
  console.log("Logs:", logger1.getLogs());
  
  console.log("=== End of Demo ===\n");
}
