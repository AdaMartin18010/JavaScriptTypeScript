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

- **Ignition**: Bytecode interpreter, minimal startup latency (1-5ms)
- **TurboFan**: Optimizing JIT compiler, speculative optimization based on type feedback
- **Deoptimizer**: Safe fallback when type assumptions fail

## Key Lemmas

1. **Interpretation Necessity**: No type feedback exists at first execution, preventing meaningful speculative optimization
2. **Hotspot Existence**: Typical web apps spend 80%+ execution time in 20%- of code (Pareto distribution)
3. **Deoptimization Safety**: Execution state safely falls back from optimized code to bytecode without semantic loss

## Engineering Significance

| Dimension | Impact |
|-----------|--------|
| Startup | Ignition's 1-5ms meets interactive response needs |
| Peak Performance | TurboFan achieves near-statically-typed performance (6-10x boost) |
| Adaptability | Three-state dynamic transformation adapts to diverse workloads |

---

*English summary. Full Chinese theorem with proof tree: `../../10-fundamentals/10.1-language-semantics/theorems/jit-three-state-theorem.md`.*
