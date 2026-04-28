import { describe, it, expect } from 'vitest';
import { pointsTo, sepConj, emp, pure, allocateHeap, verifySeparation } from './separation-logic.js';

describe('SeparationLogic', () => {
  it('should verify points-to and emp', () => {
    const heap = new Map<number, number>();
    heap.set(10, 100);
    expect(pointsTo(10, 100).holds(heap)).toBe(true);
    expect(emp.holds(new Map())).toBe(true);
  });

  it('should verify separating conjunction', () => {
    const heap = new Map<number, number>([[10, 100], [20, 200]]);
    const assertion = sepConj(pointsTo(10, 100), pointsTo(20, 200));
    expect(assertion.holds(heap)).toBe(true);
  });

  it('should verify frame rule example', () => {
    const heap = new Map<number, number>([[10, 100], [20, 200]]);
    const triple = {
      pre: sepConj(pointsTo(10, 100), pointsTo(20, 200)),
      command: (h: Map<number, number>) => {
        const n = new Map(h);
        n.set(10, 150);
        return n;
      },
      post: sepConj(pointsTo(10, 150), pointsTo(20, 200))
    };
    expect(verifySeparation(triple, heap)).toBe(true);
  });
});
