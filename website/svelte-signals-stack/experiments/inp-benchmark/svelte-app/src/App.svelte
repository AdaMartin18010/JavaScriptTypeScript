<script>
  import Counter from './Counter.svelte';
  import Table from './Table.svelte';
  import Form from './Form.svelte';

  let activeTab = $state('counter');

  const tabs = [
    { id: 'counter', label: 'Counter', desc: 'Minimal update' },
    { id: 'table', label: 'Table', desc: '100-row list' },
    { id: 'form', label: 'Form', desc: 'Multi-field validation' },
  ];
</script>

<div class="app">
  <header>
    <h1>🔥 Svelte 5 INP Benchmark</h1>
    <p>Test app for Interaction to Next Paint measurement</p>
  </header>

  <nav>
    {#each tabs as tab}
      <button
        class:active={activeTab === tab.id}
        onclick={() => activeTab = tab.id}
        data-testid={`tab-${tab.id}`}
      >
        {tab.label}
        <small>{tab.desc}</small>
      </button>
    {/each}
  </nav>

  <main>
    {#if activeTab === 'counter'}
      <Counter />
    {:else if activeTab === 'table'}
      <Table />
    {:else if activeTab === 'form'}
      <Form />
    {/if}
  </main>

  <footer>
    <p>Measured with <code>web-vitals</code> library. See benchmark runner for automated collection.</p>
  </footer>
</div>

<style>
  :global(body) { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .app { max-width: 800px; margin: 0 auto; padding: 1rem; }
  header { text-align: center; margin-bottom: 2rem; }
  header h1 { color: #ff3e00; margin-bottom: 0.5rem; }
  header p { color: #666; }
  nav { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 2rem; }
  nav button { padding: 0.75rem 1.5rem; border: 2px solid #ddd; border-radius: 8px; background: white; cursor: pointer; display: flex; flex-direction: column; align-items: center; transition: all 0.2s; }
  nav button.active { border-color: #ff3e00; background: #fff5f2; }
  nav button:hover { border-color: #ff3e00; }
  nav button small { font-size: 0.75rem; color: #666; }
  main { min-height: 400px; }
  footer { text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee; color: #666; font-size: 0.9rem; }
  footer code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 4px; }
</style>
