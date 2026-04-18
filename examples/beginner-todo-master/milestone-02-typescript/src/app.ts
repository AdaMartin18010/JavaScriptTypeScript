/**
 * app.ts — 应用入口模块（TypeScript 版本）
 *
 * 与里程碑 1 相比：
 * - DOM 元素使用精确类型断言（as HTMLInputElement）
 * - 状态变量显式标注 Todo[] 类型
 * - 事件处理函数参数类型化
 */

import { loadTodos, saveTodos, Todo } from './storage';
import { renderTodoList, updateStats } from './dom-utils';

// ===== DOM 元素引用 =====
// 使用类型断言告诉 TS 这些元素的具体类型，否则 getElementById 返回 HTMLElement | null
const form = document.getElementById('todo-form') as HTMLFormElement;
const input = document.getElementById('todo-input') as HTMLInputElement;
const list = document.getElementById('todo-list') as HTMLUListElement;
const countEl = document.getElementById('todo-count') as HTMLElement;
const clearBtn = document.getElementById('clear-completed') as HTMLButtonElement;

// ===== 状态 =====
// 显式标注类型，增强可读性和类型安全
let todos: Todo[] = loadTodos();

// ===== 初始化渲染 =====
renderTodoList(todos, list);
updateStats(todos, countEl, clearBtn);

// ===== 事件处理 =====

/**
 * 添加新 Todo
 */
form.addEventListener('submit', (event: SubmitEvent) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  const newTodo: Todo = {
    id: Date.now(),
    text,
    completed: false,
  };

  todos = [...todos, newTodo];

  saveTodos(todos);
  renderTodoList(todos, list);
  updateStats(todos, countEl, clearBtn);

  input.value = '';
  input.focus();
});

/**
 * 列表点击事件委托
 */
list.addEventListener('click', (event: MouseEvent) => {
  const target = event.target as HTMLElement;

  // 点击删除按钮
  if (target.matches('.delete-btn')) {
    const li = target.closest('.todo-item') as HTMLLIElement;
    const id = Number(li.dataset.id);

    todos = todos.filter((todo) => todo.id !== id);

    saveTodos(todos);
    renderTodoList(todos, list);
    updateStats(todos, countEl, clearBtn);
    return;
  }

  // 点击复选框
  if (target.matches('.toggle')) {
    const checkbox = target as HTMLInputElement;
    const li = target.closest('.todo-item') as HTMLLIElement;
    const id = Number(li.dataset.id);

    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: checkbox.checked } : todo
    );

    saveTodos(todos);
    li.classList.toggle('completed', checkbox.checked);
    updateStats(todos, countEl, clearBtn);
    return;
  }
});

/**
 * 清除所有已完成 Todo
 */
clearBtn.addEventListener('click', () => {
  todos = todos.filter((todo) => !todo.completed);

  saveTodos(todos);
  renderTodoList(todos, list);
  updateStats(todos, countEl, clearBtn);
});

// Esc 清空输入框
input.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    input.value = '';
  }
});
