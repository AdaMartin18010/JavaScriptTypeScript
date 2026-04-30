# Signals Paradigm: Cross-Framework Reactive Primitive

> **English Summary** of `20-code-lab/20.5-frontend-frameworks/signals-patterns/README.md`

---

## One-Sentence Summary

Signals have evolved from a framework-specific optimization into a cross-framework universal reactive primitive that delivers 6-10x better update performance than component-level reconciliation by propagating changes through a directed acyclic graph of fine-grained dependencies.

## Key Points

- **Universal Adoption by 2026**: Signals are now natively supported or officially endorsed in SolidJS, Vue 3.5+, Angular 16+, Preact, and Svelte 5 (Runes), marking their transition from niche technique to industry standard.
- **Three Core Abstractions**: Every signal implementation contains (1) a value container, (2) a subscriber registry, and (3) update semantics that notify only direct dependents rather than triggering whole-tree re-renders.
- **DAG Guarantee**: In a directed acyclic graph structure, signal update propagation ensures all derived signals eventually converge to a state consistent with atomic signals, provided circular dependencies are prevented.
- **Framework-Agnostic Core**: Libraries such as `alien-signals` demonstrate that the reactive primitive can be decoupled from any specific framework, enabling portable state logic across Vue, Solid, and custom runtimes.
- **Performance Characteristic**: Fine-grained updates bypass the virtual DOM diffing overhead entirely in SolidJS, and reduce reconciliation cost by an order of magnitude in Vue/Preact integrations compared to React Context.

## Signals Framework Comparison

| Framework | Signal API | Reconciliation Strategy | Granularity | Bundle Size (signals only) | Adoption Status |
|-----------|-----------|------------------------|-------------|---------------------------|-----------------|
| **SolidJS** | `createSignal()` / `createMemo()` | **None** — direct DOM updates | Finest-grained (node level) | ~7KB (total runtime) | Native since v1.0 |
| **Vue 3.5+** | `reactive()` / `ref()` / `computed()` | VDOM (selective) + compiler optimizations | Component + block level | ~10KB (reactivity pkg) | Native since v3.0 |
| **Vue Vapor Mode** | Same as Vue 3 | **None** — compile-time DOM targeting | Fine-grained (expression level) | ~6KB (estimated) | Experimental (2026) |
| **Preact Signals** | `signal()` / `computed()` / `effect()` | VDOM (bypassed for signal reads) | Component + subtree | ~1.4KB | `@preact/signals` |
| **Angular 16+** | `signal()` / `computed()` / `effect()` | Incremental DOM (zoneless) | Component level | ~0KB (framework built-in) | Native since v16 |
| **Svelte 5 (Runes)** | `$state()` / `$derived()` / `$effect()` | Compile-time invalidation + VDOMless | Fine-grained (statement level) | ~5KB (runtime) | Native since v5 |
| **alien-signals** | `signal()` / `computed()` / `effect()` | Framework-agnostic core | Finest-grained | ~2KB | Library (framework-independent) |

*Bundle sizes are approximate gzip values for the reactivity subsystem only, excluding framework overhead.*

## Code Example: SolidJS Signal

SolidJS represents the purest implementation of the signals paradigm, eliminating the virtual DOM entirely:

```jsx
// SolidJS: Fine-grained reactivity with zero VDOM overhead
import { createSignal, createMemo, createEffect, For } from 'solid-js';
import { render } from 'solid-js/web';

function TodoList() {
  // Atomic signal: reactive primitive holding a value
  const [todos, setTodos] = createSignal([
    { id: 1, text: 'Learn Signals', done: false },
    { id: 2, text: 'Build App', done: false }
  ]);

  const [filter, setFilter] = createSignal('all'); // 'all' | 'active' | 'done'

  // Derived signal: recomputes only when dependencies change
  const filteredTodos = createMemo(() => {
    const f = filter();
    const items = todos();
    console.log(`Filtering ${items.length} items by: ${f}`);

    if (f === 'active') return items.filter(t => !t.done);
    if (f === 'done') return items.filter(t => t.done);
    return items;
  });

  // Effect: runs side effects when dependencies change
  createEffect(() => {
    document.title = `${filteredTodos().length} tasks remaining`;
  });

  const addTodo = (text) => {
    setTodos(prev => [...prev, { id: Date.now(), text, done: false }]);
  };

  const toggleTodo = (id) => {
    // Immutable update — Solid tracks reference equality
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    ));
  };

  return (
    <div>
      <h1>Todo List (Solid Signals)</h1>

      {/* Filter buttons — only these buttons re-render on filter change */}
      <div class="filters">
        {['all', 'active', 'done'].map(f => (
          <button
            class={filter() === f ? 'active' : ''}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* For component: optimized list rendering with keyed updates */}
      <ul>
        <For each={filteredTodos()}>
          {(todo) => (
            <li class={todo.done ? 'done' : ''}>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
              />
              <span>{todo.text}</span>
            </li>
          )}
        </For>
      </ul>

      <p>Count: {filteredTodos().length}</p>
    </div>
  );
}

// Mount to DOM — components run ONCE; only effects re-run
render(() => <TodoList />, document.getElementById('root'));
```

