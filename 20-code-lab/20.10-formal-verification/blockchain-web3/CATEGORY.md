---
dimension: 应用领域
application-domain: Web3 与区块链
created: 2026-04-27
---

# 维度标注

- **所属维度**: 应用领域（Application Domain）
- **应用域**: Web3 与区块链 — DApp 开发、智能合约交互与去中心化应用
- **模块编号**: 34-blockchain-web3

## 边界说明

本模块聚焦区块链应用开发模式，包括：

- 以太坊基础与智能合约交互
- Web3.js / Ethers.js 使用模式
- 钱包集成与 NFT / DeFi 逻辑

底层共识算法、密码学原语和区块链节点运营不属于本模块范围。

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `ethereum-basics/` | 以太坊交互基础 | `connect-provider.ts`, `send-transaction.ts` |
| `smart-contracts/` | 智能合约 ABI 交互 | `contract-read-write.ts`, `event-listener.ts` |
| `wallet-integration/` | 钱包连接与签名 | `metamask-connect.ts`, `walletconnect-v2.ts` |
| `nft-defi/` | NFT 与 DeFi 协议交互 | `erc721-mint.ts`, `uniswap-swap.ts` |

## Web3 库对比

| 特性 | Ethers.js v6 | Web3.js v4 | Viem | wagmi |
|------|-------------|------------|------|-------|
| **语言** | TypeScript | TypeScript | TypeScript | TypeScript (React) |
| **包体积** | ~120 KB | ~300 KB | ~50 KB | ~30 KB (core) |
| **Tree-shaking** | ✅ 优秀 | ⚠️ 一般 | ✅ 优秀 | ✅ 优秀 |
| **Provider 抽象** | `JsonRpcProvider` | `Web3` 实例 | `createPublicClient` | `usePublicClient` |
| **合约交互** | `Contract` 类 | `Contract` 类 | `getContract` | `useContractRead/Write` |
| **类型安全** | 原生 TS | 原生 TS | 严格 TS + ABI 类型推断 | React Hook 类型安全 |
| **测试环境** | `HardhatNetwork` | Ganache | Anvil / Foundry | 配合 `mock` 工具 |
| **维护活跃度** | 高 | 中等 | 高 | 高 |

### 代码示例：Ethers.js vs Viem

```typescript
// Ethers.js v6 — 读取合约状态
import { Contract, JsonRpcProvider } from 'ethers';

const provider = new JsonRpcProvider('https://eth.llamarpc.com');
const dai = new Contract(DAI_ADDRESS, ERC20_ABI, provider);
const balance = await dai.balanceOf(walletAddress);
console.log(balance.toString());
```

```typescript
// Viem — 读取合约状态（更严格的类型推断）
import { createPublicClient, http, getContract } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({ chain: mainnet, transport: http() });
const dai = getContract({ address: DAI_ADDRESS, abi: erc20Abi, client });
const balance = await dai.read.balanceOf([walletAddress]);
// balance 自动推断为 bigint，无需手动转换
```

## 关联模块

- `83-blockchain-advanced` — 高级区块链（Layer 2、Rollup）
- `30-knowledge-base/30.2-categories/32-blockchain-web3.md` — Web3 分类索引
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Ethers.js Docs | 文档 | [docs.ethers.io](https://docs.ethers.io) |
| Web3.js Docs | 文档 | [docs.web3js.org](https://docs.web3js.org) |
| Viem Docs | 文档 | [viem.sh](https://viem.sh) |
| wagmi Docs | 文档 | [wagmi.sh](https://wagmi.sh) |
| Ethereum Development Tutorial | 指南 | [ethereum.org/developers/tutorials](https://ethereum.org/developers/tutorials) |
| OpenZeppelin Contracts | 代码库 | [docs.openzeppelin.com/contracts](https://docs.openzeppelin.com/contracts) |
| ETHGlobal Hackathon | 实践 | [ethglobal.com](https://ethglobal.com) |

---

*最后更新: 2026-04-29*
