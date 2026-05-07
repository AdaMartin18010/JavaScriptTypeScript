# Day 1-3: Counter + Todo List

> **Difficulty**: 🌿 Beginner  
> **Prerequisites**: Basic HTML/JS, npm installed  
> **Aligned with**: [16-learning-ladder.md](../../16-learning-ladder.md) — Level 1-2

---

## Learning Objectives

By completing this exercise, you will:

1. ✅ Create a Svelte 5 project with Vite
2. ✅ Use `$state` for reactive variables
3. ✅ Use `$derived` for computed values
4. ✅ Use `$effect` for side effects
5. ✅ Handle DOM events in Svelte 5
6. ✅ Understand the difference between `$state` and `$state.raw`

---

## Exercise A: Counter (15 min)

Build a counter with:
- [ ] Increment/decrement buttons
- [ ] Display current count
- [ ] Display `doubled = count * 2` using `$derived`
- [ ] Display `isEven = count % 2 === 0` using `$derived`
- [ ] Log count changes to console using `$effect`
- [ ] Prevent count from going below 0

### Starter Template

```svelte
<!-- src/App.svelte -->
<script>
  let count = $state(0);
  // TODO: Add derived states and effects
</script>

<div class="counter">
  <h1>Count: {count}</h1>
  <!-- TODO: Add buttons and derived displays -->
</div>

<style>
  .counter { text-align: center; padding: 2rem; }
</style>
```

### Acceptance Criteria

| Test | Expected |
|:---|:---|
| Click "+" | count increases by 1 |
| Click "-" at count=0 | count stays 0 (no negative) |
| count = 3 | doubled shows 6 |
| count = 4 | isEven shows true |
| Change count | Console logs new value |

---

## Exercise B: Todo List (30 min)

Build a todo list with:
- [ ] Input field to add new todos
- [ ] List of todos with check/uncheck
- [ ] "Active count" showing unchecked items (`$derived`)
- [ ] "All done!" message when count = 0
- [ ] Remove individual todos
- [ ] Persist to `localStorage` using `$effect`

### Data Structure

```typescript
interface Todo {
  id: number;
  text: string;
  done: boolean;
}
```

### Acceptance Criteria

| Test | Expected |
|:---|:---|
| Type "Buy milk" + Enter | Todo appears in list |
| Check todo | Strikethrough, active count decreases |
| Check all | "All done!" appears |
| Refresh page | Todos restored from localStorage |
| Click "×" on todo | Todo removed |

---

## Exercise C: `$state.raw` Exploration (15 min)

Compare `$state` vs `$state.raw`:

- [ ] Create an object with `$state({ x: 0, y: 0 })`
- [ ] Create the same object with `$state.raw({ x: 0, y: 0 })`
- [ ] Mutate both objects and observe reactivity differences
- [ ] Document when to use each

### Key Insight

```svelte
<script>
  let reactive = $state({ x: 0, y: 0 });
  let raw = $state.raw({ x: 0, y: 0 });

  function mutateReactive() {
    reactive.x++; // ✅ Triggers update
  }

  function mutateRaw() {
    raw.x++; // ❌ No update! Must reassign
    raw = { ...raw, x: raw.x + 1 }; // ✅ Triggers update
  }
</script>
```

---

## Project Setup

```bash
cd exercises/day-01-counter
npm install
npm run dev
# Open http://localhost:5173
```

---

## Checklist

- [ ] Exercise A (Counter) passes all acceptance criteria
- [ ] Exercise B (Todo List) passes all acceptance criteria
- [ ] Exercise C demonstrates `$state` vs `$state.raw` difference
- [ ] Code is formatted with Prettier
- [ ] No TypeScript errors
- [ ] Works in Chrome, Firefox, Safari

---

## Hints

<details>
<summary>💡 Hint: Preventing negative count</summary>

```svelte
function decrement() {
  if (count > 0) count--;
}
```

Or use `$derived` with `$state.raw` for immutable updates.
</details>

<details>
<summary>💡 Hint: localStorage persistence</summary>

```svelte
$effect(() => {
  localStorage.setItem('todos', JSON.stringify(todos));
});

// Load on init
let todos = $state(JSON.parse(localStorage.getItem('todos') || '[]'));
```
</details>

---

> **Next**: [Day 4-7: Contact List](../day-04-contact-list/) → `{#each}`, `$props`, Snippets
