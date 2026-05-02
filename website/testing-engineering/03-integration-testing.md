---
title: "集成测试：边界与契约"
description: "深入探讨集成测试的形式化策略与接口契约测试理论，全面映射到JS/TS生态的API测试、组件集成测试、数据库测试与契约测试的工程实践，构建可靠的边界验证体系。"
date: 2026-05-01
tags: ["测试工程", "集成测试", "契约测试", "Supertest", "MSW", "TestContainers"]
category: "engineering"
---

# 集成测试：边界与契约

## 引言

单元测试确认了每个齿轮的精密运转，但齿轮的咬合处才是故障的高发地带。集成测试（Integration Testing）关注的就是这些「咬合处」——模块之间的接口、服务之间的契约、组件之间的数据流。在微服务架构与前后端分离已成为默认选项的今天，集成测试的重要性愈发凸显：一个单独测试时完美运行的用户服务，可能在面对真实的订单服务 API 时暴露出序列化不匹配、超时处理不当或事务边界错误等问题。

然而，集成测试也是最容易被误解和误用的测试层级。有人将其视为「大单元测试」，用同样的隔离策略处理却抱怨速度太慢；有人将其当作「小 E2E 测试」，引入真实数据库和外部服务却陷入环境不稳定和数据污染的泥潭。集成测试需要一种独特的思维方式：它既需要单元测试的自动化与快速反馈，又需要 E2E 测试的系统视角与真实边界验证。

本文从集成测试的形式化定义出发，梳理经典的集成策略（Big Bang、Bottom-Up、Top-Down、Sandwich），深入剖析接口契约测试的理论根基，随后全面映射到 JavaScript/TypeScript 生态的工程实践：API 集成测试、组件集成测试、数据库测试环境、契约测试（Pact）与 Docker Compose 测试基础设施。

## 理论严格表述

### 集成测试的形式化定义

集成测试的本质是验证「组合的正确性」（correctness of composition）。设系统由模块集合 $M = \{m_1, m_2, ..., m_n\}$ 构成，每个模块 $m_i$ 具有规格说明 $S_i$ 和实现 $I_i$。单元测试验证了每个模块的局部正确性 $I_i \models S_i$，而集成测试验证的是模块组合 $C(M) = m_1 \circ m_2 \circ ... \circ m_n$ 满足全局规格 $S_{global}$：

$$C(M) \models S_{global}$$

组合正确性的验证之所以困难，是因为模块间的交互引入了新的状态空间。两个各自正确的模块，其笛卡尔积 $State_1 \times State_2$ 中可能包含不可预期的状态组合，这些组合在单元测试中无法被发现。

### 经典集成策略

软件工程文献中定义了四种经典的模块集成策略，它们决定了测试桩（driver）和测试替身（stub）的使用方式：

**1. Big Bang（大爆炸集成）**

所有模块同时集成并进行一次性测试。优点是无需编写驱动和桩模块；缺点是一旦失败，缺陷定位极其困难——任何模块都可能是故障源。在大型系统中，Big Bang 的调试成本呈指数级增长，现代软件工程几乎已废弃此策略。

**2. Bottom-Up（自底向上集成）**

从最底层的原子模块开始集成，逐层向上构建。底层模块使用真实实现，上层模块需要编写「驱动模块」（driver）来模拟调用者。此策略的优势在于：底层模块（通常是基础设施、数据访问层）尽早得到真实环境验证；劣势在于：系统的主要控制流程（通常位于顶层）直到最后才被测试。

**3. Top-Down（自顶向下集成）**

从系统的主控模块（main/controller）开始，逐层向下集成。顶层模块使用真实实现，下层依赖需要编写「桩模块」（stub）来模拟。此策略的优势在于：系统的主要功能和用户交互流程可以尽早验证；劣势在于：底层实现（如数据库、外部 API）直到后期才得到真实测试。

**4. Sandwich（三明治集成 / 混合集成）**

将系统划分为三层：上层（UI/Controller）、中层（业务逻辑）、下层（数据/基础设施）。上层采用自顶向下策略（下层用桩），下层采用自底向上策略（上层用驱动），中层在上下层都到位后直接与真实依赖集成。Sandwich 策略在现代分层架构（如 MVC、Clean Architecture）中最为常见，它平衡了早期功能验证与基础设施验证的需求。

