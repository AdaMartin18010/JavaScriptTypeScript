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

## 区块链平台对比

| 维度 | Ethereum (L1) | Solana | Polkadot |
|------|--------------|--------|----------|
| **共识机制** | PoS (Casper FFG) | PoH + PoS (Tower BFT) | NPoS (Nominated PoS) |
| **TPS** | ~15–30 | ~4,000–65,000 | ~1,000 (理论) |
| **交易确认时间** | ~12s (1 block) | ~400ms | ~6s |
| **平均 Gas 费** | $0.5–$10+ | ~$0.00025 | 可变 (平行链费用) |
| **智能合约语言** | Solidity, Vyper, Yul | Rust (Anchor), C | Rust (ink!), Solidity (EVM 兼容链) |
| **生态成熟度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **TVL (2026)** | 最高 | 中 | 中 |
| **EVM 兼容** | ✅ 原生 | ❌ (需 Neon EVM) | ✅ (通过 Moonbeam/Astar) |
| **开发体验** | Hardhat / Foundry 成熟 | Anchor CLI 友好 | Substrate 较复杂 |
| **前端 SDK** | viem, ethers, wagmi | @solana/web3.js, Anchor | polkadot.js |

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

## 代码示例

### Viem (推荐 — 现代 TypeScript 优先)

```typescript
import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// 只读客户端 (Public Client)
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http('https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY'),
});

// 查询余额
async function getBalance(address: `0x${string}`) {
  const balance = await publicClient.getBalance({ address });
  return formatEther(balance); // '1.5'
}

// 写入客户端 (Wallet Client)
const account = privateKeyToAccount('0x...'); // 从环境变量读取
const walletClient = createWalletClient({
  account,
  chain: mainnet,
  transport: http(),
});

// 发送交易
async function sendTransaction(to: `0x${string}`, value: string) {
  const hash = await walletClient.sendTransaction({
    to,
    value: parseEther(value),
  });
  return hash;
}

// 读取合约
const abi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

async function getTokenBalance(tokenAddress: `0x${string}`, owner: `0x${string}`) {
  const data = await publicClient.readContract({
    address: tokenAddress,
    abi,
    functionName: 'balanceOf',
    args: [owner],
  });
  return data;
}
```

### ethers.js v6 (经典方案)

```typescript
import { ethers } from 'ethers';

// Provider (只读)
const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY');

// 查询余额
async function getBalance(address: string) {
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

// Signer (写入)
const signer = new ethers.Wallet('0x...', provider);

// 发送交易
async function sendEth(to: string, amount: string) {
  const tx = await signer.sendTransaction({
    to,
    value: ethers.parseEther(amount),
  });
  await tx.wait(); // 等待确认
  return tx.hash;
}

// 合约交互
const contract = new ethers.Contract(tokenAddress, erc20Abi, signer);
const balance = await contract.balanceOf(ownerAddress);
```

### wagmi + React Hook (前端状态管理)

```tsx
import { useAccount, useBalance, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';

function WalletInfo() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();

  if (!isConnected) return <div>Please connect wallet</div>;

  return (
    <div>
      <p>Address: {address}</p>
      <p>Balance: {balance?.formatted} {balance?.symbol}</p>
      <button
        onClick={() =>
          sendTransaction({
            to: '0x...',
            value: parseEther('0.01'),
          })
        }
      >
        Send 0.01 ETH
      </button>
    </div>
  );
}
```

### 事件监听与日志解析

```typescript
// viem 事件监听
import { parseAbiItem } from 'viem';

const transferEvent = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');

async function watchTransfers(tokenAddress: `0x${string}`) {
  const unwatch = publicClient.watchEvent({
    address: tokenAddress,
    event: transferEvent,
    onLogs: (logs) => {
      for (const log of logs) {
        console.log(`Transfer: ${log.args.from} -> ${log.args.to}: ${log.args.value}`);
      }
    },
  });

  // 取消监听
  // unwatch();
}
```

### SIWE (Sign-In with Ethereum) 认证

```typescript
import { SiweMessage } from 'siwe';

function createSiweMessage(address: string, chainId: number, nonce: string) {
  return new SiweMessage({
    domain: 'example.com',
    address,
    statement: 'Sign in to Example App',
    uri: 'https://example.com/login',
    version: '1',
    chainId,
    nonce,
  });
}

async function verifySiweSignature(message: SiweMessage, signature: string) {
  const fields = await message.verify({ signature });
  return fields.success;
}
```

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

## 权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| Viem 文档 | <https://viem.sh/docs/getting-started.html> | 现代以太坊 TypeScript 库 |
| ethers.js v6 | <https://docs.ethers.org/v6/> | 经典以太坊库文档 |
| wagmi | <https://wagmi.sh/react/getting-started> | React Hooks for Ethereum |
| RainbowKit | <https://www.rainbowkit.com/docs/introduction> | 钱包连接 UI 套件 |
| Solana Web3.js | <https://solana-labs.github.io/solana-web3.js/> | Solana JavaScript SDK |
| Anchor Framework | <https://www.anchor-lang.com/docs> | Solana 开发框架 |
| Polkadot.js | <https://polkadot.js.org/docs/> | Polkadot/Substrate JS API |
| Hardhat | <https://hardhat.org/docs> | 以太坊开发环境 |
| The Graph | <https://thegraph.com/docs/en/> | 去中心化索引协议 |
| EVM OpCodes | <https://www.evm.codes/> | EVM 操作码参考 |
| SIWE (EIP-4361) | <https://eips.ethereum.org/EIPS/eip-4361> | Sign-In with Ethereum 规范 |
| OpenZeppelin Contracts | <https://docs.openzeppelin.com/contracts> | 安全智能合约库 |
| Chainlink Data Feeds | <https://docs.chain.link/data-feeds> | 去中心化预言机 |
| Alchemy API Reference | <https://docs.alchemy.com/reference> | Web3 基础设施 API |
| MetaMask Docs | <https://docs.metamask.io/> | 钱包集成指南 |
| Ethereum JSON-RPC Spec | <https://ethereum.github.io/execution-apis/api-documentation/> | 标准 RPC 接口 |
| ERC-20 Token Standard | <https://eips.ethereum.org/EIPS/eip-20> | 同质化代币标准 |
| ERC-721 NFT Standard | <https://eips.ethereum.org/EIPS/eip-721> | 非同质化代币标准 |

---

> 📅 最后更新: 2026-04-29
