# 并发编程架构设计

> 多线程模型、同步机制与并发架构模式的系统设计

---

## 1. 架构概述

### 1.1 设计目标

- 提供清晰易用的并发编程抽象
- 保证线程安全和数据一致性
- 优化资源利用和性能表现

### 1.2 架构风格

采用 **分层架构 + Actor 模型** 的混合设计，结合 CSP (Communicating Sequential Processes) 并发理论。

---

## 2. 理论基础

### 2.1 并发理论基础

### 1. 并发的数学模型

#### 进程代数 (Process Algebra)

并发系统的形式化描述使用进程代数，如 CSP (Communicating Sequential Processes) 和 CCS (Calculus of Communicating Systems)。

**CSP 基本操作**：

```
P ::= STOP | SKIP | a → P | P ⊓ Q | P □ Q | P || Q | P \ A

其中：
- STOP: 死锁进程
- a → P: 执行动作 a 后成为 P
- P ⊓ Q: 内部选择（非确定性）
- P □ Q: 外部选择（环境决定）
- P || Q: 并行组合
- P \ A: 隐藏动作集 A
```

#### 状态空间爆炸问题

```
对于 n 个并发进程，每个有 k 个状态：
组合状态空间大小 = kⁿ

这导致：
1. 模型检验的复杂度为指数级
2. 测试覆盖不可能完全
3. 死锁检测成为关键问题
```

### 2. 内存模型理论

#### Happens-Before 关系

**定义**：若事件 A happens-before 事件 B，则 A 的内存写入对 B 可见。

**规则**：

1. 程序顺序：同一线程内的语句顺序
2. 监视器锁：解锁 happens-before 后续加锁
3. volatile：写 happens-before 后续读
4. 线程启动：Thread.start() happens-before 线程内任何操作
5. 线程终止：线程内任何操作 happens-before Thread.join()

**可视化**：

```
Thread A          Thread B
--------          --------
write(x)
unlock(m) ──────→ lock(m)
                  read(x)
```

#### 顺序一致性 (Sequential Consistency)

**Leslie Lamport 定义**：
"任何执行的结果都与所有处理器以某种顺序执行的结果相同，且每个处理器的操作按程序顺序出现。"

**现实差距**：
现代 CPU 使用：

- 指令重排序
- 写缓冲区
- 缓存一致性协议

导致程序员看到的不是顺序一致性，而是**宽松内存模型**。

### 3. 并发控制理论

#### 互斥 (Mutual Exclusion)

**问题定义**：
确保临界区 CS 的互斥访问，满足：

1. 互斥性：∀t₁, t₂, 若 t₁ 在 CS 中，则 t₂ 不在 CS 中
2. 进展性：若 t₁ 想进入 CS，最终会进入
3. 有限等待：t₁ 请求 CS 后，其他线程进入 CS 的次数有限

**Dekker 算法**（软件实现）：

```
flag[i] = true
while flag[j] do
    if turn != i then
        flag[i] = false
        while turn != i do skip
        flag[i] = true

// 临界区

turn = j
flag[i] = false
```

**Peterson 算法**（简化版）：

```
flag[i] = true
turn = j
while flag[j] && turn == j do skip

// 临界区

flag[i] = false
```

#### 信号量 (Semaphore)

**Dijkstra 定义**：

```
semaphore s ∈ ℤ

P(s):  // Proberen (尝试)
    s--
    if s < 0 then block

V(s):  // Verhogen (增加)
    s++
    if s ≤ 0 then wakeup one
```

**二进制信号量 = 互斥锁**
**计数信号量 = 资源池**

#### 管程 (Monitor)

**Hoare 定义**：

```
monitor M {
    variables
    procedures
    invariant I

    condition variables
    wait(c): 释放锁，等待条件 c
    signal(c): 唤醒等待 c 的进程
}
```

**Java synchronized 的本质**：
每个对象关联一个监视器，包含：

- 一个互斥锁
- 一个入口集（Entry Set）
- 一个等待集（Wait Set）

### 4. 并发问题分类

#### 竞态条件 (Race Condition)

**定义**：程序输出依赖于事件的相对时序。

**形式化**：

```
设程序 P 有两个执行路径 p₁ 和 p₂
若 ∃ 状态 s, 使得:
    p₁(s) ≠ p₂(s)
则 P 有竞态条件
```

**示例**：

```javascript
// 非原子操作
i++ 实际上是：
1. read i
2. increment
3. write i

线程 A        线程 B
--------      --------
read i (0)
              read i (0)
increment (1)
              increment (1)
write i (1)
              write i (1)

结果：i = 1（期望：2）
```

#### 死锁 (Deadlock)

**Coffman 条件**（必要条件）：

1. **互斥**：资源不可共享
2. **占有并等待**：持有资源同时请求新资源
3. **不可抢占**：资源只能自愿释放
4. **循环等待**：存在进程-资源的循环链

