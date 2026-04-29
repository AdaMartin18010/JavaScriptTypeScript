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

---

## 二、设计原理

### 2.1 为什么存在

对象创建逻辑分散会导致重复和耦合。创建型模式将实例化过程集中管理，使系统独立于对象的创建、组合和表示方式。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 工厂方法 | 解耦实例化 | 类层次增加 | 多变种对象 |
| 单例 | 全局唯一 | 测试困难、隐藏依赖 | 配置中心 |

### 2.3 与相关技术的对比

与依赖注入容器对比：创建模式关注实例化逻辑，DI 关注依赖组装。现代框架（NestJS、Angular）常将二者结合使用。

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

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 单例模式总是必要的 | 单例隐藏依赖，测试中可用依赖注入替代 |
| 工厂只是 new 的包装 | 工厂封装创建逻辑和依赖组装 |
| 建造者必须链式调用 | 核心是分步构造，DSL 风格是可选优化 |

### 3.3 扩展阅读

- [GoF Design Patterns — Gang of Four](https://en.wikipedia.org/wiki/Design_Patterns)
- [Refactoring Guru: Creational Patterns](https://refactoring.guru/design-patterns/creational-patterns)
- [TypeScript Handbook: Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- [MDN: Object.create](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
- `20.2-language-patterns/design-patterns/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
