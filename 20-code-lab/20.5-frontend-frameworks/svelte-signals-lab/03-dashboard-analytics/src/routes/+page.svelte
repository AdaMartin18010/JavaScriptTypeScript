<script lang="ts">
	import { createDataStore } from '$lib/stores/dataStore';
	import { formatCurrency, formatCompactNumber, formatPercent } from '$lib/utils/formatters';
	import KpiCard from '$lib/components/KpiCard.svelte';
	import LineChart from '$lib/components/LineChart.svelte';
	import BarChart from '$lib/components/BarChart.svelte';
	import PieChart from '$lib/components/PieChart.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	const store = createDataStore();

	// 启动实时更新
	$effect(() => {
		store.startRealtime(6000);
		return () => store.stopRealtime();
	});

	const kpiCards = $derived([
		{ title: '总收入', value: store.totalRevenue, change: 12.5, icon: '💰', formatter: formatCurrency },
		{ title: '总订单', value: store.totalOrders, change: 8.2, icon: '📦', formatter: formatCompactNumber },
		{ title: '客单价', value: store.avgOrderValue, change: -2.4, icon: '🏷️', formatter: formatCurrency },
		{ title: '完成率', value: store.completionRate, change: 3.1, icon: '✅', formatter: (n: number) => formatPercent(n) }
	]);
</script>

<svelte:head>
	<title>Dashboard Analytics</title>
</svelte:head>

<section class="dashboard-page" aria-label="Dashboard 概览">
	<div class="kpi-grid">
		{#each kpiCards as card (card.title)}
			<KpiCard
				title={card.title}
				value={card.value}
				change={card.change}
				icon={card.icon}
				formatter={card.formatter}
			/>
		{/each}
	</div>

	<div class="charts-row">
		<div class="chart-col wide">
			<LineChart data={store.lineData} title="收入趋势（近30天）" color="#60a5fa" />
		</div>
		<div class="chart-col">
			<PieChart data={store.pieData} title="分类占比" />
		</div>
	</div>

	<div class="charts-row">
		<div class="chart-col">
			<BarChart data={store.barData} title="分类销售额" color="#34d399" />
		</div>
		<div class="chart-col wide">
			<DataTable data={store.transactions} title="最近交易" pageSize={6} />
		</div>
	</div>
</section>

<style>
	.dashboard-page {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.kpi-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
	}

	.charts-row {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 1rem;
	}

	.chart-col {
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.chart-col.wide {
		grid-column: span 1;
	}

	@media (max-width: 960px) {
		.charts-row {
			grid-template-columns: 1fr;
		}
	}
</style>
