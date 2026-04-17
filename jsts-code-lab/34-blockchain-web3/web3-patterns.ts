/**
 * @file Web3/区块链模式
 * @category Blockchain → Web3
 * @difficulty hard
 * @tags web3, blockchain, ethereum, smart-contract, wallet
 * 
 * @description
 * Web3/区块链实现：
 * - 钱包连接与管理
 * - 智能合约交互
 * - 交易签名与发送
 * - 事件监听
 * - 多链支持
 */

// ============================================================================
// 1. 钱包类型与账户管理
// ============================================================================

export interface WalletAccount {
  address: string;
  publicKey: string;
  balance: bigint;
  chainId: number;
}

export interface WalletConnection {
  provider: EIP1193Provider;
  accounts: WalletAccount[];
  chainId: number;
  isConnected: boolean;
}

export interface EIP1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(event: string, callback: (data: unknown) => void): void;
  removeListener(event: string, callback: (data: unknown) => void): void;
}

export class WalletManager {
  private provider: EIP1193Provider | null = null;
  private accounts: WalletAccount[] = [];
  private chainId = 1;
  private listeners = new Map<string, Set<(data: unknown) => void>>();

  async connect(provider: EIP1193Provider): Promise<WalletConnection> {
    this.provider = provider;
    
    try {
      // 请求账户访问
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
      // 获取当前链ID
      const chainId = await provider.request({ 
        method: 'eth_chainId' 
      }) as string;
      
      this.chainId = parseInt(chainId, 16);
      
      // 获取账户信息
      this.accounts = await Promise.all(
        accounts.map(addr => this.fetchAccountInfo(addr))
      );
      
      // 设置事件监听
      this.setupEventListeners(provider);
      
      console.log(`[Wallet] Connected: ${accounts.length} accounts on chain ${this.chainId}`);
      
      return {
        provider,
        accounts: this.accounts,
        chainId: this.chainId,
        isConnected: true
      };
    } catch (error) {
      console.error('[Wallet] Connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.provider = null;
    this.accounts = [];
    this.listeners.clear();
    console.log('[Wallet] Disconnected');
  }

  async switchChain(chainId: number): Promise<void> {
    if (!this.provider) throw new Error('Wallet not connected');
    
    const hexChainId = `0x${chainId.toString(16)}`;
    
    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }]
      });
    } catch (switchError: any) {
      // 如果链未添加，需要添加链
      if (switchError.code === 4902) {
        await this.addChain(chainId);
      }
      throw switchError;
    }
  }

  async addChain(chainId: number): Promise<void> {
    if (!this.provider) throw new Error('Wallet not connected');
    
    const chainConfig = CHAIN_CONFIGS[chainId];
    if (!chainConfig) throw new Error(`Unknown chain: ${chainId}`);
    
    await this.provider.request({
      method: 'wallet_addEthereumChain',
      params: [chainConfig]
    });
  }

  private async fetchAccountInfo(address: string): Promise<WalletAccount> {
    if (!this.provider) throw new Error('Wallet not connected');
    
    const balance = await this.provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    }) as string;
    
    return {
      address,
      publicKey: address, // 简化为地址
      balance: BigInt(balance || '0'),
      chainId: this.chainId
    };
  }

  private setupEventListeners(provider: EIP1193Provider): void {
    provider.on('accountsChanged', (accounts: unknown) => {
      this.handleAccountsChanged(accounts as string[]);
    });
    
    provider.on('chainChanged', (chainId: unknown) => {
      this.handleChainChanged(chainId as string);
    });
    
    provider.on('disconnect', (error: unknown) => {
      this.handleDisconnect(error as { code: number; message: string });
    });
  }

  private handleAccountsChanged(accounts: string[]): void {
    console.log('[Wallet] Accounts changed:', accounts);
    this.emit('accountsChanged', accounts);
  }

  private handleChainChanged(chainId: string): void {
    this.chainId = parseInt(chainId, 16);
    console.log('[Wallet] Chain changed:', this.chainId);
    this.emit('chainChanged', this.chainId);
  }

  private handleDisconnect(error: { code: number; message: string }): void {
    console.log('[Wallet] Disconnected:', error);
    this.emit('disconnect', error);
  }

  on(event: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  private emit(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event);
    callbacks?.forEach(cb => { cb(data); });
  }

  getAccounts(): WalletAccount[] {
    return [...this.accounts];
  }

  getChainId(): number {
    return this.chainId;
  }
}

