/**
 * @file Float16Array (ES2025)
 * @category ECMAScript Evolution → ES2025
 * @difficulty medium
 * @tags typedarray, webgpu, machine-learning, es2025
 * @description
 * 演示 ES2025 引入的 Float16Array、DataView.prototype.getFloat16/setFloat16
 * 以及 Math.f16round。半精度浮点数在 WebGPU 和 ML 模型传输中可节省 50% 内存。
 */

// ES2025 类型补丁：Float16Array 尚未进入所有 TypeScript lib 定义
declare global {
  interface Float16Array extends Float32Array {}
  var Float16Array: {
    new (length: number): Float16Array;
    new (values: Iterable<number> | ArrayLike<number>): Float16Array;
    prototype: Float16Array;
    BYTES_PER_ELEMENT: 2;
  };
  interface DataView {
    getFloat16(byteOffset: number, littleEndian?: boolean): number;
    setFloat16(byteOffset: number, value: number, littleEndian?: boolean): void;
  }
  interface Math {
    f16round(x: number): number;
  }
}

/** 基础使用 */
export function basicFloat16Demo(): {
  array: Float16Array;
  firstValue: number;
  precisionLoss: boolean;
} {
  const arr = new Float16Array([1.1, 2.2, 3.3]);
  return {
    array: arr,
    firstValue: arr[0], // 1.099609375（半精度近似值）
    precisionLoss: arr[0] !== 1.1,
  };
}

/** DataView getFloat16 / setFloat16 */
export function dataViewDemo(): { read: number; buffer: ArrayBuffer } {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);

  view.setFloat16(0, 1.337, true); // 小端序
  const read = view.getFloat16(0, true);

  return { read, buffer };
}

/** Math.f16round 舍入 */
export function f16roundDemo(): { original: number; rounded: number } {
  const original = 1.337;
  return {
    original,
    rounded: Math.f16round(original),
  };
}

/** 与 Float32Array 的内存对比 */
export function memoryComparisonDemo(): {
  float16Bytes: number;
  float32Bytes: number;
  ratio: number;
} {
  const count = 1024;
  const f16 = new Float16Array(count);
  const f32 = new Float32Array(count);

  return {
    float16Bytes: f16.byteLength,
    float32Bytes: f32.byteLength,
    ratio: f16.byteLength / f32.byteLength,
  };
}

/** 精度损失演示 */
export function precisionLossDemo(): { f16: number; f32: number; f64: number } {
  const value = 1.0001;
  return {
    f16: Math.f16round(value),
    f32: Math.fround(value),
    f64: value,
  };
}
