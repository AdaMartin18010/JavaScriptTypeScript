/**
 * @file CAP 定理形式化模型单元测试
 * @description 验证分区时 CP 与 AP 的权衡
 */

import { describe, it, expect } from 'vitest';
import { CapDistributedSystem } from './cap-theorem-formal.js';

describe('CapDistributedSystem', () => {
  it('should demonstrate CP sacrifices availability during partition', () => {
    const sys = new CapDistributedSystem();
    for (let i = 1; i <= 5; i++) {
      sys.addNode(`node-${i}`, 0);
    }

    sys.createPartition(['node-1', 'node-2'], ['node-3', 'node-4', 'node-5']);

    const ok1 = sys.writeCP('node-1', 'client-A', 100); // minority partition -> rejected
    const ok2 = sys.writeCP('node-3', 'client-B', 200); // majority partition -> accepted

    expect(ok1).toBe(false);
    expect(ok2).toBe(true);
    // CP 下 minority 分区不可用，majority 分区保持线性一致
    expect(sys.read('node-3')?.value).toBe(200);
    expect(sys.read('node-1')?.value).toBe(0); // minority 保持旧值
  });

  it('should demonstrate AP sacrifices consistency during partition', () => {
    const sys = new CapDistributedSystem();
    for (let i = 1; i <= 5; i++) {
      sys.addNode(`node-${i}`, 0);
    }

    sys.createPartition(['node-1', 'node-2'], ['node-3', 'node-4', 'node-5']);

    const ok1 = sys.writeAP('node-1', 'client-A', 100);
    const ok2 = sys.writeAP('node-3', 'client-B', 200);

    expect(ok1).toBe(true);
    expect(ok2).toBe(true);
    expect(sys.checkConsistency()).toBe(false); // AP may diverge

    // Verify divergence
    expect(sys.read('node-1')?.value).toBe(100);
    expect(sys.read('node-3')?.value).toBe(200);
  });

  it('should restore consistency after healing partition', () => {
    const sys = new CapDistributedSystem();
    sys.addNode('node-1', 0);
    sys.addNode('node-2', 0);
    sys.addNode('node-3', 0);

    sys.createPartition(['node-1'], ['node-2', 'node-3']);
    sys.writeAP('node-1', 'client-A', 10);
    sys.writeAP('node-2', 'client-B', 20);

    expect(sys.checkConsistency()).toBe(false);
    sys.healPartition();
    // After healing, the model does not auto-merge, but connectivity is restored
    expect(sys.getNode('node-1')?.reachable.has('node-2')).toBe(true);
  });
});
