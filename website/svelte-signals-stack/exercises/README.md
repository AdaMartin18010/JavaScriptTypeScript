# Svelte 5 Signals — Progressive Exercise Path

> **Day 0 → Day 30**: Hands-on exercises aligned with [16-learning-ladder.md](../16-learning-ladder.md)

---

## Exercise Map

| Day | Exercise | Skills | Difficulty |
|:---:|:---|:---|:---:|
| 1-3 | [Counter + Todo](./day-01-counter/) | `$state`, `$derived`, `$effect`, events | 🌿 |
| 4-7 | Contact List | `{#each}`, `$props`, Snippets, forms | 🌿 |
| 8-14 | [Shopping Cart](./day-08-shopping-cart/) | `.svelte.ts`, `$derived.by`, stores | 🌳 |
| 15-21 | [Dashboard](./day-15-dashboard/) | SvelteKit, `load`, Form Actions, SSR | 🌳 |
| 22-28 | [Real-time Chat](./day-22-chat/) | SSE, `$effect`, `$state.raw`, Edge | 🔥 |
| 29-30 | Fullstack App | SSR, auth, database, deployment | 🔥 |

---

## Getting Started

```bash
# Each exercise is a standalone SvelteKit project
cd exercises/day-01-counter
npm install
npm run dev
```

## Exercise Template

Each exercise contains:

```
day-XX-name/
├── README.md          # Exercise instructions & learning objectives
├── src/
│   ├── routes/        # SvelteKit routes
│   ├── lib/           # Reusable components
│   └── app.html
├── package.json
├── SOLUTION.md        # Reference solution (spoilers!)
└── CHECKLIST.md       # Self-assessment rubric
```

---

> **Status**: Framework created. Individual exercise implementations in progress.
