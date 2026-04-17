/**
 * @file 图表动画插值
 * @category Data Visualization → Animation
 * @difficulty medium
 * @tags data-viz, animation, interpolation, easing, tween
 *
 * @description
 * 数据可视化动画系统：缓动函数、数值插值、路径变形动画
 */

// ============================================================================
// 类型定义
// ============================================================================

export type EasingFunction = (t: number) => number;

export interface AnimationFrame {
  progress: number;
  value: number;
}

export interface Keyframe<T> {
  time: number;
  value: T;
}

// ============================================================================
// 缓动函数
// ============================================================================

export class Easing {
  static linear(t: number): number {
    return t;
  }

  static easeInQuad(t: number): number {
    return t * t;
  }

  static easeOutQuad(t: number): number {
    return 1 - (1 - t) * (1 - t);
  }

  static easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  static easeInCubic(t: number): number {
    return t * t * t;
  }

  static easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  static easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  static easeOutElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }

  static easeOutBounce(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
}

// ============================================================================
// 数值插值器
// ============================================================================

export class Interpolator {
  /**
   * 线性插值
   */
  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * 颜色插值（RGB）
   */
  static lerpColor(from: string, to: string, t: number): string {
    const parse = (hex: string): [number, number, number] => {
      const c = hex.replace('#', '');
      if (c.length === 3) {
        return [
          parseInt(c[0] + c[0], 16),
          parseInt(c[1] + c[1], 16),
          parseInt(c[2] + c[2], 16)
        ];
      }
      return [
        parseInt(c.slice(0, 2), 16),
        parseInt(c.slice(2, 4), 16),
        parseInt(c.slice(4, 6), 16)
      ];
    };

    const fromRGB = parse(from);
    const toRGB = parse(to);

    const r = Math.round(this.lerp(fromRGB[0], toRGB[0], t));
    const g = Math.round(this.lerp(fromRGB[1], toRGB[1], t));
    const b = Math.round(this.lerp(fromRGB[2], toRGB[2], t));

    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * 数组插值（每个元素分别插值）
   */
  static lerpArray(a: number[], b: number[], t: number): number[] {
    const length = Math.min(a.length, b.length);
    return Array.from({ length }, (_, i) => this.lerp(a[i], b[i], t));
  }

  /**
   * 对象数值插值
   */
  static lerpObject<T extends Record<string, number>>(
    from: T,
    to: T,
    t: number
  ): T {
    const result = {} as Record<string, number>;

    for (const key of Object.keys(from)) {
      if (key in to) {
        result[key] = this.lerp(from[key], to[key], t);
      }
    }

    return result as T;
  }
}

// ============================================================================
// 动画控制器
// ============================================================================

export interface AnimationConfig {
  duration: number;
  easing?: EasingFunction;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}

export class AnimationController {
  private startTime: number | null = null;
  private animationId: number | null = null;
  private config: AnimationConfig;

  constructor(config: AnimationConfig) {
    this.config = {
      easing: Easing.easeOutCubic,
      ...config
    };
  }

  /**
   * 启动动画
   */
  start(): void {
    if (this.animationId !== null) return;

    this.startTime = performance.now();
    this.tick = this.tick.bind(this);
    this.animationId = requestAnimationFrame(this.tick);
  }

  /**
   * 停止动画
   */
  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      this.startTime = null;
    }
  }

  /**
   * 生成预计算的关键帧
   */
  static generateKeyframes(duration: number, fps = 60, easing: EasingFunction = Easing.linear): AnimationFrame[] {
    const frames: AnimationFrame[] = [];
    const frameCount = Math.ceil((duration / 1000) * fps);

    for (let i = 0; i <= frameCount; i++) {
      const progress = i / frameCount;
      frames.push({
        progress,
        value: easing(progress)
      });
    }

    return frames;
  }

  private tick(now: number): void {
    if (this.startTime === null) return;

    const elapsed = now - this.startTime;
    const progress = Math.min(elapsed / this.config.duration, 1);
    const easedProgress = this.config.easing!(progress);

    this.config.onUpdate?.(easedProgress);

    if (progress < 1) {
      this.animationId = requestAnimationFrame(this.tick);
    } else {
      this.animationId = null;
      this.config.onComplete?.();
    }
  }
}

// ============================================================================
// 图表数据动画
// ============================================================================

export class ChartDataAnimator {
  /**
   * 生成柱状图高度动画的关键帧数据
   */
  static animateBarHeights(
    from: number[],
    to: number[],
    progress: number,
    easing: EasingFunction = Easing.easeOutCubic
  ): number[] {
    const t = easing(progress);
    return Interpolator.lerpArray(from, to, t);
  }

  /**
   * 生成饼图角度动画的关键帧数据
   */
  static animatePieSlices(
    fromAngles: Array<{ start: number; end: number }>,
    toAngles: Array<{ start: number; end: number }>,
    progress: number,
    easing: EasingFunction = Easing.easeOutCubic
  ): Array<{ start: number; end: number }> {
    const t = easing(progress);
    return fromAngles.map((from, i) => ({
      start: Interpolator.lerp(from.start, toAngles[i].start, t),
      end: Interpolator.lerp(from.end, toAngles[i].end, t)
    }));
  }

  /**
   * 生成数值计数动画
   */
  static countUp(from: number, to: number, progress: number, easing: EasingFunction = Easing.easeOutCubic): number {
    const t = easing(progress);
    return Interpolator.lerp(from, to, t);
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 图表动画插值 ===\n');

  // 缓动函数对比
  console.log('--- Easing Functions at t=0.5 ---');
  console.log('  linear:', Easing.linear(0.5).toFixed(3));
  console.log('  easeInQuad:', Easing.easeInQuad(0.5).toFixed(3));
  console.log('  easeOutQuad:', Easing.easeOutQuad(0.5).toFixed(3));
  console.log('  easeInOutCubic:', Easing.easeInOutCubic(0.5).toFixed(3));
  console.log('  easeOutBounce:', Easing.easeOutBounce(0.5).toFixed(3));

  // 数值插值
  console.log('\n--- Interpolation ---');
  console.log('  lerp(0, 100, 0.5):', Interpolator.lerp(0, 100, 0.5));
  console.log('  lerpColor(#ff0000, #0000ff, 0.5):', Interpolator.lerpColor('#ff0000', '#0000ff', 0.5));

  // 柱状图动画
  console.log('\n--- Bar Height Animation ---');
  const fromHeights = [0, 0, 0, 0];
  const toHeights = [50, 80, 30, 100];
  const animated = ChartDataAnimator.animateBarHeights(fromHeights, toHeights, 0.5);
  console.log('  Progress 0.5:', animated.map(v => v.toFixed(1)));

  // 计数动画
  console.log('\n--- Count Up Animation ---');
  console.log('  0 -> 1000 at 0.25:', ChartDataAnimator.countUp(0, 1000, 0.25).toFixed(0));
  console.log('  0 -> 1000 at 0.75:', ChartDataAnimator.countUp(0, 1000, 0.75).toFixed(0));
}
