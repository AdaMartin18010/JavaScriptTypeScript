<script lang="ts">
	import type { FilterType } from '$lib/stores/todoStore';

	// Props: 双向绑定筛选条件
	let { filter = $bindable('all') }: { filter?: FilterType } = $props();

	const filters: { key: FilterType; label: string }[] = [
		{ key: 'all', label: '全部' },
		{ key: 'active', label: '未完成' },
		{ key: 'completed', label: '已完成' }
	];
</script>

<div class="filter-bar">
	{#each filters as f (f.key)}
		<button
			class="filter-btn"
			class:active={filter === f.key}
			onclick={() => (filter = f.key)}
		>
			{f.label}
		</button>
	{/each}
</div>

<style>
	.filter-bar {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}

	.filter-btn {
		padding: 0.375rem 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 999px;
		background: white;
		color: #6b7280;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.filter-btn:hover {
		border-color: #c7d2fe;
		color: #4f46e5;
	}

	.filter-btn.active {
		background: linear-gradient(135deg, #667eea, #764ba2);
		border-color: transparent;
		color: white;
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.35);
	}
</style>
