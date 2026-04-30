# 创建型设计模式（Creational Patterns）

> **定位**：`20-code-lab/20.2-language-patterns/design-patterns/creational`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决**对象创建过程的复杂性**问题。通过工厂、建造者、单例等模式封装实例化逻辑，提升创建过程的可控性。核心原则：将对象创建与使用分离，使系统独立于对象的创建、组合和表示方式。

### 1.2 形式化基础

创建型模式处理对象实例化的**时机**（懒加载 vs 预创建）、**方式**（直接 new vs 工厂）和**复杂度**（简单对象 vs 多步骤构造）。它们隐藏创建细节，使调用方依赖抽象而非具体类。

### 1.3 模式速查表

| 模式 | 意图 | 典型场景 | TypeScript 实现要点 |
|------|------|---------|--------------------|
| **Singleton** | 全局唯一实例 | 配置中心、连接池 | 私有构造 + 静态访问点 |
| **Factory Method** | 将实例化延迟到子类 | 跨平台 UI 组件 | 抽象 creator + 多态 product |
| **Builder** | 分步骤构造复杂对象 | 查询构造器、配置对象 | 链式调用 + `build()` |
| **Prototype** | 复制现有对象 | 避免重复初始化开销 | `Object.create` / `structuredClone` |
| **Abstract Factory** | 创建相关对象家族 | 跨平台主题/组件库 | 工厂接口 + 具体工厂族 |
| **Object Pool** | 复用昂贵对象 | 数据库连接、WebWorker | 预分配 + 借用/归还 |

---

## 二、设计原理

### 2.1 为什么存在

对象创建逻辑分散会导致重复和耦合。创建型模式将实例化过程集中管理，使系统独立于对象的创建、组合和表示方式。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 工厂方法 | 解耦实例化 | 类层次增加 | 多变种对象 |
| 单例 | 全局唯一 | 测试困难、隐藏依赖 | 配置中心 |
| 抽象工厂 | 保证产品一致性 | 新增产品族需改接口 | 主题/平台适配 |
| 对象池 | 降低 GC 压力 | 管理归还状态复杂 | 高频短生命周期对象 |

### 2.3 与相关技术的对比

与依赖注入容器对比：创建模式关注实例化逻辑，DI 关注依赖组装。现代框架（NestJS、Angular）常将二者结合使用。在 TypeScript 中，`reflect-metadata` 与装饰器使 DI 容器成为创建型模式的现代替代方案之一。

---

## 三、实践映射

### 3.1 从理论到代码

**Singleton（线程安全配置中心）**

```typescript
class AppConfig {
  private static instance: AppConfig | null = null;
  private store = new Map<string, any>();

  private constructor() {}

  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  set<T>(key: string, value: T) { this.store.set(key, value); }
  get<T>(key: string, fallback?: T): T | undefined {
    return (this.store.get(key) as T) ?? fallback;
  }
}

// 可运行示例
const config = AppConfig.getInstance();
config.set('apiUrl', 'https://api.example.com');
config.set('timeout', 5000);
console.log(AppConfig.getInstance().get('apiUrl')); // https://api.example.com
console.log(AppConfig.getInstance() === config); // true
```

**Factory Method（跨平台通知工厂）**

```typescript
interface Notification {
  send(message: string, recipient: string): void;
}

class EmailNotification implements Notification {
  send(message: string, recipient: string) {
    console.log(`[Email] To: ${recipient} | ${message}`);
  }
}

class SMSNotification implements Notification {
  send(message: string, recipient: string) {
    console.log(`[SMS] To: ${recipient} | ${message}`);
  }
}

abstract class NotificationFactory {
  abstract create(): Notification;

  notify(message: string, recipient: string) {
    const notification = this.create();
    notification.send(message, recipient);
  }
}

class EmailFactory extends NotificationFactory {
  create() { return new EmailNotification(); }
}

class SMSFactory extends NotificationFactory {
  create() { return new SMSNotification(); }
}

// 可运行示例
function alertUser(factory: NotificationFactory) {
  factory.notify('Your order has shipped!', 'user@example.com');
}
alertUser(new EmailFactory()); // [Email] To: user@example.com | ...
alertUser(new SMSFactory());   // [SMS] To: user@example.com | ...
```

**Builder（SQL 查询构造器）**

```typescript
class QueryBuilder {
  private parts: string[] = [];
  private params: unknown[] = [];

  select(columns: string[]) {
    this.parts.push(`SELECT ${columns.join(', ')}`);
    return this;
  }
  from(table: string) {
    this.parts.push(`FROM ${table}`);
    return this;
  }
  where(column: string, operator: string, value: unknown) {
    this.parts.push(`WHERE ${column} ${operator} ?`);
    this.params.push(value);
    return this;
  }
  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC') {
    this.parts.push(`ORDER BY ${column} ${direction}`);
    return this;
  }
  build(): { sql: string; params: unknown[] } {
    return { sql: this.parts.join(' '), params: this.params };
  }
}

// 可运行示例
const query = new QueryBuilder()
  .select(['id', 'name', 'email'])
  .from('users')
  .where('active', '=', true)
  .orderBy('created_at', 'DESC')
  .build();
console.log(query.sql);
// SELECT id, name, email FROM users WHERE active = ? ORDER BY created_at DESC
console.log(query.params); // [true]
```

**Prototype（对象克隆）**

