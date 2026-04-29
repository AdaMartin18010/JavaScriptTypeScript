# 真实世界案例研究：从理论到工程实践

> **目标读者**：希望将知识转化为工程能力的中高级开发者
> **关联文档**：`examples/`（已归档）
> **版本**：2026-04
> **字数**：约 3,000 字

---

## 1. 案例研究方法论

### 1.1 为什么需要案例研究

知识分为三个层次：

```
L1: 知道 (Knowing)     → 听说过概念
L2: 理解 (Understanding) → 能解释原理
L3: 应用 (Applying)      → 能在真实场景中解决实际问题
```

案例研究是**从 L2 到 L3 的桥梁**。

### 1.2 案例分析框架

每个案例都应回答：

```markdown
1. 背景与问题域
   - 业务场景是什么？
   - 技术约束有哪些？

2. 方案设计
   - 架构图与关键决策
   - 选型理由

3. 实现细节
   - 核心代码与模式
   - 反例与正确模式对比

4. 结果与反思
   - 性能数据
   - 踩过的坑
   - 如果重来会怎么改
```

---

## 2. 经典案例类型

### 2.1 电商平台

**挑战**：

- 高并发秒杀
- 库存一致性
- 支付幂等性
- 订单状态机

**技术方案**：

```
秒杀: 令牌桶限流 + Redis 预减库存 + 消息队列异步下单
库存: 乐观锁 + 库存拆分（多仓库）
支付: 幂等表 + 分布式锁 + 对账机制
```

**核心代码：秒杀令牌桶限流**

```typescript
// rate-limiter.ts — 基于 Redis 的分布式令牌桶
import { Redis } from 'ioredis';

class TokenBucketLimiter {
  constructor(
    private redis: Redis,
    private keyPrefix: string,
    private capacity: number,    // 桶容量
    private refillRate: number   // 每秒补充令牌数
  ) {}

  async acquire(clientId: string): Promise<boolean> {
    const key = `${this.keyPrefix}:${clientId}`;
    const now = Date.now();

    // Lua 脚本保证原子性
    const script = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refillRate = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      local window = 1000 / refillRate

      local bucket = redis.call('hmget', key, 'tokens', 'lastRefill')
      local tokens = tonumber(bucket[1]) or capacity
      local lastRefill = tonumber(bucket[2]) or now

      local elapsed = now - lastRefill
      local refillTokens = math.floor(elapsed / window)
      tokens = math.min(capacity, tokens + refillTokens)

      if tokens >= 1 then
        tokens = tokens - 1
        redis.call('hmset', key, 'tokens', tokens, 'lastRefill', now)
        redis.call('pexpire', key, 60000)
        return 1
      else
        redis.call('hmset', key, 'tokens', tokens, 'lastRefill', now)
        redis.call('pexpire', key, 60000)
        return 0
      end
    `;

    const result = await this.redis.eval(
      script, 1, key,
      String(this.capacity),
      String(this.refillRate),
      String(now)
    );
    return result === 1;
  }
}
```

### 2.2 社交应用

**挑战**：

- 实时消息（WebSocket）
- 信息流算法
- 多媒体处理
- 隐私合规

**技术方案**：

```
消息: WebSocket + 消息队列 + 离线推送
Feed: 推模式（小V）+ 拉模式（大V）混合
图片: 对象存储 + CDN + 渐进式加载
```

**核心代码：WebSocket 连接管理器**

```typescript
// ws-manager.ts — 生产级 WebSocket 连接管理
import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';

interface ClientSession {
  id: string;
  ws: WebSocket;
  userId: string;
  rooms: Set<string>;
  heartbeatAt: number;
}

class ChatServer extends EventEmitter {
  private clients = new Map<string, ClientSession>();
  private rooms = new Map<string, Set<string>>();
  private wss: WebSocketServer;

  constructor(port: number) {
    super();
    this.wss = new WebSocketServer({ port });
    this.wss.on('connection', (ws, req) => this.handleConnection(ws, req));
    this.startHeartbeatCheck();
  }

  private handleConnection(ws: WebSocket, req: any) {
    const session: ClientSession = {
      id: crypto.randomUUID(),
      ws,
      userId: req.headers['x-user-id'] as string,
      rooms: new Set(),
      heartbeatAt: Date.now(),
    };

    this.clients.set(session.id, session);

    ws.on('message', (data) => this.handleMessage(session, data));
    ws.on('close', () => this.handleDisconnect(session));
    ws.on('pong', () => { session.heartbeatAt = Date.now(); });

    ws.send(JSON.stringify({ type: 'connected', sessionId: session.id }));
  }

