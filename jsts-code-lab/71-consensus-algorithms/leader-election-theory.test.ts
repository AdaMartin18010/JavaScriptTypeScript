/**
 * @file 领导者选举理论单元测试
 * @description 测试 Bully 与 Ring 算法的正确性
 */

import { describe, it, expect } from 'vitest';
import { LeaderElectionCluster, BullyNode, RingNode } from './leader-election-theory.js';

describe('Bully Algorithm', () => {
  it('should elect highest priority alive node as leader', () => {
    const cluster = new LeaderElectionCluster();
    cluster.addBullyNode(new BullyNode('n1', 1));
    cluster.addBullyNode(new BullyNode('n2', 2));
    cluster.addBullyNode(new BullyNode('n3', 3));

    const leader = cluster.runBullyElection('n1');
    expect(leader).toBe('n3');
  });

  it('should handle highest priority node failure', () => {
    const cluster = new LeaderElectionCluster();
    cluster.addBullyNode(new BullyNode('n1', 1));
    cluster.addBullyNode(new BullyNode('n2', 2));
    cluster.addBullyNode(new BullyNode('n3', 3));
    cluster.getBullyNode('n3')?.setAlive(false);

    const leader = cluster.runBullyElection('n1');
    expect(leader).toBe('n2');
  });

  it('should handle all nodes except one being dead', () => {
    const cluster = new LeaderElectionCluster();
    cluster.addBullyNode(new BullyNode('n1', 1));
    cluster.addBullyNode(new BullyNode('n2', 2));
    cluster.getBullyNode('n2')?.setAlive(false);

    const leader = cluster.runBullyElection('n1');
    expect(leader).toBe('n1');
  });
});

describe('Ring Algorithm', () => {
  it('should elect highest priority node in ring', () => {
    const cluster = new LeaderElectionCluster();
    cluster.addRingNode(new RingNode('n1', 1));
    cluster.addRingNode(new RingNode('n2', 2));
    cluster.addRingNode(new RingNode('n3', 3));

    const leader = cluster.runRingElection('n1');
    expect(leader).toBe('n3');
  });

  it('should handle ring with 5 nodes', () => {
    const cluster = new LeaderElectionCluster();
    for (let i = 1; i <= 5; i++) {
      cluster.addRingNode(new RingNode(`n${i}`, i));
    }

    const leader = cluster.runRingElection('n2');
    expect(leader).toBe('n5');
  });
});