// 链配置
const CHAIN_CONFIGS: Record<number, {
  chainId: string;
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}> = {
  1: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://eth-mainnet.g.alchemy.com/v2'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  137: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com']
  },
  56: {
    chainId: '0x38',
    chainName: 'BNB Smart Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com']
  }
};

// ============================================================================
// 2. 智能合约交互
// ============================================================================

export interface ContractConfig {
  address: string;
  abi: ContractABI;
  chainId?: number;
}

export type ContractABI = {
  type: 'function' | 'event' | 'constructor' | 'fallback' | 'receive';
  name?: string;
  inputs?: { name: string; type: string; indexed?: boolean }[];
  outputs?: { name: string; type: string }[];
  stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
  anonymous?: boolean;
}[];

export class SmartContract {
  private address: string;
  private abi: ContractABI;
  private provider: EIP1193Provider;
  private eventListeners = new Map<string, Set<(data: unknown) => void>>();

  constructor(config: ContractConfig, provider: EIP1193Provider) {
    this.address = config.address;
    this.abi = config.abi;
    this.provider = provider;
  }

  // 读取合约状态 (view/pure 函数)
  async call<T = unknown>(
    methodName: string,
    args: unknown[] = []
  ): Promise<T> {
    const method = this.findMethod(methodName);
    if (!method) throw new Error(`Method ${methodName} not found in ABI`);

    const data = this.encodeFunctionCall(method, args);
    
    const result = await this.provider.request({
      method: 'eth_call',
      params: [{
        to: this.address,
        data
      }, 'latest']
    }) as string;

    return this.decodeResult(result, method.outputs || []) as T;
  }

  // 写入合约状态 (send transaction)
  async send(
    methodName: string,
    args: unknown[] = [],
    options: { value?: bigint; gasLimit?: bigint } = {}
  ): Promise<TransactionReceipt> {
    const method = this.findMethod(methodName);
    if (!method) throw new Error(`Method ${methodName} not found in ABI`);

    const accounts = await this.provider.request({
      method: 'eth_accounts'
    }) as string[];
    
    if (accounts.length === 0) throw new Error('No accounts available');

    const data = this.encodeFunctionCall(method, args);
    
    const txParams = {
      from: accounts[0],
      to: this.address,
      data,
      value: options.value ? `0x${options.value.toString(16)}` : '0x0'
    };

    const txHash = await this.provider.request({
      method: 'eth_sendTransaction',
      params: [txParams]
    }) as string;

    return this.waitForReceipt(txHash);
  }

  // 估算 gas
  async estimateGas(methodName: string, args: unknown[] = []): Promise<bigint> {
    const method = this.findMethod(methodName);
    if (!method) throw new Error(`Method ${methodName} not found in ABI`);

    const data = this.encodeFunctionCall(method, args);
    
    const gas = await this.provider.request({
      method: 'eth_estimateGas',
      params: [{
        to: this.address,
        data
      }]
    }) as string;

    return BigInt(gas);
  }

  // 监听合约事件
  onEvent(eventName: string, callback: (data: EventLog) => void): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    this.eventListeners.get(eventName)!.add(callback as (data: unknown) => void);
    
