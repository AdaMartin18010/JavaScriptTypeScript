/**
 * @file 比例尺（Scale）实现
 * @category Data Visualization → Scales
 * @difficulty medium
 * @tags data-viz, scale, d3-scale, linear, ordinal, band
 *
 * @description
 * 数据可视化中的比例尺实现：线性、序数、带状、时间等
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface ScaleDomainRange {
  domain: [number, number];
  range: [number, number];
}

export interface ScaleOptions {
  clamp?: boolean;
  nice?: boolean;
  round?: boolean;
}

// ============================================================================
// 线性比例尺
// ============================================================================

export class LinearScale {
  private domainMin: number;
  private domainMax: number;
  private rangeMin: number;
  private rangeMax: number;
  private clamp: boolean;

  constructor(domain: [number, number], range: [number, number], options: ScaleOptions = {}) {
    this.domainMin = domain[0];
    this.domainMax = domain[1];
    this.rangeMin = range[0];
    this.rangeMax = range[1];
    this.clamp = options.clamp ?? false;
  }

  /**
   * 将定义域值映射到值域
   */
  scale(value: number): number {
    const t = (value - this.domainMin) / (this.domainMax - this.domainMin);
    const result = this.rangeMin + t * (this.rangeMax - this.rangeMin);

    if (this.clamp) {
      const min = Math.min(this.rangeMin, this.rangeMax);
      const max = Math.max(this.rangeMin, this.rangeMax);
      return Math.max(min, Math.min(max, result));
    }

    return result;
  }

  /**
   * 逆向映射（值域 -> 定义域）
   */
  invert(value: number): number {
    const t = (value - this.rangeMin) / (this.rangeMax - this.rangeMin);
    return this.domainMin + t * (this.domainMax - this.domainMin);
  }

  /**
   * 获取刻度值
   */
  ticks(count = 5): number[] {
    const step = (this.domainMax - this.domainMin) / count;
    const ticks: number[] = [];

    for (let i = 0; i <= count; i++) {
      ticks.push(this.domainMin + step * i);
    }

    return ticks;
  }

  /**
   * 设置定义域
   */
  setDomain(domain: [number, number]): this {
    this.domainMin = domain[0];
    this.domainMax = domain[1];
    return this;
  }

  /**
   * 设置值域
   */
  setRange(range: [number, number]): this {
    this.rangeMin = range[0];
    this.rangeMax = range[1];
    return this;
  }

  /**
   * 获取定义域
   */
  getDomain(): [number, number] {
    return [this.domainMin, this.domainMax];
  }

  /**
   * 获取值域
   */
  getRange(): [number, number] {
    return [this.rangeMin, this.rangeMax];
  }
}

// ============================================================================
// 序数比例尺
// ============================================================================

export class OrdinalScale<T = string, R = string> {
  private mapping = new Map<T, R>();
  private fallback: R | undefined;

  constructor(domain?: T[], range?: R[]) {
    if (domain && range) {
      this.setDomainRange(domain, range);
    }
  }

  /**
   * 设置映射关系
   */
  setDomainRange(domain: T[], range: R[]): this {
    this.mapping.clear();

    for (let i = 0; i < domain.length; i++) {
      this.mapping.set(domain[i], range[i % range.length]);
    }

    return this;
  }

  /**
   * 设置回退值
   */
  setFallback(value: R): this {
    this.fallback = value;
    return this;
  }

  /**
   * 映射值
   */
  scale(value: T): R | undefined {
    return this.mapping.get(value) ?? this.fallback;
  }

  /**
   * 获取所有定义域值
   */
  domain(): T[] {
    return Array.from(this.mapping.keys());
  }

  /**
   * 获取所有值域值（去重）
   */
  range(): R[] {
    return Array.from(new Set(this.mapping.values()));
  }
}

// ============================================================================
// 带状比例尺（用于柱状图 X 轴）
// ============================================================================

export class BandScale {
  private domain: string[];
  private rangeMin: number;
  private rangeMax: number;
  private paddingInner: number;
  private paddingOuter: number;

  constructor(domain: string[], range: [number, number], options: { paddingInner?: number; paddingOuter?: number } = {}) {
    this.domain = [...domain];
    this.rangeMin = range[0];
    this.rangeMax = range[1];
    this.paddingInner = options.paddingInner ?? 0.1;
    this.paddingOuter = options.paddingOuter ?? 0.1;
  }

  /**
   * 获取指定类别的起始位置
   */
  scale(value: string): number {
    const index = this.domain.indexOf(value);
    if (index === -1) return this.rangeMin;

    const step = this.step();
    return this.rangeMin + this.paddingOuter * step + index * step;
  }

  /**
   * 获取每个 band 的宽度
   */
  bandwidth(): number {
    const n = this.domain.length;
    if (n === 0) return 0;

    const totalRange = this.rangeMax - this.rangeMin;
    const step = totalRange / (n + this.paddingOuter * 2 - this.paddingInner);
    return step * (1 - this.paddingInner);
  }

