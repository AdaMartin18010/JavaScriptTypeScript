import { describe, it, expect } from 'vitest';
import { TLAPlusLite, type PhilosopherSystem } from './tlaplus-lite.js';

describe('TLAPlusLite', () => {
  it('should verify dining philosophers invariants', () => {
    const spec = {
      name: 'DiningPhilosophers',
      variables: ['philosophers', 'forks'] as (keyof PhilosopherSystem)[],
      init: (s: PhilosopherSystem) => s.philosophers.every((p: PhilosopherSystem['philosophers'][number]) => p === 'thinking') && s.forks.every((f: PhilosopherSystem['forks'][number]) => f === 'clean'),
      next: (curr: PhilosopherSystem, next: PhilosopherSystem) => {
        const n = curr.philosophers.length;
        let changed = 0;
        for (let i = 0; i < n; i++) {
          if (curr.philosophers[i] !== next.philosophers[i]) changed++;
          if (curr.forks[i] !== next.forks[i]) changed++;
        }
        return changed <= 3;
      }
    };

    const checker = new TLAPlusLite(spec);
    const initial: PhilosopherSystem[] = [{
      philosophers: ['thinking', 'thinking'],
      forks: ['clean', 'clean']
    }];

    const inv = (s: PhilosopherSystem) => {
      for (let i = 0; i < s.philosophers.length; i++) {
        if (s.philosophers[i] === 'eating' && s.philosophers[(i + 1) % s.philosophers.length] === 'eating') return false;
      }
      return true;
    };

    function genStates(s: PhilosopherSystem): PhilosopherSystem[] {
      const n = s.philosophers.length;
      const r: PhilosopherSystem[] = [];
      for (let i = 0; i < n; i++) {
        if (s.philosophers[i] === 'thinking') {
          const ns = structuredClone(s);
          ns.philosophers[i] = 'hungry';
          r.push(ns);
        }
        if (s.philosophers[i] === 'hungry') {
          const left = i;
          const right = (i + 1) % n;
          if (s.forks[left] === 'clean' && s.forks[right] === 'clean') {
            const ns = structuredClone(s);
            ns.philosophers[i] = 'eating';
            ns.forks[left] = 'dirty';
            ns.forks[right] = 'dirty';
            r.push(ns);
          }
        }
        if (s.philosophers[i] === 'eating') {
          const ns = structuredClone(s);
          ns.philosophers[i] = 'thinking';
          ns.forks[i] = 'clean';
          ns.forks[(i + 1) % n] = 'clean';
          r.push(ns);
        }
      }
      return r;
    }

    const result = checker.checkInvariant(initial, inv, genStates, 6);
    expect(result.holds).toBe(true);
  });
});
