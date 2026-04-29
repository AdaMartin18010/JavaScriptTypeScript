# 学习路径里程碑验证机制

> **定位**：`30-knowledge-base/30.9-learning-paths/`
> **新增**：2026-04

---

## 一、验证机制设计

传统的「推荐阅读列表」式学习路径缺乏**掌握程度验证**。本机制为每条路径设置 Checkpoint 项目 + 自测题，形成「能力成长地图」。

---

## 二、初学者路径（4-6 周）

### Week 1-2：语言核心

**Checkpoint 1：类型系统挑战**

```typescript
// 自测题：修复以下类型错误
function processData(data: any) {
  return data.map(x => x.toUpperCase());
}
// 要求：
// 1. 将 data 类型从 any 改为安全的泛型约束
// 2. 处理可能的 null/undefined
// 3. 返回类型自动推导
```

**参考答案与深化**：

```typescript
// 使用泛型约束 + 类型守卫
function processData<T extends { toUpperCase(): string }>(
  data: T[] | null | undefined
): string[] {
  if (!Array.isArray(data)) return [];
  return data.map(x => x.toUpperCase());
}

// 更严格的未知输入处理
function processDataStrict(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((x): x is string => typeof x === 'string')
    .map(x => x.toUpperCase());
}
```

**验证标准**：

- [ ] 代码通过 `tsc --strict` 无错误
- [ ] 理解 `unknown` vs `any` 的差异
- [ ] 能解释类型守卫（type guard）的工作原理

### Week 3-4：异步与框架

**Checkpoint 2：异步控制流**

```typescript
// 自测题：实现并发限制器
async function fetchWithLimit(urls: string[], limit: number): Promise<Response[]> {
  // 要求：同时最多进行 limit 个请求
}
```

**参考答案**：

```typescript
async function fetchWithLimit(
  urls: string[],
  limit: number,
  signal?: AbortSignal
): Promise<Response[]> {
  const results: Response[] = new Array(urls.length);
  let index = 0;

  async function worker(): Promise<void> {
    while (index < urls.length) {
      const current = index++;
      try {
        const res = await fetch(urls[current], { signal });
        results[current] = res;
      } catch (err) {
        results[current] = err as Response; // 或统一错误包装
      }
    }
  }

  const workers = Array.from({ length: limit }, () => worker());
  await Promise.all(workers);
  return results;
}
```

**验证标准**：

- [ ] 实现正确，无竞态条件
- [ ] 能解释宏任务与微任务的执行顺序
- [ ] 能使用 AbortController 实现请求取消

### Week 5-6：全栈项目

**Checkpoint 3：Todo 全栈应用**

**项目要求**：

- 前端：React + TypeScript
- 后端：Node.js/Bun + REST API
- 数据库：SQLite/Turso
- 部署：边缘函数

**端到端类型安全示例（tRPC 风格）**：

```typescript
// shared/schema.ts —— 前后端共享
import { z } from 'zod';

export const TodoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  completed: z.boolean().default(false),
  createdAt: z.coerce.date(),
});

export type Todo = z.infer<typeof TodoSchema>;
export type TodoInput = Pick<Todo, 'title'>;
```

```typescript
// api/router.ts
import { initTRPC } from '@trpc/server';
import { TodoSchema, TodoInput } from '../shared/schema';

const t = initTRPC.create();
export const appRouter = t.router({
  todo: t.router({
    list: t.procedure.query(async () => {
      return db.select().from(todos).all();
    }),
    create: t.procedure
      .input(z.object({ title: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const todo = await db.insert(todos).values(input).returning().get();
        return todo;
      }),
  }),
});

export type AppRouter = typeof appRouter;
```

**验证标准**：

- [ ] 端到端类型安全
- [ ] 通过所有单元测试
- [ ] Lighthouse 性能评分 > 90

---

## 三、进阶工程师路径（6-8 周）

### Milestone 1：性能优化

**Checkpoint：React 性能审计**

- 使用 React DevTools Profiler 识别重渲染组件
- 实现虚拟列表（10,000+ 项）
- INP 优化至 < 200ms

**虚拟列表核心实现**：

```typescript
import { useRef, useState, useCallback } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

function VirtualList<T>({ items, itemHeight, containerHeight, renderItem }: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 1;
  const endIndex = Math.min(startIndex + visibleCount, items.length);
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div style={{ height: containerHeight, overflow: 'auto' }} onScroll={onScroll}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, i) => (
            <div key={startIndex + i} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Milestone 2：架构设计

**Checkpoint：Monorepo 类型架构**

- 设计 3+ 包的 Monorepo
- 使用 TypeScript Project References
- 禁止循环依赖（通过 CI 检查）

**tsconfig.project.json 示例**：

```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "strict": true
  },
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/server" },
    { "path": "./packages/web" }
  ]
}
```

### Milestone 3：AI 集成

**Checkpoint：AI Agent 原型**

- 集成 MCP 协议（97M+ 月下载，10K+ servers）
- 实现工具调用（Function Calling）
- 流式响应 + 类型安全
- 可选：实现 A2A（Agent-to-Agent）协议互操作

**MCP 服务器工具定义示例**：

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  { name: 'weather-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_forecast',
      description: '获取指定城市的天气预报',
      inputSchema: {
        type: 'object',
        properties: {
          city: { type: 'string', description: '城市名称' },
          days: { type: 'number', description: '预报天数 (1-7)', minimum: 1, maximum: 7 },
        },
        required: ['city'],
      } as const,
    },
  ],
}));
```

