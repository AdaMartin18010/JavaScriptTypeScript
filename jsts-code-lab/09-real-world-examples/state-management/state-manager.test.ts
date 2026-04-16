import { describe, it, expect, vi } from 'vitest';
import {
  createStore,
  applyMiddleware,
  combineReducers,
  createSelector,
  loggerMiddleware,
  thunkMiddleware,
  todoReducer,
  TodoActions,
  selectFilteredTodos,
  selectStats,
} from './state-manager';

describe('createStore', () => {
  type State = { count: number };
  const reducer = (state: State | undefined, action: { type: string; payload?: number }) => {
    if (state === undefined) return { count: 0 };
    if (action.type === 'INCREMENT') return { count: state.count + 1 };
    if (action.type === 'ADD') return { count: state.count + (action.payload || 0) };
    return state;
  };

  it('should initialize state with reducer', () => {
    const store = createStore(reducer);
    expect(store.getState()).toEqual({ count: 0 });
  });

  it('should dispatch actions and update state', () => {
    const store = createStore(reducer);
    store.dispatch({ type: 'INCREMENT' });
    expect(store.getState().count).toBe(1);
  });

  it('should notify subscribers', () => {
    const store = createStore(reducer);
    const listener = vi.fn();
    store.subscribe(listener);
    store.dispatch({ type: 'INCREMENT' });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ count: 1 }, { count: 0 });
  });

  it('should allow unsubscribe', () => {
    const store = createStore(reducer);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.dispatch({ type: 'INCREMENT' });

    expect(listener).not.toHaveBeenCalled();
  });

  it('should replace reducer', () => {
    const store = createStore(reducer);
    const newReducer = (state: State | undefined) => ({ count: 99 });
    store.replaceReducer(newReducer as typeof reducer);
    expect(store.getState()).toEqual({ count: 99 });
  });
});

describe('applyMiddleware', () => {
  type State = { value: number };
  type Action = { type: string };

  const reducer = (state: State | undefined, action: Action): State => {
    if (state === undefined) return { value: 0 };
    return state;
  };

  it('should apply middleware to dispatch', () => {
    const testMiddleware = vi.fn((store) => (next) => (action) => {
      return next(action);
    });

    const store = createStore(reducer, applyMiddleware(testMiddleware));
    store.dispatch({ type: 'TEST' });

    expect(testMiddleware).toHaveBeenCalled();
  });
});

describe('combineReducers', () => {
  type State = { a: number; b: string };
  const reducerA = (state: number | undefined, action: { type: string }) =>
    state === undefined ? 0 : state;
  const reducerB = (state: string | undefined, action: { type: string }) =>
    state === undefined ? 'init' : state;

  it('should combine multiple reducers', () => {
    const combined = combineReducers<State>({ a: reducerA, b: reducerB });
    expect(combined(undefined, { type: '@@INIT' })).toEqual({ a: 0, b: 'init' });
  });

  it('should return same state if no changes', () => {
    const combined = combineReducers<State>({ a: reducerA, b: reducerB });
    const state = { a: 1, b: 'hello' };
    expect(combined(state, { type: 'NOOP' })).toBe(state);
  });
});

describe('createSelector', () => {
  it('should memoize selector results', () => {
    const inputSelector = vi.fn((state: { value: number }) => state.value);
    const combiner = vi.fn((value: number) => value * 2);

    const selector = createSelector([inputSelector], combiner);
    const state = { value: 5 };

    expect(selector(state)).toBe(10);
    expect(selector(state)).toBe(10);
    expect(combiner).toHaveBeenCalledTimes(1);
  });

  it('should recompute when inputs change', () => {
    const inputSelector = (state: { value: number }) => state.value;
    const combiner = vi.fn((value: number) => value * 2);

    const selector = createSelector([inputSelector], combiner);

    selector({ value: 5 });
    selector({ value: 10 });

    expect(combiner).toHaveBeenCalledTimes(2);
  });
});

describe('todoReducer', () => {
  it('should add a todo', () => {
    const state = todoReducer(undefined, TodoActions.addTodo('Learn Redux'));
    expect(state.todos.length).toBe(1);
    expect(state.todos[0].text).toBe('Learn Redux');
    expect(state.todos[0].completed).toBe(false);
  });

  it('should toggle a todo', () => {
    let state = todoReducer(undefined, TodoActions.addTodo('Learn Redux'));
    const id = state.todos[0].id;
    state = todoReducer(state, TodoActions.toggleTodo(id));
    expect(state.todos[0].completed).toBe(true);
  });

  it('should delete a todo', () => {
    let state = todoReducer(undefined, TodoActions.addTodo('Learn Redux'));
    const id = state.todos[0].id;
    state = todoReducer(state, TodoActions.deleteTodo(id));
    expect(state.todos.length).toBe(0);
  });

  it('should set filter', () => {
    let state = todoReducer(undefined, TodoActions.setFilter('completed'));
    expect(state.filter).toBe('completed');
  });
});

describe('selectors', () => {
  it('selectFilteredTodos should filter active todos', () => {
    const state = {
      todos: [
        { id: '1', text: 'A', completed: false },
        { id: '2', text: 'B', completed: true },
      ],
      filter: 'active' as const,
    };

    expect(selectFilteredTodos(state)).toHaveLength(1);
    expect(selectFilteredTodos(state)[0].text).toBe('A');
  });

  it('selectStats should calculate todo statistics', () => {
    const state = {
      todos: [
        { id: '1', text: 'A', completed: false },
        { id: '2', text: 'B', completed: true },
        { id: '3', text: 'C', completed: true },
      ],
      filter: 'all' as const,
    };

    expect(selectStats(state)).toEqual({ total: 3, completed: 2, active: 1 });
  });
});
