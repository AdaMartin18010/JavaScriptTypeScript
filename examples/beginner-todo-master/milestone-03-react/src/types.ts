/**
 * types.ts — 共享类型定义
 *
 * 将类型集中管理，方便各组件导入使用。
 * 在更大项目中，可以使用命名空间或模块来组织类型。
 */

/**
 * Todo 项的数据结构
 */
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}
