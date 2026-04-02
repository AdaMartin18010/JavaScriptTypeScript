/**
 * @file 分布式时钟：Lamport 逻辑时钟与向量时钟
 * @category Consensus → Distributed Clock
 * @difficulty medium
 * @tags lamport-clock, vector-clock, causality, happened-before
 * @description
 * 在分布式系统中，物理时钟同步困难，因此需要逻辑时钟来刻画事件的因果关系。
 * Lamport 逻辑时钟提供偏序关系（happened-before），而向量时钟可提供并发事件的检测能力。
 *
 * 分布式理论依据：
 * - happened-before 关系（→）是分布式系统中的基本因果序。
 * - 若事件 a → b，则 a 可能在因果上影响了 b。
 * - Lamport 时钟：若 a → b，则 C(a) < C(b)；但 C(a) < C(b) 不一定意味着 a → b（无法检测并发）。
 * - 向量时钟：通过维护每个进程的本地计数器，可以精确判断两个事件是因果关系还是并发关系。
 */

/** Lamport 逻辑时钟 */
export class LamportClock {
  private time = 0;
  readonly processId: string;

  constructor(processId: string) {
    this.processId = processId;
  }

  /** 本地事件发生，时钟递增 */
  tick(): number {
    this.time += 1;
    return this.time;
  }

  /** 接收到消息时，更新本地时钟为 max(本地, 消息时钟) + 1 */
  receive(messageTime: number): number {
    this.time = Math.max(this.time, messageTime) + 1;
    return this.time;
  }

  current(): number {
    return this.time;
  }
}

/** 向量时钟 */
export class VectorClock {
  private vector = new Map<string, number>();
  readonly processId: string;

  constructor(processId: string) {
    this.processId = processId;
    this.vector.set(processId, 0);
  }

  /** 本地事件发生 */
  tick(): ReadonlyMap<string, number> {
    this.vector.set(this.processId, (this.vector.get(this.processId) ?? 0) + 1);
    return new Map(this.vector);
  }

  /** 接收消息时，逐分量取最大值，然后本地分量加一 */
  receive(other: ReadonlyMap<string, number>): ReadonlyMap<string, number> {
    for (const [pid, time] of other) {
      this.vector.set(pid, Math.max(this.vector.get(pid) ?? 0, time));
    }
    this.vector.set(this.processId, (this.vector.get(this.processId) ?? 0) + 1);
    return new Map(this.vector);
  }

  current(): ReadonlyMap<string, number> {
    return new Map(this.vector);
  }

  /** 比较两个向量时钟的关系 */
  static compare(a: ReadonlyMap<string, number>, b: ReadonlyMap<string, number>): 'before' | 'after' | 'concurrent' | 'equal' {
    let allALessOrEqual = true;
    let allBLessOrEqual = true;
    const keys = new Set([...a.keys(), ...b.keys()]);

    for (const k of keys) {
      const av = a.get(k) ?? 0;
      const bv = b.get(k) ?? 0;
      if (av > bv) allBLessOrEqual = false;
      if (bv > av) allALessOrEqual = false;
    }

    if (allALessOrEqual && allBLessOrEqual) return 'equal';
    if (allALessOrEqual) return 'before';
    if (allBLessOrEqual) return 'after';
    return 'concurrent';
  }
}

export function demo(): void {
  console.log('=== 分布式时钟演示 ===\n');

  // Lamport 时钟演示
  console.log('--- Lamport 逻辑时钟 ---');
  const p1 = new LamportClock('P1');
  const p2 = new LamportClock('P2');

  const t1 = p1.tick(); // P1 事件 a
  console.log(`P1 事件 a: L=${t1}`);

  const t2 = p2.receive(t1); // P2 接收来自 P1 的消息后发生事件 b
  console.log(`P2 事件 b (接收消息后): L=${t2}`);

  const t3 = p1.tick(); // P1 事件 c
  console.log(`P1 事件 c: L=${t3}`);

  console.log(`结论: L(a)=${t1} < L(b)=${t2} < L(c)=${t3}，满足 happened-before 传递性。\n`);

  // 向量时钟演示
  console.log('--- 向量时钟 ---');
  const v1 = new VectorClock('P1');
  const v2 = new VectorClock('P2');
  const v3 = new VectorClock('P3');

  const va = v1.tick(); // P1 事件 a
  console.log(`P1 事件 a: V=${JSON.stringify(Object.fromEntries(va))}`);

  const vb = v2.receive(va); // P2 接收后事件 b
  console.log(`P2 事件 b: V=${JSON.stringify(Object.fromEntries(vb))}`);

  const vc = v1.tick(); // P1 事件 c
  console.log(`P1 事件 c: V=${JSON.stringify(Object.fromEntries(vc))}`);

  const vd = v3.tick(); // P3 事件 d（独立发生，与 a/b/c 无因果关联）
  console.log(`P3 事件 d: V=${JSON.stringify(Object.fromEntries(vd))}`);

  // 比较
  console.log('\n--- 向量时钟比较 ---');
  console.log(`a -> b: ${VectorClock.compare(va, vb)}`);
  console.log(`a -> c: ${VectorClock.compare(va, vc)}`);
  console.log(`b vs c: ${VectorClock.compare(vb, vc)} (并发事件，无因果关联)`);
  console.log(`c vs d: ${VectorClock.compare(vc, vd)} (并发事件，无因果关联)`);
}