```typescript
interface Clonable<T> {
  clone(): T;
}

class DocumentTemplate implements Clonable<DocumentTemplate> {
  constructor(
    public title: string,
    public content: string,
    public metadata: Record<string, string>
  ) {}

  clone(): DocumentTemplate {
    // 深拷贝防止引用共享
    return new DocumentTemplate(
      this.title,
      this.content,
      { ...this.metadata }
    );
  }
}

// 可运行示例
const base = new DocumentTemplate('Invoice', '...', { company: 'Acme' });
const copy1 = base.clone();
copy1.metadata.company = 'Globex';
console.log(base.metadata.company); // Acme（未被污染）
console.log(copy1.metadata.company); // Globex
```

**Abstract Factory（跨平台 UI 组件族）**

```typescript
// 抽象产品接口
interface Button { render(): string; }
interface Checkbox { toggle(): string; }

// 具体产品：Windows 风格
class WinButton implements Button {
  render() { return '<button class="win-btn">Win</button>'; }
}
class WinCheckbox implements Checkbox {
  toggle() { return '<input type="checkbox" class="win-chk" />'; }
}

// 具体产品：macOS 风格
class MacButton implements Button {
  render() { return '<button class="mac-btn">Mac</button>'; }
}
class MacCheckbox implements Checkbox {
  toggle() { return '<input type="checkbox" class="mac-chk" />'; }
}

// 抽象工厂
interface UIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

class WinFactory implements UIFactory {
  createButton() { return new WinButton(); }
  createCheckbox() { return new WinCheckbox(); }
}

class MacFactory implements UIFactory {
  createButton() { return new MacButton(); }
  createCheckbox() { return new MacCheckbox(); }
}

// 客户端通过抽象工厂获取一致风格组件
function renderForm(factory: UIFactory) {
  const btn = factory.createButton();
  const chk = factory.createCheckbox();
  return `${btn.render()}${chk.toggle()}`;
}

console.log(renderForm(new WinFactory()));
console.log(renderForm(new MacFactory()));
```

**Object Pool（Web Worker 复用池）**

```typescript
class WorkerPool {
  private pool: Worker[] = [];
  private queue: Array<(worker: Worker) => void> = [];

  constructor(private size: number, private scriptUrl: string) {
    for (let i = 0; i < size; i++) {
      this.pool.push(new Worker(scriptUrl));
    }
  }

  acquire(): Promise<Worker> {
    const worker = this.pool.pop();
    if (worker) return Promise.resolve(worker);
    return new Promise((resolve) => this.queue.push(resolve));
  }

  release(worker: Worker) {
    const next = this.queue.shift();
    if (next) next(worker);
    else this.pool.push(worker);
  }

  terminate() {
    this.pool.forEach((w) => w.terminate());
    this.pool = [];
  }
}

// 使用示例
const pool = new WorkerPool(4, './hash-worker.js');
const worker = await pool.acquire();
worker.postMessage({ input: 'data' });
worker.onmessage = (e) => {
  console.log('Result:', e.data);
  pool.release(worker); // 归还到池中复用
};
```

**现代替代：依赖注入容器**

```typescript
// 使用 reflect-metadata 实现简易 DI 容器（NestJS / TSyringe 思想）
import 'reflect-metadata';

const INJECTABLE_KEY = Symbol('injectable');
const INJECT_KEY = Symbol('inject');

function Injectable() {
  return (target: any) => {
    Reflect.defineMetadata(INJECTABLE_KEY, true, target);
  };
}

function Inject(token: any) {
  return (target: any, _key: string, index: number) => {
    const existing = Reflect.getMetadata(INJECT_KEY, target) || [];
    existing[index] = token;
    Reflect.defineMetadata(INJECT_KEY, existing, target);
  };
}

class Container {
  private registry = new Map<any, any>();

  register<T>(token: any, impl: new (...args: any[]) => T) {
    this.registry.set(token, impl);
  }

  resolve<T>(token: any): T {
    const Impl = this.registry.get(token);
    if (!Impl) throw new Error(`No provider for ${token.name}`);
    const deps = Reflect.getMetadata(INJECT_KEY, Impl) || [];
    const args = deps.map((dep: any) => this.resolve(dep));
    return new Impl(...args);
  }
}

@Injectable()
class Logger {
  log(msg: string) { console.log(`[LOG] ${msg}`); }
}

@Injectable()
class UserService {
  constructor(@Inject(Logger) private logger: Logger) {}
  getUser(id: string) {
    this.logger.log(`Fetching user ${id}`);
    return { id, name: 'Alice' };
  }
}

const container = new Container();
container.register(Logger, Logger);
container.register(UserService, UserService);

const svc = container.resolve<UserService>(UserService);
console.log(svc.getUser('42'));
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 单例模式总是必要的 | 单例隐藏依赖，测试中可用依赖注入替代 |
| 工厂只是 new 的包装 | 工厂封装创建逻辑和依赖组装 |
| 建造者必须链式调用 | 核心是分步构造，DSL 风格是可选优化 |
| 对象池适用于所有对象 | 仅当对象创建/销毁成本高于池管理开销时才适用 |

### 3.3 扩展阅读

- [GoF Design Patterns — Gang of Four](https://en.wikipedia.org/wiki/Design_Patterns)
- [Refactoring Guru: Creational Patterns](https://refactoring.guru/design-patterns/creational-patterns)
- [TypeScript Handbook: Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- [MDN: Object.create](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
- [MDN: structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone)
- [TypeScript Handbook: Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [InversifyJS — 轻量 IoC 容器](https://inversify.io/)
- [TSyringe — TypeScript DI 容器](https://github.com/microsoft/tsyringe)
- [Angular Dependency Injection](https://angular.dev/guide/di)
- [Node.js Worker Threads](https://nodejs.org/api/worker_threads.html)
- `20.2-language-patterns/design-patterns/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
