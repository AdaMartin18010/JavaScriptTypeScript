/**
 * @file 进度条渲染器
 * @category CLI → Progress
 * @difficulty medium
 * @tags cli, progress-bar, terminal, renderer
 *
 * @description
 * 终端进度条渲染器，支持自定义字符、宽度、百分比显示和耗时统计。
 */

/** 进度条选项 */
export interface ProgressBarOptions {
  /** 总进度值 */
  total: number;
  /** 进度条宽度（字符数） */
  width?: number;
  /** 完成字符 */
  charComplete?: string;
  /** 未完成字符 */
  charIncomplete?: string;
  /** 完成后是否清除 */
  clearOnComplete?: boolean;
}

/** 进度条渲染器 */
export class ProgressBarRenderer {
  private current = 0;
  private readonly total: number;
  private readonly width: number;
  private readonly charComplete: string;
  private readonly charIncomplete: string;
  private readonly clearOnComplete: boolean;
  private readonly startTime: number;
  private completed = false;

  /**
   * @param options - 进度条配置选项
   */
  constructor(options: ProgressBarOptions) {
    if (options.total <= 0) {
      throw new Error('Total must be greater than 0');
    }
    this.total = options.total;
    this.width = options.width ?? 40;
    this.charComplete = options.charComplete ?? '█';
    this.charIncomplete = options.charIncomplete ?? '░';
    this.clearOnComplete = options.clearOnComplete ?? false;
    this.startTime = Date.now();
  }

  /**
   * 更新进度到指定值
   * @param value - 当前进度值
   */
  update(value: number): void {
    if (this.completed) return;
    this.current = Math.min(Math.max(value, 0), this.total);
    this.render();
    if (this.current >= this.total) {
      this.complete();
    }
  }

  /**
   * 增加进度
   * @param amount - 增量（默认为 1）
   */
  increment(amount = 1): void {
    if (this.completed) return;
    this.current = Math.min(this.current + amount, this.total);
    this.render();
    if (this.current >= this.total) {
      this.complete();
    }
  }

  /**
   * 完成进度条
   */
  complete(): void {
    if (this.completed) return;
    this.current = this.total;
    this.completed = true;
    if (this.clearOnComplete) {
      process.stdout.write('\r' + ' '.repeat(this.width + 50) + '\r');
    } else {
      process.stdout.write('\n');
    }
  }

  /**
   * 获取当前进度百分比
   * @returns 百分比值（0-100）
   */
  getPercentage(): number {
    return this.total === 0 ? 0 : (this.current / this.total) * 100;
  }

  /**
   * 获取已用时间（毫秒）
   * @returns 耗时毫秒数
   */
  getElapsedTime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * 获取当前进度值
   * @returns 当前值
   */
  getCurrent(): number {
    return this.current;
  }

  private render(): void {
    const percentage = this.getPercentage();
    const filled = Math.round((this.current / this.total) * this.width);
    const empty = this.width - filled;
    const bar = this.charComplete.repeat(filled) + this.charIncomplete.repeat(empty);
    const elapsed = this.getElapsedTime();

    const line = `\r[${bar}] ${percentage.toFixed(1)}% | ${this.current}/${this.total} | ${elapsed}ms`;
    process.stdout.write(line);
  }
}
