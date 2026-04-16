import { describe, it, expect } from 'vitest';
import {
  WordsCollection,
  TreeNode,
  InOrderIterator,
  SocialNetwork,
  AsyncDataSource
} from './iterator.js';

describe('iterator pattern', () => {
  it('ArrayIterator should traverse collection forward and backward', () => {
    const collection = new WordsCollection();
    collection.addItem('First');
    collection.addItem('Second');
    collection.addItem('Third');

    const iterator = collection.createIterator();
    const forward: string[] = [];
    while (iterator.hasNext()) {
      forward.push(iterator.next());
    }
    expect(forward).toEqual(['First', 'Second', 'Third']);

    const reverseIterator = collection.createReverseIterator();
    const backward: string[] = [];
    while (reverseIterator.hasNext()) {
      backward.push(reverseIterator.next());
    }
    expect(backward).toEqual(['Third', 'Second', 'First']);
  });

  it('ArrayIterator should support reset', () => {
    const collection = new WordsCollection();
    collection.addItem('A');

    const iterator = collection.createIterator();
    expect(iterator.next()).toBe('A');
    expect(iterator.hasNext()).toBe(false);

    iterator.reset();
    expect(iterator.hasNext()).toBe(true);
    expect(iterator.next()).toBe('A');
  });

  it('InOrderIterator should traverse binary tree in order', () => {
    const root = new TreeNode(4);
    root.left = new TreeNode(2);
    root.right = new TreeNode(6);
    root.left.left = new TreeNode(1);
    root.left.right = new TreeNode(3);
    root.right.left = new TreeNode(5);
    root.right.right = new TreeNode(7);

    const iterator = new InOrderIterator(root);
    const values: number[] = [];
    while (iterator.hasNext()) {
      values.push(iterator.next());
    }
    expect(values).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('SocialNetwork BFS iterator should visit nodes in breadth-first order', () => {
    const network = new SocialNetwork();
    network.addProfile('Alice', ['Bob', 'Carol']);
    network.addProfile('Bob', ['David', 'Eve']);
    network.addProfile('Carol', ['Frank']);
    network.addProfile('David', []);
    network.addProfile('Eve', []);
    network.addProfile('Frank', []);

    const bfsIterator = network.createBfsIterator('Alice');
    const visited: string[] = [];
    while (bfsIterator.hasNext()) {
      visited.push(bfsIterator.next());
    }
    expect(visited).toEqual(['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank']);
  });

  it('SocialNetwork should support built-in Symbol.iterator', () => {
    const network = new SocialNetwork();
    network.addProfile('Alice', ['Bob', 'Carol']);
    network.addProfile('Bob', ['David']);

    const friends: string[] = [];
    for (const friend of network) {
      friends.push(friend);
    }
    expect(friends).toEqual(['Bob', 'Carol', 'David']);
  });

  it('AsyncDataSource should yield async values', async () => {
    const source = new AsyncDataSource();
    const values: number[] = [];
    for await (const value of source) {
      values.push(value);
      if (values.length >= 3) break; // Only test first 3
    }
    expect(values).toEqual([0, 1, 2]);
  });
});