---

## 四、架构师路径（8-12 周）

### Milestone 1：形式化基础

**Checkpoint：阅读 ECMA-262 规范**

- 能追踪 `Promise.then` 的规范算法步骤
- 理解 Completion Record 的传播机制
- 能解释 V8 的 Hidden Class 优化原理

**规范追踪示例**：

```javascript
// 对应 ECMA-262 26.2.5.4 Promise.prototype.then
// 步骤分解：
// 1. Let promise be the this value.
// 2. If IsPromise(promise) is false, throw a TypeError.
// 3. Let C be ? SpeciesConstructor(promise, %Promise%).
// 4. Let resultCapability be ? NewPromiseCapability(C).
// 5. Return PerformPromiseThen(promise, onFulfilled, onRejected, resultCapability).
```

### Milestone 2：运行时选型

**Checkpoint：运行时对比报告**

- 为给定业务场景选择最优运行时（Node.js 24 / Bun 1.2 / Deno 2）
- 编写基准测试验证假设
- 设计混合运行时架构
- 考虑边缘运行时的安全沙箱与冷启动特性

### Milestone 3：安全审计

**Checkpoint：供应链安全分析**

- 生成项目的 SBOM
- 识别间接依赖中的已知漏洞
- 设计权限最小化的运行时部署

**SBOM 生成命令**：

```bash
# 使用 CycloneDX 生成 SBOM
npx @cyclonedx/cyclonedx-npm --output-file sbom.json

# 使用 Snyk 扫描漏洞
npx snyk test --json > vuln-report.json

# Node.js 权限最小化运行
node --experimental-permission --allow-fs-read="./src/**" --allow-fs-write="./logs/**" index.js
```

---

## 五、自测题库（示例）

### 类型系统

**Q1**：以下代码的输出是什么？为什么？

```javascript
console.log([] + {});
console.log({} + []);
```

**答案**：`'[object Object]'` 和 `'[object Object]'`。`+` 运算符触发 ToPrimitive，对象转为字符串 `'[object Object]'`，数组转为空字符串 `''`。

### 异步

**Q2**：以下代码的输出顺序是什么？

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
```

**答案**：`1, 4, 3, 2`。同步代码先执行，然后是微任务（Promise），最后是宏任务（setTimeout）。

### 框架生态

**Q3**：React 19 Compiler 如何消除 `useMemo` 和 `useCallback`？

**答案**：Compiler 通过静态分析组件的 props、state 和上下文依赖，在编译时自动插入记忆化逻辑。它将 JSX 输出和事件处理函数标记为可缓存，仅当实际依赖变化时重新计算，消除了手动编写记忆化钩子的负担。

### 性能

**Q4**：为什么 `transform: translate()` 动画比 `top` 动画流畅？

**答案**：`transform` 触发仅合成路径（Composite），由 GPU 处理；`top` 触发完整渲染管道（Layout + Paint + Composite），计算量更大。

### AI Agent

**Q5**：MCP（Model Context Protocol）相比传统 Function Calling 的核心优势是什么？

**答案**：MCP 将工具定义从应用代码中解耦为标准化的 JSON Schema 描述，服务器端独立暴露能力列表。客户端通过统一协议发现可用工具，支持多服务器聚合、权限隔离和版本演化，无需修改客户端代码即可扩展功能。

### 边缘部署

**Q6**：在 Cloudflare Workers 中，为什么需要注意 `eval()` 和 `new Function()` 的使用？

**答案**：Cloudflare Workers 使用 V8 Isolates 作为安全沙箱，出于安全考虑禁用了动态代码执行（`eval`、`new Function`、`WebAssembly.instantiate` with untrusted bytes）。任何依赖动态代码生成的库（如某些模板引擎）都无法直接使用，需要选择 AOT 编译替代方案。

---

## 六、权威外部资源

| 资源 | 链接 | 说明 |
|------|------|------|
| TypeScript 官方文档 | [typescriptlang.org/docs](https://www.typescriptlang.org/docs/) | 类型系统学习权威来源 |
| React 官方学习路径 | [react.dev/learn](https://react.dev/learn) | 框架核心概念 |
| MDN JavaScript 指南 | [developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide) | 语言语义深度参考 |
| Node.js 最佳实践 | [github.com/goldbergyoni/nodebestpractices](https://github.com/goldbergyoni/nodebestpractices) | 后端工程规范 |
| Web Vitals | [web.dev/vitals](https://web.dev/vitals/) | 性能指标官方定义与优化指南 |
| Model Context Protocol | [modelcontextprotocol.io](https://modelcontextprotocol.io/) | AI Agent 协议规范 |
| OWASP Cheat Sheet | [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/) | 安全编码速查 |
| Cloudflare Workers 文档 | [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers/) | 边缘运行时官方文档 |
| tRPC 文档 | [trpc.io/docs](https://trpc.io/docs) | 端到端类型安全 API |
| Vite 官方指南 | [vitejs.dev/guide](https://vitejs.dev/guide/) | 构建工具与现代开发体验 |

---

*本机制为学习路径提供可验证的掌握标准，确保知识转化为能力。*
