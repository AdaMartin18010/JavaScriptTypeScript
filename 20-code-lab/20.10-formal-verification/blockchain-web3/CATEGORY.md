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

## 代码示例

### Ethers.js v6 读取合约状态

```typescript
// ethers-read.ts
import { Contract, JsonRpcProvider, formatUnits } from 'ethers';

const provider = new JsonRpcProvider('https://eth.llamarpc.com');
const dai = new Contract(DAI_ADDRESS, ERC20_ABI, provider);
const balance = await dai.balanceOf(walletAddress);
console.log(formatUnits(balance, 18)); // 格式化 18 位小数
```

### Viem 严格类型推断

```typescript
// viem-read.ts
import { createPublicClient, http, getContract } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({ chain: mainnet, transport: http() });
const dai = getContract({ address: DAI_ADDRESS, abi: erc20Abi, client });
const balance = await dai.read.balanceOf([walletAddress]);
// balance 自动推断为 bigint，无需手动转换
```

### EIP-1193 钱包连接与签名

```typescript
// wallet-connect.ts — 标准以太坊 Provider 接口
interface EthereumProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(event: string, listener: (...args: any[]) => void): void;
}

async function connectWallet(): Promise<{ address: string; chainId: number }> {
  const ethereum = (window as any).ethereum as EthereumProvider;
  if (!ethereum) throw new Error('MetaMask not installed');

  const accounts = await ethereum.request({
    method: 'eth_requestAccounts',
  });
  const chainIdHex = await ethereum.request({ method: 'eth_chainId' });

  return { address: accounts[0], chainId: parseInt(chainIdHex, 16) };
}

async function signMessage(message: string, from: string): Promise<string> {
  const ethereum = (window as any).ethereum as EthereumProvider;
  return ethereum.request({
    method: 'personal_sign',
    params: [message, from],
  });
}
```

### ERC-721 NFT 安全转账

```typescript
// erc721-transfer.ts
import { ethers } from 'ethers';

const ERC721_ABI = [
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

async function safeTransferNFT(
  contractAddress: string,
  from: string,
  to: string,
  tokenId: string,
  signer: ethers.Signer
) {
  const nft = new ethers.Contract(contractAddress, ERC721_ABI, signer);

  // 验证所有权
  const owner = await nft.ownerOf(tokenId);
  if (owner.toLowerCase() !== from.toLowerCase()) {
    throw new Error('Not token owner');
  }

  // 执行安全转账（若接收方是合约，必须实现 onERC721Received）
  const tx = await nft.safeTransferFrom(from, to, tokenId);
  const receipt = await tx.wait();
  console.log(`Transferred in block ${receipt?.blockNumber}`);
}
```

### 监听合约事件

```typescript
// event-listener.ts
const filter = dai.filters.Transfer(null, walletAddress); // 接收代币事件

// 监听实时事件
dai.on(filter, (from, to, amount, event) => {
  console.log(`Received ${formatUnits(amount, 18)} DAI from ${from}`);
});

// 查询历史事件
const events = await dai.queryFilter(filter, -10000); // 最近 10000 个区块
```

### Multicall 批量读取（减少 RPC 调用）

```typescript
// multicall-batch.ts
import { createPublicClient, http, multicall } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({ chain: mainnet, transport: http() });

async function batchBalances(tokens: `0x${string}`[], owner: `0x${string}`) {
  const results = await multicall({
    client,
    contracts: tokens.map((token) => ({
      address: token,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [owner],
    })),
  });

  return results.map((r, i) => ({
    token: tokens[i],
    balance: r.status === 'success' ? (r.result as bigint) : 0n,
  }));
}

// 一次 RPC 调用获取 10 个代币余额
const balances = await batchBalances(TOKEN_LIST, WALLET_ADDRESS);
```

### Gas 估算与交易优化

```typescript
// gas-estimation.ts
import { ethers } from 'ethers';

async function sendWithOptimizedGas(
  contract: ethers.Contract,
  method: string,
  args: any[],
  signer: ethers.Signer
) {
  // 估算 Gas Limit
  const gasEstimate = await contract[method].estimateGas(...args);
  const gasLimit = (gasEstimate * 120n) / 100n; // 增加 20% 缓冲

  // 获取当前 Gas Price（EIP-1559）
  const feeData = await signer.provider!.getFeeData();
  const maxFeePerGas = feeData.maxFeePerGas! * 110n / 100n;
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas!;

  const tx = await contract[method](...args, {
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
  });

  return tx.wait();
}
```

### 链上数据索引与解析

```typescript
// event-parser.ts
import { decodeEventLog, parseAbiItem } from 'viem';

const transferEvent = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');

function parseTransferLogs(logs: any[]) {
  return logs
    .map((log) => {
      try {
        const decoded = decodeEventLog({ abi: [transferEvent], data: log.data, topics: log.topics });
        return {
          from: decoded.args.from,
          to: decoded.args.to,
          value: decoded.args.value,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}
```

### Hardhat + TypeChain 类型安全测试

```typescript
// test/MyToken.test.ts — Hardhat + TypeChain 严格类型测试
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { MyToken } from '../typechain-types';

describe('MyToken', () => {
  let token: MyToken;
  let owner: any;
  let addr1: any;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    const TokenFactory = await ethers.getContractFactory('MyToken');
    token = await TokenFactory.deploy('MyToken', 'MTK', ethers.parseEther('1000000'));
    await token.waitForDeployment();
  });

  it('should assign total supply to owner', async () => {
    const ownerBalance = await token.balanceOf(owner.address);
    expect(await token.totalSupply()).to.equal(ownerBalance);
  });

  it('should transfer tokens', async () => {
    await token.transfer(addr1.address, ethers.parseEther('100'));
    expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther('100'));
  });

  it('should emit Transfer event', async () => {
    await expect(token.transfer(addr1.address, 100n))
      .to.emit(token, 'Transfer')
      .withArgs(owner.address, addr1.address, 100n);
  });
});
```

