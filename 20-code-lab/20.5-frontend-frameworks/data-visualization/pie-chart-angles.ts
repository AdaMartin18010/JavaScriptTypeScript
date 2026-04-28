/**
 * @file 饼图角度计算
 * @category Data Visualization → Pie Chart
 * @difficulty medium
 * @tags data-viz, pie-chart, donut-chart, angles, polar-coordinates
 *
 * @description
 * 饼图/环形图/极坐标图的角度、扇区与坐标计算
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface PieSlice {
  label: string;
  value: number;
  color?: string;
}

export interface RenderedSlice {
  label: string;
  value: number;
  percentage: number;
  startAngle: number;
  endAngle: number;
  midAngle: number;
  color: string;
}

export interface PieChartOptions {
  radius: number;
  innerRadius?: number;
  startAngle?: number;
  padAngle?: number;
  cornerRadius?: number;
}

// ============================================================================
// 角度计算
// ============================================================================

export class PieChartAngleCalculator {
  /**
   * 将角度（度）转换为弧度
   */
  static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * 将弧度转换为角度（度）
   */
  static toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  /**
   * 计算饼图各扇区
   */
  static calculateSlices(
    data: PieSlice[],
    options: PieChartOptions = { radius: 100 }
  ): RenderedSlice[] {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return [];

    const { radius, innerRadius = 0, startAngle = 0, padAngle = 0 } = options;
    const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

    const availableAngle = 360 - data.length * padAngle;
    let currentAngle = startAngle;

    return data.map((slice, index) => {
      const percentage = slice.value / total;
      const sliceAngle = availableAngle * percentage;

      const start = currentAngle;
      const end = currentAngle + sliceAngle;
      const mid = start + sliceAngle / 2;

      currentAngle = end + padAngle;

      return {
        label: slice.label,
        value: slice.value,
        percentage: Math.round(percentage * 1000) / 1000,
        startAngle: start,
        endAngle: end,
        midAngle: mid,
        color: slice.color || palette[index % palette.length]
      };
    });
  }

  /**
   * 极坐标转笛卡尔坐标
   */
  static polarToCartesian(centerX: number, centerY: number, radius: number, angleDegrees: number): {
    x: number;
    y: number;
  } {
    const radians = this.toRadians(angleDegrees);
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians)
    };
  }

  /**
   * 生成 SVG 扇区路径
   */
  static generateSlicePath(
    centerX: number,
    centerY: number,
    radius: number,
    innerRadius: number,
    startAngle: number,
    endAngle: number
  ): string {
    const startOuter = this.polarToCartesian(centerX, centerY, radius, startAngle);
    const endOuter = this.polarToCartesian(centerX, centerY, radius, endAngle);
    const startInner = this.polarToCartesian(centerX, centerY, innerRadius, startAngle);
    const endInner = this.polarToCartesian(centerX, centerY, innerRadius, endAngle);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    if (innerRadius === 0) {
      // 实心饼图
      return [
        `M ${centerX} ${centerY}`,
        `L ${startOuter.x} ${startOuter.y}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
        'Z'
      ].join(' ');
    }

    // 环形图
    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
      `L ${endInner.x} ${endInner.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}`,
      'Z'
    ].join(' ');
  }

  /**
   * 计算标签位置
   */
  static calculateLabelPosition(
    centerX: number,
    centerY: number,
    radius: number,
    midAngle: number,
    labelRadiusOffset = 1.2
  ): { x: number; y: number; anchor: string } {
    const pos = this.polarToCartesian(centerX, centerY, radius * labelRadiusOffset, midAngle);
    const anchor = midAngle > 180 ? 'end' : midAngle > 90 && midAngle < 270 ? 'end' : 'start';
    // 简化：右侧 start，左侧 end
    const simplifiedAnchor = midAngle > 90 && midAngle < 270 ? 'end' : 'start';

    return {
      x: pos.x,
      y: pos.y,
      anchor: simplifiedAnchor
    };
  }
}

// ============================================================================
// SVG 生成器
// ============================================================================

export class PieChartSVGGenerator {
  /**
   * 生成完整饼图 SVG
   */
  static generate(
    data: PieSlice[],
    options: PieChartOptions & { width?: number; height?: number; showLabels?: boolean } = {}
  ): string {
    const {
      radius = 100,
      innerRadius = 0,
      width = radius * 2 + 100,
      height = radius * 2 + 100,
      showLabels = true
    } = options;

    const centerX = width / 2;
    const centerY = height / 2;
    const slices = PieChartAngleCalculator.calculateSlices(data, { radius, innerRadius });

    const lines: string[] = [
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`,
      `  <rect width="${width}" height="${height}" fill="#ffffff"/>`
    ];

    for (const slice of slices) {
      const path = PieChartAngleCalculator.generateSlicePath(
        centerX, centerY, radius, innerRadius,
        slice.startAngle - 90, // 从 12 点钟方向开始
        slice.endAngle - 90
      );

      lines.push(`  <path d="${path}" fill="${slice.color}" stroke="#ffffff" stroke-width="2"/>`);

      if (showLabels && slice.percentage > 0.05) {
        const labelPos = PieChartAngleCalculator.calculateLabelPosition(
          centerX, centerY, radius, slice.midAngle - 90
        );
        lines.push(`  <text x="${labelPos.x}" y="${labelPos.y}" text-anchor="${labelPos.anchor}" font-size="12" fill="#374151">${slice.label} ${Math.round(slice.percentage * 100)}%</text>`);
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
  console.log('=== 饼图角度计算 ===\n');

  const data: PieSlice[] = [
    { label: 'A', value: 30, color: '#3b82f6' },
    { label: 'B', value: 50, color: '#10b981' },
    { label: 'C', value: 20, color: '#f59e0b' }
  ];

  console.log('--- 扇区计算 ---');
  const slices = PieChartAngleCalculator.calculateSlices(data, { radius: 100 });
  slices.forEach(s => {
    console.log(`  ${s.label}: ${s.value} (${Math.round(s.percentage * 100)}%), angles: ${s.startAngle.toFixed(1)}° - ${s.endAngle.toFixed(1)}°`);
  });

  console.log('\n--- 极坐标转换 ---');
  const pos = PieChartAngleCalculator.polarToCartesian(100, 100, 80, 0);
  console.log(`  0° -> (${pos.x}, ${pos.y})`);

  console.log('\n--- SVG 路径 ---');
  const path = PieChartAngleCalculator.generateSlicePath(100, 100, 80, 0, 0, 90);
  console.log(' ', path);

  console.log('\n--- 完整饼图 SVG ---');
  console.log(PieChartSVGGenerator.generate(data, { radius: 80, showLabels: true }).substring(0, 300));
}
