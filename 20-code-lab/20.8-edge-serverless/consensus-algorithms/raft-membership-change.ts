/**
 * @file Raft 成员变更（联合共识 Joint Consensus）
 * @category Consensus → Raft → Membership Change
 * @difficulty hard
 * @description
 * Raft 的成员变更是极具挑战性的问题：直接切换配置可能导致两个独立的多数派。
 * 联合共识（Joint Consensus）通过让集群同时按旧配置 C_old 和新配置 C_new 决策，
 * 保证安全性。只有日志条目被 C_old 和 C_new 同时接受时才算提交。
 *
 * 数学模型：
 * - 旧配置 C_old，新配置 C_new。
 * - 联合配置 C_old,new = C_old ∪ C_new。
 * - 提交条件：条目需分别获得 C_old 的多数派和 C_new 的多数派。
 * - 阶段：
 *   1. 领导者将 C_old,new 写入日志并提交。
 *   2. 所有节点收到 C_old,new 后立即采用它进行决策。
 *   3. 领导者将 C_new 写入日志并提交。
 *   4. 所有节点收到 C_new 后完成切换。
 *
 * @complexity_analysis
 * - 消息复杂度：O(|C_old| + |C_new|)，每次投票需分别统计两个配置的多数派
 * - 空间复杂度：O(1) 额外，每个节点只需维护当前配置和联合配置
 */

export interface MembershipConfig {
  readonly name: 'C_old' | 'C_old,new' | 'C_new';
  readonly nodes: readonly string[];
}

export interface MembershipLogEntry {
  readonly term: number;
  readonly index: number;
  readonly type: 'config' | 'command';
  readonly config?: MembershipConfig;
  readonly command?: string;
}

export class RaftMemberNode {
  readonly id: string;
  currentTerm = 0;
  log: MembershipLogEntry[] = [];
  commitIndex = 0;
  private currentConfig: MembershipConfig;

  constructor(id: string, initialConfig: MembershipConfig) {
    this.id = id;
    this.currentConfig = initialConfig;
  }

  get config(): MembershipConfig {
    return this.currentConfig;
  }

  applyConfig(entry: MembershipLogEntry): void {
    if (entry.type === 'config' && entry.config) {
      this.currentConfig = entry.config;
      console.log(`[Membership ${this.id}] 应用配置: ${entry.config.name} -> [${entry.config.nodes.join(', ')}]`);
    }
  }

  /** 检查某组节点是否构成当前配置的多数派 */
  isMajority(voters: readonly string[]): boolean {
    const count = voters.filter(id => this.currentConfig.nodes.includes(id)).length;
    return count > this.currentConfig.nodes.length / 2;
  }

  /** 检查是否同时满足旧配置和新配置的多数派（联合共识） */
  isJointMajority(voters: readonly string[], oldNodes: readonly string[], newNodes: readonly string[]): boolean {
    const oldCount = voters.filter(id => oldNodes.includes(id)).length;
    const newCount = voters.filter(id => newNodes.includes(id)).length;
    return oldCount > oldNodes.length / 2 && newCount > newNodes.length / 2;
  }
}

export class RaftMembershipChanger {
  private nodes = new Map<string, RaftMemberNode>();
  private oldNodes: readonly string[] = [];
  private newNodes: readonly string[] = [];
  private leaderId: string | null = null;

  initialize(nodes: string[]): void {
    this.oldNodes = [...nodes];
    const config: MembershipConfig = { name: 'C_old', nodes: this.oldNodes };
    for (const id of nodes) {
      const node = new RaftMemberNode(id, config);
      this.nodes.set(id, node);
    }
  }

  setLeader(id: string): void {
    this.leaderId = id;
  }

  getNode(id: string): RaftMemberNode | undefined {
    return this.nodes.get(id);
  }

  /** 阶段1：提议联合配置 C_old,new */
  proposeJointConsensus(newNodes: string[]): MembershipLogEntry | null {
    if (!this.leaderId) return null;
    const leader = this.nodes.get(this.leaderId);
    if (!leader) return null;

    this.newNodes = [...newNodes];
    const jointNodes = Array.from(new Set([...this.oldNodes, ...this.newNodes]));
    const jointConfig: MembershipConfig = { name: 'C_old,new', nodes: jointNodes };

    const entry: MembershipLogEntry = {
      term: leader.currentTerm,
      index: leader.log.length + 1,
      type: 'config',
      config: jointConfig
    };
    leader.log.push(entry);
    console.log(`[MembershipChange] 领导者 ${this.leaderId} 提议联合配置: [${jointNodes.join(', ')}]`);
    return entry;
  }

