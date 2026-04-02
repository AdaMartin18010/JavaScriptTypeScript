import { describe, it, expect } from 'vitest';
import {
  emp,
  pointsTo,
  sepConj,
  pure,
  listSeg,
  assertHeap,
  checkNoLeaks,
  type Heap,
  type ListNode
} from './separation-logic.js';

describe('separation-logic', () => {
  describe('emp', () => {
    it('should hold on empty heap', () => {
      expect(assertHeap({}, emp())).toBe(true);
    });

    it('should not hold on non-empty heap', () => {
      expect(assertHeap({ x: 1 }, emp())).toBe(false);
    });
  });

  describe('pointsTo', () => {
    it('should hold when address maps to exact value', () => {
      expect(assertHeap({ x: 42 }, pointsTo('x', 42))).toBe(true);
    });

    it('should fail when value differs', () => {
      expect(assertHeap({ x: 42 }, pointsTo('x', 99))).toBe(false);
    });

    it('should fail when heap has extra addresses', () => {
      expect(assertHeap({ x: 42, y: 1 }, pointsTo('x', 42))).toBe(false);
    });
  });

  describe('separating conjunction', () => {
    it('should hold for disjoint points-to', () => {
      const heap: Heap = { x: 1, y: 2 };
      const assertion = sepConj(pointsTo('x', 1), pointsTo('y', 2));
      expect(assertHeap(heap, assertion)).toBe(true);
    });

    it('should fail when heap has extra cells', () => {
      const heap: Heap = { x: 1, y: 2, z: 3 };
      const assertion = sepConj(pointsTo('x', 1), pointsTo('y', 2));
      expect(assertHeap(heap, assertion)).toBe(false);
    });
  });

  describe('pure assertions', () => {
    it('should only hold when predicate is true and domain empty', () => {
      expect(assertHeap({}, pure(() => true))).toBe(true);
      expect(assertHeap({}, pure(() => false))).toBe(false);
      expect(assertHeap({ x: 1 }, pure(() => true))).toBe(false);
    });
  });

  describe('list segment', () => {
    it('should hold for complete linked list', () => {
      const heap: Heap = {
        a: { value: 1, next: 'b' } as ListNode,
        b: { value: 2, next: 'c' } as ListNode,
        c: { value: 3, next: null } as ListNode
      };
      expect(assertHeap(heap, listSeg('a', null))).toBe(true);
    });

    it('should hold for partial list segment combined with remaining list', () => {
      const heap: Heap = {
        a: { value: 1, next: 'b' } as ListNode,
        b: { value: 2, next: 'c' } as ListNode,
        c: { value: 3, next: null } as ListNode
      };
      // In separation logic, a partial segment must be combined with the rest via * to cover the whole heap
      expect(assertHeap(heap, sepConj(listSeg('a', 'b'), listSeg('b', null)))).toBe(true);
    });

    it('should fail for raw partial list segment on full heap', () => {
      const heap: Heap = {
        a: { value: 1, next: 'b' } as ListNode,
        b: { value: 2, next: 'c' } as ListNode,
        c: { value: 3, next: null } as ListNode
      };
      expect(assertHeap(heap, listSeg('a', 'b'))).toBe(false);
    });

    it('should fail when domain does not match exactly', () => {
      const heap: Heap = {
        a: { value: 1, next: 'b' } as ListNode,
        b: { value: 2, next: 'c' } as ListNode,
        c: { value: 3, next: null } as ListNode,
        orphan: { value: 99, next: null } as ListNode
      };
      expect(assertHeap(heap, listSeg('a', null))).toBe(false);
    });

    it('should fail for cyclic structure', () => {
      const heap: Heap = {
        a: { value: 1, next: 'b' } as ListNode,
        b: { value: 2, next: 'a' } as ListNode
      };
      expect(assertHeap(heap, listSeg('a', null))).toBe(false);
    });
  });

  describe('memory leak detection', () => {
    it('should report no leaks for fully reachable heap', () => {
      const heap: Heap = {
        a: { value: 1, next: 'b' } as ListNode,
        b: { value: 2, next: null } as ListNode
      };
      expect(checkNoLeaks(heap, ['a'])).toBe(true);
    });

    it('should detect orphan node as leak', () => {
      const heap: Heap = {
        a: { value: 1, next: 'b' } as ListNode,
        b: { value: 2, next: null } as ListNode,
        orphan: { value: 99, next: null } as ListNode
      };
      expect(checkNoLeaks(heap, ['a'])).toBe(false);
    });
  });
});
