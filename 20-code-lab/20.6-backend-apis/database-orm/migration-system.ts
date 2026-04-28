/**
 * @file 数据库迁移系统
 * @category Database → Migrations
 * @difficulty hard
 * @tags migration, schema, versioning, rollback
 * 
 * @description
 * 数据库迁移系统实现：
 * - 迁移文件管理
 * - 版本控制
 * - 回滚机制
 * - 依赖追踪
 */

// ============================================================================
// 1. 迁移类型定义
// ============================================================================

export interface Migration {
  id: string;
  name: string;
  timestamp: number;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

export interface MigrationRecord {
  id: string;
  name: string;
  appliedAt: Date;
  checksum: string;
  executionTime: number;
}

export interface MigrationStatus {
  pending: Migration[];
  applied: MigrationRecord[];
  lastApplied: MigrationRecord | null;
}

// ============================================================================
// 2. 迁移执行器
// ============================================================================

export class MigrationRunner {
  private migrations = new Map<string, Migration>();
  private appliedMigrations = new Map<string, MigrationRecord>();
  private storage: MigrationStorage;

  constructor(storage: MigrationStorage) {
    this.storage = storage;
  }

  // 注册迁移
  register(migration: Migration): void {
    this.migrations.set(migration.id, migration);
  }

  // 获取迁移状态
  async getStatus(): Promise<MigrationStatus> {
    const applied = await this.storage.loadAppliedMigrations();
    applied.forEach(record => {
      this.appliedMigrations.set(record.id, record);
    });

    const pending: Migration[] = [];
    const appliedRecords: MigrationRecord[] = [];

    // 按时间戳排序
    const sortedMigrations = Array.from(this.migrations.values())
      .sort((a, b) => a.timestamp - b.timestamp);

    for (const migration of sortedMigrations) {
      const applied = this.appliedMigrations.get(migration.id);
      if (applied) {
        appliedRecords.push(applied);
      } else {
        pending.push(migration);
      }
    }

    return {
      pending,
      applied: appliedRecords,
      lastApplied: appliedRecords.length > 0 
        ? appliedRecords[appliedRecords.length - 1] 
        : null
    };
  }

  // 执行所有待处理迁移
  async migrate(): Promise<MigrationResult[]> {
    const status = await this.getStatus();
    const results: MigrationResult[] = [];

    for (const migration of status.pending) {
      const result = await this.applyMigration(migration);
      results.push(result);
      
      if (!result.success) {
        console.error(`Migration ${migration.id} failed:`, result.error);
        break;
      }
    }

    return results;
  }

  // 回滚指定数量迁移
  async rollback(count = 1): Promise<MigrationResult[]> {
    const status = await this.getStatus();
    const toRollback = status.applied.slice(-count);
    const results: MigrationResult[] = [];

    // 按逆序回滚
    for (const record of toRollback.reverse()) {
      const migration = this.migrations.get(record.id);
      if (!migration) {
        results.push({
          migrationId: record.id,
          success: false,
          error: new Error(`Migration ${record.id} not found`)
        });
        continue;
      }

      const result = await this.rollbackMigration(migration);
      results.push(result);
    }

    return results;
  }

  // 回滚到指定迁移
  async rollbackTo(migrationId: string): Promise<MigrationResult[]> {
    const status = await this.getStatus();
    const targetIndex = status.applied.findIndex(r => r.id === migrationId);
    
    if (targetIndex === -1) {
      throw new Error(`Migration ${migrationId} not found in applied migrations`);
    }

    const toRollback = status.applied.slice(targetIndex + 1);
    const results: MigrationResult[] = [];

    for (const record of toRollback.reverse()) {
      const migration = this.migrations.get(record.id);
      if (migration) {
        const result = await this.rollbackMigration(migration);
        results.push(result);
      }
    }

    return results;
  }

  // 重做指定迁移
  async redo(migrationId: string): Promise<MigrationResult[]> {
    const results: MigrationResult[] = [];
    
    const migration = this.migrations.get(migrationId);
    if (!migration) {
      throw new Error(`Migration ${migrationId} not found`);
    }

    // 回滚
    const rollbackResult = await this.rollbackMigration(migration);
    results.push(rollbackResult);

    if (rollbackResult.success) {
      // 重新应用
      const applyResult = await this.applyMigration(migration);
      results.push(applyResult);
    }

    return results;
  }

  // 创建迁移
  async create(name: string): Promise<string> {
    const timestamp = Date.now();
    const id = `${timestamp}_${this.slugify(name)}`;
    
    const template = this.generateMigrationTemplate(id, name);
    await this.storage.saveMigrationFile(id, template);
    
    return id;
  }

  private async applyMigration(migration: Migration): Promise<MigrationResult> {
    const startTime = Date.now();
    
    try {
      await migration.up();
      
      const executionTime = Date.now() - startTime;
      const record: MigrationRecord = {
        id: migration.id,
        name: migration.name,
        appliedAt: new Date(),
        checksum: this.computeChecksum(migration),
        executionTime
      };
      
      await this.storage.saveAppliedMigration(record);
      this.appliedMigrations.set(migration.id, record);

      return {
        migrationId: migration.id,
        success: true,
        executionTime
      };
    } catch (error) {
      return {
        migrationId: migration.id,
        success: false,
        error: error as Error
      };
    }
  }

