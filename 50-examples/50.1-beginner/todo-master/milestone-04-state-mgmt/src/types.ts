/**
 * types.ts — 共享类型定义
 */

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

/** 筛选条件 */
export type FilterType = 'all' | 'active' | 'completed';
