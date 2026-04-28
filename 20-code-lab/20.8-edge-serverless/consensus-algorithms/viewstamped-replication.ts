/**
 * @file Viewstamped Replication (VR) 一致性算法
 * @category Consensus → VR
 * @difficulty hard
 * @description
 * Viewstamped Replication 是最早的复制状态机协议之一，与 Raft 和 Paxos 齐名。
 * 核心概念是 "View"（视图），每个视图有一个明确的主节点（Primary），
 * 当主节点故障时，通过 View Change 协议选举新主节点。
 *
 * 数学模型：
 * - 副本集合 R = {r₁, r₂, ..., rₙ}，n = 2f + 1。
 * - 每个视图 view 对应一个主节点 primary = R[view mod n]。
 * - 操作日志为全序序列 O = [o₁, o₂, ...]，客户端请求通过主节点分配 op-number。
 * - 提交点 commit-number 表示已复制到多数派的最大操作序号。
 *
 * @complexity_analysis
 * - 正常路径（客户端请求）：1 次 RTT（主节点广播 Prepare，副本回复 PrepareOK）
 * - View Change：O(n) 消息交换，新主节点需收集 f+1 个副本的日志
 * - 空间复杂度：每个副本 O(L)，L 为日志长度
 */

export type VrNodeRole = 'primary' | 'backup' | 'recovering';

export interface VrLogEntry {
  readonly opNumber: number;
  readonly view: number;
  readonly clientId: string;
  readonly requestId: number;
  readonly operation: string;
}

export interface VrPrepareMessage {
  readonly type: 'PREPARE';
  readonly view: number;
  readonly opNumber: number;
  readonly commitNumber: number;
  readonly entry: VrLogEntry;
  readonly senderId: string;
}

export interface VrPrepareOkMessage {
  readonly type: 'PREPARE_OK';
  readonly view: number;
  readonly opNumber: number;
  readonly senderId: string;
}

export interface VrStartViewChangeMessage {
  readonly type: 'START_VIEW_CHANGE';
  readonly view: number;
  readonly senderId: string;
}

export interface VrDoViewChangeMessage {
  readonly type: 'DO_VIEW_CHANGE';
  readonly view: number;
  readonly log: VrLogEntry[];
  readonly lastNormalView: number;
  readonly opNumber: number;
  readonly commitNumber: number;
  readonly senderId: string;
}

export interface VrStartViewMessage {
  readonly type: 'START_VIEW';
  readonly view: number;
  readonly log: VrLogEntry[];
  readonly opNumber: number;
  readonly commitNumber: number;
  readonly senderId: string;
}

export type VrMessage = VrPrepareMessage | VrPrepareOkMessage | VrStartViewChangeMessage | VrDoViewChangeMessage | VrStartViewMessage;

export class VrReplica {
  readonly id: string;
  private role: VrNodeRole = 'backup';
  private view = 0;
  private log: VrLogEntry[] = [];
  private opNumber = 0;
  private commitNumber = 0;
  private clientTable = new Map<string, { requestId: number; response?: string }>();
  private prepareOks = new Map<number, Set<string>>();
  private startViewChangeVotes = new Map<number, Set<string>>();
  private doViewChangeVotes = new Map<number, VrDoViewChangeMessage[]>();
  private sentDoViewChange = new Set<number>();

  constructor(id: string) {
    this.id = id;
  }

  get currentView(): number {
    return this.view;
  }

  get currentRole(): VrNodeRole {
    return this.role;
  }

  get currentCommitNumber(): number {
    return this.commitNumber;
  }

  setPrimary(): void {
    this.role = 'primary';
  }

  setBackup(): void {
    this.role = 'backup';
  }

  private isPrimary(allReplicas: string[]): boolean {
    return allReplicas[this.view % allReplicas.length] === this.id;
  }

  /** 客户端发送请求（仅主节点处理） */
  clientRequest(clientId: string, requestId: number, operation: string, allReplicas: string[]): VrPrepareMessage | null {
    if (!this.isPrimary(allReplicas)) {
      console.log(`[VR ${this.id}] 不是主节点，拒绝请求`);
      return null;
    }

    this.opNumber++;
    const entry: VrLogEntry = {
      opNumber: this.opNumber,
      view: this.view,
      clientId,
      requestId,
      operation
    };
    this.log.push(entry);
    this.clientTable.set(clientId, { requestId });

    console.log(`[VR Primary ${this.id}] 接收请求 op=${this.opNumber}: ${operation}`);

    return {
      type: 'PREPARE',
      view: this.view,
      opNumber: this.opNumber,
      commitNumber: this.commitNumber,
      entry,
      senderId: this.id
    };
  }

