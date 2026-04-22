/**
 * @file 显式资源管理（Explicit Resource Management）
 * @category Language Core → Control Flow
 * @difficulty warm
 * @tags using, await-using, symbol-dispose, raii, resource-cleanup, es2023
 *
 * @description
 * 演示 ES2023 `using` / `await using` 声明、`Symbol.dispose` / `Symbol.asyncDispose` 协议、
 * RAII 模式、多资源清理顺序（LIFO），以及资源释放失败的处理。
 */

// ============================================================================
// 1. Symbol.dispose 与基础 using 声明
// ============================================================================

/** ✅ 同步资源：实现 Disposable 协议 */
class FileHandle implements Disposable {
  public isOpen = true;

  constructor(public path: string) {
    console.log(`  [FileHandle] opened: ${path}`);
  }

  read(): string {
    if (!this.isOpen) throw new Error('Handle is closed');
    return `content of ${this.path}`;
  }

  [Symbol.dispose](): void {
    this.isOpen = false;
    console.log(`  [FileHandle] disposed: ${this.path}`);
  }
}

/** ✅ 基础 using 声明 */
function demoBasicUsing(): string {
  console.log('--- 基础 using ---');
  using file = new FileHandle('data.txt');
  const content = file.read();
  console.log('  read:', content);
  return content;
  // file[Symbol.dispose]() 自动调用
}

// ============================================================================
// 2. await using 与异步资源
// ============================================================================

/** ✅ 异步资源：实现 AsyncDisposable 协议 */
class DatabaseConnection implements AsyncDisposable {
  public isConnected = true;

  constructor(public dsn: string) {
    console.log(`  [DBConnection] connected: ${dsn}`);
  }

  async query(sql: string): Promise<string[]> {
    if (!this.isConnected) throw new Error('Connection is closed');
    return [`result of: ${sql}`];
  }

