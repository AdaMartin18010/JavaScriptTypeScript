/**
 * app.js — 应用入口模块
 * 
 * 负责：
 * 1. 初始化状态和 DOM 引用
 * 2. 绑定事件（表单提交、列表点击委托）
 * 3. 协调 storage 和 dom-utils 完成增删改查
 */

import { loadTodos, saveTodos } from './storage.js';
import { renderTodoList, updateStats } from './dom-utils.js';

// ===== DOM 元素引用 =====
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const countEl = document.getElementById('todo-count');
const clearBtn = document.getElementById('clear-completed');

// ===== 状态 =====
// 应用运行时的内存状态，所有修改先改这里，再同步到 localStorage
let todos = loadTodos();

// ===== 初始化渲染 =====
renderTodoList(todos, list);
updateStats(todos, countEl, clearBtn);

// ===== 事件处理 =====

/**
 * 添加新 Todo
 */
form.addEventListener('submit', (event) => {
  // 阻止表单默认刷新行为
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  const newTodo = {
    id: Date.now(), // 用时间戳生成唯一 ID（简单场景足够）
    text,
    completed: false,
  };

  // 不可变更新：创建新数组，而非 push 到原数组
  todos = [...todos, newTodo];

  saveTodos(todos);
  renderTodoList(todos, list);
  updateStats(todos, countEl, clearBtn);

  // 重置输入框
  input.value = '';
  input.focus();
});

/**
 * 列表点击事件委托
 * 一个监听器处理：标记完成、删除
 */
list.addEventListener('click', (event) => {
  const target = event.target;

  // 点击删除按钮
  if (target.matches('.delete-btn')) {
    const li = target.closest('.todo-item');
    const id = Number(li.dataset.id);

    todos = todos.filter(todo => todo.id !== id);

    saveTodos(todos);
    renderTodoList(todos, list);
    updateStats(todos, countEl, clearBtn);
    return;
  }

  // 点击复选框（标记完成/未完成）
  if (target.matches('.toggle')) {
    const li = target.closest('.todo-item');
    const id = Number(li.dataset.id);

    // 不可变更新：map 返回新数组
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: target.checked } : todo
    );

    saveTodos(todos);
    // 仅更新对应项的样式，而非全量重渲染（性能优化示例）
    li.classList.toggle('completed', target.checked);
    updateStats(todos, countEl, clearBtn);
    return;
  }
});

/**
 * 清除所有已完成 Todo
 */
clearBtn.addEventListener('click', () => {
  todos = todos.filter(todo => !todo.completed);

  saveTodos(todos);
  renderTodoList(todos, list);
  updateStats(todos, countEl, clearBtn);
});

// ===== 键盘快捷键 =====
// Esc 清空输入框
input.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    input.value = '';
  }
});
