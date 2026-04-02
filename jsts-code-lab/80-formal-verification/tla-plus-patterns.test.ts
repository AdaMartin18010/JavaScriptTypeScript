import { describe, it, expect } from 'vitest';
import {
  always,
  eventually,
  until,
  leadsTo,
  checkNext,
  primedEquals,
  generateMutexBehavior,
  generateBadMutexBehavior,
  generateStarvationBehavior
} from './tla-plus-patterns.js';
import type { TLAState, Behavior } from './tla-plus-patterns.js';

describe('tla-plus-patterns', () => {
  describe('temporal operators', () => {
    const behavior: Behavior = [
      { x: 0 },
      { x: 1 },
      { x: 2 }
    ];

    it('always should hold when predicate is true for all states', () => {
      expect(always((s: TLAState) => (s['x'] as number) >= 0)(behavior)).toBe(true);
    });

    it('always should fail when predicate is false for some state', () => {
      expect(always((s: TLAState) => (s['x'] as number) > 0)(behavior)).toBe(false);
    });

    it('eventually should hold when predicate is true for some future state', () => {
      expect(eventually((s: TLAState) => (s['x'] as number) === 2)(behavior)).toBe(true);
    });

    it('eventually should fail when predicate is never true', () => {
      expect(eventually((s: TLAState) => (s['x'] as number) === 99)(behavior)).toBe(false);
    });

    it('until should hold when left holds until right becomes true', () => {
      const prop = until(
        (s: TLAState) => (s['x'] as number) < 2,
        (s: TLAState) => (s['x'] as number) === 2
      );
      expect(prop(behavior)).toBe(true);
    });

    it('until should fail when left becomes false before right', () => {
      const prop = until(
        (s: TLAState) => (s['x'] as number) < 1,
        (s: TLAState) => (s['x'] as number) === 2
      );
      expect(prop(behavior)).toBe(false);
    });

    it('leadsTo should hold when P is followed by Q', () => {
      const prop = leadsTo(
        (s: TLAState) => (s['x'] as number) === 0,
        (s: TLAState) => (s['x'] as number) === 2
      );
      expect(prop(behavior)).toBe(true);
    });

    it('leadsTo should fail when P is never followed by Q', () => {
      const badBehavior: Behavior = [
        { x: 0 },
        { x: 1 },
        { x: 1 }
      ];
      const prop = leadsTo(
        (s: TLAState) => (s['x'] as number) === 0,
        (s: TLAState) => (s['x'] as number) === 2
      );
      expect(prop(badBehavior)).toBe(false);
    });
  });

  describe('action checking', () => {
    it('checkNext should verify all transitions satisfy action', () => {
      const behavior: Behavior = [{ x: 0 }, { x: 1 }, { x: 2 }];
      const action = primedEquals('x', s => (s['x'] as number) + 1);
      expect(checkNext(behavior, action)).toBe(true);
    });

    it('checkNext should detect invalid transition', () => {
      const behavior: Behavior = [{ x: 0 }, { x: 1 }, { x: 3 }];
      const action = primedEquals('x', s => (s['x'] as number) + 1);
      expect(checkNext(behavior, action)).toBe(false);
    });
  });

  describe('mutex examples', () => {
    it('good mutex behavior should satisfy mutual exclusion', () => {
      const behavior = generateMutexBehavior();
      const mutex = always((s: TLAState) => !(s['pc1'] === 'cs' && s['pc2'] === 'cs'));
      expect(mutex(behavior)).toBe(true);
    });

    it('bad mutex behavior should violate mutual exclusion', () => {
      const behavior = generateBadMutexBehavior();
      const mutex = always((s: TLAState) => !(s['pc1'] === 'cs' && s['pc2'] === 'cs'));
      expect(mutex(behavior)).toBe(false);
    });

    it('starvation behavior should violate liveness', () => {
      const behavior = generateStarvationBehavior();
      const live = leadsTo(
        (s: TLAState) => s['pc1'] === 'wait',
        (s: TLAState) => s['pc1'] === 'cs'
      );
      expect(live(behavior)).toBe(false);
    });
  });
});
