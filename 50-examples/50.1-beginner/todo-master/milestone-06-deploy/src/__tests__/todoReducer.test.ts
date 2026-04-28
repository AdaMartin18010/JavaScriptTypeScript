import { describe, it, expect } from 'vitest';
import { todoReducer, initialState, selectFilteredTodos, State } from '../reducer';

describe('todoReducer', () => {
  describe('ADD_TODO', () => {
    it('应该添加新的 Todo 到列表末尾', () => {
      const state = todoReducer(initialState, {
        type: 'ADD_TODO',
        payload: '学习 TypeScript',
      });
      expect(state.todos).toHaveLength(1);
      expect(state.todos[0].text).toBe('学习 TypeScript');
      expect(state.todos[0].completed).toBe(false);
      expect(state.todos[0].id).toBeTypeOf('number');
    });

    it('不应该修改原始状态（不可变更新）', () => {
      const original = initialState.todos;
      const state = todoReducer(initialState, {
        type: 'ADD_TODO',
        payload: '测试不可变性',
      });
      expect(state.todos).not.toBe(original);
      expect(initialState.todos).toHaveLength(0);
    });
  });

  describe('TOGGLE_TODO', () => {
    it('应该切换指定 Todo 的完成状态', () => {
      const startState: State = {
        todos: [{ id: 1, text: '已有事项', completed: false }],
        filter: 'all',
      };
      const state = todoReducer(startState, {
        type: 'TOGGLE_TODO',
        payload: 1,
      });
      expect(state.todos[0].completed).toBe(true);
    });
  });

  describe('DELETE_TODO', () => {
    it('应该删除指定 ID 的 Todo', () => {
      const startState: State = {
        todos: [
          { id: 1, text: '第一项', completed: false },
          { id: 2, text: '第二项', completed: false },
        ],
        filter: 'all',
      };
      const state = todoReducer(startState, {
        type: 'DELETE_TODO',
        payload: 1,
      });
      expect(state.todos).toHaveLength(1);
      expect(state.todos[0].id).toBe(2);
    });
  });

  describe('CLEAR_COMPLETED', () => {
    it('应该清除所有已完成的 Todo', () => {
      const startState: State = {
        todos: [
          { id: 1, text: '未完成', completed: false },
          { id: 2, text: '已完成', completed: true },
        ],
        filter: 'all',
      };
      const state = todoReducer(startState, { type: 'CLEAR_COMPLETED' });
      expect(state.todos).toHaveLength(1);
      expect(state.todos[0].text).toBe('未完成');
    });
  });

  describe('SET_FILTER', () => {
    it('应该更新筛选条件', () => {
      const state = todoReducer(initialState, {
        type: 'SET_FILTER',
        payload: 'completed',
      });
      expect(state.filter).toBe('completed');
    });
  });
});

describe('selectFilteredTodos', () => {
  const todos = [
    { id: 1, text: '进行中 A', completed: false },
    { id: 2, text: '已完成 B', completed: true },
    { id: 3, text: '进行中 C', completed: false },
  ];

  it('all 返回全部', () => {
    const result = selectFilteredTodos({ todos, filter: 'all' });
    expect(result).toHaveLength(3);
  });

  it('active 只返回未完成的', () => {
    const result = selectFilteredTodos({ todos, filter: 'active' });
    expect(result).toHaveLength(2);
    expect(result.every((t) => !t.completed)).toBe(true);
  });

  it('completed 只返回已完成的', () => {
    const result = selectFilteredTodos({ todos, filter: 'completed' });
    expect(result).toHaveLength(1);
    expect(result[0].completed).toBe(true);
  });
});
