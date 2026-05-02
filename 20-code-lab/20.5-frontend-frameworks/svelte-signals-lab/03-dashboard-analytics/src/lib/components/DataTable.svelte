<script lang="ts">
	import type { Transaction } from '$lib/stores/dataStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';

	interface Props {
		data: Transaction[];
		title?: string;
		pageSize?: number;
	}

	let { data, title = '交易记录', pageSize = 8 }: Props = $props();

	let search = $state('');
	let sortKey = $state<keyof Transaction>('date');
	let sortDirection = $state<'asc' | 'desc'>('desc');
	let currentPage = $state(1);

	const filtered = $derived(
		data.filter((row) =>
			row.customer.toLowerCase().includes(search.toLowerCase()) ||
			row.category.toLowerCase().includes(search.toLowerCase()) ||
			row.id.toLowerCase().includes(search.toLowerCase())
		)
	);

	const sorted = $derived(
		[...filtered].sort((a, b) => {
			const aVal = a[sortKey];
			const bVal = b[sortKey];
			if (aVal == null || bVal == null) return 0;
			if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		})
	);

	const totalPages = $derived(Math.max(1, Math.ceil(sorted.length / pageSize)));

	$effect(() => {
		// 搜索或排序变更时重置页码
		search;
		sortKey;
		sortDirection;
		currentPage = 1;
	});

	const paginated = $derived(sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize));

	function toggleSort(key: keyof Transaction) {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDirection = 'desc';
		}
	}

	function statusClass(status: Transaction['status']) {
		switch (status) {
			case 'completed': return 'status-completed';
			case 'pending': return 'status-pending';
			case 'failed': return 'status-failed';
		}
	}

	function statusLabel(status: Transaction['status']) {
		switch (status) {
			case 'completed': return '已完成';
			case 'pending': return '处理中';
			case 'failed': return '失败';
		}
	}
</script>

<section class="table-section" role="region" aria-label={title}>
	<div class="table-header">
		<h3 class="table-title">{title}</h3>
		<div class="table-controls">
			<input
				type="search"
				class="search-input"
				placeholder="搜索客户、分类、ID..."
				bind:value={search}
				aria-label="搜索"
			/>
		</div>
	</div>

	<div class="table-wrap">
		<table class="data-table">
			<thead>
				<tr>
					{@render sortableHeader('date', '日期')}
					{@render sortableHeader('customer', '客户')}
					{@render sortableHeader('category', '分类')}
					{@render sortableHeader('amount', '金额')}
					{@render sortableHeader('status', '状态')}
				</tr>
			</thead>
			<tbody>
				{#each paginated as row (row.id)}
					<tr>
						<td>{formatDate(row.date)}</td>
						<td>{row.customer}</td>
						<td>{row.category}</td>
						<td class="num">{formatCurrency(row.amount)}</td>
						<td>
							<span class="status-badge {statusClass(row.status)}">
								{statusLabel(row.status)}
							</span>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="5" class="empty-cell">
							{@render emptyState('未找到匹配记录')}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="pagination">
		<button
			class="page-btn"
			disabled={currentPage <= 1}
			onclick={() => currentPage--}
			aria-label="上一页"
		>
			◀
		</button>
		<span class="page-info">第 {currentPage} / {totalPages} 页</span>
		<button
			class="page-btn"
			disabled={currentPage >= totalPages}
			onclick={() => currentPage++}
			aria-label="下一页"
		>
			▶
		</button>
	</div>
</section>

{#snippet sortableHeader(key: keyof Transaction, label: string)}
	<th scope="col">
		<button
			class="sort-btn"
			onclick={() => toggleSort(key)}
			aria-sort={sortKey === key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
		>
			{label}
			{#if sortKey === key}
				<span class="sort-indicator">{sortDirection === 'asc' ? '▲' : '▼'}</span>
			{/if}
		</button>
	</th>
{/snippet}

{#snippet emptyState(message: string)}
	<div class="empty-state">
		<p>{message}</p>
	</div>
{/snippet}

<style>
	.table-section {
		background: var(--surface, #1e293b);
		border: 1px solid var(--border, #334155);
		border-radius: 12px;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.table-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.table-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text, #f1f5f9);
		margin: 0;
	}

	.search-input {
		background: var(--bg, #0f172a);
		border: 1px solid var(--border, #334155);
		border-radius: 8px;
		padding: 0.4rem 0.75rem;
		color: var(--text, #f1f5f9);
		font-size: 0.875rem;
		min-width: 220px;
	}

	.search-input:focus {
		outline: 2px solid var(--primary, #60a5fa);
		outline-offset: 0;
	}

	.table-wrap {
		overflow-x: auto;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.data-table th,
	.data-table td {
		padding: 0.65rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid var(--border, #334155);
		white-space: nowrap;
	}

	.data-table th {
		color: var(--muted, #94a3b8);
		font-weight: 500;
	}

	.data-table tbody tr:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	.sort-btn {
		background: none;
		border: none;
		color: inherit;
		font: inherit;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0;
	}

	.sort-btn:hover {
		color: var(--text, #f1f5f9);
	}

	.sort-indicator {
		font-size: 0.7rem;
	}

	.num {
		font-variant-numeric: tabular-nums;
		text-align: right;
	}

	.status-badge {
		display: inline-block;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.status-completed {
		background: rgba(52, 211, 153, 0.15);
		color: #34d399;
	}

	.status-pending {
		background: rgba(251, 191, 36, 0.15);
		color: #fbbf24;
	}

	.status-failed {
		background: rgba(248, 113, 113, 0.15);
		color: #f87171;
	}

	.empty-cell {
		text-align: center;
		padding: 2rem;
		color: var(--muted, #94a3b8);
	}

	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-top: 0.25rem;
	}

	.page-btn {
		background: var(--bg, #0f172a);
		border: 1px solid var(--border, #334155);
		border-radius: 8px;
		color: var(--text, #f1f5f9);
		width: 2rem;
		height: 2rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 0.15s;
	}

	.page-btn:hover:not(:disabled) {
		background: var(--surface-hover, #334155);
	}

	.page-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.page-info {
		font-size: 0.875rem;
		color: var(--muted, #94a3b8);
	}
</style>
