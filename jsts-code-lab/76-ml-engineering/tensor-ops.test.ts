import { describe, it, expect } from 'vitest';
import { Tensor } from './tensor-ops.js';

describe('Tensor', () => {
  it('should create zeros and ones', () => {
    const z = Tensor.zeros([2, 3]);
    expect(z.shape.dims).toEqual([2, 3]);
    expect(z.data.every(v => v === 0)).toBe(true);

    const o = Tensor.ones([2, 3]);
    expect(o.data.every(v => v === 1)).toBe(true);
  });

  it('should add element-wise', () => {
    const a = new Tensor([2, 2], new Float32Array([1, 2, 3, 4]));
    const b = new Tensor([2, 2], new Float32Array([5, 6, 7, 8]));
    const c = a.add(b);
    expect(c.data).toEqual(new Float32Array([6, 8, 10, 12]));
  });

  it('should multiply element-wise', () => {
    const a = new Tensor([2, 2], new Float32Array([1, 2, 3, 4]));
    const b = new Tensor([2, 2], new Float32Array([2, 2, 2, 2]));
    const c = a.mul(b);
    expect(c.data).toEqual(new Float32Array([2, 4, 6, 8]));
  });

  it('should scale by scalar', () => {
    const a = new Tensor([2, 2], new Float32Array([1, 2, 3, 4]));
    const c = a.scale(2);
    expect(c.data).toEqual(new Float32Array([2, 4, 6, 8]));
  });

  it('should compute matmul', () => {
    const a = new Tensor([2, 3], new Float32Array([1, 2, 3, 4, 5, 6]));
    const b = new Tensor([3, 2], new Float32Array([7, 8, 9, 10, 11, 12]));
    const c = a.matmul(b);
    expect(c.shape.dims).toEqual([2, 2]);
    // Row 0: [1*7+2*9+3*11, 1*8+2*10+3*12] = [58, 64]
    expect(c.data[0]).toBeCloseTo(58);
    expect(c.data[1]).toBeCloseTo(64);
  });

  it('should transpose 2D tensor', () => {
    const a = new Tensor([2, 3], new Float32Array([1, 2, 3, 4, 5, 6]));
    const t = a.transpose();
    expect(t.shape.dims).toEqual([3, 2]);
    expect(t.data).toEqual(new Float32Array([1, 4, 2, 5, 3, 6]));
  });

  it('should reshape', () => {
    const a = new Tensor([2, 3], new Float32Array([1, 2, 3, 4, 5, 6]));
    const r = a.reshape([3, 2]);
    expect(r.shape.dims).toEqual([3, 2]);
  });

  it('should throw on shape mismatch for matmul', () => {
    const a = new Tensor([2, 3], new Float32Array(6));
    const b = new Tensor([2, 2], new Float32Array(4));
    expect(() => a.matmul(b)).toThrow();
  });
});
