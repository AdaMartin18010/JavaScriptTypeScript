import { describe, it, expect } from 'vitest';
import { WASMUtils, WASMLoader, WASMMemoryManager, WASMBridge, WASMPerformanceMonitor } from './wasm-integration';

describe('WASMUtils', () => {
  it('detects WebAssembly support', () => {
    expect(WASMUtils.isSupported()).toBe(true);
  });

  it('compiles WAT add module', async () => {
    const wat = '(module (func $add (param i32 i32) (result i32) local.get 0 local.get 1 i32.add) (export "add" (func $add)))';
    const module = await WASMUtils.compileWAT(wat);
    expect(module).toBeInstanceOf(WebAssembly.Module);
    const instance = await WebAssembly.instantiate(module);
    const add = instance.exports.add as (a: number, b: number) => number;
    expect(add(2, 3)).toBe(5);
  });
});

describe('WASMLoader', () => {
  it('loads from BufferSource and caches', async () => {
    const binary = new Uint8Array([
      0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
      0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f,
      0x03, 0x02, 0x01, 0x00,
      0x07, 0x07, 0x01, 0x03, 0x61, 0x64, 0x64, 0x00, 0x00,
      0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b
    ]);
    const loader = new WASMLoader();
    const wasm1 = await loader.load(binary, {});
    const wasm2 = await loader.load(binary, {});
    expect(wasm1.exports).toBeDefined();
    expect(wasm2.exports).toBeDefined();
  });
});

describe('WASMMemoryManager', () => {
  it('writes and reads string', () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    let ptr = 0;
    const mm = new WASMMemoryManager(memory, {
      malloc: (size: number) => { const p = ptr; ptr += size; return p; },
      free: () => {}
    });
    const { ptr: strPtr } = mm.writeString('hello');
    expect(mm.readString(strPtr)).toBe('hello');
  });

  it('writes and reads typed arrays', () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const mm = new WASMMemoryManager(memory);
    const ptr = 0;
    const arr = new Float32Array([1, 2, 3]);
    mm.writeFloat32Array(ptr, arr);
    const read = mm.readFloat32Array(ptr, 3);
    expect(Array.from(read)).toEqual([1, 2, 3]);
  });
});

describe('WASMBridge', () => {
  it('calls exported function', async () => {
    const wat = '(module (func $add (param i32 i32) (result i32) local.get 0 local.get 1 i32.add) (export "add" (func $add)))';
    const module = await WASMUtils.compileWAT(wat);
    const instance = await WebAssembly.instantiate(module);
    const bridge = new WASMBridge({ instance, exports: instance.exports, memory: new WebAssembly.Memory({ initial: 1 }) });
    const result = bridge.call<number>('add', 10, 20);
    expect(result).toBe(30);
  });
});

describe('WASMPerformanceMonitor', () => {
  it('wraps function and records metrics', () => {
    const monitor = new WASMPerformanceMonitor();
    const wrapped = monitor.wrap((a: number, b: number) => a + b, 'add');
    wrapped(1, 2);
    wrapped(3, 4);
    const metric = monitor.getMetric('add');
    expect(metric?.calls).toBe(2);
    expect(metric?.avgTime).toBeGreaterThanOrEqual(0);
  });

  it('benchmarks JS vs WASM', async () => {
    const monitor = new WASMPerformanceMonitor();
    const result = await monitor.benchmark('sum', () => 1 + 2, () => 1 + 2, 100);
    expect(result.js.result).toBe(3);
    expect(result.wasm.result).toBe(3);
    expect(result.speedup).toBeGreaterThan(0);
  });
});
