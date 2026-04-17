import { describe, it, expect } from 'vitest'
import { TenantConfigManager } from './tenant-config.js'

describe('tenant-config', () => {
  it('TenantConfigManager is defined', () => {
    expect(typeof TenantConfigManager).not.toBe('undefined');
  });

  it('returns default config for new tenant', () => {
    const manager = new TenantConfigManager({ theme: 'dark' });
    const config = manager.getConfig('tenant-1');
    expect(config.theme).toBe('dark');
  });

  it('updateConfig merges deeply', () => {
    const manager = new TenantConfigManager();
    manager.updateConfig('tenant-1', { features: { beta: true } });
    expect(manager.isFeatureEnabled('tenant-1', 'beta')).toBe(true);
  });

  it('setFeature toggles features', () => {
    const manager = new TenantConfigManager();
    manager.setFeature('tenant-1', 'feature-x', true);
    expect(manager.isFeatureEnabled('tenant-1', 'feature-x')).toBe(true);
    manager.setFeature('tenant-1', 'feature-x', false);
    expect(manager.isFeatureEnabled('tenant-1', 'feature-x')).toBe(false);
  });

  it('getLimit returns correct limit', () => {
    const manager = new TenantConfigManager({ limits: { storage: 1000 } });
    expect(manager.getLimit('tenant-1', 'storage')).toBe(1000);
    expect(manager.getLimit('tenant-1', 'unknown')).toBeUndefined();
  });

  it('removeConfig deletes tenant config', () => {
    const manager = new TenantConfigManager();
    manager.getConfig('tenant-1');
    expect(manager.removeConfig('tenant-1')).toBe(true);
    expect(manager.getRegisteredTenants()).not.toContain('tenant-1');
  });

  it('getRegisteredTenants returns all tenant ids', () => {
    const manager = new TenantConfigManager();
    manager.getConfig('tenant-1');
    manager.getConfig('tenant-2');
    const tenants = manager.getRegisteredTenants();
    expect(tenants).toContain('tenant-1');
    expect(tenants).toContain('tenant-2');
  });
});
