import { memo } from 'react';
import { Todo } from '../types';
import { useTodo } from '../context';

interface TodoItemProps {
  todo: Todo;
}

function TodoItem({ todo }: TodoItemProps) {
  const { dispatch } = useTodo();

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        className="toggle"
        checked={todo.completed}
        onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
        aria-label="标记完成"
      />
      <span className="todo-text">{todo.text}</span>
      <button
        className="delete-btn"
        onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}
        aria-label="删除"
      >
        删除
      </button>
    </li>
  );
}

export default memo(TodoItem);
