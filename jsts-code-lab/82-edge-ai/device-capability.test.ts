import { describe, it, expect } from 'vitest';
import { DeviceCapabilityDetector } from './device-capability.js';

describe('DeviceCapabilityDetector', () => {
  it('should detect capabilities', () => {
    const detector = new DeviceCapabilityDetector();
    const caps = detector.detect();
    expect(caps.estimatedMemoryBytes).toBeGreaterThan(0);
    expect(typeof caps.webgpu).toBe('boolean');
    expect(typeof caps.webnn).toBe('boolean');
  });

  it('should recommend config based on capabilities', () => {
    const detector = new DeviceCapabilityDetector();
    const config = detector.recommendModelConfig({
      estimatedMemoryBytes: 256 * 1024 * 1024,
      wasmSimd: true,
      webgpu: false,
      webnn: false,
      multiThreading: true,
      batteryPowered: false
    });
    expect(config.quantizeToInt8).toBe(true);
    expect(config.preferWebGPU).toBe(false);
  });
});
