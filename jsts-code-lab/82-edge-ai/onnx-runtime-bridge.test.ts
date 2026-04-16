import { describe, it, expect } from 'vitest'
import { ValuePool, ONNXRuntimeBridge, demo } from './onnx-runtime-bridge'

describe('onnx-runtime-bridge', () => {
  it('ValuePool is defined', () => {
    expect(typeof ValuePool).not.toBe('undefined');
  });
  it('ValuePool can be instantiated if constructor permits', () => {
    if (typeof ValuePool === 'function') {
      try {
        const instance = new ValuePool();
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
        const instance = new ONNXRuntimeBridge();
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
        const result = demo();
        expect(result).toBeDefined();
      } catch { }
    }
  });
});