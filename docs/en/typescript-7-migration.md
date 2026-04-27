# TypeScript 7.0 / tsgo Migration Guide

> English summary of the TypeScript 7.0 migration guide. Covers Project Corsa (tsgo), the Go-based compiler rewrite, breaking changes, and migration strategies for engineering teams.
>
> **Beta**: April 2026 | **GA Expected**: Q2–Q3 2026

---

## What is TypeScript 7.0 (tsgo)?

TypeScript 7.0 (codename **Project Corsa**, CLI **`tsgo`**) is Microsoft's native rewrite of the TypeScript compiler — porting the compiler frontend from TypeScript/JavaScript to **Go**. The goal is a ~10× compile-time speedup while preserving 100% semantic compatibility.

| Dimension | Old Compiler (tsc 5.x) | tsgo (TypeScript 7.0) |
|-----------|------------------------|----------------------|
| Language | TypeScript / JavaScript | Go |
| Concurrency | Single-threaded event loop | Go goroutines + shared-memory parallelism |
| Memory | V8 GC | Go GC (more predictable pauses) |
| AST allocation | Many small objects | Flattened memory layout |
| Incremental | File-level | Module-graph-level + fine-grained cache |

---

## Performance Data (Official Benchmarks)

### Large Codebase Compile Speed

| Project | LOC | tsc (5.8) | tsgo (7.0) | Speedup |
|---------|-----|-----------|------------|---------|
| VS Code | ~1.5M | 77.8s | **7.5s** | **10.4×** |
| Playwright | ~400K | 11.1s | **1.1s** | **10.1×** |
| Microsoft Monorepo | ~5M | 312s | **28s** | **11.1×** |

### Memory Usage

| Metric | tsc (5.8) | tsgo (7.0) | Change |
|--------|-----------|------------|--------|
| VS Code type-check peak | 4.8 GB | **2.3 GB** | **↓ 52%** |
| Playwright type-check peak | 1.2 GB | **0.6 GB** | **↓ 50%** |

### Editor Experience

| Metric | tsc (5.8) | tsgo (7.0) | Change |
|--------|-----------|------------|--------|
| VS Code language-service cold start | 4.2s | **0.5s** | **↓ 8.4×** |
| Symbol completion P95 | 380ms | **45ms** | **↓ 8.4×** |
| Find-all-references P95 | 2.1s | **0.2s** | **↓ 10.5×** |

---

## Breaking Changes

1. **`--strict` enabled by default** — Most strict-mode projects need no changes. Legacy projects should first upgrade to TS 6.0 and fix type errors.
2. **`target` defaults to ES2025** — No longer downgrades `async/await`, class fields, etc. Explicitly set `"target": "ES2015"` for older environments.
3. **ES5 down-level emit removed** — The minimum transpilation target is ES2015 (ES6). For IE11, keep TS 5.x/6.x or use Babel/SWC.
4. **`baseUrl` removed** — `paths` must be relative to `tsconfig.json` or use `rootDir`.
5. **`node10` module resolution removed** — Minimum is `node16`. Recommended: `"moduleResolution": "NodeNext"`.

---

## Compiler API Breakage for Tool Authors

All tools depending on internal `typescript` APIs (ESLint TS plugin, Prettier, TypeDoc, ts-morph, Volar) must migrate.

| Area | tsc (5.x) | tsgo (7.0) |
|------|-----------|------------|
| AST node types | `ts.SourceFile` / `ts.Node` | Flattened Go struct WASM bindings |
| Type serialization | `checker.typeToString()` | WASM boundary call |
| Program build | `ts.createProgram()` | `tsgo.createProgram()` (async) |
| Language service | `ts.createLanguageService()` | Native Go LSP |

### Migration Paths

- **WASM bindings** (`@typescript/wasm-api`) — For AST tools. ~60-70% of native speed, still 6-7× faster than old tsc.
- **LSP layer** — For non-AST tools. Use tsgo LSP extension commands; no AST handling required.

---

## Migration Roadmap

TypeScript 6.0 (March 2025) is designed as a **bridge version**:

```
TS 5.8 project
  → Step 1: Upgrade to TS 6.0 (fix all deprecation warnings)
  → Step 2: Enable --strict, fix legacy type issues
  → Step 3: Update moduleResolution to NodeNext
  → Step 4: Evaluate toolchain compatibility (ESLint/Prettier/TypeDoc)
  → Step 5: Upgrade to TS 7.0, switch to tsgo CLI
  → Step 6: CI parallel acceleration with --incremental cache
```

### Decision Tree

```
Start evaluating TS 7.0
├── Project uses --strict?
│   ├── NO → Upgrade to TS 6.0 first, enable --strict, fix errors
│   └── YES → Continue
├── Need ES5 support?
│   ├── YES → Keep TS 5.x/6.x down-level pipeline, or Babel/SWC
│   └── NO → Continue
├── Toolchain compatible?
│   ├── NO → Wait for ESLint/Prettier plugin updates
│   └── YES → Continue
└── Project scale?
    ├── >500K LOC / Monorepo → Adopt tsgo immediately (CI minutes → seconds)
    └── <500K LOC → Can keep tsc 5.x; tsgo benefits marginal
```

---

## Install & CLI

```bash
# Install preview
npm install -g @typescript/native-preview

# tsgo CLI mirrors tsc
tsgo --version              # Version 7.0.0-dev.xxx
tsgo --noEmit               # Type-check only
tsgo --build                # Project references
tsgo --watch                # Watch mode (Go native fsnotify)
tsgo --init                 # Generate tsconfig.json
tsgo lsp                    # Language server
```

---

*For the full Chinese version, see [../guides/typescript-7-migration.md](../guides/typescript-7-migration.md)*
