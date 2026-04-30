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

### Clean Architecture 边界实践

```typescript
// entities.ts — 最内层：纯领域实体，零外部依赖
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export class TodoEntity implements Todo {
  constructor(
    public id: string,
    public title: string,
    public completed: boolean
  ) {}

  toggle(): TodoEntity {
    return new TodoEntity(this.id, this.title, !this.completed);
  }
}

// use-cases.ts — 业务用例，只依赖实体
export interface TodoRepository {
  findAll(): Promise<Todo[]>;
  save(todo: Todo): Promise<void>;
}

export class ListTodosUseCase {
  constructor(private repo: TodoRepository) {}
  async execute() { return this.repo.findAll(); }
}

// adapters.ts — 外层适配器（框架/UI/DB）
import type { FastifyInstance } from 'fastify';

export function todoRoutes(fastify: FastifyInstance, useCase: ListTodosUseCase) {
  fastify.get('/todos', async (_req, reply) => {
    const todos = await useCase.execute();
    reply.send(todos);
  });
}
```

### Fastify 分层应用组合

```typescript
// fastify-layered.ts
import Fastify from 'fastify';

// 数据层
class InMemoryTodoRepo implements TodoRepository {
  private todos: Todo[] = [];
  async findAll() { return this.todos; }
  async save(todo: Todo) { this.todos.push(todo); return todo; }
}

// 业务层
const listUseCase = new ListTodosUseCase(new InMemoryTodoRepo());

// 表现层
const app = Fastify();
todoRoutes(app, listUseCase);

app.listen({ port: 3000 }, (err) => {
  if (err) { console.error(err); process.exit(1); }
  console.log('Server running on http://localhost:3000');
});
```

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

### DTO 映射与输入校验层

```typescript
// dto-and-validation.ts
import { z } from 'zod';

// 表现层 DTO（接收外部输入）
const CreateTaskDto = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

type CreateTaskDto = z.infer<typeof CreateTaskDto>;

// 业务层实体（领域核心）
interface TaskEntity {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
}

// DTO -> Entity 映射器（在表现层或专用映射层）
function toEntity(dto: CreateTaskDto, id: string): TaskEntity {
  return {
    id,
    title: dto.title,
    description: dto.description,
    dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    completed: false,
  };
}

// Entity -> Response DTO 映射器
function toResponseDto(entity: TaskEntity) {
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    dueDate: entity.dueDate?.toISOString(),
    completed: entity.completed,
  };
}

// 控制器中使用
async function createTask(req: { body: unknown }, useCase: TaskUseCase) {
  const dto = CreateTaskDto.parse(req.body); // 校验
  const entity = toEntity(dto, crypto.randomUUID());
  const created = await useCase.addTask(entity);
  return toResponseDto(created);
}
```

### API 版本控制与表现层适配

```typescript
// api-versioning.ts
interface TaskApiV1 {
  id: string;
  title: string;
  done: boolean;
}

interface TaskApiV2 {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
}

class TaskApiAdapter {
  static toV1(entity: TaskEntity): TaskApiV1 {
    return { id: entity.id, title: entity.title, done: entity.completed };
  }
  static toV2(entity: TaskEntity): TaskApiV2 {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description ?? null,
      completed: entity.completed,
      createdAt: new Date().toISOString(),
    };
  }
}

// 路由中根据 Accept-Version 头返回不同格式
app.get('/tasks', async (req, res) => {
  const tasks = await useCase.listTasks();
  const version = req.headers['accept-version'] || 'v1';
  if (version === 'v2') {
    res.json(tasks.map(TaskApiAdapter.toV2));
  } else {
    res.json(tasks.map(TaskApiAdapter.toV1));
  }
});
```

### 依赖反转：抽象接口隔离

```typescript
// dependency-inversion.ts
// 业务层定义端口
interface ForUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// 业务层用例，只依赖接口
class RegisterUserUseCase {
  constructor(private repo: ForUserRepository) {}
  async execute(email: string, password: string) {
    const existing = await this.repo.findById(email);
    if (existing) throw new Error('User already exists');
    const user = new User(crypto.randomUUID(), email, await hashPassword(password));
    await this.repo.save(user);
    return user;
  }
}

// 数据层实现端口
class PostgresUserRepository implements ForUserRepository {
  constructor(private db: Pool) {}
  async findById(id: string) {
    const { rows } = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] ?? null;
  }
  async save(user: User) {
    await this.db.query(
      'INSERT INTO users (id, email, password) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET email = $2, password = $3',
      [user.id, user.email, user.passwordHash]
    );
  }
}

// 内存实现用于测试
class InMemoryUserRepository implements ForUserRepository {
  private users = new Map<string, User>();
  async findById(id: string) { return this.users.get(id) ?? null; }
  async save(user: User) { this.users.set(user.id, user); }
}
```

## 新增权威参考链接

- [NestJS Documentation](https://docs.nestjs.com/) — 企业级 Node.js 框架
- [Fastify TypeScript Documentation](https://fastify.dev/docs/latest/Reference/TypeScript/)
- [Hexagonal Architecture (Alistair Cockburn)](https://alistair.cockburn.us/hexagonal-architecture/) — 端口与适配器
- [Onion Architecture (Jeffrey Palermo)](https://jeffreypalermo.com/blog/the-onion-architecture-part-1/) — 洋葱架构
- [The Clean Architecture — Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [DDD Reference (Eric Evans)](https://www.domainlanguage.com/ddd/reference/) — 领域驱动设计参考
- [Implementing DDD — Vaughn Vernon](https://www.oreilly.com/library/view/implementing-domain-driven-design/9780133039900/)
- [Martin Fowler — Patterns of Enterprise Application Architecture](https://martinfowler.com/eaaCatalog/) — 企业应用架构模式
- [Microsoft: Common Web Application Architectures](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures)
- [Layered Architecture — O'Reilly Software Architecture Patterns](https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/ch01.html)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Zod — TypeScript Schema Validation](https://zod.dev/)
- [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
