<script lang="ts">
	import * as d3 from 'd3';
	import { resizeObserver } from '$lib/actions/resizeObserver';
	import type { DataPoint } from '$lib/stores/dataStore';

	interface Props {
		data: DataPoint[];
		title?: string;
		color?: string;
	}

	let { data, title = '趋势图', color = '#60a5fa' }: Props = $props();

	let container: HTMLDivElement;
	let width = $state(0);
	let height = $state(0);

	const margin = { top: 20, right: 20, bottom: 30, left: 50 };

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

		const xDomain = d3.extent(data, (d) => d.date) as [Date, Date];
		const xScale = d3.scaleTime().domain(xDomain).range([0, innerWidth]);

		const yMax = d3.max(data, (d) => d.value) ?? 0;
		const yMin = d3.min(data, (d) => d.value) ?? 0;
		const yScale = d3.scaleLinear().domain([Math.min(0, yMin * 0.9), yMax * 1.1]).range([innerHeight, 0]).nice();

		// Grid lines
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
		const xAxis = d3.axisBottom(xScale).ticks(Math.max(3, Math.floor(innerWidth / 80))).tickFormat(d3.timeFormat('%m-%d') as any);
		const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d: any) => d3.format('~s')(d));

		const xAxisG = chartArea.selectAll<SVGGElement, unknown>('.x-axis').data([null]);
		xAxisG.enter().append('g').attr('class', 'x-axis').merge(xAxisG as any).attr('transform', `translate(0,${innerHeight})`).call(xAxis as any).selectAll('text').attr('fill', 'var(--muted, #94a3b8)');
		xAxisG.selectAll('.domain, .tick line').attr('stroke', 'var(--border, #334155)');

		const yAxisG = chartArea.selectAll<SVGGElement, unknown>('.y-axis').data([null]);
		yAxisG.enter().append('g').attr('class', 'y-axis').merge(yAxisG as any).call(yAxis as any).selectAll('text').attr('fill', 'var(--muted, #94a3b8)');
		yAxisG.selectAll('.domain, .tick line').attr('stroke', 'var(--border, #334155)');

		// Line
		const line = d3
			.line<DataPoint>()
			.x((d) => xScale(d.date))
			.y((d) => yScale(d.value))
			.curve(d3.curveMonotoneX);

		const path = chartArea.selectAll<SVGPathElement, unknown>('.line-path').data([data]);
		path
			.enter()
			.append('path')
			.attr('class', 'line-path')
			.attr('fill', 'none')
			.attr('stroke', color)
			.attr('stroke-width', 2)
			.merge(path as any)
			.attr('d', line)
			.attr('stroke-linecap', 'round');

		// Area
		const area = d3
			.area<DataPoint>()
			.x((d) => xScale(d.date))
			.y0(innerHeight)
			.y1((d) => yScale(d.value))
			.curve(d3.curveMonotoneX);

		const areaPath = chartArea.selectAll<SVGPathElement, unknown>('.area-path').data([data]);
		areaPath
			.enter()
			.append('path')
			.attr('class', 'area-path')
			.merge(areaPath as any)
			.attr('d', area)
			.attr('fill', color)
			.attr('opacity', 0.15);

		// Dots
		const dots = chartArea.selectAll<SVGCircleElement, DataPoint>('.dot').data(data, (d: any) => d.date.getTime());
		dots.exit().remove();
		dots
			.enter()
			.append('circle')
			.attr('class', 'dot')
			.attr('r', 3)
			.attr('fill', color)
			.attr('stroke', 'var(--surface, #1e293b)')
			.attr('stroke-width', 2)
			.merge(dots as any)
			.attr('cx', (d) => xScale(d.date))
			.attr('cy', (d) => yScale(d.value));
	}

	$effect(() => {
		// 依赖 data, width, height
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
