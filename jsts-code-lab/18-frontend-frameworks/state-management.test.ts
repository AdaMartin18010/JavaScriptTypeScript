import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  Store,
  loggerMiddleware,
  persistMiddleware,
  combineReducers,
  type Action,
} from './state-management.js';

describe('Store', () => {
  interface State {
    count: number;
  }

  const reducer = (state: State = { count: 0 }, action: Action): State => {
    if (action.type === 'INCREMENT') return { count: state.count + 1 };
    if (action.type === 'DECREMENT') return { count: state.count - 1 };
    return state;
  };

  it('should initialize with initial state', () => {
    const store = new Store(reducer, { count: 10 });
    expect(store.getState()).toEqual({ count: 10 });
  });

  it('should dispatch actions', () => {
    const store = new Store(reducer, { count: 0 });
    store.dispatch({ type: 'INCREMENT' });
    expect(store.getState().count).toBe(1);
  });

  it('should notify subscribers', () => {
    const store = new Store(reducer, { count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.dispatch({ type: 'INCREMENT' });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ count: 1 }, { count: 0 });
  });

  it('should allow unsubscribe', () => {
    const store = new Store(reducer, { count: 0 });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.dispatch({ type: 'INCREMENT' });

    expect(listener).not.toHaveBeenCalled();
  });

  it('should throw when dispatching during dispatch', () => {
    const badReducer = (state: State = { count: 0 }, action: Action): State => {
      if (action.type === 'BAD') {
        // This will cause a recursive dispatch
        (action as any).store.dispatch({ type: 'INCREMENT' });
      }
      return state;
    };

    const store = new Store(badReducer, { count: 0 });
    expect(() => (store.dispatch as any)({ type: 'BAD', store })).toThrow('Reducers may not dispatch actions.');
  });

  it('should support time-travel debugging', () => {
    const store = new Store(reducer, { count: 0 });
    store.dispatch({ type: 'INCREMENT' });
    store.dispatch({ type: 'INCREMENT' });
    store.dispatch({ type: 'INCREMENT' });

    expect(store.getState().count).toBe(3);
    store.undo();
    expect(store.getState().count).toBe(2);
    store.redo();
    expect(store.getState().count).toBe(3);
  });

  it('should jump to specific history point', () => {
    const store = new Store(reducer, { count: 0 });
    store.dispatch({ type: 'INCREMENT' });
    store.dispatch({ type: 'INCREMENT' });
    store.jumpTo(0);
    expect(store.getState().count).toBe(0);
  });

  it('should replace reducer', () => {
    const store = new Store(reducer, { count: 0 });
    const newReducer = (state: State = { count: 99 }, action: Action): State => state;
    store.replaceReducer(newReducer);
    // replaceReducer dispatches @@redux/INIT with the current state,
    // so the new reducer receives the existing state instead of undefined.
    expect(store.getState()).toEqual({ count: 0 });
  });

  it('should select derived state', () => {
    const store = new Store(reducer, { count: 5 });
    const doubled = store.select((state: State) => state.count * 2);
    expect(doubled).toBe(10);
  });

  it('should create memoized selectors', () => {
    const store = new Store(reducer, { count: 5 });
    const selector = store.createSelector(
      [(state: State) => state.count],
      (count: number) => count * 2
    );

    expect(selector(store.getState())).toBe(10);
    expect(selector(store.getState())).toBe(10);
  });
});

describe('loggerMiddleware', () => {
  it('should log actions', () => {
    const groupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const groupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

    const store = new Store((state = 0, action: Action) => state, 0);
    store.applyMiddleware(loggerMiddleware);
    store.dispatch({ type: 'TEST' });

    expect(groupSpy).toHaveBeenCalled();
    logSpy.mockRestore();
    groupSpy.mockRestore();
    groupEndSpy.mockRestore();
  });
});

describe('persistMiddleware', () => {
  it('should persist state to localStorage', () => {
    const storage: Record<string, string> = {};
    const localStorageMock = {
      setItem: vi.fn((k: string, v: string) => { storage[k] = v; }),
      getItem: vi.fn((k: string) => storage[k] || null),
      removeItem: vi.fn(),
    };
    vi.stubGlobal('localStorage', localStorageMock);

    const store = new Store((state = { value: 1 }, action: Action) => state, { value: 1 });
    store.applyMiddleware(persistMiddleware('my-app'));
    store.dispatch({ type: 'TEST' });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('my-app', JSON.stringify({ value: 1 }));
    vi.unstubAllGlobals();
  });
});

describe('combineReducers', () => {
  it('should combine reducers', () => {
    interface State {
      a: number;
      b: string;
      [key: string]: unknown;
    }

    const reducer = (combineReducers as any)({
      a: (state = 0, action: Action) => action.type === 'INC_A' ? state + 1 : state,
      b: (state = 'hello', action: Action) => action.type === 'SET_B' ? 'world' : state,
    });

    const state = reducer({ a: 0, b: 'hello' }, { type: '@@INIT' });
    expect(state).toEqual({ a: 0, b: 'hello' });

    const nextState = reducer(state, { type: 'INC_A' });
    expect(nextState).toEqual({ a: 1, b: 'hello' });
  });
});
