# Rust Unified Toolchain Migration Guide

> English summary of the Rust toolchain revolution in JavaScript/TypeScript tooling. Covers VoidZero (Vite + Rolldown + Oxc), Rspack, Biome, and migration strategies from legacy Babel/Webpack/ESLint stacks.
>
> **Research date**: April 2026

---

## The Core Problem: Repeated Parsing

A typical modern frontend pipeline parses the same source code **5+ times**:

```
Source → [ESLint Parse AST] → [Prettier Parse AST] → [TS Parse AST] → [Babel Parse AST] → [Webpack Parse AST] → [Terser Parse AST]
```

Each parse means wasted CPU, accumulated memory, inconsistent line/column reporting, and exponential configuration complexity.

| Tool | Parse Phase | Typical Cold-Start Time |
|------|-------------|------------------------|
| ESLint | Lint rules | 2.5s |
| Prettier | Format | 1.8s |
| TypeScript | Type check | 4.2s |
| Babel | Transform | 3.1s |
| Webpack | Bundle | 5.5s |
| Terser | Minify | 2.9s |
| **Total** | — | **~20s+** |

**~40-50% of CPU time is spent on repeated Lexing + Parsing**.

---

## VoidZero Unified Architecture

**"One AST, One Pass, Zero Redundant Work"**

| Component | Stack | Role | Status (2026 Q2) |
|-----------|-------|------|-----------------|
| **Vite** | TS/Rust hybrid | Dev server, HMR, plugin system | Stable v8.x |
| **Rolldown** | Rust | Production bundler | Default in Vite 8 |
| **Oxc** | Rust | Parser, Linter, Transformer, Minifier | Core modules stable |
| **Vitest** | TypeScript | Test framework | Stable v3.x |

### Performance Comparison

| Metric | Legacy (Webpack+Babel+Terser) | VoidZero (Vite+Rolldown+Oxc) | Speedup |
|--------|-------------------------------|------------------------------|---------|
| Cold build (large project) | 45-90s | 3-8s | **10-15×** |
| Incremental build | 5-15s | 50-200ms | **25-75×** |
| HMR response | 300-800ms | 10-50ms | **15-60×** |
| Peak memory | 2-4GB | 500MB-1GB | **3-4×** |
| Install size | 500MB+ | 80-150MB | **3-5×** |

---

## Rspack: ByteDance's Webpack-Compatible Revolution

Rspack takes a **"Webpack full compatibility + progressive optimization"** strategy, unlike Rolldown's "Rollup compatibility + rewrite" route.

| Dimension | Rspack | Rolldown |
|-----------|--------|----------|
| Compatibility target | Webpack fully compatible | Rollup API compatible |
| Architecture | Progressive Rustization | Full Rust rewrite |
| Parser | SWC | Oxc |
| Module format | CommonJS + ESM first | Native ESM, CJS supported |
| Tree Shaking | Webpack algorithm optimized | Rollup algorithm rewritten |
| HMR | Full Webpack HMR compatible | Vite native HMR (ESM-based) |
| Best for | Large legacy projects, Webpack ecosystem | New projects, Vite ecosystem, ESM-first |

**Rspack's unique advantages**:

1. Zero-config migration for thousands of Webpack projects.
2. Reuses complex custom loader chains via JS bridge layer.
3. Native Module Federation support for micro-frontends.
4. Enterprise SLA from ByteDance.

---

## Biome vs Oxc: Two Philosophies

| Dimension | Biome | Oxc |
|-----------|-------|-----|
| Origin | Rome Tools fork | VoidZero incubation, greenfield |
| Philosophy | "All-in-One" Swiss Army knife | "Modular Toolchain" LEGO bricks |
| Scope | Formatter + Linter + transform (planned) | Parser + Linter + Transformer + Minifier + format (planned) |
| Configuration | Single `biome.json` | Per-tool or host-integrated |
| Target user | Terminal developer (direct CLI) | Tool developer (library integration) |

- **Biome**: One command replaces `eslint + prettier`. 10-30× faster than the ESLint + Prettier combo.
- **Oxc**: Not a CLI tool for end users, but **low-level infrastructure** for other tools. Unified AST via Arena allocator, zero-copy traversal, increment-friendly.

---

## TypeScript Go (tsgo) Collaboration

TypeScript Go does **type checking only**, not code emit. This creates natural synergy with Rust toolchains:

- **Development**: Vite uses Oxc for fast transpile + HMR; tsgo runs type-checking in a separate process, feeding results via LSP.
- **Build**: Rolldown produces bundles; tsgo guards types. Both run in parallel.
- **Future**: tsgo may output type info (`.d.ts`, type maps) for Oxc to consume during transpile.

**Key insight**: tsgo strengthens Rust toolchains' positioning by clearly separating "type checking" (tsgo) from "code emit/transform/bundle/minify" (Rust toolchain).

---

## Migration Decision Matrix

### By Team Size

| Team Size | Current State | Recommended Path | Effort | Risk |
|-----------|--------------|------------------|--------|------|
| Personal / Small (1-5) | Any | Directly adopt Vite 8 + Oxc | 1-2 days | Minimal |
| Medium (5-20) | CRA / Webpack | Migrate to Vite, keep some Webpack config | 1-2 weeks | Low |
| Large (20-100) | Complex Webpack | Evaluate Rspack (compat) or Rolldown (refactor) | 1-2 months | Medium |
| Extra-large (100+) | Many legacy projects | Phased: Rspack first, then gradual Rustization | 3-6 months | Medium-High |

### Conservative vs Aggressive Paths

**Conservative (low risk)**:

```
Phase 1: Keep Webpack, replace Babel Loader with SWC/Rspack Loader (2× boost)
Phase 2: Introduce Biome to replace Prettier + ESLint (10× boost)
Phase 3: Evaluate full migration to Rspack (5-10× boost)
```

**Aggressive (high reward)**:

```
Phase 1: Migrate directly to Vite 8 (dev experience质变)
Phase 2: Switch production build to Rolldown (build speed质变)
Phase 3: Switch type-checking to tsgo (type-check speed质变)
```

---

## Future Outlook: Replacement or Coexistence?

**Most likely scenario: Hybrid ecosystem (60% probability)**

- **Core layer (Rust-dominated)**: Parser (Oxc/SWC), Bundler (Rolldown/Rspack), Minifier (Oxc), Type Checker (tsgo).
- **Bridge layer**: Vite plugin system, Rspack loader compat, unplugin ecosystem.
- **Extension layer (JS/TS persists)**: Custom ESLint rules, domain-specific transforms (Babel plugins), test frameworks (Vitest), build orchestration (Turborepo, Nx).

This mirrors OS kernels (C/Rust) + user-space apps, or database engines (C++) + stored procedures.

---

*For the full Chinese version, see [../research/rust-unified-toolchains.md](../research/rust-unified-toolchains.md)*
