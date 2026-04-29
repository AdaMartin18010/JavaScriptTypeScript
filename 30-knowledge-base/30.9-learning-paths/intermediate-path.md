---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# 进阶学习路径 (Intermediate Path)

> 适合有 1-2 年 JS/TS 经验开发者，深入架构设计和性能优化

## 目录

- [进阶学习路径 (Intermediate Path)](#进阶学习路径-intermediate-path)
  - [目录](#目录)
  - [🎯 学习目标](#-学习目标)
  - [📚 第一阶段：架构模式 (2 周)](#-第一阶段架构模式-2-周)
    - [1.1 企业级架构模式](#11-企业级架构模式)
    - [1.2 设计原则深入](#12-设计原则深入)
  - [📚 第二阶段：并发编程 (2 周)](#-第二阶段并发编程-2-周)
    - [2.1 异步编程模式](#21-异步编程模式)
    - [2.2 响应式编程](#22-响应式编程)
  - [📚 第三阶段：性能优化 (1-2 周)](#-第三阶段性能优化-1-2-周)
    - [3.1 浏览器运行时优化](#31-浏览器运行时优化)
    - [3.2 算法与数据结构优化](#32-算法与数据结构优化)
  - [📚 第四阶段：后端开发 (2 周)](#-第四阶段后端开发-2-周)
    - [4.1 API 设计与安全](#41-api-设计与安全)
    - [4.2 数据库与 ORM](#42-数据库与-orm)
  - [🛠️ 综合项目](#️-综合项目)
    - [项目: 构建一个任务队列系统](#项目-构建一个任务队列系统)
  - [📖 推荐资源](#-推荐资源)
    - [书籍](#书籍)
    - [在线资源](#在线资源)
    - [源码阅读](#源码阅读)
  - [🎯 里程碑验证机制](#-里程碑验证机制)
    - [阶段 1 验证：架构模式](#阶段-1-验证架构模式)
    - [阶段 2 验证：并发编程](#阶段-2-验证并发编程)
    - [阶段 3 验证：性能优化](#阶段-3-验证性能优化)
    - [阶段 4 验证：后端开发](#阶段-4-验证后端开发)
  - [✅ 阶段检查清单](#-阶段检查清单)
    - [架构设计](#架构设计)
    - [并发编程](#并发编程)
    - [后端开发](#后端开发)
  - [🚀 下一步](#-下一步)

## 🎯 学习目标

完成本学习路径后，你将能够：

- 设计和实现复杂的企业级架构
- 进行系统性能分析和优化
- 掌握并发编程和异步模式
- 构建可扩展的后端服务

**预计学习时间**: 6-8 周（每天 2-3 小时）

---

## 📚 第一阶段：架构模式 (2 周)

### 1.1 企业级架构模式

**模块**: [06-architecture-patterns](../../20-code-lab/20.2-language-patterns/architecture-patterns/)
**理论文档**: [架构模式解析](../../20-code-lab/20.2-language-patterns/architecture-patterns/ARCHITECTURE.md)

**核心内容**:

| 架构模式 | 适用场景 | 复杂度 |
|---------|---------|--------|
| **分层架构** | 传统企业应用 | ⭐⭐ |
| **六边形架构** | 领域驱动设计 | ⭐⭐⭐ |
| **CQRS** | 高读写比系统 | ⭐⭐⭐⭐ |
| **事件溯源** | 审计追踪要求高的系统 | ⭐⭐⭐⭐ |
| **微服务** | 大型分布式系统 | ⭐⭐⭐⭐⭐ |

**实践项目**: 实现一个电商系统的核心模块

```typescript
// 六边形架构示例 - 领域层
interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  save(order: Order): Promise<void>;
}

class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private paymentGateway: PaymentGateway,
    private eventBus: EventBus
  ) {}

  async placeOrder(command: PlaceOrderCommand): Promise<Order> {
    const order = Order.create(command);
    await this.paymentGateway.charge(order.total);
    await this.orderRepo.save(order);
    await this.eventBus.publish(new OrderPlacedEvent(order));
    return order;
  }
}
```

### 1.2 设计原则深入

**模块**: [02-design-patterns/THEORY.md](../../20-code-lab/20.2-language-patterns/design-patterns/THEORY.md)

**SOLID 原则形式化理解**:

- S: LCOM (Lack of Cohesion of Methods) 计算
- O: 抽象稳定定理
- L: 行为子类型
- I: 最小知识原则
- D: 稳定依赖原则

---

## 📚 第二阶段：并发编程 (2 周)

### 2.1 异步编程模式

**模块**: [03-concurrency](../../20-code-lab/20.3-concurrency-async/concurrency/)
**理论文档**: [并发编程架构](../../20-code-lab/20.3-concurrency-async/concurrency/ARCHITECTURE.md)

**核心概念**:

```typescript
// 事件循环模型理解
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// 输出: 1, 4, 3, 2
```

**并发控制模式**:

1. **Promise 并发控制**

```typescript
async function concurrentLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const [index, task] of tasks.entries()) {
    const promise = task().then(result => {
      results[index] = result;
    });
    executing.push(promise);

    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }

  await Promise.all(executing);
  return results;
}
```

1. **信号量模式**
2. **读写锁模式**

### 2.2 响应式编程

**模块**: [15-data-flow](../../20-code-lab/20.3-concurrency-async/data-flow/)

**学习 RxJS 核心操作符**:

- 创建: `of`, `from`, `interval`, `defer`
- 转换: `map`, `flatMap`, `switchMap`, `concatMap`
- 过滤: `filter`, `take`, `debounceTime`, `throttleTime`
- 组合: `merge`, `combineLatest`, `zip`

---

## 📚 第三阶段：性能优化 (1-2 周)

### 3.1 浏览器运行时优化

**模块**: [50-browser-runtime](../../20-code-lab/20.3-concurrency-async/browser-runtime/)
**理论文档**: [浏览器运行时理论](../../20-code-lab/20.3-concurrency-async/browser-runtime/THEORY.md)

**关键优化点**:

| 优化领域 | 技术手段 | 预期收益 |
|---------|---------|---------|
| 渲染性能 | 避免 Layout Thrashing, 使用 RAF | 60fps 流畅度 |
| 内存管理 | 避免内存泄漏, 对象池 | 减少 GC 停顿 |
| 网络优化 | 代码分割, 懒加载, 缓存策略 | 减少加载时间 |
| 计算优化 | Web Workers, 虚拟列表 | 保持主线程响应 |

**实践任务**:

```typescript
// 实现虚拟滚动
class VirtualScroller<T> {
  private visibleItems: T[] = [];
  private itemHeight: number;
  private containerHeight: number;

  scrollToIndex(index: number) {
    const startIdx = Math.floor(index / this.visibleCount) * this.visibleCount;
    this.visibleItems = this.data.slice(startIdx, startIdx + this.visibleCount);
    this.updateDOM();
  }
}
```

### 3.2 算法与数据结构优化

**模块**: [04-data-structures](../../20-code-lab/20.4-data-algorithms/data-structures/)
**模块**: [05-algorithms](../../20-code-lab/20.4-data-algorithms/algorithms/)

**复杂度分析实践**:

- 时间/空间复杂度计算
- 摊还分析
- 实际性能测试与理论对比

---

## 📚 第四阶段：后端开发 (2 周)

### 4.1 API 设计与安全

**模块**: [19-backend-development](../../20-code-lab/20.6-backend-apis/backend-development/)
**模块**: [21-api-security](../../20-code-lab/20.9-observability-security/api-security/)

**RESTful API 设计**:

```typescript
// 规范的 API 响应格式
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page: number;
    pageSize: number;
    total: number;
  };
}
```

**安全防护**:

- JWT 认证实现
- 请求限流 (Rate Limiting)
- SQL 注入防护
- XSS/CSRF 防护

### 4.2 数据库与 ORM

**模块**: [20-database-orm](../../20-code-lab/20.6-backend-apis/database-orm/)

**学习内容**:

- TypeORM / Prisma 使用
- 查询优化
- 事务处理
- 连接池管理

---

## 🛠️ 综合项目

### 项目: 构建一个任务队列系统

**需求规格**:

1. **功能需求**:
   - 支持延迟任务
   - 支持任务优先级
   - 支持任务重试
   - 可视化监控面板

2. **架构要求**:
   - 使用分层架构
   - 实现至少一种设计模式
   - 完整的错误处理

3. **性能要求**:
   - 支持 1000+ 并发任务
   - 任务执行延迟 < 100ms
   - 内存使用可控

4. **交付物**:
   - 源代码
   - 架构文档
   - API 文档
   - 测试用例 (覆盖率 > 80%)

---

## 📖 推荐资源

### 书籍

1. *设计数据密集型应用* - Martin Kleppmann ⭐⭐⭐⭐⭐
2. *JavaScript 并发编程* - 刘博文
3. *高性能 JavaScript* - Nicholas C. Zakas
4. *微服务设计* - Sam Newman

### 在线资源

- [Patterns.dev](https://www.patterns.dev/) - 现代 Web 应用设计模式
- [Refactoring.Guru](https://refactoring.guru/) - 重构和设计模式
- [Web.dev Performance](https://web.dev/performance-scoring/) - 性能优化指南

### 源码阅读

- [Express.js](https://github.com/expressjs/express) - Web 框架设计
- [RxJS](https://github.com/ReactiveX/rxjs) - 响应式编程
- [Prisma](https://github.com/prisma/prisma) - ORM 设计

---

## 🎯 里程碑验证机制

### 阶段 1 验证：架构模式

**理论自检**：

1. [ ] 能解释分层架构、六边形架构、CQRS 的核心思想
2. [ ] 能根据业务场景选择合适的架构模式
3. [ ] 能画出微服务架构的完整拓扑图

**实践验证**：

- **Checkpoint 项目**: 实现一个六边形架构的订单系统
  - 领域层：Order 实体、Order 值对象
  - 应用层：PlaceOrder 用例
  - 基础设施层：InMemoryRepository、ConsoleLogger
  - 代码位置: `20-code-lab/20.2-language-patterns/architecture-patterns/hexagonal-order/`
  - 通过标准: 领域层无外部依赖 + 单元测试覆盖 ≥ 80%

**预计时间**: 2 周 | **难度**: ⭐⭐⭐⭐

---

### 阶段 2 验证：并发编程

**理论自检**：

1. [ ] 能画出 JavaScript 事件循环的完整流程图
2. [ ] 能解释 Promise、Async/Await、Generator 的底层机制
3. [ ] 能设计一个并发控制方案（如 Promise 池）

**实践验证**：

- **Checkpoint 项目**: 实现一个请求限流器
  - 功能：令牌桶算法、滑动窗口计数
  - 代码位置: `20-code-lab/20.3-concurrency-async/concurrency/rate-limiter/`
  - 通过标准: 并发测试通过 + 性能 Benchmark

**预计时间**: 2 周 | **难度**: ⭐⭐⭐⭐

---

### 阶段 3 验证：性能优化

**理论自检**：

1. [ ] 能使用 Chrome DevTools 分析性能瓶颈
2. [ ] 能解释虚拟列表的工作原理
3. [ ] 能设计缓存策略（LRU、TTL）

**实践验证**：

- **Checkpoint 项目**: 优化一个慢速列表组件
  - 初始状态：渲染 10,000 项，滚动卡顿
  - 目标：60fps 流畅滚动
  - 代码位置: `20-code-lab/20.3-concurrency-async/browser-runtime/virtual-list-optimization/`
  - 通过标准: Lighthouse Performance ≥ 90

**预计时间**: 1-2 周 | **难度**: ⭐⭐⭐⭐

---

### 阶段 4 验证：后端开发

**理论自检**：

1. [ ] 能设计 RESTful API（资源命名、HTTP 方法、状态码）
2. [ ] 能解释 JWT 认证流程
3. [ ] 能设计数据库 Schema（索引、关系、范式）

**实践验证**：

- **Checkpoint 项目**: 实现一个带认证的 API 服务
  - 功能：用户注册/登录/CRUD、JWT 认证、输入验证
  - 代码位置: `20-code-lab/20.9-observability-security/api-security/authenticated-api/`
  - 通过标准: 安全扫描通过 + 集成测试覆盖

**预计时间**: 2 周 | **难度**: ⭐⭐⭐⭐

---

## ✅ 阶段检查清单

### 架构设计

- [ ] 能独立设计分层架构
- [ ] 理解并能应用 DDD 核心概念
- [ ] 能进行技术选型并编写 ADR
- [ ] 能绘制架构图并解释设计决策

### 并发编程

- [ ] 深入理解事件循环机制
- [ ] 能处理并发控制和竞态条件
- [ ] 熟练使用 RxJS 解决异步问题
- [ ] 能进行性能分析和优化

### 后端开发

- [ ] 能设计 RESTful API
- [ ] 掌握数据库设计和优化
- [ ] 了解安全防护最佳实践
- [ ] 能编写可维护的服务端代码

---

## 🚀 下一步

完成进阶路径后，可以继续：

- [高级学习路径](./advanced-path.md) - 分布式系统和架构师思维
- [jsts-code-lab 高级模块](../../20-code-lab/)

---

**💡 学习建议**:

1. **系统设计练习**：每周完成一个系统设计题目
2. **代码审查**：参与开源项目的 Code Review
3. **技术写作**：将学习心得写成博客
4. **性能挑战**：给自己设定性能优化目标
