---
dimension: 应用领域
application-domain: Web3 与区块链
created: 2026-04-27
---

# 维度标注

- **所属维度**: 应用领域（Application Domain）
- **应用域**: 高级区块链 — Layer 2、Rollup、跨链协议与高级智能合约
- **模块编号**: 83-blockchain-advanced

## 边界说明

本模块聚焦高级区块链应用开发，包括：

- Layer 2 扩容方案
- Rollup 与零知识证明应用
- 跨链桥与 DAO 治理

底层密码学原语和共识算法实现不属于本模块范围。

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `rollup/` | Optimistic / ZK-Rollup 交互示例 | `rollup-deposit.ts`, `withdrawal-proof.ts` |
| `zero-knowledge/` | zk-SNARKs / zk-STARKs 前端集成 | `verify-proof.ts`, `circom-demo.ts` |
| `cross-chain/` | 跨链桥与消息传递 | `bridge-transfer.ts`, `layerzero-messaging.ts` |
| `dao-governance/` | 去中心化治理与投票 | `snapshot-voting.ts`, `tally-proposal.ts` |
| `smart-contracts.ts` | TypeScript 智能合约交互封装 | 类型安全 ABI 调用与事件监听 |
| `index.ts` | 模块统一导出 | 组合所有子模块入口 |

## 代码示例

### 类型安全的合约交互

```typescript
import { ethers } from 'ethers';

// 基于 TypeChain 的强类型 ABI
interface TypedContract extends ethers.Contract {
  deposit(amount: bigint): Promise<ethers.ContractTransactionResponse>;
  withdraw(proof: `0x${string}`): Promise<ethers.ContractTransactionResponse>;
  filters: {
    Deposit(user: string | null): ethers.EventFilter;
  };
}

async function monitorDeposits(contract: TypedContract) {
  contract.on(contract.filters.Deposit(null), (user, amount, event) => {
    console.log(`Deposit: ${user} → ${ethers.formatEther(amount)} ETH`);
  });
}
```

### ZK-Rollup 提款证明提交

```typescript
import { verifyProof } from './zero-knowledge/verify-proof';

async function submitWithdrawal(
  l2Provider: ethers.Provider,
  bridge: ethers.Contract,
  proof: { commitment: string; nullifier: string; merklePath: string[] }
) {
  const isValid = await verifyProof(proof);
  if (!isValid) throw new Error('Invalid ZK proof');

  const tx = await bridge.finalizeWithdrawal(
    proof.commitment,
    proof.nullifier,
    proof.merklePath
  );
  return tx.wait();
}
```

### 使用 viem 进行类型安全的链上交互

```typescript
import { createPublicClient, http, parseAbi, formatEther } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const erc20Abi = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
] as const);

async function getBalance(token: `0x${string}`, holder: `0x${string}`) {
  const balance = await client.readContract({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [holder],
  });
  return formatEther(balance);
}

// 监听实时转账事件
client.watchContractEvent({
  address: token,
  abi: erc20Abi,
  eventName: 'Transfer',
  onLogs: (logs) => {
    logs.forEach((log) => {
      console.log(`Transfer: ${log.args.from} → ${log.args.to}: ${formatEther(log.args.value!)}`);
    });
  },
});
```

### 使用 wagmi + React 连接钱包

```typescript
import { useAccount, useConnect, useDisconnect, useWriteContract } from 'wagmi';
import { injected } from 'wagmi/connectors';

function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <button onClick={() => (isConnected ? disconnect() : connect({ connector: injected() }))}>
      {isConnected ? `Disconnect ${address?.slice(0, 6)}...` : 'Connect Wallet'}
    </button>
  );
}

function MintNFT({ contract }: { contract: `0x${string}` }) {
  const { writeContract, isPending } = useWriteContract();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        writeContract({
          abi: parseAbi(['function mint(address to) returns (uint256)']),
          address: contract,
          functionName: 'mint',
          args: ['0x...'],
        })
      }
    >
      {isPending ? 'Minting...' : 'Mint NFT'}
    </button>
  );
}
```

### Circom 零知识证明电路（前端集成准备）

```typescript
// zk-helper.ts — 在浏览器中生成并验证证明
import { groth16 } from 'snarkjs';

export async function generateProof(
  input: Record<string, string | string[]>,
  wasmPath: string,
  zkeyPath: string
) {
  const { proof, publicSignals } = await groth16.fullProve(input, wasmPath, zkeyPath);
  return { proof, publicSignals };
}

export async function verifyProof(
  vkey: object,
  publicSignals: string[],
  proof: object
): Promise<boolean> {
  return groth16.verify(vkey, publicSignals, proof);
}

// 使用示例：证明知道一个哈希的原像
// const { proof, publicSignals } = await generateProof(
//   { preimage: '1234' },
//   '/circuit.wasm',
//   '/circuit_final.zkey'
// );
```

