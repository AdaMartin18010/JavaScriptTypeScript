import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoProvider } from '../context';
import TodoItem from '../components/TodoItem';
import { Todo } from '../types';

function renderWithProvider(component: React.ReactNode) {
  return render(<TodoProvider>{component}</TodoProvider>);
}

describe('TodoItem', () => {
  const sampleTodo: Todo = { id: 1, text: '测试交互', completed: false };

  it('显示 Todo 文本', () => {
    renderWithProvider(<TodoItem todo={sampleTodo} />);
    expect(screen.getByText('测试交互')).toBeInTheDocument();
  });

  it('复选框初始状态反映 completed', () => {
    renderWithProvider(<TodoItem todo={sampleTodo} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('点击删除按钮不抛出错误', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TodoItem todo={sampleTodo} />);
    const deleteBtn = screen.getByRole('button', { name: '删除' });
    await user.click(deleteBtn);
    expect(deleteBtn).toBeInTheDocument();
  });
});