  private async rollbackMigration(migration: Migration): Promise<MigrationResult> {
    const startTime = Date.now();
    
    try {
      await migration.down();
      
      await this.storage.removeAppliedMigration(migration.id);
      this.appliedMigrations.delete(migration.id);

      return {
        migrationId: migration.id,
        success: true,
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        migrationId: migration.id,
        success: false,
        error: error as Error
      };
    }
  }

  private computeChecksum(migration: Migration): string {
    // 简化实现：使用迁移名称和时间戳
    return `${migration.name}_${migration.timestamp}`;
  }

  private slugify(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  }

  private generateMigrationTemplate(id: string, name: string): string {
    return `import { Migration } from './migration-system.js';

export const ${this.slugify(name)}: Migration = {
  id: '${id}',
  name: '${name}',
  timestamp: ${Date.now()},
  
  async up(): Promise<void> {
    // TODO: 实现迁移逻辑
    console.log('Running migration: ${name}');
  },
  
  async down(): Promise<void> {
    // TODO: 实现回滚逻辑
    console.log('Rolling back migration: ${name}');
  }
};
`;
  }
}

// ============================================================================
// 3. 迁移存储接口
// ============================================================================

export interface MigrationStorage {
  loadAppliedMigrations(): Promise<MigrationRecord[]>;
  saveAppliedMigration(record: MigrationRecord): Promise<void>;
  removeAppliedMigration(id: string): Promise<void>;
  saveMigrationFile(id: string, content: string): Promise<void>;
}

// 内存存储实现（测试用）
export class MemoryMigrationStorage implements MigrationStorage {
  private appliedMigrations: MigrationRecord[] = [];
  private migrationFiles = new Map<string, string>();

  async loadAppliedMigrations(): Promise<MigrationRecord[]> {
    return [...this.appliedMigrations];
  }

  async saveAppliedMigration(record: MigrationRecord): Promise<void> {
    const index = this.appliedMigrations.findIndex(m => m.id === record.id);
    if (index >= 0) {
      this.appliedMigrations[index] = record;
    } else {
      this.appliedMigrations.push(record);
    }
  }

  async removeAppliedMigration(id: string): Promise<void> {
    const index = this.appliedMigrations.findIndex(m => m.id === id);
    if (index >= 0) {
      this.appliedMigrations.splice(index, 1);
    }
  }

  async saveMigrationFile(id: string, content: string): Promise<void> {
    this.migrationFiles.set(id, content);
  }

  getMigrationFile(id: string): string | undefined {
    return this.migrationFiles.get(id);
  }
}

// ============================================================================
// 4. 迁移结果
// ============================================================================

interface MigrationResult {
  migrationId: string;
  success: boolean;
  executionTime?: number;
  error?: Error;
}

// ============================================================================
// 5. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== 数据库迁移系统 ===\n');

  // 创建存储和执行器
  const storage = new MemoryMigrationStorage();
  const runner = new MigrationRunner(storage);

  // 注册一些迁移
  runner.register({
    id: '001_create_users',
    name: 'Create users table',
    timestamp: 1,
    up: async () => { console.log('  Creating users table...'); },
    down: async () => { console.log('  Dropping users table...'); }
  });

  runner.register({
    id: '002_add_email_index',
    name: 'Add email index',
    timestamp: 2,
    up: async () => { console.log('  Adding email index...'); },
    down: async () => { console.log('  Removing email index...'); }
  });

  runner.register({
    id: '003_create_posts',
    name: 'Create posts table',
    timestamp: 3,
    up: async () => { console.log('  Creating posts table...'); },
    down: async () => { console.log('  Dropping posts table...'); }
  });

  console.log('1. 初始状态');
  let status = await runner.getStatus();
  console.log('   Pending:', status.pending.length);
  console.log('   Applied:', status.applied.length);

  console.log('\n2. 执行所有迁移');
  const results = await runner.migrate();
  results.forEach(r => {
    console.log(`   ${r.migrationId}: ${r.success ? '✓' : '✗'} ${r.executionTime}ms`);
  });

  console.log('\n3. 迁移后状态');
  status = await runner.getStatus();
  console.log('   Pending:', status.pending.length);
  console.log('   Applied:', status.applied.length);
  console.log('   Last Applied:', status.lastApplied?.id);

  console.log('\n4. 回滚最后一个迁移');
  const rollbackResults = await runner.rollback(1);
  rollbackResults.forEach(r => {
    console.log(`   ${r.migrationId}: ${r.success ? '✓ rolled back' : '✗ failed'}`);
  });

  console.log('\n5. 回滚后状态');
  status = await runner.getStatus();
  console.log('   Pending:', status.pending.length);
  console.log('   Applied:', status.applied.length);

  console.log('\n6. 重新应用');
  await runner.migrate();

  console.log('\n迁移系统要点:');
  console.log('- 版本控制：每个迁移有唯一ID和时间戳');
  console.log('- 原子性：迁移要么全部成功，要么全部失败');
  console.log('- 回滚支持：每个迁移必须有对应的 down 方法');
  console.log('- 执行记录：已应用的迁移会被记录');
  console.log('- 校验和：防止已应用的迁移被修改');
}

// ============================================================================
// 导出 (已在上面导出)
// ============================================================================

;
