/**
 * @file PBFT 单元测试
 * @description 测试拜占庭容错共识在 f=1 时的正确性
 */

import { describe, it, expect } from 'vitest';
import { PbftNetwork, PbftNode } from './pbft-consensus.js';

// 复用模块内部摘要函数（测试用简化版）
function digest(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return `0x${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

describe('PbftNetwork', () => {
  it('should reach consensus with n=4 and f=1 byzantine node', () => {
    const network = new PbftNetwork();
    network.addNode(new PbftNode('node-1', false));
    network.addNode(new PbftNode('node-2', false));
    network.addNode(new PbftNode('node-3', false));
    network.addNode(new PbftNode('node-4', true)); // byzantine

    expect(network.f).toBe(1);
    expect(network.quorum).toBe(3);

    const success = network.request('client-1', 'transfer $100');
    expect(success).toBe(true);

    // 所有诚实节点都应提交
    const honestNodes = [network.getNode('node-1'), network.getNode('node-2'), network.getNode('node-3')];
    for (const node of honestNodes) {
      expect(node?.hasCommitted(digest('transfer $100'))).toBe(true);
    }
  });

  it('should identify byzantine node differently from honest nodes', () => {
    const honest = new PbftNode('honest', false);
    const byzantine = new PbftNode('byzantine', true);

    expect(honest.isByzantine).toBe(false);
    expect(byzantine.isByzantine).toBe(true);
  });

  it('should compute correct quorum for n=7 (f=2)', () => {
    const network = new PbftNetwork();
    for (let i = 1; i <= 7; i++) {
      network.addNode(new PbftNode(`node-${i}`, false));
    }
    expect(network.f).toBe(2);
    expect(network.quorum).toBe(5);
  });
});
