/**
 * @file 视觉回归测试
 * @category AI Testing → Visual Regression
 * @difficulty medium
 * @tags ai-testing, visual-regression, screenshot-comparison, perceptual-diff, baseline
 *
 * @description
 * AI增强的视觉回归测试系统，支持像素级差异、感知差异检测和AI视觉异常识别。
 * 包含基线管理，支持自动批准和更新基线截图。
 *
 * 核心能力：
 * - 像素差异对比：逐像素RGBA比较
 * - 感知差异对比：基于结构相似性指数（SSIM简化版）
 * - AI视觉异常检测：模拟AI对布局错位、颜色偏移、文字截断的识别
 * - 基线管理：批准、更新、版本化基线
 */

/** 截图数据 */
export interface Screenshot {
  id: string;
  name: string;
  width: number;
  height: number;
  pixels: Uint8ClampedArray; // RGBA 序列
  timestamp: number;
}

/** 像素差异结果 */
export interface PixelDiffResult {
  diffCount: number;
  totalPixels: number;
  diffPercentage: number;
  diffMap: Uint8ClampedArray; // 红色高亮差异
  threshold: number;
  passed: boolean;
}

/** 感知差异结果 */
export interface PerceptualDiffResult {
  similarityScore: number; // 0-1，越高越相似
  passed: boolean;
  regions: DiffRegion[];
}

/** 差异区域 */
export interface DiffRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  severity: 'low' | 'medium' | 'high';
  type: 'pixel' | 'structural' | 'layout';
}

/** 视觉异常 */
export interface VisualAnomaly {
  type: 'layout-shift' | 'color-drift' | 'text-clipping' | 'missing-element' | 'size-change';
  confidence: number; // 0-1
  region: DiffRegion;
  description: string;
}

/** 基线记录 */
export interface Baseline {
  id: string;
  name: string;
  screenshot: Screenshot;
  approvedBy: string;
  approvedAt: number;
  version: number;
}

// ==================== 像素对比器 ====================

export class PixelComparator {
  /**
   * 逐像素对比两个截图
   */
  compare(baseline: Screenshot, current: Screenshot, threshold = 0): PixelDiffResult {
    if (baseline.width !== current.width || baseline.height !== current.height) {
      return this.createSizeMismatchResult(baseline, current);
    }

    const totalPixels = baseline.width * baseline.height;
    const diffMap = new Uint8ClampedArray(baseline.pixels.length);
    let diffCount = 0;

    for (let i = 0; i < baseline.pixels.length; i += 4) {
      const rDiff = Math.abs(baseline.pixels[i] - current.pixels[i]);
      const gDiff = Math.abs(baseline.pixels[i + 1] - current.pixels[i + 1]);
      const bDiff = Math.abs(baseline.pixels[i + 2] - current.pixels[i + 2]);
      const aDiff = Math.abs(baseline.pixels[i + 3] - current.pixels[i + 3]);

      const maxDiff = Math.max(rDiff, gDiff, bDiff, aDiff);

      if (maxDiff > threshold) {
        diffCount++;
        diffMap[i] = 255;
        diffMap[i + 1] = 0;
        diffMap[i + 2] = 0;
        diffMap[i + 3] = 255;
      } else {
        diffMap[i] = baseline.pixels[i];
        diffMap[i + 1] = baseline.pixels[i + 1];
        diffMap[i + 2] = baseline.pixels[i + 2];
        diffMap[i + 3] = Math.floor(baseline.pixels[i + 3] * 0.5);
      }
    }

    const diffPercentage = totalPixels > 0 ? diffCount / totalPixels : 0;

    return {
      diffCount,
      totalPixels,
      diffPercentage,
      diffMap,
      threshold,
      passed: diffPercentage < 0.001 // 0.1% 容差
    };
  }

  private createSizeMismatchResult(baseline: Screenshot, current: Screenshot): PixelDiffResult {
    const maxW = Math.max(baseline.width, current.width);
    const maxH = Math.max(baseline.height, current.height);
    const totalPixels = maxW * maxH;

    return {
      diffCount: totalPixels,
      totalPixels,
      diffPercentage: 1,
      diffMap: new Uint8ClampedArray(maxW * maxH * 4).fill(255),
      threshold: 0,
      passed: false
    };
  }
}

