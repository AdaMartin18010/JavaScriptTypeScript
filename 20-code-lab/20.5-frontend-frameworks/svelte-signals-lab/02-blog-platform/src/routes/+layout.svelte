<script lang="ts">
	import { page } from '$app/stores';

	// Svelte 5: 使用 $derived 派生当前路径
	let currentPath = $derived($page.url.pathname);

	// 导航链接
	const navLinks = [
		{ href: '/', label: '首页' },
		{ href: '/blog/new', label: '新建文章' }
	];
</script>

<div class="app">
	<header class="site-header">
		<div class="container">
			<a href="/" class="logo">SvelteKit 博客</a>
			<nav class="main-nav">
				{#each navLinks as link}
					<a
						href={link.href}
						class="nav-link"
						aria-current={currentPath === link.href ? 'page' : undefined}
					>
						{link.label}
					</a>
				{/each}
			</nav>
		</div>
	</header>

	<main class="main-content">
		<div class="container">
			{@render children()}
		</div>
	</main>

	<footer class="site-footer">
		<div class="container">
			<p>
				© {new Date().getFullYear()} SvelteKit 博客平台 ·
				<a href="https://kit.svelte.dev" target="_blank" rel="noopener">SvelteKit 文档</a>
			</p>
		</div>
	</footer>
</div>

<!-- Svelte 5 Snippet: 子内容插槽 -->
{#snippet children()}
	<slot />
{/snippet}

<style>
	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
		line-height: 1.6;
		color: #1a1a2e;
		background-color: #f8f9fa;
	}

	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 1.5rem;
		width: 100%;
	}

	.site-header {
		background: linear-gradient(135deg, #ff3e00 0%, #e62e00 100%);
		color: white;
		padding: 1rem 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.site-header .container {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		font-size: 1.5rem;
		font-weight: 800;
		color: white;
		text-decoration: none;
		letter-spacing: -0.5px;
	}

	.main-nav {
		display: flex;
		gap: 1.5rem;
	}

	.nav-link {
		color: rgba(255, 255, 255, 0.9);
		text-decoration: none;
		font-weight: 500;
		padding: 0.4rem 0.8rem;
		border-radius: 6px;
		transition: all 0.2s ease;
	}

	.nav-link:hover {
		color: white;
		background: rgba(255, 255, 255, 0.15);
	}

	.nav-link[aria-current='page'] {
		color: white;
		background: rgba(255, 255, 255, 0.25);
		font-weight: 600;
	}

	.main-content {
		flex: 1;
		padding: 2.5rem 0;
	}

	.site-footer {
		background: #1a1a2e;
		color: #a0a0b0;
		padding: 1.5rem 0;
		text-align: center;
		font-size: 0.875rem;
	}

	.site-footer a {
		color: #ff8c69;
		text-decoration: none;
	}

	.site-footer a:hover {
		text-decoration: underline;
	}

	:global(h1, h2, h3, h4) {
		line-height: 1.3;
		margin-bottom: 0.75rem;
	}

	:global(p) {
		margin-bottom: 1rem;
	}

	:global(a) {
		color: #ff3e00;
	}

	:global(pre) {
		background: #1a1a2e;
		color: #f8f8f2;
		padding: 1rem;
		border-radius: 8px;
		overflow-x: auto;
		font-size: 0.875rem;
		margin-bottom: 1rem;
	}

	:global(code) {
		font-family: 'Fira Code', 'Consolas', monospace;
		background: #eee;
		padding: 0.15rem 0.35rem;
		border-radius: 4px;
		font-size: 0.9em;
	}

	:global(pre code) {
		background: transparent;
		padding: 0;
	}
</style>
