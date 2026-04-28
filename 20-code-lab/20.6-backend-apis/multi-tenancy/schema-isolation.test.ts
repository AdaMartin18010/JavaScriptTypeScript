import { describe, it, expect } from 'vitest'
import { SchemaIsolationStrategy } from './schema-isolation.js'

describe('schema-isolation', () => {
  it('SchemaIsolationStrategy is defined', () => {
    expect(typeof SchemaIsolationStrategy).not.toBe('undefined');
  });

  it('can instantiate with default config', () => {
    const strategy = new SchemaIsolationStrategy();
    expect(strategy.getStrategy()).toBe('shared_schema');
  });

  it('shared_schema returns default schema for all tenants', () => {
    const strategy = new SchemaIsolationStrategy({ strategy: 'shared_schema' });
    expect(strategy.getSchemaName('tenant-a')).toBe('public');
    expect(strategy.getSchemaName('tenant-b')).toBe('public');
  });

  it('separate_schema returns prefixed schema per tenant', () => {
    const strategy = new SchemaIsolationStrategy({ strategy: 'separate_schema', schemaPrefix: 't_' });
    expect(strategy.getSchemaName('tenant-a')).toBe('t_tenant_a');
  });

  it('separate_database returns db per tenant', () => {
    const strategy = new SchemaIsolationStrategy({ strategy: 'separate_database' });
    expect(strategy.getSchemaName('tenant-a')).toBe('db_tenant_a');
  });

  it('createTable and getTable work correctly', () => {
    const strategy = new SchemaIsolationStrategy();
    strategy.createTable('tenant-1', { name: 'users', columns: { id: 'int' } });
    const table = strategy.getTable('tenant-1', 'users');
    expect(table).toBeDefined();
    expect(table?.name).toBe('users');
  });

  it('hasTable returns correct boolean', () => {
    const strategy = new SchemaIsolationStrategy();
    strategy.createTable('tenant-1', { name: 'users', columns: {} });
    expect(strategy.hasTable('tenant-1', 'users')).toBe(true);
    expect(strategy.hasTable('tenant-1', 'posts')).toBe(false);
  });

  it('dropSchema removes tenant schema', () => {
    const strategy = new SchemaIsolationStrategy({ strategy: 'separate_schema' });
    strategy.createTable('tenant-1', { name: 'users', columns: {} });
    expect(strategy.dropSchema('tenant-1')).toBe(true);
    expect(strategy.hasTable('tenant-1', 'users')).toBe(false);
  });

  it('getAllSchemaNames returns created schemas', () => {
    const strategy = new SchemaIsolationStrategy({ strategy: 'separate_schema' });
    strategy.createTable('tenant-1', { name: 'users', columns: {} });
    strategy.createTable('tenant-2', { name: 'posts', columns: {} });
    const names = strategy.getAllSchemaNames();
    expect(names.length).toBe(2);
  });
});
