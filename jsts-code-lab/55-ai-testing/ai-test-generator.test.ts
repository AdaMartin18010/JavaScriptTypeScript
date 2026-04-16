import { describe, it, expect } from 'vitest';
import { AITestGenerator } from './ai-test-generator';

describe('AITestGenerator', () => {
  it('generates tests for a two-parameter function', () => {
    const gen = new AITestGenerator();
    const tests = gen.generateTests('function add(a: number, b: number): number { return a + b; }', 'add');
    expect(tests.length).toBe(6); // 3 per param
    expect(tests.some(t => t.name.includes('valid'))).toBe(true);
    expect(tests.some(t => t.name.includes('boundary'))).toBe(true);
    expect(tests.some(t => t.name.includes('invalid'))).toBe(true);
  });

  it('generates valid input based on type', () => {
    const gen = new AITestGenerator();
    const tests = gen.generateTests('function greet(name: string): string { return name; }', 'greet');
    const valid = tests.find(t => t.name.includes('valid'));
    expect(valid!.input).toBe('test');
  });

  it('parses parameters correctly', () => {
    const gen = new AITestGenerator();
    const tests = gen.generateTests('function foo( a : number , b : string ) {}', 'foo');
    expect(tests.length).toBe(6);
  });
});
