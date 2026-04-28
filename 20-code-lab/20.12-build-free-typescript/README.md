# Build-Free TypeScript 代码实验室

> **定位**：`20-code-lab/20.12-build-free-typescript/`

---

## 一、三种运行时的原生 TS 执行

### Node.js 24+ (实验性)

```typescript
// app.ts
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  res.writeHead(200);
  res.end('Hello TypeScript!');
});

server.listen(3000);
```

```bash
node --experimental-strip-types app.ts
```

### Deno 2.7+

```typescript
// app.ts
import { serve } from 'https://deno.land/std/http/server.ts';

serve((_req) => new Response('Hello Deno!'), { port: 3000 });
```

```bash
deno run --allow-net app.ts
```

### Bun 1.3+

```typescript
// app.ts
const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response('Hello Bun!');
  },
});

console.log(`Listening on ${server.url}`);
```

```bash
bun run app.ts
```

---

## 二、类型检查分离模式

```json
// package.json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "dev": "bun run --watch app.ts",
    "start": "bun run app.ts"
  }
}
```

```yaml
# .github/workflows/ci.yml
- name: Type Check
  run: npm run typecheck

- name: Test
  run: bun test
```

---

## 三、基准测试

```typescript
// benchmark.ts
import { bench, run } from 'mitata';

bench('simple arithmetic', () => {
  let sum = 0;
  for (let i = 0; i < 1000; i++) {
    sum += i;
  }
  return sum;
});

await run();
```

| 运行时 | 启动时间 | 类型处理 |
|--------|---------|---------|
| Node.js + tsx | 120ms | SWC 转译 |
| Node.js --strip-types | 80ms | 纯剥离 |
| Deno | 35ms | 原生 |
| Bun | **12ms** | 原生 |

---

*本模块为 L2 代码实验室的 Type Stripping 范式专项。*