// ==================== 感知对比器 ====================

export class PerceptualComparator {
  private pixelComparator = new PixelComparator();

  /**
   * 基于简化SSIM的感知差异检测
   */
  compare(baseline: Screenshot, current: Screenshot): PerceptualDiffResult {
    const pixelResult = this.pixelComparator.compare(baseline, current, 5);

    if (!pixelResult.passed && pixelResult.diffPercentage > 0.05) {
      return {
        similarityScore: 1 - pixelResult.diffPercentage,
        passed: false,
        regions: this.detectRegions(pixelResult, baseline.width)
      };
    }

    // 计算简化SSIM分数（窗口均值差异）
    const ssimScore = this.calculateSimplifiedSSIM(baseline, current);

    return {
      similarityScore: ssimScore,
      passed: ssimScore > 0.95,
      regions: ssimScore > 0.95 ? [] : this.detectRegions(pixelResult, baseline.width)
    };
  }

  private calculateSimplifiedSSIM(a: Screenshot, b: Screenshot): number {
    if (a.width !== b.width || a.height !== b.height) return 0;

    const windowSize = 8;
    let totalScore = 0;
    let windowCount = 0;

    for (let y = 0; y < a.height - windowSize; y += windowSize) {
      for (let x = 0; x < a.width - windowSize; x += windowSize) {
        const score = this.windowSSIM(a, b, x, y, windowSize);
        totalScore += score;
        windowCount++;
      }
    }

    return windowCount > 0 ? totalScore / windowCount : 1;
  }

  private windowSSIM(a: Screenshot, b: Screenshot, startX: number, startY: number, size: number): number {
    let sumA = 0, sumB = 0, sumAB = 0, sumA2 = 0, sumB2 = 0;
    const n = size * size;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = ((startY + y) * a.width + (startX + x)) * 4;
        const va = (a.pixels[idx] + a.pixels[idx + 1] + a.pixels[idx + 2]) / 3;
        const vb = (b.pixels[idx] + b.pixels[idx + 1] + b.pixels[idx + 2]) / 3;

        sumA += va;
        sumB += vb;
        sumAB += va * vb;
        sumA2 += va * va;
        sumB2 += vb * vb;
      }
    }

    const meanA = sumA / n;
    const meanB = sumB / n;
    const covar = sumAB / n - meanA * meanB;
    const varA = sumA2 / n - meanA * meanA;
    const varB = sumB2 / n - meanB * meanB;

    const c1 = 6.5025;
    const c2 = 58.5225;

    const numerator = (2 * meanA * meanB + c1) * (2 * covar + c2);
    const denominator = (meanA * meanA + meanB * meanB + c1) * (varA + varB + c2);

    return denominator === 0 ? 1 : numerator / denominator;
  }

  private detectRegions(pixelResult: PixelDiffResult, width: number): DiffRegion[] {
    if (pixelResult.diffCount === 0) return [];

    // 简化为一个整体差异区域
    return [{
      x: 0,
      y: 0,
      width,
      height: pixelResult.totalPixels / width,
      severity: pixelResult.diffPercentage > 0.1 ? 'high' : pixelResult.diffPercentage > 0.01 ? 'medium' : 'low',
      type: 'structural'
    }];
  }
}

// ==================== AI视觉异常检测器 ====================

export class VisualAnomalyDetector {
  /**
   * 模拟AI驱动的视觉异常检测
   * 分析差异区域并分类异常类型
   */
  detectAnomalies(
    baseline: Screenshot,
    current: Screenshot,
    regions: DiffRegion[]
  ): VisualAnomaly[] {
    const anomalies: VisualAnomaly[] = [];

    for (const region of regions) {
      const anomalyType = this.classifyRegion(baseline, current, region);
      const confidence = this.computeConfidence(region, anomalyType);

      anomalies.push({
        type: anomalyType,
        confidence,
        region,
        description: this.describeAnomaly(anomalyType, region)
      });
    }

    return anomalies.sort((a, b) => b.confidence - a.confidence);
  }

