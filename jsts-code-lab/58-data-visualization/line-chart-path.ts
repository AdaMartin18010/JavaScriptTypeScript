/**
 * @file 折线图路径计算
 * @category Data Visualization → Line Chart
 * @difficulty medium
 * @tags data-viz, svg, line-chart, path-generator
 *
 * @description
 * 折线图 SVG path 数据生成器，支持多种插值和平滑算法
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface LineChartPoint {
  x: number;
  y: number;
  label?: string;
  value?: number;
}

export interface LineChartDataset {
  label: string;
  points: LineChartPoint[];
  color?: string;
  width?: number;
  smooth?: boolean;
  fill?: boolean;
  fillOpacity?: number;
}

export interface LineChartOptions {
  width: number;
  height: number;
  padding?: { top: number; right: number; bottom: number; left: number };
  showPoints?: boolean;
  showGrid?: boolean;
  curveTension?: number;
}

// ============================================================================
// 路径生成器
// ============================================================================

export class LineChartPathGenerator {
  private options: Required<LineChartOptions>;

  constructor(options: LineChartOptions) {
    this.options = {
      padding: { top: 40, right: 40, bottom: 60, left: 60 },
      showPoints: true,
      showGrid: true,
      curveTension: 0.3,
      ...options
    };
  }

  /**
   * 生成直线 path 数据（L 命令）
   */
  static generateLinePath(points: LineChartPoint[]): string {
    if (points.length === 0) return '';

    const commands: string[] = [`M ${points[0].x} ${points[0].y}`];

    for (let i = 1; i < points.length; i++) {
      commands.push(`L ${points[i].x} ${points[i].y}`);
    }

    return commands.join(' ');
  }

  /**
   * 生成平滑曲线 path 数据（三次贝塞尔）
   */
  static generateSmoothPath(points: LineChartPoint[], tension = 0.3): string {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    const commands: string[] = [`M ${points[0].x} ${points[0].y}`];

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      commands.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
    }

    return commands.join(' ');
  }

  /**
   * 生成阶梯线 path 数据
   */
  static generateStepPath(points: LineChartPoint[]): string {
    if (points.length === 0) return '';

    const commands: string[] = [`M ${points[0].x} ${points[0].y}`];

    for (let i = 1; i < points.length; i++) {
      commands.push(`L ${points[i].x} ${points[i - 1].y}`);
      commands.push(`L ${points[i].x} ${points[i].y}`);
    }

    return commands.join(' ');
  }

  /**
   * 生成面积填充 path（闭合路径）
   */
  static generateAreaPath(points: LineChartPoint[], baselineY: number, smooth = false, tension = 0.3): string {
    const linePath = smooth
      ? this.generateSmoothPath(points, tension)
      : this.generateLinePath(points);

    if (points.length === 0) return '';

    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];

    return `${linePath} L ${lastPoint.x} ${baselineY} L ${firstPoint.x} ${baselineY} Z`;
  }

  /**
   * 将数据点映射到坐标系
   */
  mapPoints(data: number[], labels: string[], chartWidth: number, chartHeight: number): LineChartPoint[] {
    const maxValue = Math.max(...data, 1);
    const minValue = Math.min(...data, 0);
    const range = maxValue - minValue || 1;

    const stepX = chartWidth / Math.max(data.length - 1, 1);

    return data.map((value, index) => ({
      x: index * stepX,
      y: chartHeight - ((value - minValue) / range) * chartHeight,
      label: labels[index],
      value
    }));
  }

  /**
   * 生成完整的 SVG
   */
  generateSVG(datasets: LineChartDataset[], labels: string[]): string {
    const { width, height, padding, showGrid, showPoints } = this.options;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // 计算全局最大最小值
    const allValues = datasets.flatMap(d => d.points.map(p => p.value ?? 0));
    const maxValue = Math.max(...allValues, 1);
    const minValue = Math.min(...allValues, 0);
    const range = maxValue - minValue || 1;

    const lines: string[] = [
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`,
      `  <rect width="${width}" height="${height}" fill="#ffffff"/>`
    ];

    // 网格线
    if (showGrid) {
      const gridCount = 5;
      for (let i = 0; i <= gridCount; i++) {
        const y = padding.top + (chartHeight / gridCount) * i;
        const value = Math.round(maxValue - (range / gridCount) * i);
        lines.push(`  <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`);
        lines.push(`  <text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" font-size="12" fill="#6b7280">${value}</text>`);
      }
    }

    // 绘制每个数据集
    for (const dataset of datasets) {
      const mappedPoints = dataset.points.map((p, i) => {
        const stepX = chartWidth / Math.max(dataset.points.length - 1, 1);
        return {
          x: padding.left + i * stepX,
          y: padding.top + chartHeight - ((p.value ?? 0) - minValue) / range * chartHeight,
          label: p.label,
          value: p.value
        };
      });

      const color = dataset.color || '#3b82f6';
      const strokeWidth = dataset.width || 2;

      // 面积填充
      if (dataset.fill) {
        const areaPath = LineChartPathGenerator.generateAreaPath(
          mappedPoints,
          padding.top + chartHeight,
          dataset.smooth,
          this.options.curveTension
        );
        lines.push(`  <path d="${areaPath}" fill="${color}" opacity="${dataset.fillOpacity ?? 0.2}" stroke="none"/>`);
      }

      // 线条
      const pathData = dataset.smooth
        ? LineChartPathGenerator.generateSmoothPath(mappedPoints, this.options.curveTension)
        : LineChartPathGenerator.generateLinePath(mappedPoints);

      lines.push(`  <path d="${pathData}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`);

      // 数据点
      if (showPoints) {
        for (const point of mappedPoints) {
          lines.push(`  <circle cx="${point.x}" cy="${point.y}" r="4" fill="#ffffff" stroke="${color}" stroke-width="2"/>`);
        }
      }
    }

    // X 轴标签
    if (labels.length > 0) {
      const stepX = chartWidth / Math.max(labels.length - 1, 1);
      for (let i = 0; i < labels.length; i++) {
        const x = padding.left + i * stepX;
        const y = height - padding.bottom + 20;
        lines.push(`  <text x="${x}" y="${y}" text-anchor="middle" font-size="12" fill="#374151">${labels[i]}</text>`);
      }
    }

    lines.push('</svg>');
    return lines.join('\n');
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 折线图路径计算 ===\n');

  const points: LineChartPoint[] = [
    { x: 0, y: 100 },
    { x: 50, y: 60 },
    { x: 100, y: 80 },
    { x: 150, y: 40 },
    { x: 200, y: 90 }
  ];

  console.log('--- 直线 ---');
  console.log(LineChartPathGenerator.generateLinePath(points));

  console.log('\n--- 平滑曲线 ---');
  console.log(LineChartPathGenerator.generateSmoothPath(points, 0.3));

  console.log('\n--- 阶梯线 ---');
  console.log(LineChartPathGenerator.generateStepPath(points));

  console.log('\n--- 面积填充 ---');
  console.log(LineChartPathGenerator.generateAreaPath(points, 150, true, 0.3));
}
