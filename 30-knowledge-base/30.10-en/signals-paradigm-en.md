# Signals Paradigm: Cross-Framework Reactive Primitive

> **English Summary** of `20.5-frontend-frameworks/signals-patterns/README.md`
> **Authoritative References**: [TC39 Signals Proposal](https://github.com/tc39/proposal-signals) | [SolidJS Signals Docs](https://www.solidjs.com/docs/latest/api#createsignal) | [Preact Signals](https://preactjs.com/guide/v10/signals/) | [Vue Reactivity](https://vuejs.org/guide/extras/reactivity-in-depth.html) | [Angular Signals](https://angular.dev/guide/signals)

---

## What Are Signals

**Signals** are observable state units with:

- **Value**: current state
- **Subscribers**: computations/effects that depend on the signal
- **Update semantics**: only direct subscribers are notified on change

Signals differ from traditional virtual-DOM approaches by enabling **fine-grained reactivity** at the value level, rather than re-rendering entire component trees.

---

## Cross-Framework Support (2026)

| Framework | Signals API | Implementation | Granularity |
|-----------|------------|----------------|-------------|
| **SolidJS** | `createSignal()` / `createMemo()` | Native, zero VDOM | Value-level |
| **Vue 3.5+** | `shallowRef()` / `computed()` | Proxy + dependency tracking | Component + value |
| **Angular 16+** | `signal()` / `computed()` / `effect()` | Change detection integration | Value-level |
| **Preact** | `@preact/signals` | Runtime patch | Value-level |
| **Svelte 5** | `$state()` / `$derived()` | Compile-time transformation | Value-level |
| **React** | `useSyncExternalStore` + external libs | External (Zustand, Jotai, Valtio) | Selector-level |

---

## Signals vs Hooks Comparison

| Dimension | Signals (Solid/Preact/Vue) | React Hooks |
|-----------|---------------------------|-------------|
| **Re-rendering** | No VDOM diff, direct DOM update | Component re-executes, VDOM diff |
| **Stale Closures** | Impossible (always reads latest value) | Common pitfall with `useEffect` deps |
| **Dependency Tracking** | Automatic, no manual arrays | Manual `deps` array in `useEffect/useMemo` |
| **Conditional Logic** | Allowed anywhere | Rules of Hooks: only top-level, no conditionals |
| **Performance** | 6-10x faster for fine-grained updates | Optimized by React Compiler (19+) |
| **Mental Model** | Reactive data flow | Functional re-execution |
| **Bundle Size** | Smaller (no VDOM overhead) | Larger VDOM + reconciliation |
| **Ecosystem Maturity** | Growing | Largest |

> 📖 References: [React vs Signals: 10 Years Later](https://dev.to/this-is-learning/react-vs-signals-10-years-later-3jl3) | [Why Signals Are Better Than Hooks](https://www.builder.io/blog/signals-vs-hooks)

---

## Code Examples

### SolidJS Signals

```tsx
import { createSignal, createMemo, createEffect } from 'solid-js';
import { render } from 'solid-js/web';

function Counter() {
  const [count, setCount] = createSignal(0);
  const [multiplier, setMultiplier] = createSignal(2);

  // Memoized derived value — only recalculates when dependencies change
  const doubled = createMemo(() => count() * multiplier());

  // Side effect — runs when count changes
  createEffect(() => {
    console.log(`Count changed to: ${count()}`);
  });

  return (
    <div>
      <p>Count: {count()}</p>
      <p>Doubled: {doubled()}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={() => setMultiplier(m => m + 1)}>
        Multiplier: {multiplier()}
      </button>
    </div>
  );
}

render(() => <Counter />, document.getElementById('root')!);
```

> 📖 Reference: [SolidJS createSignal](https://www.solidjs.com/docs/latest/api#createsignal)

### Preact Signals with React Compatibility

```tsx
import { useSignals } from '@preact/signals-react/runtime';
import { signal, computed, effect } from '@preact/signals-core';

// Global state — can be defined outside components
const count = signal(0);
const double = computed(() => count.value * 2);

// Side effect
 effect(() => {
  console.log(`The count is now ${count.value}`);
});

function Counter() {
  useSignals(); // Required in React for signals to work

  return (
    <div>
      <p>Count: {count.value}</p>
      <p>Double: {double.value}</p>
      <button onClick={() => count.value++}>
        Increment
      </button>
    </div>
  );
}

// Signal updates outside React tree also work
count.value = 10; // Logs: "The count is now 10"
```

> 📖 Reference: [Preact Signals Documentation](https://preactjs.com/guide/v10/signals/)

### Angular Signals (v16+)

```typescript
import { Component, signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <p>Count: {{ count() }}</p>
    <p>Doubled: {{ double() }}</p>
    <button (click)="increment()">Increment</button>
  `
})
export class CounterComponent {
  count = signal(0);
  double = computed(() => this.count() * 2);

  constructor() {
    effect(() => {
      console.log('Count is:', this.count());
    });
  }

  increment() {
    this.count.update(n => n + 1);
  }
}
```

> 📖 Reference: [Angular Signals Guide](https://angular.dev/guide/signals)

---

## TC39 Standardization

The [TC39 Signals Proposal](https://github.com/tc39/proposal-signals) aims to standardize a minimal signal primitive for JavaScript, enabling framework interoperability:

```javascript
// Proposed standard API (Stage 1)
import { Signal } from 'std:signals';

const counter = new Signal.State(0);
const doubled = new Signal.Computed(() => counter.get() * 2);

counter.set(5);
console.log(doubled.get()); // 10
```

> 📖 Reference: [TC39 Proposal Repository](https://github.com/tc39/proposal-signals)

---

## Performance Advantage

Signals provide **6-10x** better update performance than React Context for fine-grained state updates, because:

1. No VDOM reconciliation overhead
2. Only affected DOM nodes are updated
3. No component function re-execution on unrelated state changes

| Scenario | React Context | Signals (Solid) | Speedup |
|----------|--------------|-----------------|---------|
| Update single list item | 1x (baseline) | 8.5x | 8.5x |
| Toggle boolean flag | 1x (baseline) | 6.2x | 6.2x |
| Derived computation | 1x (baseline) | 12x | 12x |

> 📊 Source: [JS Framework Benchmark](https://krausest.github.io/js-framework-benchmark/)

---

## Theorem (Signals Consistency)

In a DAG structure, Signals' update propagation guarantees that all derived signals eventually converge to a state consistent with atomic signals, provided no circular dependencies exist.

---

*English summary. Full Chinese analysis: `../../20-code-lab/20.5-frontend-frameworks/signals-patterns/README.md`.*
