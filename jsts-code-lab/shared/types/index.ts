/**
 * @file 共享类型定义
 * @description 项目通用的类型工具与基础类型
 */

// ============================================================================
// 基础工具类型
// ============================================================================

/** 可空类型 */
export type Nullable<T> = T | null | undefined;

/** 非空类型 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/** 深度只读 */
export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

/** 深度部分 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/** 深度必需 */
export type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object ? DeepRequired<T[K]> : T[K];
};

// ============================================================================
// 集合类型
// ============================================================================

/** 键值对 */
export type KeyValue<K extends string | number = string, V = unknown> = Record<K, V>;

/** 构造函数 */
export type Constructor<T = {}> = new (...args: any[]) => T;

/** 抽象构造函数 */
export type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;

/** 函数类型 */
export type AnyFunction = (...args: any[]) => any;

/** 异步函数 */
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;

// ============================================================================
// 类型谓词
// ============================================================================

/** 是否为字符串 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/** 是否为数字 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/** 是否为函数 */
export function isFunction(value: unknown): value is AnyFunction {
  return typeof value === 'function';
}

/** 是否为对象 (非null) */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** 是否为数组 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/** 是否为Promise */
export function isPromise<T>(value: unknown): value is Promise<T> {
  return value instanceof Promise || (
    isObject(value) && 
    isFunction((value as Promise<T>).then)
  );
}

// ============================================================================
// 结果类型 (函数式编程)
// ============================================================================

/** 成功结果 */
export type Ok<T> = { ok: true; value: T; error?: never };

/** 失败结果 */
export type Err<E = Error> = { ok: false; value?: never; error: E };

/** 结果类型 (替代抛出异常) */
export type Result<T, E = Error> = Ok<T> | Err<E>;

/** 创建成功结果 */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

/** 创建失败结果 */
export function err<E = Error>(error: E): Err<E> {
  return { ok: false, error };
}

// ============================================================================
// 类型体操挑战等级标记
// ============================================================================

/** 难度等级 */
export type Difficulty = 'warm' | 'easy' | 'medium' | 'hard' | 'extreme';

/** 挑战元数据 */
export interface TypeChallenge<T, Expected, Diff extends Difficulty = 'easy'> {
  readonly _input: T;
  readonly _expected: Expected;
  readonly _difficulty: Diff;
}
