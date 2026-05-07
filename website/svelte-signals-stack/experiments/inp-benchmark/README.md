# INP Benchmark: Svelte 5 vs React 19 vs Vue 3.5

> **Purpose**: Reproducible Interaction to Next Paint benchmark comparing Svelte 5, React 19 (Compiler ON/OFF), and Vue 3.5
> **Methodology**: web-vitals library + Chrome DevTools Performance + Lighthouse CI
> **Baseline**: 2026-05-07

---

## Test Scenarios

### Scenario A: Counter (Minimal Update)

- Single state variable, single DOM text node update
- Measures pure framework overhead

### Scenario B: 100-Row Table (List Update)

- {#each} / map rendering 100 rows
- Filter/sort operations
- Measures list diffing efficiency

### Scenario C: Complex Form (Multi-field Interaction)

- 20 input fields with validation
- Derived state ($derived / useMemo / computed)
- Measures derived computation overhead

---

## Project Structure

```
experiments/inp-benchmark/
├── svelte-app/          # Svelte 5 test app
│   ├── src/
│   │   ├── routes/
│   │   │   ├── counter/
│   │   │   ├── table/
│   │   │   └── form/
│   │   └── app.html
│   ├── package.json
│   └── vite.config.js
├── react-app/           # React 19 test app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Counter.jsx
│   │   │   ├── Table.jsx
│   │   │   └── Form.jsx
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── benchmark/
│   ├── web-vitals.js    # Measurement script
│   ├── lighthouse/      # Lighthouse CI config
│   └── reports/         # Generated reports
└── README.md
```

---

## Running the Benchmark

```bash
# 1. Install dependencies
cd experiments/inp-benchmark

# 2. Build all apps
pnpm install
pnpm build:all

# 3. Start servers
pnpm serve:all

# 4. Run benchmark
pnpm benchmark

# 5. View report
open benchmark/reports/report-2026-05-07.html
```

---

## Expected Results (Based on Theory)

| Scenario | Svelte 5 | React 19 (Compiler ON) | React 19 (Compiler OFF) | Vue 3.5 |
|:---|:---:|:---:|:---:|:---:|
| Counter INP | ~30ms | ~50ms | ~80ms | ~45ms |
| Table Filter INP | ~45ms | ~70ms | ~120ms | ~65ms |
| Form Validation INP | ~40ms | ~60ms | ~100ms | ~55ms |

> **Note**: Actual results depend on hardware, browser version, and test environment. Always run on consistent hardware for valid comparisons.

---

## Measurement Methodology

```javascript
// benchmark/web-vitals.js
import { onINP } from 'web-vitals';

onINP((metric) => {
  // Send to benchmark collector
  window.__BENCHMARK_DATA__ = window.__BENCHMARK_DATA__ || [];
  window.__BENCHMARK_DATA__.push({
    name: 'INP',
    value: metric.value,
    entries: metric.entries.map(e => ({
      eventType: e.name,
      processingStart: e.processingStart,
      processingEnd: e.processingEnd,
      duration: e.duration
    }))
  });
}, { reportAllChanges: true });
```

---

> **Status**: Framework skeleton created. Full implementation requires build configuration and test scenario components.