### 跨链消息传递（LayerZero 风格）

```typescript
// cross-chain/omnichain-messaging.ts
import { ethers } from 'ethers';

interface MessagingParams {
  dstChainId: number;
  receiver: `0x${string}`;
  payload: string;
  refundAddress: string;
  zroPaymentAddress: string;
  adapterParams: string;
}

async function sendCrossChainMessage(
  endpoint: ethers.Contract,
  params: MessagingParams,
  signer: ethers.Signer
): Promise<ethers.ContractTransactionResponse> {
  // 估算跨链消息费用
  const [nativeFee, zroFee] = await endpoint.estimateFees(
    params.dstChainId,
    params.receiver,
    params.payload,
    false, // 不使用 ZRO 代币支付
    params.adapterParams
  );

  const tx = await endpoint.connect(signer).send(
    params.dstChainId,
    ethers.zeroPadValue(params.receiver, 32),
    ethers.toUtf8Bytes(params.payload),
    params.refundAddress,
    params.zroPaymentAddress,
    params.adapterParams,
    { value: nativeFee }
  );

  return tx;
}

// 监听跨链消息到达
function listenOmnichainReceive(
  endpoint: ethers.Contract,
  handler: (srcChainId: number, sender: string, payload: string) => void
) {
  endpoint.on('MessageReceived', (srcChainId, sender, payload) => {
    console.log(`Message from chain ${srcChainId}: ${ethers.toUtf8String(payload)}`);
    handler(srcChainId, sender, ethers.toUtf8String(payload));
  });
}
```

### DAO 治理投票（Snapshot + Tally 风格）

```typescript
// dao-governance/governance-voting.ts
import { ethers } from 'ethers';

interface Proposal {
  id: number;
  proposer: string;
  description: string;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  startBlock: number;
  endBlock: number;
  executed: boolean;
}

enum VoteType {
  Against = 0,
  For = 1,
  Abstain = 2,
}

async function castVote(
  governor: ethers.Contract,
  proposalId: number,
  voteType: VoteType,
  reason: string,
  signer: ethers.Signer
) {
  // 使用 withReason 接口，理由会上链存储
  const tx = await governor.connect(signer).castVoteWithReason(
    proposalId,
    voteType,
    reason
  );
  const receipt = await tx.wait();

  // 解析 VoteCast 事件
  const event = receipt?.logs
    .map((log) => governor.interface.parseLog(log))
    .find((e) => e?.name === 'VoteCast');

  console.log(`Voted ${VoteType[voteType]} on proposal ${proposalId}`);
  return receipt;
}

// 委托投票权
async function delegateVotes(
  token: ethers.Contract, // ERC20Votes 兼容代币
  delegatee: string,
  signer: ethers.Signer
) {
  const tx = await token.connect(signer).delegate(delegatee);
  await tx.wait();
  console.log(`Delegated voting power to ${delegatee}`);
}

// 排队并执行已通过提案（Timelock 控制器）
async function executeProposal(
  governor: ethers.Contract,
  targets: string[],
  values: bigint[],
  calldatas: string[],
  descriptionHash: string,
  signer: ethers.Signer
) {
  // 先排队（如果使用了 Timelock）
  const queueTx = await governor.connect(signer).queue(
    targets, values, calldatas, descriptionHash
  );
  await queueTx.wait();

  // 等待 Timelock 延迟（例如 2 天）后执行
  const executeTx = await governor.connect(signer).execute(
    targets, values, calldatas, descriptionHash
  );
  return executeTx.wait();
}
```

### EIP-4337 Account Abstraction 用户操作构建

```typescript
// account-abstraction/user-operation.ts
import { ethers } from 'ethers';

interface UserOperation {
  sender: string;
  nonce: bigint;
  initCode: string;
  callData: string;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: string;
  signature: string;
}

function createUserOperation(
  sender: string,
  callData: string,
  nonce: bigint,
  overrides: Partial<Omit<UserOperation, 'sender' | 'nonce' | 'callData'>> = {}
): UserOperation {
  return {
    sender,
    nonce,
    initCode: '0x',
    callData,
    callGasLimit: overrides.callGasLimit ?? 100_000n,
    verificationGasLimit: overrides.verificationGasLimit ?? 150_000n,
    preVerificationGas: overrides.preVerificationGas ?? 50_000n,
    maxFeePerGas: overrides.maxFeePerGas ?? 10n ** 9n, // 1 gwei
    maxPriorityFeePerGas: overrides.maxPriorityFeePerGas ?? 10n ** 8n,
    paymasterAndData: overrides.paymasterAndData ?? '0x',
    signature: overrides.signature ?? '0x',
  };
}

async function signUserOperation(
  op: UserOperation,
  entryPoint: string,
  chainId: number,
  signer: ethers.Signer
): Promise<UserOperation> {
  const opHash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'uint256', 'bytes32', 'bytes32', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes32'],
      [
        op.sender,
        op.nonce,
        ethers.keccak256(op.initCode),
        ethers.keccak256(op.callData),
        op.callGasLimit,
        op.verificationGasLimit,
        op.preVerificationGas,
        op.maxFeePerGas,
        op.maxPriorityFeePerGas,
        ethers.keccak256(op.paymasterAndData),
      ]
    )
  );

  const chainHash = ethers.keccak256(
    ethers.concat([
      ethers.toUtf8Bytes('\x19\x01'),
      ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['bytes32', 'address', 'uint256'],
          [ethers.id('ERC4337_ENTRY_POINT'), entryPoint, chainId]
        )
      ),
      opHash,
    ])
  );

  const signature = await signer.signMessage(ethers.getBytes(chainHash));
  return { ...op, signature };
}
```

