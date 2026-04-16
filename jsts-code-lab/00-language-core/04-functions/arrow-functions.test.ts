import { describe, it, expect } from 'vitest';
import { arrow, traditional, makeObject, Counter, ModernCounter, compose, pipe, curry, add5, multiply2, toString, withArgs } from './arrow-functions.js';

describe('arrow functions', () => {
  it('arrow and traditional should produce same result', () => {
    expect(arrow(5)).toBe(10);
    expect(traditional(5)).toBe(10);
  });

  it('makeObject should return an object with value and doubled', () => {
    expect(makeObject(5)).toEqual({ value: 5, doubled: 10 });
  });

  it('ModernCounter increment arrow function should bind this correctly', () => {
    const counter = new ModernCounter();
    counter.increment();
    expect(counter.count).toBe(1);
  });

  it('compose should apply functions right to left', () => {
    const composed = compose<number>(multiply2, add5);
    expect(composed(5)).toBe(20);
  });

  it('pipe should apply functions left to right', () => {
    const piped = pipe<number>(add5, multiply2, toString as unknown as (x: number) => number);
    expect(piped(5)).toBe('20');
  });

  it('curry should allow partial application', () => {
    const add = (a: number, b: number) => a + b;
    const curriedAdd = curry(add);
    expect(curriedAdd(5)(3)).toBe(8);
  });

  it('withArgs should sum variable arguments', () => {
    expect(withArgs(1, 2, 3, 4)).toBe(10);
    expect(withArgs()).toBe(0);
  });
});
