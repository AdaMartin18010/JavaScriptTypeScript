import { describe, it, expect } from 'vitest';

// Import all modules for integration testing
import { HoareVerifier, type Env, type Assertion, type Invariant } from './hoare-logic.js';
import {
  assertHeap,
  checkNoLeaks,
  emp,
  pointsTo,
  sepConj,
  listSeg,
  type Heap,
  type ListNode
} from './separation-logic.js';
import { TCPStates, tcpReducer } from './type-safe-state-machine.js';
import { LTLModelChecker, LTL, requestResponseFSM } from './temporal-logic.js';
import { WPCalculator, StmtBuilder } from './weakest-precondition.js';
import { BMCChecker, mutexBMCSystem } from './bounded-model-checking.js';
import {
  always,
  leadsTo,
  generateMutexBehavior,
  generateBadMutexBehavior
} from './tla-plus-patterns.js';
import type { TLAState } from './tla-plus-patterns.js';
import { generateArraySortProblem } from './z3-smt-bridge.js';

describe('formal-verification integration', () => {
  it('Hoare triple verification should pass for classic sum loop', () => {
    const verifier = new HoareVerifier();
    const init: Env = { n: 5, i: 0, sum: 0 };
    const condition = (e: Env) => e['i']! < e['n']!;
    const body = (e: Env) => ({
      ...e,
      i: e['i']! + 1,
      sum: e['sum']! + e['i']! + 1
    });
    const invariants: Invariant[] = [
      { name: 'i-range', check: e => e['i']! >= 0 && e['i']! <= e['n']! },
      { name: 'sum-formula', check: e => e['sum']! === (e['i']! * (e['i']! + 1)) / 2 }
    ];
    const post: Assertion[] = [
      e => e['sum']! === (e['n']! * (e['n']! + 1)) / 2
    ];

    const result = verifier.verifyLoop(init, condition, body, invariants, post);
    expect(result.valid).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it('Hoare triple verification should pass for variable swap', () => {
    const verifier = new HoareVerifier();
    const env: Env = { x: 5, y: 3 };
    const pre: Assertion[] = [
      e => e['x'] !== undefined && e['y'] !== undefined
    ];
    const post: Assertion[] = [
      e => e['x'] === 3 && e['y'] === 5
    ];
    const { result } = verifier.verifyCommand(env, pre, e => {
      const t = e['x']!;
      return { ...e, x: e['y']!, y: t };
    }, post);

    expect(result.valid).toBe(true);
  });

  it('separation logic assertions should hold on valid heap', () => {
    const heap: Heap = { x: 42 };
    expect(assertHeap(heap, pointsTo('x', 42))).toBe(true);

    const heap2: Heap = { a: 1, b: 2 };
    expect(assertHeap(heap2, sepConj(pointsTo('a', 1), pointsTo('b', 2)))).toBe(true);
  });

  it('separation logic should detect no memory leaks in valid linked list', () => {
    const heap: Heap = {
      a: { value: 1, next: 'b' } as ListNode,
      b: { value: 2, next: 'c' } as ListNode,
      c: { value: 3, next: null } as ListNode
    };
    expect(assertHeap(heap, listSeg('a', null))).toBe(true);
    expect(checkNoLeaks(heap, ['a'])).toBe(true);
  });

  it('type-safe state machine should compile and execute valid TCP transitions', () => {
    let state = tcpReducer(TCPStates.closed(), { type: 'ACTIVE_OPEN' });
    expect(state.tag).toBe('SYN_SENT');

    state = tcpReducer(state, { type: 'SYN_ACK' });
    expect(state.tag).toBe('ESTABLISHED');

    state = tcpReducer(state, { type: 'CLOSE' });
    expect(state.tag).toBe('FIN_WAIT_1');

    state = tcpReducer(state, { type: 'ACK' });
    expect(state.tag).toBe('FIN_WAIT_2');

    state = tcpReducer(state, { type: 'TIMEOUT' });
    expect(state.tag).toBe('TIME_WAIT');

    state = tcpReducer(state, { type: 'TIMEOUT' });
    expect(state.tag).toBe('CLOSED');
  });

  it('LTL formula should hold on example request-response state machine', () => {
    const fsm = requestResponseFSM();
    const checker = new LTLModelChecker(fsm, 6);

    // Safety: never error
    const safety = LTL.G(LTL.atom(s => s !== 'error'));
    expect(checker.check(safety).holds).toBe(true);

    // Liveness: eventually response
    const liveness = LTL.F(LTL.atom(s => s === 'response'));
    expect(checker.check(liveness).holds).toBe(true);
  });

  it('weakest precondition should compute correct precondition for assignment sequence', () => {
    const wp = new WPCalculator();
    const stmt = StmtBuilder.seq(
      StmtBuilder.assign('x', s => s['x'] + 1),
      StmtBuilder.assign('y', s => s['x'] * 2)
    );
    const post = (s: Env) => s['y'] > 10;
    const result = wp.compute(stmt, post);

    expect(result.predicate({ x: 5 })).toBe(true);
    expect(result.predicate({ x: 4 })).toBe(false);
    expect(result.verification.passed).toBe(true);
  });

  it('BMC should verify safety of correct mutex system', () => {
    const system = mutexBMCSystem();
    const checker = new BMCChecker(system);
    const safety = (s: Record<string, unknown>) => !(s['p1'] === 'cs' && s['p2'] === 'cs');
    const result = checker.check(safety, 5);
    expect(result.counterexampleFound).toBe(false);
  });

  it('TLA+ patterns should verify mutual exclusion on good behavior and detect violation on bad', () => {
    const good = generateMutexBehavior();
    const bad = generateBadMutexBehavior();
    const mutex = always((s: TLAState) => !(s['pc1'] === 'cs' && s['pc2'] === 'cs'));

    expect(mutex(good)).toBe(true);
    expect(mutex(bad)).toBe(false);

    const liveness = leadsTo(
      (s: TLAState) => s['pc1'] === 'wait',
      (s: TLAState) => s['pc1'] === 'cs'
    );
    expect(liveness(good)).toBe(true);
  });

  it('SMT bridge should generate valid array sort problem', () => {
    const problem = generateArraySortProblem();
    const smtlib = problem.toSMTLIB();
    expect(smtlib).toContain('(set-logic QF_LIA)');
    expect(smtlib).toContain('(check-sat)');
    expect(smtlib).toContain('(assert (<= a0 a1))');
    expect(problem.getVariables().length).toBe(3);
    expect(problem.getAssertions().length).toBe(2);
  });
});
