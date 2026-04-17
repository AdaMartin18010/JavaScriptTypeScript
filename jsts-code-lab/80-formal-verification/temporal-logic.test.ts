import { describe, it, expect } from 'vitest';
import { atom, globally, finally_, next, until, LTLInterpreter } from './temporal-logic.js';

interface S { ok: boolean }

describe('TemporalLogic', () => {
  it('should evaluate G (Globally)', () => {
    const interp = new LTLInterpreter<S>();
    const trace: S[] = [{ ok: true }, { ok: true }, { ok: false }];
    expect(interp.evaluate(globally(atom<S>(s => s.ok)), trace)).toBe(false);
    expect(interp.evaluate(globally(atom<S>(s => s.ok)), [{ ok: true }, { ok: true }])).toBe(true);
  });

  it('should evaluate F (Finally)', () => {
    const interp = new LTLInterpreter<S>();
    const trace: S[] = [{ ok: false }, { ok: false }, { ok: true }];
    expect(interp.evaluate(finally_(atom<S>(s => s.ok)), trace)).toBe(true);
    expect(interp.evaluate(finally_(atom<S>(s => s.ok)), [{ ok: false }])).toBe(false);
  });

  it('should evaluate X (Next)', () => {
    const interp = new LTLInterpreter<S>();
    expect(interp.evaluate(next(atom<S>(s => s.ok)), [{ ok: false }, { ok: true }])).toBe(true);
  });

  it('should evaluate U (Until)', () => {
    const interp = new LTLInterpreter<S>();
    const trace: S[] = [{ ok: false }, { ok: false }, { ok: true }];
    expect(interp.evaluate(until(atom<S>(s => !s.ok), atom<S>(s => s.ok)), trace)).toBe(true);
  });
});
