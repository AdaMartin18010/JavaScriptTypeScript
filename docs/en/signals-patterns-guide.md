# Signals Patterns Guide

> Understanding Signals as a cross-framework reactive paradigm: from SolidJS to Angular, Vue, and Svelte.

---

## 1. What are Signals?

**Signals** are a fine-grained reactive primitive that tracks dependencies at the value level, not the component level.

```typescript
// Core Signal API (framework-agnostic concept)
function createSignal<T>(initial: T): [() => T, (v: T) => void] {
    let value = initial;
    const subscribers = new Set<() => void>();

    const read = () => {
        // Track dependency
        return value;
    };

    const write = (next: T) => {
        value = next;
        subscribers.forEach(fn => fn());
    };

    return [read, write];
}
```

## 2. Framework Implementations

| Framework | Signal API | Granularity |
|-----------|-----------|-------------|
| **SolidJS** | `createSignal()` | Value-level (finest) |
| **Preact** | `@preact/signals` | Value-level |
| **Angular** | `signals()` (v16+) | Value-level |
| **Vue 3.5+** | Vapor Mode | Compile-time signalization |
| **Svelte 5** | Runes (`$state`, `$derived`) | Explicit signals |
| **alien-signals** | Standalone library | Framework-agnostic |

## 3. Signals vs Hooks vs Observer

| Pattern | Re-renders | Mental Model | Learning Curve |
|---------|-----------|--------------|----------------|
| **Signals** | None (fine-grained DOM updates) | Reactive graph | Low |
| **Hooks** | Component-level | Function composition | Medium |
| **Observer** | Component-level | Subscription-based | Medium |

**Performance**: Signals are 6-10x faster than React Context for prop drilling scenarios.

## 4. When to Choose What?

- **Choose Signals** when: frequent fine-grained updates, performance-critical UI, shared state with many consumers
- **Choose Hooks** when: React ecosystem, team familiarity, simple component-local state
- **Choose Observer** when: RxJS pipelines, complex async streams, event-driven architectures

*For the full Chinese version, see [../guides/signals-patterns-guide.md](../guides/signals-patterns-guide.md)*
