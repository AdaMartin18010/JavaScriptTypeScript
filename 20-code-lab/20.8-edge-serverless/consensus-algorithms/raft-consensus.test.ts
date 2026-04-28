/**
 * @file Raft 一致性算法单元测试
 * @description 测试 Raft 领导者选举与日志复制
 */

import { describe, it, expect } from 'vitest';
import { RaftConsensus } from './raft-consensus.js';

describe('RaftConsensus', () => {
  it('should elect a leader with majority votes', () => {
    const raft = new RaftConsensus();
    for (let i = 1; i <= 5; i++) {
      raft.addNode(`node-${i}`);
    }

    const elected = raft.startElection('node-1');
    expect(elected).toBe(true);

    const status = raft.getNodeStatus('node-1');
    expect(status?.isLeader).toBe(true);
    expect(status?.state).toBe('leader');
  });

  it('should replicate log entries after leader election', () => {
    const raft = new RaftConsensus();
    for (let i = 1; i <= 5; i++) {
      raft.addNode(`node-${i}`);
    }

    raft.startElection('node-1');
    const ok = raft.submitCommand('node-1', 'SET x = 1');
    expect(ok).toBe(true);

    const leaderStatus = raft.getNodeStatus('node-1');
    expect(leaderStatus?.logLength).toBe(1);

    // 跟随者也应收到日志
    const followerStatus = raft.getNodeStatus('node-2');
    expect(followerStatus?.logLength).toBe(1);
  });

  it('should reject commands from non-leader', () => {
    const raft = new RaftConsensus();
    raft.addNode('node-1');
    raft.addNode('node-2');

    const ok = raft.submitCommand('node-2', 'SET x = 1');
    expect(ok).toBe(false);
  });
});
