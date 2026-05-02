<script lang="ts">
	import * as d3 from 'd3';
	import { resizeObserver } from '$lib/actions/resizeObserver';
	import type { CategoryDatum } from '$lib/stores/dataStore';

	interface Props {
		data: CategoryDatum[];
		title?: string;
		color?: string;
	}

	let { data, title = '分类统计', color = '#34d399' }: Props = $props();

	let container: HTMLDivElement;
	let width = $state(0);
	let height = $state(0);

	const margin = { top: 20, right: 20, bottom: 60, left: 50 };

	function drawChart() {
		if (!container || width === 0 || height === 0) return;

		const svg = d3.select(container).select<SVGSVGElement>('svg');
		let root = svg.empty() ? d3.select(container).append('svg') : svg;

		root
			.attr('width', width)
			.attr('height', height)
			.attr('role', 'img')
			.attr('aria-label', title);

		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;

		const g = root.selectAll<SVGGElement, unknown>('.chart-area').data([null]);
		const gEnter = g.enter().append('g').attr('class', 'chart-area');
		const chartArea = gEnter.merge(g as any).attr('transform', `translate(${margin.left},${margin.top})`);

		const xScale = d3
			.scaleBand()
			.domain(data.map((d) => d.category))
			.range([0, innerWidth])
			.padding(0.3);

		const yMax = d3.max(data, (d) => d.value) ?? 0;
		const yScale = d3.scaleLinear().domain([0, yMax * 1.1]).range([innerHeight, 0]).nice();

		// Grid
		const yAxisGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat('');
		const grid = chartArea.selectAll<SVGGElement, unknown>('.grid').data([null]);
		grid
			.enter()
			.append('g')
			.attr('class', 'grid')
			.merge(grid as any)
			.call(yAxisGrid as any)
			.selectAll('line')
			.attr('stroke', 'var(--border, #334155)')
			.attr('stroke-opacity', 0.4);
		grid.selectAll('.domain').remove();

		// Axes
		const xAxis = d3.axisBottom(xScale);
		const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d: any) => d3.format('~s')(d));

		const xAxisG = chartArea.selectAll<SVGGElement, unknown>('.x-axis').data([null]);
		xAxisG.enter().append('g').attr('class', 'x-axis').merge(xAxisG as any).attr('transform', `translate(0,${innerHeight})`).call(xAxis as any);
		xAxisG.selectAll('text').attr('fill', 'var(--muted, #94a3b8)').attr('transform', 'rotate(-30)').style('text-anchor', 'end');
		xAxisG.selectAll('.domain, .tick line').attr('stroke', 'var(--border, #334155)');

		const yAxisG = chartArea.selectAll<SVGGElement, unknown>('.y-axis').data([null]);
		yAxisG.enter().append('g').attr('class', 'y-axis').merge(yAxisG as any).call(yAxis as any).selectAll('text').attr('fill', 'var(--muted, #94a3b8)');
		yAxisG.selectAll('.domain, .tick line').attr('stroke', 'var(--border, #334155)');

		// Bars
		const bars = chartArea.selectAll<SVGRectElement, CategoryDatum>('.bar').data(data, (d: any) => d.category);
		bars.exit().transition().duration(300).attr('y', innerHeight).attr('height', 0).remove();

		bars
			.enter()
			.append('rect')
			.attr('class', 'bar')
			.attr('x', (d) => xScale(d.category) ?? 0)
			.attr('y', innerHeight)
			.attr('width', xScale.bandwidth())
			.attr('height', 0)
			.attr('fill', color)
			.attr('rx', 4)
			.merge(bars as any)
			.transition()
			.duration(600)
			.ease(d3.easeCubicOut)
			.attr('x', (d) => xScale(d.category) ?? 0)
			.attr('y', (d) => yScale(d.value))
			.attr('width', xScale.bandwidth())
			.attr('height', (d) => innerHeight - yScale(d.value));

		// Labels
		const labels = chartArea.selectAll<SVGTextElement, CategoryDatum>('.bar-label').data(data, (d: any) => d.category);
		labels.exit().remove();
		labels
			.enter()
			.append('text')
			.attr('class', 'bar-label')
			.attr('text-anchor', 'middle')
			.attr('fill', 'var(--text, #f1f5f9)')
			.attr('font-size', 11)
			.merge(labels as any)
			.transition()
			.duration(600)
			.attr('x', (d) => (xScale(d.category) ?? 0) + xScale.bandwidth() / 2)
			.attr('y', (d) => yScale(d.value) - 6)
			.text((d) => d3.format('~s')(d.value));
	}

	$effect(() => {
		data;
		width;
		height;
		drawChart();
	});
</script>

<div class="chart-card" bind:this={container} use:resizeObserver={{ onResize: (entry) => {
	width = entry.contentRect.width;
	height = entry.contentRect.height;
} }}>
	{#if title}
		<h4 class="chart-title">{title}</h4>
	{/if}
</div>

<style>
	.chart-card {
		background: var(--surface, #1e293b);
		border: 1px solid var(--border, #334155);
		border-radius: 12px;
		padding: 1rem;
		height: 320px;
		display: flex;
		flex-direction: column;
	}

	.chart-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text, #f1f5f9);
		margin: 0 0 0.5rem;
	}

	.chart-card :global(svg) {
		flex: 1;
		width: 100%;
		min-height: 0;
	}
</style>
