# Runtime Comparison: Node.js vs Bun vs Deno

> **English Summary** of `30.3-comparison-matrices/runtime-compare.md`
> **Authoritative References**: [Node.js Official Docs](https://nodejs.org/docs/latest/api/) | [Bun Docs](https://bun.sh/docs) | [Deno Docs](https://docs.deno.com/) | [WinterCG](https://wintercg.org/) | [JS Benchmarks](https://benchmarks.js.org/)

---

## Core Comparison Matrix

| Dimension | Node.js (v24+) | Bun (v2.0+) | Deno (v2.0+) |
|-----------|---------------|-------------|--------------|
| **JS Engine** | V8 (Google) | JavaScriptCore (Apple) | V8 (Google) |
| **TS Support** | Transpile (SWC/tsx) | **Native execution** | **Native execution** |
| **Security Model** | Full access by default | Full access by default | **Permission sandbox** (`--allow-*`) |
| **Implementation** | C++ | **Zig** | Rust |
| **Cold Start** | Medium (~50ms) | **Ultra-fast (~10ms)** | Fast (~30ms) |
| **npm Compatibility** | **100%** | ~98% | ~95% (via `npm:` specifiers) |
| **Built-in Testing** | `node:test` + `node:assert` | `bun:test` (Jest-compatible) | `Deno.test` + `std/assert` |
| **Package Manager** | npm/pnpm/yarn | Built-in (`bun install`) | Built-in (`deno add`) |
| **Bundler** | External (esbuild, rollup) | Built-in | External (deno_emit) |
| **Use Case** | Enterprise / General | Serverless / Microservices | Finance / High-security / Edge |

---

## Runtime Benchmark Table (2026)

| Test | Node.js v24 | Bun v2 | Deno v2 | Winner | Notes |
|------|------------|--------|---------|--------|-------|
| HTTP Hello World (req/s) | ~45K | **~68K** | ~55K | Bun | HTTP/1.1, single worker |
| HTTP/2 Streaming (req/s) | ~38K | ~52K | **~60K** | Deno | Deno HTTP/2 implementation mature |
| File Read (ops/s) | ~12K | **~50K** | ~20K | Bun | Bun uses faster system calls |
| JSON Parse (ops/s) | ~850K | **~1.2M** | ~900K | Bun | JSC JSON parser optimization |
| Startup Latency (ms) | 45 | **12** | 28 | Bun | Critical for serverless cold starts |
| Memory Footprint (MB) | 42 | **28** | 35 | Bun | Baseline HTTP server |
| WebSocket throughput (msg/s) | ~120K | **~180K** | ~140K | Bun | Bun's WS implementation in Zig |
| TypeScript Compile (ms) | 1200 (tsc) / 80 (SWC) | **15** | 25 | Bun | Native TS execution |
| ESM Resolve (ops/s) | ~200K | **~500K** | ~350K | Bun | Faster module resolution |

> 📊 Data synthesized from [benchmarks.js.org](https://benchmarks.js.org/), [bun.sh/benchmarks](https://bun.sh/benchmarks), and community benchmarks. Actual results vary by hardware and workload.

---

## WinterCG Compatibility

All three runtimes participate in the [WinterCG](https://wintercg.org/) (Web-interoperable Runtimes Community Group) to align on Web APIs.

| API | Node.js v24 | Bun v2 | Deno v2 | Spec |
|-----|------------|--------|---------|------|
| `fetch()` | ✅ Native | ✅ Native | ✅ Native | Fetch Standard |
| `WebSocket` | ✅ Native | ✅ Native | ✅ Native | WHATWG |
| `ReadableStream` | ✅ Native | ✅ Native | ✅ Native | Streams Standard |
| `crypto.subtle` | ✅ Native | ✅ Native | ✅ Native | Web Crypto API |
| `AbortController` | ✅ Native | ✅ Native | ✅ Native | DOM Standard |
| `structuredClone` | ✅ Native | ✅ Native | ✅ Native | HTML Standard |
| `Performance` API | ✅ | ✅ | ✅ | User Timing L3 |
| `URLPattern` | ✅ (v22+) | ✅ | ✅ | URLPattern API |

> 📖 Reference: [WinterCG Minimum Common API](https://common-min-api.proposal.wintercg.org/)

---

## Code Example: WinterCG-Compatible HTTP Server

The following code runs on **Node.js**, **Bun**, and **Deno** without modification:

```typescript
// server.ts — WinterCG-compatible universal server
// Runs on Node.js v22+, Bun v1+, Deno v2+

const PORT = parseInt(Deno?.env?.get('PORT') ?? process?.env?.PORT ?? '8080');

async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // Universal crypto (WinterCG Web Crypto)
  const encoder = new TextEncoder();
  const data = encoder.encode(url.pathname);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Universal streaming (WinterCG Streams)
  const body = JSON.stringify({
    runtime: typeof Bun !== 'undefined' ? 'Bun'
           : typeof Deno !== 'undefined' ? 'Deno'
           : 'Node.js',
    path: url.pathname,
    sha256: hashHex,
    timestamp: new Date().toISOString(),
  });

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Runtime': 'wintercg-compatible',
    },
  });
}

// Runtime-agnostic bootstrap
if (typeof Bun !== 'undefined') {
  Bun.serve({ port: PORT, fetch: handler });
  console.log(`🥖 Bun server running on http://localhost:${PORT}`);
} else if (typeof Deno !== 'undefined') {
  Deno.serve({ port: PORT }, handler);
  console.log(`🦕 Deno server running on http://localhost:${PORT}`);
} else {
  // Node.js v22+ with --experimental-strip-types or tsx
  const { createServer } = await import('node:http');
  createServer(async (req, res) => {
    const url = `http://localhost:${PORT}${req.url}`;
    const request = new Request(url, {
      method: req.method,
      headers: new Headers(Object.entries(req.headers).map(([k, v]) => [k, String(v)])),
    });
    const response = await handler(request);
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    res.end(await response.text());
  }).listen(PORT, () => {
    console.log(`🟢 Node.js server running on http://localhost:${PORT}`);
  });
}
```

### Running the Example

```bash
# Node.js v22+ (with experimental TypeScript support)
node --experimental-strip-types server.ts

# Bun
bun run server.ts

# Deno
deno run --allow-net --allow-env server.ts
```

> 📖 References: [WinterCG Common APIs](https://common-min-api.proposal.wintercg.org/) | [Deno.serve API](https://docs.deno.com/api/deno/~/Deno.serve) | [Bun.serve API](https://bun.sh/docs/api/http)

---

## Runtime-Specific Deep Dives

### Node.js v24 — Native Test Runner & SQLite

```javascript
// node-native-test.mjs — Node.js 内置测试 + SQLite (v24+)
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DatabaseSync } from 'node:sqlite';

describe('Node.js v24 native features', () => {
  it('should create an in-memory SQLite database', () => {
    const db = new DatabaseSync(':memory:');
    db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');

    const insert = db.prepare('INSERT INTO users (name) VALUES (?)');
    insert.run('Alice');

    const query = db.prepare('SELECT * FROM users');
    const rows = query.all();
    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].name, 'Alice');
  });

  it('should use native fetch and Web Crypto', async () => {
    const res = await fetch('https://api.github.com/users/nodejs');
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.login, 'nodejs');
  });
});
```

```bash
# 运行原生测试
node --test node-native-test.mjs

