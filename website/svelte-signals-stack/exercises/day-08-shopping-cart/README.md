# Day 8-14: Shopping Cart

> **Difficulty**: 🌳 Intermediate  
> **Prerequisites**: Day 1-3 completed, `$state`, `$derived`, `$effect`  
> **Aligned with**: [16-learning-ladder.md](../../16-learning-ladder.md) — Level 3-5

---

## Learning Objectives

By completing this exercise, you will:

1. ✅ Use `.svelte.ts` for shared reactive logic
2. ✅ Use `$derived.by` for complex computations
3. ✅ Understand class-based state management in Svelte 5
4. ✅ Implement undo/redo with reactive history
5. ✅ Use `$effect.pre` for DOM measurements
6. ✅ Compare Svelte 5 Stores vs Runes

---

## Exercise: Shopping Cart

Build a shopping cart with:

### Core Features
- [ ] Product catalog (10+ items with price, image, category)
- [ ] Add/remove items from cart
- [ ] Quantity controls (+/-)
- [ ] Cart total with tax calculation (`$derived.by`)
- [ ] Discount codes (10% off, free shipping)
- [ ] Persist cart to localStorage

### Advanced Features
- [ ] **Undo/Redo**: `$state.snapshot` + history stack
- [ ] **Stock tracking**: Prevent adding out-of-stock items
- [ ] **Category filter**: Filter products by category
- [ ] **Price range slider**: Filter by min/max price
- [ ] **Responsive layout**: Mobile-friendly grid

### Data Model

```typescript
// src/lib/cart.svelte.ts
export interface Product {
  id: number;
  name: string;
  price: number;
  category: 'electronics' | 'clothing' | 'food';
  stock: number;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export function createCart() {
  let items = $state<CartItem[]>([]);
  let history = $state<CartItem[][]>([]);
  let historyIndex = $state(-1);

  // TODO: Implement add, remove, updateQuantity
  // TODO: Implement undo, redo with $state.snapshot
  // TODO: Implement derived: subtotal, tax, total, itemCount

  return {
    get items() { return items; },
    get total() { /* derived */ },
    add(product: Product) { /* ... */ },
    remove(productId: number) { /* ... */ },
    undo() { /* ... */ },
    redo() { /* ... */ },
  };
}
```

---

## Acceptance Criteria

| Test | Expected |
|:---|:---|
| Add item to cart | Cart shows item, total updates |
| Increase quantity | Subtotal reflects new qty, stock decreases |
| Add out-of-stock item | Button disabled, shows "Out of stock" |
| Apply discount code | Total reduces by 10% |
| Click Undo | Cart reverts to previous state |
| Click Redo | Cart re-applies undone action |
| Refresh page | Cart restored from localStorage |
| Filter by category | Only matching products shown |

---

## Key Concepts Demonstrated

### `.svelte.ts` — Reactive Module

```typescript
// src/lib/cart.svelte.ts
// This file can contain $state, $derived, $effect!
// Share reactive logic across components.

export function createCart() {
  let items = $state<CartItem[]>([]);
  
  let subtotal = $derived(
    items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );
  
  let tax = $derived(subtotal * 0.08);
  let total = $derived(subtotal + tax);
  
  // ...
}
```

### `$derived.by` — Complex Computations

```svelte
<script>
  let filteredProducts = $derived.by(() => {
    let result = products;
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (priceRange[1] < 1000) {
      result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    }
    return result.sort((a, b) => a.price - b.price);
  });
</script>
```

### `$state.snapshot` — Undo/Redo

```svelte
<script>
  let history = $state<State[]>([]);
  let index = $state(-1);

  function save() {
    // Remove any redo states
    history = history.slice(0, index + 1);
    // Save current state
    history.push($state.snapshot(state));
    index++;
  }

  function undo() {
    if (index > 0) {
      index--;
      state = structuredClone(history[index]);
    }
  }
</script>
```

---

## Project Setup

```bash
cd exercises/day-08-shopping-cart
npm install
npm run dev
```

---

## Checklist

- [ ] Cart state managed in `.svelte.ts`
- [ ] At least 10 products with varied categories/prices
- [ ] Quantity controls work correctly
- [ ] Stock limits enforced
- [ ] Tax + discount calculation correct
- [ ] Undo/redo functional
- [ ] localStorage persistence
- [ ] Category + price filters work
- [ ] Responsive on mobile
- [ ] No TypeScript errors

---

## Hints

<details>
<summary>💡 Hint: Undo/Redo implementation</summary>

Use `$state.snapshot()` to capture immutable state copies:

```typescript
function createHistory<T>(initial: T) {
  let states = $state<T[]>([initial]);
  let index = $state(0);

  return {
    get current() { return states[index]; },
    canUndo: $derived(index > 0),
    canRedo: $derived(index < states.length - 1),
    push(state: T) {
      states = [...states.slice(0, index + 1), $state.snapshot(state)];
      index++;
    },
    undo() { if (index > 0) index--; },
    redo() { if (index < states.length - 1) index++; },
  };
}
```
</details>

<details>
<summary>💡 Hint: Stock tracking</summary>

Track remaining stock separately from cart:

```typescript
let stock = $state<Record<number, number>>({});

function canAdd(product: Product) {
  const inCart = items.find(i => i.product.id === product.id)?.quantity || 0;
  return inCart < product.stock;
}
```
</details>

---

> **Next**: [Day 15-21: Dashboard](../day-15-dashboard/) → SvelteKit, `load`, Form Actions
