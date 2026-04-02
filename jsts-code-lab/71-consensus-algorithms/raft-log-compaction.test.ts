/**
 * @file Raft 日志压缩单元测试
 * @description 测试快照生成与 InstallSnapshot RPC
 */

import { describe, it, expect } from 'vitest';
import { RaftLogCompactionCluster, RaftNodeWithSnapshot } from './raft-log-compaction.js';

describe('RaftLogCompactionCluster', () => {
  it('should truncate log after snapshot', () => {
    const cluster = new RaftLogCompactionCluster();
    cluster.addNode('node-1');
    cluster.addNode('node-2');
    cluster.setLeader('node-1');

    const leader = cluster.getNode('node-1')!;
    leader.currentTerm = 1;
    cluster.getNode('node-2')!.currentTerm = 1;

    cluster.submitCommand('node-1', 'SET a=1');
    cluster.submitCommand('node-1', 'SET b=2');
    cluster.submitCommand('node-1', 'SET c=3');

    cluster.leaderSnapshot('node-1', 2);

    expect(leader.effectiveLogStart).toBe(2);
    expect(leader.log.length).toBe(1);
    expect(leader.lastLogIndex).toBe(3);
  });

  it('should recover lagging node via InstallSnapshot', () => {
    const cluster = new RaftLogCompactionCluster();
    cluster.addNode('node-1');
    cluster.addNode('node-2');
    cluster.setLeader('node-1');

    const leader = cluster.getNode('node-1')!;
    leader.currentTerm = 1;
    cluster.getNode('node-2')!.currentTerm = 1;

    cluster.submitCommand('node-1', 'SET x=1');
    cluster.submitCommand('node-1', 'SET y=2');
    cluster.leaderSnapshot('node-1', 2);
    cluster.submitCommand('node-1', 'SET z=3');

    const recovered = cluster.recoverLaggingNode('node-2');
    expect(recovered).toBe(true);

    const node2 = cluster.getNode('node-2')!;
    expect(node2.commitIndex).toBe(3);
    expect(node2.stateMachine['x']).toBe('1');
    expect(node2.stateMachine['z']).toBe('3');
  });
});

describe('RaftNodeWithSnapshot', () => {
  it('should reject outdated snapshot install', () => {
    const node = new RaftNodeWithSnapshot('node-1');
    node.currentTerm = 2;

    const res = node.installSnapshot({
      term: 1,
      leaderId: 'leader-1',
      lastIncludedIndex: 5,
      lastIncludedTerm: 1,
      data: { x: '1' },
      done: true
    });

    expect(res.success).toBe(false);
  });
});
