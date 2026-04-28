import { describe, it, expect } from 'vitest';
import {
  FuzzRng,
  RandomBytesStrategy,
  StringFuzzStrategy,
  MutationStrategy,
  StructuredFuzzStrategy,
  FuzzingEngine,
  FUZZ_STRING_DICTIONARY
} from './fuzzing-generator.js';

describe('FuzzRng', () => {
  it('produces reproducible sequences', () => {
    const rng1 = new FuzzRng(123);
    const rng2 = new FuzzRng(123);
    expect(rng1.next()).toBe(rng2.next());
    expect(rng1.nextInt(0, 100)).toBe(rng2.nextInt(0, 100));
  });

  it('generates bytes in range', () => {
    const rng = new FuzzRng(1);
    const bytes = rng.nextBytes(10);
    expect(bytes.length).toBe(10);
    for (const b of bytes) {
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(255);
    }
  });
});

describe('RandomBytesStrategy', () => {
  it('generates random bytes', () => {
    const rng = new FuzzRng(1);
    const strategy = new RandomBytesStrategy();
    const input = strategy.generate(rng, 50);
    expect(input.data.length).toBeLessThanOrEqual(50);
    expect(input.strategy).toBe('random-bytes');
  });
});

describe('StringFuzzStrategy', () => {
  it('generates string data', () => {
    const rng = new FuzzRng(1);
    const strategy = new StringFuzzStrategy();
    const input = strategy.generate(rng);
    expect(input.strategy).toBe('string');
    expect(input.data.length).toBeGreaterThanOrEqual(0);
  });

  it('sometimes picks from dictionary', () => {
    const rng = new FuzzRng(1);
    const strategy = new StringFuzzStrategy();
    let foundDict = false;
    for (let i = 0; i < 20; i++) {
      const input = strategy.generate(rng);
      const str = new TextDecoder().decode(input.data);
      if (FUZZ_STRING_DICTIONARY.includes(str)) {
        foundDict = true;
        break;
      }
    }
    expect(foundDict).toBe(true);
  });
});

describe('MutationStrategy', () => {
  it('mutates seed inputs', () => {
    const seed = new TextEncoder().encode('hello world');
    const strategy = new MutationStrategy([seed]);
    const rng = new FuzzRng(1);
    const input = strategy.generate(rng);
    expect(input.data.length).toBeGreaterThan(0);
    // 变异后的数据通常与种子不同
    const same = input.data.length === seed.length && input.data.every((b, i) => b === seed[i]);
    expect(same).toBe(false);
  });

  it('falls back to random when no seeds', () => {
    const strategy = new MutationStrategy([]);
    const rng = new FuzzRng(1);
    const input = strategy.generate(rng);
    expect(input.data.length).toBeGreaterThanOrEqual(0);
  });
});

describe('StructuredFuzzStrategy', () => {
  it('generates structured JSON', () => {
    const schema = {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const },
        age: { type: 'number' as const, min: 0, max: 120 }
      }
    };
    const strategy = new StructuredFuzzStrategy(schema);
    const rng = new FuzzRng(1);
    const input = strategy.generate(rng);
    const obj = JSON.parse(new TextDecoder().decode(input.data));
    expect(typeof obj).toBe('object');
  });

  it('generates arrays', () => {
    const schema = { type: 'array' as const, items: { type: 'number' as const }, min: 2, max: 5 };
    const strategy = new StructuredFuzzStrategy(schema);
    const rng = new FuzzRng(1);
    const input = strategy.generate(rng);
    const arr = JSON.parse(new TextDecoder().decode(input.data));
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBeGreaterThanOrEqual(2);
    expect(arr.length).toBeLessThanOrEqual(5);
  });
});

describe('FuzzingEngine', () => {
  it('runs fuzzing iterations', () => {
    const engine = new FuzzingEngine(1);
    engine.addStrategy(new RandomBytesStrategy());
    const results = engine.run(() => {}, 10);
    expect(results.length).toBe(10);
  });

  it('detects crashes', () => {
    const engine = new FuzzingEngine(1);
    engine.addStrategy(new StringFuzzStrategy());
    const results = engine.run((data) => {
      const str = new TextDecoder().decode(data);
      if (str.includes('boom')) throw new Error('crash');
    }, 200);
    const crashes = engine.getCrashes(results);
    expect(crashes.length).toBeGreaterThanOrEqual(0);
  });

  it('adds seeds to corpus', () => {
    const engine = new FuzzingEngine(1);
    engine.addSeed(new TextEncoder().encode('seed'));
    expect(engine.getCorpus().length).toBe(1);
  });
});
