# 区块链与 Web3 — 理论基础

## 1. 区块链核心概念

区块链是一种**分布式不可篡改账本**，通过密码学和共识机制保证数据安全：

- **区块**: 打包的多条交易记录
- **链式结构**: 每个区块包含前一区块的哈希值
- **去中心化**: 无单一控制节点，网络共同维护
- **不可篡改**: 修改历史区块需要重新计算后续所有区块的哈希

```javascript
// 简化版区块链演示（教学用）
const crypto = require('crypto');

class Block {
  constructor(index, data, previousHash = '') {
    this.index = index;
    this.timestamp = Date.now();
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce)
      .digest('hex');
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
  }

  createGenesisBlock() {
    return new Block(0, 'Genesis Block', '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      if (current.hash !== current.calculateHash()) return false;
      if (current.previousHash !== previous.hash) return false;
    }
    return true;
  }
}

// 使用
const myChain = new Blockchain();
myChain.addBlock(new Block(1, { amount: 100 }));
myChain.addBlock(new Block(2, { amount: 50 }));
console.log('Valid?', myChain.isChainValid()); // true
```

## 2. 共识机制

| 机制 | 原理 | 能耗 | 代表 |
|------|------|------|------|
| **PoW** | 算力竞争 | 高 | 比特币 |
| **PoS** | 质押代币 | 低 | 以太坊 2.0 |
| **DPoS** | 委托投票 | 低 | EOS |

## 3. 智能合约

运行在区块链上的自动执行程序：

- **Solidity**: 以太坊主流语言
- **Vyper**: Python 风格，更安全
- **Rust**: Solana、NEAR 等链使用

关键特性：

- **不可变性**: 部署后无法修改
- **确定性**: 相同输入始终产生相同输出
- **公开透明**: 代码和数据对所有节点可见

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    uint256 private storedData;
    event DataChanged(uint256 newValue);

    function set(uint256 x) public {
        storedData = x;
        emit DataChanged(x);
    }

    function get() public view returns (uint256) {
        return storedData;
    }
}
```

## 4. Web3 技术栈

```
前端（React/Vue）→ Web3.js / Ethers.js → 钱包（MetaMask）→ 智能合约
```

- **钱包**: 管理私钥，签名交易
- **节点提供商**: Infura、Alchemy（无需自建节点）
- **IPFS**: 去中心化文件存储

## 5. Web3 库深度对比

| 特性 | Ethers.js | Viem | Web3.js |
|------|-----------|------|---------|
| **体积（gzip）** | ~50 kB | ~18 kB | ~80 kB |
| **Tree-shaking** | 良好 | 优秀 | 一般 |
| **TypeScript** | 原生支持 | 完全基于 TS | 类型声明文件 |
| **模块化设计** | 模块化 | 原子化模块 | 单体 |
| **性能** | 高 | 极高（比 Ethers 快 ~2x）| 中等 |
| **错误处理** | 结构化错误 | 详尽错误信息 | 基础错误 |
| **钱包支持** | 广泛 | 现代标准（EIP-1193）| 广泛 |
| **测试工具** | 内置（Hardhat 原生）| Anvil / Foundry 集成 | 第三方 |
| **文档质量** | 优秀 | 极佳（交互式）| 良好 |
| **维护活跃度** | 活跃 | 非常活跃（2023 发布）| 中等 |
| **代表项目** | Uniswap、Aave、Curve | Uniswap v4、Rainbow | 早期项目 |
| **适用场景** | 通用以太坊开发 | 高性能现代 dApp | 遗留项目维护 |

### 选型建议

```
新项目启动？
  ├─ 是 → 优先 Viem（TypeScript 原生、体积小、性能高）
  └─ 否 → 已有 Ethers.js 代码库？
            ├─ 是 → Ethers.js v6（平滑升级）
            └─ 否 → 遗留 Web3.js 项目 → 渐进迁移至 Viem