  private handleMessage(session: ClientSession, data: RawData) {
    try {
      const msg = JSON.parse(data.toString());
      switch (msg.type) {
        case 'join':
          this.joinRoom(session, msg.roomId);
          break;
        case 'chat':
          this.broadcast(msg.roomId, {
            type: 'chat',
            from: session.userId,
            content: msg.content,
            timestamp: Date.now(),
          });
          break;
      }
    } catch {
      session.ws.send(JSON.stringify({ type: 'error', message: 'Invalid message' }));
    }
  }

  private joinRoom(session: ClientSession, roomId: string) {
    session.rooms.add(roomId);
    if (!this.rooms.has(roomId)) this.rooms.set(roomId, new Set());
    this.rooms.get(roomId)!.add(session.id);
  }

  private broadcast(roomId: string, payload: object) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const message = JSON.stringify(payload);
    for (const clientId of room) {
      const client = this.clients.get(clientId);
      if (client?.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    }
  }

  private startHeartbeatCheck() {
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [id, session] of this.clients) {
        if (now - session.heartbeatAt > 30000) {
          session.ws.terminate();
          this.handleDisconnect(session);
        } else {
          session.ws.ping();
        }
      }
    }, 10000);

    this.wss.on('close', () => clearInterval(interval));
  }

  private handleDisconnect(session: ClientSession) {
    for (const roomId of session.rooms) {
      this.rooms.get(roomId)?.delete(session.id);
    }
    this.clients.delete(session.id);
  }
}
```

### 2.3 SaaS 平台

**挑战**：

- 多租户隔离
- 可配置工作流
- 插件系统
- 数据安全

**技术方案**：

```
租户: 行级隔离 + 独立 Schema（按需）
工作流: 状态机引擎 + 可视化编排
插件: 微前端 / WASM 沙箱
```

**核心代码：多租户行级隔离中间件**

```typescript
// tenant-middleware.ts — Express/Koa 风格多租户隔离
import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';

interface TenantContext {
  tenantId: string;
  dbRole: string;
  isolationLevel: 'row' | 'schema' | 'database';
}

declare global {
  namespace Express {
    interface Request {
      tenant: TenantContext;
    }
  }
}

function tenantMiddleware(pool: Pool) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      return res.status(400).json({ error: 'Missing tenant ID' });
    }

    // 验证租户存在性（缓存优化）
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, isolation_level FROM tenants WHERE id = $1',
        [tenantId]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      req.tenant = {
        tenantId,
        dbRole: `tenant_${tenantId}`,
        isolationLevel: result.rows[0].isolation_level,
      };

      next();
    } finally {
      client.release();
    }
  };
}

// 查询时自动注入 tenant_id
function withTenantFilter(query: string, tenantId: string): string {
  // 安全做法：使用参数化查询，此处仅示意
  if (query.toLowerCase().includes('where')) {
    return query.replace(/where/i, `WHERE tenant_id = '${tenantId}' AND`);
  }
  return `${query} WHERE tenant_id = '${tenantId}'`;
}
```

---

## 3. 从案例中提取模式

### 3.1 架构模式速查

| 问题 | 模式 | 案例 |
|------|------|------|
| 高并发读 | CQRS + 缓存 | 电商商品详情 |
| 最终一致性 | Saga 模式 | 分布式事务 |
| 实时通信 | 发布-订阅 | 即时消息 |
| 数据一致性 | 事件溯源 | 金融记账 |
| 扩展性 | 插件架构 | VS Code 扩展 |

---

## 4. 案例学习路径

```
Level 1: 阅读案例
  ↓ 理解问题与方案
Level 2: 复现案例
  ↓ 动手实现简化版
Level 3: 改造案例
  ↓ 更换技术栈，验证等价性
Level 4: 创新案例
  ↓ 解决自己遇到的实际问题
```

---

## 5. 总结

真实世界案例是**连接理论与实践的桥梁**。

**学习建议**：

1. 不要只读，要动手复现
2. 关注决策过程，不只是结果
3. 记录自己的"如果重来"思考

---

## 参考资源

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [High Scalability](http://highscalability.com/)
- [Real-World React Apps](https://github.com/jeromedalbert/real-world-react-apps)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Redis Lua Scripting Best Practices](https://redis.io/docs/manual/programmability/eval-intro/)
- [PostgreSQL Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Martin Fowler — Patterns of Enterprise Application Architecture](https://martinfowler.com/books/eaa.html)
- [Designing Data-Intensive Applications (O'Reilly)](https://dataintensive.net/)
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)
- [Google SRE Book](https://sre.google/sre-book/table-of-contents/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `index.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **令牌桶限流**：平滑流量突峰，防止服务过载
2. **发布-订阅消息**：解耦生产者和消费者，支持实时广播
3. **行级安全隔离**：在数据层面实现多租户隔离

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

---

> 📅 理论深化更新：2026-04-27
