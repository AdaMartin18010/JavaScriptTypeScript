<script lang="ts">
	import * as d3 from 'd3';
	import { resizeObserver } from '$lib/actions/resizeObserver';
	import type { PieDatum } from '$lib/stores/dataStore';

	interface Props {
		data: PieDatum[];
		title?: string;
	}

	let { data, title = '占比分布' }: Props = $props();

	let container: HTMLDivElement;
	let width = $state(0);
	let height = $state(0);

	const margin = { top: 20, right: 120, bottom: 20, left: 20 };

	function drawChart() {
		if (!container || width === 0 || height === 0 || data.length === 0) return;

		const svg = d3.select(container).select<SVGSVGElement>('svg');
		let root = svg.empty() ? d3.select(container).append('svg') : svg;

		root
			.attr('width', width)
			.attr('height', height)
			.attr('role', 'img')
			.attr('aria-label', title);

		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;
		const radius = Math.min(innerWidth, innerHeight) / 2;

		const g = root.selectAll<SVGGElement, unknown>('.chart-area').data([null]);
		const gEnter = g.enter().append('g').attr('class', 'chart-area');
		const chartArea = gEnter.merge(g as any).attr('transform', `translate(${margin.left + innerWidth / 2},${margin.top + innerHeight / 2})`);

		const pie = d3.pie<PieDatum>().value((d) => d.value).sort(null);
		const arc = d3.arc<d3.PieArcDatum<PieDatum>>().innerRadius(radius * 0.55).outerRadius(radius * 0.9);
		const arcHover = d3.arc<d3.PieArcDatum<PieDatum>>().innerRadius(radius * 0.55).outerRadius(radius * 0.95);
		const labelArc = d3.arc<d3.PieArcDatum<PieDatum>>().innerRadius(radius * 1.05).outerRadius(radius * 1.05);

		const arcs = pie(data);
		const total = d3.sum(data, (d) => d.value);

		// Slices
		const slices = chartArea.selectAll<SVGPathElement, d3.PieArcDatum<PieDatum>>('.slice').data(arcs, (d: any) => d.data.label);
		slices.exit().transition().duration(300).attrTween('d', function (d) {
			const interpolate = d3.interpolate((this as any)._current || d, { startAngle: d.startAngle, endAngle: d.startAngle, padAngle: 0 } as any);
			return function (t) { return arc(interpolate(t))!; };
		}).remove();

		const slicesEnter = slices.enter().append('path').attr('class', 'slice');
		slicesEnter
			.attr('fill', (d) => d.data.color)
			.attr('stroke', 'var(--surface, #1e293b)')
			.attr('stroke-width', 2)
			.each(function (d) { (this as any)._current = d; })
			.on('mouseover', function (_event, d) {
				d3.select(this).transition().duration(150).attr('d', arcHover(d)!);
			})
			.on('mouseout', function (_event, d) {
				d3.select(this).transition().duration(150).attr('d', arc(d)!);
			})
			.merge(slices as any)
			.transition()
			.duration(600)
			.attrTween('d', function (d) {
				const interpolate = d3.interpolate((this as any)._current || d, d);
				(this as any)._current = interpolate(1);
				return function (t) { return arc(interpolate(t))!; };
			});

		// Center text
		const centerText = chartArea.selectAll<SVGTextElement, unknown>('.center-text').data([null]);
		centerText.enter().append('text').attr('class', 'center-text').merge(centerText as any)
			.attr('text-anchor', 'middle')
			.attr('dy', '0.35em')
			.attr('fill', 'var(--text, #f1f5f9)')
			.attr('font-size', 14)
			.attr('font-weight', 600)
			.text('总计');

		const centerValue = chartArea.selectAll<SVGTextElement, unknown>('.center-value').data([null]);
		centerValue.enter().append('text').attr('class', 'center-value').merge(centerValue as any)
			.attr('text-anchor', 'middle')
			.attr('dy', '1.6em')
			.attr('fill', 'var(--muted, #94a3b8)')
			.attr('font-size', 12)
			.text(d3.format('~s')(total));

		// Legend
		const legend = root.selectAll<SVGGElement, unknown>('.legend').data([null]);
		const legendEnter = legend.enter().append('g').attr('class', 'legend');
		const legendG = legendEnter.merge(legend as any).attr('transform', `translate(${width - margin.right + 10}, ${margin.top})`);

		const items = legendG.selectAll<SVGGElement, PieDatum>('.legend-item').data(data, (d: any) => d.label);
		items.exit().remove();

		const itemsEnter = items.enter().append('g').attr('class', 'legend-item');
		itemsEnter.append('rect').attr('width', 12).attr('height', 12).attr('rx', 3);
		itemsEnter.append('text').attr('x', 18).attr('y', 10).attr('font-size', 12).attr('fill', 'var(--text, #f1f5f9)');

		const itemsMerged = itemsEnter.merge(items as any);
		itemsMerged.attr('transform', (_d, i) => `translate(0, ${i * 22})`);
		itemsMerged.select('rect').attr('fill', (d) => d.color);
		itemsMerged.select('text').text((d) => `${d.label} (${Math.round((d.value / total) * 100)}%)`);
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
