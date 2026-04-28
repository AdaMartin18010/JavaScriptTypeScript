/**
 * @file Node.js fs 模块最佳实践
 * @category Node.js Core → File System
 * @difficulty medium
 * @tags fs, promise-api, filehandle, watch, path-security
 */

import { promises as fs, watch, constants, type WatchEventType, type Stats } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ============================================================================
// 1. 安全的文件路径解析（防止目录遍历攻击）
// ============================================================================

/**
 * 安全的路径解析：限制在 baseDir 之内，防止 Path Traversal
 * @param baseDir 基础目录（绝对路径）
 * @param userPath 用户输入的相对路径
 * @returns 安全的绝对路径，若越界则抛出错误
 */
export function resolveSafePath(baseDir: string, userPath: string): string {
  const resolved = path.resolve(baseDir, userPath);
  const relative = path.relative(baseDir, resolved);

  // 检查是否以 .. 开头或包含空字符
  if (relative.startsWith('..') || relative.includes('\0')) {
    throw new Error(`非法路径: ${userPath}`);
  }

  return resolved;
}

// ============================================================================
// 2. 原子文件写入（先写临时文件，再重命名）
// ============================================================================

export interface AtomicWriteOptions {
  encoding?: BufferEncoding;
  mode?: number;
}

/**
 * 原子写入文件：使用临时文件 + rename，避免写一半导致文件损坏
 */
