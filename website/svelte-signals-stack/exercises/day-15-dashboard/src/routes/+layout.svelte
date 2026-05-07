<script>
  let { children } = $props();
  
  const navItems = [
    { href: '/', label: 'Overview', icon: '📊' },
    { href: '/traffic', label: 'Traffic', icon: '📈' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];
</script>

<div class="dashboard">
  <nav class="sidebar">
    <h1>📊 Analytics</h1>
    <ul>
      {#each navItems as item}
        <li>
          <a href={item.href} class="nav-link">
            <span class="icon">{item.icon}</span>
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
  
  <main class="content">
    {@render children()}
  </main>
</div>

<style>
  :global(body) { margin: 0; font-family: system-ui, sans-serif; background: #f5f5f5; }
  .dashboard { display: grid; grid-template-columns: 200px 1fr; min-height: 100vh; }
  .sidebar { background: #1e293b; color: white; padding: 1rem; }
  .sidebar h1 { font-size: 1.2rem; margin-bottom: 2rem; }
  .sidebar ul { list-style: none; padding: 0; }
  .sidebar li { margin-bottom: 0.5rem; }
  .nav-link { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border-radius: 6px; color: #cbd5e1; text-decoration: none; transition: background 0.2s; }
  .nav-link:hover { background: #334155; color: white; }
  .icon { font-size: 1.2rem; }
  .content { padding: 2rem; }
</style>
