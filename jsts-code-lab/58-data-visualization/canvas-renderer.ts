/**
 * @file Canvas 渲染基础
 * @category Data Visualization → Canvas Renderer
 * @difficulty medium
 * @tags data-viz, canvas, rendering, 2d-context
 *
 * @description
 * Canvas 2D 渲染抽象层，提供设备像素比适配、分层渲染和批量绘制
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface CanvasSize {
  width: number;
  height: number;
}

export interface RenderLayer {
  name: string;
  visible: boolean;
  opacity: number;
}

export interface DrawRect {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
}

export interface DrawCircle {
  x: number;
  y: number;
  radius: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface DrawText {
  x: number;
  y: number;
  text: string;
  font?: string;
  fill?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
}

// ============================================================================
// Canvas 渲染器
// ============================================================================

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number;
  private logicalWidth: number;
  private logicalHeight: number;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = context;
    this.dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    this.logicalWidth = width;
    this.logicalHeight = height;

    this.resize(width, height);
  }

  /**
   * 调整画布大小（考虑 DPR）
   */
  resize(width: number, height: number): void {
    this.logicalWidth = width;
    this.logicalHeight = height;

    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.scale(this.dpr, this.dpr);
  }

  /**
   * 清空画布
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
  }

  /**
   * 保存/恢复上下文状态
   */
  save(): void {
    this.ctx.save();
  }

  restore(): void {
    this.ctx.restore();
  }

  /**
   * 绘制矩形
   */
  drawRect(rect: DrawRect): void {
    const { x, y, width, height, fill, stroke, strokeWidth, radius } = rect;

    this.ctx.beginPath();

    if (radius && radius > 0) {
      this.roundRect(x, y, width, height, radius);
    } else {
      this.ctx.rect(x, y, width, height);
    }

    if (fill) {
      this.ctx.fillStyle = fill;
      this.ctx.fill();
    }

    if (stroke) {
      this.ctx.strokeStyle = stroke;
      this.ctx.lineWidth = strokeWidth || 1;
      this.ctx.stroke();
    }
  }

  /**
   * 绘制圆形
   */
  drawCircle(circle: DrawCircle): void {
    const { x, y, radius, fill, stroke, strokeWidth } = circle;

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (fill) {
      this.ctx.fillStyle = fill;
      this.ctx.fill();
    }

    if (stroke) {
      this.ctx.strokeStyle = stroke;
      this.ctx.lineWidth = strokeWidth || 1;
      this.ctx.stroke();
    }
  }

  /**
   * 绘制文本
   */
  drawText(text: DrawText): void {
    const { x, y, text: content, font, fill, align, baseline } = text;

    if (font) this.ctx.font = font;
    if (fill) this.ctx.fillStyle = fill;
    if (align) this.ctx.textAlign = align;
    if (baseline) this.ctx.textBaseline = baseline;

    this.ctx.fillText(content, x, y);
  }

  /**
   * 绘制折线
   */
  drawLine(points: Array<{ x: number; y: number }>, options: { stroke?: string; strokeWidth?: number; smooth?: boolean } = {}): void {
    if (points.length < 2) return;

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);

    if (options.smooth) {
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        this.ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + curr.y) / 2);
      }
    } else {
      for (let i = 1; i < points.length; i++) {
        this.ctx.lineTo(points[i].x, points[i].y);
      }
    }

    if (options.stroke) {
      this.ctx.strokeStyle = options.stroke;
      this.ctx.lineWidth = options.strokeWidth || 1;
      this.ctx.stroke();
    }
  }

  /**
   * 批量绘制矩形
   */
  batchDrawRects(rects: DrawRect[]): void {
    for (const rect of rects) {
      this.drawRect(rect);
    }
  }

  /**
   * 获取上下文
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * 获取尺寸
   */
  getSize(): CanvasSize {
    return { width: this.logicalWidth, height: this.logicalHeight };
  }

  /**
   * 导出为 Data URL
   */
  toDataURL(type = 'image/png'): string {
    return this.canvas.toDataURL(type);
  }

  private roundRect(x: number, y: number, width: number, height: number, radius: number): void {
    const r = Math.min(radius, width / 2, height / 2);
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + width - r, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    this.ctx.lineTo(x + width, y + height - r);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    this.ctx.lineTo(x + r, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
  }
}

// ============================================================================
// 离屏渲染器（用于批量生成或 Worker）
// ============================================================================

export class OffscreenCanvasRenderer {
  private canvas: HTMLCanvasElement | OffscreenCanvas;
  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    if (typeof OffscreenCanvas !== 'undefined') {
      this.canvas = new OffscreenCanvas(width, height);
      this.ctx = this.canvas.getContext('2d')!;
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d')!;
    }
  }

  /**
   * 获取上下文
   */
  getContext(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * 转换为 Blob
   */
  async toBlob(type = 'image/png'): Promise<Blob | null> {
    if (this.canvas instanceof HTMLCanvasElement) {
      return new Promise(resolve => this.canvas.toBlob(resolve, type));
    }
    return this.canvas.convertToBlob({ type });
  }

  /**
   * 获取尺寸
   */
  getSize(): CanvasSize {
    return { width: this.width, height: this.height };
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== Canvas 渲染基础 ===\n');

  console.log('CanvasRenderer features:');
  console.log('  - DPR-aware rendering');
  console.log('  - Rect, Circle, Text, Line drawing');
  console.log('  - Batch drawing');
  console.log('  - Offscreen rendering support');

  // 模拟绘制命令日志
  const commands = [
    'clear()',
    'drawRect({ x: 10, y: 10, width: 100, height: 50, fill: "#3b82f6" })',
    'drawCircle({ x: 200, y: 100, radius: 30, fill: "#10b981" })',
    'drawText({ x: 50, y: 150, text: "Hello Canvas", fill: "#1f2937" })',
    'drawLine([{x:0,y:200},{x:300,y:200}], { stroke: "#ef4444", strokeWidth: 2 })'
  ];

  console.log('\nExample drawing sequence:');
  commands.forEach(cmd => console.log(`  ${cmd}`));
}
