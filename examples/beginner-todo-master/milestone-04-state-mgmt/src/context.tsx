/**
 * context.tsx — 全局状态上下文
 *
 * 使用 Context API 将 state 和 dispatch 注入组件树，
 * 避免 Prop Drilling（层层传递 props）。
 */

import { createContext, useContext, useReducer, useEffect, useMemo, ReactNode } from 'react';
import { State, Action, todoReducer, initialState } from './reducer';

const STORAGE_KEY = 'todo-master:m4';

/** Context 值的类型 */
interface TodoContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
}

/** 创建 Context（默认值设为 undefined，通过 Provider 注入） */
const TodoContext = createContext<TodoContextValue | undefined>(undefined);

/** 从 localStorage 加载初始状态 */
function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      return { ...initialState, ...parsed };
    }
  } catch {
    // 忽略解析错误
  }
  return initialState;
}

/** Provider 组件：包裹应用，提供全局状态 */
export function TodoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, undefined, loadState);

  // 中间件：状态变化时自动持久化到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // 使用 useMemo 缓存 value，避免不必要的重渲染
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

/** 自定义 Hook：方便子组件消费 Context */
export function useTodo(): TodoContextValue {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo 必须在 TodoProvider 内部使用');
  }
  return context;
}
