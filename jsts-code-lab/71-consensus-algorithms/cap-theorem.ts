/**
 * @file CAP 定理可运行演示
 * @category Consensus → CAP Theorem
 * @difficulty medium
 * @tags cap-theorem, consistency, availability, partition-tolerance
 * @description
 * CAP 定理指出：在存在网络分区（P）时，分布式系统必须在一致性（C）和可用性（A）之间做出权衡。
 * 本演示通过模拟读写请求，直观展示 CP 系统与 AP 系统在分区时的不同行为。
 */

export type SystemMode = 'CP' | 'AP';

export interface NodeValue {
  value: number;
  version: number;
}

export class CapNode {
  readonly id: string;
  private store = new Map<string, NodeValue>();
  private reachableNodes = new Set<string>();

  constructor(id: string) {
    this.id = id;
    this.store.set('counter', { value: 0, version: 0 });
  }

  setReachable(nodes: string[]): void {
    this.reachableNodes = new Set(nodes);
  }

  get(key: string): NodeValue | undefined {
    return this.store.get(key);
  }

  /** CP 写入：必须同步到多数派才返回成功 */
  writeCP(key: string, value: number): boolean {
    const reachableCount = this.reachableNodes.size;
    // 包含自己
    const totalReachable = reachableCount;
    // 简化的多数派判断：假设全集群 5 节点
    const majority = 3;
    if (totalReachable < majority) {
      console.log(`[CP ${this.id}] 拒绝写入：可达节点 ${totalReachable} < 多数派 ${majority}`);
      return false;
    }
    const newVersion = (this.store.get(key)?.version ?? 0) + 1;
    const nv = { value, version: newVersion };
    // 同步到所有可达节点
    this.store.set(key, nv);
    return true;
  }

  /** AP 写入：总是成功，但可能只同步到部分节点 */
  writeAP(key: string, value: number): boolean {
    const newVersion = (this.store.get(key)?.version ?? 0) + 1;
    this.store.set(key, { value, version: newVersion });
    return true;
  }

  syncTo(other: CapNode, key: string): void {
    if (!this.reachableNodes.has(other.id)) return;
    const v = this.store.get(key);
    if (v) other.store.set(key, { ...v });
  }
}

export class CapDemoSystem {
  private nodes = new Map<string, CapNode>();

  addNode(id: string): void {
    this.nodes.set(id, new CapNode(id));
  }

  getNode(id: string): CapNode | undefined {
    return this.nodes.get(id);
  }

  /** 创建网络分区 */
  partition(groupA: string[], groupB: string[]): void {
    for (const n of this.nodes.values()) {
      const all = [...groupA, ...groupB];
      n.setReachable(all.filter(id => (groupA.includes(n.id) && groupA.includes(id)) || (groupB.includes(n.id) && groupB.includes(id))));
    }
    console.log(`\n[CAP] 网络分区: A=[${groupA.join(',')}], B=[${groupB.join(',')}]`);
  }

  heal(): void {
    for (const n of this.nodes.values()) {
      n.setReachable(Array.from(this.nodes.keys()));
    }
    console.log('[CAP] 分区恢复');
  }

  checkConsistency(key: string): boolean {
    const values = Array.from(this.nodes.values()).map(n => n.get(key)).filter((v): v is NodeValue => v !== undefined);
    if (values.length === 0) return true;
    const first = values[0];
    return values.every(v => v.value === first.value && v.version === first.version);
  }
}

export function demo(): void {
  console.log('=== CAP 定理演示：CP vs AP ===\n');

  // CP 演示
  const cpSystem = new CapDemoSystem();
  for (let i = 1; i <= 5; i++) cpSystem.addNode(`node-${i}`);
  console.log('--- CP 模式：一致性优先 ---');
  cpSystem.partition(['node-1', 'node-2'], ['node-3', 'node-4', 'node-5']);
  const cp1 = cpSystem.getNode('node-1')?.writeCP('counter', 100) ?? false;
  const cp2 = cpSystem.getNode('node-3')?.writeCP('counter', 200) ?? false;
  console.log(`node-1 写入结果: ${cp1 ? '成功' : '失败'}`);
  console.log(`node-3 写入结果: ${cp2 ? '成功' : '失败'}`);
  console.log(`系统一致性: ${cpSystem.checkConsistency('counter') ? '一致' : '不一致'}`);
  console.log(`系统可用性: ${cp1 && cp2 ? '完全可用' : '部分不可用'} (牺牲可用性保证一致性)`);

  // AP 演示
  const apSystem = new CapDemoSystem();
  for (let i = 1; i <= 5; i++) apSystem.addNode(`node-${i}`);
  console.log('\n--- AP 模式：可用性优先 ---');
  apSystem.partition(['node-1', 'node-2'], ['node-3', 'node-4', 'node-5']);
  const ap1 = apSystem.getNode('node-1')?.writeAP('counter', 100) ?? false;
  const ap2 = apSystem.getNode('node-3')?.writeAP('counter', 200) ?? false;
  // 手动同步到各自分区
  for (const id of ['node-1', 'node-2']) {
    apSystem.getNode('node-1')?.syncTo(apSystem.getNode(id)!, 'counter');
  }
  for (const id of ['node-3', 'node-4', 'node-5']) {
    apSystem.getNode('node-3')?.syncTo(apSystem.getNode(id)!, 'counter');
  }
  console.log(`node-1 写入结果: ${ap1 ? '成功' : '失败'}`);
  console.log(`node-3 写入结果: ${ap2 ? '成功' : '失败'}`);
  console.log(`系统一致性: ${apSystem.checkConsistency('counter') ? '一致' : '不一致'}`);
  console.log(`node-1 值: ${apSystem.getNode('node-1')?.get('counter')?.value}, node-3 值: ${apSystem.getNode('node-3')?.get('counter')?.value}`);
  console.log(`系统可用性: ${ap1 && ap2 ? '完全可用' : '部分不可用'} (牺牲一致性保证可用性)`);

  apSystem.heal();
}
