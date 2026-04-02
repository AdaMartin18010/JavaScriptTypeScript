import { describe, it, expect } from 'vitest';
import { BoundedModelChecker, type TransitionSystem } from './bounded-model-checking.js';

type State = { p1: 'idle' | 'critical'; p2: 'idle' | 'critical' };

const mutexSystem: TransitionSystem<State> = {
  name: 'Mutex',
  initial: s => s.p1 === 'idle' && s.p2 === 'idle',
  transition: (curr, next) => {
    const changes = (curr.p1 !== next.p1 ? 1 : 0) + (curr.p2 !== next.p2 ? 1 : 0);
    return changes <= 1;
  }
};

function generateStates(s: State): State[] {
  const r: State[] = [];
  if (s.p1 === 'idle') r.push({ ...s, p1: 'critical' });
  if (s.p1 === 'critical') r.push({ ...s, p1: 'idle' });
  if (s.p2 === 'idle') r.push({ ...s, p2: 'critical' });
  if (s.p2 === 'critical') r.push({ ...s, p2: 'idle' });
  return r;
}

describe('BoundedModelChecking', () => {
  it('should verify mutual exclusion safety', () => {
    const bmc = new BoundedModelChecker(mutexSystem);
    const result = bmc.checkSafety([{ p1: 'idle', p2: 'idle' }], generateStates, s => !(s.p1 === 'critical' && s.p2 === 'critical'), 4);
    expect(result.holds).toBe(true);
  });
});