**检测算法**（资源分配图）：

```
图 G = (V, E)
V = P ∪ R  // 进程 + 资源
E = {(pᵢ, rⱼ) | pᵢ 请求 rⱼ} ∪ {(rⱼ, pᵢ) | rⱼ 分配给 pᵢ}

死锁当且仅当 G 中存在环路
```

**预防策略**：

1. 破坏互斥：使用资源池（不可能总是可行）
2. 破坏占有并等待：一次性申请所有资源
3. 破坏不可抢占：允许资源抢占
4. 破坏循环等待：资源排序，按序申请

#### 活锁 (Livelock)

**定义**：进程不断改变状态以响应对方，但无法继续执行。

**示例**：

```javascript
// 两人相遇，同时让路
while (true) {
    if (otherMovedLeft) moveRight;
    if (otherMovedRight) moveLeft;
}
```

**解决方案**：

- 引入随机等待
- 优先级机制

### 5. 并发架构模式

#### Actor 模型

**理论基础**：

- 由 Carl Hewitt 提出
- 受物理学中 "参与者" 概念启发

**形式化定义**：

```
Actor = (State, Behavior, Mailbox)

行为：
- 创建新 Actor
- 发送消息给其他 Actor
- 改变自身行为

性质：
1. 没有共享内存
2. 异步消息传递
3. 位置透明
```

**优势**：

- 天然分布式
- 容错性好
- 易于扩展

**代表实现**：

- Erlang/Elixir
- Akka (Scala/Java)
- Orleans (.NET)

#### CSP 模型

**核心概念**：

```
进程通过通道通信
Channel = 带类型的 FIFO 队列
```

**Go 语言实现**：

```go
ch := make(chan int)
go func() { ch <- 42 }()  // 发送
value := <-ch              // 接收
```

**与 Actor 的区别**：

| CSP | Actor |
|-----|-------|
| 通道是独立的 | 邮箱是 Actor 的一部分 |
| 同步/异步可选 | 异步消息 |
| 发送者阻塞 | 发送者不阻塞 |

#### Fork-Join 模型

**工作窃取 (Work Stealing) 算法**：

```
每个线程有自己的双端队列 DEQueue

push(task): 添加到本地队列尾部
pop(): 从本地队列尾部取出（LIFO）
steal(): 从其他线程队列头部窃取（FIFO）

优势：
- 减少竞争（大部分操作在队列尾部）
- 负载均衡（空闲线程窃取工作）
- 缓存友好（LIFO 保持局部性）
```

### 6. 响应式编程

**响应式宣言核心**：

1. **响应性**：系统及时响应
2. **弹性**：系统面对故障保持响应
3. **弹性**：系统面对负载变化保持响应
4. **消息驱动**：依赖异步消息传递

**背压 (Backpressure) 策略**：

```
当生产者速度 > 消费者速度时：

1. 丢弃策略
   - Drop Latest: 丢弃最新数据
   - Drop Oldest: 丢弃最旧数据

2. 缓冲策略
   - Unbounded: 无限缓冲（OOM 风险）
   - Bounded: 有界缓冲（阻塞或丢弃）

3. 节流策略
   - Throttle: 限制生产速率
   - Debounce: 防抖
   - Sample: 采样
```

### 7. 并发系统的形式化验证

#### 不变式验证

```
不变式 I: 在所有可达状态下为真的谓词

验证方法：
1. 初始状态满足 I
2. 每个操作保持 I（I → op → I）

示例 - 生产者-消费者：
I: 0 ≤ count ≤ buffer_size
```

#### 线性化 (Linearizability)

**定义**：并发操作的执行效果等价于某个顺序执行。

**验证方法**：

1. 为每个操作定义线性化点
2. 检查全局历史是否等价于顺序历史

### 8. 性能分析

#### Amdahl 定律

```
Speedup = 1 / ((1 - P) + P/N)

其中：
- P = 可并行化比例
- N = 处理器数量

当 N → ∞:
Speedup_max = 1 / (1 - P)

结论：串行部分成为瓶颈
```

#### Universal Scalability Law

```
C(N) = N / (1 + α(N - 1) + βN(N - 1))

其中：
- α = 争用系数
- β = 一致性开销系数

当 β > 0 时，性能随 N 增加而下降
```

### 9. 现代并发架构

#### 无锁数据结构

**CAS (Compare-And-Swap) 循环**：

```
function cas(p, expected, new):
    if *p == expected:
        *p = new
        return true
    return false

// 无锁递增
do {
    old = value
    new = old + 1
} while (!cas(&value, old, new))
```

**ABA 问题**：

```
线程 A          线程 B          线程 A
--------        --------        --------
read (A)
                pop A
                push C
                push A
cas(A, B) → 成功！但栈已改变

解决方案：带版本号的指针 (Tagged Pointer)
```

