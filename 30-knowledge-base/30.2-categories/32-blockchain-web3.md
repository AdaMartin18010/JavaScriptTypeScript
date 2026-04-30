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

### Hardhat 部署脚本 (TypeScript)

```typescript
// scripts/deploy.ts — Hardhat 合约部署
import { ethers } from 'hardhat';
import type { MyToken } from '../typechain-types';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  const TokenFactory = await ethers.getContractFactory('MyToken');
  const token: MyToken = await TokenFactory.deploy('MyToken', 'MTK', ethers.parseEther('1000000'));

  await token.waitForDeployment();
  const address = await token.getAddress();

  console.log('Token deployed to:', address);

  // 验证合约 (Etherscan)
  await hre.run('verify:verify', {
    address,
    constructorArguments: ['MyToken', 'MTK', ethers.parseEther('1000000')],
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### 使用 The Graph 查询链上数据

```typescript
// graphql/queries.ts — The Graph 子图查询
import { gql, GraphQLClient } from 'graphql-request';

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';
const client = new GraphQLClient(SUBGRAPH_URL);

const GET_POOLS = gql`
  query GetPools($first: Int!) {
    pools(first: $first, orderBy: volumeUSD, orderDirection: desc) {
      id
      token0 { symbol }
      token1 { symbol }
      volumeUSD
      feeTier
    }
  }
`;

interface Pool {
  id: string;
  token0: { symbol: string };
  token1: { symbol: string };
  volumeUSD: string;
  feeTier: string;
}

async function fetchTopPools(limit = 10): Promise<Pool[]> {
  const { pools } = await client.request<{ pools: Pool[] }>(GET_POOLS, { first: limit });
  return pools;
}
```

### ethers.js 树摇优化导入

```typescript
// ethers-tree-shake.ts — 仅导入所需子模块，减少打包体积
import { JsonRpcProvider, Wallet, Contract, formatEther, parseEther } from 'ethers';
// 对比：import { ethers } from 'ethers' 会引入整个库 (~120KB)
// 子模块导入可将未使用代码剔除至 ~40KB

const provider = new JsonRpcProvider(process.env.RPC_URL);
const signer = new Wallet(process.env.PRIVATE_KEY!, provider);
```

### Viem 监听新区块与日志过滤

```typescript
// viem-watch.ts — 实时监听链上活动
import { createPublicClient, http, parseAbiItem } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({ chain: mainnet, transport: http() });

// 监听每个新区块
const unwatchBlocks = client.watchBlocks({
  onBlock: (block) => {
    console.log(`New block #${block.number} | txs: ${block.transactions.length} | gasUsed: ${block.gasUsed}`);
  },
});

// 按账户过滤历史日志
const transferEvent = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');

const logs = await client.getLogs({
  address: '0xA0b86a33E6441e6C7D3D4B4f6c7D8e9F0a1B2c3D', // DAI
  event: transferEvent,
  fromBlock: 18_000_000n,
  toBlock: 18_000_100n,
  args: { from: '0x1111...' }, // indexed 字段过滤
});
```

### IPFS 文件上传 (去中心化存储)

```typescript
// ipfs-upload.ts — 使用 Pinata 或 NFT.Storage 上传元数据
import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: 'https://gateway.pinata.cloud',
});

async function uploadNFTMetadata(name: string, imageUrl: string, attributes: Record<string, any>) {
  const metadata = {
    name,
    description: 'JSTS Knowledge Base NFT',
    image: imageUrl,
    attributes: Object.entries(attributes).map(([trait_type, value]) => ({ trait_type, value })),
  };

  const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  const file = new File([blob], `${name}.json`);

  const upload = await pinata.upload.public.file(file);
  return `ipfs://${upload.cid}`; // ERC-721 tokenURI 格式
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
| Foundry | <https://book.getfoundry.sh/> | 快速 Rust 编写合约工具链 |
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
| Solidity 文档 | <https://docs.soliditylang.org/> | 智能合约语言官方文档 |
| Ethereum Developer Docs | <https://ethereum.org/en/developers/docs/> | 以太坊官方开发者文档 |
| IPFS Docs | <https://docs.ipfs.tech/> | 星际文件系统文档 |
| Arweave | <https://docs.arweave.org/> | 永久存储协议 |
| CoinMarketCap API | <https://coinmarketcap.com/api/documentation/v1/> | 加密货币市场数据 |
| Infura Documentation | <https://docs.infura.io/> | Consensys 节点托管服务 |
| Tenderly Simulation | <https://docs.tenderly.co/simulations> | 交易模拟与调试平台 |
| Etherscan API | <https://docs.etherscan.io/> | 区块链浏览器 API |
| DefiLlama API | <https://defillama.com/docs/api> | DeFi 聚合数据 API |
| IPFS HTTP Client (js-ipfs) | <https://github.com/ipfs/js-ipfs> | JavaScript IPFS 实现 |
| NFT.Storage | <https://nft.storage/docs/> | 免费 IPFS/Filecoin 存储 |
| Pinata Documentation | <https://docs.pinata.cloud/> | IPFS 托管与网关服务 |

---

> 📅 最后更新: 2026-04-29
