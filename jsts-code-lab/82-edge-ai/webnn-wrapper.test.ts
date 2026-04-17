import { describe, it, expect } from 'vitest';
import { WebNNWrapper } from './webnn-wrapper.js';

describe('WebNNWrapper', () => {
  it('should build and compute a simple graph', () => {
    const webnn = new WebNNWrapper();
    webnn.input('input', { shape: [1, 2], dataType: 'float32' });
    webnn.constant('weight', { shape: [2, 1], dataType: 'float32' }, new Float32Array([2, 3]));
    webnn.addNode({ name: 'gemm', op: 'matmul', inputs: ['input', 'weight'], output: 'output' });

    webnn.build();
    const result = webnn.compute({
      input: { desc: { shape: [1, 2], dataType: 'float32' }, data: new Float32Array([1, 2]) }
    });

    expect(result.output.data[0]).toBeCloseTo(8, 4); // 1*2 + 2*3
  });

  it('should apply relu', () => {
    const webnn = new WebNNWrapper();
    webnn.input('input', { shape: [1, 3], dataType: 'float32' });
    webnn.addNode({ name: 'relu', op: 'relu', inputs: ['input'], output: 'output' });

    const result = webnn.compute({
      input: { desc: { shape: [1, 3], dataType: 'float32' }, data: new Float32Array([-1, 0, 2]) }
    });

    expect(result.output.data).toEqual(new Float32Array([0, 0, 2]));
  });

  it('should throw on missing input during build', () => {
    const webnn = new WebNNWrapper();
    webnn.addNode({ name: 'n', op: 'relu', inputs: ['missing'], output: 'out' });
    expect(() => webnn.build()).toThrow();
  });
});