  private classifyRegion(baseline: Screenshot, current: Screenshot, region: DiffRegion): VisualAnomaly['type'] {
    const baselineMean = this.regionMeanColor(baseline, region);
    const currentMean = this.regionMeanColor(current, region);

    const colorShift = Math.abs(baselineMean.r - currentMean.r)
      + Math.abs(baselineMean.g - currentMean.g)
      + Math.abs(baselineMean.b - currentMean.b);

    if (colorShift > 100) return 'color-drift';
    if (region.width < 10 || region.height < 10) return 'text-clipping';
    if (Math.abs(baselineMean.count - currentMean.count) > 0.3) return 'missing-element';
    if (Math.abs(region.width - region.height) > 50) return 'layout-shift';

    return 'size-change';
  }

  private regionMeanColor(screenshot: Screenshot, region: DiffRegion): { r: number; g: number; b: number; count: number } {
    let r = 0, g = 0, b = 0, count = 0;
    const xEnd = Math.min(region.x + region.width, screenshot.width);
    const yEnd = Math.min(region.y + region.height, screenshot.height);

    for (let y = region.y; y < yEnd; y++) {
      for (let x = region.x; x < xEnd; x++) {
        const idx = (y * screenshot.width + x) * 4;
        r += screenshot.pixels[idx];
        g += screenshot.pixels[idx + 1];
        b += screenshot.pixels[idx + 2];
        count++;
      }
    }

    return count > 0
      ? { r: r / count, g: g / count, b: b / count, count: count / (region.width * region.height) }
      : { r: 0, g: 0, b: 0, count: 0 };
  }

  private computeConfidence(region: DiffRegion, type: VisualAnomaly['type']): number {
    const base = Math.min(region.width * region.height / 10000, 1);
    const typeWeight: Record<VisualAnomaly['type'], number> = {
      'layout-shift': 0.9,
      'color-drift': 0.85,
      'text-clipping': 0.8,
      'missing-element': 0.95,
      'size-change': 0.75
    };
    return Math.min(base * typeWeight[type] + 0.5, 0.99);
  }

  private describeAnomaly(type: VisualAnomaly['type'], region: DiffRegion): string {
    const descs: Record<VisualAnomaly['type'], string> = {
      'layout-shift': `布局偏移 detected at (${region.x},${region.y})`,
      'color-drift': `颜色漂移 detected at (${region.x},${region.y})`,
      'text-clipping': `文字截断 detected at (${region.x},${region.y})`,
      'missing-element': `元素缺失 detected at (${region.x},${region.y})`,
      'size-change': `尺寸变化 detected at (${region.x},${region.y})`
    };
    return descs[type];
  }
}

// ==================== 基线管理器 ====================

export class BaselineManager {
  private baselines = new Map<string, Baseline>();

  /**
   * 注册或更新基线
   */
  updateBaseline(name: string, screenshot: Screenshot, approvedBy = 'system'): Baseline {
    const existing = this.baselines.get(name);
    const baseline: Baseline = {
      id: existing ? existing.id : `bl-${Date.now()}`,
      name,
      screenshot,
      approvedBy,
      approvedAt: Date.now(),
      version: existing ? existing.version + 1 : 1
    };

    this.baselines.set(name, baseline);
    return baseline;
  }

  /**
   * 批准当前截图为基线
   */
  approve(name: string, screenshot: Screenshot, approver: string): Baseline {
    return this.updateBaseline(name, screenshot, approver);
  }

  /**
   * 获取基线
   */
  getBaseline(name: string): Baseline | undefined {
    return this.baselines.get(name);
  }

  /**
   * 删除基线
   */
  removeBaseline(name: string): boolean {
    return this.baselines.delete(name);
  }

  /**
   * 列出所有基线
   */
  listBaselines(): Baseline[] {
    return Array.from(this.baselines.values());
  }

  /**
   * 检查是否存在基线
   */
  hasBaseline(name: string): boolean {
    return this.baselines.has(name);
  }
}

// ==================== 视觉回归测试器 ====================

export interface VisualRegressionResult {
  name: string;
  pixelDiff: PixelDiffResult;
  perceptualDiff: PerceptualDiffResult;
  anomalies: VisualAnomaly[];
  baselineVersion?: number;
  passed: boolean;
}

