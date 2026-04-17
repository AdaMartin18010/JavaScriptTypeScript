import { describe, it, expect } from 'vitest';
import { LinkedList, DoublyLinkedList, ListNode, reverseLinkedList, hasCycle, demo } from './linked-list.js';

describe('linked-list', () => {
  describe('LinkedList', () => {
    it('should append and prepend elements', () => {
      const list = new LinkedList<number>();
      list.append(1).append(2).prepend(0);
      expect(list.toArray()).toEqual([0, 1, 2]);
      expect(list.size).toBe(3);
    });

    it('should find elements by predicate', () => {
      const list = new LinkedList<number>();
      list.append(1).append(2).append(3);
      expect(list.find(x => x === 2)).toBe(2);
      expect(list.find(x => x === 99)).toBeUndefined();
    });

    it('should delete elements', () => {
      const list = new LinkedList<number>();
      list.append(1).append(2).append(3);
      expect(list.delete(2)).toBe(true);
      expect(list.toArray()).toEqual([1, 3]);
      expect(list.delete(99)).toBe(false);
    });

    it('should be iterable', () => {
      const list = new LinkedList<string>();
      list.append('a').append('b');
      expect([...list]).toEqual(['a', 'b']);
    });
  });

  describe('DoublyLinkedList', () => {
    it('should support reverse iteration', () => {
      const list = new DoublyLinkedList<string>();
      list.append('a').append('b').append('c');
      expect([...list.reverse()]).toEqual(['c', 'b', 'a']);
    });

    it('should prepend elements', () => {
      const list = new DoublyLinkedList<number>();
      list.append(1).prepend(0);
      expect([...list]).toEqual([0, 1]);
      expect(list.size).toBe(2);
    });
  });

  describe('reverseLinkedList', () => {
    it('should reverse a linked list', () => {
      const head = new ListNode(1);
      head.next = new ListNode(2);
      head.next.next = new ListNode(3);
      const reversed = reverseLinkedList(head);
      expect(reversed?.value).toBe(3);
      expect(reversed?.next?.value).toBe(2);
      expect(reversed?.next?.next?.value).toBe(1);
    });

    it('should handle null input', () => {
      expect(reverseLinkedList(null)).toBeNull();
    });
  });

  describe('hasCycle', () => {
    it('should detect cycle', () => {
      const head = new ListNode(1);
      head.next = new ListNode(2);
      head.next.next = new ListNode(3);
      head.next.next.next = head.next; // cycle
      expect(hasCycle(head)).toBe(true);
    });

    it('should return false for acyclic list', () => {
      const head = new ListNode(1);
      head.next = new ListNode(2);
      expect(hasCycle(head)).toBe(false);
    });
  });

  describe('demo', () => {
    it('should run without errors', () => {
      expect(() => { demo(); }).not.toThrow();
    });
  });
});
