/**
 * @file Float16Array Tests (ES2025)
 * @category ECMAScript Evolution → ES2025
 */

import { describe, it, expect } from 'vitest';
import {
  basicFloat16Demo,
  dataViewDemo,
  f16roundDemo,
  memoryComparisonDemo,
  precisionLossDemo,
} from './float16array.js';

const hasFloat16Array = typeof Float16Array !== 'undefined';
const itIf = hasFloat16Array ? it : it.skip;

describe('ES2025 Float16Array', () => {
  itIf('basicFloat16Demo', () => {
    const result = basicFloat16Demo() as { array: Float16Array; firstValue: number; precisionLoss: boolean };
    expect(result.array.length).toBe(3);
    expect(result.precisionLoss).toBe(true);
  });

  itIf('dataViewDemo', () => {
    const result = dataViewDemo() as { read: number; buffer: ArrayBuffer };
    expect(result.read).toBeCloseTo(1.337, 2);
  });

  itIf('f16roundDemo', () => {
    const result = f16roundDemo() as { original: number; rounded: number };
    expect(result.rounded).toBeCloseTo(1.337, 2);
  });

  itIf('memoryComparisonDemo', () => {
    const result = memoryComparisonDemo();
    expect(result.float16Bytes).toBe(2048);
    expect(result.float32Bytes).toBe(4096);
    expect(result.ratio).toBe(0.5);
  });

  itIf('precisionLossDemo', () => {
    const result = precisionLossDemo() as { f16: number; f32: number; f64: number };
    expect(result.f16).toBeCloseTo(1.0, 1);
    expect(result.f32).toBeCloseTo(1.0001, 4);
    expect(result.f64).toBe(1.0001);
  });
});