export class VisualRegressionTester {
  private pixelComparator = new PixelComparator();
  private perceptualComparator = new PerceptualComparator();
  private anomalyDetector = new VisualAnomalyDetector();
  private baselineManager = new BaselineManager();

  get baselines(): BaselineManager {
    return this.baselineManager;
  }

  /**
   * 执行视觉回归测试
   */
  test(name: string, current: Screenshot): VisualRegressionResult {
    const baseline = this.baselineManager.getBaseline(name);

    if (!baseline) {
      // 无基线时自动创建
      this.baselineManager.approve(name, current, 'auto');
      return {
        name,
        pixelDiff: {
          diffCount: 0,
          totalPixels: current.width * current.height,
          diffPercentage: 0,
          diffMap: current.pixels,
          threshold: 0,
          passed: true
        },
        perceptualDiff: {
          similarityScore: 1,
          passed: true,
          regions: []
        },
        anomalies: [],
        passed: true
      };
    }

    const pixelDiff = this.pixelComparator.compare(baseline.screenshot, current);
    const perceptualDiff = this.perceptualComparator.compare(baseline.screenshot, current);
    const anomalies = this.anomalyDetector.detectAnomalies(baseline.screenshot, current, perceptualDiff.regions);

    const passed = pixelDiff.passed && perceptualDiff.passed && anomalies.every(a => a.confidence < 0.9);

    return {
      name,
      pixelDiff,
      perceptualDiff,
      anomalies,
      baselineVersion: baseline.version,
      passed
    };
  }

  /**
   * 批量测试
   */
  testBatch(screenshots: { name: string; screenshot: Screenshot }[]): VisualRegressionResult[] {
    return screenshots.map(s => this.test(s.name, s.screenshot));
  }
}

// ==================== 工具函数 ====================

export function createScreenshot(
  name: string,
  width: number,
  height: number,
  fillColor: [number, number, number, number]
): Screenshot {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = fillColor[0];
    pixels[i + 1] = fillColor[1];
    pixels[i + 2] = fillColor[2];
    pixels[i + 3] = fillColor[3];
  }

  return {
    id: `ss-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    width,
    height,
    pixels,
    timestamp: Date.now()
  };
}

// ==================== 演示 ====================

export async function demo(): Promise<void> {
  console.log('=== 视觉回归测试 ===\n');

  const tester = new VisualRegressionTester();

  // 创建基线截图：蓝色方块
  const baseline = createScreenshot('button', 100, 50, [0, 120, 255, 255]);
  console.log('创建基线截图:', baseline.name, `${baseline.width}x${baseline.height}`);

  // 第一次测试（自动批准为基线）
  const r1 = tester.test('button', baseline);
  console.log(`首次测试: ${r1.passed ? '通过' : '失败'} (自动创建基线)`);

  // 创建差异截图：红色方块
  const current = createScreenshot('button', 100, 50, [255, 60, 60, 255]);
  const r2 = tester.test('button', current);
  console.log(`\n差异测试:`);
  console.log(`  像素差异: ${(r2.pixelDiff.diffPercentage * 100).toFixed(2)}%`);
  console.log(`  感知相似度: ${(r2.perceptualDiff.similarityScore * 100).toFixed(2)}%`);
  console.log(`  AI异常数: ${r2.anomalies.length}`);
  for (const a of r2.anomalies) {
    console.log(`    [${a.type}] 置信度: ${(a.confidence * 100).toFixed(1)}% — ${a.description}`);
  }
  console.log(`  结果: ${r2.passed ? '通过' : '失败'}`);

  // 基线管理
  console.log('\n--- 基线管理 ---');
  const bl = tester.baselines.getBaseline('button');
  console.log(`基线版本: v${bl?.version}, 批准人: ${bl?.approvedBy}`);

  tester.baselines.approve('button', current, 'manual-approval');
  const bl2 = tester.baselines.getBaseline('button');
  console.log(`更新后版本: v${bl2?.version}, 批准人: ${bl2?.approvedBy}`);

  // 再次测试应与最新基线一致
  const r3 = tester.test('button', current);
  console.log(`更新基线后测试: ${r3.passed ? '通过' : '失败'}`);
}
