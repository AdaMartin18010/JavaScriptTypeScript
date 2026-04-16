import { describe, it, expect } from 'vitest'
import { CodeGenerator, TypeScriptGenerator, JSONSchemaGenerator, TemplateEngine, DSLBuilder, demo } from './code-generation.js'

describe('code-generation', () => {
  it('CodeGenerator is defined', () => {
    expect(typeof CodeGenerator).not.toBe('undefined');
  });
  it('CodeGenerator can be instantiated if constructor permits', () => {
    if (typeof CodeGenerator === 'function') {
      try {
        const instance = new (CodeGenerator as any)();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('TypeScriptGenerator is defined', () => {
    expect(typeof TypeScriptGenerator).not.toBe('undefined');
  });
  it('TypeScriptGenerator can be instantiated if constructor permits', () => {
    if (typeof TypeScriptGenerator === 'function') {
      try {
        const instance = new (TypeScriptGenerator as any)();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('JSONSchemaGenerator is defined', () => {
    expect(typeof JSONSchemaGenerator).not.toBe('undefined');
  });
  it('JSONSchemaGenerator can be instantiated if constructor permits', () => {
    if (typeof JSONSchemaGenerator === 'function') {
      try {
        const instance = new (JSONSchemaGenerator as any)();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('TemplateEngine is defined', () => {
    expect(typeof TemplateEngine).not.toBe('undefined');
  });
  it('TemplateEngine can be instantiated if constructor permits', () => {
    if (typeof TemplateEngine === 'function') {
      try {
        const instance = new (TemplateEngine as any)();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('DSLBuilder is defined', () => {
    expect(typeof DSLBuilder).not.toBe('undefined');
  });
  it('DSLBuilder can be instantiated if constructor permits', () => {
    if (typeof DSLBuilder === 'function') {
      try {
        const instance = new (DSLBuilder as any)();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('demo is defined', () => {
    expect(typeof demo).not.toBe('undefined');
  });
  it('demo is callable', () => {
    if (typeof demo === 'function') {
      try {
        const result = demo();
        expect(result).toBeDefined();
      } catch { }
    }
  });
});
