/**
 * @file Array.fromAsync (ES2026 Preview)
 * @category ECMAScript Evolution → ES2026 Preview
 * @difficulty easy
 * @tags array, async, iterator, es2026
 * @description
 * 演示 ES2026 已确认 Stage 4 的 Array.fromAsync 方法：
 * 将异步可迭代对象（AsyncIterable）或返回 Promise 的映射函数收集为数组。
 * 它是 Array.from 的异步版本。
 */

/** 基础：从异步生成器收集 */
export async function basicFromAsyncDemo(): Promise<number[]> {
  async function* asyncGen() {
    yield 1;
    yield 2;
    yield 3;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arr = await (Array as any).fromAsync(asyncGen());
  return arr as number[];
}

/** 带映射函数的异步转换 */
export async function mappingFromAsyncDemo(): Promise<string[]> {
  const source = ['a', 'b', 'c'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arr = await (Array as any).fromAsync(source, async (x: string) => {
    await new Promise((resolve) => setTimeout(resolve, 5));
    return x.toUpperCase();
  });
  return arr as string[];
}

/** 从异步迭代器收集 */
export async function asyncIteratorDemo(): Promise<number[]> {
  const asyncIterable = {
    async *[Symbol.asyncIterator]() {
      yield 10;
      yield 20;
      yield 30;
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arr = await (Array as any).fromAsync(asyncIterable);
  return arr as number[];
}

/** 与 Promise.all + Array.from 的对比 */
export async function comparisonDemo(): Promise<{
  fromAsync: number[];
  promiseAll: number[];
}> {
  const source = [1, 2, 3];
  const mapper = async (x: number) => x * 2;

  // Array.fromAsync 方式（更简洁）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fromAsync = (await (Array as any).fromAsync(source, mapper)) as number[];

  // 传统 Promise.all + Array.from 方式
  const promiseAll = await Promise.all(source.map(mapper));

  return { fromAsync, promiseAll };
}
