---
dimension: 综合
sub-dimension: Consensus algorithms
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Consensus algorithms 核心概念与工程实践。

## 包含内容

- 本模块聚焦 consensus algorithms 核心概念与工程实践。
- 涵盖 CAP 定理形式化验证、Paxos/Raft 共识实现、领导者选举与分布式时钟同步。

## 子模块速查

| 子模块 | 类型 | 说明 |
|--------|------|------|
| ARCHITECTURE.md | 文档 | 共识算法架构设计 |
| README.md | 文档 | 模块入口与快速开始 |
| THEORY.md | 文档 | 共识理论形式化定义 |
| cap-theorem.ts | 源码 | CAP 定理 TypeScript 实现 |
| cap-theorem-formal.ts | 源码 | CAP 定理形式化证明 |
| distributed-clock.ts | 源码 | 分布式逻辑时钟 |
| leader-election.ts | 源码 | 领导者选举算法 |
| paxos-consensus.ts | 源码 | Multi-Paxos 共识实现 |
| index.ts | 源码 | 模块统一导出 |

## 代码示例

```typescript
// paxos-consensus.ts — 简化的 Paxos Accept 阶段
interface Proposal {
  id: number;
  value: string;
}

class PaxosAcceptor {
  private promisedId = -1;
  private accepted: Proposal | null = null;

  prepare(proposalId: number): Promise<{ ok: boolean; accepted?: Proposal }> {
    if (proposalId <= this.promisedId) {
      return Promise.resolve({ ok: false });
    }
    this.promisedId = proposalId;
    return Promise.resolve({ ok: true, accepted: this.accepted ?? undefined });
  }

  accept(proposal: Proposal): Promise<boolean> {
    if (proposal.id < this.promisedId) return Promise.resolve(false);
    this.accepted = proposal;
    return Promise.resolve(true);
  }
}
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
## 目录内容

- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 cap-theorem-formal.test.ts
- 📄 cap-theorem-formal.ts
- 📄 cap-theorem.ts
- 📄 consensus-algorithms.test.ts
- 📄 distributed-clock.ts
- 📄 index.ts
- 📄 leader-election-theory.test.ts
- 📄 leader-election-theory.ts
- 📄 leader-election.ts
- 📄 paxos-consensus.test.ts
- 📄 paxos-consensus.ts
- ... 等 13 个条目


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Paxos Made Simple | 论文 | [lamport.azurewebsites.net](https://lamport.azurewebsites.net/pubs/paxos-simple.pdf) |
| Raft Consensus | 论文 | [raft.github.io](https://raft.github.io/raft.pdf) |
| FLP Impossibility | 论文 | [groups.csail.mit.edu](https://groups.csail.mit.edu/tds/papers/Lynch/jacm85.pdf) |
| etcd Raft Implementation | 源码 | [github.com/etcd-io/raft](https://github.com/etcd-io/raft) |
| Consus (Deterministic Consensus) | 论文 | [arxiv.org/abs/1502.05831](https://arxiv.org/abs/1502.05831) |

---

*最后更新: 2026-04-29*
