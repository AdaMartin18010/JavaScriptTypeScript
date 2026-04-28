import { describe, it, expect } from 'vitest';
import { BoundedModelChecker, type TransitionSystem } from './bounded-model-checking.js';

type ProcessState = 'idle' | 'waiting' | 'critical';
interface State { p1: ProcessState; p2: ProcessState }

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
  if (s.p1 === 'idle') r.push({ ...s, p1: 'waiting' });
  if (s.p1 === 'waiting' && s.p2 !== 'critical') r.push({ ...s, p1: 'critical' });
  if (s.p1 === 'critical') r.push({ ...s, p1: 'idle' });
  if (s.p2 === 'idle') r.push({ ...s, p2: 'waiting' });
  if (s.p2 === 'waiting' && s.p1 !== 'critical') r.push({ ...s, p2: 'critical' });
  if (s.p2 === 'critical') r.push({ ...s, p2: 'idle' });
  return r;
}

describe('BoundedModelChecking', () => {
  it('should verify mutual exclusion safety', () => {
    const bmc = new BoundedModelChecker(mutexSystem);
    const result = bmc.checkSafety([{ p1: 'idle', p2: 'idle' }], generateStates, s => !(s.p1 === 'critical' && s.p2 === 'critical'), 6);
    expect(result.holds).toBe(true);
  });

  it('should find counterexample in broken system', () => {
    const brokenSystem: TransitionSystem<State> = {
      name: 'BrokenMutex',
      initial: s => s.p1 === 'idle' && s.p2 === 'idle',
      transition: () => true
    };
    function generateBrokenStates(s: State): State[] {
      const r: State[] = [];
      (['idle', 'waiting', 'critical'] as ProcessState[]).forEach(p1 => {
        (['idle', 'waiting', 'critical'] as ProcessState[]).forEach(p2 => {
          if (s.p1 !== p1 || s.p2 !== p2) {
            r.push({ p1, p2 });
          }
        });
      });
      return r;
    }
    const bmc = new BoundedModelChecker(brokenSystem);
    const result = bmc.checkSafety([{ p1: 'idle', p2: 'idle' }], generateBrokenStates, s => !(s.p1 === 'critical' && s.p2 === 'critical'), 3);
    expect(result.holds).toBe(false);
    expect(result.counterexample).toBeDefined();
  });
});
