/**
 * 折线图示例 - Line Chart
 * 
 * 展示如何使用 D3.js 创建交互式折线图
 * 包含平滑曲线、数据点、提示框和缩放功能
 */

import * as d3 from 'd3';

/**
 * 折线图数据点接口
 */
export interface LineChartDataPoint {
  /** X 轴值（日期或数字） */
  x: Date | number;
  /** Y 轴值 */
  y: number;
  /** 可选的标签 */
  label?: string;
}

/**
 * 折线系列接口
 */
export interface LineChartSeries {
  /** 系列名称 */
  name: string;
  /** 系列数据 */
  data: LineChartDataPoint[];
  /** 系列颜色 */
  color?: string;
}

/**
 * 折线图配置选项
 */
export interface LineChartOptions {
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 边距 */
  margin?: { top: number; right: number; bottom: number; left: number };
  /** 颜色方案 */
  colorScheme?: string[];
  /** 是否启用曲线平滑 */
  curve?: boolean;
  /** 动画持续时间(ms) */
  animationDuration?: number;
  /** 是否显示数据点 */
  showDots?: boolean;
  /** 是否启用区域填充 */
  showArea?: boolean;
  /** 是否启用缩放 */
  enableZoom?: boolean;
  /** X 轴时间格式 */
  timeFormat?: string;
}

/**
 * 创建折线图
 * 
 * @param container - 容器选择器
 * @param data - 折线系列数据
 * @param options - 配置选项
 * @returns D3 Selection 对象
 * 
 * @example
 * ```typescript
 * const data: LineChartSeries[] = [
 *   {
 *     name: '销售额',
 *     data: [
 *       { x: new Date('2024-01'), y: 100 },
 *       { x: new Date('2024-02'), y: 150 },
 *       { x: new Date('2024-03'), y: 120 }
 *     ],
 *     color: '#ff6b6b'
 *   }
 * ];
 * 
 * createLineChart('#line-chart', data, {
 *   width: 800,
 *   height: 400,
 *   showArea: true,
 *   enableZoom: true
 * });
 * ```
 */