    console.log(`[Contract] Listening to event: ${eventName}`);
  }

  private findMethod(name: string) {
    return this.abi.find(
      item => item.type === 'function' && item.name === name
    );
  }

  private encodeFunctionCall(method: any, args: unknown[]): string {
    // 简化版编码：只支持简单类型
    const signature = `${method.name}(${method.inputs?.map((i: any) => i.type).join(',') || ''})`;
    const selector = keccak256(signature).slice(0, 10);
    
    // 参数编码 (简化版)
    const encodedArgs = args.map(arg => {
      if (typeof arg === 'string' && arg.startsWith('0x')) {
        return arg.slice(2).padStart(64, '0');
      }
      if (typeof arg === 'number' || typeof arg === 'bigint') {
        return BigInt(arg).toString(16).padStart(64, '0');
      }
      return String(arg).padStart(64, '0');
    }).join('');
    
    return selector + encodedArgs;
  }

  private decodeResult(result: string, outputs: any[]): unknown {
    // 简化版解码
    if (outputs.length === 1 && outputs[0].type === 'uint256') {
      return BigInt(result);
    }
    return result;
  }

  private async waitForReceipt(txHash: string): Promise<TransactionReceipt> {
    // 模拟等待交易确认
    await new Promise(resolve => setTimeout(resolve, 0));
    
    return {
      transactionHash: txHash,
      blockHash: `0x${generateId()}`,
      blockNumber: BigInt(12345678),
      gasUsed: BigInt(100000),
      status: 'success'
    };
  }
}

export interface TransactionReceipt {
  transactionHash: string;
  blockHash: string;
  blockNumber: bigint;
  gasUsed: bigint;
  status: 'success' | 'failed';
}

export interface EventLog {
  event: string;
  address: string;
  topics: string[];
  data: string;
  blockNumber: bigint;
  transactionHash: string;
}

// ============================================================================
// 3. 交易签名与管理
// ============================================================================

export interface Transaction {
  to?: string;
  from?: string;
  value?: bigint;
  gasLimit?: bigint;
  gasPrice?: bigint;
  data?: string;
  nonce?: number;
  chainId?: number;
}

export class TransactionManager {
  private provider: EIP1193Provider;
  private pendingTxs = new Map<string, Transaction>();

  constructor(provider: EIP1193Provider) {
    this.provider = provider;
  }

  async sendTransaction(tx: Transaction): Promise<TransactionReceipt> {
    const accounts = await this.provider.request({
      method: 'eth_accounts'
    }) as string[];
    
    if (!tx.from && accounts.length > 0) {
      tx.from = accounts[0];
    }

    // 获取 nonce
    if (tx.nonce === undefined) {
      const nonce = await this.provider.request({
        method: 'eth_getTransactionCount',
        params: [tx.from, 'pending']
      }) as string;
      tx.nonce = parseInt(nonce, 16);
    }

    // 估算 gas
    if (!tx.gasLimit) {
      const gasLimit = await this.provider.request({
        method: 'eth_estimateGas',
        params: [tx]
      }) as string;
      tx.gasLimit = (gasLimit && gasLimit !== '0x' ? BigInt(gasLimit) : 21000n) * 12n / 10n; // 增加 20% 缓冲
    }

    // 获取 gas price
    if (!tx.gasPrice) {
      const gasPrice = await this.provider.request({
        method: 'eth_gasPrice'
      }) as string;
      tx.gasPrice = gasPrice && gasPrice !== '0x' ? BigInt(gasPrice) : 20000000000n;
    }

    const txHash = await this.provider.request({
      method: 'eth_sendTransaction',
      params: [{
        from: tx.from,
        to: tx.to,
        value: tx.value ? `0x${tx.value.toString(16)}` : '0x0',
        gas: tx.gasLimit ? `0x${tx.gasLimit.toString(16)}` : undefined,
        gasPrice: tx.gasPrice ? `0x${tx.gasPrice.toString(16)}` : undefined,
        data: tx.data,
        nonce: `0x${tx.nonce.toString(16)}`
      }]
    }) as string;

    this.pendingTxs.set(txHash, tx);
    
    console.log(`[Transaction] Sent: ${txHash}`);
    
    return this.waitForConfirmation(txHash);
  }

