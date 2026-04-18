/**
 * storage.ts — 数据持久化模块（TypeScript 版本）
 *
 * 与里程碑 1 相比：
 * - 新增 Todo 接口，定义数据结构
 * - 函数添加参数类型和返回类型
 * - 错误处理更完善
 */

const STORAGE_KEY = 'todo-master:m2';

/**
 * Todo 项的数据结构
 * 使用接口（interface）描述对象的「形状」
 */
export interface Todo {
  /** 唯一标识符 */
  id: number;
  /** 待办文本内容 */
  text: string;
  /** 是否已完成 */
  completed: boolean;
}

/**
 * 从 localStorage 加载 Todo 列表
 * @returns Todo 数组
 */
export function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Todo[]) : [];
  } catch (error) {
    console.error('无法解析 localStorage 数据:', error);
    return [];
  }
}

/**
 * 保存 Todo 列表到 localStorage
 * @param todos - Todo 数组
 */
export function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('保存到 localStorage 失败:', error);
  }
}