```

## 6. 代码示例：Viem 读取与写入智能合约

```bash
# 安装 Viem
npm install viem
```

```typescript
// src/web3/client.ts — 客户端配置
import { createPublicClient, createWalletClient, http, custom } from 'viem'
import { mainnet, sepolia } from 'viem/chains'

// 公共客户端：用于读取链上数据（无需私钥）
export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http('https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY')
})

// 测试网客户端
export const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http()
})

// 钱包客户端：用于发送交易（需要私钥或浏览器钱包）
export const walletClient = createWalletClient({
  chain: mainnet,
  transport: typeof window !== 'undefined' && window.ethereum
    ? custom(window.ethereum)
    : http()
})
```

```typescript
// src/web3/contract.ts — ERC-20 合约交互
import { parseAbi, formatUnits, parseUnits } from 'viem'
import { publicClient, walletClient } from './client'

// ERC-20 标准 ABI（Viem 推荐内联 ABI 以获得完整类型安全）
const erc20Abi = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 value) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
])

// USDC 合约地址（以太坊主网）
const USDC_CONTRACT = '0xA0b86a33E6441E0C4D2B8D3A7E7c4A8b9D0E1F2A'

/**
 * 读取合约状态（纯视图函数，无需 Gas）
 */
export async function readTokenInfo() {
  // 并行读取多个视图函数（自动批量 RPC 请求）
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    publicClient.readContract({
      address: USDC_CONTRACT,
      abi: erc20Abi,
      functionName: 'name'
    }),
    publicClient.readContract({
      address: USDC_CONTRACT,
      abi: erc20Abi,
      functionName: 'symbol'
    }),
    publicClient.readContract({
      address: USDC_CONTRACT,
      abi: erc20Abi,
      functionName: 'decimals'
    }),
    publicClient.readContract({
      address: USDC_CONTRACT,
      abi: erc20Abi,
      functionName: 'totalSupply'
    })
  ])

  return {
    name,
    symbol,
    decimals,
    totalSupply: formatUnits(totalSupply, decimals)
  }
}

/**
 * 查询指定地址余额
 */
export async function getBalance(address: `0x${string}`) {
  const decimals = await publicClient.readContract({
    address: USDC_CONTRACT,
    abi: erc20Abi,
    functionName: 'decimals'
  })

  const balance = await publicClient.readContract({
    address: USDC_CONTRACT,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address]
  })

  return {
    raw: balance,
    formatted: formatUnits(balance, decimals)
  }
}

/**
 * 发送转账交易（需要钱包签名）
 */
export async function transferTokens(
  to: `0x${string}`,
  amount: string,
  account: `0x${string}`
) {
  const decimals = await publicClient.readContract({
    address: USDC_CONTRACT,
    abi: erc20Abi,
    functionName: 'decimals'
  })

  // 模拟交易（估算 Gas，验证是否会失败）
  const { request } = await publicClient.simulateContract({
    address: USDC_CONTRACT,
    abi: erc20Abi,
    functionName: 'transfer',
    args: [to, parseUnits(amount, decimals)],
    account
  })

  // 发送实际交易
  const hash = await walletClient.writeContract(request)

  // 等待交易确认
  const receipt = await publicClient.waitForTransactionReceipt({ hash })

  return {
    hash,
    status: receipt.status,
    gasUsed: receipt.gasUsed,
    blockNumber: receipt.blockNumber
  }
}

/**
 * 监听链上事件
 */
export function watchTransfers(
  onTransfer: (from: `0x${string}`, to: `0x${string}`, value: bigint) => void
) {
  const unwatch = publicClient.watchContractEvent({
    address: USDC_CONTRACT,
    abi: erc20Abi,
    eventName: 'Transfer',
    onLogs: (logs) => {
      for (const log of logs) {
        const { from, to, value } = log.args
        if (from && to && value) {
          onTransfer(from, to, value)
        }
      }
    }
  })

  return unwatch // 返回取消监听函数
}
```

```typescript
// src/web3/multicall.ts — 批量读取优化
import { multicall } from 'viem'
import { publicClient } from './client'

