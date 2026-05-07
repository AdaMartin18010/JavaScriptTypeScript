<script>
  let items = $state([]);
  let filter = $state('');
  let sortKey = $state('id');
  let sortDir = $state('asc');

  // Generate initial data
  for (let i = 1; i <= 100; i++) {
    items.push({
      id: i,
      name: `Item ${i}`,
      value: Math.floor(Math.random() * 1000),
      category: ['A', 'B', 'C'][i % 3]
    });
  }

  let filtered = $derived(
    items
      .filter(item => 
        filter === '' || 
        item.name.toLowerCase().includes(filter.toLowerCase()) ||
        item.category === filter
      )
      .sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if (sortKey === 'value') return (a.value - b.value) * dir;
        return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
      })
  );

  function shuffle() {
    items = items.sort(() => Math.random() - 0.5);
  }

  function updateRandom() {
    const idx = Math.floor(Math.random() * items.length);
    items[idx] = { ...items[idx], value: Math.floor(Math.random() * 1000) };
  }
</script>

<div class="table-app">
  <h2>Svelte 5 Table (100 rows)</h2>
  
  <div class="controls">
    <input 
      type="text" 
      placeholder="Filter..." 
      bind:value={filter}
      data-testid="filter"
    />
    <button onclick={() => { sortKey = 'value'; sortDir = sortDir === 'asc' ? 'desc' : 'asc'; }}>
      Sort by Value
    </button>
    <button onclick={shuffle}>Shuffle</button>
    <button onclick={updateRandom}>Update Random</button>
  </div>

  <div class="stats">
    Showing {filtered.length} of {items.length} items
  </div>

  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Value</th>
        <th>Category</th>
      </tr>
    </thead>
    <tbody>
      {#each filtered as item (item.id)}
        <tr data-testid="row">
          <td>{item.id}</td>
          <td>{item.name}</td>
          <td>{item.value}</td>
          <td><span class="badge cat-{item.category}">{item.category}</span></td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-app { max-width: 600px; padding: 1rem; }
  h2 { color: #ff3e00; margin-bottom: 1rem; }
  .controls { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
  input { padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; flex: 1; min-width: 120px; }
  button { padding: 0.5rem 1rem; border: none; border-radius: 4px; background: #ff3e00; color: white; cursor: pointer; }
  button:hover { background: #e63600; }
  .stats { color: #666; margin-bottom: 0.5rem; font-size: 0.9rem; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #eee; }
  th { background: #f5f5f5; font-weight: 600; }
  .badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
  .cat-A { background: #dbeafe; color: #1e40af; }
  .cat-B { background: #dcfce7; color: #166534; }
  .cat-C { background: #fef3c7; color: #92400e; }
</style>
