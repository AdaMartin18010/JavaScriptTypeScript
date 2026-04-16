import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  MigrationRunner,
  MemoryMigrationStorage,
} from './migration-system';
import type { Migration } from './migration-system';

describe('MigrationRunner', () => {
  let storage: MemoryMigrationStorage;
  let runner: MigrationRunner;

  const createMigration = (id: string, timestamp: number): Migration => ({
    id,
    name: `Migration ${id}`,
    timestamp,
    up: vi.fn().mockResolvedValue(undefined),
    down: vi.fn().mockResolvedValue(undefined),
  });

  beforeEach(() => {
    storage = new MemoryMigrationStorage();
    runner = new MigrationRunner(storage);
  });

  it('should register migrations', async () => {
    const m1 = createMigration('001', 1);
    runner.register(m1);
    const status = await runner.getStatus();
    expect(status.pending).toHaveLength(1);
  });

  it('should apply pending migrations', async () => {
    const m1 = createMigration('001', 1);
    runner.register(m1);
    const results = await runner.migrate();

    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
    expect(m1.up).toHaveBeenCalled();

    const status = await runner.getStatus();
    expect(status.pending).toHaveLength(0);
    expect(status.applied).toHaveLength(1);
  });

  it('should rollback last migration', async () => {
    const m1 = createMigration('001', 1);
    runner.register(m1);
    await runner.migrate();

    const results = await runner.rollback(1);
    expect(results[0].success).toBe(true);
    expect(m1.down).toHaveBeenCalled();
  });

  it('should rollback to specific migration', async () => {
    const m1 = createMigration('001', 1);
    const m2 = createMigration('002', 2);
    runner.register(m1);
    runner.register(m2);
    await runner.migrate();

    const results = await runner.rollbackTo('001');
    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
  });

  it('should redo a migration', async () => {
    const m1 = createMigration('001', 1);
    runner.register(m1);
    await runner.migrate();

    const results = await runner.redo('001');
    expect(results).toHaveLength(2);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(true);
    expect(m1.down).toHaveBeenCalled();
    expect(m1.up).toHaveBeenCalledTimes(2);
  });

  it('should report last applied migration', async () => {
    const m1 = createMigration('001', 1);
    runner.register(m1);
    await runner.migrate();

    const status = await runner.getStatus();
    expect(status.lastApplied?.id).toBe('001');
  });

  it('should generate migration template', async () => {
    const id = await runner.create('Test Migration');
    expect(id).toContain('test_migration');
    const content = storage.getMigrationFile(id);
    expect(content).toContain('Migration');
    expect(content).toContain('up');
    expect(content).toContain('down');
  });

  it('should handle missing migration during rollback', async () => {
    // Apply migration directly to storage without registering
    await storage.saveAppliedMigration({
      id: 'missing',
      name: 'Missing',
      appliedAt: new Date(),
      checksum: 'x',
      executionTime: 0,
    });

    // rollback only considers registered migrations; unregistered ones are ignored
    const results = await runner.rollback(1);
    expect(results).toHaveLength(0);
  });
});

describe('MemoryMigrationStorage', () => {
  it('should save and load applied migrations', async () => {
    const storage = new MemoryMigrationStorage();
    const record = { id: '001', name: 'Init', appliedAt: new Date(), checksum: 'abc', executionTime: 10 };
    await storage.saveAppliedMigration(record);

    const loaded = await storage.loadAppliedMigrations();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('001');
  });

  it('should update existing records', async () => {
    const storage = new MemoryMigrationStorage();
    await storage.saveAppliedMigration({ id: '001', name: 'Init', appliedAt: new Date(), checksum: 'abc', executionTime: 10 });
    await storage.saveAppliedMigration({ id: '001', name: 'Updated', appliedAt: new Date(), checksum: 'def', executionTime: 20 });

    const loaded = await storage.loadAppliedMigrations();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe('Updated');
  });

  it('should remove applied migrations', async () => {
    const storage = new MemoryMigrationStorage();
    await storage.saveAppliedMigration({ id: '001', name: 'Init', appliedAt: new Date(), checksum: 'abc', executionTime: 10 });
    await storage.removeAppliedMigration('001');

    const loaded = await storage.loadAppliedMigrations();
    expect(loaded).toHaveLength(0);
  });

  it('should save migration files', async () => {
    const storage = new MemoryMigrationStorage();
    await storage.saveMigrationFile('001', 'content');
    expect(storage.getMigrationFile('001')).toBe('content');
  });
});
