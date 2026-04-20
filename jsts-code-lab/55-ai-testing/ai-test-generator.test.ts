import { describe, it, expect } from 'vitest';
import {
  AITestGenerator,
  PromptBuilder,
  EdgeCaseDetector,
  TestOracleExtractor,
  PropertyBasedTestGenerator
} from './ai-test-generator.js';

describe('PromptBuilder', () => {
  it('parses parameters from function signature', () => {
    const builder = new PromptBuilder();
    const params = builder.parseParams('function add(a: number, b: number): number { return a + b; }');
    expect(params).toHaveLength(2);
    expect(params[0]).toMatchObject({ name: 'a', type: 'number', optional: false });
    expect(params[1]).toMatchObject({ name: 'b', type: 'number', optional: false });
  });

  it('parses optional parameters', () => {
    const builder = new PromptBuilder();
    const params = builder.parseParams('function greet(name?: string, age?: number): string {}');
    expect(params[0].optional).toBe(true);
    expect(params[1].optional).toBe(true);
  });

  it('parses default values', () => {
    const builder = new PromptBuilder();
    const params = builder.parseParams('function fn(a: number = 10): void {}');
    expect(params[0].defaultValue).toBe('10');
  });

  it('builds a structured prompt', () => {
    const builder = new PromptBuilder();
    const prompt = builder.buildPrompt('function add(a: number, b: number): number {}', 'add');
    expect(prompt.system).toContain('expert test engineer');
    expect(prompt.user).toContain('add');
    expect(prompt.user).toContain('number');
  });
});

describe('EdgeCaseDetector', () => {
  it('detects number edge cases', () => {
    const detector = new EdgeCaseDetector();
    const cases = detector.detect('number');
    expect(cases).toContain(0);
    expect(cases).toContain(Infinity);
    expect(cases).toContain(-Infinity);
    expect(cases.some(c => Number.isNaN(c))).toBe(true);
    expect(cases).toContain(null);
    expect(cases).toContain(undefined);
  });

  it('detects string edge cases', () => {
    const detector = new EdgeCaseDetector();
    const cases = detector.detect('string');
    expect(cases).toContain('');
    expect(cases).toContain(null);
    expect(cases).toContain(undefined);
  });

  it('detects overflow cases for numbers', () => {
    const detector = new EdgeCaseDetector();
    const cases = detector.detectOverflow('number', 'multiply');
    expect(cases.length).toBeGreaterThan(0);
    expect(cases).toContain(Number.MAX_VALUE * 2);
  });

  it('returns empty overflow cases for non-numbers', () => {
    const detector = new EdgeCaseDetector();
    expect(detector.detectOverflow('string')).toEqual([]);
  });

  it('detects nullish values', () => {
    const detector = new EdgeCaseDetector();
    expect(detector.detectNullish()).toContain(null);
    expect(detector.detectNullish()).toContain(undefined);
  });

  it('detects empty values', () => {
    const detector = new EdgeCaseDetector();
    expect(detector.detectEmpty('string')).toContain('');
    expect(detector.detectEmpty('array')).toHaveLength(2);
  });
});

describe('TestOracleExtractor', () => {
  it('extracts oracle from JSDoc', () => {
    const extractor = new TestOracleExtractor();
    const oracle = extractor.extractFromJSDoc(`
 * @param {number} a - first number
 * @returns {number} sum of inputs
 * @throws {TypeError} invalid input
 * @invariant result >= 0
`);
    expect(oracle.preconditions).toHaveLength(1);
    expect(oracle.exceptions).toHaveLength(1);
    expect(oracle.invariants).toContain('result >= 0');
  });

  it('infers oracle from types', () => {
    const extractor = new TestOracleExtractor();
    const oracle = extractor.inferFromType('string', 'number');
    expect(oracle.invariants.length).toBeGreaterThan(0);
  });
});

describe('PropertyBasedTestGenerator', () => {
  it('generates random values for number type', () => {
    const gen = new PropertyBasedTestGenerator();
    const values = gen.generateForType('number', 5);
    expect(values).toHaveLength(5);
    expect(values.every(v => typeof v === 'number')).toBe(true);
  });

  it('generates random values for string type', () => {
    const gen = new PropertyBasedTestGenerator();
    const values = gen.generateForType('string', 5);
    expect(values).toHaveLength(5);
    expect(values.every(v => typeof v === 'string')).toBe(true);
  });

  it('generates property assertions', () => {
    const gen = new PropertyBasedTestGenerator();
    const assertion = gen.generatePropertyAssertion('add', [
      { name: 'a', type: 'number', optional: false },
      { name: 'b', type: 'number', optional: false }
    ]);
    expect(typeof assertion).toBe('string');
  });
});

describe('AITestGenerator', () => {
  it('generates tests for a simple function', () => {
    const generator = new AITestGenerator();
    const tests = generator.generateTests('function add(a: number, b: number): number { return a + b; }', 'add');
    expect(tests.length).toBeGreaterThan(0);
    expect(tests.some(t => t.category === 'valid')).toBe(true);
    expect(tests.some(t => t.category === 'boundary')).toBe(true);
  });

  it('generates tests with JSDoc oracle', () => {
    const generator = new AITestGenerator();
    const code = `
/**
 * @param {number} a - first
 * @param {number} b - second
 * @returns {number} result
 * @throws {TypeError} invalid
 */
function add(a: number, b: number): number { return a + b; }
`;
    const tests = generator.generateTests(code, 'add');
    expect(tests.length).toBeGreaterThan(0);
    expect(tests.some(t => t.oracleSource === 'jsdoc' || t.oracleSource === 'type')).toBe(true);
  });

  it('generates property-based tests', () => {
    const generator = new AITestGenerator();
    const tests = generator.generateTests('function add(a: number, b: number): number {}', 'add');
    const propertyTest = tests.find(t => t.category === 'edge');
    expect(propertyTest).toBeDefined();
    expect(propertyTest!.inputs).toHaveLength(2);
  });

  it('handles optional parameters', () => {
    const generator = new AITestGenerator();
    const tests = generator.generateTests('function greet(name?: string): string { return name || "hello"; }', 'greet');
    expect(tests.length).toBeGreaterThan(0);
  });

  it('includes invalid category tests for required params', () => {
    const generator = new AITestGenerator();
    const tests = generator.generateTests('function fn(a: number): number {}', 'fn');
    const invalid = tests.filter(t => t.category === 'invalid');
    expect(invalid.length).toBeGreaterThan(0);
  });
});
