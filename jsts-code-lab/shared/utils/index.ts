/**
 * @file 共享工具函数
 * @description 项目通用的实用函数
 */

// ============================================================================
// 类型断言与转换
// ============================================================================

/**
 * 类型断言 - 确保值不为null/undefined
 * @throws {Error} 当值为null/undefined时
 */
export function assertDefined<T>(value: T | null | undefined, message?: string): T {
  if (value === null || value === undefined) {
    throw new Error(message ?? 'Value is null or undefined');
  }
  return value;
}

/**
 * 安全类型转换
 */
export function unsafeCast<T>(value: unknown): T {
  return value as T;
}

// ============================================================================
// 数组工具
// ============================================================================

/**
 * 数组分块
 * @example chunk([1,2,3,4,5], 2) // [[1,2], [3,4], [5]]
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) return [array];
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * 数组去重 (保持顺序)
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * 按key去重对象数组
 */
export function uniqueBy<T, K extends keyof T>(array: T[], key: K): T[] {
  const seen = new Set<T[K]>();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * 分组
 * @example groupBy([1,2,3,4,5], x => x % 2) // { 0: [2,4], 1: [1,3,5] }
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] ??= [];
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

// ============================================================================
// 对象工具
// ============================================================================

/**
 * 深拷贝 (简单实现)
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(deepClone) as unknown as T;
  
  const cloned = {} as T;
  for (const key of Object.keys(obj)) {
    cloned[key as keyof T] = deepClone(obj[key as keyof T]);
  }
  return cloned;
}

/**
 * 对象pick
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

/**
 * 对象omit
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const keySet = new Set(keys);
  const result = {} as Omit<T, K>;
  for (const key of Object.keys(obj) as K[]) {
    if (!keySet.has(key)) {
      (result as unknown as Record<K, T[K]>)[key] = obj[key];
    }
  }
  return result;
}

// ============================================================================
// 函数工具
// ============================================================================

/**
 * 函数柯里化
 */
export function curry<T extends AnyFunction>(fn: T): Curried<T> {
  return function curried(...args: any[]) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return (...nextArgs: any[]) => curried(...args, ...nextArgs);
  } as Curried<T>;
}

type Curried<T extends AnyFunction> = T extends (...args: infer A) => infer R
  ? A extends [infer F, ...infer Rest]
    ? (arg: F) => Rest extends [] ? R : Curried<(...args: Rest) => R>
    : () => R
  : never;

/**
 * 函数节流
 */
export function throttle<T extends AnyFunction>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn(...args);
    }
  };
}

/**
 * 函数防抖
 */
export function debounce<T extends AnyFunction>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * 函数记忆化
 */
export function memoize<T extends AnyFunction>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// ============================================================================
// 异步工具
// ============================================================================

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 带超时的Promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message = 'Operation timed out'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(message)), ms)
  );
  return Promise.race([promise, timeout]);
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  attempts: number,
  delayMs = 0
): Promise<T> {
  let lastError: Error;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e as Error;
      if (i < attempts - 1 && delayMs > 0) {
        await delay(delayMs);
      }
    }
  }
  throw lastError!;
}

// ============================================================================
// 类型声明补充
// ============================================================================

type AnyFunction = (...args: any[]) => any;

// ============================================================================
// 导出所有
// ============================================================================


