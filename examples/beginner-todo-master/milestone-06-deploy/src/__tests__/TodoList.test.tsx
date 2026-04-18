import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoProvider } from '../context';
import TodoList from '../components/TodoList';
import { Todo } from '../types';

function renderWithProvider(component: React.ReactNode) {
  return render(<TodoProvider>{component}</TodoProvider>);
}

describe('TodoList', () => {
  it('空列表时显示空状态提示', () => {
    render(<TodoList todos={[]} />);
    expect(screen.getByText('暂无待办事项，添加一个吧！✨')).toBeInTheDocument();
  });

  it('渲染多个 Todo 项', () => {
    const todos: Todo[] = [
      { id: 1, text: '学习 React', completed: false },
      { id: 2, text: '学习 TypeScript', completed: true },
    ];
    renderWithProvider(<TodoList todos={todos} />);
    expect(screen.getByText('学习 React')).toBeInTheDocument();
    expect(screen.getByText('学习 TypeScript')).toBeInTheDocument();
  });
});
