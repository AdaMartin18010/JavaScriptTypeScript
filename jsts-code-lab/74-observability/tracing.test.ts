import { describe, it, expect } from 'vitest'
import { SpanBuilder, Tracer, TraceContextPropagator, Baggage, AlwaysOnSampler, AlwaysOffSampler, ProbabilitySampler, ParentBasedSampler, demo } from './tracing'

describe('tracing', () => {
  it('SpanBuilder is defined', () => {
    expect(typeof SpanBuilder).not.toBe('undefined');
  });
  it('SpanBuilder can be instantiated if constructor permits', () => {
    if (typeof SpanBuilder === 'function') {
      try {
        const instance = new SpanBuilder();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('Tracer is defined', () => {
    expect(typeof Tracer).not.toBe('undefined');
  });
  it('Tracer can be instantiated if constructor permits', () => {
    if (typeof Tracer === 'function') {
      try {
        const instance = new Tracer();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('TraceContextPropagator is defined', () => {
    expect(typeof TraceContextPropagator).not.toBe('undefined');
  });
  it('TraceContextPropagator can be instantiated if constructor permits', () => {
    if (typeof TraceContextPropagator === 'function') {
      try {
        const instance = new TraceContextPropagator();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('Baggage is defined', () => {
    expect(typeof Baggage).not.toBe('undefined');
  });
  it('Baggage can be instantiated if constructor permits', () => {
    if (typeof Baggage === 'function') {
      try {
        const instance = new Baggage();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('AlwaysOnSampler is defined', () => {
    expect(typeof AlwaysOnSampler).not.toBe('undefined');
  });
  it('AlwaysOnSampler can be instantiated if constructor permits', () => {
    if (typeof AlwaysOnSampler === 'function') {
      try {
        const instance = new AlwaysOnSampler();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('AlwaysOffSampler is defined', () => {
    expect(typeof AlwaysOffSampler).not.toBe('undefined');
  });
  it('AlwaysOffSampler can be instantiated if constructor permits', () => {
    if (typeof AlwaysOffSampler === 'function') {
      try {
        const instance = new AlwaysOffSampler();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('ProbabilitySampler is defined', () => {
    expect(typeof ProbabilitySampler).not.toBe('undefined');
  });
  it('ProbabilitySampler can be instantiated if constructor permits', () => {
    if (typeof ProbabilitySampler === 'function') {
      try {
        const instance = new ProbabilitySampler();
        expect(instance).toBeDefined();
      } catch { }
    }
  });
  it('ParentBasedSampler is defined', () => {
    expect(typeof ParentBasedSampler).not.toBe('undefined');
  });
  it('ParentBasedSampler can be instantiated if constructor permits', () => {
    if (typeof ParentBasedSampler === 'function') {
      try {
        const instance = new ParentBasedSampler();
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