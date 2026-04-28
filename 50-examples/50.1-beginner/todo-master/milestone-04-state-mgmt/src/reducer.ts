/**
 * reducer.ts — Todo 状态管理的纯函数
 *
 * Reducer 是 Redux 模式的核心：
 * - 接收当前状态和动作，返回新状态
 * - 必须是纯函数（无副作用、相同输入永远产生相同输出）
 * - 使用不可变更新（Immutable Update）
 */

import { Todo, FilterType } from './types';

/** 全局状态结构 */
export interface State {
  todos: Todo[];
  filter: FilterType;
}

/** 所有可能的 Action 类型（使用联合类型精确描述） */
export type Action =
  | { type: 'ADD_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: number }
  | { type: 'DELETE_TODO'; payload: number }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'SET_FILTER'; payload: FilterType };

/** 初始状态 */
export const initialState: State = {
  todos: [],
  filter: 'all',
};

/**
 * Todo Reducer 纯函数
 * @param state - 当前状态
 * @param action - 描述要做什么的动作对象
 * @returns 新状态
 */
export function todoReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TODO': {
      const newTodo: Todo = {
        id: Date.now(),
        text: action.payload,
        completed: false,
      };
      return {
        ...state,
        todos: [...state.todos, newTodo],
      };
    }

    case 'TOGGLE_TODO': {
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo
        ),
      };
    }

    case 'DELETE_TODO': {
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };
    }

    case 'CLEAR_COMPLETED': {
      return {
        ...state,
        todos: state.todos.filter((todo) => !todo.completed),
      };
    }

    case 'SET_FILTER': {
      return {
        ...state,
        filter: action.payload,
      };
    }

    default:
      // TypeScript 的穷尽检查：如果上面的 case 没有覆盖所有 Action 类型，会报错
      return state;
  }
}

/**
 * 根据筛选条件过滤 Todo 列表
 * 这是一个「选择器」（Selector），从状态中派生数据
 */
export function selectFilteredTodos(state: State): Todo[] {
  switch (state.filter) {
    case 'active':
      return state.todos.filter((t) => !t.completed);
    case 'completed':
      return state.todos.filter((t) => t.completed);
    case 'all':
    default:
      return state.todos;
  }
}