### Signal Implementation from Scratch

To understand the underlying mechanism, here is a minimal reactive system demonstrating the DAG propagation algorithm:

```typescript
// Minimal signal implementation (educational)
type Subscriber = () => void;

class Signal<T> {
  private _value: T;
  private _subscribers: Set<Subscriber> = new Set();

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    // In a full implementation, this registers the current effect as a subscriber
    if (activeEffect) {
      this._subscribers.add(activeEffect);
    }
    return this._value;
  }

  set value(newValue: T) {
    if (this._value !== newValue) {
      this._value = newValue;
      // Notify all direct dependents (topological order in production)
      this._subscribers.forEach(fn => fn());
    }
  }
}

let activeEffect: Subscriber | null = null;

function effect(fn: Subscriber): void {
  activeEffect = fn;
  fn(); // Initial execution captures dependencies
  activeEffect = null;
}

function computed<T>(fn: () => T): { get value(): T } {
  const signal = new Signal<T>(undefined as T);
  effect(() => {
    signal.value = fn();
  });
  return signal;
}

// Usage of minimal implementation
const count = new Signal(0);
const doubled = computed(() => count.value * 2);

effect(() => {
  console.log(`Count: ${count.value}, Doubled: ${doubled.value}`);
});

count.value = 5; // Logs: Count: 5, Doubled: 10
```

### Vue 3.5 Reactivity with `ref` and `computed`

```typescript
// Vue 3.5+ Composition API with reactivity
import { ref, computed, watch, watchEffect } from 'vue';

function useCounter() {
  const count = ref(0);
  const doubled = computed(() => count.value * 2);

  // Watch: explicit dependency tracking
  watch(count, (newVal, oldVal) => {
    console.log(`Count changed from ${oldVal} to ${newVal}`);
  });

  // WatchEffect: automatic dependency collection
  watchEffect(() => {
    console.log(`Current doubled value: ${doubled.value}`);
  });

  function increment() {
    count.value++;
  }

  return { count, doubled, increment };
}

// In component: only the DOM nodes reading `count` or `doubled` re-render
```

### Angular 16+ Signals in TypeScript

```typescript
// Angular 16+ standalone component with signals
import { Component, computed, effect, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <div>
      <p>Count: {{ count() }}</p>
      <p>Doubled: {{ doubled() }}</p>
      <button (click)="increment()">+1</button>
    </div>
  `,
})
export class CounterComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);

  constructor() {
    // Effect: runs whenever signal dependencies change
    effect(() => {
      console.log(`The current count is: ${this.count()}`);
    });
  }

  increment() {
    this.count.update((v) => v + 1);
  }
}
```

### Preact Signals with React Integration

```tsx
// Preact Signals in a React component (zero re-renders on signal reads)
import { useSignal, useComputed } from '@preact/signals-react';

function Counter() {
  const count = useSignal(0);
  const doubled = useComputed(() => count.value * 2);

  return (
    <div>
      <p>Count: {count}</p> {/* Reads signal directly, no hook re-run */}
      <p>Doubled: {doubled}</p>
      <button onClick={() => count.value++}>+1</button>
    </div>
  );
}
```

### Svelte 5 Runes

```svelte
<!-- Svelte 5: Runes-based reactivity -->
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log(`Count is now ${count}`);
  });

  function increment() {
    count++;
  }
