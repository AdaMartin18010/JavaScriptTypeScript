/**
 * @file 状态管理器 (简化版 Redux)
 * @category Real World Examples → State Management
 * @difficulty hard
 * @tags state-management, redux, flux, store, reducer
 * 
 * @description
 * 实现一个简化版 Redux 状态管理器：
 * - Store 单一数据源
 * - Reducer 纯函数处理状态更新
 * - Action 描述状态变更
 * - Middleware 扩展机制
 * - 选择器优化
 */

// ============================================================================
// 1. 核心类型定义
// ============================================================================

export interface Action<T = unknown> {
  type: string;
  payload?: T;
}

export type Reducer<S> = (state: S | undefined, action: Action) => S;

export type Listener<S> = (state: S, prevState: S) => void;

export type Unsubscribe = () => void;

export interface Middleware<S> {
  (store: StoreAPI<S>): (next: Dispatch) => Dispatch;
}

export type Dispatch = (action: Action) => Action;

export interface StoreAPI<S> {
  getState: () => S;
  dispatch: Dispatch;
}

export interface Store<S> extends StoreAPI<S> {
  subscribe(listener: Listener<S>): Unsubscribe;
  replaceReducer(nextReducer: Reducer<S>): void;
}

// ============================================================================
// 2. Store 实现
// ============================================================================

export function createStore<S>(
  reducer: Reducer<S>,
  preloadedState?: S,
  enhancer?: (createStore: typeof createStore) => typeof createStore
): Store<S> {
  // 支持 enhancer
  if (enhancer) {
    return enhancer(createStore)(reducer, preloadedState);
  }

  let currentReducer = reducer;
  let currentState: S | undefined = preloadedState;
  let listeners: Listener<S>[] = [];
  let isDispatching = false;

  function getState(): S {
    if (isDispatching) {
      throw new Error('不能在 reducer 执行期间获取状态');
    }
    return currentState as S;
  }

  function subscribe(listener: Listener<S>): Unsubscribe {
    if (isDispatching) {
      throw new Error('不能在 reducer 执行期间订阅');
    }

    let isSubscribed = true;
    listeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) return;
      if (isDispatching) {
        throw new Error('不能在 reducer 执行期间取消订阅');
      }

      isSubscribed = false;
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }

  function dispatch(action: Action): Action {
    if (isDispatching) {
      throw new Error('不能在 reducer 中 dispatch');
    }

    try {
      isDispatching = true;
      const prevState = currentState;
      currentState = currentReducer(currentState, action);
      
      // 通知监听器
      listeners.forEach(listener => listener(currentState as S, prevState as S));
    } finally {
      isDispatching = false;
    }

    return action;
  }

  function replaceReducer(nextReducer: Reducer<S>): void {
    currentReducer = nextReducer;
    dispatch({ type: '@@redux/REPLACE' });
  }

  // 初始化 state
  dispatch({ type: '@@redux/INIT' });

  return {
    getState,
    dispatch,
    subscribe,
    replaceReducer
  };
}

// ============================================================================
// 3. Middleware 支持
// ============================================================================

export function applyMiddleware<S>(...middlewares: Middleware<S>[]) {
  return (createStore: typeof createStore) =>
    (reducer: Reducer<S>, preloadedState?: S): Store<S> => {
      const store = createStore(reducer, preloadedState);
      let dispatch: Dispatch = () => {
        throw new Error('Dispatching while constructing middleware is not allowed');
      };

      const middlewareAPI: StoreAPI<S> = {
        getState: store.getState,
        dispatch: (action: Action) => dispatch(action)
      };

      const chain = middlewares.map(middleware => middleware(middlewareAPI));
      dispatch = chain.reduceRight(
        (composed, middleware) => middleware(composed),
        store.dispatch
      );

      return {
        ...store,
        dispatch
      };
    };
}

// 日志中间件
export const loggerMiddleware = <S>(store: StoreAPI<S>) =>
  (next: Dispatch) =>
  (action: Action): Action => {
    console.log('[Redux] Dispatching:', action.type);
    console.log('[Redux] Prev State:', store.getState());
    const result = next(action);
    console.log('[Redux] Next State:', store.getState());
    return result;
  };

// 异步中间件 (thunk)
export interface ThunkAction<R, S> {
  (dispatch: Dispatch, getState: () => S): R;
}

export const thunkMiddleware = <S>(store: StoreAPI<S>) =>
  (next: Dispatch) =>
  (action: Action | ThunkAction<unknown, S>): unknown => {
    if (typeof action === 'function') {
      return action(store.dispatch, store.getState);
    }
    return next(action);
  };