export async function writeFileAtomic(
  filePath: string,
  data: string | Buffer,
  options: AtomicWriteOptions = {}
): Promise<void> {
  const { encoding = 'utf-8', mode = 0o644 } = options;
  const tempPath = `${filePath}.tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    await fs.writeFile(tempPath, data, { encoding, mode });
    await fs.rename(tempPath, filePath);
  } catch (err) {
    // 清理临时文件
    try {
      await fs.unlink(tempPath);
    } catch {
      // 忽略清理错误
    }
    throw err;
  }
}

// ============================================================================
// 3. 基于 FileHandle 的大文件分块读取
// ============================================================================

export interface ChunkReadOptions {
  /** 每次读取字节数，默认 64KB */
  chunkSize?: number;
  /** 起始偏移 */
  start?: number;
  /** 结束偏移（不包含） */
  end?: number;
}

/**
 * 分块读取文件，适用于大文件场景，避免一次性载入内存
 */
export async function* readFileChunks(
  filePath: string,
  options: ChunkReadOptions = {}
): AsyncGenerator<Buffer, void, unknown> {
  const { chunkSize = 64 * 1024, start = 0, end = Infinity } = options;
  const handle = await fs.open(filePath, 'r');

  try {
    let offset = start;
    const buffer = Buffer.alloc(chunkSize);

    while (offset < end) {
      const readLength = Math.min(chunkSize, end - offset);
      const { bytesRead } = await handle.read(buffer, 0, readLength, offset);
      if (bytesRead === 0) break;
      yield buffer.subarray(0, bytesRead);
      offset += bytesRead;
    }
  } finally {
    await handle.close();
  }
}

// ============================================================================
// 4. 安全的目录遍历（带深度限制与过滤）
// ============================================================================

export interface WalkOptions {
  /** 最大递归深度 */
  maxDepth?: number;
  /** 文件过滤器 */
  filter?: (file: string, stats: Stats) => boolean;
}

export interface WalkEntry {
  path: string;
  name: string;
  stats: Stats;
  depth: number;
}

/**
 * 安全地递归遍历目录，支持深度限制与过滤
 */
export async function* walkDir(
  dirPath: string,
  options: WalkOptions = {},
  currentDepth = 0
): AsyncGenerator<WalkEntry, void, unknown> {
  const { maxDepth = Infinity, filter } = options;
  if (currentDepth > maxDepth) return;

  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const stats = await fs.stat(fullPath);

    if (filter && !filter(fullPath, stats)) continue;

    yield { path: fullPath, name: entry.name, stats, depth: currentDepth };

    if (entry.isDirectory() && currentDepth < maxDepth) {
      yield* walkDir(fullPath, options, currentDepth + 1);
    }
  }
}

// ============================================================================
// 5. 文件变更监听（防抖 + 事件聚合）
// ============================================================================

export interface WatchOptions {
  /** 防抖延迟毫秒 */
  debounceMs?: number;
  /** 是否递归监听子目录 */
  recursive?: boolean;
}

export type FileChangeHandler = (eventType: WatchEventType, filename: string | null) => void;

/**
 * 防抖的文件监听器，聚合高频变更事件
 */
export function watchFileDebounced(
  targetPath: string,
  handler: FileChangeHandler,
  options: WatchOptions = {}
): { close: () => Promise<void> } {
  const { debounceMs = 100, recursive = false } = options;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingEvent: { eventType: WatchEventType; filename: string | null } | null = null;

  const watcher = watch(targetPath, { recursive }, (eventType, filename) => {
    pendingEvent = { eventType, filename };
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      if (pendingEvent) {
        handler(pendingEvent.eventType, pendingEvent.filename);
        pendingEvent = null;
      }
    }, debounceMs);
  });

  return {
    close: () =>
      new Promise((resolve) => {
        if (timer) clearTimeout(timer);
        watcher.close();
        resolve();
      })
  };
}

// ============================================================================
// 6. 目录镜像同步（增量复制）
// ============================================================================

export interface MirrorOptions {
  /** 是否删除目标目录中源目录不存在的文件 */
  deleteOrphans?: boolean;
  /** 文件过滤 */
  filter?: (srcPath: string) => boolean;
}

/**
 * 增量镜像同步：将源目录内容同步到目标目录，仅复制变更的文件
 */
export async function mirrorDir(srcDir: string, destDir: string, options: MirrorOptions = {}): Promise<void> {
  const { deleteOrphans = false, filter } = options;

  // 确保目标目录存在
  await fs.mkdir(destDir, { recursive: true });

  const srcEntries = await fs.readdir(srcDir, { withFileTypes: true });
  const destEntries = new Set(await fs.readdir(destDir));

  for (const entry of srcEntries) {
    if (filter && !filter(path.join(srcDir, entry.name))) continue;

    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await mirrorDir(srcPath, destPath, options);
    } else {
      // 仅在文件不存在或修改时间不同时复制
      const srcStat = await fs.stat(srcPath);
      let needCopy = true;
      if (destEntries.has(entry.name)) {
        const destStat = await fs.stat(destPath);
        needCopy = srcStat.mtimeMs > destStat.mtimeMs || srcStat.size !== destStat.size;
      }
      if (needCopy) {
        await fs.copyFile(srcPath, destPath, constants.COPYFILE_FICLONE);
      }
    }
  }

  if (deleteOrphans) {
    for (const destName of destEntries) {
      if (!srcEntries.find((e) => e.name === destName)) {
        await fs.rm(path.join(destDir, destName), { recursive: true, force: true });
      }
    }
  }
}

// ============================================================================
// Demo
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== fs 模块最佳实践演示 ===\n');

  // 1. 安全路径
  console.log('--- 1. 安全路径解析 ---');
  const safe = resolveSafePath('/data/uploads', 'images/photo.jpg');
  console.log('安全路径:', safe);
  try {
    resolveSafePath('/data/uploads', '../../../etc/passwd');
  } catch (e) {
    console.log('目录遍历被阻止:', (e as Error).message);
  }

  // 2. 原子写入
  console.log('\n--- 2. 原子文件写入 ---');
  const tempDir = await fs.mkdtemp('/tmp/fs-demo-');
  const testFile = path.join(tempDir, 'test.txt');
  await writeFileAtomic(testFile, 'hello world');
  const content = await fs.readFile(testFile, 'utf-8');
  console.log('写入并读取:', content);
  await fs.rm(tempDir, { recursive: true, force: true });

  // 3. 分块读取
  console.log('\n--- 3. 分块读取 ---');
  const chunkDir = await fs.mkdtemp('/tmp/chunk-demo-');
  const chunkFile = path.join(chunkDir, 'data.bin');
  await fs.writeFile(chunkFile, Buffer.alloc(1024 * 10, 0xAB)); // 10KB 测试数据
  let chunkCount = 0;
  for await (const chunk of readFileChunks(chunkFile, { chunkSize: 2048 })) {
    chunkCount++;
  }
  console.log(`10KB 文件按 2KB 分块读取，共 ${chunkCount} 块`);
  await fs.rm(chunkDir, { recursive: true, force: true });

  // 4. 目录遍历
  console.log('\n--- 4. 目录遍历 ---');
  const walkDirPath = await fs.mkdtemp('/tmp/walk-demo-');
  await fs.mkdir(path.join(walkDirPath, 'sub'));
  await fs.writeFile(path.join(walkDirPath, 'a.txt'), 'a');
  await fs.writeFile(path.join(walkDirPath, 'sub', 'b.txt'), 'b');
  const files: string[] = [];
  for await (const entry of walkDir(walkDirPath, { maxDepth: 2, filter: (_p, s) => s.isFile() })) {
    files.push(entry.name);
  }
  console.log('遍历到的文件:', files.sort());
  await fs.rm(walkDirPath, { recursive: true, force: true });

  console.log('\n=== 演示结束 ===\n');
}