在现代 JavaScript 全栈应用中，Sandwich 策略的自然映射是：

- **上层**：前端组件 + API 路由处理器（自顶向下，Mock 业务层）
- **中层**：业务服务/Use Case（与真实数据层或 Fake Repository 集成）
- **下层**：数据访问层/外部客户端（自底向上，使用真实数据库或 MSW）

### 接口契约测试（Consumer-Driven Contracts）

在分布式系统中，服务间的集成风险源于「接口漂移」（interface drift）：提供者（provider）的变更在未经消费者（consumer）同意的情况下破坏了现有契约。传统的集成测试通过同时部署双方服务来验证兼容性，但这种方式在微服务数量增长时面临组合爆炸问题——$N$ 个服务的全量集成测试需要 $O(N^2)$ 的测试组合。

接口契约测试（Contract Testing）通过将集成验证分解为独立的消费者测试和提供者测试来解决这一问题。其核心思想是：消费者定义它期望的契约（请求格式和响应形状），提供者验证它是否能满足这些契约。最著名的实现是 Pact 框架提出的 Consumer-Driven Contract（CDC）模型。

形式化地，契约 $C$ 是一个三元组 $(R_{req}, R_{resp}, P)$，其中：

- $R_{req}$ 是请求的正则规范（URL 模式、HTTP 方法、请求头、请求体结构）
- $R_{resp}$ 是响应的期望规范（状态码、响应头、响应体结构）
- $P$ 是提供者的标识

消费者在本地运行测试时，针对 Mock 提供者生成契约文件（`*.json`）；提供者在 CI 中加载这些契约文件，验证自身实现是否满足所有消费者的期望。这种解耦使得消费者和提供者可以独立部署、独立测试，仅在契约层面保持同步。

契约测试与集成测试的关键差异在于：

- **集成测试**验证「当 A 和 B 同时运行时，它们能否正确协作」
- **契约测试**验证「A 期望的接口与 B 承诺的接口是否兼容」

前者需要双方同时存在，后者仅需契约文件作为中介。

### 测试 Doubles 在集成测试中的角色

集成测试中测试替身的使用策略与单元测试有本质不同。单元测试中，替身用于完全隔离被测单元；集成测试中，替身用于「控制边界」而非「消除边界」：

- **Fake**：在集成测试中广泛使用。例如，使用内存数据库替代 PostgreSQL，使用内存消息队列替代 RabbitMQ。Fake 提供了真实实现的简化版本，保留了基本的语义行为（如事务、索引、查询），但牺牲了持久性和分布式特性。
- **Stub**：用于模拟尚未实现或不可用的下游服务。例如，在开发环境中 Stub 支付网关的响应。
- **Mock**：在集成测试中应谨慎使用。过度 Mock 会消解集成测试的价值——如果所有依赖都被 Mock，集成测试退化为单元测试。

### 集成测试与微服务边界

在微服务架构中，集成测试面临独特的挑战：服务边界（service boundaries）不仅是代码模块的边界，更是团队边界、部署边界和数据主权边界。Eric Evans 的领域驱动设计（DDD）强调「有界上下文」（bounded context）作为服务划分的基本原则，而集成测试正是验证这些上下文之间「防腐层」（anti-corruption layer）正确性的关键手段。

微服务集成测试的三种粒度：

1. **进程内集成测试**：在同一个 Node.js 进程中启动多个服务模块，通过内存调用或本地 HTTP 进行集成。适用于模块间集成，不验证网络层。
2. **容器内集成测试**：通过 Docker Compose 启动相关服务的容器，在隔离的网络命名空间中进行集成。验证了网络协议、序列化和配置的正确性。
3. **环境集成测试**：在共享的 staging 环境中进行跨团队协作的集成验证。频率较低，通常与发布流程绑定。

### 端到端一致性验证

集成测试还需关注「端到端一致性」（end-to-end consistency）：一个操作在穿越多个系统边界后，最终状态是否符合预期。例如，用户下单操作应触发：订单服务写入订单记录、库存服务扣减库存、支付服务创建待支付账单、消息服务发送确认邮件。集成测试需要验证这个分布式事务（或 Saga）的最终一致性，而非仅仅验证单个服务的内部状态。

