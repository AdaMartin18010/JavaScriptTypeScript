# Theorem 1: JIT Three-State Transformation

> **English Summary** of `10.1-language-semantics/theorems/jit-three-state-theorem.md`

---

## Theorem Statement

The V8 engine implements a dynamic three-state transformation of JavaScript execution:

$$
\forall f \in \text{JS}.\ \exists \tau_1, \tau_2.\ \text{exec}(f, t) =
\begin{cases}
\text{Ignition}(f) & t < \tau_1 \\
\text{TurboFan}_{\phi}(f) & \tau_1 \leq t < \tau_2 \\
\text{Ignition}(f) & t \geq \tau_2 \land \neg\phi(t)
\end{cases}
$$

Where:

- **Ignition**: Bytecode interpreter, minimal startup latency (1–5 ms)
- **TurboFan**: Optimizing JIT compiler, speculative optimization based on type feedback
- **Deoptimizer**: Safe fallback when type assumptions fail

---

## JIT Compilation Stages

| Stage | Form | Trigger | Latency | Output |
|-------|------|---------|---------|--------|
| **Ignition** | Bytecode interpreter | First execution | 1–5 ms | Bytecode |
| **Sparkplug** | Fast compiler | Warm code (≥ 10 runs) | ~10 ms | Unoptimized machine code |
| **TurboFan** | Optimizing JIT | Hot code (≥ 1000 runs) | ~50–200 ms | Highly optimized machine code |
| **Deoptimization** | Fallback | Type assumption failure | ~1 ms | Return to Ignition bytecode |

*Note: V8 v9.1+ introduced Sparkplug (fast non-optimizing compiler) as an intermediate tier between Ignition and TurboFan, making the pipeline effectively four-state in modern engines.*

---

## Code Example: Inline Cache (IC) States

Inline Caching is the foundation of TurboFan's speculative optimization. V8 tracks the shape of objects at call sites and transitions IC states from monomorphic → polymorphic → megamorphic.

```javascript
// --- Monomorphic (1 shape) — FASTEST ---
function greet(person) {
  return person.name; // Inline cache sees only {name: string}
}

greet({ name: 'Alice' });
greet({ name: 'Bob' });
// IC state: 1:1 (monomorphic) → TurboFan generates direct offset load

// --- Polymorphic (2–4 shapes) — SLOWER ---
function greetPoly(person) {
  return person.name;
}

greetPoly({ name: 'Alice' });
greetPoly({ name: 'Bob' });
greetPoly({ fullName: 'Carol', name: 'Carol' }); // Different hidden class
// IC state: 1:N (polymorphic, N ≤ 4) → small switch/case stub

// --- Megamorphic (>4 shapes) — SLOWEST ---
function greetMega(person) {
  return person.name;
}

for (let i = 0; i < 10; i++) {
  greetMega({ [`prop${i}`]: i, name: `User${i}` }); // 10 distinct shapes
}
// IC state: MEGAMORPHIC → generic hash-table lookup, no TurboFan inline
```

**Performance implication**: Keeping call sites monomorphic can yield **6–10×** speedup on property-access-heavy code.

---

## Key Lemmas

1. **Interpretation Necessity**: No type feedback exists at first execution, preventing meaningful speculative optimization
2. **Hotspot Existence**: Typical web apps spend 80%+ execution time in 20%− of code (Pareto distribution)
3. **Deoptimization Safety**: Execution state safely falls back from optimized code to bytecode without semantic loss

---

## Engineering Significance

| Dimension | Impact |
|-----------|--------|
| Startup | Ignition's 1–5 ms meets interactive response needs |
| Peak Performance | TurboFan achieves near-statically-typed performance (6–10× boost) |
| Adaptability | Three-state dynamic transformation adapts to diverse workloads |

---

## Authoritative References

- ["BlinkOn: Life of a JavaScript frame" – V8 Blog, 2023](https://v8.dev/blog/rocket-start)
- ["Understanding V8's Bytecode" – V8 Blog, 2017](https://v8.dev/blog/understanding-v8-bytecode)
- ["Sparkplug: V8's new non-optimizing compiler" – V8 Blog, 2021](https://v8.dev/blog/sparkplug)
- ["TurboFan: A new code architecture for V8" – V8 Blog, 2017](https://v8.dev/blog/turbofan-jit)
- ["Deoptimization in V8" – V8 Internals Deep Dive](https://v8.dev/blog/deoptimization)
- [V8 Compiler Design Docs](https://v8.dev/docs)

---

*English summary. Full Chinese theorem with proof tree: `../../10-fundamentals/10.1-language-semantics/theorems/jit-three-state-theorem.md`.*
