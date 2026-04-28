# Signals Paradigm: Cross-Framework Reactive Primitive

> **English Summary** of `20.5-frontend-frameworks/signals-patterns/README.md`

---

## What Are Signals

**Signals** are observable state units with:

- **Value**: current state
- **Subscribers**: computations/effects that depend on the signal
- **Update semantics**: only direct subscribers are notified on change

## Cross-Framework Support (2026)

| Framework | Signals API | Implementation |
|-----------|------------|----------------|
| **SolidJS** | `createSignal()` | Native, zero VDOM |
| **Vue 3.5+** | `shallowRef()` / `computed()` | Proxy + dependency tracking |
| **Angular 16+** | `signal()` | Change detection integration |
| **Preact** | `@preact/signals` | Runtime patch |
| **Svelte 5** | `$state()` / `$derived()` | Compile-time transformation |

## Performance Advantage

Signals provide **6-10x** better update performance than React Context for fine-grained state updates.

## Theorem (Signals Consistency)

In a DAG structure, Signals' update propagation guarantees that all derived signals eventually converge to a state consistent with atomic signals, provided no circular dependencies exist.

---

*English summary. Full Chinese analysis: `../../20-code-lab/20.5-frontend-frameworks/signals-patterns/README.md`.*