## 共识机制对比

| 特性 | PoW (工作量证明) | PoS (权益证明) | DPoS (委托权益证明) |
|------|------------------|----------------|---------------------|
| **代表网络** | Bitcoin, Ethereum (前) | Ethereum (现), Solana | EOS, TRON |
| **能耗** | 极高 | 低 | 低 |
| **去中心化程度** | 高 | 中等 | 较低 |
| **确认延迟** | 10 min (BTC) | 12 s (ETH) | 3 s (EOS) |
| **准入门槛** | 硬件投入 | 质押 32 ETH | 投票委托 |
| **安全性假设** | 51% 算力 | 51% 质押 | 受托节点诚实 |

### Layer 2 方案对比

| 方案 | 技术路线 | 数据可用性 | 退出期 | 代表项目 |
|------|----------|------------|--------|----------|
| **Optimistic Rollup** | 欺诈证明 | L1 (Calldata) | ~7 天 | Arbitrum, Optimism |
| **ZK-Rollup** | 有效性证明 | L1 (Calldata) | 无 | zkSync, StarkNet |
| **Validium** | 有效性证明 | 链下 | 无 | Immutable X |
| **Plasma** | 欺诈证明 | 链下 | ~7-14 天 | Polygon (历史) |

## 关联模块

- `34-blockchain-web3` — Web3 基础
- `30-knowledge-base/30.2-categories/app-architecture.md` — Web3 分类索引
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Ethereum Documentation | 文档 | [ethereum.org/developers](https://ethereum.org/developers) |
| Solidity Docs | 文档 | [docs.soliditylang.org](https://docs.soliditylang.org) |
| Arbitrum Docs | 文档 | [docs.arbitrum.io](https://docs.arbitrum.io) |
| StarkNet Book | 指南 | [book.starknet.io](https://book.starknet.io) |
| L2Beat | 数据 | [l2beat.com](https://l2beat.com) — Layer 2 风险与数据对比 |
| Rollup.wtf | 指南 | [rollup.wtf](https://rollup.wtf) — Rollup 技术可视化 |
| ZK Hack | 教程 | [zkhack.dev](https://zkhack.dev) — 零知识证明编程挑战 |
| Circom Documentation | 文档 | [docs.circom.io](https://docs.circom.io) — 电路语言与 snarkJS |
| ethers.js Docs | 文档 | [docs.ethers.org](https://docs.ethers.org) — Ethereum 库 |
| viem.sh | 文档 | [viem.sh](https://viem.sh) — 类型安全的 Ethereum 交互 |
| wagmi.sh | 文档 | [wagmi.sh](https://wagmi.sh) — React Hooks for Ethereum |
| OpenZeppelin Contracts | 文档 | [docs.openzeppelin.com/contracts](https://docs.openzeppelin.com/contracts) |
| EIP 官方索引 | 规范 | [eips.ethereum.org](https://eips.ethereum.org/) |
| Foundry 文档 | 工具 | [book.getfoundry.sh](https://book.getfoundry.sh/) |
| Chainlink 文档 | 文档 | [docs.chain.link](https://docs.chain.link/) |
| LayerZero Documentation | 文档 | [layerzero.network](https://layerzero.network/) — 全链互操作协议 |
| Chainlink CCIP | 文档 | [docs.chain.link/ccip](https://docs.chain.link/ccip) — 跨链互操作协议 |
| EIP-4337 Account Abstraction | 规范 | [eips.ethereum.org/EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) |
| Safe{Core} SDK | 文档 | [docs.safe.global](https://docs.safe.global/) — 智能合约钱包 SDK |
| Tally Governance | 文档 | [docs.tally.xyz](https://docs.tally.xyz/) — DAO 治理工具 |
| Snapshot | 文档 | [docs.snapshot.org](https://docs.snapshot.org/) — 链下投票治理 |
| zkSync Docs | 文档 | [docs.zksync.io](https://docs.zksync.io/) — zkEVM 与 ZK Stack |

---

*最后更新: 2026-04-29*