## 工程实践映射

### Supertest + Express/NestJS 的 API 集成测试

Supertest 是 Node.js HTTP 断言库的事实标准，它允许在不启动真实网络端口的情况下测试 HTTP 服务器：

```typescript
// express-app.test.ts
import request from 'supertest';
import { createApp } from './app';
import { setupTestDatabase, teardownTestDatabase } from './test-helpers/db';

describe('订单 API 集成测试', () => {
  let app: Express.Application;
  let db: TestDatabase;

  beforeAll(async () => {
    db = await setupTestDatabase();
    app = createApp({ database: db.connection });
  });

  afterAll(async () => {
    await teardownTestDatabase(db);
  });

  afterEach(async () => {
    await db.clearTables();
  });

  it('POST /orders 应创建订单并返回 201', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        userId: 'user-123',
        items: [
          { productId: 'prod-1', quantity: 2, price: 100 },
        ],
      })
      .expect(201)
      .expect('Content-Type', /json/);

    expect(response.body).toMatchObject({
      id: expect.any(String),
      userId: 'user-123',
      totalAmount: 200,
      status: 'pending',
    });

    // 验证数据库状态
    const orderInDb = await db.query('SELECT * FROM orders WHERE id = $1', [response.body.id]);
    expect(orderInDb.rows[0]).toBeDefined();
    expect(orderInDb.rows[0].total_amount).toBe('200.00');
  });

  it('GET /orders/:id 应返回存在的订单', async () => {
    const created = await request(app)
      .post('/api/orders')
      .send({ userId: 'user-123', items: [{ productId: 'prod-1', quantity: 1, price: 50 }] });

    await request(app)
      .get(`/api/orders/${created.body.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(created.body.id);
        expect(res.body.items).toHaveLength(1);
      });
  });

  it('GET /orders/:id 不存在的订单应返回 404', async () => {
    await request(app)
      .get('/api/orders/non-existent-id')
      .expect(404);
  });
});
```

在 NestJS 中，可以利用其内置的测试工具进行更深入的集成验证：

```typescript
// orders.controller.spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { OrdersModule } from './orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('OrdersController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        OrdersModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',           // 内存数据库，隔离且快速
          entities: [__dirname + '/**/*.entity.ts'],
          synchronize: true,
          logging: false,
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/orders (POST)', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .send({ userId: '123', items: [] })
      .expect(201);
  });
});
```

### React Testing Library + MSW 的组件集成测试

React Testing Library（RTL）的核心理念是「测试用户可见的行为，而非实现细节」。这与集成测试的哲学天然契合——我们测试的不是组件的内部状态，而是组件树作为整体的输出行为。

```typescript
// UserProfile.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProfile } from './UserProfile';
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },  // 测试中禁用重试，快速失败
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('UserProfile 集成测试', () => {
  it('应加载并显示用户信息', async () => {
    server.use(
      http.get('/api/users/123', () => {
        return HttpResponse.json({
          id: '123',
          name: 'Alice Chen',
          email: 'alice@example.com',
          role: 'admin',
        });
      })
    );

    render(<UserProfile userId="123" />, { wrapper: Wrapper });

    expect(screen.getByText(/加载中/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
    });

    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('应处理保存用户信息的完整流程', async () => {
    const user = userEvent.setup();
    let savedData: unknown;

    server.use(
      http.get('/api/users/123', () => HttpResponse.json({
        id: '123', name: 'Alice', email: 'alice@example.com', role: 'user'
      })),
      http.put('/api/users/123', async ({ request }) => {
        savedData = await request.json();
        return HttpResponse.json({ ...savedData, id: '123' });
      })
    );

    render(<UserProfile userId="123" />, { wrapper: Wrapper });

    await waitFor(() => screen.getByDisplayValue('Alice'));

    await user.clear(screen.getByLabelText(/姓名/i));
    await user.type(screen.getByLabelText(/姓名/i), 'Alice Updated');
    await user.click(screen.getByRole('button', { name: /保存/i }));

    await waitFor(() => {
      expect(screen.getByText(/保存成功/i)).toBeInTheDocument();
    });

    expect(savedData).toEqual(expect.objectContaining({
      name: 'Alice Updated',
      email: 'alice@example.com',
    }));
  });
});
```

RTL + MSW 的组合实现了前端组件集成测试的理想形态：组件树、状态管理（React Query）、路由和 API 客户端均使用真实代码，仅 HTTP 网络层被 Mock。这种策略既保留了集成测试的系统视角，又避免了真实后端不可用带来的不稳定性。

### Playwright Component Testing

Playwright Component Testing 是新一代的组件级集成测试方案，它在真实浏览器中渲染组件，支持跨浏览器测试和视觉回归检测：

```typescript
// Button.spec.tsx
import { test, expect } from '@playwright/experimental-ct-react';
import { Button } from './Button';

test('Button 应响应点击事件', async ({ mount }) => {
  let clicked = false;
  const component = await mount(
    <Button onClick={() => { clicked = true; }}>
      点击我
    </Button>
  );

  await component.click();
  expect(clicked).toBe(true);
});

test('Button 禁用状态应阻止点击', async ({ mount }) => {
  let clicked = false;
  const component = await mount(
    <Button disabled onClick={() => { clicked = true; }}>
      禁用按钮
    </Button>
  );

  await component.click({ force: true });
  expect(clicked).toBe(false);

  // 视觉验证：截图对比
  await expect(component).toHaveScreenshot('button-disabled.png');
});
```

Playwright Component Testing 的独特优势在于：它在真实浏览器环境中运行，能够检测 JSDOM 环境无法捕获的问题（如 CSS 布局错误、浏览器兼容性、焦点管理、无障碍属性等）。

### 数据库集成测试策略

数据库集成测试的核心挑战是「状态隔离」：每个测试应在干净、确定的数据库状态下运行，且不应受其他测试影响。

**策略一：事务回滚（Transaction Rollback）**

在每个测试开始时开启数据库事务，测试结束后回滚。这是最快速的数据库隔离策略：

```typescript
// test/helpers/database.ts
import { DataSource } from 'typeorm';

export async function runInTransaction<T>(
  dataSource: DataSource,
  fn: (entityManager: EntityManager) => Promise<T>
): Promise<T> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const result = await fn(queryRunner.manager);
    await queryRunner.rollbackTransaction();
    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

// 测试中使用
describe('OrderRepository', () => {
  it('应持久化订单', async () => {
    await runInTransaction(dataSource, async (em) => {
      const repo = em.getRepository(Order);
      const order = repo.create({ total: 100, status: 'pending' });
      await repo.save(order);

      const found = await repo.findOne({ where: { id: order.id } });
      expect(found).toBeDefined();
      expect(found!.total).toBe(100);
    });
  });
});
```

**策略二：SQLite 内存模式**

对于不涉及特定数据库方言的测试，SQLite `:memory:` 模式提供了零配置、极快速的替代方案。NestJS、Prisma 和 TypeORM 均支持 SQLite 内存模式：

```typescript
// prisma/schema.prisma
// 通过环境变量切换数据源
datasource db {
  provider = env("DB_PROVIDER") // "postgresql" 或 "sqlite"
  url      = env("DATABASE_URL")
}

// 测试配置
process.env.DB_PROVIDER = 'sqlite';
process.env.DATABASE_URL = 'file:./test.db?mode=memory';
```

**策略三：TestContainers**

当测试依赖于特定数据库特性（如 PostgreSQL 的 JSONB 操作、PostGIS 地理扩展、MongoDB 的聚合管道）时，SQLite 无法提供足够的保真度。TestContainers 通过编程方式启动真实数据库的 Docker 容器，测试结束后自动销毁：

```typescript
// test-setup.ts
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { Client } from 'pg';

let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:15-alpine')
    .withDatabase('test_db')
    .withUsername('test')
    .withPassword('test')
    .start();

  process.env.DATABASE_URL = container.getConnectionUri();
  // 运行迁移
  await runMigrations();
}, 60000); // 容器启动可能需要较长时间

