import { describe, it, expect } from 'vitest';
import { runBernsteinVazirani } from './bernstein-vazirani.js';

describe('Bernstein-Vazirani', () => {
  it('finds secret string 1010', () => {
    const n = 4;
    const s = 0b1010;
    expect(runBernsteinVazirani(n, s)).toBe(s);
  });

  it('finds secret string 1111', () => {
    const n = 4;
    const s = 0b1111;
    expect(runBernsteinVazirani(n, s)).toBe(s);
  });

  it('finds secret string 0000', () => {
    const n = 4;
    const s = 0b0000;
    expect(runBernsteinVazirani(n, s)).toBe(s);
  });

  it('finds random secret string', () => {
    const n = 5;
    const s = 0b10011;
    expect(runBernsteinVazirani(n, s)).toBe(s);
  });
});
