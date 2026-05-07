# TLA+ Formal Model of Svelte 5 Scheduler

> **Status**: Model created, ready for TLC model checking
> **Scope**: Scheduler topological consistency and glitch-freedom
> **Based on**: `svelte@5.55.5` `packages/svelte/src/internal/client/reactivity/runtime.js`

---

## Model Overview

`SvelteScheduler.tla` formalizes the core properties of Svelte 5's reactive scheduler:

| Property | TLA+ Formula | Description |
|:---|:---|:---|
| **Type Safety** | `typeInvariant` | All variables hold values of correct type |
| **No Double Execution** | `NoDoubleExecution` | No effect executes twice in one flush |
| **Clean After Execution** | `ExecutedEffectsAreClean` | Executed effects transition to CLEAN |
| **Version Consistency** | `VersionConsistency` | Dirty effects match signal version changes |
| **Topological Consistency** | `TopologicalConsistency` | Execution order respects dependency graph |
| **Liveness** | `AllDirtyEffectsExecuted` | All dirty effects eventually execute |
| **Termination** | `FlushEventuallyCompletes` | flushSync() always terminates |

---

## Running the Model Checker

### Prerequisites

```bash
# Install TLA+ Toolbox (GUI)
# https://lamport.azurewebsites.net/tla/toolbox.html

# Or use tlc command line
wget https://github.com/tlaplus/tlaplus/releases/download/v1.7.1/tla2tools.jar
```

### CLI Mode

```bash
java -cp tla2tools.jar tlc2.TLC SvelteScheduler.tla -config SvelteScheduler.cfg
```

### Expected Output

```
TLC2 Version 2.18
Model checking SvelteScheduler.tla
... states generated
... distinct states found
... states left on queue

Model checking completed. No error has been found.
```

---

## Model Limitations

| Aspect | Model | Reality |
|:---|:---|:---|
| Signal values | Nat (0..100) | Any JavaScript value |
| Effect count | MaxEffects=3 | Unbounded (dynamic) |
| Dependency graph | Static after registration | Dynamic (conditional deps) |
| Batch semantics | Simplified | flushSync + microtask queue |

**Mitigation**: The model verifies core invariants for bounded instances. Scaling to larger instances (MaxSignals=5, MaxEffects=5) requires more compute time but does not change the proof structure.

---

## Future Extensions

| Extension | Difficulty | Value |
|:---|:---:|:---:|
| Dynamic dependency registration | 🟠 Medium | Match runtime behavior |
| Batch/flushSync microtask queue | 🔴 High | Verify batch atomicity |
| Memory leak detection | 🟠 Medium | Verify cleanup correctness |
| Concurrent effects | 🔴 High | Verify parallel execution safety |

---

## References

- [TLA+ Homepage](https://lamport.azurewebsites.net/tla/tla.html) — Leslie Lamport
- [Svelte 5 Runtime Source](https://github.com/sveltejs/svelte/tree/svelte@5.55.5/packages/svelte/src/internal/client/reactivity) — Real implementation
- [25-reactivity-source-proofs.md](../../25-reactivity-source-proofs.md) — Engineering-level proofs

---

> **Conclusion**: TLA+ provides machine-checkable verification of Svelte 5 scheduler's core properties. While bounded model checking cannot prove correctness for all possible programs, it significantly increases confidence in the algorithm's correctness for typical application scales.
