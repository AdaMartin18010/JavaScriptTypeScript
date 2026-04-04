/**
 * 柱状图示例 - Bar Chart
 * 
 * 展示如何使用 D3.js 创建交互式柱状图
 * 包含动画效果、提示框和响应式设计
 */

import * as d3 from 'd3';

/**
 * 柱状图数据项接口
 */
export interface BarChartData {
  /** 类别标签 */
  label: string;
  /** 数值 */
  value: number;
  /** 可选的颜色 */
  color?: string;
}

/**
 * 柱状图配置选项
 */
export interface BarChartOptions {
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 边距 */
  margin?: { top: number; right: number; bottom: number; left: number };
  /** 主题色 */
  colorScheme?: string[];
  /** 动画持续时间(ms) */
  animationDuration?: number;
  /** 是否显示数值标签 */
  showLabels?: boolean;
  /** 是否显示网格线 */
  showGrid?: boolean;
}

/**
 * 创建柱状图
 * 
 * @param container - 容器选择器 (CSS 选择器)
 * @param data - 图表数据
 * @param options - 配置选项
 * @returns D3 Selection 对象，可用于链式调用
 * 
 * @example
 * ```typescript
 * const data: BarChartData[] = [
 *   { label: 'A', value: 30 },
 *   { label: 'B', value: 80 },
 *   { label: 'C', value: 55 }
 * ];
 * 
 * createBarChart('#chart', data, {
 *   width: 600,
 *   height: 400,
 *   showLabels: true
 * });
 * ```
 */
export function createBarChart(
  container: string,
  data: BarChartData[],
  options: BarChartOptions = {}
): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
  // 默认配置
  const {
    width = 600,
    height = 400,
    margin = { top: 40, right: 30, bottom: 60, left: 60 },
    colorScheme = d3.schemeCategory10,
    animationDuration = 750,
    showLabels = true,
    showGrid = true
  } = options;

  // 计算实际绘图区域尺寸
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // 清除已存在的图表
  d3.select(container).selectAll('*').remove();

  // 创建 SVG 容器
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('max-width', '100%')
    .style('height', 'auto');

  // 添加渐变定义
  const defs = svg.append('defs');
  
  // 创建柱状图渐变
  data.forEach((d, i) => {
    const gradientId = `bar-gradient-${i}`;
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    
    const baseColor = d.color || colorScheme[i % colorScheme.length];
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d3.color(baseColor)?.brighter(0.5)?.toString() || baseColor);
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', baseColor);
  });

  // 创建主绘图组
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // 创建 X 轴比例尺（带状比例尺）
  const xScale = d3.scaleBand<string>()
    .domain(data.map(d => d.label))
    .range([0, innerWidth])
    .padding(0.2);

  // 创建 Y 轴比例尺（线性比例尺）
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value) || 0])
    .nice()
    .range([innerHeight, 0]);

  // 添加网格线（可选）
  if (showGrid) {
    const yAxisGrid = d3.axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .style('stroke', '#e0e0e0')
      .style('stroke-dasharray', '3,3');

    g.select('.grid').select('.domain').remove();
  }

  // 创建 X 轴
  const xAxis = g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale));

  // X 轴样式
  xAxis.selectAll('text')
    .style('font-size', '12px')
    .style('fill', '#333');

  // X 轴标签（旋转长文本）
  xAxis.selectAll('text')
    .attr('transform', function(this: SVGTextElement) {
      const textLength = this.getComputedTextLength();
      return textLength > xScale.bandwidth() ? 'rotate(-45)' : 'rotate(0)';
    })
    .style('text-anchor', function(this: SVGTextElement) {
      const textLength = this.getComputedTextLength();
      return textLength > xScale.bandwidth() ? 'end' : 'middle';
    })
    .attr('dx', function(this: SVGTextElement) {
      const textLength = this.getComputedTextLength();
      return textLength > xScale.bandwidth() ? '-0.5em' : '0';
    })
    .attr('dy', function(this: SVGTextElement) {
      const textLength = this.getComputedTextLength();
      return textLength > xScale.bandwidth() ? '0.15em' : '0.71em';
    });

  // 创建 Y 轴
  const yAxis = g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale));

  // Y 轴样式
  yAxis.selectAll('text')
    .style('font-size', '12px')
    .style('fill', '#333');

  // 创建提示框
  const tooltip = d3.select('body').append('div')
    .attr('class', 'd3-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', 'rgba(0, 0, 0, 0.8)')
    .style('color', '#fff')
    .style('padding', '8px 12px')
    .style('border-radius', '4px')
    .style('font-size', '13px')
    .style('pointer-events', 'none')
    .style('z-index', '1000')
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)');

  // 创建柱子
  const bars = g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.label) || 0)
    .attr('width', xScale.bandwidth())
    .attr('y', innerHeight)  // 从底部开始
    .attr('height', 0)       // 初始高度为0
    .attr('fill', (d, i) => `url(#bar-gradient-${i})`)
    .attr('rx', 4)           // 圆角
    .style('cursor', 'pointer');

  // 添加动画
  bars.transition()
    .duration(animationDuration)
    .delay((d, i) => i * 50)  // 交错动画
    .attr('y', d => yScale(d.value))
    .attr('height', d => innerHeight - yScale(d.value));

  // 添加交互
  bars
    .on('mouseenter', function(event: MouseEvent, d: BarChartData) {
      // 高亮效果
      d3.select(this)
        .transition()
        .duration(200)
        .attr('opacity', 0.8)
        .attr('stroke', '#333')
        .attr('stroke-width', 2);

      // 显示提示框
      tooltip
        .style('visibility', 'visible')
        .html(`<strong>${d.label}</strong><br/>数值: ${d.value}`);
    })
    .on('mousemove', function(event: MouseEvent) {
      tooltip
        .style('top', `${event.pageY - 10}px`)
        .style('left', `${event.pageX + 10}px`);
    })
    .on('mouseleave', function() {
      // 恢复样式
      d3.select(this)
        .transition()
        .duration(200)
        .attr('opacity', 1)
        .attr('stroke', 'none');

      // 隐藏提示框
      tooltip.style('visibility', 'hidden');
    });

  // 添加数值标签（可选）
  if (showLabels) {
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
      .attr('y', innerHeight)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .style('opacity', 0)
      .text(d => d.value)
      .transition()
      .duration(animationDuration)
      .delay((d, i) => i * 50 + animationDuration / 2)
      .attr('y', d => yScale(d.value) - 5)
      .style('opacity', 1);
  }

  // 添加标题
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .style('font-weight', 'bold')
    .style('fill', '#333')
    .text('柱状图示例');

  // 添加 Y 轴标题
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -(height / 2))
    .attr('y', margin.left / 3)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('fill', '#666')
    .text('数值');

  return svg;
}

/**
 * 更新柱状图数据
 * 
 * @param container - 容器选择器
 * @param newData - 新数据
 * @param options - 配置选项
 */
export function updateBarChart(
  container: string,
  newData: BarChartData[],
  options: BarChartOptions = {}
): void {
  // 移除旧图表并创建新图表
  createBarChart(container, newData, options);
}

/**
 * 销毁柱状图
 * 
 * @param container - 容器选择器
 */
export function destroyBarChart(container: string): void {
  d3.select(container).selectAll('*').remove();
  d3.select('body').selectAll('.d3-tooltip').remove();
}
