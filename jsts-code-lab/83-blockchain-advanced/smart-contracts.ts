/**
 * @file 智能合约
 * @category Blockchain → Smart Contracts
 * @difficulty hard
 * @tags blockchain, defi, cross-chain, smart-contracts
 */

// 以太坊地址
export type Address = string;

// 交易
export interface Transaction {
  from: Address;
  to: Address;
  value: bigint;
  data: string;
  gasLimit: bigint;
  gasPrice: bigint;
  nonce: number;
}

// 简化的EVM状态
export class EVMState {
  private balances: Map<Address, bigint> = new Map();
  private storage: Map<Address, Map<string, string>> = new Map();
  private code: Map<Address, string> = new Map();
  private nonce: Map<Address, number> = new Map();
  
  getBalance(address: Address): bigint {
    return this.balances.get(address) || 0n;
  }
  
  setBalance(address: Address, value: bigint): void {
    this.balances.set(address, value);
  }
  
  getStorage(contract: Address, key: string): string {
    return this.storage.get(contract)?.get(key) || '0';
  }
  
  setStorage(contract: Address, key: string, value: string): void {
    if (!this.storage.has(contract)) {
      this.storage.set(contract, new Map());
    }
    this.storage.get(contract)!.set(key, value);
  }
  
  getCode(address: Address): string {
    return this.code.get(address) || '';
  }
  
  setCode(address: Address, code: string): void {
    this.code.set(address, code);
  }
  
  getNonce(address: Address): number {
    return this.nonce.get(address) || 0;
  }
  
  incrementNonce(address: Address): void {
    this.nonce.set(address, this.getNonce(address) + 1);
  }
}

// ERC-20代币合约
export class ERC20Token {
  private name: string;
  private symbol: string;
  private decimals: number;
  private totalSupply: bigint;
  private balances: Map<Address, bigint> = new Map();
  private allowances: Map<string, bigint> = new Map(); // "owner:spender" -> amount
  
  constructor(name: string, symbol: string, decimals: number, initialSupply: bigint) {
    this.name = name;
    this.symbol = symbol;
    this.decimals = decimals;
    this.totalSupply = initialSupply;
  }
  
  balanceOf(account: Address): bigint {
    return this.balances.get(account) || 0n;
  }
  
  transfer(from: Address, to: Address, amount: bigint): boolean {
    const fromBalance = this.balanceOf(from);
    if (fromBalance < amount) return false;
    
    this.balances.set(from, fromBalance - amount);
    this.balances.set(to, this.balanceOf(to) + amount);
    
    return true;
  }
  
  approve(owner: Address, spender: Address, amount: bigint): boolean {
    const key = `${owner}:${spender}`;
    this.allowances.set(key, amount);
    return true;
  }
  
  allowance(owner: Address, spender: Address): bigint {
    return this.allowances.get(`${owner}:${spender}`) || 0n;
  }
  
  transferFrom(spender: Address, from: Address, to: Address, amount: bigint): boolean {
    const allowed = this.allowance(from, spender);
    if (allowed < amount) return false;
    
    if (!this.transfer(from, to, amount)) return false;
    
    this.allowances.set(`${from}:${spender}`, allowed - amount);
    return true;
  }
  
  mint(to: Address, amount: bigint): void {
    this.totalSupply += amount;
    this.balances.set(to, this.balanceOf(to) + amount);
  }
  
  getInfo(): { name: string; symbol: string; decimals: number; totalSupply: bigint } {
    return {
      name: this.name,
      symbol: this.symbol,
      decimals: this.decimals,
      totalSupply: this.totalSupply
    };
  }
}

// 自动化做市商 (AMM) - 简化版Uniswap
export class AutomatedMarketMaker {
  private tokenA: ERC20Token;
  private tokenB: ERC20Token;
  private reserveA: bigint = 0n;
  private reserveB: bigint = 0n;
  private totalShares: bigint = 0n;
  private shares: Map<Address, bigint> = new Map();
  
  constructor(tokenA: ERC20Token, tokenB: ERC20Token) {
    this.tokenA = tokenA;
    this.tokenB = tokenB;
  }
  
  // 添加流动性
  addLiquidity(provider: Address, amountA: bigint, amountB: bigint): bigint {
    let shares: bigint;
    
    if (this.totalShares === 0n) {
      // 首次提供流动性
      shares = this.sqrt(amountA * amountB);
    } else {
      // 按比例计算份额
      const sharesA = (amountA * this.totalShares) / this.reserveA;
      const sharesB = (amountB * this.totalShares) / this.reserveB;
      shares = sharesA < sharesB ? sharesA : sharesB;
    }
    
    this.reserveA += amountA;
    this.reserveB += amountB;
    this.totalShares += shares;
    this.shares.set(provider, (this.shares.get(provider) || 0n) + shares);
    
    return shares;
  }
  
