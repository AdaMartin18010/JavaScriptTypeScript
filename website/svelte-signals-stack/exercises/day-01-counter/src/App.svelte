<script>
  // ============================================
  // Day 1-3 Exercise: Counter + Todo List
  // ============================================
  // Your task: Implement the exercises described in README.md
  // This file contains starter code with TODO markers

  // --- Exercise A: Counter ---
  let count = $state(0);
  // TODO: Add $derived for doubled
  // TODO: Add $derived for isEven
  // TODO: Add $effect for console logging

  function increment() {
    count++;
  }

  function decrement() {
    // TODO: Prevent negative count
    count--;
  }

  // --- Exercise B: Todo List ---
  // TODO: Create todo type and state
  // let todos = $state<Todo[]>([]);
  // let nextId = $state(1);

  function addTodo(text) {
    // TODO: Implement
  }

  function toggleTodo(id) {
    // TODO: Implement
  }

  function removeTodo(id) {
    // TODO: Implement
  }

  // TODO: Add $derived for active count
  // TODO: Add $effect for localStorage persistence

  // --- Exercise C: $state.raw exploration ---
  let reactiveObj = $state({ x: 0, y: 0 });
  let rawObj = $state.raw({ x: 0, y: 0 });
</script>

<div class="container">
  <!-- Exercise A: Counter -->
  <section class="exercise">
    <h2>🔢 Exercise A: Counter</h2>
    <div class="counter">
      <h1>{count}</h1>
      <div class="derived">
        <!-- TODO: Show doubled and isEven -->
      </div>
      <div class="controls">
        <button onclick={decrement}>-</button>
        <button onclick={increment}>+</button>
      </div>
    </div>
  </section>

  <!-- Exercise B: Todo List -->
  <section class="exercise">
    <h2>✅ Exercise B: Todo List</h2>
    <!-- TODO: Implement todo list UI -->
    <p class="placeholder">Implement the todo list here...</p>
  </section>

  <!-- Exercise C: $state.raw -->
  <section class="exercise">
    <h2>🔬 Exercise C: $state vs $state.raw</h2>
    <div class="comparison">
      <div>
        <h3>$state (reactive)</h3>
        <p>x: {reactiveObj.x}, y: {reactiveObj.y}</p>
        <button onclick={() => reactiveObj.x++}>mutate reactive.x++</button>
      </div>
      <div>
        <h3>$state.raw (non-reactive)</h3>
        <p>x: {rawObj.x}, y: {rawObj.y}</p>
        <button onclick={() => rawObj.x++}>mutate raw.x++</button>
        <button onclick={() => rawObj = { ...rawObj, x: rawObj.x + 1 }}>
          reassign raw
        </button>
      </div>
    </div>
  </section>
</div>

<style>
  .container { max-width: 600px; margin: 0 auto; padding: 1rem; }
  .exercise { margin-bottom: 3rem; padding: 1.5rem; border: 1px solid #ddd; border-radius: 12px; }
  h2 { color: #ff3e00; margin-bottom: 1rem; }
  .counter { text-align: center; }
  .counter h1 { font-size: 4rem; margin: 0; }
  .controls { display: flex; gap: 1rem; justify-content: center; margin-top: 1rem; }
  button { padding: 0.5rem 1rem; font-size: 1.2rem; border: none; border-radius: 6px; background: #ff3e00; color: white; cursor: pointer; }
  button:hover { background: #e63600; }
  .placeholder { color: #999; font-style: italic; }
  .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .comparison h3 { font-size: 1rem; color: #666; }
</style>
