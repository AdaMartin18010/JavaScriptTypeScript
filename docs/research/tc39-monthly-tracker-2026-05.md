# TC39 / TypeScript / WinterTC Monthly Tracker — May 2026

> Sources: tc39/proposals, microsoft/TypeScript, wintertc.org
> Compiled: 2026-05-27
> Next update: 2026-06-27

---

## 📋 TC39 Proposal Status Update

### Stage 4 → ES2026 (Finalized)

| Proposal | Description | Impact |
|----------|-------------|--------|
| **Temporal API** | Modern Date replacement | High — covered in `01-ecmascript-evolution`; update browser compat matrix |
| **Error.isError** | Cross-realm Error brand check | Medium — new safety utility |
| **Math.sumPrecise** | Precise floating-point summation | Low — numeric computing supplement |
| **Uint8Array Base64** | Native Base64 codec | Medium — replaces atob/btoa and third-party libs |

### Stage 3 → Approaching Stage 4

| Proposal | Description | Expected Stage 4 |
|----------|-------------|------------------|
| **Explicit Resource Management** | `using` declaration for automatic resource disposal | 2026 Q2 (pending May meeting) |
| **Decorator Metadata** | Decorator metadata API | 2026 Q3 |
| **Atomics.pause** | Shared-memory spinlock optimization | 2026 Q2 (pending May meeting) |

### Stage 2.7 → Worth Watching

| Proposal | Description | Risk/Opportunity |
|----------|-------------|-----------------|
| **Immutable ArrayBuffer** | Immutable ArrayBuffer | Security enhancement, Web Crypto scenarios |
| **Iterator Chunking** | `Iterator.prototype.chunk` | Data processing efficiency boost |
| **Seeded PRNG** | Seedable pseudo-random number generator | Test determinism |
| **Import Defer** | Deferred module loading | High potential — first-screen optimization |

### Stage 2 → Early Observation

| Proposal | Description | Assessment |
|----------|-------------|------------|
| **Import Bytes** | Import binary files as Uint8Array | Medium potential — asset bundling simplification |
| **Module Expressions** | Inline module definitions | Medium potential — dynamic module scenarios |
| **Float16Array** | 16-bit float typed array | Low-medium — ML/graphics use cases |

---

## 🔷 TypeScript Update Tracker

### TypeScript 7.0 (tsgo)

| Dimension | Status | Details |
|-----------|--------|---------|
| Version status | Beta (released Apr 2026) | `@typescript/native-preview` |
| Build speed | 10× improvement | Go rewrite, parallel parsing |
| Compiler API | Breaking risk | Toolchain authors must migrate to WASM/LSP |
| `--strict` default | Under discussion | Target 7.0 or 8.0 |
| `stableTypeOrdering` | New config | Type-check output order stability |

**Impact assessment**:

- High — update `guides/typescript-7-migration.md` with Beta feedback
- High — evaluate jsts-language-core-system type-system doc compatibility
- Medium — toolchain comparison matrix needs tsgo measured data

### TypeScript 6.x Latest

- 6.0 Beta released, primarily language-service performance optimizations.
- 6.x series is the bridge toward 7.0.

---

## 🌐 WinterTC / TC55 Standardization Tracker

### Minimum Common Web API

| API | Status | Node.js | Deno | Bun |
|-----|--------|---------|------|-----|
| `fetch` | Standard | ✅ | ✅ | ✅ |
| `WebSocket` | Standard | ✅ (stable in Node 24) | ✅ | ✅ |
| `Blob` / `File` | Standard | ✅ | ✅ | ✅ |
| `CacheStorage` | Under evaluation | ❌ | ✅ | ❌ |
| `CompressionStream` | Standard | ✅ | ✅ | ✅ |
| `Navigator` | Partial | ⚠️ | ✅ | ❌ |

### Hono and WinterTC Alignment

- Hono 3.x+ has passed WinterTC compatibility tests.
- Positioned as "the Express of the WinterTC world".
- Impact: update Hono positioning in `backend-frameworks-compare.md`.

---

## 📊 May Action Checklist

- [ ] Explicit Resource Management Stage 4 vote (May TC39 meeting)
- [ ] Atomics.pause Stage 4 vote (May TC39 meeting)
- [ ] tsgo Beta feedback collection, update TS 7.0 migration guide
- [ ] Decorator Metadata browser implementation status check
- [ ] Import Defer Stage 2 → 2.7 progress tracking
- [ ] New proposal watch: Float16Array, Array.fromAsync updates

---

> Auto-generation hint: Consider using GitHub API to track README changes in tc39/proposals.
> Human review: Last Friday of each month by maintainers.
