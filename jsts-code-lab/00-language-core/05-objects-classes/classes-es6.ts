/**
 * @file ES6 Class 深度解析
 * @category Language Core → Objects & Classes
 * @difficulty warm
 * @tags es6, class, inheritance, constructor
 */

// ============================================================================
// 1. Class 基础
// ============================================================================

class Animal {
  // 实例属性 (ES2022 之前通常在 constructor 中定义)
  name: string;
  private _age: number;

  // 静态属性
  static species = 'Animalia';

  constructor(name: string, age: number) {
    this.name = name;
    this._age = age;
  }

  // 实例方法
  speak(): string {
    return `${this.name} makes a sound`;
  }

  // Getter/Setter
  get age(): number {
    return this._age;
  }

  set age(value: number) {
    if (value < 0) throw new Error('Age cannot be negative');
    this._age = value;
  }

  // 静态方法
  static isAnimal(obj: unknown): obj is Animal {
    return obj instanceof Animal;
  }
}

// ============================================================================
// 2. 继承
// ============================================================================

class Dog extends Animal {
  breed: string;
  static override species = 'Canis lupus';

  constructor(name: string, age: number, breed: string) {
    super(name, age);
    this.breed = breed;
  }

  // 方法重写
  override speak(): string {
    return `${this.name} barks`;
  }

  fetch(): string {
    return `${this.name} is fetching`;
  }
}

// ============================================================================
// 3. 私有字段 (ES2022)
// ============================================================================

class BankAccount {
  #balance: number; // 真正的私有字段
  readonly owner: string;

  constructor(owner: string, initialBalance: number) {
    this.owner = owner;
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

  // 静态私有字段
  static #bankName = 'MyBank';

  static getBankName(): string {
    return BankAccount.#bankName;
  }
}

// ============================================================================
// 4. 私有方法与 Getter/Setter
// ============================================================================

class SecureStorage {
  #data: Map<string, string> = new Map();

  // 私有方法
  #validateKey(key: string): void {
    if (!key || key.length < 3) {
      throw new Error('Invalid key');
    }
  }

  // 私有 Getter
  get #size(): number {
    return this.#data.size;
  }

  set(key: string, value: string): void {
    this.#validateKey(key);
    this.#data.set(key, value);
  }

  get(key: string): string | undefined {
    return this.#data.get(key);
  }

  get entryCount(): number {
    return this.#size;
  }
}

// ============================================================================
// 5. 静态块 (ES2022)
// ============================================================================

class Config {
  static settings: Record<string, string> = {};
  static version: string;

  // 静态初始化块
  static {
    // 可以执行任意代码来初始化静态属性
    const env = process.env.NODE_ENV || 'development';
    Config.settings = {
      env,
      apiUrl: env === 'production' ? 'https://api.prod.com' : 'https://api.dev.com'
    };
    Config.version = '1.0.0';
  }

  // 多个静态块按顺序执行
  static {
    console.log('Config initialized:', Config.settings);
  }
}

// ============================================================================
// 6. 抽象类与接口
// ============================================================================

abstract class Shape {
  abstract area(): number;
  abstract perimeter(): number;

  // 可以有具体方法
  describe(): string {
    return `Area: ${this.area()}, Perimeter: ${this.perimeter()}`;
  }
}

class Rectangle extends Shape {
  constructor(private width: number, private height: number) {
    super();
  }

  area(): number {
    return this.width * this.height;
  }

  perimeter(): number {
    return 2 * (this.width + this.height);
  }
}

// ============================================================================
// 7. 索引签名与 this 类型
// ============================================================================

class FluentArray<T> {
  private items: T[] = [];

  add(item: T): this {
    this.items.push(item);
    return this;
  }

  remove(item: T): this {
    const index = this.items.indexOf(item);
    if (index > -1) this.items.splice(index, 1);
    return this;
  }

  get length(): number {
    return this.items.length;
  }
}

// ============================================================================
// 8. 类表达式
// ============================================================================

const PersonClass = class {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
};

// 命名类表达式
const NamedClass = class NamedClassInternal {
  constructor() {
    // NamedClassInternal 在类内部可用
    console.log(NamedClassInternal.name);
  }
};

// ============================================================================
// 导出
// ============================================================================

export {
  Animal,
  Dog,
  BankAccount,
  SecureStorage,
  Config,
  Shape,
  Rectangle,
  FluentArray,
  PersonClass,
  NamedClass
};
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== ES6 Classes Demo ===");
  
  // 基础类
  const dog = new Dog("Rex", 5, "German Shepherd");
  console.log("Dog speaks:", dog.speak());
  console.log("Dog fetches:", dog.fetch());
  
  // 私有字段
  const account = new BankAccount("Alice", 1000);
  account.deposit(500);
  account.withdraw(200);
  console.log("Bank balance:", account.getBalance());
  
  // 抽象类
  const rect = new Rectangle(5, 3);
  console.log("Rectangle area:", rect.area());
  console.log("Rectangle perimeter:", rect.perimeter());
  console.log("Rectangle description:", rect.describe());
  
  // 链式调用
  const fluent = new FluentArray<number>();
  fluent.add(1).add(2).add(3).remove(2);
  console.log("Fluent array length:", fluent.length);
  
  console.log("=== End of Demo ===\n");
}
