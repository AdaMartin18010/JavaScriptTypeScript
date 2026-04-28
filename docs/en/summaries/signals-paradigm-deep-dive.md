---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# Signals Paradigm: A Deep Dive

> Date: 2026-04-21
> Source: `JSTS全景综述/Signals_范式深度分析.md`
> Word Count: ~800 (Executive Summary)

## 1. The Paradigm Shift

JavaScript UI frameworks have evolved through three generations:

1. **Imperative DOM** (jQuery era): Direct DOM manipulation
2. **Declarative + Virtual DOM** (React/Vue/Angular): Re-render components on state change
3. **Fine-Grained Reactivity** (SolidJS/Svelte 5/Signals): Update individual DOM nodes directly

**The Signals Revolution**: Signals are reactive primitives that wrap values and track their readers. When a value changes, only the dependent computations update—**components never re-render**.

## 2. Performance Analysis

| Metric | React Hooks | SolidJS | Svelte 5 |
|--------|-------------|---------|----------|
| Update 1000 rows | 1x (baseline) | **8.5x** | **7.2x** |
| Partial updates | 1x | **12x** | **10x** |
| Memory usage | 1x | **0.4x** | **0.35x** |

The key difference: Signals skip "virtual DOM creation + diff" entirely.

## 3. Cross-Framework Landscape (2026)

| Framework | API Style | Philosophy |
|-----------|-----------|------------|
| **SolidJS** | `createSignal()` / `createEffect()` | Fine-grained benchmark leader |
| **Preact** | `signal.value` | React-compatible patch |
| **Angular** | `signal()` / `computed()` | Enterprise adoption |
| **Svelte 5** | `$state()` / `$derived()` | Compile-time optimization |

## 4. The Hybrid Approach (Recommended)

For most teams in 2026: **React + Preact Signals**

- Keep React ecosystem (Router, form libraries, UI kits)
- Migrate bottleneck components to Signals
- 40-60% of React's performance with zero ecosystem loss

## 5. Future Outlook

- **Short-term (2026-2027)**: React Compiler narrows the gap; Preact Signals grows in React ecosystem
- **Medium-term (2027-2028)**: Signals become framework-agnostic primitives (like ES Modules)
- **Long-term (2028+)**: Browser-native reactive APIs may emerge

## 6. Key Takeaway

Signals will not fully replace Hooks, but will become the **default choice for performance-critical scenarios**. Both will coexist, with developers selecting based on context.

---

*Full Chinese version available at: `../../30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/Signals_范式深度分析.md`*
