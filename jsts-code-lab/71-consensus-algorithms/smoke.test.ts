import { describe, it, expect } from 'vitest';
import * as ConsensusAlgorithms from './index';

describe('71-consensus-algorithms smoke test', () => {
  it('should export all consensus submodules', () => {
    expect(ConsensusAlgorithms.RaftConsensus).toBeDefined();
    expect(ConsensusAlgorithms.PaxosConsensus).toBeDefined();
    expect(ConsensusAlgorithms.PbftConsensus).toBeDefined();
    expect(ConsensusAlgorithms.ViewstampedReplication).toBeDefined();
    expect(ConsensusAlgorithms.CapTheoremFormal).toBeDefined();
    expect(ConsensusAlgorithms.CapTheorem).toBeDefined();
    expect(ConsensusAlgorithms.RaftLogCompaction).toBeDefined();
    expect(ConsensusAlgorithms.RaftMembershipChange).toBeDefined();
    expect(ConsensusAlgorithms.LeaderElectionTheory).toBeDefined();
    expect(ConsensusAlgorithms.LeaderElection).toBeDefined();
    expect(ConsensusAlgorithms.DistributedClock).toBeDefined();
    expect(ConsensusAlgorithms.TwoPhaseCommit).toBeDefined();
    expect(ConsensusAlgorithms.RaftVisualizer).toBeDefined();
  });

  it('should have object-type exports', () => {
    expect(typeof ConsensusAlgorithms.RaftConsensus).toBe('object');
    expect(typeof ConsensusAlgorithms.PaxosConsensus).toBe('object');
  });
});
