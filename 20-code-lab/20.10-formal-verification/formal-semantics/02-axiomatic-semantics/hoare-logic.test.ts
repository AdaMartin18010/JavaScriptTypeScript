import { describe, it, expect } from 'vitest'
import { AtomicPredicate, skip, assign, seq, hoareTriple, wp, tripleToString } from './hoare-logic.js'

describe('hoare-logic', () => {
  it('wp of skip is post', () => {
    const post = new AtomicPredicate('x > 0');
    expect(wp(skip, post).describe()).toBe('x > 0');
  });

  it('wp of assignment substitutes', () => {
    const post = new AtomicPredicate('x > 0');
    const cmd = assign('x', 'y + 1');
    expect(wp(cmd, post).describe()).toBe('(x > 0)[x/y + 1]');
  });

  it('wp of sequence composes', () => {
    const post = new AtomicPredicate('x > 0');
    const cmd = seq(assign('x', 'y'), assign('y', 'z'));
    expect(wp(cmd, post).describe()).toBe('((x > 0)[y/z])[x/y]');
  });

  it('formats triple', () => {
    const t = hoareTriple(new AtomicPredicate('true'), skip, new AtomicPredicate('true'));
    expect(tripleToString(t)).toContain('true');
  });
})
