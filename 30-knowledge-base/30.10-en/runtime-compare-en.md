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

## Key Insight

**Runtime Convergence Theorem**: In 2026, the three runtimes are converging through competition rather than fragmenting. Node.js adopts competitor features (native Fetch, built-in testing, `node:sqlite`), while Bun/Deno improve npm compatibility. The emerging pattern is **hybrid architecture**: Node.js for core services + Bun for edge functions + Deno for sensitive computations.

---

*English summary. Full Chinese matrix: `../30.3-comparison-matrices/runtime-compare.md`.*