  async [Symbol.asyncDispose](): Promise<void> {
    await delay(10);
    this.isConnected = false;
    console.log(`  [DBConnection] async-disposed: ${this.dsn}`);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** ✅ await using 声明 */
async function demoAwaitUsing(): Promise<string[]> {
  console.log('\n--- await using ---');
  await using conn = new DatabaseConnection('postgres://localhost/db');
  const results = await conn.query('SELECT * FROM users');
  console.log('  query results:', results);
  return results;
  // conn[Symbol.asyncDispose]() 自动调用
}

// ============================================================================
// 3. 多资源管理与清理顺序（LIFO）
// ============================================================================

/** ✅ 多个 using 声明按 LIFO 顺序清理 */
function demoLifoOrder(): void {
  console.log('\n--- 多资源 LIFO 清理顺序 ---');

  using file1 = new FileHandle('A.txt');
  using file2 = new FileHandle('B.txt');
  using file3 = new FileHandle('C.txt');

  console.log('  using block body');
  // 清理顺序: C → B → A
}

/** ✅ 混合同步与异步资源 */
async function demoMixedResources(): Promise<void> {
  console.log('\n--- 混合同步/异步资源 ---');

  using file = new FileHandle('config.json');
  await using conn = new DatabaseConnection('postgres://localhost/db');
  using log = new FileHandle('app.log');

  console.log('  mixed block body');
  // 清理顺序: log (sync) → conn (async) → file (sync)
}

// ============================================================================
// 4. 提前 return 与异常安全的资源释放
// ============================================================================

/** ✅ 提前 return 仍触发 dispose */
function demoEarlyReturn(condition: boolean): string {
  console.log('\n--- 提前 return ---');

  using file = new FileHandle('early.txt');
  if (condition) {
    console.log('  early return');
    return 'early';
    // file 仍会被 dispose！
  }
  console.log('  normal path');
  return 'normal';
  // file 也会被 dispose
}

/** ✅ 异常抛出时仍触发 dispose */
function demoExceptionSafety(): void {
  console.log('\n--- 异常安全 ---');

  using file = new FileHandle('safe.txt');
  console.log('  about to throw...');
  throw new Error('boom');
  // file[Symbol.dispose]() 仍会在异常传播前调用
}

// ============================================================================
// 5. 资源释放失败的处理
// ============================================================================

/** ❌ 反例：dispose 方法抛出异常 */
class BrokenResource implements Disposable {
  [Symbol.dispose](): void {
    console.log('  [BrokenResource] dispose throwing...');
    throw new Error('dispose failed');
  }
}

/** 单个资源 dispose 失败会抛出 SuppressedError */
function demoDisposalError(): void {
  console.log('\n--- 反例：dispose 失败 ---');
  try {
    using res = new BrokenResource();
    console.log('  resource used');
  } catch (e) {
    console.log('  caught:', (e as Error).name, '-', (e as Error).message);
  }
}

/** ❌ 反例：主逻辑异常 + dispose 异常 → SuppressedError */
class BrokenOnException implements Disposable {
  [Symbol.dispose](): void {
    console.log('  [BrokenOnException] dispose throwing...');
    throw new Error('dispose-error');
  }
}

function demoSuppressedError(): void {
  console.log('\n--- 反例：主异常 + dispose 异常 ---');
  try {
    using res = new BrokenOnException();
    console.log('  about to throw main error...');
    throw new Error('main-error');
  } catch (e) {
    const err = e as Error & { suppressed?: Error };
    console.log('  caught:', err.name, '-', err.message);
    if (err.suppressed) {
      console.log('  suppressed:', err.suppressed.message);
    }
  }
}

// ============================================================================
// 6. RAII 模式对比
// ============================================================================

/** ❌ 传统 try...finally：冗长 */
function withFileLegacy(path: string): string {
  const file = new FileHandle(path);
  try {
    return file.read();
  } finally {
    file[Symbol.dispose]();
  }
}

/** ✅ using 声明：简洁且异常安全 */
function withFileModern(path: string): string {
  using file = new FileHandle(path);
  return file.read();
}

/** ✅ 使用 using 实现作用域锁 */
class Lock implements Disposable {
  private locked = false;

  acquire(): void {
    if (this.locked) throw new Error('already locked');
    this.locked = true;
    console.log('  [Lock] acquired');
  }

  [Symbol.dispose](): void {
    this.locked = false;
    console.log('  [Lock] released');
  }
}

function demoLock(): void {
  console.log('\n--- RAII 锁模式 ---');
  const lock = new Lock();
  lock.acquire();
  using _guard = lock;
  console.log('  critical section');
  // 自动释放
}

// ============================================================================
// 7. null/undefined 的 using 行为
// ============================================================================

/** ✅ using 允许 null/undefined（无操作） */
function demoNullishResource(): void {
  console.log('\n--- null/undefined using ---');
  using _maybe = null as FileHandle | null;
  console.log('  null resource skipped');
}

// ============================================================================
// 导出
// ============================================================================

export {
  FileHandle,
  DatabaseConnection,
  Lock,
  BrokenResource,
  BrokenOnException,
  delay
};

// ============================================================================
// Demo 函数
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== Explicit Resource Management Demo ===\n');

  demoBasicUsing();
  await demoAwaitUsing();
  demoLifoOrder();
  await demoMixedResources();

  console.log('\n--- 提前 return ---');
  console.log('earlyReturn(true):', demoEarlyReturn(true));
  console.log('earlyReturn(false):', demoEarlyReturn(false));

  console.log('\n--- 异常安全 ---');
  try {
    demoExceptionSafety();
  } catch (e) {
    console.log('  propagated:', (e as Error).message);
  }

  demoDisposalError();
  demoSuppressedError();

  console.log('\n--- RAII 对比 ---');
  console.log('legacy:', withFileLegacy('legacy.txt'));
  console.log('modern:', withFileModern('modern.txt'));
  demoLock();
  demoNullishResource();

  console.log('\n=== End of Demo ===\n');
}