// ============================================================================
// 4. 组合 Reducer
// ============================================================================

export type ReducersMapObject<S> = {
  [K in keyof S]: Reducer<S[K]>;
};

export function combineReducers<S>(reducers: ReducersMapObject<S>): Reducer<S> {
  return (state: S | undefined, action: Action): S => {
    const nextState = {} as S;
    let hasChanged = false;

    for (const key of Object.keys(reducers) as Array<keyof S>) {
      const reducer = reducers[key];
      const previousStateForKey = state?.[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    return hasChanged ? nextState : (state as S);
  };
}

// ============================================================================
// 5. 选择器 (Selector) 与记忆化
// ============================================================================

export type Selector<S, R> = (state: S) => R;

export function createSelector<S, R, C>(
  selectors: Array<(state: S) => unknown>,
  combiner: (...args: unknown[]) => C
): Selector<S, C> {
  let lastArgs: unknown[] | null = null;
  let lastResult: C;

  return (state: S): C => {
    const params = selectors.map(selector => selector(state));

    if (lastArgs && params.every((param, index) => param === lastArgs![index])) {
      return lastResult;
    }

    lastArgs = params;
    lastResult = combiner(...params);
    return lastResult;
  };
}

// ============================================================================
// 6. 实际应用示例 - Todo 应用
// ============================================================================

// State 定义
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
}

// Actions
export const TodoActions = {
  addTodo: (text: string): Action => ({
    type: 'ADD_TODO',
    payload: { id: Math.random().toString(36).substring(2, 9), text }
  }),

  toggleTodo: (id: string): Action => ({
    type: 'TOGGLE_TODO',
    payload: { id }
  }),

  deleteTodo: (id: string): Action => ({
    type: 'DELETE_TODO',
    payload: { id }
  }),

  setFilter: (filter: TodoState['filter']): Action => ({
    type: 'SET_FILTER',
    payload: { filter }
  })
};

// Reducer
const initialState: TodoState = {
  todos: [],
  filter: 'all'
};

export function todoReducer(state = initialState, action: Action): TodoState {
  switch (action.type) {
    case 'ADD_TODO':
      const { id, text } = action.payload as { id: string; text: string };
      return {
        ...state,
        todos: [...state.todos, { id, text, completed: false }]
      };

    case 'TOGGLE_TODO':
      const toggleId = (action.payload as { id: string }).id;
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === toggleId ? { ...todo, completed: !todo.completed } : todo
        )
      };

    case 'DELETE_TODO':
      const deleteId = (action.payload as { id: string }).id;
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== deleteId)
      };

    case 'SET_FILTER':
      return {
        ...state,
        filter: (action.payload as { filter: TodoState['filter'] }).filter
      };

    default:
      return state;
  }
}

// 选择器
const selectTodos = (state: TodoState) => state.todos;
const selectFilter = (state: TodoState) => state.filter;

export const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }
);

export const selectStats = createSelector(
  [selectTodos],
  (todos) => ({
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length
  })
);

// ============================================================================
// 7. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 状态管理器 (Redux) 演示 ===\n');

  // 创建带中间件的 store
  const store = createStore(
    todoReducer,
    applyMiddleware(loggerMiddleware, thunkMiddleware)
  );

  // 订阅状态变化
  const unsubscribe = store.subscribe((state, prevState) => {
    console.log('[Subscriber] 状态已更新');
    console.log('  任务数:', state.todos.length);
  });

  // Dispatch actions
  console.log('--- 添加任务 ---');
  store.dispatch(TodoActions.addTodo('学习 Redux'));
  store.dispatch(TodoActions.addTodo('学习 TypeScript'));

  console.log('\n--- 切换任务状态 ---');
  const state = store.getState();
  if (state.todos[0]) {
    store.dispatch(TodoActions.toggleTodo(state.todos[0].id));
  }

  console.log('\n--- 使用选择器 ---');
  console.log('过滤后任务:', selectFilteredTodos(store.getState()));
  console.log('统计:', selectStats(store.getState()));

  console.log('\n--- 设置过滤器 ---');
  store.dispatch(TodoActions.setFilter('completed'));
  console.log('过滤后任务 (completed):', selectFilteredTodos(store.getState()));

  unsubscribe();
}

// ============================================================================
// 导出
// ============================================================================

export {
  createStore,
  applyMiddleware,
  combineReducers,
  createSelector,
  loggerMiddleware,
  thunkMiddleware
};
