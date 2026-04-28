/**
 * dom-utils.js — DOM 操作工具模块
 * 
 * 将「如何渲染」与「何时渲染」分离，app.js 负责业务逻辑，
 * 此文件负责具体的 DOM 创建和更新。
 */

/**
 * 转义 HTML 特殊字符，防止 XSS 攻击
 * @param {string} text - 用户输入的原始文本
 * @returns {string} 转义后的安全文本
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 创建单个 Todo 元素的 DOM 节点
 * @param {{id: number, text: string, completed: boolean}} todo - Todo 对象
 * @returns {HTMLLIElement} li 元素
 */
export function createTodoElement(todo) {
  const li = document.createElement('li');
  // 使用 className 而不是 class（class 是 JS 保留字）
  li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
  // 用 data-* 属性存储 id，方便事件委托时定位
  li.dataset.id = String(todo.id);

  // 使用 innerHTML 构建结构，但文本经过 escapeHtml 处理
  li.innerHTML = `
    <input type="checkbox" class="toggle" ${todo.completed ? 'checked' : ''} aria-label="标记完成">
    <span class="todo-text">${escapeHtml(todo.text)}</span>
    <button class="delete-btn" aria-label="删除">删除</button>
  `;

  return li;
}

/**
 * 渲染整个 Todo 列表
 * @param {Array} todos - Todo 数组
 * @param {HTMLUListElement} listEl - 列表容器元素
 */
export function renderTodoList(todos, listEl) {
  // 清空现有内容
  listEl.innerHTML = '';

  if (todos.length === 0) {
    // 空状态提示
    listEl.innerHTML = '<li class="empty-state">暂无待办事项，添加一个吧！✨</li>';
    return;
  }

  // 使用 DocumentFragment 批量插入，减少重排（Reflow）
  const fragment = document.createDocumentFragment();
  for (const todo of todos) {
    fragment.appendChild(createTodoElement(todo));
  }
  listEl.appendChild(fragment);
}

/**
 * 更新底部统计信息
 * @param {Array} todos - Todo 数组
 * @param {HTMLElement} countEl - 计数元素
 * @param {HTMLButtonElement} clearBtn - 清除按钮
 */
export function updateStats(todos, countEl, clearBtn) {
  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.length - activeCount;

  countEl.textContent = `${activeCount} 个待办 / 共 ${todos.length} 项`;

  // 有已完成项时才显示清除按钮
  clearBtn.hidden = completedCount === 0;
}
