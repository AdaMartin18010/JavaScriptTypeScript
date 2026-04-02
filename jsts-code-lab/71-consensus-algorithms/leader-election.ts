/**
 * @file 领导者选举算法（Bully 与 Ring）
 * @category Consensus → Leader Election
 * @difficulty medium
 * @tags bully-algorithm, ring-algorithm, leader-election, distributed-systems
 * @description
 * 在分布式系统中，当协调者（Leader）发生故障时，需要通过选举协议选出一个新的唯一领导者。
 * Bully 算法基于进程优先级（ID 大小），Ring 算法基于逻辑环上的令牌传递。
 *
 * 分布式理论依据：
 * - Bully 算法：任何发现领导者失效的进程，向所有更高优先级进程发起选举；
 *   若无响应，则自升为领导者并广播 COORDINATOR 消息。
 *   最终领导者必为所有存活进程中 ID 最大者。
 * - Ring 算法：进程按逻辑环排列，选举消息沿环传递并携带当前见过的最大 ID；
 *   当消息绕环一周回到发起者时，ID 最大者被确认为领导者。
 */

export interface ElectionMsg {
  readonly type: 'ELECTION' | 'OK' | 'COORDINATOR' | 'RING_ELECTION';
  readonly senderId: string;
  readonly maxId: string;
}

export class BullyProcess {
  readonly id: string;
  readonly priority: number;
  private alive = true;
  private leader: string | null = null;
  private neighbors: BullyProcess[] = [];
  private gotOk = false;

  constructor(id: string, priority: number) {
    this.id = id;
    this.priority = priority;
  }

  setAlive(alive: boolean): void {
    this.alive = alive;
  }

  isAlive(): boolean {
    return this.alive;
  }

  setNeighbors(all: BullyProcess[]): void {
    this.neighbors = all.filter(n => n.id !== this.id);
  }

  getLeader(): string | null {
    return this.leader;
  }

  /** 发起 Bully 选举 */
  startElection(): void {
    if (!this.alive) return;
    this.leader = null;
    this.gotOk = false;
    console.log(`[Bully ${this.id}] 发起选举`);

    const higher = this.neighbors.filter(n => n.priority > this.priority && n.isAlive());
    if (higher.length === 0) {
      this.declareLeader();
      return;
    }

    for (const n of higher) {
      n.receiveMessage({ type: 'ELECTION', senderId: this.id, maxId: this.id });
    }

    // 简化：同步检查是否有 OK 响应
    if (!this.gotOk) {
      this.declareLeader();
    }
  }

  receiveMessage(msg: ElectionMsg): void {
    if (!this.alive) return;
    switch (msg.type) {
      case 'ELECTION': {
        const sender = this.neighbors.find(n => n.id === msg.senderId);
        if (this.priority > (sender?.priority ?? 0)) {
          sender?.receiveMessage({ type: 'OK', senderId: this.id, maxId: this.id });
          this.startElection();
        }
        break;
      }
      case 'OK':
        this.gotOk = true;
        break;
      case 'COORDINATOR':
        this.leader = msg.maxId;
        console.log(`[Bully ${this.id}] 确认领导者: ${msg.maxId}`);
        break;
    }
  }

  private declareLeader(): void {
    this.leader = this.id;
    console.log(`[Bully ${this.id}] 自升为领导者`);
    for (const n of this.neighbors) {
      if (n.isAlive()) {
        n.receiveMessage({ type: 'COORDINATOR', senderId: this.id, maxId: this.id });
      }
    }
  }
}

export class RingProcess {
  readonly id: string;
  readonly priority: number;
  private alive = true;
  private next: RingProcess | null = null;
  private leader: string | null = null;

  constructor(id: string, priority: number) {
    this.id = id;
    this.priority = priority;
  }

  setAlive(alive: boolean): void {
    this.alive = alive;
  }

  isAlive(): boolean {
    return this.alive;
  }

  setNext(node: RingProcess): void {
    this.next = node;
  }

  getLeader(): string | null {
    return this.leader;
  }

  startElection(): void {
    if (!this.alive) return;
    console.log(`[Ring ${this.id}] 发起环选举`);
    this.pass({ type: 'RING_ELECTION', senderId: this.id, maxId: this.id });
  }

  pass(msg: ElectionMsg): void {
    if (!this.alive) return;
    if (msg.type !== 'RING_ELECTION') return;

    const myPriority = this.priority;
    const candidatePriority = this.getPriority(msg.maxId);
    const newMax = myPriority > candidatePriority ? this.id : msg.maxId;

    if (msg.senderId === this.id && msg.maxId !== this.id) {
      // 消息绕环一周回来
      this.leader = msg.maxId;
      console.log(`[Ring ${this.id}] 选举完成，领导者: ${msg.maxId}`);
      return;
    }

    this.next?.pass({ type: 'RING_ELECTION', senderId: msg.senderId, maxId: newMax });
  }

  private getPriority(id: string): number {
    const m = id.match(/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
  }
}

export class ElectionCluster {
  private bullyProcesses = new Map<string, BullyProcess>();
  private ringProcesses = new Map<string, RingProcess>();

  addBully(p: BullyProcess): void {
    this.bullyProcesses.set(p.id, p);
    for (const n of this.bullyProcesses.values()) {
      n.setNeighbors(Array.from(this.bullyProcesses.values()));
    }
  }

  addRing(p: RingProcess): void {
    this.ringProcesses.set(p.id, p);
    const nodes = Array.from(this.ringProcesses.values());
    for (let i = 0; i < nodes.length; i++) {
      nodes[i]!.setNext(nodes[(i + 1) % nodes.length]!);
    }
  }

  runBully(initiatorId: string): string | null {
    const p = this.bullyProcesses.get(initiatorId);
    if (!p) return null;
    p.startElection();
    for (const n of this.bullyProcesses.values()) {
      if (n.getLeader()) return n.getLeader();
    }
    return null;
  }

  runRing(initiatorId: string): string | null {
    const p = this.ringProcesses.get(initiatorId);
    if (!p) return null;
    p.startElection();
    for (const n of this.ringProcesses.values()) {
      if (n.getLeader()) return n.getLeader();
    }
    return null;
  }
}

export function demo(): void {
  console.log('=== 领导者选举算法演示 ===\n');

  const cluster = new ElectionCluster();

  console.log('--- Bully 算法 ---');
  const b1 = new BullyProcess('b1', 1);
  const b2 = new BullyProcess('b2', 2);
  const b3 = new BullyProcess('b3', 3);
  const b4 = new BullyProcess('b4', 4);
  const b5 = new BullyProcess('b5', 5);
  cluster.addBully(b1);
  cluster.addBully(b2);
  cluster.addBully(b3);
  cluster.addBully(b4);
  cluster.addBully(b5);

  b5.setAlive(false);
  const bullyLeader = cluster.runBully('b1');
  console.log(`Bully 选举结果: 领导者 = ${bullyLeader}`);

  console.log('\n--- Ring 算法 ---');
  cluster.addRing(new RingProcess('r1', 1));
  cluster.addRing(new RingProcess('r2', 2));
  cluster.addRing(new RingProcess('r3', 3));
  cluster.addRing(new RingProcess('r4', 4));
  cluster.addRing(new RingProcess('r5', 5));

  const ringLeader = cluster.runRing('r1');
  console.log(`Ring 选举结果: 领导者 = ${ringLeader}`);
}