export function createLineChart(
  container: string,
  data: LineChartSeries[],
  options: LineChartOptions = {}
): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
  // 默认配置
  const {
    width = 800,
    height = 400,
    margin = { top: 40, right: 50, bottom: 60, left: 70 },
    colorScheme = d3.schemeCategory10,
    curve = true,
    animationDuration = 1000,
    showDots = true,
    showArea = false,
    enableZoom = false,
    timeFormat = '%Y-%m'
  } = options;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // 清除已存在的图表
  d3.select(container).selectAll('*').remove();

  // 创建 SVG
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('max-width', '100%')
    .style('height', 'auto');

  // 创建裁剪路径（用于动画）
  const defs = svg.append('defs');
  defs.append('clipPath')
    .attr('id', 'clip-line')
    .append('rect')
    .attr('width', innerWidth)
    .attr('height', innerHeight);

  // 创建渐变（用于区域填充）
  data.forEach((series, i) => {
    const gradientId = `area-gradient-${i}`;
    const baseColor = series.color || colorScheme[i % colorScheme.length];
    
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', baseColor)
      .attr('stop-opacity', 0.4);
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', baseColor)
      .attr('stop-opacity', 0.05);
  });

  // 主绘图组
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // 判断 X 轴数据类型
  const isTimeData = data[0]?.data[0]?.x instanceof Date;

  // 创建 X 轴比例尺
  let xScale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>;
  
  if (isTimeData) {
    xScale = d3.scaleTime()
      .domain(d3.extent(data.flatMap(s => s.data), d => d.x as Date) as [Date, Date])
      .range([0, innerWidth]);
  } else {
    xScale = d3.scaleLinear()
      .domain(d3.extent(data.flatMap(s => s.data), d => d.x as number) as [number, number])
      .range([0, innerWidth]);
  }

  // 创建 Y 轴比例尺
  const yScale = d3.scaleLinear()
    .domain([
      0,
      d3.max(data.flatMap(s => s.data), d => d.y) || 0
    ])
    .nice()
    .range([innerHeight, 0]);

  // 创建网格线
  const yAxisGrid = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickFormat(() => '');

  g.append('g')
    .attr('class', 'grid')
    .attr('opacity', 0.1)
    .call(yAxisGrid);

  // 创建线条生成器
  const lineGenerator = d3.line<LineChartDataPoint>()
    .x(d => (xScale as any)(d.x))
    .y(d => yScale(d.y));

  if (curve) {
    lineGenerator.curve(d3.curveMonotoneX);
  }

  // 创建区域生成器
  const areaGenerator = d3.area<LineChartDataPoint>()
    .x(d => (xScale as any)(d.x))
    .y0(innerHeight)
    .y1(d => yScale(d.y));

  if (curve) {
    areaGenerator.curve(d3.curveMonotoneX);
  }

  // 绘制每条线
  const seriesGroups = g.selectAll('.series-group')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'series-group');

  // 绘制区域（可选）
  if (showArea) {
    seriesGroups.append('path')
      .attr('class', 'area')
      .attr('fill', (d, i) => `url(#area-gradient-${i})`)
      .attr('d', d => areaGenerator(d.data) || '')
      .style('opacity', 0)
      .transition()
      .duration(animationDuration)
      .style('opacity', 1);
  }

  // 绘制线条
  const lines = seriesGroups.append('path')
    .attr('class', 'line')
    .attr('fill', 'none')
    .attr('stroke', (d, i) => d.color || colorScheme[i % colorScheme.length])
    .attr('stroke-width', 2.5)
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round')
    .attr('d', d => lineGenerator(d.data) || '');

  // 线条动画
  lines.each(function() {
    const path = d3.select(this);
    const length = (path.node() as SVGPathElement).getTotalLength();
    
    path
      .attr('stroke-dasharray', length)
      .attr('stroke-dashoffset', length)
      .transition()
      .duration(animationDuration)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);
  });

  // 添加数据点（可选）
  if (showDots) {
    data.forEach((series, seriesIndex) => {
      const dots = g.selectAll(`.dot-${seriesIndex}`)
        .data(series.data)
        .enter()
        .append('circle')
        .attr('class', `dot-${seriesIndex}`)
        .attr('cx', d => (xScale as any)(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 0)
        .attr('fill', series.color || colorScheme[seriesIndex % colorScheme.length])
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer');

      dots.transition()
        .delay((d, i) => i * 30 + animationDuration * 0.5)
        .duration(300)
        .attr('r', 5);

      // 数据点交互
      dots
        .on('mouseenter', function(event: MouseEvent, d: LineChartDataPoint) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 8);
        })
        .on('mouseleave', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 5);
        });
    });
  }

  // 创建 X 轴
  const xAxis = g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${innerHeight})`);

  if (isTimeData) {
    xAxis.call(d3.axisBottom(xScale as d3.ScaleTime<number, number>)
      .tickFormat(d3.timeFormat(timeFormat) as any));
  } else {
    xAxis.call(d3.axisBottom(xScale as d3.ScaleLinear<number, number>));
  }

  xAxis.selectAll('text')
    .style('font-size', '11px')
    .attr('transform', 'rotate(-30)')
    .style('text-anchor', 'end')
    .attr('dx', '-0.5em')
    .attr('dy', '0.15em');

  // 创建 Y 轴
  g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale))
    .selectAll('text')
    .style('font-size', '11px');

  // 创建提示框
  const tooltip = d3.select('body').append('div')
    .attr('class', 'line-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', 'rgba(0, 0, 0, 0.85)')
    .style('color', '#fff')
    .style('padding', '10px 14px')
    .style('border-radius', '6px')
    .style('font-size', '13px')
    .style('pointer-events', 'none')
    .style('z-index', '1000')
    .style('box-shadow', '0 4px 12px rgba(0,0,0,0.2)');

  // 添加透明覆盖层用于鼠标追踪
  const overlay = g.append('rect')
    .attr('class', 'overlay')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .style('fill', 'none')
    .style('pointer-events', 'all');

  // 创建追踪线
  const focusLine = g.append('line')
    .attr('class', 'focus-line')
    .attr('y1', 0)
    .attr('y2', innerHeight)
    .style('stroke', '#999')
    .style('stroke-width', 1)
    .style('stroke-dasharray', '5,5')
    .style('opacity', 0);

  // 鼠标移动事件
  overlay.on('mousemove', function(event: MouseEvent) {
    const [mx] = d3.pointer(event);
    
    // 显示追踪线
    focusLine
      .attr('x1', mx)
      .attr('x2', mx)
      .style('opacity', 1);

    // 找到最近的数据点
    let closestPoint: { series: LineChartSeries; point: LineChartDataPoint; distance: number } | null = null;
    
    data.forEach(series => {
      series.data.forEach(point => {
        const px = (xScale as any)(point.x);
        const distance = Math.abs(px - mx);
        if (!closestPoint || distance < closestPoint.distance) {
          closestPoint = { series, point, distance };
        }
      });
    });

    if (closestPoint && closestPoint.distance < 50) {
      const { series, point } = closestPoint;
      const px = (xScale as any)(point.x);
      const py = yScale(point.y);

      const xLabel = isTimeData 
        ? d3.timeFormat(timeFormat)(point.x as Date)
        : String(point.x);

      tooltip
        .style('visibility', 'visible')
        .html(`
          <div style="font-weight: bold; margin-bottom: 4px;">${series.name}</div>
          <div>${xLabel}: <strong>${point.y}</strong></div>
        `)
        .style('top', `${event.pageY - 50}px`)
        .style('left', `${event.pageX + 15}px`);
    } else {
      tooltip.style('visibility', 'hidden');
    }
  });

  overlay.on('mouseleave', function() {
    focusLine.style('opacity', 0);
    tooltip.style('visibility', 'hidden');
  });

  // 添加图例
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width - margin.right - 100}, ${margin.top})`);

  const legendItems = legend.selectAll('.legend-item')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * 20})`);

  legendItems.append('line')
    .attr('x1', 0)
    .attr('x2', 15)
    .attr('y1', 6)
    .attr('y2', 6)
    .attr('stroke', (d, i) => d.color || colorScheme[i % colorScheme.length])
    .attr('stroke-width', 2.5);

  legendItems.append('text')
    .attr('x', 20)
    .attr('y', 10)
    .style('font-size', '12px')
    .style('fill', '#333')
    .text(d => d.name);

  // 添加标题
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .style('font-weight', 'bold')
    .style('fill', '#333')
    .text('折线图示例');

  return svg;
}

/**
 * 更新折线图
 */
export function updateLineChart(
  container: string,
  newData: LineChartSeries[],
  options: LineChartOptions = {}
): void {
  createLineChart(container, newData, options);
}

/**
 * 销毁折线图
 */
export function destroyLineChart(container: string): void {
  d3.select(container).selectAll('*').remove();
  d3.select('body').selectAll('.line-tooltip').remove();
}
