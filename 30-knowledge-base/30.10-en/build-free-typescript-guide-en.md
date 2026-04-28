# Build-Free TypeScript Guide

> **English Summary** of `30.1-guides/build-free-typescript-guide.md`

---

## Paradigm Shift: From Compile to Direct Execution

In 2026, JavaScript runtimes began natively supporting TypeScript execution:

| Runtime | Command | Status |
|---------|---------|--------|
| Node.js 24+ | `node --experimental-strip-types` | Experimental |
| Deno 2.7+ | `deno run file.ts` | Stable |
| Bun 1.3+ | `bun run file.ts` | Stable |

## Execution Modes

**Traditional (2020-2024)**:

```
.ts → tsc → .js → node
```

**Type Stripping (2026)**:

```
.ts → runtime strip-types → execute
```

**Recommended Separation**:

```
.ts → tsc --noEmit (CI check)
  └──→ runtime strip-types → execute
```

## Performance

Bun's TS startup is **3-5x** faster than `tsx`, **10-20x** faster than `ts-node`.

---

*English summary. Full Chinese guide: `../30.1-guides/build-free-typescript-guide.md`.*
