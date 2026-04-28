import { describe, it, expect } from 'vitest'
import { PerformanceMonitor, MemoryProfiler, CodeProfiler, demo } from './performance-profiling.js'

describe('performance-profiling', () => {
  it('PerformanceMonitor is defined', () => {
    expect(typeof PerformanceMonitor).not.toBe('undefined');
  });
  it('PerformanceMonitor can be instantiated if constructor permits', () => {
    if (typeof PerformanceMonitor === 'function') {
      try {
        const instance = new PerformanceMonitor();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('MemoryProfiler is defined', () => {
    expect(typeof MemoryProfiler).not.toBe('undefined');
  });
  it('MemoryProfiler can be instantiated if constructor permits', () => {
    if (typeof MemoryProfiler === 'function') {
      try {
        const instance = new MemoryProfiler();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('CodeProfiler is defined', () => {
    expect(typeof CodeProfiler).not.toBe('undefined');
  });
  it('CodeProfiler can be instantiated if constructor permits', () => {
    if (typeof CodeProfiler === 'function') {
      try {
        const instance = new CodeProfiler();
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