</script>

<div>
  <p>Count: {count}</p>
  <p>Doubled: {doubled}</p>
  <button onclick={increment}>+1</button>
</div>
```

## Detailed Explanation

The Signals paradigm represents a fundamental shift in how frontend frameworks conceptualize state-to-UI propagation. Rather than treating components as the atomic unit of reactivity—as React Hooks do with their function-re-execution model—Signals treat each individual piece of state and each derived computation as a node in a reactive graph. When an atomic signal changes, the update does not cascade through a component tree; instead, it travels precisely along the edges of the dependency graph, touching only those computations that directly or transitively depend on the changed value.

This architectural difference has profound performance implications. In React, updating a Context value causes every consuming component to re-render, regardless of whether that component uses the specific slice of state that changed. Signals invert this logic: the update reaches exactly the DOM nodes that must change, with no intermediate reconciliation phase. SolidJS pushes this to its logical extreme by eliminating the virtual DOM entirely—components execute once during initial mount, and thereafter only signal subscribers (effects and memos) rerun. Vue 3.5's Vapor Mode and Svelte 5's Runes represent intermediate strategies that combine compile-time analysis with runtime signal graphs to achieve similar granularity without fully abandoning their existing architectural investments.

The theoretical foundation of Signals can be traced through three intellectual lineages: the spreadsheet calculation model (VisiCalc, 1979), where cell dependencies automatically trigger recalculation; Functional Reactive Programming (Elliott & Hudak, 1997), which separated discrete events from continuous behaviors; and modern fine-grained reactivity (Harris, 2019), which demonstrated that compile-time optimization could eliminate the overhead traditionally associated with observable patterns. The **Signals Consistency Theorem** formalizes this heritage: in a DAG structure, update propagation is equivalent to a topological sort traversal, guaranteeing eventual consistency across all derived signals as long as the graph remains acyclic. This property makes Signals not merely a performance optimization, but a mathematically well-behaved state management primitive suitable for systems requiring deterministic update ordering.

## Authoritative Links

- [SolidJS Documentation: Reactivity](https://docs.solidjs.com/concepts/signals) — Official guide to signals, memos, and effects.
- [Vue 3 Reactivity Deep Dive](https://vuejs.org/guide/extras/reactivity-in-depth.html) — Official explanation of Vue's proxy-based reactivity system.
- [Angular Signals Guide](https://angular.dev/guide/signals) — Angular's official signals API documentation.
- [Preact Signals](https://preactjs.com/guide/v10/signals/) — Preact's implementation and integration with VDOM.
- [Svelte 5 Runes](https://svelte.dev/docs/runes) — Svelte 5's rune-based reactivity documentation.
- [alien-signals on GitHub](https://github.com/stackblitz/alien-signals) — Framework-agnostic signal implementation used by StackBlitz.
- [Signals Proposal (TC39 Stage 1)](https://github.com/tc39/proposal-signals) — TC39 proposal for standardizing signals in JavaScript.
- [Fine-Grained Reactivity by Ryan Carniato](https://dev.to/ryansolid/a-hands-on-introduction-to-fine-grained-reactivity-3ndf) — Author of SolidJS explains the core concepts.
- [React vs Signals: 10 Years Later](https://www.builder.io/blog/react-vs-signals) — Builder.io comparative analysis of React and signals performance.
- [Rob Pike — Go Concurrency Patterns](https://go.dev/talks/2012/concurrency.slide) — Foundational concurrency primitives that influenced signal design.
- [Conal Elliott — Push-Pull Functional Reactive Programming](http://conal.net/papers/push-pull-frp/push-pull-frp.pdf) — Academic paper on FRP semantics.
- [krausest/js-framework-benchmark](https://krausest.github.io/js-framework-benchmark/) — Benchmark data for framework performance comparisons.
- [MDN — Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) — Browser-native component model that signals complement.
- [TC39 Process Document](https://tc39.es/process-document/) — Understanding how the Signals proposal advances through standardization.
- [SolidJS Blog — The Future of Reactivity](https://www.solidjs.com/blog/) — Latest architectural discussions from the SolidJS team.

---

*English summary. Full Chinese analysis with code examples: `../../20-code-lab/20.5-frontend-frameworks/signals-patterns/README.md`*
