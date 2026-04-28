import { createContext, useContext, useReducer, useEffect, useMemo, ReactNode } from 'react';
import { State, Action, todoReducer, initialState } from './reducer';

const STORAGE_KEY = 'todo-master:m5';

interface TodoContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      return { ...initialState, ...parsed };
    }
  } catch {
    // ignore
  }
  return initialState;
}

export function TodoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, undefined, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodo(): TodoContextValue {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo 必须在 TodoProvider 内部使用');
  }
  return context;
}