  async signMessage(message: string, address?: string): Promise<string> {
    const accounts = await this.provider.request({
      method: 'eth_accounts'
    }) as string[];
    
    const from = address || accounts[0];
    
    const signature = await this.provider.request({
      method: 'personal_sign',
      params: [message, from]
    }) as string;
    
    console.log(`[Transaction] Message signed by ${from}`);
    return signature;
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, { name: string; type: string }[]>,
    value: Record<string, unknown>,
    address?: string
  ): Promise<string> {
    const accounts = await this.provider.request({
      method: 'eth_accounts'
    }) as string[];
    
    const from = address || accounts[0];
    
    const signature = await this.provider.request({
      method: 'eth_signTypedData_v4',
      params: [from, JSON.stringify({ domain, types, message: value })]
    }) as string;
    
    console.log(`[Transaction] Typed data signed by ${from}`);
    return signature;
  }

  private async waitForConfirmation(txHash: string): Promise<TransactionReceipt> {
    // 模拟轮询等待
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // 模拟交易确认
      if (attempts > 2) {
        this.pendingTxs.delete(txHash);
        return {
          transactionHash: txHash,
          blockHash: `0x${generateId()}`,
          blockNumber: BigInt(12345678 + attempts),
          gasUsed: BigInt(100000),
          status: 'success'
        };
      }
      
      attempts++;
    }
    
    throw new Error('Transaction confirmation timeout');
  }

  getPendingTransactions(): Map<string, Transaction> {
    return new Map(this.pendingTxs);
  }
}

export interface TypedDataDomain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

// ============================================================================
// 4. 多链管理
// ============================================================================

export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  blockExplorer: string;
}

export class MultiChainManager {
  private chains = new Map<number, ChainConfig>();
  private providers = new Map<number, EIP1193Provider>();

  constructor() {
    // 初始化默认链
    this.registerChain({
      id: 1,
      name: 'Ethereum Mainnet',
      rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      blockExplorer: 'https://etherscan.io'
    });
    
    this.registerChain({
      id: 137,
      name: 'Polygon',
      rpcUrl: 'https://polygon-rpc.com',
      nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
      blockExplorer: 'https://polygonscan.com'
    });
    
    this.registerChain({
      id: 42161,
      name: 'Arbitrum One',
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      blockExplorer: 'https://arbiscan.io'
    });
  }

  registerChain(config: ChainConfig): void {
    this.chains.set(config.id, config);
    console.log(`[MultiChain] Registered chain: ${config.name} (${config.id})`);
  }

  getChain(chainId: number): ChainConfig | undefined {
    return this.chains.get(chainId);
  }

  getAllChains(): ChainConfig[] {
    return Array.from(this.chains.values());
  }

  async getBalance(chainId: number, address: string): Promise<bigint> {
    const provider = this.getProvider(chainId);
    
    const balance = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    }) as string;
    
    return BigInt(balance || '0');
  }

  async getGasPrice(chainId: number): Promise<bigint> {
    const provider = this.getProvider(chainId);
    
    const gasPrice = await provider.request({
      method: 'eth_gasPrice'
    }) as string;
    
    return BigInt(gasPrice || '0');
  }

  private getProvider(chainId: number): EIP1193Provider {
    if (!this.providers.has(chainId)) {
      // 创建模拟 provider
      this.providers.set(chainId, this.createMockProvider(chainId));
    }
    return this.providers.get(chainId)!;
  }

  private createMockProvider(chainId: number): EIP1193Provider {
    return {
      request: async (args) => {
        console.log(`[Provider ${chainId}] ${args.method}`);
        // 返回模拟数据
        switch (args.method) {
          case 'eth_getBalance':
            return '0x' + (BigInt(10) ** BigInt(18) * BigInt(10)).toString(16);
          case 'eth_gasPrice':
            return '0x' + (BigInt(20) * BigInt(10) ** BigInt(9)).toString(16); // 20 gwei
          default:
            return '0x';
        }
      },
      on: () => {},
      removeListener: () => {}
    };
  }
}

