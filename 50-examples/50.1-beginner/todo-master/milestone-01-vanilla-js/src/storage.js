/**
 * storage.js — 数据持久化模块
 * 
 * 封装 localStorage 操作，将「存储细节」与「业务逻辑」解耦。
 * 未来如果要换成 IndexedDB 或后端 API，只需修改此文件。
 */

const STORAGE_KEY = 'todo-master:m1';

/**
 * 从 localStorage 加载 Todo 列表
 * @returns {Array<{id: number, text: string, completed: boolean}>} Todo 数组
 */
export function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // 如果为空，返回空数组；否则解析 JSON
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    // 防御性编程：如果 localStorage 数据损坏，不崩溃
    console.error('无法解析 localStorage 数据:', error);
    return [];
  }
}

/**
 * 保存 Todo 列表到 localStorage
 * @param {Array} todos - Todo 数组
 */
export function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    // 可能的错误：存储空间已满（QuotaExceededError）
    console.error('保存到 localStorage 失败:', error);
  }
}