  // 移除流动性
  removeLiquidity(provider: Address, shares: bigint): { amountA: bigint; amountB: bigint } {
    const providerShares = this.shares.get(provider) || 0n;
    if (providerShares < shares) throw new Error('Insufficient shares');
    
    const amountA = (shares * this.reserveA) / this.totalShares;
    const amountB = (shares * this.reserveB) / this.totalShares;
    
    this.reserveA -= amountA;
    this.reserveB -= amountB;
    this.totalShares -= shares;
    this.shares.set(provider, providerShares - shares);
    
    return { amountA, amountB };
  }
  
  // 交换（考虑0.3%手续费）
  swap(inputAmount: bigint, inputToken: 'A' | 'B'): bigint {
    const inputReserve = inputToken === 'A' ? this.reserveA : this.reserveB;
    const outputReserve = inputToken === 'A' ? this.reserveB : this.reserveA;
    
    // 扣除0.3%手续费
    const inputAmountWithFee = inputAmount * 997n / 1000n;
    
    // x * y = k (恒定乘积公式)
    const numerator = inputAmountWithFee * outputReserve;
    const denominator = inputReserve + inputAmountWithFee;
    const outputAmount = numerator / denominator;
    
    if (inputToken === 'A') {
      this.reserveA += inputAmount;
      this.reserveB -= outputAmount;
    } else {
      this.reserveB += inputAmount;
      this.reserveA -= outputAmount;
    }
    
    return outputAmount;
  }
  
  // 计算交换价格（含滑点）
  getSwapQuote(inputAmount: bigint, inputToken: 'A' | 'B'): {
    outputAmount: bigint;
    priceImpact: number;
    fee: bigint;
  } {
    const inputReserve = inputToken === 'A' ? this.reserveA : this.reserveB;
    const outputReserve = inputToken === 'A' ? this.reserveB : this.reserveA;
    
    const fee = inputAmount * 3n / 1000n;
    const inputAmountWithFee = inputAmount - fee;
    
    const numerator = inputAmountWithFee * outputReserve;
    const denominator = inputReserve + inputAmountWithFee;
    const outputAmount = numerator / denominator;
    
    // 价格影响
    const spotPrice = Number(outputReserve) / Number(inputReserve);
    const executionPrice = Number(outputAmount) / Number(inputAmount);
    const priceImpact = Math.abs((spotPrice - executionPrice) / spotPrice);
    
    return { outputAmount, priceImpact, fee };
  }
  
  getReserves(): { reserveA: bigint; reserveB: bigint } {
    return { reserveA: this.reserveA, reserveB: this.reserveB };
  }
  
  private sqrt(n: bigint): bigint {
    if (n < 0n) throw new Error('Square root of negative number');
    if (n < 2n) return n;
    
    let x = n;
    let y = (x + 1n) / 2n;
    while (y < x) {
      x = y;
      y = (x + n / x) / 2n;
    }
    return x;
  }
}

// 跨链桥
export class CrossChainBridge {
  private chains: Map<string, EVMState> = new Map();
  private lockedAssets: Map<string, Map<Address, bigint>> = new Map(); // chain -> (user -> amount)
  private wrappedTokens: Map<string, ERC20Token> = new Map(); // chain:original -> wrapped
  
  registerChain(name: string, state: EVMState): void {
    this.chains.set(name, state);
    this.lockedAssets.set(name, new Map());
  }
  
  // 锁定资产并铸造跨链代币
  lock(
    fromChain: string,
    toChain: string,
    user: Address,
    token: Address,
    amount: bigint
  ): boolean {
    const fromState = this.chains.get(fromChain);
    const toState = this.chains.get(toChain);
    
    if (!fromState || !toState) return false;
    
    // 锁定原链资产
    const balance = fromState.getBalance(user);
    if (balance < amount) return false;
    
    fromState.setBalance(user, balance - amount);
    
    const locked = this.lockedAssets.get(fromChain)!;
    locked.set(user, (locked.get(user) || 0n) + amount);
    
    // 在目标链铸造包装代币
    const wrappedKey = `${toChain}:${token}`;
    let wrapped = this.wrappedTokens.get(wrappedKey);
    
    if (!wrapped) {
      wrapped = new ERC20Token('Wrapped Token', 'WTKN', 18, 0n);
      this.wrappedTokens.set(wrappedKey, wrapped);
    }
    
    wrapped.mint(user, amount);
    
    console.log(`[Bridge] Locked ${amount} tokens from ${fromChain} to ${toChain}`);
    return true;
  }
  
  // 销毁跨链代币并解锁原资产
  unlock(
    fromChain: string,
    toChain: string,
    user: Address,
    token: Address,
    amount: bigint
  ): boolean {
    const toState = this.chains.get(toChain);
    if (!toState) return false;
    
    // 销毁包装代币
    const wrappedKey = `${fromChain}:${token}`;
    const wrapped = this.wrappedTokens.get(wrappedKey);
    if (!wrapped || wrapped.balanceOf(user) < amount) return false;
    
    // 解锁原链资产
    const locked = this.lockedAssets.get(toChain)!;
    if ((locked.get(user) || 0n) < amount) return false;
    
    locked.set(user, (locked.get(user) || 0n) - amount);
    toState.setBalance(user, toState.getBalance(user) + amount);
    
    console.log(`[Bridge] Unlocked ${amount} tokens on ${toChain}`);
    return true;
  }
}

