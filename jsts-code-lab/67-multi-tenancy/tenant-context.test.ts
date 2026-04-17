import { describe, it, expect } from 'vitest'
import { TenantContextManager } from './tenant-context.js'

describe('tenant-context', () => {
  it('TenantContextManager is defined', () => {
    expect(typeof TenantContextManager).not.toBe('undefined');
  });

  it('can instantiate TenantContextManager', () => {
    const manager = new TenantContextManager();
    expect(manager).toBeDefined();
  });

  it('runWithContext binds context correctly', () => {
    const manager = new TenantContextManager();
    const context = { tenantId: 't-1', permissions: ['read'], metadata: {} };
    const result = manager.runWithContext(context, () => {
      return manager.getCurrentTenantId();
    });
    expect(result).toBe('t-1');
  });

  it('getCurrentContext returns undefined outside context', () => {
    const manager = new TenantContextManager();
    expect(manager.getCurrentContext()).toBeUndefined();
  });

  it('hasPermission checks permissions correctly', () => {
    const manager = new TenantContextManager();
    const context = { tenantId: 't-1', permissions: ['read', 'write'], metadata: {} };
    manager.runWithContext(context, () => {
      expect(manager.hasPermission('read')).toBe(true);
      expect(manager.hasPermission('admin')).toBe(false);
    });
  });

  it('setMetadata and getMetadata work in context', () => {
    const manager = new TenantContextManager();
    const context = { tenantId: 't-1', permissions: [], metadata: {} };
    manager.runWithContext(context, () => {
      manager.setMetadata('key', 'value');
      expect(manager.getMetadata('key')).toBe('value');
    });
  });
});
