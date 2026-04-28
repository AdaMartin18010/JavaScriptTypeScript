/**
 * dom-utils.ts — DOM 操作工具模块（TypeScript 版本）
 *
 * 与里程碑 1 相比：
 * - 导入 Todo 接口
 * - 函数参数和返回值添加精确 DOM 类型
 * - 利用类型推断减少冗余注解
 */

import { Todo } from './storage';

/**
 * 转义 HTML 特殊字符，防止 XSS 攻击
 * @param text - 用户输入的原始文本
 * @returns 转义后的安全文本
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 创建单个 Todo 元素的 DOM 节点
 * @param todo - Todo 对象
 * @returns li 元素
 */
export function createTodoElement(todo: Todo): HTMLLIElement {
  const li = document.createElement('li');
  li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
  li.dataset.id = String(todo.id);

  li.innerHTML = `
    <input type="checkbox" class="toggle" ${todo.completed ? 'checked' : ''} aria-label="标记完成">
    <span class="todo-text">${escapeHtml(todo.text)}</span>
    <button class="delete-btn" aria-label="删除">删除</button>
  `;

  return li;
}

/**
 * 渲染整个 Todo 列表
 * @param todos - Todo 数组
 * @param listEl - 列表容器元素
 */
export function renderTodoList(todos: Todo[], listEl: HTMLUListElement): void {
  listEl.innerHTML = '';

  if (todos.length === 0) {
    listEl.innerHTML = '<li class="empty-state">暂无待办事项，添加一个吧！✨</li>';
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const todo of todos) {
    fragment.appendChild(createTodoElement(todo));
  }
  listEl.appendChild(fragment);
}

/**
 * 更新底部统计信息
 * @param todos - Todo 数组
 * @param countEl - 计数元素
 * @param clearBtn - 清除按钮
 */
export function updateStats(
  todos: Todo[],
  countEl: HTMLElement,
  clearBtn: HTMLButtonElement
): void {
  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.length - activeCount;

  countEl.textContent = `${activeCount} 个待办 / 共 ${todos.length} 项`;
  clearBtn.hidden = completedCount === 0;
}
