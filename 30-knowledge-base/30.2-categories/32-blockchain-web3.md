---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# Web3 与区块链（Application Domain）

> **维度**: 应用领域 | **边界**: 本文档聚焦 DApp 开发与区块链交互技术，底层共识算法和密码学原语请参见 `jsts-code-lab/71-consensus-algorithms` 和 `jsts-code-lab/81-cybersecurity`。

---

## 分类概览

| 类别 | 代表库 | 适用场景 |
|------|--------|----------|
| 合约交互 | ethers.js, viem, web3.js | 智能合约调用、交易签名 |
| 钱包连接 | RainbowKit, ConnectKit, Web3Modal | 多钱包登录 |
| 索引服务 | The Graph, Goldsky | 链上数据查询 |
| 存储 | IPFS, Arweave, Bundlr | 去中心化文件存储 |
| 开发框架 | Hardhat, Foundry, Scaffold-ETH | 合约开发环境 |

---

## 核心库

### ethers.js v6

- **Stars**: 7k+ (ethers-io/ethers.js)
- **TS支持**: ✅ 原生
- **特点**: 轻量、类型安全、模块化

### viem

- **Stars**: 5k+ (wagmi-dev/viem)
- **TS支持**: ✅ 原生
- **特点**: 现代化设计、Tree-shaking、与 wagmi 深度集成

---

## 与基础设施的边界

```
应用领域 (本文档)                     基础设施层
├─ DApp 前端开发                       ├─ 共识算法 (Paxos/Raft)
├─ 钱包集成与交易                      ├─ 密码学原语 (哈希/签名)
├─ 智能合约 ABI 交互                   ├─ 区块链节点运营
└─ NFT / DeFi 应用逻辑                 └─ Layer 1 协议设计
```

---

## 关联资源

- `jsts-code-lab/34-blockchain-web3/` — Web3 基础模式
- `jsts-code-lab/83-blockchain-advanced/` — 高级区块链（Layer 2、Rollup）
- `docs/application-domains-index.md` — 应用领域总索引

---

> 📅 最后更新: 2026-04-27
