/**
 * 饼图/环形图示例 - Pie Chart / Donut Chart
 * 
 * 展示如何使用 D3.js 创建交互式饼图和环形图
 * 包含动画、提示框、图例和点击交互
 */

import * as d3 from 'd3';

/**
 * 饼图数据项接口
 */
export interface PieChartData {
  /** 数据标签 */
  label: string;
  /** 数值 */
  value: number;
  /** 可选的颜色 */
  color?: string;
}

/**
 * 饼图配置选项
 */
export interface PieChartOptions {
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 边距 */
  margin?: { top: number; right: number; bottom: number; left: number };
  /** 颜色方案 */
  colorScheme?: string[];
  /** 动画持续时间(ms) */
  animationDuration?: number;
  /** 是否显示为环形图 */
  donut?: boolean;
  /** 环形图内半径比例 (0-1) */
  innerRadiusRatio?: number;
  /** 是否显示图例 */
  showLegend?: boolean;
  /** 图例位置 */
  legendPosition?: 'right' | 'bottom';
  /** 是否显示百分比标签 */
  showPercentages?: boolean;
  /** 扇形分离距离 */
  padAngle?: number;
  /** 点击回调函数 */
  onSliceClick?: (data: PieChartData, index: number) => void;
}

/**
 * 饼图弧数据类型
 */
type PieArcData = d3.PieArcDatum<PieChartData>;

/**
 * 创建饼图/环形图
 * 
 * @param container - 容器选择器
 * @param data - 饼图数据
 * @param options - 配置选项
 * @returns D3 Selection 对象
 * 
 * @example
 * ```typescript
 * const data: PieChartData[] = [
 *   { label: '分类A', value: 30 },
 *   { label: '分类B', value: 50 },
 *   { label: '分类C', value: 20 }
 * ];
 * 
 * // 饼图
 * createPieChart('#pie-chart', data, { donut: false });
 * 
 * // 环形图
 * createPieChart('#donut-chart', data, { 
 *   donut: true, 
 *   innerRadiusRatio: 0.6 
 * });
 * ```
 */
