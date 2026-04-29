# 分层架构（Layered Architecture）

> **定位**：`20-code-lab/20.2-language-patterns/architecture-patterns/layered`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决**关注点分离**的经典架构问题。通过分层设计将表现层、业务层和数据层解耦，提升可维护性。核心规则：**上层依赖下层，禁止反向引用**（依赖关系自上而下）。

### 1.2 形式化基础

- **表现层（Presentation）**：处理用户输入与输出渲染，了解业务逻辑但不包含规则。
- **业务层（Business/Domain）**：封装核心业务规则、实体和用例，不依赖具体框架。
- **数据层（Data/Persistence）**：负责数据持久化与外部存储交互，实现业务层定义的接口。
- **依赖规则**：`层 N` 可以依赖 `层 N-1`，反之则违反架构约束。

### 1.3 分层职责对比

| 层级 | 职责 | 允许依赖 | 禁止依赖 |
|------|------|---------|---------|
| **表现层** | 路由、请求校验、序列化 | 业务层 | 数据层 |
| **业务层** | 领域模型、业务规则、用例编排 | 数据层接口 | 表现层、具体 ORM |
| **数据层** | 数据库查询、缓存、消息队列 | 基础设施 SDK | 表现层、业务层实体* |

> *注：严格分层中数据层仅依赖业务层接口；宽松分层中可通过 DTO/Entity 共享数据形状。

---

## 二、设计原理

### 2.1 为什么存在

复杂系统需要清晰的组织原则。分层架构通过水平切割职责，使每一层只依赖下层接口，降低了理解和修改的认知负担。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 严格分层 | 依赖清晰、可独立测试 | 跨层调用繁琐 | 企业级应用 |
| 宽松分层 | 灵活高效 | 易退化为大泥球 | 初创项目 |

### 2.3 与相关技术的对比

与微服务对比：分层是代码级组织，微服务是部署级拆分。一个单体应用内部依然可以严格分层。

---

## 三、实践映射

### 3.1 从理论到代码

**分层 Express 应用（TypeScript）**

```typescript
// ========== 数据层：Repository 接口与实现 ==========
// interfaces.ts —— 由业务层定义，数据层实现
export interface TaskRepository {
  findAll(): Promise<Task[]>;
  create(task: Omit<Task, 'id'>): Promise<Task>;
}

// repository.ts —— 数据层：Prisma 实现
import { PrismaClient } from '@prisma/client';
export class PrismaTaskRepository implements TaskRepository {
  constructor(private prisma: PrismaClient) {}
  async findAll() { return this.prisma.task.findMany(); }
  async create(data: Omit<Task, 'id'>) {
    return this.prisma.task.create({ data });
  }
}

// ========== 业务层：领域模型与用例 ==========
// domain.ts
export class Task {
  constructor(
    public id: string,
    public title: string,
    public completed: boolean
  ) {}
}

// usecase.ts —— 纯业务逻辑，无框架依赖
export class TaskUseCase {
  constructor(private repo: TaskRepository) {}
  async listTasks() { return this.repo.findAll(); }
  async addTask(title: string) {
    if (!title || title.length > 100) throw new Error('Invalid title');
    return this.repo.create({ title, completed: false });
  }
}

// ========== 表现层：Express 路由与控制器 ==========
// controller.ts —— 只依赖业务层
import { Router } from 'express';
export function createTaskRouter(useCase: TaskUseCase): Router {
  const router = Router();
  router.get('/tasks', async (_req, res) => {
    const tasks = await useCase.listTasks();
    res.json(tasks);
  });
  router.post('/tasks', async (req, res) => {
    const task = await useCase.addTask(req.body.title);
    res.status(201).json(task);
  });
  return router;
}

// ========== 组合根（Composition Root） ==========
// app.ts
const prisma = new PrismaClient();
const repo = new PrismaTaskRepository(prisma);
const useCase = new TaskUseCase(repo);
app.use('/api', createTaskRouter(useCase));
```

**可运行测试（内存数据层）**

```typescript
// 测试业务层无需启动 HTTP 服务或连接数据库
class InMemoryTaskRepository implements TaskRepository {
  private tasks: Task[] = [];
  async findAll() { return this.tasks; }
  async create(data: Omit<Task, 'id'>) {
    const task = new Task(String(this.tasks.length + 1), data.title, false);
    this.tasks.push(task);
    return task;
  }
}

const uc = new TaskUseCase(new InMemoryTaskRepository());
const task = await uc.addTask('Learn Layered Architecture');
assert(task.title === 'Learn Layered Architecture');
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 分层越多越优雅 | 过度分层增加不必要的抽象成本 |
| 层间可以任意穿透 | 依赖规则破坏会导致架构腐化 |
| 所有应用都需要 3 层 | 简单脚本可能 1-2 层即可，按需分层 |

### 3.3 扩展阅读

- [Layered Architecture — O'Reilly Software Architecture Patterns](https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/ch01.html)
- [The Clean Architecture — Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Microsoft: Common Web Application Architectures](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures)
- `20.2-language-patterns/architecture-patterns/`

---


## 进阶代码示例

### NestJS 风格依赖注入分层

```typescript
// nestjs-like-layered.ts
interface Provider<T> {
  provide: string;
  useClass: new (...args: any[]) => T;
}

class DIContainer {
  private registry = new Map<string, any>();
  register<T>(provider: Provider<T>) {
    this.registry.set(provider.provide, new provider.useClass());
  }
  resolve<T>(token: string): T {
    return this.registry.get(token);
  }
}

// 数据层
class UserRepository {
  async findById(id: string) {
    return { id, name: 'Alice' };
  }
}

// 业务层
class UserService {
  constructor(private repo: UserRepository) {}
  async getUser(id: string) {
    return this.repo.findById(id);
  }
}

// 表现层
class UserController {
  constructor(private service: UserService) {}
  async handle(id: string) {
    return this.service.getUser(id);
  }
}

// 组合根
const container = new DIContainer();
container.register({ provide: 'UserRepository', useClass: UserRepository });
container.register({ provide: 'UserService', useClass: UserService });
container.register({ provide: 'UserController', useClass: UserController });
```

### 端口与适配器（六边形）实践

```typescript
// hexagonal-adapter.ts
interface ForEmailSender {
  send(to: string, subject: string, body: string): Promise<void>;
}

class SmtpEmailAdapter implements ForEmailSender {
  async send(to: string, subject: string, body: string) {
    console.log(`SMTP to ${to}: ${subject}`);
  }
}

class NotificationService {
  constructor(private email: ForEmailSender) {}
  async notifyUser(email: string, message: string) {
    await this.email.send(email, 'Notification', message);
  }
}

// 测试时可替换为内存适配器
class InMemoryEmailAdapter implements ForEmailSender {
  sent: Array<{ to: string; subject: string; body: string }> = [];
  async send(to: string, subject: string, body: string) {
    this.sent.push({ to, subject, body });
  }
}
```

## 新增权威参考链接

- [NestJS Documentation](https://docs.nestjs.com/) — 企业级 Node.js 框架
- [Hexagonal Architecture (Alistair Cockburn)](https://alistair.cockburn.us/hexagonal-architecture/) — 端口与适配器
- [Onion Architecture (Jeffrey Palermo)](https://jeffreypalermo.com/blog/the-onion-architecture-part-1/) — 洋葱架构
- [DDD Reference (Eric Evans)](https://www.domainlanguage.com/ddd/reference/) — 领域驱动设计参考
- [Martin Fowler — Patterns of Enterprise Application Architecture](https://martinfowler.com/eaaCatalog/) — 企业应用架构模式

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
