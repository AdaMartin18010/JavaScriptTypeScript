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

**模块**: [06-architecture-patterns](../../jsts-code-lab/06-architecture-patterns/)
**理论文档**: [架构模式解析](../../jsts-code-lab/06-architecture-patterns/ARCHITECTURE.md)

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

**模块**: [02-design-patterns/THEORY.md](../../jsts-code-lab/02-design-patterns/THEORY.md)

**SOLID 原则形式化理解**:

- S: LCOM (Lack of Cohesion of Methods) 计算
- O: 抽象稳定定理
- L: 行为子类型
- I: 最小知识原则
- D: 稳定依赖原则

---

## 📚 第二阶段：并发编程 (2 周)

### 2.1 异步编程模式

**模块**: [03-concurrency](../../jsts-code-lab/03-concurrency/)
**理论文档**: [并发编程架构](../../jsts-code-lab/03-concurrency/ARCHITECTURE.md)

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

**模块**: [15-data-flow](../../jsts-code-lab/15-data-flow/)

**学习 RxJS 核心操作符**:

- 创建: `of`, `from`, `interval`, `defer`
- 转换: `map`, `flatMap`, `switchMap`, `concatMap`
- 过滤: `filter`, `take`, `debounceTime`, `throttleTime`
- 组合: `merge`, `combineLatest`, `zip`

---

## 📚 第三阶段：性能优化 (1-2 周)

### 3.1 浏览器运行时优化

**模块**: [50-browser-runtime](../../jsts-code-lab/50-browser-runtime/)
**理论文档**: [浏览器运行时理论](../../jsts-code-lab/50-browser-runtime/THEORY.md)

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

**模块**: [04-data-structures](../../jsts-code-lab/04-data-structures/)
**模块**: [05-algorithms](../../jsts-code-lab/05-algorithms/)

**复杂度分析实践**:

- 时间/空间复杂度计算
- 摊还分析
- 实际性能测试与理论对比

---

## 📚 第四阶段：后端开发 (2 周)

### 4.1 API 设计与安全

**模块**: [19-backend-development](../../jsts-code-lab/19-backend-development/)
**模块**: [21-api-security](../../jsts-code-lab/21-api-security/)

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

**模块**: [20-database-orm](../../jsts-code-lab/20-database-orm/)

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
- [jsts-code-lab 高级模块](../jsts-code-lab/README.md#高级模块)

---

**💡 学习建议**:

1. **系统设计练习**：每周完成一个系统设计题目
2. **代码审查**：参与开源项目的 Code Review
3. **技术写作**：将学习心得写成博客
4. **性能挑战**：给自己设定性能优化目标
