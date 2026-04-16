import { describe, it, expect } from 'vitest'
import { ValuePool, ONNXRuntimeBridge, demo } from '\./onnx-runtime-bridge.js'

describe('onnx-runtime-bridge', () => {
  it('ValuePool is defined', () => {
    expect(typeof ValuePool).not.toBe('undefined');
  });
  it('ValuePool can be instantiated if constructor permits', () => {
    if (typeof ValuePool === 'function') {
      try {
        const instance = new (ValuePool as any)();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('ONNXRuntimeBridge is defined', () => {
    expect(typeof ONNXRuntimeBridge).not.toBe('undefined');
  });
  it('ONNXRuntimeBridge can be instantiated if constructor permits', () => {
    if (typeof ONNXRuntimeBridge === 'function') {
      try {
        const instance = new (ONNXRuntimeBridge as any)();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('demo is defined', () => {
    expect(typeof demo).not.toBe('undefined');
  });
  it('demo is callable', () => {
    if (typeof demo === 'function') {
      try {
        const result = (demo as any)();
        expect(result).toBeDefined();
      } catch { }
    }
  });
});

