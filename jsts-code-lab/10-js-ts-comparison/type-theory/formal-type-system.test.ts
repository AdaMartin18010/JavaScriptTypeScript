import { describe, it, expect } from 'vitest';
import {
  TypeChecker,
  SoundnessValidator,
  isConsistent,
  RuntimeTypeChecker,
  proveNumberAddition,
  proveLSP,
} from './formal-type-system.js';
import type { TypeAnnotation } from './formal-type-system.js';

describe('TypeChecker', () => {
  const checker = new TypeChecker();
  const numberType: TypeAnnotation = { kind: 'primitive', name: 'number' };
  const stringType: TypeAnnotation = { kind: 'primitive', name: 'string' };
  const neverType: TypeAnnotation = { kind: 'never' };
  const unknownType: TypeAnnotation = { kind: 'unknown' };

  it('should declare and lookup variables', () => {
    checker.declareVariable('x', numberType);
    expect(checker.lookupVariable('x')).toEqual(numberType);
    expect(checker.lookupVariable('y')).toBeUndefined();
  });

  it('should check reflexivity', () => {
    expect(checker.isSubtype(numberType, numberType)).toBe(true);
  });

  it('should check never subtype', () => {
    expect(checker.isSubtype(neverType, numberType)).toBe(true);
  });

  it('should check unknown supertype', () => {
    expect(checker.isSubtype(numberType, unknownType)).toBe(true);
  });

  it('should reject unrelated primitives', () => {
    expect(checker.isSubtype(numberType, stringType)).toBe(false);
  });

  it('should check union subtyping', () => {
    const union: TypeAnnotation = { kind: 'union', types: [numberType, stringType] };
    expect(checker.isSubtype(numberType, union)).toBe(true);
    expect(checker.isSubtype(union, numberType)).toBe(false);
  });

  it('should check intersection subtyping', () => {
    const intersection: TypeAnnotation = { kind: 'intersection', types: [numberType, stringType] };
    expect(checker.isSubtype(intersection, numberType)).toBe(true);
  });

  it('should check tuple subtyping to array', () => {
    const tuple: TypeAnnotation = { kind: 'tuple', elementTypes: [numberType, stringType] };
    const arr: TypeAnnotation = { kind: 'array', elementType: unknownType };
    expect(checker.isSubtype(tuple, arr)).toBe(true);
  });

  it('should check type equality', () => {
    const t1: TypeAnnotation = { kind: 'array', elementType: numberType };
    const t2: TypeAnnotation = { kind: 'array', elementType: numberType };
    expect(checker.equals(t1, t2)).toBe(true);
  });

  it('should check object structural equality', () => {
    const o1: TypeAnnotation = {
      kind: 'object',
      properties: { a: numberType, b: stringType },
    };
    const o2: TypeAnnotation = {
      kind: 'object',
      properties: { b: stringType, a: numberType },
    };
    expect(checker.equals(o1, o2)).toBe(true);
  });
});

describe('SoundnessValidator', () => {
  it('should return soundness proof', () => {
    const validator = new SoundnessValidator();
    const proof = validator.validateSoundness('x + 1', 'number');
    expect(proof.progress).toBe(true);
    expect(proof.preservation).toBe(true);
  });
});

describe('isConsistent', () => {
  it('should consider unknown consistent with anything', () => {
    const numberType: TypeAnnotation = { kind: 'primitive', name: 'number' };
    const unknownType: TypeAnnotation = { kind: 'unknown' };
    expect(isConsistent(numberType, unknownType)).toBe(true);
    expect(isConsistent(unknownType, numberType)).toBe(true);
  });

  it('should require equality for non-unknown types', () => {
    const numberType: TypeAnnotation = { kind: 'primitive', name: 'number' };
    const stringType: TypeAnnotation = { kind: 'primitive', name: 'string' };
    expect(isConsistent(numberType, stringType)).toBe(false);
  });
});

describe('RuntimeTypeChecker', () => {
  it('should pass for matching number type', () => {
    const numberType: TypeAnnotation = { kind: 'primitive', name: 'number' };
    expect(() => RuntimeTypeChecker.check<number>(42, numberType)).not.toThrow();
  });

  it('should throw for mismatched string type', () => {
    const stringType: TypeAnnotation = { kind: 'primitive', name: 'string' };
    expect(() => RuntimeTypeChecker.check<number>(42, stringType)).toThrow(TypeError);
  });

  it('should always pass for unknown type', () => {
    const unknownType: TypeAnnotation = { kind: 'unknown' };
    expect(() => RuntimeTypeChecker.check<any>(null, unknownType)).not.toThrow();
  });
});

describe('proveNumberAddition', () => {
  it('should return a proof string', () => {
    const proof = proveNumberAddition();
    expect(proof).toContain('定理');
    expect(proof).toContain('number');
  });
});

describe('proveLSP', () => {
  it('should return a proof string', () => {
    const proof = proveLSP();
    expect(proof).toContain('里氏替换原则');
    expect(proof).toContain('LSP');
  });
});