### Foundry 模糊测试（Fuzz Testing）

```solidity
// test/MyToken.fuzz.t.sol — Foundry 内联模糊测试
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MyToken.sol";

contract MyTokenFuzzTest is Test {
    MyToken token;

    function setUp() public {
        token = new MyToken("MyToken", "MTK", 1_000_000 ether);
    }

    // Foundry 自动生成随机输入 (amount) 运行 256 次
    function testFuzzTransfer(address to, uint256 amount) public {
        vm.assume(to != address(0));
        vm.assume(to != address(this));
        amount = bound(amount, 0, token.balanceOf(address(this)));

        token.transfer(to, amount);
        assertEq(token.balanceOf(to), amount);
    }

    // 不变量测试：总供应量永远不变
    function testInvariantTotalSupply() public {
        assertEq(token.totalSupply(), 1_000_000 ether);
    }
}
```

> 📖 Reference: [Foundry Fuzz Testing](https://book.getfoundry.sh/forge/fuzz-testing) | [Foundry Invariant Testing](https://book.getfoundry.sh/forge/invariant-testing)

### 静态分析与安全扫描（Slither）

```bash
# 安装 Slither
pip install slither-analyzer

# 运行全套检测器
slither ./src --solc-remaps @openzeppelin=node_modules/@openzeppelin

# 输出 JSON 报告供 CI 使用
slither ./src --json slither-report.json --checklist
```

```yaml
# .github/workflows/security.yml — CI 集成 Slither
name: Security Scan
on: [push, pull_request]
jobs:
  slither:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: crytic/slither-action@v0.4.0
        with:
          node-version: 20
          fail-on: medium
```

> 📖 Reference: [Slither Documentation](https://github.com/crytic/slither) | [Trail of Bits Blockchain Security](https://www.trailofbits.com/practice/blockchain-security/)

---

## 关联模块

- `83-blockchain-advanced` — 高级区块链（Layer 2、Rollup）
- `30-knowledge-base/30.2-categories/32-blockchain-web3.md` — Web3 分类索引
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| Ethers.js Docs | 文档 | [docs.ethers.io](https://docs.ethers.io) |
| Web3.js Docs | 文档 | [docs.web3js.org](https://docs.web3js.org) |
| Viem Docs | 文档 | [viem.sh](https://viem.sh) |
| wagmi Docs | 文档 | [wagmi.sh](https://wagmi.sh) |
| Ethereum Development Tutorial | 指南 | [ethereum.org/developers/tutorials](https://ethereum.org/developers/tutorials) |
| OpenZeppelin Contracts | 代码库 | [docs.openzeppelin.com/contracts](https://docs.openzeppelin.com/contracts) |
| ETHGlobal Hackathon | 实践 | [ethglobal.com](https://ethglobal.com) |
| EIP-1193: Ethereum Provider API | 规范 | [eips.ethereum.org/EIPS/eip-1193](https://eips.ethereum.org/EIPS/eip-1193) |
| ERC-721 Non-Fungible Token Standard | 规范 | [eips.ethereum.org/EIPS/eip-721](https://eips.ethereum.org/EIPS/eip-721) |
| ERC-20 Token Standard | 规范 | [eips.ethereum.org/EIPS/eip-20](https://eips.ethereum.org/EIPS/eip-20) |
| Solidity 官方文档 | 文档 | [docs.soliditylang.org](https://docs.soliditylang.org) |
| Foundry 测试框架 | 工具 | [book.getfoundry.sh](https://book.getfoundry.sh) |
| Ethereum JSON-RPC Specification | 规范 | [ethereum.github.io/execution-apis/api-documentation/](https://ethereum.github.io/execution-apis/api-documentation/) |
| Alchemy Web3 SDK | 基础设施 | [docs.alchemy.com/reference/sdk](https://docs.alchemy.com/reference/sdk) |
| Chainlist | RPC 节点列表 | [chainlist.org](https://chainlist.org/) |
| DeFi Llama | 协议数据 | [defillama.com](https://defillama.com/) |
| Hardhat Documentation | 文档 | [hardhat.org/docs](https://hardhat.org/docs) |
| TypeChain — TypeScript for Ethereum | 工具 | [github.com/dethcrypto/TypeChain](https://github.com/dethcrypto/TypeChain) |
| Slither Static Analysis | 安全 | [github.com/crytic/slither](https://github.com/crytic/slither) |
| Mythril Security Analysis | 安全 | [github.com/Consensys/mythril](https://github.com/Consensys/mythril) |
| Echidna Fuzzing | 安全 | [github.com/crytic/echidna](https://github.com/crytic/echidna) |
| OpenZeppelin Defender | 运维 | [docs.openzeppelin.com/defender](https://docs.openzeppelin.com/defender) |
| Tenderly Simulation & Debugging | 调试 | [docs.tenderly.co](https://docs.tenderly.co) |
| CoinMarketCap API | 市场数据 | [coinmarketcap.com/api/documentation/v1/](https://coinmarketcap.com/api/documentation/v1/) |
| Etherscan API | 浏览器 | [docs.etherscan.io](https://docs.etherscan.io) |
| Infura Documentation | 基础设施 | [docs.infura.io](https://docs.infura.io) |
| MetaMask Docs | 钱包 | [docs.metamask.io](https://docs.metamask.io) |
| WalletConnect v2 Docs | 协议 | [docs.walletconnect.com](https://docs.walletconnect.com) |

---

*最后更新: 2026-04-29*
