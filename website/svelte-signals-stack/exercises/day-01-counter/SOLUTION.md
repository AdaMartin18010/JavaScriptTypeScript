# Day 1-3: Solution

> ⚠️ **Spoilers ahead!** Try the exercises yourself first.

---

## Exercise A: Counter — Complete Solution

```svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
  let isEven = $derived(count % 2 === 0);

  $effect(() => {
    console.log('Count changed:', count);
  });

  function increment() {
    count++;
  }

  function decrement() {
    if (count > 0) count--;
  }
</script>

<div class="counter">
  <h1>{count}</h1>
  <p>doubled: {doubled}</p>
  <p>isEven: {isEven}</p>
  <button onclick={decrement}>-</button>
  <button onclick={increment}>+</button>
</div>
```

---

## Exercise B: Todo List — Complete Solution

```svelte
<script>
  interface Todo {
    id: number;
    text: string;
    done: boolean;
  }

  let todos = $state<Todo[]>(
    JSON.parse(localStorage.getItem('todos') || '[]')
  );
  let nextId = $state(
    todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1
  );
  let newText = $state('');

  let activeCount = $derived(
    todos.filter(t => !t.done).length
  );

  $effect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  });

  function addTodo() {
    if (newText.trim()) {
      todos = [...todos, {
        id: nextId++,
        text: newText.trim(),
        done: false
      }];
      newText = '';
    }
  }

  function toggleTodo(id) {
    todos = todos.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    );
  }

  function removeTodo(id) {
    todos = todos.filter(t => t.id !== id);
  }

  function onKeydown(e) {
    if (e.key === 'Enter') addTodo();
  }
</script>

<div class="todo-app">
  <h2>Todo List</h2>

  <div class="input-row">
    <input
      bind:value={newText}
      onkeydown={onKeydown}
      placeholder="What needs to be done?"
    />
    <button onclick={addTodo}>Add</button>
  </div>

  <ul>
    {#each todos as todo (todo.id)}
      <li class:done={todo.done}>
        <input
          type="checkbox"
          checked={todo.done}
          onchange={() => toggleTodo(todo.id)}
        />
        <span>{todo.text}</span>
        <button onclick={() => removeTodo(todo.id)}>×</button>
      </li>
    {/each}
  </ul>

  {#if activeCount === 0 && todos.length > 0}
    <p class="all-done">🎉 All done!</p>
  {:else}
    <p class="count">{activeCount} item{activeCount !== 1 ? 's' : ''} left</p>
  {/if}
</div>

<style>
  .todo-app { max-width: 400px; }
  .input-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  input[type="text"] { flex: 1; padding: 0.5rem; }
  ul { list-style: none; padding: 0; }
  li { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border-bottom: 1px solid #eee; }
  li.done span { text-decoration: line-through; color: #999; }
  .all-done { color: #22c55e; font-weight: bold; }
  .count { color: #666; }
</style>
```

---

## Exercise C: $state.raw — Key Insight

```svelte
<script>
  let reactiveObj = $state({ x: 0, y: 0 });
  let rawObj = $state.raw({ x: 0, y: 0 });
</script>

<button onclick={() => reactiveObj.x++}>
  ✅ Updates UI (deep reactivity)
</button>

<button onclick={() => rawObj.x++}>
  ❌ No UI update (must reassign)
</button>

<button onclick={() => rawObj = { ...rawObj, x: rawObj.x + 1 }}>
  ✅ Updates UI (explicit reassignment)
</button>
```

### When to Use Each

| | `$state` | `$state.raw` |
|:---|:---|:---|
| **Use for** | Most reactive data | Large arrays, external objects |
| **Mutations** | Deep reactivity | No deep reactivity |
| **Performance** | Proxy overhead | Zero overhead |
| **Example** | UI state, forms | Canvas context, WebGL buffers |

---

## Common Mistakes

1. **Forgetting `()` in `$derived`**

   ```svelte
   // ❌ Wrong
   let doubled = $derived(count * 2);
   // This is actually correct in Svelte 5!

   // ❌ Wrong (Svelte 4 syntax)
   $: doubled = count * 2;
   ```

2. **Mutating `$state.raw` objects directly**

   ```svelte
   let raw = $state.raw([1, 2, 3]);
   raw.push(4); // ❌ No reactivity
   raw = [...raw, 4]; // ✅ Correct
   ```

3. **Not handling `localStorage` parse errors**

   ```svelte
   // ❌ May throw if data is corrupted
   let todos = $state(JSON.parse(localStorage.getItem('todos')));

   // ✅ Safe with fallback
   let todos = $state(JSON.parse(localStorage.getItem('todos') || '[]'));
   ```
