import { describe, it, expect } from 'vitest';
import { ServiceRegistry } from './service-discovery.js';

describe('ServiceRegistry', () => {
  it('should register and discover instances', () => {
    const registry = new ServiceRegistry();
    registry.register('svc', { id: 'i1', host: '127.0.0.1', port: 80, metadata: {}, healthy: true });
    expect(registry.discover('svc').length).toBe(1);
  });

  it('should deregister an instance', () => {
    const registry = new ServiceRegistry();
    registry.register('svc', { id: 'i1', host: '127.0.0.1', port: 80, metadata: {}, healthy: true });
    registry.deregister('svc', 'i1');
    expect(registry.discover('svc').length).toBe(0);
  });

  it('should filter healthy instances', () => {
    const registry = new ServiceRegistry();
    registry.register('svc', { id: 'i1', host: '127.0.0.1', port: 80, metadata: {}, healthy: true });
    registry.register('svc', { id: 'i2', host: '127.0.0.1', port: 81, metadata: {}, healthy: false });
    expect(registry.getHealthyInstances('svc').length).toBe(1);
  });

  it('should select round-robin among healthy instances', () => {
    const registry = new ServiceRegistry();
    registry.register('svc', { id: 'i1', host: '127.0.0.1', port: 80, metadata: {}, healthy: true });
    registry.register('svc', { id: 'i2', host: '127.0.0.1', port: 81, metadata: {}, healthy: true });

    const selected = [
      registry.selectRoundRobin('svc')!.id,
      registry.selectRoundRobin('svc')!.id,
      registry.selectRoundRobin('svc')!.id
    ];
    expect(selected[0]).not.toBe(selected[1]);
    expect(selected[2]).toBe(selected[0]);
  });

  it('should return undefined when no healthy instances', () => {
    const registry = new ServiceRegistry();
    registry.register('svc', { id: 'i1', host: '127.0.0.1', port: 80, metadata: {}, healthy: false });
    expect(registry.selectRoundRobin('svc')).toBeUndefined();
    expect(registry.selectRandom('svc')).toBeUndefined();
  });

  it('should update health status', () => {
    const registry = new ServiceRegistry();
    registry.register('svc', { id: 'i1', host: '127.0.0.1', port: 80, metadata: {}, healthy: true });
    registry.updateHealth('svc', 'i1', false);
    expect(registry.getHealthyInstances('svc').length).toBe(0);
  });
});
