# Build-Free TypeScript Guide — English Summary

> Full Chinese version: [`docs/guides/build-free-typescript-guide.md`](../guides/build-free-typescript-guide.md)

## Overview

**Build-Free TypeScript** (also called "Type Stripping") is a paradigm shift in 2026 where JavaScript runtimes execute `.ts` files directly without a compilation step.

## Three Runtimes Compared

| Feature | Node.js 24 | Deno 2.7 | Bun 1.3 |
|---------|-----------|----------|---------|
| **Type Stripping** | ✅ `--experimental-strip-types` (stable) | ✅ Native | ✅ Native |
| **Import Resolution** | ESM + `tsconfig.json` paths | Native ESM/URL imports | ESM + CommonJS compat |
| **Performance** | Baseline | Fast (Rust core) | Fastest (Zig core) |
| **IDE Support** | Full (tsconfig) | Full (deno.json) | Good (bun-types) |
| **Production Ready** | ✅ (stable API) | ✅ | ✅ |

## When to Use Type Stripping

| Scenario | Recommendation |
|----------|---------------|
| New project, simple setup | **Deno 2.7** — zero config |
| Existing Node.js ecosystem | **Node.js 24** — gradual migration |
| Performance-critical tooling | **Bun 1.3** — fastest execution |
| Fullstack with React/Vite | **Node.js 24** — best ecosystem compatibility |

## Limitations

- No runtime type checking (types erased at execution)
- Decorators require explicit configuration
- `const enum` and `namespace` may need transpilation
- Source maps for debugging require separate generation

---

> 📅 Summary generated: 2026-04-27