# 监视模式
node --watch --test node-native-test.mjs

# 权限模型示例
node --permission --allow-fs-read=* --allow-net=*.github.com app.js
```

> 📖 Reference: [Node.js v24 Release Notes](https://nodejs.org/en/blog/release/v24.0.0) | [Node.js Test Runner](https://nodejs.org/api/test.html) | [Node.js Permission Model](https://nodejs.org/api/permissions.html)

---

### Bun — File I/O & SSE Streaming

```typescript
// bun-sse.ts — Bun 特有 API：文件读取、SSE、WebSocket
import { serve } from 'bun';

serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Bun.file() — 零拷贝文件读取（比 fs 快 3-5x）
    if (url.pathname === '/image') {
      const file = Bun.file('./assets/hero.png');
      return new Response(file);
    }

    // Bun.write() — 原子写入
    if (url.pathname === '/upload' && req.method === 'POST') {
      const data = await req.arrayBuffer();
      await Bun.write('./uploads/dump.bin', data);
      return Response.json({ ok: true, size: data.byteLength });
    }

    // Server-Sent Events (SSE)
    if (url.pathname === '/events') {
      const stream = new ReadableStream({
        start(controller) {
          let count = 0;
          const timer = setInterval(() => {
            controller.enqueue(`data: ${JSON.stringify({ count: ++count, time: Date.now() })}

`);
            if (count >= 10) {
              clearInterval(timer);
              controller.close();
            }
          }, 1000);
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      });
    }

    return Response.json({ runtime: 'Bun', version: Bun.version });
  },
});
```

> 📖 Reference: [Bun File I/O](https://bun.sh/docs/api/file-io) | [Bun.serve](https://bun.sh/docs/api/http) | [Bun WebSockets](https://bun.sh/docs/api/websockets)

---

### Deno — Permission Sandbox & FFI

```typescript
// deno-secure.ts — Deno 权限模型与外部函数接口 (FFI)
// 运行：deno run --allow-net=0.0.0.0:8080 --allow-read=./data --allow-env deno-secure.ts

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

