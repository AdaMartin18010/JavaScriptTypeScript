# TLA+ Formal Model of Svelte 5 Scheduler

> **Status**: ✅ Model validated, verification report available  
> **Scope**: Scheduler topological consistency and glitch-freedom  
> **Based on**: `svelte@5.55.5` `packages/svelte/src/internal/client/reactivity/runtime.js`

---

## Model Overview

`SvelteScheduler.tla` formalizes the core properties of Svelte 5's reactive scheduler:

| Property | TLA+ Formula | Description | Status |
|:---|:---|:---|:---:|
| **Type Safety** | `typeInvariant` | All variables hold values of correct type | ✅ Verified |
| **No Double Execution** | `NoDoubleExecution` | No effect executes twice in one flush | ✅ Verified |
| **Clean After Execution** | `ExecutedEffectsAreClean` | Executed effects transition to CLEAN | ✅ Verified |
| **Version Consistency** | `VersionConsistency` | Dirty effects match signal version changes | ✅ Verified |
| **Scheduled Are Dirty** | `ScheduledEffectsAreDirty` | Only DIRTY effects enter execution queue | ✅ Verified |
| **Graph Consistency** | `DependencyGraphConsistent` | All graph edges reference valid IDs | ✅ Verified |
| **Liveness** | `DirtyEffectsScheduled` | All dirty effects eventually execute | ✅ Verified |
| **Termination** | `FlushEventuallyCompletes` | flushSync() always terminates | ✅ Verified |

📄 **[Verification Report](VERIFICATION_REPORT.md)** — Detailed analysis of invariants, model gaps, and confidence assessment.

---

## Files

| File | Purpose |
|:---|:---|
| `SvelteScheduler.tla` | Main TLA+ specification |
| `SvelteScheduler.cfg` | TLC model checker configuration |
| `VERIFICATION_REPORT.md` | Detailed verification analysis |
| `README.md` | This file |

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
245 states generated, 85 distinct states found, 0 states left on queue.

Model checking completed. No error has been found.
```

---

## Model Parameters

| Parameter | Value | Description |
|:---|:---:|:---|
| `MaxSignals` | 2 | Number of reactive signals |
| `MaxEffects` | 2 | Number of effects/watchers |
| `MaxValue` | 3 | Maximum signal value |
| `stepCount` | < 20 | State space depth bound |

---

## Model Limitations

| Aspect | Model | Reality |
|:---|:---|:---|
| Signal values | Bounded `Nat` (0..3) | Any JavaScript value |
| Effect count | Fixed (MaxEffects=2) | Unbounded (dynamic) |
| Dependency graph | Static after registration | Dynamic (conditional deps) |
| Batch semantics | Simplified queue | `flushSync()` + microtask queue |

See [Verification Report §5](VERIFICATION_REPORT.md#5-model-vs-reality-gap-analysis) for detailed gap analysis.

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
- [25-reactivity-source-proofs.md](../../25-reactivity-source-proofs.md) — Engineering-level proofs companion

---

> **Conclusion**: TLA+ provides machine-checkable verification of Svelte 5 scheduler's core properties. The [Verification Report](VERIFICATION_REPORT.md) documents all invariants, their mapping to runtime implementation, and the confidence level for each property.
