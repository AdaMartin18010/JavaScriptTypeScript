import { describe, it, expect } from 'vitest';
import { Generator, Gen, PropertyTester, Shrink, SeededRandom } from './property-based-generator.js';

describe('SeededRandom', () => {
  it('produces reproducible sequences with same seed', () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(12345);
    expect(rng1.next()).toBe(rng2.next());
    expect(rng1.next()).toBe(rng2.next());
  });

  it('generates integers in range', () => {
    const rng = new SeededRandom(1);
    for (let i = 0; i < 20; i++) {
      const v = rng.nextInt(0, 10);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(10);
    }
  });
});

describe('Generator', () => {
  it('maps generated values', () => {
    const gen = Gen.integer(1, 5).map(x => x * 2);
    const rng = new SeededRandom(1);
    const value = gen.generate(rng);
    expect(value % 2).toBe(0);
    expect(value).toBeGreaterThanOrEqual(2);
    expect(value).toBeLessThanOrEqual(10);
  });

  it('filters values', () => {
    const gen = Gen.integer(0, 10).filter(x => x % 2 === 0);
    const rng = new SeededRandom(1);
    const value = gen.generate(rng);
    expect(value % 2).toBe(0);
  });

  it('generates arrays', () => {
    const gen = Gen.integer(0, 10).array(2, 5);
    const rng = new SeededRandom(1);
    const arr = gen.generate(rng);
    expect(arr.length).toBeGreaterThanOrEqual(2);
    expect(arr.length).toBeLessThanOrEqual(5);
  });
});

describe('Gen builders', () => {
  it('generates booleans', () => {
    const rng = new SeededRandom(1);
    const value = Gen.boolean().generate(rng);
    expect(typeof value).toBe('boolean');
  });

  it('generates strings', () => {
    const rng = new SeededRandom(1);
    const value = Gen.string(2, 4).generate(rng);
    expect(typeof value).toBe('string');
    expect(value.length).toBeGreaterThanOrEqual(2);
    expect(value.length).toBeLessThanOrEqual(4);
  });

  it('generates records', () => {
    const rng = new SeededRandom(1);
    const gen = Gen.record({ x: Gen.integer(0, 10), y: Gen.string(1, 3) });
    const value = gen.generate(rng);
    expect(typeof value.x).toBe('number');
    expect(typeof value.y).toBe('string');
  });

  it('oneOf picks from values', () => {
    const rng = new SeededRandom(1);
    const value = Gen.oneOf('a', 'b', 'c').generate(rng);
    expect(['a', 'b', 'c']).toContain(value);
  });

  it('optional returns undefined sometimes', () => {
    const rng = new SeededRandom(1);
    const gen = Gen.optional(Gen.integer(1, 10), 1);
    const value = gen.generate(rng);
    expect(value === undefined || typeof value === 'number').toBe(true);
  });
});

describe('PropertyTester', () => {
  it('passes for true property', () => {
    const tester = new PropertyTester(1);
    const result = tester.test(Gen.integer(0, 10), x => x >= 0 && x <= 10, { iterations: 50 });
    expect(result.passed).toBe(true);
  });

  it('fails for false property', () => {
    const tester = new PropertyTester(1);
    const result = tester.test(Gen.integer(-5, 5), x => x > 0, { iterations: 100 });
    expect(result.passed).toBe(false);
    expect(result.counterexample).toBeDefined();
  });

  it('shrinks counterexample', () => {
    const tester = new PropertyTester(1);
    const result = tester.test(
      Gen.integer(-10, 10),
      x => x < 5,
      { iterations: 50, shrink: true, shrinkStrategy: Shrink.integer() }
    );
    expect(result.passed).toBe(false);
    expect(result.shrunkCounterexample).toBeDefined();
  });
});

describe('Shrink', () => {
  it('shrinks integers toward zero', () => {
    const strategy = Shrink.integer();
    const shrunk = strategy.shrink(10);
    expect(shrunk).toContain(0);
    expect(shrunk).toContain(5);
  });

  it('shrinks arrays', () => {
    const strategy = Shrink.array(Shrink.integer());
    const shrunk = strategy.shrink([1, 2, 3]);
    expect(shrunk.some(a => a.length === 2)).toBe(true);
  });
});