  /** 处理 PREPARE */
  handlePrepare(msg: VrPrepareMessage, allReplicas: string[]): VrPrepareOkMessage | null {
    if (msg.view !== this.view) return null;

    // 补齐缺失日志
    if (msg.opNumber > this.log.length) {
      // 简化：假设无缺失，直接追加
    }

    if (msg.opNumber === this.log.length + 1) {
      this.log.push(msg.entry);
      this.opNumber = msg.opNumber;
    }

    // 推进 commit
    this.commitNumber = Math.min(msg.commitNumber, this.opNumber);

    console.log(`[VR ${this.id}] 收到 PREPARE op=${msg.opNumber}，当前 commit=${this.commitNumber}`);

    return {
      type: 'PREPARE_OK',
      view: this.view,
      opNumber: msg.opNumber,
      senderId: this.id
    };
  }

  /** 处理 PREPARE_OK（仅主节点） */
  handlePrepareOk(msg: VrPrepareOkMessage, quorumSize: number): void {
    if (this.role !== 'primary') return;

    const votes = this.prepareOks.get(msg.opNumber) ?? new Set<string>();
    votes.add(msg.senderId);
    this.prepareOks.set(msg.opNumber, votes);

    if (votes.size >= quorumSize - 1 && this.commitNumber < msg.opNumber) {
      this.commitNumber = msg.opNumber;
      const entry = this.log[msg.opNumber - 1];
      if (entry) {
        this.clientTable.set(entry.clientId, { requestId: entry.requestId, response: `OK: ${entry.operation}` });
      }
      console.log(`[VR Primary ${this.id}] 提交 op=${msg.opNumber}`);
    }
  }

  /** 发起 View Change */
  startViewChange(newView: number, allReplicas: string[]): VrStartViewChangeMessage {
    this.view = newView;
    this.role = 'recovering';
    const votes = this.startViewChangeVotes.get(newView) ?? new Set<string>();
    votes.add(this.id);
    this.startViewChangeVotes.set(newView, votes);
    console.log(`[VR ${this.id}] 发起 StartViewChange -> view ${newView}`);
    return {
      type: 'START_VIEW_CHANGE',
      view: newView,
      senderId: this.id
    };
  }

  /** 处理 START_VIEW_CHANGE */
  handleStartViewChange(msg: VrStartViewChangeMessage, allReplicas: string[], quorumSize: number): VrDoViewChangeMessage | null {
    if (msg.view < this.view) return null;

    const votes = this.startViewChangeVotes.get(msg.view) ?? new Set<string>();
    votes.add(msg.senderId);
    this.startViewChangeVotes.set(msg.view, votes);

    if (votes.size >= quorumSize && !this.sentDoViewChange.has(msg.view)) {
      this.sentDoViewChange.add(msg.view);
      console.log(`[VR ${this.id}] 达到 StartViewChange 阈值，发送 DoViewChange`);
      return {
        type: 'DO_VIEW_CHANGE',
        view: msg.view,
        log: [...this.log],
        lastNormalView: this.view - 1,
        opNumber: this.opNumber,
        commitNumber: this.commitNumber,
        senderId: this.id
      };
    }

    return null;
  }

  /** 处理 DO_VIEW_CHANGE（仅新主节点） */
  handleDoViewChange(msg: VrDoViewChangeMessage, allReplicas: string[], quorumSize: number): VrStartViewMessage | null {
    const expectedPrimary = allReplicas[msg.view % allReplicas.length];
    if (this.id !== expectedPrimary) return null;

    const votes = this.doViewChangeVotes.get(msg.view) ?? [];
    votes.push(msg);
    this.doViewChangeVotes.set(msg.view, votes);

    if (votes.length >= quorumSize - 1) {
      // 选择日志最长的（若长度相同选视图更高的）
      const best = votes.reduce((best, cur) => {
        if (cur.opNumber > best.opNumber) return cur;
        if (cur.opNumber === best.opNumber && cur.lastNormalView > best.lastNormalView) return cur;
        return best;
      }, { log: this.log, lastNormalView: this.view - 1, opNumber: this.opNumber, commitNumber: this.commitNumber } as VrDoViewChangeMessage);

      this.log = [...best.log];
      this.opNumber = best.opNumber;
      this.commitNumber = best.commitNumber;
      this.view = msg.view;
      this.role = 'primary';

      console.log(`[VR Primary ${this.id}] 新视图 ${msg.view} 启动，日志长度=${this.log.length}`);

      return {
        type: 'START_VIEW',
        view: msg.view,
        log: [...this.log],
        opNumber: this.opNumber,
        commitNumber: this.commitNumber,
        senderId: this.id
      };
    }

    return null;
  }