// ============================================================================
// 5. 工具函数
// ============================================================================

function keccak256(input: string): string {
  // 简化的 keccak256 哈希 (用于演示)
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== Web3/区块链模式 ===\n');

  // 创建模拟 provider
  const mockProvider: EIP1193Provider = {
    request: async (args) => {
      console.log(`   [Mock Provider] ${args.method}`);
      switch (args.method) {
        case 'eth_requestAccounts':
          return ['0x742d35Cc6634C0532925a3b8D433A1538D5bB1B1'];
        case 'eth_chainId':
          return '0x1';
        case 'eth_accounts':
          return ['0x742d35Cc6634C0532925a3b8D433A1538D5bB1B1'];
        case 'eth_getBalance':
          return '0x' + (BigInt(10) ** BigInt(18) * BigInt(5)).toString(16); // 5 ETH
        case 'eth_sendTransaction':
          return '0x' + generateId();
        default:
          return '0x';
      }
    },
    on: () => {},
    removeListener: () => {}
  };

  console.log('1. 钱包连接');
  const walletManager = new WalletManager();
  const connection = await walletManager.connect(mockProvider);
  console.log('   Connected accounts:', connection.accounts.map(a => a.address.slice(0, 10) + '...'));
  console.log('   Chain ID:', connection.chainId);

  console.log('\n2. 智能合约交互');
  const simpleABI: ContractABI = [
    {
      type: 'function',
      name: 'balanceOf',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'transfer',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable'
    }
  ];

  const contract = new SmartContract(
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', abi: simpleABI },
    mockProvider
  );

  console.log('   Contract address: 0xdAC17F...');
  console.log('   Contract methods:', ['balanceOf', 'transfer']);

  console.log('\n3. 交易签名');
  const txManager = new TransactionManager(mockProvider);
  
  const receipt = await txManager.sendTransaction({
    to: '0x1234567890123456789012345678901234567890',
    value: BigInt(10) ** BigInt(18), // 1 ETH
    data: '0x'
  });
  console.log('   Transaction hash:', receipt.transactionHash.slice(0, 20) + '...');
  console.log('   Status:', receipt.status);

  const signature = await txManager.signMessage('Hello Web3!');
  console.log('   Message signature:', signature.slice(0, 30) + '...');

  console.log('\n4. 多链管理');
  const multiChain = new MultiChainManager();
  const chains = multiChain.getAllChains();
  
  console.log('   Registered chains:');
  chains.forEach(chain => {
    console.log(`     - ${chain.name} (Chain ID: ${chain.id})`);
  });
  
  const ethBalance = await multiChain.getBalance(1, '0x742d35Cc6634C0532925a3b8D433A1538D5bB1B1');
  console.log('   Ethereum balance:', (ethBalance / BigInt(10) ** BigInt(18)).toString(), 'ETH');
  
  const gasPrice = await multiChain.getGasPrice(137);
  console.log('   Polygon gas price:', (gasPrice / BigInt(10) ** BigInt(9)).toString(), 'gwei');

  console.log('\nWeb3 要点:');
  console.log('- 钱包管理: 安全地管理用户账户和连接');
  console.log('- 合约交互: 通过 ABI 调用智能合约函数');
  console.log('- 交易签名: 使用私钥对交易和消息进行签名');
  console.log('- 事件监听: 监听链上事件实现实时更新');
  console.log('- 多链支持: 支持以太坊、Polygon、Arbitrum 等多条链');
  console.log('- Gas 优化: 合理估算 gas 避免交易失败');
}

// ============================================================================
// 导出
// ============================================================================

;