afterAll(async () => {
  await container.stop();
});

beforeEach(async () => {
  // 清理数据但保留表结构
  await clearAllTables();
});
```

TestContainers 的优势是「测试环境与生产环境完全一致」；劣势是容器启动时间较长（数秒至数十秒），不适合需要频繁运行的单元测试层，但非常适合集成测试和 CI 流水线。

### Pact 的契约测试实现

Pact 是消费者驱动契约测试的行业标准实现。以下展示在 JS/TS 生态中使用 Pact 的完整流程：

**消费者端（Consumer）测试**：

```typescript
// consumers/order-service/pact/order-service.pact.spec.ts
import { Pact } from '@pact-foundation/pact';
import path from 'path';
import { UserServiceClient } from '../src/user-service-client';

const provider = new Pact({
  consumer: 'OrderService',
  provider: 'UserService',
  port: 1234,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'warn',
});

describe('UserService 契约', () => {
  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  it('应返回用户信息', async () => {
    await provider.addInteraction({
      state: '用户 123 存在',
      uponReceiving: '获取用户 123 的请求',
      withRequest: {
        method: 'GET',
        path: '/users/123',
        headers: { Authorization: 'Bearer token123' },
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: provider.like('123'),
          name: provider.like('Alice'),
          email: provider.term({ generate: 'alice@example.com', matcher: '^.*@.*\\..*$' }),
          vipStatus: provider.boolean(),
        },
      },
    });

    const client = new UserServiceClient('http://localhost:1234');
    const user = await client.getUser('123', 'token123');

    expect(user.id).toBe('123');
    expect(user.name).toBe('Alice');
  });
});
```

运行消费者测试后，Pact 会生成契约文件 `OrderService-UserService.json`，其中记录了所有交互的期望。

**提供者端（Provider）验证**：

```typescript
// providers/user-service/pact/provider.pact.spec.ts
import { Verifier } from '@pact-foundation/pact';
import path from 'path';
import { startApp } from '../src/app';

