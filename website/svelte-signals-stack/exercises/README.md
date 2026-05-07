# Svelte 5 Signals — Progressive Exercise Path

> **Day 0 → Day 30**: Hands-on exercises aligned with [16-learning-ladder.md](../16-learning-ladder.md)

---

## Exercise Map

| Day | Exercise | Skills | Difficulty | Status |
|:---:|:---|:---|:---:|:---:|
| 1-3 | [Counter + Todo](./day-01-counter/README.md) | `$state`, `$derived`, `$effect`, events | 🌿 | ✅ Complete |
| 4-7 | Contact List | `{#each}`, `$props`, Snippets, forms | 🌿 | 📝 Framework |
| 8-14 | [Shopping Cart](./day-08-shopping-cart/README.md) | `.svelte.ts`, `$derived.by`, undo/redo | 🌳 | ✅ Complete |
| 15-21 | [Dashboard](./day-15-dashboard/README.md) | SvelteKit, `load`, Form Actions, SSR | 🌳 | ✅ Complete |
| 22-28 | [Real-time Chat](./day-22-chat/README.md) | SSE, `$state.raw`, optimistic UI | 🔥 | ✅ Complete |
| 29-30 | Fullstack App | SSR, auth, database, deployment | 🔥 | 📝 Framework |

---

## Quick Start

```bash
# Each exercise is a standalone project
cd exercises/day-01-counter
npm install
npm run dev
```

---

## Exercise Structure

Each exercise contains:

```
day-XX-name/
├── README.md          # Exercise instructions & learning objectives
├── package.json       # Dependencies
├── vite.config.js     # Build config
├── index.html         # Entry point
├── src/
│   ├── main.js        # App bootstrap
│   ├── App.svelte     # Main component (starter code with TODOs)
│   └── lib/           # Shared utilities
├── SOLUTION.md        # Reference solution (spoilers!)
└── CHECKLIST.md       # Self-assessment rubric
```

---

## Progression Path

```
Day 1-3     🌿 Beginner     →  $state, $derived, $effect basics
Day 4-7     🌿 Beginner     →  Components, props, forms
Day 8-14    🌳 Intermediate →  .svelte.ts, complex derived, undo/redo
Day 15-21   🌳 Intermediate →  SvelteKit, SSR, form actions
Day 22-28   🔥 Advanced     →  SSE, optimistic UI, $state.raw
Day 29-30   🔥 Advanced     →  Fullstack integration
```

---

## Status Legend

| Icon | Meaning |
|:---:|:---|
| ✅ Complete | Full implementation with working code |
| 📝 Framework | Structure created, implementation in progress |
| 🚧 Planned | Listed in roadmap, not yet started |

---

> **Start here**: [Day 1-3: Counter + Todo](./day-01-counter/README.md)
