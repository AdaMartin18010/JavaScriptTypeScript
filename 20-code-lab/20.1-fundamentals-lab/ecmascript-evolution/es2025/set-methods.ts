/**
 * @file Set Mathematical Methods (ES2025)
 * @category ECMAScript Evolution → ES2025
 * @difficulty medium
 * @tags set, data-structures, es2025
 * @description
 * 演示 ES2025 为 Set.prototype 新增的 7 个数学方法：
 * union, intersection, difference, symmetricDifference,
 * isSubsetOf, isSupersetOf, isDisjointFrom。
 * 所有方法均接受任意可迭代对象作为参数。
 */

// ES2025 类型补丁：Set 数学方法尚未进入所有 TypeScript lib 定义
declare global {
  interface Set<T> {
    union<U>(other: Set<U> | ReadonlySetLike<U>): Set<T | U>;
    intersection<U>(other: Set<U> | ReadonlySetLike<U>): Set<T & U>;
    difference<U>(other: Set<U> | ReadonlySetLike<U>): Set<T>;
    symmetricDifference<U>(other: Set<U> | ReadonlySetLike<U>): Set<T | U>;
    isSubsetOf(other: Set<unknown> | ReadonlySetLike<unknown>): boolean;
    isSupersetOf(other: Set<unknown> | ReadonlySetLike<unknown>): boolean;
    isDisjointFrom(other: Set<unknown> | ReadonlySetLike<unknown>): boolean;
  }
}

interface ReadonlySetLike<T> {
  has(value: T): boolean;
  readonly size: number;
  keys(): IteratorObject<T>;
}

/** 基础集合运算演示 */
export function basicSetOperationsDemo(): {
  union: Set<string>;
  intersection: Set<string>;
  difference: Set<string>;
  symmetricDifference: Set<string>;
} {
  const frontend = new Set(['React', 'Vue', 'Angular']);
  const fullstack = new Set(['React', 'Vue', 'Node.js']);

  return {
    union: frontend.union(fullstack),
    intersection: frontend.intersection(fullstack),
    difference: frontend.difference(fullstack),
    symmetricDifference: frontend.symmetricDifference(fullstack),
  };
}

/** 子集关系判定演示 */
export function subsetRelationDemo(): {
  isSubset: boolean;
  isSuperset: boolean;
  isDisjoint: boolean;
} {
  const small = new Set([1, 2]);
  const large = new Set([1, 2, 3, 4]);
  const other = new Set([5, 6]);

  return {
    isSubset: small.isSubsetOf(large),
    isSuperset: large.isSupersetOf(small),
    isDisjoint: large.isDisjointFrom(other),
  };
}

/** 实际应用场景：权限系统交集 */
export function permissionIntersectionDemo(): Set<string> {
  const userRoles = new Set(['read', 'write']);
  const requiredRoles = new Set(['read', 'write', 'admin']);

  // 检查用户是否拥有所有必需权限
  const hasAll = userRoles.isSupersetOf(requiredRoles);
  const hasAny = !userRoles.isDisjointFrom(requiredRoles);

  // 获取缺失的权限
  const missing = requiredRoles.difference(userRoles);

  // 返回交集表示当前有效权限
  return hasAll ? userRoles.intersection(requiredRoles) : missing;
}

/** 支持任意可迭代对象 */
export function iterableArgumentDemo(): boolean {
  const set = new Set([1, 2, 3]);

  // 传入数组（需包装为 Set，因为当前 TS lib 中参数类型为 Set | ReadonlySetLike）
  const isSupersetOfArray = set.isSupersetOf(new Set([1, 2]));
  // 传入 Map.keys()
  const map = new Map([
    [1, 'a'],
    [2, 'b'],
  ]);
  const intersectionWithMapKeys = set.intersection(new Set(map.keys()));

  return isSupersetOfArray && intersectionWithMapKeys.size === 2;
}

/** 数据分析场景：标签去重与对比 */
export function tagAnalysisDemo(): {
  allTags: Set<string>;
  commonTags: Set<string>;
  uniqueTagsA: Set<string>;
} {
  const articleA = new Set(['javascript', 'typescript', 'es2025']);
  const articleB = new Set(['typescript', 'react', 'es2025']);

  return {
    allTags: articleA.union(articleB),
    commonTags: articleA.intersection(articleB),
    uniqueTagsA: articleA.difference(articleB),
  };
}
