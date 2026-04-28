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

## Detailed Explanation

The Signals paradigm represents a fundamental shift in how frontend frameworks conceptualize state-to-UI propagation. Rather than treating components as the atomic unit of reactivity—as React Hooks do with their function-re-execution model—Signals treat each individual piece of state and each derived computation as a node in a reactive graph. When an atomic signal changes, the update does not cascade through a component tree; instead, it travels precisely along the edges of the dependency graph, touching only those computations that directly or transitively depend on the changed value.

This architectural difference has profound performance implications. In React, updating a Context value causes every consuming component to re-render, regardless of whether that component uses the specific slice of state that changed. Signals invert this logic: the update reaches exactly the DOM nodes that must change, with no intermediate reconciliation phase. SolidJS pushes this to its logical extreme by eliminating the virtual DOM entirely—components execute once during initial mount, and thereafter only signal subscribers (effects and memos) rerun. Vue 3.5's Vapor Mode and Svelte 5's Runes represent intermediate strategies that combine compile-time analysis with runtime signal graphs to achieve similar granularity without fully abandoning their existing architectural investments.

The theoretical foundation of Signals can be traced through three intellectual lineages: the spreadsheet calculation model (VisiCalc, 1979), where cell dependencies automatically trigger recalculation; Functional Reactive Programming (Elliott & Hudak, 1997), which separated discrete events from continuous behaviors; and modern fine-grained reactivity (Harris, 2019), which demonstrated that compile-time optimization could eliminate the overhead traditionally associated with observable patterns. The **Signals Consistency Theorem** formalizes this heritage: in a DAG structure, update propagation is equivalent to a topological sort traversal, guaranteeing eventual consistency across all derived signals as long as the graph remains acyclic. This property makes Signals not merely a performance optimization, but a mathematically well-behaved state management primitive suitable for systems requiring deterministic update ordering.

---

*English summary. Full Chinese analysis with code examples: `../../20-code-lab/20.5-frontend-frameworks/signals-patterns/README.md`*
