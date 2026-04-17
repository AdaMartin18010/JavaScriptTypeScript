---
title: 'Node.js 设计模式指南'
---

# Node.js 设计模式指南

> 基于 Node.js + TypeScript 的设计模式实践指南

---

## 目录

- [Node.js 设计模式指南](#nodejs-设计模式指南)
  - [目录](#目录)
  - [1. 模块模式 (CommonJS/ESM)](#1-模块模式-commonjsesm)
    - [使用场景](#使用场景)
    - [代码示例](#代码示例)
      - [CommonJS 模式](#commonjs-模式)
      - [barrel 导出模式](#barrel-导出模式)
    - [最佳实践](#最佳实践)
    - [常见错误](#常见错误)
  - [2. 回调模式 (Error-first Callbacks)](#2-回调模式-error-first-callbacks)
    - [使用场景](#使用场景-1)
    - [代码示例](#代码示例-1)
      - [基础回调模式](#基础回调模式)
      - [回调地狱与解决方案](#回调地狱与解决方案)
    - [最佳实践](#最佳实践-1)
    - [常见错误](#常见错误-1)
  - [3. Promise 和 async/await 模式](#3-promise-和-asyncawait-模式)
    - [使用场景](#使用场景-2)
    - [代码示例](#代码示例-2)
      - [Promise 基础模式](#promise-基础模式)
      - [async/await 模式](#asyncawait-模式)
      - [重试模式](#重试模式)
      - [超时模式](#超时模式)
    - [最佳实践](#最佳实践-2)
    - [常见错误](#常见错误-2)
  - [4. 事件发射器模式](#4-事件发射器模式)
    - [使用场景](#使用场景-3)
    - [代码示例](#代码示例-3)
      - [基础事件发射器](#基础事件发射器)
      - [事件总线模式](#事件总线模式)
    - [最佳实践](#最佳实践-3)
    - [常见错误](#常见错误-3)
  - [5. 流 (Streams) 模式](#5-流-streams-模式)
    - [使用场景](#使用场景-4)
    - [代码示例](#代码示例-4)
      - [基础流模式](#基础流模式)
      - [可读流封装](#可读流封装)
      - [可写流封装](#可写流封装)
    - [最佳实践](#最佳实践-4)
    - [常见错误](#常见错误-4)
  - [6. 中间件模式 (Express/Koa)](#6-中间件模式-expresskoa)
    - [使用场景](#使用场景-5)
    - [代码示例](#代码示例-5)
      - [Express 中间件模式](#express-中间件模式)
      - [Koa 风格的中间件组合](#koa-风格的中间件组合)
    - [最佳实践](#最佳实践-5)
    - [常见错误](#常见错误-5)
  - [7. 依赖注入模式](#7-依赖注入模式)
    - [使用场景](#使用场景-6)
    - [代码示例](#代码示例-6)
      - [构造函数注入](#构造函数注入)
      - [属性注入（可选依赖）](#属性注入可选依赖)
      - [方法注入](#方法注入)
    - [最佳实践](#最佳实践-6)
    - [常见错误](#常见错误-6)
  - [8. 工厂和依赖容器](#8-工厂和依赖容器)
    - [使用场景](#使用场景-7)
    - [代码示例](#代码示例-7)
      - [工厂模式](#工厂模式)
      - [抽象工厂](#抽象工厂)
      - [依赖容器](#依赖容器)
    - [最佳实践](#最佳实践-7)
    - [常见错误](#常见错误-7)
  - [9. 观察者模式在 Node 中的应用](#9-观察者模式在-node-中的应用)
    - [使用场景](#使用场景-8)
    - [代码示例](#代码示例-8)
      - [基础观察者模式](#基础观察者模式)
      - [响应式编程风格](#响应式编程风格)
      - [Node.js EventEmitter 实现观察者](#nodejs-eventemitter-实现观察者)
    - [最佳实践](#最佳实践-8)
    - [常见错误](#常见错误-8)
  - [10. 连接池和缓存模式](#10-连接池和缓存模式)
    - [使用场景](#使用场景-9)
    - [代码示例](#代码示例-9)
      - [数据库连接池](#数据库连接池)
      - [通用连接池](#通用连接池)
      - [缓存模式](#缓存模式)
      - [缓存策略](#缓存策略)
    - [最佳实践](#最佳实践-9)
    - [常见错误](#常见错误-9)
  - [总结](#总结)

---

## 1. 模块模式 (CommonJS/ESM)

### 使用场景

- **代码组织**：将相关功能封装在独立模块中
- **依赖管理**：明确声明模块间的依赖关系
- **命名空间隔离**：避免全局变量污染
- **代码复用**：在不同项目中共享模块

### 代码示例

#### CommonJS 模式

```typescript
// mathUtils.ts - 模块定义
export interface MathOperation {
  execute(a: number, b: number): number;
}

export class AddOperation implements MathOperation {
  execute(a: number, b: number): number {
    return a + b;
  }
}

export class MultiplyOperation implements MathOperation {
  execute(a: number, b: number): number {
    return a * b;
  }
}

// 默认导出
export default class Calculator {
  private operations: Map<string, MathOperation> = new Map();

  register(name: string, operation: MathOperation): void {
    this.operations.set(name, operation);
  }

  calculate(name: string, a: number, b: number): number {
    const operation = this.operations.get(name);
    if (!operation) {
      throw new Error(`Operation '${name}' not found`);
    }
    return operation.execute(a, b);
  }
}

// 常量导出
export const PI = 3.14159;
export const E = 2.71828;
```

```typescript
// app.ts - 模块使用
import Calculator, {
  AddOperation,
  MultiplyOperation,
  PI,
  type MathOperation
} from './mathUtils';

const calc = new Calculator();
calc.register('add', new AddOperation());
calc.register('multiply', new MultiplyOperation());

console.log(calc.calculate('add', 5, 3));        // 8
console.log(calc.calculate('multiply', 4, 7));   // 28
console.log(PI);
```

#### barrel 导出模式

```typescript
// operations/index.ts
export { AddOperation } from './AddOperation';
export { MultiplyOperation } from './MultiplyOperation';
export { SubtractOperation } from './SubtractOperation';
export type { MathOperation } from './types';
```

```typescript
// 简化导入
import { AddOperation, MultiplyOperation, type MathOperation } from './operations';
```

### 最佳实践

1. **单一职责**：每个模块只负责一个功能领域
2. **显式导出**：明确使用 `export` 声明公共 API
3. **类型导出**：使用 `export type` 导出类型，避免循环依赖
4. **命名规范**：使用有意义的文件名，与模块功能对应

```typescript
// 推荐：清晰的模块结构
// services/UserService.ts
export interface IUserService {
  findById(id: string): Promise<User | null>;
  create(userData: CreateUserDTO): Promise<User>;
}

export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async create(userData: CreateUserDTO): Promise<User> {
    // 验证逻辑...
    return this.userRepository.create(userData);
  }
}
```

### 常见错误

```typescript
// 错误：循环依赖
// a.ts
import { b } from './b';
export const a = () => b();

// b.ts
import { a } from './a';
export const b = () => a();

// 解决方案：提取公共依赖到独立模块
// types.ts
export type SharedFunction = () => void;

// a.ts 和 b.ts 都从 types.ts 导入类型
```

```typescript
// 错误：副作用导入
import './config'; // 这会在导入时执行代码

// 推荐：显式初始化函数
import { initializeConfig } from './config';
initializeConfig();
```

---

## 2. 回调模式 (Error-first Callbacks)

### 使用场景

- **Node.js 核心 API**：fs、http、crypto 等模块
- **异步操作**：文件 I/O、网络请求、定时器
- **兼容性**：与遗留代码或第三方库集成

### 代码示例

#### 基础回调模式

```typescript
import fs from 'fs';
import path from 'path';

// Error-first callback 类型定义
type ErrorFirstCallback<T> = (err: Error | null, result?: T) => void;

// 读取文件的回调版本
function readFileCallback(
  filePath: string,
  callback: ErrorFirstCallback<string>
): void {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, data);
  });
}

// 使用示例
readFileCallback('./config.json', (err, data) => {
  if (err) {
    console.error('读取失败:', err.message);
    return;
  }
  console.log('文件内容:', data);
});
```

#### 回调地狱与解决方案

```typescript
// 回调地狱
fs.readFile('config.json', 'utf-8', (err, config) => {
  if (err) { handleError(err); return; }
  fs.readFile(config.inputFile, 'utf-8', (err, data) => {
    if (err) { handleError(err); return; }
    processData(data, (err, result) => {
      if (err) { handleError(err); return; }
      fs.writeFile(config.outputFile, result, (err) => {
        if (err) { handleError(err); return; }
        console.log('完成');
      });
    });
  });
});

// 使用命名函数拆分
function readConfig(callback: ErrorFirstCallback<Config>): void {
  fs.readFile('config.json', 'utf-8', callback);
}

function processFile(config: Config, callback: ErrorFirstCallback<string>): void {
  fs.readFile(config.inputFile, 'utf-8', (err, data) => {
    if (err) { callback(err); return; }
    processData(data, callback);
  });
}

function saveResult(config: Config, result: string, callback: ErrorFirstCallback<void>): void {
  fs.writeFile(config.outputFile, result, callback);
}

// 更清晰的流程
readConfig((err, config) => {
  if (err) { handleError(err); return; }
  processFile(config, (err, result) => {
    if (err) { handleError(err); return; }
    saveResult(config, result, (err) => {
      if (err) { handleError(err); return; }
      console.log('完成');
    });
  });
});
```

### 最佳实践

1. **始终检查错误**：第一个参数必须检查
2. **尽早返回**：错误处理后立即 return
3. **类型安全**：使用 TypeScript 定义回调类型
4. **统一错误格式**：创建自定义错误类

```typescript
// 自定义错误类
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 使用示例
function asyncOperation(callback: ErrorFirstCallback<Result>): void {
  someAsyncWork((err, data) => {
    if (err) {
      callback(new AppError(
        `Operation failed: ${err.message}`,
        'OPERATION_FAILED',
        400
      ));
      return;
    }
    callback(null, data);
  });
}
```

### 常见错误

```typescript
// 错误：不检查错误参数
fs.readFile('file.txt', (err, data) => {
  console.log(data); // 如果 err 存在，data 会是 undefined
});

// 正确：总是先检查错误
fs.readFile('file.txt', (err, data) => {
  if (err) {
    console.error('读取失败:', err);
    return;
  }
  console.log(data);
});
```

```typescript
// 错误：回调中抛出异常（会导致进程崩溃）
function badCallback(callback: ErrorFirstCallback<void>): void {
  setTimeout(() => {
    throw new Error('Something went wrong'); // 不要这样做
  }, 100);
}

// 正确：将错误传递给回调
function goodCallback(callback: ErrorFirstCallback<void>): void {
  setTimeout(() => {
    callback(new Error('Something went wrong'));
  }, 100);
}
```

---

## 3. Promise 和 async/await 模式

### 使用场景

- **异步流程控制**：替代回调地狱
- **并行执行**：Promise.all()、Promise.race()
- **错误处理**：使用 try/catch 统一处理
- **链式操作**：then() 链式调用

### 代码示例

#### Promise 基础模式

```typescript
// 将回调转换为 Promise
import { promisify } from 'util';
import fs from 'fs';

const readFileAsync = promisify(fs.readFile);

// 手动创建 Promise
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function fetchUserData(userId: string): Promise<User> {
  return new Promise((resolve, reject) => {
    database.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
      if (err) {
        reject(new Error(`Database error: ${err.message}`));
        return;
      }
      if (results.length === 0) {
        reject(new Error(`User not found: ${userId}`));
        return;
      }
      resolve(results[0]);
    });
  });
}
```

#### async/await 模式

```typescript
// 用户服务示例
interface User {
  id: string;
  name: string;
  email: string;
}

interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
}

class UserService {
  constructor(
    private userRepo: IUserRepository,
    private postRepo: IPostRepository,
    private cache: ICache
  ) {}

  async getUserWithPosts(userId: string): Promise<{ user: User; posts: Post[] }> {
    // 并行获取用户和帖子
    const [user, posts] = await Promise.all([
      this.getUser(userId),
      this.getUserPosts(userId)
    ]);

    return { user, posts };
  }

  private async getUser(userId: string): Promise<User> {
    // 先查缓存
    const cached = await this.cache.get<User>(`user:${userId}`);
    if (cached) return cached;

    // 查数据库
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // 写入缓存
    await this.cache.set(`user:${userId}`, user, 300);
    return user;
  }

  private async getUserPosts(userId: string): Promise<Post[]> {
    return this.postRepo.findByUserId(userId);
  }
}
```

#### 重试模式

```typescript
interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
}

async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxAttempts, delayMs, backoffMultiplier = 2 } = options;

  let lastError: Error;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        break;
      }

      console.warn(`Attempt ${attempt} failed, retrying in ${currentDelay}ms...`);
      await delay(currentDelay);
      currentDelay *= backoffMultiplier;
    }
  }

  throw new Error(`Failed after ${maxAttempts} attempts: ${lastError!.message}`);
}

// 使用示例
const result = await withRetry(
  () => fetchUserData('user-123'),
  { maxAttempts: 3, delayMs: 1000, backoffMultiplier: 2 }
);
```

#### 超时模式

```typescript
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    })
  ]);
}

// 使用示例
try {
  const data = await withTimeout(
    fetchDataFromSlowAPI(),
    5000,
    'API request timed out after 5 seconds'
  );
} catch (error) {
  console.error(error.message);
}
```

### 最佳实践

1. **始终使用 try/catch**：在 async 函数中包裹可能抛出错误的调用
2. **避免返回 void Promise**：明确返回类型有助于类型推断
3. **使用 Promise.all() 进行并行**：不要串行执行独立的异步操作
4. **避免 mix 回调和 Promise**：选择一种模式并保持一致

```typescript
// 推荐：完整的错误处理
async function processUsers(userIds: string[]): Promise<ProcessedUser[]> {
  const results: ProcessedUser[] = [];
  const errors: { userId: string; error: Error }[] = [];

  await Promise.all(
    userIds.map(async (userId) => {
      try {
        const user = await fetchUser(userId);
        const processed = await processUser(user);
        results.push(processed);
      } catch (error) {
        errors.push({ userId, error: error as Error });
      }
    })
  );

  if (errors.length > 0) {
    console.warn(`Failed to process ${errors.length} users`, errors);
  }

  return results;
}
```

### 常见错误

```typescript
// 错误：忘记 await
async function badFunction(): Promise<void> {
  const result = fetchData(); // 忘记 await
  console.log(result); // 输出 Promise 对象
}

// 正确：使用 await
async function goodFunction(): Promise<void> {
  const result = await fetchData();
  console.log(result);
}
```

```typescript
// 错误：在 forEach 中使用 async
const ids = ['1', '2', '3'];
ids.forEach(async (id) => {
  await processId(id); // 不会等待，forEach 不会暂停
});

// 正确：使用 for...of 或 Promise.all
for (const id of ids) {
  await processId(id); // 串行执行
}

// 或者并行
await Promise.all(ids.map(id => processId(id)));
```

```typescript
// 错误：catch 块中不处理错误
async function badErrorHandling(): Promise<void> {
  try {
    await riskyOperation();
  } catch (error) {
    console.error('Error occurred'); // 错误被吞掉，继续执行
  }
}

// 正确：重新抛出或返回错误
async function goodErrorHandling(): Promise<void> {
  try {
    await riskyOperation();
  } catch (error) {
    console.error('Error occurred:', error);
    throw error; // 重新抛出
  }
}
```

---

## 4. 事件发射器模式

### 使用场景

- **解耦组件**：发布-订阅模式实现组件解耦
- **实时通信**：WebSocket、Socket.io 事件处理
- **生命周期钩子**：应用启动、关闭事件
- **流处理**：数据流的 chunk、end、error 事件

### 代码示例

#### 基础事件发射器

```typescript
import EventEmitter from 'events';

// 类型定义
interface JobEvents {
  'job:started': { jobId: string; timestamp: Date };
  'job:progress': { jobId: string; progress: number };
  'job:completed': { jobId: string; result: unknown };
  'job:failed': { jobId: string; error: Error };
}

type JobEventName = keyof JobEvents;

// 类型安全的事件发射器
class TypedEventEmitter<T extends Record<string, unknown>> {
  private emitter = new EventEmitter();

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): this {
    this.emitter.on(event as string, listener);
    return this;
  }

  emit<K extends keyof T>(event: K, data: T[K]): boolean {
    return this.emitter.emit(event as string, data);
  }

  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): this {
    this.emitter.off(event as string, listener);
    return this;
  }

  once<K extends keyof T>(event: K, listener: (data: T[K]) => void): this {
    this.emitter.once(event as string, listener);
    return this;
  }
}

// 任务处理器
class JobProcessor extends TypedEventEmitter<JobEvents> {
  private activeJobs = new Map<string, AbortController>();

  async startJob(jobId: string, task: () => Promise<unknown>): Promise<void> {
    const controller = new AbortController();
    this.activeJobs.set(jobId, controller);

    this.emit('job:started', { jobId, timestamp: new Date() });

    try {
      const result = await this.executeWithProgress(jobId, task, controller.signal);
      this.emit('job:completed', { jobId, result });
    } catch (error) {
      this.emit('job:failed', { jobId, error: error as Error });
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  private async executeWithProgress(
    jobId: string,
    task: () => Promise<unknown>,
    signal: AbortSignal
  ): Promise<unknown> {
    // 模拟进度更新
    const progressInterval = setInterval(() => {
      if (signal.aborted) {
        clearInterval(progressInterval);
        return;
      }
      const progress = Math.random() * 100;
      this.emit('job:progress', { jobId, progress });
    }, 1000);

    try {
      const result = await task();
      return result;
    } finally {
      clearInterval(progressInterval);
    }
  }

  cancelJob(jobId: string): void {
    const controller = this.activeJobs.get(jobId);
    if (controller) {
      controller.abort();
    }
  }
}

// 使用示例
const processor = new JobProcessor();

// 监听事件
processor.on('job:started', ({ jobId, timestamp }) => {
  console.log(`Job ${jobId} started at ${timestamp}`);
});

processor.on('job:progress', ({ jobId, progress }) => {
  console.log(`Job ${jobId}: ${progress.toFixed(2)}%`);
});

processor.on('job:completed', ({ jobId, result }) => {
  console.log(`Job ${jobId} completed with result:`, result);
});

// 启动任务
processor.startJob('job-123', async () => {
  await delay(5000);
  return { data: 'processed' };
});
```

#### 事件总线模式

```typescript
// 应用级事件总线
class EventBus extends TypedEventEmitter<ApplicationEvents> {
  private static instance: EventBus;

  private constructor() {
    super();
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
}

// 应用事件类型
interface ApplicationEvents {
  'user:login': { userId: string; timestamp: Date };
  'user:logout': { userId: string };
  'cache:invalidate': { key: string };
  'config:reload': { config: Record<string, unknown> };
}

// 订阅者模块
class AuditLogger {
  constructor(private eventBus: EventBus) {
    this.setupListeners();
  }

  private setupListeners(): void {
    this.eventBus.on('user:login', this.handleLogin.bind(this));
    this.eventBus.on('user:logout', this.handleLogout.bind(this));
  }

  private async handleLogin(data: { userId: string; timestamp: Date }): Promise<void> {
    await this.saveAuditLog('LOGIN', data);
  }

  private async handleLogout(data: { userId: string }): Promise<void> {
    await this.saveAuditLog('LOGOUT', data);
  }

  private async saveAuditLog(action: string, data: unknown): Promise<void> {
    console.log(`[AUDIT] ${action}:`, data);
  }
}

// 使用
const eventBus = EventBus.getInstance();
const auditLogger = new AuditLogger(eventBus);

eventBus.emit('user:login', { userId: 'user-123', timestamp: new Date() });
```

### 最佳实践

1. **类型安全**：使用 TypeScript 泛型定义事件类型
2. **内存管理**：及时移除不需要的事件监听器
3. **错误处理**：在事件处理器中捕获错误
4. **命名空间**：使用冒号命名法区分事件类别

```typescript
// 推荐：使用 once 避免内存泄漏
class ConnectionManager {
  constructor(private eventBus: EventBus) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);

      this.eventBus.once('connection:established', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.eventBus.once('connection:failed', ({ error }) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }
}
```

### 常见错误

```typescript
// 错误：内存泄漏 - 添加监听器但不移除
class BadExample {
  constructor(private emitter: EventEmitter) {
    // 每次实例化都添加监听器，但从不移除
    this.emitter.on('data', this.handleData.bind(this));
  }
}

// 正确：在销毁时移除监听器
class GoodExample {
  private boundHandler = this.handleData.bind(this);

  constructor(private emitter: EventEmitter) {
    this.emitter.on('data', this.boundHandler);
  }

  destroy(): void {
    this.emitter.off('data', this.boundHandler);
  }
}
```

```typescript
// 错误：同步监听器中抛出异常
emitter.on('event', () => {
  throw new Error('Oops'); // 会导致进程崩溃
});

// 正确：包装错误处理
emitter.on('event', () => {
  try {
    riskyOperation();
  } catch (error) {
    console.error('Event handler error:', error);
  }
});
```

---

## 5. 流 (Streams) 模式

### 使用场景

- **大文件处理**：无需将整个文件加载到内存
- **数据转换**：管道化处理数据（压缩、加密、解析）
- **实时数据处理**：日志流、网络数据流
- **背压控制**：自动处理生产者和消费者速度不匹配

### 代码示例

#### 基础流模式

```typescript
import fs from 'fs';
import { Transform, pipeline } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

// 自定义 Transform 流
class JSONParseTransform extends Transform {
  private buffer = '';

  constructor(options?: { objectMode?: boolean }) {
    super({ objectMode: options?.objectMode ?? true });
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, callback: Function): void {
    this.buffer += chunk.toString();

    const lines = this.buffer.split('\\n');
    this.buffer = lines.pop() || ''; // 保留不完整的行

    for (const line of lines) {
      if (line.trim()) {
        try {
          const obj = JSON.parse(line);
          this.push(obj);
        } catch (error) {
          callback(error as Error);
          return;
        }
      }
    }

    callback();
  }

  _flush(callback: Function): void {
    if (this.buffer.trim()) {
      try {
        const obj = JSON.parse(this.buffer);
        this.push(obj);
      } catch (error) {
        callback(error as Error);
        return;
      }
    }
    callback();
  }
}

// 数据处理管道
async function processJsonLines(inputFile: string, outputFile: string): Promise<void> {
  await pipelineAsync(
    fs.createReadStream(inputFile, { encoding: 'utf-8' }),
    new JSONParseTransform(),
    new Transform({
      objectMode: true,
      transform(chunk: Record<string, unknown>, encoding, callback) {
        // 处理每个 JSON 对象
        const processed = {
          ...chunk,
          processedAt: new Date().toISOString(),
          id: (chunk.id as string)?.toUpperCase()
        };
        callback(null, JSON.stringify(processed) + '\\n');
      }
    }),
    fs.createWriteStream(outputFile)
  );
}
```

#### 可读流封装

```typescript
import { Readable } from 'stream';

// 数据库查询流
interface DatabaseCursor<T> {
  hasNext(): boolean;
  next(): Promise<T>;
  close(): Promise<void>;
}

class DatabaseReadableStream<T> extends Readable {
  private isReading = false;

  constructor(
    private cursor: DatabaseCursor<T>,
    options?: { highWaterMark?: number }
  ) {
    super({ objectMode: true, highWaterMark: options?.highWaterMark ?? 16 });
  }

  async _read(): Promise<void> {
    if (this.isReading) return;
    this.isReading = true;

    try {
      while (this.cursor.hasNext()) {
        const item = await this.cursor.next();
        if (!this.push(item)) {
          // 消费者缓冲区已满，暂停读取
          break;
        }
      }

      if (!this.cursor.hasNext()) {
        this.push(null); // 结束流
      }
    } catch (error) {
      this.destroy(error as Error);
    } finally {
      this.isReading = false;
    }
  }

  async _destroy(error: Error | null, callback: (error?: Error | null) => void): Promise<void> {
    try {
      await this.cursor.close();
      callback(error);
    } catch (closeError) {
      callback(error || (closeError as Error));
    }
  }
}

// 使用示例
const cursor = await database.queryCursor('SELECT * FROM large_table');
const stream = new DatabaseReadableStream(cursor);

stream.on('data', (row) => {
  console.log('Processing row:', row);
});

stream.on('end', () => {
  console.log('All rows processed');
});
```

#### 可写流封装

```typescript
import { Writable } from 'stream';

// 批量写入流
interface BatchWriter<T> {
  writeBatch(items: T[]): Promise<void>;
}

class BatchWritableStream<T> extends Writable {
  private buffer: T[] = [];

  constructor(
    private writer: BatchWriter<T>,
    private options: { batchSize: number; flushIntervalMs: number }
  ) {
    super({ objectMode: true });
    this.startFlushInterval();
  }

  async _write(chunk: T, encoding: BufferEncoding, callback: (error?: Error | null) => void): Promise<void> {
    this.buffer.push(chunk);

    if (this.buffer.length >= this.options.batchSize) {
      await this.flush();
    }

    callback();
  }

  async _final(callback: (error?: Error | null) => void): Promise<void> {
    await this.flush();
    callback();
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const batch = this.buffer.splice(0, this.buffer.length);
    await this.writer.writeBatch(batch);
  }

  private startFlushInterval(): void {
    setInterval(() => {
      this.flush().catch(console.error);
    }, this.options.flushIntervalMs);
  }
}

// 使用示例 - 批量写入 Elasticsearch
const esWriter: BatchWriter<LogEntry> = {
  async writeBatch(entries: LogEntry[]): Promise<void> {
    await elasticsearch.bulk({
      body: entries.flatMap(entry => [
        { index: { _index: 'logs' } },
        entry
      ])
    });
  }
};

const batchStream = new BatchWritableStream(esWriter, {
  batchSize: 1000,
  flushIntervalMs: 5000
});

logSource.pipe(batchStream);
```

### 最佳实践

1. **使用 pipeline/pipelinePromise**：自动处理错误和清理
2. **设置合理的 highWaterMark**：平衡内存使用和性能
3. **正确处理背压**：监听 drain 事件
4. **确保资源释放**：在 _destroy 中关闭资源

```typescript
// 推荐：使用 pipeline 和错误处理
import { pipeline } from 'stream/promises';

async function safePipeline(): Promise<void> {
  try {
    await pipeline(
      fs.createReadStream('input.txt'),
      createDecompressor(),
      createParser(),
      fs.createWriteStream('output.json')
    );
    console.log('Pipeline completed');
  } catch (error) {
    console.error('Pipeline failed:', error);
    throw error;
  }
}
```

### 常见错误

```typescript
// 错误：不使用 pipeline 手动连接流
readStream.pipe(transformStream).pipe(writeStream);
// 如果 transformStream 出错，readStream 不会自动销毁

// 正确：使用 pipeline 自动处理
pipeline(readStream, transformStream, writeStream, (err) => {
  if (err) console.error(err);
});
```

```typescript
// 错误：不处理背压
readStream.on('data', (chunk) => {
  writeStream.write(chunk); // 可能超出内存
});

// 正确：使用 pipe 或手动处理背压
readStream.pipe(writeStream);
// 或
readStream.on('data', (chunk) => {
  if (!writeStream.write(chunk)) {
    readStream.pause();
    writeStream.once('drain', () => readStream.resume());
  }
});
```

---

## 6. 中间件模式 (Express/Koa)

### 使用场景

- **HTTP 请求处理**：路由、认证、验证、日志
- **AOP 编程**：横切关注点（日志、监控、错误处理）
- **请求转换**：解析请求体、添加上下文
- **响应处理**：统一响应格式、压缩、缓存

### 代码示例

#### Express 中间件模式

```typescript
import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';

// 自定义类型扩展
declare global {
  namespace Express {
    interface Request {
      user?: User;
      requestId: string;
      startTime: number;
    }
  }
}

// 中间件类型
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// 错误类
class HttpError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

// 请求 ID 中间件
const requestIdMiddleware: RequestHandler = (req, res, next) => {
  req.requestId = crypto.randomUUID();
  req.startTime = Date.now();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// 日志中间件
const loggerMiddleware: RequestHandler = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log({
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('user-agent')
    });
  });

  next();
};

// 认证中间件
const authMiddleware = (requiredRole?: string): RequestHandler => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        throw new HttpError('Unauthorized', 401);
      }

      const user = await verifyToken(token);

      if (requiredRole && !user.roles.includes(requiredRole)) {
        throw new HttpError('Forbidden', 403);
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// 错误处理中间件
const errorHandler: RequestHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
      requestId: req.requestId
    });
    return;
  }

  console.error('Unexpected error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    requestId: req.requestId
  });
};

// 验证中间件工厂
function validateRequest(validations: ReturnType<typeof body>[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
      return;
    }

    next();
  };
}

// 应用构建
const app = express();

// 全局中间件
app.use(express.json());
app.use(requestIdMiddleware);
app.use(loggerMiddleware);

// 路由
app.post(
  '/api/users',
  authMiddleware('admin'),
  validateRequest([
    body('email').isEmail(),
    body('name').isLength({ min: 2 })
  ]),
  async (req, res, next) => {
    try {
      const user = await userService.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
);

// 错误处理（必须在最后）
app.use(errorHandler);
```

#### Koa 风格的中间件组合

```typescript
// 函数式中间件组合
interface Context {
  request: Request;
  response: Response;
  state: Record<string, unknown>;
}

type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>;

function compose(middleware: Middleware[]): Middleware {
  return async (ctx, next) => {
    let index = -1;

    async function dispatch(i: number): Promise<void> {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      index = i;

      let fn = middleware[i];
      if (i === middleware.length) fn = next;
      if (!fn) return;

      await fn(ctx, () => dispatch(i + 1));
    }

    await dispatch(0);
  };
}

// 中间件工厂
function timeoutMiddleware(ms: number): Middleware {
  return async (ctx, next) => {
    const timeout = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), ms);
    });

    await Promise.race([next(), timeout]);
  };
}

function retryMiddleware(maxRetries: number): Middleware {
  return async (ctx, next) => {
    let lastError;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        await next();
        return;
      } catch (error) {
        lastError = error;
        if (i < maxRetries) {
          await delay(Math.pow(2, i) * 100);
        }
      }
    }

    throw lastError;
  };
}
```

### 最佳实践

1. **错误集中处理**：使用专门的错误处理中间件
2. **中间件顺序**：错误处理中间件放在最后
3. **异步处理**：async 中间件要正确处理错误
4. **类型安全**：扩展 Express.Request 类型

```typescript
// 推荐：包装异步路由处理器
const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 使用
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id);
  if (!user) {
    throw new HttpError('User not found', 404);
  }
  res.json(user);
}));
```

### 常见错误

```typescript
// 错误：async 中间件中未捕获的异常
app.use(async (req, res, next) => {
  const data = await fetchData(); // 如果失败，请求会挂起
  req.data = data;
  next();
});

// 正确：使用 try/catch 或包装函数
app.use(async (req, res, next) => {
  try {
    const data = await fetchData();
    req.data = data;
    next();
  } catch (error) {
    next(error);
  }
});
```

```typescript
// 错误：在错误处理中间件之前发送响应
app.use((req, res, next) => {
  res.json({ message: 'Done' }); // 发送了响应
  next(); // 不应该调用 next()
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message }); // 错误：头部已发送
});
```

---

## 7. 依赖注入模式

### 使用场景

- **测试友好**：便于使用 mock 对象进行单元测试
- **松耦合**：降低模块间的依赖
- **可配置性**：运行时切换实现
- **生命周期管理**：统一管理对象创建和销毁

### 代码示例

#### 构造函数注入

```typescript
// 接口定义
interface IDatabaseConnection {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  transaction<T>(fn: (conn: IDatabaseConnection) => Promise<T>): Promise<T>;
}

interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

interface ILogger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
}

// 服务实现
interface User {
  id: string;
  email: string;
  name: string;
}

class UserRepository {
  constructor(
    private readonly db: IDatabaseConnection,
    private readonly logger: ILogger
  ) {}

  async findById(id: string): Promise<User | null> {
    this.logger.debug('Finding user by id', { userId: id });

    const results = await this.db.query<User>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    return results[0] || null;
  }

  async create(userData: Omit<User, 'id'>): Promise<User> {
    this.logger.info('Creating new user', { email: userData.email });

    const id = crypto.randomUUID();
    await this.db.query(
      'INSERT INTO users (id, email, name) VALUES (?, ?, ?)',
      [id, userData.email, userData.name]
    );

    return { id, ...userData };
  }
}

class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly cache: ICache,
    private readonly logger: ILogger
  ) {}

  async getUser(userId: string): Promise<User | null> {
    // 缓存检查
    const cacheKey = `user:${userId}`;
    const cached = await this.cache.get<User>(cacheKey);

    if (cached) {
      this.logger.debug('Cache hit for user', { userId });
      return cached;
    }

    // 数据库查询
    const user = await this.userRepo.findById(userId);

    if (user) {
      await this.cache.set(cacheKey, user, 300);
    }

    return user;
  }
}

// 使用示例
const db = createPostgresConnection({ /* config */ });
const cache = createRedisCache({ /* config */ });
const logger = createWinstonLogger({ /* config */ });

const userRepo = new UserRepository(db, logger);
const userService = new UserService(userRepo, cache, logger);
```

#### 属性注入（可选依赖）

```typescript
class EmailService {
  private logger: ILogger = new ConsoleLogger(); // 默认实现
  private metrics?: IMetrics;

  setLogger(logger: ILogger): this {
    this.logger = logger;
    return this;
  }

  setMetrics(metrics: IMetrics): this {
    this.metrics = metrics;
    return this;
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.info('Sending email', { to, subject });
      await this.transporter.sendMail({ to, subject, html: body });

      this.metrics?.record('email.sent', 1, { status: 'success' });
    } catch (error) {
      this.logger.error('Failed to send email', error as Error, { to });
      this.metrics?.record('email.sent', 1, { status: 'failed' });
      throw error;
    } finally {
      this.metrics?.recordTiming('email.duration', Date.now() - startTime);
    }
  }
}

// 链式配置
const emailService = new EmailService()
  .setLogger(winstonLogger)
  .setMetrics(datadogMetrics);
```

#### 方法注入

```typescript
interface IRequestContext {
  userId: string;
  requestId: string;
  timestamp: Date;
}

class AuditService {
  async logAction(
    action: string,
    details: Record<string, unknown>,
    context: IRequestContext // 方法注入
  ): Promise<void> {
    await this.auditLog.create({
      action,
      details,
      userId: context.userId,
      requestId: context.requestId,
      timestamp: context.timestamp
    });
  }
}

// 使用
class OrderService {
  constructor(private auditService: AuditService) {}

  async createOrder(orderData: CreateOrderDTO, context: IRequestContext): Promise<Order> {
    const order = await this.orderRepo.create(orderData);

    await this.auditService.logAction(
      'ORDER_CREATED',
      { orderId: order.id, amount: order.total },
      context
    );

    return order;
  }
}
```

### 最佳实践

1. **依赖接口**：依赖抽象而非具体实现
2. **构造函数注入**：优先用于必需依赖
3. **不可变性**：使用 readonly 防止依赖被修改
4. **单一职责**：每个类只负责一个功能

```typescript
// 推荐：使用接口隔离
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
}

interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  create(data: CreateOrderDTO): Promise<Order>;
}

// 服务只依赖需要的接口
class OrderService {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly userRepo: IUserRepository // 只读依赖
  ) {}
}
```

### 常见错误

```typescript
// 错误：直接实例化依赖
class UserService {
  private db = new PostgresConnection(); // 紧耦合

  async getUser(id: string) {
    return this.db.query('SELECT * FROM users WHERE id = ?', [id]);
  }
}

// 正确：通过构造函数注入
class UserService {
  constructor(private db: IDatabaseConnection) {}
}
```

```typescript
// 错误：循环依赖
class UserService {
  constructor(private orderService: OrderService) {}
}

class OrderService {
  constructor(private userService: UserService) {}
}

// 解决方案：提取公共接口或使用事件
interface IUserNotifier {
  notify(userId: string, message: string): Promise<void>;
}

class OrderService {
  constructor(private userNotifier: IUserNotifier) {}
}
```

---

## 8. 工厂和依赖容器

### 使用场景

- **对象创建逻辑复杂**：需要根据不同条件创建对象
- **单例管理**：确保全局只有一个实例
- **配置驱动**：根据配置动态选择实现
- **测试替身**：运行时切换 mock 实现

### 代码示例

#### 工厂模式

```typescript
// 通知服务接口
interface NotificationChannel {
  send(to: string, message: string): Promise<void>;
  validateAddress(address: string): boolean;
}

// 具体实现
class EmailChannel implements NotificationChannel {
  constructor(private smtpConfig: SmtpConfig) {}

  async send(to: string, message: string): Promise<void> {
    // 发送邮件
  }

  validateAddress(email: string): boolean {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
  }
}

class SmsChannel implements NotificationChannel {
  constructor(private twilioConfig: TwilioConfig) {}

  async send(to: string, message: string): Promise<void> {
    // 发送短信
  }

  validateAddress(phone: string): boolean {
    return /^\\+?[1-9]\\d{1,14}$/.test(phone);
  }
}

class PushChannel implements NotificationChannel {
  constructor(private fcmConfig: FCMConfig) {}

  async send(to: string, message: string): Promise<void> {
    // 发送推送
  }

  validateAddress(token: string): boolean {
    return token.length > 0;
  }
}

// 工厂类
type ChannelType = 'email' | 'sms' | 'push';

class NotificationChannelFactory {
  private channels = new Map<ChannelType, NotificationChannel>();

  constructor(private config: NotificationConfig) {}

  createChannel(type: ChannelType): NotificationChannel {
    // 检查缓存
    if (this.channels.has(type)) {
      return this.channels.get(type)!;
    }

    // 创建新实例
    const channel = this.buildChannel(type);
    this.channels.set(type, channel);
    return channel;
  }

  private buildChannel(type: ChannelType): NotificationChannel {
    switch (type) {
      case 'email':
        return new EmailChannel(this.config.smtp);
      case 'sms':
        return new SmsChannel(this.config.twilio);
      case 'push':
        return new PushChannel(this.config.fcm);
      default:
        throw new Error(`Unknown channel type: ${type}`);
    }
  }

  getSupportedChannels(): ChannelType[] {
    const channels: ChannelType[] = [];
    if (this.config.smtp) channels.push('email');
    if (this.config.twilio) channels.push('sms');
    if (this.config.fcm) channels.push('push');
    return channels;
  }
}

// 使用
const factory = new NotificationChannelFactory(notificationConfig);
const emailChannel = factory.createChannel('email');
await emailChannel.send('user@example.com', 'Hello!');
```

#### 抽象工厂

```typescript
// 抽象工厂接口
interface DataStorageFactory {
  createUserRepository(): IUserRepository;
  createOrderRepository(): IOrderRepository;
  createCache(): ICache;
}

// Postgres 实现
class PostgresStorageFactory implements DataStorageFactory {
  constructor(private pool: Pool) {}

  createUserRepository(): IUserRepository {
    return new PostgresUserRepository(this.pool);
  }

  createOrderRepository(): IOrderRepository {
    return new PostgresOrderRepository(this.pool);
  }

  createCache(): ICache {
    return new RedisCache(redisClient);
  }
}

// MongoDB 实现
class MongoStorageFactory implements DataStorageFactory {
  constructor(private db: Db) {}

  createUserRepository(): IUserRepository {
    return new MongoUserRepository(this.db.collection('users'));
  }

  createOrderRepository(): IOrderRepository {
    return new MongoOrderRepository(this.db.collection('orders'));
  }

  createCache(): ICache {
    return new InMemoryCache();
  }
}

// 应用程序
dependency injection container
class Application {
  constructor(private storageFactory: DataStorageFactory) {}

  async initialize(): Promise<void> {
    const userRepo = this.storageFactory.createUserRepository();
    const orderRepo = this.storageFactory.createOrderRepository();
    const cache = this.storageFactory.createCache();

    this.userService = new UserService(userRepo, cache);
    this.orderService = new OrderService(orderRepo, userRepo);
  }
}

// 运行时选择工厂
const storageFactory = config.database.type === 'postgres'
  ? new PostgresStorageFactory(pgPool)
  : new MongoStorageFactory(mongoDb);

const app = new Application(storageFactory);
await app.initialize();
```

#### 依赖容器

```typescript
// 服务标识符
type ServiceToken<T> = symbol & { __type: T };

function createToken<T>(name: string): ServiceToken<T> {
  return Symbol(name) as ServiceToken<T>;
}

// 生命周期
enum Lifetime {
  Transient = 'transient',  // 每次解析新实例
  Singleton = 'singleton',  // 全局单例
  Scoped = 'scoped'         // 作用域内单例
}

interface ServiceRegistration<T> {
  token: ServiceToken<T>;
  factory: (container: Container) => T;
  lifetime: Lifetime;
  instance?: T;
}

class Container {
  private registrations = new Map<symbol, ServiceRegistration<unknown>>();
  private scopedInstances = new Map<symbol, unknown>();

  register<T>(
    token: ServiceToken<T>,
    factory: (container: Container) => T,
    lifetime: Lifetime = Lifetime.Transient
  ): this {
    this.registrations.set(token, {
      token,
      factory,
      lifetime
    });
    return this;
  }

  resolve<T>(token: ServiceToken<T>): T {
    const registration = this.registrations.get(token);

    if (!registration) {
      throw new Error(`Service not registered: ${token.toString()}`);
    }

    switch (registration.lifetime) {
      case Lifetime.Singleton:
        if (!registration.instance) {
          registration.instance = registration.factory(this);
        }
        return registration.instance as T;

      case Lifetime.Scoped:
        if (!this.scopedInstances.has(token)) {
          this.scopedInstances.set(token, registration.factory(this));
        }
        return this.scopedInstances.get(token) as T;

      case Lifetime.Transient:
      default:
        return registration.factory(this) as T;
    }
  }

  createScope(): Container {
    const child = new Container();
    child.registrations = this.registrations;
    return child;
  }
}

// 定义服务令牌
const TOKENS = {
  Database: createToken<IDatabaseConnection>('Database'),
  Cache: createToken<ICache>('Cache'),
  Logger: createToken<ILogger>('Logger'),
  UserRepository: createToken<IUserRepository>('UserRepository'),
  UserService: createToken<UserService>('UserService')
};

// 配置容器
const container = new Container();

container.register(TOKENS.Database, () =>
  createPostgresConnection(config.database),
  Lifetime.Singleton
);

container.register(TOKENS.Cache, () =>
  createRedisCache(config.redis),
  Lifetime.Singleton
);

container.register(TOKENS.Logger, () =>
  createWinstonLogger(),
  Lifetime.Singleton
);

container.register(TOKENS.UserRepository, (c) =>
  new UserRepository(c.resolve(TOKENS.Database), c.resolve(TOKENS.Logger)),
  Lifetime.Scoped
);

container.register(TOKENS.UserService, (c) =>
  new UserService(
    c.resolve(TOKENS.UserRepository),
    c.resolve(TOKENS.Cache),
    c.resolve(TOKENS.Logger)
  ),
  Lifetime.Scoped
);

// 使用
const userService = container.resolve(TOKENS.UserService);
const user = await userService.getUser('user-123');
```

### 最佳实践

1. **延迟实例化**：工厂模式按需创建对象
2. **配置外部化**：通过配置决定使用哪个工厂
3. **生命周期管理**：明确服务生命周期（单例/作用域/瞬态）
4. **类型安全**：使用 TypeScript 确保类型正确

```typescript
// 推荐：装饰器风格的依赖注入（可选）
function Injectable(token: ServiceToken<unknown>) {
  return function (target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get: function() {
        return container.resolve(token);
      },
      enumerable: true,
      configurable: true
    });
  };
}

class OrderController {
  @Injectable(TOKENS.OrderService)
  private orderService!: OrderService;

  @Injectable(TOKENS.Logger)
  private logger!: ILogger;
}
```

### 常见错误

```typescript
// 错误：工厂创建过多实例
class BadFactory {
  createService() {
    return new ExpensiveService(); // 每次都创建新实例
  }
}

// 正确：实现单例或缓存
class GoodFactory {
  private instance?: ExpensiveService;

  createService() {
    if (!this.instance) {
      this.instance = new ExpensiveService();
    }
    return this.instance;
  }
}
```

```typescript
// 错误：循环依赖在容器中
container.register(A, () => new A(container.resolve(B)));
container.register(B, () => new B(container.resolve(A)));

// 解决方案：使用延迟解析
container.register(A, () => new A(() => container.resolve(B)));
class A {
  constructor(private getB: () => B) {}
}
```

---

## 9. 观察者模式在 Node 中的应用

### 使用场景

- **状态变更通知**：数据变化时通知多个订阅者
- **实时更新**：WebSocket 消息广播
- **任务编排**：工作流中的步骤触发
- **日志聚合**：多源日志收集

### 代码示例

#### 基础观察者模式

```typescript
// 观察者接口
interface Observer<T> {
  update(data: T): void;
}

// 主题接口
interface Subject<T> {
  attach(observer: Observer<T>): void;
  detach(observer: Observer<T>): void;
  notify(data: T): void;
}

// 具体主题
class OrderSubject implements Subject<Order> {
  private observers = new Set<Observer<Order>>();

  attach(observer: Observer<Order>): void {
    this.observers.add(observer);
  }

  detach(observer: Observer<Order>): void {
    this.observers.delete(observer);
  }

  notify(order: Order): void {
    for (const observer of this.observers) {
      try {
        observer.update(order);
      } catch (error) {
        console.error('Observer update failed:', error);
      }
    }
  }

  async createOrder(orderData: CreateOrderDTO): Promise<Order> {
    const order = await this.saveToDatabase(orderData);
    this.notify(order);
    return order;
  }
}

// 具体观察者
class InventoryObserver implements Observer<Order> {
  constructor(private inventoryService: InventoryService) {}

  async update(order: Order): Promise<void> {
    for (const item of order.items) {
      await this.inventoryService.reserve(item.productId, item.quantity);
    }
  }
}

class EmailObserver implements Observer<Order> {
  constructor(private emailService: EmailService) {}

  async update(order: Order): Promise<void> {
    await this.emailService.sendOrderConfirmation(order.customerEmail, order);
  }
}

class AnalyticsObserver implements Observer<Order> {
  constructor(private analytics: AnalyticsService) {}

  update(order: Order): void {
    this.analytics.track('order_created', {
      orderId: order.id,
      value: order.total,
      itemCount: order.items.length
    });
  }
}

// 使用
const orderSubject = new OrderSubject();

orderSubject.attach(new InventoryObserver(inventoryService));
orderSubject.attach(new EmailObserver(emailService));
orderSubject.attach(new AnalyticsObserver(analytics));

await orderSubject.createOrder({ /* order data */ });
```

#### 响应式编程风格

```typescript
// 简化版 Observable
class Observable<T> {
  private subscribers: Array<(data: T) => void> = [];

  subscribe(next: (data: T) => void): Subscription {
    this.subscribers.push(next);

    return {
      unsubscribe: () => {
        const index = this.subscribers.indexOf(next);
        if (index !== -1) {
          this.subscribers.splice(index, 1);
        }
      }
    };
  }

  next(data: T): void {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(data);
      } catch (error) {
        console.error('Subscriber error:', error);
      }
    });
  }

  // 操作符
  map<R>(fn: (data: T) => R): Observable<R> {
    const observable = new Observable<R>();
    this.subscribe(data => observable.next(fn(data)));
    return observable;
  }

  filter(predicate: (data: T) => boolean): Observable<T> {
    const observable = new Observable<T>();
    this.subscribe(data => {
      if (predicate(data)) {
        observable.next(data);
      }
    });
    return observable;
  }

  debounce(ms: number): Observable<T> {
    const observable = new Observable<T>();
    let timeoutId: NodeJS.Timeout;

    this.subscribe(data => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => observable.next(data), ms);
    });

    return observable;
  }
}

interface Subscription {
  unsubscribe(): void;
}

// 股票价格监控示例
class StockPriceMonitor {
  private priceUpdates = new Observable<StockPrice>();

  onPriceUpdate(): Observable<StockPrice> {
    return this.priceUpdates;
  }

  simulatePriceChange(stock: string, price: number): void {
    this.priceUpdates.next({ stock, price, timestamp: new Date() });
  }
}

// 使用
const monitor = new StockPriceMonitor();

// 过滤特定股票并防抖
const subscription = monitor.onPriceUpdate()
  .filter(price => price.stock === 'AAPL')
  .debounce(1000)
  .subscribe(price => {
    console.log('AAPL price:', price.price);
    updateChart(price);
  });

// 清理
subscription.unsubscribe();
```

#### Node.js EventEmitter 实现观察者

```typescript
import EventEmitter from 'events';

// 用户活动追踪
interface UserActivity {
  userId: string;
  action: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

class UserActivityTracker extends EventEmitter {
  track(userId: string, action: string, metadata?: Record<string, unknown>): void {
    const activity: UserActivity = {
      userId,
      action,
      metadata: metadata || {},
      timestamp: new Date()
    };

    this.emit('activity', activity);
  }
}

// 观察者模块
class SecurityMonitor {
  constructor(private tracker: UserActivityTracker) {
    this.setupListeners();
  }

  private setupListeners(): void {
    this.tracker.on('activity', this.checkSuspiciousActivity.bind(this));
  }

  private checkSuspiciousActivity(activity: UserActivity): void {
    // 检查异常登录
    if (activity.action === 'login') {
      const ip = activity.metadata.ip as string;
      if (this.isSuspiciousIP(ip)) {
        this.sendSecurityAlert(activity);
      }
    }
  }

  private isSuspiciousIP(ip: string): boolean {
    // 实现 IP 黑名单检查
    return false;
  }

  private sendSecurityAlert(activity: UserActivity): void {
    console.warn('Suspicious activity detected:', activity);
  }
}

class ActivityLogger {
  constructor(
    private tracker: UserActivityTracker,
    private logger: ILogger
  ) {
    this.setupListeners();
  }

  private setupListeners(): void {
    this.tracker.on('activity', (activity) => {
      this.logger.info('User activity', {
        userId: activity.userId,
        action: activity.action,
        timestamp: activity.timestamp
      });
    });
  }
}

// 使用
const tracker = new UserActivityTracker();
new SecurityMonitor(tracker);
new ActivityLogger(tracker, logger);

tracker.track('user-123', 'login', { ip: '192.168.1.1' });
tracker.track('user-123', 'view_product', { productId: 'prod-456' });
```

### 最佳实践

1. **弱引用观察者**：避免内存泄漏
2. **错误隔离**：一个观察者失败不影响其他
3. **异步处理**：观察者执行不要阻塞主题
4. **取消订阅**：及时清理不需要的观察者

```typescript
// 推荐：使用 WeakRef 避免内存泄漏
class WeakObserver<T> implements Observer<T> {
  private ref: WeakRef<Observer<T>>;

  constructor(observer: Observer<T>) {
    this.ref = new WeakRef(observer);
  }

  update(data: T): void {
    const observer = this.ref.deref();
    if (observer) {
      observer.update(data);
    }
  }

  isAlive(): boolean {
    return this.ref.deref() !== undefined;
  }
}
```

### 常见错误

```typescript
// 错误：观察者中阻塞主线程
class BadObserver implements Observer<Data> {
  async update(data: Data): Promise<void> {
    // 这会阻塞其他观察者的通知
    await heavyComputation(data);
  }
}

// 正确：使用队列或异步处理
class GoodObserver implements Observer<Data> {
  private queue: Data[] = [];

  constructor() {
    this.processQueue();
  }

  update(data: Data): void {
    this.queue.push(data);
  }

  private async processQueue(): Promise<void> {
    while (true) {
      const data = this.queue.shift();
      if (data) {
        await heavyComputation(data);
      }
      await delay(10);
    }
  }
}
```

---

## 10. 连接池和缓存模式

### 使用场景

- **数据库连接**：复用连接减少开销
- **HTTP 客户端**：复用 TCP 连接
- **缓存层**：Redis、内存缓存
- **资源密集型对象**：线程池、Worker 池

### 代码示例

#### 数据库连接池

```typescript
import { Pool, PoolClient } from 'pg';

interface PoolConfig {
  min: number;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

class DatabasePool {
  private pool: Pool;
  private metrics = {
    totalConnections: 0,
    idleConnections: 0,
    waitingClients: 0
  };

  constructor(config: PoolConfig) {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ...config
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.pool.on('connect', () => {
      this.metrics.totalConnections++;
      console.log('New database connection established');
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });

    this.pool.on('remove', () => {
      this.metrics.totalConnections--;
    });
  }

  async withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      return await fn(client);
    } finally {
      client.release();
    }
  }

  async withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.withClient(async (client) => {
        await client.query('SELECT 1');
      });
      return true;
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

// 使用示例
const dbPool = new DatabasePool({
  min: 5,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// 简单查询
const users = await dbPool.withClient(async (client) => {
  const result = await client.query('SELECT * FROM users WHERE active = $1', [true]);
  return result.rows;
});

// 事务
await dbPool.withTransaction(async (client) => {
  await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [100, 'acc-1']);
  await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [100, 'acc-2']);
});
```

#### 通用连接池

```typescript
interface PoolableConnection {
  id: string;
  isValid(): boolean;
  close(): Promise<void>;
}

interface ConnectionFactory<T extends PoolableConnection> {
  create(): Promise<T>;
}

class GenericConnectionPool<T extends PoolableConnection> {
  private available: T[] = [];
  private inUse = new Set<T>();
  private waiting: Array<(conn: T) => void> = [];

  constructor(
    private factory: ConnectionFactory<T>,
    private config: {
      maxConnections: number;
      acquireTimeout: number;
    }
  ) {}

  async acquire(): Promise<T> {
    // 检查可用连接
    while (this.available.length > 0) {
      const conn = this.available.pop()!;
      if (conn.isValid()) {
        this.inUse.add(conn);
        return conn;
      }
      await conn.close();
    }

    // 创建新连接
    if (this.inUse.size < this.config.maxConnections) {
      const conn = await this.factory.create();
      this.inUse.add(conn);
      return conn;
    }

    // 等待可用连接
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waiting.indexOf(resolver);
        if (index !== -1) {
          this.waiting.splice(index, 1);
        }
        reject(new Error('Acquire connection timeout'));
      }, this.config.acquireTimeout);

      const resolver = (conn: T) => {
        clearTimeout(timeout);
        resolve(conn);
      };

      this.waiting.push(resolver);
    });
  }

  release(connection: T): void {
    if (!this.inUse.has(connection)) {
      throw new Error('Connection not acquired from this pool');
    }

    this.inUse.delete(connection);

    if (this.waiting.length > 0) {
      const resolver = this.waiting.shift()!;
      this.inUse.add(connection);
      resolver(connection);
    } else if (connection.isValid()) {
      this.available.push(connection);
    } else {
      connection.close().catch(console.error);
    }
  }

  async withConnection<R>(fn: (conn: T) => Promise<R>): Promise<R> {
    const conn = await this.acquire();
    try {
      return await fn(conn);
    } finally {
      this.release(conn);
    }
  }

  async close(): Promise<void> {
    await Promise.all(
      [...this.available, ...this.inUse].map(conn => conn.close())
    );
    this.available = [];
    this.inUse.clear();
  }
}
```

#### 缓存模式

```typescript
// 缓存接口
interface Cache<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// 多级缓存
class MultiLevelCache<T> implements Cache<T> {
  constructor(
    private l1Cache: Cache<T>,  // 内存缓存
    private l2Cache: Cache<T>,  // Redis 缓存
    private options: {
      l1Ttl: number;
      l2Ttl: number;
    }
  ) {}

  async get(key: string): Promise<T | null> {
    // L1 缓存
    const l1Value = await this.l1Cache.get(key);
    if (l1Value !== null) {
      return l1Value;
    }

    // L2 缓存
    const l2Value = await this.l2Cache.get(key);
    if (l2Value !== null) {
      // 回填 L1
      await this.l1Cache.set(key, l2Value, this.options.l1Ttl);
      return l2Value;
    }

    return null;
  }

  async set(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await Promise.all([
      this.l1Cache.set(key, value, Math.min(ttlSeconds || this.options.l1Ttl, this.options.l1Ttl)),
      this.l2Cache.set(key, value, ttlSeconds || this.options.l2Ttl)
    ]);
  }

  async delete(key: string): Promise<void> {
    await Promise.all([
      this.l1Cache.delete(key),
      this.l2Cache.delete(key)
    ]);
  }

  async clear(): Promise<void> {
    await Promise.all([
      this.l1Cache.clear(),
      this.l2Cache.clear()
    ]);
  }
}

// 带缓存的数据访问层
class CachedUserRepository implements IUserRepository {
  constructor(
    private dbRepo: IUserRepository,
    private cache: Cache<User>
  ) {}

  async findById(id: string): Promise<User | null> {
    const cacheKey = `user:${id}`;

    // 先查缓存
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 查数据库
    const user = await this.dbRepo.findById(id);

    if (user) {
      // 写入缓存
      await this.cache.set(cacheKey, user, 300);
    }

    return user;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const user = await this.dbRepo.create(data);

    // 使相关缓存失效
    await this.cache.delete('users:list');
    await this.cache.set(`user:${user.id}`, user, 300);

    return user;
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const user = await this.dbRepo.update(id, data);

    // 更新缓存
    await this.cache.set(`user:${id}`, user, 300);
    await this.cache.delete('users:list');

    return user;
  }
}

// 内存缓存实现
class MemoryCache<T> implements Cache<T> {
  private cache = new Map<string, { value: T; expires: number }>();

  async get(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}
```

#### 缓存策略

```typescript
// 缓存模式枚举
enum CacheStrategy {
  CacheAside = 'cache-aside',
  ReadThrough = 'read-through',
  WriteThrough = 'write-through',
  WriteBehind = 'write-behind'
}

// Cache-Aside 模式
class CacheAsideService<T> {
  constructor(
    private cache: Cache<T>,
    private dataSource: IDataSource<T>,
    private options: { ttl: number }
  ) {}

  async get(id: string): Promise<T | null> {
    // 1. 查缓存
    let value = await this.cache.get(id);

    if (value === null) {
      // 2. 缓存未命中，查数据源
      value = await this.dataSource.get(id);

      // 3. 回填缓存
      if (value !== null) {
        await this.cache.set(id, value, this.options.ttl);
      }
    }

    return value;
  }

  async update(id: string, value: T): Promise<void> {
    // 1. 更新数据源
    await this.dataSource.update(id, value);

    // 2. 使缓存失效或更新
    await this.cache.set(id, value, this.options.ttl);
  }

  async delete(id: string): Promise<void> {
    // 1. 删除数据源
    await this.dataSource.delete(id);

    // 2. 使缓存失效
    await this.cache.delete(id);
  }
}

// Read-Through 模式
class ReadThroughCache<T> implements Cache<T> {
  constructor(
    private cache: Cache<T>,
    private loader: (key: string) => Promise<T | null>,
    private options: { ttl: number }
  ) {}

  async get(key: string): Promise<T | null> {
    let value = await this.cache.get(key);

    if (value === null) {
      value = await this.loader(key);

      if (value !== null) {
        await this.cache.set(key, value, this.options.ttl);
      }
    }

    return value;
  }

  async set(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.cache.set(key, value, ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    await this.cache.delete(key);
  }

  async clear(): Promise<void> {
    await this.cache.clear();
  }
}
```

### 最佳实践

1. **连接池大小**：根据并发需求和资源限制设置
2. **健康检查**：定期检查连接可用性
3. **缓存失效**：设置合理的 TTL，实现缓存更新策略
4. **监控指标**：跟踪连接使用率和缓存命中率

```typescript
// 推荐：带指标收集的连接池
class MonitoredPool<T extends PoolableConnection> {
  private metrics = {
    acquireCount: 0,
    acquireTime: 0,
    activeConnections: 0,
    waitQueueLength: 0
  };

  async acquire(): Promise<T> {
    const startTime = Date.now();
    this.metrics.acquireCount++;
    this.metrics.waitQueueLength++;

    try {
      const conn = await this.doAcquire();
      this.metrics.activeConnections++;
      return conn;
    } finally {
      this.metrics.acquireTime += Date.now() - startTime;
      this.metrics.waitQueueLength--;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      avgAcquireTime: this.metrics.acquireCount > 0
        ? this.metrics.acquireTime / this.metrics.acquireCount
        : 0
    };
  }
}
```

### 常见错误

```typescript
// 错误：不释放连接
const client = await pool.connect();
const result = await client.query('SELECT * FROM users');
// 忘记 client.release()

// 正确：使用 withClient 模式
await pool.withClient(async (client) => {
  const result = await client.query('SELECT * FROM users');
  return result.rows;
}); // 自动释放
```

```typescript
// 错误：缓存穿透（查询不存在的数据）
async function getUser(id: string) {
  let user = await cache.get(id);
  if (!user) {
    user = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    await cache.set(id, user);
  }
  return user;
}
// 如果 id 不存在，每次都会查数据库

// 正确：缓存空值
async function getUser(id: string) {
  const cached = await cache.get(id);
  if (cached !== undefined) {
    return cached; // 包括 null
  }

  const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  await cache.set(id, user, user ? 300 : 60); // 空值短 TTL
  return user;
}
```

---

## 总结

本文档介绍了 Node.js 中10种重要的设计模式，每种模式都包含：

| 模式 | 核心思想 | 适用场景 |
|------|----------|----------|
| 模块模式 | 代码组织和封装 | 大型应用架构 |
| 回调模式 | 异步处理 | Node.js 核心 API |
| Promise/async-await | 现代异步编程 | 所有异步操作 |
| 事件发射器 | 发布-订阅 | 实时通信、解耦 |
| 流 | 数据管道处理 | 大文件、实时数据 |
| 中间件 | 可组合的请求处理 | Web 框架 |
| 依赖注入 | 解耦和可测试性 | 业务逻辑层 |
| 工厂和容器 | 对象生命周期管理 | 复杂应用 |
| 观察者 | 状态变更通知 | 事件驱动系统 |
| 连接池和缓存 | 资源复用 | 数据库、外部服务 |

掌握这些模式可以帮助你构建更可维护、可扩展和高性能的 Node.js 应用程序。
