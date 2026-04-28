/**
 * @file 栈与队列测试
 * @description 测试 04-data-structures/custom/stack-queue.ts
 */

import { describe, it, expect } from 'vitest';
import {
  Stack,
  Queue,
  Deque,
  PriorityQueue,
  CircularQueue,
  isBalancedBrackets
} from '../../04-data-structures/custom/stack-queue.js';

describe('Stack', () => {
  it('should push and pop elements', () => {
    const stack = new Stack<number>();
    stack.push(1).push(2).push(3);
    
    expect(stack.size()).toBe(3);
    expect(stack.pop()).toBe(3);
    expect(stack.pop()).toBe(2);
    expect(stack.size()).toBe(1);
  });

  it('should peek at top element', () => {
    const stack = new Stack<string>();
    stack.push('a').push('b');
    
    expect(stack.peek()).toBe('b');
    expect(stack.size()).toBe(2); // peek doesn't remove
  });

  it('should check if empty', () => {
    const stack = new Stack<number>();
    expect(stack.isEmpty()).toBe(true);
    stack.push(1);
    expect(stack.isEmpty()).toBe(false);
  });
});

describe('Queue', () => {
  it('should enqueue and dequeue elements', () => {
    const queue = new Queue<number>();
    queue.enqueue(1).enqueue(2).enqueue(3);
    
    expect(queue.size()).toBe(3);
    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    expect(queue.size()).toBe(1);
  });

  it('should maintain FIFO order', () => {
    const queue = new Queue<string>();
    queue.enqueue('first').enqueue('second').enqueue('third');
    
    expect(queue.front()).toBe('first');
    expect(queue.rear()).toBe('third');
  });
});

describe('Deque', () => {
  it('should add and remove from both ends', () => {
    const deque = new Deque<number>();
    deque.addFront(1).addRear(2).addFront(0).addRear(3);
    
    expect([...deque]).toEqual([0, 1, 2, 3]);
    expect(deque.removeFront()).toBe(0);
    expect(deque.removeRear()).toBe(3);
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
});

describe('CircularQueue', () => {
  it('should handle circular behavior', () => {
    const cq = new CircularQueue<number>(3);
    expect(cq.enqueue(1)).toBe(true);
    expect(cq.enqueue(2)).toBe(true);
    expect(cq.enqueue(3)).toBe(true);
    expect(cq.enqueue(4)).toBe(false); // full
    
    expect(cq.dequeue()).toBe(1);
    expect(cq.enqueue(4)).toBe(true); // now can add
  });
});

describe('isBalancedBrackets', () => {
  it('should return true for balanced brackets', () => {
    expect(isBalancedBrackets('()')).toBe(true);
    expect(isBalancedBrackets('()[]{}')).toBe(true);
    expect(isBalancedBrackets('({[]})')).toBe(true);
    expect(isBalancedBrackets('')).toBe(true);
  });

  it('should return false for unbalanced brackets', () => {
    expect(isBalancedBrackets('(')).toBe(false);
    expect(isBalancedBrackets(')')).toBe(false);
    expect(isBalancedBrackets('({[})')).toBe(false);
    expect(isBalancedBrackets('((()))]')).toBe(false);
  });
});