#### 软件事务内存 (STM)

**概念**：

```
atomic {
    x = x + 1
    y = y - 1
}

实现：
- 乐观并发控制
- 版本号检测冲突
- 失败时重试
```

**优势 vs 劣势**：
优势：

- 编程简单
- 可组合性

劣势：

- 性能开销
- 不适合高争用场景

## JS/TS 并发实践模式

### Worker 线程池实现

```typescript
import { Worker } from 'worker_threads';
import os from 'os';

export class WorkerPool {
  private workers: Worker[] = [];
  private queue: { id: number; resolve: (v: unknown) => void; reject: (e: Error) => void; payload: unknown }[] = [];
  private active = new Map<number, unknown>();
  private idCounter = 0;

  constructor(private size = os.cpus().length) {
    for (let i = 0; i < size; i++) {
      const worker = new Worker('./calc-worker.js');
      worker.on('message', ({ id, result, error }) => {
        const task = this.active.get(id) as any;
        this.active.delete(id);
        error ? task.reject(new Error(error)) : task.resolve(result);
      });
      this.workers.push(worker);
    }
  }

  execute<T>(payload: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ id: ++this.idCounter, resolve: resolve as any, reject, payload });
      this.drain();
    });
  }

  private drain() {
    while (this.queue.length > 0 && this.active.size < this.workers.length) {
      const task = this.queue.shift()!;
      const worker = this.workers[this.active.size % this.workers.length];
      this.active.set(task.id, task);
      worker.postMessage({ id: task.id, payload: task.payload });
    }
  }

  terminate() { return Promise.all(this.workers.map(w => w.terminate())); }
}
```

### Web Locks API（浏览器跨标签页同步）

```typescript
async function synchronizedTask<T>(lockName: string, fn: () => Promise<T>): Promise<T> {
  return navigator.locks.request(lockName, async () => fn());
}

// 跨标签页互斥：防止重复提交
async function submitForm(data: FormData) {
  return synchronizedTask('form-submit', async () => {
    const res = await fetch('/api/submit', { method: 'POST', body: data });
    return res.json();
  });
}
```

### scheduler.yield()（协作式调度）

```typescript
async function processLargeArray<T>(items: T[], batchSize = 100) {
  const results: T[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    results.push(...items.slice(i, i + batchSize).map(x => x));
    if ('scheduler' in window && 'yield' in (window as any).scheduler) {
      await (window as any).scheduler.yield();
    } else {
      await new Promise(r => setTimeout(r, 0));
    }
  }
  return results;
}
```

## 10. 参考文档

### 10.1 经典著作

1. Goetz, B., et al. (2006). *Java Concurrency in Practice*. Addison-Wesley.
2. Herlihy, M., & Shavit, N. (2008). *The Art of Multiprocessor Programming*. Morgan Kaufmann.
3. Armstrong, J. (2013). *Programming Erlang: Software for a Concurrent World* (2nd Edition). Pragmatic Bookshelf.
4. Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly Media.

### 10.2 学术论文

1. Dijkstra, E. W. (1965). "Cooperating Sequential Processes". In F. Genuys (Ed.), *Programming Languages*.
2. Hoare, C. A. R. (1978). "Communicating Sequential Processes". *Communications of the ACM*.
3. Lamport, L. (1979). "How to Make a Multiprocessor Computer That Correctly Executes Multiprocess Programs". *IEEE Transactions on Computers*.

### 10.3 在线资源

- [The Java Memory Model](http://www.cs.umd.edu/~pugh/java/memoryModel/) - 马里兰大学
- [Go Memory Model](https://golang.org/ref/mem) - Go 官方文档
- [Java Concurrency in Practice](https://jcip.net/) - 配套网站
- [Erlang Documentation](https://www.erlang.org/doc/) - Erlang 官方文档
- [Node.js worker_threads](https://nodejs.org/api/worker_threads.html)
- [WHATWG Web Locks API Specification](https://wicg.github.io/web-locks/)
- [MDN — Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API)
- [scheduler.yield() — WICG Explainer](https://github.com/WICG/scheduling-apis/blob/main/explainers/yield-and-continuation.md)
- [V8 Blog — Concurrent Marking](https://v8.dev/blog/concurrent-marking)
- [TC39 — SharedArrayBuffer Specification](https://tc39.es/ecma262/multipage/structured-data.html#sec-sharedarraybuffer-objects)

### 10.4 相关模块

- [02-design-patterns](../../20.2-language-patterns/design-patterns/THEORY.md) - 设计模式理论
- [50-browser-runtime](../browser-runtime/THEORY.md) - 浏览器运行时理论
- [70-distributed-systems](../../20.8-edge-serverless/distributed-systems/THEORY.md) - 分布式系统理论
