/**
 * @file SVG 柱状图生成器
 * @category Data Visualization → Bar Chart
 * @difficulty medium
 * @tags data-viz, svg, bar-chart, chart-generator
 *
 * @description
 * 纯数据驱动的 SVG 柱状图生成器，支持分组、堆叠和水平/垂直方向
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export interface BarChartOptions {
  width: number;
  height: number;
  padding?: { top: number; right: number; bottom: number; left: number };
  barSpacing?: number;
  groupSpacing?: number;
  stacked?: boolean;
  horizontal?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  valueFormatter?: (value: number) => string;
}

export interface RenderedBar {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  datasetIndex: number;
  dataIndex: number;
  color: string;
}

// ============================================================================
// 柱状图生成器
// ============================================================================

export class BarChartSVGGenerator {
  private options: Required<BarChartOptions>;

  constructor(options: BarChartOptions) {
    this.options = {
      padding: { top: 40, right: 40, bottom: 60, left: 60 },
      barSpacing: 4,
      groupSpacing: 24,
      stacked: false,
      horizontal: false,
      showGrid: true,
      showLabels: true,
      showValues: false,
      valueFormatter: (v: number) => String(v),
      ...options
    };
  }

  /**
   * 计算所有柱子的几何信息
   */
  calculateBars(data: BarChartData): RenderedBar[] {
    const { width, height, padding, stacked, horizontal } = this.options;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const allValues = stacked
      ? data.labels.map((_, i) => data.datasets.reduce((sum, d) => sum + (d.data[i] || 0), 0))
      : data.datasets.flatMap(d => d.data);

    const maxValue = Math.max(...allValues, 1);
    const bars: RenderedBar[] = [];

    if (horizontal) {
      // 水平柱状图
      const groupHeight = chartHeight / data.labels.length;
      const barHeight = stacked
        ? groupHeight - this.options.groupSpacing
        : (groupHeight - this.options.groupSpacing) / data.datasets.length - this.options.barSpacing;

      for (let i = 0; i < data.labels.length; i++) {
        let currentX = padding.left;

        for (let j = 0; j < data.datasets.length; j++) {
          const value = data.datasets[j].data[i] || 0;
          const barWidth = (value / maxValue) * chartWidth;

          if (stacked) {
            bars.push({
              x: currentX,
              y: padding.top + i * groupHeight + this.options.groupSpacing / 2,
              width: barWidth,
              height: barHeight,
              value,
              datasetIndex: j,
              dataIndex: i,
              color: data.datasets[j].color || this.defaultColor(j)
            });
            currentX += barWidth;
          } else {
            bars.push({
              x: padding.left,
              y: padding.top + i * groupHeight + this.options.groupSpacing / 2 + j * (barHeight + this.options.barSpacing),
              width: barWidth,
              height: barHeight,
              value,
              datasetIndex: j,
              dataIndex: i,
              color: data.datasets[j].color || this.defaultColor(j)
            });
          }
        }
      }
    } else {
      // 垂直柱状图
      const groupWidth = chartWidth / data.labels.length;
      const barWidth = stacked
        ? groupWidth - this.options.groupSpacing
        : (groupWidth - this.options.groupSpacing) / data.datasets.length - this.options.barSpacing;

      for (let i = 0; i < data.labels.length; i++) {
        let currentY = 0;

        for (let j = 0; j < data.datasets.length; j++) {
          const value = data.datasets[j].data[i] || 0;
          const barHeight = (value / maxValue) * chartHeight;

          if (stacked) {
            bars.push({
              x: padding.left + i * groupWidth + this.options.groupSpacing / 2,
              y: padding.top + chartHeight - currentY - barHeight,
              width: barWidth,
              height: barHeight,
              value,
              datasetIndex: j,
              dataIndex: i,
              color: data.datasets[j].color || this.defaultColor(j)
            });
            currentY += barHeight;
          } else {
            bars.push({
              x: padding.left + i * groupWidth + this.options.groupSpacing / 2 + j * (barWidth + this.options.barSpacing),
              y: padding.top + chartHeight - barHeight,
              width: barWidth,
              height: barHeight,
              value,
              datasetIndex: j,
              dataIndex: i,
              color: data.datasets[j].color || this.defaultColor(j)
            });
          }
        }
      }
    }

    return bars;
  }

  /**
   * 生成 SVG 字符串
   */
  generateSVG(data: BarChartData): string {
    const { width, height, padding, showGrid, showLabels } = this.options;
    const bars = this.calculateBars(data);

    const allValues = data.datasets.flatMap(d => d.data);
    const maxValue = Math.max(...allValues, 1);

    const lines: string[] = [
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`,
      `  <rect width="${width}" height="${height}" fill="#ffffff"/>`
    ];

    // 网格线
    if (showGrid) {
      const chartHeight = height - padding.top - padding.bottom;
      const gridCount = 5;

      for (let i = 0; i <= gridCount; i++) {
        const y = padding.top + (chartHeight / gridCount) * i;
        const value = Math.round(maxValue * (1 - i / gridCount));
        lines.push(`  <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`);
        lines.push(`  <text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" font-size="12" fill="#6b7280">${this.options.valueFormatter(value)}</text>`);
      }
    }

    // 柱子
    for (const bar of bars) {
      lines.push(`  <rect x="${bar.x}" y="${bar.y}" width="${bar.width}" height="${bar.height}" fill="${bar.color}" rx="2"/>`);

      if (this.options.showValues && bar.height > 14) {
        const textY = this.options.horizontal ? bar.y + bar.height / 2 + 4 : bar.y - 6;
        const textX = this.options.horizontal ? bar.x + bar.width + 4 : bar.x + bar.width / 2;
        const anchor = this.options.horizontal ? 'start' : 'middle';
        lines.push(`  <text x="${textX}" y="${textY}" text-anchor="${anchor}" font-size="11" fill="#374151">${this.options.valueFormatter(bar.value)}</text>`);
      }
    }

    // X 轴标签
    if (showLabels) {
      const chartWidth = width - padding.left - padding.right;
      const groupWidth = chartWidth / data.labels.length;

      for (let i = 0; i < data.labels.length; i++) {
        const x = padding.left + i * groupWidth + groupWidth / 2;
        const y = height - padding.bottom + 20;
        lines.push(`  <text x="${x}" y="${y}" text-anchor="middle" font-size="12" fill="#374151">${data.labels[i]}</text>`);
      }
    }

    lines.push('</svg>');
    return lines.join('\n');
  }

  private defaultColor(index: number): string {
    const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    return palette[index % palette.length];
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== SVG 柱状图生成器 ===\n');

  const data: BarChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      { label: 'Revenue', data: [120, 190, 150, 250], color: '#3b82f6' },
      { label: 'Cost', data: [80, 120, 100, 160], color: '#ef4444' }
    ]
  };

  const generator = new BarChartSVGGenerator({
    width: 600,
    height: 400,
    showValues: true
  });

  console.log('Bars calculated:', generator.calculateBars(data).length);
  console.log('\nSVG Preview (first 300 chars):');
  console.log(generator.generateSVG(data).substring(0, 300));
}