  /**
   * 获取步长（band + padding）
   */
  step(): number {
    const n = this.domain.length;
    if (n === 0) return 0;

    const totalRange = this.rangeMax - this.rangeMin;
    return totalRange / (n + this.paddingOuter * 2 - this.paddingInner);
  }

  /**
   * 获取所有刻度位置
   */
  ticks(): number[] {
    return this.domain.map(d => this.scale(d) + this.bandwidth() / 2);
  }

  /**
   * 获取定义域
   */
  getDomain(): string[] {
    return [...this.domain];
  }
}

// ============================================================================
// 阈值比例尺
// ============================================================================

export class ThresholdScale<T = string> {
  private thresholds: number[];
  private outputs: T[];

  constructor(thresholds: number[], outputs: T[]) {
    if (thresholds.length + 1 !== outputs.length) {
      throw new Error('Thresholds length must be outputs length - 1');
    }
    this.thresholds = [...thresholds];
    this.outputs = [...outputs];
  }

  /**
   * 映射值
   */
  scale(value: number): T {
    for (let i = 0; i < this.thresholds.length; i++) {
      if (value < this.thresholds[i]) {
        return this.outputs[i];
      }
    }
    return this.outputs[this.outputs.length - 1];
  }

  /**
   * 获取阈值
   */
  getThresholds(): number[] {
    return [...this.thresholds];
  }

  /**
   * 获取输出值
   */
  getOutputs(): T[] {
    return [...this.outputs];
  }
}

// ============================================================================
// 对数比例尺
// ============================================================================

export class LogScale {
  private domainMin: number;
  private domainMax: number;
  private rangeMin: number;
  private rangeMax: number;
  private base: number;

  constructor(domain: [number, number], range: [number, number], base = 10) {
    if (domain[0] <= 0 || domain[1] <= 0) {
      throw new Error('Log scale domain must be positive');
    }
    this.domainMin = domain[0];
    this.domainMax = domain[1];
    this.rangeMin = range[0];
    this.rangeMax = range[1];
    this.base = base;
  }

  /**
   * 映射值
   */
  scale(value: number): number {
    if (value <= 0) return this.rangeMin;

    const logMin = Math.log(this.domainMin) / Math.log(this.base);
    const logMax = Math.log(this.domainMax) / Math.log(this.base);
    const logValue = Math.log(value) / Math.log(this.base);

    const t = (logValue - logMin) / (logMax - logMin);
    return this.rangeMin + t * (this.rangeMax - this.rangeMin);
  }

  /**
   * 逆向映射
   */
  invert(value: number): number {
    const t = (value - this.rangeMin) / (this.rangeMax - this.rangeMin);
    const logMin = Math.log(this.domainMin) / Math.log(this.base);
    const logMax = Math.log(this.domainMax) / Math.log(this.base);
    const logValue = logMin + t * (logMax - logMin);

    return Math.pow(this.base, logValue);
  }

  /**
   * 获取刻度值
   */
  ticks(count = 5): number[] {
    const ticks: number[] = [];
    const logMin = Math.log(this.domainMin) / Math.log(this.base);
    const logMax = Math.log(this.domainMax) / Math.log(this.base);
    const step = (logMax - logMin) / count;

    for (let i = 0; i <= count; i++) {
      ticks.push(Math.pow(this.base, logMin + step * i));
    }

    return ticks;
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 比例尺实现 ===\n');

  // 线性比例尺
  console.log('--- 线性比例尺 ---');
  const linear = new LinearScale([0, 100], [0, 500]);
  console.log('  50 ->', linear.scale(50));
  console.log('  ticks:', linear.ticks(4));

  // 序数比例尺
  console.log('\n--- 序数比例尺 ---');
  const ordinal = new OrdinalScale(['A', 'B', 'C'], ['red', 'green', 'blue']);
  console.log('  A ->', ordinal.scale('A'));
  console.log('  B ->', ordinal.scale('B'));

  // 带状比例尺
  console.log('\n--- 带状比例尺 ---');
  const band = new BandScale(['Q1', 'Q2', 'Q3', 'Q4'], [0, 400]);
  console.log('  Q1 start:', band.scale('Q1'));
  console.log('  bandwidth:', band.bandwidth());
  console.log('  step:', band.step());

  // 阈值比例尺
  console.log('\n--- 阈值比例尺 ---');
  const threshold = new ThresholdScale([0, 50, 100], ['low', 'medium', 'high', 'extreme']);
  console.log('  25 ->', threshold.scale(25));
  console.log('  75 ->', threshold.scale(75));
  console.log('  150 ->', threshold.scale(150));

  // 对数比例尺
  console.log('\n--- 对数比例尺 ---');
  const log = new LogScale([1, 1000], [0, 300]);
  console.log('  10 ->', log.scale(10));
  console.log('  100 ->', log.scale(100));
  console.log('  ticks:', log.ticks(3));
}
