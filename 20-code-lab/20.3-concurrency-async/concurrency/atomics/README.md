# Atomics

> **路径**: `20-code-lab/20.3-concurrency-async/concurrency/atomics/`
> **定位**: Shared Memory & Lock-Free Synchronization for JavaScript
> **关联**: `worker_threads` | `SharedArrayBuffer` | `WebAssembly`

---

## Overview

The `Atomics` global provides atomic operations on `SharedArrayBuffer`, enabling lock-free, wait-free, and notification-based synchronization between **Worker Threads**, **Web Workers**, and **WASM threads**. Without atomics, concurrent reads/writes to shared memory are subject to torn reads, data races, and undefined behavior.

> **Security Note**: `SharedArrayBuffer` requires cross-origin isolation (`Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp`). In Node.js, use `--experimental-worker` (legacy) or the stable `worker_threads` module.

---

## API Comparison Table

| Method | Semantics | Use Case | Return Value |
|--------|-----------|----------|--------------|
| `Atomics.add(typedArray, index, value)` | Atomic addition | Counters, metrics aggregation | Old value at `index` |
| `Atomics.sub(typedArray, index, value)` | Atomic subtraction | Decrementing quotas, pools | Old value at `index` |
| `Atomics.and / or / xor` | Atomic bitwise ops | Flag masks, feature toggles | Old value at `index` |
| `Atomics.load(typedArray, index)` | Atomic read | Consistent read without torn values | Value at `index` |
| `Atomics.store(typedArray, index, value)` | Atomic write | Publish flag / state safely | Stored value |
| `Atomics.compareExchange(typedArray, index, expected, replacement)` | CAS loop | Lock-free stacks, queues | Old value at `index` |
| `Atomics.wait(typedArray, index, expected, timeout?)` | Block until notified | Condition variables, barriers | `"ok"` | `"not-equal"` | `"timed-out"` |
| `Atomics.notify(typedArray, index, count?)` | Wake waiters | Signal completion / new data | Number of woken agents |

---

## Code Example: Atomic Counter + Wait/Notify

```js
// counter-main.js
const { Worker } = require('worker_threads');

const shared = new SharedArrayBuffer(4); // 1 x Int32
const counter = new Int32Array(shared);

// Spawn 4 workers, each incrementing 100_000 times
const workers = Array.from({ length: 4 }, () =>
  new Worker(__filename, { workerData: shared })
);

// Wait for all workers to finish using Atomics.wait
// We use a second shared slot (index 1) or simply poll with Atomics.load
// Below we demonstrate a barrier pattern via wait/notify:
const barrier = new Int32Array(new SharedArrayBuffer(4));

workers.forEach((w) => {
  w.postMessage({ type: 'start', barrier: barrier.buffer });
  w.on('message', (msg) => {
    if (msg.done) {
      const active = Atomics.sub(barrier, 0, 1);
      if (active === 1) {
        // Last worker finished
        Atomics.notify(barrier, 0, 1);
      }
    }
  });
});

// Initialize barrier with worker count
Atomics.store(barrier, 0, workers.length);

// Main thread blocks until barrier reaches 0
while (Atomics.load(barrier, 0) !== 0) {
  Atomics.wait(barrier, 0, Atomics.load(barrier, 0), 50);
}

console.log(`Final counter: ${Atomics.load(counter, 0)}`); // Expected: 400000
workers.forEach((w) => w.terminate());
```

```js
// counter-worker.js
const { workerData, parentPort } = require('worker_threads');

const counter = new Int32Array(workerData);

parentPort.once('message', ({ type, barrier }) => {
  if (type !== 'start') return;
  const barr = new Int32Array(barrier);

  for (let i = 0; i < 100_000; i++) {
    Atomics.add(counter, 0, 1);
  }

  parentPort.postMessage({ done: true });
});
```

### Lock-Free Spin Lock (Educational)

```js
class AtomicsSpinLock {
  constructor(sharedBuffer, byteOffset = 0) {
    this.state = new Int32Array(sharedBuffer, byteOffset, 1);
  }
  lock() {
    while (Atomics.compareExchange(this.state, 0, 0, 1) !== 0) {
      Atomics.wait(this.state, 0, 1, 10); // Yield briefly
    }
  }
  unlock() {
    Atomics.store(this.state, 0, 0);
    Atomics.notify(this.state, 0, 1);
  }
}
```

---

## Memory Ordering

| Order | JS Equivalent | Guarantee |
|-------|---------------|-----------|
| *Sequentially Consistent* (default) | All `Atomics.*` ops | Total order across all threads |
| *Acquire-Release* | Not directly exposed; SC implies it | Reads see all prior writes by releasing thread |

JavaScript `Atomics` intentionally exposes only **sequentially consistent** atomics, simplifying reasoning at the cost of some performance versus C/C++ `memory_order_relaxed`.

---

## Authoritative Links

- [MDN — Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics)
- [MDN — SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)
- [ECMAScript® 2026 Spec — Memory Model](https://tc39.es/ecma262/multipage/memory-model.html)
- [Node.js worker_threads](https://nodejs.org/api/worker_threads.html)
- [WinterCG — Web Streams & Workers Convergence](https://wintercg.org/)

---

*最后更新: 2026-04-29*
