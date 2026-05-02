<script lang="ts">
	let sidebarOpen = $state(true);

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}
</script>

<div class="dashboard" class:sidebar-closed={!sidebarOpen}>
	<aside class="sidebar" aria-label="主导航">
		<div class="sidebar-brand">
			<span class="brand-icon">📈</span>
			{#if sidebarOpen}
				<span class="brand-text">Analytics</span>
			{/if}
		</div>
		<nav class="sidebar-nav">
			<a class="nav-item active" href="/">
				<span class="nav-icon">🏠</span>
				{#if sidebarOpen}<span class="nav-label">概览</span>{/if}
			</a>
			<a class="nav-item" href="/">
				<span class="nav-icon">📊</span>
				{#if sidebarOpen}<span class="nav-label">报表</span>{/if}
			</a>
			<a class="nav-item" href="/">
				<span class="nav-icon">⚙️</span>
				{#if sidebarOpen}<span class="nav-label">设置</span>{/if}
			</a>
		</nav>
	</aside>

	<div class="main">
		<header class="topbar">
			<button class="menu-toggle" onclick={toggleSidebar} aria-label="切换侧边栏">
				☰
			</button>
			<h1 class="page-title">数据面板</h1>
			<div class="topbar-actions">
				<span class="user-badge">👤 Admin</span>
			</div>
		</header>

		<main class="content">
			<slot />
		</main>
	</div>
</div>

<style>
	:global(:root) {
		--bg: #0f172a;
		--surface: #1e293b;
		--surface-hover: #334155;
		--border: #334155;
		--text: #f1f5f9;
		--muted: #94a3b8;
		--primary: #60a5fa;
		--success: #34d399;
		--danger: #f87171;
		--sidebar-width: 220px;
		--sidebar-collapsed: 64px;
		--topbar-height: 56px;
	}

	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji';
		background: var(--bg);
		color: var(--text);
		line-height: 1.5;
	}

	.dashboard {
		display: flex;
		min-height: 100vh;
	}

	.sidebar {
		width: var(--sidebar-width);
		background: var(--surface);
		border-right: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		transition: width 0.25s ease;
		position: sticky;
		top: 0;
		height: 100vh;
		overflow: hidden;
	}

	.dashboard.sidebar-closed .sidebar {
		width: var(--sidebar-collapsed);
	}

	.sidebar-brand {
		height: var(--topbar-height);
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0 1rem;
		border-bottom: 1px solid var(--border);
		font-weight: 700;
		font-size: 1.125rem;
		white-space: nowrap;
	}

	.brand-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.sidebar-nav {
		padding: 0.75rem 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.6rem 0.75rem;
		border-radius: 8px;
		color: var(--muted);
		text-decoration: none;
		font-size: 0.9375rem;
		transition: background 0.15s, color 0.15s;
		white-space: nowrap;
	}

	.nav-item:hover,
	.nav-item.active {
		background: rgba(96, 165, 250, 0.1);
		color: var(--primary);
	}

	.nav-icon {
		font-size: 1.1rem;
		flex-shrink: 0;
		width: 1.5rem;
		text-align: center;
	}

	.main {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.topbar {
		height: var(--topbar-height);
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0 1.25rem;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.menu-toggle {
		background: none;
		border: none;
		color: var(--muted);
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 6px;
		transition: background 0.15s;
	}

	.menu-toggle:hover {
		background: var(--surface-hover);
	}

	.page-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
		flex: 1;
	}

	.topbar-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.user-badge {
		font-size: 0.875rem;
		color: var(--muted);
		background: var(--bg);
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
	}

	.content {
		flex: 1;
		padding: 1.25rem;
		overflow-y: auto;
	}
</style>
