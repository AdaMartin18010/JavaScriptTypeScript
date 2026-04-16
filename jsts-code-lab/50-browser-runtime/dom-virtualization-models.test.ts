import { describe, it, expect } from 'vitest';
import { diff, IncrementalDOMCompiler, NativeDOMCostAnalyzer, type VNode } from './dom-virtualization-models.js';

describe('Virtual DOM diff', () => {
  it('returns CREATE when old is null', () => {
    const node: VNode = { tag: 'div', props: {}, children: [] };
    expect(diff(null, node)).toEqual({ type: 'CREATE', vnode: node });
  });

  it('returns REMOVE when new is null', () => {
    const node: VNode = { tag: 'div', props: {}, children: [] };
    expect(diff(node, null)).toEqual({ type: 'REMOVE' });
  });

  it('returns REPLACE for different tags', () => {
    const a: VNode = { tag: 'div', props: {}, children: [] };
    const b: VNode = { tag: 'span', props: {}, children: [] };
    expect(diff(a, b)).toEqual({ type: 'REPLACE', vnode: b });
  });

  it('returns UPDATE for same tag', () => {
    const a: VNode = { tag: 'div', props: { id: '1' }, children: [] };
    const b: VNode = { tag: 'div', props: { id: '2' }, children: [] };
    expect(diff(a, b)).toEqual({ type: 'UPDATE', props: { id: '2' } });
  });
});

describe('IncrementalDOMCompiler', () => {
  it('compiles a vnode to instructions', () => {
    const compiler = new IncrementalDOMCompiler();
    const node: VNode = { tag: 'div', props: { className: 'box' }, children: ['hi'] };
    const instructions = compiler.compile(node);
    expect(instructions[0].type).toBe('elementOpen');
    expect(instructions.some((i: any) => i.type === 'text' && i.value === 'hi')).toBe(true);
    expect(instructions[instructions.length - 1].type).toBe('elementClose');
  });
});

describe('NativeDOMCostAnalyzer', () => {
  it('estimates total DOM manipulation cost', () => {
    const analyzer = new NativeDOMCostAnalyzer();
    const total = analyzer.estimateTotal(10, 10, 5, 2);
    expect(total).toBe(10 * 0.5 + 10 * 0.3 + 5 * 0.2 + 2 * 0.4);
  });
});
