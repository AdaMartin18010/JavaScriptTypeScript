/**
 * @file Multi-Paxos 一致性算法
 * @category Consensus → Paxos
 * @difficulty hard
 * @description
 * Multi-Paxos 是对 Basic Paxos 的优化：在稳定领导者场景下，
 * 第一阶段（Prepare/Promise）可被跳过，直接进入第二阶段（Propose/Accept）。
 *
 * 数学模型：
 * - 设接受者集合为 A = {a₁, a₂, ..., aₙ}，多数派为 Q ⊂ A 且 |Q| > n/2。
 * - 提案号 n 需满足全序关系，通常构造为 n = (round, proposerId)。
 * - 安全性条件：
 *   P1：接受者只接受它承诺过的最大提案号对应的值。
 *   P2：若某值 v 已被选定，则后续被选定的值必为 v。
 *
 * @complexity_analysis
 * - Basic Paxos（两阶段）：2 次 RTT（Prepare/Promise + Propose/Accept/Learn）
 * - Multi-Paxos（稳定领导者）：1 次 RTT（跳过 Prepare）
 * - 空间复杂度：每个接受者 O(P)，P 为已接受提案数量；学习者 O(1) 每个实例
 */

/** 提案号： round 占高位，proposerId 占低位，保证字典序全序 */
export type ProposalNumber = readonly [round: number, proposerId: number];

export interface PaxosProposal {
  readonly number: ProposalNumber;
  readonly value: string;
  readonly proposerId: string;
}

export interface PromiseResult {
  readonly promised: boolean;
  readonly highestAccepted?: PaxosProposal;
}

export interface AcceptResult {
  readonly accepted: boolean;
}

/** Acceptor（接受者）角色 */
export class Acceptor {
  private promisedN: ProposalNumber | null = null;
  private accepted: PaxosProposal | null = null;
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }

  /**
   * Phase 1a / 1b：Prepare / Promise
   * 若提案号大于已承诺的最大号，则承诺并返回已接受的最高值。
   */
  prepare(n: ProposalNumber): PromiseResult {
    if (this.promisedN && this.compareProposal(n, this.promisedN) <= 0) {
      return { promised: false };
    }
    this.promisedN = n;
    return { promised: true, highestAccepted: this.accepted ?? undefined };
  }

  /**
   * Phase 2a / 2b：Propose / Accept
   * 仅接受不小于已承诺号的提案。
   */
  accept(proposal: PaxosProposal): AcceptResult {
    if (this.promisedN && this.compareProposal(proposal.number, this.promisedN) < 0) {
      return { accepted: false };
    }
    this.promisedN = proposal.number;
    this.accepted = proposal;
    return { accepted: true };
  }

  getAccepted(): PaxosProposal | null {
    return this.accepted;
  }

  private compareProposal(a: ProposalNumber, b: ProposalNumber): number {
    if (a[0] !== b[0]) return a[0] - b[0];
    return a[1] - b[1];
  }
}

/** Learner（学习者）角色：统计哪些值已被多数派接受 */
export class Learner {
  private acceptCounts = new Map<string, number>();
  private chosenValue: string | null = null;
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }

  learn(proposal: PaxosProposal, quorumSize: number): boolean {
    if (this.chosenValue !== null) return true;
    const count = (this.acceptCounts.get(proposal.value) ?? 0) + 1;
    this.acceptCounts.set(proposal.value, count);
    if (count >= quorumSize) {
      this.chosenValue = proposal.value;
      console.log(`[Learner ${this.id}] 值已选定: ${proposal.value} (提案号 [${proposal.number[0]}, ${proposal.number[1]}])`);
      return true;
    }
    return false;
  }

  getChosenValue(): string | null {
    return this.chosenValue;
  }
}

/** Proposer（提议者）角色 */
export class Proposer {
  private round = 0;
  readonly id: string;
  readonly proposerIdNum: number;

  constructor(id: string, proposerIdNum: number) {
    this.id = id;
    this.proposerIdNum = proposerIdNum;
  }

  nextProposalNumber(): ProposalNumber {
    this.round++;
    return [this.round, this.proposerIdNum];
  }
}

/** Multi-Paxos 集群：协调多个提议者、接受者、学习者 */
export class MultiPaxosCluster {
  private acceptors: Acceptor[] = [];
  private learners: Learner[] = [];
  private proposers: Proposer[] = [];

  addAcceptor(acceptor: Acceptor): void {
    this.acceptors.push(acceptor);
  }

  addLearner(learner: Learner): void {
    this.learners.push(learner);
  }

  addProposer(proposer: Proposer): void {
    this.proposers.push(proposer);
  }