describe('Pact 提供者验证', () => {
  let server: Server;

  beforeAll(async () => {
    server = await startApp(4000);
  });

  afterAll(() => server.close());

  it('应验证所有消费者契约', async () => {
    await new Verifier({
      provider: 'UserService',
      providerBaseUrl: 'http://localhost:4000',
      pactBrokerUrl: process.env.PACT_BROKER_URL,
      pactBrokerToken: process.env.PACT_BROKER_TOKEN,
      publishVerificationResult: true,
      providerVersion: process.env.GIT_COMMIT_SHA,
      stateHandlers: {
        '用户 123 存在': async () => {
          await db.seedUser({ id: '123', name: 'Alice', email: 'alice@example.com' });
        },
      },
    }).verifyProvider();
  });
});
```

Pact Broker 作为契约的中央存储库，跟踪每个服务的消费者-提供者关系，并提供「能否安全部署」的决策支持（can-i-deploy）。

### Docker Compose 集成测试环境

对于涉及多个服务（数据库、缓存、消息队列、第三方模拟）的集成测试，Docker Compose 提供了一致且可复现的测试环境：

```yaml
# docker-compose.test.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.test
    environment:
      - NODE_ENV=test
      - DATABASE_URL=postgres://test:test@postgres:5432/test
      - REDIS_URL=redis://redis:6379
      - API_BASE_URL=http://wiremock:8080
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      wiremock:
        condition: service_started
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run test:integration

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: test
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine

  wiremock:
    image: wiremock/wiremock:3.3.1
    volumes:
      - ./test/wiremock:/home/wiremock
    command: ["--global-stubbing"]
```

在 CI 中执行：

```bash
docker-compose -f docker-compose.test.yml up --abort-on-container-exit --exit-code-from app
```

这种模式确保了「在我的机器上能跑」不会成为谎言——测试环境与 CI 环境、与团队成员的机器完全一致。

## Mermaid 图表

### 集成测试策略对比

```mermaid
graph TB
    subgraph "经典集成策略"
        BB[Big Bang<br/>大爆炸] --> |"所有模块同时集成"| BBR[调试困难<br/>缺陷定位成本高]
        BU[Bottom-Up<br/>自底向上] --> |"从底层开始"| BUR[驱动模块<br/>顶层最后测试]
        TD[Top-Down<br/>自顶向下] --> |"从顶层开始"| TDR[桩模块<br/>底层最后测试]
        SW[Sandwich<br/>三明治] --> |"上下并行"| SWR[混合策略<br/>现代首选]
    end

    SWR --> |"映射到"| MOD[上层: Controller<br/>中层: Service<br/>下层: Repository]

    style BB fill:#ff6b6b,stroke:#333,stroke-width:2px,color:#fff
    style BU fill:#feca57,stroke:#333,stroke-width:2px
    style TD fill:#feca57,stroke:#333,stroke-width:2px
    style SW fill:#1dd1a1,stroke:#333,stroke-width:2px,color:#fff
    style MOD fill:#54a0ff,stroke:#333,stroke-width:2px,color:#fff
