/**
 * @file ES2022 Error Cause
 * @category ECMAScript Evolution → ES2022
 * @difficulty easy
 * @tags es2022, error, cause, error-chain
 */

// ============================================================================
// 1. 基础用法
// ============================================================================

function readFile(path: string): string {
  try {
    // 模拟文件读取
    throw new Error('File not found');
  } catch (error) {
    // 抛出新错误，保留原始错误
    throw new Error(`Failed to read ${path}`, { cause: error });
  }
}

// ============================================================================
// 2. 错误链
// ============================================================================

function fetchUserData(userId: string): Promise<unknown> {
  return fetch(`/api/users/${userId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      throw new Error(`Failed to fetch user ${userId}`, { cause: error });
    });
}

function processUserData(userId: string): Promise<void> {
  return fetchUserData(userId)
    .then(data => {
      // 处理数据
      console.log(data);
    })
    .catch(error => {
      throw new Error(`Failed to process user data`, { cause: error });
    });
}

// ============================================================================
// 3. 自定义错误类
// ============================================================================

class NetworkError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'NetworkError';
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    options?: { cause?: unknown }
  ) {
    super(message, options);
    this.name = 'ValidationError';
  }
}

class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    options?: { cause?: unknown }
  ) {
    super(message, options);
    this.name = 'ApplicationError';
  }
}

// ============================================================================
// 4. 错误处理模式
// ============================================================================

async function complexOperation(): Promise<void> {
  try {
    await step1();
    await step2();
    await step3();
  } catch (error) {
    throw new Error('Complex operation failed', { cause: error });
  }
}

async function step1(): Promise<void> {
  try {
    // 一些操作
  } catch (error) {
    throw new Error('Step 1 failed', { cause: error });
  }
}

async function step2(): Promise<void> {
  try {
    // 一些操作
  } catch (error) {
    throw new Error('Step 2 failed', { cause: error });
  }
}

async function step3(): Promise<void> {
  try {
    // 一些操作
  } catch (error) {
    throw new Error('Step 3 failed', { cause: error });
  }
}

// ============================================================================
// 5. 遍历错误链
// ============================================================================

function getErrorChain(error: Error): Error[] {
  const chain: Error[] = [error];
  let current: Error | undefined = error;

  while (current?.cause instanceof Error) {
    chain.push(current.cause);
    current = current.cause;
  }

  return chain;
}

function formatErrorChain(error: Error): string {
  const chain = getErrorChain(error);
  return chain
    .map((e, i) => `${'  '.repeat(i)}└─ ${e.name}: ${e.message}`)
    .join('\n');
}

// ============================================================================
// 6. 实际应用示例
// ============================================================================

class DatabaseConnectionError extends Error {
  constructor(message: string, public host: string, public port: number) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

class QueryExecutionError extends Error {
  constructor(message: string, public query: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'QueryExecutionError';
  }
}

async function executeQuery(query: string): Promise<unknown[]> {
  try {
    // 尝试连接数据库
    await connectToDatabase();
  } catch (error) {
    throw new QueryExecutionError(`Failed to execute query: ${query}`, query, {
      cause: error
    });
  }

  // 执行查询...
  return [];
}

async function connectToDatabase(): Promise<void> {
  throw new DatabaseConnectionError(
    'Connection refused',
    'localhost',
    5432
  );
}

// ============================================================================
// 7. 与 AggregateError 结合
// ============================================================================

async function fetchMultipleResources(urls: string[]): Promise<unknown[]> {
  const results = await Promise.allSettled(urls.map(url => fetch(url)));

  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map(r => r.reason);

  if (errors.length > 0) {
    throw new AggregateError(
      errors,
      `Failed to fetch ${errors.length} of ${urls.length} resources`
    );
  }

  return results
    .filter((r): r is PromiseFulfilledResult<Response> => r.status === 'fulfilled')
    .map(r => r.value);
}

// ============================================================================
// 导出
// ============================================================================

export {
  readFile,
  fetchUserData,
  processUserData,
  NetworkError,
  ValidationError,
  ApplicationError,
  complexOperation,
  getErrorChain,
  formatErrorChain,
  DatabaseConnectionError,
  QueryExecutionError,
  executeQuery,
  fetchMultipleResources
};
