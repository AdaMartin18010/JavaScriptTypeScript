# Build-Free TypeScript Guide

> Type Stripping paradigm: running TypeScript directly in Node.js 24, Deno 2.7, and Bun 1.3 without compilation.

---

## 1. What is Type Stripping?

**Type Stripping** means the runtime removes type annotations at the lexical level during loading, without type checking, syntax transformation, or polyfill injection.

```
Traditional:  .ts → tsc/esbuild/swc → .js → Runtime
Type Stripping: .ts → Runtime (strip types) → Execute
```

## 2. Runtime Comparison (2026-04)

| Runtime | Flag | Type Check | Transform | Maturity |
|---------|------|------------|-----------|----------|
| Node.js 24 | `--experimental-strip-types` | ❌ | Limited | Experimental |
| Deno 2.7 | Native | ❌ | ❌ | Stable |
| Bun 1.3 | Native | ❌ | ❌ | Stable |

## 3. When to Use What?

- **Development**: Deno or Bun for instant startup
- **CI/CD**: Keep `tsc --noEmit` for type checking
- **Production**: Node.js 24 (when stable) or Bun for performance
- **Complex builds**: Still need `tsx` or `tsgo` for transforms

*For the full Chinese version, see [../guides/build-free-typescript-guide.md](../guides/build-free-typescript-guide.md)*
