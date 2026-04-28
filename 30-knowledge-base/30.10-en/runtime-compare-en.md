# Runtime Comparison: Node.js vs Bun vs Deno

> **English Summary** of `30.3-comparison-matrices/runtime-compare.md`

---

## Core Comparison Matrix

| Dimension | Node.js (v24+) | Bun (v2.0+) | Deno (v2.0+) |
|-----------|---------------|-------------|--------------|
| **JS Engine** | V8 (Google) | JavaScriptCore (Apple) | V8 (Google) |
| **TS Support** | Transpile (SWC/tsx) | **Native execution** | **Native execution** |
| **Security Model** | Full access by default | Full access by default | **Permission sandbox** |
| **Implementation** | C++ | **Zig** | Rust |
| **Cold Start** | Medium (~50ms) | **Ultra-fast (~10ms)** | Fast (~30ms) |
| **npm Compatibility** | **100%** | ~98% | ~95% |
| **Use Case** | Enterprise / General | Serverless / Microservices | Finance / High-security |

## Performance Benchmarks

| Test | Node.js v24 | Bun v2 | Deno v2 | Winner |
|------|------------|--------|---------|--------|
| HTTP Hello World (req/s) | ~45K | **~68K** | ~55K | Bun |
| File Read (ops/s) | ~12K | **~50K** | ~20K | Bun |
| Startup Latency (ms) | 45 | **12** | 28 | Bun |

## Key Insight

**Runtime Convergence Theorem**: In 2026, the three runtimes are converging through competition rather than fragmenting. Node.js adopts competitor features (native Fetch, built-in testing), while Bun/Deno improve npm compatibility. The emerging pattern is **hybrid architecture**: Node.js for core services + Bun for edge functions + Deno for sensitive computations.

---

*English summary. Full Chinese matrix: `../30.3-comparison-matrices/runtime-compare.md`.*
