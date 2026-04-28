/**
 * @file 设备能力检测
 * @category Edge AI → Device Detection
 * @difficulty easy
 * @tags device-capability, webgpu, webnn, wasm, memory, edge-device
 *
 * @description
 * 在部署边缘 AI 模型前，需评估运行环境的硬件与 API 支持情况。
 * 本模块提供设备能力检测接口，用于决定模型精度、后端选择与内存策略。
 */

export interface DeviceCapabilities {
  /** 预估可用内存（字节） */
  estimatedMemoryBytes: number;
  /** 是否支持 WebAssembly SIMD */
  wasmSimd: boolean;
  /** 是否支持 WebGPU */
  webgpu: boolean;
  /** 是否支持 WebNN */
  webnn: boolean;
  /** 是否支持多线程 Worker */
  multiThreading: boolean;
  /** 是否运行于电池供电设备（建议降低功耗） */
  batteryPowered: boolean;
}

export class DeviceCapabilityDetector {
  /**
   * 检测当前环境能力（Node/Browser 通用模拟）
   */
  detect(): DeviceCapabilities {
    const estimatedMemoryBytes = this.estimateMemory();
    return {
      estimatedMemoryBytes,
      wasmSimd: this.checkWasmSimd(),
      webgpu: this.checkWebGPU(),
      webnn: this.checkWebNN(),
      multiThreading: typeof Worker !== 'undefined',
      batteryPowered: false // 简化：默认非电池设备
    };
  }

  /**
   * 根据设备能力推荐模型配置
   */
  recommendModelConfig(caps: DeviceCapabilities): {
    quantizeToInt8: boolean;
    maxModelSizeBytes: number;
    preferWebGPU: boolean;
    preferWebNN: boolean;
  } {
    const quantizeToInt8 = caps.estimatedMemoryBytes < 512 * 1024 * 1024;
    const maxModelSizeBytes = Math.floor(caps.estimatedMemoryBytes * 0.2);
    const preferWebGPU = caps.webgpu;
    const preferWebNN = caps.webnn;

    return { quantizeToInt8, maxModelSizeBytes, preferWebGPU, preferWebNN };
  }

  private estimateMemory(): number {
    try {
      // Node 环境
      if (typeof process !== 'undefined' && process.memoryUsage) {
        return process.memoryUsage().heapTotal;
      }
    } catch {
      // ignore
    }
    // 浏览器环境（简化回退）
    if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
      return (navigator as unknown as { deviceMemory: number }).deviceMemory * 1024 * 1024 * 1024;
    }
    return 2 * 1024 * 1024 * 1024; // 默认 2GB
  }

  private checkWasmSimd(): boolean {
    try {
      if (typeof WebAssembly !== 'undefined') {
        // 简化检测：尝试编译一个极简 Wasm 模块
        const minimalWasm = new Uint8Array([
          0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
          0x01, 0x04, 0x01, 0x60, 0x00, 0x00,
          0x03, 0x02, 0x01, 0x00,
          0x07, 0x07, 0x01, 0x03, 0x61, 0x64, 0x64, 0x00, 0x00,
          0x0a, 0x04, 0x01, 0x02, 0x00, 0x0b
        ]);
        new WebAssembly.Module(minimalWasm);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }

  private checkWebGPU(): boolean {
    return typeof navigator !== 'undefined' && 'gpu' in navigator;
  }

  private checkWebNN(): boolean {
    return typeof navigator !== 'undefined' && 'ml' in navigator;
  }
}

export function demo(): void {
  console.log('=== 设备能力检测 ===\n');

  const detector = new DeviceCapabilityDetector();
  const caps = detector.detect();

  console.log('设备能力:', caps);
  console.log('推荐配置:', detector.recommendModelConfig(caps));
}