// NFT合约
export class ERC721NFT {
  private name: string;
  private symbol: string;
  private owners: Map<bigint, Address> = new Map();
  private balances: Map<Address, number> = new Map();
  private approvals: Map<bigint, Address> = new Map();
  private tokenURIs: Map<bigint, string> = new Map();
  private nextTokenId: bigint = 1n;
  
  constructor(name: string, symbol: string) {
    this.name = name;
    this.symbol = symbol;
  }
  
  mint(to: Address, uri: string): bigint {
    const tokenId = this.nextTokenId++;
    
    this.owners.set(tokenId, to);
    this.balances.set(to, (this.balances.get(to) || 0) + 1);
    this.tokenURIs.set(tokenId, uri);
    
    return tokenId;
  }
  
  ownerOf(tokenId: bigint): Address | undefined {
    return this.owners.get(tokenId);
  }
  
  balanceOf(owner: Address): number {
    return this.balances.get(owner) || 0;
  }
  
  transfer(from: Address, to: Address, tokenId: bigint): boolean {
    if (this.ownerOf(tokenId) !== from) return false;
    if (this.getApproved(tokenId) !== to) return false;
    
    this.owners.set(tokenId, to);
    this.balances.set(from, (this.balances.get(from) || 0) - 1);
    this.balances.set(to, (this.balances.get(to) || 0) + 1);
    this.approvals.delete(tokenId);
    
    return true;
  }
  
  approve(owner: Address, approved: Address, tokenId: bigint): boolean {
    if (this.ownerOf(tokenId) !== owner) return false;
    this.approvals.set(tokenId, approved);
    return true;
  }
  
  getApproved(tokenId: bigint): Address | undefined {
    return this.approvals.get(tokenId);
  }
  
  tokenURI(tokenId: bigint): string | undefined {
    return this.tokenURIs.get(tokenId);
  }
}

export function demo(): void {
  console.log('=== 区块链高级 ===\n');
  
  // ERC-20代币
  console.log('--- ERC-20代币 ---');
  const token = new ERC20Token('MyToken', 'MTK', 18, 1000000n);
  
  token.mint('0xAlice', 1000n);
  token.mint('0xBob', 500n);
  
  console.log('代币信息:', token.getInfo());
  console.log('Alice余额:', token.balanceOf('0xAlice').toString());
  console.log('Bob余额:', token.balanceOf('0xBob').toString());
  
  token.transfer('0xAlice', '0xBob', 100n);
  console.log('转账后 Alice:', token.balanceOf('0xAlice').toString());
  console.log('转账后 Bob:', token.balanceOf('0xBob').toString());
  
  // AMM
  console.log('\n--- 自动化做市商 ---');
  const tokenA = new ERC20Token('TokenA', 'TKA', 18, 10000n);
  const tokenB = new ERC20Token('TokenB', 'TKB', 18, 10000n);
  const amm = new AutomatedMarketMaker(tokenA, tokenB);
  
  // 添加流动性
  const shares = amm.addLiquidity('0xLP', 1000n, 2000n);
  console.log('LP获得份额:', shares.toString());
  console.log('储备:', amm.getReserves());
  
  // 交换
  const quote = amm.getSwapQuote(100n, 'A');
  console.log('交换报价:', {
    outputAmount: quote.outputAmount.toString(),
    priceImpact: (quote.priceImpact * 100).toFixed(2) + '%',
    fee: quote.fee.toString()
  });
  
  const output = amm.swap(100n, 'A');
  console.log('实际获得:', output.toString());
  console.log('新储备:', amm.getReserves());
  
  // NFT
  console.log('\n--- NFT ---');
  const nft = new ERC721NFT('CryptoArt', 'ART');
  
  const tokenId1 = nft.mint('0xAlice', 'https://example.com/nft/1');
  const tokenId2 = nft.mint('0xBob', 'https://example.com/nft/2');
  
  console.log('NFT 1 拥有者:', nft.ownerOf(tokenId1));
  console.log('NFT 2 拥有者:', nft.ownerOf(tokenId2));
  console.log('Alice NFT数量:', nft.balanceOf('0xAlice'));
  
  // 跨链桥
  console.log('\n--- 跨链桥 ---');
  const bridge = new CrossChainBridge();
  
  const ethereum = new EVMState();
  const polygon = new EVMState();
  
  bridge.registerChain('ethereum', ethereum);
  bridge.registerChain('polygon', polygon);
  
  ethereum.setBalance('0xAlice', 1000n);
  
  bridge.lock('ethereum', 'polygon', '0xAlice', '0xToken', 100n);
  console.log('锁定后 Ethereum余额:', ethereum.getBalance('0xAlice').toString());
}
