# Day 8-14: Solution

> ⚠️ **Spoilers ahead!**

---

## Key Implementation Details

### Cart State in `.svelte.ts`

The complete cart implementation is in `src/lib/cart.svelte.ts`:

- `$state` for reactive arrays
- `$derived` for computed totals
- `$derived.by` for conditional discount logic
- `$state.snapshot` for immutable history states
- `$effect` for localStorage persistence

### Undo/Redo Pattern

```typescript
function saveHistory() {
  // Slice off any redo states
  history = [...history.slice(0, historyIndex + 1), $state.snapshot(items)];
  historyIndex++;
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    items = structuredClone(history[historyIndex]);
  }
}
```

### $derived.by for Complex Filtering

```typescript
let filteredProducts = $derived.by(() => {
  let result = products;
  if (selectedCategory) {
    result = result.filter(p => p.category === selectedCategory);
  }
  result = result.filter(p =>
    p.price >= priceRange[0] && p.price <= priceRange[1]
  );
  return result;
});
```

---

## Common Mistakes

1. **Mutating `$state` arrays directly**

   ```typescript
   items.push(newItem); // ❌ May not trigger update
   items = [...items, newItem]; // ✅ Correct
   ```

2. **Forgetting `$state.snapshot` in history**

   ```typescript
   history.push(items); // ❌ Stores reference, not copy
   history.push($state.snapshot(items)); // ✅ Deep copy
   ```

3. **Not handling `structuredClone` for undo**

   ```typescript
   items = history[index]; // ❌ Same reference
   items = structuredClone(history[index]); // ✅ New instance
   ```
