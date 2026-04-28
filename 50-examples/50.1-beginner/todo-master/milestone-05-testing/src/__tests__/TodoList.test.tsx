/**
 * TodoList.test.tsx — 组件渲染测试
 *
 * 测试组件是否正确渲染，以及空状态的处理。
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoProvider } from '../context';
import TodoList from '../components/TodoList';
import { Todo } from '../types';

// 辅助函数：渲染带 Provider 的组件
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
