<script lang="ts">
	import { fade } from 'svelte/transition';

	let { children } = $props();
</script>

<div class="app" in:fade={{ duration: 200 }}>
	<main>
		{@render children()}
	</main>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem 1rem;
	}

	.app {
		width: 100%;
		max-width: 520px;
	}

	main {
		background: #ffffff;
		border-radius: 16px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
		padding: 2rem;
		min-height: 400px;
	}

	@media (max-width: 640px) {
		main {
			padding: 1.25rem;
			border-radius: 12px;
		}
	}
</style>
