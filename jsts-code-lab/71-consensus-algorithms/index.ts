/**
 * @file 一致性算法模块
 * @module Consensus Algorithms
 * @description
 * 分布式一致性算法教学库：
 * - Raft 算法（选举、日志复制、安全性、网络分区模拟）
 * - Multi-Paxos（Prepare/Promise/Propose/Accept/Learn）
 * - PBFT（实用拜占庭容错）
 * - Viewstamped Replication（视图变更、主节点故障转移）
 * - CAP 定理形式化模型与可运行演示
 * - Raft 日志压缩（Snapshot/InstallSnapshot）
 * - Raft 成员变更（联合共识 Joint Consensus）
 * - 领导者选举理论（Bully / Ring）
 * - 分布式时钟（Lamport / Vector Clock）
 * - 两阶段提交（2PC）
 * - Raft 可视化（ASCII 状态机）
 */

export * as RaftConsensus from './raft-consensus.js';
export * as PaxosConsensus from './paxos-consensus.js';
export * as PbftConsensus from './pbft-consensus.js';
export * as ViewstampedReplication from './viewstamped-replication.js';
export * as CapTheoremFormal from './cap-theorem-formal.js';
export * as CapTheorem from './cap-theorem.js';
export * as RaftLogCompaction from './raft-log-compaction.js';
export * as RaftMembershipChange from './raft-membership-change.js';
export * as LeaderElectionTheory from './leader-election-theory.js';
export * as LeaderElection from './leader-election.js';
export * as DistributedClock from './distributed-clock.js';
export * as TwoPhaseCommit from './two-phase-commit.js';
export * as RaftVisualizer from './raft-visualizer.js';
