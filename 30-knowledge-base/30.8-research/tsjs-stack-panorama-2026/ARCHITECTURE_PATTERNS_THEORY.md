---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# 软件架构模式理论全景

> 本文档系统梳理现代软件架构的核心模式，从形式化定义到实践应用，为架构设计提供理论支撑。

---

## 目录

- [软件架构模式理论全景](#软件架构模式理论全景)
  - [目录](#目录)
  - [1. 分层架构（Layered Architecture）](#1-分层架构layered-architecture)
    - [1.1 形式化定义](#11-形式化定义)
    - [1.2 架构图](#12-架构图)
    - [1.3 优缺点分析](#13-优缺点分析)
    - [1.4 适用场景](#14-适用场景)
    - [1.5 代码示例](#15-代码示例)
  - [2. 六边形架构（Hexagonal Architecture）](#2-六边形架构hexagonal-architecture)
    - [2.1 理论基础](#21-理论基础)
    - [2.2 架构图](#22-架构图)
    - [2.3 优缺点分析](#23-优缺点分析)
    - [2.4 适用场景](#24-适用场景)
    - [2.5 代码示例](#25-代码示例)
  - [3. 洋葱架构（Onion Architecture）](#3-洋葱架构onion-architecture)
    - [3.1 依赖规则形式化](#31-依赖规则形式化)
    - [3.2 架构图](#32-架构图)
    - [3.3 优缺点分析](#33-优缺点分析)
    - [3.4 适用场景](#34-适用场景)
    - [3.5 代码示例](#35-代码示例)
  - [4. 清洁架构（Clean Architecture）](#4-清洁架构clean-architecture)
    - [4.1 同心圆模型](#41-同心圆模型)
    - [4.2 架构图](#42-架构图)
    - [4.3 优缺点分析](#43-优缺点分析)
    - [4.4 适用场景](#44-适用场景)
    - [4.5 代码示例](#45-代码示例)
  - [5. 微服务架构（Microservices Architecture）](#5-微服务架构microservices-architecture)
    - [5.1 拆分理论与耦合度量](#51-拆分理论与耦合度量)
    - [5.2 架构图](#52-架构图)
    - [5.3 优缺点分析](#53-优缺点分析)
    - [5.4 适用场景](#54-适用场景)
    - [5.5 代码示例](#55-代码示例)
  - [7. CQRS 模式](#7-cqrs-模式)
    - [7.1 命令查询分离理论](#71-命令查询分离理论)
    - [7.2 架构图](#72-架构图)
    - [7.3 优缺点分析](#73-优缺点分析)
    - [7.4 适用场景](#74-适用场景)
    - [7.5 代码示例](#75-代码示例)
  - [8. Saga 分布式事务](#8-saga-分布式事务)
    - [8.1 补偿理论](#81-补偿理论)
    - [8.2 架构图](#82-架构图)
    - [8.3 优缺点分析](#83-优缺点分析)
    - [8.4 适用场景](#84-适用场景)
    - [8.5 代码示例](#85-代码示例)
  - [9. 前端架构演进](#9-前端架构演进)
    - [9.1 理论发展脉络](#91-理论发展脉络)
    - [9.2 架构演进图](#92-架构演进图)
    - [9.3 各阶段优缺点](#93-各阶段优缺点)
    - [9.4 适用场景](#94-适用场景)
    - [9.5 代码示例](#95-代码示例)
  - [10. 架构决策记录（ADR）](#10-架构决策记录adr)
    - [10.1 理论基础](#101-理论基础)
    - [10.2 ADR 模板结构](#102-adr-模板结构)
    - [10.3 优缺点分析](#103-优缺点分析)
    - [10.4 适用场景](#104-适用场景)
    - [10.5 代码示例](#105-代码示例)
  - [总结](#总结)

---

## 1. 分层架构（Layered Architecture）

### 1.1 形式化定义

分层架构将系统划分为若干水平层次，每层对上层提供服务，对下层进行封装。

**形式化表达：**

```
设系统 S = {L₁, L₂, ..., Lₙ}，其中 Lᵢ 表示第 i 层

约束条件：
∀i,j: i < j → Lⱼ 可以依赖 Lᵢ
∀i,j: i > j → Lⱼ 不可依赖 Lᵢ

数据流：Lₙ → Lₙ₋₁ → ... → L₂ → L₁
```

### 1.2 架构图

```
┌─────────────────────────────────────────┐
│           表现层 (Presentation)          │  ← UI/Controller/API
│     [Web/API/Mobile/Desktop]            │
├─────────────────────────────────────────┤
│           业务逻辑层 (Business)          │  ← Use Cases/Services
│     [Domain Logic/Workflow]             │
├─────────────────────────────────────────┤
│           数据访问层 (Data Access)       │  ← Repository/DAO
│     [Database/Cache/External API]       │
├─────────────────────────────────────────┤
│           基础设施层 (Infrastructure)    │  ← DB/File/Network
│     [Persistence/Logging/Messaging]     │
└─────────────────────────────────────────┘

数据流向：
请求: 表现层 → 业务层 → 数据层 → 基础设施
响应: 基础设施 → 数据层 → 业务层 → 表现层
```

### 1.3 优缺点分析

| 优点 | 缺点 |
|------|------|
| 职责分离清晰，易于理解 | 层间通信开销 |
| 便于团队协作开发 | 可能导致贫血领域模型 |
| 易于测试各层独立 | 业务逻辑分散在各层 |
| 技术栈可逐层替换 | 深层调用影响性能 |

### 1.4 适用场景

- **传统企业应用**：ERP、CRM 等业务逻辑清晰的系统
- **快速原型开发**：需要快速交付的项目
- **团队技能分层**：前后端技能分离的团队

### 1.5 代码示例

```typescript
// ==================== 表现层 (Presentation Layer) ====================
// controller/UserController.ts
import { UserService } from '../service/UserService';

export class UserController {
  constructor(private userService: UserService) {}

  async createUser(req: Request, res: Response) {
    const { name, email } = req.body;
    const user = await this.userService.createUser(name, email);
    res.json(user);
  }
}

// ==================== 业务逻辑层 (Business Layer) ====================
// service/UserService.ts
import { UserRepository } from '../repository/UserRepository';
import { User } from '../domain/User';

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async createUser(name: string, email: string): Promise<User> {
    // 业务规则验证
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = new User(name, email);
    return this.userRepo.save(user);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// ==================== 数据访问层 (Data Access Layer) ====================
// repository/UserRepository.ts
import { User } from '../domain/User';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

// repository/impl/UserRepositoryImpl.ts
import { PrismaClient } from '@prisma/client';

export class UserRepositoryImpl implements UserRepository {
  private prisma = new PrismaClient();

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ where: { id } });
    return data ? this.toDomain(data) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ where: { email } });
    return data ? this.toDomain(data) : null;
  }

  async save(user: User): Promise<User> {
    const data = await this.prisma.user.create({
      data: { name: user.name, email: user.email }
    });
    return this.toDomain(data);
  }

  private toDomain(data: any): User {
    return new User(data.name, data.email, data.id);
  }
}

// ==================== 领域层 (Domain Layer) ====================
// domain/User.ts
export class User {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly id?: string
  ) {}
}
```

---

## 2. 六边形架构（Hexagonal Architecture）

### 2.1 理论基础

六边形架构（又称端口与适配器架构）由 Alistair Cockburn 提出，核心思想是将应用程序与外部环境解耦。

**核心概念：**

- **端口（Ports）**：应用程序定义的接口，表示与外部交互的契约
- **适配器（Adapters）**：端口的具体实现，连接外部技术

**形式化定义：**

```
设应用程序核心 C = {Domain, UseCases}
设外部技术集合 E = {DB, UI, API, ...}
设端口集合 P = {Primary Ports, Secondary Ports}
设适配器集合 A = {Drivers, Driven}

依赖关系：
A → P ← C
即：适配器依赖端口，核心通过端口与外部通信

关键约束：
∀e ∈ E: e 只能通过适配器与 C 交互
C 不直接依赖任何 e ∈ E
```

### 2.2 架构图

```
                    ┌─────────────────┐
                    │   Web Driver    │ ← HTTP 适配器
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Primary Port   │ ← 入站端口 (UseCase Interface)
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        │         ┌──────────▼──────────┐         │
        │         │                     │         │
        │         │   Application Core  │         │
        │         │                     │         │
        │         │  ┌───────────────┐  │         │
        │         │  │ Domain Logic  │  │         │
        │         │  │  (Entities)   │  │         │
        │         │  └───────────────┘  │         │
        │         │                     │         │
        │         │  ┌───────────────┐  │         │
        │         │  │  Use Cases    │  │         │
        │         │  │ (Application) │  │         │
        │         │  └───────────────┘  │         │
        │         │                     │         │
        │         └──────────┬──────────┘         │
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │ Secondary Port  │ ← 出站端口 (Repository Interface)
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐   ┌────────▼────────┐   ┌──────▼──────┐
│   Database    │   │  Message Queue  │   │ External API│
│   Adapter     │   │    Adapter      │   │   Adapter   │
└───────────────┘   └─────────────────┘   └─────────────┘

六边形寓意：应用程序有多个面（端口），每个面可以有多个适配器
```

### 2.3 优缺点分析

| 优点 | 缺点 |
|------|------|
| 核心业务逻辑完全独立 | 初期设计复杂度高 |
| 易于替换外部技术 | 增加抽象层带来间接性 |
| 便于测试（使用 Mock 适配器） | 需要更多代码和接口 |
| 技术决策可延迟 | 团队需要理解端口概念 |

### 2.4 适用场景

- **长期维护的项目**：需要应对技术演进的系统
- **多交付渠道应用**：同一核心业务支持 Web、Mobile、CLI
- **测试驱动开发**：需要高度可测试性的项目

### 2.5 代码示例

```typescript
// ==================== 领域层 (Domain) ====================
// domain/Order.ts
export class Order {
  private items: OrderItem[] = [];
  private status: OrderStatus = 'pending';

  constructor(public readonly id: string, public readonly customerId: string) {}

  addItem(productId: string, quantity: number, price: number): void {
    if (quantity <= 0) throw new Error('Quantity must be positive');
    this.items.push({ productId, quantity, price });
  }

  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  confirm(): void {
    if (this.items.length === 0) throw new Error('Cannot confirm empty order');
    this.status = 'confirmed';
  }

  getStatus(): OrderStatus {
    return this.status;
  }
}

type OrderItem = { productId: string; quantity: number; price: number };
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'cancelled';

// ==================== 应用层 - 入站端口 (Primary Ports) ====================
// application/ports/in/CreateOrderUseCase.ts
export interface CreateOrderUseCase {
  execute(command: CreateOrderCommand): Promise<OrderResult>;
}

export interface CreateOrderCommand {
  customerId: string;
  items: { productId: string; quantity: number; price: number }[];
}

export interface OrderResult {
  orderId: string;
  total: number;
  status: string;
}

// ==================== 应用层 - 出站端口 (Secondary Ports) ====================
// application/ports/out/OrderRepository.ts
import { Order } from '../../../domain/Order';

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}

// application/ports/out/PaymentGateway.ts
export interface PaymentGateway {
  processPayment(amount: number, customerId: string): Promise<PaymentResult>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// application/ports/out/NotificationService.ts
export interface NotificationService {
  notifyOrderCreated(customerId: string, orderId: string): Promise<void>;
}

// ==================== 应用层 - 用例实现 ====================
// application/services/CreateOrderService.ts
import { CreateOrderUseCase, CreateOrderCommand, OrderResult } from '../ports/in/CreateOrderUseCase';
import { OrderRepository } from '../ports/out/OrderRepository';
import { PaymentGateway } from '../ports/out/PaymentGateway';
import { NotificationService } from '../ports/out/NotificationService';
import { Order } from '../../domain/Order';

export class CreateOrderService implements CreateOrderUseCase {
  constructor(
    private orderRepo: OrderRepository,
    private paymentGateway: PaymentGateway,
    private notificationService: NotificationService
  ) {}

  async execute(command: CreateOrderCommand): Promise<OrderResult> {
    // 1. 创建领域对象
    const order = new Order(this.generateId(), command.customerId);

    // 2. 执行业务逻辑
    for (const item of command.items) {
      order.addItem(item.productId, item.quantity, item.price);
    }

    const total = order.calculateTotal();

    // 3. 处理支付
    const payment = await this.paymentGateway.processPayment(total, command.customerId);
    if (!payment.success) {
      throw new Error(`Payment failed: ${payment.error}`);
    }

    // 4. 确认订单
    order.confirm();

    // 5. 持久化
    await this.orderRepo.save(order);

    // 6. 发送通知
    await this.notificationService.notifyOrderCreated(command.customerId, order.id);

    return {
      orderId: order.id,
      total,
      status: order.getStatus()
    };
  }

  private generateId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ==================== 适配器 - 入站适配器 (驱动适配器) ====================
// adapter/in/web/OrderController.ts
import { CreateOrderUseCase, CreateOrderCommand } from '../../../application/ports/in/CreateOrderUseCase';

export class OrderController {
  constructor(private createOrderUseCase: CreateOrderUseCase) {}

  async handleCreateOrder(req: Request, res: Response) {
    try {
      const command: CreateOrderCommand = {
        customerId: req.body.customerId,
        items: req.body.items
      };

      const result = await this.createOrderUseCase.execute(command);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

// ==================== 适配器 - 出站适配器 (被驱动适配器) ====================
// adapter/out/persistence/PrismaOrderRepository.ts
import { OrderRepository } from '../../../application/ports/out/OrderRepository';
import { Order } from '../../../domain/Order';
import { PrismaClient } from '@prisma/client';

export class PrismaOrderRepository implements OrderRepository {
  private prisma = new PrismaClient();

  async save(order: Order): Promise<void> {
    await this.prisma.order.create({
      data: {
        id: order.id,
        customerId: order.customerId,
        status: order.getStatus(),
        items: {
          create: []  // 简化示例
        }
      }
    });
  }

  async findById(id: string): Promise<Order | null> {
    const data = await this.prisma.order.findUnique({ where: { id } });
    if (!data) return null;

    const order = new Order(data.id, data.customerId);
    return order;
  }
}

// adapter/out/payment/StripePaymentAdapter.ts
import { PaymentGateway, PaymentResult } from '../../../application/ports/out/PaymentGateway';
import Stripe from 'stripe';

export class StripePaymentAdapter implements PaymentGateway {
  private stripe = new Stripe(process.env.STRIPE_KEY!, { apiVersion: '2023-10-16' });

  async processPayment(amount: number, customerId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // 转换为分
        currency: 'usd',
        customer: customerId
      });

      return {
        success: true,
        transactionId: paymentIntent.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// adapter/out/notification/EmailNotificationAdapter.ts
import { NotificationService } from '../../../application/ports/out/NotificationService';

export class EmailNotificationAdapter implements NotificationService {
  async notifyOrderCreated(customerId: string, orderId: string): Promise<void> {
    // 发送邮件通知
    console.log(`Sending email to customer ${customerId} about order ${orderId}`);
  }
}

// ==================== 配置与依赖注入 ====================
// config/DependencyContainer.ts
import { CreateOrderService } from '../application/services/CreateOrderService';
import { OrderController } from '../adapter/in/web/OrderController';
import { PrismaOrderRepository } from '../adapter/out/persistence/PrismaOrderRepository';
import { StripePaymentAdapter } from '../adapter/out/payment/StripePaymentAdapter';
import { EmailNotificationAdapter } from '../adapter/out/notification/EmailNotificationAdapter';

export class DependencyContainer {
  // 出站适配器 (Secondary Adapters)
  private orderRepository = new PrismaOrderRepository();
  private paymentGateway = new StripePaymentAdapter();
  private notificationService = new EmailNotificationAdapter();

  // 应用服务
  private createOrderService = new CreateOrderService(
    this.orderRepository,
    this.paymentGateway,
    this.notificationService
  );

  // 入站适配器 (Primary Adapters)
  public orderController = new OrderController(this.createOrderService);
}
```

---

## 3. 洋葱架构（Onion Architecture）

### 3.1 依赖规则形式化

洋葱架构由 Jeffrey Palermo 提出，强调依赖关系指向中心。

**形式化定义：**

```
设系统为同心圆结构 C = {C₁, C₂, C₃, C₄}，从内到外：
C₁ = Domain Model (领域模型)
C₂ = Domain Services (领域服务)
C₃ = Application Services (应用服务)
C₄ = Infrastructure (基础设施)

依赖规则（Dependency Rule）：
∀i,j: i < j → Cᵢ 不可依赖 Cⱼ
∀i,j: i > j → Cᵢ 可以依赖 Cⱼ

即：依赖方向只能向内，指向领域核心
```

### 3.2 架构图

```
                     ┌─────────────┐
                     │   UI/API    │  ← 外层：接口适配器
                     │  [Adapter]  │
                     ├─────────────┤
                     │ Application │  ← 应用服务
                     │  Services   │
                     ├─────────────┤
                     │   Domain    │  ← 领域服务
                     │  Services   │
                     ├─────────────┤
                     │    Domain   │  ← 核心：领域模型
                     │    Model    │
                     └─────────────┘

依赖方向：→ → → → 向内指向核心

┌─────────────────────────────────────────┐
│              Infrastructure             │
│         ┌───────────────────┐           │
│         │   Application     │           │
│         │   ┌───────────┐   │           │
│         │   │  Domain   │   │           │
│         │   │  Services │   │           │
│         │   │ ┌───────┐ │   │           │
│         │   │ │Domain │ │   │           │
│         │   │ │ Model │ │   │           │
│         │   │ └───────┘ │   │           │
│         │   └───────────┘   │           │
│         └───────────────────┘           │
└─────────────────────────────────────────┘
```

### 3.3 优缺点分析

| 优点 | 缺点 |
|------|------|
| 领域模型完全纯净 | 学习曲线陡峭 |
| 业务逻辑高度可复用 | 小型项目可能过度设计 |
| 外部依赖完全隔离 | 需要依赖注入支持 |
| 便于单元测试 | 分层粒度需要经验把握 |

### 3.4 适用场景

- **领域驱动设计（DDD）项目**：需要丰富领域模型的系统
- **复杂业务逻辑**：规则多、变化频繁的业务
- **长期演进系统**：业务规则需要不断迭代优化

### 3.5 代码示例

```typescript
// ==================== 核心层：领域模型 (Domain Model) ====================
// core/domain/entities/Customer.ts
export class Customer {
  private constructor(
    public readonly id: string,
    private name: string,
    private email: string,
    private loyaltyPoints: number = 0
  ) {}

  static create(name: string, email: string): Customer {
    if (!name || name.length < 2) {
      throw new Error('Invalid customer name');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }
    return new Customer(crypto.randomUUID(), name, email, 0);
  }

  addLoyaltyPoints(points: number): void {
    if (points < 0) throw new Error('Points cannot be negative');
    this.loyaltyPoints += points;
  }

  canRedeem(points: number): boolean {
    return this.loyaltyPoints >= points;
  }

  redeemPoints(points: number): void {
    if (!this.canRedeem(points)) {
      throw new Error('Insufficient loyalty points');
    }
    this.loyaltyPoints -= points;
  }

  getLoyaltyPoints(): number {
    return this.loyaltyPoints;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }
}

// core/domain/entities/Product.ts
export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    private price: number,
    private stock: number
  ) {
    if (price < 0) throw new Error('Price cannot be negative');
    if (stock < 0) throw new Error('Stock cannot be negative');
  }

  reserve(quantity: number): void {
    if (quantity > this.stock) {
      throw new Error('Insufficient stock');
    }
    this.stock -= quantity;
  }

  release(quantity: number): void {
    this.stock += quantity;
  }

  getPrice(): number {
    return this.price;
  }

  getStock(): number {
    return this.stock;
  }
}

// core/domain/value-objects/Money.ts
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'USD'
  ) {
    if (amount < 0) throw new Error('Money amount cannot be negative');
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }
}

// ==================== 中间层：领域服务 (Domain Services) ====================
// core/domain/services/PricingService.ts
import { Money } from '../value-objects/Money';
import { Customer } from '../entities/Customer';

export class PricingService {
  calculateDiscountedPrice(
    basePrice: Money,
    customer: Customer,
    quantity: number
  ): Money {
    let discountRate = 0;

    // 批量折扣
    if (quantity >= 10) discountRate += 0.1;
    if (quantity >= 50) discountRate += 0.15;

    // 会员折扣
    if (customer.getLoyaltyPoints() > 1000) discountRate += 0.05;

    const discountedAmount = basePrice.amount * (1 - Math.min(discountRate, 0.3));
    return new Money(discountedAmount, basePrice.currency);
  }
}

// core/domain/repositories/ICustomerRepository.ts
import { Customer } from '../entities/Customer';

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  save(customer: Customer): Promise<void>;
}

// core/domain/repositories/IProductRepository.ts
import { Product } from '../entities/Product';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  save(product: Product): Promise<void>;
}

// ==================== 外层：应用服务 (Application Services) ====================
// core/application/services/OrderApplicationService.ts
import { ICustomerRepository } from '../../domain/repositories/ICustomerRepository';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { PricingService } from '../../domain/services/PricingService';
import { Money } from '../../domain/value-objects/Money';

export interface CreateOrderRequest {
  customerId: string;
  items: { productId: string; quantity: number }[];
}

export interface CreateOrderResponse {
  orderId: string;
  totalAmount: number;
  discountApplied: number;
}

export class OrderApplicationService {
  constructor(
    private customerRepo: ICustomerRepository,
    private productRepo: IProductRepository,
    private pricingService: PricingService
  ) {}

  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    // 1. 加载聚合根
    const customer = await this.customerRepo.findById(request.customerId);
    if (!customer) throw new Error('Customer not found');

    // 2. 处理订单项
    let totalAmount = new Money(0);
    const originalAmount = new Money(0);

    for (const item of request.items) {
      const product = await this.productRepo.findById(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      // 领域行为：预留库存
      product.reserve(item.quantity);
      await this.productRepo.save(product);

      // 计算价格
      const itemPrice = new Money(product.getPrice() * item.quantity);
      originalAmount.add(itemPrice);

      const discountedPrice = this.pricingService.calculateDiscountedPrice(
        itemPrice,
        customer,
        item.quantity
      );
      totalAmount = totalAmount.add(discountedPrice);
    }

    // 3. 奖励积分
    customer.addLoyaltyPoints(Math.floor(totalAmount.amount / 10));
    await this.customerRepo.save(customer);

    const discountApplied = originalAmount.amount - totalAmount.amount;

    return {
      orderId: crypto.randomUUID(),
      totalAmount: totalAmount.amount,
      discountApplied
    };
  }
}

// ==================== 最外层：基础设施 (Infrastructure) ====================
// infrastructure/persistence/PrismaCustomerRepository.ts
import { ICustomerRepository } from '../../../core/domain/repositories/ICustomerRepository';
import { Customer } from '../../../core/domain/entities/Customer';
import { PrismaClient } from '@prisma/client';

export class PrismaCustomerRepository implements ICustomerRepository {
  private prisma = new PrismaClient();

  async findById(id: string): Promise<Customer | null> {
    const data = await this.prisma.customer.findUnique({ where: { id } });
    if (!data) return null;

    return Customer.create(data.name, data.email);
  }

  async save(customer: Customer): Promise<void> {
    await this.prisma.customer.upsert({
      where: { id: customer.id },
      update: {
        name: customer.getName(),
        email: customer.getEmail(),
        loyaltyPoints: customer.getLoyaltyPoints()
      },
      create: {
        id: customer.id,
        name: customer.getName(),
        email: customer.getEmail(),
        loyaltyPoints: customer.getLoyaltyPoints()
      }
    });
  }
}

// infrastructure/persistence/InMemoryProductRepository.ts
import { IProductRepository } from '../../../core/domain/repositories/IProductRepository';
import { Product } from '../../../core/domain/entities/Product';

export class InMemoryProductRepository implements IProductRepository {
  private products = new Map<string, Product>();

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  async save(product: Product): Promise<void> {
    this.products.set(product.id, product);
  }

  // 测试辅助方法
  seed(product: Product): void {
    this.products.set(product.id, product);
  }
}

// ==================== 依赖注入配置 ====================
// infrastructure/config/Container.ts
import { OrderApplicationService } from '../../core/application/services/OrderApplicationService';
import { PricingService } from '../../core/domain/services/PricingService';
import { PrismaCustomerRepository } from '../persistence/PrismaCustomerRepository';
import { InMemoryProductRepository } from '../persistence/InMemoryProductRepository';

export class Container {
  // 基础设施层（最外层）
  public customerRepository = new PrismaCustomerRepository();
  public productRepository = new InMemoryProductRepository();

  // 领域服务层
  public pricingService = new PricingService();

  // 应用服务层
  public orderService = new OrderApplicationService(
    this.customerRepository,
    this.productRepository,
    this.pricingService
  );
}
```



---

## 4. 清洁架构（Clean Architecture）

### 4.1 同心圆模型

清洁架构由 Robert C. Martin（Uncle Bob）提出，是洋葱架构的进一步发展。

**形式化定义：**

```
系统由四个同心圆层级构成：
L₁ (Entities): 企业级业务规则
L₂ (Use Cases): 应用级业务规则
L₃ (Interface Adapters): 接口适配
L₄ (Frameworks & Drivers): 外部框架

依赖规则（The Dependency Rule）:
源代码依赖只能向内指向更高层级的策略
∀A,B: 如果 A 在 B 的外部，则 A 依赖 B

数据流向：
控制器 → 用例 → 实体 → 用例 → 展示器
```

### 4.2 架构图

```
         ┌─────────────────────────────────────────┐
         │         Frameworks & Drivers           │
         │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
         │  │  Web │ │  DB  │ │Ext.  │ │Device│  │
         │  │Frame │ │      │ │API   │ │      │  │
         │  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘  │
         └─────┼────────┼────────┼────────┼──────┘
               │        │        │        │
         ┌─────┴────────┴────────┴────────┴──────┐
         │      Interface Adapters               │
         │  ┌───────────────────────────────┐   │
         │  │  Controllers │   Presenters   │   │
         │  └──────────────┴───────────────┘   │
         │  ┌───────────────────────────────┐   │
         │  │      Gateways │   DTOs        │   │
         │  └──────────────┴───────────────┘   │
         └───────────────┬─────────────────────┘
                         │
         ┌───────────────┴─────────────────────┐
         │          Use Cases                  │
         │  ┌───────────────────────────────┐  │
         │  │  Interactor │   Input/Output  │  │
         │  │   (Flow)    │    Boundaries   │  │
         │  └─────────────┴─────────────────┘  │
         └───────────────┬─────────────────────┘
                         │
         ┌───────────────┴─────────────────────┐
         │            Entities                 │
         │  ┌───────────────────────────────┐  │
         │  │   Enterprise Business Rules   │  │
         │  │   (Critical Business Data)    │  │
         │  └───────────────────────────────┘  │
         └─────────────────────────────────────┘

依赖方向：向内（←）
跨越边界时：使用依赖倒置原则（DIP）
```

### 4.3 优缺点分析

| 优点 | 缺点 |
|------|------|
| 独立于框架 | 学习成本较高 |
| 可测试性极强 | 项目结构复杂 |
| 独立于 UI | 初始开发速度较慢 |
| 独立于数据库 | 需要团队纪律性 |
| 独立于外部服务 | 可能过度设计 |

### 4.4 适用场景

- **企业级应用**：生命周期长、业务复杂的系统
- **微服务核心**：需要清晰边界的服务
- **遗留系统现代化**：需要隔离技术债务

### 4.5 代码示例

```typescript
// ==================== 第1层：Entities（实体层）====================
// entities/User.ts
export class User {
  private constructor(
    public readonly id: string,
    private email: string,
    private passwordHash: string,
    private roles: string[]
  ) {}

  static create(email: string, passwordHash: string): User {
    return new User(crypto.randomUUID(), email, passwordHash, ['user']);
  }

  canAccess(resource: string): boolean {
    return this.roles.includes('admin') || this.roles.includes(resource);
  }

  promoteToAdmin(): void {
    if (!this.roles.includes('admin')) {
      this.roles.push('admin');
    }
  }

  getEmail(): string {
    return this.email;
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }
}

// entities/Order.ts
import { Money } from './Money';

export class Order {
  private items: OrderLine[] = [];
  private status: OrderStatus = 'pending';

  constructor(
    public readonly id: string,
    public readonly userId: string
  ) {}

  addItem(productId: string, quantity: number, unitPrice: Money): void {
    this.items.push({ productId, quantity, unitPrice });
  }

  calculateTotal(): Money {
    return this.items.reduce(
      (sum, item) => sum.add(item.unitPrice.multiply(item.quantity)),
      new Money(0)
    );
  }

  submit(): void {
    if (this.items.length === 0) {
      throw new Error('Cannot submit empty order');
    }
    this.status = 'submitted';
  }

  getStatus(): OrderStatus {
    return this.status;
  }
}

type OrderLine = { productId: string; quantity: number; unitPrice: Money };
type OrderStatus = 'pending' | 'submitted' | 'paid' | 'shipped';

// entities/Money.ts
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'USD'
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error('Currency mismatch');
    }
  }
}

// ==================== 第2层：Use Cases（用例层）====================
// usecases/boundaries/CreateOrderInput.ts
export interface CreateOrderInput {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    currency: string;
  }>;
}

// usecases/boundaries/CreateOrderOutput.ts
export interface CreateOrderOutput {
  orderId: string;
  totalAmount: number;
  currency: string;
  status: string;
}

// usecases/boundaries/IOrderRepository.ts
import { Order } from '../../entities/Order';

export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}

// usecases/boundaries/IPaymentGateway.ts
export interface IPaymentGateway {
  charge(amount: number, currency: string, token: string): Promise<PaymentResult>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
}

// usecases/interactors/CreateOrderUseCase.ts
import { Order } from '../../entities/Order';
import { Money } from '../../entities/Money';
import { CreateOrderInput } from '../boundaries/CreateOrderInput';
import { CreateOrderOutput } from '../boundaries/CreateOrderOutput';
import { IOrderRepository } from '../boundaries/IOrderRepository';
import { IPaymentGateway } from '../boundaries/IPaymentGateway';

export class CreateOrderUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private paymentGateway: IPaymentGateway
  ) {}

  async execute(input: CreateOrderInput, paymentToken: string): Promise<CreateOrderOutput> {
    // 1. 创建实体
    const order = new Order(crypto.randomUUID(), input.userId);

    // 2. 添加订单项
    for (const item of input.items) {
      const unitPrice = new Money(item.unitPrice, item.currency);
      order.addItem(item.productId, item.quantity, unitPrice);
    }

    // 3. 计算总价
    const total = order.calculateTotal();

    // 4. 处理支付
    const payment = await this.paymentGateway.charge(
      total.amount,
      total.currency,
      paymentToken
    );

    if (!payment.success) {
      throw new Error(`Payment failed: ${payment.errorMessage}`);
    }

    // 5. 提交订单
    order.submit();

    // 6. 持久化
    await this.orderRepo.save(order);

    return {
      orderId: order.id,
      totalAmount: total.amount,
      currency: total.currency,
      status: order.getStatus()
    };
  }
}

// ==================== 第3层：Interface Adapters（接口适配层）====================
// adapters/controllers/CreateOrderController.ts
import { CreateOrderUseCase } from '../../../usecases/interactors/CreateOrderUseCase';
import { CreateOrderInput } from '../../../usecases/boundaries/CreateOrderInput';

export interface HttpRequest {
  body: any;
  headers: any;
}

export interface HttpResponse {
  statusCode: number;
  body: any;
}

export class CreateOrderController {
  constructor(private useCase: CreateOrderUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const input: CreateOrderInput = {
        userId: request.body.userId,
        items: request.body.items
      };

      const paymentToken = request.headers['x-payment-token'];
      const result = await this.useCase.execute(input, paymentToken);

      return {
        statusCode: 201,
        body: {
          success: true,
          data: result
        }
      };
    } catch (error) {
      return {
        statusCode: 400,
        body: {
          success: false,
          error: error.message
        }
      };
    }
  }
}

// adapters/presenters/CreateOrderPresenter.ts
import { CreateOrderOutput } from '../../../usecases/boundaries/CreateOrderOutput';

export interface OrderViewModel {
  orderId: string;
  total: string;
  status: string;
}

export class CreateOrderPresenter {
  present(output: CreateOrderOutput): OrderViewModel {
    return {
      orderId: output.orderId,
      total: `${output.currency} ${output.totalAmount.toFixed(2)}`,
      status: output.status.toUpperCase()
    };
  }
}

// adapters/gateways/PrismaOrderRepository.ts
import { IOrderRepository } from '../../../usecases/boundaries/IOrderRepository';
import { Order } from '../../../entities/Order';
import { Money } from '../../../entities/Money';
import { PrismaClient } from '@prisma/client';

export class PrismaOrderRepository implements IOrderRepository {
  private prisma = new PrismaClient();

  async save(order: Order): Promise<void> {
    await this.prisma.order.create({
      data: {
        id: order.id,
        userId: order.userId,
        status: order.getStatus(),
        totalAmount: order.calculateTotal().amount,
        currency: order.calculateTotal().currency
      }
    });
  }

  async findById(id: string): Promise<Order | null> {
    const data = await this.prisma.order.findUnique({ where: { id } });
    if (!data) return null;

    const order = new Order(data.id, data.userId);
    return order;
  }
}

// adapters/gateways/StripePaymentGateway.ts
import { IPaymentGateway, PaymentResult } from '../../../usecases/boundaries/IPaymentGateway';
import Stripe from 'stripe';

export class StripePaymentGateway implements IPaymentGateway {
  private stripe = new Stripe(process.env.STRIPE_KEY!, { apiVersion: '2023-10-16' });

  async charge(amount: number, currency: string, token: string): Promise<PaymentResult> {
    try {
      const charge = await this.stripe.charges.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        source: token
      });

      return {
        success: charge.status === 'succeeded',
        transactionId: charge.id
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error.message
      };
    }
  }
}

// ==================== 第4层：Frameworks & Drivers（框架层）====================
// frameworks/express/routes.ts
import express from 'express';
import { CreateOrderController } from '../../adapters/controllers/CreateOrderController';
import { CreateOrderUseCase } from '../../usecases/interactors/CreateOrderUseCase';
import { PrismaOrderRepository } from '../../adapters/gateways/PrismaOrderRepository';
import { StripePaymentGateway } from '../../adapters/gateways/StripePaymentGateway';

const router = express.Router();

// 依赖注入（通常在单独的容器/模块中）
const orderRepository = new PrismaOrderRepository();
const paymentGateway = new StripePaymentGateway();
const createOrderUseCase = new CreateOrderUseCase(orderRepository, paymentGateway);
const createOrderController = new CreateOrderController(createOrderUseCase);

router.post('/orders', async (req, res) => {
  const response = await createOrderController.handle({
    body: req.body,
    headers: req.headers
  });
  res.status(response.statusCode).json(response.body);
});

export default router;

// ==================== 依赖倒置原则体现 =====================
// 注意：高层（Use Cases）定义接口，低层（Adapters）实现接口
// usecases/boundaries/ 定义的所有接口都由 adapters/gateways/ 实现
// 这样高层不依赖于低层，两者都依赖于抽象（接口）
```

---

## 5. 微服务架构（Microservices Architecture）

### 5.1 拆分理论与耦合度量

**形式化定义：**

```
设系统 S = {M₁, M₂, ..., Mₙ}，其中 Mᵢ 为微服务

拆分原则：
∀Mᵢ: Mᵢ 应满足高内聚低耦合
Cohesion(Mᵢ) → max
Coupling(Mᵢ, Mⱼ) → min (i ≠ j)

耦合度量指标：
1. 响应耦合：API 调用频率
2. 数据耦合：共享数据库表数量
3. 时间耦合：同步调用链长度
4. 空间耦合：共享库/配置数量

服务边界定义（有界上下文）：
Mᵢ = {Domainᵢ, Dataᵢ, APIᵢ, Teamᵢ}
其中 Domainᵢ ∩ Domainⱼ = ∅ (理想情况下)
```

### 5.2 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway                          │
│         [Routing/Auth/Rate Limiting/Caching]                │
└───────────┬───────────────┬───────────────┬─────────────────┘
            │               │               │
    ┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │  User        │ │  Order      │ │  Inventory  │
    │  Service     │ │  Service    │ │  Service    │
    │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐│
    │ │  Domain  │ │ │ │  Domain  │ │ │ │  Domain  ││
    │ │   Logic  │ │ │ │   Logic  │ │ │ │   Logic  ││
    │ └──────────┘ │ │ └──────────┘ │ │ └──────────┘│
    │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐│
    │ │   Own    │ │ │ │   Own    │ │ │ │   Own    ││
    │ │ Database │ │ │ │ Database │ │ │ │ Database ││
    │ └──────────┘ │ │ └──────────┘ │ │ └──────────┘│
    └──────┬───────┘ └──────┬───────┘ └──────┬──────┘
           │                │                │
           └────────────────┴────────────────┘
                         │
              ┌──────────▼──────────┐
              │   Message Broker    │
              │ (Async Communication)│
              └─────────────────────┘

服务间通信方式：
1. 同步：REST/gRPC (查询、简单操作)
2. 异步：消息队列 (事件驱动、削峰)
3. 混合：Saga (分布式事务)

┌──────────────────────────────────────────────────────┐
│                   Service Mesh                       │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐          │
│  │ Sidecar │◄──►│ Sidecar │◄──►│ Sidecar │          │
│  │  Proxy  │    │  Proxy  │    │  Proxy  │          │
│  └───┬─────┘    └────┬────┘    └────┬────┘          │
│      │               │               │               │
│  ┌───▼─────┐    ┌────▼────┐    ┌────▼────┐          │
│  │Service A│    │Service B│    │Service C│          │
│  └─────────┘    └─────────┘    └─────────┘          │
└──────────────────────────────────────────────────────┘
```

### 5.3 优缺点分析

| 优点 | 缺点 |
|------|------|
| 独立部署和扩展 | 分布式系统复杂性 |
| 技术栈多样化 | 数据一致性挑战 |
| 故障隔离 | 网络延迟和开销 |
| 团队自治 | 运维复杂度高 |
| 可伸缩性 | 测试复杂度增加 |

### 5.4 适用场景

- **大型组织**：多个团队并行开发
- **复杂领域**：不同业务领域变化速率不同
- **云原生应用**：需要弹性伸缩的系统
- **遗留系统拆分**：单体应用现代化

### 5.5 代码示例

```typescript
// ==================== 服务定义与接口 ====================
// shared/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped';
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

// shared/events.ts
export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  occurredAt: Date;
  payload: any;
}

export interface OrderCreatedEvent extends DomainEvent {
  eventType: 'OrderCreated';
  payload: {
    orderId: string;
    userId: string;
    items: OrderItem[];
    total: number;
  };
}

// ==================== User Service ====================
// user-service/domain/User.ts
export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public name: string,
    private passwordHash: string
  ) {}

  static create(email: string, name: string, passwordHash: string): User {
    return new User(crypto.randomUUID(), email, name, passwordHash);
  }

  updateName(newName: string): void {
    if (newName.length < 2) {
      throw new Error('Name too short');
    }
    this.name = newName;
  }
}

// user-service/ports/UserRepository.ts
import { User } from '../domain/User';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

// user-service/application/UserService.ts
import { User } from '../domain/User';
import { UserRepository } from '../ports/UserRepository';

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async register(email: string, name: string, password: string): Promise<User> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }

    const passwordHash = await this.hashPassword(password);
    const user = User.create(email, name, passwordHash);
    await this.userRepo.save(user);

    return user;
  }

  async getUser(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  private async hashPassword(password: string): Promise<string> {
    // 简化示例
    return `hash(${password})`;
  }
}

// user-service/adapters/HttpUserController.ts
import { UserService } from '../application/UserService';

export class HttpUserController {
  constructor(private userService: UserService) {}

  async handleRegister(req: any, res: any) {
    try {
      const user = await this.userService.register(
        req.body.email,
        req.body.name,
        req.body.password
      );
      res.status(201).json({ id: user.id, email: user.email, name: user.name });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

// ==================== Order Service ====================
// order-service/domain/Order.ts
export class Order {
  private items: OrderItem[] = [];
  private status: OrderStatus = 'pending';

  constructor(
    public readonly id: string,
    public readonly userId: string
  ) {}

  static create(userId: string): Order {
    return new Order(crypto.randomUUID(), userId);
  }

  addItem(productId: string, quantity: number, price: number): void {
    this.items.push({ productId, quantity, price });
  }

  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  confirm(): void {
    if (this.items.length === 0) {
      throw new Error('Cannot confirm empty order');
    }
    this.status = 'paid';
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  getItems(): OrderItem[] {
    return [...this.items];
  }
}

type OrderItem = { productId: string; quantity: number; price: number };
type OrderStatus = 'pending' | 'paid' | 'shipped';

// order-service/ports/OrderRepository.ts
import { Order } from '../domain/Order';

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}

// order-service/ports/UserServiceClient.ts
export interface UserServiceClient {
  validateUser(userId: string): Promise<boolean>;
  getUser(userId: string): Promise<{ id: string; email: string } | null>;
}

// order-service/ports/EventPublisher.ts
import { DomainEvent } from '../../shared/events';

export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
}

// order-service/application/OrderService.ts
import { Order } from '../domain/Order';
import { OrderRepository } from '../ports/OrderRepository';
import { UserServiceClient } from '../ports/UserServiceClient';
import { EventPublisher } from '../ports/EventPublisher';

export class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private userClient: UserServiceClient,
    private eventPublisher: EventPublisher
  ) {}

  async createOrder(userId: string, items: Array<{ productId: string; quantity: number; price: number }>): Promise<Order> {
    // 1. 验证用户存在
    const userExists = await this.userClient.validateUser(userId);
    if (!userExists) {
      throw new Error('User not found');
    }

    // 2. 创建订单
    const order = Order.create(userId);
    for (const item of items) {
      order.addItem(item.productId, item.quantity, item.price);
    }

    // 3. 持久化
    await this.orderRepo.save(order);

    // 4. 发布事件（异步通知其他服务）
    await this.eventPublisher.publish({
      eventId: crypto.randomUUID(),
      eventType: 'OrderCreated',
      aggregateId: order.id,
      occurredAt: new Date(),
      payload: {
        orderId: order.id,
        userId: order.userId,
        items: order.getItems(),
        total: order.calculateTotal()
      }
    });

    return order;
  }

  async confirmPayment(orderId: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.confirm();
    await this.orderRepo.save(order);

    // 发布支付确认事件
    await this.eventPublisher.publish({
      eventId: crypto.randomUUID(),
      eventType: 'OrderPaid',
      aggregateId: order.id,
      occurredAt: new Date(),
      payload: {
        orderId: order.id,
        userId: order.userId,
        total: order.calculateTotal()
      }
    });
  }
}

// order-service/adapters/HttpUserServiceClient.ts
import { UserServiceClient } from '../ports/UserServiceClient';

export class HttpUserServiceClient implements UserServiceClient {
  private baseUrl = process.env.USER_SERVICE_URL || 'http://user-service:3001';

  async validateUser(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getUser(userId: string): Promise<{ id: string; email: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`);
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }
}

// order-service/adapters/KafkaEventPublisher.ts
import { EventPublisher } from '../ports/EventPublisher';
import { DomainEvent } from '../../shared/events';
import { Kafka } from 'kafkajs';

export class KafkaEventPublisher implements EventPublisher {
  private kafka = new Kafka({
    clientId: 'order-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
  });
  private producer = this.kafka.producer();

  async publish(event: DomainEvent): Promise<void> {
    await this.producer.connect();
    await this.producer.send({
      topic: `events.${event.eventType}`,
      messages: [
        {
          key: event.aggregateId,
          value: JSON.stringify(event)
        }
      ]
    });
    await this.producer.disconnect();
  }
}

// ==================== Inventory Service (事件消费者) ====================
// inventory-service/adapters/KafkaEventConsumer.ts
import { Kafka } from 'kafkajs';
import { InventoryService } from '../application/InventoryService';

export class KafkaEventConsumer {
  private kafka = new Kafka({
    clientId: 'inventory-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
  });
  private consumer = this.kafka.consumer({ groupId: 'inventory-service' });

  constructor(private inventoryService: InventoryService) {}

  async start(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'events.OrderCreated' });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const event = JSON.parse(message.value!.toString());

        // 预留库存
        for (const item of event.payload.items) {
          await this.inventoryService.reserveStock(
            item.productId,
            item.quantity,
            event.payload.orderId
          );
        }
      }
    });
  }
}

// ==================== API Gateway ====================
// gateway/server.ts
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// 路由配置
const routes = {
  '/api/users': 'http://user-service:3001',
  '/api/orders': 'http://order-service:3002',
  '/api/inventory': 'http://inventory-service:3003'
};

// 认证中间件
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // 验证 token...
  next();
};

// 设置代理
Object.entries(routes).forEach(([path, target]) => {
  app.use(
    path,
    authMiddleware,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { [`^${path}`]: '' }
    })
  );
});

app.listen(3000, () => {
  console.log('API Gateway running on port 3000');
});
```


---

## 7. CQRS 模式

### 7.1 命令查询分离理论

CQRS（Command Query Responsibility Segregation）将读操作和写操作分离到不同的模型。

**形式化定义：**

```
设系统有两类操作：
- Commands C = {c | c 会改变系统状态}
- Queries Q = {q | q 不会改变系统状态}

传统架构：单一模型 M 处理 C 和 Q
M × (C ∪ Q) → (State, Result)

CQRS 架构：分离模型
- Command Model M_c 处理写操作
- Query Model M_q 处理读操作

M_c × C → State  (异步同步到 M_q)
M_q × Q → Result

数据同步：
State_c ──[Event]──> Projection ──> State_q
```

### 7.2 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                               │
└───────────┬───────────────────────────────┬─────────────────┘
            │ Commands                      │ Queries
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────────┐
│   Command Handler     │       │      Query Handler        │
│   (Write Model)       │       │      (Read Model)         │
├───────────────────────┤       ├───────────────────────────┤
│ - Validate            │       │ - Optimize for reads      │
│ - Enforce invariants  │       │ - Denormalized data       │
│ - Create events       │       │ - Multiple projections    │
└───────────┬───────────┘       └───────────┬───────────────┘
            │                               │
            ▼                               │
┌───────────────────────┐                   │
│    Event Store        │                   │
│   (Source of Truth)   │                   │
└───────────┬───────────┘                   │
            │                               │
            │ Events                        │
            ▼                               │
┌───────────────────────┐                   │
│    Event Processor    │                   │
│   (Projection Engine) │                   │
└───────────┬───────────┘                   │
            │ Projections                   │
            ▼                               │
┌───────────────────────┐◄──────────────────┘
│    Read Database      │
│  (Optimized Views)    │
└───────────────────────┘

同步策略：
1. 同步：事务内更新（强一致性）
2. 异步：事件驱动（最终一致性）

模型对比：
┌─────────────────┬──────────────────┐
│  Command Model  │   Query Model    │
├─────────────────┼──────────────────┤
│ 规范化          │ 反规范化         │
│ 聚合根          │ 扁平 DTO         │
│ 验证规则        │ 无业务逻辑       │
│ 事件溯源        │ 物化视图         │
│ 写入优化        │ 读取优化         │
└─────────────────┴──────────────────┘
```

### 7.3 优缺点分析

| 优点 | 缺点 |
|------|------|
| 读写独立优化 | 系统复杂度增加 |
| 读模型可多样化 | 数据一致性挑战 |
| 写入端可精简 | 需要处理延迟 |
| 便于扩展读端 | 代码重复风险 |
| 天然支持事件溯源 | 学习曲线 |

### 7.4 适用场景

- **读多写少**：读频率远高于写频率
- **复杂查询**：需要多种查询模式
- **高性能需求**：读写需要不同优化策略
- **团队协作**：读写团队可分离

### 7.5 代码示例

```typescript
// ==================== 命令端 (Write Side) ====================
// commands/CreateProductCommand.ts
export interface CreateProductCommand {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  initialStock: number;
}

// commands/UpdatePriceCommand.ts
export interface UpdatePriceCommand {
  productId: string;
  newPrice: number;
  reason: string;
}

// domain/Product.ts
export class Product {
  private events: ProductEvent[] = [];

  constructor(
    public readonly id: string,
    private name: string,
    private description: string,
    private price: number,
    private category: string,
    private stock: number
  ) {}

  static create(
    id: string,
    name: string,
    description: string,
    price: number,
    category: string,
    stock: number
  ): Product {
    return new Product(id, name, description, price, category, stock);
  }

  updatePrice(newPrice: number, reason: string): void {
    if (newPrice < 0) {
      throw new Error('Price cannot be negative');
    }

    this.price = newPrice;
    this.events.push({
      type: 'PriceUpdated',
      payload: { productId: this.id, newPrice, reason, timestamp: new Date() }
    });
  }

  adjustStock(quantity: number): void {
    this.stock += quantity;
    this.events.push({
      type: 'StockAdjusted',
      payload: { productId: this.id, newStock: this.stock, adjustment: quantity }
    });
  }

  getUncommittedEvents(): ProductEvent[] {
    return this.events;
  }

  clearEvents(): void {
    this.events = [];
  }
}

interface ProductEvent {
  type: string;
  payload: any;
}

// application/ProductCommandHandler.ts
import { Product } from '../domain/Product';

export interface ProductWriteRepository {
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
}

export interface EventPublisher {
  publish(event: any): Promise<void>;
}

export class ProductCommandHandler {
  constructor(
    private productRepo: ProductWriteRepository,
    private eventPublisher: EventPublisher
  ) {}

  async handleCreateProduct(command: CreateProductCommand): Promise<void> {
    const product = Product.create(
      command.productId,
      command.name,
      command.description,
      command.price,
      command.category,
      command.initialStock
    );

    await this.productRepo.save(product);

    // 发布领域事件
    await this.eventPublisher.publish({
      type: 'ProductCreated',
      payload: {
        productId: command.productId,
        name: command.name,
        price: command.price,
        category: command.category
      }
    });
  }

  async handleUpdatePrice(command: UpdatePriceCommand): Promise<void> {
    const product = await this.productRepo.findById(command.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    product.updatePrice(command.newPrice, command.reason);
    await this.productRepo.save(product);

    // 发布价格变更事件
    for (const event of product.getUncommittedEvents()) {
      await this.eventPublisher.publish(event);
    }
    product.clearEvents();
  }
}

// ==================== 查询端 (Read Side) ====================
// queries/ProductQuery.ts
export interface ProductSearchQuery {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface ProductDetailQuery {
  productId: string;
}

// queries/ProductView.ts
export interface ProductListView {
  productId: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  thumbnailUrl: string;
}

export interface ProductDetailView {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  priceHistory: Array<{ price: number; date: Date }>;
}

// queries/ProductQueryHandler.ts
export interface ProductReadRepository {
  search(query: ProductSearchQuery): Promise<{ items: ProductListView[]; total: number }>;
  getDetail(productId: string): Promise<ProductDetailView | null>;
  getByCategory(category: string): Promise<ProductListView[]>;
  getPriceHistory(productId: string): Promise<Array<{ price: number; date: Date }>>;
}

export class ProductQueryHandler {
  constructor(private readRepo: ProductReadRepository) {}

  async handleSearch(query: ProductSearchQuery): Promise<{ items: ProductListView[]; total: number }> {
    return this.readRepo.search(query);
  }

  async handleGetDetail(query: ProductDetailQuery): Promise<ProductDetailView | null> {
    return this.readRepo.getDetail(query.productId);
  }
}

// ==================== 投影处理器 (Projections) ====================
// projections/ProductProjectionHandler.ts
export interface ProductReadModel {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  inStock: boolean;
  thumbnailUrl: string;
  images: string[];
  priceHistory: Array<{ price: number; date: Date; reason?: string }>;
  updatedAt: Date;
}

export interface ReadModelStore {
  insert(product: ProductReadModel): Promise<void>;
  update(productId: string, updates: Partial<ProductReadModel>): Promise<void>;
  findById(productId: string): Promise<ProductReadModel | null>;
  search(criteria: any): Promise<ProductReadModel[]>;
}

export class ProductProjectionHandler {
  constructor(private readStore: ReadModelStore) {}

  // 处理 ProductCreated 事件
  async handleProductCreated(event: any): Promise<void> {
    const readModel: ProductReadModel = {
      productId: event.payload.productId,
      name: event.payload.name,
      description: event.payload.description || '',
      price: event.payload.price,
      category: event.payload.category,
      stock: event.payload.initialStock || 0,
      inStock: (event.payload.initialStock || 0) > 0,
      thumbnailUrl: '',
      images: [],
      priceHistory: [{
        price: event.payload.price,
        date: new Date(),
        reason: 'Initial price'
      }],
      updatedAt: new Date()
    };

    await this.readStore.insert(readModel);
  }

  // 处理 PriceUpdated 事件
  async handlePriceUpdated(event: any): Promise<void> {
    const product = await this.readStore.findById(event.payload.productId);
    if (!product) return;

    const priceHistoryEntry = {
      price: event.payload.newPrice,
      date: event.payload.timestamp,
      reason: event.payload.reason
    };

    await this.readStore.update(event.payload.productId, {
      price: event.payload.newPrice,
      priceHistory: [...product.priceHistory, priceHistoryEntry],
      updatedAt: new Date()
    });
  }

  // 处理 StockAdjusted 事件
  async handleStockAdjusted(event: any): Promise<void> {
    await this.readStore.update(event.payload.productId, {
      stock: event.payload.newStock,
      inStock: event.payload.newStock > 0,
      updatedAt: new Date()
    });
  }
}

// ==================== 具体实现示例 ====================
// infrastructure/ElasticsearchProductReadRepository.ts
import { Client } from '@elastic/elasticsearch';

export class ElasticsearchProductReadRepository implements ProductReadRepository {
  private client = new Client({ node: process.env.ELASTICSEARCH_URL });
  private index = 'products';

  async search(query: ProductSearchQuery): Promise<{ items: ProductListView[]; total: number }> {
    const must: any[] = [];

    if (query.keyword) {
      must.push({
        multi_match: {
          query: query.keyword,
          fields: ['name^2', 'description']
        }
      });
    }

    if (query.category) {
      must.push({ term: { category: query.category } });
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      must.push({
        range: {
          price: {
            gte: query.minPrice,
            lte: query.maxPrice
          }
        }
      });
    }

    const result = await this.client.search({
      index: this.index,
      from: (query.page - 1) * query.pageSize,
      size: query.pageSize,
      sort: [{ [query.sortBy || 'name']: query.sortOrder || 'asc' }],
      query: { bool: { must } }
    });

    const items = result.hits.hits.map((hit: any) => ({
      productId: hit._id,
      name: hit._source.name,
      price: hit._source.price,
      category: hit._source.category,
      inStock: hit._source.inStock,
      thumbnailUrl: hit._source.thumbnailUrl
    }));

    return {
      items,
      total: (result.hits.total as any).value
    };
  }

  async getDetail(productId: string): Promise<ProductDetailView | null> {
    try {
      const result = await this.client.get({
        index: this.index,
        id: productId
      });

      return {
        productId: result._id,
        name: result._source.name,
        description: result._source.description,
        price: result._source.price,
        category: result._source.category,
        stock: result._source.stock,
        images: result._source.images,
        priceHistory: result._source.priceHistory
      };
    } catch {
      return null;
    }
  }

  async getByCategory(category: string): Promise<ProductListView[]> {
    const result = await this.client.search({
      index: this.index,
      query: { term: { category } }
    });

    return result.hits.hits.map((hit: any) => ({
      productId: hit._id,
      name: hit._source.name,
      price: hit._source.price,
      category: hit._source.category,
      inStock: hit._source.inStock,
      thumbnailUrl: hit._source.thumbnailUrl
    }));
  }

  async getPriceHistory(productId: string): Promise<Array<{ price: number; date: Date }>> {
    const result = await this.client.get({
      index: this.index,
      id: productId
    });

    return result._source.priceHistory || [];
  }
}

// ==================== 控制器 ====================
// api/ProductController.ts
export class ProductController {
  constructor(
    private commandHandler: ProductCommandHandler,
    private queryHandler: ProductQueryHandler
  ) {}

  // 命令端点
  async createProduct(req: any, res: any): Promise<void> {
    try {
      const command: CreateProductCommand = req.body;
      await this.commandHandler.handleCreateProduct(command);
      res.status(201).json({ success: true });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async updatePrice(req: any, res: any): Promise<void> {
    try {
      const command: UpdatePriceCommand = {
        productId: req.params.id,
        ...req.body
      };
      await this.commandHandler.handleUpdatePrice(command);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // 查询端点
  async searchProducts(req: any, res: any): Promise<void> {
    const query: ProductSearchQuery = {
      keyword: req.query.q,
      category: req.query.category,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      page: parseInt(req.query.page) || 1,
      pageSize: parseInt(req.query.pageSize) || 20,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };

    const result = await this.queryHandler.handleSearch(query);
    res.json(result);
  }

  async getProductDetail(req: any, res: any): Promise<void> {
    const query: ProductDetailQuery = { productId: req.params.id };
    const detail = await this.queryHandler.handleGetDetail(query);

    if (!detail) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(detail);
  }
}
```

---

## 8. Saga 分布式事务

### 8.1 补偿理论

Saga 模式将长事务拆分为本地事务序列，通过补偿操作处理失败。

**形式化定义：**

```
Saga 定义为一个有序对 S = (T, C)，其中：
T = [t₁, t₂, ..., tₙ] 是本地事务序列
C = [c₁, c₂, ..., cₙ] 是补偿事务序列

tᵢ 与 cᵢ 的关系：
∀i: cᵢ 撤销 tᵢ 的效果，即 compose(tᵢ, cᵢ) = identity

执行流程：
成功: t₁ → t₂ → ... → tₙ
失败: t₁ → t₂ → ... → tₖ(失败) → cₖ₋₁ → ... → c₂ → c₁

补偿语义：
- 可补偿事务 (Compensatable): 可撤销的操作
- 枢轴事务 (Pivot): 不可撤销的关键点
- 可重试事务 (Retryable): 保证最终成功的操作
```

### 8.2 架构图

```
编排式 Saga (Choreography):
┌──────────┐   OrderCreated   ┌──────────┐
│  Order   │─────────────────>│ Payment  │
│ Service  │                  │ Service  │
└──────────┘                  └────┬─────┘
                                   │ PaymentCompleted
                                   ▼
┌──────────┐   StockReserved   ┌──────────┐
│ Inventory│<──────────────────│ Payment  │
│ Service  │                  │          │
└────┬─────┘                  └──────────┘
     │ StockConfirmed
     ▼
┌──────────┐
│ Shipping │
│ Service  │
└──────────┘

协调式 Saga (Orchestration):
┌─────────────────────────────────────────┐
│           Saga Orchestrator             │
│  ┌───────────────────────────────────┐  │
│  │ 1. Create Order                   │  │
│  │ 2. Process Payment                │  │
│  │ 3. Reserve Stock                  │  │
│  │ 4. Ship Order                     │  │
│  └───────────────────────────────────┘  │
└──────┬────────────┬────────────┬────────┘
       │            │            │
       ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│  Order   │ │ Payment  │ │ Inventory│
│ Service  │ │ Service  │ │ Service  │
└──────────┘ └──────────┘ └──────────┘

补偿流程示例：
成功: Create ──> Pay ──> Reserve ──> Ship
                    │
失败: Create ──> Pay(X)
         │         │
         └─ Compensate ──> Cancel Order
                    │
                    └─ Refund
```

### 8.3 优缺点分析

| 优点 | 缺点 |
|------|------|
| 避免分布式锁 | 最终一致性 |
| 服务松耦合 | 补偿逻辑复杂 |
| 支持长时间事务 | 故障排查困难 |
| 高可用性 | 可能产生中间状态 |
| 可扩展性好 | 需要幂等设计 |

### 8.4 适用场景

- **电商订单**：订单->支付->库存->物流
- **金融转账**：扣款->清算->入账
- **旅行预订**：机票->酒店->租车
- **任何跨服务事务**

### 8.5 代码示例

```typescript
// ==================== Saga 核心定义 ====================
// saga/types.ts
export interface SagaContext {
  sagaId: string;
  currentStep: number;
  data: Record<string, any>;
  results: Record<number, any>;
}

export interface SagaStep {
  name: string;
  execute: (context: SagaContext) => Promise<any>;
  compensate?: (context: SagaContext, result: any) => Promise<void>;
  isPivot?: boolean;  // 枢轴事务标志
}

export interface SagaDefinition {
  name: string;
  steps: SagaStep[];
}

// ==================== Saga 编排器 ====================
// saga/SagaOrchestrator.ts
export class SagaOrchestrator {
  private activeSagas = new Map<string, SagaContext>();

  async executeSaga(definition: SagaDefinition, initialData: Record<string, any>): Promise<SagaContext> {
    const sagaId = crypto.randomUUID();
    const context: SagaContext = {
      sagaId,
      currentStep: 0,
      data: initialData,
      results: {}
    };

    this.activeSagas.set(sagaId, context);

    try {
      for (let i = 0; i < definition.steps.length; i++) {
        const step = definition.steps[i];
        context.currentStep = i;

        console.log(`[Saga ${sagaId}] Executing step ${i}: ${step.name}`);

        try {
          const result = await step.execute(context);
          context.results[i] = result;
        } catch (error) {
          console.error(`[Saga ${sagaId}] Step ${i} failed: ${error.message}`);

          // 如果是枢轴事务失败，无法补偿，直接抛出
          if (step.isPivot) {
            throw new Error(`Pivot step failed, cannot compensate: ${error.message}`);
          }

          // 执行补偿
          await this.compensate(definition, context, i);
          throw new Error(`Saga failed at step ${step.name}: ${error.message}`);
        }
      }

      console.log(`[Saga ${sagaId}] Completed successfully`);
      return context;
    } finally {
      this.activeSagas.delete(sagaId);
    }
  }

  private async compensate(
    definition: SagaDefinition,
    context: SagaContext,
    failedStep: number
  ): Promise<void> {
    console.log(`[Saga ${context.sagaId}] Starting compensation`);

    // 逆向补偿已完成的步骤
    for (let i = failedStep - 1; i >= 0; i--) {
      const step = definition.steps[i];
      if (step.compensate) {
        try {
          console.log(`[Saga ${context.sagaId}] Compensating step ${i}: ${step.name}`);
          await step.compensate(context, context.results[i]);
        } catch (error) {
          // 补偿失败需要人工介入或重试
          console.error(`[Saga ${context.sagaId}] Compensation failed for step ${step.name}: ${error.message}`);
          // 记录到待处理队列
          await this.logCompensationFailure(context, step, error);
        }
      }
    }
  }

  private async logCompensationFailure(
    context: SagaContext,
    step: SagaStep,
    error: Error
  ): Promise<void> {
    // 记录到数据库或发送告警
    console.error({
      type: 'COMPENSATION_FAILURE',
      sagaId: context.sagaId,
      stepName: step.name,
      error: error.message,
      timestamp: new Date()
    });
  }
}

// ==================== 订单 Saga 实现 ====================
// sagas/OrderSaga.ts
import { SagaDefinition, SagaStep, SagaContext } from '../saga/types';

// 服务接口
interface OrderService {
  createOrder(userId: string, items: any[]): Promise<{ orderId: string }>;
  cancelOrder(orderId: string): Promise<void>;
}

interface PaymentService {
  processPayment(orderId: string, amount: number, paymentMethod: string): Promise<{ paymentId: string }>;
  refund(paymentId: string): Promise<void>;
}

interface InventoryService {
  reserveStock(orderId: string, items: any[]): Promise<{ reservationId: string }>;
  releaseStock(reservationId: string): Promise<void>;
}

interface ShippingService {
  createShipment(orderId: string, address: any): Promise<{ shipmentId: string }>;
}

export class OrderSaga {
  constructor(
    private orderService: OrderService,
    private paymentService: PaymentService,
    private inventoryService: InventoryService,
    private shippingService: ShippingService
  ) {}

  getDefinition(): SagaDefinition {
    return {
      name: 'OrderProcessingSaga',
      steps: [
        // Step 1: 创建订单
        {
          name: 'CreateOrder',
          execute: async (ctx: SagaContext) => {
            const result = await this.orderService.createOrder(
              ctx.data.userId,
              ctx.data.items
            );
            // 将订单ID保存到上下文供后续步骤使用
            ctx.data.orderId = result.orderId;
            return result;
          },
          compensate: async (ctx: SagaContext, result: any) => {
            await this.orderService.cancelOrder(result.orderId);
          }
        },

        // Step 2: 处理支付 (枢轴事务 - 一旦支付成功，订单不能简单取消)
        {
          name: 'ProcessPayment',
          execute: async (ctx: SagaContext) => {
            const total = ctx.data.items.reduce(
              (sum: number, item: any) => sum + item.price * item.quantity,
              0
            );
            return await this.paymentService.processPayment(
              ctx.data.orderId,
              total,
              ctx.data.paymentMethod
            );
          },
          compensate: async (ctx: SagaContext, result: any) => {
            await this.paymentService.refund(result.paymentId);
          },
          isPivot: true
        },

        // Step 3: 预留库存
        {
          name: 'ReserveStock',
          execute: async (ctx: SagaContext) => {
            return await this.inventoryService.reserveStock(
              ctx.data.orderId,
              ctx.data.items
            );
          },
          compensate: async (ctx: SagaContext, result: any) => {
            await this.inventoryService.releaseStock(result.reservationId);
          }
        },

        // Step 4: 创建物流 (最终操作，无需补偿)
        {
          name: 'CreateShipment',
          execute: async (ctx: SagaContext) => {
            return await this.shippingService.createShipment(
              ctx.data.orderId,
              ctx.data.shippingAddress
            );
          }
        }
      ]
    };
  }
}

// ==================== Saga 状态机 ====================
// saga/SagaStateMachine.ts
type SagaState = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'COMPENSATING' | 'FAILED' | 'COMPENSATED';

interface SagaInstance {
  sagaId: string;
  definitionName: string;
  state: SagaState;
  currentStep: number;
  data: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
}

export class SagaStateMachine {
  private instances = new Map<string, SagaInstance>();

  createInstance(sagaId: string, definitionName: string, data: Record<string, any>): SagaInstance {
    const instance: SagaInstance = {
      sagaId,
      definitionName,
      state: 'PENDING',
      currentStep: 0,
      data,
      startedAt: new Date()
    };
    this.instances.set(sagaId, instance);
    return instance;
  }

  transition(sagaId: string, newState: SagaState): void {
    const instance = this.instances.get(sagaId);
    if (!instance) throw new Error('Saga instance not found');

    const validTransitions: Record<SagaState, SagaState[]> = {
      'PENDING': ['RUNNING'],
      'RUNNING': ['COMPLETED', 'COMPENSATING', 'FAILED'],
      'COMPENSATING': ['COMPENSATED', 'FAILED'],
      'COMPLETED': [],
      'FAILED': [],
      'COMPENSATED': []
    };

    if (!validTransitions[instance.state].includes(newState)) {
      throw new Error(`Invalid transition from ${instance.state} to ${newState}`);
    }

    instance.state = newState;
    if (newState === 'COMPLETED' || newState === 'FAILED' || newState === 'COMPENSATED') {
      instance.completedAt = new Date();
    }
  }

  getInstance(sagaId: string): SagaInstance | undefined {
    return this.instances.get(sagaId);
  }
}

// ==================== 使用示例 ====================
// examples/OrderSagaExample.ts
import { SagaOrchestrator } from '../saga/SagaOrchestrator';
import { OrderSaga } from '../sagas/OrderSaga';

async function example() {
  // 初始化服务（实际项目中使用依赖注入）
  const orderService: OrderService = {
    createOrder: async (userId, items) => ({ orderId: 'ORD-123' }),
    cancelOrder: async (orderId) => console.log(`Order ${orderId} cancelled`)
  };

  const paymentService: PaymentService = {
    processPayment: async (orderId, amount, method) => ({ paymentId: 'PAY-456' }),
    refund: async (paymentId) => console.log(`Payment ${paymentId} refunded`)
  };

  const inventoryService: InventoryService = {
    reserveStock: async (orderId, items) => ({ reservationId: 'RES-789' }),
    releaseStock: async (reservationId) => console.log(`Stock ${reservationId} released`)
  };

  const shippingService: ShippingService = {
    createShipment: async (orderId, address) => ({ shipmentId: 'SHP-000' })
  };

  // 创建 Saga
  const orderSaga = new OrderSaga(orderService, paymentService, inventoryService, shippingService);
  const orchestrator = new SagaOrchestrator();

  // 执行 Saga
  try {
    const result = await orchestrator.executeSaga(orderSaga.getDefinition(), {
      userId: 'user-001',
      items: [
        { productId: 'PROD-1', quantity: 2, price: 100 },
        { productId: 'PROD-2', quantity: 1, price: 50 }
      ],
      paymentMethod: 'credit_card',
      shippingAddress: { city: 'Beijing', street: 'Main St' }
    });

    console.log('Order processed successfully:', result);
  } catch (error) {
    console.error('Order processing failed:', error.message);
  }
}
```



---

## 9. 前端架构演进

### 9.1 理论发展脉络

**形式化演进路径：**

```
MVC → MVVM → Component-Based → Server Components

各阶段核心特征：
MVC:           V = f(M, C)       // 视图是模型和控制的函数
MVVM:          V = f(VM), VM = g(M)  // 视图与视图模型绑定
Component:     UI = Σ Componentᵢ   // 组件组合
Server Comp:   UI = f(props) + g(serverData)  // 服务端渲染组件

复杂度管理演进：
- MVC: 按层分离
- MVVM: 数据绑定自动化
- Component: 按功能/域封装
- Server Comp: 计算位置透明化
```

### 9.2 架构演进图

```
Phase 1: MVC (Model-View-Controller)
┌─────────────────────────────────────────┐
│                View (HTML/CSS)          │
│         用户界面展示                     │
└─────────────────┬───────────────────────┘
                  │ 观察变化
                  ▼
┌─────────────────────────────────────────┐
│              Model (Data)               │
│         业务数据与状态                   │
└───────┬───────────────────┬─────────────┘
        │                   │
        ▼ 用户操作          ▼ 数据更新
┌─────────────────────────────────────────┐
│           Controller (Logic)            │
│         控制逻辑与协调                   │
└─────────────────────────────────────────┘

Phase 2: MVVM (Model-View-ViewModel)
┌─────────────────────────────────────────┐
│                View (DOM)               │
│         声明式模板绑定                   │
└──────────────┬──────────────────────────┘
               │ 双向绑定
               ▼
┌─────────────────────────────────────────┐
│           ViewModel (Reactive)          │
│         数据转换与命令                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│              Model (Domain)             │
│         领域模型与业务逻辑               │
└─────────────────────────────────────────┘

Phase 3: Component-Based (React/Vue/Angular)
┌─────────────────────────────────────────┐
│           Application                   │
│  ┌───────┐ ┌───────┐ ┌───────┐        │
│  │Comp A │ │Comp B │ │Comp C │        │
│  │ ┌───┐ │ │ ┌───┐ │ │ ┌───┐ │        │
│  │ │A1 │ │ │ │B1 │ │ │ │C1 │ │        │
│  │ └───┘ │ │ └───┘ │ │ └───┘ │        │
│  └───────┘ └───────┘ └───────┘        │
│       │         │         │            │
│       └─────────┼─────────┘            │
│                 ▼                      │
│         ┌─────────────┐                │
│         │ Global Store│                │
│         │ (Redux/Pinia)│               │
│         └─────────────┘                │
└─────────────────────────────────────────┘

Phase 4: Server Components
┌─────────────────────────────────────────┐
│              Client                     │
│  ┌─────────────────────────────────┐   │
│  │   Server Component (RSC)        │   │
│  │   - 服务端渲染                   │   │
│  │   - 零Bundle大小                │   │
│  │   - 直接访问数据库               │   │
│  └─────────────┬───────────────────┘   │
│                │ Server Stream         │
│                ▼                       │
│  ┌─────────────────────────────────┐   │
│  │   Client Component              │   │
│  │   - 交互逻辑                    │   │
│  │   - 浏览器API                   │   │
│  │   - useState/useEffect          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

演进趋势：
计算位置：Client ──────────────────────────> Server
数据获取：AJAX ─────> GraphQL ────> Server Direct
状态管理：Global ───> Component ───> Server Cache
渲染方式：CSR ───────> SSR ────────> Streaming
```

### 9.3 各阶段优缺点

| 架构 | 优点 | 缺点 | 代表 |
|------|------|------|------|
| MVC | 职责清晰 | DOM操作繁琐 | Backbone |
| MVVM | 双向绑定 | 调试困难 | Knockout |
| Component | 可复用、声明式 | 学习曲线 | React/Vue |
| Server Comp | 性能优化 | 心智模型复杂 | Next.js 13+ |

### 9.4 适用场景

- **MVC**: 简单页面、传统网站
- **MVVM**: 表单密集型应用
- **Component**: 现代 SPA、复杂交互
- **Server Components**: 内容型应用、SEO 优先

### 9.5 代码示例

```typescript
// ==================== MVC 模式 ====================
// mvc/Model.ts
export class TodoModel {
  private todos: Todo[] = [];
  private listeners: ((todos: Todo[]) => void)[] = [];

  addTodo(text: string): void {
    this.todos.push({ id: Date.now(), text, completed: false });
    this.notify();
  }

  toggleTodo(id: number): void {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.notify();
    }
  }

  subscribe(listener: (todos: Todo[]) => void): void {
    this.listeners.push(listener);
  }

  private notify(): void {
    this.listeners.forEach(l => l([...this.todos]));
  }

  getTodos(): Todo[] {
    return [...this.todos];
  }
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// mvc/View.ts
export class TodoView {
  private app = document.getElementById('app')!;
  private onToggle: (id: number) => void;

  constructor(onToggle: (id: number) => void) {
    this.onToggle = onToggle;
  }

  render(todos: Todo[]): void {
    this.app.innerHTML = `
      <ul>
        ${todos.map(todo => `
          <li class="${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <input type="checkbox" ${todo.completed ? 'checked' : ''}>
            ${todo.text}
          </li>
        `).join('')}
      </ul>
    `;

    this.app.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = Number((e.target as HTMLElement).closest('li')?.dataset.id);
        this.onToggle(id);
      });
    });
  }
}

// mvc/Controller.ts
import { TodoModel } from './Model';
import { TodoView } from './View';

export class TodoController {
  private model: TodoModel;
  private view: TodoView;

  constructor() {
    this.model = new TodoModel();
    this.view = new TodoView(this.handleToggle.bind(this));

    // 订阅模型变化
    this.model.subscribe(this.handleModelChange.bind(this));
  }

  private handleModelChange(todos: Todo[]): void {
    this.view.render(todos);
  }

  private handleToggle(id: number): void {
    this.model.toggleTodo(id);
  }

  init(): void {
    this.view.render(this.model.getTodos());
  }
}

// ==================== MVVM 模式 ====================
// mvvm/ViewModel.ts
import { reactive, computed, watch } from 'vue';

export class TodoViewModel {
  // 响应式状态
  private state = reactive({
    todos: [] as Todo[],
    filter: 'all' as 'all' | 'active' | 'completed'
  });

  // 计算属性
  filteredTodos = computed(() => {
    switch (this.state.filter) {
      case 'active': return this.state.todos.filter(t => !t.completed);
      case 'completed': return this.state.todos.filter(t => t.completed);
      default: return this.state.todos;
    }
  });

  stats = computed(() => ({
    total: this.state.todos.length,
    completed: this.state.todos.filter(t => t.completed).length,
    remaining: this.state.todos.filter(t => !t.completed).length
  }));

  // 命令
  addTodo(text: string): void {
    this.state.todos.push({
      id: Date.now(),
      text,
      completed: false
    });
  }

  toggleTodo(id: number): void {
    const todo = this.state.todos.find(t => t.id === id);
    if (todo) todo.completed = !todo.completed;
  }

  setFilter(filter: 'all' | 'active' | 'completed'): void {
    this.state.filter = filter;
  }

  // 订阅变化（用于调试或持久化）
  subscribe(callback: () => void): void {
    watch(() => this.state.todos, callback, { deep: true });
  }
}

// mvvm/View.vue（Vue 单文件组件）
/*
<template>
  <div>
    <input v-model="newTodo" @keyup.enter="addTodo">
    <ul>
      <li v-for="todo in viewModel.filteredTodos.value" :key="todo.id">
        <input type="checkbox" v-model="todo.completed">
        {{ todo.text }}
      </li>
    </ul>
    <div>
      <button @click="viewModel.setFilter('all')">All</button>
      <button @click="viewModel.setFilter('active')">Active</button>
      <button @click="viewModel.setFilter('completed')">Completed</button>
    </div>
    <p>{{ viewModel.stats.value.remaining }} items remaining</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { TodoViewModel } from './ViewModel';

const viewModel = new TodoViewModel();
const newTodo = ref('');

const addTodo = () => {
  if (newTodo.value.trim()) {
    viewModel.addTodo(newTodo.value);
    newTodo.value = '';
  }
};
</script>
*/

// ==================== Component 模式 (React Hooks) ====================
// components/TodoApp.tsx
import React, { useState, useCallback, useMemo, createContext, useContext } from 'react';

// 类型定义
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// Context 用于依赖注入
interface TodoContextValue {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}

const TodoContext = createContext<TodoContextValue | null>(null);

// 自定义 Hook - 状态管理
function useTodoService(initialTodos: Todo[] = []) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);

  const addTodo = useCallback((text: string) => {
    setTodos(prev => [...prev, {
      id: crypto.randomUUID(),
      text,
      completed: false
    }]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  return { todos, addTodo, toggleTodo, deleteTodo };
}

// 自定义 Hook - 筛选逻辑
function useFilteredTodos(todos: Todo[], filter: 'all' | 'active' | 'completed') {
  return useMemo(() => {
    switch (filter) {
      case 'active': return todos.filter(t => !t.completed);
      case 'completed': return todos.filter(t => t.completed);
      default: return todos;
    }
  }, [todos, filter]);
}

// 原子组件 - TodoItem
interface TodoItemProps {
  todo: Todo;
}

const TodoItem: React.FC<TodoItemProps> = React.memo(({ todo }) => {
  const context = useContext(TodoContext);
  if (!context) throw new Error('TodoItem must be used within TodoProvider');

  return (
    <li className={todo.completed ? 'completed' : ''}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => context.toggleTodo(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => context.deleteTodo(todo.id)}>Delete</button>
    </li>
  );
});

// 容器组件 - TodoList
const TodoList: React.FC = () => {
  const context = useContext(TodoContext);
  if (!context) throw new Error('TodoList must be used within TodoProvider');

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const filteredTodos = useFilteredTodos(context.todos, filter);

  return (
    <div>
      <div>
        {(['all', 'active', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? 'active' : ''}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <ul>
        {filteredTodos.map(todo => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  );
};

// 容器组件 - AddTodo
const AddTodo: React.FC = () => {
  const [text, setText] = useState('');
  const context = useContext(TodoContext);
  if (!context) throw new Error('AddTodo must be used within TodoProvider');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      context.addTodo(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What needs to be done?"
      />
      <button type="submit">Add</button>
    </form>
  );
};

// 应用根组件
export const TodoApp: React.FC = () => {
  const todoService = useTodoService();

  return (
    <TodoContext.Provider value={todoService}>
      <div className="todo-app">
        <h1>Todo List</h1>
        <AddTodo />
        <TodoList />
        <p>{todoService.todos.filter(t => !t.completed).length} items remaining</p>
      </div>
    </TodoContext.Provider>
  );
};

// ==================== Server Components (Next.js App Router) ====================
// app/page.tsx (Server Component)
/*
import { TodoList } from './components/TodoList';
import { AddTodoForm } from './components/AddTodoForm';
import { getTodos, addTodo } from './actions/todoActions';

// 服务端数据获取
async function TodoPage() {
  // 直接查询数据库，零客户端JS
  const todos = await getTodos();

  return (
    <div>
      <h1>Server Todo App</h1>

      {/* 服务端组件 - 纯渲染，无交互 */}
      <TodoList initialTodos={todos} />

      {/* 客户端组件 - 处理表单交互 */}
      <AddTodoForm onAdd={addTodo} />
    </div>
  );
}

export default TodoPage;
*/

// app/components/TodoList.tsx (Server Component)
/*
import { Todo } from '../types';

interface TodoListProps {
  initialTodos: Todo[];
}

// Server Component - 服务端渲染
export function TodoList({ initialTodos }: TodoListProps) {
  return (
    <ul>
      {initialTodos.map(todo => (
        <li key={todo.id} className={todo.completed ? 'completed' : ''}>
          {todo.text}
          {/* Server Component 中可以使用 async/await 直接访问数据库 */}
          <TodoMetadata todoId={todo.id} />
        </li>
      ))}
    </ul>
  );
}

// 嵌套 Server Component
async function TodoMetadata({ todoId }: { todoId: string }) {
  // 直接在服务端获取关联数据
  const metadata = await fetchTodoMetadata(todoId);

  return (
    <span className="metadata">
      Created: {metadata.createdAt.toLocaleDateString()}
    </span>
  );
}
*/

// app/components/AddTodoForm.tsx (Client Component)
/*
'use client';

import { useState } from 'react';

interface AddTodoFormProps {
  onAdd: (text: string) => Promise<void>;
}

// Client Component - 处理交互
export function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [text, setText] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsPending(true);
    await onAdd(text.trim());
    setIsPending(false);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={isPending}
      />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Adding...' : 'Add'}
      </button>
    </form>
  );
}
*/

// app/actions/todoActions.ts (Server Action)
/*
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function getTodos() {
  return prisma.todo.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addTodo(text: string) {
  await prisma.todo.create({
    data: { text, completed: false }
  });

  // 重新验证页面缓存
  revalidatePath('/');
}
*/
```

---

## 10. 架构决策记录（ADR）

### 10.1 理论基础

**形式化定义：**

```
ADR 是一个四元组 A = (C, D, S, T)，其中：
- C (Context): 决策背景与约束
- D (Decision): 所做决策
- S (Status): 决策状态
- T (Trade-offs): 权衡分析

决策生命周期：
PROPOSED → ACCEPTED → DEPRECATED → SUPERSEDED
       ↓
    REJECTED

ADR 图谱：
ADR 之间通过 SUPERSEDES 关系形成有向无环图
```

### 10.2 ADR 模板结构

```
┌─────────────────────────────────────────────────────────────┐
│              Architecture Decision Record                    │
├─────────────────────────────────────────────────────────────┤
│ Title: [简短描述性标题]                                      │
│ Status: [PROPOSED | ACCEPTED | DEPRECATED | SUPERSEDED]     │
│ Date: [YYYY-MM-DD]                                          │
│ Deciders: [参与者列表]                                       │
├─────────────────────────────────────────────────────────────┤
│ 1. Context (背景)                                           │
│    - 问题陈述                                                │
│    - 约束条件                                                │
│    - 驱动因素                                                │
├─────────────────────────────────────────────────────────────┤
│ 2. Decision (决策)                                          │
│    - 所选方案                                                │
│    - 具体实施细节                                            │
├─────────────────────────────────────────────────────────────┤
│ 3. Consequences (后果)                                      │
│    - 正面影响                                                │
│    - 负面影响                                                │
│    - 中性影响                                                │
├─────────────────────────────────────────────────────────────┤
│ 4. Alternatives (备选方案)                                  │
│    - 考虑的替代方案                                          │
│    - 拒绝原因                                                │
├─────────────────────────────────────────────────────────────┤
│ 5. Related (关联)                                           │
│    - 相关 ADR                                                │
│    - 参考文档                                                │
└─────────────────────────────────────────────────────────────┘

ADR 编号体系：
docs/adr/
├── 0001-record-architecture-decisions.md  (元ADR)
├── 0002-adopt-hexagonal-architecture.md
├── 0003-use-postgresql-as-primary-database.md
├── 0004-implement-cqrs-for-order-service.md
└── 0005-migrate-to-microservices.md
```

### 10.3 优缺点分析

| 优点 | 缺点 |
|------|------|
| 决策可追溯 | 需要维护成本 |
| 知识传承 | 可能流于形式 |
| 减少重复讨论 | 需要团队纪律 |
| 促进技术对齐 | 需要定期回顾 |
| 便于审计 | |

### 10.4 适用场景

- **团队规模 > 3 人**：需要共享决策上下文
- **项目生命周期 > 6 月**：决策需要长期维护
- **技术栈复杂**：需要记录选择理由
- **合规要求**：需要审计追踪

### 10.5 代码示例

```markdown
<!-- docs/adr/0001-record-architecture-decisions.md -->
# 1. Record architecture decisions

Date: 2024-01-15

## Status

Accepted

## Context

我们需要记录项目中的架构决策，以确保：
1. 新团队成员能理解系统为何如此设计
2. 避免重复讨论已决定的问题
3. 为未来的架构演进提供历史背景

## Decision

采用 Michael Nygard 提出的架构决策记录（ADR）格式。

每个 ADR 包含：
- 标题和编号
- 状态（提议/已接受/已弃用/已取代）
- 决策背景
- 所做决策
- 后果分析

## Consequences

### 正面
- 决策历史可追踪
- 便于新成员上手
- 减少重复讨论

### 负面
- 需要持续维护
- 可能产生过时文档

---

<!-- docs/adr/0002-use-typescript-for-frontend.md -->
# 2. Use TypeScript for frontend development

Date: 2024-01-20

## Status

Accepted

Supersedes: N/A
Superseded by: N/A

## Context

前端项目需要选择编程语言。当前团队主要使用 JavaScript，但面临以下挑战：
- 运行时错误频繁，尤其是类型相关
- IDE 支持有限，重构困难
- 大型代码库维护成本高

约束条件：
- 团队需要在 2 周内完成迁移
- 需要保持与现有 JavaScript 库的兼容性

## Decision

在前端项目中全面采用 TypeScript。

具体措施：
1. 新项目使用 TypeScript 初始化
2. 现有项目逐步迁移，优先核心模块
3. 严格模式配置 (`strict: true`)
4. 定义共享类型在 `@company/types` 包中

## Consequences

### 正面
- 编译时类型检查减少运行时错误
- 更好的 IDE 支持和自动补全
- 重构更加安全
- 代码自文档化程度提高

### 负面
- 初始开发速度可能降低 10-15%
- 需要团队培训
- 某些遗留库缺少类型定义
- 构建时间略有增加

### 缓解措施
- 提供 TypeScript 培训课程
- 使用 `allowJs` 渐进式迁移
- 为缺失类型的库创建 `.d.ts` 文件

## Alternatives

### 选项 1: 继续使用 JavaScript + JSDoc
- 优点：无迁移成本
- 缺点：类型检查不完整，IDE 支持有限
- 拒绝原因：无法解决核心问题

### 选项 2: 使用 Flow
- 优点：Facebook 支持，与 React 集成好
- 缺点：社区逐渐萎缩，工具链支持不如 TypeScript
- 拒绝原因：长期维护风险

### 选项 3: 使用 ReasonML/Rescript
- 优点：更强的类型系统
- 缺点：学习曲线陡峭，招聘困难
- 拒绝原因：团队成本过高

## Related

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- ADR-0003: Use strict TypeScript configuration

---

<!-- docs/adr/0003-adopt-hexagonal-architecture.md -->
# 3. Adopt Hexagonal Architecture

Date: 2024-02-01

## Status

Accepted

## Context

后端服务正在快速增长，面临以下问题：
- 业务逻辑与框架代码耦合严重
- 单元测试需要大量 Mock 框架
- 切换数据库技术栈成本高
- 核心领域模型被数据模型污染

我们需要一种架构来：
- 隔离业务逻辑与技术细节
- 提高可测试性
- 支持长期演进

## Decision

采用六边形架构（端口与适配器模式）作为后端服务的标准架构。

### 项目结构
```

src/
├── domain/           # 核心业务逻辑
│   ├── entities/
│   ├── value-objects/
│   └── services/
├── application/      # 用例层
│   ├── ports/
│   │   ├── in/      # 入站端口（用例接口）
│   │   └── out/     # 出站端口（仓库接口）
│   └── services/
├── adapters/         # 适配器实现
│   ├── in/          # 入站适配器（控制器）
│   └── out/         # 出站适配器（仓库实现）
└── config/          # 依赖注入配置

```

### 规则
1. 依赖方向只能向内，指向领域层
2. 领域层不依赖任何外部库
3. 通过端口接口与外部交互
4. 每个适配器可独立替换

## Consequences

### 正面
- 核心业务逻辑完全独立于框架
- 单元测试无需数据库或 HTTP 层
- 技术栈变更影响范围可控
- 清晰的模块边界

### 负面
- 初始开发工作量增加
- 需要理解端口/适配器概念
- 更多接口和抽象类
- 简单 CRUD 场景可能显得冗余

### 缓解措施
- 提供架构培训
- 创建项目模板和代码生成器
- 对于简单服务允许适度简化

## Alternatives

### 选项 1: 分层架构
- 优点：简单易懂
- 缺点：业务逻辑容易泄漏到各层
- 拒绝原因：无法解决当前耦合问题

### 选项 2: 清洁架构
- 优点：与六边形类似，更详细的规则
- 缺点：概念较多，学习曲线陡峭
- 拒绝原因：六边形更适合团队当前水平

### 选项 3: DDD 完整实现
- 优点：完整的领域驱动设计
- 缺点：需要更多领域专家和事件风暴
- 拒绝原因：当前项目复杂度不需要完整 DDD

## Related

- ADR-0002: Use TypeScript for frontend development
- [Hexagonal Architecture by Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
```

```typescript
// ==================== ADR 管理工具 ====================
// tools/adr-manager.ts

interface ADRMetadata {
  number: number;
  title: string;
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  date: string;
  tags: string[];
  supersedes?: number[];
  supersededBy?: number;
}

class ADRManager {
  private adrDir: string;

  constructor(adrDir: string = 'docs/adr') {
    this.adrDir = adrDir;
  }

  // 创建新 ADR
  async create(title: string, context: string): Promise<string> {
    const nextNumber = await this.getNextNumber();
    const filename = `${String(nextNumber).padStart(4, '0')}-${this.slugify(title)}.md`;
    const template = this.generateTemplate(nextNumber, title, context);

    // 写入文件
    await Bun.write(`${this.adrDir}/${filename}`, template);

    return filename;
  }

  // 获取下一个编号
  private async getNextNumber(): Promise<number> {
    const files = await Array.fromAsync(Bun.file(this.adrDir).stream());
    const numbers = files
      .map(f => parseInt(f.name!.split('-')[0]))
      .filter(n => !isNaN(n));

    return Math.max(0, ...numbers) + 1;
  }

  // 生成模板
  private generateTemplate(number: number, title: string, context: string): string {
    return `# ${number}. ${title}

Date: ${new Date().toISOString().split('T')[0]}

## Status

Proposed

## Context

${context}

## Decision

TBD

## Consequences

### Positive
-

### Negative
-

## Alternatives

### Option 1:
- Pros:
- Cons:

## Related

-
`;
  }

  // 搜索 ADR
  async search(query: string): Promise<ADRMetadata[]> {
    const allADRs = await this.listAll();
    const lowerQuery = query.toLowerCase();

    return allADRs.filter(adr =>
      adr.title.toLowerCase().includes(lowerQuery) ||
      adr.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }

  // 列出所有 ADR
  async listAll(): Promise<ADRMetadata[]> {
    // 实现略
    return [];
  }

  // 生成 ADR 图谱
  async generateGraph(): Promise<string> {
    const adrs = await this.listAll();
    const lines = ['graph TD'];

    for (const adr of adrs) {
      lines.push(`  ADR${adr.number}["${adr.number}. ${adr.title}"]`);

      if (adr.supersedes) {
        for (const sup of adr.supersedes) {
          lines.push(`  ADR${sup} -.->|superseded by| ADR${adr.number}`);
        }
      }
    }

    return lines.join('\n');
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }
}

// ==================== ADR 验证 ====================
// tools/adr-validator.ts

interface ADRValidationRule {
  name: string;
  validate: (content: string, metadata: ADRMetadata) => string[];
}

const adrValidationRules: ADRValidationRule[] = [
  {
    name: 'required-sections',
    validate: (content) => {
      const required = ['## Status', '## Context', '## Decision', '## Consequences'];
      return required
        .filter(section => !content.includes(section))
        .map(section => `Missing section: ${section}`);
    }
  },
  {
    name: 'valid-status',
    validate: (content, metadata) => {
      const validStatuses = ['proposed', 'accepted', 'deprecated', 'superseded'];
      return validStatuses.includes(metadata.status)
        ? []
        : [`Invalid status: ${metadata.status}`];
    }
  },
  {
    name: 'superseded-consistency',
    validate: (content, metadata) => {
      const issues: string[] = [];

      if (metadata.status === 'superseded' && !metadata.supersededBy) {
        issues.push('Superseded ADR must specify supersededBy');
      }

      if (metadata.supersededBy && metadata.status !== 'superseded') {
        issues.push('ADR with supersededBy must have status superseded');
      }

      return issues;
    }
  }
];

export function validateADR(content: string, metadata: ADRMetadata): string[] {
  return adrValidationRules.flatMap(rule => rule.validate(content, metadata));
}
```

---

## 总结

本文档系统梳理了现代软件架构的十大核心模式：

| 模式 | 核心思想 | 适用规模 |
|------|----------|----------|
| 分层架构 | 水平职责分离 | 小到大型 |
| 六边形架构 | 端口/适配器解耦 | 中到大型 |
| 洋葱架构 | 依赖向内指向核心 | 中到大型 |
| 清洁架构 | 同心圆层级 | 大型 |
| 微服务 | 服务边界拆分 | 大型 |
| 事件溯源 | 事件为中心持久化 | 中到大型 |
| CQRS | 读写分离 | 中到大型 |
| Saga | 补偿事务 | 分布式系统 |
| 前端演进 | 计算位置迁移 | 所有规模 |
| ADR | 决策记录 | 所有规模 |

**架构选择原则：**

1. 从简单开始，按需演进
2. 理解业务复杂度后再做架构决策
3. 团队能力是架构落地的关键因素
4. 架构应支持变更，而非预测未来

---

*文档生成时间: 2024年*
*维护者: 架构团队*
