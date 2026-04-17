import { describe, it, expect, vi } from 'vitest';
import { CanvasRenderer } from './canvas-renderer.js';

// Mock canvas for Node environment
function createMockCanvas(): HTMLCanvasElement {
  const mockCtx = {
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    scale: vi.fn(),
    closePath: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic'
  };

  return {
    getContext: vi.fn(() => mockCtx),
    getBoundingClientRect: vi.fn(() => ({ width: 300, height: 150 })),
    toDataURL: vi.fn(() => 'data:image/png;base64,test'),
    width: 300,
    height: 150,
    style: {}
  } as unknown as HTMLCanvasElement;
}

describe('CanvasRenderer', () => {
  it('initializes with correct dimensions', () => {
    const canvas = createMockCanvas();
    const renderer = new CanvasRenderer(canvas, 400, 300);
    const size = renderer.getSize();
    expect(size.width).toBe(400);
    expect(size.height).toBe(300);
  });

  it('resizes canvas considering DPR', () => {
    const canvas = createMockCanvas();
    const renderer = new CanvasRenderer(canvas, 400, 300);
    renderer.resize(800, 600);
    const size = renderer.getSize();
    expect(size.width).toBe(800);
    expect(size.height).toBe(600);
  });

  it('clears the canvas', () => {
    const canvas = createMockCanvas();
    const renderer = new CanvasRenderer(canvas, 400, 300);
    renderer.clear();
    const ctx = canvas.getContext('2d') as ReturnType<typeof createMockCanvas>['getContext'] extends () => infer R ? R : never;
    expect(ctx.clearRect).toHaveBeenCalled();
  });

  it('draws rectangle with fill', () => {
    const canvas = createMockCanvas();
    const renderer = new CanvasRenderer(canvas, 400, 300);
    renderer.drawRect({ x: 10, y: 10, width: 100, height: 50, fill: '#3b82f6' });
    const ctx = canvas.getContext('2d')!;
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.fillStyle).toBe('#3b82f6');
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('draws rectangle with stroke', () => {
    const canvas = createMockCanvas();
    const renderer = new CanvasRenderer(canvas, 400, 300);
    renderer.drawRect({ x: 10, y: 10, width: 100, height: 50, stroke: '#000', strokeWidth: 2 });
    const ctx = canvas.getContext('2d')!;
    expect(ctx.strokeStyle).toBe('#000');
    expect(ctx.lineWidth).toBe(2);
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('draws circle', () => {
    const canvas = createMockCanvas();
    const renderer = new CanvasRenderer(canvas, 400, 300);
    renderer.drawCircle({ x: 50, y: 50, radius: 20, fill: 'red' });
    const ctx = canvas.getContext('2d')!;
    expect(ctx.arc).toHaveBeenCalledWith(50, 50, 20, 0, Math.PI * 2);
    expect(ctx.fillStyle).toBe('red');
  });

  it('draws text', () => {
    const canvas = createMockCanvas();
    const renderer = new CanvasRenderer(canvas, 400, 300);
    renderer.drawText({ x: 10, y: 20, text: 'Hello', font: '12px sans-serif', fill: '#333' });
    const ctx = canvas.getContext('2d')!;
    expect(ctx.font).toBe('12px sans-serif');
    expect(ctx.fillStyle).toBe('#333');
    expect(ctx.fillText).toHaveBeenCalledWith('Hello', 10, 20);
  });

  it('draws line', () => {
    const canvas = createMockCanvas();
    const renderer = new CanvasRenderer(canvas, 400, 300);
    renderer.drawLine(
      [{ x: 0, y: 0 }, { x: 100, y: 100 }],
      { stroke: 'blue', strokeWidth: 2 }
    );
    const ctx = canvas.getContext('2d')!;
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
    expect(ctx.lineTo).toHaveBeenCalledWith(100, 100);
    expect(ctx.strokeStyle).toBe('blue');
  });

  it('batch draws multiple rects', () => {
    const canvas = createMockCanvas();
    const renderer = new CanvasRenderer(canvas, 400, 300);
    renderer.batchDrawRects([
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 20, y: 20, width: 10, height: 10 }
    ]);
    const ctx = canvas.getContext('2d')!;
    expect(ctx.beginPath).toHaveBeenCalledTimes(2);
  });

  it('exports to data URL', () => {
    const canvas = createMockCanvas();
    const renderer = new CanvasRenderer(canvas, 400, 300);
    const url = renderer.toDataURL();
    expect(url).toContain('data:image/png');
  });

  it('saves and restores context state', () => {
    const canvas = createMockCanvas();
    const renderer = new CanvasRenderer(canvas, 400, 300);
    renderer.save();
    renderer.restore();
    const ctx = canvas.getContext('2d')!;
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });
});