  get quorumSize(): number {
    return Math.floor(this.acceptors.length / 2) + 1;
  }

  /**
   * 执行一次完整的 Basic Paxos 两阶段流程（用于演示）。
   * 返回是否成功选定值。
   */
  runBasicPaxos(proposer: Proposer, value: string): boolean {
    const n = proposer.nextProposalNumber();
    console.log(`[Proposer ${proposer.id}] 发起 Prepare，提案号 [${n[0]}, ${n[1]}]`);

    // Phase 1
    const promises: PromiseResult[] = [];
    for (const acc of this.acceptors) {
      promises.push(acc.prepare(n));
    }
    const successfulPromises = promises.filter(p => p.promised);
    if (successfulPromises.length < this.quorumSize) {
      console.log(`[Proposer ${proposer.id}] Promise 未达到多数派`);
      return false;
    }

    // 若已有接受值，必须复用
    const existing = successfulPromises
      .filter((p): p is PromiseResult & { highestAccepted: PaxosProposal } => !!p.highestAccepted)
      .sort((a, b) => this.compareProposal(a.highestAccepted.number, b.highestAccepted.number))[0];
    const finalValue = existing ? existing.highestAccepted.value : value;
    const proposal: PaxosProposal = { number: n, value: finalValue, proposerId: proposer.id };

    // Phase 2
    console.log(`[Proposer ${proposer.id}] 发起 Accept，值: ${finalValue}`);
    let acceptedCount = 0;
    for (const acc of this.acceptors) {
      const res = acc.accept(proposal);
      if (res.accepted) {
        acceptedCount++;
        for (const learner of this.learners) {
          learner.learn(proposal, this.quorumSize);
        }
      }
    }

    if (acceptedCount >= this.quorumSize) {
      console.log(`[Proposer ${proposer.id}] 值成功被多数派接受`);
      return true;
    }
    console.log(`[Proposer ${proposer.id}] Accept 未达到多数派`);
    return false;
  }

  /** 在稳定领导者下跳过 Prepare，直接 Propose/Accept（Multi-Paxos 优化） */
  runMultiPaxosPropose(proposer: Proposer, value: string): boolean {
    const n = proposer.nextProposalNumber();
    const proposal: PaxosProposal = { number: n, value, proposerId: proposer.id };
    console.log(`[Proposer ${proposer.id}] Multi-Paxos 直接 Accept，值: ${value}`);

    let acceptedCount = 0;
    for (const acc of this.acceptors) {
      const res = acc.accept(proposal);
      if (res.accepted) {
        acceptedCount++;
        for (const learner of this.learners) {
          learner.learn(proposal, this.quorumSize);
        }
      }
    }

    if (acceptedCount >= this.quorumSize) {
      console.log(`[Proposer ${proposer.id}] 值成功被多数派接受`);
      return true;
    }
    return false;
  }

  getChosenValue(): string | null {
    return this.learners[0]?.getChosenValue() ?? null;
  }

  private compareProposal(a: ProposalNumber, b: ProposalNumber): number {
    if (a[0] !== b[0]) return a[0] - b[0];
    return a[1] - b[1];
  }
}

export function demo(): void {
  console.log('=== Multi-Paxos 演示 ===\n');

  const cluster = new MultiPaxosCluster();

  // 3 个接受者
  for (let i = 1; i <= 3; i++) {
    cluster.addAcceptor(new Acceptor(`acceptor-${i}`));
  }

  // 2 个学习者
  cluster.addLearner(new Learner('learner-1'));
  cluster.addLearner(new Learner('learner-2'));

  // 2 个提议者
  const pA = new Proposer('proposer-A', 1);
  const pB = new Proposer('proposer-B', 2);
  cluster.addProposer(pA);
  cluster.addProposer(pB);

  console.log('--- Basic Paxos 两阶段 ---');
  const ok1 = cluster.runBasicPaxos(pA, 'value-X');
  console.log(`Basic Paxos 结果: ${ok1 ? '成功' : '失败'}, 选定值: ${cluster.getChosenValue()}`);

  console.log('\n--- Multi-Paxos 快速路径 ---');
  const ok2 = cluster.runMultiPaxosPropose(pA, 'value-Y');
  console.log(`Multi-Paxos 结果: ${ok2 ? '成功' : '失败'}, 选定值: ${cluster.getChosenValue()}`);

  console.log('\n--- 冲突提案演示（B 试图覆盖，但必须复用已选定值）---');
  const ok3 = cluster.runBasicPaxos(pB, 'value-Z');
  console.log(`冲突提案结果: ${ok3 ? '成功' : '失败'}, 选定值: ${cluster.getChosenValue()}`);
}
