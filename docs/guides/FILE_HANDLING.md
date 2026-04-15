# JavaScript/TypeScript 文件处理完整指南

本文档全面介绍 JavaScript 和 TypeScript 环境中的文件处理技术，涵盖浏览器端和 Node.js 端的各类场景。

---

## 目录

1. [浏览器中的文件处理](#1-浏览器中的文件处理)
2. [Node.js 文件系统](#2-nodejs-文件系统)
3. [文件上传](#3-文件上传)
4. [文件下载](#4-文件下载)
5. [压缩和解压](#5-压缩和解压)
6. [图像处理基础](#6-图像处理基础)
7. [CSV/JSON/Excel 文件处理](#7-csvjsonexcel-文件处理)
8. [大文件分片处理](#8-大文件分片处理)
9. [文件系统监控](#9-文件系统监控)
10. [跨平台路径处理](#10-跨平台路径处理)

---

## 1. 浏览器中的文件处理

### 1.1 API 说明

浏览器提供了 File API 来处理用户选择的文件，核心接口包括：

- **File**: 继承自 Blob，包含文件元数据（名称、类型、修改时间等）
- **Blob**: 表示不可变的原始数据，支持分片操作
- **FileReader**: 异步读取文件内容，支持多种格式

### 1.2 代码示例

```typescript
// 类型定义
interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

/**
 * 获取文件信息
 */
function getFileInfo(file: File): FileInfo {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  };
}

/**
 * 使用 FileReader 读取文件为 Data URL
 */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };

    reader.onabort = () => {
      reject(new Error(`File reading aborted: ${file.name}`));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 使用 FileReader 读取文本文件
 */
function readFileAsText(file: File, encoding: string = 'UTF-8'): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };

    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsText(file, encoding);
  });
}

/**
 * 使用 FileReader 读取为 ArrayBuffer（适用于二进制文件）
 */
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target?.result as ArrayBuffer);
    };

    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Blob 分片处理（用于大文件）
 */
function sliceFile(file: File, chunkSize: number = 1024 * 1024): Blob[] {
  const chunks: Blob[] = [];
  let start = 0;

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    chunks.push(file.slice(start, end));
    start = end;
  }

  return chunks;
}

/**
 * 从 Blob 创建可下载的 URL
 */
function createBlobURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * 释放 Blob URL（重要：防止内存泄漏）
 */
function revokeBlobURL(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * 合并多个 Blob
 */
function mergeBlobs(blobs: Blob[]): Blob {
  return new Blob(blobs);
}
```

### 1.3 错误处理

```typescript
class FileHandlerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly file?: File
  ) {
    super(message);
    this.name = 'FileHandlerError';
  }
}

/**
 * 安全的文件读取，带完整错误处理
 */
async function safeReadFile(
  file: File,
  maxSize: number = 50 * 1024 * 1024 // 50MB
): Promise<string> {
  // 验证文件大小
  if (file.size > maxSize) {
    throw new FileHandlerError(
      `File size ${file.size} exceeds maximum ${maxSize}`,
      'FILE_TOO_LARGE',
      file
    );
  }

  // 验证文件类型（可选）
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    throw new FileHandlerError(
      `File type ${file.type} is not allowed`,
      'INVALID_FILE_TYPE',
      file
    );
  }

  try {
    return await readFileAsDataURL(file);
  } catch (error) {
    if (error instanceof FileHandlerError) {
      throw error;
    }
    throw new FileHandlerError(
      `Unexpected error reading file: ${error}`,
      'READ_ERROR',
      file
    );
  }
}
```

### 1.4 性能考虑

| 场景 | 推荐方案 | 原因 |
|------|----------|------|
| 大文件读取 | File.slice() + 分片 | 避免一次性加载大文件到内存 |
| 图片预览 | FileReader.readAsDataURL | 直接生成可展示的 URL |
| 二进制处理 | readAsArrayBuffer | 便于后续 Uint8Array 操作 |
| 内存管理 | 及时 revokeObjectURL | 防止 Blob URL 内存泄漏 |

---

## 2. Node.js 文件系统

### 2.1 API 说明

Node.js 提供 `fs` 模块（文件系统），推荐使用 `fs/promises` 进行异步操作：

- **fs/promises**: 基于 Promise 的异步 API
- **fs.createReadStream/fs.createWriteStream**: 流式读写
- **Buffer**: Node.js 中处理二进制数据的核心

### 2.2 代码示例

```typescript
import { promises as fs, createReadStream, createWriteStream } from 'fs';
import { Readable, Writable } from 'stream';
import { pipeline } from 'stream/promises';
import * as path from 'path';

/**
 * 文件元数据接口
 */
interface FileMetadata {
  size: number;
  created: Date;
  modified: Date;
  isFile: boolean;
  isDirectory: boolean;
}

/**
 * 获取文件元数据
 */
async function getFileMetadata(filePath: string): Promise<FileMetadata> {
  const stats = await fs.stat(filePath);

  return {
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    isFile: stats.isFile(),
    isDirectory: stats.isDirectory(),
  };
}

/**
 * 读取文件为字符串
 */
async function readTextFile(filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
  return fs.readFile(filePath, encoding);
}

/**
 * 读取文件为 Buffer
 */
async function readBinaryFile(filePath: string): Promise<Buffer> {
  return fs.readFile(filePath);
}

/**
 * 写入文本文件
 */
async function writeTextFile(
  filePath: string,
  content: string,
  encoding: BufferEncoding = 'utf-8'
): Promise<void> {
  // 确保目录存在
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  await fs.writeFile(filePath, content, encoding);
}

/**
 * 写入二进制文件
 */
async function writeBinaryFile(filePath: string, buffer: Buffer): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  await fs.writeFile(filePath, buffer);
}

/**
 * 流式复制文件（大文件推荐）
 */
async function copyFileStream(sourcePath: string, destPath: string): Promise<void> {
  const dir = path.dirname(destPath);
  await fs.mkdir(dir, { recursive: true });

  const source = createReadStream(sourcePath);
  const dest = createWriteStream(destPath);

  await pipeline(source, dest);
}

/**
 * 流式读取文件（按行处理）
 */
async function* readLines(filePath: string): AsyncGenerator<string> {
  const stream = createReadStream(filePath, { encoding: 'utf-8' });
  let buffer = '';

  for await (const chunk of stream) {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // 保留不完整的行

    for (const line of lines) {
      yield line.replace(/\r$/, ''); // 移除 Windows 换行符
    }
  }

  // 处理最后一部分
  if (buffer) {
    yield buffer;
  }
}

/**
 * 创建目录（递归）
 */
async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * 删除文件或目录
 */
async function remove(filePath: string): Promise<void> {
  const stats = await fs.stat(filePath).catch(() => null);

  if (!stats) return; // 不存在则忽略

  if (stats.isDirectory()) {
    await fs.rmdir(filePath, { recursive: true });
  } else {
    await fs.unlink(filePath);
  }
}

/**
 * 列出目录内容
 */
async function listDir(dirPath: string): Promise<{ name: string; isFile: boolean }[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  return entries.map((entry) => ({
    name: entry.name,
    isFile: entry.isFile(),
  }));
}

/**
 * 使用 Buffer 处理二进制数据
 */
function processBuffer(buffer: Buffer): Buffer {
  // 示例：对 Buffer 进行某种转换
  const result = Buffer.alloc(buffer.length);

  for (let i = 0; i < buffer.length; i++) {
    result[i] = buffer[i] ^ 0xFF; // 简单的字节翻转示例
  }

  return result;
}

/**
 * Buffer 与字符串转换
 */
function bufferToString(buffer: Buffer, encoding: BufferEncoding = 'utf-8'): string {
  return buffer.toString(encoding);
}

function stringToBuffer(str: string, encoding: BufferEncoding = 'utf-8'): Buffer {
  return Buffer.from(str, encoding);
}
```

### 2.3 错误处理

```typescript
import { promises as fs } from 'fs';

class NodeFileError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly path: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'NodeFileError';
  }
}

/**
 * 安全的文件操作包装器
 */
async function safeFileOperation<T>(
  operation: () => Promise<T>,
  path: string,
  errorCode: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    // 处理常见的 Node.js 文件系统错误
    switch (err.code) {
      case 'ENOENT':
        throw new NodeFileError(
          `File or directory not found: ${path}`,
          'NOT_FOUND',
          path,
          err
        );
      case 'EACCES':
      case 'EPERM':
        throw new NodeFileError(
          `Permission denied: ${path}`,
          'PERMISSION_DENIED',
          path,
          err
        );
      case 'EISDIR':
        throw new NodeFileError(
          `Expected file but found directory: ${path}`,
          'IS_DIRECTORY',
          path,
          err
        );
      case 'ENOTDIR':
        throw new NodeFileError(
          `Expected directory but found file: ${path}`,
          'NOT_DIRECTORY',
          path,
          err
        );
      case 'EEXIST':
        throw new NodeFileError(
          `File or directory already exists: ${path}`,
          'ALREADY_EXISTS',
          path,
          err
        );
      default:
        throw new NodeFileError(
          `File operation failed: ${err.message}`,
          errorCode,
          path,
          err
        );
    }
  }
}

// 使用示例
async function safeReadFile(filePath: string): Promise<Buffer> {
  return safeFileOperation(
    () => fs.readFile(filePath),
    filePath,
    'READ_ERROR'
  );
}
```

### 2.4 性能考虑

```typescript
/**
 * 文件操作性能优化建议：
 *
 * 1. 大文件使用流（Stream）处理，避免一次性加载到内存
 * 2. 小文件（< 1MB）直接使用 readFile/writeFile，更简单高效
 * 3. 使用 pipeline 自动处理背压（backpressure）
 * 4. 批量操作时考虑使用 Promise.all 但要注意并发控制
 */

// 并发控制工具
async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number = 5
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }

  return results;
}
```

---

## 3. 文件上传

### 3.1 API 说明

文件上传涉及多种技术：

- **FormData**: 构建 multipart/form-data 请求体
- **XMLHttpRequest**: 支持进度跟踪的传统 API
- **Fetch API**: 现代的网络请求 API，可通过 ReadableStream 支持进度

### 3.2 代码示例

```typescript
/**
 * 上传进度回调
 */
type UploadProgressCallback = (progress: {
  loaded: number;
  total: number;
  percentage: number;
}) => void;

/**
 * 上传配置选项
 */
interface UploadOptions {
  url: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  onProgress?: UploadProgressCallback;
  timeout?: number;
  retryCount?: number;
}

/**
 * 使用 XMLHttpRequest 上传（支持进度）
 */
function uploadWithXHR(
  file: File,
  options: UploadOptions
): Promise<{ success: boolean; response: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    // 进度监听
    if (options.onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          options.onProgress!({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          });
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ success: true, response: xhr.responseText });
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));
    xhr.addEventListener('timeout', () => reject(new Error('Upload timeout')));

    xhr.open(options.method || 'POST', options.url);

    // 设置自定义 headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    if (options.timeout) {
      xhr.timeout = options.timeout;
    }

    xhr.send(formData);
  });
}

/**
 * 使用 Fetch API 上传（现代方式）
 */
async function uploadWithFetch(
  file: File,
  options: UploadOptions
): Promise<{ success: boolean; response: unknown }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(options.url, {
    method: options.method || 'POST',
    headers: options.headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return { success: true, response: data };
}

/**
 * 分片上传（支持断点续传）
 */
interface ChunkInfo {
  index: number;
  start: number;
  end: number;
  data: Blob;
  retries: number;
}

interface ResumableUploadOptions extends UploadOptions {
  chunkSize?: number; // 默认 2MB
  fileId: string; // 唯一文件标识
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void;
}

/**
 * 创建分片
 */
function createChunks(file: File, chunkSize: number): ChunkInfo[] {
  const chunks: ChunkInfo[] = [];
  const totalChunks = Math.ceil(file.size / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);

    chunks.push({
      index: i,
      start,
      end,
      data: file.slice(start, end),
      retries: 0,
    });
  }

  return chunks;
}

/**
 * 上传单个分片
 */
async function uploadChunk(
  chunk: ChunkInfo,
  file: File,
  fileId: string,
  options: ResumableUploadOptions
): Promise<void> {
  const formData = new FormData();
  formData.append('chunk', chunk.data);
  formData.append('fileId', fileId);
  formData.append('chunkIndex', chunk.index.toString());
  formData.append('totalChunks', Math.ceil(file.size / (options.chunkSize || 2 * 1024 * 1024)).toString());
  formData.append('fileName', file.name);

  const maxRetries = options.retryCount || 3;

  while (chunk.retries < maxRetries) {
    try {
      const response = await fetch(options.url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Chunk upload failed: ${response.status}`);
      }

      options.onChunkComplete?.(chunk.index, maxRetries);
      return;
    } catch (error) {
      chunk.retries++;
      if (chunk.retries >= maxRetries) {
        throw new Error(`Chunk ${chunk.index} failed after ${maxRetries} retries`);
      }
      // 指数退避
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, chunk.retries) * 1000));
    }
  }
}

/**
 * 断点续传上传
 */
async function resumableUpload(
  file: File,
  options: ResumableUploadOptions
): Promise<{ success: boolean; fileId: string }> {
  const chunkSize = options.chunkSize || 2 * 1024 * 1024; // 2MB
  const chunks = createChunks(file, chunkSize);

  // 1. 初始化上传，获取已上传的分片列表
  const uploadedChunksResponse = await fetch(`${options.url}/status?fileId=${options.fileId}`);
  const { uploadedChunks } = await uploadedChunksResponse.json() as { uploadedChunks: number[] };

  // 2. 过滤已上传的分片
  const pendingChunks = chunks.filter((c) => !uploadedChunks.includes(c.index));

  // 3. 串行或并行上传剩余分片（示例使用串行）
  for (const chunk of pendingChunks) {
    await uploadChunk(chunk, file, options.fileId, options);

    // 进度更新
    const loaded = (chunks.length - pendingChunks.length + pendingChunks.indexOf(chunk) + 1) * chunkSize;
    options.onProgress?.({
      loaded: Math.min(loaded, file.size),
      total: file.size,
      percentage: Math.round((loaded / file.size) * 100),
    });
  }

  // 4. 通知服务器合并分片
  const mergeResponse = await fetch(`${options.url}/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileId: options.fileId,
      fileName: file.name,
      totalChunks: chunks.length,
    }),
  });

  if (!mergeResponse.ok) {
    throw new Error('Failed to merge chunks');
  }

  return { success: true, fileId: options.fileId };
}
```

### 3.3 错误处理

```typescript
class UploadError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly file?: File,
    public readonly chunkIndex?: number
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

/**
 * 带重试的文件上传
 */
async function uploadWithRetry(
  file: File,
  options: UploadOptions & { maxRetries?: number }
): Promise<{ success: boolean; response: string }> {
  const maxRetries = options.maxRetries || 3;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await uploadWithXHR(file, options);
    } catch (error) {
      lastError = error as Error;

      // 判断是否可重试
      if (error instanceof UploadError && error.code === 'ABORTED') {
        throw error; // 用户取消不重试
      }

      // 指数退避
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new UploadError(
    `Upload failed after ${maxRetries} attempts: ${lastError?.message}`,
    'MAX_RETRIES_EXCEEDED',
    file
  );
}
```

### 3.4 性能考虑

```typescript
/**
 * 上传优化建议：
 *
 * 1. 分片大小选择：
 *    - 网络稳定: 2-5MB
 *    - 移动网络: 512KB-1MB
 *    - 极不稳定: 256KB
 *
 * 2. 并发控制：
 *    - 同一域名下浏览器限制 6 个并发连接
 *    - 建议同时上传 3-4 个分片
 *
 * 3. 压缩考虑：
 *    - 文本文件（JSON, CSV）在上传前压缩
 *    - 图片在上传前压缩/调整尺寸
 */

/**
 * 并发控制的分片上传
 */
async function concurrentChunkUpload(
  file: File,
  options: ResumableUploadOptions & { concurrency?: number }
): Promise<void> {
  const concurrency = options.concurrency || 3;
  const chunkSize = options.chunkSize || 2 * 1024 * 1024;
  const chunks = createChunks(file, chunkSize);

  const executing: Promise<void>[] = [];

  for (const chunk of chunks) {
    const promise = uploadChunk(chunk, file, options.fileId, options).then(() => {
      executing.splice(executing.indexOf(promise), 1);
    });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
}
```

---

## 4. 文件下载

### 4.1 API 说明

浏览器端文件下载方式：

- **Blob URL**: 创建临时 URL 触发下载
- **Data URL**: Base64 编码（仅适用于小文件）
- **StreamSaver.js**: 流式保存大文件
- **Native File System API**: Chrome 86+ 支持直接保存到文件系统

### 4.2 代码示例

```typescript
/**
 * 使用 Blob URL 下载（适用于中小文件）
 */
function downloadWithBlobURL(
  content: Blob | string,
  fileName: string,
  mimeType: string = 'application/octet-stream'
): void {
  const blob = typeof content === 'string'
    ? new Blob([content], { type: mimeType })
    : content;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 延迟释放 URL
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 从 URL 下载文件
 */
async function downloadFromURL(
  url: string,
  fileName: string,
  options?: {
    headers?: Record<string, string>;
    onProgress?: (loaded: number, total: number) => void;
  }
): Promise<void> {
  const response = await fetch(url, {
    headers: options?.headers,
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }

  const total = parseInt(response.headers.get('Content-Length') || '0');
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error('ReadableStream not supported');
  }

  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    loaded += value.length;
    options?.onProgress?.(loaded, total);
  }

  // 合并 chunks
  const blob = new Blob(chunks);
  downloadWithBlobURL(blob, fileName);
}

/**
 * 流式下载大文件（使用 StreamSaver.js 概念）
 * 注意：需要安装 streamsaver 包
 */
interface StreamDownloadOptions {
  url: string;
  fileName: string;
  headers?: Record<string, string>;
  onProgress?: (loaded: number) => void;
}

async function streamDownload(options: StreamDownloadOptions): Promise<void> {
  // 使用 Native File System API（如果可用）
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: options.fileName,
      });

      const writable = await handle.createWritable();
      const response = await fetch(options.url, { headers: options.headers });
      const reader = response.body?.getReader();

      if (!reader) throw new Error('No reader available');

      let loaded = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        await writable.write(value);
        loaded += value.length;
        options.onProgress?.(loaded);
      }

      await writable.close();
      return;
    } catch (error) {
      // 用户取消或 API 不支持，回退到传统方式
      console.warn('Native File System API failed, falling back');
    }
  }

  // 回退：使用 fetch + Blob
  await downloadFromURL(options.url, options.fileName, {
    headers: options.headers,
    onProgress: options.onProgress,
  });
}

/**
 * 生成并下载 CSV
 */
function downloadCSV(data: Record<string, unknown>[], fileName: string): void {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(data[0]);
  const escapeCSV = (value: unknown): string => {
    const str = String(value ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.join(','),
    ...data.map((row) => headers.map((h) => escapeCSV(row[h])).join(',')),
  ].join('\n');

  downloadWithBlobURL(csvContent, fileName, 'text/csv;charset=utf-8;');
}

/**
 * 生成并下载 JSON
 */
function downloadJSON(data: unknown, fileName: string, pretty: boolean = true): void {
  const jsonContent = pretty
    ? JSON.stringify(data, null, 2)
    : JSON.stringify(data);

  downloadWithBlobURL(jsonContent, fileName, 'application/json');
}
```

### 4.3 错误处理

```typescript
class DownloadError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly url?: string
  ) {
    super(message);
    this.name = 'DownloadError';
  }
}

/**
 * 安全的下载函数
 */
async function safeDownload(
  url: string,
  fileName: string,
  options?: {
    timeout?: number;
    maxSize?: number;
  }
): Promise<void> {
  const controller = new AbortController();
  const timeout = options?.timeout || 30000;

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new DownloadError(
        `HTTP error: ${response.status}`,
        'HTTP_ERROR',
        url
      );
    }

    // 检查文件大小
    const contentLength = parseInt(response.headers.get('Content-Length') || '0');
    if (options?.maxSize && contentLength > options.maxSize) {
      throw new DownloadError(
        `File size ${contentLength} exceeds limit ${options.maxSize}`,
        'SIZE_EXCEEDED',
        url
      );
    }

    const blob = await response.blob();
    downloadWithBlobURL(blob, fileName);

  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof DownloadError) {
      throw error;
    }

    if ((error as Error).name === 'AbortError') {
      throw new DownloadError('Download timeout', 'TIMEOUT', url);
    }

    throw new DownloadError(
      `Download failed: ${(error as Error).message}`,
      'UNKNOWN_ERROR',
      url
    );
  }
}
```

### 4.4 性能考虑

| 文件大小 | 推荐方案 | 说明 |
|----------|----------|------|
| < 10MB | Blob URL | 简单高效 |
| 10MB - 500MB | Stream + Native File System API | 避免内存溢出 |
| > 500MB | StreamSaver.js / 分片下载 | 需要专门处理 |

---

## 5. 压缩和解压

### 5.1 API 说明

- **pako**: 高性能的 zlib 压缩库
- **fflate**: 更现代的压缩库，支持流式处理
- **JSZip**: ZIP 文件创建和读取
- **Node.js zlib**: Node.js 内置压缩模块

### 5.2 代码示例

```typescript
// 浏览器端压缩（使用 pako）
import pako from 'pako';

/**
 * Gzip 压缩字符串
 */
function gzipCompress(data: string): Uint8Array {
  const input = new TextEncoder().encode(data);
  return pako.gzip(input);
}

/**
 * Gzip 解压
 */
function gzipDecompress(compressed: Uint8Array): string {
  const output = pako.ungzip(compressed);
  return new TextDecoder().decode(output);
}

/**
 * Deflate 压缩
 */
function deflateCompress(data: string): Uint8Array {
  const input = new TextEncoder().encode(data);
  return pako.deflate(input, { level: 9 }); // 最高压缩级别
}

/**
 * 使用 JSZip 创建 ZIP 文件
 */
import JSZip from 'jszip';

interface ZipEntry {
  path: string;
  content: string | Blob | Uint8Array;
}

async function createZip(files: ZipEntry[]): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.path, file.content);
  }

  return zip.generateAsync({ type: 'blob' });
}

/**
 * 解压 ZIP 文件
 */
async function extractZip(zipBlob: Blob): Promise<Map<string, Uint8Array>> {
  const zip = await JSZip.loadAsync(zipBlob);
  const result = new Map<string, Uint8Array>();

  for (const [path, file] of Object.entries(zip.files)) {
    if (!file.dir) {
      const content = await file.async('uint8array');
      result.set(path, content);
    }
  }

  return result;
}

// Node.js 端压缩
import { promisify } from 'util';
import { gzip, gunzip, deflate, inflate, createGzip, createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

/**
 * Node.js Gzip 压缩
 */
async function nodeGzipCompress(data: string | Buffer): Promise<Buffer> {
  const input = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8');
  return gzipAsync(input);
}

/**
 * Node.js Gzip 解压
 */
async function nodeGzipDecompress(compressed: Buffer): Promise<string> {
  const result = await gunzipAsync(compressed);
  return result.toString('utf-8');
}

/**
 * 流式 Gzip 压缩文件
 */
async function gzipFile(inputPath: string, outputPath: string): Promise<void> {
  const source = createReadStream(inputPath);
  const gzip = createGzip();
  const dest = createWriteStream(outputPath);

  await pipeline(source, gzip, dest);
}

/**
 * 流式 Gzip 解压文件
 */
async function gunzipFile(inputPath: string, outputPath: string): Promise<void> {
  const source = createReadStream(inputPath);
  const gunzip = createGunzip();
  const dest = createWriteStream(outputPath);

  await pipeline(source, gunzip, dest);
}
```

### 5.3 错误处理

```typescript
class CompressionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'CompressionError';
  }
}

async function safeCompress(data: string): Promise<Uint8Array> {
  try {
    return gzipCompress(data);
  } catch (error) {
    throw new CompressionError(
      `Compression failed: ${(error as Error).message}`,
      'COMPRESS_ERROR',
      error as Error
    );
  }
}

async function safeDecompress(data: Uint8Array): Promise<string> {
  try {
    return gzipDecompress(data);
  } catch (error) {
    throw new CompressionError(
      `Data is not valid compressed format: ${(error as Error).message}`,
      'DECOMPRESS_ERROR',
      error as Error
    );
  }
}
```

### 5.4 性能考虑

```typescript
/**
 * 压缩优化建议：
 *
 * 1. 压缩级别选择：
 *    - 1-3: 快速压缩，适合实时场景
 *    - 6: 平衡（默认）
 *    - 9: 最大压缩，适合存储
 *
 * 2. 大文件使用流式处理
 * 3. 避免重复压缩已压缩的数据（如图片、视频）
 */

// 检测是否已压缩
function isLikelyCompressed(data: Buffer): boolean {
  // Gzip 魔数: 0x1f 0x8b
  if (data[0] === 0x1f && data[1] === 0x8b) return true;

  // Zlib 魔数
  if (data[0] === 0x78 && (data[1] === 0x9c || data[1] === 0xda)) return true;

  return false;
}
```

---

## 6. 图像处理基础

### 6.1 API 说明

- **Canvas API**: 浏览器内置 2D 图像处理
- **Sharp**: Node.js 高性能图像处理库
- **FileReader**: 读取本地图像

### 6.2 代码示例

```typescript
/**
 * Canvas 图像处理（浏览器端）
 */
interface ImageProcessOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1, 用于 JPEG
  type?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * 加载图像
 */
function loadImage(src: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;

    if (typeof src === 'string') {
      img.src = src;
    } else {
      img.src = URL.createObjectURL(src);
    }
  });
}

/**
 * 调整图像尺寸
 */
async function resizeImage(
  source: string | File | HTMLImageElement,
  options: ImageProcessOptions
): Promise<Blob> {
  const img = source instanceof HTMLImageElement
    ? source
    : await loadImage(source);

  let { width, height } = img;

  // 计算缩放后的尺寸
  if (options.maxWidth && width > options.maxWidth) {
    height = (height * options.maxWidth) / width;
    width = options.maxWidth;
  }

  if (options.maxHeight && height > options.maxHeight) {
    width = (width * options.maxHeight) / height;
    height = options.maxHeight;
  }

  // 创建 Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // 使用高质量缩放
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(img, 0, 0, width, height);

  // 转换为 Blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => b ? resolve(b) : reject(new Error('Canvas to Blob failed')),
      options.type || 'image/jpeg',
      options.quality
    );
  });

  // 清理
  if (typeof source !== 'string' && !(source instanceof HTMLImageElement)) {
    URL.revokeObjectURL(img.src);
  }

  return blob;
}

/**
 * 图像裁剪
 */
async function cropImage(
  source: string | File,
  cropArea: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const img = await loadImage(source);

  const canvas = document.createElement('canvas');
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.drawImage(
    img,
    cropArea.x, cropArea.y, cropArea.width, cropArea.height,
    0, 0, cropArea.width, cropArea.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => b ? resolve(b) : reject(new Error('Crop failed')),
      'image/png'
    );
  });
}

/**
 * 图像旋转
 */
async function rotateImage(
  source: string | File,
  degrees: 90 | 180 | 270
): Promise<Blob> {
  const img = await loadImage(source);

  const canvas = document.createElement('canvas');

  if (degrees === 180) {
    canvas.width = img.width;
    canvas.height = img.height;
  } else {
    canvas.width = img.height;
    canvas.height = img.width;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => b ? resolve(b) : reject(new Error('Rotate failed')),
      'image/png'
    );
  });
}

// Node.js 端使用 Sharp
import sharp from 'sharp';

/**
 * Sharp 图像处理
 */
async function sharpResize(
  inputPath: string,
  outputPath: string,
  options: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    quality?: number;
  }
): Promise<void> {
  await sharp(inputPath)
    .resize(options.width, options.height, { fit: options.fit || 'cover' })
    .jpeg({ quality: options.quality || 80 })
    .toFile(outputPath);
}

/**
 * Sharp 批量处理
 */
async function batchProcessImages(
  inputPaths: string[],
  outputDir: string,
  options: {
    width: number;
    height: number;
    format: 'jpeg' | 'png' | 'webp';
  }
): Promise<void> {
  await Promise.all(
    inputPaths.map(async (inputPath) => {
      const fileName = path.basename(inputPath, path.extname(inputPath));
      const outputPath = path.join(outputDir, `${fileName}.${options.format}`);

      await sharp(inputPath)
        .resize(options.width, options.height, { fit: 'cover' })
        .toFormat(options.format)
        .toFile(outputPath);
    })
  );
}
```

### 6.3 错误处理

```typescript
class ImageProcessingError extends Error {
  constructor(
    message: string,
    public readonly code: 'LOAD_ERROR' | 'PROCESS_ERROR' | 'UNSUPPORTED_FORMAT'
  ) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

async function safeResizeImage(
  source: string | File,
  options: ImageProcessOptions
): Promise<Blob> {
  try {
    return await resizeImage(source, options);
  } catch (error) {
    if (error instanceof ImageProcessingError) {
      throw error;
    }
    throw new ImageProcessingError(
      `Image processing failed: ${(error as Error).message}`,
      'PROCESS_ERROR'
    );
  }
}
```

### 6.4 性能考虑

| 场景 | 推荐方案 | 说明 |
|------|----------|------|
| 浏览器端简单处理 | Canvas API | 无需额外依赖 |
| 浏览器端批量处理 | Web Workers + Canvas | 避免阻塞主线程 |
| Node.js 服务端 | Sharp | 性能极佳，支持多种格式 |
| 图像格式转换 | Sharp / Canvas | WebP 通常比 JPEG 小 25-35% |

---

## 7. CSV/JSON/Excel 文件处理

### 7.1 API 说明

- **CSV**: 纯文本解析，可使用 PapaParse 库
- **JSON**: JavaScript 原生支持
- **Excel**: 使用 xlsx 库（SheetJS）

### 7.2 代码示例

```typescript
// CSV 处理（使用 PapaParse）
import Papa from 'papaparse';

interface CSVParseOptions {
  header?: boolean;
  delimiter?: string;
  encoding?: string;
  skipEmptyLines?: boolean;
}

/**
 * 解析 CSV 字符串
 */
function parseCSV<T = Record<string, string>>(
  csvString: string,
  options: CSVParseOptions = {}
): T[] {
  const result = Papa.parse<T>(csvString, {
    header: options.header !== false,
    delimiter: options.delimiter,
    encoding: options.encoding,
    skipEmptyLines: options.skipEmptyLines ?? true,
  });

  if (result.errors.length > 0) {
    console.warn('CSV parsing errors:', result.errors);
  }

  return result.data;
}

/**
 * 生成 CSV 字符串
 */
function generateCSV<T extends Record<string, unknown>>(
  data: T[],
  options?: { headers?: string[] }
): string {
  return Papa.unparse(data, {
    columns: options?.headers,
  });
}

/**
 * 流式解析 CSV 文件（大文件）
 */
function parseCSVStream<T>(
  file: File,
  onChunk: (results: T[]) => void,
  options: CSVParseOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(file, {
      header: options.header !== false,
      delimiter: options.delimiter,
      encoding: options.encoding,
      skipEmptyLines: options.skipEmptyLines ?? true,
      step: (results) => {
        onChunk([results.data as T]);
      },
      complete: () => resolve(),
      error: reject,
    });
  });
}

// Excel 处理
import * as XLSX from 'xlsx';

/**
 * 读取 Excel 文件
 */
async function readExcel(
  file: File | Buffer
): Promise<Record<string, unknown>[]> {
  const data = file instanceof File
    ? await file.arrayBuffer()
    : file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);

  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

  return XLSX.utils.sheet_to_json(firstSheet);
}

/**
 * 读取多工作表 Excel
 */
async function readExcelMultiSheet(
  file: File | Buffer
): Promise<Map<string, Record<string, unknown>[]>> {
  const data = file instanceof File
    ? await file.arrayBuffer()
    : file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);

  const workbook = XLSX.read(data, { type: 'array' });
  const result = new Map<string, Record<string, unknown>[]>();

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    result.set(sheetName, XLSX.utils.sheet_to_json(sheet));
  }

  return result;
}

/**
 * 生成 Excel 文件
 */
function createExcel(
  data: Map<string, Record<string, unknown>[]> | Record<string, unknown>[],
  sheetName: string = 'Sheet1'
): Buffer {
  const workbook = XLSX.utils.book_new();

  if (data instanceof Map) {
    for (const [name, sheetData] of data.entries()) {
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, name);
    }
  } else {
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

// JSON 处理工具
/**
 * 安全的 JSON 解析
 */
function safeJSONParse<T>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * 格式化 JSON（带缩进）
 */
function formatJSON(data: unknown, indent: number = 2): string {
  return JSON.stringify(data, null, indent);
}

/**
 * 验证 JSON Schema（简单实现）
 */
interface JSONSchema {
  type: string;
  required?: string[];
  properties?: Record<string, JSONSchema>;
}

function validateJSON(data: unknown, schema: JSONSchema): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (schema.type === 'object' && typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;

    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in obj)) {
          errors.push(`Missing required field: ${key}`);
        }
      }
    }

    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in obj) {
          const result = validateJSON(obj[key], propSchema);
          errors.push(...result.errors);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
```

### 7.3 错误处理

```typescript
class DataFormatError extends Error {
  constructor(
    message: string,
    public readonly format: 'CSV' | 'JSON' | 'EXCEL',
    public readonly line?: number
  ) {
    super(message);
    this.name = 'DataFormatError';
  }
}

/**
 * 安全的 CSV 解析
 */
function safeParseCSV<T>(csvString: string): { data: T[]; errors: string[] } {
  const errors: string[] = [];

  const result = Papa.parse<T>(csvString, {
    header: true,
    skipEmptyLines: true,
    error: (err) => {
      errors.push(`Row ${err.row}: ${err.message}`);
    },
  });

  return { data: result.data, errors };
}
```

### 7.4 性能考虑

```typescript
/**
 * 大数据处理建议：
 *
 * 1. CSV > 10MB: 使用流式解析
 * 2. Excel > 5MB: 考虑转换为 CSV 或使用专门的流式库
 * 3. JSON 过大: 使用 JSONStream 或分块解析
 */

// Node.js 流式 JSON 处理
import JSONStream from 'JSONStream';
import { createReadStream } from 'fs';

async function* streamJSONArray(filePath: string): AsyncGenerator<unknown> {
  const stream = createReadStream(filePath);
  const parser = JSONStream.parse('*');

  stream.pipe(parser);

  for await (const data of parser) {
    yield data;
  }
}
```

---

## 8. 大文件分片处理

### 8.1 API 说明

大文件处理的核心是**分片**和**流式处理**：

- **分片**: 将大文件切分成小块处理
- **流式处理**: 一次只处理一小部分数据
- **索引/元数据**: 记录分片信息用于重组

### 8.2 代码示例

```typescript
/**
 * 分片元数据
 */
interface ChunkMetadata {
  fileId: string;
  fileName: string;
  fileSize: number;
  chunkSize: number;
  totalChunks: number;
  chunks: Array<{
    index: number;
    hash: string;
    size: number;
  }>;
}

/**
 * 计算分片哈希（用于校验）
 */
async function calculateChunkHash(chunk: Blob): Promise<string> {
  const buffer = await chunk.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 创建分片元数据
 */
async function createChunkMetadata(
  file: File,
  chunkSize: number = 5 * 1024 * 1024 // 5MB
): Promise<ChunkMetadata> {
  const totalChunks = Math.ceil(file.size / chunkSize);
  const fileId = `${file.name}-${file.size}-${file.lastModified}`;

  const chunks = await Promise.all(
    Array.from({ length: totalChunks }, async (_, i) => {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      return {
        index: i,
        hash: await calculateChunkHash(chunk),
        size: end - start,
      };
    })
  );

  return {
    fileId,
    fileName: file.name,
    fileSize: file.size,
    chunkSize,
    totalChunks,
    chunks,
  };
}

/**
 * 并行处理分片
 */
async function processChunksParallel<T>(
  chunks: Blob[],
  processor: (chunk: Blob, index: number) => Promise<T>,
  options: { concurrency?: number; onProgress?: (processed: number) => void } = {}
): Promise<T[]> {
  const concurrency = options.concurrency || 3;
  const results: T[] = new Array(chunks.length);
  const queue: Array<{ index: number; promise: Promise<void> }> = [];

  let processed = 0;

  const processChunk = async (chunk: Blob, index: number): Promise<void> => {
    results[index] = await processor(chunk, index);
    processed++;
    options.onProgress?.(processed);
  };

  for (let i = 0; i < chunks.length; i++) {
    const promise = processChunk(chunks[i], i);
    queue.push({ index: i, promise });

    if (queue.length >= concurrency) {
      await Promise.race(queue.map((q) => q.promise));
      queue.shift();
    }
  }

  await Promise.all(queue.map((q) => q.promise));

  return results;
}

// Node.js 大文件处理
import { createReadStream, createWriteStream } from 'fs';
import { createHash } from 'crypto';
import * as readline from 'readline';

/**
 * 流式处理大文件（按行）
 */
async function processLargeFileByLine(
  filePath: string,
  processor: (line: string, lineNumber: number) => Promise<void>
): Promise<void> {
  const fileStream = createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineNumber = 0;

  for await (const line of rl) {
    lineNumber++;
    await processor(line, lineNumber);
  }
}

/**
 * 大文件分块复制（带进度）
 */
async function copyLargeFile(
  sourcePath: string,
  destPath: string,
  options: { onProgress?: (copied: number, total: number) => void } = {}
): Promise<void> {
  const stats = await fs.stat(sourcePath);
  const total = stats.size;

  const source = createReadStream(sourcePath);
  const dest = createWriteStream(destPath);

  let copied = 0;

  source.on('data', (chunk: Buffer) => {
    copied += chunk.length;
    options.onProgress?.(copied, total);
  });

  await pipeline(source, dest);
}

/**
 * 分片合并
 */
async function mergeChunks(
  chunkPaths: string[],
  outputPath: string
): Promise<void> {
  const output = createWriteStream(outputPath);

  for (const chunkPath of chunkPaths) {
    const input = createReadStream(chunkPath);
    await pipeline(input, output, { end: false });
  }

  output.end();
}
```

### 8.3 错误处理

```typescript
class ChunkProcessingError extends Error {
  constructor(
    message: string,
    public readonly chunkIndex: number,
    public readonly code: 'HASH_MISMATCH' | 'READ_ERROR' | 'WRITE_ERROR'
  ) {
    super(message);
    this.name = 'ChunkProcessingError';
  }
}

/**
 * 带校验的分片处理
 */
async function processChunkWithVerification(
  chunk: Blob,
  index: number,
  expectedHash: string,
  processor: (chunk: Blob) => Promise<void>
): Promise<void> {
  // 校验哈希
  const actualHash = await calculateChunkHash(chunk);
  if (actualHash !== expectedHash) {
    throw new ChunkProcessingError(
      `Hash mismatch for chunk ${index}`,
      index,
      'HASH_MISMATCH'
    );
  }

  try {
    await processor(chunk);
  } catch (error) {
    throw new ChunkProcessingError(
      `Processing failed: ${(error as Error).message}`,
      index,
      'WRITE_ERROR'
    );
  }
}
```

### 8.4 性能考虑

```typescript
/**
 * 大文件处理优化：
 *
 * 1. 分片大小：
 *    - 网络传输: 2-5MB
 *    - 本地处理: 10-50MB
 *
 * 2. 并发控制：
 *    - 网络上传: 3-4 并发
 *    - 本地处理: 根据 CPU 核心数
 *
 * 3. 内存管理：
 *    - 避免同时加载所有分片
 *    - 使用流式处理代替 Buffer
 */

/**
 * 基于可用内存计算最佳分片大小
 */
function calculateOptimalChunkSize(): number {
  // 浏览器环境
  if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
    const memoryGB = (navigator as any).deviceMemory || 4;
    // 使用可用内存的 1% 作为分片大小，最小 1MB，最大 10MB
    return Math.min(Math.max(memoryGB * 1024 * 1024 * 0.01, 1024 * 1024), 10 * 1024 * 1024);
  }

  // Node.js 环境
  if (typeof process !== 'undefined') {
    const totalMemory = require('os').totalmem();
    return Math.min(Math.max(totalMemory * 0.001, 1024 * 1024), 50 * 1024 * 1024);
  }

  return 5 * 1024 * 1024; // 默认 5MB
}
```

---

## 9. 文件系统监控

### 9.1 API 说明

文件系统监控主要使用 **chokidar** 库：

- 跨平台支持（Windows、macOS、Linux）
- 解决原生 `fs.watch` 的不一致性问题
- 支持递归监控、防抖、过滤等功能

### 9.2 代码示例

```typescript
import chokidar, { FSWatcher } from 'chokidar';

/**
 * 监控配置选项
 */
interface WatchOptions {
  ignored?: (string | RegExp)[];
  persistent?: boolean;
  ignoreInitial?: boolean;
  followSymlinks?: boolean;
  cwd?: string;
  disableGlobbing?: boolean;
  usePolling?: boolean;
  interval?: number;
  binaryInterval?: number;
  alwaysStat?: boolean;
  depth?: number;
  awaitWriteFinish?: boolean | { stabilityThreshold?: number; pollInterval?: number };
}

/**
 * 文件变更事件
 */
type FileEvent = 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';

interface FileChangeInfo {
  event: FileEvent;
  path: string;
  stats?: {
    size: number;
    mtime: Date;
    ctime: Date;
  };
}

/**
 * 创建文件监控器
 */
function createWatcher(
  paths: string | string[],
  options: WatchOptions = {}
): FSWatcher {
  const defaultOptions: WatchOptions = {
    ignored: [
      /(^|[\/\\])\../,  // 隐藏文件
      'node_modules',
      '.git',
      'dist',
      'build',
    ],
    persistent: true,
    ignoreInitial: true,
    followSymlinks: false,
    cwd: process.cwd(),
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
    ...options,
  };

  return chokidar.watch(paths, defaultOptions);
}

/**
 * 监控文件变更
 */
function watchFiles(
  paths: string | string[],
  handler: (change: FileChangeInfo) => void | Promise<void>,
  options: WatchOptions = {}
): FSWatcher {
  const watcher = createWatcher(paths, options);

  watcher
    .on('add', (path, stats) => {
      handler({ event: 'add', path, stats });
    })
    .on('change', (path, stats) => {
      handler({ event: 'change', path, stats });
    })
    .on('unlink', (path) => {
      handler({ event: 'unlink', path });
    })
    .on('addDir', (path) => {
      handler({ event: 'addDir', path });
    })
    .on('unlinkDir', (path) => {
      handler({ event: 'unlinkDir', path });
    })
    .on('error', (error) => {
      console.error('Watcher error:', error);
    })
    .on('ready', () => {
      console.log('Initial scan complete. Ready for changes');
    });

  return watcher;
}

/**
 * 防抖的文件变更处理
 */
function createDebouncedWatcher(
  paths: string | string[],
  handler: (changes: FileChangeInfo[]) => void | Promise<void>,
  options: WatchOptions & { debounceMs?: number } = {}
): FSWatcher {
  const { debounceMs = 300, ...watchOptions } = options;
  const pendingChanges = new Map<string, FileChangeInfo>();
  let debounceTimer: NodeJS.Timeout | null = null;

  const flushChanges = () => {
    if (pendingChanges.size > 0) {
      handler(Array.from(pendingChanges.values()));
      pendingChanges.clear();
    }
    debounceTimer = null;
  };

  return watchFiles(paths, (change) => {
    pendingChanges.set(change.path, change);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(flushChanges, debounceMs);
  }, watchOptions);
}

/**
 * 自动重新加载配置文件的示例
 */
async function watchConfigFile(
  configPath: string,
  loader: (path: string) => Promise<unknown>
): Promise<{ stop: () => Promise<void>; getConfig: () => unknown }> {
  let currentConfig = await loader(configPath);
  let reloadCount = 0;

  const watcher = watchFiles(configPath, async (change) => {
    if (change.event === 'change') {
      try {
        const newConfig = await loader(configPath);
        currentConfig = newConfig;
        reloadCount++;
        console.log(`Config reloaded (version ${reloadCount})`);
      } catch (error) {
        console.error('Failed to reload config:', error);
      }
    }
  });

  return {
    stop: () => watcher.close(),
    getConfig: () => currentConfig,
  };
}

/**
 * 监控并同步两个目录
 */
async function watchAndSync(
  sourceDir: string,
  targetDir: string,
  options: { interval?: number } = {}
): Promise<FSWatcher> {
  const syncFile = async (filePath: string): Promise<void> => {
    const relativePath = path.relative(sourceDir, filePath);
    const targetPath = path.join(targetDir, relativePath);

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(filePath, targetPath);
    console.log(`Synced: ${relativePath}`);
  };

  const removeFile = async (filePath: string): Promise<void> => {
    const relativePath = path.relative(sourceDir, filePath);
    const targetPath = path.join(targetDir, relativePath);

    try {
      await fs.unlink(targetPath);
      console.log(`Removed: ${relativePath}`);
    } catch {
      // 文件可能不存在，忽略错误
    }
  };

  return watchFiles(sourceDir, async (change) => {
    switch (change.event) {
      case 'add':
      case 'change':
        await syncFile(change.path);
        break;
      case 'unlink':
        await removeFile(change.path);
        break;
    }
  }, { ignoreInitial: false });
}
```

### 9.3 错误处理

```typescript
class WatcherError extends Error {
  constructor(
    message: string,
    public readonly code: 'INIT_ERROR' | 'WATCH_ERROR' | 'HANDLER_ERROR'
  ) {
    super(message);
    this.name = 'WatcherError';
  }
}

/**
 * 安全的文件监控
 */
function safeWatchFiles(
  paths: string | string[],
  handler: (change: FileChangeInfo) => Promise<void>,
  options: WatchOptions = {}
): FSWatcher {
  const wrappedHandler = async (change: FileChangeInfo): Promise<void> => {
    try {
      await handler(change);
    } catch (error) {
      console.error(`Error handling ${change.event} on ${change.path}:`, error);
      // 不抛出错误，保持监控器运行
    }
  };

  try {
    return watchFiles(paths, wrappedHandler, options);
  } catch (error) {
    throw new WatcherError(
      `Failed to initialize watcher: ${(error as Error).message}`,
      'INIT_ERROR'
    );
  }
}
```

### 9.4 性能考虑

```typescript
/**
 * 文件监控性能优化：
 *
 * 1. 忽略模式：
 *    - 忽略 node_modules、.git 等
 *    - 忽略日志文件、临时文件
 *
 * 2. 轮询 vs 原生：
 *    - 默认使用原生（更快）
 *    - NFS 或 Docker 中使用轮询
 *
 * 3. 防抖处理：
 *    - 批量处理变更
 *    - 避免频繁触发
 */

// 不同场景的配置建议
const watchConfigs = {
  // 开发环境（源码监控）
  development: {
    ignored: ['node_modules', 'dist', 'build', '.git', '*.log'],
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 100 },
  },

  // 生产环境（配置文件监控）
  production: {
    ignored: ['node_modules', '.git'],
    ignoreInitial: false,
    awaitWriteFinish: { stabilityThreshold: 1000 },
  },

  // Docker/NFS 环境
  docker: {
    usePolling: true,
    interval: 1000,
    binaryInterval: 2000,
  },
};
```

---

## 10. 跨平台路径处理

### 10.1 API 说明

Node.js `path` 模块提供跨平台路径处理：

- **path.join()**: 拼接路径（使用平台特定分隔符）
- **path.resolve()**: 解析为绝对路径
- **path.normalize()**: 规范化路径
- **path.sep**: 平台特定分隔符（Windows `\`，Unix `/`）

### 10.2 代码示例

```typescript
import * as path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

/**
 * 跨平台路径拼接
 */
function joinPaths(...segments: string[]): string {
  return path.join(...segments);
}

/**
 * 解析为绝对路径
 */
function resolvePath(...paths: string[]): string {
  return path.resolve(...paths);
}

/**
 * 获取文件扩展名
 */
function getExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}

/**
 * 获取文件名（不含扩展名）
 */
function getBaseName(filePath: string, ext?: string): string {
  return path.basename(filePath, ext);
}

/**
 * 获取目录名
 */
function getDirName(filePath: string): string {
  return path.dirname(filePath);
}

/**
 * 规范化路径
 */
function normalizePath(filePath: string): string {
  return path.normalize(filePath);
}

/**
 * 路径标准化（统一使用正斜杠）
 * 适用于配置存储、日志等
 */
function toUnixPath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * 判断是否为绝对路径
 */
function isAbsolute(filePath: string): boolean {
  return path.isAbsolute(filePath);
}

/**
 * 计算相对路径
 */
function getRelativePath(from: string, to: string): string {
  return path.relative(from, to);
}

/**
 * 解析路径为各部分
 */
interface ParsedPath {
  root: string;
  dir: string;
  base: string;
  ext: string;
  name: string;
}

function parsePath(filePath: string): ParsedPath {
  return path.parse(filePath);
}

/**
 * 格式化路径各部分
 */
function formatPath(parsed: ParsedPath): string {
  return path.format(parsed);
}

/**
 * 路径与文件 URL 转换
 */
function pathToURL(filePath: string): URL {
  return pathToFileURL(filePath);
}

function urlToPath(url: string | URL): string {
  return fileURLToPath(url);
}

/**
 * 安全的文件名（移除危险字符）
 */
function sanitizeFileName(fileName: string): string {
  // 移除或替换 Windows/Unix 不允许的字符
  return fileName
    .replace(/[<>:"|?*]/g, '_')  // Windows 不允许的字符
    .replace(/[\x00-\x1f]/g, '')  // 控制字符
    .replace(/\.{2,}/g, '.')      // 多个点
    .trim()                       // 首尾空格
    .slice(0, 255);               // 限制长度
}

/**
 * 添加序号生成唯一文件名
 */
async function generateUniquePath(
  basePath: string,
  ext: string,
  exists: (p: string) => Promise<boolean>
): Promise<string> {
  let counter = 0;
  let filePath = `${basePath}${ext}`;

  while (await exists(filePath)) {
    counter++;
    filePath = `${basePath}_${counter}${ext}`;
  }

  return filePath;
}

/**
 * 路径工具类
 */
class PathUtils {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  resolve(...segments: string[]): string {
    return path.resolve(this.cwd, ...segments);
  }

  relative(fullPath: string): string {
    return path.relative(this.cwd, fullPath);
  }

  // 模板路径解析（支持 {date}, {name} 等占位符）
  resolveTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), sanitizeFileName(value));
    }
    return this.resolve(result);
  }
}

/**
 * Glob 模式匹配（使用 fast-glob）
 */
import glob from 'fast-glob';

interface GlobOptions {
  cwd?: string;
  absolute?: boolean;
  onlyFiles?: boolean;
  onlyDirectories?: boolean;
  ignore?: string[];
  dot?: boolean;
}

async function findFiles(patterns: string | string[], options: GlobOptions = {}): Promise<string[]> {
  return glob(patterns, {
    cwd: options.cwd || process.cwd(),
    absolute: options.absolute ?? true,
    onlyFiles: options.onlyFiles ?? true,
    onlyDirectories: options.onlyDirectories ?? false,
    ignore: options.ignore || ['node_modules/**', '.git/**'],
    dot: options.dot ?? false,
  });
}
```

### 10.3 错误处理

```typescript
class PathError extends Error {
  constructor(
    message: string,
    public readonly code: 'INVALID_PATH' | 'PATH_TOO_LONG' | 'TRAVERSAL_ATTEMPT',
    public readonly path: string
  ) {
    super(message);
    this.name = 'PathError';
  }
}

/**
 * 路径遍历防护
 */
function safeJoin(basePath: string, userInput: string): string {
  // 规范化并解析为绝对路径
  const resolved = path.resolve(basePath, userInput);

  // 确保解析后的路径仍在 basePath 内
  if (!resolved.startsWith(path.resolve(basePath))) {
    throw new PathError(
      'Path traversal attempt detected',
      'TRAVERSAL_ATTEMPT',
      userInput
    );
  }

  return resolved;
}

/**
 * 验证路径长度
 */
function validatePathLength(filePath: string, maxLength: number = 260): void {
  if (filePath.length > maxLength) {
    throw new PathError(
      `Path length ${filePath.length} exceeds maximum ${maxLength}`,
      'PATH_TOO_LONG',
      filePath
    );
  }
}
```

### 10.4 性能考虑

```typescript
/**
 * 路径处理优化：
 *
 * 1. 避免重复解析：
 *    - 缓存解析结果
 *    - 批量处理时预解析
 *
 * 2. 平台检测：
 *    - 运行时检测而非条件编译
 *    - 使用 path.sep 和 path.delimiter
 */

// 平台常量
const isWindows = process.platform === 'win32';
const pathSeparator = path.sep;
const pathDelimiter = path.delimiter; // Windows ; Unix :

/**
 * 路径缓存
 */
class PathCache {
  private cache = new Map<string, ParsedPath>();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  parse(filePath: string): ParsedPath {
    const normalized = normalizePath(filePath);

    if (this.cache.has(normalized)) {
      return this.cache.get(normalized)!;
    }

    const parsed = path.parse(normalized);

    // LRU 简单实现
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(normalized, parsed);
    return parsed;
  }

  clear(): void {
    this.cache.clear();
  }
}
```

---

## 附录：完整类型定义

```typescript
// 统一导出所有类型
export type {
  FileInfo,
  FileMetadata,
  UploadOptions,
  UploadProgressCallback,
  ResumableUploadOptions,
  ChunkInfo,
  ImageProcessOptions,
  CSVParseOptions,
  ChunkMetadata,
  FileChangeInfo,
  WatchOptions,
  GlobOptions,
  ParsedPath,
};

// 统一导出所有错误类
export {
  FileHandlerError,
  NodeFileError,
  UploadError,
  DownloadError,
  CompressionError,
  ImageProcessingError,
  DataFormatError,
  ChunkProcessingError,
  WatcherError,
  PathError,
};
```

---

## 总结

本文档涵盖了 JavaScript/TypeScript 文件处理的完整技术栈：

| 场景 | 推荐技术 | 关键库 |
|------|----------|--------|
| 浏览器文件读取 | File API + FileReader | 原生 API |
| Node.js 文件操作 | fs/promises + Stream | 原生模块 |
| 文件上传 | XMLHttpRequest / Fetch | 原生 API |
| 压缩解压 | pako / fflate | npm |
| 图像处理 | Canvas / Sharp | sharp (Node) |
| Excel 处理 | xlsx (SheetJS) | xlsx |
| 文件监控 | chokidar | chokidar |
| 路径处理 | path 模块 | 原生模块 |

建议根据具体场景选择合适的技术方案，并始终关注错误处理和性能优化。
