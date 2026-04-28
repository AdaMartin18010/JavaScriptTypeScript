/**
 * @file 数据分箱（Binning）
 * @category Data Visualization → Binning
 * @difficulty medium
 * @tags data-viz, binning, histogram, data-aggregation
 *
 * @description
 * 数据分箱与直方图统计实现
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface Bin {
  x0: number;
  x1: number;
  count: number;
  values: number[];
}

export interface BinningOptions {
  min?: number;
  max?: number;
  thresholds?: number[];
  nice?: boolean;
}

// ============================================================================
// 分箱计算器
// ============================================================================

export class BinningCalculator {
  /**
   * 计算等宽分箱阈值
   */
  static equalWidthThresholds(data: number[], binCount: number): number[] {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const step = (max - min) / binCount;

    const thresholds: number[] = [];
    for (let i = 1; i < binCount; i++) {
      thresholds.push(min + step * i);
    }

    return thresholds;
  }

  /**
   * 计算等频分箱阈值（分位数）
   */
  static quantileThresholds(data: number[], binCount: number): number[] {
    const sorted = [...data].sort((a, b) => a - b);
    const thresholds: number[] = [];

    for (let i = 1; i < binCount; i++) {
      const index = (sorted.length * i) / binCount;
      const lower = sorted[Math.floor(index)];
      const upper = sorted[Math.ceil(index)];
      thresholds.push((lower + upper) / 2);
    }

    return thresholds;
  }

  /**
   * 计算 nice 分箱阈值（取整边界）
   */
  static niceThresholds(data: number[], binCount: number): number[] {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const roughStep = range / binCount;

    // 找到 nice step
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalized = roughStep / magnitude;

    let niceStep: number;
    if (normalized <= 1) niceStep = magnitude;
    else if (normalized <= 2) niceStep = 2 * magnitude;
    else if (normalized <= 5) niceStep = 5 * magnitude;
    else niceStep = 10 * magnitude;

    const niceMin = Math.floor(min / niceStep) * niceStep;
    const niceMax = Math.ceil(max / niceStep) * niceStep;

    const thresholds: number[] = [];
    for (let t = niceMin + niceStep; t < niceMax; t += niceStep) {
      thresholds.push(t);
    }

    return thresholds;
  }
}

// ============================================================================
// 直方图生成器
// ============================================================================

export class HistogramGenerator {
  /**
   * 生成直方图分箱
   */
  static generate(data: number[], thresholds: number[], options: { min?: number; max?: number } = {}): Bin[] {
    const min = options.min ?? Math.min(...data);
    const max = options.max ?? Math.max(...data);
    const allThresholds = [min, ...thresholds, max];

    const bins: Bin[] = [];

    for (let i = 0; i < allThresholds.length - 1; i++) {
      bins.push({
        x0: allThresholds[i],
        x1: allThresholds[i + 1],
        count: 0,
        values: []
      });
    }

    for (const value of data) {
      for (const bin of bins) {
        // 最后一个 bin 包含右边界
        if (value >= bin.x0 && (value < bin.x1 || (value === max && bin.x1 === max))) {
          bin.count++;
          bin.values.push(value);
          break;
        }
      }
    }

    return bins;
  }

  /**
   * 使用等宽分箱生成直方图
   */
  static equalWidth(data: number[], binCount: number): Bin[] {
    const thresholds = BinningCalculator.equalWidthThresholds(data, binCount);
    return this.generate(data, thresholds);
  }

  /**
   * 使用 nice 分箱生成直方图
   */
  static niceBins(data: number[], binCount: number): Bin[] {
    const thresholds = BinningCalculator.niceThresholds(data, binCount);
    return this.generate(data, thresholds);
  }
}

// ============================================================================
// 二维分箱（Hexbin / Grid）
// ============================================================================

export interface Point2D {
  x: number;
  y: number;
}

export interface GridBin {
  x: number;
  y: number;
  count: number;
  points: Point2D[];
}

export class GridBinning {
  /**
   * 二维网格分箱
   */
  static bin(points: Point2D[], cellSize: number, bounds?: { xMin: number; xMax: number; yMin: number; yMax: number }): GridBin[] {
    const xMin = bounds?.xMin ?? Math.min(...points.map(p => p.x));
    const xMax = bounds?.xMax ?? Math.max(...points.map(p => p.x));
    const yMin = bounds?.yMin ?? Math.min(...points.map(p => p.y));
    const yMax = bounds?.yMax ?? Math.max(...points.map(p => p.y));

    const bins = new Map<string, GridBin>();

    for (const point of points) {
      const gx = Math.floor((point.x - xMin) / cellSize);
      const gy = Math.floor((point.y - yMin) / cellSize);
      const key = `${gx},${gy}`;

      if (!bins.has(key)) {
        bins.set(key, {
          x: xMin + gx * cellSize,
          y: yMin + gy * cellSize,
          count: 0,
          points: []
        });
      }

      const bin = bins.get(key)!;
      bin.count++;
      bin.points.push(point);
    }

    return Array.from(bins.values());
  }

  /**
   * 获取密度最高的 bin
   */
  static densest(bins: GridBin[]): GridBin | null {
    if (bins.length === 0) return null;
    return bins.reduce((max, bin) => (bin.count > max.count ? bin : max));
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 数据分箱 ===\n');

  const data = [1, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5, 5, 6, 7, 8, 9, 10];

  console.log('--- 等宽分箱 ---');
  const equalWidth = HistogramGenerator.equalWidth(data, 5);
  equalWidth.forEach(bin => {
    console.log(`  [${bin.x0.toFixed(1)}, ${bin.x1.toFixed(1)}): ${bin.count} items`);
  });

  console.log('\n--- Nice 分箱 ---');
  const nice = HistogramGenerator.niceBins(data, 5);
  nice.forEach(bin => {
    console.log(`  [${bin.x0.toFixed(1)}, ${bin.x1.toFixed(1)}): ${bin.count} items`);
  });

  console.log('\n--- 二维网格分箱 ---');
  const points: Point2D[] = [
    { x: 1, y: 1 }, { x: 1.5, y: 1.2 }, { x: 2, y: 2 },
    { x: 5, y: 5 }, { x: 5.2, y: 5.1 }
  ];
  const gridBins = GridBinning.bin(points, 2);
  gridBins.forEach(bin => {
    console.log(`  Cell (${bin.x}, ${bin.y}): ${bin.count} points`);
  });
}
