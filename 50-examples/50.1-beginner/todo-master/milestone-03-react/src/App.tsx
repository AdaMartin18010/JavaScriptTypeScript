/**
 * App.tsx — 根组件
 *
 * 职责：
 * 1. 管理全局状态（todos）
 * 2. 提供操作状态的方法（add/toggle/delete/clear）
 * 3. 组合子组件，构建页面布局
 */

import { useState, useEffect } from 'react';
import { Todo } from './types';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

const STORAGE_KEY = 'todo-master:m3';

/** 从 localStorage 加载 */
function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Todo[]) : [];
  } catch {
    return [];
  }
}

/** 保存到 localStorage */
function saveTodos(todos: Todo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export default function App() {
  // useState 初始化时只执行一次，用函数形式避免每次渲染都读取 localStorage
  const [todos, setTodos] = useState<Todo[]>(loadTodos);

  // 副作用：todos 变化时自动持久化
  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
    };
    // 不可变更新：始终创建新数组
    setTodos((prev) => [...prev, newTodo]);
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.length - activeCount;

  return (
    <div className="container">
      <h1>📝 Todo Master</h1>
      <p className="subtitle">里程碑 3：React 组件化</p>

      <TodoForm onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />

      <footer className="stats">
        <span>{activeCount} 个待办 / 共 {todos.length} 项</span>
        {completedCount > 0 && (
          <button className="clear-btn" onClick={clearCompleted}>
            清除已完成
          </button>
        )}
      </footer>
    </div>
  );
}