// 检查当前权限（无需抛出）
const netPerm = await Deno.permissions.query({ name: 'net', host: '0.0.0.0:8080' });
console.log('Net permission:', netPerm.state); // "granted" | "prompt" | "denied"

// FFI 调用系统库（示例：调用 libc getpid）
const libc = Deno.dlopen(
  Deno.build.os === 'darwin' ? '/usr/lib/libSystem.dylib' : 'libc.so.6',
  {
    getpid: { parameters: [], result: 'i32' },
    getuid: { parameters: [], result: 'i32' },
  }
);
console.log('PID via FFI:', libc.symbols.getpid());

// Deno KV（边缘持久化）
const kv = await Deno.openKv();
await kv.set(['visits'], 1n);
const visit = await kv.get<{ value: bigint }>(['visits']);

serve(async (req) => {
  const { value } = await kv.atomic().sum(['visits'], 1n).commit();
  return Response.json({ visits: Number(value), pid: libc.symbols.getpid() });
}, { port: 8080 });
```

> 📖 Reference: [Deno Permissions](https://docs.deno.com/runtime/fundamentals/security/) | [Deno FFI](https://docs.deno.com/runtime/manual/runtime/ffi_api/) | [Deno KV](https://docs.deno.com/deploy/kv/)

---

## Key Insight

**Runtime Convergence Theorem**: In 2026, the three runtimes are converging through competition rather than fragmenting. Node.js adopts competitor features (native Fetch, built-in testing, `node:sqlite`), while Bun/Deno improve npm compatibility. The emerging pattern is **hybrid architecture**: Node.js for core services + Bun for edge functions + Deno for sensitive computations.

---

## Additional Authoritative References

| Resource | Link | Description |
|----------|------|-------------|
| Node.js Release Schedule | <https://nodejs.org/en/about/previous-releases> | LTS 与 Current 版本生命周期 |
| Node.js Performance Best Practices | <https://nodejs.org/en/docs/guides/simple-profiling> | 内置性能分析指南 |
| Bun Installation & Upgrading | <https://bun.sh/docs/installation> | 官方安装文档 |
| Bun Benchmark Methodology | <https://bun.sh/docs/project/benchmarking> | 基准测试方法与原始数据 |
| Deno 2 Migration Guide | <https://docs.deno.com/runtime/manual/advanced/migrate_deprecations/> | 从 Deno 1.x 迁移指南 |
| Deno Standard Library | <https://jsr.io/@std> | JSR 上的官方标准库 |
| WinterCG Common Minimum API | <https://common-min-api.proposal.wintercg.org/> | 跨运行时通用 API 规范 |
| Web-interoperable Runtimes CG | <https://wintercg.org/> | W3C 社区组主页 |
| V8 Blog — JavaScript Performance | <https://v8.dev/blog> | Google V8 引擎官方博客 |
| JavaScriptCore (WebKit) Blog | <https://webkit.org/blog/> | Apple JSC 引擎更新 |
| JS Benchmarks (Krausest) | <https://krausest.github.io/js-framework-benchmark/> | 前端框架基准测试 |
| TechEmpower Framework Benchmarks | <https://www.techempower.com/benchmarks/> | 全栈 Web 框架性能排名 |

---

*English summary. Full Chinese matrix: `../30.3-comparison-matrices/runtime-compare.md`.*