export function createPieChart(
  container: string,
  data: PieChartData[],
  options: PieChartOptions = {}
): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
  // 默认配置
  const {
    width = 500,
    height = 400,
    margin = { top: 40, right: 150, bottom: 40, left: 40 },
    colorScheme = d3.schemeCategory10,
    animationDuration = 1000,
    donut = false,
    innerRadiusRatio = 0.5,
    showLegend = true,
    legendPosition = 'right',
    showPercentages = true,
    padAngle = 0.02,
    onSliceClick
  } = options;

  // 根据图例位置调整边距
  const adjustedMargin = { ...margin };
  if (showLegend && legendPosition === 'right') {
    adjustedMargin.right = 120;
  } else if (showLegend && legendPosition === 'bottom') {
    adjustedMargin.bottom = 100;
  }

  const innerWidth = width - adjustedMargin.left - adjustedMargin.right;
  const innerHeight = height - adjustedMargin.top - adjustedMargin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;

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

  // 创建颜色比例尺
  const colorScale = d3.scaleOrdinal<string, string>()
    .domain(data.map(d => d.label))
    .range(colorScheme);

  // 主绘图组，居中
  const g = svg.append('g')
    .attr('transform', `translate(${adjustedMargin.left + innerWidth / 2},${adjustedMargin.top + innerHeight / 2})`);

  // 创建饼图生成器
  const pie = d3.pie<PieChartData>()
    .value(d => d.value)
    .sort(null)  // 保持原始顺序
    .padAngle(padAngle);

  // 创建弧生成器
  const arc = d3.arc<d3.PieArcDatum<PieChartData>>()
    .innerRadius(donut ? radius * innerRadiusRatio : 0)
    .outerRadius(radius);

  // 创建悬停时的扩展弧
  const arcHover = d3.arc<d3.PieArcDatum<PieChartData>>()
    .innerRadius(donut ? radius * innerRadiusRatio : 0)
    .outerRadius(radius * 1.08);

  // 计算总值用于百分比
  const totalValue = d3.sum(data, d => d.value);

  // 创建提示框
  const tooltip = d3.select('body').append('div')
    .attr('class', 'pie-tooltip')
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

  // 绘制扇形
  const arcs = g.selectAll('.arc')
    .data(pie(data))
    .enter()
    .append('g')
    .attr('class', 'arc');

  // 添加扇形路径
  const paths = arcs.append('path')
    .attr('fill', (d, i) => d.data.color || colorScale(d.data.label))
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .each(function(d) {
      // 保存初始角度用于动画
      (this as any)._current = { startAngle: 0, endAngle: 0, padAngle: 0 };
    });

  // 扇形入场动画
  paths.transition()
    .duration(animationDuration)
    .attrTween('d', function(d) {
      const interpolate = d3.interpolate(
        { startAngle: 0, endAngle: 0 },
        d
      );
      return function(t: number) {
        return arc(interpolate(t)) || '';
      };
    });

  // 交互效果
  paths
    .on('mouseenter', function(event: MouseEvent, d: PieArcData) {
      // 扇形放大
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', arcHover as any);

      // 计算百分比
      const percentage = ((d.data.value / totalValue) * 100).toFixed(1);

      // 显示提示框
      tooltip
        .style('visibility', 'visible')
        .html(`
          <div style="font-weight: bold; margin-bottom: 4px;">${d.data.label}</div>
          <div>数值: ${d.data.value}</div>
          <div>占比: ${percentage}%</div>
        `);
    })
    .on('mousemove', function(event: MouseEvent) {
      tooltip
        .style('top', `${event.pageY - 10}px`)
        .style('left', `${event.pageX + 10}px`);
    })
    .on('mouseleave', function(event: MouseEvent, d: PieArcData) {
      // 恢复扇形大小
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', arc as any);

      // 隐藏提示框
      tooltip.style('visibility', 'hidden');
    })
    .on('click', function(event: MouseEvent, d: PieArcData) {
      // 点击效果
      const isSelected = d3.select(this).classed('selected');
      
      // 重置所有扇形
      paths
        .classed('selected', false)
        .transition()
        .duration(200)
        .attr('d', arc as any)
        .style('opacity', 1);

      if (!isSelected) {
        // 选中当前扇形
        d3.select(this)
          .classed('selected', true)
          .transition()
          .duration(200)
          .attr('d', arcHover as any);

        // 降低其他扇形透明度
        paths.filter((p: PieArcData) => p.data.label !== d.data.label)
          .style('opacity', 0.6);

        // 触发回调
        if (onSliceClick) {
          onSliceClick(d.data, d.index);
        }
      }
    });

  // 添加百分比标签（可选）
  if (showPercentages) {
    const labelArc = d3.arc<d3.PieArcDatum<PieChartData>>()
      .innerRadius(donut ? radius * (innerRadiusRatio + 0.15) : radius * 0.6)
      .outerRadius(donut ? radius * (innerRadiusRatio + 0.15) : radius * 0.6);

    arcs.append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', donut ? '#333' : '#fff')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .text(d => {
        const percentage = ((d.data.value / totalValue) * 100);
        return percentage > 5 ? `${percentage.toFixed(0)}%` : '';
      })
      .transition()
      .delay(animationDuration * 0.5)
      .duration(500)
      .style('opacity', 1);
  }

  // 环形图中心文字（可选）
  if (donut) {
    const centerGroup = g.append('g')
      .attr('class', 'center-text')
      .style('opacity', 0);

    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -5)
      .style('font-size', '14px')
      .style('fill', '#666')
      .text('总计');

    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 20)
      .style('font-size', '20px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(totalValue.toLocaleString());

    centerGroup.transition()
      .delay(animationDuration * 0.5)
      .duration(500)
      .style('opacity', 1);
  }

  // 添加图例（可选）
  if (showLegend) {
    const legendX = legendPosition === 'right' 
      ? adjustedMargin.left + innerWidth / 2 + radius + 20
      : adjustedMargin.left + 20;
    
    const legendY = legendPosition === 'right'
      ? adjustedMargin.top + innerHeight / 2 - (data.length * 20) / 2
      : height - adjustedMargin.bottom + 20;

    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendX}, ${legendY})`);

    const legendItems = legend.selectAll('.legend-item')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => {
        if (legendPosition === 'right') {
          return `translate(0, ${i * 25})`;
        } else {
          const itemsPerRow = Math.floor(innerWidth / 100);
          const row = Math.floor(i / itemsPerRow);
          const col = i % itemsPerRow;
          return `translate(${col * 100}, ${row * 25})`;
        }
      })
      .style('cursor', 'pointer');

    legendItems.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('rx', 3)
      .attr('fill', (d, i) => d.color || colorScale(d.label));

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .style('font-size', '12px')
      .style('fill', '#333')
      .text(d => d.label);

    // 图例交互
    legendItems
      .on('mouseenter', function(event: MouseEvent, d: PieChartData) {
        // 高亮对应扇形
        paths
          .transition()
          .duration(200)
          .style('opacity', (p: PieArcData) => p.data.label === d.label ? 1 : 0.3);
      })
      .on('mouseleave', function() {
        paths
          .transition()
          .duration(200)
          .style('opacity', 1);
      })
      .on('click', function(event: MouseEvent, d: PieChartData) {
        const arcData = pie(data).find(p => p.data.label === d.label);
        if (arcData && onSliceClick) {
          onSliceClick(d, arcData.index);
        }
      });
  }

  // 添加标题
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', adjustedMargin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .style('font-weight', 'bold')
    .style('fill', '#333')
    .text(donut ? '环形图示例' : '饼图示例');

  return svg;
}

/**
 * 更新饼图数据
 */
export function updatePieChart(
  container: string,
  newData: PieChartData[],
  options: PieChartOptions = {}
): void {
  createPieChart(container, newData, options);
}

/**
 * 销毁饼图
 */
export function destroyPieChart(container: string): void {
  d3.select(container).selectAll('*').remove();
  d3.select('body').selectAll('.pie-tooltip').remove();
}
