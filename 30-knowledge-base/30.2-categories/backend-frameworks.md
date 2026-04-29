# 后端框架

> JavaScript/TypeScript 后端框架选型矩阵。

---

## 主流框架对比

| 维度 | Express | Fastify | NestJS | Hono | Elysia |
|------|---------|---------|--------|------|--------|
| **定位** | 极简经典 | 高性能 Node.js | 企业级架构 | 边缘优先 | 类型安全 Bun 优先 |
| **吞吐量** | 低（~15K req/s） | 高（500K+ req/s） | 中 | 极高（840K req/s） | 极高（~700K req/s） |
| **TypeScript** | 需配置 | 插件 | 原生 | 原生 | 原生 |
| **中间件模型** | 回调函数 | 钩子 + 插件 | 装饰器 + IoC | 内置中间件 | 编译时宏 |
| **校验** | 手动 / Joi | JSON Schema | class-validator | Zod / Validator | 类型推导校验 |
| **生态成熟度** | 最丰富 | 快速增长 | 丰富 | 快速增长 | 新兴 |
| **运行环境** | Node.js | Node.js | Node.js | Node.js / Edge / Deno | Bun / Node.js |
| **学习曲线** | 极低 | 低 | 高 | 极低 | 低 |
| **2026 状态** | ⚠️ 维护放缓 | ✅ 活跃 | ✅ 活跃 | ✅ 快速增长 | ✅ 快速增长 |

---

## 代码示例：Fastify + TypeScript

```typescript
import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

const app = Fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

// 自动类型推导 + JSON Schema 校验
const UserSchema = Type.Object({
  id: Type.Number(),
  name: Type.String({ minLength: 1 }),
  email: Type.String({ format: 'email' }),
});

app.get('/users/:id', {
  schema: {
    params: Type.Object({ id: Type.Number() }),
    response: { 200: UserSchema },
  },
}, async (request) => {
  // request.params.id 被推导为 number
  return { id: request.params.id, name: 'Alice', email: 'alice@example.com' };
});

async function bootstrap() {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
bootstrap();
```

---

## 选型建议

| 场景 | 推荐框架 |
|------|----------|
| 快速原型 / 小型 API | Express / Hono |
| 高吞吐 API / 微服务 | Fastify / Elysia |
| 企业级 / 复杂业务 | NestJS |
| 边缘函数 / Cloudflare Workers | Hono |
| 类型安全极致追求 | Elysia (Bun) |

---

## 权威参考链接

- [Express 官方文档](https://expressjs.com/)
- [Fastify 官方文档](https://fastify.dev/)
- [NestJS 官方文档](https://nestjs.com/)
- [Hono 官方文档](https://hono.dev/)
- [Elysia 官方文档](https://elysiajs.com/)
- [TechEmpower Web Framework Benchmarks](https://www.techempower.com/benchmarks/)

---

*最后更新: 2026-04-29*