  /** 处理 START_VIEW */
  handleStartView(msg: VrStartViewMessage): void {
    this.view = msg.view;
    this.log = [...msg.log];
    this.opNumber = msg.opNumber;
    this.commitNumber = msg.commitNumber;
    this.role = 'backup';
    console.log(`[VR ${this.id}] 进入视图 ${msg.view}，角色变为 backup`);
  }
}

export class VrCluster {
  private replicas: VrReplica[] = [];

  addReplica(r: VrReplica): void {
    this.replicas.push(r);
  }

  getReplica(id: string): VrReplica | undefined {
    return this.replicas.find(r => r.id === id);
  }

  get allReplicaIds(): string[] {
    return this.replicas.map(r => r.id);
  }

  get quorumSize(): number {
    return Math.floor(this.replicas.length / 2) + 1;
  }

  /** 模拟客户端发送请求 */
  clientRequest(clientId: string, requestId: number, operation: string): boolean {
    const primary = this.replicas.find(r => r.currentRole === 'primary');
    if (!primary) {
      console.log('无主节点，请求失败');
      return false;
    }

    const prepare = primary.clientRequest(clientId, requestId, operation, this.allReplicaIds);
    if (!prepare) return false;

    for (const r of this.replicas) {
      if (r.id !== primary.id) {
        const ok = r.handlePrepare(prepare, this.allReplicaIds);
        if (ok) {
          primary.handlePrepareOk(ok, this.quorumSize);
        }
      }
    }

    return primary.currentCommitNumber >= prepare.opNumber;
  }

  /** 模拟主节点故障并触发 View Change */
  performViewChange(newView: number): boolean {
    const messages: VrMessage[] = [];

    // 所有副本发起 startViewChange
    for (const r of this.replicas) {
      messages.push(r.startViewChange(newView, this.allReplicaIds));
    }

    // 处理 startViewChange
    const svcMessages = messages.filter((m): m is VrStartViewChangeMessage => m.type === 'START_VIEW_CHANGE');
    for (const svc of svcMessages) {
      for (const r of this.replicas) {
        const dvc = r.handleStartViewChange(svc, this.allReplicaIds, this.quorumSize);
        if (dvc) messages.push(dvc);
      }
    }

    // 处理 doViewChange（新主节点）
    const dvcMessages = messages.filter((m): m is VrDoViewChangeMessage => m.type === 'DO_VIEW_CHANGE');
    const expectedPrimary = this.allReplicaIds[newView % this.allReplicaIds.length];
    const primary = this.replicas.find(r => r.id === expectedPrimary);
    if (!primary) return false;

    for (const dvc of dvcMessages) {
      const sv = primary.handleDoViewChange(dvc, this.allReplicaIds, this.quorumSize);
      if (sv) {
        for (const r of this.replicas) {
          if (r.id !== primary.id) {
            r.handleStartView(sv);
          }
        }
        return true;
      }
    }

    return false;
  }
}

export function demo(): void {
  console.log('=== Viewstamped Replication 演示 ===\n');

  const cluster = new VrCluster();
  cluster.addReplica(new VrReplica('replica-1'));
  cluster.addReplica(new VrReplica('replica-2'));
  cluster.addReplica(new VrReplica('replica-3'));
  cluster.addReplica(new VrReplica('replica-4'));
  cluster.addReplica(new VrReplica('replica-5'));

  // 初始化 replica-1 为主节点（view 0）
  cluster.getReplica('replica-1')?.setPrimary();

  console.log('--- 正常请求处理 ---');
  const ok1 = cluster.clientRequest('client-1', 1, 'SET x=10');
  console.log(`请求1结果: ${ok1 ? '成功' : '失败'}, commit=${cluster.getReplica('replica-1')?.currentCommitNumber}`);

  const ok2 = cluster.clientRequest('client-1', 2, 'SET y=20');
  console.log(`请求2结果: ${ok2 ? '成功' : '失败'}, commit=${cluster.getReplica('replica-1')?.currentCommitNumber}`);

  console.log('\n--- 视图变更（View Change）---');
  const viewChanged = cluster.performViewChange(1);
  console.log(`视图变更结果: ${viewChanged ? '成功' : '失败'}`);
  for (const r of cluster.replicas) {
    console.log(`  ${r.id}: view=${r.currentView}, role=${r.currentRole}, commit=${r.currentCommitNumber}`);
  }

  console.log('\n--- 新主节点继续处理请求 ---');
  const ok3 = cluster.clientRequest('client-1', 3, 'ADD x,y');
  console.log(`请求3结果: ${ok3 ? '成功' : '失败'}`);
}
