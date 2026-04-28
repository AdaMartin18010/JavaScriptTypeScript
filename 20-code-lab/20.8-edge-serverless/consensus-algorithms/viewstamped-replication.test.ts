/**
 * @file Viewstamped Replication 单元测试
 * @description 测试 VR 的正常请求处理与视图变更
 */

import { describe, it, expect } from 'vitest';
import { VrReplica, VrCluster } from './viewstamped-replication.js';

describe('VrCluster', () => {
  it('should process client requests with primary', () => {
    const cluster = new VrCluster();
    cluster.addReplica(new VrReplica('r1'));
    cluster.addReplica(new VrReplica('r2'));
    cluster.addReplica(new VrReplica('r3'));
    cluster.getReplica('r1')?.setPrimary();

    const ok = cluster.clientRequest('client-1', 1, 'SET x=1');
    expect(ok).toBe(true);

    const primary = cluster.getReplica('r1');
    expect(primary?.currentCommitNumber).toBe(1);
  });

  it('should perform view change and elect new primary', () => {
    const cluster = new VrCluster();
    for (let i = 1; i <= 5; i++) {
      cluster.addReplica(new VrReplica(`r${i}`));
    }
    cluster.getReplica('r1')?.setPrimary();

    cluster.clientRequest('client-1', 1, 'SET x=1');
    const changed = cluster.performViewChange(1);
    expect(changed).toBe(true);

    // view 1 的主节点应为 r2（1 % 5 = 1，第二个副本）
    const newPrimary = cluster.getReplica('r2');
    expect(newPrimary?.currentRole).toBe('primary');
    expect(newPrimary?.currentView).toBe(1);
  });

  it('should maintain quorum size correctly', () => {
    const cluster = new VrCluster();
    cluster.addReplica(new VrReplica('r1'));
    cluster.addReplica(new VrReplica('r2'));
    cluster.addReplica(new VrReplica('r3'));
    expect(cluster.quorumSize).toBe(2);
  });
});
