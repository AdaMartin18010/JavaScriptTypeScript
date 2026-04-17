/**
 * @file Explicit Resource Management (ES2026 Preview)
 * @category ECMAScript Evolution → ES2026 Preview
 * @difficulty medium
 * @tags resource-management, raii, dispose, es2026
 * @description
 * 演示 ES2026 已确认 Stage 4 的 Explicit Resource Management：
 * using / await using 声明、Symbol.dispose / Symbol.asyncDispose、DisposableStack。
 * 为 JavaScript 提供类似 C++ RAII 的确定性资源释放能力。
 */

// 类型补丁
const SymDispose =
  (Symbol as unknown as { dispose?: symbol }).dispose ?? Symbol.for('Symbol.dispose');
const SymAsyncDispose =
  (Symbol as unknown as { asyncDispose?: symbol }).asyncDispose ??
  Symbol.for('Symbol.asyncDispose');

/** 基础同步资源管理 */
export function basicUsingDemo(): { logs: string[]; result: number } {
  const logs: string[] = [];

  class Resource {
    constructor(private name: string) {
      logs.push(`${this.name} acquired`);
    }
    [SymDispose](): void {
      logs.push(`${this.name} disposed`);
    }
  }

  // 注意：using 语法需要宿主编译器支持（如 TypeScript 5.2+ 的 --target es2022）
  // 此处用 IIFE 模拟语义
  let result = 0;
  (() => {
    const res = new Resource('file-handle');
    try {
      result = 42;
    } finally {
      res[SymDispose]();
    }
  })();

  return { logs, result };
}

/** 多个资源管理（后进先出释放） */
export function multipleResourcesDemo(): string[] {
  const logs: string[] = [];

  function createResource(name: string) {
    logs.push(`open ${name}`);
    return {
      [SymDispose]() {
        logs.push(`close ${name}`);
      },
    };
  }

  (() => {
    const r1 = createResource('A');
    const r2 = createResource('B');
    try {
      logs.push('use A and B');
    } finally {
      r2[SymDispose]();
      r1[SymDispose]();
    }
  })();

  return logs;
}

/** 异步资源管理 */
export async function asyncResourceDemo(): Promise<string[]> {
  const logs: string[] = [];

  function createAsyncResource(name: string) {
    logs.push(`async open ${name}`);
    return {
      async [SymAsyncDispose]() {
        await new Promise((resolve) => setTimeout(resolve, 10));
        logs.push(`async close ${name}`);
      },
    };
  }

  const res = createAsyncResource('db-connection');
  try {
    logs.push('query db');
  } finally {
    await res[SymAsyncDispose]();
  }

  return logs;
}

/** DisposableStack 手动管理 */
export function disposableStackDemo(): string[] {
  const logs: string[] = [];

  // 由于 DisposableStack 本身也是 Stage 3/4 特性，用对象模拟其行为
  const stack: (() => void)[] = [];

  function defer(dispose: () => void) {
    stack.push(dispose);
  }

  function adopt<T>(value: T, onDispose: (value: T) => void) {
    stack.push(() => { onDispose(value); });
    return value;
  }

  (() => {
    defer(() => logs.push('dispose first'));
    const handle = adopt('file', (v) => logs.push(`dispose ${v}`));
    logs.push(`using ${handle}`);

    // 逆序释放
    while (stack.length) {
      stack.pop()!();
    }
  })();

  return logs;
}

/** defer 模式：函数开头声明清理逻辑 */
export function deferPatternDemo(): string[] {
  const logs: string[] = [];

  function processFile(filename: string): string[] {
    const localLogs: string[] = [];
    const tempFiles: string[] = [];

    // defer 语义：注册清理回调
    const cleanups: (() => void)[] = [];
    cleanups.push(() => {
      tempFiles.forEach((f) => localLogs.push(`cleanup ${f}`));
    });

    try {
      localLogs.push(`process ${filename}`);
      tempFiles.push(`${filename}.tmp`);
      localLogs.push('done');
    } finally {
      cleanups.forEach((cb) => { cb(); });
    }

    return localLogs;
  }

  return processFile('data.txt');
}
