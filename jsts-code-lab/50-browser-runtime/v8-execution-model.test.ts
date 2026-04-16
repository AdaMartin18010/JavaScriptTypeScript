import { describe, it, expect } from 'vitest';
import { HiddenClassTable, InlineCache, IsolateMemoryModel } from './v8-execution-model.js';

describe('HiddenClassTable', () => {
  it('registers shapes and resolves transitions', () => {
    const table = new HiddenClassTable();
    table.registerShape({ id: 's1', properties: [], transitions: new Map([['a', 's2']]) });
    expect(table.getShape('s1')?.properties).toEqual([]);
    expect(table.transition('s1', 'a')).toBe('s2');
    expect(table.transition('s1', 'b')).toBeUndefined();
  });
});

describe('InlineCache', () => {
  it('progresses through ic states', () => {
    const ic = new InlineCache();
    expect(ic.getState()).toBe('uninitialized');
    ic.feedback('shape-a', 0);
    expect(ic.getState()).toBe('monomorphic');
    ic.feedback('shape-b', 1);
    expect(ic.getState()).toBe('polymorphic');
    for (let i = 2; i < 6; i++) {
      ic.feedback(`shape-${i}`, i);
    }
    expect(ic.getState()).toBe('megamorphic');
  });

  it('looks up cached offsets', () => {
    const ic = new InlineCache();
    ic.feedback('shape-a', 3);
    expect(ic.lookup('shape-a')?.offset).toBe(3);
    expect(ic.lookup('shape-b')).toBeUndefined();
  });
});

describe('IsolateMemoryModel', () => {
  it('tracks allocation and scavenge', () => {
    const isolate = new IsolateMemoryModel();
    isolate.allocateObject(1000, 'new');
    isolate.allocateObject(2000, 'new');
    expect(isolate.getMemory().newSpaceSize).toBe(3000);
    isolate.scavenge();
    expect(isolate.getMemory().newSpaceSize).toBe(0);
    expect(isolate.getMemory().oldSpaceSize).toBe(300);
  });
});
