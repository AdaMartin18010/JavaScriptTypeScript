import { describe, it, expect } from 'vitest';
import { TinyMLModelLoader } from './tinyml-loader.js';

describe('TinyMLModelLoader', () => {
  it('should generate and load a dummy model', () => {
    const loader = new TinyMLModelLoader();
    const buffer = loader.generateDummyModel([
      { type: 'dense', inputShape: [2], outputShape: [3], weightCount: 6, biasCount: 3 },
      { type: 'relu', inputShape: [3], outputShape: [3] }
    ]);

    const model = loader.load(buffer);
    expect(model.header.version).toBe(1);
    expect(model.layers.length).toBe(2);
    expect(model.layers[0].type).toBe('dense');
    expect(model.layers[1].type).toBe('relu');
  });

  it('should throw on invalid magic', () => {
    const loader = new TinyMLModelLoader();
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer);
    view.setUint32(0, 0xdeadbeef, true);
    expect(() => loader.load(buffer)).toThrow(/Invalid model magic/);
  });

  it('should throw on unsupported version', () => {
    const loader = new TinyMLModelLoader();
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer);
    view.setUint32(0, 0x54494e59, true); // magic
    view.setUint16(4, 999, true); // version
    expect(() => loader.load(buffer)).toThrow(/Unsupported model version/);
  });
});