  /** 复制日志条目到所有相关节点并尝试提交 */
  replicateAndCommit(entry: MembershipLogEntry): boolean {
    if (!this.leaderId) return false;
    const leader = this.nodes.get(this.leaderId)!;

    // 确定需要复制的目标节点集合
    const targetNodes = entry.config ? entry.config.nodes : leader.config.nodes;

    // 收集投票（简化：所有可达节点自动同意）
    const voters: string[] = [this.leaderId];
    for (const id of targetNodes) {
      if (id === this.leaderId) continue;
      const node = this.nodes.get(id);
      if (!node) {
        // 新节点可能还不存在，模拟创建
        const newNode = new RaftMemberNode(id, { name: 'C_old,new', nodes: targetNodes });
        newNode.currentTerm = leader.currentTerm;
        this.nodes.set(id, newNode);
      }
      const target = this.nodes.get(id)!;
      target.log.push(entry);
      voters.push(id);
    }

    // 提交判断
    let canCommit = false;
    if (entry.config?.name === 'C_old,new') {
      canCommit = leader.isJointMajority(voters, this.oldNodes, this.newNodes);
    } else if (entry.config?.name === 'C_new') {
      canCommit = voters.filter(id => this.newNodes.includes(id)).length > this.newNodes.length / 2;
    } else {
      canCommit = leader.isMajority(voters);
    }

    if (canCommit) {
      leader.commitIndex = entry.index;
      leader.applyConfig(entry);
      for (const id of targetNodes) {
        this.nodes.get(id)?.applyConfig(entry);
      }
      console.log(`[MembershipChange] 配置条目 ${entry.config?.name} @ index=${entry.index} 已提交`);
    }

    return canCommit;
  }

  /** 阶段2：提议新配置 C_new */
  proposeNewConfig(): MembershipLogEntry | null {
    if (!this.leaderId) return null;
    const leader = this.nodes.get(this.leaderId);
    if (!leader) return null;

    const newConfig: MembershipConfig = { name: 'C_new', nodes: this.newNodes };
    const entry: MembershipLogEntry = {
      term: leader.currentTerm,
      index: leader.log.length + 1,
      type: 'config',
      config: newConfig
    };
    leader.log.push(entry);
    console.log(`[MembershipChange] 领导者 ${this.leaderId} 提议新配置 C_new: [${this.newNodes.join(', ')}]`);
    return entry;
  }

  /** 完整演示：从 3 节点安全过渡到 5 节点 */
  transition3To5(): boolean {
    console.log('=== Raft 联合共识成员变更演示 ===\n');

    // 初始 3 节点
    this.initialize(['node-1', 'node-2', 'node-3']);
    this.setLeader('node-1');
    for (const n of this.nodes.values()) n.currentTerm = 1;

    console.log(`初始配置 C_old: [${this.oldNodes.join(', ')}]`);

    // 阶段1：联合配置
    const jointEntry = this.proposeJointConsensus(['node-1', 'node-2', 'node-3', 'node-4', 'node-5']);
    if (!jointEntry) return false;
    const jointOk = this.replicateAndCommit(jointEntry);
    if (!jointOk) {
      console.log('联合配置提交失败');
      return false;
    }

    // 阶段2：新配置
    const newEntry = this.proposeNewConfig();
    if (!newEntry) return false;
    const newOk = this.replicateAndCommit(newEntry);
    if (!newOk) {
      console.log('新配置提交失败');
      return false;
    }

    console.log('\n成员变更完成。');
    return true;
  }

  getClusterConfigSummary(): { id: string; configName: string; commitIndex: number }[] {
    return Array.from(this.nodes.entries()).map(([id, node]) => ({
      id,
      configName: node.config.name,
      commitIndex: node.commitIndex
    }));
  }
}

export function demo(): void {
  const changer = new RaftMembershipChanger();
  changer.transition3To5();

  console.log('\n--- 最终节点配置 ---');
  for (const summary of changer.getClusterConfigSummary()) {
    console.log(`${summary.id}: ${summary.configName}, commitIndex=${summary.commitIndex}`);
  }
}
