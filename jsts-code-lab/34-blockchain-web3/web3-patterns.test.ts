import { describe, it, expect } from 'vitest';
import { WalletManager, SmartContract, TransactionManager, MultiChainManager } from './web3-patterns';

const mockProvider = {
  request: async (args: any) => {
    switch (args.method) {
      case 'eth_requestAccounts': return ['0x742d35Cc6634C0532925a3b8D433A1538D5bB1B1'];
      case 'eth_chainId': return '0x1';
      case 'eth_accounts': return ['0x742d35Cc6634C0532925a3b8D433A1538D5bB1B1'];
      case 'eth_getBalance': return '0x' + (BigInt(10) ** BigInt(18) * BigInt(5)).toString(16);
      case 'eth_sendTransaction': return '0xabc123';
      case 'eth_call': return '0x' + (BigInt(5) * BigInt(10) ** BigInt(18)).toString(16);
      default: return '0x';
    }
  },
  on: () => {},
  removeListener: () => {}
} as any;

describe('WalletManager', () => {
  it('connects and gets accounts', async () => {
    const wm = new WalletManager();
    const conn = await wm.connect(mockProvider);
    expect(conn.isConnected).toBe(true);
    expect(conn.chainId).toBe(1);
    expect(wm.getAccounts().length).toBe(1);
  });
});

describe('SmartContract', () => {
  const abi = [
    { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' }
  ] as any;

  it('call reads state', async () => {
    const contract = new SmartContract({ address: '0xToken', abi }, mockProvider);
    const result = await contract.call('balanceOf', ['0xOwner']);
    expect(typeof result).toBe('bigint');
  });
});

describe('TransactionManager', () => {
  it('sends transaction and returns receipt', async () => {
    const txm = new TransactionManager(mockProvider);
    const receipt = await txm.sendTransaction({ to: '0x123', value: BigInt(1) });
    expect(receipt.status).toBe('success');
    expect(receipt.transactionHash).toBeDefined();
  });

  it('signs message', async () => {
    const txm = new TransactionManager(mockProvider);
    const sig = await txm.signMessage('hello');
    expect(typeof sig).toBe('string');
  });
});

describe('MultiChainManager', () => {
  it('registers default chains', () => {
    const mcm = new MultiChainManager();
    expect(mcm.getAllChains().length).toBeGreaterThan(0);
    expect(mcm.getChain(1)?.name).toContain('Ethereum');
  });

  it('gets balance via mock provider', async () => {
    const mcm = new MultiChainManager();
    const bal = await mcm.getBalance(1, '0xOwner');
    expect(bal).toBeGreaterThan(0n);
  });
});
