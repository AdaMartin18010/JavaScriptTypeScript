# Day 15-21: Dashboard

> **Difficulty**: 🌳 Intermediate-Advanced
> **Prerequisites**: Day 8-14 completed, basic SvelteKit knowledge
> **Aligned with**: [16-learning-ladder.md](../../16-learning-ladder.md) — Level 6-8

---

## Learning Objectives

By completing this exercise, you will:

1. ✅ Use SvelteKit `load` functions for data fetching
2. ✅ Implement Form Actions with progressive enhancement
3. ✅ Use `$effect.pre` for DOM measurements
4. ✅ Implement client-side caching with `$state`
5. ✅ Handle SSR vs CSR differences
6. ✅ Use SvelteKit hooks (`handle`, `handleFetch`)

---

## Exercise: Analytics Dashboard

Build an analytics dashboard with:

### Core Features

- [ ] **Data Loading**: Fetch metrics from API in `+page.ts`/`+page.server.ts`
- [ ] **Charts**: SVG-based reactive charts (no external libs)
- [ ] **Date Range Picker**: Filter data by date range
- [ ] **Real-time Updates**: Simulate live data with `$effect` + `setInterval`
- [ ] **Export**: CSV export via Form Action
- [ ] **SSR**: Data rendered server-side for SEO

### Pages

```
src/routes/
├── +layout.svelte          # Dashboard shell + nav
├── +page.svelte            # Overview with KPI cards
├── +page.server.ts         # Load KPI data
├── traffic/
│   ├── +page.svelte        # Traffic chart + table
│   └── +page.server.ts     # Load traffic data
├── settings/
│   ├── +page.svelte        # Settings form
│   └── +page.server.ts     # Form actions
└── api/
    └── metrics/
        └── +server.ts      # API endpoint
```

### Data Model

```typescript
interface Metric {
  date: string;        // ISO date
  visitors: number;
  pageviews: number;
  bounceRate: number;  // 0-1
  avgDuration: number; // seconds
}

interface KpiSummary {
  totalVisitors: number;
  totalPageviews: number;
  avgBounceRate: number;
  avgDuration: number;
  changePercent: Record<string, number>; // vs last period
}
```

---

## Acceptance Criteria

| Test | Expected |
|:---|:---|
| Load dashboard | KPIs visible immediately (SSR) |
| Change date range | Chart + table update reactively |
| Live mode toggle | New data point added every 5s |
| Export CSV | Form Action triggers download |
| Refresh page | Same data, no flash of empty state |
| Submit settings | Form Action validates + redirects |
| Disable JS | Forms still work (progressive enhancement) |

---

## Key Concepts

### SSR Data Loading

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  const res = await fetch('/api/metrics');
  const metrics: Metric[] = await res.json();

  return {
    metrics,
    summary: computeSummary(metrics),
  };
};
```

### Form Actions

```typescript
// +page.server.ts
export const actions = {
  export: async ({ request }) => {
    const data = await request.formData();
    const format = data.get('format'); // 'csv' | 'json'

    // Generate export
    const csv = generateCsv(metrics);

    return {
      success: true,
      downloadUrl: `/exports/${filename}`,
    };
  },

  updateSettings: async ({ request }) => {
    const data = await request.formData();
    // Validate
    // Update database
    // Return result
  },
};
```

### $effect.pre for DOM Measurements

```svelte
<script>
  let chartElement;
  let chartWidth = $state(0);

  $effect.pre(() => {
    if (chartElement) {
      chartWidth = chartElement.clientWidth;
    }
  });
</script>

<div bind:this={chartElement} class="chart">
  <svg width={chartWidth} height={300}>
    <!-- Chart scaled to container width -->
  </svg>
</div>
```

---

## Project Setup

```bash
cd exercises/day-15-dashboard
npm install
npm run dev
```

---

## Checklist

- [ ] `+page.server.ts` loads data SSR
- [ ] `+page.ts` handles client-side navigation
- [ ] Form Actions with progressive enhancement
- [ ] SVG charts are reactive to data changes
- [ ] Date range filter works
- [ ] Live mode simulates real-time data
- [ ] CSV export works
- [ ] No hydration mismatches
- [ ] Works with JavaScript disabled

---

> **Next**: [Day 22-28: Real-time Chat](../day-22-chat/README.md) → SSE, `$state.raw`, Edge runtime
