import { describe, it, expect } from 'vitest';
import { runDeutschJozsa } from './deutsch-jozsa.js';

describe('Deutsch-Jozsa', () => {
  it('detects constant function (all zeros)', () => {
    const n = 3;
    const f = () => 0 as 0 | 1;
    expect(runDeutschJozsa(n, f)).toBe('constant');
  });

  it('detects constant function (all ones)', () => {
    const n = 3;
    const f = () => 1 as 0 | 1;
    expect(runDeutschJozsa(n, f)).toBe('constant');
  });

  it('detects balanced function (parity)', () => {
    const n = 3;
    const f = (x: number) => (x & 1) as 0 | 1;
    expect(runDeutschJozsa(n, f)).toBe('balanced');
  });

  it('detects balanced function (MSB)', () => {
    const n = 4;
    const f = (x: number) => ((x >> (n - 1)) & 1) as 0 | 1;
    expect(runDeutschJozsa(n, f)).toBe('balanced');
  });
});
