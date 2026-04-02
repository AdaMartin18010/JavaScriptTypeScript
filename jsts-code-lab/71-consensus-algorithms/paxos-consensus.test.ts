/**
 * @file Multi-Paxos 单元测试
 * @description 测试 Prepare/Promise/Accept/Learn 完整流程
 */

import { describe, it, expect } from 'vitest';
import { MultiPaxosCluster, Acceptor, Learner, Proposer } from './paxos-consensus.js';

describe('MultiPaxosCluster', () => {
  it('should choose a value through Basic Paxos', () => {
    const cluster = new MultiPaxosCluster();
    cluster.addAcceptor(new Acceptor('a1'));
    cluster.addAcceptor(new Acceptor('a2'));
    cluster.addAcceptor(new Acceptor('a3'));
    cluster.addLearner(new Learner('l1'));

    const proposer = new Proposer('p1', 1);
    cluster.addProposer(proposer);

    const ok = cluster.runBasicPaxos(proposer, 'value-X');
    expect(ok).toBe(true);
    expect(cluster.getChosenValue()).toBe('value-X');
  });

  it('should reuse already chosen value when conflicting proposal arrives', () => {
    const cluster = new MultiPaxosCluster();
    cluster.addAcceptor(new Acceptor('a1'));
    cluster.addAcceptor(new Acceptor('a2'));
    cluster.addAcceptor(new Acceptor('a3'));
    cluster.addLearner(new Learner('l1'));

    const p1 = new Proposer('p1', 1);
    const p2 = new Proposer('p2', 2);
    cluster.addProposer(p1);
    cluster.addProposer(p2);

    cluster.runBasicPaxos(p1, 'value-A');
    cluster.runBasicPaxos(p2, 'value-B');

    expect(cluster.getChosenValue()).toBe('value-A');
  });

  it('should achieve quorum with 5 acceptors and 3 learners', () => {
    const cluster = new MultiPaxosCluster();
    for (let i = 1; i <= 5; i++) {
      cluster.addAcceptor(new Acceptor(`a${i}`));
    }
    for (let i = 1; i <= 3; i++) {
      cluster.addLearner(new Learner(`l${i}`));
    }

    const proposer = new Proposer('p1', 1);
    const ok = cluster.runMultiPaxosPropose(proposer, 'fast-value');
    expect(ok).toBe(true);
    expect(cluster.getChosenValue()).toBe('fast-value');
  });
});
