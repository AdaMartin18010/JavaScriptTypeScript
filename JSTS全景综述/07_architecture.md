# 现代JavaScript/TypeScript架构设计模型全面梳理

> 本文档系统梳理当前最合适的软件架构设计模型，涵盖经典架构风格、前端架构演进、现代全栈架构及架构决策方法论。

---

## 目录

- [现代JavaScript/TypeScript架构设计模型全面梳理](#现代javascripttypescript架构设计模型全面梳理)
  - [目录](#目录)
  - [1. 经典架构风格](#1-经典架构风格)
    - [1.1 分层架构 (Layered Architecture)](#11-分层架构-layered-architecture)
      - [定义和核心概念](#定义和核心概念)
      - [架构图](#架构图)
      - [TypeScript项目结构示例](#typescript项目结构示例)
      - [代码实现示例](#代码实现示例)
      - [适用场景](#适用场景)
      - [权衡分析](#权衡分析)
      - [反例（错误应用）](#反例错误应用)
      - [形式化论证](#形式化论证)
    - [1.2 六边形架构 (Hexagonal Architecture / Ports and Adapters)](#12-六边形架构-hexagonal-architecture--ports-and-adapters)
      - [定义和核心概念](#定义和核心概念-1)
      - [架构图](#架构图-1)
      - [TypeScript项目结构示例](#typescript项目结构示例-1)
      - [代码实现示例](#代码实现示例-1)
      - [适用场景](#适用场景-1)
      - [权衡分析](#权衡分析-1)
      - [反例（错误应用）](#反例错误应用-1)
      - [形式化论证](#形式化论证-1)
    - [1.3 洋葱架构 (Onion Architecture)](#13-洋葱架构-onion-architecture)
      - [定义和核心概念](#定义和核心概念-2)
      - [架构图](#架构图-2)
      - [TypeScript项目结构示例](#typescript项目结构示例-2)
      - [代码实现示例](#代码实现示例-2)
      - [适用场景](#适用场景-2)
      - [权衡分析](#权衡分析-2)
      - [反例（错误应用）](#反例错误应用-2)
      - [形式化论证](#形式化论证-2)
    - [1.4 清洁架构 (Clean Architecture)](#14-清洁架构-clean-architecture)
      - [定义和核心概念](#定义和核心概念-3)
      - [架构图](#架构图-3)
      - [TypeScript项目结构示例](#typescript项目结构示例-3)
      - [代码实现示例](#代码实现示例-3)
      - [适用场景](#适用场景-3)
      - [权衡分析](#权衡分析-3)
      - [反例（错误应用）](#反例错误应用-3)
      - [形式化论证](#形式化论证-3)
  - [2. 前端架构演进](#2-前端架构演进)
    - [2.1 MVC / MVVM](#21-mvc--mvvm)
      - [定义和核心概念](#定义和核心概念-4)
      - [架构图](#架构图-4)
      - [TypeScript项目结构示例](#typescript项目结构示例-4)
      - [代码实现示例](#代码实现示例-4)
      - [适用场景](#适用场景-4)
      - [权衡分析](#权衡分析-4)
      - [反例（错误应用）](#反例错误应用-4)
    - [2.2 Flux架构](#22-flux架构)
      - [定义和核心概念](#定义和核心概念-5)
      - [架构图](#架构图-5)
      - [TypeScript项目结构示例](#typescript项目结构示例-5)
      - [代码实现示例](#代码实现示例-5)
      - [适用场景](#适用场景-5)
      - [权衡分析](#权衡分析-5)
      - [反例（错误应用）](#反例错误应用-5)
    - [2.3 Redux](#23-redux)
      - [定义和核心概念](#定义和核心概念-6)
      - [架构图](#架构图-6)
      - [TypeScript项目结构示例](#typescript项目结构示例-6)
      - [代码实现示例](#代码实现示例-6)
      - [适用场景](#适用场景-6)
      - [权衡分析](#权衡分析-6)
      - [反例（错误应用）](#反例错误应用-6)
    - [2.4 Zustand / Jotai](#24-zustand--jotai)
      - [定义和核心概念](#定义和核心概念-7)
      - [架构图](#架构图-7)
      - [TypeScript项目结构示例](#typescript项目结构示例-7)
      - [代码实现示例](#代码实现示例-7)
      - [适用场景](#适用场景-7)
      - [权衡分析](#权衡分析-7)
      - [反例（错误应用）](#反例错误应用-7)
    - [2.5 Signals](#25-signals)
      - [定义和核心概念](#定义和核心概念-8)
      - [架构图](#架构图-8)
      - [TypeScript项目结构示例](#typescript项目结构示例-8)
      - [代码实现示例](#代码实现示例-8)
      - [适用场景](#适用场景-8)
      - [权衡分析](#权衡分析-8)
      - [反例（错误应用）](#反例错误应用-8)
    - [2.6 状态机 (XState / 有限状态机)](#26-状态机-xstate--有限状态机)
      - [定义和核心概念](#定义和核心概念-9)
      - [架构图](#架构图-9)
      - [TypeScript项目结构示例](#typescript项目结构示例-9)
      - [代码实现示例](#代码实现示例-9)
      - [适用场景](#适用场景-9)
      - [权衡分析](#权衡分析-9)
      - [反例（错误应用）](#反例错误应用-9)
  - [3. 现代全栈架构](#3-现代全栈架构)
    - [3.1 Next.js App Router](#31-nextjs-app-router)
      - [定义和核心概念](#定义和核心概念-10)
      - [架构图](#架构图-10)
      - [TypeScript项目结构示例](#typescript项目结构示例-10)
      - [代码实现示例](#代码实现示例-10)
      - [适用场景](#适用场景-10)
      - [权衡分析](#权衡分析-10)
      - [反例（错误应用）](#反例错误应用-10)
    - [3.2 Islands架构](#32-islands架构)
      - [定义和核心概念](#定义和核心概念-11)
      - [架构图](#架构图-11)
      - [TypeScript项目结构示例 (Astro)](#typescript项目结构示例-astro)
      - [代码实现示例 (Astro)](#代码实现示例-astro)
      - [适用场景](#适用场景-11)
      - [权衡分析](#权衡分析-11)
      - [反例（错误应用）](#反例错误应用-11)
    - [3.3 边缘优先架构](#33-边缘优先架构)
      - [定义和核心概念](#定义和核心概念-12)
      - [架构图](#架构图-12)
      - [TypeScript项目结构示例](#typescript项目结构示例-11)
      - [代码实现示例](#代码实现示例-11)
      - [适用场景](#适用场景-12)
      - [权衡分析](#权衡分析-12)
      - [反例（错误应用）](#反例错误应用-12)
    - [3.4 微前端](#34-微前端)
      - [定义和核心概念](#定义和核心概念-13)
      - [架构图](#架构图-13)
      - [TypeScript项目结构示例](#typescript项目结构示例-12)
      - [代码实现示例](#代码实现示例-12)
      - [适用场景](#适用场景-13)
      - [权衡分析](#权衡分析-13)
      - [反例（错误应用）](#反例错误应用-13)
  - [4. 架构决策](#4-架构决策)
    - [4.1 架构特性分析](#41-架构特性分析)
      - [定义和核心概念](#定义和核心概念-14)
      - [架构特性矩阵](#架构特性矩阵)
      - [架构特性优先级框架](#架构特性优先级框架)
      - [架构权衡分析方法](#架构权衡分析方法)
    - [4.2 架构决策记录(ADR)](#42-架构决策记录adr)
      - [定义和核心概念](#定义和核心概念-15)
      - [ADR模板](#adr模板)
      - [TypeScript项目ADR目录结构](#typescript项目adr目录结构)
      - [ADR管理工具](#adr管理工具)
    - [4.3 技术选型矩阵](#43-技术选型矩阵)
      - [定义和核心概念](#定义和核心概念-16)
      - [前端状态管理选型矩阵](#前端状态管理选型矩阵)
      - [后端架构选型矩阵](#后端架构选型矩阵)
      - [全栈框架选型矩阵](#全栈框架选型矩阵)
      - [选型决策流程](#选型决策流程)
    - [4.4 演进式架构](#44-演进式架构)
      - [定义和核心概念](#定义和核心概念-17)
      - [演进式架构金字塔](#演进式架构金字塔)
      - [适应度函数示例](#适应度函数示例)
      - [架构演进路线图](#架构演进路线图)
      - [反模式与重构策略](#反模式与重构策略)
  - [附录：架构决策速查表](#附录架构决策速查表)
    - [前端状态管理选择](#前端状态管理选择)
    - [后端架构选择](#后端架构选择)
    - [全栈框架选择](#全栈框架选择)
  - [总结](#总结)

---

## 1. 经典架构风格

### 1.1 分层架构 (Layered Architecture)

#### 定义和核心概念

分层架构是最传统、最广泛应用的架构模式，将系统划分为水平层次，每层具有特定的职责和抽象级别。

**核心原则：**

- **单一职责**：每层只负责特定功能
- **依赖方向**：上层依赖下层，下层不依赖上层
- **抽象层次**：越底层越具体，越上层越抽象

#### 架构图

```
┌─────────────────────────────────────────┐
│           表现层 (Presentation)          │  ← UI/API/CLI
│    [Controllers, Views, Components]      │
├─────────────────────────────────────────┤
│           业务逻辑层 (Business)          │  ← 核心业务规则
│    [Services, Use Cases, Domain]         │
├─────────────────────────────────────────┤
│           数据访问层 (Data Access)       │  ← 持久化逻辑
│    [Repositories, DAOs, ORM]             │
├─────────────────────────────────────────┤
│           基础设施层 (Infrastructure)    │  ← 数据库/外部服务
│    [Database, Cache, External APIs]      │
└─────────────────────────────────────────┘
         ↑
    依赖方向（向下）
```

#### TypeScript项目结构示例

```
src/
├── presentation/           # 表现层
│   ├── controllers/        # HTTP请求处理
│   │   ├── UserController.ts
│   │   └── OrderController.ts
│   ├── dto/                # 数据传输对象
│   │   ├── UserDTO.ts
│   │   └── OrderDTO.ts
│   └── middleware/         # 中间件
│       └── auth.middleware.ts
├── business/               # 业务逻辑层
│   ├── services/           # 业务服务
│   │   ├── UserService.ts
│   │   └── OrderService.ts
│   ├── entities/           # 领域实体
│   │   ├── User.ts
│   │   └── Order.ts
│   └── validators/         # 业务验证
│       └── order.validator.ts
├── data-access/            # 数据访问层
│   ├── repositories/       # 仓储接口
│   │   ├── IUserRepository.ts
│   │   └── IOrderRepository.ts
│   └── implementations/    # 具体实现
│       ├── UserRepository.ts
│       └── OrderRepository.ts
└── infrastructure/         # 基础设施层
    ├── database/           # 数据库配置
    │   ├── connection.ts
    │   └── migrations/
    ├── cache/              # 缓存实现
    │   └── RedisCache.ts
    └── external/           # 外部服务
        └── PaymentGateway.ts
```

#### 代码实现示例

```typescript
// 领域实体 (business/entities/User.ts)
export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public name: string,
    private password: string
  ) {}

  validatePassword(input: string): boolean {
    // 密码验证逻辑
    return this.hashPassword(input) === this.password;
  }

  private hashPassword(password: string): string {
    // 哈希实现
    return password; // 简化示例
  }
}

// 仓储接口 (data-access/repositories/IUserRepository.ts)
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

// 业务服务 (business/services/UserService.ts)
export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async authenticate(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.validatePassword(password)) {
      return null;
    }
    return user;
  }

  async register(email: string, name: string, password: string): Promise<User> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }
    const user = new User(crypto.randomUUID(), email, name, password);
    await this.userRepository.save(user);
    return user;
  }
}

// 控制器 (presentation/controllers/UserController.ts)
export class UserController {
  constructor(private userService: UserService) {}

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const user = await this.userService.authenticate(email, password);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    // 生成token并返回
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  }
}
```

#### 适用场景

| 场景 | 适用性 | 说明 |
|------|--------|------|
| 企业级应用 | ⭐⭐⭐⭐⭐ | 经典选择，团队熟悉度高 |
| 中小型项目 | ⭐⭐⭐⭐⭐ | 简单直接，快速开发 |
| 微服务内部 | ⭐⭐⭐⭐ | 服务内部分层清晰 |
| 高度复杂领域 | ⭐⭐⭐ | 可能需要更灵活的架构 |
| 快速原型 | ⭐⭐⭐⭐⭐ | 开发速度快 |

#### 权衡分析

**优点：**

- 简单易懂，学习曲线平缓
- 团队熟悉度高，易于维护
- 职责分离清晰
- 易于测试（各层可独立测试）

**缺点：**

- 层间调用可能产生性能开销
- 业务逻辑可能分散在各层
- 难以应对复杂领域模型
- 依赖方向固定，灵活性受限

#### 反例（错误应用）

```typescript
// ❌ 错误：表现层直接访问数据层
class UserController {
  private db: Database; // 直接依赖数据库

  async getUser(req: Request, res: Response) {
    // 控制器直接执行SQL查询
    const user = await this.db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    res.json(user);
  }
}

// ❌ 错误：下层依赖上层
// data-access/ 层导入 business/ 层的代码
import { UserService } from '../business/services/UserService'; // 违反依赖规则

// ❌ 错误：跨层调用
class OrderService {
  async createOrder(data: OrderData) {
    // 业务层直接操作HTTP客户端
    const response = await fetch('https://api.payment.com/charge', {...});
    // 应该通过接口抽象
  }
}
```

#### 形式化论证

**定理**：在严格遵循依赖规则的分层架构中，修改第N层不会影响第N-1层及以下层次。

**证明**：
设系统有L层，记为Layer₁, Layer₂, ..., Layerₙ，其中Layer₁为最底层（基础设施）。

根据依赖规则：
∀i,j: Layerᵢ 依赖 Layerⱼ ⟹ i > j

假设修改Layerₖ，需要证明：
∀m < k: Layerₘ 不受影响

由依赖规则可知，Layerₘ 只能被Layerₙ (n > m) 依赖。
由于 k > m 不成立（因为 m < k），所以不存在Layerₘ 被Layerₖ 依赖的情况。

因此，修改Layerₖ 不会影响任何 m < k 的Layerₘ。

**推论**：分层架构提供了变更隔离的数学保证。

---

### 1.2 六边形架构 (Hexagonal Architecture / Ports and Adapters)

#### 定义和核心概念

六边形架构（又称端口适配器架构）由Alistair Cockburn提出，核心思想是将应用程序与外部世界隔离，通过定义良好的端口和适配器进行通信。

**核心概念：**

- **应用程序核心（Application Core）**：包含业务逻辑，不依赖任何外部框架
- **端口（Ports）**：定义应用程序与外部交互的接口
- **适配器（Adapters）**：实现端口的具体技术适配
- **内外边界**：明确区分内部（领域）和外部（基础设施）

#### 架构图

```
                    ┌─────────────────┐
                    │   Web UI / CLI  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Primary Adapter │  ← 驱动适配器
                    │  (Controller)    │    (Driving)
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        │         ┌──────────┴──────────┐         │
        │         │                     │         │
        │    ┌────┴────┐           ┌────┴────┐    │
        │    │  Input  │           │ Output  │    │
        │    │  Port   │◄─────────►│  Port   │    │
        │    └────┬────┘           └────┬────┘    │
        │         │                     │         │
        │    ┌────┴────────────────┬────┴────┐    │
        │    │                     │         │    │
        │    │   ┌─────────────┐   │         │    │
        │    │   │  Application │   │         │    │
        │    │   │    Core      │   │         │    │
        │    │   │  [Domain]    │   │         │    │
        │    │   └─────────────┘   │         │    │
        │    │                     │         │    │
        │    └─────────────────────┘         │    │
        │                                    │    │
        │              六边形                 │    │
        │           (Hexagon)                │    │
        └────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │ Secondary Adapter│  ← 被驱动适配器
                    │  (Repository)    │    (Driven)
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Database / API │
                    └─────────────────┘
```

#### TypeScript项目结构示例

```
src/
├── core/                          # 应用程序核心
│   ├── domain/                    # 领域层
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   └── Order.ts
│   │   ├── value-objects/
│   │   │   ├── Email.ts
│   │   │   └── Money.ts
│   │   └── services/
│   │       └── PaymentService.ts
│   ├── ports/                     # 端口定义
│   │   ├── incoming/              # 入站端口（驱动）
│   │   │   ├── IUserService.ts
│   │   │   └── IOrderService.ts
│   │   └── outgoing/              # 出站端口（被驱动）
│   │       ├── IUserRepository.ts
│   │       ├── IEmailService.ts
│   │       └── IPaymentGateway.ts
│   └── use-cases/                 # 用例实现
│       ├── RegisterUser.ts
│       ├── PlaceOrder.ts
│       └── CancelOrder.ts
├── adapters/                      # 适配器实现
│   ├── incoming/                  # 入站适配器
│   │   ├── web/                   # Web适配器
│   │   │   ├── controllers/
│   │   │   │   ├── UserController.ts
│   │   │   │   └── OrderController.ts
│   │   │   └── middleware/
│   │   ├── cli/                   # CLI适配器
│   │   │   └── commands/
│   │   └── messaging/             # 消息适配器
│   │       └── event-handlers/
│   └── outgoing/                  # 出站适配器
│       ├── persistence/           # 持久化适配器
│       │   ├── repositories/
│       │   │   ├── UserRepository.ts
│       │   │   └── OrderRepository.ts
│       │   └── database/
│       ├── external/              # 外部服务适配器
│       │   ├── StripePaymentGateway.ts
│       │   └── SendGridEmailService.ts
│       └── cache/
│           └── RedisCache.ts
├── config/                        # 配置
│   ├── di-container.ts            # 依赖注入配置
│   └── app.ts                     # 应用启动
└── tests/                         # 测试
    ├── unit/                      # 单元测试（核心）
    ├── integration/               # 集成测试（适配器）
    └── e2e/                       # 端到端测试
```

#### 代码实现示例

```typescript
// ============================================
// 核心领域 (core/domain/entities/User.ts)
// ============================================
export class User {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    private _passwordHash: string
  ) {}

  static create(email: string, name: string, password: string): User {
    // 验证逻辑
    if (!email.includes('@')) {
      throw new Error('Invalid email');
    }
    return new User(
      crypto.randomUUID(),
      email,
      name,
      User.hashPassword(password)
    );
  }

  verifyPassword(password: string): boolean {
    return User.hashPassword(password) === this._passwordHash;
  }

  private static hashPassword(password: string): string {
    // 简化示例
    return password;
  }
}

// ============================================
// 端口定义 (core/ports/)
// ============================================

// 入站端口 - 应用程序提供的服务
export interface IUserService {
  register(email: string, name: string, password: string): Promise<User>;
  authenticate(email: string, password: string): Promise<User | null>;
}

// 出站端口 - 应用程序需要的外部服务
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export interface IEmailService {
  sendWelcomeEmail(to: string, name: string): Promise<void>;
}

// ============================================
// 用例实现 (core/use-cases/RegisterUser.ts)
// ============================================
export class RegisterUser {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    // 检查用户是否已存在
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error('User already exists');
    }

    // 创建新用户
    const user = User.create(input.email, input.name, input.password);
    await this.userRepository.save(user);

    // 发送欢迎邮件
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return user;
  }
}

// ============================================
// 入站适配器 (adapters/incoming/web/controllers/UserController.ts)
// ============================================
export class UserController {
  constructor(private registerUser: RegisterUser) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.registerUser.execute(req.body);
      res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}

// ============================================
// 出站适配器 (adapters/outgoing/persistence/repositories/UserRepository.ts)
// ============================================
export class UserRepository implements IUserRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
    return row ? this.mapToUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.query('SELECT * FROM users WHERE email = ?', [email]);
    return row ? this.mapToUser(row) : null;
  }

  async save(user: User): Promise<void> {
    await this.db.query(
      'INSERT INTO users (id, email, name) VALUES (?, ?, ?)',
      [user.id, user.email, user.name]
    );
  }

  private mapToUser(row: any): User {
    return User.create(row.email, row.name, '');
  }
}

// ============================================
// 依赖注入配置 (config/di-container.ts)
// ============================================
export function createContainer(): Container {
  const container = new Container();

  // 基础设施
  const db = new Database();
  const emailClient = new SendGridClient();

  // 出站适配器
  const userRepository = new UserRepository(db);
  const emailService = new SendGridEmailService(emailClient);

  // 用例
  const registerUser = new RegisterUser(userRepository, emailService);

  // 入站适配器
  const userController = new UserController(registerUser);

  return { userController };
}
```

#### 适用场景

| 场景 | 适用性 | 说明 |
|------|--------|------|
| 需要多接口支持 | ⭐⭐⭐⭐⭐ | Web/API/CLI/消息队列 |
| 测试驱动开发 | ⭐⭐⭐⭐⭐ | 易于Mock外部依赖 |
| 技术栈可能变更 | ⭐⭐⭐⭐⭐ | 适配器隔离技术细节 |
| 领域驱动设计 | ⭐⭐⭐⭐⭐ | 与DDD完美契合 |
| 简单CRUD应用 | ⭐⭐⭐ | 可能过度设计 |

#### 权衡分析

**优点：**

- 技术无关性：核心逻辑不依赖任何框架
- 可测试性：易于单元测试和集成测试
- 可替换性：适配器可独立替换
- 清晰边界：内外分离明确

**缺点：**

- 初始复杂度较高
- 需要更多样板代码
- 团队需要理解端口/适配器概念
- 小型项目可能过度设计

#### 反例（错误应用）

```typescript
// ❌ 错误：核心逻辑依赖框架
// core/use-cases/RegisterUser.ts
import express from 'express'; // 核心层不应该依赖Express

export class RegisterUser {
  async execute(req: express.Request): Promise<void> {
    // 直接操作请求对象
  }
}

// ❌ 错误：端口定义包含实现细节
export interface IUserRepository {
  // 不应该暴露SQL细节
  executeQuery(sql: string, params: any[]): Promise<any>;
}

// ❌ 错误：适配器直接调用适配器
class UserController {
  async register(req: Request, res: Response) {
    // 控制器直接操作数据库，跳过用例层
    const db = new Database();
    await db.query('INSERT INTO users...');
  }
}

// ❌ 错误：核心业务逻辑泄露到适配器
class UserRepository {
  async save(user: User): Promise<void> {
    // 验证逻辑应该在核心，不在适配器
    if (!user.email.includes('@')) {
      throw new Error('Invalid email');
    }
    // ...
  }
}
```

#### 形式化论证

**定理**：六边形架构中，核心逻辑的测试可以完全不依赖任何外部基础设施。

**证明**：
设核心逻辑C依赖于端口集合P = {p₁, p₂, ..., pₙ}。

对于每个端口pᵢ，存在适配器aᵢ使得aᵢ实现pᵢ。

定义测试替身集合T = {t₁, t₂, ..., tₙ}，其中每个tᵢ是pᵢ的Mock实现。

根据依赖注入原则，我们可以构造：
C' = C(t₁, t₂, ..., tₙ)

由于tᵢ不依赖任何外部基础设施（纯内存实现），
且C仅通过pᵢ与外部交互，
因此C'的测试完全不依赖外部基础设施。

**推论**：测试执行时间T_test(C') << T_test(C(a₁, a₂, ..., aₙ))。

---

### 1.3 洋葱架构 (Onion Architecture)

#### 定义和核心概念

洋葱架构由Jeffrey Palermo提出，是分层架构的演进版本，强调领域模型位于核心，所有依赖都指向中心。

**核心原则：**

- **领域核心**：最内层，包含实体、值对象、领域服务
- **依赖方向**：所有依赖指向中心（Domain）
- **层间隔离**：外层通过接口与内层交互
- **无外部依赖**：核心层零外部依赖

#### 架构图

```
                    ┌─────────────┐
                    │             │
                    │   UI / API  │  ← 最外层：接口适配
                    │             │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              │     ┌──────┴──────┐     │
              │     │             │     │
              │     │ Application │     │  ← 应用服务层
              │     │   Services  │     │
              │     │             │     │
              │     └──────┬──────┘     │
              │            │            │
              │     ┌──────┴──────┐     │
              │     │             │     │
              │     │   Domain    │     │  ← 领域层
              │     │  Services   │     │
              │     │             │     │
              │     └──────┬──────┘     │
              │            │            │
              │     ┌──────┴──────┐     │
              │     │             │     │
              │     │  Domain     │     │  ← 核心：实体和值对象
              │     │  Entities   │     │
              │     │             │     │
              │     └─────────────┘     │
              │                         │
              │        洋葱架构          │
              │      (Onion Arch)       │
              └─────────────────────────┘
```

#### TypeScript项目结构示例

```
src/
├── domain/                        # 最内层：领域核心
│   ├── entities/                  # 领域实体
│   │   ├── User.ts
│   │   ├── Order.ts
│   │   └── Product.ts
│   ├── value-objects/             # 值对象
│   │   ├── Money.ts
│   │   ├── Address.ts
│   │   └── Email.ts
│   ├── domain-services/           # 领域服务
│   │   ├── PricingService.ts
│   │   └── InventoryService.ts
│   ├── repositories/              # 仓储接口（仅接口）
│   │   ├── IUserRepository.ts
│   │   └── IOrderRepository.ts
│   └── events/                    # 领域事件
│       ├── OrderPlacedEvent.ts
│       └── UserRegisteredEvent.ts
├── application/                   # 第二层：应用服务
│   ├── services/                  # 应用服务
│   │   ├── UserApplicationService.ts
│   │   └── OrderApplicationService.ts
│   ├── dto/                       # 数据传输对象
│   │   ├── CreateUserDTO.ts
│   │   └── CreateOrderDTO.ts
│   ├── interfaces/                # 应用层接口
│   │   ├── IEmailSender.ts
│   │   └── ILogger.ts
│   └── use-cases/                 # 用例
│       ├── RegisterUserUseCase.ts
│       └── PlaceOrderUseCase.ts
├── infrastructure/                # 第三层：基础设施
│   ├── persistence/               # 持久化
│   │   ├── repositories/
│   │   │   ├── UserRepository.ts
│   │   │   └── OrderRepository.ts
│   │   └── database/
│   ├── external-services/         # 外部服务
│   │   ├── SendGridEmailSender.ts
│   │   └── StripePaymentService.ts
│   └── logging/
│       └── WinstonLogger.ts
└── presentation/                  # 最外层：表现层
    ├── api/                       # API控制器
    │   ├── controllers/
    │   └── middleware/
    ├── web/                       # Web界面
    └── cli/                       # 命令行
```

#### 代码实现示例

```typescript
// ============================================
// 最内层：领域核心 (domain/)
// ============================================

// 值对象 (domain/value-objects/Money.ts)
export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {}

  static create(amount: number, currency: string = 'USD'): Money {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    return new Money(amount, currency);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return Money.create(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return Money.create(this.amount * factor, this.currency);
  }
}

// 领域实体 (domain/entities/Order.ts)
export class Order {
  private _items: OrderItem[] = [];
  private _status: OrderStatus = 'pending';

  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly createdAt: Date = new Date()
  ) {}

  addItem(productId: string, quantity: number, unitPrice: Money): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    const item = new OrderItem(productId, quantity, unitPrice);
    this._items.push(item);
  }

  getTotal(): Money {
    return this._items.reduce(
      (total, item) => total.add(item.getSubtotal()),
      Money.create(0)
    );
  }

  confirm(): void {
    if (this._items.length === 0) {
      throw new Error('Cannot confirm empty order');
    }
    this._status = 'confirmed';
  }

  get items(): readonly OrderItem[] {
    return this._items;
  }

  get status(): OrderStatus {
    return this._status;
  }
}

// 领域事件 (domain/events/OrderPlacedEvent.ts)
export class OrderPlacedEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly total: Money,
    public readonly occurredAt: Date = new Date()
  ) {}
}

// 仓储接口 (domain/repositories/IOrderRepository.ts)
export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
  save(order: Order): Promise<void>;
}

// ============================================
// 第二层：应用服务 (application/)
// ============================================

// 应用服务 (application/services/OrderApplicationService.ts)
export class OrderApplicationService {
  constructor(
    private orderRepository: IOrderRepository,
    private eventPublisher: IEventPublisher,
    private logger: ILogger
  ) {}

  async placeOrder(dto: CreateOrderDTO): Promise<Order> {
    this.logger.info(`Placing order for customer: ${dto.customerId}`);

    const order = new Order(crypto.randomUUID(), dto.customerId);

    for (const item of dto.items) {
      order.addItem(
        item.productId,
        item.quantity,
        Money.create(item.unitPrice)
      );
    }

    order.confirm();
    await this.orderRepository.save(order);

    // 发布领域事件
    const event = new OrderPlacedEvent(
      order.id,
      order.customerId,
      order.getTotal()
    );
    await this.eventPublisher.publish(event);

    this.logger.info(`Order placed: ${order.id}`);
    return order;
  }
}

// 应用层接口 (application/interfaces/ILogger.ts)
export interface ILogger {
  info(message: string): void;
  error(message: string, error?: Error): void;
}

// ============================================
// 第三层：基础设施 (infrastructure/)
// ============================================

// 仓储实现 (infrastructure/persistence/repositories/OrderRepository.ts)
export class OrderRepository implements IOrderRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<Order | null> {
    const row = await this.db.query(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    return row ? this.mapToOrder(row) : null;
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const rows = await this.db.query(
      'SELECT * FROM orders WHERE customer_id = ?',
      [customerId]
    );
    return rows.map((r: any) => this.mapToOrder(r));
  }

  async save(order: Order): Promise<void> {
    await this.db.transaction(async (trx) => {
      await trx.query(
        'INSERT INTO orders (id, customer_id, status, created_at) VALUES (?, ?, ?, ?)',
        [order.id, order.customerId, order.status, order.createdAt]
      );

      for (const item of order.items) {
        await trx.query(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
          [order.id, item.productId, item.quantity, item.unitPrice.amount]
        );
      }
    });
  }

  private mapToOrder(row: any): Order {
    return new Order(row.id, row.customer_id, new Date(row.created_at));
  }
}

// 日志实现 (infrastructure/logging/WinstonLogger.ts)
export class WinstonLogger implements ILogger {
  private winston = require('winston');

  info(message: string): void {
    this.winston.info(message);
  }

  error(message: string, error?: Error): void {
    this.winston.error(message, error);
  }
}

// ============================================
// 最外层：表现层 (presentation/)
// ============================================

// API控制器 (presentation/api/controllers/OrderController.ts)
export class OrderController {
  constructor(private orderService: OrderApplicationService) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const order = await this.orderService.placeOrder(req.body);
      res.status(201).json({
        id: order.id,
        customerId: order.customerId,
        total: order.getTotal(),
        status: order.status
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
```

#### 适用场景

| 场景 | 适用性 | 说明 |
|------|--------|------|
| 复杂业务逻辑 | ⭐⭐⭐⭐⭐ | 领域模型为核心 |
| DDD实践 | ⭐⭐⭐⭐⭐ | 完美支持DDD |
| 长期维护项目 | ⭐⭐⭐⭐⭐ | 边界清晰，易于演进 |
| 多团队开发 | ⭐⭐⭐⭐ | 内层稳定，外层灵活 |
| 简单CRUD | ⭐⭐⭐ | 可能过度设计 |

#### 权衡分析

**优点：**

- 领域模型完全隔离
- 依赖方向明确且一致
- 高度可测试性
- 支持领域驱动设计
- 长期可维护性强

**缺点：**

- 学习曲线陡峭
- 初始开发成本较高
- 需要领域建模能力
- 简单项目可能过度设计

#### 反例（错误应用）

```typescript
// ❌ 错误：领域层依赖外部库
// domain/entities/Order.ts
import { v4 as uuidv4 } from 'uuid'; // 领域层不应该直接依赖uuid库
import moment from 'moment'; // 不应该依赖moment

// ❌ 错误：领域实体包含持久化逻辑
class User {
  async save(): Promise<void> {
    // 领域实体不应该知道如何保存自己
    await db.query('INSERT INTO users...');
  }
}

// ❌ 错误：应用层直接操作数据库
class OrderApplicationService {
  async placeOrder(dto: CreateOrderDTO): Promise<void> {
    // 应用层不应该直接执行SQL
    await this.db.query('INSERT INTO orders...');
  }
}

// ❌ 错误：依赖方向错误
// application/ 导入 infrastructure/
import { UserRepository } from '../../infrastructure/persistence/UserRepository';
// 应该依赖接口，通过依赖注入
```

#### 形式化论证

**定理**：在洋葱架构中，内层代码的变更频率低于外层代码。

**证明**：
设系统有N层，记为L₁（核心）, L₂, ..., Lₙ（外层）。

定义变更传播函数 C(Lᵢ, Lⱼ) = 1 如果 Lᵢ 的变更导致 Lⱼ 需要变更，否则为0。

根据洋葱架构依赖规则：
∀i,j: C(Lᵢ, Lⱼ) ⟹ i < j

即：只有内层变更可能导致外层变更，反之不成立。

设每层变更概率为 P(Lᵢ)，则期望变更次数：
E[changes] = Σᵢ P(Lᵢ) × (1 + Σⱼ C(Lᵢ, Lⱼ))

由于核心业务规则（L₁）相对稳定，而技术实现（Lₙ）经常变化：
P(L₁) << P(Lₙ)

因此，内层代码变更频率显著低于外层。

---

### 1.4 清洁架构 (Clean Architecture)

#### 定义和核心概念

清洁架构由Robert C. Martin（Uncle Bob）提出，是洋葱架构的进一步发展，强调业务规则的独立性，通过依赖规则实现技术无关性。

**四层结构：**

1. **实体（Entities）**：企业级业务规则
2. **用例（Use Cases）**：应用特定业务规则
3. **接口适配器（Interface Adapters）**：数据转换
4. **框架与驱动（Frameworks & Drivers）**：外部工具

**依赖规则：** 源代码依赖只能向内指向高层策略。

#### 架构图

```
                    ┌─────────────────────────┐
                    │                         │
                    │    Frameworks &         │
                    │      Drivers            │  ← 最外层
                    │  [Web, DB, External]    │
                    │                         │
                    └───────────┬─────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    │  Interface Adapters   │  ← 数据转换
                    │  [Controllers,        │
                    │   Presenters,         │
                    │   Gateways]           │
                    │                       │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    │    Use Cases          │  ← 应用业务规则
                    │  [Interactors,        │
                    │   Application        │
                    │   Services]           │
                    │                       │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    │      Entities         │  ← 核心：企业业务规则
                    │  [Enterprise          │
                    │   Business Rules]     │
                    │                       │
                    └───────────────────────┘

                    ═══════════════════════
                          清洁架构
                      (Clean Architecture)
                    ═══════════════════════
```

#### TypeScript项目结构示例

```
src/
├── entities/                      # 企业级业务规则（最内层）
│   ├── User.ts
│   ├── Order.ts
│   ├── Product.ts
│   └── value-objects/
│       ├── Money.ts
│       └── Email.ts
├── use-cases/                     # 应用业务规则
│   ├── boundaries/                # 输入/输出边界
│   │   ├── input/
│   │   │   ├── CreateUserInput.ts
│   │   │   └── PlaceOrderInput.ts
│   │   └── output/
│   │       ├── CreateUserOutput.ts
│   │       └── PlaceOrderOutput.ts
│   ├── interactor/                # 交互器（用例实现）
│   │   ├── CreateUserInteractor.ts
│   │   └── PlaceOrderInteractor.ts
│   └── ports/                     # 端口定义
│       ├── repositories/
│       │   ├── UserRepository.ts
│       │   └── OrderRepository.ts
│       └── services/
│           ├── EmailService.ts
│           └── PaymentService.ts
├── interface-adapters/            # 接口适配器
│   ├── controllers/               # 控制器
│   │   ├── UserController.ts
│   │   └── OrderController.ts
│   ├── presenters/                # 展示器
│   │   ├── UserPresenter.ts
│   │   └── OrderPresenter.ts
│   ├── gateways/                  # 网关实现
│   │   ├── repositories/
│   │   │   ├── UserRepositoryImpl.ts
│   │   │   └── OrderRepositoryImpl.ts
│   │   └── services/
│   │       ├── EmailServiceImpl.ts
│   │       └── PaymentServiceImpl.ts
│   └── mappers/                   # 数据映射器
│       ├── UserMapper.ts
│       └── OrderMapper.ts
├── frameworks/                    # 框架与驱动
│   ├── web/                       # Web框架
│   │   ├── express/
│   │   │   ├── server.ts
│   │   │   └── routes.ts
│   │   └── fastify/
│   ├── database/                  # 数据库
│   │   ├── prisma/
│   │   ├── typeorm/
│   │   └── migrations/
│   └── external/                  # 外部服务
│       ├── stripe/
│       └── sendgrid/
└── config/                        # 配置
    └── dependency-injection.ts
```

#### 代码实现示例

```typescript
// ============================================
// 第一层：实体 (entities/)
// ============================================

// 企业级实体 - 包含最核心的业务规则
export class User {
  private _email: string;
  private _passwordHash: string;

  constructor(
    public readonly id: string,
    email: string,
    public readonly name: string,
    passwordHash: string
  ) {
    this._email = email;
    this._passwordHash = passwordHash;
  }

  static create(email: string, name: string, password: string): User {
    if (!User.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    return new User(
      crypto.randomUUID(),
      email,
      name,
      User.hashPassword(password)
    );
  }

  verifyPassword(password: string): boolean {
    return User.hashPassword(password) === this._passwordHash;
  }

  get email(): string {
    return this._email;
  }

  private static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private static hashPassword(password: string): string {
    // 简化示例
    return password;
  }
}

// ============================================
// 第二层：用例 (use-cases/)
// ============================================

// 输入边界
export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

// 输出边界
export interface CreateUserOutput {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// 端口定义
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export interface IEmailService {
  sendWelcomeEmail(email: string, name: string): Promise<void>;
}

// 交互器（用例实现）
export class CreateUserInteractor {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    // 检查用户是否存在
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error('User already exists');
    }

    // 创建用户
    const user = User.create(input.email, input.name, input.password);
    await this.userRepository.save(user);

    // 发送欢迎邮件
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date()
    };
  }
}

// ============================================
// 第三层：接口适配器 (interface-adapters/)
// ============================================

// 控制器
export class UserController {
  constructor(private createUser: CreateUserInteractor) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const output = await this.createUser.execute(req.body);
      res.status(201).json(output);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}

// 展示器（格式化输出）
export class UserPresenter {
  present(output: CreateUserOutput): UserViewModel {
    return {
      id: output.id,
      email: output.email,
      name: output.name,
      createdAt: output.createdAt.toISOString(),
      displayName: this.formatDisplayName(output.name)
    };
  }

  private formatDisplayName(name: string): string {
    return name.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
  }
}

// 视图模型
export interface UserViewModel {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  displayName: string;
}

// 仓储实现
export class UserRepositoryImpl implements IUserRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
    return row ? this.mapToEntity(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.query('SELECT * FROM users WHERE email = ?', [email]);
    return row ? this.mapToEntity(row) : null;
  }

  async save(user: User): Promise<void> {
    await this.db.query(
      'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)',
      [user.id, user.email, user.name, 'hash_placeholder']
    );
  }

  private mapToEntity(row: any): User {
    return new User(row.id, row.email, row.name, row.password_hash);
  }
}

// 邮件服务实现
export class EmailServiceImpl implements IEmailService {
  constructor(private sendGridClient: any) {}

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendGridClient.send({
      to: email,
      subject: 'Welcome!',
      text: `Hello ${name}, welcome to our platform!`
    });
  }
}

// ============================================
// 第四层：框架与驱动 (frameworks/)
// ============================================

// Express服务器配置
export function createServer(
  userController: UserController
): express.Application {
  const app = express();
  app.use(express.json());

  app.post('/users', (req, res) => userController.create(req, res));

  return app;
}

// 依赖注入配置
export function configureDependencies(): Dependencies {
  // 框架层实例
  const db = new Database();
  const sendGridClient = new SendGridClient(process.env.SENDGRID_API_KEY!);

  // 适配器层实例
  const userRepository = new UserRepositoryImpl(db);
  const emailService = new EmailServiceImpl(sendGridClient);

  // 用例层实例
  const createUser = new CreateUserInteractor(userRepository, emailService);

  // 控制器
  const userController = new UserController(createUser);

  return { userController };
}
```

#### 适用场景

| 场景 | 适用性 | 说明 |
|------|--------|------|
| 大型企业应用 | ⭐⭐⭐⭐⭐ | 完美匹配复杂业务 |
| 需要长期演进 | ⭐⭐⭐⭐⭐ | 架构稳定，易于重构 |
| 多团队协作 | ⭐⭐⭐⭐⭐ | 清晰的职责边界 |
| 高测试覆盖率 | ⭐⭐⭐⭐⭐ | 核心逻辑完全可测试 |
| 快速原型 | ⭐⭐ | 初始成本较高 |

#### 权衡分析

**优点：**

- 业务规则完全独立
- 框架无关性
- 高度可测试
- 清晰的架构边界
- 支持持续演进

**缺点：**

- 初始学习曲线陡峭
- 需要更多样板代码
- 小型项目可能过度设计
- 需要严格的纪律执行

#### 反例（错误应用）

```typescript
// ❌ 错误：实体层依赖框架
// entities/User.ts
import express from 'express'; // 实体层不应该依赖Express
import { Entity, Column } from 'typeorm'; // 不应该依赖ORM

@Entity() // 这是框架注解，不应该在实体层
class User {
  @Column() // 不应该在这里
  email: string;
}

// ❌ 错误：用例层直接操作HTTP
class CreateUserInteractor {
  async execute(req: express.Request): Promise<void> {
    // 用例层不应该知道HTTP
  }
}

// ❌ 错误：依赖方向错误
// use-cases/CreateUserInteractor.ts
import { UserRepositoryImpl } from '../interface-adapters/gateways/UserRepositoryImpl';
// 应该依赖接口，不是实现

// ❌ 错误：跳过适配器层
class UserController {
  async create(req: Request, res: Response) {
    // 控制器直接调用数据库，跳过了用例层
    const db = new Database();
    await db.query('INSERT INTO users...');
  }
}
```

#### 形式化论证

**定理**：清洁架构中的实体层可以在没有任何框架的情况下独立运行和测试。

**证明**：
设实体层E的依赖集合为Dep(E)。

根据清洁架构依赖规则：
∀d ∈ Dep(E): d ∉ Frameworks

即：实体层的所有依赖都不是框架。

定义框架集合F = {f₁, f₂, ..., fₙ}，其中fᵢ是具体框架（如Express、TypeORM等）。

由于Dep(E) ∩ F = ∅，

因此，E可以在没有任何fᵢ ∈ F的情况下编译和运行。

**推论**：

1. 实体层测试不需要任何框架初始化
2. 实体层测试执行时间最小化
3. 实体层可以在不同框架间无缝迁移

---

## 2. 前端架构演进

### 2.1 MVC / MVVM

#### 定义和核心概念

**MVC（Model-View-Controller）**：将应用分为三个组件

- **Model**：数据模型和业务逻辑
- **View**：用户界面展示
- **Controller**：处理用户输入，协调Model和View

**MVVM（Model-View-ViewModel）**：MVC的演进

- **Model**：数据模型
- **View**：用户界面
- **ViewModel**：视图的抽象，负责数据绑定和命令

#### 架构图

```
MVC 架构：
┌─────────────────────────────────────────────────┐
│                                                 │
│   ┌─────────┐      更新      ┌─────────┐       │
│   │  View   │◄──────────────│  Model  │       │
│   │  [UI]   │               │ [Data]  │       │
│   └────┬────┘               └────▲────┘       │
│        │                         │            │
│        │ 用户操作                 │            │
│        │                         │            │
│        ▼                         │            │
│   ┌─────────┐      修改      ┌───┴────┐       │
│   │Controller│──────────────►│  Model │       │
│   │[Logic]  │               │ [Data] │       │
│   └─────────┘               └────────┘       │
│                                                 │
└─────────────────────────────────────────────────┘

MVVM 架构：
┌─────────────────────────────────────────────────┐
│                                                 │
│   ┌─────────┐    数据绑定    ┌─────────────┐   │
│   │  View   │◄──────────────►│  ViewModel  │   │
│   │  [UI]   │    双向绑定    │ [Commands]  │   │
│   └────┬────┘                └──────┬──────┘   │
│        │                            │          │
│        │                            │          │
│        │ 用户操作                    │          │
│        │                            │          │
│        │                            ▼          │
│        │                     ┌─────────────┐   │
│        │                     │    Model    │   │
│        │                     │   [Data]    │   │
│        │                     └─────────────┘   │
│        │                                        │
│        └──────────── 通知 ─────────────────────►│
│                                                 │
└─────────────────────────────────────────────────┘
```

#### TypeScript项目结构示例

```
src/
├── models/                        # 数据模型
│   ├── User.ts
│   ├── Product.ts
│   └── Order.ts
├── views/                         # 视图组件
│   ├── components/                # UI组件
│   │   ├── UserProfile.tsx
│   │   ├── ProductCard.tsx
│   │   └── OrderList.tsx
│   └── pages/                     # 页面
│       ├── HomePage.tsx
│       └── ProfilePage.tsx
├── viewmodels/                    # 视图模型 (MVVM)
│   ├── UserViewModel.ts
│   ├── ProductViewModel.ts
│   └── OrderViewModel.ts
├── controllers/                   # 控制器 (MVC)
│   ├── UserController.ts
│   └── OrderController.ts
├── services/                      # 服务层
│   ├── ApiService.ts
│   └── StorageService.ts
└── stores/                        # 状态存储
    └── GlobalStore.ts
```

#### 代码实现示例

```typescript
// ============================================
// Model (models/User.ts)
// ============================================
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface UserUpdateData {
  name?: string;
  avatar?: string;
}

// ============================================
// MVC 实现
// ============================================

// Controller (controllers/UserController.ts)
export class UserController {
  private model: UserModel;
  private view: UserView;

  constructor(model: UserModel, view: UserView) {
    this.model = model;
    this.view = view;

    // 绑定视图事件
    this.view.onNameChange = (name) => this.updateName(name);
    this.view.onAvatarChange = (avatar) => this.updateAvatar(avatar);

    // 初始化
    this.refreshView();
  }

  async loadUser(id: string): Promise<void> {
    await this.model.fetchUser(id);
    this.refreshView();
  }

  private async updateName(name: string): Promise<void> {
    await this.model.updateUser({ name });
    this.refreshView();
  }

  private async updateAvatar(avatar: string): Promise<void> {
    await this.model.updateUser({ avatar });
    this.refreshView();
  }

  private refreshView(): void {
    const user = this.model.getUser();
    this.view.render(user);
  }
}

// Model (models/UserModel.ts)
export class UserModel {
  private user: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor(private apiService: ApiService) {}

  async fetchUser(id: string): Promise<void> {
    this.user = await this.apiService.get<User>(`/users/${id}`);
    this.notifyListeners();
  }

  async updateUser(data: UserUpdateData): Promise<void> {
    if (!this.user) return;
    this.user = await this.apiService.patch<User>(`/users/${this.user.id}`, data);
    this.notifyListeners();
  }

  getUser(): User | null {
    return this.user;
  }

  subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.user));
  }
}

// View (views/UserView.tsx - React)
interface UserViewProps {
  user: User | null;
  onNameChange: (name: string) => void;
  onAvatarChange: (avatar: string) => void;
}

export const UserView: React.FC<UserViewProps> = ({
  user,
  onNameChange,
  onAvatarChange
}) => {
  if (!user) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <img src={user.avatar} alt={user.name} />
      <input
        value={user.name}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              onAvatarChange(event.target?.result as string);
            };
            reader.readAsDataURL(file);
          }
        }}
      />
    </div>
  );
};

// ============================================
// MVVM 实现 (React + MobX)
// ============================================

// ViewModel (viewmodels/UserViewModel.ts)
import { makeAutoObservable } from 'mobx';

export class UserViewModel {
  user: User | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(private apiService: ApiService) {
    makeAutoObservable(this);
  }

  get displayName(): string {
    return this.user?.name || 'Guest';
  }

  get avatarUrl(): string {
    return this.user?.avatar || '/default-avatar.png';
  }

  get isAuthenticated(): boolean {
    return !!this.user;
  }

  async loadUser(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;
    try {
      this.user = await this.apiService.get<User>(`/users/${id}`);
    } catch (err) {
      this.error = (err as Error).message;
    } finally {
      this.isLoading = false;
    }
  }

  async updateName(name: string): Promise<void> {
    if (!this.user) return;
    try {
      this.user = await this.apiService.patch<User>(`/users/${this.user.id}`, { name });
    } catch (err) {
      this.error = (err as Error).message;
    }
  }

  async updateAvatar(file: File): Promise<void> {
    if (!this.user) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      this.user = await this.apiService.post<User>(`/users/${this.user.id}/avatar`, formData);
    } catch (err) {
      this.error = (err as Error).message;
    }
  }
}

// View with ViewModel (views/UserProfile.tsx)
import { observer } from 'mobx-react-lite';

interface UserProfileProps {
  viewModel: UserViewModel;
}

export const UserProfile = observer<UserProfileProps>(({ viewModel }) => {
  if (viewModel.isLoading) return <div>Loading...</div>;
  if (viewModel.error) return <div>Error: {viewModel.error}</div>;
  if (!viewModel.isAuthenticated) return <div>Please log in</div>;

  return (
    <div className="user-profile">
      <img src={viewModel.avatarUrl} alt={viewModel.displayName} />
      <h2>{viewModel.displayName}</h2>
      <input
        value={viewModel.user?.name}
        onChange={(e) => viewModel.updateName(e.target.value)}
      />
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) viewModel.updateAvatar(file);
        }}
      />
    </div>
  );
});
```

#### 适用场景

| 场景 | MVC | MVVM | 说明 |
|------|-----|------|------|
| 传统服务端渲染 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 经典选择 |
| 现代SPA | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 数据绑定更高效 |
| 复杂表单 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 双向绑定优势 |
| 简单页面 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 两者皆可 |
| 大型应用 | ⭐⭐⭐ | ⭐⭐⭐⭐ | MVVM更易维护 |

#### 权衡分析

**MVC优点：**

- 概念简单，易于理解
- 职责分离清晰
- 广泛支持

**MVC缺点：**

- 视图和控制器耦合
- 手动DOM操作繁琐
- 数据流不清晰

**MVVM优点：**

- 自动数据绑定
- 视图和逻辑解耦
- 测试友好

**MVVM缺点：**

- 学习曲线较陡
- 调试可能困难
- 过度绑定风险

#### 反例（错误应用）

```typescript
// ❌ 错误：控制器直接操作DOM
class UserController {
  updateName(name: string): void {
    // 控制器不应该直接操作DOM
    document.getElementById('name-input')!.value = name;
    document.getElementById('display-name')!.textContent = name;
  }
}

// ❌ 错误：ViewModel包含视图逻辑
class UserViewModel {
  // ViewModel不应该知道CSS类
  get inputClassName(): string {
    return this.isValid ? 'input valid' : 'input invalid';
  }
}

// ❌ 错误：Model直接更新视图
class UserModel {
  updateUser(data: UserUpdateData): void {
    // Model不应该直接操作视图
    document.getElementById('user-name')!.textContent = data.name!;
  }
}

// ❌ 错误：双向绑定导致循环更新
class ViewModel {
  set name(value: string) {
    this._name = value;
    // 触发视图更新
    this.updateView();
  }

  updateView(): void {
    // 视图更新又触发setter
    this.name = this.getViewValue(); // 循环！
  }
}
```

---


### 2.2 Flux架构

#### 定义和核心概念

Flux是Facebook提出的一种应用架构模式，核心思想是**单向数据流**，解决MVC中数据流混乱的问题。

**核心组件：**

- **Dispatcher**：中央事件分发器，所有数据流通过它
- **Store**：应用状态和业务逻辑，类似Model但可包含多个
- **View**：React组件，监听Store变化
- **Action**：描述发生了什么的普通对象

**数据流：** Action → Dispatcher → Store → View → Action

#### 架构图

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ┌─────────┐                                           │
│   │  Action │────┐                                      │
│   │ {type,  │    │                                      │
│   │  data}  │    │                                      │
│   └─────────┘    │                                      │
│                  ▼                                      │
│   ┌─────────────────────────────────┐                   │
│   │                                 │                   │
│   │         Dispatcher              │                   │
│   │      (Central Hub)              │                   │
│   │                                 │                   │
│   │   ┌─────┐ ┌─────┐ ┌─────┐      │                   │
│   │   │callback│callback│callback│   │                   │
│   │   └──┬──┘ └──┬──┘ └──┬──┘      │                   │
│   │      │       │       │          │                   │
│   └──────┼───────┼───────┼──────────┘                   │
│          │       │       │                             │
│          ▼       ▼       ▼                             │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│   │  Store  │ │  Store  │ │  Store  │                  │
│   │  [User] │ │ [Order] │ │ [Product]│                  │
│   │         │ │         │ │         │                  │
│   │ ┌─────┐ │ │ ┌─────┐ │ │ ┌─────┐ │                  │
│   │ │State│ │ │ │State│ │ │ │State│ │                  │
│   │ └─────┘ │ │ └─────┘ │ │ └─────┘ │                  │
│   └────┬────┘ └────┬────┘ └────┬────┘                  │
│        │           │           │                        │
│        └───────────┼───────────┘                        │
│                    │                                    │
│                    ▼                                    │
│   ┌─────────────────────────────────┐                   │
│   │                                 │                   │
│   │           View (React)          │                   │
│   │                                 │                   │
│   │  ┌──────────┐ ┌──────────┐     │                   │
│   │  │Component │ │Component │     │                   │
│   │  └──────────┘ └──────────┘     │                   │
│   │                                 │                   │
│   └─────────────────────────────────┘                   │
│                    │                                    │
│                    │ 用户交互                            │
│                    ▼                                    │
│   ┌─────────────────────────────────┐                   │
│   │      Action Creators            │                   │
│   │   (createUser, deleteOrder)     │                   │
│   └─────────────────────────────────┘                   │
│                                                         │
│   ═══════════════════════════════════                   │
│        单向数据流 (Unidirectional Flow)                  │
│   ═══════════════════════════════════                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### TypeScript项目结构示例

```
src/
├── actions/                       # Action定义
│   ├── UserActions.ts
│   ├── OrderActions.ts
│   └── index.ts
├── dispatcher/                    # Dispatcher
│   └── AppDispatcher.ts
├── stores/                        # Store
│   ├── UserStore.ts
│   ├── OrderStore.ts
│   └── BaseStore.ts
├── components/                    # 视图组件
│   ├── UserProfile.tsx
│   └── OrderList.tsx
└── constants/                     # 常量
    └── ActionTypes.ts
```

#### 代码实现示例

```typescript
// ============================================
// 常量定义 (constants/ActionTypes.ts)
// ============================================
export const ActionTypes = {
  // User Actions
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_UPDATE: 'USER_UPDATE',

  // Order Actions
  ORDER_CREATE: 'ORDER_CREATE',
  ORDER_UPDATE: 'ORDER_UPDATE',
  ORDER_DELETE: 'ORDER_DELETE',

  // Product Actions
  PRODUCT_LOAD: 'PRODUCT_LOAD',
  PRODUCT_SELECT: 'PRODUCT_SELECT'
} as const;

export type ActionType = typeof ActionTypes[keyof typeof ActionTypes];

// ============================================
// Action 定义 (actions/UserActions.ts)
// ============================================
export interface UserLoginAction {
  type: typeof ActionTypes.USER_LOGIN;
  payload: {
    id: string;
    email: string;
    name: string;
  };
}

export interface UserLogoutAction {
  type: typeof ActionTypes.USER_LOGOUT;
}

export interface UserUpdateAction {
  type: typeof ActionTypes.USER_UPDATE;
  payload: {
    name?: string;
    avatar?: string;
  };
}

export type UserAction = UserLoginAction | UserLogoutAction | UserUpdateAction;

// Action Creators
export const UserActionCreators = {
  login: (user: { id: string; email: string; name: string }): UserLoginAction => ({
    type: ActionTypes.USER_LOGIN,
    payload: user
  }),

  logout: (): UserLogoutAction => ({
    type: ActionTypes.USER_LOGOUT
  }),

  update: (data: { name?: string; avatar?: string }): UserUpdateAction => ({
    type: ActionTypes.USER_UPDATE,
    payload: data
  })
};

// ============================================
// Dispatcher (dispatcher/AppDispatcher.ts)
// ============================================
export interface Action {
  type: string;
  payload?: any;
}

type Callback = (action: Action) => void;

export class Dispatcher {
  private callbacks: Callback[] = [];
  private isDispatching = false;

  register(callback: Callback): number {
    this.callbacks.push(callback);
    return this.callbacks.length - 1;
  }

  unregister(id: number): void {
    this.callbacks.splice(id, 1);
  }

  dispatch(action: Action): void {
    if (this.isDispatching) {
      throw new Error('Cannot dispatch in the middle of a dispatch');
    }

    this.isDispatching = true;
    try {
      this.callbacks.forEach(callback => callback(action));
    } finally {
      this.isDispatching = false;
    }
  }
}

export const AppDispatcher = new Dispatcher();

// ============================================
// Base Store (stores/BaseStore.ts)
// ============================================
import { EventEmitter } from 'events';

export class BaseStore extends EventEmitter {
  protected _dispatchToken: number;

  constructor() {
    super();
    this._dispatchToken = AppDispatcher.register(this.handleAction.bind(this));
  }

  get dispatchToken(): number {
    return this._dispatchToken;
  }

  protected handleAction(action: Action): void {
    // 子类重写
  }

  addChangeListener(callback: () => void): void {
    this.on('change', callback);
  }

  removeChangeListener(callback: () => void): void {
    this.removeListener('change', callback);
  }

  protected emitChange(): void {
    this.emit('change');
  }
}

// ============================================
// User Store (stores/UserStore.ts)
// ============================================
interface UserState {
  id: string | null;
  email: string | null;
  name: string | null;
  avatar: string | null;
  isAuthenticated: boolean;
}

class UserStore extends BaseStore {
  private state: UserState = {
    id: null,
    email: null,
    name: null,
    avatar: null,
    isAuthenticated: false
  };

  protected handleAction(action: Action): void {
    switch (action.type) {
      case ActionTypes.USER_LOGIN:
        this.state = {
          id: action.payload.id,
          email: action.payload.email,
          name: action.payload.name,
          avatar: null,
          isAuthenticated: true
        };
        this.emitChange();
        break;

      case ActionTypes.USER_LOGOUT:
        this.state = {
          id: null,
          email: null,
          name: null,
          avatar: null,
          isAuthenticated: false
        };
        this.emitChange();
        break;

      case ActionTypes.USER_UPDATE:
        this.state = {
          ...this.state,
          name: action.payload.name ?? this.state.name,
          avatar: action.payload.avatar ?? this.state.avatar
        };
        this.emitChange();
        break;
    }
  }

  // Getters
  getState(): UserState {
    return { ...this.state };
  }

  get isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  get userName(): string | null {
    return this.state.name;
  }
}

export const userStore = new UserStore();

// ============================================
// React 组件集成 (components/UserProfile.tsx)
// ============================================
import { useState, useEffect } from 'react';

export const UserProfile: React.FC = () => {
  const [userState, setUserState] = useState(userStore.getState());

  useEffect(() => {
    const handleChange = () => {
      setUserState(userStore.getState());
    };

    userStore.addChangeListener(handleChange);
    return () => {
      userStore.removeChangeListener(handleChange);
    };
  }, []);

  const handleLogin = () => {
    AppDispatcher.dispatch(
      UserActionCreators.login({
        id: '123',
        email: 'user@example.com',
        name: 'John Doe'
      })
    );
  };

  const handleLogout = () => {
    AppDispatcher.dispatch(UserActionCreators.logout());
  };

  const handleUpdateName = (name: string) => {
    AppDispatcher.dispatch(UserActionCreators.update({ name }));
  };

  if (!userState.isAuthenticated) {
    return <button onClick={handleLogin}>Login</button>;
  }

  return (
    <div>
      <h2>Welcome, {userState.name}</h2>
      <input
        value={userState.name || ''}
        onChange={(e) => handleUpdateName(e.target.value)}
      />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};
```

#### 适用场景

| 场景 | 适用性 | 说明 |
|------|--------|------|
| 中等复杂度应用 | ⭐⭐⭐⭐⭐ | 数据流清晰 |
| 多Store协作 | ⭐⭐⭐⭐⭐ | Dispatcher协调 |
| 需要可预测性 | ⭐⭐⭐⭐⭐ | 单向流易于调试 |
| 小型应用 | ⭐⭐⭐ | 可能过于复杂 |
| 大型应用 | ⭐⭐⭐⭐ | Redux可能更合适 |

#### 权衡分析

**优点：**

- 单向数据流，可预测性强
- 清晰的职责分离
- 易于调试和追踪
- 支持时间旅行调试

**缺点：**

- 样板代码较多
- Store之间协调复杂
- 学习曲线较陡
- 现代替代方案更简洁

#### 反例（错误应用）

```typescript
// ❌ 错误：Store直接修改其他Store
class UserStore extends BaseStore {
  handleAction(action: Action): void {
    if (action.type === 'USER_LOGIN') {
      // 直接修改其他Store
      orderStore.setUserId(action.payload.id); // 错误！
    }
  }
}

// ❌ 错误：View直接调用Store方法
const UserProfile = () => {
  // 应该通过Action，而不是直接调用
  userStore.setState({ name: 'New Name' }); // 错误！
};

// ❌ 错误：Action包含函数
const badAction = {
  type: 'DO_SOMETHING',
  payload: {
    callback: () => console.log('done') // Action应该是纯数据！
  }
};

// ❌ 错误：Dispatcher嵌套调用
class Store extends BaseStore {
  handleAction(action: Action): void {
    if (action.type === 'ACTION_A') {
      AppDispatcher.dispatch({ type: 'ACTION_B' }); // 嵌套dispatch错误！
    }
  }
}
```

---

### 2.3 Redux

#### 定义和核心概念

Redux是Flux架构的演进，由Dan Abramov提出，强调**函数式编程**和**不可变数据**。

**三大原则：**

1. **单一数据源（Single Source of Truth）**：整个应用状态存储在一个对象树中
2. **状态只读（State is Read-Only）**：唯一改变状态的方法是触发Action
3. **纯函数修改（Changes are Made with Pure Functions）**：Reducer必须是纯函数

**核心概念：**

- **Store**：存储应用状态
- **Action**：描述发生了什么的对象
- **Reducer**：纯函数，接收旧状态和Action，返回新状态
- **Middleware**：扩展Redux功能的插件

#### 架构图

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ┌─────────────┐                                       │
│   │   Action    │────┐                                  │
│   │  {type,     │    │                                  │
│   │   payload}  │    │                                  │
│   └─────────────┘    │                                  │
│                      ▼                                  │
│   ┌─────────────────────────────────────┐               │
│   │                                     │               │
│   │           Middleware Chain          │               │
│   │                                     │               │
│   │   ┌─────┐   ┌─────┐   ┌─────┐      │               │
│   │   │Thunk│──►│Log  │──►│Error│      │               │
│   │   │     │   │     │   │     │      │               │
│   │   └─────┘   └─────┘   └─────┘      │               │
│   │                                     │               │
│   └─────────────────────────────────────┘               │
│                      │                                  │
│                      ▼                                  │
│   ┌─────────────────────────────────────┐               │
│   │                                     │               │
│   │            Reducers                 │               │
│   │        (Pure Functions)             │               │
│   │                                     │               │
│   │   ┌─────────┐   ┌─────────┐        │               │
│   │   │  User   │   │  Order  │        │               │
│   │   │ Reducer │   │ Reducer │        │               │
│   │   └────┬────┘   └────┬────┘        │               │
│   │        │             │              │               │
│   │        └──────┬──────┘              │               │
│   │               │                     │               │
│   │               ▼                     │               │
│   │        ┌───────────┐                │               │
│   │        │RootReducer│                │               │
│   │        │  (combine)│                │               │
│   │        └─────┬─────┘                │               │
│   │              │                      │               │
│   └──────────────┼──────────────────────┘               │
│                  │                                      │
│                  ▼                                      │
│   ┌─────────────────────────────────────┐               │
│   │                                     │               │
│   │              Store                  │               │
│   │                                     │               │
│   │   ┌─────────────────────────┐      │               │
│   │   │      State Tree         │      │               │
│   │   │  {                      │      │               │
│   │   │    user: {...},         │      │               │
│   │   │    order: {...},        │      │               │
│   │   │    products: [...]      │      │               │
│   │   │  }                      │      │               │
│   │   └─────────────────────────┘      │               │
│   │                                     │               │
│   └─────────────────────────────────────┘               │
│                  │                                      │
│                  │ subscribe                           │
│                  ▼                                      │
│   ┌─────────────────────────────────────┐               │
│   │                                     │               │
│   │         View (React/Redux)          │               │
│   │                                     │               │
│   │   ┌──────────┐   ┌──────────┐      │               │
│   │   │ connect()│   │useSelector│      │               │
│   │   │          │   │          │      │               │
│   │   └──────────┘   └──────────┘      │               │
│   │                                     │               │
│   └─────────────────────────────────────┘               │
│                                                         │
│   ═══════════════════════════════════════               │
│         Redux 数据流 (Redux Data Flow)                   │
│   ═══════════════════════════════════════               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### TypeScript项目结构示例

```
src/
├── store/                         # Store配置
│   ├── index.ts                   # Store创建
│   ├── rootReducer.ts             # 根Reducer
│   └── middleware.ts              # 中间件配置
├── features/                      # 特性模块（Redux Ducks模式）
│   ├── users/                     # 用户特性
│   │   ├── usersSlice.ts          # Slice（RTK）
│   │   ├── usersSelectors.ts      # 选择器
│   │   ├── usersThunks.ts         # Thunks
│   │   └── usersTypes.ts          # 类型定义
│   ├── orders/                    # 订单特性
│   │   ├── ordersSlice.ts
│   │   ├── ordersSelectors.ts
│   │   └── ordersThunks.ts
│   └── products/                  # 产品特性
│       ├── productsSlice.ts
│       └── productsSelectors.ts
├── hooks/                         # 自定义Hooks
│   ├── useAppDispatch.ts
│   └── useAppSelector.ts
└── types/                         # 全局类型
    └── store.ts
```

#### 代码实现示例

```typescript
// ============================================
// Redux Toolkit (RTK) 现代写法
// ============================================

// types/store.ts
export interface RootState {
  users: UsersState;
  orders: OrdersState;
  products: ProductsState;
}

// ============================================
// Slice 定义 (features/users/usersSlice.ts)
// ============================================
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// 类型定义
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface UsersState {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  currentUser: null,
  users: [],
  loading: false,
  error: null
};

// Async Thunks
export const fetchUser = createAsyncThunk(
  'users/fetchUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return await response.json() as User;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, data }: { userId: string; data: Partial<User> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update user');
      return await response.json() as User;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // 同步 reducers
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.currentUser = null;
    }
  },
  extraReducers: (builder) => {
    // fetchUser
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // updateUser
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setCurrentUser, clearError, logout } = usersSlice.actions;
export default usersSlice.reducer;

// ============================================
// 选择器 (features/users/usersSelectors.ts)
// ============================================
import { createSelector } from '@reduxjs/toolkit';

const selectUsersState = (state: RootState) => state.users;

export const selectCurrentUser = createSelector(
  [selectUsersState],
  (usersState) => usersState.currentUser
);

export const selectIsAuthenticated = createSelector(
  [selectCurrentUser],
  (currentUser) => !!currentUser
);

export const selectUserName = createSelector(
  [selectCurrentUser],
  (currentUser) => currentUser?.name || 'Guest'
);

export const selectUsersLoading = createSelector(
  [selectUsersState],
  (usersState) => usersState.loading
);

export const selectUsersError = createSelector(
  [selectUsersState],
  (usersState) => usersState.error
);

// ============================================
// Store 配置 (store/index.ts)
// ============================================
import { configureStore } from '@reduxjs/toolkit';
import usersReducer from '../features/users/usersSlice';
import ordersReducer from '../features/orders/ordersSlice';
import productsReducer from '../features/products/productsSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    orders: ordersReducer,
    products: productsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

export type AppDispatch = typeof store.dispatch;

// ============================================
// 自定义 Hooks (hooks/useAppDispatch.ts)
// ============================================
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ============================================
// React 组件使用 (components/UserProfile.tsx)
// ============================================
export const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const userName = useAppSelector(selectUserName);
  const loading = useAppSelector(selectUsersLoading);
  const error = useAppSelector(selectUsersError);

  const handleUpdateName = async (newName: string) => {
    if (user) {
      await dispatch(updateUser({ userId: user.id, data: { name: newName } }));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div className="user-profile">
      <h2>Welcome, {userName}</h2>
      <img src={user.avatar} alt={user.name} />
      <input
        value={user.name}
        onChange={(e) => handleUpdateName(e.target.value)}
      />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

// ============================================
// 传统 Redux 写法（对比）
// ============================================

// Action Types
const INCREMENT = 'counter/INCREMENT';
const DECREMENT = 'counter/DECREMENT';
const SET_VALUE = 'counter/SET_VALUE';

// Action Creators
const increment = () => ({ type: INCREMENT as typeof INCREMENT });
const decrement = () => ({ type: DECREMENT as typeof DECREMENT });
const setValue = (value: number) => ({
  type: SET_VALUE as typeof SET_VALUE,
  payload: value
});

// Reducer
interface CounterState {
  value: number;
}

const initialCounterState: CounterState = { value: 0 };

function counterReducer(
  state = initialCounterState,
  action: ReturnType<typeof increment> | ReturnType<typeof decrement> | ReturnType<typeof setValue>
): CounterState {
  switch (action.type) {
    case INCREMENT:
      return { value: state.value + 1 };
    case DECREMENT:
      return { value: state.value - 1 };
    case SET_VALUE:
      return { value: action.payload };
    default:
      return state;
  }
}
```

#### 适用场景

| 场景 | 适用性 | 说明 |
|------|--------|------|
| 大型应用 | ⭐⭐⭐⭐⭐ | 状态管理清晰 |
| 复杂状态逻辑 | ⭐⭐⭐⭐⭐ | Reducer纯函数 |
| 需要时间旅行调试 | ⭐⭐⭐⭐⭐ | DevTools支持 |
| 团队协作 | ⭐⭐⭐⭐⭐ | 规范性强 |
| 小型应用 | ⭐⭐⭐ | 可能过重 |
| 高频更新 | ⭐⭐⭐ | 考虑Signals |

#### 权衡分析

**优点：**

- 可预测的状态管理
- 强大的DevTools
- 中间件生态系统丰富
- 时间旅行调试
- 热重载支持

**缺点：**

- 样板代码较多（传统Redux）
- 学习曲线陡峭
- 小型应用可能过重
- 高频更新性能问题

#### 反例（错误应用）

```typescript
// ❌ 错误：Reducer中的副作用
function userReducer(state = initialState, action: Action) {
  switch (action.type) {
    case 'FETCH_USER':
      // Reducer必须是纯函数！
      fetch('/api/user').then(res => res.json()); // 错误！
      return state;
    default:
      return state;
  }
}

// ❌ 错误：直接修改状态
function badReducer(state = initialState, action: Action) {
  switch (action.type) {
    case 'UPDATE_NAME':
      state.name = action.payload; // 直接修改！错误！
      return state;
    default:
      return state;
  }
}

// ❌ 错误：在组件中直接修改store
const Component = () => {
  const user = useSelector(state => state.user);

  const handleClick = () => {
    user.name = 'New Name'; // 直接修改！错误！
  };
};

// ❌ 错误：Action结构不一致
const action1 = { type: 'LOGIN', user: { id: 1 } };
const action2 = { type: 'LOGIN', payload: { userId: 1 } }; // 结构不一致！
const action3 = { type: 'LOGIN', data: { id: 1 } }; // 结构不一致！
```

---

### 2.4 Zustand / Jotai

#### 定义和核心概念

**Zustand**：极简的状态管理库，基于Hooks，无需Provider包裹。

**Jotai**：原子化状态管理，状态由原子（Atoms）组成，支持派生状态。

**核心思想：**

- 减少样板代码
- 简化API
- 更好的TypeScript支持
- 细粒度订阅

#### 架构图

```
Zustand 架构：
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ┌─────────────────────────────────────┐               │
│   │                                     │               │
│   │           Store (Zustand)           │               │
│   │                                     │               │
│   │   ┌─────────────────────────────┐   │               │
│   │   │        State                │   │               │
│   │   │  {                          │   │               │
│   │   │    user: {...},             │   │               │
│   │   │    count: 0,                │   │               │
│   │   │    increment: () => {...}   │   │               │
│   │   │  }                          │   │               │
│   │   └─────────────────────────────┘   │               │
│   │                                     │               │
│   └─────────────────┬─────────────────┘               │
│                     │                                   │
│                     │ useStore()                        │
│                     │                                   │
│        ┌────────────┼────────────┐                     │
│        │            │            │                     │
│        ▼            ▼            ▼                     │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐               │
│   │Component│  │Component│  │Component│               │
│   │    A    │  │    B    │  │    C    │               │
│   └─────────┘  └─────────┘  └─────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘

Jotai 架构：
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐                │
│   │  Atom   │  │  Atom   │  │  Atom   │                │
│   │  count  │  │  user   │  │  theme  │                │
│   └────┬────┘  └────┬────┘  └────┬────┘                │
│        │            │            │                      │
│        │            │            │                      │
│        ▼            ▼            ▼                      │
│   ┌─────────────────────────────────┐                   │
│   │         Derived Atoms           │                   │
│   │  (computed values from atoms)   │                   │
│   │                                 │                   │
│   │  userDisplayName = f(user)     │                   │
│   │  isDark = theme === 'dark'     │                   │
│   └─────────────────────────────────┘                   │
│                    │                                    │
│                    │ useAtom()                          │
│                    ▼                                    │
│   ┌─────────────────────────────────────┐               │
│   │                                     │               │
│   │         Components                  │               │
│   │                                     │               │
│   │   ┌──────────┐   ┌──────────┐      │               │
│   │   │ useAtom  │   │ useAtom  │      │               │
│   │   │ (count)  │   │ (user)   │      │               │
│   │   └──────────┘   └──────────┘      │               │
│   │                                     │               │
│   └─────────────────────────────────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### TypeScript项目结构示例

```
src/
├── stores/                        # Zustand stores
│   ├── userStore.ts
│   ├── cartStore.ts
│   └── themeStore.ts
├── atoms/                         # Jotai atoms
│   ├── userAtoms.ts
│   ├── cartAtoms.ts
│   └── derivedAtoms.ts
├── hooks/                         # 自定义hooks
│   └── useStore.ts
└── components/
    └── ...
```

#### 代码实现示例

```typescript
// ============================================
// Zustand 实现
// ============================================

// stores/userStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface UserState {
  // State
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;

  // Computed
  isAuthenticated: boolean;
  displayName: string;

  // Actions
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        currentUser: null,
        isLoading: false,
        error: null,

        // Computed (使用getter)
        get isAuthenticated() {
          return !!get().currentUser;
        },
        get displayName() {
          return get().currentUser?.name || 'Guest';
        },

        // Actions
        setUser: (user) => {
          set((state) => {
            state.currentUser = user;
          });
        },

        updateUser: (data) => {
          set((state) => {
            if (state.currentUser) {
              Object.assign(state.currentUser, data);
            }
          });
        },

        login: async (email, password) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
              throw new Error('Login failed');
            }

            const user = await response.json();
            set((state) => {
              state.currentUser = user;
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.error = (error as Error).message;
              state.isLoading = false;
            });
          }
        },

        logout: () => {
          set((state) => {
            state.currentUser = null;
          });
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        }
      })),
      {
        name: 'user-storage', // localStorage key
        partialize: (state) => ({ currentUser: state.currentUser }) // 只持久化currentUser
      }
    ),
    { name: 'UserStore' }
  )
);

// 多个Store组合
// stores/cartStore.ts
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

export const useCartStore = create<CartState>()(
  immer((set, get) => ({
    items: [],

    addItem: (item) => {
      set((state) => {
        const existing = state.items.find(i => i.productId === item.productId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          state.items.push(item);
        }
      });
    },

    removeItem: (productId) => {
      set((state) => {
        state.items = state.items.filter(i => i.productId !== productId);
      });
    },

    updateQuantity: (productId, quantity) => {
      set((state) => {
        const item = state.items.find(i => i.productId === productId);
        if (item) {
          item.quantity = quantity;
        }
      });
    },

    clearCart: () => {
      set((state) => {
        state.items = [];
      });
    },

    get totalItems() {
      return get().items.reduce((sum, item) => sum + item.quantity, 0);
    },

    get totalPrice() {
      return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
  }))
);

// React 组件使用
import { useUserStore } from '../stores/userStore';
import { useCartStore } from '../stores/cartStore';

export const UserProfile: React.FC = () => {
  // 选择性地订阅状态（性能优化）
  const currentUser = useUserStore(state => state.currentUser);
  const displayName = useUserStore(state => state.displayName);
  const logout = useUserStore(state => state.logout);
  const updateUser = useUserStore(state => state.updateUser);

  // 或者使用shallow进行浅比较
  const { isLoading, error } = useUserStore(
    state => ({ isLoading: state.isLoading, error: state.error }),
    shallow
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!currentUser) return <div>Not logged in</div>;

  return (
    <div>
      <h2>Welcome, {displayName}</h2>
      <input
        value={currentUser.name}
        onChange={(e) => updateUser({ name: e.target.value })}
      />
      <button onClick={logout}>Logout</button>
    </div>
  );
};

// ============================================
// Jotai 实现
// ============================================

// atoms/userAtoms.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// 基础Atoms
export const userAtom = atomWithStorage<User | null>('user', null);
export const isLoadingAtom = atom(false);
export const errorAtom = atom<string | null>(null);

// 派生Atoms (只读)
export const isAuthenticatedAtom = atom((get) => !!get(userAtom));
export const displayNameAtom = atom((get) => get(userAtom)?.name || 'Guest');

// 可写派生Atom
export const userPreferencesAtom = atom(
  (get) => get(userAtom)?.preferences,
  (get, set, update: Partial<UserPreferences>) => {
    const currentUser = get(userAtom);
    if (currentUser) {
      set(userAtom, {
        ...currentUser,
        preferences: { ...currentUser.preferences, ...update }
      });
    }
  }
);

// Async Atom
export const fetchUserAtom = atom(
  (get) => get(userAtom),
  async (get, set, userId: string) => {
    set(isLoadingAtom, true);
    set(errorAtom, null);

    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const user = await response.json();
      set(userAtom, user);
    } catch (err) {
      set(errorAtom, (err as Error).message);
    } finally {
      set(isLoadingAtom, false);
    }
  }
);

// atoms/cartAtoms.ts
export interface CartItem {
  productId: string;
  quantity: number;
}

export const cartItemsAtom = atom<CartItem[]>([]);

// 派生：购物车商品总数
export const cartTotalItemsAtom = atom((get) =>
  get(cartItemsAtom).reduce((sum, item) => sum + item.quantity, 0)
);

// 派生：购物车总价（需要产品价格信息）
export const cartTotalPriceAtom = atom(async (get) => {
  const items = get(cartItemsAtom);
  const prices = await Promise.all(
    items.map(async (item) => {
      const response = await fetch(`/api/products/${item.productId}/price`);
      const { price } = await response.json();
      return price * item.quantity;
    })
  );
  return prices.reduce((sum, price) => sum + price, 0);
});

// 可写派生：添加商品到购物车
export const addToCartAtom = atom(
  null,
  (get, set, item: CartItem) => {
    const currentItems = get(cartItemsAtom);
    const existingIndex = currentItems.findIndex(i => i.productId === item.productId);

    if (existingIndex >= 0) {
      const newItems = [...currentItems];
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + item.quantity
      };
      set(cartItemsAtom, newItems);
    } else {
      set(cartItemsAtom, [...currentItems, item]);
    }
  }
);

// React 组件使用
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { userAtom, displayNameAtom, fetchUserAtom } from '../atoms/userAtoms';
import { cartItemsAtom, cartTotalItemsAtom, addToCartAtom } from '../atoms/cartAtoms';

export const UserProfile: React.FC = () => {
  const [user, setUser] = useAtom(userAtom);
  const displayName = useAtomValue(displayNameAtom);
  const [, fetchUser] = useAtom(fetchUserAtom);

  return (
    <div>
      <h2>Welcome, {displayName}</h2>
      {user && (
        <input
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />
      )}
      <button onClick={() => fetchUser('123')}>Load User</button>
    </div>
  );
};

export const Cart: React.FC = () => {
  const cartItems = useAtomValue(cartItemsAtom);
  const totalItems = useAtomValue(cartTotalItemsAtom);
  const addToCart = useSetAtom(addToCartAtom);

  return (
    <div>
      <h2>Cart ({totalItems} items)</h2>
      {cartItems.map(item => (
        <div key={item.productId}>
          Product: {item.productId}, Qty: {item.quantity}
        </div>
      ))}
      <button onClick={() => addToCart({ productId: '123', quantity: 1 })}>
        Add Item
      </button>
    </div>
  );
};
```

#### 适用场景

| 场景 | Zustand | Jotai | 说明 |
|------|---------|-------|------|
| 小型应用 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 都极简 |
| 中型应用 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 都很合适 |
| 需要派生状态 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Jotai原子化更优 |
| 需要持久化 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 都有中间件 |
| 团队熟悉Redux | ⭐⭐⭐⭐ | ⭐⭐⭐ | Zustand更接近 |

#### 权衡分析

**Zustand优点：**

- 极简API，学习成本低
- 无需Provider
- 优秀的TypeScript支持
- 中间件丰富

**Jotai优点：**

- 原子化设计，细粒度订阅
- 派生状态自然
- 支持Suspense
- 更好的组合性

**共同缺点：**

- 生态系统不如Redux丰富
- 大型应用可能需要更多规范
- 调试工具不如Redux强大

#### 反例（错误应用）

```typescript
// ❌ 错误：Zustand中直接修改状态
const useStore = create((set) => ({
  user: null,
  updateUser: (data) => {
    // 不使用immer时不能直接修改
    set((state) => {
      state.user.name = data.name; // 错误！直接修改
      return state;
    });
  }
}));

// ❌ 错误：在组件外订阅store
const user = useUserStore.getState().user; // 不会触发重新渲染

// ❌ 错误：Jotai中原子定义在组件内
const Component = () => {
  const countAtom = atom(0); // 错误！每次渲染创建新atom
  const [count, setCount] = useAtom(countAtom);
};

// ❌ 错误：派生atom中的副作用
export const badAtom = atom((get) => {
  console.log('side effect'); // 派生atom应该是纯的
  return get(countAtom) * 2;
});
```

---

### 2.5 Signals

#### 定义和核心概念

Signals是一种细粒度响应式原语，代表随时间变化的值，当值改变时自动通知订阅者。

**核心概念：**

- **Signal**：可观察的值容器
- **Computed**：派生Signal，自动追踪依赖
- **Effect**：副作用，自动响应Signal变化
- **细粒度更新**：只更新真正变化的部分

**代表库：** Solid.js Signals、Preact Signals、Vue Reactivity、Angular Signals

#### 架构图

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ┌─────────────┐                                       │
│   │   Signal    │                                       │
│   │  count = 0  │                                       │
│   └──────┬──────┘                                       │
│          │                                              │
│          │ 订阅                                          │
│          ▼                                              │
│   ┌─────────────────────────────────────┐               │
│   │         Computed Signal             │               │
│   │                                     │               │
│   │   doubled = count * 2               │               │
│   │                                     │               │
│   │   (自动追踪count依赖)               │               │
│   └─────────────────────────────────────┘               │
│          │                                              │
│          │ 订阅                                          │
│          ▼                                              │
│   ┌─────────────────────────────────────┐               │
│   │            Effect                   │               │
│   │                                     │               │
│   │   effect(() => {                    │               │
│   │     console.log(doubled.value)      │               │
│   │   })                                │               │
│   │                                     │               │
│   │   (自动追踪doubled依赖)             │               │
│   └─────────────────────────────────────┘               │
│                                                         │
│   当 count.value = 1 时：                               │
│   1. count 通知 doubled                                 │
│   2. doubled 重新计算 (2)                               │
│   3. doubled 通知 Effect                                │
│   4. Effect 执行 (console.log(2))                       │
│                                                         │
│   ═══════════════════════════════════════               │
│        细粒度响应式 (Fine-grained Reactivity)            │
│   ═══════════════════════════════════════               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### TypeScript项目结构示例

```
src/
├── signals/                       # Signal定义
│   ├── userSignals.ts
│   ├── cartSignals.ts
│   └── computedSignals.ts
├── components/                    # 组件
│   ├── Counter.tsx
│   └── UserProfile.tsx
└── hooks/                         # 自定义hooks
    └── useSignal.ts
```

#### 代码实现示例

```typescript
// ============================================
// Preact Signals (React兼容)
// ============================================

// npm install @preact/signals-react
import { signal, computed, effect, batch } from '@preact/signals-react';

// 基础Signal
const count = signal(0);
const name = signal('John');

// Computed Signal（派生）
const doubled = computed(() => count.value * 2);
const greeting = computed(() => `Hello, ${name.value}!`);

// 复杂Computed
interface User {
  id: string;
  name: string;
  age: number;
}

const users = signal<User[]>([
  { id: '1', name: 'Alice', age: 25 },
  { id: '2', name: 'Bob', age: 30 }
]);

const adultUsers = computed(() =>
  users.value.filter(user => user.age >= 18)
);

const averageAge = computed(() => {
  const adults = adultUsers.value;
  if (adults.length === 0) return 0;
  return adults.reduce((sum, u) => sum + u.age, 0) / adults.length;
});

// Effect（副作用）
effect(() => {
  console.log(`Count is now: ${count.value}`);
});

effect(() => {
  document.title = greeting.value;
});

// 批量更新
function updateMultiple() {
  batch(() => {
    count.value++;
    name.value = 'Jane';
    // 两个更新只触发一次重新渲染
  });
}

// React组件使用
import { useSignals } from '@preact/signals-react/runtime';

export const Counter: React.FC = () => {
  // 在React组件中使用Signals
  useSignals(); // 启用Signals支持

  return (
    <div>
      <p>Count: {count.value}</p>
      <p>Doubled: {doubled.value}</p>
      <button onClick={() => count.value++}>
        Increment
      </button>
    </div>
  );
};

export const UserList: React.FC = () => {
  useSignals();

  const addUser = () => {
    users.value = [
      ...users.value,
      { id: Date.now().toString(), name: 'New User', age: 20 }
    ];
  };

  return (
    <div>
      <h2>Adult Users (Avg Age: {averageAge.value})</h2>
      {adultUsers.value.map(user => (
        <div key={user.id}>
          {user.name} - {user.age}
        </div>
      ))}
      <button onClick={addUser}>Add User</button>
    </div>
  );
};

// ============================================
// Solid.js Signals (原生响应式)
// ============================================
import { createSignal, createMemo, createEffect, batch } from 'solid-js';

// 创建Signal
const [count, setCount] = createSignal(0);
const [user, setUser] = createSignal({ name: 'John', age: 25 });

// Memo（Computed）
const doubled = createMemo(() => count() * 2);
const isAdult = createMemo(() => user().age >= 18);

// Effect
createEffect(() => {
  console.log(`Count: ${count()}`);
});

// 批量更新
const updateUser = () => {
  batch(() => {
    setUser(prev => ({ ...prev, age: prev.age + 1 }));
    setCount(c => c + 1);
  });
};

// Solid组件
function Counter() {
  return (
    <div>
      <p>Count: {count()}</p>
      <p>Doubled: {doubled()}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  );
}

// ============================================
// Angular Signals
// ============================================
import { signal, computed, effect } from '@angular/core';

// 创建Signal
const count = signal(0);
const user = signal({ name: 'John', age: 25 });

// Computed
const doubled = computed(() => count() * 2);

// Effect
const cleanup = effect(() => {
  console.log(`Count: ${count()}`);
});

// 更新
function increment() {
  count.update(value => value + 1);
}

function updateName(newName: string) {
  user.update(u => ({ ...u, name: newName }));
}

// 在组件中使用
@Component({
  selector: 'app-counter',
  template: `
    <p>Count: {{ count() }}</p>
    <p>Doubled: {{ doubled() }}</p>
    <button (click)="increment()">Increment</button>
  `
})
export class CounterComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);

  increment() {
    this.count.update(v => v + 1);
  }
}

// ============================================
// Vue 3 Reactivity (组合式API)
// ============================================
import { ref, computed, watch, watchEffect } from 'vue';

// Ref（Signal）
const count = ref(0);
const user = ref({ name: 'John', age: 25 });

// Computed
const doubled = computed(() => count.value * 2);
const fullName = computed({
  get: () => user.value.name,
  set: (value) => { user.value.name = value; }
});

// Watch（Effect）
watch(count, (newVal, oldVal) => {
  console.log(`Count changed: ${oldVal} -> ${newVal}`);
});

watchEffect(() => {
  console.log(`User name: ${user.value.name}`);
});

// 更新
count.value++;
user.value.age++;
```

#### 适用场景

| 场景 | 适用性 | 说明 |
|------|--------|------|
| 高频更新 | ⭐⭐⭐⭐⭐ | 细粒度更新性能最优 |
| 复杂派生状态 | ⭐⭐⭐⭐⭐ | Computed自动追踪 |
| 性能敏感 | ⭐⭐⭐⭐⭐ | 避免不必要渲染 |
| 简单应用 | ⭐⭐⭐⭐ | 可能过于强大 |
| 团队学习成本 | ⭐⭐⭐ | 新概念需要时间 |

#### 权衡分析

**优点：**

- 细粒度响应，性能最优
- 自动依赖追踪
- 简洁的API
- 避免不必要的重新渲染

**缺点：**

- 新概念学习成本
- 调试可能困难
- 生态系统相对较新
- 心智模型转变

#### 反例（错误应用）

```typescript
// ❌ 错误：在Computed中修改Signal
const badComputed = computed(() => {
  count.value = 10; // Computed应该是纯的！
  return count.value * 2;
});

// ❌ 错误：Effect中不追踪依赖
effect(() => {
  // 没有访问任何Signal，永远不会重新执行
  console.log('This runs only once');
});

// ❌ 错误：Signal值直接比较
if (count === 5) { // 错误！count是Signal对象
  // ...
}
// 正确：if (count.value === 5)

// ❌ 错误：在React中不启用Signals
export const Component = () => {
  // 忘记调用 useSignals()
  return <div>{count.value}</div>; // 不会更新！
};

// ❌ 错误：无限循环
effect(() => {
  count.value++; // Effect中修改依赖会导致无限循环
});
```

---

### 2.6 状态机 (XState / 有限状态机)

#### 定义和核心概念

有限状态机（FSM）是一种数学计算模型，系统在任何时刻只能处于有限个状态之一。

**核心概念：**

- **State（状态）**：系统在特定时间点的状况
- **Event（事件）**：触发状态转换的信号
- **Transition（转换）**：从一个状态到另一个状态的变化
- **Action（动作）**：状态转换时执行的副作用
- **Context（上下文）**：扩展状态的额外数据

**扩展：状态图（Statecharts）**

- 嵌套状态（Hierarchical）
- 并行状态（Parallel）
- 历史状态（History）

#### 架构图

```
简单状态机：
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                         ┌─────────┐                     │
│                    ┌────│  idle   │────┐                │
│                    │    │ [初始]  │    │                │
│                    │    └─────────┘    │                │
│                    │         │         │                │
│              FETCH │         │ SUBMIT  │                │
│                    ▼         ▼         ▼                │
│              ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│              │ loading │  │submitting│  │  error  │     │
│              │         │  │         │  │         │     │
│              └────┬────┘  └────┬────┘  └────┬────┘     │
│                   │            │            │           │
│              SUCCESS      SUCCESS       RETRY          │
│                   │            │            │           │
│                   ▼            ▼            ▼           │
│              ┌─────────────────────────────┐           │
│              │         success             │           │
│              │         [最终]              │           │
│              └─────────────────────────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘

嵌套状态机：
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              ┌─────────────────────┐                    │
│              │      播放器         │                    │
│              │    [父状态]         │                    │
│              │                     │                    │
│              │  ┌───────────────┐  │                    │
│              │  │    stopped    │  │                    │
│              │  │   [子状态]    │  │                    │
│              │  └───────┬───────┘  │                    │
│              │          │ PLAY      │                    │
│              │          ▼           │                    │
│              │  ┌───────────────┐  │                    │
│              │  │    playing    │  │                    │
│              │  │  ┌─────────┐  │  │                    │
│              │  │  │  normal │  │  │                    │
│              │  │  │[嵌套子] │  │  │                    │
│              │  │  └────┬────┘  │  │                    │
│              │  │       │PAUSE  │  │                    │
│              │  │       ▼       │  │                    │
│              │  │  ┌─────────┐  │  │                    │
│              │  │  │ paused  │  │  │                    │
│              │  │  │[嵌套子] │  │  │                    │
│              │  │  └─────────┘  │  │                    │
│              │  └───────────────┘  │                    │
│              └─────────────────────┘                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### TypeScript项目结构示例

```
src/
├── machines/                      # 状态机定义
│   ├── authMachine.ts
│   ├── formMachine.ts
│   ├── checkoutMachine.ts
│   └── gameMachine.ts
├── components/                    # 组件
│   ├── AuthComponent.tsx
│   └── FormComponent.tsx
└── hooks/                         # 自定义hooks
    └── useMachine.ts
```

#### 代码实现示例

```typescript
// ============================================
// XState 实现
// ============================================

// npm install xstate @xstate/react
import { createMachine, assign, interpret } from 'xstate';
import { useMachine } from '@xstate/react';

// 简单状态机：登录流程
interface AuthContext {
  user: { id: string; email: string } | null;
  error: string | null;
}

type AuthEvent =
  | { type: 'LOGIN'; email: string; password: string }
  | { type: 'LOGOUT' }
  | { type: 'RETRY' }
  | { type: 'LOGIN_SUCCESS'; user: { id: string; email: string } }
  | { type: 'LOGIN_FAILURE'; error: string };

const authMachine = createMachine(
  {
    id: 'auth',
    initial: 'idle',
    context: {
      user: null,
      error: null
    } as AuthContext,
    states: {
      idle: {
        on: {
          LOGIN: 'authenticating'
        }
      },
      authenticating: {
        entry: 'clearError',
        invoke: {
          src: 'authenticateUser',
          onDone: {
            target: 'authenticated',
            actions: 'setUser'
          },
          onError: {
            target: 'error',
            actions: 'setError'
          }
        }
      },
      authenticated: {
        entry: 'onAuthenticated',
        on: {
          LOGOUT: 'idle'
        }
      },
      error: {
        on: {
          RETRY: 'authenticating',
          LOGIN: 'authenticating'
        }
      }
    }
  },
  {
    actions: {
      clearError: assign({ error: null }),
      setUser: assign({
        user: (_, event) => event.data,
        error: null
      }),
      setError: assign({
        error: (_, event) => event.data.message,
        user: null
      }),
      onAuthenticated: (context) => {
        console.log('User authenticated:', context.user);
      }
    },
    services: {
      authenticateUser: async (_, event) => {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: event.email,
            password: event.password
          })
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        return response.json();
      }
    }
  }
);

// React组件使用
export const AuthComponent: React.FC = () => {
  const [state, send] = useMachine(authMachine);

  const handleLogin = (email: string, password: string) => {
    send({ type: 'LOGIN', email, password });
  };

  const handleLogout = () => {
    send({ type: 'LOGOUT' });
  };

  const handleRetry = () => {
    send({ type: 'RETRY' });
  };

  // 状态匹配
  if (state.matches('idle')) {
    return <LoginForm onSubmit={handleLogin} />;
  }

  if (state.matches('authenticating')) {
    return <div>Authenticating...</div>;
  }

  if (state.matches('authenticated')) {
    return (
      <div>
        <p>Welcome, {state.context.user?.email}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  if (state.matches('error')) {
    return (
      <div>
        <p>Error: {state.context.error}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  return null;
};

// ============================================
// 复杂状态机：表单验证
// ============================================

interface FormContext {
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

type FormEvent =
  | { type: 'CHANGE'; field: string; value: string }
  | { type: 'BLUR'; field: string }
  | { type: 'SUBMIT' }
  | { type: 'VALIDATE' }
  | { type: 'VALIDATION_SUCCESS' }
  | { type: 'VALIDATION_FAILURE'; errors: Record<string, string> }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_FAILURE'; error: string };

const formMachine = createMachine(
  {
    id: 'form',
    initial: 'editing',
    context: {
      values: {},
      errors: {},
      touched: {}
    } as FormContext,
    states: {
      editing: {
        on: {
          CHANGE: {
            actions: 'updateValue'
          },
          BLUR: {
            actions: 'markTouched'
          },
          SUBMIT: 'validating'
        }
      },
      validating: {
        invoke: {
          src: 'validateForm',
          onDone: {
            target: 'submitting',
            actions: 'clearErrors'
          },
          onError: {
            target: 'editing',
            actions: 'setErrors'
          }
        }
      },
      submitting: {
        invoke: {
          src: 'submitForm',
          onDone: 'success',
          onError: {
            target: 'editing',
            actions: 'setSubmitError'
          }
        }
      },
      success: {
        type: 'final'
      }
    }
  },
  {
    actions: {
      updateValue: assign({
        values: (context, event) => ({
          ...context.values,
          [event.field]: event.value
        })
      }),
      markTouched: assign({
        touched: (context, event) => ({
          ...context.touched,
          [event.field]: true
        })
      }),
      setErrors: assign({
        errors: (_, event) => event.data
      }),
      clearErrors: assign({ errors: {} }),
      setSubmitError: assign({
        errors: (context, event) => ({
          ...context.errors,
          submit: event.data.message
        })
      })
    },
    services: {
      validateForm: async (context) => {
        const errors: Record<string, string> = {};

        if (!context.values.email?.includes('@')) {
          errors.email = 'Invalid email';
        }
        if ((context.values.password?.length || 0) < 8) {
          errors.password = 'Password too short';
        }

        if (Object.keys(errors).length > 0) {
          throw errors;
        }
      },
      submitForm: async (context) => {
        const response = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(context.values)
        });

        if (!response.ok) {
          throw new Error('Submission failed');
        }
      }
    }
  }
);

// ============================================
// 并行状态机：播放器
// ============================================

const playerMachine = createMachine({
  id: 'player',
  initial: 'idle',
  states: {
    idle: {
      on: { PLAY: 'playing' }
    },
    playing: {
      type: 'parallel',
      states: {
        playback: {
          initial: 'normal',
          states: {
            normal: {
              on: { PAUSE: 'paused' }
            },
            paused: {
              on: { PLAY: 'normal' }
            }
          }
        },
        volume: {
          initial: 'unmuted',
          states: {
            unmuted: {
              on: { MUTE: 'muted' }
            },
            muted: {
              on: { UNMUTE: 'unmuted' }
            }
          }
        }
      },
      on: { STOP: 'idle' }
    }
  }
});

// 使用并行状态
const [state, send] = useMachine(playerMachine);

// 检查并行状态
const isPlaying = state.matches('playing');
const isPaused = state.matches({ playing: { playback: 'paused' } });
const isMuted = state.matches({ playing: { volume: 'muted' } });

// ============================================
// 轻量级状态机（不使用XState）
// ============================================

type State<S, E> = {
  value: S;
  context?: any;
  on?: Record<E, S | { target: S; action?: () => void }>;
};

function createSimpleMachine<S extends string, E extends string>(
  config: {
    initial: S;
    states: Record<S, State<S, E>>;
  }
) {
  let currentState = config.initial;
  const context = {};

  return {
    get state() {
      return currentState;
    },
    get context() {
      return context;
    },
    send(event: E) {
      const stateConfig = config.states[currentState];
      const transition = stateConfig.on?.[event];

      if (transition) {
        if (typeof transition === 'string') {
          currentState = transition;
        } else {
          currentState = transition.target;
          transition.action?.();
        }
      }
    },
    matches(state: S) {
      return currentState === state;
    }
  };
}

// 使用轻量级状态机
const toggleMachine = createSimpleMachine({
  initial: 'inactive',
  states: {
    inactive: {
      value: 'inactive',
      on: {
        TOGGLE: 'active'
      }
    },
    active: {
      value: 'active',
      on: {
        TOGGLE: 'inactive'
      }
    }
  }
});

console.log(toggleMachine.state); // 'inactive'
toggleMachine.send('TOGGLE');
console.log(toggleMachine.state); // 'active'
```

#### 适用场景

| 场景 | 适用性 | 说明 |
|------|--------|------|
| 复杂流程 | ⭐⭐⭐⭐⭐ | 状态转换清晰 |
| 异步流程 | ⭐⭐⭐⭐⭐ | 处理loading/error状态 |
| 需要可视化 | ⭐⭐⭐⭐⭐ | XState Viz工具 |
| 表单处理 | ⭐⭐⭐⭐⭐ | 验证状态管理 |
| 游戏开发 | ⭐⭐⭐⭐⭐ | 状态机天然适合 |
| 简单状态 | ⭐⭐⭐ | 可能过度设计 |

#### 权衡分析

**优点：**

- 状态转换可视化
- 消除非法状态
- 异步流程清晰
- 可测试性强
- 文档即代码

**缺点：**

- 学习曲线陡峭
- 样板代码较多
- 小型应用可能过重
- 需要状态机思维

#### 反例（错误应用）

```typescript
// ❌ 错误：状态机中直接修改外部状态
const badMachine = createMachine({
  states: {
    idle: {
      entry: () => {
        // 不应该直接修改外部状态
        globalStore.user = null; // 错误！
      }
    }
  }
});

// ❌ 错误：状态转换条件不明确
const ambiguousMachine = createMachine({
  states: {
    stateA: {
      on: {
        EVENT: 'stateB',
        EVENT: 'stateC' // 重复的事件处理！
      }
    }
  }
});

// ❌ 错误：在组件中直接修改状态机状态
const Component = () => {
  const [state, send] = useMachine(authMachine);

  const handleClick = () => {
    // 不应该直接修改状态
    state.value = 'authenticated'; // 错误！
  };
};

// ❌ 错误：状态机过于简单
const overkillMachine = createMachine({
  initial: 'on',
  states: {
    on: { on: { TOGGLE: 'off' } },
    off: { on: { TOGGLE: 'on' } }
  }
});
// 对于这种简单场景，useState更合适
```

---


## 3. 现代全栈架构

### 3.1 Next.js App Router

#### 定义和核心概念

Next.js App Router是Next.js 13+引入的新路由系统，基于React Server Components (RSC)构建，提供服务器优先的架构模式。

**核心概念：**

- **Server Components**：在服务器渲染的React组件
- **Client Components**：在客户端渲染的React组件
- **Streaming**：渐进式流式传输HTML
- **Server Actions**：服务器端函数，可直接从客户端调用
- **路由约定**：基于文件系统的路由

#### 架构图

```
Next.js App Router 架构：
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    客户端 (Client)                       │
│                                                         │
│   ┌─────────────────────────────────────────────┐       │
│   │            Client Components                │       │
│   │         [use client 指令]                   │       │
│   │                                             │       │
│   │   ┌─────────┐  ┌─────────┐  ┌─────────┐    │       │
│   │   │ Button  │  │  Form   │  │Carousel │    │       │
│   │   │[交互]   │  │[状态]   │  │[动画]   │    │       │
│   │   └─────────┘  └─────────┘  └─────────┘    │       │
│   │                                             │       │
│   │   特性：                                     │       │
│   │   - 可使用浏览器API                         │       │
│   │   - 可使用React hooks                       │       │
│   │   - 可添加事件监听器                        │       │
│   └─────────────────────────────────────────────┘       │
│                      ▲                                  │
│                      │                                  │
│              Server Actions                             │
│                      │                                  │
│   ═══════════════════════════════════════════           │
│                      │                                  │
│                      ▼                                  │
│   ┌─────────────────────────────────────────────┐       │
│   │            Server Components                │       │
│   │        [默认，无需指令]                      │       │
│   │                                             │       │
│   │   ┌─────────┐  ┌─────────┐  ┌─────────┐    │       │
│   │   │ Layout  │  │  Page   │  │  Card   │    │       │
│   │   │[结构]   │  │[数据]   │  │[展示]   │    │       │
│   │   └─────────┘  └─────────┘  └─────────┘    │       │
│   │                                             │       │
│   │   特性：                                     │       │
│   │   - 直接访问数据库                          │       │
│   │   - 零JS bundle大小                         │       │
│   │   - 服务端渲染                              │       │
│   └─────────────────────────────────────────────┘       │
│                                                         │
│                    服务器 (Server)                       │
│                                                         │
└─────────────────────────────────────────────────────────┘

Streaming 流程：
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   请求 ──► 服务器开始渲染                                │
│              │                                          │
│              ▼                                          │
│   ┌─────────────────┐                                   │
│   │  静态外壳 (Shell) │  ◄── 立即发送                    │
│   │  <html><body>... │                                   │
│   └─────────────────┘                                   │
│              │                                          │
│              ▼                                          │
│   ┌─────────────────┐                                   │
│   │  Suspense边界   │                                   │
│   │  <Suspense>     │                                   │
│   │    <Loading />  │  ◄── 显示加载状态                  │
│   │  </Suspense>     │                                   │
│   └─────────────────┘                                   │
│              │                                          │
│              ▼                                          │
│   数据获取完成 ──► 流式更新                              │
│              │                                          │
│              ▼                                          │
│   ┌─────────────────┐                                   │
│   │  实际内容       │  ◄── 替换加载状态                  │
│   │  <ActualData /> │                                   │
│   └─────────────────┘                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### TypeScript项目结构示例

```
my-app/
├── app/                           # App Router
│   ├── layout.tsx                 # 根布局
│   ├── page.tsx                   # 首页
│   ├── loading.tsx                # 加载状态
│   ├── error.tsx                  # 错误处理
│   ├── globals.css                # 全局样式
│   ├── (marketing)/               # 路由组
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── about/
│   │       └── page.tsx
│   ├── (shop)/                    # 路由组
│   │   ├── layout.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   └── layout.tsx
│   │   └── cart/
│   │       └── page.tsx
│   ├── api/                       # API路由
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   ├── dashboard/                 # 仪表板
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── @analytics/            # 并行路由
│   │       └── page.tsx
│   └── _components/               # 私有组件
│       └── Header.tsx
├── components/                    # 共享组件
│   ├── ui/                        # UI组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   └── forms/                     # 表单组件
│       └── ContactForm.tsx
├── lib/                           # 工具函数
│   ├── utils.ts
│   ├── db.ts                      # 数据库
│   └── auth.ts                    # 认证
├── hooks/                         # 自定义hooks
│   └── useUser.ts
├── types/                         # 类型定义
│   └── index.ts
├── public/                        # 静态资源
├── next.config.js
├── tailwind.config.ts
└── package.json
```

#### 代码实现示例

```typescript
// ============================================
// Server Components
// ============================================

// app/layout.tsx - 根布局（Server Component）
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My App',
  description: 'A Next.js App Router application'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header>
          <nav>{/* 导航 */}</nav>
        </header>
        <main>{children}</main>
        <footer>{/* 页脚 */}</footer>
      </body>
    </html>
  );
}

// app/page.tsx - 首页（Server Component）
import { Suspense } from 'react';
import { ProductList } from './_components/ProductList';
import { ProductListSkeleton } from './_components/ProductListSkeleton';
import { db } from '@/lib/db';

// 静态生成，每小时重新验证
export const revalidate = 3600;

async function getFeaturedProducts() {
  // 直接在Server Component中查询数据库
  const products = await db.product.findMany({
    where: { featured: true },
    take: 6
  });
  return products;
}

export default async function HomePage() {
  // 获取数据（在服务器上执行）
  const featuredProducts = await getFeaturedProducts();

  return (
    <div>
      <h1>Welcome to My Store</h1>

      {/* 静态内容立即渲染 */}
      <section className="hero">
        <h2>Featured Products</h2>
      </section>

      {/* 异步内容使用Suspense */}
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList products={featuredProducts} />
      </Suspense>
    </div>
  );
}

// app/products/[id]/page.tsx - 动态路由（Server Component）
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface ProductPageProps {
  params: { id: string };
}

// 生成静态参数
export async function generateStaticParams() {
  const products = await db.product.findMany({
    select: { id: true }
  });
  return products.map((p) => ({ id: p.id }));
}

// 动态Metadata
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await db.product.findUnique({
    where: { id: params.id }
  });

  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.name,
    description: product.description
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await db.product.findUnique({
    where: { id: params.id },
    include: { reviews: true }
  });

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p className="price">${product.price}</p>
      {/* Client Component用于交互 */}
      <AddToCartButton productId={product.id} />
    </div>
  );
}

// ============================================
// Client Components
// ============================================

// components/AddToCartButton.tsx - Client Component
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  productId: string;
}

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      // 调用Server Action
      await addToCart(productId);
      router.refresh(); // 刷新页面数据
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className="btn-primary"
    >
      {isLoading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}

// components/ProductCarousel.tsx - Client Component
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductCarouselProps {
  images: string[];
}

export function ProductCarousel({ images }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="carousel">
      <Image
        src={images[currentIndex]}
        alt="Product"
        width={600}
        height={400}
      />
      <div className="thumbnails">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={index === currentIndex ? 'active' : ''}
          >
            <Image src={img} alt="" width={100} height={75} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Server Actions
// ============================================

// app/_actions/cart.ts
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function addToCart(productId: string) {
  // 获取或创建购物车ID
  const cookieStore = cookies();
  let cartId = cookieStore.get('cartId')?.value;

  if (!cartId) {
    cartId = crypto.randomUUID();
    cookieStore.set('cartId', cartId);
  }

  // 添加商品到购物车
  await db.cart.upsert({
    where: { id: cartId },
    create: {
      id: cartId,
      items: { create: { productId, quantity: 1 } }
    },
    update: {
      items: {
        upsert: {
          where: { cartId_productId: { cartId, productId } },
          create: { productId, quantity: 1 },
          update: { quantity: { increment: 1 } }
        }
      }
    }
  });

  // 重新验证购物车页面
  revalidatePath('/cart');
}

export async function removeFromCart(productId: string) {
  const cartId = cookies().get('cartId')?.value;
  if (!cartId) return;

  await db.cartItem.deleteMany({
    where: { cartId, productId }
  });

  revalidatePath('/cart');
}

// app/_actions/auth.ts
'use server';

import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/lib/auth';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    await signIn('credentials', { email, password });
  } catch (error) {
    return { error: 'Invalid credentials' };
  }

  redirect('/dashboard');
}

export async function logout() {
  await signOut();
  redirect('/');
}

// ============================================
// Loading 和 Error 状态
// ============================================

// app/products/loading.tsx
export default function ProductsLoading() {
  return (
    <div className="loading">
      <div className="skeleton-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>
    </div>
  );
}

// app/products/error.tsx
'use client';

import { useEffect } from 'react';

export default function ProductsError({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Products error:', error);
  }, [error]);

  return (
    <div className="error">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// app/products/not-found.tsx
import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="not-found">
      <h2>Product Not Found</h2>
      <p>Could not find the requested product.</p>
      <Link href="/products">View all products</Link>
    </div>
  );
}

// ============================================
// 并行路由和拦截路由
// ============================================

// app/dashboard/layout.tsx - 并行路由
export default function DashboardLayout({
  children,
  analytics,
  notifications
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  notifications: React.ReactNode;
}) {
  return (
    <div className="dashboard">
      <div className="main">{children}</div>
      <div className="sidebar">
        {analytics}
        {notifications}
      </div>
    </div>
  );
}

// app/dashboard/@analytics/page.tsx
export default function AnalyticsSlot() {
  return (
    <div className="analytics">
      <h3>Analytics</h3>
      {/* 分析内容 */}
    </div>
  );
}

// app/dashboard/@notifications/page.tsx
export default function NotificationsSlot() {
  return (
    <div className="notifications">
      <h3>Notifications</h3>
      {/* 通知内容 */}
    </div>
  );
}
```

#### 适用场景

| 场景 | 适用性 | 说明 |
|------|--------|------|
| SEO重要 | ⭐⭐⭐⭐⭐ | SSR支持 |
| 性能要求高 | ⭐⭐⭐⭐⭐ | RSC减少JS |
| 全栈开发 | ⭐⭐⭐⭐⭐ | 前后端一体 |
| 内容网站 | ⭐⭐⭐⭐⭐ | 静态生成 |
| 复杂交互 | ⭐⭐⭐⭐ | Client Components |
| 已有后端API | ⭐⭐⭐ | 可能不需要 |

#### 权衡分析

**优点：**

- 服务器优先架构
- 零配置SSR/SSG
- 自动代码分割
- 强大的路由系统
- 性能优化内置

**缺点：**

- 学习曲线（RSC概念）
- 部署平台限制
- 调试复杂性
- 迁移成本（旧项目）

#### 反例（错误应用）

```typescript
// ❌ 错误：在Server Component中使用浏览器API
// app/page.tsx
export default function Page() {
  // 错误！localStorage只在浏览器可用
  const user = localStorage.getItem('user');

  // 错误！window只在浏览器可用
  const width = window.innerWidth;

  return <div>...</div>;
}

// ❌ 错误：在Client Component中直接访问数据库
'use client';

import { db } from '@/lib/db'; // 错误！

export function Component() {
  // Client Component不能直接在服务器代码
  const data = db.query('...'); // 错误！
}

// ❌ 错误：Server Action中没有'use server'
// app/actions.ts
export async function action() {
  // 忘记添加 'use server'
  await db.query('...'); // 这会在客户端执行！
}

// ❌ 错误：在async组件中使用hooks
export default async function Page() {
  const [state, setState] = useState(); // 错误！async组件不能使用hooks
}
```

---

### 3.2 Islands架构

#### 定义和核心概念

Islands架构（岛屿架构）由Katie Sylor-Miller提出，核心理念是：**页面大部分是静态HTML，只有交互部分需要JavaScript（岛屿）**。

**核心概念：**

- **静态海洋**：页面大部分是静态HTML，无JavaScript
- **交互岛屿**：需要交互的部分独立水合（Hydrate）
- **部分水合**：只加载必要的JavaScript
- **自动边界**：框架自动识别需要水合的部分

**代表框架：** Astro、Fresh (Deno)、Marko

#### 架构图

```
Islands 架构：
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │              静态 HTML 海洋                      │   │
│   │         (Static HTML - No JS)                   │   │
│   │                                                 │   │
│   │   ┌─────────────────────────────────────────┐   │   │
│   │   │                                         │   │   │
│   │   │   静态内容                              │   │   │
│   │   │   - 标题                                │   │   │
│   │   │   - 段落                                │   │   │
│   │   │   - 图片                                │   │   │
│   │   │   - 静态导航                            │   │   │
│   │   │                                         │   │   │
│   │   │   (零JavaScript)                        │   │   │
│   │   │                                         │   │   │
│   │   └─────────────────────────────────────────┘   │   │
│   │                                                 │   │
│   │   ┌─────────────┐     ┌─────────────┐          │   │
│   │   │   🏝️ 岛屿   │     │   🏝️ 岛屿   │          │   │
│   │   │  [交互式]   │     │  [交互式]   │          │   │
│   │   │             │     │             │          │   │
│   │   │  - 搜索框   │     │  - 轮播图   │          │   │
│   │   │  - 购物车   │     │  - 表单     │          │   │
│   │   │  - 评论     │     │  - 动画     │          │   │
│   │   │             │     │             │          │   │
│   │   │  (按需加载  │     │  (按需加载  │          │   │
│   │   │   JS)       │     │   JS)       │          │   │
│   │   └─────────────┘     └─────────────┘          │   │
│   │                                                 │   │
│   │   ┌─────────────────────────────────────────┐   │   │
│   │   │                                         │   │   │
│   │   │   更多静态内容                          │   │   │
│   │   │   - 页脚                                │   │   │
│   │   │   - 链接                                │   │   │
│   │   │   - 版权信息                            │   │   │
│   │   │                                         │   │   │
│   │   │   (零JavaScript)                        │   │   │
│   │   │                                         │   │   │
│   │   └─────────────────────────────────────────┘   │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ═══════════════════════════════════════════════════   │
│                                                         │
│   传统SPA：加载 100% JS                                 │
│   Islands：加载 10-20% JS（仅岛屿）                      │
│                                                         │
└─────────────────────────────────────────────────────────┘

水合过程：
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   1. 服务器渲染静态HTML                                  │
│      ┌─────────────────────────────────────────┐        │
│      │  <div id="island-search">               │        │
│      │    <input placeholder="Search..." />    │        │
│      │    <button>Search</button>              │        │
│      │  </div>                                 │        │
│      └─────────────────────────────────────────┘        │
│                      │                                  │
│                      ▼                                  │
│   2. 浏览器接收HTML（立即可见）                          │
│                      │                                  │
│                      ▼                                  │
│   3. 延迟加载岛屿JS                                     │
│      ┌─────────────────────────────────────────┐        │
│      │  import('/islands/search.js')           │        │
│      └─────────────────────────────────────────┘        │
│                      │                                  │
│                      ▼                                  │
│   4. 水合岛屿（添加事件监听器）                          │
│      ┌─────────────────────────────────────────┐        │
│      │  input.addEventListener('input', ...)   │        │
│      │  button.addEventListener('click', ...)  │        │
│      └─────────────────────────────────────────┘        │
│                      │                                  │
│                      ▼                                  │
│   5. 岛屿可交互                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### TypeScript项目结构示例 (Astro)

```
my-astro-site/
├── src/
│   ├── components/                # 组件
│   │   ├── ui/                    # UI组件（可以是Astro或框架组件）
│   │   │   ├── Button.astro
│   │   │   └── Card.astro
│   │   ├── islands/               # 交互式岛屿组件
│   │   │   ├── Search.tsx         # React岛屿
│   │   │   ├── Carousel.vue       # Vue岛屿
│   │   │   ├── Counter.svelte     # Svelte岛屿
│   │   │   └── Comments.tsx
│   │   └── static/                # 静态组件
│   │       ├── Header.astro
│   │       ├── Footer.astro
│   │       └── Navigation.astro
│   ├── layouts/                   # 布局
│   │   ├── BaseLayout.astro
│   │   ├── BlogLayout.astro
│   │   └── DocsLayout.astro
│   ├── pages/                     # 页面（文件即路由）
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── api/                   # API端点
│   │       └── search.ts
│   ├── content/                   # 内容集合
│   │   ├── blog/
│   │   │   ├── post-1.md
│   │   │   └── post-2.md
│   │   └── config.ts
│   ├── styles/                    # 样式
│   │   └── global.css
│   └── utils/                     # 工具函数
│       └── helpers.ts
├── public/                        # 静态资源
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

#### 代码实现示例 (Astro)

```typescript
// ============================================
// Astro 组件 (.astro 文件)
// ============================================

// src/layouts/BaseLayout.astro
---
export interface Props {
  title: string;
  description?: string;
}

const { title, description = 'My Astro Site' } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <meta name="description" content={description} />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>

// src/pages/index.astro - 首页
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/static/Header.astro';
import Footer from '../components/static/Footer.astro';
import Search from '../components/islands/Search.tsx';
import Carousel from '../components/islands/Carousel.vue';

// 在服务器获取数据
const posts = await Astro.glob('../content/blog/*.md');
const featuredPosts = posts.slice(0, 3);
---

<BaseLayout title="Home">
  <Header />

  <main>
    <!-- 静态内容：零JavaScript -->
    <section class="hero">
      <h1>Welcome to My Site</h1>
      <p>Fast, modern, content-focused websites.</p>
    </section>

    <!-- React岛屿：客户端交互 -->
    <Search client:load />

    <!-- 静态内容 -->
    <section class="featured">
      <h2>Featured Posts</h2>
      <div class="grid">
        {featuredPosts.map(post => (
          <article>
            <h3>{post.frontmatter.title}</h3>
            <p>{post.frontmatter.description}</p>
            <a href={post.url}>Read more</a>
          </article>
        ))}
      </div>
    </section>

    <!-- Vue岛屿：客户端交互 -->
    <Carousel client:visible />
  </main>

  <Footer />
</BaseLayout>

// src/pages/blog/[slug].astro - 动态路由
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Comments from '../../components/islands/Comments.tsx';

export async function getStaticPaths() {
  const posts = await Astro.glob('../../content/blog/*.md');
  return posts.map(post => ({
    params: { slug: post.frontmatter.slug },
    props: { post }
  }));
}

const { post } = Astro.props;
const { Content } = post;
---

<BaseLayout title={post.frontmatter.title}>
  <article>
    <h1>{post.frontmatter.title}</h1>
    <time>{post.frontmatter.date}</time>

    <!-- Markdown内容（静态） -->
    <div class="content">
      <Content />
    </div>

    <!-- 评论组件（交互式岛屿） -->
    <Comments
      postId={post.frontmatter.slug}
      client:idle  <!-- 空闲时加载 -->
    />
  </article>
</BaseLayout>

// ============================================
// 岛屿组件（框架组件）
// ============================================

// src/components/islands/Search.tsx - React岛屿
import { useState } from 'react';

interface SearchResult {
  id: string;
  title: string;
  url: string;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search">
      <form onSubmit={handleSearch}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <ul className="results">
          {results.map(result => (
            <li key={result.id}>
              <a href={result.url}>{result.title}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// src/components/islands/Carousel.vue - Vue岛屿
<template>
  <div class="carousel">
    <div class="slides" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
      <div v-for="(slide, index) in slides" :key="index" class="slide">
        <img :src="slide.image" :alt="slide.title" />
        <h3>{{ slide.title }}</h3>
      </div>
    </div>
    <button @click="prev" class="prev">←</button>
    <button @click="next" class="next">→</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  slides: Array
});

const currentIndex = ref(0);

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % props.slides.length;
};

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + props.slides.length) % props.slides.length;
};
</script>

// src/components/islands/Comments.tsx - React岛屿（更复杂）
import { useState, useEffect } from 'react';

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const response = await fetch(`/api/comments?postId=${postId}`);
    const data = await response.json();
    setComments(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, author, content: newComment })
    });

    if (response.ok) {
      setNewComment('');
      fetchComments();
    }
  };

  return (
    <section className="comments">
      <h3>Comments ({comments.length})</h3>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
          required
        />
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          required
        />
        <button type="submit">Post Comment</button>
      </form>

      <div className="comment-list">
        {comments.map(comment => (
          <article key={comment.id} className="comment">
            <header>
              <strong>{comment.author}</strong>
              <time>{new Date(comment.createdAt).toLocaleDateString()}</time>
            </header>
            <p>{comment.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

// ============================================
// 客户端指令
// ============================================

<!-- client:load - 页面加载时立即水合 -->
<Search client:load />

<!-- client:idle - 浏览器空闲时水合 -->
<Comments client:idle />

<!-- client:visible - 组件可见时水合 -->
<Carousel client:visible />

<!-- client:media - 匹配媒体查询时水合 -->
<MobileMenu client:media="(max-width: 768px)" />

<!-- client:only - 仅在客户端渲染 -->
<Chart client:only="react" />

// ============================================
// API端点
// ============================================

// src/pages/api/search.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q') || '';

  // 搜索逻辑
  const results = await searchContent(query);

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

async function searchContent(query: string) {
  // 实现搜索逻辑
  return [
    { id: '1', title: 'Result 1', url: '/blog/post-1' },
    { id: '2', title: 'Result 2', url: '/blog/post-2' }
  ];
}

// src/pages/api/comments.ts
export const GET: APIRoute = async ({ url }) => {
  const postId = url.searchParams.get('postId');
  const comments = await getComments(postId!);
  return new Response(JSON.stringify(comments));
};

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const comment = await createComment(data);
  return new Response(JSON.stringify(comment), { status: 201 });
};
```

#### 适用场景

| 场景 | 适用性 | 说明 |
|------|--------|------|
| 内容网站 | ⭐⭐⭐⭐⭐ | 博客、文档 |
| 营销网站 | ⭐⭐⭐⭐⭐ | 落地页 |
| 性能优先 | ⭐⭐⭐⭐⭐ | 最小JS |
| 电商展示 | ⭐⭐⭐⭐ | 产品展示 |
| 复杂SPA | ⭐⭐⭐ | 可能不适合 |
| 实时应用 | ⭐⭐⭐ | 需要更多JS |

#### 权衡分析

**优点：**

- 最小JavaScript负载
- 出色的Core Web Vitals
- 渐进增强
- 框架无关（可用React/Vue/Svelte）
- SEO友好

**缺点：**

- 岛屿间通信复杂
- 不适合复杂交互
- 学习新框架成本
- 生态系统相对较小

#### 反例（错误应用）

```astro
<!-- ❌ 错误：将整个页面标记为客户端渲染 -->
<Layout client:load>
  <!-- 所有内容都水合，失去Islands优势 -->
</Layout>

<!-- ❌ 错误：静态内容使用岛屿组件 -->
<Header client:load />  <!-- Header不需要交互！ -->

<!-- ❌ 错误：岛屿间直接依赖 -->
<Search client:load />
<!-- 假设Results依赖于Search的状态 -->
<Results client:load />  <!-- 应该在一个岛屿内管理状态 -->

// ❌ 错误：在Astro组件中使用客户端API
---
// src/components/Header.astro
const theme = localStorage.getItem('theme'); // 错误！服务器没有localStorage
---
```

---

### 3.3 边缘优先架构

#### 定义和核心概念

边缘优先架构将计算推向离用户最近的边缘节点，减少延迟，提高响应速度。

**核心概念：**

- **Edge Runtime**：轻量级JavaScript运行时（V8 isolates）
- **Edge Functions**：在边缘节点执行的函数
- **Durable Objects**：有状态边缘计算
- **Edge Cache**：边缘缓存
- **Geo-distributed**：地理分布

**代表平台：** Cloudflare Workers、Vercel Edge Functions、Deno Deploy

#### 架构图

```
传统架构 vs 边缘架构：

传统架构：
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   用户 (纽约) ──► CDN ──► 源服务器 (美国西部)            │
│                                                         │
│   延迟: ~80ms (到CDN) + ~60ms (到源服务器) = ~140ms     │
│                                                         │
└─────────────────────────────────────────────────────────┘

边缘架构：
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   用户 (纽约) ──► 边缘节点 (纽约)                        │
│                      │                                  │
│                      │ Edge Function                    │
│                      │ (V8 Isolate)                     │
│                      │                                  │
│                      ▼                                  │
│              ┌─────────────┐                            │
│              │  边缘缓存   │                            │
│              │  计算     │                            │
│              │  渲染     │                            │
│              └─────────────┘                            │
│                      │                                  │
│              延迟: ~10-20ms                             │
│                      │                                  │
│                      ▼ (如果需要)                       │
│              源服务器 (数据库等)                         │
│                                                         │
└─────────────────────────────────────────────────────────┘

边缘网络分布：
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    🌍 全球边缘网络                       │
│                                                         │
│        ┌─────┐              ┌─────┐                    │
│        │ 🇺🇸  │──────────────│ 🇪🇺  │                    │
│        │ NY  │              │ LD  │                    │
│        └──┬──┘              └──┬──┘                    │
│           │                    │                        │
│           │    ┌─────┐         │                        │
│           └────┤ 🌐  ├─────────┘                        │
│                │ PoP │                                  │
│           ┌────┤     ├─────────┐                        │
│           │    └─────┘         │                        │
│           │                    │                        │
│        ┌──┴──┐              ┌──┴──┐                    │
│        │ 🇸🇬  │              │ 🇯🇵  │                    │
│        │ SG  │              │ TK  │                    │
│        └─────┘              └─────┘                    │
│                                                         │
│   PoP = Point of Presence (边缘节点)                   │
│   用户自动连接到最近的边缘节点                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### TypeScript项目结构示例

```
edge-project/
├── src/
│   ├── handlers/                  # 请求处理器
│   │   ├── api.ts                 # API路由
│   │   ├── ssr.ts                 # 服务端渲染
│   │   └── websocket.ts           # WebSocket处理
│   ├── middleware/                # 中间件
│   │   ├── auth.ts
│   │   ├── cors.ts
│   │   └── rateLimit.ts
│   ├── utils/                     # 工具函数
│   │   ├── cache.ts
│   │   ├── kv.ts
│   │   └── geo.ts
│   └── types/                     # 类型定义
│       └── index.ts
├── functions/                     # Cloudflare Workers
│   ├── api/
│   │   └── [[path]].ts
│   └── ssr.ts
├── durable-objects/               # Durable Objects
│   └── chat-room.ts
├── migrations/                    # 数据库迁移
├── wrangler.toml                  # Cloudflare配置
└── package.json
```

#### 代码实现示例

```typescript
// ============================================
// Cloudflare Workers
// ============================================

// src/handlers/api.ts
export interface Env {
  DATABASE: D1Database;
  CACHE: Cache;
  KV: KVNamespace;
  AI: Ai;
}

export async function handleAPIRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // 路由处理
  switch (path) {
    case '/api/users':
      return handleUsers(request, env);
    case '/api/products':
      return handleProducts(request, env, ctx);
    case '/api/ai':
      return handleAI(request, env);
    default:
      return new Response('Not Found', { status: 404 });
  }
}

async function handleUsers(request: Request, env: Env): Promise<Response> {
  if (request.method === 'GET') {
    // 从D1数据库查询
    const { results } = await env.DATABASE.prepare(
      'SELECT id, name, email FROM users LIMIT 10'
    ).all();

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'POST') {
    const body = await request.json<{ name: string; email: string }>();

    const { success } = await env.DATABASE.prepare(
      'INSERT INTO users (name, email) VALUES (?, ?)'
    )
      .bind(body.name, body.email)
      .run();

    return new Response(JSON.stringify({ success }), {
      status: success ? 201 : 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}

async function handleProducts(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const cacheKey = new Request(request.url);

  // 尝试从缓存获取
  const cached = await env.CACHE.match(cacheKey);
  if (cached) {
    return cached;
  }

  // 从KV存储获取
  const products = await env.KV.get('products', 'json');

  if (products) {
    const response = new Response(JSON.stringify(products), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });

    // 缓存响应
    ctx.waitUntil(env.CACHE.put(cacheKey, response.clone()));

    return response;
  }

  return new Response('Not Found', { status: 404 });
}

async function handleAI(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ prompt: string }>();

  // 使用Cloudflare AI
  const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
    messages: [{ role: 'user', content: body.prompt }]
  });

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// ============================================
// 边缘中间件
// ============================================

// src/middleware/auth.ts
export async function authMiddleware(
  request: Request,
  env: Env
): Promise<Response | null> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const token = authHeader.slice(7);

  // 验证JWT（在边缘执行）
  try {
    const payload = await verifyJWT(token, env.JWT_SECRET);
    request.user = payload;
    return null; // 继续处理
  } catch {
    return new Response('Invalid token', { status: 401 });
  }
}

// src/middleware/rateLimit.ts
export async function rateLimitMiddleware(
  request: Request,
  env: Env
): Promise<Response | null> {
  const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `rate_limit:${clientIP}`;

  const current = await env.KV.get(key);
  const count = current ? parseInt(current) : 0;

  if (count > 100) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  await env.KV.put(key, String(count + 1), { expirationTtl: 60 });
  return null;
}

// src/middleware/cors.ts
export function corsMiddleware(response: Response): Response {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// ============================================
// Durable Objects（有状态边缘计算）
// ============================================

// durable-objects/chat-room.ts
export class ChatRoom implements DurableObject {
  private sessions: WebSocket[] = [];
  private messages: { user: string; message: string; time: number }[] = [];

  constructor(private state: DurableObjectState) {
    // 从存储恢复状态
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<typeof this.messages>('messages');
      if (stored) {
        this.messages = stored;
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    switch (url.pathname) {
      case '/websocket':
        return this.handleWebSocket(request);
      case '/history':
        return new Response(JSON.stringify(this.messages), {
          headers: { 'Content-Type': 'application/json' }
        });
      default:
        return new Response('Not Found', { status: 404 });
    }
  }

  private handleWebSocket(request: Request): Response {
    const [client, server] = Object.values(new WebSocketPair());

    this.sessions.push(server);

    server.accept();

    server.addEventListener('message', async (event) => {
      const data = JSON.parse(event.data as string);

      // 保存消息
      const message = {
        user: data.user,
        message: data.message,
        time: Date.now()
      };
      this.messages.push(message);
      await this.state.storage.put('messages', this.messages);

      // 广播给所有连接
      this.broadcast(JSON.stringify(message));
    });

    server.addEventListener('close', () => {
      this.sessions = this.sessions.filter(s => s !== server);
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  private broadcast(message: string): void {
    this.sessions.forEach(session => {
      session.send(message);
    });
  }
}

// ============================================
// Vercel Edge Functions
// ============================================

// api/hello.ts
export const config = {
  runtime: 'edge'
};

export default async function handler(request: Request): Promise<Response> {
  // 获取地理位置信息
  const country = request.headers.get('x-vercel-ip-country');
  const city = request.headers.get('x-vercel-ip-city');

  return new Response(
    JSON.stringify({
      message: 'Hello from the Edge!',
      location: { country, city },
      timestamp: new Date().toISOString()
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    }
  );
}

// api/og.tsx - 动态Open Graph图片生成
export const config = {
  runtime: 'edge'
};

export default async function handler(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Hello';

  // 使用Edge Runtime生成图片
  const image = await generateOGImage(title);

  return new Response(image, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}

async function generateOGImage(title: string): Promise<Uint8Array> {
  // 使用Satori或其他库生成图片
  // 这是简化示例
  return new Uint8Array();
}

// ============================================
// 边缘渲染（SSR at Edge）
// ============================================

// functions/ssr.ts
export async function onRequest(context: EventContext<Env, any, any>): Promise<Response> {
  const { request, env } = context;

  // 获取用户地理位置
  const country = request.cf?.country;
  const timezone = request.cf?.timezone;

  // 根据地理位置定制内容
  const localizedContent = await getLocalizedContent(country);

  // 渲染HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Edge Rendered Page</title>
</head>
<body>
  <h1>Hello from ${country || 'Unknown'}!</h1>
  <p>Your timezone: ${timezone || 'Unknown'}</p>
  <div>${localizedContent}</div>
  <p>Rendered at: ${new Date().toISOString()}</p>
</body>
</html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

async function getLocalizedContent(country: string | undefined): Promise<string> {
  const messages: Record<string, string> = {
    US: 'Welcome!',
    CN: '欢迎!',
    JP: 'ようこそ!',
    default: 'Hello!'
  };

  return messages[country || 'default'] || messages.default;
}
```

#### 适用场景

| 场景 | 适用性 | 说明 |
|------|--------|------|
| 全球应用 | ⭐⭐⭐⭐⭐ | 低延迟 |
| 实时应用 | ⭐⭐⭐⭐⭐ | WebSocket支持 |
| API网关 | ⭐⭐⭐⭐⭐ | 边缘处理 |
| 内容个性化 | ⭐⭐⭐⭐⭐ | 地理位置 |
| 长计算任务 | ⭐⭐ | 有超时限制 |
| 大量状态 | ⭐⭐ | 需要Durable Objects |

#### 权衡分析

**优点：**

- 超低延迟
- 全球分布
- 自动扩展
- 成本效益
- 内置缓存

**缺点：**

- 执行时间限制
- 受限的Node.js API
- 调试困难
- 冷启动问题
- 供应商锁定

#### 反例（错误应用）

```typescript
// ❌ 错误：在Edge Function中使用Node.js API
export default async function handler(request: Request) {
  const fs = require('fs'); // 错误！Edge Runtime不支持fs
  const data = fs.readFileSync('./file.txt');
}

// ❌ 错误：长时间运行的任务
export default async function handler(request: Request) {
  // 错误！Edge Functions有执行时间限制（通常<30s）
  await longRunningTask();
}

// ❌ 错误：大量内存使用
export default async function handler(request: Request) {
  // 错误！Edge Runtime内存有限
  const hugeArray = new Array(100000000);
}

// ❌ 错误：依赖有状态连接
export default async function handler(request: Request) {
  // 每次请求都是新的isolate，不能依赖内存状态
  global.counter = (global.counter || 0) + 1; // 错误！
}
```

---

### 3.4 微前端

#### 定义和核心概念

微前端是将前端应用拆分为独立部署、独立开发、独立运行的多个小型应用的架构模式。

**核心概念：**

- **独立部署**：每个微前端可独立发布
- **技术无关**：不同团队可用不同技术栈
- **团队自治**：团队拥有端到端所有权
- **运行时集成**：在浏览器中组合

**集成方式：**

- 构建时集成（npm包）
- 运行时集成（Module Federation、Single SPA）
- 服务端集成（SSI、ESI）

#### 架构图

```
微前端架构：
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    容器应用 (Shell)                      │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │   ┌─────────┐  ┌─────────┐  ┌─────────┐        │   │
│   │   │  导航   │  │  路由   │  │  共享   │        │   │
│   │   │  组件   │  │  管理   │  │  状态   │        │   │
│   │   └─────────┘  └─────────┘  └─────────┘        │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                      │                                  │
│                      │ 运行时集成                        │
│        ┌─────────────┼─────────────┐                    │
│        │             │             │                    │
│        ▼             ▼             ▼                    │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐              │
│   │ 微前端A │   │ 微前端B │   │ 微前端C │              │
│   │         │   │         │   │         │              │
│   │ React   │   │  Vue    │   │ Svelte  │              │
│   │ 团队A   │   │  团队B  │   │  团队C  │              │
│   │         │   │         │   │         │              │
│   │ 产品页  │   │  购物车 │   │  用户   │              │
│   │         │   │         │   │  中心   │              │
│   └─────────┘   └─────────┘   └─────────┘              │
│        │             │             │                    │
│        │             │             │                    │
│        └─────────────┴─────────────┘                    │
│                      │                                  │
│                      ▼                                  │
│              共享依赖 (Shared Dependencies)              │
│              - React/Vue Runtime                         │
│              - 设计系统                                  │
│              - 工具库                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘

Module Federation 架构：
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   容器 (Host)                                           │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │   import('remote/ProductPage')                 │   │
│   │                                                 │   │
│   │   ┌─────────────────────────────────────────┐   │   │
│   │   │         远程容器 (Remote Container)      │   │   │
│   │   │                                         │   │   │
│   │   │   exposes: {                            │   │   │
│   │   │     './ProductPage': './src/ProductPage'│   │   │
│   │   │   }                                     │   │   │
│   │   │                                         │   │   │
│   │   │   shared: {                             │   │   │
│   │   │     'react': { singleton: true }        │   │   │
│   │   │   }                                     │   │   │
│   │   │                                         │   │   │
│   │   └─────────────────────────────────────────┘   │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                      │                                  │
│                      │ 运行时加载                        │
│                      ▼                                  │
│   ┌─────────────────────────────────────────────────┐   │
│   │              远程应用 (Remote)                    │   │
│   │                                                 │   │
│   │   ┌─────────┐  ┌─────────┐  ┌─────────┐        │   │
│   │   │ Product │  │ Product │  │  Add    │        │   │
│   │   │  List   │  │ Detail  │  │ to Cart │        │   │
│   │   │         │  │         │  │         │        │   │
│   │   │ 独立    │  │  独立   │  │  独立   │        │   │
│   │   │ 部署    │  │  部署   │  │  部署   │        │   │
│   │   └─────────┘  └─────────┘  └─────────┘        │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### TypeScript项目结构示例

```
micro-frontend-project/
├── shell/                         # 容器应用
│   ├── src/
│   │   ├── components/
│   │   │   ├── Shell.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── utils/
│   │   │   └── registerMicroApp.ts
│   │   └── index.tsx
│   ├── webpack.config.js          # Module Federation配置
│   └── package.json
├── mf-products/                   # 产品微前端
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── bootstrap.tsx
│   ├── webpack.config.js
│   └── package.json
├── mf-cart/                       # 购物车微前端
│   ├── src/
│   ├── webpack.config.js
│   └── package.json
├── mf-user/                       # 用户微前端
│   ├── src/
│   ├── webpack.config.js
│   └── package.json
└── shared/                        # 共享包
    ├── design-system/
    ├── utils/
    └── types/
```

#### 代码实现示例

```typescript
// ============================================
// Module Federation 配置
// ============================================

// shell/webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        products: 'products@http://localhost:3001/remoteEntry.js',
        cart: 'cart@http://localhost:3002/remoteEntry.js',
        user: 'user@http://localhost:3003/remoteEntry.js'
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.0.0'
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0'
        },
        'react-router-dom': {
          singleton: true
        }
      }
    })
  ]
};

// mf-products/webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'products',
      filename: 'remoteEntry.js',
      exposes: {
        './ProductList': './src/components/ProductList',
        './ProductDetail': './src/components/ProductDetail',
        './routes': './src/routes'
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.0.0'
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0'
        }
      }
    })
  ]
};

// ============================================
// 容器应用 (Shell)
// ============================================

// shell/src/components/Shell.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

// 懒加载远程组件
const ProductList = lazy(() => import('products/ProductList'));
const ProductDetail = lazy(() => import('products/ProductDetail'));
const Cart = lazy(() => import('cart/Cart'));
const UserProfile = lazy(() => import('user/UserProfile'));

// 类型声明
declare module 'products/ProductList';
declare module 'products/ProductDetail';
declare module 'cart/Cart';
declare module 'user/UserProfile';

export default function Shell() {
  return (
    <BrowserRouter>
      <div className="shell">
        <nav>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/user">Profile</Link>
        </nav>

        <main>
          <ErrorBoundary>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/user" element={<UserProfile />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </BrowserRouter>
  );
}

function Home() {
  return <h1>Welcome to Micro Frontend App</h1>;
}

// shell/src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Micro Frontend Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================
// 产品微前端 (mf-products)
// ============================================

// mf-products/src/components/ProductList.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="product-list">
      <h2>Products</h2>
      <div className="grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <Link to={`/products/${product.id}`}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// mf-products/src/components/ProductDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProduct(id!);
  }, [id]);

  const fetchProduct = async (productId: string) => {
    const response = await fetch(`/api/products/${productId}`);
    const data = await response.json();
    setProduct(data);
  };

  const handleAddToCart = () => {
    // 通过自定义事件与购物车微前端通信
    window.dispatchEvent(new CustomEvent('add-to-cart', {
      detail: { productId: id, quantity: 1 }
    }));
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="product-detail">
      <img src={product.image} alt={product.name} />
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p className="price">${product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}

// ============================================
// 购物车微前端 (mf-cart)
// ============================================

// mf-cart/src/components/Cart.tsx
import React, { useEffect, useState } from 'react';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // 监听添加购物车事件
    const handleAddToCart = (event: CustomEvent) => {
      const { productId, quantity } = event.detail;
      addItem(productId, quantity);
    };

    window.addEventListener('add-to-cart', handleAddToCart as EventListener);

    return () => {
      window.removeEventListener('add-to-cart', handleAddToCart as EventListener);
    };
  }, []);

  const addItem = async (productId: string, quantity: number) => {
    // 获取产品信息并添加到购物车
    const response = await fetch(`/api/products/${productId}`);
    const product = await response.json();

    setItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId, name: product.name, price: product.price, quantity }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart">
      <h2>Shopping Cart</h2>
      {items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ul>
            {items.map(item => (
              <li key={item.productId}>
                <span>{item.name}</span>
                <span>Qty: {item.quantity}</span>
                <span>${item.price * item.quantity}</span>
                <button onClick={() => removeItem(item.productId)}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="total">Total: ${total}</div>
          <button className="checkout">Checkout</button>
        </>
      )}
    </div>
  );
}

// ============================================
// Single SPA 实现
// ============================================

// root-config/src/index.ts
import { registerApplication, start } from 'single-spa';

registerApplication({
  name: 'products',
  app: () => import('mf-products/src/main'),
  activeWhen: '/products'
});

registerApplication({
  name: 'cart',
  app: () => import('mf-cart/src/main'),
  activeWhen: '/cart'
});

registerApplication({
  name: 'user',
  app: () => import('mf-user/src/main'),
  activeWhen: '/user'
});

start();

// mf-products/src/main.ts (Single SPA生命周期)
import React from 'react';
import ReactDOM from 'react-dom/client';
import ProductList from './components/ProductList';

let root: ReactDOM.Root | null = null;

export const bootstrap = async () => {
  // 初始化
};

export const mount = async (props: any) => {
  root = ReactDOM.createRoot(props.domElement);
  root.render(<ProductList />);
};

export const unmount = async () => {
  root?.unmount();
};
```

#### 适用场景

| 场景 | 适用性 | 说明 |
|------|--------|------|
| 大型团队 | ⭐⭐⭐⭐⭐ | 团队自治 |
| 多技术栈 | ⭐⭐⭐⭐⭐ | 技术无关 |
| 独立部署 | ⭐⭐⭐⭐⭐ | 发布解耦 |
| 遗留系统集成 | ⭐⭐⭐⭐⭐ | 渐进迁移 |
| 小型团队 | ⭐⭐ | 可能过度 |
| 简单应用 | ⭐⭐ | 不需要 |

#### 权衡分析

**优点：**

- 团队自治
- 技术栈灵活
- 独立部署
- 渐进迁移
- 代码隔离

**缺点：**

- 复杂性增加
- 性能开销
- 共享依赖管理
- 跨团队协调
- 调试困难

#### 反例（错误应用）

```typescript
// ❌ 错误：微前端间直接依赖
// mf-products/src/components/ProductList.tsx
import { CartButton } from 'mf-cart/src/components/CartButton'; // 错误！

// ❌ 错误：共享状态管理不当
// 每个微前端都有自己的Redux store，导致状态不一致

// ❌ 错误：CSS冲突
// 每个微前端使用全局CSS，导致样式冲突

// ❌ 错误：路由冲突
// 多个微前端定义相同路由

// ❌ 错误：过度拆分
// 将简单的应用拆分成过多的微前端
```

---


## 4. 架构决策

### 4.1 架构特性分析

#### 定义和核心概念

架构特性（Architectural Characteristics）是系统需要满足的非功能性需求，用于评估和选择架构方案。

**核心特性分类：**

- **操作性**：可用性、可靠性、可扩展性
- **结构性**：可维护性、可测试性、可部署性
- **跨领域**：安全性、性能、可观测性

#### 架构特性矩阵

| 特性 | 描述 | 衡量指标 |
|------|------|----------|
| **可用性** | 系统可访问的时间比例 | 99.9% (3个9) / 99.99% (4个9) |
| **可靠性** | 系统正确执行的能力 | MTBF (平均故障间隔时间) |
| **可扩展性** | 处理增长负载的能力 | TPS/QPS增长比例 |
| **性能** | 响应时间和吞吐量 | P50/P95/P99延迟 |
| **安全性** | 保护数据和功能 | 漏洞数量、合规认证 |
| **可维护性** | 修改和增强的容易程度 | 代码复杂度、文档完整性 |
| **可测试性** | 验证正确性的容易程度 | 测试覆盖率、缺陷逃逸率 |
| **可部署性** | 发布到生产的容易程度 | 部署频率、失败率 |
| **可观测性** | 理解系统状态的能力 | 日志/指标/追踪覆盖率 |

#### 架构特性优先级框架

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              架构特性优先级象限                          │
│                                                         │
│   ┌─────────────────────┬─────────────────────┐        │
│   │                     │                     │        │
│   │    关键 (Critical)   │    重要 (Important)  │        │
│   │                     │                     │        │
│   │   必须实现          │   应该实现          │        │
│   │   影响架构决策      │   影响技术选型      │        │
│   │                     │                     │        │
│   │   例：安全性        │   例：性能          │        │
│   │       可用性        │       可扩展性      │        │
│   │                     │                     │        │
│   ├─────────────────────┼─────────────────────┤        │
│   │                     │                     │        │
│   │    期望 (Desirable)  │    可选 (Optional)   │        │
│   │                     │                     │        │
│   │   可以实现          │   有时间再实现      │        │
│   │   不阻塞发布        │   锦上添花          │        │
│   │                     │                     │        │
│   │   例：可观测性      │   例：国际化        │        │
│   │       可审计性      │       主题定制      │        │
│   │                     │                     │        │
│   └─────────────────────┴─────────────────────┘        │
│                                                         │
│          优先级 (高) ─────────────────► (低)           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 架构权衡分析方法

```typescript
// 架构特性评分系统
interface ArchitectureCharacteristic {
  name: string;
  weight: number; // 1-10
  description: string;
}

interface ArchitectureOption {
  name: string;
  scores: Record<string, number>; // 特性名 -> 分数 (1-10)
}

function evaluateArchitecture(
  characteristics: ArchitectureCharacteristic[],
  options: ArchitectureOption[]
): ArchitectureOption[] {
  return options.map(option => {
    const weightedScore = characteristics.reduce((sum, char) => {
      const score = option.scores[char.name] || 5;
      return sum + score * char.weight;
    }, 0);

    const totalWeight = characteristics.reduce((sum, char) => sum + char.weight, 0);
    const normalizedScore = weightedScore / totalWeight;

    return {
      ...option,
      totalScore: normalizedScore
    };
  }).sort((a, b) => (b as any).totalScore - (a as any).totalScore);
}

// 使用示例
const characteristics: ArchitectureCharacteristic[] = [
  { name: 'performance', weight: 9, description: '响应时间 < 100ms' },
  { name: 'scalability', weight: 8, description: '支持10x流量增长' },
  { name: 'maintainability', weight: 7, description: '团队熟悉度' },
  { name: 'security', weight: 10, description: 'SOC2合规' },
  { name: 'cost', weight: 6, description: '基础设施成本' }
];

const options: ArchitectureOption[] = [
  {
    name: 'Monolith',
    scores: {
      performance: 7,
      scalability: 5,
      maintainability: 8,
      security: 7,
      cost: 9
    }
  },
  {
    name: 'Microservices',
    scores: {
      performance: 8,
      scalability: 9,
      maintainability: 6,
      security: 7,
      cost: 5
    }
  },
  {
    name: 'Serverless',
    scores: {
      performance: 8,
      scalability: 10,
      maintainability: 7,
      security: 8,
      cost: 8
    }
  }
];

const rankedOptions = evaluateArchitecture(characteristics, options);
console.log(rankedOptions);
```

---

### 4.2 架构决策记录(ADR)

#### 定义和核心概念

架构决策记录（Architecture Decision Records, ADR）是记录重要架构决策及其上下文的文档。

**ADR结构：**

1. **标题**：决策的简短描述
2. **状态**：提议/已接受/已弃用/已取代
3. **上下文**：决策的背景和约束
4. **决策**：明确的决策声明
5. **后果**：决策的结果（正面和负面）
6. **替代方案**：考虑过的其他选项

#### ADR模板

```markdown
# ADR-001: 使用React作为前端框架

## 状态
已接受 (2024-01-15)

## 上下文
我们需要为新的客户门户选择一个前端框架。团队有5名前端开发人员，项目时间线为3个月。

约束条件：
- 必须支持TypeScript
- 必须有活跃的社区
- 团队成员学习曲线要合理

## 决策
我们决定使用React 18配合TypeScript作为前端框架。

## 后果

### 正面
- 团队已有React经验
- 丰富的生态系统（Next.js, React Query等）
- 优秀的TypeScript支持
- 大量可用的组件库

### 负面
- 需要额外配置状态管理
- 虚拟DOM可能不如原生性能

## 替代方案

### Vue 3
- 优点：更轻量，学习曲线平缓
- 缺点：团队无经验，生态系统较小

### Svelte
- 优点：性能优秀，编译时优化
- 缺点：团队无经验，生态系统较小

### Angular
- 优点：全功能框架，企业级支持
- 缺点：过于复杂，学习曲线陡峭
```

#### TypeScript项目ADR目录结构

```
docs/
├── adr/                           # 架构决策记录
│   ├── 001-use-react.md
│   ├── 002-use-postgresql.md
│   ├── 003-microservices.md
│   ├── 004-graphql-api.md
│   ├── 005-caching-strategy.md
│   └── README.md                  # ADR索引
├── architecture/                  # 架构文档
│   ├── overview.md
│   ├── data-flow.md
│   └── security.md
└── decisions/                     # 其他决策记录
    └── tech-stack.md
```

#### ADR管理工具

```typescript
// scripts/adr.ts - ADR管理脚本
import * as fs from 'fs';
import * as path from 'path';

const ADR_DIR = './docs/adr';

interface ADR {
  id: string;
  title: string;
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  date: string;
  content: string;
}

function createADR(title: string): void {
  const files = fs.readdirSync(ADR_DIR);
  const maxId = files
    .filter(f => f.match(/^\d+/))
    .map(f => parseInt(f.split('-')[0]))
    .reduce((max, id) => Math.max(max, id), 0);

  const newId = String(maxId + 1).padStart(3, '0');
  const filename = `${newId}-${title.toLowerCase().replace(/\s+/g, '-')}.md`;
  const filepath = path.join(ADR_DIR, filename);

  const template = `# ADR-${newId}: ${title}

## 状态
提议 (${new Date().toISOString().split('T')[0]})

## 上下文
<!-- 描述决策的背景和约束 -->

## 决策
<!-- 明确的决策声明 -->

## 后果

### 正面
<!-- 正面影响 -->

### 负面
<!-- 负面影响 -->

## 替代方案
<!-- 考虑过的其他选项 -->
`;

  fs.writeFileSync(filepath, template);
  console.log(`Created ADR: ${filepath}`);
}

function listADRs(): void {
  const files = fs.readdirSync(ADR_DIR)
    .filter(f => f.endsWith('.md') && f !== 'README.md')
    .sort();

  console.log('Architecture Decision Records:');
  console.log('─'.repeat(50));

  files.forEach(file => {
    const content = fs.readFileSync(path.join(ADR_DIR, file), 'utf-8');
    const titleMatch = content.match(/^# ADR-\d+: (.+)$/m);
    const statusMatch = content.match(/## 状态\s*\n(.+)$/m);

    const title = titleMatch ? titleMatch[1] : 'Unknown';
    const status = statusMatch ? statusMatch[1].trim() : 'Unknown';

    console.log(`${file.replace('.md', '')}`);
    console.log(`  Title: ${title}`);
    console.log(`  Status: ${status}`);
    console.log();
  });
}

// CLI使用
const command = process.argv[2];
const arg = process.argv[3];

if (command === 'create' && arg) {
  createADR(arg);
} else if (command === 'list') {
  listADRs();
} else {
  console.log('Usage: ts-node adr.ts <create|list> [title]');
}
```

---

### 4.3 技术选型矩阵

#### 定义和核心概念

技术选型矩阵是系统化的技术评估工具，帮助团队在多个选项中做出数据驱动的决策。

#### 前端状态管理选型矩阵

| 特性 | Redux | Zustand | Jotai | Signals | Context |
|------|-------|---------|-------|---------|---------|
| **学习曲线** | 陡峭 | 平缓 | 平缓 | 中等 | 平缓 |
| **样板代码** | 多 | 少 | 少 | 少 | 中等 |
| **TypeScript** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **DevTools** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **中间件** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| **性能** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **包大小** | ~10KB | ~1KB | ~5KB | ~3KB | 0KB |
| **社区** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **适用规模** | 大型 | 中小型 | 中小型 | 所有 | 小型 |

#### 后端架构选型矩阵

| 特性 | Monolith | Microservices | Serverless | Modular Monolith |
|------|----------|---------------|------------|------------------|
| **开发速度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **部署复杂度** | 低 | 高 | 低 | 中 |
| **扩展性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **团队规模** | 小团队 | 大团队 | 任意 | 中等团队 |
| **运维成本** | 低 | 高 | 低 | 中 |
| **调试难度** | 低 | 高 | 中 | 低 |
| **技术多样性** | 低 | 高 | 中 | 低 |
| **数据一致性** | 容易 | 困难 | 中 | 容易 |
| **启动成本** | 低 | 高 | 低 | 中 |

#### 全栈框架选型矩阵

| 特性 | Next.js | Nuxt | SvelteKit | Remix | Astro |
|------|---------|------|-----------|-------|-------|
| **渲染模式** | SSR/SSG/CSR | SSR/SSG | SSR/SSG | SSR | SSG/SSR |
| **前端框架** | React | Vue | Svelte | React | 任意 |
| **路由** | 文件系统 | 文件系统 | 文件系统 | 配置 | 文件系统 |
| **API路由** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **边缘支持** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **性能** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **生态** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **学习曲线** | 中等 | 中等 | 平缓 | 陡峭 | 平缓 |
| **部署** | Vercel/任意 | 任意 | 任意 | 任意 | 任意 |

#### 选型决策流程

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              技术选型决策流程                            │
│                                                         │
│   ┌─────────────┐                                       │
│   │  1. 收集需求 │                                       │
│   │  - 功能需求  │                                       │
│   │  - 非功能需求│                                       │
│   │  - 约束条件  │                                       │
│   └──────┬──────┘                                       │
│          │                                              │
│          ▼                                              │
│   ┌─────────────┐                                       │
│   │  2. 识别选项 │                                       │
│   │  - 候选技术  │                                       │
│   │  - 市场研究  │                                       │
│   │  - 团队经验  │                                       │
│   └──────┬──────┘                                       │
│          │                                              │
│          ▼                                              │
│   ┌─────────────┐                                       │
│   │  3. 定义标准 │                                       │
│   │  - 评估维度  │                                       │
│   │  - 权重分配  │                                       │
│   │  - 评分标准  │                                       │
│   └──────┬──────┘                                       │
│          │                                              │
│          ▼                                              │
│   ┌─────────────┐                                       │
│   │  4. 评估选项 │                                       │
│   │  - 原型验证  │                                       │
│   │  - 团队评审  │                                       │
│   │  - 性能测试  │                                       │
│   └──────┬──────┘                                       │
│          │                                              │
│          ▼                                              │
│   ┌─────────────┐                                       │
│   │  5. 做出决策 │                                       │
│   │  - 记录ADR   │                                       │
│   │  - 团队共识  │                                       │
│   │  - 时间规划  │                                       │
│   └──────┬──────┘                                       │
│          │                                              │
│          ▼                                              │
│   ┌─────────────┐                                       │
│   │  6. 实施监控 │                                       │
│   │  - 指标跟踪  │                                       │
│   │  - 定期回顾  │                                       │
│   │  - 调整优化  │                                       │
│   └─────────────┘                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 4.4 演进式架构

#### 定义和核心概念

演进式架构（Evolutionary Architecture）支持系统在不破坏核心功能的前提下持续演进和适应变化。

**核心原则：**

- **增量变更**：小步快跑，持续交付
- **适应度函数**：自动验证架构约束
- **适当耦合**：有意识的耦合决策
- **实验文化**：允许尝试和失败

#### 演进式架构金字塔

```
                    ┌─────────┐
                    │  业务   │
                    │  价值   │
                    └────┬────┘
                         │
                    ┌────┴────┐
                    │  应用   │
                    │  架构   │
                    └────┬────┘
                         │
                    ┌────┴────┐
                    │  数据   │
                    │  架构   │
                    └────┬────┘
                         │
                    ┌────┴────┐
                    │  技术   │
                    │  架构   │
                    └────┬────┘
                         │
                    ┌────┴────┐
                    │  基础设施│
                    │  架构   │
                    └─────────┘
```

#### 适应度函数示例

```typescript
// 架构适应度函数 - 自动验证架构约束

// 1. 循环依赖检测
import * as fs from 'fs';
import * as path from 'path';

interface DependencyCheck {
  name: string;
  check: () => Promise<boolean>;
  description: string;
}

const fitnessFunctions: DependencyCheck[] = [
  {
    name: 'No Circular Dependencies',
    description: 'Domain layer should not depend on infrastructure',
    check: async () => {
      // 检查domain目录是否导入infrastructure
      const domainFiles = await findFiles('src/domain', '.ts');
      for (const file of domainFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        if (content.includes('from \'../infrastructure\'')) {
          console.error(`Circular dependency found in ${file}`);
          return false;
        }
      }
      return true;
    }
  },
  {
    name: 'Test Coverage Threshold',
    description: 'Core domain must have >80% test coverage',
    check: async () => {
      // 读取覆盖率报告
      const coverageReport = JSON.parse(
        fs.readFileSync('coverage/coverage-summary.json', 'utf-8')
      );
      const domainCoverage = coverageReport.total.statements.pct;
      return domainCoverage >= 80;
    }
  },
  {
    name: 'Bundle Size Limit',
    description: 'Main bundle must be <200KB gzipped',
    check: async () => {
      const stats = JSON.parse(fs.readFileSync('dist/stats.json', 'utf-8'));
      const mainBundle = stats.assets.find((a: any) => a.name === 'main.js');
      return mainBundle?.size < 200 * 1024;
    }
  },
  {
    name: 'No Console in Production',
    description: 'Production code should not contain console.log',
    check: async () => {
      const srcFiles = await findFiles('src', '.ts');
      for (const file of srcFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        if (content.includes('console.log')) {
          console.error(`console.log found in ${file}`);
          return false;
        }
      }
      return true;
    }
  }
];

async function runFitnessFunctions(): Promise<void> {
  console.log('Running Architecture Fitness Functions...\n');

  let allPassed = true;

  for (const fn of fitnessFunctions) {
    process.stdout.write(`${fn.name}... `);
    try {
      const passed = await fn.check();
      if (passed) {
        console.log('✅ PASSED');
      } else {
        console.log('❌ FAILED');
        console.log(`   ${fn.description}`);
        allPassed = false;
      }
    } catch (error) {
      console.log('❌ ERROR');
      console.log(`   ${error}`);
      allPassed = false;
    }
  }

  console.log('\n' + (allPassed ? '✅ All checks passed!' : '❌ Some checks failed!'));
  process.exit(allPassed ? 0 : 1);
}

async function findFiles(dir: string, ext: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(ext)) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

// 运行检查
runFitnessFunctions();
```

#### 架构演进路线图

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              架构演进路线图                              │
│                                                         │
│   阶段1: MVP (0-3个月)                                  │
│   ┌─────────────────────────────────────────────┐       │
│   │  - 单体架构                                  │       │
│   │  - 最小可行产品                              │       │
│   │  - 快速迭代                                  │       │
│   │  - 技术债务可接受                            │       │
│   └─────────────────────────────────────────────┘       │
│                      │                                  │
│                      ▼                                  │
│   阶段2: 产品市场契合 (3-12个月)                         │
│   ┌─────────────────────────────────────────────┐       │
│   │  - 模块化单体                                │       │
│   │  - 定义领域边界                              │       │
│   │  - 偿还关键技术债务                          │       │
│   │  - 建立测试覆盖                              │       │
│   └─────────────────────────────────────────────┘       │
│                      │                                  │
│                      ▼                                  │
│   阶段3: 规模化 (12-24个月)                              │
│   ┌─────────────────────────────────────────────┐       │
│   │  - 微服务拆分                                │       │
│   │  - 独立团队                                  │       │
│   │  - 服务网格                                  │       │
│   │  - 可观测性                                  │       │
│   └─────────────────────────────────────────────┘       │
│                      │                                  │
│                      ▼                                  │
│   阶段4: 成熟 (24+个月)                                  │
│   ┌─────────────────────────────────────────────┐       │
│   │  - 平台化                                    │       │
│   │  - 自动化                                    │       │
│   │  - 多区域部署                                │       │
│   │  - 持续优化                                  │       │
│   └─────────────────────────────────────────────┘       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 反模式与重构策略

```typescript
// ============================================
// 架构反模式检测与重构
// ============================================

// 反模式1: 上帝对象
// ❌ 错误
class GodClass {
  // 处理用户
  createUser() {}
  updateUser() {}
  deleteUser() {}

  // 处理订单
  createOrder() {}
  updateOrder() {}
  deleteOrder() {}

  // 处理产品
  createProduct() {}
  updateProduct() {}
  deleteProduct() {}
}

// ✅ 重构后
class UserService {
  createUser() {}
  updateUser() {}
  deleteUser() {}
}

class OrderService {
  createOrder() {}
  updateOrder() {}
  deleteOrder() {}
}

class ProductService {
  createProduct() {}
  updateProduct() {}
  deleteProduct() {}
}

// 反模式2: 紧耦合
// ❌ 错误
class OrderProcessor {
  private paymentGateway = new StripeGateway(); // 直接依赖具体实现

  process(order: Order) {
    this.paymentGateway.charge(order.total);
  }
}

// ✅ 重构后
interface PaymentGateway {
  charge(amount: number): Promise<void>;
}

class OrderProcessor {
  constructor(private paymentGateway: PaymentGateway) {}

  process(order: Order) {
    this.paymentGateway.charge(order.total);
  }
}

// 反模式3: 贫血领域模型
// ❌ 错误
class User {
  id: string;
  email: string;
  password: string;
}

class UserService {
  validatePassword(user: User, password: string): boolean {
    // 验证逻辑在服务中
    return hash(password) === user.password;
  }
}

// ✅ 重构后
class User {
  constructor(
    private id: string,
    private email: string,
    private passwordHash: string
  ) {}

  validatePassword(password: string): boolean {
    return hash(password) === this.passwordHash;
  }
}

// 反模式4: 重复代码
// ❌ 错误
class UserAPI {
  async fetchUsers() {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  }
}

class OrderAPI {
  async fetchOrders() {
    const response = await fetch('/api/orders');
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  }
}

// ✅ 重构后
class APIClient {
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`/api${path}`);
    if (!response.ok) throw new Error(`Failed to fetch ${path}`);
    return response.json();
  }
}

class UserAPI {
  constructor(private client: APIClient) {}

  async fetchUsers() {
    return this.client.get<User[]>('/users');
  }
}

class OrderAPI {
  constructor(private client: APIClient) {}

  async fetchOrders() {
    return this.client.get<Order[]>('/orders');
  }
}
```

---

## 附录：架构决策速查表

### 前端状态管理选择

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| 小型应用 (<10组件) | useState/useContext | 简单，无需额外库 |
| 中型应用 (10-50组件) | Zustand/Jotai | 简洁，性能好 |
| 大型应用 (50+组件) | Redux Toolkit | 生态丰富，调试强 |
| 高频更新 | Signals | 细粒度更新 |
| 复杂异步流 | XState | 状态机清晰 |

### 后端架构选择

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| 快速原型 | Monolith | 开发速度快 |
| 小型团队 (<5人) | Monolith | 协作简单 |
| 大型团队 (20+人) | Microservices | 团队自治 |
| 事件驱动 | Event-Driven | 松耦合 |
| 无服务器 | Serverless | 运维简单 |

### 全栈框架选择

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| React生态 | Next.js | 生态最丰富 |
| Vue生态 | Nuxt | Vue官方支持 |
| 性能优先 | SvelteKit | 编译优化 |
| 内容网站 | Astro | 最小JS |
| 边缘优先 | Next.js + Edge | 最佳边缘支持 |

---

## 总结

本文档全面梳理了现代JavaScript/TypeScript架构设计模型，涵盖：

1. **经典架构风格**：分层架构、六边形架构、洋葱架构、清洁架构
2. **前端架构演进**：MVC/MVVM、Flux、Redux、Zustand/Jotai、Signals、状态机
3. **现代全栈架构**：Next.js App Router、Islands架构、边缘优先、微前端
4. **架构决策**：特性分析、ADR、技术选型矩阵、演进式架构

架构设计没有银弹，关键是根据团队规模、项目复杂度、性能要求和维护成本做出合适的选择。建议：

- 从小处开始，逐步演进
- 记录架构决策（ADR）
- 建立适应度函数自动验证
- 定期回顾和调整

---

*文档版本: 1.0*
*最后更新: 2024年*
