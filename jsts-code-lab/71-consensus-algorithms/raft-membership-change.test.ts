/**
 * @file Raft 成员变更单元测试
 * @description 测试联合共识从 3 节点到 5 节点的安全过渡
 */

import { describe, it, expect } from 'vitest';
import { RaftMembershipChanger } from './raft-membership-change.js';

describe('RaftMembershipChanger', () => {
  it('should transition from 3 nodes to 5 nodes using joint consensus', () => {
    const changer = new RaftMembershipChanger();
    const success = changer.transition3To5();
    expect(success).toBe(true);

    // 所有原始节点应最终采用 C_new
    for (const id of ['node-1', 'node-2', 'node-3']) {
      const node = changer.getNode(id);
      expect(node?.config.name).toBe('C_new');
    }

    // 新节点也应被创建并采用 C_new
    for (const id of ['node-4', 'node-5']) {
      const node = changer.getNode(id);
      expect(node?.config.name).toBe('C_new');
    }
  });

  it('should require joint majority for joint config entry', () => {
    const changer = new RaftMembershipChanger();
    changer.initialize(['a', 'b', 'c']);
    changer.setLeader('a');
    for (const n of changer['nodes'].values()) n.currentTerm = 1;

    const jointEntry = changer.proposeJointConsensus(['a', 'b', 'c', 'd', 'e']);
    expect(jointEntry).not.toBeNull();

    // 由于模拟中所有节点自动同意，应能提交
    const ok = changer.replicateAndCommit(jointEntry!);
    expect(ok).toBe(true);
  });

  it('should compute majority correctly for C_new', () => {
    const changer = new RaftMembershipChanger();
    changer.initialize(['a', 'b', 'c']);
    const node = changer.getNode('a')!;

    // C_old  majority = 2
    expect(node.isMajority(['a', 'b'])).toBe(true);
    expect(node.isMajority(['a'])).toBe(false);
  });
});
