/**
 * @file 两阶段提交（2PC）协议
 * @category Consensus → Two-Phase Commit
 * @difficulty medium
 * @tags 2pc, distributed-transaction, atomic-commit, coordinator
 * @description
 * 两阶段提交（Two-Phase Commit, 2PC）是一种经典的原子提交协议，
 * 用于在分布式事务中保证所有参与者要么全部提交，要么全部回滚。
 *
 * 分布式理论依据：
 * - 阶段一（投票阶段）：协调者询问所有参与者是否可以执行提交。
 *   参与者执行本地预提交并锁定资源，返回 YES 或 NO。
 * - 阶段二（决定阶段）：协调者根据投票结果发出 COMMIT 或 ABORT 指令。
 *   若所有参与者返回 YES，则全局提交；否则全局回滚。
 * - 2PC 是阻塞协议：若协调者在阶段二崩溃，参与者必须持有锁等待恢复（不确定问题）。
 */

export type ParticipantState = 'idle' | 'prepared' | 'committed' | 'aborted';
export type TransactionOutcome = 'commit' | 'abort' | 'undecided';

export interface VoteRequest {
  readonly transactionId: string;
}

export interface VoteResponse {
  readonly transactionId: string;
  readonly participantId: string;
  readonly vote: 'YES' | 'NO';
}

export interface Decision {
  readonly transactionId: string;
  readonly decision: 'COMMIT' | 'ABORT';
}

export class Participant {
  readonly id: string;
  private state: ParticipantState = 'idle';
  private lastDecision: TransactionOutcome = 'undecided';
  private crashed = false;
  private crashBeforePrepare = false;
  private crashAfterPrepare = false;

  constructor(id: string) {
    this.id = id;
  }

  setCrashBeforePrepare(crash: boolean): void {
    this.crashBeforePrepare = crash;
    if (crash) this.crashed = true;
  }

  setCrashAfterPrepare(crash: boolean): void {
    this.crashAfterPrepare = crash;
  }

  private checkCrashed(): void {
    if (this.crashed) throw new Error(`[Participant ${this.id}] 已崩溃，无响应`);
  }

  /** 阶段一：处理投票请求 */
  handleVoteRequest(req: VoteRequest): VoteResponse {
    this.checkCrashed();
    if (this.crashBeforePrepare) {
      this.crashed = true;
      throw new Error(`[Participant ${this.id}] 在投票前崩溃`);
    }

    // 模拟本地执行与资源锁定
    const canCommit = true; // 简化：假设本地检查通过
    this.state = canCommit ? 'prepared' : 'aborted';
    console.log(`[Participant ${this.id}] 投票: ${canCommit ? 'YES' : 'NO'}`);

    if (this.crashAfterPrepare) {
      this.crashed = true;
      throw new Error(`[Participant ${this.id}] 在投票后崩溃`);
    }

    return { transactionId: req.transactionId, participantId: this.id, vote: canCommit ? 'YES' : 'NO' };
  }

  /** 阶段二：处理最终决定 */
  handleDecision(decision: Decision): void {
    this.checkCrashed();
    if (decision.decision === 'COMMIT') {
      this.state = 'committed';
      this.lastDecision = 'commit';
      console.log(`[Participant ${this.id}] 执行 COMMIT`);
    } else {
      this.state = 'aborted';
      this.lastDecision = 'abort';
      console.log(`[Participant ${this.id}] 执行 ABORT`);
    }
  }

  getState(): ParticipantState {
    return this.state;
  }

  getLastDecision(): TransactionOutcome {
    return this.lastDecision;
  }
}

export class Coordinator {
  readonly id: string;
  private participants: Participant[] = [];
  private crashAfterVotes = false;
  private crashAfterSomeCommits = false;
  private committedCount = 0;

  constructor(id: string) {
    this.id = id;
  }

  addParticipant(p: Participant): void {
    this.participants.push(p);
  }

  setCrashAfterVotes(crash: boolean): void {
    this.crashAfterVotes = crash;
  }

  setCrashAfterSomeCommits(crash: boolean): void {
    this.crashAfterSomeCommits = crash;
  }

  /** 执行完整 2PC 事务 */
  executeTransaction(transactionId: string): TransactionOutcome {
    console.log(`\n[Coordinator ${this.id}] 开始事务 ${transactionId} 阶段一：收集投票`);

    const votes: VoteResponse[] = [];
    for (const p of this.participants) {
      try {
        const vote = p.handleVoteRequest({ transactionId });
        votes.push(vote);
      } catch (err) {
        console.log((err as Error).message);
        // 任何参与者失败，全局回滚
        this.broadcastDecision(transactionId, 'ABORT');
        return 'abort';
      }
    }

    if (this.crashAfterVotes) {
      throw new Error(`[Coordinator ${this.id}] 在收集投票后、发送决定前崩溃 → 参与者进入阻塞状态`);
    }

    const allYes = votes.every(v => v.vote === 'YES');
    const decision = allYes ? 'COMMIT' : 'ABORT';
    console.log(`[Coordinator ${this.id}] 阶段二：决定 ${decision}`);

    this.broadcastDecision(transactionId, decision);

    return allYes ? 'commit' : 'abort';
  }

  private broadcastDecision(transactionId: string, decision: 'COMMIT' | 'ABORT'): void {
    for (const p of this.participants) {
      try {
        p.handleDecision({ transactionId, decision });
        if (decision === 'COMMIT') {
          this.committedCount++;
        }
        if (this.crashAfterSomeCommits && this.committedCount === 1) {
          throw new Error(`[Coordinator ${this.id}] 在发送部分 COMMIT 后崩溃 → 事务不一致风险`);
        }
      } catch (err) {
        console.log((err as Error).message);
        // 继续尝试通知其他参与者
      }
    }
  }

  getParticipants(): readonly Participant[] {
    return this.participants;
  }
}

export function demo(): void {
  console.log('=== 两阶段提交（2PC）演示 ===\n');

  // 场景1：正常提交
  console.log('--- 场景1：正常提交 ---');
  const coord1 = new Coordinator('coord-1');
  coord1.addParticipant(new Participant('p1'));
  coord1.addParticipant(new Participant('p2'));
  coord1.addParticipant(new Participant('p3'));
  const r1 = coord1.executeTransaction('txn-001');
  console.log(`事务结果: ${r1}`);

  // 场景2：协调者在投票后崩溃（阻塞场景）
  console.log('\n--- 场景2：协调者在投票后崩溃 ---');
  const coord2 = new Coordinator('coord-2');
  const p4 = new Participant('p4');
  const p5 = new Participant('p5');
  coord2.addParticipant(p4);
  coord2.addParticipant(p5);
  coord2.setCrashAfterVotes(true);
  try {
    coord2.executeTransaction('txn-002');
  } catch (err) {
    console.log((err as Error).message);
    console.log(`参与者 p4 状态: ${p4.getState()} (持有锁，阻塞等待协调者恢复)`);
    console.log(`参与者 p5 状态: ${p5.getState()} (持有锁，阻塞等待协调者恢复)`);
  }

  // 场景3：参与者在投票前崩溃（事务回滚）
  console.log('\n--- 场景3：参与者在投票前崩溃 ---');
  const coord3 = new Coordinator('coord-3');
  const p6 = new Participant('p6');
  p6.setCrashBeforePrepare(true);
  coord3.addParticipant(p6);
  coord3.addParticipant(new Participant('p7'));
  const r3 = coord3.executeTransaction('txn-003');
  console.log(`事务结果: ${r3}`);
}
