import { describe, it, expect } from 'vitest';
import {
  Stack,
  Queue,
  Deque,
  PriorityQueue,
  CircularQueue,
  isBalancedBrackets,
  demo
} from './stack-queue';

describe('stack-queue', () => {
  describe('Stack', () => {
    it('should follow LIFO order', () => {
      const stack = new Stack<number>();
      stack.push(1).push(2).push(3);
      expect(stack.pop()).toBe(3);
      expect(stack.peek()).toBe(2);
      expect(stack.size()).toBe(2);
      expect(stack.toArray()).toEqual([1, 2]);
    });

    it('should clear all items', () => {
      const stack = new Stack<number>();
      stack.push(1).push(2);
      stack.clear();
      expect(stack.isEmpty()).toBe(true);
    });
  });

  describe('Queue', () => {
    it('should follow FIFO order', () => {
      const queue = new Queue<string>();
      queue.enqueue('a').enqueue('b').enqueue('c');
      expect(queue.dequeue()).toBe('a');
      expect(queue.front()).toBe('b');
      expect(queue.rear()).toBe('c');
      expect(queue.size()).toBe(2);
    });
  });

  describe('Deque', () => {
    it('should support operations on both ends', () => {
      const deque = new Deque<number>();
      deque.addFront(1).addRear(2).addFront(0);
      expect([...deque]).toEqual([0, 1, 2]);
      expect(deque.removeFront()).toBe(0);
      expect(deque.removeRear()).toBe(2);
      expect(deque.peekFront()).toBe(1);
      expect(deque.peekRear()).toBe(1);
    });
  });

  describe('PriorityQueue', () => {
    it('should dequeue by priority', () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue('low', 3);
      pq.enqueue('high', 1);
      pq.enqueue('medium', 2);
      expect(pq.dequeue()).toBe('high');
      expect(pq.dequeue()).toBe('medium');
      expect(pq.dequeue()).toBe('low');
    });

    it('should peek highest priority', () => {
      const pq = new PriorityQueue<number>();
      pq.enqueue(10, 2);
      pq.enqueue(5, 1);
      expect(pq.peek()).toBe(5);
      expect(pq.size()).toBe(2);
    });
  });

  describe('CircularQueue', () => {
    it('should enqueue and dequeue with fixed capacity', () => {
      const cq = new CircularQueue<number>(3);
      expect(cq.enqueue(1)).toBe(true);
      expect(cq.enqueue(2)).toBe(true);
      expect(cq.enqueue(3)).toBe(true);
      expect(cq.enqueue(4)).toBe(false);
      expect(cq.dequeue()).toBe(1);
      expect(cq.enqueue(4)).toBe(true);
      expect(cq.peek()).toBe(2);
      expect(cq.size()).toBe(3);
    });
  });

  describe('isBalancedBrackets', () => {
    it('should return true for balanced brackets', () => {
      expect(isBalancedBrackets('()')).toBe(true);
      expect(isBalancedBrackets('([])')).toBe(true);
      expect(isBalancedBrackets('{[()]}')).toBe(true);
    });

    it('should return false for unbalanced brackets', () => {
      expect(isBalancedBrackets('([)]')).toBe(false);
      expect(isBalancedBrackets('(')).toBe(false);
      expect(isBalancedBrackets(')')).toBe(false);
    });
  });

  describe('demo', () => {
    it('should run without errors', () => {
      expect(() => demo()).not.toThrow();
    });
  });
});
