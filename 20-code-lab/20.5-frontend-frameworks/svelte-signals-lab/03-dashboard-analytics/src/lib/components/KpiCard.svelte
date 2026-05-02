<script lang="ts">
	interface Props {
		title: string;
		value: number;
		change?: number; // 百分比变化
		icon?: string;
		formatter?: (n: number) => string;
	}

	let { title, value, change = 0, icon = '📊', formatter = (n: number) => n.toLocaleString() }: Props = $props();

	const isPositive = $derived(change >= 0);
	const displayChange = $derived(`${isPositive ? '+' : ''}${change.toFixed(1)}%`);
</script>

<article class="kpi-card" role="region" aria-label={title}>
	<div class="kpi-header">
		<span class="kpi-icon" aria-hidden="true">{icon}</span>
		<h3 class="kpi-title">{title}</h3>
	</div>
	<p class="kpi-value">{formatter(value)}</p>
	<div class="kpi-footer">
		<span class="kpi-change" class:positive={isPositive} class:negative={!isPositive}>
			{isPositive ? '▲' : '▼'} {displayChange}
		</span>
		<span class="kpi-label">较上月</span>
	</div>
</article>

<style>
	.kpi-card {
		background: var(--surface, #1e293b);
		border: 1px solid var(--border, #334155);
		border-radius: 12px;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		transition: box-shadow 0.2s, transform 0.2s;
	}

	.kpi-card:hover {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
		transform: translateY(-2px);
	}

	.kpi-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.kpi-icon {
		font-size: 1.25rem;
	}

	.kpi-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--muted, #94a3b8);
		margin: 0;
	}

	.kpi-value {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--text, #f1f5f9);
		margin: 0;
	}

	.kpi-footer {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
	}

	.kpi-change {
		font-weight: 600;
	}

	.kpi-change.positive {
		color: var(--success, #34d399);
	}

	.kpi-change.negative {
		color: var(--danger, #f87171);
	}

	.kpi-label {
		color: var(--muted, #94a3b8);
	}
</style>
