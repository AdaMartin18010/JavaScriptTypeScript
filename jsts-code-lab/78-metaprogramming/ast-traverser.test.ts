import { describe, it, expect } from 'vitest'
import { ASTTraverser } from './ast-traverser.js'

describe('ast-traverser', () => {
  it('ASTTraverser is defined', () => {
    expect(typeof ASTTraverser).not.toBe('undefined');
  });

  it('parses primitive value', () => {
    const traverser = new ASTTraverser();
    const node = traverser.parse(42);
    expect(node.type).toBe('number');
    expect(node.value).toBe(42);
    expect(node.children).toEqual([]);
  });

  it('parses object with nested properties', () => {
    const traverser = new ASTTraverser();
    const node = traverser.parse({ name: 'test', age: 30 });
    expect(node.type).toBe('object');
    expect(node.children.length).toBe(2);
    expect(node.children[0].key).toBe('name');
    expect(node.children[1].key).toBe('age');
  });

  it('parses array with items', () => {
    const traverser = new ASTTraverser();
    const node = traverser.parse([1, 2, 3]);
    expect(node.type).toBe('array');
    expect(node.children.length).toBe(3);
    expect(node.children[0].value).toBe(1);
  });

  it('traverse visits all nodes', () => {
    const traverser = new ASTTraverser();
    const node = traverser.parse({ a: 1, b: { c: 2 } });
    let count = 0;
    traverser.traverse(node, {
      enter: () => { count++; }
    });
    expect(count).toBe(4);
  });

  it('find returns matching nodes', () => {
    const traverser = new ASTTraverser();
    const node = traverser.parse({ a: 1, b: 2, c: 3 });
    const results = traverser.find(node, n => n.type === 'number');
    expect(results.length).toBe(3);
  });

  it('findOne returns first match', () => {
    const traverser = new ASTTraverser();
    const node = traverser.parse({ a: 1, b: 2 });
    const result = traverser.findOne(node, n => n.key === 'b');
    expect(result).toBeDefined();
    expect(result!.value).toBe(2);
  });

  it('transform transforms values', () => {
    const traverser = new ASTTraverser();
    const result = traverser.transform({ a: 1, b: 2 }, (node) => {
      if (node.type === 'number') return (node.value as number) * 10;
      return node.value;
    });
    expect(result).toEqual({ a: 10, b: 20 });
  });

  it('getLeaves returns only leaf nodes', () => {
    const traverser = new ASTTraverser();
    const node = traverser.parse({ a: 1, b: { c: 2 } });
    const leaves = traverser.getLeaves(node);
    expect(leaves.length).toBe(2);
    expect(leaves.map(l => l.value)).toContain(1);
    expect(leaves.map(l => l.value)).toContain(2);
  });

  it('getDepth returns correct depth', () => {
    const traverser = new ASTTraverser();
    const node = traverser.parse({ a: { b: { c: 1 } } });
    const deepNode = traverser.findOne(node, n => n.key === 'c');
    expect(deepNode).toBeDefined();
    expect(traverser.getDepth(deepNode!)).toBe(3);
  });
});
