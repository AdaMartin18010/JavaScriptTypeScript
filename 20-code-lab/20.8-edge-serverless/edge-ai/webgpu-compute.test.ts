import { describe, it, expect } from 'vitest';
import { WebGPUCompute } from './webgpu-compute.js';

describe('WebGPUCompute', () => {
  it('should perform vector add', () => {
    const gpu = new WebGPUCompute();
    const size = 4;
    const a = gpu.createBuffer(size);
    const b = gpu.createBuffer(size);
    const c = gpu.createBuffer(size);

    gpu.writeBuffer(a, new Float32Array([1, 2, 3, 4]));
    gpu.writeBuffer(b, new Float32Array([4, 3, 2, 1]));

    const shader = WebGPUCompute.vectorAddShader();
    gpu.dispatchWorkgroups(shader, [a, b, c], Math.ceil(size / shader.workgroupSize[0]));

    expect(gpu.readBuffer(c)).toEqual(new Float32Array([5, 5, 5, 5]));
  });

  it('should apply relu', () => {
    const gpu = new WebGPUCompute();
    const size = 4;
    const inp = gpu.createBuffer(size);
    const out = gpu.createBuffer(size);

    gpu.writeBuffer(inp, new Float32Array([-1, 0, 2, -3]));

    const shader = WebGPUCompute.reluShader();
    gpu.dispatchWorkgroups(shader, [inp, out], Math.ceil(size / shader.workgroupSize[0]));

    expect(gpu.readBuffer(out)).toEqual(new Float32Array([0, 0, 2, 0]));
  });

  it('should throw on missing buffer read', () => {
    const gpu = new WebGPUCompute();
    expect(() => gpu.readBuffer(999)).toThrow();
  });
});
