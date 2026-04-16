import { describe, it, expect } from 'vitest'
import { var_, abs, app, betaReduce, termToString } from './untyped-lambda.js'

describe('untyped-lambda', () => {
  it('beta reduces identity application', () => {
    const identity = abs('x', var_('x'));
    const term = app(identity, var_('y'));
    const reduced = betaReduce(term);
    expect(termToString(reduced)).toBe('y');
  });

  it('beta reduces simple application', () => {
    const f = abs('x', app(var_('x'), var_('x')));
    const term = app(f, var_('y'));
    const reduced = betaReduce(term);
    expect(reduced.kind).toBe('app');
  });
})
