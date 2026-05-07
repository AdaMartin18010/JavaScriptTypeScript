<script>
  let count = $state(0);
  let doubled = $derived(count * 2);

  function increment() {
    count++;
  }

  function incrementBatch(n) {
    for (let i = 0; i < n; i++) {
      count++;
    }
  }
</script>

<div class="counter-app">
  <h2>Svelte 5 Counter</h2>
  <div class="display">
    <span class="value" data-testid="count">{count}</span>
    <span class="derived" data-testid="doubled">doubled: {doubled}</span>
  </div>
  <div class="controls">
    <button onclick={increment} data-testid="increment">+1</button>
    <button onclick={() => incrementBatch(10)} data-testid="increment-10">+10</button>
    <button onclick={() => incrementBatch(100)} data-testid="increment-100">+100</button>
  </div>
</div>

<style>
  .counter-app {
    padding: 2rem;
    border: 2px solid #ff3e00;
    border-radius: 12px;
    max-width: 400px;
  }
  h2 { color: #ff3e00; margin-bottom: 1rem; }
  .display { margin-bottom: 1rem; }
  .value { font-size: 3rem; font-weight: bold; display: block; }
  .derived { color: #666; }
  .controls { display: flex; gap: 0.5rem; }
  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    background: #ff3e00;
    color: white;
    cursor: pointer;
    font-size: 1rem;
  }
  button:hover { background: #e63600; }
</style>