```

### 契约测试工作流程

```mermaid
sequenceDiagram
    participant C as 消费者<br/>Consumer
    participant P as Pact Broker
    participant PR as 提供者<br/>Provider

    C->>C: 1. 编写消费者测试<br/>定义期望契约
    C->>P: 2. 上传契约文件<br/>(OrderService-UserService.json)
    PR->>P: 3. 拉取相关契约
    PR->>PR: 4. 启动应用实例<br/>验证契约
    PR->>P: 5. 上报验证结果<br/>+ 版本号
    C->>P: 6. 查询 can-i-deploy
    P-->>C: 7. 返回部署决策
```

### 数据库隔离策略决策矩阵

```mermaid
flowchart TD
    A[需要数据库隔离?] -->|是| B[需要真实数据库特性?]
    A -->|否| C[使用 Fake/Mock]

    B -->|否| D[SQLite 内存模式<br/>速度: ★★★★★<br/>保真度: ★★☆]
    B -->|是| E[需要快速反馈?]

    E -->|是| F[事务回滚<br/>速度: ★★★★☆<br/>保真度: ★★★★★]
    E -->|否| G[TestContainers<br/>速度: ★★☆☆☆<br/>保真度: ★★★★★]

    style A fill:#feca57,stroke:#333,stroke-width:2px
    style C fill:#c8d6e5,stroke:#333
    style D fill:#1dd1a1,stroke:#333,stroke-width:2px,color:#fff
    style F fill:#1dd1a1,stroke:#333,stroke-width:2px,color:#fff
    style G fill:#54a0ff,stroke:#333,stroke-width:2px,color:#fff
```

## 理论要点总结

1. **集成测试验证的是组合的正确性而非个体的正确性**：即使每个模块单独正确，其组合仍可能因交互语义不匹配而失败。集成测试关注模块间的接口、数据流和时序关系。

2. **Sandwich 集成策略最契合现代分层架构**：上层自顶向下验证用户交互流程，下层自底向上验证基础设施行为，中层在真实依赖就位后进行业务逻辑集成。

3. **消费者驱动契约测试解耦了微服务的集成验证**：通过契约文件作为中介，消费者和提供者可以独立测试、独立部署，仅在契约层面保持同步，避免了 $O(N^2)$ 的组合爆炸。

4. **数据库集成测试的核心是状态隔离**：事务回滚适用于需要快速反馈的场景，SQLite 内存模式适用于不依赖特定方言的测试，TestContainers 适用于需要完全环境保真度的场景。

5. **集成测试中的替身策略应与单元测试有本质区别**：集成测试中应优先使用 Fake（保留语义行为）而非 Mock（完全替代），过度 Mock 会使集成测试退化为单元测试，丧失边界验证的价值。

## 参考资源

1. Fowler, M. (2018). [Integration Test](https://martinfowler.com/bliki/IntegrationTest.html). Martin Fowler 的博文，澄清了集成测试与单元测试、E2E 测试的边界，区分了「狭义的集成测试」（测试模块组合）与「广义的集成测试」（任何涉及多个进程的测试）。

2. Pact Foundation. (2025). [Pact Documentation](https://docs.pact.io/). 消费者驱动契约测试的权威文档，详细阐述了契约测试的理论模型、实现细节和 CI/CD 集成策略。

3. TestContainers. (2025). [TestContainers Node Documentation](https://node.testcontainers.org/). 提供了在 Node.js 测试中使用 Docker 容器的完整指南，涵盖数据库、消息队列和自定义容器的管理。

4. Supertest. (2025). [Supertest GitHub Repository](https://github.com/ladjs/supertest). Node.js HTTP 断言库的标准参考，展示了在不启动真实网络端口的情况下测试 HTTP 服务器的最佳实践。

5. Testing Library. (2025). [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/). 前端组件测试的方法论指南，强调「测试用户可见行为」而非实现细节的理念。