/**
 * 使用 Multicall 一次性读取多个合约/函数
 * 将 N 次 RPC 请求合并为 1 次，大幅降低延迟
 */
export async function batchReadBalances(addresses: `0x${string}`[]) {
  const results = await publicClient.multicall({
    contracts: addresses.map((addr) => ({
      address: USDC_CONTRACT,
      abi: erc20Abi,
      functionName: 'balanceOf' as const,
      args: [addr] as const
    }))
  })

  return addresses.map((addr, i) => ({
    address: addr,
    balance: results[i].status === 'success'
      ? formatUnits(results[i].result as bigint, 6)
      : null,
    error: results[i].status === 'failure' ? results[i].error : null
  }))
}
```

## 7. Hardhat 测试与部署示例

```typescript
// test/SimpleStorage.test.ts — Hardhat + Ethers v6
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('SimpleStorage', () => {
  async function deployFixture() {
    const [owner, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('SimpleStorage');
    const contract = await Factory.deploy();
    return { contract, owner, other };
  }

  it('should store and retrieve a value', async () => {
    const { contract } = await deployFixture();
    await contract.set(42);
    expect(await contract.get()).to.equal(42);
  });

  it('should emit DataChanged event', async () => {
    const { contract } = await deployFixture();
    await expect(contract.set(100))
      .to.emit(contract, 'DataChanged')
      .withArgs(100);
  });
});
```

## 8. Foundry 作弊码快速测试

```solidity
// test/SimpleStorage.t.sol — Foundry (Solidity 内联测试)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SimpleStorage.sol";

contract SimpleStorageTest is Test {
    SimpleStorage store;

    function setUp() public {
        store = new SimpleStorage();
    }

    function test_SetAndGet() public {
        store.set(42);
        assertEq(store.get(), 42);
    }

    function testFuzz_Set(uint256 x) public {
        store.set(x);
        assertEq(store.get(), x);
    }

    function testFail_SetWithoutValue() public {
        // 期望此调用 revert
        store.set{value: 1 ether}(1);
    }
}
```

## 9. 权威外部资源

- [Viem 官方文档](https://viem.sh/)
- [Ethers.js 官方文档](https://docs.ethers.org/)
- [Web3.js 官方文档](https://docs.web3js.org/)
- [Ethereum Development Documentation](https://ethereum.org/en/developers/docs/)
- [MetaMask Docs — Wallet API](https://docs.metamask.io/wallet/)
- [ERC-20 Token Standard](https://eips.ethereum.org/EIPS/eip-20)
- [EIP-1193 — Ethereum Provider JavaScript API](https://eips.ethereum.org/EIPS/eip-1193)
- [Wagmi — React Hooks for Ethereum](https://wagmi.sh/)
- [Alchemy Web3 API Reference](https://docs.alchemy.com/reference/api-overview)
- [Hardhat Documentation](https://hardhat.org/docs) — 以太坊开发环境
- [Foundry Book](https://book.getfoundry.sh/) — Foundry 测试与部署框架
- [Solidity Lang](https://soliditylang.org/) — Solidity 官方文档
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts) — 安全智能合约库
- [Ethereum Yellow Paper](https://ethereum.github.io/yellowpaper/paper.pdf) — 以太坊协议形式化规范
- [Mastering Ethereum](https://github.com/ethereumbook/ethereumbook) — 开源以太坊权威教材
- [CryptoZombies](https://cryptozombies.io/) — 交互式 Solidity 教程
- [Remix IDE](https://remix.ethereum.org/) — 浏览器内 Solidity 开发环境

## 10. 与相邻模块的关系

- **83-blockchain-advanced**: 高级区块链主题（Layer 2、跨链）
- **36-web-assembly**: WASM 在区块链中的应用
- **79-compiler-design**: 智能合约编译与优化
