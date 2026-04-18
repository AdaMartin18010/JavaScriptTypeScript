/**
 * TodoItem.tsx — 单个 Todo 项组件
 *
 * 职责：展示单个 Todo 的内容和操作按钮
 * 使用 React.memo 优化：如果 props 没变，跳过重新渲染
 */

import { memo } from 'react';
import { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}

function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        className="toggle"
        checked={todo.completed}
        onChange={onToggle}
        aria-label="标记完成"
      />
      <span className="todo-text">{todo.text}</span>
      <button className="delete-btn" onClick={onDelete} aria-label="删除">
        删除
      </button>
    </li>
  );
}

// 包裹 memo，避免父组件重新渲染时无意义的子组件更新
export default memo(TodoItem);
