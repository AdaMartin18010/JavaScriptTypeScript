/**
 * @file 一致性算法集成测试
 * @description 跨模块集成验证：Raft、Paxos、PBFT、CAP、VR、Raft 扩展
 */

import { describe, it, expect } from 'vitest';
import { RaftConsensus } from './raft-consensus.js';
import { MultiPaxosCluster, Acceptor, Learner, Proposer } from './paxos-consensus.js';
import { PbftNetwork, PbftNode } from './pbft-consensus.js';
import { VrCluster, VrReplica } from './viewstamped-replication.js';
import { CapDistributedSystem } from './cap-theorem-formal.js';
import { RaftLogCompactionCluster } from './raft-log-compaction.js';
import { RaftMembershipChanger } from './raft-membership-change.js';
import { LeaderElectionCluster, BullyNode, RingNode } from './leader-election-theory.js';

describe('Consensus Algorithms Integration', () => {
  it('Raft: should successfully elect leader and replicate logs', () => {
    const raft = new RaftConsensus();
    for (let i = 1; i <= 5; i++) raft.addNode(`node-${i}`);

    const elected = raft.startElection('node-1');
    expect(elected).toBe(true);

    raft.submitCommand('node-1', 'SET key=value');
    const status = raft.getNodeStatus('node-1');
    expect(status?.logLength).toBeGreaterThanOrEqual(1);
  });

  it('Paxos: should choose a value and preserve it under conflict', () => {
    const cluster = new MultiPaxosCluster();
    for (let i = 1; i <= 3; i++) cluster.addAcceptor(new Acceptor(`a${i}`));
    cluster.addLearner(new Learner('l1'));

    const p1 = new Proposer('p1', 1);
    const p2 = new Proposer('p2', 2);

    expect(cluster.runBasicPaxos(p1, 'chosen-value')).toBe(true);
    expect(cluster.getChosenValue()).toBe('chosen-value');

    cluster.runBasicPaxos(p2, 'other-value');
    expect(cluster.getChosenValue()).toBe('chosen-value'); // 不可被覆盖
  });

  it('PBFT: should reach agreement with f=1 byzantine fault', () => {
    const network = new PbftNetwork();
    network.addNode(new PbftNode('n1', false));
    network.addNode(new PbftNode('n2', false));
    network.addNode(new PbftNode('n3', false));
    network.addNode(new PbftNode('n4', true));

    expect(network.f).toBe(1);
    const success = network.request('client-1', 'OP');
    expect(success).toBe(true);
  });

  it('CAP: should prove CP loses availability and AP loses consistency during partition', () => {
    const sys = new CapDistributedSystem();
    for (let i = 1; i <= 5; i++) sys.addNode(`node-${i}`, 0);

    sys.createPartition(['node-1', 'node-2'], ['node-3', 'node-4', 'node-5']);

    const cpOkMinority = sys.writeCP('node-1', 'c1', 100);
    const cpOkMajority = sys.writeCP('node-3', 'c2', 200);
    expect(cpOkMinority).toBe(false); // CP 牺牲可用性
    expect(cpOkMajority).toBe(true);
    expect(sys.read('node-3')?.value).toBe(200);
    expect(sys.read('node-1')?.value).toBe(0); // minority 保持旧值

    // Reset for AP test
    for (const n of Array.from(sys.nodes.values())) {
      n.state = { key: 'x', value: 0, version: 0, timestamp: 0 };
    }

    const apOk1 = sys.writeAP('node-1', 'c1', 100);
    const apOk2 = sys.writeAP('node-3', 'c2', 200);
    expect(apOk1).toBe(true);
    expect(apOk2).toBe(true);
    expect(sys.checkConsistency()).toBe(false); // AP 牺牲一致性
  });

  it('VR: should handle view change and continue processing', () => {
    const cluster = new VrCluster();
    for (let i = 1; i <= 5; i++) cluster.addReplica(new VrReplica(`r${i}`));
    cluster.getReplica('r1')?.setPrimary();

    expect(cluster.clientRequest('client', 1, 'CMD')).toBe(true);
    const viewChanged = cluster.performViewChange(1);
    expect(viewChanged).toBe(true);

    // view 1 的主节点为 r2（1 % 5 = 1）
    const newPrimary = cluster.getReplica('r2');
    expect(newPrimary?.currentRole).toBe('primary');
  });

  it('Raft Log Compaction: should truncate log and recover via snapshot', () => {
    const cluster = new RaftLogCompactionCluster();
    cluster.addNode('n1');
    cluster.addNode('n2');
    cluster.setLeader('n1');
    cluster.getNode('n1')!.currentTerm = 1;
    cluster.getNode('n2')!.currentTerm = 1;

    cluster.submitCommand('n1', 'SET a=1');
    cluster.submitCommand('n1', 'SET b=2');
    cluster.leaderSnapshot('n1', 1);

    expect(cluster.getNode('n1')?.effectiveLogStart).toBe(1);

    cluster.recoverLaggingNode('n2');
    expect(cluster.getNode('n2')?.commitIndex).toBe(2);
  });

  it('Raft Membership Change: should safely transition 3 -> 5 nodes', () => {
    const changer = new RaftMembershipChanger();
    expect(changer.transition3To5()).toBe(true);

    for (const id of ['node-1', 'node-2', 'node-3', 'node-4', 'node-5']) {
      expect(changer.getNode(id)?.config.name).toBe('C_new');
    }
  });

  it('Leader Election: Bully and Ring should both elect highest priority node', () => {
    const bullyCluster = new LeaderElectionCluster();
    bullyCluster.addBullyNode(new BullyNode('n1', 1));
    bullyCluster.addBullyNode(new BullyNode('n2', 2));
    bullyCluster.addBullyNode(new BullyNode('n3', 3));
    expect(bullyCluster.runBullyElection('n1')).toBe('n3');

    const ringCluster = new LeaderElectionCluster();
    ringCluster.addRingNode(new RingNode('n1', 1));
    ringCluster.addRingNode(new RingNode('n2', 2));
    ringCluster.addRingNode(new RingNode('n3', 3));
    expect(ringCluster.runRingElection('n1')).toBe('n3');
  });
});
