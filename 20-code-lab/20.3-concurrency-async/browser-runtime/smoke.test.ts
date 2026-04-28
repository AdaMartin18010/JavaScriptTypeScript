import { describe, it, expect } from 'vitest';
import * as BrowserRuntime from './index';

describe('50-browser-runtime smoke test', () => {
  it('should export all submodules without throwing', () => {
    expect(BrowserRuntime.RenderingPipeline).toBeDefined();
    expect(BrowserRuntime.EventLoopArchitecture).toBeDefined();
    expect(BrowserRuntime.V8ExecutionModel).toBeDefined();
    expect(BrowserRuntime.DomVirtualizationModels).toBeDefined();
    expect(BrowserRuntime.MemoryManagementModel).toBeDefined();
  });

  it('should have callable demo or core functions', () => {
    expect(typeof BrowserRuntime.RenderingPipeline).toBe('object');
    expect(typeof BrowserRuntime.EventLoopArchitecture).toBe('object');
    expect(typeof BrowserRuntime.V8ExecutionModel).toBe('object');
  });
});
